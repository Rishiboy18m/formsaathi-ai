'use client';

import React from 'react';
import { Language, Screen } from '@/types/form';
import { Sparkles, Globe, HelpCircle, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentScreen,
  onNavigate,
  onOpenHelp
}) => {
  const showBack = currentScreen !== 'language' && currentScreen !== 'form-type';

  const handleBackClick = () => {
    if (currentScreen === 'guidance' || currentScreen === 'eform' || currentScreen === 'upload') {
      onNavigate('form-type');
    } else if (currentScreen === 'analysis') {
      onNavigate('upload');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Left: Logo & Title */}
        <div className="flex items-center space-x-3">
          {showBack && (
            <button
              onClick={handleBackClick}
              className="p-2 rounded-xl text-teal-700 hover:bg-teal-50 transition-colors focus:ring-2 focus:ring-teal-500"
              title="முந்தைய பக்கத்திற்குச் செல்லவும் (Back)"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigate('form-type')}
            className="flex items-center space-x-3 group text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-gray-900 tracking-tight">FormSaathi AI</span>
                <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  AI Form Assistant
                </span>
              </div>
              <p className="text-xs text-teal-600 font-medium hidden sm:block">
                {currentLanguage === 'ta' ? 'படிவ வழிகாட்டி உதவியாளர்' : 'Intelligent Form Helper'}
              </p>
            </div>
          </button>
        </div>

        {/* Right: Language Switcher & Help */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200">
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentLanguage === 'ta'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentLanguage === 'en'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-gray-600 hover:text-teal-700 hover:bg-teal-50 transition-colors border border-gray-200 sm:flex sm:items-center sm:space-x-1"
            title="உதவி (Help)"
          >
            <HelpCircle className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium hidden md:inline text-gray-700">உதவி</span>
          </button>
        </div>

      </div>
    </header>
  );
};
