// ---------------------------------------------------------------------------
// Game mechanics data: coins, item values, armor, modifiers (prefixes), shop,
// death messages, spawn tables. Numbers follow the Terraria wiki.
// ---------------------------------------------------------------------------
'use strict';

const COIN = { copper: 1, silver: 100, gold: 10000, platinum: 1000000 };
defItem('coin_copper', { name: 'Copper Coin', max: 100 });
defItem('coin_silver', { name: 'Silver Coin', max: 100 });
defItem('coin_gold', { name: 'Gold Coin', max: 100, rarity: 1 });
defItem('coin_platinum', { name: 'Platinum Coin', max: 100, rarity: 2 });
defItem('tombstone', { name: 'Tombstone', tile: T.TOMBSTONE, max: 99 });

// Armor: defense values follow Terraria's copper/iron/silver/gold/molten sets
function defArmor(id, name, slot, mat, defense, rarity = 0) {
  defItem(id, { name, armor: slot, defense, max: 1, icon: { kind: slot === 'head' ? 'helmet' : slot === 'body' ? 'chainmail' : 'greaves', mat }, rarity, tooltip: `${defense} defense` });
}
defArmor('copper_helmet', 'Copper Helmet', 'head', 'copper', 1);
defArmor('copper_chainmail', 'Copper Chainmail', 'body', 'copper', 2);
defArmor('copper_greaves', 'Copper Greaves', 'legs', 'copper', 1);
defArmor('iron_helmet', 'Iron Helmet', 'head', 'iron', 2);
defArmor('iron_chainmail', 'Iron Chainmail', 'body', 'iron', 3);
defArmor('iron_greaves', 'Iron Greaves', 'legs', 'iron', 2);
defArmor('silver_helmet', 'Silver Helmet', 'head', 'silver', 3);
defArmor('silver_chainmail', 'Silver Chainmail', 'body', 'silver', 4);
defArmor('silver_greaves', 'Silver Greaves', 'legs', 'silver', 3);
defArmor('gold_helmet', 'Gold Helmet', 'head', 'gold', 4, 1);
defArmor('gold_chainmail', 'Gold Chainmail', 'body', 'gold', 5, 1);
defArmor('gold_greaves', 'Gold Greaves', 'legs', 'gold', 4, 1);
defArmor('molten_helmet', 'Molten Helmet', 'head', 'hellstone', 9, 3);
defArmor('molten_breastplate', 'Molten Breastplate', 'body', 'hellstone', 10, 3);
defArmor('molten_greaves', 'Molten Greaves', 'legs', 'hellstone', 8, 3);
for (const [mat, bar] of [['copper', 'copper_bar'], ['iron', 'iron_bar'], ['silver', 'silver_bar'], ['gold', 'gold_bar']]) {
  RECIPES.push({ result: `${mat}_helmet`, count: 1, station: 'anvil', ing: [[bar, 10]] });
  RECIPES.push({ result: `${mat}_chainmail`, count: 1, station: 'anvil', ing: [[bar, 20]] });
  RECIPES.push({ result: `${mat}_greaves`, count: 1, station: 'anvil', ing: [[bar, 15]] });
}
RECIPES.push({ result: 'molten_helmet', count: 1, station: 'anvil', ing: [['hellstone', 10], ['obsidian', 5]] });
RECIPES.push({ result: 'molten_breastplate', count: 1, station: 'anvil', ing: [['hellstone', 20], ['obsidian', 10]] });
RECIPES.push({ result: 'molten_greaves', count: 1, station: 'anvil', ing: [['hellstone', 15], ['obsidian', 8]] });
RECIPES.push({ result: 'tombstone', count: 1, station: 'workbench', ing: [['stone', 10]] });

