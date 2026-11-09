import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, BarChart3, Users, GraduationCap, TrendingUp, Activity, ChevronDown, Trash2, Languages, Keyboard } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { isOwnerUser } from '../lib/owner';
import { lessonsInTrack, TRACKS, type Lesson, type LessonTrack } from '../data/lessons';
import { LESSON_PROGRESS_COLLECTION, isResultPassed, type LessonProgressDoc } from '../lib/lessonProgress';
import { THEMES } from '../data/themes';
import type { ThemeColor } from '../types';

/** Everything the page shows about one learner on one course, computed once per snapshot. */
interface LearnerRow {
  uid: string;
  displayName: string;
  photoURL: string;
  passed: number;
  total: number;
  /** The lesson the learner is on: the first one not yet passed (null once the course is done). */
  current: Lesson | null;
  currentIndex: number;
  avgAccuracy: number;
  bestWpm: number;
  attempts: number;
  updatedAt: Date | null;
  modules: { title: string; passed: number; total: number }[];
  /** Lessons tried several times without reaching the bar — where help is needed. */
  struggling: { lesson: Lesson; index: number; attempts: number; accuracy: number }[];
}

function buildRow(d: LessonProgressDoc, lessons: Lesson[]): LearnerRow {
  const progress = d.progress ?? {};
  let passed = 0;
  let accSum = 0;
  let accCount = 0;
  let bestWpm = 0;
  let attempts = 0;
  const moduleMap = new Map<string, { passed: number; total: number }>();
  const struggling: LearnerRow['struggling'] = [];

  lessons.forEach((lesson, index) => {
    const r = progress[lesson.id];
    const title = lesson.module ?? '';
    const m = moduleMap.get(title) ?? { passed: 0, total: 0 };
    m.total++;
    if (r) {
      attempts += r.attempts || 0;
      accSum += r.bestAccuracy;
      accCount++;
      bestWpm = Math.max(bestWpm, r.bestWpm);
      if (isResultPassed(r)) {
        passed++;
        m.passed++;
      } else if ((r.attempts || 0) >= 2) {
        struggling.push({ lesson, index, attempts: r.attempts, accuracy: r.bestAccuracy });
      }
    }
    moduleMap.set(title, m);
  });

  const currentIndex = lessons.findIndex(l => !isResultPassed(progress[l.id]));
  return {
    uid: d.uid,
    displayName: d.displayName || 'Foydalanuvchi',
    photoURL: d.photoURL || '',
    passed,
    total: lessons.length,
    current: currentIndex >= 0 ? lessons[currentIndex] : null,
    currentIndex,
    avgAccuracy: accCount ? Math.round(accSum / accCount) : 0,
    bestWpm,
    attempts,
    updatedAt: d.updatedAt?.toDate?.() ?? null,
    modules: Array.from(moduleMap, ([title, v]) => ({ title, ...v })).filter(m => m.title),
    struggling: struggling.sort((a, b) => b.attempts - a.attempts).slice(0, 3),
  };
}

