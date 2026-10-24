// ---------------------------------------------------------------------------
// Bosses (terraria.wiki.gg/wiki/Bosses), part 1: the boss framework and the
// pre-Hardmode bosses - Eater of Worlds, Brain of Cthulhu, Queen Bee, Deerclops,
// Skeletron and the Wall of Flesh (which starts Hardmode).
// ---------------------------------------------------------------------------
'use strict';

const BOSS_DEFS = {};
function defBoss(id, def) { BOSS_DEFS[id] = def; BOSSES.push(Object.assign({ id, name: def.name, order: def.order, hp: def.hp, summon: def.summon, spawn: def.spawn, info: def.info, loot: def.loot || [], collectibles: def.collectibles || [], despawn: def.despawn || `${def.name} has departed...` })); }
class BossBase extends Enemy {
  constructor(x, y, w, h, id) {
    const d = BOSS_DEFS[id];
    super(x, y, w, h, { name: d.name, hp: d.hp, damage: d.damage, defense: d.defense || 10, kbResist: 1, blood: d.blood || '#c03030', drops: [] });
    this.isBoss = true; this.type = id; this.flying = d.flying !== false; this.bdef = d; this.state = 'start'; this.st = 0; this.parts = [];
  }
  update(world, game) {
    this.t++; this.st++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.despawn(game); return; }
    if (this.bdef.dayDespawn && world.isDay() && this.t > 300) { game.message(this.bdef.despawn, '#c0c0ff'); this.despawn(game); return; }
    if (this.bdef.leash && dist(this.cx, this.cy, p.cx, p.cy) > this.bdef.leash * TILE) { if (this.bdef.teleportWhenFar) { this.x = p.cx + (Math.random() < 0.5 ? -300 : 300); this.y = p.y - 200; } else { game.message(this.bdef.despawn, '#c0c0ff'); this.despawn(game); return; } }
    this.ai(world, p, game);
    if (!this.noContact) this.touchPlayer(p, game);
  }
  despawn(game) { this.dead = true; for (const q of this.parts) q.dead = true; if (game.boss === this) game.boss = null; game.onBossDespawn(this); }
  setState(s) { this.state = s; this.st = 0; }
  hoverTo(tx, ty, sp, acc = 0.06) { this.vx = lerp(this.vx, clamp((tx - this.cx) / 30, -sp, sp), acc); this.vy = lerp(this.vy, clamp((ty - this.cy) / 30, -sp, sp), acc); this.x += this.vx; this.y += this.vy; if (this.y < 16) this.y = 16; }
  chargeAt(p, sp) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; this.vx = dx / d * sp; this.vy = dy / d * sp; }
  glide() { this.x += this.vx; this.y += this.vy; if (this.y < 16) { this.y = 16; this.vy = Math.abs(this.vy); } }
  shoot(game, p, o) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; const sp = o.speed || 6; return Gensokyo.bullet(game, o.x != null ? o.x : this.cx, o.y != null ? o.y : this.cy, dx / d * sp + (o.vx || 0), dy / d * sp + (o.vy || 0), Object.assign({ owner: this, damage: Math.round(this.damage * (o.mult || 0.7)), sourceName: `${this.name}'s ${o.name || 'attack'}`, size: o.size || 5, life: o.life || 180, color: o.color || '#ff8060', hi: o.hi || '#fff' }, o)); }
  spawnMinion(game, type, x, y) { const e = spawnEnemy(type, x, y, game.expert); e.minion = true; game.enemies.push(e); return e; }
  die(game) {
    super.die(game);
    for (const q of this.parts) q.dead = true;
    if (game.boss === this) game.boss = null;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated[this.type] = true;
    if (Subworlds.snapshot) { const mw = Subworlds.snapshot.world; mw.bossesDefeated = mw.bossesDefeated || {}; mw.bossesDefeated[this.type] = true; }
    game.message(`${this.name} has been defeated!`, '#ffe75a'); Audio_.play('levelup'); FX.shake(6, 25); FX.flash('#ffffff', 15, 0.3);
    const d = this.bdef;
    if (d.drops) for (const dr of d.drops) { if (Math.random() < (dr.chance == null ? 1 : dr.chance)) game.dropItem(this.cx + rand(-20, 20), this.cy, dr.id, randInt(dr.min || 1, dr.max || dr.min || 1), null, ITEMS[dr.id] && (ITEMS[dr.id].accessory || ITEMS[dr.id].damage) ? undefined : null); }
    if (d.oneOf) game.dropItem(this.cx, this.cy, choose(d.oneOf), 1);
    if (d.collectibles) { if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, d.collectibles[0], 1); if (d.collectibles[1] && Math.random() < 0.14) game.dropItem(this.cx, this.cy, d.collectibles[1], 1, null, null); }
    game.dropCoins(this.cx, this.cy, (d.coins || 20000) * (game.expert ? 2.5 : 1));
    if (game.expert) { game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null); if (d.expertItem) game.dropItem(this.cx, this.cy, d.expertItem, 1, null, null); }
    if (d.onDeath) d.onDeath(game, this);
    for (let i = 0; i < 50; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-7, 7), rand(-7, 3), d.blood || '#c03030', 80, 4));
  }
}
// boss parts (hands, eyes, fists, creepers) forward their damage to the parent unless they have their own life
class BossPart extends Enemy {
  constructor(parent, w, h, o = {}) {
    super(parent.x, parent.y, w, h, { name: o.name || parent.name, hp: o.hp || 1, damage: o.damage || parent.damage, defense: o.defense || parent.defense, kbResist: 1, blood: parent.def.blood, drops: [] });
    this.parent = parent; this.own = !!o.hp; this.isPart = true; this.flying = true; this.type = o.type || parent.type + '_part'; this.offset = o.offset || { x: 0, y: 0 }; this.draw_ = o.draw; this.ai_ = o.ai; this.noContact = !!o.noContact;
    parent.parts.push(this);
  }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.own) { const r = super.hit(dmg, fromX, 0, game, swingId, crit); if (this.parent.onPartHit) this.parent.onPartHit(this, game); return r; } return this.parent.hit(dmg, fromX, 0, game, swingId, crit); }
  update(world, game) { this.t++; if (this.parent.dead) { this.dead = true; return; } if (this.hitFlash > 0) this.hitFlash--; this.tickDebuffs(game); if (this.dead) return; if (this.ai_) this.ai_(this, world, game.player, game); else { this.x = this.parent.cx + this.offset.x - this.w / 2; this.y = this.parent.cy + this.offset.y - this.h / 2; } if (!this.noContact) this.touchPlayer(game.player, game); }
  die(game) { this.dead = true; Audio_.play('kill'); for (let i = 0; i < 12; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-4, 4), rand(-5, 1), this.def.blood, 50, 3)); if (this.parent.onPartDeath) this.parent.onPartDeath(this, game); }
  draw(ctx, camX, camY) { if (this.draw_) this.draw_(this, ctx, camX, camY); else { ctx.fillStyle = this.def.blood; ctx.fillRect(snap(this.x - camX), snap(this.y - camY), this.w, this.h); } }
}
// generic worm boss / enemy (Eater of Worlds, Devourer, The Destroyer, Phantasm Dragon)
class Worm extends Enemy {
  constructor(x, y, o) {
    super(x, y, o.size || 28, o.size || 28, { name: o.name, hp: o.hp, damage: o.damage, defense: o.defense || 6, kbResist: 1, blood: o.blood || '#7050a0', drops: o.drops || [] });
    this.o = o; this.isBoss = !!o.boss; this.type = o.type; this.flying = true; this.angle = Math.PI / 2; this.segments = []; this.lunge = 0; this.trail = o.trail || null;
    this.head = { col: o.head || '#5a3a8a', eye: o.eye || '#ff4040' };
  }
  spawnSegments(game) { for (let i = 1; i <= this.o.segments; i++) { const s = new WormSeg(this, i); s.x = this.x; s.y = this.y + i * (this.w - 6); game.enemies.push(s); this.segments.push(s); } }
  update(world, game) {
    this.t++; if (this.hitFlash > 0) this.hitFlash--; this.tickDebuffs(game); if (this.dead) return;
    const p = game.player; if (p.dead) { this.dead = true; if (game.boss === this) { game.boss = null; game.onBossDespawn(this); } return; }
    const inGround = world.isSolidAt(this.tileX, this.tileY) || this.o.ghost;
    const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1, want = Math.atan2(dy, dx);
    let da = ((want - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const turn = (inGround ? 0.05 : 0.02) * (this.o.turn || 1);
    if (this.lunge > 0) this.lunge--; else this.angle += clamp(da, -turn, turn);
    if (!inGround) { let dd = ((Math.PI / 2 - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI; this.angle += clamp(dd, -0.012, 0.012); }
    const spd = ((inGround ? this.o.speed : this.o.speed * 0.75) + (this.lunge > 0 ? 3 : 0)) * this.slowFactor;
    this.x += Math.cos(this.angle) * spd; this.y += Math.sin(this.angle) * spd;
    this.x = clamp(this.x, 0, world.w * TILE - this.w); this.y = clamp(this.y, 0, world.h * TILE - this.h);
    if (inGround && this.t % 4 === 0 && !this.o.ghost) game.particles.push(new Particle(this.cx + rand(-8, 8), this.cy + rand(-8, 8), rand(-1, 1), rand(-2, 0), '#8a6a4a', 20, 2));
    let prev = this; for (const s of this.segments) { const sx = prev.cx - s.cx, sy = prev.cy - s.cy, sd = Math.hypot(sx, sy) || 1, gap = this.w - 6; if (sd > gap) { s.x += sx / sd * (sd - gap); s.y += sy / sd * (sd - gap); } s.angle = Math.atan2(sy, sx); prev = s; }
    if (this.o.shoot && this.t % this.o.shoot === 0 && d < 30 * TILE) { const seg = choose([this, ...this.segments]); const b = Gensokyo.bullet(game, seg.cx, seg.cy, dx / d * 5, dy / d * 5, { owner: this, color: this.o.bullet || '#a060ff', damage: Math.round(this.damage * 0.6), sourceName: `${this.name}'s spit`, size: 5, life: 120 }); b.ghost = false; }
    if (d > 90 * TILE) { this.x = p.cx; this.y = p.cy + 40 * TILE; }
    if (!this.isBoss && d > 140 * TILE) { this.dead = true; for (const s of this.segments) s.dead = true; }
    this.touchPlayer(p, game);
  }
  die(game) {
    super.die(game); for (const s of this.segments) s.dead = true;
    if (this.isBoss) { if (game.boss === this) game.boss = null; game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated[this.type] = true; game.message(`${this.name} has been defeated!`, '#ffe75a'); Audio_.play('levelup'); FX.shake(6, 25); const d = BOSS_DEFS[this.type]; if (d) { for (const dr of d.drops || []) if (Math.random() < (dr.chance == null ? 1 : dr.chance)) game.dropItem(this.cx, this.cy, dr.id, randInt(dr.min || 1, dr.max || dr.min || 1)); if (d.oneOf) game.dropItem(this.cx, this.cy, choose(d.oneOf), 1); if (d.collectibles) { if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, d.collectibles[0], 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, d.collectibles[1], 1, null, null); } game.dropCoins(this.cx, this.cy, (d.coins || 20000) * (game.expert ? 2.5 : 1)); if (game.expert) { game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null); if (d.expertItem) game.dropItem(this.cx, this.cy, d.expertItem, 1, null, null); } if (d.onDeath) d.onDeath(game, this); } }
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY), r = this.w / 2; ctx.save(); ctx.translate(x, y); ctx.rotate(this.angle); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = this.head.col; ctx.beginPath(); ctx.ellipse(0, 0, r + 2, r - 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#201020'; ctx.beginPath(); ctx.moveTo(r * 0.4, -r * 0.6); ctx.lineTo(r + 2, -r * 0.2); ctx.lineTo(r + 2, r * 0.2); ctx.lineTo(r * 0.4, r * 0.6); ctx.closePath(); ctx.fill(); ctx.fillStyle = this.head.eye; ctx.fillRect(0, -r * 0.7, 4, 4); ctx.fillRect(0, r * 0.7 - 4, 4, 4); ctx.restore(); ctx.globalAlpha = 1; }
}
class WormSeg extends Enemy {
  constructor(head, idx) { super(head.x, head.y, head.w - 4, head.w - 4, { name: head.name, hp: head.o.segHp || 1, damage: Math.max(1, head.damage - 8), defense: head.defense, kbResist: 1, blood: head.def.blood, drops: [] }); this.head = head; this.idx = idx; this.flying = true; this.isSegment = true; this.angle = 0; this.type = head.type + '_seg'; this.own = !!head.o.segHp; }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.own) { const r = super.hit(dmg, fromX, 0, game, swingId, crit); if (this.head.onSegHit) this.head.onSegHit(this, game); return r; } return this.head.hit(dmg, fromX, 0, game, swingId, crit); }
  update(world, game) { this.t++; if (this.head.dead) { this.dead = true; return; } this.hitFlash = this.head.hitFlash; if (this.own) { this.tickDebuffs(game); if (this.dead) return; } this.touchPlayer(game.player, game); }
  die(game) { if (!this.own) { this.dead = true; return; } this.dead = true; Audio_.play('kill'); for (let i = 0; i < 6; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-3, 3), rand(-4, 1), this.def.blood, 40, 3)); if (this.head.onSegDeath) this.head.onSegDeath(this, game); }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY), r = this.w / 2, tail = this.idx === this.head.segments.length; ctx.save(); ctx.translate(x, y); ctx.rotate(this.angle); ctx.globalAlpha = this.head.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = this.head.o.body || this.head.head.col; ctx.beginPath(); ctx.ellipse(0, 0, tail ? r + 2 : r, r - 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-r * 0.6, -r * 0.7, r * 1.2, 2); if (this.head.o.armored) { ctx.fillStyle = '#404048'; ctx.fillRect(-r * 0.7, -2, r * 1.4, 4); if (this.head.o.probes && !this.probeGone) { ctx.fillStyle = '#ff2020'; ctx.fillRect(-2, -2, 4, 4); } } if (tail) { ctx.fillStyle = this.head.o.body || this.head.head.col; ctx.beginPath(); ctx.moveTo(-r, -r * 0.5); ctx.lineTo(-r * 2, 0); ctx.lineTo(-r, r * 0.5); ctx.fill(); } ctx.restore(); ctx.globalAlpha = 1; }
}
ENEMY_DEFS.devourer.cls = class extends Worm { constructor(x, y, def) { super(x, y, { name: 'Devourer', hp: def.hp, damage: def.damage, defense: def.defense, segments: 8, speed: 4, type: 'devourer', head: '#5a3a8a', body: '#4a2a7a', blood: '#7050a0', drops: def.drops, size: 22 }); this.needSegs = true; } update(world, game) { if (this.needSegs) { this.needSegs = false; this.spawnSegments(game); } super.update(world, game); } };

