/**
 * Hand-picked practice material for the "Kirilldan lotinga" course — for staff
 * who type Uzbek in Cyrillic and are moving to the Latin alphabet.
 *
 * Every list is filtered again at drill time by the letters learned so far
 * (see `generateDrillText`), so a word that sneaks in a letter not yet taught is
 * simply skipped rather than shown too early.
 */

/** 1-dars: letters that read the same in both scripts — only their key moves. */
export const SAME_LETTER_WORDS = [
  'ona', 'ota', 'aka', 'uka', 'opa', 'bola', 'non', 'suv', 'gul', 'olma', 'anor', 'uzum',
  'asal', 'meva', 'kitob', 'daftar', 'dars', 'darslik', 'stol', 'stul', 'sinf', 'ism', 'ilm',
  'fan', 'til', 'tun', 'kun', 'tom', 'pol', 'devor', 'vatan', 'dala', 'nima', 'bilan', 'rang',
  'bino', 'eski', 'ekin', 'tez', 'bir', 'ikki', 'olti', 'sakkiz', 'narsa', 'rasm', 'oltin',
  'ustoz', 'imkon', 'mavzu', 'savol', 'avval', 'keling', 'ber', 'bor', 'kel', 'ket', 'tur',
  'markaz', 'kurs', 'test', 'sana', 'sinov', 'ariza', 'telefon', 'internet', 'manzil',
  'kassa', 'plastik', 'karta', 'dastur', 'mutaxassis', 'tanaffus', 'tadbir', 'reklama',
  // Few letters known yet: the first groups need every real word they can get.
  'tana', 'nota', 'ot', 'ton', 'ilon', 'oila', 'inson', 'oson', 'soat', 'salat', 'tor', 'it',
  'orol', 'rost', 'tilla', 'sirt', 'tosh', 'osti', 'ost', 'isit', 'sira', 'ari', 'nor', 'sol',
  'sanoat', 'lola', 'alla', 'ota', 'sanoq', 'tort', 'sinf', 'sitora',
  'risola', 'astar', 'tilsiz', 'sariq', 'aniq', 'nima', 'kino', 'mana',
  'dona', 'dono', 'domla', 'kam', 'kim', 'kul', 'qum', 'muz', 'uzoq', 'undan', 'unda',
  'mumkin', 'mukammal', 'muallim', 'dunyo', 'dumba', 'dukkak', 'kumush', 'bugun', 'birga',
  'bozor', 'gap', 'gulzor', 'egar', 'ega', 'ezgu', 'bekat', 'beda', 'biz', 'siz',
  'paxta', 'pul', 'pista', 'vazir', 'vaqt', 'fikr', 'foiz', 'filial', 'faol', 'favvora',
];

/** 2-dars: Қ Ҳ Х Ж Й — the letters whose Latin form is a different letter. */
export const DIFFERENT_LETTER_WORDS = [
  'qalam', 'qora', 'qiz', 'qor', 'qozon', 'qavat', 'qabul', 'raqam', 'qarz', 'qism', 'qoida',
  'xat', 'xona', 'xalq', 'xabar', 'xodim', 'xizmat', 'xursand', 'daraxt', 'baxt', 'tarix',
  'xato', 'xulosa', 'xotira', 'hafta', 'hayot', 'hamma', 'hisob', 'hurmat', 'rahmat', 'hozir',
  'mehmon', 'holat', 'harakat', 'jadval', 'javob', 'jamoa', 'joy', 'jon', 'natija', 'mijoz',
  'majlis', 'uy', 'oy', 'boy', 'ayol', 'ayt', 'qayt', 'xayr', 'hayit', 'kuy', 'tayin',
];

/** 3-dars: Ш and Ч — one Cyrillic letter, two Latin keys. */
export const DIGRAPH_WORDS = [
  'ish', 'osh', 'bosh', 'tosh', 'qish', 'shahar', 'shamol', 'shakar', 'shartnoma', 'shanba',
  'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'besh', 'choy', 'chap', 'chiroq', 'uch',
  'kuch', 'ichki', 'kechqurun', 'kecha', 'chek', 'chegirma', 'ichimlik', 'shoshilinch',
  'tashkilot', 'ishchi', 'shaxsiy', 'hisobchi', 'uchrashuv', 'chiqish', 'tushlik', 'ochiq',
  'kichik', 'mashq', 'mashina', 'chaqiruv', 'ishonch', 'kechikish', 'ishtirok', 'tashrif',
  'bosh', 'ishla', 'chiqim', 'cheksiz',
  // НГ
  'ming', 'keng', 'rang', 'tong', 'yangi', 'dengiz', 'singil', 'ingliz', 'bodring', 'mening',
  'sening', 'bizning', 'sizning', 'tinglash', 'tingla', 'rangli', 'jangal', 'yengil',
  'tengdosh', 'kengash', "ko'ngil", 'tenglama', 'sinfning', 'mingta', 'kenglik',
];

/** 4-dars: Ў Ғ Ъ — the apostrophe letters. */
export const APOSTROPHE_WORDS = [
  "o'quvchi", "o'qituvchi", "to'lov", "ro'yxat", "o'n", "o'rta", "o'qish", "bo'lim", "bo'sh",
  "ko'p", "ko'cha", "so'm", "so'z", "to'qqiz", "yo'l", "qo'l", "ko'z", "o'zbek", "bog'", "tog'",
  "sog'liq", "g'alaba", "g'isht", "og'ir", "chig'anoq", "boshlang'ich", "qog'oz", "ma'lumot",
  "ma'no", "san'at", "ta'lim", "ta'til", "e'lon", "mas'ul", "mo''jiza", "a'lo", "ta'mir",
  "va'da", "she'r", "jur'at", "o'tdi", "to'landi", "ko'rik", "bo'ldi", "o'g'il", "to'g'ri",
];

