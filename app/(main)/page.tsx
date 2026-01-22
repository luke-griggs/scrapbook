"use client";

import { useRef, useState } from "react";
import { FamilyMemberModal } from "@/components/FamilyMemberModal";

// Family-oriented categories and prompts
const categories = [
  {
    id: "1",
    name: "Early Childhood",
    slug: "early-childhood",
    icon: "baby",
    prompts: [
      { id: "1", text: "Who were your favorite childhood friends?" },
      { id: "2", text: "What was your favorite toy growing up?" },
      { id: "3", text: "Tell us about your childhood home" },
      { id: "4", text: "What's your earliest memory?" },
      { id: "5", text: "What games did you play as a child?" },
    ],
  },
  {
    id: "2",
    name: "Teen Years",
    slug: "teen-years",
    icon: "academic",
    prompts: [
      { id: "6", text: "What was your favorite subject in school?" },
      { id: "7", text: "Tell us about your best friend in high school" },
      { id: "8", text: "What music did you listen to as a teenager?" },
      { id: "9", text: "What was your first job?" },
      { id: "10", text: "What did you dream of becoming?" },
    ],
  },
  {
    id: "3",
    name: "Adventures in Travel",
    slug: "adventures-travel",
    icon: "plane",
    prompts: [
      { id: "11", text: "What's the most memorable trip you've taken?" },
      { id: "12", text: "Where would you love to visit someday?" },
      { id: "13", text: "Tell us about a travel mishap that became a funny story" },
      { id: "14", text: "What's the most beautiful place you've ever seen?" },
      { id: "15", text: "Describe your dream vacation" },
    ],
  },
  {
    id: "4",
    name: "Family Traditions",
    slug: "family-traditions",
    icon: "home",
    prompts: [
      { id: "16", text: "What holiday traditions did your family have?" },
      { id: "17", text: "What recipes have been passed down in your family?" },
      { id: "18", text: "Tell us about a memorable family gathering" },
      { id: "19", text: "What values did your parents teach you?" },
      { id: "20", text: "What traditions do you want to pass on?" },
    ],
  },
  {
    id: "5",
    name: "Love & Relationships",
    slug: "love-relationships",
    icon: "heart",
    prompts: [
      { id: "21", text: "How did you meet your partner?" },
      { id: "22", text: "What's the best relationship advice you've received?" },
      { id: "23", text: "Tell us about your wedding day" },
      { id: "24", text: "What makes a relationship last?" },
      { id: "25", text: "Describe a moment when you felt truly loved" },
    ],
  },
  {
    id: "6",
    name: "Life Lessons",
    slug: "life-lessons",
    icon: "lightbulb",
    prompts: [
      { id: "26", text: "What's the biggest risk you ever took?" },
      { id: "27", text: "What do you wish you knew at 20?" },
      { id: "28", text: "What are you most proud of?" },
      { id: "29", text: "Tell us about a moment that changed your life" },
      { id: "30", text: "What advice would you give your younger self?" },
    ],
  },
];

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
  baby: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
    </svg>
  ),
  academic: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  plane: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  ),
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  heart: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  lightbulb: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
};

function PromptCard({ prompt, onClick }: { prompt: { id: string; text: string }; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[160px] h-[180px] bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between text-left hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-4">
        {prompt.text}
      </h3>
      <div className="flex items-center justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </button>
  );
}

interface Prompt {
  id: string;
  text: string;
}

function CategoryRow({
  category,
  onPromptClick
}: {
  category: typeof categories[0];
  onPromptClick: (prompt: Prompt) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 180;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-4">
        <span className="text-gray-500">
          {categoryIcons[category.icon]}
        </span>
        <h2 className="text-[14px] font-medium text-gray-600 tracking-wide">
          {category.name}
        </h2>
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {category.prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={() => onPromptClick(prompt)}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-[22px] font-semibold text-gray-900 text-center">
            Choose a Question
          </h1>
          <p className="text-[14px] text-gray-500 text-center mt-1">
            Send a prompt to a family member
          </p>
        </div>
      </header>

      {/* Categories and Questions */}
      <div className="max-w-2xl mx-auto pt-6 pb-24">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onPromptClick={handlePromptClick}
          />
        ))}
      </div>

      {/* Family Member Modal */}
      <FamilyMemberModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prompt={selectedPrompt}
      />
    </div>
  );
}
