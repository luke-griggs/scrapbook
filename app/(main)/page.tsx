"use client";

import { useRef, useState } from "react";
import { FamilyMemberModal } from "@/components/FamilyMemberModal";
import { Smile, GraduationCap, Plane, Home, Heart, Lightbulb, ChevronRight, ChevronLeft, Gavel } from "lucide-react";

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
      { id: "36", text: "Describe a time you got in trouble as a kid" },
      { id: "37", text: "Tell us about a time you got in trouble at school" },
      { id: "38", text: "Describe a childhood moment when you realized you were in big trouble" },
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
      { id: "39", text: "What was the moment you felt like an adult for the first time?" },
    ],
  },
  {
    id: "3",
    name: "Learning the Hard Way",
    slug: "learning-hard-way",
    icon: "zap",
    prompts: [
      { id: "31", text: "Describe a mistake you made that taught you something important." },
      { id: "32", text: "Describe a time you learned a hard lesson" },
      { id: "33", text: "Tell us about a moment when you got caught doing something you shouldn't have been doing." },
      { id: "34", text: "Tell us about an embarrassing moment you can laugh about now." },
      { id: "35", text: "Describe a time someone gave you tough love and it changed you." },
    ],
  },
  {
    id: "4",
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
    id: "5",
    name: "Family Traditions",
    slug: "family-traditions",
    icon: "home",
    prompts: [
      { id: "16", text: "What holiday traditions did your family have?" },
      { id: "17", text: "What recipes have been passed down in your family?" },
      { id: "18", text: "Tell us about a memorable family gathering" },
      { id: "19", text: "What values did your parents teach you?" },
      { id: "20", text: "What traditions do you want to pass on?" },
      { id: "40", text: "What's a lesson someone in the family taught you that stuck with you?" },
    ],
  },
  {
    id: "6",
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
    id: "7",
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
  baby: <Smile className="w-5 h-5" />,
  academic: <GraduationCap className="w-5 h-5" />,
  plane: <Plane className="w-5 h-5" />,
  home: <Home className="w-5 h-5" />,
  heart: <Heart className="w-5 h-5" />,
  lightbulb: <Lightbulb className="w-5 h-5" />,
  zap: <Gavel className="w-5 h-5" />,
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
          <ChevronRight className="w-4 h-4 text-gray-600" />
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
          <ChevronLeft className="w-5 h-5 text-gray-600" />
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
          <ChevronRight className="w-5 h-5 text-gray-600" />
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
