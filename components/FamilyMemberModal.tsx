"use client";

import { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ChevronRight, ChevronLeft, Users, Mail, Link, Check } from "lucide-react";

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
                      <ChevronRight className="w-4 h-4 text-gray-400" />
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
                  <Users className="w-6 h-6 text-gray-400" />
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
                <Mail className="w-5 h-5 mr-2" />
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
                    <Check className="w-5 h-5 mr-2 text-green-600" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link className="w-5 h-5 mr-2" />
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
              <ChevronLeft className="w-4 h-4" />
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
              <Check className="w-8 h-8 text-green-600" />
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
