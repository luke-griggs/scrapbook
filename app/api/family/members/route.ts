import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { familyMembers, families } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's family memberships
    const memberships = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, session.user.id),
      with: {
        family: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (memberships.length === 0) {
      return NextResponse.json({ family: null, members: [] });
    }

    // Get the first family (for now, users belong to one family)
    const family = memberships[0].family;
    const members = family.members
      // Exclude the current user - they shouldn't send to themselves
      .filter((m) => m.user != null && m.userId !== session.user.id)
      .map((m) => ({
        id: m.user!.id,
        name: m.user!.name,
        email: m.user!.email,
        avatarUrl: m.user!.image,
      }));

    return NextResponse.json({
      family: { id: family.id, name: family.name },
      members,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}
