import React, { useEffect, useState } from 'react';

export default function Confetti() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: Math.random() * -20 - 5, // start above screen
      size: Math.random() * 10 + 6, // size in px
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 4, // seconds delay
      duration: Math.random() * 3 + 2, // seconds duration
      rotation: Math.random() * 360,
      tilt: Math.random() * 20 - 10
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 999
    }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '0' : '50% 0 50% 0', // circles, squares, diamonds
            transform: `rotate(${p.rotation}deg) skewY(${p.tilt}deg)`,
            opacity: 0.8,
            animation: `fallAndSpin ${p.duration}s linear ${p.delay}s infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes fallAndSpin {
          0% {
            top: -5vh;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            top: 105vh;
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
