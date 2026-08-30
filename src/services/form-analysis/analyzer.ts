import { mapOcrToDetectedFields, RawOcrItem } from './fieldMapper';
import { AnalysisResult } from '@/types/form';
import { compressImageForUpload } from '@/utils/imageCompressor';
import { generateSampleFormSvgDataUrl } from '@/utils/sampleFormGenerator';

export async function analyzeUploadedForm(
  imageSource: File | string,
  isDemo: boolean = false
): Promise<AnalysisResult> {
  let imageUrl: string;
  let fileToUpload: File | null = null;

  // 1. DEMO MODE
  if (isDemo) {
    const sampleUrl = typeof imageSource === 'string' ? imageSource : generateSampleFormSvgDataUrl('account');
    const detectedFields = mapOcrToDetectedFields([], true);
    return {
      formId: `demo_form_${Date.now()}`,
      formTitle: "மாதிரி வங்கி படிவம் (Sample Demo Bank Form)",
      originalImageUrl: sampleUrl,
      detectedFields,
      qualityScore: 95,
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  } else {
    try {
      fileToUpload = await compressImageForUpload(imageSource);
      imageUrl = URL.createObjectURL(fileToUpload);
    } catch {
      fileToUpload = imageSource;
      imageUrl = URL.createObjectURL(imageSource);
    }
  }

  let ocrItems: RawOcrItem[] = [];
  let isSuccess = false;

  // 2. REAL PADDLEOCR BACKEND PIPELINE
  if (fileToUpload) {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload, fileToUpload.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const response = await fetch('/api/analyze-form', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && Array.isArray(resData.ocr) && resData.ocr.length > 0) {
          ocrItems = resData.ocr;
          isSuccess = true;
        } else if (resData.success && Array.isArray(resData.fields) && resData.fields.length > 0) {
          ocrItems = resData.fields;
          isSuccess = true;
        }
      }
    } catch (backendErr) {
      console.warn('Real PaddleOCR backend request failed:', backendErr);
    }
  }

  // 3. Map real PaddleOCR output ONLY (Zero demo fallbacks for real uploads)
  const detectedFields = mapOcrToDetectedFields(ocrItems, false);

  if (detectedFields.length === 0 || !isSuccess) {
    throw new Error("Unable to analyze the form with PaddleOCR. Could not detect readable fields on the uploaded image. Please ensure the form is well-lit and clear.");
  }

  return {
    formId: `form_${Date.now()}`,
    formTitle: typeof imageSource !== 'string' && imageSource.name
      ? imageSource.name
      : "Uploaded Physical Form (PaddleOCR Analysis)",
    originalImageUrl: imageUrl,
    detectedFields,
    qualityScore: 90,
    timestamp: new Date().toISOString(),
    isDemo: false
  };
}
