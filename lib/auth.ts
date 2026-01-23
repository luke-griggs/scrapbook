import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const isDev = process.env.NODE_ENV === "development";
const baseURL = isDev
  ? "http://localhost:3000"
  : process.env.NEXT_PUBLIC_APP_URL || "https://memorybook.family";

// Validate Google OAuth credentials at startup
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!isDev && (!googleClientId || !googleClientSecret)) {
  console.warn(
    "WARNING: Google OAuth credentials are not set. Google sign-in will not work."
  );
}

export const auth = betterAuth({
  baseURL,
  trustedOrigins: isDev
    ? ["http://localhost:3000"]
    : [
        "https://memorybook.family",
        "https://www.memorybook.family",
      ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : {},
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
