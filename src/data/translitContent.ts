/**
 * Practice material for the later modules of the "Kirilldan lotinga" course:
 * themed vocabulary, everyday and workplace sentences, and whole texts.
 *
 * Everything is written in Uzbek Latin with the plain apostrophe ('), the form
 * the drills accept. The Cyrillic hints are derived from it by `latinToCyrillic`,
 * so words whose Cyrillic spelling no rule can derive (Russian loans with ь or ц)
 * are kept out unless they are listed as exceptions there.
 */

// ---------------------------------------------------------------------------
// 5-bo'lim: loanwords and months — the spellings that need the exception table.
// ---------------------------------------------------------------------------

export const LOANWORDS = [
  'kompyuter', 'palto', 'film', 'albom', 'medal', 'avtomobil', 'sirk', 'konsert', 'litsey',
  'mototsikl', 'mebel', 'model', 'spektakl', 'sement', 'stansiya', 'aksiya', 'kvitansiya',
  'pyesa', 'ofitser', 'dvigatel', 'rul', 'pedal',
];

export const MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr',
  'noyabr', 'dekabr',
];

// ---------------------------------------------------------------------------
// 6-bo'lim: capitals, punctuation, numbers.
// ---------------------------------------------------------------------------

export const NAMES = [
  'Aziz', 'Dilnoza', 'Sardor', 'Malika', 'Jasur', 'Nodira', 'Bekzod', 'Kamola', 'Shahzoda',
  "Ulug'bek", 'Mohira', 'Sevara', 'Asror', 'Feruza', 'Elyor', "Yo'ldosh", 'Zarina', 'Otabek',
  'Gulnora', 'Jahongir', 'Madina', 'Sherzod', 'Nilufar', 'Islom', 'Xurshida', 'Hasan', 'Qodir',
  'Javohir', 'Yulduz', 'Oydin', 'Rustam', 'Lola', 'Shoxrux', 'Charos', 'Umida', 'Ilhom',
];

export const PLACES = [
  'Toshkent', 'Samarqand', 'Buxoro', 'Xiva', 'Andijon', 'Namangan', "Farg'ona", "Qo'qon",
  "Marg'ilon", 'Navoiy', 'Jizzax', 'Guliston', 'Qarshi', 'Termiz', 'Nukus', 'Urganch',
  'Chirchiq', 'Angren', 'Olmaliq', 'Shahrisabz', 'Denov', 'Zarafshon', 'Bekobod',
  "Kattaqo'rg'on", 'Qashqadaryo', 'Surxondaryo', 'Sirdaryo', 'Xorazm', "Qoraqalpog'iston",
  'Chilonzor', 'Yunusobod', 'Sergeli', 'Yakkasaroy',
];

export const CAPITAL_SENTENCES = [
  'Bugun havo yaxshi.', 'Men ishga keldim.', 'Dars boshlandi.', 'Ertaga dam olamiz.',
  'Aziz Toshkentda yashaydi.', "Malika kitob o'qiyapti.", "Bizning markaz Navoiy ko'chasida.",
  "Sardor ingliz tilini o'rganadi.", 'Onam choy damladi.', 'Yangi guruh ochildi.',
  'Samarqand qadimiy shahar.', 'Hamma darsga keldi.', "Dilnoza Farg'onadan keldi.",
  "Otabek Buxoroda o'qiydi.",
];

export const COMMA_SENTENCES = [
  'Kitob, daftar va ruchka olib keling.', 'Ertalab, tushda va kechqurun dars bor.',
  "Aziz, Malika va Sardor imtihondan o'tdi.", 'Iltimos, eshikni yoping.',
  'Rahmat, hammasi tushunarli.', 'Dushanba, chorshanba va juma kunlari kelamiz.',
  'Hurmatli ota-onalar, majlisga taklif qilamiz.', 'Ha, men tayyorman.',
  "Yo'q, bugun bo'sh emasman.", "Avval o'qing, keyin yozing.",
  "Ingliz tili, rus tili va matematika kurslari bor.", 'Kechirasiz, biroz kechikdim.',
];

