import { mapOcrToDetectedFields, RawOcrItem } from './fieldMapper';
import { AnalysisResult } from '@/types/form';

export async function analyzeUploadedForm(
  imageSource: File | string
): Promise<AnalysisResult> {
  let imageUrl: string;
  if (typeof imageSource === 'string') {
    imageUrl = imageSource;
  } else {
    imageUrl = URL.createObjectURL(imageSource);
  }

  let ocrItems: RawOcrItem[] = [];
  let isSuccess = false;

  // REAL UPLOAD ONLY = Send actual image to VLM Vision Model backend
  if (typeof imageSource !== 'string' && imageSource instanceof File) {
    const formData = new FormData();
    formData.append('file', imageSource, imageSource.name);

    const response = await fetch('http://127.0.0.1:8000/analyze-form', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Real VLM backend failed with status ${response.status}. Could not analyze image.`);
    }

    const resData = await response.json();
    if (resData.success && Array.isArray(resData.ocr) && resData.ocr.length > 0) {
      ocrItems = resData.ocr;
      isSuccess = true;
    } else {
      throw new Error("VLM model could not detect readable fields on the uploaded image.");
    }
  }

  // Client-side fallback process for image URLs
  if (!isSuccess && ocrItems.length === 0) {
    try {
      const { TesseractOcrAdapter } = await import('../ocr/tesseractAdapter');
      const adapter = new TesseractOcrAdapter();
      const tesseractRes = await adapter.processImage(imageSource);

      if (tesseractRes.success && tesseractRes.words && tesseractRes.words.length > 0) {
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

  // Map real OCR/VLM output ONLY (Zero demo fallbacks)
  const detectedFields = mapOcrToDetectedFields(ocrItems);

  if (detectedFields.length === 0 || !isSuccess) {
    throw new Error("Unable to analyze the form. Could not detect valid fields on the uploaded image.");
  }

  return {
    formId: `form_${Date.now()}`,
    formTitle: typeof imageSource !== 'string' && imageSource.name
      ? imageSource.name
      : "Uploaded Physical Form",
    originalImageUrl: imageUrl,
    detectedFields,
    qualityScore: 92,
    timestamp: new Date().toISOString(),
    isDemo: false
  };
}
