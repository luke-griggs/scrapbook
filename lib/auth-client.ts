"use client";

import { createAuthClient } from "better-auth/react";

// Use the current origin in the browser, fallback for SSR
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR
  return process.env.NEXT_PUBLIC_APP_URL || "https://memorybook.family";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