export const QUESTION_SENTENCES = [
  'Qalaysiz?', 'Ismingiz nima?', "Soat necha bo'ldi?", 'Qachon kelasiz?',
  'Bu kitob qancha turadi?', 'Siz qaysi guruhdasiz?', 'Dars nechada boshlanadi?',
  'Telefon raqamingiz qanday?', 'Barakalla!', 'Tabriklayman!', 'Juda yaxshi!',
  "Ehtiyot bo'ling!", 'Xush kelibsiz!', 'Omad tilayman!', 'Nega kechikdingiz?',
  'Sizga qanday yordam bera olaman?', "Uy vazifasini bajardingizmi?", 'Ofarin, zo\'r natija!',
];

export const HYPHEN_SENTENCES = [
  "Ota-onalar majlisi shanba kuni bo'ladi.", 'Bola-chaqangiz omonmi?',
  "O'quvchilar bir-biriga yordam berdi.", "Qo'ni-qo'shnilar to'yga keldi.",
  "Asta-sekin o'rganib olasiz.", 'Mehr-oqibat eng katta boylik.', 'Kecha-kunduz ishladik.',
  'Ilm-fan rivojlanmoqda.', "Oziq-ovqat do'koni yaqinda.", 'Tez-tez mashq qiling.',
  "Yosh-yalang sportga qiziqadi.", "Kitob-daftarlaringizni unutmang.",
];

export const NUMBER_SENTENCES = [
  "Guruhda 12 nafar o'quvchi bor.", 'Dars 90 daqiqa davom etadi.',
  "Markazimizda 25 ta xona bor.", "Bugun 3 ta yangi o'quvchi keldi.", 'Kurs 6 oy davom etadi.',
  "Bir haftada 3 marta dars bo'ladi.", 'Imtihonda 40 ta savol bor.',
  "Men 2 ta guruhda dars beraman.", 'Kutubxonada 1500 ta kitob bor.',
  "O'quvchilarning 80 foizi imtihondan o'tdi.", "Har bir guruhda 15 ta joy bor.",
  "Bu yil 240 nafar o'quvchi o'qidi.",
];

export const DATE_SENTENCES = [
  'Dars soat 9:00 da boshlanadi.', "Imtihon 15-may kuni bo'ladi.",
  'Majlis 28-avgust soat 18:00 da.', "Yangi kurs 1-sentyabr kuni boshlanadi.",
  'Tanaffus soat 11:30 dan 12:00 gacha.', "To'lov har oyning 10-sanasigacha qilinadi.",
  "Qishki ta'til 10 kun davom etadi.", 'Bugun 2026-yil 8-noyabr.',
  "Ochiq dars 20-aprel soat 15:00 da bo'ladi.", "Bitiruv kechasi 30-iyun kuni.",
];

export const CONTACT_SENTENCES = [
  'Telefon: +998 90 123 45 67', "Oylik to'lov 450 000 so'm.",
  "Chegirma bilan 380 000 so'm bo'ladi.", "Manzil: Toshkent shahri, Navoiy ko'chasi 12-uy.",
  "Kassaga 200 000 so'm to'landi.", "Qarzdorlik 150 000 so'm qoldi.",
  "Biz bilan bog'laning: +998 71 200 30 40", 'Xona raqami: 305',
  'Filial manzili: Chilonzor tumani, 9-kvartal.', "Kurs narxi oyiga 350 000 so'm.",
];

// ---------------------------------------------------------------------------
// 7-bo'lim: themed vocabulary.
// ---------------------------------------------------------------------------

