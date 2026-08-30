'use client';

import React from 'react';
import { Language } from '@/types/form';
import { AlertTriangle, RefreshCw, Upload } from 'lucide-react';

interface ErrorMessageProps {
  onTryAgain: () => void;
  onUploadAnother: () => void;
  currentLanguage?: Language;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  onTryAgain,
  onUploadAnother,
  currentLanguage = 'ta'
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-xl text-center space-y-6">
        
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-snug">
            {isEn
              ? 'Could not analyze the form image clearly.'
              : 'இந்த படிவத்தை தெளிவாக படிக்க முடியவில்லை.'}
          </h2>
          <p className="text-sm font-semibold text-red-700 mt-2">
            {isEn
              ? 'Please upload a clearer image or check lighting.'
              : 'Could not read the form clearly. Please upload a clearer image.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onTryAgain}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 text-white font-bold text-sm shadow-md hover:bg-teal-700 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isEn ? 'Try Again' : 'மீண்டும் முயற்சிக்கவும் (Try Again)'}</span>
          </button>

          <button
            onClick={onUploadAnother}
            className="w-full py-3.5 px-4 rounded-2xl bg-gray-100 text-gray-800 font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{isEn ? 'Upload Another Form' : 'வேறொரு படிவத்தை பதிவேற்றவும் (Upload Another Form)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
