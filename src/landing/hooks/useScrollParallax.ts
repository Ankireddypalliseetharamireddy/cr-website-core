import { useEffect, useRef } from 'react';

export interface UseScrollParallaxOptions {
  speed?: number; // e.g. 0.08 for subtle parallax, max range 10-35px
  maxOffset?: number; // max translateY in px
  direction?: 'up' | 'down';
  disabledOnMobile?: boolean;
}

/**
 * Lightweight, GPU-accelerated scroll parallax hook.
 * Uses requestAnimationFrame with direct transform styling for maximum 60/120fps smoothness.
 */
export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(options: UseScrollParallaxOptions = {}) {
  const {
    speed = 0.08,
    maxOffset = 32,
    direction = 'up',
    disabledOnMobile = true,
  } = options;

  const targetRef = useRef<T | null>(null);

  useEffect(() => {
    // Check reduced motion
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Check mobile
    if (disabledOnMobile && window.innerWidth <= 1024) return;

    const el = targetRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let initialTop = -1;

    const updateParallax = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Only calculate if element is anywhere near viewport
      if (rect.bottom >= -100 && rect.top <= viewportHeight + 100) {
        if (initialTop === -1) {
          initialTop = rect.top + window.scrollY;
        }

        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const distanceFromCenter = elementCenter - viewportCenter;

        const rawOffset = distanceFromCenter * speed;
        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));
        const finalOffset = direction === 'up' ? clampedOffset : -clampedOffset;

        el.style.transform = `translate3d(0, ${finalOffset.toFixed(1)}px, 0)`;
      }
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (el) {
        el.style.transform = '';
      }
    };
  }, [speed, maxOffset, direction, disabledOnMobile]);

  return targetRef;
}

export default useScrollParallax;
