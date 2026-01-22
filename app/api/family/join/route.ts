import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { families, familyMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

// POST - Join a family with an invite code
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json(
        { error: "Invite code is required" },
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

    // Find family by invite code (case-insensitive)
    const family = await db.query.families.findFirst({
      where: eq(families.inviteCode, inviteCode.toUpperCase()),
    });

    if (!family) {
      return NextResponse.json(
        { error: "Invalid invite code. Please check and try again." },
        { status: 404 }
      );
    }

    // Add user to the family as a member
    await db.insert(familyMembers).values({
      familyId: family.id,
      userId: session.user.id,
      role: "member",
    });

    return NextResponse.json({
      family: {
        id: family.id,
        name: family.name,
        inviteCode: family.inviteCode,
      },
      role: "member",
    });
  } catch (error) {
    console.error("Error joining family:", error);
    return NextResponse.json(
      { error: "Failed to join family" },
      { status: 500 }
    );
  }
}
