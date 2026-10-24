// ---------------------------------------------------------------------------
// Vanilla blocks, bricks, walls and the basic furniture of every material:
// natural blocks, every ore/stone brick smelted at a Furnace, the wood family
// (planks from the Sawmill / Work Bench), gemspark and gemstone blocks, the
// crafted "themed" blocks of the special stations (Solidifier, Bone Welder,
// Sky Mill, Blend-O-Matic...), plus platforms, torches, doors, tables, chairs,
// beds, chests, workbenches and more for each wood / material.
// ---------------------------------------------------------------------------
'use strict';

{
  const B = (id, name, col, o) => VAN.block(id, name, col, o);
  const BW = (id, name, col, o) => VAN.blockAndWall(id, name, col, o);
  const WALL = (id, name, col, o) => VAN.wall(id, name, col, o);
  const R = (result, count, station, ing) => VAN.recipe(result, count, station, ing);

  // ---- the wood family is core (trees drop their biome wood) ----------------------------------------------
  const WOOD_KINDS = { wood: ['Wood', '#a8794b'], rich_mahogany: ['Rich Mahogany', '#b04040'], ebonwood: ['Ebonwood', '#5a3a7a'], shadewood: ['Shadewood', '#7a2a3a'], pearlwood: ['Pearlwood', '#e0c0e0'], boreal_wood: ['Boreal Wood', '#a09080'], palm_wood: ['Palm Wood', '#d0a060'], ash_wood: ['Ash Wood', '#606068'], dynasty_wood: ['Dynasty Wood', '#c04030'], spooky_wood: ['Spooky Wood', '#4a2a10'] };
  for (const id in WOOD_KINDS) {
    const [name, col] = WOOD_KINDS[id];
    if (id !== 'wood') { if (ITEMS[id]) delete ITEMS[id].mod; B(id, name, col, { style: 'wood', value: 20, material: true, tooltip: 'Can be placed or used for crafting' }); }
    for (const r of RECIPES) if (r.result === 'planks' && r.ing[0][0] === id) delete r.mod;
    if (id !== 'wood') WALL(id + '_wall', name + ' Wall', VAN.dark(col, 0.35), { style: 'wood', recipe: [[id, 1]], count: 4 });
    // the furniture of every wood: platform, work bench, table, chair, door, chest, bed, bookcase... (Terraria: Work Bench / Sawmill)
    const F = (suffix, label, w, h, style, ing, station, extra) => VAN.furniture(`${id}_${suffix}`, `${name} ${label}`, w, h, style, col, Object.assign({ recipe: ing, craftAt: station, value: 100 }, extra || {}));
    if (id !== 'wood') {
      B(`${id}_platform`, `${name} Platform`, col, { style: 'wood', solid: false, platform: true, transparent: true, recipe: [[id, 1]], count: 2, station: null, value: 5 });
      F('workbench', 'Work Bench', 2, 1, 'table', [[id, 10]], null, { stations: ['workbench'], platform: true });
      F('chest', 'Chest', 2, 2, 'box', [[id, 8], ['iron_bar', 2]], 'workbench', { solid: false }); R(`${id}_chest`, 1, 'workbench', [[id, 8], ['lead_bar', 2]]);
      VAN.item(`${id}_door`, `${name} Door`, { tile: T.DOOR_C, max: 99, tooltip: 'Right click to open/close', drawIcon: (x) => { x.fillStyle = VAN.dark(col, 0.4); x.fillRect(3, 0, 10, 16); x.fillStyle = col; x.fillRect(4, 1, 8, 14); x.fillStyle = '#e8c040'; x.fillRect(10, 8, 2, 2); } }, 100); R(`${id}_door`, 1, 'workbench', [[id, 6]]); // doors work like the wooden door
      F('table', 'Table', 3, 2, 'table', [[id, 8]], 'workbench', { stations: ['table'], platform: true });
      F('chair', 'Chair', 1, 2, 'chair', [[id, 4]], 'workbench', { stations: ['chair'] });
    }
    F('bed', 'Bed', 4, 2, 'bed', [[id, 15], ['silk', 5]], 'sawmill', { tooltip: 'Right click to set your spawn point (needs a valid house)' });
    F('bookcase', 'Bookcase', 3, 4, 'bookcase', [[id, 20], ['book', 10]], 'sawmill', { stations: ['bookcase'] });
    F('dresser', 'Dresser', 3, 2, 'dresser', [[id, 16]], 'sawmill', {});
    F('piano', 'Piano', 3, 2, 'piano', [['bone', 4], [id, 15], ['book', 1]], 'sawmill', {});
    F('sofa', 'Sofa', 3, 2, 'bench', [[id, 5], ['silk', 2]], 'sawmill', { stations: ['chair'] });
    F('bathtub', 'Bathtub', 4, 2, 'bathtub', [[id, 14]], 'sawmill', {});
    F('lantern', 'Lantern', 1, 2, 'lantern', [['torch', 1], [id, 6]], 'workbench', { light: [0.9, 0.8, 0.5] });
    F('candle', 'Candle', 1, 1, 'candle', [['torch', 1], [id, 4]], 'workbench', { light: [0.6, 0.5, 0.3] });
    F('chandelier', 'Chandelier', 3, 3, 'chandelier', [['torch', 4], [id, 4], ['chain', 1]], 'workbench', { light: [1, 0.9, 0.6] });
    F('lamp', 'Lamp', 1, 3, 'lamp', [['torch', 1], [id, 3]], 'workbench', { light: [0.9, 0.8, 0.5] });
    F('clock', 'Grandfather Clock', 2, 5, 'clock', [[id, 10], ['iron_bar', 3], ['glass', 6]], 'sawmill', {});
    F('sink', 'Sink', 2, 2, 'sink', [[id, 6], ['water_bucket', 1]], 'workbench', { stations: ['water'] });
    F('toilet', 'Toilet', 1, 2, 'toilet', [[id, 6]], 'sawmill', { stations: ['chair'] });
    F('bench', 'Bench', 3, 2, 'bench', [[id, 8]], 'sawmill', { stations: ['chair'] });
    F('sign', 'Sign', 2, 2, 'painting', [[id, 6]], 'workbench', {});
  }
  // the biome trees drop their own wood (the mod version of this only ran while its mod was on)
  const WOOD_BIOMES = { ebonwood: BIOME.CORRUPTION, shadewood: BIOME.CRIMSON, boreal_wood: BIOME.SNOW, rich_mahogany: BIOME.JUNGLE, palm_wood: BIOME.OCEAN, pearlwood: BIOME.HALLOW };
  ModLib.patch(() => { const base = Game.prototype.breakTile; Game.prototype.breakTile = function (tx, ty) { const w = this.world, id = w.get(tx, ty); const tree = id === T.TREE || id === T.TREETOP; const n0 = this.drops.length; base.call(this, tx, ty); if (!tree) return; const b = w.biome[clamp(tx, 0, w.w - 1)]; const wood = Object.keys(WOOD_BIOMES).find(k => WOOD_BIOMES[k] === b) || (ty > (w.h - 70) ? 'ash_wood' : null); if (!wood) return; for (let i = n0; i < this.drops.length; i++) if (this.drops[i].id === 'wood') this.drops[i].id = wood; }; });

  // ---- natural blocks ---------------------------------------------------------------------------------------
  B('silt', 'Silt Block', '#6a6a72', { gravity: true, tooltip: 'Can be extracted for ores and gems' });
  B('slush', 'Slush Block', '#9ab0c0', { gravity: true, tooltip: 'Can be extracted for ores and gems' });
  if (ITEMS.fossil) { ITEMS.fossil.tooltip = 'Can be extracted for fossils and sturdy fossils'; }
  B('thin_ice', 'Thin Ice', '#c8e8ff', { style: 'glass', slippery: true, hp: 10 });
  BW('hardened_sand', 'Hardened Sand Block', '#c8b070', { hp: 60, recipe: [['sand', 2]], station: 'furnace', wallStyle: 'speckle' });
  for (const [pre, name, col] of [['ebon', 'Ebon', '#6a5a80'], ['crim', 'Crim', '#a05050'], ['pearl', 'Pearl', '#d8c8e0']]) {
    BW(`hardened_${pre}sand`, `Hardened ${name}sand Block`, VAN.dark(col, 0.1), { hp: 60, recipe: [[`${pre}sand`, 2]], station: 'furnace' });
    BW(`${pre}sandstone`, `${name}sandstone Block`, col, { style: 'brick', hp: 90, recipe: [[`hardened_${pre}sand`, 1]], station: 'furnace' });
  }
  if (ITEMS.sandstone) { R('sandstone', 1, 'furnace', [['hardened_sand', 1]]); }
  for (const [id, name, col, key] of [['purple_ice', 'Purple Ice Block', '#9070c0', 'CORRUPT_ICE'], ['red_ice', 'Red Ice Block', '#c06070', 'CRIMSON_ICE'], ['pink_ice', 'Pink Ice Block', '#e0a0e0', 'HALLOW_ICE']]) { B(id, name, col, { style: 'glass', slippery: true, key }); TILES[T[key]].drop = id; }
  BW('cloud', 'Cloud Block', '#f0f4ff', { style: 'cloud', hp: 30, tooltip: 'Fall damage is negated when landing on it' });
  B('rain_cloud', 'Rain Cloud Block', '#b0b8c8', { style: 'cloud', hp: 30, recipe: [['cloud', 1], ['water_bucket', 1]], station: 'sky_mill' });
  B('snow_cloud', 'Snow Cloud Block', '#e0e8f4', { style: 'cloud', hp: 30, recipe: [['cloud', 1], ['snow', 1]], station: 'sky_mill' });
  BW('sunplate', 'Sunplate Block', '#e8c860', { style: 'plate', recipe: [['cloud', 1]], station: 'sky_mill', hp: 80 });
  B('wooden_spike', 'Wooden Spike', '#8a6038', { hurt: 60, hp: 60, recipe: [['wood', 5]], station: 'workbench' });
  BW('bone_block', 'Bone Block', '#e8e0c8', { style: 'bone', hp: 80, recipe: [['bone', 2]], station: 'bone_welder' });
  B('crispy_honey', 'Crispy Honey Block', '#a06020', { style: 'honey', hp: 60 });
  if (ITEMS.honey_block) ITEMS.honey_block.tooltip = 'Sticky; slows anything that walks on it';
  B('pumpkin', 'Pumpkin', '#e08020', { style: 'speckle', hp: 30, material: true, tooltip: 'Grows from Pumpkin Seeds' });
  BW('hay', 'Hay', '#d8c060', { style: 'hay', hp: 30, tooltip: 'Cut from tall grass with a Sickle' });
  B('living_mahogany', 'Living Mahogany', '#a04040', { style: 'wood', hp: 60 });
  B('mahogany_leaf', 'Rich Mahogany Leaf Block', '#40a040', { style: 'leaf', hp: 20 });
  B('living_wood', 'Living Wood', '#8a6038', { style: 'wood', hp: 60, key: 'LIVING_WOOD' }); TILES[T.LIVING_WOOD].drop = 'living_wood';
  B('leaf_block', 'Leaf Block', '#50a040', { style: 'leaf', hp: 20, key: 'LEAF_BLOCK' }); TILES[T.LEAF_BLOCK].drop = 'leaf_block';
  B('coralstone', 'Coralstone Block', '#e08090', { style: 'stone', hp: 80, recipe: [['stone', 1], ['coral', 1]], station: 'furnace' });
  for (const [id, name, col] of [['blue_dungeon_brick', 'Blue Dungeon Brick', '#3a4a8a'], ['green_dungeon_brick', 'Green Dungeon Brick', '#3a7a4a'], ['pink_dungeon_brick', 'Pink Dungeon Brick', '#a04a7a']]) BW(id, name, col, { style: 'brick', hp: 300, minPower: 65 });
  BW('lihzahrd_brick', 'Lihzahrd Brick', '#a07040', { style: 'brick', hp: 400, minPower: 210 });
  BW('marble', 'Marble Block', '#d8d8e0', { style: 'stone', hp: 90 });
  BW('granite', 'Granite Block', '#404858', { style: 'stone', hp: 90 });
  BW('smooth_marble', 'Smooth Marble Block', '#e8e8f0', { style: 'plate', hp: 90, recipe: [['marble', 1]], station: 'furnace' });
  BW('smooth_granite', 'Smooth Granite Block', '#505868', { style: 'plate', hp: 90, recipe: [['granite', 1]], station: 'furnace' });
  BW('smooth_sandstone', 'Smooth Sandstone Block', '#d0b070', { style: 'plate', hp: 90, recipe: [['sandstone', 1]], station: 'furnace' });
  // ---- gems as blocks: gemstone blocks (Work Bench) and gemspark blocks (20 Glass + 1 Gem) --------------------
  for (const [gem, name, col] of [['amethyst', 'Amethyst', '#a040e0'], ['topaz', 'Topaz', '#e0c040'], ['sapphire', 'Sapphire', '#4060e0'], ['emerald', 'Emerald', '#40c060'], ['ruby', 'Ruby', '#e04040'], ['diamond', 'Diamond', '#c0f0ff'], ['amber', 'Amber', '#e08020']]) {
    if (!ITEMS[gem]) VAN.material(gem, name, col, { shape: 'gem', rarity: 1, value: 3000 });
    BW(`${gem}_gemstone_block`, `${name} Gemstone Block`, col, { style: 'gem', hp: 80, recipe: [['stone', 1], [gem, 1]], station: 'workbench', value: 2000 });
    B(`${gem}_gemspark_block`, `${name} Gemspark Block`, VAN.light(col, 0.2), { style: 'crystal', light: VAN.hex(col).map(v => v / 255 * 0.9), hp: 40, recipe: [['glass', 20], [gem, 1]], count: 20, station: 'workbench', value: 100 });
    WALL(`${gem}_gemspark_wall`, `${name} Gemspark Wall`, VAN.dark(col, 0.2), { style: 'tile', recipe: [[`${gem}_gemspark_block`, 1]], count: 4 });
  }
  BW('crystal_block', 'Crystal Block', '#f0c0ff', { style: 'crystal', light: [0.5, 0.3, 0.6], hp: 80, recipe: [['crystal_shard', 1], ['stone', 1]], count: 5, station: 'furnace' });
  // ---- bricks: ore / stone + Stone at a Furnace -----------------------------------------------------------------
  BW('red_brick', 'Red Brick', '#b04030', { style: 'brick', hp: 80, recipe: [['clay', 2]], station: 'furnace' });
  BW('mudstone_brick', 'Mudstone Brick', '#7a6050', { style: 'brick', hp: 80, recipe: [['mud', 1], ['stone', 1]], station: 'furnace' });
  BW('iridescent_brick', 'Iridescent Brick', '#a0b8c0', { style: 'brick', hp: 80, recipe: [['stone', 1], ['pearlsand', 1]], station: 'furnace' });
  BW('hellstone_brick', 'Hellstone Brick', '#c04020', { style: 'brick', hp: 120, light: [0.3, 0.1, 0.0], recipe: [['hellstone', 1], ['stone', 1]], station: 'furnace' });
  BW('pearlstone_brick', 'Pearlstone Brick', '#d0b8e0', { style: 'brick', hp: 100, recipe: [['pearlstone', 1], ['stone', 1]], station: 'furnace' });
  BW('ebonstone_brick', 'Ebonstone Brick', '#5a4a70', { style: 'brick', hp: 100, recipe: [['ebonstone', 1], ['stone', 1]], station: 'furnace' });
  BW('crimstone_brick', 'Crimstone Brick', '#803838', { style: 'brick', hp: 100, recipe: [['crimstone', 1], ['stone', 1]], station: 'furnace' });
  BW('snow_brick', 'Snow Brick', '#d8e4f0', { style: 'brick', hp: 60, recipe: [['snow', 2]], station: 'furnace' });
  BW('ice_brick', 'Ice Brick', '#b0d8f0', { style: 'brick', hp: 60, recipe: [['ice', 2]], station: 'ice_machine' });
  BW('cobalt_brick', 'Cobalt Brick', '#3060c0', { style: 'brick', hp: 120, recipe: [['cobalt_ore', 1], ['stone', 1]], station: 'furnace' });
  for (const [ore, name, col] of [['copper', 'Copper', '#c87533'], ['tin', 'Tin', '#c8b070'], ['iron', 'Iron', '#a2a4b4'], ['lead', 'Lead', '#7a88a8'], ['silver', 'Silver', '#cfd6e6'], ['tungsten', 'Tungsten', '#70b090'], ['gold', 'Gold', '#e8b830'], ['platinum', 'Platinum', '#c8d8f0'], ['demonite', 'Demonite', '#6a3ad0'], ['crimtane', 'Crimtane', '#c02030'], ['meteorite', 'Meteorite', '#8a4a30'], ['palladium', 'Palladium', '#e08040'], ['mythril', 'Mythril', '#40b0a0'], ['orichalcum', 'Orichalcum', '#e060a0'], ['adamantite', 'Adamantite', '#d03060'], ['titanium', 'Titanium', '#a0a8b8'], ['chlorophyte', 'Chlorophyte', '#40c040']]) {
    if (ore === 'cobalt') continue;
    BW(`${ore}_brick`, `${name} Brick`, col, { style: 'brick', hp: 120, recipe: [[`${ore}_ore`, 1], ['stone', 1]], station: 'furnace' });
    BW(`${ore}_plating`, `${name} Plating`, VAN.light(col, 0.1), { style: 'plate', hp: 120, recipe: [[`${ore}_bar`, 1], ['stone', 25]], count: 25, station: 'heavy_workbench' });
  }
  BW('luminite_brick', 'Luminite Brick', '#40e0c0', { style: 'brick', hp: 200, light: [0.15, 0.4, 0.35], recipe: [['luminite_bar', 1], ['stone', 25]], count: 25, station: 'ancient_manipulator' });
  for (const [f, name, col] of [['solar', 'Solar', '#e06030'], ['vortex', 'Vortex', '#30c0a0'], ['nebula', 'Nebula', '#c040c0'], ['stardust', 'Stardust', '#40a0e0']]) BW(`${f}_brick`, `${name} Brick`, col, { style: 'tile', hp: 200, light: VAN.hex(col).map(v => v / 255 * 0.3), recipe: [[`${f}_fragment`, 1], ['stone', 25]], count: 25, station: 'ancient_manipulator' });
  BW('shroomite_plating', 'Shroomite Plating', '#6aa0d0', { style: 'plate', hp: 160, recipe: [['shroomite_bar', 1], ['stone', 15]], count: 15, station: 'autohammer' });
  BW('spectre_block', 'Spectre Block', '#c0e0e0', { style: 'plate', hp: 120, light: [0.2, 0.3, 0.3], recipe: [['ectoplasm', 1], ['stone', 1]], station: 'ancient_manipulator' });
  BW('martian_conduit_plating', 'Martian Conduit Plating', '#a0a0b0', { style: 'plate', hp: 120, light: [0.1, 0.3, 0.3] });
  // ---- crafted themed blocks ----------------------------------------------------------------------------------
  BW('slime_block', 'Slime Block', '#4080e0', { style: 'slime', hp: 40, recipe: [['gel', 1]], station: 'solidifier' });
  BW('frozen_slime_block', 'Frozen Slime Block', '#a0d0f0', { style: 'slime', slippery: true, hp: 40, recipe: [['slime_block', 1], ['ice', 1]], station: 'ice_machine' });
  BW('pink_slime_block', 'Pink Slime Block', '#f080c0', { style: 'slime', hp: 40, recipe: [['pink_gel', 1]], station: 'solidifier' });
  BW('flesh_block', 'Flesh Block', '#c04050', { style: 'speckle', hp: 60, recipe: [['vertebra', 1]], count: 5, station: 'meat_grinder' });
  BW('lesion_block', 'Lesion Block', '#6a4a90', { style: 'speckle', hp: 60, recipe: [['rotten_chunk', 1]], count: 5, station: 'decay_chamber' });
  BW('asphalt', 'Asphalt Block', '#404048', { style: 'plate', hp: 100, recipe: [['stone', 2], ['gel', 1]], count: 1, station: 'blend_o_matic', tooltip: 'Greatly increases run speed' });
  BW('dynasty_brick', 'Dynasty Brick', '#c05040', { style: 'brick', hp: 100 });
  BW('cog', 'Cog', '#a08040', { style: 'metal', hp: 80, recipe: [['iron_bar', 1]], count: 10, station: 'steampunk_boiler' });
  BW('honey_brick', 'Honey Brick', '#e0a020', { style: 'brick', hp: 80, recipe: [['honey_block', 1]], count: 1, station: 'honey_dispenser' });
  BW('candy_cane_block', 'Candy Cane Block', '#e03030', { style: 'tile', hp: 60 });
  BW('green_candy_cane_block', 'Green Candy Cane Block', '#30a040', { style: 'tile', hp: 60 });
  BW('tin_plating_block', 'Tin Plating', '#c8b070', { style: 'plate', hp: 80, recipe: [['tin_bar', 1]], count: 25, station: 'heavy_workbench' });
  BW('confetti_block', 'Confetti Block', '#f0e0ff', { style: 'speckle', hp: 40, recipe: [['confetti', 1], ['stone', 1]], station: 'workbench' });
  BW('midnight_confetti_block', 'Midnight Confetti Block', '#4a3a6a', { style: 'speckle', hp: 40, recipe: [['confetti', 1], ['ebonstone', 1]], station: 'workbench' });
  BW('lava_moss_block', 'Lava Moss Block', '#e06020', { style: 'stone', hp: 80, light: [0.4, 0.1, 0] });
  BW('krypton_moss_block', 'Krypton Moss Block', '#60e040', { style: 'stone', hp: 80, light: [0.1, 0.4, 0.1] });
  BW('xenon_moss_block', 'Xenon Moss Block', '#40e0e0', { style: 'stone', hp: 80, light: [0.1, 0.4, 0.4] });
  BW('argon_moss_block', 'Argon Moss Block', '#e040c0', { style: 'stone', hp: 80, light: [0.4, 0.1, 0.4] });
  BW('neon_moss_block', 'Neon Moss Block', '#4040ff', { style: 'stone', hp: 80, light: [0.1, 0.1, 0.5] });
  BW('helium_moss_block', 'Helium Moss Block', '#ff80c0', { style: 'stone', hp: 80, light: [0.5, 0.3, 0.4] });
  BW('sturdy_fossil_block', 'Sturdy Fossil Block', '#b0a080', { style: 'bone', hp: 90, recipe: [['sturdy_fossil', 1]], station: 'bone_welder' });
  BW('reef_block', 'Reef Block', '#e06080', { style: 'stone', hp: 80, recipe: [['coral', 1], ['stone', 1]], station: 'furnace' });
  BW('stone_slab', 'Stone Slab', '#7e7e86', { style: 'plate', hp: 80, recipe: [['stone', 1]], station: 'heavy_workbench' });
  BW('sandstone_slab', 'Sandstone Slab', '#c8a868', { style: 'plate', hp: 80, recipe: [['sandstone', 1]], station: 'heavy_workbench' });
  BW('copper_plating_block', 'Copper Plating', '#c87533', { style: 'plate', hp: 100, recipe: [['copper_bar', 1]], count: 25, station: 'heavy_workbench' });
  BW('obsidian_brick', 'Obsidian Brick', '#3a2a4a', { style: 'brick', hp: 160, recipe: [['obsidian', 1], ['stone', 1]], station: 'furnace' });
  BW('sandstone_brick', 'Sandstone Brick', '#c8a868', { style: 'brick', hp: 90, recipe: [['sandstone', 2]], station: 'furnace' });
  BW('mushroom_block', 'Mushroom Block', '#5aa0ff', { style: 'speckle', light: [0.1, 0.2, 0.4], hp: 40, recipe: [['glow_mushroom', 1]], station: 'workbench' });
  // ---- natural walls (unsafe, drop nothing) and their safe crafted versions --------------------------------------
  for (const [id, name, col, ing] of [['stone_wall', 'Stone Wall', '#3a3a40', ['stone', 1]], ['mud_wall', 'Mud Wall', '#3a2a20', ['mud', 1]], ['sand_wall', 'Sand Wall', '#7a6a44', ['sand', 1]], ['snow_wall', 'Snow Wall', '#6a7a8a', ['snow', 1]], ['ice_wall', 'Ice Wall', '#5a7a9a', ['ice', 1]], ['ebonstone_wall', 'Ebonstone Wall', '#2a1a3a', ['ebonstone', 1]], ['crimstone_wall', 'Crimstone Wall', '#3a1010', ['crimstone', 1]], ['pearlstone_wall', 'Pearlstone Wall', '#6a5a7a', ['pearlstone', 1]], ['hardened_sand_wall', 'Hardened Sand Wall', '#6a5a3a', ['hardened_sand', 1]], ['sandstone_wall', 'Sandstone Wall', '#6a5030', ['sandstone', 1]], ['hive_wall', 'Hive Wall', '#8a6020', ['hive', 1]], ['obsidian_wall', 'Obsidian Wall', '#2a1a30', ['obsidian', 1]], ['ash_wall', 'Ash Wall', '#302830', ['ash', 1]], ['cactus_wall', 'Cactus Wall', '#3a7a3a', ['cactus', 1]], ['pumpkin_wall', 'Pumpkin Wall', '#8a4a10', ['pumpkin', 1]], ['hay_wall', 'Hay Wall', '#8a7a3a', ['hay', 1]], ['coralstone_wall', 'Coralstone Wall', '#8a4050', ['coralstone', 1]], ['mushroom_wall', 'Mushroom Wall', '#2a4a80', ['mushroom_block', 1]], ['glass_wall_clear', 'Glass Wall', '#a0c0e0', ['glass', 1]], ['bone_wall', 'Bone Wall', '#8a8070', ['bone_block', 1]], ['slime_wall', 'Slime Wall', '#204070', ['slime_block', 1]], ['flesh_wall', 'Flesh Wall', '#602028', ['flesh_block', 1]], ['lesion_wall', 'Lesion Wall', '#352548', ['lesion_block', 1]], ['marble_wall', 'Marble Wall', '#6a6a70', ['marble', 1]], ['granite_wall', 'Granite Wall', '#20242c', ['granite', 1]], ['cloud_wall', 'Cloud Wall', '#8090a8', ['cloud', 1]], ['living_leaf_wall', 'Living Leaf Wall', '#285020', ['leaf_block', 1]], ['dungeon_brick_wall', 'Dungeon Brick Wall', '#1a2a4a', ['blue_dungeon_brick', 1]], ['lihzahrd_wall', 'Lihzahrd Brick Wall', '#503820', ['lihzahrd_brick', 1]]]) {
    if (ITEMS[id]) continue;
    WALL(id, name, col, { style: id.includes('brick') || id.includes('sandstone') ? 'brick' : 'speckle', recipe: [ing], count: 4, station: 'workbench' });
  }
  // ---- generic furniture in the special materials (stations and their themed sets) -------------------------------
  const SETS = [['glass', 'Glass', '#a0d0f0', 'glass', 'glass_kiln'], ['stone', 'Stone', '#7e7e86', 'stone', 'heavy_workbench'], ['bone', 'Bone', '#e8e0c8', 'bone', 'bone_welder'], ['flesh', 'Flesh', '#c04050', 'flesh_block', 'flesh_cloning_vat'], ['honey', 'Honey', '#e0a020', 'honey_block', 'honey_dispenser'], ['slime', 'Slime', '#4080e0', 'slime_block', 'solidifier'], ['ice', 'Frozen', '#a0d8f0', 'ice', 'ice_machine'], ['lihzahrd', 'Lihzahrd', '#a07040', 'lihzahrd_brick', 'lihzahrd_furnace'], ['skyware', 'Skyware', '#e8c860', 'sunplate', 'sky_mill'], ['steampunk', 'Steampunk', '#b07040', 'cog', 'steampunk_boiler'], ['living_wood', 'Living Wood', '#8a6038', 'living_wood', 'living_loom'], ['mushroom', 'Mushroom', '#5aa0ff', 'glow_mushroom', 'workbench'], ['cactus', 'Cactus', '#3f9e3f', 'cactus', 'workbench'], ['pumpkin', 'Pumpkin', '#e08020', 'pumpkin', 'workbench'], ['marble', 'Marble', '#d8d8e0', 'smooth_marble', 'workbench'], ['granite', 'Granite', '#505868', 'smooth_granite', 'workbench'], ['martian', 'Martian', '#a0a0b0', 'martian_conduit_plating', 'workbench'], ['meteorite', 'Meteorite', '#8a4a30', 'meteorite_brick', 'workbench'], ['obsidian', 'Obsidian', '#3a2a4a', 'obsidian', 'workbench'], ['crystal', 'Crystal', '#f0c0ff', 'crystal_block', 'workbench'], ['dungeon', 'Blue Dungeon', '#3a4a8a', 'blue_dungeon_brick', 'workbench'], ['golden', 'Golden', '#e8b830', 'gold_bar', 'workbench'], ['dynasty', 'Dynasty', '#c05040', 'dynasty_wood', 'workbench'], ['sandstone', 'Sandstone', '#c8a868', 'smooth_sandstone', 'workbench'], ['spider', 'Spider', '#404048', 'cobweb', 'workbench'], ['lesion', 'Lesion', '#6a4a90', 'lesion_block', 'decay_chamber'], ['solar', 'Solar', '#e06030', 'solar_brick', 'workbench'], ['vortex', 'Vortex', '#30c0a0', 'vortex_brick', 'workbench'], ['nebula', 'Nebula', '#c040c0', 'nebula_brick', 'workbench'], ['stardust', 'Stardust', '#40a0e0', 'stardust_brick', 'workbench'], ['frozen_slime', 'Frozen Slime', '#a0d0f0', 'frozen_slime_block', 'ice_machine'], ['bamboo', 'Bamboo', '#a0c060', 'bamboo', 'workbench'], ['reef', 'Reef', '#e06080', 'reef_block', 'workbench'], ['balloon', 'Balloon', '#e04060', 'silk', 'workbench'], ['ash_wood', 'Ash Wood', '#606068', 'ash_wood', 'workbench']];
  for (const [id, name, col, mat, station] of SETS) {
    if (ITEMS[`${id}_chair`]) continue;
    const F = (suffix, label, w, h, style, n, extra, extraIng) => VAN.furniture(`${id}_${suffix}`, `${name} ${label}`, w, h, style, col, Object.assign({ recipe: [[mat, n], ...(extraIng || [])], craftAt: station, value: 300 }, extra || {}));
    B(`${id}_platform`, `${name} Platform`, col, { style: 'plate', solid: false, platform: true, transparent: true, recipe: [[mat, 1]], count: 2, station: null, value: 5, key: `${id}_platform`.toUpperCase() });
    F('workbench', 'Work Bench', 2, 1, 'table', 10, { stations: ['workbench'], platform: true });
    F('table', 'Table', 3, 2, 'table', 8, { stations: ['table'], platform: true });
    F('chair', 'Chair', 1, 2, 'chair', 4, { stations: ['chair'] });
    VAN.item(`${id}_door`, `${name} Door`, { tile: T.DOOR_C, max: 99, tooltip: 'Right click to open/close', drawIcon: (x) => { x.fillStyle = VAN.dark(col, 0.4); x.fillRect(3, 0, 10, 16); x.fillStyle = col; x.fillRect(4, 1, 8, 14); x.fillStyle = '#e8c040'; x.fillRect(10, 8, 2, 2); } }, 300); VAN.recipe(`${id}_door`, 1, station, [[mat, 6]]);
    F('chest', 'Chest', 2, 2, 'box', 8, { solid: false }, [['iron_bar', 2]]);
    F('bed', 'Bed', 4, 2, 'bed', 15, { tooltip: 'Right click to set your spawn point' }, [['silk', 5]]);
    F('bookcase', 'Bookcase', 3, 4, 'bookcase', 20, { stations: ['bookcase'] }, [['book', 10]]);
    F('dresser', 'Dresser', 3, 2, 'dresser', 16, {});
    F('piano', 'Piano', 3, 2, 'piano', 15, {}, [['bone', 4], ['book', 1]]);
    F('sofa', 'Sofa', 3, 2, 'bench', 5, { stations: ['chair'] }, [['silk', 2]]);
    F('bathtub', 'Bathtub', 4, 2, 'bathtub', 14, {});
    F('lantern', 'Lantern', 1, 2, 'lantern', 6, { light: [0.9, 0.8, 0.5] }, [['torch', 1]]);
    F('candle', 'Candle', 1, 1, 'candle', 4, { light: [0.6, 0.5, 0.3] }, [['torch', 1]]);
    F('chandelier', 'Chandelier', 3, 3, 'chandelier', 4, { light: [1, 0.9, 0.6] }, [['torch', 4], ['chain', 1]]);
    F('lamp', 'Lamp', 1, 3, 'lamp', 3, { light: [0.9, 0.8, 0.5] }, [['torch', 1]]);
    F('clock', 'Grandfather Clock', 2, 5, 'clock', 10, {}, [['iron_bar', 3], ['glass', 6]]);
    F('sink', 'Sink', 2, 2, 'sink', 6, { stations: ['water'] }, [['water_bucket', 1]]);
    F('toilet', 'Toilet', 1, 2, 'toilet', 6, { stations: ['chair'] });
    F('bench', 'Bench', 3, 2, 'bench', 8, { stations: ['chair'] });
    F('sign', 'Sign', 2, 2, 'painting', 6, {});
    F('candelabra', 'Candelabra', 2, 2, 'candle', 5, { light: [0.8, 0.7, 0.4] }, [['torch', 3]]);
    F('bar', 'Bar', 3, 1, 'table', 7, { platform: true });
  }
  // ---- chests of the world (loot chests are placeable / craftable in their material) -----------------------------
  for (const [id, name, col, ing] of [['gold_chest', 'Gold Chest', '#e8b830', [['gold_bar', 8], ['iron_bar', 2]]], ['shadow_chest', 'Shadow Chest', '#4a3a6a', null], ['water_chest', 'Water Chest', '#4080c0', null], ['ivy_chest', 'Ivy Chest', '#40a040', null], ['ice_chest', 'Ice Chest', '#a0d8f0', [['ice', 8], ['iron_bar', 2]]], ['barrel', 'Barrel', '#8a5a2a', [['wood', 9], ['iron_bar', 1]]], ['trash_can', 'Trash Can', '#707078', [['iron_bar', 8]]], ['dungeon_chest', 'Locked Dungeon Chest', '#3a4a8a', null], ['lihzahrd_chest', 'Lihzahrd Chest', '#a07040', null], ['skyware_chest', 'Skyware Chest', '#e8c860', null], ['web_covered_chest', 'Web Covered Chest', '#909098', null], ['sandstone_chest', 'Sandstone Chest', '#c8a868', null], ['pearlwood_chest', 'Pearlwood Chest (loot)', '#e0c0e0', null]]) {
    if (ITEMS[id]) continue;
    VAN.furniture(id, name, 2, 2, 'box', col, { recipe: ing, craftAt: 'workbench', value: 500, tooltip: 'Stores items' });
  }
  // every furniture "box" of a chest kind stores items like a chest
  ModLib.patch(() => {
    const base = World.prototype.placeFurniture; World.prototype.placeFurniture = function (x, y, id) { base.call(this, x, y, id); const f = VAN_FURNITURE[id]; if (f && f.chest) this.chests.set(this.idx(x, y), new Array(40).fill(null)); };
    const rem = World.prototype.removeFurniture; World.prototype.removeFurniture = function (x, y) { const a = this.furnitureAnchor(x, y); if (a && a.id !== T.CHEST && this.chests.has(this.idx(a.x, a.y))) { const inv = this.chests.get(this.idx(a.x, a.y)); if (inv && inv.some(s => s)) return null; this.chests.delete(this.idx(a.x, a.y)); } return rem.call(this, x, y); };
    const rc = Game.prototype.onRightDown; // right click on any chest-kind furniture opens it
    Game.prototype.onRightDown = function () { if (this.state === 'play' && !this.overUI() && !this.dialog) { this.updateMouseWorld(); const tx = Math.floor(this.mouse.wx / TILE), ty = Math.floor(this.mouse.wy / TILE); const id = this.world.get(tx, ty); if (id !== T.CHEST && TILES[id] && TILES[id].furniture && this.inReach(tx, ty)) { const a = this.world.furnitureAnchor(tx, ty); if (a && this.world.chests.has(this.world.idx(a.x, a.y))) { this.openChestAt(a.x, a.y); return; } } } return rc.call(this); };
  });
}
