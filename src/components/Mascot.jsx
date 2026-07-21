import React, { useState, useEffect } from 'react';

export default function Mascot({ mood = 'happy', text }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getMascotExpressions = () => {
    switch (mood) {
      case 'sad': // when user loses a life
        return {
          eyes: (
            <>
              {/* Sad/droopy eyes */}
              <path d="M18 24 Q24 22 24 28" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M42 24 Q36 22 36 28" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ),
          mouth: <path d="M26 40 Q30 36 34 40" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" />,
          color: '#ef4444', // red tint
          glowColor: 'rgba(239, 68, 68, 0.4)'
        };
      case 'excited': // when user answers correctly or completes lesson
        return {
          eyes: (
            <>
              {/* Wink/Squint happy eyes */}
              <path d="M16 26 L24 22 L16 22 Z" fill="#f8fafc" />
              <path d="M44 26 L36 22 L44 22 Z" fill="#f8fafc" />
            </>
          ),
          mouth: <path d="M22 34 Q30 46 38 34" fill="#f8fafc" />,
          color: '#10b981', // green tint
          glowColor: 'rgba(16, 185, 129, 0.4)'
        };
      case 'happy':
      default:
        return {
          eyes: blink ? (
            <>
              {/* Blinking eyes */}
              <line x1="16" y1="24" x2="24" y2="24" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
              <line x1="36" y1="24" x2="44" y2="24" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Normal round eyes */}
              <circle cx="20" cy="24" r="5" fill="#f8fafc" />
              <circle cx="40" cy="24" r="5" fill="#f8fafc" />
            </>
          ),
          mouth: <path d="M24 36 Q30 42 36 36" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" fill="none" />,
          color: '#6265ff', // mentora blue
          glowColor: 'rgba(98, 101, 255, 0.4)'
        };
    }
  };

  const expression = getMascotExpressions();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '12px 20px',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1.5px solid var(--border)',
      borderRadius: '20px',
      backdropFilter: 'blur(8px)',
      width: 'fit-content',
      maxWidth: '380px',
      margin: '0.5rem auto',
      animation: 'mascotFloat 3s ease-in-out infinite'
    }}>
      {/* SVG Mascot Character (Mento) */}
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ overflow: 'visible' }}>
        {/* Antena */}
        <line x1="30" y1="12" x2="30" y2="4" stroke={expression.color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="30" cy="4" r="4" fill={expression.color} style={{
          filter: `drop-shadow(0 0 6px ${expression.color})`,
          animation: 'antennaPulse 1.5s infinite alternate'
        }} />

        {/* Head Base */}
        <rect x="8" y="12" width="44" height="38" rx="14" fill="#1e293b" stroke={expression.color} strokeWidth="3" style={{
          filter: `drop-shadow(0 4px 10px ${expression.glowColor})`
        }} />

        {/* Ears/Side Bolts */}
        <rect x="3" y="26" width="5" height="10" rx="2" fill={expression.color} />
        <rect x="52" y="26" width="5" height="10" rx="2" fill={expression.color} />

        {/* Face Elements */}
        {expression.eyes}
        {expression.mouth}

        {/* Cheek blushes */}
        {mood === 'happy' && (
          <>
            <circle cx="15" cy="30" r="2.5" fill="#f43f5e" opacity="0.5" />
            <circle cx="45" cy="30" r="2.5" fill="#f43f5e" opacity="0.5" />
          </>
        )}
      </svg>

      {/* Speech Bubble */}
      {text && (
        <div style={{
          position: 'relative',
          backgroundColor: 'white',
          color: '#0f172a',
          padding: '10px 14px',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          lineHeight: '1.3'
        }}>
          {text}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '100%',
            transform: 'translateY(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: 'transparent white transparent transparent'
          }} />
        </div>
      )}

      <style>{`
        @keyframes mascotFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        @keyframes antennaPulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
