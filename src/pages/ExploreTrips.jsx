/**
 * Explore Trips Page - REDESIGNED
 * Premium 3-column grid layout with category filters
 *
 * Features:
 * - Responsive grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
 * - Amazon-style category filter bar
 * - Compact tour cards with smart image handling
 * - Instant category filtering
 * - No empty space - premium look
 */

import { useState, useMemo } from "react";
import { tours as staticTours, getFilterOptionsFromTours } from "../data/tours";
import { useTours } from "../data/toursData";
import CompactTourCard from "../components/CompactTourCard";
import CategoryFilterBar from "../components/CategoryFilterBar";
import ScrollReveal from "../components/ScrollReveal";

export default function ExploreTrips() {
  const { tours: toursFromFirestore, loading: toursLoading } = useTours();

  // Combine static and Firestore tours, removing duplicates based on ID
  const allTours = useMemo(() => {
    const combined = [...toursFromFirestore, ...staticTours];

    // Create a map to track unique tours by ID
    const uniqueToursMap = new Map();

    combined.forEach((tour) => {
      if (!uniqueToursMap.has(tour.id)) {
        uniqueToursMap.set(tour.id, tour);
      }
    });

    // Return the array of unique tours
    return Array.from(uniqueToursMap.values());
  }, [toursFromFirestore, staticTours]);

  const filterOptions = useMemo(
    () => getFilterOptionsFromTours(allTours),
    [allTours],
  );

  // State for category filter (new)
  const [activeCategory, setActiveCategory] = useState(null);

  // State for other filters (keep existing)
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [nights, setNights] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // Apply filters including category
  const filteredTours = useMemo(() => {
    let list = [...allTours];

    // Category filter (NEW)
    if (activeCategory) {
      list = list.filter((tour) => {
        const tourCategory = tour.category?.toLowerCase().replace(/\s+/g, "-");
        return tourCategory === activeCategory;
      });
    }

    // Existing filters
    if (destination && destination !== "All Destinations") {
      list = list.filter(
        (t) =>
          (t.destination || "")
            .toLowerCase()
            .includes(destination.toLowerCase()) ||
          (t.origin || "").toLowerCase().includes(destination.toLowerCase()),
      );
    }

    if (month && month !== "All Months") {
      const monthNum = filterOptions.months.indexOf(month);
      if (monthNum > 0) {
        list = list.filter(
          (t) => new Date(t.departureDate).getMonth() === monthNum - 1,
        );
      }
    }

    if (nights && nights !== "Any Nights") {
      const n = parseInt(nights, 10);
      if (!isNaN(n)) list = list.filter((t) => t.nights === n);
    }

    // Sorting
    if (sortBy === "date") {
      list.sort(
        (a, b) => new Date(a.departureDate) - new Date(b.departureDate),
      );
    } else if (sortBy === "price") {
      list.sort((a, b) => (a.pricePerGuest || 0) - (b.pricePerGuest || 0));
    } else if (sortBy === "nights") {
      list.sort((a, b) => (b.nights || 0) - (a.nights || 0));
    }

    return list;
  }, [
    allTours,
    activeCategory,
    destination,
    month,
    nights,
    sortBy,
    filterOptions.months,
  ]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleClearAllFilters = () => {
    setActiveCategory(null);
    setDestination("");
    setMonth("");
    setNights("");
    setSortBy("date");
  };

  if (toursLoading && allTours.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">
            Loading amazing trips...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Preparing your perfect vacation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50/30 via-white to-orange-50/30 min-h-screen">
      {/* Category Filter Bar */}
      <CategoryFilterBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        tripCount={filteredTours.length}
      />

      {/* Main Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Title & Count */}
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                  {activeCategory ? (
                    <>
                      {activeCategory
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}{" "}
                      Trips
                    </>
                  ) : (
                    "Explore All Trips"
                  )}
                </h1>
                <p className="text-neutral-600 text-base">
                  <span className="font-semibold text-purple-600">
                    {filteredTours.length}
                  </span>{" "}
                  amazing {filteredTours.length === 1 ? "trip" : "trips"}{" "}
                  waiting for you
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-neutral-700 whitespace-nowrap"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="date">Departure Date</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="nights">Duration</option>
                </select>

                {/* Clear All Filters Button */}
                {(activeCategory || destination || month || nights) && (
                  <button
                    onClick={handleClearAllFilters}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* No Results State */}
          {filteredTours.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  No trips found
                </h3>
                <p className="text-neutral-600 mb-6">
                  We couldn't find any trips matching your filters. Try
                  adjusting your search criteria.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg hover:shadow-xl transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Show All Trips
                </button>
              </div>
            </div>
          ) : (
            /* Premium 3-Column Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredTours.map((tour, index) => (
                <ScrollReveal
                  key={tour.id}
                  variant="fadeInUp"
                  staggerIndex={index}
                  duration={400}
                >
                  <CompactTourCard tour={tour} staggerIndex={index} />
                </ScrollReveal>
              ))}
            </div>
          )}

          {/* Results Summary */}
          {filteredTours.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="text-center">
                <p className="text-neutral-600 text-sm">
                  Showing{" "}
                  <span className="font-semibold text-purple-600">
                    {filteredTours.length}
                  </span>{" "}
                  of <span className="font-semibold">{allTours.length}</span>{" "}
                  total trips
                </p>
                {activeCategory && (
                  <p className="text-neutral-500 text-xs mt-2">
                    Filtered by:{" "}
                    <span className="font-medium text-purple-600">
                      {activeCategory
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Section */}
      {filteredTours.length > 0 && (
        <section className="bg-gradient-to-r from-purple-600 to-orange-500 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
              Can't find what you're looking for?
            </h2>
            <p className="text-purple-100 text-base sm:text-lg mb-6">
              Contact us to create a custom trip tailored just for you
            </p>
            <button className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Us
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
