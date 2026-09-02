import React from 'react';
import { useNavigate } from 'react-router-dom';
import CavreeLogo from '../../components/brand/CavreeLogo';
import modelImg from '../../assets/images/img-7.jpeg';
import ScrollReveal from '../../components/common/ScrollReveal';
import useScrollParallax from '../../hooks/useScrollParallax';

export const GrowthExpansion = () => {
  const navigate = useNavigate();
  const parallaxRef = useScrollParallax({ speed: 0.05, maxOffset: 24, direction: 'up' });

  const stats = [
    { value: '2027', label: 'ONLINE BUSINESS' },
    { value: '600', label: 'STORES BY 2027' },
    { value: '2,000', label: 'INDIA STORES 2029' },
    { value: '30', label: 'COUNTRIES BY 2029' },
  ];

  return (
    <section id="growth" className="growth-expansion-section w-full min-h-screen max-lg:min-h-0 max-lg:py-0 bg-[#0A0B0E] text-white relative flex items-center pt-6 pb-8 box-border overflow-hidden">

      <div id="home" className="absolute top-0 left-0 pointer-events-none" />
      <div id="top" className="absolute top-0 left-0 pointer-events-none" />

      <div className="absolute inset-0 w-full h-full pointer-events-none lg:hidden overflow-hidden">
        <img
          src={modelImg}
          alt="Cavree Luxury Model Background"
          className="w-full h-full object-cover object-[center_20%] opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] from-15% via-[#0A0B0E]/92 via-55% to-[#0A0B0E]/45" />
      </div>

      <div className="growth-grid w-full max-w-[1534px] mx-auto px-[clamp(1rem,2.5vw,3rem)] grid grid-cols-1 lg:grid-cols-2 items-center gap-[clamp(1.5rem,2.5vw,2.5rem)] box-border relative z-10">

        <div className="growth-content-col flex flex-col justify-center max-lg:pt-[clamp(10.5rem,32vh,18rem)] max-lg:pb-12 z-[2]">

          <ScrollReveal variant="fade-down" delay={40} duration={850} className="mb-5 mt-0 w-full flex items-center justify-center lg:justify-start lg:ml-[clamp(1.5rem,3vw,3.8rem)]">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/');
                if (window.__lenis) {
                  window.__lenis.scrollTo(0, { duration: 1.1 });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="cursor-pointer no-underline inline-flex items-center justify-center hover:scale-[1.02] transition-transform duration-300"
              title="Cavree Home"
            >
              <CavreeLogo size="lg" badgeStyle={false} />
            </a>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={100} duration={900} className="w-full flex items-center justify-center lg:justify-start mb-3">
            <span className="font-sans text-[clamp(0.74rem,0.85vw,0.88rem)] font-semibold tracking-[0.14em] uppercase text-[#D4AF37] text-center lg:text-left">
              Cavree Growth & Expansion
            </span>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={160} duration={950} className="mb-4 text-center lg:text-left w-full">
            <p className="font-sans text-[clamp(0.85rem,1vw,1.1rem)] font-semibold tracking-[0.12em] uppercase text-white/85 m-0 mb-1.5">
              Building a
            </p>
            <h1 className="font-serif text-[clamp(1.85rem,4.2vw,4.4rem)] font-extrabold tracking-[0.01em] uppercase text-white leading-[1.08] m-0">
              Fashion Brand
            </h1>
            <h1 className="font-serif text-[clamp(1.85rem,4.2vw,4.4rem)] font-extrabold tracking-[0.01em] uppercase text-[#dec29d] leading-[1.08] mt-1 mb-0">
              Without Borders.
            </h1>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={230} duration={1000}>
            <p className="font-sans text-[clamp(0.85rem,0.95vw,1rem)] leading-[1.72] text-white/75 max-w-[540px] mb-6 font-normal text-justify [text-justify:inter-word] [hyphens:auto]">
              From expanding our retail presence across India to entering international markets, Cavree is building a strong fashion ecosystem with an ambitious vision for 2027 and beyond.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300} duration={1000} className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3.5 mb-6 max-w-[560px] w-full">
            <button
              type="button"
              onClick={() => navigate('/investment-model')}
              className="growth-btn-primary inline-flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] text-[#07080B] font-sans text-[clamp(0.72rem,2.4vw,0.84rem)] font-bold tracking-[0.05em] uppercase px-[clamp(0.85rem,1.8vw,1.65rem)] py-3 min-h-[46px] rounded-[6px] no-underline transition-all duration-300 ease-out hover:brightness-110 text-center shadow-[0_2px_10px_rgba(212,175,55,0.25)] border-none cursor-pointer"
            >
              Explore Growth
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('nationwide');
                if (el) {
                  if (window.__lenis) {
                    window.__lenis.scrollTo(el, { offset: -70, duration: 1.1 });
                  } else {
                    const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 70;
                    window.scrollTo({ top: topOffset, behavior: 'smooth' });
                  }
                }
              }}
              className="growth-btn-secondary inline-flex items-center justify-center bg-[#0a0c12]/85 text-[#D4AF37] border-[1.2px] border-[#D4AF37]/65 font-sans text-[clamp(0.72rem,2.4vw,0.84rem)] font-bold tracking-[0.05em] uppercase px-[clamp(0.85rem,1.8vw,1.65rem)] py-3 min-h-[46px] rounded-[6px] no-underline transition-all duration-300 ease-out hover:bg-[#D4AF37]/15 hover:border-[#D4AF37] text-center cursor-pointer"
            >
              Global Vision
            </button>
          </ScrollReveal>

          <div className="growth-stats-grid grid grid-cols-2 sm:grid-cols-4 gap-[0.65rem] max-w-[560px] w-full">
            {stats.map((item, idx) => (
              <ScrollReveal
                key={idx}
                variant="scale-up"
                delay={350 + idx * 70}
                duration={900}
                className="bg-[#121318]/90 backdrop-blur-sm border border-[#D4AF37]/25 rounded-[6px] px-2 py-[0.9rem] text-center transition-all duration-300 hover:border-[#D4AF37]/60"
              >
                <h3 className="font-sans text-[clamp(1.4rem,1.9vw,2.1rem)] font-bold text-[#dec29d] mb-[0.35rem] leading-none tracking-[0.02em]">
                  {item.value}
                </h3>
                <p className="font-sans text-[clamp(0.52rem,0.58vw,0.65rem)] font-semibold tracking-[0.05em] uppercase text-white/50 m-0 leading-[1.25]">
                  {item.label}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="growth-image-col hidden lg:flex items-center justify-center w-full">
          <ScrollReveal variant="fade-left" delay={200} duration={1100} className="w-full max-w-[560px]">
            <div
              ref={parallaxRef}
              className="w-full h-[clamp(480px,78vh,720px)] rounded-[16px] overflow-hidden relative bg-[#15161C] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(212,175,55,0.08)] border border-white/5 will-change-transform"
            >
              <img
                src={modelImg}
                alt="Cavree Luxury Haute Couture Model"
                className="w-full h-full object-cover object-[center_15%] block transform hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default GrowthExpansion;