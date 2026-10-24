// ---------------------------------------------------------------------------
// Pets Overhaul: Regular pets with gameplay effects & abilities, Light pets with
// rolled Quality, Town pets that grant permanent buffs, pet stats (Fortune, Ability
// Haste, Pet Damage/Healing/Shielding), Pet Tamer, Pet Food / Pet Forge recipes,
// achievements. Adapted from the tModLoader mod "Pets Overhaul".
// ---------------------------------------------------------------------------
'use strict';

// Tiles & items ---------------------------------------------------------------
T.PETFORGE = 45;
defTile(T.PETFORGE, { name: 'Pet Forge', hp: 1, solid: false, drop: 'pet_forge', color: '#8a6a4a', furniture: { w: 3, h: 2 }, transparent: true, light: [0.4, 0.3, 0.2] });
defItem('pet_food', { name: 'Pet Food', material: true, max: 9999, tooltip: 'Used in every Pet recipe at the Pet Forge' });
defItem('pet_forge', { name: 'Pet Forge', tile: T.PETFORGE, tooltip: 'Crafting station for Pets' });
defItem('pet_tablet', { name: 'Pet Monitoring Tablet', consumable: false, max: 1, rarity: 1, tooltip: 'Shows all of your Pet stats (left click)' });
defItem('mastery_shard', { name: 'Mastery Shard', material: true, max: 99, rarity: 3, tooltip: 'Dropped by bosses in Expert mode. Used in powerful Pet recipes' });
defItem('cat_license', { name: 'Cat License', consumable: true, max: 5, rarity: 1, tooltip: 'A Town Cat will move in at dawn' });
defItem('dog_license', { name: 'Dog License', consumable: true, max: 5, rarity: 1, tooltip: 'A Town Dog will move in at dawn' });
defItem('bunny_license', { name: 'Bunny License', consumable: true, max: 5, rarity: 1, tooltip: 'A Town Bunny will move in at dawn' });
Object.assign(ITEM_VALUES, { pet_food: 10, pet_forge: 50000, pet_tablet: 10000, mastery_shard: 50000, cat_license: 50000, dog_license: 50000, bunny_license: 50000 });

// Regular pets ----------------------------------------------------------------
// cls: Defensive/Offensive/Mobility/Utility/Melee/Mining. ability: {name, cd (ticks)}
const PETS = {};
function defPet(id, o) {
  PETS[id] = o;
  defItem(id, { name: o.name, pet: 'regular', max: 1, rarity: o.rarity == null ? 2 : o.rarity, tooltip: o.desc[0] });
  ITEM_VALUES[id] = o.value || 30000; ITEMS[id].value = ITEM_VALUES[id];
  if (o.recipe) RECIPES.push({ result: id, count: 1, station: 'petforge', ing: o.recipe });
}
defPet('bone_rattle', { name: 'Bone Rattle', pet: 'Baby Face Monster', cls: 'Defensive', look: { shape: 'blob', color: '#c04040', accent: '#ffd0d0', legs: true },
  desc: ['Health regen builds up 20% faster', 'Out of combat for 5s: +4 life regen; 12s: +15 regen and a shield worth 5% of your max life', 'Dealing damage cannot set your combat timer below 5 seconds'],
  recipe: [['copper_helmet', 1], ['copper_chainmail', 1], ['copper_greaves', 1], ['stone', 40], ['mushroom', 12], ['pet_food', 75]] });
defPet('brain_jar', { name: 'Brain in a Jar', pet: 'Baby Brain of Cthulhu', cls: 'Defensive', look: { shape: 'orb', color: '#d06080', accent: '#ffb0c0', fly: true },
  desc: ['3.5% lifesteal, drawn from a Health Pool worth 30% of your max life', 'The pool recovers 1 health every 2.75 seconds'],
  recipe: [['lesser_healing', 1], ['glass', 30], ['life_crystal', 2], ['rotten_chunk', 25], ['mastery_shard', 1], ['pet_food', 100]] });
defPet('seaweed', { name: 'Seaweed', pet: 'Turtle', cls: 'Defensive', look: { shape: 'box', color: '#3a8a4a', accent: '#8ad090', legs: true },
  desc: ['+7% defense, 55% knockback resistance, -12% movement speed', 'Ability (F): harden your shell for 15s - the next 6 hits deal 7% less damage, no knockback, and reflect 110% of the damage (60% for projectiles)'],
  ability: { name: 'Harden Shell', cd: 60 * 30 },
  recipe: [['cactus', 10], ['sand', 250], ['gel', 12], ['pet_food', 150]] });
defPet('lightning_carrot', { name: 'Lightning Carrot', pet: 'Lightning Bunny', cls: 'Offensive', look: { shape: 'bunny', color: '#e0d0ff', accent: '#8060ff', legs: true },
  desc: ['+10% movement speed, and movement speed x1.05', 'Damage increased by 20% of your bonus movement speed', 'Enemies that touch you are slowed by 300% for 0.75s'],
  recipe: [['acorn', 25], ['gold_bar', 5], ['diamond', 1], ['gel', 25], ['pet_food', 700]] });
defPet('carrot', { name: 'Carrot', pet: 'Bunny', cls: 'Mobility', look: { shape: 'bunny', color: '#f0f0f0', accent: '#ffb0c0', legs: true }, rarity: 1, value: 10000,
  desc: ['Every full jump grants a stack: +0.5% movement speed and +2% jump speed per stack (max 10)', 'Stacks reset after 4 seconds without jumping'],
  recipe: [['acorn', 10], ['pet_food', 50]] });
defPet('eaters_bone', { name: "Eater's Bone", pet: 'Baby Eater', cls: 'Mobility', look: { shape: 'worm', color: '#6a4a8a', accent: '#c0a0e0', fly: true },
  desc: ['+11% movement speed and +65% jump speed', 'Auto-jump while holding jump', 'Fall damage resistance +30 blocks while underground'],
  recipe: [['iron_helmet', 1], ['iron_chainmail', 1], ['iron_greaves', 1], ['stone', 40], ['mushroom', 12], ['pet_food', 75]] });
defPet('eye_bone', { name: 'Eye Bone', pet: 'Baby Skeletron Head', cls: 'Utility', look: { shape: 'skull', color: '#e8e8e0', accent: '#202020', fly: true },
  desc: ['Item pickup range +6.25 blocks', 'Item placement range +2 blocks', '+10 defense while a chest or shop is open'],
  recipe: [['chest', 50], ['pet_food', 100]] });
defPet('hell_cake', { name: 'Slice of Hell Cake', pet: 'Baby Imp', cls: 'Utility', look: { shape: 'blob', color: '#d04020', accent: '#ffb040', fly: true },
  desc: ['Lava immunity for 10 seconds (recovers outside lava)', 'While in lava: +10 defense and +15% movement speed'],
  recipe: [['obsidian', 25], ['ash', 300], ['torch', 30], ['pet_food', 8]] });
defPet('spider_egg', { name: 'Spider Egg', pet: 'Baby Spider', cls: 'Offensive', look: { shape: 'spider', color: '#4a3a3a', accent: '#c02020', legs: true },
  desc: ['Your hits apply Poisoned for 10 seconds', 'Hits on poisoned enemies deal x1.08 + 5 damage, x1.25 knockback and gain +6% crit chance'],
  recipe: [['cobweb', 400], ['gel', 20], ['pet_food', 500]] });
