// ---------------------------------------------------------------------------
// Qwerty's Bosses and Items 2: the Sky Fortress (a floating fortress guarded by
// Fortress Harpies, Mollusks, High Priests and enchanted tiles, with Rhuthinium
// ore and the Sky Altar), Lune and Caelite gear, Souls of Height, and the
// bosses Ancient Machine, Rune Ghost, Imperious, The Hydra, Polar Exterminator,
// The Divine Light, Noehtnap, the Invader Battleship (Invaders event), The Great
// Tyrannosaurus (Dino Militia event) and O.L.O.R.D.
// ---------------------------------------------------------------------------
'use strict';

const QW = {
  state(g) { return ModLib.world(g, 'qwerty', () => ({ fortress: null, luneBlessed: false })); },
  inFortress(g) { const f = g.world.modData && g.world.modData.qwerty && g.world.modData.qwerty.fortress; if (!f) return false; const p = g.player; return p.tileX >= f.x - 30 && p.tileX <= f.x + f.w + 30 && p.tileY >= f.y - 40 && p.tileY <= f.y + f.h + 30; },
  orb(ctx, r, col, hi) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = hi; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2); ctx.fill(); },
};
ModList.current = 'qwerty_bosses';
ModList.register('qwerty_bosses', "Qwerty's Bosses and Items 2", { workshop: 2571804182, desc: 'Ten bosses, the Sky Fortress, Rhuthinium / Lune / Caelite gear, the Invaders and Dino Militia events.', builtin: true });

// --- tiles, walls, ores, materials -------------------------------------------------------------
defBTile('FORTRESS_BRICK', { name: 'Fortress Brick', hp: 400, minPower: 55, drop: 'fortress_brick', color: '#8a7a5a', mapColor: '#9a8a6a' }, brickPainter('#d0c0a0', '#8a7a5a', '#5a4a30'));
defBTile('SKY_ALTAR', { name: 'Sky Altar', hp: 1e9, minPower: 999, solid: false, transparent: true, color: '#ffe080', mapColor: '#ffe080', light: [0.6, 0.55, 0.3], walkThrough: true }, (c) => { c.fillStyle = '#c0b090'; c.fillRect(2, 8, 12, 8); c.fillStyle = '#ffe080'; c.fillRect(6, 2, 4, 6); c.fillStyle = '#fff'; c.fillRect(7, 3, 2, 2); });
defBWall('FORTRESS', { name: 'Fortress Wall', color: '#5a4e38', drop: 'fortress_wall' });
defItem('fortress_brick', { name: 'Fortress Brick', tile: T.FORTRESS_BRICK, rarity: 1, tooltip: 'Bricks of the Sky Fortress' }); ITEM_VALUES.fortress_brick = 20; ITEMS.fortress_brick.value = 20;
defItem('fortress_wall', { name: 'Fortress Wall', wall: W.FORTRESS, rarity: 1 }); ITEM_VALUES.fortress_wall = 5; ITEMS.fortress_wall.value = 5;
RECIPES.push({ result: 'fortress_wall', count: 4, station: 'workbench', ing: [['fortress_brick', 1]] });
defOreTier('rhuthinium', 'Rhuthinium', { blob: ['#fff0b0', '#d8a838', '#7a5818'], map: '#d8a838', value: 900, rarity: 2, hp: 220, minPower: 55, light: [0.25, 0.18, 0.05], pick: 78, pickUse: 13, sword: 26, swordName: 'Rhuthinium Blade', dmg: 12, cost: 12, perBar: 4 });
ITEMS.rhuthinium_ore.tooltip = 'Found in the Sky Fortress';
defModArmorSet('rhuthinium', 'Rhuthinium', { colors: ['#fff0b0', '#d8a838', '#7a5818'], rarity: 2, bar: 'rhuthinium_bar', cost: [10, 10, 10, 10, 20, 15], value: 30000,
  pieces: [['rhuthinium_headband', 'Rhuthinium Headband', 'head', 6, { desc: '+10% melee damage and melee speed' }], ['rhuthinium_cap', 'Rhuthinium Cap', 'head', 5, { desc: '+12% ranged damage' }], ['rhuthinium_hat', 'Rhuthinium Hat', 'head', 4, { desc: '+12% magic damage, +40 max mana', manaBonus: 40 }], ['rhuthinium_mask', 'Rhuthinium Mask', 'head', 4, { desc: '+1 minion slot, +10% summon damage' }], ['rhuthinium_chestplate', 'Rhuthinium Chestplate', 'body', 8], ['rhuthinium_greaves', 'Rhuthinium Greaves', 'legs', 7]],
  desc: 'Rhuthinium Focus - +8% damage, and standing still for 2 seconds makes your next hit a guaranteed crit', bonus: (p, pm, g) => { pm.dmg *= 1.08; const s = ModLib.player(g, 'qwerty', () => ({})); if (Math.abs(p.vx) < 0.1 && p.onGround) s.focus = (s.focus || 0) + 1; else s.focus = 0; if (s.focus > 120) pm.crit += 100; } });
ARMOR_PIECE_MODS.rhuthinium_headband = (p, pm) => { pm.dmg *= 1.1; pm.useTime *= 0.9; }; ARMOR_PIECE_MODS.rhuthinium_cap = (p, pm) => { pm.rangedDmg *= 1.12; }; ARMOR_PIECE_MODS.rhuthinium_hat = (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.12; }; ARMOR_PIECE_MODS.rhuthinium_mask = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; pm.summonDmg = (pm.summonDmg || 1) * 1.1; };
ModLib.on('swing', (g) => { const s = g.player.modData && g.player.modData.qwerty; if (s) s.focus = 0; });
defOreTier('lune', 'Lune', { blob: ['#f0f8ff', '#88a8e8', '#3858a8'], map: '#88a8e8', value: 3000, rarity: 5, hp: 420, minPower: 110, light: [0.1, 0.15, 0.35], pickUse: 12, perBar: 4 });
ITEMS.lune_ore.tooltip = 'Moonlit ore that appears in the snow biome after the Polar Exterminator falls';
defModArmorSet('lune', 'Lune', { colors: ['#f0f8ff', '#88a8e8', '#3858a8'], rarity: 5, bar: 'lune_bar', cost: [12, 24, 18], value: 90000, station: 'mythril_anvil', pieces: [['lune_hat', 'Lune Hat', 'head', 10, { desc: '+60 max mana, +10% magic damage', manaBonus: 60 }], ['lune_crestplate', 'Lune Crestplate', 'body', 18], ['lune_leggings', 'Lune Leggings', 'legs', 14]], desc: 'Moonlight - +15% magic damage, +2 mana regeneration and a lunar glow', bonus: (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.15; pm.manaRegen = (pm.manaRegen || 0) + 2; } });
ARMOR_PIECE_MODS.lune_hat = (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.1; };
defModMaterial('soul_of_height', 'Soul of Height', { color: '#c0e8ff', hi: '#fff', rarity: 4, value: 2000, tooltip: "'The essence of things that soar' - dropped by Sky Fortress creatures in Hardmode" });
defModMaterial('caelite_core', 'Caelite Core', { color: '#ffe080', hi: '#fff', rarity: 7, value: 20000, tooltip: 'A shard of divine light. Combine with Souls of Height into Caelite Bars' });
defModMaterial('caelite_bar', 'Caelite Bar', { color: '#fff0c0', hi: '#ffe080', rarity: 7, value: 30000 }); RECIPES.push({ result: 'caelite_bar', count: 2, station: 'mythril_anvil', ing: [['caelite_core', 1], ['soul_of_height', 3]] });
MATERIALS.caelite = { M: '#fff8e0', m: '#ffd860', d: '#b08830' };
defModArmorSet('caelite', 'Caelite', { colors: ['#fff8e0', '#ffd860', '#b08830'], rarity: 7, bar: 'caelite_bar', cost: [12, 24, 18], value: 150000, station: 'mythril_anvil', pieces: [['caelite_helm', 'Caelite Helm', 'head', 20], ['caelite_armor', 'Caelite Armor', 'body', 26], ['caelite_greaves', 'Caelite Greaves', 'legs', 20]], desc: 'Divine Aura - +14% damage, +8% crit, nearby enemies take holy damage every second', bonus: (p, pm, g) => { pm.dmg *= 1.14; pm.crit += 8; if (g.world.time % 60 === 0) for (const e of g.enemies) if (!e.dead && dist(e.cx, e.cy, p.cx, p.cy) < 8 * TILE) e.hit(30, p.cx, 0, g); } });
defTool('caelite_pickaxe', 'Caelite Pickaxe', 'pick', 'caelite', 210, 9, 40, 7); RECIPES.push({ result: 'caelite_pickaxe', count: 1, station: 'mythril_anvil', ing: [['caelite_bar', 12]] }); ITEM_VALUES.caelite_pickaxe = 100000; ITEMS.caelite_pickaxe.value = 100000;
defModWeapon('caelite_boomerang', 'Caelite Boomerang', 'boomerang', 78, 14, 6, 7, 120000, { speed: 12, color: '#ffe080', count: 3, recipe: [['caelite_bar', 10]], station: 'mythril_anvil' });
defModWeapon('caelite_rain_knife', 'Caelite Rain Knife', 'magic', 60, 8, 3, 7, 120000, { manaCost: 5, color: '#fff0c0', speed: 14, shots: 2, spreadAng: 0.1, pierce: 2, recipe: [['caelite_bar', 10]], station: 'mythril_anvil', desc: 'Throws twin knives of light' });
defModWeapon('caelite_scepter', 'Caelite Scepter', 'magic', 92, 20, 5, 7, 140000, { manaCost: 14, color: '#ffe080', speed: 10, homing: 0.6, glow: true, recipe: [['caelite_bar', 12]], station: 'mythril_anvil' });
defModMaterial('fortress_harpy_beak', 'Fortress Harpy Beak', { color: '#e0c060', hi: '#fff', rarity: 3, value: 1500, tooltip: 'Dropped by Fortress Harpies' });
defModArmorSet('gale_swift', 'Gale Swift', { colors: ['#e8fff8', '#80d8c0', '#308068'], rarity: 5, bar: 'fortress_harpy_beak', cost: [5, 8, 6], extra: [['soul_of_height', 4]], value: 80000, station: 'mythril_anvil', pieces: [['gale_swift_helm', 'Gale Swift Helm', 'head', 9], ['gale_swiftplate', 'Gale Swiftplate', 'body', 14], ['gale_swift_robes', 'Gale Swift Robes', 'legs', 10]], desc: 'Gale - +30% movement speed, +50% flight time, +10% damage while airborne', bonus: (p, pm) => { pm.move *= 1.3; pm.flightMult = (pm.flightMult || 1) * 1.5; if (!p.onGround) pm.dmg *= 1.1; } });
defModMaterial('vitalum_core', 'Vitalum Core', { color: '#ff60a0', hi: '#fff', rarity: 7, value: 40000, tooltip: 'Pulses with stolen life. Dropped by Plantera' });
if (BOSS_DEFS.plantera) { BOSS_DEFS.plantera.drops = BOSS_DEFS.plantera.drops || []; BOSS_DEFS.plantera.drops.push({ id: 'vitalum_core', chance: 0.5, min: 1, max: 2 }); }
defModArmorSet('vitalum', 'Vitalum', { colors: ['#ffc0e0', '#e04080', '#701838'], rarity: 7, bar: 'vitalum_core', cost: [1, 1, 1], extra: [['jungle_spores', 10], ['chlorophyte_bar', 6]], value: 120000, station: 'mythril_anvil', pieces: [['vitalum_headress', 'Vitalum Headress', 'head', 14], ['vitalum_lifeguard', 'Vitalum Lifeguard', 'body', 22], ['vitalum_jeans', 'Vitalum Jeans', 'legs', 16]], desc: 'Lifesteal - 5% of the damage you deal heals you, +12% damage', bonus: (p, pm) => { pm.dmg *= 1.12; pm.vitalum = true; } });
ModLib.on('enemyHit', (g, e, dmg) => { const p = g.player; if (p.pm && p.pm.vitalum && dmg > 0 && p.hp < p.maxHp) { const h = Math.max(1, Math.round(dmg * 0.05)); p.hp = Math.min(p.maxHp, p.hp + h); if (g.world.time % 10 === 0) g.addDamageText(p.cx, p.y - 6, '+' + h, '#ff80c0'); } });
defModWeapon('sky_shot', 'Sky Shot', 'bow', 24, 22, 2, 2, 20000, { speed: 12, trail: '#c0e0ff', desc: 'Arrows fall from the sky where they land', shotsFromSky: true });
defModWeapon('super_sky_shot', 'Super Sky Shot', 'bow', 66, 16, 3, 7, 150000, { speed: 14, shots: 2, spread: 0.06, trail: '#c0e0ff', recipe: [['sky_shot', 1], ['soul_of_height', 10], ['hallowed_bar', 8]], station: 'mythril_anvil', desc: 'Rains extra arrows from the sky' });
ModLib.on('projHit', (g, b, e) => { const p = g.player; const sel = p.selectedItem; if (!b.friendly || b.owner !== p || b.kind !== 'arrow' || !sel || !ITEMS[sel.id].shotsFromSky && sel.id !== 'super_sky_shot') return; if (b.skyChild) return; const n = sel.id === 'super_sky_shot' ? 2 : 1; for (let k = 0; k < n; k++) { const s = modShot(g, e.cx + rand(-30, 30), e.y - 300, 0, 12, { damage: Math.round(b.damage * 0.6), color: '#c0e0ff', life: 60, props: { kind: 'arrow' } }); s.skyChild = true; } });

