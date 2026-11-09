/**
 * Uzbek Latin ⇄ Cyrillic script helpers.
 *
 * The "Kirilldan lotinga" lessons show every Latin word with its Cyrillic
 * spelling above it, so the conversion has to be right letter by letter: an
 * admin who has typed Cyrillic for years learns the mapping from these hints.
 */

/** One sound of a Latin word and the Cyrillic letter(s) it is written with. */
export interface ScriptToken {
  /** Latin spelling, lowercase: 'sh', "o'", 'ye', 'a', ... */
  lat: string;
  /** Cyrillic spelling, lowercase: 'ш', 'ў', 'е', 'а', ... */
  cyr: string;
  /** The token as written in the source, case preserved. */
  raw: string;
}

/** Every apostrophe-like mark people type for o‘/g‘ and the tutuq belgisi. */
const APOSTROPHES = /[ʻʼ‘’`´]/g;

/** Turns typographic apostrophes (oʻ, gʻ, maʼlumot) into the plain ' the drills use. */
export function normalizeApostrophes(text: string): string {
  return text.replace(APOSTROPHES, "'");
}

const SINGLE: Record<string, string> = {
  a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', h: 'ҳ', i: 'и', j: 'ж', k: 'к', l: 'л',
  m: 'м', n: 'н', o: 'о', p: 'п', q: 'қ', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в',
  x: 'х', y: 'й', z: 'з',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const isLetter = (ch: string | undefined) => ch !== undefined && /[a-z']/i.test(ch);

/**
 * Russian loanwords whose Cyrillic spelling no letter rule can derive: the soft
 * sign ь (palto → пальто) and Ц (litsey → лицей) are written in Cyrillic but leave
 * no trace in Latin.
 */
const EXCEPTIONS: Record<string, string> = {
  kompyuter: 'компьютер', palto: 'пальто', delfin: 'дельфин', film: 'фильм',
  albom: 'альбом', medal: 'медаль', avtomobil: 'автомобиль', dvigatel: 'двигатель',
  pedal: 'педаль', rul: 'руль', kisel: 'кисель', sudya: 'судья',
  yanvar: 'январь', fevral: 'февраль', aprel: 'апрель', iyun: 'июнь', iyul: 'июль',
  sentyabr: 'сентябрь', oktyabr: 'октябрь', noyabr: 'ноябрь', dekabr: 'декабрь',
  litsey: 'лицей', ofitser: 'офицер', investitsiya: 'инвестиция', mototsikl: 'мотоцикл',
  sirk: 'цирк', konsert: 'концерт', mebel: 'мебель', model: 'модель', spektakl: 'спектакль',
  sement: 'цемент', stansiya: 'станция', aksiya: 'акция', kvitansiya: 'квитанция', pyesa: 'пьеса',
};

/**
 * Whether the Cyrillic hint for this word can be trusted. Words with "ts" are
 * ambiguous (ketsa is кетса, but litsey is лицей), so only listed ones pass.
 */
export function hasReliableCyrillic(word: string): boolean {
  const lower = normalizeApostrophes(word).toLowerCase();
  return lower in EXCEPTIONS || !lower.includes('ts');
}

/**
 * Splits a Latin word into sounds, longest match first. Non-letters (digits,
 * spaces, punctuation) come back as tokens whose `cyr` equals the character.
 */
export function tokenizeLatin(input: string): ScriptToken[] {
  const text = normalizeApostrophes(input);
  const tokens: ScriptToken[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    const lower = ch.toLowerCase();
    const next = text[i + 1]?.toLowerCase();
    const afterNext = text[i + 2];
    const push = (lat: string, cyr: string, len: number) => {
      tokens.push({ lat, cyr, raw: text.slice(i, i + len) });
      i += len;
    };

    if ((lower === 'o' || lower === 'g') && next === "'") {
      push(`${lower}'`, lower === 'o' ? 'ў' : 'ғ', 2);
    } else if (lower === 's' && next === 'h') {
      push('sh', 'ш', 2);
    } else if (lower === 'c' && next === 'h') {
      push('ch', 'ч', 2);
    } else if (lower === 'y' && next && 'aoue'.includes(next) && afterNext !== "'") {
      // yo'l is й + ў + л, not ё + ...: an o followed by ' is the letter ў.
      const cyr = { a: 'я', o: 'ё', u: 'ю', e: 'е' }[next as 'a' | 'o' | 'u' | 'e'];
      push(`y${next}`, cyr, 2);
    } else if (lower === 'e') {
      // Э at the start of a word or after a vowel (eshik, poeziya), Е elsewhere.
      const prev = text[i - 1]?.toLowerCase();
      const initial = !isLetter(prev) || prev === "'";
      push('e', initial || (prev !== undefined && VOWELS.has(prev)) ? 'э' : 'е', 1);
    } else if (ch === "'") {
      // An apostrophe that is not part of o'/g' is the tutuq belgisi: ma'lumot.
      push("'", 'ъ', 1);
    } else if (SINGLE[lower]) {
      push(lower, SINGLE[lower], 1);
    } else {
      push(lower, ch, 1);
    }
  }
  return tokens;
}

