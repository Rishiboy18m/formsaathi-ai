'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { ChatMessage } from '@/types/form';
import knowledgeBaseData from '@/data/knowledge-base.json';

interface AskAIProps {
  isOpen: boolean;
  onClose: () => void;
  currentFieldName?: string;
}

export const AskAI: React.FC<AskAIProps> = ({
  isOpen,
  onClose,
  currentFieldName
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'வணக்கம்! நான் FormSaathi AI உதவியாளன். படிவம் நிரப்புவது குறித்து உங்களுடைய கேள்விகளை இங்கே கேட்கலாம்.',
      timestamp: 'இப்போது'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: 'இப்போது'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Query Knowledge Base matching
    setTimeout(() => {
      let responseText = "தயவுசெய்து இந்த தகவலை உங்கள் வங்கி அதிகாரியிடம் சரிபார்க்கவும். அதிகாரப்பூர்வ சான்றிதழில் உள்ள விவரங்களை மட்டும் படிவத்தில் நிரப்பவும்.";
      const queryLower = userText.toLowerCase();

      const fields = Object.values(knowledgeBaseData.fields);
      const matchedField = fields.find((f) =>
        f.labels.some((lbl) => queryLower.includes(lbl.toLowerCase())) ||
        queryLower.includes(f.canonicalName.toLowerCase()) ||
        queryLower.includes(f.tamilName.toLowerCase())
      );

      if (matchedField) {
        responseText = `${matchedField.tamilName} குறித்த விவரம்:\n\n📍 எங்கே கிடைக்கும்: ${matchedField.tamil.where}\n\n📝 என்ன எழுத வேண்டும்: ${matchedField.tamil.what}`;
      } else if (queryLower.includes('ifsc') || queryLower.includes('ஐஎப்எஸ்சி')) {
        responseText = "IFSC Code உங்கள் வங்கி பாஸ்புக்கின் முதல் பக்கத்தில் அல்லது காசோலைத் தாளில் (Cheque Book) அச்சிடப்பட்டிருக்கும். இது 11 இலக்க எழுத்தெண் குறியீடு ஆகும்.";
      } else if (queryLower.includes('aadhaar') || queryLower.includes('ஆதார்')) {
        responseText = "ஆதார் எண் உங்கள் ஆதார் அட்டையின் முன் பக்கத்தில் கீழே உள்ள 12 இலக்க எண் ஆகும்.";
      } else if (queryLower.includes('passbook') || queryLower.includes('பாஸ்புக்')) {
        responseText = "வங்கி பாஸ்புக்கின் முதல் பக்கத்தில் கணக்கு எண், IFSC code, வங்கியின் கிளை பெயர் மற்றும் உங்கள் முகவரி இருக்கும்.";
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: 'இப்போது'
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  const handleQuickQuestion = (qText: string) => {
    setInputQuery(qText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-teal-100 animate-in slide-in-from-right duration-300">
        
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-teal-700 to-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center space-x-2">
                <span>AI-யிடம் கேளுங்கள்</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-normal">Ask AI</span>
              </h3>
              <p className="text-xs text-teal-100">உடனடி தமிழ் விளக்கம்</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggested Questions */}
        <div className="bg-teal-50 border-b border-teal-100 p-3 overflow-x-auto flex space-x-2 no-scrollbar">
          <button
            onClick={() => handleQuickQuestion("IFSC code எங்கே இருக்கும்?")}
            className="px-3 py-1 bg-white border border-teal-200 text-teal-800 text-xs font-semibold rounded-full shrink-0 hover:bg-teal-100 transition-colors"
          >
            ❓ IFSC Code எங்கே இருக்கும்?
          </button>
          <button
            onClick={() => handleQuickQuestion("ஆதார் எண் எங்கே இருக்கும்?")}
            className="px-3 py-1 bg-white border border-teal-200 text-teal-800 text-xs font-semibold rounded-full shrink-0 hover:bg-teal-100 transition-colors"
          >
            ❓ ஆதார் எண் எங்கே இருக்கும்?
          </button>
          <button
            onClick={() => handleQuickQuestion("பாஸ்புக்கில் என்ன விவரங்கள் இருக்கும்?")}
            className="px-3 py-1 bg-white border border-teal-200 text-teal-800 text-xs font-semibold rounded-full shrink-0 hover:bg-teal-100 transition-colors"
          >
            ❓ பாஸ்புக் விவரங்கள்
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none font-normal'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="உங்கள் கேள்வியை தமிழில் கேட்கவும்..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-2xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
