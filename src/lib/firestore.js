import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  increment,
  arrayUnion,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTIONS = {
  tours: 'tours',
  inquiries: 'inquiries',
  orders: 'orders',
  payments: 'payments',
  users: 'users',
}

// ——— Tours (admin CRUD) ———
export async function getToursFromFirestore() {
  try {
    const snap = await getDocs(
      query(collection(db, COLLECTIONS.tours), orderBy('departureDate', 'asc'))
    )
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (_) {
    const snap = await getDocs(collection(db, COLLECTIONS.tours))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
}

// Initialize tour interaction fields if they don't exist
export async function ensureTourInteractionFields(tourId, tourData) {
  if (!tourId) return;
  
  const tourRef = doc(db, COLLECTIONS.tours, tourId);
  const snap = await getDoc(tourRef);
  
  if (snap.exists()) {
    const currentData = snap.data();
    const updates = {};
    
    // Ensure all interaction fields exist with default values
    const interactionFields = ['likes', 'saves', 'shares', 'views'];
    interactionFields.forEach(field => {
      if (currentData[field] === undefined || currentData[field] === null) {
        updates[field] = 0;
      }
    });
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(tourRef, updates);
    }
  }
}

export async function getTourByIdFromFirestore(id) {
  const ref = doc(db, COLLECTIONS.tours, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * Creates a new tour in Firestore
 * @param {Object} data - Tour data including:
 *   - Basic info: name, tagline, origin, destination, nights, etc.
 *   - Pricing: pricePerGuest, pricePerNight, offer, offers
 *   - Media: image, highlightImages
 *   - Itinerary: ports, highlights, itinerary array, inclusions, exclusions
 *   - About Destination (optional): aboutDestination { speciality, traditionalFood, language, culture }
 * @returns {string} The ID of the created tour
 */
export async function createTour(data) {
  const ref = await addDoc(collection(db, COLLECTIONS.tours), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTour(id, data) {
  await updateDoc(doc(db, COLLECTIONS.tours, id), data)
}

export async function deleteTour(id) {
  await deleteDoc(doc(db, COLLECTIONS.tours, id))
}

// ——— Inquiries (user submits, admin views) ———
export async function createInquiry(data) {
  const {
    userId,
    userEmail,
    userPhone,
    userName,
    tourId,
    tourName,
    message,
    numberOfGuests,
    preferredDate,
    tripInterest,
    notes,
    ...rest
  } = data
  await addDoc(collection(db, COLLECTIONS.inquiries), {
    userId: userId ?? null,
    userEmail: userEmail ?? null,
    userPhone: userPhone ?? null,
    userName: userName ?? null,
    tourId: tourId ?? null,
    tourName: tourName ?? null,
    message: message ?? '',
    numberOfGuests: numberOfGuests ?? null,
    preferredDate: preferredDate ?? null,
    tripInterest: tripInterest ?? null,
    notes: notes ?? null,
    ...rest,
    createdAt: serverTimestamp(),
  })
}

export async function getInquiries() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.inquiries), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
}

// ——— Orders (user places, admin views) ———
export async function createOrder({ userId, userEmail, userPhone, userName, tourId, tourName, amount, guests, status = 'pending' }) {
  const ref = await addDoc(collection(db, COLLECTIONS.orders), {
    userId: userId || null,
    userEmail: userEmail || null,
    userPhone: userPhone || null,
    userName: userName || null,
    tourId,
    tourName,
    amount: amount || 0,
    guests: guests || 1,
    status,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getOrders() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.orders), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() }))
}

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, COLLECTIONS.orders, orderId), { status, updatedAt: serverTimestamp() })
}

