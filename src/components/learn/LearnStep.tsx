import React, { useState, useEffect } from 'react';
import { Volume2, Star, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import type { WordItem } from '../../types/phonics';
import { speechService } from '../../services/speechService';
import { dictionaryService } from '../../services/dictionaryService';

interface LearnStepProps {
  word: WordItem;
  showTranslation: boolean;
  onStartPractice: () => void;
  onPrevWord: () => void;
  onNextWord: () => void;
  onToggleFavorite: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const LearnStep: React.FC<LearnStepProps> = ({
  word,
  showTranslation,
  onStartPractice,
  onPrevWord,
  onNextWord,
  onToggleFavorite,
  hasPrev,
  hasNext,
}) => {
  // Local state for dynamically enriched word data
  const [currentWordItem, setCurrentWordItem] = useState<WordItem>(word);

  useEffect(() => {
    setCurrentWordItem(word);

    const ex = word.spokenExample;
    const needsEnrichment =
      !ex ||
      ex.en.includes('Can you read') ||
      ex.en.includes('important role in daily life') ||
      ex.en.includes('new process carefully') ||
      (ex.zh && ex.zh.includes('相关的实际用法'));

    if (needsEnrichment) {
      let isSubscribed = true;
      dictionaryService
        .enrichWordItem(word)
        .then((enriched) => {
          if (
            isSubscribed &&
            enriched.spokenExample &&
            (enriched.spokenExample.en !== word.spokenExample?.en ||
              enriched.spokenExample.zh !== word.spokenExample?.zh)
          ) {
            setCurrentWordItem(enriched);
          }
        })
        .catch(() => {});
      return () => {
        isSubscribed = false;
      };
    }
  }, [word]);

  const activeWord = currentWordItem;

  // Mode toggle: 'phonics' (自然拼读) vs 'syllable' (音节拆分)
  const [breakdownMode, setBreakdownMode] = useState<'phonics' | 'syllable'>('phonics');
  const [activePhonemeIndex, setActivePhonemeIndex] = useState<number | null>(null);
  const [activeSyllableIndex, setActiveSyllableIndex] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Play word pronunciation
  const handlePlayWord = () => {
    speechService.speakWord(activeWord.word);
    speechService.playClickSound();
  };

  // Play single phoneme sound
  const handlePlayPhoneme = (letters: string, phoneme: string, index: number) => {
    setActivePhonemeIndex(index);
    speechService.speakPhoneme(phoneme, letters);
    setTimeout(() => setActivePhonemeIndex(null), 600);
  };

  // Play syllable sound
  const handlePlaySyllable = (syllableText: string, index: number) => {
    setActiveSyllableIndex(index);
    speechService.speakWord(syllableText, 0.75);
    setTimeout(() => setActiveSyllableIndex(null), 600);
  };

  return (
    <div className="flex-1 flex flex-col justify-between pb-4 select-none">
      {/* Scrollable Learning Cards Section */}
      <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto no-scrollbar">
        
        {/* Main Word Display Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-50 flex flex-col items-center text-center relative overflow-hidden">
          
          {/* Main Word Title with Syllable dot and color coding */}
          <div className="my-1 flex items-center justify-center tracking-wide">
            {breakdownMode === 'phonics' ? (
              // Phonics mode: Color-coded letters (e.g. blue consonants, orange vowels/r-controlled)
              <div className="text-[40px] font-extrabold flex items-center">
                {activeWord.phonicsUnits.map((u, i) => {
                  const isVowelGroup = u.type === 'vowel' || u.type === 'r-controlled' || u.type === 'digraph';
                  return (
                    <span
                      key={i}
                      onClick={() => handlePlayPhoneme(u.letters, u.phoneme, i)}
                      className={`cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
                        isVowelGroup ? 'text-[#ff7b39]' : 'text-[#3b82f6]'
                      }`}
                    >
                      {u.letters}
                      {i < activeWord.phonicsUnits.length - 1 && i === Math.floor(activeWord.phonicsUnits.length / 2) - 1 ? (
                        <span className="text-slate-300 font-light mx-0.5">·</span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : (
              // Syllable mode: e.g. orange "care" · dark "less"
              <div className="text-[40px] font-extrabold flex items-center">
                {activeWord.syllables.map((s, i) => (
                  <React.Fragment key={i}>
                    <span
                      onClick={() => handlePlaySyllable(s.text, i)}
                      className="cursor-pointer transition-transform active:scale-95"
                      style={{ color: i === 0 ? '#ff7b39' : '#334155' }}
                    >
                      {s.text}
                    </span>
                    {i < activeWord.syllables.length - 1 && (
                      <span className="text-slate-400 font-normal mx-1">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* In Syllable mode: Display orange syllable chips */}
          {breakdownMode === 'syllable' && (
            <div className="flex items-center gap-2 my-1.5">
              {activeWord.syllables.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handlePlaySyllable(s.text, i)}
                  className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                    activeSyllableIndex === i
                      ? 'bg-amber-200 text-amber-900 scale-105'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/70 hover:bg-amber-100'
                  }`}
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* IPA & Pronunciation Audio Button */}
          <div className="flex items-center justify-center gap-2 mt-1 mb-1">
            <span className="text-slate-500 text-[15px] font-medium tracking-wide">
              {activeWord.ipa}
            </span>
            <button
              onClick={handlePlayWord}
              className="w-7 h-7 rounded-full bg-purple-50 text-[#6d54f5] flex items-center justify-center hover:bg-purple-100 active:scale-90 transition-all"
              aria-label="发音"
            >
              <Volume2 className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Part of Speech & Definition */}
          <div className="flex items-center justify-center gap-2 text-[15px] mt-0.5 flex-wrap px-2">
            {showTranslation ? (
              <>
                <span className="text-slate-800 font-bold">
                  {activeWord.pos} {activeWord.definition}
                </span>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-purple-600 hover:text-purple-800 text-xs font-semibold flex items-center gap-0.5"
                >
                  <BookOpen className="w-3 h-3 text-purple-500" />
                  <span>词典解析</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <span className="text-slate-400 text-xs italic">
                (释义已隐藏，点击右上角眼睛查看)
              </span>
            )}
          </div>

          {/* Dictionary Source Badge */}
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>牛津 3000 / ECDICT 开源词库</span>
            </span>
          </div>

          {/* Expanded Details info if toggled */}
          {showDetails && (
            <div className="mt-3 p-3.5 bg-purple-50/70 rounded-2xl text-xs text-left text-slate-700 border border-purple-100 w-full animate-fadeIn space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>权威词典与形态解析</span>
                </span>
                <span className="text-[10px] bg-purple-200/60 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                  Oxford / ECDICT
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {activeWord.detail || `自然拼读核心词汇：包含 ${activeWord.phonicsUnits.length} 个音形对应音素。`}
              </p>
              {activeWord.rootAffix && (
                <div className="pt-1.5 border-t border-purple-200/50">
                  <p className="font-bold text-purple-800 text-[11px] mb-0.5">词根助记：</p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-amber-800">{activeWord.rootAffix.root}</span> ({activeWord.rootAffix.rootMeaning}) +{' '}
                    <span className="font-semibold text-purple-800">{activeWord.rootAffix.affix}</span> ({activeWord.rootAffix.affixMeaning}) ={' '}
                    <span className="font-bold text-slate-800">{activeWord.rootAffix.combinedMeaning}</span>
                  </p>
                  {activeWord.rootAffix.description && (
                    <p className="text-slate-500 text-[10px] mt-0.5">{activeWord.rootAffix.description}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Decomposition Cards based on active mode */}
          <div className="w-full mt-4">
            {breakdownMode === 'phonics' ? (
              /* Phonics Units Row: [c | /k/] [are | /er/] [l | /l/] [e | /ə/] [ss | /s/] */
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {activeWord.phonicsUnits.map((unit, idx) => {
                  const isActive = activePhonemeIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePlayPhoneme(unit.letters, unit.phoneme, idx)}
                      className={`min-w-[48px] rounded-xl border flex flex-col items-center justify-center p-1.5 transition-all active:scale-90 ${
                        isActive
                          ? 'border-[#6d54f5] bg-purple-100/90 shadow-md scale-105'
                          : 'border-purple-100/80 bg-purple-50/40 hover:bg-purple-100/50'
                      }`}
                    >
                      {/* Grapheme / Letters */}
                      <span
                        className={`text-base font-bold mb-0.5 ${
                          unit.type === 'vowel' || unit.type === 'r-controlled' || unit.type === 'digraph'
                            ? 'text-[#ff7b39]'
                            : 'text-[#3b82f6]'
                        }`}
                      >
                        {unit.letters}
                      </span>
                      {/* Divider */}
                      <div className="w-full h-[1px] bg-purple-200/60 my-0.5" />
                      {/* Phonetic Sound */}
                      <span className="text-[12px] text-purple-700 font-medium font-mono">
                        {unit.phoneme}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Syllable sound tags row: [/k/] [/e/] [/r/] [/l/] [/ə/] [/s/] */
              <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
                {activeWord.word.split('').map((char, idx) => (
                  <button
                    key={idx}
                    onClick={() => speechService.speakWord(char)}
                    className="px-2.5 py-1 rounded-lg bg-purple-100/70 text-purple-800 text-xs font-mono font-medium hover:bg-purple-200 active:scale-95 transition-all"
                  >
                    /{char}/
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode Switch Pill Buttons: [自然拼读] [音节拆分] */}
          <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-[280px]">
            <button
              onClick={() => setBreakdownMode('phonics')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all shadow-xs ${
                breakdownMode === 'phonics'
                  ? 'bg-[#6d54f5] text-white shadow-purple-200'
                  : 'bg-white text-[#6d54f5] border border-[#6d54f5] hover:bg-purple-50'
              }`}
            >
              自然拼读
            </button>
            <button
              onClick={() => setBreakdownMode('syllable')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all shadow-xs ${
                breakdownMode === 'syllable'
                  ? 'bg-[#6d54f5] text-white shadow-purple-200'
                  : 'bg-white text-[#6d54f5] border border-[#6d54f5] hover:bg-purple-50'
              }`}
            >
              音节拆分
            </button>
          </div>
        </div>

        {/* 词根助记 Card */}
        {activeWord.rootAffix && (
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-purple-50 relative">
            {/* Tag Badge */}
            <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100/80 text-purple-700 text-xs font-semibold mb-3">
              词根助记
            </div>

            {/* Formula Block: [care 关心] + [less 无...的] = [careless 不关心，即粗心的] */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-700 mb-2">
              <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-2.5 py-1.5 text-center min-w-[55px]">
                <div className="font-bold text-amber-700 text-sm">{activeWord.rootAffix.root}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{activeWord.rootAffix.rootMeaning}</div>
              </div>
              <span className="font-bold text-slate-400 text-base">+</span>
              <div className="bg-purple-50 border border-purple-200/60 rounded-xl px-2.5 py-1.5 text-center min-w-[55px]">
                <div className="font-bold text-purple-700 text-sm">{activeWord.rootAffix.affix}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{activeWord.rootAffix.affixMeaning}</div>
              </div>
              <span className="font-bold text-slate-400 text-base">=</span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center flex-1 max-w-[150px]">
                <div className="font-bold text-slate-800 text-sm">{activeWord.word}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{activeWord.definition}</div>
              </div>
            </div>

            {/* Explanation Note */}
            <p className="text-center text-xs text-slate-500 font-medium">
              {activeWord.rootAffix.description}
            </p>
          </div>
        )}

        {/* 实用口语 Card */}
        {activeWord.spokenExample && (
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-purple-50 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-purple-100/80 text-purple-700 text-xs font-semibold">
                实用口语
              </div>
              <button
                onClick={() => speechService.speakWord(activeWord.spokenExample!.en)}
                className="text-purple-600 hover:text-purple-800 p-1"
                aria-label="播放例句"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              "{activeWord.spokenExample.en}"
            </p>
            <p className="text-xs text-slate-500">
              {activeWord.spokenExample.zh}
            </p>
          </div>
        )}

        {/* Purple CTA Button: 练习 */}
        <div className="pt-2 pb-1 flex justify-center">
          <button
            onClick={onStartPractice}
            className="w-40 py-3 rounded-full bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-base shadow-lg shadow-purple-300/60 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            练习
          </button>
        </div>
      </div>

      {/* Bottom Floating Navigation Bar: [☆ 收藏] [上一词] [下一词] */}
      <div className="px-4 pt-2 bg-[#f8f7fe] shrink-0 border-t border-purple-100/50">
        <div className="flex items-center gap-3">
          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl hover:bg-purple-100/40 active:scale-95 transition-all text-slate-600"
          >
            <Star
              className={`w-6 h-6 ${
                (activeWord.isFavorite || word.isFavorite) ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span className="text-[11px] font-medium mt-0.5">收藏</span>
          </button>

          {/* Previous Word Button */}
          <button
            onClick={onPrevWord}
            disabled={!hasPrev}
            className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 ${
              hasPrev
                ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            上一词
          </button>

          {/* Next Word Button */}
          <button
            onClick={onNextWord}
            disabled={!hasNext}
            className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all active:scale-95 ${
              hasNext
                ? 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
            }`}
          >
            下一词
          </button>
        </div>
      </div>
    </div>
  );
};
