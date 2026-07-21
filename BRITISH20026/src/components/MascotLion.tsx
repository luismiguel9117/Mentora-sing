import React, { useMemo } from 'react';

interface MascotLionProps {
  state?: 'welcome' | 'thinking' | 'encouraging' | 'success' | 'sample' | 'quiz_thinking' | 'quiz_pointer' | 'quiz_presenter';
  speechBubbleText?: string;
  className?: string;
}

export default function MascotLion({
  state = 'welcome',
  speechBubbleText,
  className = '',
}: MascotLionProps) {
  // Determine image and sizing based on state
  const { imageSrc, altText, showBubble, showStatus, statusLabel, defaultBubbleText } = useMemo(() => {
    switch (state) {
      case 'quiz_thinking':
        return {
          imageSrc: '/assets/images/lion_quiz_thoughtful.png',
          altText: 'Leo el León pensando',
          showBubble: true,
          showStatus: false,
          statusLabel: '',
          defaultBubbleText: 'Lee la pregunta con atención... 🤔',
        };
      case 'quiz_pointer':
        return {
          imageSrc: '/assets/images/lion_quiz_pointer.png',
          altText: 'Leo el León apuntando',
          showBubble: true,
          showStatus: false,
          statusLabel: '',
          defaultBubbleText: '¡Buena elección! ¿Listo para la siguiente? 👉',
        };
      case 'quiz_presenter':
        return {
          imageSrc: '/assets/images/lion_quiz_presenter.png',
          altText: 'Leo el León explicando',
          showBubble: true,
          showStatus: false,
          statusLabel: '',
          defaultBubbleText: '¡Excelente! Continuemos con paso firme 📚',
        };
      case 'thinking':
        return {
          imageSrc: '/assets/images/lion_pre.png',
          altText: 'Leo el León apuntando',
          showBubble: false,
          showStatus: false,
          statusLabel: 'Analizando...',
          defaultBubbleText: '',
        };
      case 'encouraging':
        return {
          imageSrc: '/assets/images/lion_quiz.png',
          altText: 'Leo el León motivando',
          showBubble: true,
          showStatus: false,
          statusLabel: '¡Sigue así!',
          defaultBubbleText: '¡Muy bien! Sigue así 💪',
        };
      case 'success':
        return {
          imageSrc: '/assets/images/lion_result.png',
          altText: 'Leo el León victorioso',
          showBubble: false,
          showStatus: false,
          statusLabel: '¡Evaluación completada!',
          defaultBubbleText: '',
        };
      case 'welcome':
      default:
        return {
          imageSrc: '/assets/images/lion_hero.png',
          altText: 'Leo el León Thumbs Up',
          showBubble: false,
          showStatus: false,
          statusLabel: '',
          defaultBubbleText: '',
        };
    }
  }, [state]);

  const activeBubbleText = speechBubbleText || defaultBubbleText;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* 3D Soft Radial Glow behind the Mascot */}
      <div className="absolute w-[130%] h-[130%] rounded-full blur-[80px] opacity-40 -z-10 bg-radial from-[#1736D1]/30 via-transparent to-transparent pointer-events-none" />

      {/* RENDER WELCOME BADGES ONLY IN WELCOME STATE */}
      {state === 'welcome' && (
        <>
          {/* B2 Upper Intermediate - Top Center-Left */}
          <div className="absolute -top-[10%] left-[5%] z-20 animate-float-slow select-none">
            <img 
              src="/assets/images/badge_b2.png" 
              alt="B2 Upper Intermediate" 
              className="w-16 md:w-20 h-auto drop-shadow-[0_8px_16px_rgba(74,45,204,0.4)]"
            />
          </div>

          {/* A1 Beginner - Mid Left */}
          <div className="absolute top-[35%] -left-[2%] md:-left-[10%] z-20 animate-float-medium select-none">
            <img 
              src="/assets/images/badge_a1.png" 
              alt="A1 Beginner" 
              className="w-14 md:w-16 h-auto drop-shadow-[0_8px_16px_rgba(10,46,158,0.4)]"
            />
          </div>

          {/* Chat bubble - Bottom Left */}
          <div className="absolute bottom-[20%] left-[10%] z-20 animate-float-slow select-none">
            <div className="bg-[#1736D1]/90 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl shadow-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="6" cy="12" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="18" cy="12" r="2"/>
              </svg>
            </div>
          </div>

          {/* Certificate - Top Right */}
          <div className="absolute -top-[12%] right-[5%] z-20 animate-float-medium select-none">
            <img 
              src="/assets/images/badge_certificate.png" 
              alt="Official Certificate" 
              className="w-20 md:w-24 h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
            />
          </div>

          {/* Cambridge Badge - Mid Right */}
          <div className="absolute top-[30%] -right-[2%] md:-right-[20%] z-20 animate-float-fast select-none">
            <div className="bg-white text-slate-800 py-1.5 px-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 max-w-[130px] md:max-w-[160px] rotate-6">
              <img 
                src="/assets/images/badge_cambridge.png" 
                alt="Cambridge Shield" 
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-[8px] md:text-[9px] font-extrabold leading-snug font-sans text-left">
                Somos un Centro Preparador Cambridge
              </span>
            </div>
          </div>

          {/* UK Flag - Bottom Right */}
          <div className="absolute bottom-[18%] right-[8%] z-20 animate-float-slow select-none">
            <img 
              src="/assets/images/badge_uk_flag.png" 
              alt="United Kingdom" 
              className="w-14 md:w-16 h-auto rounded-lg border border-white/20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
            />
          </div>
        </>
      )}

      {/* DUOLINGO-STYLE SPEECH BUBBLE FOR ENCOURAGING STATE */}
      {showBubble && activeBubbleText && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-fit min-w-[140px] max-w-[200px] bg-gradient-to-r from-[#0A2E9E] to-[#4A2DCC] p-3 rounded-2xl shadow-[0_8px_24px_rgba(10,46,158,0.4)] border border-white/20 z-30 animate-fade-in">
          <div className="relative">
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#4A2DCC] border-r border-b border-white/20 rotate-45" />
            <p className="text-white font-sans text-xs font-extrabold text-center leading-snug">
              {activeBubbleText}
            </p>
          </div>
        </div>
      )}

      {/* THE MAIN LION IMAGE */}
      <div 
        className="relative flex items-center justify-center"
        style={state === 'welcome' ? {
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 95%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 76%, rgba(0,0,0,0) 95%)'
        } : undefined}
      >
        <img
          src={imageSrc}
          alt={altText}
          className={`object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)] transition-all duration-500 hover:scale-[1.03] select-none ${
            state === 'welcome' 
              ? 'w-64 md:w-[20rem] lg:w-[22rem] h-auto' 
              : state === 'success' 
              ? 'w-48 md:w-56 h-auto' 
              : state.startsWith('quiz_')
              ? 'h-72 md:h-96 lg:h-[27rem] w-auto'
              : 'w-32 h-auto'
          }`}
        />
      </div>

      {/* STATUS LABEL */}
      {showStatus && statusLabel && (
        <span className="mt-4 text-[10px] font-mono text-[#FFC83D] bg-[#0A2E9E]/40 px-4 py-1.5 rounded-full border border-[#FFC83D]/40 font-extrabold tracking-widest uppercase text-glow-yellow">
          {statusLabel}
        </span>
      )}
    </div>
  );
}
