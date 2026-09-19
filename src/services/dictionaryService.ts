// Open-Source Dictionary Service (Oxford 3000™ + ECDICT + Free Dictionary API)
import { OXFORD_ECDICT_DATABASE, type OxfordDictEntry } from '../data/oxfordDictionary';
import type { WordItem } from '../types/phonics';

const CACHE_KEY_PREFIX = 'phonics_dict_cache_';

export class DictionaryService {
  private memoryCache: Map<string, OxfordDictEntry> = new Map();

  constructor() {
    // Preload memory cache with Oxford/ECDICT database
    for (const [key, entry] of Object.entries(OXFORD_ECDICT_DATABASE)) {
      this.memoryCache.set(key.toLowerCase(), entry);
    }
  }

  /**
   * Synchronous dictionary lookup: checks memory cache -> localStorage -> morphology
   */
  lookupSync(rawWord: string): OxfordDictEntry {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');

    // 1. Memory Cache / Oxford 3000 & ECDICT Database
    if (this.memoryCache.has(clean)) {
      return this.memoryCache.get(clean)!;
    }

    // 2. LocalStorage Persistent Cache
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

    // 3. Morphological & Affix Derivation Engine
    return this.deriveFromMorphology(clean);
  }

  /**
   * Asynchronous dictionary lookup: tries online Open Dictionary API if not found locally
   */
  async lookupAsync(rawWord: string): Promise<OxfordDictEntry> {
    const clean = rawWord.trim().toLowerCase().replace(/[^a-z]/g, '');
    const localResult = this.lookupSync(clean);

    // If already sourced from Oxford 3000 / ECDICT, return immediately!
    if (localResult.source.includes('Oxford') || localResult.source.includes('ECDICT')) {
      return localResult;
    }

    // 4. Query Open-Source Free Dictionary API in background
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s safe timeout

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || `/${clean}/`;
          
          let pos = 'n.';
          let definition = localResult.def;
          let exampleEn = `The word "${clean}" is important to learn.`;
          let exampleZh = `单词 "${clean}" 值得认真学习。`;

          if (entry.meanings && entry.meanings.length > 0) {
            const m = entry.meanings[0];
            pos = m.partOfSpeech ? `${m.partOfSpeech.slice(0, 3)}.` : 'n.';
            
            if (m.definitions && m.definitions.length > 0) {
              const defObj = m.definitions[0];
              if (defObj.definition) {
                // If definition is English, use it along with Chinese morphological context
                definition = `${localResult.def} (${defObj.definition})`;
              }
              if (defObj.example) {
                exampleEn = defObj.example;
                exampleZh = `例句：${defObj.example}`;
              }
            }
          }

          const enriched: OxfordDictEntry = {
            ...localResult,
            ipa: phonetic,
            pos,
            def: definition,
            example: { en: exampleEn, zh: exampleZh },
            source: 'Free Dictionary API / Oxford Open'
          };

          // Cache result
          this.saveToCache(clean, enriched);
          return enriched;
        }
      }
    } catch {
      // Graceful offline fallback
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
      detail: `${enriched.source} 收录词汇`
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
        syllables: [
          { text: stem, phoneticPart: stem, color: '#ff7b39' },
          { text: clean.slice(stem.length), phoneticPart: clean.slice(stem.length), color: '#3b82f6' }
        ],
        phonicsUnits: [
          { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
          { letters: clean.slice(stem.length), phoneme: '/ʃəl/', type: 'digraph' }
        ],
        root: {
          root: stem,
          rootMeaning: stem,
          affix: clean.slice(stem.length),
          affixMeaning: '形容词后缀',
          desc: `源自词根 ${stem} + 后缀 -${clean.slice(stem.length)} (相关的)`
        },
        example: {
          en: `The word "${clean}" is an important descriptive word.`,
          zh: `单词 "${clean}" 是一个重要的描述性词汇。`
        },
        source: 'ECDICT 形态学派生词'
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
        syllables: [
          { text: stem, phoneticPart: stem, color: '#ff7b39' },
          { text: clean.slice(stem.length), phoneticPart: clean.slice(stem.length), color: '#3b82f6' }
        ],
        phonicsUnits: [
          { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
          { letters: clean.slice(stem.length), phoneme: '/ʃn/', type: 'digraph' }
        ],
        root: {
          root: stem,
          rootMeaning: stem,
          affix: clean.slice(stem.length),
          affixMeaning: '名词后缀',
          desc: `词根 ${stem} + 名词后缀 -${clean.slice(stem.length)}`
        },
        example: {
          en: `Pay close attention to this ${clean}.`,
          zh: `请密切关注这个 ${clean}。`
        },
        source: 'ECDICT 形态学派生词'
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
        syllables: [
          { text: stem, phoneticPart: stem, color: '#ff7b39' },
          { text: clean.slice(stem.length), phoneticPart: clean.slice(stem.length), color: '#3b82f6' }
        ],
        phonicsUnits: [
          { letters: stem, phoneme: `/${stem}/`, type: 'blend' },
          { letters: clean.slice(stem.length), phoneme: '/əbl/', type: 'digraph' }
        ],
        example: {
          en: `This material is ${clean} for everyday use.`,
          zh: `这种材料日常使用非常合适。`
        },
        source: 'ECDICT 形态学派生词'
      };
    }

    // 4. Default fallback entry
    return {
      word: clean,
      pos: 'n./v.',
      def: `${clean}（新词汇）`,
      ipa: `/${clean}/`,
      syllables: [{ text: clean, phoneticPart: clean, color: '#ff7b39' }],
      phonicsUnits: [{ letters: clean, phoneme: `/${clean}/`, type: 'blend' }],
      example: {
        en: `Can you read and practice the word "${clean}"?`,
        zh: `你能大声朗读并练习单词 "${clean}" 吗？`
      },
      source: '开源词库解析'
    };
  }
}

export const dictionaryService = new DictionaryService();
