import type { WordItem, PhonicsUnit, SyllableUnit } from '../types/phonics';
import { SAMPLE_WORDS } from './sampleWords';
import { dictionaryService } from '../services/dictionaryService';

// Common phonics grapheme map
const PHONICS_PATTERNS: { pattern: RegExp; phoneme: string; type: PhonicsUnit['type'] }[] = [
  // Special multi-letter phonograms & endings (crucial for words like judicial, crucial, beneficial)
  { pattern: /^cial$/i, phoneme: '/ʃəl/', type: 'digraph' },
  { pattern: /^tial$/i, phoneme: '/ʃəl/', type: 'digraph' },
  { pattern: /^cian$/i, phoneme: '/ʃən/', type: 'digraph' },
  { pattern: /^cious$/i, phoneme: '/ʃəs/', type: 'digraph' },
  { pattern: /^tious$/i, phoneme: '/ʃəs/', type: 'digraph' },
  { pattern: /^ture$/i, phoneme: '/tʃər/', type: 'digraph' },
  { pattern: /^sure$/i, phoneme: '/ʒər/', type: 'digraph' },
  { pattern: /^tion$/i, phoneme: '/ʃn/', type: 'digraph' },
  { pattern: /^sion$/i, phoneme: '/ʒn/', type: 'digraph' },
  { pattern: /^less$/i, phoneme: '/ləs/', type: 'digraph' },
  { pattern: /^ful$/i, phoneme: '/fl/', type: 'digraph' },
  { pattern: /^ly$/i, phoneme: '/li/', type: 'vowel' },
  { pattern: /^ment$/i, phoneme: '/mənt/', type: 'digraph' },
  { pattern: /^ness$/i, phoneme: '/nəs/', type: 'digraph' },

  // Special digraphs & soft consonants
  { pattern: /^dge$/i, phoneme: '/dʒ/', type: 'digraph' },
  { pattern: /^tch$/i, phoneme: '/tʃ/', type: 'digraph' },
  { pattern: /^igh$/i, phoneme: '/aɪ/', type: 'digraph' },
  { pattern: /^eigh$/i, phoneme: '/eɪ/', type: 'digraph' },
  { pattern: /^eau$/i, phoneme: '/juː/', type: 'digraph' },
  { pattern: /^ce$/i, phoneme: '/s/', type: 'consonant' },
  { pattern: /^ge$/i, phoneme: '/dʒ/', type: 'consonant' },

  // R-controlled vowels
  { pattern: /^are$/i, phoneme: '/er/', type: 'r-controlled' },
  { pattern: /^air$/i, phoneme: '/er/', type: 'r-controlled' },
  { pattern: /^ar$/i, phoneme: '/ɑːr/', type: 'r-controlled' },
  { pattern: /^er$/i, phoneme: '/ər/', type: 'r-controlled' },
  { pattern: /^ir$/i, phoneme: '/ɜːr/', type: 'r-controlled' },
  { pattern: /^ur$/i, phoneme: '/ɜːr/', type: 'r-controlled' },
  { pattern: /^or$/i, phoneme: '/ɔːr/', type: 'r-controlled' },
  { pattern: /^ore$/i, phoneme: '/ɔːr/', type: 'r-controlled' },

  // Vowel Digraphs / Teams
  { pattern: /^ai$/i, phoneme: '/eɪ/', type: 'digraph' },
  { pattern: /^ay$/i, phoneme: '/eɪ/', type: 'digraph' },
  { pattern: /^ee$/i, phoneme: '/iː/', type: 'digraph' },
  { pattern: /^ea$/i, phoneme: '/iː/', type: 'digraph' },
  { pattern: /^ie$/i, phoneme: '/e/', type: 'digraph' },
  { pattern: /^oa$/i, phoneme: '/oʊ/', type: 'digraph' },
  { pattern: /^ow$/i, phoneme: '/oʊ/', type: 'digraph' },
  { pattern: /^ou$/i, phoneme: '/aʊ/', type: 'digraph' },
  { pattern: /^oo$/i, phoneme: '/uː/', type: 'digraph' },
  { pattern: /^oi$/i, phoneme: '/ɔɪ/', type: 'digraph' },
  { pattern: /^oy$/i, phoneme: '/ɔɪ/', type: 'digraph' },
  { pattern: /^igh$/i, phoneme: '/aɪ/', type: 'digraph' },

  // Consonant Digraphs
  { pattern: /^sh$/i, phoneme: '/ʃ/', type: 'digraph' },
  { pattern: /^ch$/i, phoneme: '/tʃ/', type: 'digraph' },
  { pattern: /^th$/i, phoneme: '/θ/', type: 'digraph' },
  { pattern: /^ph$/i, phoneme: '/f/', type: 'digraph' },
  { pattern: /^wh$/i, phoneme: '/w/', type: 'digraph' },
  { pattern: /^ck$/i, phoneme: '/k/', type: 'digraph' },
  { pattern: /^ng$/i, phoneme: '/ŋ/', type: 'digraph' },
  { pattern: /^qu$/i, phoneme: '/kw/', type: 'blend' },

  // Double Consonants
  { pattern: /^ss$/i, phoneme: '/s/', type: 'consonant' },
  { pattern: /^ll$/i, phoneme: '/l/', type: 'consonant' },
  { pattern: /^ff$/i, phoneme: '/f/', type: 'consonant' },
  { pattern: /^zz$/i, phoneme: '/z/', type: 'consonant' },
  { pattern: /^tt$/i, phoneme: '/t/', type: 'consonant' },
  { pattern: /^pp$/i, phoneme: '/p/', type: 'consonant' },

  // Consonant Blends
  { pattern: /^bl$/i, phoneme: '/bl/', type: 'blend' },
  { pattern: /^cl$/i, phoneme: '/kl/', type: 'blend' },
  { pattern: /^fl$/i, phoneme: '/fl/', type: 'blend' },
  { pattern: /^gl$/i, phoneme: '/gl/', type: 'blend' },
  { pattern: /^pl$/i, phoneme: '/pl/', type: 'blend' },
  { pattern: /^sl$/i, phoneme: '/sl/', type: 'blend' },
  { pattern: /^br$/i, phoneme: '/br/', type: 'blend' },
  { pattern: /^cr$/i, phoneme: '/kr/', type: 'blend' },
  { pattern: /^dr$/i, phoneme: '/dr/', type: 'blend' },
  { pattern: /^fr$/i, phoneme: '/fr/', type: 'blend' },
  { pattern: /^gr$/i, phoneme: '/gr/', type: 'blend' },
  { pattern: /^pr$/i, phoneme: '/pr/', type: 'blend' },
  { pattern: /^tr$/i, phoneme: '/tr/', type: 'blend' },
  { pattern: /^st$/i, phoneme: '/st/', type: 'blend' },
  { pattern: /^sp$/i, phoneme: '/sp/', type: 'blend' },
  { pattern: /^sk$/i, phoneme: '/sk/', type: 'blend' },
  { pattern: /^sw$/i, phoneme: '/sw/', type: 'blend' },
  { pattern: /^sm$/i, phoneme: '/sm/', type: 'blend' },
  { pattern: /^sn$/i, phoneme: '/sn/', type: 'blend' },
  { pattern: /^lp$/i, phoneme: '/lp/', type: 'blend' },
  { pattern: /^nd$/i, phoneme: '/nd/', type: 'blend' },
  { pattern: /^nt$/i, phoneme: '/nt/', type: 'blend' },
  { pattern: /^mp$/i, phoneme: '/mp/', type: 'blend' },

  // Single Vowels
  { pattern: /^a$/i, phoneme: '/æ/', type: 'vowel' },
  { pattern: /^e$/i, phoneme: '/e/', type: 'vowel' },
  { pattern: /^i$/i, phoneme: '/ɪ/', type: 'vowel' },
  { pattern: /^o$/i, phoneme: '/ɒ/', type: 'vowel' },
  { pattern: /^u$/i, phoneme: '/ʌ/', type: 'vowel' },
  { pattern: /^y$/i, phoneme: '/i/', type: 'vowel' },

  // Single Consonants
  { pattern: /^b$/i, phoneme: '/b/', type: 'consonant' },
  { pattern: /^c$/i, phoneme: '/k/', type: 'consonant' },
  { pattern: /^d$/i, phoneme: '/d/', type: 'consonant' },
  { pattern: /^f$/i, phoneme: '/f/', type: 'consonant' },
  { pattern: /^g$/i, phoneme: '/g/', type: 'consonant' },
  { pattern: /^h$/i, phoneme: '/h/', type: 'consonant' },
  { pattern: /^j$/i, phoneme: '/dʒ/', type: 'consonant' },
  { pattern: /^k$/i, phoneme: '/k/', type: 'consonant' },
  { pattern: /^l$/i, phoneme: '/l/', type: 'consonant' },
  { pattern: /^m$/i, phoneme: '/m/', type: 'consonant' },
  { pattern: /^n$/i, phoneme: '/n/', type: 'consonant' },
  { pattern: /^p$/i, phoneme: '/p/', type: 'consonant' },
  { pattern: /^r$/i, phoneme: '/r/', type: 'consonant' },
  { pattern: /^s$/i, phoneme: '/s/', type: 'consonant' },
  { pattern: /^t$/i, phoneme: '/t/', type: 'consonant' },
  { pattern: /^v$/i, phoneme: '/v/', type: 'consonant' },
  { pattern: /^w$/i, phoneme: '/w/', type: 'consonant' },
  { pattern: /^x$/i, phoneme: '/ks/', type: 'consonant' },
  { pattern: /^z$/i, phoneme: '/z/', type: 'consonant' }
];

