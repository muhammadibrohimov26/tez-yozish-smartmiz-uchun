import type { Badge } from '../types';

export const BADGES: Badge[] = [
  { id: 'first_test', name: 'Birinchi qadam', description: 'Birinchi testni topshiring', icon: '🎯',
    condition: s => s.totalTests >= 1 },
  { id: 'test_10', name: 'Faol yozuvchi', description: '10 ta test topshiring', icon: '✍️',
    condition: s => s.totalTests >= 10 },
  { id: 'test_50', name: 'Tajribali', description: '50 ta test topshiring', icon: '🏆',
    condition: s => s.totalTests >= 50 },
  { id: 'test_100', name: 'Professional', description: '100 ta test topshiring', icon: '💎',
    condition: s => s.totalTests >= 100 },
  { id: 'wpm_30', name: 'Tezkor', description: '30+ WPM ga erishing', icon: '⚡',
    condition: s => s.bestWpm >= 30 },
  { id: 'wpm_50', name: 'Chaqmoq', description: '50+ WPM ga erishing', icon: '🚀',
    condition: s => s.bestWpm >= 50 },
  { id: 'wpm_80', name: 'Superstar', description: '80+ WPM ga erishing', icon: '🌟',
    condition: s => s.bestWpm >= 80 },
  { id: 'wpm_100', name: 'Legenda', description: '100+ WPM ga erishing', icon: '👑',
    condition: s => s.bestWpm >= 100 },
  { id: 'chars_1k', name: '1000 belgi', description: '1,000 to\'g\'ri belgi yozing', icon: '📝',
    condition: s => s.totalCorrectChars >= 1000 },
  { id: 'chars_10k', name: '10K belgi', description: '10,000 to\'g\'ri belgi yozing', icon: '📚',
    condition: s => s.totalCorrectChars >= 10000 },
  { id: 'chars_50k', name: '50K belgi', description: '50,000 to\'g\'ri belgi yozing', icon: '🏅',
    condition: s => s.totalCorrectChars >= 50000 },
  { id: 'streak_3', name: '3 kun ketma-ket', description: '3 kun ketma-ket mashq qiling', icon: '🔥',
    condition: s => s.streak >= 3 },
  { id: 'streak_7', name: 'Haftalik streak', description: '7 kun ketma-ket mashq qiling', icon: '💪',
    condition: s => s.streak >= 7 },
  { id: 'streak_30', name: 'Oylik streak', description: '30 kun ketma-ket mashq qiling', icon: '🎖️',
    condition: s => s.streak >= 30 },
];

export function getEarnedBadges(stats: { totalTests: number; bestWpm: number; averageWpm: number; totalCorrectChars: number; streak: number }): Badge[] {
  return BADGES.filter(b => b.condition(stats));
}

export function getStreak(): number {
  const history = JSON.parse(localStorage.getItem('typing_history') || '[]');
  if (history.length === 0) return 0;

  const dates = new Set<string>();
  history.forEach((r: any) => {
    if (r.date) {
      // Extract date from stored results
      const today = new Date();
      dates.add(today.toDateString());
    }
  });

  // Check streaks from stored dates
  const streakDates = JSON.parse(localStorage.getItem('typing_streak_dates') || '[]') as string[];
  const today = new Date().toDateString();
  if (!streakDates.includes(today) && history.length > 0) {
    streakDates.push(today);
    localStorage.setItem('typing_streak_dates', JSON.stringify(streakDates));
  }

  // Count consecutive days from today backwards
  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (streakDates.includes(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}
