import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function SplashScreen({ visible }) {
  const root = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)' },
      (context) => {
        const reduce = context.conditions.reduce
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        if (reduce) {
          gsap.set(['.splash-eyebrow', '.splash-logo', '.splash-title', '.splash-tag', '.splash-rule', '.splash-progress'], {
            autoAlpha: 1,
          })
          return
        }

        gsap.set('.splash-progress-fill', { scaleX: 0, transformOrigin: 'left center' })

        tl.from('.splash-eyebrow', { autoAlpha: 0, y: 10, duration: 0.55 })
          .from('.splash-logo', { autoAlpha: 0, y: 22, scale: 0.96, duration: 0.85 }, '-=0.25')
          .from('.splash-title', { autoAlpha: 0, y: 14, duration: 0.6 }, '-=0.4')
          .from('.splash-tag', { autoAlpha: 0, y: 10, duration: 0.5 }, '-=0.35')
          .from('.splash-rule', { scaleX: 0, transformOrigin: 'center center', duration: 0.7 }, '-=0.3')
          .from('.splash-progress', { autoAlpha: 0, duration: 0.35 }, '-=0.35')
          .to('.splash-progress-fill', { scaleX: 1, duration: 1.6, ease: 'power1.inOut' }, '-=0.2')

        gsap.to('.splash-orb', {
          y: -16,
          duration: 3.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.45,
        })
      },
    )
    return () => mm.revert()
  }, { scope: root })

  return (
    <div
      ref={root}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#f6f1e8] transition-opacity duration-700 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden="true"
    >
      {/* Atmosphere — same ink / gold family as the site */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="splash-orb absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#d4bc94]/35 blur-3xl" />
        <div className="splash-orb absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[#1c1915]/[0.06] blur-3xl" />
        <div className="splash-orb absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#e6d3b0]/55 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(251,248,243,0.9) 0%, rgba(246,241,232,0.4) 45%, rgba(246,241,232,1) 100%)',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-[#d4bc94]/50" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#d4bc94]/40" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="splash-eyebrow text-[11px] tracking-[0.38em] uppercase text-[#8c7352]">
          HM Orbit Tours
        </p>

        <img
          src="/logo.png"
          alt="HM Orbit Tours"
          className="splash-logo h-36 sm:h-48 w-auto object-contain"
        />

        <div className="flex flex-col items-center gap-2">
          <h1 className="splash-title font-display text-3xl sm:text-5xl font-medium text-[#1c1915] tracking-tight leading-none">
            Explore Trips
            <span className="block italic font-normal text-[#8c7352]">& Holidays</span>
          </h1>
          <p className="splash-tag text-[11px] tracking-[0.28em] uppercase text-[#6f6252] mt-1">
            Explore · Discover · Travel
          </p>
        </div>

        <div className="splash-rule h-px w-20 bg-[#d4bc94]" aria-hidden />

        <div
          className="splash-progress mt-2 h-[2px] w-28 overflow-hidden bg-[#e6dccb]"
          aria-hidden
        >
          <div className="splash-progress-fill h-full w-full bg-[#1c1915]" />
        </div>
      </div>
    </div>
  )
}
