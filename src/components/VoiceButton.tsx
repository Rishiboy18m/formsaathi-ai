'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakTamilText, stopSpeech } from '@/utils/speech';
import { Language } from '@/types/form';

interface VoiceButtonProps {
  textToSpeak: string;
  currentLanguage?: Language;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ textToSpeak, currentLanguage = 'ta' }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isEn = currentLanguage === 'en';

  const handleToggleSpeak = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const success = speakTamilText(textToSpeak, () => {
        setIsPlaying(false);
      });
      if (!success) {
        setIsPlaying(false);
      }
    }
  };

  return (
    <button
      onClick={handleToggleSpeak}
      className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 transition-all shadow-sm ${
        isPlaying
          ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
          : 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95 shadow-teal-600/20'
      }`}
      title={isEn ? 'Listen to Guidance Aloud' : 'தமிழ் விளக்கத்தை கேட்டு அறியவும் (Listen Aloud)'}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>{isEn ? 'Stop' : 'நிறுத்து (Stop)'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{isEn ? '🔊 Listen' : '🔊 கேட்டு அறியவும் (Listen)'}</span>
        </>
      )}
    </button>
  );
};
