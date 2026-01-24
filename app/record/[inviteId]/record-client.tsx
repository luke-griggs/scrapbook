"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoRecorder } from "@/components/VideoRecorder";
import { TextResponseForm } from "@/components/TextResponseForm";

interface RecordClientProps {
  inviteId: string;
  promptText: string;
}

type ResponseMode = "select" | "video" | "text";

function getInitialMode(searchParams: URLSearchParams): ResponseMode {
  const modeParam = searchParams.get("mode");
  if (modeParam === "text") return "text";
  if (modeParam === "video") return "video";
  return "select";
}

export function RecordClient({ inviteId, promptText }: RecordClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ResponseMode>(() => getInitialMode(searchParams));

  const handleComplete = () => {
    // Redirect to stories page where the user can see their response
    router.push("/stories");
  };

  // Mode selection screen
  if (mode === "select") {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Prompt */}
          <p className="text-gray-900 text-2xl font-semibold leading-relaxed mb-10">
            &quot;{promptText}&quot;
          </p>

          <p className="text-gray-500 text-base mb-8">
            How would you like to respond?
          </p>

          {/* Options */}
          <div className="space-y-4">
            {/* Video option */}
            <button
              onClick={() => setMode("video")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-gray-100 transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-gray-900 text-lg font-medium">Record a Video</h3>
                <p className="text-gray-500 text-sm">Share your story face-to-face</p>
              </div>
            </button>

            {/* Text option */}
            <button
              onClick={() => setMode("text")}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-gray-100 transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-gray-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-gray-900 text-lg font-medium">Write a Response</h3>
                <p className="text-gray-500 text-sm">Type out your story in words</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Video mode
  if (mode === "video") {
    return (
      <VideoRecorder
        inviteId={inviteId}
        promptText={promptText}
        onComplete={handleComplete}
      />
    );
  }

  // Text mode
  return (
    <TextResponseForm
      inviteId={inviteId}
      promptText={promptText}
      onComplete={handleComplete}
      onSwitchToVideo={() => setMode("video")}
    />
  );
}
