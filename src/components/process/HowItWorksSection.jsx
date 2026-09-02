import React from 'react';
import { ChevronRight } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">

          <rect x="11" y="8" width="22" height="28" rx="2.5" fill="#18191E" stroke="#D4AF37" strokeWidth="2" />
          <line x1="16" y1="15" x2="26" y2="15" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="16" y1="21" x2="24" y2="21" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="16" y1="27" x2="22" y2="27" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" />

          <g transform="translate(23, 20)">
            <path d="M0 10 L10 0 L14 4 L4 14 Z" fill="#D4AF37" />
            <polygon points="0,10 -2,15 3,13" fill="#FAF6EE" />
          </g>
        </svg>
      ),
      title: 'Submit Investor Interest',
      hasChevron: true,
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">

          <path d="M24 6 C17 6 12 11 12 18 C12 26 24 40 24 40 C24 40 36 26 36 18 C36 11 31 6 24 6 Z" fill="#18191E" stroke="#D4AF37" strokeWidth="2" strokeLinejoin="round" />

          <circle cx="24" cy="18" r="5" fill="none" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="24" cy="18" r="2" fill="#D4AF37" />
        </svg>
      ),
      title: 'Location Inspection & Approval',
      hasChevron: true,
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">

          <circle cx="21" cy="15" r="5" fill="none" stroke="#D4AF37" strokeWidth="2" />
          <path d="M12 31 C12 25 16 23 21 23 C23.5 23 25.5 23.8 27 25" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />

          <circle cx="29" cy="27" r="6" fill="#18191E" stroke="#D4AF37" strokeWidth="2" />
          <line x1="33.5" y1="31.5" x2="39" y2="37" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M27 27 L29 29 L32 25" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Background Verification',
      hasChevron: false,
    },
    {
      icon: (
        <svg width="44" height="44" viewBox="0 0 48 48" fill="none">

          <path d="M10 12 L38 12 L36 21 L12 21 Z" fill="#24262C" stroke="#D4AF37" strokeWidth="1.8" />
          <path d="M12 21 C12 23 15 23 15 21 C15 23 18 23 18 21 C18 23 21 23 21 21 C21 23 24 23 24 21 C24 23 27 23 27 21 C27 23 30 23 30 21 C30 23 33 23 33 21 C33 23 36 23 36 21" stroke="#D4AF37" strokeWidth="1.5" fill="none" />

          <rect x="13" y="21" width="22" height="15" stroke="#D4AF37" strokeWidth="1.8" fill="#18191E" />
          <rect x="20" y="26" width="8" height="10" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <line x1="16" y1="26" x2="18" y2="26" stroke="#D4AF37" strokeWidth="1.5" />
          <line x1="30" y1="26" x2="32" y2="26" stroke="#D4AF37" strokeWidth="1.5" />
        </svg>
      ),
      title: 'Store Setup & Launch',
      hasChevron: false,
    },
  ];

  return (
    <section
      id="process"
      className="how-it-works-section relative py-[1.2rem] pb-[2.2rem] bg-[#FAF6EE] text-[#1A1D20]"
    >
      <div className="container max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)]">

        <div className="flex items-center justify-center gap-5 mb-6">
          <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#b8860b]/50 max-w-[280px]" />
          <h2 className="font-serif text-[clamp(1.15rem,1.8vw,1.6rem)] font-bold tracking-[0.08em] uppercase text-center m-0 text-[#1A1D20]">
            How It Works
          </h2>
          <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent to-[#b8860b]/50 max-w-[280px]" />
        </div>

        <div className="how-it-works-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-[1.5px] border-[#b8860b]/45 rounded-[10px] bg-[#FDFBF7] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`how-it-works-col flex items-center justify-between p-[clamp(0.85rem,1.5vw,1.6rem)] relative max-lg:border-b max-lg:border-dashed max-lg:border-[#b8860b]/30 ${
                idx < 3 ? 'lg:border-r-[1.5px] lg:border-dashed lg:border-[#b8860b]/40' : ''
              } ${
                idx % 2 === 0 ? 'sm:max-lg:border-r-[1.5px] sm:max-lg:border-dashed sm:max-lg:border-[#b8860b]/40' : ''
              }`}
            >

              <div className="flex items-center gap-[clamp(0.65rem,1vw,0.95rem)] min-w-0">

                <div className="w-[clamp(38px,3.2vw,46px)] h-[clamp(38px,3.2vw,46px)] min-w-[clamp(38px,3.2vw,46px)] rounded-full bg-[#18191E] border-[1.8px] border-[#D4AF37] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] shrink-0">
                  {step.icon}
                </div>

                <h4 className="font-sans text-[clamp(0.82rem,0.92vw,0.96rem)] font-bold text-[#1A1D20] leading-[1.3] m-0 min-w-0">
                  {step.title}
                </h4>
              </div>

              {step.hasChevron && (
                <div className="how-it-works-chevrons hidden sm:flex items-center text-[#b8860b]/75 ml-[0.4rem] shrink-0">
                  <ChevronRight size={15} strokeWidth={2.5} className="-mr-[7px]" />
                  <ChevronRight size={15} strokeWidth={2.5} className="-mr-[7px]" />
                  <ChevronRight size={15} strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
