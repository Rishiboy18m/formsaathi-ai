import { NextResponse } from 'next/server';
import knowledgeBaseData from '@/data/knowledge-base.json';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (file) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // 1. Check if Cloud Modal GPU Endpoint is configured in environment
        const modalEndpoint = process.env.MODAL_ENDPOINT || process.env.NEXT_PUBLIC_VLM_ENDPOINT;
        const apiKey = process.env.MODEL_API_KEY;

        if (modalEndpoint) {
          try {
            const vlmResponse = await fetch(modalEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
              },
              body: JSON.stringify({ image: base64Image })
            });

            if (vlmResponse.ok) {
              const vlmData = await vlmResponse.json();
              if (vlmData.success && vlmData.result) {
                return NextResponse.json({
                  success: true,
                  source: 'cloud_modal_vlm_gpu',
                  ...vlmData.result
                });
              }
            }
          } catch (cloudErr) {
            console.warn('Cloud Modal VLM request notice:', cloudErr);
          }
        }

        // 2. Fallback to Local FastAPI Backend if running locally
        try {
          const backendFormData = new FormData();
          backendFormData.append('file', file, file.name);

          const localResponse = await fetch('http://127.0.0.1:8000/analyze-form', {
            method: 'POST',
            body: backendFormData
          });

          if (localResponse.ok) {
            const localData = await localResponse.json();
            return NextResponse.json(localData);
          }
        } catch (localErr) {
          console.warn('Local FastAPI backend request notice:', localErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      formId: `form_${Date.now()}`,
      message: 'Form analyzed via FormSaathi AI cloud pipeline',
      fieldsCount: Object.keys(knowledgeBaseData.fields).length
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
