// Types for Phonics Practice App

export type StepType = 'learn' | 'read' | 'quiz' | 'split' | 'blend' | 'write';

export interface PhonicsUnit {
  letters: string;       // e.g. "c", "are", "l", "e", "ss"
  phoneme: string;       // e.g. "/k/", "/er/", "/l/", "/ə/", "/s/"
  type: 'vowel' | 'consonant' | 'digraph' | 'blend' | 'r-controlled' | 'silent';
  audioKey?: string;     // Phoneme audio key
}

export interface SyllableUnit {
  text: string;          // e.g. "care", "less"
  phoneticPart: string;  // e.g. "ker", "ləs"
  color?: string;
}

export interface RootAffixBreakdown {
  root: string;
  rootMeaning: string;
  affix: string;
  affixMeaning: string;
  combinedMeaning: string;
  description: string;
}

export interface WordItem {
  id: string;
  word: string;               // e.g. "careless"
  syllables: SyllableUnit[];  // e.g. [{text: "care", phoneticPart: "ker"}, {text: "less", phoneticPart: "ləs"}]
  phonicsUnits: PhonicsUnit[];// Grapheme-to-phoneme breakdown
  ipa: string;                // e.g. "/ ˈkerləs /"
  pos: string;                // e.g. "adj."
  definition: string;         // e.g. "粗心的"
  detail?: string;            // Extended explanation
  rootAffix?: RootAffixBreakdown;
  spokenExample?: {
    en: string;
    zh: string;
  };
  isFavorite?: boolean;
  masteryScore?: number;      // 0 - 3 stars
  reviewCount?: number;       // e.g. 3 (shown as badge "03" on word tab)
}

export interface PracticeSet {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
  words: WordItem[];
  completedCount?: number;
}

export interface ScannedWordBox {
  id: string;
  word: string;
  cleanWord: string;
  x: number;      // percentage 0 - 100
  y: number;      // percentage 0 - 100
  width: number;  // percentage 0 - 100
  height: number; // percentage 0 - 100
  confidence: number;
  selected: boolean;
  definition?: string;
  level?: 'basic' | 'phonics' | 'advanced';
}

export interface ScanResult {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  boxes: ScannedWordBox[];
}
