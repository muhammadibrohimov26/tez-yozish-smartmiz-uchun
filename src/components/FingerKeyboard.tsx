import React from 'react';
import { FINGER_MAP, FINGER_LABELS, type Finger } from '../data/lessons';

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROWS = [
  NUMBER_ROW,
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

const FINGER_COLORS: Record<Finger, string> = {
  'left-pinky': 'bg-rose-500/70 text-white',
  'left-ring': 'bg-orange-500/70 text-white',
  'left-middle': 'bg-yellow-500/70 text-yellow-950',
  'left-index': 'bg-emerald-500/70 text-white',
  'right-index': 'bg-cyan-500/70 text-white',
  'right-middle': 'bg-sky-500/70 text-white',
  'right-ring': 'bg-violet-500/70 text-white',
  'right-pinky': 'bg-pink-500/70 text-white',
  thumb: 'bg-gray-400/50 text-white',
};

const LEGEND_ORDER: Finger[] = [
  'left-pinky', 'left-ring', 'left-middle', 'left-index',
  'right-index', 'right-middle', 'right-ring', 'right-pinky', 'thumb',
];

export default function FingerKeyboard({ activeChar, isDarkMode }: { activeChar?: string; isDarkMode: boolean }) {
  const active = activeChar?.toLowerCase();

  const renderKey = (char: string, wide = false) => {
    const finger = FINGER_MAP[char];
    const isActive = active === char;
    return (
      <div
        key={char}
        className={`${wide ? 'w-40 sm:w-56' : 'w-8 h-8 sm:w-11 sm:h-11'} h-8 sm:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${finger ? FINGER_COLORS[finger] : (isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400')} ${isActive ? 'scale-110 animate-pulse' : ''}`}
        style={isActive ? { boxShadow: '0 0 0 3px var(--accent), 0 0 16px 2px var(--accent-glow)' } : undefined}
      >
        {char === ' ' ? '' : char}
      </div>
    );
  };

  return (
    <div className={`rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <div className="space-y-1.5 flex flex-col items-center">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ marginLeft: ri * 16 }}>
            {row.map(char => renderKey(char))}
          </div>
        ))}
        <div className="flex gap-1.5 pt-1">{renderKey(' ', true)}</div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">
        {LEGEND_ORDER.map(finger => (
          <span key={finger} className="flex items-center gap-1.5 opacity-70">
            <span className={`w-3 h-3 rounded ${FINGER_COLORS[finger]}`} />
            {FINGER_LABELS[finger]}
          </span>
        ))}
      </div>
    </div>
  );
}