// Summoning -------------------------------------------------------------------------------------
const Bosses = {
  summon(game, id, opts = {}) {
    const d = BOSS_DEFS[id]; if (!d || game.boss) return null;
    const p = game.player;
    const x = opts.x != null ? opts.x : p.cx + (Math.random() < 0.5 ? -1 : 1) * (d.spawnDist || 450), y = opts.y != null ? opts.y : p.y - (d.spawnUp == null ? 220 : d.spawnUp);
    const b = d.create ? d.create(game, x, y) : new d.cls(x, y);
    const m = (game.expert ? (d.expertMult || 2) : 1) * (game.master ? 1.5 : 1) * Calamity.enemyMult(game);
    b.maxHp = b.hp = Math.round(b.hp * m); b.damage = Math.round(b.damage * (game.expert ? 1.5 : 1) * (game.master ? 1.25 : 1));
    game.enemies.push(b); if (b.spawnSegments) b.spawnSegments(game); if (b.setup) b.setup(game);
    game.boss = b; BossLog.start(game, b);
    game.message(d.arrive || `${d.name} has awoken!`, '#c040c0'); Audio_.play('zombie'); FX.shake(4, 20);
    return b;
  },
  // summon items are consumables handled through onUse
  summonItem(id, bossId, o = {}) {
    defItem(id, { name: o.name, max: 20, consumable: true, rarity: o.rarity || 1, tooltip: o.tooltip, drawIcon: o.icon, onUse: (g, slot) => {
      if (g.boss) { g.message('A boss is already here!', '#ff8080'); return; }
      if (o.night && g.world.isDay()) { g.message('This only works at night...', '#ff8080'); return; }
      if (o.where && !o.where(g)) { g.message(o.whereMsg || "This doesn't work here...", '#ff8080'); return; }
      if (o.hardmode && !g.world.hardmode) { g.message('The mechanical parts refuse to move... (Hardmode only)', '#ff8080'); return; }
      if (Bosses.summon(g, bossId)) g.consumeSlot(slot); // a gated boss (see vanilla_core) keeps the item
    } });
    ITEM_VALUES[id] = o.value || 10000; ITEMS[id].value = ITEM_VALUES[id]; if (o.recipe) RECIPES.push({ result: id, count: 1, station: o.station || 'anvil', ing: o.recipe });
  },
};
const inBiome = (b) => (g) => g.world.biome[clamp(g.player.tileX, 0, g.world.w - 1)] === b;
const summonIcon = (col, col2) => (x) => { x.fillStyle = col; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = col2 || '#fff'; x.fillRect(6, 5, 2, 2); x.fillRect(9, 8, 3, 3); };

