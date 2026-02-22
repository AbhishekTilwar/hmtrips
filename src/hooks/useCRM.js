import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getPersonalizedRecommendations, 
  getTrendingTours, 
  getRecentTours, 
  getRecentlyViewedTours 
} from '../services/crmAnalytics'

/**
 * Enhanced CRM Hook for Personalized Tour Recommendations
 * Netflix/Amazon-style recommendation system
 * 
 * Features:
 * - Real-time personalized recommendations
 * - Trending and recent tour sections
 * - Performance optimized with caching
 * - Error handling and fallbacks
 * - Configurable recommendation parameters
 */
export function useCRMRecommendations(allTours, options = {}) {
  const { user } = useAuth()
  const {
    limit = 12,
    refreshInterval = 300000, // 5 minutes
    includeTrending = true,
    includeRecent = true,
    enableDiversity = true
  } = options
  
  // State management
  const [recommendations, setRecommendations] = useState([])
  const [trendingTours, setTrendingTours] = useState([])
  const [recentTours, setRecentTours] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  /**
   * Fetch all CRM data
   */
  const fetchCRMData = useCallback(async (forceRefresh = false) => {
    if (!allTours || allTours.length === 0) {
      setLoading(false)
      return
    }

    // Skip if data is fresh (unless forced)
    if (!forceRefresh && lastUpdated && (Date.now() - lastUpdated) < refreshInterval) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = user?.uid || 'anonymous'
      
      // Fetch all data in parallel for better performance
      const [
        personalizedData,
        trendingData,
        recentData,
        viewedData
      ] = await Promise.allSettled([
        getPersonalizedRecommendations(userId, allTours, {
          limit,
          includeTrending,
          includeNew: includeRecent,
          diversity: enableDiversity
        }),
        includeTrending ? getTrendingTours(allTours, Math.min(8, limit)) : Promise.resolve([]),
        includeRecent ? getRecentTours(allTours, Math.min(6, limit)) : Promise.resolve([]),
        userId !== 'anonymous' ? getRecentlyViewedTours(userId, allTours, 6) : Promise.resolve([])
      ])

      // Handle results
      if (personalizedData.status === 'fulfilled') {
        setRecommendations(personalizedData.value)
      }
      
      if (trendingData.status === 'fulfilled') {
        setTrendingTours(trendingData.value)
      }
      
      if (recentData.status === 'fulfilled') {
        setRecentTours(recentData.value)
      }
      
      if (viewedData.status === 'fulfilled') {
        setRecentlyViewed(viewedData.value)
      }

      // Handle any errors
      const errors = [personalizedData, trendingData, recentData, viewedData]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason)
      
      if (errors.length > 0) {
        console.warn('Some CRM data fetches failed:', errors)
        setError(errors[0]?.message || 'Partial data loading issue')
      }

      setLastUpdated(Date.now())
    } catch (err) {
      console.error('Error fetching CRM data:', err)
      setError(err.message)
      
      // Fallback to basic trending
      try {
        const fallbackTrending = getTrendingTours(allTours, limit)
        setRecommendations(fallbackTrending)
        setTrendingTours(fallbackTrending)
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError)
        setRecommendations(allTours.slice(0, limit))
      }
    } finally {
      setLoading(false)
    }
  }, [user?.uid, allTours, limit, refreshInterval, lastUpdated, includeTrending, includeRecent, enableDiversity])

  /**
   * Refresh data manually
   */
  const refresh = useCallback(() => {
    fetchCRMData(true)
  }, [fetchCRMData])

  /**
   * Initialize and setup periodic refresh
   */
  useEffect(() => {
    // Initial fetch
    fetchCRMData()
    
    // Setup periodic refresh only if refreshInterval > 0
    let interval;
    if (refreshInterval > 0) {
      interval = setInterval(() => {
        fetchCRMData()
      }, refreshInterval)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [fetchCRMData, refreshInterval])

  /**
   * Refetch when user changes
   */
  useEffect(() => {
    if (user !== undefined) { // Only when user state is resolved
      fetchCRMData(true)
    }
  }, [user, fetchCRMData])

  return {
    // Data
    recommendations,
    trendingTours,
    recentTours,
    recentlyViewed,
    
    // State
    loading,
    error,
    lastUpdated,
    
    // Actions
    refresh,
    
    // Metadata
    hasData: recommendations.length > 0 || trendingTours.length > 0,
    isEmpty: recommendations.length === 0 && trendingTours.length === 0
  }
}

/**
 * Hook for tracking user interactions and updating recommendations
 */
export function useInteractionTracker() {
  const { user } = useAuth()
  const [interactionCache, setInteractionCache] = useState(new Map())

  /**
   * Track interaction and update local cache
   */
  const trackInteraction = useCallback((tourId, action, metadata = {}) => {
    if (!user?.uid) return

    const cacheKey = `${user.uid}_${tourId}_${action}`
    const timestamp = Date.now()
    
    // Update cache
    setInteractionCache(prev => {
      const newCache = new Map(prev)
      newCache.set(cacheKey, { timestamp, ...metadata })
      return newCache
    })

    // In a real implementation, this would call the CRM tracking service
    console.log('Interaction tracked:', { userId: user.uid, tourId, action, metadata })
  }, [user?.uid])

  /**
   * Check if user has interacted with a tour
   */
  const hasInteracted = useCallback((tourId, action) => {
    if (!user?.uid) return false
    
    const cacheKey = `${user.uid}_${tourId}_${action}`
    return interactionCache.has(cacheKey)
  }, [user?.uid, interactionCache])

  /**
   * Get interaction history for a tour
   */
  const getInteractionHistory = useCallback((tourId) => {
    if (!user?.uid) return []
    
    const prefix = `${user.uid}_${tourId}_`
    const history = []
    
    for (const [key, value] of interactionCache.entries()) {
      if (key.startsWith(prefix)) {
        const action = key.replace(prefix, '')
        history.push({ action, ...value })
      }
    }
    
    return history.sort((a, b) => b.timestamp - a.timestamp)
  }, [user?.uid, interactionCache])

  return {
    trackInteraction,
    hasInteracted,
    getInteractionHistory
  }
}

/**
 * Hook for user preference analysis
 */
export function useUserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setPreferences(null)
      setLoading(false)
      return
    }

    const fetchPreferences = async () => {
      try {
        setLoading(true)
        // Import dynamically to avoid circular dependencies
        const { getUserInteractionProfile } = await import('../services/crmAnalytics')
        const profile = await getUserInteractionProfile(user.uid)
        setPreferences(profile)
      } catch (error) {
        console.error('Error fetching user preferences:', error)
        setPreferences(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user?.uid])

  return {
    preferences,
    loading,
    hasPreferences: !!preferences
  }
}