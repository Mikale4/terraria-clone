// ---------------------------------------------------------------------------
// Vanilla crafting stations: every Terraria station as a placeable piece of
// furniture that unlocks its recipes, plus the "environment" stations (water,
// lava, honey next to you; the Graveyard's Ecto Mist; a campfire; a placed
// bottle). Station ids used by RECIPES: workbench, furnace, anvil (Iron/Lead),
// mythril_anvil (Mythril/Orichalcum), adamantite_forge (Adamantite/Titanium),
// hellforge, demon_altar, bookcase, sawmill, loom, alchemy (Placed Bottle /
// Alchemy Table), cooking_pot (Cooking Pot / Cauldron), tinkerers_workshop,
// imbuing_station, dye_vat, heavy_workbench, keg, ice_machine, glass_kiln,
// crystal_ball, autohammer, lihzahrd_furnace, solidifier, honey_dispenser,
// bone_welder, flesh_cloning_vat, living_loom, sky_mill, steampunk_boiler,
// blend_o_matic, meat_grinder, ancient_manipulator, decay_chamber, lavaproof,
// teapot, table, chair, campfire, water, lava, honey, ecto_mist.
// ---------------------------------------------------------------------------
'use strict';

// existing stations get their proper tiles / sprites where the base game reused another tile
{
  const F = (id, name, w, h, style, col, o) => VAN.furniture(id, name, w, h, style, col, o);
  // Sawmill (was a work bench look-alike): Work Bench, 10 Wood + 2 Iron/Lead Bars + 1 Chain
  ITEMS.sawmill.tile = null; F('sawmill', 'Sawmill', 3, 2, 'machine', '#8a6038', { stations: ['sawmill', 'workbench'], tooltip: 'Used to craft furniture from wood' });
  RECIPES.filter(r => r.result === 'sawmill').forEach(r => { r.ing = [['wood', 10], ['iron_bar', 2], ['chain', 1]]; r.station = 'workbench'; }); VAN.recipe('sawmill', 1, 'workbench', [['wood', 10], ['lead_bar', 2], ['chain', 1]]);
  if (ITEMS.loom) { ITEMS.loom.tile = null; F('loom', 'Loom', 3, 2, 'stand', '#9a7048', { stations: ['loom'], tooltip: 'Used to craft silk and cloth items' }); }
  if (ITEMS.tinkerers_workshop) { ITEMS.tinkerers_workshop.tile = null; F('tinkerers_workshop', "Tinkerer's Workshop", 3, 2, 'table', '#7a5a3a', { stations: ['tinkerers_workshop'], tooltip: 'Allows the combining of some accessories' }); }
  if (ITEMS.dye_vat) { ITEMS.dye_vat.tile = null; F('dye_vat', 'Dye Vat', 3, 2, 'pot', '#5060a0', { stations: ['dye_vat'], tooltip: 'Used to craft dyes' }); }
  for (const [id, also] of [['mythril_anvil', ['anvil']], ['adamantite_forge', ['furnace', 'hellforge']], ['hellforge', ['furnace']], ['ancient_manipulator', []]]) if (ITEMS[id] && ITEMS[id].tile != null) STATION_TILES[ITEMS[id].tile] = [id, ...also];
  if (T.DEMON_ALTAR != null) STATION_TILES[T.DEMON_ALTAR] = ['demon_altar'];
  if (T.CAMPFIRE != null) STATION_TILES[T.CAMPFIRE] = ['campfire'];
  if (T.TABLE != null) STATION_TILES[T.TABLE] = ['table'];
  if (T.CHAIR != null) STATION_TILES[T.CHAIR] = ['chair'];
  if (T.WORKBENCH != null) STATION_TILES[T.WORKBENCH] = ['workbench'];
}

