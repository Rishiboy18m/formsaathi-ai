import os
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from ocr_service import ocr_engine

app = FastAPI(
    title="FormSaathi AI Real OCR Backend",
    description="FastAPI service for FormSaathi AI form analysis, OCR text extraction, and bounding box polygon detection",
    version="2.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClassifyRequest(BaseModel):
    ocr_text: str
    context: Optional[str] = None

class ClassifyResponse(BaseModel):
    field_id: str
    confidence: float
    reason: str

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FormSaathi AI Real OCR FastAPI Backend",
        "engine": ocr_engine.name
    }

@app.post("/analyze-form")
@app.post("/analyze")
async def analyze_form(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and not file.content_type.endswith("pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or PDF.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    ocr_res = ocr_engine.process_image(contents)

    if not ocr_res.get("success"):
        raise HTTPException(status_code=422, detail=ocr_res.get("error", "Could not analyze the form."))

    return {
        "success": True,
        "filename": file.filename,
        "imageWidth": ocr_res["imageWidth"],
        "imageHeight": ocr_res["imageHeight"],
        "fullText": ocr_res["fullText"],
        "ocr": ocr_res["ocr"]
    }

@app.post("/classify-field", response_model=ClassifyResponse)
def classify_unknown_field(req: ClassifyRequest):
    text_lower = req.ocr_text.lower()

    if "account" in text_lower or "a/c" in text_lower:
        return ClassifyResponse(field_id="ACCOUNT_NUMBER", confidence=0.96, reason="Matched account keyword")
    elif "aadhaar" in text_lower or "uid" in text_lower:
        return ClassifyResponse(field_id="AADHAAR_NUMBER", confidence=0.95, reason="Matched aadhaar keyword")
    elif "ifsc" in text_lower:
        return ClassifyResponse(field_id="IFSC_CODE", confidence=0.94, reason="Matched IFSC keyword")
    elif "name" in text_lower:
        return ClassifyResponse(field_id="FULL_NAME", confidence=0.92, reason="Matched name keyword")
    else:
        return ClassifyResponse(field_id="UNKNOWN", confidence=0.42, reason="Unclear or low confidence field label")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
