'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Circle } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete: () => void;
}

interface Step {
  id: number;
  labelTamil: string;
  labelEnglish: string;
}

const STAGES: Step[] = [
  { id: 1, labelTamil: 'ஆவணத்தைப் பதிவேற்றுகிறது (Uploading...)', labelEnglish: 'Uploading image to backend' },
  { id: 2, labelTamil: 'PaddleOCR உரையைப் படிக்கிறது (Running PaddleOCR...)', labelEnglish: 'Running real OCR text recognition' },
  { id: 3, labelTamil: 'தகவல் புலங்களை அடையாளம் காணுதல் (Detecting fields...)', labelEnglish: 'Mapping field bounding box coordinates' },
  { id: 4, labelTamil: 'தமிழ் வழிகாட்டுதலை தயாரித்தல் (Preparing Tamil guidance...)', labelEnglish: 'Fetching trusted Tamil explanations' }
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(20);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStep(2);
      setProgressPercent(45);
    }, 500);

    const timer2 = setTimeout(() => {
      setCurrentStep(3);
      setProgressPercent(75);
    }, 1100);

    const timer3 = setTimeout(() => {
      setCurrentStep(4);
      setProgressPercent(95);
    }, 1700);

    const timer4 = setTimeout(() => {
      setProgressPercent(100);
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-teal-100 p-6 sm:p-8 text-center space-y-6">
        
        {/* Animated AI Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-3xl bg-teal-400/30 animate-ping" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/40">
            <Sparkles className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            உங்கள் படிவத்தை AI பகுப்பாய்வு செய்கிறது...
          </h2>
          <p className="text-sm font-semibold text-teal-700 mt-1">
            Running PaddleOCR & AI Field Detection...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5 border border-gray-200">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-semibold px-1">
            <span>PaddleOCR Analysis</span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3 pt-2 text-left">
          {STAGES.map((stage) => {
            const isDone = stage.id < currentStep || (stage.id === 4 && progressPercent === 100);
            const isCurrent = stage.id === currentStep && progressPercent < 100;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all ${
                  isDone
                    ? 'bg-teal-50/70 border-teal-200 text-teal-900'
                    : isCurrent
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm'
                    : 'bg-gray-50/50 border-gray-200 text-gray-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                )}

                <div className="flex-1 truncate">
                  <p className="text-sm font-bold truncate">
                    {isDone ? '✓ ' : isCurrent ? '● ' : '○ '} {stage.labelTamil}
                  </p>
                  <p className="text-xs text-gray-500 opacity-80">{stage.labelEnglish}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
