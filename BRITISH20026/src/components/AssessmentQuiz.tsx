import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Loader2, Clock, CheckCircle2, HelpCircle, Star, X } from 'lucide-react';
import { Question } from '../types';
import { QUESTIONS } from '../data/questions';
import MascotLion from './MascotLion';

interface AssessmentQuizProps {
  onComplete: (userResponses: { questionId: number; selectedOption: number; isCorrect: boolean }[]) => void;
  onExit: () => void;
}

export default function AssessmentQuiz({
  onComplete,
  onExit,
}: AssessmentQuizProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishingStep, setFinishingStep] = useState(0);

  // Real countdown timer starting at 5:00 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  // Card Spotlight Mouse Coordinates & Hover State Tracking (Aceternity UI)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseCoords, setMouseCoords] = useState<Record<number, { x: number; y: number }>>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords((prev) => ({
      ...prev,
      [idx]: { x: e.clientX - rect.left, y: e.clientY - rect.top },
    }));
  };

  useEffect(() => {
    if (!hasStarted || isFinishing) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinishing(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isFinishing]);

  const formattedTimeLeft = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  const currentQuestion = useMemo<Question>(() => {
    return QUESTIONS[currentIndex];
  }, [currentIndex]);

  const totalQuestions = QUESTIONS.length;
  const currentQuestionNumber = currentIndex + 1;
  const progressPercent = Math.round((currentQuestionNumber / totalQuestions) * 100);

  // Mascot Duolingo-style speech triggers
  const mascotRemark = useMemo(() => {
    if (currentQuestionNumber === 1) {
      return "¡Comencemos! Demuestra tu nivel real. 🚀";
    }
    if (currentQuestionNumber === Math.round(totalQuestions / 2)) {
      return "¡Muy bien! Sigue así 💪";
    }
    if (currentQuestionNumber === totalQuestions - 2) {
      return "¡Ya casi terminamos! Lee con atención.";
    }
    if (currentQuestionNumber === totalQuestions) {
      return "¡Última pregunta! ¡Tu resultado oficial está listo! 🔥";
    }
    if (currentQuestionNumber % 4 === 0) {
      return "¡Buen trabajo! Mantén el entusiasmo.";
    }
    if (currentQuestionNumber % 5 === 0) {
      return "¡Vas súper bien! Sigue así.";
    }
    return undefined;
  }, [currentQuestionNumber, totalQuestions]);

  // Simulated evaluation stepper loaders
  useEffect(() => {
    if (isFinishing) {
      const steps = [
        'Organizando respuestas...',
        'Puntuando respuestas gramaticales...',
        'Formatando nivel estimado según el MCER...',
        'Asociando programas recomendados...',
        'Generando tu reporte oficial British House...'
      ];

      const interval = setInterval(() => {
        setFinishingStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            const finalizedResponses = QUESTIONS.map((q) => {
              const selectedIdx = selectedAnswers[q.id] ?? 0;
              return {
                questionId: q.id,
                selectedOption: selectedIdx,
                isCorrect: q.correctAnswer === selectedIdx,
              };
            });
            onComplete(finalizedResponses);
            return prev;
          }
          return prev + 1;
        });
      }, 700);

      return () => clearInterval(interval);
    }
  }, [isFinishing, selectedAnswers, onComplete]);

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestion.id] === undefined) return;

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinishing(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isSelected = selectedAnswers[currentQuestion.id] !== undefined;

  // 1. RENDER PRE-ASSESSMENT SCREEN
  if (!hasStarted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-union-jack-grid flex items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[#0A2E9E]/25 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-[#4A2DCC]/20 blur-[120px] pointer-events-none -z-10" />

        {/* Centered container/card (matching pre-assessment card in screenshot) */}
        <div className="w-full max-w-4xl bg-[#05144b]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)] relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: 3D Clipboard Icon */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start items-center">
            <img 
              src="/assets/images/clipboard.png" 
              alt="Antes de comenzar" 
              className="w-36 md:w-40 lg:w-44 h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,210,255,0.3)] animate-float-medium"
            />
          </div>

          {/* Middle: Onboarding text & checklist info */}
          <div className="lg:col-span-6 text-left space-y-5">
            <h2 className="text-2xl md:text-3.5xl font-sans font-black text-[#00d2ff] tracking-tight uppercase">
              Antes de comenzar
            </h2>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              No te preocupes si no conoces todas las respuestas. Esta evaluación está diseñada para identificar tu nivel actual y recomendarte el programa más adecuado para alcanzar tus objetivos.
            </p>
            
            {/* Horizontal or compact details list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-[#00d2ff]" />
                <span>Duración aprox: 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4.5 h-4.5 text-[#00d2ff]" />
                <span>20 preguntas rápidas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#00d2ff]" />
                <span>Resultado inmediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4.5 h-4.5 text-[#00d2ff]" />
                <span>Recomendación oficial</span>
              </div>
            </div>
          </div>

          {/* Right Side: Mascot pointing and Yellow Start Button */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center gap-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
            <img 
              src="/assets/images/lion_pre.png" 
              alt="Mascota Leo el León" 
              className="w-32 md:w-36 h-auto object-contain drop-shadow-lg animate-float-slow"
            />
            
            <button
              onClick={() => setHasStarted(true)}
              className="group w-full flex items-center justify-center gap-2 bg-[#FFC83D] hover:bg-[#ffe08a] text-[#020925] font-sans font-black tracking-wider uppercase rounded-xl py-4 transition-all duration-300 shadow-[0_0_20px_rgba(255,200,61,0.2)] hover:shadow-[0_0_30px_rgba(255,200,61,0.4)] cursor-pointer text-sm animate-shine"
            >
              <span>EMPEZAR AHORA</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 stroke-[3px]" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. RENDER FINISHING LOADING SCREEN
  if (isFinishing) {
    const steps = [
      'Analizando patrones de respuestas seleccionadas...',
      'Mapeando puntajes según el Marco Común Europeo (A1-C1)...',
      'Evaluando competencia gramatical y léxica acumulada...',
      'Compilando sugerencias y programas curriculares...',
      'Preparando reporte de admisión oficial para British House...'
    ];

    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#020925] bg-union-jack-grid flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#4A2DCC]/20 blur-[100px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#0A2E9E]/20 blur-[100px]" />

        <div className="w-full max-w-md sm:max-w-lg bg-[#05144b]/80 backdrop-blur-xl p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-white/10 text-center flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative z-10">
          <MascotLion state="success" className="w-36 sm:w-48 md:w-56 h-auto mb-4 md:mb-6" />
          
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#0A2E9E]/20 text-[#FFC83D] rounded-full mb-3 sm:mb-4 shadow-[0_0_15px_rgba(255,200,61,0.3)] border border-[#FFC83D]/30">
            <Loader2 className="w-5.5 h-5.5 sm:w-6 sm:h-6 animate-spin text-[#FFC83D]" />
          </div>

          <h3 className="text-lg sm:text-xl md:text-2xl font-sans font-black text-white tracking-wide uppercase mb-1">
            Analizando tu Rendimiento
          </h3>
          <p className="text-[9px] sm:text-[10px] font-mono text-[#FFC83D] uppercase tracking-widest mb-4 sm:mb-6">
            Estableciendo tu perfil de nivel MCER...
          </p>

          <div className="w-full space-y-2.5 sm:space-y-3.5 bg-[#020925]/60 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5">
            {steps.map((stepMessage, idx) => {
              const isDone = finishingStep > idx;
              const isActive = finishingStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 sm:gap-3 text-left transition-all duration-300 ${
                    isDone ? 'opacity-40 scale-95' : isActive ? 'opacity-100 scale-100' : 'opacity-15 scale-95'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 border shrink-0 ${
                      isDone
                        ? 'bg-[#FFC83D]/20 border-[#FFC83D]/40 text-[#FFC83D]'
                        : isActive
                        ? 'bg-[#4A2DCC]/30 border-[#4A2DCC]/60 text-white animate-pulse'
                        : 'bg-white/5 border-white/5 text-slate-500'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-sans font-bold transition-colors duration-300 ${
                      isActive ? 'text-[#FFC83D]' : 'text-slate-300'
                    }`}
                  >
                    {stepMessage}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. RENDER ACTIVE ASSESSMENT EXPERIENCE
  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between bg-union-jack-grid select-none relative overflow-hidden text-white">
      
      {/* Background radial spotlights */}
      <div className="absolute top-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[#0A2E9E]/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-[#4A2DCC]/15 blur-[120px] pointer-events-none -z-10" />

      {/* TOP PROGRESS HEADER BAR */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-4 md:pt-6 flex flex-col gap-2">
        <div className="w-full flex items-center justify-between gap-3 text-xs font-bold font-sans text-slate-300">
          {/* Back Action - Shows X icon, text hidden on very small screens */}
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-1.5 px-3 py-2 md:px-3.5 md:py-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 tracking-wider uppercase rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white shrink-0"
            title="Salir"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          {/* PROGRESS TRACKER (Fills center) */}
          <div className="flex-1 bg-[#020925]/80 p-0.5 md:p-1 rounded-xl border border-white/10 shadow-lg mx-1">
            <div className="h-2.5 md:h-3 bg-[#05144b] rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                className="bg-gradient-to-r from-[#0A2E9E] to-[#00d2ff] h-full rounded-lg shadow-[0_0_10px_rgba(0,210,255,0.5)]"
              />
            </div>
          </div>

          {/* DYNAMIC COUNTDOWN TIMER (MM:SS) */}
          <div className="flex items-center gap-1.5 bg-[#FFC83D]/10 border border-[#FFC83D]/30 px-2.5 py-2 md:px-3.5 md:py-2 rounded-xl text-[#FFC83D] shrink-0 text-xs font-mono font-black">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedTimeLeft}</span>
          </div>
        </div>

        {/* Small subtitle with Question progress */}
        <div className="w-full flex justify-between items-center px-1 text-[10px] md:text-xs font-bold font-sans text-slate-400 uppercase tracking-widest">
          <span>Pregunta {currentQuestionNumber} de {totalQuestions}</span>
          <span className="hidden sm:inline">Selecciona la respuesta correcta</span>
        </div>
      </div>

      {/* CORE CONTENT (Split layout: Question on Left, Lion Assistant on Right) */}
      <div className="relative flex-1 w-full max-w-5xl mx-auto px-4 pt-4 pb-[80px] lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT PANEL: ACTIVE QUESTION CARD (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col justify-center">
          <div className="bg-[#05144b]/60 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px] border border-white/10 shadow-2xl transition-all flex flex-col justify-between">
            
            {/* Header / Instructions */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#00d2ff]">
                Selecciona la respuesta correcta.
              </span>
            </div>

            {/* Question Text in English */}
            <div className="my-3 sm:my-6 min-h-[50px] sm:min-h-[90px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="text-lg sm:text-2xl md:text-3xl lg:text-3.5xl font-sans font-black text-white leading-tight uppercase text-left"
                >
                  {/_{2,}/.test(currentQuestion.text) ? (
                    (() => {
                      const parts = currentQuestion.text.split(/_{2,}/);
                      return (
                        <>
                          {parts[0]}
                          <span className="inline-block min-w-[70px] border-b-[4px] border-[#00d2ff] mx-2 text-[#00d2ff] px-2 text-center select-none font-bold">
                            _____
                          </span>
                          {parts[1]}
                        </>
                      );
                    })()
                  ) : (
                    currentQuestion.text
                  )}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Horizontal Lion Dialog for mobile screens (Duolingo style) */}
            <div className="lg:hidden flex items-center gap-3 mb-4 bg-[#05144b]/80 border border-white/10 p-2 rounded-xl">
              <img 
                src={
                  selectedAnswers[currentQuestion.id] === undefined
                    ? '/assets/images/lion_quiz_thoughtful.png'
                    : currentIndex % 2 === 0
                    ? '/assets/images/lion_quiz_pointer.png'
                    : '/assets/images/lion_quiz_presenter.png'
                } 
                alt="Leo el Asistente" 
                className="w-11 h-11 object-contain shrink-0 rounded-full border border-white/20 bg-white/5 shadow-inner"
              />
              <div className="relative flex-1 bg-[#1736D1] text-white py-1.5 px-2.5 rounded-lg text-[10.5px] font-bold leading-snug shadow-[0_4px_12px_rgba(23,54,209,0.3)]">
                {/* Speech bubble pointer indicator */}
                <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#1736D1] rotate-45 border-l border-b border-[#1736D1]" />
                <p className="relative z-10">{mascotRemark || '¡Tómate tu tiempo para responder!'}</p>
              </div>
            </div>

            {/* ANSWER OPTIONS - 2X2 GRID SYSTEM AS PER DESIGN IMAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
              <AnimatePresence mode="popLayout">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === idx;
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isHovered = hoveredIndex === idx;
                  const coords = mouseCoords[idx] || { x: 0, y: 0 };
                  
                  return (
                    <motion.button
                      key={`${currentIndex}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => handleSelectOption(idx)}
                      onMouseMove={(e) => handleMouseMove(e, idx)}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        '--mouse-x': `${coords.x}px`,
                        '--mouse-y': `${coords.y}px`,
                      } as React.CSSProperties}
                      className={`group w-full text-left p-3.5 md:p-4.5 rounded-xl md:rounded-2xl border transition-all duration-200 relative cursor-pointer select-none overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#0A2E9E] to-[#1736D1] border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.4)]'
                          : 'bg-[#020925]/60 border-white/5 hover:border-[#1736D1]/40 hover:bg-[#05144b]/50 hover:translate-x-0.5'
                      }`}
                    >
                      {/* Aceternity UI Spotlight Card Glow Background overlay */}
                      {isHovered && !isSelected && (
                        <div
                          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-100 rounded-2xl"
                          style={{
                            background: `radial-gradient(100px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(0, 210, 255, 0.12), transparent)`,
                          }}
                        />
                      )}
                      
                      <div className="flex items-center gap-3 relative z-10">
                        {/* Selected Radio Indicator with Letter (A, B, C, D) */}
                        <div
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center shrink-0 font-sans font-extrabold text-xs md:text-sm transition-all ${
                            isSelected
                              ? 'border-[#00d2ff] bg-[#00d2ff] text-[#020925]'
                              : 'border-white/10 bg-white/5 text-slate-300 group-hover:border-[#00d2ff] group-hover:text-white'
                          }`}
                        >
                          {letter}
                        </div>

                        <span
                          className={`text-xs sm:text-sm md:text-base font-sans font-extrabold tracking-wide transition-colors ${
                            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: LION DIALOG ASSISTANT (4 Columns) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center">
          <div className="w-full flex justify-center items-center h-full max-w-sm">
            <MascotLion
              state={
                selectedAnswers[currentQuestion.id] === undefined
                  ? 'quiz_thinking'
                  : currentIndex % 2 === 0
                  ? 'quiz_pointer'
                  : 'quiz_presenter'
              }
              speechBubbleText={mascotRemark}
              className="w-full"
            />
          </div>
        </div>

      </div>

      {/* FOOTER ACTIONS BAR - Fixed on mobile, relative on desktop (Duolingo style) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#020925]/95 backdrop-blur-lg border-t border-white/10 p-2.5 sm:p-4 lg:relative lg:bg-transparent lg:border-t-0 lg:p-0 lg:max-w-5xl lg:mx-auto lg:px-4 lg:pb-6 lg:z-auto">
        <div className="bg-[#05144b]/60 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex items-center justify-between gap-4 shadow-xl max-w-5xl mx-auto">
          {/* Back Navigation */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-3 text-[10px] sm:text-xs font-extrabold font-sans text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none rounded-lg sm:rounded-xl hover:bg-white/5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          {/* Continue Trigger */}
          <button
            onClick={handleNext}
            disabled={!isSelected}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 md:px-8 md:py-4.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md ${
              isSelected
                ? 'bg-gradient-to-r from-[#FFC83D] to-[#E08B00] text-[#020925] hover:scale-103 shadow-[0_0_20px_rgba(255,200,61,0.25)] cursor-pointer animate-shine'
                : 'bg-white/5 text-slate-500 cursor-not-allowed shadow-none'
              }`}
          >
            <span>
              {currentQuestionNumber === totalQuestions ? 'Ver mi resultado' : 'Siguiente pregunta'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
