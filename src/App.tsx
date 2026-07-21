import React, { useState } from 'react';
import { NavTab, Song, PracticeMode, WordAnnotation, UserStats } from './types';
import { SONGS_DATA, INITIAL_USER_STATS, BADGES_DATA } from './data/songs';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { NowPlaying } from './components/NowPlaying';
import { DiscoverView } from './components/DiscoverView';
import { PracticeHub } from './components/PracticeHub';
import { CommunityView } from './components/CommunityView';
import { ProfileView } from './components/ProfileView';
import { WordDetailsModal } from './components/WordDetailsModal';
import { ProModal } from './components/ProModal';
import { AICoachModal } from './components/AICoachModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [songsList, setSongsList] = useState<Song[]>(SONGS_DATA);
  const [activeSong, setActiveSong] = useState<Song>(SONGS_DATA[0]); // Flowers
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [practiceHubMode, setPracticeHubMode] = useState<PracticeMode>('listening');

  // Modals state
  const [selectedWord, setSelectedWord] = useState<WordAnnotation | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isAICoachOpen, setIsAICoachOpen] = useState<boolean>(false);
  const [aiCoachSongTitle, setAICoachSongTitle] = useState<string>('Flowers');

  const handleStartKaraoke = (song: Song) => {
    setActiveSong(song);
    setCurrentTab('now_playing');
  };

  const handleLoadCustomSong = (song: Song) => {
    setSongsList((prev) => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [song, ...prev];
    });
    handleStartKaraoke(song);
  };

  const handleOpenPracticeMode = (mode: PracticeMode, song?: Song) => {
    if (song) setActiveSong(song);
    if (mode === 'karaoke') {
      handleStartKaraoke(song || activeSong);
      return;
    }
    if (mode === 'ai_coach') {
      setAICoachSongTitle((song || activeSong).title);
      setIsAICoachOpen(true);
      return;
    }
    setPracticeHubMode(mode);
    setCurrentTab('practice');
  };

  const handleNextSong = () => {
    const currentIndex = songsList.findIndex((s) => s.id === activeSong.id);
    const nextIndex = (currentIndex + 1) % songsList.length;
    setActiveSong(songsList[nextIndex]);
  };

  const handlePrevSong = () => {
    const currentIndex = songsList.findIndex((s) => s.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + songsList.length) % songsList.length;
    setActiveSong(songsList[prevIndex]);
  };

  // If Now Playing / Karaoke mode is selected, render full-screen view
  if (currentTab === 'now_playing') {
    return (
      <>
        <NowPlaying
          song={activeSong}
          onBack={() => setCurrentTab('home')}
          onSelectWord={(word) => setSelectedWord(word)}
          onNextSong={handleNextSong}
          onPrevSong={handlePrevSong}
        />
        <WordDetailsModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] text-[#1b1b24] font-body flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenProModal={() => setIsProModalOpen(true)}
      />

      {/* Main Screen Content Canvas */}
      <div className="flex-1 md:ml-64 min-h-screen p-6 md:p-10 transition-all">
        {/* Header */}
        <Header
          userStats={userStats}
          songs={songsList}
          onSelectSong={(song) => handleStartKaraoke(song)}
          onOpenProfile={() => setCurrentTab('profile')}
        />

        {/* Dynamic View Tab Rendering */}
        {currentTab === 'home' && (
          <Dashboard
            songs={songsList}
            featuredSong={songsList[0]}
            userStats={userStats}
            badges={BADGES_DATA}
            onStartSinging={(song) => handleStartKaraoke(song)}
            onOpenPracticeMode={handleOpenPracticeMode}
            onSelectGenre={(genre) => {
              setSelectedGenreFilter(genre);
              setCurrentTab('discover');
            }}
            onLoadCustomSong={handleLoadCustomSong}
          />
        )}

        {currentTab === 'discover' && (
          <DiscoverView
            songs={songsList}
            initialGenre={selectedGenreFilter}
            onSelectSong={(song) => handleStartKaraoke(song)}
          />
        )}

        {currentTab === 'practice' && (
          <PracticeHub
            songs={songsList}
            initialMode={practiceHubMode}
            onStartKaraoke={(song) => handleStartKaraoke(song)}
            onOpenAICoach={(title) => {
              setAICoachSongTitle(title || activeSong.title);
              setIsAICoachOpen(true);
            }}
            onSelectWord={(word) => setSelectedWord(word)}
          />
        )}

        {currentTab === 'community' && <CommunityView />}

        {currentTab === 'profile' && (
          <ProfileView
            userStats={userStats}
            badges={BADGES_DATA}
            onOpenProModal={() => setIsProModalOpen(true)}
          />
        )}
      </div>

      {/* Modals & Overlay Drawers */}
      <WordDetailsModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />
      <AICoachModal
        isOpen={isAICoachOpen}
        songTitle={aiCoachSongTitle}
        onClose={() => setIsAICoachOpen(false)}
      />
    </div>
  );
}
