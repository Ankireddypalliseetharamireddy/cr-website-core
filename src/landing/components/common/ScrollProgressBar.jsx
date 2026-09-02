import React, { useState, useEffect } from 'react';

export const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frameId = null;

    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const currentScroll = window.scrollY;
          const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
          setScrollProgress(progress);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className="hidden md:block fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none origin-left"
      style={{
        background: 'linear-gradient(90deg, #D4AF37 0%, #F5E6A3 45%, #E6CA65 80%, #FFF3B3 100%)',
        boxShadow: '0 0 10px rgba(212, 175, 55, 0.65), 0 0 4px rgba(255, 243, 179, 0.4)',
        width: `${scrollProgress}%`,
        transition: 'width 0.12s linear',
        opacity: scrollProgress > 0.5 ? 1 : 0,
      }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressBar;
