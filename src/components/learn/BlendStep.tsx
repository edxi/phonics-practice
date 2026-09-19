import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import type { WordItem, PhonicsUnit } from '../../types/phonics';
import { speechService } from '../../services/speechService';

interface BlendStepProps {
  word: WordItem;
  onComplete: () => void;
}

export const BlendStep: React.FC<BlendStepProps> = ({ word, onComplete }) => {
  // Use natural phonics units or syllable chunks (ensures 2-5 blocks, preventing single-letter anagrams)
  const targetUnits: PhonicsUnit[] = useMemo(() => {
    if (word.phonicsUnits && word.phonicsUnits.length <= 5) {
      return word.phonicsUnits;
    }
    // If more than 5 units (e.g. long multi-syllabic words), blend by natural syllables
    if (word.syllables && word.syllables.length >= 2) {
      return word.syllables.map(s => ({
        letters: s.text,
        phoneme: s.phoneticPart ? `/${s.phoneticPart}/` : `/${s.text}/`,
        type: 'blend' as const
      }));
    }
    return word.phonicsUnits;
  }, [word]);
  
  // Available pool of tiles (shuffled)
  const [availableTiles, setAvailableTiles] = useState<{ id: string; unit: PhonicsUnit }[]>(() =>
    targetUnits.map((unit, idx) => ({
      id: `tile-${idx}-${unit.letters}`,
      unit
    })).sort(() => 0.5 - Math.random())
  );
  // User placed tiles in slots
  const [placedTiles, setPlacedTiles] = useState<{ id: string; unit: PhonicsUnit }[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initial audio prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      speechService.speakWord(word.word);
    }, 300);
    return () => {
      clearTimeout(timer);
      speechService.cancel();
    };
  }, [word.word]);

  // Tap available tile to place in slot
  const handlePlaceTile = (tile: { id: string; unit: PhonicsUnit }) => {
    speechService.speakPhoneme(tile.unit.phoneme, tile.unit.letters);
    const newPlaced = [...placedTiles, tile];
    const newAvailable = availableTiles.filter(t => t.id !== tile.id);

    setPlacedTiles(newPlaced);
    setAvailableTiles(newAvailable);

    // Check if finished
    if (newPlaced.length === targetUnits.length) {
      const isWordCorrect = newPlaced.map(p => p.unit.letters).join('') === word.word.toLowerCase();
      if (isWordCorrect) {
        setIsSuccess(true);
        speechService.playSuccessSound();
        setTimeout(() => {
          speechService.speakWord(word.word);
        }, 500);
      } else {
        speechService.playErrorSound();
      }
    }
  };

  // Tap placed tile to return back
  const handleReturnTile = (tile: { id: string; unit: PhonicsUnit }) => {
    speechService.playClickSound();
    setPlacedTiles(placedTiles.filter(t => t.id !== tile.id));
    setAvailableTiles([...availableTiles, tile]);
    setIsSuccess(false);
  };

  // Reset all
  const handleReset = () => {
    const tiles = targetUnits.map((unit, idx) => ({
      id: `tile-${idx}-${unit.letters}`,
      unit
    })).sort(() => 0.5 - Math.random());
    setAvailableTiles(tiles);
    setPlacedTiles([]);
    setIsSuccess(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none">
      <div className="space-y-4">
        {/* Banner */}
        <div className="text-center py-2">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
            第五步：拼 · 拼读积木
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            按发音顺序拼出完整单词
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            点击下方发音积木，组装出正确的拼读组合
          </p>
        </div>

        {/* Target Assembly Slots Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 text-center flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-semibold text-slate-400">拼读组装槽</span>
            <button
              onClick={() => speechService.speakWord(word.word)}
              className="p-1 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center gap-1 text-xs px-2.5 py-1 font-bold"
            >
              <Volume2 className="w-3.5 h-3.5" /> 听发音
            </button>
          </div>

          {/* Slots Row (Responsive & Wrap to prevent horizontal overflow) */}
          <div className="flex items-center justify-center gap-2 min-h-[72px] py-2 w-full flex-wrap px-1">
            {targetUnits.map((_, idx) => {
              const placed = placedTiles[idx];
              return (
                <div
                  key={idx}
                  onClick={() => placed && handleReturnTile(placed)}
                  className={`flex-1 min-w-[54px] max-w-[84px] h-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all px-1 ${
                    placed
                      ? 'bg-purple-50/90 border-[#6d54f5] shadow-xs cursor-pointer scale-105'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {placed ? (
                    <>
                      <span className="text-lg font-extrabold text-[#6d54f5] truncate max-w-full">
                        {placed.unit.letters}
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 truncate max-w-full">
                        {placed.unit.phoneme}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-slate-300 font-bold">{idx + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reset button */}
          <div className="w-full flex justify-end mt-2">
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-purple-600 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> 重新排序
            </button>
          </div>
        </div>

        {/* Available Scrambled Tiles */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-purple-50">
          <div className="text-xs font-bold text-slate-500 mb-3 text-center">
            点击下方发音积木入槽：
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap min-h-[56px]">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handlePlaceTile(tile)}
                className="px-4 py-3 rounded-2xl bg-[#f4f2ff] hover:bg-purple-100 active:scale-90 border border-purple-200 text-slate-800 flex flex-col items-center shadow-xs transition-all"
              >
                <span className="text-lg font-black text-purple-900">
                  {tile.unit.letters}
                </span>
                <span className="text-xs font-mono text-purple-600">
                  {tile.unit.phoneme}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Correct feedback */}
        {isSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-center gap-2 text-emerald-800 text-sm font-bold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>拼读成功！{word.word} {word.ipa}</span>
          </div>
        )}
      </div>

      {/* Continue Action */}
      <div className="pt-2">
        {isSuccess ? (
          <button
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all animate-bounce"
          >
            <span>太棒了！最后一步：听音默写【写】</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">
            请依次点击积木拼装出完整的单词
          </div>
        )}
      </div>
    </div>
  );
};
