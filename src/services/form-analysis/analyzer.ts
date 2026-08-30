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

  // REAL UPLOAD = Send image to Next.js API route (/api/analyze-form)
  if (fileToUpload) {
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload, fileToUpload.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

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
      console.warn('Real VLM API route call failed or timed out:', backendErr);
    }
  }

  // Client-side Tesseract OCR fallback if backend unreachable
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

  // Map real OCR/VLM output
  const detectedFields = mapOcrToDetectedFields(ocrItems, false);

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
