import modal
import json
import base64
import io
from PIL import Image

# Modal Serverless GPU App definition for Vision-Language Model (Qwen2.5-VL)
app = modal.App("formsaathi-vlm-service")

# Define Modal container image with PyTorch & HuggingFace Transformers
vlm_image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "transformers",
    "torch",
    "accelerate",
    "qwen-vl-utils",
    "pillow",
    "fastapi",
    "uvicorn"
)

@app.cls(gpu="A10G", image=vlm_image, timeout=120)
class FormSaathiVLM:
    @modal.build()
    def download_model(self):
        # Pre-download Qwen2.5-VL model weights into Modal container image
        from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
        print("Downloading Qwen2.5-VL-7B-Instruct weights...")
        Qwen2_5_VLForConditionalGeneration.from_pretrained(
            "Qwen/Qwen2.5-VL-7B-Instruct",
            torch_dtype="auto",
            device_map="auto"
        )
        AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-7B-Instruct")

    @modal.enter()
    def load_model(self):
        from transformers import Qwen2_5_VLForConditionalGeneration, AutoProcessor
        self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            "Qwen/Qwen2.5-VL-7B-Instruct",
            torch_dtype="auto",
            device_map="auto"
        )
        self.processor = AutoProcessor.from_pretrained("Qwen/Qwen2.5-VL-7B-Instruct")

    @modal.method()
    def analyze_form_image(self, image_base64: str):
        """
        Analyze physical form image using Qwen2.5-VL serverless GPU model.
        Returns structured JSON with separate label_box and input_area pixel coordinates.
        """
        import torch
        from qwen_vl_utils import process_vision_info

        img_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        w, h = image.size

        prompt_text = (
            "Analyze this physical paper form image carefully. Identify all form sections, field labels, "
            "and their corresponding writable input areas (lines, boxes, or checkboxes).\n"
            "Return ONLY valid JSON matching this schema:\n"
            "{\n"
            '  "image_width": ' + str(w) + ',\n'
            '  "image_height": ' + str(h) + ',\n'
            '  "fields": [\n'
            "    {\n"
            '      "field_id": "ACCOUNT_NUMBER" | "FULL_NAME" | "AADHAAR_NUMBER" | "DATE_OF_BIRTH" | "ADDRESS" | "CITY" | "STATE" | "PIN_CODE" | "PHONE_NUMBER" | "EMAIL" | "IFSC_CODE" | "PAN_NUMBER" | "SIGNATURE",\n'
            '      "label": "Account Number",\n'
            '      "section": "Bank Details",\n'
            '      "label_box": {"x": 100, "y": 200, "width": 150, "height": 30},\n'
            '      "input_area": {"x": 260, "y": 200, "width": 300, "height": 35},\n'
            '      "confidence": 0.95\n'
            "    }\n"
            "  ]\n"
            "}"
        )

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt_text}
                ]
            }
        ]

        text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        image_inputs, video_inputs = process_vision_info(messages)
        inputs = self.processor(
            text=[text],
            images=image_inputs,
            videos=video_inputs,
            padding=True,
            return_tensors="pt"
        ).to("cuda")

        generated_ids = self.model.generate(**inputs, max_new_tokens=1024)
        generated_ids_trimmed = [
            out_ids[len(in_ids):] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
        ]
        output_text = self.processor.batch_decode(
            generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
        )[0]

        try:
            start_idx = output_text.find("{")
            end_idx = output_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                json_str = output_text[start_idx:end_idx + 1]
                return json.loads(json_str)
        except Exception as e:
            print("VLM JSON parse warning:", e)

        return {
            "image_width": w,
            "image_height": h,
            "fields": []
        }

@app.function()
@modal.web_endpoint(method="POST")
def analyze_endpoint(request_data: dict):
    image_base64 = request_data.get("image")
    if not image_base64:
        return {"success": False, "error": "No image provided"}
    
    vlm_model = FormSaathiVLM()
    result = vlm_model.analyze_form_image.remote(image_base64)
    return {"success": True, "result": result}
