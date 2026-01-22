import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { families, familyMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { nanoid } from "nanoid";

// Generate a unique 6-character invite code
function generateInviteCode(): string {
  return nanoid(6).toUpperCase();
}

// GET - Get user's family (if they have one)
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's family membership
    const membership = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.userId, session.user.id),
      with: {
        family: true,
      },
    });

    if (!membership) {
      return NextResponse.json({ family: null });
    }

    return NextResponse.json({
      family: {
        id: membership.family.id,
        name: membership.family.name,
        inviteCode: membership.family.inviteCode,
      },
      role: membership.role,
    });
  } catch (error) {
    console.error("Error fetching family:", error);
    return NextResponse.json(
      { error: "Failed to fetch family" },
      { status: 500 }
    );
  }
}

// POST - Create a new family
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Family name is required" },
        { status: 400 }
      );
    }

    // Check if user already belongs to a family
    const existingMembership = await db.query.familyMembers.findFirst({
      where: eq(familyMembers.userId, session.user.id),
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You already belong to a family" },
        { status: 400 }
      );
    }

    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure invite code is unique
    while (attempts < maxAttempts) {
      const existingFamily = await db.query.families.findFirst({
        where: eq(families.inviteCode, inviteCode),
      });
      if (!existingFamily) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique invite code" },
        { status: 500 }
      );
    }

    // Create the family
    const [newFamily] = await db
      .insert(families)
      .values({
        name: name.trim(),
        inviteCode,
      })
      .returning();

    // Add the creator as owner
    await db.insert(familyMembers).values({
      familyId: newFamily.id,
      userId: session.user.id,
      role: "owner",
    });

    return NextResponse.json({
      family: {
        id: newFamily.id,
        name: newFamily.name,
        inviteCode: newFamily.inviteCode,
      },
      role: "owner",
    });
  } catch (error) {
    console.error("Error creating family:", error);
    return NextResponse.json(
      { error: "Failed to create family" },
      { status: 500 }
    );
  }
}
