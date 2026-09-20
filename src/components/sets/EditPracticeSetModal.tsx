import React, { useState, useEffect } from 'react';
import { X, Plus, Edit3, AlertCircle, Sparkles } from 'lucide-react';
import type { PracticeSet, WordItem } from '../../types/phonics';
import { createWordItem } from '../../data/phonicsEngine';
import { speechService } from '../../services/speechService';

interface EditPracticeSetModalProps {
  set: PracticeSet | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSet: PracticeSet) => void;
}

export const EditPracticeSetModal: React.FC<EditPracticeSetModalProps> = ({
  set,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [words, setWords] = useState<WordItem[]>([]);
  const [newWordText, setNewWordText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when set changes or modal opens
  useEffect(() => {
    if (set) {
      setTitle(set.title);
      setDescription(set.description || '');
      setWords([...set.words]);
      setNewWordText('');
      setErrorMsg(null);
    }
  }, [set, isOpen]);

  if (!isOpen || !set) return null;

  // Remove a word from the set
  const handleRemoveWord = (wordId: string) => {
    if (words.length <= 1) {
      setErrorMsg('练习集至少需要保留 1 个单词');
      return;
    }
    speechService.playClickSound();
    setWords((prev) => prev.filter((w) => w.id !== wordId));
    setErrorMsg(null);
  };

  // Add new word(s)
  const handleAddWords = () => {
    const tokens = newWordText
      .split(/[\s,，;；\n]+/)
      .map((t) => t.trim().toLowerCase().replace(/[^a-z]/g, ''))
      .filter((t) => t.length >= 2);

    if (tokens.length === 0) {
      setErrorMsg('请输入有效的英文单词（至少2个字母）');
      return;
    }

    const existingWordSet = new Set(words.map((w) => w.word.toLowerCase()));
    const newItems: WordItem[] = [];

    for (const token of tokens) {
      if (!existingWordSet.has(token)) {
        existingWordSet.add(token);
        newItems.push(createWordItem(token));
      }
    }

    if (newItems.length === 0) {
      setErrorMsg('输入的单词均已存在于当前练习集中');
      return;
    }

    speechService.playSuccessSound();
    setWords((prev) => [...prev, ...newItems]);
    setNewWordText('');
    setErrorMsg(null);
  };

  // Save changes
  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('练习集名称不能为空');
      return;
    }

    if (words.length === 0) {
      setErrorMsg('练习集必须包含至少 1 个单词');
      return;
    }

    const updated: PracticeSet = {
      ...set,
      title: trimmedTitle,
      description: description.trim() || undefined,
      words,
      updatedAt: Date.now(),
    };

    speechService.playSuccessSound();
    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-purple-50 overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-purple-50 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6d54f5] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                编辑练习集
              </h3>
              <p className="text-[11px] text-slate-500">
                修改名称、描述及单词内容
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              练习集名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="例如：绘本核心生词拼读"
              maxLength={50}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#6d54f5] focus:ring-2 focus:ring-purple-100 outline-hidden text-sm font-semibold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              练习集简介 (可选)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：包含 Oxford 核心词汇和自然拼读练习"
              rows={2}
              maxLength={150}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#6d54f5] focus:ring-2 focus:ring-purple-100 outline-hidden text-xs text-slate-700 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Words Management Section */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">
                  单词列表
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100/80 text-purple-700 text-[11px] font-bold">
                  {words.length} 词
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                点击 ✕ 移除单词
              </span>
            </div>

            {/* Word Chips */}
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {words.map((w) => (
                <div
                  key={w.id || w.word}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-purple-100 text-purple-900 shadow-2xs text-xs font-semibold group hover:border-rose-200 transition-all"
                >
                  <span>{w.word}</span>
                  {w.ipa && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {w.ipa}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveWord(w.id)}
                    className="w-4 h-4 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer ml-0.5"
                    title="移除单词"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Words Bar */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={newWordText}
                onChange={(e) => {
                  setNewWordText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWords();
                  }
                }}
                placeholder="输入新单词（支持多个，以空格或逗号分隔）"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-[#6d54f5] focus:ring-2 focus:ring-purple-100 outline-hidden text-xs text-slate-800 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddWords}
                className="px-3.5 py-2 rounded-xl bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#6d54f5] hover:bg-[#5b40ee] text-white text-xs font-bold shadow-md shadow-purple-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>保存修改</span>
          </button>
        </div>
      </div>
    </div>
  );
};
