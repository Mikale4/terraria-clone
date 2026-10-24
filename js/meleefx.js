'use strict';
// ---------------------------------------------------------------------------
// Flails, yoyos and boomerangs animate like the real things: a sagging chain
// of links and a spinning spiked ball, a string and a whirring disc, a bent
// blade tumbling with after-images. The thrower's arm follows the weapon and
// the icon leaves the hand while it is out - for you and the squad.
// ---------------------------------------------------------------------------

ModList.current = null;

const MeleeFx = {
  time() { return (window.game && window.game.world) ? window.game.world.time : Date.now() / 16; },
  hand(ent) { return { x: ent.cx + ent.dir * 5, y: ent.y + 16 }; },
  isThrown(b) { return b.kind === 'yoyo' || b.kind === 'flail' || b.kind === 'bonemerang' || b.kind === 'spear'; },
  activeFor(ent, game) { for (const b of game.projectiles) if (!b.dead && b.owner === ent && this.isThrown(b)) return b; return null; },

  drawProj(ctx, b) {
    const t = this.time(), look = b.look || (b.kind === 'bonemerang' ? 'boomerang' : b.kind), col = b.color || (look === 'flail' ? '#808088' : look === 'yoyo' ? '#ff4040' : null);
    if (look === 'flail') {
      const a = t * 0.25 + (b.k || 0);
      ctx.fillStyle = shade(col, 0.55); for (let k = 0; k < 6; k++) { const q = a + k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(q) * 6, Math.sin(q) * 6); ctx.lineTo(Math.cos(q + 0.35) * 6, Math.sin(q + 0.35) * 6); ctx.lineTo(Math.cos(q + 0.17) * 12, Math.sin(q + 0.17) * 12); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(col, 1.35); ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(col, 0.6); ctx.beginPath(); ctx.arc(2, 3, 2, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (look === 'yoyo') {
      const a = t * 0.6;
      ctx.globalAlpha = 0.25; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = shade(col, 0.6); ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 5.2, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.rotate(a); ctx.fillStyle = shade(col, 1.4); ctx.fillRect(-1, -5, 2, 10); ctx.fillRect(-5, -1, 10, 2); ctx.restore();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 1.6, 0, Math.PI * 2); ctx.fill();
      return;
    }
    // boomerang: bent blade (bone cross when the weapon has no colour of its own)
    const a = t * 0.45 + (b.k || 0);
    const blade = (alpha, rot) => { ctx.save(); ctx.globalAlpha = alpha; ctx.rotate(rot); if (!b.color) { ctx.fillStyle = '#e8e8e0'; ctx.fillRect(-7, -2, 14, 4); ctx.fillRect(-2, -7, 4, 14); ctx.fillStyle = '#c8c8c0'; ctx.fillRect(-8, -3, 3, 6); ctx.fillRect(5, -3, 3, 6); } else { ctx.fillStyle = b.color; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-8, -3); ctx.lineTo(-4, -8); ctx.lineTo(-1, -5); ctx.lineTo(-2, 3); ctx.lineTo(5, 2); ctx.lineTo(8, 5); ctx.lineTo(4, 8); ctx.closePath(); ctx.fill(); ctx.fillStyle = shade(b.color, 1.4); ctx.fillRect(-7, -2, 2, 8); ctx.fillRect(-3, 4, 7, 2); } ctx.restore(); };
    blade(0.18, a - 0.9); blade(0.35, a - 0.45); blade(1, a);
  },
  // chain / string from the thrower's hand to the weapon
  drawLine(ctx, cam, ent, b) {
    const h = this.hand(ent); const x0 = h.x - cam.x, y0 = h.y - cam.y, x1 = b.x + 3 - cam.x, y1 = b.y + 3 - cam.y;
    const d = Math.hypot(x1 - x0, y1 - y0), sag = Math.min(24, d * 0.12), mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
    if ((b.look || b.kind) === 'flail') {
      const n = Math.max(3, Math.round(d / 7)), col = b.color ? shade(b.color, 0.7) : '#70707a';
      ctx.strokeStyle = shade(col, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1); ctx.stroke();
      ctx.fillStyle = col;
      for (let i = 1; i < n; i++) { const s = i / n, ix = (1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * mx + s * s * x1, iy = (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * my + s * s * y1; ctx.beginPath(); ctx.ellipse(ix, iy, 2.6, 1.8, Math.atan2(y1 - y0, x1 - x0) + (i % 2 ? 0 : Math.PI / 2), 0, Math.PI * 2); ctx.fill(); }
    } else {
      ctx.strokeStyle = 'rgba(240,240,240,0.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my * 0.5 + (y0 + y1) / 4, x1, y1); ctx.stroke();
    }
  },
  armAngle(ent, b) { const h = this.hand(ent); return Math.atan2(b.y + 3 - h.y, (b.x + 3 - h.x) * ent.dir); },
  // ---- bows and guns: held at the grip and pointed at the aim; bows snap their string, guns kick and flash ----
  rangedKind(it) { return it && (it.wclass === 'bow' || it.wclass === 'gun' || it.wclass === 'launcher') ? it.wclass : null; },
  aimAngle(ent, aim) { return aim ? Math.atan2(aim.y, Math.abs(aim.x) || 0.001) : 0.12; },
  drawRanged(ctx, camX, camY, ent, it, id, aim, t) {
    const icon = Sprites.icons[id]; if (!icon) return;
    const dir = ent.dir, la = this.aimAngle(ent, aim), kind = it.wclass;
    const sx = ent.cx + dir * 4 - camX, sy = ent.y + 14 + (ent.gfxOffY || 0) - camY;
    const hx = sx + Math.cos(la) * 10 * dir, hy = sy + Math.sin(la) * 10;
    const scale = kind === 'bow' ? 1.8 : kind === 'launcher' ? 1.7 : 1.5, rec = t != null && kind !== 'bow' ? Math.max(0, 1 - t * 4) : 0;
    ctx.save(); ctx.translate(hx, hy); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(la - rec * 0.3); ctx.translate(-rec * 4, 0); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false;
    if (kind === 'bow') {
      ctx.drawImage(icon, -4, -8);
      const pull = t != null ? Math.max(0, 1 - t * 5) * 4.5 : 0, wob = t != null && t < 0.5 ? Math.sin(t * 60) * (1 - t * 2) * 0.9 : 0;
      ctx.strokeStyle = '#f0f0f0'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(-pull + wob, 0); ctx.lineTo(0, 7); ctx.stroke();
      if (pull > 1) { ctx.fillStyle = '#a8794b'; ctx.fillRect(-pull, -0.5, 10, 1); ctx.fillStyle = '#c0c0c8'; ctx.fillRect(9 - pull, -1, 2.5, 2); }
    } else {
      ctx.drawImage(icon, -3, -8);
      if (t != null && t < 0.25) { const f = 1 - t * 4; ctx.fillStyle = 'rgba(255,225,110,' + (0.95 * f) + ')'; ctx.beginPath(); ctx.moveTo(12, -2); ctx.lineTo(12 + 7 * f, -5 * f - 1); ctx.lineTo(12 + 11 * f, -1.5); ctx.lineTo(12 + 7 * f, 3 * f); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,' + f + ')'; ctx.fillRect(12, -2.5, 4 * f, 2); }
      if (kind === 'launcher' && t != null && t < 0.5) { const f = 1 - t * 2; ctx.fillStyle = 'rgba(200,200,200,' + (0.45 * f) + ')'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(14 + k * 3 + t * 10, -1.5 - k * 1.2 - t * 6, 2.2 + k * 0.8 + t * 3, 0, Math.PI * 2); ctx.fill(); } }
    }
    ctx.restore();
  },
  // ---- magic: staves and wands point at the aim and glow at the tip, tomes float open with a rune circle ----
  magicKind(it) {
    if (!it || !(it.wclass === 'magic' || it.magic)) return null;
    if (/gun|rifle|blaster|zapinator|laser|ray\b/.test(it.id)) return 'gun';
    const k = typeof WeaponLooks !== 'undefined' ? WeaponLooks.kindOf(it) : 'staff';
    return k === 'wand' ? 'wand' : k === 'tome' ? 'tome' : 'staff';
  },
  magicColor(it) { return it.color || it.bolt || (it.swingProj && it.swingProj.color) || '#b090ff'; },
  drawMagic(ctx, camX, camY, ent, it, id, aim, t, kind) {
    const icon = Sprites.icons[id]; if (!icon) return;
    const dir = ent.dir, la = this.aimAngle(ent, aim), col = this.magicColor(it), time = this.time();
    const sx = ent.cx + dir * 4 - camX, sy = ent.y + 14 + (ent.gfxOffY || 0) - camY;
    if (kind === 'tome') {
      // the book hovers open in front of the chest; a rune circle spins while casting
      const bob = Math.sin(time * 0.15) * 1.5, bx = sx + dir * 13, by = sy + 2 + bob;
      if (t != null && t < 0.7) { const f = 1 - t / 0.7; ctx.save(); ctx.translate(bx + dir * 10, by); ctx.rotate(time * 0.12 * dir); ctx.globalAlpha = 0.75 * f; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 13 + (1 - f) * 6, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = col; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.fillRect(Math.cos(a) * 13 - 1.5, Math.sin(a) * 13 - 1.5, 3, 3); } ctx.globalAlpha = 0.35 * f; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      ctx.save(); ctx.translate(bx, by); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(-0.25); ctx.scale(1.6, 1.6); ctx.imageSmoothingEnabled = false; ctx.drawImage(icon, -8, -8); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.5 + Math.sin(time * 0.3) * 0.2; ctx.fillStyle = col; for (let k = 0; k < 3; k++) { const a = time * 0.05 + k * 2.1; ctx.fillRect(bx + Math.cos(a) * 12 - 1, by - 10 + Math.sin(a * 1.3) * 5 - 1, 2, 2); } ctx.restore();
      return;
    }
    // staff / wand: the shaft points along the aim, the tip glows and bursts on a cast
    const hx = sx + Math.cos(la) * 10 * dir, hy = sy + Math.sin(la) * 10, scale = kind === 'wand' ? 1.5 : 1.9, tipLen = (kind === 'wand' ? 12 : 16) * scale;
    ctx.save(); ctx.translate(hx, hy); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(la + Math.PI / 4); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false; ctx.drawImage(icon, -4, -11); ctx.restore();
    const tx = hx + Math.cos(la) * tipLen * dir, ty = hy + Math.sin(la) * tipLen;
    ctx.save();
    const glow = 0.45 + Math.sin(time * 0.35) * 0.15 + (t != null && t < 0.3 ? (0.3 - t) * 2 : 0);
    ctx.globalAlpha = Math.min(1, glow); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx, ty, 4 + (t != null && t < 0.3 ? (0.3 - t) * 14 : 0), 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.fillRect(tx - 1, ty - 1, 2, 2);
    if (t != null && t < 0.45) { const f = 1 - t / 0.45; ctx.globalAlpha = 0.8 * f; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tx, ty, 6 + (1 - f) * 14, 0, Math.PI * 2); ctx.stroke(); for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + time * 0.3, r = 8 + (1 - f) * 12; ctx.fillStyle = col; ctx.fillRect(tx + Math.cos(a) * r - 1.5, ty + Math.sin(a) * r - 1.5, 3, 3); } }
    ctx.restore();
  },
  // ---- summon staves: raised overhead on a cast, the tip flares in the minion's colour and motes rise ----
  summonKind(it) { return it && it.wclass === 'summon' && it.minion ? (it.minion.sentry ? 'sentry' : 'staff') : null; },
  drawSummon(ctx, camX, camY, ent, it, id, t) {
    const icon = Sprites.icons[id]; if (!icon) return;
    const dir = ent.dir, time = this.time(), col = (it.minion && it.minion.color) || it.color || '#90ffc0';
    const la = t != null ? -1.35 : -0.55;
    const sx = ent.cx + dir * 4 - camX, sy = ent.y + 14 + (ent.gfxOffY || 0) - camY;
    const hx = sx + Math.cos(la) * 10 * dir, hy = sy + Math.sin(la) * 10, scale = 1.9, tipLen = 16 * scale;
    ctx.save(); ctx.translate(hx, hy); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(la + Math.PI / 4); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false; ctx.drawImage(icon, -4, -11); ctx.restore();
    const tx = hx + Math.cos(la) * tipLen * dir, ty = hy + Math.sin(la) * tipLen;
    ctx.save();
    ctx.globalAlpha = 0.4 + Math.sin(time * 0.3) * 0.15; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.fillRect(tx - 1, ty - 1, 2, 2);
    if (t != null) {
      const f = 1 - t;
      ctx.globalAlpha = 0.7 * f; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tx, ty, 5 + t * 22, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.5 * f; ctx.beginPath(); ctx.arc(tx, ty, 3 + t * 10, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      // motes rising from the wielder into the tip
      ctx.globalAlpha = 0.85; for (let k = 0; k < 7; k++) { const ph = (t * 1.4 + k / 7) % 1, a = k * 0.9 + time * 0.05; const mx = ent.cx - camX + Math.cos(a) * 16 * (1 - ph), my = ent.y + ent.h - camY - ph * (ent.h + 14); ctx.fillStyle = k % 2 ? col : '#fff'; ctx.fillRect(mx - 1, my - 1, 2 + (1 - ph) * 2, 2 + (1 - ph) * 2); }
      // summoning circle at the feet
      ctx.globalAlpha = 0.35 * f; ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(ent.cx - camX, ent.y + ent.h - camY, 16 + t * 8, 5 + t * 2, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  },
  // ---- tools: pickaxes, axes and hammers swing full size in an arc through the block you aim at ----
  toolKind(it) { return it && (it.tool === 'pick' || it.tool === 'axe' || it.tool === 'hammer') ? it.tool : null; },
  drawTool(ctx, camX, camY, ent, it, id, t, aim) {
    const icon = Sprites.icons[id]; if (!icon) return;
    const dir = ent.dir, la = this.aimAngle(ent, aim);
    const e = 1 - Math.pow(1 - Math.min(1, t), 2.2);                                          // fast start, easing into the block
    const a0 = la - 1.25, a1 = la + 0.45, a = a0 + (a1 - a0) * e;
    const sx = ent.cx + dir * 4 - camX, sy = ent.y + 14 + (ent.gfxOffY || 0) - camY;
    const hx = sx + Math.cos(a) * 12 * dir, hy = sy + Math.sin(a) * 12;
    const scale = 2, headA = a - 0.3, col = it.icon && it.icon.mat && MATERIALS[it.icon.mat] ? MATERIALS[it.icon.mat].M : '#d0d0d8';
    if (t > 0.1 && t < 0.75) { ctx.save(); ctx.translate(sx, sy); if (dir < 0) ctx.scale(-1, 1); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.globalAlpha = 0.22; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 12 + 14 * scale - 6, Math.max(a0 - 0.3, headA - 0.8), headA); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.translate(hx, hy); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(headA + Math.PI / 4); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false; ctx.drawImage(icon, -2.5, -13); ctx.restore();
    return a;
  },
  // ---- sword swings: a full-size blade pivoting at the hand through the swing arc, with a slash trail ----
  swordActive(ent, it) { return !!(it && it.sword && ent.useTimer > 0 && ent.armAngle != null); },
  swordColor(it) { return it.color || (it.swingProj && it.swingProj.color) || (it.icon && it.icon.mat && MATERIALS[it.icon.mat] ? MATERIALS[it.icon.mat].M : '#e0e0ff'); },
  drawSword(ctx, camX, camY, ent, it, id) {
    const icon = Sprites.icons[id]; if (!icon) return;
    const a = ent.armAngle, dir = ent.dir, t = 1 - ent.useTimer / Math.max(1, ent.useDuration);
    const sx = ent.cx + dir * 4 - camX, sy = ent.y + 14 + (ent.gfxOffY || 0) - camY;         // shoulder
    const hx = sx + Math.cos(a) * 12 * dir, hy = sy + Math.sin(a) * 12;                        // hand
    const scale = it.sword === 'short' ? 1.6 : 2.2, blade = 15 * scale, lead = -0.35;         // blade leads the arm a little
    const bladeA = a + lead;
    // slash trail: the part of the arc the blade just swept
    if (t > 0.15) {
      const start = -2.3 + lead, sweep = bladeA - start, from = bladeA - Math.min(sweep, 1.1);
      ctx.save(); ctx.translate(sx, sy); if (dir < 0) ctx.scale(-1, 1);
      ctx.strokeStyle = this.swordColor(it); ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.28 - k * 0.08; ctx.lineWidth = 5 - k * 1.5; ctx.beginPath(); ctx.arc(0, 0, 12 + blade - 4 - k * 5, from, bladeA); ctx.stroke(); }
      ctx.restore();
    }
    // the blade itself, hilt in hand, pointing along the swing
    ctx.save(); ctx.translate(hx, hy); if (dir < 0) ctx.scale(-1, 1); ctx.rotate(bladeA + Math.PI / 4); ctx.scale(scale, scale); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(icon, -2.5, -13);
    ctx.restore();
  },
  // a spear is a shaft from the hand to the thrust point, head first, extending then pulling back
  drawSpear(ctx, camX, camY, b) {
    const o = b.owner, h = o && o.cx != null ? this.hand(o) : { x: b.x + 3 - b.vx * 4, y: b.y + 3 - b.vy * 4 };
    const tx = b.x + 3, ty = b.y + 3, ang = Math.atan2(ty - h.y, tx - h.x), len = Math.hypot(tx - h.x, ty - h.y) + 8, col = b.color || '#c0c0c8';
    ctx.save(); ctx.translate(h.x - camX, h.y - camY); ctx.rotate(ang);
    if (b.life > 8) { ctx.globalAlpha = 0.25; ctx.fillStyle = col; ctx.fillRect(len - 26, -3, 20, 6); ctx.globalAlpha = 1; } // thrust streak on the way out
    ctx.fillStyle = '#5a3e22'; ctx.fillRect(-6, -1.5, len - 6, 3); ctx.fillStyle = '#8a6a44'; ctx.fillRect(-6, -1.5, len - 6, 1);
    ctx.fillStyle = shade(col, 0.7); ctx.fillRect(4, -2.5, 3, 5); ctx.fillRect(len - 14, -2.5, 3, 5);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(len + 4, 0); ctx.lineTo(len - 12, -5); ctx.lineTo(len - 8, 0); ctx.lineTo(len - 12, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(len - 9, -0.5, 9, 1);
    ctx.restore();
  },
};

// projectile looks
{
  const pd = Projectile.prototype.draw;
  Projectile.prototype.draw = function (ctx, camX, camY) {
    if (!MeleeFx.isThrown(this)) return pd.call(this, ctx, camX, camY);
    if (this.kind === 'spear') return MeleeFx.drawSpear(ctx, camX, camY, this);
    if (this.k == null) this.k = Math.random() * 6;
    ctx.save(); ctx.translate(snap(this.x - camX + 3), snap(this.y - camY + 3)); MeleeFx.drawProj(ctx, this); ctx.restore();
  };
}
// chips fly off the block when the tool head lands
ModLib.on('tick', (g) => {
  const p = g.player, it = p.useItemId && ITEMS[p.useItemId]; if (!it || !MeleeFx.toolKind(it) || p.useTimer <= 0) return;
  if (p.useTimer !== Math.round(p.useDuration * 0.45)) return;
  const h = g.hoverTile; if (!h || !h.ok) return; const id = g.world.get(h.x, h.y); if (id === T.AIR) return;
  const col = (TILES[id] && TILES[id].color) || '#888'; const wx = h.x * TILE + 8, wy = h.y * TILE + 8;
  for (let k = 0; k < 5; k++) g.particles.push(new Particle(wx + rand(-6, 6), wy + rand(-6, 6), rand(-2, 2) - p.dir * 0.5, rand(-3, -0.5), col, 18 + k * 2, 2));
});
// remember where you shot from
{ const base = Weapons.ranged; Weapons.ranged = function (game, slot, it) { const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.aimDir = { x: dx / d, y: dy / d }; return base.call(this, game, slot, it); }; }
// ... and where you cast from
{ const aimOf = (game) => { const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; };
  const bm = Weapons.magic; Weapons.magic = function (game, slot, it) { game.player.aimDir = aimOf(game); return bm.call(this, game, slot, it); };
  if (typeof Magic !== 'undefined' && Magic.cast) { const mc = Magic.cast; Magic.cast = function (game, slot, it) { game.player.aimDir = aimOf(game); return mc.call(this, game, slot, it); }; } }
// the thrust follows the wielder while it is out
{ const pt = Weapons.projTick; Weapons.projTick = function (game, b, world) { if (b.kind === 'spear') { if (b.owner && b.owner.cx != null && !b.owner.dead) { b.x += b.owner.vx; b.y += b.owner.vy; } if (b.life === 7) { b.vx *= -1; b.vy *= -1; } return true; } return pt.call(this, game, b, world); }; }
// chains and strings for everyone who throws one
Weapons.drawLines = function (game, s, cam) { for (const b of game.projectiles) { const look = b.look || b.kind; if (!b.dead && (look === 'yoyo' || look === 'flail') && b.owner && b.owner.cx != null) MeleeFx.drawLine(s, cam, b.owner, b); } };

ModLib.patch(() => {
  // the arm tracks the thrown weapon and the hand is empty while it is out
  const showHeld = () => typeof WeaponMods !== 'undefined' && WeaponMods.cfg.showHeld && ModList.on('armament_display');
  const pd = Player.prototype.draw;
  Player.prototype.draw = function (ctx, camX, camY, world) {
    const g = window.game, b = g ? MeleeFx.activeFor(this, g) : null;
    const useIt = this.useItemId && ITEMS[this.useItemId], selS = this.selectedItem, selIt = selS && ITEMS[selS.id];
    const sword = !b && !this.dead && MeleeFx.swordActive(this, useIt);
    let ranged = null, magic = null, summon = null, tool = null;
    if (!b && !sword && !this.dead && !this.sitting) {
      const mk = (it) => { const k = MeleeFx.magicKind(it); return k === 'gun' ? null : k; };
      if (this.useTimer > 0 && MeleeFx.rangedKind(useIt)) ranged = { it: useIt, id: this.useItemId, aim: this.aimDir, t: 1 - this.useTimer / Math.max(1, this.useDuration) };
      else if (this.useTimer > 0 && MeleeFx.magicKind(useIt) === 'gun') ranged = { it: Object.assign({}, useIt, { wclass: 'gun' }), id: this.useItemId, aim: this.aimDir, t: 1 - this.useTimer / Math.max(1, this.useDuration) };
      else if (this.useTimer > 0 && mk(useIt)) magic = { it: useIt, id: this.useItemId, aim: this.aimDir, t: 1 - this.useTimer / Math.max(1, this.useDuration), kind: mk(useIt) };
      else if (this.useTimer > 0 && MeleeFx.summonKind(useIt)) summon = { it: useIt, id: this.useItemId, t: 1 - this.useTimer / Math.max(1, this.useDuration) };
      else if (this.useTimer > 0 && MeleeFx.toolKind(useIt) && g) { const dx = g.mouse.wx - this.cx, dy = g.mouse.wy - (this.y + 14), d = Math.hypot(dx, dy) || 1; tool = { it: useIt, id: this.useItemId, t: 1 - this.useTimer / Math.max(1, this.useDuration), aim: { x: dx / d, y: dy / d } }; }
      else if (showHeld() && MeleeFx.rangedKind(selIt)) ranged = { it: selIt, id: selS.id, aim: null, t: null };
      else if (showHeld() && MeleeFx.magicKind(selIt) === 'gun') ranged = { it: Object.assign({}, selIt, { wclass: 'gun' }), id: selS.id, aim: null, t: null };
      else if (showHeld() && mk(selIt)) magic = { it: selIt, id: selS.id, aim: null, t: null, kind: mk(selIt) };
      else if (showHeld() && MeleeFx.summonKind(selIt)) summon = { it: selIt, id: selS.id, t: null };
    }
    if (!b && !sword && !ranged && !magic && !summon && !tool) return pd.call(this, ctx, camX, camY, world);
    let toolArm = null; if (tool) { const la = MeleeFx.aimAngle(this, tool.aim), e = 1 - Math.pow(1 - Math.min(1, tool.t), 2.2); toolArm = (la - 1.25) + 1.7 * e; }
    const orig = window.drawHumanoid, ang = b ? MeleeFx.armAngle(this, b) : ranged ? MeleeFx.aimAngle(this, ranged.aim) : magic ? (magic.kind === 'tome' ? -0.35 : MeleeFx.aimAngle(this, magic.aim)) : summon ? (summon.t != null ? -1.35 : -0.55) : tool ? toolArm : this.armAngle;
    window.drawHumanoid = (c, x, y, o) => orig(c, x, y, Object.assign({}, o, { item: null, armAngle: ang }));
    try { pd.call(this, ctx, camX, camY, world); } finally { window.drawHumanoid = orig; }
    ctx.save(); if (this.invuln > 0 && (this.invuln >> 2) % 2 === 0 && this.hurtFlash === 0) ctx.globalAlpha = 0.5;
    if (sword) MeleeFx.drawSword(ctx, camX, camY, this, useIt, this.useItemId);
    if (ranged) MeleeFx.drawRanged(ctx, camX, camY, this, ranged.it, ranged.id, ranged.aim, ranged.t);
    if (magic) MeleeFx.drawMagic(ctx, camX, camY, this, magic.it, magic.id, magic.aim, magic.t, magic.kind);
    if (summon) MeleeFx.drawSummon(ctx, camX, camY, this, summon.it, summon.id, summon.t);
    if (tool) MeleeFx.drawTool(ctx, camX, camY, this, tool.it, tool.id, tool.t, tool.aim);
    ctx.restore();
  };
  const cd = Companion.prototype.draw;
  Companion.prototype.draw = function (ctx, camX, camY) {
    const g = window.game, b = g && this.sq ? MeleeFx.activeFor(this, g) : null;
    const ws = this.sq && this.inventory[this.weaponI], wit = ws && ITEMS[ws.id];
    let sword = !b && this.ko === 0 && this.cls === 'melee' && MeleeFx.swordActive(this, wit);
    let ranged = null, magic = null, summon = null, tool = null;
    if (!b && this.sq && this.ko === 0 && this.toolSwing > 0 && this.toolAim && this.inventory[this.toolI]) { const ts = this.inventory[this.toolI], tit = ITEMS[ts.id]; if (MeleeFx.toolKind(tit)) tool = { it: tit, id: ts.id, t: 1 - this.useTimer / Math.max(1, this.useDuration), aim: this.toolAim }; }
    if (!tool && !b && this.sq && this.ko === 0 && this.cls === 'summon' && MeleeFx.summonKind(wit) && !(this.lashT > 0)) { if (this.summonT > 0) summon = { it: wit, t: 1 - this.summonT / 20 }; else if (showHeld() && !(this.useTimer > 0)) summon = { it: wit, t: null }; }
    if (!b && this.sq && this.ko === 0 && this.cls === 'ranged' && MeleeFx.rangedKind(wit)) { if (this.useTimer > 0) ranged = { it: wit, aim: this.aimDir, t: 1 - this.useTimer / Math.max(1, this.useDuration) }; else if (showHeld()) ranged = { it: wit, aim: null, t: null }; }
    if (!b && this.sq && this.ko === 0 && this.cls === 'magic' && MeleeFx.magicKind(wit)) {
      const k = MeleeFx.magicKind(wit), t = this.useTimer > 0 ? 1 - this.useTimer / Math.max(1, this.useDuration) : null;
      if (t != null || showHeld()) { if (k === 'gun') ranged = { it: Object.assign({}, wit, { wclass: 'gun' }), aim: t != null ? this.aimDir : null, t }; else magic = { it: wit, aim: t != null ? this.aimDir : null, t, kind: k }; }
    }
    if (tool) { sword = false; ranged = null; magic = null; summon = null; }
    if (!b && !sword && !ranged && !magic && !summon && !tool) return cd.call(this, ctx, camX, camY);
    let toolArm = null; if (tool) { const la = MeleeFx.aimAngle(this, tool.aim), e = 1 - Math.pow(1 - Math.min(1, tool.t), 2.2); toolArm = (la - 1.25) + 1.7 * e; }
    const orig = window.drawHumanoid, ang = b ? MeleeFx.armAngle(this, b) : tool ? toolArm : ranged ? MeleeFx.aimAngle(this, ranged.aim) : magic ? (magic.kind === 'tome' ? -0.35 : MeleeFx.aimAngle(this, magic.aim)) : summon ? (summon.t != null ? -1.35 : -0.55) : this.armAngle;
    window.drawHumanoid = (c, x, y, o) => orig(c, x, y, Object.assign({}, o, { item: null, armAngle: ang }));
    try { cd.call(this, ctx, camX, camY); } finally { window.drawHumanoid = orig; }
    if (sword) MeleeFx.drawSword(ctx, camX, camY, this, wit, ws.id);
    if (ranged) MeleeFx.drawRanged(ctx, camX, camY, this, ranged.it, ws.id, ranged.aim, ranged.t);
    if (magic) MeleeFx.drawMagic(ctx, camX, camY, this, magic.it, ws.id, magic.aim, magic.t, magic.kind);
    if (summon) MeleeFx.drawSummon(ctx, camX, camY, this, summon.it, ws.id, summon.t);
    if (tool) MeleeFx.drawTool(ctx, camX, camY, this, tool.it, tool.id, tool.t, tool.aim);
  };
  const cu2 = Companion.prototype.update;
  Companion.prototype.update = function (world, game) { if (this.summonT > 0) this.summonT--; return cu2.call(this, world, game); };
});
