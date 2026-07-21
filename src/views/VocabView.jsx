import React, { useState, useMemo, useEffect, useRef } from 'react';
import { database } from '../data/words';
import { sounds } from '../components/SoundManager';
import Mascot from '../components/Mascot';

export default function VocabView() {
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary' | 'game'
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState(null);

  // --- Dictionary Logic ---
  const allWords = useMemo(() => {
    const list = [];
    const seen = new Set();
    database.units.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        lesson.words.forEach((word) => {
          if (!seen.has(word.id)) {
            seen.add(word.id);
            list.push(word);
          }
        });
      });
    });
    return list;
  }, []);

  const filteredWords = useMemo(() => {
    const query = search.toLowerCase();
    return allWords.filter(
      (w) =>
        w.word.toLowerCase().includes(query) ||
        w.meaning.toLowerCase().includes(query)
    );
  }, [allWords, search]);

  const handlePlayAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // --- Matching Game Logic ---
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCardIds, setMatchedCardIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  const timerRef = useRef(null);

  // Initialize matching game
  const initGame = () => {
    // Take up to 6 words to create 12 cards
    const sliceWords = allWords.slice(0, 6);
    const cards = [];
    
    sliceWords.forEach((w) => {
      cards.push({
        id: w.id + '_en',
        wordId: w.id,
        text: w.word,
        type: 'en'
      });
      cards.push({
        id: w.id + '_es',
        wordId: w.id,
        text: w.meaning,
        type: 'es'
      });
    });

    // Shuffle cards
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedCardIds(new Set());
    setMoves(0);
    setSeconds(0);
    setGameCompleted(false);
    setIsEvaluating(false);

    // Reset timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Start game when entering tab
  useEffect(() => {
    if (activeTab === 'game') {
      initGame();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTab]);

  // Stop timer when game completes
  useEffect(() => {
    if (gameCompleted && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameCompleted]);

  // Handle card click
  const handleCardClick = (card) => {
    if (isEvaluating) return;
    if (matchedCardIds.has(card.id)) return;
    if (selectedCards.some((c) => c.id === card.id)) return;

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsEvaluating(true);
      setMoves((prev) => prev + 1);
      const [card1, card2] = newSelected;

      // Check if they correspond to the same word but are different types (en/es)
      if (card1.wordId === card2.wordId && card1.type !== card2.type) {
        // Match!
        setTimeout(() => {
          sounds.playCorrect();
          setMatchedCardIds((prev) => {
            const updated = new Set(prev);
            updated.add(card1.id);
            updated.add(card2.id);
            
            // Check if all matched
            if (updated.size === gameCards.length) {
              setGameCompleted(true);
              sounds.playCompleted();
            }
            return updated;
          });
          setSelectedCards([]);
          setIsEvaluating(false);
        }, 300);
      } else {
        // No match
        setTimeout(() => {
          sounds.playIncorrect();
          setSelectedCards([]);
          setIsEvaluating(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="view-container">
      {/* Navigation tabs between Dictionary and Mini-Game */}
      <div className="vocab-tabs-container">
        <button
          className={`vocab-tab-btn ${activeTab === 'dictionary' ? 'active' : ''}`}
          onClick={() => setActiveTab('dictionary')}
        >
          📖 Diccionario de Palabras
        </button>
        <button
          className={`vocab-tab-btn ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          🧩 Juego de Emparejar
        </button>
      </div>

      {activeTab === 'dictionary' ? (
        /* Dictionary View */
        <div className="vocab-layout">
          {/* Left Side: Search & Word List */}
          <div className="vocab-list-section">
            <div className="search-bar">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar palabra o significado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="words-grid">
              {filteredWords.length > 0 ? (
                filteredWords.map((item) => (
                  <div
                    key={item.id}
                    className={`word-card ${selectedWord?.id === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedWord(item)}
                  >
                    <div>
                      <h3 className="word-card-title">{item.word}</h3>
                      <div className="word-card-phonetic">{item.phonetic}</div>
                      <div className="word-card-meaning">{item.meaning}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron palabras.
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Detailed Word Card */}
          <div className="vocab-detail-panel">
            {selectedWord ? (
              <div className="vocab-detail-section">
                <div className="detail-header">
                  <div className="detail-title-block">
                    <h2>{selectedWord.word}</h2>
                    <p>{selectedWord.phonetic}</p>
                  </div>
                  <button
                    className="play-audio-btn"
                    onClick={() => handlePlayAudio(selectedWord.audioText)}
                    title="Escuchar Pronunciación"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </button>
                </div>

                <div className="detail-meaning-block">
                  <div className="detail-meaning">{selectedWord.meaning}</div>
                  <p className="detail-explanation">{selectedWord.explanation}</p>
                </div>

                <div className="video-container-wrapper">
                  <iframe
                    title={`Uso en contexto de ${selectedWord.word}`}
                    src={selectedWord.videoUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-caption">
                  {selectedWord.caption}
                </div>

                <div className="detail-example-block">
                  <div className="example-title">Ejemplo de Uso</div>
                  <p className="example-sentence">"{selectedWord.example}"</p>
                  <p className="example-translation">{selectedWord.exampleTranslation}</p>
                </div>
              </div>
            ) : (
              <div className="vocab-detail-section vocab-detail-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <h3>Selecciona una palabra</h3>
                <p>Elige una palabra de la lista para ver su significado, escuchar su pronunciación y verla en contexto en un fragmento de video.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Matching Game View */
        <div className="matching-game-layout">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Juego de Emparejar</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Encuentra las parejas correctas conectando las palabras en inglés con sus significados en español.
            </p>
          </div>

          {/* Interactive Mascot Mento */}
          {!gameCompleted ? (
            <Mascot 
              mood="happy" 
              text="¡A ver qué tan rápido eres! Haz clic en una palabra en inglés y luego en su significado en español." 
            />
          ) : (
            <Mascot 
              mood="excited" 
              text={`¡Espectacular! Completaste todas las parejas en ${moves} movimientos y te tomó ${seconds} segundos.`} 
            />
          )}

          {/* Game Stats Row */}
          <div className="game-stats-row">
            <div>Tiempo: <span style={{ color: 'var(--text-primary)' }}>{seconds}s</span></div>
            <div>Movimientos: <span style={{ color: 'var(--text-primary)' }}>{moves}</span></div>
            <button className="btn-3d btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={initGame}>
              🔄 Reiniciar
            </button>
          </div>

          {!gameCompleted ? (
            /* Active Game Cards Grid */
            <div className="memory-grid">
              {gameCards.map((card) => {
                const isSelected = selectedCards.some((c) => c.id === card.id);
                const isMatched = matchedCardIds.has(card.id);
                
                return (
                  <div
                    key={card.id}
                    className={`memory-card-game ${isSelected ? 'selected' : ''} ${isMatched ? 'matched' : ''}`}
                    onClick={() => handleCardClick(card)}
                  >
                    {card.text}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Game Completed Screen */
            <div className="game-completed-screen">
              <span style={{ fontSize: '4rem' }}>🎉</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>¡Juego Terminado con Éxito!</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '350px' }}>
                Has practicado el vocabulario clave de una forma divertida. ¡Tu cerebro te lo agradece!
              </p>
              <button className="btn-3d btn-success" style={{ width: '200px' }} onClick={initGame}>
                Jugar de Nuevo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
