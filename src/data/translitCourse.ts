/**
 * The "Kirilldan lotinga" course: 100+ lessons that take someone who types
 * Uzbek in Cyrillic to typing it fluently in Latin.
 *
 * Shape of the course:
 *  1–5. Letters, a few at a time. Each group gets three lessons — meet the
 *       letters (syllables), use them in words, then mix them with everything
 *       learned so far — and every module ends with a hidden-Latin test.
 *  6.   Capitals, punctuation, numbers, dates, phone numbers and money.
 *  7.   Themed vocabulary.
 *  8.   Sentences: greetings, phone calls, messages to parents, payments.
 *  9.   Whole texts, speed, typing without the Cyrillic crutch, dictations,
 *       and the final exam.
 *
 * Lesson ids are stable strings — progress is stored against them.
 */
import type { RawLesson } from './lessons';
import { tokenizeLatin } from '../lib/uzScript';
import {
  SAME_LETTER_WORDS, DIFFERENT_LETTER_WORDS, DIGRAPH_WORDS, APOSTROPHE_WORDS, IOTATED_WORDS,
  CONFUSABLE_WORDS, ADMIN_WORDS,
} from './translit';
import * as C from './translitContent';

type LetterPair = { cyr: string; lat: string };

/** Words that contain at least one of these Latin sounds. */
const withAny = (tokens: string[]) => (word: string) =>
  tokenizeLatin(word).some(t => tokens.includes(t.lat));

const LAYOUT_TIP =
  "Avval klaviaturani lotinga (EN) o'tkazing: Windows'da Alt+Shift yoki Win+Probel, Mac'da Ctrl+Probel. Ekranning pastki o'ng burchagida EN yozuvi chiqishi kerak.";

interface LetterGroup {
  key: string;
  /** Short name used in the three lesson titles, e.g. "А О Н Т". */
  name: string;
  letterMap: LetterPair[];
  tokens: string[];
  tip?: string;
  /** Words written with this group's letters (documentation; all of them are in the shared pool). */
  words?: string[];
  /** Skip the syllable lesson (e.g. НГ or Ъ, which make no sense as bare syllables). */
  noSyllables?: boolean;
  /** For groups that introduce no new token (НГ): which words count as "using" it. */
  filter?: (word: string) => boolean;
}

/** Three lessons for one group of letters: meet them, use them in words, mix them with the rest. */
function letterGroup(module: string, g: LetterGroup): RawLesson[] {
  const base = {
    module,
    keys: [] as string[],
    letterMap: g.letterMap,
    cyrillicHint: true,
  };
  const lessons: RawLesson[] = [];
  if (!g.noSyllables) {
    lessons.push({
      ...base,
      id: `kl-${g.key}-1`,
      title: `${g.name}: tanishuv`,
      description: `Yangi harflar va ulardan tuzilgan bo'g'inlar. Har bir tugmani topib, barmog'ingizga o'rgating.`,
      tip: g.tip,
      tokens: g.tokens,
      syllables: true,
    });
  }
  lessons.push({
    ...base,
    id: `kl-${g.key}-2`,
    title: `${g.name}: so'zlar`,
    description: "Yangi harflar qatnashgan haqiqiy so'zlar. Kirillchasiga qarab, lotinda yozing.",
    tip: g.noSyllables ? g.tip : undefined,
    tokens: g.tokens,
    wordFilter: g.filter,
  });
  lessons.push({
    ...base,
    id: `kl-${g.key}-3`,
    title: `${g.name}: mustahkamlash`,
    description: "Yangi harflar avval o'rganilganlari bilan aralash. Ko'proq so'z — ko'proq mashq.",
    tokens: [],
    reviewTokens: g.filter ? undefined : g.tokens,
    reviewFilter: g.filter,
    wordCount: 28,
  });
  return lessons;
}

/** A module's closing test: hidden Latin, words using the module's letters. */
function moduleTest(module: string, key: string, tokens: string[], extraFilter?: (w: string) => boolean): RawLesson {
  return {
    module,
    keys: [],
    id: `kl-${key}-test`,
    title: "Bo'lim sinovi",
    description: "Lotin yozuvi yashirin — faqat kirillcha so'z ko'rinadi. Xato qilsangiz, to'g'ri harf ko'rsatiladi.",
    tokens: [],
    cyrillicHint: true,
    hideLatin: true,
    wordFilter: w => withAny(tokens)(w) || (extraFilter ? extraFilter(w) : false),
    wordCount: 20,
  };
}

