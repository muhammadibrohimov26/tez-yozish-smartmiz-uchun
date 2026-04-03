/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Volume2, VolumeX, RotateCcw, Trophy, AlertCircle, Keyboard, Zap, Timer } from 'lucide-react';

// Uzbek words categorized by difficulty
const WORDS_BY_DIFFICULTY = {
 easy: [
    "ona","smartmiz", "ilm", "baxt", "gul", "non", "suv", "aka", "uka", "opa", "ota", 
    "bola", "yo'l", "uy", "ish", "oq", "ko'k", "tez", "past", "ko'z", "qo'l", 
    "bosh", "tish", "til", "soch", "fan", "bog'", "yer", "oy", "kun", "tun", 
    "qor", "muz", "tog'", "ko'l", "yel", "choy", "sut", "tuz", "asal", "osh", 
    "non", "meva", "anor", "olma", "behi", "uzum", "shat", "xat", "qalam", "daftar", 
    "kitob", "stol", "stul", "deraza", "eshik", "devor", "tom", "pol", "shahar", "qishloq",
    "boy", "kam", "ko'p", "keng", "tor", "sog'", "yov", "yot", "yosh", "qari",
    "yuz", "lab", "oyoq", "bel", "yur", "tur", "kel", "ket", "ayt", "yoz",
    "o'qi", "ishla", "uxla", "tur", "ovqat", "suv", "non", "sariyog'", "qaymoq", "shakar"
],
 medium: [
    "vatan", "smartmiz", "maktab", "kitob", "ustoz", "quyosh", "osmon", "yulduz", "daryo", 
    "daraxt", "shahar", "o'qish", "yozish", "ko'rish", "yaxshi", "yomon", "katta", 
    "kichik", "issiq", "sovuq", "shirin", "qizil", "sariq", "pushti", "bugun", 
    "hozir", "sekin", "yurak", "oyoq", "quloq", "burun", "davlat", "bayroq", 
    "qonun", "huquq", "vazifa", "aloqa", "san'at", "sport", "qalam", "daftar",
    "xona", "bog'cha", "o'rmon", "bulut", "yomg'ir", "shamol", "tuman", "bahor",
    "yozgi", "kuzgi", "qishki", "do'stlik", "hurmat", "shon-sharaf", "baxtli", "tinchlik",
    "bilim", "mehnat", "rahmat", "kechirim", "sog'liq", "boylik", "donolik", "ozodlik",
    "ertaga", "kecha", "har doim", "hech qachon", "ba'zan", "tezda", "darhol", "ehtiyot",
    "ovqat", "meva", "sabzavot", "bozor", "do'kon", "mashina", "poyezd", "samolyot",
    "qiziqarli", "chiroyli", "aqlli", "kuchli", "toza", "ozoda", "og'ir", "yengil"
],
  hard: [
    "mustaqillik", "smartmiz","erkinlik", "adolat", "kompyuter", "telefon", "internet", 
    "dastur", "axborot", "texnika", "tinchlik", "qishloq", "gapirish", 
    "eshitish", "yugurish", "sakrash", "o'ynash", "kulish", "achchiq", 
    "jigarrang", "binafsha", "kulrang", "ertaga", "kecha", "doim", 
    "hech qachon", "baland", "madhiya", "universitet", "shifoxona", "kutubxona", 
    "tadbirkor", "o'qituvchi", "shifokor", "muhandis", "iqtisodiyot", "siyosat",
    "ma'naviyat", "ma'rifat", "taraqqiyot", "investitsiya", "texnologiya", "shartnoma",
    "mas'uliyat", "muvaffaqiyat", "imkoniyat", "tushuncha", "qarash", "munosabat",
    "jamiyat", "madaniyat", "an'ana", "qadriyat", "iste'dod", "qobiliyat",
    "tadqiqot", "tajriba", "xavfsizlik", "intizom", "natija", "samara",
    "istiqlol", "barqarorlik", "hamkorlik", "rejalashtirish", "boshqaruv", "loyiha",
    "tashkilot", "korxona", "faoliyat", "jarayon", "muammo", "yechim",
    "mukammal", "shaffof", "zamonaviy", "iqtidor", "mahorat", "xizmat",
    "xalqaro", "mahalliy", "iqlim", "ekologiya", "tabiatni-muhofaza-qilish"
],
};

type Difficulty = 'easy' | 'medium' | 'hard';

