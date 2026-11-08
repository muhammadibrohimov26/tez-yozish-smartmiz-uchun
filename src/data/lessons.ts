import { WORDS, SENTENCES, type Language } from './words';
import { shuffle } from '../lib/shuffle';
import { tokenizeLatin, hasReliableCyrillic } from '../lib/uzScript';
import {
  SAME_LETTER_WORDS, DIFFERENT_LETTER_WORDS, DIGRAPH_WORDS, APOSTROPHE_WORDS, IOTATED_WORDS,
  CONFUSABLE_WORDS, ADMIN_WORDS,
} from './translit';
import { THEMES_VOCAB, FREQUENT_WORDS } from './translitContent';
import { TRANSLIT_COURSE } from './translitCourse';

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
  // The apostrophe of o' and g' — Uzbek needs it constantly, so it is taught as a real key.
  "'": 'right-pinky',
  z: 'left-pinky', x: 'left-ring', c: 'left-middle', v: 'left-index', b: 'left-index',
  n: 'right-index', m: 'right-index', ',': 'right-middle', '.': 'right-ring', '/': 'right-pinky',
  '-': 'right-pinky', '=': 'right-pinky',
  ' ': 'thumb',
};

/**
 * Characters produced by holding Shift, mapped to the key actually pressed.
 * Lets the keyboard show both the key and the Shift requirement for punctuation,
 * where — unlike letters — the character itself gives no hint that Shift is needed.
 */
export const SHIFTED_KEYS: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
  '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', ':': ';', '"': "'",
  '<': ',', '>': '.', '?': '/',
};

/** The key a character is typed on, and whether Shift is held to get it. */
export function resolveKey(char: string): { key: string; needsShift: boolean } {
  const shifted = SHIFTED_KEYS[char];
  if (shifted) return { key: shifted, needsShift: true };
  const lower = char.toLowerCase();
  return { key: lower, needsShift: lower !== char };
}

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

/**
 * The two courses on the Lessons page. `translit` teaches people who already type
 * Uzbek in Cyrillic to write it in Latin; `touch` is classic touch-typing.
 * Each course unlocks on its own, so finishing one never gates the other.
 */
export type LessonTrack = 'translit' | 'touch';

export const TRACKS: { id: LessonTrack; title: string; subtitle: string }[] = [
  {
    id: 'translit',
    title: 'Kirilldan lotinga',
    subtitle: "Kirillcha yozishga o'rganganlar uchun: har bir kirill harfi lotinda qanday yozilishini va klaviaturaning qaysi tugmasida turishini o'rganing.",
  },
  {
    id: 'touch',
    title: "Barmoq bilan yozish",
    subtitle: "Barmoqlaringizni to'g'ri joylashtirib, klaviaturaga qaramasdan yozishni o'rganing.",
  },
];

