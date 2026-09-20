// Open-Source Dictionary Service (Oxford 3000™ + ECDICT 16000+ Core Lexicon + Wiktionary + Morphology)
import { OXFORD_ECDICT_DATABASE, type OxfordDictEntry } from '../data/oxfordDictionary';
import ecdictData from '../data/ecdictCompact.json';
import oxfordSentencesData from '../data/oxfordSentences.json';
import type { WordItem } from '../types/phonics';

const CACHE_KEY_PREFIX = 'phonics_dict_cache_';

// 16,591 Core Words dictionary
const ECDICT_MAP = ecdictData as unknown as Record<string, [string, string, string]>;
// 4,900+ Oxford 5000 authentic example sentences
const OXFORD_SENTENCES = oxfordSentencesData as unknown as Record<string, string>;

function extractFirstMeaning(def: string): string {
  if (!def) return '';
  const cleanDef = def.replace(/^[a-z]+\.\s*/i, '').trim();
  const first = cleanDef.split(/[,，;；\n/]/)[0]?.trim();
  return first || cleanDef;
}

function generateNaturalFallbackExample(clean: string, pos: string, def: string): { en: string; zh: string } {
  const meaning = extractFirstMeaning(def) || clean;
  const p = pos.toLowerCase();

  if (p.includes('v')) {
    return {
      en: `They plan to ${clean} the new process carefully.`,
      zh: `他们计划认真${meaning}这一新流程。`,
    };
  }
  if (p.includes('adj')) {
    return {
      en: `The modern design is remarkably ${clean}.`,
      zh: `这一现代设计非常${meaning}。`,
    };
  }
  if (p.includes('adv')) {
    return {
      en: `They completed the task ${clean}.`,
      zh: `他们${meaning}地完成了这项任务。`,
    };
  }
  return {
    en: `The ${clean} plays an important role in daily life.`,
    zh: `这种${meaning}在日常生活中起着重要作用。`,
  };
}

// Valid 2-letter English words whitelist
export const VALID_2_LETTER_WORDS = new Set([
  'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'hi',
  'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or',
  'ox', 'so', 'to', 'up', 'us', 'we', 'ok', 'ex', 'tv', 'id', 'ps'
]);

/**
 * Returns the base lemma if the word is an inflected form of a known word in ECDICT/Oxford
 */
export function findLemma(word: string, dictCheck: (w: string) => boolean): { lemma: string; form: string } | null {
  if (word.length <= 3) return null;

  // 1. -ies -> -y (cities -> city, babies -> baby)
  if (word.endsWith('ies') && word.length > 4) {
    const base = word.slice(0, -3) + 'y';
    if (dictCheck(base)) return { lemma: base, form: '复数/第三人称单数' };
  }

  // 2. -es -> base (boxes -> box, watches -> watch)
  if (word.endsWith('es') && word.length > 4) {
    const base = word.slice(0, -2);
    if (dictCheck(base)) return { lemma: base, form: '复数/第三人称单数' };
  }

  // 3. -s -> base (cats -> cat, dogs -> dog, runs -> run)
  if (word.endsWith('s') && word.length > 3) {
    const base = word.slice(0, -1);
    if (dictCheck(base)) return { lemma: base, form: '复数/第三人称单数' };
  }

  // 4. -ed past tense (walked -> walk, liked -> like, stopped -> stop)
  if (word.endsWith('ed') && word.length > 3) {
    const base1 = word.slice(0, -2);
    if (dictCheck(base1)) return { lemma: base1, form: '过去式/分词' };
    const base2 = word.slice(0, -1); // liked -> like
    if (dictCheck(base2)) return { lemma: base2, form: '过去式/分词' };
    // double consonant: stopped -> stop, planned -> plan
    if (word.length > 4 && word[word.length - 3] === word[word.length - 4]) {
      const base3 = word.slice(0, -3);
      if (dictCheck(base3)) return { lemma: base3, form: '过去式/分词' };
    }
  }

  // 5. -ing gerund/participle (walking -> walk, making -> make, running -> run)
  if (word.endsWith('ing') && word.length > 4) {
    const base1 = word.slice(0, -3);
    if (dictCheck(base1)) return { lemma: base1, form: '现在分词/动名词' };
    const base2 = word.slice(0, -3) + 'e'; // making -> make
    if (dictCheck(base2)) return { lemma: base2, form: '现在分词/动名词' };
    // double consonant: running -> run, swimming -> swim
    if (word.length > 5 && word[word.length - 4] === word[word.length - 5]) {
      const base3 = word.slice(0, -4);
      if (dictCheck(base3)) return { lemma: base3, form: '现在分词/动名词' };
    }
  }

  // 6. -er / -est (faster -> fast, fastest -> fast, bigger -> big)
  if (word.endsWith('er') && word.length > 4) {
    const base1 = word.slice(0, -2);
    if (dictCheck(base1)) return { lemma: base1, form: '比较级' };
    const base2 = word.slice(0, -1);
    if (dictCheck(base2)) return { lemma: base2, form: '比较级' };
    if (word.length > 5 && word[word.length - 3] === word[word.length - 4]) {
      const base3 = word.slice(0, -3);
      if (dictCheck(base3)) return { lemma: base3, form: '比较级' };
    }
  }
  if (word.endsWith('est') && word.length > 5) {
    const base1 = word.slice(0, -3);
    if (dictCheck(base1)) return { lemma: base1, form: '最高级' };
    const base2 = word.slice(0, -2);
    if (dictCheck(base2)) return { lemma: base2, form: '最高级' };
  }

  // 7. -ly adverb (quickly -> quick, happily -> happy)
  if (word.endsWith('ly') && word.length > 4) {
    const base1 = word.slice(0, -2);
    if (dictCheck(base1)) return { lemma: base1, form: '副词' };
    if (word.endsWith('ily') && word.length > 5) {
      const base2 = word.slice(0, -3) + 'y';
      if (dictCheck(base2)) return { lemma: base2, form: '副词' };
    }
  }

  return null;
}

