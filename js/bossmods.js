// ---------------------------------------------------------------------------
// Three boss / content mods:
//  - Ophioid: the Ophiocoon that hatches into the Ophiofly (pre-Hardmode, evil
//    biomes) and the Ophiopede rematch (post-mech) that showers mechanical souls.
//  - Corruption Core Boss: Shadow Wisps in the underground evil after the mechs
//    drop essence for the Core of Shadow / Core of Flesh, a mostly static core
//    with orbitals, the Dread Vortex and a night enrage.
//  - Jimbo's Desert Expansion: seven desert enemies, the Mega Cactus Slime,
//    Haunted Urn shrines, bandit camps, a wandering caravan and desert gear.
// ---------------------------------------------------------------------------
'use strict';

ModList.register('ophioid', 'Ophioid - A Boss fight mod', { workshop: 2564678900, desc: 'The Ophiocoon / Ophiofly and the Ophiopede rematch that drops Souls of Might, Sight and Fright.', builtin: true });
ModList.register('corruption_core', 'Corruption Core Boss', { workshop: 3105633551, desc: 'Shadow Wisps, the Core of Shadow (or Core of Flesh) with orbitals, the Dread Vortex and its night enrage.', builtin: true });
ModList.register('jimbos_desert', "Jimbo's Desert Expansion", { workshop: 3474021633, desc: 'Desert enemies, the Mega Cactus Slime, Haunted Urns, bandit camps, the caravan and 22 desert items.', builtin: true });

// === Ophioid ======================================================================================
ModList.current = 'ophioid';
class Ophiocoon extends BossBase {
  constructor(x, y) { super(x, y, 60, 80, 'ophiocoon'); this.setState('idle'); this.noContact = true; }
  ai(world, p, game) {
    this.hoverTo(this.anchorX || (this.anchorX = this.cx), this.anchorY || (this.anchorY = this.cy), 1, 0.02);
    const flies = game.enemies.filter(e => e.type === 'ophiofly_larva' && !e.dead).length;
    if (this.st % 120 === 30 && flies < 5) { this.spawnMinion(game, 'ophiofly_larva', this.cx + rand(-40, 40), this.cy); FX.burst(game, this.cx, this.cy, 8, '#a0c060', 3, 20); }
    if (this.st % 90 === 0) for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + this.t * 0.01; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 2, Math.sin(a) * 2, { owner: this, color: '#a0c060', hi: '#e0ffa0', damage: Math.round(this.damage * 0.6), sourceName: "the Ophiocoon's spore cloud", size: 9, life: 200 }); b.accel = 0.995; }
    if (this.hp < this.maxHp * 0.3 && this.st % 30 === 0) { const b = this.shoot(game, p, { speed: 5, color: '#c0e080', name: 'vile spit', size: 6 }); b.gravity = 0.05; }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.strokeStyle = '#8a9a60'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -120); ctx.stroke(); ctx.fillStyle = '#b0b878'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 42, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8a9a60'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(0, -30 + k * 15, 26 - Math.abs(k - 2) * 4, 4, 0, 0, Math.PI * 2); ctx.fill(); } const pulse = 0.6 + 0.4 * Math.sin(this.t * 0.1); ctx.fillStyle = `rgba(200,240,120,${pulse * 0.6})`; ctx.beginPath(); ctx.ellipse(0, 4, 14, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
