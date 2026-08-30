import { OcrAdapter, RawOcrResult, RawOcrWord } from './types';

export class TesseractOcrAdapter implements OcrAdapter {
  name = 'Tesseract.js Real OCR Engine';

  async processImage(imageSource: File | string): Promise<RawOcrResult> {
    try {
      const Tesseract = await import('tesseract.js');

      let imageUrl: string;
      if (typeof imageSource === 'string') {
        imageUrl = imageSource;
      } else {
        imageUrl = URL.createObjectURL(imageSource);
      }

      // Measure exact image dimensions dynamically
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 1000 });
        img.onerror = () => resolve({ width: 800, height: 1000 });
        img.src = imageUrl;
      });

      const imgWidth = dimensions.width;
      const imgHeight = dimensions.height;

      // Run Tesseract recognition on actual image
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: () => {}
      });

      if (typeof imageSource !== 'string' && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }

      const words: RawOcrWord[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data as any;
      const lines = data.lines || data.blocks || [];

      // Extract lines/words with real bounding box coordinates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lines.forEach((line: any) => {
        const text = (line.text || '').trim();
        if (text.length > 1) {
          const bbox = line.bbox || { x0: 50, y0: 50, x1: 200, y1: 100 };
          
          const xPercent = Math.max(1, Math.min(95, Math.round((bbox.x0 / imgWidth) * 100)));
          const yPercent = Math.max(1, Math.min(95, Math.round((bbox.y0 / imgHeight) * 100)));
          const widthPercent = Math.max(5, Math.min(90, Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100)));
          const heightPercent = Math.max(2, Math.min(30, Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100)));

          words.push({
            text,
            confidence: Math.round(line.confidence || 85),
            boundingBox: {
              x: xPercent,
              y: yPercent,
              width: widthPercent,
              height: heightPercent
            }
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
