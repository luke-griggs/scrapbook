import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promptInvites } from "@/lib/db/schema";
import { getSession } from "@/lib/auth-server";
import { nanoid } from "nanoid";
import { sendInviteEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { promptText, recipientEmail, sendEmail } = body;

    if (!promptText || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = nanoid(32);

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite record
    const [invite] = await db
      .insert(promptInvites)
      .values({
        promptText,
        senderId: session.user.id,
        senderName: session.user.name || session.user.email,
        recipientEmail,
        token,
        expiresAt,
      })
      .returning();

    const isDev = process.env.NODE_ENV === "development";
    const baseUrl = isDev
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_APP_URL || "https://scrapbook.vercel.app";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Send email if requested
    if (sendEmail && recipientEmail !== "link@placeholder.com") {
      try {
        await sendInviteEmail({
          to: recipientEmail,
          senderName: session.user.name || "Someone",
          promptText,
          inviteUrl,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue even if email fails - invite is still created
      }
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        token: invite.token,
        status: invite.status,
      },
      inviteUrl,
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
