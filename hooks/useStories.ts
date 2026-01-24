import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Story {
  id: string;
  videoUrl: string | null;
  textContent: string | null;
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

async function fetchStories(): Promise<Story[]> {
  const res = await fetch("/api/stories");
  const data = await res.json();
  return data.stories || [];
}

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: fetchStories,
  });
}

export function useInvalidateStories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["stories"] });
}

// Optimistic update helper for deleting a story
export function useOptimisticDeleteStory() {
  const queryClient = useQueryClient();

  return (storyId: string) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey: ["stories"] });

    // Snapshot the previous value
    const previousStories = queryClient.getQueryData<Story[]>(["stories"]);

    // Optimistically update
    queryClient.setQueryData<Story[]>(["stories"], (old) =>
      old?.filter((s) => s.id !== storyId)
    );

    // Return context for rollback
    return { previousStories };
  };
}
