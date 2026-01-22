"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { Button } from "./ui/Button";

interface VideoRecorderProps {
  inviteId: string;
  promptText: string;
  onComplete: () => void;
}

type RecordingState =
  | "permission"
  | "ready"
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
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoPlaybackRef = useRef<HTMLVideoElement>(null);

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
    isUploading,
    error: uploadError,
  } = useVideoUpload();

  // Attach stream to preview video
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

  // Update state based on recording status
  useEffect(() => {
    if (hasPermissions && state === "permission") {
      setState("ready");
    }
  }, [hasPermissions, state]);

  useEffect(() => {
    if (isRecording) {
      setState("recording");
    } else if (recordedBlob && !isRecording) {
      setState("review");
    }
  }, [isRecording, recordedBlob]);

  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    if (granted) {
      setState("ready");
    }
  };

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleReRecord = () => {
    resetRecording();
    setState("ready");
  };

  const handleSubmit = async () => {
    if (!recordedBlob) return;

    setState("uploading");

    const videoUrl = await upload(recordedBlob);

    if (videoUrl) {
      // Save response to database
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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Question prompt */}
      <div className="bg-white/10 backdrop-blur-lg px-4 py-3">
        <p className="text-white text-[15px] font-medium text-center leading-snug">
          "{promptText}"
        </p>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative">
        {/* Permission state */}
        {state === "permission" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-8 max-w-md">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <h2 className="text-white text-[20px] font-semibold mb-2">
                Camera Access Required
              </h2>
              <p className="text-white/60 text-[15px] mb-6">
                We need access to your camera and microphone to record your
                answer.
              </p>
              {error && (
                <p className="text-red-400 text-[14px] mb-4 bg-red-500/10 rounded-xl p-3">
                  {error}
                </p>
              )}
              <Button
                variant="primary"
                onClick={handleRequestPermission}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Enable Camera
              </Button>
            </div>
          </div>
        )}

        {/* Live preview */}
        {(state === "ready" || state === "recording") && (
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Recorded playback */}
        {state === "review" && recordedUrl && (
          <video
            ref={videoPlaybackRef}
            src={recordedUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Recording indicator */}
        {state === "recording" && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-[14px] font-medium">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        {/* Uploading overlay */}
        {state === "uploading" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-[15px] font-medium mb-2">
                Uploading...
              </p>
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Complete overlay */}
        {state === "complete" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
              <h2 className="text-white text-[20px] font-semibold mb-2">
                Story Saved!
              </h2>
              <p className="text-white/60 text-[15px]">
                Your family will love this.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black px-4 py-6 pb-10">
        {state === "ready" && (
          <div className="flex justify-center">
            <button
              onClick={handleStartRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center ring-4 ring-white/30"
            >
              <div className="w-8 h-8 rounded-full bg-white" />
            </button>
          </div>
        )}

        {state === "recording" && (
          <div className="flex justify-center">
            <button
              onClick={handleStopRecording}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center ring-4 ring-white/30"
            >
              <div className="w-8 h-8 rounded-md bg-white" />
            </button>
          </div>
        )}

        {state === "review" && (
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={handleReRecord}
              className="flex-1 max-w-[160px] bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Re-record
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="flex-1 max-w-[160px] bg-white text-gray-900 hover:bg-gray-100"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
