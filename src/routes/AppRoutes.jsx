import React, { useEffect, useLayoutEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from '../landing/components/layout/MainLayout';
import HomePage from '../landing/pages/Home/HomePage';
import InvestmentModelPage from '../landing/pages/InvestmentModel/InvestmentModelPage';
import NotFoundPage from '../landing/pages/NotFound/NotFoundPage';
import ThankYouPage from '../landing/pages/ThankYou/ThankYouPage';
import StorePortal from '../pages/StorePortal';
import AboutUs from '../landing/pages/Home/About';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          if (window.__lenis) {
            window.__lenis.scrollTo(element, { offset: -70, duration: 3.2 });
          } else {
            const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: topOffset, behavior: 'smooth' });
          }
        }
      }, 120);

      return () => clearTimeout(timer);
    } else {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }
  }, [pathname, hash]);

  return null;
};

const VALID_HASHES = new Set([
  '',
  '#',
  '#top',
  '#home',
  '#growth',
  '#about',
  '#investment',
  '#investment-model',
  '#investment-recovery',
  '#benefits',
  '#process',
  '#contact',
  '#collections',
  '#thankyou',
  '#thank-you',
]);

const HomeOrNotFound = () => {
  const { hash } = useLocation();

  if (hash && !VALID_HASHES.has(hash.toLowerCase())) {
    return <NotFoundPage />;
  }

  return <HomePage />;
};

const InvestmentOrNotFound = () => {
  const { hash } = useLocation();

  if (hash && !VALID_HASHES.has(hash.toLowerCase())) {
    return <NotFoundPage />;
  }

  return <InvestmentModelPage />;
};

export const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomeOrNotFound />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="investment-model" element={<InvestmentOrNotFound />} />
          <Route path="investment" element={<Navigate to="/investment-model" replace />} />
          <Route path="benefits" element={<Navigate to="/investment-model#benefits" replace />} />
          <Route path="process" element={<Navigate to="/investment-model#process" replace />} />
          <Route path="contact" element={<Navigate to="/investment-model#contact" replace />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="thankyou" element={<Navigate to="/thank-you" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Store Staff POS & Franchise Management Portal Route */}
        <Route path="/login" element={<StorePortal />} />
        <Route path="/portal" element={<Navigate to="/login" replace />} />
        <Route path="/pos" element={<Navigate to="/login" replace />} />
        <Route path="/billing" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
