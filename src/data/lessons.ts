import { WORDS } from './words';
import { shuffle } from '../lib/shuffle';

export type Finger =
  | 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index'
  | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky'
  | 'thumb';

/** Standard touch-typing finger assignment for a QWERTY keyboard. */
export const FINGER_MAP: Record<string, Finger> = {
  '1': 'left-pinky', '2': 'left-ring', '3': 'left-middle', '4': 'left-index', '5': 'left-index',
  '6': 'right-index', '7': 'right-index', '8': 'right-middle', '9': 'right-ring', '0': 'right-pinky',
  q: 'left-pinky', w: 'left-ring', e: 'left-middle', r: 'left-index', t: 'left-index',
  y: 'right-index', u: 'right-index', i: 'right-middle', o: 'right-ring', p: 'right-pinky',
  a: 'left-pinky', s: 'left-ring', d: 'left-middle', f: 'left-index', g: 'left-index',
  h: 'right-index', j: 'right-index', k: 'right-middle', l: 'right-ring', ';': 'right-pinky',
  z: 'left-pinky', x: 'left-ring', c: 'left-middle', v: 'left-index', b: 'left-index',
  n: 'right-index', m: 'right-index', ',': 'right-middle', '.': 'right-ring', '/': 'right-pinky',
  ' ': 'thumb',
};

export const FINGER_LABELS: Record<Finger, string> = {
  'left-pinky': "Chap jimjiloq",
  'left-ring': "Chap nomsiz",
  'left-middle': "Chap o'rta",
  'left-index': "Chap ko'rsatkich",
  'right-index': "O'ng ko'rsatkich",
  'right-middle': "O'ng o'rta",
  'right-ring': "O'ng nomsiz",
  'right-pinky': "O'ng jimjiloq",
  thumb: 'Bosh barmoq',
};

export interface Lesson {
  id: string;
  title: string;
  description: string;
  /** New keys introduced by this lesson. */
  keys: string[];
  /** This lesson's keys plus every previous lesson's keys. */
  allowedKeys: string[];
  /** Drills use real Uzbek words instead of random letter chunks. */
  isWordLesson?: boolean;
}

type RawLesson = Omit<Lesson, 'allowedKeys'>;

const RAW_LESSONS: RawLesson[] = [
  {
    id: 'home-f-j',
    title: 'Uy qatori: F va J',
    description: "Barmoqlaringizni F va J tugmalariga qo'ying — ular ostida kichik chiziqcha bor.",
    keys: ['f', 'j'],
  },
  {
    id: 'home-row',
    title: "Uy qatori: to'liq",
    description: 'Barcha uy qatori tugmalarini mashq qiling: A S D F va J K L ;',
    keys: ['a', 's', 'd', 'g', 'h', 'k', 'l', ';'],
  },
  {
    id: 'top-left',
    title: 'Yuqori qator: chap tomon',
    description: 'Chap qo\'l bilan Q W E R T tugmalarini mashq qiling.',
    keys: ['q', 'w', 'e', 'r', 't'],
  },
  {
    id: 'top-right',
    title: "Yuqori qator: o'ng tomon",
    description: "O'ng qo'l bilan Y U I O P tugmalarini mashq qiling.",
    keys: ['y', 'u', 'i', 'o', 'p'],
  },
  {
    id: 'bottom-left',
    title: 'Pastki qator: chap tomon',
    description: 'Chap qo\'l bilan Z X C V B tugmalarini mashq qiling.',
    keys: ['z', 'x', 'c', 'v', 'b'],
  },
  {
    id: 'bottom-right',
    title: "Pastki qator: o'ng tomon",
    description: "O'ng qo'l bilan N M , . / tugmalarini mashq qiling.",
    keys: ['n', 'm', ',', '.', '/'],
  },
  {
    id: 'mixed',
    title: 'Aralash mashq',
    description: "Endi barcha harflarni aralash tartibda mashq qiling.",
    keys: [],
  },
  {
    id: 'words',
    title: "So'zlar bilan mashq",
    description: "Harflardan so'zlarga o'ting — haqiqiy o'zbekcha so'zlarni yozing.",
    keys: [],
    isWordLesson: true,
  },
];

export const LESSONS: Lesson[] = RAW_LESSONS.reduce<Lesson[]>((acc, lesson) => {
  const prevAllowed = acc.length ? acc[acc.length - 1].allowedKeys : [];
  const allowedKeys = Array.from(new Set([...prevAllowed, ...lesson.keys]));
  acc.push({ ...lesson, allowedKeys });
  return acc;
}, []);

function randomChar(pool: string[], newKeys: string[]): string {
  const useNew = newKeys.length > 0 && Math.random() < 0.55;
  const source = useNew ? newKeys : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/** Builds a fresh practice string for a lesson — random each call so repeats don't get memorized. */
export function generateDrillText(lesson: Lesson): string {
  if (lesson.isWordLesson) {
    const candidates = WORDS.uz.easy.filter(w => /^[a-z]+$/.test(w));
    const picked = shuffle(candidates).slice(0, 22);
    return picked.join(' ');
  }

  const pool = lesson.allowedKeys.length > 0 ? lesson.allowedKeys : LESSONS[LESSONS.length - 1].allowedKeys;
  const chunks: string[] = [];
  for (let i = 0; i < 40; i++) {
    const len = 2 + Math.floor(Math.random() * 3);
    let chunk = '';
    for (let j = 0; j < len; j++) chunk += randomChar(pool, lesson.keys);
    chunks.push(chunk);
  }
  return chunks.join(' ');
}