const latinToCyrillicMap: { [key: string]: string } = {
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й',
  'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
  'f': 'ф', 'x': 'х', 'ts': 'ц', 'ch': 'ч', 'sh': 'ш', 'yu': 'ю', 'ya': 'я', 'o\'': 'ў', 'g\'': 'ғ', 'h': 'ҳ', 'q': 'қ'
};

function toCyrillic(text: string): string {
  let result = text.toLowerCase();
  result = result.replace(/sh/g, 'ш').replace(/ch/g, 'ч').replace(/yu/g, 'ю').replace(/ya/g, 'я').replace(/o'/g, 'ў').replace(/g'/g, 'ғ');
  return result.split('').map(char => latinToCyrillicMap[char] || char).join('');
}

interface Result {
  id: number;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  date: string;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLatin, setIsLatin] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [wordStatuses, setWordStatuses] = useState<(boolean | null)[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ type: 'correct' | 'incorrect' | null, key: number }>({ type: null, key: 0 });
  const [history, setHistory] = useState<Result[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateWords = useCallback(() => {
    const baseWords = WORDS_BY_DIFFICULTY[difficulty];
    const localizedWords = isLatin ? baseWords : baseWords.map(toCyrillic);
    const shuffled = [...localizedWords].sort(() => Math.random() - 0.5);
    setWords([...shuffled, ...shuffled, ...shuffled]);
  }, [isLatin, difficulty]);

  useEffect(() => {
    generateWords();
    const savedHistory = localStorage.getItem('typing_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, [generateWords]);

  useEffect(() => {
    if (!isFinished && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFinished, isActive]);

  const startTest = () => {
    setIsActive(true);
    setIsFinished(false);
    setTimeLeft(60);
    setCurrentWordIndex(0);
    setUserInput("");
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrorCount(0);
    setWordStatuses([]);
    setLastFeedback({ type: null, key: 0 });
    generateWords();
    
    if (inputRef.current) {
      inputRef.current.focus();
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const wpm = Math.round((correctChars / 5));
    const cpm = correctChars;
    const totalAttemptedChars = correctChars + incorrectChars;
    const accuracy = Math.round((correctChars / totalAttemptedChars) * 100) || 0;

    const newResult: Result = {
      id: Date.now(),
      wpm,
      cpm,
      accuracy,
      errors: errorCount,
      correctChars,
      incorrectChars,
      date: new Date().toLocaleTimeString()
    };

    const updatedHistory = [newResult, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('typing_history', JSON.stringify(updatedHistory));
  };

  const submitWord = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const targetWord = words[currentWordIndex];
    const isCorrect = trimmedValue === targetWord;

    // Count correct and incorrect characters
    let wordCorrectChars = 0;
    let wordIncorrectChars = 0;
    
    const maxLength = Math.max(trimmedValue.length, targetWord.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < trimmedValue.length && i < targetWord.length) {
        if (trimmedValue[i] === targetWord[i]) {
          wordCorrectChars++;
        } else {
          wordIncorrectChars++;
        }
      } else if (i < trimmedValue.length) {
        wordIncorrectChars++;
      } else {
        wordIncorrectChars++;
      }
    }

    setCorrectChars(prev => prev + wordCorrectChars + (isCorrect ? 1 : 0));
    setIncorrectChars(prev => prev + wordIncorrectChars);
    
    if (!isCorrect) {
      setErrorCount(prev => prev + 1);
    }

    setWordStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[currentWordIndex] = isCorrect;
      return newStatuses;
    });

    setLastFeedback({ type: isCorrect ? 'correct' : 'incorrect', key: Date.now() });
    setUserInput("");
    setCurrentWordIndex(prev => prev + 1);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive) return;

    if (value.endsWith(" ") || value.endsWith("\n")) {
      submitWord(value);
    } else {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;
    if (e.key === 'Enter') {
      submitWord(userInput);
    }
  };

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(60);
    setCurrentWordIndex(0);
    setUserInput("");
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrorCount(0);
    setWordStatuses([]);
    setLastFeedback({ type: null, key: 0 });
    generateWords();
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
          </>
        )}
      </div>

      <div className="relative max-w-6xl mx-auto p-4 md:p-12 space-y-12">
        {/* Top Controls */}
        <div className="flex flex-wrap justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Theme Toggle */}
            <div className={`flex items-center p-1 rounded-2xl border transition-all ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              <button 
                onClick={() => setIsDarkMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-white/40 hover:text-white/70'}`}
              >
                <Sun className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Oq</span>
              </button>
              <button 
                onClick={() => setIsDarkMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Moon className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Qora</span>
              </button>
            </div>

            {/* Script Toggle */}
            <div className={`flex items-center p-1 rounded-2xl border transition-all ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              <button 
                onClick={() => setIsLatin(true)}
                className={`px-4 py-2 rounded-xl transition-all ${isLatin ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-50 hover:opacity-100'}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Lotin</span>
              </button>
              <button 
                onClick={() => setIsLatin(false)}
                className={`px-4 py-2 rounded-xl transition-all ${!isLatin ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white text-blue-600 shadow-sm') : 'text-gray-400 opacity-50 hover:opacity-100'}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">Крил</span>
              </button>
            </div>

            {/* Difficulty Toggle */}
            <div className={`flex items-center p-1 rounded-2xl border transition-all ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    if (!isActive) generateWords();
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    difficulty === level 
                      ? (isDarkMode ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-blue-600 text-white shadow-md') 
                      : 'text-gray-400 opacity-40 hover:opacity-100'
                  }`}
                >
                  {level === 'easy' ? 'Oson' : level === 'medium' ? "O'rta" : 'Qiyin'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Sound Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'border-white/5 bg-white/5 text-white/40 hover:text-white/100 hover:bg-white/10' : 'border-gray-200 bg-white text-gray-400 hover:text-gray-900 hover:shadow-md'}`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xl tracking-tighter leading-none">SMARTMIZ</span>
                <span className="text-[10px] font-bold opacity-30 tracking-[0.2em] uppercase">Typing Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header Title Box */}
        <div className="w-full text-center space-y-2">
          <h1 className="text-7xl font-display font-black tracking-tighter bg-gradient-to-b from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Tez yozish
          </h1>
          <p className="text-xs font-bold opacity-30 uppercase tracking-[0.5em]">Master your typing skills</p>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-3 items-center gap-4 px-4">
          <div className="flex justify-start">
            <div className={`px-6 py-2 rounded-2xl border text-[10px] font-black tracking-[0.3em] uppercase ${isDarkMode ? 'border-white/5 bg-white/5 text-white/30' : 'border-gray-200 bg-white text-gray-400'}`}>
              {difficulty === 'easy' ? 'Oson' : difficulty === 'medium' ? "O'rta" : 'Qiyin'}
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className={`px-12 py-4 rounded-3xl border text-5xl font-display font-black shadow-2xl transition-all ${
              isActive 
                ? (isDarkMode ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-blue-500/20' : 'border-blue-500 bg-blue-50 text-blue-600 shadow-blue-500/10') 
                : (isDarkMode ? 'border-white/5 bg-white/5 text-white/20' : 'border-gray-200 bg-white text-gray-200')
            }`}>
              {isActive ? timeLeft : (isFinished ? Math.round(correctChars / 5) : '00')}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <div className={`px-4 py-2 rounded-2xl border flex flex-col items-center min-w-[80px] ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">To'g'ri</span>
              <span className="text-xl font-display font-bold text-blue-500">{Math.round(correctChars / 5)}</span>
            </div>
            <div className={`px-4 py-2 rounded-2xl border flex flex-col items-center min-w-[80px] ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Xato</span>
              <span className="text-xl font-display font-bold text-rose-500">{errorCount}</span>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className={`w-full min-h-[450px] rounded-[40px] border p-8 md:p-16 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
          isDarkMode 
            ? 'border-white/5 bg-white/5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]' 
            : 'border-gray-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]'
        }`}>
          <AnimatePresence mode="wait">
            {isFinished ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-12 w-full max-w-2xl"
              >
                <div className="space-y-2">
                  <h2 className="text-5xl font-display font-black tracking-tighter">Natijangiz</h2>
                  <p className="text-sm opacity-40 font-bold uppercase tracking-widest">Ajoyib natija, yana bir bor urinib ko'ring!</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className={`p-8 rounded-[32px] border transition-all hover:scale-105 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-2">Tezlik (WPM)</p>
                    <p className="text-6xl font-display font-black text-blue-500 tracking-tighter">{Math.round(correctChars / 5)}</p>
                  </div>
                  <div className={`p-8 rounded-[32px] border transition-all hover:scale-105 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-2">Aniqlik (%)</p>
                    <p className="text-6xl font-display font-black text-emerald-500 tracking-tighter">{Math.round((correctChars / (correctChars + incorrectChars)) * 100) || 0}</p>
                  </div>
                  <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">To'g'ri belgilar</p>
                    <p className="text-3xl font-display font-bold text-blue-400">{correctChars}</p>
                  </div>
                  <div className={`p-6 rounded-[28px] border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-1">Xato belgilar</p>
                    <p className="text-3xl font-display font-bold text-rose-500">{incorrectChars}</p>
                  </div>
                </div>
                
                <button 
                  onClick={resetTest}
                  className="w-full py-6 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-4 group active:scale-95"
                >
                  <RotateCcw className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" /> 
                  <span>Qayta boshlash</span>
                </button>
              </motion.div>
            ) : !isActive ? (
              <motion.div 
                key="start"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-12 w-full max-w-md"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                  <div className="relative space-y-4">
                    <h2 className="text-6xl font-display font-black tracking-tighter">Tayyormisiz?</h2>
                    <p className="text-sm opacity-40 font-bold uppercase tracking-[0.2em]">O'zingizni sinab ko'ring</p>
                  </div>
                </div>
                
                <button 
                  onClick={startTest}
                  className="w-full py-8 rounded-[32px] bg-blue-600 hover:bg-blue-700 text-white font-black text-4xl transition-all shadow-2xl shadow-blue-600/40 flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <span>Boshlash</span>
                    <Zap className="w-10 h-10 fill-white/20 group-hover:scale-125 transition-transform duration-500" />
                  </div>
                  <span className="text-[10px] opacity-50 font-bold uppercase tracking-[0.4em]">Start Typing</span>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full space-y-16 flex flex-col items-center"
              >
                {/* Single Word Display */}
                <div className="relative h-32 flex items-center justify-center w-full">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="flex flex-col items-center"
                    >
                      <span className={`text-8xl font-display font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {words[currentWordIndex] || "..."}
                      </span>
                      <div className="mt-4 flex gap-2">
                        {words[currentWordIndex]?.split('').map((char, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 w-4 rounded-full transition-all duration-300 ${
                              i < userInput.length 
                                ? (userInput[i] === char ? 'bg-blue-500' : 'bg-rose-500')
                                : (isDarkMode ? 'bg-white/10' : 'bg-gray-200')
                            }`} 
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative w-full max-w-3xl mx-auto">
                  <motion.input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    disabled={!isActive}
                    className={`w-full bg-transparent border-b-[6px] p-8 text-6xl font-display font-black text-center focus:outline-none transition-all duration-300 ${
                      lastFeedback.type === 'incorrect' 
                        ? 'border-rose-500 text-rose-500' 
                        : 'border-blue-500 text-blue-500'
                    } ${isDarkMode ? 'placeholder:text-white/5' : 'placeholder:text-gray-100'}`}
                    placeholder="TAYYOR..."
                  />
                  
                  {/* Progress indicator */}
                  <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i < (currentWordIndex % 10) 
                            ? "w-12 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                            : "w-6 " + (isDarkMode ? "bg-white/10" : "bg-gray-200")
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Section */}
        {!isActive && history.length > 0 && (
          <div className="space-y-8">
            <div className="flex justify-between items-end px-4">
              <div className="space-y-1">
                <h3 className="text-3xl font-display font-black tracking-tighter flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" /> Shaxsiy Rekordlar
                </h3>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Sizning eng yaxshi natijalaringiz</p>
              </div>
              <button 
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('typing_history');
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isDarkMode ? 'bg-white/5 text-white/30 hover:text-white/100 hover:bg-white/10' : 'bg-gray-100 text-gray-400 hover:text-gray-900'
                }`}
              >
                Tarixni tozalash
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {history.map((res) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  key={res.id} 
                  className={`group p-8 rounded-[32px] border transition-all duration-500 hover:-translate-y-2 ${
                    isDarkMode 
                      ? 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30' 
                      : 'border-gray-200 bg-white hover:shadow-2xl hover:shadow-blue-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-5xl font-display font-black text-blue-500 tracking-tighter">{res.wpm}</span>
                      <span className="text-[10px] opacity-30 uppercase font-black tracking-widest">WPM</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] opacity-30 font-mono block mb-1">{res.date}</span>
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}`}>
                        {res.accuracy}% Aniqlik
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase opacity-30 font-black tracking-widest">Belgilar</p>
                      <p className="text-xl font-display font-bold">{res.cpm}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase opacity-30 font-black tracking-widest text-emerald-500/50">To'g'ri</p>
                      <p className="text-xl font-display font-bold text-emerald-500">{res.correctChars}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${res.accuracy}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" 
                      />
                    </div>
                    <span className="text-[10px] font-black opacity-30">{res.accuracy}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
