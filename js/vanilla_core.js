// ---------------------------------------------------------------------------
// Vanilla core: content that the mod files had claimed but that is Terraria's
// own (wood armor, the Old One's Army sets, movement combos, reworked swords,
// pet items, a few potions) is promoted to core so it works with every mod
// off; boss summons get their official Demon/Crimson Altar recipes; the boss
// progression gates are checked (Plantera after the mechs, Golem after
// Plantera, the Cultist after the Golem, Moon Lord after the Pillars).
// ---------------------------------------------------------------------------
'use strict';

{
  const R = (result, count, station, ing) => VAN.recipe(result, count, station, ing);
  // ---- promotion of vanilla content out of the mod lists ------------------------------------------------------------
  const VANILLA_MOD_ITEMS = ['wood_helmet', 'wood_breastplate', 'wood_greaves', 'ebonwood_helmet', 'ebonwood_breastplate', 'ebonwood_greaves', 'boreal_wood_helmet', 'boreal_wood_breastplate', 'boreal_wood_greaves', 'rich_mahogany_helmet', 'rich_mahogany_breastplate', 'rich_mahogany_greaves', 'palm_wood_helmet', 'palm_wood_breastplate', 'palm_wood_greaves', 'shadewood_helmet', 'shadewood_breastplate', 'shadewood_greaves', 'pearlwood_helmet', 'pearlwood_breastplate', 'pearlwood_greaves', 'ash_wood_helmet', 'ash_wood_breastplate', 'ash_wood_greaves',
    'flinx_fur_coat', 'monks_bushy_brow_bald_cap', 'monks_shirt', 'monks_pants', 'tiki_mask', 'tiki_shirt', 'tiki_pants', 'shinobi_infiltrators_helmet', 'shinobi_infiltrators_torso', 'shinobi_infiltrators_pants',
    'celestial_shell', 'paladin_shield', 'frozen_turtle_shell', 'flesh_knuckles', 'master_ninja_gear', 'frog_leg', 'flipper', 'water_walking_boots', 'shield_of_cthulhu', 'royal_gel', 'terraspark_boots', 'amphibian_boots', 'arctic_diving_gear', 'neptunes_shell',
    'star_cloak', 'magic_cuffs', 'celestial_cuffs', 'rifle_scope', 'sniper_scope', 'celestial_emblem', 'mechanical_glove', 'fire_gauntlet', 'yoyo_bag', 'apprentice_scarf', 'huntress_buckler', 'monk_belt', 'squire_shield', 'cross_necklace', 'pygmy_necklace', 'stalkers_quiver', 'arcane_flower',
    'blade_of_grass', 'ice_blade', 'volcano', 'nights_edge', 'excalibur', 'true_excalibur', 'true_nights_edge', 'terra_blade', 'frostbrand', 'ice_sickle', 'chlorophyte_saber', 'chlorophyte_claymore', 'shotgun', 'orange_zapinator', 'gray_zapinator', 'blood_rain_bow', 'staff_of_the_frost_hydra', 'flare_gun',
    'wooden_boomerang', 'enchanted_boomerang', 'ice_boomerang', 'thorn_chakram', 'slime_staff', 'finch_staff', 'vampire_frog_staff', 'abigails_flower', 'flinx_staff', 'amber_staff', 'thunder_zapper', 'shuriken', 'bone_javelin', 'gravitation_potion', 'angler_tackle_bag', 'wooden_yoyo', 'spiky_ball', 'beenade'];
  for (const id of VANILLA_MOD_ITEMS) if (ITEMS[id]) delete ITEMS[id].mod;
  for (const r of RECIPES) if (VANILLA_MOD_ITEMS.includes(r.result) && r.mod && r.mod !== 'pets_overhaul') delete r.mod;
  // Monk's set pieces share the ids of the whip-armor mod's versions
  for (const [a, b] of [['monk_brows_bald_cap', 'monks_bushy_brow_bald_cap'], ['monk_shirt', 'monks_shirt'], ['monk_pants', 'monks_pants']]) { if (ITEMS[a] && ITEMS[b]) { Object.assign(ITEMS[b], { defense: ITEMS[a].defense, set: 'monk', rarity: ITEMS[a].rarity, tooltip: ITEMS[a].tooltip }); ARMOR_PIECE_MODS[b] = ARMOR_PIECE_MODS[a]; delete ITEMS[a]; for (const r of RECIPES) if (r.result === a) r.result = b; } }
  // ---- boss summons at the Demon / Crimson Altar -----------------------------------------------------------------------
  VAN.item('gold_crown', 'Gold Crown', { max: 1, rarity: 1, material: true, armor: 'head', defense: 0, vanity: true, tooltip: 'A shiny crown (vanity). Used for the Slime Crown', icon: { kind: 'helmet', mat: 'gold' } }, 3000); R('gold_crown', 1, 'anvil', [['gold_bar', 5], ['ruby', 1]]);
  VAN.item('platinum_crown', 'Platinum Crown', { max: 1, rarity: 1, material: true, armor: 'head', defense: 0, vanity: true, tooltip: 'A shiny crown (vanity). Used for the Slime Crown', icon: { kind: 'helmet', mat: 'silver' } }, 3000); R('platinum_crown', 1, 'anvil', [['platinum_bar', 5], ['ruby', 1]]);
  const setRecipe = (id, station, ings) => { const rs = RECIPES.filter(r => r.result === id); for (const r of rs) RECIPES.splice(RECIPES.indexOf(r), 1); for (const ing of ings) R(id, 1, station, ing); };
  setRecipe('slime_crown', 'demon_altar', [[['gel', 20], ['gold_crown', 1]], [['gel', 20], ['platinum_crown', 1]]]);
  setRecipe('suspicious_eye', 'demon_altar', [[['lens', 6]]]);
  setRecipe('worm_food', 'demon_altar', [[['vile_powder', 30], ['rotten_chunk', 15]]]);
  setRecipe('bloody_spine', 'demon_altar', [[['vicious_powder', 30], ['vertebra', 15]]]);
  setRecipe('abeemination', 'demon_altar', [[['honey_block', 5], ['stinger', 1], ['hive', 5], ['bottled_honey', 1]]]);
  setRecipe('deer_thing', 'demon_altar', [[['flinx_fur', 3], ['lens', 5], ['demonite_ore', 1]], [['flinx_fur', 3], ['lens', 5], ['crimtane_ore', 1]]]);
  setRecipe('mechanical_eye', 'mythril_anvil', [[['lens', 3], ['iron_bar', 5], ['soul_of_light', 6]], [['lens', 3], ['lead_bar', 5], ['soul_of_light', 6]]]);
  setRecipe('mechanical_worm', 'mythril_anvil', [[['rotten_chunk', 6], ['iron_bar', 5], ['soul_of_night', 6]], [['vertebra', 6], ['lead_bar', 5], ['soul_of_night', 6]], [['rotten_chunk', 6], ['lead_bar', 5], ['soul_of_night', 6]], [['vertebra', 6], ['iron_bar', 5], ['soul_of_night', 6]]]);
  setRecipe('mechanical_skull', 'mythril_anvil', [[['bone', 30], ['iron_bar', 5], ['soul_of_light', 3], ['soul_of_night', 3]], [['bone', 30], ['lead_bar', 5], ['soul_of_light', 3], ['soul_of_night', 3]]]);
  setRecipe('celestial_sigil', 'ancient_manipulator', [[['solar_fragment', 20], ['vortex_fragment', 20], ['nebula_fragment', 20], ['stardust_fragment', 20]]]);
  if (ITEMS.goblin_battle_standard) setRecipe('goblin_battle_standard', 'loom', [[['tattered_cloth', 10], ['wood', 5]]]);
  if (ITEMS.pumpkin_moon_medallion) setRecipe('pumpkin_moon_medallion', 'mythril_anvil', [[['pumpkin', 30], ['ectoplasm', 5], ['hallowed_bar', 10]]]);
  if (ITEMS.naughty_present) setRecipe('naughty_present', 'mythril_anvil', [[['silk', 20], ['ectoplasm', 5], ['soul_of_fright', 5]]]);
  if (ITEMS.solar_tablet) { VAN.material('solar_tablet_fragment', 'Solar Tablet Fragment', '#e0a040', { shape: 'tablet', rarity: 3, value: 2000, tooltip: 'Found in Lihzahrd Chests' }); setRecipe('solar_tablet', 'mythril_anvil', [[['solar_tablet_fragment', 8]]]); }
  if (ITEMS.gelatin_crystal) { for (const r of RECIPES.filter(r => r.result === 'gelatin_crystal')) RECIPES.splice(RECIPES.indexOf(r), 1); ITEMS.gelatin_crystal.tooltip = 'Summons Queen Slime (Hallow only). Found in the Underground Hallow'; }
  // Lihzahrd Power Cell: 1 Lihzahrd Power Cell from... found in the Temple (and dropped by Lihzahrds / Flying Snakes)
  // ---- progression gates: the way Terraria orders its bosses --------------------------------------------------------------
  ModLib.patch(() => {
    const summon = Bosses.summon;
    Bosses.summon = function (game, id, opts = {}) {
      const w = game.world, bd = w.bossesDefeated || {};
      const mechs = ['the_twins', 'the_destroyer', 'skeletron_prime'];
      const need = (ok, msg) => { if (!ok) { game.message(msg, '#ff8080'); return false; } return true; };
      if (['the_twins', 'the_destroyer', 'skeletron_prime', 'queen_slime', 'duke_fishron', 'plantera', 'golem', 'empress_of_light', 'lunatic_cultist', 'moon_lord', 'mechdusa'].includes(id) && !need(w.hardmode, 'The Wall of Flesh must fall first: this is a Hardmode boss.')) return null;
      if (id === 'plantera' && !need(mechs.every(m => bd[m]), 'Plantera only wakes once the three mechanical bosses are defeated.')) return null;
      if (id === 'golem' && !need(bd.plantera, 'The Golem sleeps until Plantera is defeated.')) return null;
      if (id === 'empress_of_light' && !need(bd.plantera, 'The Empress of Light only appears after Plantera.')) return null;
      if (id === 'lunatic_cultist' && !need(bd.golem, 'The Cultists only gather at the Dungeon after the Golem falls.')) return null;
      if (id === 'moon_lord' && !need(bd.lunatic_cultist || w.pillarsDown >= 4, 'The Moon Lord only answers after the Celestial Pillars.')) return null;
      return summon.call(this, game, id, opts);
    };
  });
}
{
  // items referenced by drop tables that had no definition yet
  VAN.item('bloody_tear', 'Bloody Tear', { max: 20, consumable: true, rarity: 3, tooltip: 'Summons a Blood Moon at night. Rarely dropped by enemies on a Blood Moon', drawIcon: VAN.icon('vial', '#c02030'), onUse: (g, slot) => { const w = g.world; if (w.isDay()) { g.message('The tear only works at night...', '#ff8080'); return; } if (w.bloodMoon) { g.message('The Blood Moon is already rising.', '#ff8080'); return; } w.bloodMoon = true; g.consumeSlot(slot); g.message('The Blood Moon is rising...', '#ff4040'); Audio_.play('menu'); } }, 10000);
  VAN.furniture('snowball_launcher', 'Snowball Launcher', 3, 2, 'cannon', '#a0d8f0', { tooltip: 'A placed launcher that lobs snowballs at enemies (needs Snowballs in your inventory)', value: 20000, rarity: 2 });
  ModLib.on('tick', (g) => { if (g.world.time % 45 !== 0) return; const w = g.world, p = g.player, tid = T.SNOWBALL_LAUNCHER; if (tid == null) return; const snow = p.inventory.find(s => s && s.id === 'snowball'); if (!snow) return;
    for (let y = p.tileY - 30; y <= p.tileY + 30; y++) for (let x = p.tileX - 50; x <= p.tileX + 50; x++) { if (w.get(x, y) !== tid || (w.tdata[w.idx(x, y)] & 15) !== 0) continue; const t = g.enemies.find(e => !e.dead && dist(e.cx, e.cy, x * TILE, y * TILE) < 24 * TILE); if (!t) continue; const sx = x * TILE + 24, sy = y * TILE + 8, dx = t.cx - sx, dy = t.cy - sy, d = Math.hypot(dx, dy) || 1; const b = new Projectile(sx, sy, dx / d * 10, dy / d * 10 - 2, { kind: 'bullet', damage: 20, friendly: true, owner: p, knockback: 4, color: '#f0f8ff', hi: '#fff' }); b.gravity = 0.15; b.life = 90; g.projectiles.push(b); g.consumeSlot(snow); return; } });
}

