import { mapOcrToDetectedFields, RawOcrItem } from './fieldMapper';
import { AnalysisResult } from '@/types/form';

export async function analyzeUploadedForm(
  imageSource: File | string,
  isDemo: boolean = false
): Promise<AnalysisResult> {
  let imageUrl: string;
  if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  } else {
    imageUrl = URL.createObjectURL(imageSource);
  }

  let ocrItems: RawOcrItem[] = [];
  let isSuccess = false;

  // 1. If DEMO MODE is explicitly selected by user
  if (isDemo) {
    const detectedFields = mapOcrToDetectedFields([], true);
    return {
      formId: `demo_form_${Date.now()}`,
      formTitle: "மாதிரி வங்கி படிவம் (Sample Demo Bank Form)",
      originalImageUrl: imageUrl,
      detectedFields,
      qualityScore: 95,
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  // 2. REAL UPLOAD = Send actual image to FastAPI PaddleOCR backend
  if (typeof imageSource !== 'string' && imageSource instanceof File) {
    try {
      const formData = new FormData();
      formData.append('file', imageSource, imageSource.name);

      const response = await fetch('http://127.0.0.1:8000/analyze-form', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && Array.isArray(resData.ocr)) {
          ocrItems = resData.ocr;
          isSuccess = true;
        }
      }
    } catch (backendErr) {
      console.warn('FastAPI PaddleOCR backend call error:', backendErr);
    }
  }

  // 3. Client-side Tesseract OCR fallback if backend unreachable
  if (ocrItems.length === 0) {
    try {
      const { TesseractOcrAdapter } = await import('../ocr/tesseractAdapter');
      const adapter = new TesseractOcrAdapter();
      const tesseractRes = await adapter.processImage(imageSource);

      if (tesseractRes.success && tesseractRes.words) {
        ocrItems = tesseractRes.words.map((w) => ({
          text: w.text,
          confidence: w.confidence / 100.0,
          boundingBoxPercent: w.boundingBox
        }));
        isSuccess = true;
      }
    } catch (clientOcrErr) {
      console.error('Client OCR error:', clientOcrErr);
    }
  }

  // 4. Map real OCR output to detected fields (NO MOCK FALLBACKS FOR REAL UPLOADS)
  const detectedFields = mapOcrToDetectedFields(ocrItems, false);

  if (detectedFields.length === 0 && !isSuccess) {
    throw new Error("Could not analyze the form. No text or fields detected.");
  }

  return {
    formId: `form_${Date.now()}`,
    formTitle: typeof imageSource !== 'string' && imageSource.name
      ? imageSource.name
      : "பதிவேற்றப்பட்ட படிவம் (Uploaded Physical Form)",
    originalImageUrl: imageUrl,
    detectedFields,
    qualityScore: isSuccess ? 92 : 60,
    timestamp: new Date().toISOString(),
    isDemo: false
  };
}
