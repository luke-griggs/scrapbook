"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { MessageCircle, Video, Users } from "lucide-react";

const tabs = [
  {
    name: "Questions",
    href: "/",
    icon: (active: boolean) => (
      <MessageCircle className="w-6 h-6" fill={active ? "currentColor" : "none"} />
    ),
  },
  {
    name: "Stories",
    href: "/stories",
    icon: (active: boolean) => (
      <Video className="w-6 h-6" fill={active ? "currentColor" : "none"} />
    ),
  },
  {
    name: "Family",
    href: "/family",
    icon: (active: boolean) => (
      <Users className="w-6 h-6" fill={active ? "currentColor" : "none"} />
    ),
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const [familyChecked, setFamilyChecked] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);

  useEffect(() => {
    if (sessionPending) return;

    // If not authenticated, redirect to sign-in
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    // Check if user has a family
    async function checkFamily() {
      try {
        const res = await fetch("/api/family");
        const data = await res.json();
        if (!data.family) {
          // User doesn't have a family, redirect to onboarding
          router.push("/onboarding");
        } else {
          setHasFamily(true);
        }
      } catch (error) {
        console.error("Error checking family:", error);
      } finally {
        setFamilyChecked(true);
      }
    }

    checkFamily();
  }, [session, sessionPending, router]);

  // Show loading state while checking auth and family
  if (sessionPending || !familyChecked || !hasFamily) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {children}

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href));

              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "text-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.icon(isActive)}
                  <span className="text-[11px] font-medium">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
