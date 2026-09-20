import type { WordItem, PhonicsUnit, SyllableUnit } from '../types/phonics';
import { SAMPLE_WORDS } from './sampleWords';
import { dictionaryService } from '../services/dictionaryService';

// Common phonics grapheme map
const PHONICS_PATTERNS: { pattern: RegExp; phoneme: string; type: PhonicsUnit['type'] }[] = [
  // Special multi-letter phonograms & endings
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

  // Word-final silent E consonant combinations (e.g. starve -> st-ar-ve, dance -> d-an-ce)
  { pattern: /^ve$/i, phoneme: '/v/', type: 'consonant' },
  { pattern: /^ce$/i, phoneme: '/s/', type: 'consonant' },
  { pattern: /^ge$/i, phoneme: '/dʒ/', type: 'consonant' },
  { pattern: /^se$/i, phoneme: '/s/', type: 'consonant' },
  { pattern: /^ze$/i, phoneme: '/z/', type: 'consonant' },
  { pattern: /^te$/i, phoneme: '/t/', type: 'consonant' },
  { pattern: /^le$/i, phoneme: '/l/', type: 'consonant' },

  // Special digraphs & soft consonants
  { pattern: /^dge$/i, phoneme: '/dʒ/', type: 'digraph' },
  { pattern: /^tch$/i, phoneme: '/tʃ/', type: 'digraph' },
  { pattern: /^igh$/i, phoneme: '/aɪ/', type: 'digraph' },
  { pattern: /^eigh$/i, phoneme: '/eɪ/', type: 'digraph' },
  { pattern: /^eau$/i, phoneme: '/juː/', type: 'digraph' },

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
  { pattern: /^bb$/i, phoneme: '/b/', type: 'consonant' },
  { pattern: /^dd$/i, phoneme: '/d/', type: 'consonant' },
  { pattern: /^gg$/i, phoneme: '/ɡ/', type: 'consonant' },
  { pattern: /^mm$/i, phoneme: '/m/', type: 'consonant' },
  { pattern: /^nn$/i, phoneme: '/n/', type: 'consonant' },

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
  { pattern: /^g$/i, phoneme: '/ɡ/', type: 'consonant' },
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

// Specific known word syllable dictionary
const KNOWN_SYLLABLES: Record<string, string[]> = {
  'family': ['fam', 'i', 'ly'],
  'official': ['of', 'fi', 'cial'],
  'transfer': ['trans', 'fer'],
  'manager': ['man', 'ag', 'er'],
  'serve': ['serve'],
  'starve': ['starve'],
  'ale': ['ale'],
  'careless': ['care', 'less'],
  'clever': ['clev', 'er'],
  'polite': ['po', 'lite'],
  'quiet': ['qui', 'et'],
  'cute': ['cute'],
  'friendly': ['friend', 'ly'],
  'banana': ['ba', 'nan', 'a'],
  'apple': ['ap', 'ple'],
  'little': ['lit', 'tle'],
  'water': ['wa', 'ter'],
  'happy': ['hap', 'py'],
};

/**
 * Split word into syllables heuristically following English syllabification rules
 */
export function splitSyllables(rawWord: string): SyllableUnit[] {
  const word = rawWord.toLowerCase().trim();

  // 1. Check specific known words
  if (KNOWN_SYLLABLES[word]) {
    return KNOWN_SYLLABLES[word].map((part, idx) => ({
      text: part,
      phoneticPart: part,
      color: idx % 2 === 0 ? '#ff7b39' : '#6d54f5',
    }));
  }

  // 2. Check preset sample words
  const found = SAMPLE_WORDS.find(w => w.word.toLowerCase() === word);
  if (found) {
    return found.syllables;
  }

  // 3. Check Oxford 3000 / ECDICT dictionary ONLY if multi-syllables
  const dict = dictionaryService.lookupSync(word);
  if (dict.syllables && dict.syllables.length > 1) {
    return dict.syllables;
  }

  // 4. Words ending in silent E (e.g. ale, starve, cake, time) are 1 syllable
  if (/^[bcdfghjklmnpqrstvwxyz]*[aeiou][bcdfghjklmnpqrstvwxyz]+e$/i.test(word)) {
    return [{ text: word, phoneticPart: word, color: '#ff7b39' }];
  }

  // 5. Common prefixes and suffixes to split
  const prefixes = ['trans', 'inter', 'super', 'anti', 'over', 'under', 'dis', 'pre', 'pro', 'sub', 'un', 're', 'in', 'im'];
  for (const pre of prefixes) {
    if (word.startsWith(pre) && word.length > pre.length + 2) {
      const rest = word.slice(pre.length);
      return [
        { text: pre, phoneticPart: pre, color: '#ff7b39' },
        { text: rest, phoneticPart: rest, color: '#6d54f5' },
      ];
    }
  }

  const suffixes = [
    'cial', 'tial', 'cian', 'cious', 'tious', 'ture', 'sure', 'tion', 'sion',
    'less', 'ful', 'ness', 'ment', 'able', 'ible', 'ing', 'est', 'ly'
  ];
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length > suf.length + 2) {
      const stem = word.slice(0, word.length - suf.length);
      return [
        { text: stem, phoneticPart: stem, color: '#ff7b39' },
        { text: suf, phoneticPart: suf, color: '#6d54f5' },
      ];
    }
  }

  // Double consonant split (e.g. ap-ple, hap-py, let-ter, of-fi-ce)
  const doubleConsonantMatch = word.match(/([aeiouy])([bcdfghjklmnpqrstvwxyz])\2([aeiouy])/i);
  if (doubleConsonantMatch && doubleConsonantMatch.index !== undefined) {
    const cutIdx = doubleConsonantMatch.index + 2;
    return [
      { text: word.slice(0, cutIdx), phoneticPart: word.slice(0, cutIdx), color: '#ff7b39' },
      { text: word.slice(cutIdx), phoneticPart: word.slice(cutIdx), color: '#6d54f5' },
    ];
  }

  return [{ text: word, phoneticPart: word, color: '#ff7b39' }];
}

