import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import easyocr
import numpy as np
from PIL import Image, ImageDraw

print("Initializing EasyOCR reader...")
reader = easyocr.Reader(['en'], gpu=False)

# Create a test image
img = Image.new('RGB', (800, 600), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((100, 100), "Account Number: 50100293847561", fill=(0, 0, 0))
d.text((100, 200), "Aadhaar Number: 4321 8765 9012", fill=(0, 0, 0))

img_np = np.array(img)
results = reader.readtext(img_np)

print(f"OCR Test Success! Recognized {len(results)} text regions:")
for box, text, conf in results:
    print(f"Text: '{text}' | Confidence: {conf:.2f} | BBox: {box}")
