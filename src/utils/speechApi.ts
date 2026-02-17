/**
 * Speech-to-Text utilities using Web Speech API
 * Browser-native speech recognition
 */

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceRecorder {
  private recognition: any;
  private isRecording: boolean = false;

  constructor() {
    if (!this.isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition is not supported in this browser.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  static isSpeechRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ) {
    if (this.isRecording) {
      return;
    }

    this.isRecording = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isRecording = false;
      onError(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.isRecording = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isRecording = false;
      onError('Failed to start speech recognition');
    }
  }

  stop() {
    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
    }
  }

  isActive(): boolean {
    return this.isRecording;
  }
}
