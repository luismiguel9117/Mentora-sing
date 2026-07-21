import React from 'react';

export default function ProfileView({ stats, completedLessons }) {
  const achievements = [
    {
      id: 'first_step',
      title: 'Primer Paso',
      desc: 'Completa tu primera lección de vocabulario.',
      icon: '🌱',
      isUnlocked: completedLessons.length > 0
    },
    {
      id: 'streak_fire',
      title: 'En Fuego',
      desc: 'Consigue al menos 1 día de racha de estudio.',
      icon: '🔥',
      isUnlocked: stats.streak >= 1
    },
    {
      id: 'xp_collector',
      title: 'Coleccionista de XP',
      desc: 'Acumula un total de 50 XP o más.',
      icon: '⚡',
      isUnlocked: stats.xp >= 50
    },
    {
      id: 'vocab_master',
      title: 'Mentor de Vocabulario',
      desc: 'Completa todas las lecciones disponibles en la Unidad 1.',
      icon: '👑',
      isUnlocked: completedLessons.includes('u1_l1') && completedLessons.includes('u1_l2')
    }
  ];

  return (
    <div className="view-container">
      <div className="profile-grid">
        {/* Left Side: Avatar and Quick Stats */}
        <div className="profile-card-left">
          <div className="profile-avatar-big">U</div>
          <h2 className="profile-name">Estudiante Mentora</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-10px' }}>Miembro desde hoy</p>
          
          <div className="profile-badge-stats">
            <div className="profile-stat-pill">
              <span className="profile-stat-val streak">{stats.streak}</span>
              <span className="profile-stat-lbl">Racha Días</span>
            </div>
            <div className="profile-stat-pill">
              <span className="profile-stat-val xp">{stats.xp}</span>
              <span className="profile-stat-lbl">Total XP</span>
            </div>
          </div>
        </div>

        {/* Right Side: Achievements */}
        <div className="profile-card-right">
          <div className="achievements-section">
            <h3 className="section-subtitle">Logros y Medallas</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-6px', marginBottom: '0.5rem' }}>
              ¡Supera lecciones e incrementa tu racha para desbloquear estas medallas especiales!
            </p>

            <div className="achievements-list">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className={`achievement-item ${!item.isUnlocked ? 'locked' : ''}`}
                >
                  <div className="achievement-icon">{item.icon}</div>
                  <div className="achievement-body">
                    <span className="achievement-title">{item.title}</span>
                    <span className="achievement-desc">{item.desc}</span>
                  </div>
                  <div>
                    {item.isUnlocked ? (
                      <span className="achievement-status unlocked">Desbloqueado</span>
                    ) : (
                      <span className="achievement-status locked">Bloqueado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
