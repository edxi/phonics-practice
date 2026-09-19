import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, CheckCircle2, ArrowRight } from 'lucide-react';
import type { WordItem } from '../../types/phonics';
import { speechService } from '../../services/speechService';

interface ReadStepProps {
  word: WordItem;
  onComplete: () => void;
}

export const ReadStep: React.FC<ReadStepProps> = ({ word, onComplete }) => {
  const [isBlending, setIsBlending] = useState<boolean>(false);
  const [highlightUnitIndex, setHighlightUnitIndex] = useState<number | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [readScore, setReadScore] = useState<number | null>(null);
  const [spokenText, setSpokenText] = useState<string>('');
  const [micError, setMicError] = useState<string | null>(null);

  const isCancelledRef = useRef<boolean>(false);
  const isBlendingRef = useRef<boolean>(false);

  // Start slow phonics blending animation and audio (one-shot per trigger)
  const startPhonicsBlending = useCallback(async () => {
    if (isBlendingRef.current) return;
    isBlendingRef.current = true;
    setIsBlending(true);
    setHighlightUnitIndex(null);

    try {
      // Play each phoneme in sequence
      for (let i = 0; i < word.phonicsUnits.length; i++) {
        if (isCancelledRef.current) break;
        setHighlightUnitIndex(i);
        const unit = word.phonicsUnits[i];
        await speechService.speakPhoneme(unit.phoneme, unit.letters);
        if (isCancelledRef.current) break;
        await new Promise(r => setTimeout(r, 220));
      }

      // Blend into full word
      if (!isCancelledRef.current) {
        setHighlightUnitIndex(null);
        await new Promise(r => setTimeout(r, 250));
        if (!isCancelledRef.current) {
          await speechService.speakWord(word.word, 0.85);
        }
      }
    } finally {
      isBlendingRef.current = false;
      setIsBlending(false);
      setHighlightUnitIndex(null);
    }
  }, [word]);

  // Trigger blending ONLY ONCE on mount, and cancel on unmount
  useEffect(() => {
    isCancelledRef.current = false;
    const timer = setTimeout(() => {
      startPhonicsBlending();
    }, 400);

    return () => {
      isCancelledRef.current = true;
      clearTimeout(timer);
      speechService.cancel();
    };
  }, [startPhonicsBlending]);

  // Handle Microphone read-aloud recording
  const handleStartRecording = () => {
    setIsListening(true);
    setReadScore(null);
    setSpokenText('');
    setMicError(null);

    const stopListening = speechService.startListening(
      word.word,
      (score, transcript) => {
        setIsListening(false);
        setReadScore(score);
        setSpokenText(transcript);
        if (score >= 75) {
          speechService.playSuccessSound();
        } else {
          speechService.playErrorSound();
        }
      },
      (err) => {
        setIsListening(false);
        setMicError(err || '麦克风权限受限或当前浏览器不支持语音识别');
        speechService.playErrorSound();
      }
    );

    // Auto timeout after 4.5 seconds
    setTimeout(() => {
      stopListening();
    }, 4500);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 select-none">
      <div className="space-y-4">
        {/* Step Guide Banner */}
        <div className="text-center py-2">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
            第二步：读 · 拼读融合与跟读
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            听音融合，大声朗读
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            依次体会各音组拼读发音，并拼读出完整单词
          </p>
        </div>

        {/* Word Display & Phonics Stream */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 text-center flex flex-col items-center">
          <div className="text-3xl font-extrabold text-slate-800 tracking-wider mb-2 break-words max-w-full px-2">
            {word.word}
          </div>
          <div className="text-sm font-mono text-purple-600 font-semibold mb-4 break-words max-w-full px-4">
            {word.ipa}
          </div>

          {/* Sequential Phonics Blending Cards (Responsive & Wrap to prevent overflow) */}
          <div className="flex items-center justify-center gap-2 flex-wrap py-2 w-full max-w-full px-2">
            {word.phonicsUnits.map((u, i) => {
              const isCurrent = highlightUnitIndex === i;
              return (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-2xl border transition-all duration-300 flex flex-col items-center min-w-[50px] max-w-[90px] shrink-0 ${
                    isCurrent
                      ? 'bg-[#6d54f5] text-white border-[#6d54f5] scale-105 shadow-lg shadow-purple-300'
                      : 'bg-purple-50/50 text-slate-700 border-purple-100'
                  }`}
                >
                  <span className={`text-base font-extrabold ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                    {u.letters}
                  </span>
                  <span className={`text-xs font-mono mt-0.5 ${isCurrent ? 'text-purple-200' : 'text-purple-600'}`}>
                    {u.phoneme}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Phonics Blending Replay Button */}
          <button
            onClick={startPhonicsBlending}
            disabled={isBlending}
            className="mt-4 px-4 py-2 rounded-full bg-purple-50 text-[#6d54f5] hover:bg-purple-100 active:scale-95 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            {isBlending ? '拼读示范中...' : '重新示范拼读融合'}
          </button>
        </div>

        {/* Voice Recording Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-50 flex flex-col items-center text-center">
          <div className="text-sm font-bold text-slate-700 mb-2">
            轮到你啦，按住麦克风大声读出：
          </div>

          {/* Big Microphone CTA */}
          <button
            onClick={handleStartRecording}
            disabled={isListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all my-3 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 shadow-xl'
                : 'bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white shadow-lg shadow-purple-300 ring-6 ring-purple-100'
            }`}
          >
            <Mic className="w-9 h-9 stroke-[2.2]" />
          </button>

          <span className="text-xs font-medium text-slate-500">
            {isListening ? '正在倾听，请清晰朗读...' : '点击麦克风开始跟读评测'}
          </span>

          {/* Mic Error Banner if any */}
          {micError && (
            <div className="mt-3 w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center animate-fadeIn">
              {micError}
            </div>
          )}

          {/* Result Score Banner with strict grading */}
          {readScore !== null && (
            <div
              className={`mt-4 w-full p-3.5 border rounded-2xl flex items-center justify-between animate-fadeIn ${
                readScore >= 75
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-6 h-6 ${
                    readScore >= 75 ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                />
                <div className="text-left">
                  <div
                    className={`text-xs font-bold ${
                      readScore >= 75 ? 'text-emerald-900' : 'text-rose-900'
                    }`}
                  >
                    发音得分：
                    <span
                      className={`text-base font-extrabold ${
                        readScore >= 75 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {readScore}
                    </span>{' '}
                    分
                  </div>
                  <div
                    className={`text-[11px] ${
                      readScore >= 75 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {readScore >= 75
                      ? `识别准确: "${spokenText || word.word}"`
                      : `识别为: "${spokenText || '未能识别'}"（需重试）`}
                  </div>
                </div>
              </div>
              <div className="flex text-amber-400 text-sm">
                {'★'.repeat(readScore >= 90 ? 3 : readScore >= 75 ? 2 : 1)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue CTA */}
      <div className="pt-2">
        <button
          onClick={onComplete}
          className="w-full py-3.5 rounded-2xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all"
        >
          <span>下一步：听音辨词【选】</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