defPet('tartar_sauce', { name: 'Tartar Sauce', pet: 'Mini Minotaur', cls: 'Melee', look: { shape: 'box', color: '#8a5a3a', accent: '#e0c0a0', legs: true },
  desc: ['Melee hits grant stacks (2 per hit, max 80); lose a stack every 0.33s out of combat', 'Per stack: +0.23% melee speed, +0.125% melee damage, +0.12% defense, -0.18% movement speed'],
  recipe: [['iron_bar', 80], ['gel', 30], ['cactus', 2], ['pet_food', 100]] });
defPet('fuse_wire', { name: "Ball O' Fuse Wire", pet: 'Explosive Bunny', cls: 'Offensive', look: { shape: 'bunny', color: '#e0e0e0', accent: '#ff4020', legs: true },
  desc: ['Your attacks create an explosion (200x200) dealing 0.6x the damage with 15 armor penetration and 1.7x knockback', '2 second cooldown'],
  recipe: [['dynamite', 99], ['pet_food', 300]] });
defPet('toy_sled', { name: 'Toy Sled', pet: 'Baby Snowman', cls: 'Offensive', look: { shape: 'blob', color: '#f4f8ff', accent: '#ff8020', legs: true },
  desc: ['Your hits apply Frostburn for 5 seconds', 'Your hits slow enemies by 30% for 3 seconds'],
  recipe: [['snow', 3500], ['wood', 500], ['ice', 3], ['pet_food', 700]] });
defPet('frozen_crown', { name: 'Frozen Crown', pet: 'Baby Ice Queen', cls: 'Defensive', look: { shape: 'orb', color: '#a0e0ff', accent: '#ffffff', fly: true }, rarity: 3, value: 100000,
  desc: ['Instead of dying, freeze for 5 seconds: immune to everything, enemies within 30 blocks are slowed by 1000%', 'Recover 100 life and gain a 50 point shield; when the freeze ends deal 200 damage to all slowed enemies', '2 minute cooldown'],
  recipe: [['ice', 2500], ['gold_bar', 10], ['mastery_shard', 1], ['pet_food', 1000]] });
defPet('grinning_eye', { name: 'Suspicious Grinning Eye', pet: 'Suspicious Eye', cls: 'Offensive', look: { shape: 'eye', color: '#e8e0e0', accent: '#c02020', fly: true }, rarity: 3, value: 80000,
  desc: ['Below 50% life and in combat for 5s (or press F): Enrage for 30s', 'All defense becomes Rage: +90% of it as damage, +50% as movement speed, +18% as crit; you cannot go above 50% life', 'Gain half of the rage as a 10s shield. 150 second cooldown'],
  ability: { name: 'Enrage', cd: 60 * 150 },
  recipe: [['lens', 35], ['iron_bar', 15], ['mastery_shard', 1], ['pet_food', 140]] });
defPet('dog_whistle', { name: 'Dog Whistle', pet: 'Puppy', cls: 'Utility', look: { shape: 'dog', color: '#c89060', accent: '#f0e0d0', legs: true }, rarity: 1, value: 15000,
  desc: ['Kills grant 10% more coins; bosses grant an extra 7 silver', 'Enemies are highlighted with a purple shine'],
  recipe: [['rotten_chunk', 100], ['pet_food', 100]] });
defPet('dirtiest_block', { name: 'The Dirtiest Block', pet: 'Dirt Block', cls: 'Mining', look: { shape: 'box', color: '#8a5a2b', accent: '#3cb043', legs: true }, rarity: 1, value: 10000,
  desc: ['Mining anything gives 3 copper coins', 'Mining Dirt gives 8.5 copper coins'],
  recipe: [['dirt', 25000], ['pet_food', 1]] });
defPet('amber_mosquito', { name: 'Amber Mosquito', pet: 'Baby Dinosaur', cls: 'Mining', look: { shape: 'blob', color: '#6ab040', accent: '#e0c040', legs: true },
  desc: ['Mining ore or gems has a 17.5% chance to grant a random extra ore or gem', 'Less valuable ores are more likely'],
  recipe: [['sand', 500], ['diamond', 3], ['gold_ore', 15], ['pet_food', 1]] });
defPet('writhing_remains', { name: 'Writhing Remains', pet: 'Baby Worm', cls: 'Mining', look: { shape: 'worm', color: '#c08090', accent: '#e0b0c0', legs: true },
  desc: ['+20% mining speed on non-ore blocks', 'Mining ore also mines all ore of the same type in a 3x3 area, with a 25% chance to extend to 5x5'],
  recipe: [['rotten_chunk', 25], ['mushroom', 20], ['mastery_shard', 1], ['pet_food', 100]] });
defPet('probe', { name: 'Deactivated Probe', pet: 'Probe', cls: 'Mining', look: { shape: 'eye', color: '#a0a0b0', accent: '#ff4040', fly: true },
  desc: ['+15% defense', 'Mining Fortune equal to 35% of your defense + 8'],
  recipe: [['copper_bar', 40], ['iron_bar', 15], ['silver_bar', 15], ['gold_bar', 15], ['mastery_shard', 1], ['pet_food', 900]] });
defPet('lizard_egg', { name: 'Lizard Egg', pet: 'Lizard', cls: 'Defensive', look: { shape: 'worm', color: '#c0a040', accent: '#806020', legs: true },
  desc: ['60% knockback resistance', 'Below 55% life you turn into a Lihzahrd: +10 defense, +70% movement speed, -50% jump', 'Ability (F): drop a Decoy Tail - lose 10% life (never lethal), 2s of invincibility and +50% speed; enemies chase the tail. Pick the tail up after 5s to regain the life. 60s cooldown'],
  ability: { name: 'Decoy Tail', cd: 60 * 60 },
  recipe: [['stone_brick', 200], ['hellstone', 15], ['pet_food', 5000]] });
defPet('mud_bud', { name: 'Mud Bud', pet: 'Baby Plantera', cls: 'Offensive', look: { shape: 'blob', color: '#c050a0', accent: '#40a040', fly: true },
  desc: ['Hitting enemies has a 15% chance to release spores dealing 0.7x the damage + 15', 'Spores drift near the enemy and can hit up to 20 times'],
  recipe: [['clay', 99], ['mushroom', 10], ['pet_food', 500]] });
defPet('bamboo_leaf', { name: 'Bamboo Leaf', pet: 'Panda', cls: 'Offensive', look: { shape: 'box', color: '#f0f0f0', accent: '#202020', legs: true }, rarity: 1, value: 20000,
  desc: ['+3.5% attack speed', 'Ability (F): Alert mode for 8s - +1.5% attack speed and +3% movement speed per enemy within 50 blocks (up to 6), and enemies are highlighted', '30 second cooldown'],
  ability: { name: 'Alert', cd: 60 * 30 },
  recipe: [['wood', 1100], ['pet_food', 350]] });

