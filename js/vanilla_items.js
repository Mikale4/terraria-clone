// ---------------------------------------------------------------------------
// Vanilla items: crafting materials, herbs and seeds, buckets, every potion
// and flask with its Placed Bottle / Alchemy Table recipe, food from the
// Cooking Pot, ammunition (arrows, bullets, rockets, darts, flares...), thrown
// weapons and explosives, the remaining tools (pickaxes, drills, hamaxes,
// chainsaws) and utility items (mirrors, ropes, bug nets, wrenches...).
// ---------------------------------------------------------------------------
'use strict';

{
  const M = (id, name, col, o) => VAN.material(id, name, col, o);
  const R = (result, count, station, ing) => VAN.recipe(result, count, station, ing);
  const RA = (result, count, station, alts, rest) => VAN.recipeAlt(result, count, station, alts, rest);

  // ---- crafting materials ----------------------------------------------------------------------------------
  M('coral', 'Coral', '#e07090', { shape: 'chunk', value: 300, tooltip: 'Found in the Ocean' });
  M('seashell', 'Seashell', '#f0e0d0', { shape: 'shell', value: 200 });
  M('starfish', 'Starfish', '#e0a060', { shape: 'star', value: 200 });
  M('feather', 'Feather', '#f0f0ff', { shape: 'feather', value: 300, tooltip: 'Dropped by Harpies' });
  M('giant_harpy_feather', 'Giant Harpy Feather', '#e8e8ff', { shape: 'feather', rarity: 4, value: 20000, tooltip: 'Rarely dropped by Harpies' });
  M('rope', 'Rope', '#c0a060', { shape: 'wire', value: 10, max: 999, recipe: [['vine', 1]], count: 3, station: null, tooltip: 'Can be climbed' });
  R('rope', 3, 'workbench', [['cobweb', 3]]);
  M('wire', 'Wire', '#e04040', { shape: 'wire', value: 500, tooltip: 'Sold by the Mechanic' });
  M('leather', 'Leather', '#a06030', { shape: 'cloth', value: 100, recipe: [['rotten_chunk', 5]], station: 'workbench' }); R('leather', 1, 'workbench', [['vertebra', 5]]);
  M('sturdy_fossil', 'Sturdy Fossil', '#c8b090', { shape: 'bone', rarity: 1, value: 750, tooltip: 'Extracted from Desert Fossils' });
  M('pink_gel', 'Pink Gel', '#f080c0', { shape: 'chunk', value: 100, tooltip: 'Dropped by Pinky' });
  M('confetti', 'Confetti', '#f0e0ff', { shape: 'dust', value: 200, tooltip: 'Sold by the Party Girl' });
  M('black_lens', 'Black Lens', '#202028', { shape: 'lens', rarity: 1, value: 500, tooltip: 'Rarely dropped by Demon Eyes' });
  M('illegal_gun_parts', 'Illegal Gun Parts', '#606068', { shape: 'cog', rarity: 1, value: 250000, tooltip: 'Sold by the Arms Dealer at night' });
  M('ancient_cloth', 'Ancient Cloth', '#d0c0a0', { shape: 'cloth', value: 200, tooltip: 'Dropped by Dark Casters' });
  M('tattered_cloth', 'Tattered Cloth', '#a09080', { shape: 'cloth', value: 100, tooltip: 'Dropped by Goblin Scouts' });
  M('worm_tooth', 'Worm Tooth', '#e0d8c0', { shape: 'tooth', value: 100, tooltip: 'Dropped by Devourers' });
  M('dark_shard', 'Dark Shard', '#4a3a6a', { shape: 'gem', rarity: 4, value: 20000, tooltip: 'Dropped by Dark Mummies' });
  M('light_shard', 'Light Shard', '#f0e0a0', { shape: 'gem', rarity: 4, value: 20000, tooltip: 'Dropped by Light Mummies' });
  M('turtle_shell', 'Turtle Shell', '#4a8a4a', { shape: 'shell', rarity: 5, value: 100000, tooltip: 'Dropped by Giant Tortoises' });
  M('black_ink', 'Black Ink', '#202030', { shape: 'vial', value: 1000, tooltip: 'Dropped by Squids' });
  M('purple_mucus', 'Purple Mucus', '#8060a0', { shape: 'vial', value: 1000, tooltip: 'Dropped by Bloody Mucus... here, Crimson slimes' });
  M('soul_of_flight', 'Soul of Flight', '#a0e0ff', { shape: 'orb', rarity: 3, value: 2000, tooltip: 'Dropped by Wyverns' });
  M('shroomite_bar', 'Shroomite Bar', '#6aa0d0', { shape: 'bar', rarity: 7, value: 30000, recipe: [['chlorophyte_bar', 1], ['glow_mushroom', 15]], station: 'autohammer' });
  M('spectre_bar', 'Spectre Bar', '#c0e0e0', { shape: 'bar', rarity: 7, value: 30000, recipe: [['chlorophyte_bar', 2], ['ectoplasm', 1]], count: 2, station: 'mythril_anvil' });
  M('flinx_fur', 'Flinx Fur', '#a0e0ff', { shape: 'cloth', value: 100, tooltip: 'Dropped by Snow Flinxes' });
  M('bamboo', 'Bamboo', '#a0c060', { shape: 'chunk', value: 20, tooltip: 'Grows in the Jungle' });
  M('cursed_flame_dust', 'Cursed Flames (bottled)', '#60e040', { shape: 'vial', rarity: 3, value: 200 });
  M('bezoar_shell', 'Antidote Base', '#60a060', { shape: 'chunk', value: 100 });
  M('vine_rope', 'Vine Rope', '#40a040', { shape: 'wire', value: 10, recipe: [['vine', 1]], count: 3, station: null, max: 999 });
  M('bottled_water', 'Bottled Water', '#80c0ff', { shape: 'vial', value: 20, recipe: [['bottle', 1]], station: 'water', max: 99 });
  M('bottled_honey', 'Bottled Honey', '#e0a020', { shape: 'vial', value: 100, recipe: [['bottle', 1]], station: 'honey', max: 30, props: { consumable: true, heal: 80, tooltip: 'Restores 80 life and grants the Honey buff', buffName: 'Honey', buffTime: 60 * 60 } });
  M('empty_bucket', 'Empty Bucket', '#a0a0a8', { shape: 'pouch', value: 500, recipe: [['iron_bar', 3]], station: 'anvil', max: 99 }); R('empty_bucket', 1, 'anvil', [['lead_bar', 3]]);
  M('water_bucket', 'Water Bucket', '#4080e0', { shape: 'pouch', value: 500, max: 99, tooltip: 'A bucket of water: use it to pour water out', recipe: [['empty_bucket', 1]], station: 'water' });
  M('lava_bucket', 'Lava Bucket', '#e06020', { shape: 'pouch', value: 500, max: 99, tooltip: 'A bucket of lava', recipe: [['empty_bucket', 1]], station: 'lava' });
  M('honey_bucket', 'Honey Bucket', '#e0a020', { shape: 'pouch', value: 500, max: 99, tooltip: 'A bucket of honey', recipe: [['empty_bucket', 1]], station: 'honey' });
  M('bottomless_water_bucket', 'Bottomless Water Bucket', '#4080e0', { shape: 'pouch', rarity: 4, value: 50000, max: 1, tooltip: 'Infinite water. Fished up from Angler quests' });
  M('super_absorbant_sponge', 'Super Absorbant Sponge', '#e0e060', { shape: 'box', rarity: 4, value: 50000, max: 1, tooltip: 'Soaks up infinite water' });
  M('bottomless_lava_bucket', 'Bottomless Lava Bucket', '#e06020', { shape: 'pouch', rarity: 4, value: 50000, max: 1, tooltip: 'Infinite lava. Fished up in the Underworld' });
  M('gold_dust', 'Gold Dust', '#f0d040', { shape: 'dust', rarity: 1, value: 800, recipe: [['gold_bar', 1]], count: 3, station: 'mythril_anvil' });
  M('crystal_dart', 'Crystal Dart', '#e080ff', { shape: 'chunk', rarity: 4, value: 200 });
  M('cursed_dart', 'Cursed Dart', '#80ff40', { shape: 'chunk', rarity: 4, value: 200 });
  M('ichor_dart', 'Ichor Dart', '#ffe060', { shape: 'chunk', rarity: 4, value: 200 });
  for (const id of ['crystal_dart', 'cursed_dart', 'ichor_dart']) { Object.assign(ITEMS[id], { ammo: 'dart', damage: 17, material: false, tooltip: '17 damage dart' }); }
  R('crystal_dart', 100, 'mythril_anvil', [['crystal_shard', 1]]); R('cursed_dart', 100, 'mythril_anvil', [['cursed_flame', 1]]); R('ichor_dart', 100, 'mythril_anvil', [['ichor', 1]]);
  M('seed_ammo', 'Seed', '#80c040', { shape: 'seed', value: 5, props: { ammo: 'dart', damage: 3 }, tooltip: '3 damage dart (Blowpipe)' }); ITEMS.seed_ammo.name = 'Seed';
  M('poison_dart', 'Poison Dart', '#60c060', { shape: 'chunk', value: 20, props: { ammo: 'dart', damage: 7, onHitBuff: 'Poisoned' }, recipe: [['stinger', 1]], count: 50, station: 'workbench' });
  ITEMS.sand.ammo = 'sand'; ITEMS.sand.damage = 0;
  if (ITEMS.ebonsand) { ITEMS.ebonsand.ammo = 'sand'; } if (ITEMS.crimsand) { ITEMS.crimsand.ammo = 'sand'; } if (ITEMS.pearlsand) { ITEMS.pearlsand.ammo = 'sand'; }
  ITEMS.gel.ammo = 'gel'; ITEMS.gel.damage = ITEMS.gel.damage || 0;
  ITEMS.fallen_star.ammo = 'star'; ITEMS.fallen_star.damage = ITEMS.fallen_star.damage || 25;
  if (ITEMS.coin_copper) { ITEMS.coin_copper.ammo = 'coin'; ITEMS.coin_silver.ammo = 'coin'; ITEMS.coin_gold.ammo = 'coin'; ITEMS.coin_platinum.ammo = 'coin'; ITEMS.coin_copper.damage = 25; ITEMS.coin_silver.damage = 50; ITEMS.coin_gold.damage = 100; ITEMS.coin_platinum.damage = 200; }
  M('snowball', 'Snowball', '#f0f8ff', { shape: 'orb', value: 5, props: { ammo: 'snowball', damage: 8, thrown: true }, recipe: [['snow', 1]], count: 15, station: null, tooltip: '8 damage. Throw it, or fire it from a Snowball Cannon' });
  M('flare', 'Flare', '#ff6020', { shape: 'chunk', value: 5, props: { ammo: 'flare', damage: 1, color: '#ff8040', trail: '#ff8040' }, recipe: [['torch', 1]], count: 15, station: null, tooltip: 'Fired from a Flare Gun; sticks and lights the area' });
  M('blue_flare', 'Blue Flare', '#4080ff', { shape: 'chunk', value: 5, props: { ammo: 'flare', damage: 1, color: '#60a0ff', trail: '#60a0ff' }, recipe: [['torch', 1], ['gel', 1]], count: 15, station: null });
  M('green_solution', 'Green Solution', '#60e060', { shape: 'vial', rarity: 3, value: 2500, props: { ammo: 'solution', solution: 'pure' }, tooltip: 'Used by the Clentaminator: spreads the Purity' });
  M('blue_solution', 'Blue Solution', '#60c0ff', { shape: 'vial', rarity: 3, value: 2500, props: { ammo: 'solution', solution: 'hallow' }, tooltip: 'Used by the Clentaminator: spreads the Hallow' });
  M('purple_solution', 'Purple Solution', '#a060e0', { shape: 'vial', rarity: 3, value: 2500, props: { ammo: 'solution', solution: 'corrupt' }, tooltip: 'Used by the Clentaminator: spreads the Corruption' });
  M('red_solution', 'Red Solution', '#e04040', { shape: 'vial', rarity: 3, value: 2500, props: { ammo: 'solution', solution: 'crimson' }, tooltip: 'Used by the Clentaminator: spreads the Crimson' });
  M('dark_blue_solution', 'Dark Blue Solution', '#3050c0', { shape: 'vial', rarity: 3, value: 2500, props: { ammo: 'solution', solution: 'mushroom' }, tooltip: 'Used by the Clentaminator: spreads Glowing Mushrooms' });

  // ---- herbs & seeds (potion ingredients) -------------------------------------------------------------------
  for (const [id, name, col, where] of [['daybloom', 'Daybloom', '#f0e040', 'Grows on the surface, blooms by day'], ['moonglow', 'Moonglow', '#80c0ff', 'Grows in the Jungle, blooms at night'], ['blinkroot', 'Blinkroot', '#e0c060', 'Grows underground, blooms at random'], ['deathweed', 'Deathweed', '#8040a0', 'Grows in the Corruption / Crimson, blooms on a Blood Moon or full moon'], ['waterleaf', 'Waterleaf', '#40a0e0', 'Grows in the Desert, blooms in the rain'], ['fireblossom', 'Fireblossom', '#ff6020', 'Grows in the Underworld, blooms in the evening'], ['shiverthorn', 'Shiverthorn', '#a0e0ff', 'Grows in the Snow biome']]) {
    M(id, name, col, { shape: 'leaf', value: 20, tooltip: where }); M(`${id}_seeds`, `${name} Seeds`, VAN.dark(col, 0.2), { shape: 'seed', value: 10, tooltip: 'Plant in a Clay Pot or on grass' });
  }
  M('jungle_spores', 'Jungle Spores', '#40c080', { shape: 'dust', value: 50 });
  M('pumpkin_seed', 'Pumpkin Seed', '#e0a040', { shape: 'seed', value: 250, tooltip: 'Plant on grass to grow pumpkins' });
  M('grass_seeds', 'Grass Seeds', '#40c040', { shape: 'seed', value: 20 }); M('jungle_grass_seeds', 'Jungle Grass Seeds', '#20a060', { shape: 'seed', value: 150 }); M('corrupt_seeds', 'Corrupt Seeds', '#8060c0', { shape: 'seed', value: 500 }); M('crimson_seeds', 'Crimson Seeds', '#c04040', { shape: 'seed', value: 500 }); M('hallowed_seeds', 'Hallowed Seeds', '#60e0e0', { shape: 'seed', value: 2000 }); M('mushroom_grass_seeds', 'Mushroom Grass Seeds', '#4090ff', { shape: 'seed', value: 150 });
  M('clay_pot', 'Clay Pot', '#b86a3a', { shape: 'pouch', value: 100, recipe: [['clay', 6]], station: 'furnace', tooltip: 'Herbs can be planted in it' });
  M('life_fruit', 'Life Fruit', '#40e040', { shape: 'orb', rarity: 5, value: 10000, max: 99, props: { consumable: true }, tooltip: 'Permanently increases maximum life by 5 (up to 500). Grows in the Underground Jungle after a mechanical boss' });
  ITEMS.life_fruit.onUse = (g, slot) => { const p = g.player; if (p.maxHp < 400) { g.message('You need 400 max life from Life Crystals first.', '#ff8080'); return; } if (p.maxHp >= 500) { g.message('Your life is already at its maximum.', '#ff8080'); return; } p.maxHp += 5; p.hp += 5; g.consumeSlot(slot); FX.burst(g, p.cx, p.cy, 16, '#40e040', 3, 30); Audio_.play('heal'); };

  // ---- potions: Bottled Water + herbs at a Placed Bottle / Alchemy Table --------------------------------------
  const POT = (id, name, buff, desc, col, ing, o = {}) => { if (!ITEMS[id]) defModPotion(id, name, buff, desc, col, ing, Object.assign({ station: 'alchemy' }, o)); else { const it = ITEMS[id]; it.buffName = it.buffName || buff; RECIPES.forEach(r => { if (r.result === id) r.station = 'alchemy'; }); } RECIPES.forEach(r => { if (r.result === id && r.ing.some(([i]) => i === 'bottle')) { r.ing = ing; r.station = 'alchemy'; } }); delete ITEMS[id].mod; RECIPES.forEach(r => { if (r.result === id) delete r.mod; }); };
  const W = ['bottled_water', 1];
  POT('ironskin_potion', 'Ironskin Potion', 'Ironskin', '+8 defense', '#c0c0c8', [W, ['daybloom', 1], ['iron_ore', 1]]); R('ironskin_potion', 1, 'alchemy', [W, ['daybloom', 1], ['lead_ore', 1]]);
  POT('regeneration_potion', 'Regeneration Potion', 'Regeneration', 'Life regeneration', '#ff80a0', [W, ['daybloom', 1], ['mushroom', 1]]);
  POT('swiftness_potion', 'Swiftness Potion', 'Swiftness', '+25% movement speed', '#ffe060', [W, ['cactus', 1], ['blinkroot', 1]]);
  POT('gills_potion', 'Gills Potion', 'Gills', 'Breathe water', '#40c0ff', [W, ['waterleaf', 1], ['coral', 1]]);
  POT('mining_potion', 'Mining Potion', 'Mining', '+25% mining speed', '#e0a040', [W, ['antlion_mandible', 1], ['blinkroot', 1]]);
  POT('battle_potion', 'Battle Potion', 'Battle', 'Increased enemy spawns', '#c04040', [W, ['deathweed', 1], ['rotten_chunk', 1]]); R('battle_potion', 1, 'alchemy', [W, ['deathweed', 1], ['vertebra', 1]]);
  POT('hunter_potion', 'Hunter Potion', 'Hunter', 'Shows enemies on the minimap', '#40ff80', [W, ['daybloom', 1], ['blinkroot', 1], ['shark_fin', 1]]);
  POT('spelunker_potion', 'Spelunker Potion', 'Spelunker', 'Ore glows through walls', '#ffd040', [W, ['blinkroot', 1], ['moonglow', 1], ['gold_ore', 1]]); R('spelunker_potion', 1, 'alchemy', [W, ['blinkroot', 1], ['moonglow', 1], ['platinum_ore', 1]]);
  POT('featherfall_potion', 'Featherfall Potion', 'Featherfall', 'Slow falling', '#e0e0ff', [W, ['daybloom', 1], ['blinkroot', 1], ['feather', 1]]);
  POT('endurance_potion', 'Endurance Potion', 'Endurance', '10% damage reduction', '#a0a0ff', [W, ['blinkroot', 1], ['armored_cavefish', 1]]);
  POT('wrath_potion', 'Wrath Potion', 'Wrath', '+10% damage', '#ff4040', [W, ['deathweed', 1], ['ebonkoi', 1]]);
  POT('rage_potion', 'Rage Potion', 'Rage', '+10% critical strike chance', '#ff8040', [W, ['deathweed', 1], ['hemopiranha', 1]]);
  POT('lifeforce_potion', 'Lifeforce Potion', 'Lifeforce', '+20% max life', '#ff60a0', [W, ['moonglow', 1], ['shiverthorn', 1], ['waterleaf', 1], ['prismite', 1]]);
  POT('obsidian_skin_potion', 'Obsidian Skin Potion', 'Obsidian Skin', 'Immunity to lava', '#6040a0', [W, ['waterleaf', 1], ['fireblossom', 1], ['obsidian', 1]]);
  POT('archery_potion', 'Archery Potion', 'Archery', '+20% arrow speed and damage', '#c0a060', [W, ['daybloom', 1], ['lens', 1]]);
  POT('magic_power_potion', 'Magic Power Potion', 'Magic Power', '+20% magic damage', '#ff80ff', [W, ['moonglow', 1], ['deathweed', 1], ['fallen_star', 1]]);
  POT('mana_regeneration_potion', 'Mana Regeneration Potion', 'Mana Regeneration', 'Faster mana regeneration', '#8080ff', [W, ['daybloom', 1], ['moonglow', 1], ['fallen_star', 1]]);
  POT('summoning_potion', 'Summoning Potion', 'Summoning', '+1 minion slot', '#e0c0ff', [W, ['moonglow', 1], ['fireblossom', 1], ['pixie_dust', 1]]);
  POT('titan_potion', 'Titan Potion', 'Titan', '+150% knockback', '#c0a080', [W, ['bone', 1], ['shiverthorn', 1], ['soul_of_might', 1]]);
  POT('night_owl_potion', 'Night Owl Potion', 'Night Owl', 'Increased night vision', '#c0c0ff', [W, ['daybloom', 1], ['blinkroot', 1]], { time: 480 });
  POT('shine_potion', 'Shine Potion', 'Shine', 'Emits an aura of light', '#ffe080', [W, ['daybloom', 1], ['glow_mushroom', 1]], { time: 480 });
  POT('thorns_potion', 'Thorns Potion', 'Thorns', 'Attackers take damage', '#60c040', [W, ['deathweed', 1], ['cactus', 1], ['stinger', 1]]);
  POT('water_walking_potion', 'Water Walking Potion', 'Water Walking', 'Walk on water and honey', '#60c0ff', [W, ['waterleaf', 1], ['shark_fin', 1]], { time: 300 });
  POT('invisibility_potion', 'Invisibility Potion', 'Invisibility', 'Enemies are less likely to notice you', '#e0e0e0', [W, ['blinkroot', 1], ['moonglow', 1]], { time: 180 });
  POT('heartreach_potion', 'Heartreach Potion', 'Heartreach', 'Increased pickup range for hearts', '#ff6080', [W, ['crimson_tigerfish', 1], ['daybloom', 1]], { time: 480 });
  POT('calming_potion', 'Calming Potion', 'Calm', 'Reduced enemy spawns', '#a0e0c0', [W, ['damselfish', 1], ['daybloom', 1]]);
  POT('builder_potion', 'Builder Potion', 'Builder', 'Faster placement and greater range', '#e0c080', [W, ['daybloom', 1], ['moonglow', 1], ['blinkroot', 1], ['waterleaf', 1]], { time: 300 });
  POT('sonar_potion', 'Sonar Potion', 'Sonar', 'Shows what is on the line while fishing', '#60a0e0', [W, ['waterleaf', 1], ['coral', 1]], { time: 480 });
  POT('crate_potion', 'Crate Potion', 'Crate', 'Higher chance of crates while fishing', '#c09060', [W, ['moonglow', 1], ['shiverthorn', 1], ['waterleaf', 1], ['amber', 1]], { time: 240 });
  POT('fishing_potion', 'Fishing Potion', 'Fishing', '+15 fishing power', '#40c0c0', [W, ['crispy_honey', 1], ['waterleaf', 1]], { time: 480 });
  POT('warmth_potion', 'Warmth Potion', 'Warmth', 'Reduced damage from cold enemies', '#ffa060', [W, ['shiverthorn', 1], ['frost_core', 1]], { time: 1500 });
  POT('inferno_potion', 'Inferno Potion', 'Inferno', 'Ignites nearby enemies', '#ff4000', [W, ['fireblossom', 1], ['obsidian', 1], ['flarefin_koi', 1]]);
  POT('teleportation_potion', 'Teleportation Potion', null, 'Teleports you somewhere random', '#e040e0', [W, ['chaos_fish', 1], ['blinkroot', 1], ['fireblossom', 1]]);
  POT('recall_potion', 'Recall Potion', null, 'Teleports you home', '#40e0ff', [W, ['daybloom', 1], ['specular_fish', 1]]);
  POT('wormhole_potion', 'Wormhole Potion', null, 'Teleports you to a team member (multiplayer)', '#8040ff', [W, ['blinkroot', 1], ['specular_fish', 1]]);
  POT('gravitation_potion', 'Gravitation Potion', 'Gravitation', 'Press Down while airborne to flip your gravity', '#a0a0ff', [W, ['fireblossom', 1], ['deathweed', 1], ['blinkroot', 1], ['feather', 1]]);
  POT('gender_change_potion', 'Gender Change Potion', null, 'Changes your character', '#ffb0ff', [W, ['fireblossom', 1], ['moonglow', 1], ['blinkroot', 1], ['deathweed', 1]]);
  POT('luck_potion', 'Luck Potion', 'Lucky', 'Increased luck', '#60ff60', [W, ['ladybug', 1], ['waterleaf', 1]], { time: 600 });
  POT('lesser_luck_potion', 'Lesser Luck Potion', 'Lucky', 'Slightly increased luck', '#a0ff80', [W, ['ladybug', 1], ['daybloom', 1]], { time: 300 });
  POT('greater_luck_potion', 'Greater Luck Potion', 'Lucky', 'Greatly increased luck', '#20e040', [W, ['ladybug', 1], ['moonglow', 1], ['blinkroot', 1]], { time: 900 });
  POT('ammo_reservation_potion', 'Ammo Reservation Potion', 'Ammo Reservation', '20% chance not to consume ammo', '#c0c060', [W, ['moonglow', 1], ['double_cod', 1]]);
  POT('dangersense_potion', 'Dangersense Potion', 'Dangersense', 'Shows traps and dangerous tiles', '#ff8080', [W, ['shiverthorn', 1], ['cobweb', 1]], { time: 600 });
  POT('flipper_potion', 'Flipper Potion', 'Flipper', 'Swim like a fish', '#40a0ff', [W, ['waterleaf', 1], ['shark_fin', 1], ['neon_tetra', 1]], { time: 300 });
  POT('lifeforce_potion', 'Lifeforce Potion', 'Lifeforce', '+20% max life', '#ff60a0', [W, ['moonglow', 1], ['shiverthorn', 1], ['waterleaf', 1], ['prismite', 1]]);
  POT('biome_sight_potion', 'Biome Sight Potion', 'Biome Sight', 'Shows infected blocks', '#c0ffc0', [W, ['daybloom', 1], ['grass_seeds', 1]], { time: 480 });
  POT('stinkpot', 'Stink Potion', null, 'Throw it: the target reeks (Stinky debuff)', '#80a040', [W, ['stinkfish', 1], ['deathweed', 1]]);
  POT('love_potion', 'Love Potion', null, 'Throw it: the target falls in love', '#ff80c0', [W, ['princess_fish', 1], ['shiverthorn', 1]]);
  POT('trapsight_potion', 'Trapsight Potion', 'Dangersense', 'Shows traps', '#ff9090', [W, ['shiverthorn', 1], ['cobweb', 1]], { time: 600 });
  POT('titan_potion', 'Titan Potion', 'Titan', '+150% knockback', '#c0a080', [W, ['bone', 1], ['shiverthorn', 1], ['soul_of_might', 1]]);
  if (ITEMS.lesser_healing) { RECIPES.forEach(r => { if (r.result === 'lesser_healing') { r.station = 'alchemy'; r.ing = [['bottled_water', 2], ['mushroom', 1], ['gel', 2]]; r.count = 2; } }); }
  R('healing_potion', 2, 'alchemy', [['lesser_healing', 2], ['glow_mushroom', 1]]); if (!ITEMS.healing_potion) VAN.item('healing_potion', 'Healing Potion', { max: 30, consumable: true, rarity: 1, heal: 100, tooltip: 'Restores 100 life', drawIcon: genericIcon('#ff4060', '#fff', 'potion') }, 1000);
  R('greater_healing', 3, 'alchemy', [['bottled_water', 3], ['pixie_dust', 3], ['crystal_shard', 1]]);
  R('super_healing_potion', 3, 'alchemy', [['greater_healing', 3], ['solar_fragment', 1], ['vortex_fragment', 1], ['nebula_fragment', 1], ['stardust_fragment', 1]]); if (!ITEMS.super_healing_potion) VAN.item('super_healing_potion', 'Super Healing Potion', { max: 30, consumable: true, rarity: 8, heal: 200, tooltip: 'Restores 200 life', drawIcon: genericIcon('#ff2040', '#fff', 'potion') }, 5000);
  if (ITEMS.lesser_mana) RECIPES.forEach(r => { if (r.result === 'lesser_mana') { r.station = 'alchemy'; r.ing = [['bottled_water', 2], ['fallen_star', 1], ['glow_mushroom', 1]]; r.count = 2; } });
  R('mana_potion', 2, 'alchemy', [['lesser_mana', 2], ['glow_mushroom', 1]]); if (!ITEMS.mana_potion) VAN.item('mana_potion', 'Mana Potion', { max: 30, consumable: true, rarity: 1, mana: 100, tooltip: 'Restores 100 mana', drawIcon: genericIcon('#4060ff', '#fff', 'potion') }, 500);
  R('greater_mana', 3, 'alchemy', [['bottled_water', 3], ['fallen_star', 1], ['crystal_shard', 1]]);
  R('super_mana_potion', 3, 'alchemy', [['greater_mana', 3], ['unicorn_horn', 1], ['crystal_shard', 1]]); if (!ITEMS.super_mana_potion) VAN.item('super_mana_potion', 'Super Mana Potion', { max: 30, consumable: true, rarity: 4, mana: 300, tooltip: 'Restores 300 mana', drawIcon: genericIcon('#2040ff', '#fff', 'potion') }, 2000);
  VAN.item('restoration_potion', 'Restoration Potion', { max: 30, consumable: true, rarity: 1, heal: 90, mana: 90, tooltip: 'Restores 90 life and 90 mana', drawIcon: genericIcon('#c040ff', '#fff', 'potion') }, 1000); R('restoration_potion', 2, 'alchemy', [['bottled_water', 2], ['glow_mushroom', 1], ['daybloom', 1]]);
  // weapon flasks (Imbuing Station)
  for (const [id, name, buff, desc, col, ing] of [['flask_of_poison', 'Flask of Poison', 'Weapon Imbue: Poison', 'Melee attacks poison enemies', '#60c040', [W, ['stinger', 1]]], ['flask_of_fire', 'Flask of Fire', 'Weapon Imbue: Fire', 'Melee attacks set enemies on fire', '#ff6020', [W, ['fireblossom', 1]]], ['flask_of_venom', 'Flask of Venom', 'Weapon Imbue: Venom', 'Melee attacks inflict Venom', '#a040c0', [W, ['vial_of_venom', 1]]], ['flask_of_cursed_flames', 'Flask of Cursed Flames', 'Weapon Imbue: Cursed Flames', 'Melee attacks inflict Cursed Inferno', '#80ff40', [W, ['cursed_flame', 1]]], ['flask_of_ichor', 'Flask of Ichor', 'Weapon Imbue: Ichor', 'Melee attacks inflict Ichor', '#ffe060', [W, ['ichor', 1]]], ['flask_of_gold', 'Flask of Gold', 'Weapon Imbue: Gold', 'Melee attacks make enemies drop more coins', '#f0d040', [W, ['gold_dust', 1]]], ['flask_of_nanites', 'Flask of Nanites', 'Weapon Imbue: Nanites', 'Melee attacks confuse enemies', '#60e0e0', [W, ['nanites', 1]]], ['flask_of_party', 'Flask of Party', 'Weapon Imbue: Confetti', 'Melee attacks shoot confetti', '#ff80ff', [W, ['confetti', 1]]]]) POT(id, name, buff, desc, col, ing, { time: 1200, station: 'imbuing_station' });
  RECIPES.forEach(r => { if (/^flask_of_/.test(r.result)) r.station = 'imbuing_station'; });
  M('vial_of_venom', 'Vial of Venom', '#a040c0', { shape: 'vial', rarity: 3, value: 1500, tooltip: 'Sold by the Witch Doctor after Plantera' });
  M('nanites', 'Nanites', '#60e0e0', { shape: 'dust', rarity: 3, value: 1500, tooltip: 'Sold by the Cyborg' });
  // food (Cooking Pot): the Well Fed buff family
  const FOOD = (id, name, col, ing, station, buff = 'Well Fed', time = 300, rarity = 1) => { VAN.item(id, name, { max: 30, consumable: true, rarity, food: true, buffName: buff, buffTime: 60 * time, tooltip: `${buff}: minor improvements to all stats for ${Math.round(time / 60)} minutes`, drawIcon: VAN.icon('meat', col) }, 500); if (ing) R(id, 1, station, ing); };
  FOOD('bowl_of_soup', 'Bowl of Soup', '#e0a060', [['bowl', 1], ['mushroom', 1], ['goldfish', 1]], 'cooking_pot');
  FOOD('grilled_bunny', 'Grilled Bunny', '#c08040', [['bunny', 1]], 'cooking_pot'); ITEMS.grilled_bunny.buffName = 'Plenty Satisfied';
  FOOD('cooked_fish', 'Cooked Fish', '#e0c090', [['bass', 1]], 'cooking_pot');
  FOOD('cooked_marshmallow', 'Cooked Marshmallow', '#f0e0d0', [['marshmallow', 1]], 'campfire');
  FOOD('cooked_shrimp', 'Cooked Shrimp', '#ff9060', [['shrimp', 1]], 'cooking_pot');
  FOOD('sashimi', 'Sashimi', '#ff8080', [['trout', 1]], 'cooking_pot');
  FOOD('pumpkin_pie', 'Pumpkin Pie', '#e09040', [['pumpkin', 10]], 'cooking_pot', 'Plenty Satisfied', 600, 2);
  FOOD('apple_pie', 'Apple Pie', '#e0b060', [['apple', 5]], 'cooking_pot', 'Plenty Satisfied', 600, 2);
  FOOD('bacon', 'Bacon', '#e06040', null, null, 'Well Fed', 300); FOOD('roasted_bird', 'Roasted Bird', '#c08040', [['bird', 1]], 'cooking_pot');
  FOOD('seafood_dinner', 'Seafood Dinner', '#e0d0a0', [['atlantic_cod', 1], ['flounder', 1]], 'cooking_pot', 'Exquisitely Stuffed', 480, 3);
  FOOD('golden_delight', 'Golden Delight', '#ffd040', [['golden_carp', 1], ['gold_bar', 1]], 'cooking_pot', 'Exquisitely Stuffed', 720, 3);
  FOOD('christmas_pudding', 'Christmas Pudding', '#8a4a2a', null, null, 'Exquisitely Stuffed', 720, 3); FOOD('gingerbread_cookie', 'Gingerbread Cookie', '#c08040', null, null, 'Plenty Satisfied', 480, 2);
  FOOD('bloody_moscato', 'Bloody Moscato', '#c02040', [['bottled_water', 1], ['blood_orange', 1], ['grapes', 1]], 'keg', 'Tipsy', 300, 2);
  FOOD('fruit_salad', 'Fruit Salad', '#e0e080', [['apple', 1], ['apricot', 1], ['grapefruit', 1]], 'cooking_pot', 'Plenty Satisfied', 480, 2);
  FOOD('coffee', 'Coffee', '#6a3a1a', [['bottled_water', 1], ['pumpkin_seed', 1]], 'teapot', 'Well Fed', 240); FOOD('milkshake', 'Milkshake', '#f0e0f0', [['bottled_water', 1], ['apple', 1]], 'cooking_pot');
  FOOD('marshmallow', 'Marshmallow', '#f8f0f0', null, null, 'Well Fed', 60); ITEMS.marshmallow.tooltip = 'Sold by the Merchant in the Snow biome. Roast it at a Campfire';
  for (const [id, name, col] of [['apple', 'Apple', '#e04040'], ['apricot', 'Apricot', '#f0a040'], ['grapefruit', 'Grapefruit', '#f0c060'], ['lemon', 'Lemon', '#f0e040'], ['peach', 'Peach', '#f0a080'], ['cherry', 'Cherry', '#c02040'], ['plum', 'Plum', '#8040a0'], ['banana', 'Banana', '#f0e060'], ['coconut', 'Coconut', '#8a5a2a'], ['mango', 'Mango', '#f0a020'], ['pineapple', 'Pineapple', '#e0c040'], ['dragon_fruit', 'Dragon Fruit', '#e040a0'], ['star_fruit', 'Star Fruit', '#f0e080'], ['blood_orange', 'Blood Orange', '#e04030'], ['rambutan', 'Rambutan', '#e04060'], ['elderberry', 'Elderberry', '#4a3a6a'], ['blackcurrant', 'Blackcurrant', '#3a2a4a'], ['pomegranate', 'Pomegranate', '#c03050'], ['spicy_pepper', 'Spicy Pepper', '#e02020'], ['grapes', 'Grapes', '#8040c0']]) FOOD(id, name, col, null, null, 'Well Fed', 300, 1), ITEMS[id].tooltip = 'Fruit: shaken from trees. Well Fed for 5 minutes';
  M('bowl', 'Bowl', '#c08040', { shape: 'shell', value: 20, recipe: [['clay', 2]], station: 'furnace' });
  M('goldfish', 'Goldfish', '#f0a020', { shape: 'fin', value: 100 }); M('bunny', 'Bunny (caught)', '#f0f0f0', { shape: 'egg', value: 100 }); M('shrimp', 'Shrimp', '#ff9060', { shape: 'fin', value: 100 }); M('bird', 'Bird (caught)', '#e0e0e0', { shape: 'egg', value: 50 });
  for (const [id, name, col] of [['ebonkoi', 'Ebonkoi', '#7050a0'], ['hemopiranha', 'Hemopiranha', '#c03040'], ['prismite', 'Prismite', '#e0c0ff'], ['flarefin_koi', 'Flarefin Koi', '#ff6020'], ['chaos_fish', 'Chaos Fish', '#e040e0'], ['specular_fish', 'Specular Fish', '#c0e0ff'], ['crimson_tigerfish', 'Crimson Tigerfish', '#e06040'], ['damselfish', 'Damselfish', '#60a0e0'], ['double_cod', 'Double Cod', '#a0c0a0'], ['stinkfish', 'Stinkfish', '#80a040'], ['princess_fish', 'Princess Fish', '#ff80c0'], ['obsidifish', 'Obsidifish', '#4a3060'], ['variegated_lardfish', 'Variegated Lardfish', '#a08060'], ['frost_minnow', 'Frost Minnow', '#a0e0ff'], ['red_snapper', 'Red Snapper', '#e04040'], ['tuna', 'Tuna', '#4060a0'], ['pink_jellyfish', 'Pink Jellyfish', '#ff80c0'], ['blue_jellyfish', 'Blue Jellyfish', '#60a0ff'], ['green_jellyfish', 'Green Jellyfish', '#60e080'], ['swordfish', 'Swordfish (fish)', '#6080a0'], ['honeyfin', 'Honeyfin', '#e0a020']]) if (!ITEMS[id]) M(id, name, col, { shape: 'fin', value: 500, tooltip: 'Fished up: a potion ingredient' });
  M('ladybug', 'Ladybug', '#e03030', { shape: 'egg', value: 100, tooltip: 'Caught with a Bug Net' });

  // ---- ammunition ---------------------------------------------------------------------------------------------
  const AMMO = (id, name, ammo, dmg, col, o = {}, recipe, count, station) => { VAN.item(id, name, Object.assign({ max: 999, ammo, damage: dmg, rarity: o.rarity || 1, knockback: o.kb || 2, tooltip: `${dmg} damage ${ammo === 'arrow' ? 'arrow' : ammo === 'bullet' ? 'bullet' : ammo === 'rocket' ? 'rocket' : ammo}${o.desc ? '. ' + o.desc : ''}`, drawIcon: (x) => { x.fillStyle = col; x.fillRect(7, 1, 2, 12); x.fillStyle = '#e0e0e0'; x.fillRect(6, 0, 4, 3); if (ammo === 'arrow') { x.fillStyle = '#a8794b'; x.fillRect(5, 12, 6, 3); } else if (ammo === 'rocket') { x.fillStyle = VAN.dark(col, 0.3); x.fillRect(5, 10, 6, 5); } } }, o), 30); if (recipe) R(id, count || 50, station || 'workbench', recipe); };
  AMMO('bone_arrow', 'Bone Arrow', 'arrow', 9, '#e8e8e0', {}, [['wooden_arrow', 1], ['bone', 1]], 3, 'workbench');
  AMMO('frostburn_arrow', 'Frostburn Arrow', 'arrow', 9, '#80e0ff', { onHitBuff: 'Frostburn', color: '#80e0ff', trail: '#80e0ff' }, [['wooden_arrow', 10], ['ice_torch', 1]], 10);
  AMMO('shimmer_arrow', 'Shimmer Arrow', 'arrow', 10, '#e0c0ff', { color: '#e0c0ff', trail: '#e0c0ff' });
  AMMO('cursed_arrow', 'Cursed Arrow', 'arrow', 17, '#80ff40', { onHitBuff: 'Cursed Inferno', color: '#80ff40', trail: '#80ff40', rarity: 3 }, [['wooden_arrow', 150], ['cursed_flame', 1]], 150, 'mythril_anvil');
  AMMO('ichor_arrow', 'Ichor Arrow', 'arrow', 16, '#ffe060', { onHitBuff: 'Ichor', color: '#ffe060', trail: '#ffe060', rarity: 3 }, [['wooden_arrow', 150], ['ichor', 1]], 150, 'mythril_anvil');
  AMMO('venom_arrow', 'Venom Arrow', 'arrow', 17, '#a040c0', { onHitBuff: 'Venom', color: '#a040c0', rarity: 4 }, [['wooden_arrow', 35], ['vial_of_venom', 1]], 35, 'mythril_anvil');
  AMMO('luminite_arrow', 'Luminite Arrow', 'arrow', 20, '#40e0c0', { pierce: 2, color: '#40e0c0', trail: '#40e0c0', rarity: 9 }, [['luminite_bar', 1]], 333, 'ancient_manipulator');
  AMMO('endless_quiver', 'Endless Quiver', 'arrow', 5, '#c0a060', { max: 1, chanceKeep: 1, rarity: 4, desc: 'Never runs out' }, [['wooden_arrow', 3996]], 1, 'crystal_ball');
  AMMO('tungsten_bullet', 'Tungsten Bullet', 'bullet', 9, '#70b090', {}, [['musket_ball', 70], ['tungsten_bar', 1]], 70);
  AMMO('cursed_bullet', 'Cursed Bullet', 'bullet', 12, '#80ff40', { onHitBuff: 'Cursed Inferno', color: '#80ff40', rarity: 3 }, [['musket_ball', 150], ['cursed_flame', 1]], 150, 'mythril_anvil');
  AMMO('ichor_bullet', 'Ichor Bullet', 'bullet', 12, '#ffe060', { onHitBuff: 'Ichor', color: '#ffe060', rarity: 3 }, [['musket_ball', 150], ['ichor', 1]], 150, 'mythril_anvil');
  AMMO('venom_bullet', 'Venom Bullet', 'bullet', 13, '#a040c0', { onHitBuff: 'Venom', rarity: 4 }, [['musket_ball', 35], ['vial_of_venom', 1]], 35, 'mythril_anvil');
  AMMO('exploding_bullet', 'Exploding Bullet', 'bullet', 10, '#ff8040', { explosive: true, radius: 2, rarity: 4 }, [['musket_ball', 35], ['explosive_powder', 1]], 35, 'mythril_anvil');
  AMMO('high_velocity_bullet', 'High Velocity Bullet', 'bullet', 10, '#e0e0ff', { speedMult: 2.5, rarity: 4, pierce: 1 });
  AMMO('golden_bullet', 'Golden Bullet', 'bullet', 10, '#ffd040', { rarity: 4, desc: 'Enemies drop more coins' }, [['musket_ball', 50], ['gold_dust', 1]], 50, 'mythril_anvil');
  AMMO('nano_bullet', 'Nano Bullet', 'bullet', 15, '#60e0e0', { onHitBuff: 'Confused', rarity: 4 }, [['musket_ball', 50], ['nanites', 1]], 50, 'mythril_anvil');
  AMMO('party_bullet', 'Party Bullet', 'bullet', 10, '#ff80ff', { rarity: 4, color: '#ff80ff' }, [['musket_ball', 50], ['confetti', 1]], 50, 'mythril_anvil');
  AMMO('luminite_bullet', 'Luminite Bullet', 'bullet', 20, '#40e0c0', { pierce: 3, color: '#40e0c0', rarity: 9 }, [['luminite_bar', 1]], 333, 'ancient_manipulator');
  AMMO('endless_musket_pouch', 'Endless Musket Pouch', 'bullet', 7, '#c0c0c8', { max: 1, chanceKeep: 1, rarity: 4, desc: 'Never runs out' }, [['musket_ball', 3996]], 1, 'crystal_ball');
  AMMO('rocket_ii', 'Rocket II', 'rocket', 40, '#c04040', { explosive: true, radius: 4, tiles: true, rarity: 3 });
  AMMO('rocket_iv', 'Rocket IV', 'rocket', 65, '#c04040', { explosive: true, radius: 6, tiles: true, rarity: 3 });
  AMMO('mini_nuke_i', 'Mini Nuke I', 'rocket', 150, '#e0e040', { explosive: true, radius: 12, tiles: false, rarity: 5 });
  AMMO('mini_nuke_ii', 'Mini Nuke II', 'rocket', 150, '#e0e040', { explosive: true, radius: 12, tiles: true, rarity: 5 });
  AMMO('cluster_rocket_i', 'Cluster Rocket I', 'rocket', 40, '#e08040', { explosive: true, radius: 5, rarity: 4 });
  AMMO('cluster_rocket_ii', 'Cluster Rocket II', 'rocket', 40, '#e08040', { explosive: true, radius: 5, tiles: true, rarity: 4 });
  AMMO('dry_rocket', 'Dry Rocket', 'rocket', 40, '#c0c0c0', { explosive: true, radius: 4, rarity: 3, desc: 'Removes liquid' });
  AMMO('wet_rocket', 'Wet Rocket', 'rocket', 40, '#4080e0', { explosive: true, radius: 4, rarity: 3, desc: 'Spawns water' });
  AMMO('lava_rocket', 'Lava Rocket', 'rocket', 40, '#e06020', { explosive: true, radius: 4, rarity: 3, desc: 'Spawns lava' });
  AMMO('honey_rocket', 'Honey Rocket', 'rocket', 40, '#e0a020', { explosive: true, radius: 4, rarity: 3, desc: 'Spawns honey' });
  AMMO('mini_nuke_i', 'Mini Nuke I', 'rocket', 150, '#e0e040', { explosive: true, radius: 12, rarity: 5 });
  AMMO('stynger_bolt', 'Stynger Bolt', 'rocket', 20, '#e0a040', { explosive: true, radius: 2, rarity: 7 }, [['explosive_powder', 1]], 25, 'mythril_anvil');
  AMMO('nail', 'Nail', 'nail', 25, '#c0c0c8', { rarity: 7 }, [['iron_bar', 1]], 25, 'mythril_anvil');
  AMMO('candy_corn', 'Candy Corn', 'candy', 9, '#f0c040', { rarity: 7 });
  AMMO('explosive_jack_o_lantern', "Explosive Jack 'O Lantern", 'jack', 45, '#e08020', { explosive: true, radius: 3, rarity: 7 });
  M('explosive_powder', 'Explosive Powder', '#404040', { shape: 'dust', rarity: 4, value: 500, tooltip: 'Sold by the Demolitionist in Hardmode' });
  VAN.item('ice_torch', 'Ice Torch', { tile: T.TORCH, max: 999, tooltip: 'A cold blue torch', drawIcon: VAN.icon('candle', '#80e0ff') }, 5); R('ice_torch', 3, null, [['torch', 3], ['ice', 1]]);
  for (const [id, name, col, ing] of [['blue_torch', 'Blue Torch', '#4080ff', ['sapphire', 1]], ['red_torch', 'Red Torch', '#ff4040', ['ruby', 1]], ['green_torch', 'Green Torch', '#40ff40', ['emerald', 1]], ['purple_torch', 'Purple Torch', '#c040ff', ['amethyst', 1]], ['white_torch', 'White Torch', '#ffffff', ['diamond', 1]], ['yellow_torch', 'Yellow Torch', '#ffe040', ['topaz', 1]], ['orange_torch', 'Orange Torch', '#ff9040', ['amber', 1]], ['demon_torch', 'Demon Torch', '#a040ff', ['obsidian', 1]], ['cursed_torch', 'Cursed Torch', '#80ff40', ['cursed_flame', 1]], ['ichor_torch', 'Ichor Torch', '#ffe060', ['ichor', 1]], ['rainbow_torch', 'Rainbow Torch', '#ff80ff', ['rainbow_brick', 1]], ['pink_torch', 'Pink Torch', '#ff80c0', ['pink_gel', 1]], ['coral_torch', 'Coral Torch', '#e07090', ['coral', 1]], ['bone_torch', 'Bone Torch', '#e8e0c8', ['bone', 1]], ['ultrabright_torch', 'Ultrabright Torch', '#ffffe0', ['glow_mushroom', 1]], ['hallowed_torch', 'Hallowed Torch', '#e0c0ff', ['pixie_dust', 1]], ['corrupt_torch', 'Corrupt Torch', '#a080e0', ['vile_mushroom', 1]], ['crimson_torch', 'Crimson Torch', '#ff6060', ['vicious_mushroom', 1]], ['jungle_torch', 'Jungle Torch', '#80ff60', ['jungle_spores', 1]], ['desert_torch', 'Desert Torch', '#ffd080', ['sand', 1]], ['mushroom_torch', 'Mushroom Torch', '#60a0ff', ['glow_mushroom', 1]]]) { if (ITEMS[id]) continue; VAN.item(id, name, { tile: T.TORCH, max: 999, tooltip: 'A coloured torch', drawIcon: VAN.icon('candle', col) }, 5); R(id, 3, null, [['torch', 3], ing]); }
  M('rainbow_brick', 'Rainbow Brick', '#ff80ff', { shape: 'box', rarity: 4, value: 1000 }); VAN.block('rainbow_brick', 'Rainbow Brick', '#ff80ff', { style: 'brick', light: [0.3, 0.2, 0.3], hp: 100 }); if (T.RAINBOW_BRICK != null) TILES[T.RAINBOW_BRICK].drop = 'rainbow_brick';
  M('vicious_mushroom', 'Vicious Mushroom', '#e04040', { shape: 'mushroom', value: 20, tooltip: 'Grows in the Crimson' });
  M('vicious_powder', 'Vicious Powder', '#e04040', { shape: 'dust', value: 20, recipe: [['vicious_mushroom', 1]], count: 5, station: 'alchemy', props: { consumable: true }, tooltip: 'Throw it to spread the Crimson' });
  M('vile_powder', 'Vile Powder', '#a060e0', { shape: 'dust', value: 20, recipe: [['vile_mushroom', 1]], count: 5, station: 'alchemy', props: { consumable: true }, tooltip: 'Throw it to spread the Corruption' });

  // ---- thrown weapons & explosives -------------------------------------------------------------------------------
  VAN.throwUse = (game, slot, it) => {
    const p = game.player, st = itemStats(slot);
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
    const n = it.shots || 1, sp = it.speed || 10;
    for (let i = 0; i < n; i++) {
      const a = Math.atan2(dy, dx) + (i - (n - 1) / 2) * 0.2;
      const b = new Projectile(p.cx, p.y + 14, Math.cos(a) * sp, Math.sin(a) * sp, { kind: it.projKind || 'knife', damage: Math.round(st.damage * p.pm.dmg * (1 + (p.acc && p.acc.throwing || 0) / 100)), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: it.pierce || 0, color: it.color, hi: '#fff' });
      b.gravity = it.gravity == null ? 0.12 : it.gravity; b.life = it.life || 90; b.thrown = true;
      if (it.explosive) b.explosive = Object.assign({ damage: b.damage }, it.explosive); if (it.onHitBuff) b.onHitBuff = it.onHitBuff; if (it.trail) b.trail = { color: it.trail, len: 6, width: 3 }; if (it.sticky) b.sticky = true;
      game.projectiles.push(b);
    }
    if (!(it.noConsume || (it.chanceKeep && Math.random() < it.chanceKeep))) game.consumeSlot(slot);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  };
  const THROW = (id, name, dmg, use, kb, col, o = {}, recipe, count, station) => { const it = VAN.item(id, name, Object.assign({ max: 999, damage: dmg, useTime: use, knockback: kb, rarity: o.rarity || 0, thrown: true, color: col, tooltip: `${dmg} damage. ${o.desc || 'Thrown'}`, use: (g, s, i) => VAN.throwUse(g, s, i), drawIcon: VAN.icon(o.shape || 'chunk', col) }, o), o.value || 20); if (o.mod !== undefined) it.mod = o.mod; delete it.mod; if (recipe) R(id, count || 1, station === undefined ? 'workbench' : station, recipe); };
  THROW('shuriken', 'Shuriken', 11, 14, 2, '#c0c0c8', { chanceKeep: 0.5, shape: 'star', desc: '50% chance not to be consumed' });
  THROW('throwing_knife', 'Throwing Knife', 12, 15, 3, '#d0d0d8', { chanceKeep: 0.5, shape: 'tooth' }, [['iron_bar', 1]], 20, 'anvil'); R('throwing_knife', 20, 'anvil', [['lead_bar', 1]]);
  THROW('poisoned_knife', 'Poisoned Knife', 13, 15, 3, '#60c060', { chanceKeep: 0.5, onHitBuff: 'Poisoned', shape: 'tooth' }, [['throwing_knife', 1], ['stinger', 1]], 1, 'workbench');
  THROW('bone', 'Bone', 14, 25, 4, '#e8e8e0', { chanceKeep: 0.5, shape: 'bone', desc: 'Dropped by skeletons; also a crafting material', material: true });
  THROW('rotten_egg', 'Rotten Egg', 16, 24, 4, '#b0b080', { shape: 'egg', desc: 'Halloween: makes NPCs angry' });
  THROW('star_anise', 'Star Anise', 12, 16, 4, '#8a5a2a', { chanceKeep: 0.5, shape: 'star', desc: 'Christmas throwing star' });
  THROW('molotov_cocktail', 'Molotov Cocktail', 20, 30, 6, '#ff8040', { explosive: { radius: 3, tiles: false }, onHitBuff: 'On Fire!', rarity: 1, shape: 'vial', desc: 'Sets the ground and enemies ablaze' }, [['ale', 1], ['silk', 1], ['torch', 1]], 5, 'workbench');
  THROW('frost_daggerfish', 'Frost Daggerfish', 22, 20, 5, '#a0e0ff', { chanceKeep: 0.5, shape: 'fin', rarity: 1, desc: 'A thrown fish, oddly sharp' });
  THROW('javelin', 'Javelin', 15, 20, 5, '#c0c0c8', { chanceKeep: 0.5, pierce: 2, shape: 'tooth', speed: 12, desc: 'Sticks into enemies' }, [['iron_bar', 1]], 20, 'anvil');
  THROW('bone_javelin', 'Bone Javelin', 29, 20, 5, '#e8e8e0', { chanceKeep: 0.5, pierce: 2, shape: 'tooth', speed: 12, rarity: 1 }, [['sturdy_fossil', 1]], 15, 'workbench');
  THROW('bone_throwing_knife', 'Bone Throwing Knife', 19, 15, 3, '#e8e8e0', { chanceKeep: 0.5, shape: 'tooth', rarity: 1 }, [['sturdy_fossil', 1]], 25, 'workbench');
  THROW('paper_airplane', 'Paper Airplane', 3, 20, 1, '#f0f0f0', { chanceKeep: 0.7, gravity: 0.01, speed: 8, shape: 'feather', desc: 'Glides' });
  THROW('white_paper_airplane', 'White Paper Airplane', 3, 20, 1, '#ffffff', { chanceKeep: 0.7, gravity: 0.01, speed: 8, shape: 'feather', desc: 'Glides further' });
  THROW('spiky_ball', 'Spiky Ball', 15, 20, 1, '#a0a0a8', { chanceKeep: 0.5, shape: 'star', gravity: 0.3, life: 600, desc: 'Lies on the ground as a trap' }); delete ITEMS.spiky_ball.mod;
  THROW('beenade', 'Beenade', 12, 25, 2, '#e0c040', { explosive: { radius: 2, tiles: false }, rarity: 2, shape: 'egg', desc: 'Explodes into bees' }); delete ITEMS.beenade.mod; ITEMS.beenade.consumable = false;
  THROW('grenade', 'Grenade', 60, 30, 5, '#3a5a3a', { explosive: { radius: 3, tiles: false }, shape: 'orb', desc: 'A small explosion that will not destroy tiles' }); ITEMS.grenade.explosive = { radius: 3, damage: 60, tiles: false };
  THROW('sticky_grenade', 'Sticky Grenade', 65, 30, 5, '#3a5a3a', { explosive: { radius: 3, tiles: false }, sticky: true, shape: 'orb', desc: 'Sticks to surfaces' }, [['grenade', 5], ['gel', 1]], 5, 'workbench');
  THROW('bouncy_grenade', 'Bouncy Grenade', 65, 30, 5, '#4a7a4a', { explosive: { radius: 3, tiles: false }, shape: 'orb', desc: 'Bounces before exploding' }, [['grenade', 5], ['pink_gel', 1]], 5, 'workbench');
  THROW('happy_grenade', 'Happy Grenade', 60, 30, 5, '#ff80ff', { explosive: { radius: 3, tiles: false }, shape: 'orb', desc: 'A party in a can' }, [['grenade', 1], ['confetti', 1]], 1, 'workbench');
  THROW('holy_water', 'Holy Water', 20, 30, 4, '#60c0ff', { explosive: { radius: 2, tiles: false }, rarity: 3, shape: 'vial', desc: 'Spreads the Hallow where it lands' }, [['bottled_water', 1], ['pixie_dust', 1], ['hallowed_seeds', 1]], 5, 'workbench');
  THROW('unholy_water', 'Unholy Water', 20, 30, 4, '#a060e0', { explosive: { radius: 2, tiles: false }, rarity: 3, shape: 'vial', desc: 'Spreads the Corruption where it lands' }, [['bottled_water', 1], ['corrupt_seeds', 1], ['vile_mushroom', 1]], 5, 'workbench');
  THROW('blood_water', 'Blood Water', 20, 30, 4, '#e04040', { explosive: { radius: 2, tiles: false }, rarity: 3, shape: 'vial', desc: 'Spreads the Crimson where it lands' }, [['bottled_water', 1], ['crimson_seeds', 1], ['vicious_mushroom', 1]], 5, 'workbench');
  THROW('mud_ball', 'Mud Ball', 0, 20, 2, '#5a4030', { shape: 'orb', desc: 'Makes a mess' }, [['mud', 1]], 5, null);
  THROW('ale_tosser', 'Ale Tosser', 21, 12, 5, '#c08030', { max: 1, noConsume: true, rarity: 1, shape: 'flask', speed: 12, value: 25000, desc: 'Throws Ale from your inventory (uses Ale)' });
  ITEMS.ale_tosser.use = (g, s, it) => { const p = g.player; const a = p.inventory.find(x => x && x.id === 'ale'); if (!a) { if (g.useHeld === 1) g.message('Out of Ale!', '#ff8080'); p.useTimer = 15; return; } g.consumeSlot(a); VAN.throwUse(g, s, Object.assign({}, it, { noConsume: true })); };
  // explosives: Bomb-class consumables
  const EXPL = (id, name, radius, dmg, tiles, col, o = {}, recipe, count, station) => { VAN.item(id, name, Object.assign({ max: 99, consumable: true, rarity: o.rarity || 0, explosive: { radius, damage: dmg, tiles }, tooltip: o.desc || (tiles ? 'Explodes and destroys tiles' : 'Explodes'), drawIcon: VAN.icon('orb', col) }, o), o.value || 300); if (recipe) R(id, count || 1, station === undefined ? 'workbench' : station, recipe); };
  EXPL('sticky_bomb', 'Sticky Bomb', 4.5, 60, true, '#303038', { desc: 'Sticks to surfaces, then explodes' }, [['bomb', 1], ['gel', 1]], 1, null);
  EXPL('bouncy_bomb', 'Bouncy Bomb', 4.5, 60, true, '#404048', { desc: 'Bounces, then explodes' }, [['bomb', 1], ['pink_gel', 1]], 1, null);
  EXPL('scarab_bomb', 'Scarab Bomb', 3, 40, true, '#c0a040', { rarity: 1, desc: 'Tunnels a straight line through blocks' }, [['bomb', 1], ['sturdy_fossil', 1]], 1, 'workbench');
  EXPL('dirt_bomb', 'Dirt Bomb', 4.5, 10, false, '#8a5a2b', { desc: 'Explodes into dirt blocks' }, [['bomb', 1], ['dirt', 25]], 1, null);
  EXPL('sticky_dirt_bomb', 'Sticky Dirt Bomb', 4.5, 10, false, '#7a4a20', { desc: 'Sticks, then explodes into dirt' }, [['sticky_bomb', 1], ['dirt', 25]], 1, null);
  EXPL('sticky_dynamite', 'Sticky Dynamite', 7, 175, true, '#c03030', { rarity: 1 }, [['dynamite', 1], ['gel', 1]], 1, null);
  EXPL('bouncy_dynamite', 'Bouncy Dynamite', 7, 175, true, '#c03030', { rarity: 1 }, [['dynamite', 1], ['pink_gel', 1]], 1, null);
  EXPL('power_bomb', 'Power Bomb', 9, 200, true, '#c04040', { rarity: 2 }, [['bomb', 5], ['solar_fragment', 1]], 5, 'ancient_manipulator');
  EXPL('sticky_power_bomb', 'Sticky Power Bomb', 9, 200, true, '#c04040', { rarity: 2 }, [['power_bomb', 1], ['gel', 1]], 1, null);
  EXPL('bomb_fish', 'Bomb Fish', 5, 70, true, '#6080a0', { rarity: 1, desc: 'A fish that explodes. Fished up' });
  EXPL('dry_bomb', 'Dry Bomb', 4, 10, false, '#c0c0c0', { rarity: 1, desc: 'Removes liquids' }, [['bomb', 1], ['empty_bucket', 1]], 1, null);
  EXPL('wet_bomb', 'Wet Bomb', 4, 10, false, '#4080e0', { rarity: 1, desc: 'Spawns water' }, [['bomb', 1], ['water_bucket', 1]], 1, null);
  EXPL('lava_bomb', 'Lava Bomb', 4, 10, false, '#e06020', { rarity: 1, desc: 'Spawns lava' }, [['bomb', 1], ['lava_bucket', 1]], 1, null);
  EXPL('honey_bomb', 'Honey Bomb', 4, 10, false, '#e0a020', { rarity: 1, desc: 'Spawns honey' }, [['bomb', 1], ['honey_bucket', 1]], 1, null);
  R('dynamite', 1, 'workbench', [['bomb', 3], ['gel', 3]]);
  VAN.item('land_mine', 'Land Mine', { tile: T.SPIKE, max: 99, rarity: 3, tooltip: 'Explodes when stepped on', drawIcon: VAN.icon('orb', '#606060') }, 1000);
  VAN.item('explosives', 'Explosives', { max: 99, consumable: true, rarity: 3, explosive: { radius: 10, damage: 500, tiles: true }, tooltip: 'A huge explosion. Sold by the Demolitionist', drawIcon: VAN.icon('box', '#c03030') }, 5000);

  // ---- tools --------------------------------------------------------------------------------------------------
  const TOOL = (id, name, kind, col, power, use, dmg, rarity, o = {}, recipe, station) => { VAN.palette(id, col); if (!ITEMS[id]) defTool(id, name, kind, id, power, use, dmg, rarity); Object.assign(ITEMS[id], o); ITEM_VALUES[id] = o.value || 10000; ITEMS[id].value = ITEM_VALUES[id]; if (o.tools) ITEMS[id].tooltip = Object.entries(o.tools).map(([k, v]) => `${v}% ${k === 'pick' ? 'pickaxe' : k} power`).join(', ') + (kind === 'pick' ? `, ${power}% pickaxe power` : kind === 'axe' ? `, ${power}% axe power` : `, ${power}% hammer power`); delete ITEMS[id].mod; if (recipe) R(id, 1, station === undefined ? 'anvil' : station, recipe); };
  TOOL('cactus_pickaxe', 'Cactus Pickaxe', 'pick', '#3f9e3f', 35, 20, 5, 0, {}, [['cactus', 15]], 'workbench');
  TOOL('fossil_pickaxe', 'Fossil Pickaxe', 'pick', '#c8b090', 40, 18, 6, 1, {}, [['sturdy_fossil', 12]], 'workbench');
  TOOL('bone_pickaxe', 'Bone Pickaxe', 'pick', '#e8e0c8', 50, 11, 6, 1, { value: 20000, tooltip: '50% pickaxe power, very fast. Dropped by Undead Miners' });
  TOOL('candy_cane_pickaxe', 'Candy Cane Pickaxe', 'pick', '#e03030', 55, 17, 7, 1, { value: 5000 });
  TOOL('molten_pickaxe', 'Molten Pickaxe', 'pick', '#e04a20', 100, 14, 12, 3, { value: 50000, tooltip: '100% pickaxe power: mines Cobalt and Palladium' }, [['hellstone_bar', 20]], 'anvil');
  TOOL('cobalt_drill', 'Cobalt Drill', 'pick', '#3060c0', 110, 7, 10, 4, { value: 50000, drill: true }, [['cobalt_bar', 15]], 'mythril_anvil');
  TOOL('palladium_drill', 'Palladium Drill', 'pick', '#e08040', 130, 7, 12, 4, { value: 50000, drill: true }, [['palladium_bar', 18]], 'mythril_anvil');
  TOOL('mythril_drill', 'Mythril Drill', 'pick', '#40b0a0', 150, 6, 15, 4, { value: 60000, drill: true }, [['mythril_bar', 15]], 'mythril_anvil');
  TOOL('orichalcum_drill', 'Orichalcum Drill', 'pick', '#e060a0', 165, 6, 17, 4, { value: 60000, drill: true }, [['orichalcum_bar', 18]], 'mythril_anvil');
  TOOL('adamantite_drill', 'Adamantite Drill', 'pick', '#d03060', 180, 5, 20, 4, { value: 70000, drill: true }, [['adamantite_bar', 18]], 'mythril_anvil');
  TOOL('titanium_drill', 'Titanium Drill', 'pick', '#a0a8b8', 190, 5, 22, 4, { value: 70000, drill: true }, [['titanium_bar', 20]], 'mythril_anvil');
  TOOL('chlorophyte_drill', 'Chlorophyte Drill', 'pick', '#40c040', 200, 5, 40, 7, { value: 100000, drill: true }, [['chlorophyte_bar', 18]], 'mythril_anvil');
  TOOL('pickaxe_axe', 'Pickaxe Axe', 'pick', '#e0c0ff', 200, 9, 35, 5, { value: 100000, tools: { axe: 110 } }, [['hallowed_bar', 18], ['soul_of_fright', 1], ['soul_of_might', 1], ['soul_of_sight', 1]], 'mythril_anvil');
  TOOL('drax', 'Drax', 'pick', '#e0c0ff', 200, 5, 35, 5, { value: 100000, tools: { axe: 110 }, drill: true }, [['hallowed_bar', 18], ['soul_of_fright', 1], ['soul_of_might', 1], ['soul_of_sight', 1]], 'mythril_anvil');
  TOOL('shroomite_digging_claw', 'Shroomite Digging Claw', 'pick', '#6aa0d0', 200, 4, 45, 8, { value: 150000, tools: { axe: 125 } }, [['shroomite_bar', 18]], 'mythril_anvil');
  TOOL('spectre_pickaxe', 'Spectre Pickaxe', 'pick', '#c0e0e0', 200, 7, 45, 8, { value: 150000 }, [['spectre_bar', 18]], 'mythril_anvil');
  TOOL('nebula_pickaxe', 'Nebula Pickaxe', 'pick', '#c040c0', 225, 6, 80, 10, { value: 200000 }, [['luminite_bar', 12], ['nebula_fragment', 12]], 'ancient_manipulator');
  TOOL('solar_flare_pickaxe', 'Solar Flare Pickaxe', 'pick', '#e06030', 225, 6, 80, 10, { value: 200000 }, [['luminite_bar', 12], ['solar_fragment', 12]], 'ancient_manipulator');
  TOOL('vortex_pickaxe', 'Vortex Pickaxe', 'pick', '#30c0a0', 225, 6, 80, 10, { value: 200000 }, [['luminite_bar', 12], ['vortex_fragment', 12]], 'ancient_manipulator');
  TOOL('stardust_pickaxe', 'Stardust Pickaxe', 'pick', '#40a0e0', 225, 6, 80, 10, { value: 200000 }, [['luminite_bar', 12], ['stardust_fragment', 12]], 'ancient_manipulator');
  TOOL('laser_drill', 'Laser Drill', 'pick', '#e04040', 230, 3, 60, 8, { value: 200000, tools: { axe: 150 }, drill: true, tooltip: 'Dropped by the Martian Saucer' });
  TOOL('cobalt_chainsaw', 'Cobalt Chainsaw', 'axe', '#3060c0', 70, 6, 12, 4, { value: 50000, drill: true }, [['cobalt_bar', 10]], 'mythril_anvil');
  TOOL('palladium_chainsaw', 'Palladium Chainsaw', 'axe', '#e08040', 75, 6, 13, 4, { value: 50000, drill: true }, [['palladium_bar', 12]], 'mythril_anvil');
  TOOL('mythril_chainsaw', 'Mythril Chainsaw', 'axe', '#40b0a0', 85, 5, 18, 4, { value: 60000, drill: true }, [['mythril_bar', 10]], 'mythril_anvil');
  TOOL('orichalcum_chainsaw', 'Orichalcum Chainsaw', 'axe', '#e060a0', 90, 5, 20, 4, { value: 60000, drill: true }, [['orichalcum_bar', 12]], 'mythril_anvil');
  TOOL('adamantite_chainsaw', 'Adamantite Chainsaw', 'axe', '#d03060', 100, 4, 24, 4, { value: 70000, drill: true }, [['adamantite_bar', 12]], 'mythril_anvil');
  TOOL('titanium_chainsaw', 'Titanium Chainsaw', 'axe', '#a0a8b8', 105, 4, 26, 4, { value: 70000, drill: true }, [['titanium_bar', 14]], 'mythril_anvil');
  TOOL('chlorophyte_chainsaw', 'Chlorophyte Chainsaw', 'axe', '#40c040', 115, 4, 45, 7, { value: 100000, drill: true }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  TOOL('butchers_chainsaw', "Butcher's Chainsaw", 'axe', '#a03030', 115, 4, 70, 8, { value: 100000, drill: true, tooltip: '115% axe power. Dropped by Butchers during a Solar Eclipse' });
  TOOL('sawtooth_shark', 'Sawtooth Shark', 'axe', '#6080a0', 70, 6, 12, 3, { value: 30000, drill: true, tooltip: '70% axe power. Fished up in the Ocean' });
  TOOL('war_axe_of_the_night', 'War Axe of the Night', 'axe', '#6a3ad0', 75, 25, 20, 1, { value: 20000 }, [['demonite_bar', 10]], 'anvil');
  TOOL('meteor_hamaxe', 'Meteor Hamaxe', 'hammer', '#8a4a30', 60, 22, 20, 1, { value: 25000, tools: { axe: 100 } }, [['meteorite_bar', 20]], 'anvil');
  TOOL('molten_hamaxe', 'Molten Hamaxe', 'hammer', '#e04a20', 70, 20, 20, 3, { value: 40000, tools: { axe: 150 } }, [['hellstone_bar', 20]], 'anvil');
  TOOL('hamaxe', 'Hamaxe', 'hammer', '#e0c0ff', 60, 20, 20, 4, { value: 50000, tools: { axe: 100 }, tooltip: 'Sold by the Goblin Tinkerer' });
  TOOL('cobalt_waraxe', 'Cobalt Waraxe', 'axe', '#3060c0', 70, 22, 19, 4, { value: 40000 }, [['cobalt_bar', 10]], 'mythril_anvil');
  TOOL('palladium_waraxe', 'Palladium Waraxe', 'axe', '#e08040', 75, 22, 21, 4, { value: 40000 }, [['palladium_bar', 12]], 'mythril_anvil');
  TOOL('mythril_waraxe', 'Mythril Waraxe', 'axe', '#40b0a0', 85, 22, 25, 4, { value: 50000 }, [['mythril_bar', 10]], 'mythril_anvil');
  TOOL('orichalcum_waraxe', 'Orichalcum Waraxe', 'axe', '#e060a0', 90, 22, 27, 4, { value: 50000 }, [['orichalcum_bar', 12]], 'mythril_anvil');
  TOOL('adamantite_waraxe', 'Adamantite Waraxe', 'axe', '#d03060', 100, 21, 30, 4, { value: 60000 }, [['adamantite_bar', 12]], 'mythril_anvil');
  TOOL('titanium_waraxe', 'Titanium Waraxe', 'axe', '#a0a8b8', 105, 21, 32, 4, { value: 60000 }, [['titanium_bar', 14]], 'mythril_anvil');
  TOOL('chlorophyte_greataxe', 'Chlorophyte Greataxe', 'axe', '#40c040', 115, 20, 58, 7, { value: 100000 }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  TOOL('chlorophyte_warhammer', 'Chlorophyte Warhammer', 'hammer', '#40c040', 90, 25, 60, 7, { value: 100000 }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  TOOL('chlorophyte_jackhammer', 'Chlorophyte Jackhammer', 'hammer', '#40c040', 90, 5, 40, 7, { value: 100000, drill: true }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  TOOL('hammush', 'Hammush', 'hammer', '#6aa0d0', 85, 30, 40, 5, { value: 80000, tooltip: '85% hammer power. Sold by the Truffle' });
  TOOL('the_axe', 'The Axe', 'axe', '#40c040', 175, 20, 72, 8, { value: 200000, tools: { hammer: 100 }, tooltip: '175% axe power, 100% hammer power. Dropped by Plantera' });
  TOOL('luminite_hamaxe', 'Luminite Hamaxe', 'hammer', '#40e0c0', 100, 18, 80, 10, { value: 200000, tools: { axe: 150 } }, [['luminite_bar', 12]], 'ancient_manipulator');
  for (const [f, name, col] of [['solar', 'Solar Flare', '#e06030'], ['vortex', 'Vortex', '#30c0a0'], ['nebula', 'Nebula', '#c040c0'], ['stardust', 'Stardust', '#40a0e0']]) TOOL(`${f}_hamaxe`, `${name} Hamaxe`, 'hammer', col, 100, 17, 80, 10, { value: 200000, tools: { axe: 150 } }, [['luminite_bar', 12], [`${f}_fragment`, 12]], 'ancient_manipulator');
  TOOL('pwnhammer', 'Pwnhammer', 'hammer', '#e0c0ff', 80, 30, 26, 4, { value: 50000, tooltip: '80% hammer power: strong enough to destroy Demon Altars' });
  TOOL('rockfish', 'Rockfish', 'hammer', '#6080a0', 60, 20, 20, 2, { value: 20000, tooltip: '60% hammer power. Fished up underground' });
  TOOL('breaker', 'The Breaker', 'hammer', '#6a3ad0', 55, 30, 24, 1, { value: 20000 }, [['demonite_bar', 10]], 'anvil');
  TOOL('flesh_grinder', 'Flesh Grinder', 'hammer', '#c02030', 60, 30, 20, 1, { value: 20000 }, [['crimtane_bar', 10]], 'anvil');
  // sickle: cuts grass into hay
  TOOL('sickle', 'Sickle', 'axe', '#c0c0c8', 0, 20, 6, 0, { value: 2000, tooltip: 'Harvests hay from tall grass', sickle: true }, [['iron_bar', 10], ['wood', 5]], 'anvil'); R('sickle', 1, 'anvil', [['lead_bar', 10], ['wood', 5]]);
  ModLib.on('tileBroken', (g, tx, ty, id) => { if (id === T.PLANT && g.player.selectedItem && g.player.selectedItem.id === 'sickle') g.dropItem(tx * TILE + 8, ty * TILE + 8, 'hay', randInt(1, 3)); });

  // ---- utility items ------------------------------------------------------------------------------------------
  const U = (id, name, props, value, recipe, station) => { VAN.item(id, name, Object.assign({ max: 1, rarity: 1 }, props), value); delete ITEMS[id].mod; if (recipe) R(id, 1, station === undefined ? 'workbench' : station, recipe); };
  U('ice_mirror', 'Ice Mirror', { tooltip: 'Looking into it teleports you home', onUse: (g, s) => ITEMS.magic_mirror.onUse ? ITEMS.magic_mirror.onUse(g, s) : g.message('Home!', '#80c0ff'), drawIcon: VAN.icon('lens', '#a0e0ff', '#60a0ff'), rarity: 3 }, 50000);
  U('cell_phone', 'Cell Phone', { tooltip: 'Shows everything (time, weather, depth, fishing power, enemies, treasure...) and teleports you home', onUse: (g, s) => ITEMS.magic_mirror.onUse && ITEMS.magic_mirror.onUse(g, s), drawIcon: VAN.icon('tablet', '#404048', '#60e0ff'), rarity: 7, info: ['depth', 'compass', 'clock', 'weather', 'fish', 'lifeform', 'metal', 'dps', 'stopwatch', 'sextant', 'tally'] }, 500000, [['magic_mirror', 1], ['pda', 1]], 'tinkerers_workshop');
  U('pda', 'PDA', { tooltip: 'Shows everything: depth, position, time, weather, fishing power, rare creatures, DPS, kills, moon phase...', drawIcon: VAN.icon('tablet', '#404048', '#a0e0a0'), rarity: 6, info: ['depth', 'compass', 'clock', 'weather', 'fish', 'lifeform', 'metal', 'dps', 'stopwatch', 'sextant', 'tally'] }, 200000, [['gps', 1], ['rem', 1], ['goblin_tech', 1], ['fish_finder', 1]], 'tinkerers_workshop');
  U('umbrella', 'Umbrella', { tooltip: 'You will fall slower while holding it', armor: null, featherHold: true, drawIcon: VAN.icon('shield', '#e04040'), rarity: 0 }, 2000);
  U('bug_net', 'Bug Net', { tooltip: 'Catches critters', bugNet: true, drawIcon: VAN.icon('hook', '#40c040'), rarity: 0 }, 2500);
  U('golden_bug_net', 'Golden Bug Net', { tooltip: 'Catches critters, faster', bugNet: true, drawIcon: VAN.icon('hook', '#ffd040'), rarity: 3 }, 50000);
  U('lavaproof_bug_net', 'Lavaproof Bug Net', { tooltip: 'Catches critters, even in lava', bugNet: true, drawIcon: VAN.icon('hook', '#e06020'), rarity: 3 }, 60000, [['bug_net', 1], ['hellstone_bar', 15]], 'anvil');
  U('wrench', 'Wrench', { tooltip: 'Places red wire', drawIcon: VAN.icon('cog', '#e04040'), rarity: 1 }, 20000);
  U('wire_cutter', 'Wire Cutter', { tooltip: 'Removes wire', drawIcon: VAN.icon('cog', '#606068'), rarity: 1 }, 20000);
  U('grand_design', 'The Grand Design', { tooltip: 'Wiring made easy. Sold by the Mechanic', drawIcon: VAN.icon('tablet', '#e0c040', '#e04040'), rarity: 2 }, 100000);
  U('staff_of_regrowth', 'Staff of Regrowth', { tooltip: 'Grows grass and moss, harvests herbs better', tool: 'axe', power: 0, damage: 6, useTime: 20, drawIcon: VAN.icon('wand', '#40c040'), rarity: 1 }, 20000, [['rich_mahogany', 8], ['jungle_spores', 3]], 'anvil');
  U('gravediggers_shovel', "Gravedigger's Shovel", { tooltip: 'Digs dirt, sand, mud and snow quickly', tool: 'pick', power: 35, useTime: 8, damage: 9, softOnly: true, drawIcon: VAN.icon('wand', '#a0a0a8'), rarity: 1 }, 5000, [['iron_bar', 8], ['wood', 6]], 'anvil');
  U('acorn_slingshot', 'Acorn Slingshot', { tooltip: 'Fires acorns (uses acorns as ammo)', damage: 6, useTime: 30, wclass: 'gun', ammoKind: 'acorn', speed: 10, use: (g, s, i) => Weapons.use(g, s, i), drawIcon: VAN.icon('hook', '#a8794b'), rarity: 0 }, 1000); ITEMS.acorn.ammo = 'acorn'; ITEMS.acorn.damage = 0;
  U('encumbering_stone', 'Encumbering Stone', { tooltip: 'Prevents item pickup while in the inventory', drawIcon: VAN.icon('orb', '#606068'), rarity: 1 }, 10000);
  U('guide_to_critter_companionship', 'Guide to Critter Companionship', { tooltip: 'Your attacks will not hurt critters', drawIcon: VAN.icon('book', '#40a040'), rarity: 1 }, 10000);
  U('gps', 'GPS', { tooltip: 'Shows position, depth and time', info: ['depth', 'compass', 'clock'], drawIcon: VAN.icon('tablet', '#404048', '#60e0ff'), rarity: 3 }, 50000, [['depth_meter', 1], ['compass', 1], ['gold_watch', 1]], 'tinkerers_workshop');
  U('rem', 'R.E.K. 3000', { tooltip: 'Shows enemy count, kills and rare creatures', info: ['radar', 'tally', 'lifeform'], drawIcon: VAN.icon('tablet', '#404048', '#e0a040'), rarity: 3 }, 50000, [['radar', 1], ['tally_counter', 1], ['lifeform_analyzer', 1]], 'tinkerers_workshop');
  U('goblin_tech', 'Goblin Tech', { tooltip: 'Shows movement speed, DPS and nearby ores', info: ['stopwatch', 'dps', 'metal'], drawIcon: VAN.icon('tablet', '#404048', '#a0e060'), rarity: 3 }, 50000, [['stopwatch', 1], ['dps_meter', 1], ['metal_detector', 1]], 'tinkerers_workshop');
  U('fish_finder', 'Fish Finder', { tooltip: 'Shows fishing power, weather and moon phase', info: ['fish', 'weather', 'sextant'], drawIcon: VAN.icon('tablet', '#404048', '#60a0ff'), rarity: 3 }, 50000, [['fishermans_pocket_guide', 1], ['weather_radio', 1], ['sextant', 1]], 'tinkerers_workshop');
  for (const [id, name, tip, col] of [['depth_meter', 'Depth Meter', 'Shows your depth', '#c0c0c8'], ['compass', 'Compass', 'Shows your horizontal position', '#e0c040'], ['gold_watch', 'Gold Watch', 'Tells the time', '#ffd040'], ['copper_watch', 'Copper Watch', 'Tells the time (roughly)', '#c87533'], ['silver_watch', 'Silver Watch', 'Tells the time', '#cfd6e6'], ['radar', 'Radar', 'Shows the number of nearby enemies', '#40e040'], ['tally_counter', 'Tally Counter', 'Counts kills', '#e0e0e0'], ['lifeform_analyzer', 'Lifeform Analyzer', 'Shows rare creatures nearby', '#a0e0a0'], ['stopwatch', 'Stopwatch', 'Shows your speed', '#e0e0e0'], ['dps_meter', 'DPS Meter', 'Shows your damage per second', '#e04040'], ['metal_detector', 'Metal Detector', 'Shows the most valuable ore nearby', '#e0a040'], ['fishermans_pocket_guide', "Fisherman's Pocket Guide", 'Shows your fishing power', '#60a0ff'], ['weather_radio', 'Weather Radio', 'Shows the weather', '#a0a0ff'], ['sextant', 'Sextant', 'Shows the moon phase', '#ffd040']]) if (!ITEMS[id]) { ACC(id, name, { rarity: 1, value: 10000, tooltip: tip, info: [id.replace(/_.*/, '')] }, VAN.icon('tablet', '#404048', col)); }
  R('gold_watch', 1, 'table', [['gold_bar', 10], ['chain', 1]]); R('copper_watch', 1, 'table', [['copper_bar', 10], ['chain', 1]]); R('silver_watch', 1, 'table', [['silver_bar', 10], ['chain', 1]]);
  U('rope_coil', 'Rope Coil', { max: 999, tooltip: 'Throw it to place a rope down', consumable: true, drawIcon: VAN.icon('wire', '#c0a060'), rarity: 0 }, 10, [['rope', 10]], null);
  U('magic_conch', 'Magic Conch', { tooltip: 'Teleports you to the ocean', onUse: (g, s) => { const p = g.player, w = g.world; const x = p.tileX < w.w / 2 ? 60 : w.w - 60; let y = 0; while (y < w.h - 1 && !w.isSolidAt(x, y)) y++; p.x = x * TILE; p.y = (y - 3) * TILE; p.vx = p.vy = 0; FX.burst(g, p.cx, p.cy, 14, '#60c0ff', 3, 30); Audio_.play('menu'); }, drawIcon: VAN.icon('shell', '#e0a0c0'), rarity: 3 }, 50000);
  U('demon_conch', 'Demon Conch', { tooltip: 'Teleports you to the Underworld', onUse: (g, s) => { const p = g.player, w = g.world; const x = clamp(p.tileX, 40, w.w - 40); let y = w.h - 80; while (y < w.h - 5 && w.isSolidAt(x, y)) y++; while (y < w.h - 5 && !w.isSolidAt(x, y + 1)) y++; p.x = x * TILE; p.y = (y - 3) * TILE; p.vx = p.vy = 0; FX.burst(g, p.cx, p.cy, 14, '#ff6020', 3, 30); Audio_.play('menu'); }, drawIcon: VAN.icon('shell', '#c04040'), rarity: 3 }, 50000);
  U('shellphone', 'Shellphone', { tooltip: 'Cell Phone that also reaches the Ocean, the Underworld and spawn', onUse: (g, s) => ITEMS.magic_mirror.onUse && ITEMS.magic_mirror.onUse(g, s), drawIcon: VAN.icon('tablet', '#e0a0c0', '#60e0ff'), rarity: 8 }, 600000, [['cell_phone', 1], ['magic_conch', 1], ['demon_conch', 1]], 'tinkerers_workshop');
  // keys
  for (const [id, name, col, tip] of [['shadow_key', 'Shadow Key', '#4a3a6a', 'Opens Shadow Chests in the Underworld. Found in the Dungeon'], ['temple_key', 'Temple Key', '#c8a050', 'Opens the Jungle Temple door'], ['jungle_key', 'Jungle Key', '#40a040', 'Opens the Jungle Chest in the Dungeon (Piranha Gun)'], ['corruption_key', 'Corruption Key', '#8060c0', 'Opens the Corruption Chest (Scourge of the Corruptor)'], ['crimson_key', 'Crimson Key', '#c04040', 'Opens the Crimson Chest (Vampire Knives)'], ['hallowed_key', 'Hallowed Key', '#e0c0ff', 'Opens the Hallowed Chest (Rainbow Gun)'], ['frozen_key', 'Frozen Key', '#a0e0ff', 'Opens the Frozen Chest (Staff of the Frost Hydra)'], ['desert_key', 'Desert Key', '#e0c080', 'Opens the Desert Chest (Desert Tiger Staff)'], ['golden_key', 'Golden Key', '#ffd040', 'Opens Locked Gold Chests in the Dungeon']]) if (!ITEMS[id]) VAN.item(id, name, { max: 99, rarity: 2, tooltip: tip, drawIcon: VAN.icon('key', col) }, 0);
  for (const [id, mat] of [['jungle_key', 'jungle_key_mold'], ['corruption_key', 'corruption_key_mold'], ['crimson_key', 'crimson_key_mold'], ['hallowed_key', 'hallowed_key_mold'], ['frozen_key', 'frozen_key_mold'], ['desert_key', 'desert_key_mold']]) { VAN.item(mat, ITEMS[id].name + ' Mold', { max: 99, rarity: 2, material: true, tooltip: 'A rare Hardmode drop from its biome', drawIcon: VAN.icon('key', '#606068') }, 0); R(id, 1, 'mythril_anvil', [[mat, 1], ['temple_key', 0]].filter(x => x[1])); RECIPES.filter(r => r.result === id).forEach(r => { r.ing = [[mat, 1], ['soul_of_light', 5], ['soul_of_night', 5], ['soul_of_might', 5], ['soul_of_fright', 5], ['soul_of_sight', 5]]; }); }
}
