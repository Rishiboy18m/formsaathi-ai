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
  ocrItems: RawOcrItem[]
): DetectedField[] {
  const detectedFields: DetectedField[] = [];
  const processedFieldIds = new Set<string>();

  // Process REAL OCR/VLM items ONLY
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

  return detectedFields;
}
