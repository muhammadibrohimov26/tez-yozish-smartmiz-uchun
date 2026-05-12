import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Pencil, Check, X, Palette } from 'lucide-react';
import { BADGES, getEarnedBadges, getStreak } from '../data/badges';
import { THEMES, getTheme, setTheme as saveTheme } from '../data/themes';
import type { ThemeColor, TestResult } from '../types';

export default function Profile({ isDarkMode, onThemeChange }: { isDarkMode: boolean; onThemeChange?: (color: ThemeColor) => void }) {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(getTheme());
  const card = `rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`;

  // History for progress chart
  const [history, setHistory] = useState<TestResult[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem('typing_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  if (!profile) return <div className="text-center py-20 opacity-30">Yuklanmoqda...</div>;

  const streak = getStreak();
  const earnedBadges = getEarnedBadges({
    totalTests: profile.totalTests,
    bestWpm: profile.bestWpm,
    averageWpm: profile.averageWpm,
    totalCorrectChars: profile.totalCorrectChars,
    streak,
  });

  const handleSaveName = async () => {
    if (!newName.trim() || !profile.uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'typingUsers', profile.uid), { displayName: newName.trim() });
      window.location.reload();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleThemeChange = (color: ThemeColor) => {
    setCurrentTheme(color);
    saveTheme(color);
    setShowThemes(false);
  };

  const stats = [
    { label: "Jami testlar", value: profile.totalTests },
    { label: "Eng yaxshi", value: `${profile.bestWpm} WPM` },
    { label: "O'rtacha", value: `${profile.averageWpm} WPM` },
    { label: "Belgilar", value: profile.totalCorrectChars > 1000 ? `${(profile.totalCorrectChars/1000).toFixed(1)}k` : profile.totalCorrectChars },
    { label: "Streak", value: `${streak} 🔥` },
  ];

  // Progress chart data
  const chartData = [...history].reverse().slice(-20);
  const maxWpm = Math.max(...chartData.map(h => h.wpm), 10);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Avatar + Name */}
      <div className={`${card} text-center`}>
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-500/20">
          {profile.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover" /> :
            <div className="w-full h-full flex items-center justify-center text-2xl font-black bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              {(profile.displayName || 'U').charAt(0).toUpperCase()}
            </div>}
        </div>

        {editing ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()} autoFocus
              className={`px-4 py-2 rounded-xl border text-center text-lg font-bold focus:outline-none focus:border-blue-500 w-48 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`}
              placeholder="Yangi ism..." />
            <button onClick={handleSaveName} disabled={saving || !newName.trim()}
              className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-all disabled:opacity-30">
              <Check className="w-5 h-5" />
            </button>
            <button onClick={() => setEditing(false)}
              className="p-2 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-1">
            <h2 className="text-2xl font-display font-black">{profile.displayName}</h2>
            <button onClick={() => { setEditing(true); setNewName(profile.displayName || ''); }}
              className={`p-1.5 rounded-lg transition-all ${isDarkMode ? 'text-white/20 hover:text-white/60 hover:bg-white/5' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}>
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        )}
        <p className={`text-sm mt-1 ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>{profile.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${card} text-center py-4 px-2`}>
            <p className="text-xl font-display font-black mb-0.5">{s.value}</p>
            <p className={`text-[9px] font-bold uppercase tracking-wider ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      {chartData.length >= 2 && (
        <div className={card}>
          <h3 className="text-sm font-display font-bold mb-4">📈 WPM o'sishi (oxirgi {chartData.length} test)</h3>
          <div className="relative h-32">
            <svg viewBox={`0 0 ${chartData.length * 20} 120`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                </linearGradient>
              </defs>
              {/* Area */}
              <polygon
                points={`0,120 ${chartData.map((d, i) => `${i * 20},${120 - (d.wpm / maxWpm) * 110}`).join(' ')} ${(chartData.length - 1) * 20},120`}
                fill="url(#progGrad)" />
              {/* Line */}
              <polyline
                points={chartData.map((d, i) => `${i * 20},${120 - (d.wpm / maxWpm) * 110}`).join(' ')}
                fill="none" stroke="rgb(59,130,246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Dots */}
              {chartData.map((d, i) => (
                <circle key={i} cx={i * 20} cy={120 - (d.wpm / maxWpm) * 110} r="3" fill="rgb(59,130,246)" />
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold opacity-30">
            <span>Eski</span>
            <span>Yangi</span>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className={card}>
        <h3 className="text-sm font-display font-bold mb-4">🏅 Yutuqlar ({earnedBadges.length}/{BADGES.length})</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BADGES.map(b => {
            const earned = earnedBadges.some(e => e.id === b.id);
            return (
              <div key={b.id} className={`p-3 rounded-xl border text-center transition-all ${
                earned
                  ? (isDarkMode ? 'border-blue-500/30 bg-blue-500/10' : 'border-blue-200 bg-blue-50')
                  : (isDarkMode ? 'border-white/5 bg-white/[0.02] opacity-30' : 'border-gray-100 bg-gray-50 opacity-40')
              }`}>
                <span className="text-2xl">{b.icon}</span>
                <p className="text-xs font-bold mt-1">{b.name}</p>
                <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'opacity-40' : 'text-gray-500'}`}>{b.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Picker */}
      <div className={card}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-display font-bold flex items-center gap-2">
            <Palette className="w-4 h-4" /> Tema rangi
          </h3>
          <span className={`text-xs ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>Tanlangan: {currentTheme}</span>
        </div>
        <div className="flex gap-3 justify-center">
          {(Object.keys(THEMES) as ThemeColor[]).map(color => (
            <button key={color} onClick={() => handleThemeChange(color)}
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${THEMES[color].gradient} transition-all hover:scale-110 ${
                currentTheme === color ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent scale-110' : ''
              }`}
              title={color} />
          ))}
        </div>
      </div>
    </div>
  );
}