export interface Lesson {
  id: string;
  track: LessonTrack;
  /** The module ("bo'lim") a lesson belongs to — groups the long course on the Lessons page. */
  module?: string;
  title: string;
  description: string;
  /** A practical hint shown in a callout above the drill. */
  tip?: string;
  /** Cyrillic → Latin pairs this lesson introduces, shown as a "remember this" card. */
  letterMap?: { cyr: string; lat: string }[];
  /**
   * Latin sounds (as `tokenizeLatin` splits them) this lesson introduces. A
   * transliteration drill only uses words made of sounds taught so far, and each
   * word must contain at least one of these new ones.
   */
  tokens?: string[];
  /** Every sound taught up to and including this lesson (computed per track). */
  allowedTokens?: string[];
  /** Curated words to drill instead of the general Uzbek word pool. */
  customWords?: string[];
  /** Curated sentences to drill. */
  customSentences?: string[];
  /** Show each word's Cyrillic spelling above its Latin letters. */
  cyrillicHint?: boolean;
  /**
   * Hide the Latin letters still to be typed: only the Cyrillic word is visible,
   * and the learner has to recall its Latin spelling. The right letter (and its
   * key) is revealed only after a mistake.
   */
  hideLatin?: boolean;
  /** Drill bare syllables built from the letters learned so far — for meeting new keys. */
  syllables?: boolean;
  /** A review drill: half its words use these sounds, the other half anything learned so far. */
  reviewTokens?: string[];
  /** Like `reviewTokens`, for groups defined by a pattern instead of a sound (НГ). */
  reviewFilter?: (word: string) => boolean;
  /** Target length of a sentence drill in characters; 1 means "exactly one item" (whole texts). */
  textLength?: number;
  /** New keys introduced by this lesson. */
  keys: string[];
  /** This lesson's keys plus every previous lesson's keys. */
  allowedKeys: string[];
  /** Drills use real Uzbek words instead of random letter chunks. */
  isWordLesson?: boolean;
  /**
   * Multi-character units drilled instead of single keys — for the Uzbek
   * digraphs (o', g', sh, ch), which have to be typed as one motion.
   */
  units?: string[];
  /** Extra condition on the words a word lesson may pick. */
  wordFilter?: (word: string) => boolean;
  /** Difficulty buckets a word lesson draws from. Defaults to `easy` alone. */
  wordLevels?: ('easy' | 'medium' | 'hard')[];
  /** Word list language. Defaults to Uzbek. */
  wordLanguage?: Language;
  /** Interleaves numbers between the words — dates, quantities, real-world text. */
  mixNumbers?: boolean;
  /** How many words the drill uses. Fewer for long words, so drills stay comparable. */
  wordCount?: number;
  /** Words start with a capital letter — the drill for the Shift key. */
  capitalize?: boolean;
  /** Capitals must be typed as capitals; otherwise Shift is not required. */
  caseSensitive?: boolean;
  /** Restricts the random-chunk pool, e.g. to one hand's keys. Defaults to `allowedKeys`. */
  poolKeys?: string[];
  /** Punctuation marks appended to each word of a word lesson. */
  punctuation?: string[];
  /** Drill on whole sentences — capitals, commas and full stops in real text. */
  useSentences?: boolean;
}

export type RawLesson = Omit<Lesson, 'allowedKeys' | 'allowedTokens' | 'track'>;

