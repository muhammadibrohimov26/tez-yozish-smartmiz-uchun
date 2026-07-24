import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBattleRoom } from '../hooks/useBattle';
import { Trophy, ArrowLeft, Zap, Users, Timer, Crown } from 'lucide-react';
import { motion } from 'motion/react';
import type { BattleParticipant } from '../types';
import { useServerClock } from '../hooks/useServerTime';
import { compareWord } from '../lib/typing';
import { isOwnerUser } from '../lib/owner';
import { BATTLE_COUNTDOWN_MS, BATTLE_ROUND_MS } from '../lib/battle';

const ROUND_SECONDS = Math.round(BATTLE_ROUND_MS / 1000);
const PROGRESS_THROTTLE_MS = 1500;
/** Grace after time-up before force-advancing a round past abandoned players. */
const ROUND_END_GRACE_MS = 2000;

export default function BattleRoom({ isDarkMode, themeColor = 'blue' }: { isDarkMode: boolean; themeColor?: string }) {
  const { id: groupId, battleId } = useParams<{ id: string, battleId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { battle, joinBattle, leaveBattle, startBattle, updateProgress, finishRound, finishRoundForAll, nextRound } =
    useBattleRoom(groupId, battleId, user?.uid, profile?.displayName, profile?.photoURL);

  const [userInput, setUserInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [timeLeftToStart, setTimeLeftToStart] = useState<number | null>(null);
  const [timeLeftInRound, setTimeLeftInRound] = useState<number>(ROUND_SECONDS);

  const isOwner = isOwnerUser(user, profile);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingStartLocalRef = useRef<number>(0); // local ms when typing began (0 = not yet)
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);

  useEffect(() => { correctCharsRef.current = correctChars; }, [correctChars]);
  useEffect(() => { incorrectCharsRef.current = incorrectChars; }, [incorrectChars]);

  const me = user ? battle?.participants[user.uid] : null;

  // Server-anchored clock: every client counts down from the same round anchor.
  const anchorMs = battle?.roundStartAt ? battle.roundStartAt.toMillis() : null;
  const serverNow = useServerClock(anchorMs);

  // Latest values the timing tick needs, without re-creating the interval each snapshot.
  const liveRef = useRef({ battle, me, user, finishRound, finishRoundForAll });
  useEffect(() => {
    liveRef.current = { battle, me, user, finishRound, finishRoundForAll };
  });

  // Auto-join a battle that is still waiting.
  useEffect(() => {
    if (battle?.status === 'waiting' && user && battle.participants[user.uid] === undefined) {
      joinBattle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle?.status, user]);

  // Reset local typing state at each new round.
  useEffect(() => {
    if (battle?.status === 'round_active' || battle?.status === 'round_finished' || battle?.status === 'starting') {
      setCurrentWordIndex(0);
      setUserInput('');
      setCorrectChars(0);
      setIncorrectChars(0);
      typingStartLocalRef.current = 0;
    }
  }, [battle?.status, battle?.currentRound]);

  // Timing loop — countdown, in-round timer, and time-driven round completion.
  useEffect(() => {
    if (battle?.status !== 'round_active' || anchorMs == null) {
      setTimeLeftToStart(null);
      setTimeLeftInRound(ROUND_SECONDS);
      return;
    }
    const roundBeginsAt = anchorMs + BATTLE_COUNTDOWN_MS;
    const roundEndsAt = roundBeginsAt + BATTLE_ROUND_MS;

    const tick = () => {
      const now = serverNow();

      if (now < roundBeginsAt) {
        setTimeLeftToStart(Math.max(1, Math.ceil((roundBeginsAt - now) / 1000)));
        setTimeLeftInRound(ROUND_SECONDS);
        return;
      }

      setTimeLeftToStart(null);
      if (typingStartLocalRef.current === 0) {
        typingStartLocalRef.current = Date.now();
        inputRef.current?.focus();
      }
      setTimeLeftInRound(Math.max(0, Math.ceil((roundEndsAt - now) / 1000)));

      if (now >= roundEndsAt) {
        const live = liveRef.current;
        // Record my own result once (works even if the tab was backgrounded).
        if (live.user && live.me && !live.me.isFinished) {
          const finalWpm = Math.round(correctCharsRef.current / 5); // exactly 1 minute
          const totalTyped = correctCharsRef.current + incorrectCharsRef.current;
          const finalAccuracy = totalTyped > 0 ? Math.round((correctCharsRef.current / totalTyped) * 100) : 0;
          live.finishRound(finalWpm, finalAccuracy, correctCharsRef.current);
        }
        // Advance the round to results — idempotent, any participant may trigger it.
        const participants: BattleParticipant[] = live.battle ? Object.values(live.battle.participants) : [];
        const everyoneDone = participants.length > 0 && participants.every(p => p.isFinished);
        if (everyoneDone || now >= roundEndsAt + ROUND_END_GRACE_MS) {
          live.finishRoundForAll();
        }
      }
    };

    tick();
    const iv = setInterval(tick, 200);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle?.status, anchorMs]);

  // Throttled progress writes: at most one Firestore write per PROGRESS_THROTTLE_MS,
  // with a trailing write so the final value is never lost.
  const progressThrottle = useRef<{ last: number; timer: ReturnType<typeof setTimeout> | null; pending: [number, number] | null }>({ last: 0, timer: null, pending: null });
  useEffect(() => () => { if (progressThrottle.current.timer) clearTimeout(progressThrottle.current.timer); }, []);

  const pushProgress = (chars: number, wpm: number) => {
    const t = progressThrottle.current;
    const now = Date.now();
    const elapsed = now - t.last;
    if (elapsed >= PROGRESS_THROTTLE_MS) {
      t.last = now;
      updateProgress(chars, wpm);
    } else {
      t.pending = [chars, wpm];
      if (!t.timer) {
        t.timer = setTimeout(() => {
          t.timer = null;
          t.last = Date.now();
          if (t.pending) { updateProgress(t.pending[0], t.pending[1]); t.pending = null; }
        }, PROGRESS_THROTTLE_MS - elapsed);
      }
    }
  };

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

    const { correctChars: wordCorrectChars, incorrectChars: wordIncorrectChars, isCorrect } =
      compareWord(trimmedValue, targetWord);

    const boost = isOwner ? 2 : 1;
    const added = (wordCorrectChars + (isCorrect ? 1 : 0)) * boost;
    const newCorrect = correctChars + added;
    const newIncorrect = incorrectChars + wordIncorrectChars;
    setCorrectChars(newCorrect);
    setIncorrectChars(newIncorrect);
    setUserInput('');
    setCurrentWordIndex(currentWordIndex + 1);

    const elapsedMinutes = typingStartLocalRef.current ? (Date.now() - typingStartLocalRef.current) / 60000 : 0;
    const currentWpm = elapsedMinutes > 0 ? Math.round((newCorrect / 5) / elapsedMinutes) : 0;

    // In 60s mode progress is the character count (used only for the comparison bars).
    pushProgress(newCorrect, currentWpm);
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
    const sorted = [...visibleParticipants].sort((a, b) => (b.wpm || 0) - (a.wpm || 0));
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
                  {p.photoURL ? <img src={p.photoURL} alt={p.displayName} className="w-full h-full rounded-full object-cover" /> : p.displayName.charAt(0).toUpperCase()}
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
        {!isCreator && !isFinal && (
          <p className="text-sm opacity-50 font-bold">Creator keyingi raundni boshlashini kuting...</p>
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
         <button onClick={() => { leaveBattle(); navigate(`/groups/${groupId}`); }} aria-label="Orqaga qaytish" className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white shadow-sm border border-gray-100 hover:bg-gray-50'}`}>
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
                  autoFocus disabled={!isTypingActive} aria-label="Yozish maydoni"
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