// Eater of Worlds --------------------------------------------------------------------------------
defBoss('eater_of_worlds', { name: 'Eater of Worlds', order: 2.2, hp: 6000, damage: 22, defense: 4, blood: '#7050a0', flying: true, expertMult: 1.6, coins: 15000,
  summon: 'worm_food', spawn: 'Use Worm Food (30 Vile Powder... here: 15 Rotten Chunks + 30 Vile Mushrooms at a Demon Altar, or any Work Bench) in the Corruption, or smash three Shadow Orbs.',
  info: 'A colossal worm that burrows through the corruption and lunges at you. Only found in the Corruption. In Expert Mode its segments spit vile spit. Drops Shadow Scales and Demonite Ore.',
  loot: ['shadow_scale', 'demonite_ore', 'eater_of_worlds_trophy'], collectibles: ['eater_of_worlds_trophy', 'eater_of_worlds_mask'], despawn: 'The Eater of Worlds burrows away...',
  drops: [{ id: 'shadow_scale', min: 20, max: 30 }, { id: 'demonite_ore', min: 30, max: 60 }, { id: 'lesser_healing', min: 5, max: 10 }], expertItem: 'worm_scarf',
  create: (g, x, y) => new Worm(x, g.player.cy + 300, { name: 'Eater of Worlds', hp: 6000, damage: 22, defense: 4, segments: 40, speed: 6, type: 'eater_of_worlds', boss: true, head: '#5a3a8a', body: '#4a2a7a', blood: '#7050a0', size: 30, shoot: g.expert ? 45 : 0, bullet: '#80ff40' }) });
