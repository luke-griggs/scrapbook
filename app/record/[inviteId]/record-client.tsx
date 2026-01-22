"use client";

import { useRouter } from "next/navigation";
import { VideoRecorder } from "@/components/VideoRecorder";

interface RecordClientProps {
  inviteId: string;
  promptText: string;
}

export function RecordClient({ inviteId, promptText }: RecordClientProps) {
  const router = useRouter();

  const handleComplete = () => {
    // Redirect to stories page where the user can see their recorded video
    // This also ensures the user is now part of the family (added during response submission)
    router.push("/stories");
  };

  return (
    <VideoRecorder
      inviteId={inviteId}
      promptText={promptText}
      onComplete={handleComplete}
    />
  );
}
