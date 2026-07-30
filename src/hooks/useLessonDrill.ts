import { useState, useRef, useCallback, useEffect } from 'react';
import { generateDrillText, type Lesson } from '../data/lessons';
import { saveLessonResult } from '../lib/lessonProgress';

export interface LessonDrillResult {
  wpm: number;
  accuracy: number;
}

/**
 * Keystroke-by-keystroke drill: unlike the word-based typing test, the cursor only
 * advances on a CORRECT keypress — a wrong key just counts as a mistake and blocks
 * progress, which is the standard touch-typing-tutor drilling behaviour.
 */
export function useLessonDrill(lesson: Lesson) {
  const [text, setText] = useState(() => generateDrillText(lesson));
  const [position, setPosition] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<LessonDrillResult | null>(null);
  const [lastWrongKey, setLastWrongKey] = useState<{ key: string; at: number } | null>(null);

  const startTimeRef = useRef(0);
  const finishedRef = useRef(false);
  const mistakeCountRef = useRef(0);
  const positionRef = useRef(0);

  const reset = useCallback(() => {
    finishedRef.current = false;
    mistakeCountRef.current = 0;
    positionRef.current = 0;
    startTimeRef.current = 0;
    setText(generateDrillText(lesson));
    setPosition(0);
    setMistakeCount(0);
    setIsActive(false);
    setIsFinished(false);
    setResult(null);
    setLastWrongKey(null);
  }, [lesson]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const finish = useCallback((correctCount: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const elapsedMin = Math.max((Date.now() - startTimeRef.current) / 60000, 1 / 60000);
    const wpm = Math.round((correctCount / 5) / elapsedMin);
    const total = correctCount + mistakeCountRef.current;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    setIsActive(false);
    setIsFinished(true);
    setResult({ wpm, accuracy });
    saveLessonResult(lesson.id, wpm, accuracy);
  }, [lesson.id]);

  useEffect(() => {
    if (isFinished) return;

    // Side effects live here in the handler body, not inside a setState updater —
    // React (in StrictMode) may invoke functional updaters twice, which would
    // double-count mistakes if the counting happened inside one.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key === 'Spacebar' ? ' ' : e.key;
      if (key.length !== 1) return; // ignore Shift, Enter, arrows, function keys, etc.

      e.preventDefault();
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      setIsActive(true);

      const prevPos = positionRef.current;
      const expected = text[prevPos];
      if (expected === undefined) return; // finished, but the listener has not torn down yet

      // Only the Shift lesson demands the right case; elsewhere a stray Caps Lock
      // should not be scored as a typing mistake.
      const matches = lesson.caseSensitive
        ? key === expected
        : key.toLowerCase() === expected.toLowerCase();
      if (matches) {
        const nextPos = prevPos + 1;
        positionRef.current = nextPos;
        setPosition(nextPos);
        if (nextPos >= text.length) finish(nextPos);
      } else {
        mistakeCountRef.current += 1;
        setMistakeCount(mistakeCountRef.current);
        setLastWrongKey({ key, at: Date.now() });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [text, isFinished, finish, lesson.caseSensitive]);

  const activeChar = !isFinished ? text[position] : undefined;

  return {
    text, position, mistakeCount, isActive, isFinished, result, lastWrongKey, activeChar,
    retry: reset,
  };
}
