import { OcrAdapter, RawOcrResult } from './types';

export class MockOcrAdapter implements OcrAdapter {
  name = 'Mock OCR Service (Development / Demo)';

  async processImage(imageSource: File | string): Promise<RawOcrResult> {
    // Simulate realistic network / processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      fullText: `APPLICATION FORM FOR ACCOUNT OPENING
Full Name: ARUN KUMAR
Account Number: 50100293847561
Aadhaar Number: 4321 8765 9012
Date of Birth: 15/08/1995
Phone Number: 9876543210
IFSC Code: SBIN0001234
PAN Number: ABCDE1234F
Address: 12 Gandhi Street Chennai 600001
Signature: [Applicant Sign]`,
      words: [
        { text: "Full Name", confidence: 98, boundingBox: { x: 12, y: 16, width: 76, height: 7 } },
        { text: "Account Number", confidence: 96, boundingBox: { x: 12, y: 26, width: 76, height: 7 } },
        { text: "Aadhaar Number", confidence: 94, boundingBox: { x: 12, y: 36, width: 76, height: 7 } },
        { text: "Date of Birth", confidence: 97, boundingBox: { x: 12, y: 46, width: 36, height: 7 } },
        { text: "Phone Number", confidence: 95, boundingBox: { x: 52, y: 46, width: 36, height: 7 } },
        { text: "IFSC Code", confidence: 93, boundingBox: { x: 12, y: 56, width: 36, height: 7 } },
        { text: "PAN Number", confidence: 92, boundingBox: { x: 52, y: 56, width: 36, height: 7 } },
        { text: "Address", confidence: 91, boundingBox: { x: 12, y: 66, width: 76, height: 9 } },
        { text: "Signature", confidence: 89, boundingBox: { x: 52, y: 78, width: 36, height: 10 } },
      ]
    };
  }
}
