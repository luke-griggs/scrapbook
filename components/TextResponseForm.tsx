"use client";

import { useState } from "react";

interface TextResponseFormProps {
  inviteId: string;
  promptText: string;
  onComplete: () => void;
  onSwitchToVideo: () => void;
}

type FormState = "writing" | "submitting" | "complete";

const MAX_CHARACTERS = 5000;

export function TextResponseForm({
  inviteId,
  promptText,
  onComplete,
  onSwitchToVideo,
}: TextResponseFormProps) {
  const [state, setState] = useState<FormState>("writing");
  const [textContent, setTextContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const characterCount = textContent.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;
  const isEmpty = textContent.trim().length === 0;

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit) return;

    setState("submitting");
    setError(null);

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptInviteId: inviteId,
          textContent: textContent.trim(),
        }),
      });

      if (response.ok) {
        setState("complete");
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to save response");
      }
    } catch (err) {
      console.error("Error saving response:", err);
      setError(err instanceof Error ? err.message : "Failed to save response");
      setState("writing");
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Writing state */}
        {state === "writing" && (
          <div className="w-full max-w-lg">
            {/* Prompt */}
            <p className="text-gray-900 text-xl font-medium leading-relaxed mb-8 text-center">
              &quot;{promptText}&quot;
            </p>

            {/* Text area */}
            <div className="relative mb-4">
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Write your response here..."
                className={`w-full h-64 p-4 text-base text-gray-900 bg-gray-50 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 ${
                  isOverLimit ? "border-red-300" : "border-gray-200"
                }`}
              />
              <div
                className={`absolute bottom-3 right-3 text-sm ${
                  isOverLimit ? "text-red-500" : "text-gray-400"
                }`}
              >
                {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-xl p-4">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={isEmpty || isOverLimit}
                className="flex-1 py-4 px-6 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Response
              </button>
            </div>

            {/* Switch to video option */}
            <button
              onClick={onSwitchToVideo}
              className="mt-6 w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <span className="text-sm font-medium">Record a video instead</span>
            </button>
          </div>
        )}

        {/* Submitting state */}
        {state === "submitting" && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-900 text-lg font-medium">
              Saving your response...
            </p>
          </div>
        )}

        {/* Complete state */}
        {state === "complete" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-10 h-10 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-gray-900 text-2xl font-semibold mb-2">
              Response Saved!
            </h2>
            <p className="text-gray-500 text-base">
              Thanks for sharing your story!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
