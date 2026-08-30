import knowledgeBaseData from '@/data/knowledge-base.json';
import { KnowledgeField } from '@/types/form';

const knowledgeFields = knowledgeBaseData.fields as Record<string, KnowledgeField>;

export interface ValidationError {
  fieldId: string;
  messageTamil: string;
  messageEnglish: string;
}

export function validateFormField(
  fieldId: string,
  value: string
): { isValid: boolean; errorTamil?: string; errorEnglish?: string } {
  const kField = knowledgeFields[fieldId];
  if (!kField) {
    return { isValid: true };
  }

  const trimmed = (value || '').trim();

  // Check required
  if (kField.validation.required && !trimmed) {
    return {
      isValid: false,
      errorTamil: kField.validation.errorMessageTamil || "இந்த தகவலை நிரப்பவும்.",
      errorEnglish: kField.validation.errorMessageEnglish || "Please fill this field."
    };
  }

  // If empty and optional, it's valid
  if (!trimmed && !kField.validation.required) {
    return { isValid: true };
  }

  // Check pattern regex if present
  if (kField.validation.pattern && kField.validation.pattern !== '.*') {
    const cleanValue = trimmed.replace(/\s+/g, ''); // strip spaces for Aadhaar/Phone/IFSC regex checks
    const regex = new RegExp(kField.validation.pattern, 'i');
    const matches = regex.test(trimmed) || regex.test(cleanValue);

    if (!matches) {
      return {
        isValid: false,
        errorTamil: kField.validation.errorMessageTamil,
        errorEnglish: kField.validation.errorMessageEnglish
      };
    }
  }

  return { isValid: true };
}
