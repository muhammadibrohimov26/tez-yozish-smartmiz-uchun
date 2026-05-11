import React from 'react';
import { Trophy } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';

export default function Leaderboard({ isDarkMode }: { isDarkMode: boolean }) {
  const { entries, loading } = useLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const card = `rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" /> Global Reyting
        </h1>
        <p className={`text-sm ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>Eng tez yozuvchilar</p>
      </div>

      {/* Top 3 Podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 sm:gap-6 py-6">
          {[1, 0, 2].map(idx => {
            const e = entries[idx];
            if (!e) return null;
            const heights = ['h-28', 'h-20', 'h-16'];
            const sizes = ['text-3xl', 'text-2xl', 'text-xl'];
            const borders = ['border-yellow-500', 'border-gray-400', 'border-amber-700'];
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 w-24 sm:w-32">
                <span className={sizes[idx]}>{medals[idx]}</span>
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${borders[idx]}`}>
                  {e.photoURL ? <img src={e.photoURL} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-lg font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{e.displayName.charAt(0).toUpperCase()}</div>}
                </div>
                <span className="text-xs font-bold truncate max-w-full">{e.displayName}</span>
                <span className="text-sm font-display font-black text-blue-500">{e.bestWpm} WPM</span>
                <div className={`w-full ${heights[idx]} rounded-t-xl ${idx === 0 ? 'bg-gradient-to-t from-yellow-600/20 to-yellow-500/40' : idx === 1 ? 'bg-gradient-to-t from-gray-600/20 to-gray-400/30' : 'bg-gradient-to-t from-amber-800/20 to-amber-600/30'}`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Table Header */}
      <div className={card}>
        {loading ? (
          <p className="text-center py-12 opacity-30">Yuklanmoqda...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-bold mb-1">Hali natijalar yo'q</p>
            <p className={`text-sm ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>Birinchi bo'lib test topshiring!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Header */}
            <div className={`hidden sm:grid grid-cols-[40px_1fr_90px_90px_80px_100px] gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'opacity-20' : 'text-gray-400'}`}>
              <span>#</span>
              <span>Foydalanuvchi</span>
              <span className="text-center">Eng yaxshi</span>
              <span className="text-center">O'rtacha</span>
              <span className="text-center">Testlar</span>
              <span className="text-right">Belgilar</span>
            </div>

            {entries.map((e, i) => (
              <div key={e.userId} className={`flex flex-col sm:grid sm:grid-cols-[40px_1fr_90px_90px_80px_100px] gap-2 sm:gap-3 items-center p-3 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${i < 3 ? (isDarkMode ? 'bg-white/[0.02]' : 'bg-blue-50/30') : ''}`}>
                {/* Rank */}
                <span className={`font-display font-black ${i < 3 ? 'text-xl' : 'text-sm opacity-40'} hidden sm:block`}>
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>

                {/* User info */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className={`font-display font-black sm:hidden ${i < 3 ? 'text-lg' : 'text-sm opacity-40'}`}>
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    {e.photoURL ? <img src={e.photoURL} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full">{e.displayName.charAt(0).toUpperCase()}</div>}
                  </div>
                  <span className="font-semibold text-sm truncate">{e.displayName}</span>
                </div>

                {/* Stats row (mobile: horizontal, desktop: grid columns) */}
                <div className="flex sm:contents gap-4 w-full pl-12 sm:pl-0">
                  {/* Best WPM */}
                  <div className="sm:text-center">
                    <span className="text-lg font-display font-black text-blue-500">{e.bestWpm}</span>
                    <span className={`text-[10px] ml-0.5 sm:hidden ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>max</span>
                  </div>

                  {/* Average WPM */}
                  <div className="sm:text-center">
                    <span className="text-lg font-display font-bold text-emerald-500">{e.averageWpm}</span>
                    <span className={`text-[10px] ml-0.5 sm:hidden ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>avg</span>
                  </div>

                  {/* Total Tests */}
                  <div className="sm:text-center">
                    <span className={`text-sm font-bold ${isDarkMode ? 'opacity-60' : 'text-gray-600'}`}>{e.totalTests}</span>
                    <span className={`text-[10px] ml-0.5 sm:hidden ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>test</span>
                  </div>

                  {/* Total Characters */}
                  <div className="sm:text-right">
                    <span className={`text-sm font-bold ${isDarkMode ? 'opacity-60' : 'text-gray-600'}`}>
                      {e.totalCorrectChars > 1000 ? `${(e.totalCorrectChars / 1000).toFixed(1)}k` : e.totalCorrectChars}
                    </span>
                    <span className={`text-[10px] ml-0.5 sm:hidden ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>belgi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