Bosses.summonItem('worm_food', 'eater_of_worlds', { name: 'Worm Food', tooltip: 'Summons the Eater of Worlds (Corruption only)', icon: summonIcon('#7050a0', '#c0a0ff'), where: inBiome(BIOME.CORRUPTION), whereMsg: 'The Eater of Worlds only answers in the Corruption.', recipe: [['rotten_chunk', 15], ['vile_mushroom', 30]], station: 'workbench' });
// Brain of Cthulhu ---------------------------------------------------------------------------------
class BrainOfCthulhu extends BossBase {
  constructor(x, y) { super(x, y, 90, 80, 'brain_of_cthulhu'); this.noContactP1 = true; this.tpTimer = 120; this.alpha = 1; this.creepersLeft = 0; }
  setup(game) { for (let i = 0; i < 20; i++) { const c = new BossPart(this, 22, 22, { name: 'Creeper', hp: 100, damage: 25, defense: 8, type: 'creeper', ai: (c, w, p, g) => { const a = c.t * 0.03 + c.k; const tx = c.parent.cx + Math.cos(a) * 130, ty = c.parent.cy + Math.sin(a) * 90; if (c.t % 240 < 60) { const dx = p.cx - c.cx, dy = p.cy - c.cy, d = Math.hypot(dx, dy) || 1; c.x += dx / d * 4; c.y += dy / d * 4; } else { c.x = lerp(c.x, tx - c.w / 2, 0.05); c.y = lerp(c.y, ty - c.h / 2, 0.05); } }, draw: (c, ctx, camX, camY) => { const x = snap(c.cx - camX), y = snap(c.cy - camY); ctx.globalAlpha = c.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + 3, y - 2, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(x + 3, y - 3, 3, 3); ctx.globalAlpha = 1; } }); c.k = i * Math.PI * 2 / 20; game.enemies.push(c); } this.creepersLeft = 20; }
  onPartDeath(part, game) { this.creepersLeft--; if (Math.random() < 0.3) game.dropItem(part.cx, part.cy, 'tissue_sample', 1); if (Math.random() < 0.3) game.dropItem(part.cx, part.cy, 'crimtane_ore', randInt(1, 3)); if (this.creepersLeft <= 0 && this.state !== 'p2') { this.setState('p2'); game.message('The Brain of Cthulhu is exposed!', '#c040c0'); } }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.state !== 'p2') { if (swingId == null || !this.hitBy.has(swingId)) { game.addDamageText(this.cx, this.y, 'Immune', '#aaa'); if (swingId != null) this.hitBy.add(swingId); } return false; } return super.hit(dmg, fromX, 0, game, swingId, crit); }
  ai(world, p, game) {
    if (this.state === 'start') this.setState('p1');
    if (--this.tpTimer <= 0) { this.tpTimer = this.state === 'p2' ? randInt(50, 90) : randInt(120, 180); const a = rand(0, Math.PI * 2); this.x = p.cx + Math.cos(a) * 260 - this.w / 2; this.y = p.cy + Math.sin(a) * 200 - this.h / 2; this.alpha = 0; FX.burst(game, this.cx, this.cy, 12, '#c03040', 4, 25); if (this.state === 'p2') { this.chargeAt(p, 9); } }
    this.alpha = Math.min(1, this.alpha + 0.05);
    if (this.state === 'p2') { this.vx *= 0.97; this.vy *= 0.97; this.x += this.vx; this.y += this.vy; this.noContact = false; this.expertIllusions = game.expert; } else { this.hoverTo(p.cx, p.cy - 150, 1.5, 0.03); this.noContact = true; }
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY); const drawBrain = (bx, by, a) => { ctx.globalAlpha = a * (this.hitFlash > 0 ? 0.6 : 1); ctx.fillStyle = '#d04050'; ctx.beginPath(); ctx.ellipse(bx, by, 44, 36, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#a02030'; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(bx - 30 + k * 18, by - 24); ctx.quadraticCurveTo(bx - 20 + k * 18, by, bx - 34 + k * 18, by + 24); ctx.stroke(); } if (this.state === 'p2') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(bx, by + 4, 16, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(bx - 4, by, 8, 8); } ctx.globalAlpha = 1; }; if (this.expertIllusions) for (let k = 1; k <= 2; k++) drawBrain(x + Math.cos(this.t * 0.04 + k * 2) * 120, y + Math.sin(this.t * 0.05 + k) * 80, 0.35); drawBrain(x, y, this.alpha); }
}
defBoss('brain_of_cthulhu', { name: 'Brain of Cthulhu', order: 2.3, hp: 1250, damage: 30, defense: 14, blood: '#c03040', cls: BrainOfCthulhu, expertMult: 1.5, coins: 15000, spawnDist: 260,
  summon: 'bloody_spine', spawn: 'Use a Bloody Spine (15 Vertebrae at a Work Bench) in the Crimson, or smash three Crimson Hearts.',
  info: 'Phase one: the Brain is immune and teleports around you while its 20 Creepers orbit and lunge. Kill every Creeper to expose it. Phase two: it teleports next to you and charges; in Expert Mode it projects illusions. Drops Tissue Samples and Crimtane.',
  loot: ['tissue_sample', 'crimtane_ore'], collectibles: ['brain_trophy', 'brain_mask'], despawn: 'The Brain of Cthulhu fades away...',
  drops: [{ id: 'tissue_sample', min: 15, max: 25 }, { id: 'crimtane_ore', min: 30, max: 60 }, { id: 'lesser_healing', min: 5, max: 10 }], expertItem: 'brain_of_confusion' });
Bosses.summonItem('bloody_spine', 'brain_of_cthulhu', { name: 'Bloody Spine', tooltip: 'Summons the Brain of Cthulhu (Crimson only)', icon: summonIcon('#c03040', '#ffb0b0'), where: inBiome(BIOME.CRIMSON), whereMsg: 'The Brain only answers in the Crimson.', recipe: [['vertebra', 15]], station: 'workbench' });
// Queen Bee ------------------------------------------------------------------------------------------
class QueenBee extends BossBase {
  constructor(x, y) { super(x, y, 60, 44, 'queen_bee'); this.setState('hover'); }
  ai(world, p, game) {
    const low = this.hp < this.maxHp * 0.4;
    switch (this.state) {
      case 'start': case 'hover': this.hoverTo(p.cx + (this.cx < p.cx ? -1 : 1) * 180, p.y - 120, 4); if (this.st > 120) this.setState(Math.random() < 0.4 ? 'charge' : Math.random() < 0.5 ? 'bees' : 'stingers'); break;
      case 'charge': { if (this.st === 1) { this.dir = p.cx > this.cx ? 1 : -1; this.y = lerp(this.y, p.cy - this.h / 2, 0.3); this.vx = this.dir * (low ? 14 : 11); this.vy = 0; this.charges = (this.charges || 0) + 1; Audio_.play('swing'); } this.glide(); if (Math.abs(this.cx - p.cx) > 400 && Math.sign(this.cx - p.cx) === this.dir) { if (this.charges >= 4) { this.charges = 0; this.setState('hover'); } else this.setState('charge'); } break; }
      case 'bees': this.hoverTo(p.cx, p.y - 160, 3); if (this.st % 40 === 0 && this.st <= 160) { const b = this.spawnMinion(game, 'bee', this.cx, this.cy); } if (this.st > 200) this.setState('hover'); break;
      case 'stingers': this.hoverTo(p.cx + (this.cx < p.cx ? -1 : 1) * 150, p.y - 100, 3); if (this.st % (low ? 8 : 14) === 0 && this.st < 100) { const b = this.shoot(game, p, { speed: 7, color: '#e0c040', name: 'stinger', size: 4, life: 120 }); b.ghost = false; } if (this.st > 130) this.setState('hover'); break;
    }
    this.dir = this.state === 'charge' ? this.dir : (p.cx < this.cx ? -1 : 1);
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY), f = Math.sin(this.t * 0.8) * 6; ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = 'rgba(220,240,255,0.7)'; ctx.beginPath(); ctx.ellipse(-4, -22 - f, 18, 7, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-14, -18 + f, 16, 6, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e0c040'; ctx.beginPath(); ctx.ellipse(-6, 0, 30, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#403010'; for (let k = 0; k < 3; k++) ctx.fillRect(-26 + k * 12, -14, 5, 28); ctx.fillStyle = '#e0c040'; ctx.beginPath(); ctx.arc(24, -4, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(26, -9, 6, 6); ctx.fillStyle = '#403010'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-48, 4); ctx.lineTo(-34, 6); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
ENEMY_DEFS.bee = { name: 'Bee', cls: Flyer, hp: 13, damage: 13, defense: 2, kind: 'bat', w: 14, h: 12, color: '#e0c040', blood: '#e0c040', speed: 4, erratic: true, drops: [] };
defBoss('queen_bee', { name: 'Queen Bee', order: 2.5, hp: 3400, damage: 30, defense: 8, blood: '#e0c040', cls: QueenBee, expertMult: 1.4, coins: 20000, leash: 200, teleportWhenFar: true,
  summon: 'abeemination', spawn: 'Use an Abeemination (5 Honey Blocks + 1 Stinger + 5 Hive + 1 Bottle at a Work Bench) in the jungle, or break a Larva inside a Bee Hive in the Underground Jungle.',
  info: 'Alternates between horizontal charges (four in a row), hovering while spawning Bees, and firing volleys of stingers. Charges faster below 40% life.',
  loot: ['bee_keeper', 'bees_knees', 'beenade', 'honey_comb', 'hive_wand', 'bee_wax'], collectibles: ['queen_bee_trophy', 'queen_bee_mask'], despawn: 'The Queen Bee flies off...',
  drops: [{ id: 'bee_wax', min: 16, max: 26 }, { id: 'beenade', min: 10, max: 30 }, { id: 'honey_comb', chance: 0.33 }, { id: 'lesser_healing', min: 5, max: 10 }], oneOf: ['bee_keeper', 'bees_knees', 'bee_gun', 'hive_wand'], expertItem: 'hive_pack' });
Bosses.summonItem('abeemination', 'queen_bee', { name: 'Abeemination', tooltip: 'Summons the Queen Bee (jungle only)', icon: summonIcon('#e0c040', '#403010'), where: inBiome(BIOME.JUNGLE), whereMsg: 'The Queen Bee only answers in the jungle.', recipe: [['honey_block', 5], ['stinger', 1], ['hive', 5], ['bottle', 1]], station: 'workbench' });
// Deerclops ----------------------------------------------------------------------------------------------
class Deerclops extends BossBase {
  constructor(x, y) { super(x, y, 60, 90, 'deerclops'); this.flying = false; this.canStep = true; this.setState('walk'); }
  ai(world, p, game) {
    this.updateLiquidState(world);
    const d = dist(this.cx, this.cy, p.cx, p.cy);
    this.immune = d > 60 * TILE; if (this.immune && this.t % 60 === 0) game.addDamageText(this.cx, this.y - 10, 'too far - immune', '#aaa');
    switch (this.state) {
      case 'start': case 'walk': { this.dir = p.cx > this.cx ? 1 : -1; this.vx = lerp(this.vx, this.dir * 2.2, 0.1); if (this.onGround && Math.abs(p.cx - this.cx) < 160 && this.st > 60) this.setState(choose(['spikes', 'hands', 'roar'])); if (this.st > 240 && d > 300) this.setState('spikes'); break; }
      case 'spikes': { this.vx *= 0.8; if (this.st === 10) { for (let k = 1; k <= 8; k++) { const sx = this.cx + this.dir * k * 36; let sy = Math.floor(this.y / TILE) + 5; while (sy < world.h - 2 && !world.isSolidAt(Math.floor(sx / TILE), sy)) sy++; FX.telegraph(sx, sy * TILE - 40, sx, sy * TILE, '#a0e0ff', 20 + k * 5, 6); this.pend = this.pend || []; this.pend.push({ x: sx, y: sy * TILE, t: 20 + k * 5 }); } Audio_.play('dig_stone'); } if (this.pend) for (const s of this.pend) if (--s.t === 0) { FX.burst(game, s.x, s.y - 10, 10, '#a0e0ff', 4, 25); if (Math.abs(p.cx - s.x) < 24 && Math.abs(p.y + p.h - s.y) < 48) p.damage(Math.round(this.damage * 0.8), s.x, game, 'enemy', false, "Deerclops' ice spikes", this); } if (this.st > 80) { this.pend = null; this.setState('walk'); } break; }
      case 'hands': { this.vx *= 0.8; if (this.st % 20 === 0 && this.st <= 100) { const hx = p.cx + rand(-60, 60); let hy = Math.floor(p.y / TILE) + 3; while (hy < world.h - 2 && !world.isSolidAt(Math.floor(hx / TILE), hy)) hy++; const b = Gensokyo.bullet(game, hx, hy * TILE, 0, -6, { owner: this, color: '#302040', hi: '#8060a0', damage: Math.round(this.damage * 0.7), sourceName: "Deerclops' shadow hand", size: 7, life: 40 }); } if (this.st > 130) this.setState('walk'); break; }
      case 'roar': { this.vx = 0; if (this.st === 15) { FX.shake(8, 30); Audio_.play('zombie'); if (d < 20 * TILE) { p.addBuff('Slow', 60 * 4); p.damage(Math.round(this.damage * 0.5), this.cx, game, 'enemy', false, "Deerclops' roar", this); } } if (this.st > 60) this.setState('walk'); break; }
    }
    this.applyGravity(); this.moveAndCollide(world);
    if (this.collidedX && this.onGround) this.vy = -9;
    if (this.onGround && this.jumpCd-- <= 0 && p.y + p.h < this.y - 40) { this.vy = -12; this.jumpCd = 90; }
  }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.immune) return false; return super.hit(dmg, fromX, 0, game, swingId, crit); }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.y - camY); ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#3a3040'; ctx.fillRect(-26, 20, 52, 50); ctx.fillRect(-20, 70, 12, 20); ctx.fillRect(8, 70, 12, 20); ctx.fillStyle = '#4a4050'; ctx.fillRect(-18, 0, 40, 30); ctx.fillStyle = '#e8d8c0'; ctx.fillRect(-22, -22, 6, 26); ctx.fillRect(-30, -14, 14, 5); ctx.fillRect(18, -22, 6, 26); ctx.fillRect(18, -14, 14, 5); ctx.fillStyle = '#ffe060'; ctx.beginPath(); ctx.arc(6, 12, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(8, 12, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e8d8c0'; for (let k = 0; k < 3; k++) ctx.fillRect(-10 + k * 8, 26, 4, 6); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('deerclops', { name: 'Deerclops', order: 2.6, hp: 7000, damage: 30, defense: 10, blood: '#3a3040', cls: Deerclops, flying: false, expertMult: 1.3, coins: 25000, spawnUp: 60, spawnDist: 500,
  summon: 'deer_thing', spawn: 'Use a Deer Thing (3 Flinx Fur... here: 5 Ice Blocks + 3 Lenses + 1 Demonite/Crimtane Ore at a Work Bench) in the Snow biome.',
  info: 'A one-eyed giant that walks after you. Attacks: rows of ice spikes erupting from the ground (telegraphed), shadow hands rising under you, and a roar that slows you. It becomes immune if you run too far away.',
  loot: ['lucy_the_axe', 'pew_matic_horn', 'weather_pain', 'houndius_shootius', 'chester'], collectibles: ['deerclops_trophy', 'deerclops_mask'], despawn: 'Deerclops wanders off...',
  drops: [{ id: 'lesser_healing', min: 5, max: 10 }], oneOf: ['lucy_the_axe', 'pew_matic_horn', 'weather_pain', 'houndius_shootius'], expertItem: 'bone_helm' });
