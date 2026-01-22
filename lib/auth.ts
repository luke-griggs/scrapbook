import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const isDev = process.env.NODE_ENV === "development";
const baseURL = isDev
  ? "http://localhost:3000"
  : process.env.NEXT_PUBLIC_APP_URL || "https://scrapbook.vercel.app";

export const auth = betterAuth({
  baseURL,
  trustedOrigins: isDev
    ? ["http://localhost:3000"]
    : [process.env.NEXT_PUBLIC_APP_URL || "https://scrapbook.vercel.app"],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