defBEnemy('ophiofly_larva', Object.assign(FLY('Ophiofly Larva', 70, 20, 4, 'bat', '#a0c060', [{ id: 'rotten_chunk', chance: 0.3 }]), { erratic: true, speed: 4, w: 18, h: 12 }));
class Ophiofly extends BossBase {
  constructor(x, y) { super(x, y, 70, 50, 'ophiofly'); this.setState('buzz'); }
  ai(world, p, game) {
    const low = this.hp < this.maxHp * 0.5;
    switch (this.state) {
      case 'start': case 'buzz': { this.hoverTo(p.cx + Math.sin(this.t * 0.04) * 180, p.y - 110 + Math.cos(this.t * 0.07) * 30, 7, 0.1); if (this.st % (low ? 25 : 40) === 0) { const b = this.shoot(game, p, { speed: 6, color: '#c0e080', name: 'spore', size: 6, life: 150 }); b.homing = 0.06; } if (this.st > 180) this.setState(choose(['dive', 'lay'])); break; }
      case 'dive': { if (this.st < 20) this.hoverTo(p.cx - p.dir * 200, p.y - 200, 9); if (this.st === 20) { FX.telegraph(this.cx, this.cy, p.cx, p.cy, '#c0e080', 15, 6); this.chargeAt(p, 14); } if (this.st > 20) this.glide(); if (this.st > 55) this.setState('buzz'); break; }
      case 'lay': { this.hoverTo(p.cx, p.y - 240, 5); if (this.st === 30 && game.enemies.filter(e => e.type === 'ophiofly_larva' && !e.dead).length < 6) for (let k = -1; k <= 1; k++) this.spawnMinion(game, 'ophiofly_larva', this.cx + k * 30, this.cy + 20); if (this.st > 70) this.setState('buzz'); break; }
    }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); if (this.vx < 0) ctx.scale(-1, 1); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = 'rgba(220,240,255,0.5)'; const wf = Math.sin(this.t * 0.8) * 10; ctx.beginPath(); ctx.ellipse(-10, -22 + wf, 28, 8, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(-14, -18 - wf, 24, 7, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8aa050'; ctx.beginPath(); ctx.ellipse(-8, 0, 30, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6a8040'; ctx.beginPath(); ctx.arc(24, -4, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(28, -8, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#404830'; for (let k = 0; k < 3; k++) ctx.fillRect(-20 + k * 14, 12, 3, 12); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('ophiocoon', { name: 'Ophiocoon', order: 2.4, hp: 2400, damage: 24, defense: 6, blood: '#a0c060', cls: Ophiocoon, expertMult: 1.5, coins: 15000, spawnUp: 150,
  summon: 'dead_fungusbug', spawn: 'Use a Dead Fungusbug (Corruption) or Living Carrion (Crimson) - 15 Rotten Chunks/Vertebrae + 5 Vile Mushrooms + 3 Worms at a Demon Altar (Work Bench) - in your evil biome.', info: 'A hanging cocoon that releases spore clouds and larvae while you break it open. When it bursts, the Ophiofly hatches.',
  loot: ['spore_infested_egg'], collectibles: ['ophiofly_trophy', 'ophiofly_mask'], despawn: 'The Ophiocoon goes dormant...',
  drops: [{ id: 'rotten_chunk', min: 5, max: 10 }], onDeath: (g, b) => { g.message('The Ophiofly hatches from the Cocoon!', '#c0e080'); game_summonAfter(g, 'ophiofly', b.cx, b.cy); } });
function game_summonAfter(g, id, x, y) { g.boss = null; const b = Bosses.summon(g, id, { x, y }); if (b) b.eventEnemy = false; }
defBoss('ophiofly', { name: 'Ophiofly', order: 2.41, hp: 4200, damage: 28, defense: 8, blood: '#8aa050', cls: Ophiofly, expertMult: 1.5, coins: 25000, leash: 220, teleportWhenFar: true,
  summon: 'dead_fungusbug', spawn: 'Hatches from the Ophiocoon.', info: 'The hatched fly buzzes around firing homing spores, dives along a telegraphed line and lays more larvae. Faster below half life.',
  loot: ['spore_infested_egg', 'ophiofly_wing', 'fungus_flinger', 'sporecaster', 'larva_staff'], collectibles: ['ophiofly_trophy', 'ophiofly_mask'], despawn: 'The Ophiofly buzzes away...',
  drops: [{ id: 'rotten_chunk', min: 8, max: 14 }, { id: 'lesser_healing', min: 5, max: 8 }, { id: 'infested_compost', chance: 1 }], oneOf: ['ophiofly_wing', 'fungus_flinger', 'sporecaster', 'larva_staff'], expertItem: 'spore_infested_egg' });
const evilOnly = (g) => { const b = g.world.biome[clamp(g.player.tileX, 0, g.world.w - 1)]; return b === BIOME.CORRUPTION || b === BIOME.CRIMSON; };
Bosses.summonItem('dead_fungusbug', 'ophiocoon', { name: 'Dead Fungusbug', tooltip: "'A putrid stench comes from the thing you just made, it might attract something...' Summons the Ophiocoon (Corruption)", icon: summonIcon('#7050a0', '#a0c060'), where: evilOnly, whereMsg: 'The cocoon only forms in the Corruption or Crimson.', recipe: [['rotten_chunk', 15], ['vile_mushroom', 5], ['worm', 3]], station: 'workbench' });
Bosses.summonItem('living_carrion', 'ophiocoon', { name: 'Living Carrion', tooltip: "'A putrid stench comes from the thing you just made...' Summons the Ophiocoon (Crimson)", icon: summonIcon('#c02030', '#a0c060'), where: evilOnly, whereMsg: 'The cocoon only forms in the Corruption or Crimson.', recipe: [['vertebra', 15], ['vile_mushroom', 5], ['worm', 3]], station: 'workbench' });
defModWeapon('ophiofly_wing', 'Ophiofly Wing', 'boomerang', 22, 16, 4, 2, 20000, { speed: 11, color: '#c0e080', count: 2 });
defModWeapon('fungus_flinger', 'Fungus Flinger', 'gun', 18, 20, 3, 2, 20000, { speed: 12, shots: 2, spread: 0.1, trail: '#a0c060' });
defModWeapon('sporecaster', 'Sporecaster', 'magic', 20, 22, 2, 2, 20000, { manaCost: 8, color: '#c0e080', speed: 6, shots: 3, spreadAng: 0.3, homing: 0.4, life: 120 });
defModWeapon('larva_staff', 'Larva Staff', 'summon', 12, 30, 2, 2, 20000, { manaCost: 10, minion: { color: '#a0c060', shape: 'bird', speed: 8 } });
ACC('spore_infested_egg', 'Spore Infested Egg', { rarity: 3, value: 30000, tooltip: "'Looks like this egg didn't hatch yet to attack me...' An Ophioid Larva follows you and nibbles enemies for 8 damage", larvaPet: true }, genericIcon('#b0b878', '#a0c060', 'orb'));
ModLib.on('tick', (g) => { const p = g.player; if (!ModLib.hasAcc(p, 'spore_infested_egg') || g.world.time % 45 !== 0) return; const t = ModLib.nearestEnemy(g, p.cx, p.cy, 8 * TILE); if (t) { t.hit(8, p.cx, 1, g); g.particles.push(new Particle(t.cx, t.y, rand(-1, 1), -1, '#a0c060', 20, 3)); } });
// rematch: the Ophiopede
class Ophiopede extends Worm {
  constructor(x, y) { const d = BOSS_DEFS.ophiopede; super(x, y, { name: d.name, hp: d.hp, damage: d.damage, defense: d.defense, segments: 22, speed: 6.5, type: 'ophiopede', boss: true, head: '#5a7a30', body: '#4a6a28', eye: '#ff4040', blood: '#a0c060', size: 30, segHp: 0, turn: 1.1, shoot: 0 }); this.phase = 0; }
  update(world, game) {
    super.update(world, game); if (this.dead) return;
    const p = game.player, frac = this.hp / this.maxHp;
    if (this.phase === 0 && frac < 0.5) { this.phase = 1; this.o.armored = true; game.message('The Ophiopede shudders... The Seeing awaken!', '#c0e080'); for (let k = 0; k < 3; k++) { const e = spawnEnemy('the_seeing', this.cx + rand(-100, 100), this.cy - 80, game.expert); e.minion = true; game.enemies.push(e); } FX.shake(6, 20); }
    if (this.phase === 1 && frac < 0.2) { this.phase = 2; this.o.speed = 9; game.message('The Ophiopede thrashes wildly!', '#ff8080'); }
    if (this.t % (this.phase === 2 ? 30 : 60) === 0 && dist(this.cx, this.cy, p.cx, p.cy) < 40 * TILE) { const seg = choose([this, ...this.segments]); const dx = p.cx - seg.cx, dy = p.cy - seg.cy, d = Math.hypot(dx, dy) || 1; const b = Gensokyo.bullet(game, seg.cx, seg.cy, dx / d * 5, dy / d * 5, { owner: this, color: '#c0e080', hi: '#fff', damage: Math.round(this.damage * 0.55), sourceName: "the Ophiopede's vile spit", size: 6, life: 120 }); b.ghost = false; }
    if (this.phase >= 1 && this.t % 240 === 0 && game.enemies.filter(e => e.type === 'the_seeing' && !e.dead).length < 3) { const e = spawnEnemy('the_seeing', this.cx, this.cy - 60, game.expert); e.minion = true; game.enemies.push(e); }
    if (this.phase === 2 && this.t % 150 === 0) { this.lunge = 40; this.angle = Math.atan2(p.cy - this.cy, p.cx - this.cx); }
  }
}
defBEnemy('the_seeing', Object.assign(FLY('The Seeing', 600, 44, 20, 'eye', '#e0e0d0', []), { cls: Shooter, rate: 70, bullet: '#ff8080', bulletName: 'stare', w: 28, h: 24, speed: 4 }));
defBoss('ophiopede', { name: 'Ophiopede', order: 4.65, hp: 26000, damage: 70, defense: 24, blood: '#a0c060', cls: Ophiopede, expertMult: 1.5, coins: 100000, spawnUp: 500, spawnDist: 200,
  summon: 'infested_compost', spawn: 'Use Infested Compost (dropped by the Ophiofly; also 20 Rotten Chunks/Vertebrae + 5 Souls of Night + 3 Vile Mushrooms at a Mythril Anvil) after the mechanical bosses.', info: 'The grown Ophioid: a long burrowing centipede that spits from every segment. At half life its plating hardens and The Seeing - floating eyes - awaken; below 20% it lunges relentlessly. Cuts down on soul grinding: showers Souls of Might, Sight and Fright.',
  loot: ['soul_of_might', 'soul_of_sight', 'soul_of_fright', 'hallowed_bar', 'ophioid_larva', 'ophiopede_fang'], collectibles: ['ophiopede_trophy', 'ophiopede_mask'], despawn: 'The Ophiopede burrows out of reach...',
  drops: [{ id: 'soul_of_might', min: 15, max: 30 }, { id: 'soul_of_sight', min: 15, max: 30 }, { id: 'soul_of_fright', min: 15, max: 30 }, { id: 'hallowed_bar', min: 10, max: 20 }, { id: 'greater_healing', min: 5, max: 10 }], oneOf: ['ophioid_larva', 'ophiopede_fang'], expertItem: 'ophioid_larva' });
Bosses.summonItem('infested_compost', 'ophiopede', { name: 'Infested Compost', tooltip: "'An amalgamation of organic vileness' Summons the Ophiopede (after the mechanical bosses)", icon: summonIcon('#4a6a28', '#a0c060'), rarity: 5, hardmode: true, where: (g) => ModLib.mechs(g) >= 1, whereMsg: 'Something stirs, but not yet... (defeat a mechanical boss first)', recipe: [['rotten_chunk', 20], ['soul_of_night', 5], ['vile_mushroom', 3]], station: 'mythril_anvil' });
defModWeapon('ophioid_larva', 'Ophioid Larva', 'summon', 44, 30, 3, 6, 100000, { manaCost: 10, minion: { color: '#5a7a30', shape: 'dragon', speed: 9 }, desc: "'A little Ophiopede'" });
defModWeapon('ophiopede_fang', 'Ophiopede Fang', 'spear', 74, 20, 6, 6, 100000, { color: '#e0e0d0' });
for (const [id, name, col] of [['ophiofly', 'Ophiofly', '#8aa050'], ['ophiopede', 'Ophiopede', '#5a7a30']]) { CAT(`${id}_trophy`, { name: `${name} Trophy`, max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)', drawIcon: genericIcon(col, '#fff', 'trophy') }, 10000); CAT(`${id}_mask`, { name: `${name} Mask`, max: 1, rarity: 2, armor: 'head', defense: 2, vanity: true, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } }, 7500); }

// === Corruption Core Boss =========================================================================
ModList.current = 'corruption_core';
defBEnemy('shadow_wisp', Object.assign(FLY('Shadow Wisp', 700, 60, 26, 'eye', '#40206a', [{ id: 'shadow_essence', chance: 0.8, min: 1, max: 2 }]), { cls: Shooter, rate: 80, bullet: '#8040c0', bulletName: 'shadow flame', w: 20, h: 20, speed: 4.5, ghostShots: true }));
defBEnemy('flesh_wisp', Object.assign(FLY('Flesh Wisp', 700, 60, 26, 'eye', '#8a2030', [{ id: 'shadow_essence', chance: 0.8, min: 1, max: 2 }]), { cls: Shooter, rate: 80, bullet: '#ff4060', bulletName: 'blood flame', w: 20, h: 20, speed: 4.5, ghostShots: true }));
defModMaterial('shadow_essence', 'Shadow Essence', { color: '#40206a', hi: '#c080ff', rarity: 5, value: 5000, tooltip: 'Dropped by the suspicious wisps of the underground evil after the mechanical bosses' });
ModLib.onSpawnPick((g, type, ctx) => { if (!ModList.on('corruption_core') || ModLib.mechs(g) < 1 || !ctx.underground) return type; const d = BiomeSys.detect(g); if (!d) return type; if (d.mini === 'Underground Corruption' && Math.random() < 0.25) return 'shadow_wisp'; if (d.mini === 'Underground Crimson' && Math.random() < 0.25) return 'flesh_wisp'; return type; });
class CoreOfShadow extends BossBase {
  constructor(x, y) { super(x, y, 70, 70, 'core_of_shadow'); this.setState('idle'); this.crimson = false; this.enraged = false; this.noContact = false; this.orbitals = []; }
  setup(game) {
    this.crimson = game.world.evil === BIOME.CRIMSON; this.enraged = !game.world.isDay() && !evilOnly(game); this.name = this.crimson ? 'Core of Flesh' : 'Core of Shadow';
    if (this.enraged) game.message(`${this.name} is enraged by the night!`, '#ff4040');
    this.anchorX = this.cx; this.anchorY = this.cy;
    for (let k = 0; k < 4; k++) { const q = new BossPart(this, 26, 26, { name: 'Orbital', hp: Math.round(this.maxHp * 0.12), damage: this.damage, defense: 30, type: 'core_orbital', ai: (o, world, p, g) => { const a = this.t * 0.03 + k * Math.PI / 2, r = 110 + Math.sin(this.t * 0.02) * 20; o.x = this.cx + Math.cos(a) * r - o.w / 2; o.y = this.cy + Math.sin(a) * r - o.h / 2; if ((this.t + k * 20) % 80 === 0 && dist(o.cx, o.cy, p.cx, p.cy) < 40 * TILE) { const dx = p.cx - o.cx, dy = p.cy - o.cy, d = Math.hypot(dx, dy) || 1; Gensokyo.bullet(g, o.cx, o.cy, dx / d * 7, dy / d * 7, { owner: this, color: this.col(), hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: `${this.name}'s orbital`, size: 6, life: 140 }); } }, draw: (o, ctx, cx, cy) => { const x = snap(o.cx - cx), y = snap(o.cy - cy); ctx.globalAlpha = o.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = this.col(); ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 3, y - 3, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } }); game.enemies.push(q); this.orbitals.push(q); }
  }
  col() { return this.crimson ? '#ff4060' : '#8040c0'; }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.enraged) dmg = Math.round(dmg * 0.5); return super.hit(dmg, fromX, 0, game, swingId, crit); }
  ai(world, p, game) {
    this.hoverTo(this.anchorX + Math.sin(this.t * 0.01) * 60, this.anchorY, 2, 0.03);
    const alive = this.orbitals.filter(o => !o.dead).length, low = this.hp < this.maxHp * 0.5;
    switch (this.state) {
      case 'start': case 'idle': { if (this.st % 50 === 0) for (let k = 0; k < (low ? 8 : 5); k++) { const a = Math.atan2(p.cy - this.cy, p.cx - this.cx) + (k - 2) * 0.18; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 6, Math.sin(a) * 6, { owner: this, color: this.col(), hi: '#fff', damage: Math.round(this.damage * 0.7), sourceName: `${this.name}'s shadow blast`, size: 7, life: 160 }); if (this.enraged) b.onHitPlayer = (g) => g.player.addBuff('Dread', 240); } if (this.st > 240) this.setState(choose(['vortex', 'chase', alive ? 'idle' : 'burst'])); break; }
      case 'vortex': { if (this.st === 1) game.message('Dread Vortex!', this.col()); if (this.st < 200) { const dx = this.cx - p.cx, dy = this.cy - p.cy, d = Math.hypot(dx, dy) || 1; if (d > 60) { p.vx += dx / d * 0.35; p.vy += dy / d * 0.25; } if (this.st % 8 === 0) game.particles.push(new Particle(this.cx + rand(-200, 200), this.cy + rand(-200, 200), 0, 0, this.col(), 20, 3)); if (this.st % 30 === 0) for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + this.st * 0.05; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 3.5, Math.sin(a) * 3.5, { owner: this, color: this.col(), hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: `${this.name}'s Dread Vortex`, size: 6, life: 150 }); } } if (this.st > 220) this.setState('idle'); break; }
      case 'chase': { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; this.x += dx / d * 5; this.y += dy / d * 5; if (this.st > 150) { this.anchorX = this.cx; this.anchorY = this.cy; this.setState('idle'); } break; }
      case 'burst': { if (this.st % 10 === 0 && this.st < 120) { const a = Math.random() * Math.PI * 2; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 8, Math.sin(a) * 8, { owner: this, color: this.col(), hi: '#fff', damage: Math.round(this.damage * 0.8), sourceName: `${this.name}'s burst`, size: 8, life: 120 }); } if (this.st > 140) this.setState('idle'); break; }
    }
    if (game.expert && low && !this.phase3) { this.phase3 = true; game.message(`${this.name} enters its final phase!`, this.col()); for (const o of this.orbitals) if (o.dead) { o.dead = false; o.hp = Math.round(o.maxHp * 0.5); game.enemies.push(o); } }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; const g = ctx.createRadialGradient(0, 0, 5, 0, 0, 70); g.addColorStop(0, this.col()); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fill(); ctx.rotate(this.t * 0.02); ctx.fillStyle = this.crimson ? '#5a1020' : '#200a30'; for (let k = 0; k < 6; k++) { ctx.rotate(Math.PI / 3); ctx.fillRect(-6, -40, 12, 22); } ctx.fillStyle = this.enraged ? '#ff2020' : this.col(); ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
BUFF_MODS.Dread = (p, pm) => { pm.defAdd -= 15; pm.regenAdd -= 4; };
defBoss('core_of_shadow', { name: 'Core of Shadow', order: 4.66, hp: 38000, damage: 70, defense: 36, blood: '#8040c0', cls: CoreOfShadow, expertMult: 1.5, coins: 120000, spawnUp: 120, spawnDist: 250,
  summon: 'shadow_heart', spawn: 'Use a Shadow Heart (10 Shadow Essence + 5 Souls of Night at a Mythril Anvil) in the Corruption or Crimson, or anywhere at night - but at night the Core is ENRAGED.', info: 'A mostly static core surrounded by four orbitals that keep firing until all are destroyed. Fires shadow blast fans, drags you in with the Dread Vortex, chases briefly and bursts when unguarded. Enraged at night: 50% damage reduction and attacks inflict Dread. Expert: a third phase revives the orbitals. Crimson worlds fight the Core of Flesh.',
  loot: ['cursed_carbine', 'shadow_scythe', 'void_tome', 'core_staff', 'nightshard'], collectibles: ['core_of_shadow_trophy', 'core_of_shadow_mask'], despawn: 'The Core sinks back into the dark...',
  drops: [{ id: 'shadow_essence', min: 10, max: 16 }, { id: 'soul_of_night', min: 10, max: 20 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['cursed_carbine', 'shadow_scythe', 'void_tome', 'core_staff'], expertItem: 'core_fragment', onDeath: (g, b) => { if (b.enraged) { g.dropItem(b.cx, b.cy, 'nightshard', 1, null, null); g.message('The enraged Core drops a Nightshard!', '#ff4040'); } } });
Bosses.summonItem('shadow_heart', 'core_of_shadow', { name: 'Shadow Heart', tooltip: 'Summons the Core of Shadow (evil biome, or anywhere at night - enraged)', icon: summonIcon('#40206a', '#c080ff'), rarity: 5, where: (g) => evilOnly(g) || !g.world.isDay(), whereMsg: 'The heart only beats in the Corruption / Crimson, or at night.', recipe: [['shadow_essence', 10], ['soul_of_night', 5]], station: 'mythril_anvil' });
defModWeapon('cursed_carbine', 'Cursed Carbine', 'gun', 66, 10, 3, 6, 120000, { speed: 16, trail: '#8040c0', onHitBuff: 'Frostburn', desc: 'Bullets burn with cursed flame' });
defModWeapon('shadow_scythe', 'Shadow Scythe', 'sword', 84, 22, 6, 6, 120000, { swingProj: { color: '#8040c0', speed: 9, homing: 0.3, shots: 2 }, mat: 'silver' });
defModWeapon('void_tome', 'Void Tome', 'magic', 70, 20, 4, 6, 120000, { manaCost: 12, color: '#40206a', hi: '#c080ff', speed: 9, pierce: 3, ghost: true, glow: true });
defModWeapon('core_staff', 'Core Staff', 'summon', 48, 30, 3, 6, 120000, { manaCost: 10, minion: { color: '#8040c0', shape: 'orb', ranged: true, rate: 28, speed: 6, ghost: true } });
ACC('core_fragment', 'Core Fragment', { rarity: 6, value: 100000, tooltip: 'An orbital of shadow circles you and fires at enemies', coreFragment: true }, genericIcon('#40206a', '#c080ff', 'orb'));
ACC('nightshard', 'Nightshard', { rarity: 7, value: 150000, tooltip: 'Only dropped by the enraged Core. +15% damage at night, +10 defense at night, immunity to Dread', nightshard: true }, genericIcon('#200a30', '#ff4040', 'orb'));
ModLib.onPlayerMods((p, pm, g) => { if (ModLib.hasAcc(p, 'nightshard')) { if (p.buffs.Dread) p.buffs.Dread = 0; if (!g.world.isDay()) { pm.dmg *= 1.15; pm.defAdd += 10; } } });
ModLib.on('tick', (g) => { const p = g.player; if (!ModLib.hasAcc(p, 'core_fragment') || g.world.time % 50 !== 0) return; const a = g.world.time * 0.03; const ox = p.cx + Math.cos(a) * 50, oy = p.cy + Math.sin(a) * 50; const t = ModLib.nearestEnemy(g, ox, oy, 20 * TILE); if (t) modShot(g, ox, oy, (t.cx - ox) / 20, (t.cy - oy) / 20, { damage: 40, color: '#8040c0', life: 60, homing: 0.3 }); g.particles.push(new Particle(ox, oy, 0, 0, '#8040c0', 10, 4)); });
CAT('core_of_shadow_trophy', { name: 'Core of Shadow Trophy', max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)', drawIcon: genericIcon('#8040c0', '#fff', 'trophy') }, 10000);
CAT('core_of_shadow_mask', { name: 'Core of Shadow Mask', max: 1, rarity: 2, armor: 'head', defense: 2, vanity: true, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } }, 7500);

// === Jimbo's Desert Expansion =====================================================================
ModList.current = 'jimbos_desert';
const Jimbo = { state(g) { return ModLib.world(g, 'jimbo', () => ({ urns: [], camps: [], caravanDay: -1 })); } };
defBEnemy('cactus_slime', { name: 'Cactus Slime', cls: Slime, hp: 45, damage: 14, defense: 6, color: 'rgba(80,150,60,1)', blood: '#50a040', drops: [{ id: 'gel', chance: 1, min: 1, max: 2 }, { id: 'cactus', chance: 0.6, min: 2, max: 5 }] });
defBEnemy('dune_scorpion', { name: 'Dune Scorpion', cls: Beast, hp: 70, damage: 22, defense: 10, speed: 2.2, charge: 6, chargeEvery: 120, w: 34, h: 18, blood: '#c8a860', drops: [{ id: 'scorpion_stinger_item', chance: 0.3 }, { id: 'antlion_mandible', chance: 0.2 }], draw: (c, e) => { c.fillStyle = '#c8a860'; c.beginPath(); c.ellipse(0, -8, 16, 7, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#a08040'; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, -10); c.quadraticCurveTo(-26, -34, -8, -30 + Math.sin(e.t * 0.1) * 2); c.stroke(); c.fillStyle = '#804020'; c.fillRect(-10, -32, 5, 5); c.fillStyle = '#a08040'; c.fillRect(12, -14, 8, 4); c.fillRect(12, -6, 8, 4); c.fillStyle = '#000'; c.fillRect(8, -10, 2, 2); } });
defBEnemy('sand_wraith', Object.assign(FLY('Sand Wraith', 160, 30, 8, 'eye', '#e0d0a0', [{ id: 'sand', chance: 0.5, min: 3, max: 8 }, { id: 'mummy_bandage', chance: 0.1 }]), { cls: Shooter, rate: 90, bullet: '#e8d090', bulletName: 'sand blast', w: 26, h: 36, speed: 3.4, ghostShots: true }));
defBEnemy('dust_devil', FLY('Dust Devil', 90, 18, 4, 'bat', '#d0c090', [{ id: 'sand', chance: 0.6, min: 2, max: 5 }], { erratic: true, speed: 5, w: 22, h: 30 }));
defBEnemy('scarab_swarm', FLY('Scarab Swarm', 40, 12, 2, 'bat', '#3a5a3a', [{ id: 'scarab_shell', chance: 0.4 }], { erratic: true, speed: 4.5, w: 14, h: 10 }));
defBEnemy('desert_bandit', WALK('Desert Bandit', 110, 24, 10, 1.9, { skin: '#d0a070', hair: '#302010', shirt: '#a04030', pants: '#604020', shoes: '#302010', eye: '#000' }, [{ id: 'coin_silver', chance: 0.8, min: 2, max: 8 }, { id: 'bandit_blunderbuss', chance: 0.04 }], { armed: false }));
ENEMY_DEFS.desert_bandit.cls = class extends Walker { ai(world, p, game) { super.ai(world, p, game); if (this.t % 90 === 0 && dist(this.cx, this.cy, p.cx, p.cy) < 20 * TILE) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; Gensokyo.bullet(game, this.cx, this.cy, dx / d * 8, dy / d * 8, { owner: this, color: '#ffe060', damage: Math.round(this.damage * 0.8), sourceName: "a Desert Bandit's shot", size: 4, life: 90 }); } } };
defBEnemy('haunted_urn', { name: 'Haunted Urn', cls: Beast, hp: 220, damage: 28, defense: 16, stationary: true, w: 26, h: 34, blood: '#c8a860', rate: 75, bullet: '#c0ffc0', bulletName: 'soul flame', homing: 0.12, drops: [{ id: 'urn_shard', chance: 1, min: 1, max: 3 }, { id: 'coin_gold', chance: 0.3 }], draw: (c, e) => { c.fillStyle = '#c8a860'; c.beginPath(); c.moveTo(-8, -34); c.lineTo(8, -34); c.lineTo(13, -18); c.lineTo(9, 0); c.lineTo(-9, 0); c.lineTo(-13, -18); c.closePath(); c.fill(); c.fillStyle = '#806030'; c.fillRect(-10, -30, 20, 2); c.fillRect(-12, -14, 24, 2); c.fillStyle = `rgba(160,255,160,${0.5 + 0.4 * Math.sin(e.t * 0.1)})`; c.fillRect(-5, -26, 4, 5); c.fillRect(2, -26, 4, 5); } });
defModMaterial('scorpion_stinger_item', 'Scorpion Stinger', { color: '#804020', hi: '#c8a860', rarity: 1, value: 800, tooltip: 'Dropped by Dune Scorpions' });
defModMaterial('scarab_shell', 'Scarab Shell', { color: '#3a5a3a', hi: '#80c080', rarity: 1, value: 600, tooltip: 'Dropped by scarab swarms' });
defModMaterial('urn_shard', 'Urn Shard', { color: '#c8a860', hi: '#fff', rarity: 2, value: 1500, tooltip: 'A piece of a Haunted Urn' });
ModLib.onSpawnPick((g, type, ctx) => { if (!ModList.on('jimbos_desert')) return type; const b = g.world.biome[clamp(g.player.tileX, 0, g.world.w - 1)]; if (b !== BIOME.DESERT) return type; const r = Math.random(); if (ctx.underground) return r < 0.15 ? 'scarab_swarm' : r < 0.25 ? 'sand_wraith' : type; if (ctx.night) return r < 0.2 ? 'sand_wraith' : r < 0.35 ? 'desert_bandit' : r < 0.45 ? 'dune_scorpion' : type; return r < 0.2 ? 'cactus_slime' : r < 0.32 ? 'dune_scorpion' : r < 0.42 ? 'dust_devil' : r < 0.5 ? 'scarab_swarm' : r < 0.55 ? 'desert_bandit' : type; });
class MegaCactusSlime extends BossBase {
  constructor(x, y) { super(x, y, 120, 90, 'mega_cactus_slime'); this.flying = false; this.canStep = true; this.setState('hop'); }
  ai(world, p, game) {
    this.updateLiquidState(world); this.dir = p.cx > this.cx ? 1 : -1;
    switch (this.state) {
      case 'start': case 'hop': { if (this.onGround && this.st % 45 === 0) { this.vy = this.st % 135 === 0 ? -15 : -9; this.vx = this.dir * (this.st % 135 === 0 ? 7 : 4.5); } if (this.st > 200) this.setState(choose(['needles', 'split'])); break; }
      case 'needles': { this.vx *= 0.8; if (this.st === 20) { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 7, Math.sin(a) * 7, { owner: this, color: '#50a040', hi: '#c0ffa0', damage: Math.round(this.damage * 0.7), sourceName: "the Mega Cactus Slime's needles", size: 5, life: 120 }).gravity = 0.05; } Audio_.play('hit'); } if (this.st > 60) this.setState('hop'); break; }
      case 'split': { if (this.st === 10 && game.enemies.filter(e => e.type === 'cactus_slime' && !e.dead).length < 6) for (let k = -1; k <= 1; k++) this.spawnMinion(game, 'cactus_slime', this.cx + k * 40, this.y - 20); if (this.st > 30) this.setState('hop'); break; }
    }
    this.applyGravity(); this.moveAndCollide(world); if (this.onGround) this.vx *= 0.9;
    if (this.onGround && this.t % 20 === 0 && Math.random() < 0.3) game.particles.push(new Particle(this.cx + rand(-50, 50), this.y + this.h, 0, -1, '#e8d090', 20, 2));
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.y + this.h - camY); ctx.save(); ctx.globalAlpha = (this.hitFlash > 0 ? 0.6 : 0.9); const squish = this.onGround ? 1 : 0.85; ctx.fillStyle = 'rgba(80,160,60,0.9)'; ctx.beginPath(); ctx.ellipse(x, y - 45 * squish, 60, 45 * squish, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a7a30'; for (let k = 0; k < 9; k++) { const a = Math.PI + k * Math.PI / 8; ctx.fillRect(x + Math.cos(a) * 58 - 2, y - 45 * squish + Math.sin(a) * 45 * squish - 2, 4, 8); } ctx.fillStyle = '#ff60a0'; ctx.beginPath(); ctx.arc(x, y - 88 * squish, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.fillRect(x + this.dir * 16 - 4, y - 56, 6, 8); ctx.fillRect(x + this.dir * 34 - 4, y - 56, 6, 8); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('mega_cactus_slime', { name: 'Mega Cactus Slime', order: 1.6, hp: 2600, damage: 22, defense: 8, blood: '#50a040', cls: MegaCactusSlime, flying: false, expertMult: 1.4, coins: 15000, spawnUp: 80, spawnDist: 380,
  summon: 'prickly_pear', spawn: 'Use a Prickly Pear (20 Cactus + 10 Gel + 1 Scorpion Stinger at a Work Bench) in the desert. It can also show up on its own while you explore the desert.', info: 'A colossal slime bristling with spines. Hops (occasionally a giant leap), fires rings of needles and splits off Cactus Slimes.',
  loot: ['cacti_crasher', 'needle_bow', 'cactus_staff', 'prickly_pauldron'], collectibles: ['mega_cactus_slime_trophy', 'mega_cactus_slime_mask'], despawn: 'The Mega Cactus Slime rolls away...',
  drops: [{ id: 'cactus', min: 30, max: 60 }, { id: 'gel', min: 20, max: 40 }, { id: 'lesser_healing', min: 3, max: 6 }], oneOf: ['cacti_crasher', 'needle_bow', 'cactus_staff'], expertItem: 'prickly_pauldron' });
Bosses.summonItem('prickly_pear', 'mega_cactus_slime', { name: 'Prickly Pear', tooltip: 'Summons the Mega Cactus Slime (desert)', icon: summonIcon('#50a040', '#ff60a0'), where: inBiome(BIOME.DESERT), whereMsg: 'Only the desert answers.', recipe: [['cactus', 20], ['gel', 10], ['scorpion_stinger_item', 1]], station: 'workbench' });
ModLib.on('tick', (g) => { if (!ModList.on('jimbos_desert') || g.boss || g.world.time % 1800 !== 900 || g.world.isSub) return; const b = g.world.biome[clamp(g.player.tileX, 0, g.world.w - 1)]; if (b === BIOME.DESERT && g.player.tileY < g.world.surfaceLine && Math.random() < 0.12 && !ModLib.beaten(g, 'mega_cactus_slime')) Bosses.summon(g, 'mega_cactus_slime'); });
defModWeapon('cacti_crasher', 'Cacti Crasher', 'sword', 24, 30, 8, 2, 20000, { swingProj: { color: '#50a040', speed: 7, shots: 3 }, mat: 'gold', desc: 'A heavy cactus club that scatters needles' });
defModWeapon('needle_bow', 'Needle Bow', 'bow', 16, 18, 2, 2, 15000, { speed: 12, shots: 3, spread: 0.15, trail: '#50a040' });
defModWeapon('cactus_staff', 'Cactus Staff', 'summon', 11, 30, 2, 2, 15000, { manaCost: 10, minion: { color: '#50a040', shape: 'spider', speed: 7 } });
ACC('prickly_pauldron', 'Prickly Pauldron', { rarity: 3, value: 30000, tooltip: 'Enemies that touch you take 20 damage; +3 defense', defense: 3, thorns: 20 }, genericIcon('#50a040', '#ff60a0', 'box'));
ModLib.onPlayerHurt((p, amount, g, kind, attacker) => { const thorns = ModLib.accs(p).reduce((a, it) => a + (it.thorns || 0), 0); if (thorns && attacker && attacker.hit && !attacker.dead) attacker.hit(thorns, p.cx, 3, g); });
defModWeapon('scorpion_spear', 'Scorpion Spear', 'spear', 19, 24, 5, 1, 12000, { color: '#c8a860', recipe: [['scorpion_stinger_item', 3], ['cactus', 10]], station: 'workbench', onHitBuff: 'Poisoned' });
defModWeapon('sandstorm_staff', 'Sandstorm Staff', 'magic', 17, 20, 3, 2, 15000, { manaCost: 8, color: '#e8d090', speed: 8, shots: 2, spreadAng: 0.2, jitter: 0.2, pierce: 1, recipe: [['sand', 30], ['fallen_star', 3], ['antlion_mandible', 2]], station: 'anvil' });
defModWeapon('scarab_staff', 'Scarab Staff', 'summon', 9, 30, 1, 2, 15000, { manaCost: 10, minion: { color: '#3a5a3a', shape: 'bird', speed: 9 }, recipe: [['scarab_shell', 8], ['gold_bar', 4]], station: 'anvil' });
defModWeapon('bandit_blunderbuss', 'Bandit Blunderbuss', 'gun', 12, 34, 5, 2, 15000, { speed: 11, shots: 4, spread: 0.25 });
defModWeapon('urn_of_souls', 'Urn of Souls', 'magic', 22, 24, 2, 3, 30000, { manaCost: 10, color: '#c0ffc0', speed: 7, homing: 0.8, shots: 2, spreadAng: 0.4, ghost: true, glow: true, recipe: [['urn_shard', 6], ['bone', 10]], station: 'anvil' });
ACC('scorpion_tail', 'Scorpion Tail', { rarity: 2, value: 20000, tooltip: 'Melee hits poison enemies; +5% melee speed', scorpionTail: true, recipe: [['scorpion_stinger_item', 5], ['gold_bar', 5]], station: 'anvil' }, genericIcon('#804020', '#c8a860', 'box'));
ACC('mirage_cloak', 'Mirage Cloak', { rarity: 3, value: 30000, tooltip: '10% chance to dodge attacks while in the desert; +8% movement speed', mirage: true, recipe: [['silk', 6], ['scarab_shell', 5], ['pixie_dust', 0]].filter(r => r[1]), station: 'anvil' }, genericIcon('#e8d090', '#fff', 'wings'));
ACC('scarab_amulet', 'Scarab Amulet', { rarity: 2, value: 20000, tooltip: '+2 life regeneration in the desert, +3 defense', defense: 3, scarab: true, recipe: [['scarab_shell', 10], ['gold_bar', 3]], station: 'anvil' }, genericIcon('#3a5a3a', '#80c080', 'ring'));
ModLib.onPlayerMods((p, pm, g) => { const acc = ModLib.accs(p); const desert = g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.DESERT; if (acc.some(a => a.scorpionTail)) pm.useTime *= 0.95; if (acc.some(a => a.mirage)) pm.move *= 1.08; if (acc.some(a => a.scarab) && desert) pm.regenAdd += 2; });
ModLib.on('enemyHit', (g, e) => { const sel = g.player.selectedItem; if (sel && ITEMS[sel.id].sword && ModLib.hasAcc(g.player, 'scorpion_tail')) e.applyDebuff('Poisoned', 180, 1); });
ModLib.onIncoming((p, amount, g) => { if (ModLib.hasAcc(p, 'mirage_cloak') && g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.DESERT && Math.random() < 0.1) { g.addDamageText(p.cx, p.y - 12, 'Mirage!', '#e8d090'); return 0; } return amount; });
defModArmorSet('dune', 'Dune', { colors: ['#f0e0b0', '#c8a860', '#806030'], rarity: 2, bar: 'hardened_sand', cost: [15, 25, 20], extra: [['scarab_shell', 2]], value: 15000, station: 'workbench', pieces: [['dune_hood', 'Dune Hood', 'head', 3], ['dune_robe', 'Dune Robe', 'body', 5], ['dune_wraps', 'Dune Wraps', 'legs', 3]], desc: '+15% movement speed, sandstorms and Dust Devils ignore you, +4 defense in the desert', bonus: (p, pm, g) => { pm.move *= 1.15; if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.DESERT) pm.defAdd += 4; } });
// vanilla recipes the desert unlocks
RECIPES.push({ result: 'sandstorm_in_a_bottle', count: 1, station: 'anvil', ing: [['bottle', 1], ['sand', 50], ['scarab_shell', 5], ['fallen_star', 2]] });
RECIPES.push({ result: 'pharaohs_mask', count: 1, station: 'workbench', ing: [['silk', 5], ['gold_bar', 3], ['urn_shard', 2]] });
RECIPES.push({ result: 'antlion_mandible', count: 1, station: 'workbench', ing: [['scorpion_stinger_item', 2]] });
RECIPES.push({ result: 'mummy_bandage', count: 1, station: 'workbench', ing: [['silk', 2], ['urn_shard', 1]] });
for (const [id, name, col] of [['mega_cactus_slime', 'Mega Cactus Slime', '#50a040']]) { CAT(`${id}_trophy`, { name: `${name} Trophy`, max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)', drawIcon: genericIcon(col, '#fff', 'trophy') }, 10000); CAT(`${id}_mask`, { name: `${name} Mask`, max: 1, rarity: 2, armor: 'head', defense: 2, vanity: true, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } }, 7500); }
// structures: Haunted Urn shrines and bandit camps in the desert
Jimbo.generate = function (world, rng) {
  const w = world.w, idx = (x, y) => x + y * w;
  const set = (x, y, t) => { if (world.inBounds(x, y)) { world.tiles[idx(x, y)] = t; world.tdata[idx(x, y)] = 0; } };
  const wall = (x, y, wl) => { if (world.inBounds(x, y)) world.walls[idx(x, y)] = wl; };
  const band = world.bands && world.bands.desert; if (!band) return;
  const x0 = Math.floor(band[0] * w), x1 = Math.floor(band[1] * w);
  world.modData = world.modData || {}; const st = world.modData.jimbo = { urns: [], camps: [], caravanDay: -1 };
  // urn shrines: small sandstone brick chambers under the surface with an urn on a pedestal
  for (let k = 0; k < 3; k++) {
    const x = randInt(Math.min(x0, x1) + 10, Math.max(x0, x1) - 10), y = (world.surface[x] || world.surfaceLine) + randInt(12, 40);
    for (let yy = -5; yy <= 1; yy++) for (let xx = -6; xx <= 6; xx++) { const edge = yy === -5 || yy === 1 || Math.abs(xx) === 6; set(x + xx, y + yy, edge ? T.SANDSTONE_BRICK : T.AIR); wall(x + xx, y + yy, W.SAND); }
    set(x, y, T.SANDSTONE_BRICK); set(x - 4, y - 1, T.TORCH); set(x + 4, y - 1, T.TORCH);
    st.urns.push({ x, y: y - 1 });
    world.placeFurniture(x - 2, y - 1, T.CHEST); const inv = world.chests.get(idx(x - 2, y - 1)); if (inv) [['urn_shard', 3], ['coin_gold', 2], [choose(['scorpion_spear', 'sandstorm_staff', 'scarab_staff']), 1], ['sand', 20]].forEach((it, i) => { inv[i] = makeStack(it[0], it[1], it[2] === undefined && ITEMS[it[0]].damage ? undefined : null); });
  }
  // bandit camps on the surface: a tent (wood frame), campfire and a loot chest
  for (let k = 0; k < 2; k++) {
    const x = randInt(Math.min(x0, x1) + 10, Math.max(x0, x1) - 10); let y = world.surface[x]; if (!y) continue;
    for (let xx = -6; xx <= 6; xx++) { const gy = world.surface[x + xx]; for (let yy = y - 6; yy < gy; yy++) set(x + xx, yy, T.AIR); for (let yy = gy; yy <= y; yy++) set(x + xx, yy, T.SAND); }
    for (let yy = 1; yy <= 4; yy++) { set(x - 5 + (4 - yy), y - yy, T.WOOD); set(x + 5 - (4 - yy), y - yy, T.WOOD); }
    set(x, y - 5, T.WOOD); for (let xx = -1; xx <= 1; xx++) set(x + xx, y - 5, T.WOOD);
    world.placeFurniture(x + 7, y - 1, T.CAMPFIRE); world.placeFurniture(x - 2, y - 1, T.CHEST);
    const inv = world.chests.get(idx(x - 2, y - 1)); if (inv) [['coin_gold', 3], ['bandit_blunderbuss', 1], ['musket_ball', 60], ['lesser_healing', 4]].forEach((it, i) => { inv[i] = makeStack(it[0], it[1], it[0] === 'bandit_blunderbuss' ? undefined : null); });
    st.camps.push({ x, y });
  }
};
ModLib.onWorldgen((world, rng) => { if (ModList.on('jimbos_desert')) { try { Jimbo.generate(world, rng); } catch (e) { console.error(e); } } });
// urns wake up when you get close, bandits ambush at camps, and the caravan visits the desert by day
ModLib.on('tick', (g) => {
  if (!ModList.on('jimbos_desert') || g.world.isSub) return; const s = g.world.modData && g.world.modData.jimbo; if (!s) return; const p = g.player, w = g.world;
  for (const u of s.urns) if (!u.woken && Math.abs(p.tileX - u.x) < 10 && Math.abs(p.tileY - u.y) < 6) { u.woken = true; const e = spawnEnemy('haunted_urn', u.x * TILE - 5, u.y * TILE - 20, g.expert); g.enemies.push(e); g.message('The urn rattles... something haunts it!', '#c0ffc0'); for (let k = 0; k < 2; k++) g.enemies.push(spawnEnemy('sand_wraith', u.x * TILE + rand(-60, 60), u.y * TILE - 40, g.expert)); }
  for (const c of s.camps) if (!c.raided && Math.abs(p.tileX - c.x) < 14 && Math.abs(p.tileY - c.y) < 8) { c.raided = true; g.message('Bandits! It was an ambush!', '#ffb060'); for (let k = 0; k < 3; k++) g.enemies.push(spawnEnemy('desert_bandit', (c.x + rand(-12, 12)) * TILE, (c.y - 6) * TILE, g.expert)); }
  const day = Math.floor(w.time / w.dayLength); const desert = w.biome[clamp(p.tileX, 0, w.w - 1)] === BIOME.DESERT;
  if (desert && w.isDay() && s.caravanDay !== day && p.tileY < w.surfaceLine && w.time % 300 === 0 && Math.random() < 0.35 && !g.npcs.some(n => n.role === 'Caravan Trader')) { s.caravanDay = day; const n = new NPC(p.cx + 300 * (Math.random() < 0.5 ? -1 : 1), p.y - 40, 'Caravan Trader', 'Caravan Trader'); n.leaveAt = w.time + Math.floor(w.dayLength / 3); g.npcs.push(n); g.message('A desert caravan has stopped nearby!', '#ffe0a0'); }
});
defTownNPC('Caravan Trader', ['Caravan Trader'], { skin: '#d0a070', hair: '#302010', shirt: '#e0c080', pants: '#806030', shoes: '#302010', eye: '#3a3a3a' }, () => false, ['The dunes are full of treasures, if you know where to dig.', 'My camel does not like slimes. Nor do I.', 'Fresh water, fine cloth and a few oddities - have a look.'], [{ id: 'sand', price: 5 }, { id: 'cactus', price: 15 }, { id: 'hardened_sand', price: 20 }, { id: 'sandstone_brick', price: 25 }, { id: 'scarab_shell', price: 400 }, { id: 'scorpion_stinger_item', price: 600 }, { id: 'urn_shard', price: 1500 }, { id: 'dune_hood', price: 8000 }, { id: 'dune_robe', price: 12000 }, { id: 'dune_wraps', price: 8000 }, { id: 'prickly_pear', price: 20000 }, { id: 'lesser_healing', price: 300 }], { town: false });
ModLib.patch(() => { const base = NPC.prototype.update; NPC.prototype.update = function (world, game) { base.call(this, world, game); if (this.role === 'Caravan Trader') { if (!this.leaveAt) this.leaveAt = world.time + Math.floor(world.dayLength / 3); if (world.time >= this.leaveAt && !this.dead) { this.dead = true; game.message('The caravan moves on.', '#c0c0ff'); } } }; });
ModList.current = null;
ModList.tagRole('Caravan Trader', 'jimbos_desert');
