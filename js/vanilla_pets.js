// ---------------------------------------------------------------------------
// Vanilla pets and light pets are core content: the pet items the Pets
// Overhaul mod dressed up keep working (as plain companions) when that mod is
// off, the missing vanilla pets are added, and the pet slots always show.
// With Pets Overhaul on, its stats and abilities still apply on top.
// ---------------------------------------------------------------------------
'use strict';

{
  const VANILLA_PET_IDS = ['bone_rattle', 'brain_jar', 'seaweed', 'lightning_carrot', 'carrot', 'eaters_bone', 'eye_bone', 'hell_cake', 'tartar_sauce', 'toy_sled', 'frozen_crown', 'grinning_eye', 'dog_whistle', 'dirtiest_block', 'amber_mosquito', 'writhing_remains', 'probe', 'lizard_egg', 'mud_bud', 'bamboo_leaf', 'magic_lantern', 'fairy_bell', 'crimson_heart', 'shadow_orb', 'wisp', 'jewel_of_light', 'chester', 'bone_key', 'cursed_sapling', 'orb_of_light', 'spider_egg', 'fuse_wire', 'tentacle'];
  for (const id of VANILLA_PET_IDS) if (ITEMS[id]) delete ITEMS[id].mod;
  // the missing vanilla pets (plain companions; Pets Overhaul gives them no special ability)
  const PET = (id, name, pet, look, tip, rarity, value) => { if (ITEMS[id]) return; defPet(id, { name, pet, cls: 'Utility', look, desc: [tip], rarity: rarity == null ? 3 : rarity, value: value || 50000 }); delete ITEMS[id].mod; };
  PET('nectar', 'Nectar', 'Baby Hornet', { shape: 'eye', color: '#e0c040', accent: '#402000', fly: true }, 'Summons a baby hornet. Dropped by Queen Bee', 3);
  PET('fish_pet', 'Fish', 'Baby Penguin', { shape: 'blob', color: '#303038', accent: '#f0f0f0', legs: true }, 'Summons a baby penguin. Found in Ice Chests', 3);
  PET('strange_glowing_mushroom', 'Strange Glowing Mushroom', 'Baby Truffle', { shape: 'blob', color: '#4a9aff', accent: '#c0e0ff', legs: true }, 'Summons a baby truffle. Sold by the Truffle', 3);
  PET('unlucky_yarn', 'Unlucky Yarn', 'Black Cat', { shape: 'dog', color: '#202028', accent: '#ffe060', legs: true }, 'Summons a black cat. From Goodie Bags', 3);
  PET('companion_cube', 'Companion Cube', 'Companion Cube', { shape: 'box', color: '#c0c0c8', accent: '#ff80c0', legs: false }, 'Your loyal cube. Sold by the Traveling Merchant', 9, 5000000);
  PET('eye_spring', 'Eye Spring', 'Eyeball Spring', { shape: 'eye', color: '#f0f0f0', accent: '#c02020', legs: true }, 'Summons a bouncing eyeball. From Goodie Bags', 3);
  PET('bedazzled_nectar', 'Bedazzled Nectar', 'Glittery Butterfly', { shape: 'fairy', color: '#ffe0ff', accent: '#e080ff', fly: true }, 'Summons a glittery butterfly. Dropped by Queen Bee in Master Mode... here: rare Jungle drop', 4);
  PET('magical_pumpkin_seed', 'Magical Pumpkin Seed', 'Squashling', { shape: 'blob', color: '#e08020', accent: '#40a040', legs: true }, 'Summons a squashling. Dropped during the Pumpkin Moon', 4);
  PET('seedling', 'Seedling', 'Sapling', { shape: 'blob', color: '#40a040', accent: '#8a6038', legs: true }, 'Summons a sapling. Rarely dropped by Plantera', 4);
  PET('tiki_totem', 'Tiki Totem', 'Tiki Spirit', { shape: 'skull', color: '#8a6030', accent: '#e0c040', fly: true }, 'Summons a tiki spirit. Sold by the Witch Doctor', 4);
  PET('zephyr_fish', 'Zephyr Fish', 'Zephyr Fish', { shape: 'blob', color: '#60c0ff', accent: '#f0f0f0', fly: true }, 'Summons a flying fish. Rarely fished up', 4);
  PET('parrot_cracker', 'Parrot Cracker', 'Parrot', { shape: 'eye', color: '#40c040', accent: '#e04040', fly: true }, 'Summons a parrot. Sold by the Pirate', 4);
  PET('celestial_wand', 'Celestial Wand', 'Estee', { shape: 'fairy', color: '#ffe060', accent: '#8040c0', fly: true }, 'Summons Estee. Sold by the Traveling Merchant', 4);
  PET('eucalyptus_sap', 'Eucalyptus Sap', 'Sugar Glider', { shape: 'dog', color: '#a0a0a8', accent: '#f0f0f0', legs: true }, 'Summons a sugar glider. Shaken from trees', 3);
  PET('sand_cat_charm', 'Fennec Fox Charm', 'Fennec Fox', { shape: 'dog', color: '#e0c080', accent: '#f0f0f0', legs: true }, 'Summons a fennec fox. Sold by the Zoologist', 4);
  PET('glommers_flower', "Glommer's Flower", 'Glommer', { shape: 'blob', color: '#303038', accent: '#ffe060', fly: true }, 'Summons Glommer. Sold by the Zoologist', 4);
  PET('lupine_charm', "Lupine's Charm", 'Baby Werewolf', { shape: 'dog', color: '#606068', accent: '#c02030', legs: true }, 'Summons a baby werewolf. Dropped by Werewolves', 4);
  PET('baby_grinch_whistle', "Baby Grinch's Mischief Whistle", 'Baby Grinch', { shape: 'blob', color: '#40a040', accent: '#e04040', legs: true }, 'Summons a baby grinch. Dropped during the Frost Moon', 4);
  PET('glow_tulip', 'Glow Tulip', 'Cavling', { shape: 'blob', color: '#e080ff', accent: '#40e0ff', legs: true }, 'Summons a cavling. Found in cavern chests', 3);
  // light pets
  const LPET = (id, name, light, look, tip, rarity, value) => { if (ITEMS[id]) return; defLightPet(id, { name, light, look, desc: [tip], stats: [], rarity: rarity == null ? 4 : rarity, value: value || 80000 }); delete ITEMS[id].mod; };
  LPET('suspicious_looking_tentacle', 'Suspicious Looking Tentacle', [1.2, 1.0, 1.0], { shape: 'eye', color: '#40e0c0' }, 'Summons a suspicious eye that reveals treasure. From the Moon Lord Treasure Bag', 9, 500000);
  LPET('dragon_egg', 'Dragon Egg', [0.9, 0.5, 0.3], { shape: 'wisp', color: '#ff8040' }, 'Summons a hoardagron. Sold by the Tavernkeep', 6);
  LPET('flickerwick', 'Flickerwick', [1.0, 0.8, 0.4], { shape: 'lantern', color: '#ffc060' }, 'Summons a Flickerwick. Sold by the Party Girl... here: Traveling Merchant', 4);
  // ---- pet slots always show; a plain follower and light source when Pets Overhaul is off -------------------------------------
  ModLib.on('tick', (g) => {
    if (ModList.on('pets_overhaul')) return;
    const ps = g.pets; if (!ps) return;
    if (ps.pet && PETS[ps.pet.id]) { ps.def = PETS[ps.pet.id]; ps.updateCompanion(); } else ps.def = null;
    if (ps.light && LIGHT_PETS[ps.light.id]) { const lp = ps.lightPos, p = g.player, w = g.world; const tx = p.cx + p.dir * -30 - 10, ty = p.y - 20 + Math.sin(w.time * 0.05) * 4; if (Math.abs(lp.x - tx) > 12 * TILE) { lp.x = tx; lp.y = ty; } lp.x += (tx - lp.x) * 0.06; lp.y += (ty - lp.y) * 0.06; const L = LIGHT_PETS[ps.light.id].light; g.lighting.extraLights.push({ x: lp.x / TILE, y: lp.y / TILE, r: L[0], g: L[1], b: L[2] }); }
  });
  ModLib.on('drawWorld', (g, s, cam) => {
    if (ModList.on('pets_overhaul')) return;
    const ps = g.pets; if (!ps) return; const t = g.world.time;
    if (ps.def && ps.def.look) { const look = ps.def.look, c = ps.companion; const x = snap(c.x - cam.x), y = snap(c.y - cam.y + (look.legs ? Math.abs(Math.sin(c.hop)) * -3 : 0)); s.save(); s.translate(x, y); if (c.dir < 0) s.scale(-1, 1); drawPetShape(s, look, t); s.restore(); }
    if (ps.light && LIGHT_PETS[ps.light.id]) { const look = LIGHT_PETS[ps.light.id].look, lp = ps.lightPos; s.save(); s.translate(snap(lp.x - cam.x), snap(lp.y - cam.y)); drawPetShape(s, look, t); s.restore(); }
  });
}
