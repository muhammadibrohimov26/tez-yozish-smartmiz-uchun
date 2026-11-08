import { WORDS, SENTENCES, type Language } from './words';
import { shuffle } from '../lib/shuffle';
import { tokenizeLatin, hasReliableCyrillic } from '../lib/uzScript';
import {
  SAME_LETTER_WORDS, DIFFERENT_LETTER_WORDS, DIGRAPH_WORDS, APOSTROPHE_WORDS, IOTATED_WORDS,
  CONFUSABLE_WORDS, ADMIN_WORDS, ADMIN_SENTENCES,
} from './translit';

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

type RawLesson = Omit<Lesson, 'allowedKeys' | 'allowedTokens' | 'track'>;

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


/** Sounds that trip up a Cyrillic typist — the "hidden Latin" drills insist on them. */
const TRICKY_TOKENS = ['q', 'h', 'x', 'j', 'y', 'sh', 'ch', "o'", "g'", "'", 'yo', 'yu', 'ya', 'ye'];

const TRANSLIT_LESSONS: RawLesson[] = [
  {
    id: 'kl-same',
    title: 'Bir xil harflar',
    description: "Bu harflar kirillda ham, lotinda ham bir xil o'qiladi — faqat klaviaturadagi o'rni boshqa. Har so'z ustida uning kirillchasi turadi.",
    tip: "Avval klaviaturani lotinga (EN) o'tkazing: Windows'da Alt+Shift yoki Win+Probel, Mac'da Ctrl+Probel. Ekranning pastki o'ng burchagida EN yozuvi chiqishi kerak.",
    letterMap: [
      { cyr: 'А', lat: 'a' }, { cyr: 'Б', lat: 'b' }, { cyr: 'В', lat: 'v' }, { cyr: 'Г', lat: 'g' },
      { cyr: 'Д', lat: 'd' }, { cyr: 'Е / Э', lat: 'e' }, { cyr: 'З', lat: 'z' }, { cyr: 'И', lat: 'i' },
      { cyr: 'К', lat: 'k' }, { cyr: 'Л', lat: 'l' }, { cyr: 'М', lat: 'm' }, { cyr: 'Н', lat: 'n' },
      { cyr: 'О', lat: 'o' }, { cyr: 'П', lat: 'p' }, { cyr: 'Р', lat: 'r' }, { cyr: 'С', lat: 's' },
      { cyr: 'Т', lat: 't' }, { cyr: 'У', lat: 'u' }, { cyr: 'Ф', lat: 'f' },
    ],
    keys: [],
    tokens: ['a', 'b', 'v', 'g', 'd', 'e', 'z', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f'],
    customWords: SAME_LETTER_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-different',
    title: 'Farqli harflar: Қ Ҳ Х Ж Й',
    description: "Eng ko'p xato shu yerda: Х — bu X, Ҳ — bu H. Қ — Q, Ж — J, Й — Y.",
    tip: "Eslab qoling: kirilldagi Х lotinda X bo'ladi (xat, xona), H esa faqat Ҳ uchun (hafta, hisob).",
    letterMap: [
      { cyr: 'Қ', lat: 'q' }, { cyr: 'Ҳ', lat: 'h' }, { cyr: 'Х', lat: 'x' },
      { cyr: 'Ж', lat: 'j' }, { cyr: 'Й', lat: 'y' },
    ],
    keys: [],
    tokens: ['q', 'h', 'x', 'j', 'y'],
    customWords: DIFFERENT_LETTER_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-digraphs',
    title: 'Ikki harfli tovushlar: Ш Ч',
    description: 'Bitta kirill harfi — ikkita lotin harfi. Ш = s + h, Ч = c + h. НГ esa o\'zgarmaydi: ng.',
    tip: "Ikki harfni bitta harakatdek, uzilishsiz yozishga harakat qiling: sh, ch.",
    letterMap: [{ cyr: 'Ш', lat: 'sh' }, { cyr: 'Ч', lat: 'ch' }, { cyr: 'НГ', lat: 'ng' }],
    keys: [],
    tokens: ['sh', 'ch'],
    customWords: DIGRAPH_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-apostrophe',
    title: "Apostrofli harflar: Ў Ғ Ъ",
    description: "Ў va Ғ harf + apostrof bilan yoziladi: o', g'. Ъ (tutuq belgisi) esa faqat apostrof: маълумот → ma'lumot.",
    tip: "Apostrof ( ' ) tugmasi L dan keyin ikkinchi — kirill klaviaturada bu Э tugmasi. Uni o'ng jimjiloq bilan bosing.",
    letterMap: [{ cyr: 'Ў', lat: "o'" }, { cyr: 'Ғ', lat: "g'" }, { cyr: 'Ъ', lat: "'" }],
    keys: [],
    tokens: ["o'", "g'", "'"],
    customWords: APOSTROPHE_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-iotated',
    title: 'Ё Ю Я Е: y + unli',
    description: "Bu harflar lotinda ikki harf bilan yoziladi: ё → yo, ю → yu, я → ya. Е so'z boshida va unlidan keyin ye bo'ladi: ер → yer.",
    tip: "Ц harfi lotinda s yoki ts bo'ladi: цирк → sirk, лицей → litsey. Ь (yumshatish belgisi) umuman yozilmaydi.",
    letterMap: [
      { cyr: 'Ё', lat: 'yo' }, { cyr: 'Ю', lat: 'yu' }, { cyr: 'Я', lat: 'ya' },
      { cyr: 'Е', lat: 'ye' }, { cyr: 'Ц', lat: 's / ts' }, { cyr: 'Ь', lat: '—' },
    ],
    keys: [],
    tokens: ['yo', 'yu', 'ya', 'ye'],
    customWords: IOTATED_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-words',
    title: "Barcha harflar: so'zlar",
    description: "Endi barcha harflar aralash. Kirillcha so'zga qarab, uni lotinda yozing.",
    keys: [],
    tokens: [],
    cyrillicHint: true,
  },
  {
    id: 'kl-confusable',
    title: 'X yoki H? Q yoki K?',
    description: "Sinov: lotin yozuvi yashirin, faqat kirillcha so'z ko'rinadi. Xato qilsangiz, to'g'ri harf va tugma ko'rsatiladi.",
    tip: 'Х → x, Ҳ → h, Қ → q, К → k. Shoshmang — avval o\'ylang, keyin bosing.',
    letterMap: [{ cyr: 'Х', lat: 'x' }, { cyr: 'Ҳ', lat: 'h' }, { cyr: 'Қ', lat: 'q' }, { cyr: 'К', lat: 'k' }],
    keys: [],
    tokens: [],
    customWords: CONFUSABLE_WORDS,
    cyrillicHint: true,
    hideLatin: true,
    wordCount: 18,
  },
  {
    id: 'kl-admin-words',
    title: "Ish so'zlari",
    description: "O'quv markazida har kuni yoziladigan so'zlar: o'quvchi, to'lov, shartnoma, davomat, hisobot.",
    keys: [],
    tokens: [],
    customWords: ADMIN_WORDS,
    cyrillicHint: true,
  },
  {
    id: 'kl-hidden-words',
    title: "Yashirin lotin: so'zlar",
    description: "Faqat kirillcha so'z ko'rinadi — lotinchasini o'zingiz eslab yozing. Har bir so'zda kamida bitta qiyin harf bor.",
    keys: [],
    tokens: [],
    cyrillicHint: true,
    hideLatin: true,
    wordFilter: word => tokenizeLatin(word).some(t => TRICKY_TOKENS.includes(t.lat)),
    wordCount: 18,
  },
  {
    id: 'kl-messages',
    title: 'Xabarlar yozish',
    description: "Ota-onalar va o'quvchilarga yuboriladigan haqiqiy xabarlar: bosh harf, vergul va nuqta bilan.",
    keys: [],
    tokens: [],
    customSentences: ADMIN_SENTENCES,
    cyrillicHint: true,
  },
  {
    id: 'kl-final',
    title: 'Yakuniy sinov: xabarlar',
    description: "Faqat kirillcha matn ko'rinadi — butun xabarni lotinda yozing. Buni 90% aniqlik bilan o'tsangiz, lotinda bemalol yoza olasiz!",
    keys: [],
    tokens: [],
    customSentences: [...ADMIN_SENTENCES, ...SENTENCES.uz],
    cyrillicHint: true,
    hideLatin: true,
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
  ...buildTrack('translit', TRANSLIT_LESSONS),
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
  ...IOTATED_WORDS, ...ADMIN_WORDS,
])).filter(w => TYPEABLE_WORD.test(w) && hasReliableCyrillic(w));

