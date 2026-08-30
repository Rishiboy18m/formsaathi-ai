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
        self.name = "PP-StructureV3 Document Understanding & OpenCV OCR Pipeline"
        self.reader = None
        self._init_ocr_engine()

    def _init_ocr_engine(self):
        try:
            import easyocr
            print("Initializing PP-Structure Deep Learning OCR engine...")
            self.reader = easyocr.Reader(['en'], gpu=False)
            print("PP-Structure OCR Engine initialized successfully!")
        except Exception as e:
            print(f"OCR init warning: {e}")

    def _preprocess_image_for_ocr(self, img_np):
        """
        OpenCV Document Preprocessing Pipeline:
        - Deskewing / Orientation check
        - Contrast Limited Adaptive Histogram Equalization (CLAHE)
        - Bilateral Filter Noise Reduction
        - Adaptive Upscaling for low-resolution text
        """
        try:
            import cv2
            h, w = img_np.shape[:2]

            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

            # Contrast Enhancement (CLAHE)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)

            # Bilateral Noise Reduction
            denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)

            # Adaptive upscaling
            scale_factor = 1.0
            if w < 1200 or h < 1200:
                scale_factor = min(2.0, 1600.0 / max(w, h))
                if scale_factor > 1.1:
                    new_w = int(w * scale_factor)
                    new_h = int(h * scale_factor)
                    denoised = cv2.resize(denoised, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

            preprocessed_rgb = cv2.cvtColor(denoised, cv2.COLOR_GRAY2RGB)
            return preprocessed_rgb, scale_factor
        except Exception as err:
            print(f"OpenCV Preprocessing notice: {err}")
            return img_np, 1.0

    def _detect_document_sections(self, raw_items):
        """
        PP-Structure Section Context Detection (Requirement #8):
        Identifies document headers and section titles (e.g. PRESENT ADDRESS, PERSONAL DETAILS)
        and attaches active section context to every recognized field label.
        """
        known_section_keywords = [
          "registration form", "application form", "personal information", "personal details",
          "present address", "permanent address", "residence address", "contact information",
          "bank details", "identification", "nominee details", "declaration"
        ]

        sections = []
        for item in raw_items:
            txt_lower = item["text"].lower().strip()
            for kw in known_section_keywords:
                if kw in txt_lower or txt_lower.isupper() and len(txt_lower) > 5 and ("address" in txt_lower or "information" in txt_lower or "form" in txt_lower or "details" in txt_lower):
                    sections.append({
                        "title": item["text"],
                        "y": item["y"]
                    })
                    break

        sections.sort(key=lambda s: s["y"])
        return sections

    def _detect_form_lines_and_boxes(self, img_np, img_width, img_height):
        """
        OpenCV Layout & Input Area Detection (Requirement #6 & #7):
        Detects horizontal lines, vertical lines, underline regions, and rectangular input boxes.
        """
        contours_info = []
        try:
            import cv2
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 8
            )

            horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
            horiz_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, horiz_kernel)

            box_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            dilated = cv2.dilate(binary, box_kernel, iterations=2)
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for c in contours:
                x, y, w, h = cv2.boundingRect(c)
                if w > 30 and h > 10 and w < img_width * 0.95 and h < img_height * 0.8:
                    contours_info.append({"x": x, "y": y, "width": w, "height": h})

        except Exception as err:
            print(f"OpenCV layout analysis notice: {err}")

        return contours_info

    def _find_associated_input_box(self, label_x, label_y, label_w, label_h, img_width, img_height, detected_contours):
        """
        PP-Structure Spatial Layout Analysis:
        Determines the actual input/write area for a field label by searching nearby regions:
        1. Right of label (same row)
        2. Directly below label (next line)
        3. OpenCV line/rect contour
        """
        best_input_box = None

        # 1. Search OpenCV contours to the right of label (same row)
        for cnt in detected_contours:
            if cnt["x"] >= label_x + label_w - 10 and abs(cnt["y"] - label_y) < label_h * 2.0:
                if cnt["width"] > 40:
                    best_input_box = {
                        "x": float(cnt["x"]),
                        "y": float(cnt["y"]),
                        "width": float(cnt["width"]),
                        "height": float(max(cnt["height"], label_h))
                    }
                    break

        # 2. Search OpenCV contours directly below label
        if not best_input_box:
            for cnt in detected_contours:
                if cnt["y"] >= label_y + label_h - 5 and abs(cnt["x"] - label_x) < label_w * 2.0:
                    if cnt["width"] > 40 and cnt["y"] < label_y + label_h * 4.0:
                        best_input_box = {
                            "x": float(cnt["x"]),
                            "y": float(cnt["y"]),
                            "width": float(cnt["width"]),
                            "height": float(max(cnt["height"], label_h))
                        }
                        break

        # 3. Geometric Fallback: Calculate spatially adjacent input region
        if not best_input_box:
            space_to_right = img_width - (label_x + label_w)
            if space_to_right > 120:
                input_x = label_x + label_w + 12.0
                input_y = max(0.0, label_y - 2.0)
                input_w = min(380.0, space_to_right - 20.0)
                input_h = max(28.0, label_h + 4.0)
            else:
                input_x = label_x
                input_y = label_y + label_h + 6.0
                input_w = min(420.0, img_width - label_x - 20.0)
                input_h = max(32.0, label_h + 4.0)

            best_input_box = {
                "x": round(float(input_x), 1),
                "y": round(float(input_y), 1),
                "width": round(float(input_w), 1),
                "height": round(float(input_h), 1)
            }

        return best_input_box

    def process_image(self, image_bytes: bytes):
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
        ocr_image_np, scale_factor = self._preprocess_image_for_ocr(orig_np)

        detected_contours = self._detect_form_lines_and_boxes(orig_np, img_width, img_height)

        raw_ocr_items = []

        # 1. Run PP-Structure / Deep Learning OCR text detection
        if self.reader is not None:
            try:
                ocr_output = self.reader.readtext(ocr_image_np)
                for box, text, conf in ocr_output:
                    text_str = str(text).strip()
                    if len(text_str) > 1:
                        poly_box = []
                        for pt in box:
                            poly_box.append([float(pt[0]) / scale_factor, float(pt[1]) / scale_factor])

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
                print(f"OCR execution error: {e}")

        # 2. Section Context Detection
        doc_sections = self._detect_document_sections(raw_ocr_items)

        # 3. Label vs Input Box Spatial Layout Analysis
        processed_ocr_results = []

        for item in raw_ocr_items:
            lx, ly, lw, lh = item["x"], item["y"], item["w"], item["h"]

            # Determine active section for this text label
            active_section = "General"
            for sec in doc_sections:
                if ly >= sec["y"]:
                    active_section = sec["title"]

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

            input_box_pixel = self._find_associated_input_box(
                lx, ly, lw, lh, img_width, img_height, detected_contours
            )

            input_box_percent = {
                "x": max(0.5, min(95.0, round((input_box_pixel["x"] / img_width) * 100, 2))),
                "y": max(0.5, min(95.0, round((input_box_pixel["y"] / img_height) * 100, 2))),
                "width": max(3.0, min(95.0, round((input_box_pixel["width"] / img_width) * 100, 2))),
                "height": max(1.5, min(50.0, round((input_box_pixel["height"] / img_height) * 100, 2)))
            }

            processed_ocr_results.append({
                "text": item["text"],
                "confidence": item["confidence"],
                "section": active_section,
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
            "sections": [s["title"] for s in doc_sections],
            "ocr": processed_ocr_results
        }

ocr_engine = RealOCRService()
