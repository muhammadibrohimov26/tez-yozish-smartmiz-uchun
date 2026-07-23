import React, { useState, useRef, useCallback, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { WORDS, SENTENCES, toCyrillic, getDailyWords, type Language } from '../data/words';
import type { Difficulty, Duration, TestResult, TestMode, WpmDataPoint } from '../types';

interface UseTypingTestOptions {
  userId?: string;
  groupId?: string;
  isOwner?: boolean;
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
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [duration, setDuration] = useState<Duration>(60);
  const [isLatin, setIsLatin] = useState(true);
  const [language, setLanguage] = useState<Language>('uz');
  const [testMode, setTestMode] = useState<TestMode>('words');
  const [isDaily, setIsDaily] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<WpmDataPoint[]>([]);
  const [charErrors, setCharErrors] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [cheatEnabled, setCheatEnabled] = useState(!!opts.isOwner);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  const errorCountRef = useRef(0);
  const charErrorsRef = useRef<Record<string, number>>({});
  const startTimeRef = useRef(0);
  const wpmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateWords = useCallback(() => {
    if (isDaily) {
      setWords(getDailyWords(language, difficulty));
      return;
    }
    if (testMode === 'sentences') {
      const sents = SENTENCES[language] || SENTENCES.uz;
      const allWords = sents.join(' ').split(' ');
      setWords([...allWords, ...allWords, ...allWords]);
      return;
    }
    const langWords = WORDS[language] || WORDS.uz;
    const baseWords = langWords[difficulty];
    const localizedWords = (language === 'uz' && !isLatin) ? baseWords.map(toCyrillic) : baseWords;
    const shuffled = [...localizedWords].sort(() => Math.random() - 0.5);
    setWords([...shuffled, ...shuffled, ...shuffled]);
  }, [isLatin, difficulty, language, testMode, isDaily]);

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

  const finishTest = useCallback(() => {
    // Guard against double execution (StrictMode / double interval fire)
    if (finishedRef.current) return;
    finishedRef.current = true;

    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (wpmIntervalRef.current) { clearInterval(wpmIntervalRef.current); wpmIntervalRef.current = null; }

    const cc = correctCharsRef.current;
    const ic = incorrectCharsRef.current;
    const ec = errorCountRef.current;
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const wpm = elapsed > 0 ? Math.round((cc / 5) / elapsed) : 0;
    const cpm = cc;
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
      charErrors: { ...charErrorsRef.current },
    };

    setResult(newResult);
    playSound('finish');

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('typing_history') || '[]');
    const updated = [newResult, ...saved].slice(0, 20);
    localStorage.setItem('typing_history', JSON.stringify(updated));

    // Save daily streak date
    try {
      const today = new Date().toDateString();
      const streakDates = JSON.parse(localStorage.getItem('typing_streak_dates') || '[]') as string[];
      if (!streakDates.includes(today)) {
        streakDates.push(today);
        localStorage.setItem('typing_streak_dates', JSON.stringify(streakDates));
      }
    } catch (e) {
      console.error('Error saving streak date:', e);
    }

    // Save to Firebase if logged in
    if (opts.userId) {
      addDoc(collection(db, 'typingResults'), {
        ...newResult,
        createdAt: serverTimestamp(),
      }).catch(console.error);

      // Update user profile stats including bestWpm and averageWpm
      const userRef = doc(db, 'typingUsers', opts.userId);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          const oldTotal = data.totalTests || 0;
          const oldAvg = data.averageWpm || 0;
          const newAvg = Math.round(((oldAvg * oldTotal) + wpm) / (oldTotal + 1));
          const newBest = Math.max(data.bestWpm || 0, wpm);
          updateDoc(userRef, {
            totalTests: increment(1),
            totalCorrectChars: increment(cc),
            averageWpm: newAvg,
            bestWpm: newBest,
          });
        }
      }).catch(console.error);

      // Save to group if in group context
      if (opts.groupId) {
        addDoc(collection(db, 'groups', opts.groupId, 'results'), {
          ...newResult,
          createdAt: serverTimestamp(),
        }).catch(console.error);
      }
    }
  }, [difficulty, duration, opts.userId, opts.groupId]);

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
    setWpmHistory([]);
    setCharErrors({});
    setResult(null);

    correctCharsRef.current = 0;
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
      const wpm = elapsed > 0 ? Math.round((correctCharsRef.current / 5) / elapsed) : 0;
      const sec = Math.round((Date.now() - startTimeRef.current) / 1000);
      setWpmHistory(prev => [...prev, { second: sec, wpm }]);
    }, 2000);
  }, [duration, generateWords, finishTest]);

  const submitWord = useCallback((value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const targetWord = words[currentWordIndex];
    if (!targetWord) return;
    const isCorrect = trimmedValue === targetWord;

    let wordCorrectChars = 0;
    let wordIncorrectChars = 0;
    const maxLength = Math.max(trimmedValue.length, targetWord.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < trimmedValue.length && i < targetWord.length) {
        if (trimmedValue[i] === targetWord[i]) {
          wordCorrectChars++;
        } else {
          wordIncorrectChars++;
          const errChar = targetWord[i];
          charErrorsRef.current[errChar] = (charErrorsRef.current[errChar] || 0) + 1;
        }
      } else {
        wordIncorrectChars++;
      }
    }

    const added = wordCorrectChars + (isCorrect ? 1 : 0);
    setCorrectChars(p => p + added);
    correctCharsRef.current += added;
    setIncorrectChars(p => p + wordIncorrectChars);
    incorrectCharsRef.current += wordIncorrectChars;

    if (!isCorrect) {
      setErrorCount(p => p + 1);
      errorCountRef.current += 1;
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
  }, [words, currentWordIndex]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return;
    let value = e.target.value;

    if (opts.isOwner && cheatEnabled) {
      if (value.length > userInput.length && !value.endsWith(' ') && !value.endsWith('\n')) {
        const targetWord = words[currentWordIndex];
        if (targetWord) {
          const nextPos = Math.min(userInput.length + 2, targetWord.length);
          value = targetWord.substring(0, nextPos);
          if (nextPos >= targetWord.length) {
            submitWord(value + ' ');
            return;
          }
        }
      }
    }

    if (value.endsWith(' ') || value.endsWith('\n')) {
      submitWord(value);
    } else {
      setUserInput(value);
    }
  }, [isActive, submitWord, opts.isOwner, cheatEnabled, userInput, words, currentWordIndex]);

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
    setWpmHistory([]);
    setCharErrors({});
    setResult(null);
    correctCharsRef.current = 0;
    incorrectCharsRef.current = 0;
    errorCountRef.current = 0;
    charErrorsRef.current = {};
    generateWords();
  }, [duration, generateWords]);

  // Compute live WPM
  const liveWpm = isActive && startTimeRef.current
    ? Math.round((correctChars / 5) / ((Date.now() - startTimeRef.current) / 60000)) || 0
    : 0;

  return {
    words, currentWordIndex, userInput, timeLeft, isActive, isFinished,
    correctChars, incorrectChars, errorCount, wordStatuses, lastFeedback,
    difficulty, duration, isLatin, language, testMode, isDaily,
    wpmHistory, charErrors, result, liveWpm,
    inputRef,
    cheatEnabled, setCheatEnabled,
    setDifficulty, setDuration, setIsLatin, setLanguage, setTestMode, setIsDaily,
    startTest, resetTest, handleInput, handleKeyDown, generateWords,
  };
}
