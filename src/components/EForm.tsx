'use client';

import React, { useState } from 'react';
import { KnowledgeField } from '@/types/form';
import { validateFormField } from '@/utils/validation';
import { createSpeechRecognizer, speakTamilText } from '@/utils/speech';
import { VoiceButton } from './VoiceButton';
import { Mic, MicOff, CheckCircle2, AlertCircle, Sparkles, Send, ArrowRight } from 'lucide-react';
import knowledgeBaseData from '@/data/knowledge-base.json';

const knowledgeFields = knowledgeBaseData.fields as Record<string, KnowledgeField>;

export const EForm: React.FC = () => {
  const fieldList = Object.values(knowledgeFields);

  const [formValues, setFormValues] = useState<Record<string, string>>({
    FULL_NAME: '',
    ACCOUNT_NUMBER: '',
    AADHAAR_NUMBER: '',
    DATE_OF_BIRTH: '',
    PHONE_NUMBER: '',
    IFSC_CODE: '',
    PAN_NUMBER: '',
    ADDRESS: '',
    GENDER: 'ஆண் (Male)',
    PIN_CODE: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [listeningFieldId, setListeningFieldId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleInputChange = (fieldId: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: val }));

    // Clear error on change if fixed
    if (errors[fieldId]) {
      const result = validateFormField(fieldId, val);
      if (result.isValid) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    }
  };

  const handleVoiceInput = (fieldId: string) => {
    if (listeningFieldId === fieldId) {
      setListeningFieldId(null);
      return;
    }

    setListeningFieldId(fieldId);

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setFormValues((prev) => ({ ...prev, [fieldId]: transcript }));
        setListeningFieldId(null);
      },
      () => {
        setListeningFieldId(null);
      }
    );

    if (recognizer) {
      recognizer.start();
    } else {
      alert('உங்கள் உலாவியில் குரல் உள்ளீடு (Voice Input) வசதி கிடைக்கவில்லை. தட்டச்சு செய்யலாம்.');
      setListeningFieldId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    for (const field of fieldList) {
      const val = formValues[field.id] || '';
      const result = validateFormField(field.id, val);
      if (!result.isValid) {
        newErrors[field.id] = result.errorTamil || 'இந்த தகவலை நிரப்பவும்.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true);
      speakTamilText('உங்கள் மின்னணு படிவம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நன்றி!');
    } else {
      speakTamilText('சில தகவல்கள் தவறாக உள்ளன. சிவப்பு நிறத்தில் உள்ள பகுதிகளை சரிபார்க்கவும்.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>மின்னணு படிவம் (Interactive Digital Form)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          💻 E-Form நிரப்புதல்
        </h1>
        <p className="text-sm text-gray-600">
          Fill the form digitally with Tamil guidance and optional voice input
        </p>
      </div>

      {submitted ? (
        /* Submission Success Box */
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              படிவம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!
            </h2>
            <p className="text-base text-emerald-700 font-semibold mt-1">
              Your digital form has been submitted successfully.
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl text-left border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <p className="font-bold">சமர்ப்பிக்கப்பட்ட விவரங்கள்:</p>
            <ul className="space-y-1 text-gray-700">
              <li>• முழு பெயர்: {formValues.FULL_NAME || 'ARUN KUMAR'}</li>
              <li>• கணக்கு எண்: {formValues.ACCOUNT_NUMBER || '50100293847561'}</li>
              <li>• ஆதார் எண்: {formValues.AADHAAR_NUMBER || '4321 8765 9012'}</li>
              <li>• தொலைபேசி: {formValues.PHONE_NUMBER || '9876543210'}</li>
            </ul>
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="py-3.5 px-8 rounded-2xl bg-teal-600 text-white font-bold text-base shadow-md hover:bg-teal-700 transition-all"
          >
            மீண்டும் நிரப்பவும் (Fill Another Form)
          </button>
        </div>
      ) : (
        /* Form Card */
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-xl space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldList.map((field) => {
              const val = formValues[field.id] || '';
              const err = errors[field.id];
              const isListening = listeningFieldId === field.id;

              return (
                <div key={field.id} className="space-y-2">
                  
                  {/* Label Row */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-bold text-gray-900 text-base block">
                        {field.tamilName}
                        {field.validation.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <span className="text-xs text-gray-500 font-medium">
                        {field.canonicalName}
                      </span>
                    </div>

                    <VoiceButton textToSpeak={`${field.tamilName}. ${field.tamil.where}`} />
                  </div>

                  {/* Input field with Voice Input Button */}
                  <div className="relative flex items-center">
                    {field.inputType === 'select' ? (
                      <select
                        value={val}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 ${
                          err ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.inputType === 'textarea' ? (
                      <textarea
                        value={val}
                        rows={2}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 ${
                          err ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                      />
                    ) : (
                      <input
                        type={field.inputType}
                        value={val}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 pr-12 rounded-2xl border text-sm font-semibold focus:outline-none focus:ring-2 ${
                          err ? 'border-red-400 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
                        }`}
                      />
                    )}

                    {field.inputType !== 'select' && (
                      <button
                        type="button"
                        onClick={() => handleVoiceInput(field.id)}
                        className={`absolute right-3 p-2 rounded-xl transition-all ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'text-teal-600 hover:bg-teal-50'
                        }`}
                        title="குரல் மூலம் உள்ளிடவும் (Voice Input)"
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Guidance Hint */}
                  <p className="text-xs text-teal-800 bg-teal-50/70 p-2.5 rounded-xl border border-teal-100">
                    📍 <span className="font-semibold">{field.tamil.where}</span>
                  </p>

                  {/* Validation Error Message */}
                  {err && (
                    <div className="flex items-center space-x-1.5 text-xs text-red-600 font-bold pt-0.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{err}</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-teal-600/30 hover:from-teal-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>படிவத்தை சமர்ப்பிக்கவும் (Submit E-Form)</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
