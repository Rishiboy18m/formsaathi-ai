'use client';

import React, { useState } from 'react';
import { DetectedField, KnowledgeField } from '@/types/form';
import { VoiceButton } from './VoiceButton';
import { AskAI } from './AskAI';
import { Bot, MapPin, FileEdit, HelpCircle, AlertTriangle, Sparkles } from 'lucide-react';
import knowledgeBaseData from '@/data/knowledge-base.json';

interface GuidancePanelProps {
  selectedField: DetectedField | null;
}

const knowledgeFields = knowledgeBaseData.fields as Record<string, KnowledgeField>;

export const GuidancePanel: React.FC<GuidancePanelProps> = ({ selectedField }) => {
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);

  if (!selectedField) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-xl text-center space-y-4 flex flex-col justify-center items-center min-h-[400px]">
        <Bot className="w-12 h-12 text-teal-600 animate-pulse" />
        <h3 className="text-xl font-bold text-gray-900">புலத்தை தேர்ந்தெடுக்கவும்</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          படிவத்தில் உள்ள ஏதேனும் ஒரு பகுதியை அல்லது கீழே உள்ள பட்டியலில் உள்ள புலத்தைக் கிளிக் செய்யவும்.
        </p>
      </div>
    );
  }

  const kField = knowledgeFields[selectedField.fieldId];
  const isLowConfidence = selectedField.isLowConfidence || !kField || selectedField.confidenceLevel === 'Needs verification';

  // Text content to speak out loud
  const fullTextToSpeak = isLowConfidence
    ? "இந்த புலத்தை துல்லியமாக கண்டறிய முடியவில்லை. தயவுசெய்து சரிபார்க்கவும்."
    : `${selectedField.tamilName}. என்ன நிரப்ப வேண்டும்: ${kField.tamil.what} எங்கே கிடைக்கும்: ${kField.tamil.where} எங்கே எழுத வேண்டும்: ${kField.tamil.whereToWrite}`;

  const confidenceBadgeText = selectedField.confidenceLevel || (selectedField.confidence >= 85 ? 'High confidence' : selectedField.confidence >= 70 ? 'Medium confidence' : 'Needs verification');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-xl space-y-6 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-gray-900">🤖 AI படிவ உதவியாளர்</h2>
              </div>
              <p className="text-xs font-semibold text-teal-700">AI Form Assistant Guidance</p>
            </div>
          </div>

          <VoiceButton textToSpeak={fullTextToSpeak} />
        </div>

        {/* Selected Field Label Badge */}
        <div className="mt-4 p-3 bg-teal-50/80 rounded-2xl border border-teal-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs text-teal-700 font-semibold block">தேர்ந்தெடுக்கப்பட்ட பகுதி:</span>
              <span className="text-lg font-extrabold text-teal-950">
                {selectedField.tamilName} ({selectedField.canonicalName})
              </span>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
            confidenceBadgeText === 'High confidence'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : confidenceBadgeText === 'Medium confidence'
              ? 'bg-teal-100 text-teal-800 border-teal-300'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            {confidenceBadgeText}
          </span>
        </div>
      </div>

      {/* Main Guidance Sections */}
      {isLowConfidence ? (
        /* Low Confidence / Needs Verification Notice (Requirement #18) */
        <div className="p-5 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-amber-900 font-bold text-base">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <span>இந்த புலத்தை துல்லியமாக கண்டறிய முடியவில்லை. தயவுசெய்து சரிபார்க்கவும்.</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Unable to determine the exact input area. Please verify with official records before writing inside this box.
          </p>
        </div>
      ) : (
        <div className="space-y-4 my-2">
          
          {/* Section 1: WHAT (என்ன நிரப்ப வேண்டும்?) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 hover:border-teal-300 transition-colors">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <span className="text-base">📝</span>
              <h3>WHAT — என்ன நிரப்ப வேண்டும்?</h3>
            </div>
            <p className="text-base font-bold text-gray-900 pt-1 leading-snug">
              {kField.tamil.what}
            </p>
            <p className="text-xs text-gray-500 font-medium pt-0.5">
              {kField.english.what}
            </p>
          </div>

          {/* Section 2: WHERE (எங்கே கிடைக்கும்?) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 hover:border-teal-300 transition-colors">
            <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3>WHERE — எங்கே கிடைக்கும்?</h3>
            </div>
            <p className="text-base font-bold text-gray-900 pt-1 leading-snug">
              {kField.tamil.where}
            </p>
            <p className="text-xs text-gray-500 font-medium pt-0.5">
              {kField.english.where}
            </p>
          </div>

          {/* Section 3: WHERE TO WRITE (எங்கே எழுத வேண்டும்?) */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1 hover:border-emerald-400 transition-colors">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <FileEdit className="w-4 h-4 text-emerald-700" />
              <h3>🟢 WHERE TO WRITE — எங்கே எழுத வேண்டும்?</h3>
            </div>
            <p className="text-base font-bold text-emerald-950 pt-1 leading-snug">
              {kField.tamil.whereToWrite}
            </p>
            <p className="text-xs text-emerald-800 font-medium pt-0.5">
              {kField.english.whereToWrite}
            </p>
          </div>

        </div>
      )}

      {/* Footer Action: Ask AI Button */}
      <div className="pt-2">
        <button
          onClick={() => setIsAskAiOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-teal-900 font-bold text-sm hover:bg-teal-100 transition-all flex items-center justify-center space-x-2 shadow-sm"
        >
          <HelpCircle className="w-5 h-5 text-teal-600" />
          <span>❓ AI-யிடம் கேளுங்கள் (Ask AI Question)</span>
        </button>
      </div>

      {/* Ask AI Drawer Modal */}
      <AskAI
        isOpen={isAskAiOpen}
        onClose={() => setIsAskAiOpen(false)}
        currentFieldName={selectedField.tamilName}
      />

    </div>
  );
};
