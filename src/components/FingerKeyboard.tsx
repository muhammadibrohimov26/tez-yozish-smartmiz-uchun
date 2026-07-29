import React, { useLayoutEffect, useRef, useState } from 'react';
import { FINGER_MAP, FINGER_LABELS, type Finger } from '../data/lessons';

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const ROWS = [
  NUMBER_ROW,
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  // 11 keys: the apostrophe of o'/g' sits right of ';', both under the right pinky.
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

/**
 * Every row (and the hand overlay) is 91% of the card's width — the remaining 9%
 * is reserved as stagger room so a 3-row cascade (marginLeft 0/3/6/9%) never
 * pushes a row past the right edge. This keeps the whole keyboard fluid: it
 * scales to 100% of whatever screen it's on instead of overflowing on narrow ones,
 * while `max-w-[600px]` on the card (below) keeps keys from growing oversized on wide screens.
 */
const ROW_WIDTH = 'w-[91%]';
const ROW_MARGIN = (rowIndex: number) => `${rowIndex * 3}%`;
const HOME_ROW_MARGIN = ROW_MARGIN(2); // space bar & hand overlay align under the home row
/** How much taller the hand overlay is than the keys+spacebar block, for the palms to trail below. */
const TAIL_RATIO = 1.09;

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
// y=0 is the top of the number row, y=100 the bottom of the spacebar; 100-114 is the
// short tail below the keyboard where the palms rest (clipped by the card's rounded edge).
const FINGERTIP_Y = 51; // home row
const THUMBTIP_Y = 92; // spacebar
const PALM_Y = 103;

export default function FingerKeyboard({ activeChar, isDarkMode }: { activeChar?: string; isDarkMode: boolean }) {
  const active = activeChar?.toLowerCase();
  const activeFinger = active !== undefined ? FINGER_MAP[active] : undefined;

  const keysRef = useRef<HTMLDivElement>(null);
  const [keysHeight, setKeysHeight] = useState(0);

  // The SVG hand overlay is absolutely positioned (so it can sit behind the keys and
  // trail below them without affecting layout), which means CSS can't auto-size it to
  // match the keys+spacebar block's own height — measure it directly instead.
  useLayoutEffect(() => {
    const el = keysRef.current;
    if (!el) return;
    const update = () => setKeysHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const keyClass = (isActive: boolean) =>
    `flex-1 aspect-square rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
      isActive
        ? 'scale-110 text-white'
        : (isDarkMode ? 'bg-[#0a0a0f] text-white/40' : 'bg-white text-gray-500 shadow-sm')
    }`;

  const keyStyle = (isActive: boolean): React.CSSProperties | undefined =>
    isActive ? { backgroundColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent), 0 0 16px 2px var(--accent-glow)' } : undefined;

  const renderKey = (char: string) => {
    const isActive = active === char;
    return (
      <div key={char} className={keyClass(isActive)} style={keyStyle(isActive)}>
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
    <div className={`rounded-[24px] border p-4 sm:p-6 overflow-hidden max-w-[600px] mx-auto ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <div className="relative">
        {/* Hand illustration: sits behind the keys and trails off below the keyboard. */}
        {keysHeight > 0 && (
          <svg
            viewBox="0 0 100 114"
            preserveAspectRatio="none"
            className={`absolute top-0 left-0 ${ROW_WIDTH} pointer-events-none`}
            style={{ marginLeft: HOME_ROW_MARGIN, height: keysHeight * TAIL_RATIO }}
          >
            <ellipse cx={20} cy={PALM_Y} rx={14} ry={7} fill={idle} />
            <ellipse cx={80} cy={PALM_Y} rx={14} ry={7} fill={idle} />
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
        )}

        <div ref={keysRef} className="relative z-10 space-y-1.5">
          {ROWS.map((row, ri) => (
            <div key={ri} className={`flex gap-1.5 ${ROW_WIDTH}`} style={{ marginLeft: ROW_MARGIN(ri) }}>
              {row.map(char => renderKey(char))}
            </div>
          ))}
          <div className={`pt-1 ${ROW_WIDTH}`} style={{ marginLeft: HOME_ROW_MARGIN }}>
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

      <div className="flex justify-center mt-4">
        <p className={`text-xs font-bold uppercase tracking-widest h-4 px-3 py-1 rounded-full ${activeFinger ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700') : ''}`}>
          {activeFinger ? `Barmoq: ${FINGER_LABELS[activeFinger]}` : ''}
        </p>
      </div>
    </div>
  );
}
