import React from 'react';
import { ChevronLeft, EyeOff, Eye } from 'lucide-react';
import type { WordItem } from '../../types/phonics';

interface WordHeaderProps {
  words: WordItem[];
  currentIndex: number;
  onSelectWord: (index: number) => void;
  onBack: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export const WordHeader: React.FC<WordHeaderProps> = ({
  words,
  currentIndex,
  onSelectWord,
  onBack,
  showTranslation,
  onToggleTranslation,
}) => {
  return (
    <div className="w-full bg-[#f8f7fe] pt-1 pb-2 px-3 z-20 shrink-0">
      {/* Top Bar with Back & Title */}
      <div className="relative flex items-center justify-between h-9 px-1">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-purple-100/50 active:scale-95 transition-transform"
          aria-label="返回"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <span className="text-[17px] font-bold text-slate-800 tracking-wide">
          学习
        </span>
        <button
          onClick={onToggleTranslation}
          className="w-8 h-8 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-100/50 transition-colors"
          title={showTranslation ? "隐藏释义" : "显示释义"}
        >
          {showTranslation ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 text-purple-700" />}
        </button>
      </div>

      {/* Horizontal Word Carousel */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-2 mt-1">
        {words.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={item.id || item.word}
              onClick={() => onSelectWord(idx)}
              className="relative flex items-center shrink-0 text-sm font-medium transition-all group active:scale-95"
            >
              {isActive ? (
                <div className="flex items-center gap-1 text-[#6d54f5] font-bold">
                  {/* Eye/Review Badge from screenshot */}
                  <div className="flex items-center bg-purple-100/90 text-[#6d54f5] px-1.5 py-0.5 rounded-full text-xs font-semibold">
                    <EyeOff className="w-3.5 h-3.5 mr-0.5" />
                    {item.reviewCount ? (
                      <span className="text-[10px] leading-none">
                        {String(item.reviewCount).padStart(2, '0')}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[15px] border-b-2 border-[#6d54f5] pb-0.5">
                    {item.word}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 hover:text-slate-800 text-[14px]">
                  {item.word}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
