import React, { useState } from 'react';
import { X, MapPin, Search, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { validateRequired } from '../../utils/validation';

export const LocationCheckerModal = ({ isOpen, onClose, onOpenConsultation }) => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('United States');
  const [tier, setTier] = useState('Imperial Flagship ($500k)');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!validateRequired(query)) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const isReserved = query.toLowerCase().includes('dubai') || query.toLowerCase().includes('paris');
      setResult({
        location: query.toUpperCase(),
        country: country,
        tier: tier,
        status: isReserved ? 'WAITLIST / NEAR CAPACITY' : 'PRIME TERRITORY AVAILABLE',
        statusType: isReserved ? 'warning' : 'available',
        uhnwScore: '94 / 100 (Exceptional Affluence)',
        luxuryFootfall: 'High Density Foot-Traffic Corridor',
        radiusProtection: '8-Mile Enforceable Exclusive Covenant',
        projectedIrr: '21.5% - 24.0% Annualized',
        readyBoutiqueSites: '2 Turnkey Spaces Identified in Central District',
      });
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-[680px]" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <span className="gold-badge">
            <MapPin size={12} /> GLOBAL TERRITORY FEASIBILITY
          </span>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl text-white font-bold mb-2">
          Check Metropolitan Territory Feasibility
        </h3>
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Cavree enforces strict territorial exclusivity to preserve luxury pricing power and prevent intra-brand competition. Check if your preferred city or postal code is eligible for boutique allocation.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                City or Zip / Postal Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Zurich, Beverly Hills 90210, Mayfair London"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/15 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <MapPin size={18} className="text-[#D4AF37] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
                Jurisdiction
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Switzerland">Switzerland</option>
                <option value="European Union">European Union</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Singapore / Japan">Singapore / Japan</option>
                <option value="Other International">Other International</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !query}
            className="btn-primary w-full py-3.5 mt-1"
          >
            {isSearching ? (
              <span>Querying Global Territory Registry...</span>
            ) : (
              <>
                <Search size={18} />
                <span>Verify Territory Availability</span>
              </>
            )}
          </button>
        </form>

        {result && (
          <div
            className={`bg-[#121620]/95 border rounded-xl p-5 sm:p-6 transition-all ${
              result.statusType === 'available' ? 'border-[#D4AF37]' : 'border-amber-500'
            }`}
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3 flex-wrap gap-2">
              <div>
                <span className="text-xs text-white/50 uppercase">Territory Assessment For</span>
                <div className="font-serif text-lg md:text-xl font-bold text-[#F3E5AB]">
                  {result.location}, {result.country}
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  result.statusType === 'available'
                    ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400'
                    : 'bg-amber-500/15 border border-amber-500 text-amber-400'
                }`}
              >
                {result.statusType === 'available' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {result.status}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-sm">
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="text-xs text-white/50">UHNW Demographics:</div>
                <div className="text-white font-semibold mt-0.5">{result.uhnwScore}</div>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="text-xs text-white/50">Radius Protection:</div>
                <div className="text-[#F3E5AB] font-semibold mt-0.5">{result.radiusProtection}</div>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="text-xs text-white/50">Projected Store IRR:</div>
                <div className="text-emerald-400 font-semibold mt-0.5">{result.projectedIrr}</div>
              </div>
              <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <div className="text-xs text-white/50">Site Identification:</div>
                <div className="text-white font-semibold mt-0.5">{result.readyBoutiqueSites}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenConsultation) onOpenConsultation();
              }}
              className="btn-primary w-full py-3"
            >
              <Sparkles size={16} />
              <span>Reserve Exclusive Territory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCheckerModal;
