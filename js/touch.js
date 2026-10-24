// ---------------------------------------------------------------------------
// Touch controls: on-screen movement pad, jump / attack, and the handful of
// hotkeys a phone cannot reach (inventory, map, hook, quick heal).
//
// Nothing here reimplements input: every control feeds the same state the
// keyboard and mouse already drive - `game.keys` (a Set of KeyboardEvent
// codes) and `game.mouse` - so the existing HUD, slots, crafting, dialogs and
// menus all keep working through plain taps.
// ---------------------------------------------------------------------------
'use strict';

const Touch_ = {
  on: false, pts: new Map(), aim: { x: 0, y: 0 }, held: {}, longT: 0, longId: null, moved: 0,
  SAFE: 52,                                    // bottom strip left for the game's own Inventory / Settings buttons

  detect() {
    const q = new URLSearchParams(location.search).get('touch');
    if (q === '1' || q === 'on') return true;
    if (q === '0' || q === 'off') return false;
    const saved = (() => { try { return localStorage.getItem('touch_controls'); } catch (e) { return null; } })();
    if (saved === 'on') return true; if (saved === 'off') return false;
    return (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
  },

  // ---- layout (CSS pixels; recomputed every frame so it follows rotation) ----------------------------
  layout(game) {
    const W = game.renderer.W, H = game.renderer.H;
    const s = clamp(Math.min(W, H) / 7.5, 54, 96), b = this.SAFE;
    const padY = H - b - s, r1 = s * 0.78, r2 = s * 0.62;
    const L = {
      left: { x: 14, y: padY, w: s, h: s, key: 'KeyA', glyph: '<' },
      right: { x: 14 + s + 8, y: padY, w: s, h: s, key: 'KeyD', glyph: '>' },
      down: { x: 14 + s * 0.5 + 4, y: padY - s - 8, w: s, h: s, key: 'KeyS', glyph: 'v' },
      jump: { cx: W - 18 - r1, cy: H - b - r1, r: r1, key: 'Space', glyph: '^' },
      attack: { cx: W - 26 - r1 * 2 - r2, cy: H - b - r2 * 1.1, r: r2, attack: true, glyph: '*' },
    };
    // utility column on the left edge above the movement pads: the right edge belongs to the minimap
    const bw = Math.round(s * 0.84), bh = Math.round(s * 0.46), gap = 5;
    const items = [['BAG', 'Escape'], ['MAP', 'Tab'], ['HOOK', 'KeyE'], ['HEAL', 'KeyH']];
    const total = items.length * bh + (items.length - 1) * gap;
    let y = Math.max(84, L.down.y - 10 - total);     // never under the hotbar
    L.util = [];
    for (const [label, code] of items) { L.util.push({ x: 14, y, w: bw, h: bh, tap: code, label }); y += bh + gap; }
    return L;
  },
  hit(c, x, y) { return c.r ? Math.hypot(x - c.cx, y - c.cy) <= c.r * 1.15 : (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h); },
  // controls are hidden whenever a panel owns the screen, so they never cover the inventory or the map
  busy(game) { return game.state !== 'play' || game.invOpen || game.settingsOpen || game.dialog || game.shop || game.openChest || UI.fullMap || UI.modsOpen || UI.structOpen || UI.albumOpen || UI.arrayOpen || UI.achievementsOpen || UI.petPanel || BossLog.open || game.squadInv || (typeof Squad !== 'undefined' && Squad.prompt); },

  // ---- drawing -------------------------------------------------------------------------------------
  draw(game) {
    if (!this.on || this.busy(game)) return;
    const ctx = game.renderer.ctx, L = this.layout(game);
    const pad = (c, down) => {
      ctx.globalAlpha = down ? 0.55 : 0.3;
      ctx.fillStyle = '#e8ecff'; ctx.strokeStyle = 'rgba(10,14,30,0.65)'; ctx.lineWidth = 2;
      if (c.r) { ctx.beginPath(); ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      else { roundRect(ctx, c.x, c.y, c.w, c.h, 12); ctx.fill(); ctx.stroke(); }
      ctx.globalAlpha = down ? 1 : 0.85;
      const gx = c.r ? c.cx : c.x + c.w / 2, gy = c.r ? c.cy : c.y + c.h / 2;
      if (c.label) drawText(ctx, c.label, gx, gy - 7, { size: Math.round(c.h * 0.42), align: 'center', color: '#0d1024', outline: null });
      else this.glyph(ctx, c.glyph, gx, gy, (c.r ? c.r : c.w / 2) * 0.5);
      ctx.globalAlpha = 1;
    };
    for (const k of ['left', 'right', 'down']) pad(L[k], this.held[L[k].key]);
    pad(L.jump, this.held.Space); pad(L.attack, this.held.attack);
    for (const u of L.util) pad(u, false);
  },
  // arrows / star drawn as paths so they stay crisp at any size
  glyph(ctx, g, x, y, r) {
    ctx.fillStyle = '#0d1024'; ctx.beginPath();
    if (g === '<') { ctx.moveTo(x + r * 0.5, y - r); ctx.lineTo(x + r * 0.5, y + r); ctx.lineTo(x - r * 0.7, y); }
    else if (g === '>') { ctx.moveTo(x - r * 0.5, y - r); ctx.lineTo(x - r * 0.5, y + r); ctx.lineTo(x + r * 0.7, y); }
    else if (g === 'v') { ctx.moveTo(x - r, y - r * 0.5); ctx.lineTo(x + r, y - r * 0.5); ctx.lineTo(x, y + r * 0.7); }
    else if (g === '^') { ctx.moveTo(x - r, y + r * 0.5); ctx.lineTo(x + r, y + r * 0.5); ctx.lineTo(x, y - r * 0.7); }
    else { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } }
    ctx.closePath(); ctx.fill();
  },

  // ---- input ---------------------------------------------------------------------------------------
  press(game, key, down) {
    this.held[key] = down;
    if (down) game.keys.add(key); else game.keys.delete(key);
  },
  tap(game, code) { game.onKeyDown({ code, preventDefault() {}, shiftKey: false }); },
  aimAt(game, x, y) { this.aim.x = x; this.aim.y = y; game.mouse.x = x; game.mouse.y = y; game.mouse.inside = true; game.updateMouseWorld(); },

  start(game, id, x, y) {
    const L = this.layout(game), busy = this.busy(game);
    if (!busy) {
      for (const k of ['left', 'right', 'down', 'jump']) if (this.hit(L[k], x, y)) { this.pts.set(id, { ctl: k, key: L[k].key }); this.press(game, L[k].key, true); return; }
      if (this.hit(L.attack, x, y)) { this.pts.set(id, { ctl: 'attack' }); this.held.attack = true; this.aimAt(game, this.aim.x, this.aim.y); game.mouse.left = true; game.onLeftDown(); return; }
      for (const u of L.util) if (this.hit(u, x, y)) { this.pts.set(id, { ctl: 'util' }); this.tap(game, u.tap); return; }
    }
    // anything else is a world / UI touch: it drives the cursor exactly like the mouse
    this.pts.set(id, { ctl: 'world', x0: x, y0: y });
    this.moved = 0; this.longId = id; this.longT = performance.now();
    this.aimAt(game, x, y); game.mouse.left = true; game.onLeftDown();
  },
  move(game, id, x, y) {
    const p = this.pts.get(id); if (!p) return;
    if (p.ctl === 'world') {
      this.moved = Math.max(this.moved, Math.hypot(x - p.x0, y - p.y0));
      if (this.moved > 14) this.longId = null;          // a drag is mining / panning, not a long press
      this.aimAt(game, x, y);
    } else if (p.key) {                                  // slid off a movement pad
      const L = this.layout(game), k = ['left', 'right', 'down', 'jump'].find(n => this.hit(L[n], x, y));
      const key = k && L[k].key;
      if (key !== p.key) { this.press(game, p.key, false); if (key) { this.press(game, key, true); p.ctl = k; p.key = key; } else { this.pts.delete(id); } }
    }
  },
  end(game, id) {
    const p = this.pts.get(id); if (!p) return;
    this.pts.delete(id);
    if (p.key) this.press(game, p.key, false);
    else if (p.ctl === 'attack') { this.held.attack = false; game.mouse.left = false; }
    else if (p.ctl === 'world') { game.mouse.left = false; UI.mapDrag = null; if (this.longId === id) this.longId = null; }
  },
  // held long enough without moving -> the right-click interaction (doors, chests, NPCs, pets)
  tick(game) {
    if (!this.on) return;
    if (this.longId !== null && performance.now() - this.longT > 380) {
      const id = this.longId; this.longId = null;
      if (this.pts.has(id)) {
        game.mouse.left = false; game.mouse.right = true; game.onRightDown(); game.mouse.right = false;
        const p = this.pts.get(id); if (p) p.ctl = 'done';
        if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) {}
      }
    }
    // the attack pad keeps swinging at the last aim point
    if (this.held.attack) { game.mouse.x = this.aim.x; game.mouse.y = this.aim.y; game.updateMouseWorld(); }
  },

  install(game) {
    this.on = this.detect();
    if (!this.on) return;
    const c = game.canvas;
    document.documentElement.classList.add('touch');
    const xy = (t) => { const r = c.getBoundingClientRect(); return [t.clientX - r.left, t.clientY - r.top]; };
    c.addEventListener('touchstart', (e) => {
      Audio_.init(); Audio_.resume();
      for (const t of e.changedTouches) { const [x, y] = xy(t); this.start(game, t.identifier, x, y); }
      e.preventDefault();
    }, { passive: false });
    c.addEventListener('touchmove', (e) => { for (const t of e.changedTouches) { const [x, y] = xy(t); this.move(game, t.identifier, x, y); } e.preventDefault(); }, { passive: false });
    const up = (e) => { for (const t of e.changedTouches) this.end(game, t.identifier); e.preventDefault(); };
    c.addEventListener('touchend', up, { passive: false });
    c.addEventListener('touchcancel', up, { passive: false });
    // a phone screen shows far too little of the world at the desktop zoom of 2
    const fit = () => { const W = game.renderer.W; game.renderer.zoom = clamp(Math.round(W / (24 * TILE) * 2) / 2, 1, 2); game.renderer.resize(); };
    fit(); window.addEventListener('resize', fit); window.addEventListener('orientationchange', () => setTimeout(fit, 200));
  },
};

ModLib.patch(() => {
  const init = Game.prototype.init;
  Game.prototype.init = function () { init.call(this); Touch_.install(this); };
  const upd = Game.prototype.update;
  Game.prototype.update = function () { Touch_.tick(this); return upd.call(this); };
});
ModLib.on('drawHud', (g) => Touch_.draw(g));
