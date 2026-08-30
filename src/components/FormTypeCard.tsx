'use client';

import React from 'react';
import { Language } from '@/types/form';
import { FileText, Monitor, ArrowRight, Camera, Sparkles } from 'lucide-react';

interface FormTypeCardProps {
  onSelectPhysical: () => void;
  onSelectEForm: () => void;
  currentLanguage?: Language;
}

export const FormTypeCard: React.FC<FormTypeCardProps> = ({
  onSelectPhysical,
  onSelectEForm,
  currentLanguage = 'ta'
}) => {
  const isEn = currentLanguage === 'en';

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
      
      {/* Page Title */}
      <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-10">
        <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>{isEn ? 'Select Assistance Mode' : 'வழிகாட்டுதல் முறையை தேர்வு செய்யவும்'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
          {isEn ? 'Which type of form do you need help with?' : 'உங்களுக்கு தேவையான படிவ வகை எது?'}
        </h1>
        <p className="text-xs sm:text-base text-gray-600 max-w-xl mx-auto">
          {isEn
            ? 'Choose how you would like FormSaathi AI to assist you with your form.'
            : 'Choose how you would like FormSaathi AI to assist you with your form.'}
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
        
        {/* Card 1: Physical Form */}
        <div 
          onClick={onSelectPhysical}
          className="group relative bg-white rounded-3xl p-5 sm:p-8 border-2 border-teal-100 shadow-xl hover:shadow-2xl hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between active:scale-98"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">📄</span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                  Physical Form
                </h2>
              </div>
              <p className="text-base sm:text-lg font-semibold text-teal-800 mt-1.5">
                {isEn ? 'Upload or scan a physical paper form' : 'படிவத்தின் புகைப்படத்தை பதிவேற்றவும்'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isEn ? 'படிவத்தின் புகைப்படத்தை பதிவேற்றவும்' : 'Upload or scan a physical paper form'}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-2">
                <span className="text-teal-500 font-bold">✓</span>
                <span>{isEn ? 'Highlights exact input area where you should write' : 'காகித படிவத்தில் எங்கு எழுதுவது என பச்சை நிறத்தில் காட்டும்'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-teal-500 font-bold">✓</span>
                <span>{isEn ? 'Explains where to find info on Passbook or Aadhaar' : 'பாஸ்புக் / ஆதாரில் தகவலை எங்கு காண்பது என விளக்கும்'}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 sm:mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPhysical();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 text-white font-bold text-sm sm:text-base shadow-md group-hover:bg-teal-700 transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Upload / Scan Form</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Card 2: E-Form */}
        <div 
          onClick={onSelectEForm}
          className="group relative bg-white rounded-3xl p-5 sm:p-8 border-2 border-teal-100 shadow-xl hover:shadow-2xl hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between active:scale-98"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
              <Monitor className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">💻</span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  E-Form
                </h2>
              </div>
              <p className="text-base sm:text-lg font-semibold text-emerald-800 mt-1.5">
                {isEn ? 'Fill the form digitally with voice input' : 'மின்னணு படிவத்தை நிரப்பவும்'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isEn ? 'மின்னணு படிவத்தை நிரப்பவும்' : 'Fill the form digitally with Tamil audio & voice input'}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{isEn ? 'Speak answers directly via Voice Input' : 'குரல் மூலம் (Voice Input) நேரடியாக பதில் அளிக்கலாம்'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{isEn ? 'Real-time format validation and hints' : 'தவறான உள்ளீடுகளுக்கு உடனடியாக சரிபார்க்கும் வசதி'}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 sm:mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectEForm();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-md group-hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
            >
              <Monitor className="w-5 h-5" />
              <span>Start E-Form</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