export const THEMES_VOCAB: { id: string; title: string; description: string; words: string[] }[] = [
  {
    id: 'oila', title: 'Oila va odamlar', description: "ota, ona, farzand, qarindosh, qo'shni",
    words: [
      'ota', 'ona', 'aka', 'uka', 'opa', 'singil', 'bobo', 'buvi', 'farzand', "o'g'il", 'qiz',
      'nevara', 'er', 'xotin', 'oila', 'qarindosh', 'amaki', "tog'a", 'amma', 'xola', 'jiyan',
      'kelin', 'kuyov', 'qaynona', 'qaynota', "do'st", "qo'shni", 'mehmon', 'bola', 'chaqaloq',
      'yigit', 'ayol', 'erkak', 'odam', 'inson', 'ism', 'yosh', 'familiya',
    ],
  },
  {
    id: 'uy', title: 'Uy va jihozlar', description: 'xona, eshik, stol, gilam, chiroq',
    words: [
      'uy', 'xona', 'eshik', 'deraza', 'devor', 'pol', 'tom', 'oshxona', 'yotoqxona', 'hovli',
      'darvoza', 'stol', 'stul', 'divan', 'karavot', 'shkaf', 'gilam', 'parda', 'chiroq', 'oyna',
      'kalit', 'qulf', 'televizor', 'muzlatkich', 'choynak', 'piyola', 'likopcha', 'qoshiq',
      'pichoq', 'sochiq', 'yostiq', "ko'rpa", 'ayvon', 'zina', 'qavat', 'kvartira', 'mebel',
    ],
  },
  {
    id: 'ovqat', title: 'Ovqat va ichimlik', description: "non, osh, sho'rva, choy, meva",
    words: [
      'non', 'osh', 'palov', "sho'rva", 'manti', 'somsa', "lag'mon", 'shashlik', 'kabob',
      "go'sht", 'tovuq', 'baliq', 'tuxum', 'sut', 'qatiq', 'pishloq', "sariyog'", 'guruch', 'un',
      'shakar', 'tuz', 'choy', 'qahva', 'sharbat', 'suv', 'meva', 'olma', 'uzum', 'anor', 'qovun',
      'tarvuz', 'sabzi', 'piyoz', 'kartoshka', 'pomidor', 'bodring', 'salat', 'shirinlik', 'tort',
      'nonushta', 'tushlik',
    ],
  },
  {
    id: 'vaqt', title: 'Vaqt va hafta kunlari', description: 'soat, bugun, ertaga, dushanba',
    words: [
      'vaqt', 'soat', 'daqiqa', 'soniya', 'kun', 'tun', 'hafta', 'oy', 'yil', 'bugun', 'ertaga',
      'kecha', 'indinga', 'hozir', 'keyin', 'oldin', 'ertalab', 'kechqurun', 'tushdan',
      'kunduzi', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba',
      'yakshanba', 'sana', 'muddat', 'doim', "ba'zan", 'hech', 'erta', 'kech', 'yarim',
    ],
  },
  {
    id: 'fasl', title: 'Fasllar va ob-havo', description: "bahor, qish, yomg'ir, shamol",
    words: [
      'bahor', 'yoz', 'kuz', 'qish', 'havo', 'quyosh', "yomg'ir", 'qor', 'shamol', 'bulut',
      'issiq', 'sovuq', 'iliq', 'salqin', 'harorat', 'daraja', 'momaqaldiroq', 'chaqmoq',
      'tuman', 'muz', 'osmon', 'kamalak', 'fasl', 'bulutli', 'ochiq', "do'l", 'qirov', 'jazirama',
      'sovuqqina', 'shabada',
    ],
  },
  {
    id: 'shahar', title: 'Shahar va transport', description: "ko'cha, bekat, avtobus, manzil",
    words: [
      'shahar', 'qishloq', "ko'cha", 'mahalla', 'tuman', 'viloyat', 'poytaxt', 'bino', "do'kon",
      'bozor', 'bank', 'shifoxona', 'dorixona', 'maktab', "bog'", 'maydon', "ko'prik", 'bekat',
      'vokzal', 'aeroport', 'avtobus', 'taksi', 'metro', 'mashina', 'poyezd', 'samolyot',
      'velosiped', "yo'l", 'chorraha', 'svetofor', 'manzil', 'xarita', 'piyoda', 'haydovchi',
      "yo'lovchi", 'chipta',
    ],
  },
  {
    id: 'talim', title: "Ta'lim va o'qish", description: "dars, darslik, imtihon, baho",
    words: [
      "ta'lim", 'maktab', 'sinf', 'dars', 'darslik', 'daftar', 'ruchka', 'qalam', 'kitob', 'doska',
      "o'qituvchi", "o'quvchi", 'talaba', 'ustoz', 'shogird', 'imtihon', 'test', 'baho',
      'vazifa', 'savol', 'javob', 'bilim', 'ilm', 'fan', 'til', 'matematika', 'fizika', 'kimyo',
      'tarix', 'adabiyot', 'ingliz', 'sertifikat', 'kurs', 'guruh', 'jadval', 'tanaffus',
      'kutubxona', 'universitet', 'kollej', 'davomat',
    ],
  },
  {
    id: 'ish', title: 'Ish va idora', description: 'xodim, hujjat, buyruq, hisobot, majlis',
    words: [
      'ish', 'idora', 'xodim', 'rahbar', 'direktor', 'menejer', 'administrator', 'hisobchi',
      'kotiba', 'majlis', "yig'ilish", 'hujjat', 'buyruq', 'ariza', 'shartnoma', 'hisobot', 'reja',
      'vazifa', 'topshiriq', 'imzo', 'muhr', 'kompyuter', 'printer', 'fayl', 'papka', 'xat',
      'xabar', 'telefon', "qo'ng'iroq", 'uchrashuv', 'maosh', 'mehnat', "ta'til", 'lavozim',
      "bo'lim", 'tajriba', "mas'uliyat", 'filial',
    ],
  },
  {
    id: 'pul', title: 'Pul va to\'lov', description: "so'm, narx, chek, karta, chegirma",
    words: [
      'pul', "so'm", 'dollar', 'narx', "to'lov", 'chek', 'kassa', 'karta', 'naqd', 'plastik',
      'chegirma', 'qarz', 'qarzdorlik', 'hisob', 'balans', 'xarid', 'savdo', 'sotuvchi',
      'xaridor', 'mijoz', 'arzon', 'qimmat', 'bepul', 'oylik', 'daromad', 'xarajat', 'foyda',
      'zarar', 'omonat', 'kredit', 'summa', 'tiyin', 'ming', 'million', 'kvitansiya',
    ],
  },
  {
    id: 'soglik', title: "Sog'liq va tana", description: "shifokor, dori, bosh, yurak",
    words: [
      "sog'liq", 'salomatlik', 'shifokor', 'hamshira', 'kasal', 'kasallik', 'dori', 'dorixona',
      'shifoxona', 'isitma', "yo'tal", "og'riq", 'bosh', 'tish', "ko'z", 'quloq', 'burun',
      "qo'l", 'oyoq', 'yurak', 'qon', 'bel', 'tizza', 'barmoq', 'yuz', 'soch', 'sport', 'mashq',
      'uyqu', 'vitamin', 'tekshiruv', 'davolash', "sog'lom", 'charchoq',
    ],
  },
  {
    id: 'tabiat', title: 'Tabiat va hayvonlar', description: "tog', daryo, daraxt, qush",
    words: [
      'tabiat', "tog'", 'daryo', "ko'l", 'dengiz', "cho'l", "o'rmon", 'daraxt', 'gul', "o't",
      'tosh', 'tuproq', 'yer', 'osmon', 'yulduz', 'quyosh', 'hayvon', 'qush', 'baliq', 'ot',
      'sigir', "qo'y", 'echki', 'it', 'mushuk', 'tovuq', "bo'ri", 'tulki', 'ayiq', 'quyon',
      'ilon', 'kapalak', 'ari', 'chumoli', 'bulbul', 'burgut',
    ],
  },
  {
    id: 'feyl', title: "Fe'llar: harakat so'zlari", description: "yozmoq, o'qimoq, kelmoq, to'lamoq",
    words: [
      'yozmoq', "o'qimoq", 'kelmoq', 'ketmoq', 'bormoq', 'olmoq', 'bermoq', "ko'rmoq",
      'eshitmoq', 'gapirmoq', 'aytmoq', "so'ramoq", 'ishlamoq', "o'rganmoq", "o'rgatmoq",
      'kutmoq', "to'lamoq", 'yubormoq', 'tekshirmoq', 'tuzatmoq', 'saqlamoq', 'ochmoq',
      'yopmoq', 'boshlamoq', 'tugatmoq', "o'tirmoq", 'turmoq', 'yozing', "o'qing", 'keling',
      'kuting', "to'lang", 'yuboring', 'yozdi', 'keldi', "to'ladi", "qo'ng'iroq",
    ],
  },
  {
    id: 'sifat', title: "Sifatlar: qanday?", description: 'katta, yangi, oson, muhim, toza',
    words: [
      'katta', 'kichik', 'yaxshi', 'yomon', 'chiroyli', 'yangi', 'eski', 'uzun', 'qisqa',
      'baland', 'past', 'keng', 'tor', 'issiq', 'sovuq', 'tez', 'sekin', 'oson', 'qiyin',
      "to'g'ri", "noto'g'ri", 'muhim', 'zarur', 'qulay', 'toza', 'shirin', 'achchiq', 'oq',
      'qora', 'qizil', 'yashil', "ko'k", 'sariq', 'kulrang', 'aqlli', 'mehribon', 'xushmuomala',
      'faol', 'tayyor', 'band', "bo'sh",
    ],
  },
];

