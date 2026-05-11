import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGroups } from '../hooks/useGroups';

export default function Groups({ isDarkMode }: { isDarkMode: boolean }) {
  const { user, profile } = useAuth();
  const { groups, loading, createGroup, joinGroup } = useGroups(user?.uid);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const { code } = await createGroup(groupName.trim(), profile?.displayName || 'Foydalanuvchi');
      setNewCode(code);
      setGroupName('');
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setSaving(true);
    setError('');
    try {
      const gid = await joinGroup(joinCode.trim(), profile?.displayName || '', profile?.photoURL || '');
      setShowJoin(false);
      setJoinCode('');
      navigate(`/groups/${gid}`);
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  const card = `rounded-[24px] border p-6 transition-all ${isDarkMode ? 'border-white/5 bg-white/5 hover:bg-white/[0.08]' : 'border-gray-200 bg-white hover:shadow-xl'}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter">Guruhlar</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>Do'stlaringiz bilan musobaqa qiling</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowJoin(true); setShowCreate(false); setError(''); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
            <ArrowRight className="w-4 h-4" /> Qo'shilish
          </button>
          <button onClick={() => { setShowCreate(true); setShowJoin(false); setNewCode(''); setError(''); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" /> Yaratish
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className={`${card} border-blue-500/30`}>
          {newCode ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-display font-bold">Guruh yaratildi!</h3>
              <p className={`text-sm ${isDarkMode ? 'opacity-50' : 'text-gray-500'}`}>Bu kodni do'stlaringizga yuboring:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-black tracking-[0.3em] text-blue-500">{newCode}</span>
                <button onClick={() => { navigator.clipboard.writeText(newCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 opacity-40" />}
                </button>
              </div>
              <button onClick={() => { setShowCreate(false); setNewCode(''); }} className="text-sm opacity-40 hover:opacity-100 transition-opacity">Yopish</button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-display font-bold">Yangi guruh</h3>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Guruh nomi..."
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-gray-50 border-gray-200 placeholder:text-gray-300'}`}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
              {error && <p className="text-rose-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm opacity-40 hover:opacity-100">Bekor</button>
                <button onClick={handleCreate} disabled={saving || !groupName.trim()} className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-40">
                  {saving ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className={`${card} border-blue-500/30`}>
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold">Guruhga qo'shilish</h3>
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="6 xonali kod..."
              className={`w-full px-4 py-3 rounded-xl border text-center text-2xl font-mono font-bold tracking-[0.3em] uppercase transition-all focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-gray-50 border-gray-200 placeholder:text-gray-300'}`}
              maxLength={6} onKeyDown={e => e.key === 'Enter' && handleJoin()} autoFocus />
            {error && <p className="text-rose-500 text-sm">{error}</p>}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowJoin(false)} className="px-4 py-2 rounded-xl text-sm opacity-40 hover:opacity-100">Bekor</button>
              <button onClick={handleJoin} disabled={saving || joinCode.length < 6} className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-40">
                {saving ? 'Qo\'shilmoqda...' : 'Qo\'shilish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-20 opacity-30">Yuklanmoqda...</div>
      ) : groups.length === 0 ? (
        <div className={`${card} text-center py-16`}>
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-display font-bold mb-2">Hali guruhlar yo'q</h3>
          <p className={`text-sm ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>Guruh yarating yoki mavjud guruhga qo'shiling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(g => (
            <div key={g.id} className={`${card} cursor-pointer group`} onClick={() => navigate(`/groups/${g.id}`)}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-display font-bold group-hover:text-blue-500 transition-colors">{g.name}</h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-lg ${isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'}`}>{g.code}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>
                  <Users className="w-4 h-4 inline mr-1" />{g.memberCount || g.memberIds?.length || 0} a'zo
                </span>
                <span className={`text-sm ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>
                  Yaratuvchi: {g.ownerName}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
