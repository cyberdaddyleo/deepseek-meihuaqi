// Local synthesis only. The renderer calls play from a trusted, unmoved click;
// behavior timers, dragging and menu commands do not call this module.
export class PetSound {
  constructor({ createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)(), now = () => performance.now() } = {}) {
    this.createContext = createContext;
    this.now = now;
    this.enabled = true;
    this.disposed = false;
    this.lastAt = -Infinity;
    this.voices = new Set();
  }

  play({ enabled = true, paused = false } = {}) {
    if (this.disposed || !this.enabled || !enabled || paused) return false;
    const now = this.now();
    if (!Number.isFinite(now) || now - this.lastAt < 200) return false;
    try {
      if (!this.context || this.context.state === 'closed') this.context = this.createContext();
      const context = this.context;
      if (context.state === 'suspended') {
        // Resume is invoked synchronously inside the caller's trusted gesture.
        Promise.resolve(context.resume()).catch(() => this.stop());
      }
      this.stop();
      const time = context.currentTime;
      // Peak gains sum to 0.044. Replace the preceding short voice instead of
      // allowing rapid clicks to accumulate volume.
      for (const [frequency, endFrequency, offset, duration, peak] of [[660, 240, 0, .16, .032], [990, 740, .025, .21, .012]]) {
        const oscillator = context.createOscillator(), gain = context.createGain();
        const voice = { oscillator, gain };
        this.voices.add(voice);
        const start = time + offset, end = start + duration;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
        gain.gain.setValueAtTime(0, time);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(peak, start + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, end - .012);
        gain.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => this.release(voice);
        oscillator.start(start);
        oscillator.stop(end);
      }
      this.lastAt = now;
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  release(voice) {
    voice.oscillator.onended = null;
    voice.oscillator.disconnect();
    voice.gain.disconnect();
    this.voices.delete(voice);
  }

  stop() {
    for (const voice of this.voices) {
      try { voice.oscillator.stop(); } catch { /* It may already have ended. */ }
      this.release(voice);
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this.stop();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    if (this.context && this.context.state !== 'closed') {
      try { Promise.resolve(this.context.close()).catch(() => {}); } catch { /* Unavailable audio must not prevent cleanup. */ }
    }
    this.context = undefined;
  }
}
