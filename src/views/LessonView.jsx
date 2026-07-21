import React, { useState, useEffect } from 'react';
import { sounds } from '../components/SoundManager';
import Confetti from '../components/Confetti';
import Mascot from '../components/Mascot';

export default function LessonView({ lesson, stats, onDeductHeart, onCompleteLesson, onClose }) {
  const [stage, setStage] = useState('intro'); // 'intro' | 'quiz' | 'completed' | 'gameover'
  const [introIndex, setIntroIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // If hearts hit 0, go to gameover stage
  useEffect(() => {
    if (stats.hearts === 0) {
      setStage('gameover');
      sounds.playIncorrect();
    }
  }, [stats.hearts]);

  // Audio Pronunciation using SpeechSynthesis
  const handlePlayAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger audio on loading word intro
  useEffect(() => {
    if (stage === 'intro' && lesson.words[introIndex]) {
      // Small timeout to allow render and sound initialisation
      const timer = setTimeout(() => {
        handlePlayAudio(lesson.words[introIndex].audioText);
        sounds.playIntro();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stage, introIndex, lesson]);

  // Flashcards navigation
  const handleIntroNext = () => {
    if (introIndex < lesson.words.length - 1) {
      setIntroIndex(prev => prev + 1);
    } else {
      setStage('quiz');
      setActiveStep(0);
    }
  };

  // Quizzes Checking
  const activeQuiz = lesson.quizzes[activeStep];

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    const correct = selectedOption === activeQuiz.correctIndex;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      sounds.playCorrect();
    } else {
      sounds.playIncorrect();
      onDeductHeart(); // reduces heart count in parent state
    }
  };

  const handleNextQuiz = () => {
    setIsChecked(false);
    setSelectedOption(null);
    setIsCorrect(false);

    if (activeStep < lesson.quizzes.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      // Completed lesson
      setStage('completed');
      sounds.playCompleted();
      onCompleteLesson(lesson.id, lesson.xpReward);
    }
  };

  const renderMascotHelper = () => {
    if (stage === 'intro') {
      return (
        <Mascot 
          mood="happy" 
          text="Esta es una palabra clave. ¡Presta atención a su significado y al fragmento de video!" 
        />
      );
    }
    if (stage === 'quiz') {
      if (!isChecked) {
        return (
          <Mascot 
            mood="happy" 
            text="Lee la pregunta y selecciona la respuesta correcta. ¡Tú puedes!" 
          />
        );
      } else {
        return isCorrect ? (
          <Mascot mood="excited" text="¡Súper! ¡Esa es la respuesta correcta!" />
        ) : (
          <Mascot mood="sad" text="¡Oh no! Ánimo, los errores son parte del aprendizaje." />
        );
      }
    }
    return null;
  };

  // Calculate overall progress percentage
  const totalSteps = lesson.words.length + lesson.quizzes.length;
  const currentProgressSteps = stage === 'intro' 
    ? introIndex 
    : lesson.words.length + activeStep;
  const progressPercent = (currentProgressSteps / totalSteps) * 100;

  // Render content based on stage
  if (stage === 'gameover') {
    return (
      <div className="lesson-page">
        <div className="lesson-body" style={{ flexDirection: 'column' }}>
          <div className="gameover-layout">
            <div className="gameover-icon">💔</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>¡Te quedaste sin vidas!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              No te preocupes, los errores son parte del aprendizaje. ¡Practica en el diccionario o vuelve a intentarlo!
            </p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <button className="btn-3d btn-primary" style={{ flex: 1 }} onClick={onClose}>
                Volver a la Ruta
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'completed') {
    return (
      <div className="lesson-page" style={{ position: 'relative' }}>
        <Confetti />
        <div className="lesson-body" style={{ flexDirection: 'column' }}>
          <div className="completed-layout">
            <div className="completed-badge-icon">🏆</div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>¡Lección Completada!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Has aprendido nuevas palabras clave y consolidado tu aprendizaje interactivo. ¡Excelente trabajo!
            </p>

            <div className="stats-card-completed">
              <div className="completed-stat-box">
                <span className="completed-stat-num xp">+{lesson.xpReward}</span>
                <span className="completed-stat-label">XP Ganados</span>
              </div>
              <div className="completed-stat-box">
                <span className="completed-stat-num streak">{stats.streak}</span>
                <span className="completed-stat-label">Días de Racha</span>
              </div>
            </div>

            <button className="btn-3d btn-success" style={{ width: '100%', marginTop: '1rem' }} onClick={onClose}>
              Finalizar y Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active word flashcard introduction
  const currentWord = lesson.words[introIndex];

  return (
    <div className="lesson-page">
      {/* Lesson Progress Header */}
      <div className="lesson-header">
        <button className="close-lesson-btn" onClick={onClose} title="Salir de la lección">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="lesson-progress-bar-container">
          <div 
            className="lesson-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        <div className="stats-container">
          <div className={`stat-badge hearts ${stats.hearts === 0 ? 'empty' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>{stats.hearts}</span>
          </div>
        </div>
      </div>

      {/* Lesson Active Content */}
      <div className="lesson-body">
        {stage === 'intro' ? (
          <div className="lesson-card">
            <span className="lesson-question-title" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              Nueva palabra a aprender ({introIndex + 1}/{lesson.words.length})
            </span>

            {/* Interactive robot helper Mento */}
            {renderMascotHelper()}

            <div className="lesson-card-intro">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="intro-word-badge">Vocabulario Clave</span>
                <button
                  className="play-audio-btn"
                  onClick={() => handlePlayAudio(currentWord.audioText)}
                  title="Escuchar Pronunciación"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </button>
              </div>

              <h2 className="intro-word-text">{currentWord.word}</h2>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '-8px' }}>
                {currentWord.phonetic}
              </p>

              <div className="detail-meaning-block" style={{ borderLeftColor: 'var(--primary)' }}>
                <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{currentWord.meaning}</div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {currentWord.explanation}
                </p>
              </div>

              {/* Contextual Video */}
              <div className="video-container-wrapper">
                <iframe
                  title={currentWord.word}
                  src={currentWord.videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-caption">
                {currentWord.caption}
              </div>

              <div className="detail-example-block">
                <div className="example-title">En Oración</div>
                <p className="example-sentence">"{currentWord.example}"</p>
                <p className="example-translation">{currentWord.exampleTranslation}</p>
              </div>
            </div>
            
            <button className="btn-3d btn-primary" onClick={handleIntroNext}>
              Comprendido, Siguiente
            </button>
          </div>
        ) : (
          /* Quiz Challenge Screen */
          <div className="lesson-card">
            <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pregunta de Prueba ({activeStep + 1}/{lesson.quizzes.length})
            </span>

            {/* Interactive robot helper Mento */}
            {renderMascotHelper()}

            <h3 className="lesson-question-title">{activeQuiz.question}</h3>

            {/* If the quiz type requires video embed */}
            {activeQuiz.videoUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="video-container-wrapper" style={{ maxHeight: '200px', paddingBottom: '35%' }}>
                  <iframe
                    title="Quiz Context"
                    src={`${activeQuiz.videoUrl}&autoplay=0&mute=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Haz clic en reproducir para escuchar/ver el video de apoyo.
                </span>
              </div>
            )}

            {/* Quiz Options */}
            <div className="quiz-options-list">
              {activeQuiz.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`quiz-option-button ${selectedOption === idx ? 'selected' : ''}`}
                  onClick={() => !isChecked && setSelectedOption(idx)}
                  disabled={isChecked}
                >
                  <span style={{
                    display: 'inline-flex',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    backgroundColor: selectedOption === idx ? 'var(--primary)' : 'var(--bg-main)',
                    borderColor: selectedOption === idx ? 'var(--primary)' : 'var(--border)'
                  }}>
                    {idx + 1}
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* Button to Check (only visible when drawer is not active) */}
            {!isChecked && (
              <button
                className="btn-3d btn-primary"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null}
                style={{ marginTop: '0.5rem' }}
              >
                Comprobar Respuesta
              </button>
            )}
          </div>
        )}
      </div>

      {/* Answer Feedback Drawer (Only active when answers are checked) */}
      {isChecked && (
        <div className={`feedback-drawer ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-content">
            <div className="feedback-message-block">
              <div className="feedback-icon-box">
                {isCorrect ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                )}
              </div>
              <div>
                <h4 className="feedback-text-title">
                  {isCorrect ? '¡Excelente trabajo!' : 'Respuesta incorrecta'}
                </h4>
                <p className="feedback-text-subtitle">
                  {isCorrect 
                    ? '¡Sigue así, vas por muy buen camino!' 
                    : `La respuesta correcta era: ${activeQuiz.options[activeQuiz.correctIndex]}`}
                </p>
              </div>
            </div>
            
            <button 
              className={`btn-3d ${isCorrect ? 'btn-success' : 'btn-error'}`}
              onClick={handleNextQuiz}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