/** Whether a word uses only sounds taught so far, and at least one of this lesson's new ones. */
function fitsTranslitLesson(word: string, lesson: Lesson): boolean {
  const allowed = new Set(lesson.allowedTokens ?? []);
  const fresh = lesson.tokens ?? [];
  const tokens = tokenizeLatin(word).map(t => t.lat);
  if (!tokens.every(t => allowed.has(t))) return false;
  if (fresh.length > 0 && !tokens.some(t => fresh.includes(t))) return false;
  return lesson.wordFilter ? lesson.wordFilter(word) : true;
}

function generateTranslitText(lesson: Lesson): string {
  if (lesson.customSentences) {
    const picked: string[] = [];
    let length = 0;
    // About 120 characters: two or three messages, long enough to mean something.
    for (const sentence of shuffle(lesson.customSentences)) {
      if (length >= 120) break;
      picked.push(sentence);
      length += sentence.length + 1;
    }
    return picked.join(' ');
  }
  const source = (lesson.customWords ?? TRANSLIT_POOL).filter(w => TYPEABLE_WORD.test(w) && hasReliableCyrillic(w));
  const candidates = source.filter(w => fitsTranslitLesson(w, lesson));
  return shuffle(candidates).slice(0, lesson.wordCount ?? 20).join(' ');
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
