'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  stagger?: boolean
  /** Delay (ms) before the reveal class is allowed to trigger, for lightly staggering sibling sections. */
  delay?: number
}

/**
 * Lightweight IntersectionObserver-driven reveal wrapper.
 * Content is present and visible in the initial HTML (see .reveal-up /
 * .reveal-stagger base state in editable-global.css) — this only adds the
 * `data-revealed` flag once the element enters the viewport, and falls back
 * to fully-visible immediately if IntersectionObserver isn't available.
 */
export function ScrollReveal({ children, as: Tag = 'div', className = '', stagger = false, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const timer = window.setTimeout(() => setRevealed(true), delay)
            observer.disconnect()
            return () => window.clearTimeout(timer)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [delay])

  const Component = Tag as ElementType
  return (
    <Component
      ref={ref}
      data-revealed={revealed ? 'true' : 'false'}
      className={`${stagger ? 'reveal-stagger' : 'reveal-up'} ${className}`}
    >
      {children}
    </Component>
  )
}
