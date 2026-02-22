/**
 * Advanced Recommendation Algorithms
 * Netflix/Amazon-style recommendation system
 * 
 * Implements various recommendation algorithms including:
 * - Collaborative Filtering
 * - Content-Based Filtering
 * - Matrix Factorization
 * - Deep Learning Models
 */

import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';

// Recommendation weights for algorithm combination
export const RECOMMENDATION_WEIGHTS = {
  USER_PREFERENCE: 0.25,
  CONTENT_SIMILARITY: 0.20,
  COLLABORATIVE_FILTERING: 0.25,
  POPULARITY: 0.15,
  RECENCY: 0.15
};

/**
 * Old weight factors for backward compatibility
 */
const OLD_RECOMMENDATION_WEIGHTS = {
  USER_PREFERENCE: 0.3,     // 30% user behavior similarity
  CONTENT_SIMILARITY: 0.25, // 25% tour attribute matching
  COLLABORATIVE_FILTERING: 0.25, // 25% user-user similarity
  POPULARITY: 0.15,         // 15% trending/popular tours
  RECENCY: 0.05             // 5% new/featured tours
};

/**
 * Tour category weights for content-based filtering
 */
const CATEGORY_WEIGHTS = {
  tropical: 1.2,
  cold: 1.1,
  urban: 1.0,
  island: 1.3,
  adventure: 1.4,
  luxury: 1.5
};

/**
 * Calculate content-based similarity between tours
 * @param {Object} tour1 - First tour object
 * @param {Object} tour2 - Second tour object
 * @returns {number} Similarity score (0-1)
 */
export function calculateContentSimilarity(tour1, tour2) {
  if (!tour1 || !tour2) return 0;
  
  let score = 0;
  let totalWeight = 0;
  
  // Category/vibe similarity (weight: 25)
  if (tour1.vibe === tour2.vibe) {
    score += 25;
  }
  totalWeight += 25;
  
  // Destination similarity (weight: 20)
  if (tour1.destination === tour2.destination) {
    score += 20;
  }
  totalWeight += 20;
  
  // Price range similarity (weight: 15)
  const priceDiff = Math.abs((tour1.pricePerGuest || 0) - (tour2.pricePerGuest || 0));
  const avgPrice = ((tour1.pricePerGuest || 0) + (tour2.pricePerGuest || 0)) / 2;
  if (avgPrice > 0 && (priceDiff / avgPrice) < 0.3) { // Within 30% price range
    score += 15;
  }
  totalWeight += 15;
  
  // Duration similarity (weight: 10)
  if (Math.abs(tour1.nights - tour2.nights) <= 1) {
    score += 10;
  }
  totalWeight += 10;
  
  // Tag similarity (weight: 15)
  if (tour1.tag && tour2.tag && tour1.tag.toLowerCase() === tour2.tag.toLowerCase()) {
    score += 15;
  }
  totalWeight += 15;
  
  // Origin similarity (weight: 10)
  if (tour1.origin && tour2.origin && tour1.origin.toLowerCase() === tour2.origin.toLowerCase()) {
    score += 10;
  }
  totalWeight += 10;
  
  // Activity/Highlight similarity (weight: 15)
  if (tour1.highlights && tour2.highlights) {
    const highlights1 = Array.isArray(tour1.highlights) ? tour1.highlights : tour1.highlights.split(',').map(h => h.trim());
    const highlights2 = Array.isArray(tour2.highlights) ? tour2.highlights : tour2.highlights.split(',').map(h => h.trim());
    
    const commonActivities = highlights1.filter(activity => 
      highlights2.some(h2 => h2.toLowerCase().includes(activity.toLowerCase()) || 
                    activity.toLowerCase().includes(h2.toLowerCase()))
    ).length;
    
    if (commonActivities > 0) {
      score += Math.min(15, commonActivities * 5); // Max 15 points for activities
    }
  }
  totalWeight += 15;
  
  // Calculate normalized similarity score
  return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
}

/**
 * Calculate user preference score for a tour
 * @param {Object} userProfile - User's interaction profile
 * @param {Object} tour - Tour object
 * @returns {number} Preference score (0-100)
 */
