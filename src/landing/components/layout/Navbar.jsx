import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Download, Calendar, Video, MapPin, Store } from 'lucide-react';
import CavreeLogo from '../brand/CavreeLogo';
import { navLinks } from '../../constants/navigation';

export const Navbar = ({ onOpenBrochure, onOpenConsultation, onOpenCctv, onOpenLocation }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isInitialAbout = location.pathname === '/about';
  const isInitialInvest = location.pathname === '/investment-model';
  const [activeSection, setActiveSection] = useState(
    isInitialAbout ? 'about' : isInitialInvest ? 'investment' : 'home'
  );
  const [hoveredSection, setHoveredSection] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navListRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (location.pathname === '/about') {
      setActiveSection('about');
    } else if (location.pathname === '/investment-model') {
      if (!location.hash) setActiveSection('investment');
    } else if (location.pathname === '/') {
      if (!location.hash) setActiveSection('home');
    }
  }, [location.pathname]);

  useEffect(() => {
    let lastSection = '';
    let frameId = null;
    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const scrolled = window.scrollY > 60;
        setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

        if (location.pathname === '/about') {
          setActiveSection('about');
          return;
        }

        const isInvestmentPage = location.pathname === '/investment-model';
        const sectionIds = isInvestmentPage
          ? ['investment', 'benefits', 'process', 'contact']
          : ['home', 'contact'];

        const scrollPosition = window.scrollY + 240;

        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const el = document.getElementById(sectionIds[i]);
          if (el && el.offsetTop <= scrollPosition) {
            setActiveSection((prev) => (prev !== sectionIds[i] ? sectionIds[i] : prev));
            lastSection = sectionIds[i];
            break;
          }
        }

        if (window.scrollY <= 150) {
          const defaultSec = isInvestmentPage ? 'investment' : 'home';
          if (lastSection !== defaultSec) {
            lastSection = defaultSec;
            setActiveSection((prev) => (prev !== defaultSec ? defaultSec : prev));
          }
        }
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [location.pathname]);

  const isVisibleOnScroll = isScrolled || location.pathname !== '/';

  useEffect(() => {
    const isAboutPage = location.pathname === '/about';
    const isInvestmentPage = location.pathname === '/investment-model';
    const fallbackId = isAboutPage ? 'about' : isInvestmentPage ? 'investment' : 'home';
    const currentTargetId = hoveredSection || activeSection || fallbackId;
    if (!navListRef.current || !headerRef.current) return;

    const targetLinkEl = navListRef.current.querySelector(`[data-nav-id="${currentTargetId}"]`);
    if (targetLinkEl) {
      const headerRect = headerRef.current.getBoundingClientRect();
      const linkRect = targetLinkEl.getBoundingClientRect();
      setIndicatorStyle({
        left: linkRect.left - headerRect.left,
        width: linkRect.width,
        opacity: isVisibleOnScroll ? 1 : 0,
      });
    }
  }, [activeSection, hoveredSection, isVisibleOnScroll, location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (!navListRef.current || !headerRef.current) return;
      const isAboutPage = location.pathname === '/about';
      const isInvestmentPage = location.pathname === '/investment-model';
      const fallbackId = isAboutPage ? 'about' : isInvestmentPage ? 'investment' : 'home';
      const currentTargetId = hoveredSection || activeSection || fallbackId;
      const targetLinkEl = navListRef.current.querySelector(`[data-nav-id="${currentTargetId}"]`);
      if (targetLinkEl) {
        const headerRect = headerRef.current.getBoundingClientRect();
        const linkRect = targetLinkEl.getBoundingClientRect();
        setIndicatorStyle({
          left: linkRect.left - headerRect.left,
          width: linkRect.width,
          opacity: isVisibleOnScroll ? 1 : 0,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSection, hoveredSection, isVisibleOnScroll, location.pathname]);

  const handleLogoClick = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection('home');
    setHoveredSection(null);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 2.5 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.history.pushState(null, '', '/');
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { duration: 2.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNavLinkClick = (e, link) => {
    e.preventDefault();
    const targetId = link.id || link.path.replace('#', '').replace('/', '');

    if (targetId === 'home' || targetId === 'top' || link.label === 'Home') {
      handleLogoClick(e);
      return;
    }

    if (targetId === 'about' || link.label === 'About Us' || link.path === '/about') {
      if (location.pathname !== '/about') {
        navigate('/about');
      } else {
        window.history.pushState(null, '', '/about');
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 2.5 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      setActiveSection('about');
      setMobileMenuOpen(false);
      return;
    }

    if (targetId === 'investment' || link.label === 'Investment Model') {
      if (location.pathname !== '/investment-model') {
        navigate('/investment-model');
      } else {
        window.history.pushState(null, '', '/investment-model');
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 3.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      setActiveSection('investment');
      setMobileMenuOpen(false);
      return;
    }

    if (targetId === 'benefits' || targetId === 'process') {
      if (location.pathname !== '/investment-model') {
        navigate('/investment-model#' + targetId);
      } else {
        window.history.pushState(null, '', '#' + targetId);
        const element = document.getElementById(targetId);
        if (element) {
          if (window.__lenis) {
            window.__lenis.scrollTo(element, {
              offset: -70,
              duration: 3.2,
            });
          } else {
            const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({
              top: topOffset,
              behavior: 'smooth',
            });
          }
        }
      }
      setActiveSection(targetId);
      setMobileMenuOpen(false);
      return;
    }

    if (targetId === 'contact' || link.label === 'Contact') {
      if (location.pathname !== '/investment-model') {
        navigate('/investment-model#contact');
      } else {
        window.history.pushState(null, '', '#contact');
        const element = document.getElementById('contact');
        if (element) {
          if (window.__lenis) {
            window.__lenis.scrollTo(element, {
              offset: -70,
              duration: 3.2,
            });
          } else {
            const topOffset = element.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({
              top: topOffset,
              behavior: 'smooth',
            });
          }
        }
      }
      setActiveSection('contact');
      setMobileMenuOpen(false);
      return;
    }
  };

  return (
    <header
      ref={headerRef}
      className={`cavree-header fixed top-0 inset-x-0 w-full z-[1000] backdrop-blur-[24px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisibleOnScroll ? 'bg-[#0A0B0E]/98' : 'bg-[#0A0B0E]/80'
      }`}
    >
      <div className="nav-container flex justify-between items-center min-h-[72px] max-w-[1534px] w-full mx-auto px-[clamp(1rem,1.8vw,1.75rem)] py-2 box-border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center pl-[clamp(0.5rem,2vw,3.5rem)]">
          <a
            href="/"
            onClick={handleLogoClick}
            className={`brand-logo-link flex items-center no-underline shrink-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
              isVisibleOnScroll
                ? 'opacity-100 translate-y-0 pointer-events-auto visible scale-100'
                : 'opacity-0 -translate-y-2 pointer-events-none invisible scale-95'
            }`}
            title="Cavree Home"
          >
            <CavreeLogo size="sm" showText={false} badgeStyle={false} />
          </a>
        </div>

        <div className="flex items-center justify-end pr-[clamp(0.5rem,2.5vw,4.5rem)]">
          <nav className="desktop-nav hidden min-[960px]:flex items-center justify-end w-full">
            <ul
              ref={navListRef}
              onMouseLeave={() => setHoveredSection(null)}
              className="flex items-center justify-end list-none m-0 p-0 gap-[clamp(0.75rem,1.35vw,2.4rem)] flex-nowrap relative"
            >
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                const isHovered = hoveredSection === link.id;
                const isTarget = isHovered || (!hoveredSection && isActive);

                return (
                  <li key={link.path} className="flex items-center shrink-0">
                    <a
                      href={link.path}
                      data-nav-id={link.id}
                      onMouseEnter={() => setHoveredSection(link.id)}
                      onClick={(e) => handleNavLinkClick(e, link)}
                      className={`group relative inline-flex flex-col items-center justify-center py-2 px-1 font-sans text-[clamp(0.86rem,0.96vw,1.06rem)] tracking-[0.025em] whitespace-nowrap cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isTarget && isVisibleOnScroll
                          ? 'font-semibold text-[#FFF3B3]'
                          : 'font-normal text-[#D4AF37]/80 hover:text-[#FFF3B3]'
                      }`}
                    >
                      <span className="relative z-10 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[1.5px]">
                        {link.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Staff Portal / Login Action */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="ml-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#FFF3B3] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-[0_2px_12px_rgba(212,175,55,0.2)] shrink-0"
              title="Cavree Store POS & Staff Login"
            >
              <Store size={14} className="text-[#D4AF37]" />
              Staff Login
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn flex min-[960px]:hidden bg-white/5 border border-[#D4AF37]/35 text-[#F3E5AB] p-2 rounded cursor-pointer transition-all duration-300 ml-2"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        className={`absolute bottom-0 inset-x-0 h-[1.5px] bg-[#D4AF37]/25 pointer-events-none transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisibleOnScroll ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`absolute bottom-0 h-[2.5px] bg-gradient-to-r from-[#D4AF37] via-[#FFF3B3] to-[#D4AF37] rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
          isVisibleOnScroll ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      >
        <span className="absolute -top-[3.5px] left-1/2 -translate-x-1/2 text-[#FFF3B3] text-[8px] leading-none">
          ◆
        </span>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer absolute top-full inset-x-0 bg-[#0a0c12]/[0.98] border-b border-[#D4AF37]/20 p-[clamp(1rem,4vw,1.5rem)] max-h-[calc(100vh-72px)] overflow-y-auto flex flex-col gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-center pb-2 border-b border-[#cf9d45]/15">
            <a
              href="/"
              onClick={handleLogoClick}
              className="cursor-pointer no-underline flex items-center justify-center"
              title="Cavree Home"
            >
              <CavreeLogo size="sm" />
            </a>
          </div>

          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={(e) => handleNavLinkClick(e, link)}
                  className={`text-[clamp(1.05rem,4vw,1.25rem)] font-sans font-[450] tracking-[0.01em] p-2.5 px-2 border-b border-[#cf9d45]/12 flex items-center justify-between transition-all duration-500 no-underline cursor-pointer ${
                    isActive ? 'text-[#FFEBAC]' : 'text-[#cf9d45]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive ? (
                    <span className="text-[#cf9d45] text-xs">◆</span>
                  ) : (
                    <span className="text-[#cf9d45]/40 text-xs">›</span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#BF8C24] text-[#07080B] font-semibold text-xs tracking-wider uppercase shadow-lg cursor-pointer"
            >
              <Store size={15} />
              Staff POS &amp; Franchise Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