/** A sentence lesson. `hidden` turns it into a test. */
function sentences(
  module: string, id: string, title: string, description: string, list: string[],
  opts: Partial<RawLesson> = {},
): RawLesson {
  return {
    module,
    keys: [],
    id,
    title,
    description,
    tokens: [],
    customSentences: list,
    cyrillicHint: true,
    ...opts,
  };
}

/** A word-list lesson. */
function words(
  module: string, id: string, title: string, description: string, list: string[],
  opts: Partial<RawLesson> = {},
): RawLesson {
  return { module, keys: [], id, title, description, tokens: [], customWords: list, cyrillicHint: true, ...opts };
}

// ---------------------------------------------------------------------------

const M1 = "1-bo'lim: Bir xil harflar";
const M2 = "2-bo'lim: Farqli harflar";
const M3 = "3-bo'lim: Ш Ч НГ";
const M4 = "4-bo'lim: Ў Ғ Ъ — apostrof";
const M5 = "5-bo'lim: Ё Ю Я Е";
const M6 = "6-bo'lim: Bosh harf, belgilar, raqamlar";
const M7 = "7-bo'lim: Mavzuli so'zlar";
const M8 = "8-bo'lim: Gaplar va xabarlar";
const M9 = "9-bo'lim: Matnlar va tezlik";

const module1: RawLesson[] = [
  ...letterGroup(M1, {
    key: 'aont', name: 'А О Н Т',
    letterMap: [{ cyr: 'А', lat: 'a' }, { cyr: 'О', lat: 'o' }, { cyr: 'Н', lat: 'n' }, { cyr: 'Т', lat: 't' }],
    tokens: ['a', 'o', 'n', 't'],
    tip: LAYOUT_TIP,
    words: SAME_LETTER_WORDS,
  }),
  ...letterGroup(M1, {
    key: 'irsl', name: 'И Р С Л',
    letterMap: [{ cyr: 'И', lat: 'i' }, { cyr: 'Р', lat: 'r' }, { cyr: 'С', lat: 's' }, { cyr: 'Л', lat: 'l' }],
    tokens: ['i', 'r', 's', 'l'],
    tip: "Diqqat, aldamchi harflar: kirill Р lotinda r bo'ladi, kirill С esa s. Lotin p — bu П, lotin c — alohida ishlatilmaydi.",
    words: SAME_LETTER_WORDS,
  }),
  ...letterGroup(M1, {
    key: 'kmdu', name: 'К М Д У',
    letterMap: [{ cyr: 'К', lat: 'k' }, { cyr: 'М', lat: 'm' }, { cyr: 'Д', lat: 'd' }, { cyr: 'У', lat: 'u' }],
    tokens: ['k', 'm', 'd', 'u'],
    tip: "Kirill У lotinda u bo'ladi. Lotin y esa kirill Й — uni keyingi bo'limda o'rganamiz.",
    words: SAME_LETTER_WORDS,
  }),
  ...letterGroup(M1, {
    key: 'begz', name: 'Б Е Г З',
    letterMap: [{ cyr: 'Б', lat: 'b' }, { cyr: 'Е / Э', lat: 'e' }, { cyr: 'Г', lat: 'g' }, { cyr: 'З', lat: 'z' }],
    tokens: ['b', 'e', 'g', 'z'],
    tip: "Kirill В lotin B ga o'xshaydi, lekin lotin B — bu Б. Kirill Е ham, Э ham lotinda e.",
    words: SAME_LETTER_WORDS,
  }),
  ...letterGroup(M1, {
    key: 'pvf', name: 'П В Ф',
    letterMap: [{ cyr: 'П', lat: 'p' }, { cyr: 'В', lat: 'v' }, { cyr: 'Ф', lat: 'f' }],
    tokens: ['p', 'v', 'f'],
    tip: "Kirill Н lotin H ga o'xshaydi — lekin Н = n. Lotin h esa kirill Ҳ uchun ishlatiladi.",
    words: SAME_LETTER_WORDS,
  }),
  moduleTest(M1, 'm1', ['a', 'o', 'n', 't', 'i', 'r', 's', 'l', 'k', 'm', 'd', 'u', 'b', 'e', 'g', 'z', 'p', 'v', 'f']),
];

