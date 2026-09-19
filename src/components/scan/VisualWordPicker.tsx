import React, { useState, useRef } from 'react';
import { Check, Sparkles, ArrowLeft, Volume2, Crop, Trash2, Plus, RefreshCw, RotateCw } from 'lucide-react';
import type { ScanResult, ScannedWordBox } from '../../types/phonics';
import { speechService } from '../../services/speechService';
import { ocrService } from '../../services/ocrService';

interface VisualWordPickerProps {
  scanResult: ScanResult;
  onBack: () => void;
  onCreatePracticeSet: (selectedWords: string[], setTitle: string) => void;
}

export const VisualWordPicker: React.FC<VisualWordPickerProps> = ({
  scanResult,
  onBack,
  onCreatePracticeSet,
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(scanResult.imageUrl);
  const [boxes, setBoxes] = useState<ScannedWordBox[]>(scanResult.boxes);
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'phonics'>('all');
  const [showTitleModal, setShowTitleModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('我的绘本拼读练习集');

  const [showAddWordModal, setShowAddWordModal] = useState<boolean>(false);
  const [newWordText, setNewWordText] = useState<string>('');

  // Box Selection & Rotation State
  const [isBoxSelectMode, setIsBoxSelectMode] = useState<boolean>(false);
  const [isRecognizingRegion, setIsRecognizingRegion] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [regionStatus, setRegionStatus] = useState<string>('');
  
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  // Rotate image 90 degrees and re-run OCR
  const handleRotateImage = async () => {
    if (isRotating || isRecognizingRegion) return;
    setIsRotating(true);
    setRegionStatus('正在旋转图片并重新识别英文单词...');
    try {
      const rotatedUrl = await ocrService.rotateImage(currentImageUrl, 90);
      setCurrentImageUrl(rotatedUrl);

      const newScan = await ocrService.scanImage(rotatedUrl, (msg) => setRegionStatus(msg));
      if (newScan.boxes.length > 0) {
        speechService.playSuccessSound();
        setBoxes(newScan.boxes);
      } else {
        speechService.playClickSound();
      }
    } catch (err) {
      console.error('Rotate image error:', err);
    } finally {
      setIsRotating(false);
    }
  };

  // Toggle single word box selection
  const handleToggleBox = (id: string) => {
    speechService.playClickSound();
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, selected: !b.selected } : b))
    );
  };

  // Delete single word box
  const handleDeleteBox = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    speechService.playClickSound();
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  // Toggle all selection
  const allSelected = boxes.length > 0 && boxes.every((b) => b.selected);
  const handleToggleSelectAll = () => {
    speechService.playClickSound();
    const nextState = !allSelected;
    setBoxes((prev) => prev.map((b) => ({ ...b, selected: nextState })));
  };

  // Manually add words (supports multiple words separated by spaces/newlines)
  const handleAddCustomWord = () => {
    const rawTokens = newWordText
      .split(/[\s,，;；\n]+/)
      .map((t) => t.trim().toLowerCase().replace(/[^a-z]/g, ''))
      .filter((t) => t.length >= 2);

    if (rawTokens.length === 0) return;

    speechService.playSuccessSound();
    const newBoxes: ScannedWordBox[] = rawTokens.map((clean, idx) => ({
      id: `box-manual-${Date.now()}-${idx}`,
      word: clean,
      cleanWord: clean,
      x: 15 + ((boxes.length + idx) % 3) * 28,
      y: 20 + Math.floor((boxes.length + idx) / 3) * 12,
      width: Math.min(30, clean.length * 4 + 10),
      height: 9,
      confidence: 1.0,
      selected: true,
      definition: '手动添加生词',
      level: 'phonics'
    }));

    setBoxes((prev) => [...newBoxes, ...prev]);
    setNewWordText('');
    setShowAddWordModal(false);
  };

  // Drag to draw bounding box on image
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isBoxSelectMode || isRecognizingRegion) return;
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setDragStart({ x, y });
    setDragCurrent({ x, y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart || !isBoxSelectMode) return;
    const rect = imageContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setDragCurrent({ x, y });
  };

  const handlePointerUp = async () => {
    if (!dragStart || !dragCurrent || !isBoxSelectMode) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const minX = Math.min(dragStart.x, dragCurrent.x);
    const minY = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    setDragStart(null);
    setDragCurrent(null);

    // If box is large enough to contain words (> 3% width and height)
    if (width > 3 && height > 3) {
      setIsRecognizingRegion(true);
      setRegionStatus('正在放大选区并增强对比度...');

      try {
        const regionBoxes = await ocrService.scanRegion(
          currentImageUrl,
          { x: minX, y: minY, width, height },
          (msg) => setRegionStatus(msg)
        );

        if (regionBoxes.length > 0) {
          speechService.playSuccessSound();
          setBoxes((prev) => [...regionBoxes, ...prev]);
        } else {
          speechService.playErrorSound();
        }
      } catch (err) {
        console.error('Region scan error:', err);
      } finally {
        setIsRecognizingRegion(false);
        setIsBoxSelectMode(false);
      }
    }
  };

  const selectedCount = boxes.filter((b) => b.selected).length;
  const selectedWords = boxes.filter((b) => b.selected).map((b) => b.cleanWord);

  const displayedBoxes = boxes.filter((b) => {
    if (filterMode === 'selected') return b.selected;
    if (filterMode === 'phonics') return b.level === 'phonics';
    return true;
  });

  const handleConfirmCreate = () => {
    if (selectedWords.length === 0) return;
    onCreatePracticeSet(selectedWords, customTitle);
  };

  // Calculate current dragging rectangle
  const currentDragRect = dragStart && dragCurrent ? {
    x: Math.min(dragStart.x, dragCurrent.x),
    y: Math.min(dragStart.y, dragCurrent.y),
    width: Math.abs(dragCurrent.x - dragStart.x),
    height: Math.abs(dragCurrent.y - dragStart.y),
  } : null;

  return (
    <div className="flex-1 flex flex-col justify-between bg-[#f8f7fe] select-none relative overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-purple-50 shrink-0 z-20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>重新扫描</span>
        </button>
        <span className="text-base font-bold text-slate-800">
          交互选词
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddWordModal(true)}
            className="text-xs font-bold text-[#6d54f5] hover:underline flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> 加词
          </button>
          <button
            onClick={handleToggleSelectAll}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            {allSelected ? '取消' : '全选'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        
        {/* Scanned Image with Visual Interactive Word Overlay */}
        <div className="p-3">
          {/* Tool Mode Bar */}
          <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center justify-between">
            <span>{isBoxSelectMode ? '✏️ 请在照片上拖拽画框圈出文字：' : '📷 点击单词可勾选，支持画框识别：'}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRotateImage}
                disabled={isRotating || isRecognizingRegion}
                className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-[#6d54f5] transition-all active:scale-95 disabled:opacity-50"
                title="顺时针旋转90°并重新识别"
              >
                <RotateCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
                <span>旋转 90°</span>
              </button>
              <button
                onClick={() => setIsBoxSelectMode(!isBoxSelectMode)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isBoxSelectMode
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                    : 'bg-purple-100 text-[#6d54f5] hover:bg-purple-200'
                }`}
              >
                <Crop className="w-3 h-3" />
                <span>{isBoxSelectMode ? '退出画框' : '画框识词'}</span>
              </button>
              <span className="text-purple-600 font-bold ml-1">已选 {selectedCount}/{boxes.length}</span>
            </div>
          </div>

          {/* Image & Interactive Layer */}
          <div
            ref={imageContainerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative w-full rounded-2xl overflow-hidden shadow-md border-2 border-purple-100 bg-slate-900 select-none ${
              isBoxSelectMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <img
              src={currentImageUrl}
              alt="Scanned Picture Book"
              className="w-full h-56 object-cover opacity-90 pointer-events-none"
            />

            {/* Overlaid Interactive Word Tags on Image */}
            {!isBoxSelectMode && boxes.map((box) => (
              <button
                key={box.id}
                onClick={() => handleToggleBox(box.id)}
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute rounded-md text-xs font-bold flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
                  box.selected
                    ? 'bg-[#6d54f5]/85 text-white border-2 border-white ring-2 ring-purple-400 scale-105 z-10 shadow-lg'
                    : 'bg-white/70 text-slate-700 border border-purple-300/80 hover:bg-white/90 z-0'
                }`}
                title={`点击选择 ${box.word}`}
              >
                <span className="truncate px-1 text-[11px] font-black tracking-wide">
                  {box.word}
                </span>
                {box.selected && (
                  <Check className="w-3 h-3 ml-0.5 stroke-[3] shrink-0 text-white" />
                )}
              </button>
            ))}

            {/* Active Drawing Box Overlay */}
            {currentDragRect && (
              <div
                style={{
                  left: `${currentDragRect.x}%`,
                  top: `${currentDragRect.y}%`,
                  width: `${currentDragRect.width}%`,
                  height: `${currentDragRect.height}%`,
                }}
                className="absolute border-2 border-dashed border-amber-300 bg-amber-400/25 pointer-events-none z-30 flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded-sm">
                  识别选区
                </span>
              </div>
            )}

            {/* Rotation / Region Recognition Spinner */}
            {(isRecognizingRegion || isRotating) && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-3 z-40">
                <RefreshCw className="w-7 h-7 text-amber-300 animate-spin mb-2" />
                <span className="text-xs font-bold text-white text-center px-4">
                  {regionStatus || '正在分析中...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 px-4 py-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              filterMode === 'all'
                ? 'bg-[#6d54f5] text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            全部单词 ({boxes.length})
          </button>
          <button
            onClick={() => setFilterMode('selected')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              filterMode === 'selected'
                ? 'bg-[#6d54f5] text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            已选中 ({selectedCount})
          </button>
          <button
            onClick={() => setFilterMode('phonics')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
              filterMode === 'phonics'
                ? 'bg-[#6d54f5] text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            自然拼读核心词
          </button>
        </div>

        {/* Word List Drawer */}
        <div className="p-3 space-y-2">
          {/* Empty State Banner if no words detected */}
          {boxes.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center border border-purple-100 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                未自动识别到英文单词
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                若照片拍摄角度偏转或横置，可点击下方按钮旋转矫正；亦可圈选文字区域或手动添加！
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={handleRotateImage}
                  disabled={isRotating}
                  className="px-3 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6d54f5] text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>旋转 90° (横拍矫正)</span>
                </button>
                <button
                  onClick={() => setIsBoxSelectMode(true)}
                  className="px-3 py-2 rounded-xl bg-amber-400 text-amber-950 text-xs font-bold shadow-xs active:scale-95"
                >
                  ✏️ 画框圈选文字
                </button>
                <button
                  onClick={() => setShowAddWordModal(true)}
                  className="px-3 py-2 rounded-xl bg-[#6d54f5] text-white text-xs font-bold shadow-xs active:scale-95"
                >
                  + 手动输入单词
                </button>
              </div>
            </div>
          )}

          {displayedBoxes.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleBox(item.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                item.selected
                  ? 'bg-purple-50/90 border-[#6d54f5] shadow-xs'
                  : 'bg-white border-slate-100 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    item.selected
                      ? 'bg-[#6d54f5] text-white'
                      : 'border-2 border-slate-300 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-800">
                      {item.word}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speechService.speakWord(item.word);
                      }}
                      className="text-purple-600 hover:text-purple-800 p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {item.definition || '绘本核心生词'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100/70 text-purple-700 font-semibold">
                  可拆音节
                </span>
                <button
                  onClick={(e) => handleDeleteBox(item.id, e)}
                  className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="删除该词"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Action Button */}
      <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-purple-100/60 shrink-0">
        <button
          onClick={() => setShowTitleModal(true)}
          disabled={selectedCount === 0}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
            selectedCount > 0
              ? 'bg-[#6d54f5] hover:bg-[#5b40ee] active:scale-95 text-white shadow-purple-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>生成练习集 (已选 {selectedCount} 词)</span>
        </button>
      </div>

      {/* Set Title Modal Dialog */}
      {showTitleModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 text-center">
              命名你的新练习集
            </h3>
            <p className="text-xs text-slate-500 text-center">
              将选中的 {selectedCount} 个单词打包为专属拼读练习集
            </p>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-[#6d54f5] focus:outline-hidden text-sm font-semibold"
              placeholder="请输入练习集名称"
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowTitleModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCreate}
                className="flex-1 py-3 rounded-xl bg-[#6d54f5] text-white font-bold text-sm shadow-md shadow-purple-200 hover:bg-[#5b40ee]"
              >
                立即生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Word Modal Dialog */}
      {showAddWordModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800 text-center">
              添加练习生词
            </h3>
            <p className="text-xs text-slate-500 text-center">
              输入单词或整句（可用空格/逗号分隔多个词），系统将自动解析自然拼读与音节结构
            </p>
            <textarea
              autoFocus
              rows={3}
              value={newWordText}
              onChange={(e) => setNewWordText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-[#6d54f5] focus:outline-hidden text-sm font-semibold resize-none"
              placeholder="例如：nail clipper tools beauty imgcook"
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAddWordModal(false);
                  setNewWordText('');
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleAddCustomWord}
                disabled={!newWordText.trim()}
                className={`flex-1 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                  newWordText.trim()
                    ? 'bg-[#6d54f5] text-white shadow-purple-200 hover:bg-[#5b40ee]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                批量添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
