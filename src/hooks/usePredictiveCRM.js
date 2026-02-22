import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { behavioralTracker } from '../services/behavioralAnalytics'
import { enhancedRecommendationEngine } from '../services/enhancedRecommendationEngine'
import { useAdvancedRecommendations } from '../services/behavioralAnalytics'

/**
 * Enhanced Predictive CRM Hook
 * Netflix/Amazon-style recommendation system 
 * 
 * This hook provides predictive recommendations based on advanced behavioral analysis
 * and machine learning algorithms similar to Netflix's recommendation engine.
 */
export const usePredictiveCRM = (tours = []) => {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Use the advanced recommendation system
  const { getRecommendations } = useAdvancedRecommendations(user, tours)

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user || tours.length === 0) {
        setLoading(false)
        return
      }

      try {
        // Get user's behavioral profile using the enhanced recommendation engine
        const userProfile = await enhancedRecommendationEngine.getUserBehaviorProfile(user.uid)
        
        // Get enhanced recommendations using Netflix-style algorithms
        const enhancedRecs = await enhancedRecommendationEngine.generateRecommendations(
          user.uid,
          tours,
          { limit: 24, diversity: true, excludeViewed: true }
        )
        
        // Separate recommendations by type
        const predictive = enhancedRecs.slice(0, 6)
        const trending = enhancedRecommendationEngine.getTrendingFallback(tours, 6)
        const discovery = enhancedRecs.slice(12, 18)
        const collaborative = await enhancedRecommendationEngine.getCollaborativeRecommendations(
          user.uid,
          tours
        )
        
        setPredictions({
          predictive,
          trending,
          discovery,
          collaborative: collaborative.slice(0, 6)
        })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching predictive CRM data:', err)
        
        // Fallback to basic recommendations
        try {
          const basicRecs = await getRecommendations(18)
          setPredictions({
            predictive: basicRecs.slice(0, 6),
            trending: basicRecs.slice(6, 12),
            discovery: basicRecs.slice(12, 18),
            collaborative: basicRecs.slice(0, 6)
          })
        } catch (fallbackErr) {
          console.error('Error with fallback recommendations:', fallbackErr)
          setPredictions({
            predictive: tours.slice(0, 6),
            trending: tours.slice(6, 12),
            discovery: tours.slice(12, 18),
            collaborative: tours.slice(0, 6)
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [user, tours, getRecommendations])

  return { predictions, loading, error }
}