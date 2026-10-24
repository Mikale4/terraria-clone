// ---------------------------------------------------------------------------
// Luminance-style visual effects library: screen shake, screen flashes,
// primitive trails behind projectiles, bloom glows, particle bursts, telegraph
// lines and a global "effects intensity" setting used by the flashier bosses.
// ---------------------------------------------------------------------------
'use strict';

const FX = {
  cfg: { intensity: 1 }, // 1 = full, 0.5 = reduced, 0 = off (screen shake / flashes)
  load() { try { const c = JSON.parse(localStorage.getItem('fx_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('fx_cfg', JSON.stringify(this.cfg)); } catch (e) {} },
  shakeAmt: 0, shakeT: 0, flashes: [], telegraphs: [], _sx: 0, _sy: 0,
  shake(amount, ticks) { amount *= this.cfg.intensity; if (amount > this.shakeAmt) { this.shakeAmt = amount; this.shakeT = ticks; } },
  flash(color, ticks, alpha = 0.6) { if (this.cfg.intensity <= 0) return; this.flashes.push({ color, t: ticks, max: ticks, alpha: alpha * this.cfg.intensity }); },
  // telegraph: a world-space line (x1,y1)->(x2,y2) that fades in over `ticks` before an attack
  telegraph(x1, y1, x2, y2, color, ticks, width = 6) { this.telegraphs.push({ x1, y1, x2, y2, color, t: ticks, max: ticks, width }); },
  burst(game, x, y, n, colors, speed = 4, life = 40, size = 3) { const cs = Array.isArray(colors) ? colors : [colors]; for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = Math.random() * speed; game.particles.push(new Particle(x, y, Math.cos(a) * s, Math.sin(a) * s, cs[i % cs.length], life, size)); } },
  ring(game, x, y, n, color, speed = 3, life = 40) { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; game.particles.push(new Particle(x, y, Math.cos(a) * speed, Math.sin(a) * speed, color, life, 2)); } },
  tick() {
    if (this.shakeT > 0) { this.shakeT--; if (this.shakeT === 0) this.shakeAmt = 0; }
    for (const f of this.flashes) f.t--; this.flashes = this.flashes.filter(f => f.t > 0);
    for (const t of this.telegraphs) t.t--; this.telegraphs = this.telegraphs.filter(t => t.t > 0);
  },
  // camera offset (integer pixels) - applied by the game before drawing, removed after
  applyShake(game) { if (this.shakeT <= 0) { this._sx = this._sy = 0; return; } this._sx = Math.round(rand(-this.shakeAmt, this.shakeAmt)); this._sy = Math.round(rand(-this.shakeAmt, this.shakeAmt)); game.cam.x += this._sx; game.cam.y += this._sy; },
  removeShake(game) { game.cam.x -= this._sx; game.cam.y -= this._sy; this._sx = this._sy = 0; },
  // trails: entities carrying {trail:{color, len, width}} keep a ring of recent positions
  recordTrails(game) {
    for (const b of game.projectiles) if (b.trail) { b._tr = b._tr || []; b._tr.push([b.x + b.w / 2, b.y + b.h / 2]); if (b._tr.length > (b.trail.len || 10)) b._tr.shift(); }
    for (const e of game.enemies) if (e.trail) { e._tr = e._tr || []; e._tr.push([e.cx, e.cy]); if (e._tr.length > (e.trail.len || 10)) e._tr.shift(); }
  },
  drawTrails(game, s, cam) {
    const all = [...game.projectiles, ...game.enemies];
    for (const b of all) {
      if (!b._tr || b._tr.length < 2) continue;
      const tr = b._tr, n = tr.length, w0 = b.trail.width || 4;
      s.lineCap = 'round';
      for (let i = 1; i < n; i++) { const f = i / n; s.strokeStyle = b.trail.color; s.globalAlpha = f * 0.6; s.lineWidth = w0 * f; s.beginPath(); s.moveTo(tr[i - 1][0] - cam.x, tr[i - 1][1] - cam.y); s.lineTo(tr[i][0] - cam.x, tr[i][1] - cam.y); s.stroke(); }
      s.globalAlpha = 1;
    }
    // telegraph lines
    for (const t of this.telegraphs) { const a = 1 - t.t / t.max; s.strokeStyle = t.color; s.globalAlpha = 0.15 + 0.5 * a; s.lineWidth = t.width * (0.4 + a); s.beginPath(); s.moveTo(t.x1 - cam.x, t.y1 - cam.y); s.lineTo(t.x2 - cam.x, t.y2 - cam.y); s.stroke(); }
    s.globalAlpha = 1;
  },
  // bloom: entities with {glow:{color, r}} get a soft radial light drawn over them (additive)
  drawGlows(game, s, cam) {
    const all = [...game.projectiles, ...game.enemies, ...game.drops];
    s.globalCompositeOperation = 'lighter';
    for (const b of all) {
      if (!b.glow) continue;
      const x = (b.cx != null ? b.cx : b.x + b.w / 2) - cam.x, y = (b.cy != null ? b.cy : b.y + b.h / 2) - cam.y, r = b.glow.r || 16;
      const g = s.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, b.glow.color); g.addColorStop(1, 'rgba(0,0,0,0)');
      s.globalAlpha = (b.glow.a || 0.35) * (0.5 + 0.5 * this.cfg.intensity); s.fillStyle = g; s.beginPath(); s.arc(x, y, r, 0, Math.PI * 2); s.fill();
    }
    s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
  },
  // UI-space overlays: screen flashes
  drawOverlay(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    for (const f of this.flashes) { ctx.globalAlpha = f.alpha * (f.t / f.max); ctx.fillStyle = f.color; ctx.fillRect(0, 0, W, H); }
    ctx.globalAlpha = 1;
  },
};
FX.load();
