import React from 'react';
import type { StepType } from '../../types/phonics';

interface StepProgressBarProps {
  currentStep: StepType;
  onStepChange: (step: StepType) => void;
  completedSteps?: StepType[];
}

interface StepItem {
  key: StepType;
  label: string;
  name: string;
}

const STEPS: StepItem[] = [
  { key: 'learn', label: '学', name: '自然拼读' },
  { key: 'read', label: '读', name: '朗读评测' },
  { key: 'quiz', label: '选', name: '听音辨词' },
  { key: 'split', label: '拆', name: '音节切分' },
  { key: 'blend', label: '拼', name: '拼读积木' },
  { key: 'write', label: '写', name: '听音默写' },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepChange,
  completedSteps = [],
}) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full px-5 py-2.5 bg-white/70 backdrop-blur-xs border-y border-purple-50/80">
      <div className="relative flex items-center justify-between">
        {/* Connecting background track line */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 z-0" />
        
        {/* Progress highlight line */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-[2px] bg-[#6d54f5] z-0 transition-all duration-300"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 90}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isActive = step.key === currentStep;
          const isCompleted = completedSteps.includes(step.key) || idx < currentIndex;

          return (
            <button
              key={step.key}
              onClick={() => onStepChange(step.key)}
              className="relative z-10 flex flex-col items-center group focus:outline-hidden"
              title={step.name}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-200 shadow-xs ${
                  isActive
                    ? 'bg-[#6d54f5] text-white scale-110 ring-4 ring-purple-200/80'
                    : isCompleted
                    ? 'bg-purple-100 text-[#6d54f5] border border-purple-300'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {step.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
