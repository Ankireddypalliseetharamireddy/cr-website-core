import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Crown,
  Hammer,
  Lightbulb,
  Palette,
  Sparkles,
  Layers3,
  ArrowRight,
  Gem,
  Award,
  ArrowUpRight,
} from "lucide-react";
import ScrollReveal from "../../components/common/ScrollReveal";

const VALUES = [
  {
    title: "Fabric",
    icon: Layers3,
    highlight: "Pure Luxury",
    description:
      "We handpick breathable, luxurious fabrics that feel gentle on the skin, drape naturally, and retain their elegance over time.",
  },
  {
    title: "Design",
    icon: Palette,
    highlight: "Modern Heritage",
    description:
      "Unique silhouettes that effortlessly bridge traditional Indian heritage with contemporary high-fashion aesthetics.",
  },
  {
    title: "Detail",
    icon: Sparkles,
    highlight: "Intricate Art",
    description:
      "From delicate golden zari embroidery to precision pleating and rich textures, every detail is sculpted with utmost intention.",
  },
  {
    title: "Craftsmanship",
    icon: Hammer,
    highlight: "Master Tailoring",
    description:
      "Impeccable artisan tailoring, reinforced finishing, and harmonious royal color combinations reflecting perfection.",
  },
  {
    title: "Creativity",
    icon: Lightbulb,
    highlight: "Continuous Innovation",
    description:
      "We constantly explore new hues, contemporary patterns, and festive silhouettes while preserving timeless grace.",
  },
  {
    title: "Confidence",
    icon: Crown,
    highlight: "Unapologetically You",
    description:
      "Every Cavree creation is designed to make you feel empowered, elegant, beautiful, and completely yourself.",
  },
];

const EMOTIONS = [
  {
    icon: Crown,
    title: "Confidence",
    text: "The undeniable feeling of self-assurance and grace the moment you wear Cavree.",
  },
  {
    icon: Sparkles,
    title: "Elegance",
    text: "An effortless aura of sophistication that commands admiration whenever you enter a room.",
  },
  {
    icon: Gem,
    title: "Individuality",
    text: "Couture fashion that speaks your personal story and celebrates who you truly are.",
  },
];

const JEWELLERY = [
  {
    image: "/images/cavree/jewellery-necklace.jpg",
    title: "Filigree Gold Necklace",
    category: "Signature Collection",
    alt: "Cavree handcrafted one gram gold filigree necklace",
  },
  {
    image: "/images/cavree/jewellery-earrings.jpg",
    title: "Royal Jhumka Earrings",
    category: "Heritage Collection",
    alt: "Cavree luxury gold jhumka earrings with ruby stones",
  },
  {
    image: "/images/cavree/jewellery-bangles.jpg",
    title: "Embossed Artisan Bangles",
    category: "Temple Motifs",
    alt: "Cavree traditional gold embossed bangles and kadas",
  },
  {
    image: "/images/cavree/jewellery-set.jpg",
    title: "Bridal Suite & Choker",
    category: "Festive Suite",
    alt: "Cavree complete bridal one gram gold jewellery suite",
  },
];

const GoldDivider = ({ centered = false }) => (
  <div className={`my-3.5 flex items-center gap-2.5 ${centered ? "justify-center" : "justify-start"}`}>
    <div className="h-px w-10 bg-gradient-to-r from-transparent via-[#DEC29D] to-[#B58C36]" />
    <Sparkles size={11} className="text-[#B58C36]" />
    <div className="h-px w-10 bg-gradient-to-l from-transparent via-[#DEC29D] to-[#B58C36]" />
  </div>
);

