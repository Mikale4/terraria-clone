// ---------------------------------------------------------------------------
// Vanilla weapons: every Terraria 1.4.4 weapon that the base catalog did not
// cover - shortswords and broadswords, yoyos, spears, flails, boomerangs, bows,
// repeaters, guns, launchers, dart / flame / sand / snow / star / nail /
// coin guns, wands, spell tomes, magic guns, minion staffs, sentry staffs and
// whips - each crafted at its official station (Iron/Lead Anvil, Mythril
// Anvil, Work Bench, Demon Altar, Bookcase, Ancient Manipulator) or dropped.
// ---------------------------------------------------------------------------
'use strict';

{
  const R = (result, count, station, ing) => VAN.recipe(result, count, station, ing);
  const CLASS_NAME = { bow: 'ranged', gun: 'ranged', launcher: 'ranged', magic: 'magic', summon: 'summon', whip: 'summon', sword: 'melee', shortsword: 'melee', yoyo: 'melee', flail: 'melee', spear: 'melee', boomerang: 'melee' };
  // WPN(id, name, class, damage, useTime, knockback, rarity, value, extra, recipe, station)
  const WPN = (id, name, cls, dmg, use, kb, rarity, value, extra = {}, recipe, station) => {
    const col = extra.color || (extra.minion && extra.minion.color) || (extra.swingProj && extra.swingProj.color) || '#c0c0c8';
    const props = Object.assign({ name, max: 1, damage: dmg, useTime: use, knockback: kb, rarity, wclass: cls === 'shortsword' ? undefined : cls, tooltip: `${dmg} ${CLASS_NAME[cls] || 'melee'} damage${extra.manaCost ? `. Uses ${extra.manaCost} mana` : ''}${extra.desc ? '. ' + extra.desc : ''}` }, extra);
    delete props.desc; delete props.color;
    if (cls === 'sword' || cls === 'shortsword') { props.sword = cls === 'shortsword' ? 'short' : 'broad'; props.icon = { kind: cls === 'shortsword' ? 'shortsword' : 'sword', mat: VAN.palette(id, col) }; props.color = col; }
    else { props.use = (g, s, i) => Weapons.use(g, s, i); props.color = col; if (!(ITEMS[id] && ITEMS[id].drawIcon)) props.drawIcon = genericIcon(col, extra.hi || '#fff', cls === 'gun' || cls === 'launcher' ? 'gun' : cls === 'bow' ? 'bow' : cls === 'yoyo' ? 'yoyo' : cls === 'flail' ? 'flail' : cls === 'spear' || cls === 'whip' ? 'spear' : cls === 'summon' || cls === 'magic' ? (extra.minion || /staff|rod|scepter|cane/.test(id) ? 'staff' : 'book') : 'box'); }
    if (cls === 'bow' || cls === 'gun' || cls === 'launcher') props.ammoKind = props.ammoKind || (cls === 'bow' ? 'arrow' : cls === 'gun' ? 'bullet' : 'rocket');
    if (cls === 'magic') props.magic = false;
    const it = CAT(id, props, value); delete it.mod;
    if (recipe) R(id, 1, station === undefined ? 'anvil' : station, recipe);
    return it;
  };
  const ALT = (id, count, station, alts, rest = []) => VAN.recipeAlt(id, count, station, alts, rest);
  const IRON = [['iron_bar', 1], ['lead_bar', 1]];
  const ironOr = (n) => [[['iron_bar', n]], [['lead_bar', n]]];

  // ---- shortswords & broadswords --------------------------------------------------------------------------
  for (const [ore, name, col, sd, su, bd, bu, cost] of [['copper', 'Copper', '#c87533', 5, 13, 8, 21, 7], ['tin', 'Tin', '#c8b070', 6, 12, 9, 21, 7], ['iron', 'Iron', '#a2a4b4', 7, 12, 10, 21, 8], ['lead', 'Lead', '#7a88a8', 8, 11, 11, 21, 8], ['silver', 'Silver', '#cfd6e6', 8, 11, 11, 20, 8], ['tungsten', 'Tungsten', '#70b090', 9, 11, 12, 20, 8], ['gold', 'Gold', '#e8b830', 11, 11, 13, 20, 8], ['platinum', 'Platinum', '#c8d8f0', 13, 11, 15, 19, 8]]) {
    WPN(`${ore}_shortsword`, `${name} Shortsword`, 'shortsword', sd, su, 3, ore === 'gold' || ore === 'platinum' ? 1 : 0, 100 * (cost + 1), { color: col }, [[`${ore}_bar`, cost - 1]], 'anvil');
    const bid = ITEMS[`${ore}_broadsword`] ? `${ore}_broadsword` : ITEMS[`${ore}_sword`] ? `${ore}_sword` : `${ore}_broadsword`;
    WPN(bid, `${name} Broadsword`, 'sword', bd, bu, 5, ore === 'gold' || ore === 'platinum' ? 1 : 0, 100 * (cost + 3), { color: col }, [[`${ore}_bar`, cost]], 'anvil');
  }
  for (const [wood, name, col] of [['boreal_wood', 'Boreal Wood', '#a09080'], ['palm_wood', 'Palm Wood', '#d0a060'], ['rich_mahogany', 'Rich Mahogany', '#b04040'], ['ebonwood', 'Ebonwood', '#5a3a7a'], ['shadewood', 'Shadewood', '#7a2a3a'], ['pearlwood', 'Pearlwood', '#e0c0e0'], ['ash_wood', 'Ash Wood', '#606068']]) {
    WPN(`${wood}_sword`, `${name} Sword`, 'sword', wood === 'pearlwood' ? 11 : wood === 'ash_wood' ? 9 : 7, 20, 4, 0, 200, { color: col }, [[wood, 7]], 'workbench');
    WPN(`${wood}_bow`, `${name} Bow`, 'bow', wood === 'pearlwood' ? 9 : wood === 'ash_wood' ? 8 : 4, 28, 1, 0, 200, { color: col, speed: 9 }, [[wood, 10]], 'workbench');
    WPN(`${wood}_hammer`, `${name} Hammer`, 'sword', 2, 26, 5, 0, 200, { color: col, tool: 'hammer', power: wood === 'pearlwood' ? 35 : 25, tooltip: `${wood === 'pearlwood' ? 35 : 25}% hammer power` }, [[wood, 8]], 'workbench'); ITEMS[`${wood}_hammer`].sword = null; ITEMS[`${wood}_hammer`].icon = { kind: 'hammer', mat: VAN.palette(wood, col) };
  }
  WPN('cactus_sword', 'Cactus Sword', 'sword', 9, 20, 4, 0, 400, { color: '#3f9e3f' }, [['cactus', 10]], 'workbench');
  WPN('ruler', 'Ruler', 'shortsword', 2, 15, 1, 0, 100, { color: '#e0c060', desc: 'Shows a grid while held' });
  WPN('zombie_arm', 'Zombie Arm', 'sword', 9, 20, 5, 1, 1000, { color: '#8ab070', desc: 'Rarely dropped by Zombies' });
  WPN('bladed_glove', 'Bladed Glove', 'shortsword', 12, 8, 2, 1, 2000, { color: '#c0c0c8', desc: 'Halloween: from Goodie Bags' });
  WPN('flymeal', 'Flymeal', 'sword', 12, 20, 4, 1, 2000, { color: '#a0a060', desc: 'From Oyster loot' });
  WPN('mandible_blade', 'Mandible Blade', 'sword', 12, 22, 5, 1, 2000, { color: '#c8a860', desc: 'Dropped by Antlions' });
  WPN('stylish_scissors', 'Stylish Scissors', 'shortsword', 13, 10, 3, 1, 2000, { color: '#e080c0', desc: 'Dropped by the Stylist... here: Skeletons' });
  WPN('breathing_reed', 'Breathing Reed', 'sword', 8, 20, 4, 0, 1000, { color: '#60c060', desc: 'Breathe underwater while holding it. Found in Water Chests' });
  WPN('bone_sword', 'Bone Sword', 'sword', 16, 19, 5, 1, 2000, { color: '#e8e8e0', desc: 'Dropped by Skeletons' });
  WPN('bat_bat', 'Bat Bat', 'sword', 14, 22, 5, 1, 2000, { color: '#4a3a5a', desc: 'Dropped by bats' });
  WPN('tentacle_spike', 'Tentacle Spike', 'sword', 18, 25, 5, 1, 2000, { color: '#c04050', desc: 'Dropped by Face Monsters in Crimson worlds' });
  WPN('candy_cane_sword', 'Candy Cane Sword', 'sword', 18, 20, 5, 1, 2000, { color: '#e03030', desc: 'Christmas Presents' });
  WPN('katana', 'Katana', 'sword', 16, 15, 4, 1, 25000, { color: '#e0e0e8', desc: 'Sold by the Traveling Merchant' });
  WPN('ice_blade', 'Ice Blade', 'sword', 17, 20, 5, 1, 20000, { color: '#a0e0ff', swingProj: { color: '#a0e0ff', speed: 8 }, desc: 'Fires an ice bolt. Found in Ice Chests' });
  WPN('exotic_scimitar', 'Exotic Scimitar', 'sword', 18, 18, 4, 1, 5000, { color: '#e0c060', desc: 'Sold by the Dye Trader' });
  WPN('purple_clubberfish', 'Purple Clubberfish', 'sword', 30, 30, 8, 1, 5000, { color: '#a060c0', desc: 'Fished up in the Corruption' });
  WPN('falcon_blade', 'Falcon Blade', 'sword', 25, 15, 3, 2, 30000, { color: '#e0e0e8', desc: 'Found in Iron and Golden Crates' });
  WPN('blade_of_grass', 'Blade of Grass', 'sword', 28, 20, 4, 3, 5000, { color: '#40c040', swingProj: { color: '#40c040', speed: 7 } }, [['jungle_spores', 12], ['stinger', 12]], 'anvil');
  WPN('volcano', 'Volcano', 'sword', 38, 28, 6, 3, 15000, { color: '#e04a20', swingProj: { color: '#ff8020', speed: 8 }, desc: 'Sets enemies on fire (Fiery Greatsword)' }, [['hellstone_bar', 20]], 'anvil'); if (ITEMS.hellstone_sword) { ITEMS.hellstone_sword.name = 'Fiery Greatsword'; }
  WPN('nights_edge', "Night's Edge", 'sword', 47, 22, 5, 3, 10000, { color: '#6040a0', swingProj: { color: '#8060ff', speed: 9 } }, [['demonite_sword', 1], ['muramasa', 1], ['blade_of_grass', 1], ['volcano', 1]], 'demon_altar'); R('nights_edge', 1, 'demon_altar', [['crimtane_sword', 1], ['muramasa', 1], ['blade_of_grass', 1], ['volcano', 1]]); R('nights_edge', 1, 'demon_altar', [['demonite_sword', 1], ['muramasa', 1], ['blade_of_grass', 1], ['hellstone_sword', 1]]); R('nights_edge', 1, 'demon_altar', [['crimtane_sword', 1], ['muramasa', 1], ['blade_of_grass', 1], ['hellstone_sword', 1]]); ITEMS.demonite_sword.name = "Light's Bane"; ITEMS.crimtane_sword.name = 'Blood Butcherer';
  WPN('pearlwood_sword', 'Pearlwood Sword', 'sword', 11, 20, 4, 0, 200, { color: '#e0c0e0' }, [['pearlwood', 7]], 'workbench');
  WPN('classy_cane', 'Classy Cane', 'sword', 13, 20, 4, 1, 5000, { color: '#3a3a3a', desc: 'Sold by the Traveling Merchant' });
  WPN('cobalt_sword', 'Cobalt Sword', 'sword', 43, 21, 5, 4, 30000, { color: '#3060c0' }, [['cobalt_bar', 10]], 'mythril_anvil');
  WPN('palladium_sword', 'Palladium Sword', 'sword', 46, 20, 5, 4, 30000, { color: '#e08040' }, [['palladium_bar', 12]], 'mythril_anvil');
  WPN('phasesaber', 'Phasesaber', 'sword', 41, 18, 3, 4, 10000, { color: '#60e0ff' }, [['phaseblade', 1], ['crystal_shard', 50]], 'mythril_anvil');
  WPN('phaseblade', 'Phaseblade', 'sword', 21, 20, 3, 2, 5000, { color: '#60e0ff' }, [['meteorite_bar', 20], ['diamond', 10]], 'anvil'); for (const gem of ['amethyst', 'topaz', 'sapphire', 'emerald', 'ruby']) R('phaseblade', 1, 'anvil', [['meteorite_bar', 20], [gem, 10]]);
  WPN('ice_sickle', 'Ice Sickle', 'sword', 45, 19, 5, 4, 50000, { color: '#a0e0ff', swingProj: { color: '#a0e0ff', speed: 8 }, desc: 'Dropped by Ice enemies in Hardmode' });
  WPN('mythril_sword', 'Mythril Sword', 'sword', 49, 20, 5, 4, 30000, { color: '#40b0a0' }, [['mythril_bar', 10]], 'mythril_anvil');
  WPN('orichalcum_sword', 'Orichalcum Sword', 'sword', 53, 20, 5, 4, 30000, { color: '#e060a0' }, [['orichalcum_bar', 12]], 'mythril_anvil');
  WPN('frostbrand', 'Frostbrand', 'sword', 60, 19, 5, 5, 50000, { color: '#a0e0ff', swingProj: { color: '#a0e0ff', speed: 9 }, desc: 'Found in Frozen Chests' });
  WPN('adamantite_sword', 'Adamantite Sword', 'sword', 60, 20, 5, 4, 40000, { color: '#d03060' }, [['adamantite_bar', 12]], 'mythril_anvil');
  WPN('beam_sword', 'Beam Sword', 'sword', 52, 20, 6, 5, 60000, { color: '#40e0ff', swingProj: { color: '#40e0ff', speed: 10 }, desc: 'Rarely dropped by Armored Skeletons' });
  WPN('titanium_sword', 'Titanium Sword', 'sword', 64, 20, 5, 4, 40000, { color: '#a0a8b8' }, [['titanium_bar', 14]], 'mythril_anvil');
  WPN('fetid_baghnakhs', 'Fetid Baghnakhs', 'shortsword', 70, 8, 0, 5, 50000, { color: '#8a4040', desc: 'Very fast. Found in Crimson Chests... here: dropped in the Hardmode Crimson' });
  WPN('bladetongue', 'Bladetongue', 'sword', 60, 20, 4, 4, 50000, { color: '#e0c060', swingProj: { color: '#ffe060', speed: 7 }, desc: 'Fished up in the Hardmode Crimson' });
  WPN('ham_bat', 'Ham Bat', 'sword', 60, 25, 7, 5, 50000, { color: '#e0a0a0', desc: 'Sold by the Traveling Merchant in Hardmode' });
  WPN('excalibur', 'Excalibur', 'sword', 66, 18, 4, 5, 50000, { color: '#ffe060', swingProj: { color: '#ffe060', speed: 10 } }, [['hallowed_bar', 12]], 'mythril_anvil');
  WPN('waffles_iron', "Waffle's Iron", 'sword', 70, 25, 7, 5, 50000, { color: '#a08060', desc: 'Sold by the Traveling Merchant' });
  WPN('true_nights_edge', "True Night's Edge", 'sword', 105, 22, 5, 8, 100000, { color: '#6040a0', swingProj: { color: '#a080ff', speed: 11 } }, [['nights_edge', 1], ['broken_hero_sword', 1]], 'mythril_anvil');
  WPN('chlorophyte_claymore', 'Chlorophyte Claymore', 'sword', 90, 30, 6, 7, 60000, { color: '#40c040', swingProj: { color: '#80ff60', speed: 9 } }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('chlorophyte_saber', 'Chlorophyte Saber', 'sword', 65, 18, 4, 7, 60000, { color: '#40c040', swingProj: { color: '#80ff60', speed: 9 } }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('true_excalibur', 'True Excalibur', 'sword', 90, 18, 4, 8, 100000, { color: '#ffe060', swingProj: { color: '#ffe060', speed: 12 } }, [['excalibur', 1], ['chlorophyte_bar', 24], ['broken_hero_sword', 1]], 'mythril_anvil');
  WPN('psycho_knife', 'Psycho Knife', 'shortsword', 60, 12, 2, 8, 100000, { color: '#404048', desc: 'Grants stealth while held. Dropped by Psychos' });
  WPN('keybrand', 'Keybrand', 'sword', 90, 20, 5, 8, 100000, { color: '#ffd040', desc: 'More damage to wounded enemies. Dropped in the Hardmode Dungeon' });
  WPN('paladins_hammer', "Paladin's Hammer", 'boomerang', 90, 15, 9, 8, 100000, { color: '#e0c040', speed: 13, desc: 'Dropped by Paladins' });
  WPN('terra_blade', 'Terra Blade', 'sword', 115, 16, 6, 8, 200000, { color: '#40e080', swingProj: { color: '#80ff80', speed: 13, shots: 1 } }, [['true_nights_edge', 1], ['true_excalibur', 1]], 'mythril_anvil');
  WPN('flying_dragon', 'Flying Dragon', 'sword', 180, 20, 8, 8, 200000, { color: '#e0e0a0', swingProj: { color: '#ffe080', speed: 12 } }, [['defender_medal', 100]], 'tinkerers_workshop');
  WPN('true_copper_shortsword', 'True Copper Shortsword', 'shortsword', 100, 8, 3, 10, 500000, { color: '#c87533', swingProj: { color: '#ff8040', speed: 12 }, desc: 'A joke that hits hard' }, [['copper_shortsword', 1], ['broken_hero_sword', 1]], 'ancient_manipulator');
  WPN('zenith', 'Zenith', 'sword', 190, 30, 6.5, 10, 1000000, { color: '#40e0ff', swingProj: { color: '#80ffff', speed: 14, shots: 3, homing: 0.9 }, desc: 'Every sword you ever swung, at once' }, [['terra_blade', 1], ['meowmere', 1], ['star_wrath', 1], ['influx_waver', 1], ['the_horsemans_blade', 1], ['seedler', 1], ['starfury', 1], ['bee_keeper', 1], ['enchanted_sword', 1], ['copper_shortsword', 1]], 'ancient_manipulator');
  WPN('gladius', 'Gladius', 'shortsword', 14, 12, 3, 1, 5000, { color: '#c0c0c8', desc: 'Dropped by Hoplites' });
  WPN('starlight', 'Starlight', 'shortsword', 100, 10, 2, 9, 200000, { color: '#ffe0ff', desc: 'Dropped by the Empress of Light' });
  WPN('tragic_umbrella', 'Tragic Umbrella', 'shortsword', 20, 20, 5, 1, 2000, { color: '#404040', desc: 'Slows your fall while held' });
  WPN('umbrella', 'Umbrella', 'shortsword', 5, 20, 4, 0, 2000, { color: '#e04040', desc: 'Slows your fall while held. Dropped by Flying Fish and Zombies in the rain', featherHold: true });
  // arkhalis-likes: rapid multi-hit swords
  WPN('arkhalis', 'Arkhalis', 'sword', 25, 5, 0.5, 2, 30000, { color: '#8080ff', desc: 'A blur of steel. From the Enchanted Sword shrine' });
  WPN('jousting_lance', 'Jousting Lance', 'spear', 30, 25, 8, 1, 10000, { color: '#c0c0c8', desc: 'Damage grows with your speed' }, [['iron_bar', 10], ['wood', 20]], 'anvil'); R('jousting_lance', 1, 'anvil', [['lead_bar', 10], ['wood', 20]]);
  WPN('hallowed_jousting_lance', 'Hallowed Jousting Lance', 'spear', 87, 25, 9, 5, 50000, { color: '#e0c0ff' }, [['hallowed_bar', 12]], 'mythril_anvil');
  WPN('shadow_jousting_lance', 'Shadow Jousting Lance', 'spear', 120, 25, 9, 8, 100000, { color: '#4a3a6a', desc: 'Dropped by Hallowed Mimics... here: Hardmode Dungeon' });
  WPN('flying_knife', 'Flying Knife', 'boomerang', 30, 20, 5, 4, 50000, { color: '#e0e0ff', speed: 12, desc: 'Controlled by the cursor. Dropped by Hallowed Mimics' });
  WPN('shadowflame_knife', 'Shadowflame Knife', 'boomerang', 50, 15, 4, 5, 50000, { color: '#8040ff', speed: 13, count: 3, desc: 'Inflicts Shadowflame. Dropped by Goblin Summoners' });
  WPN('flint', 'Flint', 'shortsword', 4, 15, 2, 0, 100, { color: '#606068' });
  WPN('scourge_of_the_corruptor', 'Scourge of the Corruptor', 'boomerang', 88, 20, 6, 8, 100000, { color: '#60e040', speed: 14, count: 2, desc: 'Splits into Tiny Eaters. From the Corruption Chest' });
  WPN('vampire_knives', 'Vampire Knives', 'boomerang', 29, 25, 3, 8, 100000, { color: '#c02030', speed: 12, count: 5, lifesteal: 0.075, desc: 'Heals you for damage dealt. From the Crimson Chest' });
  WPN('daybreak', 'Daybreak', 'spear', 150, 15, 6, 10, 500000, { color: '#ff8020', desc: 'Throws solar spears that stick and burn' }, [['solar_fragment', 18]], 'ancient_manipulator');
  WPN('solar_eruption', 'Solar Eruption', 'flail', 100, 20, 7, 10, 500000, { color: '#ff6020', range: 24, desc: 'Lashes out through walls' }, [['solar_fragment', 18]], 'ancient_manipulator');
  WPN('sleepy_octopod', 'Sleepy Octopod', 'flail', 70, 24, 8, 5, 50000, { color: '#8060c0' });

  // ---- yoyos -------------------------------------------------------------------------------------------------------
  WPN('wooden_yoyo', 'Wooden Yoyo', 'yoyo', 9, 25, 2, 0, 1000, { range: 8, color: '#a8794b' }, [['wood', 10], ['cobweb', 20]], 'workbench');
  WPN('rally', 'Rally', 'yoyo', 14, 25, 3, 1, 5000, { range: 10, color: '#e0e0e0', desc: 'Dropped by Bats and other flyers' });
  WPN('malaise', 'Malaise', 'yoyo', 17, 25, 4, 1, 5000, { range: 11, color: '#6a3ad0' }, [['demonite_bar', 8], ['cobweb', 15]], 'anvil');
  WPN('artery', 'Artery', 'yoyo', 20, 25, 4, 1, 5000, { range: 11, color: '#c02030' }, [['crimtane_bar', 8], ['cobweb', 15]], 'anvil');
  WPN('amazon', 'Amazon', 'yoyo', 20, 25, 4, 1, 5000, { range: 12, color: '#40c040' }, [['rich_mahogany', 8], ['stinger', 2], ['vine', 1], ['jungle_spores', 3]], 'anvil');
  WPN('code_1', 'Code 1', 'yoyo', 21, 25, 4, 1, 30000, { range: 12, color: '#4080ff', desc: 'Sold by the Traveling Merchant' });
  WPN('hive_five', 'Hive-Five', 'yoyo', 23, 25, 4, 3, 30000, { range: 13, color: '#e0c040', desc: 'Spawns bees. Dropped by Queen Bee' });
  WPN('cascade', 'Cascade', 'yoyo', 27, 25, 4, 3, 30000, { range: 14, color: '#ff6020', desc: 'Sets enemies on fire. Dropped in the Underworld' });
  WPN('chik', 'Chik', 'yoyo', 30, 25, 4, 4, 40000, { range: 15, color: '#e0e0ff' }, [['cobalt_bar', 10], ['crystal_shard', 15], ['soul_of_light', 10]], 'mythril_anvil'); R('chik', 1, 'mythril_anvil', [['palladium_bar', 10], ['crystal_shard', 15], ['soul_of_light', 10]]);
  WPN('hel_fire', 'Hel-Fire', 'yoyo', 35, 25, 4, 4, 40000, { range: 16, color: '#ff4020', desc: 'Dropped in the Hardmode Underworld' });
  WPN('amarok', 'Amarok', 'yoyo', 43, 25, 4, 4, 50000, { range: 17, color: '#a0e0ff', desc: 'Inflicts Frostburn. Dropped in the Hardmode Snow biome' });
  WPN('code_2', 'Code 2', 'yoyo', 43, 25, 4, 4, 50000, { range: 17, color: '#4080ff', desc: 'Sold by the Traveling Merchant in Hardmode' });
  WPN('yelets', 'Yelets', 'yoyo', 50, 25, 4, 5, 60000, { range: 18, color: '#40c040', desc: 'Dropped in the Hardmode Jungle after a mechanical boss' });
  WPN('reds_throw', "Red's Throw", 'yoyo', 53, 25, 4, 5, 60000, { range: 19, color: '#e04040', desc: 'From Christmas Presents' });
  WPN('valkyrie_yoyo', 'Valkyrie Yoyo', 'yoyo', 53, 25, 4, 5, 60000, { range: 19, color: '#ffe060', desc: 'From Christmas Presents' });
  WPN('kraken', 'Kraken', 'yoyo', 60, 25, 4, 7, 100000, { range: 20, color: '#4060a0', desc: 'Dropped in the Hardmode Dungeon' });

  // ---- spears ---------------------------------------------------------------------------------------------------------
  WPN('spear', 'Spear', 'spear', 8, 30, 5, 0, 1500, { color: '#c0c0c8', desc: 'Found in surface chests' });
  WPN('trident', 'Trident', 'spear', 14, 28, 6, 1, 5000, { color: '#60c0e0', desc: 'Found in Water Chests' });
  WPN('slime_spear', 'Slime Spear', 'spear', 13, 25, 6, 1, 5000, { color: '#4080e0', desc: 'Dropped by King Slime... here: from Slime Staffs' });
  WPN('storm_spear', 'Storm Spear', 'spear', 14, 28, 6, 1, 5000, { color: '#e0e0ff', desc: 'Found in Sandstone Chests' });
  WPN('swordfish', 'Swordfish', 'spear', 22, 26, 6, 1, 10000, { color: '#6080a0', desc: 'Fished up in the Ocean' });
  WPN('dark_lance', 'Dark Lance', 'spear', 27, 24, 6, 3, 15000, { color: '#4a3a6a', desc: 'Found in Shadow Chests' });
  WPN('cobalt_naginata', 'Cobalt Naginata', 'spear', 37, 24, 6, 4, 30000, { color: '#3060c0' }, [['cobalt_bar', 12]], 'mythril_anvil');
  WPN('palladium_pike', 'Palladium Pike', 'spear', 43, 24, 6, 4, 30000, { color: '#e08040' }, [['palladium_bar', 15]], 'mythril_anvil');
  WPN('mythril_halberd', 'Mythril Halberd', 'spear', 44, 23, 6, 4, 30000, { color: '#40b0a0' }, [['mythril_bar', 12]], 'mythril_anvil');
  WPN('orichalcum_halberd', 'Orichalcum Halberd', 'spear', 51, 23, 6, 4, 30000, { color: '#e060a0' }, [['orichalcum_bar', 15]], 'mythril_anvil');
  WPN('adamantite_glaive', 'Adamantite Glaive', 'spear', 56, 22, 6, 4, 40000, { color: '#d03060' }, [['adamantite_bar', 15]], 'mythril_anvil');
  WPN('titanium_trident', 'Titanium Trident', 'spear', 60, 22, 6, 4, 40000, { color: '#a0a8b8' }, [['titanium_bar', 17]], 'mythril_anvil');
  WPN('gungnir', 'Gungnir', 'spear', 72, 20, 6, 5, 50000, { color: '#e0c0ff' }, [['hallowed_bar', 12]], 'mythril_anvil');
  WPN('chlorophyte_partisan', 'Chlorophyte Partisan', 'spear', 61, 19, 7, 7, 60000, { color: '#40c040' }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('mushroom_spear', 'Mushroom Spear', 'spear', 60, 18, 6, 8, 70000, { color: '#6aa0d0', desc: 'Sold by the Truffle after a mechanical boss' });
  WPN('obsidian_swordfish', 'Obsidian Swordfish', 'spear', 70, 19, 7, 8, 80000, { color: '#4a3060', desc: 'Fished up in Hardmode lava' });

  // ---- boomerangs -------------------------------------------------------------------------------------------------
  WPN('wooden_boomerang', 'Wooden Boomerang', 'boomerang', 7, 20, 5, 0, 1000, { color: '#a8794b', speed: 9, desc: 'Found in surface chests' });
  WPN('enchanted_boomerang', 'Enchanted Boomerang', 'boomerang', 13, 20, 5, 1, 5000, { color: '#4080ff', speed: 10, desc: 'Found in gold chests' });
  WPN('fruitcake_chakram', 'Fruitcake Chakram', 'boomerang', 18, 20, 5, 1, 5000, { color: '#a06030', speed: 10, desc: 'From Christmas Presents' });
  WPN('bloody_machete', 'Bloody Machete', 'boomerang', 18, 20, 5, 1, 5000, { color: '#c02030', speed: 10, desc: 'Halloween Goodie Bags' });
  WPN('shroomerang', 'Shroomerang', 'boomerang', 17, 19, 5, 1, 5000, { color: '#4a9aff', speed: 10, desc: 'Found in Glowing Mushroom chests' });
  WPN('ice_boomerang', 'Ice Boomerang', 'boomerang', 16, 20, 5, 1, 5000, { color: '#a0e0ff', speed: 10, desc: 'Found in Ice Chests' });
  WPN('thorn_chakram', 'Thorn Chakram', 'boomerang', 25, 15, 6, 3, 10000, { color: '#40c040', speed: 11 }, [['stinger', 10], ['jungle_spores', 20]], 'anvil');
  WPN('axearang', 'Axearang', 'boomerang', 30, 15, 6, 3, 20000, { color: '#c0c0c8', speed: 11, desc: 'Rarely fished up... here: dropped by Hardmode Goblins' });
  WPN('trimarang', 'Trimarang', 'boomerang', 26, 15, 5, 2, 15000, { color: '#e0c060', speed: 11, count: 3 }, [['wooden_boomerang', 1], ['enchanted_boomerang', 1], ['ice_boomerang', 1]], 'workbench'); for (const alt of ['shroomerang', 'fruitcake_chakram', 'bloody_machete']) R('trimarang', 1, 'workbench', [['wooden_boomerang', 1], ['enchanted_boomerang', 1], [alt, 1]]);
  WPN('combat_wrench', 'Combat Wrench', 'boomerang', 25, 18, 5, 2, 20000, { color: '#e04040', speed: 11, desc: 'Sold by the Mechanic' });
  WPN('flamarang', 'Flamarang', 'boomerang', 32, 15, 6, 3, 25000, { color: '#ff8020', speed: 12, desc: 'Sets enemies on fire' }, [['enchanted_boomerang', 1], ['hellstone_bar', 10]], 'anvil');
  WPN('sergeant_united_shield', 'Sergeant United Shield', 'boomerang', 50, 20, 8, 5, 50000, { color: '#4060c0', speed: 12, desc: 'Dropped by Paladins... here: Hardmode Dungeon' });
  WPN('light_disc', 'Light Disc', 'boomerang', 62, 15, 6, 6, 60000, { color: '#ffe060', speed: 14, count: 5 }, [['hallowed_bar', 4], ['soul_of_light', 3], ['soul_of_might', 5]], 'mythril_anvil');
  WPN('bananarang', 'Bananarang', 'boomerang', 50, 12, 6, 6, 60000, { color: '#f0e060', speed: 13, count: 10, desc: 'Dropped by Clowns on a Blood Moon' });

  // ---- flails ------------------------------------------------------------------------------------------------------
  WPN('mace', 'Mace', 'flail', 13, 45, 6, 0, 5000, { color: '#a0a0a8', desc: 'Found in surface chests' });
  WPN('flaming_mace', 'Flaming Mace', 'flail', 18, 45, 6, 1, 10000, { color: '#ff8020', desc: 'Sets enemies on fire' }, [['mace', 1], ['torch', 99]], 'workbench');
  WPN('the_meatball', 'The Meatball', 'flail', 26, 45, 7, 1, 15000, { color: '#c02030' }, [['crimtane_bar', 12]], 'anvil'); R('ball_o_hurt', 1, 'anvil', [['demonite_bar', 12]]);
  WPN('chain_knife', 'Chain Knife', 'flail', 12, 15, 4, 1, 10000, { color: '#c0c0c8', range: 8, desc: 'Dropped by Cave Bats' });
  WPN('drippler_crippler', 'Drippler Crippler', 'flail', 60, 25, 7, 5, 50000, { color: '#c02030', desc: 'Dropped by Dripplers on a Blood Moon' });
  WPN('dao_of_pow', 'Dao of Pow', 'flail', 49, 35, 8, 5, 40000, { color: '#e0e0e0', desc: 'Confuses enemies' }, [['dark_shard', 1], ['light_shard', 1], ['soul_of_light', 7], ['soul_of_night', 7], ['chain', 5]], 'mythril_anvil');
  WPN('anchor', 'Anchor', 'flail', 48, 45, 12, 4, 40000, { color: '#606068', desc: 'Dropped by Pirates' });
  WPN('chain_guillotines', 'Chain Guillotines', 'flail', 65, 30, 8, 7, 80000, { color: '#a0a0a8', desc: 'Dropped by Mothrons' });
  WPN('ko_cannon', 'KO Cannon', 'flail', 90, 25, 10, 7, 80000, { color: '#e04040', desc: 'Punches out. Dropped on a Blood Moon' });

  // ---- bows & repeaters ------------------------------------------------------------------------------------------------
  for (const [ore, name, col, dmg, cost] of [['copper', 'Copper', '#c87533', 6, 7], ['tin', 'Tin', '#c8b070', 7, 7], ['iron', 'Iron', '#a2a4b4', 8, 8], ['lead', 'Lead', '#7a88a8', 9, 8], ['silver', 'Silver', '#cfd6e6', 9, 8], ['tungsten', 'Tungsten', '#70b090', 10, 8], ['gold', 'Gold', '#e8b830', 11, 8], ['platinum', 'Platinum', '#c8d8f0', 13, 8]]) WPN(`${ore}_bow`, `${name} Bow`, 'bow', dmg, 27, 1, ore === 'gold' || ore === 'platinum' ? 1 : 0, 1000, { color: col, speed: 9 }, [[`${ore}_bar`, cost]], 'anvil');
  WPN('demon_bow', 'Demon Bow', 'bow', 14, 26, 1, 1, 2500, { color: '#6a3ad0', speed: 10 }, [['demonite_bar', 8]], 'anvil');
  WPN('tendon_bow', 'Tendon Bow', 'bow', 16, 25, 1, 1, 2500, { color: '#c02030', speed: 10 }, [['crimtane_bar', 8]], 'anvil');
  WPN('blood_rain_bow', 'Blood Rain Bow', 'bow', 20, 24, 1, 2, 20000, { color: '#c02030', speed: 10, shots: 2, spread: 0.1, desc: 'Fired arrows rain from above. Fished up in Crimson blood' });
  WPN('molten_fury', 'Molten Fury', 'bow', 31, 22, 3, 3, 20000, { color: '#ff8020', speed: 11, desc: 'Wooden arrows become flaming arrows' }, [['hellstone_bar', 15]], 'anvil');
  WPN('pearlwood_bow', 'Pearlwood Bow', 'bow', 9, 28, 1, 0, 200, { color: '#e0c0e0', speed: 9 }, [['pearlwood', 10]], 'workbench');
  WPN('marrow', 'Marrow', 'bow', 44, 20, 2, 5, 50000, { color: '#e8e8e0', speed: 12, desc: 'Dropped by Skeleton Archers' });
  WPN('ice_bow', 'Ice Bow', 'bow', 43, 20, 2, 5, 50000, { color: '#a0e0ff', speed: 12, desc: 'Fires frost arrows. Dropped by Ice Mimics' });
  WPN('daedalus_stormbow', 'Daedalus Stormbow', 'bow', 43, 19, 2, 5, 50000, { color: '#e0c0ff', speed: 12, shots: 3, spread: 0.2, desc: 'Arrows rain from the sky. Dropped by Hallowed Mimics' });
  WPN('shadowflame_bow', 'Shadowflame Bow', 'bow', 38, 17, 2, 5, 50000, { color: '#8040ff', speed: 12, desc: 'Inflicts Shadowflame. Dropped by Goblin Summoners' });
  for (const [ore, name, col, dmg, cost] of [['cobalt', 'Cobalt', '#3060c0', 35, 10], ['palladium', 'Palladium', '#e08040', 38, 12], ['mythril', 'Mythril', '#40b0a0', 41, 10], ['orichalcum', 'Orichalcum', '#e060a0', 46, 12], ['adamantite', 'Adamantite', '#d03060', 52, 12], ['titanium', 'Titanium', '#a0a8b8', 55, 14], ['hallowed', 'Hallowed', '#e0c0ff', 60, 12]]) WPN(`${ore}_repeater`, `${name} Repeater`, 'bow', dmg, 18 - (ore === 'hallowed' ? 4 : 0), 2, ore === 'hallowed' ? 5 : 4, 30000, { color: col, speed: 13 }, [[`${ore}_bar`, cost]], 'mythril_anvil');
  WPN('chlorophyte_shotbow', 'Chlorophyte Shotbow', 'bow', 43, 22, 2, 7, 60000, { color: '#40c040', speed: 13, shots: 3, spread: 0.1 }, [['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('phantom_phoenix', 'Phantom Phoenix', 'bow', 55, 25, 3, 7, 80000, { color: '#ff8020', speed: 13, shots: 2, spread: 0.05, desc: 'Every third shot is a flaming phoenix. Sold by the Tavernkeep' });
  WPN('pulse_bow', 'Pulse Bow', 'bow', 70, 20, 2, 8, 100000, { color: '#40e0ff', speed: 16, pierce: 2, desc: 'Fires bouncing pulse bolts. Sold by the Traveling Merchant after Plantera' });
  WPN('phantasm', 'Phantasm', 'bow', 50, 12, 2, 10, 500000, { color: '#30c0a0', speed: 16, shots: 4, spread: 0.06, desc: 'Fires four arrows at once, with phantom arrows on hit' }, [['vortex_fragment', 18]], 'ancient_manipulator');

  // ---- guns -----------------------------------------------------------------------------------------------------------
  WPN('red_ryder', 'Red Ryder', 'gun', 12, 30, 2, 1, 10000, { color: '#a04030', speed: 12, desc: 'From Christmas Presents' });
  WPN('revolver', 'Revolver', 'gun', 20, 20, 4, 1, 15000, { color: '#606068', speed: 13, desc: 'Sold by the Traveling Merchant' });
  WPN('minishark', 'Minishark', 'gun', 6, 7, 0, 1, 350000, { color: '#a0a0b0', speed: 13, chanceKeep: 0.33, desc: '33% chance not to consume ammo. Sold by the Arms Dealer' });
  WPN('boomstick', 'Boomstick', 'gun', 23, 36, 4, 2, 30000, { color: '#6a4a2a', speed: 12, shots: 3, spread: 0.15, desc: 'Found in Ivy Chests' });
  WPN('quad_barrel_shotgun', 'Quad-Barrel Shotgun', 'gun', 17, 45, 5, 2, 30000, { color: '#404048', speed: 12, shots: 4, spread: 0.2, desc: 'Sold by the Arms Dealer in a Graveyard' });
  WPN('phoenix_blaster', 'Phoenix Blaster', 'gun', 24, 11, 2, 3, 40000, { color: '#ff8020', speed: 14 }, [['handgun', 1], ['hellstone_bar', 10]], 'anvil');
  WPN('gatligator', 'Gatligator', 'gun', 21, 7, 1, 4, 350000, { color: '#60a060', speed: 13, spread: 0.2, chanceKeep: 0.5, desc: 'Sold by the Traveling Merchant in Hardmode' });
  WPN('shotgun', 'Shotgun', 'gun', 24, 36, 4, 4, 250000, { color: '#404048', speed: 12, shots: 4, spread: 0.15, desc: 'Sold by the Arms Dealer in Hardmode' });
  WPN('onyx_blaster', 'Onyx Blaster', 'gun', 32, 35, 4, 5, 60000, { color: '#303038', speed: 12, shots: 3, spread: 0.12, desc: 'Fires an onyx blast along with the shot' }, [['shotgun', 1], ['dark_shard', 2], ['soul_of_night', 10]], 'mythril_anvil');
  WPN('uzi', 'Uzi', 'gun', 30, 8, 3, 5, 100000, { color: '#404048', speed: 15, desc: 'Rarely dropped by Angry Trappers' });
  WPN('megashark', 'Megashark', 'gun', 25, 7, 1, 5, 60000, { color: '#8090a0', speed: 14, chanceKeep: 0.5, desc: '50% chance not to consume ammo' }, [['minishark', 1], ['illegal_gun_parts', 1], ['shark_fin', 5], ['soul_of_might', 20]], 'mythril_anvil');
  WPN('tactical_shotgun', 'Tactical Shotgun', 'gun', 29, 34, 5, 7, 100000, { color: '#3a3a44', speed: 13, shots: 6, spread: 0.15, desc: 'Dropped by Tactical Skeletons' });
  WPN('sniper_rifle', 'Sniper Rifle', 'gun', 185, 35, 10, 7, 100000, { color: '#303038', speed: 16, scope: true, crit: 25, desc: 'Right click to zoom. Dropped by Skeleton Snipers' });
  WPN('vortex_beater', 'Vortex Beater', 'gun', 50, 12, 2, 10, 500000, { color: '#30c0a0', speed: 16, shots: 1, desc: 'Fires bullets and homing rockets' }, [['vortex_fragment', 18]], 'ancient_manipulator');
  // dart guns, blowpipes, flamethrowers and the rest
  WPN('blowpipe', 'Blowpipe', 'gun', 9, 40, 2, 0, 500, { color: '#8a6038', speed: 10, ammoKind: 'dart', desc: 'Fires seeds and darts' });
  WPN('blowgun', 'Blowgun', 'gun', 26, 32, 3, 1, 25000, { color: '#40a040', speed: 11, ammoKind: 'dart', desc: 'Sold by the Witch Doctor' });
  WPN('dart_pistol', 'Dart Pistol', 'gun', 28, 20, 3, 4, 40000, { color: '#8040c0', speed: 13, ammoKind: 'dart', desc: 'Dropped by Corrupt Mimics' });
  WPN('dart_rifle', 'Dart Rifle', 'gun', 62, 45, 5, 4, 40000, { color: '#c04040', speed: 15, ammoKind: 'dart', desc: 'Dropped by Crimson Mimics' });
  WPN('sandgun', 'Sandgun', 'gun', 35, 20, 4, 3, 20000, { color: '#d9c88a', speed: 11, ammoKind: 'sand', desc: 'Fires sand blocks' }, [['antlion_mandible', 5], ['illegal_gun_parts', 1], ['sand', 10]], 'anvil');
  WPN('snowball_cannon', 'Snowball Cannon', 'gun', 12, 20, 4, 1, 15000, { color: '#a0d8f0', speed: 11, ammoKind: 'snowball', desc: 'Found in Ice Chests' });
  WPN('paintball_gun', 'Paintball Gun', 'gun', 10, 15, 2, 1, 10000, { color: '#e040a0', speed: 12, noConsume: true, desc: 'Fires paintballs (no ammo needed). Sold by the Painter' });
  WPN('harpoon', 'Harpoon', 'gun', 25, 25, 6, 2, 20000, { color: '#c0c0c8', speed: 12, noConsume: true, desc: 'Fires a harpoon that returns. Dropped by Goblin Invaders' });
  WPN('star_cannon', 'Star Cannon', 'gun', 55, 12, 3, 3, 100000, { color: '#ffe060', speed: 14, ammoKind: 'star', desc: 'Fires Fallen Stars' }, [['minishark', 1], ['meteorite_bar', 20], ['fallen_star', 5]], 'anvil');
  WPN('super_star_shooter', 'Super Star Shooter', 'gun', 55, 8, 3, 8, 200000, { color: '#ffe060', speed: 16, ammoKind: 'star', desc: 'Fires Fallen Stars fast' }, [['star_cannon', 1], ['luminite_bar', 10], ['fallen_star', 5]], 'ancient_manipulator');
  WPN('barrel_launcher', 'Barrel Launcher', 'gun', 30, 30, 8, 2, 20000, { color: '#8a5a2a', speed: 10, noConsume: true, desc: 'Fires a barrel' });
  WPN('toxikarp', 'Toxikarp', 'gun', 30, 9, 2, 5, 50000, { color: '#60c060', speed: 12, noConsume: true, onHitBuff: 'Poisoned', desc: 'Fires toxic bubbles. Fished up in the Hardmode Corruption' });
  WPN('flamethrower', 'Flamethrower', 'gun', 35, 8, 1, 5, 60000, { color: '#ff6020', speed: 9, ammoKind: 'gel', shots: 2, spread: 0.2, onHitBuff: 'On Fire!', life: 25, desc: 'Burns Gel as fuel' }, [['illegal_gun_parts', 1], ['soul_of_fright', 20], ['iron_bar', 20]], 'mythril_anvil'); R('flamethrower', 1, 'mythril_anvil', [['illegal_gun_parts', 1], ['soul_of_fright', 20], ['lead_bar', 20]]);
  WPN('piranha_gun', 'Piranha Gun', 'gun', 44, 10, 1, 8, 100000, { color: '#60a060', speed: 12, noConsume: true, desc: 'Latches onto enemies. From the Jungle Chest' });
  WPN('elf_melter', 'Elf Melter', 'gun', 55, 8, 1, 8, 100000, { color: '#e04040', speed: 10, ammoKind: 'gel', shots: 2, spread: 0.2, onHitBuff: 'On Fire!', life: 30 });
  WPN('nail_gun', 'Nail Gun', 'launcher', 100, 12, 4, 7, 100000, { color: '#a0a0a8', speed: 14, ammoKind: 'nail', desc: 'Fires nails that stick and explode. Dropped by Nailheads' });
  WPN('proximity_mine_launcher', 'Proximity Mine Launcher', 'launcher', 80, 30, 6, 7, 120000, { color: '#404048', speed: 10, desc: 'Fires mines that wait for enemies' });
  WPN('rocket_launcher', 'Rocket Launcher', 'launcher', 55, 25, 5, 7, 120000, { color: '#606068', speed: 14, desc: 'Dropped by Skeleton Commandos' });
  WPN('celebration_mk2', 'Celebration Mk2', 'launcher', 65, 12, 4, 10, 500000, { color: '#ff80ff', speed: 15, shots: 3, spread: 0.1, desc: 'Fires a fanfare of rockets. Rarely dropped by the Moon Lord' });
  WPN('flare_gun', 'Flare Gun', 'gun', 1, 30, 1, 0, 2000, { color: '#e04040', speed: 12, ammoKind: 'flare', desc: 'Fires flares that light the area' });
  WPN('clentaminator', 'Clentaminator', 'gun', 0, 8, 0, 4, 2000000, { color: '#40e040', speed: 14, ammoKind: 'solution', desc: 'Sprays solutions that convert biomes. Sold by the Steampunker' });
  WPN('terraformer', 'Terraformer', 'gun', 0, 6, 0, 8, 3000000, { color: '#40e0c0', speed: 16, ammoKind: 'solution', desc: 'A faster, wider Clentaminator. Shimmer the Clentaminator' });

  // ---- magic: wands, tomes, magic guns -------------------------------------------------------------------------------
  WPN('wand_of_frosting', 'Wand of Frosting', 'magic', 10, 20, 2, 0, 1000, { color: '#a0e0ff', manaCost: 2, speed: 8, onHitBuff: 'Frostburn', desc: 'Found in Frozen chests' });
  WPN('daybloom_staff', 'Daybloom Staff', 'magic', 9, 22, 3, 1, 5000, { color: '#f0e040', manaCost: 4, speed: 8, homing: 0.6 }, [['daybloom', 5], ['wood', 15]], 'workbench');
  WPN('thunder_zapper', 'Thunder Zapper', 'magic', 14, 20, 1, 1, 5000, { color: '#ffe060', manaCost: 5, speed: 12 });
  WPN('weather_pain', 'Weather Pain', 'magic', 35, 30, 4, 3, 30000, { color: '#a0e0ff', manaCost: 12, speed: 6, pierce: 5, life: 150 });
  WPN('sky_fracture', 'Sky Fracture', 'magic', 45, 15, 4, 4, 40000, { color: '#ffe060', manaCost: 8, speed: 12, shots: 3, spreadAng: 0.12 }, [['magic_missile', 1], ['light_shard', 1], ['soul_of_light', 20]], 'mythril_anvil');
  WPN('crystal_serpent', 'Crystal Serpent', 'magic', 41, 20, 5, 4, 40000, { color: '#ff80ff', manaCost: 9, speed: 11, desc: 'Shatters into crystal shards. Fished up in the Hallow' });
  WPN('flower_of_frost', 'Flower of Frost', 'magic', 60, 25, 5, 4, 50000, { color: '#a0e0ff', manaCost: 12, speed: 9, gravity: 0.12, onHitBuff: 'Frostburn', desc: 'Dropped by Ice Mimics' });
  WPN('frost_staff', 'Frost Staff', 'magic', 46, 20, 5, 4, 50000, { color: '#80e0ff', manaCost: 11, speed: 12, desc: 'Dropped by Ice Elementals' });
  WPN('crystal_vile_shard', 'Crystal Vile Shard', 'magic', 25, 18, 5, 4, 40000, { color: '#e080ff', manaCost: 9, pierce: 5, speed: 10, life: 30, desc: 'Dropped by Hallowed Mimics' });
  WPN('life_drain', 'Life Drain', 'magic', 32, 20, 0, 4, 40000, { color: '#c02030', manaCost: 5, speed: 6, homing: 0.9, life: 60, desc: 'Drains life to heal you. Dropped by Crimson Mimics' });
  WPN('lightning_strike', 'Lightning Strike', 'magic', 50, 18, 3, 4, 50000, { color: '#ffe060', manaCost: 10, speed: 16, pierce: 2, jitter: 0.15 });
  WPN('meteor_staff', 'Meteor Staff', 'magic', 51, 20, 5, 4, 50000, { color: '#ff8040', manaCost: 9, speed: 14, gravity: 0.2, shots: 2, spreadAng: 0.1, desc: 'Meteors fall from the sky' }, [['meteorite_bar', 25], ['soul_of_light', 20]], 'mythril_anvil');
  WPN('poison_staff', 'Poison Staff', 'magic', 48, 20, 5, 5, 50000, { color: '#60c060', manaCost: 12, speed: 12, shots: 3, spreadAng: 0.15, onHitBuff: 'Poisoned', desc: 'Dropped by Black Recluses' });
  WPN('rainbow_rod', 'Rainbow Rod', 'magic', 53, 30, 6, 5, 60000, { color: '#ff80ff', manaCost: 16, speed: 9, homing: 0.8, life: 150 }, [['crystal_shard', 10], ['unicorn_horn', 2], ['pixie_dust', 10], ['soul_of_light', 6], ['soul_of_sight', 6]], 'mythril_anvil');
  WPN('unholy_trident', 'Unholy Trident', 'magic', 65, 40, 6, 5, 60000, { color: '#c02030', manaCost: 20, speed: 13, pierce: 2, desc: 'Dropped by Red Devils' });
  WPN('venom_staff', 'Venom Staff', 'magic', 52, 20, 5, 6, 60000, { color: '#a040c0', manaCost: 12, speed: 12, shots: 3, spreadAng: 0.15, onHitBuff: 'Venom' }, [['poison_staff', 1], ['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('inferno_fork', 'Inferno Fork', 'magic', 65, 25, 6, 7, 80000, { color: '#ff6020', manaCost: 14, speed: 10, onHitBuff: 'On Fire!', desc: 'Explodes into an inferno. Dropped by Diabolists' });
  WPN('shadowbeam_staff', 'Shadowbeam Staff', 'magic', 53, 15, 3, 7, 80000, { color: '#8040ff', manaCost: 9, speed: 20, pierce: 6, life: 40, desc: 'A bouncing beam. Dropped by Necromancers' });
  WPN('spectre_staff', 'Spectre Staff', 'magic', 65, 20, 5, 7, 80000, { color: '#c0e0e0', manaCost: 14, speed: 9, homing: 0.95, life: 200, desc: 'Fires a homing lost soul. Dropped by Ragged Casters' });
  WPN('resonance_scepter', 'Resonance Scepter', 'magic', 70, 25, 5, 8, 100000, { color: '#ff80c0', manaCost: 12, speed: 12, pierce: 3, desc: 'Dropped by the Princess... here: after all NPCs' });
  WPN('staff_of_earth', 'Staff of Earth', 'magic', 82, 30, 7, 8, 100000, { color: '#8a6030', manaCost: 16, speed: 12, gravity: 0.15, desc: 'Dropped by the Golem' });
  WPN('bat_scepter', 'Bat Scepter', 'magic', 45, 12, 3, 8, 100000, { color: '#4a3a5a', manaCost: 6, speed: 9, homing: 0.8, shots: 2, spreadAng: 0.4 });
  WPN('amber_staff', 'Amber Staff', 'magic', 17, 32, 4, 1, 4000, { color: '#e08020', manaCost: 7, speed: 9, pierce: 1 }, [['amber', 10], ['gold_bar', 10]], 'anvil'); R('amber_staff', 1, 'anvil', [['amber', 10], ['platinum_bar', 10]]);
  WPN('water_bolt', 'Water Bolt', 'magic', 19, 20, 3, 2, 10000, { color: '#60a0ff', manaCost: 7, speed: 7, pierce: 5, life: 180, desc: 'A bouncing bolt. Found on Dungeon bookshelves' });
  WPN('cursed_flames', 'Cursed Flames', 'magic', 36, 20, 5, 5, 50000, { color: '#80ff40', manaCost: 9, speed: 10, gravity: 0.1, onHitBuff: 'Cursed Inferno', pierce: 2 }, [['book', 1], ['cursed_flame', 20], ['soul_of_night', 15]], 'bookcase');
  WPN('golden_shower', 'Golden Shower', 'magic', 32, 12, 2, 5, 50000, { color: '#ffe060', manaCost: 7, speed: 12, onHitBuff: 'Ichor', pierce: 3 }, [['book', 1], ['ichor', 20], ['soul_of_night', 15]], 'bookcase');
  WPN('crystal_storm', 'Crystal Storm', 'magic', 25, 7, 2, 5, 50000, { color: '#ff80ff', manaCost: 4, speed: 12, jitter: 0.1 }, [['book', 1], ['crystal_shard', 20], ['soul_of_light', 15]], 'bookcase');
  WPN('magnet_sphere', 'Magnet Sphere', 'magic', 50, 30, 4, 7, 80000, { color: '#40e0ff', manaCost: 14, speed: 5, life: 300, pierce: 20, desc: 'A slow sphere that zaps nearby enemies. Dropped by Blue Armored Bones' });
  WPN('demon_scythe', 'Demon Scythe', 'magic', 35, 20, 5, 3, 30000, { color: '#8040c0', manaCost: 14, speed: 4, pierce: 5, life: 120 });
  WPN('gray_zapinator', 'Gray Zapinator', 'magic', 26, 24, 4, 3, 30000, { color: '#a0a0a8', manaCost: 9, speed: 14 });
  WPN('orange_zapinator', 'Orange Zapinator', 'magic', 60, 24, 5, 6, 60000, { color: '#ffa040', manaCost: 12, speed: 15 });
  WPN('wasp_gun', 'Wasp Gun', 'magic', 31, 12, 2, 7, 80000, { color: '#e0c040', manaCost: 6, speed: 9, homing: 0.8, shots: 2, spreadAng: 0.3 }, [['bee_gun', 1], ['chlorophyte_bar', 12]], 'mythril_anvil');
  WPN('rainbow_gun', 'Rainbow Gun', 'magic', 60, 40, 5, 8, 100000, { color: '#ff80ff', manaCost: 20, speed: 8, pierce: 30, life: 600, desc: 'Fires a lasting rainbow. From the Hallowed Chest' });
  WPN('laser_machinegun', 'Laser Machinegun', 'magic', 50, 6, 3, 7, 80000, { color: '#e04040', manaCost: 4, speed: 16, jitter: 0.06 });
  WPN('charged_blaster_cannon', 'Charged Blaster Cannon', 'magic', 100, 40, 5, 7, 80000, { color: '#60e0ff', manaCost: 20, speed: 18, pierce: 5 });
  WPN('bubble_gun', 'Bubble Gun', 'magic', 70, 8, 3, 8, 100000, { color: '#80e0ff', manaCost: 7, speed: 8, life: 30, jitter: 0.2 });
  WPN('ice_rod', 'Ice Rod', 'magic', 28, 15, 2, 5, 500000, { color: '#a0e0ff', manaCost: 12, speed: 9, desc: 'Creates a block of ice. Sold by the Wizard' });
  WPN('clinger_staff', 'Clinger Staff', 'magic', 43, 30, 3, 5, 50000, { color: '#80ff40', manaCost: 12, speed: 8, pierce: 10, life: 240, onHitBuff: 'Cursed Inferno', desc: 'Summons a wall of cursed flames. Dropped by Clingers' });
  WPN('nimbus_rod', 'Nimbus Rod', 'magic', 26, 30, 0, 5, 50000, { color: '#c0c0d0', manaCost: 10, speed: 6, shots: 3, spreadAng: 0.2, gravity: 0.25, life: 200, desc: 'Summons a rain cloud. Dropped by Angry Nimbus' });
  WPN('magic_dagger', 'Magic Dagger', 'magic', 20, 12, 3, 5, 50000, { color: '#e0e0ff', manaCost: 3, speed: 12, gravity: 0.05, desc: 'A returning dagger. Dropped by Mimics' });
  WPN('spirit_flame', 'Spirit Flame', 'magic', 42, 35, 4, 5, 60000, { color: '#a0e0ff', manaCost: 14, speed: 7, homing: 0.95, shots: 2, spreadAng: 0.6, life: 150, desc: 'Dropped by Desert Spirits' });
  WPN('blood_thorn', 'Blood Thorn', 'magic', 40, 20, 4, 5, 50000, { color: '#c02030', manaCost: 9, speed: 9, pierce: 5, gravity: 0.15, desc: 'Thorns erupt from the ground. Dropped by Crimson enemies' });
  WPN('magical_harp', 'Magical Harp', 'magic', 42, 15, 2, 6, 60000, { color: '#ffe060', manaCost: 4, speed: 8, pierce: 4, life: 150 }, [['soul_of_light', 20], ['soul_of_sight', 20], ['soul_of_night', 20], ['soul_of_fright', 20]], 'mythril_anvil');
  WPN('toxic_flask', 'Toxic Flask', 'magic', 42, 40, 5, 7, 80000, { color: '#60c060', manaCost: 20, speed: 10, gravity: 0.2, onHitBuff: 'Venom', desc: 'A thrown flask of venom. Dropped by Dr. Man Fly' });
  WPN('stellar_tune', 'Stellar Tune', 'magic', 100, 10, 4, 9, 200000, { color: '#ff80ff', manaCost: 8, speed: 13, homing: 0.7, shots: 2, spreadAng: 0.2, desc: 'Dropped by the Empress of Light' });
  WPN('nebula_arcanum', 'Nebula Arcanum', 'magic', 60, 40, 4, 10, 500000, { color: '#c040c0', manaCost: 24, speed: 6, homing: 0.9, life: 240, pierce: 10 }, [['nebula_fragment', 18]], 'ancient_manipulator');
  WPN('nebula_blaze', 'Nebula Blaze', 'magic', 65, 12, 4, 10, 500000, { color: '#e040e0', manaCost: 12, speed: 11, homing: 0.85 }, [['nebula_fragment', 18]], 'ancient_manipulator');
  WPN('book_of_skulls', 'Book of Skulls', 'magic', 29, 30, 6, 2, 30000, { color: '#e8e8e0', manaCost: 12, speed: 8, homing: 0.6 });
  WPN('space_gun', 'Space Gun', 'magic', 19, 12, 1, 1, 20000, { color: '#60e0ff', manaCost: 6, speed: 16, freeWithMeteor: true }, [['meteorite_bar', 20]], 'anvil');
  WPN('medusa_head', 'Medusa Head', 'magic', 28, 20, 0, 4, 40000, { color: '#60a060', manaCost: 10, aoe: 6 });
  WPN('betsys_wrath', "Betsy's Wrath", 'magic', 140, 45, 4, 8, 150000, { color: '#e06030', manaCost: 20, speed: 12, shots: 3, spreadAng: 0.2, onHitBuff: 'On Fire!' });
  WPN('last_prism', 'Last Prism', 'magic', 100, 10, 0, 10, 500000, { color: '#ffffff', manaCost: 10, speed: 22, pierce: 30, life: 30 }, [['solar_fragment', 18], ['vortex_fragment', 18], ['nebula_fragment', 18], ['stardust_fragment', 18]], 'ancient_manipulator');
  WPN('lunar_flare', 'Lunar Flare', 'magic', 100, 12, 3, 10, 500000, { color: '#60c0ff', manaCost: 8, speed: 16, shots: 3, spreadAng: 0.1 }, [['book', 1], ['luminite_bar', 10]], 'ancient_manipulator');
  WPN('razorpine', 'Razorpine', 'magic', 50, 7, 3, 8, 100000, { color: '#40c040', manaCost: 5, speed: 14 });
  WPN('blizzard_staff', 'Blizzard Staff', 'magic', 58, 10, 3, 8, 100000, { color: '#a0e0ff', manaCost: 7, speed: 12, shots: 2, spreadAng: 0.3, gravity: 0.15 });
  WPN('heat_ray', 'Heat Ray', 'magic', 60, 20, 2, 8, 100000, { color: '#ff6020', manaCost: 10, speed: 24, pierce: 20, life: 30 });
  WPN('leaf_blower', 'Leaf Blower', 'magic', 48, 6, 1, 7, 80000, { color: '#40c040', manaCost: 3, speed: 12, jitter: 0.12 });
  WPN('venom_staff', 'Venom Staff', 'magic', 52, 20, 5, 6, 60000, { color: '#a040c0', manaCost: 12, speed: 12, shots: 3, spreadAng: 0.15, onHitBuff: 'Venom' });
  WPN('nettle_burst', 'Nettle Burst', 'magic', 41, 20, 4, 7, 80000, { color: '#40c040', manaCost: 12, speed: 14, pierce: 8, life: 40 });
  WPN('razorblade_typhoon', 'Razorblade Typhoon', 'magic', 90, 40, 5, 8, 100000, { color: '#40c0e0', manaCost: 16, speed: 9, homing: 0.9, pierce: 10, life: 240 });
  WPN('tome_of_infinite_wisdom', 'Tome of Infinite Wisdom', 'magic', 48, 20, 4, 8, 100000, { color: '#8040ff', manaCost: 10, speed: 12, shots: 3, spreadAng: 0.2 });
  WPN('nightglow', 'Nightglow', 'magic', 60, 20, 3, 9, 200000, { color: '#ffb0ff', manaCost: 12, speed: 8, homing: 0.95, shots: 5, spreadAng: 0.35, life: 200 });

  // ---- summon: minions -----------------------------------------------------------------------------------------------------
  const MIN = (id, name, dmg, use, rarity, value, minion, extra = {}, recipe, station) => WPN(id, name, 'summon', dmg, use, 3, rarity, value, Object.assign({ manaCost: 10, minion }, extra), recipe, station);
  MIN('finch_staff', 'Finch Staff', 8, 30, 1, 5000, { color: '#e0c040', shape: 'bird', speed: 7 }, { desc: 'Summons a finch. Found in Living Wood chests' });
  MIN('slime_staff', 'Slime Staff', 8, 30, 3, 100000, { color: '#4080e0', shape: 'blob', speed: 6 }, { desc: 'Summons a baby slime. Very rarely dropped by slimes' });
  MIN('flinx_staff', 'Flinx Staff', 8, 30, 1, 5000, { color: '#a0e0ff', shape: 'blob', speed: 7 }, { desc: 'Summons a Flinx' }, [['flinx_fur', 6], ['gold_bar', 10]], 'anvil'); R('flinx_staff', 1, 'anvil', [['flinx_fur', 6], ['platinum_bar', 10]]);
  MIN('abigails_flower', "Abigail's Flower", 5, 30, 1, 5000, { color: '#ff80c0', shape: 'bird', speed: 7 }, { desc: 'Summons Abigail, a ghost girl. Found in Graveyards' });
  MIN('vampire_frog_staff', 'Vampire Frog Staff', 11, 30, 1, 10000, { color: '#8040a0', shape: 'blob', speed: 7 }, { desc: 'Summons a vampire frog. Dropped by Zombies on a Blood Moon' });
  MIN('hornet_staff', 'Hornet Staff', 9, 30, 3, 20000, { color: '#e0c040', shape: 'bird', ranged: true, projKind: 'bolt', rate: 40, speed: 7 }, { desc: 'Summons a hornet' }, [['bee_wax', 14]], 'anvil');
  MIN('imp_staff', 'Imp Staff', 17, 30, 3, 20000, { color: '#e06020', shape: 'imp', ranged: true, projKind: 'spark', rate: 45, speed: 7 }, { desc: 'Summons an imp that breathes fire' }, [['hellstone_bar', 17]], 'anvil');
  MIN('blade_staff', 'Blade Staff', 6, 30, 4, 40000, { color: '#e0e0ff', shape: 'blade', speed: 9 }, { desc: 'Summons an enchanted dagger that ignores most defense. Dropped by Queen Slime' });
  MIN('spider_staff', 'Spider Staff', 26, 30, 4, 40000, { color: '#404048', shape: 'spider', speed: 7 }, { desc: 'Summons a venom spider' }, [['spider_fang', 16]], 'anvil');
  MIN('sanguine_staff', 'Sanguine Staff', 35, 30, 5, 60000, { color: '#c02030', shape: 'bird', speed: 9 }, { desc: 'Summons a sanguine bat. Dropped by Dreadnautilus on a Blood Moon' });
  MIN('optic_staff', 'Optic Staff', 30, 30, 5, 60000, { color: '#c03030', shape: 'bird', ranged: true, projKind: 'bolt', rate: 50, speed: 8 }, { desc: 'Summons the twins' }, [['black_lens', 2], ['lens', 3], ['hallowed_bar', 12], ['soul_of_sight', 20]], 'mythril_anvil');
  MIN('deadly_sphere_staff', 'Deadly Sphere Staff', 50, 30, 7, 80000, { color: '#8080a0', shape: 'blob', speed: 9 }, { desc: 'Summons a deadly sphere. Dropped by Deadly Spheres' });
  MIN('desert_tiger_staff', 'Desert Tiger Staff', 43, 30, 8, 100000, { color: '#e0c060', shape: 'imp', speed: 9 }, { desc: 'Summons a desert tiger that grows stronger with each summon. From the Desert Chest' });
  MIN('xeno_staff', 'Xeno Staff', 36, 30, 8, 100000, { color: '#60e0e0', shape: 'blob', ranged: true, projKind: 'bolt', rate: 30, speed: 9 }, { desc: 'Summons a UFO. Dropped by the Martian Saucer' });
  MIN('stardust_cell_staff', 'Stardust Cell Staff', 60, 30, 10, 500000, { color: '#40a0e0', shape: 'blob', ranged: true, projKind: 'bolt', rate: 30, speed: 9 }, { desc: 'Summons a stardust cell' }, [['stardust_fragment', 18]], 'ancient_manipulator');
  MIN('stardust_dragon_staff', 'Stardust Dragon Staff', 40, 30, 10, 500000, { color: '#40a0e0', shape: 'dragon', speed: 11 }, { desc: 'Summons a stardust dragon that grows with each summon' }, [['stardust_fragment', 18]], 'ancient_manipulator');
  MIN('pygmy_staff', 'Pygmy Staff', 34, 30, 7, 120000, { color: '#a06030', shape: 'imp', ranged: true, projKind: 'knife', rate: 45, speed: 7 });
  MIN('raven_staff', 'Raven Staff', 55, 30, 8, 150000, { color: '#202028', shape: 'bird', speed: 9 });
  MIN('tempest_staff', 'Tempest Staff', 50, 30, 8, 150000, { color: '#4060a0', shape: 'blob', ranged: true, projKind: 'bolt', rate: 35, speed: 8 });
  MIN('pirate_staff', 'Pirate Staff', 40, 30, 7, 100000, { color: '#8a5a2a', shape: 'imp', speed: 8 });
  MIN('mushroom_staff', 'Mushroom Staff', 13, 30, 1, 10000, { color: '#4a9aff', shape: 'blob', ranged: true, projKind: 'spore', rate: 45, speed: 7 }, { desc: 'Summons a mushroom' }, [['glow_mushroom', 12], ['jungle_spores', 4]], 'anvil');
  MIN('terraprisma', 'Terraprisma', 90, 30, 9, 200000, { color: '#ffe0ff', shape: 'blade', speed: 12 });
  // ---- summon: sentries ----------------------------------------------------------------------------------------------------
  const SEN = (id, name, dmg, use, rarity, value, minion, extra = {}, recipe, station) => WPN(id, name, 'summon', dmg, use, 3, rarity, value, Object.assign({ manaCost: 10, minion: Object.assign({ sentry: true, ranged: true, projKind: 'bolt', rate: 40, speed: 0, range: 20 }, minion) }, extra), recipe, station);
  SEN('queen_spider_staff', 'Queen Spider Staff', 26, 30, 4, 40000, { color: '#404048', shape: 'spider', projKind: 'spore', rate: 40 }, { desc: 'Summons a queen spider sentry that spits eggs' }, [['spider_fang', 24]], 'anvil');
  SEN('barnacle_staff', 'Barnacle Staff', 25, 30, 3, 30000, { color: '#60a0a0', shape: 'blob', rate: 50 }, { desc: 'Summons a barnacle sentry. Fished up in the Ocean' });
  SEN('staff_of_the_frost_hydra', 'Staff of the Frost Hydra', 100, 30, 8, 100000, { color: '#a0e0ff', shape: 'dragon', rate: 40 }, { desc: 'Summons a frost hydra that spits ice. From the Frozen Chest' });
  SEN('lunar_portal_staff', 'Lunar Portal Staff', 100, 30, 10, 500000, { color: '#8040ff', shape: 'orb', rate: 12 });
  SEN('rainbow_crystal_staff', 'Rainbow Crystal Staff', 150, 30, 10, 500000, { color: '#ff80ff', shape: 'gem', rate: 60 });
  SEN('houndius_shootius', 'Houndius Shootius', 30, 30, 3, 40000, { color: '#8080a0', shape: 'eye', rate: 30 });
  for (const [kind, name, col, dmgs, projKind] of [['lightning_aura', 'Lightning Aura', '#ffe060', [8, 24, 55], 'spark'], ['flameburst', 'Flameburst', '#ff6020', [17, 42, 80], 'spark'], ['explosive_trap', 'Explosive Trap', '#c04040', [24, 60, 110], 'grenade'], ['ballista', 'Ballista', '#8a6038', [30, 75, 130], 'arrow']]) {
    for (const [tier, label, rarity, value, cost] of [['rod', 'Rod', 3, 5, 5], ['cane', 'Cane', 5, 15, 15], ['staff', 'Staff', 8, 60, 60]]) {
      SEN(`${kind}_${tier}`, `${name} ${label}`, dmgs[tier === 'rod' ? 0 : tier === 'cane' ? 1 : 2], 30, rarity, value * 10000, { color: col, shape: 'orb', projKind, rate: kind === 'lightning_aura' ? 10 : 45 }, { desc: `Etherian sentry (${label}). Sold by the Tavernkeep for ${cost} Defender Medals` }, [['defender_medal', cost]], 'tinkerers_workshop');
    }
  }
  // ---- whips -------------------------------------------------------------------------------------------------------------
  const WHP = (id, name, dmg, use, kb, rarity, value, reach, color, extra = {}, recipe, station) => WPN(id, name, 'whip', dmg, use, kb, rarity, value, Object.assign({ reach, color, whipTag: extra.tag || 4 }, extra), recipe, station);
  WHP('leather_whip', 'Leather Whip', 14, 30, 1, 1, 10000, 5, '#a06030', { desc: 'Sold by the Zoologist. Tags enemies for minions' });
  WHP('snapthorn', 'Snapthorn', 18, 30, 1.5, 3, 20000, 6, '#40c040', { desc: 'Poisons and speeds up your attacks' }, [['stinger', 12], ['vine', 3], ['jungle_spores', 3]], 'anvil');
  WHP('spinal_tap', 'Spinal Tap', 27, 30, 1.5, 3, 20000, 6, '#e8e8e0', { desc: 'Hits several enemies without losing damage' }, [['bone', 90], ['cobweb', 55]], 'workbench');
  WHP('firecracker', 'Firecracker', 40, 30, 2, 5, 60000, 7, '#e04040', { desc: 'Tagged enemies explode on a minion hit. Dropped by the Wall of Flesh' });
  WHP('cool_whip', 'Cool Whip', 50, 30, 2, 5, 60000, 7, '#a0e0ff', { desc: 'Summons a snowflake on hit' }, [['soul_of_light', 12], ['soul_of_night', 12], ['ice', 10]], 'mythril_anvil');
  WHP('durendal', 'Durendal', 55, 25, 2.5, 5, 60000, 8, '#e0c0ff', { desc: 'Boosts your whip speed' }, [['hallowed_bar', 12]], 'mythril_anvil');
  WHP('dark_harvest', 'Dark Harvest', 100, 22, 2.5, 8, 100000, 9, '#40c040', { desc: 'Tagged enemies erupt in dark energy. Dropped by Pumpking' });
  WHP('morning_star', 'Morning Star', 165, 30, 4, 8, 100000, 9, '#e0e0ff', { desc: 'Tagged enemies take critical hits from minions. Dropped in the Hardmode Dungeon' });
  WHP('kaleidoscope', 'Kaleidoscope', 180, 25, 3, 9, 200000, 10, '#ff80ff', { desc: 'Dropped by the Empress of Light' });
}
