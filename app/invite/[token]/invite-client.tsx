"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface InviteClientProps {
  token: string;
  inviteId: string;
  promptText: string;
  senderName: string;
  recipientEmail: string;
}

export function InviteClient({
  token,
  inviteId,
  promptText,
  senderName,
  recipientEmail,
}: InviteClientProps) {
  const router = useRouter();

  const handleRecordAnswer = () => {
    // Redirect to sign-up with invite context
    const params = new URLSearchParams({
      invite: token,
      inviteId: inviteId,
    });
    // Only include email if it's not the placeholder
    if (recipientEmail !== "link@placeholder.com") {
      params.set("email", recipientEmail);
    }
    router.push(`/sign-up?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 border-b border-gray-100">
        <h1 className="text-[22px] font-semibold text-gray-900 text-center">
          Scrapbook
        </h1>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          {/* Message */}
          <p className="text-[15px] text-gray-500 mb-2">
            {senderName} wants to hear your story
          </p>

          {/* Question Card */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <p className="text-[18px] font-medium text-gray-900 leading-relaxed">
              "{promptText}"
            </p>
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            className="w-full mb-4"
            onClick={handleRecordAnswer}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            Record Your Answer
          </Button>

          <p className="text-[13px] text-gray-400">
            You'll need to sign up or log in to record your answer
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-gray-100">
        <p className="text-[13px] text-gray-400 text-center">
          Scrapbook - Preserve your family's stories
        </p>
      </footer>
    </div>
  );
}
