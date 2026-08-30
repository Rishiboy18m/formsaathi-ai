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
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-teal-100 shadow-xl flex flex-col h-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            👁️
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">அசல் படிவம் (Original Form)</h3>
            <p className="text-xs text-gray-500">பச்சை நிறக் கட்டத்தைக் கிளிக் செய்து அறியலாம்</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{detectedFields.length} புலங்கள் கண்டறியப்பட்டன</span>
        </div>
      </div>

      {/* Image Container with Canvas Bounding Boxes */}
      <div className="relative flex-1 min-h-[400px] sm:min-h-[500px] bg-slate-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center group select-none">
        
        <div className="relative w-full h-full max-h-[650px] flex items-center justify-center p-2">
          <div className="relative inline-block max-w-full max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded Physical Form"
              className="w-full h-auto max-h-[620px] object-contain rounded-lg shadow-sm"
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
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-teal-400" />
          <span>படத்தின் மீதுள்ள பச்சை கட்டங்களை தொடவும்</span>
        </div>

      </div>
    </div>
  );
};
