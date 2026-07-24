import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Settings, Trash2, Users, FolderKanban, RotateCcw } from 'lucide-react';
import { ZERO_STATS } from '../lib/resetStats';
import type { UserProfile, Group } from '../types';

export default function Admin({ isDarkMode }: { isDarkMode: boolean }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const resetMyStats = async () => {
    if (!user?.uid) return;
    if (!window.confirm("Barcha natijalaringizni 0 ga tushirishni tasdiqlaysizmi?")) return;
    try {
      await updateDoc(doc(db, 'typingUsers', user.uid), ZERO_STATS);
      localStorage.removeItem('typing_history');
      localStorage.removeItem('typing_streak_dates');
      window.location.reload();
    } catch (e) {
      console.error("Xatolik:", e);
    }
  };

  const resetAllUsers = async () => {
    if (!window.confirm("DIQQAT! Barcha foydalanuvchilarning natijalarini 0 ga tushirishni tasdiqlaysizmi?")) return;
    try {
      const usersSnap = await getDocs(collection(db, 'typingUsers'));
      const promises = usersSnap.docs.map(d =>
        updateDoc(doc(db, 'typingUsers', d.id), ZERO_STATS)
      );
      await Promise.all(promises);
      localStorage.removeItem('typing_history');
      localStorage.removeItem('typing_streak_dates');
      alert(`${usersSnap.docs.length} ta foydalanuvchi tozalandi!`);
      window.location.reload();
    } catch (e) {
      console.error("Xatolik:", e);
      alert("Xatolik yuz berdi!");
    }
  };
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!profile || !profile.isAdmin)) {
      navigate('/');
    }
  }, [profile, loading, navigate]);

  useEffect(() => {
    if (!profile?.isAdmin) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, 'typingUsers'));
        const usersData = usersSnap.docs.map(d => d.data() as UserProfile);
        setUsers(usersData.sort((a, b) => b.totalTests - a.totalTests));

        const groupsSnap = await getDocs(collection(db, 'groups'));
        const groupsData = groupsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
        setGroups(groupsData.sort((a, b) => b.memberCount - a.memberCount));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm("Rostdan ham bu guruhni o'chirib tashlamoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'groups', groupId));
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      alert("Guruhni o'chirishda xatolik yuz berdi.");
    }
  };

  if (loading || dataLoading) {
    return <div className="text-center py-20 opacity-50">Yuklanmoqda...</div>;
  }

  const cardClass = `rounded-3xl border p-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black">Sozlamalar</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tizimni boshqarish</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Groups Management */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-500">
            <FolderKanban className="w-5 h-5" /> Guruhlar ({groups.length})
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {groups.length === 0 ? (
              <p className="text-center py-8 opacity-50">Guruhlar mavjud emas</p>
            ) : (
              groups.map(g => (
                <div key={g.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isDarkMode ? 'bg-black/20 border-white/5 hover:border-white/10' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                  <div>
                    <h3 className="font-bold text-lg">{g.name}</h3>
                    <div className={`text-xs mt-1 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span>Kod: <span className="font-mono text-blue-500 font-bold">{g.code}</span></span>
                      <span>•</span>
                      <span>{g.memberCount} a'zo</span>
                      <span>•</span>
                      <span>Owner: {g.ownerName}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteGroup(g.id)}
                    className="p-2 rounded-lg text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                    title="Guruhni o'chirish"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Users Management */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-500">
            <Users className="w-5 h-5" /> Foydalanuvchilar ({users.length})
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {users.length === 0 ? (
              <p className="text-center py-8 opacity-50">Foydalanuvchilar mavjud emas</p>
            ) : (
              users.map(u => (
                <div key={u.uid} className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 text-white flex items-center justify-center font-bold">
                    {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" /> : u.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{u.displayName}</h3>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-blue-500 block">{u.averageWpm} WPM</span>
                    <span className={`text-[10px] uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{u.totalTests} test</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats Reset */}
      <div className={`rounded-3xl border p-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
          <RotateCcw className="w-5 h-5" /> Statistika boshqaruvi
        </h2>
        <div className="space-y-4">
          <div>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Faqat o'z natijalaringizni tozalash</p>
            <button
              onClick={resetMyStats}
              className="flex items-center justify-center gap-2 py-3 px-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Mening reytingimni 0 ga tushirish</span>
            </button>
          </div>
          <div className={`pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Barcha foydalanuvchilarning natijalarini tozalash</p>
            <button
              onClick={resetAllUsers}
              className="flex items-center justify-center gap-2 py-3 px-5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Hamma userlarni 0 ga tushirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
