import { useState, useEffect, useRef } from 'react'

const SCROLL_THRESHOLD = 60

/**
 * Returns whether header should be visible (true when scrolling up or near top).
 */
export function useScrollDirection() {
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (y <= SCROLL_THRESHOLD) {
          setHeaderVisible(true)
        } else if (y > lastY.current) {
          setHeaderVisible(false)
        } else {
          setHeaderVisible(true)
        }
        lastY.current = y
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return headerVisible
}
