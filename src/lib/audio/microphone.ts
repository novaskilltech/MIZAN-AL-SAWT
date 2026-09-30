import { YinDetector } from './pitchDetection';
import { PitchResult, MicStatus } from '@/types/audio';

export class MicrophoneManager {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private filterHighpass: BiquadFilterNode | null = null;
  private filterLowpass: BiquadFilterNode | null = null;
  private yinDetector: YinDetector | null = null;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private timeDataBuffer: Float32Array<ArrayBuffer> | null = null;
  private onPitchCallback: ((result: PitchResult) => void) | null = null;

  constructor() {}

  /**
   * Initializes microphone and Web Audio processing graph
   */
  public async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        return { success: false, error: 'MediaDevices non supporté sur ce navigateur' };
      }

      // Initialize AudioContext
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ latencyHint: 'interactive' });

      // Request raw microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Resume context if suspended by browser autoplay policy
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const sampleRate = this.audioContext.sampleRate;
      this.yinDetector = new YinDetector(sampleRate, 0.15, 70, 750);

      // Create audio graph: Source -> Highpass (80Hz) -> Lowpass (800Hz) -> Analyser
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.filterHighpass = this.audioContext.createBiquadFilter();
      this.filterHighpass.type = 'highpass';
      this.filterHighpass.frequency.value = 80;

      this.filterLowpass = this.audioContext.createBiquadFilter();
      this.filterLowpass.type = 'lowpass';
      this.filterLowpass.frequency.value = 800;

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0;

      this.sourceNode.connect(this.filterHighpass);
      this.filterHighpass.connect(this.filterLowpass);
      this.filterLowpass.connect(this.analyserNode);

      this.timeDataBuffer = new Float32Array(this.analyserNode.fftSize) as Float32Array<ArrayBuffer>;

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur d’accès au microphone';
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Starts real-time pitch polling loop
   */
  public startAnalysis(onPitch: (result: PitchResult) => void) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onPitchCallback = onPitch;

    const processFrame = () => {
      if (!this.isRunning || !this.analyserNode || !this.timeDataBuffer || !this.yinDetector) {
        return;
      }

      this.analyserNode.getFloatTimeDomainData(this.timeDataBuffer);
      const pitchResult = this.yinDetector.getPitch(this.timeDataBuffer);

      if (this.onPitchCallback) {
        this.onPitchCallback(pitchResult);
      }

      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    this.animationFrameId = requestAnimationFrame(processFrame);
  }

  /**
   * Stops real-time analysis
   */
  public stopAnalysis() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.onPitchCallback = null;
  }

  /**
   * Performs quick calibration test (Section 10 of CDC):
   * checks sound levels, noise floor, and vocal detection
   */
  public async calibrate(durationMs: number = 3000): Promise<MicStatus> {
    if (!this.analyserNode || !this.timeDataBuffer || !this.yinDetector) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return {
          isAvailable: false,
          hasPermission: false,
          rms: 0,
          noiseFloor: 0,
          isCalibrated: false,
          message: initResult.error || 'Microphone non disponible',
        };
      }
    }

    let samplesCount = 0;
    let totalRms = 0;
    let maxRms = 0;
    let detectedPitches = 0;

    const startTime = performance.now();

    return new Promise((resolve) => {
      const poll = () => {
        if (!this.analyserNode || !this.timeDataBuffer || !this.yinDetector) return;

        this.analyserNode.getFloatTimeDomainData(this.timeDataBuffer);
        const rms = this.yinDetector.calculateRMS(this.timeDataBuffer);
        const pitch = this.yinDetector.getPitch(this.timeDataBuffer);

        totalRms += rms;
        if (rms > maxRms) maxRms = rms;
        if (pitch.isVoiced) detectedPitches++;
        samplesCount++;

        if (performance.now() - startTime < durationMs) {
          requestAnimationFrame(poll);
        } else {
          const avgRms = samplesCount > 0 ? totalRms / samplesCount : 0;
          const isSaturated = maxRms > 0.95;
          const isTooQuiet = avgRms < 0.01;

          let message = 'Microphone correctement configuré.';
          if (isSaturated) {
            message = 'Ton niveau sonore est trop élevé. Éloigne légèrement le microphone.';
          } else if (isTooQuiet) {
            message = 'Le signal est très faible. Rapproche-toi ou parle plus fort.';
          }

          resolve({
            isAvailable: true,
            hasPermission: true,
            rms: Math.round(avgRms * 1000) / 1000,
            noiseFloor: Math.round(avgRms * 500) / 1000,
            isCalibrated: !isSaturated && !isTooQuiet,
            message,
          });
        }
      };

      requestAnimationFrame(poll);
    });
  }

  /**
   * Release all resources, close tracks and context
   */
  public dispose() {
    this.stopAnalysis();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.filterHighpass) {
      this.filterHighpass.disconnect();
      this.filterHighpass = null;
    }

    if (this.filterLowpass) {
      this.filterLowpass.disconnect();
      this.filterLowpass = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.timeDataBuffer = null;
    this.yinDetector = null;
  }
}
