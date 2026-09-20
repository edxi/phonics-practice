// Speech synthesis, human audio pronunciation, and speech recognition service

// Standard Phonics Phoneme Pronunciation Map
// Maps grapheme/phoneme units to phonetic guide sounds so TTS pronounces
// the PHONICS SOUND (e.g. /b/ -> "buh", /s/ -> "sss") instead of the letter name ("bee", "ess")!
const PHONICS_AUDIO_MAP: Record<string, string> = {
  // Consonants (unvoiced/voiced stops, fricatives, nasals)
  'b': 'buh',       // /b/ (NOT "bee")
  'c': 'kuh',       // /k/ (NOT "see")
  'd': 'duh',       // /d/ (NOT "dee")
  'f': 'fff',       // /f/ (NOT "eff")
  'g': 'guh',       // /ɡ/ (NOT "gee")
  'h': 'huh',       // /h/ (NOT "aitch")
  'j': 'juh',       // /dʒ/ (NOT "jay")
  'k': 'kuh',       // /k/ (NOT "kay")
  'l': 'ull',       // /l/ (NOT "ell")
  'm': 'mmm',       // /m/ (NOT "em")
  'n': 'nnn',       // /n/ (NOT "en")
  'p': 'puh',       // /p/ (NOT "pee")
  'q': 'kw',        // /kw/
  'qu': 'kwuh',     // /kw/
  'r': 'rrr',       // /r/ (NOT "ar")
  's': 'sss',       // /s/ (NOT "ess")
  't': 'tuh',       // /t/ (NOT "tee")
  'v': 'vvv',       // /v/ (NOT "vee")
  'w': 'wuh',       // /w/ (NOT "double-u")
  'x': 'ks',        // /ks/ (NOT "ex")
  'y': 'yuh',       // /j/ (NOT "why")
  'z': 'zzz',       // /z/ (NOT "zed"/"zee")

  // Digraphs & Blends
  'sh': 'shh',      // /ʃ/
  'ch': 'chuh',     // /tʃ/
  'th': 'th',       // /θ/
  'wh': 'wuh',      // /w/
  'ph': 'fff',      // /f/
  'ck': 'kuh',      // /k/
  'ng': 'ung',      // /ŋ/
  'nk': 'unk',      // /ŋk/
  'bl': 'bluh',     // /bl/
  'cl': 'cluh',     // /kl/
  'fl': 'fluh',     // /fl/
  'gl': 'gluh',     // /gl/
  'pl': 'pluh',     // /pl/
  'sl': 'sluh',     // /sl/
  'br': 'bruh',     // /br/
  'cr': 'cruh',     // /kr/
  'dr': 'druh',     // /dr/
  'fr': 'fruh',     // /fr/
  'gr': 'gruh',     // /gr/
  'pr': 'pruh',     // /pr/
  'tr': 'truh',     // /tr/
  'st': 'stuh',     // /st/
  'sp': 'spuh',     // /sp/
  'sk': 'skuh',     // /sk/
  'sw': 'swuh',     // /sw/
  'sm': 'smuh',     // /sm/
  'sn': 'snuh',     // /sn/

  // Vowels
  'a': 'ah',        // /æ/ (NOT "ay")
  'e': 'eh',        // /e/ (NOT "ee")
  'i': 'ih',        // /ɪ/ (NOT "eye")
  'o': 'aw',        // /ɒ/ (NOT "oh")
  'u': 'uh',        // /ʌ/ (NOT "you")

  // Long Vowels & Vowel Teams
  'ai': 'ay',       // /eɪ/
  'ay': 'ay',       // /eɪ/
  'ee': 'ee',       // /iː/
  'ea': 'ee',       // /iː/
  'oa': 'oh',       // /oʊ/
  'oe': 'oh',       // /oʊ/
  'ow': 'oh',       // /oʊ/
  'ou': 'ow',       // /aʊ/
  'oo': 'oo',       // /uː/
  'oi': 'oy',       // /ɔɪ/
  'oy': 'oy',       // /ɔɪ/

  // R-controlled Vowels
  'ar': 'ar',       // /ɑːr/
  'er': 'er',       // /ər/
  'ir': 'er',       // /ɜːr/
  'ur': 'er',       // /ɜːr/
  'or': 'or',       // /ɔːr/
  'are': 'air',     // /er/
  'air': 'air',     // /er/

  // Common word endings / phonograms
  've': 'vvv',
  'ce': 'sss',
  'ge': 'juh',
  'se': 'sss',
  'te': 'tuh',
  'le': 'ull',
  'cial': 'shul',
  'tial': 'shul',
  'tion': 'shun',
  'sion': 'shun',
  'ture': 'cher',
  'sure': 'zher',
  'less': 'less',
  'ful': 'ful',
  'ness': 'ness',
  'ment': 'ment',
  'ly': 'lee',
};

