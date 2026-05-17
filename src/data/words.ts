import type { Difficulty } from '../types';

export type Language = 'uz' | 'en' | 'ru';

export const WORDS: Record<Language, Record<Difficulty, string[]>> = {
  uz: {
    easy: [
      "ona", "ilm", "baxt", "gul", "non", "suv", "aka", "uka", "opa", "ota",
      "bola", "yo'l", "uy", "ish", "oq", "ko'k", "tez", "past", "ko'z", "qo'l",
      "bosh", "tish", "til", "soch", "fan", "bog'", "yer", "oy", "kun", "tun",
      "qor", "muz", "tog'", "ko'l", "choy", "sut", "tuz", "asal", "osh",
      "meva", "anor", "olma", "behi", "uzum", "xat", "qalam", "daftar",
      "kitob", "stol", "stul", "deraza", "eshik", "devor", "tom", "pol", "shahar",
      "boy", "kam", "ko'p", "keng", "tor", "sog'", "yov", "yot", "yosh", "qari",
      "yuz", "lab", "oyoq", "bel", "yur", "tur", "kel", "ket", "ayt", "yoz",
      "o'qi", "ishla", "uxla", "ovqat", "sariyog'", "qaymoq", "shakar", "shat"
    ],
    medium: [
      "vatan", "maktab", "kitob", "ustoz", "quyosh", "osmon", "yulduz", "daryo",
      "daraxt", "shahar", "o'qish", "yozish", "ko'rish", "yaxshi", "yomon", "katta",
      "kichik", "issiq", "sovuq", "shirin", "qizil", "sariq", "pushti", "bugun",
      "hozir", "sekin", "yurak", "oyoq", "quloq", "burun", "davlat", "bayroq",
      "qonun", "huquq", "vazifa", "aloqa", "san'at", "sport", "qalam", "daftar",
      "xona", "bog'cha", "o'rmon", "bulut", "yomg'ir", "shamol", "tuman", "bahor",
      "yozgi", "kuzgi", "qishki", "do'stlik", "hurmat", "tinchlik", "baxtli",
      "bilim", "mehnat", "rahmat", "kechirim", "sog'liq", "boylik", "donolik", "ozodlik",
      "ertaga", "kecha", "ovqat", "meva", "sabzavot", "bozor", "do'kon", "mashina",
      "qiziqarli", "chiroyli", "aqlli", "kuchli", "toza", "ozoda", "og'ir", "yengil"
    ],
    hard: [
      "mustaqillik", "erkinlik", "adolat", "kompyuter", "telefon", "internet",
      "dastur", "axborot", "texnika", "tinchlik", "qishloq", "gapirish",
      "eshitish", "yugurish", "sakrash", "o'ynash", "kulish", "achchiq",
      "jigarrang", "binafsha", "kulrang", "universitet", "shifoxona", "kutubxona",
      "tadbirkor", "o'qituvchi", "shifokor", "muhandis", "iqtisodiyot", "siyosat",
      "ma'naviyat", "ma'rifat", "taraqqiyot", "investitsiya", "texnologiya", "shartnoma",
      "mas'uliyat", "muvaffaqiyat", "imkoniyat", "tushuncha", "qarash", "munosabat",
      "jamiyat", "madaniyat", "an'ana", "qadriyat", "iste'dod", "qobiliyat",
      "tadqiqot", "tajriba", "xavfsizlik", "intizom", "natija", "samara",
      "istiqlol", "barqarorlik", "hamkorlik", "rejalashtirish", "boshqaruv", "loyiha",
      "mukammal", "shaffof", "zamonaviy", "iqtidor", "mahorat", "xizmat",
      "xalqaro", "mahalliy", "iqlim", "ekologiya"
    ],
  },
  en: {
    easy: [
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
      "was", "one", "our", "out", "day", "had", "has", "his", "how", "its",
      "may", "new", "now", "old", "see", "way", "who", "did", "get", "let",
      "say", "she", "too", "use", "big", "come", "give", "good", "have", "help",
      "home", "just", "know", "like", "long", "look", "make", "many", "most",
      "name", "only", "over", "such", "take", "than", "them", "then", "time",
      "very", "when", "will", "with", "work", "year", "back", "been", "call",
      "each", "from", "hand", "high", "keep", "last", "life", "live", "made"
    ],
    medium: [
      "about", "after", "again", "begin", "being", "below", "cause", "change",
      "child", "close", "could", "cover", "earth", "every", "found", "great",
      "group", "house", "large", "learn", "light", "might", "never", "night",
      "often", "other", "place", "plant", "point", "right", "river", "round",
      "small", "sound", "spell", "start", "still", "story", "study", "their",
      "there", "these", "thing", "think", "three", "under", "water", "where",
      "which", "while", "world", "would", "write", "young", "above", "along",
      "build", "carry", "clean", "cross", "drive", "early", "equal", "final"
    ],
    hard: [
      "absolute", "abstract", "academic", "accurate", "achieved", "acquired",
      "actually", "addition", "adequate", "advanced", "affected", "afforded",
      "although", "analysis", "announce", "anything", "apparent", "approach",
      "approval", "argument", "assembly", "assuming", "attached", "backbone",
      "backward", "balanced", "baseball", "becoming", "behavior", "believed",
      "benefits", "boundary", "breaking", "bringing", "brothers", "building",
      "business", "calendar", "campaign", "capacity", "captured", "category",
      "centered", "chairman", "champion", "changing", "chapters", "children",
      "choosing", "civilian", "clearing", "climbing", "clinical", "clothing"
    ],
  },
  ru: {
    easy: [
      "дом", "мир", "год", "день", "раз", "два", "три", "вот", "она", "они",
      "все", "тут", "там", "кто", "что", "как", "где", "или", "уже", "ещё",
      "мой", "наш", "его", "нет", "без", "под", "над", "для", "при", "сам",
      "тут", "час", "лес", "сон", "рот", "нос", "глаз", "рука", "нога", "ухо",
      "мама", "папа", "кот", "пёс", "сад", "дуб", "луг", "лук", "мёд", "рис",
      "мяч", "лёд", "жар", "вид", "зов", "сок", "мел", "ель", "щит", "плащ"
    ],
    medium: [
      "время", "после", "когда", "чтобы", "слово", "через", "можно", "нужно",
      "тоже", "перед", "между", "каждый", "другой", "новый", "самый", "давно",
      "почти", "часто", "место", "жизнь", "город", "земля", "книга", "школа",
      "право", "мысль", "народ", "число", "конец", "точка", "война", "деньги",
      "дорога", "работа", "страна", "группа", "начало", "ответ", "помощь", "голова",
      "минута", "ночь", "утро", "вечер", "осень", "весна", "погода", "солнце"
    ],
    hard: [
      "абсолютный", "авторитет", "администрация", "безопасность", "благодарить",
      "возможность", "государство", "действительно", "естественный", "здравствуйте",
      "использовать", "конституция", "необходимость", "образование", "определённый",
      "правительство", "преимущество", "происхождение", "распространение",
      "сотрудничество", "строительство", "существование", "технологический",
      "удовольствие", "характеристика", "цивилизация", "экономический"
    ],
  },
};

