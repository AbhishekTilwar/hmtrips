import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { trackUserInteraction } from '../../lib/firestore'
import { Bookmark } from 'lucide-react'

/**
 * Save Interaction Component
 * Handles save/unsave functionality for bookmarking tours
 * 
 * Features:
 * - Real-time save count synchronization
 * - Visual feedback for saved state
 * - Firebase integration for persistent storage
 * - User authentication required
 * - Smooth animations and transitions
 */
export default function SaveInteraction({ tour, variant = 'dark', onSaveChange }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saveCount, setSaveCount] = useState(tour.saves || 0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize save state from tour data
  useEffect(() => {
    setSaveCount(tour.saves || 0)
  }, [tour.saves, tour.id])

  // Handle save/unsave action
  const handleSave = async () => {
    if (!user) {
      alert("Please login to save")
      return
    }

    if (isProcessing) return // Prevent double clicks
    
    setIsProcessing(true)
    
    try {
      if (saved) {
        // Unsave
        await trackUserInteraction(user.uid, tour.id, 'unsave', tour)
        setSaved(false)
        setSaveCount(prev => Math.max(0, prev - 1))
        if (onSaveChange) onSaveChange(false)
      } else {
        // Save
        await trackUserInteraction(user.uid, tour.id, 'save', tour)
        setSaved(true)
        setSaveCount(prev => prev + 1)
        if (onSaveChange) onSaveChange(true)
      }
    } catch (error) {
      console.error('Save interaction failed:', error)
      // Revert state on error
      setSaved(prev => !prev)
      setSaveCount(prev => saved ? prev + 1 : Math.max(0, prev - 1))
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
    saved 
      ? isDark 
        ? 'bg-blue-500/30 border-blue-400/50 px-2 py-1.5' 
        : 'bg-blue-50 border-blue-200 px-2 py-1'
      : isDark 
        ? 'bg-white/10 hover:bg-white/20 border-white/20 px-2 py-1.5' 
        : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 px-2 py-1'
  }`

  return (
    <button 
      onClick={handleSave}
      disabled={isProcessing}
      className={buttonClasses}
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
  )
}