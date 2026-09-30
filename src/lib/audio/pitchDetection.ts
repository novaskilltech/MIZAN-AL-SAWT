import { PitchResult } from '@/types/audio';

/**
 * YIN Pitch Detection Algorithm implementation in TypeScript.
 * Deterministic, low-latency, and runs entirely in the browser.
 */
export class YinDetector {
  private threshold: number;
  private sampleRate: number;
  private minFreq: number;
  private maxFreq: number;
  private minTau: number;
  private maxTau: number;
  private yinBuffer: Float32Array;

  constructor(
    sampleRate: number = 44100,
    threshold: number = 0.15,
    minFreq: number = 70,
    maxFreq: number = 750
  ) {
    this.sampleRate = sampleRate;
    this.threshold = threshold;
    this.minFreq = minFreq;
    this.maxFreq = maxFreq;

    // tau is lag in samples: tau = sampleRate / frequency
    this.minTau = Math.floor(sampleRate / maxFreq);
    this.maxTau = Math.ceil(sampleRate / minFreq);
    this.yinBuffer = new Float32Array(this.maxTau);
  }

  public setSampleRate(sampleRate: number) {
    this.sampleRate = sampleRate;
    this.minTau = Math.floor(sampleRate / this.maxFreq);
    this.maxTau = Math.ceil(sampleRate / this.minFreq);
    this.yinBuffer = new Float32Array(this.maxTau);
  }

  /**
   * Calculate Root Mean Square (RMS) volume of the audio buffer
   */
  public calculateRMS(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  /**
   * Main pitch detection method
   */
  public getPitch(buffer: Float32Array, silenceRmsThreshold: number = 0.015): PitchResult {
    const timestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const rms = this.calculateRMS(buffer);

    // If signal is too quiet, it's silence or background noise
    if (rms < silenceRmsThreshold) {
      return {
        frequency: 0,
        confidence: 0,
        clarity: 0,
        rms,
        isVoiced: false,
        timestamp,
      };
    }

    const halfLength = Math.floor(buffer.length / 2);
    const maxTau = Math.min(this.maxTau, halfLength);

    if (maxTau <= this.minTau) {
      return {
        frequency: 0,
        confidence: 0,
        clarity: 0,
        rms,
        isVoiced: false,
        timestamp,
      };
    }

    // Step 1: Difference function
    for (let tau = 0; tau < maxTau; tau++) {
      let sum = 0;
      for (let i = 0; i < halfLength; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      this.yinBuffer[tau] = sum;
    }

    // Step 2: Cumulative mean normalized difference function
    this.yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < maxTau; tau++) {
      runningSum += this.yinBuffer[tau];
      this.yinBuffer[tau] = runningSum === 0 ? 1 : (this.yinBuffer[tau] * tau) / runningSum;
    }

    // Step 3: Absolute threshold
    let tauEstimate = -1;
    for (let tau = this.minTau; tau < maxTau; tau++) {
      if (this.yinBuffer[tau] < this.threshold) {
        while (tau + 1 < maxTau && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    // If no tau was found below threshold, find global minimum tau
    if (tauEstimate === -1) {
      let minVal = Infinity;
      for (let tau = this.minTau; tau < maxTau; tau++) {
        if (this.yinBuffer[tau] < minVal) {
          minVal = this.yinBuffer[tau];
          tauEstimate = tau;
        }
      }
      // If the global minimum is still too noisy (high aperiodicity), reject
      if (minVal > 0.45) {
        return {
          frequency: 0,
          confidence: Math.max(0, 1 - minVal),
          clarity: 0,
          rms,
          isVoiced: false,
          timestamp,
        };
      }
    }

    // Step 4: Parabolic interpolation for sub-sample precision
    let betterTau: number;
    const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
    const x2 = tauEstimate + 1 < maxTau ? tauEstimate + 1 : tauEstimate;

    if (x0 === tauEstimate) {
      betterTau = this.yinBuffer[tauEstimate] <= this.yinBuffer[x2] ? tauEstimate : x2;
    } else if (x2 === tauEstimate) {
      betterTau = this.yinBuffer[tauEstimate] <= this.yinBuffer[x0] ? tauEstimate : x0;
    } else {
      const s0 = this.yinBuffer[x0];
      const s1 = this.yinBuffer[tauEstimate];
      const s2 = this.yinBuffer[x2];
      const denominator = 2 * (2 * s1 - s2 - s0);
      betterTau = denominator === 0 ? tauEstimate : tauEstimate + (s2 - s0) / denominator;
    }

    const frequency = this.sampleRate / betterTau;
    const aperiodicity = this.yinBuffer[tauEstimate];
    const confidence = Math.max(0, Math.min(1, 1 - aperiodicity));

    // Check bounds
    if (frequency < this.minFreq || frequency > this.maxFreq || confidence < 0.5) {
      return {
        frequency: 0,
        confidence,
        clarity: 0,
        rms,
        isVoiced: false,
        timestamp,
      };
    }

    return {
      frequency: Math.round(frequency * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      clarity: Math.round(confidence * 100) / 100,
      rms: Math.round(rms * 1000) / 1000,
      isVoiced: true,
      timestamp,
    };
  }
}

/**
 * Calculates cents difference between detected and target frequency
 * positive = higher than target (sharp)
 * negative = lower than target (flat)
 */
export function calculateCentsDifference(detected: number, target: number): number {
  if (detected <= 0 || target <= 0) return 0;
  return Math.round(1200 * Math.log2(detected / target));
}

/**
 * Simple intuitive feedback as mandated by CDC Section 12 & 14:
 * "✓ Juste", "↑ Un peu plus haut", "↓ Un peu plus bas", "→ Stabilise"
 */
export function getIntuitiveFeedback(centsDiff: number): {
  text: string;
  code: 'correct' | 'too_low' | 'too_high' | 'near';
  color: string;
} {
  const abs = Math.abs(centsDiff);
  if (abs <= 40) {
    return { text: '✓ Juste', code: 'correct', color: 'text-emerald-400' };
  } else if (centsDiff < -40) {
    return { text: '↑ Monte un peu', code: 'too_low', color: 'text-amber-400' };
  } else {
    return { text: '↓ Descends un peu', code: 'too_high', color: 'text-sky-400' };
  }
}
