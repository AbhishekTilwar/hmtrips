import { useScrollReveal } from '../hooks/useScrollReveal'

/**
 * Wraps content and animates it in (slide-up + fade) when it scrolls into view.
 */
export default function ScrollReveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
