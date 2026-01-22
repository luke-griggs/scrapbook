import { db } from "@/lib/db";
import { promptInvites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { InviteClient } from "./invite-client";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Fetch invite
  const invite = await db.query.promptInvites.findFirst({
    where: eq(promptInvites.token, token),
  });

  // Handle invalid invite
  if (!invite) {
    return <InviteError message="This invite link is invalid." />;
  }

  // Handle expired invite
  if (new Date() > invite.expiresAt) {
    return <InviteError message="This invite has expired." />;
  }

  // Handle already accepted invite
  if (invite.status === "accepted") {
    return <InviteError message="This invite has already been used." />;
  }

  // Check if user is authenticated
  const session = await getSession();

  // If authenticated, redirect to record page
  if (session?.user) {
    redirect(`/record/${invite.id}`);
  }

  // Show invite page for unauthenticated users
  return (
    <InviteClient
      token={token}
      inviteId={invite.id}
      promptText={invite.promptText}
      senderName={invite.senderName || "Someone"}
      recipientEmail={invite.recipientEmail}
    />
  );
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold text-gray-900 mb-2">
          Invite Not Available
        </h1>
        <p className="text-[15px] text-gray-500 mb-6">{message}</p>
        <a
          href="/"
          className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
