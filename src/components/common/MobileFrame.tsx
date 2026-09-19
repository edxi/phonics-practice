import React from 'react';

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
      <div className="w-full max-w-[440px] h-[100dvh] sm:h-[900px] sm:max-h-[92vh] bg-[#f8f7fe] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border-[8px] sm:border-slate-800 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* Scrollable Content View */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>
      </div>
    </div>
  );
};