const TOUCH_LESSONS: RawLesson[] = [
  {
    id: 'home-f-j',
    title: 'Uy qatori: F va J',
    description: "Barmoqlaringizni F va J tugmalariga qo'ying — ular ostida kichik chiziqcha bor.",
    keys: ['f', 'j'],
  },
  {
    id: 'home-row',
    title: "Uy qatori: to'liq",
    description: 'Barcha uy qatori tugmalari: A S D F G va H J K L ;',
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
    id: 'left-hand',
    title: "Chap qo'l mashqi",
    description: "Faqat chap qo'l tugmalari. O'ng qo'l uy qatorida tinch tursin.",
    keys: [],
    poolKeys: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'],
  },
  {
    id: 'right-hand',
    title: "O'ng qo'l mashqi",
    description: "Faqat o'ng qo'l tugmalari. Chap qo'l uy qatorida tinch tursin.",
    keys: [],
    poolKeys: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm'],
  },
  {
    id: 'uzbek-letters',
    title: "O'zbekcha harflar: o', g', sh, ch",
    description: "Apostrof tugmasi ; ning o'ng tomonida — uni o'ng jimjiloq bilan bosing. Harf birikmalarini bir harakatdek yozishga o'rganing.",
    keys: ["'"],
    units: ["o'", "g'", 'sh', 'ch', 'ng'],
  },
  {
    id: 'uzbek-words',
    title: "Apostrofli so'zlar",
    description: "o' va g' qatnashgan haqiqiy so'zlar: ko'z, yo'l, bog', tog'.",
    keys: [],
    isWordLesson: true,
    wordFilter: word => word.includes("'"),
    wordLevels: ['easy', 'medium'],
  },
  {
    id: 'words',
    title: "So'zlar bilan mashq",
    description: "Harflardan so'zlarga o'ting — haqiqiy o'zbekcha so'zlarni yozing.",
    keys: [],
    isWordLesson: true,
  },
  {
    id: 'numbers',
    title: 'Raqamlar qatori',
    description: "Eng yuqoridagi qator: 1 2 3 4 5 va 6 7 8 9 0. Har bosishdan keyin barmoqni uy qatoriga qaytaring.",
    keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  },
  {
    id: 'capitals',
    title: 'Bosh harflar: Shift',
    description: "Shift'ni qarama-qarshi qo'lning jimjilog'i bilan bosing: chap qo'l harfiga o'ng Shift, o'ng qo'l harfiga chap Shift.",
    keys: [],
    isWordLesson: true,
    wordLevels: ['easy', 'medium'],
    capitalize: true,
    caseSensitive: true,
  },
  {
    id: 'punctuation',
    title: 'Tinish belgilari',
    description: "Vergul, nuqta, so'roq va undov. ? ! : belgilari uchun Shift'ni ushlab turing.",
    keys: ['-'],
    isWordLesson: true,
    wordLevels: ['easy', 'medium'],
    punctuation: [',', '.', '?', '!', ':', '-'],
    caseSensitive: true,
  },
  {
    id: 'sentences',
    title: 'Gaplar',
    description: "Haqiqiy gaplar: bosh harf, tinish belgisi va probel — hammasi birga.",
    keys: [],
    useSentences: true,
    caseSensitive: true,
  },
  {
    id: 'hard-words',
    title: "Qiyin so'zlar",
    description: "Uzun so'zlar: mustaqillik, muvaffaqiyat, rejalashtirish. Shoshmang, ritmni saqlang.",
    keys: [],
    isWordLesson: true,
    wordLevels: ['hard'],
    wordCount: 14,
  },
  {
    id: 'number-text',
    title: 'Raqamli matn',
    description: "Raqam va so'z aralash — sana, miqdor, hisob. Qo'lni harflardan raqamlarga tez ko'chirishni mashq qiling.",
    keys: [],
    isWordLesson: true,
    wordLevels: ['easy', 'medium'],
    mixNumbers: true,
  },
  {
    id: 'symbols',
    title: 'Maxsus belgilar',
    description: "@ # % & * ( ) belgilari raqamlar qatorida, Shift bilan yoziladi. Elektron pochta va parollar uchun kerak.",
    keys: [],
    isWordLesson: true,
    wordLevels: ['easy'],
    punctuation: ['@', '#', '%', '&', '*', '(', ')'],
    caseSensitive: true,
  },
  {
    id: 'english-words',
    title: "Ingliz tili so'zlari",
    description: "Eng ko'p uchraydigan ingliz so'zlari — apostrof va o'zbekcha harflarsiz sof lotin alifbosi.",
    keys: [],
    isWordLesson: true,
    wordLanguage: 'en',
    wordLevels: ['easy', 'medium'],
  },
  {
    id: 'speed',
    title: 'Tezlik mashqi',
    description: "Qisqa so'zlar. Bu yerda maqsad - yangi tugma emas, tezlik. O'z rekordingizni yangilang.",
    keys: [],
    isWordLesson: true,
    wordLevels: ['easy'],
    wordFilter: word => word.length <= 4,
  },
];


/** Rolls each lesson's newly taught keys / sounds forward into its successors, within one track. */
function buildTrack(track: LessonTrack, raw: RawLesson[]): Lesson[] {
  return raw.reduce<Lesson[]>((acc, lesson) => {
    const prev = acc[acc.length - 1];
    const allowedKeys = Array.from(new Set([...(prev?.allowedKeys ?? []), ...lesson.keys]));
    const allowedTokens = Array.from(new Set([...(prev?.allowedTokens ?? []), ...(lesson.tokens ?? [])]));
    acc.push({ ...lesson, track, allowedKeys, allowedTokens });
    return acc;
  }, []);
}

/** Every lesson, Cyrillic → Latin course first. */
export const LESSONS: Lesson[] = [
  ...buildTrack('translit', TRANSLIT_COURSE),
  ...buildTrack('touch', TOUCH_LESSONS),
];

/** The lessons of one course, in order. */
export function lessonsInTrack(track: LessonTrack): Lesson[] {
  return LESSONS.filter(l => l.track === track);
}

