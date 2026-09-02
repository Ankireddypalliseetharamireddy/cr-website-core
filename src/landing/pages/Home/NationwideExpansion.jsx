import React from 'react';
import leftImg from '../../assets/images/img-6.jpeg';
import rightImg from '../../assets/images/img-12.jpeg';
import { ArrowRight } from 'lucide-react';

export const NationwideExpansion = () => {
  return (
    <section id="nationwide" className="nationwide-expansion-section w-full min-h-screen bg-[#0d0d0d] text-white relative grid grid-cols-1 lg:grid-cols-[27%_46%_27%] items-stretch box-border overflow-hidden">

      <div className="absolute inset-0 w-full h-full pointer-events-none lg:hidden overflow-hidden">
        <img
          src={leftImg}
          alt="Cavree Nationwide Expansion Background"
          className="w-full h-full object-cover object-[center_15%] opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] from-25% via-[#0d0d0d]/92 via-60% to-[#0d0d0d]/50" />
      </div>

      <div className="nationwide-left-image hidden lg:block relative w-full h-full lg:min-h-screen overflow-hidden">
        <img
          src={leftImg}
          alt="Cavree Olive Green Model - Nationwide Expansion"
          className="w-full h-full object-cover object-[center_top] block"
        />

        <div className="absolute top-0 bottom-0 right-0 w-[8%] bg-gradient-to-r from-transparent to-[#0d0d0d]/70 pointer-events-none" />
      </div>

      <div className="nationwide-content-col flex flex-col justify-center max-lg:pt-[clamp(10.5rem,32vh,18rem)] max-lg:pb-12 p-[clamp(2rem,3.5vw,4.5rem)_clamp(1rem,2.5vw,3.5rem)] box-border relative z-10 max-w-[640px] mx-auto lg:max-w-none">

        <div className="mb-3">
          <span className="font-sans text-[clamp(0.74rem,0.85vw,0.88rem)] font-bold tracking-[0.14em] uppercase text-[#D4AF37]">
            Nationwide Vision
          </span>
        </div>

        <div className="mb-4">
          <h1 className="font-sans text-[clamp(1.65rem,3.2vw,3.2rem)] font-black tracking-[0.015em] uppercase text-white leading-[1.08] m-0">
            600 Stores by 2027
          </h1>
          <h1 className="font-sans text-[clamp(1.65rem,3.2vw,3.2rem)] font-black tracking-[0.015em] uppercase text-[#dec29d] leading-[1.08] mt-1 mb-0">
            2,000 Stores by 2029
          </h1>
        </div>

        <p className="font-sans text-[clamp(0.85rem,0.95vw,0.98rem)] leading-[1.7] text-white/75 mb-7 text-justify [text-justify:inter-word] [hyphens:auto] font-normal">
          By December 2027, Cavree aims to complete 600 stores. The long-term target is to reach approximately 2,000 stores across India by 2029.
        </p>

        <div className="mb-7 relative w-full">

          <div className="flex justify-between mb-2">
            <span className="font-sans text-[clamp(0.7rem,0.78vw,0.78rem)] font-bold tracking-[0.08em] uppercase text-white/85">
              Dec 2027
            </span>
            <span className="font-sans text-[clamp(0.7rem,0.78vw,0.78rem)] font-bold tracking-[0.08em] uppercase text-white/85 text-right">
              2029
            </span>
          </div>

          <div className="relative w-full h-[2px] bg-[#D4AF37]/50 flex items-center justify-between mb-3">
            <div className="w-[14px] h-[14px] rounded-full bg-[#D4AF37] border-[2.5px] border-[#0d0d0d] shadow-[0_0_12px_rgba(212,175,55,0.7)] ml-0" />
            <div className="w-[14px] h-[14px] rounded-full bg-[#D4AF37] border-[2.5px] border-[#0d0d0d] shadow-[0_0_12px_rgba(212,175,55,0.7)] mr-0" />
          </div>

          <div className="flex justify-between">
            <div className="text-left">
              <h3 className="font-sans text-[clamp(1.75rem,2.7vw,2.85rem)] font-black text-white mb-0.5 leading-none tracking-[0.01em]">
                600
              </h3>
              <p className="font-sans text-[clamp(0.65rem,0.72vw,0.74rem)] font-bold tracking-[0.08em] uppercase text-white/55 m-0">
                Stores
              </p>
            </div>

            <div className="text-right">
              <h3 className="font-sans text-[clamp(1.75rem,2.7vw,2.85rem)] font-black text-[#dec29d] mb-0.5 leading-none tracking-[0.01em]">
                2,000
              </h3>
              <p className="font-sans text-[clamp(0.65rem,0.72vw,0.74rem)] font-bold tracking-[0.08em] uppercase text-white/55 m-0">
                Stores Across India
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121318]/90 backdrop-blur-sm border border-[#dec29d]/28 rounded-[12px] p-[1.15rem_clamp(0.95rem,2vw,1.6rem)]">
          <div className="mb-2.5">
            <span className="font-sans text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#D4AF37]">
              International Expansion
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div>
              <h4 className="font-sans text-[clamp(1.05rem,1.55vw,1.55rem)] font-extrabold tracking-[0.02em] uppercase text-[#dec29d] mb-0.5">
                6 Countries
              </h4>
              <p className="font-sans text-[clamp(0.7rem,0.75vw,0.78rem)] text-white/60 m-0 font-medium">
                by 2027
              </p>
            </div>

            <div className="flex items-center text-[#D4AF37] px-1 sm:px-2 shrink-0">
              <div className="w-[clamp(18px,3vw,45px)] h-[1.5px] bg-gradient-to-r from-[#D4AF37] to-[#dec29d]" />
              <ArrowRight size={16} color="#dec29d" className="-ml-1" />
            </div>

            <div className="text-right">
              <h4 className="font-sans text-[clamp(1.05rem,1.55vw,1.55rem)] font-extrabold tracking-[0.02em] uppercase text-white mb-0.5">
                ~30 Countries
              </h4>
              <p className="font-sans text-[clamp(0.7rem,0.75vw,0.78rem)] text-white/60 m-0 font-medium">
                target by 2029
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="nationwide-right-image hidden lg:block relative w-full h-full lg:min-h-screen overflow-hidden">
        <img
          src={rightImg}
          alt="Cavree Mustard Model - International Expansion"
          className="w-full h-full object-cover object-[center_top] block"
        />

        <div className="absolute top-0 bottom-0 left-0 w-[8%] bg-gradient-to-l from-transparent to-[#0d0d0d]/70 pointer-events-none" />
      </div>
    </section>
  );
};

export default NationwideExpansion;
