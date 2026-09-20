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
   * 2. LocalStorage persistent cache
   * 3. 16,000+ ECDICT Core Lexicon with Oxford 5000 authentic sentences
   * 4. Morphological derivation
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

    // 4. Morphological & Affix Derivation Engine
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

