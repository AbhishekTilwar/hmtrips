import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function PageTransition({ children }) {
  const ref = useRef(null)
  const { pathname } = useLocation()

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)' },
      (context) => {
        const reduce = context.conditions.reduce
        gsap.fromTo(
          ref.current,
          { autoAlpha: reduce ? 1 : 0, y: reduce ? 0 : 16 },
          { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.65, ease: 'power3.out' },
        )
      },
    )
    return () => mm.revert()
  }, { dependencies: [pathname], scope: ref })

  return <div ref={ref}>{children}</div>
}
