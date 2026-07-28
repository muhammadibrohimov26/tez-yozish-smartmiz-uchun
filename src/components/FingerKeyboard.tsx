import React from 'react';
import { FINGER_MAP, FINGER_LABELS, type Finger } from '../data/lessons';

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROWS = [
  NUMBER_ROW,
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

/** Keyboard width matches this fixed grid at every breakpoint so the hand overlay lines up under it. */
const KEYS_WIDTH = 'w-[374px] sm:w-[494px]';
/** ~118% of the keys+spacebar block's own height, so the hands trail off below the keyboard, like a real hand resting on it. */
const HANDS_HEIGHT = 'h-[214px] sm:h-[280px]';

// x position (0-100 viewBox units) of each finger's home-row key column.
const FINGER_X: Record<Finger, number> = {
  'left-pinky': 5, 'left-ring': 15, 'left-middle': 25, 'left-index': 35,
  'right-index': 65, 'right-middle': 75, 'right-ring': 85, 'right-pinky': 95,
  thumb: 50,
};
const FINGER_ORDER: Finger[] = [
  'left-pinky', 'left-ring', 'left-middle', 'left-index',
  'right-index', 'right-middle', 'right-ring', 'right-pinky',
];
// y=0 is the top of the number row, y=100 the bottom of the spacebar; 100-130 is the
// extra tail below the keyboard where the palms rest (clipped by the card's rounded edge).
const FINGERTIP_Y = 51; // home row
const THUMBTIP_Y = 92; // spacebar
const PALM_Y = 112;

export default function FingerKeyboard({ activeChar, isDarkMode }: { activeChar?: string; isDarkMode: boolean }) {
  const active = activeChar?.toLowerCase();
  const activeFinger = active !== undefined ? FINGER_MAP[active] : undefined;

  const keyClass = (isActive: boolean) =>
    `h-8 sm:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
      isActive
        ? 'scale-110 text-white'
        : (isDarkMode ? 'bg-[#0a0a0f] text-white/40' : 'bg-white text-gray-500 shadow-sm')
    }`;

  const keyStyle = (isActive: boolean): React.CSSProperties | undefined =>
    isActive ? { backgroundColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent), 0 0 16px 2px var(--accent-glow)' } : undefined;

  const renderKey = (char: string) => {
    const isActive = active === char;
    return (
      <div key={char} className={`w-8 sm:w-11 ${keyClass(isActive)}`} style={keyStyle(isActive)}>
        {char}
      </div>
    );
  };

  const idle = isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
  const accent = 'var(--accent)';

  const fingerPath = (finger: Finger, hand: 'left' | 'right') => {
    const palmX = hand === 'left' ? 20 : 80;
    if (finger === 'thumb') return `M ${palmX} ${PALM_Y} Q ${(palmX + 50) / 2} ${(PALM_Y + THUMBTIP_Y) / 2} 50 ${THUMBTIP_Y}`;
    const tipX = FINGER_X[finger];
    const ctrlX = (palmX + tipX) / 2;
    const ctrlY = (PALM_Y + FINGERTIP_Y) / 2 - 6;
    return `M ${palmX} ${PALM_Y} Q ${ctrlX} ${ctrlY} ${tipX} ${FINGERTIP_Y}`;
  };

  return (
    <div className={`rounded-[24px] border p-6 overflow-hidden ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <div className="relative flex flex-col items-center">
        {/* Hand illustration: sits behind the keys and trails off below the keyboard. */}
        <svg
          viewBox="0 0 100 130"
          preserveAspectRatio="none"
          className={`absolute top-0 left-1/2 -translate-x-1/2 ${KEYS_WIDTH} ${HANDS_HEIGHT} pointer-events-none`}
          style={{ marginLeft: 32 }}
        >
          <ellipse cx={20} cy={PALM_Y} rx={17} ry={13} fill={idle} />
          <ellipse cx={80} cy={PALM_Y} rx={17} ry={13} fill={idle} />
          {FINGER_ORDER.map(finger => {
            const hand = finger.startsWith('left') ? 'left' : 'right';
            const isActive = activeFinger === finger;
            return (
              <path
                key={finger}
                d={fingerPath(finger, hand)}
                fill="none"
                stroke={isActive ? accent : idle}
                strokeWidth={isActive ? 11 : 9}
                strokeLinecap="round"
              />
            );
          })}
          {/* Both thumbs rest near the spacebar. */}
          <path d={fingerPath('thumb', 'left')} fill="none" stroke={activeFinger === 'thumb' ? accent : idle} strokeWidth={activeFinger === 'thumb' ? 11 : 9} strokeLinecap="round" />
          <path d={fingerPath('thumb', 'right')} fill="none" stroke={activeFinger === 'thumb' ? accent : idle} strokeWidth={activeFinger === 'thumb' ? 11 : 9} strokeLinecap="round" />
        </svg>

        <div className="relative z-10 space-y-1.5 flex flex-col items-center">
          {ROWS.map((row, ri) => (
            <div key={ri} className={`flex gap-1.5 ${KEYS_WIDTH}`} style={{ marginLeft: ri * 16 }}>
              {row.map(char => renderKey(char))}
            </div>
          ))}
          <div className={`pt-1 ${KEYS_WIDTH}`} style={{ marginLeft: 32 }}>
            <div
              className={`h-8 sm:h-10 rounded-lg flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                active === ' ' ? 'scale-105 text-white' : (isDarkMode ? 'bg-[#0a0a0f] text-white/30' : 'bg-white text-gray-400 shadow-sm')
              }`}
              style={keyStyle(active === ' ')}
            >
              Probel
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <p className={`text-xs font-bold uppercase tracking-widest h-4 px-3 py-1 rounded-full ${activeFinger ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700') : ''}`}>
          {activeFinger ? `Barmoq: ${FINGER_LABELS[activeFinger]}` : ''}
        </p>
      </div>
    </div>
  );
}
