// ---------------------------------------------------------------------------
// Ores (terraria.wiki.gg/wiki/Ores): every ore tier with its tile, ore item,
// bar, tools, sword and armor set. Worlds pick one of each alternative pair
// (Copper/Tin, Iron/Lead, Silver/Tungsten, Gold/Platinum, Demonite/Crimtane,
// Cobalt/Palladium, Mythril/Orichalcum, Adamantite/Titanium). Hardmode ores are
// blessed into the world by smashing Demon/Crimson Altars, Chlorophyte grows in
// jungle mud, Meteorite falls from the sky and Luminite comes from the Moon Lord.
// ---------------------------------------------------------------------------
'use strict';

const ORE_TIERS = {};
const ARMOR_SETS = {};
let nextTileId = 47;
function defOreTier(id, name, o) {
  const tid = nextTileId++;
  T[id.toUpperCase() + '_ORE'] = tid;
  const tileName = o.tileName || `${name} Ore`;
  defTile(tid, { name: tileName, hp: o.hp || 120, minPower: o.minPower || 0, drop: `${id}_ore`, color: o.base === 'mud' ? '#5a4030' : o.base === 'sand' ? '#d9c88a' : '#7e7e86', mapColor: o.map, light: o.light || null });
  TILE_PAINTERS[tid] = (c, r) => { (TILE_PAINTERS[o.base === 'mud' ? T.MUD : o.base === 'sand' ? T.SAND : T.STONE] || TILE_PAINTERS[T.STONE])(c, r); blobs(c, r, o.blob, 4, 2); };
  MATERIALS[id] = { M: o.blob[0], m: o.blob[1], d: o.blob[2] };
  defItem(`${id}_ore`, { name: tileName, tile: tid, rarity: o.rarity || 0, material: true });
  defItem(`${id}_bar`, { name: `${name} Bar`, material: true, rarity: o.rarity || 0, drawIcon: (x) => { x.fillStyle = o.blob[1]; x.fillRect(2, 6, 12, 6); x.fillStyle = o.blob[0]; x.fillRect(2, 6, 12, 1); x.fillStyle = o.blob[2]; x.fillRect(2, 11, 12, 1); } });
  ITEM_VALUES[`${id}_ore`] = o.value; ITEM_VALUES[`${id}_bar`] = o.value * (o.perBar || 3) + 50; ITEMS[`${id}_ore`].value = ITEM_VALUES[`${id}_ore`]; ITEMS[`${id}_bar`].value = ITEM_VALUES[`${id}_bar`];
  RECIPES.push({ result: `${id}_bar`, count: 1, station: 'furnace', ing: [[`${id}_ore`, o.perBar || 3], ...(o.barExtra || [])] });
  const r = o.rarity || 0, bar = `${id}_bar`;
  if (o.pick) { defTool(`${id}_pickaxe`, o.pickName || `${name} Pickaxe`, 'pick', id, o.pick, o.pickUse || 15, o.dmg || 6, r); RECIPES.push({ result: `${id}_pickaxe`, count: 1, station: o.station || 'anvil', ing: [[bar, o.cost || 12], ...(o.toolExtra || [])] }); ITEM_VALUES[`${id}_pickaxe`] = o.value * 30; ITEMS[`${id}_pickaxe`].value = o.value * 30; }
  if (o.axe) { defTool(`${id}_axe`, o.axeName || `${name} Axe`, 'axe', id, o.axe, o.pickUse || 15, o.dmg || 6, r); RECIPES.push({ result: `${id}_axe`, count: 1, station: o.station || 'anvil', ing: [[bar, o.cost - 3 || 9], ...(o.toolExtra || [])] }); ITEM_VALUES[`${id}_axe`] = o.value * 25; ITEMS[`${id}_axe`].value = o.value * 25; }
  if (o.hammer) { defTool(`${id}_hammer`, o.hammerName || `${name} Hammer`, 'hammer', id, o.hammer, (o.pickUse || 15) + 4, o.dmg || 6, r); RECIPES.push({ result: `${id}_hammer`, count: 1, station: o.station || 'anvil', ing: [[bar, o.cost - 2 || 10], ...(o.toolExtra || [])] }); ITEM_VALUES[`${id}_hammer`] = o.value * 25; ITEMS[`${id}_hammer`].value = o.value * 25; }
  if (o.sword) { defSword(`${id}_sword`, o.swordName || `${name} Broadsword`, id, o.sword, o.swordUse || 20, 'broad', r); RECIPES.push({ result: `${id}_sword`, count: 1, station: o.station || 'anvil', ing: [[bar, o.cost - 4 || 8], ...(o.toolExtra || [])] }); ITEM_VALUES[`${id}_sword`] = o.value * 30; ITEMS[`${id}_sword`].value = o.value * 30; }
  if (o.armor) defArmorSet(id, o.armorName || name, id, o.armor, r, o.armorCost || [10, 20, 15], bar, o.setBonus, o.setDesc, o.armorExtra, o.station || 'anvil');
  ORE_TIERS[id] = Object.assign({ id, name, tile: tid }, o);
  return tid;
}
// armor set: three pieces + a set bonus applied through the player-mod hooks
function defArmorSet(set, name, mat, def, rarity, cost, bar, bonus, desc, extra, station = 'anvil') {
  const pieces = [[`${set}_helmet`, `${name} Helmet`, 'head', def[0], cost[0]], [`${set}_breastplate`, `${name} Breastplate`, 'body', def[1], cost[1]], [`${set}_leggings`, `${name} Leggings`, 'legs', def[2], cost[2]]];
  for (const [id, nm, slot, d, c] of pieces) {
    if (!ITEMS[id]) defArmor(id, nm, slot, mat, d, rarity);
    ITEMS[id].set = set; if (desc) ITEMS[id].tooltip = `${d} defense. Set bonus: ${desc}`;
    ITEM_VALUES[id] = ITEM_VALUES[id] || (ITEMS[bar] ? (ITEM_VALUES[bar] || 500) * c : 5000); ITEMS[id].value = ITEM_VALUES[id];
    if (bar) RECIPES.push({ result: id, count: 1, station, ing: [[bar, c], ...(extra || [])] });
  }
  ARMOR_SETS[set] = { name, bonus, desc };
}
function activeArmorSet(p) { const a = p.armor; if (!a[0] || !a[1] || !a[2]) return null; const s = ITEMS[a[0].id].set; return s && ITEMS[a[1].id].set === s && ITEMS[a[2].id].set === s ? s : null; }
ModLib.onPlayerMods((p, pm, g) => { const s = activeArmorSet(p); if (s && ARMOR_SETS[s] && ARMOR_SETS[s].bonus) ARMOR_SETS[s].bonus(p, pm, g); });
// existing tiers become sets too (copper/iron/silver/gold/molten)
for (const [set, name, def] of [['copper', 'Copper', [1, 2, 1]], ['iron', 'Iron', [2, 3, 2]], ['silver', 'Silver', [3, 4, 3]], ['gold', 'Gold', [4, 5, 4]]]) { for (const [suffix, slot] of [['helmet', 'head'], ['chainmail', 'body'], ['greaves', 'legs']]) { const it = ITEMS[`${set}_${suffix}`]; if (it) { it.set = set; it.tooltip = `${it.defense} defense. Set bonus: +${set === 'gold' ? 3 : set === 'silver' ? 3 : 2} defense`; } } ARMOR_SETS[set] = { name, bonus: (p, pm) => { pm.defAdd += set === 'gold' || set === 'silver' ? 3 : 2; } }; }
for (const id of ['molten_helmet', 'molten_breastplate', 'molten_greaves']) { ITEMS[id].set = 'molten'; ITEMS[id].tooltip = `${ITEMS[id].defense} defense. Set bonus: +17% melee damage`; }
ARMOR_SETS.molten = { name: 'Molten', bonus: (p, pm) => { pm.dmg *= 1.17; } };

