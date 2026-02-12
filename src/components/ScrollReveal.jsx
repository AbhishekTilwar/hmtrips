import { useScrollReveal } from '../hooks/useScrollReveal'

const VARIANTS = {
  slideUp: {
    hidden: 'opacity-0 translate-y-8',
    visible: 'opacity-100 translate-y-0',
  },
  slideLeft: {
    hidden: 'opacity-0 translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  slideRight: {
    hidden: 'opacity-0 -translate-x-8',
    visible: 'opacity-100 translate-x-0',
  },
  scaleIn: {
    hidden: 'opacity-0 scale-95',
    visible: 'opacity-100 scale-100',
  },
  fade: {
    hidden: 'opacity-0',
    visible: 'opacity-100',
  },
  blurUp: {
    hidden: 'opacity-0 translate-y-6 blur-sm',
    visible: 'opacity-100 translate-y-0 blur-0',
  },
}

/**
 * Wraps content and animates it in when it scrolls into view.
 * @param {string} variant - slideUp | slideLeft | slideRight | scaleIn | fade | blurUp
 * @param {number} delay - ms delay (or use staggerIndex * 80 for staggered children)
 * @param {number} staggerIndex - optional; delay = staggerIndex * 80 if delay not set
 */
export default function ScrollReveal({
  children,
  className = '',
  as: Tag = 'div',
  delay = 0,
  staggerIndex,
  variant = 'slideUp',
  duration = 500,
}) {
  const [ref, isVisible] = useScrollReveal()
  const v = VARIANTS[variant] || VARIANTS.slideUp
  const effectiveDelay = delay || (typeof staggerIndex === 'number' ? staggerIndex * 80 : 0)

  return (
    <Tag
      ref={ref}
      className={`transition-all ease-out ${
        isVisible ? v.visible : v.hidden
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        ...(effectiveDelay ? { transitionDelay: `${effectiveDelay}ms` } : {}),
      }}
    >
      {children}
    </Tag>
  )
}
