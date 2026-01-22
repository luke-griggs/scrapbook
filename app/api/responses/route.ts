import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { responses, promptInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { promptInviteId, videoUrl, thumbnailUrl, durationSeconds } = body;

    if (!promptInviteId || !videoUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify invite exists and is valid
    const invite = await db.query.promptInvites.findFirst({
      where: eq(promptInvites.id, promptInviteId),
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    if (invite.status === "accepted") {
      return NextResponse.json(
        { error: "Response already submitted" },
        { status: 400 }
      );
    }

    // Create response record
    const [response] = await db
      .insert(responses)
      .values({
        promptInviteId,
        userId: session.user.id,
        videoUrl,
        thumbnailUrl,
        durationSeconds: durationSeconds?.toString(),
      })
      .returning();

    // Update invite status to accepted
    await db
      .update(promptInvites)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        recipientId: session.user.id,
      })
      .where(eq(promptInvites.id, promptInviteId));

    return NextResponse.json({
      response: {
        id: response.id,
        videoUrl: response.videoUrl,
      },
    });
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    );
  }
}