const module2: RawLesson[] = [
  ...letterGroup(M2, {
    key: 'q', name: 'Қ → Q',
    letterMap: [{ cyr: 'Қ', lat: 'q' }, { cyr: 'К', lat: 'k' }],
    tokens: ['q'],
    tip: 'Қ va К ni farqlang: қалам → qalam, китоб → kitob. Q tugmasi chap yuqori burchakda.',
    words: DIFFERENT_LETTER_WORDS,
  }),
  ...letterGroup(M2, {
    key: 'x', name: 'Х → X',
    letterMap: [{ cyr: 'Х', lat: 'x' }],
    tokens: ['x'],
    tip: "Kirill Х lotinda ham X ko'rinishida yoziladi: хат → xat, хона → xona.",
    words: DIFFERENT_LETTER_WORDS,
  }),
  ...letterGroup(M2, {
    key: 'h', name: 'Ҳ → H',
    letterMap: [{ cyr: 'Ҳ', lat: 'h' }, { cyr: 'Х', lat: 'x' }],
    tokens: ['h'],
    tip: "Dumli Ҳ → h (ҳафта → hafta). Dumsiz Х → x (хат → xat). Eng ko'p xato aynan shu yerda!",
    words: [...DIFFERENT_LETTER_WORDS, ...CONFUSABLE_WORDS],
  }),
  ...letterGroup(M2, {
    key: 'j', name: 'Ж → J',
    letterMap: [{ cyr: 'Ж', lat: 'j' }],
    tokens: ['j'],
    tip: "J tugmasi uy qatorida, o'ng ko'rsatkich barmoq ostida — kirill klaviaturada bu О tugmasi.",
    words: DIFFERENT_LETTER_WORDS,
  }),
  ...letterGroup(M2, {
    key: 'y', name: 'Й → Y',
    letterMap: [{ cyr: 'Й', lat: 'y' }, { cyr: 'У', lat: 'u' }],
    tokens: ['y'],
    tip: 'Й → y (уй → uy, ой → oy). Adashtirmang: У → u.',
    words: DIFFERENT_LETTER_WORDS,
  }),
  words(M2, 'kl-xh-contrast', 'X yoki H? Farqlash', "Х va Ҳ aralash so'zlar. Har birida o'ylab, to'g'ri harfni tanlang.",
    CONFUSABLE_WORDS, {
      letterMap: [{ cyr: 'Х', lat: 'x' }, { cyr: 'Ҳ', lat: 'h' }],
      wordFilter: withAny(['x', 'h']),
      tip: "Qoida: dumsiz Х → x, dumli Ҳ → h.",
    }),
  words(M2, 'kl-qk-contrast', 'Q yoki K? Farqlash', "Қ va К aralash so'zlar: қабул → qabul, курс → kurs.",
    [...CONFUSABLE_WORDS, ...DIFFERENT_LETTER_WORDS, ...C.THEMES_VOCAB.find(t => t.id === 'talim')!.words], {
      letterMap: [{ cyr: 'Қ', lat: 'q' }, { cyr: 'К', lat: 'k' }],
      wordFilter: withAny(['q', 'k']),
    }),
  moduleTest(M2, 'm2', ['q', 'x', 'h', 'j', 'y']),
];

const module3: RawLesson[] = [
  ...letterGroup(M3, {
    key: 'sh', name: 'Ш → SH',
    letterMap: [{ cyr: 'Ш', lat: 'sh' }],
    tokens: ['sh'],
    tip: "Bitta kirill harfi — ikkita lotin harfi: s + h. Ikkalasini bitta harakatdek, uzilishsiz yozing.",
    words: DIGRAPH_WORDS,
  }),
  ...letterGroup(M3, {
    key: 'ch', name: 'Ч → CH',
    letterMap: [{ cyr: 'Ч', lat: 'ch' }],
    tokens: ['ch'],
    tip: "c harfi o'zbek lotinida faqat ch ichida keladi. C tugmasi kirill klaviaturadagi С o'rnida.",
    words: DIGRAPH_WORDS,
  }),
  ...letterGroup(M3, {
    key: 'ng', name: 'НГ → NG',
    letterMap: [{ cyr: 'НГ', lat: 'ng' }],
    tokens: [],
    tip: "НГ lotinda ham ikki harf: n + g. Ming, keng, rang, tong.",
    noSyllables: true,
    filter: w => w.includes('ng'),
  }),
  moduleTest(M3, 'm3', ['sh', 'ch'], w => w.includes('ng')),
];

