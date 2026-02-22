/**
 * Trend Engine - Calculates blended trend stats for tours
 */

/**
 * Get blended trend stats combining multiple signals
 * @param {string} tourId - Tour ID
 * @param {Object} options - Calculation options
 * @returns {Object} Trend stats with score and rank
 */
export function getBlendedTrendStats(tourId, options = {}) {
  const {
    views = 0,
    likes = 0,
    saves = 0,
    bookings = 0,
    baseScore = 0
  } = options;
  
  // Weight factors for different signals
  const WEIGHTS = {
    views: 1,
    likes: 3,
    saves: 5,
    bookings: 10
  };
  
  // Calculate weighted score
  const score = (
    views * WEIGHTS.views +
    likes * WEIGHTS.likes +
    saves * WEIGHTS.saves +
    bookings * WEIGHTS.bookings +
    baseScore
  );
  
  // Normalize to 0-100 scale
  const normalizedScore = Math.min(100, Math.max(0, score / 100));
  
  return {
    tourId,
    score: normalizedScore,
    rawScore: score,
    signals: {
      views,
      likes,
      saves,
      bookings
    },
    trending: normalizedScore > 70,
    hot: normalizedScore > 90
  };
}

/**
 * Sort tours by trend score
 * @param {Array} tours - Array of tour objects
 * @returns {Array} Sorted array with trend data
 */
export function sortByTrending(tours) {
  if (!Array.isArray(tours)) return [];
  
  return tours
    .map(tour => ({
      ...tour,
      trendStats: getBlendedTrendStats(tour.id, {
        views: tour.views || 0,
        likes: tour.likes || 0,
        saves: tour.saves || 0,
        bookings: tour.bookings || 0
      })
    }))
    .sort((a, b) => b.trendStats.score - a.trendStats.score);
}

/**
 * Get top trending tours
 * @param {Array} tours - Array of tour objects
 * @param {number} limit - Number of tours to return
 * @returns {Array} Top trending tours
 */
export function getTopTrending(tours, limit = 5) {
  const sorted = sortByTrending(tours);
  return sorted.slice(0, limit);
}
