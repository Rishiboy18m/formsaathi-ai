'use client';

import React from 'react';
import { Language } from '@/types/form';
import { Check, Languages, ArrowRight, Sparkles } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onContinue: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  onContinue
}) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-teal-100 p-6 sm:p-8 text-center space-y-6">
        
        {/* Icon & Title */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <Languages className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            உங்களுக்கு விருப்பமான மொழியை தேர்வு செய்யவும்
          </h1>
          <p className="text-base text-teal-700 font-medium mt-2">
            Choose your preferred language
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 pt-2">
          {/* Tamil Option */}
          <button
            onClick={() => onSelectLanguage('ta')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
              selectedLanguage === 'ta'
                ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                selectedLanguage === 'ta' ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-300'
              }`}>
                {selectedLanguage === 'ta' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">தமிழ்</p>
                <p className="text-xs text-gray-500">Tamil (முதன்மை மொழி)</p>
              </div>
            </div>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              Recommended
            </span>
          </button>

          {/* English Option */}
          <button
            onClick={() => onSelectLanguage('en')}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
              selectedLanguage === 'en'
                ? 'border-teal-600 bg-teal-50/80 shadow-md ring-2 ring-teal-500/20'
                : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                selectedLanguage === 'en' ? 'bg-teal-600 border-teal-600 text-white' : 'border-gray-300'
              }`}>
                {selectedLanguage === 'en' && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900">English</p>
                <p className="text-xs text-gray-500">ஆங்கிலம் (ஆங்கில குறிப்புடன்)</p>
              </div>
            </div>
          </button>
        </div>

        {/* Info Note */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start space-x-2 text-left">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            தமிழ் முதன்மை மொழியாகவும், ஆங்கிலம் குறிப்புக்காகவும் காட்டப்படும்.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-teal-600/30 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
        >
          <span>தொடரவும்</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
