import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Lenis from 'lenis';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './styles/website.css';

export function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      try {
        const navEntries = performance.getEntriesByType('navigation');
        const isReload =
          (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload') ||
          (performance as any)?.navigation?.type === 1;

        if (isReload && (window.location.pathname !== '/' || window.location.hash)) {
          window.location.replace('/');
        }
      } catch (e) {}
      window.scrollTo(0, 0);
    }

    const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Refined premium luxury Lenis smooth-scroll configuration
    const lenis = new Lenis({
      duration: isReducedMotion ? 0 : (isMobile ? 0.95 : 1.15),
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      infinite: false,
      autoRaf: false,
    });

    (window as any).__lenis = lenis;
    lenis.scrollTo(0, { immediate: true });

    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    const handlePageShow = () => {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', () => {
      window.scrollTo(0, 0);
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pageshow', handlePageShow);
      lenis.destroy();
      (window as any).__lenis = null;
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