{
  // ---- stations you could not get before -------------------------------------------------------------------------------
  // Lead Anvil: worlds with Lead instead of Iron get their own anvil (5 Lead Bars at a Work Bench)
  VAN.furniture('lead_anvil', 'Lead Anvil', 2, 1, 'table', '#7a88a8', { stations: ['anvil'], recipe: [['lead_bar', 5]], craftAt: 'workbench', value: 500, tooltip: 'Used to craft metal items', copyOf: T.ANVIL, platform: true });
  ITEMS.anvil.name = 'Iron Anvil';
  // sold by the town: Wizard (Crystal Ball), Witch Doctor (Imbuing Station), Truffle (Autohammer), Steampunker (Blend-O-Matic, Steampunk Boiler)
  const sell = (role, id, price, cond) => { if (!SHOPS[role] || !ITEMS[id]) return; if (!SHOPS[role].some(e => e.id === id)) SHOPS[role].push(Object.assign({ id, price }, cond ? { cond } : {})); };
  const inBiome = (b) => (g) => { const d = BiomeSys.detect(g); return !!d && d.biome === b; };
  sell('Wizard', 'crystal_ball', 100000); sell('Witch Doctor', 'imbuing_station', 70000); sell('Truffle', 'autohammer', 250000, (g) => ModLib.beaten(g, 'plantera')); sell('Steampunker', 'blend_o_matic', 100000); sell('Steampunker', 'steampunk_boiler', 150000, (g) => ModLib.beaten(g, 'golem'));
  sell('Merchant', 'mining_shirt', 20000); sell('Merchant', 'mining_pants', 20000); sell('Merchant', 'marshmallow', 100, inBiome(BIOME.SNOW)); sell('Goblin Tinkerer', 'tinkerers_workshop', 100000); sell('Goblin Tinkerer', 'rocket_boots', 50000); sell('Goblin Tinkerer', 'toolbelt', 10000);
  sell('Party Girl', 'confetti', 100); sell('Mechanic', 'wire', 500); sell('Mechanic', 'wrench', 20000); sell('Mechanic', 'wire_cutter', 20000); sell('Zoologist', 'leather_whip', 100000); sell('Painter', 'paintball_gun', 10000); sell('Arms Dealer', 'illegal_gun_parts', 250000, (g) => !g.world.isDay());
  sell('Demolitionist', 'explosive_powder', 500, (g) => g.world.hardmode); sell('Cyborg', 'nanites', 1500); sell('Witch Doctor', 'vial_of_venom', 1500, (g) => ModLib.beaten(g, 'plantera')); sell('Witch Doctor', 'blowgun', 25000); sell('Witch Doctor', 'pygmy_necklace', 50000, (g) => !g.world.isDay()); sell('Witch Doctor', 'hercules_beetle', 100000, (g) => ModLib.beaten(g, 'plantera'));
  sell('Steampunker', 'clentaminator', 2000000); sell('Steampunker', 'green_solution', 2500); sell('Steampunker', 'blue_solution', 2500, inBiome(BIOME.HALLOW)); sell('Steampunker', 'jetpack', 400000); sell('Truffle', 'mushroom_spear', 70000, (g) => ModLib.beaten(g, 'the_twins') || ModLib.beaten(g, 'the_destroyer') || ModLib.beaten(g, 'skeletron_prime')); sell('Truffle', 'hammush', 80000); sell('Truffle', 'strange_glowing_mushroom', 50000);
  sell('Dryad', 'grass_seeds', 20); sell('Dryad', 'jungle_grass_seeds', 150, (g) => g.world.hardmode); sell('Dryad', 'hallowed_seeds', 2000, (g) => g.world.hardmode); sell('Dryad', 'mushroom_grass_seeds', 150); sell('Dryad', 'pumpkin_seed', 250);
  for (const h of ['daybloom', 'moonglow', 'blinkroot', 'deathweed', 'waterleaf', 'fireblossom', 'shiverthorn']) sell('Dryad', h + '_seeds', 40);
  sell('Merchant', 'bug_net', 2500); sell('Merchant', 'sickle', 2000); sell('Merchant', 'rope', 10); sell('Merchant', 'bottle', 20); sell('Merchant', 'book', 100); sell('Merchant', 'empty_bucket', 500); sell('Merchant', 'copper_watch', 1000); sell('Clothier', 'hunter_cloak', 50000); sell('Tavernkeep', 'dragon_egg', 80000);
  // dropped: Solidifier by King Slime, Meat Grinder by Hardmode Crimson enemies, Honey Dispenser by Queen Bee
  for (const b of BOSSES) { if (b.id === 'king_slime' && !b.loot.includes('solidifier')) b.loot.push('solidifier'); if (b.id === 'queen_bee' && !b.loot.includes('honey_dispenser')) b.loot.push('honey_dispenser'); }
  if (BOSS_DEFS.queen_bee) BOSS_DEFS.queen_bee.drops.push({ id: 'honey_dispenser', chance: 0.33 });
  ModLib.patch(() => { const orig = KingSlime.prototype.die; KingSlime.prototype.die = function (game) { orig.call(this, game); game.dropItem(this.cx, this.cy, 'solidifier', 1); }; });
  for (const t of ['herpling', 'crimslime', 'floaty_gross', 'ichor_sticker', 'crimson_axe', 'blood_feeder', 'tainted_ghoul']) if (ENEMY_DEFS[t]) ENEMY_DEFS[t].drops.push({ id: 'meat_grinder', chance: 0.005 });
  // found in chests: after worldgen, the chests of each place get the station (and loot) that belongs there
  ModLib.onWorldgen((world, rng) => {
    const W_ = world.w, near = (x, y, id, r) => { let n = 0; for (let yy = y - r; yy <= y + r; yy++) for (let xx = x - r; xx <= x + r; xx++) if (world.inBounds(xx, yy) && world.tiles[xx + yy * W_] === id) n++; return n; };
    const put = (inv, id) => { if (!ITEMS[id] || inv.some(s => s && s.id === id)) return; for (let s = 0; s < inv.length; s++) if (!inv[s]) { inv[s] = makeStack(id, 1); return; } };
    const pick = (list) => list[Math.floor(rng() * list.length)];
    for (const [i, inv] of world.chests) {
      const x = i % W_, y = (i / W_) | 0, b = world.biome[clamp(x, 0, W_ - 1)];
      if (near(x, y, T.LIHZAHRD_BRICK, 6) > 10) { if (rng() < 0.5) put(inv, 'lihzahrd_furnace'); if (rng() < 0.5) put(inv, 'solar_tablet_fragment'); }
      else if (near(x, y, T.DUNGEON_BRICK, 6) > 10) { if (rng() < 0.33) put(inv, 'bone_welder'); if (rng() < 0.2) put(inv, 'alchemy_table'); if (rng() < 0.2) put(inv, 'water_bolt'); }
      else if (near(x, y, T.LIVING_WOOD, 6) > 6) { if (rng() < 0.5) put(inv, 'living_loom'); if (rng() < 0.3) put(inv, 'finch_staff'); }
      else if (y < world.surfaceLine - 60) { if (rng() < 0.5) put(inv, 'sky_mill'); if (rng() < 0.5) put(inv, 'cloud'); }
      else if (near(x, y, T.HIVE, 8) > 6) { put(inv, 'honey_dispenser'); }
      else if (b === BIOME.CRIMSON && y > world.surfaceLine) { if (rng() < 0.4) put(inv, 'flesh_cloning_vat'); }
      else if (b === BIOME.CORRUPTION && y > world.surfaceLine) { if (rng() < 0.4) put(inv, 'decay_chamber'); }
      else if (b === BIOME.SNOW && y > world.surfaceLine) { if (rng() < 0.5) put(inv, pick(['ice_boomerang', 'ice_blade', 'ice_skates', 'flurry_boots', 'blizzard_in_a_bottle', 'snowball_cannon', 'fish_pet'])); }
      else if (b === BIOME.OCEAN) { if (rng() < 0.5) put(inv, pick(['water_walking_boots', 'flipper', 'trident', 'breathing_reed', 'tsunami_in_a_bottle', 'sailfish_boots'])); }
      else if (b === BIOME.DESERT && y > world.surfaceLine) { if (rng() < 0.5) put(inv, pick(['storm_spear', 'ancient_chisel', 'dunerider_boots', 'thunder_zapper', 'magic_conch'])); }
      else if (b === BIOME.JUNGLE && y > world.surfaceLine) { if (rng() < 0.4) put(inv, pick(['feral_claws', 'boomstick', 'staff_of_regrowth', 'anklet_of_the_wind', 'flower_boots'])); }
      else if (y > world.surfaceLine) { if (rng() < 0.15) put(inv, pick(['spear', 'wooden_boomerang', 'mace', 'climbing_claws', 'shoe_spikes', 'umbrella', 'radar', 'aglet'])); }
    }
  });
}
