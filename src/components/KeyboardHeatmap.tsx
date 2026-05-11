import React from 'react';

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export default function KeyboardHeatmap({ charErrors, isDarkMode }: { charErrors: Record<string, number>; isDarkMode: boolean }) {
  const maxErrors = Math.max(1, ...Object.values(charErrors));

  const getColor = (char: string) => {
    const errs = charErrors[char] || 0;
    if (errs === 0) return isDarkMode ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400';
    const intensity = Math.min(errs / maxErrors, 1);
    if (intensity > 0.7) return 'bg-rose-500/80 text-white';
    if (intensity > 0.4) return 'bg-amber-500/60 text-white';
    return 'bg-yellow-500/30 text-yellow-200';
  };

  if (Object.keys(charErrors).length === 0) return null;

  return (
    <div className={`rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <h3 className="text-sm font-display font-bold mb-4 flex items-center gap-2">
        ⌨️ Xato heatmap
      </h3>
      <div className="space-y-2 flex flex-col items-center">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ marginLeft: ri * 16 }}>
            {row.map(char => (
              <div key={char} className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${getColor(char)}`}>
                {char}
                {(charErrors[char] || 0) > 0 && (
                  <span className="text-[8px] absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{charErrors[char]}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-4 text-[10px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />Xatosiz</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/30" />Kam</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500/60" />O'rta</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500/80" />Ko'p</span>
      </div>
    </div>
  );
}