// ——— Payments (user pays, admin views) ———
export async function createPayment({ orderId, userId, amount, status = 'pending', method }) {
  const docRef = await addDoc(collection(db, COLLECTIONS.payments), {
    orderId,
    userId: userId || null,
    amount: amount || 0,
    status,
    method: method || 'razorpay',
    razorpayOrderId: null,
    razorpayPaymentId: null,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updatePayment(paymentId, data) {
  await updateDoc(doc(db, COLLECTIONS.payments, paymentId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function getPayments() {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.payments), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.(),
    updatedAt: d.data().updatedAt?.toDate?.(),
  }))
}

// ——— CRM LOGIC (NETFLIX/AMAZON STYLE) ———

/**
 * Tracks User Behavior (Search, Like, Dislike, View, Bookings).
 * Production-optimized with merge strategy for high traffic.
 * 
 * @param {string} userId - Firebase user ID
 * @param {Object} behaviorData - User behavior data to track
 * @returns {Promise<void>}
 */
export async function syncUserCRM(userId, behaviorData) {
  if (!userId) return;

  try {
    const userRef = doc(db, COLLECTIONS.users, userId);
    // Merges new interaction data without deleting existing user profile fields
    await setDoc(userRef, { 
      ...behaviorData, 
      lastActive: serverTimestamp() 
    }, { merge: true });
  } catch (error) {
    console.error('Error syncing user CRM:', error);
    // Don't throw - fail gracefully to maintain user experience
  }
}

/**
 * Tracks Global Trends (Most Searched/Most Viewed Destinations).
 * Production-optimized with atomic increment for high traffic.
 * 
 * @param {string} itemName - Name of the item being tracked
 * @returns {Promise<void>}
 */
export async function trackGlobalTrend(itemName) {
  if (!itemName) return;

  try {
    const trendRef = doc(db, 'metadata', 'global_trends');
    await updateDoc(trendRef, {
      [`stats.${itemName}.count`]: increment(1),
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    // If metadata doc doesn't exist, create it once
    try {
      const trendRef = doc(db, 'metadata', 'global_trends');
      await setDoc(trendRef, { 
        stats: { [itemName]: { count: 1 } },
        lastUpdated: serverTimestamp()
      });
    } catch (createError) {
      console.error('Error creating global trends doc:', createError);
    }
  }
}

/**
 * Get user CRM profile with all preferences
 * Returns complete user data including liked/saved tours and preferences
 */
export async function getUserCRMProfile(userId) {
  if (!userId) return null;
  
  const userRef = doc(db, COLLECTIONS.users, userId);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    // Return default profile for new users
    return {
      likedTours: [],
      savedTours: [],
      viewedTours: [],
      sharedTours: [],
      searchedDestinations: [],
      preferences: {},
      categoryScores: { tropical: 50, cold: 50, urban: 50, island: 50 },
      totalLikes: 0,
      totalSaves: 0,
      totalShares: 0,
      totalViews: 0,
      recentActivity: []
    };
  }
  
  return snap.data();
}

/**
 * Track user interaction (like, save, share, view)
 * Production-optimized with batch operations and error handling
 * 
 * @param {string} userId - Firebase user ID
 * @param {string} tourId - Tour ID
 * @param {string} action - Action type (like, save, share, view, unlike, unsave)
 * @param {Object} tourData - Tour data for preference analysis
 * @returns {Promise<void>}
 */
export async function trackUserInteraction(userId, tourId, action, tourData) {
  if (!userId || !tourId) return;
  
  try {
    const userRef = doc(db, COLLECTIONS.users, userId);
    const interactionRef = doc(db, 'userInteractions', `${userId}_${tourId}`);
    const tourRef = doc(db, COLLECTIONS.tours, tourId);
    
    // Get current interaction data
    const interactionSnap = await getDoc(interactionRef);
    const currentInteraction = interactionSnap.exists() ? interactionSnap.data() : {};
    
    const now = serverTimestamp();
    const updates = {};
    const userUpdates = {};
    
    // Check if tour exists before updating interaction counts
    const tourExists = await getDoc(tourRef).then(snap => snap.exists());

    // Update interaction based on action
    switch (action) {
      case 'like':
        if (!currentInteraction.liked) {
          updates.liked = true;
          updates.likedAt = now;
          userUpdates.totalLikes = increment(1);
          userUpdates[`likedTours`] = arrayUnion(tourId);
          
          // Update tour interaction count if tour exists
          if (tourExists) {
            await updateDoc(tourRef, { likes: increment(1) });
          }
        }
        break;
        
      case 'unlike':
        if (currentInteraction.liked) {
          updates.liked = false;
          userUpdates.totalLikes = increment(-1);
          
          // Update tour interaction count if tour exists
          if (tourExists) {
            await updateDoc(tourRef, { likes: increment(-1) });
          }
        }
        break;
        
      case 'save':
        if (!currentInteraction.saved) {
          updates.saved = true;
          updates.savedAt = now;
          userUpdates.totalSaves = increment(1);
          userUpdates[`savedTours`] = arrayUnion(tourId);
          
          // Update tour interaction count if tour exists
          if (tourExists) {
            await updateDoc(tourRef, { saves: increment(1) });
          }
        }
        break;
        
      case 'unsave':
        if (currentInteraction.saved) {
          updates.saved = false;
          userUpdates.totalSaves = increment(-1);
          
          // Update tour interaction count if tour exists
          if (tourExists) {
            await updateDoc(tourRef, { saves: increment(-1) });
          }
        }
        break;
        
      case 'share':
        updates.shared = true;
        updates.sharedAt = now;
        userUpdates.totalShares = increment(1);
        userUpdates[`sharedTours`] = arrayUnion(tourId);
        
        // Update tour interaction count if tour exists
        if (tourExists) {
          await updateDoc(tourRef, { shares: increment(1) });
        }
        break;
        
      case 'view':
        updates.viewed = true;
        updates.viewCount = (currentInteraction.viewCount || 0) + 1;
        updates.lastViewedAt = now;
        userUpdates.totalViews = increment(1);
        userUpdates[`viewedTours`] = arrayUnion(tourId);
        
        // Update tour interaction count if tour exists
        if (tourExists) {
          await updateDoc(tourRef, { views: increment(1) });
        }
        break;
    }
    
    // Update user preferences based on tour data
    if (tourData) {
      const vibe = tourData.vibe || 'urban';
      const destination = tourData.destination || '';
      
      // Update category scores
      userUpdates[`categoryScores.${vibe}`] = increment(10);
      
      // Add to recent activity
      const activityEntry = {
        type: action,
        tourId,
        tourName: tourData.name || '',
        timestamp: new Date().toISOString()
      };
      
      // Get current user data to manage recent activity
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const recentActivity = userData.recentActivity || [];
        recentActivity.unshift(activityEntry);
        // Keep only last 20 activities
        userUpdates.recentActivity = recentActivity.slice(0, 20);
      } else {
        userUpdates.recentActivity = [activityEntry];
      }
    }
    
    // Apply updates with error handling
    const promises = [];
    
    if (Object.keys(updates).length > 0) {
      promises.push(setDoc(interactionRef, { userId, tourId, ...updates }, { merge: true }));
    }
    
    if (Object.keys(userUpdates).length > 0) {
      promises.push(setDoc(userRef, userUpdates, { merge: true }));
    }
    
    // Execute all operations in parallel
    await Promise.all(promises);
    
  } catch (error) {
    console.error('Error tracking user interaction:', error);
    // Don't throw - fail gracefully to maintain user experience
  }
}

/**
 * Get personalized tours for user based on their preferences
 * Returns tours sorted by relevance to user
 */
export async function getPersonalizedTours(userId, allTours, limit = 10) {
  if (!userId || !allTours || allTours.length === 0) {
    return allTours.slice(0, limit);
  }
  
  const userProfile = await getUserCRMProfile(userId);
  
  // Score each tour based on user preferences
  const scoredTours = allTours.map(tour => {
    let score = 0;
    
    // Category match (25 points max)
    const vibe = tour.vibe || 'urban';
    const categoryScore = userProfile.categoryScores?.[vibe] || 50;
    score += (categoryScore / 100) * 25;
    
    // Destination match (30 points max)
    if (userProfile.viewedTours?.includes(tour.id)) {
      score += 15; // Viewed similar tour
    }
    if (userProfile.likedTours?.includes(tour.id)) {
      score += 30; // Liked this exact tour
    }
    if (userProfile.savedTours?.includes(tour.id)) {
      score += 25; // Saved this tour
    }
    
    // Popularity score (10 points max)
    const likes = tour.likes || 0;
    score += Math.min(likes / 100, 10);
    
    // Recency boost (15 points max) - newer tours get boost
    if (tour.departureDate) {
      const daysUntil = Math.ceil((new Date(tour.departureDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil < 30) {
        score += 15;
      }
    }
    
    // Price match (20 points max) - based on user's typical bookings
    // This is simplified - could be enhanced with actual booking history
    
    return { ...tour, relevanceScore: score };
  });
  
  // Sort by score and return top results
  scoredTours.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scoredTours.slice(0, limit);
}

/**
 * Get trending tours based on global interactions
 */
export async function getTrendingTours(allTours, limit = 10) {
  if (!allTours || allTours.length === 0) return [];
  
  // Score based on interactions
  const scoredTours = allTours.map(tour => {
    const likes = tour.likes || 0;
    const saves = tour.saves || 0;
    const shares = tour.shares || 0;
    const views = tour.views || 0;
    
    // Weighted score: likes=3, saves=5, shares=10, views=0.1
    const score = (likes * 3) + (saves * 5) + (shares * 10) + (views * 0.1);
    
    return { ...tour, trendingScore: score };
  });
  
  scoredTours.sort((a, b) => b.trendingScore - a.trendingScore);
  return scoredTours.slice(0, limit);
}

/**
 * Get recently viewed tours for user
 */
export async function getRecentlyViewedTours(userId, allTours, limit = 5) {
  if (!userId || !allTours) return [];
  
  const userProfile = await getUserCRMProfile(userId);
  const viewedTourIds = userProfile.viewedTours || [];
  
  // Get full tour data for viewed tours
  const recentTours = viewedTourIds
    .map(id => allTours.find(t => t.id === id))
    .filter(Boolean)
    .reverse() // Most recent first
    .slice(0, limit);
  
  return recentTours;
}

/**
 * Track search query for CRM
 */
export async function trackSearchQuery(userId, searchTerm, destination) {
  if (!userId) return;
  
  const userRef = doc(db, COLLECTIONS.users, userId);
  
  await setDoc(userRef, {
    searchedDestinations: arrayUnion(destination || searchTerm),
    totalSearches: increment(1),
    lastSearch: serverTimestamp()
  }, { merge: true });
  
  // Also track global trend
  await trackGlobalTrend(destination || searchTerm);
}
