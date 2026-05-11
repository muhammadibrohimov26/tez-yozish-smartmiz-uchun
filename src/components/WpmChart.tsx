import React from 'react';
import type { WpmDataPoint } from '../types';

export default function WpmChart({ data, isDarkMode }: { data: WpmDataPoint[]; isDarkMode: boolean }) {
  if (data.length < 2) return null;

  const maxWpm = Math.max(...data.map(d => d.wpm), 10);
  const minWpm = Math.min(...data.map(d => d.wpm));
  const h = 120;
  const w = 100; // percentage

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d.wpm - minWpm) / (maxWpm - minWpm + 1)) * (h - 10);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const avgWpm = Math.round(data.reduce((s, d) => s + d.wpm, 0) / data.length);

  return (
    <div className={`rounded-[24px] border p-6 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-display font-bold flex items-center gap-2">📈 Jonli WPM</h3>
        <span className="text-xs font-bold text-blue-500">O'rtacha: {avgWpm} WPM</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDarkMode ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.2)'} />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(p => (
          <line key={p} x1="0" y1={h * p} x2={w} y2={h * p}
            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="0.5" />
        ))}
        {/* Area */}
        <polygon points={areaPoints} fill="url(#wpmGrad)" />
        {/* Line */}
        <polyline points={points} fill="none" stroke="rgb(59,130,246)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {data.length <= 30 && data.map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((d.wpm - minWpm) / (maxWpm - minWpm + 1)) * (h - 10);
          return <circle key={i} cx={x} cy={y} r="1.5" fill="rgb(59,130,246)" />;
        })}
      </svg>
      <div className="flex justify-between mt-2 text-[10px] font-bold opacity-30">
        <span>0s</span>
        <span>{data[data.length - 1]?.second || 0}s</span>
      </div>
    </div>
  );
}