// Light pets: each stat rolls a quality 0..max on first pickup ------------------------
const LIGHT_PETS = {};
function defLightPet(id, o) {
  LIGHT_PETS[id] = o;
  defItem(id, { name: o.name, pet: 'light', max: 1, rarity: 2, tooltip: 'Light Pet - emits light, stats depend on its Quality rolls' });
  ITEM_VALUES[id] = o.value || 40000; ITEMS[id].value = ITEM_VALUES[id];
  if (o.recipe) RECIPES.push({ result: id, count: 1, station: 'petforge', ing: o.recipe });
}
// stat: key, label, base, per (per quality point), max (quality range), fmt
defLightPet('magic_lantern', { name: 'Magic Lantern', light: [1.0, 0.9, 0.6], look: { shape: 'lantern', color: '#ffe080' },
  stats: [{ key: 'dr', label: 'Damage Reduction', base: 1, per: 0.2, max: 15, fmt: '%' }, { key: 'defense', label: 'Defense', base: 0, per: 1, max: 3, fmt: '' }, { key: 'defensePct', label: 'Defense', base: 1, per: 0.2, max: 20, fmt: '%' }, { key: 'miningFortune', label: 'Mining Fortune', base: 5, per: 1, max: 15, fmt: '' }],
  recipe: [['glass', 10], ['torch', 10], ['copper_bar', 2], ['iron_bar', 2], ['silver_bar', 2], ['gold_bar', 2], ['pet_food', 175]] });
defLightPet('fairy_bell', { name: 'Fairy Bell', light: [1.0, 0.7, 0.9], look: { shape: 'fairy', color: '#ff90d0' },
  stats: [{ key: 'haste', label: 'Pet Ability Haste', base: 10, per: 1.2, max: 15, fmt: '%' }, { key: 'globalFortune', label: 'Global Fortune', base: 5, per: 1, max: 20, fmt: '' }],
  recipe: [['gold_bar', 5], ['diamond', 1], ['gel', 8], ['pet_food', 80]] });
defLightPet('crimson_heart', { name: 'Crimson Heart', light: [1.0, 0.3, 0.3], look: { shape: 'heart', color: '#ff3050' },
  stats: [{ key: 'maxHp', label: 'Max Life', base: 10, per: 1, max: 10, fmt: '' }, { key: 'petHealing', label: 'Pet Healing', base: 2.5, per: 0.5, max: 15, fmt: '%' }, { key: 'harvestFortune', label: 'Harvesting Fortune', base: 5, per: 1, max: 15, fmt: '' }],
  recipe: [['life_crystal', 1], ['rotten_chunk', 4], ['mushroom', 2], ['pet_food', 10]] });
defLightPet('shadow_orb', { name: 'Shadow Orb', light: [0.5, 0.4, 1.0], look: { shape: 'orb', color: '#8060ff' },
  stats: [{ key: 'petShielding', label: 'Pet Shielding', base: 2.5, per: 0.5, max: 15, fmt: '%' }, { key: 'harvestFortune', label: 'Harvesting Fortune', base: 5, per: 1, max: 15, fmt: '' }, { key: 'crit', label: 'Crit Chance', base: 0, per: 0.3, max: 10, fmt: '%' }],
  recipe: [['obsidian', 4], ['iron_bar', 3], ['glow_mushroom', 2], ['pet_food', 10]] });
defLightPet('wisp', { name: 'Wisp in a Bottle', light: [0.6, 0.8, 1.0], look: { shape: 'wisp', color: '#a0f0ff' },
  stats: [{ key: 'rangedDamage', label: 'Ranged Damage', base: 4, per: 0.4, max: 20, fmt: '%' }, { key: 'petDamage', label: 'Pet Damage', base: 6.75, per: 0.65, max: 25, fmt: '%' }, { key: 'projSpeed', label: 'Projectile Speed', base: 5, per: 1, max: 12, fmt: '%' }],
  recipe: [['bottle', 1], ['gel', 8], ['torch', 8], ['pet_food', 150]] });
defLightPet('jewel_of_light', { name: 'Jewel of Light', light: [0.9, 0.9, 1.0], look: { shape: 'gem', color: '#c0f0ff' },
  stats: [{ key: 'moveSpeed', label: 'Movement Speed', base: 7, per: 1, max: 8, fmt: '%' }, { key: 'accel', label: 'Walking Acceleration', base: 2, per: 0.12, max: 20, fmt: '%' }],
  recipe: [['diamond', 8], ['glass', 14], ['pet_food', 125]] });
defLightPet('tentacle', { name: 'Suspicious Looking Tentacle', light: [0.8, 0.5, 0.8], look: { shape: 'eye', color: '#e8e0e0' }, value: 150000,
  stats: [{ key: 'defense', label: 'Defense', base: 0, per: 1, max: 5, fmt: '' }, { key: 'moveSpeed', label: 'Movement Speed', base: 0, per: 0.4, max: 20, fmt: '%' }, { key: 'damage', label: 'All Damage', base: 0, per: 0.25, max: 20, fmt: '%' }, { key: 'crit', label: 'Crit Chance', base: 0, per: 0.25, max: 20, fmt: '%' }, { key: 'meleeKb', label: 'Melee Knockback', base: 0, per: 12, max: 5, fmt: '%' }],
  recipe: [['lens', 24], ['gold_bar', 12], ['mastery_shard', 3], ['pet_food', 400]] });

// Town pet buffs (one at a time, permanent) ---------------------------------------------
const TOWN_PET_BUFFS = {
  'Town Bunny': { label: "Bunny's Buff", stats: { harvestFortune: 25 }, desc: '+25 Harvesting Fortune' },
  'Town Cat': { label: "Cat's Buff", stats: { globalFortune: 11 }, desc: '+11 Global Fortune (there is no fishing here, so the cat helps everywhere)' },
  'Town Dog': { label: "Dog's Buff", stats: { miningFortune: 23 }, desc: '+23 Mining Fortune' },
  'Squire Slime': { label: "Squire Slime's Buff", stats: { petShielding: 22 }, desc: '+22% Pet Shielding' },
};
const TOWN_PET_NAMES = {
  'Town Cat': ['Bandit', 'Callie', 'Cleo', 'Goliath', 'Socks', 'Salem', 'Luna', 'Garfield', 'Hobbes', 'Tigger', 'Snowball', 'Misty'],
  'Town Dog': ['Buddy', 'Charlie', 'Daisy', 'Lucky', 'Sparky', 'Buster', 'Rex', 'Odie', 'Milo', 'Baxter', 'Pongo', 'Balto'],
  'Town Bunny': ['Bunnicula', 'Skippy', 'Fluffy', 'Muffin', 'Oreo', 'Thumper', 'Mochi', 'Puff', 'Hazel', 'Dusty', 'Roger', 'Lola'],
  'Squire Slime': ['Squire'],
};

// Pet Tamer NPC ------------------------------------------------------------------------
NPC_NAMES['Pet Tamer'] = ['Pearlie', 'Rowan', 'Tamsin', 'Fenn', 'Sable', 'Noor', 'Kai', 'Wren', 'Ilse', 'Bram'];
SHOPS['Pet Tamer'] = [{ id: 'pet_food', price: 10 }, { id: 'pet_forge', price: 50000 }, { id: 'pet_tablet', price: 10000 }, { id: 'cat_license', price: 50000 }, { id: 'dog_license', price: 50000 }, { id: 'bunny_license', price: 50000 }];
NPC_ROLES['Pet Tamer'] = {
  town: true, hairStyle: 1,
  colors: { skin: '#e8c8a0', hair: '#f0f0f0', shirt: '#4a7a8a', pants: '#3a3a4a', shoes: '#2a2a2a', eye: '#3aa0d0' },
  weapon: { kind: 'bonemerang', damage: 16, rate: 45, speed: 9 }, buttons: ['Shop', 'Combine'], shop: 'Pet Tamer',
  condition: (g) => !!g.petEverEquipped,
  lines: ["The great Pet Tamer, at your service. I know more about Pets than anyone.", "Bring me two of the same Light Pet and I'll combine their best qualities.", "Pet Food: never let a companion go hungry.", "A perfect 100% Light Pet? I've only seen one in my life. Keep rolling."],
};
NPC_ARRIVAL_ORDER.push('Pet Tamer');

