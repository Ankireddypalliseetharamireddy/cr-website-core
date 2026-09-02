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
    threshold = 0.12,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    // Check if IntersectionObserver is available
    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            const timer = setTimeout(() => {
              setIsRevealed(true);
            }, delay);
            if (triggerOnce) {
              observer.unobserve(target);
            }
            return () => clearTimeout(timer);
          } else {
            setIsRevealed(true);
            if (triggerOnce) {
              observer.unobserve(target);
            }
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  return { ref, isRevealed };
}

export function useStaggerChildren(count: number, baseDelay = 80) {
  const getDelayStyle = useCallback(
    (index: number) => ({
      transitionDelay: `${index * baseDelay}ms`,
    }),
    [baseDelay]
  );

  return { getDelayStyle };
}

export default useScrollReveal;
