import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promptInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
