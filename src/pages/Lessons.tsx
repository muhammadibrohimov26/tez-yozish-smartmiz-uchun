import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, GraduationCap, Languages, Keyboard, ChevronDown, EyeOff } from 'lucide-react';
import { TRACKS, lessonsInTrack, type LessonTrack } from '../data/lessons';
import { getLessonProgress, isLessonUnlocked, LESSON_PASS_ACCURACY } from '../lib/lessonProgress';
import { ALPHABET } from '../lib/uzScript';
import { THEMES } from '../data/themes';
import type { ThemeColor } from '../types';

const TRACK_ICONS: Record<LessonTrack, typeof Languages> = { translit: Languages, touch: Keyboard };

export default function Lessons({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const navigate = useNavigate();
  const t = THEMES[themeColor];
  const progress = getLessonProgress();
  const [showAlphabet, setShowAlphabet] = useState(false);

  const muted = isDarkMode ? 'text-white/40' : 'text-gray-500';
  const faint = isDarkMode ? 'text-white/30' : 'text-gray-400';

  return (
    <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-12 space-y-10">
      <div className="text-center space-y-2">
        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-black">Darslar</h1>
        <p className={`text-xs ${faint}`}>
          Keyingi dars ochilishi uchun darsni kamida {LESSON_PASS_ACCURACY}% aniqlik bilan tugating
        </p>
      </div>

      {TRACKS.map(track => {
        const lessons = lessonsInTrack(track.id);
        const passedCount = lessons.filter(l => (progress[l.id]?.bestAccuracy ?? 0) >= LESSON_PASS_ACCURACY).length;
        const Icon = TRACK_ICONS[track.id];
        return (
          <section key={track.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${t.activeBg}`}>
                  <Icon className={`w-5 h-5 ${t.text}`} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-display font-black">{track.title}</h2>
                  <p className={`text-sm max-w-2xl ${muted}`}>{track.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:min-w-[180px]">
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(passedCount / lessons.length) * 100}%`, backgroundColor: 'var(--accent)' }}
                  />
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${faint}`}>{passedCount} / {lessons.length}</span>
              </div>
            </div>

            {track.id === 'translit' && (
              <div className={`rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/[0.03]' : 'border-gray-200 bg-white shadow-sm'}`}>
                <button
                  onClick={() => setShowAlphabet(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold"
                >
                  <span>Alifbo jadvali: kirill → lotin</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAlphabet ? 'rotate-180' : ''}`} />
                </button>
                {showAlphabet && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                      {ALPHABET.map(letter => (
                        <div
                          key={letter.cyr}
                          title={letter.note}
                          className={`rounded-xl px-2 py-2 text-center border ${
                            letter.tricky
                              ? (isDarkMode ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-200 bg-amber-50')
                              : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50')
                          }`}
                        >
                          <div className="text-base font-black">{letter.cyr}</div>
                          <div className={`text-sm font-mono font-bold ${t.text}`}>{letter.lat}</div>
                        </div>
                      ))}
                    </div>
                    <ul className={`text-xs space-y-1 ${muted}`}>
                      <li>• Sariq rangdagi harflarga alohida e'tibor bering — ular lotinda boshqacha yoziladi.</li>
                      <li>• Х → <b>x</b> (xat, xona), Ҳ → <b>h</b> (hafta, hisob). Bu eng ko'p uchraydigan xato.</li>
                      <li>• Е so'z boshida <b>ye</b> bo'ladi (ер → yer), boshqa joyda <b>e</b> (кел → kel). Э har doim <b>e</b>.</li>
                      <li>• Apostrof ( ' ) tugmasi kirill klaviaturadagi <b>Э</b> tugmasi o'rnida turadi.</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson, idx) => {
                const unlocked = isLessonUnlocked(lesson.id, lessons);
                const result = progress[lesson.id];
                // Attempted but below the bar: the card stays neutral, not "done".
                const passed = Boolean(result && result.bestAccuracy >= LESSON_PASS_ACCURACY);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => unlocked && navigate(`/lessons/${lesson.id}`)}
                    disabled={!unlocked}
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      !unlocked
                        ? (isDarkMode ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed')
                        : passed
                          ? (isDarkMode ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15' : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100')
                          : (isDarkMode ? 'border-white/5 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-white hover:bg-gray-50 shadow-sm')
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${faint}`}>
                        {idx + 1}-dars
                        {lesson.hideLatin && (
                          <span className="flex items-center gap-1 normal-case tracking-normal text-amber-500">
                            <EyeOff className="w-3 h-3" /> sinov
                          </span>
                        )}
                      </span>
                      {!unlocked ? <Lock className="w-4 h-4 opacity-40" /> : passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : null}
                    </div>
                    <h3 className="font-display font-bold text-sm mb-1">{lesson.title}</h3>
                    <p className={`text-xs ${muted}`}>{lesson.description}</p>
                    {result && (
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
                        <span className={t.text}>{result.bestWpm} WPM</span>
                        <span className={passed ? 'text-emerald-500' : 'text-amber-500'}>{result.bestAccuracy}% aniqlik</span>
                        {!passed && (
                          <span className="text-amber-500/80">{LESSON_PASS_ACCURACY}% kerak</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
