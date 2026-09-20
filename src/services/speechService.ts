// Speech synthesis, phoneme audio generation, and speech recognition service
import { TextToSpeech, QueueStrategy } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

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
  async cancel(): Promise<void> {
    try {
      await TextToSpeech.stop();
    } catch {
      // Ignore
    }
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
    if (Capacitor.isNativePlatform()) {
      try {
        await SpeechRecognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Fallback: Play audio using online pronunciation dictionary
   */
  private playOnlineAudio(text: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`);
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      } catch {
        resolve();
      }
    });
  }

  /**
   * Speak standard English word or phrase
   */
  async speakWord(text: string, rate: number = 0.85): Promise<void> {
    // 1. Try Capacitor Native TextToSpeech plugin (works offline on Android & iOS native)
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text,
        lang: 'en-US',
        rate,
        pitch: 1.05,
        volume: 1.0,
        category: 'ambient',
        queueStrategy: QueueStrategy.Flush,
      });
      return;
    } catch (nativeErr) {
      console.warn('Native TTS unavailable, falling back to Web Speech:', nativeErr);
    }

    // 2. Fallback to Web SpeechSynthesis API
    if (this.synth) {
      const played = await new Promise<boolean>((resolve) => {
        try {
          this.synth!.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          utterance.rate = rate;
          utterance.pitch = 1.05;

          const voices = this.synth!.getVoices();
          const preferredVoice = voices.find(
            (v) =>
              (v.lang === 'en-US' || v.lang.startsWith('en')) &&
              (v.name.includes('Samantha') ||
                v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Karen'))
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }

          let resolved = false;
          utterance.onend = () => {
            if (!resolved) {
              resolved = true;
              resolve(true);
            }
          };
          utterance.onerror = () => {
            if (!resolved) {
              resolved = true;
              resolve(false);
            }
          };

          // Timeout in case speech synthesis silently hangs
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(false);
            }
          }, 2500);

          this.synth!.speak(utterance);
        } catch {
          resolve(false);
        }
      });

      if (played) return;
    }

    // 3. Fallback to online dictionary audio
    await this.playOnlineAudio(text);
  }

  /**
   * Play specific phoneme sound (e.g. /k/, /er/, /l/)
   */
  async speakPhoneme(phoneme: string, letters: string): Promise<void> {
    const cleanSound = letters.toLowerCase();

    // Map phonemes to spoken representation
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

    // 1. Try native TTS
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text: spokenText,
        lang: 'en-US',
        rate: 0.7,
        pitch: 1.2,
        volume: 1.0,
        category: 'ambient',
        queueStrategy: QueueStrategy.Flush,
      });
      return;
    } catch {
      // Fall through to web synth
    }

    // 2. Web synth fallback
    if (this.synth) {
      await new Promise<void>((resolve) => {
        try {
          this.synth!.cancel();
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.lang = 'en-US';
          utterance.rate = 0.7;
          utterance.pitch = 1.2;
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          this.synth!.speak(utterance);
        } catch {
          resolve();
        }
      });
      return;
    }

    // 3. Last fallback: beep
    this.playBeepSound();
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
      osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6

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
    const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

    // 1. On Android Native: Use native SpeechRecognition plugin
    if (isNativeAndroid) {
      let isCancelled = false;

      (async () => {
        try {
          const { available } = await SpeechRecognition.available().catch(() => ({ available: false }));
          if (!available) {
            onError('设备未安装或未启用语音识别引擎，请在系统设置中启用');
            return;
          }

          const status = await SpeechRecognition.checkPermissions().catch(() => null);
          if (status?.speechRecognition !== 'granted') {
            const req = await SpeechRecognition.requestPermissions().catch(() => null);
            if (req?.speechRecognition !== 'granted') {
              onError('未获得麦克风权限，请在手机系统设置中开启录音权限');
              return;
            }
          }

          if (isCancelled) return;

          const result = await SpeechRecognition.start({
            language: 'en-US',
            maxResults: 3,
            popup: false,
            partialResults: false,
          });

          if (isCancelled) return;

          const matches = result.matches || [];
          if (matches.length > 0) {
            const transcript = matches[0].trim().toLowerCase();
            const score = this.calculateScore(transcript, targetWord);
            onResult(score, transcript);
          } else {
            onError('未听到清晰发音，请大声朗读');
          }
        } catch (err: any) {
          if (isCancelled) return;
          console.warn('Native speech recognition error:', err);
          const msg = err?.message || String(err);
          if (msg.includes('not-allowed') || msg.includes('denied') || msg.includes('permission')) {
            onError('未获得麦克风权限，请在系统设置中开启录音权限');
          } else if (msg.includes('no match') || msg.includes('No speech')) {
            onError('未识别到发音，请贴近麦克风大声朗读');
          } else {
            onError('语音识别暂不可用：' + (msg || '请检查系统语音服务'));
          }
        }
      })();

      return () => {
        isCancelled = true;
        SpeechRecognition.stop().catch(() => {});
      };
    }

    // 2. On Web / iOS: Use Web Speech API
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      onError('当前环境未开放语音识别接口（支持 Safari / Chrome）');
      return () => {};
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 3;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        const score = this.calculateScore(transcript, targetWord);
        onResult(score, transcript);
      };

      this.recognition.onerror = (event: any) => {
        const err = event.error || 'Recognition error';
        if (err === 'not-allowed') {
          onError('未获得麦克风权限，请在系统设置中允许此应用的录音权限');
        } else if (err === 'no-speech') {
          onError('未识别到发音，请贴近麦克风大声朗读');
        } else if (err === 'network') {
          onError('语音识别网络连接超时，请检查网络');
        } else {
          onError(err);
        }
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

  private calculateScore(transcript: string, targetWord: string): number {
    const cleanTarget = targetWord.toLowerCase().trim();
    if (transcript === cleanTarget) {
      return 100;
    } else if (transcript.split(/\s+/).includes(cleanTarget)) {
      return 92;
    } else {
      const dist = this.levenshtein(transcript, cleanTarget);
      const maxLen = Math.max(transcript.length, cleanTarget.length);
      const similarity = 1 - dist / maxLen;

      if (similarity >= 0.85) {
        return 88;
      } else if (similarity >= 0.7) {
        return 75;
      } else if (similarity >= 0.5) {
        return 50;
      } else {
        return Math.max(0, Math.round(similarity * 40));
      }
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
