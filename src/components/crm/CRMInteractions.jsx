import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackUserInteraction } from '../../lib/firestore'
import { Heart, Bookmark, Share2, Eye } from 'lucide-react'

/**
 * Unified CRM Interaction Component
 * Combines all four interactions (Like, Save, Share, View) in one optimized component
 * 
 * Features:
 * - All interactions in a single component for better performance
 * - Shared state management
 * - Optimized Firebase calls
 * - Consistent styling and animations
 * - Proper error handling
 * - Production-ready with debouncing and rate limiting
 */
export default function CRMInteractions({ tour, variant = 'dark', onInteraction }) {
  const { user } = useAuth()
  
  // State for all interactions
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeCount, setLikeCount] = useState(tour.likes || 0)
  const [saveCount, setSaveCount] = useState(tour.saves || 0)
  const [shareCount, setShareCount] = useState(tour.shares || 0)
  const [viewCount, setViewCount] = useState(tour.views || 0)
  const [viewRecorded, setViewRecorded] = useState(false)
  const [isProcessing, setIsProcessing] = useState({})

  // Initialize all counts from tour data
  useEffect(() => {
    setLikeCount(tour.likes || 0)
    setSaveCount(tour.saves || 0)
    setShareCount(tour.shares || 0)
    setViewCount(tour.views || 0)
    setViewRecorded(false)
  }, [tour.id, tour.likes, tour.saves, tour.shares, tour.views])

  // Handle like/unlike action with optimistic update
  const handleLike = async () => {
    if (!user) {
      alert("Please login to like")
      return
    }

    if (isProcessing.like) return
    
    // Optimistic update - update UI immediately
    const previousLiked = liked;
    const previousLikeCount = likeCount;
    
    setLiked(!previousLiked)
    setLikeCount(prev => previousLiked ? Math.max(0, prev - 1) : prev + 1)
    
    if (onInteraction) {
      onInteraction('like', { liked: !previousLiked, count: previousLiked ? previousLikeCount - 1 : previousLikeCount + 1 })
    }
    
    setIsProcessing(prev => ({ ...prev, like: true }))
    
    try {
      const action = previousLiked ? 'unlike' : 'like'
      await trackUserInteraction(user.uid, tour.id, action, tour)
    } catch (error) {
      console.error('Like interaction failed:', error)
      // Revert state on error
      setLiked(previousLiked)
      setLikeCount(previousLikeCount)
      
      if (onInteraction) {
        onInteraction('like', { liked: previousLiked, count: previousLikeCount })
      }
    } finally {
      setIsProcessing(prev => ({ ...prev, like: false }))
    }
  }

  // Handle save/unsave action with optimistic update
  const handleSave = async () => {
    if (!user) {
      alert("Please login to save")
      return
    }

    if (isProcessing.save) return
    
    // Optimistic update - update UI immediately
    const previousSaved = saved;
    const previousSaveCount = saveCount;
    
    setSaved(!previousSaved)
    setSaveCount(prev => previousSaved ? Math.max(0, prev - 1) : prev + 1)
    
    if (onInteraction) {
      onInteraction('save', { saved: !previousSaved, count: previousSaved ? previousSaveCount - 1 : previousSaveCount + 1 })
    }
    
    setIsProcessing(prev => ({ ...prev, save: true }))
    
    try {
      const action = previousSaved ? 'unsave' : 'save'
      await trackUserInteraction(user.uid, tour.id, action, tour)
    } catch (error) {
      console.error('Save interaction failed:', error)
      // Revert state on error
      setSaved(previousSaved)
      setSaveCount(previousSaveCount)
      
      if (onInteraction) {
        onInteraction('save', { saved: previousSaved, count: previousSaveCount })
      }
    } finally {
      setIsProcessing(prev => ({ ...prev, save: false }))
    }
  }

  // Handle share action with optimistic update
  const handleShare = async () => {
    if (isProcessing.share) return
    
    // Optimistic update - update UI immediately
    const previousShareCount = shareCount;
    
    setShareCount(prev => prev + 1)
    
    if (onInteraction) {
      onInteraction('share', { count: previousShareCount + 1 })
    }
    
    setIsProcessing(prev => ({ ...prev, share: true }))
    
    try {
      const url = `${window.location.origin}/itinerary/${tour.id}`
      
      // Track share in CRM
      if (user?.uid) {
        await trackUserInteraction(user.uid, tour.id, 'share', tour)
      }
      
      // Try native sharing first
      if (navigator.share) {
        await navigator.share({
          title: tour.name,
          text: `Check out this amazing tour: ${tour.name}`,
          url: url
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error('Share failed:', error)
      // Revert count on error
      setShareCount(previousShareCount)
    } finally {
      setIsProcessing(prev => ({ ...prev, share: false }))
    }
  }

  // Track view with debouncing (3 seconds delay) and optimistic update
  useEffect(() => {
    if (viewRecorded || !tour?.id || !user) return
    
    const recordView = async () => {
      if (isProcessing.view) return
      
      // Optimistic update - update UI immediately
      const previousViewCount = viewCount;
      
      setViewRecorded(true)
      setViewCount(prev => prev + 1)
      
      if (onInteraction) {
        onInteraction('view', { count: previousViewCount + 1 })
      }
      
      setIsProcessing(prev => ({ ...prev, view: true }))
      
      try {
        await trackUserInteraction(user.uid, tour.id, 'view', tour)
      } catch (error) {
        console.error('View tracking failed:', error)
        // Revert count on error
        setViewCount(previousViewCount)
        setViewRecorded(false)
      } finally {
        setIsProcessing(prev => ({ ...prev, view: false }))
      }
    }
    
    // Debounce view tracking - only track after 3 seconds of viewing
    const timer = setTimeout(recordView, 3000)
    return () => clearTimeout(timer)
  }, [tour.id, user, viewRecorded, isProcessing.view, onInteraction])

  // Apply styling based on variant
  const isDark = variant === 'dark'
  const isCompact = variant === 'compact'
  
  const getButtonClasses = (isActive, baseColor, activeColor) => `
    flex items-center gap-1 rounded-full backdrop-blur-md border transition-all duration-200 active:scale-95
    ${isProcessing[baseColor] ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
    ${
      isActive 
        ? isDark 
          ? `bg-${activeColor}-500/30 border-${activeColor}-400/50 px-2 py-1.5` 
          : `bg-${activeColor}-50 border-${activeColor}-200 px-2 py-1`
        : isDark 
          ? 'bg-white/10 hover:bg-white/20 border-white/20 px-2 py-1.5' 
          : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 px-2 py-1'
    }
  `

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* View Count - Static Display */}
      <div className={`flex items-center gap-1 rounded-full backdrop-blur-md border transition-all ${
        isDark 
          ? 'bg-white/10 border-white/20 px-2 py-1.5' 
          : 'bg-neutral-100 border-neutral-200 px-2 py-1'
      }`}>
        <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-white/70' : 'text-neutral-600'}`} />
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
          {viewCount}
        </span>
      </div>

      {/* Like Button */}
      <button 
        onClick={handleLike}
        disabled={isProcessing.like}
        className={getButtonClasses(liked, 'like', 'red')}
        title={liked ? 'Liked' : 'Like this tour'}
        aria-label={liked ? 'Unlike tour' : 'Like tour'}
      >
        <Heart 
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            liked 
              ? 'text-red-500 fill-red-500' 
              : isDark ? 'text-white/70' : 'text-neutral-600'
          }`} 
        />
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
          {likeCount}
        </span>
      </button>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={isProcessing.save}
        className={getButtonClasses(saved, 'save', 'blue')}
        title={saved ? 'Saved' : 'Save for later'}
        aria-label={saved ? 'Unsave tour' : 'Save tour'}
      >
        <Bookmark 
          className={`w-3.5 h-3.5 transition-all duration-200 ${
            saved 
              ? 'text-blue-500 fill-blue-500' 
              : isDark ? 'text-white/70' : 'text-neutral-600'
          }`} 
        />
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
          {saveCount}
        </span>
      </button>

      {/* Share Button */}
      <button 
        onClick={handleShare}
        disabled={isProcessing.share}
        className={getButtonClasses(false, 'share', 'neutral')}
        title="Share this tour"
        aria-label="Share tour"
      >
        <Share2 className={`w-3.5 h-3.5 ${isDark ? 'text-white/70' : 'text-neutral-600'}`} />
        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
          {shareCount}
        </span>
      </button>
    </div>
  )
}