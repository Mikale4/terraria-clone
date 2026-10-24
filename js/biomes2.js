// ---------------------------------------------------------------------------
// Biomes, runtime half: biome detection & titles (every biome, layer and
// mini-biome), biome enemies and spawn tables, honey / shimmer liquids, hurting
// and hot tiles, Shadow Orbs / Crimson Hearts / Demon Altars, the Meteorite
// event, Hardmode (Wall of Flesh) conversion - the Hallow, underground evil,
// corrupted deserts and ice - and the slow spread of evil and hallow.
// ---------------------------------------------------------------------------
'use strict';

function defBEnemy(type, def) { ENEMY_DEFS[type] = def; return def; }
// Enemies -----------------------------------------------------------------------------------
class Shooter extends Flyer { // flyer that fires a projectile at the player now and then
  constructor(x, y, def) { super(x, y, def); this.shot = randInt(60, 140); }
  ai(world, player, game) { super.ai(world, player, game); if (--this.shot <= 0 && dist(this.cx, this.cy, player.cx, player.cy) < 26 * TILE && !player.dead) { this.shot = this.def.rate || 120; const dx = player.cx - this.cx, dy = player.cy - this.cy, d = Math.hypot(dx, dy) || 1; const b = Gensokyo.bullet(game, this.cx, this.cy, dx / d * (this.def.bulletSpeed || 4.5), dy / d * (this.def.bulletSpeed || 4.5), { owner: this, color: this.def.bullet || '#ff8060', hi: '#fff', damage: Math.round(this.damage * 0.7), sourceName: `a ${this.name}'s ${this.def.bulletName || 'shot'}`, size: 5, life: 150 }); b.ghost = !!this.def.ghostShots; } }
}
class Swimmer extends Flyer { // only moves freely in water, flops on land
  ai(world, player, game) { this.updateLiquidState(world); if (this.inWater) { super.ai(world, player, game); } else { this.applyGravity(); this.vx *= 0.9; this.moveAndCollide(world); if (this.onGround && this.t % 30 === 0) this.vy = -3; } }
}
class Charger extends Walker { // walker that charges when lined up (unicorn, antlion charger)
  ai(world, player, game) { super.ai(world, player, game); if (this.onGround && Math.abs(player.cy - this.cy) < 40 && Math.abs(player.cx - this.cx) < 220 && this.t % 90 === 0) this.vx = this.dir * (this.def.chargeSpeed || 6); }
}
class Antlion extends Enemy { // buried in sand, spits sand balls
  constructor(x, y, def) { super(x, y, 30, 22, def); this.shot = randInt(40, 90); }
  ai(world, player, game) { this.applyGravity(); this.vx = 0; this.moveAndCollide(world); this.dir = player.cx < this.cx ? -1 : 1; if (--this.shot <= 0 && dist(this.cx, this.cy, player.cx, player.cy) < 22 * TILE && !player.dead) { this.shot = 110; const dx = player.cx - this.cx, dy = player.cy - this.cy - 60, d = Math.hypot(dx, dy) || 1; const b = Gensokyo.bullet(game, this.cx, this.y, dx / d * 5, dy / d * 5, { owner: this, color: '#e8d090', hi: '#fff', damage: Math.round(this.damage * 0.8), sourceName: "an Antlion's sand ball", size: 5, life: 120 }); b.ghost = false; b.gravity = 0.12; } }
  draw(ctx, camX, camY) { this.drawShadowFlash(ctx); const x = snap(this.x - camX), y = snap(this.y - camY); ctx.fillStyle = '#c8a860'; ctx.fillRect(x + 4, y + 8, 22, 14); ctx.fillStyle = '#e8d090'; ctx.fillRect(x + 6, y + 4, 18, 6); ctx.fillStyle = '#804020'; ctx.fillRect(x + (this.dir > 0 ? 22 : 4), y + 2, 4, 6); ctx.fillRect(x + (this.dir > 0 ? 26 : 0), y + 4, 4, 2); ctx.fillStyle = '#000'; ctx.fillRect(x + (this.dir > 0 ? 18 : 10), y + 8, 2, 2); ctx.globalAlpha = 1; }
}
const WALK = (name, hp, dmg, def, speed, colors, drops, extra) => Object.assign({ name, cls: Walker, hp, damage: dmg, defense: def, speed, colors, blood: colors.shirt, drops }, extra || {});
const FLY = (name, hp, dmg, def, kind, color, drops, extra) => Object.assign({ name, cls: Flyer, hp, damage: dmg, defense: def, kind, w: 24, h: 20, color, blood: color, drops }, extra || {});
defBEnemy('hornet', Object.assign(FLY('Hornet', 48, 18, 6, 'eye', '#e0c040', [{ id: 'stinger', chance: 0.66 }, { id: 'vine', chance: 0.2 }]), { cls: Shooter, rate: 100, bullet: '#e0c040', bulletName: 'stinger', w: 24, h: 18 }));
defBEnemy('jungle_bat', FLY('Jungle Bat', 34, 20, 6, 'bat', '#508040', [{ id: 'vine', chance: 0.1 }], { erratic: true, speed: 3.4, w: 20, h: 14 }));
defBEnemy('jungle_slime', { name: 'Jungle Slime', cls: Slime, hp: 60, damage: 20, defense: 7, color: 'rgba(80,180,60,1)', blood: '#50b040', drops: [{ id: 'gel', chance: 1, min: 1, max: 3 }, { id: 'jungle_spores', chance: 0.3 }] });
defBEnemy('eater_of_souls', FLY('Eater of Souls', 40, 22, 8, 'eye', '#7050a0', [{ id: 'rotten_chunk', chance: 0.5 }, { id: 'demonite_ore', chance: 0.05, min: 1, max: 3 }], { w: 30, h: 22, speed: 3.6 }));
defBEnemy('devourer', { name: 'Devourer', cls: null, hp: 60, damage: 25, defense: 4, blood: '#7050a0', drops: [{ id: 'rotten_chunk', chance: 0.5 }], worm: { segments: 8, speed: 4 } });
defBEnemy('crimera', FLY('Crimera', 55, 25, 8, 'eye', '#c04050', [{ id: 'vertebra', chance: 0.5 }, { id: 'crimtane_ore', chance: 0.05, min: 1, max: 3 }], { w: 30, h: 22, speed: 3.6 }));
defBEnemy('face_monster', WALK('Face Monster', 90, 40, 8, 1.6, { skin: '#c05050', hair: '#802020', shirt: '#a03030', pants: '#701818', shoes: '#401010', eye: '#000' }, [{ id: 'vertebra', chance: 0.5 }]));
defBEnemy('blood_crawler', WALK('Blood Crawler', 60, 22, 6, 2.2, { skin: '#b03030', hair: '#b03030', shirt: '#902020', pants: '#701818', shoes: '#501010', eye: '#ffe060' }, [{ id: 'vertebra', chance: 0.3 }]));
defBEnemy('pixie', Object.assign(FLY('Pixie', 100, 30, 10, 'eye', '#ffb0ff', [{ id: 'pixie_dust', chance: 1, min: 1, max: 3 }]), { cls: Shooter, rate: 90, bullet: '#ffb0ff', w: 16, h: 16, speed: 4 }));
defBEnemy('unicorn', Object.assign(WALK('Unicorn', 400, 55, 30, 2.4, { skin: '#f0f0ff', hair: '#e080ff', shirt: '#f0f0ff', pants: '#e0e0ff', shoes: '#c0c0e0', eye: '#4080ff' }, [{ id: 'unicorn_horn', chance: 0.33 }, { id: 'pixie_dust', chance: 0.5, min: 2, max: 4 }]), { cls: Charger, chargeSpeed: 7 }));
defBEnemy('antlion', { name: 'Antlion', cls: Antlion, hp: 45, damage: 18, defense: 8, blood: '#c8a860', drops: [{ id: 'antlion_mandible', chance: 0.5 }] });
defBEnemy('antlion_charger', Object.assign(WALK('Antlion Charger', 70, 25, 10, 2.6, { skin: '#c8a860', hair: '#a08040', shirt: '#b09050', pants: '#907040', shoes: '#705030', eye: '#000' }, [{ id: 'antlion_mandible', chance: 0.5 }]), { cls: Charger, chargeSpeed: 6.5 }));
defBEnemy('antlion_swarmer', FLY('Antlion Swarmer', 50, 20, 8, 'bat', '#c8a860', [{ id: 'antlion_mandible', chance: 0.4 }], { erratic: true, speed: 3.6 }));
defBEnemy('shark', Object.assign(FLY('Shark', 300, 40, 14, 'bat', '#6080a0', [{ id: 'shark_fin', chance: 1 }]), { cls: Swimmer, w: 40, h: 20, speed: 4 }));
defBEnemy('crab', WALK('Crab', 40, 15, 6, 1.2, { skin: '#e05030', hair: '#e05030', shirt: '#c04020', pants: '#a03010', shoes: '#802000', eye: '#000' }, [{ id: 'gel', chance: 0.3 }]));
defBEnemy('angry_bones', WALK('Angry Bones', 120, 35, 12, 1.7, { skin: '#e8e8e0', hair: '#e8e8e0', shirt: '#d0d0c8', pants: '#c0c0b8', shoes: '#a0a098', eye: '#ff2020' }, [{ id: 'bone', chance: 1, min: 1, max: 3 }, { id: 'golden_key', chance: 0.04 }]));
defBEnemy('cursed_skull', Object.assign(FLY('Cursed Skull', 66, 30, 12, 'eye', '#e8e8e0', [{ id: 'bone', chance: 0.5 }]), { w: 22, h: 22, speed: 3.8, cls: Shooter, rate: 140, bullet: '#c0c0ff', ghostShots: true }));
defBEnemy('dungeon_guardian', Object.assign(FLY('Dungeon Guardian', 9999, 1000, 9999, 'eye', '#e8e8e0', []), { w: 40, h: 40, speed: 7, kbResist: 1 }));
defBEnemy('ice_bat', FLY('Ice Bat', 30, 20, 8, 'bat', '#a0d8ff', [{ id: 'ice', chance: 0.3, min: 2, max: 5 }], { erratic: true, speed: 3.6, w: 20, h: 14 }));
defBEnemy('undead_viking', WALK('Undead Viking', 100, 30, 16, 1.4, { skin: '#c0c8d0', hair: '#e0c060', shirt: '#4a5a7a', pants: '#3a3a4a', shoes: '#2a2a2a', eye: '#a0e0ff' }, [{ id: 'iron_bar', chance: 0.2, min: 1, max: 3 }]));
defBEnemy('mushroom_zombie', WALK('Spore Zombie', 60, 16, 8, 1.1, { skin: '#6a8ab0', hair: '#4090ff', shirt: '#4a4a5a', pants: '#3a3040', shoes: '#2a2020', eye: '#a0e0ff' }, [{ id: 'glow_mushroom', chance: 0.6, min: 1, max: 3 }]));
defBEnemy('granite_elemental', Object.assign(FLY('Granite Elemental', 180, 40, 22, 'eye', '#4a4a7a', [{ id: 'granite', chance: 1, min: 3, max: 8 }]), { w: 26, h: 26, speed: 2.8, cls: Shooter, rate: 130, bullet: '#8080ff' }));
defBEnemy('granite_golem', WALK('Granite Golem', 250, 50, 30, 1.0, { skin: '#2a2a4a', hair: '#2a2a4a', shirt: '#3a3a6a', pants: '#2a2a4a', shoes: '#1a1a2a', eye: '#8080ff' }, [{ id: 'granite', chance: 1, min: 5, max: 12 }]));
defBEnemy('hoplite', Object.assign(WALK('Hoplite', 160, 40, 24, 1.5, { skin: '#f2c6a0', hair: '#d8d8e0', shirt: '#c0a040', pants: '#d8d8e0', shoes: '#8a6a3a', eye: '#3a3a3a' }, [{ id: 'marble', chance: 1, min: 3, max: 8 }, { id: 'gladius', chance: 0.05 }]), { cls: Charger, chargeSpeed: 5 }));
defBEnemy('medusa', Object.assign(WALK('Medusa', 300, 60, 24, 1.0, { skin: '#c0d0c0', hair: '#40a040', shirt: '#d8d8e0', pants: '#d8d8e0', shoes: '#a0a0a0', eye: '#ff2020' }, [{ id: 'marble', chance: 1, min: 5, max: 10 }, { id: 'medusa_head', chance: 0.05 }]), { cls: Walker }));
defBEnemy('wall_creeper', WALK('Wall Creeper', 55, 22, 8, 3.0, { skin: '#303030', hair: '#303030', shirt: '#404040', pants: '#303030', shoes: '#202020', eye: '#ff4040' }, [{ id: 'cobweb', chance: 1, min: 2, max: 5 }, { id: 'spider_fang', chance: 0.2 }]));
defBEnemy('demon', Object.assign(FLY('Demon', 140, 40, 14, 'eye', '#8020a0', [{ id: 'demon_scythe', chance: 0.02 }]), { w: 30, h: 36, speed: 3.2, cls: Shooter, rate: 120, bullet: '#c040ff', bulletName: 'demon scythe' }));
defBEnemy('voodoo_demon', Object.assign(FLY('Voodoo Demon', 140, 40, 14, 'eye', '#a04040', [{ id: 'guide_voodoo_doll', chance: 1 }]), { w: 30, h: 36, speed: 3.2 }));
defBEnemy('fire_imp', Object.assign(FLY('Fire Imp', 70, 30, 16, 'eye', '#ff6020', [{ id: 'obsidian_rose', chance: 0.02 }]), { w: 22, h: 30, speed: 2.5, cls: Shooter, rate: 100, bullet: '#ff8020', bulletName: 'fireball', bulletSpeed: 5 }));
defBEnemy('meteor_head', FLY('Meteor Head', 50, 50, 4, 'eye', '#b05030', [{ id: 'meteorite_ore', chance: 0.02, min: 1, max: 2 }], { w: 20, h: 20, speed: 4.2 }));
defBEnemy('ghost', FLY('Ghost', 300, 65, 20, 'eye', 'rgba(220,220,255,0.7)', [{ id: 'bone', chance: 0.3, min: 2, max: 5 }], { w: 24, h: 30, speed: 2.6 }));
defBEnemy('possessed_armor', WALK('Possessed Armor', 260, 55, 22, 1.8, { skin: '#c0c0d0', hair: '#c0c0d0', shirt: '#a0a0b0', pants: '#808090', shoes: '#606070', eye: '#ff4040' }, [{ id: 'iron_bar', chance: 0.3, min: 2, max: 5 }]));
defBEnemy('wraith', FLY('Wraith', 300, 60, 26, 'eye', 'rgba(40,40,60,0.85)', [{ id: 'fallen_star', chance: 0.1 }], { w: 26, h: 34, speed: 3.6 }));
defBEnemy('corruptor', Object.assign(FLY('Corruptor', 300, 45, 26, 'eye', '#8060c0', [{ id: 'cursed_flame', chance: 0.5, min: 1, max: 3 }, { id: 'vile_mushroom', chance: 0.3 }]), { w: 32, h: 24, speed: 3.2, cls: Shooter, rate: 100, bullet: '#8060c0', bulletName: 'vile spit' }));
defBEnemy('herpling', Object.assign(WALK('Herpling', 220, 50, 18, 2.6, { skin: '#c04050', hair: '#c04050', shirt: '#a03040', pants: '#802030', shoes: '#601020', eye: '#ffe060' }, [{ id: 'ichor', chance: 0.5, min: 1, max: 3 }]), { cls: Charger, chargeSpeed: 8 }));
defBEnemy('illuminant_bat', FLY('Illuminant Bat', 150, 40, 22, 'bat', '#ffb0ff', [{ id: 'pixie_dust', chance: 0.4, min: 1, max: 2 }], { erratic: true, speed: 4 }));
defBEnemy('chaos_elemental', Object.assign(WALK('Chaos Elemental', 200, 70, 30, 2.0, { skin: '#f0e0ff', hair: '#e080ff', shirt: '#c060e0', pants: '#a040c0', shoes: '#802090', eye: '#ffffff' }, [{ id: 'rod_of_discord', chance: 0.002 }, { id: 'soul_of_light', chance: 0.2 }]), { cls: Charger, chargeSpeed: 6 }));
defBEnemy('diseased_slime', { name: 'Corrupt Slime', cls: Slime, hp: 180, damage: 45, defense: 10, w: 36, h: 26, color: 'rgba(120,80,180,0.9)', blood: '#7050a0', drops: [{ id: 'gel', chance: 1, min: 3, max: 6 }, { id: 'cursed_flame', chance: 0.3 }] });
defBEnemy('crimslime', { name: 'Crimslime', cls: Slime, hp: 200, damage: 45, defense: 10, w: 36, h: 26, color: 'rgba(200,60,80,0.9)', blood: '#c04050', drops: [{ id: 'gel', chance: 1, min: 3, max: 6 }, { id: 'ichor', chance: 0.3 }] });
defBEnemy('mummy', WALK('Mummy', 200, 45, 20, 1.5, { skin: '#e0d0b0', hair: '#e0d0b0', shirt: '#d0c0a0', pants: '#c0b090', shoes: '#a09070', eye: '#000' }, [{ id: 'mummy_bandage', chance: 0.4, min: 1, max: 3 }]));
defBEnemy('ice_tortoise', WALK('Ice Tortoise', 400, 60, 40, 0.8, { skin: '#a0d8ff', hair: '#a0d8ff', shirt: '#4080c0', pants: '#306090', shoes: '#204060', eye: '#000' }, [{ id: 'frost_core', chance: 0.1 }]));
for (const [id, name, tip] of [['stinger', 'Stinger', 'A jungle material'], ['jungle_spores', 'Jungle Spores', 'Glowing jungle spores'], ['vertebra', 'Vertebra', 'A crimson material'], ['pixie_dust', 'Pixie Dust', 'A hallowed material'], ['unicorn_horn', 'Unicorn Horn', 'A hallowed material'], ['antlion_mandible', 'Antlion Mandible', 'A desert material'], ['shark_fin', 'Shark Fin', 'An ocean material'], ['bone', 'Bone', 'A dungeon material'], ['golden_key', 'Golden Key', 'Opens a locked Gold Chest in the Dungeon'], ['spider_fang', 'Spider Fang', 'A material from the Spider Nest'], ['guide_voodoo_doll', 'Guide Voodoo Doll', 'Drop it into lava in the Underworld... if you dare'], ['cursed_flame', 'Cursed Flame', 'A hardmode corruption material'], ['ichor', 'Ichor', 'A hardmode crimson material'], ['soul_of_light', 'Soul of Light', 'The essence of light creatures'], ['soul_of_night', 'Soul of Night', 'The essence of dark creatures'], ['mummy_bandage', 'Mummy Bandage', 'A hardmode desert material'], ['frost_core', 'Frost Core', 'A hardmode ice material'], ['vile_mushroom', 'Vile Mushroom', 'A corrupt material'], ['lihzahrd_power_cell', 'Lihzahrd Power Cell', 'Use at the Lihzahrd Altar in the Jungle Temple to awaken the Golem'], ['gladius', 'Gladius', '18 melee damage'], ['medusa_head', 'Medusa Head', 'Petrifying gaze (magic)']]) if (!ITEMS[id]) { defItem(id, { name, material: true, rarity: 1, tooltip: tip, drawIcon: (x) => { x.fillStyle = { stinger: '#e0c040', jungle_spores: '#80ff80', vertebra: '#e0d0c0', pixie_dust: '#ffb0ff', unicorn_horn: '#f0f0ff', antlion_mandible: '#c8a860', shark_fin: '#6080a0', bone: '#e8e8e0', golden_key: '#ffd040', spider_fang: '#303030', guide_voodoo_doll: '#f2c6a0', cursed_flame: '#80ff40', ichor: '#ffe040', soul_of_light: '#c0ffff', soul_of_night: '#8040c0', mummy_bandage: '#e0d0b0', frost_core: '#a0e0ff', vile_mushroom: '#8060c0', lihzahrd_power_cell: '#ffa020', gladius: '#c0c0c8', medusa_head: '#40a040' }[id] || '#fff'; x.fillRect(4, 3, 8, 10); x.fillStyle = 'rgba(255,255,255,0.4)'; x.fillRect(4, 3, 8, 2); } }); ITEM_VALUES[id] = 200; ITEMS[id].value = 200; }
ITEMS.gladius.sword = 'short'; ITEMS.gladius.damage = 18; ITEMS.gladius.useTime = 14; ITEMS.gladius.max = 1; ITEMS.gladius.material = false; ITEMS.gladius.knockback = 3; ITEM_VALUES.gladius = 15000; ITEMS.gladius.value = 15000;

