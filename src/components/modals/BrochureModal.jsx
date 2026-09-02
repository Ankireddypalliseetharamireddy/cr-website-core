import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, Shield, Lock } from 'lucide-react';
import { validateEmail, validateRequired } from '../../utils/validation';
import confetti from 'canvas-confetti';

export const BrochureModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    capacity: '$500k - $1M',
    investorType: 'Individual / Family Office',
    ndaAccepted: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Full name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!validateRequired(formData.phone)) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDownloaded(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E6A3', '#AA7C11', '#FFFFFF']
      });
    }, 1200);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([
      `========================================================================\n` +
      `CAVREE LUXURY HAUTE COMMERCE - EXECUTIVE MEMORANDUM & FOCO BLUEPRINT\n` +
      `Confidential Investor Package | Reference: CAV-${Math.floor(100000 + Math.random() * 900000)}\n` +
      `========================================================================\n\n` +
      `Prepared exclusively for: ${formData.name || 'Accredited Investor'}\n` +
      `Allocation Target: ${formData.capacity}\n` +
      `Date Issued: ${new Date().toLocaleDateString()}\n\n` +
      `1. FOCO FRAMEWORK OVERVIEW\n` +
      `   - Target Annualized IRR: 18% - 24%\n` +
      `   - Asset Backing: 100% physically insured inventory & prime leasehold\n` +
      `   - Payout Frequency: 1st of every calendar month\n\n` +
      `3. CAPITAL PROTECTION & SWISS ESCROW\n` +
      `   - 100% Contractual Buyback Covenant from Year 3\n` +
      `   - Lloyds of London certified inventory policy\n` +
      `   - 24/7 Smart CCTV & POS IoT Investor Access\n\n` +
      `Private Wealth Desk: contact@cavree.com | +1 (800) 845-CAVREE\n` +
      `450 Avenue Montaigne, 75008 Paris, France\n`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `CAVREE_Executive_Deck_${(formData.name || 'Investor').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-[640px]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!isDownloaded ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="gold-badge">
                <Lock size={12} /> CONFIDENTIAL INVESTOR DECK
              </span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-2.5">
              Download Cavree Franchise Memorandum
            </h3>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Receive our comprehensive 48-page institutional investor dossier, including audited financial ledgers, FOCO legal covenants, store architectural specs, and historical dividend breakdowns.
            </p>

            <div className="flex items-center gap-4 p-4 bg-[#D4AF37]/[0.05] border border-[#D4AF37]/30 rounded-lg mb-6">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] flex items-center justify-center text-black shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <div className="font-semibold text-white text-sm">
                  CAVREE-2026-INVESTMENT-DOSSIER.PDF
                </div>
                <div className="text-white/50 text-xs mt-0.5">
                  48 Pages • Verified Financials • Tier Matrix • Asset Safeguards
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lord Julian Sterling"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-white/[0.04] border ${errors.name ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                />
                {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Institutional / Direct Email *
                  </label>
                  <input
                    type="email"
                    placeholder="julian@sterlingtrust.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-white/[0.04] border ${errors.email ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  />
                  {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="+44 20 7946 0912"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full bg-white/[0.04] border ${errors.phone ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  />
                  {errors.phone && <span className="text-red-400 text-xs mt-1 block">{errors.phone}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Capital Allocation Target
                  </label>
                  <select
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="$250k - $500k">$250k – $500k (Sovereign)</option>
                    <option value="$500k - $1M">$500k – $1.0M (Imperial)</option>
                    <option value="$1M - $3M+">$1.0M – $3.0M+ (Heritage)</option>
                    <option value="Institutional / Multi-Unit">Institutional / Multi-Unit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Investor Classification
                  </label>
                  <select
                    value={formData.investorType}
                    onChange={(e) => setFormData({ ...formData, investorType: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="Individual / Family Office">Individual / Family Office</option>
                    <option value="Accredited Private Investor">Accredited Private Investor</option>
                    <option value="Wealth Manager / Advisory">Wealth Manager / Advisory</option>
                    <option value="Institutional Fund">Institutional Fund</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <Shield size={16} className="text-[#D4AF37] shrink-0" />
                <span className="text-xs text-white/50">
                  Protected by 256-bit bank encryption. We respect absolute Swiss privacy standards.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2 py-3.5"
              >
                {isSubmitting ? (
                  <span>Generating Secure Dossier...</span>
                ) : (
                  <>
                    <span>Unlock & Access Memorandum</span>
                    <Download size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-5 text-[#D4AF37]">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-3">
              Memorandum Cleared & Dispatched
            </h3>
            <p className="text-sm md:text-base text-white/70 max-w-md mx-auto mb-7 leading-relaxed">
              Thank you, <strong className="text-[#F3E5AB]">{formData.name}</strong>. Your confidential investor package has been registered with reference ID <span className="text-[#D4AF37]">#CAV-789042</span> and sent to <strong className="text-white">{formData.email}</strong>.
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleDownloadFile}
                className="btn-primary w-full py-3"
              >
                <Download size={18} />
                <span>Save Dossier to Device Now</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full py-2.5"
              >
                <span>Return to Cavree Experience</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrochureModal;
