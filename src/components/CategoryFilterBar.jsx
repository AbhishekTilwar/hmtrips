import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { id: "honeymoon", label: "Honeymoon" },
  { id: "12-jyotirlingas", label: "12 Jyotirlingas" },
  { id: "free-visa-in-india", label: "Free Visa in India" },
  { id: "required-visa-&-passport", label: "Required Visa & Passport" },
  { id: "jungle-safari-trip", label: "Jungle Safari Trip" },
  { id: "urban-cities-trip", label: "Urban Cities Trip" },
  { id: "holy-places-worldwide", label: "Holy Places Worldwide" },
  { id: "beaches-trip", label: "Beaches Trip" },
];

export default function CategoryFilterBar({
  activeCategory,
  onCategoryChange,
  tripCount = 0,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 5,
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
  };

  const handleCategoryClick = (categoryId) => {
    if (activeCategory === categoryId) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };

  const handleClearFilter = () => {
    onCategoryChange(null);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 via-white to-orange-50 border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* Category Filter Section */}
          <div className="flex-1 relative min-w-0">
            <div className="flex items-center gap-3">
              {/* Filter Label */}
              <div className="hidden lg:flex items-center gap-2 text-neutral-700 font-medium text-sm whitespace-nowrap flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filter by:</span>
              </div>

              {/* Left Scroll Button */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  className="hidden md:flex absolute left-0 z-10 items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-purple-300 transition-all"
                  style={{ marginLeft: "-16px" }}
                  aria-label="Scroll left"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Scrollable Categories Container */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div className="flex gap-2 py-1">
                  {CATEGORIES.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`
                          inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                          whitespace-nowrap transition-all duration-300 ease-out flex-shrink-0
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg scale-105 ring-2 ring-purple-300 ring-offset-2"
                              : "bg-white text-neutral-700 border border-neutral-300 hover:border-purple-400 hover:bg-purple-50 hover:shadow-md hover:scale-102"
                          }
                        `}
                      >
                        <span>{category.label}</span>
                        {isActive && (
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Scroll Button */}
              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  className="hidden md:flex absolute right-0 z-10 items-center justify-center w-8 h-8 rounded-full bg-white shadow-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-purple-300 transition-all"
                  style={{ marginRight: "-16px" }}
                  aria-label="Scroll right"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right Section: Trip Count & Clear Filter */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Trip Count Badge */}
            {activeCategory && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
                <span className="text-xs font-medium text-purple-700">
                  {tripCount} trips found
                </span>
              </div>
            )}

            {/* Clear Filter Button */}
            {activeCategory && (
              <button
                onClick={handleClearFilter}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                  bg-white text-neutral-700 border-2 border-neutral-300
                  hover:bg-red-50 hover:border-red-400 hover:text-red-600
                  transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Clear Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Layout - Full Width Scrollable */}
        <div className="sm:hidden">
          {/* Mobile: Scrollable Category Pills */}
          <div
            className="overflow-x-auto scrollbar-hide -mx-4 px-4"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex gap-2 py-1 w-max">
              {CATEGORIES.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                      whitespace-nowrap transition-all duration-300 ease-out
                      ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg ring-2 ring-purple-300 ring-offset-2"
                          : "bg-white text-neutral-700 border border-neutral-300"
                      }
                    `}
                  >
                    <span>{category.label}</span>
                    {isActive && (
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile: Active Category Info */}
          {activeCategory && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-900">
                  {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                </span>
                <span className="text-xs text-purple-600">
                  ({tripCount} trips)
                </span>
              </div>
              <button
                onClick={handleClearFilter}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
                  bg-white text-neutral-700 border border-neutral-300
                  hover:bg-red-50 hover:border-red-400 hover:text-red-600
                  transition-all duration-200"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar hide styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .scrollbar-hide {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