// Item values in copper coins (selling returns 1/5 of the value, like Terraria)
const ITEM_VALUES = {
  torch: 50, gel: 5, acorn: 10, copper_ore: 50, iron_ore: 100, silver_ore: 200, gold_ore: 300, hellstone: 500, obsidian: 100, diamond: 3000,
  copper_bar: 150, iron_bar: 300, silver_bar: 600, gold_bar: 900, lens: 50, rotten_chunk: 100, mushroom: 20, glow_mushroom: 30,
  bottle: 20, lesser_healing: 300, life_crystal: 2000, bomb: 300, hook: 4000, suspicious_eye: 1000, cactus: 5, cobweb: 5, glass: 10,
  workbench: 30, furnace: 300, anvil: 500, chest: 100, door: 40, table: 60, chair: 30, campfire: 100, lantern: 400,
  copper_pickaxe: 500, copper_axe: 500, copper_hammer: 500, copper_shortsword: 500, copper_broadsword: 800, wooden_sword: 50, wooden_hammer: 50,
  iron_pickaxe: 1000, iron_axe: 1000, iron_hammer: 1000, iron_broadsword: 1500, silver_pickaxe: 1500, silver_axe: 1500, silver_broadsword: 2000,
  gold_pickaxe: 2500, gold_axe: 2500, gold_hammer: 2500, gold_broadsword: 3000, hellstone_pickaxe: 27000, hellstone_sword: 30000,
  copper_helmet: 750, copper_chainmail: 1500, copper_greaves: 1125, iron_helmet: 1500, iron_chainmail: 3000, iron_greaves: 2250,
  silver_helmet: 2250, silver_chainmail: 4500, silver_greaves: 3375, gold_helmet: 3000, gold_chainmail: 6000, gold_greaves: 4500,
  molten_helmet: 10000, molten_breastplate: 15000, molten_greaves: 12000,
  coin_copper: 1, coin_silver: 100, coin_gold: 10000, coin_platinum: 1000000,
};
for (const id in ITEMS) ITEMS[id].value = ITEM_VALUES[id] || 0;

function formatCoins(copper) {
  copper = Math.max(0, Math.floor(copper));
  const p = Math.floor(copper / COIN.platinum); copper -= p * COIN.platinum;
  const g = Math.floor(copper / COIN.gold); copper -= g * COIN.gold;
  const s = Math.floor(copper / COIN.silver); copper -= s * COIN.silver;
  const parts = [];
  if (p) parts.push({ n: p, id: 'coin_platinum', color: '#dce8ff' });
  if (g) parts.push({ n: g, id: 'coin_gold', color: '#ffd84a' });
  if (s) parts.push({ n: s, id: 'coin_silver', color: '#d8dce8' });
  if (copper || !parts.length) parts.push({ n: copper, id: 'coin_copper', color: '#e08a50' });
  return parts;
}
function coinsToString(copper) { return formatCoins(copper).map(p => `${p.n} ${ITEMS[p.id].name.split(' ')[0].toLowerCase()}`).join(' '); }

// Modifiers (prefixes) for tools and weapons: Terraria's universal + melee prefixes.
const PREFIXES = [
  { name: 'Keen', crit: 3, tier: 1 }, { name: 'Superior', dmg: 10, crit: 3, kb: 10, tier: 2 }, { name: 'Forceful', kb: 15, tier: 1 },
  { name: 'Broken', dmg: -30, kb: -20, tier: -2 }, { name: 'Damaged', dmg: -15, tier: -1 }, { name: 'Shoddy', dmg: -10, kb: -15, tier: -1 },
  { name: 'Hurtful', dmg: 10, tier: 1 }, { name: 'Strong', kb: 15, tier: 1 }, { name: 'Unpleasant', dmg: 5, kb: 5, tier: 1 },
  { name: 'Weak', kb: -20, tier: -1 }, { name: 'Ruthless', dmg: 18, kb: -10, tier: 1 }, { name: 'Godly', dmg: 15, crit: 5, kb: 15, tier: 2 },
  { name: 'Demonic', dmg: 15, crit: 5, tier: 2 }, { name: 'Zealous', crit: 5, tier: 1 },
  { name: 'Legendary', dmg: 15, speed: 10, crit: 5, kb: 15, tier: 2 }, { name: 'Light', speed: 15, tier: 1 }, { name: 'Quick', speed: 10, tier: 1 },
  { name: 'Deadly', dmg: 10, speed: 10, tier: 2 }, { name: 'Savage', dmg: 10, kb: 10, tier: 2 }, { name: 'Dangerous', dmg: 5, crit: 2, tier: 1 },
  { name: 'Sharp', dmg: 15, tier: 1 }, { name: 'Bulky', dmg: 5, speed: -15, kb: 10, tier: 1 }, { name: 'Unhappy', speed: -10, kb: -10, tier: -1 },
  { name: 'Slow', speed: -15, tier: -1 }, { name: 'Sluggish', speed: -20, tier: -2 }, { name: 'Lazy', speed: -8, tier: -1 },
  { name: 'Annoying', dmg: -20, speed: -15, tier: -2 }, { name: 'Nasty', dmg: 5, speed: 10, crit: 2, kb: -10, tier: 1 },
  { name: 'Murderous', dmg: 7, speed: 6, crit: 3, tier: 2 }, { name: 'Terrible', dmg: -15, kb: -13, tier: -2 },
];
function canHavePrefix(id) { const it = ITEMS[id]; return !!(it.tool && it.tool !== 'hook') || !!it.sword; }
function randomPrefix(id) { if (!canHavePrefix(id)) return null; return Math.random() < 0.25 ? null : Math.floor(Math.random() * PREFIXES.length); }
function makeStack(id, count = 1, prefix) { const s = { id, count }; if (prefix === undefined) prefix = randomPrefix(id); if (prefix != null) s.prefix = prefix; return s; }
function itemDisplayName(stack) {
  const it = ITEMS[stack.id];
  if (stack.prefix != null && PREFIXES[stack.prefix]) return `${PREFIXES[stack.prefix].name} ${it.name}`;
  return it.name;
}
// Effective stats for a stack (prefix-adjusted). crit = chance in percent.
function itemStats(stack) {
  const it = ITEMS[stack.id];
  const p = stack.prefix != null ? PREFIXES[stack.prefix] : null;
  return {
    damage: Math.round(it.damage * (1 + (p && p.dmg || 0) / 100)),
    useTime: Math.max(2, Math.round(it.useTime / (1 + (p && p.speed || 0) / 100))),
    knockback: it.knockback * (1 + (p && p.kb || 0) / 100),
    crit: 4 + (p && p.crit || 0),
    prefix: p,
  };
}
function stackValue(stack) {
  const it = ITEMS[stack.id];
  const p = stack.prefix != null ? PREFIXES[stack.prefix] : null;
  const mult = p ? (p.tier >= 2 ? 1.5 : p.tier === 1 ? 1.2 : p.tier === -1 ? 0.8 : 0.6) : 1;
  return Math.floor(it.value * mult);
}

