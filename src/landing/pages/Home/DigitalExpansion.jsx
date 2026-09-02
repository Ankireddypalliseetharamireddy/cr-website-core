import React from 'react';
import modelImg from '../../assets/images/img-3.jpeg';
import ScrollReveal from '../../components/common/ScrollReveal';

export const DigitalExpansion = () => {
  const storeLocations = [
    { count: '18', state: 'TELANGANA' },
    { count: '21', state: 'MAHARASHTRA' },
    { count: '15', state: 'KARNATAKA' },
    { count: '12', state: 'GUJARAT' },
    { count: '9', state: 'KOLKATA' },
  ];

  return (
    <section className="digital-expansion-section w-full min-h-[76vh] bg-[#FAF6EE] text-[#1C1D21] relative grid grid-cols-1 lg:grid-cols-[46%_54%] box-border overflow-hidden">

      <div className="digital-image-col relative w-full h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[76vh] bg-[#EDE5D4] z-[5]">
        <ScrollReveal variant="fade-right" duration={1200} className="relative w-full h-full overflow-hidden">
          <img
            src={modelImg}
            alt="Cavree Red Gown Model - Online & India Expansion"
            className="w-full h-full object-cover object-[center_top] block transform hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
        </ScrollReveal>

        <ScrollReveal
          variant="scale-up"
          delay={350}
          duration={1100}
          className="digital-floating-card absolute top-[clamp(1.5rem,3vw,3.5rem)] right-3 sm:right-6 lg:right-[-28px] w-[clamp(170px,18vw,230px)] bg-[#0D0E12] rounded-[16px] p-[clamp(0.9rem,1.2vw,1.2rem)_clamp(0.9rem,1.2vw,1.25rem)] shadow-[0_12px_36px_rgba(0,0,0,0.45)] border-2 border-white z-10 animate-luxury-float"
        >
          <h3 className="font-sans text-[clamp(1.4rem,1.9vw,2.1rem)] font-extrabold text-[#dec29d] mb-1 leading-none tracking-[0.01em]">
            2027
          </h3>
          <p className="font-sans text-[0.68rem] font-extrabold tracking-[0.08em] uppercase text-white mb-1.5">
            Online Business
          </p>
          <p className="font-sans text-[0.65rem] leading-[1.4] text-white/70 m-0 text-justify">
            Cavree will launch its online business in 2027, expanding the brand beyond physical retail.
          </p>
        </ScrollReveal>
      </div>

      <div className="digital-content-col flex flex-col justify-center p-[clamp(1.8rem,3.8vw,4.2rem)_clamp(1.2rem,4vw,5rem)] box-border relative z-[2]">

        <ScrollReveal variant="fade-up" delay={80} duration={1050} className="flex items-center mb-4">
          <span className="font-sans text-[clamp(0.72rem,0.8vw,0.86rem)] font-bold tracking-[0.12em] uppercase text-[#9E7E38]">
            Digital & India Expansion
          </span>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={160} duration={1100} className="mb-5">
          <h1 className="font-serif text-[clamp(1.8rem,3.6vw,3.8rem)] font-extrabold tracking-[0.01em] uppercase text-[#1C1D21] leading-[1.05] m-0">
            Online Business
          </h1>
          <h1 className="font-serif text-[clamp(1.8rem,3.6vw,3.8rem)] font-extrabold tracking-[0.01em] uppercase text-[#B58C36] leading-[1.05] mt-[0.15rem] mb-0">
            Launching in 2027
          </h1>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={240} duration={1150}>
          <p className="font-sans text-[clamp(0.88rem,0.98vw,1.02rem)] leading-[1.7] text-[#55565B] max-w-[580px] mb-6 text-justify font-normal">
            The digital launch will strengthen Cavree's presence and make its fashion collections accessible to customers across wider markets. By combining modern e-commerce convenience with our signature boutique experience, we ensure seamless consumer reach, accelerated brand growth, and elevated market penetration across all key territories.
          </p>
        </ScrollReveal>

        {/* Thin Divider Line */}
        <ScrollReveal variant="fade-up" delay={300} duration={1000} className="w-full h-px bg-[#E2D8C6] mb-6" />

        {/* Subheading: STORES ALREADY IN ADVANCED STAGE */}
        <ScrollReveal variant="fade-up" delay={340} duration={1100} className="mb-4">
          <h3 className="font-sans text-[clamp(0.86rem,0.94vw,0.98rem)] font-extrabold tracking-[0.04em] uppercase text-[#1C1D21] mb-1">
            Stores Already in Advanced Stage
          </h3>
          <p className="font-sans text-[clamp(0.78rem,0.86vw,0.9rem)] text-[#7E8087] m-0 font-normal">
            Getting ready for launch across key Indian markets
          </p>
        </ScrollReveal>

        {/* 5 Location Cards Grid */}
        <div className="digital-stores-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3 mb-[1.6rem]">
          {storeLocations.map((item, idx) => (
            <ScrollReveal
              key={idx}
              variant="scale-up"
              delay={380 + idx * 80}
              duration={1000}
              className={`bg-white border border-[#E8DFCF] rounded-[10px] py-4 sm:py-5 px-2 text-center shadow-[0_6px_18px_rgba(181,140,54,0.07),0_2px_6px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-[#B58C36]/50 hover:-translate-y-1 ${
                idx === 4 ? 'max-sm:col-span-2 max-sm:max-w-[220px] max-sm:mx-auto max-sm:w-full' : ''
              }`}
            >
              <h4 className="font-sans text-[clamp(1.5rem,2vw,2.15rem)] font-extrabold text-[#B58C36] mb-1 leading-none tracking-[0.01em]">
                {item.count}
              </h4>
              <p className="font-sans text-[clamp(0.58rem,0.68vw,0.74rem)] font-extrabold tracking-[0.06em] uppercase text-[#1C1D21] m-0 leading-[1.25]">
                {item.state}
              </p>
              <p className="font-sans text-[0.58rem] font-bold tracking-[0.1em] uppercase text-[#9E7E38] mt-1 mb-0">
                Stores
              </p>
            </ScrollReveal>
          ))}
        </div>

        {/* Status Pill Banner */}
        <ScrollReveal variant="fade-up" delay={780} duration={1100} className="bg-[#EAE0CE] border border-[#B58C36]/25 rounded-lg py-[0.85rem] px-[1.2rem] flex items-center gap-[0.85rem] flex-wrap sm:flex-nowrap">
          <span className="font-sans text-[0.76rem] font-extrabold tracking-[0.1em] uppercase text-[#8A6D2C] bg-[#B58C36]/15 py-[0.2rem] px-[0.55rem] rounded shrink-0">
            Status
          </span>
          <span className="font-sans text-[clamp(0.8rem,0.88vw,0.9rem)] text-[#34353A] font-medium leading-[1.4]">
            These locations are in advanced stages and getting ready for launch.
          </span>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DigitalExpansion;
