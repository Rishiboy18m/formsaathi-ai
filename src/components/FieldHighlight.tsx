'use client';

import React from 'react';
import { DetectedField } from '@/types/form';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface FieldHighlightProps {
  field: DetectedField;
  isSelected: boolean;
  onSelect: (field: DetectedField) => void;
}

export const FieldHighlight: React.FC<FieldHighlightProps> = ({
  field,
  isSelected,
  onSelect
}) => {
  const { boundingBox, isLowConfidence, tamilName } = field;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(field);
      }}
      style={{
        left: `${boundingBox.x}%`,
        top: `${boundingBox.y}%`,
        width: `${boundingBox.width}%`,
        height: `${boundingBox.height}%`
      }}
      className={`absolute cursor-pointer transition-all duration-300 rounded-lg group ${
        isSelected
          ? 'ring-4 ring-emerald-500 bg-emerald-400/25 z-20 shadow-lg shadow-emerald-500/30 border-2 border-emerald-600'
          : isLowConfidence
          ? 'border-2 border-dashed border-amber-500 bg-amber-300/15 hover:bg-amber-300/30 z-10'
          : 'border-2 border-teal-500 bg-teal-300/15 hover:bg-teal-400/30 hover:border-teal-600 z-10'
      }`}
      title={`${tamilName} (Click to view guidance)`}
    >
      {/* Badge Tag */}
      <div
        className={`absolute -top-7 left-0 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center space-x-1 shadow-sm whitespace-nowrap transition-all ${
          isSelected
            ? 'bg-emerald-600 text-white shadow-md scale-105'
            : isLowConfidence
            ? 'bg-amber-500 text-white'
            : 'bg-teal-600 text-white opacity-90 group-hover:opacity-100'
        }`}
      >
        {isLowConfidence ? (
          <AlertTriangle className="w-3 h-3 text-amber-100" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        <span>{tamilName}</span>
      </div>
    </div>
  );
};
