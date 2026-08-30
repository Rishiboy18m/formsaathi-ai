import { OcrAdapter, RawOcrResult, RawOcrWord } from './types';
import { BoundingBox } from '@/types/form';

export interface ExtendedOcrItem extends RawOcrWord {
  labelBoxPixel?: { x: number; y: number; width: number; height: number };
  inputBoxPixel?: { x: number; y: number; width: number; height: number };
  labelBoxPercent?: BoundingBox;
  inputBoxPercent?: BoundingBox;
}

export class TesseractOcrAdapter implements OcrAdapter {
  name = 'Tesseract.js Client-Side Real OCR Engine';

  private preprocessCanvas(img: HTMLImageElement, width: number, height: number): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return img.src;

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Grayscale + Contrast Enhancement + Binarization
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        // Contrast enhancement
        let factor = 1.3 * (avg - 128) + 128;
        factor = Math.max(0, Math.min(255, factor));
        // Simple binarization threshold
        const finalVal = factor > 140 ? 255 : 0;

        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL('image/png');
    } catch {
      return img.src;
    }
  }

  async processImage(imageSource: File | string): Promise<RawOcrResult> {
    try {
      const Tesseract = await import('tesseract.js');

      let imageUrl: string;
      if (typeof imageSource === 'string') {
        imageUrl = imageSource;
      } else {
        imageUrl = URL.createObjectURL(imageSource);
      }

      // 1. Measure image dimensions & create preprocessed canvas image
      const preprocessedInfo = await new Promise<{ url: string; width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const w = img.naturalWidth || 800;
          const h = img.naturalHeight || 1000;
          const processedUrl = this.preprocessCanvas(img, w, h);
          resolve({ url: processedUrl, width: w, height: h });
        };
        img.onerror = () => resolve({ url: imageUrl, width: 800, height: 1000 });
        img.src = imageUrl;
      });

      const { url: processedUrl, width: imgWidth, height: imgHeight } = preprocessedInfo;

      // 2. Run Tesseract.js real recognition using English ('eng') language data
      const result = await Tesseract.recognize(processedUrl, 'eng', {
        logger: () => {}
      });

      if (typeof imageSource !== 'string' && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }

      const words: ExtendedOcrItem[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      const lines = data.lines || data.blocks || [];

      // 3. Extract text, confidence, label_box, and compute spatial input_area
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lines.forEach((line: any) => {
        const text = (line.text || '').trim();
        if (text.length > 1) {
          const bbox = line.bbox || { x0: 50, y0: 50, x1: 200, y1: 100 };
          const x0 = bbox.x0;
          const y0 = bbox.y0;
          const w = Math.max(10, bbox.x1 - bbox.x0);
          const h = Math.max(10, bbox.y1 - bbox.y0);

          // Label Box in Pixel space
          const labelBoxPixel = { x: x0, y: y0, width: w, height: h };

          // Label Box in Percentage space
          const labelBoxPercent: BoundingBox = {
            x: maxMin(0.5, 95, (x0 / imgWidth) * 100),
            y: maxMin(0.5, 95, (y0 / imgHeight) * 100),
            width: maxMin(2, 95, (w / imgWidth) * 100),
            height: maxMin(1, 50, (h / imgHeight) * 100)
          };

          // Spatial Input Area calculation (Right of label or below label)
          let inputX = x0;
          let inputY = y0;
          let inputW = 350;
          let inputH = Math.max(28, h + 4);

          const spaceToRight = imgWidth - (x0 + w);
          if (spaceToRight > 120) {
            inputX = x0 + w + 12;
            inputY = Math.max(0, y0 - 2);
            inputW = Math.min(380, spaceToRight - 20);
          } else {
            inputX = x0;
            inputY = y0 + h + 6;
            inputW = Math.min(420, imgWidth - x0 - 20);
          }

          const inputBoxPixel = { x: inputX, y: inputY, width: inputW, height: inputH };
          const inputBoxPercent: BoundingBox = {
            x: maxMin(0.5, 95, (inputX / imgWidth) * 100),
            y: maxMin(0.5, 95, (inputY / imgHeight) * 100),
            width: maxMin(3, 95, (inputW / imgWidth) * 100),
            height: maxMin(1.5, 50, (inputH / imgHeight) * 100)
          };

          words.push({
            text,
            confidence: Math.round(line.confidence || 85),
            boundingBox: inputBoxPercent, // Target input area highlight
            labelBoxPixel,
            inputBoxPixel,
            labelBoxPercent,
            inputBoxPercent
          });
        }
      });

      return {
        success: true,
        fullText: result.data.text,
        words,
        imageWidth: imgWidth,
        imageHeight: imgHeight
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Tesseract OCR execution failed';
      return {
        success: false,
        fullText: '',
        words: [],
        errorMessage
      };
    }
  }
}

function maxMin(min: number, max: number, val: number): number {
  return Math.max(min, Math.min(max, Math.round(val * 100) / 100));
}
