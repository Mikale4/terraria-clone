// ---------------------------------------------------------------------------
// Gensokyo slice: danmaku (hostile bullets that hurt the player, grazing),
// fairies that shoot bullet spreads, a spell-card boss (Rumia) with named
// timed phases and capture bonuses, point & power items, danmaku weapons
// (Ofuda, Yin-Yang Orb, Fantasy Seal spell card), a Hakurei-style shrine
// mini-biome with a Shrine Maiden NPC.
// ---------------------------------------------------------------------------
'use strict';

// Items --------------------------------------------------------------------------
function defGItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
defGItem('point_item', 'Point Item', { max: 999, rarity: 1, value: 100, tooltip: 'Worth 1 silver, collected automatically', drawIcon: (x) => { x.fillStyle = '#4080ff'; x.fillRect(3, 3, 10, 10); x.fillStyle = '#a0c8ff'; x.fillRect(3, 3, 10, 2); x.fillStyle = '#fff'; x.fillRect(6, 6, 4, 4); }, onPickup: (p, n) => { p.coins += 100 * n; p.stats.points = (p.stats.points || 0) + n; return 0; } });
defGItem('power_item', 'Power Item', { max: 999, rarity: 1, value: 50, tooltip: 'Raises your danmaku Power by 0.05 (max 4.00). Each 1.00 Power: +25% danmaku damage', drawIcon: (x) => { x.fillStyle = '#ff4040'; x.fillRect(3, 3, 10, 10); x.fillStyle = '#ffa0a0'; x.fillRect(3, 3, 10, 2); x.fillStyle = '#fff'; x.fillRect(6, 5, 2, 6); x.fillRect(6, 5, 4, 2); x.fillRect(6, 8, 4, 2); x.fillRect(9, 6, 1, 2); }, onPickup: (p, n) => { p.danmakuPower = Math.min(4, (p.danmakuPower || 0) + 0.05 * n); return 0; } });
defGItem('ofuda', 'Ofuda', { max: 999, damage: 9, useTime: 12, knockback: 2, danmaku: true, rarity: 1, value: 20, tooltip: 'Homing paper talismans. 60% chance not to be consumed', drawIcon: (x) => { x.fillStyle = '#f8f0e0'; x.fillRect(5, 1, 6, 14); x.fillStyle = '#d02020'; x.fillRect(7, 3, 2, 2); x.fillRect(6, 7, 4, 1); x.fillRect(7, 9, 2, 4); }, use: (g, s, it) => Gensokyo.throwOfuda(g, s, it) });
RECIPES.push({ result: 'ofuda', count: 30, station: 'workbench', ing: [['wood', 5], ['gel', 1]] });
defGItem('yin_yang_orb', 'Yin-Yang Orb', { max: 1, damage: 16, useTime: 24, knockback: 4, danmaku: true, rarity: 2, value: 20000, tooltip: 'Throws a bouncing orb that pierces through enemies', drawIcon: (x) => { x.fillStyle = '#202020'; x.beginPath(); x.arc(8, 8, 7, 0, Math.PI * 2); x.fill(); x.fillStyle = '#f0f0f0'; x.beginPath(); x.arc(8, 8, 7, -Math.PI / 2, Math.PI / 2); x.fill(); x.beginPath(); x.arc(8, 4.5, 3.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#202020'; x.beginPath(); x.arc(8, 11.5, 3.5, 0, Math.PI * 2); x.fill(); x.fillRect(7, 3, 2, 2); x.fillStyle = '#f0f0f0'; x.fillRect(7, 11, 2, 2); }, use: (g, s, it) => Gensokyo.throwOrb(g, s, it) });
RECIPES.push({ result: 'yin_yang_orb', count: 1, station: 'anvil', ing: [['iron_bar', 8], ['gel', 5], ['fallen_star', 1]] });
defGItem('fantasy_seal', 'Spell Card "Fantasy Seal"', { max: 1, damage: 15, useTime: 36, knockback: 3, danmaku: true, magic: true, manaCost: 18, rarity: 3, value: 60000, tooltip: 'Releases 6 homing orbs of light. Uses 18 mana', drawIcon: (x) => { x.fillStyle = '#f8f0e0'; x.fillRect(2, 2, 12, 12); const cs = ['#ff4040', '#40ff40', '#4040ff', '#ffff40', '#ff40ff', '#40ffff']; cs.forEach((c, i) => { x.fillStyle = c; x.fillRect(4 + (i % 3) * 3, 4 + Math.floor(i / 3) * 5, 2, 2); }); }, use: (g, s, it) => Gensokyo.castSeal(g, s, it) });
defGItem('sealed_ribbon', 'Sealed Ribbon', { max: 20, consumable: true, rarity: 2, value: 5000, tooltip: 'Summons Rumia, the youkai of dusk. Only works at night', drawIcon: (x) => { x.fillStyle = '#e02020'; x.beginPath(); x.moveTo(8, 8); x.lineTo(2, 3); x.lineTo(2, 12); x.closePath(); x.fill(); x.beginPath(); x.moveTo(8, 8); x.lineTo(14, 3); x.lineTo(14, 12); x.closePath(); x.fill(); x.fillStyle = '#ff8080'; x.fillRect(7, 7, 2, 2); } });
RECIPES.push({ result: 'sealed_ribbon', count: 1, station: 'workbench', ing: [['gel', 15], ['lens', 3], ['fallen_star', 1]] });
defAccessory('youkai_ribbon', "Rumia's Ribbon", { rarity: 3, value: 50000, danmakuDmg: 10, grazeBonus: 8, tooltip: '+10% danmaku damage, +8 px graze radius. Is that so?' });
ITEMS.youkai_ribbon.drawIcon = ITEMS.sealed_ribbon.drawIcon;
defGItem('rumia_trophy', 'Rumia Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defGItem('rumia_mask', 'Rumia Mask', { max: 1, rarity: 2, value: 7500, armor: 'head', defense: 2, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'wood' } });
defGItem('torii_gate', 'Torii Gate', { max: 99, rarity: 1, value: 1000, tile: T.WOOD, tooltip: 'Red shrine wood (placeable)' });
SHOPS['Shrine Maiden'] = [
  { id: 'ofuda', price: 20 }, { id: 'yin_yang_orb', price: 30000 }, { id: 'sealed_ribbon', price: 10000 }, { id: 'lesser_healing', price: 300 },
  { id: 'fantasy_seal', price: 150000, cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.rumia) },
  { id: 'youkai_ribbon', price: 100000, cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.rumia) },
];
NPC_NAMES['Shrine Maiden'] = ['Reimu'];
NPC_ROLES['Shrine Maiden'] = {
  town: true, hairStyle: 1,
  colors: { skin: '#f2c6a0', hair: '#3a2a30', shirt: '#d02030', pants: '#f8f0f0', shoes: '#3a2a30', eye: '#8a3030' },
  weapon: { kind: 'ofuda', damage: 14, rate: 25, speed: 7 }, buttons: ['Shop'], shop: 'Shrine Maiden',
  condition: (g) => !!g.world.shrine && ((g.player.stats.points || 0) > 0 || (g.player.danmakuPower || 0) > 0 || (g.player.stats.grazes || 0) > 0),
  findHome: (g) => { const s = g.world.shrine; if (!s) return null; const h = g.world.checkHouse(s.chairX, s.chairY); return h.ok && !g.npcs.some(n => n.home && n.home.key === h.key) ? h : null; },
  lines: ["Donations go in the box. Any amount. Preferably a large one.", "Youkai have been restless lately. Bring me proof and I'll sell you something useful.", "Graze bullets closely and you'll rack up points. Just don't get hit.", "The ofuda are blessed. Mostly.", "If you see a girl in a black dress asking if it's so... run. Or fight. Your choice.", "Power items make your danmaku stronger. Point items make me happier."],
};

// Danmaku helpers ------------------------------------------------------------------
const Gensokyo = {
  grazeR: 26,
  // hostile bullet fired by an enemy
  bullet(game, x, y, vx, vy, o = {}) {
    const b = new Projectile(x, y, vx, vy, { kind: 'danmaku', damage: o.damage || 10, friendly: false, owner: o.owner || null, knockback: 1, color: o.color || '#ff80c0', hi: o.hi || '#fff' });
    b.hostile = true; b.ghost = true; b.life = o.life || 360; b.gravity = 0; b.size = o.size || 5; b.sourceName = o.sourceName || 'a bullet';
    if (o.accel) b.accel = o.accel; if (o.homing) b.homing = o.homing; if (o.curve) b.curve = o.curve;
    game.projectiles.push(b);
    return b;
  },
  // n-way aimed spread
  spread(game, e, player, n, speed, spreadAng, o) {
    const dx = player.cx - e.cx, dy = player.cy - e.cy, a0 = Math.atan2(dy, dx);
    for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * spreadAng; this.bullet(game, e.cx, e.cy, Math.cos(a) * speed, Math.sin(a) * speed, Object.assign({ owner: e }, o)); }
  },
  ring(game, e, n, speed, a0, o) { for (let i = 0; i < n; i++) { const a = a0 + i * Math.PI * 2 / n; this.bullet(game, e.cx, e.cy, Math.cos(a) * speed, Math.sin(a) * speed, Object.assign({ owner: e }, o)); } },
  // per-tick logic for hostile bullets: player hit & graze. Returns true if the bullet is gone.
  hostileTick(b, game) {
    const p = game.player;
    if (b.accel) { b.vx *= b.accel; b.vy *= b.accel; }
    if (b.curve) { const a = Math.atan2(b.vy, b.vx) + b.curve, s = Math.hypot(b.vx, b.vy); b.vx = Math.cos(a) * s; b.vy = Math.sin(a) * s; }
    if (b.homing && b.life > 200) { const dx = p.cx - b.x, dy = p.cy - b.y, d = Math.hypot(dx, dy) || 1; b.vx += dx / d * b.homing; b.vy += dy / d * b.homing; const s = Math.hypot(b.vx, b.vy); if (s > 5) { b.vx *= 5 / s; b.vy *= 5 / s; } }
    if (p.dead) return false;
    const r = b.size || 5;
    const cx = b.x + 3, cy = b.y + 3;
    const px = clamp(cx, p.x, p.x + p.w), py = clamp(cy, p.y, p.y + p.h);
    const d = Math.hypot(cx - px, cy - py);
    if (d < r - 1) {
      // hit
      p.damage(b.damage, cx, game, 'enemy', false, b.sourceName, b.owner);
      if (b.slow || b.mist) p.addBuff('Slow', b.mist ? 240 : 180);
      if (b.onHitPlayer) b.onHitPlayer(game, b);
      this.onPlayerHit(game);
      b.dead = true;
      for (let i = 0; i < 4; i++) game.particles.push(new Particle(cx, cy, rand(-2, 2), rand(-2, 2), b.color, 20, 2));
      return true;
    }
    const gr = this.grazeR + (p.acc && p.acc.grazeBonus || 0);
    if (!b.grazed && d < gr) { b.grazed = true; this.graze(game, cx, cy); }
    return false;
  },
  graze(game, x, y) {
    const p = game.player;
    p.stats.grazes = (p.stats.grazes || 0) + 1;
    p.coins += 5;
    game.particles.push(new Particle(x, y, rand(-1, 1), rand(-1, 1), '#ffffff', 12, 1));
    if (p.stats.grazes % 10 === 0) game.addDamageText(p.cx, p.y - 12, `graze x${p.stats.grazes}`, '#c0e0ff');
    if (p.stats.grazes >= 100 && game.pets) game.pets.unlock('grazer');
  },
  onPlayerHit(game) { const b = game.boss; if (b && b.spellHits != null) b.spellHits++; },
  drawProjectile(b, ctx) {
    switch (b.kind) {
      case 'danmaku': { ctx.rotate(-Math.atan2(b.vy, b.vx)); const r = b.size || 5; ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = b.hi || '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill(); return true; }
      case 'ofuda': ctx.fillStyle = '#f8f0e0'; ctx.fillRect(-7, -3, 14, 6); ctx.fillStyle = '#d02020'; ctx.fillRect(-4, -1, 2, 2); ctx.fillRect(1, -1, 2, 2); return true;
      case 'yinyang': { ctx.rotate(Date.now() * 0.01); ctx.fillStyle = '#202020'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(0, 0, 8, -Math.PI / 2, Math.PI / 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, -4, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#202020'; ctx.beginPath(); ctx.arc(0, 4, 4, 0, Math.PI * 2); ctx.fill(); return true; }
      case 'seal': { ctx.rotate(-Math.atan2(b.vy, b.vx)); ctx.fillStyle = b.color; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); return true; }
      case 'coin': ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff0a0'; ctx.fillRect(-1, -2, 2, 4); return true;
      case 'egg': ctx.fillStyle = b.color || '#f0e8d0'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c0a0d0'; ctx.fillRect(-2, -2, 2, 2); ctx.fillRect(1, 1, 2, 2); return true;
    }
    return false;
  },
  // friendly projectile behaviours (homing ofuda / seals, bouncing orbs)
  friendlyTick(b, game, world) {
    if (b.kind === 'ofuda' || b.kind === 'seal') {
      let t = null, best = (b.kind === 'seal' ? 30 : 16) * TILE;
      for (const e of game.enemies) { const d = dist(e.cx, e.cy, b.x, b.y); if (d < best) { best = d; t = e; } }
      if (t) { const dx = t.cx - b.x, dy = t.cy - b.y, d = Math.hypot(dx, dy) || 1; const pull = b.kind === 'seal' ? 0.9 : 0.6; b.vx += dx / d * pull; b.vy += dy / d * pull; const sp = Math.hypot(b.vx, b.vy), mx = b.kind === 'seal' ? 9 : 8; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; } }
    }
    if (b.kind === 'yinyang') {
      b.vy += 0.12;
      const nx = b.x + b.vx, ny = b.y + b.vy;
      if (world.isSolidAt(Math.floor((nx + 3) / TILE), Math.floor((b.y + 3) / TILE))) { b.vx *= -0.9; b.bounces = (b.bounces || 0) + 1; }
      if (world.isSolidAt(Math.floor((b.x + 3) / TILE), Math.floor((ny + 3) / TILE))) { b.vy *= -0.85; b.bounces = (b.bounces || 0) + 1; }
      if (b.bounces > 8) b.dead = true;
      if (b.life % 30 === 0) b.hitSet.clear();
      return true; // handles its own tile collision
    }
    return false;
  },
  summonRumia(game) {
    const p = game.player;
    const mult = (game.expert ? 1.6 : 1) * (game.master ? 1.5 : 1);
    const b = new Rumia(p.cx + (Math.random() < 0.5 ? -300 : 300), Math.max(32, p.y - 180), mult);
    if (game.expert) b.damage = 34; if (game.master) b.damage = Math.round(b.damage * 1.5);
    game.enemies.push(b); game.boss = b;
    BossLog.start(game, b);
    game.message('Rumia has appeared! "Is that so?"', '#c040c0'); Audio_.play('zombie');
  },
  danmakuMult(p) { return (1 + (p.danmakuPower || 0) * 0.25) * (1 + ((p.acc && p.acc.danmakuDmg) || 0) / 100); },
  aim(game) { const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14); const d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1; return [dx / d, dy / d]; },
  throwOfuda(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const [nx, ny] = this.aim(game);
    const dmg = Math.round(st.damage * this.danmakuMult(p) * p.pm.dmg);
    const b = new Projectile(p.cx, p.y + 14, nx * 8, ny * 8, { kind: 'ofuda', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit });
    b.life = 100; b.gravity = 0; game.projectiles.push(b);
    if (Math.random() < 0.4) game.consumeSlot(slot);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  },
  throwOrb(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const [nx, ny] = this.aim(game);
    const dmg = Math.round(st.damage * this.danmakuMult(p) * p.pm.dmg);
    const b = new Projectile(p.cx, p.y + 14, nx * 8, ny * 8 - 1, { kind: 'yinyang', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: 4 });
    b.life = 200; b.gravity = 0; b.w = b.h = 10; b.x -= 2; b.y -= 2; game.projectiles.push(b);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  },
  castSeal(game, slot, it) {
    const p = game.player;
    const cost = Math.max(1, Math.round(it.manaCost * (p.acc && p.acc.manaCostMult || 1)));
    if (p.mana < cost) { if (game.useHeld === 1) game.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return; }
    p.mana -= cost; p.manaRegenDelay = 40; p.lastManaUse = cost;
    const st = itemStats(slot);
    const dmg = Math.round(st.damage * this.danmakuMult(p) * p.pm.dmg * (p.hasBuff('Mana Sickness') ? 0.75 : 1));
    const cs = ['#ff4040', '#40ff40', '#4040ff', '#ffff40', '#ff40ff', '#40ffff'];
    this.aim(game);
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.5; const b = new Projectile(p.cx, p.y + 10, Math.cos(a) * 5, Math.sin(a) * 5, { kind: 'seal', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: cs[i], magic: true, manaCost: cost }); b.life = 150; b.gravity = 0; b.ghost = true; game.projectiles.push(b); }
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  },
  // HUD: power / graze counters, spell card banner, darkness overlay
  draw(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, p = game.player;
    const b = game.boss;
    if (b && !b.dead && b.darkness) {
      const z = game.renderer.zoom, sx = (p.cx - game.cam.x) * z, sy = (p.cy - game.cam.y) * z;
      const g = ctx.createRadialGradient(sx, sy, 40 * z, sx, sy, 260 * z);
      g.addColorStop(0, 'rgba(0,0,10,0)'); g.addColorStop(1, 'rgba(0,0,10,0.82)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (b && !b.dead && b.spell) {
      const s = b.spell;
      const t = Math.max(0, Math.ceil(b.spellTimer / 60));
      drawText(ctx, `Spell card: ${t}s   ${b.spellHits === 0 ? 'Bonus active' : 'Bonus failed'}`, W / 2, H - 70 - 48, { size: 14, align: 'center', color: b.spellHits === 0 ? '#a0ffa0' : '#ff9090' });
    }
    if (b && !b.dead && b.captureFlash > 0) { ctx.globalAlpha = clamp(b.captureFlash / 30, 0, 1); drawText(ctx, b.captureText, W / 2, H * 0.3, { size: 28, align: 'center', color: '#ffe060' }); ctx.globalAlpha = 1; }
    if ((p.danmakuPower || 0) > 0 || (p.stats.grazes || 0) > 0) {
      drawText(ctx, `Power ${(p.danmakuPower || 0).toFixed(2)}   Graze ${p.stats.grazes || 0}`, W - 22, H - 122 - (game.pets.pet ? 50 : 0), { size: 13, align: 'right', color: '#ffb0d0' });
    }
  },
};

// Fairy ----------------------------------------------------------------------------
class Fairy extends Enemy {
  constructor(x, y, def) {
    super(x, y, 18, 28, def);
    this.flying = true; this.shotTimer = randInt(60, 140); this.wing = def.wing || '#c0e0ff'; this.dress = def.dress || '#ff80c0';
  }
  ai(world, player, game) {
    const side = this.cx < player.cx ? -1 : 1;
    const tx = player.cx + side * (this.def.range || 150), ty = player.y - 30 + Math.sin(this.t * 0.05) * 24;
    const dx = tx - this.cx, dy = ty - this.cy, sf = this.slowFactor;
    this.vx = lerp(this.vx, clamp(dx / 40, -2.4, 2.4) * sf, 0.08); this.vy = lerp(this.vy, clamp(dy / 40, -2, 2) * sf, 0.08);
    const nx = this.x + this.vx, ny = this.y + this.vy;
    if (!this.overlapsSolid(world, nx, this.y)) this.x = nx; else this.vx *= -0.5;
    if (!this.overlapsSolid(world, this.x, ny)) this.y = ny; else this.vy *= -0.5;
    this.dir = player.cx < this.cx ? -1 : 1;
    if (--this.shotTimer <= 0 && dist(this.cx, this.cy, player.cx, player.cy) < 30 * TILE && !player.dead) {
      this.shotTimer = this.def.rate || 110;
      Gensokyo.spread(game, this, player, this.def.shots || 3, this.def.bulletSpeed || 3.2, 0.22, { color: this.def.bullet || '#ff80c0', damage: Math.max(1, Math.round(this.damage * 0.7)), sourceName: `a ${this.name}'s bullet`, life: 300 });
      Audio_.play('menu');
    }
  }
  draw(ctx, camX, camY) {
    this.drawShadowFlash(ctx);
    const x = snap(this.x - camX), y = snap(this.y - camY), f = Math.sin(this.t * 0.4) * 3;
    ctx.save(); ctx.translate(x + 9, y);
    if (this.dir < 0) ctx.scale(-1, 1);
    ctx.fillStyle = this.wing; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.ellipse(-8, 12, 6 + f, 9, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-7, 20, 5 + f, 6, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = this.hitFlash > 0 ? 0.55 : 1;
    ctx.fillStyle = this.dress; ctx.fillRect(-5, 12, 10, 12); ctx.beginPath(); ctx.moveTo(-6, 24); ctx.lineTo(6, 24); ctx.lineTo(8, 28); ctx.lineTo(-8, 28); ctx.fill();
    ctx.fillStyle = '#f2c6a0'; ctx.fillRect(-4, 2, 8, 10); ctx.fillRect(-7, 14, 3, 6); ctx.fillRect(4, 14, 3, 6);
    ctx.fillStyle = this.def.hair || '#e8d060'; ctx.fillRect(-5, 0, 10, 4); ctx.fillRect(-5, 4, 2, 6); ctx.fillRect(3, 4, 2, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(1, 5, 2, 2); ctx.fillStyle = '#fff'; ctx.fillRect(2, 5, 1, 1);
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
ENEMY_DEFS.fairy = { name: 'Fairy', cls: Fairy, hp: 30, damage: 12, defense: 2, blood: '#ffc0e0', wing: '#c0e0ff', dress: '#ff80c0', hair: '#e8d060', shots: 3, rate: 110, bullet: '#ff80c0', drops: [{ id: 'point_item', chance: 0.8, min: 1, max: 3 }, { id: 'power_item', chance: 0.5, min: 1, max: 2 }] };
ENEMY_DEFS.sunflower_fairy = { name: 'Sunflower Fairy', cls: Fairy, hp: 45, damage: 14, defense: 4, blood: '#ffe0a0', wing: '#e0ffc0', dress: '#e0c040', hair: '#a06020', shots: 5, rate: 130, bulletSpeed: 2.8, bullet: '#ffe040', range: 170, drops: [{ id: 'point_item', chance: 1, min: 2, max: 4 }, { id: 'power_item', chance: 0.6, min: 1, max: 2 }] };
ENEMY_DEFS.ice_fairy = { name: 'Ice Fairy', cls: Fairy, hp: 60, damage: 16, defense: 6, blood: '#c0f0ff', wing: '#a0e0ff', dress: '#4080e0', hair: '#80c0ff', shots: 4, rate: 100, bulletSpeed: 3.6, bullet: '#a0e8ff', drops: [{ id: 'point_item', chance: 1, min: 2, max: 5 }, { id: 'power_item', chance: 0.7, min: 1, max: 3 }] };

// Rumia: spell-card boss ---------------------------------------------------------------
const RUMIA_PHASES = [
  { name: null, hp: 350, dur: null, pattern: 'ring' },
  { name: 'Night Sign "Night Bird"', hp: 450, dur: 60 * 35, pattern: 'nightbird' },
  { name: null, hp: 300, dur: null, pattern: 'ring2' },
  { name: 'Darkness Sign "Demarcation"', hp: 450, dur: 60 * 30, pattern: 'demarcation' },
  { name: 'Moon Sign "Moonlight Ray"', hp: 500, dur: 60 * 40, pattern: 'moonlight' },
];
class Rumia extends Enemy {
  constructor(x, y, mult = 1) {
    const total = Math.round(RUMIA_PHASES.reduce((a, p) => a + p.hp, 0) * mult);
    super(x, y, 22, 40, { name: 'Rumia', hp: total, damage: 24, defense: 8, kbResist: 1, blood: '#402040', drops: [] });
    this.isBoss = true; this.type = 'rumia'; this.flying = true; this.hpMult = mult;
    this.phase = -1; this.spell = null; this.spellTimer = 0; this.spellHits = 0; this.phaseStartHp = this.hp; this.captureFlash = 0; this.captureText = ''; this.darkness = false; this.moveT = 0; this.anchor = null; this.pt = 0;
    this.nextPhase();
  }
  nextPhase(game) {
    if (this.spell && game) {
      if (this.spellHits === 0 && this.spellTimer > 0) { this.captureFlash = 120; this.captureText = 'Spell Card Bonus!  ' + this.spell.name; game.message(`Spell Card Bonus: ${this.spell.name} captured!`, '#ffe060'); Audio_.play('levelup'); for (let i = 0; i < 12; i++) game.dropItem(this.cx + rand(-30, 30), this.cy, 'point_item', 1); }
      else { this.captureFlash = 90; this.captureText = this.spellTimer <= 0 ? 'Spell Card timed out' : 'Bonus failed'; }
    }
    if (game) this.clearBullets(game);
    this.phase++;
    if (this.phase >= RUMIA_PHASES.length) return false;
    const ph = RUMIA_PHASES[this.phase];
    this.phaseStartHp = this.hp; this.phaseEndHp = this.phase === RUMIA_PHASES.length - 1 ? 0 : Math.round(this.hp - ph.hp * this.hpMult);
    this.spell = ph.name ? ph : null; this.spellTimer = ph.dur || 0; this.spellHits = 0; this.pt = 0;
    this.darkness = ph.pattern === 'demarcation';
    if (game && ph.name) { game.message(`Rumia declares: ${ph.name}`, '#ffb0ff'); Audio_.play('zombie'); }
    return true;
  }
  update(world, game) {
    this.t++; this.pt++;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.captureFlash > 0) this.captureFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    if (world.isDay() && this.t % 60 === 0 && this.t > 600) { game.message('Rumia melts into the dawn...', '#c0c0ff'); this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    // phase bookkeeping
    if (this.spell) { this.spellTimer--; if (this.spellTimer <= 0) { this.hp = Math.min(this.hp, this.phaseEndHp); } }
    if (this.hp <= this.phaseEndHp && this.phase < RUMIA_PHASES.length - 1) { this.hp = this.phaseEndHp; if (!this.nextPhase(game)) { this.die(game); return; } }
    if (this.hp <= 0) { this.die(game); return; }
    const ph = RUMIA_PHASES[this.phase];
    // movement: hover above / beside the player
    let tx = p.cx, ty = p.y - 130;
    if (ph.pattern === 'nightbird' || ph.pattern === 'moonlight') tx = p.cx + Math.sin(this.pt * 0.02) * 220;
    else if (ph.pattern === 'demarcation') { tx = p.cx + Math.cos(this.pt * 0.015) * 90; ty = p.y - 60 + Math.sin(this.pt * 0.03) * 40; }
    else { tx = p.cx + (this.pt % 240 < 120 ? -1 : 1) * 110; }
    const dx = tx - this.cx, dy = ty - this.cy;
    this.vx = lerp(this.vx, clamp(dx / 30, -4, 4), 0.06); this.vy = lerp(this.vy, clamp(dy / 30, -3, 3), 0.06);
    this.x += this.vx; this.y += this.vy;
    if (this.y < 16) this.y = 16;
    this.dir = p.cx < this.cx ? -1 : 1;
    // attack patterns
    const dmg = this.damage * 0.6, src = "Rumia's darkness";
    switch (ph.pattern) {
      case 'ring': if (this.pt % 80 === 0) Gensokyo.ring(game, this, 14, 2.6, this.pt * 0.01, { color: '#ff6060', damage: dmg, sourceName: src }); break;
      case 'ring2': if (this.pt % 60 === 0) { Gensokyo.ring(game, this, 16, 2.2, this.pt * 0.02, { color: '#ff6060', damage: dmg, sourceName: src }); Gensokyo.spread(game, this, p, 3, 4, 0.2, { color: '#ffffff', damage: dmg, sourceName: src }); } break;
      case 'nightbird': if (this.pt % 14 === 0) Gensokyo.spread(game, this, p, 5, 3.4, 0.16, { color: '#4040ff', hi: '#c0c0ff', damage: dmg, sourceName: src, size: 5 }); if (this.pt % 90 === 0) Gensokyo.ring(game, this, 10, 2, this.pt * 0.03, { color: '#8040ff', damage: dmg, sourceName: src }); break;
      case 'demarcation': if (this.pt % 6 === 0) { const a = this.pt * 0.15; for (let k = 0; k < 3; k++) { const aa = a + k * Math.PI * 2 / 3; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(aa) * 2.2, Math.sin(aa) * 2.2, { owner: this, color: '#202030', hi: '#8080a0', damage: dmg, sourceName: src, size: 6, curve: 0.01 }); } } break;
      case 'moonlight': if (this.pt % 40 === 0) { const a = Math.atan2(p.cy - this.cy, p.cx - this.cx); for (let k = 0; k < 8; k++) Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * (3 + k * 0.6), Math.sin(a) * (3 + k * 0.6), { owner: this, color: '#e0e0ff', hi: '#ffffff', damage: dmg + 4, sourceName: src, size: 4 }); } if (this.pt % 70 === 35) Gensokyo.ring(game, this, 20, 2.4, this.pt * 0.01, { color: '#ffe0a0', damage: dmg, sourceName: src }); break;
    }
    this.touchPlayer(p, game);
  }
  clearBullets(game) { for (const b of game.projectiles) if (b.hostile && b.owner === this) { b.dead = true; game.particles.push(new Particle(b.x + 3, b.y + 3, rand(-1, 1), rand(-1, 1), '#ffffff', 15, 2)); } }
  touchPlayer(player, game) { const before = player.invuln; super.touchPlayer(player, game); if (player.invuln > 0 && before === 0 && this.spell) this.spellHits++; }
  die(game) {
    super.die(game);
    this.clearBullets(game);
    game.boss = null;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.rumia = true;
    game.message('Rumia has been defeated!', '#ffe75a'); Audio_.play('levelup');
    for (let i = 0; i < 20; i++) game.dropItem(this.cx + rand(-40, 40), this.cy, 'point_item', 1);
    for (let i = 0; i < 6; i++) game.dropItem(this.cx + rand(-40, 40), this.cy, 'power_item', 1);
    game.dropItem(this.cx, this.cy, 'ofuda', randInt(50, 99)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(3, 6));
    if (Math.random() < 0.5) game.dropItem(this.cx, this.cy, 'fantasy_seal', 1);
    if (Math.random() < 0.33 || game.expert) game.dropItem(this.cx, this.cy, 'youkai_ribbon', 1, null, null);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'rumia_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'rumia_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 15000 * (game.expert ? 2.5 : 1));
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null);
    for (let i = 0; i < 60; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-7, 7), rand(-7, 3), choose(['#402040', '#ff6060', '#ffffff']), 80, 4));
    if (game.pets) game.pets.unlock('spell_breaker');
  }
  draw(ctx, camX, camY) {
    const x = this.x - camX, y = this.y - camY;
    if (this.darkness) { ctx.fillStyle = 'rgba(10,0,20,0.75)'; ctx.beginPath(); ctx.arc(snap(x + 11), snap(y + 20), 46 + Math.sin(this.t * 0.1) * 4, 0, Math.PI * 2); ctx.fill(); }
    if (this.hitFlash > 0) ctx.globalAlpha = 0.6;
    drawHumanoid(ctx, x + 1, y + Math.sin(this.t * 0.06) * 2, { dir: this.dir, walk: null, air: true, colors: { skin: '#f2c6a0', hair: '#e8d060', shirt: '#202028', pants: '#202028', shoes: '#101018', eye: '#c02020' }, armAngle: this.spell ? -0.3 : null, item: null, hairStyle: 1 });
    ctx.globalAlpha = 1;
    // red ribbon
    ctx.fillStyle = '#e02020'; ctx.fillRect(snap(x + (this.dir > 0 ? 2 : 14)), snap(y - 4), 6, 4); ctx.fillRect(snap(x + (this.dir > 0 ? 4 : 12)), snap(y - 2), 2, 5);
    // arms out ("Is that so?")
    if (!this.spell && this.t % 400 < 120) { ctx.fillStyle = '#202028'; ctx.fillRect(snap(x - 8), snap(y + 14), 8, 4); ctx.fillRect(snap(x + 22), snap(y + 14), 8, 4); }
  }
}
BOSSES.push({ id: 'rumia', name: 'Rumia', order: 3, hp: RUMIA_PHASES.reduce((a, p) => a + p.hp, 0), summon: 'sealed_ribbon',
  spawn: 'Use a Sealed Ribbon (15 Gel + 3 Lenses + 1 Fallen Star at a Work Bench) at night, or buy one from the Shrine Maiden.',
  info: 'The youkai of dusk. Fights in phases: two non-spells and three named spell cards with timers. Survive a spell card without being hit to capture it for a Spell Card Bonus (point items). Graze bullets for points.',
  loot: ['fantasy_seal', 'youkai_ribbon', 'ofuda', 'point_item', 'power_item'], collectibles: ['rumia_trophy', 'rumia_mask'], despawn: 'Rumia melts into the dawn...' });

