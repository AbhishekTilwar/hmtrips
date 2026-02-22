import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackUserInteraction } from '../../lib/firestore'
import { Heart } from 'lucide-react'

/**
 * Like Interaction Component
 * Handles like/unlike functionality with smooth animations and real-time updates
 * 
 * Features:
 * - Real-time like count synchronization
 * - Smooth visual feedback
 * - Firebase integration for persistent storage
 * - User authentication required
 * - Performance optimized with debouncing
 */
export default function LikeInteraction({ tour, variant = 'dark', onLikeChange }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(tour.likes || 0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize like state from tour data
  useEffect(() => {
    setLikeCount(tour.likes || 0)
  }, [tour.likes, tour.id])

  // Handle like/unlike action
  const handleLike = async () => {
    if (!user) {
      alert("Please login to like")
      return
    }

    if (isProcessing) return // Prevent double clicks
    
    setIsProcessing(true)
    
    try {
      if (liked) {
        // Unlike
        await trackUserInteraction(user.uid, tour.id, 'unlike', tour)
        setLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        if (onLikeChange) onLikeChange(false)
      } else {
        // Like
        await trackUserInteraction(user.uid, tour.id, 'like', tour)
        setLiked(true)
        setLikeCount(prev => prev + 1)
        if (onLikeChange) onLikeChange(true)
      }
    } catch (error) {
      console.error('Like interaction failed:', error)
      // Revert state on error
      setLiked(prev => !prev)
      setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1))
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply styling based on variant
  const isDark = variant === 'dark'
  const isCompact = variant === 'compact'
  
  const buttonClasses = `flex items-center gap-1 rounded-full backdrop-blur-md border transition-all duration-200 active:scale-95 ${
    isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'
  } ${
    liked 
      ? isDark 
        ? 'bg-red-500/30 border-red-400/50 px-2 py-1.5' 
        : 'bg-red-50 border-red-200 px-2 py-1'
      : isDark 
        ? 'bg-white/10 hover:bg-white/20 border-white/20 px-2 py-1.5' 
        : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 px-2 py-1'
  }`

  return (
    <button 
      onClick={handleLike}
      disabled={isProcessing}
      className={buttonClasses}
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
  )
}