const module4: RawLesson[] = [
  ...letterGroup(M4, {
    key: 'oo', name: "Ў → O'",
    letterMap: [{ cyr: 'Ў', lat: "o'" }],
    tokens: ["o'"],
    tip: "Apostrof ( ' ) tugmasi L dan keyin ikkinchi — kirill klaviaturada bu Э tugmasi. O'ng jimjiloq bilan bosing.",
    words: APOSTROPHE_WORDS,
  }),
  ...letterGroup(M4, {
    key: 'gg', name: "Ғ → G'",
    letterMap: [{ cyr: 'Ғ', lat: "g'" }],
    tokens: ["g'"],
    tip: "Ғ ham xuddi Ў kabi: harf + apostrof. боғ → bog', тоғ → tog'.",
    words: APOSTROPHE_WORDS,
  }),
  ...letterGroup(M4, {
    key: 'tutuq', name: "Ъ → '",
    letterMap: [{ cyr: 'Ъ', lat: "'" }],
    tokens: ["'"],
    tip: "Tutuq belgisi Ъ lotinda faqat apostrof: маъно → ma'no, шеър → she'r, эълон → e'lon.",
    noSyllables: true,
    words: APOSTROPHE_WORDS,
  }),
  words(M4, 'kl-o-contrast', "O yoki O'? Farqlash", "О va Ў aralash: бор → bor, бўр → bo'r. Apostrofni unutmang!",
    [...APOSTROPHE_WORDS, 'bor', 'tor', 'on', 'oz', 'qol', 'oq', 'son', 'kon', 'sol', "bo'r", "to'r", "o'n", "o'z",
      "qo'l", "o'q", "so'n", "ko'n", "so'l", "o't", 'ot', "ko'r", 'kor', "so'z", 'soz'], {
      letterMap: [{ cyr: 'О', lat: 'o' }, { cyr: 'Ў', lat: "o'" }],
      wordFilter: withAny(['o', "o'"]),
    }),
  moduleTest(M4, 'm4', ["o'", "g'", "'"]),
];

const module5: RawLesson[] = [
  ...letterGroup(M5, {
    key: 'yo', name: 'Ё → YO',
    letterMap: [{ cyr: 'Ё', lat: 'yo' }],
    tokens: ['yo'],
    tip: "Ё lotinda y + o: ёз → yoz, дарё → daryo. Diqqat: йўл → yo'l (бу Й + Ў).",
    words: IOTATED_WORDS,
  }),
  ...letterGroup(M5, {
    key: 'yu', name: 'Ю → YU',
    letterMap: [{ cyr: 'Ю', lat: 'yu' }],
    tokens: ['yu'],
    tip: 'Ю lotinda y + u: юз → yuz, юрак → yurak.',
    words: IOTATED_WORDS,
  }),
  ...letterGroup(M5, {
    key: 'ya', name: 'Я → YA',
    letterMap: [{ cyr: 'Я', lat: 'ya' }],
    tokens: ['ya'],
    tip: 'Я lotinda y + a: янги → yangi, якшанба → yakshanba.',
    words: IOTATED_WORDS,
  }),
  ...letterGroup(M5, {
    key: 'ye', name: 'Е → YE',
    letterMap: [{ cyr: 'Е (boshida)', lat: 'ye' }, { cyr: 'Е (o\'rtada)', lat: 'e' }],
    tokens: ['ye'],
    tip: "Е so'z boshida va unlidan keyin ye bo'ladi: ер → yer, қаер → qayer. Boshqa joyda e: кел → kel.",
    words: IOTATED_WORDS,
  }),
  words(M5, 'kl-loan', "Ц va Ь: o'zlashma so'zlar", "Ц lotinda s yoki ts bo'ladi, Ь esa umuman yozilmaydi: цирк → sirk, пальто → palto.",
    C.LOANWORDS, {
      letterMap: [{ cyr: 'Ц', lat: 's / ts' }, { cyr: 'Ь', lat: '—' }],
      wordCount: 22,
    }),
  words(M5, 'kl-months', 'Oylar', "Yil oylari: январь → yanvar, сентябрь → sentyabr. Ь yozilmaydi!",
    [...C.MONTHS, ...C.MONTHS], { wordCount: 24, letterMap: [{ cyr: 'Ь', lat: '—' }, { cyr: 'Я', lat: 'ya' }] }),
  moduleTest(M5, 'm5', ['yo', 'yu', 'ya', 'ye']),
];

