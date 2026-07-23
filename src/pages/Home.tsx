import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Trophy, Zap, Calendar, Trash2, Shield } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTypingTest } from '../hooks/useTypingTest';
import { useAuth } from '../hooks/useAuth';
import KeyboardHeatmap from '../components/KeyboardHeatmap';
import WpmChart from '../components/WpmChart';
import { THEMES } from '../data/themes';
import type { Difficulty, Duration, TestResult, ThemeColor } from '../types';
import type { Language } from '../data/words';

export default function Home({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const { user, profile } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();
  const [devModeUnlocked, setDevModeUnlocked] = useState(() => localStorage.getItem('dev_cheat_mode') === 'true');
  
  const isOwner = profile?.email === 'muhammadibrohimov0306@gmail.com' || profile?.isAdmin === true || devModeUnlocked;
  const test = useTypingTest({ userId: user?.uid, groupId, isOwner });

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setDevModeUnlocked(prev => {
          const next = !prev;
          localStorage.setItem('dev_cheat_mode', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const resetOwnerStats = async () => {
    if (!user?.uid) return;
    if (window.confirm("Barcha statistikalaringizni 0 ga tushirishni tasdiqlaysizmi? (Firestore va Mahalliy tarix tozalanadi)")) {
      try {
        await updateDoc(doc(db, 'typingUsers', user.uid), {
          averageWpm: 0,
          bestWpm: 0,
          totalTests: 0,
          totalCorrectChars: 0
        });
        localStorage.removeItem('typing_history');
        localStorage.removeItem('typing_streak_dates');
        window.location.reload();
      } catch (e) {
        console.error("Xatolik reytingni tozalashda:", e);
      }
    }
  };
  const t = THEMES[themeColor];
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('typing_history');
    if (saved) setHistory(JSON.parse(saved));
  }, [test.isFinished]);

  const durations: Duration[] = [15, 30, 60, 120];
  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: "O'zbek" },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap justify-center items-center gap-2">
        {/* Language */}
        <div className={`flex items-center p-1 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
          {languages.map(l => (
            <button key={l.code} onClick={() => { test.setLanguage(l.code); if (!test.isActive) test.generateWords(); }}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                test.language === l.code ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-40 hover:opacity-100'
              }`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Script (only for Uzbek) */}
        {test.language === 'uz' && (
          <div className={`flex items-center p-1 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
            <button onClick={() => test.setIsLatin(true)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${test.isLatin ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-50 hover:opacity-100'}`}>
              Lotin
            </button>
            <button onClick={() => test.setIsLatin(false)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${!test.isLatin ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-50 hover:opacity-100'}`}>
              Кирил
            </button>
          </div>
        )}

        {/* Mode */}
        <div className={`flex items-center p-1 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
          <button onClick={() => { test.setTestMode('words'); test.setIsDaily(false); if (!test.isActive) test.generateWords(); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              test.testMode === 'words' && !test.isDaily ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-40 hover:opacity-100'
            }`}>So'z</button>
          <button onClick={() => { test.setTestMode('sentences'); test.setIsDaily(false); if (!test.isActive) test.generateWords(); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              test.testMode === 'sentences' ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-40 hover:opacity-100'
            }`}>Gap</button>
          <button onClick={() => { test.setIsDaily(true); test.setTestMode('words'); if (!test.isActive) test.generateWords(); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${
              test.isDaily ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 opacity-40 hover:opacity-100'
            }`}><Calendar className="w-3 h-3" />Kunlik</button>
        </div>

        {/* Difficulty */}
        <div className={`flex items-center p-1 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(l => (
            <button key={l} onClick={() => { test.setDifficulty(l); if (!test.isActive) test.generateWords(); }}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                test.difficulty === l ? (isDarkMode ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-blue-600 text-white shadow-md') : 'text-gray-400 opacity-40 hover:opacity-100'
              }`}>
              {l === 'easy' ? 'Oson' : l === 'medium' ? "O'rta" : 'Qiyin'}
            </button>
          ))}
        </div>

        {/* Duration */}
        <div className={`flex items-center p-1 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
          {durations.map(d => (
            <button key={d} onClick={() => test.setDuration(d)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                test.duration === d ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-40 hover:opacity-100'
              }`}>{d}s</button>
          ))}
        </div>
      </div>

      {/* Timer + Stats */}
      <div className="grid grid-cols-3 items-center gap-4 px-4">
        <div className="flex justify-start">
          <div className={`px-3 py-2 rounded-2xl border text-[10px] font-black tracking-[0.2em] uppercase ${isDarkMode ? 'border-white/5 bg-white/5 text-white/30' : 'border-gray-200 bg-white text-gray-400'}`}>
            {test.isDaily ? '🎯 Kunlik' : (test.difficulty === 'easy' ? 'Oson' : test.difficulty === 'medium' ? "O'rta" : 'Qiyin')} • {test.duration}s
          </div>
        </div>
        <div className="flex justify-center">
          <div className={`px-6 sm:px-12 py-3 sm:py-4 rounded-3xl border text-3xl sm:text-5xl font-display font-black shadow-2xl transition-all ${
            test.isActive ? (isDarkMode ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-blue-500/20' : 'border-blue-500 bg-blue-50 text-blue-600 shadow-blue-500/10')
              : (isDarkMode ? 'border-white/5 bg-white/5 text-white/20' : 'border-gray-200 bg-white text-gray-200')
          }`}>
            {test.isActive ? test.timeLeft : (test.isFinished ? test.result?.wpm || 0 : '00')}
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <div className={`px-3 py-2 rounded-2xl border flex flex-col items-center min-w-[60px] ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
            <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">To'g'ri</span>
            <span className="text-xl font-display font-bold text-blue-500">{Math.round(test.correctChars / 5)}</span>
          </div>
          <div className={`px-3 py-2 rounded-2xl border flex flex-col items-center min-w-[60px] ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
            <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Xato</span>
            <span className="text-xl font-display font-bold text-rose-500">{test.errorCount}</span>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className={`w-full min-h-[320px] rounded-[32px] border p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
        isDarkMode ? 'border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]'
      }`}>
        <AnimatePresence mode="wait">
          {test.isFinished ? (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 w-full max-w-2xl">
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black tracking-tighter">Natijangiz</h2>
                {test.isDaily && <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">🎯 Kunlik challenge</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-[24px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">Tezlik</p>
                  <p className="text-4xl font-display font-black" style={{ color: t.primary }}>{test.result?.wpm || 0} <span className="text-lg opacity-40">WPM</span></p>
                </div>
                <div className={`p-5 rounded-[24px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">Aniqlik</p>
                  <p className="text-4xl font-display font-black text-emerald-500">{test.result?.accuracy || 0}%</p>
                </div>
                <div className={`p-4 rounded-[20px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">To'g'ri</p>
                  <p className="text-2xl font-display font-bold text-blue-400">{test.correctChars} <span className="text-xs opacity-40">belgi</span></p>
                </div>
                <div className={`p-4 rounded-[20px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">Xato</p>
                  <p className="text-2xl font-display font-bold text-rose-500">{test.incorrectChars} <span className="text-xs opacity-40">belgi</span></p>
                </div>
              </div>
              <button onClick={test.resetTest}
                className="w-full py-5 rounded-[20px] text-white font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95"
                style={{ backgroundColor: t.primary, boxShadow: `0 25px 50px -12px ${t.glow}` }}>
                <RotateCcw className="w-6 h-6" /> Qayta boshlash
              </button>
            </motion.div>
          ) : !test.isActive ? (
            <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 w-full max-w-md">
              <div className="relative">
                <div className="absolute -inset-4 blur-2xl rounded-full animate-pulse" style={{ backgroundColor: t.glow }} />
                <div className="relative space-y-3">
                  <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter">
                    {test.isDaily ? '🎯 Kunlik challenge' : 'Tayyormisiz?'}
                  </h2>
                  <p className={`text-sm font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'opacity-40' : 'text-gray-400'}`}>
                    {test.isDaily ? 'Bugun hamma uchun bir xil so\'zlar' : "O'zingizni sinab ko'ring"}
                  </p>
                </div>
              </div>
              <button onClick={test.startTest}
                className="w-full py-6 rounded-[28px] text-white font-black text-2xl md:text-3xl transition-all shadow-2xl flex flex-col items-center justify-center gap-2 active:scale-95 hover:brightness-110"
                style={{ backgroundColor: t.primary, boxShadow: `0 25px 50px -12px ${t.glow}` }}>
                <div className="flex items-center gap-3">
                  <span>Boshlash</span>
                  <Zap className="w-8 h-8 fill-white/20" />
                </div>
                <span className="text-[10px] opacity-50 font-bold uppercase tracking-[0.4em]">Yozishni boshlang</span>
              </button>
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-12 flex flex-col items-center">
              <div className="relative h-28 flex items-center justify-center w-full">
                <AnimatePresence mode="wait">
                  <motion.div key={test.currentWordIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.1 }}
                    className="flex flex-col items-center">
                    <span className={`text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.words[test.currentWordIndex] || '...'}
                    </span>
                    <div className="mt-3 flex gap-1.5">
                      {test.words[test.currentWordIndex]?.split('').map((char, i) => (
                        <div key={i} className={`h-1.5 w-3 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}
                          style={i < test.userInput.length ? { backgroundColor: test.userInput[i] === char ? t.primary : 'rgb(244,63,94)' } : {}} />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="relative w-full max-w-2xl mx-auto">
                <motion.input ref={test.inputRef} type="text" value={test.userInput} onChange={test.handleInput} onKeyDown={test.handleKeyDown}
                  autoFocus disabled={!test.isActive}
                  className={`w-full bg-transparent border-b-4 p-4 sm:p-6 text-2xl sm:text-3xl md:text-4xl font-display font-black text-center focus:outline-none transition-all duration-300 ${isDarkMode ? 'placeholder:text-white/5' : 'placeholder:text-gray-100'}`}
                  style={{ borderColor: test.lastFeedback.type === 'incorrect' ? 'rgb(244,63,94)' : t.primary, color: test.lastFeedback.type === 'incorrect' ? 'rgb(244,63,94)' : t.primary }}
                  placeholder="TAYYOR..." />
                <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const progress = test.currentWordIndex % 10;
                    const isActive = i < (progress === 0 && test.currentWordIndex > 0 ? 10 : progress);
                    return (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'w-8' : 'w-4 ' + (isDarkMode ? 'bg-white/10' : 'bg-gray-200')}`}
                        style={isActive ? { backgroundColor: t.primary } : {}} />
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post-test analytics */}
      {test.isFinished && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WpmChart data={test.wpmHistory} isDarkMode={isDarkMode} />
          <KeyboardHeatmap charErrors={test.charErrors} isDarkMode={isDarkMode} />
        </div>
      )}

      {/* History */}
      {!test.isActive && history.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-display font-black tracking-tighter flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" /> Natijalar
            </h3>
            <button onClick={() => { setHistory([]); localStorage.removeItem('typing_history'); }}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-white/5 text-white/30 hover:text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-700'}`}>
              Tozalash
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 9).map(r => (
              <div key={r.id} className={`p-5 rounded-[20px] border transition-all hover:-translate-y-1 ${isDarkMode ? 'border-white/5 bg-white/5 hover:border-blue-500/30' : 'border-gray-200 bg-white hover:shadow-xl'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-3xl font-display font-black text-blue-500">{r.wpm}</span>
                    <span className={`text-xs ml-1 ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>WPM</span>
                  </div>
                  <span className={`text-[10px] font-mono ${isDarkMode ? 'opacity-30' : 'text-gray-400'}`}>{r.date}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className={isDarkMode ? 'opacity-40' : 'text-gray-500'}>{r.accuracy}% aniqlik</span>
                  <span className={isDarkMode ? 'opacity-40' : 'text-gray-500'}>{r.duration || 60}s</span>
                </div>
                <div className={`flex gap-4 mt-2 pt-2 border-t text-xs ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                  <span className="text-blue-400">✓ {r.correctChars || 0} belgi</span>
                  <span className="text-rose-400">✗ {r.incorrectChars || 0} belgi</span>
                  <span className={isDarkMode ? 'opacity-30' : 'text-gray-400'}>{(r.correctChars || 0) + (r.incorrectChars || 0)} jami</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Developer Cheat Panel for Owner */}
      {isOwner && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-slate-950/95 border border-green-500/30 text-white p-5 rounded-3xl shadow-2xl shadow-green-500/10 w-72 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            <Shield className="w-5 h-5 text-green-400" />
            <span className="font-display font-black text-sm tracking-wider uppercase text-green-400">Developer Tools</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">Hacker Mode (2x Speed)</span>
              <button
                onClick={() => test.setCheatEnabled(!test.cheatEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${test.cheatEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${test.cheatEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <button
              onClick={resetOwnerStats}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reytingni 0 ga tushirish</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
