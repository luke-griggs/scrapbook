"use client";

import { useState, useEffect } from "react";

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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