// the rest of the stations ---------------------------------------------------------------------------
{
  const F = (id, name, w, h, style, col, stations, recipe, craftAt, value, tooltip) => VAN.furniture(id, name, w, h, style, col, { stations, recipe, craftAt, value, tooltip });
  VAN.material('chain', 'Chain', '#a0a0a8', { shape: 'ring', value: 100, recipe: [['iron_bar', 1]], count: 10, station: 'anvil' }); VAN.recipe('chain', 10, 'anvil', [['lead_bar', 1]]);
  VAN.material('book', 'Book', '#4060c0', { shape: 'book', value: 100 });
  if (!ITEMS.bottle.drawIcon && !ITEMS.bottle.icon) ITEMS.bottle.drawIcon = VAN.icon('vial', '#c0e0ff');
  F('bookcase', 'Bookcase', 3, 4, 'bookcase', '#8a6038', ['bookcase'], [['wood', 20], ['book', 10]], 'sawmill', 3000, 'Crafting station for spell tomes');
  F('placed_bottle', 'Placed Bottle', 1, 1, 'bottle', '#c0e0ff', ['alchemy'], [['bottle', 1]], null, 20, 'Place on a table to brew potions (Alchemy station)');
  ITEMS.placed_bottle.name = 'Bottle (placed)';
  F('alchemy_table', 'Alchemy Table', 3, 3, 'table', '#5a4a6a', ['alchemy', 'table'], null, null, 50000, '33% chance not to consume potion ingredients. Found in the Dungeon');
  F('cooking_pot', 'Cooking Pot', 2, 2, 'pot', '#404048', ['cooking_pot'], [['iron_bar', 10], ['wood', 2]], 'anvil', 2000, 'Used to cook food'); VAN.recipe('cooking_pot', 1, 'anvil', [['lead_bar', 10], ['wood', 2]]);
  F('cauldron', 'Cauldron', 2, 2, 'cauldron', '#303038', ['cooking_pot'], [['iron_bar', 10], ['wood', 2]], 'anvil', 2000, 'Used to cook food (Halloween Cooking Pot)');
  F('imbuing_station', 'Imbuing Station', 3, 3, 'stand', '#6a3a8a', ['imbuing_station'], null, null, 70000, 'Used to craft weapon flasks. Sold by the Witch Doctor');
  F('heavy_workbench', 'Heavy Work Bench', 3, 2, 'table', '#5a5a62', ['heavy_workbench', 'workbench'], [['iron_bar', 8], ['wood', 10]], 'workbench', 2500, 'Used to craft large decorations'); VAN.recipe('heavy_workbench', 1, 'workbench', [['lead_bar', 8], ['wood', 10]]);
  F('keg', 'Keg', 2, 2, 'stand', '#8a5a2a', ['keg'], [['wood', 14]], 'workbench', 600, 'Used to brew Ale');
  F('ice_machine', 'Ice Machine', 3, 2, 'machine', '#a0d8f0', ['ice_machine'], [['snow', 25], ['ice', 10], ['iron_bar', 3]], 'workbench', 600, 'Used to craft ice furniture'); VAN.recipe('ice_machine', 1, 'workbench', [['snow', 25], ['ice', 10], ['lead_bar', 3]]);
  F('glass_kiln', 'Glass Kiln', 3, 2, 'machine', '#c07040', ['glass_kiln', 'furnace'], [['iron_bar', 18], ['torch', 8]], 'anvil', 10000, 'Used to craft glass furniture'); VAN.recipe('glass_kiln', 1, 'anvil', [['lead_bar', 18], ['torch', 8]]);
  F('crystal_ball', 'Crystal Ball', 2, 2, 'ball', '#80c0ff', ['crystal_ball'], null, null, 50000, 'Used to craft magic furniture; right click for the Clairvoyance buff. Sold by the Wizard', ); ITEMS.crystal_ball.light = null;
  F('autohammer', 'Autohammer', 3, 2, 'machine', '#8ab0c0', ['autohammer'], null, null, 200000, 'Turns Chlorophyte Bars into Shroomite Bars. Sold by the Truffle');
  F('lihzahrd_furnace', 'Lihzahrd Furnace', 3, 2, 'machine', '#c8a050', ['lihzahrd_furnace', 'furnace'], null, null, 20000, 'Used to craft Lihzahrd furniture. Found in the Jungle Temple');
  F('solidifier', 'Solidifier', 3, 2, 'machine', '#60a0e0', ['solidifier'], null, null, 20000, 'Turns Gel into Slime Blocks. Dropped by King Slime');
  F('honey_dispenser', 'Honey Dispenser', 3, 3, 'machine', '#e0a020', ['honey_dispenser'], null, null, 20000, 'Used to craft honey furniture. Found in Bee Hive chests');
  F('bone_welder', 'Bone Welder', 3, 2, 'machine', '#e0d8c0', ['bone_welder'], null, null, 20000, 'Used to craft bone furniture. Found in Dungeon chests');
  F('flesh_cloning_vat', 'Flesh Cloning Vat', 3, 3, 'pot', '#c04050', ['flesh_cloning_vat'], null, null, 20000, 'Used to craft flesh furniture. Found in Crimson chests');
  F('living_loom', 'Living Loom', 3, 2, 'stand', '#6a8a3a', ['living_loom', 'loom'], null, null, 20000, 'Used to craft living wood furniture. Found in Living Wood chests');
  F('sky_mill', 'Sky Mill', 3, 3, 'machine', '#e8e8f8', ['sky_mill'], null, null, 20000, 'Used to craft sky furniture. Found in Skyware chests');
  F('steampunk_boiler', 'Steampunk Boiler', 3, 3, 'machine', '#b07040', ['steampunk_boiler'], null, null, 20000, 'Used to craft steampunk furniture. Sold by the Steampunker');
  F('blend_o_matic', 'Blend-O-Matic', 3, 2, 'machine', '#8a8a8a', ['blend_o_matic'], null, null, 100000, 'Makes Asphalt Blocks. Sold by the Steampunker in Hardmode');
  F('meat_grinder', 'Meat Grinder', 3, 2, 'machine', '#b03040', ['meat_grinder'], null, null, 100000, 'Makes Flesh Blocks. Dropped by Crimson enemies');
  F('decay_chamber', 'Decay Chamber', 3, 2, 'machine', '#6a3a8a', ['decay_chamber'], null, null, 100000, 'Makes Lesion Blocks. Dropped by Corruption enemies');
  F('lavaproof_station', 'Lava-Proof Work Bench', 2, 1, 'table', '#a04020', ['workbench'], [['workbench', 1], ['obsidian', 10]], 'workbench', 1000, 'A Work Bench that survives lava');
  F('teapot', 'Teapot', 2, 1, 'pot', '#e0e0e8', ['teapot'], [['iron_bar', 6], ['wood', 2]], 'anvil', 500, 'Crafting station for tea'); VAN.recipe('teapot', 1, 'anvil', [['lead_bar', 6], ['wood', 2]]);
  F('crimson_altar', 'Crimson Altar', 3, 2, 'altar', '#a03040', ['demon_altar'], null, null, 0, 'A crafting station for boss summons. Smash it with a Pwnhammer in Hardmode');
  // Mythril/Orichalcum Anvil and Adamantite/Titanium Forge come from the ore system; the Orichalcum / Titanium
  // named versions share the station
  if (ITEMS.mythril_anvil) { VAN.recipe('mythril_anvil', 1, 'anvil', [['orichalcum_bar', 12]]); ITEMS.mythril_anvil.tooltip = 'Mythril / Orichalcum Anvil: crafts Hardmode metal gear'; }
  if (ITEMS.adamantite_forge) { VAN.recipe('adamantite_forge', 1, 'mythril_anvil', [['titanium_ore', 30], ['hellforge', 1]]); ITEMS.adamantite_forge.tooltip = 'Adamantite / Titanium Forge: smelts Adamantite and Titanium'; }
  if (ITEMS.ancient_manipulator) ITEMS.ancient_manipulator.tooltip = 'Crafting station for Lunar fragments and Luminite. Dropped by the Lunatic Cultist';
}

