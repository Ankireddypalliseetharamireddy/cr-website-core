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
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      duration: 3.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.55,
      touchMultiplier: 0.9,
      infinite: false,
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
