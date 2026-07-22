import React from 'react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenProModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenProModal }) => {
  return (
    <>
      {/* Desktop Navigation Shell */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest flex flex-col items-center py-10 hidden md:flex border-r border-outline-variant/30 z-40">
        <div className="mb-10 px-6 w-full cursor-pointer flex items-center gap-3.5" onClick={() => onSelectTab('home')}>
          <div className="w-10 h-10 rounded-2xl bg-[#4f46e5] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              music_note
            </span>
          </div>
          <div>
            <h1 className="font-headline text-xl font-extrabold text-slate-900 tracking-tight leading-none">
              Mentora
            </h1>
            <span className="text-[10px] font-extrabold tracking-widest text-[#712ae2] uppercase">
              Sing
            </span>
          </div>
        </div>

        <nav className="flex-1 w-full px-4 space-y-2">
          {/* Home */}
          <button
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
              currentTab === 'home'
                ? 'bg-[#4f46e5] text-white shadow-md font-semibold'
                : 'text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              home
            </span>
            <span className="text-sm font-medium">Home</span>
          </button>

          {/* Discover */}
          <button
            onClick={() => onSelectTab('discover')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
              currentTab === 'discover'
                ? 'bg-[#4f46e5] text-white shadow-md font-semibold'
                : 'text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined">explore</span>
            <span className="text-sm font-medium">Discover</span>
          </button>

          {/* Practice */}
          <button
            onClick={() => onSelectTab('practice')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
              currentTab === 'practice'
                ? 'bg-[#4f46e5] text-white shadow-md font-semibold'
                : 'text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined">mic_external_on</span>
            <span className="text-sm font-medium">Practice</span>
          </button>

          {/* Community */}
          <button
            onClick={() => onSelectTab('community')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
              currentTab === 'community'
                ? 'bg-[#4f46e5] text-white shadow-md font-semibold'
                : 'text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm font-medium">Community</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => onSelectTab('profile')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
              currentTab === 'profile'
                ? 'bg-[#4f46e5] text-white shadow-md font-semibold'
                : 'text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">Profile</span>
          </button>

          {/* Configuración */}
          <button
            onClick={() => window.location.href = '/config'}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-[#464555] hover:bg-[#eae6f4]"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Configuración</span>
          </button>
        </nav>

        {/* Upgrade Pro Card */}
        <div className="px-6 w-full">
          <div className="p-4 rounded-2xl bg-[#712ae2]/10 border border-[#712ae2]/20">
            <p className="font-semibold text-xs text-[#712ae2] mb-1">Upgrade to Pro</p>
            <p className="text-[11px] text-[#464555] mb-3 leading-tight">
              Unlock AI singing coach and lyrics breakdown.
            </p>
            <button
              onClick={onOpenProModal}
              className="w-full py-2 bg-[#712ae2] text-white rounded-full font-semibold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Go Premium
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Shell */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white/90 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.08)] border-t border-outline-variant/30 rounded-t-2xl">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
            currentTab === 'home' ? 'bg-[#4f46e5] text-white font-semibold' : 'text-[#464555]'
          }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : undefined }}>
            home
          </span>
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
            currentTab === 'discover' ? 'bg-[#4f46e5] text-white font-semibold' : 'text-[#464555]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">explore</span>
          <span className="text-[10px] font-medium mt-0.5">Discover</span>
        </button>

        <button
          onClick={() => onSelectTab('practice')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
            currentTab === 'practice' ? 'bg-[#4f46e5] text-white font-semibold' : 'text-[#464555]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">mic_external_on</span>
          <span className="text-[10px] font-medium mt-0.5">Practice</span>
        </button>

        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
            currentTab === 'community' ? 'bg-[#4f46e5] text-white font-semibold' : 'text-[#464555]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">group</span>
          <span className="text-[10px] font-medium mt-0.5">Community</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all ${
            currentTab === 'profile' ? 'bg-[#4f46e5] text-white font-semibold' : 'text-[#464555]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-medium mt-0.5">Profile</span>
        </button>
      </nav>
    </>
  );
};
