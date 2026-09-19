// Comprehensive English-Chinese dictionary with phonics data and authentic example sentences
import type { PhonicsUnit, SyllableUnit } from '../types/phonics';

export interface DictEntry {
  pos: string;
  def: string;
  ipa?: string;
  syllables?: SyllableUnit[];
  phonicsUnits?: PhonicsUnit[];
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
}

export const COMPREHENSIVE_DICTIONARY: Record<string, DictEntry> = {
  // Words from user's tests and picture books
  judicial: {
    pos: 'adj.',
    def: '司法的；审判的；法官的',
    ipa: '/dʒuːˈdɪʃ.əl/',
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
      rootMeaning: '审判，法官',
      affix: 'ial',
      affixMeaning: '形容词后缀，关于...的',
      desc: '源自拉丁语 judicium (审判)，指与司法审判相关的'
    },
    example: {
      en: 'The judicial system ensures justice for all citizens.',
      zh: '司法体系确保所有公民享有公平正义。'
    }
  },
  crucial: {
    pos: 'adj.',
    def: '至关重要的；决定性的',
    ipa: '/ˈkruː.ʃəl/',
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
      rootMeaning: '十字路口，关键',
      affix: 'ial',
      affixMeaning: '形容词后缀',
      desc: '源自拉丁语 crux (十字架)，引申为处于关键转折点的'
    },
    example: {
      en: 'Phonics practice is crucial for early reading success.',
      zh: '自然拼读练习对早期阅读成功至关重要。'
    }
  },
  beneficial: {
    pos: 'adj.',
    def: '有益的；有利的；有好处的',
    ipa: '/ˌben.ɪˈfɪʃ.əl/',
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
      desc: 'bene (善/好) + fic (做) + ial (形容词后缀) = 带来好处的'
    },
    example: {
      en: 'Daily reading is beneficial to children’s vocabulary.',
      zh: '坚持每日阅读对提高孩子词汇量大有益处。'
    }
  },
  nail: {
    pos: 'n./v.',
    def: '指甲；钉子；固定',
    ipa: '/neɪl/',
    syllables: [{ text: 'nail', phoneticPart: 'nail', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'n', phoneme: '/n/', type: 'consonant' },
      { letters: 'ai', phoneme: '/eɪ/', type: 'digraph' },
      { letters: 'l', phoneme: '/l/', type: 'consonant' }
    ],
    example: {
      en: 'She used a nail clipper to trim her nails.',
      zh: '她用指甲剪修剪自己的指甲。'
    }
  },
  clipper: {
    pos: 'n.',
    def: '指甲刀；修剪器；快速帆船',
    ipa: '/ˈklɪp.ər/',
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
      affixMeaning: '工具/人',
      desc: '用来修剪物品的工具，即指甲剪'
    },
    example: {
      en: 'Keep the nail clipper in the bathroom cabinet.',
      zh: '把指甲剪放在浴室柜子里。'
    }
  },
  tools: {
    pos: 'n.',
    def: '工具；用具；手段',
    ipa: '/tuːlz/',
    syllables: [{ text: 'tools', phoneticPart: 'tools', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 't', phoneme: '/t/', type: 'consonant' },
      { letters: 'oo', phoneme: '/uː/', type: 'digraph' },
      { letters: 'ls', phoneme: '/lz/', type: 'blend' }
    ],
    example: {
      en: 'We have all the tools needed for this DIY project.',
      zh: '我们准备好了这个手工项目所需的所有工具。'
    }
  },
  beauty: {
    pos: 'n.',
    def: '美丽；美人；极好的人或物',
    ipa: '/ˈbjuː.ti/',
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
    }
  },
  clever: {
    pos: 'adj.',
    def: '聪明的，机灵的',
    ipa: '/ˈklev.ər/',
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
    }
  },
  polite: {
    pos: 'adj.',
    def: '有礼貌的，客气的',
    ipa: '/pəˈlaɪt/',
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
    }
  },
  careless: {
    pos: 'adj.',
    def: '粗心的，不耐烦的',
    ipa: '/ˈker.ləs/',
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
      rootMeaning: '关心，在乎',
      affix: 'less',
      affixMeaning: '无...的',
      desc: '不在乎的，即粗心大意的'
    },
    example: {
      en: 'Don’t make careless mistakes on your spelling test.',
      zh: '拼写测验时不要犯粗心的错误。'
    }
  },
  quiet: {
    pos: 'adj.',
    def: '安静的，平静的',
    ipa: '/ˈkwaɪ.ət/',
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
    }
  },
  cute: {
    pos: 'adj.',
    def: '可爱的，机灵的',
    ipa: '/kjuːt/',
    syllables: [{ text: 'cute', phoneticPart: 'cute', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'c', phoneme: '/k/', type: 'consonant' },
      { letters: 'u_e', phoneme: '/juː/', type: 'digraph' },
      { letters: 't', phoneme: '/t/', type: 'consonant' }
    ],
    example: {
      en: 'The kitten looks so cute when sleeping.',
      zh: '小猫睡觉的样子看起来太可爱了。'
    }
  },
  friendly: {
    pos: 'adj.',
    def: '友好的，亲切的',
    ipa: '/ˈfrend.li/',
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
    }
  },
  helpful: {
    pos: 'adj.',
    def: '有帮助的，乐于助人的',
    ipa: '/ˈhelp.fl/',
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
    }
  },
  sunshine: {
    pos: 'n.',
    def: '阳光，晴天',
    ipa: '/ˈsʌn.ʃaɪn/',
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
    }
  },
  happy: {
    pos: 'adj.',
    def: '快乐的，高兴的',
    ipa: '/ˈhæp.i/',
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
    }
  },
  teacher: {
    pos: 'n.',
    def: '老师，教师',
    ipa: '/ˈtiː.tʃər/',
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
    }
  },
  pencil: {
    pos: 'n.',
    def: '铅笔',
    ipa: '/ˈpen.səl/',
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
    }
  },
  raincoat: {
    pos: 'n.',
    def: '雨衣',
    ipa: '/ˈreɪn.koʊt/',
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
    }
  },
  beautiful: {
    pos: 'adj.',
    def: '美丽的，漂亮的',
    ipa: '/ˈbjuː.tɪ.fl/',
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
    }
  },
  jump: {
    pos: 'v.',
    def: '跳跃，跳起',
    ipa: '/dʒʌmp/',
    syllables: [{ text: 'jump', phoneticPart: 'jump', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'j', phoneme: '/dʒ/', type: 'consonant' },
      { letters: 'u', phoneme: '/ʌ/', type: 'vowel' },
      { letters: 'mp', phoneme: '/mp/', type: 'blend' }
    ],
    example: {
      en: 'The energetic rabbit can jump very high.',
      zh: '那只活力充沛的兔子能跳得很高。'
    }
  },
  special: {
    pos: 'adj.',
    def: '特别的；特殊的；专门的',
    ipa: '/ˈspeʃ.əl/',
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
    }
  },
  social: {
    pos: 'adj.',
    def: '社会的；社交的；群居的',
    ipa: '/ˈsoʊ.ʃəl/',
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
      en: 'Social skills are important for children to make friends.',
      zh: '社交技能对孩子结交朋友很重要。'
    }
  },
  official: {
    pos: 'adj./n.',
    def: '官方的；正式的；官员',
    ipa: '/əˈfɪʃ.əl/',
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
    }
  },
  apple: {
    pos: 'n.',
    def: '苹果',
    ipa: '/ˈæp.l/',
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
    }
  },
  banana: {
    pos: 'n.',
    def: '香蕉',
    ipa: '/bəˈnæn.ə/',
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
      en: 'Monkeys love to eat yellow bananas.',
      zh: '猴子喜欢吃黄色的香蕉。'
    }
  },
  book: {
    pos: 'n.',
    def: '书本，书籍',
    ipa: '/bʊk/',
    syllables: [{ text: 'book', phoneticPart: 'book', color: '#ff7b39' }],
    phonicsUnits: [
      { letters: 'b', phoneme: '/b/', type: 'consonant' },
      { letters: 'oo', phoneme: '/ʊ/', type: 'digraph' },
      { letters: 'k', phoneme: '/k/', type: 'consonant' }
    ],
    example: {
      en: 'I love reading picture books before going to sleep.',
      zh: '我喜欢在睡觉前阅读绘本书籍。'
    }
  }
};

