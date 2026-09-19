import React, { useState, useEffect } from 'react';
import { Volume2, Delete, Star, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { WordItem } from '../../types/phonics';
import { speechService } from '../../services/speechService';
import { storageService } from '../../services/storageService';

interface WriteStepProps {
  word: WordItem;
  hasNextWord: boolean;
  onNextWord: () => void;
  onFinishSet: () => void;
}

export const WriteStep: React.FC<WriteStepProps> = ({
  word,
  hasNextWord,
  onNextWord,
  onFinishSet,
}) => {
  const targetChars = word.word.toLowerCase().split('');
  const [typedChars, setTypedChars] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Keyboard letters pool (target letters + random letters)
  const [keyboardLetters] = useState<string[]>(() => {
    const needed = Array.from(new Set(word.word.toLowerCase().split('')));
    const randomAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !needed.includes(c));
    const extra = randomAlphabet.sort(() => 0.5 - Math.random()).slice(0, Math.max(4, 12 - needed.length));
    return [...needed, ...extra].sort(() => 0.5 - Math.random());
  });

  useEffect(() => {
    // Speak audio prompt
    const timer = setTimeout(() => {
      speechService.speakWord(word.word);
    }, 400);
    return () => {
      clearTimeout(timer);
      speechService.cancel();
    };
  }, [word.word]);

  const handleKeyClick = (char: string) => {
    if (typedChars.length >= targetChars.length || isFinished) return;
    speechService.playClickSound();

    const next = [...typedChars, char];
    setTypedChars(next);

    // Check if word completed
    if (next.length === targetChars.length) {
      if (next.join('') === word.word.toLowerCase()) {
        setIsFinished(true);
        speechService.playSuccessSound();
        storageService.updateWordMastery(word.id, 3);

        // Trigger confetti celebration!
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        speechService.playErrorSound();
      }
    }
  };

  const handleBackspace = () => {
    if (typedChars.length === 0 || isFinished) return;
    speechService.playClickSound();
    setTypedChars(typedChars.slice(0, typedChars.length - 1));
  };

  const handleReplay = () => {
    speechService.speakWord(word.word);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none">
      <div className="space-y-4">
        {/* Banner */}
        <div className="text-center py-2">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
            第六步：写 · 听音默写
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            听音拼写，巩固记忆
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            中文提示：{word.pos} {word.definition}
          </p>
        </div>

        {/* Audio Prompt & Spell Slots Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 flex flex-col items-center text-center">
          <button
            onClick={handleReplay}
            className="w-16 h-16 rounded-full bg-purple-50 text-[#6d54f5] hover:bg-purple-100 active:scale-95 flex items-center justify-center shadow-xs transition-all ring-4 ring-purple-100/60 mb-3"
            aria-label="重听发音"
          >
            <Volume2 className="w-7 h-7 fill-current" />
          </button>

          <span className="text-xs font-semibold text-[#6d54f5] mb-5">
            点击重听发音
          </span>

          {/* Letter Input Slots */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap w-full">
            {targetChars.map((_, idx) => {
              const char = typedChars[idx];
              const isFilled = !!char;
              const isWrong = isFilled && typedChars.length === targetChars.length && typedChars.join('') !== word.word.toLowerCase();

              return (
                <div
                  key={idx}
                  className={`w-9 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-extrabold transition-all ${
                    isFinished
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm scale-105'
                      : isWrong
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : isFilled
                      ? 'bg-purple-50 border-[#6d54f5] text-purple-900 shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                  }`}
                >
                  {char || ''}
                </div>
              );
            })}
          </div>

          {/* Error hint if wrong */}
          {typedChars.length === targetChars.length && !isFinished && (
            <div className="mt-3 text-xs text-rose-500 font-bold flex items-center gap-1">
              <span>拼写有误，点击退格键重新输入</span>
            </div>
          )}
        </div>

        {/* Celebration Banner when Finished */}
        {isFinished ? (
          <div className="bg-gradient-to-r from-purple-500 to-[#6d54f5] rounded-3xl p-5 text-white text-center shadow-lg shadow-purple-300/50 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2">
              <Trophy className="w-7 h-7 text-amber-300" />
            </div>
            <h3 className="text-lg font-black">太棒了！拼读与拼写通关！</h3>
            <p className="text-xs text-purple-100 mt-0.5">
              你已完成 "{word.word}" 的全部自然拼读练习
            </p>
            <div className="flex justify-center gap-1 text-amber-300 my-2 text-xl">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        ) : (
          /* Custom On-screen Keyboard */
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-purple-50">
            <div className="grid grid-cols-6 gap-2">
              {keyboardLetters.map((char, i) => (
                <button
                  key={i}
                  onClick={() => handleKeyClick(char)}
                  className="h-11 rounded-xl bg-purple-50/70 hover:bg-purple-100 active:bg-purple-200 active:scale-90 text-slate-800 font-bold text-base transition-all flex items-center justify-center shadow-xs border border-purple-100/60"
                >
                  {char}
                </button>
              ))}
              {/* Backspace Key */}
              <button
                onClick={handleBackspace}
                className="h-11 col-span-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-semibold text-xs transition-all flex items-center justify-center gap-1 border border-slate-200"
              >
                <Delete className="w-4 h-4" /> 退格
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="pt-2">
        {isFinished ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onFinishSet}
              className="flex-1 py-3.5 rounded-2xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-95 font-bold text-sm shadow-xs transition-all"
            >
              完成并返回
            </button>
            {hasNextWord && (
              <button
                onClick={onNextWord}
                className="flex-1 py-3.5 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>下一词</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">
            点击字母键盘完成拼写
          </div>
        )}
      </div>
    </div>
  );
};
