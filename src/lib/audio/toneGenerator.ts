/**
 * Reference Tone Generator using Web Audio API.
 * Produces clean, warm acoustic tones (sine with subtle low harmonic)
 * with click-free ADSR envelopes to guide vocalization.
 */
export class ToneGenerator {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx({ latencyHint: 'interactive' });
    }
    return this.audioContext;
  }

  /**
   * Plays a reference tone at a given frequency in Hz
   */
  public async playTone(frequency: number, durationSec?: number): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.stopTone();

    const now = ctx.currentTime;
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();

    // Soft sine wave for vocal neutrality (non-instrumental)
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(frequency, now);

    // Smooth ADSR envelope: 80ms attack
    this.gainNode.gain.setValueAtTime(0.0001, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.08);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(ctx.destination);

    this.oscillator.start(now);
    this.isPlaying = true;

    if (durationSec && durationSec > 0) {
      const stopTime = now + durationSec;
      this.gainNode.gain.setValueAtTime(0.25, stopTime - 0.08);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);
      this.oscillator.stop(stopTime);
      setTimeout(() => {
        this.isPlaying = false;
      }, durationSec * 1000);
    }
  }

  /**
   * Smoothly modulates the current playing tone frequency (e.g. for glissando)
   */
  public rampFrequency(targetFreq: number, timeSec: number = 0.05) {
    if (!this.oscillator || !this.audioContext || !this.isPlaying) return;
    const now = this.audioContext.currentTime;
    this.oscillator.frequency.linearRampToValueAtTime(targetFreq, now + timeSec);
  }

  /**
   * Smoothly stops playing with a 60ms decay ramp
   */
  public stopTone() {
    if (!this.isPlaying || !this.oscillator || !this.gainNode || !this.audioContext) {
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      this.oscillator.stop(now + 0.065);
    } catch {
      // Audio node may already be stopped
    } finally {
      this.oscillator = null;
      this.gainNode = null;
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public dispose() {
    this.stopTone();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
