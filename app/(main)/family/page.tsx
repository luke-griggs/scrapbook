"use client";

import { useState, useEffect } from "react";
import { Check, Clipboard, UserPlus } from "lucide-react";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isCurrentUser?: boolean;
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
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4" />
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
            Family Members ({data?.members?.length || 0})
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
                      {member.isCurrentUser && (
                        <span className="text-gray-400 font-normal"> (you)</span>
                      )}
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
                <UserPlus className="w-6 h-6 text-gray-400" />
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
