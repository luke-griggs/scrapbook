import { db } from "@/lib/db";
import { promptInvites, familyMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-server";
import { RecordClient } from "./record-client";

interface RecordPageProps {
  params: Promise<{ inviteId: string }>;
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { inviteId } = await params;

  // Require authentication
  const session = await requireAuth();

  // Fetch invite
  const invite = await db.query.promptInvites.findFirst({
    where: eq(promptInvites.id, inviteId),
  });

  // Handle invalid invite
  if (!invite) {
    redirect("/?error=invite-not-found");
  }

  // Handle expired invite
  if (new Date() > invite.expiresAt) {
    redirect("/?error=invite-expired");
  }

  // Handle already accepted invite
  if (invite.status === "accepted") {
    redirect("/?error=already-recorded");
  }

  // Add user to family if invite has a familyId and user isn't already a member
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

  return (
    <RecordClient inviteId={invite.id} promptText={invite.promptText} />
  );
}
