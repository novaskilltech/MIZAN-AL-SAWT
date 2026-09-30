import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of YIN detector logic
class TestYinDetector {
  constructor(sampleRate = 44100, threshold = 0.15, minFreq = 70, maxFreq = 750) {
    this.sampleRate = sampleRate;
    this.threshold = threshold;
    this.minFreq = minFreq;
    this.maxFreq = maxFreq;
    this.minTau = Math.floor(sampleRate / maxFreq);
    this.maxTau = Math.ceil(sampleRate / minFreq);
    this.yinBuffer = new Float32Array(this.maxTau);
  }

  calculateRMS(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  getPitch(buffer, silenceRmsThreshold = 0.015) {
    const rms = this.calculateRMS(buffer);
    if (rms < silenceRmsThreshold) {
      return { frequency: 0, isVoiced: false };
    }

    const halfLength = Math.floor(buffer.length / 2);
    const maxTau = Math.min(this.maxTau, halfLength);
    if (maxTau <= this.minTau) {
      return { frequency: 0, isVoiced: false };
    }

    for (let tau = 0; tau < maxTau; tau++) {
      let sum = 0;
      for (let i = 0; i < halfLength; i++) {
        const delta = buffer[i] - buffer[i + tau];
        sum += delta * delta;
      }
      this.yinBuffer[tau] = sum;
    }

    this.yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < maxTau; tau++) {
      runningSum += this.yinBuffer[tau];
      this.yinBuffer[tau] = runningSum === 0 ? 1 : (this.yinBuffer[tau] * tau) / runningSum;
    }

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

    if (tauEstimate === -1) {
      let minVal = Infinity;
      for (let tau = this.minTau; tau < maxTau; tau++) {
        if (this.yinBuffer[tau] < minVal) {
          minVal = this.yinBuffer[tau];
          tauEstimate = tau;
        }
      }
      if (minVal > 0.45) {
        return { frequency: 0, isVoiced: false };
      }
    }

    let betterTau;
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

    if (frequency < this.minFreq || frequency > this.maxFreq || confidence < 0.5) {
      return { frequency: 0, isVoiced: false };
    }

    return {
      frequency: Math.round(frequency * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      isVoiced: true,
    };
  }
}

function generateSineWave(freq, sampleRate, numSamples, amplitude = 0.8) {
  const buffer = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    buffer[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  }
  return buffer;
}

test('YIN pitch detector detects 145 Hz sine wave accurately', () => {
  const sampleRate = 44100;
  const detector = new TestYinDetector(sampleRate);
  const buffer = generateSineWave(145, sampleRate, 2048);
  const result = detector.getPitch(buffer);

  assert.equal(result.isVoiced, true);
  assert.ok(Math.abs(result.frequency - 145) < 1.0, `Expected ~145Hz, got ${result.frequency}Hz`);
  assert.ok(result.confidence > 0.9, `Expected high confidence, got ${result.confidence}`);
});

test('YIN pitch detector detects 220 Hz sine wave accurately', () => {
  const sampleRate = 44100;
  const detector = new TestYinDetector(sampleRate);
  const buffer = generateSineWave(220, sampleRate, 2048);
  const result = detector.getPitch(buffer);

  assert.equal(result.isVoiced, true);
  assert.ok(Math.abs(result.frequency - 220) < 1.0, `Expected ~220Hz, got ${result.frequency}Hz`);
});

test('YIN pitch detector rejects pure silence', () => {
  const sampleRate = 44100;
  const detector = new TestYinDetector(sampleRate);
  const buffer = new Float32Array(2048); // All zeros
  const result = detector.getPitch(buffer);

  assert.equal(result.isVoiced, false);
  assert.equal(result.frequency, 0);
});

test('Cents difference formula is exact', () => {
  function calculateCentsDifference(detected, target) {
    if (detected <= 0 || target <= 0) return 0;
    return Math.round(1200 * Math.log2(detected / target));
  }

  // Exact octave = 1200 cents
  assert.equal(calculateCentsDifference(440, 220), 1200);
  // Same pitch = 0 cents
  assert.equal(calculateCentsDifference(150, 150), 0);
  // Semitone higher = 100 cents
  const semitoneAbove = 150 * Math.pow(2, 1 / 12);
  assert.equal(calculateCentsDifference(semitoneAbove, 150), 100);
});