function timeAgo(date: Date | null): string {
  if (!date) return '—';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'hozirgina';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'kecha';
  if (days < 30) return `${days} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

const isToday = (date: Date | null) => !!date && date.toDateString() === new Date().toDateString();

export default function LessonStats({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const navigate = useNavigate();
  const t = THEMES[themeColor];
  const { user, profile } = useAuth();
  const isOwner = isOwnerUser(user, profile);
  const [docs, setDocs] = useState<LessonProgressDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<LessonTrack>('translit');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // Live: a lesson finished on another computer shows up here within seconds.
    const unsub = onSnapshot(
      collection(db, LESSON_PROGRESS_COLLECTION),
      snap => {
        setDocs(snap.docs.map(d => ({ ...(d.data() as LessonProgressDoc), uid: d.id })));
        setLoading(false);
        setError('');
      },
      err => {
        console.error('Statistikani yuklab bo\'lmadi:', err);
        setError("Statistikani yuklab bo'lmadi. Firestore qoidalari yangilanganini tekshiring.");
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const lessons = useMemo(() => lessonsInTrack(tab), [tab]);
  const rows = useMemo(() => {
    return docs
      .map(d => buildRow(d, lessons))
      .filter(r => r.attempts > 0)
      .sort((a, b) =>
        b.passed - a.passed
        || b.avgAccuracy - a.avgAccuracy
        || (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
  }, [docs, lessons]);

  const finished = rows.filter(r => r.passed === r.total).length;
  const avgPercent = rows.length ? Math.round(rows.reduce((s, r) => s + r.passed / r.total, 0) / rows.length * 100) : 0;
  const activeToday = rows.filter(r => isToday(r.updatedAt)).length;

  const resetLearner = async (row: LearnerRow) => {
    if (!window.confirm(`${row.displayName} ning barcha dars natijalari o'chirilsinmi? Bu ikkala kursga ham tegishli.`)) return;
    try {
      await deleteDoc(doc(db, LESSON_PROGRESS_COLLECTION, row.uid));
      setExpanded(null);
    } catch (err) {
      console.error(err);
      alert("O'chirib bo'lmadi.");
    }
  };

  const muted = isDarkMode ? 'text-white/40' : 'text-gray-500';
  const faint = isDarkMode ? 'text-white/30' : 'text-gray-400';
  const card = isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm';
  const barBg = isDarkMode ? 'bg-white/10' : 'bg-gray-100';
  const medals = ['🥇', '🥈', '🥉'];

  const stats = [
    { icon: Users, label: "O'rganayotganlar", value: rows.length },
    { icon: GraduationCap, label: 'Kursni tugatganlar', value: finished },
    { icon: TrendingUp, label: "O'rtacha natija", value: `${avgPercent}%` },
    { icon: Activity, label: 'Bugun faol', value: activeToday },
  ];

  return (
    <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-12 space-y-8">
      <button
        onClick={() => navigate('/lessons')}
        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}
      >
        <ArrowLeft className="w-4 h-4" /> Darslar
      </button>

      <div className="text-center space-y-2">
        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
          <BarChart3 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-black">Darslar statistikasi</h1>
        <p className={`text-sm ${muted}`}>Kim qancha dars o'tdi, qayerda turibdi va qayerda qiynalyapti</p>
      </div>

      <div className={`flex p-1 rounded-2xl border max-w-xl mx-auto ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
        {TRACKS.map(tr => {
          const TabIcon = tr.id === 'translit' ? Languages : Keyboard;
          const active = tr.id === tab;
          return (
            <button
              key={tr.id}
              onClick={() => { setTab(tr.id); setExpanded(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                active ? 'text-white shadow-md' : (isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900')
              }`}
              style={active ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              <TabIcon className="w-4 h-4 shrink-0" /> {tr.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${card}`}>
            <s.icon className={`w-5 h-5 mb-2 ${t.text}`} />
            <p className="text-2xl font-display font-black">{s.value}</p>
            <p className={`text-xs font-bold ${faint}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-center text-sm font-bold text-rose-500">{error}</p>
      ) : rows.length === 0 ? (
        <p className={`text-center text-sm py-12 ${muted}`}>Bu kurs bo'yicha hali hech kim dars o'tmagan.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => {
            const percent = Math.round((row.passed / row.total) * 100);
            const isMe = row.uid === user?.uid;
            const open = expanded === row.uid;
            return (
              <div
                key={row.uid}
                className={`rounded-2xl border transition-all ${card}`}
                style={isMe ? { boxShadow: '0 0 0 2px var(--accent)' } : undefined}
              >
                <button onClick={() => setExpanded(open ? null : row.uid)} className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left">
                  <span className={`w-7 text-center font-display font-black shrink-0 ${i < 3 ? 'text-xl' : `text-sm ${faint}`}`}>
                    {i < 3 ? medals[i] : i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {row.photoURL
                      ? <img src={row.photoURL} alt={row.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      : <div className={`w-full h-full flex items-center justify-center font-black text-white bg-gradient-to-br ${t.gradient}`}>{row.displayName.charAt(0).toUpperCase()}</div>}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm truncate">{row.displayName}</span>
                      {isMe && <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--accent)' }}>SIZ</span>}
                      {row.passed === row.total && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">🎓 TUGATDI</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${barBg}`}>
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: row.passed === row.total ? 'rgb(16,185,129)' : 'var(--accent)' }} />
                      </div>
                      <span className="text-xs font-black w-20 text-right shrink-0">{row.passed} / {row.total}</span>
                    </div>
                    <p className={`text-xs truncate ${faint}`}>
                      {row.current ? `Hozir: ${row.currentIndex + 1}-dars · ${row.current.title}` : 'Barcha darslar o\'tildi'}
                      {' · '}{timeAgo(row.updatedAt)}
                    </p>
                  </div>
                  <div className="hidden sm:flex gap-5 text-center shrink-0">
                    <div>
                      <p className={`text-sm font-black ${row.avgAccuracy >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{row.avgAccuracy}%</p>
                      <p className={`text-[10px] font-bold uppercase ${faint}`}>Aniqlik</p>
                    </div>
                    <div>
                      <p className={`text-sm font-black ${t.text}`}>{row.bestWpm}</p>
                      <p className={`text-[10px] font-bold uppercase ${faint}`}>WPM</p>
                    </div>
                    <div>
                      <p className="text-sm font-black">{row.attempts}</p>
                      <p className={`text-[10px] font-bold uppercase ${faint}`}>Urinish</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className={`px-4 pb-4 pt-1 space-y-4 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="flex sm:hidden justify-around text-center pt-3">
                      <div><p className={`text-sm font-black ${row.avgAccuracy >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{row.avgAccuracy}%</p><p className={`text-[10px] font-bold uppercase ${faint}`}>Aniqlik</p></div>
                      <div><p className={`text-sm font-black ${t.text}`}>{row.bestWpm}</p><p className={`text-[10px] font-bold uppercase ${faint}`}>WPM</p></div>
                      <div><p className="text-sm font-black">{row.attempts}</p><p className={`text-[10px] font-bold uppercase ${faint}`}>Urinish</p></div>
                    </div>

                    {row.modules.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${faint}`}>Bo'limlar bo'yicha</p>
                        {row.modules.map(m => (
                          <div key={m.title} className="flex items-center gap-3 text-xs">
                            <span className={`w-44 sm:w-64 truncate ${muted}`}>{m.title}</span>
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${barBg}`}>
                              <div className="h-full rounded-full" style={{ width: `${(m.passed / m.total) * 100}%`, backgroundColor: m.passed === m.total ? 'rgb(16,185,129)' : 'var(--accent)' }} />
                            </div>
                            <span className="w-12 text-right font-bold shrink-0">{m.passed}/{m.total}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {row.struggling.length > 0 && (
                      <div className="space-y-2">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${faint}`}>Qiynalayotgan darslari</p>
                        <div className="flex flex-wrap gap-2">
                          {row.struggling.map(s => (
                            <span key={s.lesson.id} className={`text-xs font-bold px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                              {s.index + 1}-dars · {s.lesson.title} — {s.attempts} marta, eng yaxshisi {s.accuracy}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => resetLearner(row)}
                        className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Dars natijalarini o'chirish
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
