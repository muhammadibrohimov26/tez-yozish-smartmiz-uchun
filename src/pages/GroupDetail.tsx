import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Copy, Check, Zap, Swords, LogOut } from 'lucide-react';
import { useGroupDetail, leaveGroup } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { useBattle } from '../hooks/useBattle';
import type { Difficulty } from '../types';

export default function GroupDetail({ isDarkMode }: { isDarkMode: boolean }) {
  const { id } = useParams<{ id: string }>();
  const { group, members, results, loading } = useGroupDetail(id);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  const { activeBattles, createBattle } = useBattle(id);
  const [showBattleMenu, setShowBattleMenu] = React.useState(false);
  const [battleDifficulty, setBattleDifficulty] = React.useState<Difficulty>('medium');

  const handleCreateBattle = async (type: 'group' | '1v1', rounds: 3 | 5) => {
    if (!user || !profile) return;
    const battleId = await createBattle(user.uid, profile.displayName, type, battleDifficulty, rounds);
    if (battleId) {
      navigate(`/groups/${id}/battle/${battleId}`);
    }
  };

  // The group owner is not offered this: leaving would strand the group with no
  // owner. They delete it from the admin panel instead.
  const isGroupOwner = group?.ownerId === user?.uid;

  const handleLeave = async () => {
    if (!id || !user) return;
    if (!window.confirm("Guruhdan chiqmoqchimisiz? Reytingdagi natijalaringiz o'chib ketadi.")) return;
    try {
      await leaveGroup(id, user.uid);
      navigate('/groups');
    } catch (e) {
      console.error('Guruhdan chiqishda xatolik:', e);
      alert("Guruhdan chiqishda xatolik yuz berdi.");
    }
  };

  if (loading) return <div className="text-center py-20 opacity-30">Yuklanmoqda...</div>;
  if (!group) return <div className="text-center py-20 opacity-30">Guruh topilmadi</div>;

  const card = `rounded-[24px] border p-6 transition-all ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`;
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/groups')} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black tracking-tighter">{group.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-sm font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{group.code}</span>
              <button onClick={() => { navigator.clipboard.writeText(group.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="opacity-40 hover:opacity-100 transition-opacity">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <span className={`text-sm ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>• {members.length} a'zo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button onClick={() => setShowBattleMenu(!showBattleMenu)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}>
            <Swords className="w-4 h-4" /> Jang yaratish
          </button>
          
          {showBattleMenu && (
            <div className={`absolute top-full right-0 mt-2 w-64 rounded-2xl border shadow-xl overflow-hidden z-50 ${isDarkMode ? 'border-white/10 bg-gray-900' : 'border-gray-200 bg-white'}`}>
              
              {/* Difficulty Selector */}
              <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-black/5 dark:bg-white/5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Daraja tanlang</div>
                <div className="flex gap-1">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setBattleDifficulty(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${battleDifficulty === d ? 'bg-indigo-500 text-white shadow-md' : isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                      {d === 'easy' ? 'Oson' : d === 'medium' ? "O'rta" : 'Qiyin'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">Guruhaviy Jang (Hamma)</div>
              <button onClick={() => handleCreateBattle('group', 3)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>3 Raund (60 soniya)</button>
              <button onClick={() => handleCreateBattle('group', 5)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-all border-b ${isDarkMode ? 'border-white/10 hover:bg-white/10' : 'border-gray-100 hover:bg-gray-50'}`}>5 Raund (60 soniya)</button>
              
              <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-white/5 bg-black/5 dark:bg-white/5">1 ga 1 (Duels)</div>
              <button onClick={() => handleCreateBattle('1v1', 3)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>3 Raund (60 soniya)</button>
              <button onClick={() => handleCreateBattle('1v1', 5)} className={`w-full text-left px-4 py-3 text-sm font-bold transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}>5 Raund (60 soniya)</button>
            </div>
          )}

          <button onClick={() => navigate(`/groups/${id}/test`)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Zap className="w-4 h-4" /> Yakkaxon test
          </button>

          {!isGroupOwner && (
            <button onClick={handleLeave} title="Guruhdan chiqish" aria-label="Guruhdan chiqish"
              className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-white/30 hover:text-rose-400 hover:bg-rose-500/10' : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'}`}>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active Battles */}
      {activeBattles.length > 0 && (
        <div className={card}>
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2 text-indigo-500">
            <Swords className="w-5 h-5" /> Faol Janglar
          </h3>
          <div className="space-y-3">
            {activeBattles.map(b => (
              <div key={b.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50'}`}>
                <div>
                  <span className="font-bold block">{b.creatorName}ning jangi</span>
                  <span className={`text-xs ${isDarkMode ? 'opacity-50' : 'text-gray-500'}`}>
                    {b.totalRounds} raund • {Object.keys(b.participants).length} ishtirokchi
                  </span>
                </div>
                <button onClick={() => navigate(`/groups/${id}/battle/${b.id}`)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all text-sm">
                  {b.status === 'waiting' ? 'Qo\'shilish' : 'Tomosha qilish'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Podium (Top 3) */}
      {members.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-8">
          {[1, 0, 2].map(idx => {
            const m = members[idx];
            if (!m) return null;
            const heights = ['h-32', 'h-24', 'h-20'];
            const sizes = ['text-4xl', 'text-3xl', 'text-2xl'];
            return (
              <div key={idx} className="flex flex-col items-center gap-2 w-28">
                <span className={sizes[idx]}>{medals[idx]}</span>
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${idx === 0 ? 'border-yellow-500' : idx === 1 ? 'border-gray-400' : 'border-amber-700'}`}>
                  {m.photoURL ? <img src={m.photoURL} alt={m.displayName || 'Avatar'} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-lg font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white">{(m.displayName || 'U').charAt(0).toUpperCase()}</div>}
                </div>
                <span className="text-sm font-bold truncate max-w-full">{m.displayName}</span>
                <span className="text-xs text-blue-500 font-bold">{m.averageWpm} WPM</span>
                <div className={`w-full ${heights[idx]} rounded-t-xl ${idx === 0 ? 'bg-gradient-to-t from-yellow-600/20 to-yellow-500/40' : idx === 1 ? 'bg-gradient-to-t from-gray-600/20 to-gray-400/30' : 'bg-gradient-to-t from-amber-800/20 to-amber-600/30'}`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings */}
      <div className={card}>
        <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Reyting
        </h3>
        {members.length === 0 ? (
          <p className="text-center py-8 opacity-30">Hali natijalar yo'q</p>
        ) : (
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={m.userId} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${m.userId === user?.uid ? (isDarkMode ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200') : ''}`}>
                <span className={`w-8 text-center font-display font-black ${i < 3 ? 'text-lg' : 'text-sm opacity-40'}`}>
                  {i < 3 ? medals[i] : `${i + 1}`}
                </span>
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  {m.photoURL ? <img src={m.photoURL} alt={m.displayName || 'Avatar'} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full">{(m.displayName || 'U').charAt(0).toUpperCase()}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm truncate block">{m.displayName}</span>
                  <span className={`text-xs ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>{m.totalTests} test</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-display font-black text-blue-500">{m.averageWpm}</span>
                  <span className={`text-xs block ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>o'rtacha WPM</span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-bold text-emerald-500">{m.bestWpm}</span>
                  <span className={`text-xs block ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>eng yaxshi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
