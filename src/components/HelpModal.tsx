'use client';

import React from 'react';
import { Language } from '@/types/form';
import { X, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage?: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, currentLanguage = 'ta' }) => {
  if (!isOpen) return null;
  const isEn = currentLanguage === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-teal-100 space-y-6 relative animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {isEn ? 'FormSaathi AI Help' : 'FormSaathi AI உதவி'}
            </h2>
            <p className="text-xs text-teal-700 font-semibold">User Guidance & Help</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
            <p className="font-bold text-teal-900">
              {isEn ? '1. Physical Form Assistance:' : '1. Physical Form (காகித படிவம்):'}
            </p>
            <p className="text-xs text-teal-800">
              {isEn
                ? 'Upload or take a photo of your paper form. AI detects the layout, highlights where to write, and explains where to find details on your passbook or Aadhaar card.'
                : 'உங்கள் படிவத்தைப் படம் பிடித்துப் பதிவேற்றுங்கள். AI அதில் உள்ள தகவல்களைப் படித்து, எங்கு எழுத வேண்டும், பாஸ்புக்கில் எங்கு தகவலைக் காண்பது என விளக்கும்.'}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
            <p className="font-bold text-emerald-900">
              {isEn ? '2. Digital E-Form:' : '2. E-Form (மின்னணு படிவம்):'}
            </p>
            <p className="text-xs text-emerald-800">
              {isEn
                ? 'Fill out forms digitally with voice dictation input and real-time guidance.'
                : 'நேரடியாக உங்கள் போன்/கணினியில் படிவத்தை நிரப்பலாம். குரல் மூலம் (Voice Input) பேசியும் உள்ளிடலாம்.'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <p className="font-bold text-gray-900">
              {isEn ? '3. Audio Assistance:' : '3. குரல் உதவி (TTS Audio):'}
            </p>
            <p className="text-xs text-gray-600">
              {isEn
                ? 'Tap the 🔊 Listen button to have explanations read out loud in your preferred language.'
                : '""🔊 கேட்டு அறியவும்"" பொத்தானை அழுத்தினால் விளக்கம் தமிழில் வாசித்துக்காட்டப்படும்.'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-md hover:bg-teal-700 transition-all"
        >
          {isEn ? 'Got It' : 'சரி, புரிந்து கொண்டேன் (Got It)'}
        </button>

      </div>
    </div>
  );
};
