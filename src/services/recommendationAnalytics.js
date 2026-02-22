/**
 * Recommendation Analytics Service
 * Netflix/Amazon-style recommendation performance tracking
 * 
 * This service tracks and analyzes recommendation effectiveness,
 * user engagement with recommendations, and provides insights
 * for improving the recommendation algorithms.
 */

import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

class RecommendationAnalytics {
  constructor() {
    this.analyticsCache = new Map();
    this.performanceMetrics = {
      clickThroughRate: 0,
      conversionRate: 0,
      userEngagementScore: 0,
      recommendationAccuracy: 0
    };
  }

  /**
   * Track recommendation impression
   * @param {string} userId - User ID
   * @param {string} tourId - Tour ID
   * @param {Object} recommendationData - Recommendation metadata
   */
  async trackImpression(userId, tourId, recommendationData) {
    try {
      const impressionData = {
        userId,
        tourId,
        recommendationSource: recommendationData.source || 'unknown',
        algorithmUsed: recommendationData.algorithm || 'unknown',
        position: recommendationData.position || 0,
        score: recommendationData.score || 0,
        timestamp: new Date().toISOString(),
        type: 'impression'
      };

      await addDoc(collection(db, 'recommendationEvents'), impressionData);
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }

  /**
   * Track user interaction with recommendation
   * @param {string} userId - User ID
   * @param {string} tourId - Tour ID
   * @param {string} interactionType - Type of interaction (click, view, save, like, etc.)
   * @param {Object} context - Additional context about the interaction
   */
  async trackInteraction(userId, tourId, interactionType, context = {}) {
    try {
      const interactionData = {
        userId,
        tourId,
        interactionType,
        context,
        timestamp: new Date().toISOString(),
        type: 'interaction'
      };

      await addDoc(collection(db, 'recommendationEvents'), interactionData);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Track recommendation effectiveness
   * @param {string} userId - User ID
   * @param {string} recommendedTourId - ID of recommended tour
   * @param {boolean} wasEffective - Whether the recommendation was effective
   * @param {Object} metrics - Additional effectiveness metrics
   */
  async trackEffectiveness(userId, recommendedTourId, wasEffective, metrics = {}) {
    try {
      const effectivenessData = {
        userId,
        recommendedTourId,
        wasEffective,
        metrics,
        timestamp: new Date().toISOString(),
        type: 'effectiveness'
      };

      await addDoc(collection(db, 'recommendationEvents'), effectivenessData);
    } catch (error) {
      console.error('Error tracking effectiveness:', error);
    }
  }

  /**
   * Calculate recommendation performance metrics
   * @param {string} userId - User ID
   * @returns {Object} Performance metrics for the user
   */
  async calculateUserMetrics(userId) {
    if (this.analyticsCache.has(userId)) {
      return this.analyticsCache.get(userId);
    }

    try {
      // Get all recommendation events for this user
      const eventsQuery = query(
        collection(db, 'recommendationEvents'),
        where('userId', '==', userId)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data());

      // Calculate metrics
      const impressions = events.filter(e => e.type === 'impression');
      const interactions = events.filter(e => e.type === 'interaction');
      const effectiveness = events.filter(e => e.type === 'effectiveness');

      const metrics = {
        totalImpressions: impressions.length,
        totalInteractions: interactions.length,
        totalEffectiveness: effectiveness.length,
        clickThroughRate: impressions.length > 0 ? 
          (interactions.filter(i => i.interactionType === 'click').length / impressions.length) * 100 : 0,
        engagementRate: impressions.length > 0 ? 
          (interactions.length / impressions.length) * 100 : 0,
        effectivenessRate: effectiveness.length > 0 ? 
          (effectiveness.filter(e => e.wasEffective).length / effectiveness.length) * 100 : 0
      };

      // Cache the results
      this.analyticsCache.set(userId, metrics);

      return metrics;
    } catch (error) {
      console.error('Error calculating user metrics:', error);
      return {
        totalImpressions: 0,
        totalInteractions: 0,
        totalEffectiveness: 0,
        clickThroughRate: 0,
        engagementRate: 0,
        effectivenessRate: 0
      };
    }
  }

  /**
   * Calculate global recommendation performance
   * @returns {Object} Global performance metrics
   */
  async calculateGlobalMetrics() {
    try {
      const eventsQuery = query(collection(db, 'recommendationEvents'));
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data());

      const impressions = events.filter(e => e.type === 'impression');
      const interactions = events.filter(e => e.type === 'interaction');
      const effectiveness = events.filter(e => e.type === 'effectiveness');

      return {
        totalImpressions: impressions.length,
        totalInteractions: interactions.length,
        totalEffectiveness: effectiveness.length,
        globalClickThroughRate: impressions.length > 0 ? 
          (interactions.filter(i => i.interactionType === 'click').length / impressions.length) * 100 : 0,
        globalEngagementRate: impressions.length > 0 ? 
          (interactions.length / impressions.length) * 100 : 0,
        globalEffectivenessRate: effectiveness.length > 0 ? 
          (effectiveness.filter(e => e.wasEffective).length / effectiveness.length) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating global metrics:', error);
      return {
        totalImpressions: 0,
        totalInteractions: 0,
        totalEffectiveness: 0,
        globalClickThroughRate: 0,
        globalEngagementRate: 0,
        globalEffectivenessRate: 0
      };
    }
  }

  /**
   * Get recommendation algorithm performance
   * @param {string} algorithmName - Name of the algorithm
   * @returns {Object} Algorithm performance metrics
   */
  async getAlgorithmPerformance(algorithmName) {
    try {
      const eventsQuery = query(
        collection(db, 'recommendationEvents'),
        where('recommendationSource', '==', algorithmName)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => doc.data());

      const impressions = events.filter(e => e.type === 'impression');
      const effectiveness = events.filter(e => e.type === 'effectiveness');

      return {
        totalRecommendations: impressions.length,
        effectivenessCount: effectiveness.length,
        effectivenessRate: effectiveness.length > 0 ? 
          (effectiveness.filter(e => e.wasEffective).length / effectiveness.length) * 100 : 0,
        avgScore: impressions.length > 0 ? 
          impressions.reduce((sum, imp) => sum + (imp.score || 0), 0) / impressions.length : 0
      };
    } catch (error) {
      console.error('Error getting algorithm performance:', error);
      return {
        totalRecommendations: 0,
        effectivenessCount: 0,
        effectivenessRate: 0,
        avgScore: 0
      };
    }
  }

  /**
   * Update recommendation model based on performance data
   * This simulates a reinforcement learning approach
   * @param {string} userId - User ID
   * @param {string} algorithmName - Name of the algorithm to update
   * @param {number} performanceScore - Performance score (0-100)
   */
  async updateModel(userId, algorithmName, performanceScore) {
    try {
      // In a real implementation, this would update model parameters
      // For now, we'll just log the update for analysis
      
      const updateData = {
        userId,
        algorithmName,
        performanceScore,
        timestamp: new Date().toISOString(),
        type: 'modelUpdate'
      };

      await addDoc(collection(db, 'recommendationEvents'), updateData);

      // Update local performance metrics
      if (performanceScore > 0) {
        this.performanceMetrics.recommendationAccuracy = 
          (this.performanceMetrics.recommendationAccuracy + performanceScore) / 2;
      }
    } catch (error) {
      console.error('Error updating model:', error);
    }
  }

  /**
   * Get user preference evolution over time
   * @param {string} userId - User ID
   * @returns {Object} Preference evolution data
   */
  async getUserPreferenceEvolution(userId) {
    try {
      // This would analyze how user preferences change over time
      // For now, return a simulated result
      
      const metrics = await this.calculateUserMetrics(userId);
      
      return {
        preferenceStability: metrics.effectivenessRate > 70 ? 'stable' : 
                           metrics.effectivenessRate > 40 ? 'moderate' : 'volatile',
        engagementTrend: metrics.engagementRate > 5 ? 'increasing' : 
                        metrics.engagementRate > 2 ? 'stable' : 'decreasing',
        preferenceDriftRate: 0.1, // Simulated drift rate
        lastPreferenceUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting preference evolution:', error);
      return {
        preferenceStability: 'unknown',
        engagementTrend: 'unknown',
        preferenceDriftRate: 0,
        lastPreferenceUpdate: null
      };
    }
  }

  /**
   * Reset analytics cache
   */
  resetCache() {
    this.analyticsCache.clear();
  }
}

// Export singleton instance
export const recommendationAnalytics = new RecommendationAnalytics();

/**
 * Hook for tracking recommendation events
 */
export function useRecommendationTracking() {
  const trackImpression = (userId, tourId, recommendationData) => {
    if (userId && tourId) {
      recommendationAnalytics.trackImpression(userId, tourId, recommendationData);
    }
  };

  const trackInteraction = (userId, tourId, interactionType, context = {}) => {
    if (userId && tourId) {
      recommendationAnalytics.trackInteraction(userId, tourId, interactionType, context);
    }
  };

  const trackEffectiveness = (userId, recommendedTourId, wasEffective, metrics = {}) => {
    if (userId && recommendedTourId) {
      recommendationAnalytics.trackEffectiveness(userId, recommendedTourId, wasEffective, metrics);
    }
  };

  return {
    trackImpression,
    trackInteraction,
    trackEffectiveness
  };
}