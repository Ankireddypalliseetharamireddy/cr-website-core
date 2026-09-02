import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../../components/hero/HeroSection';
import InvestmentRecoverySection from '../../components/investment/InvestmentRecoverySection';
import WhyInvestSection from '../../components/benefits/WhyInvestSection';
import HowItWorksSection from '../../components/process/HowItWorksSection';
import ContactSection from '../../components/contact/ContactSection';

export const InvestmentModelPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#contact') {
      const scrollToContact = () => {
        const el = document.getElementById('contact');
        if (el) {
          const navOffset = 85;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      };

      // Multi-stage trigger to ensure exact landing after route mount & image paint
      scrollToContact();
      const t1 = setTimeout(scrollToContact, 120);
      const t2 = setTimeout(scrollToContact, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.hash]);

  return (
    <div className="investment-model-page w-full overflow-x-hidden">

      <HeroSection />

      <InvestmentRecoverySection />

      <WhyInvestSection />

      <HowItWorksSection />

      <ContactSection />
    </div>
  );
};

export default InvestmentModelPage;
