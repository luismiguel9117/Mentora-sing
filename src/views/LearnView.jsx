import React from 'react';
import { database } from '../data/words';
import Mascot from '../components/Mascot';

export default function LearnView({ completedLessons, onStartLesson }) {
  // A lesson is unlocked if it's the first one, or if the preceding lesson is completed.
  const isLessonUnlocked = (lessonId, unitIndex, lessonIndex) => {
    if (unitIndex === 0 && lessonIndex === 0) return true;
    
    // Find previous lesson
    let prevLessonId = null;
    if (lessonIndex > 0) {
      prevLessonId = database.units[unitIndex].lessons[lessonIndex - 1].id;
    } else if (unitIndex > 0) {
      const prevUnit = database.units[unitIndex - 1];
      prevLessonId = prevUnit.lessons[prevUnit.lessons.length - 1].id;
    }
    
    return prevLessonId ? completedLessons.includes(prevLessonId) : true;
  };

  return (
    <div className="view-container">
      <div className="learn-path">
        {/* Animated mascot at the top */}
        <Mascot 
          mood="happy" 
          text="¡Hola! ¿Listo para conquistar la ruta de inglés hoy? Haz clic en una lección para iniciar." 
        />

        {database.units.map((unit, unitIdx) => (
          <React.Fragment key={unit.id}>
            {/* Unit Banner */}
            <div className="unit-banner">
              <span className="unit-number">Unidad {unit.id}</span>
              <h2 className="unit-title">{unit.title}</h2>
              <p className="unit-description">{unit.description}</p>
            </div>

            {/* Path Nodes for this Unit */}
            <div className="path-nodes">
              {unit.lessons.map((lesson, lessonIdx) => {
                const completed = completedLessons.includes(lesson.id);
                const unlocked = isLessonUnlocked(lesson.id, unitIdx, lessonIdx);
                
                return (
                  <div key={lesson.id} className="path-node-wrapper">
                    {/* Tooltip on hover */}
                    <div className="node-tooltip">
                      <div style={{ fontWeight: 800, marginBottom: '4px' }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '8px' }}>
                        {lesson.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 700 }}>
                        Recompensa: +{lesson.xpReward} XP
                      </div>
                    </div>

                    <div className="node-button-container">
                      <button
                        className={`node-button ${completed ? 'completed' : ''} ${!unlocked ? 'locked' : ''}`}
                        onClick={() => unlocked && onStartLesson(lesson)}
                        disabled={!unlocked}
                      >
                        {completed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : !unlocked ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                      </button>
                      <span className="node-label">{lesson.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
