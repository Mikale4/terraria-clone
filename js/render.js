// ---------------------------------------------------------------------------
// Rendering: sky, parallax backgrounds, tiles, walls, liquids, lighting, map
// ---------------------------------------------------------------------------
'use strict';

const SKY_KEYS = [ // hour, top, bottom
  [0, '#04061a', '#0c1030'],
  [4.5, '#04061a', '#0c1030'],
  [5.5, '#2a2650', '#d07050'],
  [7, '#3a6ad0', '#a8d8f8'],
  [12, '#3760da', '#9ed0f8'],
  [17.5, '#3a5ac0', '#f0b060'],
  [18.7, '#22184a', '#70304a'],
  [20, '#04061a', '#0c1030'],
  [24, '#04061a', '#0c1030'],
];

function skyColors(hour) {
  for (let i = 0; i < SKY_KEYS.length - 1; i++) {
    const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
    if (hour >= a[0] && hour <= b[0]) {
      const t = smoothstep((hour - a[0]) / (b[0] - a[0]));
      return [mixColor(a[1], b[1], t), mixColor(a[2], b[2], t)];
    }
  }
  return [SKY_KEYS[0][1], SKY_KEYS[0][2]];
}

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zoom = 2;
    this.scene = makeCanvas(16, 16);
    this.sctx = this.scene.getContext('2d');
    this.lit = makeCanvas(16, 16);
    this.lctx = this.lit.getContext('2d');
    this.bg = makeCanvas(16, 16);
    this.bctx = this.bg.getContext('2d');
    this.vw = 0; this.vh = 0;
    this.layers = [];
    this.stars = [];
    this.clouds = [];
    this.ugPattern = null; this.cavePattern = null;
    this.mapCanvas = null; this.mapImg = null;
    this.frame = 0;
    this.buildStars();
  }

  resize() {
    // The world is rendered at true device resolution (canvas pixels = CSS pixels x devicePixelRatio)
    // through a scaled transform, so the camera and sprites move in whole device pixels and the
    // browser never has to resample the canvas (no shimmer on 125%/150% display scaling).
    this.dpr = window.devicePixelRatio || 1;
    this.W = window.innerWidth; this.H = window.innerHeight;           // CSS pixels (UI space)
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.canvas.style.width = this.W + 'px'; this.canvas.style.height = this.H + 'px';
    this.vw = this.W / this.zoom;                                       // world units visible
    this.vh = this.H / this.zoom;
    const k = this.zoom * this.dpr;                                     // device pixels per world pixel
    PX_SNAP = k;
    for (const c of [this.scene, this.lit, this.bg]) { c.width = this.canvas.width; c.height = this.canvas.height; }
    for (const x of [this.sctx, this.lctx, this.bctx]) { x.setTransform(k, 0, 0, k, 0, 0); x.imageSmoothingEnabled = false; }
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  // Switch the main context between device space (blitting) and CSS space (UI)
  uiTransform() { this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); }
  deviceTransform() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); }

  buildStars() {
    const rng = mulberry32(42);
    for (let i = 0; i < 420; i++) this.stars.push({ x: rng(), y: rng() * 0.8, s: rng() < 0.25 ? 2 : 1, tw: rng() * 6.28 });
    for (let i = 0; i < 12; i++) this.clouds.push({ x: rng() * 3000, y: 20 + rng() * 140, w: 60 + rng() * 120, h: 14 + rng() * 18, spd: 0.05 + rng() * 0.1, a: 0.5 + rng() * 0.4 });
  }

  // Parallax layers (procedural silhouettes)
  buildBackgrounds(seed) {
    const rng = mulberry32(seed + 77);
    const perlin = new Perlin(rng);
    this.layers = [];
    const mk = (w, h, color, fn) => { const c = makeCanvas(w, h); const x = c.getContext('2d'); fn(x, w, h); return { canvas: c, color }; };
    // far mountains
    this.layers.push(Object.assign(mk(1200, 320, '#6f7fb4', (x, w, h) => {
      x.fillStyle = '#6f7fb4';
      x.beginPath(); x.moveTo(0, h);
      for (let i = 0; i <= w; i += 4) { const n = perlin.fbm(i * 0.004, 1.5, 4) * 90 + perlin.fbm(i * 0.02, 2.5, 2) * 20; x.lineTo(i, 150 - n); }
      x.lineTo(w, h); x.closePath(); x.fill();
      // snow caps / lighter ridges
      x.fillStyle = '#8b9ac8';
      x.beginPath(); x.moveTo(0, h);
      for (let i = 0; i <= w; i += 4) { const n = perlin.fbm(i * 0.004, 1.5, 4) * 90 + perlin.fbm(i * 0.02, 2.5, 2) * 20; x.lineTo(i, 150 - n + 30 + Math.abs(perlin.noise(i * 0.05, 8)) * 30); }
      x.lineTo(w, h); x.closePath(); x.fill();
    }), { px: 0.12, py: 0.25, yoff: -40 }));
    // mid hills with pines
    this.layers.push(Object.assign(mk(1200, 300, '#3f5c74', (x, w, h) => {
      x.fillStyle = '#3f5c74';
      x.beginPath(); x.moveTo(0, h);
      for (let i = 0; i <= w; i += 4) { const n = perlin.fbm(i * 0.006 + 30, 4.5, 3) * 40; x.lineTo(i, 200 - n); }
      x.lineTo(w, h); x.closePath(); x.fill();
      // pines
      for (let i = 0; i < w; i += 8 + Math.floor(rng() * 10)) {
        const n = perlin.fbm(i * 0.006 + 30, 4.5, 3) * 40;
        const base = 200 - n + 4, th = 30 + rng() * 40, tw = 8 + rng() * 8;
        x.fillStyle = rng() < 0.5 ? '#35506a' : '#3a5670';
        x.beginPath(); x.moveTo(i - tw / 2, base); x.lineTo(i, base - th); x.lineTo(i + tw / 2, base); x.closePath(); x.fill();
      }
    }), { px: 0.3, py: 0.4, yoff: -10 }));
    // near forest
    this.layers.push(Object.assign(mk(1200, 260, '#2e4a3e', (x, w, h) => {
      x.fillStyle = '#2e4a3e';
      x.beginPath(); x.moveTo(0, h);
      for (let i = 0; i <= w; i += 4) { const n = perlin.fbm(i * 0.01 + 60, 7.5, 2) * 16; x.lineTo(i, 190 - n); }
      x.lineTo(w, h); x.closePath(); x.fill();
      for (let i = 0; i < w; i += 14 + Math.floor(rng() * 20)) {
        const n = perlin.fbm(i * 0.01 + 60, 7.5, 2) * 16;
        const base = 190 - n + 6, th = 60 + rng() * 90, tw = 18 + rng() * 14;
        const col = rng() < 0.5 ? '#2a4438' : '#334f42';
        x.fillStyle = col;
        // trunk
        x.fillRect(i - 2, base - th * 0.6, 4, th * 0.6);
        // tiers
        for (let k = 0; k < 4; k++) {
          const ty = base - th * (0.25 + k * 0.22), tww = tw * (1 - k * 0.18);
          x.beginPath(); x.moveTo(i - tww / 2, ty); x.lineTo(i, ty - th * 0.3); x.lineTo(i + tww / 2, ty); x.closePath(); x.fill();
        }
      }
    }), { px: 0.5, py: 0.55, yoff: 20 }));

    // underground background patterns
    const mkPat = (base, cols) => { const c = makeCanvas(64, 64); const x = c.getContext('2d'); speckle(x, mulberry32(seed + 5), base, cols, 400, 0, 0, 64, 64); for (let i = 0; i < 12; i++) { x.fillStyle = cols[0]; x.fillRect(Math.floor(rng() * 60), Math.floor(rng() * 60), 3 + Math.floor(rng() * 4), 2); } return this.sctx.createPattern(c, 'repeat'); };
    this.ugPattern = mkPat('#3a2818', ['#2e1e10', '#44301e', '#281808']);
    this.cavePattern = mkPat('#26262c', ['#1e1e24', '#2e2e34', '#18181e']);
    this.hellPattern = mkPat('#2a1a1e', ['#1e1014', '#34222a', '#180c10']);
  }

  // ----------------------------------------------------------------------------
  drawSky(world, cam, hour) {
    const x = this.bctx, vw = this.vw, vh = this.vh;
    const [top, bot] = world.skyOverride || skyColors(hour);
    if (world.skyOverride) { const g0 = x.createLinearGradient(0, 0, 0, vh); g0.addColorStop(0, top); g0.addColorStop(1, bot); x.fillStyle = g0; x.fillRect(0, 0, vw, vh); if (world.stars) { x.fillStyle = '#fff'; for (const s of this.stars) { const tw = 0.5 + 0.5 * Math.sin(this.frame * 0.05 + s.tw); x.globalAlpha = tw; x.fillRect(Math.floor(((s.x * 3000 - cam.x * 0.02) % vw + vw) % vw), Math.floor(((s.y * 1200 - cam.y * 0.03) % vh + vh) % vh), s.s, s.s); } x.globalAlpha = 1; } return; }
    const depthF = clamp((cam.y / TILE + vh / TILE / 2 - world.surfaceLine) / 60, 0, 1);
    const g = x.createLinearGradient(0, 0, 0, vh);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    x.fillStyle = g; x.fillRect(0, 0, vw, vh);
    // stars
    const night = 1 - world.daylight();
    if (night > 0.05) {
      x.fillStyle = '#fff';
      for (const s of this.stars) {
        const tw = 0.5 + 0.5 * Math.sin(this.frame * 0.05 + s.tw);
        x.globalAlpha = night * (0.55 + 0.45 * tw);
        x.fillRect(Math.floor(((s.x * 3000 - cam.x * 0.02) % vw + vw) % vw), Math.floor(((s.y * 1200 - cam.y * 0.03) % vh + vh) % vh), s.s, s.s);
      }
      x.globalAlpha = 1;
    }
    // sun / moon
    const day = world.isDay();
    const dayT = day ? (hour - 4.5) / 15 : ((hour + 24 - 19.5) % 24) / 9;
    const ang = Math.PI * (1 - dayT);
    const cxs = vw / 2 + Math.cos(ang) * vw * 0.45, cys = vh * 0.55 - Math.sin(ang) * vh * 0.45 - cam.y * 0.03 + 60;
    if (day) {
      const gr = x.createRadialGradient(cxs, cys, 6, cxs, cys, 40);
      gr.addColorStop(0, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.3, 'rgba(255,230,150,0.35)'); gr.addColorStop(1, 'rgba(255,220,120,0)');
      x.fillStyle = gr; x.fillRect(cxs - 40, cys - 40, 80, 80);
      x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(cxs, cys, 12, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#ffe890'; x.beginPath(); x.arc(cxs, cys, 9, 0, Math.PI * 2); x.fill();
    } else {
      // moon with phase (0 = full, 4 = new)
      const phase = world.moonPhase || 0;
      x.fillStyle = world.bloodMoon ? '#ff6a5a' : '#e8e8f0'; x.beginPath(); x.arc(cxs, cys, 11, 0, Math.PI * 2); x.fill();
      x.fillStyle = world.bloodMoon ? '#d04a3a' : '#c8c8d4'; x.beginPath(); x.arc(cxs - 4, cys - 3, 3, 0, Math.PI * 2); x.arc(cxs + 3, cys + 4, 2, 0, Math.PI * 2); x.fill();
      if (phase !== 0) {
        const f = phase / 8; // 0..1 around the cycle
        const shadow = f <= 0.5 ? f * 2 : (1 - f) * 2; // 0 full .. 1 new
        const dir = f <= 0.5 ? 1 : -1;
        x.fillStyle = top; x.beginPath();
        if (shadow >= 0.99) x.arc(cxs, cys, 11.5, 0, Math.PI * 2);
        else { x.arc(cxs + dir * (1 - shadow) * 14, cys, 11 + (1 - shadow) * 2, 0, Math.PI * 2); }
        x.fill();
      }
    }
    if (world.bloodMoon) { x.fillStyle = 'rgba(200,30,30,0.22)'; x.fillRect(0, 0, vw, vh); }
    // clouds
    const dl = world.daylight();
    for (const c of this.clouds) {
      c.x += c.spd;
      const sx = ((c.x - cam.x * 0.15) % (vw + 300) + (vw + 300)) % (vw + 300) - 150;
      const sy = c.y - cam.y * 0.08 + 40;
      x.globalAlpha = c.a * (0.35 + 0.65 * dl);
      x.fillStyle = mixColor('#ffffff', '#3a3a5a', 1 - dl);
      roundRect(x, sx, sy, c.w, c.h, c.h / 2); x.fill();
      roundRect(x, sx + c.w * 0.2, sy - c.h * 0.5, c.w * 0.5, c.h, c.h / 2); x.fill();
      roundRect(x, sx + c.w * 0.5, sy - c.h * 0.3, c.w * 0.4, c.h, c.h / 2); x.fill();
    }
    x.globalAlpha = 1;
    // parallax layers
    const horizonY = (world.surfaceLine - 8) * TILE;
    const tint = 0.25 + 0.75 * dl;
    for (const L of this.layers) {
      const c = L.canvas;
      const bottom = vh * 0.72 + (horizonY - cam.y - vh * 0.72) * L.py + L.yoff;
      const top = bottom - c.height;
      const ox = -((cam.x * L.px) % c.width);
      for (let sx = ox - c.width; sx < vw; sx += c.width) x.drawImage(c, Math.floor(sx), Math.floor(top));
      x.fillStyle = L.color; if (bottom < vh) x.fillRect(0, Math.floor(bottom) - 1, vw, vh - bottom + 1);
    }
    // night tint on backgrounds
    if (tint < 1) { x.fillStyle = `rgba(4,6,26,${(1 - tint) * 0.85})`; x.globalCompositeOperation = 'source-over'; x.fillRect(0, 0, vw, vh); }
    // dusk warm tint
    if (hour > 17 && hour < 19.5) { x.fillStyle = `rgba(255,120,60,${0.15 * Math.sin((hour - 17) / 2.5 * Math.PI)})`; x.fillRect(0, 0, vw, vh); }
    // deep underground: fade the sky out entirely
    if (depthF > 0) { x.fillStyle = `rgba(0,0,0,${depthF})`; x.fillRect(0, 0, vw, vh); }
  }

  // ----------------------------------------------------------------------------
  drawScene(game) {
    const world = game.world, cam = game.cam;
    const s = this.sctx, vw = this.vw, vh = this.vh;
    s.clearRect(0, 0, vw, vh);
    const x0 = Math.floor(cam.x / TILE) - 1, y0 = Math.floor(cam.y / TILE) - 1;
    const x1 = Math.ceil((cam.x + vw) / TILE) + 1, y1 = Math.ceil((cam.y + vh) / TILE) + 1;
    const ox = -cam.x, oy = -cam.y;

    // underground background
    const sl = world.surfaceLine, cl = world.cavernLine, hl = world.noHell ? world.h : world.h - 70;
    const bandTop = (sl - 8) * TILE + oy;
    if (bandTop < vh) {
      s.save();
      s.translate(ox % 64, oy % 64);
      const drawBand = (pattern, yStart, yEnd, alpha) => {
        const a = Math.max(yStart, 0), b = Math.min(yEnd, vh);
        if (b <= a) return;
        s.globalAlpha = alpha; s.fillStyle = pattern;
        s.fillRect(-(ox % 64) - 64, a - (oy % 64), vw + 128, b - a);
      };
      // fade in over 8 tiles
      for (let k = 0; k < 8; k++) drawBand(this.ugPattern, (sl - 8 + k) * TILE + oy, (sl - 7 + k) * TILE + oy, (k + 1) / 8);
      drawBand(this.ugPattern, sl * TILE + oy, cl * TILE + oy, 1);
      drawBand(this.cavePattern, cl * TILE + oy, hl * TILE + oy, 1);
      drawBand(this.hellPattern, hl * TILE + oy, world.h * TILE + oy, 1);
      s.globalAlpha = 1;
      s.restore();
    }

    // walls
    const walls = world.walls, tiles = world.tiles, W_ = world.w;
    for (let ty = Math.max(0, y0); ty <= Math.min(world.h - 1, y1); ty++) {
      for (let tx = Math.max(0, x0); tx <= Math.min(W_ - 1, x1); tx++) {
        const i = tx + ty * W_;
        const wl = walls[i];
        if (wl === 0) continue;
        const id = tiles[i];
        if (TILES[id].solid && !TILES[id].transparent) continue; // hidden behind a block
        s.drawImage(Sprites.walls[wl], tx * TILE + ox, ty * TILE + oy);
      }
    }
    // wall edge shading: darken where wall meets open air (no wall) for depth
    s.fillStyle = 'rgba(0,0,0,0.25)';
    for (let ty = Math.max(1, y0); ty <= Math.min(world.h - 2, y1); ty++) {
      for (let tx = Math.max(1, x0); tx <= Math.min(W_ - 2, x1); tx++) {
        const i = tx + ty * W_;
        if (walls[i] === 0 || TILES[tiles[i]].solid) continue;
        const sx = tx * TILE + ox, sy = ty * TILE + oy;
        if (walls[i - W_] === 0 && !TILES[tiles[i - W_]].solid) s.fillRect(sx, sy, 16, 2);
        if (walls[i - 1] === 0 && !TILES[tiles[i - 1]].solid) s.fillRect(sx, sy, 2, 16);
        if (walls[i + 1] === 0 && !TILES[tiles[i + 1]].solid) s.fillRect(sx + 14, sy, 2, 16);
        if (walls[i + W_] === 0 && !TILES[tiles[i + W_]].solid) s.fillRect(sx, sy + 14, 16, 2);
      }
    }

    // tiles
    const canopies = [];
    const torchFrame = Math.floor(this.frame / 6) % 3;
    for (let ty = Math.max(0, y0 - 4); ty <= Math.min(world.h - 1, y1); ty++) {
      for (let tx = Math.max(0, x0 - 3); tx <= Math.min(W_ - 1, x1 + 3); tx++) {
        const i = tx + ty * W_;
        const id = tiles[i];
        if (id === T.AIR) continue;
        const sx = tx * TILE + ox, sy = ty * TILE + oy;
        const def = TILES[id];
        if (id === T.TREETOP) { canopies.push(tx, ty); continue; }
        if (tx < x0 || ty < y0) continue; // margin only needed for canopies
        const d = world.tdata[i];
        if (def.furniture) {
          if ((d & 15) !== 0) continue; // only draw at anchor
          const spr = Sprites.furniture[id];
          if (spr) {
            if (id === T.CAMPFIRE) { s.drawImage(spr, sx, sy); s.fillStyle = `rgba(255,${150 + torchFrame * 30},60,0.5)`; s.fillRect(sx + 18 + torchFrame, sy - 2 - torchFrame, 12 - torchFrame * 2, 6); }
            else s.drawImage(spr, sx, sy);
          }
          continue;
        }
        switch (id) {
          case T.TORCH: s.drawImage(Sprites.torch[(torchFrame + tx) % 3], sx, sy); break;
          case T.PLANT: s.drawImage(Sprites.misc.plants[d % 7], sx, sy); break;
          case T.SAPLING: s.drawImage(Sprites.furniture[T.SAPLING], sx, sy); break;
          case T.LIFECRYSTAL: { const bob = Math.sin(this.frame * 0.08 + tx) * 1.5; s.drawImage(Sprites.furniture[T.LIFECRYSTAL], sx, sy + bob); break; }
          case T.COBWEB: s.drawImage(Sprites.furniture[T.COBWEB], sx, sy); break;
          case T.MUSHROOM_GLOW: s.drawImage(Sprites.furniture[T.MUSHROOM_GLOW], sx, sy); break;
          case T.LANTERN: s.drawImage(Sprites.furniture[T.LANTERN], sx, sy); break;
          case T.TREE: {
            const b = Sprites.trunk[world.biome[tx]] ? world.biome[tx] : 0;
            s.drawImage(Sprites.trunk[b], (d & 3) * 16, 0, 16, 16, sx, sy, 16, 16);
            if (d & 4) s.drawImage(Sprites.branch[b][0], sx - 14, sy - 12);
            if (d & 8) s.drawImage(Sprites.branch[b][1], sx - 2, sy - 12);
            // roots at base
            if (!(world.get(tx, ty + 1) === T.TREE)) { s.fillStyle = '#5a3a1e'; s.fillRect(sx, sy + 12, 3, 4); s.fillRect(sx + 13, sy + 12, 3, 4); }
            break;
          }
          case T.PLATFORM: {
            const c = Sprites.icons['platform'];
            s.drawImage(c, sx, sy);
            break;
          }
          default: {
            // solid-ish block with edge mask
            const strip = id === T.GEM ? Sprites.gems[d % 6] : Sprites.tiles[id];
            if (!strip) break;
            let mask = 0;
            if (!TILES[world.get(tx, ty - 1)].solid) mask |= 1;
            if (!TILES[world.get(tx + 1, ty)].solid) mask |= 2;
            if (!TILES[world.get(tx, ty + 1)].solid) mask |= 4;
            if (!TILES[world.get(tx - 1, ty)].solid) mask |= 8;
            const variant = hashInt(tx, ty) % 3;
            s.drawImage(strip[variant], mask * 16, 0, 16, 16, sx, sy, 16, 16);
            // snow cap on grass in snow biome / ice look handled by tile type already
          }
        }
        // cracks
        const dmg = world.tileDamage.get(i);
        if (dmg) {
          const stage = Math.min(3, Math.floor(dmg.frac * 4));
          s.drawImage(Sprites.cracks[stage], sx, sy);
        }
      }
    }
    // canopies (drawn on top)
    for (let k = 0; k < canopies.length; k += 2) {
      const tx = canopies[k], ty = canopies[k + 1];
      const b = Sprites.canopy[world.biome[tx]] ? world.biome[tx] : 0;
      const c = Sprites.canopy[b];
      const sway = Math.sin(this.frame * 0.02 + tx * 0.7) * 1.5;
      s.drawImage(c, tx * TILE + ox - 32 + sway, ty * TILE + oy - 48);
    }

    // liquids
    const L = world.liquid;
    for (let ty = Math.max(0, y0); ty <= Math.min(world.h - 1, y1); ty++) {
      for (let tx = Math.max(0, x0); tx <= Math.min(W_ - 1, x1); tx++) {
        const i = tx + ty * W_;
        const amt = L[i];
        if (amt === 0) continue;
        const above = ty > 0 ? L[i - W_] : 0;
        const full = above > 0 || TILES[tiles[i]].solid;
        const hgt = full ? 16 : Math.max(2, Math.round(amt / 255 * 16));
        const sx = tx * TILE + ox, sy = ty * TILE + oy + 16 - hgt;
        if (world.lava[i]) {
          s.fillStyle = 'rgba(255,90,20,0.92)'; s.fillRect(sx, sy, 16, hgt);
          if (!full) { s.fillStyle = 'rgba(255,200,80,0.9)'; s.fillRect(sx, sy, 16, 1); }
          if (((tx * 7 + ty * 13 + (this.frame >> 4)) % 11) === 0) { s.fillStyle = 'rgba(255,220,120,0.8)'; s.fillRect(sx + (tx * 5) % 12, sy + 3, 2, 2); }
        } else {
          s.fillStyle = 'rgba(28,80,200,0.55)'; s.fillRect(sx, sy, 16, hgt);
          if (!full) { const wave = Math.sin(this.frame * 0.08 + tx * 0.9) > 0 ? 1 : 0; s.fillStyle = 'rgba(160,210,255,0.6)'; s.fillRect(sx, sy + wave, 16, 1); }
        }
      }
    }
  }

  // ----------------------------------------------------------------------------
  drawEntities(game) {
    const s = this.sctx, cam = game.cam;
    for (const d of game.drops) d.draw(s, cam.x, cam.y, this.frame);
    if (game.pets.pet && (game.pets.pet.id === 'dog_whistle' || game.pets.alert > 0)) { s.fillStyle = 'rgba(200,80,255,0.35)'; for (const e of game.enemies) { s.beginPath(); s.arc(e.cx - cam.x, e.cy - cam.y, Math.max(e.w, e.h) * 0.8, 0, Math.PI * 2); s.fill(); } }
    for (const e of game.enemies) e.draw(s, cam.x, cam.y);
    for (const n of game.npcs) n.draw(s, cam.x, cam.y);
    for (const c of game.companions) c.draw(s, cam.x, cam.y);
    game.player.draw(s, cam.x, cam.y, game.world);
    game.pets.draw(s, cam.x, cam.y);
    Minions.draw(game, s, cam); Weapons.drawLines(game, s, cam);
    ModLib.emit('drawWorld', game, s, cam);
    for (const p of game.particles) p.draw(s, cam.x, cam.y);
    // falling sand
    for (const f of game.world.fallingSand) {
      const strip = Sprites.tiles[f.id];
      s.drawImage(strip[0], 15 * 16, 0, 16, 16, snap(f.x - cam.x), snap(f.y - cam.y), 16, 16);
    }
    // trails, projectiles, glows (Luminance effects)
    FX.drawTrails(game, s, cam);
    for (const b of game.projectiles) b.draw(s, cam.x, cam.y);
    FX.drawGlows(game, s, cam);
    // placement / mining cursor highlight
    if (game.hoverTile && game.state === 'play') {
      const { x, y, ok } = game.hoverTile;
      s.strokeStyle = ok ? 'rgba(255,255,255,0.5)' : 'rgba(255,80,80,0.5)';
      s.lineWidth = 1;
      s.strokeRect(x * TILE - cam.x + 0.5, y * TILE - cam.y + 0.5, 15, 15);
    }
  }

  // Composite the frame: sky + (scene * light)
  composite(game) {
    const c = this.ctx, l = this.lctx;
    const cam = game.cam;
    const light = game.lighting;
    const W = this.canvas.width, H = this.canvas.height;
    l.save();
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalCompositeOperation = 'source-over';
    l.clearRect(0, 0, W, H);
    l.drawImage(this.scene, 0, 0);
    l.restore();
    l.globalCompositeOperation = 'multiply';
    l.imageSmoothingEnabled = true;
    l.drawImage(light.canvas, light.x0 * TILE - cam.x, light.y0 * TILE - cam.y, light.w * TILE, light.h * TILE);
    l.imageSmoothingEnabled = false;
    l.save();
    l.setTransform(1, 0, 0, 1, 0, 0);
    l.globalCompositeOperation = 'destination-in';
    l.drawImage(this.scene, 0, 0);
    l.globalCompositeOperation = 'source-over';
    l.restore();
    this.deviceTransform();
    c.imageSmoothingEnabled = false;
    c.drawImage(this.bg, 0, 0);
    c.drawImage(this.lit, 0, 0);
    this.uiTransform();
  }

  // ----------------------------------------------------------------------------
  // Map
  initMap(world) {
    this.mapCanvas = makeCanvas(world.w, world.h);
    this.mapImg = this.mapCanvas.getContext('2d').createImageData(world.w, world.h);
    const d = this.mapImg.data;
    for (let i = 0; i < world.w * world.h; i++) { d[i * 4 + 3] = 255; }
    // paint already-explored tiles (loaded games)
    for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) if (world.explored[x + y * world.w]) this.paintMapPixel(world, x, y);
    this.mapCanvas.getContext('2d').putImageData(this.mapImg, 0, 0);
  }

  paintMapPixel(world, x, y) {
    const i = x + y * world.w;
    const id = world.tiles[i];
    let col;
    if (world.liquid[i] > 100) col = world.lava[i] ? [255, 90, 20] : [40, 90, 210];
    else if (id !== T.AIR && id !== T.PLANT && id !== T.COBWEB) col = hexToRgb(TILES[id].mapColor || '#808080');
    else if (world.walls[i]) col = hexToRgb(WALLS[world.walls[i]].color);
    else if (y < world.surfaceLine) { const t = clamp(y / world.surfaceLine, 0, 1); col = [Math.round(lerp(120, 160, t)), Math.round(lerp(170, 205, t)), Math.round(lerp(240, 250, t))]; }
    else col = [16, 16, 20];
    const d = this.mapImg.data;
    d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
  }

  updateMap(game) {
    const world = game.world, cam = game.cam, light = game.lighting;
    const x0 = Math.max(0, Math.floor(cam.x / TILE)), y0 = Math.max(0, Math.floor(cam.y / TILE));
    const x1 = Math.min(world.w - 1, Math.ceil((cam.x + this.vw) / TILE)), y1 = Math.min(world.h - 1, Math.ceil((cam.y + this.vh) / TILE));
    let changed = false;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = x + y * world.w;
      if (!world.explored[i] && light.at(x, y) > 0.06) { world.explored[i] = 1; this.paintMapPixel(world, x, y); changed = true; }
    }
    const md = world.mapDirty;
    for (let k = 0; k < md.length; k += 2) { const x = md[k], y = md[k + 1]; if (world.explored[x + y * world.w]) { this.paintMapPixel(world, x, y); changed = true; } }
    md.length = 0;
    if (changed) this.mapCanvas.getContext('2d').putImageData(this.mapImg, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    // handle dirty tiles outside the view (e.g. sand falling, liquids) less precisely: full put every 30 frames
    if (this.frame % 30 === 0) this.mapCanvas.getContext('2d').putImageData(this.mapImg, 0, 0);
  }
}