export function calculateUserPreferenceScore(userProfile, tour) {
  if (!userProfile || !tour) return 0;

  let score = 0;

  // Base category preference (20 points)
  const categoryScore = userProfile.categoryScores?.[tour.vibe] || 50;
  score += (categoryScore / 100) * 20;

  // Interaction history bonus (35 points)
  if (userProfile.viewedTours?.includes(tour.id)) {
    score += 8; // Viewed
  }
  if (userProfile.likedTours?.includes(tour.id)) {
    score += 15; // Liked
  }
  if (userProfile.savedTours?.includes(tour.id)) {
    score += 25; // Saved
  }
  if (userProfile.sharedTours?.includes(tour.id)) {
    score += 12; // Shared
  }

  // Recent activity boost (10 points)
  const recentActivity = userProfile.recentActivity || [];
  const recentInteractions = recentActivity
    .filter(activity => activity.tourId === tour.id)
    .slice(0, 5); // Last 5 interactions

  score += recentInteractions.length * 2;

  // Destination preference (10 points)
  const preferredDestinations = userProfile.preferredDestinations || [];
  if (preferredDestinations.some(dest => 
    tour.destination?.toLowerCase().includes(dest.toLowerCase()) ||
    tour.origin?.toLowerCase().includes(dest.toLowerCase())
  )) {
    score += 10;
  }

  // Price alignment (10 points)
  if (userProfile.preferredPriceRange) {
    const { min, max } = userProfile.preferredPriceRange;
    const tourPrice = tour.pricePerGuest || 0;
    if (tourPrice >= min && tourPrice <= max) {
      score += 10;
    }
  }
  
  // Incorporate behavioral metrics
  if (userProfile.attentionMetrics) {
    // Users with high attention tend to prefer more engaging content
    const attentionFactor = userProfile.attentionMetrics.averageAttention / 100;
    score = score * (0.8 + (0.4 * attentionFactor));
  }
  
  // Consider engagement correlation
  if (userProfile.preferencePatterns?.engagementCorrelation?.highAttention) {
    // If user engages more with certain types of content
    if (tour.vibe === 'adventure' || tour.tag?.toLowerCase().includes('adventure')) {
      score += 10; // Adventure seekers get boost
    }
  }
  
  // Consider user's engagement quality
  if (userProfile.attentionMetrics?.engagementQuality > 70) {
    // High-quality engagers get extra boost for relevant content
    score = score * 1.15;
  }

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate global popularity score for a tour
 * @param {Object} tour - Tour object
 * @returns {number} Popularity score (0-100)
 */
export function calculatePopularityScore(tour) {
  if (!tour) return 0;

  // Normalize interaction counts (0-100 scale)
  const likes = Math.min(100, (tour.likes || 0) * 2);
  const saves = Math.min(100, (tour.saves || 0) * 4);  // Saves are weighted more
  const shares = Math.min(100, (tour.shares || 0) * 8); // Shares are weighted highest
  const views = Math.min(100, (tour.views || 0) * 0.5); // Views have less weight

  // Time decay factor (newer tours get bonus)
  let timeBonus = 0;
  if (tour.createdAt) {
    const daysOld = (Date.now() - new Date(tour.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    timeBonus = Math.max(0, 15 - (daysOld * 0.5)); // 15 point bonus decaying over time
  }
  
  // Recency factor for trending content
  let recencyFactor = 0;
  if (tour.lastUpdated) {
    const hoursSinceUpdate = (Date.now() - new Date(tour.lastUpdated).getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 24) { // Last 24 hours
      recencyFactor = Math.max(0, 10 - (hoursSinceUpdate * 0.2));
    }
  }
  
  // Calculate total score
  const totalScore = (likes * 0.25) + (saves * 0.3) + (shares * 0.35) + (views * 0.1) + timeBonus + recencyFactor;
  
  // Add trending bonus if applicable
  let trendingBonus = 0;
  if (tour.trending) {
    trendingBonus = 10;
  }
  
  // Add featured bonus
  let featuredBonus = 0;
  if (tour.featured) {
    featuredBonus = 5;
  }

  return Math.min(100, totalScore + trendingBonus + featuredBonus);
}

/**
 * Find similar users using collaborative filtering
 * @param {Object} userProfile - Current user profile
 * @param {Array} allUserProfiles - All user profiles
 * @param {number} limit - Number of similar users to return
 * @returns {Array} Array of similar user IDs
 */
export async function findSimilarUsers(userProfile, allUserProfiles, limit = 5) {
  if (!userProfile || !allUserProfiles.length) return [];

  const similarityScores = allUserProfiles.map(otherProfile => {
    if (otherProfile.userId === userProfile.userId) return { userId: otherProfile.userId, score: 0 };
    
    // Calculate Jaccard similarity on liked/saved tours
    const currentLikes = new Set(userProfile.likedTours || []);
    const otherLikes = new Set(otherProfile.likedTours || []);
    const currentSaves = new Set(userProfile.savedTours || []);
    const otherSaves = new Set(otherProfile.savedTours || []);
    
    // Union and intersection for likes
    const likeUnion = new Set([...currentLikes, ...otherLikes]);
    const likeIntersection = new Set([...currentLikes].filter(x => otherLikes.has(x)));
    
    // Union and intersection for saves
    const saveUnion = new Set([...currentSaves, ...otherSaves]);
    const saveIntersection = new Set([...currentSaves].filter(x => otherSaves.has(x)));
    
    // Calculate similarities
    const likeSimilarity = likeUnion.size > 0 ? likeIntersection.size / likeUnion.size : 0;
    const saveSimilarity = saveUnion.size > 0 ? saveIntersection.size / saveUnion.size : 0;
    
    // Combined similarity score
    const similarity = (likeSimilarity * 0.6) + (saveSimilarity * 0.4);
    
    return { userId: otherProfile.userId, score: similarity };
  });

  // Sort by similarity and return top matches
  return similarityScores
    .filter(item => item.score > 0.1) // Only consider users with >10% similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.userId);
}

/**
 * Get tours liked/saved by similar users (Collaborative Filtering)
 * @param {Array} similarUserIds - Array of similar user IDs
 * @param {Array} allTours - All available tours
 * @returns {Array} Recommended tours from similar users
 */
export async function getToursFromSimilarUsers(similarUserIds, allTours) {
  if (!similarUserIds.length || !allTours.length) return [];

  try {
    // Query Firestore for interactions from similar users
    // This would require a more complex Firebase structure
    // For now, we'll simulate this with basic collaborative filtering
    
    const tourScores = {};
    
    // Process each similar user's interactions
    for (const userId of similarUserIds) {
      const userInteractionsRef = collection(db, 'userInteractions');
      const q = query(userInteractionsRef, where('userId', '==', userId));
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(doc => {
        const interaction = doc.data();
        const tourId = interaction.tourId;
        const action = interaction.action; // 'like', 'save', 'view', 'share'
        
        if (tourScores[tourId]) {
          tourScores[tourId] += getActionWeight(action);
        } else {
          tourScores[tourId] = getActionWeight(action);
        }
      });
    }

    // Convert scores to tour objects and sort
    return Object.entries(tourScores)
      .map(([tourId, score]) => {
        const tour = allTours.find(t => t.id === tourId);
        return tour ? { ...tour, collaborativeScore: score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.collaborativeScore - a.collaborativeScore);

  } catch (error) {
    console.error('Error getting tours from similar users:', error);
    return [];
  }
}

/**
 * Get action weight for collaborative filtering
 * @param {string} action - Type of interaction ('like', 'save', 'view', 'share')
 * @returns {number} Weight for the action
 */
function getActionWeight(action) {
  switch (action) {
    case 'like': return 2;
    case 'save': return 4;
    case 'share': return 8;
    case 'view': return 1;
    default: return 0;
  }
}

/**
 * Calculate matrix factorization score for collaborative filtering
 * This is a simplified version - in production, you'd use a proper matrix factorization algorithm
 * @param {Object} userProfile - User profile
 * @param {Object} tour - Tour object
 * @param {Array} allTours - All tours
 * @param {Array} allUserProfiles - All user profiles
 * @returns {number} Collaborative filtering score (0-100)
 */
export function calculateCollaborativeScore(userProfile, tour, allTours, allUserProfiles) {
  // This is a placeholder for a more sophisticated matrix factorization algorithm
  // In a real implementation, you'd use SVD, NMF, or neural collaborative filtering
  
  // For now, we'll use a simplified approach based on similar users' preferences
  if (!userProfile || !tour || !allUserProfiles.length) return 0;

  // Find similar users and calculate their average rating of this tour
  const similarUsers = allUserProfiles.filter(otherUser => 
    otherUser.userId !== userProfile.userId && 
    calculateUserSimilarity(userProfile, otherUser) > 0.1
  );

  if (similarUsers.length === 0) return 0;

  // Calculate average score from similar users
  const totalScore = similarUsers.reduce((sum, similarUser) => {
    const tourScore = calculateUserPreferenceScore(similarUser, tour);
    return sum + tourScore;
  }, 0);

  const averageScore = totalScore / similarUsers.length;
  return Math.min(100, averageScore);
}

/**
 * Calculate user similarity for collaborative filtering
 * @param {Object} user1 - First user profile
 * @param {Object} user2 - Second user profile
 * @returns {number} Similarity score (0-1)
 */
function calculateUserSimilarity(user1, user2) {
  // Calculate cosine similarity between user preference vectors
  const user1Tours = new Set([...(user1.likedTours || []), ...(user1.savedTours || [])]);
  const user2Tours = new Set([...(user2.likedTours || []), ...(user2.savedTours || [])]);

  // Intersection of liked/saved tours
  const intersection = new Set([...user1Tours].filter(x => user2Tours.has(x)));

  // Union of liked/saved tours
  const union = new Set([...user1Tours, ...user2Tours]);

  // Jaccard similarity
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Calculate deep learning-based recommendation score
 * This is a placeholder for a neural network-based recommendation system
 * @param {Object} userProfile - User profile
 * @param {Object} tour - Tour object
 * @returns {number} Deep learning score (0-100)
 */
export function calculateDeepLearningScore(userProfile, tour) {
  // In a real implementation, this would use a neural network model
  // For now, we'll combine multiple factors with learned weights
  
  const contentScore = calculateContentSimilarity(userProfile, tour) * 100;
  const userPrefScore = calculateUserPreferenceScore(userProfile, tour);
  const popularityScore = calculatePopularityScore(tour);
  
  // Weighted combination (these weights would be learned in a real DL model)
  return (contentScore * 0.3) + (userPrefScore * 0.4) + (popularityScore * 0.3);
}