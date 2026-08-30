// Speech synthesis (TTS) & Speech recognition helpers

export function speakTamilText(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find Tamil voice if available, otherwise default to system voice
    const voices = window.speechSynthesis.getVoices();
    const tamilVoice = voices.find((v) => v.lang.startsWith('ta') || v.lang.includes('TA'));

    if (tamilVoice) {
      utterance.voice = tamilVoice;
      utterance.lang = tamilVoice.lang;
    } else {
      utterance.lang = 'ta-IN';
    }

    utterance.rate = 0.9; // Slightly slower for clear speech
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface SpeechRecognitionHelper {
  start: () => void;
  stop: () => void;
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError?: (err: string) => void
): SpeechRecognitionHelper | null {
  if (typeof window === 'undefined') return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ta-IN'; // Default to Tamil, can fall back to en-IN

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };

    return {
      start: () => recognition.start(),
      stop: () => recognition.stop(),
    };
  } catch (err) {
    console.error('Speech recognition error:', err);
    return null;
  }
}