const module6: RawLesson[] = [
  words(M6, 'kl-names', 'Ismlar: bosh harf', "Ism doim bosh harf bilan yoziladi. Shift'ni qarama-qarshi qo'lning jimjilog'i bilan bosing.",
    C.NAMES, { caseSensitive: true, wordCount: 20, tip: "Ў va Ғ bosh harf bo'lsa: O' va G' (O'tkir, G'ayrat)." }),
  words(M6, 'kl-places', 'Shahar va viloyatlar', "Joy nomlari ham bosh harf bilan: Тошкент → Toshkent, Фарғона → Farg'ona.",
    C.PLACES, { caseSensitive: true, wordCount: 20 }),
  sentences(M6, 'kl-capital-sentences', "Gap boshi: bosh harf", "Har bir gap bosh harf bilan boshlanib, nuqta bilan tugaydi.",
    C.CAPITAL_SENTENCES, { caseSensitive: true }),
  sentences(M6, 'kl-commas', 'Vergul va nuqta', "Vergul ( , ) va nuqta ( . ) — M dan keyingi tugmalar, Shift'siz.",
    C.COMMA_SENTENCES, { caseSensitive: true }),
  sentences(M6, 'kl-question', "So'roq va undov", "? va ! belgilari uchun Shift'ni ushlab turing: ? — / tugmasida, ! — 1 tugmasida.",
    C.QUESTION_SENTENCES, { caseSensitive: true }),
  sentences(M6, 'kl-hyphen', 'Chiziqcha', "Juft so'zlar chiziqcha bilan: ota-ona, bir-biri, asta-sekin. Chiziqcha 0 dan keyingi tugmada.",
    C.HYPHEN_SENTENCES),
  sentences(M6, 'kl-numbers', 'Raqamli gaplar', "Raqamlar eng yuqori qatorda. Raqamdan keyin barmoqni uy qatoriga qaytaring.",
    C.NUMBER_SENTENCES),
  sentences(M6, 'kl-dates', 'Sana va vaqt', "15-may, soat 9:00 — chiziqcha va ikki nuqta ( : ) bilan. Ikki nuqta uchun Shift + ;",
    C.DATE_SENTENCES),
  sentences(M6, 'kl-contacts', "Telefon, pul va manzil", "+998 90 123 45 67, 450 000 so'm — administratorning kundalik yozuvlari. + belgisi Shift bilan.",
    C.CONTACT_SENTENCES),
  sentences(M6, 'kl-m6-test', "Bo'lim sinovi", "Lotin yozuvi yashirin — raqam va belgilar ko'rinadi, harflarni o'zingiz yozasiz.",
    [...C.CAPITAL_SENTENCES, ...C.COMMA_SENTENCES, ...C.QUESTION_SENTENCES, ...C.NUMBER_SENTENCES, ...C.DATE_SENTENCES],
    { hideLatin: true }),
];

const themeLessons = C.THEMES_VOCAB.map(theme =>
  words(M7, `kl-theme-${theme.id}`, theme.title, `Mavzu bo'yicha so'zlar: ${theme.description}.`, theme.words, { wordCount: 22 }),
);
const allThemeWords = C.THEMES_VOCAB.flatMap(t => t.words);
const firstHalfWords = C.THEMES_VOCAB.slice(0, 7).flatMap(t => t.words);
const module7: RawLesson[] = [
  ...themeLessons.slice(0, 7),
  words(M7, 'kl-m7-test1', "Oraliq sinov: mavzular", "Oldingi yetti mavzu so'zlari, lotin yozuvi yashirin.",
    firstHalfWords, { hideLatin: true, wordCount: 20 }),
  ...themeLessons.slice(7),
  words(M7, 'kl-admin-vocab', "Administrator lug'ati", "O'quv markazida eng ko'p yoziladigan so'zlar.", ADMIN_WORDS, { wordCount: 24 }),
  words(M7, 'kl-m7-test2', "Bo'lim sinovi", "Barcha mavzular aralash, lotin yozuvi yashirin.",
    [...allThemeWords, ...ADMIN_WORDS], { hideLatin: true, wordCount: 22 }),
];

