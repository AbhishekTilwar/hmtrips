/**
 * Watchlist Page
 * Displays all trips saved by the user in a premium, professional layout
 * 
 * Features:
 * - Clean, modern design with premium aesthetics
 * - Responsive grid layout for saved trips
 * - Interactive cards with unsave functionality
 * - Empty state handling
 * - Loading states
 * - Performance optimized rendering
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCRMProfile, trackUserInteraction, getToursFromFirestore } from '../lib/firestore';
import { useTours } from '../data/toursData';
import TourCard from '../components/TourCard';
import ScrollReveal from '../components/ScrollReveal';
import { Heart, Star, MapPin, Calendar, Users, Package } from 'lucide-react';

export default function Watchlist() {
  const { user } = useAuth();
  const [savedTours, setSavedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get all tours to match with saved tour IDs
  const { tours: toursFromFirestore, loading: toursLoading } = useTours();

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) {
        setError('Please log in to view your watchlist');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user's saved tour IDs
        const userProfile = await getUserCRMProfile(user.uid);
        const savedTourIds = userProfile.savedTours || [];
        
        if (savedTourIds.length === 0) {
          setSavedTours([]);
          setLoading(false);
          return;
        }
        
        // Get all tours to match with saved IDs
        let allTours = [];
        if (toursFromFirestore.length > 0) {
          allTours = toursFromFirestore;
        } else {
          // Fallback to static tours if Firestore is not loaded yet
          const { tours } = await import('../data/tours');
          allTours = tours;
        }
        
        // Filter to only include saved tours
        const userSavedTours = allTours.filter(tour => 
          savedTourIds.includes(tour.id)
        );
        
        setSavedTours(userSavedTours);
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load your watchlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, toursFromFirestore]);

  // Handle unsave action
  const handleUnsave = async (tourId, tourData) => {
    if (!user) {
      alert('Please log in to manage your watchlist');
      return;
    }

    try {
      // Optimistically update UI
      setSavedTours(prev => prev.filter(tour => tour.id !== tourId));
      
      // Track the unsave action in CRM
      await trackUserInteraction(user.uid, tourId, 'unsave', tourData);
    } catch (error) {
      console.error('Error unsaving tour:', error);
      // Revert UI change on error
      // Note: We can't easily revert here without refetching, so we'll just log the error
      alert('Failed to remove from watchlist. Please refresh the page.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f1e8]">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#1c1915] rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">Sign in to view your saved trips</p>
          <div className="text-sm text-gray-500">
            Your watchlist is private and only visible to you
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f1e8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c1915] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f1e8]">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Watchlist</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-gradient px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1e8]">
      {/* Page Header */}
      <div className="bg-[#fbf8f3] border-b border-[#e6dccb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1c1915] flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-medium text-[#1c1915]">Your Watchlist</h1>
              <p className="text-gray-600 mt-1">
                {savedTours.length} saved trip{savedTours.length !== 1 ? 's' : ''} • Private to you
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedTours.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-[#1c1915] flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-[#d4bc94]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your watchlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save trips you're interested in by clicking the heart icon on any tour card. 
              They'll appear here for easy access.
            </p>
            <a 
              href="/#collections" 
              className="btn-gradient"
            >
              <MapPin className="w-4 h-4" />
              Browse Trips
            </a>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#fbf8f3] p-4 border border-[#e6dccb]">
                <div className="font-display text-3xl text-[#1c1915]">{savedTours.length}</div>
                <div className="text-sm text-gray-600">Total Saved</div>
              </div>
              <div className="bg-[#fbf8f3] p-4 border border-[#e6dccb]">
                <div className="font-display text-3xl text-[#1c1915]">
                  {savedTours.filter(tour => new Date(tour.departureDate) > new Date()).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </div>
              <div className="bg-[#fbf8f3] p-4 border border-[#e6dccb]">
                <div className="font-display text-3xl text-[#1c1915]">
                  {Math.min(...savedTours.map(tour => tour.pricePerGuest || Infinity), 0) !== Infinity 
                    ? `₹${Math.min(...savedTours.map(tour => tour.pricePerGuest || Infinity)).toLocaleString()}`
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Lowest Price</div>
              </div>
              <div className="bg-[#fbf8f3] p-4 border border-[#e6dccb]">
                <div className="font-display text-3xl text-[#1c1915]">
                  {[...new Set(savedTours.map(tour => tour.destination))].length}
                </div>
                <div className="text-sm text-gray-600">Destinations</div>
              </div>
            </div>

            {/* Saved Trips Grid */}
            <div className="grid grid-cols-1 gap-6">
              {savedTours.map((tour, index) => (
                <ScrollReveal 
                  key={tour.id} 
                  variant="scaleIn" 
                  staggerIndex={index} 
                  duration={400}
                >
                  <div className="relative">
                    <TourCard 
                      tour={tour} 
                      onUnsave={(tourData) => handleUnsave(tour.id, tourData)}
                      showUnsaveButton={true}
                    />
                    <div className="absolute -top-2 -right-2 bg-[#1c1915] text-[#d4bc94] text-[10px] tracking-wider uppercase px-2 py-1 font-medium">
                      Saved
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Recommendation */}
            {savedTours.length > 0 && (
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 bg-[#fbf8f3] border border-[#e6dccb] px-6 py-3 mb-4">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-[#1c1915]">
                    Based on your saved trips, you might also like...
                  </span>
                </div>
                <a 
                  href="/#collections" 
                  className="text-[#8c7352] hover:text-[#1c1915] font-medium text-sm"
                >
                  Explore more trips →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}