// --- the Sky Fortress ----------------------------------------------------------------------------
QW.buildFortress = function (world, rng) {
  const w = world.w, idx = (x, y) => x + y * w;
  const set = (x, y, t) => { if (world.inBounds(x, y)) { world.tiles[idx(x, y)] = t; world.tdata[idx(x, y)] = 0; world.liquid[idx(x, y)] = 0; world.lava[idx(x, y)] = 0; } };
  const wall = (x, y, wl) => { if (world.inBounds(x, y)) world.walls[idx(x, y)] = wl; };
  const FW = 64, FH = 26;
  let fx = Math.floor(w / 2 + (rng() < 0.5 ? -1 : 1) * (w * 0.18 + rng() * w * 0.2)); fx = clamp(fx, 40, w - FW - 40);
  let top = 1e9; for (let x = fx - 10; x < fx + FW + 10; x++) top = Math.min(top, world.surface[x] || 0);
  const fy = clamp(Math.floor(top - 90 - rng() * 20), 25, top - 60);
  // solid block with a rounded bottom and battlements
  for (let yy = 0; yy < FH; yy++) for (let xx = 0; xx < FW; xx++) { const X = fx + xx, Y = fy + yy; const edge = Math.min(xx, FW - 1 - xx); if (yy > FH - 6 && edge < (yy - (FH - 6)) * 2) continue; set(X, Y, T.FORTRESS_BRICK); wall(X, Y, W.FORTRESS); }
  for (let xx = 0; xx < FW; xx += 3) set(fx + xx, fy - 1, T.FORTRESS_BRICK);
  // rooms: a great hall in the middle and two side chambers, connected by doors
  const room = (x0, y0, rw, rh) => { for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) set(x0 + xx, y0 + yy, T.AIR); };
  room(fx + 20, fy + 3, 24, 12); room(fx + 4, fy + 6, 12, 9); room(fx + FW - 16, fy + 6, 12, 9);
  for (let yy = 12; yy <= 14; yy++) { for (let xx = 0; xx < 4; xx++) { set(fx + xx, fy + yy, T.AIR); set(fx + FW - 1 - xx, fy + yy, T.AIR); } for (let xx = 16; xx <= 19; xx++) { set(fx + xx, fy + yy, T.AIR); set(fx + FW - 1 - xx, fy + yy, T.AIR); } }
  for (const dx of [1, 17, FW - 2, FW - 18]) world.placeFurniture(fx + dx, fy + 12, T.DOOR_C);
  // towers
  for (const tx of [fx + 2, fx + FW - 6]) { for (let yy = 1; yy <= 10; yy++) for (let xx = 0; xx < 4; xx++) { set(tx + xx, fy - yy, xx === 0 || xx === 3 || yy === 10 ? T.FORTRESS_BRICK : T.AIR); wall(tx + xx, fy - yy, W.FORTRESS); } for (let yy = -1; yy <= 5; yy++) { set(tx + 1, fy + yy, T.AIR); set(tx + 2, fy + yy, T.AIR); } }
  // the Sky Altar on a pedestal in the great hall
  const ax = fx + 31, ay = fy + 14; set(ax, ay, T.FORTRESS_BRICK); set(ax + 1, ay, T.FORTRESS_BRICK); set(ax, ay - 1, T.SKY_ALTAR); set(ax + 1, ay - 1, T.SKY_ALTAR);
  for (const [cx, cy] of [[fx + 22, fy + 14], [fx + 40, fy + 14], [fx + 6, fy + 14], [fx + FW - 12, fy + 14]]) set(cx, cy - 1, T.TORCH);
  // Rhuthinium veins inside the bricks
  for (let v = 0; v < 26; v++) { let x = fx + 2 + Math.floor(rng() * (FW - 4)), y = fy + 1 + Math.floor(rng() * (FH - 8)); for (let k = 0; k < 4; k++) { for (let oy = 0; oy < 2; oy++) for (let ox = 0; ox < 2; ox++) if (world.tiles[idx(x + ox, y + oy)] === T.FORTRESS_BRICK) world.tiles[idx(x + ox, y + oy)] = T.RHUTHINIUM_ORE; x += Math.floor(rng() * 3) - 1; y += Math.floor(rng() * 3) - 1; } }
  // chests
  const chest = (x, y, items) => { set(x, y - 1, T.AIR); set(x + 1, y - 1, T.AIR); set(x, y - 2, T.AIR); set(x + 1, y - 2, T.AIR); world.placeFurniture(x, y - 2, T.CHEST); const inv = world.chests.get(idx(x, y - 2)); if (inv) items.forEach((it, i) => { if (it) inv[i] = makeStack(it[0], it[1] || 1, it[2] === undefined ? null : it[2]); }); };
  chest(fx + 7, fy + 15, [['sky_shot', 1, undefined], ['rhuthinium_ore', 18], ['fortress_brick', 40], ['coin_gold', 3], ['lesser_healing', 5]]);
  chest(fx + FW - 10, fy + 15, [['fortress_harpy_beak', 3], ['rhuthinium_ore', 14], ['fallen_star', 6], ['coin_gold', 2], ['torch', 10]]);
  chest(fx + 24, fy + 15, [['pendant_of_the_sky_god', 1], ['fortress_brick', 30], ['coin_silver', 60]]);
  world.modData = world.modData || {}; world.modData.qwerty = Object.assign(world.modData.qwerty || {}, { fortress: { x: fx, y: fy - 12, w: FW, h: FH + 12 } });
  world.structures = world.structures || {}; world.structures.skyFortress = { x: fx, y: fy };
};
ModLib.onWorldgen((world, rng) => { if (ModList.on('qwerty_bosses')) QW.buildFortress(world, rng); });

// fortress creatures --------------------------------------------------------------------------------
class Beast extends Enemy { // ground creature with a custom body, optional charging / hopping / shooting
  constructor(x, y, def) { super(x, y, def.w || 40, def.h || 30, def); this.canStep = true; this.shot = randInt(40, 120); this.jumpCd = 0; }
  ai(world, p, game) {
    this.updateLiquidState(world); if (this.inLava && !this.def.lavaProof) { this.dead = true; return; }
    const d = this.def; this.dir = p.cx > this.cx ? 1 : -1;
    if (d.stationary) this.vx *= 0.8; else this.vx = lerp(this.vx, this.dir * (d.speed || 1.5) * this.slowFactor, 0.08);
    if (d.charge && this.onGround && Math.abs(p.cy - this.cy) < 60 && Math.abs(p.cx - this.cx) < 260 && this.t % (d.chargeEvery || 100) === 0) this.vx = this.dir * d.charge;
    if (d.hop && this.onGround && this.t % d.hop === 0) { this.vy = -7; this.vx = this.dir * 3; }
    this.applyGravity(); this.moveAndCollide(world);
    if (this.collidedX && this.onGround && this.jumpCd-- <= 0) { this.vy = -8; this.jumpCd = 30; }
    if (d.rate && --this.shot <= 0 && dist(this.cx, this.cy, p.cx, p.cy) < (d.range || 24) * TILE && !p.dead) { this.shot = d.rate; const dx = p.cx - this.cx, dy = p.cy - this.cy - (d.arc ? 70 : 0), l = Math.hypot(dx, dy) || 1; const sp = d.bulletSpeed || 6; const b = Gensokyo.bullet(game, this.cx, this.cy - this.h * 0.3, dx / l * sp, dy / l * sp, { owner: this, color: d.bullet || '#ff8060', hi: '#fff', damage: Math.round(this.damage * (d.bulletMult || 0.7)), sourceName: `a ${this.name}'s ${d.bulletName || 'shot'}`, size: d.bulletSize || 5, life: 150 }); b.ghost = !!d.ghostShots; if (d.arc) b.gravity = 0.12; if (d.homing) b.homing = d.homing; }
  }
  draw(ctx, camX, camY) { const x = snap(this.x - camX), y = snap(this.y - camY); ctx.save(); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.translate(x + this.w / 2, y + this.h); if (this.dir < 0) ctx.scale(-1, 1); if (this.def.draw) this.def.draw(ctx, this); else { ctx.fillStyle = this.def.blood; ctx.fillRect(-this.w / 2, -this.h, this.w, this.h); } ctx.restore(); ctx.globalAlpha = 1; }
}
class HomingShooter extends Shooter { ai(world, player, game) { const n = game.projectiles.length; super.ai(world, player, game); if (game.projectiles.length > n) { const b = game.projectiles[game.projectiles.length - 1]; b.homing = this.def.homing || 0.15; b.life = 260; } } }
const soulDrop = { id: 'soul_of_height', chance: 0.35, min: 1, max: 2 };
defBEnemy('fortress_harpy', Object.assign(FLY('Fortress Harpy', 260, 42, 16, 'eye', '#e8d8a8', [{ id: 'fortress_harpy_beak', chance: 0.4 }, soulDrop]), { cls: Shooter, rate: 90, bullet: '#e0c060', bulletName: 'feather', w: 28, h: 22, speed: 4.2 }));
defBEnemy('fortress_swarmer', FLY('Fortress Swarmer', 90, 30, 8, 'bat', '#a09070', [soulDrop], { erratic: true, speed: 5, w: 16, h: 12 }));
defBEnemy('high_priest', Object.assign(FLY('High Priest', 320, 50, 20, 'eye', '#f0e8ff', [{ id: 'rhuthinium_ore', chance: 0.3, min: 2, max: 5 }, soulDrop]), { cls: HomingShooter, rate: 110, bullet: '#ffe080', bulletName: 'holy pulse', homing: 0.12, w: 24, h: 30, speed: 2.6, ghostShots: true }));
defBEnemy('mollusket', { name: 'Mollusket', cls: Beast, hp: 380, damage: 46, defense: 30, kbResist: 0.8, speed: 0.7, w: 36, h: 26, blood: '#c0a080', rate: 100, bullet: '#ffe0a0', bulletName: 'snipe', bulletSpeed: 9, drops: [{ id: 'rhuthinium_ore', chance: 0.3, min: 1, max: 4 }, soulDrop], draw: (c) => { c.fillStyle = '#b09060'; c.beginPath(); c.arc(-4, -12, 14, 0, Math.PI * 2); c.fill(); c.fillStyle = '#8a7048'; c.beginPath(); c.arc(-4, -12, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = '#d0c0a0'; c.fillRect(-18, -8, 30, 8); c.fillStyle = '#404040'; c.fillRect(6, -18, 12, 4); c.fillStyle = '#ffe060'; c.fillRect(8, -6, 3, 3); } });
defBEnemy('enchanted_tile', { name: 'Enchanted Tile', cls: Beast, hp: 200, damage: 38, defense: 40, kbResist: 0.6, speed: 0, hop: 50, w: 22, h: 22, blood: '#c0b090', drops: [{ id: 'fortress_brick', chance: 0.8, min: 2, max: 6 }, soulDrop], draw: (c, e) => { c.fillStyle = '#c8b898'; c.fillRect(-11, -22, 22, 22); c.fillStyle = '#7a6a4a'; c.fillRect(-11, -11, 22, 1); c.fillRect(-1, -22, 1, 11); c.fillStyle = e.onGround ? '#ff8040' : '#ffe060'; c.fillRect(-6, -16, 4, 4); c.fillRect(2, -16, 4, 4); } });
defBEnemy('young_tile', { name: 'Young Tile', cls: Beast, hp: 60, damage: 20, defense: 10, speed: 0, hop: 35, w: 12, h: 12, blood: '#c0b090', drops: [{ id: 'fortress_brick', chance: 0.5, min: 1, max: 2 }], draw: (c) => { c.fillStyle = '#c8b898'; c.fillRect(-6, -12, 12, 12); c.fillStyle = '#ffe060'; c.fillRect(-3, -8, 2, 2); c.fillRect(1, -8, 2, 2); } });
ModLib.onSpawnPick((g, type, ctx) => { if (!ModList.on('qwerty_bosses') || !QW.inFortress(g) || ctx.underground) return type; const r = Math.random(); return r < 0.3 ? 'fortress_harpy' : r < 0.45 ? 'fortress_swarmer' : r < 0.6 ? 'high_priest' : r < 0.8 ? 'mollusket' : r < 0.92 ? 'enchanted_tile' : 'young_tile'; });
ModLib.on('tick', (g) => { const s = QW.state(g); if (!s.fortress) return; const inside = QW.inFortress(g); if (inside && !s.wasIn) { g.message('The Sky Fortress looms above...', '#ffe0a0'); } s.wasIn = inside; });

// --- bosses --------------------------------------------------------------------------------------
class AncientMachine extends BossBase {
  constructor(x, y) { super(x, y, 70, 60, 'ancient_machine'); this.setState('hover'); this.spin = 0; }
  ai(world, p, game) {
    this.spin += 0.05; const d = dist(this.cx, this.cy, p.cx, p.cy);
    switch (this.state) {
      case 'start': case 'hover': { this.hoverTo(p.cx + Math.sin(this.t * 0.02) * 200, p.y - 160, 6); if (this.st % 40 === 0) { const b = this.shoot(game, p, { speed: 5, color: '#e0c080', hi: '#fff', name: 'ancient missile', size: 6, life: 240 }); b.homing = 0.1; } if (this.st > 240) this.setState(choose(['charge', 'summon'])); break; }
      case 'charge': { if (this.st === 1) { FX.telegraph(this.cx, this.cy, p.cx, p.cy, '#e0c080', 25, 6); this.vx = this.vy = 0; } if (this.st === 25) this.chargeAt(p, 15); if (this.st > 25) { this.glide(); this.vx *= 0.985; this.vy *= 0.985; } if (this.st > 80) this.setState(this.hp < this.maxHp * 0.5 ? 'charge2' : 'hover'); break; }
      case 'charge2': { if (this.st === 10) this.chargeAt(p, 17); if (this.st > 10) this.glide(); if (this.st > 60) this.setState('hover'); break; }
      case 'summon': { this.hoverTo(p.cx, p.y - 200, 4); if (this.st === 20 && game.enemies.filter(e => e.type === 'ancient_minion' && !e.dead).length < 4) { for (let k = -1; k <= 1; k += 2) this.spawnMinion(game, 'ancient_minion', this.cx + k * 50, this.cy); Audio_.play('menu'); } if (this.st > 90) this.setState('hover'); break; }
    }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.rotate(this.spin); ctx.fillStyle = '#6a6a5a'; for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillRect(-8, -38, 16, 24); } ctx.rotate(-this.spin); ctx.fillStyle = '#8a8a7a'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e0c080'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-3, -3, 6, 6); ctx.restore(); ctx.globalAlpha = 1; }
}
defBEnemy('ancient_minion', Object.assign(FLY('Ancient Minion', 120, 24, 10, 'eye', '#8a8a7a', []), { cls: Shooter, rate: 100, bullet: '#e0c080', w: 20, h: 20, speed: 3.5 }));
defBoss('ancient_machine', { name: 'Ancient Machine', order: 2.9, hp: 4200, damage: 28, defense: 12, blood: '#8a8a7a', cls: AncientMachine, expertMult: 1.5, coins: 30000, leash: 220, teleportWhenFar: true,
  summon: 'ancient_emblem', spawn: 'Use an Ancient Emblem (10 Gold Bars + 5 Fallen Stars + 10 Gel at an Anvil), any time.', info: 'A relic of a lost civilization. Hovers and fires homing missiles, charges along a telegraphed line and calls Ancient Minions. Below half life it double-charges.',
  loot: ['ancient_blade', 'ancient_longbow', 'ancient_missile_staff', 'ancient_minion_staff', 'ancient_miner', 'ancient_gemstone'], collectibles: ['ancient_machine_trophy', 'ancient_machine_mask'], despawn: 'The Ancient Machine powers down...',
  drops: [{ id: 'rhuthinium_ore', min: 15, max: 30 }, { id: 'lesser_healing', min: 5, max: 8 }], oneOf: ['ancient_blade', 'ancient_longbow', 'ancient_missile_staff', 'ancient_minion_staff', 'ancient_miner'], expertItem: 'ancient_gemstone' });
Bosses.summonItem('ancient_emblem', 'ancient_machine', { name: 'Ancient Emblem', tooltip: 'Summons the Ancient Machine', icon: summonIcon('#8a8a7a', '#e0c080'), recipe: [['gold_bar', 10], ['fallen_star', 5], ['gel', 10]], station: 'anvil' });
defModWeapon('ancient_blade', 'Ancient Blade', 'sword', 28, 22, 5, 3, 30000, { swingProj: { color: '#e0c080', speed: 9 }, mat: 'gold' });
defModWeapon('ancient_longbow', 'Ancient Longbow', 'bow', 26, 20, 3, 3, 30000, { speed: 12, trail: '#e0c080' });
defModWeapon('ancient_missile_staff', 'Ancient Missile Staff', 'magic', 30, 24, 4, 3, 30000, { manaCost: 11, color: '#e0c080', speed: 7, homing: 0.8, life: 150, glow: true });
defModWeapon('ancient_minion_staff', 'Ancient Minion Staff', 'summon', 20, 30, 2, 3, 30000, { manaCost: 10, minion: { color: '#8a8a7a', shape: 'orb', ranged: true, rate: 40, speed: 7 } });
defTool('ancient_miner', 'Ancient Miner', 'pick', 'gold', 72, 12, 10, 3); ITEM_VALUES.ancient_miner = 30000; ITEMS.ancient_miner.value = 30000;
ACC('ancient_gemstone', 'Ancient Gemstone', { rarity: 5, value: 50000, tooltip: '+12% damage while at full life, +4 defense', defense: 4, ancientGem: true }, genericIcon('#e0c080', '#fff', 'ring'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'ancient_gemstone') && p.hp >= p.maxHp) pm.dmg *= 1.12; });