function randomChar(pool: string[], newKeys: string[]): string {
  const useNew = newKeys.length > 0 && Math.random() < 0.55;
  const source = useNew ? newKeys : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * Words the drill can actually ask for: a–z plus the apostrophe of o'/g'.
 * The apostrophe used to be excluded, which silently dropped every word with
 * o' or g' — i.e. the most distinctly Uzbek ones — from the word lessons.
 */
const TYPEABLE_WORD = /^[a-z']+$/;

/**
 * Words a transliteration drill may draw on when a lesson names no list of its
 * own: the app's Uzbek words plus every curated list, minus words whose Cyrillic
 * hint could be wrong.
 */
const TRANSLIT_POOL = Array.from(new Set([
  ...WORDS.uz.easy, ...WORDS.uz.medium, ...WORDS.uz.hard,
  ...SAME_LETTER_WORDS, ...DIFFERENT_LETTER_WORDS, ...DIGRAPH_WORDS, ...APOSTROPHE_WORDS,
  ...IOTATED_WORDS, ...CONFUSABLE_WORDS, ...ADMIN_WORDS, ...FREQUENT_WORDS,
  ...THEMES_VOCAB.flatMap(t => t.words),
])).filter(w => TYPEABLE_WORD.test(w) && hasReliableCyrillic(w));

/** Curated lists may hold names (capitals) and hyphenated words. */
const CUSTOM_WORD = /^[A-Za-z'-]+$/;

/** Whether a word uses only sounds taught so far, and at least one of this lesson's new ones. */
function fitsTranslitLesson(word: string, lesson: Lesson): boolean {
  const allowed = new Set(lesson.allowedTokens ?? []);
  const fresh = lesson.tokens ?? [];
  const tokens = tokenizeLatin(word).map(t => t.lat).filter(t => /[a-z']/.test(t));
  if (!tokens.every(t => allowed.has(t))) return false;
  if (fresh.length > 0 && !tokens.some(t => fresh.includes(t))) return false;
  return lesson.wordFilter ? lesson.wordFilter(word) : true;
}

const VOWEL_TOKENS = new Set(['a', 'o', 'i', 'u', 'e', "o'", 'yo', 'yu', 'ya', 'ye']);

/**
 * Bare syllables from the sounds learned so far — the first look at new keys.
 * Opens with each new letter on its own, then mixes CV / VC / CVC / CVCV
 * shapes, nearly always including a new sound. A syllable whose letters would
 * re-read as a sound not yet taught (s + h reads as ш) is thrown away.
 */
function generateSyllables(lesson: Lesson, count = 26): string[] {
  const allowed = new Set(lesson.allowedTokens ?? []);
  const usable = (lesson.allowedTokens ?? []).filter(t => t !== "'");
  const vowels = usable.filter(t => VOWEL_TOKENS.has(t));
  const consonants = usable.filter(t => !VOWEL_TOKENS.has(t));
  const fresh = (lesson.tokens ?? []).filter(t => t !== "'");
  const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];
  const shapes = ['CV', 'VC', 'CVC', 'CVCV', 'VCV', 'CV'];

  const syllables: string[] = [];
  let guard = 0;
  while (syllables.length < count - fresh.length && guard++ < 2000) {
    const shape = pick(shapes);
    const slots = shape.split('').map(kind => (kind === 'V' ? pick(vowels) : pick(consonants)));
    if (slots.some(s => s === undefined)) continue;
    // Make sure most syllables practise a new sound: swap one in where the kind fits.
    if (fresh.length && Math.random() < 0.8 && !slots.some(s => fresh.includes(s))) {
      const candidate = pick(fresh);
      const kind = VOWEL_TOKENS.has(candidate) ? 'V' : 'C';
      const at = shape.split('').findIndex(k => k === kind);
      if (at >= 0) slots[at] = candidate;
    }
    const syllable = slots.join('');
    const reread = tokenizeLatin(syllable).map(t => t.lat);
    if (!reread.every(t => allowed.has(t))) continue;
    syllables.push(syllable);
  }
  // Each new letter once on its own first, so the learner finds its key in isolation.
  return [...fresh, ...syllables];
}

function generateTranslitText(lesson: Lesson): string {
  if (lesson.customSentences) {
    const target = lesson.textLength ?? 120;
    const picked: string[] = [];
    let length = 0;
    // About 120 characters by default: two or three messages, long enough to mean something.
    for (const sentence of shuffle(lesson.customSentences)) {
      if (length >= target) break;
      picked.push(sentence);
      length += sentence.length + 1;
    }
    return picked.join(' ');
  }

  const count = lesson.wordCount ?? 20;
  if (lesson.syllables) return generateSyllables(lesson, count + 6).join(' ');

  const source = lesson.customWords
    ? lesson.customWords.filter(w => CUSTOM_WORD.test(w) && hasReliableCyrillic(w))
    : TRANSLIT_POOL;
  const candidates = source.filter(w => fitsTranslitLesson(w, lesson));

  let picked: string[];
  if (lesson.reviewTokens || lesson.reviewFilter) {
    // Half on the group just learned, half on everything before it.
    const focus = lesson.reviewFilter ?? ((w: string) => tokenizeLatin(w).some(t => lesson.reviewTokens!.includes(t.lat)));
    const focused = shuffle(candidates.filter(focus));
    const rest = shuffle(candidates.filter(w => !focus(w)));
    const half = Math.ceil(count / 2);
    picked = shuffle([...focused.slice(0, half), ...rest.slice(0, count - Math.min(half, focused.length))]);
  } else {
    picked = shuffle(candidates).slice(0, count);
  }

  // Early lessons know only a handful of letters, so real words run short:
  // repeat what there is, and top up with syllables if even that is too little.
  if (picked.length < count && candidates.length >= 6) {
    while (picked.length < count) picked.push(candidates[Math.floor(Math.random() * candidates.length)]);
  } else if (picked.length < count) {
    picked = shuffle([...picked, ...generateSyllables({ ...lesson, tokens: [] }, count).slice(0, count - picked.length)]);
  }
  return picked.join(' ');
}

/** Builds a fresh practice string for a lesson — random each call so repeats don't get memorized. */
export function generateDrillText(lesson: Lesson): string {
  if (lesson.track === 'translit') return generateTranslitText(lesson);

  if (lesson.units) {
    const units = lesson.units;
    const chunks: string[] = [];
    for (let i = 0; i < 26; i++) {
      const len = 1 + Math.floor(Math.random() * 2);
      let chunk = '';
      for (let j = 0; j < len; j++) chunk += units[Math.floor(Math.random() * units.length)];
      chunks.push(chunk);
    }
    return chunks.join(' ');
  }

  if (lesson.useSentences) {
    const sentences = SENTENCES.uz;
    return shuffle(sentences).slice(0, 2).join(' ');
  }

  if (lesson.isWordLesson) {
    const levels = lesson.wordLevels ?? ['easy'];
    const language = lesson.wordLanguage ?? 'uz';
    const pool = levels.flatMap(level => WORDS[language][level]);
    const candidates = pool.filter(
      w => TYPEABLE_WORD.test(w) && (lesson.wordFilter ? lesson.wordFilter(w) : true),
    );
    const count = lesson.wordCount ?? (lesson.mixNumbers ? 11 : 22);
    let words = shuffle(candidates).slice(0, count);
    if (lesson.capitalize) {
      words = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    }
    if (lesson.punctuation) {
      const marks = lesson.punctuation;
      words = words.map(w => w + marks[Math.floor(Math.random() * marks.length)]);
    }
    if (lesson.mixNumbers) {
      // A number before each word: "15 kun 2024 yil" — the real reason to reach
      // for the number row is quantities and dates, not digits in isolation.
      words = words.flatMap(w => [String(1 + Math.floor(Math.random() * 2500)), w]);
    }
    return words.join(' ');
  }

  const pool = lesson.poolKeys
    ?? (lesson.allowedKeys.length > 0 ? lesson.allowedKeys : lessonsInTrack('touch').slice(-1)[0].allowedKeys);
  const chunks: string[] = [];
  for (let i = 0; i < 40; i++) {
    const len = 2 + Math.floor(Math.random() * 3);
    let chunk = '';
    for (let j = 0; j < len; j++) chunk += randomChar(pool, lesson.keys);
    chunks.push(chunk);
  }
  return chunks.join(' ');
}