/** Short, very frequent words — the "tezlik" drills, where fluency is the goal. */
export const FREQUENT_WORDS = [
  'va', 'bu', 'u', 'men', 'sen', 'biz', 'siz', 'ular', 'bilan', 'uchun', 'ham', 'lekin', 'yoki',
  'har', 'bir', 'ikki', 'uch', 'kun', 'yil', 'katta', 'kichik', 'yaxshi', 'endi', 'hozir',
  'keyin', 'oldin', 'juda', "ko'p", 'oz', 'bor', "yo'q", 'kerak', 'mumkin', 'shu', "o'sha",
  'qanday', 'nima', 'kim', 'qayer', 'qachon', 'nega', 'ha', 'mana', 'hamma', 'yana', 'faqat',
  'agar', 'chunki', 'albatta', 'ish', 'dars', 'uy', 'bugun', 'ertaga', 'kecha', 'rahmat',
];

// ---------------------------------------------------------------------------
// 8-bo'lim: sentences.
// ---------------------------------------------------------------------------

export const GREETING_SENTENCES = [
  'Assalomu alaykum!', 'Xayrli tong!', 'Xayrli kun!', 'Xayrli kech!',
  'Qalaysiz, ishlaringiz yaxshimi?', 'Rahmat, yaxshi.', 'Tanishganimdan xursandman.',
  'Xush kelibsiz!', 'Kechirasiz, bezovta qildim.', 'Marhamat, kiring.', 'Katta rahmat!',
  'Arzimaydi.', "Ko'rishguncha xayr!", "Sog' bo'ling!", "Oq yo'l!", "Iltimos, o'tiring.",
  'Sizni kutib turgandik.', 'Yana keling!',
];