// Pre-Hardmode alternatives ------------------------------------------------------------
defOreTier('tin', 'Tin', { blob: ['#e8e0c0', '#c8b070', '#8a7040'], map: '#c8b070', value: 250, pick: 35, axe: 35, hammer: 35, sword: 8, dmg: 4, pickUse: 22, cost: 12, armor: [1, 2, 1], setDesc: '+2 defense', setBonus: (p, pm) => { pm.defAdd += 2; } });
defOreTier('lead', 'Lead', { blob: ['#c0c8e0', '#7a88a8', '#4a5470'], map: '#7a88a8', value: 300, pick: 43, axe: 45, hammer: 45, sword: 11, dmg: 5, pickUse: 19, cost: 12, armor: [2, 3, 2], setDesc: '+3 defense', setBonus: (p, pm) => { pm.defAdd += 3; } });
defOreTier('tungsten', 'Tungsten', { blob: ['#d0f0e0', '#70b090', '#3a6a50'], map: '#70b090', value: 450, pick: 50, axe: 50, hammer: 50, sword: 12, dmg: 6, pickUse: 17, cost: 12, armor: [3, 4, 3], setDesc: '+3 defense', setBonus: (p, pm) => { pm.defAdd += 3; } });
defOreTier('platinum', 'Platinum', { blob: ['#ffffff', '#c8d8f0', '#7888a8'], map: '#c8d8f0', value: 750, rarity: 1, pick: 59, axe: 55, hammer: 55, sword: 14, dmg: 7, pickUse: 15, cost: 12, armor: [4, 5, 4], setDesc: '+4 defense', setBonus: (p, pm) => { pm.defAdd += 4; } });
// Evil ores: Demonite (Corruption) / Crimtane (Crimson)
defOreTier('demonite', 'Demonite', { blob: ['#b090ff', '#6a3ad0', '#3a1a80'], map: '#7a4ae0', value: 1000, rarity: 1, hp: 150, light: [0.15, 0.05, 0.25], pick: 65, pickName: 'Nightmare Pickaxe', axe: 75, axeName: 'War Axe of the Night', hammer: 55, hammerName: 'The Breaker', sword: 17, swordName: "Light's Bane", dmg: 9, pickUse: 13, cost: 12, toolExtra: [['shadow_scale', 6]], armor: [4, 5, 4], armorName: 'Shadow', armorCost: [10, 20, 15], armorExtra: [['shadow_scale', 10]], setDesc: '+15% melee speed', setBonus: (p, pm) => { pm.useTime *= 0.85; } });
defOreTier('crimtane', 'Crimtane', { blob: ['#ff8080', '#c02030', '#601018'], map: '#c02030', value: 1000, rarity: 1, hp: 150, light: [0.2, 0.05, 0.05], pick: 70, pickName: 'Deathbringer Pickaxe', axe: 70, axeName: 'Blood Lust Cluster', hammer: 60, hammerName: 'Flesh Grinder', sword: 22, swordName: 'Blood Butcherer', dmg: 10, pickUse: 12, cost: 12, toolExtra: [['tissue_sample', 6]], armor: [5, 6, 5], armorName: 'Crimson', armorCost: [10, 20, 15], armorExtra: [['tissue_sample', 10]], setDesc: 'greatly increased life regeneration', setBonus: (p, pm) => { pm.regenAdd += 6; } });
defItem('shadow_scale', { name: 'Shadow Scale', material: true, rarity: 1, tooltip: 'Dropped by the Eater of Worlds', drawIcon: (x) => { x.fillStyle = '#6a3ad0'; x.beginPath(); x.moveTo(8, 1); x.lineTo(14, 6); x.lineTo(8, 15); x.lineTo(2, 6); x.closePath(); x.fill(); x.fillStyle = '#b090ff'; x.fillRect(7, 4, 2, 4); } }); ITEM_VALUES.shadow_scale = 500; ITEMS.shadow_scale.value = 500;
defItem('tissue_sample', { name: 'Tissue Sample', material: true, rarity: 1, tooltip: 'Dropped by the Brain of Cthulhu', drawIcon: (x) => { x.fillStyle = '#c02030'; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ff8080'; x.fillRect(5, 5, 3, 3); x.fillStyle = '#601018'; x.fillRect(9, 9, 3, 2); } }); ITEM_VALUES.tissue_sample = 500; ITEMS.tissue_sample.value = 500;
// Meteorite
defOreTier('meteorite', 'Meteorite', { blob: ['#ffb080', '#b05030', '#5a2010'], map: '#c06040', value: 1000, rarity: 1, hp: 180, minPower: 50, light: [0.3, 0.1, 0.02], hot: true, hammer: 100, hammerName: 'Meteor Hamaxe', pickUse: 14, dmg: 10, cost: 30, perBar: 4, armor: [5, 6, 5], armorName: 'Meteor', armorCost: [10, 20, 15], setDesc: 'the Space Gun costs no mana', setBonus: (p, pm) => { pm.freeSpaceGun = true; } });
defItem('space_gun', { name: 'Space Gun', max: 1, damage: 19, useTime: 17, knockback: 1, magic: true, manaCost: 6, rarity: 1, spark: true, tooltip: '19 magic damage. Uses 6 mana (free with Meteor armor)', drawIcon: (x) => { x.fillStyle = '#a04030'; x.fillRect(2, 7, 11, 4); x.fillStyle = '#60c0ff'; x.fillRect(12, 8, 3, 2); x.fillStyle = '#5a2010'; x.fillRect(3, 11, 3, 4); } });
ITEM_VALUES.space_gun = 20000; ITEMS.space_gun.value = 20000; RECIPES.push({ result: 'space_gun', count: 1, station: 'anvil', ing: [['meteorite_bar', 20]] });
// Hellstone bar
defItem('hellstone_bar', { name: 'Hellstone Bar', material: true, rarity: 3, drawIcon: (x) => { x.fillStyle = '#e04a20'; x.fillRect(2, 6, 12, 6); x.fillStyle = '#ffb060'; x.fillRect(2, 6, 12, 1); x.fillStyle = '#7a2010'; x.fillRect(2, 11, 12, 1); } });
ITEM_VALUES.hellstone_bar = 4000; ITEMS.hellstone_bar.value = 4000; RECIPES.push({ result: 'hellstone_bar', count: 1, station: 'furnace', ing: [['hellstone', 3], ['obsidian', 1]] });
// Hardmode tiers ------------------------------------------------------------------------
defOreTier('cobalt', 'Cobalt', { blob: ['#80c0ff', '#2060d0', '#103070'], map: '#2a6ae0', value: 3500, rarity: 3, hp: 200, minPower: 100, hardmode: true, pick: 110, pickName: 'Cobalt Drill', axe: 110, hammer: 80, sword: 30, swordName: 'Cobalt Sword', dmg: 12, pickUse: 11, cost: 15, armor: [6, 8, 6], armorCost: [10, 20, 15], setDesc: '+15% melee speed and damage', setBonus: (p, pm) => { pm.useTime *= 0.85; pm.dmg *= 1.15; } });
defOreTier('palladium', 'Palladium', { blob: ['#ffd0a0', '#e08040', '#804020'], map: '#e08040', value: 3500, rarity: 3, hp: 200, minPower: 100, hardmode: true, pick: 130, pickName: 'Palladium Drill', axe: 115, hammer: 85, sword: 34, swordName: 'Palladium Sword', dmg: 13, pickUse: 11, cost: 15, armor: [6, 9, 7], armorCost: [10, 20, 15], setDesc: 'Rapid Healing: greatly increased life regeneration after striking an enemy', setBonus: (p, pm) => { if (p.lastHitTime && p.pm && (p.lastHitAge || 0) < 300) pm.regenAdd += 8; } });
defOreTier('mythril', 'Mythril', { blob: ['#c0ffd0', '#40c070', '#206040'], map: '#40c070', value: 5000, rarity: 4, hp: 220, minPower: 110, hardmode: true, pick: 150, pickName: 'Mythril Drill', axe: 130, hammer: 90, sword: 39, swordName: 'Mythril Sword', dmg: 14, pickUse: 10, cost: 15, armor: [7, 12, 9], armorCost: [10, 20, 15], setDesc: '+10% damage, +5% critical strike chance', setBonus: (p, pm) => { pm.dmg *= 1.1; pm.crit += 5; } });
defOreTier('orichalcum', 'Orichalcum', { blob: ['#ffc0e0', '#d040a0', '#702050'], map: '#d040a0', value: 5000, rarity: 4, hp: 220, minPower: 110, hardmode: true, pick: 165, pickName: 'Orichalcum Drill', axe: 140, hammer: 95, sword: 42, swordName: 'Orichalcum Sword', dmg: 15, pickUse: 10, cost: 15, armor: [7, 13, 9], armorCost: [10, 20, 15], setDesc: 'flower petals fall on enemies you strike (+10% damage)', setBonus: (p, pm) => { pm.dmg *= 1.1; } });
defOreTier('adamantite', 'Adamantite', { blob: ['#ff9090', '#d02020', '#701010'], map: '#d02020', value: 7500, rarity: 4, hp: 240, minPower: 150, hardmode: true, pick: 180, pickName: 'Adamantite Drill', axe: 150, hammer: 100, sword: 47, swordName: 'Adamantite Sword', dmg: 17, pickUse: 9, cost: 18, armor: [9, 14, 11], armorCost: [12, 24, 18], setDesc: '+18% melee speed and movement speed', setBonus: (p, pm) => { pm.useTime *= 0.82; pm.move *= 1.18; } });
defOreTier('titanium', 'Titanium', { blob: ['#e0e0f0', '#909ab0', '#404860'], map: '#a0a8c0', value: 7500, rarity: 4, hp: 240, minPower: 150, hardmode: true, pick: 190, pickName: 'Titanium Drill', axe: 160, hammer: 105, sword: 50, swordName: 'Titanium Sword', dmg: 18, pickUse: 9, cost: 18, armor: [9, 15, 11], armorCost: [12, 24, 18], setDesc: 'Shadow Dodge: dodge one attack every 30 s', setBonus: (p, pm) => { pm.shadowDodge = true; } });
defOreTier('chlorophyte', 'Chlorophyte', { base: 'mud', blob: ['#c0ff80', '#50c030', '#206010'], map: '#50c030', value: 9000, rarity: 5, hp: 260, minPower: 180, hardmode: true, light: [0.05, 0.25, 0.05], pick: 200, pickName: 'Chlorophyte Drill', axe: 175, hammer: 110, sword: 70, swordName: 'Chlorophyte Claymore', dmg: 20, pickUse: 8, cost: 18, perBar: 6, armor: [11, 18, 13], armorCost: [12, 24, 18], setDesc: 'a leaf crystal fires at nearby enemies', setBonus: (p, pm) => { pm.leafCrystal = true; } });
defOreTier('luminite', 'Luminite', { blob: ['#e0fff0', '#40e0c0', '#106050'], map: '#40e0c0', value: 15000, rarity: 6, hp: 300, minPower: 200, hardmode: true, light: [0.15, 0.35, 0.3], pick: 225, pickName: 'Luminite Pickaxe', axe: 200, hammer: 120, dmg: 24, pickUse: 7, cost: 12, perBar: 4, station: 'anvil' });
for (const [set, name, def, desc, bonus] of [['solar', 'Solar Flare', [24, 34, 20], '+22% melee damage and a solar shield', (p, pm) => { pm.dmg *= 1.22; pm.defAdd += 4; }], ['vortex', 'Vortex', [14, 28, 18], '+25% ranged damage, stealth when standing still', (p, pm) => { pm.rangedDmg *= 1.25; pm.dmg *= 1.1; }], ['nebula', 'Nebula', [12, 26, 16], '+20% magic damage, nebula boosters', (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.2; pm.regenAdd += 3; }], ['stardust', 'Stardust', [10, 22, 14], 'the Stardust Guardian protects you (+30% damage reduction while below half life)', (p, pm) => { if (p.hp < p.maxHp * 0.5) pm.modDr = (pm.modDr || 0) + 0.3; pm.dmg *= 1.1; }]]) {
  MATERIALS[set] = { solar: { M: '#ffe080', m: '#e05020', d: '#701010' }, vortex: { M: '#a0ffd0', m: '#20a080', d: '#104040' }, nebula: { M: '#ffb0ff', m: '#c040c0', d: '#501050' }, stardust: { M: '#c0e0ff', m: '#4080e0', d: '#102060' } }[set];
  defArmorSet(set, name, set, def, 6, [10, 20, 15], 'luminite_bar', bonus, desc, [['luminite_bar', 0]].filter(x => x[1] > 0));
}

// Ore world data ----------------------------------------------------------------------------
const ORE_PAIRS = [['copper', 'tin'], ['iron', 'lead'], ['silver', 'tungsten'], ['gold', 'platinum']];
const HM_ORE_PAIRS = [['cobalt', 'palladium'], ['mythril', 'orichalcum'], ['adamantite', 'titanium']];
const Ores = {
  tileOf(id) { return id === 'copper' ? T.COPPER : id === 'iron' ? T.IRON : id === 'silver' ? T.SILVER : id === 'gold' ? T.GOLD : T[id.toUpperCase() + '_ORE']; },
  // world creation: pick alternatives and convert the base veins
  chooseAlternatives(world, rng) {
    world.altOres = {};
    for (const [a, b] of ORE_PAIRS) world.altOres[a] = rng() < 0.5 ? a : b;
    for (const [a, b] of HM_ORE_PAIRS) world.altOres[a] = rng() < 0.5 ? a : b;
    for (const [a] of ORE_PAIRS) { const pick = world.altOres[a]; if (pick === a) continue; const from = this.tileOf(a), to = this.tileOf(pick); for (let i = 0; i < world.tiles.length; i++) if (world.tiles[i] === from) world.tiles[i] = to; }
  },
  // altar smashing: each smash blesses one hardmode ore tier into the world (cobalt -> mythril -> adamantite, repeating)
  bless(game, n) {
    const w = game.world, tier = HM_ORE_PAIRS[n % 3][0], pick = (w.altOres && w.altOres[tier]) || tier, tid = this.tileOf(pick);
    const count = Math.round([260, 200, 150][n % 3] * (w.w * w.h) / (1800 * 600) / (1 + Math.floor(n / 3) * 0.5));
    let placed = 0;
    for (let v = 0; v < count; v++) {
      let x = 10 + Math.floor(Math.random() * (w.w - 20)); let y = w.cavernLine - 80 + Math.floor(Math.random() * (w.h - 80 - w.cavernLine + 80));
      if (y < w.surfaceLine + 40) continue;
      let dx = Math.random() - 0.5, dy = Math.random() - 0.5;
      for (let k = 0; k < 5; k++) { for (let oy = 0; oy < 2; oy++) for (let ox = 0; ox < 2; ox++) { const xx = Math.floor(x) + ox, yy = Math.floor(y) + oy; if (!w.inBounds(xx, yy)) continue; const t = w.tiles[w.idx(xx, yy)]; if (t === T.STONE || t === T.DIRT || t === T.SAND || t === T.ICE || t === T.SNOW || t === T.SANDSTONE || t === T.MUD) { w.rawSet(xx, yy, tid); placed++; w.markMap(xx, yy); } } x += dx * 1.5; y += dy * 1.5; dx += (Math.random() - 0.5) * 0.6; dy += (Math.random() - 0.5) * 0.6; }
    }
    game.message(`Your world has been blessed with ${ORE_TIERS[pick].name}!`, '#60c0ff');
    return placed;
  },
  // chlorophyte growth in jungle mud (hardmode)
  tick(world) {
    if (!world.hardmode || world.time % 30 !== 0) return;
    for (let k = 0; k < 4; k++) {
      const x = randInt(10, world.w - 10), y = randInt(world.surfaceLine + 40, world.h - 80);
      if (world.get(x, y) !== T.MUD) continue;
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => world.get(x + dx, y + dy) === T.CHLOROPHYTE_ORE);
      if (!near) continue;
      let count = 0; for (let yy = y - 8; yy <= y + 8; yy++) for (let xx = x - 8; xx <= x + 8; xx++) if (world.get(xx, yy) === T.CHLOROPHYTE_ORE) count++;
      if (count < 12 && Math.random() < 0.3) world.setTile(x, y, T.CHLOROPHYTE_ORE);
    }
  },
  seedChlorophyte(world, rng) {
    let n = 0;
    const jb = world.bands && world.bands.jungle; const x0 = jb ? Math.floor(jb[0] * world.w) : 10, x1 = jb ? Math.floor(jb[1] * world.w) : world.w - 10;
    for (let k = 0; k < 4000 && n < 80; k++) { const x = randInt(x0, x1), y = randInt(world.surfaceLine + 40, world.h - 80); if (world.get(x, y) === T.MUD) { world.rawSet(x, y, T.CHLOROPHYTE_ORE); world.markMap(x, y); n++; } }
    return n;
  },
  chooseHardmode(world) { for (const [a, b] of HM_ORE_PAIRS) if (!world.altOres[a]) world.altOres[a] = Math.random() < 0.5 ? a : b; },
};
// Titanium's Shadow Dodge and Palladium's rapid healing bookkeeping
ModLib.onIncoming((p, amount, game) => { if (p.pm && p.pm.shadowDodge) { p.dodgeCd = p.dodgeCd || 0; if (p.dodgeCd <= 0 && amount > 0) { p.dodgeCd = 30 * 60; game.addDamageText(p.cx, p.y - 12, 'Shadow Dodge!', '#c0c0ff'); FX.burst(game, p.cx, p.cy, 10, '#c0c0ff', 3, 25); return 0; } } return amount; });
ModLib.on('enemyHit', (game, e, dmg) => { const p = game.player; p.lastHitTime = game.world.time; p.lastHitAge = 0; });
ModLib.onPlayerMods((p, pm, game) => { if (p.dodgeCd > 0) p.dodgeCd--; p.lastHitAge = p.lastHitTime != null ? game.world.time - p.lastHitTime : 9999; if (pm.leafCrystal && game.world.time % 50 === 0 && !p.dead) { let t = null, bd = 16 * TILE; for (const e of game.enemies) { const d = dist(e.cx, e.cy, p.cx, p.cy); if (d < bd) { bd = d; t = e; } } if (t) { const dx = t.cx - p.cx, dy = t.cy - p.y, d = Math.hypot(dx, dy) || 1; const b = new Projectile(p.cx, p.y, dx / d * 9, dy / d * 9, { kind: 'bolt', damage: 40, friendly: true, owner: p, knockback: 2, color: '#80ff60', hi: '#e0ffc0' }); b.life = 60; game.projectiles.push(b); } } });