// Achievements -------------------------------------------------------------------------
const ACHIEVEMENTS = [
  { id: 'first_friend', name: 'First Friend', desc: 'Equip a Regular Pet.' },
  { id: 'let_there_be_light', name: 'Let There Be Light', desc: 'Equip a Light Pet.' },
  { id: 'perfect_roll', name: 'Perfect Roll', desc: 'Obtain a Light Pet with 100% Quality.' },
  { id: 'combined', name: 'Better Together', desc: 'Combine two Light Pets at the Pet Tamer.' },
  { id: 'tamed', name: 'Tamed', desc: 'The Pet Tamer moves in.' },
  { id: 'best_friends', name: 'Best Friends', desc: 'Pet a Town Cat, Dog and Bunny.' },
  { id: 'squire', name: 'Knighted', desc: 'Recruit the Squire Slime.' },
  { id: 'chonk', name: 'Maximum Chonk', desc: 'Reach 80 Tartar Sauce stacks.' },
  { id: 'cheated_death', name: 'Cold Comfort', desc: 'Survive fatal damage with the Frozen Crown.' },
  { id: 'rage', name: 'Seeing Red', desc: 'Enrage with the Suspicious Grinning Eye.' },
  { id: 'vein_miner', name: 'Vein Miner', desc: 'Mine 100 ore with the Writhing Remains.' },
  { id: 'pet_chef', name: 'Pet Chef', desc: 'Craft a Pet at the Pet Forge.' },
  { id: 'connoisseur', name: 'Connoisseur', desc: 'Hold 1000 Pet Food at once.' },
  { id: 'full_house', name: 'Full House', desc: 'Have a Regular Pet, a Light Pet and a Town Pet buff at the same time.' },
  { id: 'hoarder', name: 'Collector', desc: 'Own 10 different Pets.' },
  { id: 'fisherman', name: 'Gone Fishing', desc: 'Catch something with a fishing pole.' },
  { id: 'disarmed', name: 'Disarmed', desc: 'Knock the weapon out of an armed zombie\'s hands.' },
  { id: 'grazer', name: 'Grazer', desc: 'Graze 100 bullets.' },
  { id: 'spell_breaker', name: 'Spell Breaker', desc: 'Defeat Rumia.' },
  { id: 'egg_hunt', name: 'Egg Hunt', desc: 'Defeat Lepus.' },
];

function buildPetIcons() {
  const mk = (look) => { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.translate(8, 9); drawPetShape(x, look, 0); return c; };
  for (const id in PETS) Sprites.icons[id] = mk(PETS[id].look);
  for (const id in LIGHT_PETS) Sprites.icons[id] = mk(Object.assign({ accent: '#fff' }, LIGHT_PETS[id].look));
}

// Quality helpers ----------------------------------------------------------------------
function rollLightPet(stack) {
  const def = LIGHT_PETS[stack.id];
  if (!def || stack.quality) return stack;
  stack.quality = def.stats.map(s => Math.floor(Math.random() * (s.max + 1)));
  return stack;
}
function lightPetQualityPct(stack) {
  const def = LIGHT_PETS[stack.id]; if (!def || !stack.quality) return 0;
  let sum = 0, max = 0; def.stats.forEach((s, i) => { sum += stack.quality[i]; max += s.max; });
  return max ? sum / max : 0;
}
function qualityColor(pct, t = 0) {
  if (pct >= 0.999) { const k = 0.5 + 0.5 * Math.sin(t * 0.08); return mixColor('#ffb0d0', '#a0d0ff', k); }
  if (pct >= 0.66) return '#ffd040';
  if (pct >= 0.33) return '#7090ff';
  return '#b0b0b0';
}
function lightPetStat(stack, i) { const s = LIGHT_PETS[stack.id].stats[i]; return s.base + s.per * ((stack.quality || [])[i] || 0); }
function lightPetTooltip(stack, t) {
  const def = LIGHT_PETS[stack.id]; if (!def) return [];
  const pct = lightPetQualityPct(stack);
  const lines = [{ t: `Quality: ${Math.round(pct * 100)}%`, c: qualityColor(pct, t) }];
  def.stats.forEach((s, i) => { const q = (stack.quality || [])[i] || 0; const v = s.base + s.per * q; lines.push({ t: `+${+v.toFixed(2)}${s.fmt} ${s.label}  (${q}/${s.max})`, c: qualityColor(q / s.max, t) }); });
  return lines;
}

// The pet system ----------------------------------------------------------------------
class PetSystem {
  constructor(game) {
    this.g = game;
    this.reset();
  }
  reset() {
    this.pet = null; this.light = null; this.townBuff = null;
    this.cooldown = 0; this.cdMax = 0; this.stacks = 0; this.stackTimer = 0; this.combat = 0; this.oocTimer = 0;
    this.pool = 0; this.poolTimer = 0; this.shield = 0; this.shieldTimer = 0; this.hardened = 0; this.hardenTimer = 0;
    this.enrage = 0; this.rage = 0; this.frozen = 0; this.immune = 0; this.alert = 0; this.lavaTimer = 600; this.hpBonus = 0;
    this.jumpStacks = 0; this.jumpTimer = 0; this.explosionCd = 0; this.decoy = null; this.decoyCd = 0;
    this.veinMined = 0; this.petted = new Set(); this.owned = new Set();
    this.companion = { x: 0, y: 0, vx: 0, vy: 0, hop: 0, dir: 1 }; this.lightPos = { x: 0, y: 0 };
  }
  get def() { return this.pet ? PETS[this.pet.id] : null; }
  get lightDef() { return this.light ? LIGHT_PETS[this.light.id] : null; }
  lightStat(key) {
    let v = 0; const d = this.lightDef;
    if (d) d.stats.forEach((s, i) => { if (s.key === key) v += lightPetStat(this.light, i); });
    return v;
  }
  townStat(key) { const b = this.townBuff && TOWN_PET_BUFFS[this.townBuff]; return b && b.stats[key] || 0; }
  stat(key) { return this.lightStat(key) + this.townStat(key); }
  get haste() { return this.stat('haste') / 100; }
  get petDamageMult() { return 1 + this.stat('petDamage') / 100; }
  get petHealMult() { return 1 + this.stat('petHealing') / 100; }
  get petShieldMult() { return 1 + this.stat('petShielding') / 100; }
  miningFortune() { let f = this.stat('miningFortune') + this.stat('globalFortune') * 0.5; if (this.pet && this.pet.id === 'probe') f += this.g.player.defense * 0.35 + 8; return f; }
  harvestFortune() { return this.stat('harvestFortune') + this.stat('globalFortune') * 0.5; }