export const DAILY_SENTENCES = [
  'Men har kuni ertalab ishga kelaman.', "Bugun ishimiz juda ko'p.",
  'Tushlikka birga boramizmi?', "Kompyuterni yoqib qo'ying.",
  "Hujjatlarni stol ustiga qo'ydim.", "Ertaga yig'ilish bor.", 'Choy damlab beraymi?',
  'Men hozir bandman, keyinroq gaplashamiz.', 'Eshikni yopib keting.',
  'Bugun havo juda issiq.', 'Kitobni kutubxonaga qaytardim.', 'Uyga kech qaytdim.',
  'Derazani ochib qo\'ying, xona issiq.', "Printerda qog'oz tugabdi.",
];

export const QA_SENTENCES = [
  "Siz qayerda ishlaysiz? Men o'quv markazida ishlayman.", 'Bu nima? Bu yangi darslik.',
  'Qachon kelasiz? Ertaga ertalab kelaman.', "Nechta o'quvchi bor? O'n besh nafar.",
  "Kim keldi? Yangi o'qituvchi keldi.", "Qaysi kuni bo'shsiz? Payshanba kuni bo'shman.",
  'Nega kechikdingiz? Avtobus kech qoldi.', "Qancha turadi? Uch yuz ming so'm.",
  "Dars qayerda bo'ladi? Ikkinchi qavatda.", "Kurs necha oy davom etadi? Olti oy.",
];