/**
 * Decompose word into phonics grapheme-phoneme units
 */
export function decomposePhonics(rawWord: string): PhonicsUnit[] {
  const word = rawWord.toLowerCase().trim();

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

  // 3. Silent E (Magic E) Rule: CVCe pattern (e.g. ale, cake, bike, home, cute, lake, time)
  // [consonant*][vowel][consonant]e
  const magicEMatch = word.match(/^([bcdfghjklmnpqrstvwxyz]*)([aeiou])([bcdfghjklmnpqrstvwxyz])e$/i);
  if (magicEMatch) {
    const [, initialCons, vowel, midCons] = magicEMatch;
    const units: PhonicsUnit[] = [];

    // Initial consonant (if any)
    if (initialCons) {
      const matchPattern = PHONICS_PATTERNS.find(p => p.pattern.test(initialCons));
      units.push({
        letters: initialCons,
        phoneme: matchPattern ? matchPattern.phoneme : `/${initialCons}/`,
        type: 'consonant'
      });
    }

    // Long vowel sound caused by magic E
    const longVowelMap: Record<string, string> = {
      'a': '/eɪ/',
      'e': '/iː/',
      'i': '/aɪ/',
      'o': '/oʊ/',
      'u': '/juː/',
    };

    units.push({
      letters: vowel,
      phoneme: longVowelMap[vowel] || `/${vowel}/`,
      type: 'vowel'
    });

    // Middle consonant
    const consPattern = PHONICS_PATTERNS.find(p => p.pattern.test(midCons));
    units.push({
      letters: midCons,
      phoneme: consPattern ? consPattern.phoneme : `/${midCons}/`,
      type: 'consonant'
    });

    // Silent E at end
    units.push({
      letters: 'e',
      phoneme: '∅',
      type: 'silent'
    });

    return units;
  }

  const units: PhonicsUnit[] = [];
  let remaining = word;

  while (remaining.length > 0) {
    let matched = false;

    const silentEEndings = ['ve', 'ce', 'ge', 'se', 'ze', 'te', 'le'];

    // Try matching longest chunk first
    for (const p of PHONICS_PATTERNS) {
      const m = remaining.match(p.pattern);
      if (m && m.index === 0) {
        // Silent-e endings only apply at the end of the word
        if (silentEEndings.includes(m[0]) && remaining.length !== m[0].length) {
          continue;
        }
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
      let subMatched = false;
      for (let len = Math.min(remaining.length, 3); len >= 1; len--) {
        const sub = remaining.slice(0, len);
        if (silentEEndings.includes(sub) && remaining.length !== sub.length) {
          continue;
        }
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

  const preset = SAMPLE_WORDS.find(w => w.word.toLowerCase() === clean);
  if (preset) {
    return { ...preset, id: `w-${clean}-${Date.now()}` };
  }

  const dict = dictionaryService.lookupSync(clean);
  const syllables = (dict.syllables && dict.syllables.length > 1) ? dict.syllables : splitSyllables(clean);
  const phonicsUnits = (dict.phonicsUnits && dict.phonicsUnits.length > 1) ? dict.phonicsUnits : decomposePhonics(clean);

  let ipa = dict.ipa;
  if (!ipa || ipa === `/${clean}/` || ipa === '/eil/') {
    ipa = `/${phonicsUnits.filter(u => u.phoneme !== '∅').map(u => u.phoneme.replace(/\//g, '')).join('·')}/`;
  }

  return {
    id: `w-${clean}-${Date.now()}`,
    word: clean,
    ipa,
    definition: dict.def || '新学词汇',
    pos: dict.pos || 'n.',
    syllables,
    detail: dict.root?.desc || `${dict.source || 'Oxford 3000 / ECDICT'} 核心词汇，包含 ${phonicsUnits.length} 个音形对应音素。`,
    phonicsUnits,
    spokenExample: dict.example,
  };
}
