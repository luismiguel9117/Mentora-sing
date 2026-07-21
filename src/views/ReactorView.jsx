// src/views/ReactorView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Award, Heart, Music, Sparkles, Volume2, Search, 
  ArrowLeft, ArrowRight, RotateCcw, Flame, Bell, User, CheckCircle2, 
  ChevronRight, BookOpen, Headphones, Mic, Compass, Users, Check, AlertCircle
} from 'lucide-react';
import { sounds } from '../components/SoundManager';
import Confetti from '../components/Confetti';
import '../styles/game.css';

// Curated Video Lessons Database
const defaultVideoCatalog = [
  {
    id: '2Vv-BfVoq4g',
    type: 'youtube',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    difficulty: 'B1 Intermediate',
    difficultyKey: 'B1',
    category: 'Pop Hits',
    duration: '4:40 min',
    color: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    emoji: '🎵',
    thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
    xp: 150,
    progress: 75,
    practicedCount: '2.5k'
  },
  {
    id: 'wXTJBr9mc8A',
    type: 'youtube',
    title: 'Yesterday',
    artist: 'The Beatles',
    difficulty: 'A2 Elementary',
    difficultyKey: 'A2',
    category: 'Classic Rock',
    duration: '2:05 min',
    color: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
    emoji: '🎸',
    thumbnail: 'https://img.youtube.com/vi/wXTJBr9mc8A/hqdefault.jpg',
    xp: 100,
    progress: 40,
    practicedCount: '1.2k'
  },
  {
    id: 'L0MK7qz13bU',
    type: 'youtube',
    title: 'Let It Go',
    artist: 'Idina Menzel',
    difficulty: 'A1 Beginner',
    difficultyKey: 'A1',
    category: 'Disney Classics',
    duration: '3:45 min',
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    emoji: '❄️',
    thumbnail: 'https://img.youtube.com/vi/L0MK7qz13bU/hqdefault.jpg',
    xp: 120,
    progress: 90,
    practicedCount: '980'
  },
  {
    id: 'hT_nvWreIhg',
    type: 'youtube',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    difficulty: 'B2 Upper Int',
    difficultyKey: 'B2',
    category: 'Pop Hits',
    duration: '4:17 min',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    emoji: '⭐',
    thumbnail: 'https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg',
    xp: 180,
    progress: 10,
    practicedCount: '1.8k'
  }
];

// High fidelity lyrics presets to guarantee a working game out of the box
const songSubtitlesPresets = {
  '2Vv-BfVoq4g': [
    { id: 1, start: 3.0, end: 9.0, en: "I found a love for me" },
    { id: 2, start: 9.5, end: 15.5, en: "Darling, just dive right in and follow my lead" },
    { id: 3, start: 16.0, end: 22.0, en: "Well, I found a girl, beautiful and sweet" },
    { id: 4, start: 22.5, end: 30.0, en: "I never knew you were the someone waiting for me" },
    { id: 5, start: 30.5, end: 37.0, en: "'Cause we were just kids when we fell in love" },
    { id: 6, start: 37.5, end: 43.0, en: "Not knowing what it was" },
    { id: 7, start: 43.5, end: 49.0, en: "I will not give you up this time" },
    { id: 8, start: 49.5, end: 56.5, en: "But darling, just kiss me slow" },
    { id: 9, start: 57.0, end: 63.0, en: "Your heart is all I own" },
    { id: 10, start: 63.5, end: 71.0, en: "And in your eyes, you're holding mine" }
  ],
  'wXTJBr9mc8A': [
    { id: 1, start: 2.0, end: 8.0, en: "Yesterday, all my troubles seemed so far away" },
    { id: 2, start: 8.5, end: 14.5, en: "Now it looks as though they're here to stay" },
    { id: 3, start: 15.0, end: 19.5, en: "Oh, I believe in yesterday" },
    { id: 4, start: 20.0, end: 26.5, en: "Suddenly, I'm not half the man I used to be" },
    { id: 5, start: 27.0, end: 32.0, en: "There's a shadow hanging over me" },
    { id: 6, start: 32.5, end: 38.0, en: "Oh, yesterday came suddenly" },
    { id: 7, start: 38.5, end: 45.0, en: "Why she had to go, I don't know, she wouldn't say" },
    { id: 8, start: 45.5, end: 52.0, en: "I said something wrong, now I long for yesterday" }
  ],
  'L0MK7qz13bU': [
    { id: 1, start: 12.0, end: 18.0, en: "The snow glows white on the mountain tonight" },
    { id: 2, start: 18.5, end: 23.0, en: "Not a footprint to be seen" },
    { id: 3, start: 23.5, end: 30.0, en: "A kingdom of isolation, and it looks like I'm the queen" },
    { id: 4, start: 30.5, end: 37.0, en: "The wind is howling like this swirling storm inside" },
    { id: 5, start: 37.5, end: 43.5, en: "Couldn't keep it in, heaven knows I've tried" },
    { id: 6, start: 44.0, end: 50.0, en: "Don't let them in, don't let them see" },
    { id: 7, start: 50.5, end: 56.0, en: "Be the good girl you always have to be" },
    { id: 8, start: 56.5, end: 63.0, en: "Conceal, don't feel, don't let them know" },
    { id: 9, start: 63.5, end: 70.0, en: "Well, now they know! Let it go, let it go" }
  ],
  'hT_nvWreIhg': [
    { id: 1, start: 9.0, end: 14.5, en: "I've been losing sleep, dreaming about the things that we could be" },
    { id: 2, start: 15.0, end: 19.5, en: "But baby, I've been praying hard" },
    { id: 3, start: 20.0, end: 24.5, en: "Said no more counting dollars, we'll be counting stars" },
    { id: 4, start: 25.0, end: 30.0, en: "Yeah, we'll be counting stars" },
    { id: 5, start: 31.0, end: 36.5, en: "I see this life like a swinging vine, swing my heart across the line" },
    { id: 6, start: 37.0, end: 41.5, en: "In my face is flashing signs, seek it out and ye shall find" }
  ]
};

