// Open-Source Dictionary Service (Oxford 3000™ + ECDICT 16000+ Core Lexicon + Morphology)
import { OXFORD_ECDICT_DATABASE, type OxfordDictEntry } from '../data/oxfordDictionary';
import ecdictData from '../data/ecdictCompact.json';
import type { WordItem } from '../types/phonics';

const CACHE_KEY_PREFIX = 'phonics_dict_cache_';

// 16,591 Core Words dictionary
const ECDICT_MAP = ecdictData as unknown as Record<string, [string, string, string]>;

export class DictionaryService {
  private memoryCache: Map<string, OxfordDictEntry> = new Map();

  constructor() {
    // Preload memory cache with Oxford/ECDICT curated entries
    for (const [key, entry] of Object.entries(OXFORD_ECDICT_DATABASE)) {
      this.memoryCache.set(key.toLowerCase(), entry);
    }
  }

  /**
   * Synchronous dictionary lookup:
   * 1. Curated Oxford/ECDICT database
   * 2. 16,000+ ECDICT Core offline Lexicon
   * 3. LocalStorage persistent cache
   * 4. Morphological derivation
   */
  lookupSync(rawWord: string): OxfordDictEntry {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');

    // 1. Curated memory cache
    if (this.memoryCache.has(clean)) {
      return this.memoryCache.get(clean)!;
    }

    // 2. 16,000+ ECDICT Offline Lexicon (0ms instant lookup)
    if (ECDICT_MAP[clean]) {
      const [ipa, rawPos, def] = ECDICT_MAP[clean];
      const pos = rawPos || 'n.';
      const entry: OxfordDictEntry = {
        word: clean,
        pos,
        def,
        ipa: ipa || `/${clean}/`,
        example: {
          en: `Can you read and practice the word "${clean}"?`,
          zh: `你能大声朗读并练习单词 "${clean}" 吗？`,
        },
        source: '牛津 3000 / ECDICT 开源词库',
      };
      this.memoryCache.set(clean, entry);
      return entry;
    }

    // 3. LocalStorage Persistent Cache
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${clean}`);
      if (cached) {
        const parsed: OxfordDictEntry = JSON.parse(cached);
        this.memoryCache.set(clean, parsed);
        return parsed;
      }
    } catch {
      // Ignore localStorage errors
    }

    // 4. Morphological & Affix Derivation Engine
    return this.deriveFromMorphology(clean);
  }

  /**
   * Asynchronous dictionary lookup: queries translation API if not in offline dictionary
   */
  async lookupAsync(rawWord: string): Promise<OxfordDictEntry> {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    const localResult = this.lookupSync(clean);

    // If already sourced from Oxford 3000 / ECDICT, return immediately!
    if (localResult.source.includes('Oxford') || localResult.source.includes('ECDICT')) {
      return localResult;
    }

    // 5. Try online translation API (MyMemory) for words outside the 16,000 core words
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|zh-CN`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const translation = data.responseData?.translatedText;
        if (translation && translation.toLowerCase() !== clean) {
          const enriched: OxfordDictEntry = {
            ...localResult,
            def: translation,
            source: '在线英汉词库',
          };
          this.saveToCache(clean, enriched);
          return enriched;
        }
      }
    } catch {
      // Graceful fallback to localResult
    }

    return localResult;
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
          en: `The word "${clean}" is an important descriptive word.`,
          zh: `单词 "${clean}" 是一个重要的描述性词汇。`,
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

    // 4. Default fallback entry - NOTE: Do not populate dummy syllables/phonics here!
    return {
      word: clean,
      pos: 'n./v.',
      def: `${clean}（新词汇）`,
      ipa: `/${clean}/`,
      example: {
        en: `Can you read and practice the word "${clean}"?`,
        zh: `你能大声朗读并练习单词 "${clean}" 吗？`,
      },
      source: '开源词库解析',
    };
  }
}

export const dictionaryService = new DictionaryService();
