import React from 'react';

export const CommunityView: React.FC = () => {
  const leaderboard = [
    { rank: 1, name: 'Sofia M.', xp: '3,450 XP', country: '🇪🇸 Spain', streak: '24 Days', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' },
    { rank: 2, name: 'Lars O.', xp: '2,980 XP', country: '🇳🇴 Norway', streak: '19 Days', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop' },
    { rank: 3, name: 'Alex K. (You)', xp: '1,420 XP', country: '🇸🇪 Sweden', streak: '12 Days', isUser: true, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEujLKT3vOOjwY4GoRimBbluhFSJOtfPkxIIv4KMTkzOx8i_aYPyXVG0u4HUspqbEN0dqx5_uoKO-xpab8XRpfWFVVFziwsucokaziJWG-i70hF0G9dykRBbQoQrufTLNbV2-ZkHkJlqXgPu9lUBE3QSMpszdQ6LiWKGeUMWuic8n1DQTipQhhalMIZma5g7bySNPgKC_BpXWWpdEMgBpXDFMVyPB6P0E1W9IGja_c99s791U0xW-FJDQsiPfgQ98r0FgBWGAppUU' },
    { rank: 4, name: 'Elena R.', xp: '1,210 XP', country: '🇲🇽 Mexico', streak: '8 Days', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop' },
    { rank: 5, name: 'Kenji T.', xp: '990 XP', country: '🇯🇵 Japan', streak: '5 Days', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop' },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h2 className="font-headline text-3xl font-bold text-[#1b1b24] mb-1">Community Choir</h2>
        <p className="text-[#464555] text-sm">Compare progress, join weekly sing-alongs, and cheer fellow scholars.</p>
      </div>

      {/* Weekly Global Sing-along Banner */}
      <div className="bg-gradient-to-r from-[#3525cd] to-[#712ae2] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
            Weekly Choir Challenge
          </span>
          <h3 className="font-headline text-2xl font-extrabold mt-2 mb-1">"Flowers" Harmony Recording</h3>
          <p className="text-xs text-white/80 max-w-md">
            Join over 1,200 learners recording duet harmonies this week. Earn +100 bonus XP for community uploads!
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-[#3525cd] rounded-full font-bold text-xs hover:bg-slate-100 shadow-md transition-all active:scale-95 whitespace-nowrap">
          Join Choir Challenge
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg text-[#1b1b24]">Global Scholar Leaderboard</h3>
          <span className="text-xs font-bold text-[#3525cd] bg-[#f5f2ff] px-3 py-1 rounded-full">This Week</span>
        </div>

        <div className="space-y-2">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                user.isUser
                  ? 'bg-[#3525cd]/10 border-2 border-[#3525cd]/40 font-bold'
                  : 'bg-[#f5f2ff] hover:bg-[#eae6f4]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    user.rank === 1
                      ? 'bg-[#FFD700] text-black shadow-sm'
                      : user.rank === 2
                      ? 'bg-[#C0C0C0] text-black shadow-sm'
                      : user.rank === 3
                      ? 'bg-[#CD7F32] text-white shadow-sm'
                      : 'text-[#777587]'
                  }`}
                >
                  {user.rank}
                </span>

                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shadow-xs" />

                <div>
                  <p className="text-sm font-semibold text-[#1b1b24]">
                    {user.name} <span className="text-xs font-normal text-[#777587]">{user.country}</span>
                  </p>
                  <p className="text-[11px] text-[#7e3000] font-medium">🔥 {user.streak}</p>
                </div>
              </div>

              <span className="font-headline font-extrabold text-sm text-[#3525cd]">{user.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
