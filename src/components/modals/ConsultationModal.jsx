import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import { validateEmail, validateRequired } from '../../utils/validation';
import confetti from 'canvas-confetti';

export const ConsultationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    advisor: 'Elena Rostova (Chief Investment Officer)',
    channel: 'Private Encrypted Video Call',
    date: '2026-09-04',
    timeSlot: '14:00 CET',
    investmentTier: 'Imperial Flagship ($500k)',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

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
      setIsBooked(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#FFF3B3', '#C5A059']
      });
    }, 1200);
  };

  const timeSlots = ['10:00 CET', '11:30 CET', '14:00 CET', '16:00 CET', '18:30 CET', '20:00 CET'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-[680px]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {!isBooked ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="gold-badge">
                <Sparkles size={12} /> PRIVATE WEALTH ADVISORY
              </span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-2">
              Schedule 1-on-1 Executive Briefing
            </h3>
            <p className="text-sm text-white/70 mb-6">
              Arrange a private consultation with our senior investment leadership to explore franchise allocations, review audited ledgers, and examine territory availability.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-white/[0.04] border ${errors.name ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  />
                  {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Direct Email *
                  </label>
                  <input
                    type="email"
                    placeholder="investor@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-white/[0.04] border ${errors.email ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  />
                  {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Phone / Signal / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full bg-white/[0.04] border ${errors.phone ? 'border-red-400' : 'border-white/15'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors`}
                  />
                  {errors.phone && <span className="text-red-400 text-xs mt-1 block">{errors.phone}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Preferred Senior Director
                  </label>
                  <select
                    value={formData.advisor}
                    onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="Elena Rostova (Chief Investment Officer)">Elena Rostova (Chief Investment Officer)</option>
                    <option value="Alexandre De Montfort (Founder & CEO)">Alexandre De Montfort (Founder & CEO)</option>
                    <option value="Marcus Vance (Head of Global Retail)">Marcus Vance (Head of Global Retail)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Briefing Format
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    <option value="Private Encrypted Video Call">Private Encrypted Video Call</option>
                    <option value="Paris VIP Suite (Avenue Montaigne)">Paris VIP Suite (Avenue Montaigne)</option>
                    <option value="London Mayfair Suite (New Bond St)">London Mayfair Suite (New Bond St)</option>
                    <option value="New York Suite (Madison Ave)">New York Suite (Madison Ave)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                  Select Time Slot (CET)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-2 text-xs rounded transition-colors ${
                        formData.timeSlot === slot
                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-bold border border-[#D4AF37]'
                          : 'bg-white/[0.04] text-white/70 border border-white/10 hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                  Specific Topics / City Inquiries (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquiring on London Mayfair flagship availability and tax residency structuring..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-2 py-3.5"
              >
                {isSubmitting ? 'Reserving VIP Appointment...' : 'Confirm Executive Consultation'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/15 border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-5 text-[#D4AF37]">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-3">
              Consultation Confirmed
            </h3>
            <p className="text-sm md:text-base text-white/70 max-w-md mx-auto mb-6 leading-relaxed">
              Your private session with <strong className="text-[#F3E5AB]">{formData.advisor}</strong> has been secured for <strong className="text-white">{formData.date} at {formData.timeSlot}</strong>.
            </p>

            <div className="bg-[#131721]/80 border border-[#D4AF37]/30 rounded-xl p-5 max-w-sm mx-auto mb-7 text-left text-xs md:text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-white/50">Channel:</span>
                <span className="text-white font-medium">{formData.channel}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/50">Calendar Invite:</span>
                <span className="text-[#F3E5AB]">Dispatched to {formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Security Protocol:</span>
                <span className="text-white">Encrypted Meeting PIN Attached</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary px-8 py-3"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
