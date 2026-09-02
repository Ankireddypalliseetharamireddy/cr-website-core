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
 * @param {number} [props.duration=1100] - Duration in milliseconds (default: 1100ms for slow luxury feel)
 * @param {number} [props.threshold=0.12] - Viewport intersection threshold
 * @param {string} [props.className=''] - Additional class names
 * @param {string} [props.as='div'] - Element tag to render
 * @param {Object} [props.style={}] - Inline styles
 */
export const ScrollReveal = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 1100,
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  className = '',
  as: Component = 'div',
  style = {},
  ...rest
}) => {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    rootMargin,
    triggerOnce: true,
    delay,
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

  const dynamicStyle = {
    ...style,
    transitionDuration: `${duration}ms`,
    transitionDelay: delay > 0 ? `${delay}ms` : undefined,
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
