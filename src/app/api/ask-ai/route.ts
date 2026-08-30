import { NextResponse } from 'next/server';
import knowledgeBaseData from '@/data/knowledge-base.json';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    const qLower = (question || '').toLowerCase();

    let answerTamil = "தயவுசெய்து உங்கள் வங்கி கிளையில் உள்ள அதிகாரியிடம் கேட்டு சரிபார்க்கவும்.";

    if (qLower.includes('ifsc')) {
      answerTamil = "IFSC code 11 இலக்க எழுத்தெண் குறியீடு ஆகும். இது வங்கி பாஸ்புக்கின் முதல் பக்கத்தில் அச்சிடப்பட்டிருக்கும்.";
    } else if (qLower.includes('account') || qLower.includes('கணக்கு')) {
      answerTamil = "வங்கி கணக்கு எண் பாஸ்புக் மற்றும் காசோலை புத்தகத்தில் இருக்கும்.";
    } else if (qLower.includes('aadhaar') || qLower.includes('ஆதார்')) {
      answerTamil = "ஆதார் எண் 12 இலக்க எண் ஆகும். இது ஆதார் அட்டையின் முன் பக்கத்தில் கீழே இருக்கும்.";
    }

    return NextResponse.json({
      success: true,
      answerTamil,
      question
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
