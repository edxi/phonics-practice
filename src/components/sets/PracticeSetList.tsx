import React from 'react';
import { Camera, BookOpen, Sparkles, ChevronRight, Play } from 'lucide-react';
import type { PracticeSet } from '../../types/phonics';
import { UserProfileMenu } from '../auth/UserProfileMenu';

interface PracticeSetListProps {
  sets: PracticeSet[];
  onSelectSet: (set: PracticeSet) => void;
  onStartScan: () => void;
  onOpenAuth: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline';
}

export const PracticeSetList: React.FC<PracticeSetListProps> = ({
  sets,
  onSelectSet,
  onStartScan,
  onOpenAuth,
  syncStatus = 'synced',
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-[#f8f7fe] select-none">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-purple-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6d54f5] to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                Phonics Lab
              </h1>
              <span className="text-[11px] font-semibold text-purple-600">
                自然拼读随心练
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserProfileMenu onOpenAuth={onOpenAuth} syncStatus={syncStatus} />
            <button
              onClick={onStartScan}
              className="px-3 py-1.5 rounded-full bg-[#6d54f5] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-200 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>扫词建集</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
        {/* Banner CTA */}
        <div
          onClick={onStartScan}
          className="rounded-3xl p-5 bg-gradient-to-br from-[#7058ff] to-[#5b40ee] text-white shadow-xl shadow-purple-300/40 relative overflow-hidden cursor-pointer group active:scale-[0.98] transition-all"
        >
          <div className="relative z-10">
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-2 backdrop-blur-xs">
              全新功能
            </div>
            <h2 className="text-xl font-black mb-1 leading-tight text-white">
              拍照扫描绘本生词
            </h2>
            <p className="text-xs text-purple-100 max-w-[240px] leading-relaxed">
              摄像头对准书本，一秒圈出所有生词并自动生成“学-读-选-拆-拼-写”6步练习集！
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span>立即体验扫描取词</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="absolute right-[-10px] bottom-[-10px] opacity-20 group-hover:scale-110 transition-transform">
            <Camera className="w-32 h-32" />
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-black text-slate-800 tracking-wide">
            我的练习集 ({sets.length})
          </span>
          <span className="text-xs text-slate-400">
            随时复习巩固
          </span>
        </div>

        {/* Practice Sets Cards */}
        <div className="space-y-3">
          {sets.map((set) => {
            const totalWords = set.words.length;
            const masteredCount = set.words.filter(w => (w.masteryScore || 0) >= 2).length;

            return (
              <div
                key={set.id}
                onClick={() => onSelectSet(set)}
                className="bg-white rounded-3xl p-4 shadow-xs border border-purple-50 hover:border-purple-200 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {set.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {set.description}
                    </p>

                    {/* Word Pills preview */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                      {set.words.slice(0, 5).map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px]"
                        >
                          {w.word}
                        </span>
                      ))}
                      {set.words.length > 5 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          +{set.words.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Thumbnail / Start CTA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSet(set);
                    }}
                    className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6d54f5] hover:bg-purple-100 flex items-center justify-center shrink-0 shadow-xs active:scale-90 transition-transform"
                    title="开始学习"
                  >
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </button>
                </div>

                {/* Bottom Progress Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">
                    共 {totalWords} 词 · 已掌握 {masteredCount} 词
                  </span>
                  <div className="flex items-center gap-1 text-[#6d54f5] font-bold">
                    <span>开始练习</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-t border-purple-100 flex items-center justify-around text-xs font-semibold text-slate-500 shrink-0">
        <div className="flex flex-col items-center text-[#6d54f5]">
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>练习集</span>
        </div>
        <button
          onClick={onStartScan}
          className="flex flex-col items-center text-slate-400 hover:text-[#6d54f5] transition-colors"
        >
          <Camera className="w-5 h-5 mb-0.5" />
          <span>相机扫词</span>
        </button>
      </div>
    </div>
  );
};
