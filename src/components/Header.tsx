import React, { useState } from 'react';
import { Song, UserStats } from '../types';

interface HeaderProps {
  userStats: UserStats;
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userStats, songs, onSelectSong, onOpenProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-30">
      <div>
        <h2 className="font-headline text-3xl font-bold text-[#1b1b24]">Hi, Alex!</h2>
        <p className="text-[#464555] text-base font-normal">Ready to hit the high notes today?</p>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Input */}
        <div className="relative flex-1 md:w-80">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(e.target.value.trim().length > 0);
              }}
              onFocus={() => setShowSearchResults(searchQuery.trim().length > 0)}
              placeholder="Search songs or lessons..."
              className="w-full pl-12 pr-4 py-3 bg-[#f5f2ff] border-none rounded-full focus:ring-2 focus:ring-[#3525cd]/20 text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#1b1b24]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && (
            <div className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-xl border border-outline-variant/30 p-2 max-h-72 overflow-y-auto z-50">
              <p className="text-[11px] font-semibold text-[#777587] px-3 py-1">Song Lessons ({filteredSongs.length})</p>
              {filteredSongs.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#777587]">No songs found</div>
              ) : (
                filteredSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => {
                      onSelectSong(song);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#f5f2ff] rounded-xl text-left transition-colors"
                  >
                    <img src={song.coverImage} alt={song.title} className="w-10 h-10 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1b1b24] truncate">{song.title}</p>
                      <p className="text-xs text-[#464555] truncate">{song.artist} • {song.level}</p>
                    </div>
                    <span className="material-symbols-outlined text-sm text-[#3525cd]">play_circle</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* Daily Streak Fire Badge */}
          <div className="flex items-center gap-1.5 bg-[#7e3000]/10 px-3.5 py-1.5 rounded-full border border-[#7e3000]/20">
            <span className="material-symbols-outlined text-[#7e3000] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
            <span className="font-semibold text-sm text-[#7e3000]">{userStats.streakDays}</span>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 text-[#464555] hover:bg-[#eae6f4] rounded-full transition-colors relative"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant/30 p-4 z-50">
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-outline-variant/20">
                  <span className="font-bold text-sm text-[#1b1b24]">Notifications</span>
                  <span className="text-[11px] font-semibold text-[#3525cd] cursor-pointer" onClick={() => setShowNotifications(false)}>Clear all</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 text-xs">
                    <span className="material-symbols-outlined text-[#7e3000] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <div>
                      <p className="font-semibold text-[#1b1b24]">12 Day Streak!</p>
                      <p className="text-[#464555]">Sing today to keep your streak burning!</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="material-symbols-outlined text-[#4f46e5] text-base">music_note</span>
                    <div>
                      <p className="font-semibold text-[#1b1b24]">Daily Challenge Ready</p>
                      <p className="text-[#464555]">Master "Believer" for +50 XP bonus.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full border-2 border-[#3525cd]/20 p-0.5 overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEujLKT3vOOjwY4GoRimBbluhFSJOtfPkxIIv4KMTkzOx8i_aYPyXVG0u4HUspqbEN0dqx5_uoKO-xpab8XRpfWFVVFziwsucokaziJWG-i70hF0G9dykRBbQoQrufTLNbV2-ZkHkJlqXgPu9lUBE3QSMpszdQ6LiWKGeUMWuic8n1DQTipQhhalMIZma5g7bySNPgKC_BpXWWpdEMgBpXDFMVyPB6P0E1W9IGja_c99s791U0xW-FJDQsiPfgQ98r0FgBWGAppUU"
              alt="Alex Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
