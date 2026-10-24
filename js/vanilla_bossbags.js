// ---------------------------------------------------------------------------
// Treasure Bags: in Expert / Master mode every boss drops its Treasure Bag
// instead of loose loot; opening the bag (use it from the inventory) gives
// the boss's drops, its Expert-exclusive item, coins and (Master) a relic-
// style trophy chance. Every vanilla boss has a bag, including the event
// bosses that only drop bags in Expert.
// Also: the weather the spawn pools use (rain, wind) with its own visuals.
// ---------------------------------------------------------------------------
'use strict';

{
  // ---- bag definitions ------------------------------------------------------------------------------------------------
  const BAGS = {
    king_slime: { name: 'King Slime', color: '#4080e0', expert: 'royal_gel', loot: [['gel', 20, 40], ['gold_bar', 5, 10], ['lesser_healing', 5, 10]], oneOf: ['slimy_saddle', 'slime_hook', 'ninja_hood', 'ninja_shirt', 'ninja_pants', 'solidifier'] },
    eye_of_cthulhu: { name: 'Eye of Cthulhu', color: '#c03030', expert: 'shield_of_cthulhu', loot: [['demonite_ore', 30, 60], ['unholy_arrow', 20, 50], ['lesser_healing', 5, 10]], oneOf: ['binoculars', 'grinning_eye'] },
    eater_of_worlds: { name: 'Eater of Worlds', color: '#7050a0', expert: 'worm_scarf', loot: [['shadow_scale', 20, 30], ['demonite_ore', 30, 60], ['lesser_healing', 5, 10]], oneOf: ['eaters_bone'] },
    brain_of_cthulhu: { name: 'Brain of Cthulhu', color: '#c03040', expert: 'brain_of_confusion', loot: [['tissue_sample', 15, 25], ['crimtane_ore', 30, 60], ['lesser_healing', 5, 10]], oneOf: ['bone_rattle'] },
    queen_bee: { name: 'Queen Bee', color: '#e0c040', expert: 'hive_pack', loot: [['bee_wax', 16, 26], ['beenade', 10, 30], ['lesser_healing', 5, 10]], oneOf: ['bee_keeper', 'bees_knees', 'bee_gun', 'hive_wand', 'honey_comb', 'nectar', 'honeyed_goggles'] },
    deerclops: { name: 'Deerclops', color: '#3a3040', expert: 'bone_helm', loot: [['lesser_healing', 5, 10]], oneOf: ['lucy_the_axe', 'pew_matic_horn', 'weather_pain', 'houndius_shootius', 'chester'] },
    skeletron: { name: 'Skeletron', color: '#e8e8e0', expert: 'bone_glove', loot: [['bone', 20, 40], ['lesser_healing', 5, 15]], oneOf: ['skeletron_hand', 'book_of_skulls', 'bone_key', 'chippys_couch'] },
    wall_of_flesh: { name: 'Wall of Flesh', color: '#d04050', expert: 'demon_heart', loot: [['pwnhammer', 1, 1], ['healing_potion', 5, 15]], oneOf: ['breaker_blade', 'clockwork_assault_rifle', 'laser_rifle', 'firecracker', 'warrior_emblem', 'ranger_emblem', 'sorcerer_emblem', 'summoner_emblem'] },
    queen_slime: { name: 'Queen Slime', color: '#e680ff', expert: 'volatile_gelatin', loot: [['hallowed_bar', 15, 30], ['healing_potion', 5, 15]], oneOf: ['smolstar', 'crystal_ninja_helmet', 'crystal_assassin_hood', 'crystal_assassin_shirt', 'crystal_assassin_pants', 'hook_of_dissonance', 'gelatinous_pillion', 'blade_staff'] },
    the_twins: { name: 'The Twins', color: '#c03030', expert: 'mechanical_wheel_piece', loot: [['soul_of_sight', 25, 40], ['hallowed_bar', 15, 30], ['healing_potion', 5, 15]], oneOf: ['twins_trophy'] },
    the_destroyer: { name: 'The Destroyer', color: '#404048', expert: 'mechanical_wagon_piece', loot: [['soul_of_might', 25, 40], ['hallowed_bar', 15, 30], ['healing_potion', 5, 15]], oneOf: ['destroyer_trophy'] },
    skeletron_prime: { name: 'Skeletron Prime', color: '#606068', expert: 'mechanical_battery_piece', loot: [['soul_of_fright', 25, 40], ['hallowed_bar', 15, 30], ['healing_potion', 5, 15]], oneOf: ['prime_trophy'] },
    plantera: { name: 'Plantera', color: '#ff40a0', expert: 'spore_sac', loot: [['temple_key', 1, 1], ['healing_potion', 5, 15]], oneOf: ['grenade_launcher', 'venus_magnum', 'leaf_blower', 'nettle_burst', 'seedler', 'flower_pow', 'pygmy_staff', 'the_axe', 'thorn_hook'] },
    golem: { name: 'Golem', color: '#8a5030', expert: 'shiny_stone', loot: [['beetle_husk', 18, 23], ['healing_potion', 5, 15]], oneOf: ['stynger', 'possessed_hatchet', 'sun_stone', 'eye_of_the_golem', 'picksaw', 'heat_ray', 'staff_of_earth', 'golem_fist'] },
    duke_fishron: { name: 'Duke Fishron', color: '#4a8a70', expert: 'shrimpy_truffle', loot: [['healing_potion', 5, 15]], oneOf: ['flairon', 'tsunami', 'razorblade_typhoon', 'tempest_staff', 'bubble_gun', 'fishron_wings'] },
    empress_of_light: { name: 'Empress of Light', color: '#ffb0ff', expert: 'soaring_insignia', loot: [['healing_potion', 5, 15]], oneOf: ['terraprisma', 'starlight', 'eventide', 'nightglow', 'kaleidoscope', 'stellar_tune', 'empress_wings', 'rainbow_cursor'] },
    lunatic_cultist: { name: 'Lunatic Cultist', color: '#8060ff', expert: null, loot: [['ancient_manipulator', 1, 1], ['healing_potion', 5, 15]], oneOf: ['cultist_trophy'] },
    moon_lord: { name: 'Moon Lord', color: '#40e0c0', expert: 'gravity_globe', loot: [['luminite_bar', 70, 90], ['super_healing_potion', 5, 15]], oneOf: ['meowmere', 'terrarian', 'star_wrath', 'sdmg', 'last_prism', 'lunar_flare', 'rainbow_crystal_staff', 'lunar_portal_staff', 'celebration', 'portal_gun'], extra: ['suspicious_looking_tentacle', 'celestial_starboard'] },
    dark_mage: { name: 'Dark Mage', color: '#8020c0', expert: null, loot: [['defender_medal', 5, 10]], oneOf: ['dark_mages_tome', 'war_table', 'dragon_egg'] },
    ogre: { name: 'Ogre', color: '#80a050', expert: null, loot: [['defender_medal', 10, 20]], oneOf: ['sleepy_octopod', 'ghastly_glaive', 'brand_of_the_inferno', 'tome_of_infinite_wisdom', 'monk_belt', 'apprentice_scarf', 'huntress_buckler', 'squire_shield'] },
    betsy: { name: 'Betsy', color: '#e06030', expert: null, loot: [['defender_medal', 30, 50]], oneOf: ['betsys_wrath', 'sky_dragons_fury', 'aerial_bane', 'flying_dragon', 'betsy_wings'] },
    flying_dutchman: { name: 'Flying Dutchman', color: '#6a4a2a', expert: null, loot: [['gold_bar', 5, 10]], oneOf: ['cutlass', 'coin_gun', 'lucky_coin', 'discount_card', 'gold_ring', 'pirate_staff', 'cosmic_car_key'] },
    mourning_wood: { name: 'Mourning Wood', color: '#4a2a10', expert: null, loot: [['spooky_wood', 50, 100]], oneOf: ['spooky_hook', 'spooky_twig', 'necromantic_scroll', 'stake_launcher', 'cursed_sapling'] },
    pumpking: { name: 'Pumpking', color: '#e08020', expert: null, loot: [['spooky_wood', 50, 100]], oneOf: ['the_horsemans_blade', 'bat_scepter', 'candy_corn_rifle', 'jack_o_lantern_launcher', 'black_fairy_dust', 'spider_egg', 'dark_harvest', 'raven_staff'] },
    everscream: { name: 'Everscream', color: '#2a6a2a', expert: null, loot: [['candy_cane_block', 20, 40]], oneOf: ['christmas_tree_sword', 'razorpine', 'festive_wings', 'christmas_hook'] },
    santa_nk1: { name: 'Santa-NK1', color: '#c02020', expert: null, loot: [['candy_cane_block', 20, 40]], oneOf: ['elf_melter', 'chain_gun', 'toy_sled', 'christmas_hook'] },
    ice_queen: { name: 'Ice Queen', color: '#a0e0ff', expert: null, loot: [['candy_cane_block', 20, 40]], oneOf: ['blizzard_staff', 'north_pole', 'snowman_cannon', 'reindeer_bells', 'frozen_crown', 'ice_queen_trophy'] },
    martian_saucer: { name: 'Martian Saucer', color: '#a0a0b0', expert: null, loot: [['martian_conduit', 10, 20]], oneOf: ['xenopopper', 'xeno_staff', 'laser_machinegun', 'electrosphere_launcher', 'influx_waver', 'charged_blaster_cannon', 'cosmic_car_key', 'anti_gravity_hook', 'laser_drill'] },
    mechdusa: { name: 'Mechdusa', color: '#606068', expert: 'mechanical_wheel_piece', loot: [['soul_of_sight', 25, 40], ['soul_of_might', 25, 40], ['soul_of_fright', 25, 40], ['hallowed_bar', 30, 60]], oneOf: ['destroyer_trophy'] },
  };
  VAN.item('rainbow_cursor', 'Rainbow Cursor', { max: 1, rarity: 9, tooltip: 'A cursor in every colour', drawIcon: VAN.icon('star', '#ff80ff') }, 100000);
  VAN.item('chippys_couch', "Chippy's Couch", { tile: null, max: 1, rarity: 5, tooltip: 'A very comfortable couch', drawIcon: VAN.icon('box', '#c04040') }, 100000);
  VAN.item('slime_hook', 'Slime Hook', { accessory: true, slot: 'hook', hookRange: 24, hookSpeed: 14, max: 1, rarity: 2, tooltip: 'A three-pronged slimy hook. Dropped by King Slime', drawIcon: VAN.icon('hook', '#4080e0') }, 30000);
  VAN.item('thorn_hook', 'Thorn Hook', { accessory: true, slot: 'hook', hookRange: 30, hookSpeed: 16, max: 1, rarity: 7, tooltip: 'A thorny hook. Dropped by Plantera', drawIcon: VAN.icon('hook', '#40c040') }, 100000);
  VAN.item('illuminant_hook', 'Illuminant Hook', { accessory: true, slot: 'hook', hookRange: 28, hookSpeed: 16, max: 1, rarity: 5, tooltip: 'Glows. Dropped by Hallowed Mimics', drawIcon: VAN.icon('hook', '#e0c0ff') }, 60000);
  VAN.item('worm_hook', 'Worm Hook', { accessory: true, slot: 'hook', hookRange: 28, hookSpeed: 16, max: 1, rarity: 5, tooltip: 'Dropped by Corrupt Mimics', drawIcon: VAN.icon('hook', '#6a4a90') }, 60000);
  VAN.item('tendon_hook', 'Tendon Hook', { accessory: true, slot: 'hook', hookRange: 28, hookSpeed: 16, max: 1, rarity: 5, tooltip: 'Dropped by Crimson Mimics', drawIcon: VAN.icon('hook', '#a03040') }, 60000);
  for (const id of ['slime_hook', 'thorn_hook', 'illuminant_hook', 'worm_hook', 'tendon_hook']) if (typeof HOOK_DEFS !== 'undefined') HOOK_DEFS[id] = ITEMS[id];
  const bagId = (boss) => `treasure_bag_${boss}`;
  for (const boss in BAGS) {
    const b = BAGS[boss];
    VAN.item(bagId(boss), `Treasure Bag (${b.name})`, { max: 99, consumable: true, rarity: 9, bossBag: boss, tooltip: `${b.name}'s Treasure Bag. Right click / use to open: the boss loot${b.expert ? ', its Expert item' : ''} and coins`, drawIcon: VAN.icon('bag', b.color, '#ffe060') }, 0);
    ITEMS[bagId(boss)].onUse = (g, slot) => {
      const p = g.player; g.consumeSlot(slot); Audio_.play('menu'); FX.burst(g, p.cx, p.cy, 20, b.color, 4, 30);
      const give = (id, n) => { if (!ITEMS[id]) return; const left = p.addItem(id, n); if (left > 0) g.dropItem(p.cx, p.cy, id, left); g.addDamageText(p.cx + rand(-20, 20), p.y - 10 - rand(0, 20), `+${n} ${ITEMS[id].name}`, '#ffe75a'); };
      for (const [id, lo, hi] of b.loot) give(id, randInt(lo, hi));
      if (b.oneOf && b.oneOf.length) { const pool = b.oneOf.filter(i => ITEMS[i]); if (pool.length) give(choose(pool), 1); }
      if (b.expert && ITEMS[b.expert]) give(b.expert, 1);
      if (b.extra) for (const id of b.extra) if (ITEMS[id] && Math.random() < 0.5) give(id, 1);
      if (Math.random() < 0.05 && typeof PETS !== 'undefined') { const pool = Object.keys(PETS); give(choose(pool), 1); }
      g.dropCoins(p.cx, p.cy, (BOSS_DEFS[boss] && BOSS_DEFS[boss].coins || 30000) * 1.5);
      if (g.master && BOSSES.find(x => x.id === boss) && BOSSES.find(x => x.id === boss).collectibles) { const c = BOSSES.find(x => x.id === boss).collectibles; if (c[0]) give(c[0], 1); }
    };
  }
  VAN.bagFor = (type) => BAGS[type] ? bagId(type) : null;
  // ---- Expert bosses drop the bag instead of loose loot ---------------------------------------------------------------
  ModLib.patch(() => {
    // any boss class: in Expert its loose loot (everything but trophies / masks / the mastery shard) is swallowed and the bag drops instead
    const wrap = (cls) => { if (!cls || !cls.prototype.die) return; const orig = cls.prototype.die; cls.prototype.die = function (game) {
      const bag = this.isBoss !== false && VAN.bagFor(this.type); if (!game.expert || !bag) return orig.call(this, game);
      const dropItem = game.dropItem, dropCoins = game.dropCoins;
      game.dropItem = function (x, y, id, n, ...rest) { if (/trophy|mask/.test(id) || id === 'mastery_shard') return dropItem.call(this, x, y, id, n, ...rest); };
      game.dropCoins = function () {};
      try { orig.call(this, game); } finally { game.dropItem = dropItem; game.dropCoins = dropCoins; }
      game.dropItem(this.cx, this.cy, bag, 1, null, null); game.message(`${this.name || BAGS[this.type].name} dropped a Treasure Bag!`, '#ffe75a');
    }; };
    for (const cls of [typeof BossBase !== 'undefined' ? BossBase : null, typeof Worm !== 'undefined' ? Worm : null, typeof EyeOfCthulhu !== 'undefined' ? EyeOfCthulhu : null, typeof KingSlime !== 'undefined' ? KingSlime : null]) wrap(cls);
  });

  // ---- weather: rain and wind ------------------------------------------------------------------------------------------
  ModLib.on('tick', (g) => {
    const w = g.world; if (!w || w.isSub) return;
    if (w.rainT == null) { w.rainT = 0; w.raining = false; w.windy = false; w.windT = 0; }
    if (w.raining) { if (--w.rainT <= 0) { w.raining = false; g.message('The rain has stopped.', '#a0c0ff'); } }
    else if (w.time % 60 === 0 && Math.random() < 1 / 900) { w.raining = true; w.rainT = 60 * 60 * randInt(8, 20); g.message('It is starting to rain.', '#a0c0ff'); }
    if (w.windy) { if (--w.windT <= 0) w.windy = false; }
    else if (w.time % 60 === 0 && Math.random() < 1 / 1200) { w.windy = true; w.windT = 60 * 60 * randInt(5, 15); g.message('The wind is picking up.', '#c0e0c0'); }
    if (w.raining && g.player.tileY < w.surfaceLine + 4) { const cam = g.cam, R = g.renderer; for (let k = 0; k < 4; k++) g.particles.push(new Particle(cam.x + rand(0, R.vw), cam.y - 10, -1.5, 9, 'rgba(160,200,255,0.7)', 30, 2)); }
  });
  ModLib.on('drawHud', (g) => { const w = g.world, ctx = g.renderer.ctx; if (w && w.raining && g.player.tileY < w.surfaceLine + 4) { ctx.fillStyle = 'rgba(40,50,80,0.18)'; ctx.fillRect(0, 0, g.renderer.W, g.renderer.H); } });
  ModLib.patch(() => { WORLD_SAVE_KEYS.push('raining', 'rainT', 'windy', 'windT'); });
}
