'use strict';
// ---------------------------------------------------------------------------
// Whips crack like whips: a lash uncoils from the hand toward the aim, waves,
// snaps at full reach and pulls back over the swing, for you and the squad.
// ---------------------------------------------------------------------------

ModList.current = null;

const WhipFx = {
  // t: 0..1 progress of the swing; the lash extends to the reach and snaps back
  draw(ctx, camX, camY, ent, aim, reach, t, color, hi) {
    const ext = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
    const hx = ent.cx + ent.dir * 5, hy = ent.y + 16;
    const len = reach * (0.12 + 0.88 * ext);
    const ax = aim.x, ay = aim.y;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const N = 16; const pts = [];
    for (let i = 0; i <= N; i++) { const s = i / N; const wave = Math.sin(s * Math.PI * 2.4 - t * 10) * 9 * s * (1 - ext * 0.55); pts.push([hx + ax * len * s - ay * wave - camX, hy + ay * len * s + ax * wave - camY]); }
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y + 1) : ctx.moveTo(x, y + 1)); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    const [tx, ty] = pts[N]; ctx.fillStyle = hi; ctx.fillRect(Math.round(tx) - 2, Math.round(ty) - 2, 4, 4);
    if (ext > 0.9) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + t * 6; ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * 4, ty + Math.sin(a) * 4); ctx.lineTo(tx + Math.cos(a) * 10, ty + Math.sin(a) * 10); ctx.stroke(); } }
    ctx.restore();
  },
  armAngle(ent, aim) { return Math.atan2(aim.y, Math.abs(aim.x) || 0.001); },
  playerActive(p) { const it = p.useItemId && ITEMS[p.useItemId]; return !!(it && it.wclass === 'whip' && p.useTimer > 0 && p.whipAim); },
};

// remember where you cracked the whip
{ const base = Weapons.whip; Weapons.whip = function (game, slot, it) { const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.whipAim = { x: dx / d, y: dy / d }; return base.call(this, game, slot, it); }; }

// the lash itself, drawn over the world after the player and companions
ModLib.on('drawWorld', (g, s, cam) => {
  const p = g.player;
  if (WhipFx.playerActive(p)) { const it = ITEMS[p.useItemId]; const reach = (it.reach || 5) * TILE * (p.pm.whipRange || 1); WhipFx.draw(s, cam.x, cam.y, p, p.whipAim, reach, 1 - p.useTimer / Math.max(1, p.useDuration), it.color || '#c0a060', '#fff'); }
  for (const c of g.companions) if (c.sq && c.lashT > 0 && c.whipAim && c.inventory[c.whipI]) { const it = ITEMS[c.inventory[c.whipI].id]; const reach = (it.reach || 5) * TILE * (c.pm.whipRange || 1); WhipFx.draw(s, cam.x, cam.y, c, c.whipAim, reach, 1 - c.lashT / Math.max(1, c.lashDur), it.color || '#c0a060', '#fff'); }
});

ModLib.patch(() => {
  // while the whip is out, the arm follows the lash and the coiled icon is not shown in hand
  const pd = Player.prototype.draw;
  Player.prototype.draw = function (ctx, camX, camY, world) {
    if (!WhipFx.playerActive(this)) return pd.call(this, ctx, camX, camY, world);
    const orig = window.drawHumanoid, ang = WhipFx.armAngle(this, this.whipAim);
    window.drawHumanoid = (c, x, y, o) => orig(c, x, y, Object.assign({}, o, { item: null, armAngle: ang }));
    try { pd.call(this, ctx, camX, camY, world); } finally { window.drawHumanoid = orig; }
  };
  const cd = Companion.prototype.draw;
  Companion.prototype.draw = function (ctx, camX, camY) {
    if (!(this.sq && this.lashT > 0 && this.whipAim)) return cd.call(this, ctx, camX, camY);
    const orig = window.drawHumanoid, ang = WhipFx.armAngle(this, this.whipAim);
    window.drawHumanoid = (c, x, y, o) => orig(c, x, y, Object.assign({}, o, { item: null, armAngle: ang }));
    try { cd.call(this, ctx, camX, camY); } finally { window.drawHumanoid = orig; }
  };
  const cu = Companion.prototype.update;
  Companion.prototype.update = function (world, game) { if (this.lashT > 0) this.lashT--; return cu.call(this, world, game); };
});
