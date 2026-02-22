/**
 * User Engagement Tracking Service
 * Tracks detailed user behavior for Netflix-style recommendations
 */

import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

class UserEngagementTracker {
  constructor() {
    this.sessionData = {};
    this.engagementMetrics = new Map();
  }

  /**
   * Track detailed tour engagement
   */
  async trackTourEngagement(userId, tourId, engagementData) {
    if (!userId || !tourId) return;

    const engagementEvent = {
      userId,
      tourId,
      timestamp: serverTimestamp(),
      ...engagementData,
      eventType: 'tour_engagement'
    };

    try {
      await addDoc(collection(db, 'userEngagementEvents'), engagementEvent);
      
      // Update user's engagement profile
      await this.updateEngagementProfile(userId, tourId, engagementData);
    } catch (error) {
      console.error('Error tracking tour engagement:', error);
    }
  }

  /**
   * Track session engagement
   */
  async trackSessionEngagement(userId, sessionData) {
    if (!userId) return;

    const sessionId = this.generateSessionId();
    const sessionEvent = {
      userId,
      sessionId,
      ...sessionData,
      timestamp: serverTimestamp(),
      eventType: 'session_engagement'
    };

    try {
      await addDoc(collection(db, 'userSessionEvents'), sessionEvent);
    } catch (error) {
      console.error('Error tracking session engagement:', error);
    }
  }

  /**
   * Track search engagement
   */
  async trackSearchEngagement(userId, searchData) {
    if (!userId) return;

    const searchEvent = {
      userId,
      ...searchData,
      timestamp: serverTimestamp(),
      eventType: 'search_engagement'
    };

    try {
      await addDoc(collection(db, 'userSearchEngagement'), searchEvent);
    } catch (error) {
      console.error('Error tracking search engagement:', error);
    }
  }

  /**
   * Update user's engagement profile based on new data
   */
  async updateEngagementProfile(userId, tourId, engagementData) {
    if (!userId) return;

    try {
      const userRef = doc(db, 'userEngagementProfiles', userId);
      const userSnap = await getDoc(userRef);

      let profile = userSnap.exists() ? userSnap.data() : this.createDefaultEngagementProfile(userId);
      
      // Update engagement metrics
      profile = this.calculateUpdatedEngagementMetrics(profile, engagementData);
      
      // Update the document
      await updateDoc(userRef, profile);
    } catch (error) {
      console.error('Error updating engagement profile:', error);
    }
  }

  /**
   * Calculate updated engagement metrics
   */
  calculateUpdatedEngagementMetrics(profile, engagementData) {
    const {
      timeSpent = 0,
      scrollDepth = 0,
      interactions = [],
      clicks = 0,
      hovers = 0,
      completionRate = 0
    } = engagementData;

    // Update metrics
    const newAvgTimeSpent = (profile.metrics.avgTimeSpent + timeSpent) / 2;
    const newAvgScrollDepth = (profile.metrics.avgScrollDepth + scrollDepth) / 2;
    const newInteractionRate = (profile.metrics.interactionRate + interactions.length) / 2;
    
    return {
      ...profile,
      metrics: {
        ...profile.metrics,
        avgTimeSpent: newAvgTimeSpent,
        avgScrollDepth: newAvgScrollDepth,
        interactionRate: newInteractionRate,
        // Engagement quality score based on multiple factors
        engagementQuality: this.calculateEngagementQuality({
          timeSpent,
          scrollDepth,
          interactions: interactions.length,
          clicks,
          hovers
        })
      },
      lastUpdated: serverTimestamp()
    };
  }

  /**
   * Calculate engagement quality score
   */
  calculateEngagementQuality(engagementData) {
    const {
      timeSpent = 0,
      scrollDepth = 0,
      interactions = 0,
      clicks = 0,
      hovers = 0
    } = engagementData;

    // Calculate weighted engagement quality score
    const timeScore = Math.min(100, (timeSpent / 1000) * 2); // Up to 50 seconds = 100 points
    const scrollScore = scrollDepth * 100;
    const interactionScore = interactions * 10;
    const clickScore = clicks * 5;
    const hoverScore = hovers * 2;

    const totalScore = (timeScore * 0.3) + (scrollScore * 0.2) + (interactionScore * 0.2) + 
                      (clickScore * 0.2) + (hoverScore * 0.1);

    return Math.min(100, totalScore);
  }

  /**
   * Create default engagement profile
   */
  createDefaultEngagementProfile(userId) {
    return {
      userId,
      metrics: {
        avgTimeSpent: 0,
        avgScrollDepth: 0,
        interactionRate: 0,
        engagementQuality: 0
      },
      preferences: {
        attentionSpan: 'medium',
        interactionPattern: 'casual',
        engagementLevel: 'new'
      },
      trends: {
        activityLevel: 'new',
        preferenceStability: 'unknown',
        engagementTrend: 'neutral'
      },
      lastUpdated: serverTimestamp()
    };
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const userEngagementTracker = new UserEngagementTracker();

/**
 * Hook for user engagement tracking
 */
export function useUserEngagementTracking() {
  const trackEngagement = (userId, tourId, engagementData) => {
    if (userId && tourId) {
      userEngagementTracker.trackTourEngagement(userId, tourId, engagementData);
    }
  };

  const trackSession = (userId, sessionData) => {
    if (userId) {
      userEngagementTracker.trackSessionEngagement(userId, sessionData);
    }
  };

  const trackSearch = (userId, searchData) => {
    if (userId) {
      userEngagementTracker.trackSearchEngagement(userId, searchData);
    }
  };

  return {
    trackEngagement,
    trackSession,
    trackSearch
  };
}