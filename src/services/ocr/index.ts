import { OcrAdapter } from './types';
import { MockOcrAdapter } from './mockOcrAdapter';
import { TesseractOcrAdapter } from './tesseractAdapter';

export * from './types';
export * from './mockOcrAdapter';
export * from './tesseractAdapter';

export function getOcrAdapter(forceMock: boolean = false): OcrAdapter {
  if (forceMock) {
    return new MockOcrAdapter();
  }
  
  // Prefer Tesseract in browser runtime, fallback to Mock if errors occur
  if (typeof window !== 'undefined') {
    return new TesseractOcrAdapter();
  }
  
  return new MockOcrAdapter();
}
