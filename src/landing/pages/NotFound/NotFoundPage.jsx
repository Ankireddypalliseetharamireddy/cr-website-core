import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page min-h-screen w-full flex flex-col items-center justify-center relative bg-[#FAF6EE] text-[#1C1D21] px-4 py-10 overflow-hidden box-border">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/6 left-1/4 w-[350px] h-[350px] bg-[#dec29d]/25 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-[680px] w-full mx-auto text-center relative z-10 my-auto">

        <div className="inline-flex items-center gap-2 bg-[#B58C36]/12 border border-[#B58C36]/35 py-1.5 px-4 rounded-full mb-4">
          <Compass size={14} className="text-[#9E7E38]" />
          <span className="font-sans text-[0.75rem] font-bold tracking-[0.14em] uppercase text-[#9E7E38]">
            Error 404 • Destination Not Found
          </span>
        </div>

        <h1 className="font-serif text-[clamp(4.5rem,10.5vw,8rem)] font-extrabold leading-[1] tracking-[0.02em] m-0 mb-3 text-[#1C1D21] select-none [text-shadow:0_4px_24px_rgba(181,140,54,0.18)]">
          404
        </h1>

        <h2 className="font-serif text-[clamp(1.35rem,2.4vw,2.1rem)] font-bold text-[#1C1D21] mb-3">
          Page Beyond the Horizon
        </h2>

        <p className="font-sans text-[clamp(0.88rem,1vw,1.05rem)] text-[#5A5C64] max-w-[480px] mx-auto leading-[1.65] mb-8 font-normal">
          The destination you requested does not exist or has been relocated within our private luxury network.
        </p>

        <div className="flex justify-center items-center gap-3 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3.5 rounded-xl text-white font-sans text-[0.85rem] font-bold tracking-[0.06em] uppercase bg-[#1C1D21] hover:bg-[#2C2E35] border border-[#1C1D21] no-underline shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
