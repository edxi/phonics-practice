import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreen?: string;
  onScanClick?: () => void;
  onHomeClick?: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 py-0 sm:py-6 px-0 sm:px-4 flex items-center justify-center font-sans antialiased">
      {/* Phone Simulator Container */}
      <div className="w-full max-w-[440px] h-screen sm:h-[900px] sm:max-h-[92vh] bg-[#f8f7fe] sm:rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] sm:border-slate-800">
        
        {/* Status Bar (Simulated iOS) */}
        <div className="h-10 px-6 pt-3 flex items-center justify-between text-slate-800 text-xs font-semibold select-none z-30 shrink-0 bg-transparent">
          <span>9:41</span>
          {/* Dynamic Island / Notch */}
          <div className="w-24 h-4 bg-slate-800 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-1.5" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Scrollable Content View */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="h-4 flex items-center justify-center pb-1 shrink-0 bg-white/60 backdrop-blur-xs select-none">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
