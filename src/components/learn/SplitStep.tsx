import React, { useState } from 'react';
import { Scissors, CheckCircle2, ArrowRight, Volume2, RotateCcw } from 'lucide-react';
import type { WordItem } from '../../types/phonics';
import { speechService } from '../../services/speechService';

interface SplitStepProps {
  word: WordItem;
  onComplete: () => void;
}

export const SplitStep: React.FC<SplitStepProps> = ({ word, onComplete }) => {
  // Correct split indexes (e.g. for "careless", syllable 0 is "care" length 4, so split index is 3)
  const letters = word.word.split('');
  const targetSplitIndices: number[] = [];
  
  let acc = 0;
  for (let i = 0; i < word.syllables.length - 1; i++) {
    acc += word.syllables[i].text.length;
    targetSplitIndices.push(acc - 1);
  }

  // If single syllable, split by phonics units
  if (targetSplitIndices.length === 0 && word.phonicsUnits.length > 1) {
    let pAcc = 0;
    for (let i = 0; i < word.phonicsUnits.length - 1; i++) {
      pAcc += word.phonicsUnits[i].letters.length;
      targetSplitIndices.push(pAcc - 1);
    }
  }

  const [userSplits, setUserSplits] = useState<number[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleToggleSplit = (index: number) => {
    speechService.playClickSound();
    setHasError(false);
    let next: number[];
    if (userSplits.includes(index)) {
      next = userSplits.filter(i => i !== index);
    } else {
      next = [...userSplits, index];
    }
    setUserSplits(next);

    // Exact match check:
    // 1. Same number of cuts
    // 2. Every target split index is in next
    // 3. Every selected split index is a valid target cut
    const isExactMatch =
      next.length === targetSplitIndices.length &&
      targetSplitIndices.every(t => next.includes(t)) &&
      next.every(n => targetSplitIndices.includes(n));

    if (isExactMatch) {
      setIsDone(true);
      setHasError(false);
      speechService.playSuccessSound();
    } else {
      setIsDone(false);
      const containsWrongCut = next.some(n => !targetSplitIndices.includes(n));
      if (containsWrongCut || next.length >= targetSplitIndices.length) {
        setHasError(true);
        if (next.length >= targetSplitIndices.length) {
          speechService.playErrorSound();
        }
      }
    }
  };

  const handleReset = () => {
    setUserSplits([]);
    setIsDone(false);
    setHasError(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none">
      <div className="space-y-4">
        {/* Banner */}
        <div className="text-center py-2">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
            第四步：拆 · 互动音节切分
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            找出音节分界点，切开单词！
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            轻触字母中间的圆点，将单词拆解为独立音节
          </p>
        </div>

        {/* Interactive Cutting Board */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 text-center flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold mb-4">
            <Scissors className="w-4 h-4" />
            <span>轻触两字母之间的剪刀分割点</span>
          </div>

          {/* Letter Blocks & Cut Dividers (Responsive & Wrap) */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 py-4 max-w-full">
            {letters.map((char, idx) => {
              const isSplit = userSplits.includes(idx);
              const canSplit = idx < letters.length - 1;
              const isWrong = isSplit && !targetSplitIndices.includes(idx);

              return (
                <React.Fragment key={idx}>
                  {/* Letter Box */}
                  <div className="w-9 h-13 sm:w-10 sm:h-14 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center justify-center text-xl sm:text-2xl font-black text-slate-800 shadow-xs">
                    {char}
                  </div>

                  {/* Cut Divider Button */}
                  {canSplit && (
                    <button
                      onClick={() => handleToggleSplit(idx)}
                      className={`w-6 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                        isSplit
                          ? isWrong
                            ? 'bg-rose-500 text-white shadow-md scale-110 ring-2 ring-rose-300'
                            : 'bg-[#6d54f5] text-white shadow-md scale-110'
                          : 'bg-slate-100 hover:bg-purple-100 text-slate-400 hover:text-purple-600 border border-dashed border-slate-300'
                      }`}
                      title={isWrong ? '切分位置有误，点击取消' : '点击切开'}
                    >
                      {isSplit ? (
                        <div className="w-1 h-6 bg-white rounded-full" />
                      ) : (
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                      )}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error hint when user selects wrong split */}
          {hasError && !isDone && (
            <div className="mt-2 p-2 px-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold animate-fadeIn">
              ⚠️ 切分位置有误，请注意音节边界（点击红色的分割条可取消）
            </div>
          )}

          {/* Target Hints */}
          <div className="text-xs text-slate-400 mt-3 flex items-center gap-3">
            <span>目标音节数：{word.syllables.length}</span>
            <button
              onClick={handleReset}
              className="text-purple-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> 重置
            </button>
          </div>
        </div>

        {/* Success Syllable Reveal */}
        {isDone && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center animate-fadeIn">
            <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>切分正确！已成功拆分为独立音节：</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              {word.syllables.map((s, i) => (
                <button
                  key={i}
                  onClick={() => speechService.speakWord(s.text)}
                  className="px-4 py-2 rounded-2xl bg-white border border-emerald-300 shadow-xs font-black text-emerald-800 text-lg flex items-center gap-2 hover:bg-emerald-100/50 active:scale-95"
                >
                  <span>{s.text}</span>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="pt-2">
        {isDone ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all"
          >
            <span>太棒了！下一步：拼读积木【拼】</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              // Auto-help split for the user
              setUserSplits(targetSplitIndices);
              setIsDone(true);
              speechService.playSuccessSound();
            }}
            className="w-full py-2.5 text-xs text-purple-600 font-bold hover:underline"
          >
            提示：点击这里自动切分
          </button>
        )}
      </div>
    </div>
  );
};
