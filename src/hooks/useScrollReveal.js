import { useState, useEffect, useRef } from 'react'

// Top rootMargin so above-the-fold content is considered "in view" on mobile (avoids white space)
const DEFAULT_OPTIONS = { rootMargin: '200px 0px -40px 0px', threshold: 0.05 }

/**
 * Returns [ref, isVisible]. Attach ref to element; isVisible becomes true when it enters viewport.
 */
export function useScrollReveal(options = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const opts = { ...DEFAULT_OPTIONS, ...options }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // On mobile, IntersectionObserver can miss above-the-fold content; check viewport once on mount
    const inView = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.visualViewport?.height ?? window.innerHeight
      return rect.top < vh && rect.bottom > 0
    }
    if (inView()) setIsVisible(true)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { rootMargin: opts.rootMargin, threshold: opts.threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}