  // Player stat modifiers, recomputed every tick
  mods() {
    const p = this.g.player, id = this.pet && this.pet.id;
    const m = { move: 1 + this.stat('moveSpeed') / 100, accel: 1 + this.stat('accel') / 100, jump: 1, defAdd: this.stat('defense'), defMult: 1 + this.stat('defensePct') / 100,
      dmg: 1 + this.stat('damage') / 100, crit: this.stat('crit'), kbResist: 0, kbMult: 1 + this.stat('meleeKb') / 100, useTime: 1, pickup: 0, place: 0, regenAdd: 0, regenTime: 1, fallBonus: 0,
      autoJump: false, lavaImmune: false, dr: this.stat('dr') / 100, rangedDmg: 1 + this.stat('rangedDamage') / 100, projSpeed: 1 + this.stat('projSpeed') / 100 };
    const hpFrac = p.maxHp ? p.hp / p.maxHp : 1;
    switch (id) {
      case 'bone_rattle': m.regenTime = 1.2; if (this.oocTimer >= 60 * 12) m.regenAdd = 15; else if (this.oocTimer >= 60 * 5) m.regenAdd = 4; break;
      case 'seaweed': m.defMult *= 1.07; m.kbResist = 0.55; m.move *= 0.88; break;
      case 'lightning_carrot': m.move *= 1.10 * 1.05; break;
      case 'carrot': m.move *= 1 + 0.005 * this.jumpStacks; m.jump *= 1 + 0.02 * this.jumpStacks; break;
      case 'eaters_bone': m.move *= 1.11; m.jump *= 1.65; m.autoJump = true; if (p.tileY > this.g.world.surfaceLine) m.fallBonus = 30; break;
      case 'eye_bone': m.pickup = 6.25 * TILE; m.place = 2; if (this.g.openChest || this.g.shop) m.defAdd += 10; break;
      case 'hell_cake': m.lavaImmune = this.lavaTimer > 0; if (p.inLava) { m.defAdd += 10; m.move *= 1.15; } break;
      case 'tartar_sauce': m.useTime /= 1 + 0.0023 * this.stacks; m.dmg *= 1 + 0.00125 * this.stacks; m.defMult *= 1 + 0.0012 * this.stacks; m.move *= 1 - 0.0018 * this.stacks; break;
      case 'probe': m.defMult *= 1.15; break;
      case 'lizard_egg': m.kbResist = 0.6; if (hpFrac < 0.55) { m.defAdd += 10; m.move *= 1.7; m.jump *= 0.5; } if (this.decoyBoost > 0) { m.move *= 1.5; m.accel *= 2; } break;
      case 'bamboo_leaf': m.useTime /= 1.035; if (this.alert > 0) { const n = Math.min(6, this.g.enemies.filter(e => dist(e.cx, e.cy, p.cx, p.cy) < 50 * TILE).length); m.useTime /= 1 + 0.015 * n; m.move *= 1 + 0.03 * n; } break;
      case 'grinning_eye': if (this.enrage > 0) { m.dmg *= 1 + 0.9 * this.rage / 100; m.move *= 1 + 0.5 * this.rage / 100; m.crit += 0.18 * this.rage; } break;
    }
    if (id === 'lightning_carrot') m.dmg *= 1 + 0.2 * (m.move - 1);
    return m;
  }

  equipRegular(stack) { this.pet = stack; if (stack) { this.g.petEverEquipped = true; this.owned.add(stack.id); this.unlock('first_friend'); this.stacks = 0; this.combat = 0; } }
  equipLight(stack) { this.light = stack; if (stack) { rollLightPet(stack); this.g.petEverEquipped = true; this.owned.add(stack.id); this.unlock('let_there_be_light'); if (lightPetQualityPct(stack) >= 0.999) this.unlock('perfect_roll'); } }

  unlock(id) {
    const g = this.g;
    if (!g.achievements) g.achievements = new Set(JSON.parse(localStorage.getItem('terraria_achievements') || '[]'));
    if (g.achievements.has(id)) return;
    g.achievements.add(id);
    try { localStorage.setItem('terraria_achievements', JSON.stringify([...g.achievements])); } catch (e) {}
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (a) { g.toasts = g.toasts || []; g.toasts.push({ text: `Achievement: ${a.name}`, sub: a.desc, life: 60 * 5 }); Audio_.play('levelup'); }
  }

  useAbility() {
    const p = this.g.player, id = this.pet && this.pet.id;
    if (!id || !PETS[id].ability || p.dead) return;
    if (this.cooldown > 0) { this.g.message(`${PETS[id].ability.name} is on cooldown (${Math.ceil(this.cooldown / 60)}s).`, '#ff8080'); return; }
    switch (id) {
      case 'seaweed': this.hardened = 6; this.hardenTimer = 60 * 15; this.g.message('Shell hardened!', '#60e080'); break;
      case 'grinning_eye': this.startEnrage(); break;
      case 'lizard_egg': {
        const loss = Math.min(p.hp - 1, Math.floor(p.maxHp * 0.1)); p.hp -= loss; this.g.addDamageText(p.cx, p.y, loss, '#ff5050');
        p.invuln = 120; this.decoyBoost = 120;
        this.decoy = { x: p.x, y: p.y, w: 20, h: 42, hp: Math.floor(p.maxHp * 0.5), life: 60 * 30, born: 0, heal: loss };
        this.g.message('Decoy Tail dropped!', '#e0c060'); break;
      }
      case 'bamboo_leaf': this.alert = 60 * 8; this.g.message('Alert mode!', '#60e080'); break;
      default: return;
    }
    this.cdMax = PETS[id].ability.cd; this.cooldown = this.cdMax;
    Audio_.play('craft');
  }

  startEnrage() {
    const p = this.g.player;
    this.rage = p.defense; this.enrage = 60 * 30;
    this.addShield(Math.round(this.rage * 0.5), 60 * 10);
    if (p.hp > p.maxHp * 0.5) p.hp = Math.floor(p.maxHp * 0.5);
    this.g.message('ENRAGED!', '#ff4040'); this.unlock('rage');
    this.cdMax = PETS.grinning_eye.ability.cd; this.cooldown = this.cdMax;
  }

