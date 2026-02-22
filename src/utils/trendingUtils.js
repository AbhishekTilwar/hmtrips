/**
 * Trending Utils - Cache utilities for global trend stats
 */

// Cache TTL in milliseconds (5 minutes)
export const GLOBAL_TRENDS_TTL_MS = 5 * 60 * 1000;

const CACHE_KEY = 'hm_tours_global_trends';

/**
 * Get cached global trend stats from localStorage
 * @returns {Object|null} Cached stats or null if expired/missing
 */
export function getCachedGlobalTrendStats() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > GLOBAL_TRENDS_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cached trends:', error);
    return null;
  }
}

/**
 * Set global trend stats in localStorage cache
 * @param {Object} data - Trend stats to cache
 */
export function setCachedGlobalTrendStats(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching trends:', error);
  }
}

/**
 * Clear cached trend stats
 */
export function clearCachedGlobalTrendStats() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing trend cache:', error);
  }
}