class RuneGhost extends BossBase {
  constructor(x, y) { super(x, y, 40, 60, 'rune_ghost'); this.setState('cast'); this.noContact = true; }
  ai(world, p, game) {
    this.hoverTo(p.cx + Math.cos(this.t * 0.015) * 220, p.y - 120 + Math.sin(this.t * 0.03) * 40, 5);
    const low = this.hp < this.maxHp * 0.5;
    if (this.st % (low ? 45 : 70) === 0) {
      const kind = choose(['aggro', 'ice', 'leech', 'pursuit']);
      const col = { aggro: '#ff6060', ice: '#80e0ff', leech: '#60ff80', pursuit: '#e080ff' }[kind];
      FX.ring(game, this.cx, this.cy, 8, col, 2, 20);
      if (kind === 'aggro') for (let k = -1; k <= 1; k++) this.shoot(game, p, { speed: 9, vx: k * 1.5, color: col, name: 'aggro rune', size: 6 });
      else if (kind === 'ice') { const b = this.shoot(game, p, { speed: 5, color: col, name: 'ice rune', size: 8 }); b.slow = true; }
      else if (kind === 'leech') { const b = this.shoot(game, p, { speed: 6, color: col, name: 'leech rune', size: 9, mult: 0.9 }); b.onHitPlayer = (g) => { this.hp = Math.min(this.maxHp, this.hp + 150); g.addDamageText(this.cx, this.y, '+150', '#60ff80'); }; }
      else { const b = this.shoot(game, p, { speed: 4, color: col, name: 'pursuit rune', size: 6, life: 300 }); b.homing = 0.25; }
    }
    if (low && this.st % 240 === 120) { for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 4, Math.sin(a) * 4, { owner: this, color: '#c0a0ff', damage: Math.round(this.damage * 0.8), sourceName: "the Rune Ghost's big rune", size: 7, life: 200 }); } FX.shake(3, 10); }
    if (this.st % 200 === 0 && Math.random() < 0.5) { this.x = p.cx + (Math.random() < 0.5 ? -260 : 260); this.y = p.y - 100; FX.burst(game, this.cx, this.cy, 12, '#c0a0ff', 3, 25); }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.globalAlpha = (this.hitFlash > 0 ? 0.5 : 0.85); ctx.fillStyle = '#d8d0ff'; ctx.beginPath(); ctx.arc(0, -14, 18, Math.PI, 0); ctx.lineTo(18, 20); for (let k = 0; k < 4; k++) ctx.lineTo(18 - k * 12 - 6, 20 + (k % 2 ? 6 : -4)); ctx.lineTo(-18, 20); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4030a0'; ctx.fillRect(-9, -18, 5, 7); ctx.fillRect(4, -18, 5, 7); ctx.fillStyle = '#c0a0ff'; for (let k = 0; k < 3; k++) { const a = this.t * 0.04 + k * Math.PI * 2 / 3; ctx.fillRect(Math.cos(a) * 34 - 4, Math.sin(a) * 34 - 4, 8, 8); } ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('rune_ghost', { name: 'Rune Ghost', order: 2.95, hp: 5200, damage: 30, defense: 8, blood: '#c0a0ff', cls: RuneGhost, expertMult: 1.5, coins: 35000, leash: 260, teleportWhenFar: true,
  summon: 'summoning_rune', spawn: 'Use a Summoning Rune (10 Bones + 5 Fallen Stars + 5 Silver Bars at an Anvil).', info: 'A spectre that casts four kinds of runes: aggro (fast triple), ice (slows), leech (heals it on hit) and pursuit (homing). Below half life it also releases big rune rings and teleports around.',
  loot: ['runic_blade', 'rune_longbow', 'runic_wave', 'runic_minion_staff', 'rune_miner', 'aggro_scroll', 'ice_scroll', 'leech_scroll', 'pursuit_scroll'], collectibles: ['rune_ghost_trophy', 'rune_ghost_mask'], despawn: 'The Rune Ghost fades away...',
  drops: [{ id: 'crafting_rune', min: 8, max: 14 }, { id: 'lesser_healing', min: 5, max: 8 }], oneOf: ['runic_blade', 'rune_longbow', 'runic_wave', 'runic_minion_staff', 'rune_miner'], expertItem: 'hyper_runestone' });
Bosses.summonItem('summoning_rune', 'rune_ghost', { name: 'Summoning Rune', tooltip: 'Summons the Rune Ghost', icon: summonIcon('#c0a0ff', '#4030a0'), recipe: [['bone', 10], ['fallen_star', 5], ['silver_bar', 5]], station: 'anvil' });
defModMaterial('crafting_rune', 'Crafting Rune', { color: '#c0a0ff', hi: '#fff', rarity: 3, value: 2000, tooltip: 'Used to craft the rune scrolls' });
defModWeapon('runic_blade', 'Runic Blade', 'sword', 34, 20, 5, 3, 40000, { swingProj: { color: '#c0a0ff', speed: 10, homing: 0.3 }, mat: 'silver' });
defModWeapon('rune_longbow', 'Rune Longbow', 'bow', 30, 18, 3, 3, 40000, { speed: 13, trail: '#c0a0ff', shots: 2, spread: 0.08 });
defModWeapon('runic_wave', 'Runic Wave', 'magic', 36, 22, 4, 3, 40000, { manaCost: 12, color: '#c0a0ff', speed: 8, shots: 3, spreadAng: 0.2, pierce: 2, ghost: true, life: 60 });
defModWeapon('runic_minion_staff', 'Runic Minion Staff', 'summon', 24, 30, 2, 3, 40000, { manaCost: 10, minion: { color: '#c0a0ff', shape: 'blade', ranged: true, rate: 35, speed: 8, ghost: true } });
defTool('rune_miner', 'Rune Miner', 'pick', 'silver', 85, 11, 12, 3); ITEM_VALUES.rune_miner = 40000; ITEMS.rune_miner.value = 40000;
for (const [id, name, tip, props] of [['aggro_scroll', 'Aggro Scroll', 'Enemies you hit are drawn to you; +6% damage', { dmg: 6 }], ['ice_scroll', 'Ice Scroll', 'Your hits have a 20% chance to slow enemies', { iceScroll: true }], ['leech_scroll', 'Leech Scroll', 'Your hits have a 15% chance to heal you for 5 life', { leechScroll: true }], ['pursuit_scroll', 'Pursuit Scroll', 'Your projectiles gently home in on enemies', { pursuitScroll: true }]]) { ACC(id, name, Object.assign({ rarity: 4, value: 30000, tooltip: tip, recipe: [['crafting_rune', 4], ['bone', 5]], station: 'anvil' }, props), genericIcon('#c0a0ff', '#fff', 'book')); }
ACC('hyper_runestone', 'Hyper Runestone', { rarity: 5, value: 60000, tooltip: 'All four rune scroll effects and +8% damage', dmg: 8, iceScroll: true, leechScroll: true, pursuitScroll: true }, genericIcon('#e0c0ff', '#fff', 'orb'));
ModLib.on('enemyHit', (g, e, dmg) => { const p = g.player, acc = ModLib.accs(p); if (acc.some(a => a.iceScroll) && Math.random() < 0.2) e.applyDebuff('Slow', 120, 1); if (acc.some(a => a.leechScroll) && Math.random() < 0.15 && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + 5); g.addDamageText(p.cx, p.y - 6, '+5', '#60ff80'); } });
ModLib.on('projTick', (g, b) => { if (b.friendly && b.owner === g.player && !b.homingFriendly && b.kind !== 'yoyo' && b.kind !== 'flail' && ModLib.accs(g.player).some(a => a.pursuitScroll)) b.homingFriendly = 0.15; });

