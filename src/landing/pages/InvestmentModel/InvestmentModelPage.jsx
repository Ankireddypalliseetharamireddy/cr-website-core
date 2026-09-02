import React from 'react';
import HeroSection from '../../components/hero/HeroSection';
import InvestmentRecoverySection from '../../components/investment/InvestmentRecoverySection';
import WhyInvestSection from '../../components/benefits/WhyInvestSection';
import HowItWorksSection from '../../components/process/HowItWorksSection';
import ContactSection from '../../components/contact/ContactSection';

export const InvestmentModelPage = () => {
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
