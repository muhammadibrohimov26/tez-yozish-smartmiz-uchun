import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBattleRoom } from '../hooks/useBattle';
import { Trophy, ArrowLeft, Zap, Users, Timer, Crown, Shield, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
  const [timeLeftInRound, setTimeLeftInRound] = useState<number>(60);
  const [transitionTime, setTransitionTime] = useState<number | null>(null);
  const [wasPresentForTransition, setWasPresentForTransition] = useState(false);
  const [cheatEnabled, setCheatEnabled] = useState(false);

  const isOwner = profile?.email === 'muhammadibrohimov0306@gmail.com' || profile?.isAdmin === true || localStorage.getItem('dev_cheat_mode') === 'true';

  const resetOwnerStats = async () => {
    if (!user?.uid) return;
    if (window.confirm("Barcha statistikalaringizni 0 ga tushirishni tasdiqlaysizmi? (Firestore va Mahalliy tarix tozalanadi)")) {
      try {
        await updateDoc(doc(db, 'typingUsers', user.uid), {
          averageWpm: 0,
          bestWpm: 0,
          totalTests: 0,
          totalCorrectChars: 0
        });
        localStorage.removeItem('typing_history');
        localStorage.removeItem('typing_streak_dates');
        window.location.reload();
      } catch (e) {
        console.error("Xatolik reytingni tozalashda:", e);
      }
    }
  };
  
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  
  useEffect(() => { correctCharsRef.current = correctChars; }, [correctChars]);
  useEffect(() => { incorrectCharsRef.current = incorrectChars; }, [incorrectChars]);

  useEffect(() => {
    if (battle?.status === 'waiting' && user && battle.participants[user.uid] === undefined) {
      joinBattle();
    }
  }, [battle?.status, user]);

  const me = user ? battle?.participants[user.uid] : null;

  useEffect(() => {
    if (battle?.status === 'waiting' || battle?.status === 'starting') {
      setWasPresentForTransition(true);
    }
  }, [battle?.status]);

  useEffect(() => {
    if (battle?.status === 'round_active') {
      if (transitionTime === null) {
        setTransitionTime(Date.now());
      }
    } else {
      setTransitionTime(null);
    }
  }, [battle?.status, transitionTime]);

  useEffect(() => {
    if (battle?.status === 'round_active' && battle.startTime && transitionTime !== null) {
      const st = battle.startTime.toDate ? battle.startTime.toDate().getTime() : new Date(battle.startTime).getTime();
      // If the user was in the room before the round started, they are not a late joiner.
      // This avoids clock sync issues between the host and clients.
      const isLateJoin = !wasPresentForTransition;
      
      const interval = setInterval(() => {
        const now = Date.now();
        const diffToStart = isLateJoin
          ? Math.max(0, Math.ceil((st - now) / 1000))
          : Math.max(0, Math.ceil((transitionTime + 5000 - now) / 1000));
          
        setTimeLeftToStart(diffToStart > 0 ? diffToStart : null);
        
        if (diffToStart === 0) {
          if (startTimeRef.current === 0) {
            // Set start time of typing
            startTimeRef.current = isLateJoin ? st : transitionTime + 5000;
            if (inputRef.current) inputRef.current.focus();
          }
          
          const elapsed = Date.now() - startTimeRef.current;
          const left = Math.max(0, 60 - Math.floor(elapsed / 1000));
          setTimeLeftInRound(left);
          
          if (left === 0 && user && !me?.isFinished) {
            const finalWpm = Math.round((correctCharsRef.current / 5)); // Since it's exactly 1 minute, WPM is just chars / 5
            const totalTyped = correctCharsRef.current + incorrectCharsRef.current;
            const finalAccuracy = totalTyped > 0 ? Math.round((correctCharsRef.current / totalTyped) * 100) : 0;
            finishRound(finalWpm, finalAccuracy, correctCharsRef.current);
          }
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      setTimeLeftToStart(null);
      setTimeLeftInRound(60);
      if (battle?.status !== 'round_active') {
        startTimeRef.current = 0;
      }
    }
  }, [battle?.status, battle?.startTime, transitionTime, user, me?.isFinished]);

  useEffect(() => {
    if (battle?.status === 'starting' || battle?.status === 'round_finished' || battle?.status === 'round_active') {
      setCurrentWordIndex(0);
      setUserInput('');
      setCorrectChars(0);
      setIncorrectChars(0);
      startTimeRef.current = 0;
    }
  }, [battle?.status, battle?.currentRound]);

  if (!battle) return <div className="text-center py-20">Jang topilmadi...</div>;

  const isCreator = user?.uid === battle.creatorId;
  const isTypingActive = battle.status === 'round_active' && timeLeftToStart === null && !me?.isFinished && timeLeftInRound > 0;
  
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

    const targetWord = (battle.words || [])[currentWordIndex];
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

    const boost = (isOwner || cheatEnabled) ? 2 : 1;
    const added = (wordCorrectChars + (isCorrect ? 1 : 0)) * boost;
    const newCorrect = correctChars + added;
    const newIncorrect = incorrectChars + wordIncorrectChars;
    setCorrectChars(newCorrect);
    setIncorrectChars(newIncorrect);
    setUserInput('');
    
    const newIndex = currentWordIndex + 1;
    setCurrentWordIndex(newIndex);
    
    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
    const currentWpm = elapsedMinutes > 0 ? Math.round((newCorrect / 5) / elapsedMinutes) : 0;
    
    // In 60s mode, we don't track progress to 100%, we just show who has the most characters typed/WPM.
    // We'll pass the character count to progress for the UI bar comparison.
    updateProgress(newCorrect, currentWpm);
  };

  const renderParticipants = () => {
    const participants: BattleParticipant[] = Object.values(battle.participants || {}) as BattleParticipant[];
    let visibleParticipants = participants;

    // Filter for 1v1 Mode
    if (battle.type === '1v1' && battle.status !== 'waiting' && user) {
      const myOpponentId = battle.pairings?.[user.uid];
      visibleParticipants = participants.filter(p => p.userId === user.uid || p.userId === myOpponentId);
    }

    // Sort by WPM (highest first)
    const sorted = visibleParticipants.sort((a, b) => (b.wpm || 0) - (a.wpm || 0));
    const maxWpm = Math.max(...participants.map(p => p.wpm || 0), 20); // Minimum 20 for scaling

    return (
      <div className="space-y-4 w-full max-w-3xl mx-auto">
        {battle.type === '1v1' && battle.status !== 'waiting' && user && battle.pairings?.[user.uid] === 'solo' && (
          <div className="text-center p-4 rounded-xl bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20">
            Siz bu raundda yolg'izsiz (ishtirokchilar soni toq). Shunchaki yozib ball yig'ing!
          </div>
        )}
        
        {sorted.map((p, i) => {
          const isMe = p.userId === user?.uid;
          const isFirstPlace = battle.type === 'group' && i === 0 && p.wpm > 0;
          return (
            <div key={p.userId} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${isMe ? 'border-blue-500 bg-blue-500/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white')} ${isFirstPlace ? 'shadow-lg shadow-yellow-500/20 border-yellow-500/50' : ''}`}>
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {p.photoURL ? <img src={p.photoURL} className="w-full h-full rounded-full object-cover" /> : p.displayName.charAt(0).toUpperCase()}
                </div>
                {isFirstPlace && (
                  <div className="absolute -top-3 -right-2 bg-yellow-500 rounded-full p-1 shadow-lg">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className={`font-bold ${isFirstPlace ? 'text-yellow-600 dark:text-yellow-500' : ''}`}>
                    {p.displayName} {isMe ? '(Siz)' : ''}
                  </span>
                  <span className="text-sm font-mono font-black text-blue-500">{p.wpm || 0} WPM</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${((p.wpm || 0) / maxWpm) * 100}%` }} className={`h-full ${isFirstPlace ? 'bg-yellow-500' : 'bg-blue-500'}`} transition={{ duration: 0.3 }} />
                </div>
              </div>
              {p.isFinished && <Trophy className="w-6 h-6 text-yellow-500" />}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFinishedState = () => {
    const isFinal = battle.status === 'finished';
    const participants: BattleParticipant[] = Object.values(battle.participants || {}) as BattleParticipant[];
    const sorted = participants.map(p => {
      const wpms = p.roundWpms || [];
      const sum = wpms.reduce((a, b) => a + b, 0);
      const avg = wpms.length > 0 ? Math.round((sum + (isFinal ? 0 : (p.wpm || 0))) / (wpms.length + (isFinal ? 0 : 1))) : (p.wpm || 0);
      return { ...p, avg };
    }).sort((a, b) => b.avg - a.avg);

    return (
      <div className="text-center space-y-8 w-full max-w-2xl mx-auto">
        <h2 className="text-4xl font-display font-black">
          {isFinal ? '🏆 Turnir Yakunlandi' : `Raund ${battle.currentRound} Natijalari`}
        </h2>
        <div className="space-y-4">
          {sorted.map((p, i) => (
            <div key={p.userId} className={`p-4 rounded-2xl border flex items-center gap-4 ${p.userId === user?.uid ? 'border-blue-500 bg-blue-500/10' : (isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white')}`}>
              <span className="text-3xl font-black w-10 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
              <div className="flex-1 text-left">
                <span className="font-bold text-lg">{p.displayName}</span>
                <p className="text-xs opacity-50">To'g'ri yozilgan belgilar: {p.totalCorrectChars || 0}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-500">{isFinal ? p.avg : (p.wpm || 0)}</span>
                <span className="text-xs block opacity-50 font-bold">{isFinal ? "O'rtacha WPM" : 'WPM'}</span>
              </div>
            </div>
          ))}
        </div>
        {isCreator && !isFinal && (
          <button onClick={nextRound} className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold w-full hover:bg-blue-700 shadow-lg shadow-blue-500/20">
            Keyingi Raundni Boshlash
          </button>
        )}
        {isFinal && (
          <button onClick={() => navigate(`/groups/${groupId}`)} className={`px-8 py-4 rounded-xl font-bold w-full transition-all ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
            Guruhga Qaytish
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex justify-between items-center">
         <button onClick={() => { leaveBattle(); navigate(`/groups/${groupId}`); }} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm border border-gray-100 hover:bg-gray-50'}`}>
            <ArrowLeft className="w-5 h-5" />
         </button>
         <div className="text-center">
            <h1 className="text-2xl font-display font-black">
              {battle.type === '1v1' ? '1 ga 1 (Duel)' : 'Guruhaviy Jang'} ({battle.currentRound || 1}/{battle.totalRounds || 3})
            </h1>
            <span className="text-sm opacity-50 flex items-center gap-1 justify-center mt-1"><Users className="w-4 h-4"/> {Object.keys(battle.participants || {}).length} ishtirokchi</span>
         </div>
         <div className="w-11"></div>
      </div>

      {battle.status === 'waiting' && (
        <div className="text-center space-y-8 mt-20">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/20 text-blue-500 animate-pulse">
            <Zap className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display font-black">Boshqalar kutilmoqda...</h2>
          {renderParticipants()}
          {isCreator && (
            <button onClick={startBattle} className="px-8 py-4 rounded-xl bg-blue-600 text-white font-bold mt-8 shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform text-lg">
              Jangni Boshlash
            </button>
          )}
        </div>
      )}

      {battle.status === 'round_active' && timeLeftToStart !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div key={timeLeftToStart} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
              <span className="text-9xl font-display font-black text-white">{timeLeftToStart}</span>
              <span className="text-xl text-white/50 font-bold uppercase tracking-widest">Tayyorlaning</span>
            </motion.div>
         </div>
      )}

      {battle.status === 'round_active' && timeLeftToStart === null && (
        <div className="space-y-12">
          
          {/* Top Info Bar (Timer) */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20">
              <Timer className="w-5 h-5" />
              <span className="text-xl font-mono">{timeLeftInRound}s</span>
            </div>
          </div>

          {renderParticipants()}

          {!me?.isFinished && timeLeftInRound > 0 && (
             <div className="w-full max-w-3xl mx-auto mt-12 bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl">
              <div className="text-4xl sm:text-6xl font-display font-black tracking-tighter text-center mb-10 text-gray-900 dark:text-white">
                {(battle.words || [])[currentWordIndex] || '...'}
              </div>
              <input ref={inputRef} type="text" value={userInput} onChange={handleInput} onKeyDown={handleKeyDown}
                  autoFocus disabled={!isTypingActive}
                  className={`w-full bg-transparent border-b-4 pb-4 text-3xl text-center focus:outline-none transition-all duration-300 disabled:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed ${isDarkMode ? 'text-white placeholder:text-white/10 border-white/20 focus:border-blue-500' : 'text-gray-900 placeholder:text-gray-200 border-gray-200 focus:border-blue-500'}`}
                  placeholder="Shu yerga yozing..." />
             </div>
          )}

          {me?.isFinished && (
             <div className="text-center space-y-4 py-16">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto opacity-50" />
                <div className="text-2xl font-bold opacity-50 animate-pulse">
                  Vaqt tugadi! Boshqalarni kutamiz...
                </div>
             </div>
          )}
        </div>
      )}

      {(battle.status === 'round_finished' || battle.status === 'finished') && renderFinishedState()}
    </div>
  );
}
