import React, { useMemo } from 'react';

export default function LeaderboardView({ stats }) {
  // Combine mocked leaderboard users with the actual user's XP
  const leaderboardData = useMemo(() => {
    const list = [
      { name: 'Ana Gómez', xp: 450, avatarBg: '#3b82f6', initials: 'AG' },
      { name: 'Diego Torres', xp: 380, avatarBg: '#10b981', initials: 'DT' },
      { name: 'Lucía Fernández', xp: 290, avatarBg: '#f59e0b', initials: 'LF' },
      { name: 'Tú (Estudiante)', xp: stats.xp, avatarBg: '#8b5cf6', initials: 'TÚ', isUser: true },
      { name: 'Marcos Silva', xp: 120, avatarBg: '#ec4899', initials: 'MS' },
      { name: 'Elena Ruiz', xp: 80, avatarBg: '#6366f1', initials: 'ER' }
    ];

    // Sort descending by XP
    return list.sort((a, b) => b.xp - a.xp);
  }, [stats.xp]);

  return (
    <div className="view-container">
      <div className="leaderboard-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>COMPETICIÓN DIARIA</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>División Mentores Platino</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            ¡Gana XP completando lecciones para ascender en el ranking! Los 3 primeros avanzan de liga.
          </p>
        </div>

        <div className="leaderboard-list">
          {leaderboardData.map((row, index) => {
            const rank = index + 1;
            return (
              <div
                key={row.name}
                className={`leaderboard-row ${row.isUser ? 'user-row' : ''}`}
              >
                <div className={`leaderboard-rank rank-${rank}`}>{rank}</div>
                
                <div
                  className="leaderboard-row-avatar"
                  style={{ backgroundColor: row.avatarBg }}
                >
                  {row.initials}
                </div>

                <div className="leaderboard-name">
                  {row.name}
                  {row.isUser && <span style={{ marginLeft: '10px', fontSize: '0.75rem', backgroundColor: 'var(--primary)', padding: '2px 6px', borderRadius: '8px', color: 'white', fontWeight: 700 }}>TÚ</span>}
                </div>

                <div className="leaderboard-row-xp">{row.xp} XP</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
