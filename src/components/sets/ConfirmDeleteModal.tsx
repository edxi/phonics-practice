import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import type { PracticeSet } from '../../types/phonics';

interface ConfirmDeleteModalProps {
  set: PracticeSet | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  set,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !set) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-purple-50 flex flex-col items-center text-center animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          删除练习集
        </h3>

        <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold mb-2">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>此操作无法撤销</span>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed px-2">
          确定要删除练习集 <span className="font-bold text-slate-800">「{set.title}」</span> 吗？包含的 {set.words.length} 个单词练习记录都将被移除。
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-all active:scale-95 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
};
