import { useEffect, useRef, useState, useCallback } from 'react';

export type AnimationVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up'
  | 'blur-in'
  | 'stagger';

export interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    threshold,
    rootMargin,
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Accessibility check: prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const target = ref.current;
    if (!target) return;

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    // Responsive root margin and threshold defaults:
    // Desktop: begins 15%-25% before reaching center of viewport
    // Mobile: begins slightly earlier (10%-20% before main viewing area)
    const effectiveThreshold = threshold !== undefined 
      ? threshold 
      : (isMobile ? 0.04 : 0.08);

    const effectiveRootMargin = rootMargin !== undefined 
      ? rootMargin 
      : (isMobile ? '0px 0px -5% 0px' : '0px 0px -10% 0px');

    // Quick initial check if element is already in viewport
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Element is in the viewport on mount
      setIsRevealed(true);
      if (triggerOnce) return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          if (triggerOnce) {
            observer.unobserve(target);
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
        }
      },
      {
        threshold: effectiveThreshold,
        rootMargin: effectiveRootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isRevealed };
}

export function useStaggerChildren(baseDelay = 60) {
  const getDelayStyle = useCallback(
    (index: number) => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const actualDelay = isMobile ? Math.round(baseDelay * 0.6) : baseDelay;
      return {
        transitionDelay: `${index * actualDelay}ms`,
      };
    },
    [baseDelay]
  );

  return { getDelayStyle };
}

export default useScrollReveal;
