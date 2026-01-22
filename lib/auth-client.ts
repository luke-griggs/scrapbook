"use client";

import { createAuthClient } from "better-auth/react";

const isDev = process.env.NODE_ENV === "development";
const baseURL = isDev
  ? "http://localhost:3000"
  : process.env.NEXT_PUBLIC_APP_URL || "https://scrapbook.vercel.app";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
