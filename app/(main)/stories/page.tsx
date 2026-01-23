"use client";

import { useState, useEffect } from "react";
import { Video, MessageCircle, ChevronDown } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Story {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: string | null;
  createdAt: string;
  promptText: string;
  senderName: string | null;
  recorder: {
    id: string;
    name: string;
    image: string | null;
  };
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch("/api/stories");
        const data = await res.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  const fetchComments = async (storyId: string) => {
    if (comments[storyId]) return; // Already loaded
    
    setLoadingComments(storyId);
    try {
      const res = await fetch(`/api/stories/${storyId}/comments`);
      const data = await res.json();
      setComments((prev) => ({ ...prev, [storyId]: data.comments || [] }));
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(null);
    }
  };

  const toggleComments = (storyId: string) => {
    if (expandedComments === storyId) {
      setExpandedComments(null);
    } else {
      setExpandedComments(storyId);
      fetchComments(storyId);
    }
  };

  const handleSubmitComment = async (storyId: string) => {
    const content = newComment[storyId]?.trim();
    if (!content) return;

    setSubmittingComment(storyId);
    try {
      const res = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      
      if (data.comment) {
        setComments((prev) => ({
          ...prev,
          [storyId]: [data.comment, ...(prev[storyId] || [])],
        }));
        setNewComment((prev) => ({ ...prev, [storyId]: "" }));
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(null);
    }
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: string | null) => {
    if (!seconds) return "";
    const num = parseInt(seconds, 10);
    const mins = Math.floor(num / 60);
    const secs = num % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            Family Stories
          </h1>
          <p className="text-[14px] text-gray-500 text-center mt-1">
            Watch recorded memories
          </p>
        </div>
      </header>

      {stories.length === 0 ? (
        /* Empty state */
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-2">No stories yet</h2>
            <p className="text-[14px] text-gray-500 max-w-xs mx-auto">
              Send a question to a family member to start collecting stories
            </p>
          </div>
        </div>
      ) : (
        /* Stories list */
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
          <div className="space-y-6">
            {stories.map((story) => (
              <div key={story.id} className="bg-gray-50 rounded-2xl overflow-hidden">
                {/* Video */}
                <div className="relative aspect-video bg-black">
                  <video
                    src={story.videoUrl}
                    poster={story.thumbnailUrl || undefined}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                    onPlay={() => setPlayingId(story.id)}
                    onPause={() => setPlayingId(null)}
                    onEnded={() => setPlayingId(null)}
                  />
                  {story.durationSeconds && playingId !== story.id && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[12px] font-medium px-2 py-1 rounded">
                      {formatDuration(story.durationSeconds)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Prompt question */}
                  <p className="text-[15px] font-medium text-gray-900 mb-3">
                    &ldquo;{story.promptText}&rdquo;
                  </p>

                  {/* Recorder info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {story.recorder.image ? (
                        <img
                          src={story.recorder.image}
                          alt={story.recorder.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[13px] font-medium text-gray-500">
                          {story.recorder.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-900 truncate">
                        {story.recorder.name}
                      </p>
                      <p className="text-[12px] text-gray-500">
                        {formatDate(story.createdAt)}
                        {story.senderName && ` • Asked by ${story.senderName}`}
                      </p>
                    </div>
                  </div>

                  {/* Comments button */}
                  <button
                    onClick={() => toggleComments(story.id)}
                    className="mt-4 flex items-center gap-2 text-[14px] text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>
                      {comments[story.id]?.length 
                        ? `${comments[story.id].length} comment${comments[story.id].length !== 1 ? "s" : ""}`
                        : "Add a comment"}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${expandedComments === story.id ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Comments section */}
                  {expandedComments === story.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {/* New comment input */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment[story.id] || ""}
                          onChange={(e) =>
                            setNewComment((prev) => ({
                              ...prev,
                              [story.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment(story.id);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-[14px] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                          disabled={submittingComment === story.id}
                        />
                        <button
                          onClick={() => handleSubmitComment(story.id)}
                          disabled={
                            submittingComment === story.id ||
                            !newComment[story.id]?.trim()
                          }
                          className="px-4 py-2 bg-gray-900 text-white text-[14px] font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {submittingComment === story.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "Post"
                          )}
                        </button>
                      </div>

                      {/* Comments list */}
                      {loadingComments === story.id ? (
                        <div className="flex justify-center py-4">
                          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                        </div>
                      ) : comments[story.id]?.length > 0 ? (
                        <div className="space-y-3">
                          {comments[story.id].map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {comment.user.image ? (
                                  <img
                                    src={comment.user.image}
                                    alt={comment.user.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[11px] font-medium text-gray-500">
                                    {comment.user.name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-lg px-3 py-2">
                                  <p className="text-[13px] font-medium text-gray-900">
                                    {comment.user.name}
                                  </p>
                                  <p className="text-[14px] text-gray-700 whitespace-pre-wrap break-words">
                                    {comment.content}
                                  </p>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 ml-1">
                                  {formatCommentDate(comment.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[13px] text-gray-500 text-center py-3">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
