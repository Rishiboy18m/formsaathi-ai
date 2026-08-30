'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, FileText, X, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { generateSampleFormSvgDataUrl } from '@/utils/sampleFormGenerator';

interface FileUploaderProps {
  onStartAnalysis: (fileOrUrl: File | string, isDemo: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onStartAnalysis }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        setErrorMsg('தயவுசெய்து பட கோப்பை (JPG/PNG) அல்லது PDF கோப்பை தேர்ந்தெடுக்கவும்.');
        return;
      }
      setErrorMsg(null);
      setSelectedFile(file);
      setIsDemo(false);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLoadSampleForm = () => {
    const sampleUrl = generateSampleFormSvgDataUrl('account');
    setSelectedFile(null);
    setPreviewUrl(sampleUrl);
    setIsDemo(true);
    setErrorMsg(null);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDemo(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (previewUrl) {
      onStartAnalysis(selectedFile || previewUrl, isDemo);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-12">
      
      {/* Title */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          படிவத்தின் புகைப்படத்தை பதிவேற்றவும்
        </h1>
        <p className="text-xs sm:text-base text-gray-600">
          Upload or scan your physical paper form for AI analysis
        </p>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-8 border border-teal-100 shadow-xl space-y-5 sm:space-y-6">
        
        {/* File Input Hidden (Standard file picker) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="form-file-input"
        />

        {/* Camera Input Hidden (Direct native camera access on mobile) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          id="form-camera-input"
        />

        {/* Action Buttons Grid */}
        {!previewUrl ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Take Photo (Mobile Camera Trigger) */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/70 hover:bg-teal-100/80 transition-all text-center flex sm:flex-col items-center justify-center space-x-3 sm:space-x-0 sm:space-y-2 active:scale-98 min-h-[56px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left sm:text-center">
                <span className="font-bold text-gray-900 text-sm block">📷 Take Photo</span>
                <span className="text-xs text-teal-700">மொபைல் கேமரா (Camera)</span>
              </div>
            </button>

            {/* Upload Image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/40 hover:bg-teal-100/60 transition-all text-center flex sm:flex-col items-center justify-center space-x-3 sm:space-x-0 sm:space-y-2 active:scale-98 min-h-[56px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left sm:text-center">
                <span className="font-bold text-gray-900 text-sm block">📁 Upload Image</span>
                <span className="text-xs text-gray-500">படத்தை தேர்வு செய்யவும்</span>
              </div>
            </button>

            {/* Upload PDF */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/40 hover:bg-teal-100/60 transition-all text-center flex sm:flex-col items-center justify-center space-x-3 sm:space-x-0 sm:space-y-2 active:scale-98 min-h-[56px]"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left sm:text-center">
                <span className="font-bold text-gray-900 text-sm block">📄 Upload PDF</span>
                <span className="text-xs text-gray-500">PDF ஆவணம்</span>
              </div>
            </button>

          </div>
        ) : (
          /* Preview Section */
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-3 truncate">
                <FileText className="w-6 h-6 text-teal-600 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {selectedFile ? selectedFile.name : 'மாதிரி வங்கி படிவம் (Sample Bank Form.svg)'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isDemo ? 'Demo Mode Sample Form' : selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRemove}
                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center max-h-[350px] sm:max-h-[450px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded form preview"
                className="max-h-[350px] sm:max-h-[450px] w-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Demo Mode Button Option */}
        {!previewUrl && (
          <div className="pt-1">
            <button
              onClick={handleLoadSampleForm}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100/70 transition-all flex items-center justify-between text-left active:scale-98"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold">மாதிரி படிவத்துடன் சோதிக்கவும் (Demo Mode)</p>
                  <p className="text-[11px] sm:text-xs text-amber-700">Try instant analysis with pre-loaded Tamil/English bank form</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                Sample
              </span>
            </button>
          </div>
        )}

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Privacy Message */}
        <div className="bg-teal-50/70 border border-teal-200/60 rounded-2xl p-3.5 sm:p-4 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-teal-900">
            <p className="font-bold">உங்கள் ஆவணம் பாதுகாப்பாக கையாளப்படும்.</p>
            <p className="text-teal-700 text-[11px] sm:text-xs mt-0.5">
              Your document is handled securely. Real uploaded files are processed in-memory and are never stored permanently.
            </p>
          </div>
        </div>

        {/* Submit Analyze Button */}
        {previewUrl && (
          <button
            onClick={handleAnalyze}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-teal-600/30 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Analyze Form (பகுப்பாய்வு செய்)</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        )}

      </div>
    </div>
  );
};
