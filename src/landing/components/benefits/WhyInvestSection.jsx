import React from 'react';
import { 
  CheckSquare, 
  Percent, 
  MapPin, 
  Sparkles, 
  UserCheck, 
  KeyRound 
} from 'lucide-react';

export const WhyInvestSection = () => {
  const topHighlights = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <path d="M25 8 C23 5 30 11 32 12 C34 11 41 5 39 8 C38 12 35 13 32 13 C29 13 26 12 25 8 Z" fill="#1C1D21" stroke="#C5A059" strokeWidth="1.5" />
          <rect x="26" y="13" width="12" height="3.5" rx="1.5" fill="#D4AF37" />
          <path d="M32 16 C20 16 13 26 12 37 C11 48 18 57 32 57 C46 57 53 48 52 37 C51 26 44 16 32 16 Z" fill="#18191E" stroke="#C5A059" strokeWidth="2" />
          <path d="M16 38 C16 48 22 54 32 54" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
          <circle cx="32" cy="38" r="9.5" fill="#D4AF37" />
          <text x="32" y="42" textAnchor="middle" fill="#18191E" fontSize="12" fontWeight="800" fontFamily="'Outfit', sans-serif">₹</text>
        </svg>
      ),
      text: '₹2L to ₹6L monthly income potential',
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <path d="M32 8 L48 14 C48 31 41 46 32 56 C23 46 16 31 16 14 L32 8 Z" fill="#18191E" stroke="#C5A059" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 12 L44 17 C44 29 38 42 32 50 C26 42 20 29 20 17 L32 12 Z" fill="#202227" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M26 31 L30 36 L39 25" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      text: '100% minimum guarantee from Cavree',
    },
    {
      icon: (
        <svg width="50" height="48" viewBox="0 0 64 64" fill="none">
          <g transform="translate(16, 3)">
            <path d="M16 0 L30 7 L16 14 L2 7 Z" fill="#2E3038" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M2 7 L16 14 L16 28 L2 21 Z" fill="#18191E" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M16 14 L30 7 L30 21 L16 28 Z" fill="#22242B" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M13 1.5 L19 4.5 L19 28 L13 25 Z" fill="#D4AF37" fillOpacity="0.85" />
          </g>
          <g transform="translate(2, 23)">
            <path d="M14 0 L26 6 L14 12 L2 6 Z" fill="#2E3038" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M2 6 L14 12 L14 24 L2 18 Z" fill="#18191E" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M14 12 L26 6 L26 18 L14 24 Z" fill="#22242B" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M11 1.5 L17 4.5 L17 24 L11 21 Z" fill="#D4AF37" fillOpacity="0.85" />
          </g>
          <g transform="translate(30, 23)">
            <path d="M14 0 L26 6 L14 12 L2 6 Z" fill="#2E3038" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M2 6 L14 12 L14 24 L2 18 Z" fill="#18191E" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M14 12 L26 6 L26 18 L14 24 Z" fill="#22242B" stroke="#C5A059" strokeWidth="1.5" />
            <path d="M11 1.5 L17 4.5 L17 24 L11 21 Z" fill="#D4AF37" fillOpacity="0.85" />
          </g>
        </svg>
      ),
      text: '100% capital secured in stock',
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <path d="M20 18 A 18 18 0 0 1 48 20" stroke="#18191E" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="48,13 56,21 46,26" fill="#18191E" />
          <path d="M44 46 A 18 18 0 0 1 16 44" stroke="#18191E" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="16,51 8,43 18,38" fill="#18191E" />
          <circle cx="32" cy="32" r="16" stroke="#C5A059" strokeWidth="2" fill="none" />
          <text x="32" y="37.5" textAnchor="middle" fill="#18191E" fontSize="13.5" fontWeight="800" fontFamily="'Outfit', sans-serif">10%</text>
        </svg>
      ),
      text: '10% monthly turnover return',
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <rect x="13" y="24" width="38" height="30" rx="3" fill="#18191E" stroke="#C5A059" strokeWidth="2" />
          <rect x="10" y="18" width="44" height="8" rx="2" fill="#24262C" stroke="#C5A059" strokeWidth="1.8" />
          <rect x="29" y="18" width="6" height="36" fill="#D4AF37" />
          <rect x="13" y="35" width="38" height="5" fill="#D4AF37" />
          <path d="M32 18 C26 7 14 10 22 18 Z" fill="#D4AF37" stroke="#946E1E" strokeWidth="1" />
          <path d="M32 18 C38 7 50 10 42 18 Z" fill="#D4AF37" stroke="#946E1E" strokeWidth="1" />
          <circle cx="32" cy="18" r="3.5" fill="#F8E29B" />
        </svg>
      ),
      text: '₹45L–₹70L free store setup support',
    },
    {
      icon: (
        <svg width="56" height="48" viewBox="0 0 74 64" fill="none">
          <rect x="4" y="14" width="36" height="24" rx="2.5" fill="#18191E" stroke="#C5A059" strokeWidth="2" />
          <rect x="8" y="18" width="28" height="16" fill="#FAF6EE" fillOpacity="0.12" />
          <circle cx="22" cy="35.5" r="1" fill="#D4AF37" />
          <path d="M22 38 L22 46 M14 46 L30 46" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(42, 10)">
            <rect x="22" y="16" width="3.5" height="15" rx="1" fill="#C5A059" />
            <path d="M22 24 L14 24 L12 18" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M14 12 L-1 21 L1 25 L16 16 Z" fill="#18191E" stroke="#C5A059" strokeWidth="2" strokeLinejoin="round" />
            <path d="M16 10 L-3 20" stroke="#C5A059" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="-1,20 -4,22 -2,25 1,23" fill="#D4AF37" />
            <circle cx="0" cy="22" r="1.2" fill="#E53E3E" />
          </g>
        </svg>
      ),
      text: '24/7 live CCTV & ERP login access',
    },
  ];

  const checklistItems = [
    { label: 'Teak Woodwork', colSpanClass: 'col-span-1' },
    { label: 'Electrical Works', colSpanClass: 'col-span-1' },
    { label: 'Glass Fittings', colSpanClass: 'col-span-1' },
    { label: 'Cloud Billing POS', colSpanClass: 'col-span-1' },
    { label: 'Barcode Scanners', colSpanClass: 'col-span-1' },
    { label: 'Anti-Theft Tags', colSpanClass: 'col-span-1' },
    { label: 'RFID Antennas', colSpanClass: 'col-span-1' },
    { label: 'Footfall Counter', colSpanClass: 'col-span-2' },
    { label: 'Central VRF AC', colSpanClass: 'col-span-1' },
    { label: 'Premium SPC Flooring', colSpanClass: 'col-span-2' },
    { label: 'Store Advance Support', colSpanClass: 'col-span-3' },
  ];

  return (
    <section
      id="benefits"
      className="why-invest-section relative py-[2.2rem] pb-[1.5rem] bg-[#FAF6EE] text-[#1A1D20] border-t border-[#D4AF37]/30"
    >
      <div className="container max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)]">

        <div className="flex items-center justify-center gap-5 mb-[1.4rem]">
          <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#b8860b]/50 max-w-[280px]" />
          <h2 className="font-serif text-[clamp(1.15rem,1.8vw,1.6rem)] font-bold tracking-[0.08em] uppercase text-center m-0 text-[#1A1D20]">
            Why Invest in Cavree / Key Benefits
          </h2>
          <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent to-[#b8860b]/50 max-w-[280px]" />
        </div>

        <div className="why-invest-strip grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 mb-7 bg-transparent">
          {topHighlights.map((item, idx) => (
            <div
              key={idx}
              className={`why-invest-strip-item flex flex-col items-center text-center px-[clamp(0.4rem,0.8vw,0.85rem)] py-[0.35rem] max-lg:border-b-[1.5px] max-lg:border-dashed max-lg:border-[#b8860b]/45 ${
                idx !== topHighlights.length - 1 ? 'lg:border-r-[1.5px] lg:border-dashed lg:border-[#b8860b]/45' : ''
              } ${
                (idx + 1) % 2 !== 0 ? 'max-sm:border-r-[1.5px] max-sm:border-dashed max-sm:border-[#b8860b]/45' : ''
              } ${
                (idx + 1) % 3 !== 0 ? 'sm:max-lg:border-r-[1.5px] sm:max-lg:border-dashed sm:max-lg:border-[#b8860b]/45' : ''
              }`}
            >
              <div className="h-[42px] flex items-center justify-center mb-[0.45rem]">
                {item.icon}
              </div>
              <p className="font-sans text-[clamp(0.72rem,0.8vw,0.82rem)] leading-[1.35] text-[#2A2D34] m-0 font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="why-invest-main-grid grid grid-cols-1 lg:grid-cols-[58%_42%] border-[1.5px] border-[#b8860b]/45 rounded-md bg-[#FDFBF7] shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">

          <div className="why-invest-left-subgrid grid grid-cols-1 sm:grid-cols-2 max-lg:border-b-[1.5px] max-lg:border-[#b8860b]/45 lg:border-r-[1.5px] lg:border-[#b8860b]/45">

            <div className="p-[clamp(1.2rem,1.8vw,1.85rem)] border-b border-[#b8860b]/30 sm:border-r">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded bg-gradient-to-br from-[#D4AF37]/[0.18] to-[#b8860b]/[0.08] border-[1.2px] border-[#b8860b]/45 flex items-center justify-center">
                  <Percent size={16} color="#946E1E" strokeWidth={2.5} />
                </div>
                <h3 className="font-serif text-[clamp(0.95rem,1.05vw,1.15rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0">
                  Commission on Sales
                </h3>
              </div>
              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.6] text-[#4A4E58] m-0 font-[450]">
                Earn <strong className="text-[#1A1D20] font-semibold">19% to 69% profit share</strong> on retail sales with zero intermediary cuts.
              </p>
            </div>

            <div className="p-[clamp(1.2rem,1.8vw,1.85rem)] border-b border-[#b8860b]/30">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded bg-gradient-to-br from-[#D4AF37]/[0.18] to-[#b8860b]/[0.08] border-[1.2px] border-[#b8860b]/45 flex items-center justify-center">
                  <MapPin size={16} color="#946E1E" strokeWidth={2.5} />
                </div>
                <h3 className="font-serif text-[clamp(0.95rem,1.05vw,1.15rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0">
                  Prime Store Location
                </h3>
              </div>
              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.6] text-[#4A4E58] m-0 font-[450]">
                <strong className="text-[#1A1D20] font-semibold">1,000 to 1,200 sq. ft.</strong> in verified high-footfall retail clusters approved by Cavree.
              </p>
            </div>

            <div className="p-[clamp(1.2rem,1.8vw,1.85rem)] border-b sm:border-b-0 border-[#b8860b]/30 sm:border-r">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded bg-gradient-to-br from-[#D4AF37]/[0.18] to-[#b8860b]/[0.08] border-[1.2px] border-[#b8860b]/45 flex items-center justify-center">
                  <UserCheck size={16} color="#946E1E" strokeWidth={2.5} />
                </div>
                <h3 className="font-serif text-[clamp(0.95rem,1.05vw,1.15rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0">
                  Investor Verification
                </h3>
              </div>
              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.6] text-[#4A4E58] m-0 font-[450]">
                Seamless partner onboarding ensuring exclusive territory protection for qualified investors.
              </p>
            </div>

            <div className="p-[clamp(1.2rem,1.8vw,1.85rem)]">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded bg-gradient-to-br from-[#D4AF37]/[0.18] to-[#b8860b]/[0.08] border-[1.2px] border-[#b8860b]/45 flex items-center justify-center">
                  <KeyRound size={16} color="#946E1E" strokeWidth={2.5} />
                </div>
                <h3 className="font-serif text-[clamp(0.95rem,1.05vw,1.15rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0">
                  Stock Investment & Access
                </h3>
              </div>
              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.6] text-[#4A4E58] m-0 font-[450]">
                <strong className="text-[#1A1D20] font-semibold">₹55L to ₹99L</strong> secured in inventory with live CCTV surveillance & cloud ERP access.
              </p>
            </div>
          </div>

          <div className="p-[clamp(1.2rem,1.8vw,1.85rem)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded bg-gradient-to-br from-[#D4AF37]/[0.18] to-[#b8860b]/[0.08] border-[1.2px] border-[#b8860b]/45 flex items-center justify-center">
                  <Sparkles size={16} color="#946E1E" strokeWidth={2.5} />
                </div>
                <h3 className="font-serif text-[clamp(0.95rem,1.05vw,1.15rem)] font-bold tracking-[0.03em] uppercase text-[#1A1D20] m-0">
                  Turnkey Store Setup by Cavree
                </h3>
              </div>

              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.5] text-[#4A4E58] mb-1 font-[450]">
                The company covers 100% of the boutique interior fit-out.
              </p>
              <p className="font-sans text-[clamp(0.82rem,0.9vw,0.88rem)] leading-[1.5] text-[#4A4E58] mb-4 font-[450]">
                Company setup support: <strong className="text-[#946E1E] font-bold">₹45 Lakhs to ₹70 Lakhs.</strong>
              </p>
            </div>

            <div className="why-invest-checklist-table grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 p-1.5 bg-[#FAF6EE] border border-[#b8860b]/35 rounded-xl">
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-2.5 py-2 bg-white/85 border border-[#b8860b]/20 rounded-lg font-sans text-[clamp(0.72rem,0.78vw,0.82rem)] text-[#1A1D20] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                    idx === checklistItems.length - 1 && checklistItems.length % 2 !== 0
                      ? 'col-span-2 sm:col-span-2 lg:col-span-1'
                      : ''
                  }`}
                >
                  <CheckSquare size={14} color="#946E1E" strokeWidth={2.2} className="min-w-[14px] shrink-0" />
                  <span className="leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyInvestSection;