/**
 * Intelligent morphological lookup for words not directly in dictionary
 */
export function lookupWord(cleanWord: string): DictEntry {
  const lower = cleanWord.toLowerCase().trim();

  // 1. Direct hit
  if (COMPREHENSIVE_DICTIONARY[lower]) {
    return COMPREHENSIVE_DICTIONARY[lower];
  }

  // 2. Common suffixes pattern check
  if (lower.endsWith('cial') || lower.endsWith('tial')) {
    const stem = lower.replace(/(cial|tial)$/, '');
    return {
      pos: 'adj.',
      def: `具有${stem}性质的；相关的`,
      ipa: `/${lower}/`,
      syllables: [
        { text: stem, phoneticPart: stem, color: '#ff7b39' },
        { text: lower.slice(stem.length), phoneticPart: lower.slice(stem.length), color: '#3b82f6' }
      ],
      phonicsUnits: [
        { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
        { letters: lower.slice(stem.length), phoneme: '/ʃəl/', type: 'digraph' }
      ],
      root: {
        root: stem,
        rootMeaning: stem,
        affix: lower.slice(stem.length),
        affixMeaning: '形容词后缀',
        desc: `带有后缀 -${lower.slice(stem.length)} 的形容词`
      },
      example: {
        en: `The word "${cleanWord}" plays an important role in the sentence.`,
        zh: `单词 "${cleanWord}" 在这个句子中起到了重要的作用。`
      }
    };
  }

  if (lower.endsWith('tion') || lower.endsWith('sion')) {
    const stem = lower.replace(/(tion|sion)$/, '');
    return {
      pos: 'n.',
      def: `${stem}的行为或状态`,
      ipa: `/${lower}/`,
      syllables: [
        { text: stem, phoneticPart: stem, color: '#ff7b39' },
        { text: lower.slice(stem.length), phoneticPart: lower.slice(stem.length), color: '#3b82f6' }
      ],
      phonicsUnits: [
        { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
        { letters: lower.slice(stem.length), phoneme: '/ʃn/', type: 'digraph' }
      ],
      root: {
        root: stem,
        rootMeaning: stem,
        affix: lower.slice(stem.length),
        affixMeaning: '名词后缀',
        desc: `带有名词后缀 -${lower.slice(stem.length)} 的词汇`
      },
      example: {
        en: `We observed the process of ${cleanWord} carefully.`,
        zh: `我们仔细观察了关于 ${cleanWord} 的过程。`
      }
    };
  }

  if (lower.endsWith('able') || lower.endsWith('ible')) {
    const stem = lower.replace(/(able|ible)$/, '');
    return {
      pos: 'adj.',
      def: `能够${stem}的；可...的`,
      ipa: `/${lower}/`,
      syllables: [
        { text: stem, phoneticPart: stem, color: '#ff7b39' },
        { text: lower.slice(stem.length), phoneticPart: lower.slice(stem.length), color: '#3b82f6' }
      ],
      phonicsUnits: [
        { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
        { letters: lower.slice(stem.length), phoneme: '/əbl/', type: 'digraph' }
      ],
      example: {
        en: `This material is very ${cleanWord} for daily use.`,
        zh: `这种材料非常适合日常使用。`
      }
    };
  }

  // 3. Fallback entry with natural example sentence
  return {
    pos: 'n./adj.',
    def: `${cleanWord}（新词汇）`,
    example: {
      en: `Can you find and pronounce the word "${cleanWord}" in the story?`,
      zh: `你能在故事中找到并读出单词 "${cleanWord}" 吗？`
    }
  };
}
