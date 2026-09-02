import React, { useState } from 'react';

export const CavreeLogo = ({
  size = 'lg',
  showText = true,
  showTagline = true,
  showIcon = true,
  badgeStyle = false,
  variant = 'dark',
  orientation = 'horizontal',
  tagline = 'FASHION THAT DEFINES YOU',
  className = '',
  style = {},
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    footer: {
      badge: 'w-[50px] h-[50px] min-w-[50px]',
      icon: 46,
      brandText: 'text-[1.12rem] tracking-[0.22em]',
      diamond: 'text-[4.5px]',
      taglineText: 'text-[0.46rem] tracking-[0.18em]',
      gap: 'gap-[0.35rem]',
      textOffset: 'translate-y-0',
    },
    sm: {
      badge: 'w-[44px] h-[44px] min-w-[44px]',
      icon: 40,
      brandText: 'text-[1.02rem] tracking-[0.24em]',
      diamond: 'text-[4.5px]',
      taglineText: 'text-[0.44rem] tracking-[0.2em]',
      gap: 'gap-[0.65rem]',
      textOffset: 'translate-y-1',
    },
    md: {
      badge: 'w-[76px] h-[76px] min-w-[76px]',
      icon: 72,
      brandText: 'text-[1.85rem] tracking-[0.28em]',
      diamond: 'text-[7.5px]',
      taglineText: 'text-[0.72rem] tracking-[0.25em]',
      gap: 'gap-[1.15rem]',
      textOffset: 'translate-y-2.5',
    },
    lg: {
      badge: 'w-[68px] h-[68px] min-w-[68px] sm:w-[96px] sm:h-[96px] sm:min-w-[96px] md:w-[112px] md:h-[112px] md:min-w-[112px]',
      icon: 90,
      brandText: 'text-[clamp(1.35rem,4.2vw,2.45rem)] tracking-[0.22em] sm:tracking-[0.32em]',
      diamond: 'text-[7px] sm:text-[9.5px]',
      taglineText: 'text-[clamp(0.48rem,1.6vw,0.86rem)] tracking-[0.14em] sm:tracking-[0.28em]',
      gap: 'gap-[0.65rem] sm:gap-[1.35rem]',
      textOffset: 'translate-y-2 sm:translate-y-4',
    },
    xl: {
      badge: 'w-[150px] h-[150px] min-w-[150px]',
      icon: 142,
      brandText: 'text-[3.0rem] tracking-[0.34em]',
      diamond: 'text-[12px]',
      taglineText: 'text-[1.05rem] tracking-[0.32em]',
      gap: 'gap-[1.75rem]',
      textOffset: 'translate-y-5',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.lg;
  const isLight = variant === 'light';
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`cavree-logo-lockup inline-flex items-center justify-center no-underline select-none ${
        isVertical ? 'flex-col gap-[0.45rem]' : `flex-row ${currentSize.gap}`
      } ${className}`}
      style={style}
    >

      {showIcon && (
        <div
          className={`cavree-emblem-container flex items-center justify-center relative shrink-0 ${currentSize.badge} ${
            badgeStyle
              ? isLight
                ? 'rounded-xl border border-[rgba(196,151,43,0.4)] bg-gradient-to-br from-[#FAF7F0] to-[#EFE8DA]'
                : 'rounded-xl border border-[rgba(212,175,55,0.45)] bg-gradient-to-br from-[#0D0F14] to-[#050608]'
              : 'rounded-none border-0 bg-transparent'
          }`}
        >
          {!imgError ? (
            <img
              src="/cavree-logo.png"
              alt="Cavree Luxury Monogram"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain"
            />
          ) : (

            <svg
              width={currentSize.icon}
              height={currentSize.icon}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="1.5" />
              <path
                d="M68 32 C60 22 40 22 32 32 C22 42 22 58 32 68 C40 78 60 78 68 68"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M50 26 C53 26 55 28 55 31 C55 34 52 36 50 38 C47 43 45 52 48 60 C51 68 58 76 74 80"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      )}

      {showText && (
        <div
          className={`cavree-brand-text-block flex flex-col justify-center items-center text-center leading-none ${
            isVertical ? 'translate-y-0' : currentSize.textOffset
          }`}
        >

          <span
            className={`brand-wordmark font-display font-extrabold uppercase block w-full text-center transition-all duration-300 ${
              currentSize.brandText
            } ${isLight ? 'text-[#1A1813]' : 'text-white'}`}
          >
            CAVREE
          </span>

          {showTagline && (
            <>
              <div className="brand-divider-line flex items-center justify-center w-full gap-1.5 my-1">
                <div className="flex-1 h-px bg-gradient-to-r from-[#cf9d45]/10 to-[#cf9d45]/95" />
                <span
                  className={`inline-block text-[#E6CA65] leading-none -translate-y-px ${currentSize.diamond}`}
                >
                  ◆
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#cf9d45]/95 to-[#cf9d45]/10" />
              </div>

              <span
                className={`brand-tagline font-sans font-semibold uppercase w-full text-center block opacity-95 whitespace-nowrap ${
                  currentSize.taglineText
                } ${isLight ? 'text-[#9E7310]' : 'text-white'}`}
              >
                {tagline}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CavreeLogo;
