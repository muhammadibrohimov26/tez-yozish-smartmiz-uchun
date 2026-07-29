import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, GraduationCap } from 'lucide-react';
import { LESSONS } from '../data/lessons';
import { getLessonProgress, isLessonUnlocked, LESSON_PASS_ACCURACY } from '../lib/lessonProgress';
import { THEMES } from '../data/themes';
import type { ThemeColor } from '../types';

export default function Lessons({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const navigate = useNavigate();
  const t = THEMES[themeColor];
  const progress = getLessonProgress();

  return (
    <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-12 space-y-8">
      <div className="text-center space-y-2">
        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow}`}>
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-black">Darslar</h1>
        <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
          Barmoqlaringizni to'g'ri joylashtirib, klaviaturaga qaramasdan yozishni o'rganing
        </p>
        <p className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
          Keyingi dars ochilishi uchun darsni kamida {LESSON_PASS_ACCURACY}% aniqlik bilan tugating
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LESSONS.map((lesson, idx) => {
          const unlocked = isLessonUnlocked(lesson.id, LESSONS);
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
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                  {idx + 1}-dars
                </span>
                {!unlocked ? <Lock className="w-4 h-4 opacity-40" /> : passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : null}
              </div>
              <h3 className="font-display font-bold text-sm mb-1">{lesson.title}</h3>
              <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>{lesson.description}</p>
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
    </div>
  );
}
