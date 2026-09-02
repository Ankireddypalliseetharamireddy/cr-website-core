import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Check,
  Home,
  Mail,
  RotateCcw,
  ShieldCheck,
  Clock,
  FileCheck2,
  Copy,
  CheckCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CavreeLogo from '../../components/brand/CavreeLogo';

export const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const rawName = stateData.name || '';
  const investorName = rawName ? rawName.replace(/([a-z])([A-Z])/g, '$1 $2').trim() : '';
  const territory = stateData.cityState || 'National Priority Market';
  const referenceId = stateData.refId || '782097';

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#D4AF37', '#FFF3B3', '#C59B27', '#10B981', '#1C1D21'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@cavree.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`CAV-INV-${referenceId}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2200);
  };

  return (
    <div className="thank-you-page min-h-screen w-full bg-[#FAF6EE] text-[#1C1D21] py-6 sm:py-8 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-x-hidden box-border">

      {/* Luxury Ambient Glow Background Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-br from-[#D4AF37]/12 via-[#FFF3B3]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[300px] bg-[#DEC29D]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-[840px] w-full mx-auto relative z-10 flex flex-col items-center">

        {/* Brand Header Lockup - Direct & Compact above Card */}
        <div className="flex flex-col items-center justify-center mb-4 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="cursor-pointer no-underline flex items-center justify-center transform hover:scale-[1.03] transition-all duration-300"
            title="Return to Cavree Home"
          >
            <CavreeLogo size="md" showText={true} variant="light" />
          </a>
        </div>

        {/* Main Certificate / Dossier Card */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#DEC29D]/70 shadow-[0_16px_50px_rgba(181,140,54,0.08),0_2px_8px_rgba(0,0,0,0.03)] p-5 sm:p-7 md:p-8 relative overflow-hidden">
          
          {/* Top Gold Metallic Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37] to-[#D4AF37]/20" />

          {/* Verification Badge & Title Section - Tight, cohesive spacing with zero giant gaps */}
          <div className="flex flex-col items-center text-center">
            
            {/* Animated Gold Crest */}
            <div className="relative mb-2.5 flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#1C1D21] to-[#0A0B0E] border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.35)] flex items-center justify-center relative">
                <Check size={24} className="text-[#D4AF37]" strokeWidth={3} />
                <span className="absolute -inset-1 rounded-full border border-[#D4AF37]/40 animate-ping opacity-30 pointer-events-none" />
              </div>
            </div>

            {/* Confidential Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.8 rounded-full bg-[#FAF6EE] border border-[#DEC29D]/80 mb-2">
              <Sparkles size={11} className="text-[#946E1E]" />
              <span className="font-sans text-[0.65rem] sm:text-[0.7rem] font-extrabold uppercase tracking-wider text-[#946E1E]">
                Investor Inquiry Confirmed • Priority Dispatch
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-[2.2rem] font-bold text-[#1C1D21] tracking-tight m-0 mb-2 leading-tight">
              Thank You{investorName ? `, ${investorName}` : ''}!
            </h1>

            {/* Confirmation Description */}
            <p className="font-sans text-xs sm:text-[0.92rem] text-[#555862] max-w-[620px] mx-auto mb-5 leading-relaxed font-normal text-center">
              We have safely received your franchise and investment enquiry. The Cavree executive desk is reviewing your territory requirements and will connect with you within <strong className="text-[#1C1D21] font-bold">4 business hours</strong> with the comprehensive 6-Year FOCO financial model and feasibility appraisal.
            </p>
          </div>

          {/* Key Dossier Summary Grid */}
          <div className="w-full bg-[#FAF6EE]/80 border border-[#DEC29D]/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
            
            {/* Dossier Code */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:border-r sm:border-[#DEC29D]/40 sm:pr-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#DEC29D]/60 flex items-center justify-center text-[#946E1E] shrink-0 shadow-xs">
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-[#8E9098] block">
                    Dossier Code
                  </span>
                  <span className="font-mono font-bold text-[#1C1D21] text-xs sm:text-sm">
                    CAV-INV-{referenceId}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRef}
                className="p-1.5 rounded-lg bg-white border border-[#DEC29D]/40 hover:bg-[#DEC29D]/20 text-[#946E1E] transition-colors cursor-pointer text-xs flex items-center gap-1 sm:ml-auto"
                title="Copy Dossier Code"
              >
                {copiedRef ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Target Market */}
            <div className="flex items-center gap-2.5 sm:border-r sm:border-[#DEC29D]/40 sm:pr-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#DEC29D]/60 flex items-center justify-center text-[#946E1E] shrink-0 shadow-xs">
                <MapPin size={16} />
              </div>
              <div className="overflow-hidden">
                <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-[#8E9098] block">
                  Target Territory
                </span>
                <span className="font-sans font-bold text-[#1C1D21] text-xs sm:text-sm truncate block max-w-[170px]" title={territory}>
                  {territory}
                </span>
              </div>
            </div>

            {/* Live Status */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
                <Clock size={16} />
              </div>
              <div>
                <span className="font-sans text-[0.6rem] font-bold uppercase tracking-wider text-[#8E9098] block">
                  Underwriting Status
                </span>
                <span className="inline-flex items-center gap-1.5 font-sans font-bold text-xs text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Executive Review Active
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps 3-Milestone Flow */}
          <div className="w-full mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-sans text-[0.68rem] font-extrabold uppercase tracking-wider text-[#946E1E]">
                What Happens Next
              </span>
              <div className="flex-1 h-px bg-[#DEC29D]/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-left">
              
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-white border border-[#DEC29D]/40 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4.5 h-4.5 rounded-full bg-[#1C1D21] text-white font-sans text-[0.62rem] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="font-sans text-xs font-bold text-[#1C1D21]">
                    Territory Mapping
                  </span>
                </div>
                <p className="font-sans text-[0.74rem] text-[#6E7079] leading-snug m-0">
                  Assessment of high-street footfalls, market catchment, and exclusive territory viability.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl bg-[#FAF6EE]/90 border border-[#DEC29D]/70 shadow-xs flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4.5 h-4.5 rounded-full bg-[#D4AF37] text-[#0A0B0E] font-sans text-[0.62rem] font-black flex items-center justify-center">
                    2
                  </span>
                  <span className="font-sans text-xs font-bold text-[#1C1D21]">
                    Executive Consultation
                  </span>
                </div>
                <p className="font-sans text-[0.74rem] text-[#6E7079] leading-snug m-0">
                  Senior Investment Director connects within 4 hours to review the 6-Year FOCO model.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl bg-white border border-[#DEC29D]/40 shadow-xs flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-4.5 h-4.5 rounded-full bg-[#1C1D21] text-white font-sans text-[0.62rem] font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="font-sans text-xs font-bold text-[#1C1D21]">
                    Discovery & Onboarding
                  </span>
                </div>
                <p className="font-sans text-[0.74rem] text-[#6E7079] leading-snug m-0">
                  Prime site appraisal, FOCO agreement finalization, and turnkey setup initiation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Row & Concierge Contact */}
          <div className="w-full grid grid-cols-1 md:grid-cols-[1.1fr_1.9fr] gap-2.5 pt-2.5 border-t border-[#DEC29D]/30">
            
            {/* Investor Desk Email */}
            <div className="bg-[#FAF6EE] border border-[#DEC29D]/60 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#DEC29D]/50 flex items-center justify-center text-[#946E1E] shrink-0">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <span className="font-sans text-[0.56rem] font-bold uppercase tracking-wider text-[#8E9098] block">
                    Official Investor Desk
                  </span>
                  <span className="font-sans text-xs font-bold text-[#1C1D21] truncate block">
                    contact@cavree.com
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 rounded-md bg-white hover:bg-[#DEC29D]/30 text-[#946E1E] transition-colors cursor-pointer shrink-0 border border-[#DEC29D]/40"
                title="Copy Email Address"
              >
                {copiedEmail ? <CheckCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Navigation CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#1C1D21] hover:bg-[#2A2D34] text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <Home size={14} />
                <span>Return to Home</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/investment-model#contact')}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C99E32] to-[#B58C36] hover:brightness-105 text-[#0A0B0E] font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <RotateCcw size={14} />
                <span>Submit Another Inquiry</span>
              </button>
            </div>
          </div>

        </div>

        {/* Security / Trust Badges */}
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 font-sans text-[0.68rem] text-[#7A7C85]">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#946E1E]" />
            100% Confidential Investor Dossier
          </span>
          <span className="text-[#DEC29D] hidden sm:inline">•</span>
          <span>Asset-Backed 6-Year FOCO Model</span>
          <span className="text-[#DEC29D] hidden sm:inline">•</span>
          <span>Standard Turnkey Retail Framework</span>
        </div>

        {/* Footer */}
        <footer className="w-full text-center font-sans text-[0.7rem] text-[#8E9098] mt-3.5 pt-2.5 border-t border-[#DEC29D]/30 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>© {new Date().getFullYear()} Cavree. All rights reserved.</span>
          <span className="text-[#DEC29D] hidden sm:inline">•</span>
          <span>
            Designed &amp; Developed by{' '}
            <a
              href="https://mkrinfotech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#946E1E] font-bold hover:underline no-underline"
            >
              MKR INFOTECH
            </a>
          </span>
        </footer>

      </div>
    </div>
  );
};

export default ThankYouPage;
