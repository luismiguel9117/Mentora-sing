import React, { useState, useEffect } from 'react';
import { Song, PracticeMode, WordAnnotation } from '../types';

interface PracticeHubProps {
  songs: Song[];
  initialMode?: PracticeMode;
  onStartKaraoke: (song: Song) => void;
  onOpenAICoach: (songTitle?: string) => void;
  onSelectWord: (word: WordAnnotation) => void;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({
  songs,
  initialMode = 'listening',
  onStartKaraoke,
  onOpenAICoach,
  onSelectWord
}) => {
  const [activeTab, setActiveTab] = useState<PracticeMode>(initialMode);
  
  // Safe song initialization fallback
  const fallbackSong: Song = songs[0] || {
    id: 'flowers-miley-cyrus',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    level: 'B1 Intermediate',
    genre: 'Pop Hits',
    durationSeconds: 200,
    videoImage: '',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJcDGHqHd9CI7YbeGhTwfVcrocUlTt1Ib95HEm7VuH9yVLJ_Kd5xnfbfRsCsblzcBzUVAxmwTqOQvsTWyYydDnm4GduJwjMfpUaE3QoJJY5F7BTIu4dU8XhRuZD3kY01-8ooY7ODKRIc55hAAn_jbEpCQ56BFklsfWW5qXVqOtdX8kU2dlGB8Jo6CbIznFvBVXwRheTr72DthOLuLHSiuBcrntTSNG9Um0xhRNa3RkzeO-xV_cXZMpmpHtIkhmHN0-rzbMtiKKG-A',
    lyrics: []
  };

  const [selectedSong, setSelectedSong] = useState<Song>(fallbackSong);

  // Listening Fill-in-the-blank game state
  const [blankAnswer, setBlankAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [practiceLineIdx, setPracticeLineIdx] = useState(0);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [isAutoTransitioning, setIsAutoTransitioning] = useState(false);

  // Pronunciation practice state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedScore, setRecordedScore] = useState<number | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dynamic lyric line for voice practice
  const activeLyric = selectedSong.lyrics && selectedSong.lyrics.length > 0
    ? (selectedSong.lyrics[practiceLineIdx % selectedSong.lyrics.length] || selectedSong.lyrics[0])
    : { id: 1, text: "Built a home and watched it burn", spanishTranslation: "Construimos un hogar y lo vimos arder" };

  const vocabularyList = selectedSong.lyrics ? selectedSong.lyrics.flatMap((l) => l.words || []) : [];

  // 1. Fetch subtitles dynamically if they are empty
  useEffect(() => {
    async function loadSubs() {
      if (!selectedSong.lyrics || selectedSong.lyrics.length === 0) {
        try {
          const youtubeVideoId = selectedSong.id;
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
              setSelectedSong(prev => ({ ...prev, lyrics: mappedSubs }));
            }
          }
        } catch (e) {
          console.warn("Failed to load subtitles dynamically in PracticeHub:", e);
        }
      }
    }
    loadSubs();
  }, [selectedSong.id]);