  addShield(amount, ticks) { amount = Math.round(amount * this.petShieldMult); if (amount > this.shield) { this.shield = amount; } this.shieldTimer = Math.max(this.shieldTimer, ticks); }
  heal(amount) {
    const p = this.g.player; amount *= this.petHealMult;
    const whole = Math.floor(amount), frac = amount - whole; const n = whole + (Math.random() < frac ? 1 : 0);
    if (n > 0 && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + n); this.g.addDamageText(p.cx, p.y, '+' + n, '#40e060'); }
    return n;
  }

  // ---- hooks ---------------------------------------------------------------------------
  tick() {
    const g = this.g, p = g.player, id = this.pet && this.pet.id, w = g.world;
    if (this.cooldown > 0) this.cooldown -= 1 + this.haste;
    if (this.stackCd > 0) this.stackCd--;
    if (this.cooldown < 0) this.cooldown = 0;
    if (this.combat > 0) this.combat--;
    this.oocTimer = this.combat > 0 ? 0 : this.oocTimer + 1;
    if (this.shieldTimer > 0 && --this.shieldTimer === 0) this.shield = 0;
    if (this.hardenTimer > 0 && --this.hardenTimer === 0) this.hardened = 0;
    if (this.alert > 0) this.alert--;
    if (this.explosionCd > 0) this.explosionCd -= 1 + this.haste;
    if (this.decoyBoost > 0) this.decoyBoost--;
    if (this.jumpTimer > 0 && --this.jumpTimer === 0) this.jumpStacks = 0;
    // light pet max-life bonus
    const wantHp = this.lightStat('maxHp');
    if (wantHp !== this.hpBonus) { p.maxHp += wantHp - this.hpBonus; p.hp = Math.min(p.hp, p.maxHp); this.hpBonus = wantHp; }
    if (p.countItem('pet_food') >= 1000) this.unlock('connoisseur');
    if (this.pet && this.light && this.townBuff) this.unlock('full_house');
    if (this.owned.size >= 10) this.unlock('hoarder');
    // enrage
    if (this.enrage > 0) { this.enrage--; if (p.hp > p.maxHp * 0.5) p.hp = Math.floor(p.maxHp * 0.5); if (this.enrage === 0) g.message('The rage subsides.', '#c0c0ff'); }
    else if (id === 'grinning_eye' && p.hp < p.maxHp * 0.5 && this.combat > 0 && this.combatFor >= 60 * 5 && this.cooldown <= 0 && !p.dead) this.startEnrage();
    this.combatFor = this.combat > 0 ? (this.combatFor || 0) + 1 : 0;
    // frozen crown state
    if (this.frozen > 0) {
      this.frozen--; p.vx = 0; p.vy = 0; p.invuln = Math.max(p.invuln, 2);
      for (const e of g.enemies) if (dist(e.cx, e.cy, p.cx, p.cy) < 30 * TILE) e.applyDebuff('Slow', 2, e.isBoss ? 2 : 10);
      if (this.frozen === 0) { for (const e of g.enemies) if (dist(e.cx, e.cy, p.cx, p.cy) < 30 * TILE) e.hit(Math.round(200 * this.petDamageMult), p.cx, 6, g); p.invuln = 90; g.message('The ice shatters!', '#a0e0ff'); }
    }
    // pet-specific ticks
    if (id === 'brain_jar') { const max = Math.floor(p.maxHp * 0.3); if (this.pool < max && ++this.poolTimer >= 165) { this.poolTimer = 0; this.pool++; } if (this.pool > max) this.pool = max; }
    if (id === 'tartar_sauce') { if (this.combat <= 0 && this.stacks > 0 && ++this.stackTimer >= 20) { this.stackTimer = 0; this.stacks--; } }
    if (id === 'hell_cake') { if (p.inLava) this.lavaTimer = Math.max(0, this.lavaTimer - 1); else this.lavaTimer = Math.min(600, this.lavaTimer + 1); }
    if (id === 'bone_rattle' && this.oocTimer >= 60 * 12 && this.shield <= 0) { this.shield = Math.max(1, Math.round(p.maxHp * 0.05 * this.petShieldMult)); this.shieldTimer = 1e9; this.boneShield = true; }
    if (id !== 'bone_rattle' && this.boneShield) { this.boneShield = false; this.shield = 0; this.shieldTimer = 0; }
    // decoy tail
    if (this.decoy) {
      const d = this.decoy; d.life--; d.born++;
      for (const e of g.enemies) if (e.x < d.x + d.w && e.x + e.w > d.x && e.y < d.y + d.h && e.y + e.h > d.y && w.time % 30 === 0) d.hp -= e.damage;
      if (d.hp <= 0 || d.life <= 0) this.decoy = null;
      else if (d.born > 300 && dist(p.cx, p.cy, d.x + 10, d.y + 21) < 30) { this.heal(d.heal); this.cooldown = Math.max(0, this.cooldown * 0.5); this.decoy = null; g.message('Tail recovered.', '#60e080'); }
    }
    this.updateCompanion();
    // light pet emits light
    if (this.light) { const L = this.lightDef.light; g.lighting.extraLights.push({ x: this.lightPos.x / TILE, y: this.lightPos.y / TILE, r: L[0], g: L[1], b: L[2] }); }
  }

  onJumpFull() { if (this.pet && this.pet.id === 'carrot') { this.jumpStacks = Math.min(10, this.jumpStacks + 1); this.jumpTimer = 60 * 4; } }
  onEnemyTouch(e) { if (this.pet && this.pet.id === 'lightning_carrot') e.applyDebuff('Slow', 45, 3); }

  // player takes damage: returns modified amount (0 = fully absorbed)
  onPlayerDamaged(amount, attacker, isProjectile) {
    const p = this.g.player;
    this.combat = 60 * 8;
    if (this.frozen > 0 || this.immune > 0) return 0;
    if (this.hardened > 0) {
      this.hardened--; amount = Math.round(amount * 0.93); p.noKnockback = true;
      if (attacker && attacker.hit) attacker.hit(Math.round(amount * (isProjectile ? 0.6 : 1.1) * this.petDamageMult), p.cx, 2, this.g);
    }
    if (this.enrage > 0) p.zeroDefense = true;
    amount = Math.round(amount * (1 - this.stat('dr') / 100));
    if (this.shield > 0) { const a = Math.min(this.shield, amount); this.shield -= a; amount -= a; if (this.boneShield) { this.boneShield = false; this.shield = 0; this.shieldTimer = 0; } this.g.addDamageText(p.cx, p.y - 10, `-${a} shield`, '#80c0ff'); }
    if (this.pet && this.pet.id === 'seaweed' && this.hardened === 0 && this.hardenTimer > 0) this.hardenTimer = 0;
    return amount;
  }
  // fatal damage: return true if death is prevented
  onFatal() {
    const p = this.g.player;
    if (this.pet && this.pet.id === 'frozen_crown' && this.cooldown <= 0) {
      p.hp = Math.min(p.maxHp, 100); this.frozen = 60 * 5; this.addShield(50, 60 * 7); p.invuln = 60 * 5 + 90;
      this.cdMax = 60 * 120; this.cooldown = this.cdMax; this.g.message('Frozen in time!', '#a0e0ff'); this.unlock('cheated_death');
      return true;
    }
    return false;
  }

  // player hits an enemy: modify the hit before it lands. Returns {damage, kb, crit}
  onHit(e, damage, kb, crit, melee, ranged) {
    const id = this.pet && this.pet.id;
    this.combat = Math.max(this.combat, 60 * 5);
    if (ranged) damage = Math.round(damage * this.mods().rangedDmg);
    if (id === 'spider_egg') { if (e.hasDebuff('Poisoned')) { damage = Math.round(damage * 1.08 + 5); kb *= 1.25; if (!crit && Math.random() < 0.06) crit = true; } e.applyDebuff('Poisoned', 60 * 10); }
    if (id === 'toy_sled') { e.applyDebuff('Frostburn', 60 * 5); e.applyDebuff('Slow', 60 * 3, 0.3); }
    if (id === 'tartar_sauce' && melee && (this.stackCd || 0) <= 0) { this.stacks = Math.min(80, this.stacks + 2); this.stackCd = 12; if (this.stacks >= 80) this.unlock('chonk'); }
    return { damage, kb, crit };
  }
  // after damage was dealt
  afterHit(e, real) {
    const id = this.pet && this.pet.id, g = this.g;
    if (id === 'brain_jar' && this.pool > 0) { const want = real * 0.035; const got = Math.min(want, this.pool); this.heal(got); this.pool = Math.max(0, this.pool - got); }
    if (id === 'fuse_wire' && this.explosionCd <= 0) {
      this.explosionCd = 120;
      const x = e.cx, y = e.cy;
      for (let i = 0; i < 14; i++) g.particles.push(new Particle(x, y, rand(-4, 4), rand(-4, 2), choose(['#ff8020', '#ffe060']), 30, 3));
      for (const o of g.enemies) if (Math.abs(o.cx - x) < 100 && Math.abs(o.cy - y) < 100) { const d = Math.round(real * 0.6 * this.petDamageMult) + Math.min(15, Math.round(o.defense * 0.5)); o.hit(d, x, 1.7 * 4, g); }
      Audio_.play('kill');
    }
    if (id === 'mud_bud' && Math.random() < 0.15) {
      g.projectiles.push(new Projectile(e.cx + rand(-24, 24), e.cy + rand(-24, 24), rand(-1, 1), rand(-1, 0.5), { kind: 'spore', damage: Math.round((real * 0.7 + 15) * this.petDamageMult), friendly: true, owner: g.player, knockback: 0.4, pierce: 20 }));
    }
  }
  onKill(e, coins) {
    const id = this.pet && this.pet.id;
    if (id === 'dog_whistle') { coins = Math.round(coins * 1.1); if (e.isBoss) coins += 700; }
    return coins;
  }
  // mining a tile: returns extra drops [{id,count}] and may mine neighbours
  onMine(tx, ty, tileId, dropId) {
    const id = this.pet && this.pet.id, g = this.g, w = g.world, out = [];
    const isOre = [T.COPPER, T.IRON, T.SILVER, T.GOLD, T.GEM, T.HELLSTONE].includes(tileId);
    if (id === 'dirtiest_block') { const c = tileId === T.DIRT || tileId === T.GRASS ? 8.5 : 3; const n = Math.floor(c) + (Math.random() < c % 1 ? 1 : 0); g.player.coins += n; }
    if (id === 'amber_mosquito' && isOre && Math.random() < 0.175) {
      const r = Math.random(); out.push({ id: r < 0.4 ? 'copper_ore' : r < 0.7 ? 'iron_ore' : r < 0.88 ? 'silver_ore' : r < 0.97 ? 'gold_ore' : 'diamond', count: 1 });
    }
    if (id === 'writhing_remains' && isOre) {
      const r = Math.random() < 0.25 ? 2 : 1;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (!dx && !dy) continue;
        if (w.get(tx + dx, ty + dy) === tileId) { w.setTile(tx + dx, ty + dy, T.AIR); g.dropItem((tx + dx) * TILE + 8, (ty + dy) * TILE + 8, dropId, 1); g.tileParticles(tx + dx, ty + dy, TILES[tileId].mapColor, 3); this.veinMined++; }
      }
      if (this.veinMined >= 100) this.unlock('vein_miner');
    }
    // fortune: extra drops
    if (dropId) {
      const f = isOre ? this.miningFortune() : (tileId === T.TREE || tileId === T.TREETOP || tileId === T.PLANT || tileId === T.CACTUS ? this.harvestFortune() : 0);
      if (f > 0) { const extra = Math.floor(f / 100) + (Math.random() < (f % 100) / 100 ? 1 : 0); if (extra > 0) out.push({ id: dropId, count: extra }); }
    }
    return out;
  }
  miningSpeedMult(tileId) { if (this.pet && this.pet.id === 'writhing_remains' && ![T.COPPER, T.IRON, T.SILVER, T.GOLD, T.GEM, T.HELLSTONE].includes(tileId)) return 1.2; return 1; }

  // ---- companion sprite -------------------------------------------------------------
  updateCompanion() {
    const p = this.g.player, w = this.g.world, c = this.companion, look = this.def && this.def.look;
    if (look) {
      const targetX = p.cx - p.dir * 26;
      if (Math.abs(c.x - targetX) > 14 * TILE || Math.abs(c.y - p.cy) > 14 * TILE) { c.x = targetX; c.y = p.y + 20; }
      if (look.fly) { c.x += (targetX - c.x) * 0.08; c.y += (p.y - 6 + Math.sin(w.time * 0.06) * 3 - c.y) * 0.08; }
      else {
        const dx = targetX - c.x;
        if (Math.abs(dx) > 10) { c.x += Math.sign(dx) * Math.min(Math.abs(dx), 2.6); c.dir = Math.sign(dx); c.hop = (c.hop + 0.25) % (Math.PI * 2); } else c.hop = 0;
        // ground follow: settle on the first solid tile below
        let ty = Math.floor((c.y + 12) / TILE); const tx = Math.floor(c.x / TILE);
        if (w.isSolidAt(tx, ty)) { while (ty > 0 && w.isSolidAt(tx, ty - 1)) ty--; c.y = ty * TILE - 12; }
        else { let k = 0; while (k < 8 && !w.isSolidAt(tx, ty + 1)) { ty++; k++; } c.y += Math.min(6, Math.max(0, ty * TILE - 12 - c.y)); }
      }
    }
    if (this.light) { const lp = this.lightPos; const tx = p.cx + p.dir * -30 - 10, ty = p.y - 20 + Math.sin(w.time * 0.05) * 4; if (Math.abs(lp.x - tx) > 12 * TILE) { lp.x = tx; lp.y = ty; } lp.x += (tx - lp.x) * 0.06; lp.y += (ty - lp.y) * 0.06; }
  }

  draw(ctx, camX, camY) {
    const t = this.g.world.time;
    if (this.def) {
      const look = this.def.look, c = this.companion;
      const x = snap(c.x - camX), y = snap(c.y - camY + (look.legs ? Math.abs(Math.sin(c.hop)) * -3 : 0));
      ctx.save(); ctx.translate(x, y); if (c.dir < 0) ctx.scale(-1, 1);
      drawPetShape(ctx, look, t);
      ctx.restore();
    }
    if (this.light) {
      const look = this.lightDef.look, lp = this.lightPos;
      const x = snap(lp.x - camX), y = snap(lp.y - camY);
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = look.color; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(0, 0, 10 + Math.sin(t * 0.1) * 2, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      drawPetShape(ctx, Object.assign({ shape: look.shape, color: look.color, accent: '#ffffff', fly: true }, {}), t);
      ctx.restore();
    }
    if (this.decoy) { const d = this.decoy; ctx.globalAlpha = 0.8; ctx.fillStyle = '#c0a040'; ctx.fillRect(snap(d.x - camX + 2), snap(d.y - camY + 22), 16, 8); ctx.fillRect(snap(d.x - camX + 14), snap(d.y - camY + 18), 8, 6); ctx.globalAlpha = 1; }
    if (this.frozen > 0) { const p = this.g.player; ctx.fillStyle = 'rgba(160,220,255,0.55)'; ctx.fillRect(snap(p.x - camX - 4), snap(p.y - camY - 4), p.w + 8, p.h + 8); }
  }
}

