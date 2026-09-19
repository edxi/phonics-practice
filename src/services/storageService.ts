import type { PracticeSet, WordItem } from '../types/phonics';
import { INITIAL_PRACTICE_SETS } from '../data/sampleWords';

const SETS_STORAGE_KEY = 'phonics_practice_sets_v1';
const FAVORITES_STORAGE_KEY = 'phonics_favorites_v1';
const MASTERY_STORAGE_KEY = 'phonics_mastery_v1';

export const storageService = {
  getPracticeSets(): PracticeSet[] {
    try {
      const data = localStorage.getItem(SETS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    // Initialize default sets
    this.savePracticeSets(INITIAL_PRACTICE_SETS);
    return INITIAL_PRACTICE_SETS;
  },

  savePracticeSets(sets: PracticeSet[]): void {
    try {
      localStorage.setItem(SETS_STORAGE_KEY, JSON.stringify(sets));
    } catch (e) {
      console.error('Failed to save practice sets to localStorage', e);
    }
  },

  getPracticeSetById(id: string): PracticeSet | undefined {
    const sets = this.getPracticeSets();
    return sets.find(s => s.id === id);
  },

  createPracticeSet(title: string, words: WordItem[], description?: string, coverImage?: string): PracticeSet {
    const sets = this.getPracticeSets();
    const newSet: PracticeSet = {
      id: `set-${Date.now()}`,
      title,
      description: description || `扫描生成的包含 ${words.length} 个单词的拼读练习集`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      words,
      completedCount: 0
    };
    sets.unshift(newSet);
    this.savePracticeSets(sets);
    return newSet;
  },

  updateWordMastery(wordId: string, stars: number): void {
    const sets = this.getPracticeSets();
    let updated = false;

    sets.forEach(set => {
      set.words.forEach(w => {
        if (w.id === wordId || w.word.toLowerCase() === wordId.toLowerCase()) {
          w.masteryScore = Math.max(w.masteryScore || 0, stars);
          w.reviewCount = (w.reviewCount || 0) + 1;
          updated = true;
        }
      });
    });

    if (updated) {
      this.savePracticeSets(sets);
    }
  },

  toggleWordFavorite(wordId: string): boolean {
    const sets = this.getPracticeSets();
    let isFav = false;

    sets.forEach(set => {
      set.words.forEach(w => {
        if (w.id === wordId || w.word.toLowerCase() === wordId.toLowerCase()) {
          w.isFavorite = !w.isFavorite;
          isFav = !!w.isFavorite;
        }
      });
    });

    this.savePracticeSets(sets);
    return isFav;
  },

  getAllFavoriteWords(): WordItem[] {
    const sets = this.getPracticeSets();
    const favs: WordItem[] = [];
    const seen = new Set<string>();

    sets.forEach(s => {
      s.words.forEach(w => {
        if (w.isFavorite && !seen.has(w.word.toLowerCase())) {
          seen.add(w.word.toLowerCase());
          favs.push(w);
        }
      });
    });

    return favs;
  },

  resetDefaults(): void {
    localStorage.removeItem(SETS_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(MASTERY_STORAGE_KEY);
    this.savePracticeSets(INITIAL_PRACTICE_SETS);
  }
};
