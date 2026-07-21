import React, { useState } from 'react';
import { Song, CEFRLevel } from '../types';
import { GENRES_LIST } from '../data/songs';

interface DiscoverViewProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  initialGenre?: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ songs, onSelectSong, initialGenre = 'All' }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const levels: (CEFRLevel | 'All')[] = ['All', 'A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper Int', 'C1 Advanced'];

  const filtered = songs.filter((s) => {
    const matchesGenre = selectedGenre === 'All' || s.genre === selectedGenre;
    const matchesLevel = selectedLevel === 'All' || s.level === selectedLevel;
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="font-headline text-3xl font-bold text-[#1b1b24] mb-1">Discover Song Lessons</h2>
        <p className="text-[#464555] text-sm">Find your favorite hit songs arranged for English learning.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587]">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by song name, artist, or lyric..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline-variant/40 rounded-2xl focus:ring-2 focus:ring-[#3525cd]/20 text-sm shadow-xs"
        />
      </div>

      {/* Filters: Level & Genre */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-[#777587] uppercase tracking-wider block mb-2">CEFR Level</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedLevel === lvl
                    ? 'bg-[#3525cd] text-white shadow-xs'
                    : 'bg-[#f5f2ff] text-[#464555] hover:bg-[#eae6f4]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#777587] uppercase tracking-wider block mb-2">Genre</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', ...GENRES_LIST].map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-[#712ae2] text-white shadow-xs'
                    : 'bg-[#f5f2ff] text-[#464555] hover:bg-[#eae6f4]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((song) => (
          <div
            key={song.id}
            onClick={() => onSelectSong(song)}
            className="bg-white rounded-3xl p-5 border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
                <img
                  src={song.coverImage}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-5xl transform group-hover:scale-110 transition-transform shadow-lg">
                    play_circle
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold border border-white/20">
                  {song.level}
                </div>
                <div className="absolute top-3 right-3 bg-[#3525cd] text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                  {song.genre}
                </div>
              </div>

              <h3 className="font-headline font-bold text-lg text-[#1b1b24] group-hover:text-[#3525cd] transition-colors">
                {song.title}
              </h3>
              <p className="text-[#464555] text-xs font-medium mb-3">{song.artist}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
              <span className="text-xs text-[#777587] font-semibold">
                {song.lyrics?.length || 0} Lyric Lines
              </span>
              <button className="flex items-center gap-1.5 bg-[#f5f2ff] text-[#3525cd] px-3.5 py-1.5 rounded-full text-xs font-bold group-hover:bg-[#3525cd] group-hover:text-white transition-all">
                <span>Start</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
