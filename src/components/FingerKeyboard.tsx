import React from 'react';
import { FINGER_MAP, FINGER_LABELS, type Finger } from '../data/lessons';

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROWS = [
  NUMBER_ROW,
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

/** Keyboard width matches this fixed grid at every breakpoint so the SVG hand overlay lines up under it. */
const KEYS_WIDTH = 'w-[374px] sm:w-[494px]';

// x position (0-100 viewBox units) of each finger's key column, and where its curve starts from the palm.
const FINGER_X: Record<Finger, number> = {
  'left-pinky': 5, 'left-ring': 15, 'left-middle': 25, 'left-index': 35,
  'right-index': 65, 'right-middle': 75, 'right-ring': 85, 'right-pinky': 95,
  thumb: 50,
};
const FINGER_ORDER: Finger[] = [
  'left-pinky', 'left-ring', 'left-middle', 'left-index',
  'right-index', 'right-middle', 'right-ring', 'right-pinky',
];

export default function FingerKeyboard({ activeChar, isDarkMode }: { activeChar?: string; isDarkMode: boolean }) {
  const active = activeChar?.toLowerCase();
  const activeFinger = active !== undefined ? FINGER_MAP[active] : undefined;

  const keyClass = (isActive: boolean) =>
    `h-8 sm:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
      isActive
        ? 'scale-110 text-white'
        : (isDarkMode ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500')
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

  const idle = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
  const accent = 'var(--accent)';

  const fingerPath = (finger: Finger, hand: 'left' | 'right') => {
    const tipX = FINGER_X[finger];
    const palmX = hand === 'left' ? 20 : 80;
    if (finger === 'thumb') return `M ${palmX} 30 Q ${(palmX + 50) / 2} 40 50 44`;
    const ctrlX = (palmX + tipX) / 2;
    return `M ${palmX} 30 Q ${ctrlX} 14 ${tipX} 2`;
  };

  return (
    <div className={`rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <div className="space-y-1.5 flex flex-col items-center">
        {ROWS.map((row, ri) => (
          <div key={ri} className={`flex gap-1.5 ${KEYS_WIDTH}`} style={{ marginLeft: ri * 16 }}>
            {row.map(char => renderKey(char))}
          </div>
        ))}
        <div className={`pt-1 ${KEYS_WIDTH}`} style={{ marginLeft: 32 }}>
          <div
            className={`h-8 sm:h-10 rounded-lg flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
              active === ' ' ? 'scale-105 text-white' : (isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400')
            }`}
            style={keyStyle(active === ' ')}
          >
            Probel
          </div>
        </div>

        {/* Hand / finger guide: every key's finger is a curve from the palm to the key column;
            only the finger for the current key is highlighted, mirroring a touch-typing tutor's hand diagram.
            Anchored under the home row (marginLeft 32, same as that row) since FINGER_X was derived from it. */}
        <svg viewBox="0 0 100 46" className={`${KEYS_WIDTH} h-16 sm:h-20 mt-1`} style={{ marginLeft: 32 }} preserveAspectRatio="none">
          <ellipse cx={20} cy={34} rx={14} ry={9} fill={idle} opacity={0.3} />
          <ellipse cx={80} cy={34} rx={14} ry={9} fill={idle} opacity={0.3} />
          {FINGER_ORDER.map(finger => {
            const hand = finger.startsWith('left') ? 'left' : 'right';
            const isActive = activeFinger === finger;
            return (
              <path
                key={finger}
                d={fingerPath(finger, hand)}
                fill="none"
                stroke={isActive ? accent : idle}
                strokeWidth={isActive ? 2.4 : 1.2}
                strokeLinecap="round"
              />
            );
          })}
          {/* Both thumbs rest near the spacebar. */}
          <path d={fingerPath('thumb', 'left')} fill="none" stroke={activeFinger === 'thumb' ? accent : idle} strokeWidth={activeFinger === 'thumb' ? 2.4 : 1.2} strokeLinecap="round" />
          <path d={fingerPath('thumb', 'right')} fill="none" stroke={activeFinger === 'thumb' ? accent : idle} strokeWidth={activeFinger === 'thumb' ? 2.4 : 1.2} strokeLinecap="round" />
          {activeFinger && (
            <circle
              cx={FINGER_X[activeFinger]}
              cy={activeFinger === 'thumb' ? 44 : 2}
              r={2.4}
              fill={accent}
            />
          )}
        </svg>
      </div>

      <p className={`text-center text-xs font-bold uppercase tracking-widest mt-3 h-4 ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
        {activeFinger ? `Barmoq: ${FINGER_LABELS[activeFinger]}` : ''}
      </p>
    </div>
  );
}
