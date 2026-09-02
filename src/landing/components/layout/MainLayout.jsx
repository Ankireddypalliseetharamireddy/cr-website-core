import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgressBar from '../common/ScrollProgressBar';
import { ModalProvider, useModal } from '../../context/ModalContext';
import { VALID_HASHES } from '../../constants/navigation';

const LayoutContent = () => {
  const { openBrochure, openConsultation, openCctv, openLocation } = useModal();
  const location = useLocation();

  const isInvalidHash = Boolean(location.hash && !VALID_HASHES.has(location.hash.toLowerCase()));
  const isKnownRoute = ['/', '/about', '/investment-model', '/benefits', '/process', '/contact', '/thank-you', '/thankyou'].includes(location.pathname);
  const is404 = isInvalidHash || !isKnownRoute;
  const isThankYouPage = location.pathname === '/thank-you' || location.pathname === '/thankyou';

  if (is404) {
    return (
      <div className="cavree-404-shell w-full min-h-screen bg-[#FAF6EE] text-[#1C1D21] flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center">
          <Outlet />
        </main>
      </div>
    );
  }

  if (isThankYouPage) {
    return (
      <div className="cavree-thankyou-shell min-h-screen w-full bg-[#FAF6EE] text-[#1C1D21] flex flex-col items-center justify-center">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="cavree-app-shell flex flex-col min-h-screen bg-[#07080B] text-white">
      <ScrollProgressBar />
      <Navbar
        onOpenBrochure={openBrochure}
        onOpenConsultation={openConsultation}
        onOpenCctv={openCctv}
        onOpenLocation={openLocation}
      />

      <main className="flex-1 pt-12">
        <Outlet />
      </main>

      <Footer
        onOpenBrochure={openBrochure}
        onOpenConsultation={openConsultation}
        onOpenCctv={openCctv}
        onOpenLocation={openLocation}
      />
    </div>
  );
};

export const MainLayout = () => {
  return (
    <ModalProvider>
      <LayoutContent />
    </ModalProvider>
  );
};

export default MainLayout;
