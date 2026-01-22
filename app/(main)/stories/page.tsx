export default function StoriesPage() {
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

      {/* Empty state */}
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
    </div>
  );
}