export class DictionaryService {
  private memoryCache: Map<string, OxfordDictEntry> = new Map();

  constructor() {
    // Preload memory cache with Oxford/ECDICT curated entries
    for (const [key, entry] of Object.entries(OXFORD_ECDICT_DATABASE)) {
      this.memoryCache.set(key.toLowerCase(), entry);
    }
  }

  /**
   * Check if a word exists in Oxford/ECDICT or is a valid inflected form of a known word
   */
  isInDictionary(rawWord: string): boolean {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!clean || clean.length < 2) return false;

    // Check direct match in curated db or ECDICT
    if (OXFORD_ECDICT_DATABASE[clean] !== undefined) return true;
    if (ECDICT_MAP[clean] !== undefined) return true;

    // Check memory cache (ensure not a fallback new-word entry)
    if (this.memoryCache.has(clean)) {
      const entry = this.memoryCache.get(clean);
      if (entry && entry.def && !entry.def.includes('（新词汇）') && entry.def !== '新学单词') return true;
    }

    // Check 2-letter word whitelist
    if (clean.length === 2) {
      return VALID_2_LETTER_WORDS.has(clean);
    }

    // Check lemmatization / inflections
    const lemmaInfo = findLemma(clean, (w) => ECDICT_MAP[w] !== undefined || OXFORD_ECDICT_DATABASE[w] !== undefined);
    if (lemmaInfo) return true;

