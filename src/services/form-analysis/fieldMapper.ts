import knowledgeBaseData from '@/data/knowledge-base.json';
import { KnowledgeField, DetectedField } from '@/types/form';

const knowledgeFields = knowledgeBaseData.fields as Record<string, KnowledgeField>;

export interface RawOcrItem {
  text: string;
  confidence: number;
  box?: number[][];
  boundingBoxPixel?: { x: number; y: number; width: number; height: number };
  boundingBoxPercent?: { x: number; y: number; width: number; height: number };
}

export function mapOcrToDetectedFields(
  ocrItems: RawOcrItem[],
  isDemo: boolean = false
): DetectedField[] {
  const detectedFields: DetectedField[] = [];
  const processedFieldIds = new Set<string>();

  // 1. Process REAL OCR items returned from PaddleOCR / Backend OCR
  if (ocrItems && ocrItems.length > 0) {
    for (const item of ocrItems) {
      const textRaw = item.text || '';
      const textLower = textRaw.toLowerCase().trim();
      if (textLower.length < 2) continue;

      let matchedFieldId: string | null = null;

      // Find matching field in Knowledge Base
      for (const [fieldId, kField] of Object.entries(knowledgeFields)) {
        if (processedFieldIds.has(fieldId)) continue;

        const isMatch = kField.labels.some((alias) => textLower.includes(alias.toLowerCase()));
        if (isMatch) {
          matchedFieldId = fieldId;
          break;
        }
      }

      // Convert confidence to integer percentage (0 - 100)
      const rawConf = item.confidence > 1 ? item.confidence : item.confidence * 100;
      const confPercent = Math.min(100, Math.max(1, Math.round(rawConf)));

      // Extract percentage bounding box coordinates
      const boxPercent = item.boundingBoxPercent || {
        x: 10,
        y: 20,
        width: 80,
        height: 8
      };

      if (matchedFieldId) {
        const kField = knowledgeFields[matchedFieldId];
        processedFieldIds.add(matchedFieldId);

        detectedFields.push({
          fieldId: matchedFieldId,
          canonicalName: kField.canonicalName,
          tamilName: kField.tamilName,
          confidence: confPercent,
          boundingBox: boxPercent,
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
        // Unmatched field label from real upload -> Mark UNKNOWN with low confidence notice (Requirement #14)
        const unknownKey = `UNKNOWN_${textLower.replace(/[^a-z0-9]/g, '_')}`;
        if (!processedFieldIds.has(unknownKey) && detectedFields.length < 8) {
          processedFieldIds.add(unknownKey);

          detectedFields.push({
            fieldId: unknownKey,
            canonicalName: `Unclear Text (${textRaw.substring(0, 16)})`,
            tamilName: `அடையாளம் தெரியாத பகுதி (${textRaw.substring(0, 14)})`,
            confidence: Math.min(65, confPercent),
            boundingBox: boxPercent,
            isLowConfidence: true,
            rawText: textRaw,
            userValue: ""
          });
        }
      }
    }
  }

  // 2. DEMO MODE ONLY: If user explicitly clicked Demo Mode, provide pre-configured sample bank form fields
  if (isDemo && detectedFields.length === 0) {
    const demoItems: Array<{ id: string; box: { x: number; y: number; width: number; height: number }; conf: number }> = [
      { id: "FULL_NAME", box: { x: 10, y: 15, width: 80, height: 7 }, conf: 98 },
      { id: "ACCOUNT_NUMBER", box: { x: 10, y: 25, width: 80, height: 7 }, conf: 96 },
      { id: "AADHAAR_NUMBER", box: { x: 10, y: 35, width: 80, height: 7 }, conf: 94 },
      { id: "DATE_OF_BIRTH", box: { x: 10, y: 45, width: 38, height: 7 }, conf: 97 },
      { id: "PHONE_NUMBER", box: { x: 52, y: 45, width: 38, height: 7 }, conf: 95 },
      { id: "IFSC_CODE", box: { x: 10, y: 55, width: 38, height: 7 }, conf: 93 },
      { id: "PAN_NUMBER", box: { x: 52, y: 55, width: 38, height: 7 }, conf: 92 },
      { id: "ADDRESS", box: { x: 10, y: 65, width: 80, height: 9 }, conf: 91 },
      { id: "SIGNATURE", box: { x: 52, y: 77, width: 38, height: 10 }, conf: 89 },
      { id: "UNKNOWN_FIELD", box: { x: 10, y: 77, width: 38, height: 10 }, conf: 45 }
    ];

    demoItems.forEach((item) => {
      if (item.id === "UNKNOWN_FIELD") {
        detectedFields.push({
          fieldId: "UNKNOWN_FIELD",
          canonicalName: "Unclear Field / கூடுதல் விவரம்",
          tamilName: "அடையாளம் தெரியாத பகுதி",
          confidence: 45,
          boundingBox: item.box,
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
            boundingBox: item.box,
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