// Merchant shop (prices in copper)
const SHOP = [
  { id: 'torch', price: 50 }, { id: 'lesser_healing', price: 300 }, { id: 'mushroom', price: 20 }, { id: 'bomb', price: 300 },
  { id: 'wood', price: 20 }, { id: 'platform', price: 10 }, { id: 'copper_pickaxe', price: 500 }, { id: 'copper_axe', price: 500 },
  { id: 'lantern', price: 400 }, { id: 'glass', price: 10 }, { id: 'campfire', price: 100 }, { id: 'acorn', price: 10 },
  { id: 'tombstone', price: 100 }, { id: 'iron_bar', price: 300 },
];

// Death messages (Terraria's default lists)
const DEATH_MESSAGES = {
  enemy: ['was slain', 'was eviscerated', 'was murdered', "'s face was torn off", "'s entrails were ripped out", 'was destroyed', "'s skull was crushed",
    'got massacred', 'got impaled', 'was torn in half', 'was decapitated', 'was brutally dissected', "'s body was mangled", 'was turned into a pile of flesh',
    'got snapped in half', 'was cut down the middle', 'was chopped up', "'s meat was ripped off the bone", 'had their head removed'],
  fall: ['fell to their death', "didn't bounce", 'fell victim to gravity'],
  drown: ['forgot to breathe', 'is sleeping with the fish', 'drowned', 'is shark food', 'went under'],
  lava: ['got melted', 'was incinerated', 'tried to swim in lava', 'likes to play in magma'],
  fire: ['was burned to a crisp', 'was set ablaze'],
  explosion: ['was blown up', 'went boom'],
};

// NPC spawn tables: [1/rate, max spawns] per environment (pre-Hardmode forest/desert/snow)
const SPAWN_TABLE = {
  surfaceDay: [600, 5], surfaceNight: [360, 6], underground: [108, 10], cavern: [300, 8], underworld: [240, 9], bloodMoon: [54, 15], boss: [1800, 3],
};
// Coin values dropped by enemies (copper), roughly Terraria's NPC values
const ENEMY_COINS = {
  green_slime: 25, blue_slime: 25, purple_slime: 100, red_slime: 120, ice_slime: 50, sand_slime: 50, lava_slime: 300, mother_slime: 500,
  zombie: 60, skeleton: 250, demon_eye: 75, bat: 90, hell_bat: 350, eye_of_cthulhu: 30000,
};