{/* Dedicated Glowing Silk Wave Ribbon Graphic */}
const SilkWaveBand = ({ flip = false, className = "" }) => (
  <div className={`relative w-full h-[45px] sm:h-[65px] overflow-hidden pointer-events-none ${className}`}>
    <svg
      className={`w-full h-full ${flip ? "rotate-180" : ""}`}
      viewBox="0 0 1440 90"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`goldWaveGrad_${flip ? "f" : "n"}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8C6514" stopOpacity="0" />
          <stop offset="20%" stopColor="#D4AF37" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#FFF8D6" stopOpacity="0.95" />
          <stop offset="80%" stopColor="#D4AF37" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#8C6514" stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`goldWaveFill_${flip ? "f" : "n"}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
          <stop offset="25%" stopColor="#FFF3B3" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#8C6514" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#8C6514" stopOpacity="0" />
        </linearGradient>

        <filter id={`goldWaveGlow_${flip ? "f" : "n"}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <path
        d="M -50 70 Q 320 10, 720 50 T 1490 20 L 1490 90 L -50 90 Z"
        fill={`url(#goldWaveFill_${flip ? "f" : "n"})`}
        filter={`url(#goldWaveGlow_${flip ? "f" : "n"})`}
      />

      <path
        d="M -50 68 Q 320 8, 720 48 T 1490 18"
        stroke={`url(#goldWaveGrad_${flip ? "f" : "n"})`}
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <path
        d="M -50 82 Q 380 25, 780 62 T 1490 35"
        stroke={`url(#goldWaveGrad_${flip ? "f" : "n"})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  </div>
);

export default function AboutUs() {
  const navigate = useNavigate();

  const handleDiscoverStory = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('our-story');
    if (el) {
      const navOffset = 64;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  };

  return (
    <main className="about-page relative w-full bg-[#FAF6EE] text-[#1C1D21] font-sans overflow-x-hidden selection:bg-[#DEC29D]/40 selection:text-[#1C1D21]">
      
      {/* ========================================================================= */}
      {/* UNIQUE LUXURY ILLUMINATED GOLD SILK WAVE BACKGROUND LAYER                */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle Gold Pin-Dot Matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(#DEC29D_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
        
        {/* Ambient Glowing Golden Halos */}
        <div className="absolute top-[2%] -left-[10%] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-[25%] -right-[10%] w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-[52%] left-[2%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.11)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-[78%] right-[5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] blur-3xl" />

        {/* Illuminated Gold Silk Ribbon Waves with Blur Glow Filters */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox="0 0 1440 3600"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="silkGoldGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#FFF3B3" stopOpacity="1" />
              <stop offset="70%" stopColor="#B58C36" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8C6514" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="silkGoldFillRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#FFF3B3" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#8C6514" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="silkGoldFillRibbon2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#FFF3B3" stopOpacity="0.22" />
              <stop offset="80%" stopColor="#8C6514" stopOpacity="0.12" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            <filter id="goldSilkGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ribbon 1: Hero Section Wave */}
          <path
            d="M -100 140 Q 220 40, 520 180 T 1140 120 Q 1380 80, 1600 200 L 1600 290 Q 1360 170, 1120 210 T 500 270 Q 200 130, -100 230 Z"
            fill="url(#silkGoldFillRibbon)"
            filter="url(#goldSilkGlowFilter)"
          />
          <path
            d="M -100 140 Q 220 40, 520 180 T 1140 120 Q 1380 80, 1600 200"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M -100 230 Q 200 130, 500 270 T 1120 210 Q 1360 170, 1600 290"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Ribbon 2: Our Story Wave */}
          <path
            d="M 1600 780 Q 1300 880, 950 740 T 350 820 Q 150 860, -100 740 L -100 830 Q 170 950, 370 910 T 970 830 Q 1320 970, 1600 870 Z"
            fill="url(#silkGoldFillRibbon2)"
            filter="url(#goldSilkGlowFilter)"
          />
          <path
            d="M 1600 780 Q 1300 880, 950 740 T 350 820 Q 150 860, -100 740"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 1600 870 Q 1320 970, 970 830 T 370 910 Q 170 950, -100 830"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Ribbon 3: Emotions / Confidence Wave */}
          <path
            d="M -100 1620 Q 260 1500, 600 1660 T 1200 1580 Q 1420 1520, 1600 1660 L 1600 1750 Q 1400 1610, 1180 1670 T 580 1750 Q 240 1590, -100 1710 Z"
            fill="url(#silkGoldFillRibbon)"
            filter="url(#goldSilkGlowFilter)"
          />
          <path
            d="M -100 1620 Q 260 1500, 600 1660 T 1200 1580 Q 1420 1520, 1600 1660"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M -100 1710 Q 240 1590, 580 1750 T 1180 1670 Q 1400 1610, 1600 1750"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Ribbon 4: Collections / Jewellery Wave */}
          <path
            d="M 1600 2480 Q 1280 2590, 920 2440 T 320 2520 Q 120 2560, -100 2440 L -100 2530 Q 140 2650, 340 2610 T 940 2530 Q 1300 2680, 1600 2570 Z"
            fill="url(#silkGoldFillRibbon2)"
            filter="url(#goldSilkGlowFilter)"
          />
          <path
            d="M 1600 2480 Q 1280 2590, 920 2440 T 320 2520 Q 120 2560, -100 2440"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M 1600 2570 Q 1300 2680, 940 2530 T 340 2610 Q 140 2650, -100 2530"
            stroke="url(#silkGoldGradMain)"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full py-[clamp(2rem,3.6vw,3.6rem)] px-[clamp(1rem,4vw,5rem)] border-b border-[#E8DFCF]/90 overflow-hidden bg-gradient-to-b from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE]">
        
        {/* Mobile Responsive Background Image Layer (Matches Home Hero) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none lg:hidden overflow-hidden z-0">
          <img
            src="/images/cavree/about-hero.jpg"
            alt="Cavree Luxury Haute Couture Fashion Boutique"
            className="w-full h-full object-cover object-[center_top] opacity-80 scale-105 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6EE] from-35% via-[#FAF6EE]/85 via-65% to-transparent" />
        </div>

        <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[54%_46%] gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Hero Narrative */}
          <ScrollReveal variant="fade-up" delay={50} duration={1100} className="flex flex-col justify-center max-lg:pt-[clamp(9rem,26vh,14rem)] max-lg:pb-6">

            <div className="mb-3 text-center lg:text-left">
              <h1 className="font-serif text-[clamp(2.1rem,3.8vw,4rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.02] m-0">
                CAVREE —
              </h1>
              <h1 className="font-serif text-[clamp(1.75rem,3.2vw,3.4rem)] font-extrabold tracking-[0.01em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] leading-[1.04] mt-1 mb-0">
                A Story Woven Into Every Thread
              </h1>
            </div>

            <p className="font-serif text-[clamp(1rem,1.35vw,1.25rem)] italic bg-clip-text text-transparent bg-gradient-to-r from-[#8C6514] via-[#B58C36] to-[#8C6514] mb-2 font-normal text-center lg:text-left">
              Fashion that defines you.
            </p>

            <div className="flex justify-center lg:justify-start">
              <GoldDivider />
            </div>

            <p className="font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.65] text-[#55565B] max-w-[560px] mx-auto lg:mx-0 mb-5 font-normal text-justify [text-justify:inter-word]">
              At Cavree, we believe that clothing is more than just fabric and design.
              It is an intimate expression of who you are — your confidence, your
              elegance, and your individuality. We bring timeless artistry and modern
              sensibilities into every silhouette we craft.
            </p>

            {/* CTA Action Buttons with Mobile-Optimized Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3 mb-6 max-w-[480px] mx-auto lg:mx-0">
              <button
                type="button"
                onClick={handleDiscoverStory}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#1C1D21] via-[#2A2B32] to-[#1C1D21] hover:from-[#B58C36] hover:via-[#D4AF37] hover:to-[#9E7E38] text-white font-sans text-[clamp(0.68rem,0.8vw,0.78rem)] font-bold tracking-[0.04em] sm:tracking-[0.06em] uppercase px-3 sm:px-5 py-3 rounded-[7px] transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)] cursor-pointer border-none text-center hover:scale-[1.02]"
              >
                <span>Discover Story</span>
                <ArrowRight size={13} className="text-[#DEC29D]" />
              </button>

              <Link
                to="/investment-model"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 border border-[#DEC29D] bg-gradient-to-b from-white to-[#FAF6EE] text-[#1C1D21] font-sans text-[clamp(0.68rem,0.8vw,0.78rem)] font-bold tracking-[0.04em] sm:tracking-[0.06em] uppercase px-3 sm:px-5 py-3 rounded-[7px] hover:border-[#1C1D21] hover:shadow-md transition-all duration-300 shadow-sm no-underline text-center hover:scale-[1.02]"
              >
                <span>Franchise Model</span>
                <ArrowUpRight size={13} className="text-[#B58C36]" />
              </Link>
            </div>

            {/* Quick 3 Stat Cards with Gold Gradient Metrics */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-[520px] mx-auto lg:mx-0">
              <div className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-2.5 sm:p-3 text-center shadow-[0_4px_14px_rgba(181,140,54,0.06)] hover:border-[#B58C36] transition-colors duration-300">
                <span className="font-serif text-[clamp(1.1rem,1.4vw,1.35rem)] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] block leading-none mb-0.5">
                  100%
                </span>
                <span className="font-sans text-[0.64rem] font-bold uppercase tracking-[0.06em] text-[#1C1D21]">
                  Artisan Quality
                </span>
              </div>

              <div className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-2.5 sm:p-3 text-center shadow-[0_4px_14px_rgba(181,140,54,0.06)] hover:border-[#B58C36] transition-colors duration-300">
                <span className="font-serif text-[clamp(1.1rem,1.4vw,1.35rem)] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] block leading-none mb-0.5">
                  1 Gram
                </span>
                <span className="font-sans text-[0.64rem] font-bold uppercase tracking-[0.06em] text-[#1C1D21]">
                  Gold Jewellery
                </span>
              </div>

              <div className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-2.5 sm:p-3 text-center shadow-[0_4px_14px_rgba(181,140,54,0.06)] hover:border-[#B58C36] transition-colors duration-300">
                <span className="font-serif text-[clamp(1.1rem,1.4vw,1.35rem)] font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] block leading-none mb-0.5">
                  Pan-India
                </span>
                <span className="font-sans text-[0.64rem] font-bold uppercase tracking-[0.06em] text-[#1C1D21]">
                  Store Network
                </span>
              </div>
            </div>

          </ScrollReveal>

          {/* Right Column: Hero Visual with Clean 7px Gold Border (Desktop Only) */}
          <ScrollReveal variant="fade-left" delay={200} duration={1200} className="hidden lg:block relative w-full h-[320px] sm:h-[380px] lg:h-[410px]">
            {/* Clean Luxury Framed Image */}
            <div className="relative w-full h-full rounded-[7px] overflow-hidden border-[1.5px] border-[#DEC29D] bg-[#EDE5D4] shadow-[0_10px_28px_rgba(181,140,54,0.14)]">
              <img
                src="/images/cavree/about-hero.jpg"
                alt="Cavree Luxury Haute Couture Fashion Boutique"
                className="w-full h-full object-cover object-center block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Luxury Tag Card */}
            <div className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-6 lg:-bottom-6 lg:-left-7 z-20 max-w-[260px] sm:max-w-[280px] bg-gradient-to-br from-[#14151C] to-[#08090C] text-white rounded-[7px] p-3 sm:p-3.5 shadow-[0_14px_32px_rgba(0,0,0,0.45)] border border-[#DEC29D]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Sparkles size={12} className="text-[#D4AF37]" />
                <span className="font-sans text-[0.65rem] font-bold tracking-[0.08em] uppercase text-[#DEC29D]">
                  Signature Brand
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-white mb-0.5 leading-tight">
                Cavree Haute Couture
              </h4>
              <p className="font-sans text-[0.68rem] text-white/75 leading-tight m-0">
                Bespoke garments &amp; 1 gram gold jewellery.
              </p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Floating Silk Ribbon Wave Accent */}
      <SilkWaveBand className="-mt-3 mb-0" />

      {/* ========================================================================= */}
      {/* 2. OUR STORY SECTION (LUXURY DARK AESTHETIC)                             */}
      {/* ========================================================================= */}
      <section
        id="our-story"
        className="scroll-mt-20 sm:scroll-mt-24 relative z-10 w-full bg-[radial-gradient(ellipse_at_50%_50%,#14151C_0%,#090A0D_65%,#030405_100%)] text-white py-[clamp(2.5rem,4.5vw,4.5rem)] px-[clamp(1rem,4vw,5rem)] border-y border-[#D4AF37]/40 shadow-[0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden"
      >
        {/* Ambient Gold Halo Accents */}
        <div className="absolute -top-12 left-1/4 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-12 right-1/4 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Story Visual with 7px Radius & Gold Luminous Border */}
          <ScrollReveal variant="fade-right" delay={100} duration={1100} className="relative w-full h-[290px] sm:h-[350px] lg:h-[380px]">
            <div className="relative w-full h-full overflow-hidden rounded-[7px] border-[1.5px] border-[#D4AF37]/60 bg-[#0D0E12] shadow-[0_14px_36px_rgba(0,0,0,0.6)]">
              <img
                src="/images/cavree/story.jpg"
                alt="Cavree Artisanal Master Craftsmanship"
                className="w-full h-full object-cover block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-2.5 rounded-[7px] bg-gradient-to-br from-[#14151C]/95 to-[#08090C]/95 backdrop-blur-md border border-[#D4AF37]/60 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFF3B3] to-[#8C6514] flex items-center justify-center text-[#0D0E12] shadow-sm">
                    <Hammer size={15} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h4 className="font-serif text-xs font-bold text-white m-0 leading-tight">Artisan Atelier</h4>
                    <p className="font-sans text-[0.65rem] text-[#DEC29D] m-0">Pure Silk &amp; Hand-Embroidery</p>
                  </div>
                </div>
                <Award size={18} className="text-[#D4AF37]" />
              </div>
            </div>
          </ScrollReveal>

          {/* Story Narrative Content */}
          <ScrollReveal variant="fade-left" delay={200} duration={1100} className="flex flex-col justify-center">

            <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase text-white leading-[1.08] m-0">
              Designed from an idea.
            </h2>
            <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#FFF3B3] to-[#AA7C11] leading-[1.08] mt-0.5 mb-0">
              Created with passion.
            </h2>

            <GoldDivider />

            <div className="space-y-3 font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.65] text-white/80 font-normal text-justify [text-justify:inter-word]">
              <p>
                Every Cavree creation begins with an idea: to create fashion that
                feels beautiful, looks sophisticated, and makes every woman feel
                uniquely special.
              </p>

              <p>
                From selecting the right fabric to developing bespoke designs, every
                step is carefully planned. Our fabrics are chosen for their comfort,
                quality, texture, and ability to bring a silhouette to life.
              </p>

              <p>
                Then comes the art of creation. Skilled craftsmanship and modern
                tailoring techniques come together to transform a simple piece of
                fabric into something truly extraordinary.
              </p>
            </div>

            {/* Featured Quote Box in Luxury Dark Glassmorphism */}
            <div className="mt-5 p-4 rounded-[7px] bg-[#0D0E12]/90 backdrop-blur-md border-l-4 border-l-[#D4AF37] border-y border-r border-[#D4AF37]/40 shadow-[0_6px_20px_rgba(0,0,0,0.5)]">
              <p className="font-serif text-sm sm:text-base italic text-[#F3E5AB] leading-relaxed m-0">
                “Every stitch represents precision. Every design represents creativity.
                Every piece carries the soul of true elegance.”
              </p>
              <span className="mt-1.5 block font-sans text-[0.68rem] font-bold uppercase tracking-widest text-[#D4AF37]">
                — The Cavree Heritage
              </span>
            </div>

          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. OUR VALUES - CRAFTED WITH PURPOSE                                      */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full bg-gradient-to-b from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE] py-[clamp(2.5rem,4.5vw,4.5rem)] px-[clamp(1rem,4vw,5rem)] border-b border-[#E8DFCF]/90">
        <div className="max-w-[1480px] mx-auto">
          
          <ScrollReveal variant="fade-up" delay={50} duration={1000} className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <h2 className="font-serif text-[clamp(1.6rem,3vw,3.2rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.08] m-0">
              Crafted with{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514]">
                Purpose
              </span>
            </h2>
            <GoldDivider centered />
            <p className="font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.65] text-[#55565B] m-0 font-normal">
              Every detail that brings a Cavree design to life is thoughtfully considered —
              from fabric selection and silhouettes to embroidery, finishing, and color combinations.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 max-w-[1240px] mx-auto">
            {VALUES.map(({ title, icon: Icon, highlight, description }, idx) => (
              <ScrollReveal
                key={title}
                variant="scale-up"
                delay={100 + idx * 70}
                duration={950}
                className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-4 sm:p-4.5 text-center shadow-[0_4px_16px_rgba(181,140,54,0.06)] hover:shadow-[0_10px_28px_rgba(181,140,54,0.14)] hover:border-[#B58C36] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFF3D1] via-[#FAF6EE] to-[#EBD5B0] border border-[#DEC29D] text-[#9E7E38] mx-auto mb-2.5 flex items-center justify-center shadow-sm">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>

                  <span className="font-sans text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#B58C36] block mb-0.5">
                    {highlight}
                  </span>

                  <h3 className="font-serif text-base font-bold uppercase text-[#1C1D21] tracking-wide mb-1.5">
                    {title}
                  </h3>

                  <p className="font-sans text-[0.8rem] leading-[1.55] text-[#55565B] m-0 font-normal text-justify [text-justify:inter-word]">
                    {description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2 border-t border-[#E8DFCF]/70 flex items-center justify-between text-xs text-[#9E7E38]">
                  <span className="font-sans font-bold uppercase tracking-wider text-[0.62rem]">Cavree Standard</span>
                  <span>◆</span>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* Floating Silk Ribbon Wave Accent */}
      <SilkWaveBand flip className="-my-3" />

      {/* ========================================================================= */}
      {/* 4. WHAT EVERY PIECE CARRIES (EMOTIONS - LUXURY DARK AESTHETIC)           */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full bg-[radial-gradient(ellipse_at_50%_50%,#14151C_0%,#090A0D_65%,#030405_100%)] text-white py-[clamp(2.5rem,4.5vw,4.5rem)] px-[clamp(1rem,4vw,5rem)] border-y border-[#D4AF37]/40 shadow-[0_16px_40px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* Ambient Gold Halo Accents */}
        <div className="absolute -top-12 right-1/4 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />
        <div className="absolute -bottom-12 left-1/4 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />

        <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[56%_44%] gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Emotions Column */}
          <ScrollReveal variant="fade-right" delay={100} duration={1100} className="flex flex-col justify-center">

            <div className="text-center lg:text-left">
              <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase text-white leading-[1.08] m-0">
                What Every Cavree
              </h2>
              <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#FFF3B3] to-[#AA7C11] leading-[1.08] mt-0.5 mb-0">
                Piece Carries
              </h2>
            </div>

            <div className="flex justify-center lg:justify-start">
              <GoldDivider />
            </div>

            <p className="font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.65] text-white/80 mb-6 font-normal text-justify [text-justify:inter-word]">
              When you wear Cavree, it's never just about garments. It is an elevated emotion —
              crafted to celebrate your poise, your grace, and your memorable occasions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {EMOTIONS.map(({ icon: Icon, title, text }, idx) => (
                <ScrollReveal
                  key={title}
                  variant="scale-up"
                  delay={150 + idx * 80}
                  duration={950}
                  className="bg-[#0D0E12]/90 backdrop-blur-md border border-[#D4AF37]/40 rounded-[7px] p-4 text-center shadow-[0_6px_20px_rgba(0,0,0,0.5)] hover:border-[#D4AF37] hover:shadow-[0_10px_28px_rgba(212,175,55,0.15)] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFF3B3] to-[#8C6514] text-[#0D0E12] mx-auto mb-2.5 flex items-center justify-center shadow-sm">
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white mb-1">{title}</h4>
                  <p className="font-sans text-[0.74rem] leading-[1.5] text-white/75 m-0">{text}</p>
                </ScrollReveal>
              ))}
            </div>

          </ScrollReveal>

          {/* Model Visual with 7px Radius & Gold Luminous Border */}
          <ScrollReveal variant="fade-left" delay={200} duration={1150} className="relative w-full h-[290px] sm:h-[350px] lg:h-[380px]">
            <div className="relative w-full h-full rounded-[7px] overflow-hidden border-[1.5px] border-[#D4AF37]/60 bg-[#0D0E12] shadow-[0_14px_36px_rgba(0,0,0,0.6)]">
              <img
                src="/images/cavree/confidence.jpg"
                alt="Cavree Confidence and Elegance"
                className="w-full h-full object-cover object-[center_20%] block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-2.5 rounded-[7px] bg-gradient-to-br from-[#14151C]/95 to-[#08090C]/95 backdrop-blur-md border border-[#D4AF37]/60 shadow-lg">
                <span className="font-sans text-[0.66rem] font-bold uppercase tracking-wider text-[#D4AF37] block mb-0.5">
                  Grace &amp; Confidence
                </span>
                <p className="font-serif text-xs sm:text-sm font-bold text-white m-0">
                  Fashion that defines your presence.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COLLECTIONS HIGHLIGHT - FRESH, MODERN, TIMELESS                         */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full bg-gradient-to-b from-[#FAF6EE] via-[#FFFDF9] to-[#FAF6EE] py-[clamp(2.5rem,4.5vw,4.5rem)] px-[clamp(1rem,4vw,5rem)] border-b border-[#E8DFCF]/90">
        <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Rack Image with 7px Radius & Clean Border */}
          <ScrollReveal variant="fade-right" delay={100} duration={1150} className="relative w-full h-[290px] sm:h-[350px] lg:h-[380px] order-2 lg:order-1">
            <div className="relative w-full h-full overflow-hidden rounded-[7px] border-[1.5px] border-[#DEC29D] bg-[#EDE5D4] shadow-[0_10px_26px_rgba(181,140,54,0.1)]">
              <img
                src="/images/cavree/collection-rack.jpg"
                alt="Cavree Boutique Collections Rack"
                className="w-full h-full object-cover block"
              />
              {/* Unique Luxury Emblem Badge */}
              <div className="absolute top-3.5 left-3.5 bg-gradient-to-br from-[#14151C] to-[#08090C] backdrop-blur-md border border-[#D4AF37]/70 text-white rounded-[7px] p-2 sm:p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.4)] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFF3B3] to-[#8C6514] flex items-center justify-center text-[#0D0E12] shadow-sm flex-shrink-0">
                  <Sparkles size={13} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="block font-sans text-[0.58rem] font-extrabold tracking-[0.14em] uppercase text-[#DEC29D] leading-none mb-0.5">
                    Curated Atelier
                  </span>
                  <span className="block font-serif text-[0.78rem] font-bold text-white tracking-wide leading-tight">
                    Boutique Ready
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Narrative */}
          <ScrollReveal variant="fade-left" delay={200} duration={1150} className="flex flex-col justify-center order-1 lg:order-2">

            <div className="text-center lg:text-left">
              <span className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#9E7E38] block mb-1">
                Curated Collections
              </span>

              <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.06] m-0">
                Fresh, Modern,
              </h2>
              <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] leading-[1.06] mt-0.5 mb-0">
                &amp; Timeless Grace
              </h2>
            </div>

            <div className="flex justify-center lg:justify-start">
              <GoldDivider />
            </div>

            <div className="space-y-2.5 font-sans text-[clamp(0.84rem,0.9vw,0.95rem)] leading-[1.65] text-[#55565B] font-normal text-justify [text-justify:inter-word] mb-4">
              <p>
                At Cavree, we continuously explore new colours, new silhouettes,
                new techniques, and contemporary fashion ideas so that our
                collections feel fresh, modern, and timeless.
              </p>

              <p>
                Every stitch represents our attention to detail. Every design
                represents our creativity. Every collection represents our
                passion for Indian couture and modern elegance.
              </p>
            </div>

            {/* 2 Feature Pillar Cards with Gradient */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
              <div className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-2.5 sm:p-3 shadow-[0_3px_10px_rgba(181,140,54,0.05)]">
                <span className="font-serif text-xs font-bold text-[#1C1D21] block mb-0.5">
                  Haute Couture Cuts
                </span>
                <span className="font-sans text-[0.68rem] text-[#6B6D74] leading-tight block">
                  Bespoke tailoring &amp; silhouettes
                </span>
              </div>

              <div className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] border border-[#DEC29D]/70 rounded-[7px] p-2.5 sm:p-3 shadow-[0_3px_10px_rgba(181,140,54,0.05)]">
                <span className="font-serif text-xs font-bold text-[#1C1D21] block mb-0.5">
                  Artisanal Zari
                </span>
                <span className="font-sans text-[0.68rem] text-[#6B6D74] leading-tight block">
                  Pure metallic gold embroidery
                </span>
              </div>
            </div>

            <div className="w-full flex items-center justify-center lg:justify-start">
              <Link
                to="/#collections"
                className="w-full max-w-[280px] sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1C1D21] via-[#2A2B32] to-[#1C1D21] hover:from-[#B58C36] hover:via-[#D4AF37] hover:to-[#9E7E38] text-white font-sans text-[clamp(0.7rem,0.8vw,0.78rem)] font-bold tracking-[0.06em] uppercase px-5 py-3 rounded-[7px] transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.15)] cursor-pointer no-underline text-center hover:scale-[1.02]"
              >
                <span>View Full Lookbook</span>
                <ArrowUpRight size={13} className="text-[#DEC29D]" />
              </Link>
            </div>

          </ScrollReveal>

        </div>
      </section>

      {/* Floating Silk Ribbon Wave Accent */}
      <SilkWaveBand className="-mt-3 mb-0" />

      {/* ========================================================================= */}
      {/* 6. ONE GRAM GOLD JEWELLERY COLLECTION                                     */}
      {/* ========================================================================= */}
      <section className="relative z-10 w-full bg-gradient-to-b from-[#FFFDF9] via-[#F7EFE1] to-[#FFFDF9] py-[clamp(2.5rem,4.5vw,4.5rem)] px-[clamp(1rem,4vw,5rem)] border-b border-[#E8DFCF]/90">
        <div className="max-w-[1480px] mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-12 items-center">
            <ScrollReveal variant="fade-right" delay={100} duration={1150} className="flex flex-col justify-center items-center lg:items-start">
              <div className="text-center lg:text-left w-full">
                <span className="font-sans text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#9E7E38] block mb-1">
                  Fine Jewellery Suite
                </span>

                <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.06] m-0">
                  The Art of
                </h2>
                <h2 className="font-serif text-[clamp(1.6rem,2.8vw,3rem)] font-extrabold tracking-[0.01em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#B58C36] via-[#D4AF37] to-[#8C6514] leading-[1.06] mt-0.5 mb-0">
                  Golden Elegance
                </h2>

                <p className="font-serif text-[clamp(0.95rem,1.1vw,1.15rem)] italic bg-clip-text text-transparent bg-gradient-to-r from-[#8C6514] via-[#B58C36] to-[#8C6514] mt-1.5 mb-0 font-normal">
                  One Gram Gold Jewellery Collection
                </p>
              </div>
              
              <div className="flex justify-center lg:justify-start w-full">
                <GoldDivider />
              </div>

              <div className="space-y-3 font-sans text-[clamp(0.85rem,0.92vw,0.98rem)] leading-[1.7] text-[#55565B] font-normal text-justify [text-justify:inter-word] mb-4 max-w-xl mx-auto lg:mx-0">
                <p>
                  At Cavree, beauty is not limited to fashion. It extends to the
                  finest details that complete a woman’s style.
                </p>
                <p>
                  Our One Gram Gold Jewellery Collection is designed for women
                  who love the timeless beauty of solid gold with modern durability
                  and delicate handcrafted filigree.
                </p>
              </div>

              {/* Luxury Quote Card */}
              <div className="w-full max-w-xl mx-auto lg:mx-0 p-3.5 sm:p-4 rounded-[7px] bg-gradient-to-r from-white/95 via-[#FAF6EE] to-[#F5EEDB] border border-[#DEC29D] shadow-[0_4px_16px_rgba(181,140,54,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF3D1] to-[#FAF6EE] border border-[#DEC29D] flex items-center justify-center text-[#B58C36] flex-shrink-0 mt-0.5 shadow-sm">
                    <Gem size={15} />
                  </div>
                  <div>
                    <p className="font-serif text-sm sm:text-[0.92rem] italic font-bold text-[#8C6514] leading-snug m-0">
                      “Designed to Look Like Gold. Crafted to Feel Luxurious.”
                    </p>
                    <span className="mt-1 block font-sans text-[0.62rem] font-bold uppercase tracking-widest text-[#9E7E38]">
                      — Micro-Filigree &amp; Pure Lustre
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 4 Jewellery Cards with 7px Radius & Clean Border */}
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
              {JEWELLERY.map((item, idx) => (
                <ScrollReveal
                  key={item.title}
                  variant="scale-up"
                  delay={100 + idx * 75}
                  duration={950}
                  className="rounded-[7px] border border-[#DEC29D]/70 bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF6EE] overflow-hidden shadow-[0_4px_14px_rgba(181,140,54,0.06)] hover:border-[#B58C36] hover:shadow-[0_8px_24px_rgba(181,140,54,0.12)] transition-all duration-300 flex flex-col"
                >
                  {/* Full Width Image Container */}
                  <div className="relative w-full h-[175px] sm:h-[195px] overflow-hidden bg-[#EDE5D4]">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      className="w-full h-full object-cover object-center block"
                    />
                  </div>

                  <div className="p-3 sm:p-3.5 bg-gradient-to-b from-white to-[#FAF6EE]/80 flex-1 flex flex-col justify-center">
                    <span className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[#9E7E38] block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-[#1C1D21] m-0 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </ScrollReveal>
              ))}
            </div>

          </div>

          {/* Unique Closing Signature Paragraph */}
          <ScrollReveal variant="fade-up" delay={150} duration={1000} className="mt-10 sm:mt-14 pt-8 pb-2 border-t border-[#E8DFCF]/80 text-center max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2.5 mb-2.5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent via-[#DEC29D] to-[#B58C36]" />
              <Sparkles size={12} className="text-[#B58C36]" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent via-[#DEC29D] to-[#B58C36]" />
            </div>

            <p className="font-serif text-[clamp(1.02rem,1.35vw,1.3rem)] italic text-[#1C1D21] font-normal leading-[1.65] m-0 mb-2">
              “From every delicate zari weave to the luminous lustre of our handcrafted gold, Cavree is a timeless celebration of the woman who commands her world with effortless grace.”
            </p>

            <span className="font-sans text-[0.66rem] font-extrabold uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-[#8C6514] via-[#B58C36] to-[#8C6514] block">
              — The Essence of Cavree Haute Couture
            </span>
          </ScrollReveal>

        </div>
      </section>

    </main>
  );
}