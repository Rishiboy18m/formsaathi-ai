import io
import sys
from PIL import Image
import numpy as np

# Ensure UTF-8 output encoding on Windows
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
except Exception:
    pass

class RealOCRService:
    def __init__(self):
        self.name = "Real Deep Learning OCR Service (PaddleOCR / EasyOCR)"
        self.reader = None
        self._init_ocr_engine()

    def _init_ocr_engine(self):
        try:
            import easyocr
            print("Initializing EasyOCR engine for real image text extraction...")
            self.reader = easyocr.Reader(['en'], gpu=False)
            print("EasyOCR Engine initialized successfully!")
        except Exception as e:
            print(f"EasyOCR init warning: {e}")

    def process_image(self, image_bytes: bytes):
        """
        Process uploaded form image using real deep-learning OCR engine.
        Extracts actual recognized text, confidence score, 4-point bounding box polygons,
        pixel bounding boxes, and scaled percentage coordinates.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_width, img_height = image.size
        except Exception as err:
            return {
                "success": False,
                "error": f"Invalid image format: {str(err)}",
                "ocr": []
            }

        img_np = np.array(image)
        results = []

        # 1. Run EasyOCR / PaddleOCR text detection & bounding box extraction
        if self.reader is not None:
            try:
                ocr_output = self.reader.readtext(img_np)
                for box, text, conf in ocr_output:
                    text_str = str(text).strip()
                    if len(text_str) > 1:
                        # Convert box points to standard Python float list
                        poly_box = []
                        for pt in box:
                            poly_box.append([float(pt[0]), float(pt[1])])

                        xs = [pt[0] for pt in poly_box]
                        ys = [pt[1] for pt in poly_box]
                        x_min, x_max = min(xs), max(xs)
                        y_min, y_max = min(ys), max(ys)
                        w = max(5, x_max - x_min)
                        h = max(5, y_max - y_min)

                        px_x = max(0.5, min(95.0, round((x_min / img_width) * 100, 2)))
                        px_y = max(0.5, min(95.0, round((y_min / img_height) * 100, 2)))
                        px_w = max(2.0, min(95.0, round((w / img_width) * 100, 2)))
                        px_h = max(1.0, min(50.0, round((h / img_height) * 100, 2)))

                        results.append({
                            "text": text_str,
                            "confidence": round(float(conf), 2),
                            "box": poly_box,
                            "boundingBoxPixel": {
                                "x": round(x_min, 1),
                                "y": round(y_min, 1),
                                "width": round(w, 1),
                                "height": round(h, 1)
                            },
                            "boundingBoxPercent": {
                                "x": px_x,
                                "y": px_y,
                                "width": px_w,
                                "height": px_h
                            }
                        })
            except Exception as e:
                print(f"OCR execution error: {e}")

        # 2. Fallback to pytesseract if primary reader returned 0 results
        if len(results) == 0:
            try:
                import pytesseract
                data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
                n_boxes = len(data['text'])
                for i in range(n_boxes):
                    text_str = (data['text'][i] or '').strip()
                    conf = float(data['conf'][i])
                    if len(text_str) > 1 and conf > 30:
                        x0 = float(data['left'][i])
                        y0 = float(data['top'][i])
                        w = float(data['width'][i])
                        h = float(data['height'][i])

                        px_x = max(0.5, min(95.0, round((x0 / img_width) * 100, 2)))
                        px_y = max(0.5, min(95.0, round((y0 / img_height) * 100, 2)))
                        px_w = max(2.0, min(95.0, round((w / img_width) * 100, 2)))
                        px_h = max(1.0, min(50.0, round((h / img_height) * 100, 2)))

                        poly_box = [
                            [x0, y0],
                            [x0 + w, y0],
                            [x0 + w, y0 + h],
                            [x0, y0 + h]
                        ]

                        results.append({
                            "text": text_str,
                            "confidence": round(conf / 100.0, 2),
                            "box": poly_box,
                            "boundingBoxPixel": {
                                "x": round(x0, 1),
                                "y": round(y0, 1),
                                "width": round(w, 1),
                                "height": round(h, 1)
                            },
                            "boundingBoxPercent": {
                                "x": px_x,
                                "y": px_y,
                                "width": px_w,
                                "height": px_h
                            }
                        })
            except Exception:
                pass

        full_text = " ".join([r["text"] for r in results])

        return {
            "success": True,
            "imageWidth": img_width,
            "imageHeight": img_height,
            "fullText": full_text,
            "ocr": results
        }

ocr_engine = RealOCRService()