const module8: RawLesson[] = [
  sentences(M8, 'kl-greetings', 'Salomlashish va odob', "Assalomu alaykum, rahmat, kechirasiz — har kuni ishlatiladigan iboralar.", C.GREETING_SENTENCES),
  sentences(M8, 'kl-daily', 'Kundalik gaplar', "Ishxonada va uyda aytiladigan oddiy gaplar.", C.DAILY_SENTENCES),
  sentences(M8, 'kl-qa', 'Savol va javob', "Savol va unga javob — birga yoziladi.", C.QA_SENTENCES),
  sentences(M8, 'kl-phone', 'Telefon suhbati', "Qo'ng'iroqqa javob berishda yoziladigan iboralar.", C.PHONE_SENTENCES),
  sentences(M8, 'kl-m8-test1', 'Oraliq sinov: gaplar', "Salomlashish, kundalik gaplar va telefon iboralari — lotin yozuvi yashirin.",
    [...C.GREETING_SENTENCES, ...C.DAILY_SENTENCES, ...C.QA_SENTENCES, ...C.PHONE_SENTENCES], { hideLatin: true }),
  sentences(M8, 'kl-parents', 'Ota-onalarga xabarlar', "Davomat, baho va majlis haqidagi xabarlar.", C.PARENT_SENTENCES),
  sentences(M8, 'kl-announce', "O'quvchilarga e'lonlar", "Dars, imtihon va qabul haqida e'lonlar.", C.ANNOUNCE_SENTENCES),
  sentences(M8, 'kl-payments', "To'lov xabarlari", "To'lov, chek, qarzdorlik va chegirma haqida.", C.PAYMENT_SENTENCES),
  sentences(M8, 'kl-official', 'Rasmiy uslub', "Ariza, buyruq va ma'lumotnoma iboralari.", C.OFFICIAL_SENTENCES),
  sentences(M8, 'kl-m8-test2', "Bo'lim sinovi: ish xabarlari", "Ota-onalar, o'quvchilar va to'lov xabarlari — lotin yozuvi yashirin.",
    [...C.PARENT_SENTENCES, ...C.ANNOUNCE_SENTENCES, ...C.PAYMENT_SENTENCES, ...C.OFFICIAL_SENTENCES], { hideLatin: true }),
];

const module9: RawLesson[] = [
  sentences(M9, 'kl-text-announcement', "Matn: e'lon", "To'liq e'lon matni — bosh harf, vergul va undov bilan.", [C.TEXT_ANNOUNCEMENT], { textLength: 1 }),
  sentences(M9, 'kl-text-application', 'Matn: ariza', 'Ariza namunasi: ism, sana va imzo bilan.', [C.TEXT_APPLICATION], { textLength: 1 }),
  sentences(M9, 'kl-text-report', 'Matn: oylik hisobot', 'Raqamlar va foizlar bilan hisobot.', [C.TEXT_REPORT], { textLength: 1 }),
  sentences(M9, 'kl-text-card', 'Matn: tabriknoma', 'Ustozga tabrik matni.', [C.TEXT_GREETING_CARD], { textLength: 1 }),
  words(M9, 'kl-speed-short', "Tezlik: qisqa so'zlar", "Ko'p ishlatiladigan qisqa so'zlar. Endi maqsad — tezlik. Ritmni saqlang.",
    C.FREQUENT_WORDS, { wordCount: 40 }),
  words(M9, 'kl-plain-words', "Kirillchasiz: so'zlar", "Kirillcha ko'rsatma olib tashlandi — odatdagi lotin matnini ko'chirib yozing.",
    [...C.FREQUENT_WORDS, ...ADMIN_WORDS], { cyrillicHint: false, wordCount: 36 }),
  sentences(M9, 'kl-plain-text', 'Kirillchasiz: matn', 'Lotin matnini kirillcha yordamisiz yozing — xuddi ishda bo\'lgani kabi.',
    [C.TEXT_WORKDAY, C.TEXT_LATIN], { cyrillicHint: false, textLength: 1 }),
  sentences(M9, 'kl-dictation-1', 'Diktant 1', "Faqat kirillcha matn ko'rinadi — butun matnni lotinda yozing.", [C.TEXT_COUNTRY], { hideLatin: true, textLength: 1 }),
  sentences(M9, 'kl-dictation-2', 'Diktant 2', "Faqat kirillcha matn ko'rinadi — butun matnni lotinda yozing.", [C.TEXT_BOOKS], { hideLatin: true, textLength: 1 }),
  sentences(M9, 'kl-final-exam', 'Yakuniy imtihon', "Kursning eng oxirgi sinovi: to'liq ish matni, lotin yozuvi yashirin. 90% bilan o'tsangiz — lotinda bemalol yozasiz!",
    [C.TEXT_ANNOUNCEMENT, C.TEXT_REPORT, C.TEXT_WORKDAY, C.TEXT_APPLICATION], { hideLatin: true, textLength: 1 }),
];

export const TRANSLIT_COURSE: RawLesson[] = [
  ...module1, ...module2, ...module3, ...module4, ...module5,
  ...module6, ...module7, ...module8, ...module9,
];