// Phoneme (IPA) to Phonics Sound Map
const PHONEME_AUDIO_MAP: Record<string, string> = {
  '/eɪ/': 'ay',
  '/iː/': 'ee',
  '/aɪ/': 'eye',
  '/oʊ/': 'oh',
  '/juː/': 'yoo',
  '/æ/': 'ah',
  '/e/': 'eh',
  '/ɪ/': 'ih',
  '/ɒ/': 'aw',
  '/ʌ/': 'uh',
  '/ʊ/': 'ooh',
  '/uː/': 'oo',
  '/ɑːr/': 'ar',
  '/ər/': 'er',
  '/ɜːr/': 'er',
  '/ɔːr/': 'or',
  '/er/': 'air',
  '/aʊ/': 'ow',
  '/ɔɪ/': 'oy',
  '/b/': 'buh',
  '/d/': 'duh',
  '/f/': 'fff',
  '/ɡ/': 'guh',
  '/h/': 'huh',
  '/dʒ/': 'juh',
  '/k/': 'kuh',
  '/l/': 'ull',
  '/m/': 'mmm',
  '/n/': 'nnn',
  '/p/': 'puh',
  '/r/': 'rrr',
  '/s/': 'sss',
  '/t/': 'tuh',
  '/v/': 'vvv',
  '/w/': 'wuh',
  '/j/': 'yuh',
  '/z/': 'zzz',
  '/ʃ/': 'shh',
  '/tʃ/': 'chuh',
  '/θ/': 'th',
  '/ð/': 'th',
  '/ŋ/': 'ung',
  '/ŋk/': 'unk',
  '/kw/': 'kwuh',
  '/ʃəl/': 'shul',
  '/ʃən/': 'shun',
  '/ʃəs/': 'shus',
  '/tʃər/': 'cher',
  '/ʒər/': 'zher',
  '/ʃn/': 'shun',
  '/ʒn/': 'zhun',
  '/ləs/': 'less',
  '/fl/': 'ful',
  '/li/': 'lee',
  '/mənt/': 'ment',
  '/nəs/': 'ness',
};

