'use client';

import React, { useState } from 'react';
import { DetectedField } from '@/types/form';
import { Terminal, ChevronDown, ChevronUp, Code, Check } from 'lucide-react';

interface DebugPanelProps {
  detectedFields: DetectedField[];
  selectedField: DetectedField | null;
  formTitle: string;
  isDemo?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  detectedFields,
  selectedField,
  formTitle,
  isDemo
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-4 shadow-xl border border-slate-800 font-mono text-xs space-y-3">
      
      {/* Toggle Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-bold text-teal-400 hover:text-teal-300 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>🛠️ PaddleOCR Debug Console ({detectedFields.length} Detected Regions)</span>
          <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-normal">
            {isDemo ? 'Demo Mode' : 'Live Real OCR'}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-400 font-normal">
            {isOpen ? 'Collapse' : 'Expand Details'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 font-semibold mb-1">📄 Form Title & Source:</p>
              <p className="text-emerald-300 font-bold bg-slate-950 p-2 rounded-xl border border-slate-800 truncate">
                {formTitle}
              </p>
            </div>

            <div>
              <p className="text-slate-400 font-semibold mb-1">🎯 Currently Selected Field:</p>
              <p className="text-amber-300 font-bold bg-slate-950 p-2 rounded-xl border border-slate-800 truncate">
                {selectedField ? `${selectedField.canonicalName} [ID: ${selectedField.fieldId}]` : 'None'}
              </p>
            </div>
          </div>

          {/* Table of all detected text regions */}
          <div>
            <p className="text-slate-400 font-semibold mb-2">🔍 Detected OCR Bounding Box Table:</p>
            <div className="overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-800 text-slate-300 sticky top-0">
                  <tr>
                    <th className="p-2">Field ID</th>
                    <th className="p-2">OCR Raw Text</th>
                    <th className="p-2">Confidence</th>
                    <th className="p-2">Bounding Box (x, y, w, h %)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {detectedFields.map((f) => {
                    const isSelected = selectedField?.fieldId === f.fieldId;
                    return (
                      <tr
                        key={f.fieldId}
                        className={isSelected ? 'bg-teal-950/70 text-emerald-300 font-bold' : 'hover:bg-slate-900'}
                      >
                        <td className="p-2 font-mono">{f.fieldId}</td>
                        <td className="p-2 text-slate-200">{f.rawText || f.canonicalName}</td>
                        <td className="p-2 font-bold">{f.confidence}%</td>
                        <td className="p-2 text-emerald-400 font-mono">
                          x:{f.boundingBox.x}% y:{f.boundingBox.y}% w:{f.boundingBox.width}% h:{f.boundingBox.height}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
