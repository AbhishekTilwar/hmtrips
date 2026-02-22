import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackUserInteraction } from '../../lib/firestore'
import { Share2 } from 'lucide-react'

/**
 * Share Interaction Component
 * Handles sharing functionality with native sharing API fallback
 * 
 * Features:
 * - Native Web Share API support
 * - Clipboard fallback for unsupported browsers
 * - Share count tracking
 * - Firebase integration
 * - Smooth user experience
 */
export default function ShareInteraction({ tour, variant = 'dark', onShare }) {
  const { user } = useAuth()
  const [shareCount, setShareCount] = useState(tour.shares || 0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize share count from tour data
  useEffect(() => {
    setShareCount(tour.shares || 0)
  }, [tour.shares, tour.id])

  // Handle share action
  const handleShare = async () => {
    if (isProcessing) return // Prevent double clicks
    
    setIsProcessing(true)
    
    try {
      const url = `${window.location.origin}/itinerary/${tour.id}`
      
      // Track share in CRM
      if (user?.uid) {
        await trackUserInteraction(user.uid, tour.id, 'share', tour)
      }
      
      setShareCount(prev => prev + 1)
      if (onShare) onShare()
      
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
      setShareCount(prev => Math.max(0, prev - 1))
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
    isDark 
      ? 'bg-white/10 hover:bg-white/20 border-white/20 px-2 py-1.5' 
      : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 px-2 py-1'
  }`

  return (
    <button 
      onClick={handleShare}
      disabled={isProcessing}
      className={buttonClasses}
      title="Share this tour"
      aria-label="Share tour"
    >
      <Share2 className={`w-3.5 h-3.5 ${isDark ? 'text-white/70' : 'text-neutral-600'}`} />
      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
        {shareCount}
      </span>
    </button>
  )
}