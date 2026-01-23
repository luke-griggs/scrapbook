"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get invite-related params
  const inviteToken = searchParams.get("invite");
  const inviteId = searchParams.get("inviteId");
  const inviteEmail = searchParams.get("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "details">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill email from invite
  useEffect(() => {
    if (inviteEmail && inviteEmail !== "link@placeholder.com") {
      setEmail(inviteEmail);
      setStep("details");
    }
  }, [inviteEmail]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setStep("details");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
      } else {
        // Redirect to recording page if coming from invite, otherwise onboarding
        // Family membership is handled server-side in the record page
        if (inviteId) {
          router.push(`/record/${inviteId}`);
        } else {
          router.push("/onboarding");
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    
    try {
      // Redirect to recording page if coming from invite, otherwise onboarding
      const callbackURL = inviteId ? `/record/${inviteId}` : "/onboarding";
      const result = await signIn.social({
        provider: "google",
        callbackURL,
      });
      
      // If we get here without a redirect, something went wrong
      if (result?.error) {
        console.error("Google sign-in error:", result.error);
        setError(result.error.message || "Failed to sign in with Google. Please try again.");
        setLoading(false);
      }
      // Note: If successful, the browser will redirect and this code won't run
    } catch (err) {
      console.error("Google sign-in exception:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Google sign-in failed: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-normal text-gray-900 mb-2">
            {step === "email" ? "Log in or sign up" : "Create your account"}
          </h1>
          <p className="text-[15px] text-gray-500">
            {step === "email"
              ? "You'll get smarter responses and can upload files, images, and more."
              : "Set your password to continue"}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors"
            >
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
              <div>
                <p className="text-[12px] text-gray-400">Email address</p>
                <span className="text-[15px] text-gray-600">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-[15px] text-blue-500 hover:text-blue-600 font-medium"
              >
                Edit
              </button>
            </div>

            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-gray-200 text-[15px] text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-8 text-center text-[13px] text-gray-500">
          Already have an account?{" "}
          <Link
            href={inviteId 
              ? `/sign-in?${new URLSearchParams({
                  ...(inviteToken && { invite: inviteToken }),
                  inviteId,
                  ...(inviteEmail && { email: inviteEmail }),
                }).toString()}`
              : "/sign-in"}
            className="text-blue-500 hover:underline"
          >
            Log in
          </Link>
        </p>

        <div className="mt-8 flex justify-center gap-4 text-[13px] text-gray-400">
          <Link href="/terms" className="hover:text-gray-600 hover:underline">
            Terms of Use
          </Link>
          <span>|</span>
          <Link href="/privacy" className="hover:text-gray-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