export interface SpeechEvaluationResult {
  score: number;
  recognizedText: string;
  feedback: string;
  audioBlobUrl?: string;
}

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
   * - For sentences: uses Baidu TTS (primary) & Google Translate TTS (fallback)
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

        // Clean text of surrounding quotes and excessive punctuation
        const cleanText = trimmed.replace(/^["'“”«»]+|["'“”«»]+$/g, '').trim();

        // Check if this is a sentence or long phrase
        const isSentence = cleanText.includes(' ') || cleanText.length > 20 || /[,.!?"]/.test(cleanText);

        const primaryUrl = isSentence
          ? `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(cleanText)}&spd=3&source=web`
          : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=2`;

        const fallbackUrl = isSentence
          ? `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`
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

        // Safety timeout: 10s for long sentences, 3.5s for single words
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
   */
  async speakWord(text: string, rate: number = 0.85): Promise<void> {
    const onlineSuccess = await this.playOnlineAudio(text);
    if (onlineSuccess) {
      return;
    }
    await this.speakWithSynth(text, rate, 1.0);
  }

  /**
   * Play true Phonics sound for grapheme/phoneme unit
   * e.g. 'b' -> plays "/b/ (buh)", NOT "bee"!
   * 's' -> plays "/s/ (sss)", NOT "ess"!
   */
  async speakPhoneme(phoneme: string, letters: string): Promise<void> {
    if (phoneme === '∅' || phoneme === 'silent' || (letters === 'e' && phoneme.includes('silent'))) {
      // Silent letter - do not make sound
      return;
    }

    const clean = letters.toLowerCase().trim();

    // 1. Prioritize phoneme IPA sound, then fallback to grapheme guide sound
    const guideSound = PHONEME_AUDIO_MAP[phoneme] || PHONICS_AUDIO_MAP[clean] || clean;

    // 2. Play using Baidu TTS
    const onlineUrl = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(guideSound)}&spd=3&source=web`;
    const played = await new Promise<boolean>((resolve) => {
      try {
        this.cancel();
        const audio = new Audio(onlineUrl);
        this.currentAudio = audio;
        let done = false;
        audio.onended = () => {
          if (!done) {
            done = true;
            this.currentAudio = null;
            resolve(true);
          }
        };
        audio.onerror = () => {
          if (!done) {
            done = true;
            this.currentAudio = null;
            resolve(false);
          }
        };
        setTimeout(() => {
          if (!done) {
            done = true;
            resolve(false);
          }
        }, 2200);
        audio.play().catch(() => {
          if (!done) {
            done = true;
            resolve(false);
          }
        });
      } catch {
        resolve(false);
      }
    });

    if (played) return;

    // 3. Fallback to system synthesizer
    await this.speakWithSynth(guideSound, 0.75, 1.0);
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
   * Start microphone speech recording and evaluation
   * Records user audio, provides real audio playback URL,
   * and calculates transparent, fair pronunciation scores.
   */
  startListening(
    targetWord: string,
    onResult: (result: SpeechEvaluationResult) => void,
    onError: (err: string) => void
  ): () => void {
    let isCancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let audioChunks: Blob[] = [];
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
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          // Ignore
        }
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

      // 2. Setup MediaRecorder for user playback
      try {
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        mediaRecorder.start(100);
      } catch (recErr) {
        console.warn('MediaRecorder not available:', recErr);
      }

      // 3. Set up audio analyser for acoustic tracking
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

          if (avg > 18) {
            voiceFrames++;
            const now = Date.now();
            if (speechStartTime === null) speechStartTime = now;
            speechEndTime = now;

            if (avg > 26 && !isPeak) {
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

      // 4. Web Speech API (if supported)
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

            let audioBlobUrl: string | undefined;
            if (audioChunks.length > 0) {
              const blob = new Blob(audioChunks, { type: 'audio/webm' });
              audioBlobUrl = URL.createObjectURL(blob);
            }

            cleanup();
            onResult({
              score,
              recognizedText: transcript,
              feedback: score >= 75 ? `识别准确: "${transcript}"` : `识别为: "${transcript}" (需重试)`,
              audioBlobUrl,
            });
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

      // 5. Acoustic Evaluation Fallback (evaluates after 3.2s)
      setTimeout(() => {
        if (isCancelled || recognitionHandled) return;
        recognitionHandled = true;

        let audioBlobUrl: string | undefined;
        if (audioChunks.length > 0) {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          audioBlobUrl = URL.createObjectURL(blob);
        }

        const speechDuration =
          speechStartTime && speechEndTime ? speechEndTime - speechStartTime : 0;
        const expectedSyllables = this.countSyllables(targetWord);

        // Case A: No audible speech detected
        if (maxVolumeSeen < 15 || voiceFrames < 5) {
          cleanup();
          onError('未检测到清晰声音，请贴近麦克风大声朗读');
          return;
        }

        // Case B: Sound too brief (cough, tap, click, noise < 220ms)
        if (speechDuration < 220 || voiceFrames < 8) {
          cleanup();
          onResult({
            score: 35,
            recognizedText: '发音过短',
            feedback: '发音过短或未听清，请完整朗读',
            audioBlobUrl,
          });
          return;
        }

        // Case C: Sound too long (said a long sentence > 2500ms)
        if (speechDuration > 2500) {
          cleanup();
          onResult({
            score: 48,
            recognizedText: '发音过长',
            feedback: '发音时长过长，请只读当前单词',
            audioBlobUrl,
          });
          return;
        }

        // Case D: Syllable count mismatch
        if (expectedSyllables === 1 && peakCount >= 3) {
          cleanup();
          onResult({
            score: 52,
            recognizedText: '音节不匹配',
            feedback: '检测到多个音节，请只读当前单词',
            audioBlobUrl,
          });
          return;
        }

        // Case E: Clear speech matching target word structure
        let score = 84;
        if (maxVolumeSeen >= 30 && maxVolumeSeen <= 85) score += 5;
        const idealDuration = expectedSyllables * 500;
        const durationDiff = Math.abs(speechDuration - idealDuration);
        if (durationDiff < 300) score += 6;
        else if (durationDiff < 600) score += 3;

        cleanup();
        onResult({
          score: Math.min(96, score),
          recognizedText: targetWord,
          feedback: '发音响亮清晰，节奏标准',
          audioBlobUrl,
        });
      }, 3200);
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