// Shrine mini-biome ------------------------------------------------------------------
function placeShrine(world, rng) {
  const RW = 10, RH = 7;
  const side = rng() < 0.5 ? -1 : 1;
  let cx = clamp(world.spawnX + side * (110 + Math.floor(rng() * 70)), 40, world.w - 40);
  // find a reasonably flat stretch
  let best = cx, bestVar = 1e9;
  for (let x = cx - 40; x <= cx + 40; x += 2) {
    if (x < 30 || x > world.w - 30) continue;
    let mn = 1e9, mx = -1e9; for (let k = -14; k <= 14; k++) { const s = world.surface[x + k]; mn = Math.min(mn, s); mx = Math.max(mx, s); }
    if (mx - mn < bestVar) { bestVar = mx - mn; best = x; }
  }
  cx = best;
  const ground = world.surface[cx];
  const clear = (x, y) => { world.setTile(x, y, T.AIR); world.liquid[world.idx(x, y)] = 0; };
  // terrace of stone bricks
  for (let x = cx - 16; x <= cx + 16; x++) {
    for (let y = ground - 22; y < ground; y++) clear(x, y);
    for (let y = ground; y < ground + 8; y++) if (!TILES[world.get(x, y)].solid) world.setTile(x, y, T.DIRT);
    world.setTile(x, ground, T.STONEBRICK);
  }
  // shrine house (valid housing) on the right of the terrace
  const hx = cx + 3, hy = ground - RH;
  for (let y = hy; y < hy + RH; y++) for (let x = hx; x < hx + RW; x++) { const edge = x === hx || x === hx + RW - 1 || y === hy || y === hy + RH - 1; if (edge) world.setTile(x, y, T.WOOD); else clear(x, y); world.setWall(x, y, W.WOOD); }
  const inBottom = hy + RH - 2;
  for (let k = 0; k < 3; k++) clear(hx, inBottom - k); world.placeFurniture(hx, inBottom - 2, T.DOOR_C);
  world.setTile(hx + 2, hy + 2, T.TORCH); world.setTile(hx + 7, hy + 2, T.TORCH);
  world.placeFurniture(hx + 3, inBottom - 1, T.TABLE);
  world.placeFurniture(hx + 7, inBottom - 1, T.CHAIR);
  // roof ridge
  for (let x = hx - 1; x <= hx + RW; x++) world.setTile(x, hy - 1, T.PLATFORM);
  // torii gate on the left
  const gx = cx - 10;
  for (let k = 1; k <= 7; k++) { world.setTile(gx, ground - k, T.WOOD); world.setTile(gx + 5, ground - k, T.WOOD); }
  for (let x = gx - 1; x <= gx + 6; x++) { world.setTile(x, ground - 8, T.WOOD); world.setTile(x, ground - 6, T.PLATFORM); }
  // donation box (chest) with starter danmaku gear
  world.placeFurniture(cx - 2, ground - 2, T.CHEST);
  const inv = world.chests.get(world.idx(cx - 2, ground - 2));
  if (inv) { inv[0] = makeStack('ofuda', 40, null); inv[1] = makeStack('point_item', 15, null); inv[2] = makeStack('power_item', 5, null); inv[3] = makeStack('lesser_healing', 3, null); }
  world.setTile(cx - 4, ground - 1, T.TORCH); world.setTile(cx, ground - 1, T.TORCH);
  world.shrine = { x: cx, y: ground, chairX: hx + 7, chairY: inBottom - 1 };
  world.rebuildTopSolid();
  return true;
}
