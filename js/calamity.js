// ---------------------------------------------------------------------------
// Calamity Mod slice: Revengeance & Death difficulty modes (above Expert,
// combinable with Master), the Rage and Adrenaline meters, the Desert Scourge
// worm boss (Desert Medallion), Wulfrum enemies + the Wulfrum armor set with
// its shield set bonus, Sea Prism / Victide gear and extra vanilla recipes.
// ---------------------------------------------------------------------------
'use strict';

function defCalItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
// materials & summons
defCalItem('wulfrum_scrap', 'Wulfrum Metal Scrap', { max: 999, material: true, rarity: 1, value: 200, tooltip: 'Scrap from Wulfrum machines. Used to craft Wulfrum gear', drawIcon: (x) => { x.fillStyle = '#7aa070'; x.fillRect(2, 5, 12, 7); x.fillStyle = '#a8d090'; x.fillRect(2, 5, 12, 1); x.fillStyle = '#3a5a3a'; x.fillRect(5, 8, 2, 2); x.fillRect(10, 8, 2, 2); } });
defCalItem('desert_medallion', 'Desert Medallion', { max: 20, consumable: true, rarity: 1, value: 5000, tooltip: 'Summons the Desert Scourge when used in the desert', drawIcon: (x) => { x.fillStyle = '#e0c060'; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#a07030'; x.beginPath(); x.arc(8, 8, 3.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff0a0'; x.fillRect(6, 4, 2, 2); } });
RECIPES.push({ result: 'desert_medallion', count: 1, station: 'workbench', ing: [['cactus', 15], ['sand', 10], ['lens', 3]] });
defCalItem('sea_prism', 'Sea Prism', { max: 999, material: true, rarity: 1, value: 500, tooltip: 'A prismatic shard from the Desert Scourge', drawIcon: (x) => { x.fillStyle = '#60d0e0'; x.beginPath(); x.moveTo(8, 1); x.lineTo(14, 8); x.lineTo(8, 15); x.lineTo(2, 8); x.closePath(); x.fill(); x.fillStyle = '#c0f8ff'; x.fillRect(7, 4, 2, 4); } });
defCalItem('pearl_shard', 'Pearl Shard', { max: 999, material: true, rarity: 1, value: 300, tooltip: 'Dropped by the Desert Scourge', drawIcon: (x) => { x.fillStyle = '#f0e8f8'; x.beginPath(); x.arc(8, 8, 5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.fillRect(6, 5, 2, 2); } });
// Wulfrum armor (set bonus: Wulfrum Shield)
for (const [id, name, slot, def, n] of [['wulfrum_helmet', 'Wulfrum Helmet', 'head', 2, 7], ['wulfrum_armor', 'Wulfrum Armor', 'body', 3, 12], ['wulfrum_leggings', 'Wulfrum Leggings', 'legs', 2, 10]]) {
  defCalItem(id, name, { max: 1, armor: slot, defense: def, rarity: 1, value: 1500, wulfrum: true, tooltip: `${def} defense. Set bonus: a Wulfrum Shield absorbs 15 damage and recharges every 20 s`, icon: { kind: slot === 'head' ? 'helmet' : slot === 'body' ? 'chainmail' : 'greaves', mat: 'wulfrum' } });
  RECIPES.push({ result: id, count: 1, station: 'anvil', ing: [['wulfrum_scrap', n]] });
}
MATERIALS.wulfrum = { M: '#c8f0b0', m: '#7aa070', d: '#3a5a3a' };
// Victide (sea prism) weapons
defCalItem('aquatic_discharge', 'Aquatic Discharge', { max: 1, sword: 'broad', damage: 20, useTime: 18, knockback: 5, rarity: 2, value: 30000, icon: { kind: 'sword', mat: 'victide' }, tooltip: '20 melee damage. Swings fire a bolt of water', waterBolt: true });
defCalItem('scourge_of_the_desert', 'Scourge of the Desert', { max: 1, damage: 24, useTime: 22, knockback: 4, rarity: 2, value: 30000, tooltip: 'Throws a javelin that splits into sand shards on impact', drawIcon: (x) => { x.fillStyle = '#c8a860'; for (let i = 0; i < 12; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = '#e8d090'; x.fillRect(12, 1, 3, 3); }, use: (g, s, it) => Calamity.throwJavelin(g, s, it) });
MATERIALS.victide = { M: '#c0f8ff', m: '#60c0d0', d: '#2a6a80' };
defCalItem('victide_bar', 'Victide Bar', { max: 999, material: true, rarity: 1, value: 1000, tooltip: 'Forged from Sea Prisms and Pearl Shards', drawIcon: (x) => { x.fillStyle = '#60c0d0'; x.fillRect(2, 6, 12, 6); x.fillStyle = '#c0f8ff'; x.fillRect(2, 6, 12, 1); x.fillStyle = '#2a6a80'; x.fillRect(2, 11, 12, 1); } });
RECIPES.push({ result: 'victide_bar', count: 1, station: 'furnace', ing: [['sea_prism', 2], ['pearl_shard', 1]] });
RECIPES.push({ result: 'aquatic_discharge', count: 1, station: 'anvil', ing: [['victide_bar', 8]] });
RECIPES.push({ result: 'scourge_of_the_desert', count: 1, station: 'anvil', ing: [['victide_bar', 6], ['cactus', 10]] });
defCalItem('desert_scourge_trophy', 'Desert Scourge Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defCalItem('desert_scourge_mask', 'Desert Scourge Mask', { max: 1, rarity: 2, value: 7500, armor: 'head', defense: 2, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'victide' } });
// extra vanilla recipes (Calamity adds dozens)
RECIPES.push({ result: 'lens', count: 1, station: 'furnace', ing: [['glass', 2]] });
RECIPES.push({ result: 'cobweb', count: 5, station: 'workbench', ing: [['gel', 1]] });
RECIPES.push({ result: 'life_crystal', count: 1, station: 'anvil', ing: [['ruby', 3], ['gold_bar', 5]] });

// Revengeance: Rage & Adrenaline -----------------------------------------------------------
const Calamity = {
  // difficulty flags live on the world: world.revengeance, world.death
  rev(game) { return !!(game.world && game.world.revengeance); },
  death(game) { return !!(game.world && game.world.death); },
  enemyMult(game) { return game.world && game.world.death ? 1.5 : game.world && game.world.revengeance ? 1.25 : 1; },
  difficultyName(game) { const w = game.world || game; const m = w.master ? 'Master ' : ''; return w.death ? m + 'Death' : w.revengeance ? m + 'Revengeance' : w.master ? 'Master' : w.expert ? 'Expert' : 'Classic'; },
  state(game) { return ModLib.player(game, 'calamity', () => ({ rage: 0, adren: 0, rageActive: 0, adrenActive: 0, shield: 15, shieldCd: 0 })); },
  tick(game) {
    const p = game.player, w = game.world; if (!p || !w) return;
    const s = this.state(game);
    // Wulfrum shield set bonus
    const wulf = p.armor.every(a => a && ITEMS[a.id].wulfrum);
    if (wulf) { if (s.shieldCd > 0) { s.shieldCd--; if (s.shieldCd === 0) { s.shield = 15; game.addDamageText(p.cx, p.y - 10, 'Wulfrum Shield restored', '#a8d090'); } } } else { s.shield = 0; s.shieldCd = 0; }
    if (!this.rev(game)) { s.rage = s.adren = 0; return; }
    const near = game.enemies.some(e => !e.dead && dist(e.cx, e.cy, p.cx, p.cy) < 25 * TILE);
    if (s.rageActive > 0) { s.rageActive--; s.rage = 100 * s.rageActive / (9 * 60); }
    else if (near) s.rage = Math.min(100, s.rage + 100 / (28 * 60)); else s.rage = Math.max(0, s.rage - 100 / (10 * 60));
    if (s.adrenActive > 0) { s.adrenActive--; s.adren = 100 * s.adrenActive / (6 * 60); }
    else if (game.boss && !game.boss.dead) s.adren = Math.min(100, s.adren + 100 / (45 * 60));
    else s.adren = Math.max(0, s.adren - 100 / (5 * 60));
  },
  onHurt(p, amount, game) {
    const s = this.state(game); if (!this.rev(game)) return;
    if (s.rageActive <= 0) s.rage = Math.min(100, s.rage + 8);
    if (s.adrenActive <= 0) s.adren = 0;
  },
  useRage(game) { const s = this.state(game); if (!this.rev(game)) { game.message('Rage is only available in Revengeance Mode.', '#ff8080'); return; } if (s.rageActive > 0 || s.rage < 100) { game.message(s.rageActive > 0 ? 'Rage is already active!' : 'Rage is not full yet.', '#ff8080'); return; } s.rageActive = 9 * 60; game.message('RAGE! +50% damage for 9 seconds.', '#ff4040'); FX.flash('#ff2020', 20, 0.35); FX.shake(3, 12); Audio_.play('levelup'); },
  useAdrenaline(game) { const s = this.state(game); if (!this.rev(game)) { game.message('Adrenaline is only available in Revengeance Mode.', '#ff8080'); return; } if (s.adrenActive > 0 || s.adren < 100) { game.message(s.adrenActive > 0 ? 'Adrenaline is already active!' : 'Adrenaline is not full yet.', '#ff8080'); return; } s.adrenActive = 6 * 60; game.message('ADRENALINE! +200% damage, +20 defense for 6 seconds.', '#40ff80'); FX.flash('#40ff80', 20, 0.35); Audio_.play('levelup'); },
  mods(p, pm, game) {
    const s = this.state(game);
    if (s.rageActive > 0) pm.dmg *= 1.5;
    if (s.adrenActive > 0) { pm.dmg *= 3; pm.defAdd += 20; }
    if (this.death(game)) pm.modDr = (pm.modDr || 0) - 0.05; // Death: you take 5% more damage
  },
  // Wulfrum shield: absorbs damage before it lands
  absorb(p, amount, game) { const s = this.state(game); if (s.shield > 0 && s.shieldCd === 0) { const a = Math.min(s.shield, amount); s.shield -= a; if (s.shield <= 0) { s.shieldCd = 20 * 60; game.addDamageText(p.cx, p.y - 10, 'Shield broken', '#a8d090'); } return amount - a; } return amount; },
  draw(game) {
    const p = game.player, ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H; const s = this.state(game);
    if (!this.rev(game)) { if (s.shield > 0) drawText(ctx, `Wulfrum Shield ${s.shield}`, W - 22, 40 + Math.ceil(p.maxHp / 20 / 10) * 26 + 24, { size: 13, align: 'right', color: '#a8d090' }); return; }
    const x = W - 22 - 160, y = 40 + Math.ceil(p.maxHp / 20 / 10) * 26 + 20 + (UI.mapMode === 0 && !UI.fullMap && !(game.invOpen && W < 1400) ? 214 : 0);
    const bar = (yy, v, col, label, active) => { ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, x, yy, 160, 12, 4); ctx.fill(); ctx.fillStyle = col; roundRect(ctx, x, yy, 160 * v / 100, 12, 4); ctx.fill(); if (active) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; roundRect(ctx, x, yy, 160, 12, 4); ctx.stroke(); } drawText(ctx, label, x - 6, yy - 3, { size: 12, align: 'right', color: v >= 100 ? '#fff' : '#bbb' }); };
    bar(y, s.rage, s.rageActive > 0 ? '#ff6060' : '#c03030', `Rage (${ModKeys.labelFor('KeyR')})`, s.rageActive > 0);
    bar(y + 18, s.adren, s.adrenActive > 0 ? '#60ff90' : '#30a050', `Adrenaline (${ModKeys.labelFor('KeyV')})`, s.adrenActive > 0);
    if (s.shield > 0) drawText(ctx, `Wulfrum Shield ${s.shield}`, W - 22, y + 36, { size: 13, align: 'right', color: '#a8d090' });
  },
  throwJavelin(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
    const b = new Projectile(p.cx, p.y + 14, dx / d * 11, dy / d * 11, { kind: 'knife', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit });
    b.gravity = 0.06; b.life = 90; b.trail = { color: '#e8d090', len: 8, width: 3 }; b.splitOnHit = true;
    game.projectiles.push(b);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  },
  // sand shards from the javelin, water bolts from Aquatic Discharge
  onProjectileHit(game, b, e) {
    if (b.splitOnHit) { for (let i = 0; i < 4; i++) { const a = Math.random() * Math.PI * 2; const s = new Projectile(b.x + 3, b.y + 3, Math.cos(a) * 6, Math.sin(a) * 6, { kind: 'spark', damage: Math.round(b.damage * 0.4), friendly: true, owner: b.owner, knockback: 1, color: '#e8d090' }); s.life = 30; game.projectiles.push(s); } }
  },
  onSwing(game, it, st) {
    if (!it.waterBolt) return;
    const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1;
    const b = new Projectile(p.cx, p.y + 14, dx / d * 8, dy / d * 8, { kind: 'bolt', damage: Math.round(st.damage * 0.6 * p.pm.dmg), friendly: true, owner: p, knockback: 2, color: '#60c0ff', hi: '#e0f8ff' });
    b.trail = { color: '#80d0ff', len: 6, width: 4 }; game.projectiles.push(b);
  },
  // spawn table: Wulfrum machines roam the surface
  pickSpawn(game, type, ctx) { const r = Math.random(); if (!ctx.underground && !ctx.hell) { if (r < 0.1) return 'wulfrum_slime'; if (r < 0.15) return 'wulfrum_drone'; } return type; },
  summonDesertScourge(game) {
    const p = game.player;
    const b = new DesertScourge(p.cx + (Math.random() < 0.5 ? -500 : 500), p.y + 300);
    const m = (game.expert ? 1.6 : 1) * (game.master ? 1.5 : 1) * this.enemyMult(game);
    b.maxHp = b.hp = Math.round(b.hp * m); b.damage = Math.round(b.damage * (game.expert ? 1.5 : 1));
    game.enemies.push(b); b.spawnSegments(game); game.boss = b;
    BossLog.start(game, b);
    game.message('The Desert Scourge has awoken!', '#c040c0'); Audio_.play('zombie'); FX.shake(6, 30);
  },
};
ModKeys.bind('KeyR', 'Activate Rage (Revengeance)', (g) => Calamity.useRage(g));
ModKeys.bind('KeyV', 'Activate Adrenaline (Revengeance)', (g) => Calamity.useAdrenaline(g));
ModLib.onPlayerMods((p, pm, g) => Calamity.mods(p, pm, g));
ModLib.onPlayerHurt((p, amount, g) => Calamity.onHurt(p, amount, g));

// Wulfrum enemies --------------------------------------------------------------------------
class WulfrumSlime extends Slime {
  draw(ctx, camX, camY) { super.draw(ctx, camX, camY); const x = snap(this.cx - camX), y = snap(this.cy - camY); ctx.fillStyle = '#3a5a3a'; ctx.fillRect(x - 6, y - 2, 4, 4); ctx.fillRect(x + 2, y - 2, 4, 4); ctx.fillStyle = '#c8f0b0'; ctx.fillRect(x - 5, y - 1, 2, 2); ctx.fillRect(x + 3, y - 1, 2, 2); }
}
class WulfrumDrone extends Flyer {
  constructor(x, y, def) { super(x, y, def); this.shot = randInt(80, 160); this.glow = { color: 'rgba(160,255,160,0.8)', r: 14 }; }
  ai(world, player, game) {
    super.ai(world, player, game);
    if (--this.shot <= 0 && dist(this.cx, this.cy, player.cx, player.cy) < 24 * TILE && !player.dead) { this.shot = 140; const dx = player.cx - this.cx, dy = player.cy - this.cy, d = Math.hypot(dx, dy) || 1; const b = Gensokyo.bullet(game, this.cx, this.cy, dx / d * 4, dy / d * 4, { owner: this, color: '#a0ff80', hi: '#ffffff', damage: Math.round(this.damage * 0.6), sourceName: "a Wulfrum Drone's laser", size: 4, life: 150 }); b.ghost = false; b.trail = { color: '#a0ff80', len: 6, width: 3 }; Audio_.play('menu'); }
  }
  draw(ctx, camX, camY) { this.drawShadowFlash(ctx); const x = snap(this.x - camX), y = snap(this.y - camY); ctx.fillStyle = '#7aa070'; ctx.fillRect(x + 2, y + 4, 16, 10); ctx.fillStyle = '#c8f0b0'; ctx.fillRect(x + 2, y + 4, 16, 2); ctx.fillStyle = '#3a5a3a'; ctx.fillRect(x, y + 2, 4, 4); ctx.fillRect(x + 16, y + 2, 4, 4); ctx.fillStyle = '#a0ff80'; ctx.fillRect(x + (this.dir > 0 ? 12 : 4), y + 8, 4, 3); ctx.fillStyle = 'rgba(200,255,200,0.5)'; ctx.fillRect(x - 2 + Math.sin(this.t * 0.6) * 2, y, 6, 2); ctx.fillRect(x + 16 - Math.sin(this.t * 0.6) * 2, y, 6, 2); ctx.globalAlpha = 1; }
}
ENEMY_DEFS.wulfrum_slime = { name: 'Wulfrum Slime', cls: WulfrumSlime, hp: 35, damage: 9, defense: 6, color: 'rgba(120,160,110,1)', blood: '#7aa070', drops: [{ id: 'wulfrum_scrap', chance: 1, min: 1, max: 3 }, { id: 'gel', chance: 0.5, min: 1, max: 2 }] };
ENEMY_DEFS.wulfrum_drone = { name: 'Wulfrum Drone', cls: WulfrumDrone, hp: 40, damage: 14, defense: 4, kind: 'eye', w: 20, h: 16, speed: 3, blood: '#7aa070', drops: [{ id: 'wulfrum_scrap', chance: 1, min: 2, max: 4 }] };

// Desert Scourge: a burrowing worm ----------------------------------------------------------
class WormSegment extends Enemy {
  constructor(head, idx, x, y) {
    super(x, y, 24, 24, { name: 'Desert Scourge', hp: 1, damage: head.damage - 6, defense: 8, kbResist: 1, blood: '#c8a860', drops: [] });
    this.head = head; this.idx = idx; this.flying = true; this.isSegment = true; this.angle = 0; this.type = 'worm_segment';
  }
  hit(dmg, fromX, kb, game, swingId = null, crit = false) { return this.head.hit(dmg, fromX, 0, game, swingId, crit); }
  update(world, game) { this.t++; if (this.head.dead) { this.dead = true; return; } this.hitFlash = this.head.hitFlash; this.touchPlayer(game.player, game); }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY), tail = this.idx === this.head.segments.length;
    ctx.save(); ctx.translate(x, y); ctx.rotate(this.angle);
    ctx.globalAlpha = this.head.hitFlash > 0 ? 0.6 : 1;
    ctx.fillStyle = '#c8a860'; ctx.beginPath(); ctx.ellipse(0, 0, tail ? 14 : 12, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8d090'; ctx.fillRect(-8, -9, 16, 3); ctx.fillStyle = '#8a6a30'; ctx.fillRect(-10, 4, 20, 3);
    if (tail) { ctx.fillStyle = '#c8a860'; ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(-26, 0); ctx.lineTo(-12, 6); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
class DesertScourge extends Enemy {
  constructor(x, y) {
    super(x, y, 32, 32, { name: 'Desert Scourge', hp: 2600, damage: 30, defense: 8, kbResist: 1, blood: '#c8a860', drops: [] });
    this.isBoss = true; this.type = 'desert_scourge'; this.flying = true; this.angle = -Math.PI / 2; this.segments = []; this.lunge = 0; this.wasInGround = false; this.trail = { color: 'rgba(232,208,144,0.7)', len: 6, width: 8 };
  }
  spawnSegments(game) { const n = 28; for (let i = 1; i <= n; i++) { const s = new WormSegment(this, i, this.x, this.y + i * 20); game.enemies.push(s); this.segments.push(s); } }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    const inGround = world.isSolidAt(this.tileX, this.tileY);
    const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1;
    const want = Math.atan2(dy, dx);
    let da = ((want - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const enraged = this.hp < this.maxHp * 0.5;
    const turn = (inGround ? 0.05 : 0.018) * (enraged ? 1.4 : 1);
    if (this.lunge > 0) this.lunge--; else this.angle += clamp(da, -turn, turn);
    if (!inGround) { // gravity: sag downward while flying through the air
      const down = Math.PI / 2; let dd = ((down - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI; this.angle += clamp(dd, -0.012, 0.012);
    }
    // lunge when lined up with the player from below
    if (this.lunge <= 0 && inGround && Math.abs(da) < 0.15 && d < 20 * TILE && this.t % 90 === 0) { this.lunge = 40; FX.shake(2, 10); Audio_.play('zombie'); }
    const spd = ((inGround ? 7.5 : 5.5) + (this.lunge > 0 ? 3 : 0)) * (enraged ? 1.15 : 1) * this.slowFactor;
    this.x += Math.cos(this.angle) * spd; this.y += Math.sin(this.angle) * spd;
    this.x = clamp(this.x, 0, world.w * TILE - this.w); this.y = clamp(this.y, 0, world.h * TILE - this.h);
    if (inGround !== this.wasInGround) { FX.burst(game, this.cx, this.cy, 14, ['#e8d090', '#c8a860', '#a08040'], 4, 35); Audio_.play('dig'); }
    this.wasInGround = inGround;
    if (inGround && this.t % 3 === 0) game.particles.push(new Particle(this.cx + rand(-10, 10), this.cy + rand(-10, 10), rand(-1, 1), rand(-2, 0), '#c8a860', 25, 2));
    // segments follow the one in front
    let prev = this;
    for (const s of this.segments) { const sx = prev.cx - s.cx, sy = prev.cy - s.cy, sd = Math.hypot(sx, sy) || 1, gap = 20; if (sd > gap) { s.x += sx / sd * (sd - gap); s.y += sy / sd * (sd - gap); } s.angle = Math.atan2(sy, sx); prev = s; }
    // far away: teleport underground below the player
    if (d > 90 * TILE) { this.x = p.cx; this.y = p.cy + 40 * TILE; }
    this.touchPlayer(p, game);
  }
  die(game) {
    super.die(game);
    game.boss = null;
    for (const s of this.segments) { s.dead = true; FX.burst(game, s.cx, s.cy, 4, '#c8a860', 3, 30); }
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.desert_scourge = true;
    game.message('The Desert Scourge has been defeated!', '#ffe75a'); Audio_.play('levelup'); FX.shake(8, 30);
    game.dropItem(this.cx, this.cy, 'sea_prism', randInt(15, 25)); game.dropItem(this.cx, this.cy, 'pearl_shard', randInt(8, 14)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(3, 6)); game.dropItem(this.cx, this.cy, 'sand', randInt(20, 40));
    if (Math.random() < 0.5) game.dropItem(this.cx, this.cy, 'aquatic_discharge', 1); else game.dropItem(this.cx, this.cy, 'scourge_of_the_desert', 1);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'desert_scourge_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'desert_scourge_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 20000 * (game.expert ? 2.5 : 1));
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null);
  }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY);
    ctx.save(); ctx.translate(x, y); ctx.rotate(this.angle);
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1;
    ctx.fillStyle = '#c8a860'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8d090'; ctx.fillRect(-10, -12, 20, 4);
    ctx.fillStyle = '#301010'; ctx.beginPath(); ctx.moveTo(8, -8); ctx.lineTo(20, -4); ctx.lineTo(20, 4); ctx.lineTo(8, 8); ctx.closePath(); ctx.fill(); // mouth
    ctx.fillStyle = '#f0f0e0'; for (let i = 0; i < 3; i++) { ctx.fillRect(9 + i * 4, -7, 2, 4); ctx.fillRect(9 + i * 4, 3, 2, 4); }
    ctx.fillStyle = '#ff4040'; ctx.fillRect(0, -10, 4, 4); ctx.fillRect(0, 6, 4, 4);
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
BOSSES.push({ id: 'desert_scourge', name: 'Desert Scourge', order: 0.5, hp: 2600, summon: 'desert_medallion',
  spawn: 'Use a Desert Medallion (15 Cactus + 10 Sand + 3 Lenses at a Work Bench) while in the Desert. Any time of day.',
  info: 'A giant dried worm that burrows through sand and stone and lunges out of the ground at you. It only attacks with its body, so keep moving - it turns much slower in the open air. Below half life it gets faster.',
  loot: ['sea_prism', 'pearl_shard', 'aquatic_discharge', 'scourge_of_the_desert'], collectibles: ['desert_scourge_trophy', 'desert_scourge_mask'], despawn: 'The Desert Scourge burrows away...' });
ModLib.on('projHit', (g, b, e) => Calamity.onProjectileHit(g, b, e));
ModLib.on('swing', (g, it, st) => Calamity.onSwing(g, it, st));
ModLib.onIncoming((p, a, g) => Calamity.absorb(p, a, g));
