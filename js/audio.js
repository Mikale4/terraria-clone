// ---------------------------------------------------------------------------
// Procedural sound effects via WebAudio (no external assets)
// ---------------------------------------------------------------------------
'use strict';

const Audio_ = {
  ctx: null,
  enabled: true,
  volume: 0.5,
  noiseBuf: null,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const sr = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, sr, sr);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < sr; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

  _gain(t, vol, attack, decay) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * this.volume, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(this.ctx.destination);
    return g;
  },

  tone(freq, type, vol, dur, slide = 0, attack = 0.005) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    const g = this._gain(t, vol, attack, dur);
    o.connect(g);
    o.start(t); o.stop(t + attack + dur + 0.05);
  },

  noise(vol, dur, filterFreq = 1200, q = 0.7, type = 'bandpass') {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = filterFreq; f.Q.value = q;
    const g = this._gain(t, vol, 0.003, dur);
    src.connect(f); f.connect(g);
    src.start(t); src.stop(t + dur + 0.05);
  },

  // Named effects ---------------------------------------------------------
  play(name) {
    if (!this.ctx || !this.enabled) return;
    switch (name) {
      case 'dig':    this.noise(0.5, 0.08, 900 + Math.random() * 400, 1.2); this.tone(180, 'square', 0.06, 0.05, -80); break;
      case 'dig_stone': this.noise(0.6, 0.1, 2200 + Math.random() * 500, 2); this.tone(120, 'square', 0.08, 0.06, -60); break;
      case 'chop':   this.noise(0.5, 0.12, 600, 1.5); this.tone(220, 'triangle', 0.15, 0.08, -120); break;
      case 'break':  this.noise(0.7, 0.18, 700, 0.8); break;
      case 'place':  this.tone(420, 'square', 0.08, 0.05, -150); this.noise(0.25, 0.05, 1500); break;
      case 'jump':   this.tone(260, 'triangle', 0.12, 0.12, 220); break;
      case 'land':   this.noise(0.25, 0.06, 400); break;
      case 'swing':  this.noise(0.35, 0.14, 1800, 0.5, 'highpass'); break;
      case 'hit':    this.noise(0.5, 0.1, 500, 1); this.tone(150, 'sawtooth', 0.15, 0.08, -80); break;
      case 'hurt':   this.tone(200, 'sawtooth', 0.25, 0.25, -120); this.noise(0.3, 0.15, 300); break;
      case 'kill':   this.noise(0.6, 0.3, 350, 0.6); this.tone(90, 'sawtooth', 0.2, 0.3, -50); break;
      case 'pickup': this.tone(880, 'sine', 0.15, 0.08); setTimeout(() => this.tone(1320, 'sine', 0.15, 0.12), 60); break;
      case 'craft':  this.tone(520, 'square', 0.12, 0.06); setTimeout(() => this.tone(780, 'square', 0.12, 0.1), 70); break;
      case 'menu':   this.tone(600, 'square', 0.06, 0.04, 200); break;
      case 'open':   this.tone(300, 'triangle', 0.15, 0.1, 150); break;
      case 'close':  this.tone(450, 'triangle', 0.15, 0.1, -150); break;
      case 'heal':   this.tone(660, 'sine', 0.15, 0.15, 300); break;
      case 'death':  this.tone(300, 'sawtooth', 0.3, 0.6, -250); this.noise(0.4, 0.5, 250, 0.5); break;
      case 'splash': this.noise(0.4, 0.25, 800, 0.4, 'lowpass'); break;
      case 'door':   this.noise(0.3, 0.08, 500); this.tone(160, 'square', 0.1, 0.08, 60); break;
      case 'slime':  this.tone(160, 'sine', 0.12, 0.12, 80); break;
      case 'zombie': this.tone(90, 'sawtooth', 0.12, 0.35, -30); break;
      case 'levelup': this.tone(523, 'square', 0.12, 0.1); setTimeout(() => this.tone(659, 'square', 0.12, 0.1), 100); setTimeout(() => this.tone(784, 'square', 0.12, 0.25), 200); break;
    }
  }
};