function drawPetShape(ctx, look, t) {
  const c = look.color, a = look.accent || '#fff';
  switch (look.shape) {
    case 'bunny': ctx.fillStyle = c; ctx.fillRect(-6, -6, 12, 10); ctx.fillRect(-4, -12, 3, 7); ctx.fillRect(1, -12, 3, 7); ctx.fillStyle = a; ctx.fillRect(-3, -11, 1, 5); ctx.fillRect(2, -11, 1, 5); ctx.fillStyle = '#000'; ctx.fillRect(3, -4, 2, 2); break;
    case 'box': ctx.fillStyle = c; ctx.fillRect(-7, -8, 14, 12); ctx.fillStyle = a; ctx.fillRect(-7, -8, 14, 3); ctx.fillStyle = '#000'; ctx.fillRect(3, -4, 2, 2); ctx.fillRect(-1, -4, 2, 2); break;
    case 'blob': ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -3, 8, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = a; ctx.fillRect(-2, -8, 4, 2); ctx.fillStyle = '#000'; ctx.fillRect(3, -4, 2, 2); break;
    case 'orb': ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = a; ctx.beginPath(); ctx.arc(-2, -2, 2.5, 0, Math.PI * 2); ctx.fill(); break;
    case 'skull': ctx.fillStyle = c; ctx.fillRect(-7, -8, 14, 12); ctx.fillRect(-5, 4, 10, 3); ctx.fillStyle = a; ctx.fillRect(-5, -5, 4, 4); ctx.fillRect(1, -5, 4, 4); ctx.fillRect(-3, 4, 1, 3); ctx.fillRect(0, 4, 1, 3); ctx.fillRect(3, 4, 1, 3); break;
    case 'worm': for (let i = 0; i < 4; i++) { ctx.fillStyle = i ? c : a; ctx.beginPath(); ctx.arc(-i * 5, Math.sin(t * 0.15 + i) * 2, 4 - i * 0.5, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = '#000'; ctx.fillRect(1, -2, 2, 2); break;
    case 'spider': ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -3, 7, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { const s = Math.sin(t * 0.3 + i) * 2; ctx.beginPath(); ctx.moveTo(-3 + i * 2, -3); ctx.lineTo(-9 + i * 6, 3 + s); ctx.stroke(); } ctx.fillStyle = a; ctx.fillRect(3, -5, 2, 2); ctx.fillRect(0, -5, 2, 2); break;
    case 'dog': ctx.fillStyle = c; ctx.fillRect(-8, -6, 12, 8); ctx.fillRect(2, -10, 8, 8); ctx.fillRect(-7, 2, 3, 4); ctx.fillRect(1, 2, 3, 4); ctx.fillStyle = a; ctx.fillRect(4, -6, 6, 3); ctx.fillStyle = '#4a3020'; ctx.fillRect(2, -11, 3, 5); ctx.fillStyle = '#000'; ctx.fillRect(7, -9, 2, 2); break;
    case 'eye': ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -2, 8, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = a; ctx.beginPath(); ctx.arc(2, -2, 3, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(3, -2, 1.5, 0, Math.PI * 2); ctx.fill(); break;
    case 'lantern': ctx.fillStyle = '#3a3a42'; ctx.fillRect(-4, -10, 8, 2); ctx.fillRect(-4, 6, 8, 2); ctx.fillStyle = c; ctx.fillRect(-4, -8, 8, 14); ctx.fillStyle = '#fff8d0'; ctx.fillRect(-2, -6, 3, 5); break;
    case 'fairy': ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.6; const f = Math.sin(t * 0.4) * 3; ctx.beginPath(); ctx.ellipse(-6, -2 - f, 5, 3, -0.4, 0, Math.PI * 2); ctx.ellipse(6, -2 - f, 5, 3, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; break;
    case 'heart': ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(-8, -1); ctx.arc(-4, -3, 4.5, Math.PI, 0); ctx.arc(4, -3, 4.5, Math.PI, 0); ctx.lineTo(8, -1); ctx.closePath(); ctx.fill(); break;
    case 'wisp': ctx.fillStyle = c; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-5, 5 + Math.sin(t * 0.2) * 2, 3, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(-2, -2, 1, 2); ctx.fillRect(2, -2, 1, 2); break;
    case 'gem': ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, -2); ctx.lineTo(0, 9); ctx.lineTo(-7, -2); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-2, -5, 2, 4); break;
    default: ctx.fillStyle = c; ctx.fillRect(-6, -6, 12, 12);
  }
}

// Town pets: small animals that live in town; "Pet" them for a permanent buff
class TownPet extends Entity {
  constructor(x, y, role, name) {
    super(x, y, 16, 14);
    this.role = role; this.name = name; this.isTown = true; this.isPet = true; this.hp = 250; this.maxHp = 250;
    this.dir = 1; this.aiTimer = 0; this.moving = 0; this.hop = 0; this.talking = false; this.home = null; this.def = { town: true, buttons: ['Pet'], lines: [], colors: { skin: '#000', hair: '#000', shirt: '#000', pants: '#000', shoes: '#000', eye: '#000' } };
    this.emote = null; this.emoteLife = 0; this.leaveAt = 0; this.shopItems = null; this.hairStyle = 0; this.invuln = 0; this.hitFlash = 0;
  }
  get title() { return `${this.name} the ${this.role}`; }
  hit() {}
  update(world, game) {
    if (--this.aiTimer <= 0) { this.aiTimer = randInt(60, 240); const r = Math.random(); this.moving = r < 0.5 ? 0 : (r < 0.75 ? 1 : -1); if (this.moving) this.dir = this.moving; const anchor = world.spawnX * TILE; if (Math.abs(this.cx - anchor) > 40 * TILE) { this.moving = anchor < this.cx ? -1 : 1; this.dir = this.moving; } }
    if (this.talking) { this.moving = 0; this.dir = game.player.cx < this.cx ? -1 : 1; }
    if (this.moving) { const ax = Math.floor((this.cx + this.dir * 12) / TILE), fy = Math.floor((this.y + this.h + 2) / TILE); let ground = false; for (let k = 0; k < 3; k++) if (world.isSolidAt(ax, fy + k)) ground = true; if (!ground) this.moving = 0; else this.vx = lerp(this.vx, this.moving * 1.0, 0.15); this.hop = (this.hop + 0.2) % (Math.PI * 2); } else { this.vx *= 0.8; this.hop = 0; }
    this.updateLiquidState(world); this.applyGravity(); this.canStep = true; this.moveAndCollide(world);
    if (this.collidedX && this.onGround) this.vy = -4;
    if (this.inLava || this.y > (world.surfaceLine + 80) * TILE) { this.x = world.spawnX * TILE; this.y = (world.spawnY - 4) * TILE; this.vy = 0; }
    if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null;
  }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.y + this.h - camY - 4 - Math.abs(Math.sin(this.hop)) * 2);
    ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1);
    const look = { 'Town Cat': { shape: 'dog', color: '#e0a060', accent: '#f8e8d0' }, 'Town Dog': { shape: 'dog', color: '#c89060', accent: '#f0e0d0' }, 'Town Bunny': { shape: 'bunny', color: '#f0f0f0', accent: '#ffb0c0', legs: true }, 'Squire Slime': { shape: 'blob', color: '#4070e0', accent: '#c8703a' } }[this.role];
    drawPetShape(ctx, look, this.hop * 10);
    if (this.role === 'Squire Slime') { ctx.fillStyle = '#c8703a'; ctx.fillRect(-7, -12, 14, 4); }
    ctx.restore();
  }
}
