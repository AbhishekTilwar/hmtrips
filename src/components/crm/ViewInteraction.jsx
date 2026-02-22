import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackUserInteraction } from '../../lib/firestore'
import { Eye } from 'lucide-react'

/**
 * View Interaction Component
 * Handles view tracking with debouncing to prevent spam
 * 
 * Features:
 * - Automatic view tracking after 3 seconds (debouncing)
 * - Real-time view count display
 * - Firebase integration
 * - Performance optimized
 * - No user interaction required (passive tracking)
 */
export default function ViewInteraction({ tour, variant = 'dark', onView }) {
  const { user } = useAuth()
  const [viewCount, setViewCount] = useState(tour.views || 0)
  const [viewRecorded, setViewRecorded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize view count from tour data
  useEffect(() => {
    setViewCount(tour.views || 0)
    setViewRecorded(false)
  }, [tour.views, tour.id])

  // Track view with debouncing (3 seconds delay)
  useEffect(() => {
    if (viewRecorded || !tour?.id || !user) return
    
    const recordView = async () => {
      if (isProcessing) return
      
      setIsProcessing(true)
      
      try {
        setViewRecorded(true)
        setViewCount(prev => prev + 1)
        if (onView) onView()
        
        await trackUserInteraction(user.uid, tour.id, 'view', tour)
      } catch (error) {
        console.error('View tracking failed:', error)
        // Revert count on error
        setViewCount(prev => Math.max(0, prev - 1))
        setViewRecorded(false)
      } finally {
        setIsProcessing(false)
      }
    }
    
    // Debounce view tracking - only track after 3 seconds of viewing
    const timer = setTimeout(recordView, 3000)
    return () => clearTimeout(timer)
  }, [tour.id, user, viewRecorded, isProcessing, onView])

  // Apply styling based on variant
  const isDark = variant === 'dark'
  const isCompact = variant === 'compact'
  
  const containerClasses = `flex items-center gap-1 rounded-full backdrop-blur-md border transition-all ${
    isDark 
      ? 'bg-white/10 border-white/20 px-2 py-1.5' 
      : 'bg-neutral-100 border-neutral-200 px-2 py-1'
  }`

  return (
    <div className={containerClasses}>
      <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-white/70' : 'text-neutral-600'}`} />
      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-neutral-700'}`}>
        {viewCount}
      </span>
    </div>
  )
}