/** Upper-cases the first letter of a Cyrillic spelling when the source was capitalised. */
function matchCase(raw: string, cyr: string): string {
  if (raw.length === 0 || raw[0] === raw[0].toLowerCase()) return cyr;
  return cyr.charAt(0).toUpperCase() + cyr.slice(1);
}

/** Converts Uzbek Latin text to Cyrillic, keeping capitals and punctuation. */
export function latinToCyrillic(text: string): string {
  return normalizeApostrophes(text).replace(/[A-Za-z']+/g, word => {
    const exception = EXCEPTIONS[word.toLowerCase()];
    if (exception) return matchCase(word, exception);
    return tokenizeLatin(word).map(t => matchCase(t.raw, t.cyr)).join('');
  });
}

/** Whether a character belongs to the Cyrillic block — used to spot a Cyrillic keyboard layout. */
export function isCyrillicChar(ch: string): boolean {
  return /[Ѐ-ӿ]/.test(ch);
}

/** The full Cyrillic → Latin alphabet, in Cyrillic alphabetical order. `tricky` marks the letters people get wrong. */
export const ALPHABET: { cyr: string; lat: string; tricky?: boolean; note?: string }[] = [
  { cyr: 'А', lat: 'A' }, { cyr: 'Б', lat: 'B' }, { cyr: 'В', lat: 'V' }, { cyr: 'Г', lat: 'G' },
  { cyr: 'Д', lat: 'D' },
  { cyr: 'Е', lat: 'E / Ye', tricky: true, note: "So'z boshida Ye: ер → yer" },
  { cyr: 'Ё', lat: 'Yo', tricky: true }, { cyr: 'Ж', lat: 'J', tricky: true }, { cyr: 'З', lat: 'Z' },
  { cyr: 'И', lat: 'I' }, { cyr: 'Й', lat: 'Y', tricky: true }, { cyr: 'К', lat: 'K' },
  { cyr: 'Л', lat: 'L' }, { cyr: 'М', lat: 'M' }, { cyr: 'Н', lat: 'N' }, { cyr: 'О', lat: 'O' },
  { cyr: 'П', lat: 'P' }, { cyr: 'Р', lat: 'R' }, { cyr: 'С', lat: 'S' }, { cyr: 'Т', lat: 'T' },
  { cyr: 'У', lat: 'U' }, { cyr: 'Ф', lat: 'F' },
  { cyr: 'Х', lat: 'X', tricky: true, note: 'хат → xat (H emas!)' },
  { cyr: 'Ц', lat: 'S / Ts', tricky: true, note: 'цирк → sirk' },
  { cyr: 'Ч', lat: 'Ch', tricky: true }, { cyr: 'Ш', lat: 'Sh', tricky: true },
  { cyr: 'Ъ', lat: "'", tricky: true, note: "маълумот → ma'lumot" },
  { cyr: 'Ь', lat: '—', note: 'Yozilmaydi' },
  { cyr: 'Э', lat: 'E' }, { cyr: 'Ю', lat: 'Yu', tricky: true }, { cyr: 'Я', lat: 'Ya', tricky: true },
  { cyr: 'Ў', lat: "O'", tricky: true }, { cyr: 'Қ', lat: 'Q', tricky: true },
  { cyr: 'Ғ', lat: "G'", tricky: true },
  { cyr: 'Ҳ', lat: 'H', tricky: true, note: 'ҳафта → hafta' },
];

/**
 * Russian ЙЦУКЕН labels printed on the same physical keys as the Latin ones —
 * the second legend on almost every keyboard sold in Uzbekistan. Shown faintly on
 * the lesson keyboard so a Cyrillic touch-typist can link old habits to new keys.
 */
export const CYRILLIC_KEY_LABELS: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э',
  z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю',
};
