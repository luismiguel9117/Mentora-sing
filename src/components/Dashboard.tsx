import React, { useState } from 'react';
import { Song, UserStats, AchievementBadge, PracticeMode } from '../types';
import { GENRES_LIST } from '../data/songs';

interface DashboardProps {
  songs: Song[];
  featuredSong: Song;
  userStats: UserStats;
  badges: AchievementBadge[];
  onStartSinging: (song: Song) => void;
  onOpenPracticeMode: (mode: PracticeMode, song?: Song) => void;
  onSelectGenre: (genre: string) => void;
  onLoadCustomSong: (song: Song) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  songs,
  featuredSong,
  userStats,
  badges,
  onStartSinging,
  onOpenPracticeMode,
  onSelectGenre,
  onLoadCustomSong
}) => {
  const [selectedGenreChip, setSelectedGenreChip] = useState('Pop Hits');
  const [ytLink, setYtLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const upNextSongs = songs.filter(s => s.id !== featuredSong.id);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytLink) return;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = ytLink.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : ytLink.trim();

    if (videoId.length !== 11) {
      alert("Por favor introduce un enlace o ID de YouTube válido de 11 caracteres.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-youtube-subs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });
      const data = await res.json();
      if (data.success && data.subtitles && data.subtitles.length > 0) {
        const customSong: Song = {
          id: videoId,
          title: 'YouTube Track',
          artist: 'Dynamic Song',
          level: 'B1 Intermediate',
          genre: 'Pop Hits',
          durationSeconds: 180,
          progressPercent: 0,
          practicedCount: '1',
          videoImage: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          coverImage: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          lyrics: data.subtitles.map((cue: any) => ({
            id: cue.id,
            timeSeconds: cue.start,
            text: cue.en,
            spanishTranslation: cue.es
          }))
        };
        onLoadCustomSong(customSong);
      } else {
        alert("No se pudieron generar los subtítulos. Intenta con otro video o asegúrate de que tenga subtítulos en inglés en YouTube.");
      }
    } catch (err) {
      alert("Error al conectar con la API de subtítulos.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Custom Song Subtitle Loader card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <span className="material-symbols-outlined text-2xl">sparkles</span>
          </div>
          <div>
            <h2 className="font-bold text-emerald-950 font-headline text-lg">¿Quieres cantar otra canción de YouTube?</h2>
            <p className="text-sm text-emerald-700 font-medium">Introduce cualquier enlace o ID de YouTube y generaremos la pista interactiva en segundos.</p>
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className="flex gap-2 w-full md:w-auto max-w-md">
          <input 
            type="text" 
            value={ytLink}
            onChange={(e) => setYtLink(e.target.value)}
            placeholder="Enlace de YouTube..." 
            className="flex-grow md:w-64 px-4 py-3 rounded-2xl border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
          />
          <button 
            type="submit"
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isGenerating ? "Procesando..." : "Conectar"}
          </button>
        </form>
      </div>
      {/* Hero Section: Featured Lesson */}
      <section className="mb-8">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#8a4cfc] to-[#712ae2] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-10 shadow-2xl">
          {/* Visual Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

          {/* Album Art Container */}
          <div className="relative w-44 h-44 md:w-60 md:h-60 flex-shrink-0 z-10 shadow-2xl rounded-2xl overflow-hidden border-4 border-white/20 group cursor-pointer" onClick={() => onStartSinging(featuredSong)}>
            <img
              src={featuredSong.coverImage}
              alt={featuredSong.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <span className="material-symbols-outlined text-white text-6xl shadow-lg transform group-hover:scale-110 transition-transform">
                play_circle
              </span>
            </div>
          </div>

          {/* Song Details */}
          <div className="z-10 flex-1 text-white text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/30 uppercase tracking-wider">
                Featured Lesson
              </span>
              <span className="bg-[#ffdbcc] text-[#351000] px-3 py-1 rounded-full text-xs font-semibold">
                {featuredSong.level}
              </span>
            </div>

            <h3 className="font-headline text-3xl md:text-4xl font-extrabold mb-1">
              {featuredSong.title}
            </h3>
            <p className="text-[#dad7ff] font-medium text-base mb-6">
              {featuredSong.artist} • Lyrics & Pronunciation
            </p>

            <div className="w-full max-w-md mb-6">
              <div className="flex justify-between text-xs font-semibold mb-2 text-white/90">
                <span>Lesson Progress</span>
                <span>{featuredSong.progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.9)] transition-all duration-500"
                  style={{ width: `${featuredSong.progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onStartSinging(featuredSong)}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-[#3525cd] rounded-full font-headline font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-xl hover:bg-slate-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                mic
              </span>
              Start Singing
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Left Tasks & Right Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Tasks & Practices */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Practice Grid */}
          <section>
            <h4 className="font-headline text-xl font-bold text-[#1b1b24] mb-4">Quick Practice</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Practice Item 1: Karaoke */}
              <div
                onClick={() => onStartSinging(featuredSong)}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFE5F1] text-[#FF4D94] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">mic_external_on</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">Karaoke</span>
              </div>

              {/* Practice Item 2: Listening */}
              <div
                onClick={() => onOpenPracticeMode('listening')}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">hearing</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">Listening</span>
              </div>

              {/* Practice Item 3: Pronunciation */}
              <div
                onClick={() => onOpenPracticeMode('pronunciation')}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] text-[#22C55E] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">record_voice_over</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">Pronunciation</span>
              </div>

              {/* Practice Item 4: Lyrics */}
              <div
                onClick={() => onOpenPracticeMode('lyrics')}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">lyrics</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">Lyrics</span>
              </div>

              {/* Practice Item 5: AI Coach */}
              <div
                onClick={() => onOpenPracticeMode('ai_coach')}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#8B5CF6] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">smart_toy</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">AI Coach</span>
              </div>

              {/* Practice Item 6: Vocabulary */}
              <div
                onClick={() => onOpenPracticeMode('vocabulary')}
                className="group bg-[#f5f2ff] p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#3525cd]/5 border border-transparent hover:border-[#3525cd]/20 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-2xl">book</span>
                </div>
                <span className="font-semibold text-sm text-[#1b1b24]">Vocabulary</span>
              </div>
            </div>
          </section>

          {/* Daily Challenge Banner */}
          <section>
            <div className="relative bg-[#eae6f4] rounded-3xl p-6 md:p-8 overflow-hidden flex items-center justify-between border border-outline-variant/30 shadow-sm">
              <div className="absolute -right-8 top-0 w-40 h-40 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[160px] text-[#3525cd]">mic</span>
              </div>

              <div className="z-10 max-w-sm">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="bg-[#8a4cfc] text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    Daily Challenge
                  </span>
                  <span className="text-[#712ae2] font-semibold text-xs">+50 XP Bonus</span>
                </div>

                <h4 className="font-headline text-xl font-bold text-[#1b1b24] mb-1">
                  Sing today's song
                </h4>
                <p className="text-[#464555] text-sm mb-5 leading-snug">
                  Master the pronunciation of difficult words in "Believer" by Imagine Dragons.
                </p>

                <button
                  onClick={() => {
                    const believerSong = songs.find(s => s.id.includes('believer')) || songs[0];
                    onStartSinging(believerSong);
                  }}
                  className="bg-[#3525cd] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 shadow-md"
                >
                  Accept Challenge
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>

              <div className="hidden sm:block z-10 pr-4">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-xl animate-pulse">
                  <span className="material-symbols-outlined text-5xl text-[#3525cd]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mic
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Up Next Horizontal Scroll Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-headline text-xl font-bold text-[#1b1b24]">Up Next</h4>
              <button
                onClick={() => onSelectGenre('All')}
                className="text-[#3525cd] text-xs font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {upNextSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onStartSinging(song)}
                  className="min-w-[270px] bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/30 snap-start group cursor-pointer hover:shadow-md transition-all active:scale-98"
                >
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img
                      src={song.coverImage}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg text-white text-[10px] font-semibold">
                      {song.level}
                    </div>
                  </div>

                  <h5 className="font-headline font-bold text-[#1b1b24] text-base truncate">{song.title}</h5>
                  <p className="text-[#464555] text-xs mb-3 truncate">{song.artist}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300" />
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400" />
                    </div>
                    <span className="text-[11px] text-[#777587] font-medium">{song.practicedCount} practiced</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Stats & Explore */}
        <div className="space-y-8">
          {/* Explore Genres Chips */}
          <section className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-xs">
            <h4 className="font-headline text-lg font-bold text-[#1b1b24] mb-4">Explore Genres</h4>
            <div className="flex flex-wrap gap-2">
              {GENRES_LIST.map((genre) => {
                const isSelected = selectedGenreChip === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => {
                      setSelectedGenreChip(genre);
                      onSelectGenre(genre);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#3525cd]/10 border border-[#3525cd]/30 text-[#3525cd] shadow-xs font-bold'
                        : 'border border-[#c7c4d8] text-[#464555] hover:bg-[#f5f2ff]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Your Progress */}
          <section className="space-y-4">
            <h4 className="font-headline text-lg font-bold text-[#1b1b24]">Your Progress</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#c7c4d8]/20">
                <p className="text-[10px] text-[#464555] uppercase font-extrabold tracking-wider mb-0.5">Weekly XP</p>
                <p className="text-2xl font-bold font-headline text-[#3525cd]">{userStats.weeklyXp.toLocaleString()}</p>
              </div>

              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#c7c4d8]/20">
                <p className="text-[10px] text-[#464555] uppercase font-extrabold tracking-wider mb-0.5">New Words</p>
                <p className="text-2xl font-bold font-headline text-[#712ae2]">{userStats.newWords}</p>
              </div>

              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#c7c4d8]/20">
                <p className="text-[10px] text-[#464555] uppercase font-extrabold tracking-wider mb-0.5">Songs Done</p>
                <p className="text-2xl font-bold font-headline text-[#7e3000]">{userStats.songsDone}</p>
              </div>

              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#c7c4d8]/20">
                <p className="text-[10px] text-[#464555] uppercase font-extrabold tracking-wider mb-0.5">Pronunciation</p>
                <p className="text-2xl font-bold font-headline text-[#22C55E]">{userStats.pronunciationPercent}%</p>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-xs">
              <h5 className="font-semibold text-xs text-[#1b1b24] mb-4">Achievement Badges</h5>
              <div className="flex justify-around items-center">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`achievement-badge flex flex-col items-center gap-1.5 cursor-pointer ${
                      badge.unlocked ? '' : 'opacity-40 grayscale'
                    }`}
                    title={`${badge.name}: ${badge.description}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-tr ${badge.colorGradient} flex items-center justify-center shadow-md`}
                    >
                      <span
                        className="material-symbols-outlined text-white text-2xl"
                        style={{ fontVariationSettings: badge.unlocked ? "'FILL' 1" : undefined }}
                      >
                        {badge.icon}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#464555]">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Daily Streak Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7e3000] to-[#ff8c42] text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-xs text-white/80 font-medium">Current Streak</p>
                <p className="text-2xl font-bold font-headline">{userStats.streakDays} Days!</p>
              </div>
            </div>

            <div className="mt-4 flex gap-1.5 h-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className={`flex-1 rounded-full ${day <= 4 ? 'bg-white' : 'bg-white/30'}`}
                />
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-center text-white/80">3 more days to hit your weekly goal!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
