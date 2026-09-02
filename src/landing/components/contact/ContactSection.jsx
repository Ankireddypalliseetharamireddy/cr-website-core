import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  Globe,
  User,
  MapPin,
  IndianRupee,
  Store,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronDown,
  ArrowRight,
  RotateCcw,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitContactToGoogleForm } from '../../services/googleFormService';
import ScrollReveal from '../common/ScrollReveal';

export const ContactSection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    country: 'India',
    cityState: '',
    budget: '₹50 lakhs - ₹1crore (Flagship)',
    storeLocation: '',
    message: '',
  });

  const [referenceId, setReferenceId] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  useEffect(() => {
    if (location.hash.toLowerCase() === '#thankyou' || location.hash.toLowerCase() === '#thank-you') {
      setSubmitted(true);
      if (!referenceId) {
        setReferenceId(String(Math.floor(100000 + Math.random() * 900000)));
      }
    }
  }, [location.hash]);

  const budgetOptions = [
    { value: '₹50 lakhs - ₹1crore (Flagship)', label: '₹50 Lakhs – ₹1 Crore (Flagship)' },
    { value: '₹1crore - ₹2crore (Prime)', label: '₹1 Crore – ₹2 Crore (Prime)' },
    { value: '₹2crore + (Multi-store)', label: '₹2 Crore+ (Multi-Store)' },
  ];

  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    if (errors.phone && digitsOnly.length === 10) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleEmailChange = (e) => {
    const lowerEmail = e.target.value.toLowerCase().replace(/\s/g, '');
    setFormData((prev) => ({ ...prev, email: lowerEmail }));
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid lowercase email';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Please enter your country';
    }

    if (!formData.cityState.trim()) {
      newErrors.cityState = 'Please enter your city and state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const generatedRef = String(Math.floor(100000 + Math.random() * 900000));

    const formURL =
      'https://docs.google.com/forms/d/e/1FAIpQLScPditMWTVrcSEsJpqEBlNJU58beCpE5CkXAg4GcqdPrjf7Sw/formResponse';

    const budgetValue = formData.budget.includes('50')
      ? '₹50 lakhs - ₹1crore (Flagship)'
      : formData.budget.includes('2') && (formData.budget.includes('+') || formData.budget.includes('Multi') || formData.budget.includes('multi'))
      ? '₹2crore + (Multi-store)'
      : '₹1crore - ₹2crore (Prime)';

    const data = new FormData();
    data.append('entry.2005620554', formData.name.trim());
    data.append('entry.1166974658', `+91 ${formData.phone.trim()}`);
    data.append('entry.1045781291', formData.email.trim().toLowerCase());
    data.append('entry.606323434', formData.cityState.trim());
    data.append('entry.1059695746', formData.country.trim());
    data.append('entry.741973709', budgetValue);
    data.append('entry.1320393607', formData.storeLocation.trim() || 'N/A');
    data.append('entry.1065046570', formData.message.trim() || 'Website investor enquiry');

    try {
      await fetch(formURL, {
        method: 'POST',
        mode: 'no-cors',
        body: data,
      });

      setIsSubmitting(false);

      const submittedData = { ...formData };
      // Clear form
      setFormData({
        name: '',
        phone: '',
        email: '',
        country: 'India',
        cityState: '',
        budget: '₹50 lakhs - ₹1crore (Flagship)',
        storeLocation: '',
        message: '',
      });

      // Redirect to existing Thank You page
      navigate('/thank-you', {
        state: {
          name: submittedData.name,
          phone: submittedData.phone,
          email: submittedData.email,
          country: submittedData.country,
          cityState: submittedData.cityState,
          budget: submittedData.budget,
          storeLocation: submittedData.storeLocation,
          refId: generatedRef,
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error('Form submission error:', error);
      setSubmitError('Unable to submit your application. Please check your connection and try again.');
    }
  };

  return (
    <section
      id="contact"
      className="contact-section relative py-[clamp(2.5rem,5vw,5.5rem)] px-[clamp(1rem,3.5vw,4.5rem)] bg-[#FAF6EE] text-[#1C1D21] w-full box-border overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto w-full relative z-10">

        <ScrollReveal variant="fade-up" delay={50} duration={1000} className="mb-8 sm:mb-10 lg:mb-12">

          <h2 className="font-serif text-[clamp(1.65rem,3.2vw,3.2rem)] font-extrabold text-[#1C1D21] tracking-tight uppercase leading-tight m-0 mb-3">
            CONTACT & INVESTOR ENQUIRY
          </h2>

          <div className="w-full h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#DEC29D] to-transparent mb-3.5" />

          <p className="font-sans text-[clamp(0.88rem,1.05vw,1.05rem)] text-[#5A5D66] max-w-[820px] leading-relaxed m-0 font-normal">
            Share your details and preferred investment location. The Cavree franchise executive team will connect with you to share detailed financial models and territory availability.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.38fr_0.82fr] gap-8 lg:gap-12 items-start">

          <ScrollReveal variant="fade-right" delay={150} duration={1100} className="bg-white rounded-md p-[clamp(1.15rem,2.8vw,2.5rem)] border border-[#DEC29D]/45 shadow-none relative">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">

                <div className="mb-2">
                  <h3 className="font-serif text-[1.45rem] font-bold text-[#1C1D21] m-0 mb-1 tracking-tight">
                    INVESTOR CONTACT FORM
                  </h3>
                  <p className="font-sans text-[0.88rem] text-[#7A7D87] m-0">
                    Fill in the details below
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="flex flex-col">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <User size={14} className="text-[#B58C36]" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-white border ${errors.name ? 'border-red-500' : 'border-[#DEC29D]/60 focus:border-[#B58C36]'
                        } rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400`}
                    />
                    {errors.name && (
                      <span className="font-sans text-[0.72rem] text-red-600 mt-1">{errors.name}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#B58C36]" />
                      <span>Phone Number *</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-sans text-xs font-semibold text-[#8E9098] select-none border-r border-[#DEC29D]/50 pr-2">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Enter your phone number"
                        maxLength={10}
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`w-full pl-13 pr-3.5 py-2.5 bg-white border ${errors.phone ? 'border-red-500' : 'border-[#DEC29D]/60 focus:border-[#B58C36]'
                          } rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400 font-sans`}
                      />
                    </div>
                    {errors.phone && (
                      <span className="font-sans text-[0.72rem] text-red-600 mt-1">{errors.phone}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-[#B58C36]" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className={`w-full px-3.5 py-2.5 bg-white border ${errors.email ? 'border-red-500' : 'border-[#DEC29D]/60 focus:border-[#B58C36]'
                        } rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400`}
                    />
                    {errors.email && (
                      <span className="font-sans text-[0.72rem] text-red-600 mt-1">{errors.email}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <Globe size={14} className="text-[#B58C36]" />
                      <span>Country *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your country (e.g. India)"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-white border ${errors.country ? 'border-red-500' : 'border-[#DEC29D]/60 focus:border-[#B58C36]'
                        } rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400`}
                    />
                    {errors.country && (
                      <span className="font-sans text-[0.72rem] text-red-600 mt-1">{errors.country}</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#B58C36]" />
                      <span>City & State *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your city & state"
                      value={formData.cityState}
                      onChange={(e) => handleInputChange('cityState', e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-white border ${errors.cityState ? 'border-red-500' : 'border-[#DEC29D]/60 focus:border-[#B58C36]'
                        } rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400`}
                    />
                    {errors.cityState && (
                      <span className="font-sans text-[0.72rem] text-red-600 mt-1">{errors.cityState}</span>
                    )}
                  </div>

                  <div className="flex flex-col relative">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-[#B58C36]" />
                      <span>Investment Budget</span>
                    </label>
                    <div className="relative w-full">
                      <button
                        type="button"
                        onClick={() => setIsBudgetOpen(!isBudgetOpen)}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#DEC29D]/60 hover:border-[#B58C36] focus:border-[#B58C36] rounded text-sm text-[#1C1D21] focus:outline-none transition-colors cursor-pointer flex items-center justify-between text-left"
                      >
                        <span className="truncate pr-2">
                          {budgetOptions.find((opt) => opt.value === formData.budget)?.label || formData.budget}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`text-[#B58C36] shrink-0 transition-transform duration-200 ${isBudgetOpen ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {isBudgetOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsBudgetOpen(false)}
                          />
                          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-[#DEC29D]/60 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden py-1">
                            {budgetOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  handleInputChange('budget', opt.value);
                                  setIsBudgetOpen(false);
                                }}
                                className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${formData.budget === opt.value
                                  ? 'bg-[#FAF6EE] text-[#B58C36] font-bold'
                                  : 'text-[#2A2D34] hover:bg-[#FAF6EE]/70 hover:text-[#1C1D21]'
                                  }`}
                              >
                                <span>{opt.label}</span>
                                {formData.budget === opt.value && (
                                  <CheckCircle2 size={13} className="text-[#B58C36] shrink-0" />
                                )}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:col-span-2">
                    <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                      <Store size={14} className="text-[#B58C36]" />
                      <span>Commercial Space Status</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter space status / location (e.g. Owned / Rented / Looking for space)"
                      value={formData.storeLocation}
                      onChange={(e) => handleInputChange('storeLocation', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#DEC29D]/60 focus:border-[#B58C36] rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-sans text-[0.82rem] font-bold text-[#2A2D34] mb-1.5 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#B58C36]" />
                    <span>Specific Query or Comments</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter your query or message..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DEC29D]/60 focus:border-[#B58C36] rounded text-sm text-[#1C1D21] focus:outline-none transition-colors placeholder:text-gray-400 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-[7px] text-xs text-red-700 flex items-start gap-2 animate-shake">
                    <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 mt-2 bg-gradient-to-r from-[#D4AF37] via-[#C99E32] to-[#B58C36] hover:brightness-105 text-[#18191E] font-sans text-[0.88rem] font-bold tracking-wider uppercase rounded shadow-none transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#18191E] border-t-transparent rounded-full animate-spin" />
                      <span>Submitting to Investor Registry...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT INVESTOR ENQUIRY</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            ) : (

              <div className="text-center py-6 sm:py-8 px-2 sm:px-4">

                <div className="relative mb-5 mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6514] animate-pulse opacity-25 blur-md" />
                  <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-br from-[#1C1D21] via-[#121318] to-[#0A0B0E] border-2 border-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.25)] flex items-center justify-center text-[#DEC29D]">
                    <CheckCircle2 size={36} className="text-[#D4AF37]" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-3">
                  <Sparkles size={12} className="text-[#B58C36]" />
                  <span className="font-sans text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-[#946E1E]">
                    Application Dossier Received
                  </span>
                </div>

                <h3 className="font-serif text-[clamp(1.45rem,2.4vw,2rem)] font-extrabold text-[#1C1D21] m-0 mb-2.5 tracking-tight uppercase leading-tight">
                  Thank You for Your Application
                </h3>

                <p className="font-sans text-[clamp(0.85rem,0.95vw,0.95rem)] text-[#555862] max-w-lg mx-auto mb-6 leading-relaxed">
                  Thank you, <strong className="text-[#1C1D21]">{formData.name || 'Valued Partner'}</strong>. Your executive franchise enquiry has been securely registered with the Cavree Private Wealth Desk.
                </p>

                <div className="bg-[#FAF6EE] border border-[#DEC29D]/50 rounded-xl p-4 max-w-md mx-auto mb-6 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#DEC29D]/30 text-xs">
                    <div>
                      <span className="text-[#8E9098] font-bold block uppercase tracking-wider text-[0.68rem] mb-0.5">
                        Dossier Ref
                      </span>
                      <span className="font-mono font-bold text-[#1C1D21] text-sm">
                        CAV-{referenceId || '842915'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8E9098] font-bold block uppercase tracking-wider text-[0.68rem] mb-0.5">
                        Priority Status
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        Executive Review
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row justify-between gap-2 text-xs text-[#555862]">
                    <div>
                      <span className="text-[#8E9098] block text-[0.68rem] font-bold uppercase tracking-wider mb-0.5">Target Territory</span>
                      <span className="font-semibold text-[#1C1D21]">{formData.cityState || 'National / Metro Territory'}</span>
                    </div>
                    <div>
                      <span className="text-[#8E9098] block text-[0.68rem] font-bold uppercase tracking-wider mb-0.5">Expected Response</span>
                      <span className="font-semibold text-[#946E1E]">&lt; 4 Business Hours</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#DEC29D]/40 rounded-xl p-4 sm:p-5 max-w-md mx-auto mb-7 text-left">
                  <div className="font-serif text-sm font-bold text-[#1C1D21] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FileCheck2 size={16} className="text-[#B58C36]" />
                    <span>Next Strategic Steps</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1C1D21] text-[#D4AF37] font-bold text-[0.7rem] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="font-sans text-xs text-[#4A4E58] m-0 leading-relaxed">
                        <strong className="text-[#1C1D21]">Executive Assessment:</strong> Cavree leadership evaluates territory feasibility & store capacity.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1C1D21] text-[#D4AF37] font-bold text-[0.7rem] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="font-sans text-xs text-[#4A4E58] m-0 leading-relaxed">
                        <strong className="text-[#1C1D21]">Confidential ROI Deck:</strong> You will receive our comprehensive 6-Year FOCO financial projections.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1C1D21] text-[#D4AF37] font-bold text-[0.7rem] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <p className="font-sans text-xs text-[#4A4E58] m-0 leading-relaxed">
                        <strong className="text-[#1C1D21]">Director Consultation:</strong> Direct 1-on-1 briefing with senior brand management.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      window.history.pushState(null, '', '/');
                      navigate('/');
                    }}
                    className="w-full sm:w-1/2 py-3 px-5 bg-gradient-to-r from-[#D4AF37] via-[#C99E32] to-[#B58C36] text-[#08090C] font-sans text-xs font-extrabold uppercase tracking-wider rounded-lg hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-none"
                  >
                    <span>Return to Home</span>
                    <ArrowRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      window.history.pushState(null, '', '#contact');
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        country: 'India',
                        cityState: '',
                        budget: '₹50 Lakhs - ₹1 Crore',
                        storeLocation: '',
                        message: '',
                      });
                    }}
                    className="w-full sm:w-1/2 py-3 px-5 bg-white border border-[#DEC29D]/70 text-[#1C1D21] font-sans text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#FAF6EE] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} className="text-[#946E1E]" />
                    <span>New Enquiry</span>
                  </button>
                </div>
              </div>
            )}
          </ScrollReveal>

          <ScrollReveal variant="fade-left" delay={250} duration={1150} className="flex flex-col justify-between h-full space-y-6">

            <div className="bg-white rounded-md p-[clamp(1.5rem,2.8vw,2.5rem)] border border-[#DEC29D]/45 shadow-none">
              <h3 className="font-serif text-[1.45rem] font-bold text-[#1C1D21] m-0 mb-6 tracking-tight text-center lg:text-left">
                GET IN TOUCH
              </h3>

              <div className="space-y-5">

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className="font-sans text-[0.74rem] font-bold tracking-[0.1em] uppercase text-[#8E9098] block mb-1">
                    Email
                  </span>
                  <a
                    href="mailto:contact@cavree.com"
                    className="font-sans text-[1.08rem] font-bold text-[#B58C36] hover:text-[#1C1D21] transition-colors no-underline inline-flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#B58C36]/10 flex items-center justify-center text-[#B58C36]">
                      <Mail size={13} />
                    </div>
                    <span>contact@cavree.com</span>
                  </a>
                </div>

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <span className="font-sans text-[0.74rem] font-bold tracking-[0.1em] uppercase text-[#8E9098] block mb-1">
                    Website
                  </span>
                  <a
                    href="https://www.cavree.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-[1.08rem] font-bold text-[#B58C36] hover:text-[#1C1D21] transition-colors no-underline inline-flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#B58C36]/10 flex items-center justify-center text-[#B58C36]">
                      <Globe size={13} />
                    </div>
                    <span>www.cavree.com</span>
                  </a>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-[#D4AF37]/40 via-[#DEC29D]/20 to-transparent my-6" />

              <div className="mb-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 mb-1.5 text-[#B58C36]">
                  <Sparkles size={13} />
                  <span className="font-sans text-[0.74rem] font-extrabold tracking-[0.15em] uppercase">
                    FASHION THAT DEFINES YOU
                  </span>
                </div>
                <p className="font-sans text-[0.84rem] text-[#65676E] leading-relaxed m-0 text-center lg:text-left">
                  Partner with an established luxury brand backed by end-to-end operational architecture, guaranteed stock buybacks, and high sales velocity.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-3 border-t border-[#F0E8DA] justify-items-center lg:justify-items-start">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#B58C36] shrink-0" />
                  <span className="font-sans text-[0.75rem] font-semibold text-[#1C1D21]">
                    100% NDA Protected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#B58C36] shrink-0" />
                  <span className="font-sans text-[0.75rem] font-semibold text-[#1C1D21]">
                    4-Hour Fast Response
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
