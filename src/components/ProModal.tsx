import React, { useState } from 'react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-outline-variant/30 space-y-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777587] hover:bg-[#f5f2ff] p-1.5 rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {!subscribed ? (
          <>
            <div className="text-center space-y-2">
              <span className="bg-[#712ae2]/10 text-[#712ae2] text-xs font-extrabold px-3 py-1 rounded-full border border-[#712ae2]/20">
                MENTORA SING PRO
              </span>
              <h3 className="font-headline font-extrabold text-2xl text-[#1b1b24]">Unlock AI Singing Coach</h3>
              <p className="text-xs text-[#464555]">Fast-track your English pronunciation with music.</p>
            </div>

            <div className="space-y-3 bg-[#f5f2ff] p-4 rounded-2xl">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1b1b24]">
                <span className="material-symbols-outlined text-[#22C55E]">check_circle</span>
                <span>Unlimited AI Vocal & Pronunciation Analysis</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1b1b24]">
                <span className="material-symbols-outlined text-[#22C55E]">check_circle</span>
                <span>Full Access to 500+ Hit Song Lessons</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1b1b24]">
                <span className="material-symbols-outlined text-[#22C55E]">check_circle</span>
                <span>Grammar & Slang Lyric Breakdown</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#1b1b24]">
                <span className="material-symbols-outlined text-[#22C55E]">check_circle</span>
                <span>Offline Karaoke Video Mode</span>
              </div>
            </div>

            <div className="border-t pt-4 border-outline-variant/20 flex items-center justify-between">
              <div>
                <p className="text-xl font-headline font-extrabold text-[#3525cd]">$7.99 <span className="text-xs text-[#777587] font-normal">/ month</span></p>
                <p className="text-[10px] text-[#22C55E] font-bold">7 days free trial included</p>
              </div>

              <button
                onClick={() => setSubscribed(true)}
                className="px-6 py-3 bg-[#712ae2] hover:bg-[#8a4cfc] text-white font-bold text-xs rounded-full shadow-lg transition-all active:scale-95"
              >
                Start Free Trial
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4 animate-fadeIn">
            <span className="material-symbols-outlined text-5xl text-[#22C55E]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <h3 className="font-headline font-bold text-2xl text-[#1b1b24]">Welcome to Pro!</h3>
            <p className="text-xs text-[#464555]">Your 7-day free trial is active. Enjoy unlimited AI singing coaching!</p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#3525cd] text-white font-bold text-xs rounded-full shadow-md"
            >
              Continue Learning
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
