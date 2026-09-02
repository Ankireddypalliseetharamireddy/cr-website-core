import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, Globe } from 'lucide-react';
import CavreeLogo from '../brand/CavreeLogo';

export const Footer = ({ onOpenBrochure, onOpenConsultation, onOpenLocation }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.history.pushState(null, '', '/');
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 3.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 3.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/investment-model') {
      navigate('/investment-model#contact');
    } else {
      window.history.pushState(null, '', '#contact');
      const el = document.getElementById('contact');
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el, { offset: -70, duration: 3.2 });
        } else {
          const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({ top: topOffset, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <footer
      id="contact"
      className="relative py-11 overflow-hidden text-white bg-[radial-gradient(ellipse_at_50%_50%,#0D0E14_0%,#060709_60%,#030405_100%)] border-t border-[#D4AF37]/30"
    >

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="silkGoldLeft" x1="0%" y1="100%" x2="40%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#FFF3B3" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#8C6514" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="silkGoldRight" x1="100%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#FFF3B3" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#8C6514" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>

          <filter id="goldSilkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <path
          d="M -50 220 Q 120 170, 260 200 T 520 180 Q 320 220, -50 220 Z"
          fill="url(#silkGoldLeft)"
          filter="url(#goldSilkGlow)"
        />

        <path
          d="M -30 215 Q 140 160, 290 195 T 560 175"
          stroke="url(#silkGoldLeft)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        <path
          d="M 1500 0 Q 1320 50, 1180 20 T 920 40 Q 1120 0, 1500 0 Z"
          fill="url(#silkGoldRight)"
          filter="url(#goldSilkGlow)"
        />

        <path
          d="M 1480 5 Q 1300 55, 1150 25 T 890 45"
          stroke="url(#silkGoldRight)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        <circle cx="280" cy="110" r="140" fill="radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" />
        <circle cx="1160" cy="110" r="140" fill="radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" />
      </svg>

      <div className="absolute -top-[30%] left-[18%] w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[30%] right-[22%] w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.08),transparent_70%)] pointer-events-none" />

      <div className="container max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)] relative z-10">
        <div className="footer-banner-grid grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-[clamp(1.5rem,3vw,3.5rem)] max-lg:gap-8">

          <div className="footer-logo-col flex flex-col items-center justify-center pr-[clamp(1.2rem,2vw,2.5rem)] max-lg:pr-0 max-lg:pb-6 max-lg:border-b-[1.5px] max-lg:border-[#D4AF37]/45 lg:border-r-[1.5px] lg:border-[#D4AF37]/45">
            <a
              href="/"
              onClick={handleLogoClick}
              className="inline-flex flex-col items-center justify-center no-underline cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              title="Cavree - Return to Homepage"
            >
              <CavreeLogo size="footer" orientation="vertical" badgeStyle={false} />
            </a>
          </div>

          <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start">

            <h3 className="font-serif text-[clamp(1.15rem,1.7vw,1.7rem)] font-semibold text-[#F8E29B] m-0 mb-2 leading-[1.25] tracking-[0.015em] [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]">
              Partner with Cavree and<br />
              Launch a Premium Retail Store
            </h3>

            <p className="font-sans text-[clamp(0.8rem,0.88vw,0.9rem)] text-[#D0D4E0] m-0 mb-4 leading-[1.45] font-normal max-w-[560px]">
              Secure a stable monthly income with full support, proven systems, and a trusted brand partnership.
            </p>

            <div className="flex items-center justify-center lg:justify-start max-sm:flex-col gap-y-2 gap-x-[clamp(0.75rem,1.2vw,1.5rem)] flex-wrap font-sans text-[clamp(0.8rem,0.88vw,0.9rem)] text-[#F8E29B]">

              <a
                href="mailto:cavree99@gmail.com"
                className="flex items-center gap-2 text-[#F8E29B] hover:text-white no-underline transition-all duration-300 hover:-translate-y-px"
              >
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                  <Mail size={12} color="#F8E29B" />
                </div>
                <span>cavree99@gmail.com</span>
              </a>

              <span className="text-[#D4AF37]/40 hidden sm:inline">|</span>

              <a
                href="https://www.cavree.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#F8E29B] hover:text-white no-underline transition-all duration-300 hover:-translate-y-px"
              >
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                  <Globe size={12} color="#F8E29B" />
                </div>
                <span>www.cavree.com</span>
              </a>
            </div>
          </div>

          <div className="footer-btn-col flex items-center justify-center lg:justify-end min-w-[200px] max-lg:w-full lg:pr-[clamp(1rem,2.8vw,3.5rem)]">
            <button
              type="button"
              onClick={handleApplyClick}
              className="w-full sm:w-auto min-w-[200px] py-3.5 px-8 bg-gradient-to-br from-[#F8E29B] via-[#D4AF37] to-[#A67C1E] text-[#08090C] border-none rounded-md font-sans text-[clamp(0.85rem,0.92vw,0.92rem)] font-extrabold tracking-[0.05em] uppercase cursor-pointer shadow-none hover:shadow-none hover:brightness-105 transition-all duration-300 text-center"
            >
              Apply Now
            </button>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[#D4AF37]/20 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[clamp(0.70rem,2.8vw,0.85rem)] text-white/70 font-sans">
          <span className="whitespace-nowrap">© {new Date().getFullYear()} Cavree. All rights reserved.</span>
          <span className="text-[#D4AF37]/40 hidden sm:inline">•</span>
          <span className="whitespace-nowrap">
            Designed &amp; Developed by{' '}
            <a
              href="https://mkrinfotech.com/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#E6CA65] hover:text-white tracking-wide transition-colors no-underline"
            >
              MKR INFOTECH
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