/**
 * Split word into syllables heuristically
 */
export function splitSyllables(rawWord: string): SyllableUnit[] {
  const word = rawWord.toLowerCase();
  
  // 1. Check preset dictionary
  const found = SAMPLE_WORDS.find(w => w.word.toLowerCase() === word);
  if (found) {
    return found.syllables;
  }

  // 2. Check Oxford 3000 / ECDICT dictionary ONLY if multi-syllables
  const dict = dictionaryService.lookupSync(word);
  if (dict.syllables && dict.syllables.length > 1) {
    return dict.syllables;
  }

  // 3. Common affixes & word endings to split
  const suffixes = [
    'cial', 'tial', 'cian', 'cious', 'tious', 'ture', 'sure', 'tion', 'sion',
    'less', 'ful', 'ing', 'ed', 'ly', 'er', 'est', 'ness', 'ment', 'able', 'ible'
  ];
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length > suf.length + 2) {
      const stem = word.slice(0, word.length - suf.length);
      return [
        { text: stem, phoneticPart: stem, color: '#ff7b39' },
        { text: suf, phoneticPart: suf, color: '#475569' }
      ];
    }
  }

  // Rule-based vowel-consonant split
  const vowelRegex = /[aeiouy]+/g;
  const vowelMatches = [...word.matchAll(vowelRegex)];

  if (vowelMatches.length <= 1) {
    return [{ text: word, phoneticPart: word, color: '#ff7b39' }];
  }

  // Split around middle consonants
  const midIndex = Math.floor(word.length / 2);
  let cut = midIndex;

  for (let i = 1; i < word.length - 1; i++) {
    const isVowel1 = /[aeiouy]/.test(word[i - 1]);
    const isVowel2 = /[aeiouy]/.test(word[i]);
    if (!isVowel1 && !isVowel2 && Math.abs(i - midIndex) < Math.abs(cut - midIndex)) {
      cut = i;
    }
  }

  if (cut > 1 && cut < word.length - 1) {
    return [
      { text: word.slice(0, cut), phoneticPart: word.slice(0, cut), color: '#ff7b39' },
      { text: word.slice(cut), phoneticPart: word.slice(cut), color: '#475569' }
    ];
  }

  return [{ text: word, phoneticPart: word, color: '#ff7b39' }];
}

