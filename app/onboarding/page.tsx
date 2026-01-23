"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Users, Plus, UserPlus } from "lucide-react";

type Step = "choice" | "create" | "join";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [step, setStep] = useState<Step>("choice");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingFamily, setCheckingFamily] = useState(true);

  // Check if user is authenticated and already has a family
  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    // Check if user already has a family
    async function checkFamily() {
      try {
        const res = await fetch("/api/family");
        const data = await res.json();
        if (data.family) {
          // User already has a family, redirect to home
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking family:", error);
      } finally {
        setCheckingFamily(false);
      }
    }

    checkFamily();
  }, [session, isPending, router]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!familyName.trim()) {
      setError("Please enter a family name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create family");
        return;
      }

      // Success - redirect to home
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join family");
        return;
      }

      // Success - redirect to home
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (isPending || checkingFamily) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px]">
        {step === "choice" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <h1 className="text-[28px] font-normal text-gray-900 mb-2">
                Welcome to Memorybook
              </h1>
              <p className="text-[15px] text-gray-500">
                Get started by creating or joining a family to share stories
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep("create")}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl text-[15px] font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Create a new family
              </button>

              <button
                onClick={() => setStep("join")}
                className="w-full bg-white text-gray-900 py-4 rounded-2xl text-[15px] font-medium border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              >
                <UserPlus className="w-5 h-5" />
                Join with invite code
              </button>
            </div>
          </>
        )}

        {step === "create" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-normal text-gray-900 mb-2">
                Create your family
              </h1>
              <p className="text-[15px] text-gray-500">
                Give your family group a name. You can invite others after.
              </p>
            </div>

            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Family name (e.g., The Smiths)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create family"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("choice");
                  setError("");
                  setFamilyName("");
                }}
                className="w-full text-gray-500 py-2 text-[15px] hover:text-gray-700 transition-colors"
              >
                Back
              </button>
            </form>
          </>
        )}

        {step === "join" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-[28px] font-normal text-gray-900 mb-2">
                Join a family
              </h1>
              <p className="text-[15px] text-gray-500">
                Enter the invite code shared by a family member
              </p>
            </div>

            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-center tracking-wider font-mono uppercase"
                  maxLength={8}
                  autoFocus
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Join family"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("choice");
                  setError("");
                  setInviteCode("");
                }}
                className="w-full text-gray-500 py-2 text-[15px] hover:text-gray-700 transition-colors"
              >
                Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
