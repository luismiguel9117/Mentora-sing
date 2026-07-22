// src/components/NowPlaying.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Song, WordAnnotation } from '../types';
import { sounds } from './SoundManager';
import Confetti from './Confetti';
import { Heart, Award, RotateCcw, AlertCircle, Play, Pause, ArrowLeft, ArrowRight } from 'lucide-react';

interface NowPlayingProps {
  song: Song;
  onBack: () => void;
  onSelectWord: (word: WordAnnotation) => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
}

interface GameToken {
  id: string;
  text: string;
  cleanWord: string;
  isGap: boolean;
  isCorrect: boolean;
  userInput: string;
}

interface GameLyricLine {
  id: number;
  timeSeconds: number;
  text: string;
  spanishTranslation: string;
  grammarNote?: string;
  tokens: GameToken[];
}

const YOUTUBE_IDS: Record<string, string> = {
  'flowers-miley-cyrus': '2Vv-BfVoq4g',
  'stay-with-me-sam-smith': 'wXTJBr9mc8A',
  'levitating-dua-lipa': 'TUVcVqxQLHs',
  'shape-of-you-ed-sheeran': '2Vv-BfVoq4g', // fallback
  'believer-imagine-dragons': '7wtfhZwyrcc'
};

export const NowPlaying: React.FC<NowPlayingProps> = ({
  song,
  onBack,
  onSelectWord,
  onNextSong,
  onPrevSong
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [pitchScore, setPitchScore] = useState(98);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [lyricOffset, setLyricOffset] = useState(0);
  
  // Game Playback Logic
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [remainingGaps, setRemainingGaps] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Dynamic Game Subtitles
  const [gameSubtitles, setGameSubtitles] = useState<GameLyricLine[]>([]);
  const [videoDuration, setVideoDuration] = useState(song.durationSeconds || 180);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFetchingSubs, setIsFetchingSubs] = useState(false);

  // Pitch bars height animation state
  const [barHeights, setBarHeights] = useState<number[]>([40, 60, 80, 45, 70, 90, 70, 45, 80, 60, 40]);

  const playerRef = useRef<any>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // 1. Resolve actual YouTube ID
  const youtubeVideoId = YOUTUBE_IDS[song.id] || song.id;

  // 2. Tokenize lyrics with interactive input gaps (max 2 gaps per line)
  const initializeGame = (lyricsData: any[]) => {
    if (!lyricsData || lyricsData.length === 0) return;

    let gapCount = 0;
    const parsed: GameLyricLine[] = lyricsData.map((line, lineIdx) => {
      const words = line.text.split(/(\s+)/);
      
      // Identify candidate words in this line (exclude short words and punctuation)
      const candidates: number[] = [];
      words.forEach((word: string, wordIdx: number) => {
        const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().toLowerCase();
        if (clean.length > 2) {
          candidates.push(wordIdx);
        }
      });

      // Target at most 2 gaps per line (1 for very short lines, 2 for longer lines)
      const allowedGapsCount = candidates.length <= 3 ? 1 : 2;
      const gapIndices: number[] = [];
      for (let i = 0; i < allowedGapsCount && i < candidates.length; i++) {
        // Deterministic selection based on line index to distribute gaps
        const selIndex = (lineIdx + i * 2) % candidates.length;
        gapIndices.push(candidates[selIndex]);
      }
      
      const tokens: GameToken[] = words.map((word: string, wordIdx: number) => {
        const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().toLowerCase();
        const isActualWord = clean.length > 0;
        
        const isGap = isActualWord && gapIndices.includes(wordIdx);
        
        if (isGap) gapCount++;

        return {
          id: `${line.id}-${wordIdx}`,
          text: word,
          cleanWord: clean,
          isGap,
          isCorrect: false,
          userInput: ''
        };
      });

      return {
        id: line.id,
        timeSeconds: line.timeSeconds,
        text: line.text,
        spanishTranslation: line.spanishTranslation,
        grammarNote: line.grammarNote,
        tokens
      };
    });

    setGameSubtitles(parsed);
    setRemainingGaps(gapCount);
    setScore(0);
    setHearts(5);
    setCorrectStreak(0);
    setBonusMultiplier(1);
    setGameCompleted(false);
    setIsGameOver(false);
    setCurrentSecond(0);
    setLyricOffset(0); // reset sync offset per song
  };

  // Fetch subtitles dynamically first for exact sync, fallback to presets
  const loadSubtitles = async () => {
    setIsFetchingSubs(true);
    try {
      const res = await fetch('/api/generate-youtube-subs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: youtubeVideoId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subtitles && data.subtitles.length > 0) {
          const mappedSubs = data.subtitles.map((cue: any) => ({
            id: cue.id,
            timeSeconds: cue.start,
            text: cue.en,
            spanishTranslation: cue.es
          }));
          initializeGame(mappedSubs);
          setIsFetchingSubs(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch subtitles dynamically, trying presets...", err);
    }

    // Fallback to preset lyrics if available
    if (song.lyrics && song.lyrics.length > 0 && song.lyrics[0].text.length > 0) {
      initializeGame(song.lyrics);
    } else {
      initializeFallbackGame();
    }
    setIsFetchingSubs(false);
  };

  const initializeFallbackGame = () => {
    // Basic fallback lyrics
    const fallback = [
      { id: 1, timeSeconds: 2, text: "Wait, the song is loading", spanishTranslation: "Espera, la canción está cargando" },
      { id: 2, timeSeconds: 6, text: "Let's sing and learn together", spanishTranslation: "Cantemos y aprendamos juntos" }
    ];
    initializeGame(fallback);
  };

  useEffect(() => {
    loadSubtitles();
    sounds.playIntro();

    return () => {
      if (playerRef.current) {
        playerRef.current = null;
      }
    };
  }, [song.id]);

  // 3. Initialize YouTube Iframe SDK Player
  useEffect(() => {
    let tag = document.getElementById('youtube-iframe-api');
    if (!tag) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
      }
    }

    const checkYT = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(checkYT);
        initPlayer();
      }
    }, 100);

    function initPlayer() {
      if (playerRef.current) return;
      playerRef.current = new (window as any).YT.Player('game-yt-iframe', {
        videoId: youtubeVideoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          disablejsapi: 1,
          cc_load_policy: 0,
          iv_load_policy: 3
        },
        events: {
          'onReady': (event: any) => {
            const dur = event.target.getDuration();
            if (dur > 0) setVideoDuration(dur);
            setIsPlaying(true);
            
            // Explicitly deactivate/unload native YouTube captions
            try {
              if (event.target.unloadModule) {
                event.target.unloadModule('captions');
                event.target.unloadModule('cc');
              }
            } catch (err) {
              console.warn("Could not unload YouTube captions:", err);
            }
          },
          'onStateChange': (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
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
    };
  }, [youtubeVideoId]);

  // 4. Time synchronization loop
  useEffect(() => {
    if (isPlaying && playerRef.current && playerRef.current.getCurrentTime) {
      timeIntervalRef.current = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentSecond(time);

        if (time >= videoDuration - 1 && videoDuration > 10) {
          handleGameWin();
        }
      }, 100);
    } else {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [isPlaying, videoDuration]);

  // 5. Auto Scroll Active Lyrics
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSecond]);

  // 6. Mic & Pitch Simulation
  useEffect(() => {
    let pitchInterval: NodeJS.Timeout;
    if (isPlaying && isMicActive) {
      pitchInterval = setInterval(() => {
        setBarHeights(prev => prev.map(() => Math.floor(Math.random() * 75) + 25));
        setPitchScore(Math.floor(Math.random() * 6) + 94);
      }, 180);
    }
    return () => clearInterval(pitchInterval);
  }, [isPlaying, isMicActive]);

  // 7. Handle Typing Input check
  const handleInputChange = (lineId: number, tokenId: string, e: React.ChangeEvent<HTMLInputElement>) => {
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

                // Auto focus next input
                setTimeout(() => {
                  const inputs = Array.from(document.querySelectorAll('.lyric-gap-input')) as HTMLInputElement[];
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

  const handleInputKeyDown = (lineId: number, tokenId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const line = gameSubtitles.find(l => l.id === lineId);
      const token = line?.tokens.find(t => t.id === tokenId);
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
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    sounds.playIncorrect();
    setIsGameOver(true);
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

  const handleSeek = (direction: 'forward' | 'backward') => {
    if (!playerRef.current || !playerRef.current.getCurrentTime) return;
    const current = playerRef.current.getCurrentTime();
    const newTime = direction === 'forward' ? Math.min(current + 5, videoDuration) : Math.max(current - 5, 0);
    playerRef.current.seekTo(newTime, true);
    setCurrentSecond(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed);
      setPlaybackSpeed(speed);
    }
  };

  // Determine active lyric index with adjustable sync offset
  const syncedTime = currentSecond + lyricOffset;
  let activeLyricIndex = gameSubtitles.findIndex((l, index) => {
    const nextLine = gameSubtitles[index + 1];
    if (!nextLine) return true;
    return syncedTime >= l.timeSeconds && syncedTime < nextLine.timeSeconds;
  });

  if (activeLyricIndex === -1 && gameSubtitles.length > 0) {
    activeLyricIndex = 0;
  }

  const activeLyric = gameSubtitles[activeLyricIndex];
  const nextLyric = gameSubtitles[activeLyricIndex + 1];
  const progressPercent = Math.min(100, Math.max(0, (currentSecond / videoDuration) * 100));

  return (
    <div className="h-screen w-screen bg-[#fcf8ff] text-[#1b1b24] font-body flex flex-col relative overflow-hidden">
      {gameCompleted && <Confetti />}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-[#e4e1ee]">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Ups! Te has quedado sin vidas</h3>
            <p className="text-slate-500 text-sm mb-6">El ritmo era rápido, ¡pero no te rindas! Inténtalo de nuevo.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f5f2ff] p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Puntaje</span>
                <span className="text-xl font-extrabold text-[#4f46e5]">{score}</span>
              </div>
              <div className="bg-[#f5f2ff] p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Palabras restantes</span>
                <span className="text-xl font-extrabold text-[#712ae2]">{remainingGaps}</span>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  loadSubtitles();
                }}
                className="w-full py-3.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold rounded-2xl border-b-4 border-[#3323cc] active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <RotateCcw className="w-5 h-5" /> Reintentar
              </button>
              <button 
                onClick={onBack}
                className="w-full py-3.5 bg-[#f5f2ff] hover:bg-[#eae6f4] text-[#3525cd] font-bold rounded-2xl border-b-4 border-[#c7c4d8]/60 active:border-b-0 active:translate-y-[4px] transition-all"
              >
                Volver al panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Win Screen */}
      {gameCompleted && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-[#e4e1ee]">
            <Award className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Increíble actuación!</h3>
            <p className="text-slate-500 text-sm mb-6">Has completado la canción satisfactoriamente.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#f5f2ff] p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Puntaje Total</span>
                <span className="text-xl font-extrabold text-emerald-600">{score} pts</span>
              </div>
              <div className="bg-[#f5f2ff] p-4 rounded-2xl">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Experiencia ganada</span>
                <span className="text-xl font-extrabold text-[#712ae2]">+150 XP</span>
              </div>
            </div>
            <div className="space-y-3">
              <button 
                onClick={onBack}
                className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-2xl border-b-4 border-[#07855c] active:border-b-0 active:translate-y-[4px] transition-all shadow-md"
              >
                Aceptar y salir
              </button>
              <button 
                onClick={() => {
                  loadSubtitles();
                }}
                className="w-full py-3.5 bg-[#f5f2ff] hover:bg-[#eae6f4] text-[#3525cd] font-bold rounded-2xl border-b-4 border-[#c7c4d8]/60 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" /> Cantar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top App Bar */}
      <header className="h-16 flex-shrink-0 flex justify-between items-center px-6 bg-[#fcf8ff]/85 backdrop-blur-md border-b border-[#e4e1ee]/40 z-30">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f2ff] transition active:scale-95 duration-200"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined text-[#3525cd]">arrow_back</span>
        </button>

        <div className="flex flex-col items-center cursor-pointer" onClick={onBack}>
          <span className="font-headline text-sm font-bold text-[#3525cd] leading-tight">Now Playing</span>
          <span className="text-xs text-[#464555] font-semibold">{song.title} — {song.artist}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hearts Display */}
          <div className="flex items-center gap-1.5 mr-2">
            {[...Array(5)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 transition-transform ${
                  i >= hearts ? 'text-slate-200 fill-slate-200 scale-90' : 'text-rose-500 fill-rose-500'
                }`} 
              />
            ))}
          </div>
          {/* Gaps remaining */}
          <span className="bg-[#4f46e5]/10 text-[#4f46e5] px-3 py-1 rounded-full text-xs font-bold border border-[#4f46e5]/20">
            HUECOS: {remainingGaps}
          </span>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top Half: Video Player Area */}
        <section className="relative w-full h-[40vh] bg-black overflow-hidden shadow-lg z-10 flex-shrink-0">
          <div className="absolute inset-0 w-full h-full">
            <div id="game-yt-iframe" className="w-full h-full"></div>
            {/* Click blocker to intercept standard clicks */}
            <div className="absolute inset-0 bg-transparent pointer-events-none" />
          </div>
          
          {/* Video Overlay Info */}
          <div className="absolute top-4 right-4 z-20">
            <span className="bg-[#4f46e5]/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-sm border border-white/20">
              PUNTAJE: {score}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20">
            {/* progress slider */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center justify-between text-xs text-white/90 font-bold drop-shadow-md">
                <span>{Math.floor(currentSecond / 60)}:{('0' + Math.floor(currentSecond % 60)).slice(-2)}</span>
                <span>{Math.floor(videoDuration / 60)}:{('0' + Math.floor(videoDuration % 60)).slice(-2)}</span>
              </div>
              <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden cursor-pointer backdrop-blur-xs">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(79,70,229,0.8)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Precision Pitch Visualizer Overlay */}
        <div className="relative h-14 w-full bg-[#f5f2ff] flex items-center px-4 overflow-hidden border-y border-[#c7c4d8]/40 shadow-inner flex-shrink-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex gap-2">
            <button
              onClick={() => setIsMicActive(!isMicActive)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
                isMicActive ? 'bg-[#3525cd] text-white ring-2 ring-[#3525cd]/30' : 'bg-[#c7c4d8] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isMicActive ? "'FILL' 1" : undefined }}>
                {isMicActive ? 'mic' : 'mic_off'}
              </span>
            </button>
          </div>

          {/* Animated Pitch Bars */}
          <div className="flex-1 h-12 flex items-center justify-center gap-1.5 opacity-80 ml-12 mr-16">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full pitch-line ${
                  i >= 3 && i <= 7
                    ? 'bg-[#3525cd] shadow-[0_0_8px_rgba(79,70,229,0.5)]'
                    : 'bg-[#712ae2]/60'
                }`}
                style={{ height: `${isMicActive && isPlaying ? h : 20}%` }}
              />
            ))}
          </div>

          <div className="absolute right-4 text-[#3525cd] font-bold text-xs tracking-tight bg-white/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#3525cd]/20">
            BONUS: x{bonusMultiplier}
          </div>
        </div>

        {/* Bottom Half: Scrolling Lyrics Area */}
        <section className="flex-1 min-h-0 bg-[#fcf8ff] relative overflow-hidden px-6 py-4 flex flex-col items-center justify-center">
          {isFetchingSubs ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-500 font-bold">Generando subtítulos en inglés...</span>
            </div>
          ) : (
            <div className="w-full max-w-xl flex-1 overflow-y-auto no-scrollbar flex flex-col space-y-5 lyric-gradient text-center py-4 transition-all">
              {gameSubtitles.map((line, idx) => {
                const distance = idx - activeLyricIndex;
                let opacityClass = 'opacity-25 text-base text-[#464555] blur-[0.5px]';
                let scaleClass = 'scale-100';

                if (distance === 0) {
                  return (
                    <div 
                      key={line.id} 
                      ref={activeLineRef}
                      className="py-2 transform transition-all duration-300"
                    >
                      <div className="font-headline text-2xl md:text-3xl font-extrabold text-[#4f46e5] active-lyric px-2 drop-shadow-sm leading-tight flex flex-wrap justify-center items-center gap-y-1.5">
                        {line.tokens.map((token) => {
                          if (token.isGap) {
                            return (
                              <input 
                                key={token.id}
                                id={`input-${token.id}`}
                                type="text"
                                value={token.isCorrect ? token.cleanWord : token.userInput}
                                onChange={(e) => handleInputChange(line.id, token.id, e)}
                                onKeyDown={(e) => handleInputKeyDown(line.id, token.id, e)}
                                disabled={token.isCorrect}
                                maxLength={token.cleanWord.length}
                                placeholder="?"
                                style={{ width: `${Math.max(3, token.cleanWord.length) * 11 + 16}px` }}
                                className={`mx-1 text-center bg-indigo-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-indigo-950 font-bold transition-all placeholder-indigo-300 py-0.5 text-xl lyric-gap-input ${
                                  token.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : ''
                                }`}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                              />
                            );
                          } else {
                            return (
                              <span key={token.id} className="inline-block mx-0.5 text-[#4f46e5]">
                                {token.text}
                              </span>
                            );
                          }
                        })}
                      </div>
                      <p className="text-xs text-[#712ae2] font-semibold mt-2 animate-fadeIn leading-relaxed">
                        {line.spanishTranslation}
                      </p>
                      {line.grammarNote && (
                        <span className="inline-block mt-2 text-[10px] bg-[#ffdbcc] text-[#351000] px-3 py-0.5 rounded-full font-bold">
                          💡 {line.grammarNote}
                        </span>
                      )}
                    </div>
                  );
                } else if (Math.abs(distance) === 1) {
                  opacityClass = 'opacity-60 text-xl font-bold text-[#1b1b24]';
                } else if (Math.abs(distance) === 2) {
                  opacityClass = 'opacity-40 text-lg text-[#464555] font-semibold';
                }

                return (
                  <p
                    key={line.id}
                    onClick={() => {
                      if (playerRef.current && playerRef.current.seekTo) {
                        playerRef.current.seekTo(line.timeSeconds, true);
                        setCurrentSecond(line.timeSeconds);
                      }
                    }}
                    className={`font-headline cursor-pointer hover:opacity-100 transition-all ${opacityClass} ${scaleClass}`}
                  >
                    {line.text}
                  </p>
                );
              })}
            </div>
          )}

          {/* Glassy Next Phrase Hint */}
          {nextLyric && !isFetchingSubs && (
            <div className="mt-4 bg-white/60 backdrop-blur-md border border-[#e4e1ee]/40 px-5 py-2 rounded-full shadow-sm flex items-center gap-2 transition-all flex-shrink-0">
              <span className="material-symbols-outlined text-xs text-[#4f46e5]">queue_music</span>
              <span className="text-xs font-bold text-[#3525cd]/80">
                Siguiente: {nextLyric.text}
              </span>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation Bar (Playback Controls) */}
      <nav className="h-20 flex-shrink-0 flex justify-around items-center px-6 bg-[#f5f2ff]/95 backdrop-blur-xl border-t border-[#c7c4d8]/30 z-30">
        {/* Playback Speed Control */}
        <div className="flex gap-1 bg-white/50 border border-slate-200 rounded-full p-0.5">
          <button 
            onClick={() => handleSpeedChange(0.75)} 
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
              playbackSpeed === 0.75 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            0.75x
          </button>
          <button 
            onClick={() => handleSpeedChange(1.0)} 
            className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${
              playbackSpeed === 1.0 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            1.0x
          </button>
        </div>

        {/* Previous */}
        <button
          onClick={() => handleSeek('backward')}
          className="flex flex-col items-center justify-center text-[#464555] p-3 hover:bg-[#eae6f4] rounded-full transition active:scale-90"
          title="Rewind 5s"
        >
          <span className="material-symbols-outlined text-2xl">replay_5</span>
        </button>

        {/* Play/Pause Primary */}
        <button
          onClick={handleTogglePlay}
          className="flex flex-col items-center justify-center bg-[#4f46e5] text-white rounded-full w-14 h-14 scale-105 shadow-lg active:scale-95 hover:bg-[#3525cd] transition"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPlaying ? 'pause_circle' : 'play_circle'}
          </span>
        </button>

        {/* Next */}
        <button
          onClick={() => handleSeek('forward')}
          className="flex flex-col items-center justify-center text-[#464555] p-3 hover:bg-[#eae6f4] rounded-full transition active:scale-90"
          title="Forward 5s"
        >
          <span className="material-symbols-outlined text-2xl">forward_5</span>
        </button>

        {/* Exit Game */}
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center text-[#464555] p-3 hover:bg-[#eae6f4] rounded-full transition active:scale-90"
          title="Volver"
        >
          <span className="material-symbols-outlined text-2xl">exit_to_app</span>
        </button>
      </nav>

      {/* Karaoke Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-outline-variant/30 animate-fadeIn text-[#1b1b24]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3525cd]">tune</span>
                <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Ajustes de Sincronización</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-full text-[#777587] hover:bg-[#f5f2ff]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Lyrics Sync Offset */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#1b1b24] mb-2">
                  <span>Ajustar tiempo de letra (Offset)</span>
                  <span>{lyricOffset > 0 ? `+${lyricOffset}` : lyricOffset}s</span>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setLyricOffset((prev) => Math.round((prev - 0.5) * 10) / 10)}
                    className="px-3 py-1.5 rounded-lg bg-[#f5f2ff] text-xs font-bold text-[#3525cd]"
                  >
                    -0.5s
                  </button>
                  <span className="text-xs font-semibold text-[#464555] flex-1 text-center">
                    {lyricOffset === 0 ? 'Sin retraso' : `${lyricOffset > 0 ? '+' : ''}${lyricOffset}s`}
                  </span>
                  <button
                    onClick={() => setLyricOffset((prev) => Math.round((prev + 0.5) * 10) / 10)}
                    className="px-3 py-1.5 rounded-lg bg-[#f5f2ff] text-xs font-bold text-[#3525cd]"
                  >
                    +0.5s
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Usa estos botones para adelantar o retrasar las letras si no coinciden con el sonido del video.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full mt-6 py-3 bg-[#3525cd] text-white font-bold rounded-2xl shadow-md hover:bg-[#4f46e5] transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
