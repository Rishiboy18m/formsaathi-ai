import { mapOcrToDetectedFields, RawOcrItem } from './fieldMapper';
import { AnalysisResult } from '@/types/form';
import { compressImageForUpload } from '@/utils/imageCompressor';
import { generateSampleFormSvgDataUrl } from '@/utils/sampleFormGenerator';
import { TesseractOcrAdapter, ExtendedOcrItem } from '../ocr/tesseractAdapter';

export async function analyzeUploadedForm(
  imageSource: File | string,
  isDemo: boolean = false
): Promise<AnalysisResult> {
  let imageUrl: string;
  let fileToProcess: File | string = imageSource;

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
      fileToProcess = await compressImageForUpload(imageSource);
      imageUrl = URL.createObjectURL(fileToProcess);
    } catch {
      fileToProcess = imageSource;
      imageUrl = URL.createObjectURL(imageSource);
    }
  }

  let ocrItems: RawOcrItem[] = [];
  let isSuccess = false;

  // 2. REAL TESSERACT.JS OCR EXECUTION ON UPLOADED IMAGE
  try {
    const tesseractAdapter = new TesseractOcrAdapter();
    const tesseractRes = await tesseractAdapter.processImage(fileToProcess);

    if (tesseractRes.success && tesseractRes.words && tesseractRes.words.length > 0) {
      ocrItems = (tesseractRes.words as ExtendedOcrItem[]).map((item) => ({
        text: item.text,
        confidence: item.confidence / 100.0,
        labelBoxPercent: item.labelBoxPercent || item.boundingBox,
        inputBoxPercent: item.inputBoxPercent || item.boundingBox,
        boundingBoxPercent: item.boundingBox
      }));
      isSuccess = true;
    }
  } catch (tesseractErr) {
    console.warn('Tesseract.js OCR execution error:', tesseractErr);
  }

  // 3. Optional VLM API Route fallback if Tesseract returned zero results
  if (!isSuccess && ocrItems.length === 0 && typeof imageSource !== 'string' && imageSource instanceof File) {
    try {
      const formData = new FormData();
      formData.append('file', imageSource, imageSource.name);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

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
        }
      }
    } catch (apiErr) {
      console.warn('API route fallback notice:', apiErr);
    }
  }

  // Map real Tesseract.js OCR output to knowledge base fields & separate input areas
  const detectedFields = mapOcrToDetectedFields(ocrItems, false);

  if (detectedFields.length === 0 || !isSuccess) {
    throw new Error("Unable to analyze the form with Tesseract.js. Could not detect valid text fields on the uploaded image.");
  }

  return {
    formId: `form_${Date.now()}`,
    formTitle: typeof imageSource !== 'string' && imageSource.name
      ? imageSource.name
      : "Uploaded Physical Form (Tesseract.js Test)",
    originalImageUrl: imageUrl,
    detectedFields,
    qualityScore: isSuccess ? 88 : 50,
    timestamp: new Date().toISOString(),
    isDemo: false
  };
}
