import type { PracticeSet, WordItem } from '../types/phonics';
import { INITIAL_PRACTICE_SETS } from '../data/sampleWords';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const GUEST_STORAGE_KEY = 'phonics_practice_sets_v1';
const FAVORITES_STORAGE_KEY = 'phonics_favorites_v1';
const MASTERY_STORAGE_KEY = 'phonics_mastery_v1';

interface PracticeSetRow {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  words: any;
  completed_count?: number | null;
  created_at: number;
  updated_at: number;
}

function rowToPracticeSet(row: PracticeSetRow): PracticeSet {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    coverImage: row.cover_image || undefined,
    words: Array.isArray(row.words) ? row.words : [],
    completedCount: row.completed_count || 0,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function practiceSetToRow(set: PracticeSet, userId: string): PracticeSetRow {
  return {
    id: set.id,
    user_id: userId,
    title: set.title,
    description: set.description || null,
    cover_image: set.coverImage || null,
    words: set.words,
    completed_count: set.completedCount || 0,
    created_at: set.createdAt,
    updated_at: set.updatedAt,
  };
}

import { createWordItem } from '../data/phonicsEngine';

function sanitizePracticeSet(set: PracticeSet): { set: PracticeSet; changed: boolean } {
  let changed = false;
  const newWords = set.words.map((w) => {
    const isDummyDef = !w.definition || w.definition.includes('（新词汇）') || w.definition === '新学单词';
    const isDummyPhonics = w.phonicsUnits.length <= 1 && w.word.length >= 4;
    const isDummySyllables = w.syllables.length <= 1 && w.word.length >= 5;
    const isDummyIpa = !w.ipa || w.ipa === `/${w.word}/`;

    if (isDummyDef || isDummyPhonics || isDummySyllables || isDummyIpa) {
      changed = true;
      const fresh = createWordItem(w.word);
      return {
        ...w,
        ipa: fresh.ipa,
        pos: fresh.pos,
        definition: fresh.definition,
        syllables: fresh.syllables,
        phonicsUnits: fresh.phonicsUnits,
        rootAffix: fresh.rootAffix || w.rootAffix,
        spokenExample: fresh.spokenExample || w.spokenExample,
        detail: fresh.detail || w.detail,
      };
    }
    return w;
  });

  return {
    set: changed ? { ...set, words: newWords } : set,
    changed,
  };
}

export const storageService = {
  // Get storage key based on whether a user is logged in
  getStorageKey(userId?: string): string {
    return userId ? `phonics_practice_sets_${userId}` : GUEST_STORAGE_KEY;
  },

  // 1. Synchronous read from local cache
  getPracticeSets(userId?: string): PracticeSet[] {
    const key = this.getStorageKey(userId);
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const rawSets: PracticeSet[] = JSON.parse(data);
        if (Array.isArray(rawSets) && rawSets.length > 0) {
          let anyChanged = false;
          const sanitized = rawSets.map((s) => {
            const { set: cleanedSet, changed } = sanitizePracticeSet(s);
            if (changed) anyChanged = true;
            return cleanedSet;
          });
          if (anyChanged) {
            this.savePracticeSets(sanitized, userId);
          }
          return sanitized;
        }
      }
    } catch {
      // Fallback
    }

    // If guest, initialize default sample sets
    if (!userId) {
      this.savePracticeSets(INITIAL_PRACTICE_SETS);
      return INITIAL_PRACTICE_SETS;
    }

    return [];
  },

  // 2. Synchronous save to local cache
  savePracticeSets(sets: PracticeSet[], userId?: string): void {
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(sets));
    } catch (e) {
      console.error('Failed to save practice sets to localStorage', e);
    }
  },

  // 3. Fetch from Supabase Cloud for logged-in user
  async fetchCloudSets(userId: string): Promise<PracticeSet[]> {
    if (!isSupabaseConfigured || !userId) {
      return this.getPracticeSets(userId);
    }

    try {
      const { data, error } = await supabase
        .from('practice_sets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching practice sets from Supabase:', error);
        return this.getPracticeSets(userId);
      }

      if (data && data.length > 0) {
        const loadedSets = (data as PracticeSetRow[]).map(rowToPracticeSet);
        let anyChanged = false;
        const sanitized = loadedSets.map((s) => {
          const { set: cleanedSet, changed } = sanitizePracticeSet(s);
          if (changed) anyChanged = true;
          return cleanedSet;
        });
        this.savePracticeSets(sanitized, userId);
        if (anyChanged) {
          this.syncAllToCloud(userId, sanitized);
        }
        return sanitized;
      } else {
        // User has no sets in cloud yet: seed with INITIAL_PRACTICE_SETS
        const initialSets = this.getPracticeSets();
        await this.syncAllToCloud(userId, initialSets);
        this.savePracticeSets(initialSets, userId);
        return initialSets;
      }
    } catch (err) {
      console.error('Failed to fetch sets from cloud:', err);
      return this.getPracticeSets(userId);
    }
  },

  // 4. Save a single set to cloud & local
  async saveSingleSet(set: PracticeSet, userId?: string): Promise<void> {
    const currentSets = this.getPracticeSets(userId);
    const existingIndex = currentSets.findIndex((s) => s.id === set.id);
    if (existingIndex >= 0) {
      currentSets[existingIndex] = set;
    } else {
      currentSets.unshift(set);
    }
    this.savePracticeSets(currentSets, userId);

    if (isSupabaseConfigured && userId) {
      try {
        const row = practiceSetToRow(set, userId);
        const { error } = await supabase.from('practice_sets').upsert(row);
        if (error) {
          console.error('Error syncing set to Supabase:', error);
        }
      } catch (e) {
        console.error('Failed to upsert set to cloud:', e);
      }
    }
  },

  // 5. Sync all sets to cloud
  async syncAllToCloud(userId: string, sets: PracticeSet[]): Promise<void> {
    if (!isSupabaseConfigured || !userId || sets.length === 0) return;
    try {
      const rows = sets.map((s) => practiceSetToRow(s, userId));
      const { error } = await supabase.from('practice_sets').upsert(rows);
      if (error) {
        console.error('Failed to bulk sync practice sets to Supabase:', error);
      }
    } catch (e) {
      console.error('Error during bulk cloud sync:', e);
    }
  },

  // 6. Delete a set
  async deletePracticeSet(id: string, userId?: string): Promise<void> {
    const sets = this.getPracticeSets(userId).filter((s) => s.id !== id);
    this.savePracticeSets(sets, userId);

    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('practice_sets').delete().eq('id', id);
      } catch (e) {
        console.error('Failed to delete set from cloud:', e);
      }
    }
  },

  getPracticeSetById(id: string, userId?: string): PracticeSet | undefined {
    const sets = this.getPracticeSets(userId);
    return sets.find((s) => s.id === id);
  },

  createPracticeSet(
    title: string,
    words: WordItem[],
    description?: string,
    coverImage?: string,
    userId?: string
  ): PracticeSet {
    const sets = this.getPracticeSets(userId);
    const newSet: PracticeSet = {
      id: `set-${Date.now()}`,
      title,
      description: description || `包含 ${words.length} 个单词的拼读练习集`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      words,
      completedCount: 0,
    };
    sets.unshift(newSet);
    this.savePracticeSets(sets, userId);

    // Asynchronously sync to cloud if user is logged in
    if (isSupabaseConfigured && userId) {
      this.saveSingleSet(newSet, userId);
    }

    return newSet;
  },

  updateWordMastery(wordId: string, stars: number, userId?: string): void {
    const sets = this.getPracticeSets(userId);
    let updatedSet: PracticeSet | null = null;

    sets.forEach((set) => {
      let setChanged = false;
      set.words.forEach((w) => {
        if (w.id === wordId || w.word.toLowerCase() === wordId.toLowerCase()) {
          w.masteryScore = Math.max(w.masteryScore || 0, stars);
          w.reviewCount = (w.reviewCount || 0) + 1;
          setChanged = true;
        }
      });
      if (setChanged) {
        set.updatedAt = Date.now();
        updatedSet = set;
      }
    });

    if (updatedSet) {
      this.savePracticeSets(sets, userId);
      if (isSupabaseConfigured && userId) {
        this.saveSingleSet(updatedSet, userId);
      }
    }
  },

  toggleWordFavorite(wordId: string, userId?: string): boolean {
    const sets = this.getPracticeSets(userId);
    let isFav = false;
    let updatedSet: PracticeSet | null = null;

    sets.forEach((set) => {
      let setChanged = false;
      set.words.forEach((w) => {
        if (w.id === wordId || w.word.toLowerCase() === wordId.toLowerCase()) {
          w.isFavorite = !w.isFavorite;
          isFav = !!w.isFavorite;
          setChanged = true;
        }
      });
      if (setChanged) {
        set.updatedAt = Date.now();
        updatedSet = set;
      }
    });

    if (updatedSet) {
      this.savePracticeSets(sets, userId);
      if (isSupabaseConfigured && userId) {
        this.saveSingleSet(updatedSet, userId);
      }
    }

    return isFav;
  },

  getAllFavoriteWords(userId?: string): WordItem[] {
    const sets = this.getPracticeSets(userId);
    const favs: WordItem[] = [];
    const seen = new Set<string>();

    sets.forEach((s) => {
      s.words.forEach((w) => {
        if (w.isFavorite && !seen.has(w.word.toLowerCase())) {
          seen.add(w.word.toLowerCase());
          favs.push(w);
        }
      });
    });

    return favs;
  },

  resetDefaults(userId?: string): void {
    const key = this.getStorageKey(userId);
    localStorage.removeItem(key);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(MASTERY_STORAGE_KEY);
    this.savePracticeSets(INITIAL_PRACTICE_SETS, userId);
  },
};
