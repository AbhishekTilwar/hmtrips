import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getPersonalizedTours, getTrendingTours, getRecentlyViewedTours } from '../lib/firestore'

/**
 * Hook to get personalized tours for the current user
 * Returns personalized, trending, and recently viewed tours
 */
export function usePersonalizedTours(allTours, options = {}) {
  const { user } = useAuth()
  const { limit = 10 } = options
  
  const [personalizedTours, setPersonalizedTours] = useState([])
  const [trendingTours, setTrendingTours] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPersonalizedData = useCallback(async () => {
    if (!allTours || allTours.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get trending tours (works for all users)
      const trending = await getTrendingTours(allTours, limit)
      setTrendingTours(trending)

      if (user?.uid) {
        // Get personalized tours for logged-in users
        const personalized = await getPersonalizedTours(user.uid, allTours, limit)
        setPersonalizedTours(personalized)

        // Get recently viewed
        const recent = await getRecentlyViewedTours(user.uid, allTours, 5)
        setRecentlyViewed(recent)
      } else {
        // For non-logged in users, show trending as personalized
        setPersonalizedTours(trending.slice(0, limit))
        setRecentlyViewed([])
      }
    } catch (err) {
      console.error('Error fetching personalized tours:', err)
      setError(err.message)
      // Fallback to showing all tours
      setPersonalizedTours(allTours.slice(0, limit))
      setTrendingTours(allTours.slice(0, limit))
    } finally {
      setLoading(false)
    }
  }, [user?.uid, allTours, limit])

  useEffect(() => {
    fetchPersonalizedData()
  }, [fetchPersonalizedData])

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchPersonalizedData()
  }, [fetchPersonalizedData])

  return {
    personalizedTours,
    trendingTours,
    recentlyViewed,
    loading,
    error,
    refetch
  }
}

/**
 * Hook to get user preferences (for display purposes)
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
        const { getUserCRMProfile } = await import('../lib/firestore')
        const profile = await getUserCRMProfile(user.uid)
        setPreferences(profile)
      } catch (err) {
        console.error('Error fetching user preferences:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user?.uid])

  return { preferences, loading }
}
