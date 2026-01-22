import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promptInvites, familyMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await db.query.promptInvites.findFirst({
      where: eq(promptInvites.token, token),
    });

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Invite not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { valid: false, error: "Invite has expired" },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (invite.status === "accepted") {
      return NextResponse.json(
        { valid: false, error: "Invite has already been used" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      invite: {
        id: invite.id,
        promptText: invite.promptText,
        senderName: invite.senderName,
        recipientEmail: invite.recipientEmail,
        status: invite.status,
      },
    });
  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate invite" },
      { status: 500 }
    );
  }
}

// Accept an invite - adds user to the family
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;

    const invite = await db.query.promptInvites.findFirst({
      where: eq(promptInvites.token, token),
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 410 }
      );
    }

    // If invite has a familyId, add user to family (if not already a member)
    if (invite.familyId) {
      const existingMembership = await db.query.familyMembers.findFirst({
        where: and(
          eq(familyMembers.familyId, invite.familyId),
          eq(familyMembers.userId, session.user.id)
        ),
      });

      if (!existingMembership) {
        await db.insert(familyMembers).values({
          familyId: invite.familyId,
          userId: session.user.id,
          role: "member",
        });
      }
    }

    // Update invite with recipientId (but don't mark as accepted yet - that happens when they record)
    await db
      .update(promptInvites)
      .set({
        recipientId: session.user.id,
      })
      .where(eq(promptInvites.id, invite.id));

    return NextResponse.json({
      success: true,
      inviteId: invite.id,
      familyId: invite.familyId,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
