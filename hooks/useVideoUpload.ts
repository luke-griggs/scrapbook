"use client";

import { useState, useCallback } from "react";

interface UseVideoUploadReturn {
  upload: (blob: Blob) => Promise<string | null>;
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export function useVideoUpload(): UseVideoUploadReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (blob: Blob): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", blob, `video-${Date.now()}.webm`);

      // Simulate progress since fetch doesn't support upload progress natively
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setProgress(100);
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    upload,
    progress,
    isUploading,
    error,
  };
}
