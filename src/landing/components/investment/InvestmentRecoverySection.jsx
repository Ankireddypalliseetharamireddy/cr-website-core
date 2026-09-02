import React from 'react';
import { 
  Coins, 
  ClipboardCheck, 
  Megaphone, 
  ShieldCheck 
} from 'lucide-react';
import ScrollReveal from '../common/ScrollReveal';

export const InvestmentRecoverySection = () => {
  const recoverySteps = [
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">

          <ellipse cx="20" cy="28" rx="12" ry="3.8" fill="#24262C" stroke="#D4AF37" strokeWidth="1.5" />
          <path d="M8 28 v3.5 c0 2.1 5.4 3.8 12 3.8 s12-1.7 12-3.8 v-3.5" fill="#18191E" stroke="#D4AF37" strokeWidth="1.5" />
          <ellipse cx="20" cy="20" rx="12" ry="3.8" fill="#24262C" stroke="#D4AF37" strokeWidth="1.5" />
          <path d="M8 20 v3.5 c0 2.1 5.4 3.8 12 3.8 s12-1.7 12-3.8 v-3.5" fill="#18191E" stroke="#D4AF37" strokeWidth="1.5" />
          <ellipse cx="20" cy="12" rx="12" ry="3.8" fill="#2A2C34" stroke="#D4AF37" strokeWidth="1.5" />
          <ellipse cx="20" cy="12" rx="8" ry="2.5" fill="#D4AF37" fillOpacity="0.25" />
          <path d="M8 12 v3.5 c0 2.1 5.4 3.8 12 3.8 s12-1.7 12-3.8 v-3.5" fill="#18191E" stroke="#D4AF37" strokeWidth="1.5" />
        </svg>
      ),
      text: 'Required stock investment starts from ₹55 lakhs and can go up to ₹99 lakhs depending on location',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">

          <path d="M20 5 L32 9 C32 21 27 30 20 35 C13 30 8 21 8 9 L20 5 Z" fill="#18191E" stroke="#D4AF37" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M15 19 L19 23 L25 15" stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      text: 'The investment remains secured in the form of stock',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">

          <circle cx="20" cy="20" r="15" fill="#18191E" stroke="#D4AF37" strokeWidth="1.8" />
          <path d="M12 14 A 10 10 0 0 1 28 14" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="28,10 32,14 27,17" fill="#D4AF37" />
          <path d="M28 26 A 10 10 0 0 1 12 26" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="12,30 8,26 13,23" fill="#D4AF37" />
          <text x="20" y="24" textAnchor="middle" fill="#FAF6EE" fontSize="10.5" fontWeight="bold" fontFamily="'Outfit', sans-serif">₹</text>
        </svg>
      ),
      text: 'Stock investment is released at 10% of monthly store turnover',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">

          <rect x="10" y="7" width="20" height="26" rx="2" fill="#18191E" stroke="#D4AF37" strokeWidth="1.8" />
          <line x1="14" y1="13" x2="26" y2="13" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="18" x2="22" y2="18" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="14" y1="23" x2="20" y2="23" stroke="#D4AF37" strokeWidth="1.4" strokeLinecap="round" />
          <g transform="translate(22, 20)">
            <path d="M0 6 L6 0 L9 3 L3 9 Z" fill="#D4AF37" />
            <polygon points="0,6 -1,10 3,9" fill="#FAF6EE" />
          </g>
        </svg>
      ),
      text: 'Agreement term: 6 years',
    },
    {
      icon: (
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">

          <rect x="8" y="8" width="24" height="24" rx="2.5" fill="#18191E" stroke="#D4AF37" strokeWidth="1.8" />
          <line x1="8" y1="15" x2="32" y2="15" stroke="#D4AF37" strokeWidth="1.4" />
          <circle cx="13" cy="6.5" r="1.2" fill="#D4AF37" />
          <circle cx="27" cy="6.5" r="1.2" fill="#D4AF37" />
          <circle cx="13" cy="20" r="1.1" fill="#D4AF37" />
          <circle cx="20" cy="20" r="1.1" fill="#D4AF37" />
          <circle cx="27" cy="20" r="1.1" fill="#D4AF37" />
          <circle cx="13" cy="25" r="1.1" fill="#D4AF37" />
          <circle cx="20" cy="25" r="1.1" fill="#D4AF37" />
          <circle cx="27" cy="25" r="1.1" fill="#D4AF37" />
        </svg>
      ),
      text: 'The agreement continues for 6 years even if full investment is recovered earlier',
    },
  ];

  return (
    <section
      id="investment-recovery"
      className="investment-recovery-section relative py-[clamp(2.5rem,4.5vw,4.5rem)] bg-[#FAF6EE] text-[#1A1D20]"
    >
      <div className="container max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)]">

        <ScrollReveal variant="fade-up" duration={950} className="investment-recovery-grid grid grid-cols-1 md:grid-cols-3 xl:grid-cols-[45%_18.33%_18.33%_18.33%] border-[1.5px] border-[#b8860b]/45 rounded-[12px] bg-[#FDFBF7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden items-stretch">

          <div className="md:col-span-3 xl:col-span-1 p-[clamp(1.25rem,1.8vw,2rem)] border-b xl:border-b-0 xl:border-r border-[#b8860b]/35 flex flex-col justify-between">

            <div className="flex flex-col items-center text-center gap-2 mb-4 w-full min-h-[58px] justify-start">
              <div className="w-[28px] h-[28px] min-w-[28px] rounded-[6px] bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                <Coins size={15} color="#946E1E" />
              </div>
              <h3 className="font-serif text-[clamp(0.8rem,0.88vw,0.94rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0 text-center leading-[1.25]">
                Investment Recovery Model
              </h3>
            </div>

            <div className="recovery-steps-row flex flex-col md:grid md:grid-cols-5 gap-2.5 md:gap-3 relative mt-2 mb-1">

              <div className="recovery-connecting-line hidden md:block absolute top-[21px] left-[7%] right-[7%] h-[2px] bg-[#b8860b]/45 z-[1]" />

              {recoverySteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-3.5 md:gap-0 p-2.5 md:p-0 bg-white/80 md:bg-transparent border border-[#b8860b]/25 md:border-none rounded-xl md:rounded-none relative z-[2] shadow-[0_2px_6px_rgba(0,0,0,0.02)] md:shadow-none hover:-translate-y-0.5 transition-transform duration-300"
                >

                  <div className="w-[38px] h-[38px] min-w-[38px] md:w-[42px] md:h-[42px] md:min-w-[42px] rounded-full bg-[#18191E] border-[1.5px] border-[#D4AF37] flex items-center justify-center md:mb-2.5 shadow-[0_2px_6px_rgba(0,0,0,0.12)] shrink-0">
                    {step.icon}
                  </div>

                  <p className="font-sans text-[0.8rem] md:text-[clamp(0.7rem,0.76vw,0.8rem)] leading-[1.4] md:leading-[1.38] text-[#2C2E35] md:text-[#3E424C] m-0 font-medium flex-1">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-[clamp(1.1rem,1.8vw,2rem)] border-b max-md:border-b md:border-b-0 md:border-r border-[#b8860b]/35 flex flex-col justify-between">
            <div className="w-full flex-1 flex flex-col justify-between">

              <div className="flex flex-col items-center text-center gap-1.5 mb-3 w-full justify-start">
                <div className="w-[28px] h-[28px] min-w-[28px] rounded-[6px] bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                  <ClipboardCheck size={15} color="#946E1E" />
                </div>
                <h3 className="font-serif text-[clamp(0.82rem,0.88vw,0.94rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0 text-center leading-[1.25]">
                  Investor Responsibilities
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2 my-2.5 w-full">
                {[
                  'Store rent',
                  'Electricity bills',
                  'Employee salaries',
                  'Minimum 3 employees required'
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 px-3 py-2 bg-white/80 border border-[#b8860b]/20 rounded-lg text-left shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:border-[#b8860b]/50 transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B58C36] shrink-0" />
                    <span className="font-sans text-[0.78rem] md:text-[clamp(0.72rem,0.78vw,0.82rem)] font-semibold text-[#2A2D34] leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t border-[#b8860b]/25 text-center w-full">
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <div className="w-6 h-px bg-[#b8860b]/40" />
                  <span className="text-[#946E1E] text-xs">❖</span>
                  <div className="w-6 h-px bg-[#b8860b]/40" />
                </div>
                <p className="font-sans text-[clamp(0.7rem,0.75vw,0.78rem)] leading-[1.38] text-[#4A4E58] m-0 font-medium">
                  Commission varies from <strong className="text-[#1A1D20] font-bold">19% to 69%</strong> depending on design.
                </p>
              </div>
            </div>
          </div>

          <div className="p-[clamp(1.1rem,1.8vw,2rem)] border-b max-md:border-b md:border-b-0 md:border-r border-[#b8860b]/35 flex flex-col items-center text-center justify-between">

            <div className="flex flex-col items-center text-center gap-1.5 mb-3 w-full justify-start">
              <div className="w-[28px] h-[28px] min-w-[28px] rounded-[6px] bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                <Megaphone size={15} color="#946E1E" />
              </div>
              <h3 className="font-serif text-[clamp(0.82rem,0.88vw,0.94rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0 text-center leading-[1.25]">
                Marketing & Advertising<br />by Company
              </h3>
            </div>

            <div className="my-auto py-2 flex items-center justify-center">
              <div className="w-[50px] h-[50px] rounded-2xl bg-[#18191E] border-[1.5px] border-[#D4AF37] flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.1)]">
                <svg width="34" height="34" viewBox="0 0 56 56" fill="none">
                  <g transform="translate(4, 4)">

                    <path d="M10 20 L22 14 L32 8 L32 32 L22 26 L10 20 Z" fill="#18191E" stroke="#D4AF37" strokeWidth="2.2" strokeLinejoin="round" />

                    <path d="M16 23 L16 36 L21 36 L21 26" fill="#18191E" stroke="#D4AF37" strokeWidth="2.2" strokeLinejoin="round" />

                    <rect x="5" y="17" width="5" height="6" rx="1.5" fill="#D4AF37" />

                    <ellipse cx="32" cy="20" rx="3.5" ry="12" fill="#24262C" stroke="#D4AF37" strokeWidth="2.2" />

                    <path d="M38 12 L43 9 M40 20 L47 20 M38 28 L43 31" stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>

            <p className="mt-auto pt-2 font-sans text-[clamp(0.72rem,0.76vw,0.8rem)] leading-[1.48] text-[#4A4E58] m-0 font-[450] text-center">
              Cavree bears all expenses related to digital marketing, online portals, advertising, and promotional activities.
            </p>
          </div>

          <div className="p-[clamp(1.1rem,1.8vw,2rem)] flex flex-col items-center text-center justify-between">

            <div className="flex flex-col items-center text-center gap-1.5 mb-3 w-full justify-start">
              <div className="w-[28px] h-[28px] min-w-[28px] rounded-[6px] bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                <ShieldCheck size={15} color="#946E1E" />
              </div>
              <h3 className="font-serif text-[clamp(0.82rem,0.88vw,0.94rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0 text-center leading-[1.25]">
                Monthly Minimum<br />Guarantee
              </h3>
            </div>

            <div className="my-auto py-2 flex items-center justify-center">
              <div className="w-[50px] h-[50px] rounded-2xl bg-[#18191E] border-[1.5px] border-[#D4AF37] flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.1)]">
                <svg width="32" height="32" viewBox="0 0 52 52" fill="none">

                  <path d="M26 6 L39 11 C39 26 33 38 26 46 C19 38 13 26 13 11 L26 6 Z" fill="#18191E" stroke="#D4AF37" strokeWidth="2.2" strokeLinejoin="round" />

                  <circle cx="26" cy="25" r="9" fill="none" stroke="#D4AF37" strokeWidth="1.3" />
                  <text x="26" y="28.5" textAnchor="middle" fill="#FAF6EE" fontSize="11" fontWeight="bold" fontFamily="'Outfit', sans-serif">₹</text>
                </svg>
              </div>
            </div>

            <p className="mt-auto pt-2 font-sans text-[clamp(0.72rem,0.76vw,0.8rem)] leading-[1.48] text-[#4A4E58] m-0 font-[450] text-center">
              Cavree provides a monthly minimum guarantee for each store, considering stock investment, rent, salaries, electricity bills, and other store-related expenses.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};

export default InvestmentRecoverySection;
