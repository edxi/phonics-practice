import type { WordItem } from '../types/phonics';

export const SAMPLE_WORDS: WordItem[] = [
  {
    id: 'w-careless',
    word: 'careless',
    ipa: "/ ˈkerləs /",
    pos: "adj.",
    definition: "粗心的",
    detail: "由 care（关心）加否定后缀 -less 构成，表示不留心、粗心大意的。",
    syllables: [
      { text: "care", phoneticPart: "ker", color: "#ff7b39" },
      { text: "less", phoneticPart: "ləs", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "c", phoneme: "/k/", type: "consonant" },
      { letters: "are", phoneme: "/er/", type: "r-controlled" },
      { letters: "l", phoneme: "/l/", type: "consonant" },
      { letters: "e", phoneme: "/ə/", type: "vowel" },
      { letters: "ss", phoneme: "/s/", type: "consonant" }
    ],
    rootAffix: {
      root: "care",
      rootMeaning: "关心",
      affix: "less",
      affixMeaning: "无...的",
      combinedMeaning: "不关心，即粗心的",
      description: "不关心，即粗心的"
    },
    spokenExample: {
      en: "Don't be so careless with your school bag!",
      zh: "对你的书包别这么马虎粗心！"
    },
    isFavorite: false,
    masteryScore: 0,
    reviewCount: 3
  },
  {
    id: 'w-clever',
    word: 'clever',
    ipa: "/ ˈklevər /",
    pos: "adj.",
    definition: "聪明的，伶俐的",
    detail: "形容智商高或心灵手巧。",
    syllables: [
      { text: "cle", phoneticPart: "kle", color: "#ff7b39" },
      { text: "ver", phoneticPart: "vər", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "cl", phoneme: "/kl/", type: "blend" },
      { letters: "e", phoneme: "/e/", type: "vowel" },
      { letters: "v", phoneme: "/v/", type: "consonant" },
      { letters: "er", phoneme: "/ər/", type: "r-controlled" }
    ],
    rootAffix: {
      root: "clev",
      rootMeaning: "爪/抓住",
      affix: "er",
      affixMeaning: "表属性",
      combinedMeaning: "擅长抓住要领的，聪明的",
      description: "善于领悟，聪明伶俐"
    },
    spokenExample: {
      en: "She is a clever little girl who loves math.",
      zh: "她是一个喜欢数学的聪明小女孩。"
    },
    isFavorite: true,
    masteryScore: 2,
    reviewCount: 2
  },
  {
    id: 'w-polite',
    word: 'polite',
    ipa: "/ pəˈlaɪt /",
    pos: "adj.",
    definition: "有礼貌的，客气的",
    detail: "表现出良好礼仪与教养的。",
    syllables: [
      { text: "po", phoneticPart: "pə", color: "#ff7b39" },
      { text: "lite", phoneticPart: "laɪt", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "p", phoneme: "/p/", type: "consonant" },
      { letters: "o", phoneme: "/ə/", type: "vowel" },
      { letters: "l", phoneme: "/l/", type: "consonant" },
      { letters: "i_e", phoneme: "/aɪ/", type: "vowel" },
      { letters: "t", phoneme: "/t/", type: "consonant" }
    ],
    rootAffix: {
      root: "polit",
      rootMeaning: "打磨/优雅",
      affix: "e",
      affixMeaning: "",
      combinedMeaning: "言行经过雕琢打磨，即有礼貌的",
      description: "言行打磨精致，客气礼貌"
    },
    spokenExample: {
      en: "It is polite to say 'thank you' when helped.",
      zh: "得到帮助时说‘谢谢’是很有礼貌的。"
    },
    isFavorite: false,
    masteryScore: 1,
    reviewCount: 3
  },
  {
    id: 'w-quiet',
    word: 'quiet',
    ipa: "/ ˈkwaɪət /",
    pos: "adj.",
    definition: "安静的，轻柔的",
    detail: "没有嘈杂声音，心神宁静。",
    syllables: [
      { text: "qui", phoneticPart: "kwaɪ", color: "#ff7b39" },
      { text: "et", phoneticPart: "ət", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "qu", phoneme: "/kw/", type: "blend" },
      { letters: "i", phoneme: "/aɪ/", type: "vowel" },
      { letters: "e", phoneme: "/ə/", type: "vowel" },
      { letters: "t", phoneme: "/t/", type: "consonant" }
    ],
    rootAffix: {
      root: "quiet",
      rootMeaning: "平静/休憩",
      affix: "",
      affixMeaning: "",
      combinedMeaning: "处于平静休息状态中",
      description: "宁静不吵闹"
    },
    spokenExample: {
      en: "Please be quiet in the library.",
      zh: "请在图书馆里保持安静。"
    },
    isFavorite: false,
    masteryScore: 0,
    reviewCount: 1
  },
  {
    id: 'w-cute',
    word: 'cute',
    ipa: "/ kjuːt /",
    pos: "adj.",
    definition: "可爱的，小巧漂亮的",
    detail: "常用于形容小动物、婴儿等可爱迷人。",
    syllables: [
      { text: "cute", phoneticPart: "kjuːt", color: "#ff7b39" }
    ],
    phonicsUnits: [
      { letters: "c", phoneme: "/k/", type: "consonant" },
      { letters: "u_e", phoneme: "/juː/", type: "vowel" },
      { letters: "t", phoneme: "/t/", type: "consonant" }
    ],
    rootAffix: {
      root: "cute",
      rootMeaning: "源自acute(敏锐)",
      affix: "",
      affixMeaning: "",
      combinedMeaning: "机敏聪颖，后来衍生为讨人喜欢的‘可爱’",
      description: "小巧讨喜，生动惹人爱"
    },
    spokenExample: {
      en: "Look at that cute little bunny hopping!",
      zh: "看那只蹦蹦跳跳的小兔子多可爱！"
    },
    isFavorite: true,
    masteryScore: 3,
    reviewCount: 4
  },
  {
    id: 'w-friendly',
    word: 'friendly',
    ipa: "/ ˈfrendli /",
    pos: "adj.",
    definition: "友好的，亲切的",
    detail: "由 friend（朋友）加上形容词后缀 -ly 构成。",
    syllables: [
      { text: "friend", phoneticPart: "frend", color: "#ff7b39" },
      { text: "ly", phoneticPart: "li", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "fr", phoneme: "/fr/", type: "blend" },
      { letters: "ie", phoneme: "/e/", type: "digraph" },
      { letters: "nd", phoneme: "/nd/", type: "blend" },
      { letters: "l", phoneme: "/l/", type: "consonant" },
      { letters: "y", phoneme: "/i/", type: "vowel" }
    ],
    rootAffix: {
      root: "friend",
      rootMeaning: "朋友",
      affix: "ly",
      affixMeaning: "...的(形容词)",
      combinedMeaning: "像朋友一样的，即友好的",
      description: "充满善意，亲切随和"
    },
    spokenExample: {
      en: "Our new neighbors are very friendly.",
      zh: "我们的新邻居非常友善。"
    },
    isFavorite: false,
    masteryScore: 2,
    reviewCount: 2
  },
  {
    id: 'w-helpful',
    word: 'helpful',
    ipa: "/ ˈhelpfl /",
    pos: "adj.",
    definition: "有帮助的，乐于助人的",
    detail: "由 help（帮助）加后缀 -ful 构成。",
    syllables: [
      { text: "help", phoneticPart: "help", color: "#ff7b39" },
      { text: "ful", phoneticPart: "fl", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "h", phoneme: "/h/", type: "consonant" },
      { letters: "e", phoneme: "/e/", type: "vowel" },
      { letters: "lp", phoneme: "/lp/", type: "blend" },
      { letters: "f", phoneme: "/f/", type: "consonant" },
      { letters: "ul", phoneme: "/l/", type: "vowel" }
    ],
    rootAffix: {
      root: "help",
      rootMeaning: "帮助",
      affix: "ful",
      affixMeaning: "充满...的",
      combinedMeaning: "充满帮助的，有用的",
      description: "热心助人，十分有用"
    },
    spokenExample: {
      en: "He is always helpful around the classroom.",
      zh: "他在教室里总是乐于助人。"
    },
    isFavorite: false,
    masteryScore: 0,
    reviewCount: 1
  },
  {
    id: 'w-sunshine',
    word: 'sunshine',
    ipa: "/ ˈsʌnʃaɪn /",
    pos: "n.",
    definition: "阳光，日照",
    detail: "复合词：sun（太阳） + shine（照耀）。",
    syllables: [
      { text: "sun", phoneticPart: "sʌn", color: "#ff7b39" },
      { text: "shine", phoneticPart: "ʃaɪn", color: "#475569" }
    ],
    phonicsUnits: [
      { letters: "s", phoneme: "/s/", type: "consonant" },
      { letters: "u", phoneme: "/ʌ/", type: "vowel" },
      { letters: "n", phoneme: "/n/", type: "consonant" },
      { letters: "sh", phoneme: "/ʃ/", type: "digraph" },
      { letters: "i_e", phoneme: "/aɪ/", type: "vowel" },
      { letters: "n", phoneme: "/n/", type: "consonant" }
    ],
    rootAffix: {
      root: "sun",
      rootMeaning: "太阳",
      affix: "shine",
      affixMeaning: "照耀",
      combinedMeaning: "太阳照耀的光芒，即阳光",
      description: "阳光普照，明媚开朗"
    },
    spokenExample: {
      en: "Enjoy the morning sunshine in the garden!",
      zh: "在花园里享受早晨温暖的阳光吧！"
    },
    isFavorite: true,
    masteryScore: 1,
    reviewCount: 2
  }
];

export const INITIAL_PRACTICE_SETS = [
  {
    id: 'set-reading-personality',
    title: '性格与品质词汇 (Personality Traits)',
    description: '从绘本《The Little Fox》拍照扫描提取的品质形容词',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    words: SAMPLE_WORDS.slice(0, 7),
    completedCount: 3
  },
  {
    id: 'set-nature-story',
    title: '大自然与天气 (Nature & Sunshine)',
    description: '精选自然拼读双音节与复合词练习',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000,
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    words: [SAMPLE_WORDS[0], SAMPLE_WORDS[4], SAMPLE_WORDS[7]],
    completedCount: 1
  }
];