    return false;
  }

  /**
   * Detect whether an OCR candidate token is likely image noise / artifact
   */
  isNoiseWord(rawWord: string): boolean {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!clean || clean.length < 2) return true;

    // 1. If in dictionary, it's definitely a genuine word!
    if (this.isInDictionary(clean)) return false;

    // 2. 2-letter tokens: must be in 2-letter whitelist
    if (clean.length === 2) {
      return !VALID_2_LETTER_WORDS.has(clean);
    }

    // 3. No vowel check (a, e, i, o, u, y) -> 99.9% OCR line/texture noise like 'tt', 'ss', 'bdf'
    if (!/[aeiouy]/.test(clean)) {
      return true;
    }

    // 4. Repeated consecutive characters: 3 or more (e.g. 'aaa', 'sss', 'ttt')
    if (/(.)\1\1/.test(clean)) {
      return true;
    }

    // 5. Strange consonant clusters: 4+ consecutive consonants without vowel
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(clean)) {
      return true;
    }

    return false;
  }

  /**
   * Synchronous dictionary lookup:
   * 1. Curated Oxford/ECDICT database
   * 2. LocalStorage persistent cache
   * 3. 16,000+ ECDICT Offline Lexicon with Oxford 5000 authentic sentences
   * 4. Lemmatization (plural, past tense, gerund, etc.)
   * 5. Morphological derivation
   */
  lookupSync(rawWord: string): OxfordDictEntry {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');

    // 1. Curated memory cache
    if (this.memoryCache.has(clean)) {
      return this.memoryCache.get(clean)!;
    }

    // 2. LocalStorage Persistent Cache
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${clean}`);
      if (cached) {
        const parsed: OxfordDictEntry = JSON.parse(cached);
        // Only return from localStorage if it does not contain legacy placeholder sentence
        if (!parsed.example?.en?.includes('Can you read and practice') && !parsed.example?.en?.includes('Can you read and remember')) {
          this.memoryCache.set(clean, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // 3. 16,000+ ECDICT Offline Lexicon (0ms instant lookup)
    if (ECDICT_MAP[clean]) {
      const [ipa, rawPos, def] = ECDICT_MAP[clean];
      const pos = rawPos || 'n.';
      
      // Match with Oxford 5000 example sentences if available
      let example: { en: string; zh: string };
      let source = '牛津 3000 / ECDICT 开源词库';

      if (OXFORD_SENTENCES[clean]) {
        const oxfordEx = OXFORD_SENTENCES[clean];
        const meaning = extractFirstMeaning(def);
        example = {
          en: oxfordEx,
          zh: meaning ? `（与“${meaning}”相关的实际用法）` : '牛津原版双语例句',
        };
        source = '牛津核心原版词典例句';
      } else {
        example = generateNaturalFallbackExample(clean, pos, def);
      }

      const entry: OxfordDictEntry = {
        word: clean,
        pos,
        def,
        ipa: ipa || `/${clean}/`,
        example,
        source,
      };
      this.memoryCache.set(clean, entry);
      return entry;
    }

    // 4. Lemmatization fallback to known base word
    const lemmaInfo = findLemma(clean, (w) => ECDICT_MAP[w] !== undefined || OXFORD_ECDICT_DATABASE[w] !== undefined);
    if (lemmaInfo) {
      const baseEntry = this.lookupSync(lemmaInfo.lemma);
      const entry: OxfordDictEntry = {
        word: clean,
        pos: baseEntry.pos,
        def: `${baseEntry.def} (${lemmaInfo.lemma}的${lemmaInfo.form})`,
        ipa: baseEntry.ipa || `/${clean}/`,
        example: baseEntry.example,
        source: '牛津 / ECDICT 屈折词形还原',
      };
      this.memoryCache.set(clean, entry);
      return entry;
    }

    // 5. Morphological & Affix Derivation Engine
    return this.deriveFromMorphology(clean);
  }

  /**
   * Asynchronous dictionary lookup:
   * Enriches definition, authentic example sentence from Wiktionary/Oxford and Chinese translation
   */
  async lookupAsync(rawWord: string): Promise<OxfordDictEntry> {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    let current = this.lookupSync(clean);

    // If entry is already from curated DB and has high quality example, return immediately
    const isCurated = OXFORD_ECDICT_DATABASE[clean] !== undefined;
    const hasAuthenticEx = current.example &&
      !current.example.en.includes('Can you read') &&
      !current.example.en.includes('important role in daily life') &&
      !current.example.en.includes('new process carefully') &&
      current.example.zh &&
      !current.example.zh.includes('相关的实际用法');

    if (isCurated && hasAuthenticEx) {
      return current;
    }

    // 1. Try to find/translate authentic sentence
    try {
      let targetSentenceEn: string | null = null;
      let targetSource = current.source;

      // Check Oxford 5000 first
      if (OXFORD_SENTENCES[clean]) {
        targetSentenceEn = OXFORD_SENTENCES[clean];
        targetSource = '牛津核心原版词典例句';
      } else {
        // Query Wiktionary REST API (global CORS enabled, authentic dictionary examples)
        const wiktionaryEx = await this.fetchWiktionaryExample(clean);
        if (wiktionaryEx) {
          targetSentenceEn = wiktionaryEx;
          targetSource = 'Wiktionary 维基词典';
        }
      }

      if (targetSentenceEn) {
        // Translate example sentence to Chinese via MyMemory
        const translatedZh = await this.translateText(targetSentenceEn);
        if (translatedZh) {
          current = {
            ...current,
            example: {
              en: targetSentenceEn,
              zh: translatedZh,
            },
            source: targetSource,
          };
          this.saveToCache(clean, current);
        }
      }
    } catch (e) {
      console.warn('Failed to enrich example sentence asynchronously', e);
    }

    // 2. If definition is still default, try MyMemory for definition
    if (!current.def || current.def.includes('（新词汇）') || current.def === '新学单词') {
      try {
        const translatedDef = await this.translateText(clean);
        if (translatedDef && translatedDef.toLowerCase() !== clean) {
          current = {
            ...current,
            def: translatedDef,
            source: '在线英汉词典',
          };
          this.saveToCache(clean, current);
        }
      } catch {
        // Ignore
      }
    }

    return current;
  }

  /**
   * Fetch authentic example sentences from Wiktionary REST API
   */
  private async fetchWiktionaryExample(clean: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(clean)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();
      const enSections = data.en;
      if (!Array.isArray(enSections)) return null;

      const candidates: string[] = [];
      for (const sec of enSections) {
        if (!sec.definitions) continue;
        for (const def of sec.definitions) {
          const list = [...(def.parsedExamples || []), ...(def.examples || [])];
          for (const item of list) {
            const raw = (typeof item === 'string' ? item : item.example || '')
              .replace(/<[^>]+>/g, '')
              .trim();
            if (
              raw.toLowerCase().includes(clean) &&
              !raw.startsWith('19') &&
              !raw.startsWith('20') &&
              raw.split(' ').length >= 4
            ) {
              candidates.push(raw);
            }
          }
        }
      }

      // Prioritize full sentences with punctuation between 18 and 120 chars
      const best =
        candidates.find((c) => /[.!?]$/.test(c) && c.length >= 18 && c.length <= 120) ||
        candidates[0];

      return best || null;
    } catch {
      return null;
    }
  }

  /**
   * Translate English text to Chinese via MyMemory
   */
  private async translateText(text: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const data = await res.json();
      const translated = data.responseData?.translatedText;
      if (translated && typeof translated === 'string' && translated.trim().length > 0) {
        return translated.trim();
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Asynchronously enrich a WordItem with online dictionary data
   */
  async enrichWordItem(wordItem: WordItem): Promise<WordItem> {
    const enriched = await this.lookupAsync(wordItem.word);
    return {
      ...wordItem,
      ipa: enriched.ipa || wordItem.ipa,
      pos: enriched.pos || wordItem.pos,
      definition: enriched.def || wordItem.definition,
      spokenExample: enriched.example || wordItem.spokenExample,
      detail: `${enriched.source} 收录词汇`,
    };
  }

  private saveToCache(word: string, entry: OxfordDictEntry): void {
    this.memoryCache.set(word, entry);
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${word}`, JSON.stringify(entry));
    } catch {
      // LocalStorage might be full or restricted
    }
  }

  /**
   * Lemmatization and morphological derivation for English words
   */
  private deriveFromMorphology(clean: string): OxfordDictEntry {
    // 1. -cial / -tial adjectives (e.g. judicial, crucial, beneficial, artificial)
    if (clean.endsWith('cial') || clean.endsWith('tial')) {
      const stem = clean.replace(/(cial|tial)$/, '');
      return {
        word: clean,
        pos: 'adj.',
        def: `关于${stem}的；具有...性质的`,
        ipa: `/${clean}/`,
        root: {
          root: stem,
          rootMeaning: stem,
          affix: clean.slice(stem.length),
          affixMeaning: '形容词后缀',
          desc: `源自词根 ${stem} + 后缀 -${clean.slice(stem.length)} (相关的)`,
        },
        example: {
          en: `The findings are ${clean} to the research.`,
          zh: `这些发现对该研究非常关键。`,
        },
        source: 'ECDICT 形态学派生词',
      };
    }

    // 2. -tion / -sion nouns (e.g. action, attention, creation)
    if (clean.endsWith('tion') || clean.endsWith('sion')) {
      const stem = clean.replace(/(tion|sion)$/, '');
      return {
        word: clean,
        pos: 'n.',
        def: `${stem}的行为或状态`,
        ipa: `/${clean}/`,
        root: {
          root: stem,
          rootMeaning: stem,
          affix: clean.slice(stem.length),
          affixMeaning: '名词后缀',
          desc: `词根 ${stem} + 名词后缀 -${clean.slice(stem.length)}`,
        },
        example: {
          en: `Pay close attention to this ${clean}.`,
          zh: `请密切关注这个 ${clean}。`,
        },
        source: 'ECDICT 形态学派生词',
      };
    }

    // 3. -able / -ible adjectives
    if (clean.endsWith('able') || clean.endsWith('ible')) {
      const stem = clean.replace(/(able|ible)$/, '');
      return {
        word: clean,
        pos: 'adj.',
        def: `能够${stem}的；易于...的`,
        ipa: `/${clean}/`,
        example: {
          en: `This material is ${clean} for everyday use.`,
          zh: `这种材料日常使用非常合适。`,
        },
        source: 'ECDICT 形态学派生词',
      };
    }

    // 4. Default fallback entry
    return {
      word: clean,
      pos: 'n./v.',
      def: `${clean}（新词汇）`,
      ipa: `/${clean}/`,
      example: {
        en: `The word "${clean}" is important in this context.`,
        zh: `单词 "${clean}" 在当前语境中非常重要。`,
      },
      source: '开源词库解析',
    };
  }
}

export const dictionaryService = new DictionaryService();