// environment stations: liquids next to you, the Graveyard's ecto mist, a campfire ------------------------
ModLib.patch(() => {
  const base = Game.prototype.updateCraftable;
  Game.prototype.updateCraftable = function () {
    base.call(this);
    const p = this.player, w = this.world; if (!p || !w) return;
    let water = false, lava = false, honey = false;
    for (let y = p.tileY - 5; y <= p.tileY + 5; y++) for (let x = p.tileX - 5; x <= p.tileX + 5; x++) {
      const l = w.liquidAt(x, y); if (l > 80) { const k = w.lavaAt(x, y); if (k === LIQ.LAVA) lava = true; else if (k === LIQ.HONEY) honey = true; else if (k === LIQ.WATER) water = true; }
    }
    if (water) this.stations.add('water'); if (lava) this.stations.add('lava'); if (honey) this.stations.add('honey');
    if (typeof BiomeSys !== 'undefined' && BiomeSys.detect) { const d = BiomeSys.detect(this); if (d && d.mini === 'Graveyard') this.stations.add('ecto_mist'); if (d && d.biome === BIOME.SNOW) this.stations.add('snow_biome'); }
    if (this.stations.size !== this._stationsN) { this._stationsN = this.stations.size; }
    // recompute with the extra stations (recipes were filtered before they were added)
    const list = [];
    for (const rec of RECIPES) {
      if ((rec.mod && !ModList.on(rec.mod)) || !ModList.itemOk(rec.result)) continue;
      const hasStation = !rec.station || this.stations.has(rec.station);
      if (!hasStation) continue;
      let anyIng = false, all = true;
      for (const [id, n] of rec.ing) { const have = p.countItem(id); if (have > 0) anyIng = true; if (have < n) all = false; }
      if (!anyIng) continue;
      list.push({ recipe: rec, can: hasStation && all });
    }
    list.sort((a, b) => (b.can - a.can));
    if (UI.craftFilter) { const f = UI.craftFilter.toLowerCase(); this.craftable = list.filter(e => ITEMS[e.recipe.result].name.toLowerCase().includes(f)); } else this.craftable = list;
    if (UI.craftScroll * 10 >= list.length) UI.craftScroll = 0;
  };
});
// station names for the crafting panel tooltip
const STATION_NAMES = { workbench: 'Work Bench', furnace: 'Furnace', anvil: 'Iron/Lead Anvil', mythril_anvil: 'Mythril/Orichalcum Anvil', adamantite_forge: 'Adamantite/Titanium Forge', hellforge: 'Hellforge', demon_altar: 'Demon/Crimson Altar', bookcase: 'Bookcase', sawmill: 'Sawmill', loom: 'Loom', alchemy: 'Placed Bottle / Alchemy Table', cooking_pot: 'Cooking Pot', tinkerers_workshop: "Tinkerer's Workshop", imbuing_station: 'Imbuing Station', dye_vat: 'Dye Vat', heavy_workbench: 'Heavy Work Bench', keg: 'Keg', ice_machine: 'Ice Machine', glass_kiln: 'Glass Kiln', crystal_ball: 'Crystal Ball', autohammer: 'Autohammer', lihzahrd_furnace: 'Lihzahrd Furnace', solidifier: 'Solidifier', honey_dispenser: 'Honey Dispenser', bone_welder: 'Bone Welder', flesh_cloning_vat: 'Flesh Cloning Vat', living_loom: 'Living Loom', sky_mill: 'Sky Mill', steampunk_boiler: 'Steampunk Boiler', blend_o_matic: 'Blend-O-Matic', meat_grinder: 'Meat Grinder', ancient_manipulator: 'Ancient Manipulator', decay_chamber: 'Decay Chamber', teapot: 'Teapot', table: 'Table', chair: 'Chair', campfire: 'Campfire', water: 'Water (nearby)', lava: 'Lava (nearby)', honey: 'Honey (nearby)', ecto_mist: 'Ecto Mist (Graveyard)', snow_biome: 'Snow biome', petforge: 'Pet Forge', splicing_table: 'Splicing Table' };
