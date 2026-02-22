/**
 * Enhanced Behavioral Tracking Service
 * Collects detailed user behavior data for advanced recommendations
 */

import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

class EnhancedBehavioralTracker {
  constructor() {
    this.sessionData = {};
    this.behavioralSignals = new Map();
  }

  /**
   * Track detailed user behavior for recommendations
   */
  async trackUserBehavior(userId, tourId, behaviorData) {
    if (!userId || !tourId) return;

    const behaviorEvent = {
      userId,
      tourId,
      timestamp: serverTimestamp(),
      ...behaviorData,
      eventType: 'behavioral_signal'
    };

    try {
      await addDoc(collection(db, 'userBehaviorEvents'), behaviorEvent);
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  /**
   * Track session data
   */
  async trackSessionData(userId, sessionData) {
    if (!userId) return;

    const sessionId = this.generateSessionId();
    const sessionEvent = {
      userId,
      sessionId,
      ...sessionData,
      timestamp: serverTimestamp(),
      eventType: 'session_data'
    };

    try {
      await addDoc(collection(db, 'userSessions'), sessionEvent);
    } catch (error) {
      console.error('Error tracking session data:', error);
    }
  }

  /**
   * Track search behavior
   */
  async trackSearchBehavior(userId, searchData) {
    if (!userId) return;

    const searchEvent = {
      userId,
      ...searchData,
      timestamp: serverTimestamp(),
      eventType: 'search_behavior'
    };

    try {
      await addDoc(collection(db, 'userSearchEvents'), searchEvent);
    } catch (error) {
      console.error('Error tracking search behavior:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Calculate engagement metrics
   */
  calculateEngagementMetrics(behaviorData) {
    const {
      timeSpent = 0,
      scrollDepth = 0,
      interactions = [],
      clicks = 0,
      hovers = 0
    } = behaviorData;

    // Calculate engagement score based on multiple factors
    const timeScore = Math.min(100, (timeSpent / 1000) * 2); // Up to 50 seconds = 100 points
    const scrollScore = scrollDepth * 100;
    const interactionScore = interactions.length * 10;
    const clickScore = clicks * 5;
    const hoverScore = hovers * 2;

    const totalScore = (timeScore * 0.3) + (scrollScore * 0.2) + (interactionScore * 0.2) + 
                      (clickScore * 0.2) + (hoverScore * 0.1);

    return {
      engagementScore: Math.min(100, totalScore),
      timeEngagement: timeScore,
      scrollEngagement: scrollScore,
      interactionEngagement: interactionScore
    };
  }

  /**
   * Get user behavior profile
   */
  async getUserBehaviorProfile(userId) {
    if (!userId) return null;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return this.createDefaultProfile(userId);
      }

      return userSnap.data();
    } catch (error) {
      console.error('Error fetching user behavior profile:', error);
      return this.createDefaultProfile(userId);
    }
  }

  /**
   * Create default user profile
   */
  createDefaultProfile(userId) {
    return {
      userId,
      preferences: {
        destinations: [],
        budgets: [],
        tripTypes: [],
        seasons: [],
        activities: []
      },
      behaviorMetrics: {
        avgTimeSpent: 0,
        avgScrollDepth: 0,
        interactionRate: 0,
        preferenceStability: 'low'
      },
      engagementHistory: [],
      similarUsers: []
    };
  }

  /**
   * Update user behavior profile
   */
  async updateUserProfile(userId, behaviorUpdates) {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // User exists, update the profile
        const userData = userSnap.data();
        
        // Merge new behavior data with existing profile
        const updatedProfile = {
          ...userData,
          ...behaviorUpdates,
          lastUpdated: serverTimestamp()
        };

        await updateDoc(userRef, updatedProfile);
      } else {
        // User doesn't exist, create with default profile
        const defaultProfile = this.createDefaultProfile(userId);
        const updatedProfile = {
          ...defaultProfile,
          ...behaviorUpdates,
          lastUpdated: serverTimestamp()
        };
        
        await updateDoc(userRef, updatedProfile);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }
}

// Export singleton instance
export const enhancedBehavioralTracker = new EnhancedBehavioralTracker();

/**
 * Hook for enhanced behavioral tracking
 */
export function useEnhancedBehavioralTracking() {
  const trackBehavior = (userId, tourId, behaviorData) => {
    if (userId && tourId) {
      enhancedBehavioralTracker.trackUserBehavior(userId, tourId, behaviorData);
    }
  };

  const trackSearch = (userId, searchData) => {
    if (userId) {
      enhancedBehavioralTracker.trackSearchBehavior(userId, searchData);
    }
  };

  const trackSession = (userId, sessionData) => {
    if (userId) {
      enhancedBehavioralTracker.trackSessionData(userId, sessionData);
    }
  };

  return {
    trackBehavior,
    trackSearch,
    trackSession
  };
}