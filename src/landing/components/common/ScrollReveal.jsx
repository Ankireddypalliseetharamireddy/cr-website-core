import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

/**
 * ScrollReveal Component
 * Smooth, slow, and cinematic reveal animation container on scroll.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {'fade-up'|'fade-down'|'fade-left'|'fade-right'|'scale-up'|'blur-in'} [props.variant='fade-up'] - Animation style
 * @param {number} [props.delay=0] - Delay in milliseconds before animation begins
 * @param {number} [props.duration=950] - Duration in milliseconds (default: 950ms for slow luxury feel)
 * @param {number} [props.threshold] - Viewport intersection threshold (optional, uses responsive default)
 * @param {string} [props.rootMargin] - Root margin for triggering (optional, uses responsive default)
 * @param {string} [props.className=''] - Additional class names
 * @param {string} [props.as='div'] - Element tag to render
 * @param {Object} [props.style={}] - Inline styles
 */
export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 950,
  threshold,
  rootMargin,
  className = '',
  as: Component = 'div',
  style = {},
  ...rest
}) => {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const getVariantClass = () => {
    switch (variant) {
      case 'fade-down':
        return 'reveal-fade-down';
      case 'fade-left':
        return 'reveal-fade-left';
      case 'fade-right':
        return 'reveal-fade-right';
      case 'scale-up':
        return 'reveal-scale-up';
      case 'blur-in':
        return 'reveal-blur-in';
      case 'fade-up':
      default:
        return 'reveal-fade-up';
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const effectiveDelay = isMobile && delay > 0 ? Math.round(delay * 0.6) : delay;
  const effectiveDuration = isMobile && duration > 750 ? Math.round(duration * 0.85) : duration;

  const dynamicStyle = {
    ...style,
    transitionDuration: `${effectiveDuration}ms`,
    transitionDelay: effectiveDelay > 0 ? `${effectiveDelay}ms` : undefined,
  };

  return (
    <Component
      ref={ref}
      className={`reveal-init ${getVariantClass()} ${isRevealed ? 'reveal-visible' : ''} ${className}`}
      style={dynamicStyle}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default ScrollReveal;
