import React, { useState, useRef, useCallback, useEffect } from 'react';
import { doc, updateDoc, setDoc, increment, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { WORDS, SENTENCES, toCyrillic, getDailyWords, type Language } from '../data/words';
import type { Difficulty, Duration, TestResult, TestMode, WpmDataPoint } from '../types';
import { shuffle } from '../lib/shuffle';
import { compareWord, computeWpm } from '../lib/typing';
import { readLocal } from '../lib/storage';
import { maxCorrectChars } from '../lib/limits';
import { toDateKey } from '../lib/dates';
import { saveGroupResult } from '../lib/groupResults';

interface UseTypingTestOptions {
  userId?: string;
  groupId?: string;
  /** The owner account — exempt from anti-cheat alerts, but NOT from the score cap. */
  isOwner?: boolean;
  /** The boost mechanic is live (owner + Ctrl+Shift+H). Doubles score and lifts the cap. */
  cheatMode?: boolean;
}

export function useTypingTest(opts: UseTypingTestOptions = {}) {
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [wordStatuses, setWordStatuses] = useState<(boolean | null)[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ type: 'correct' | 'incorrect' | null; key: number }>({ type: null, key: 0 });
  /** The most recent mistyped word and its correct spelling, shown live during the test. */
  const [lastMistake, setLastMistake] = useState<{ typed: string; correct: string } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [duration, setDuration] = useState<Duration>(60);
  const [isLatin, setIsLatin] = useState(true);
  const [language, setLanguage] = useState<Language>('uz');
  const [testMode, setTestMode] = useState<TestMode>('words');
  const [isDaily, setIsDaily] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);
  const [charErrors, setCharErrors] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);


  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const correctCharsRef = useRef(0);
  /** Words typed exactly right — each one also cost a space keystroke, counted in WPM. */
  const completedWordsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const errorCountRef = useRef(0);
  const charErrorsRef = useRef<Record<string, number>>({});
  const startTimeRef = useRef(0);
  const wpmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // The Cyrillic script toggle applies to every Uzbek word list, not just the
  // shuffled one: the daily challenge used to return before this ran, so
  // "Кирил + Kunlik" silently served Latin words.
  const localize = useCallback(
    (list: string[]) => (language === 'uz' && !isLatin ? list.map(toCyrillic) : list),
    [language, isLatin],
  );

  const generateWords = useCallback(() => {
    if (isDaily) {
      setWords(localize(getDailyWords(language, difficulty)));
      return;
    }
    if (testMode === 'sentences') {
      const sents = SENTENCES[language] || SENTENCES.uz;
      const allWords = sents.join(' ').split(' ');
      setWords([...allWords, ...allWords, ...allWords]);
      return;
    }
    const langWords = WORDS[language] || WORDS.uz;
    const shuffled = shuffle(localize(langWords[difficulty]));
    setWords([...shuffled, ...shuffled, ...shuffled]);
  }, [localize, difficulty, language, testMode, isDaily]);

  useEffect(() => {
    generateWords();
  }, [generateWords]);

  const playSound = (type: 'incorrect' | 'finish') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'incorrect') {
        osc.frequency.value = 220;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else {
        osc.frequency.value = 523;
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => { osc.frequency.value = 659; }, 150);
        setTimeout(() => { osc.frequency.value = 784; }, 300);
        osc.stop(ctx.currentTime + 0.5);
      }

      osc.onended = () => {
        ctx.close().catch(() => {});
      };
    } catch {}
  };

  const finishedRef = useRef(false);

  const finishTest = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (wpmIntervalRef.current) { clearInterval(wpmIntervalRef.current); wpmIntervalRef.current = null; }

    // Cap correct characters at what this duration allows. Only the live boost
    // mechanic lifts the cap; the owner with the toggle off is capped like anyone
    // else. A genuine attempt to exceed the cap is reported to the admin below.
    const cap = maxCorrectChars(duration);
    const rawCC = correctCharsRef.current;
    const exceeded = !opts.isOwner && rawCC > cap;
    const cc = opts.cheatMode ? rawCC : Math.min(cap, rawCC);
    const ic = incorrectCharsRef.current;
    const ec = errorCountRef.current;
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    // Each finished word also cost a space keystroke, which counts toward speed
    // even though it is not one of the word's own characters.
    const wpm = computeWpm(cc, completedWordsRef.current, elapsed);
    const cpm = elapsed > 0 ? Math.round(cc / elapsed) : 0; // correct chars per minute
    const total = cc + ic;
    const accuracy = total > 0 ? Math.round((cc / total) * 100) : 0;

    const newResult: TestResult = {
      id: Date.now().toString(),
      userId: opts.userId,
      wpm, cpm, accuracy,
      errors: ec,
      correctChars: cc,
      incorrectChars: ic,
      difficulty,
      duration,
      date: new Date().toLocaleTimeString(),
      // Recorded so a stored result can be read back on its own terms: the
      // history cards used to show every test identically, with no way to tell
      // a daily challenge or a Russian sentence run from an ordinary one.
      language,
      mode: testMode,
      isDaily,
      charErrors: { ...charErrorsRef.current },
    };

    setResult(newResult);
    playSound('finish');

    // Save to localStorage
    const saved = readLocal<TestResult[]>('typing_history', []);
    const updated = [newResult, ...saved].slice(0, 20);
    localStorage.setItem('typing_history', JSON.stringify(updated));

    // Save daily streak date
    try {
      const dates = readLocal<string[]>('typing_streak_dates', []);
      const todayKey = toDateKey();
      if (!dates.includes(todayKey)) {
        localStorage.setItem('typing_streak_dates', JSON.stringify([...dates, todayKey]));
      }
    } catch {}

    // Save to Firestore if user logged in
    if (opts.userId) {
      try {
        const userRef = doc(db, 'typingUsers', opts.userId);
        const userSnap = await getDoc(userRef);
        const authUser = auth.currentUser;
        let displayName = authUser?.displayName || 'Foydalanuvchi';
        let email = authUser?.email || '';

        if (userSnap.exists()) {
          const data = userSnap.data();
          displayName = data.displayName || displayName;
          email = data.email || email;
          const prevTotal = data.totalTests || 0;
          const prevAvg = data.averageWpm || 0;
          const prevBest = data.bestWpm || 0;
          const newTotal = prevTotal + 1;
          const newAvg = Math.round((prevAvg * prevTotal + wpm) / newTotal);
          const newBest = Math.max(prevBest, wpm);

          await updateDoc(userRef, {
            averageWpm: newAvg,
            bestWpm: newBest,
            totalTests: increment(1),
            totalCorrectChars: increment(cc),
          });
        } else {
          // A signed-in user whose profile document is missing — deleted from the
          // admin panel, or a sign-up that failed halfway — used to fall through
          // here and lose the result with no error anywhere. Rebuild the profile
          // from the auth token and count this test as its first.
          await setDoc(userRef, {
            uid: opts.userId,
            displayName,
            email,
            photoURL: authUser?.photoURL || '',
            createdAt: serverTimestamp(),
            averageWpm: wpm,
            bestWpm: wpm,
            totalTests: 1,
            totalCorrectChars: cc,
          });
        }

        // Anti-cheat: if the raw (uncapped) score passed the hard limit, notify
        // the admin. Reported with the same WPM formula as the score itself —
        // its own arithmetic here used to show the admin a slower speed than
        // the one that tripped the limit.
        if (exceeded) {
          await addDoc(collection(db, 'cheatAlerts'), {
            userId: opts.userId,
            displayName,
            email,
            correctChars: rawCC,
            wpm: computeWpm(rawCC, completedWordsRef.current, elapsed),
            difficulty,
            duration,
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("Failed to save result:", err);
      }

      // A test started from inside a group also counts towards that group's
      // ranking. Kept separate from the profile write above so a failure here
      // cannot cost the user their global stats.
      if (opts.groupId) {
        try {
          await saveGroupResult(opts.groupId, opts.userId, {
            wpm, accuracy, correctChars: cc, incorrectChars: ic, difficulty, duration,
          });
        } catch (err) {
          console.error('Failed to save group result:', err);
        }
      }
    }
  }, [opts.userId, opts.groupId, opts.isOwner, opts.cheatMode, difficulty, duration, language, testMode, isDaily]);

  const startTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);

    finishedRef.current = false;
    setIsActive(true);
    setIsFinished(false);
    setTimeLeft(duration);
    setCurrentWordIndex(0);
    setUserInput('');
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrorCount(0);
    setWordStatuses([]);
    setLastFeedback({ type: null, key: 0 });
    setLastMistake(null);
    setWpmHistory([]);
    setCharErrors({});
    setResult(null);

    correctCharsRef.current = 0;
    completedWordsRef.current = 0;
    incorrectCharsRef.current = 0;
    errorCountRef.current = 0;
    charErrorsRef.current = {};
    startTimeRef.current = Date.now();

    generateWords();

    if (inputRef.current) inputRef.current.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // WPM history for live chart
    wpmIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      const wpm = computeWpm(correctCharsRef.current, completedWordsRef.current, elapsed);
      const sec = Math.round((Date.now() - startTimeRef.current) / 1000);
      setWpmHistory(prev => [...prev, { second: sec, wpm }]);
    }, 2000);
  }, [duration, generateWords, finishTest]);

  const submitWord = useCallback((value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const targetWord = words[currentWordIndex];
    if (!targetWord) return;

    const { correctChars: wordCorrectChars, incorrectChars: wordIncorrectChars, isCorrect, errorChars } =
      compareWord(trimmedValue, targetWord);
    for (const errChar of errorChars) {
      charErrorsRef.current[errChar] = (charErrorsRef.current[errChar] || 0) + 1;
    }

    // Only the characters of the word itself. The trailing space used to be added
    // here too, which made a correctly typed 4-letter word report 5 correct
    // characters; it is tracked separately now and only affects WPM.
    const boost = opts.cheatMode ? 2 : 1;
    const added = wordCorrectChars * boost;
    if (isCorrect) completedWordsRef.current += boost;

    setCorrectChars(p => p + added);
    correctCharsRef.current += added;
    setIncorrectChars(p => p + wordIncorrectChars);
    incorrectCharsRef.current += wordIncorrectChars;

    if (!isCorrect) {
      setErrorCount(p => p + 1);
      errorCountRef.current += 1;
      setLastMistake({ typed: trimmedValue, correct: targetWord });
      playSound('incorrect');
    }

    setWordStatuses(prev => {
      const ns = [...prev];
      ns[currentWordIndex] = isCorrect;
      return ns;
    });
    setCharErrors({ ...charErrorsRef.current });
    setLastFeedback({ type: isCorrect ? 'correct' : 'incorrect', key: Date.now() });
    setUserInput('');
    setCurrentWordIndex(p => p + 1);
  }, [words, currentWordIndex, opts.cheatMode]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    const value = e.target.value;

    if (value.endsWith(' ') || value.endsWith('\n')) {
      submitWord(value);
    } else {
      setUserInput(value);
    }
  }, [isActive, submitWord]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;
    if (e.key === 'Enter') submitWord(userInput);
  }, [isActive, userInput, submitWord]);

  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    finishedRef.current = false;
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setCurrentWordIndex(0);
    setUserInput('');
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrorCount(0);
    setWordStatuses([]);
    setLastFeedback({ type: null, key: 0 });
    setLastMistake(null);
    setWpmHistory([]);
    setCharErrors({});
    setResult(null);
    correctCharsRef.current = 0;
    completedWordsRef.current = 0;
    incorrectCharsRef.current = 0;
    errorCountRef.current = 0;
    charErrorsRef.current = {};
    generateWords();
  }, [duration, generateWords]);

  // Compute live WPM
  const liveWpm = isActive && startTimeRef.current
    ? computeWpm(correctChars, completedWordsRef.current, (Date.now() - startTimeRef.current) / 60000)
    : 0;

  // Correct chars for display, clamped to the hard cap (lifted only while boosting).
  const displayCorrectChars = opts.cheatMode
    ? correctChars
    : Math.min(maxCorrectChars(duration), correctChars);

  return {
    words, currentWordIndex, userInput, timeLeft, isActive, isFinished,
    correctChars, displayCorrectChars, incorrectChars, errorCount, wordStatuses, lastFeedback, lastMistake,
    difficulty, duration, isLatin, language, testMode, isDaily,
    wpmHistory, charErrors, result, liveWpm,
    inputRef,
    setDifficulty, setDuration, setIsLatin, setLanguage, setTestMode, setIsDaily,
    startTest, resetTest, handleInput, handleKeyDown, generateWords,
  };
}
