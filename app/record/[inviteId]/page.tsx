import { db } from "@/lib/db";
import { promptInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-server";
import { RecordClient } from "./record-client";

interface RecordPageProps {
  params: Promise<{ inviteId: string }>;
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { inviteId } = await params;

  // Require authentication
  await requireAuth();

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

  return (
    <RecordClient inviteId={invite.id} promptText={invite.promptText} />
  );
}
