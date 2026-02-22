/**
 * Enhanced Recommendations Hook
 * Netflix/Amazon-style recommendation system with advanced algorithms
 * 
 * Features:
 * - Collaborative filtering (user-based and item-based)
 * - Content-based filtering (tour attributes)
 * - Hybrid recommendation approach
 * - Real-time trend analysis
 * - Personalized scoring algorithms
 * - Behavioral tracking integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { enhancedRecommendationEngine } from '../services/enhancedRecommendationEngine';
import { recommendationAnalytics } from '../services/recommendationAnalytics';

export function useEnhancedRecommendations(tours = [], options = {}) {
  const { user } = useAuth();
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendationStats, setRecommendationStats] = useState({
    totalGenerated: 0,
    uniqueTours: 0,
    algorithmDistribution: {}
  });

  const {
    limit = 12,
    enableDiversity = true,
    excludePreviouslyViewed = false,
    enableAnalytics = true,
    algorithmWeights = {}
  } = options;

  // Generate recommendations using the enhanced engine
  const generateRecommendations = useCallback(async (userId, tourList, opts = {}) => {
    if (!userId || !tourList?.length) {
      return {
        recommendations: [],
      };
    }

    setLoading(true);
    
    try {
      // Get comprehensive recommendations from the enhanced engine
      const enhancedRecs = await enhancedRecommendationEngine.generateRecommendations(
        userId,
        tourList,
        { ...opts, limit, diversity: enableDiversity }
      );

      // Separate recommendations by type
      const sortedRecs = [...enhancedRecs].sort((a, b) => b.predictiveScore - a.predictiveScore);
      
      setRecommendations(sortedRecs.slice(0, limit));

      // Update stats
      setRecommendationStats({
        totalGenerated: enhancedRecs.length,
        uniqueTours: new Set(enhancedRecs.map(t => t.id)).size,
        algorithmDistribution: getAlgorithmDistribution(enhancedRecs)
      });

      // Track recommendation generation
      if (enableAnalytics && user) {
        recommendationAnalytics.trackRecommendationGeneration(userId, {
          algorithm: 'enhanced_netflix_style',
          count: enhancedRecs.length,
          timestamp: Date.now()
        });
      }

      return {
        recommendations: sortedRecs.slice(0, limit),
      };
    } catch (error) {
      console.error('Error generating enhanced recommendations:', error);
      
      // Fallback to trending
      const fallbackTours = enhancedRecommendationEngine.getTrendingFallback(tourList, limit);
      setRecommendations(fallbackTours);
      
      return {
        recommendations: fallbackTours,
      };
    } finally {
      setLoading(false);
    }
  }, [limit, enableDiversity, enableAnalytics, user]);

  // Track user interaction with recommendations
  const trackTourInteraction = useCallback(async (tourId, action, metadata = {}) => {
    if (!user || !tourId) return;

    try {
      // Track the interaction
      await recommendationAnalytics.trackInteraction(user.uid, tourId, {
        action,
        timestamp: Date.now(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking tour interaction:', error);
    }
  }, [user]);

  // Track recommendation clicks
  const trackRecommendationClick = useCallback(async (userId, tourId, source = 'unknown') => {
    if (!userId || !tourId) return;

    try {
      await recommendationAnalytics.trackClick(userId, tourId, {
        source,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error tracking recommendation click:', error);
    }
  }, []);

  // Track recommendation impressions
  const trackRecommendationImpression = useCallback(async (userId, tourId, position, metadata = {}) => {
    if (!userId || !tourId || position === undefined) return;

    try {
      await recommendationAnalytics.trackImpression(userId, tourId, {
        position,
        timestamp: Date.now(),
        ...metadata
      });
    } catch (error) {
      console.error('Error tracking recommendation impression:', error);
    }
  }, []);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (user && tours.length > 0) {
      await generateRecommendations(user.uid, tours, options);
    }
  }, [user, tours, options, generateRecommendations]);

  // Effect to generate initial recommendations
  useEffect(() => {
    if (user && tours.length > 0) {
      generateRecommendations(user.uid, tours, options);
    }
  }, [user, tours, options, generateRecommendations]);

  // Return all the necessary values and functions
  return {
    recommendations,
    loading,
    recommendationStats,
    trackTourInteraction,
    trackRecommendationClick,
    trackRecommendationImpression,
    refreshRecommendations,
    generateRecommendations
  };
}

// Additional utility functions for the recommendation system

/**
 * Get algorithm distribution from recommendations
 */
export function getAlgorithmDistribution(recommendations) {
  if (!recommendations || !recommendations.length) {
    return {};
  }
  
  const distribution = {};
  
  // Safely check for algorithm contributions
  recommendations.forEach(rec => {
    if (rec.algorithmContributions) {
      Object.keys(rec.algorithmContributions).forEach(algorithm => {
        distribution[algorithm] = (distribution[algorithm] || 0) + 1;
      });
    }
  });
  
  return distribution;
}

/**
 * Calculate prediction accuracy metrics
 */
export function calculatePredictionAccuracy(predictions, actualInteractions) {
  // This would be implemented based on actual user behavior data
  // For now, returning placeholder metrics
  return {
    precision: 0.75,
    recall: 0.65,
    f1Score: 0.70,
    coverage: 0.80
  };
}

/**
 * Get recommendation diversity metrics
 */
export function getDiversityMetrics(recommendations) {
  if (!recommendations.length) return { diversityScore: 0, categorySpread: 0 };

  const categories = new Set(recommendations.map(tour => tour.vibe || tour.tag));
  const destinations = new Set(recommendations.map(tour => tour.destination));
  
  const categoryDiversity = categories.size / recommendations.length;
  const destinationDiversity = destinations.size / recommendations.length;
  
  return {
    diversityScore: (categoryDiversity + destinationDiversity) / 2,
    categorySpread: categoryDiversity,
    destinationSpread: destinationDiversity,
    totalCategories: categories.size,
    totalDestinations: destinations.size
  };
}