// Speech synthesis, phoneme audio generation, and speech recognition service

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private recognition: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Cancel any ongoing speech or recognition
   */
  cancel(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Speak standard English word or phrase
   */
  speakWord(text: string, rate: number = 0.85): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate; // slightly slower for learners
      utterance.pitch = 1.05;

      const voices = this.synth.getVoices();
      // Try to find a good US English voice
      const preferredVoice = voices.find(v => (v.lang === 'en-US' || v.lang.startsWith('en')) && (v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Karen')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  /**
   * Play specific phoneme sound (e.g. /k/, /er/, /l/)
   */
  speakPhoneme(phoneme: string, letters: string): Promise<void> {
    return new Promise((resolve) => {
      // Clean phoneme representation
      const cleanSound = letters.toLowerCase();
      
      // We synthesize the sound using speech or tuned audio
      if (!this.synth) {
        this.playBeepSound();
        resolve();
        return;
      }

      this.synth.cancel();

      // For phonemes, speak the sound phonetically or natural chunk sound
      let spokenText = cleanSound;
      if (cleanSound === 'cial' || cleanSound === 'tial' || phoneme.includes('ʃəl')) spokenText = 'shul';
      else if (cleanSound === 'tion' || cleanSound === 'sion' || phoneme.includes('ʃn')) spokenText = 'shun';
      else if (cleanSound === 'ju' || phoneme.includes('dʒuː')) spokenText = 'joo';
      else if (cleanSound === 'di' || phoneme.includes('dɪ')) spokenText = 'dih';
      else if (cleanSound === 'cru' || phoneme.includes('kruː')) spokenText = 'kroo';
      else if (cleanSound === 'bene' || phoneme.includes('ben')) spokenText = 'ben';
      else if (cleanSound === 'fi' || phoneme.includes('fɪ')) spokenText = 'fih';
      else if (phoneme.includes('er')) spokenText = 'er';
      else if (phoneme.includes('k')) spokenText = 'k';
      else if (phoneme.includes('ə')) spokenText = 'uh';
      else if (phoneme.includes('aɪ')) spokenText = 'eye';
      else if (phoneme.includes('juː')) spokenText = 'you';
      else if (phoneme.includes('ʃ')) spokenText = 'sh';
      else if (phoneme.includes('tʃ')) spokenText = 'ch';

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  /**
   * Play sound effect (ding for correct, buzz for wrong, click)
   */
  playSuccessSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  playErrorSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.setValueAtTime(196, now + 0.15); // G3

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio context error
    }
  }

  playClickSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  private playBeepSound() {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Start microphone speech recognition for pronunciation test
   */
  startListening(
    targetWord: string,
    onResult: (score: number, recognizedText: string) => void,
    onError: (err: string) => void
  ): () => void {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      onError('当前浏览器环境未开放 Web Speech 语音识别接口（支持 Safari / Chrome）');
      return () => {};
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        const cleanTarget = targetWord.toLowerCase().trim();
        
        let score = 0;
        if (transcript === cleanTarget) {
          score = 100;
        } else if (transcript.split(/\s+/).includes(cleanTarget)) {
          // User spoke phrase containing target word (e.g. "a judicial")
          score = 92;
        } else {
          // Strict Levenshtein similarity calculation
          const dist = this.levenshtein(transcript, cleanTarget);
          const maxLen = Math.max(transcript.length, cleanTarget.length);
          const similarity = 1 - dist / maxLen;

          if (similarity >= 0.85) {
            score = 88;
          } else if (similarity >= 0.70) {
            score = 75;
          } else if (similarity >= 0.50) {
            score = 50;
          } else {
            // Noise, babbling, or unrelated word
            score = Math.max(0, Math.round(similarity * 40));
          }
        }

        onResult(score, transcript);
      };

      this.recognition.onerror = (event: any) => {
        onError(event.error || 'Recognition error');
      };

      this.recognition.start();

      return () => {
        if (this.recognition) {
          try {
            this.recognition.stop();
          } catch {
            // Ignore
          }
        }
      };
    } catch (e: any) {
      onError(e.message);
      return () => {};
    }
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export const speechService = new SpeechService();
