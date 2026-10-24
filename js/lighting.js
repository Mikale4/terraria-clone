// ---------------------------------------------------------------------------
// Lighting: RGB light propagation over the visible region, drawn as a smooth
// multiply layer.
// ---------------------------------------------------------------------------
'use strict';

class Lighting {
  constructor() {
    this.w = 0; this.h = 0; this.x0 = 0; this.y0 = 0;
    this.buf = null;           // Float32Array w*h*3
    this.solidMask = null;     // Uint8Array w*h : 0 air, 1 solid
    this.canvas = makeCanvas(1, 1);
    this.img = null;
    this.extraLights = [];     // dynamic lights: {x, y, r, g, b} in tile coords
  }

  ensure(w, h) {
    if (this.w !== w || this.h !== h) {
      this.w = w; this.h = h;
      this.buf = new Float32Array(w * h * 3);
      this.solidMask = new Uint8Array(w * h);
      this.canvas.width = w; this.canvas.height = h;
      this.img = this.canvas.getContext('2d').createImageData(w, h);
    }
  }

  compute(world, x0, y0, w, h) {
    this.ensure(w, h);
    this.x0 = x0; this.y0 = y0;
    const buf = this.buf, mask = this.solidMask;
    buf.fill(0);
    const sky = world.skyLight();
    const tiles = world.tiles, walls = world.walls, W_ = world.w;
    const hellGlow = world.noHell ? 1e9 : world.h - 70;
    // init
    for (let j = 0; j < h; j++) {
      const wy = y0 + j;
      for (let i = 0; i < w; i++) {
        const wx = x0 + i;
        const k = i + j * w;
        let r = 0, g = 0, b = 0;
        if (wx < 0 || wy < 0 || wx >= W_ || wy >= world.h) {
          mask[k] = wy < 0 ? 0 : 1;
          if (wy < 0 || wy < world.surfaceLine) { r = g = b = sky; }
        } else {
          const ti = wx + wy * W_;
          const id = tiles[ti];
          const def = TILES[id];
          mask[k] = (def.solid && !def.transparent) ? 1 : 0;
          if (!def.solid && walls[ti] === 0 && wy < world.topSolid[wx]) { r = g = b = sky; }
          if (def.light) {
            const L = def.light;
            if (L[0] > r) r = L[0]; if (L[1] > g) g = L[1]; if (L[2] > b) b = L[2];
          }
          if (world.lava[ti] && world.liquid[ti] > 0) { r = Math.max(r, 0.9); g = Math.max(g, 0.4); b = Math.max(b, 0.1); }
          if (wy > hellGlow && !def.solid) { r = Math.max(r, 0.35); g = Math.max(g, 0.12); b = Math.max(b, 0.05); }
        }
        buf[k * 3] = r; buf[k * 3 + 1] = g; buf[k * 3 + 2] = b;
      }
    }
    // dynamic lights
    for (const L of this.extraLights) {
      const i = Math.floor(L.x) - x0, j = Math.floor(L.y) - y0;
      if (i < 0 || j < 0 || i >= w || j >= h) continue;
      const k = (i + j * w) * 3;
      if (L.r > buf[k]) buf[k] = L.r; if (L.g > buf[k + 1]) buf[k + 1] = L.g; if (L.b > buf[k + 2]) buf[k + 2] = L.b;
    }
    this.extraLights.length = 0;
    // propagate
    const AIR_DECAY = 0.86, SOLID_DECAY = 0.58;
    for (let iter = 0; iter < 2; iter++) {
      // left -> right
      for (let j = 0; j < h; j++) {
        let base = j * w;
        for (let i = 1; i < w; i++) {
          const k = base + i, kp = k - 1;
          const d = mask[kp] ? SOLID_DECAY : AIR_DECAY;
          const k3 = k * 3, p3 = kp * 3;
          let v = buf[p3] * d; if (v > buf[k3]) buf[k3] = v;
          v = buf[p3 + 1] * d; if (v > buf[k3 + 1]) buf[k3 + 1] = v;
          v = buf[p3 + 2] * d; if (v > buf[k3 + 2]) buf[k3 + 2] = v;
        }
        for (let i = w - 2; i >= 0; i--) {
          const k = base + i, kp = k + 1;
          const d = mask[kp] ? SOLID_DECAY : AIR_DECAY;
          const k3 = k * 3, p3 = kp * 3;
          let v = buf[p3] * d; if (v > buf[k3]) buf[k3] = v;
          v = buf[p3 + 1] * d; if (v > buf[k3 + 1]) buf[k3 + 1] = v;
          v = buf[p3 + 2] * d; if (v > buf[k3 + 2]) buf[k3 + 2] = v;
        }
      }
      for (let i = 0; i < w; i++) {
        for (let j = 1; j < h; j++) {
          const k = i + j * w, kp = k - w;
          const d = mask[kp] ? SOLID_DECAY : AIR_DECAY;
          const k3 = k * 3, p3 = kp * 3;
          let v = buf[p3] * d; if (v > buf[k3]) buf[k3] = v;
          v = buf[p3 + 1] * d; if (v > buf[k3 + 1]) buf[k3 + 1] = v;
          v = buf[p3 + 2] * d; if (v > buf[k3 + 2]) buf[k3 + 2] = v;
        }
        for (let j = h - 2; j >= 0; j--) {
          const k = i + j * w, kp = k + w;
          const d = mask[kp] ? SOLID_DECAY : AIR_DECAY;
          const k3 = k * 3, p3 = kp * 3;
          let v = buf[p3] * d; if (v > buf[k3]) buf[k3] = v;
          v = buf[p3 + 1] * d; if (v > buf[k3 + 1]) buf[k3 + 1] = v;
          v = buf[p3 + 2] * d; if (v > buf[k3 + 2]) buf[k3 + 2] = v;
        }
      }
    }
    // write image
    const data = this.img.data;
    for (let k = 0, n = w * h; k < n; k++) {
      const k3 = k * 3, k4 = k * 4;
      data[k4] = Math.min(255, buf[k3] * 255);
      data[k4 + 1] = Math.min(255, buf[k3 + 1] * 255);
      data[k4 + 2] = Math.min(255, buf[k3 + 2] * 255);
      data[k4 + 3] = 255;
    }
    this.canvas.getContext('2d').putImageData(this.img, 0, 0);
  }

  // Brightness at world tile (x,y), 0..1 (max channel)
  at(x, y) {
    const i = x - this.x0, j = y - this.y0;
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return 0;
    const k = (i + j * this.w) * 3;
    return Math.max(this.buf[k], this.buf[k + 1], this.buf[k + 2]);
  }
}
