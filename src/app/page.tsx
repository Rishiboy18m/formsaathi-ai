'use client';

import React, { useState } from 'react';
import { Language, Screen, AnalysisResult, DetectedField } from '@/types/form';
import { analyzeUploadedForm } from '@/services/form-analysis/analyzer';
import { generateSampleFormSvgDataUrl } from '@/utils/sampleFormGenerator';
import { Header } from '@/components/Header';
import { LanguageSelector } from '@/components/LanguageSelector';
import { FormTypeCard } from '@/components/FormTypeCard';
import { FileUploader } from '@/components/FileUploader';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { FormViewer } from '@/components/FormViewer';
import { GuidancePanel } from '@/components/GuidancePanel';
import { FieldList } from '@/components/FieldList';
import { EForm } from '@/components/EForm';
import { HelpModal } from '@/components/HelpModal';
import { ErrorMessage } from '@/components/ErrorMessage';
import { DebugPanel } from '@/components/DebugPanel';
import { ArrowLeft, Monitor, Terminal } from 'lucide-react';

export default function Home() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ta');
  const [currentScreen, setCurrentScreen] = useState<Screen>('language');
  const [pendingImage, setPendingImage] = useState<File | string | null>(null);
  const [pendingIsDemo, setPendingIsDemo] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(true);

  // Screen 3 -> Screen 4
  const handleStartAnalysis = (fileOrUrl: File | string, isDemo: boolean) => {
    setPendingImage(fileOrUrl);
    setPendingIsDemo(isDemo);
    setIsError(false);
    setCurrentScreen('analysis');
  };

  // Screen 4 -> Screen 5
  const handleAnalysisComplete = async () => {
    try {
      const source = pendingImage || generateSampleFormSvgDataUrl('account');
      const result = await analyzeUploadedForm(source, pendingIsDemo);

      if (!result || !result.detectedFields || result.detectedFields.length === 0) {
        setIsError(true);
        return;
      }

      setAnalysisResult(result);
      setSelectedFieldIndex(0);
      setCurrentScreen('guidance');
    } catch (err) {
      console.error('Analysis error:', err);
      setIsError(true);
    }
  };

  const selectedField: DetectedField | null =
    analysisResult && analysisResult.detectedFields[selectedFieldIndex]
      ? analysisResult.detectedFields[selectedFieldIndex]
      : null;

  const isEn = currentLanguage === 'en';

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Sticky Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Screen 1: Language Selection */}
        {currentScreen === 'language' && (
          <LanguageSelector
            selectedLanguage={currentLanguage}
            onSelectLanguage={setCurrentLanguage}
            onContinue={() => setCurrentScreen('form-type')}
          />
        )}

        {/* Screen 2: Choose Form Type */}
        {currentScreen === 'form-type' && (
          <FormTypeCard
            onSelectPhysical={() => setCurrentScreen('upload')}
            onSelectEForm={() => setCurrentScreen('eform')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Screen 3: Upload Physical Form */}
        {currentScreen === 'upload' && (
          <FileUploader onStartAnalysis={handleStartAnalysis} />
        )}

        {/* Screen 4: AI Analysis Loading Progress */}
        {currentScreen === 'analysis' && !isError && (
          <AnalysisProgress onComplete={handleAnalysisComplete} />
        )}

        {/* Error Failure Screen */}
        {isError && (
          <ErrorMessage
            onTryAgain={() => setCurrentScreen('analysis')}
            onUploadAnother={() => setCurrentScreen('upload')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Screen 5: AI Form Guidance (Two-Column Desktop / Stacked Mobile) */}
        {currentScreen === 'guidance' && analysisResult && !isError && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Toolbar / Field Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-teal-100 shadow-md">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentScreen('upload')}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-teal-50 hover:text-teal-800 text-xs font-bold transition-all flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Change Form' : 'வேறொரு படிவம்'}</span>
                </button>
                <span className="text-sm font-extrabold text-gray-900 truncate max-w-xs sm:max-w-md">
                  {analysisResult.formTitle}
                </span>
                {analysisResult.isDemo && (
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0">
                    Sample Demo Form
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDebugMode(!isDebugMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                    isDebugMode
                      ? 'bg-slate-900 text-emerald-400 border-slate-700'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                  }`}
                  title="Toggle Debug Console"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Debug Panel</span>
                </button>

                <button
                  onClick={() => setCurrentScreen('eform')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Monitor className="w-4 h-4" />
                  <span>{isEn ? '💻 Switch to E-Form' : '💻 E-Form-க்கு மாறவும்'}</span>
                </button>
              </div>
            </div>

            {/* Field Navigator Pill Scroller */}
            <FieldList
              fields={analysisResult.detectedFields}
              selectedIndex={selectedFieldIndex}
              onSelectIndex={setSelectedFieldIndex}
              currentLanguage={currentLanguage}
            />

            {/* Two-Column Guidance Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Uploaded Form with Bounding Box Highlights (7 cols) */}
              <div className="lg:col-span-7 h-full">
                <FormViewer
                  imageUrl={analysisResult.originalImageUrl}
                  detectedFields={analysisResult.detectedFields}
                  selectedField={selectedField}
                  onSelectField={(field) => {
                    const idx = analysisResult.detectedFields.findIndex(
                      (f) => f.fieldId === field.fieldId
                    );
                    if (idx !== -1) setSelectedFieldIndex(idx);
                  }}
                />
              </div>

              {/* Right Side: AI Form Assistant Guidance Panel (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <GuidancePanel
                  selectedField={selectedField}
                  currentLanguage={currentLanguage}
                />
              </div>

            </div>

            {/* Developer Debug Console Panel */}
            {isDebugMode && (
              <DebugPanel
                detectedFields={analysisResult.detectedFields}
                selectedField={selectedField}
                formTitle={analysisResult.formTitle}
                isDemo={analysisResult.isDemo}
              />
            )}

          </div>
        )}

        {/* Screen 6: Digital E-Form */}
        {currentScreen === 'eform' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentScreen('form-type')}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-800 text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEn ? 'Back' : 'திரும்பவும்'}</span>
              </button>
            </div>
            <EForm currentLanguage={currentLanguage} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-teal-800">FormSaathi AI</span>
            <span>{isEn ? '— AI Form Assistant' : '— தமிழ் AI படிவ வழிகாட்டி'}</span>
          </div>
          <p>© 2026 FormSaathi AI. Public Assistance Project.</p>
        </div>
      </footer>

      {/* User Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        currentLanguage={currentLanguage}
      />

    </div>
  );
}
