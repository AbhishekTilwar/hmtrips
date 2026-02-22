/**
 * Collaborative Filtering Service
 * Implements user-user and item-item collaborative filtering
 */

import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';

class CollaborativeFilteringEngine {
  constructor() {
    this.userSimilarityCache = new Map();
    this.itemSimilarityCache = new Map();
  }

  /**
   * Find users with similar preferences
   */
  async findSimilarUsers(currentUserId, allUsers, tourInteractions) {
    if (!currentUserId || !allUsers.length) return [];

    try {
      // Get current user's interactions
      const currentUserInteractions = await this.getUserInteractions(currentUserId);
      
      const similarityScores = allUsers.map(user => {
        if (user.userId === currentUserId) return { userId: user.userId, score: 0 };

        // Calculate similarity based on common interactions
        const otherUserInteractions = tourInteractions[user.userId] || [];
        const similarity = this.calculateUserSimilarity(currentUserInteractions, otherUserInteractions);
        
        return { userId: user.userId, score: similarity };
      });

      // Sort by similarity score and return top matches
      return similarityScores
        .filter(user => user.score > 0.1) // Only users with >10% similarity
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 similar users
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Calculate user similarity score
   */
  calculateUserSimilarity(interactions1, interactions2) {
    if (!interactions1.length || !interactions2.length) return 0;

    // Find common tours between users
    const commonTours = this.findCommonItems(interactions1, interactions2, 'tourId');
    
    if (commonTours.length < 2) return 0; // Need at least 2 common items for meaningful similarity

    // Extract ratings/interactions for common tours
    const user1Values = commonTours.map(tourId => {
      const interaction = interactions1.find(i => i.tourId === tourId);
      return this.getInteractionValue(interaction);
    });

    const user2Values = commonTours.map(tourId => {
      const interaction = interactions2.find(i => i.tourId === tourId);
      return this.getInteractionValue(interaction);
    });

    // Calculate Pearson correlation coefficient
    return this.pearsonCorrelation(user1Values, user2Values);
  }

  /**
   * Get interaction value for similarity calculation
   */
  getInteractionValue(interaction) {
    if (!interaction) return 0;
    
    // Weight different types of interactions
    const weights = {
      'view': 1,
      'like': 3,
      'save': 4,
      'share': 5,
      'book': 10
    };

    return weights[interaction.action] || 1;
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  pearsonCorrelation(values1, values2) {
    if (values1.length !== values2.length || values1.length === 0) return 0;

    const n = values1.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (let i = 0; i < n; i++) {
      sum1 += values1[i];
      sum2 += values2[i];
      sum1Sq += values1[i] * values1[i];
      sum2Sq += values2[i] * values2[i];
      pSum += values1[i] * values2[i];
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    if (den === 0) return 0;
    return num / den;
  }

  /**
   * Find common items between two arrays
   */
  findCommonItems(array1, array2, key) {
    const set1 = new Set(array1.map(item => item[key]));
    const set2 = new Set(array2.map(item => item[key]));
    
    return [...set1].filter(item => set2.has(item));
  }

  /**
   * Get user interactions from Firestore
   */
  async getUserInteractions(userId) {
    try {
      const interactionsRef = collection(db, 'userInteractions');
      const q = query(interactionsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  }

  /**
   * Get tours liked by similar users (collaborative filtering)
   */
  async getToursFromSimilarUsers(userId, similarUserIds, allTours) {
    if (!similarUserIds.length || !allTours.length) return [];

    try {
      const recommendations = [];
      const userTours = new Set(); // Tours the current user has already interacted with

      // Get current user's tour interactions
      const currentUserInteractions = await this.getUserInteractions(userId);
      currentUserInteractions.forEach(interaction => {
        userTours.add(interaction.tourId);
      });

      // Get interactions from similar users
      for (const similarUserId of similarUserIds) {
        const similarUserInteractions = await this.getUserInteractions(similarUserId);
        
        similarUserInteractions.forEach(interaction => {
          // Only consider interactions with high weight
          if (this.getInteractionValue(interaction) >= 3 && !userTours.has(interaction.tourId)) {
            const tour = allTours.find(t => t.id === interaction.tourId);
            if (tour) {
              const existingRec = recommendations.find(r => r.tour.id === tour.id);
              
              if (existingRec) {
                existingRec.score += this.getInteractionValue(interaction);
                existingRec.supportingUsers.push(similarUserId);
              } else {
                recommendations.push({
                  tour,
                  score: this.getInteractionValue(interaction),
                  supportingUsers: [similarUserId],
                  interactionType: interaction.action
                });
              }
            }
          }
        });
      }

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 12); // Top 12 recommendations
    } catch (error) {
      console.error('Error getting tours from similar users:', error);
      return [];
    }
  }

  /**
   * Item-based collaborative filtering
   */
  async getItemBasedRecommendations(userId, currentTourId, allTours) {
    try {
      // Get user's interaction history
      const userInteractions = await this.getUserInteractions(userId);
      const interactedTours = userInteractions.map(i => i.tourId);

      // Find tours that are often interacted with together
      const cooccurrenceMatrix = await this.buildCooccurrenceMatrix(interactedTours);
      
      // Get tours frequently co-interacted with the current tour
      const relatedTourIds = cooccurrenceMatrix[currentTourId] || [];
      
      return allTours
        .filter(tour => relatedTourIds.includes(tour.id) && !interactedTours.includes(tour.id))
        .slice(0, 6); // Top 6 related tours
    } catch (error) {
      console.error('Error getting item-based recommendations:', error);
      return [];
    }
  }

  /**
   * Build co-occurrence matrix for item-based filtering
   */
  async buildCooccurrenceMatrix(tourIds) {
    // This would typically be precomputed and stored
    // For now, we'll return an empty matrix
    // In a real implementation, this would be computed from all user interaction data
    return {};
  }

  /**
   * Get comprehensive collaborative filtering recommendations
   */
  async getRecommendations(userId, allUsers, allTours, tourInteractions) {
    try {
      // Get similar users
      const similarUsers = await this.findSimilarUsers(userId, allUsers, tourInteractions);
      
      // Get recommendations based on similar users
      const collaborativeRecs = await this.getToursFromSimilarUsers(userId, 
        similarUsers.map(u => u.userId), allTours);

      return {
        userBased: collaborativeRecs,
        similarUsers: similarUsers.slice(0, 5), // Top 5 similar users
        totalRecommendations: collaborativeRecs.length
      };
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return {
        userBased: [],
        similarUsers: [],
        totalRecommendations: 0
      };
    }
  }
}

// Export singleton instance
export const collaborativeFilteringEngine = new CollaborativeFilteringEngine();

/**
 * Hook for collaborative filtering
 */
export function useCollaborativeFiltering() {
  const getCollaborativeRecommendations = async (userId, allUsers, allTours, tourInteractions) => {
    if (!userId || !allUsers.length || !allTours.length) {
      return {
        userBased: [],
        similarUsers: [],
        totalRecommendations: 0
      };
    }

    return await collaborativeFilteringEngine.getRecommendations(userId, allUsers, allTours, tourInteractions);
  };

  return {
    getCollaborativeRecommendations
  };
}