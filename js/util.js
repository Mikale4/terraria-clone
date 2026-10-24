// ---------------------------------------------------------------------------
// Utility helpers: math, seeded RNG, Perlin noise, text rendering
// ---------------------------------------------------------------------------
'use strict';

const TILE = 16;            // world pixels per tile
const TICK_RATE = 60;       // physics updates per second

let PX_SNAP = 2;            // device pixels per world pixel (set by the renderer)
function snap(v) { return Math.round(v * PX_SNAP) / PX_SNAP; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function choose(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; }
function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }

// Deterministic PRNG (mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashInt(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

// Classic 2D Perlin noise with fractal helper
class Perlin {
  constructor(rng) {
    const perm = new Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = perm[i]; perm[i] = perm[j]; perm[j] = t;
    }
    this.p = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
  }
  static fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  static grad(h, x, y) {
    switch (h & 7) {
      case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
      case 4: return x; case 5: return -x; case 6: return y; default: return -y;
    }
  }
  noise(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = Perlin.fade(x), v = Perlin.fade(y);
    const p = this.p;
    const A = p[X] + Y, B = p[X + 1] + Y;
    return lerp(
      lerp(Perlin.grad(p[A], x, y), Perlin.grad(p[B], x - 1, y), u),
      lerp(Perlin.grad(p[A + 1], x, y - 1), Perlin.grad(p[B + 1], x - 1, y - 1), u), v);
  }
  fbm(x, y, oct = 4, lac = 2, gain = 0.5) {
    let s = 0, a = 1, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += a * this.noise(x * f, y * f); n += a; a *= gain; f *= lac; }
    return s / n;
  }
}

// ---------------------------------------------------------------------------
// Text rendering with outline (Terraria-ish UI look)
// ---------------------------------------------------------------------------
const UI_FONT = "'Andy', 'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";

function drawText(ctx, text, x, y, opt = {}) {
  const size = opt.size || 16;
  const color = opt.color || '#fff';
  const outline = opt.outline === undefined ? '#000' : opt.outline;
  ctx.font = `${opt.weight || 'bold'} ${size}px ${opt.font || UI_FONT}`;
  ctx.textAlign = opt.align || 'left';
  ctx.textBaseline = opt.baseline || 'top';
  if (outline) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = opt.lineWidth || Math.max(2, size / 6);
    ctx.strokeStyle = outline;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function measureText(ctx, text, size, weight = 'bold') {
  ctx.font = `${weight} ${size}px ${UI_FONT}`;
  return ctx.measureText(text).width;
}

// Word-wrap helper
function wrapText(ctx, text, maxWidth, size) {
  ctx.font = `bold ${size}px ${UI_FONT}`;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Color helpers
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) | (clamp(r | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(b | 0, 0, 255)).toString(16).slice(1);
}
function shade(hex, f) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * f, g * f, b * f);
}
function mixColor(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
