'use client';

import React from 'react';
import { FileText, Monitor, ArrowRight, Camera, Sparkles } from 'lucide-react';

interface FormTypeCardProps {
  onSelectPhysical: () => void;
  onSelectEForm: () => void;
}

export const FormTypeCard: React.FC<FormTypeCardProps> = ({
  onSelectPhysical,
  onSelectEForm
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Page Title */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>வழிகாட்டுதல் முறையை தேர்வு செய்யவும்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          உங்களுக்கு தேவையான படிவ வகை எது?
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto">
          Choose how you would like FormSaathi AI to assist you with your form.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Card 1: Physical Form */}
        <div 
          onClick={onSelectPhysical}
          className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-100 shadow-xl hover:shadow-2xl hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📄</span>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                  Physical Form
                </h2>
              </div>
              <p className="text-lg font-semibold text-teal-800 mt-2">
                படிவத்தின் புகைப்படத்தை பதிவேற்றவும்
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Upload or scan a physical paper form
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-2">
                <span className="text-teal-500 font-bold">✓</span>
                <span>காகித படிவத்தில் எங்கு எழுதுவது என பச்சை நிறத்தில் காட்டும்</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-teal-500 font-bold">✓</span>
                <span>பாஸ்புக் / ஆதாரில் தகவலை எங்கு காண்பது என விளக்கும்</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPhysical();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-md group-hover:bg-teal-700 transition-all flex items-center justify-center space-x-2"
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
          className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-100 shadow-xl hover:shadow-2xl hover:border-teal-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
              <Monitor className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💻</span>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  E-Form
                </h2>
              </div>
              <p className="text-lg font-semibold text-emerald-800 mt-2">
                மின்னணு படிவத்தை நிரப்பவும்
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Fill the form digitally with Tamil audio & voice input
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pt-2 border-t border-gray-100">
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>குரல் மூலம் (Voice Input) நேரடியாக பதில் அளிக்கலாம்</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>தவறான உள்ளீடுகளுக்கு உடனடியாக சரிபார்க்கும் வசதி</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectEForm();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-base shadow-md group-hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
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
