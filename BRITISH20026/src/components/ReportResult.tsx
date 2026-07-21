import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Clock, 
  Calendar,
  Volume2,
  MessageSquare,
  Languages
} from 'lucide-react';
import { EnglishLevelKey } from '../types';
import { QUESTIONS, LEVEL_DETAILS, getLevelWeights, getLevelThresholds } from '../data/questions';
import MascotLion from './MascotLion';
import BookingForm from './BookingForm';

interface ReportResultProps {
  responses: { questionId: number; selectedOption: number; isCorrect: boolean }[];
  onRestart: () => void;
  isExample?: boolean;
}

export default function ReportResult({
  responses,
  onRestart,
  isExample = false,
}: ReportResultProps) {
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [bookingType, setBookingType] = useState<'info' | 'consultation'>('info');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Calculate weighted difficulty score
  const scoreStats = useMemo(() => {
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    const weights = getLevelWeights();

    responses.forEach((resp) => {
      const q = QUESTIONS.find((item) => item.id === resp.questionId);
      if (!q) return;

      const weight = weights[q.level] || 1;

      totalPoints += weight;
      if (resp.isCorrect) {
        earnedPoints += weight;
        correctCount += 1;
      }
    });

    // Match CEFR level key based on dynamic percentage thresholds
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const thresholds = getLevelThresholds();
    let levelKey: EnglishLevelKey = 'B1'; // Default / base
    if (percentage >= thresholds.C1) levelKey = 'C1';
    else if (percentage >= thresholds.B2) levelKey = 'B2';
    else if (percentage >= thresholds.B1) levelKey = 'B1';
    else if (percentage >= thresholds.A2) levelKey = 'A2';
    else levelKey = 'A1';

    return {
      earnedPoints,
      totalPoints,
      percentage: Math.round(percentage),
      correctCount,
      levelKey,
    };
  }, [responses]);

  const levelInfo = useMemo(() => {
    return LEVEL_DETAILS[scoreStats.levelKey];
  }, [scoreStats.levelKey]);

  // Map detailed CEFR levels to broad level groups
  const getBroadLevelGroup = (level: EnglishLevelKey): 'Básico' | 'Intermedio' | 'Avanzado' => {
    if (level === 'A1' || level === 'A2') return 'Básico';
    if (level === 'B1' || level === 'B2') return 'Intermedio';
    return 'Avanzado';
  };

  const broadLevels = [
    { key: 'Básico', label: 'Básico' },
    { key: 'Intermedio', label: 'Intermedio' },
    { key: 'Avanzado', label: 'Avanzado' },
  ];

  // 2. Confetti Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * -height - 20;
        this.size = Math.random() * 8 + 6;
        const colors = ['#00D8FF', '#004BFF', '#6A11FF', '#FFC83D', '#FFFFFF', '#FF0055'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 5 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 3 - 1.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > height) {
          this.y = -20;
          this.x = Math.random() * width;
          this.speedY = Math.random() * 5 + 4;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        ctx.restore();
      }
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  const handleOpenBooking = (type: 'info' | 'consultation') => {
    setBookingType(type);
    setIsBookingOpen(true);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-10 px-4 md:px-8 bg-union-jack-grid overflow-hidden text-white">
      
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50 mix-blend-screen"
      />

      {/* Background spotlights */}
      <div className="absolute top-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-[#1736D1]/15 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-[#4A2DCC]/15 blur-[130px] pointer-events-none -z-10" />

      <div className="w-full max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* MAIN RESULTS CONTAINER (Matching exact structure in screenshot) */}
        <div className="bg-[#05144b]/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.4)] space-y-8">
          
          {/* Top Banner / Celebration text */}
          <div className="flex items-center gap-2 pb-4 border-b border-white/5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
            </span>
            <span className="text-xs font-mono font-bold text-green-400 uppercase tracking-widest">
              ¡Evaluación completada!
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT SIDE: Level estimation & shield badge */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <div>
                <p className="text-slate-300 text-sm font-sans font-bold uppercase tracking-wider">
                  Tu nivel estimado es:
                </p>
              </div>

              {/* Large Gold/Blue Shield Badge (Replaces basic text) */}
              <div className="relative w-44 h-52 flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(10,46,158,0.45)] select-none">
                <svg viewBox="0 0 100 120" className="w-full h-full fill-[#05144b] stroke-[#FFC83D] stroke-[3.5] drop-shadow-[0_0_15px_rgba(255,200,61,0.25)]">
                  <path d="M 50 5 C 90 5, 95 10, 95 50 C 95 85, 75 110, 50 118 C 25 110, 5 85, 5 50 C 5 10, 10 5, 50 5 Z" />
                  <path d="M 50 12 C 84 12, 88 16, 88 50 C 88 80, 71 101, 50 109 C 29 101, 12 80, 12 50 C 12 16, 16 12, 50 12 Z" fill="none" stroke="#FFC83D" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-3 px-4">
                  <span className={`font-sans font-black text-white tracking-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] uppercase ${
                    getBroadLevelGroup(scoreStats.levelKey) === 'Intermedio'
                      ? 'text-lg'
                      : getBroadLevelGroup(scoreStats.levelKey) === 'Avanzado'
                      ? 'text-xl'
                      : 'text-2xl'
                  }`}>
                    {getBroadLevelGroup(scoreStats.levelKey)}
                  </span>
                  <span className="text-[9px] font-mono font-black text-[#FFC83D] uppercase tracking-widest mt-2 px-2.5 py-1 bg-[#020925]/75 rounded-full border border-[#FFC83D]/25 whitespace-nowrap">
                    NIVEL ESTIMADO
                  </span>
                </div>
              </div>

              {/* Level Scale Timeline (Básico -> Avanzado) */}
              <div className="w-full space-y-3 pt-4">
                <div className="grid grid-cols-3 gap-3 relative text-center max-w-sm mx-auto">
                  {broadLevels.map((lvl) => {
                    const isCurrent = lvl.key === getBroadLevelGroup(scoreStats.levelKey);
                    return (
                      <div key={lvl.key} className="flex flex-col items-center">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-sans font-black text-sm transition-all duration-300 relative ${
                            isCurrent
                              ? 'bg-gradient-to-r from-[#FFC83D] to-[#E08B00] text-[#020925] border-2 border-white scale-110 shadow-[0_0_15px_rgba(255,200,61,0.5)] z-10'
                              : 'bg-white/5 border border-white/5 text-slate-500'
                          }`}
                        >
                          {lvl.key[0]}
                          {isCurrent && (
                            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFC83D] rotate-45" />
                          )}
                        </div>
                        <span className={`text-[10px] font-bold mt-2 font-sans leading-none ${isCurrent ? 'text-[#00d2ff]' : 'text-slate-500'}`}>
                          {lvl.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CENTER: Celebrating 3D mascot lion */}
            <div className="lg:col-span-3 flex justify-center items-center">
              <img 
                src="/assets/images/lion_result.png" 
                alt="Leo el León celebrando" 
                className="w-48 md:w-56 h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] animate-float-slow select-none"
              />
            </div>

            {/* RIGHT SIDE: Recommended Program card */}
            <div className="lg:col-span-4 bg-[#020925]/60 border border-white/10 p-6 rounded-[24px] shadow-inner text-left flex flex-col justify-between h-full min-h-[320px]">
              <div>
                <p className="text-[10px] font-mono font-bold text-[#FFC83D] uppercase tracking-widest block mb-2">
                  Programa recomendado
                </p>
                <h3 className="text-xl md:text-2xl font-sans font-black text-white tracking-tight leading-tight uppercase">
                  {levelInfo.recommendedProgram.name}
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed font-medium">
                  Ideal para desarrollar tus habilidades y alcanzar fluidez en situaciones reales.
                </p>

                {/* Specific 5 benefit checkmarks list */}
                <div className="mt-5 space-y-2.5">
                  {['Conversación', 'Comprensión auditiva', 'Gramática', 'Vocabulario', 'Fluidez y confianza'].map((item, idx) => {
                    const getIcon = () => {
                      switch (item) {
                        case 'Conversación':
                          return <MessageSquare className="w-3.5 h-3.5 text-[#00d2ff]" />;
                        case 'Comprensión auditiva':
                          return <Volume2 className="w-3.5 h-3.5 text-[#00d2ff]" />;
                        case 'Gramática':
                          return <BookOpen className="w-3.5 h-3.5 text-[#00d2ff]" />;
                        case 'Vocabulario':
                          return <Languages className="w-3.5 h-3.5 text-[#00d2ff]" />;
                        case 'Fluidez y confianza':
                          return <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />;
                        default:
                          return <CheckCircle2 className="w-3.5 h-3.5 text-[#00d2ff]" />;
                      }
                    };
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#00d2ff]/10 rounded-lg border border-[#00d2ff]/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,210,255,0.05)]">
                          {getIcon()}
                        </div>
                        <span className="text-xs font-sans font-bold text-slate-200">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3D Checklist floating at the bottom right of card */}
              <div className="flex justify-end mt-4">
                <img 
                  src="/assets/images/clipboard.png" 
                  alt="Checklist British House" 
                  className="w-16 h-auto object-contain drop-shadow-md animate-float-medium scale-x-[-1]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM ACTION CONVERSION BAR (Matching screenshot bottom footer segment) */}
        <div className="bg-[#05144b]/80 border border-white/10 p-5 rounded-[28px] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-left">
            <div className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center bg-white/5 shrink-0 text-[#00d2ff]">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-sans font-black uppercase text-white tracking-wider">
                ¿Listo para llevar tu inglés al siguiente nivel?
              </h4>
              <p className="text-xs text-slate-300 font-sans font-medium mt-0.5">
                Nuestro equipo está listo para ayudarte en todo momento.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Primary Yellow CTA button */}
            <button
              onClick={() => handleOpenBooking('info')}
              className="py-3.5 px-6 bg-[#FFC83D] hover:bg-[#ffe08a] text-[#020925] font-sans font-black tracking-wider uppercase rounded-xl shadow-[0_0_20px_rgba(255,200,61,0.3)] hover:shadow-[0_0_30px_rgba(255,200,61,0.5)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-xs animate-shine"
              id="cta-get-personalized-info"
            >
              <span>OBTENER INFORMACIÓN PERSONALIZADA</span>
            </button>

            {/* Secondary WhatsApp purple button */}
            <a
              href={`https://wa.me/51978957849?text=${encodeURIComponent(`Hola, acabo de completar el test de nivelación en línea. Obtuve un nivel ${getBroadLevelGroup(scoreStats.levelKey)} estimado y me gustaría recibir más información.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-6 bg-[#120b36] hover:bg-[#120b36]/80 text-white font-sans font-bold rounded-xl border border-white/15 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer text-xs text-center no-underline"
            >
              {/* Green WhatsApp fill icon */}
              <img src="/assets/images/whatsapp_green.svg" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
              <span>HABLAR CON UN ASESOR</span>
            </a>
          </div>
        </div>

        {/* DETAILS OF EXPLAINED ANSWERS ACCORDION */}
        {!isExample && (
          <div className="bg-[#05144b]/50 backdrop-blur-md rounded-3xl border border-white/10 shadow-lg overflow-hidden text-left">
          <button
            onClick={() => setShowAnswerReview(!showAnswerReview)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#0A2E9E]/20 text-[#FFC83D] border border-[#FFC83D]/30 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-sans font-black uppercase tracking-wider text-white">
                  Revisar Respuestas y Consejos Académicos
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5 font-medium">
                  Revisa cuáles respondiste bien y descubre el análisis gramatical detallado de Leo
                </p>
              </div>
            </div>

            <div className="text-slate-400">
              {showAnswerReview ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {showAnswerReview && (
            <div className="border-t border-white/10 p-6 space-y-6 bg-[#020925]/35">
              {QUESTIONS.map((question, index) => {
                const userResp = responses.find((r) => r.questionId === question.id);
                const userSelectedIdx = userResp ? userResp.selectedOption : undefined;
                const isCorrect = userResp ? userResp.isCorrect : false;

                return (
                  <div
                    key={question.id}
                    className="bg-[#05144b]/80 p-5 rounded-[24px] border border-white/5 shadow-inner space-y-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white bg-[#0A2E9E] border border-white/20 px-3 py-1 rounded">
                          P{index + 1}
                        </span>
                        <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">
                          Grupo {getBroadLevelGroup(question.level)}
                        </span>
                      </div>

                      {userSelectedIdx !== undefined ? (
                        isCorrect ? (
                          <span className="text-xs font-sans font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/30">
                            ✓ CORRECTO
                          </span>
                        ) : (
                          <span className="text-xs font-sans font-black text-red-400 bg-red-400/10 px-3 py-1 rounded-lg border border-red-400/30">
                            ✕ INCORRECTO
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-400">
                          SIN RESPONDER
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm md:text-base font-sans font-black text-white leading-relaxed">
                      {question.text}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {question.options.map((opt, optIdx) => {
                        const isSelected = userSelectedIdx === optIdx;
                        const isRightAnswer = question.correctAnswer === optIdx;

                        let cardStyle = 'border-white/5 bg-[#020925]/30 text-slate-350';
                        if (isRightAnswer) {
                          cardStyle = 'border-emerald-400/50 bg-[#10b981]/15 text-white font-extrabold';
                        } else if (isSelected && !isCorrect) {
                          cardStyle = 'border-red-400/50 bg-[#ef4444]/15 text-white';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${cardStyle}`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black ${
                                isRightAnswer
                                  ? 'bg-emerald-500 border-emerald-500 text-[#020925]'
                                  : isSelected && !isCorrect
                                  ? 'bg-red-500 border-red-500 text-white'
                                  : 'border-white/20 bg-white/5'
                              }`}
                            >
                              {isRightAnswer ? '✓' : isSelected && !isCorrect ? '✕' : ''}
                            </div>
                            <span className="truncate">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Speech bubble style explanations */}
                    <div className="bg-[#0A2E9E]/10 p-4 rounded-xl border border-[#FFC83D]/20 text-xs text-white/90">
                      <div className="leading-relaxed">
                        <span className="font-mono font-black text-[10px] text-[#FFC83D] uppercase tracking-wider block">
                          Consejo académico:
                        </span>
                        <p className="mt-1 text-slate-300 font-sans font-medium">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

      </div>

      {/* LEAD-CAPTURE CONTACT GATE DIALOG */}
      <BookingForm
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialType={bookingType}
        estimatedLevel={getBroadLevelGroup(scoreStats.levelKey)}
        recommendedProgram={levelInfo.recommendedProgram.name}
      />
    </div>
  );
}