export const SENTENCES: Record<Language, string[]> = {
  uz: [
    "Men bugun maktabga bordim va yangi darsliklar oldim.",
    "O'zbekiston mustaqillikka erishganiga ko'p yillar bo'ldi.",
    "Kompyuter dasturlash zamonaviy kasblardan biri hisoblanadi.",
    "Kitob o'qish bilim olishning eng samarali usullaridan biridir.",
    "Bahor fasli keldi va tabiat yana jonlanmoqda.",
    "Mehnat qilgan odam albatta muvaffaqiyatga erishadi.",
    "Do'stlik eng qimmatli boyliklardan biri hisoblanadi.",
    "Har kuni yangi narsa o'rganish hayotni boyitadi.",
    "Texnologiya rivojlanishi bilan hayotimiz ancha osonlashdi.",
    "Sog'lom turmush tarzi uzoq umr ko'rish garovidir.",
  ],
  en: [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect when learning to type fast.",
    "Every great journey begins with a single step forward.",
    "Technology has changed the way we live and work today.",
    "Reading books is one of the best ways to learn new things.",
    "The sun rises in the east and sets in the west every day.",
    "Hard work and dedication always lead to success in life.",
    "Learning a new language opens doors to many opportunities.",
  ],
  ru: [
    "Каждый день приносит новые возможности для роста.",
    "Программирование является важным навыком современности.",
    "Чтение книг развивает мышление и расширяет кругозор.",
    "Технологии меняют мир каждый день всё быстрее.",
    "Образование является ключом к успешному будущему.",
    "Здоровый образ жизни помогает прожить долгую жизнь.",
  ],
};

const latinToCyrillicMap: Record<string, string> = {
  'a': 'а', 'b': 'б', 'v': 'в', 'g': 'г', 'd': 'д', 'e': 'е', 'j': 'ж', 'z': 'з', 'i': 'и', 'y': 'й',
  'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'r': 'р', 's': 'с', 't': 'т', 'u': 'у',
  'f': 'ф', 'x': 'х', 'h': 'ҳ', 'q': 'қ',
};

export function toCyrillic(text: string): string {
  let result = text.toLowerCase();
  result = result.replace(/sh/g, 'ш').replace(/ch/g, 'ч').replace(/ts/g, 'ц')
    .replace(/yu/g, 'ю').replace(/ya/g, 'я').replace(/o'/g, 'ў').replace(/g'/g, 'ғ')
    .replace(/ng/g, 'нг');
  return result.split('').map(char => latinToCyrillicMap[char] || char).join('');
}

// Kunlik challenge uchun
export function getDailySeed(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function getDailyWords(lang: Language, diff: Difficulty): string[] {
  const seed = getDailySeed();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const words = WORDS[lang][diff];
  const shuffled = [...words];
  
  // Seeded random generator
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random(hash + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return [...shuffled, ...shuffled, ...shuffled];
}
