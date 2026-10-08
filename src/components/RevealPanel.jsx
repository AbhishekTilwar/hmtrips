import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

/** Entrance for dialogs and panels. Skips motion when the user asks for less. */
export default function RevealPanel({ children, className = '' }) {
  const ref = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)' },
      (context) => {
        const reduce = context.conditions.reduce
        gsap.from(ref.current, {
          autoAlpha: 0,
          y: reduce ? 0 : 18,
          duration: reduce ? 0 : 0.55,
          ease: 'power3.out',
        })
      },
    )
    return () => mm.revert()
  }, { scope: ref })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
