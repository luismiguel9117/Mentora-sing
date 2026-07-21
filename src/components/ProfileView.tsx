import React from 'react';
import { UserStats, AchievementBadge } from '../types';

interface ProfileViewProps {
  userStats: UserStats;
  badges: AchievementBadge[];
  onOpenProModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userStats, badges, onOpenProModal }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full border-4 border-[#3525cd]/20 p-1 overflow-hidden shadow-md">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEujLKT3vOOjwY4GoRimBbluhFSJOtfPkxIIv4KMTkzOx8i_aYPyXVG0u4HUspqbEN0dqx5_uoKO-xpab8XRpfWFVVFziwsucokaziJWG-i70hF0G9dykRBbQoQrufTLNbV2-ZkHkJlqXgPu9lUBE3QSMpszdQ6LiWKGeUMWuic8n1DQTipQhhalMIZma5g7bySNPgKC_BpXWWpdEMgBpXDFMVyPB6P0E1W9IGja_c99s791U0xW-FJDQsiPfgQ98r0FgBWGAppUU"
            alt="Alex Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="font-headline text-2xl font-bold text-[#1b1b24]">Alex K.</h2>
            <span className="bg-[#3525cd] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Free Plan
            </span>
          </div>
          <p className="text-xs text-[#464555] font-medium">Native Language: Spanish • Target: English (B2)</p>
          <p className="text-xs text-[#712ae2] font-semibold pt-1">Member since March 2026</p>
        </div>

        <button
          onClick={onOpenProModal}
          className="px-6 py-2.5 bg-[#712ae2] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#8a4cfc] transition-all"
        >
          Upgrade to Pro
        </button>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#f5f2ff] p-5 rounded-3xl text-center border border-outline-variant/20">
          <span className="material-symbols-outlined text-[#3525cd] text-2xl mb-1">auto_awesome</span>
          <p className="text-2xl font-headline font-extrabold text-[#3525cd]">{userStats.weeklyXp}</p>
          <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Total XP</p>
        </div>

        <div className="bg-[#f5f2ff] p-5 rounded-3xl text-center border border-outline-variant/20">
          <span className="material-symbols-outlined text-[#7e3000] text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <p className="text-2xl font-headline font-extrabold text-[#7e3000]">{userStats.streakDays} Days</p>
          <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Active Streak</p>
        </div>

        <div className="bg-[#f5f2ff] p-5 rounded-3xl text-center border border-outline-variant/20">
          <span className="material-symbols-outlined text-[#22C55E] text-2xl mb-1">record_voice_over</span>
          <p className="text-2xl font-headline font-extrabold text-[#22C55E]">{userStats.pronunciationPercent}%</p>
          <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Avg Accuracy</p>
        </div>

        <div className="bg-[#f5f2ff] p-5 rounded-3xl text-center border border-outline-variant/20">
          <span className="material-symbols-outlined text-[#712ae2] text-2xl mb-1">queue_music</span>
          <p className="text-2xl font-headline font-extrabold text-[#712ae2]">{userStats.songsDone}</p>
          <p className="text-[11px] font-bold text-[#777587] uppercase tracking-wider">Songs Mastered</p>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-xs space-y-4">
        <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Badges Showcase</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center space-y-2 ${
                b.unlocked ? 'bg-[#f5f2ff] border-[#3525cd]/20' : 'bg-slate-50 border-slate-200 opacity-40 grayscale'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-tr ${b.colorGradient} mx-auto flex items-center justify-center shadow-md`}
              >
                <span className="material-symbols-outlined text-white text-2xl">{b.icon}</span>
              </div>
              <p className="font-headline font-bold text-xs text-[#1b1b24]">{b.name}</p>
              <p className="text-[10px] text-[#464555] leading-tight">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
