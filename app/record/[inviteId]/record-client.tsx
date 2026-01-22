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
    router.push("/");
  };

  return (
    <VideoRecorder
      inviteId={inviteId}
      promptText={promptText}
      onComplete={handleComplete}
    />
  );
}