  // Synthesize game sound effects using Web Audio API
  const playTone = (type: 'success' | 'fail') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (err) {
      console.warn("AudioContext synthesis error:", err);
    }
  };

  const getQuestionDetails = () => {
    const emptyDetails = {
      displayText: 'Built a home and watched it ____',
      cleanHiddenWord: 'burn',
      fullText: 'Built a home and watched it burn',
      translation: 'Construimos un hogar y lo vimos arder'
    };

    if (!selectedSong.lyrics || selectedSong.lyrics.length === 0) {
      return emptyDetails;
    }

    const line = selectedSong.lyrics[practiceLineIdx % selectedSong.lyrics.length] || selectedSong.lyrics[0];
    const rawWords = line.text.split(/(\s+)/);
    
    // Choose longest word of the line as gap target
    let targetIndex = -1;
    let maxLen = 0;
    
    rawWords.forEach((w, idx) => {
      const clean = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
      if (clean.length > 3 && clean.length > maxLen) {
        maxLen = clean.length;
        targetIndex = idx;
      }
    });
    
    if (targetIndex === -1) {
      for (let i = rawWords.length - 1; i >= 0; i--) {
        const clean = rawWords[i].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
        if (clean.length > 0) {
          targetIndex = i;
          break;
        }
      }
    }
    
    if (targetIndex === -1) {
      return emptyDetails;
    }

    const hiddenWord = rawWords[targetIndex];
    const cleanHiddenWord = hiddenWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().toLowerCase();
    
    const displayText = rawWords.map((w, idx) => {
      if (idx === targetIndex) return '____';
      return w;
    }).join('');
    
    return {
      displayText,
      cleanHiddenWord,
      fullText: line.text,
      translation: line.spanishTranslation || ''
    };
  };

  const q = getQuestionDetails();

  const handleCheckListening = () => {
    if (isAutoTransitioning) return;
    
    const isCorrect = blankAnswer.trim().toLowerCase() === q.cleanHiddenWord;
    
    if (isCorrect) {
      setIsAnswerCorrect(true);
      setPracticeStreak(prev => prev + 1);
      playTone('success');
      
      setIsAutoTransitioning(true);
      setTimeout(() => {
        setBlankAnswer('');
        setIsAnswerCorrect(null);
        setPracticeLineIdx(prev => prev + 1);
        setIsAutoTransitioning(false);
      }, 1800);
    } else {
      setIsAnswerCorrect(false);
      setPracticeStreak(0);
      playTone('fail');
      
      setIsAutoTransitioning(true);
      setTimeout(() => {
        setBlankAnswer('');
        setIsAnswerCorrect(null);
        setPracticeLineIdx(prev => prev + 1);
        setIsAutoTransitioning(false);
      }, 2800);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedScore(null);
    setTimeout(() => {
      setIsRecording(false);
      setRecordedScore(96);
    }, 2500);
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="font-headline text-3xl font-bold text-[#1b1b24] mb-1">Practice Hub</h2>
        <p className="text-[#464555] text-sm">Target listening, pronunciation, grammar, and vocabulary skills.</p>
      </div>

      {/* Song Selector Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-outline-variant/30 shadow-xs">
        <img src={selectedSong.coverImage} alt={selectedSong.title} className="w-14 h-14 object-cover rounded-2xl shadow-sm" />
        <div className="flex-1">
          <p className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider">Active Practice Song</p>
          <h3 className="font-headline font-bold text-lg text-[#1b1b24]">{selectedSong.title}</h3>
          <p className="text-xs text-[#464555]">{selectedSong.artist} • {selectedSong.level}</p>
        </div>
        <select
          value={selectedSong.id}
          onChange={(e) => {
            const found = songs.find((s) => s.id === e.target.value);
            if (found) setSelectedSong(found);
          }}
          className="bg-[#f5f2ff] border-none rounded-xl text-xs font-semibold px-3 py-2 text-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/20"
        >
          {songs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {/* Practice Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'listening', label: 'Listening Fill-in', icon: 'hearing', color: '#0EA5E9' },
          { id: 'pronunciation', label: 'Pronunciation Mic', icon: 'record_voice_over', color: '#22C55E' },
          { id: 'lyrics', label: 'Lyrics Breakdown', icon: 'lyrics', color: '#F97316' },
          { id: 'vocabulary', label: 'Vocabulary Flashcards', icon: 'book', color: '#EF4444' },
          { id: 'ai_coach', label: 'AI Coach Chat', icon: 'smart_toy', color: '#8B5CF6' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as PracticeMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#3525cd] text-white shadow-md'
                : 'bg-[#f5f2ff] text-[#464555] hover:bg-[#eae6f4]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content 1: Listening Fill-in-the-blank */}
      {activeTab === 'listening' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center">
                <span className="material-symbols-outlined">hearing</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Listening Gap Fill</h3>
                <p className="text-xs text-[#464555]">Listen to the line and fill in the missing word.</p>
              </div>
            </div>
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#fffbeb] border border-[#fef3c7] rounded-full text-amber-700 font-bold text-xs shadow-xs animate-bounce">
              <span>🔥</span>
              <span>Racha: {practiceStreak}</span>
            </div>
          </div>

          <div className="bg-[#f5f2ff] p-6 rounded-2xl text-center space-y-4">
            <button
              onClick={() => {
                const synth = window.speechSynthesis;
                if (synth) {
                  synth.cancel(); // stop any active speech
                  const utterance = new SpeechSynthesisUtterance(q.fullText);
                  utterance.lang = 'en-US';
                  utterance.rate = 0.85;
                  synth.speak(utterance);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3525cd] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#4f46e5] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">volume_up</span>
              Escuchar Frase
            </button>

            <p className="font-headline text-xl md:text-2xl font-bold text-[#1b1b24] pt-2 leading-relaxed">
              "{q.displayText}"
            </p>
            {q.translation && (
              <p className="text-xs text-indigo-500 font-semibold italic mt-1">
                ({q.translation})
              </p>
            )}

            <div className="max-w-xs mx-auto flex gap-2 pt-2">
              <input
                type="text"
                value={blankAnswer}
                onChange={(e) => {
                  if (isAutoTransitioning) return;
                  setBlankAnswer(e.target.value);
                  setIsAnswerCorrect(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCheckListening();
                  }
                }}
                disabled={isAutoTransitioning}
                maxLength={q.cleanHiddenWord.length}
                placeholder="Escribe la palabra..."
                className={`flex-1 px-4 py-2.5 rounded-xl border text-center font-bold text-sm focus:ring-2 focus:ring-[#3525cd]/20 transition-all ${
                  isAnswerCorrect === true ? 'border-emerald-500 bg-emerald-50 text-emerald-900' :
                  isAnswerCorrect === false ? 'border-red-500 bg-red-50 text-red-900' :
                  'border-outline-variant/40 bg-white'
                }`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <button
                onClick={handleCheckListening}
                disabled={isAutoTransitioning || !blankAnswer.trim()}
                className="bg-[#3525cd] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#4f46e5] transition-all disabled:opacity-50"
              >
                Comprobar
              </button>
            </div>

            {isAnswerCorrect === true && (
              <div className="p-3 bg-[#F0FDF4] text-[#22C55E] rounded-xl text-xs font-bold animate-fadeIn">
                🎉 ¡Excelente! "{q.cleanHiddenWord}" es correcto. +15 XP
              </div>
            )}
            {isAnswerCorrect === false && (
              <div className="p-3 bg-[#FEF2F2] text-[#EF4444] rounded-xl text-xs font-bold animate-fadeIn">
                ❌ ¡Incorrecto! La palabra correcta era "{q.cleanHiddenWord}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 2: Pronunciation Recorder */}
      {activeTab === 'pronunciation' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] text-[#22C55E] flex items-center justify-center">
              <span className="material-symbols-outlined">record_voice_over</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Pronunciation Mic Tester</h3>
              <p className="text-xs text-[#464555]">Record yourself singing or speaking the lyric.</p>
            </div>
          </div>

          <div className="bg-[#f5f2ff] p-6 rounded-2xl text-center space-y-5">
            <p className="font-headline text-2xl font-extrabold text-[#3525cd]">
              "{activeLyric.text}"
            </p>
            <p className="text-xs text-[#712ae2] font-semibold">{activeLyric.spanishTranslation}</p>

            <div className="flex justify-center items-center gap-4 pt-2">
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-[#ba1a1a] animate-pulse ring-4 ring-[#ba1a1a]/30'
                    : 'bg-[#22C55E] hover:bg-[#16a34a]'
                }`}
              >
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mic
                </span>
                <span className="text-[10px] font-bold">{isRecording ? 'Listening...' : 'Tap to Speak'}</span>
              </button>
            </div>

            {recordedScore !== null && (
              <div className="p-4 bg-[#F0FDF4] border border-[#22C55E]/30 text-[#1b1b24] rounded-2xl text-center max-w-sm mx-auto space-y-1 animate-fadeIn">
                <p className="text-2xl font-extrabold text-[#22C55E]">{recordedScore}% Accuracy!</p>
                <p className="text-xs text-[#464555]">Great intonation on "watched it burn"! Accent clarity is high.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: Lyrics Breakdown */}
      {activeTab === 'lyrics' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                <span className="material-symbols-outlined">lyrics</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Full Lyrics Breakdown</h3>
                <p className="text-xs text-[#464555]">Click any word to view phonetic guide & translation.</p>
              </div>
            </div>
            <button
              onClick={() => onStartKaraoke(selectedSong)}
              className="bg-[#3525cd] text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>Karaoke View</span>
              <span className="material-symbols-outlined text-sm">play_arrow</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedSong.lyrics.map((line) => (
              <div key={line.id} className="p-4 bg-[#f5f2ff] rounded-2xl border border-outline-variant/20 hover:border-[#3525cd]/30 transition-all">
                <p className="font-headline font-bold text-base text-[#1b1b24] mb-1">
                  {line.words ? (
                    line.words.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => onSelectWord(w)}
                        className="inline-block mr-1.5 cursor-pointer hover:bg-[#3525cd]/10 hover:text-[#3525cd] px-1.5 py-0.5 rounded-lg transition-colors"
                      >
                        {w.word}
                      </span>
                    ))
                  ) : (
                    line.text
                  )}
                </p>
                <p className="text-xs text-[#712ae2] font-semibold">{line.spanishTranslation}</p>
                {line.grammarNote && (
                  <p className="text-[11px] text-[#7e3000] font-medium mt-1 bg-[#ffdbcc] px-2 py-0.5 rounded-md inline-block">
                    💡 {line.grammarNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Vocabulary Flashcards */}
      {activeTab === 'vocabulary' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
                <span className="material-symbols-outlined">book</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Song Vocabulary Bank</h3>
                <p className="text-xs text-[#464555]">Master key words from "{selectedSong.title}".</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#777587]">
              {cardIndex + 1} / {vocabularyList.length || 1}
            </span>
          </div>

          {vocabularyList.length > 0 ? (
            <div className="max-w-md mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="h-60 bg-[#f5f2ff] border-2 border-[#3525cd]/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all transform active:scale-98"
              >
                {!isFlipped ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#777587]">English Word</span>
                    <h2 className="font-headline text-4xl font-extrabold text-[#3525cd]">
                      {vocabularyList[cardIndex]?.word}
                    </h2>
                    <p className="text-xs font-semibold text-[#712ae2]">{vocabularyList[cardIndex]?.phonetic}</p>
                    <p className="text-[11px] text-[#777587] pt-4">(Tap card to flip for Spanish definition)</p>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fadeIn">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Traducción al Español</span>
                    <h3 className="font-headline text-3xl font-bold text-[#1b1b24]">
                      {vocabularyList[cardIndex]?.translation}
                    </h3>
                    <p className="text-xs text-[#464555] px-4">{vocabularyList[cardIndex]?.definition}</p>
                    <p className="text-xs font-medium text-[#3525cd] italic pt-2">"{vocabularyList[cardIndex]?.example}"</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => (prev > 0 ? prev - 1 : vocabularyList.length - 1));
                  }}
                  className="flex-1 py-3 bg-[#f5f2ff] text-[#1b1b24] rounded-2xl font-bold text-xs hover:bg-[#eae6f4]"
                >
                  Previous Card
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => (prev < vocabularyList.length - 1 ? prev + 1 : 0));
                  }}
                  className="flex-1 py-3 bg-[#3525cd] text-white rounded-2xl font-bold text-xs hover:bg-[#4f46e5] shadow-md"
                >
                  Next Card
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-[#777587] py-8">Select a song with vocabulary annotations to view flashcards.</p>
          )}
        </div>
      )}

      {/* Tab Content 5: AI Coach Chat CTA */}
      {activeTab === 'ai_coach' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#EDE9FE] text-[#8B5CF6] mx-auto flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
          </div>
          <h3 className="font-headline font-bold text-2xl text-[#1b1b24]">AI Singing & Pronunciation Coach</h3>
          <p className="text-xs text-[#464555] max-w-md mx-auto">
            Get instant personal coaching powered by Gemini on pitch control, connected speech, vowel reduction, and slang in "{selectedSong.title}".
          </p>
          <button
            onClick={() => onOpenAICoach(selectedSong.title)}
            className="px-8 py-3.5 bg-[#3525cd] text-white rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">forum</span>
            Chat with AI Coach Now
          </button>
        </div>
      )}
    </div>
  );
};
