"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseMediaRecorderReturn {
  stream: MediaStream | null;
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;
  duration: number;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  requestPermissions: () => Promise<boolean>;
  hasPermissions: boolean;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedUrlRef = useRef<string | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    recordedUrlRef.current = recordedUrl;
  }, [recordedUrl]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      setStream(mediaStream);
      setHasPermissions(true);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to access camera";
      if (errorMessage.includes("Permission denied")) {
        setError(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      } else if (errorMessage.includes("NotFoundError")) {
        setError("No camera found. Please connect a camera and try again.");
      } else {
        setError(errorMessage);
      }
      setHasPermissions(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError("No camera stream available");
      return;
    }

    try {
      chunksRef.current = [];
      setDuration(0);
      startTimeRef.current = Date.now();

      // Determine supported mime type - include both video and audio codecs
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setIsRecording(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorder.onerror = () => {
        setError("Recording failed. Please try again.");
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    chunksRef.current = [];
  }, [recordedUrl]);

  return {
    stream,
    isRecording,
    recordedBlob,
    recordedUrl,
    error,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
    requestPermissions,
    hasPermissions,
  };
}
