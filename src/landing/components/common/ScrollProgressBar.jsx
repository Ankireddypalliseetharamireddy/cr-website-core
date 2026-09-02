import React, { useEffect, useRef } from 'react';

export const ScrollProgressBar = () => {
  const barRef = useRef(null);

  useEffect(() => {
    let frameId = null;

    const updateProgress = () => {
      const el = barRef.current;
      if (!el) return;

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
        el.style.transform = `scaleX(${progress})`;
        el.style.opacity = progress > 0.005 ? '1' : '0';
      }
      frameId = null;
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={barRef}
      className="hidden md:block fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none origin-left will-change-transform"
      style={{
        background: 'linear-gradient(90deg, #D4AF37 0%, #F5E6A3 45%, #E6CA65 80%, #FFF3B3 100%)',
        boxShadow: '0 0 10px rgba(212, 175, 55, 0.65), 0 0 4px rgba(255, 243, 179, 0.4)',
        transform: 'scaleX(0)',
        transformOrigin: '0 50%',
        transition: 'opacity 0.25s ease-out',
        opacity: 0,
      }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressBar;
