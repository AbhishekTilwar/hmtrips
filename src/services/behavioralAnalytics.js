/**
 * Advanced Behavioral Analytics Engine
 * Netflix/Amazon-style recommendation system
 * 
 * This system analyzes user behavior patterns to PREDICT what users want,
 * not just show what they've interacted with.
 * 
 * Core Philosophy: Optimize for engagement time and user satisfaction,
 * not just interaction counts.
 */

import { collection, query, where, orderBy, limit, getDocs, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { enhancedRecommendationEngine } from './enhancedRecommendationEngine'
import { calculateUserPreferenceScore, calculatePopularityScore, calculateContentSimilarity } from './recommendationAlgorithms'
import { recommendationAnalytics } from './recommendationAnalytics'

/**
 * Behavioral Data Collector
 * Tracks implicit user signals beyond basic interactions
 */
class BehavioralTracker {
  constructor() {
    this.sessionData = {}
    this.behavioralSignals = new Map()
  }

  /**
   * Track detailed viewing behavior
   * @param {string} userId - User ID
   * @param {string} tourId - Tour ID
   * @param {Object} behaviorData - Detailed behavior metrics
   */
  trackViewingBehavior(userId, tourId, behaviorData) {
    const signal = {
      userId,
      tourId,
      timestamp: Date.now(),
      ...behaviorData,
      // Implicit signals
      timeSpent: behaviorData.timeSpent || 0,
      scrollDepth: behaviorData.scrollDepth || 0,
      interactionPoints: behaviorData.interactions || [],
      attentionScore: this.calculateAttentionScore(behaviorData),
      engagementQuality: this.calculateEngagementQuality(behaviorData)
    }

    // Store in behavioral signals map
    const key = `${userId}_${tourId}_${Date.now()}`
    this.behavioralSignals.set(key, signal)

    // Update user profile with behavioral insights
    this.updateUserBehaviorProfile(userId, tourId, signal)
  }

  /**
   * Calculate attention score based on user behavior
   * @param {Object} behaviorData - Behavior metrics
   * @returns {number} Attention score (0-100)
   */
  calculateAttentionScore(behaviorData) {
    let score = 0
    
    // Time spent (40% weight)
    if (behaviorData.timeSpent) {
      const timeMinutes = behaviorData.timeSpent / 60000
      score += Math.min(40, timeMinutes * 8) // Cap at 40 points
    }
    
    // Scroll depth (30% weight)
    if (behaviorData.scrollDepth) {
      score += behaviorData.scrollDepth * 30
    }
    
    // Interaction quality (30% weight)
    if (behaviorData.interactions) {
      const interactionCount = behaviorData.interactions.length
      score += Math.min(30, interactionCount * 10)
    }
    
    return Math.min(100, score)
  }

  /**
   * Calculate engagement quality
   * @param {Object} behaviorData - Behavior metrics
   * @returns {number} Quality score (0-100)
   */
  calculateEngagementQuality(behaviorData) {
    let quality = 0
    
    // Deep engagement signals
    if (behaviorData.timeSpent > 60000) quality += 25 // 1+ minute
    if (behaviorData.timeSpent > 180000) quality += 25 // 3+ minutes
    if (behaviorData.scrollDepth > 0.8) quality += 25 // 80%+ scroll
    if (behaviorData.interactions?.length > 3) quality += 25 // Multiple interactions
    
    return Math.min(100, quality)
  }

  /**
   * Update user behavior profile with insights
   */
  async updateUserBehaviorProfile(userId, tourId, signal) {
    try {
      const userRef = doc(db, 'userBehaviorProfiles', userId)
      const tourRef = doc(db, 'tours', tourId)
      
      // Get tour data for analysis
      const tourSnap = await getDoc(tourRef)
      if (!tourSnap.exists()) return
      
      const tourData = tourSnap.data()
      
      // Build behavioral profile update
      const profileUpdate = {
        lastActive: new Date().toISOString(),
        totalEngagementTime: signal.timeSpent,
        attentionMetrics: {
          averageAttention: signal.attentionScore,
          engagementQuality: signal.engagementQuality
        },
        preferencePatterns: this.extractPreferencePatterns(signal, tourData),
        behavioralTrends: this.analyzeBehavioralTrends(userId)
      }
      
      await setDoc(userRef, profileUpdate, { merge: true })
    } catch (error) {
      console.error('Error updating behavior profile:', error)
    }
  }

  /**
   * Extract preference patterns from behavior
   */
  extractPreferencePatterns(signal, tourData) {
    const patterns = {}
    
    // Price sensitivity pattern
    if (tourData.pricePerGuest) {
      patterns.priceRange = this.categorizePrice(tourData.pricePerGuest)
    }
    
    // Destination type preference
    if (tourData.vibe) {
      patterns.destinationType = tourData.vibe
    }
    
    // Duration preference
    if (tourData.nights) {
      patterns.preferredDuration = this.categorizeDuration(tourData.nights)
    }
    
    // Engagement quality correlation
    patterns.engagementCorrelation = {
      highAttention: signal.attentionScore > 70,
      qualityEngagement: signal.engagementQuality > 60
    }
    
    return patterns
  }

  /**
   * Categorize price ranges
   */
  categorizePrice(price) {
    if (price < 5000) return 'budget'
    if (price < 15000) return 'mid'
    if (price < 30000) return 'premium'
    return 'luxury'
  }

  /**
   * Categorize trip duration
   */
  categorizeDuration(nights) {
    if (nights <= 3) return 'short'
    if (nights <= 7) return 'medium'
    return 'long'
  }

  /**
   * Analyze behavioral trends for user
   */
  analyzeBehavioralTrends(userId) {
    // This would analyze historical behavioral data
    // For now, return basic trend analysis
    return {
      activityLevel: 'moderate',
      preferenceStability: 'stable',
      engagementTrend: 'positive'
    }
  }
}

// Singleton instance
export const behavioralTracker = new BehavioralTracker()

/**
 * Advanced Recommendation Engine
 * Netflix-style predictive recommendations
 */
class AdvancedRecommendationEngine {
  constructor() {
    this.userProfiles = new Map()
    this.contentFeatures = new Map()
    this.similarityCache = new Map()
    
    // Integrate enhanced recommendation algorithms
    this.enhancedEngine = enhancedRecommendationEngine
  }

  /**
   * Generate predictive recommendations
   * @param {string} userId - User ID
   * @param {Array} allTours - All available tours
   * @param {Object} options - Recommendation options
   * @returns {Array} Recommended tours
   */
  async generateRecommendations(userId, allTours, options = {}) {
    const {
      limit = 12,
      diversity = true,
      excludeViewed = true
    } = options

    try {
      // Use the enhanced recommendation engine
      const recommendations = await this.enhancedEngine.generateRecommendations(userId, allTours, {
        ...options,
        limit,
        diversity,
        excludeViewed
      });
      
      // Track the recommendation generation for analytics
      for (let i = 0; i < recommendations.length; i++) {
        await recommendationAnalytics.trackImpression(
          userId, 
          recommendations[i].id, 
          {
            source: 'enhancedRecommendationEngine',
            algorithm: 'hybrid',
            position: i,
            score: recommendations[i].predictiveScore || recommendations[i].scores?.final || 0
          }
        );
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to trending
      return this.getTrendingFallback(allTours, limit)
    }
  }

  /**
   * Get user behavior profile
   */
  async getUserBehaviorProfile(userId) {
    // Delegate to enhanced engine
    return await this.enhancedEngine.getUserBehaviorProfile(userId)
  }

  /**
   * Create default behavior profile
   */
  createDefaultProfile(userId) {
    return {
      userId,
      preferencePatterns: {
        priceRange: 'mid',
        destinationType: 'urban',
        preferredDuration: 'medium',
        engagementCorrelation: {
          highAttention: false,
          qualityEngagement: false
        }
      },
      attentionMetrics: {
        averageAttention: 50,
        engagementQuality: 50
      },
      behavioralTrends: {
        activityLevel: 'new',
        preferenceStability: 'unknown',
        engagementTrend: 'neutral'
      }
    }
  }

  /**
   * Score tours using the enhanced algorithm
   */
  async scoreToursForUser(userProfile, allTours, excludeViewed) {
    // Delegate to enhanced engine
    return await this.enhancedEngine.scoreToursWithMultipleAlgorithms(userProfile, allTours, excludeViewed)
  }

  /**
   * Calculate content matching score
   */
  calculateContentMatchScore(tour, preferences) {
    // Use the enhanced algorithm
    return calculateContentSimilarity(tour, tour) * 100
  }

  /**
   * Calculate behavioral prediction score
   */
  calculateBehavioralPredictionScore(tour, attentionMetrics) {
    // Use the enhanced algorithm
    // This would require passing the full user profile, so we'll use a default
    return 50
  }

  /**
   * Calculate popularity score
   */
  calculatePopularityScore(tour) {
    // Use the enhanced algorithm
    return calculatePopularityScore(tour)
  }

  /**
   * Calculate novelty/discovery score
   */
  calculateNoveltyScore(tour, userProfile) {
    // Use the enhanced algorithm
    return this.enhancedEngine.calculateNoveltyScore(tour, userProfile)
  }

  /**
   * Rank and filter tours
   */
  rankAndFilter(scoredTours, limit) {
    return this.enhancedEngine.rankAndFilter(scoredTours, limit)
  }

  /**
   * Ensure diversity in recommendations
   */
  ensureDiversity(tours, limit) {
    return this.enhancedEngine.ensureDiversity(tours, limit)
  }

  /**
   * Helper methods
   */
  hasUserViewed(userId, tourId) {
    // This would check user's viewing history
    // For now, return false to include all tours
    return false
  }

  isSeasonallyRelevant(tour) {
    // Check if tour is relevant for current season
    const currentMonth = new Date().getMonth()
    // Simplified seasonal logic
    return true
  }

  calculateContentCompleteness(tour) {
    // Check how complete the tour information is
    const requiredFields = ['name', 'destination', 'pricePerGuest', 'nights', 'image']
    const availableFields = requiredFields.filter(field => tour[field])
    return availableFields.length / requiredFields.length
  }

  assessContentComplexity(tour) {
    // Assess how complex/detailed the tour content is
    const hasGallery = (tour.highlightImages || []).length > 0
    const hasDetailedItinerary = (tour.itinerary || []).length > 3
    const hasAboutDestination = !!tour.aboutDestination
    
    const complexityScore = (hasGallery ? 1 : 0) + (hasDetailedItinerary ? 1 : 0) + (hasAboutDestination ? 1 : 0)
    return complexityScore >= 2 ? 'high' : 'low'
  }

  getTrendingFallback(allTours, limit) {
    return this.enhancedEngine.getTrendingFallback(allTours, limit)
  }
}

// Export singleton instance
export const recommendationEngine = new AdvancedRecommendationEngine()

/**
 * Hook for behavioral tracking
 */
export function useBehavioralTracking() {
  const trackBehavior = (userId, tourId, behaviorData) => {
    if (userId && tourId) {
      behavioralTracker.trackViewingBehavior(userId, tourId, behaviorData)
    }
  }

  return { trackBehavior }
}

/**
 * Hook for advanced recommendations
 */
export function useAdvancedRecommendations(user, allTours, options = {}) {
  
  const getRecommendations = async (limit = 12) => {
    if (!user?.uid || !allTours?.length) {
      return []
    }
    
    return await recommendationEngine.generateRecommendations(
      user.uid, 
      allTours, 
      { limit, ...options }
    )
  }

  return { getRecommendations }
}