// Runtime -------------------------------------------------------------------------------------
const BiomeSys = {
  // where is the player? returns {surface, layer, biome, mini}
  detect(game) {
    const p = game.player, w = game.world; if (w.isSub) return null;
    const x = clamp(p.tileX, 0, w.w - 1), y = p.tileY;
    const b = w.biome[x];
    const layer = y > w.h - 70 ? 'underworld' : y > w.cavernLine ? 'cavern' : y > w.surfaceLine ? 'underground' : y < w.surfaceLine - 90 ? 'space' : 'surface';
    // count nearby tiles to find mini-biomes (like Terraria's biome block counts)
    const counts = {}; let total = 0;
    for (let yy = y - 20; yy <= y + 20; yy += 2) for (let xx = x - 35; xx <= x + 35; xx += 2) { if (!w.inBounds(xx, yy)) continue; const t = w.tiles[xx + yy * w.w]; counts[t] = (counts[t] || 0) + 1; total++; }
    const c = (t) => counts[t] || 0;
    let mini = null;
    if (c(T.DUNGEON_BRICK) > 40) mini = 'Dungeon';
    else if (c(T.LIHZAHRD_BRICK) > 40) mini = 'Jungle Temple';
    else if (c(T.GRANITE) > 40) mini = 'Granite Cave';
    else if (c(T.MARBLE) > 40) mini = 'Marble Cave';
    else if (c(T.HIVE) > 25) mini = 'Bee Hive';
    else if (c(T.METEORITE_ORE) > 25) mini = 'Meteorite';
    else if (c(T.MUSHROOM_GRASS) + c(T.MUSHROOM_STALK) > 20) mini = layer === 'surface' ? 'Glowing Mushroom' : 'Underground Mushroom';
    else if (c(T.MOSS_STONE) > 30) mini = 'Glowing Moss';
    else if (c(T.PEARLSTONE) + c(T.HALLOW_GRASS) + c(T.PEARLSAND) + c(T.HALLOW_ICE) > 60) mini = layer === 'surface' ? 'The Hallow' : 'Underground Hallow';
    else if (c(T.EBONSTONE) + c(T.CORRUPT_GRASS) + c(T.EBONSAND) + c(T.CORRUPT_ICE) > 60) mini = layer === 'surface' ? 'The Corruption' : 'Underground Corruption';
    else if (c(T.CRIMSTONE) + c(T.CRIMSON_GRASS) + c(T.CRIMSAND) + c(T.CRIMSON_ICE) > 60) mini = layer === 'surface' ? 'The Crimson' : 'Underground Crimson';
    else if (c(T.LIVING_WOOD) > 20) mini = layer === 'underground' && w.structures && w.structures.mahogany ? 'Living Mahogany Tree' : 'Living Tree';
    else if (w.aether && Math.abs(x - w.aether.x) < 20 && Math.abs(y - w.aether.y) < 12) mini = 'Aether';
    else if (w.oasis && Math.abs(x - w.oasis.x) < 16 && Math.abs(y - w.oasis.y) < 12) mini = 'Oasis';
    else if (w.pyramid && Math.abs(x - w.pyramid.x) < 22 && y > w.pyramid.y - 24 && y < w.pyramid.y + 4) mini = 'Pyramid';
    else if (w.swordShrine && Math.abs(x - w.swordShrine.x) < 5 && Math.abs(y - w.swordShrine.y) < 5) mini = 'Enchanted Sword Shrine';
    else if (w.islands && w.islands.some(i => Math.abs(i.x - x) < 24 && Math.abs(i.y - y) < 12)) mini = 'Floating Island';
    else if (w.undergroundDesert && layer !== 'surface' && ((x - w.undergroundDesert.x) / w.undergroundDesert.rx) ** 2 + ((y - w.undergroundDesert.y) / w.undergroundDesert.ry) ** 2 < 1) mini = 'Underground Desert';
    else if (c(T.MINECART_TRACK) > 6) mini = 'Abandoned Minecart Track';
    else if (w.strandedShip && Math.abs(x - w.strandedShip.x) < 16 && Math.abs(y - w.strandedShip.y) < 10) mini = 'Stranded Ship';
    else { const wallCount = (() => { let n = 0; for (let yy = y - 6; yy <= y + 6; yy++) for (let xx = x - 10; xx <= x + 10; xx++) if (w.inBounds(xx, yy) && w.walls[xx + yy * w.w] === W.SPIDER) n++; return n; })(); if (wallCount > 40) mini = 'Spider Nest'; }
    // town / graveyard
    if (!mini && layer === 'surface') { const npcs = game.npcs.filter(n => n.home && !n.isPet && dist(n.cx, n.cy, p.cx, p.cy) < 60 * TILE).length; if (npcs >= 3) mini = 'Town'; let tomb = 0; for (const [i] of w.tombstones || []) { const tx = i % w.w, ty = (i / w.w) | 0; if (Math.abs(tx - x) < 40 && Math.abs(ty - y) < 20) tomb++; } if (tomb >= 7) mini = 'Graveyard'; }
    return { layer, biome: b, mini, counts, water: c(T.AIR) && p.inWater };
  },
  title(game) {
    const d = this.detect(game); if (!d) return null; const w = game.world, p = game.player;
    const bn = BIOME_NAMES[d.biome] || 'Forest';
    const layerName = d.layer.charAt(0).toUpperCase() + d.layer.slice(1);
    if (d.mini) return [d.mini, d.mini === bn ? (d.layer === 'surface' ? 'Surface' : layerName) : d.layer === 'surface' ? bn : layerName];
    if (d.layer === 'underworld') return [p.tileX < w.w * 0.25 || p.tileX > w.w * 0.75 ? 'Ash Forest' : 'The Underworld', 'Lava, ash and hellstone'];
    if (d.layer === 'space') return ['Space', 'Low gravity, thin air'];
    if (d.biome === BIOME.OCEAN) return [d.layer === 'surface' ? 'Ocean' : 'Ocean Caves', 'Sharks and shells'];
    if (d.layer === 'cavern') return [d.biome === BIOME.SNOW ? 'Ice Biome' : d.biome === BIOME.JUNGLE ? 'Underground Jungle' : d.biome === BIOME.DESERT ? 'Underground Desert' : 'Caverns', bn];
    if (d.layer === 'underground') return [d.biome === BIOME.SNOW ? 'Underground Snow' : d.biome === BIOME.JUNGLE ? 'Underground Jungle' : d.biome === BIOME.DESERT ? 'Underground Desert' : 'Underground', bn];
    if (p.inWater && !p.inLava && w.liquidAt(p.tileX, p.tileY - 2) > 100) return ['Lake', bn];
    return [bn, d.biome === BIOME.CORRUPTION ? 'Chasms, orbs and altars' : d.biome === BIOME.CRIMSON ? 'Hearts and altars' : d.biome === BIOME.JUNGLE ? 'Mud, vines and mahogany' : d.biome === BIOME.HALLOW ? 'Pixies and unicorns' : 'Surface'];
  },
  // spawn table by biome / layer / hardmode
  pickSpawn(game, type, ctx) {
    const d = this.detect(game); if (!d) return type; const w = game.world, r = Math.random(), hm = w.hardmode;
    const B = d.biome, L = d.layer, M = d.mini;
    if (M === 'Dungeon') return r < 0.6 ? 'angry_bones' : 'cursed_skull';
    if (M === 'Granite Cave') return r < 0.6 ? 'granite_elemental' : 'granite_golem';
    if (M === 'Marble Cave') return r < 0.75 ? 'hoplite' : 'medusa';
    if (M === 'Spider Nest') return 'wall_creeper';
    if (M === 'Meteorite') return 'meteor_head';
    if (M === 'Graveyard') return r < 0.5 ? 'ghost' : type;
    if (M === 'Bee Hive' || (B === BIOME.JUNGLE && L !== 'surface')) return r < 0.5 ? 'hornet' : r < 0.8 ? 'jungle_bat' : 'jungle_slime';
    if (M === 'Underground Desert') return r < 0.4 ? 'antlion' : r < 0.7 ? 'antlion_charger' : r < 0.9 ? 'antlion_swarmer' : (hm ? 'mummy' : type);
    if (M === 'Underground Mushroom' || M === 'Glowing Mushroom') return 'mushroom_zombie';
    if (M === 'Underground Hallow' || (B === BIOME.HALLOW)) return hm ? (r < 0.4 ? 'pixie' : r < 0.6 ? 'unicorn' : r < 0.8 ? 'illuminant_bat' : 'chaos_elemental') : type;
    if (M === 'The Corruption' || M === 'Underground Corruption' || B === BIOME.CORRUPTION) return hm && r < 0.4 ? (r < 0.2 ? 'corruptor' : 'diseased_slime') : r < 0.6 ? 'eater_of_souls' : r < 0.85 ? 'devourer' : type;
    if (M === 'The Crimson' || M === 'Underground Crimson' || B === BIOME.CRIMSON) return hm && r < 0.4 ? (r < 0.2 ? 'herpling' : 'crimslime') : r < 0.5 ? 'crimera' : r < 0.8 ? 'face_monster' : 'blood_crawler';
    if (L === 'underworld') return r < 0.35 ? type : r < 0.6 ? 'demon' : r < 0.75 ? 'fire_imp' : r < 0.85 ? 'voodoo_demon' : type;
    if (B === BIOME.OCEAN) return game.player.inWater ? 'shark' : (r < 0.5 ? 'crab' : type);
    if (B === BIOME.JUNGLE) return r < 0.4 ? 'jungle_slime' : r < 0.7 ? 'hornet' : type;
    if (B === BIOME.SNOW && L !== 'surface') return r < 0.5 ? 'ice_bat' : r < 0.7 ? 'undead_viking' : hm && r < 0.8 ? 'ice_tortoise' : type;
    if (hm && L === 'surface' && ctx.night && r < 0.2) return r < 0.1 ? 'possessed_armor' : 'wraith';
    if (hm && B === BIOME.DESERT && r < 0.3) return 'mummy';
    return type;
  },
  // orbs / hearts / altars / bulbs / larva / sword shrine break handling. Returns true if handled.
  onBreak(game, tx, ty, id) {
    const w = game.world, p = game.player;
    if (id === T.SHADOW_ORB || id === T.CRIMSON_HEART) {
      const a = w.furnitureAnchor(tx, ty); if (!a) return true;
      for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) w.setTile(a.x + xx, a.y + yy, T.AIR);
      w.orbsBroken = (w.orbsBroken || 0) + 1; FX.shake(4, 20); Audio_.play('kill');
      const loot = id === T.SHADOW_ORB ? choose(['musket', 'band_of_starpower', 'orb_of_light', 'vilethorn', 'ball_o_hurt']) : choose(['undertaker', 'panic_necklace', 'crimson_rod', 'the_rotted_fork', 'musket_ball']);
      game.dropItem(a.x * TILE + 16, a.y * TILE + 16, loot, loot === 'musket_ball' ? 100 : 1); if (loot === 'musket' || loot === 'undertaker') game.dropItem(a.x * TILE + 16, a.y * TILE + 16, 'musket_ball', 100);
      game.dropItem(a.x * TILE + 16, a.y * TILE + 16, id === T.SHADOW_ORB ? 'demonite_ore' : 'crimtane_ore', randInt(10, 20));
      if (w.orbsBroken % 3 === 0) { game.message(id === T.SHADOW_ORB ? 'A horrible chill goes down your spine...' : 'Screams echo around you...', '#c040c0'); setTimeout(() => { if (game.world === w && !game.boss) Bosses.summon(game, id === T.SHADOW_ORB ? 'eater_of_worlds' : 'brain_of_cthulhu'); }, 1500); }
      else if (w.orbsBroken === 1 || Math.random() < 0.5) { game.message('A meteorite has landed!', '#ffa040'); this.meteorite(game); }
      else game.message('You feel an evil presence watching you...', '#c040c0');
      return true;
    }
    if (id === T.DEMON_ALTAR) {
      if (!w.hardmode) { game.message('The altar is protected by dark magic. Only Hardmode power can break it.', '#c040c0'); p.damage(Math.round(p.maxHp * 0.3), null, game, 'Was killed by a Demon Altar'); return true; }
      const a = w.furnitureAnchor(tx, ty); for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) w.setTile(a.x + xx, a.y + yy, T.AIR);
      w.altarsSmashed = (w.altarsSmashed || 0) + 1; Ores.bless(game, w.altarsSmashed - 1); FX.shake(6, 25); Audio_.play('kill'); this.spreadBurst(game); return true;
    }
    if (id === T.PLANTERA_BULB) { const a = w.furnitureAnchor(tx, ty); for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) w.setTile(a.x + xx, a.y + yy, T.AIR); if (!game.boss) Bosses.summon(game, 'plantera'); return true; }
    if (id === T.LARVA) { const a = w.furnitureAnchor(tx, ty); for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) w.setTile(a.x + xx, a.y + yy, T.AIR); if (!game.boss) Bosses.summon(game, 'queen_bee'); return true; }
    if (id === T.SWORD_SHRINE) { const a = w.furnitureAnchor(tx, ty); for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) w.setTile(a.x + xx, a.y + yy, T.AIR); game.dropItem(a.x * TILE + 8, a.y * TILE + 8, Math.random() < 0.33 ? 'terragrim' : 'enchanted_sword', 1); FX.burst(game, a.x * TILE + 8, a.y * TILE + 8, 16, '#c0e0ff', 4, 30); return true; }
    if (id === T.COIN_PILE) { w.setTile(tx, ty, T.AIR); game.dropCoins(tx * TILE + 8, ty * TILE + 8, randInt(50, 400)); return true; }
    if (id === T.LIHZAHRD_ALTAR) { game.message('Use a Lihzahrd Power Cell on the altar to awaken the Golem.', '#ffa020'); return true; }
    return false;
  },
  // Meteorite: a crater of meteorite ore lands somewhere on the surface away from the player
  meteorite(game) {
    const w = game.world; for (let attempt = 0; attempt < 200; attempt++) {
      const x = randInt(60, w.w - 60); if (Math.abs(x - game.player.tileX) < 80 || Math.abs(x - w.spawnX) < 40 || w.biome[x] === BIOME.OCEAN) continue;
      const y = w.surface[x]; const r = 10;
      for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const d = Math.hypot(xx, yy); const X = x + xx, Y = y + yy + 4; if (!w.inBounds(X, Y)) continue; if (d < r * 0.55) { w.setTile(X, Y, T.AIR); w.liquid[w.idx(X, Y)] = 0; } else if (d <= r && w.get(X, Y) !== T.AIR && Math.random() < 0.85) w.setTile(X, Y, T.METEORITE_ORE); }
      for (let xx = -r - 4; xx <= r + 4; xx++) for (let yy = -3; yy < 3; yy++) { const t = w.get(x + xx, y + yy); if (t === T.TREE || t === T.TREETOP || t === T.PLANT) w.setTile(x + xx, y + yy, T.AIR); }
      w.meteorite = { x, y }; return true;
    }
    return false;
  },
  // Hardmode: the Wall of Flesh fell. Hallow V + evil spread, hardmode ores, pearl/ebon/crim sand & ice
  startHardmode(game) {
    const w = game.world; if (w.hardmode) return; w.hardmode = true;
    Ores.chooseHardmode(w);
    const hb = w.bands.hallow, hx0 = Math.floor(hb[0] * w.w), hx1 = Math.floor(hb[1] * w.w);
    const eb = w.bands.evil, ex0 = Math.floor(eb[0] * w.w), ex1 = Math.floor(eb[1] * w.w);
    const width = hx1 - hx0;
    // hallow: a column band on the surface plus a diagonal stripe into the caverns; evil: a diagonal stripe the other way
    for (let y = 0; y < w.h - 70; y++) {
      const shift = Math.floor((y - w.surfaceLine) * 0.35);
      for (let x = hx0 + Math.max(0, shift); x < hx1 + Math.max(0, shift); x++) this.convert(w, x, y, 'hallow');
      for (let x = ex0 - Math.max(0, shift); x < ex1 - Math.max(0, shift); x++) if (y > w.surfaceLine) this.convert(w, x, y, w.evil === BIOME.CRIMSON ? 'crimson' : 'corruption');
    }
    for (let x = hx0; x < hx1; x++) w.biome[x] = BIOME.HALLOW;
    // the hallowed surface gets hallowed trees & crystal shards underground
    for (let x = hx0 + 2; x < hx1 - 2; x += randInt(4, 8)) { let y = 0; while (y < w.h && w.get(x, y) === T.AIR) y++; if (w.get(x, y) === T.HALLOW_GRASS) { const th = randInt(7, 12); let ok = true; for (let k = 1; k <= th + 4; k++) if (w.get(x, y - k) !== T.AIR) ok = false; if (ok) { for (let k = 1; k <= th; k++) w.setTile(x, y - k, T.TREE, randInt(0, 3)); w.setTile(x, y - th - 1, T.TREETOP, randInt(0, 3)); } } }
    for (let k = 0; k < 300; k++) { const x = randInt(hx0, hx1 + 60), y = randInt(w.surfaceLine + 20, w.h - 90); if (w.get(x, y) === T.AIR && w.get(x, y + 1) === T.PEARLSTONE) w.setTile(x, y, T.CRYSTAL_SHARD); }
    Ores.seedChlorophyte(w, Math.random);
    game.renderer.initMap(w);
    game.message('The ancient spirits of light and dark have been released.', '#ffe75a');
  },
  convert(w, x, y, kind) {
    if (!w.inBounds(x, y)) return; const t = w.get(x, y); let n = null;
    const map = {
      hallow: { [T.STONE]: T.PEARLSTONE, [T.GRASS]: T.HALLOW_GRASS, [T.CORRUPT_GRASS]: T.HALLOW_GRASS, [T.CRIMSON_GRASS]: T.HALLOW_GRASS, [T.SAND]: T.PEARLSAND, [T.EBONSAND]: T.PEARLSAND, [T.CRIMSAND]: T.PEARLSAND, [T.ICE]: T.HALLOW_ICE, [T.EBONSTONE]: T.PEARLSTONE, [T.CRIMSTONE]: T.PEARLSTONE, [T.HARDENED_SAND]: T.PEARLSAND, [T.SANDSTONE]: T.PEARLSAND },
      corruption: { [T.STONE]: T.EBONSTONE, [T.GRASS]: T.CORRUPT_GRASS, [T.SAND]: T.EBONSAND, [T.ICE]: T.CORRUPT_ICE, [T.HARDENED_SAND]: T.EBONSAND, [T.SANDSTONE]: T.EBONSAND, [T.JUNGLE_GRASS]: T.CORRUPT_GRASS },
      crimson: { [T.STONE]: T.CRIMSTONE, [T.GRASS]: T.CRIMSON_GRASS, [T.SAND]: T.CRIMSAND, [T.ICE]: T.CRIMSON_ICE, [T.HARDENED_SAND]: T.CRIMSAND, [T.SANDSTONE]: T.CRIMSAND, [T.JUNGLE_GRASS]: T.CRIMSON_GRASS },
    }[kind];
    n = map[t]; if (n != null) { w.rawSet(x, y, n); w.markMap(x, y); }
    const wl = w.walls[w.idx(x, y)]; if (wl === W.STONE || wl === W.DIRT || wl === W.EBONSTONE || wl === W.CRIMSTONE || wl === W.PEARLSTONE) w.walls[w.idx(x, y)] = kind === 'hallow' ? W.PEARLSTONE : kind === 'crimson' ? W.CRIMSTONE : W.EBONSTONE;
  },
  spreadBurst(game) { /* smashing altars also spreads a little evil somewhere */ const w = game.world; const x = randInt(20, w.w - 20), y = randInt(w.surfaceLine, w.h - 90); for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) this.convert(w, x + xx, y + yy, w.evil === BIOME.CRIMSON ? 'crimson' : 'corruption'); },
  // slow spreading of evil & hallow (only in hardmode; grass spreads pre-hardmode a little)
  spreadTick(w) {
    if (!w.hardmode) return;
    for (let k = 0; k < 3; k++) {
      const x = randInt(1, w.w - 2), y = randInt(1, w.h - 75); const t = w.get(x, y);
      const kind = t === T.PEARLSTONE || t === T.HALLOW_GRASS || t === T.PEARLSAND || t === T.HALLOW_ICE ? 'hallow' : t === T.EBONSTONE || t === T.CORRUPT_GRASS || t === T.EBONSAND || t === T.CORRUPT_ICE ? 'corruption' : t === T.CRIMSTONE || t === T.CRIMSON_GRASS || t === T.CRIMSAND || t === T.CRIMSON_ICE ? 'crimson' : null;
      if (!kind) continue;
      const [dx, dy] = choose([[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]]);
      this.convert(w, x + dx, y + dy, kind);
    }
  },
  // liquids: honey & shimmer effects on the player, shimmer transmutation of dropped items
  liquidTick(game) {
    const p = game.player, w = game.world; const l = w.lavaAt(p.tileX, Math.floor((p.y + p.h * 0.6) / TILE));
    if (p.inWater && l === LIQ.HONEY) { p.vx *= 0.6; if (p.vy > 1.5) p.vy = 1.5; p.addBuff('Honey', 60 * 30); }
    if (p.inWater && l === LIQ.SHIMMER) { p.addBuff('Shimmer', 60 * 5); p.vy = Math.min(p.vy, 1); if (p.vy > 0 && w.time % 6 === 0) game.particles.push(new Particle(p.cx + rand(-8, 8), p.y + rand(0, 40), 0, -1, '#e0c0ff', 30, 2)); }
    // dropped items in shimmer: decraft back into their ingredients
    for (const d of game.drops) { if (d.dead) continue; const lt = w.lavaAt(d.tileX, d.tileY); if (w.liquidAt(d.tileX, d.tileY) > 60 && lt === LIQ.SHIMMER) { const rec = RECIPES.find(r => r.result === d.id); if (rec && (d.shimmerT = (d.shimmerT || 0) + 1) > 30) { d.dead = true; const n = Math.floor(d.count / rec.count) || 1; for (const [id, c] of rec.ing) game.dropItem(d.cx, d.y - 20, id, c * n, rand(-1, 1)); FX.burst(game, d.cx, d.cy, 10, '#e0c0ff', 3, 30); Audio_.play('menu'); } } }
  },
  // hurting / hot tiles under and around the player
  tileHazards(game) {
    const p = game.player, w = game.world; if (p.dead || p.invuln > 0) return;
    const x0 = Math.floor(p.x / TILE), x1 = Math.floor((p.x + p.w - 0.01) / TILE), y0 = Math.floor(p.y / TILE), y1 = Math.floor((p.y + p.h + 0.5) / TILE);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const def = TILES[w.get(x, y)]; if (def.hurt && (y === y1 || def.solid === false)) { p.damage(def.hurt, null, game, 'Was impaled by spikes'); return; } if (ORE_TIERS.meteorite && w.get(x, y) === T.METEORITE_ORE && y === y1 && !p.eq.fireImmune && !(p.acc && p.acc.fireImmune)) { p.damage(10, null, game, 'Was burned by a meteorite'); p.addBuff('On Fire!', 60 * 3); return; } }
  },
  tick(game) {
    const w = game.world; if (w.isSub) return;
    if (w.time % 4 === 0) this.spreadTick(w);
    Ores.tick(w);
    this.liquidTick(game);
    if (w.time % 3 === 0) this.tileHazards(game);
  },
};
BiomeTitles.detect = function (game) { const t = BiomeSys.title(game); if (t) return t; const w = game.world; if (w.isSub && typeof Subworlds !== 'undefined') { const d = Subworlds.defs[w.isSub]; return [d.name, d.sub]; } return ['Forest', 'Surface']; };
