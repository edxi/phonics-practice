import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { WordItem } from '../../types/phonics';
import { speechService } from '../../services/speechService';

interface QuizStepProps {
  word: WordItem;
  allWords: WordItem[];
  onComplete: () => void;
}

export const QuizStep: React.FC<QuizStepProps> = ({ word, allWords, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [options] = useState<WordItem[]>(() => {
    const distractors = allWords
      .filter((w) => w.word.toLowerCase() !== word.word.toLowerCase())
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [word, ...distractors].sort(() => 0.5 - Math.random());
  });

  // Play word audio automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      speechService.speakWord(word.word);
    }, 300);
    return () => {
      clearTimeout(timer);
      speechService.cancel();
    };
  }, [word.word]);

  const handleSelect = (optionWord: WordItem) => {
    setSelectedOption(optionWord.word);
    if (optionWord.word.toLowerCase() === word.word.toLowerCase()) {
      setIsCorrect(true);
      speechService.playSuccessSound();
    } else {
      setIsCorrect(false);
      speechService.playErrorSound();
    }
  };

  const handleReplayAudio = () => {
    speechService.speakWord(word.word);
    speechService.playClickSound();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none">
      <div className="space-y-4">
        {/* Banner */}
        <div className="text-center py-2">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
            第三步：选 · 听音辨词
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            听发音，选出正确的单词
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            辨别音形对应关系，快速锁定目标词汇
          </p>
        </div>

        {/* Audio Prompt Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 flex flex-col items-center justify-center text-center">
          <button
            onClick={handleReplayAudio}
            className="w-18 h-18 rounded-full bg-purple-50 text-[#6d54f5] hover:bg-purple-100 active:scale-95 flex items-center justify-center shadow-inner transition-all ring-6 ring-purple-100/60"
            aria-label="重听发音"
          >
            <Volume2 className="w-8 h-8 fill-current" />
          </button>
          <span className="text-xs font-semibold text-[#6d54f5] mt-3">
            点击重听发音
          </span>
        </div>

        {/* 4 Choices Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {options.map((opt) => {
            const isSelected = selectedOption === opt.word;
            const isAnswer = opt.word.toLowerCase() === word.word.toLowerCase();

            let cardStyle = 'bg-white border-purple-100/80 hover:border-purple-300 text-slate-800';
            if (isSelected) {
              if (isAnswer) {
                cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-md ring-2 ring-emerald-200';
              } else {
                cardStyle = 'bg-rose-50 border-rose-400 text-rose-950';
              }
            } else if (isCorrect && isAnswer) {
              cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950';
            }

            return (
              <button
                key={opt.id || opt.word}
                onClick={() => handleSelect(opt)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${cardStyle}`}
              >
                <div>
                  <div className="text-lg font-bold tracking-wide">
                    {opt.word}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {opt.ipa}
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    {opt.definition}
                  </span>
                  {isSelected && isAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isSelected && !isAnswer && (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Action */}
      <div className="pt-2">
        {isCorrect ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all animate-bounce"
          >
            <span>答对啦！下一步：音节切分【拆】</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">
            请点击上方选项选择正确答案
          </div>
        )}
      </div>
    </div>
  );
};
