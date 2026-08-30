import io
import sys
import os
import json
import base64
import requests
from PIL import Image
import numpy as np

# Ensure UTF-8 output encoding on Windows
try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
except Exception:
    pass

class VisionLanguageModelService:
    def __init__(self):
        self.name = "Qwen2.5-VL / Vision-Language Model Serverless Pipeline"
        self.modal_endpoint = os.environ.get("MODAL_ENDPOINT")
        self.model_api_key = os.environ.get("MODEL_API_KEY")

    def _process_with_opencv_layout(self, image_bytes: bytes, img_width: int, img_height: int):
        """
        OpenCV Layout & Input Area Fallback Engine:
        Analyzes document layout, section context, and separates labelBox from target inputBox.
        """
        try:
            from ocr_service import ocr_engine
            return ocr_engine.process_image(image_bytes)
        except Exception as e:
            print("Layout Engine notice:", e)
            return {"success": False, "error": str(e), "ocr": []}

    def process_form(self, image_bytes: bytes):
        """
        Main VLM Analysis Gateway (Requirements #5, #6, #8, #9):
        Sends image to VLM serverless GPU endpoint or processes layout analysis.
        Returns structured JSON with image_width, image_height, sections, and fields
        where label_box and input_area are separated!
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

        # 1. If Serverless GPU Modal endpoint is configured
        if self.modal_endpoint:
            try:
                base64_str = base64.b64encode(image_bytes).decode('utf-8')
                resp = requests.post(
                    self.modal_endpoint,
                    json={"image": base64_str},
                    headers={"Authorization": f"Bearer {self.model_api_key}"} if self.model_api_key else {},
                    timeout=30
                )
                if resp.ok:
                    res_json = resp.json()
                    if res_json.get("success") and "result" in res_json:
                        vlm_res = res_json["result"]
                        return self._format_vlm_response(vlm_res, img_width, img_height)
            except Exception as modal_err:
                print("Modal VLM request error:", modal_err)

        # 2. Local Deep Learning Layout & Section Understanding Analysis
        ocr_res = self._process_with_opencv_layout(image_bytes, img_width, img_height)

        if not ocr_res.get("success"):
            return {
                "success": False,
                "error": ocr_res.get("error", "Could not analyze the form image."),
                "fields": []
            }

        ocr_items = ocr_res.get("ocr", [])
        sections = ocr_res.get("sections", ["General Form Details"])

        formatted_fields = []
        for item in ocr_items:
            conf = float(item.get("confidence", 0.8))
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
                "section": item.get("section", "General"),
                "confidence": conf,
                "needs_verification": needs_verification,
                "label_box": lBox,
                "input_area": iBox,
                "label_box_percent": lBoxPercent,
                "input_area_percent": iBoxPercent,
                # Backward compatibility keys
                "labelBoxPixel": lBox,
                "inputBoxPixel": iBox,
                "labelBoxPercent": lBoxPercent,
                "inputBoxPercent": iBoxPercent
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

    def _format_vlm_response(self, vlm_res: dict, img_w: int, img_h: int):
        vlm_fields = vlm_res.get("fields", [])
        formatted = []

        for f in vlm_fields:
            l_box = f.get("label_box", {"x": 10, "y": 10, "width": 50, "height": 20})
            i_box = f.get("input_area", {"x": 70, "y": 10, "width": 200, "height": 25})
            conf = float(f.get("confidence", 0.85))

            l_percent = {
                "x": max(0.5, min(95.0, round((l_box["x"] / img_w) * 100, 2))),
                "y": max(0.5, min(95.0, round((l_box["y"] / img_h) * 100, 2))),
                "width": max(2.0, min(95.0, round((l_box["width"] / img_w) * 100, 2))),
                "height": max(1.0, min(50.0, round((l_box["height"] / img_h) * 100, 2)))
            }

            i_percent = {
                "x": max(0.5, min(95.0, round((i_box["x"] / img_w) * 100, 2))),
                "y": max(0.5, min(95.0, round((i_box["y"] / img_h) * 100, 2))),
                "width": max(3.0, min(95.0, round((i_box["width"] / img_w) * 100, 2))),
                "height": max(1.5, min(50.0, round((i_box["height"] / img_h) * 100, 2)))
            }

            formatted.append({
                "field_id": f.get("field_id", "UNKNOWN"),
                "label": f.get("label", "Field"),
                "section": f.get("section", "General"),
                "confidence": conf,
                "needs_verification": conf < 0.70,
                "label_box": l_box,
                "input_area": i_box,
                "label_box_percent": l_percent,
                "input_area_percent": i_percent,
                "labelBoxPixel": l_box,
                "inputBoxPixel": i_box,
                "labelBoxPercent": l_percent,
                "inputBoxPercent": i_percent,
                "text": f.get("label", "Field")
            })

        return {
            "success": True,
            "image_width": img_w,
            "image_height": img_h,
            "imageWidth": img_w,
            "imageHeight": img_h,
            "fields": formatted,
            "ocr": formatted
        }

vlm_service = VisionLanguageModelService()
