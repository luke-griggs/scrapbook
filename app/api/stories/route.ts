import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses, promptInvites, familyMembers, user } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's families
    const userFamilies = await db.query.familyMembers.findMany({
      where: eq(familyMembers.userId, session.user.id),
    });

    if (userFamilies.length === 0) {
      return NextResponse.json({ stories: [] });
    }

    const familyIds = userFamilies.map((fm) => fm.familyId);

    // Get all accepted prompt invites for user's families
    const invites = await db.query.promptInvites.findMany({
      where: inArray(promptInvites.familyId, familyIds),
      with: {
        responses: true,
      },
    });

    // Filter to only invites that have responses
    const invitesWithResponses = invites.filter(
      (invite) => invite.responses && invite.responses.length > 0
    );

    // Collect all unique user IDs from responses
    const userIds = [
      ...new Set(
        invitesWithResponses.flatMap((invite) =>
          invite.responses.map((response) => response.userId)
        )
      ),
    ];

    // Batch fetch all users in a single query
    const users =
      userIds.length > 0
        ? await db.query.user.findMany({
            where: inArray(user.id, userIds),
          })
        : [];

    // Create a map for O(1) user lookups
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build stories list with user info
    const stories = invitesWithResponses.flatMap((invite) =>
      invite.responses.map((response) => {
        const responseUser = userMap.get(response.userId);

        return {
          id: response.id,
          videoUrl: response.videoUrl,
          thumbnailUrl: response.thumbnailUrl,
          durationSeconds: response.durationSeconds,
          createdAt: response.createdAt,
          promptText: invite.promptText,
          senderName: invite.senderName,
          recorder: {
            id: responseUser?.id || response.userId,
            name: responseUser?.name || "Unknown",
            image: responseUser?.image || null,
          },
        };
      })
    );

    // Sort by most recent first
    stories.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
