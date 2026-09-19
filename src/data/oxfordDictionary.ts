// Oxford 3000™ & ECDICT (开源英汉双解词典) Core Lexicon
// Comprehensive phonetic, grammatical, semantic, and example sentence data
import type { PhonicsUnit, SyllableUnit } from '../types/phonics';

export interface OxfordDictEntry {
  word: string;
  pos: string; // Part of speech: n., v., adj., adv., prep., etc.
  def: string; // Chinese definition from ECDICT / Oxford
  ipa: string; // International Phonetic Alphabet
  oxfordLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  syllables: SyllableUnit[];
  phonicsUnits: PhonicsUnit[];
  root?: {
    root: string;
    rootMeaning: string;
    affix: string;
    affixMeaning: string;
    desc: string;
  };
  example: {
    en: string;
    zh: string;
  };
  source: string;
}

export const OXFORD_ECDICT_DATABASE: Record<string, OxfordDictEntry> = {
  // === 司法与学术进阶核心词 (Academic / Professional Core) ===
  judicial: {
    word: 'judicial',
    pos: 'adj.',
    def: '司法的；审判的；法官的',
    ipa: '/dʒuːˈdɪʃ.əl/',
    oxfordLevel: 'C1',
    syllables: [
      { text: 'ju', phoneticPart: 'ju', color: '#ff7b39' },
      { text: 'di', phoneticPart: 'di', color: '#3b82f6' },
      { text: 'cial', phoneticPart: 'cial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'ju', phoneme: '/dʒuː/', type: 'vowel' },
      { letters: 'di', phoneme: '/dɪ/', type: 'vowel' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    root: {
      root: 'judic',
      rootMeaning: '审判，判决',
      affix: 'ial',
      affixMeaning: '关于...的',
      desc: '源自拉丁语 judicium (审判)，指司法审判系统的'
    },
    example: {
      en: 'The judicial system ensures justice for all citizens.',
      zh: '司法体系确保所有公民享有公平正义。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  crucial: {
    word: 'crucial',
    pos: 'adj.',
    def: '至关重要的；决定性的',
    ipa: '/ˈkruː.ʃəl/',
    oxfordLevel: 'B2',
    syllables: [
      { text: 'cru', phoneticPart: 'cru', color: '#ff7b39' },
      { text: 'cial', phoneticPart: 'cial', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'cru', phoneme: '/kruː/', type: 'blend' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    root: {
      root: 'cruc',
      rootMeaning: '十字路口，关键点',
      affix: 'ial',
      affixMeaning: '形容词后缀',
      desc: '源自拉丁语 crux (十字架)，引申为处于关键转折点的'
    },
    example: {
      en: 'Phonics practice is crucial for early reading success.',
      zh: '自然拼读练习对早期阅读成功至关重要。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  beneficial: {
    word: 'beneficial',
    pos: 'adj.',
    def: '有益的；有利的；有好处的',
    ipa: '/ˌben.ɪˈfɪʃ.əl/',
    oxfordLevel: 'B2',
    syllables: [
      { text: 'bene', phoneticPart: 'bene', color: '#ff7b39' },
      { text: 'fi', phoneticPart: 'fi', color: '#3b82f6' },
      { text: 'cial', phoneticPart: 'cial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'bene', phoneme: '/benɪ/', type: 'blend' },
      { letters: 'fi', phoneme: '/fɪ/', type: 'consonant' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    root: {
      root: 'bene',
      rootMeaning: '好，善',
      affix: 'cial',
      affixMeaning: '具有...特性的',
      desc: 'bene (善) + fic (做) + ial (形容词后缀) = 带来好处的'
    },
    example: {
      en: 'Daily reading is beneficial to children’s vocabulary.',
      zh: '坚持每日阅读对提高孩子词汇量大有益处。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  financial: {
    word: 'financial',
    pos: 'adj.',
    def: '金融的；财政的；财务的',
    ipa: '/faɪˈnæn.ʃəl/',
    oxfordLevel: 'B1',
    syllables: [
      { text: 'fi', phoneticPart: 'fi', color: '#ff7b39' },
      { text: 'nan', phoneticPart: 'nan', color: '#3b82f6' },
      { text: 'cial', phoneticPart: 'cial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'fi', phoneme: '/faɪ/', type: 'vowel' },
      { letters: 'nan', phoneme: '/næn/', type: 'blend' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'She works as a financial adviser in the bank.',
      zh: '她在银行担任财务顾问。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  official: {
    word: 'official',
    pos: 'adj./n.',
    def: '官方的；正式的；官员',
    ipa: '/əˈfɪʃ.əl/',
    oxfordLevel: 'B1',
    syllables: [
      { text: 'of', phoneticPart: 'of', color: '#ff7b39' },
      { text: 'fi', phoneticPart: 'fi', color: '#3b82f6' },
      { text: 'cial', phoneticPart: 'cial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'o', phoneme: '/ə/', type: 'vowel' },
      { letters: 'ff', phoneme: '/f/', type: 'consonant' },
      { letters: 'i', phoneme: '/ɪ/', type: 'vowel' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'This is the official announcement from the school.',
      zh: '这是学校发布的官方公告。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  special: {
    word: 'special',
    pos: 'adj.',
    def: '特别的；特殊的；专门的',
    ipa: '/ˈspeʃ.əl/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'spe', phoneticPart: 'spe', color: '#ff7b39' },
      { text: 'cial', phoneticPart: 'cial', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'sp', phoneme: '/sp/', type: 'blend' },
      { letters: 'e', phoneme: '/e/', type: 'vowel' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'Today is a special day for our graduation.',
      zh: '今天是我们毕业的特别日子。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  social: {
    word: 'social',
    pos: 'adj.',
    def: '社会的；社交的；群居的',
    ipa: '/ˈsoʊ.ʃəl/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'so', phoneticPart: 'so', color: '#ff7b39' },
      { text: 'cial', phoneticPart: 'cial', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 's', phoneme: '/s/', type: 'consonant' },
      { letters: 'o', phoneme: '/oʊ/', type: 'vowel' },
      { letters: 'cial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'Social skills help children communicate with friends.',
      zh: '社交技能有助于孩子与朋友良好沟通。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  essential: {
    word: 'essential',
    pos: 'adj.',
    def: '必不可少的；基本的；精华的',
    ipa: '/ɪˈsen.ʃəl/',
    oxfordLevel: 'B1',
    syllables: [
      { text: 'es', phoneticPart: 'es', color: '#ff7b39' },
      { text: 'sen', phoneticPart: 'sen', color: '#3b82f6' },
      { text: 'tial', phoneticPart: 'tial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'es', phoneme: '/es/', type: 'blend' },
      { letters: 'sen', phoneme: '/sen/', type: 'blend' },
      { letters: 'tial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'Water is essential for all living things.',
      zh: '水是所有生命必不可少的。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  potential: {
    word: 'potential',
    pos: 'adj./n.',
    def: '潜在的；潜能；可能性',
    ipa: '/pəˈten.ʃəl/',
    oxfordLevel: 'B2',
    syllables: [
      { text: 'po', phoneticPart: 'po', color: '#ff7b39' },
      { text: 'ten', phoneticPart: 'ten', color: '#3b82f6' },
      { text: 'tial', phoneticPart: 'tial', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'po', phoneme: '/pə/', type: 'vowel' },
      { letters: 'ten', phoneme: '/ten/', type: 'blend' },
      { letters: 'tial', phoneme: '/ʃəl/', type: 'digraph' }
    ],
    example: {
      en: 'Every student has great potential to succeed.',
      zh: '每个学生都有获得成功的巨大潜力。'
    },
    source: 'Oxford 3000 / ECDICT'
  },

  // === 绘本扫描与日常实用词 (Picture Books & Daily Objects) ===
  nail: {
    word: 'nail',
    pos: 'n./v.',
    def: '指甲；钉子；固定',
    ipa: '/neɪl/',
    oxfordLevel: 'A2',
    syllables: [{ text: 'nail', phoneticPart: 'nail', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'ai', phoneme: '/eɪ/', type: 'digraph' },
      { letters: 'l', phoneme: '/l/', type: 'consonant' }
    ],
    example: {
      en: 'She used a nail clipper to trim her nails.',
      zh: '她用指甲剪修剪自己的指甲。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  clipper: {
    word: 'clipper',
    pos: 'n.',
    def: '指甲刀；修剪器；剪刀',
    ipa: '/ˈklɪp.ər/',
    oxfordLevel: 'B1',
    syllables: [
      { text: 'clip', phoneticPart: 'clip', color: '#ff7b39' },
      { text: 'per', phoneticPart: 'per', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'cl', phoneme: '/kl/', type: 'blend' },
      { letters: 'i', phoneme: '/ɪ/', type: 'vowel' },
      { letters: 'pp', phoneme: '/p/', type: 'consonant' },
      { letters: 'er', phoneme: '/ər/', type: 'r-controlled' }
    ],
    root: {
      root: 'clip',
      rootMeaning: '剪短，夹住',
      affix: 'er',
      affixMeaning: '工具',
      desc: '用来修剪的工具，如指甲钳'
    },
    example: {
      en: 'Keep the nail clipper in the bathroom cabinet.',
      zh: '把指甲剪放在浴室柜子里。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  tools: {
    word: 'tools',
    pos: 'n.',
    def: '工具；器具；用具',
    ipa: '/tuːlz/',
    oxfordLevel: 'A2',
    syllables: [{ text: 'tools', phoneticPart: 'tools', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 't', phoneme: '/t/', type: 'consonant' },
      { letters: 'oo', phoneme: '/uː/', type: 'digraph' },
      { letters: 'ls', phoneme: '/lz/', type: 'blend' }
    ],
    example: {
      en: 'We have all the tools needed for this DIY project.',
      zh: '我们准备好了这个手工项目所需的所有工具。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  beauty: {
    word: 'beauty',
    pos: 'n.',
    def: '美丽；美人；极好的人或物',
    ipa: '/ˈbjuː.ti/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'beau', phoneticPart: 'beau', color: '#ff7b39' },
      { text: 'ty', phoneticPart: 'ty', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'b', phoneme: '/b/', type: 'consonant' },
      { letters: 'eau', phoneme: '/juː/', type: 'digraph' },
      { letters: 't', phoneme: '/t/', type: 'consonant' },
      { letters: 'y', phoneme: '/i/', type: 'vowel' }
    ],
    example: {
      en: 'The natural beauty of the mountains amazed us.',
      zh: '群山的自然之美让我们赞叹不已。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  cook: {
    word: 'cook',
    pos: 'v./n.',
    def: '做饭，烹饪；厨师',
    ipa: '/kʊk/',
    oxfordLevel: 'A1',
    syllables: [{ text: 'cook', phoneticPart: 'cook', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'c', phoneme: '/k/', type: 'consonant' },
      { letters: 'oo', phoneme: '/ʊ/', type: 'digraph' },
      { letters: 'k', phoneme: '/k/', type: 'consonant' }
    ],
    example: {
      en: 'My mother loves to cook delicious meals for us.',
      zh: '我妈妈喜欢为我们做可口的饭菜。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  book: {
    word: 'book',
    pos: 'n./v.',
    def: '书本，书籍；预订',
    ipa: '/bʊk/',
    oxfordLevel: 'A1',
    syllables: [{ text: 'book', phoneticPart: 'book', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'b', phoneme: '/b/', type: 'consonant' },
      { letters: 'oo', phoneme: '/ʊ/', type: 'digraph' },
      { letters: 'k', phoneme: '/k/', type: 'consonant' }
    ],
    example: {
      en: 'I love reading picture books before going to sleep.',
      zh: '我喜欢在睡觉前阅读绘本书籍。'
    },
    source: 'Oxford 3000 / ECDICT'
  },

  // === 自然拼读核心高频词 (Oxford 3000 Phonics Core) ===
  clever: {
    word: 'clever',
    pos: 'adj.',
    def: '聪明的；机灵的；精巧的',
    ipa: '/ˈklev.ər/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'cle', phoneticPart: 'cle', color: '#ff7b39' },
      { text: 'ver', phoneticPart: 'ver', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'cl', phoneme: '/kl/', type: 'blend' },
      { letters: 'e', phoneme: '/e/', type: 'vowel' },
      { letters: 'v', phoneme: '/v/', type: 'consonant' },
      { letters: 'er', phoneme: '/ər/', type: 'r-controlled' }
    ],
    example: {
      en: 'The clever fox easily solved the puzzle.',
      zh: '聪明的狐狸轻松解开了谜题。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  polite: {
    word: 'polite',
    pos: 'adj.',
    def: '有礼貌的；客气的；文雅的',
    ipa: '/pəˈlaɪt/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'po', phoneticPart: 'po', color: '#ff7b39' },
      { text: 'lite', phoneticPart: 'lite', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'p', phoneme: '/p/', type: 'consonant' },
      { letters: 'o', phoneme: '/ə/', type: 'vowel' },
      { letters: 'l', phoneme: '/l/', type: 'consonant' },
      { letters: 'ite', phoneme: '/aɪt/', type: 'digraph' }
    ],
    example: {
      en: 'Always remember to be polite and say thank you.',
      zh: '时刻记得要有礼貌并说谢谢。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  careless: {
    word: 'careless',
    pos: 'adj.',
    def: '粗心的；不耐烦的；漫不经心的',
    ipa: '/ˈker.ləs/',
    oxfordLevel: 'B1',
    syllables: [
      { text: 'care', phoneticPart: 'care', color: '#ff7b39' },
      { text: 'less', phoneticPart: 'less', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'c', phoneme: '/k/', type: 'consonant' },
      { letters: 'are', phoneme: '/er/', type: 'r-controlled' },
      { letters: 'l', phoneme: '/l/', type: 'consonant' },
      { letters: 'e', phoneme: '/ə/', type: 'vowel' },
      { letters: 'ss', phoneme: '/s/', type: 'consonant' }
    ],
    root: {
      root: 'care',
      rootMeaning: '关心，小心',
      affix: 'less',
      affixMeaning: '无...的',
      desc: '不小心的，即粗心大意的'
    },
    example: {
      en: 'Don’t make careless mistakes on your spelling test.',
      zh: '拼写测验时不要犯粗心的错误。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  quiet: {
    word: 'quiet',
    pos: 'adj.',
    def: '安静的；平静的；轻声的',
    ipa: '/ˈkwaɪ.ət/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'qui', phoneticPart: 'qui', color: '#ff7b39' },
      { text: 'et', phoneticPart: 'et', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'qu', phoneme: '/kw/', type: 'blend' },
      { letters: 'i', phoneme: '/aɪ/', type: 'vowel' },
      { letters: 'et', phoneme: '/ət/', type: 'vowel' }
    ],
    example: {
      en: 'Please keep quiet while reading in the library.',
      zh: '在图书馆阅读时请保持安静。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  cute: {
    word: 'cute',
    pos: 'adj.',
    def: '可爱的；机灵的；小巧的',
    ipa: '/kjuːt/',
    oxfordLevel: 'A2',
    syllables: [{ text: 'cute', phoneticPart: 'cute', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'c', phoneme: '/k/', type: 'consonant' },
      { letters: 'u_e', phoneme: '/juː/', type: 'digraph' },
      { letters: 't', phoneme: '/t/', type: 'consonant' }
    ],
    example: {
      en: 'The kitten looks so cute when sleeping.',
      zh: '小猫睡觉的样子看起来太可爱了。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  friendly: {
    word: 'friendly',
    pos: 'adj.',
    def: '友好的；亲切的；和睦的',
    ipa: '/ˈfrend.li/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'friend', phoneticPart: 'friend', color: '#ff7b39' },
      { text: 'ly', phoneticPart: 'ly', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'fr', phoneme: '/fr/', type: 'blend' },
      { letters: 'ie', phoneme: '/e/', type: 'digraph' },
      { letters: 'nd', phoneme: '/nd/', type: 'blend' },
      { letters: 'ly', phoneme: '/li/', type: 'vowel' }
    ],
    example: {
      en: 'The teacher has a friendly smile for everyone.',
      zh: '老师对每个人都带着友善的微笑。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  helpful: {
    word: 'helpful',
    pos: 'adj.',
    def: '有帮助的；乐于助人的；有益的',
    ipa: '/ˈhelp.fl/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'help', phoneticPart: 'help', color: '#ff7b39' },
      { text: 'ful', phoneticPart: 'ful', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'h', phoneme: '/h/', type: 'consonant' },
      { letters: 'e', phoneme: '/e/', type: 'vowel' },
      { letters: 'lp', phoneme: '/lp/', type: 'blend' },
      { letters: 'ful', phoneme: '/fl/', type: 'digraph' }
    ],
    example: {
      en: 'The librarian was very helpful with my research.',
      zh: '图书管理员对我的资料查阅非常有帮助。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  sunshine: {
    word: 'sunshine',
    pos: 'n.',
    def: '阳光；晴朗；晴天',
    ipa: '/ˈsʌn.ʃaɪn/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'sun', phoneticPart: 'sun', color: '#ff7b39' },
      { text: 'shine', phoneticPart: 'shine', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 's', phoneme: '/s/', type: 'consonant' },
      { letters: 'u', phoneme: '/ʌ/', type: 'vowel' },
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'sh', phoneme: '/ʃ/', type: 'digraph' },
      { letters: 'i_e', phoneme: '/aɪ/', type: 'digraph' },
      { letters: 'n', phoneme: '/n/', type: 'consonant' }
    ],
    example: {
      en: 'Warm sunshine brightened up the whole room.',
      zh: '温暖的阳光照亮了整个房间。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  happy: {
    word: 'happy',
    pos: 'adj.',
    def: '快乐的；幸福的；高兴的',
    ipa: '/ˈhæp.i/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'hap', phoneticPart: 'hap', color: '#ff7b39' },
      { text: 'py', phoneticPart: 'py', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'h', phoneme: '/h/', type: 'consonant' },
      { letters: 'a', phoneme: '/æ/', type: 'vowel' },
      { letters: 'pp', phoneme: '/p/', type: 'consonant' },
      { letters: 'y', phoneme: '/i/', type: 'vowel' }
    ],
    example: {
      en: 'The children were happy to play in the park.',
      zh: '孩子们在公园里玩得很高兴。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  teacher: {
    word: 'teacher',
    pos: 'n.',
    def: '老师；教师；导师',
    ipa: '/ˈtiː.tʃər/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'teach', phoneticPart: 'teach', color: '#ff7b39' },
      { text: 'er', phoneticPart: 'er', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 't', phoneme: '/t/', type: 'consonant' },
      { letters: 'ea', phoneme: '/iː/', type: 'digraph' },
      { letters: 'ch', phoneme: '/tʃ/', type: 'digraph' },
      { letters: 'er', phoneme: '/ər/', type: 'r-controlled' }
    ],
    example: {
      en: 'Our English teacher showed us how to blend sounds.',
      zh: '我们的英语老师向我们示范了如何拼读声音。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  pencil: {
    word: 'pencil',
    pos: 'n.',
    def: '铅笔',
    ipa: '/ˈpen.səl/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'pen', phoneticPart: 'pen', color: '#ff7b39' },
      { text: 'cil', phoneticPart: 'cil', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'p', phoneme: '/p/', type: 'consonant' },
      { letters: 'e', phoneme: '/e/', type: 'vowel' },
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'c', phoneme: '/s/', type: 'consonant' },
      { letters: 'i', phoneme: '/ə/', type: 'vowel' },
      { letters: 'l', phoneme: '/l/', type: 'consonant' }
    ],
    example: {
      en: 'Write your answers neatly with a pencil.',
      zh: '用铅笔工整地写下你的答案。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  raincoat: {
    word: 'raincoat',
    pos: 'n.',
    def: '雨衣',
    ipa: '/ˈreɪn.koʊt/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'rain', phoneticPart: 'rain', color: '#ff7b39' },
      { text: 'coat', phoneticPart: 'coat', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'r', phoneme: '/r/', type: 'consonant' },
      { letters: 'ai', phoneme: '/eɪ/', type: 'digraph' },
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'c', phoneme: '/k/', type: 'consonant' },
      { letters: 'oa', phoneme: '/oʊ/', type: 'digraph' },
      { letters: 't', phoneme: '/t/', type: 'consonant' }
    ],
    example: {
      en: 'Put on your yellow raincoat before going out in the rain.',
      zh: '下雨天出门前穿上你的黄色雨衣。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  beautiful: {
    word: 'beautiful',
    pos: 'adj.',
    def: '美丽的；漂亮的；出色的',
    ipa: '/ˈbjuː.tɪ.fl/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'beau', phoneticPart: 'beau', color: '#ff7b39' },
      { text: 'ti', phoneticPart: 'ti', color: '#3b82f6' },
      { text: 'ful', phoneticPart: 'ful', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'b', phoneme: '/b/', type: 'consonant' },
      { letters: 'eau', phoneme: '/juː/', type: 'digraph' },
      { letters: 'ti', phoneme: '/tɪ/', type: 'vowel' },
      { letters: 'ful', phoneme: '/fl/', type: 'digraph' }
    ],
    example: {
      en: 'What a beautiful rainbow in the blue sky!',
      zh: '蓝天上多么美丽的一道彩虹啊！'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  jump: {
    word: 'jump',
    pos: 'v./n.',
    def: '跳跃；跳起；暴涨',
    ipa: '/dʒʌmp/',
    oxfordLevel: 'A1',
    syllables: [{ text: 'jump', phoneticPart: 'jump', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'j', phoneme: '/dʒ/', type: 'consonant' },
      { letters: 'u', phoneme: '/ʌ/', type: 'vowel' },
      { letters: 'mp', phoneme: '/mp/', type: 'blend' }
    ],
    example: {
      en: 'The energetic rabbit can jump very high.',
      zh: '那只活力充沛的兔子能跳得很高。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  apple: {
    word: 'apple',
    pos: 'n.',
    def: '苹果',
    ipa: '/ˈæp.l/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'ap', phoneticPart: 'ap', color: '#ff7b39' },
      { text: 'ple', phoneticPart: 'ple', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'a', phoneme: '/æ/', type: 'vowel' },
      { letters: 'pp', phoneme: '/p/', type: 'consonant' },
      { letters: 'le', phoneme: '/l/', type: 'consonant' }
    ],
    example: {
      en: 'An apple a day keeps the doctor away.',
      zh: '一天一苹果，医生远离我。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  banana: {
    word: 'banana',
    pos: 'n.',
    def: '香蕉',
    ipa: '/bəˈnæn.ə/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'ba', phoneticPart: 'ba', color: '#ff7b39' },
      { text: 'na', phoneticPart: 'na', color: '#3b82f6' },
      { text: 'na', phoneticPart: 'na', color: '#10b981' }
    ],
    phonicsUnits: [
      { letters: 'b', phoneme: '/b/', type: 'consonant' },
      { letters: 'a', phoneme: '/ə/', type: 'vowel' },
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'a', phoneme: '/æ/', type: 'vowel' },
      { letters: 'na', phoneme: '/nə/', type: 'blend' }
    ],
    example: {
      en: 'Monkeys love to eat sweet yellow bananas.',
      zh: '猴子喜欢吃甜甜的黄色香蕉。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  water: {
    word: 'water',
    pos: 'n./v.',
    def: '水；给...浇水',
    ipa: '/ˈwɔː.tər/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'wa', phoneticPart: 'wa', color: '#ff7b39' },
      { text: 'ter', phoneticPart: 'ter', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'w', phoneme: '/w/', type: 'consonant' },
      { letters: 'a', phoneme: '/ɔː/', type: 'vowel' },
      { letters: 't', phoneme: '/t/', type: 'consonant' },
      { letters: 'er', phoneme: '/ər/', type: 'r-controlled' }
    ],
    example: {
      en: 'Drink plenty of water every day to stay healthy.',
      zh: '每天多喝水以保持身体健康。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  yellow: {
    word: 'yellow',
    pos: 'adj./n.',
    def: '黄色的；黄色',
    ipa: '/ˈjel.oʊ/',
    oxfordLevel: 'A1',
    syllables: [
      { text: 'yel', phoneticPart: 'yel', color: '#ff7b39' },
      { text: 'low', phoneticPart: 'low', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'y', phoneme: '/j/', type: 'consonant' },
      { letters: 'e', phoneme: '/e/', type: 'vowel' },
      { letters: 'll', phoneme: '/l/', type: 'consonant' },
      { letters: 'ow', phoneme: '/oʊ/', type: 'digraph' }
    ],
    example: {
      en: 'The sunflowers in the garden are bright yellow.',
      zh: '花园里的向日葵是明亮的黄色。'
    },
    source: 'Oxford 3000 / ECDICT'
  },
  zebra: {
    word: 'zebra',
    pos: 'n.',
    def: '斑马',
    ipa: '/ˈziː.brə/',
    oxfordLevel: 'A2',
    syllables: [
      { text: 'ze', phoneticPart: 'ze', color: '#ff7b39' },
      { text: 'bra', phoneticPart: 'bra', color: '#3b82f6' }
    ],
    phonicsUnits: [
      { letters: 'z', phoneme: '/z/', type: 'consonant' },
      { letters: 'e', phoneme: '/iː/', type: 'vowel' },
      { letters: 'br', phoneme: '/br/', type: 'blend' },
      { letters: 'a', phoneme: '/ə/', type: 'vowel' }
    ],
    example: {
      en: 'A zebra has black and white stripes on its body.',
      zh: '斑马身上有黑白相间的条纹。'
    },
    source: 'Oxford 3000 / ECDICT'
  }
};
