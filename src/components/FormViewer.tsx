'use client';

import React from 'react';
import { DetectedField } from '@/types/form';
import { FieldHighlight } from './FieldHighlight';
import { ZoomIn, Eye, Sparkles } from 'lucide-react';

interface FormViewerProps {
  imageUrl: string;
  detectedFields: DetectedField[];
  selectedField: DetectedField | null;
  onSelectField: (field: DetectedField) => void;
}

export const FormViewer: React.FC<FormViewerProps> = ({
  imageUrl,
  detectedFields,
  selectedField,
  onSelectField
}) => {
  return (
    <div className="bg-white rounded-3xl p-3 sm:p-6 border border-teal-100 shadow-xl flex flex-col h-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs sm:text-base">
            👁️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">அசல் படிவம் (Original Form)</h3>
            <p className="text-[11px] sm:text-xs text-gray-500">பச்சை நிறக் கட்டத்தைத் தொட்டு அறியலாம்</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full shrink-0">
          <Sparkles className="w-3 h-3 text-teal-600" />
          <span>{detectedFields.length} புலங்கள்</span>
        </div>
      </div>

      {/* Image Container with Canvas Bounding Boxes */}
      <div className="relative flex-1 min-h-[300px] sm:min-h-[500px] bg-slate-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group select-none touch-pan-x touch-pan-y">
        
        <div className="relative w-full h-full max-h-[450px] sm:max-h-[650px] flex items-center justify-center p-1 sm:p-2">
          <div className="relative inline-block max-w-full max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded Physical Form"
              className="w-full h-auto max-h-[440px] sm:max-h-[620px] object-contain rounded-lg shadow-sm"
            />

            {/* Absolute Bounding Box Overlays */}
            {detectedFields.map((field) => (
              <FieldHighlight
                key={field.fieldId}
                field={field}
                isSelected={selectedField?.fieldId === field.fieldId}
                onSelect={onSelectField}
              />
            ))}
          </div>
        </div>

        {/* Floating Hint Overlay */}
        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-xl flex items-center space-x-1 pointer-events-none">
          <ZoomIn className="w-3 h-3 text-teal-400" />
          <span>பச்சை கட்டங்களை தொடவும்</span>
        </div>

      </div>
    </div>
  );
};
