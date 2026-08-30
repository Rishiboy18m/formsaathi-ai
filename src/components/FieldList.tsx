'use client';

import React from 'react';
import { DetectedField } from '@/types/form';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Circle } from 'lucide-react';

interface FieldListProps {
  fields: DetectedField[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export const FieldList: React.FC<FieldListProps> = ({
  fields,
  selectedIndex,
  onSelectIndex
}) => {
  if (fields.length === 0) return null;

  const currentField = fields[selectedIndex];

  return (
    <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-md space-y-3">
      
      {/* Navigation Controls Row */}
      <div className="flex items-center justify-between">
        
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-gray-900 text-sm">புலங்கள் (Fields):</span>
          <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
            {selectedIndex + 1} / {fields.length} fields
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSelectIndex(Math.max(0, selectedIndex - 1))}
            disabled={selectedIndex === 0}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 disabled:hover:bg-transparent transition-all flex items-center space-x-1 text-xs font-bold"
            title="Previous Field"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">முந்தைய</span>
          </button>

          <button
            onClick={() => onSelectIndex(Math.min(fields.length - 1, selectedIndex + 1))}
            disabled={selectedIndex === fields.length - 1}
            className="p-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 disabled:opacity-40 transition-all flex items-center space-x-1 shadow-sm"
            title="Next Field"
          >
            <span className="hidden sm:inline">அடுத்தது</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Pill Scroller */}
      <div className="flex space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
        {fields.map((field, idx) => {
          const isSelected = idx === selectedIndex;
          const isLow = field.isLowConfidence;

          return (
            <button
              key={field.fieldId}
              onClick={() => onSelectIndex(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1.5 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 scale-[1.02]'
                  : isLow
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-teal-50 hover:border-teal-300'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : isLow ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-teal-600" />
              )}
              <span className="truncate max-w-[120px]">{field.tamilName}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
