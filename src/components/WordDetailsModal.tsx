import React from 'react';
import { WordAnnotation } from '../types';

interface WordDetailsModalProps {
  word: WordAnnotation | null;
  onClose: () => void;
}

export const WordDetailsModal: React.FC<WordDetailsModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-fadeIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#777587] hover:bg-[#f5f2ff] p-1.5 rounded-full"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3525cd]/10 text-[#3525cd] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">translate</span>
          </div>
          <div>
            <h3 className="font-headline font-extrabold text-2xl text-[#3525cd]">{word.word}</h3>
            <p className="text-xs font-semibold text-[#712ae2]">{word.phonetic}</p>
          </div>
        </div>

        <button
          onClick={speakWord}
          className="w-full py-2.5 bg-[#f5f2ff] hover:bg-[#eae6f4] text-[#3525cd] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">volume_up</span>
          Listen Pronunciation
        </button>

        <div className="space-y-2 pt-2 border-t border-outline-variant/20">
          <div>
            <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider block">Traducción</span>
            <p className="font-headline font-bold text-lg text-[#1b1b24]">{word.translation}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider block">Definición</span>
            <p className="text-xs text-[#464555]">{word.definition}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#777587] uppercase tracking-wider block">Ejemplo</span>
            <p className="text-xs font-medium text-[#3525cd] italic">"{word.example}"</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#3525cd] text-white font-bold text-xs rounded-2xl hover:bg-[#4f46e5] shadow-md transition-all mt-2"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
