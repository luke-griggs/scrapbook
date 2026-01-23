"use client";

import { useState, useCallback } from "react";
import { upload as vercelUpload } from "@vercel/blob/client";

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

  const upload = useCallback(async (videoBlob: Blob): Promise<string | null> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const filename = `video-${Date.now()}.webm`;

      // Use Vercel Blob client-side upload - bypasses API route size limits
      const result = await vercelUpload(filename, videoBlob, {
        access: "public",
        handleUploadUrl: "/api/videos/upload",
        onUploadProgress: (progressEvent) => {
          const percentComplete = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(percentComplete);
        },
      });

      setProgress(100);
      return result.url;
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