/** 5-dars: Ё Ю Я Е — one Cyrillic letter written as y + vowel. */
export const IOTATED_WORDS = [
  'yoz', 'yosh', "yomg'ir", 'yordam', 'yaxshi', 'yangi', 'yarim', 'yana', 'yakshanba',
  'yashil', 'yuz', 'yurak', 'yuqori', 'yubor', 'yulduz', 'yumshoq', 'yer', 'yetti', 'yengil',
  'yetarli', 'yechim', 'poyezd', 'qayer', 'daryo', 'dunyo', 'xayol', 'kuyov', 'viloyat',
  'familiya', 'tayyor', 'ziyorat', 'yozuv', 'yaqin', 'yakun', 'kompyuter', 'yozildi',
  'yetkazish', 'payvand', 'tayyorlov', 'qiyos', 'nusxa', 'yoqdi',
  // Ю
  'yugurish', 'yuk', 'yupqa', 'yumush', 'yurt', 'yutuq', 'yuvish', 'yuksak', 'yumaloq',
  'yuzlab', 'quyuq', 'suyuq', 'buyuk', 'yulduzcha', 'yurish', 'yutmoq',
  // Е → ye
  'yelka', 'yemish', 'yetakchi', 'yetim', 'yetmish', 'yeng', 'qayerda', 'yetib', 'yelim',
  'yetuk', 'yeyish', 'yerga', 'yetkazdi', 'yetakla', 'yer',
];

/** 7-dars: Х against Ҳ and Қ against К — the pairs that are mixed up most. */
export const CONFUSABLE_WORDS = [
  'xabar', 'hisob', 'xona', 'hafta', 'xat', 'hamma', 'xalq', 'hayot', 'xodim', 'hujjat',
  'xursand', 'hurmat', 'xizmat', 'hozir', 'xayr', 'rahmat', 'xato', 'harakat', 'xotira', 'hal',
  'xulosa', 'holat', 'mehmon', 'maxsus', 'shahar', 'tarix', 'qalam', 'kitob', 'qabul', 'kurs',
  'qarz', 'kassa', 'qism', 'kun', "qog'oz", 'kecha', 'qoida', 'kelajak', 'qaror', 'kalit',
  'qiziq', 'kabinet', 'haq', 'oxir', 'baxt', 'tuxum', 'xarita', 'hikoya', 'qahramon', 'xohish',
];

/** 8-dars: words an education-centre administrator types every day. */
export const ADMIN_WORDS = [
  "o'quvchi", "o'qituvchi", "to'lov", 'shartnoma', 'guruh', 'dars', 'jadval', 'hisobot',
  'ariza', 'qabul', 'xabar', 'telefon', 'raqam', 'manzil', 'ism', 'familiya', 'sana', 'hafta',
  'soat', 'chegirma', 'kurs', 'imtihon', 'natija', 'davomat', 'sertifikat', 'xona', 'kassa',
  'chek', 'naqd', 'plastik', 'karta', 'qarzdorlik', 'muddat', "ro'yxat", "ma'lumot", 'filial',
  'menejer', 'administrator', 'direktor', 'uchrashuv', 'maslahat', 'taklif', 'mijoz', 'xizmat',
  'narx', "so'm", 'ming', 'bepul', 'sinov', 'daraja', "boshlang'ich", "o'rta", 'yuqori',
  'ingliz', 'rus', 'matematika', 'dasturlash', 'ertaga', 'bugun', 'kecha', 'dushanba',
  'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba', 'hurmatli', 'rahmat',
  'iltimos', 'kechirasiz', 'assalomu', 'alaykum', 'xayr', 'tabriklaymiz', 'eslatma',
  'kelmadi', 'keldi', 'kechikdi', "to'landi", 'qoldi', 'yozildi', "o'tdi", 'ota', 'ona',
];

/** 10–11-dars: real messages an administrator sends to parents and students. */
export const ADMIN_SENTENCES = [
  'Hurmatli ota-ona, farzandingiz bugun darsga kelmadi.',
  "Ertaga soat to'qqizda imtihon bo'ladi.",
  "Oylik to'lovni o'z vaqtida amalga oshiring.",
  'Yangi guruhga qabul davom etmoqda.',
  "Darslar dushanba, chorshanba va juma kunlari bo'ladi.",
  'Iltimos, telefon raqamingizni qoldiring.',
  "To'lov qabul qilindi, rahmat!",
  'Kurs yakunida sertifikat beriladi.',
  "Ma'lumot uchun administratorga murojaat qiling.",
  "Dars jadvali o'zgardi, xabardor bo'ling.",
  "O'qituvchi bugun kasal, dars ertaga o'tiladi.",
  "Sizni o'quv markazimizda ko'rishdan xursandmiz.",
  "Bu oy uchun o'n foiz chegirma bor.",
  'Shartnomani imzolash uchun pasportingizni olib keling.',
  "Guruhimizda yana ikkita bo'sh joy qoldi.",
  "Farzandingiz bu hafta juda yaxshi natija ko'rsatdi.",
  "Ota-onalar majlisi shanba kuni soat o'nda bo'ladi.",
  'Qarzdorlikni hafta oxirigacha yopishingizni so\'raymiz.',
];
