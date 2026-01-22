"use client";

import { useState, useEffect } from "react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface FamilyData {
  family: {
    id: string;
    name: string;
    inviteCode: string;
  } | null;
  members: FamilyMember[];
}

export default function FamilyPage() {
  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchFamily() {
      try {
        const [familyRes, membersRes] = await Promise.all([
          fetch("/api/family"),
          fetch("/api/family/members"),
        ]);
        const familyData = await familyRes.json();
        const membersData = await membersRes.json();
        
        setData({
          family: familyData.family,
          members: membersData.members || [],
        });
      } catch (error) {
        console.error("Error fetching family:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFamily();
  }, []);

  const copyInviteCode = async () => {
    if (data?.family?.inviteCode) {
      await navigator.clipboard.writeText(data.family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-[22px] font-semibold text-gray-900 text-center">
            {data?.family?.name || "Family"}
          </h1>
          <p className="text-[14px] text-gray-500 text-center mt-1">
            Manage your family members
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Invite Code Card */}
        {data?.family && (
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-medium text-gray-600">
                Invite Code
              </h3>
              <button
                onClick={copyInviteCode}
                className="text-[13px] text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[24px] font-mono font-semibold text-gray-900 tracking-wider">
                {data.family.inviteCode}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-2">
              Share this code with family members so they can join
            </p>
          </div>
        )}

        {/* Members List */}
        <div>
          <h3 className="text-[14px] font-medium text-gray-600 mb-3">
            Family Members ({(data?.members?.length || 0) + 1})
          </h3>
          
          {data?.members && data.members.length > 0 ? (
            <div className="space-y-3">
              {data.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[15px] font-medium text-gray-500">
                        {member.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-gray-900 truncate">
                      {member.name || "Unknown"}
                    </p>
                    <p className="text-[13px] text-gray-500 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
              </div>
              <p className="text-[14px] text-gray-500">
                No other family members yet
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                Share your invite code to add members
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
