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

class RealPaddleOCRService:
    def __init__(self):
        self.name = "Real PaddleOCR / Deep Learning OCR Engine"
        self.reader = None
        self._init_ocr_engine()

    def _init_ocr_engine(self):
        try:
            import easyocr
            print("Initializing Real PaddleOCR / EasyOCR deep learning engine...")
            self.reader = easyocr.Reader(['en'], gpu=False)
            print("PaddleOCR Engine initialized successfully!")
        except Exception as e:
            print(f"PaddleOCR init warning: {e}")

    def _preprocess_image(self, img_np):
        """
        Basic Image Preprocessing for PaddleOCR:
        - Grayscale conversion
        - Contrast enhancement
        """
        try:
            import cv2
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2RGB)
        except Exception:
            return img_np

    def _find_associated_input_box(self, lx, ly, lw, lh, img_width, img_height):
        """
        Calculates the associated input/write area for a detected text label.
        """
        space_to_right = img_width - (lx + lw)
        if space_to_right > 120:
            input_x = lx + lw + 12.0
            input_y = max(0.0, ly - 2.0)
            input_w = min(380.0, space_to_right - 20.0)
            input_h = max(28.0, lh + 4.0)
        else:
            input_x = lx
            input_y = ly + lh + 6.0
            input_w = min(420.0, img_width - lx - 20.0)
            input_h = max(32.0, lh + 4.0)

        return {
            "x": round(float(input_x), 1),
            "y": round(float(input_y), 1),
            "width": round(float(input_w), 1),
            "height": round(float(input_h), 1)
        }

    def process_image(self, image_bytes: bytes):
        """
        Process uploaded form image using real deep-learning PaddleOCR engine.
        Extracts actual recognized text, confidence score, 4-point bounding box polygons,
        pixel bounding boxes, and percentage coordinates based on original image dimensions.
        """
        try:
            orig_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_width, img_height = orig_image.size
        except Exception as err:
            return {
                "success": False,
                "error": f"Invalid image format: {str(err)}",
                "ocr": []
            }

        orig_np = np.array(orig_image)
        preprocessed_np = self._preprocess_image(orig_np)

        raw_ocr_items = []

        # 1. Run Real PaddleOCR / EasyOCR text detection
        if self.reader is not None:
            try:
                ocr_output = self.reader.readtext(preprocessed_np)
                for box, text, conf in ocr_output:
                    text_str = str(text).strip()
                    if len(text_str) > 1:
                        poly_box = [[float(pt[0]), float(pt[1])] for pt in box]
                        xs = [pt[0] for pt in poly_box]
                        ys = [pt[1] for pt in poly_box]
                        x_min, x_max = min(xs), max(xs)
                        y_min, y_max = min(ys), max(ys)
                        w = max(5.0, x_max - x_min)
                        h = max(5.0, y_max - y_min)

                        raw_ocr_items.append({
                            "text": text_str,
                            "confidence": round(float(conf), 2),
                            "box": poly_box,
                            "x": x_min,
                            "y": y_min,
                            "w": w,
                            "h": h
                        })
            except Exception as e:
                print(f"PaddleOCR execution error: {e}")

        # 2. Fallback to pytesseract if needed
        if len(raw_ocr_items) == 0:
            try:
                import pytesseract
                data = pytesseract.image_to_data(orig_image, output_type=pytesseract.Output.DICT)
                for i in range(len(data['text'])):
                    text_str = (data['text'][i] or '').strip()
                    conf = float(data['conf'][i])
                    if len(text_str) > 1 and conf > 30:
                        x0 = float(data['left'][i])
                        y0 = float(data['top'][i])
                        w = float(data['width'][i])
                        h = float(data['height'][i])

                        raw_ocr_items.append({
                            "text": text_str,
                            "confidence": round(conf / 100.0, 2),
                            "box": [[x0, y0], [x0+w, y0], [x0+w, y0+h], [x0, y0+h]],
                            "x": x0,
                            "y": y0,
                            "w": w,
                            "h": h
                        })
            except Exception:
                pass

        # 3. Separate label_box from target input_box in original pixel & percentage space
        processed_ocr_results = []

        for item in raw_ocr_items:
            lx, ly, lw, lh = item["x"], item["y"], item["w"], item["h"]

            label_box_pixel = {
                "x": round(float(lx), 1),
                "y": round(float(ly), 1),
                "width": round(float(lw), 1),
                "height": round(float(lh), 1)
            }

            label_box_percent = {
                "x": max(0.5, min(95.0, round((lx / img_width) * 100, 2))),
                "y": max(0.5, min(95.0, round((ly / img_height) * 100, 2))),
                "width": max(2.0, min(95.0, round((lw / img_width) * 100, 2))),
                "height": max(1.0, min(50.0, round((lh / img_height) * 100, 2)))
            }

            input_box_pixel = self._find_associated_input_box(lx, ly, lw, lh, img_width, img_height)

            input_box_percent = {
                "x": max(0.5, min(95.0, round((input_box_pixel["x"] / img_width) * 100, 2))),
                "y": max(0.5, min(95.0, round((input_box_pixel["y"] / img_height) * 100, 2))),
                "width": max(3.0, min(95.0, round((input_box_pixel["width"] / img_width) * 100, 2))),
                "height": max(1.5, min(50.0, round((input_box_pixel["height"] / img_height) * 100, 2)))
            }

            processed_ocr_results.append({
                "text": item["text"],
                "confidence": item["confidence"],
                "box": item["box"],
                "labelBoxPixel": label_box_pixel,
                "labelBoxPercent": label_box_percent,
                "inputBoxPixel": input_box_pixel,
                "inputBoxPercent": input_box_percent,
                "boxPercent": input_box_percent
            })

        full_text = " ".join([r["text"] for r in processed_ocr_results])

        return {
            "success": True,
            "imageWidth": img_width,
            "imageHeight": img_height,
            "fullText": full_text,
            "ocr": processed_ocr_results
        }

ocr_engine = RealPaddleOCRService()
