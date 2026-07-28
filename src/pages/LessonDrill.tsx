import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ArrowRight, Trophy } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { useLessonDrill } from '../hooks/useLessonDrill';
import FingerKeyboard from '../components/FingerKeyboard';
import { THEMES } from '../data/themes';
import type { ThemeColor } from '../types';

export default function LessonDrill({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const t = THEMES[themeColor];

  const lessonIndex = LESSONS.findIndex(l => l.id === lessonId);
  // Hooks must run unconditionally, so fall back to the first lesson when the
  // route param is invalid — the Navigate redirect below fires before the user sees it.
  const lesson = lessonIndex >= 0 ? LESSONS[lessonIndex] : LESSONS[0];

  const drill = useLessonDrill(lesson);
  const [flash, setFlash] = useState(false);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!drill.lastWrongKey) return;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 150);
    return () => clearTimeout(timer);
  }, [drill.lastWrongKey]);

  // Keep the current character in view — the drill text can span many lines,
  // and without this the keyboard below it gets pushed off screen.
  useEffect(() => {
    currentCharRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [drill.position]);

  if (lessonIndex < 0) return <Navigate to="/lessons" replace />;

  const nextLesson = LESSONS[lessonIndex + 1];

  return (
    <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-12 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/lessons')}
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Darslar
        </button>
        <span className={`text-xs font-bold ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{lessonIndex + 1} / {LESSONS.length}</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-xl md:text-2xl font-display font-black">{lesson.title}</h1>
        <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{lesson.description}</p>
      </div>

      {!drill.isFinished ? (
        <>
          <div className={`rounded-[24px] border p-6 md:p-8 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4 text-xs font-bold uppercase tracking-widest">
              <span className={isDarkMode ? 'text-white/30' : 'text-gray-400'}>
                {drill.isActive ? 'Yozmoqdasiz...' : "Boshlash uchun istalgan tugmani bosing"}
              </span>
              <span className={drill.mistakeCount > 0 ? 'text-rose-500' : (isDarkMode ? 'text-white/30' : 'text-gray-400')}>
                Xato: {drill.mistakeCount}
              </span>
            </div>
            <div className="max-h-[8rem] sm:max-h-[10.5rem] overflow-hidden">
              <div className="font-mono text-2xl sm:text-4xl leading-loose tracking-wide">
                {drill.text.split('').map((ch, i) => {
                  const isSpace = ch === ' ';
                  const isPast = i < drill.position;
                  const isCurrent = i === drill.position;
                  let cls = isDarkMode ? 'text-white/20' : 'text-gray-300';
                  if (isPast) cls = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
                  else if (isCurrent) cls = flash ? 'text-rose-100' : (isDarkMode ? 'text-white' : 'text-gray-900');
                  return (
                    <span
                      key={i}
                      ref={isCurrent ? currentCharRef : undefined}
                      className={`inline-block ${isSpace ? 'min-w-[0.9em]' : 'min-w-[0.7em]'} mx-0.5 text-center rounded transition-colors ${cls}`}
                      style={isCurrent ? { backgroundColor: flash ? 'rgba(244,63,94,0.5)' : 'var(--accent-glow)' } : undefined}
                    >
                      {isSpace ? '·' : ch}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <FingerKeyboard activeChar={drill.activeChar} isDarkMode={isDarkMode} />
        </>
      ) : (
        <div className={`rounded-[28px] border p-8 md:p-12 text-center space-y-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
          <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-black">Dars tugadi!</h2>
          <div className="flex justify-center gap-10">
            <div>
              <p className={`text-3xl font-black ${t.text}`}>{drill.result?.wpm}</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>WPM</p>
            </div>
            <div>
              <p className="text-3xl font-black text-emerald-500">{drill.result?.accuracy}%</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>Aniqlik</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={drill.retry}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <RotateCcw className="w-4 h-4" /> Qayta urinish
            </button>
            <button
              onClick={() => navigate(nextLesson ? `/lessons/${nextLesson.id}` : '/lessons')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${t.gradient} shadow-lg ${t.shadow}`}
            >
              {nextLesson ? 'Keyingi dars' : 'Darslarga qaytish'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
