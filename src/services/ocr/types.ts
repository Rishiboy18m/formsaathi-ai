import { BoundingBox } from '@/types/form';

export interface RawOcrWord {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface RawOcrResult {
  fullText: string;
  words: RawOcrWord[];
  imageWidth?: number;
  imageHeight?: number;
  success: boolean;
  errorMessage?: string;
}

export interface OcrAdapter {
  name: string;
  processImage(imageSource: File | string): Promise<RawOcrResult>;
}
