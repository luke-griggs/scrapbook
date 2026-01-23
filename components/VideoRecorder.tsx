"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useVideoUpload } from "@/hooks/useVideoUpload";

interface VideoRecorderProps {
  inviteId: string;
  promptText: string;
  onComplete: () => void;
}

type RecordingState =
  | "permission"
  | "ready"
  | "countdown"
  | "recording"
  | "review"
  | "uploading"
  | "complete";

export function VideoRecorder({
  inviteId,
  promptText,
  onComplete,
}: VideoRecorderProps) {
  const [state, setState] = useState<RecordingState>("permission");
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);
  const startRecordingRef = useRef<(() => void) | null>(null);

  const {
    stream,
    isRecording,
    recordedBlob,
    recordedUrl,
    error: recorderError,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermissions,
    hasPermissions,
  } = useMediaRecorder();

  const {
    upload,
    progress,
    error: uploadError,
  } = useVideoUpload();

  // Keep startRecording ref in sync (avoids effect re-runs when function reference changes)
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  // Attach stream to preview video element
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

  // Update state when permissions are granted
  useEffect(() => {
    if (hasPermissions && state === "permission") {
      setState("ready");
    }
  }, [hasPermissions, state]);

  // Update state when recording starts/stops
  useEffect(() => {
    if (isRecording && state === "countdown") {
      setState("recording");
    } else if (!isRecording && recordedBlob && state === "recording") {
      setState("review");
    }
  }, [isRecording, recordedBlob, state]);

  // Countdown timer effect
  useEffect(() => {
    if (state !== "countdown" || countdownNumber === null) return;

    if (countdownNumber > 0) {
      const timer = setTimeout(() => {
        setCountdownNumber(countdownNumber - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start recording
      // Use ref to avoid effect re-runs when startRecording reference changes
      startRecordingRef.current?.();
    }
  }, [state, countdownNumber]);

  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setState("ready");
    }
  };

  const handleStartRecording = () => {
    setCountdownNumber(3);
    setState("countdown");
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleRetake = () => {
    resetRecording();
    setCountdownNumber(3);
    setState("countdown");
  };

  const handleContinue = async () => {
    if (!recordedBlob) return;

    setState("uploading");

    const videoUrl = await upload(recordedBlob);

    if (videoUrl) {
      try {
        const response = await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            promptInviteId: inviteId,
            videoUrl,
            durationSeconds: duration,
          }),
        });

        if (response.ok) {
          setState("complete");
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          throw new Error("Failed to save response");
        }
      } catch (error) {
        console.error("Error saving response:", error);
        setState("review");
      }
    } else {
      setState("review");
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const error = recorderError || uploadError;

  // Determine if we should show the live camera preview
  const showLivePreview = state === "countdown" || state === "recording";

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">

        {/* Live camera preview - always mounted when we have stream, visibility controlled */}
        {stream && (
          <div
            className={`absolute inset-0 bg-black flex flex-col ${
              showLivePreview ? "visible" : "invisible pointer-events-none"
            }`}
          >
            <div className="flex-1 relative min-h-0">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Countdown overlay */}
              {state === "countdown" && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  {countdownNumber !== null && countdownNumber > 0 && (
                    <span
                      key={countdownNumber}
                      className="text-9xl font-bold text-gray-900 animate-countdown"
                    >
                      {countdownNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Recording indicator */}
              {state === "recording" && (
                <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">
                    {formatDuration(duration)}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom section for recording state */}
            {state === "recording" && (
              <div className="flex-shrink-0 bg-gradient-to-t from-white via-white to-white px-6 pt-4 pb-8">
                <p className="text-gray-900 text-lg font-medium text-center leading-relaxed max-w-md mx-auto mb-6">
                  &quot;{promptText}&quot;
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={handleStopRecording}
                    className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center shadow-lg"
                  >
                    <div className="w-6 h-6 rounded-sm bg-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Permission state */}
        {state === "permission" && (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
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
            <h2 className="text-gray-900 text-2xl font-semibold mb-3">
              Camera Access Required
            </h2>
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              We need access to your camera and microphone to record your answer.
            </p>
            {error && (
              <p className="text-red-600 text-sm mb-6 bg-red-50 rounded-xl p-4">
                {error}
              </p>
            )}
            <button
              onClick={handleRequestPermission}
              className="w-full py-4 px-6 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Ready state - show prompt and start button */}
        {state === "ready" && (
          <div className="text-center max-w-md">
            <p className="text-gray-900 text-2xl font-medium leading-relaxed mb-12">
              &quot;{promptText}&quot;
            </p>
            <button
              onClick={handleStartRecording}
              className="py-4 px-8 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Recording
            </button>
          </div>
        )}

        {/* Review state - show recorded video */}
        {state === "review" && recordedUrl && (
          <div className="absolute inset-0 bg-black flex flex-col">
            <div className="flex-1 relative min-h-0">
              <video
                ref={videoPlaybackRef}
                src={recordedUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-shrink-0 bg-white px-6 py-6 pb-8 flex gap-4">
              <button
                onClick={handleRetake}
                className="flex-1 py-4 px-6 bg-white text-gray-900 text-base font-medium rounded-full border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-4 px-6 bg-gray-900 text-white text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Uploading state */}
        {state === "uploading" && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-900 text-lg font-medium mb-4">
              Uploading...
            </p>
            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
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
              Story Saved!
            </h2>
            <p className="text-gray-500 text-base">
              Thanks for sharing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
