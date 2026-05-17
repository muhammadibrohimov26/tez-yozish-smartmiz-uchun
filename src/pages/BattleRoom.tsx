import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBattleRoom } from '../hooks/useBattle';
import { Trophy, ArrowLeft, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';
import type { BattleParticipant } from '../types';

export default function BattleRoom({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: string }) {
  const { id: groupId, battleId } = useParams<{ id: string, battleId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const { battle, joinBattle, leaveBattle, startBattle, updateProgress, finishRound, nextRound } = useBattleRoom(groupId, battleId, user?.uid, profile?.displayName, profile?.photoURL);
  
  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [timeLeftToStart, setTimeLeftToStart] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (battle?.status === 'waiting' && user && battle.participants[user.uid] === undefined) {
      joinBattle();
    }
  }, [battle?.status, user]);

  useEffect(() => {
    if (battle?.status === 'round_active' && battle.startTime) {
      const st = battle.startTime.toDate ? battle.startTime.toDate().getTime() : new Date(battle.startTime).getTime();
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.ceil((st - now) / 1000));
        setTimeLeftToStart(diff > 0 ? diff : null);
        
        if (diff === 0 && startTimeRef.current === 0) {
          startTimeRef.current = Date.now();
          if (inputRef.current) inputRef.current.focus();
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeftToStart(null);
      if (battle?.status !== 'round_active') {
        startTimeRef.current = 0;
      }
    }
  }, [battle?.status, battle?.startTime]);

  useEffect(() => {
    if (battle?.status === 'starting' || battle?.status === 'round_finished') {
      setCurrentWordIndex(0);
      setUserInput('');
      setCorrectChars(0);
      setIncorrectChars(0);
      startTimeRef.current = 0;
    }
  }, [battle?.status, battle?.currentRound]);

  if (!battle) return <div className="text-center py-20">Jang topilmadi...</div>;

  const me = user ? battle.participants[user.uid] : null;
  const isCreator = user?.uid === battle.creatorId;
  const isTypingActive = battle.status === 'round_active' && timeLeftToStart === null && !me?.isFinished;
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTypingActive) return;
    const value = e.target.value;
    if (value.endsWith(' ') || value.endsWith('\n')) {
      submitWord(value);
    } else {
      setUserInput(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isTypingActive) return;
    if (e.key === 'Enter') submitWord(userInput);
  };

  const submitWord = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const targetWord = battle.words[currentWordIndex];
    if (!targetWord) return;
    const isCorrect = trimmedValue === targetWord;

    let wordCorrectChars = 0;
    let wordIncorrectChars = 0;
    const maxLength = Math.max(trimmedValue.length, targetWord.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < trimmedValue.length && i < targetWord.length) {
        if (trimmedValue[i] === targetWord[i]) wordCorrectChars++;
        else wordIncorrectChars++;
      } else {
        wordIncorrectChars++;
      }
    }

    const added = wordCorrectChars + (isCorrect ? 1 : 0);
    const newCorrect = correctChars + added;
    const newIncorrect = incorrectChars + wordIncorrectChars;
    setCorrectChars(newCorrect);
    setIncorrectChars(newIncorrect);
    setUserInput('');
    
    const newIndex = currentWordIndex + 1;
    setCurrentWordIndex(newIndex);
    
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    const currentWpm = elapsed > 0 ? Math.round((newCorrect / 5) / elapsed) : 0;
    const progress = Math.min(100, Math.round((newIndex / battle.words.length) * 100));
    
    updateProgress(progress, currentWpm);

    if (newIndex >= battle.words.length) {
      const accuracy = Math.round((newCorrect / (newCorrect + newIncorrect)) * 100);
      finishRound(currentWpm, accuracy, newCorrect);
    }
  };

  const renderParticipants = () => {
    const participants: BattleParticipant[] = Object.values(battle.participants) as BattleParticipant[];
    const sorted = participants.sort((a, b) => b.progress - a.progress);
    return (
      <div className="space-y-4 w-full max-w-3xl mx-auto">
        {sorted.map((p, i) => (
          <div key={p.userId} className={`p-4 rounded-2xl border flex items-center gap-4 ${p.userId === user?.uid ? 'border-blue-500 bg-blue-500/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white')}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {p.photoURL ? <img src={p.photoURL} className="w-full h-full rounded-full object-cover" /> : p.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-bold">{p.displayName}</span>
                <span className="text-sm font-mono">{p.wpm} WPM</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} className="h-full bg-blue-500" transition={{ duration: 0.3 }} />
              </div>
            </div>
            {p.isFinished && <Trophy className="w-5 h-5 text-yellow-500" />}
          </div>
        ))}
      </div>
    );
  };

  const renderFinishedState = () => {
    const isFinal = battle.status === 'finished';
    const participants: BattleParticipant[] = Object.values(battle.participants) as BattleParticipant[];
    const sorted = participants.map(p => {
      const sum = p.roundWpms.reduce((a, b) => a + b, 0);
      const avg = p.roundWpms.length > 0 ? Math.round((sum + (isFinal ? 0 : p.wpm)) / (p.roundWpms.length + (isFinal ? 0 : 1))) : p.wpm;
      return { ...p, avg };
    }).sort((a, b) => b.avg - a.avg);

    return (
      <div className="text-center space-y-8 w-full max-w-2xl mx-auto">
        <h2 className="text-4xl font-display font-black">
          {isFinal ? '🏆 Turnir Yakunlandi' : `Raund ${battle.currentRound} Natijalari`}
        </h2>
        <div className="space-y-4">
          {sorted.map((p, i) => (
            <div key={p.userId} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
              <span className="text-2xl font-black w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
              <div className="flex-1 text-left">
                <span className="font-bold">{p.displayName}</span>
                <p className="text-xs opacity-50">Jami belgilar: {p.totalCorrectChars}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-500">{isFinal ? p.avg : p.wpm} WPM</span>
                <span className="text-xs block opacity-50">{isFinal ? "O'rtacha" : 'Raund'}</span>
              </div>
            </div>
          ))}
        </div>
        {isCreator && !isFinal && (
          <button onClick={nextRound} className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold w-full hover:bg-blue-700">
            Keyingi Raundni Boshlash
          </button>
        )}
        {isFinal && (
          <button onClick={() => navigate(`/groups/${groupId}`)} className="px-8 py-4 rounded-xl bg-gray-600 text-white font-bold w-full hover:bg-gray-700">
            Guruhga Qaytish
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex justify-between items-center">
         <button onClick={() => { leaveBattle(); navigate(`/groups/${groupId}`); }} className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className="w-6 h-6" />
         </button>
         <div className="text-center">
            <h1 className="text-2xl font-display font-black">Jang ({battle.currentRound}/{battle.totalRounds})</h1>
            <span className="text-sm opacity-50 flex items-center gap-1 justify-center"><Users className="w-4 h-4"/> {Object.keys(battle.participants).length} ishtirokchi</span>
         </div>
         <div className="w-10"></div>
      </div>

      {battle.status === 'waiting' && (
        <div className="text-center space-y-8 mt-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/20 text-blue-500 animate-pulse">
            <Zap className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display font-black">Boshqalar kutilmoqda...</h2>
          {renderParticipants()}
          {isCreator && (
            <button onClick={startBattle} className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold mt-8 shadow-lg shadow-blue-500/30 hover:scale-105 transition-all">
              Jangni Boshlash
            </button>
          )}
        </div>
      )}

      {battle.status === 'round_active' && timeLeftToStart !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.span key={timeLeftToStart} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-9xl font-display font-black text-white">
              {timeLeftToStart}
            </motion.span>
         </div>
      )}

      {battle.status === 'round_active' && (
        <div className="space-y-12">
          {renderParticipants()}
          {!me?.isFinished && (
             <div className="w-full max-w-2xl mx-auto">
              <div className="text-4xl sm:text-6xl font-display font-black tracking-tighter text-center mb-8">
                {battle.words[currentWordIndex] || '...'}
              </div>
              <input ref={inputRef} type="text" value={userInput} onChange={handleInput} onKeyDown={handleKeyDown}
                  autoFocus disabled={!isTypingActive}
                  className={`w-full bg-transparent border-b-4 p-4 text-3xl text-center focus:outline-none transition-all duration-300 ${isDarkMode ? 'placeholder:text-white/5 border-white/20' : 'placeholder:text-gray-100 border-gray-200'}`}
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  placeholder="TAYYOR..." />
             </div>
          )}
          {me?.isFinished && (
             <div className="text-center text-2xl font-bold py-10 opacity-50 animate-pulse">
                Boshqalarni kutamiz...
             </div>
          )}
        </div>
      )}

      {(battle.status === 'round_finished' || battle.status === 'finished') && renderFinishedState()}
    </div>
  );
}
