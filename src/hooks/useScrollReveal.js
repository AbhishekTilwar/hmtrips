import { useState, useEffect, useRef } from 'react'

const DEFAULT_OPTIONS = { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }

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