class Imperious extends BossBase {
  constructor(x, y) { super(x, y, 30, 120, 'imperious'); this.setState('rise'); this.ang = 0; this.noContact = false; }
  ai(world, p, game) {
    switch (this.state) {
      case 'start': case 'rise': { this.hoverTo(p.cx + (p.cx < this.cx ? 260 : -260), p.y - 180, 8); this.ang = lerp(this.ang, 0, 0.1); if (this.st > 60) this.setState('dash'); break; }
      case 'dash': { if (this.st === 1) { FX.telegraph(this.cx, this.cy, p.cx, p.cy, '#e0e0ff', 20, 8); this.vx = this.vy = 0; } this.ang = Math.atan2(p.cy - this.cy, p.cx - this.cx) + Math.PI / 2; if (this.st === 20) { this.chargeAt(p, this.hp < this.maxHp * 0.4 ? 24 : 19); Audio_.play('swing'); } if (this.st > 20) this.glide(); if (this.st > 60) { this.dashes = (this.dashes || 0) + 1; this.setState(this.dashes % 3 === 0 ? 'spin' : 'rise'); } break; }
      case 'spin': { this.hoverTo(p.cx, p.y - 140, 5); this.ang += 0.3; if (this.st % 12 === 0 && this.st < 100) for (let k = 0; k < 2; k++) { const a = this.ang + k * Math.PI; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 7, Math.sin(a) * 7, { owner: this, color: '#e0e0ff', hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: "Imperious' phantom blade", size: 6, life: 150 }); } if (this.st > 110) this.setState(this.hp < this.maxHp * 0.6 ? 'slam' : 'rise'); break; }
      case 'slam': { if (this.st < 30) { this.hoverTo(p.cx, p.y - 260, 9); this.ang = lerp(this.ang, 0, 0.2); } if (this.st === 30) { FX.telegraph(this.cx, this.cy, this.cx, this.cy + 600, '#ffd0d0', 25, 10); this.vx = 0; this.vy = 0; } if (this.st === 55) { this.vy = 26; } if (this.st > 55) { this.y += this.vy; if (world.isSolidAt(this.tileX, Math.floor((this.y + this.h) / TILE)) || this.st > 110) { FX.shake(8, 20); FX.burst(game, this.cx, this.y + this.h, 20, '#e0e0ff', 5, 30); for (let k = -6; k <= 6; k++) if (k) Gensokyo.bullet(game, this.cx + k * 20, this.y + this.h - 10, k * 0.8, -6, { owner: this, color: '#e0e0ff', damage: Math.round(this.damage * 0.7), sourceName: "Imperious' shockwave", size: 6, life: 60 }).gravity = 0.25; this.setState('rise'); } } break; }
    }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.rotate(this.ang); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#e8e8ff'; ctx.beginPath(); ctx.moveTo(0, -60); ctx.lineTo(12, -40); ctx.lineTo(10, 30); ctx.lineTo(-10, 30); ctx.lineTo(-12, -40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c0a040'; ctx.fillRect(-26, 30, 52, 8); ctx.fillStyle = '#6a4a20'; ctx.fillRect(-5, 38, 10, 22); ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(0, -10, 6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('imperious', { name: 'Imperious', order: 4.7, hp: 32000, damage: 62, defense: 30, blood: '#e0e0ff', cls: Imperious, expertMult: 1.5, coins: 80000, leash: 260, teleportWhenFar: true,
  summon: 'icon_of_the_conqueror', spawn: 'Use the Icon of the Conqueror (8 Hallowed Bars + 5 Souls of Might + 5 Souls of Sight at a Mythril Anvil) in Hardmode.', info: 'A living greatsword. Rises, telegraphs and dashes, spins while throwing phantom blades and slams into the ground for a shockwave. Faster below 40% life.',
  loot: ['imperious_the_iv', 'imperium', 'imperious_sheath', 'swordsman_badge', 'skyward_hilt'], collectibles: ['imperious_trophy', 'imperious_mask'], despawn: 'Imperious sheathes itself...',
  drops: [{ id: 'hallowed_bar', min: 8, max: 14 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['imperious_the_iv', 'imperium', 'swordsman_badge', 'skyward_hilt'], expertItem: 'imperious_sheath' });
Bosses.summonItem('icon_of_the_conqueror', 'imperious', { name: 'Icon of the Conqueror', tooltip: 'Summons Imperious (Hardmode)', icon: summonIcon('#e0e0ff', '#c0a040'), hardmode: true, recipe: [['hallowed_bar', 8], ['soul_of_might', 5], ['soul_of_sight', 5]], station: 'mythril_anvil' });
defModWeapon('imperious_the_iv', 'Imperious the IV', 'sword', 92, 20, 6, 7, 150000, { swingProj: { color: '#e0e0ff', speed: 11, shots: 2 }, mat: 'silver' });
defModWeapon('imperium', 'Imperium', 'spear', 84, 22, 6, 7, 150000, { color: '#e0e0ff' });
ACC('swordsman_badge', "Swordsman's Badge", { rarity: 6, value: 80000, tooltip: '+10% melee critical strike chance, melee kills grant Swordsman (+15% melee speed for 5s)', crit: 10, swordsmanBadge: true }, genericIcon('#e0e0ff', '#c0a040', 'ring'));
ACC('skyward_hilt', 'Skyward Hilt', { rarity: 6, value: 80000, tooltip: 'Melee hits launch a sword of light at the enemy', skywardHilt: true }, genericIcon('#e0e0ff', '#6a4a20', 'box'));
ACC('imperious_sheath', 'Imperious Sheath', { rarity: 6, value: 100000, tooltip: 'Every 6th melee hit deals triple damage', sheath: true }, genericIcon('#6a4a20', '#c0a040', 'box'));
ModLib.on('enemyHit', (g, e, dmg) => { const p = g.player, acc = ModLib.accs(p), sel = p.selectedItem; const melee = sel && (ITEMS[sel.id].sword || ['spear', 'flail', 'yoyo', 'boomerang'].includes(ITEMS[sel.id].wclass)); if (!melee) return; if (acc.some(a => a.skywardHilt) && g.world.time % 3 === 0) modShot(g, p.cx, p.y, (e.cx - p.cx) / 20, (e.cy - p.cy) / 20 - 1, { damage: Math.round(dmg * 0.5), color: '#e0e0ff', life: 40 }); if (acc.some(a => a.sheath)) { const s = ModLib.player(g, 'qwerty', () => ({})); s.sheath = (s.sheath || 0) + 1; if (s.sheath >= 6) { s.sheath = 0; e.hit(dmg * 2, p.cx, 4, g); FX.burst(g, e.cx, e.cy, 8, '#e0e0ff', 3, 20); } } });
ModLib.onEnemyKilled((g, e) => { const p = g.player, sel = p.selectedItem; if (sel && ITEMS[sel.id].sword && ModLib.accs(p).some(a => a.swordsmanBadge)) p.addBuff('Swordsman', 300); });
BUFF_MODS.Swordsman = (p, pm) => { pm.useTime *= 0.85; };

class Hydra extends BossBase {
  constructor(x, y) { super(x, y, 90, 70, 'hydra'); this.flying = false; this.canStep = true; this.noContact = false; this.heads = []; }
  setup(game) { for (let k = 0; k < 3; k++) this.makeHead(game, k); }
  makeHead(game, k) { const head = new BossPart(this, 30, 30, { name: 'Hydra Head', hp: Math.round(this.maxHp * 0.25), damage: this.damage, defense: 20, type: 'hydra_head', ai: (h, world, p, g) => { const base = { x: this.cx + (k - 1) * 34, y: this.y - 20 }; const tx = base.x + (p.cx - this.cx) * 0.15 + Math.sin(h.t * 0.05 + k) * 10, ty = base.y - 40 + Math.cos(h.t * 0.04 + k * 2) * 12; h.x = lerp(h.x, tx - h.w / 2, 0.15); h.y = lerp(h.y, ty - h.h / 2, 0.15); h.k = k; }, draw: (h, ctx, cx, cy) => { const x = snap(h.cx - cx), y = snap(h.cy - cy); ctx.strokeStyle = '#3a7a4a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(snap(this.cx - cx) + (k - 1) * 20, snap(this.y - cy) + 10); ctx.quadraticCurveTo(x, y + 40, x, y); ctx.stroke(); ctx.globalAlpha = h.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#48905a'; ctx.beginPath(); ctx.ellipse(x, y, 18, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffe060'; ctx.fillRect(x - 8, y - 6, 4, 4); ctx.fillRect(x + 4, y - 6, 4, 4); ctx.fillStyle = '#fff'; ctx.fillRect(x - 6, y + 4, 3, 4); ctx.fillRect(x + 3, y + 4, 3, 4); ctx.globalAlpha = 1; } }); head.k = k; head.regrow = 0; game.enemies.push(head); this.heads[k] = head; return head; }
  onPartDeath(part, game) { game.message('A Hydra head falls... another grows!', '#60c080'); this.regrow = this.regrow || []; this.regrow.push({ k: part.k, t: 480 }); this.parts = this.parts.filter(q => q !== part); }
  ai(world, p, game) {
    this.updateLiquidState(world);
    this.dir = p.cx > this.cx ? 1 : -1; this.vx = lerp(this.vx, this.dir * 1.6, 0.05);
    this.applyGravity(); this.moveAndCollide(world); if (this.collidedX && this.onGround) this.vy = -10;
    if (this.regrow) for (const r of this.regrow) if (--r.t === 0) this.makeHead(game, r.k); if (this.regrow) this.regrow = this.regrow.filter(r => r.t > 0);
    const alive = this.parts.filter(q => q.type === 'hydra_head' && !q.dead);
    // breath: each head spits in turn; a big breath when all three are up
    if (this.t % 50 === 0 && alive.length) { const h = choose(alive); const dx = p.cx - h.cx, dy = p.cy - h.cy, d = Math.hypot(dx, dy) || 1; for (let k = 0; k < 3; k++) Gensokyo.bullet(game, h.cx, h.cy, dx / d * (5 + k), dy / d * (5 + k), { owner: this, color: '#80ff60', hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: "the Hydra's breath", size: 6, life: 120 }); }
    if (this.t % 300 === 150 && alive.length === 3) { FX.telegraph(this.cx, this.y - 40, p.cx, p.cy, '#80ff60', 30, 10); this.bigBreath = 30; }
    if (this.bigBreath > 0 && --this.bigBreath === 0) { for (let k = -4; k <= 4; k++) { const a = Math.atan2(p.cy - this.y + 40, p.cx - this.cx) + k * 0.08; Gensokyo.bullet(game, this.cx, this.y - 40, Math.cos(a) * 8, Math.sin(a) * 8, { owner: this, color: '#c0ff80', hi: '#fff', damage: Math.round(this.damage * 0.9), sourceName: "the Hydra's large breath", size: 9, life: 150 }); } FX.shake(4, 15); }
    if (this.onGround && Math.abs(p.cx - this.cx) < 120 && p.y < this.y - 60 && this.t % 90 === 0) this.vy = -13;
  }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.parts.some(q => q.type === 'hydra_head' && !q.dead)) { if (game.world.time % 20 === 0) game.addDamageText(this.cx, this.y - 10, 'destroy the heads', '#aaa'); return super.hit(Math.round(dmg * 0.25), fromX, 0, game, swingId, crit); } return super.hit(dmg, fromX, 0, game, swingId, crit); }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.y - camY); ctx.save(); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#3a7a4a'; ctx.beginPath(); ctx.ellipse(x, y + 40, 46, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2a5a3a'; ctx.fillRect(x - 36, y + 56, 14, 14); ctx.fillRect(x + 22, y + 56, 14, 14); ctx.fillRect(x - 14, y + 58, 12, 12); ctx.fillRect(x + 4, y + 58, 12, 12); ctx.fillStyle = '#5aa06a'; ctx.beginPath(); ctx.moveTo(x - this.dir * 40, y + 30); ctx.lineTo(x - this.dir * 70, y + 20); ctx.lineTo(x - this.dir * 42, y + 44); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('hydra', { name: 'The Hydra', order: 4.9, hp: 40000, damage: 66, defense: 32, blood: '#60c080', cls: Hydra, flying: false, expertMult: 1.5, coins: 90000, spawnUp: 40, spawnDist: 400,
  summon: 'hydra_food', spawn: 'Use Hydra Food (10 Jungle Spores + 5 Stingers + 3 Bass at a Mythril Anvil) in the jungle, in Hardmode.', info: 'A three-headed beast. Each head has its own life and spits poison; a destroyed head regrows after 8 seconds. The body only takes full damage while no heads remain. Big breath attack when all three are up.',
  loot: ['hydra_scale', 'hydra_cannon', 'hydrospear', 'hydra_beam', 'hydra_javelin', 'hydra_head_staff', 'hydrill'], collectibles: ['hydra_trophy', 'hydra_mask'], despawn: 'The Hydra slithers back into the jungle...',
  drops: [{ id: 'hydra_scale', min: 15, max: 25 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['hydra_cannon', 'hydrospear', 'hydra_beam', 'hydra_javelin', 'hydra_head_staff', 'hydrill'], expertItem: 'aqueous' });
Bosses.summonItem('hydra_food', 'hydra', { name: 'Hydra Food', tooltip: 'Summons the Hydra (jungle, Hardmode)', icon: summonIcon('#60c080', '#ffe060'), hardmode: true, where: inBiome(BIOME.JUNGLE), whereMsg: 'The Hydra only answers in the jungle.', recipe: [['jungle_spores', 10], ['stinger', 5], ['bass', 3]], station: 'mythril_anvil' });
defModMaterial('hydra_scale', 'Hydra Scale', { color: '#48905a', hi: '#c0ffc0', rarity: 6, value: 5000, tooltip: 'Regenerating scales of the Hydra' });
defModArmorSet('hydra', 'Hydra', { colors: ['#c0ffc0', '#48905a', '#1a4a2a'], rarity: 6, bar: 'hydra_scale', cost: [8, 14, 10], value: 100000, station: 'mythril_anvil', pieces: [['hydra_helmet', 'Hydra Helmet', 'head', 16], ['hydra_scalemail', 'Hydra Scalemail', 'body', 24], ['hydra_leggings', 'Hydra Leggings', 'legs', 18]], desc: 'Regrowth - +8 life regeneration, immune to poison, +10% damage', bonus: (p, pm) => { pm.regenAdd += 8; pm.dmg *= 1.1; if (p.buffs.Poisoned) p.buffs.Poisoned = 0; } });
defModWeapon('hydra_cannon', 'Hydra Cannon', 'launcher', 74, 26, 6, 6, 120000, { speed: 12, ammoKind: 'rocket', shots: 3, spread: 0.15 });
defModWeapon('hydrospear', 'Hydrospear', 'spear', 80, 22, 6, 6, 120000, { color: '#60c080' });
defModWeapon('hydra_beam', 'Hydra Beam', 'magic', 62, 12, 3, 6, 120000, { manaCost: 8, color: '#80ff60', speed: 14, pierce: 4, ghost: true, life: 50 });
defModWeapon('hydra_javelin', 'Hydra Javelin', 'boomerang', 70, 18, 5, 6, 120000, { speed: 12, color: '#48905a', count: 3 });
defModWeapon('hydra_head_staff', 'Hydra Head Staff', 'summon', 52, 30, 3, 6, 120000, { manaCost: 10, minion: { color: '#48905a', shape: 'dragon', ranged: true, rate: 30, speed: 8 } });
defTool('hydrill', 'Hydrill', 'pick', 'caelite', 190, 8, 30, 6); ITEM_VALUES.hydrill = 100000; ITEMS.hydrill.value = 100000;
ACC('aqueous', 'Aqueous', { rarity: 6, value: 100000, tooltip: 'Breathe underwater, +25% speed in water, poison immunity, +6 life regeneration in water', aqueous: true, regen: 2 }, genericIcon('#60c0e0', '#fff', 'orb'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'aqueous')) { pm.gills = true; if (p.inWater) { pm.move *= 1.25; pm.regenAdd += 6; } if (p.buffs.Poisoned) p.buffs.Poisoned = 0; } });

class PolarExterminator extends BossBase {
  constructor(x, y) { super(x, y, 90, 70, 'polar_exterminator'); this.flying = false; this.canStep = true; this.setState('sleep'); this.penguins = 0; }
  ai(world, p, game) {
    this.updateLiquidState(world);
    if (this.state === 'sleep') {
      this.vx *= 0.8; this.applyGravity(); this.moveAndCollide(world); this.immune = true;
      if (this.st % 90 === 0 && game.enemies.filter(e => e.minion && !e.dead).length < 8) { const t = choose(['agent_penguin', 'agent_penguin', 'flying_penguin', 'sliding_penguin']); this.spawnMinion(game, t, this.cx + rand(-200, 200), this.y - 60); }
      if (this.st % 60 === 0) game.addDamageText(this.cx, this.y - 20, 'Zzz...', '#c0e0ff');
      if (this.hp < this.maxHp || this.st > 60 * 45 || this.penguins >= 12) { this.setState('wake'); this.immune = false; game.message('The Polar Exterminator wakes up!', '#c0e0ff'); FX.shake(8, 30); }
      return;
    }
    this.immune = false;
    switch (this.state) {
      case 'wake': case 'walk': { this.dir = p.cx > this.cx ? 1 : -1; this.vx = lerp(this.vx, this.dir * 2.6, 0.08); if (this.st > 120) this.setState(choose(['charge', 'roar', 'call'])); break; }
      case 'charge': { if (this.st === 1) FX.telegraph(this.cx, this.cy, this.cx + this.dir * 500, this.cy, '#c0e0ff', 20, 8); if (this.st > 20) this.vx = this.dir * 9; if (this.st > 60) this.setState('walk'); break; }
      case 'roar': { this.vx *= 0.8; if (this.st === 20) { FX.shake(6, 20); Audio_.play('zombie'); if (dist(this.cx, this.cy, p.cx, p.cy) < 18 * TILE) { p.addBuff('Slow', 180); p.damage(Math.round(this.damage * 0.4), this.cx, game, 'enemy', false, "the Polar Exterminator's roar", this); } for (let k = -5; k <= 5; k++) Gensokyo.bullet(game, this.cx, this.cy - 20, k * 1.2, -5 - Math.abs(k) * 0.3, { owner: this, color: '#e0f0ff', damage: Math.round(this.damage * 0.5), sourceName: "the Polar Exterminator's ice shards", size: 6, life: 120 }).gravity = 0.18; } if (this.st > 60) this.setState('walk'); break; }
      case 'call': { this.vx *= 0.9; if (this.st === 10) for (let k = 0; k < 3; k++) this.spawnMinion(game, choose(['sliding_penguin', 'agent_penguin', 'flying_penguin']), this.cx + rand(-150, 150), this.y - 40); if (this.st > 40) this.setState('walk'); break; }
    }
    this.applyGravity(); this.moveAndCollide(world); if (this.collidedX && this.onGround) this.vy = -11;
    if (this.onGround && p.y + p.h < this.y - 30 && this.t % 80 === 0) this.vy = -13;
  }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.immune) { if (game.world.time % 20 === 0) game.addDamageText(this.cx, this.y - 10, 'sleeping - deal with the penguins', '#aaa'); return super.hit(Math.round(dmg * 0.1), fromX, 0, game, swingId, crit); } return super.hit(dmg, fromX, 0, game, swingId, crit); }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.y - camY); ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#f0f4ff'; ctx.beginPath(); ctx.ellipse(0, 40, 44, 28, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(28, 6, 34, 30); ctx.fillStyle = '#d0d8e8'; ctx.fillRect(-36, 56, 16, 14); ctx.fillRect(-6, 58, 16, 12); ctx.fillRect(20, 58, 16, 12); ctx.fillStyle = '#202030'; ctx.fillRect(56, 18, 6, 4); ctx.fillRect(48, 12, 4, 4); if (this.state === 'sleep') { ctx.fillStyle = '#c0e0ff'; drawText(ctx, 'z', 40 + Math.sin(this.t * 0.05) * 4, -20 - (this.t % 60) * 0.3, { size: 14, color: '#c0e0ff' }); } ctx.restore(); ctx.globalAlpha = 1; }
}
defBEnemy('agent_penguin', WALK('Agent Penguin', 300, 40, 18, 1.6, { skin: '#202030', hair: '#202030', shirt: '#303040', pants: '#202030', shoes: '#ffa020', eye: '#fff' }, [{ id: 'lune_ore', chance: 0.1, min: 1, max: 2 }], { armed: false }));
ENEMY_DEFS.agent_penguin.cls = class extends Walker { ai(world, p, game) { super.ai(world, p, game); if (this.t % 70 === 0 && dist(this.cx, this.cy, p.cx, p.cy) < 22 * TILE) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; Gensokyo.bullet(game, this.cx, this.cy, dx / d * 9, dy / d * 9, { owner: this, color: '#ffe060', damage: Math.round(this.damage * 0.7), sourceName: "an Agent Penguin's bullet", size: 4, life: 90 }); } } };
defBEnemy('flying_penguin', Object.assign(FLY('Flying Penguin', 220, 36, 14, 'eye', '#303040', [{ id: 'lune_ore', chance: 0.1 }]), { cls: Shooter, rate: 100, bullet: '#e0f0ff', bulletName: 'snowball', w: 22, h: 20, speed: 4 }));
defBEnemy('sliding_penguin', { name: 'Sliding Penguin', cls: Beast, hp: 180, damage: 44, defense: 12, speed: 3.5, charge: 9, chargeEvery: 80, w: 30, h: 16, blood: '#303040', drops: [{ id: 'lune_ore', chance: 0.1 }], draw: (c) => { c.fillStyle = '#303040'; c.beginPath(); c.ellipse(0, -8, 15, 8, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(2, -6, 9, 4, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffa020'; c.fillRect(13, -10, 5, 3); } });
defBoss('polar_exterminator', { name: 'Polar Exterminator', order: 4.95, hp: 36000, damage: 64, defense: 34, blood: '#f0f4ff', cls: PolarExterminator, flying: false, expertMult: 1.5, coins: 90000, spawnUp: 60, spawnDist: 380,
  summon: 'penguin_whistle', spawn: 'Use a Penguin Whistle (3 Frost Cores + 10 Silver Bars + 5 Souls of Night at a Mythril Anvil) in the snow biome, in Hardmode.', info: 'A sleeping polar bear commander guarded by Agent, Flying and Sliding Penguins. It only takes real damage after waking (hurt it, kill 12 penguins or wait 45s); then it charges, roars ice shards and calls reinforcements.',
  loot: ['lune_ore', 'penguin_club', 'penguin_launcher', 'penguin_fall', 'penguin_generator'], collectibles: ['polar_exterminator_trophy', 'polar_exterminator_mask'], despawn: 'The Polar Exterminator lumbers off...',
  drops: [{ id: 'lune_ore', min: 30, max: 50 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['penguin_club', 'penguin_launcher', 'penguin_fall'], expertItem: 'penguin_generator', onDeath: (g) => { QW.blessLune(g); } });
QW.blessLune = function (g) { const w = g.world, s = QW.state(g); if (s.luneBlessed) return; s.luneBlessed = true; const band = w.bands && w.bands.snow; const x0 = band ? Math.floor(band[0] * w.w) : 10, x1 = band ? Math.floor(band[1] * w.w) : w.w - 10; let n = 0; for (let k = 0; k < 6000 && n < 260; k++) { const x = randInt(Math.min(x0, x1), Math.max(x0, x1)), y = randInt(w.surfaceLine + 30, w.h - 90); const t = w.get(x, y); if (t === T.ICE || t === T.SNOW || t === T.STONE) { w.rawSet(x, y, T.LUNE_ORE); w.markMap(x, y); n++; } } g.message('Moonlight seeps into the snow: Lune ore has appeared!', '#88a8e8'); };
ModLib.on('tick', (g) => { if (g.world.time % 600 === 0 && ModLib.beaten(g, 'polar_exterminator')) QW.blessLune(g); });
Bosses.summonItem('penguin_whistle', 'polar_exterminator', { name: 'Penguin Whistle', tooltip: 'Summons the Polar Exterminator (snow biome, Hardmode)', icon: summonIcon('#303040', '#ffa020'), hardmode: true, where: inBiome(BIOME.SNOW), whereMsg: 'The penguins only answer in the snow.', recipe: [['frost_core', 3], ['silver_bar', 10], ['soul_of_night', 5]], station: 'mythril_anvil' });
defModWeapon('penguin_club', 'Penguin Club', 'sword', 78, 24, 8, 6, 120000, { swingProj: { color: '#e0f0ff', speed: 8 }, mat: 'silver' });
defModWeapon('penguin_launcher', 'Penguin Launcher', 'launcher', 70, 24, 6, 6, 120000, { speed: 11, ammoKind: 'rocket', trail: '#e0f0ff' });
defModWeapon('penguin_fall', 'Penguin Fall', 'magic', 68, 24, 5, 6, 120000, { manaCost: 14, color: '#303040', speed: 10, shots: 3, spreadAng: 0.25, gravity: 0.2, life: 120, desc: 'Drops penguins that tumble on enemies' });
ACC('penguin_generator', 'Penguin Generator', { rarity: 6, value: 100000, tooltip: 'Every few seconds a sliding penguin launches at nearby enemies', penguinGen: true }, genericIcon('#303040', '#ffa020', 'box'));
ModLib.on('tick', (g) => { const p = g.player; if (!ModLib.hasAcc(p, 'penguin_generator') || g.world.time % 150 !== 0) return; const t = ModLib.nearestEnemy(g, p.cx, p.cy, 16 * TILE); if (t) modShot(g, p.cx, p.y + 30, (t.cx > p.cx ? 1 : -1) * 10, -2, { damage: 60, color: '#303040', life: 80, gravity: 0.2, knockback: 6 }); });
defModWeapon('lune_staff', 'Lune Staff', 'magic', 74, 18, 4, 5, 110000, { manaCost: 11, color: '#88a8e8', speed: 11, shots: 2, spreadAng: 0.12, homing: 0.4, glow: true, recipe: [['lune_bar', 12]], station: 'mythril_anvil' });
defModWeapon('lune_boomerang', 'Lune Boomerang', 'boomerang', 66, 16, 5, 5, 100000, { speed: 12, color: '#88a8e8', count: 2, recipe: [['lune_bar', 10]], station: 'mythril_anvil' });
defModWeapon('lune_trickshooter', 'Lune Trickshooter', 'gun', 48, 14, 3, 5, 100000, { speed: 15, shots: 2, spread: 0.05, trail: '#88a8e8', recipe: [['lune_bar', 12]], station: 'mythril_anvil' });
defModWeapon('lune_archer_staff', 'Lune Archer Staff', 'summon', 46, 30, 2, 5, 100000, { manaCost: 10, minion: { color: '#88a8e8', shape: 'imp', ranged: true, rate: 32, speed: 7, projKind: 'arrow' }, recipe: [['lune_bar', 12]], station: 'mythril_anvil' });
defModWeapon('lune_top', 'Lune Top', 'yoyo', 60, 25, 5, 5, 100000, { range: 18, color: '#88a8e8', recipe: [['lune_bar', 10]], station: 'mythril_anvil' });
ACC('lune_bracelet', 'Lune Bracelet', { rarity: 5, value: 80000, tooltip: '+40 max mana, magic crits restore 10 mana', manaBonus: 40, luneBracelet: true, recipe: [['lune_bar', 8]], station: 'mythril_anvil' }, genericIcon('#88a8e8', '#fff', 'ring'));
ACC('rhuthinium_bracelet', 'Rhuthinium Bracelet', { rarity: 2, value: 20000, tooltip: '+5% damage, +2 defense', dmg: 5, defense: 2, recipe: [['rhuthinium_bar', 8]], station: 'anvil' }, genericIcon('#d8a838', '#fff', 'ring'));
ModLib.on('projHit', (g, b, e) => { if (b.magic && b.crit && ModLib.hasAcc(g.player, 'lune_bracelet')) g.player.mana = Math.min(g.player.maxMana, g.player.mana + 10); });
defModWeapon('rhuthinium_scepter', 'Rhuthinium Scepter', 'magic', 30, 22, 4, 2, 25000, { manaCost: 10, color: '#d8a838', speed: 9, pierce: 1, recipe: [['rhuthinium_bar', 10]], station: 'anvil' });
defModWeapon('rhuthinium_boomerang', 'Rhuthinium Boomerang', 'boomerang', 28, 18, 5, 2, 25000, { speed: 11, color: '#d8a838', recipe: [['rhuthinium_bar', 8]], station: 'anvil' });
defModWeapon('rhuthinium_javelin', 'Rhuthinium Javelin', 'spear', 30, 22, 5, 2, 25000, { color: '#d8a838', recipe: [['rhuthinium_bar', 10]], station: 'anvil' });
defModWeapon('rhuthinium_vaporizer', 'Rhuthinium Vaporizer', 'gun', 22, 12, 2, 2, 25000, { speed: 13, trail: '#d8a838', recipe: [['rhuthinium_bar', 12]], station: 'anvil' });

class DivineLight extends BossBase {
  constructor(x, y) { super(x, y, 60, 60, 'divine_light'); this.setState('orbit'); this.rays = []; }
  ai(world, p, game) {
    const low = this.hp < this.maxHp * 0.5;
    switch (this.state) {
      case 'start': case 'orbit': { this.hoverTo(p.cx + Math.cos(this.t * 0.02) * 240, p.y - 140 + Math.sin(this.t * 0.02) * 80, 7); if (this.st % 30 === 0) { const b = this.shoot(game, p, { speed: 6, color: '#ffe080', hi: '#fff', name: 'light shard', size: 5, life: 200 }); b.homing = 0.08; } if (this.st > 200) this.setState(choose(['rays', 'sun'])); break; }
      case 'rays': { this.hoverTo(p.cx, p.y - 120, 5); const n = low ? 8 : 6; if (this.st === 20) { this.rayA = Math.random() * Math.PI; for (let k = 0; k < n; k++) { const a = this.rayA + k * Math.PI * 2 / n; FX.telegraph(this.cx, this.cy, this.cx + Math.cos(a) * 900, this.cy + Math.sin(a) * 900, '#ffe080', 40, 8); } } if (this.st === 60) { for (let k = 0; k < n; k++) { const a = this.rayA + k * Math.PI * 2 / n; for (let s = 1; s <= 12; s++) Gensokyo.bullet(game, this.cx + Math.cos(a) * s * 40, this.cy + Math.sin(a) * s * 40, 0, 0, { owner: this, color: '#ffe080', hi: '#fff', damage: Math.round(this.damage * 0.8), sourceName: "the Divine Light's ray", size: 9, life: 40 }); } FX.flash('#ffffff', 10, 0.3); Audio_.play('kill'); } if (this.st > 110) this.setState('orbit'); break; }
      case 'sun': { this.hoverTo(p.cx, p.y - 320, 8); if (this.st > 40 && this.st % (low ? 6 : 10) === 0 && this.st < 200) { const x = p.cx + rand(-320, 320); Gensokyo.bullet(game, x, this.cy, rand(-0.5, 0.5), 7, { owner: this, color: '#fff0c0', hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: "the Divine Light's rain", size: 6, life: 150 }); } if (this.st > 220) this.setState('orbit'); break; }
    }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.translate(snap(this.cx - camX), snap(this.cy - camY)); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 0.95; const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 60); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#ffe080'); g.addColorStop(1, 'rgba(255,224,128,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff8d0'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = this.t * 0.02 + k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); ctx.stroke(); } QW.orb(ctx, 18, '#fff0c0', '#fff'); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('divine_light', { name: 'The Divine Light', order: 5.0, hp: 50000, damage: 74, defense: 44, blood: '#ffe080', cls: DivineLight, expertMult: 1.5, coins: 120000, leash: 300, teleportWhenFar: true,
  summon: 'pendant_of_the_sky_god', spawn: 'Use the Pendant of the Sky God (found in the Sky Fortress; 12 Souls of Height + 5 Hallowed Bars + 3 Fortress Harpy Beaks at a Mythril Anvil) next to the Sky Altar, after Plantera.', info: 'A radiant being worshipped in the Sky Fortress. Orbits firing homing light shards, telegraphs six to eight rays that fill the sky, and rises to rain light. Only fought at the Sky Altar.',
  loot: ['caelite_core', 'divine_banishment', 'holy_exiler', 'sacred_daze', 'priest_staff', 'swordstorm_staff', 'preist_cloak'], collectibles: ['divine_light_trophy', 'divine_light_mask'], despawn: 'The Divine Light ascends...',
  drops: [{ id: 'caelite_core', min: 3, max: 5 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['divine_banishment', 'holy_exiler', 'sacred_daze', 'priest_staff', 'swordstorm_staff'], expertItem: 'preist_cloak' });
Bosses.summonItem('pendant_of_the_sky_god', 'divine_light', { name: 'Pendant of the Sky God', tooltip: 'Summons the Divine Light at the Sky Altar (after Plantera)', icon: summonIcon('#ffe080', '#fff'), rarity: 7, where: (g) => ModLib.beaten(g, 'plantera') && !!g.nearTile(T.SKY_ALTAR, g.player.tileX, g.player.tileY, 12), whereMsg: 'The pendant glows only beside the Sky Altar, once Plantera has fallen.', recipe: [['soul_of_height', 12], ['hallowed_bar', 5], ['fortress_harpy_beak', 3]], station: 'mythril_anvil' });
defModWeapon('divine_banishment', 'Divine Banishment', 'bow', 78, 16, 3, 7, 150000, { speed: 15, shots: 3, spread: 0.07, trail: '#ffe080' });
defModWeapon('holy_exiler', 'Holy Exiler', 'gun', 70, 12, 3, 7, 150000, { speed: 16, pierce: 2, trail: '#fff0c0' });
defModWeapon('sacred_daze', 'Sacred Daze', 'magic', 76, 18, 4, 7, 150000, { manaCost: 12, color: '#ffe080', speed: 10, homing: 0.7, shots: 2, spreadAng: 0.3, glow: true, life: 120 });
defModWeapon('priest_staff', 'Priest Staff', 'summon', 62, 30, 3, 7, 150000, { manaCost: 10, minion: { color: '#f0e8ff', shape: 'orb', ranged: true, rate: 24, speed: 6, ghost: true } });
defModWeapon('swordstorm_staff', 'Swordstorm Staff', 'magic', 80, 14, 5, 7, 150000, { manaCost: 10, color: '#e0e0ff', speed: 12, desc: 'Calls swords down from the sky at the cursor' });
ITEMS.swordstorm_staff.use = (g, s, it) => { const p = g.player; const cost = it.manaCost; if (p.mana < cost) { if (g.useHeld === 1) g.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return; } p.mana -= cost; p.manaRegenDelay = 40; const st = itemStats(s); const dmg = Math.round(st.damage * p.pm.dmg * (p.pm.magicDmg || 1)); for (let k = 0; k < 3; k++) { const x = g.mouse.wx + rand(-50, 50); modShot(g, x, g.mouse.wy - 400, rand(-1, 1), 12, { damage: dmg, color: '#e0e0ff', life: 70, crit: Math.random() * 100 < st.crit + p.pm.crit, magic: true, knockback: st.knockback }); } Weapons.finish(g, s, st); Audio_.play('swing'); };
ACC('preist_cloak', "Priest's Cloak", { rarity: 7, value: 150000, tooltip: '+6 life regeneration, 10% damage reduction, +50 max mana', regen: 6, dr: 0.1, manaBonus: 50 }, genericIcon('#f0e8ff', '#ffe080', 'wings'));

class Noehtnap extends BossBase {
  constructor(x, y) { super(x, y, 34, 60, 'noehtnap'); this.setState('cast'); this.noContact = true; this.alpha = 1; }
  ai(world, p, game) {
    const low = this.hp < this.maxHp * 0.5;
    switch (this.state) {
      case 'start': case 'cast': { this.hoverTo(p.cx + (p.cx < this.cx ? 200 : -200), p.y - 80, 6); if (this.st % 26 === 0) { const b = this.shoot(game, p, { speed: 8, color: '#5020a0', hi: '#c080ff', name: 'dark bolt', size: 6 }); b.accel = 1.01; } if (this.st > 150) this.setState(choose(['blink', 'constructs', 'warning'])); break; }
      case 'blink': { this.alpha = Math.max(0, 1 - this.st / 15); if (this.st === 15) { this.x = p.cx + p.dir * 120 - this.w / 2; this.y = p.y - 20; FX.burst(game, this.cx, this.cy, 14, '#5020a0', 4, 25); } if (this.st > 15) this.alpha = Math.min(1, (this.st - 15) / 10); if (this.st === 28) { for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 6, Math.sin(a) * 6, { owner: this, color: '#5020a0', hi: '#c080ff', damage: Math.round(this.damage * 0.7), sourceName: "Noehtnap's shadow burst", size: 6, life: 120 }); } } if (this.st > 50) this.setState('cast'); break; }
      case 'constructs': { this.hoverTo(p.cx, p.y - 200, 5); if (this.st === 20 && game.enemies.filter(e => e.type === 'etimsic_construct' && !e.dead).length < (low ? 5 : 3)) for (let k = -1; k <= 1; k++) this.spawnMinion(game, 'etimsic_construct', this.cx + k * 60, this.cy); if (this.st > 80) this.setState('cast'); break; }
      case 'warning': { this.hoverTo(p.cx + 300, p.y - 40, 7); if (this.st === 20) { game.addDamageText(this.cx, this.y - 30, 'WARNING', '#ff4040'); FX.telegraph(this.cx, this.cy, this.cx - 1400, this.cy, '#ff4040', 40, 12); } if (this.st === 60) { for (let s = 1; s <= 30; s++) Gensokyo.bullet(game, this.cx - s * 45, this.cy, 0, 0, { owner: this, color: '#ff4040', hi: '#fff', damage: Math.round(this.damage * 1.1), sourceName: "Noehtnap's obliteration beam", size: 10, life: 30 }); FX.shake(8, 20); FX.flash('#400040', 10, 0.4); } if (this.st > 100) this.setState('cast'); break; }
    }
  }
  draw(ctx, camX, camY) { ctx.save(); ctx.globalAlpha = this.alpha * (this.hitFlash > 0 ? 0.6 : 1); drawHumanoid(ctx, this.x - camX, this.y - camY, { dir: this.dir, walk: null, air: true, colors: { skin: '#3a2a4a', hair: '#100818', shirt: '#201030', pants: '#100818', shoes: '#000', eye: '#ff4040' }, armAngle: null, item: null, hairStyle: 1 }); ctx.fillStyle = 'rgba(40,10,60,0.85)'; ctx.beginPath(); ctx.moveTo(snap(this.x - camX) - 6, snap(this.y - camY) + 8); ctx.lineTo(snap(this.x - camX) + 26, snap(this.y - camY) + 8); ctx.lineTo(snap(this.x - camX) + 32, snap(this.y - camY) + 66); ctx.lineTo(snap(this.x - camX) - 12, snap(this.y - camY) + 66); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
}
defBEnemy('etimsic_construct', Object.assign(FLY('Etimsic Construct', 900, 60, 30, 'eye', '#3a2a5a', [{ id: 'etims', chance: 0.6, min: 1, max: 2 }]), { cls: Shooter, rate: 80, bullet: '#c080ff', w: 26, h: 26, speed: 3.5 }));
defModMaterial('etims', 'Etims', { color: '#5020a0', hi: '#c080ff', rarity: 8, value: 8000, tooltip: 'Dark matter shed by Noehtnap and its constructs' });
defBoss('noehtnap', { name: 'Noehtnap', order: 5.3, hp: 42000, damage: 72, defense: 42, blood: '#5020a0', cls: Noehtnap, expertMult: 1.5, coins: 150000, leash: 300, teleportWhenFar: true, dayDespawn: true,
  summon: 'ritual_interrupter', spawn: 'Use a Ritual Interrupter (8 Ectoplasm + 10 Souls of Night + 3 Beetle Husks at a Mythril Anvil) at night, after Golem.', info: 'A cloaked figure from the dark. Fires accelerating dark bolts, blinks next to you and bursts shadows, summons Etimsic Constructs and, after a WARNING, sweeps a huge obliteration beam across the screen.',
  loot: ['etims', 'etims_sword', 'black_hole_staff', 'bloody_medalion', 'amulet_of_patience', 'doppleganger'], collectibles: ['noehtnap_trophy', 'noehtnap_mask'], despawn: 'Noehtnap melts into the shadows...',
  drops: [{ id: 'etims', min: 10, max: 18 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['etims_sword', 'black_hole_staff', 'bloody_medalion', 'amulet_of_patience'], expertItem: 'doppleganger' });
Bosses.summonItem('ritual_interrupter', 'noehtnap', { name: 'Ritual Interrupter', tooltip: 'Summons Noehtnap at night (after Golem)', icon: summonIcon('#5020a0', '#ff4040'), night: true, where: (g) => ModLib.beaten(g, 'golem'), whereMsg: 'Nothing answers... (defeat Golem first)', recipe: [['ectoplasm', 8], ['soul_of_night', 10], ['beetle_husk', 3]], station: 'mythril_anvil' });
defModWeapon('etims_sword', 'Etims Sword', 'sword', 104, 18, 6, 8, 200000, { swingProj: { color: '#c080ff', speed: 11, homing: 0.4 }, mat: 'silver', recipe: [['etims', 12], ['hallowed_bar', 8]], station: 'mythril_anvil' });
defModWeapon('black_hole_staff', 'Black Hole Staff', 'magic', 82, 26, 2, 8, 200000, { manaCost: 18, color: '#200830', hi: '#c080ff', speed: 6, pierce: 999, ghost: true, life: 150, glow: true, desc: 'A black hole that drags enemies in', blackHole: true });
ModLib.on('projTick', (g, b) => { if (!b.blackHole || !b.friendly) return; for (const e of g.enemies) { if (e.dead || e.isBoss) continue; const d = dist(e.cx, e.cy, b.x, b.y); if (d < 10 * TILE && d > 4) { e.x += (b.x - e.cx) / d * 2.5; e.y += (b.y - e.cy) / d * 2.5; } } if (b.life % 10 === 0) b.hitSet.clear(); });
ITEMS.black_hole_staff.use = (g, s, it) => { const r = Weapons.magic(g, s, it); const b = g.projectiles[g.projectiles.length - 1]; if (b && b.friendly) b.blackHole = true; return r; };
ACC('bloody_medalion', 'Bloody Medallion', { rarity: 8, value: 150000, tooltip: '+30% magic damage; magic attacks also cost 2 life', bloodyMedallion: true }, genericIcon('#a02040', '#ffe060', 'ring'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'bloody_medalion')) pm.magicDmg = (pm.magicDmg || 1) * 1.3; });
ModLib.on('swing', (g, it) => { if (it && (it.wclass === 'magic' || it.magic) && ModLib.hasAcc(g.player, 'bloody_medalion') && g.player.hp > 5) g.player.hp -= 2; });
ACC('amulet_of_patience', 'Amulet of Patience', { rarity: 8, value: 150000, tooltip: '20% damage reduction and +10% damage while standing still', patience: true }, genericIcon('#5020a0', '#ffe060', 'ring'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'amulet_of_patience') && Math.abs(p.vx) < 0.1 && p.onGround) { pm.modDr = (pm.modDr || 0) + 0.2; pm.dmg *= 1.1; } });
ACC('doppleganger', 'Doppleganger', { rarity: 8, value: 200000, tooltip: 'Mirrors your strongest side: +12% damage, +12% crit, +8 defense, 8% damage reduction', dmg: 12, crit: 12, defense: 8, dr: 0.08 }, genericIcon('#3a2a4a', '#ff4040', 'orb'));

// Invaders event + Invader Battleship ---------------------------------------------------------------
defBEnemy('invader_fighter', Object.assign(FLY('Invader Fighter', 900, 70, 36, 'eye', '#4060a0', [{ id: 'invader_plating', chance: 0.4, min: 1, max: 2 }]), { cls: Shooter, rate: 60, bullet: '#40ffff', bulletName: 'blast', bulletSpeed: 8, w: 30, h: 18, speed: 5, ghostShots: true }));
defBEnemy('invader_caster', Object.assign(FLY('Invader Caster', 800, 64, 30, 'eye', '#6040a0', [{ id: 'invader_plating', chance: 0.4, min: 1, max: 2 }]), { cls: HomingShooter, rate: 90, bullet: '#c060ff', bulletName: 'sphere', homing: 0.2, w: 26, h: 30, speed: 3 }));
defBEnemy('invader_elite', WALK('Invader Elite', 1400, 80, 44, 2.2, { skin: '#8090b0', hair: '#203050', shirt: '#4060a0', pants: '#304070', shoes: '#202030', eye: '#40ffff' }, [{ id: 'invader_plating', chance: 0.6, min: 1, max: 3 }], { armed: false }));
defBEnemy('invader_behemoth', { name: 'Invader Behemoth', cls: Beast, hp: 6000, damage: 95, defense: 50, kbResist: 0.95, speed: 1.2, charge: 7, chargeEvery: 150, w: 70, h: 60, blood: '#4060a0', rate: 120, bullet: '#40ffff', bulletName: 'beam', bulletSpeed: 9, bulletSize: 8, miniboss: true, drops: [{ id: 'invader_plating', chance: 1, min: 4, max: 8 }], draw: (c, e) => { c.fillStyle = '#4060a0'; c.fillRect(-35, -50, 70, 40); c.fillStyle = '#304070'; c.fillRect(-30, -10, 14, 10); c.fillRect(-8, -10, 14, 10); c.fillRect(16, -10, 14, 10); c.fillStyle = '#8090b0'; c.fillRect(20, -60, 24, 20); c.fillStyle = '#40ffff'; c.fillRect(36, -54, 6, 6); c.fillRect(-25 + (e.t % 40 < 20 ? 0 : 4), -40, 8, 8); } });
defModMaterial('invader_plating', 'Invader Plating', { color: '#4060a0', hi: '#40ffff', rarity: 8, value: 6000, tooltip: 'Alloy plating from the Invaders' });
class InvaderBattleship extends BossBase {
  constructor(x, y) { super(x, y, 220, 60, 'invader_battleship'); this.setState('cruise'); this.noContact = true; }
  setup(game) {
    const mk = (name, hp, ox, oy, w, h, type, col) => { const q = new BossPart(this, w, h, { name, hp, damage: this.damage, defense: 40, type, offset: { x: ox, y: oy }, draw: (part, ctx, cx, cy) => { const x = snap(part.x - cx), y = snap(part.y - cy); ctx.globalAlpha = part.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = col; ctx.fillRect(x, y, part.w, part.h); ctx.fillStyle = '#40ffff'; ctx.fillRect(x + part.w / 2 - 3, y + part.h / 2 - 3, 6, 6); ctx.globalAlpha = 1; } }); game.enemies.push(q); return q; };
    this.gun = mk('Front Gun', Math.round(this.maxHp * 0.25), 90, 10, 40, 24, 'battleship_gun', '#5070b0');
    this.launcher = mk('Missile Launcher', Math.round(this.maxHp * 0.25), -70, -18, 44, 20, 'battleship_launcher', '#6080c0');
    this.engine = mk('Engine', Math.round(this.maxHp * 0.2), -100, 14, 30, 30, 'battleship_engine', '#405090');
  }
  get partsAlive() { return this.parts.filter(q => !q.dead).length; }
  hit(dmg, fromX, kb, game, swingId, crit) { if (this.partsAlive > 0) { if (game.world.time % 20 === 0) game.addDamageText(this.cx, this.y - 20, 'destroy the ship parts first', '#aaa'); return false; } return super.hit(dmg, fromX, 0, game, swingId, crit); }
  ai(world, p, game) {
    const spd = this.engine && !this.engine.dead ? 6 : 3;
    this.dir = p.cx > this.cx ? 1 : -1;
    switch (this.state) {
      case 'start': case 'cruise': { this.hoverTo(p.cx + Math.sin(this.t * 0.01) * 300, p.y - 220, spd, 0.04); if (this.gun && !this.gun.dead && this.st % 40 === 0) { const b = this.shoot(game, p, { x: this.gun.cx, y: this.gun.cy, speed: 9, color: '#40ffff', name: 'front gun', size: 6 }); b.ghost = true; } if (this.launcher && !this.launcher.dead && this.st % 90 === 0) for (let k = -1; k <= 1; k += 2) { const b = Gensokyo.bullet(game, this.launcher.cx, this.launcher.cy, k * 3, -4, { owner: this, color: '#ff8040', hi: '#fff', damage: Math.round(this.damage * 0.9), sourceName: "the Battleship's missile", size: 7, life: 320 }); b.homing = 0.2; } if (this.st > 300) this.setState(this.partsAlive ? 'drones' : 'judgement'); break; }
      case 'drones': { this.hoverTo(p.cx, p.y - 260, spd, 0.04); if (this.st === 20 && game.enemies.filter(e => e.type === 'strike_drone' && !e.dead).length < 4) for (let k = -1; k <= 1; k += 2) this.spawnMinion(game, 'strike_drone', this.cx + k * 80, this.cy + 40); if (this.st > 60) this.setState('cruise'); break; }
      case 'judgement': { this.hoverTo(p.cx, p.y - 300, 7, 0.05); if (this.st === 30) FX.telegraph(this.cx, this.cy, this.cx, this.cy + 900, '#ff4040', 40, 30); if (this.st === 70) { for (let s = 1; s <= 24; s++) Gensokyo.bullet(game, this.cx, this.cy + s * 36, 0, 0, { owner: this, color: '#ff4040', hi: '#fff', damage: Math.round(this.damage * 1.2), sourceName: "the Battleship's Judgement beam", size: 14, life: 40 }); FX.shake(10, 25); FX.flash('#ff8080', 10, 0.4); } if (this.st > 120) this.setState('cruise'); break; }
    }
  }
  draw(ctx, camX, camY) { const x = snap(this.x - camX), y = snap(this.y - camY); ctx.save(); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#4060a0'; ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x + 200, y + 10); ctx.lineTo(x + 220, y + 30); ctx.lineTo(x + 200, y + 60); ctx.lineTo(x + 20, y + 60); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#304070'; ctx.fillRect(x + 60, y, 80, 22); ctx.fillStyle = this.partsAlive ? '#203050' : '#40ffff'; ctx.fillRect(x + 100, y + 28, 20, 20); ctx.fillStyle = '#40ffff'; for (let k = 0; k < 6; k++) ctx.fillRect(x + 30 + k * 28, y + 40, 8, 4); ctx.restore(); ctx.globalAlpha = 1; }
}
defBEnemy('strike_drone', Object.assign(FLY('Strike Drone', 500, 60, 24, 'eye', '#5070b0', []), { cls: Shooter, rate: 50, bullet: '#40ffff', w: 18, h: 14, speed: 6, ghostShots: true }));
defBoss('invader_battleship', { name: 'Invader Battleship', order: 5.35, hp: 48000, damage: 78, defense: 50, blood: '#4060a0', cls: InvaderBattleship, expertMult: 1.5, coins: 200000, spawnUp: 260,
  summon: 'invasion_caller', spawn: 'Arrives at the end of the Invaders event (Invasion Caller: 8 Martian Conduits + 5 Lenses + 5 Hallowed Bars at a Mythril Anvil, after Golem).', info: 'A warship with a Front Gun, a Missile Launcher and an Engine, each with its own life. The hull is immune until all three are destroyed; losing the engine slows it. Launches Strike Drones and, once exposed, fires the Judgement beam straight down.',
  loot: ['invader_plating', 'invader_catalyst', 'invader_shooter', 'invade_fork', 'invader_id_card'], collectibles: ['invader_battleship_trophy', 'invader_battleship_mask'], despawn: 'The Invader Battleship warps out...',
  drops: [{ id: 'invader_plating', min: 15, max: 30 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['invader_catalyst', 'invader_shooter', 'invade_fork'], expertItem: 'invader_id_card' });
EVENT_DEFS.invaders = { mod: 'qwerty_bosses', name: 'The Invaders', waves: [{ kills: 12, pool: ['invader_fighter', 'invader_caster'], sky: true }, { kills: 18, pool: ['invader_fighter', 'invader_caster', 'invader_elite'] }, { kills: 24, pool: ['invader_fighter', 'invader_elite', 'invader_behemoth'], boss: 'invader_battleship' }], color: '#40ffff', done: 'The Invaders have been repelled!' };
defItem('invasion_caller', { name: 'Invasion Caller', max: 20, consumable: true, rarity: 8, tooltip: 'Calls the Invaders (after Golem)', drawIcon: genericIcon('#4060a0', '#40ffff', 'box'), onUse: (g, slot) => { if (!ModLib.beaten(g, 'golem')) { g.message('The signal goes unanswered... (defeat Golem first)', '#ff8080'); return; } if (Events.start(g, 'invaders')) g.consumeSlot(slot); else g.message('An event is already happening!', '#ff8080'); } });
ITEM_VALUES.invasion_caller = 20000; ITEMS.invasion_caller.value = 20000; RECIPES.push({ result: 'invasion_caller', count: 1, station: 'mythril_anvil', ing: [['martian_conduit', 8], ['lens', 5], ['hallowed_bar', 5]] });
defModWeapon('invader_catalyst', 'Invader Catalyst', 'magic', 84, 14, 3, 8, 200000, { manaCost: 9, color: '#c060ff', speed: 12, shots: 2, spreadAng: 0.1, homing: 0.3, glow: true });
defModWeapon('invader_shooter', 'Invader Shooter', 'gun', 72, 8, 2, 8, 200000, { speed: 17, trail: '#40ffff', pierce: 1 });
defModWeapon('invade_fork', 'Invade Fork', 'whip', 74, 24, 4, 8, 200000, { reach: 9, color: '#40ffff', desc: 'Tagged enemies are zapped by summons' });
ACC('invader_id_card', 'Invader ID Card', { rarity: 8, value: 200000, tooltip: 'A strike drone follows you: +1 minion slot, +12% summon damage, minions shoot lasers', minionSlots: 1, summonDmg: 12 }, genericIcon('#40ffff', '#fff', 'box'));
defModArmorSet('invader', 'Invader', { colors: ['#8090b0', '#4060a0', '#203050'], rarity: 8, bar: 'invader_plating', cost: [12, 24, 18], value: 200000, station: 'mythril_anvil', pieces: [['invader_percepticals', 'Invader Percepticals', 'head', 22], ['invader_protector', 'Invader Protector', 'body', 32], ['invader_landers', 'Invader Landers', 'legs', 24]], desc: 'Invader Tech - +15% damage, +10% crit, +20% movement speed, +1 minion slot', bonus: (p, pm) => { pm.dmg *= 1.15; pm.crit += 10; pm.move *= 1.2; pm.minionSlots = (pm.minionSlots || 0) + 1; } });

// Dino Militia event + The Great Tyrannosaurus ----------------------------------------------------------
defBEnemy('utahraptor', { name: 'Utahraptor', cls: Beast, hp: 1100, damage: 72, defense: 34, speed: 3.6, charge: 9, chargeEvery: 70, w: 44, h: 30, blood: '#60a040', drops: [{ id: 'dino_tooth_fragment', chance: 0.4 }], draw: (c) => { c.fillStyle = '#60a040'; c.beginPath(); c.ellipse(0, -14, 22, 11, 0, 0, Math.PI * 2); c.fill(); c.fillRect(14, -30, 14, 12); c.fillStyle = '#3a6a28'; c.fillRect(-10, -6, 6, 6); c.fillRect(4, -6, 6, 6); c.fillRect(-36, -18, 16, 5); c.fillStyle = '#ffe060'; c.fillRect(22, -27, 3, 3); c.fillStyle = '#404040'; c.fillRect(6, -2, 6, 3); } });
defBEnemy('velocichopper', Object.assign(FLY('Velocichopper', 900, 66, 30, 'eye', '#a08040', [{ id: 'dino_tooth_fragment', chance: 0.3 }]), { cls: Shooter, rate: 45, bullet: '#ffe060', bulletName: 'minigun round', bulletSpeed: 10, w: 40, h: 22, speed: 4.5 }));
defBEnemy('triceratank', { name: 'Triceratank', cls: Beast, hp: 3500, damage: 80, defense: 60, kbResist: 0.95, speed: 1, w: 70, h: 44, blood: '#708060', rate: 110, bullet: '#404040', bulletName: 'cannonball', bulletSpeed: 8, bulletSize: 9, arc: true, bulletMult: 1, drops: [{ id: 'dino_tooth_fragment', chance: 0.7, min: 1, max: 2 }], draw: (c) => { c.fillStyle = '#708060'; c.fillRect(-35, -34, 60, 26); c.fillStyle = '#506040'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(-28 + k * 14, -6, 6, 0, Math.PI * 2); c.fill(); } c.fillStyle = '#809070'; c.fillRect(20, -44, 20, 20); c.fillStyle = '#e0e0c0'; c.fillRect(36, -40, 12, 3); c.fillRect(36, -32, 12, 3); c.fillStyle = '#404040'; c.fillRect(-10, -46, 30, 6); } });
defBEnemy('anti_air', { name: 'Anti Air', cls: Beast, hp: 1500, damage: 60, defense: 40, stationary: true, w: 40, h: 30, blood: '#606060', rate: 60, bullet: '#ff8040', bulletName: 'rocket', bulletSpeed: 7, homing: 0.15, range: 40, drops: [{ id: 'dino_tooth_fragment', chance: 0.3 }], draw: (c, e) => { c.fillStyle = '#606060'; c.fillRect(-20, -14, 40, 14); c.fillStyle = '#808080'; c.save(); c.rotate(-0.8); c.fillRect(0, -30, 8, 30); c.restore(); c.fillStyle = '#ff8040'; c.fillRect(-4, -20, 4, 4); } });
defBEnemy('mosquitto', FLY('Mosquitto', 300, 44, 10, 'bat', '#8060a0', [], { erratic: true, speed: 6, w: 16, h: 12 }));
defModMaterial('dino_tooth_fragment', 'Dino Tooth Fragment', { color: '#e0e0c0', hi: '#fff', rarity: 7, value: 3000, tooltip: 'Dropped by the Dino Militia' });
class GreatTyrannosaurus extends BossBase {
  constructor(x, y) { super(x, y, 120, 100, 'great_tyrannosaurus'); this.flying = false; this.canStep = true; this.setState('walk'); }
  ai(world, p, game) {
    this.updateLiquidState(world);
    switch (this.state) {
      case 'start': case 'walk': { this.dir = p.cx > this.cx ? 1 : -1; this.vx = lerp(this.vx, this.dir * 3, 0.06); if (this.st > 100) this.setState(choose(['stomp', 'bite', 'gun', 'roar'])); break; }
      case 'stomp': { this.vx *= 0.8; if (this.st === 20 && this.onGround) this.vy = -12; if (this.st > 20 && this.onGround && !this.stomped) { this.stomped = true; FX.shake(10, 25); Audio_.play('kill'); for (let k = 1; k <= 8; k++) for (const s of [-1, 1]) Gensokyo.bullet(game, this.cx + s * k * 40, this.y + this.h - 8, s * 2, -3 - k * 0.3, { owner: this, color: '#a08040', damage: Math.round(this.damage * 0.7), sourceName: "the Tyrannosaurus' stomp", size: 7, life: 70 }).gravity = 0.25; } if (this.st > 70) { this.stomped = false; this.setState('walk'); } break; }
      case 'bite': { if (this.st === 1) FX.telegraph(this.cx, this.cy, this.cx + this.dir * 400, this.cy, '#60a040', 20, 10); if (this.st > 20 && this.st < 45) this.vx = this.dir * 12; if (this.st > 60) this.setState('walk'); break; }
      case 'gun': { this.vx *= 0.8; if (this.st === 15) FX.telegraph(this.cx, this.y + 30, p.cx, p.cy, '#ff4040', 30, 8); if (this.st >= 45 && this.st < 75 && this.st % 3 === 0) { const dx = p.cx - this.cx, dy = p.cy - (this.y + 30), d = Math.hypot(dx, dy) || 1; Gensokyo.bullet(game, this.cx + this.dir * 40, this.y + 30, dx / d * 12, dy / d * 12, { owner: this, color: '#ff4040', hi: '#fff', damage: Math.round(this.damage * 0.6), sourceName: "the Tyrant's Extinction Gun", size: 6, life: 80 }); } if (this.st > 100) this.setState('walk'); break; }
      case 'roar': { this.vx = 0; if (this.st === 20) { FX.shake(8, 25); Audio_.play('zombie'); if (dist(this.cx, this.cy, p.cx, p.cy) < 20 * TILE) p.addBuff('Slow', 150); if (game.enemies.filter(e => e.minion && !e.dead).length < 6) for (let k = 0; k < 2; k++) this.spawnMinion(game, choose(['utahraptor', 'mosquitto']), this.cx + rand(-200, 200), this.y - 60); } if (this.st > 60) this.setState('walk'); break; }
    }
    this.applyGravity(); this.moveAndCollide(world); if (this.collidedX && this.onGround) this.vy = -12;
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.y - camY); ctx.save(); ctx.translate(x, y + this.h); if (this.dir < 0) ctx.scale(-1, 1); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#60a040'; ctx.beginPath(); ctx.ellipse(-10, -50, 50, 26, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-50, -60); ctx.lineTo(-110, -70); ctx.lineTo(-52, -40); ctx.fill(); ctx.fillRect(30, -100, 46, 34); ctx.fillStyle = '#3a6a28'; ctx.fillRect(-30, -30, 22, 30); ctx.fillRect(6, -30, 22, 30); ctx.fillRect(-40, -34, 46, 6); ctx.fillStyle = '#e0e0c0'; for (let k = 0; k < 4; k++) ctx.fillRect(44 + k * 8, -70, 4, 5); ctx.fillStyle = '#ffe060'; ctx.fillRect(60, -92, 6, 6); ctx.fillStyle = '#404040'; ctx.fillRect(20, -74, 30, 8); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('great_tyrannosaurus', { name: 'The Great Tyrannosaurus', order: 5.36, hp: 55000, damage: 88, defense: 40, blood: '#60a040', cls: GreatTyrannosaurus, flying: false, expertMult: 1.5, coins: 200000, spawnUp: 60, spawnDist: 450,
  summon: 'dino_egg', spawn: 'Leads the last wave of the Dino Militia (Dino Egg: 10 Fossils + 1 Lihzahrd Power Cell + 3 Beetle Husks at a Mythril Anvil, after Golem).', info: 'The militia commander. Stomps for a ground shockwave, bites with a long charge, fires the Tyrant\'s Extinction Gun and roars raptors into the fight.',
  loot: ['dino_tooth', 'dino_vulcan', 'dino_flail', 'tricerashield', 'the_tyrants_extinction_gun'], collectibles: ['great_tyrannosaurus_trophy', 'great_tyrannosaurus_mask'], despawn: 'The Great Tyrannosaurus retreats...',
  drops: [{ id: 'dino_tooth_fragment', min: 10, max: 18 }, { id: 'greater_healing', min: 5, max: 8 }], oneOf: ['dino_vulcan', 'dino_flail', 'the_tyrants_extinction_gun', 'tricerashield'], expertItem: 'dino_tooth' });
EVENT_DEFS.dino_militia = { mod: 'qwerty_bosses', name: 'Dino Militia', waves: [{ kills: 12, pool: ['utahraptor', 'mosquitto', 'velocichopper'] }, { kills: 18, pool: ['utahraptor', 'velocichopper', 'anti_air', 'triceratank'] }, { kills: 24, pool: ['utahraptor', 'triceratank', 'velocichopper', 'mosquitto'], boss: 'great_tyrannosaurus' }], color: '#60a040', done: 'The Dino Militia has been driven off!' };
defItem('dino_egg', { name: 'Dino Egg', max: 20, consumable: true, rarity: 8, tooltip: 'Summons the Dino Militia (after Golem)', drawIcon: genericIcon('#e0e0c0', '#60a040', 'orb'), onUse: (g, slot) => { if (!ModLib.beaten(g, 'golem')) { g.message('The egg stays quiet... (defeat Golem first)', '#ff8080'); return; } if (Events.start(g, 'dino_militia')) g.consumeSlot(slot); else g.message('An event is already happening!', '#ff8080'); } });
ITEM_VALUES.dino_egg = 20000; ITEMS.dino_egg.value = 20000; RECIPES.push({ result: 'dino_egg', count: 1, station: 'mythril_anvil', ing: [['fossil', 10], ['lihzahrd_power_cell', 1], ['beetle_husk', 3]] });
ACC('dino_tooth', 'Dino Tooth', { rarity: 8, value: 200000, tooltip: '+14% melee damage, +8 defense, melee hits inflict Bleeding', dmg: 14, defense: 8, dinoTooth: true }, genericIcon('#e0e0c0', '#60a040', 'box'));
ACC('tricerashield', 'Tricerashield', { rarity: 8, value: 200000, tooltip: '14% damage reduction, immunity to knockback, +6 defense', dr: 0.14, defense: 6, slot: 'shield', kbImmune: true }, genericIcon('#708060', '#e0e0c0', 'box'));
defModWeapon('dino_vulcan', 'Dino Vulcan', 'gun', 62, 5, 2, 8, 200000, { speed: 16, spread: 0.1, trail: '#ffe060' });
defModWeapon('dino_flail', 'Dino Flail', 'flail', 96, 30, 9, 8, 200000, { color: '#60a040', range: 16 });
defModWeapon('the_tyrants_extinction_gun', "The Tyrant's Extinction Gun", 'magic', 120, 6, 2, 8, 250000, { manaCost: 6, color: '#ff4040', speed: 18, pierce: 3, ghost: true, life: 40, trail: '#ff4040' });
ModLib.on('enemyHit', (g, e) => { const sel = g.player.selectedItem; if (sel && ITEMS[sel.id].sword && ModLib.hasAcc(g.player, 'dino_tooth')) e.applyDebuff('Poisoned', 240, 1); });

// O.L.O.R.D. --------------------------------------------------------------------------------------------
class OLORD extends BossBase {
  constructor(x, y) { super(x, y, 200, 140, 'olord'); this.setState('hover'); this.noContact = true; }
  setup(game) {
    const mk = (name, hp, ox, oy, type) => { const q = new BossPart(this, 34, 34, { name, hp, damage: this.damage, defense: 50, type, offset: { x: ox, y: oy }, draw: (part, ctx, cx, cy) => { const x = snap(part.cx - cx), y = snap(part.cy - cy); ctx.globalAlpha = part.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = type === 'olord_turret' ? '#606070' : '#ff4040'; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = type === 'olord_turret' ? '#ff8040' : '#fff'; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; } }); game.enemies.push(q); return q; };
    this.turrets = [mk('Turret', Math.round(this.maxHp * 0.1), -80, -40, 'olord_turret'), mk('Turret', Math.round(this.maxHp * 0.1), 80, -40, 'olord_turret'), mk('Turret', Math.round(this.maxHp * 0.1), -80, 50, 'olord_turret'), mk('Turret', Math.round(this.maxHp * 0.1), 80, 50, 'olord_turret')];
    this.weak = [mk('Weak Point', Math.round(this.maxHp * 0.12), 0, -60, 'olord_weak'), mk('Weak Point', Math.round(this.maxHp * 0.12), 0, 60, 'olord_weak')];
    for (const q of this.weak) { const base = BossPart.prototype.hit; q.hit = (dmg, fromX, kb, game, sid, crit) => this.exposed ? base.call(q, dmg, fromX, kb, game, sid, crit) : false; }
  }
  get exposed() { return this.turrets.every(t => t.dead); }
  hit(dmg, fromX, kb, game, swingId, crit) { if (!this.exposed) { if (game.world.time % 20 === 0) game.addDamageText(this.cx, this.y - 20, 'destroy the turrets', '#aaa'); return false; } return super.hit(dmg, fromX, 0, game, swingId, crit); }
  ai(world, p, game) {
    switch (this.state) {
      case 'start': case 'hover': { this.hoverTo(p.cx, p.y - 250, 6, 0.04); for (const t of this.turrets) if (!t.dead && (this.st + t.offset.x) % 45 === 0) { const b = this.shoot(game, p, { x: t.cx, y: t.cy, speed: 10, color: '#ff8040', name: 'turret shot', size: 6 }); b.ghost = true; } if (this.st % 120 === 60) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + this.t * 0.01; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 3, Math.sin(a) * 3, { owner: this, color: '#80ff40', hi: '#fff', damage: Math.round(this.damage * 0.7), sourceName: "O.L.O.R.D.'s radiation orb", size: 8, life: 240 }); b.accel = 1.01; } if (this.st > 300) this.setState('laser'); break; }
      case 'laser': { this.hoverTo(p.cx + (p.cx < this.cx ? 320 : -320), p.y - 60, 8, 0.05); if (this.st === 30) { this.laserA = Math.atan2(p.cy - this.cy, p.cx - this.cx); FX.telegraph(this.cx, this.cy, this.cx + Math.cos(this.laserA) * 1600, this.cy + Math.sin(this.laserA) * 1600, '#ff4040', 40, 24); } if (this.st >= 70 && this.st < 130 && this.st % 4 === 0) { this.laserA += (Math.atan2(p.cy - this.cy, p.cx - this.cx) - this.laserA) * 0.03; for (let s = 1; s <= 34; s++) Gensokyo.bullet(game, this.cx + Math.cos(this.laserA) * s * 46, this.cy + Math.sin(this.laserA) * s * 46, 0, 0, { owner: this, color: '#ff4040', hi: '#fff', damage: Math.round(this.damage * 1.3), sourceName: "O.L.O.R.D.'s obliteration laser", size: 14, life: 6 }); if (this.st % 12 === 0) FX.shake(4, 6); } if (this.st > 160) this.setState('hover'); break; }
    }
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY); ctx.save(); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1; ctx.fillStyle = '#505060'; ctx.beginPath(); ctx.ellipse(x, y, 100, 60, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#303040'; ctx.fillRect(x - 120, y - 12, 240, 24); ctx.fillStyle = this.exposed ? '#ff4040' : '#202028'; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#80ff40'; for (let k = 0; k < 10; k++) ctx.fillRect(x - 90 + k * 20, y + 40, 6, 6); ctx.restore(); ctx.globalAlpha = 1; }
}
defBoss('olord', { name: 'O.L.O.R.D.', order: 7.5, hp: 150000, damage: 120, defense: 70, blood: '#505060', cls: OLORD, expertMult: 1.5, coins: 500000, spawnUp: 300,
  summon: 'olord_summon', spawn: 'Use the O.L.O.R.D. summon (20 Invader Plating + 10 Luminite Bars + 10 Martian Conduits at an Ancient Manipulator) after the Moon Lord.', info: 'The Oversized Laser-emitting Obliteration Radiation-emitting Destroyer. Four turrets protect its core; destroy them to expose it (and its weak points). Fires radiation orb rings and a sweeping obliteration laser.',
  loot: ['superquantum_rifle', 'galactic_enragement', 'overkill', 'seraphim_predator', 'dreadnought_staff', 'gravity_be_gone'], collectibles: ['olord_trophy', 'olord_mask'], despawn: 'O.L.O.R.D. leaves orbit...',
  drops: [{ id: 'invader_plating', min: 20, max: 30 }, { id: 'greater_healing', min: 8, max: 12 }], oneOf: ['superquantum_rifle', 'galactic_enragement', 'overkill', 'seraphim_predator', 'dreadnought_staff'], expertItem: 'gravity_be_gone' });
Bosses.summonItem('olord_summon', 'olord', { name: 'O.L.O.R.D. summon', tooltip: 'Summons the Oversized Laser-emitting Obliteration Radiation-emitting Destroyer (after the Moon Lord)', icon: summonIcon('#505060', '#ff4040'), rarity: 10, where: (g) => ModLib.beaten(g, 'moon_lord'), whereMsg: 'The beacon needs the Moon Lord gone first.', recipe: [['invader_plating', 20], ['luminite_bar', 10], ['martian_conduit', 10]], station: 'ancient_manipulator' });
defModWeapon('superquantum_rifle', 'Superquantum Rifle', 'gun', 165, 9, 4, 10, 500000, { speed: 20, pierce: 3, trail: '#80ff40' });
defModWeapon('galactic_enragement', 'Galactic Enragement', 'magic', 150, 14, 4, 10, 500000, { manaCost: 12, color: '#ff4040', speed: 14, shots: 3, spreadAng: 0.15, homing: 0.4, glow: true, pierce: 2 });
defModWeapon('overkill', 'Overkill', 'sword', 210, 22, 9, 10, 500000, { swingProj: { color: '#ff4040', speed: 12, shots: 3 }, mat: 'silver' });
defModWeapon('seraphim_predator', 'Seraphim Predator', 'yoyo', 185, 25, 7, 10, 500000, { range: 26, color: '#fff0c0' });
defModWeapon('dreadnought_staff', 'Dreadnought Staff', 'summon', 140, 30, 4, 10, 500000, { manaCost: 20, minion: { color: '#505060', shape: 'dragon', ranged: true, rate: 18, speed: 8, projKind: 'bolt', ghost: true } });
ACC('gravity_be_gone', 'Gravity Be Gone', { rarity: 10, value: 400000, tooltip: 'Slow fall, +25% movement speed, infinite flight, +10% damage', featherfall: true, infiniteFlight: true, dmg: 10 }, genericIcon('#80ff40', '#fff', 'orb'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'gravity_be_gone')) { pm.featherfall = true; pm.move *= 1.25; } });

// trophies & masks
for (const [id, name, col] of [['ancient_machine', 'Ancient Machine', '#8a8a7a'], ['rune_ghost', 'Rune Ghost', '#c0a0ff'], ['imperious', 'Imperious', '#e0e0ff'], ['hydra', 'The Hydra', '#60c080'], ['polar_exterminator', 'Polar Exterminator', '#f0f4ff'], ['divine_light', 'The Divine Light', '#ffe080'], ['noehtnap', 'Noehtnap', '#5020a0'], ['invader_battleship', 'Invader Battleship', '#4060a0'], ['great_tyrannosaurus', 'Great Tyrannosaurus', '#60a040'], ['olord', 'O.L.O.R.D.', '#505060']]) {
  CAT(`${id}_trophy`, { name: `${name} Trophy`, max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)', drawIcon: genericIcon(col, '#fff', 'trophy') }, 10000);
  CAT(`${id}_mask`, { name: `${name} Mask`, max: 1, rarity: 2, armor: 'head', defense: 2, vanity: true, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } }, 7500);
}
ModList.current = null;
