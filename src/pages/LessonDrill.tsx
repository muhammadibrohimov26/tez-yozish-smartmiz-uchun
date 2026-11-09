import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ArrowRight, Trophy, Lightbulb, Languages, EyeOff } from 'lucide-react';
import { LESSONS, lessonsInTrack } from '../data/lessons';
import { useLessonDrill } from '../hooks/useLessonDrill';
import FingerKeyboard from '../components/FingerKeyboard';
import { LESSON_PASS_ACCURACY, isLessonUnlocked, useLessonProgress } from '../lib/lessonProgress';
import { useAuth } from '../hooks/useAuth';
import { latinToCyrillic } from '../lib/uzScript';
import { THEMES } from '../data/themes';
import type { ThemeColor } from '../types';

/** A run of the drill text: one word, or the single space between two words. */
interface Segment {
  start: number;
  text: string;
  isSpace: boolean;
}

function splitSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const re = / |[^ ]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    segments.push({ start: m.index, text: m[0], isSpace: m[0] === ' ' });
  }
  return segments;
}

/** Letters (and the apostrophe) are what a hidden-Latin drill asks you to recall; punctuation stays visible. */
const isRecallable = (ch: string) => /[A-Za-z']/.test(ch);

export default function LessonDrill({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: ThemeColor }) {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const t = THEMES[themeColor];

  const lessonIndex = LESSONS.findIndex(l => l.id === lessonId);
  // Hooks must run unconditionally, so fall back to the first lesson when the
  // route param is invalid — the Navigate redirect below fires before the user sees it.
  const lesson = lessonIndex >= 0 ? LESSONS[lessonIndex] : LESSONS[0];
  const trackLessons = lessonsInTrack(lesson.track);
  const trackIndex = trackLessons.findIndex(l => l.id === lesson.id);
  const isTranslit = lesson.track === 'translit';

  const { user, profile } = useAuth();
  const { progress, loaded } = useLessonProgress(user, profile?.displayName);
  const drill = useLessonDrill(lesson);
  const [flash, setFlash] = useState(false);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const segments = useMemo(() => splitSegments(drill.text), [drill.text]);

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

  /** Words the learner stumbled on, Cyrillic next to Latin — the list to review after the drill. */
  const reviewWords = useMemo(() => {
    if (!drill.isFinished || !isTranslit || drill.mistakePositions.length === 0) return [];
    const missed = new Set(drill.mistakePositions);
    const seen = new Set<string>();
    const words: { cyr: string; lat: string }[] = [];
    for (const seg of segments) {
      if (seg.isSpace) continue;
      let hit = false;
      for (let i = seg.start; i < seg.start + seg.text.length; i++) if (missed.has(i)) { hit = true; break; }
      const lat = seg.text.replace(/[.,!?:;]+$/, '');
      if (!hit || seen.has(lat.toLowerCase())) continue;
      seen.add(lat.toLowerCase());
      words.push({ cyr: latinToCyrillic(lat), lat });
    }
    return words;
  }, [drill.isFinished, drill.mistakePositions, segments, isTranslit]);

  if (lessonIndex < 0) return <Navigate to="/lessons" replace />;
  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }
  // A typed-in URL must not skip ahead: the course only works in order. A lesson
  // just finished stays open even if its successor's check would now differ.
  if (!drill.isFinished && !isLessonUnlocked(lesson.id, trackLessons, progress)) return <Navigate to="/lessons" replace />;

  const nextLesson = trackLessons[trackIndex + 1];
  const passed = (drill.result?.accuracy ?? 0) >= LESSON_PASS_ACCURACY;

  // In a hidden-Latin drill the keyboard would give the answer away, so the key
  // only lights up after a wrong guess (or for the space between words).
  const revealCurrent = !lesson.hideLatin || drill.missesHere > 0 || drill.activeChar === ' ';
  const keyboardChar = revealCurrent ? drill.activeChar : undefined;

  const muted = isDarkMode ? 'text-white/40' : 'text-gray-500';
  const card = isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white';

  const renderChar = (ch: string, i: number, large: boolean) => {
    const isSpace = ch === ' ';
    const isPast = i < drill.position;
    const isCurrent = i === drill.position;
    const hidden = lesson.hideLatin && !isPast && isRecallable(ch) && !(isCurrent && drill.missesHere > 0);
    let cls = isDarkMode ? 'text-white/20' : 'text-gray-300';
    if (isPast) cls = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    else if (isCurrent) {
      if (flash) cls = 'text-rose-100';
      else if (lesson.hideLatin && drill.missesHere > 0) cls = 'text-rose-500';
      else cls = isDarkMode ? 'text-white' : 'text-gray-900';
    }
    return (
      <span
        key={i}
        ref={isCurrent ? currentCharRef : undefined}
        className={`inline-block ${isSpace ? 'min-w-[0.9em]' : large ? 'min-w-[0.7em]' : 'min-w-[0.62em]'} mx-px text-center rounded transition-colors ${cls}`}
        style={isCurrent ? { backgroundColor: flash ? 'rgba(244,63,94,0.5)' : 'var(--accent-glow)' } : undefined}
      >
        {isSpace ? '·' : hidden ? '_' : ch}
      </span>
    );
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-12 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/lessons')}
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Darslar
        </button>
        <span className={`text-xs font-bold ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
          {isTranslit ? 'Kirilldan lotinga · ' : ''}{trackIndex + 1} / {trackLessons.length}
        </span>
      </div>

      <div className="text-center space-y-1">
        {lesson.module && (
          <p className={`text-[10px] font-black uppercase tracking-widest ${t.text}`}>{lesson.module}</p>
        )}
        <h1 className="text-xl md:text-2xl font-display font-black">{lesson.title}</h1>
        <p className={`text-sm ${muted}`}>{lesson.description}</p>
      </div>

      {!drill.isFinished ? (
        <>
          {lesson.letterMap && (
            <div className={`rounded-[20px] border p-4 ${card}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 text-center ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                Eslab qoling
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {lesson.letterMap.map(pair => (
                  <div
                    key={pair.cyr}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}
                  >
                    <span>{pair.cyr}</span>
                    <span className={isDarkMode ? 'text-white/25' : 'text-gray-300'}>→</span>
                    <span className={`font-mono ${t.text}`}>{pair.lat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lesson.tip && (
            <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${isDarkMode ? 'bg-amber-500/10 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
              <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{lesson.tip}</p>
            </div>
          )}

          {drill.wrongLayout && (
            <div className="flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30">
              <Languages className="w-5 h-5 shrink-0" />
              <p>
                Klaviaturangiz kirill rejimida! Lotinga (EN) o'tkazing:
                Windows — Alt+Shift yoki Win+Probel, Mac — Ctrl+Probel. Bu xato hisoblanmadi.
              </p>
            </div>
          )}

          <div className={`rounded-[24px] border p-6 md:p-8 ${card}`}>
            <div className="flex items-center justify-between mb-4 text-xs font-bold uppercase tracking-widest">
              <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {lesson.hideLatin && <EyeOff className="w-3.5 h-3.5" />}
                {drill.isActive
                  ? 'Yozmoqdasiz...'
                  : lesson.hideLatin
                    ? "Kirillchaga qarab lotinda yozing"
                    : "Boshlash uchun istalgan tugmani bosing"}
              </span>
              <span className={drill.mistakeCount > 0 ? 'text-rose-500' : (isDarkMode ? 'text-white/30' : 'text-gray-400')}>
                Xato: {drill.mistakeCount}
              </span>
            </div>

            {lesson.cyrillicHint ? (
              <div className="max-h-[11rem] sm:max-h-[14rem] overflow-hidden">
                <div className="flex flex-wrap items-end gap-y-4 font-mono text-xl sm:text-3xl leading-snug">
                  {segments.map(seg => {
                    if (seg.isSpace) return renderChar(' ', seg.start, false);
                    const end = seg.start + seg.text.length;
                    const isCurrentWord = drill.position >= seg.start && drill.position < end;
                    const isDone = drill.position >= end;
                    return (
                      <span key={seg.start} className="inline-flex flex-col items-center">
                        <span
                          className={`font-sans font-bold text-sm sm:text-lg mb-0.5 transition-colors ${
                            isCurrentWord ? t.text : isDone ? (isDarkMode ? 'text-white/25' : 'text-gray-300') : (isDarkMode ? 'text-white/60' : 'text-gray-600')
                          }`}
                        >
                          {latinToCyrillic(seg.text)}
                        </span>
                        <span className="whitespace-nowrap">
                          {seg.text.split('').map((ch, k) => renderChar(ch, seg.start + k, false))}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-h-[8rem] sm:max-h-[10.5rem] overflow-hidden">
                <div className="font-mono text-2xl sm:text-4xl leading-loose tracking-wide">
                  {drill.text.split('').map((ch, i) => renderChar(ch, i, true))}
                </div>
              </div>
            )}

            {lesson.hideLatin && (
              <p className={`mt-4 text-xs text-center ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                {drill.missesHere > 0
                  ? "To'g'ri harf qizil rangda va klaviaturada ko'rsatildi"
                  : "Bilmasangiz, taxmin qilib bosing — xatodan keyin to'g'ri harf ko'rinadi"}
              </p>
            )}
          </div>

          <FingerKeyboard activeChar={keyboardChar} isDarkMode={isDarkMode} showCyrillicLabels={isTranslit} />
        </>
      ) : (
        <div className={`rounded-[28px] border p-8 md:p-12 text-center space-y-6 ${card}`}>
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
              <p className={`text-3xl font-black ${passed ? 'text-emerald-500' : 'text-amber-500'}`}>{drill.result?.accuracy}%</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>Aniqlik</p>
            </div>
          </div>
          <p className={`text-sm font-bold ${passed ? 'text-emerald-500' : 'text-amber-500'}`}>
            {passed
              ? (nextLesson ? 'Keyingi dars ochildi!' : "Kurs tugadi — tabriklaymiz!")
              : `Keyingi dars ochilishi uchun ${LESSON_PASS_ACCURACY}% aniqlik kerak. Yana bir bor urinib ko'ring.`}
          </p>

          {reviewWords.length > 0 && (
            <div className={`rounded-2xl p-4 text-left ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                Xato qilingan so'zlar — takrorlang
              </p>
              <div className="flex flex-wrap gap-2">
                {reviewWords.map(w => (
                  <span key={w.lat} className={`px-3 py-1.5 rounded-xl text-sm font-bold ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                    {w.cyr} <span className={isDarkMode ? 'text-white/25' : 'text-gray-300'}>→</span>{' '}
                    <span className={`font-mono ${t.text}`}>{w.lat}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={drill.retry}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <RotateCcw className="w-4 h-4" /> Qayta urinish
            </button>
            <button
              onClick={() => navigate(passed && nextLesson ? `/lessons/${nextLesson.id}` : '/lessons')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${t.gradient} shadow-lg ${t.shadow}`}
            >
              {passed && nextLesson ? 'Keyingi dars' : 'Darslarga qaytish'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
