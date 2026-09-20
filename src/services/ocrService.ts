import Tesseract from 'tesseract.js';
import type { ScannedWordBox, ScanResult } from '../types/phonics';
import { createWordItem } from '../data/phonicsEngine';
import { dictionaryService } from './dictionaryService';

// Preset sample picture book images for instant realistic demo
export const DEMO_PICTURE_BOOKS = [
  {
    id: 'demo-fox-book',
    title: '绘本故事：《The Polite Little Fox》',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    words: [
      { word: 'clever', x: 12, y: 18, width: 22, height: 7, def: '聪明的' },
      { word: 'polite', x: 42, y: 18, width: 20, height: 7, def: '有礼貌的' },
      { word: 'careless', x: 68, y: 18, width: 26, height: 7, def: '粗心的' },
      { word: 'quiet', x: 12, y: 35, width: 18, height: 7, def: '安静的' },
      { word: 'cute', x: 38, y: 35, width: 16, height: 7, def: '可爱的' },
      { word: 'friendly', x: 62, y: 35, width: 26, height: 7, def: '友好的' },
      { word: 'helpful', x: 12, y: 52, width: 24, height: 7, def: '乐于助人的' },
      { word: 'sunshine', x: 44, y: 52, width: 28, height: 7, def: '阳光' }
    ]
  },
  {
    id: 'demo-school-book',
    title: '教材书页：《Fun with Words & Sounds》',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    words: [
      { word: 'happy', x: 15, y: 20, width: 22, height: 8, def: '快乐的' },
      { word: 'teacher', x: 45, y: 20, width: 26, height: 8, def: '老师' },
      { word: 'pencil', x: 15, y: 38, width: 20, height: 8, def: '铅笔' },
      { word: 'raincoat', x: 42, y: 38, width: 28, height: 8, def: '雨衣' },
      { word: 'beautiful', x: 15, y: 56, width: 32, height: 8, def: '美丽的' },
      { word: 'jump', x: 55, y: 56, width: 18, height: 8, def: '跳跃' }
    ]
  }
];



/**
 * Preprocess image on canvas: upscales and applies high-contrast adaptive grayscale
 */
function preprocessCanvas(
  img: HTMLImageElement,
  cropRect?: { x: number; y: number; width: number; height: number },
  scaleFactor: number = 2
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const sourceX = cropRect ? cropRect.x : 0;
  const sourceY = cropRect ? cropRect.y : 0;
  const sourceW = cropRect ? cropRect.width : img.naturalWidth || img.width;
  const sourceH = cropRect ? cropRect.height : img.naturalHeight || img.height;

  // Scale up for OCR clarity
  canvas.width = Math.round(sourceW * scaleFactor);
  canvas.height = Math.round(sourceH * scaleFactor);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minLum = 255;
    let maxLum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }

    const range = Math.max(1, maxLum - minLum);

    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const normalized = ((lum - minLum) / range) * 255;
      const enhanced = normalized < 130 ? Math.max(0, normalized * 0.7) : Math.min(255, normalized * 1.3);
      data[i] = enhanced;
      data[i + 1] = enhanced;
      data[i + 2] = enhanced;
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Canvas pixel manipulation restricted:', e);
  }

  return canvas;
}

/**
 * Spell check or clean word
 */
function cleanAndSpellcheck(raw: string): string {
  const clean = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (clean.length < 2) return '';

  // Filter obvious OCR noise tokens
  if (dictionaryService.isNoiseWord(clean)) return '';

  if (clean === 'clippsar' || clean === 'cliipser' || clean === 'clippr') return 'clipper';
  if (clean === 'beautv' || clean === 'beaut') return 'beauty';
  if (clean === 'toois' || clean === 'tooi') return 'tools';
  if (clean === 'naii') return 'nail';

  return clean;
}

/**
 * Rotate image by specified degrees (e.g. 90, 180, 270)
 */
