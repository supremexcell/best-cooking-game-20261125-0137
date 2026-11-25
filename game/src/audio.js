// Warung Rush — Dapur Kilat: every sound is synthesized live with WebAudio.
// No audio files, no network: sizzle is filtered noise, dings are sine bells.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  pop() {
    this.ensure();
    this.tone(520, 0.09, 'triangle', 0.22, 0, 880);
  }

  chop() {
    this.ensure();
    this.tone(190, 0.07, 'square', 0.12, 0, 120);
  }

  ding() {
    this.ensure();
    this.tone(880, 0.5, 'sine', 0.22);
    this.tone(1318, 0.7, 'sine', 0.14, 0.07);
  }

  coin() {
    this.ensure();
    this.tone(988, 0.12, 'sine', 0.2);
    this.tone(1319, 0.18, 'sine', 0.2, 0.09);
    this.tone(1568, 0.3, 'sine', 0.16, 0.18);
  }

  buzz() {
    this.ensure();
    this.tone(140, 0.22, 'sawtooth', 0.14, 0, 90);
  }

  burn() {
    this.ensure();
    this.tone(220, 0.4, 'sawtooth', 0.16, 0, 70);
    this.tone(110, 0.5, 'square', 0.1, 0.1, 55);
  }

  startSizzle() {
    this.ensure();
    if (!this.ctx || this.muted || this.sizzleNodes) return;
    const len = this.ctx.sampleRate * 1.5;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 5200;
    filter.Q.value = 0.6;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
    this.sizzleNodes = { src, gain };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try { this.sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
    this.sizzleNodes = null;
  }
}