/**
 * Decompose word into phonics grapheme-phoneme units
 */
export function decomposePhonics(rawWord: string): PhonicsUnit[] {
  const word = rawWord.toLowerCase();

  // 1. Check preset dictionary first
  const found = SAMPLE_WORDS.find(w => w.word.toLowerCase() === word);
  if (found) {
    return found.phonicsUnits;
  }

  // 2. Check Oxford 3000 / ECDICT dictionary ONLY if it has multi-unit breakdown
  const dict = dictionaryService.lookupSync(word);
  if (dict.phonicsUnits && dict.phonicsUnits.length > 1) {
    return dict.phonicsUnits;
  }

  const units: PhonicsUnit[] = [];
  let remaining = word;

  while (remaining.length > 0) {
    let matched = false;

    // Try matching longest chunk first
    for (const p of PHONICS_PATTERNS) {
      // Test match from start
      const m = remaining.match(p.pattern);
      if (m && m.index === 0) {
        units.push({
          letters: m[0],
          phoneme: p.phoneme,
          type: p.type
        });
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try 3-letter, 2-letter, 1-letter prefix matching in patterns
      let subMatched = false;
      for (let len = Math.min(remaining.length, 3); len >= 1; len--) {
        const sub = remaining.slice(0, len);
        const matchPattern = PHONICS_PATTERNS.find(p => p.pattern.test(sub));
        if (matchPattern) {
          units.push({
            letters: sub,
            phoneme: matchPattern.phoneme,
            type: matchPattern.type
          });
          remaining = remaining.slice(len);
          subMatched = true;
          break;
        }
      }

      if (!subMatched) {
        const char = remaining[0];
        const isVowel = /[aeiouy]/.test(char);
        units.push({
          letters: char,
          phoneme: `/${char}/`,
          type: isVowel ? 'vowel' : 'consonant'
        });
        remaining = remaining.slice(1);
      }
    }
  }

  return units;
}

/**
 * Generate full WordItem for any scanned or added word
 */
export function createWordItem(rawWord: string): WordItem {
  const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
  
  // Check preset library
  const preset = SAMPLE_WORDS.find(w => w.word.toLowerCase() === clean);
  if (preset) {
    return { ...preset, id: `w-${clean}-${Date.now()}` };
  }

  const dict = dictionaryService.lookupSync(clean);
  const syllables = (dict.syllables && dict.syllables.length > 1) ? dict.syllables : splitSyllables(clean);
  const phonicsUnits = (dict.phonicsUnits && dict.phonicsUnits.length > 1) ? dict.phonicsUnits : decomposePhonics(clean);
  
  // Clean up IPA
  let ipa = dict.ipa;
  if (!ipa || ipa === `/${clean}/`) {
    ipa = `/${phonicsUnits.map(u => u.phoneme.replace(/\//g, '')).join('·')}/`;
  } else {
    ipa = ipa.replace(/^\/\./, '/ˌ');
  }
  
  const pos = dict.pos || 'n.';
  const definition = dict.def || '新学单词';

  let rootAffix = undefined;
  if (dict.root) {
    rootAffix = {
      root: dict.root.root,
      rootMeaning: dict.root.rootMeaning,
      affix: dict.root.affix,
      affixMeaning: dict.root.affixMeaning,
      combinedMeaning: `${dict.root.rootMeaning} + ${dict.root.affixMeaning} = ${definition}`,
      description: dict.root.desc
    };
  } else if (syllables.length > 1) {
    rootAffix = {
      root: syllables[0].text,
      rootMeaning: '前部音节',
      affix: syllables[1].text,
      affixMeaning: '后部音节',
      combinedMeaning: `${clean} (${definition})`,
      description: '自然拼读音节结构记忆'
    };
  }

  const spokenExample = dict.example || {
    en: `The word "${clean}" is important in this context.`,
    zh: `单词 "${clean}" 在当前语境中非常重要。`
  };

  const item: WordItem = {
    id: `w-${clean}-${Date.now()}`,
    word: clean,
    ipa,
    pos,
    definition,
    detail: dict.root?.desc || `${dict.source || 'Oxford 3000 / ECDICT'} 核心词汇，包含 ${phonicsUnits.length} 个音形对应音素。`,
    syllables,
    phonicsUnits,
    rootAffix,
    spokenExample,
    isFavorite: false,
    masteryScore: 0,
    reviewCount: 1
  };

  return item;
}
