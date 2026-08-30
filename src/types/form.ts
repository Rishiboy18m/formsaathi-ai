export type Language = 'ta' | 'en';

export type Screen = 
  | 'language' 
  | 'form-type' 
  | 'upload' 
  | 'analysis' 
  | 'guidance' 
  | 'eform';

export type FormType = 'physical' | 'eform';

export interface BoundingBox {
  x: number;      // Percentage 0-100 from left
  y: number;      // Percentage 0-100 from top
  width: number;  // Percentage 0-100 width
  height: number; // Percentage 0-100 height
}

export interface KnowledgeField {
  id: string;
  canonicalName: string;
  tamilName: string;
  labels: string[];
  tamil: {
    what: string;
    where: string;
    whereToWrite: string;
  };
  english: {
    what: string;
    where: string;
    whereToWrite: string;
  };
  sampleValue: string;
  inputType: 'text' | 'tel' | 'email' | 'date' | 'select' | 'textarea';
  options?: string[];
  placeholder?: string;
  validation: {
    required: boolean;
    pattern?: string;
    errorMessageTamil: string;
    errorMessageEnglish: string;
  };
}

export interface DetectedField {
  fieldId: string;
  canonicalName: string;
  tamilName: string;
  confidence: number;
  confidenceLevel?: 'High confidence' | 'Medium confidence' | 'Needs verification';
  boundingBox: BoundingBox;      // Target write area highlight (inputBox)
  labelBox?: BoundingBox;        // Label position
  inputBox?: BoundingBox;        // Writable input area position
  isLowConfidence?: boolean;
  rawText?: string;
  userValue?: string;
}

export interface AnalysisResult {
  formId: string;
  formTitle: string;
  originalImageUrl: string;
  detectedFields: DetectedField[];
  qualityScore: number;
  timestamp: string;
  isDemo?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
