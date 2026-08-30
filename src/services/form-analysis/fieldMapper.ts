import knowledgeBaseData from '@/data/knowledge-base.json';
import { KnowledgeField, DetectedField, BoundingBox } from '@/types/form';

const knowledgeFields = knowledgeBaseData.fields as Record<string, KnowledgeField>;

export interface RawOcrItem {
  text: string;
  confidence: number;
  box?: number[][];
  labelBoxPercent?: BoundingBox;
  inputBoxPercent?: BoundingBox;
  boundingBoxPercent?: BoundingBox;
}

export function mapOcrToDetectedFields(
  ocrItems: RawOcrItem[],
  isDemo: boolean = false
): DetectedField[] {
  const detectedFields: DetectedField[] = [];
  const processedFieldIds = new Set<string>();

  // 1. Process REAL OCR/VLM items with Label vs Input Area Spatial Analysis
  if (ocrItems && ocrItems.length > 0) {
    for (const item of ocrItems) {
      const textRaw = item.text || '';
      const textLower = textRaw.toLowerCase().trim();
      if (textLower.length < 2) continue;

      let matchedFieldId: string | null = null;

      // Match text against knowledge base aliases
      for (const [fieldId, kField] of Object.entries(knowledgeFields)) {
        if (processedFieldIds.has(fieldId)) continue;

        const isMatch = kField.labels.some((alias) => textLower.includes(alias.toLowerCase()));
        if (isMatch) {
          matchedFieldId = fieldId;
          break;
        }
      }

      const rawConf = item.confidence > 1 ? item.confidence : item.confidence * 100;
      const confPercent = Math.min(100, Math.max(1, Math.round(rawConf)));

      // Determine confidence level
      let confidenceLevel: 'High confidence' | 'Medium confidence' | 'Needs verification' = 'Medium confidence';
      if (confPercent >= 85) confidenceLevel = 'High confidence';
      else if (confPercent < 70) confidenceLevel = 'Needs verification';

      // Separate labelBox (where text was read) from inputBox (where user writes)
      const labelBox = item.labelBoxPercent || item.boundingBoxPercent || { x: 10, y: 20, width: 20, height: 4 };
      const inputBox = item.inputBoxPercent || item.boundingBoxPercent || { x: 32, y: 20, width: 40, height: 5 };

      if (matchedFieldId) {
        const kField = knowledgeFields[matchedFieldId];
        processedFieldIds.add(matchedFieldId);

        detectedFields.push({
          fieldId: matchedFieldId,
          canonicalName: kField.canonicalName,
          tamilName: kField.tamilName,
          confidence: confPercent,
          confidenceLevel,
          boundingBox: inputBox,   // HIGHLIGHT THE ACTUAL INPUT AREA!
          labelBox: labelBox,      // Field Label position
          inputBox: inputBox,      // Field Input Area position
          isLowConfidence: confPercent < 70,
          rawText: textRaw,
          userValue: kField.sampleValue
        });
      } else if (
        textLower.length > 3 &&
        !textLower.includes("form") &&
        !textLower.includes("bank") &&
        !textLower.includes("national") &&
        !textLower.includes("capital")
      ) {
        // Unknown field label -> Mark Needs Verification
        const unknownKey = `UNKNOWN_${textLower.replace(/[^a-z0-9]/g, '_')}`;
        if (!processedFieldIds.has(unknownKey) && detectedFields.length < 8) {
          processedFieldIds.add(unknownKey);

          detectedFields.push({
            fieldId: unknownKey,
            canonicalName: `Unclear Field (${textRaw.substring(0, 16)})`,
            tamilName: `அடையாளம் தெரியாத பகுதி (${textRaw.substring(0, 14)})`,
            confidence: Math.min(65, confPercent),
            confidenceLevel: 'Needs verification',
            boundingBox: inputBox,
            labelBox: labelBox,
            inputBox: inputBox,
            isLowConfidence: true,
            rawText: textRaw,
            userValue: ""
          });
        }
      }
    }
  }

  // 2. DEMO MODE ONLY: Pre-configured sample layouts for instant testing
  if (isDemo && detectedFields.length === 0) {
    const demoItems: Array<{
      id: string;
      labelBox: BoundingBox;
      inputBox: BoundingBox;
      conf: number;
    }> = [
      { id: "FULL_NAME", labelBox: { x: 5, y: 15, width: 30, height: 5 }, inputBox: { x: 38, y: 15, width: 55, height: 6 }, conf: 98 },
      { id: "ACCOUNT_NUMBER", labelBox: { x: 5, y: 25, width: 30, height: 5 }, inputBox: { x: 38, y: 25, width: 55, height: 6 }, conf: 96 },
      { id: "AADHAAR_NUMBER", labelBox: { x: 5, y: 35, width: 30, height: 5 }, inputBox: { x: 38, y: 35, width: 55, height: 6 }, conf: 94 },
      { id: "DATE_OF_BIRTH", labelBox: { x: 5, y: 45, width: 20, height: 5 }, inputBox: { x: 26, y: 45, width: 22, height: 6 }, conf: 97 },
      { id: "PHONE_NUMBER", labelBox: { x: 52, y: 45, width: 20, height: 5 }, inputBox: { x: 73, y: 45, width: 22, height: 6 }, conf: 95 },
      { id: "IFSC_CODE", labelBox: { x: 5, y: 55, width: 20, height: 5 }, inputBox: { x: 26, y: 55, width: 22, height: 6 }, conf: 93 },
      { id: "PAN_NUMBER", labelBox: { x: 52, y: 55, width: 20, height: 5 }, inputBox: { x: 73, y: 55, width: 22, height: 6 }, conf: 92 },
      { id: "ADDRESS", labelBox: { x: 5, y: 65, width: 30, height: 5 }, inputBox: { x: 38, y: 65, width: 55, height: 8 }, conf: 91 },
      { id: "SIGNATURE", labelBox: { x: 52, y: 77, width: 20, height: 5 }, inputBox: { x: 73, y: 77, width: 22, height: 8 }, conf: 89 },
      { id: "UNKNOWN_FIELD", labelBox: { x: 5, y: 77, width: 20, height: 5 }, inputBox: { x: 26, y: 77, width: 22, height: 8 }, conf: 45 }
    ];

    demoItems.forEach((item) => {
      if (item.id === "UNKNOWN_FIELD") {
        detectedFields.push({
          fieldId: "UNKNOWN_FIELD",
          canonicalName: "Unclear Field / கூடுதல் விவரம்",
          tamilName: "அடையாளம் தெரியாத பகுதி",
          confidence: 45,
          confidenceLevel: 'Needs verification',
          boundingBox: item.inputBox,
          labelBox: item.labelBox,
          inputBox: item.inputBox,
          isLowConfidence: true,
          rawText: "Unclear text",
          userValue: ""
        });
      } else {
        const kField = knowledgeFields[item.id];
        if (kField) {
          detectedFields.push({
            fieldId: item.id,
            canonicalName: kField.canonicalName,
            tamilName: kField.tamilName,
            confidence: item.conf,
            confidenceLevel: 'High confidence',
            boundingBox: item.inputBox,
            labelBox: item.labelBox,
            inputBox: item.inputBox,
            isLowConfidence: false,
            rawText: kField.canonicalName,
            userValue: kField.sampleValue
          });
        }
      }
    });
  }

  return detectedFields;
}
