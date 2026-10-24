// ---------------------------------------------------------------------------
// Vanilla enemies: the rest of Terraria's roster by biome, layer, weather and
// event, with their coin values and item drop tables, plus the spawn pools
// that put them in the world. AI comes from a handful of templates: Walker
// (humanoids), Beast (creatures), Flyer / Shooter, Slime, Swimmer, Charger,
// Caster (teleporting mages), Worm, Floater (passes through blocks) and
// Snatcher (rooted plants).
// ---------------------------------------------------------------------------
'use strict';

{
  // ---- AI templates ----------------------------------------------------------------------------------------------
  class Beast extends Walker { // a non-humanoid ground creature: body + legs + eye, sized by the def
    constructor(x, y, def) { super(x, y, def); this.w = def.w || 30; this.h = def.h || 22; this.weapon = null; this.armor = null; }
    draw(ctx, camX, camY) {
      this.drawShadowFlash(ctx); const d = this.def, x = snap(this.x - camX), y = snap(this.y - camY), w = this.w, h = this.h, t = this.walkPhase * Math.PI * 2;
      ctx.save(); ctx.translate(x + w / 2, y + h); if (this.dir < 0) ctx.scale(-1, 1);
      ctx.fillStyle = d.legColor || VAN.dark(d.color, 0.3); const legs = d.legs || 4; for (let i = 0; i < legs; i++) { const lx = -w / 2 + 4 + i * ((w - 8) / Math.max(1, legs - 1)); const lift = this.onGround && Math.abs(this.vx) > 0.2 ? Math.max(0, Math.sin(t + i * 1.7)) * 3 : 0; ctx.fillRect(lx - 2, -6 - lift, 4, 6 + lift); }
      ctx.fillStyle = d.color; if (d.round) { ctx.beginPath(); ctx.ellipse(0, -h / 2 - 2, w / 2, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill(); } else roundRect(ctx, -w / 2, -h - 2, w, h - 4, 5), ctx.fill();
      ctx.fillStyle = d.accent || VAN.light(d.color, 0.3); ctx.fillRect(-w / 2 + 3, -h + 1, w - 6, 2); if (d.spikes) for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 4 + i * (w - 8) / 3, -h - 2); ctx.lineTo(-w / 2 + 6 + i * (w - 8) / 3, -h - 8); ctx.lineTo(-w / 2 + 8 + i * (w - 8) / 3, -h - 2); ctx.fill(); }
      ctx.fillStyle = d.eye || '#ffffff'; ctx.fillRect(w / 2 - 8, -h + 3, 4, 3); ctx.fillStyle = '#000'; ctx.fillRect(w / 2 - 6, -h + 4, 2, 2);
      if (d.mouth) { ctx.fillStyle = '#e0e0e0'; for (let i = 0; i < 3; i++) ctx.fillRect(w / 2 - 12 + i * 4, -h / 2 - 1, 2, 3); }
      ctx.restore(); ctx.globalAlpha = 1;
    }
  }
  class Caster extends WalkerShooter { // teleports around, throws bolts (Dark Caster, Tim, Rune Wizard, Necromancer...)
    constructor(x, y, def) { super(x, y, def); this.weapon = null; this.armor = null; this.tp = randInt(120, 240); }
    ai(world, player, game) {
      super.ai(world, player, game);
      if (--this.tp <= 0) { this.tp = randInt(180, 300); for (let k = 0; k < 10; k++) { const tx = Math.floor(player.tileX + rand(-14, 14)), ty = Math.floor(player.tileY + rand(-8, 4)); let gy = ty; while (gy < world.h - 2 && !world.isSolidAt(tx, gy)) gy++; if (gy - ty > 8 || world.isSolidAt(tx, gy - 1) || world.isSolidAt(tx, gy - 2) || world.isSolidAt(tx, gy - 3)) continue; FX.burst(game, this.cx, this.cy, 8, this.def.bullet || '#c080ff', 2, 20); this.x = tx * TILE; this.y = (gy - 3) * TILE; this.vx = 0; this.vy = 0; FX.burst(game, this.cx, this.cy, 8, this.def.bullet || '#c080ff', 2, 20); break; } }
    }
  }
  class Floater extends Flyer { // passes through blocks (ghosts, wraiths, spirits)
    moveAndCollide(world) { this.x += this.vx; this.y += this.vy; this.onGround = false; this.collidedX = false; }
  }
  class Snatcher extends Enemy { // rooted plant that lunges on a vine (Man Eater, Snatcher, Angry Trapper, Clinger)
    constructor(x, y, def) { super(x, y, 26, 26, def); this.rootX = x + 13; this.rootY = y + 26; this.reach = (def.reach || 7) * TILE; this.flying = true; this.kbResist = 1; this.ang = 0; }
    ai(world, player, game) {
      const dx = player.cx - this.rootX, dy = player.cy - this.rootY, d = Math.hypot(dx, dy) || 1;
      const tx = this.rootX + dx / d * Math.min(this.reach, d), ty = this.rootY + dy / d * Math.min(this.reach, d);
      const wob = Math.sin(this.t * 0.1) * 8; this.vx = ((tx - this.cx) * 0.06 + wob * 0.02) * this.slowFactor; this.vy = ((ty - this.cy) * 0.06) * this.slowFactor;
      this.x += this.vx; this.y += this.vy; this.dir = dx < 0 ? -1 : 1; this.onGround = false;
      if (this.def.spits && this.t % (this.def.rate || 90) === 0 && d < 25 * TILE) { const b = Gensokyo.bullet(game, this.cx, this.cy, dx / d * 5, dy / d * 5, { owner: this, color: this.def.bullet || '#80ff40', hi: '#fff', damage: Math.round(this.damage * 0.8) }); if (b && this.def.onHitBuff) b.onHitBuff = this.def.onHitBuff; }
    }
    draw(ctx, camX, camY) {
      this.drawShadowFlash(ctx); const x = snap(this.cx - camX), y = snap(this.cy - camY), rx = snap(this.rootX - camX), ry = snap(this.rootY - camY);
      ctx.strokeStyle = this.def.vine || '#2a7a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo((rx + x) / 2 + Math.sin(this.t * 0.1) * 12, (ry + y) / 2, x, y); ctx.stroke();
      ctx.fillStyle = this.def.color; ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e0e0e0'; const open = 4 + Math.sin(this.t * 0.2) * 3; for (let i = 0; i < 4; i++) { ctx.fillRect(x - 8 + i * 5, y - open - 2, 3, 3); ctx.fillRect(x - 8 + i * 5, y + open - 1, 3, 3); } ctx.fillStyle = '#000'; ctx.fillRect(x - 6, y - 1, 12, 2); ctx.globalAlpha = 1;
    }
  }
  const wormClass = (o) => class extends Worm { constructor(x, y, def) { super(x, y, Object.assign({ name: def.name, hp: def.hp, damage: def.damage, defense: def.defense, drops: def.drops, blood: def.blood }, o)); this.needSegs = true; this.type = o.type; } update(world, game) { if (this.needSegs) { this.needSegs = false; this.spawnSegments(game); } super.update(world, game); } };

  const E = (type, def, coins) => { if (!ENEMY_DEFS[type]) ENEMY_DEFS[type] = def; else Object.assign(ENEMY_DEFS[type], def); delete ENEMY_DEFS[type].mod; if (coins != null) ENEMY_COINS[type] = coins; return ENEMY_DEFS[type]; };
  const D = (id, chance, min, max) => ({ id, chance, min: min || 1, max: max || min || 1 });
  const H = (skin, hair, shirt, pants, shoes, eye) => ({ skin, hair, shirt, pants, shoes, eye: eye || '#000' });
  const WALK_ = (name, hp, dmg, def, speed, colors, drops, extra) => Object.assign({ name, cls: Walker, hp, damage: dmg, defense: def, speed, colors, blood: colors.shirt, drops }, extra || {});
  const BEAST = (name, hp, dmg, def, speed, color, drops, extra) => Object.assign({ name, cls: Beast, hp, damage: dmg, defense: def, speed, color, blood: color, drops, armed: false, colors: H(color, color, color, color, color) }, extra || {});
  const FLY_ = (name, hp, dmg, def, kind, color, drops, extra) => Object.assign({ name, cls: Flyer, hp, damage: dmg, defense: def, kind, w: 24, h: 20, color, blood: color, drops }, extra || {});
  const SLIME = (name, hp, dmg, def, color, drops, extra) => Object.assign({ name, cls: Slime, hp, damage: dmg, defense: def, color, blood: color, drops: [D('gel', 1, 1, 3), ...(drops || [])] }, extra || {});
  const zom = H('#8ab070', '#3a3a2a', '#4a4a5a', '#3a3040', '#2a2020', '#c02020');

  // ---- surface & forest ------------------------------------------------------------------------------------------
  E('pinky', SLIME('Pinky', 150, 5, 5, 'rgba(255,150,220,1)', [D('pink_gel', 1, 1, 3), D('slime_staff', 0.01)], { w: 14, h: 10, kbResist: 0.3 }), 15000);
  E('yellow_slime', SLIME('Yellow Slime', 45, 15, 7, 'rgba(230,200,60,1)', []), 100);
  E('black_slime', SLIME('Black Slime', 45, 15, 4, 'rgba(60,60,70,1)', [D('blindfold', 0.01)]), 100);
  E('umbrella_slime', SLIME('Umbrella Slime', 40, 12, 5, 'rgba(80,140,220,1)', [D('umbrella', 0.02)]), 100);
  E('spiked_ice_slime', SLIME('Spiked Ice Slime', 60, 18, 8, 'rgba(160,220,255,1)', [D('ice', 0.5, 2, 6)], { spiky: true }), 120);
  E('spiked_jungle_slime', SLIME('Spiked Jungle Slime', 70, 22, 10, 'rgba(90,190,70,1)', [D('jungle_spores', 0.3)]), 150);
  E('dungeon_slime', SLIME('Dungeon Slime', 150, 30, 12, 'rgba(60,80,160,1)', [D('golden_key', 1)], { w: 34, h: 24 }), 1000);
  E('toxic_sludge', SLIME('Toxic Sludge', 200, 50, 18, 'rgba(90,200,60,1)', [D('bezoar', 0.02)], { w: 30, h: 22, onHitBuff: 'Poisoned' }), 600);
  E('corrupt_slime', SLIME('Corrupt Slime', 210, 40, 12, 'rgba(120,80,200,1)', [D('blindfold', 0.01), D('vitamins', 0.01)], { w: 36, h: 26 }), 600);
  E('crimslime', SLIME('Crimslime', 180, 50, 12, 'rgba(200,50,70,1)', [D('purple_mucus', 0.5)], { w: 36, h: 26 }), 600);
  E('illuminant_slime', SLIME('Illuminant Slime', 180, 45, 14, 'rgba(240,170,255,1)', [D('pixie_dust', 0.3)], { w: 30, h: 22 }), 600);
  E('rainbow_slime', SLIME('Rainbow Slime', 400, 60, 20, 'rgba(255,120,220,1)', [D('rainbow_brick', 1, 20, 49)], { w: 40, h: 30 }), 2000);
  E('slimer', FLY_('Slimer', 60, 40, 12, 'bat', 'rgba(120,80,200,0.95)', [D('gel', 1, 1, 3)], { w: 24, h: 20, speed: 3.5, erratic: true }), 600);
  E('zombie_eskimo', WALK_('Zombie Eskimo', 62, 15, 7, 1.0, H('#8ab070', '#3a3a2a', '#c0d8f0', '#a0b8d0', '#2a2020', '#c02020'), [D('eskimo_hood', 0.01), D('eskimo_coat', 0.01), D('eskimo_pants', 0.01), D('rotten_chunk', 0.35)]), 60);
  E('raincoat_zombie', WALK_('Raincoat Zombie', 50, 14, 8, 1.0, H('#8ab070', '#3a3a2a', '#e0c040', '#c0a020', '#2a2020', '#c02020'), [D('rotten_chunk', 0.35), D('umbrella', 0.01)]), 60);
  E('blood_zombie', WALK_('Blood Zombie', 220, 34, 12, 1.4, H('#c03030', '#3a3a2a', '#a02020', '#801818', '#2a2020', '#ffe060'), [D('shark_tooth_necklace', 0.02), D('bloody_tear', 0.005)]), 150);
  E('drippler', FLY_('Drippler', 180, 32, 10, 'eye', '#c03030', [D('shark_tooth_necklace', 0.02), D('drippler_crippler', 0.01)], { w: 26, h: 26, speed: 3, erratic: true }), 150);
  E('the_groom', WALK_('The Groom', 60, 16, 8, 1.1, H('#8ab070', '#202020', '#202028', '#202028', '#101010', '#c02020'), [D('top_hat', 0.5), D('tuxedo_shirt', 0.5), D('tuxedo_pants', 0.5)]), 100);
  E('the_bride', WALK_('The Bride', 60, 16, 8, 1.1, H('#8ab070', '#ffffff', '#f0f0f0', '#f0f0f0', '#e0e0e0', '#c02020'), [D('rotten_chunk', 0.35)]), 100);
  E('clown', WALK_('Clown', 350, 40, 16, 1.2, H('#f2c6a0', '#ff4040', '#ffe040', '#4080ff', '#e04040', '#000'), [D('bananarang', 0.05), D('clown_hat', 0.1)], { cls: WalkerShooter, bulletName: 'grenade' }), 5000);
  for (const [type, name, col] of [['cataract_eye', 'Cataract Eye', '#d0d0d0'], ['sleepy_eye', 'Sleepy Eye', '#c0c0e0'], ['dilated_eye', 'Dilated Eye', '#e0e0e0'], ['green_eye', 'Green Eye', '#80c080'], ['purple_eye', 'Purple Eye', '#c080e0']]) E(type, FLY_(name, 60, 18, 2, 'eye', col, [D('lens', 0.33), D('black_lens', 0.01)], { w: 22, h: 22, speed: 3 }), 75);
  E('wandering_eye', FLY_('Wandering Eye', 280, 45, 20, 'eye', '#e0e0e0', [D('black_lens', 0.02), D('lens', 0.5)], { w: 30, h: 30, speed: 3.5 }), 500);
  E('goblin_scout', WALK_('Goblin Scout', 40, 20, 6, 1.3, H('#7ab060', '#3a3a2a', '#804020', '#5a3010', '#2a2020', '#000'), [D('tattered_cloth', 0.5, 1, 3)], { armed: false }), 100);
  E('harpy', Object.assign(FLY_('Harpy', 100, 25, 8, 'eye', '#e8d8a8', [D('feather', 0.5, 1, 3), D('giant_harpy_feather', 0.005)], { w: 30, h: 30, speed: 3.2 }), { cls: Shooter, rate: 90, bullet: '#e8d8a8', bulletName: 'feather' }), 500);
  E('wyvern', { name: 'Wyvern', cls: wormClass({ segments: 14, speed: 6, size: 30, head: '#e0e8f0', body: '#c0c8d8', ghost: true, type: 'wyvern' }), hp: 4000, damage: 50, defense: 10, blood: '#c0c8d8', drops: [D('soul_of_flight', 1, 5, 10)] }, 5000);
  E('flying_fish', FLY_('Flying Fish', 30, 18, 6, 'eye', '#60a0e0', [D('umbrella', 0.02)], { w: 26, h: 16, speed: 4, erratic: true }), 100);
  E('angry_nimbus', Object.assign(FLY_('Angry Nimbus', 300, 30, 20, 'eye', '#8090a8', [D('nimbus_rod', 0.15)], { w: 40, h: 30, speed: 2.5 }), { cls: Shooter, rate: 40, bullet: '#60a0ff', bulletSpeed: 6 }), 2000);
  E('angry_dandelion', Object.assign(FLY_('Angry Dandelion', 60, 12, 2, 'eye', '#f0f0e0', [D('daybloom_seeds', 0.5, 1, 2)], { w: 24, h: 24, speed: 2.5 }), { cls: Shooter, rate: 100, bullet: '#f0f0e0' }), 100);
  E('werewolf', WALK_('Werewolf', 500, 60, 30, 2.6, H('#606068', '#404048', '#505058', '#404048', '#303038', '#ffe060'), [D('moon_charm', 0.017), D('adhesive_bandage', 0.01), D('lupine_charm', 0.005)], { armed: false }), 800);
  E('mimic', Object.assign(BEAST('Mimic', 500, 80, 30, 2.2, '#9a6a3c', [D('dual_hook', 0.14), D('magic_dagger', 0.14), D('titan_glove', 0.14), D('philosophers_stone', 0.14), D('star_cloak', 0.14), D('cross_necklace', 0.14)], { w: 32, h: 32, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 7 }), 3000);
  E('hallowed_mimic', Object.assign(BEAST('Hallowed Mimic', 3500, 90, 34, 2.4, '#e0c0ff', [D('daedalus_stormbow', 0.25), D('flying_knife', 0.25), D('crystal_vile_shard', 0.25), D('illuminant_hook', 0.25)], { w: 40, h: 40, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 8 }), 15000);
  E('corrupt_mimic', Object.assign(BEAST('Corrupt Mimic', 3500, 90, 34, 2.4, '#6a4a90', [D('dart_pistol', 0.25), D('worm_hook', 0.25), D('chain_guillotines', 0.25), D('clinger_staff', 0.25), D('putrid_scent', 0.25)], { w: 40, h: 40, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 8 }), 15000);
  E('crimson_mimic', Object.assign(BEAST('Crimson Mimic', 3500, 90, 34, 2.4, '#a03040', [D('dart_rifle', 0.25), D('tendon_hook', 0.25), D('fetid_baghnakhs', 0.25), D('life_drain', 0.25), D('flesh_knuckles', 0.25)], { w: 40, h: 40, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 8 }), 15000);
  E('ice_mimic', Object.assign(BEAST('Ice Mimic', 500, 80, 30, 2.2, '#a0d8f0', [D('frostbrand', 0.2), D('ice_bow', 0.2), D('flower_of_frost', 0.2), D('toolbox', 0.2), D('frost_staff', 0.2)], { w: 32, h: 32, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 7 }), 3000);

  // ---- desert ------------------------------------------------------------------------------------------------------
  E('vulture', FLY_('Vulture', 60, 20, 8, 'bat', '#404048', [D('feather', 0.1)], { w: 30, h: 24, speed: 3 }), 100);
  E('tomb_crawler', { name: 'Tomb Crawler', cls: wormClass({ segments: 7, speed: 3.5, size: 22, head: '#c0a060', body: '#a08040', type: 'tomb_crawler' }), hp: 100, damage: 18, defense: 6, blood: '#c0a060', drops: [D('antlion_mandible', 0.3), D('ancient_chisel', 0.02)] }, 200);
  E('dune_splicer', { name: 'Dune Splicer', cls: wormClass({ segments: 12, speed: 5, size: 26, head: '#a08040', body: '#806030', type: 'dune_splicer' }), hp: 1200, damage: 60, defense: 26, blood: '#a08040', drops: [D('antlion_mandible', 0.5, 1, 3), D('ancient_chisel', 0.05)] }, 2000);
  E('sand_poacher', BEAST('Sand Poacher', 70, 24, 10, 2.4, '#d0b070', [D('antlion_mandible', 0.3)], { w: 30, h: 16, legs: 6, spikes: true }), 150);
  E('ghoul', WALK_('Ghoul', 220, 50, 14, 1.6, H('#c0b090', '#a09070', '#b0a080', '#908060', '#605040', '#ff4040'), [D('ancient_cloth', 0.1), D('bandage', 0)].filter(d => d.chance > 0)), 600);
  E('dark_mummy', WALK_('Dark Mummy', 250, 60, 22, 1.7, H('#5a4a7a', '#5a4a7a', '#4a3a6a', '#3a2a5a', '#2a1a4a', '#ffe060'), [D('dark_shard', 0.2), D('blindfold', 0.01), D('megaphone', 0.01), D('mummy_bandage', 0.4, 1, 3)]), 800);
  E('light_mummy', WALK_('Light Mummy', 250, 60, 22, 1.7, H('#f0e8d0', '#f0e8d0', '#e0d8c0', '#d0c8b0', '#c0b8a0', '#4080ff'), [D('light_shard', 0.2), D('trifold_map', 0.01), D('mummy_bandage', 0.4, 1, 3)]), 800);
  E('sand_elemental', Object.assign(FLY_('Sand Elemental', 3000, 65, 30, 'eye', '#e0c080', [D('forbidden_fragment', 1, 1, 2), D('djinns_curse', 0.1)], { w: 40, h: 50, speed: 3 }), { cls: Shooter, rate: 50, bullet: '#e0c080', bulletSpeed: 7 }), 5000);
  E('basilisk', Object.assign(BEAST('Basilisk', 2500, 60, 30, 2.6, '#c0a060', [D('ancient_horn', 0.02), D('antlion_mandible', 0.5, 1, 3)], { w: 40, h: 28, legs: 4, spikes: true }), { cls: Charger, chargeSpeed: 9 }), 3000);
  E('desert_spirit', Object.assign(FLY_('Desert Spirit', 400, 70, 32, 'eye', 'rgba(140,200,240,0.85)', [D('spirit_flame', 0.02), D('djinns_curse', 0.02)], { w: 30, h: 40, speed: 3 }), { cls: Floater }), 1500);
  E('lamia', WALK_('Lamia', 500, 55, 24, 2.0, H('#e0c0a0', '#202020', '#c0a040', '#a08030', '#806020', '#000'), [D('lamia_tail', 0.02), D('ancient_cloth', 0.1)], { armed: false }), 1500);
  E('sand_shark', Object.assign(BEAST('Sand Shark', 500, 60, 24, 3.2, '#c8b080', [D('bone_sword', 0)].filter(d => d.chance > 0), { w: 44, h: 22, legs: 0, mouth: true }), { cls: Charger, chargeSpeed: 9 }), 1500);
  E('angry_tumbler', BEAST('Angry Tumbler', 40, 20, 4, 3.0, '#a08040', [], { w: 22, h: 22, legs: 0, round: true }), 60);
  VAN.item('djinns_curse', "Djinn's Curse", { armor: 'legs', defense: 0, vanity: true, max: 1, rarity: 5, tooltip: 'Vanity legs: you float. Dropped by Desert Spirits and Sand Elementals', icon: { kind: 'greaves', mat: VAN.palette('djinn', '#e0c080') } }, 50000);
  VAN.item('lamia_tail', 'Lamia Tail', { armor: 'legs', defense: 0, vanity: true, max: 1, rarity: 4, tooltip: 'Vanity: a serpent tail', icon: { kind: 'greaves', mat: VAN.palette('lamia', '#c0a040') } }, 30000);

  // ---- snow ----------------------------------------------------------------------------------------------------------
  E('snow_flinx', BEAST('Snow Flinx', 70, 22, 8, 1.8, '#a0e0ff', [D('flinx_fur', 0.6, 1, 2), D('snowball_launcher', 0.01)], { w: 26, h: 22, legs: 4 }), 150);
  E('ice_elemental', Object.assign(FLY_('Ice Elemental', 400, 60, 28, 'eye', 'rgba(180,230,255,0.85)', [D('frost_staff', 0.02), D('frost_core', 0.25)], { w: 30, h: 40, speed: 3 }), { cls: Shooter, rate: 60, bullet: '#a0e0ff' }), 1000);
  E('icy_merman', WALK_('Icy Merman', 400, 55, 26, 1.7, H('#80c0e0', '#60a0c0', '#60a0c0', '#4080a0', '#306080', '#ffe060'), [D('frost_core', 0.25), D('frost_staff', 0.02)], { cls: WalkerShooter, armed: false, bulletName: 'frost' }), 1000);
  E('wolf', Object.assign(BEAST('Wolf', 400, 60, 24, 3.0, '#606068', [D('lilith_necklace', 0.005), D('adhesive_bandage', 0.01)], { w: 40, h: 26, legs: 4, mouth: true }), { cls: Charger, chargeSpeed: 8 }), 600);
  E('ice_golem', Object.assign(BEAST('Ice Golem', 4000, 80, 32, 1.4, '#a0d8f0', [D('frost_core', 1, 2, 4), D('ice_feather', 0.33)], { w: 44, h: 60, legs: 2, accent: '#ffffff' }), { cls: WalkerShooter, bulletName: 'frost' }), 6000);
  VAN.material('ice_feather', 'Ice Feather', '#a0e0ff', { shape: 'feather', rarity: 5, value: 10000, tooltip: 'Dropped by Ice Golems' }); VAN.recipe('frozen_wings', 1, 'mythril_anvil', [['soul_of_flight', 20], ['ice_feather', 1]]);
  E('armored_viking', WALK_('Armored Viking', 500, 60, 34, 1.5, H('#c0a080', '#e0c080', '#8a8a92', '#7a7a82', '#5a5a62', '#000'), [D('ice_sickle', 0.01), D('viking_helmet', 0.02)]), 800);
  E('cyan_beetle', BEAST('Cyan Beetle', 40, 18, 8, 1.4, '#40c0e0', [D('cyan_husk', 0.5)], { w: 22, h: 14, legs: 6 }), 100);
  E('pigron', Object.assign(BEAST('Pigron', 600, 60, 26, 2.8, '#e0a0c0', [D('bacon', 0.3)], { w: 40, h: 30, legs: 4 }), { cls: Charger, chargeSpeed: 9 }), 2000);
  VAN.material('cyan_husk', 'Cyan Husk', '#40c0e0', { shape: 'shell', value: 100, tooltip: 'Dye material: Cyan Dye' });

  // ---- jungle ------------------------------------------------------------------------------------------------------------
  E('man_eater', { name: 'Man Eater', cls: Snatcher, hp: 60, damage: 40, defense: 8, color: '#a03030', vine: '#2a7a2a', blood: '#a03030', drops: [D('vine', 0.5), D('jungle_spores', 0.3)] }, 200);
  E('snatcher', { name: 'Snatcher', cls: Snatcher, hp: 40, damage: 20, defense: 4, color: '#8a4a20', vine: '#2a6a2a', blood: '#8a4a20', drops: [D('vine', 0.3)], reach: 6 }, 100);
  E('angry_trapper', { name: 'Angry Trapper', cls: Snatcher, hp: 300, damage: 80, defense: 26, color: '#c04040', vine: '#2a7a2a', blood: '#c04040', drops: [D('uzi', 0.01), D('vine', 0.5), D('jungle_spores', 0.4)], reach: 9 }, 1000);
  E('piranha', Object.assign(FLY_('Piranha', 30, 25, 4, 'bat', '#80a0a0', [D('hook', 0.05)], { w: 22, h: 14, speed: 4 }), { cls: Swimmer }), 100);
  E('arapaima', Object.assign(FLY_('Arapaima', 400, 60, 22, 'bat', '#6080a0', [D('shark_fin', 0.3)], { w: 50, h: 22, speed: 5 }), { cls: Swimmer }), 1000);
  E('doctor_bones', WALK_('Doctor Bones', 80, 22, 10, 1.4, H('#e8e8e0', '#e8e8e0', '#a06030', '#5a3010', '#2a2020', '#000'), [D('archaeologists_hat', 0.5), D('archaeologists_jacket', 0.5), D('archaeologists_pants', 0.5)]), 300);
  E('jungle_creeper', BEAST('Jungle Creeper', 240, 60, 24, 2.6, '#3a8a3a', [D('spider_fang', 0.5, 1, 3)], { w: 30, h: 18, legs: 8 }), 600);
  E('giant_tortoise', Object.assign(BEAST('Giant Tortoise', 470, 70, 40, 1.0, '#4a8a4a', [D('turtle_shell', 0.06)], { w: 44, h: 30, legs: 4, kbResist: 0.8 }), { cls: Charger, chargeSpeed: 10 }), 1500);
  E('moth', FLY_('Moth', 100, 40, 12, 'bat', '#e0a0ff', [D('butterfly_dust', 0.05)], { w: 26, h: 20, speed: 3, erratic: true }), 500);
  E('moss_hornet', Object.assign(FLY_('Moss Hornet', 210, 60, 26, 'eye', '#80c040', [D('stinger', 0.66), D('tattered_bee_wing', 0.01), D('bezoar', 0.01)], { w: 30, h: 22 }), { cls: Shooter, rate: 80, bullet: '#80c040', bulletName: 'stinger' }), 800);
  E('derpling', Object.assign(BEAST('Derpling', 240, 50, 20, 2.4, '#60a0e0', [D('jungle_spores', 0.3)], { w: 28, h: 26, legs: 6 }), { cls: Charger, chargeSpeed: 8 }), 600);
  E('lac_beetle', BEAST('Lac Beetle', 40, 18, 8, 1.4, '#c04040', [D('violet_husk', 0.5)], { w: 22, h: 14, legs: 6 }), 100);
  E('lihzahrd', WALK_('Lihzahrd', 550, 60, 40, 1.8, H('#c0a050', '#a08040', '#a08040', '#806030', '#604020', '#ffe060'), [D('lihzahrd_power_cell', 0.02), D('lizard_egg', 0.01)], { armed: false }), 2000);
  E('flying_snake', FLY_('Flying Snake', 350, 60, 30, 'bat', '#c0a050', [D('lihzahrd_power_cell', 0.02)], { w: 34, h: 20, speed: 4 }), 2000);
  VAN.material('violet_husk', 'Violet Husk', '#c04040', { shape: 'shell', value: 100, tooltip: 'Dye material: Violet Dye' });
  for (const [id, name, slot] of [['archaeologists_hat', "Archaeologist's Hat", 'head'], ['archaeologists_jacket', "Archaeologist's Jacket", 'body'], ['archaeologists_pants', "Archaeologist's Pants", 'legs']]) VAN.item(id, name, { armor: slot, defense: 0, vanity: true, max: 1, rarity: 1, tooltip: 'Vanity. Dropped by Doctor Bones', icon: { kind: slot === 'head' ? 'helmet' : slot === 'body' ? 'chainmail' : 'greaves', mat: VAN.palette('archaeologist', '#a06030') } }, 5000);
  VAN.item('clown_hat', 'Clown Hat', { armor: 'head', defense: 0, vanity: true, max: 1, rarity: 1, tooltip: 'Vanity. Dropped by Clowns', icon: { kind: 'helmet', mat: VAN.palette('clown', '#ff4040') } }, 5000);

  // ---- corruption / crimson (hardmode) -------------------------------------------------------------------------------
  E('world_feeder', { name: 'World Feeder', cls: wormClass({ segments: 12, speed: 5, size: 26, head: '#5a3a8a', body: '#4a2a7a', type: 'world_feeder' }), hp: 800, damage: 60, defense: 20, blood: '#7050a0', drops: [D('rotten_chunk', 0.5, 1, 3), D('cursed_flame', 0.3)] }, 1500);
  E('clinger', { name: 'Clinger', cls: Snatcher, hp: 300, damage: 60, defense: 24, color: '#6a4a90', vine: '#4a3a6a', blood: '#7050a0', drops: [D('clinger_staff', 0.05), D('cursed_flame', 0.5, 1, 3)], reach: 9, spits: true, bullet: '#80ff40', onHitBuff: 'Cursed Inferno' }, 1000);
  E('cursed_hammer', FLY_('Cursed Hammer', 340, 85, 20, 'eye', '#8060c0', [D('nazar', 0.01), D('cursed_flame', 0.5)], { w: 34, h: 34, speed: 4 }), 1000);
  E('crimson_axe', FLY_('Crimson Axe', 340, 85, 20, 'eye', '#c03040', [D('nazar', 0.01), D('ichor', 0.5)], { w: 34, h: 34, speed: 4 }), 1000);
  E('enchanted_sword', FLY_('Enchanted Sword', 340, 85, 20, 'eye', '#e0c0ff', [D('nazar', 0.01), D('pixie_dust', 0.5)], { w: 34, h: 34, speed: 4 }), 1000);
  E('ichor_sticker', Object.assign(FLY_('Ichor Sticker', 800, 50, 30, 'eye', '#e0c040', [D('ichor', 0.5, 1, 3), D('golden_shower', 0)].filter(d => d.chance > 0), { w: 40, h: 40, speed: 2.5 }), { cls: Shooter, rate: 50, bullet: '#ffe060', bulletSpeed: 7 }), 1500);
  E('floaty_gross', Object.assign(FLY_('Floaty Gross', 350, 60, 22, 'eye', 'rgba(220,120,140,0.9)', [D('vitamins', 0.01), D('vertebra', 0.5)], { w: 36, h: 36, speed: 2.8 }), { cls: Floater }), 1000);
  E('blood_feeder', Object.assign(FLY_('Blood Feeder', 200, 40, 20, 'bat', '#c03040', [D('vertebra', 0.5)], { w: 26, h: 16, speed: 4 }), { cls: Swimmer }), 500);
  E('blood_jelly', Object.assign(FLY_('Blood Jelly', 250, 50, 20, 'eye', 'rgba(220,60,80,0.8)', [D('jellyfish_necklace', 0.01)], { w: 26, h: 26, speed: 2 }), { cls: Swimmer }), 500);
  E('big_eater', FLY_('Big Eater', 70, 30, 12, 'eye', '#7050a0', [D('rotten_chunk', 0.6)], { w: 38, h: 28, speed: 3.4 }), 150);
  E('little_eater', FLY_('Little Eater', 25, 15, 5, 'eye', '#7050a0', [D('rotten_chunk', 0.4)], { w: 22, h: 16, speed: 3.8 }), 50);
  E('vile_ghoul', WALK_('Vile Ghoul', 220, 55, 14, 1.6, H('#8060a0', '#6a4a8a', '#7050a0', '#5a3a80', '#3a2a5a', '#ffe060'), [D('ancient_cloth', 0.1), D('cursed_flame', 0.3)]), 600);
  E('tainted_ghoul', WALK_('Tainted Ghoul', 220, 55, 14, 1.6, H('#c04050', '#a03040', '#b03040', '#802030', '#501020', '#ffe060'), [D('ancient_cloth', 0.1), D('ichor', 0.3)]), 600);
  E('dark_caster', Object.assign(WALK_('Dark Caster', 80, 26, 8, 1.2, H('#8ab070', '#2a1a4a', '#3a2a6a', '#2a1a4a', '#1a1030', '#ff4040'), [D('ancient_cloth', 0.3), D('golden_key', 0.15)], { armed: false }), { cls: Caster, bullet: '#c080ff', rate: 100 }), 400);
  E('tim', Object.assign(WALK_('Tim', 200, 30, 12, 1.2, H('#f2c6a0', '#e0e0e0', '#4040c0', '#3030a0', '#202080', '#000'), [D('wizard_hat', 1)], { armed: false }), { cls: Caster, bullet: '#60a0ff', rate: 80 }), 2000);
  E('rune_wizard', Object.assign(WALK_('Rune Wizard', 300, 60, 30, 1.2, H('#f2c6a0', '#e0e0e0', '#6040a0', '#503090', '#402080', '#000'), [D('rune_hat', 1), D('rune_robe', 1)], { armed: false }), { cls: Caster, bullet: '#c060ff', rate: 60 }), 5000);
  E('nymph', WALK_('Nymph', 300, 35, 20, 1.6, H('#f2c6a0', '#40c040', '#60a060', '#408040', '#306030', '#000'), [D('metal_detector', 0.5)], { armed: false }), 2000);
  E('undead_miner', WALK_('Undead Miner', 70, 15, 6, 1.1, H('#8ab070', '#3a3a2a', '#8a6038', '#5a4020', '#2a2020', '#c02020'), [D('mining_helmet', 0.05), D('mining_shirt', 0.05), D('mining_pants', 0.05), D('bone_pickaxe', 0.02), D('rotten_chunk', 0.3)]), 100);
  E('giant_worm', { name: 'Giant Worm', cls: wormClass({ segments: 8, speed: 3.5, size: 22, head: '#8a6a3a', body: '#7a5a2a', type: 'giant_worm' }), hp: 30, damage: 12, defense: 4, blood: '#8a6a3a', drops: [D('worm_tooth', 0.4)] }, 60);
  E('digger', { name: 'Digger', cls: wormClass({ segments: 10, speed: 5, size: 24, head: '#a08050', body: '#806040', type: 'digger' }), hp: 200, damage: 40, defense: 12, blood: '#a08050', drops: [D('worm_tooth', 0.5, 1, 2)] }, 500);
  E('bone_serpent', { name: 'Bone Serpent', cls: wormClass({ segments: 12, speed: 5, size: 28, head: '#e8e8e0', body: '#c8c8c0', type: 'bone_serpent' }), hp: 300, damage: 30, defense: 20, blood: '#e8e8e0', drops: [D('bone', 0.5, 2, 5)] }, 800);
  E('cave_bat', FLY_('Cave Bat', 16, 16, 2, 'bat', '#4a3a5a', [D('chain_knife', 0.005), D('depth_meter', 0.01)], { w: 20, h: 14, speed: 3.6, erratic: true }), 60);
  E('giant_bat', FLY_('Giant Bat', 200, 50, 20, 'bat', '#5a3a6a', [D('trifold_map', 0.01), D('bat_bat', 0.01)], { w: 30, h: 22, speed: 4, erratic: true }), 500);
  E('lava_bat', FLY_('Lava Bat', 250, 60, 22, 'bat', '#ff6020', [D('magma_stone', 0.02), D('bat_bat', 0.01)], { w: 30, h: 22, speed: 4, erratic: true }), 600);
  E('red_devil', Object.assign(FLY_('Red Devil', 3000, 90, 44, 'eye', '#c02020', [D('unholy_trident', 0.03), D('fire_feather', 0.02), D('demon_scythe', 0.05)], { w: 40, h: 54, speed: 3 }), { cls: Shooter, rate: 60, bullet: '#ff4040', bulletSpeed: 7 }), 8000);
  E('armored_skeleton', WALK_('Armored Skeleton', 280, 50, 36, 1.5, H('#e8e8e0', '#e8e8e0', '#8a8a92', '#7a7a82', '#5a5a62', '#000'), [D('armor_polish', 0.01), D('beam_sword', 0.004), D('bone', 0.5, 1, 3)]), 600);
  E('skeleton_archer', Object.assign(WALK_('Skeleton Archer', 200, 30, 22, 1.4, H('#e8e8e0', '#e8e8e0', '#6a5a4a', '#5a4a3a', '#3a2a1a', '#000'), [D('marrow', 0.01), D('magic_quiver', 0.02), D('bone', 0.5, 1, 3)]), { cls: WalkerShooter, bulletName: 'arrow' }), 600);
  E('black_recluse', BEAST('Black Recluse', 350, 60, 24, 2.4, '#202028', [D('spider_fang', 0.5, 1, 3), D('poison_staff', 0.01)], { w: 34, h: 20, legs: 8, onHitBuff: 'Venom' }), 800);
  E('jellyfish_blue', Object.assign(FLY_('Blue Jellyfish', 70, 25, 8, 'eye', 'rgba(80,140,255,0.8)', [D('jellyfish_necklace', 0.01), D('glowstick', 0.5, 1, 4)], { w: 22, h: 26, speed: 2 }), { cls: Swimmer }), 100);
  E('jellyfish_green', Object.assign(FLY_('Green Jellyfish', 280, 60, 20, 'eye', 'rgba(80,255,140,0.8)', [D('jellyfish_necklace', 0.01), D('megaphone', 0.01)], { w: 26, h: 30, speed: 2.5 }), { cls: Swimmer }), 800);
  E('crawdad', BEAST('Crawdad', 90, 25, 10, 1.4, '#c06040', [D('shrimp', 0.3)], { w: 30, h: 16, legs: 6 }), 150);
  E('salamander', BEAST('Salamander', 80, 22, 8, 1.6, '#e0a040', [], { w: 30, h: 14, legs: 4 }), 150);
  E('giant_shelly', BEAST('Giant Shelly', 120, 30, 20, 0.9, '#a0a0a8', [], { w: 30, h: 22, legs: 4, kbResist: 0.7 }), 200);
  E('cochineal_beetle', BEAST('Cochineal Beetle', 40, 18, 8, 1.4, '#e04040', [D('red_husk', 0.5)], { w: 22, h: 14, legs: 6 }), 100);
  E('rock_golem', Object.assign(BEAST('Rock Golem', 500, 60, 34, 1.0, '#6a6a72', [D('stone', 1, 10, 30)], { w: 36, h: 48, legs: 2, kbResist: 0.9 }), { cls: Charger, chargeSpeed: 6 }), 800);
  VAN.material('red_husk', 'Red Husk', '#e04040', { shape: 'shell', value: 100, tooltip: 'Dye material: Red Husk Dye' });
  VAN.item('glowstick', 'Glowstick', { max: 999, consumable: true, tooltip: 'Throw it for light, even underwater', drawIcon: VAN.icon('candle', '#60ff60'), thrown: true, damage: 0, useTime: 20, color: '#60ff60', use: (g, s, i) => VAN.throwUse(g, s, i) }, 10);
  for (const [id, name, slot] of [['rune_hat', 'Rune Hat', 'head'], ['rune_robe', 'Rune Robe', 'body']]) VAN.item(id, name, { armor: slot, defense: 0, vanity: true, max: 1, rarity: 2, tooltip: 'Vanity. Dropped by the Rune Wizard', icon: { kind: slot === 'head' ? 'helmet' : 'chainmail', mat: VAN.palette('rune', '#6040a0') } }, 10000);

  // ---- dungeon (hardmode) --------------------------------------------------------------------------------------------
  E('blue_armored_bones', WALK_('Blue Armored Bones', 400, 60, 40, 1.6, H('#e8e8e0', '#e8e8e0', '#4060c0', '#3050a0', '#203080', '#000'), [D('magnet_sphere', 0.02), D('armor_polish', 0.01), D('bone_feather', 0.005), D('ectoplasm', 0.3), D('bone', 0.5, 2, 5)]), 1500);
  E('rusty_armored_bones', WALK_('Rusty Armored Bones', 400, 60, 40, 1.6, H('#e8e8e0', '#e8e8e0', '#a06030', '#805020', '#604010', '#000'), [D('adhesive_bandage', 0.01), D('bone_feather', 0.005), D('ectoplasm', 0.3), D('bone', 0.5, 2, 5)]), 1500);
  E('hell_armored_bones', WALK_('Hell Armored Bones', 400, 60, 40, 1.6, H('#e8e8e0', '#e8e8e0', '#c03030', '#a02020', '#801010', '#000'), [D('bone_feather', 0.005), D('ectoplasm', 0.3), D('bone', 0.5, 2, 5)]), 1500);
  E('skeleton_sniper', Object.assign(WALK_('Skeleton Sniper', 500, 70, 40, 1.4, H('#e8e8e0', '#e8e8e0', '#3a3a44', '#2a2a34', '#1a1a24', '#ff4040'), [D('sniper_rifle', 0.09), D('rifle_scope', 0.09), D('ectoplasm', 0.3)]), { cls: WalkerShooter, bulletName: 'bullet', bulletSpeed: 14 }), 2000);
  E('skeleton_commando', Object.assign(WALK_('Skeleton Commando', 500, 70, 40, 1.4, H('#e8e8e0', '#e8e8e0', '#3a5a3a', '#2a4a2a', '#1a3a1a', '#ff4040'), [D('rocket_launcher', 0.09), D('rocket_i', 0.5, 20, 49), D('ectoplasm', 0.3)]), { cls: WalkerShooter, bulletName: 'grenade' }), 2000);
  E('tactical_skeleton', Object.assign(WALK_('Tactical Skeleton', 500, 70, 40, 1.4, H('#e8e8e0', '#e8e8e0', '#303038', '#202028', '#101018', '#ff4040'), [D('tactical_shotgun', 0.09), D('swat_helmet', 0.09), D('ectoplasm', 0.3)]), { cls: WalkerShooter, bulletName: 'bullet' }), 2000);
  E('necromancer', Object.assign(WALK_('Necromancer', 400, 50, 30, 1.3, H('#e0d0c0', '#202020', '#404048', '#303038', '#202028', '#ff4040'), [D('shadowbeam_staff', 0.02), D('ectoplasm', 0.3)], { armed: false }), { cls: Caster, bullet: '#8040ff', rate: 50 }), 2000);
  E('ragged_caster', Object.assign(WALK_('Ragged Caster', 400, 50, 30, 1.3, H('#e0d0c0', '#404040', '#6a5a4a', '#5a4a3a', '#3a2a1a', '#ff4040'), [D('spectre_staff', 0.02), D('ectoplasm', 0.3)], { armed: false }), { cls: Caster, bullet: '#c0e0e0', rate: 50 }), 2000);
  E('diabolist', Object.assign(WALK_('Diabolist', 400, 60, 30, 1.3, H('#e0d0c0', '#c03030', '#802020', '#601010', '#401010', '#ff4040'), [D('inferno_fork', 0.02), D('ectoplasm', 0.3)], { armed: false }), { cls: Caster, bullet: '#ff6020', rate: 50 }), 2000);
  E('paladin', WALK_('Paladin', 3000, 100, 60, 1.4, H('#f2c6a0', '#e0c040', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#000'), [D('paladins_hammer', 0.09), D('paladins_shield', 0.09), D('ectoplasm', 0.5, 1, 3)]), 5000);
  E('bone_lee', WALK_('Bone Lee', 800, 100, 50, 3.0, H('#e8e8e0', '#e8e8e0', '#e0c040', '#c0a020', '#302010', '#000'), [D('tabi', 0.09), D('black_belt', 0.09), D('ectoplasm', 0.3)], { armed: false }), 2000);
  E('giant_cursed_skull', FLY_('Giant Cursed Skull', 400, 80, 40, 'eye', '#e0e0d0', [D('nazar', 0.01), D('ectoplasm', 0.3)], { w: 40, h: 40, speed: 3.5 }), 2000);
  E('dungeon_spirit', Object.assign(FLY_('Dungeon Spirit', 300, 70, 30, 'eye', 'rgba(200,240,240,0.7)', [D('ectoplasm', 1, 1, 3)], { w: 28, h: 36, speed: 3.2 }), { cls: Floater }), 1000);
  VAN.item('swat_helmet', 'SWAT Helmet', { armor: 'head', defense: 0, vanity: true, max: 1, rarity: 5, tooltip: 'Vanity. Dropped by Tactical Skeletons', icon: { kind: 'helmet', mat: VAN.palette('swat', '#303038') } }, 20000);

  // ---- ocean --------------------------------------------------------------------------------------------------------------
  E('pink_jellyfish', Object.assign(FLY_('Pink Jellyfish', 50, 20, 4, 'eye', 'rgba(255,140,200,0.8)', [D('jellyfish_necklace', 0.01), D('glowstick', 0.5, 1, 4)], { w: 22, h: 26, speed: 2 }), { cls: Swimmer }), 100);
  E('squid', Object.assign(FLY_('Squid', 90, 30, 8, 'eye', '#a0a0c0', [D('black_ink', 0.5)], { w: 24, h: 30, speed: 2.8 }), { cls: Swimmer }), 200);
  E('sea_snail', BEAST('Sea Snail', 60, 20, 12, 0.6, '#e0a0c0', [D('purple_mucus', 0.5)], { w: 26, h: 20, legs: 0, kbResist: 0.6 }), 100);
  E('creature_from_the_deep', WALK_('Creature from the Deep', 800, 70, 30, 1.8, H('#40a080', '#308060', '#40a080', '#308060', '#206040', '#ffe060'), [D('neptunes_shell', 0.02), D('moon_shell', 0)].filter(d => d.chance > 0), { armed: false }), 2000);
  E('swamp_thing', WALK_('Swamp Thing', 600, 60, 26, 1.8, H('#408040', '#306030', '#406040', '#305030', '#204020', '#ffe060'), [D('eye_spring', 0)].filter(d => d.chance > 0), { armed: false }), 2000);
  E('butcher', WALK_('Butcher', 1000, 90, 40, 2.0, H('#f2c6a0', '#c03030', '#e0e0e0', '#c0c0c0', '#404040', '#ff4040'), [D('butchers_chainsaw', 0.025)]), 3000);
  E('deadly_sphere', FLY_('Deadly Sphere', 1000, 80, 40, 'eye', '#8080a0', [D('deadly_sphere_staff', 0.025)], { w: 36, h: 36, speed: 4.5 }), 3000);
  E('dr_man_fly', Object.assign(WALK_('Dr. Man Fly', 800, 80, 34, 1.8, H('#8a9a40', '#e0e0e0', '#e0e0e0', '#c0c0c0', '#404040', '#ff4040'), [D('toxic_flask', 0.025)], { armed: false }), { cls: WalkerShooter, bulletName: 'grenade' }), 3000);
  E('nailhead', WALK_('Nailhead', 1000, 100, 40, 1.6, H('#e0d0c0', '#404040', '#303038', '#202028', '#101018', '#ff4040'), [D('nail_gun', 0.025), D('nail', 0.5, 20, 49)], { armed: false }), 3000);
  E('psycho', WALK_('Psycho', 700, 90, 34, 2.2, H('#f2c6a0', '#e0e0e0', '#e0e0e0', '#404040', '#202020', '#ff4040'), [D('psycho_knife', 0.025)]), 3000);
  E('the_possessed', WALK_('The Possessed', 700, 80, 34, 2.4, H('#f2c6a0', '#202020', '#e0e0e0', '#e0e0e0', '#404040', '#ff4040'), [D('sanguine_staff', 0)].filter(d => d.chance > 0), { armed: false }), 3000);

  // ---- glowing mushroom --------------------------------------------------------------------------------------------------
  E('anomura_fungus', BEAST('Anomura Fungus', 220, 40, 16, 1.6, '#4a9aff', [D('glow_mushroom', 0.5, 1, 3)], { w: 30, h: 22, legs: 6 }), 300);
  E('fungi_bulb', { name: 'Fungi Bulb', cls: Snatcher, hp: 160, damage: 40, defense: 14, color: '#4a9aff', vine: '#2a5a9a', blood: '#4a9aff', drops: [D('glow_mushroom', 0.5, 1, 3)], reach: 8, spits: true, bullet: '#60c0ff' }, 300);
  E('mushi_ladybug', BEAST('Mushi Ladybug', 180, 30, 14, 1.8, '#6ab0ff', [D('glow_mushroom', 0.5, 1, 3)], { w: 26, h: 16, legs: 6, round: true }), 300);
  E('spore_bat', FLY_('Spore Bat', 180, 40, 18, 'bat', '#6ab0ff', [D('glow_mushroom', 0.3)], { w: 26, h: 18, speed: 3.8, erratic: true }), 300);
  E('spore_skeleton', WALK_('Spore Skeleton', 250, 45, 24, 1.5, H('#c0d8f0', '#c0d8f0', '#4a9aff', '#3a7ad0', '#2a5aa0', '#ffe060'), [D('glow_mushroom', 0.5, 1, 3), D('bone', 0.3)]), 400);
  E('spore_zombie', WALK_('Spore Zombie', 250, 45, 22, 1.4, H('#8ab070', '#4a9aff', '#4a9aff', '#3a7ad0', '#2a2020', '#ffe060'), [D('glow_mushroom', 0.5, 1, 3), D('rotten_chunk', 0.3)]), 400);
  E('fungo_fish', Object.assign(FLY_('Fungo Fish', 200, 40, 16, 'bat', '#4a9aff', [D('glow_mushroom', 0.3)], { w: 26, h: 16, speed: 4 }), { cls: Swimmer }), 300);
  E('giant_fungi_bulb', { name: 'Giant Fungi Bulb', cls: Snatcher, hp: 300, damage: 60, defense: 20, color: '#3a7ad0', vine: '#2a5a9a', blood: '#4a9aff', drops: [D('glow_mushroom', 1, 3, 6)], reach: 10, spits: true, bullet: '#60c0ff' }, 600);

  // ---- events: Frost Legion, Blood Moon extras, Goblin Summoner, Pirates, OOA extras -------------------------------------
  E('mister_stabby', WALK_('Mister Stabby', 200, 40, 16, 1.5, H('#f0f0f0', '#f0f0f0', '#f0f0f0', '#e0e0e0', '#404040', '#000'), [D('snow', 0.5, 5, 15)]), 300);
  E('snow_balla', Object.assign(WALK_('Snow Balla', 200, 40, 16, 1.4, H('#f0f0f0', '#f0f0f0', '#e0e0ff', '#e0e0e0', '#404040', '#000'), [D('snowball', 0.5, 5, 15)], { armed: false }), { cls: WalkerShooter, bulletName: 'snowball' }), 300);
  E('snowman_gangsta', Object.assign(WALK_('Snowman Gangsta', 200, 40, 16, 1.4, H('#f0f0f0', '#202020', '#f0f0f0', '#e0e0e0', '#404040', '#000'), [D('snow', 0.5, 5, 15)], { armed: false }), { cls: WalkerShooter, bulletName: 'bullet' }), 300);
  E('goblin_summoner', Object.assign(WALK_('Goblin Summoner', 800, 50, 30, 1.2, H('#7ab060', '#3a3a2a', '#4a2a6a', '#3a1a5a', '#2a2020', '#ff40ff'), [D('shadowflame_knife', 0.17), D('shadowflame_bow', 0.17), D('shadowflame_hex_doll', 0.17), D('spiky_ball', 0.4, 3, 8)], { armed: false }), { cls: Caster, bullet: '#8040ff', rate: 50 }), 5000);
  E('etherian_lightning_bug', FLY_('Etherian Lightning Bug', 200, 40, 14, 'eye', '#e0e0ff', [D('defender_medal', 0.1)], { w: 22, h: 22, speed: 3.5, erratic: true }), 300);
  E('kobold_glider', FLY_('Kobold Glider', 400, 60, 20, 'bat', '#a06030', [D('defender_medal', 0.1)], { w: 30, h: 22, speed: 4 }), 500);
  E('drakin', Object.assign(WALK_('Drakin', 3000, 90, 40, 1.4, H('#a04040', '#802020', '#802020', '#601010', '#401010', '#ffe060'), [D('defender_medal', 0.3, 1, 3)], { armed: false }), { cls: WalkerShooter, bulletName: 'grenade' }), 3000);
  E('wither_beast', Object.assign(BEAST('Wither Beast', 2500, 90, 40, 1.8, '#4a3a6a', [D('defender_medal', 0.3, 1, 3)], { w: 44, h: 30, legs: 4, spikes: true }), { cls: Charger, chargeSpeed: 8 }), 3000);
  E('old_ones_skeleton', WALK_('Old One\'s Skeleton', 800, 60, 30, 1.6, H('#e8e8e0', '#e8e8e0', '#a06030', '#805020', '#604010', '#000'), [D('defender_medal', 0.1)]), 800);
  E('scutlix', Object.assign(BEAST('Scutlix', 2000, 60, 36, 3.0, '#a0a0b0', [D('brain_scrambler', 0.01), D('martian_conduit', 0.5, 2, 5)], { w: 46, h: 30, legs: 4 }), { cls: Charger, chargeSpeed: 9 }), 3000);
  E('gray_grunt', Object.assign(WALK_('Gray Grunt', 800, 60, 30, 1.6, H('#a0a0b0', '#a0a0b0', '#8090a0', '#708090', '#506070', '#40e0e0'), [D('martian_conduit', 0.5, 2, 5)], { armed: false }), { cls: WalkerShooter, bulletName: 'bullet' }), 1000);
  E('ray_gunner', Object.assign(WALK_('Ray Gunner', 800, 60, 30, 1.5, H('#a0a0b0', '#a0a0b0', '#8090a0', '#708090', '#506070', '#40e0e0'), [D('martian_conduit', 0.5, 2, 5), D('laser_machinegun', 0)].filter(d => d.chance > 0), { armed: false }), { cls: WalkerShooter, bulletName: 'laser' }), 1000);
  E('tesla_turret', Object.assign(BEAST('Tesla Turret', 1500, 70, 40, 0, '#a0a0b0', [D('martian_conduit', 0.5, 5, 10)], { w: 40, h: 40, legs: 0, kbResist: 1 }), { cls: WalkerShooter, bulletName: 'laser' }), 2000);
  E('gigazapper', Object.assign(WALK_('Gigazapper', 1200, 80, 36, 1.4, H('#a0a0b0', '#a0a0b0', '#40e0e0', '#30a0a0', '#206060', '#40e0e0'), [D('martian_conduit', 0.5, 2, 5)], { armed: false }), { cls: WalkerShooter, bulletName: 'laser' }), 1500);
  E('martian_walker', Object.assign(BEAST('Martian Walker', 6000, 100, 60, 1.2, '#a0a0b0', [D('martian_conduit', 1, 10, 20), D('charged_blaster_cannon', 0)].filter(d => d.chance > 0), { w: 60, h: 80, legs: 2, kbResist: 1 }), { cls: WalkerShooter, bulletName: 'laser' }), 10000);
  E('raven', FLY_('Raven', 250, 40, 16, 'bat', '#202028', [D('raven_staff', 0), D('spooky_wood', 0.5, 1, 3)].filter(d => d.chance > 0), { w: 26, h: 20, speed: 4, erratic: true }), 400);
  E('vampire_bat', FLY_('Vampire Bat', 500, 60, 24, 'bat', '#4a2030', [D('moon_stone', 0.02), D('broken_bat_wing', 0.01)], { w: 30, h: 20, speed: 4.5, erratic: true }), 800);
  E('elf_copter', Object.assign(FLY_('Elf Copter', 2000, 80, 40, 'eye', '#40a040', [D('elf_melter', 0.03)], { w: 50, h: 30, speed: 4 }), { cls: Shooter, rate: 30, bullet: '#ffe060', bulletSpeed: 8 }), 2000);
  E('present_mimic', Object.assign(BEAST('Present Mimic', 4000, 100, 44, 2.2, '#e04040', [D('reds_throw', 0.1), D('valkyrie_yoyo', 0.1), D('toolbox', 0.1)], { w: 40, h: 40, mouth: true, legs: 2 }), { cls: Charger, chargeSpeed: 8 }), 5000);

  // ---- graveyard & misc ---------------------------------------------------------------------------------------------------
  E('maggot_zombie', WALK_('Maggot Zombie', 60, 16, 8, 1.0, H('#a0b080', '#3a3a2a', '#8a9a70', '#6a7a50', '#2a2020', '#c02020'), [D('rotten_chunk', 0.35)]), 60);
  E('zombie_merman', WALK_('Zombie Merman', 400, 50, 24, 1.6, H('#60a080', '#408060', '#408060', '#306040', '#204020', '#c02020'), [D('rotten_chunk', 0.35)], { armed: false }), 800);
  E('gastropod', Object.assign(FLY_('Gastropod', 200, 50, 24, 'eye', '#e080ff', [D('pixie_dust', 0.5), D('blessed_apple', 0.005)], { w: 30, h: 26, speed: 2.5 }), { cls: Shooter, rate: 60, bullet: '#ff80ff', bulletSpeed: 8 }), 800);
  E('corrupt_penguin', BEAST('Corrupt Penguin', 60, 20, 6, 1.6, '#6a4a90', [], { w: 20, h: 22, legs: 2 }), 60);
  E('vicious_penguin', BEAST('Vicious Penguin', 60, 20, 6, 1.6, '#a03040', [], { w: 20, h: 22, legs: 2 }), 60);
  E('corrupt_bunny', BEAST('Corrupt Bunny', 70, 20, 6, 2.2, '#6a4a90', [], { w: 22, h: 18, legs: 4 }), 60);
  E('vicious_bunny', BEAST('Vicious Bunny', 70, 20, 6, 2.2, '#a03040', [], { w: 22, h: 18, legs: 4 }), 60);
  E('corrupt_goldfish', Object.assign(FLY_('Corrupt Goldfish', 30, 15, 4, 'bat', '#6a4a90', [], { w: 20, h: 14, speed: 3.5 }), { cls: Swimmer }), 40);
  E('baby_slime', SLIME('Baby Slime', 30, 13, 4, 'rgba(120,80,200,1)', [], { w: 18, h: 12 }), 30);
  E('possessed_armor', WALK_('Possessed Armor', 260, 50, 22, 1.8, H('#a0a0a8', '#a0a0a8', '#8a8a92', '#7a7a82', '#6a6a72', '#ffe060'), [D('armor_polish', 0.01)]), 700);

  // ---- drop-table touch-ups for the base roster (vanilla drops that were missing) -----------------------------------------
  const add = (type, ...drops) => { const d = ENEMY_DEFS[type]; if (!d) return; d.drops = d.drops || []; for (const x of drops) if (!d.drops.some(y => y.id === x.id)) d.drops.push(x); };
  add('zombie', D('shackle', 0.02), D('zombie_arm', 0.004)); add('demon_eye', D('black_lens', 0.01)); add('skeleton', D('bone', 0.5, 1, 3), D('skull', 0.005), D('ancient_iron_helmet', 0.005), D('ancient_gold_helmet', 0.004), D('bone_sword', 0.004), D('hook', 0.02));
  add('bat', D('chain_knife', 0.005), D('depth_meter', 0.01)); add('hornet', D('bezoar', 0.01), D('tattered_bee_wing', 0.005)); add('unicorn', D('blessed_apple', 0.005)); add('pixie', D('fast_clock', 0.01), D('megaphone', 0.01)); add('mummy', D('mummy_bandage', 0.4, 1, 3), D('fast_clock', 0.01));
  add('wraith', D('fast_clock', 0.01)); add('angry_bones', D('bone', 0.5, 1, 3), D('ancient_necro_helmet', 0.004), D('bone_sword', 0.004), D('golden_key', 0.03)); add('cursed_skull', D('nazar', 0.01)); add('shark', D('diving_helmet', 0.02), D('shark_fin', 1)); add('crab', D('coral', 0.1));
  add('ice_bat', D('depth_meter', 0.01), D('ice_boomerang', 0)); add('undead_viking', D('viking_helmet', 0.02)); add('ice_tortoise', D('frozen_turtle_shell', 0.05), D('ice_sickle', 0.01)); add('corruptor', D('vitamins', 0.01), D('cursed_flame', 0.5)); add('herpling', D('bezoar', 0.01), D('ichor', 0.5));
  add('chaos_elemental', D('rod_of_discord', 0.002), D('pixie_dust', 0.5)); add('illuminant_bat', D('trifold_map', 0.01)); add('diseased_slime', D('blindfold', 0.01)); add('eater_of_souls', D('ancient_shadow_helmet', 0.001), D('ancient_shadow_scalemail', 0.001), D('ancient_shadow_greaves', 0.001));
  add('face_monster', D('tentacle_spike', 0.004)); add('hell_bat', D('magma_stone', 0.01)); add('fire_imp', D('obsidian_rose', 0.02), D('plumbers_hat', 0)); add('demon', D('demon_scythe', 0.02)); add('voodoo_demon', D('guide_voodoo_doll', 1)); add('goblin_thief', D('spiky_ball', 0.3, 3, 8)); add('goblin_sorcerer', D('spiky_ball', 0.3, 3, 8));
  add('pirate_deckhand', D('lucky_coin', 0.002), D('coin_gun', 0.001), D('cutlass', 0.005), D('gold_ring', 0.002), D('discount_card', 0.002), D('pirate_staff', 0.005), D('eye_patch', 0.01)); add('pirate_captain', D('lucky_coin', 0.01), D('coin_gun', 0.005), D('cutlass', 0.02), D('gold_ring', 0.01), D('discount_card', 0.01), D('pirate_staff', 0.02));
  add('mothron', D('mothron_wings', 0.05), D('broken_hero_sword', 0.25)); add('vampire_eclipse', D('moon_stone', 0.02), D('broken_bat_wing', 0.03)); add('reaper_eclipse', D('death_sickle', 0.025)); add('frankenstein', D('eye_spring', 0.01)); add('eyezor', D('eye_spring', 0.01));
  add('martian_drone', D('martian_conduit', 0.5, 1, 3)); add('martian_soldier', D('martian_conduit', 0.5, 2, 5)); add('martian_engineer', D('martian_conduit', 0.5, 2, 5)); add('scarecrow', D('spooky_wood', 0.5, 1, 3)); add('splinterling', D('spooky_wood', 0.5, 1, 3)); add('yeti', D('bacon', 0)); add('krampus', D('toolbox', 0.05));
  VAN.item('eye_patch', 'Eye Patch', { armor: 'head', defense: 0, vanity: true, max: 1, rarity: 1, tooltip: 'Vanity. Dropped by Pirates', icon: { kind: 'helmet', mat: VAN.palette('eyepatch', '#202028') } }, 5000);
  VAN.item('skull', 'Skull', { armor: 'head', defense: 0, vanity: true, max: 1, rarity: 1, tooltip: 'Vanity. Rarely dropped by Skeletons', icon: { kind: 'helmet', mat: VAN.palette('skullhat', '#e8e8e0') } }, 5000);
  for (const t in ENEMY_DEFS) if (ENEMY_DEFS[t].drops) ENEMY_DEFS[t].drops = ENEMY_DEFS[t].drops.filter(d => d.chance > 0);

  // ---- spawn pools -------------------------------------------------------------------------------------------------------
  const pick = (list) => { let total = 0; for (const [, w] of list) total += w; let r = Math.random() * total; for (const [t, w] of list) { r -= w; if (r <= 0) return t; } return list[0][0]; };
  ModLib.onSpawnPick((game, type, ctx) => {
    if (!ENEMY_DEFS[type] || Math.random() > 0.55) return type; // keep the base roster in the mix
    const d = BiomeSys.detect(game); if (!d) return type; const w = game.world, p = game.player, hm = w.hardmode, B = d.biome, L = d.layer, M = d.mini, night = ctx.night, rain = !!w.raining, blood = !!w.bloodMoon;
    const evil = B === BIOME.CORRUPTION, crim = B === BIOME.CRIMSON;
    let pool = null;
    if (M === 'Dungeon') pool = hm ? [['blue_armored_bones', 4], ['rusty_armored_bones', 4], ['hell_armored_bones', 3], ['skeleton_sniper', 1], ['skeleton_commando', 1], ['tactical_skeleton', 1], ['necromancer', 1], ['ragged_caster', 1], ['diabolist', 1], ['paladin', 0.3], ['bone_lee', 0.5], ['giant_cursed_skull', 2], ['dungeon_spirit', 1]] : [['angry_bones', 5], ['cursed_skull', 3], ['dark_caster', 2], ['dungeon_slime', 1]];
    else if (M === 'Jungle Temple') pool = [['lihzahrd', 3], ['flying_snake', 2]];
    else if (M === 'Underground Mushroom' || M === 'Glowing Mushroom') pool = [['anomura_fungus', 2], ['fungi_bulb', 2], ['mushi_ladybug', 2], ['spore_bat', 2], ['spore_skeleton', 2], ['spore_zombie', 2], ['fungo_fish', 1], ['giant_fungi_bulb', 1]];
    else if (M === 'Underground Desert') pool = hm ? [['tomb_crawler', 2], ['dune_splicer', 2], ['ghoul', 2], ['dark_mummy', 1], ['light_mummy', 1], ['basilisk', 1], ['desert_spirit', 1], ['lamia', 1], ['sand_poacher', 1]] : [['tomb_crawler', 3], ['sand_poacher', 2], ['antlion', 2], ['antlion_charger', 2]];
    else if (M === 'Spider Nest') pool = hm ? [['black_recluse', 3], ['wall_creeper', 1]] : [['wall_creeper', 1]];
    else if (M === 'Graveyard') pool = [['ghost', 3], ['maggot_zombie', 2], ['raven', 2], ['zombie', 1]];
    else if (L === 'space') pool = hm ? [['harpy', 3], ['wyvern', 1]] : [['harpy', 1]];
    else if (L === 'underworld') pool = hm ? [['bone_serpent', 2], ['red_devil', 1], ['lava_bat', 3], ['fire_imp', 2], ['demon', 2], ['lava_slime', 2]] : [['bone_serpent', 2], ['hell_bat', 3], ['fire_imp', 2], ['demon', 2], ['lava_slime', 2], ['voodoo_demon', 1]];
    else if (M === 'Underground Hallow' || (B === BIOME.HALLOW && L !== 'surface')) pool = [['illuminant_bat', 3], ['illuminant_slime', 3], ['chaos_elemental', 2], ['enchanted_sword', 1], ['light_mummy', 0.5], ['hallowed_mimic', 0.2], ['pigron', 0.5]];
    else if (B === BIOME.HALLOW) pool = night ? [['gastropod', 3], ['pixie', 2], ['unicorn', 2]] : [['pixie', 3], ['unicorn', 2], ['rainbow_slime', rain ? 2 : 0]];
    else if (evil) pool = L === 'surface' ? (hm ? [['corruptor', 2], ['corrupt_slime', 2], ['slimer', 2], ['eater_of_souls', 2], ['big_eater', 1], ['little_eater', 1], ['vile_ghoul', 0], ['corrupt_bunny', 0.5], ['corrupt_penguin', 0.3]] : [['eater_of_souls', 4], ['big_eater', 1], ['little_eater', 1], ['devourer', 2]]) : (hm ? [['world_feeder', 2], ['clinger', 2], ['cursed_hammer', 1], ['corrupt_slime', 2], ['slimer', 1], ['vile_ghoul', 1], ['corrupt_mimic', 0.2], ['dark_mummy', 0.5], ['pigron', 0.5]] : [['eater_of_souls', 3], ['devourer', 3]]);
    else if (crim) pool = L === 'surface' ? (hm ? [['herpling', 2], ['crimslime', 2], ['blood_jelly', 0], ['face_monster', 2], ['crimera', 2], ['vicious_bunny', 0.5], ['vicious_penguin', 0.3]] : [['crimera', 3], ['face_monster', 3], ['blood_crawler', 2]]) : (hm ? [['ichor_sticker', 2], ['floaty_gross', 2], ['crimson_axe', 1], ['crimslime', 2], ['herpling', 1], ['tainted_ghoul', 1], ['blood_feeder', 1], ['crimson_mimic', 0.2], ['pigron', 0.5]] : [['crimera', 2], ['face_monster', 3], ['blood_crawler', 3]]);
    else if (B === BIOME.SNOW) pool = L === 'surface' ? (hm ? [['ice_slime', 2], ['spiked_ice_slime', 2], ['zombie_eskimo', night ? 3 : 0], ['wolf', night ? 3 : 0], ['ice_golem', rain ? 2 : 0], ['snow_flinx', 1]] : [['ice_slime', 3], ['zombie_eskimo', night ? 3 : 0], ['snow_flinx', 1]]) : (hm ? [['ice_bat', 2], ['ice_elemental', 2], ['icy_merman', 2], ['ice_tortoise', 2], ['armored_viking', 2], ['ice_mimic', 0.3], ['pigron', 0.5], ['cyan_beetle', 1], ['snow_flinx', 2]] : [['ice_bat', 3], ['snow_flinx', 3], ['undead_viking', 2], ['spiked_ice_slime', 2], ['cyan_beetle', 1]]);
    else if (B === BIOME.DESERT) pool = L === 'surface' ? (hm ? [['vulture', 2], ['mummy', 2], ['dark_mummy', 1], ['light_mummy', 1], ['sand_elemental', rain ? 2 : 0], ['angry_tumbler', rain ? 3 : 0], ['sand_shark', rain ? 2 : 0], ['sand_slime', 2]] : [['vulture', 2], ['antlion', 2], ['sand_slime', 3], ['angry_tumbler', rain ? 3 : 0]]) : null;
    else if (B === BIOME.JUNGLE) pool = L === 'surface' ? (hm ? [['jungle_slime', 2], ['spiked_jungle_slime', 2], ['snatcher', 2], ['hornet', 2], ['moss_hornet', 2], ['derpling', 2], ['giant_tortoise', 1], ['arapaima', 0.3], ['angry_trapper', 1], ['doctor_bones', night ? 1 : 0]] : [['jungle_slime', 3], ['snatcher', 2], ['hornet', 2], ['piranha', 1], ['doctor_bones', night ? 1 : 0], ['lac_beetle', 1]]) : (hm ? [['moss_hornet', 3], ['jungle_creeper', 2], ['giant_tortoise', 2], ['moth', 1], ['angry_trapper', 2], ['derpling', 1], ['jungle_bat', 2], ['arapaima', 0.5], ['spiked_jungle_slime', 2]] : [['hornet', 3], ['man_eater', 3], ['jungle_bat', 2], ['spiked_jungle_slime', 2], ['piranha', 1], ['lac_beetle', 1]]);
    else if (B === BIOME.OCEAN) pool = p.inWater ? (hm ? [['shark', 3], ['pink_jellyfish', 2], ['squid', 2], ['creature_from_the_deep', 0]] : [['shark', 2], ['pink_jellyfish', 3], ['squid', 2]]) : [['crab', 3], ['sea_snail', 1], ['flying_fish', rain ? 2 : 0]];
    else if (L === 'cavern' || L === 'underground') pool = hm ? [['skeleton', 2], ['armored_skeleton', 3], ['skeleton_archer', 2], ['giant_bat', 3], ['digger', 2], ['toxic_sludge', 2], ['mimic', 0.3], ['rune_wizard', 0.1], ['black_slime', 1], ['rock_golem', 0.5], ['possessed_armor', 1], ['jellyfish_green', p.inWater ? 3 : 0]] : [['skeleton', 3], ['cave_bat', 3], ['giant_worm', 3], ['undead_miner', 1], ['mother_slime', 1], ['baby_slime', 2], ['black_slime', 1], ['tim', 0.05], ['nymph', 0.05], ['crawdad', 1], ['salamander', 1], ['giant_shelly', 1], ['cochineal_beetle', 1], ['jellyfish_blue', p.inWater ? 3 : 0], ['piranha', p.inWater ? 2 : 0], ['dark_caster', 0]];
    else if (L === 'surface') pool = blood ? [['blood_zombie', 3], ['drippler', 3], ['the_groom', 1], ['the_bride', 1], ['zombie', 3], ['demon_eye', 2], ['clown', hm ? 1 : 0], ['corrupt_bunny', 1], ['corrupt_goldfish', 0.5]] : night ? (hm ? [['zombie', 3], ['wandering_eye', 2], ['possessed_armor', 2], ['wraith', 2], ['werewolf', 2], ['demon_eye', 2], ['cataract_eye', 1], ['sleepy_eye', 1], ['dilated_eye', 1], ['green_eye', 1], ['purple_eye', 1], ['raincoat_zombie', rain ? 3 : 0], ['angry_nimbus', rain ? 2 : 0]] : [['zombie', 4], ['demon_eye', 3], ['cataract_eye', 1], ['sleepy_eye', 1], ['dilated_eye', 1], ['green_eye', 1], ['purple_eye', 1], ['raincoat_zombie', rain ? 3 : 0], ['goblin_scout', p.tileX < w.w * 0.33 || p.tileX > w.w * 0.66 ? 1 : 0], ['zombie_eskimo', 0]]) : [['green_slime', 4], ['blue_slime', 3], ['pinky', 0.1], ['yellow_slime', 1], ['umbrella_slime', rain ? 3 : 0], ['flying_fish', rain ? 2 : 0], ['angry_dandelion', w.windy ? 3 : 0], ['mimic', 0]];
    if (!pool) return type;
    pool = pool.filter(([t, wgt]) => wgt > 0 && ENEMY_DEFS[t] && ModList.enemyOk(t)); if (!pool.length) return type;
    return pick(pool);
  });
}