Bosses.summonItem('deer_thing', 'deerclops', { name: 'Deer Thing', tooltip: 'Summons Deerclops (Snow biome only)', icon: summonIcon('#3a3040', '#e8d8c0'), where: inBiome(BIOME.SNOW), whereMsg: 'Deerclops only answers in the snow.', recipe: [['ice', 5], ['lens', 3], ['gel', 5]], station: 'workbench' });
// Skeletron --------------------------------------------------------------------------------------------------
class Skeletron extends BossBase {
  constructor(x, y) { super(x, y, 70, 70, 'skeletron'); this.setState('hover'); this.spin = 0; }
  setup(game) { for (const side of [-1, 1]) { const hand = new BossPart(this, 40, 40, { name: "Skeletron's Hand", hp: 600, damage: 20, defense: 14, type: 'skeletron_hand', ai: (h, w, p, g) => { const par = h.parent; h.side = side; if (par.spin > 0) { const a = par.t * 0.15 + (side > 0 ? 0 : Math.PI); h.x = lerp(h.x, par.cx + Math.cos(a) * 110 - h.w / 2, 0.2); h.y = lerp(h.y, par.cy + Math.sin(a) * 60 - h.h / 2, 0.2); return; } const cycle = (h.t + (side > 0 ? 0 : 90)) % 180; if (cycle < 120) { h.x = lerp(h.x, par.cx + side * 100 - h.w / 2 + Math.sin(h.t * 0.05) * 10, 0.08); h.y = lerp(h.y, par.cy + 30 - h.h / 2, 0.08); } else { if (cycle === 120) { const dx = p.cx - h.cx, dy = p.cy - h.cy, d = Math.hypot(dx, dy) || 1; h.vx = dx / d * 11; h.vy = dy / d * 11; } h.x += h.vx; h.y += h.vy; h.vx *= 0.96; h.vy *= 0.96; } if (h.x < p.x + p.w && h.x + h.w > p.x && h.y < p.y + p.h && h.y + h.h > p.y && !p.dead) p.addBuff('Slow', 60 * 2); }, draw: (h, ctx, camX, camY) => { const x = snap(h.cx - camX), y = snap(h.cy - camY); ctx.globalAlpha = h.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#e8e8e0'; ctx.fillRect(x - 12, y - 14, 24, 24); for (let k = 0; k < 4; k++) ctx.fillRect(x - 14 + k * 8, y - 24, 5, 12); ctx.strokeStyle = '#c0c0b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(h.parent.cx - camX + h.side * 40, h.parent.cy - camY + 20); ctx.stroke(); ctx.globalAlpha = 1; } }); game.enemies.push(hand); } }
  ai(world, p, game) {
    const night = !world.isDay(); this.guardian = !night; // Skeletron fought in daylight is a Dungeon Guardian: massive defense
    this.defense = this.guardian ? 9999 : (this.spin > 0 ? 40 : this.bdef.defense);
    if (this.spin > 0) { this.spin--; this.chargeAt(p, 5); this.glide(); if (this.t % 6 === 0) game.particles.push(new Particle(this.cx + rand(-30, 30), this.cy + rand(-30, 30), 0, -1, '#c0c0ff', 20, 2)); if (this.spin === 0) this.setState('hover'); return; }
    this.hoverTo(p.cx, p.y - 170, 3.5, 0.05);
    if (this.st > 420) { this.spin = 150; this.setState('spin'); Audio_.play('zombie'); }
    if (this.hp < this.maxHp * 0.5 && this.t % 90 === 0) { const b = this.shoot(game, p, { speed: 6, color: '#c0c0ff', name: 'skull', size: 6, life: 150, homing: 0.15 }); b.ghost = true; }
    this.damage = this.guardian ? 1000 : this.bdef.damage * (this.spin > 0 ? 2 : 1);
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY); ctx.save(); ctx.translate(x, y); if (this.spin > 0) ctx.rotate(this.t * 0.3); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = this.guardian ? '#c0c0d0' : '#e8e8e0'; ctx.fillRect(-30, -34, 60, 52); ctx.fillRect(-22, 18, 44, 14); ctx.fillStyle = '#101018'; ctx.fillRect(-22, -20, 16, 16); ctx.fillRect(6, -20, 16, 16); ctx.fillStyle = this.guardian ? '#ff2020' : '#c04040'; ctx.fillRect(-18, -16, 8, 8); ctx.fillRect(10, -16, 8, 8); ctx.fillStyle = '#101018'; for (let k = 0; k < 5; k++) ctx.fillRect(-20 + k * 9, 20, 4, 10); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('skeletron', { name: 'Skeletron', order: 2.8, hp: 4400, damage: 32, defense: 10, blood: '#e8e8e0', cls: Skeletron, expertMult: 1.5, coins: 30000, spawnDist: 300,
  summon: 'clothier_voodoo_doll', spawn: 'Talk to the Old Man at the Dungeon entrance at night and ask him to lift his curse, or use a Clothier Voodoo Doll at night. Fighting him in daylight is suicide: he becomes the Dungeon Guardian.',
  info: 'A giant skull with two hands. The hands drift beside him then slash at you (inflicting Slow); every few seconds the head spins toward you with doubled damage and a big defense boost. Below half life he spits homing skulls. After dawn he gains 9999 defense and 1000 damage.',
  loot: ['skeletron_hand', 'book_of_skulls', 'bone_key', 'lesser_healing'], collectibles: ['skeletron_trophy', 'skeletron_mask'], despawn: 'Skeletron sinks back into the dungeon...',
  drops: [{ id: 'lesser_healing', min: 5, max: 15 }, { id: 'bone', min: 20, max: 40 }], oneOf: ['skeletron_hand', 'book_of_skulls', 'bone_key'], expertItem: 'bone_glove',
  onDeath: (g) => { g.world.skeletronDefeated = true; g.message('The Clothier is free of his curse and will move in. The Dungeon is safe to explore.', '#50ff50'); } });
Bosses.summonItem('clothier_voodoo_doll', 'skeletron', { name: 'Clothier Voodoo Doll', tooltip: "Summons Skeletron at night. The Clothier's cursed effigy", icon: summonIcon('#a04040', '#f2c6a0'), night: true, value: 20000 });
// Wall of Flesh -------------------------------------------------------------------------------------------
class WallOfFlesh extends BossBase {
  constructor(x, y) { super(x, y, 80, 400, 'wall_of_flesh'); this.noContact = false; this.dir = 1; this.eyes = []; }
  setup(game) {
    const w = game.world, p = game.player; this.dir = p.cx > w.w * TILE / 2 ? -1 : 1; this.x = p.cx - this.dir * 500; this.y = (w.h - 70) * TILE - 40;
    for (const oy of [-120, 120]) { const eye = new BossPart(this, 40, 40, { name: 'Wall of Flesh Eye', damage: 40, type: 'wof_eye', ai: (e, ww, pp, g) => { e.x = e.parent.x + (e.parent.dir > 0 ? e.parent.w - 30 : -10); e.y = e.parent.cy + oy - e.h / 2; if (e.t % 90 === (oy < 0 ? 0 : 45)) { const b = Gensokyo.bullet(g, e.cx, e.cy, 0, 0, { owner: e.parent, color: '#ff40ff', hi: '#fff', damage: Math.round(e.parent.damage * 0.8), sourceName: "the Wall of Flesh's laser", size: 4, life: 90 }); const dx = pp.cx - e.cx, dy = pp.cy - e.cy, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * 9; b.vy = dy / d * 9; b.trail = { color: '#ff40ff', len: 8, width: 3 }; } }, draw: (e, ctx, camX, camY) => { const x = snap(e.cx - camX), y = snap(e.cy - camY); ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.ellipse(x, y, 18, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(x + e.parent.dir * 5, y, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(x + e.parent.dir * 5 - 2, y - 2, 4, 4); } }); game.enemies.push(eye); this.eyes.push(eye); }
    for (let k = 0; k < 6; k++) { const h = new BossPart(this, 22, 22, { name: 'The Hungry', hp: 120, damage: 30, defense: 6, type: 'hungry', ai: (e, ww, pp, g) => { const base = e.parent; const a = e.t * 0.04 + e.k; const tx = base.cx + base.dir * (60 + Math.sin(a) * 50), ty = base.cy + Math.cos(a * 0.7) * 150; if (e.t % 200 < 50 && dist(pp.cx, pp.cy, e.cx, e.cy) < 300) { const dx = pp.cx - e.cx, dy = pp.cy - e.cy, d = Math.hypot(dx, dy) || 1; e.x += dx / d * 5; e.y += dy / d * 5; } else { e.x = lerp(e.x, tx - e.w / 2, 0.06); e.y = lerp(e.y, ty - e.h / 2, 0.06); } }, draw: (e, ctx, camX, camY) => { const x = snap(e.cx - camX), y = snap(e.cy - camY); ctx.globalAlpha = e.hitFlash > 0 ? 0.6 : 1; ctx.strokeStyle = '#a02030'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(e.parent.cx - camX + e.parent.dir * 20, e.cy - camY); ctx.stroke(); ctx.fillStyle = '#d04050'; ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#301010'; ctx.fillRect(x - 6, y - 2, 12, 5); ctx.fillStyle = '#fff'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 5 + i * 3, y - 2, 2, 2); ctx.globalAlpha = 1; } }); h.k = k; game.enemies.push(h); }
    game.message('The Wall of Flesh has awoken! Run!', '#c040c0');
  }
  ai(world, p, game) {
    const w = game.world; this.y = (w.h - 70) * TILE - 40; const spd = 1.4 + (1 - this.hp / this.maxHp) * 2.4 + (game.expert ? 0.6 : 0);
    this.x += this.dir * spd;
    // horrified: you can't escape behind it
    const behind = this.dir > 0 ? p.cx < this.x - 40 : p.cx > this.x + this.w + 40;
    if (behind) { p.damage(9999, this.cx, game, 'enemy', true, 'the Wall of Flesh (horrified)', this); }
    p.addBuff('Horrified', 120);
    if (this.t % 240 === 0) { const l = this.spawnMinion(game, 'leech', this.cx, this.cy + rand(-120, 120)); }
    if (this.t % 30 === 0) game.lighting.extraLights.push({ x: this.cx / TILE, y: this.cy / TILE, r: 0.9, g: 0.3, b: 0.3 });
    if ((this.dir > 0 && this.x > (w.w - 5) * TILE) || (this.dir < 0 && this.x < 5 * TILE)) { game.message('The Wall of Flesh reached the end of the world...', '#c0c0ff'); this.despawn(game); }
  }
  touchPlayer(p, game) { if (p.dead) return; if (p.x < this.x + this.w && p.x + p.w > this.x && p.y < this.y + this.h && p.y + p.h > this.y) p.damage(this.damage, this.cx, game, 'enemy', false, 'the Wall of Flesh', this); }
  draw(ctx, camX, camY) { const x = snap(this.x - camX), y = snap(this.y - camY); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; const g = ctx.createLinearGradient(x, 0, x + this.w, 0); g.addColorStop(0, '#a02030'); g.addColorStop(1, '#d04050'); ctx.fillStyle = g; ctx.fillRect(x, y - 200, this.w, this.h + 400); ctx.fillStyle = '#801020'; for (let k = 0; k < 14; k++) ctx.fillRect(x + 10 + ((k * 37) % 50), y - 180 + k * 40, 12, 20); ctx.fillStyle = '#301010'; ctx.fillRect(x + (this.dir > 0 ? this.w - 24 : 0), y + this.h / 2 - 30, 24, 60); ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) ctx.fillRect(x + (this.dir > 0 ? this.w - 20 : 4), y + this.h / 2 - 26 + i * 11, 14, 4); ctx.globalAlpha = 1; }
}
ENEMY_DEFS.leech = { name: 'Leech', cls: Flyer, hp: 60, damage: 25, defense: 4, kind: 'bat', w: 20, h: 12, color: '#c03040', blood: '#c03040', speed: 4.5, drops: [] };
defBoss('wall_of_flesh', { name: 'Wall of Flesh', order: 3.5, hp: 8000, damage: 50, defense: 12, blood: '#d04050', cls: WallOfFlesh, expertMult: 1.4, coins: 80000, spawnUp: 0,
  summon: 'guide_voodoo_doll', spawn: 'Drop a Guide Voodoo Doll (from Voodoo Demons) into lava in the Underworld. The Guide dies... and the Wall rises.',
  info: 'A wall of flesh the height of the underworld that advances relentlessly; you cannot get behind it (Horrified). Its eyes fire lasers, The Hungry mouths lunge at you, and it spawns Leeches. Faster as it loses life. Defeating it starts Hardmode: the Hallow and the underground evil spread, altars can be smashed for new ores.',
  loot: ['pwnhammer', 'breaker_blade', 'clockwork_assault_rifle', 'laser_rifle', 'warrior_emblem', 'ranger_emblem', 'sorcerer_emblem', 'summoner_emblem'], collectibles: ['wall_of_flesh_trophy', 'wall_of_flesh_mask'], despawn: 'The Wall of Flesh has disappeared...',
  drops: [{ id: 'pwnhammer' }, { id: 'lesser_healing', min: 5, max: 15 }], oneOf: ['breaker_blade', 'clockwork_assault_rifle', 'laser_rifle', 'warrior_emblem', 'ranger_emblem', 'sorcerer_emblem', 'summoner_emblem'], expertItem: 'demon_heart',
  onDeath: (g, b) => { g.dropItem(b.cx, b.cy, choose(['warrior_emblem', 'ranger_emblem', 'sorcerer_emblem', 'summoner_emblem']), 1, null, null); BiomeSys.startHardmode(g); } });