export default function ReactorView() {
  const { videoId: routeVideoId } = useParams();
  const navigate = useNavigate();

  // App Mode: 'dashboard' | 'game'
  const [appMode, setAppMode] = useState('dashboard');
  const [selectedSong, setSelectedSong] = useState(null);

  // YouTube Link Parser Input
  const [ytLink, setYtLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenreFilter, setActiveGenreFilter] = useState('Todos');

  // Stats
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('mentora_sing_stats');
    return saved ? JSON.parse(saved) : { xp: 1420, hearts: 5, streak: 12, level: 'Intermedio B1', completedCount: 32, accuracy: 92 };
  });

  // Game States
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [gameSubtitles, setGameSubtitles] = useState([]);
  const [totalGaps, setTotalGaps] = useState(0);
  const [remainingGaps, setRemainingGaps] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Focus Tracker
  const [activeCueId, setActiveCueId] = useState(null);

  const playerRef = useRef(null);
  const scrollerRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const activeLineRef = useRef(null);

  // Parse Subtitles into game tokens with gaps
  const initializeGame = (subs) => {
    if (!subs || subs.length === 0) return;

    let gapCount = 0;
    const parsed = subs.map((cue, lineIdx) => {
      const words = cue.en.split(/(\s+)/);
      
      const tokens = words.map((word, wordIdx) => {
        const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().toLowerCase();
        const isActualWord = clean.length > 0;
        
        // Gap formula
        const isGap = isActualWord && clean.length > 2 && ((lineIdx * 3 + wordIdx) % 4 === 1);
        
        if (isGap) gapCount++;

        return {
          id: `${cue.id}-${wordIdx}`,
          text: word,
          cleanWord: clean,
          isGap,
          isCorrect: false,
          userInput: ''
        };
      });

      return {
        ...cue,
        tokens
      };
    });

    setGameSubtitles(parsed);
    setTotalGaps(gapCount);
    setRemainingGaps(gapCount);
    setScore(0);
    setHearts(5);
    setCorrectStreak(0);
    setBonusMultiplier(1);
    setGameCompleted(false);
    setIsGameOver(false);
    setCurrentTime(0);
  };

  // Select a song and start game
  const handleStartSinging = (song) => {
    sounds.playIntro();
    setSelectedSong(song);
    
    // Load subtitles: try preset first, then fallback
    const preset = songSubtitlesPresets[song.id];
    if (preset) {
      initializeGame(preset);
      setAppMode('game');
    } else {
      setIsGenerating(true);
      fetchSubtitlesFromApi(song.id);
    }
  };

  const fetchSubtitlesFromApi = async (videoId) => {
    try {
      const res = await fetch('/api/generate-youtube-subs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subtitles && data.subtitles.length > 0) {
          initializeGame(data.subtitles);
          setAppMode('game');
        } else {
          alert("No pudimos extraer subtítulos en inglés para este video. Cargando subtítulos por defecto.");
          initializeGame(songSubtitlesPresets['2Vv-BfVoq4g']);
          setAppMode('game');
        }
      } else {
        throw new Error();
      }
    } catch {
      alert("Error de conexión. Iniciando con canción demo.");
      initializeGame(songSubtitlesPresets['2Vv-BfVoq4g']);
      setAppMode('game');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync routeVideoId with song selection
  useEffect(() => {
    if (routeVideoId) {
      const song = defaultVideoCatalog.find(v => v.id === routeVideoId) || {
        id: routeVideoId,
        type: 'youtube',
        title: 'Canción Seleccionada',
        artist: 'Artista',
        difficulty: 'B1 Intermediate',
        difficultyKey: 'B1',
        category: 'Pop Hits',
        duration: '3:00 min',
        color: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        emoji: '🎵',
        thumbnail: `https://img.youtube.com/vi/${routeVideoId}/hqdefault.jpg`,
        xp: 120,
        practicedCount: '1.5k'
      };
      setSelectedSong(song);
      const preset = songSubtitlesPresets[song.id];
      if (preset) {
        initializeGame(preset);
        setAppMode('game');
      } else {
        setIsGenerating(true);
        fetchSubtitlesFromApi(song.id);
      }
    } else {
      setAppMode('dashboard');
      setSelectedSong(null);
    }
  }, [routeVideoId]);

  // Handle Pasting custom YouTube links
  const handleLoadCustomYt = async (e) => {
    e.preventDefault();
    if (!ytLink) return;

    // Extract YouTube ID
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
        body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (data.success && data.subtitles && data.subtitles.length > 0) {
        const customSong = {
          id: videoId,
          type: 'youtube',
          title: 'Canción Personalizada',
          artist: 'Artista YouTube',
          difficulty: 'B1 Intermediate',
          difficultyKey: 'B1',
          category: 'Cargadas',
          duration: '3:00 min',
          color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          emoji: '🎵',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          xp: 150,
          practicedCount: '1'
        };
        setSelectedSong(customSong);
        initializeGame(data.subtitles);
        setAppMode('game');
      } else {
        alert("No se pudieron generar los subtítulos. Intenta con otro video o asegúrate de que tenga subtítulos en inglés en YouTube.");
      }
    } catch (err) {
      alert("Error al conectar con la API de subtítulos.");
    } finally {
      setIsGenerating(false);
    }
  };

  // YouTube Iframe SDK Initializer
  useEffect(() => {
    if (appMode !== 'game' || !selectedSong) return;

    let tag = document.getElementById('youtube-iframe-api');
    if (!tag) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 100);

    function initPlayer() {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player('game-yt-iframe', {
        videoId: selectedSong.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          disablejsapi: 1,
          cc_load_policy: 3,
          iv_load_policy: 3
        },
        events: {
          'onReady': (event) => {
            const dur = event.target.getDuration();
            if (dur > 0) setVideoDuration(dur);
            setIsPlaying(true);
          },
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          }
        }
      });
    }

    return () => {
      clearInterval(checkYT);
      if (playerRef.current) {
        playerRef.current = null;
      }
    };
  }, [appMode, selectedSong]);

  // Track playback time
  useEffect(() => {
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      timeIntervalRef.current = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        
        const activeLine = gameSubtitles.find(cue => time >= cue.start && time <= cue.end);
        if (activeLine && activeLine.id !== activeCueId) {
          setActiveCueId(activeLine.id);
        }

        if (time >= videoDuration - 1 && videoDuration > 10) {
          handleGameWin();
        }
      }, 100);
    } else {
      clearInterval(timeIntervalRef.current);
    }

    return () => clearInterval(timeIntervalRef.current);
  }, [isPlaying, gameSubtitles, activeCueId, videoDuration]);

  // Auto Scroll to active lyric line
  useEffect(() => {
    if (activeCueId && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeCueId]);

  // Handle Input Typings in game
  const handleInputChange = (lineId, tokenId, e) => {
    const val = e.target.value;
    
    const updated = gameSubtitles.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          tokens: line.tokens.map(tok => {
            if (tok.id === tokenId) {
              const matches = val.trim().toLowerCase() === tok.cleanWord;
              
              if (matches && !tok.isCorrect) {
                sounds.playCorrect();
                setScore(prev => prev + 10 * bonusMultiplier);
                setCorrectStreak(prev => {
                  const newStreak = prev + 1;
                  if (newStreak % 5 === 0) {
                    setBonusMultiplier(m => Math.min(m + 1, 4));
                  }
                  return newStreak;
                });
                setRemainingGaps(r => {
                  const newR = r - 1;
                  if (newR <= 0) {
                    setTimeout(() => handleGameWin(), 600);
                  }
                  return newR;
                });

                setTimeout(() => {
                  const inputs = Array.from(document.querySelectorAll('.lyric-gap-input'));
                  const currentIndex = inputs.findIndex(el => el.id === `input-${tokenId}`);
                  if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
                    inputs[currentIndex + 1].focus();
                  }
                }, 50);

                return { ...tok, userInput: val, isCorrect: true };
              }

              return { ...tok, userInput: val };
            }
            return tok;
          })
        };
      }
      return line;
    });

    setGameSubtitles(updated);
  };

  // Checking wrong inputs on Blur or Enter key
  const handleInputKeyDown = (lineId, tokenId, e) => {
    if (e.key === 'Enter') {
      const token = gameSubtitles.find(l => l.id === lineId).tokens.find(t => t.id === tokenId);
      if (token && !token.isCorrect) {
        sounds.playIncorrect();
        setCorrectStreak(0);
        setBonusMultiplier(1);
        setHearts(h => {
          const newH = h - 1;
          if (newH <= 0) {
            handleGameOver();
          }
          return newH;
        });

        const inputEl = document.getElementById(`input-${tokenId}`);
        if (inputEl) {
          inputEl.classList.add('wrong');
          setTimeout(() => inputEl.classList.remove('wrong'), 500);
        }
      }
    }
  };

  const handleGameWin = () => {
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    sounds.playCompleted();
    setGameCompleted(true);

    const newStats = {
      ...userStats,
      xp: userStats.xp + selectedSong.xp,
      completedCount: userStats.completedCount + 1,
      streak: userStats.streak + 1
    };
    setUserStats(newStats);
    localStorage.setItem('mentora_sing_stats', JSON.stringify(newStats));
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    sounds.playIncorrect();
    setIsGameOver(true);
  };

  const handleSeek = (direction) => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return;
    const current = playerRef.current.getCurrentTime();
    const newTime = direction === 'forward' ? Math.min(current + 5, videoDuration) : Math.max(current - 5, 0);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed) => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    }
  };

  // Filter song list based on search and genre filters
  const filteredSongs = defaultVideoCatalog.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeGenreFilter === 'Todos' || song.category === activeGenreFilter;
    return matchesSearch && matchesGenre;
  });

  const featuredSong = defaultVideoCatalog[0];

  return (
    <div className="bg-[#fcf8ff] min-h-screen text-[#1b1b24] font-body-md">
      
      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. DASHBOARD VIEW (Stitch Layout Adaptive)             */}
      {/* ──────────────────────────────────────────────────────── */}
      {appMode === 'dashboard' && (
        <div className="flex">
          
          {/* Desktop Sidebar Navigation */}
          <aside className="fixed left-0 top-0 h-screen w-64 bg-white flex flex-col items-center py-8 hidden md:flex border-r border-[#e4e1ee]/40 z-50">
            <div className="mb-8 px-6 w-full flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#712ae2] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-100">
                M
              </div>
              <div>
                <h1 className="font-headline-md text-xl font-black text-[#4f46e5] tracking-tight leading-none">Mentora</h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Singing & Karaoke</span>
              </div>
            </div>
            
            <nav className="flex-1 w-full px-4 space-y-2">
              <button onClick={() => setAppMode('dashboard')} className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl bg-[#4f46e5] text-white transition-all duration-200">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                <span className="font-semibold text-sm">Inicio</span>
              </button>
              <button className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-[#f0ecf9] transition-all duration-200">
                <span className="material-symbols-outlined">explore</span>
                <span className="font-semibold text-sm">Explorar</span>
              </button>
              <button className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-[#f0ecf9] transition-all duration-200">
                <span className="material-symbols-outlined">mic_external_on</span>
                <span className="font-semibold text-sm">Practicar</span>
              </button>
              <button className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-[#f0ecf9] transition-all duration-200">
                <span className="material-symbols-outlined">group</span>
                <span className="font-semibold text-sm">Comunidad</span>
              </button>
              <button className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl text-slate-500 hover:bg-[#f0ecf9] transition-all duration-200">
                <span className="material-symbols-outlined">person</span>
                <span className="font-semibold text-sm">Perfil</span>
              </button>
            </nav>
            
            <div className="px-6 w-full">
              <div className="p-4 rounded-2xl bg-[#712ae2]/10 border border-[#712ae2]/20">
                <p className="font-bold text-xs text-[#712ae2] mb-1">Upgrade a Pro</p>
                <p className="text-[10px] text-slate-500 mb-3 leading-tight">Desbloquea entrenador de canto con IA y análisis de letras completo.</p>
                <button className="w-full py-2 bg-[#712ae2] text-white rounded-full font-bold text-[11px] hover:opacity-90 transition-opacity">Ir a Premium</button>
              </div>
            </div>
          </aside>

          {/* Main Content Canvas */}
          <main className="md:ml-64 min-h-screen p-6 md:p-10 flex-grow">
            
            {/* Top Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">¡Hola, Alex!</h2>
                <p className="text-slate-500 font-medium text-sm">¿Listo para cantar y afinar tu oído hoy?</p>
              </div>
              <div className="flex items-center gap-6 justify-between md:justify-end">
                {/* Search Bar */}
                <div className="relative hidden lg:block">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                  <input 
                    className="pl-12 pr-6 py-2.5 bg-[#f5f2ff] border-none rounded-full w-80 focus:ring-2 focus:ring-[#4f46e5]/20 text-sm font-medium transition-all" 
                    placeholder="Buscar canciones o géneros..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Stats & Icons */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-[#7e3000]/10 px-4 py-2 rounded-full border border-[#7e3000]/20">
                    <span className="material-symbols-outlined text-[#7e3000]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span className="font-bold text-sm text-[#7e3000]">{userStats.streak} días</span>
                  </div>
                  <button className="p-2 text-slate-500 hover:bg-[#eae6f4] rounded-full transition relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
                  </button>
                  <div className="w-10 h-10 rounded-full border-2 border-[#4f46e5]/20 p-0.5 overflow-hidden">
                    <img className="w-full h-full object-cover rounded-full" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar" />
                  </div>
                </div>
              </div>
            </header>

            {/* Custom Song Subtitle Loader card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-emerald-950 font-sans text-lg">¿Quieres cantar otra canción de YouTube?</h2>
                  <p className="text-sm text-emerald-700 font-medium">Introduce cualquier enlace o ID de YouTube y generaremos la pista interactiva en segundos.</p>
                </div>
              </div>
              <form onSubmit={handleLoadCustomYt} className="flex gap-2 w-full md:w-auto max-w-md">
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

            {/* Featured Lesson Hero Card */}
            <section className="mb-8">
              <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#8a4cfc] to-[#712ae2] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none"></div>
                {/* Album Cover */}
                <div className="relative w-48 h-48 md:w-60 md:h-60 flex-shrink-0 z-10 shadow-2xl rounded-2xl overflow-hidden border-4 border-white/20">
                  <img className="w-full h-full object-cover" src={featuredSong.thumbnail} alt={featuredSong.title} />
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-6xl">play_circle</span>
                  </div>
                </div>
                {/* Details */}
                <div className="z-10 flex-grow text-white w-full">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/30 uppercase tracking-widest">Lección Destacada</span>
                    <span className="bg-[#ffdbcc] text-[#351000] px-3 py-1 rounded-full text-[10px] font-bold">{featuredSong.difficulty}</span>
                  </div>
                  <h3 className="text-4xl font-extrabold font-sans mb-1">{featuredSong.title}</h3>
                  <p className="text-indigo-100 text-lg font-medium mb-6">{featuredSong.artist} • Comprensión y Pronunciación</p>
                  
                  <div className="w-full max-w-md mb-8">
                    <div className="flex justify-between mb-2 text-xs font-semibold text-indigo-100">
                      <span>Progreso de Letras</span>
                      <span>{featuredSong.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ width: `${featuredSong.progress}%` }}></div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleStartSinging(featuredSong)}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-[#4f46e5] font-extrabold rounded-full hover:scale-105 transition-transform shadow-lg text-sm"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                    Cantar Ahora
                  </button>
                </div>
              </div>
            </section>

            {/* Split layout: main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left column (2/3) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Quick Practice grid */}
                <section>
                  <h4 className="text-lg font-extrabold text-slate-800 font-sans mb-4">Práctica Rápida</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: "mic_external_on", name: "Karaoke", bg: "bg-[#FFE5F1]", color: "text-[#FF4D94]" },
                      { icon: "hearing", name: "Escuchar", bg: "bg-[#E0F2FE]", color: "text-[#0EA5E9]" },
                      { icon: "record_voice_over", name: "Pronunciación", bg: "bg-[#F0FDF4]", color: "text-[#22C55E]" },
                      { icon: "lyrics", name: "Completar Letras", bg: "bg-[#FFF7ED]", color: "text-[#F97316]" },
                      { icon: "smart_toy", name: "AI Coach", bg: "bg-[#EDE9FE]", color: "text-[#8B5CF6]" },
                      { icon: "book", name: "Vocabulario", bg: "bg-[#FEF2F2]", color: "text-[#EF4444]" }
                    ].map((item, idx) => (
                      <div key={idx} className="group bg-white p-5 rounded-2xl flex flex-col items-center gap-3 cursor-pointer hover:bg-[#4f46e5]/5 border border-slate-100 hover:border-[#4f46e5]/10 shadow-sm transition">
                        <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                        <span className="font-bold text-xs text-slate-700">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Daily Challenge Banner */}
                <section>
                  <div className="relative bg-[#eae6f4] rounded-[24px] p-8 overflow-hidden flex items-center justify-between shadow-sm">
                    <div className="absolute -right-10 top-0 w-40 h-40 opacity-10 pointer-events-none">
                      <span className="material-symbols-outlined text-[160px] text-[#4f46e5]">mic</span>
                    </div>
                    <div className="z-10 max-w-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#8a4cfc] text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider">Desafío Diario</span>
                        <span className="text-[#8a4cfc] font-bold text-xs">+50 XP Bonus</span>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 font-sans mb-1">Canta la canción de hoy</h4>
                      <p className="text-slate-600 text-xs leading-relaxed mb-6">Domina la pronunciación y completa las palabras difíciles de "Yesterday" de The Beatles.</p>
                      <button 
                        onClick={() => handleStartSinging(defaultVideoCatalog[1])}
                        className="bg-[#4f46e5] text-white px-6 py-3 rounded-full font-bold text-xs hover:opacity-90 transition flex items-center gap-2 shadow-md shadow-indigo-100"
                      >
                        Aceptar Desafío
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>
                    <div className="hidden md:block z-10">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg animate-pulse">
                        <span className="material-symbols-outlined text-4xl text-[#4f46e5]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Up Next horizontal scroll */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-extrabold text-slate-800 font-sans">Siguientes Canciones</h4>
                    <button className="text-[#4f46e5] text-xs font-bold hover:underline">Ver todas</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                    {filteredSongs.map((song) => (
                      <div 
                        key={song.id} 
                        onClick={() => handleStartSinging(song)}
                        className="min-w-[260px] max-w-[260px] bg-white rounded-[24px] p-4 shadow-sm border border-[#e4e1ee]/40 group cursor-pointer hover:shadow-md transition"
                      >
                        <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={song.thumbnail} alt={song.title} />
                          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[9px] font-bold">
                            {song.difficulty}
                          </div>
                        </div>
                        <h5 className="font-extrabold text-slate-850 text-sm font-sans truncate">{song.title}</h5>
                        <p className="text-slate-500 text-xs mb-3">{song.artist}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-bold">{song.practicedCount} cantaron</span>
                          <span className="bg-[#4f46e5]/10 text-[#4f46e5] font-extrabold text-[9px] px-2 py-0.5 rounded-md">+{song.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Right column (1/3) */}
              <div className="space-y-8">
                
                {/* Explore Genres */}
                <section className="bg-white p-6 rounded-[24px] border border-[#e4e1ee]/40 shadow-sm">
                  <h4 className="font-headline-md text-slate-850 font-bold text-sm mb-4">Filtro por Género</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Todos', 'Pop Hits', 'Disney Classics', 'Classic Rock'].map((genre) => (
                      <button 
                        key={genre} 
                        onClick={() => setActiveGenreFilter(genre)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                          activeGenreFilter === genre 
                            ? 'bg-[#4f46e5]/10 border-[#4f46e5] text-[#4f46e5]' 
                            : 'border-[#e4e1ee] text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Progress Stats */}
                <section className="space-y-4">
                  <h4 className="font-headline-md text-slate-850 font-bold text-sm">Tu Progreso</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#4f46e5]/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">XP Semanal</p>
                      <p className="text-2xl font-extrabold text-[#4f46e5]">{userStats.xp}</p>
                    </div>
                    <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#4f46e5]/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Nuevas Palabras</p>
                      <p className="text-2xl font-extrabold text-[#712ae2]">84</p>
                    </div>
                    <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#4f46e5]/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Canciones Completadas</p>
                      <p className="text-2xl font-extrabold text-[#7e3000]">{userStats.completedCount}</p>
                    </div>
                    <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#4f46e5]/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-1">Pronunciación</p>
                      <p className="text-2xl font-extrabold text-[#22C55E]">{userStats.accuracy}%</p>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="bg-white p-6 rounded-[24px] border border-[#e4e1ee]/40 shadow-sm">
                    <h5 className="font-bold text-slate-800 text-xs mb-4">Insignias Obtenidas</h5>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">Superstar</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">Afinación</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-400 to-pink-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500">Leyenda</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 opacity-30 grayscale">
                        <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                          <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">Bloqueado</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Daily Streak Mini Card */}
                <div className="p-6 rounded-[24px] bg-gradient-to-r from-[#7e3000] to-[#ff8c42] text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    </div>
                    <div>
                      <p className="text-xs opacity-80">Racha Actual</p>
                      <p className="text-2xl font-black">{userStats.streak} Días!</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-1 h-1.5">
                    <div className="flex-1 bg-white rounded-full"></div>
                    <div className="flex-1 bg-white rounded-full"></div>
                    <div className="flex-1 bg-white rounded-full"></div>
                    <div className="flex-1 bg-white/30 rounded-full"></div>
                    <div className="flex-1 bg-white/30 rounded-full"></div>
                    <div className="flex-1 bg-white/30 rounded-full"></div>
                    <div className="flex-1 bg-white/30 rounded-full"></div>
                  </div>
                  <p className="mt-2 text-[10px] text-center opacity-80 font-medium">¡Sigue cantando 3 días más para asegurar tu racha semanal!</p>
                </div>

              </div>

            </div>

          </main>

          {/* Mobile Bottom Navigation Bar */}
          <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white/90 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.06)] rounded-t-2xl border-t border-slate-100">
            <button onClick={() => setAppMode('dashboard')} className="flex flex-col items-center justify-center text-[#4f46e5] px-4 py-1">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              <span className="text-[10px] font-bold">Inicio</span>
            </button>
            <button className="flex flex-col items-center justify-center text-slate-400 px-4 py-1">
              <span className="material-symbols-outlined">explore</span>
              <span className="text-[10px] font-bold">Explorar</span>
            </button>
            <button className="flex flex-col items-center justify-center text-slate-400 px-4 py-1">
              <span className="material-symbols-outlined">mic_external_on</span>
              <span className="text-[10px] font-bold">Practicar</span>
            </button>
            <button className="flex flex-col items-center justify-center text-slate-400 px-4 py-1">
              <span className="material-symbols-outlined">group</span>
              <span className="text-[10px] font-bold">Comunidad</span>
            </button>
            <button className="flex flex-col items-center justify-center text-slate-400 px-4 py-1">
              <span className="material-symbols-outlined">person</span>
              <span className="text-[10px] font-bold">Perfil</span>
            </button>
          </nav>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. GAMEPLAY VIEW                                        */}
      {/* ──────────────────────────────────────────────────────── */}
      {appMode === 'game' && selectedSong && (
        <div className="game-container relative">
          {gameCompleted && <Confetti />}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="game-results-overlay">
              <div className="results-card">
                <AlertCircle className="w-16 h-16 text-rose-500" />
                <h3 className="results-title">¡Oh, no! Te has quedado sin vidas</h3>
                <p className="results-subtitle">El ritmo era rápido, ¡pero no te rindas! La práctica hace al maestro.</p>
                <div className="results-stats-grid">
                  <div className="results-stat-box">
                    <span className="stat-label">Puntaje</span>
                    <span className="stat-value">{score}</span>
                  </div>
                  <div className="results-stat-box">
                    <span className="stat-label">Restantes</span>
                    <span className="stat-value">{remainingGaps}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartSinging(selectedSong)}
                  className="primary-btn flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Reintentar canción
                </button>
                <button 
                  onClick={() => setAppMode('dashboard')}
                  className="secondary-btn"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}

          {/* Game Win Screen */}
          {gameCompleted && (
            <div className="game-results-overlay">
              <div className="results-card">
                <Award className="w-16 h-16 text-amber-500" />
                <h3 className="results-title">¡Increíble actuación!</h3>
                <p className="results-subtitle">Has completado la canción satisfactoriamente.</p>
                <div className="results-stats-grid">
                  <div className="results-stat-box">
                    <span className="stat-label">Puntaje</span>
                    <span className="stat-value">{score} pts</span>
                  </div>
                  <div className="results-stat-box">
                    <span className="stat-label">Experiencia</span>
                    <span className="stat-value">+{selectedSong.xp} XP</span>
                  </div>
                </div>
                <button 
                  onClick={() => setAppMode('dashboard')}
                  className="primary-btn"
                >
                  Aceptar y salir
                </button>
                <button 
                  onClick={() => handleStartSinging(selectedSong)}
                  className="secondary-btn flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Cantar de nuevo
                </button>
              </div>
            </div>
          )}

          {/* Header Bar */}
          <div className="game-header-bar">
            
            {/* Left: Exit & Score */}
            <div className="game-header-left">
              <button 
                onClick={() => setAppMode('dashboard')} 
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-white rounded-full flex items-center justify-center transition border border-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="game-score-display">
                {String(score).padStart(5, '0')}
              </div>
              <div className="game-gap-badge">
                HUECOS: {remainingGaps}
              </div>
            </div>

            {/* Center: Lives and Progress bar */}
            <div className="game-header-center">
              <div className="game-hearts-container justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className={`game-heart ${i >= hearts ? 'lost' : ''} fill-current`} 
                  />
                ))}
              </div>
              <div className="game-progress-track">
                <div 
                  className="game-progress-fill" 
                  style={{ width: `${Math.min(100, (currentTime / videoDuration) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Right: Multiplier */}
            <div className="game-header-right">
              <div className="game-bonus-badge">
                BONUS x{bonusMultiplier}
              </div>
            </div>

          </div>

          <div className="game-workspace">
            
            {/* Upper Panel: YouTube iframe */}
            <div className="game-player-section">
              <div className="video-wrapper">
                <div id="game-yt-iframe" className="w-full h-full"></div>
                <div className="absolute inset-0 bg-transparent pointer-events-none" />
              </div>
            </div>

            {/* Lower Panel: Lyrics list */}
            <div className="game-lyrics-section">
              
              <h2 className="song-title-heading font-sans">
                {selectedSong.title} - <span className="opacity-60">{selectedSong.artist}</span>
              </h2>

              <div className="lyrics-scroller" ref={scrollerRef}>
                {gameSubtitles.map((cue) => {
                  const isActive = activeCueId === cue.id;
                  
                  return (
                    <div 
                      key={cue.id} 
                      ref={isActive ? activeLineRef : null}
                      className={`lyric-line ${isActive ? 'active' : ''}`}
                    >
                      {cue.tokens.map((token, wordIdx) => {
                        if (token.isGap) {
                          return (
                            <span key={token.id} className="lyric-input-wrapper">
                              <input 
                                id={`input-${token.id}`}
                                type="text"
                                value={token.isCorrect ? token.cleanWord : token.userInput}
                                onChange={(e) => handleInputChange(cue.id, token.id, e)}
                                onKeyDown={(e) => handleInputKeyDown(cue.id, token.id, e)}
                                disabled={token.isCorrect}
                                placeholder="?"
                                style={{ width: `${Math.max(3, token.cleanWord.length) * 12 + 16}px` }}
                                className={`lyric-gap-input ${token.isCorrect ? 'correct' : ''}`}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                              />
                            </span>
                          );
                        } else {
                          return (
                            <span key={wordIdx} className="lyric-word">
                              {token.text}
                            </span>
                          );
                        }
                      })}
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Playback Controls */}
            <div className="game-bottom-navigation">
              
              <button onClick={() => handleSeek('backward')} className="nav-arrow-button">
                <ArrowLeft className="w-6 h-6" />
              </button>

              <div className="game-playback-controls">
                <button 
                  onClick={() => handleSpeedChange(0.75)} 
                  className={`control-text-btn ${playbackSpeed === 0.75 ? 'active' : ''}`}
                >
                  0.75x Slow
                </button>
                <button 
                  onClick={() => handleSpeedChange(1.0)} 
                  className={`control-text-btn ${playbackSpeed === 1.0 ? 'active' : ''}`}
                >
                  1.0x Normal
                </button>

                <button 
                  onClick={handleTogglePlay}
                  className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                </button>
              </div>

              <button onClick={() => handleSeek('forward')} className="nav-arrow-button">
                <ArrowRight className="w-6 h-6" />
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
