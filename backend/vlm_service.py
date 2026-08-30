import io
import sys
import os
import json
import base64
import requests
from PIL import Image
import numpy as np
from ocr_service import ocr_engine

# Ensure UTF-8 output encoding on Windows
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
except Exception:
    pass

class VisionLanguageModelService:
    def __init__(self):
        self.name = "Real PaddleOCR Engine Pipeline"

    def process_form(self, image_bytes: bytes):
        """
        Main Analysis Gateway:
        Processes real uploaded form image using real PaddleOCR engine.
        Returns structured JSON with image_width, image_height, sections, and fields.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_width, img_height = image.size
        except Exception as err:
            return {
                "success": False,
                "error": f"Invalid image format: {str(err)}",
                "fields": []
            }

        # Run Real PaddleOCR Service
        ocr_res = ocr_engine.process_image(image_bytes)

        if not ocr_res.get("success"):
            return {
                "success": False,
                "error": ocr_res.get("error", "Could not analyze the form image with PaddleOCR."),
                "fields": []
            }

        ocr_items = ocr_res.get("ocr", [])
        sections = ["General Form Details"]

        formatted_fields = []
        for item in ocr_items:
            conf = float(item.get("confidence", 0.85))
            lBox = item.get("labelBoxPixel", {"x": 10, "y": 10, "width": 50, "height": 20})
            iBox = item.get("inputBoxPixel", {"x": 70, "y": 10, "width": 200, "height": 25})

            lBoxPercent = item.get("labelBoxPercent", {
                "x": round((lBox["x"] / img_width) * 100, 2),
                "y": round((lBox["y"] / img_height) * 100, 2),
                "width": round((lBox["width"] / img_width) * 100, 2),
                "height": round((lBox["height"] / img_height) * 100, 2)
            })

            iBoxPercent = item.get("inputBoxPercent", {
                "x": round((iBox["x"] / img_width) * 100, 2),
                "y": round((iBox["y"] / img_height) * 100, 2),
                "width": round((iBox["width"] / img_width) * 100, 2),
                "height": round((iBox["height"] / img_height) * 100, 2)
            })

            needs_verification = conf < 0.70

            formatted_fields.append({
                "field_id": item["text"].upper().replace(" ", "_"),
                "label": item["text"],
                "section": "General",
                "confidence": conf,
                "needs_verification": needs_verification,
                "label_box": lBox,
                "input_area": iBox,
                "label_box_percent": lBoxPercent,
                "input_area_percent": iBoxPercent,
                "labelBoxPixel": lBox,
                "inputBoxPixel": iBox,
                "labelBoxPercent": lBoxPercent,
                "inputBoxPercent": iBoxPercent,
                "text": item["text"],
                "box": item.get("box", [])
            })

        return {
            "success": True,
            "image_width": img_width,
            "image_height": img_height,
            "imageWidth": img_width,
            "imageHeight": img_height,
            "sections": sections,
            "fullText": ocr_res.get("fullText", ""),
            "fields": formatted_fields,
            "ocr": formatted_fields
        }

vlm_service = VisionLanguageModelService()
