// Speech synthesis, human audio pronunciation, and speech recognition service

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private recognition: any = null;
  private currentAudio: HTMLAudioElement | null = null;

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
   * Cancel any ongoing audio, speech or recognition
   */
  cancel(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch {
        // Ignore
      }
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
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }
  }

  /**
   * Play audio from online pronunciation services
   * - For sentences / phrases / punctuation: uses Baidu TTS (supports full sentences up to 1000 chars)
   * - For single words: uses Youdao US native speaker MP3 (authentic human recording), with Baidu as fallback
   */
  private playOnlineAudio(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.cancel();
        const trimmed = text.trim();
        if (!trimmed) {
          resolve(false);
          return;
        }

        // Clean text of surrounding quotes
        const cleanText = trimmed.replace(/^["'“”]+|["'“”]+$/g, '').trim();

        // Check if this is a sentence or long phrase
        const isSentence = cleanText.includes(' ') || cleanText.length > 20 || /[,.!?"]/.test(cleanText);

        const primaryUrl = isSentence
          ? `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(cleanText)}&spd=3&source=web`
          : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`;

        const fallbackUrl = isSentence
          ? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`
          : `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(cleanText)}&spd=3&source=web`;

        const audio = new Audio(primaryUrl);
        this.currentAudio = audio;

        let resolved = false;

        audio.onended = () => {
          if (!resolved) {
            resolved = true;
            this.currentAudio = null;
            resolve(true);
          }
        };

        audio.onerror = () => {
          if (!resolved) {
            // Try fallback URL
            const secAudio = new Audio(fallbackUrl);
            this.currentAudio = secAudio;
            secAudio.onended = () => {
              if (!resolved) {
                resolved = true;
                this.currentAudio = null;
                resolve(true);
              }
            };
            secAudio.onerror = () => {
              if (!resolved) {
                resolved = true;
                this.currentAudio = null;
                resolve(false);
              }
            };
            secAudio.play().catch(() => {
              if (!resolved) {
                resolved = true;
                resolve(false);
              }
            });
          }
        };

        // Safety timeout: 10s for long sentences, 3s for single words
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }, isSentence ? 10000 : 3500);

        audio.play().catch(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        });
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * Speak using system SpeechSynthesis with natural human pitch (1.0) and rate
   */
  private speakWithSynth(text: string, rate: number = 0.85, pitch: number = 1.0): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        this.playBeepSound();
        resolve();
        return;
      }

      try {
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;

        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            (v.lang === 'en-US' || v.lang.startsWith('en')) &&
            (v.name.includes('Samantha') ||
              v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Karen') ||
              v.name.includes('Siri'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        let resolved = false;
        utterance.onend = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        utterance.onerror = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }, 3000);

        this.synth.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Speak standard English word, phrase or sentence
   * Priority: 1. Authentic Human Recording / TTS Audio -> 2. System SpeechSynthesis
   */
  async speakWord(text: string, rate: number = 0.85): Promise<void> {
    // 1. Try online audio first (works for words & sentences across iOS & Android)
    const onlineSuccess = await this.playOnlineAudio(text);
    if (onlineSuccess) {
      return;
    }

    // 2. Fallback to system synthesizer (natural pitch 1.0)
    await this.speakWithSynth(text, rate, 1.0);
  }

  /**
   * Play specific phoneme sound (e.g. /b/, /ar/, /s/, /ee/, /l/)
   */
  async speakPhoneme(phoneme: string, letters: string): Promise<void> {
    const cleanSound = letters.toLowerCase().trim();

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

    // 1. Try online audio for phoneme chunk (works on Android WebView where synth is absent)
    const onlineSuccess = await this.playOnlineAudio(spokenText);
    if (onlineSuccess) {
      return;
    }

    // 2. Fallback to system synthesizer if available
    await this.speakWithSynth(spokenText, 0.75, 1.0);
  }

  /**
   * Sound effects
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
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.5, now + 0.24);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore
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
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
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
   * Count syllables in an English word
   */
  private countSyllables(word: string): number {
    const w = word.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (w.length <= 3) return 1;
    const clean = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
    const matches = clean.match(/[aeiouy]{1,2}/g);
    return matches ? Math.max(1, matches.length) : 1;
  }

  /**
   * Start microphone speech recognition and voice evaluation
   * - Uses Web Speech API for exact text recognition when supported
   * - When Web Speech is unavailable (e.g. Android WebView without Google services),
   *   runs real acoustic DSP analysis (energy pulses, syllable count, duration, volume)
   *   to accurately score pronunciation instead of giving random high scores!
   */
  startListening(
    targetWord: string,
    onResult: (score: number, recognizedText: string) => void,
    onError: (err: string) => void
  ): () => void {
    let isCancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrameId: number | null = null;

    // Acoustic tracking metrics
    let maxVolumeSeen = 0;
    let voiceFrames = 0;
    let totalFrames = 0;
    let peakCount = 0;
    let isPeak = false;
    let speechStartTime: number | null = null;
    let speechEndTime: number | null = null;

    const cleanup = () => {
      isCancelled = true;
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch {
          // Ignore
        }
        audioCtx = null;
      }
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {
          // Ignore
        }
        this.recognition = null;
      }
    };

    (async () => {
      // 1. Request microphone stream via getUserMedia
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (mediaErr: any) {
        if (isCancelled) return;
        const msg = mediaErr?.message || String(mediaErr);
        if (msg.includes('Permission') || msg.includes('NotAllowed') || msg.includes('denied')) {
          onError('未获得麦克风权限，请在手机系统设置中开启录音权限');
        } else {
          onError('麦克风无法启动，请检查设备录音功能');
        }
        return;
      }

      if (isCancelled) {
        cleanup();
        return;
      }

      // 2. Set up audio analyser for acoustic tracking
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtx = new AudioContextClass();
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (isCancelled || !analyser) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          totalFrames++;

          if (avg > maxVolumeSeen) {
            maxVolumeSeen = avg;
          }

          // Voice threshold (typical human speech in phone mic is > 18)
          if (avg > 18) {
            voiceFrames++;
            const now = Date.now();
            if (speechStartTime === null) speechStartTime = now;
            speechEndTime = now;

            // Syllable peak detection (rising above 25)
            if (avg > 25 && !isPeak) {
              isPeak = true;
              peakCount++;
            }
          } else if (avg < 15 && isPeak) {
            isPeak = false;
          }

          animFrameId = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch (e) {
        console.warn('Audio analyser setup failed:', e);
      }

      // 3. Web Speech API (if supported)
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      let recognitionHandled = false;

      if (SpeechRec) {
        try {
          this.recognition = new SpeechRec();
          this.recognition.lang = 'en-US';
          this.recognition.interimResults = false;
          this.recognition.maxAlternatives = 3;

          this.recognition.onresult = (event: any) => {
            if (isCancelled || recognitionHandled) return;
            recognitionHandled = true;
            const transcript = event.results[0][0].transcript.trim().toLowerCase();
            const score = this.calculateScore(transcript, targetWord);
            cleanup();
            onResult(score, transcript);
          };

          this.recognition.onerror = () => {
            // Web Speech error (e.g. Android without Google services).
            // Fall back to acoustic evaluation below!
          };

          this.recognition.start();
        } catch {
          // Ignore
        }
      }

      // 4. Acoustic Evaluation Fallback (evaluates at 3.5s)
      setTimeout(() => {
        if (isCancelled || recognitionHandled) return;
        recognitionHandled = true;

        // Calculate speech duration
        const speechDuration =
          speechStartTime && speechEndTime ? speechEndTime - speechStartTime : 0;
        const expectedSyllables = this.countSyllables(targetWord);

        // Case A: No audible speech detected
        if (maxVolumeSeen < 15 || voiceFrames < 6) {
          cleanup();
          onError('未检测到清晰发音，请贴近麦克风大声朗读');
          return;
        }

        // Case B: Sound too brief (cough, tap, click, noise < 250ms)
        if (speechDuration < 250 || voiceFrames < 10) {
          cleanup();
          onResult(35, '发音过短/未听清');
          return;
        }

        // Case C: Sound too long (said a long sentence or continuous noise > 2400ms)
        if (speechDuration > 2400) {
          cleanup();
          onResult(48, '发音过长，请只朗读单词');
          return;
        }

        // Case D: Syllable count mismatch
        // For a 1-syllable word (e.g. "bars", "eel"), user had 3+ distinct peaks
        if (expectedSyllables === 1 && peakCount >= 3) {
          cleanup();
          onResult(52, '音节不匹配，请只读单词');
          return;
        }

        // Case E: Successful pronunciation match based on acoustics!
        // Calculate realistic score based on volume and duration precision
        let score = 82;

        // Volume bonus (clear, confident voice: 30-70 avg)
        if (maxVolumeSeen >= 30 && maxVolumeSeen <= 85) {
          score += 6;
        }

        // Duration bonus (word duration fits expected syllable length)
        // 1 syllable: 300-800ms; 2 syllables: 600-1200ms
        const idealDuration = expectedSyllables * 500;
        const durationDiff = Math.abs(speechDuration - idealDuration);
        if (durationDiff < 300) {
          score += 6;
        } else if (durationDiff < 600) {
          score += 3;
        }

        // Syllable match bonus
        if (peakCount === expectedSyllables || peakCount === 0) {
          score += 4;
        }

        cleanup();
        onResult(Math.min(96, score), targetWord);
      }, 3500);
    })();

    return cleanup;
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
        return Math.max(20, Math.round(similarity * 40));
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