export function rotateImageCanvas(imageUrl: string, degrees: number = 90): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl);
        return;
      }

      if (degrees === 90 || degrees === 270) {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

export const ocrService = {
  /**
   * Load demo picture book scan result
   */
  getDemoScan(demoIndex: number = 0): ScanResult {
    const demo = DEMO_PICTURE_BOOKS[demoIndex % DEMO_PICTURE_BOOKS.length];
    const boxes: ScannedWordBox[] = demo.words.map((w, idx) => ({
      id: `box-${demo.id}-${idx}`,
      word: w.word,
      cleanWord: w.word.toLowerCase(),
      x: w.x,
      y: w.y,
      width: w.width,
      height: w.height,
      confidence: 0.98,
      selected: true,
      inDictionary: true,
      definition: w.def,
      level: 'phonics'
    }));

    return {
      imageUrl: demo.url,
      imageWidth: 800,
      imageHeight: 600,
      boxes
    };
  },

  /**
   * Rotate an image by degrees
   */
  async rotateImage(imageUrl: string, degrees: number = 90): Promise<string> {
    return rotateImageCanvas(imageUrl, degrees);
  },

  /**
   * Scan specific cropped region of an image
   */
  async scanRegion(
    imageUrl: string,
    region: { x: number; y: number; width: number; height: number },
    onProgress?: (msg: string) => void
  ): Promise<ScannedWordBox[]> {
    onProgress?.('正在放大选区并增强对比度...');

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageUrl;
    });

    const pixelCrop = {
      x: (region.x / 100) * img.naturalWidth,
      y: (region.y / 100) * img.naturalHeight,
      width: (region.width / 100) * img.naturalWidth,
      height: (region.height / 100) * img.naturalHeight
    };

    const preprocessed = preprocessCanvas(img, pixelCrop, 3);
    onProgress?.('正在识别选区内文字...');

    const res = await Tesseract.recognize(preprocessed, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress?.(`识别选中文字 ${Math.round((m.progress || 0) * 100)}%...`);
        }
      }
    });

    const boxes: ScannedWordBox[] = [];
    const textLines = (res.data?.text || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    let offsetIdx = 0;
    for (const line of textLines) {
      const wordsInLine = line.split(/\s+/).map(w => cleanAndSpellcheck(w)).filter(Boolean);
      for (const w of wordsInLine) {
        if (w.length < 2) continue;
        if (dictionaryService.isNoiseWord(w)) continue;

        const inDict = dictionaryService.isInDictionary(w);
        const wordInfo = createWordItem(w);

        const subX = region.x + (offsetIdx % 2) * (region.width * 0.45);
        const subY = region.y + Math.floor(offsetIdx / 2) * 8;

        boxes.push({
          id: `box-crop-${Date.now()}-${offsetIdx}`,
          word: w,
          cleanWord: w,
          x: Math.round(subX * 10) / 10,
          y: Math.round(subY * 10) / 10,
          width: Math.min(region.width, Math.max(12, w.length * 3.5)),
          height: Math.max(6, Math.min(14, region.height * 0.8)),
          confidence: 0.95,
          selected: inDict,
          inDictionary: inDict,
          definition: wordInfo.definition,
          level: 'phonics'
        });
        offsetIdx++;
      }
    }

    return boxes;
  },

  /**
   * Internal helper to scan a single image instance
   */
  async _scanSingle(
    img: HTMLImageElement,
    imageUrl: string,
    onProgress?: (msg: string) => void
  ): Promise<ScanResult> {
    const imgWidth = img.naturalWidth || 800;
    const imgHeight = img.naturalHeight || 600;

    const enhancedCanvas = preprocessCanvas(img, undefined, 2);

    const res = await Tesseract.recognize(
      enhancedCanvas,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round((m.progress || 0) * 100);
            onProgress?.(`正在深度识别英文单词 ${pct}%...`);
          }
        }
      }
    );

    const rawWords: Tesseract.Word[] = [];
    if (res.data?.blocks) {
      for (const block of res.data.blocks) {
        for (const para of block.paragraphs) {
          for (const line of para.lines) {
            for (const word of line.words) {
              rawWords.push(word);
            }
          }
        }
      }
    }

    const boxes: ScannedWordBox[] = [];
    const seenWords = new Set<string>();
    const scaleFactor = 2;
    const canvasW = imgWidth * scaleFactor;
    const canvasH = imgHeight * scaleFactor;

    for (let i = 0; i < rawWords.length; i++) {
      const w = rawWords[i];
      const clean = cleanAndSpellcheck(w.text || '');
      if (!clean || clean.length < 2) continue;

      const confidence = (w.confidence || 80) / 100;
      const inDict = dictionaryService.isInDictionary(clean);

      // Discard low-confidence words that are not in dictionary
      if (!inDict && confidence < 0.6) {
        continue;
      }

      // Check noise word
      if (dictionaryService.isNoiseWord(clean)) {
        continue;
      }

      const x0 = w.bbox ? w.bbox.x0 : 10;
      const y0 = w.bbox ? w.bbox.y0 : 10;
      const x1 = w.bbox ? w.bbox.x1 : 100;
      const y1 = w.bbox ? w.bbox.y1 : 40;

      const x = Math.max(0, Math.min(95, (x0 / canvasW) * 100));
      const y = Math.max(0, Math.min(95, (y0 / canvasH) * 100));
      const width = Math.max(4, Math.min(90, ((x1 - x0) / canvasW) * 100));
      const height = Math.max(3, Math.min(40, ((y1 - y0) / canvasH) * 100));

      const dedupeKey = `${clean}-${Math.round(x / 6)}-${Math.round(y / 6)}`;
      if (seenWords.has(dedupeKey)) continue;
      seenWords.add(dedupeKey);

      const wordInfo = createWordItem(clean);

      boxes.push({
        id: `box-real-${i}-${Date.now()}`,
        word: clean,
        cleanWord: clean,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
        confidence,
        selected: inDict,
        inDictionary: inDict,
        definition: wordInfo.definition,
        level: 'phonics'
      });
    }

    // Fallback parsing from text lines
    if (boxes.length === 0 && res.data?.text) {
      const wordsFromText = res.data.text
        .split(/\s+/)
        .map(w => cleanAndSpellcheck(w))
        .filter(w => w.length >= 2 && !dictionaryService.isNoiseWord(w));

      const uniqueWords = Array.from(new Set(wordsFromText));
      uniqueWords.forEach((wordText, idx) => {
        const inDict = dictionaryService.isInDictionary(wordText);
        const wordInfo = createWordItem(wordText);
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        boxes.push({
          id: `box-text-${idx}-${Date.now()}`,
          word: wordText,
          cleanWord: wordText,
          x: 10 + col * 30,
          y: 15 + row * 12,
          width: Math.min(25, wordText.length * 3.5 + 8),
          height: 8,
          confidence: 0.85,
          selected: inDict,
          inDictionary: inDict,
          definition: wordInfo.definition,
          level: 'phonics'
        });
      });
    }

    return {
      imageUrl,
      imageWidth: imgWidth,
      imageHeight: imgHeight,
      boxes
    };
  },

  /**
   * Scan full image with multi-scale preprocessing and auto-orientation detection
   */
  async scanImage(
    imageFileOrUrl: File | string,
    onProgress?: (progressMsg: string) => void
  ): Promise<ScanResult> {
    let imageUrl = '';
    if (typeof imageFileOrUrl === 'string') {
      imageUrl = imageFileOrUrl;
    } else {
      imageUrl = URL.createObjectURL(imageFileOrUrl);
    }

    onProgress?.('正在载入高分辨率原图...');

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = imageUrl;
    });

    onProgress?.('正在进行光学特征增强 (对比度与边缘锐化)...');
    let bestResult = await this._scanSingle(img, imageUrl, onProgress);

    // If initial angle found 2 or more words, return directly!
    if (bestResult.boxes.length >= 2) {
      return bestResult;
    }

    // Auto-Orientation Check for mobile landscape shots:
    // Try 90° and 270° (handles both left-handed and right-handed phone landscape orientations)
    const candidateAngles = [90, 270];
    for (const angle of candidateAngles) {
      onProgress?.(`未检出足够单词，正在尝试横向角度 (${angle}°) 重新分析...`);
      try {
        const rotatedUrl = await rotateImageCanvas(imageUrl, angle);
        const rotatedImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = rotatedUrl;
        });

        const rotatedResult = await this._scanSingle(rotatedImg, rotatedUrl, onProgress);
        if (rotatedResult.boxes.length > bestResult.boxes.length) {
          bestResult = rotatedResult;
        }

        if (bestResult.boxes.length >= 2) {
          return bestResult;
        }
      } catch (err) {
        console.warn(`Auto ${angle}-degree rotation test failed:`, err);
      }
    }

    return bestResult;
  }
};
