import React, { useState } from 'react';

interface AICoachModalProps {
  isOpen: boolean;
  songTitle?: string;
  onClose: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({ isOpen, songTitle = 'Flowers', onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Hi Alex! I'm your AI Singing & Pronunciation Coach. How can I help you master "${songTitle}" today? Ask about pronunciation tips, rhythm, or lyric meaning!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle,
          userQuery: userMsg
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || `Great question! Focus on holding your breath smoothly and blending words naturally.`
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Focus on linking vowels! In "${songTitle}", keep your jaw relaxed and let the pitch slide naturally.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl h-[80vh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden relative animate-fadeIn">
        {/* Header */}
        <div className="bg-[#3525cd] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base">AI Vocal & Pronunciation Coach</h3>
              <p className="text-[11px] text-[#dad7ff]">Powered by Gemini AI • Active on "{songTitle}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcf8ff]">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#3525cd] text-white rounded-tr-none font-medium'
                    : 'bg-white text-[#1b1b24] rounded-tl-none border border-outline-variant/30 shadow-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl border border-outline-variant/30 text-xs text-[#777587] flex items-center gap-2">
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                <span>AI Coach is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 bg-white border-t border-outline-variant/20 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Coach for vocal or pronunciation tips..."
            className="flex-1 px-4 py-2.5 bg-[#f5f2ff] border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-[#3525cd]/20"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="w-10 h-10 rounded-full bg-[#3525cd] text-white flex items-center justify-center hover:bg-[#4f46e5] disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