export const PHONE_SENTENCES = [
  'Allo, eshitaman.', "Assalomu alaykum, bu o'quv markazimi?",
  "Ha, to'g'ri. Sizga qanday yordam bera olaman?",
  "Ingliz tili kursi haqida ma'lumot olmoqchi edim.", "Darslar haftasiga uch marta bo'ladi.",
  'Ismingiz va telefon raqamingizni qoldiring.', "Sizga qayta qo'ng'iroq qilamiz.",
  'Iltimos, biroz kutib turing.', 'Administratorga ulayman.', "Qo'ng'iroq uchun rahmat!",
  "Kechirasiz, u hozir darsda. Keyinroq qo'ng'iroq qiling.",
];

export const PARENT_SENTENCES = [
  'Hurmatli ota-ona, farzandingiz bugun darsga kelmadi.',
  'Farzandingiz uy vazifasini bajarmagan.',
  "Ertaga ota-onalar majlisi bo'ladi, albatta keling.",
  "Farzandingiz oylik testdan a'lo baho oldi.",
  "Farzandingiz bu hafta juda yaxshi natija ko'rsatdi.",
  "Dars jadvali o'zgardi, xabardor bo'ling.", "O'qituvchi bugun kasal, dars ertaga o'tiladi.",
  "Farzandingizning davomati yaxshi emas, iltimos, e'tibor bering.",
  "Sizni o'quv markazimizda ko'rishdan xursandmiz.",
  "Farzandingiz bugun darsga 20 daqiqa kechikib keldi.",
];

export const ANNOUNCE_SENTENCES = [
  "Diqqat, ertaga dars bo'lmaydi.", "Barcha o'quvchilar soat to'qqizda yig'ilsin.",
  'Kutubxonaga yangi kitoblar keldi.', "Shanba kuni ochiq dars o'tkaziladi.",
  'Imtihonga yaxshi tayyorlaning.', "Kechikkan o'quvchilar darsga kiritilmaydi.",
  "Uy vazifasini o'z vaqtida topshiring.", "Eng yaxshi o'quvchilar taqdirlanadi.",
  'Yangi guruhga qabul davom etmoqda.', 'Kurs yakunida sertifikat beriladi.',
  "Guruhimizda yana ikkita bo'sh joy qoldi.",
];

export const PAYMENT_SENTENCES = [
  "To'lov qabul qilindi, rahmat!", "Oylik to'lov muddati yaqinlashmoqda.",
  "Iltimos, qarzdorlikni hafta oxirigacha yoping.",
  "To'lovni kassada yoki karta orqali qilishingiz mumkin.", "Chekni saqlab qo'ying.",
  'Ikki farzand uchun chegirma beriladi.', "Bu oyning to'lovi hali qilinmagan.",
  "To'lov muddati har oyning o'ninchi sanasi.", "Oylik to'lovni o'z vaqtida amalga oshiring.",
  "Bu oy uchun o'n foiz chegirma bor.",
];

