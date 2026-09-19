import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Sparkles, BookOpen, ArrowLeft, RefreshCw, FlipHorizontal, AlertCircle } from 'lucide-react';
import { ocrService, DEMO_PICTURE_BOOKS } from '../../services/ocrService';
import type { ScanResult } from '../../types/phonics';

interface CameraScannerProps {
  onBack: () => void;
  onScanComplete: (result: ScanResult) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onBack,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [useCameraStream, setUseCameraStream] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start real camera stream (if supported & HTTPS)
  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    try {
      setCameraError(null);
      // Stop previous tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setUseCameraStream(true);
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      setCameraError('已启用系统原生相机模式（点击快门直接拍照，无需网页权限）');
      setUseCameraStream(false);
    }
  };

  // Flip camera between back and front
  const toggleCameraFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Auto-attempt to start camera on mount
  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices?.getUserMedia?.({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    }).then((stream) => {
      if (!mounted) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setUseCameraStream(true);
    }).catch(() => {
      if (mounted) {
        setCameraError('已启用系统原生相机模式（免网页权限，直接高清拍摄）');
        setUseCameraStream(false);
      }
    });

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Demo scan selection
  const handleSelectDemo = (demoIndex: number) => {
    setIsScanning(true);
    setScanStatus('正在载入示例绘本...');
    setTimeout(() => {
      const res = ocrService.getDemoScan(demoIndex);
      setIsScanning(false);
      onScanComplete(res);
    }, 400);
  };

  // Upload photo from file input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanStatus('正在加载上传图片并自动矫正方向...');
    try {
      const res = await ocrService.scanImage(file, (msg) => {
        setScanStatus(msg);
      });
      setIsScanning(false);
      onScanComplete(res);
    } catch (err) {
      setIsScanning(false);
      console.error(err);
    }
  };

  // Capture real photo frame from camera stream or trigger native camera selector
  const handleSnap = async () => {
    const video = videoRef.current;

    if (useCameraStream && video && video.videoWidth > 0) {
      // Capture frame from active video focused on the central target box
      setIsScanning(true);
      setScanStatus('正在定格高清取景框画面...');

      const canvas = canvasRef.current || document.createElement('canvas');
      // Crop to central 80% width and 70% height to focus directly on the book/object
      const cropW = Math.round(video.videoWidth * 0.80);
      const cropH = Math.round(video.videoHeight * 0.70);
      const cropX = Math.round((video.videoWidth - cropW) / 2);
      const cropY = Math.round((video.videoHeight - cropH) / 2);

      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        try {
          const res = await ocrService.scanImage(dataUrl, (msg) => {
            setScanStatus(msg);
          });
          setIsScanning(false);
          onScanComplete(res);
          return;
        } catch (err) {
          console.error(err);
          setIsScanning(false);
        }
      }
    }

    // Native Camera Fallback: Triggers system camera without browser permission dialogs
    cameraInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden Native Camera & Album Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-100">
          拍照扫描绘本
        </span>
        <button
          onClick={() => handleSelectDemo(0)}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300"
        >
          示例扫描
        </button>
      </div>

      {/* Main Viewfinder Section */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {useCameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
              alt="Book Viewfinder"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}

        {/* Viewfinder Target Framing Box */}
        <div className="relative w-full max-w-xs h-80 rounded-3xl border-2 border-white/80 shadow-2xl overflow-hidden flex flex-col justify-between p-4 backdrop-blur-[1px] z-10">
          {/* Corner brackets */}
          <div className="flex justify-between">
            <div className="w-5 h-5 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
            <div className="w-5 h-5 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
          </div>

          {/* Fallback Clickable Shutter Prompt when Live Video Stream is Inactive */}
          {!useCameraStream ? (
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center text-center p-3 z-10 group active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-purple-600/50 border-2 border-purple-400 flex items-center justify-center mb-2.5 shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-bold text-white mb-1">
                点击打开手机相机拍照
              </span>
              <span className="text-[11px] text-purple-200 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700/50">
                免网页权限 · 原生高清对焦
              </span>
            </button>
          ) : (
            /* Animated Scanning Laser Line for Live Video */
            <div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-lg"
              style={{
                animation: 'scanLaser 2.2s infinite ease-in-out'
              }}
            />
          )}

          <div className="flex justify-between">
            <div className="w-5 h-5 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
            <div className="w-5 h-5 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
          </div>
        </div>

        {/* Camera mode alert / guidance */}
        {cameraError && (
          <div className="mt-3 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-1.5 z-10 max-w-xs text-center shadow-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-purple-400" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Guidance Tip */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-slate-300 border border-slate-700/60 z-10 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>对准英文绘本或物品标签，支持横拍自动矫正</span>
        </div>
      </div>

      {/* OCR Scanning Progress Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin flex items-center justify-center mb-4">
            <Camera className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">正在智能识别</h3>
          <p className="text-xs text-purple-300 text-center animate-pulse max-w-xs">
            {scanStatus || '正在分析图片中的英文单词与拼读结构...'}
          </p>
        </div>
      )}

      {/* Preset Picture Books Quick Switch */}
      <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-10">
        <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>📖 点击即刻试用绘本样本：</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {DEMO_PICTURE_BOOKS.map((b, i) => (
            <button
              key={b.id}
              onClick={() => handleSelectDemo(i)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-purple-300 shrink-0 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{b.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Shutter & Upload Controls */}
      <div className="p-5 bg-slate-950 flex items-center justify-around z-10 border-t border-slate-900">
        {/* Photo Album Upload */}
        <button
          onClick={() => albumInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">相册导入</span>
        </button>

        {/* Shutter Button (Capture) */}
        <button
          onClick={handleSnap}
          disabled={isScanning}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-purple-600 hover:bg-purple-500 active:scale-90 transition-all shadow-xl shadow-purple-900/50"
          aria-label="拍照"
        >
          {isScanning ? (
            <RefreshCw className="w-7 h-7 animate-spin text-white" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Native Camera Shortcut or Camera Switch */}
        {useCameraStream ? (
          <button
            onClick={toggleCameraFacing}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
            title="切换前后摄像头"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <FlipHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">切换镜头</span>
          </button>
        ) : (
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors active:scale-95"
            title="系统原生相机拍照"
          >
            <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-[11px] font-medium">系统拍照</span>
          </button>
        )}
      </div>
    </div>
  );
};
