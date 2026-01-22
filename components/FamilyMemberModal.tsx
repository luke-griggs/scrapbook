"use client";

import { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface Prompt {
  id: string;
  text: string;
}

interface FamilyMember {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
}

type ModalView = "main" | "email" | "success";

export function FamilyMemberModal({
  isOpen,
  onClose,
  prompt,
}: FamilyMemberModalProps) {
  const [view, setView] = useState<ModalView>("main");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchFamilyMembers();
      setView("main");
      setEmail("");
      setEmailError("");
      setCopied(false);
      setInviteUrl("");
    }
  }, [isOpen]);

  async function fetchFamilyMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/family/members");
      if (res.ok) {
        const data = await res.json();
        setFamilyMembers(data.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch family members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendToMember(member: FamilyMember) {
    if (!prompt) return;
    setSending(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt.text,
          recipientEmail: member.email,
          sendEmail: true,
        }),
      });
      if (res.ok) {
        setView("success");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
    } finally {
      setSending(false);
    }
  }

  async function handleSendEmail() {
    if (!prompt) return;
    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setSending(true);
    setEmailError("");

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt.text,
          recipientEmail: email,
          sendEmail: true,
        }),
      });
      if (res.ok) {
        setView("success");
      } else {
        setEmailError("Failed to send invite. Please try again.");
      }
    } catch (error) {
      console.error("Failed to send invite:", error);
      setEmailError("Failed to send invite. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleCopyLink() {
    if (!prompt) return;
    setSending(true);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: prompt.text,
          recipientEmail: "link@placeholder.com",
          sendEmail: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.inviteUrl);
        setInviteUrl(data.inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error("Failed to create invite link:", error);
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setView("main");
    onClose();
  }

  if (!prompt) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send this question">
      <div className="p-6">
        {/* Prompt Preview */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-[15px] font-medium text-gray-900 leading-relaxed">
            "{prompt.text}"
          </p>
        </div>

        {view === "main" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
              </div>
            ) : familyMembers.length > 0 ? (
              <>
                <p className="text-[14px] text-gray-500 mb-3">
                  Send to a family member
                </p>
                <div className="space-y-2 mb-6">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSendToMember(member)}
                      disabled={sending}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name || ""}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[15px] font-medium text-gray-600">
                            {(member.name || member.email)[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[15px] font-medium text-gray-900">
                          {member.name || member.email}
                        </p>
                        {member.name && (
                          <p className="text-[13px] text-gray-500">
                            {member.email}
                          </p>
                        )}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[14px] text-gray-500 mb-3">
                    Or invite someone new
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                    />
                  </svg>
                </div>
                <p className="text-[15px] font-medium text-gray-900 mb-1">
                  No members in your family yet
                </p>
                <p className="text-[14px] text-gray-500">
                  Invite someone to answer this question
                </p>
              </div>
            )}

            {/* Invite Options */}
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setView("email")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                Invite via Email
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCopyLink}
                isLoading={sending}
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                      />
                    </svg>
                    Copy Invite Link
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {view === "email" && (
          <>
            <button
              onClick={() => setView("main")}
              className="flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700 mb-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
              Back
            </button>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                autoFocus
              />
              <Button
                variant="primary"
                className="w-full"
                onClick={handleSendEmail}
                isLoading={sending}
              >
                Send Invite
              </Button>
            </div>
          </>
        )}

        {view === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
              Invite Sent!
            </h3>
            <p className="text-[14px] text-gray-500 mb-6">
              They'll receive an email with a link to record their answer.
            </p>
            <Button variant="primary" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
