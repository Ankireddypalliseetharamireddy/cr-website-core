import React, { useState, useEffect } from 'react';
import { X, Video, ShieldCheck, Play, Pause } from 'lucide-react';

export const CctvModal = ({ isOpen, onClose }) => {
  const [activeCam, setActiveCam] = useState('cam1');
  const [timeString, setTimeString] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [trafficCount, setTrafficCount] = useState(18);
  const [todayRevenue, setTodayRevenue] = useState(54200);

  useEffect(() => {
    if (!isOpen) return;

    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toUTCString().replace('GMT', 'UTC') + ' • ' + now.toLocaleTimeString());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const statsInterval = setInterval(() => {
      setTrafficCount(prev => Math.max(12, Math.min(32, prev + (Math.random() > 0.5 ? 1 : -1))));
      setTodayRevenue(prev => prev + (Math.random() > 0.6 ? 450 : 0));
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const cameras = [
    {
      id: 'cam1',
      name: 'CAM 01 • Main Flagship Floor',
      location: 'Avenue Montaigne, Paris',
      feedType: '4K Ultra-Wide Sensor',
      status: 'ONLINE • ENCRYPTED',
      badgeColor: '#10B981',
      previewGradient: 'radial-gradient(ellipse at center, rgba(30, 24, 15, 0.9) 0%, rgba(10, 12, 16, 0.98) 100%)',
      sceneName: 'Paris Flagship Central Vitrine Hall'
    },
    {
      id: 'cam2',
      name: 'CAM 02 • High Vault & Horology Vitrines',
      location: 'Geneva Salon',
      feedType: 'Biometric Vitrine AI',
      status: 'ONLINE • SECURE',
      badgeColor: '#10B981',
      previewGradient: 'radial-gradient(ellipse at center, rgba(20, 25, 38, 0.9) 0%, rgba(7, 8, 12, 0.98) 100%)',
      sceneName: 'Geneva High Jewelry & Timepiece Vault'
    },
    {
      id: 'cam3',
      name: 'CAM 03 • VIP Haute Styling Suite',
      location: 'New Bond St, London',
      feedType: '360 Panoramic Sensor',
      status: 'ONLINE • PRIVACY MASK',
      badgeColor: '#10B981',
      previewGradient: 'radial-gradient(ellipse at center, rgba(35, 18, 25, 0.9) 0%, rgba(8, 10, 15, 0.98) 100%)',
      sceneName: 'London Mayfair VIP Champagne Salon'
    },
    {
      id: 'cam4',
      name: 'CAM 04 • Smart POS & Concierge Desk',
      location: 'Madison Ave, New York',
      feedType: 'IoT Transactional Terminal',
      status: 'ONLINE • STREAMING',
      badgeColor: '#10B981',
      previewGradient: 'radial-gradient(ellipse at center, rgba(15, 30, 25, 0.9) 0%, rgba(8, 11, 14, 0.98) 100%)',
      sceneName: 'New York Madison Concierge & Terminal'
    }
  ];

  const currentCam = cameras.find(c => c.id === activeCam) || cameras[0];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-[860px] p-4 sm:p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2.5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="gold-badge">
                <Video size={13} /> INVESTOR REAL-TIME SURVEILLANCE
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#10B981]" />
                LIVE SECURE STREAM
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl mt-1.5 text-white font-bold">
              24/7 Store IoT & Surveillance Portal
            </h3>
          </div>
          <div className="text-[0.7rem] sm:text-xs text-white/50 font-mono">
            {timeString}
          </div>
        </div>

        <div
          className="relative w-full min-h-[300px] sm:min-h-[340px] md:min-h-[380px] rounded-xl border border-[#D4AF37]/30 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between p-3.5 sm:p-5"
          style={{ background: currentCam.previewGradient }}
        >

          <div className="flex justify-between items-start z-10 flex-wrap gap-2">
            <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
              <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.7rem] sm:text-xs font-semibold text-white flex items-center gap-1.5 sm:gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                REC • {currentCam.name}
              </div>
              <span className="text-[0.7rem] sm:text-xs text-[#F3E5AB] bg-black/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
                {currentCam.location}
              </span>
            </div>

            <div className="bg-black/70 px-2.5 py-1 rounded text-[0.68rem] sm:text-xs text-white/70 font-mono">
              4K UHD • 60 FPS • 5.2 Mbps
            </div>
          </div>

          <div className="relative my-4 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center opacity-85">
              <div className="font-serif text-base sm:text-lg md:text-xl font-semibold text-[#F3E5AB] tracking-wide mb-1">
                {currentCam.sceneName}
              </div>
              <div className="text-[0.7rem] sm:text-xs text-white/50">
                Encrypted Franchise Stream • Token ID: CAV-SEC-840291
              </div>
              <div className="flex justify-center gap-3 sm:gap-6 mt-3 sm:mt-5 flex-wrap">
                <div className="bg-black/65 border border-[#D4AF37]/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <div className="text-[0.65rem] sm:text-[0.7rem] text-white/50">ACTIVE CLIENTS</div>
                  <div className="text-base sm:text-lg text-[#D4AF37] font-bold">{trafficCount} In Store</div>
                </div>
                <div className="bg-black/65 border border-[#D4AF37]/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                  <div className="text-[0.65rem] sm:text-[0.7rem] text-white/50">TODAY'S GROSS TOPLINE</div>
                  <div className="text-base sm:text-lg text-emerald-400 font-bold">${todayRevenue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom HUD overlay */}
          <div className="flex justify-between items-center z-10 bg-black/75 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-[#D4AF37] flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer"
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'Pause Feed' : 'Resume'}</span>
              </button>
              <div className="w-px h-3.5 bg-white/20" />
              <span className="text-[0.7rem] sm:text-xs text-white/70">
                Sensor: <strong className="text-white">{currentCam.feedType}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[0.7rem] sm:text-xs text-emerald-400">
              <ShieldCheck size={14} />
              <span>AES-256 Cloud Escrow Sync</span>
            </div>
          </div>
        </div>

        {/* Camera Selector Grid */}
        <div className="mt-4 sm:mt-5">
          <div className="text-xs text-white/70 mb-2.5 font-semibold">
            SWITCH MULTI-ANGLE SENSORS:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {cameras.map((cam) => {
              const isSelected = cam.id === activeCam;
              return (
                <button
                  type="button"
                  key={cam.id}
                  onClick={() => setActiveCam(cam.id)}
                  className={`text-left p-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37]/15 border border-[#D4AF37]'
                      : 'bg-white/[0.03] border border-white/10 hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#F3E5AB]' : 'text-white'}`}>
                      {cam.id.toUpperCase()}
                    </span>
                    <span className="text-[0.65rem] text-emerald-400 font-bold">
                      ● LIVE
                    </span>
                  </div>
                  <div className="text-xs text-white/50 whitespace-nowrap overflow-hidden text-ellipsis">
                    {cam.location}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center flex-wrap gap-4">
          <div className="text-xs text-white/50">
            Franchise investors receive dedicated mobile app credentials for 24/7 continuous monitoring.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};

export default CctvModal;
