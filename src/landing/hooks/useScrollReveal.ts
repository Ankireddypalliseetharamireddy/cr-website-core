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
    delay = 0,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    // Accessibility: instantly reveal without motion if reduced-motion requested
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

    // Adaptive viewport intersection triggers based on screen dimensions
    const computedThreshold =
      threshold !== undefined
        ? threshold
        : isMobile
        ? 0.04
        : isTablet
        ? 0.08
        : 0.12;

    const computedRootMargin =
      rootMargin !== undefined
        ? rootMargin
        : isMobile
        ? '0px 0px -3% 0px'
        : isTablet
        ? '0px 0px -6% 0px'
        : '0px 0px -10% 0px';

    // Compress delays on mobile so users never wait for stacked items
    const effectiveDelay = isMobile ? Math.round(delay * 0.5) : delay;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (effectiveDelay > 0) {
            timer = setTimeout(() => {
              setIsRevealed(true);
            }, effectiveDelay);
          } else {
            setIsRevealed(true);
          }

          if (triggerOnce) {
            observer.unobserve(target);
          }
        } else if (!triggerOnce) {
          if (timer) clearTimeout(timer);
          setIsRevealed(false);
        }
      },
      {
        threshold: computedThreshold,
        rootMargin: computedRootMargin,
      }
    );

    observer.observe(target);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  return { ref, isRevealed };
}

export function useStaggerChildren(count: number, baseDelay = 80) {
  const getDelayStyle = useCallback(
    (index: number) => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const delay = isMobile ? Math.round(baseDelay * 0.5) : baseDelay;
      return {
        transitionDelay: `${index * delay}ms`,
      };
    },
    [baseDelay]
  );

  return { getDelayStyle };
}

export default useScrollReveal;