export const OFFICIAL_SENTENCES = [
  'Markaz direktori nomiga.', "Meni ingliz tili kursiga qabul qilishingizni so'rayman.",
  "Menga uch kunlik ta'til berishingizni so'rayman.",
  "Ma'lumotnoma talab qilingan joyga taqdim etish uchun berildi.",
  'Buyruq bilan tanishib chiqdim.', 'Hujjatlar ilova qilinadi.',
  "Hurmat bilan, markaz ma'muriyati.", "Ma'lumot uchun administratorga murojaat qiling.",
  "Shartnomani imzolash uchun pasportingizni olib keling.",
  "Yuqoridagilarni inobatga olib, quyidagilarni buyuraman.",
];

// ---------------------------------------------------------------------------
// 9-bo'lim: whole texts.
// ---------------------------------------------------------------------------

export const TEXT_ANNOUNCEMENT =
  "Hurmatli o'quvchilar va ota-onalar! Markazimizda yangi o'quv yili boshlanmoqda. Ingliz tili, rus tili, matematika va dasturlash kurslariga qabul davom etmoqda. Darslar tajribali o'qituvchilar tomonidan olib boriladi. Batafsil ma'lumot uchun administratorga murojaat qiling.";

export const TEXT_APPLICATION =
  "Markaz direktori nomiga. Ariza. Men, Karimova Dilnoza, o'g'lim Sardorni ingliz tili kursiga qabul qilishingizni so'rayman. Darslarga muntazam qatnashishiga va to'lovlarni o'z vaqtida amalga oshirishga kafolat beraman. Sana: 5-sentyabr. Imzo.";

export const TEXT_REPORT =
  "Oylik hisobot. Noyabr oyida markazimizga 48 nafar yangi o'quvchi qabul qilindi. Jami 12 ta guruhda darslar o'tkazildi. O'quvchilarning davomati 94 foizni tashkil etdi. Oylik test natijalariga ko'ra, 30 nafar o'quvchi a'lo baho oldi. Qarzdorlik 15 foizga kamaydi.";

export const TEXT_GREETING_CARD =
  "Hurmatli ustoz! Sizni kasb bayramingiz bilan chin qalbimizdan tabriklaymiz. Bergan bilimlaringiz va mehringiz uchun katta rahmat. Sizga mustahkam sog'lik, oilaviy baxt va ishlaringizda muvaffaqiyatlar tilaymiz!";

export const TEXT_WORKDAY =
  "Har kuni ertalab soat sakkizda ishga kelaman. Avval kompyuterni yoqaman va kelgan xabarlarni o'qiyman. Keyin o'quvchilarning davomatini tekshiraman. Tushdan keyin ota-onalar bilan telefon orqali gaplashaman. Kun oxirida qisqa hisobot yozaman.";

export const TEXT_COUNTRY =
  "O'zbekiston go'zal va qadimiy yurt. Bu yerda Samarqand, Buxoro va Xiva kabi mashhur shaharlar bor. Har yili ko'plab sayyohlar bu shaharlarni ko'rish uchun keladi. Xalqimiz mehmondo'st va mehnatkash.";

export const TEXT_BOOKS =
  "Kitob o'qish insonni dono qiladi. Har kuni oz bo'lsa ham kitob o'qishga vaqt ajrating. Yaxshi kitob eng yaqin do'st. U sizga yangi bilim beradi va dunyoqarashingizni kengaytiradi.";

export const TEXT_LATIN =
  "Lotin alifbosida yozishni o'rganish qiyin emas. Asosiysi, har kuni ozgina mashq qilish kerak. Avval sekin, lekin xatosiz yozing. Tezlik vaqt o'tishi bilan o'zi keladi. Bir oydan keyin lotinda bemalol yoza olasiz!";

export const ALL_TEXTS = [
  TEXT_ANNOUNCEMENT, TEXT_APPLICATION, TEXT_REPORT, TEXT_GREETING_CARD, TEXT_WORKDAY,
  TEXT_COUNTRY, TEXT_BOOKS, TEXT_LATIN,
];
