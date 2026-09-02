import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Store } from 'lucide-react';
import CavreeLogo from '../brand/CavreeLogo';
import { useModal } from '../../context/ModalContext';
import ScrollReveal from '../common/ScrollReveal';
import useScrollParallax from '../../hooks/useScrollParallax';

export const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openConsultation, openBrochure } = useModal();
  const parallaxFrameRef = useScrollParallax({ speed: 0.05, maxOffset: 24, direction: 'up' });

  return (
    <section
      id="about"
      className="hero-section relative min-h-[88vh] w-full max-w-screen overflow-x-hidden flex items-center bg-[#0A0B0E] py-12 pb-16 max-lg:py-0"
    >

      <div id="investment" className="absolute top-0 left-0 pointer-events-none" />

      <div className="absolute inset-0 w-full h-full pointer-events-none lg:hidden overflow-hidden">
        <img
          src="/cavree-hero-boutique.png"
          alt="Cavree Luxury Boutique Showroom Background"
          className="w-full h-full object-cover object-[center_35%] opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] from-25% via-[#0A0B0E]/92 via-60% to-[#0A0B0E]/50" />
      </div>

      <div className="container relative z-10 max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)]">
        <div className="hero-grid grid grid-cols-1 lg:grid-cols-[48%_52%] gap-8 lg:gap-5 items-center">

          <div className="pl-0 max-lg:pt-[clamp(9rem,28vh,15rem)] max-lg:pb-12">

            <ScrollReveal variant="fade-down" delay={40} duration={850} className="mb-6 -mt-5 w-full flex items-center justify-center lg:justify-start lg:ml-[clamp(2.5rem,4.5vw,5.2rem)]">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                      if (window.__lenis) {
                        window.__lenis.scrollTo(0, { duration: 1.1 });
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }, 60);
                  } else {
                    window.history.pushState(null, '', '/');
                    if (window.__lenis) {
                      window.__lenis.scrollTo(0, { duration: 1.1 });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className="cursor-pointer no-underline inline-flex items-center justify-center hover:scale-[1.02] transition-transform duration-300"
                title="Cavree Home"
              >
                <CavreeLogo size="lg" badgeStyle={false} />
              </a>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={100} duration={900}>
              <h1 className="font-serif text-[clamp(1.85rem,3.3vw,3.9rem)] leading-[1.12] font-semibold tracking-[0.025em] mb-[1.15rem] bg-gradient-to-br from-[#F8E29B] via-[#E6CA65] to-[#C2942C] bg-clip-text text-transparent text-center lg:text-left">
                Luxury Store <br />
                Investment Model
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={170} duration={950}>
              <p className="font-sans text-[clamp(0.86rem,1.05vw,1.15rem)] text-white leading-[1.68] max-w-[580px] mb-7 font-normal opacity-95 text-justify [text-justify:inter-word]">
                Partner with Cavree to launch a premium fashion retail store with company-backed support, structured investment security, and attractive income potential.
              </p>
            </ScrollReveal>

            <div className="hero-feature-cards grid grid-cols-1 sm:grid-cols-3 gap-[clamp(0.45rem,0.6vw,0.65rem)] mb-8 max-w-[600px] w-full">

              <ScrollReveal variant="scale-up" delay={240} duration={850} className="flex items-center gap-[clamp(0.45rem,0.6vw,0.6rem)] p-[clamp(0.55rem,0.7vw,0.75rem)_clamp(0.5rem,0.7vw,0.75rem)] rounded-md border border-[#D4AF37]/35 bg-[#121318]/90 backdrop-blur-sm shadow-none min-w-0 hover:border-[#D4AF37]/70 transition-colors duration-300">
                <div className="w-[clamp(28px,2.3vw,32px)] h-[clamp(28px,2.3vw,32px)] min-w-[clamp(28px,2.3vw,32px)] rounded-full border-[1.5px] border-[#E6CA65] flex items-center justify-center text-[#E6CA65] font-sans text-[clamp(0.85rem,1vw,0.95rem)] font-bold">
                  ₹
                </div>
                <div className="min-w-0">
                  <div className="text-[clamp(0.6rem,0.72vw,0.66rem)] text-[#9E9E9E] mb-0.5 font-medium whitespace-nowrap">
                    Monthly Income:
                  </div>
                  <div className="text-[clamp(0.76rem,0.9vw,0.86rem)] font-bold text-white whitespace-nowrap">
                    ₹2L to ₹6L
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="scale-up" delay={310} duration={850} className="flex items-center gap-[clamp(0.45rem,0.6vw,0.6rem)] p-[clamp(0.55rem,0.7vw,0.75rem)_clamp(0.5rem,0.7vw,0.75rem)] rounded-md border border-[#D4AF37]/35 bg-[#121318]/90 backdrop-blur-sm shadow-none min-w-0 hover:border-[#D4AF37]/70 transition-colors duration-300">
                <div className="w-[clamp(28px,2.3vw,32px)] h-[clamp(28px,2.3vw,32px)] min-w-[clamp(28px,2.3vw,32px)] flex items-center justify-center text-[#E6CA65]">
                  <TrendingUp size={22} color="#E6CA65" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[clamp(0.6rem,0.72vw,0.66rem)] text-[#9E9E9E] mb-0.5 font-medium whitespace-nowrap">
                    Commission on Sales:
                  </div>
                  <div className="text-[clamp(0.78rem,0.92vw,0.88rem)] font-bold text-white whitespace-nowrap">
                    19% to 69%
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="scale-up" delay={380} duration={850} className="flex items-center gap-[clamp(0.45rem,0.6vw,0.6rem)] p-[clamp(0.55rem,0.7vw,0.75rem)_clamp(0.5rem,0.7vw,0.75rem)] rounded-md border border-[#D4AF37]/35 bg-[#121318]/90 backdrop-blur-sm shadow-none min-w-0 hover:border-[#D4AF37]/70 transition-colors duration-300">
                <div className="w-[clamp(28px,2.3vw,32px)] h-[clamp(28px,2.3vw,32px)] min-w-[clamp(28px,2.3vw,32px)] flex items-center justify-center text-[#E6CA65]">
                  <Store size={20} color="#E6CA65" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <div className="text-[clamp(0.6rem,0.72vw,0.66rem)] text-[#9E9E9E] mb-0.5 font-medium whitespace-nowrap">
                    Company Setup:
                  </div>
                  <div className="text-[clamp(0.72rem,0.82vw,0.78rem)] font-bold text-white leading-[1.2]">
                    Interior & Store Setup
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="fade-up" delay={450} duration={950} className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3.5 max-w-[600px] w-full">

              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '#contact');
                  const el = document.getElementById('contact');
                  if (el) {
                    if (window.__lenis) {
                      window.__lenis.scrollTo(el, { offset: -70, duration: 1.1 });
                    } else {
                      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 70;
                      window.scrollTo({ top: topOffset, behavior: 'smooth' });
                    }
                  }
                }}
                className="inline-flex items-center justify-center min-h-[46px] px-[clamp(0.85rem,1.6vw,1.85rem)] py-3 rounded-md text-[#08090C] font-sans text-[clamp(0.74rem,2.2vw,0.92rem)] font-bold tracking-[0.03em] uppercase cursor-pointer shadow-none hover:-translate-y-px transition-all duration-300 ease-out border-none bg-gradient-to-br from-[#F8E29B] via-[#D4AF37] to-[#B8860B] no-underline text-center whitespace-nowrap"
              >
                Become an Investor
              </button>

              <button
                type="button"
                onClick={() => {
                  window.history.pushState(null, '', '/');
                  if (location.pathname !== '/') {
                    navigate('/');
                  } else {
                    if (window.__lenis) {
                      window.__lenis.scrollTo(0, { duration: 1.1 });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className="inline-flex items-center justify-center min-h-[46px] px-[clamp(0.85rem,1.6vw,1.85rem)] py-3 rounded-md bg-[#0a0c12]/80 border border-[#D4AF37]/60 text-[#F5D77F] font-sans text-[clamp(0.74rem,2.2vw,0.92rem)] font-bold tracking-[0.03em] uppercase cursor-pointer hover:border-[#F8E29B] hover:bg-white/10 hover:text-white hover:-translate-y-px transition-all duration-300 ease-out text-center whitespace-nowrap"
              >
                Explore Home
              </button>
            </ScrollReveal>
          </div>

          <div className="hidden lg:flex relative w-full pt-[1rem] lg:pt-[1.6rem] mt-4 lg:mt-[1.1rem] justify-center">
            <ScrollReveal variant="fade-left" delay={200} duration={1100} className="w-full flex justify-center">
              <div
                ref={parallaxFrameRef}
                className="hero-showcase-frame relative max-w-[710px] w-full overflow-hidden border-[3.5px] border-[#D4AF37]/90 border-r-0 aspect-[16/11.6] bg-[#121318] rounded-[5px_5px_0_clamp(50px,7vw,110px)] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.12)] will-change-transform"
              >
                <img
                  src="/cavree-hero-boutique.png"
                  alt="Cavree Luxury Flagship Boutique Showroom"
                  className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
