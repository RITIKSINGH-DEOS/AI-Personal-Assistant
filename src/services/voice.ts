// Web Speech Recognition & Speech Synthesis Service
export interface VoiceServiceOptions {
  wakeWord: string;
  assistantName: string;
  language: string;
  speechSpeed: number;
  volume: number;
  voiceName?: string;
  onWakeWordDetected?: () => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (err: any) => void;
}

export class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private isContinuousWakeListening = false;
  private options: VoiceServiceOptions;
  private audioCtx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor(options: VoiceServiceOptions) {
    this.options = options;
    this.initVoices();
    this.initRecognition();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }
    }
    return this.voices;
  }

  public updateOptions(newOptions: Partial<VoiceServiceOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser environment.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.options.language === 'hi-IN' ? 'hi-IN' : 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();

        // Check wake word if in wake-word detection mode
        if (this.options.wakeWord) {
          const wakeWordRegex = new RegExp(`\\b${this.options.wakeWord}\\b`, 'i');
          if (wakeWordRegex.test(currentText)) {
            this.playChime('wake');
            if (this.options.onWakeWordDetected) {
              this.options.onWakeWordDetected();
            }
          }
        }

        if (this.options.onTranscript && currentText) {
          this.options.onTranscript(currentText, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
        if (this.options.onError) {
          this.options.onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Auto-restart if continuous wake listener is on
        if (this.isContinuousWakeListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Ignore already started
          }
        }
      };
    } catch (e) {
      console.error('Failed to init speech recognition:', e);
    }
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.lang = this.options.language === 'hi-IN' ? 'hi-IN' : 'en-IN';
        this.recognition.start();
        this.isListening = true;
        this.playChime('start');
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (err) {
        console.warn('Recognition stop error:', err);
      }
    }
  }

  public toggleContinuousWake(enabled: boolean) {
    this.isContinuousWakeListening = enabled;
    if (enabled) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  // Play synthetic voice
  public speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Clean speech text (remove markdown symbols)
      const cleanText = text
        .replace(/[*#_`~[\]]/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = this.options.speechSpeed || 1.0;
      utterance.volume = (this.options.volume || 90) / 100;

      // Select voice if available
      const voices = this.getAvailableVoices();
      if (this.options.voiceName) {
        const match = voices.find(v => v.name === this.options.voiceName);
        if (match) utterance.voice = match;
      } else {
        // Preferred voice priority: Indian English / Natural / Google
        const preferred = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) ||
          voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) ||
          voices[0];
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => {
        if (this.options.onSpeechStart) this.options.onSpeechStart();
      };

      utterance.onend = () => {
        if (this.options.onSpeechEnd) this.options.onSpeechEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('TTS error:', e);
        if (this.options.onSpeechEnd) this.options.onSpeechEnd();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (this.options.onSpeechEnd) this.options.onSpeechEnd();
    }
  }

  // Sound effects with Web Audio API
  public playChime(type: 'wake' | 'start' | 'success' | 'reminder') {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'wake' || type === 'start') {
        // Futuristic two-tone chime (F#5 -> B5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(987, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'success') {
        // Confirmation chord
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'reminder') {
        // Alert chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  }
}
