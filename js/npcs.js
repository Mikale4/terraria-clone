// ---------------------------------------------------------------------------
// Town NPCs: roles, name lists (from the Terraria wiki), shops, dialogue,
// arrival conditions. Housing rules live in world.js (checkHouse).
// ---------------------------------------------------------------------------
'use strict';

// Ranged / explosive items used by the Arms Dealer and Demolitionist
defItem('musket_ball', { name: 'Musket Ball', ammo: true, damage: 7, max: 999, tooltip: 'Ammunition for guns' });
defItem('flintlock_pistol', { name: 'Flintlock Pistol', ranged: true, ammo: 'musket_ball', damage: 10, useTime: 11, knockback: 2, max: 1, rarity: 1, icon: { kind: 'pistol', mat: 'iron' }, tooltip: 'Uses Musket Balls' });
defItem('grenade', { name: 'Grenade', consumable: true, max: 99, tooltip: 'A small explosion that will not destroy tiles', explosive: { radius: 3, damage: 60, tiles: false } });
defItem('dynamite', { name: 'Dynamite', consumable: true, max: 99, rarity: 1, tooltip: 'A large explosion that destroys most tiles', explosive: { radius: 7, damage: 175, tiles: true } });
ITEMS.bomb.explosive = { radius: 4.5, damage: 60, tiles: true };
Object.assign(ITEM_VALUES, { musket_ball: 7, flintlock_pistol: 50000, grenade: 75, dynamite: 2000 });
for (const id of ['musket_ball', 'flintlock_pistol', 'grenade', 'dynamite']) ITEMS[id].value = ITEM_VALUES[id];

// Name lists ------------------------------------------------------------------
const NPC_NAMES = {
  Guide: ['Andrew', 'Asher', 'Bradley', 'Brandon', 'Brett', 'Brian', 'Cody', 'Cole', 'Colin', 'Connor', 'Daniel', 'Dylan', 'Garrett', 'Harley', 'Jack', 'Jacob', 'Jake', 'Jan', 'Jeff', 'Jeffrey', 'Joe', 'Kevin', 'Kyle', 'Levi', 'Logan', 'Luke', 'Marty', 'Maxwell', 'Ryan', 'Scott', 'Seth', 'Steve', 'Tanner', 'Trent', 'Wyatt', 'Zach'],
  Merchant: ['Alfred', 'Barney', 'Calvin', 'Edmund', 'Edwin', 'Eugene', 'Finn', 'Frank', 'Frederick', 'Gilbert', 'Gus', 'Harold', 'Howard', 'Humphrey', 'Isaac', 'Joseph', 'Kristian', 'Louis', 'Milton', 'Mortimer', 'Ralph', 'Seymour', 'Walter', 'Wilbur'],
  'Traveling Merchant': ['Abraham', 'Aedan', 'Aphraim', 'Bohemas', 'Eladon', 'Gallius', 'Llewellyn', 'Mercer', 'Rawleigh', 'Riley', 'Romeo', 'Shipton', 'Willy'],
  Nurse: ['Abigail', 'Allison', 'Amy', 'Caitlin', 'Carly', 'Claire', 'Emily', 'Emma', 'Hannah', 'Heather', 'Helen', 'Holly', 'Jenna', 'Kaitlin', 'Kaitlyn', 'Katelyn', 'Katherine', 'Kathryn', 'Katie', 'Kayla', 'Lisa', 'Lorraine', 'Madeline', 'Molly'],
  Demolitionist: ['Bazdin', 'Beldin', 'Boften', 'Darur', 'Dias', 'Dolbere', 'Dolgen', 'Dolgrim', 'Duerthen', 'Durim', 'Fikod', 'Garval', 'Gimli', 'Gimut', 'Jarut', 'Morthal', 'Norkas', 'Norsun', 'Oten', 'Ovbere', 'Tordak', 'Urist'],
  Dryad: ['Alalia', 'Alura', 'Ariella', 'Caelia', 'Calista', 'Celestia', 'Chryseis', 'Elysia', 'Emerenta', 'Evvie', 'Faye', 'Felicitae', 'Isis', 'Lunette', 'Nata', 'Nissa', 'Rosalva', 'Shea', 'Tania', 'Tatiana', 'Xylia'],
  'Arms Dealer': ['Andre', 'Brimst', 'Bronson', 'Dante', 'Darius', 'Darnell', 'Darryl', 'DeAndre', 'Demetrius', 'DeShawn', 'Dominique', 'Jalen', 'Jamal', 'Malik', 'Marquis', 'Maurice', 'Reginald', 'Terrance', 'Terrell', 'Tony', 'Trevon', 'Tyrone', 'Willie', 'Xavier'],
};

// Shops (prices in copper) --------------------------------------------------
const SHOPS = {
  Merchant: [
    { id: 'torch', price: 50 }, { id: 'lesser_healing', price: 300 }, { id: 'mushroom', price: 20 }, { id: 'wood', price: 20 },
    { id: 'platform', price: 10 }, { id: 'copper_pickaxe', price: 500 }, { id: 'copper_axe', price: 500 }, { id: 'lantern', price: 400 },
    { id: 'glass', price: 10 }, { id: 'campfire', price: 100 }, { id: 'tombstone', price: 100 }, { id: 'iron_bar', price: 300 }, { id: 'chair', price: 30 }, { id: 'table', price: 60 },
  ],
  Demolitionist: [{ id: 'grenade', price: 75 }, { id: 'bomb', price: 300 }, { id: 'dynamite', price: 2000 }],
  Dryad: [{ id: 'acorn', price: 10 }, { id: 'mushroom', price: 20 }, { id: 'glow_mushroom', price: 40 }, { id: 'cactus', price: 15 }, { id: 'sand', price: 5 }, { id: 'snow', price: 5 }, { id: 'planks', price: 10 }],
  'Arms Dealer': [{ id: 'musket_ball', price: 7 }, { id: 'flintlock_pistol', price: 50000 }],
};
const TRAVELING_POOL = [
  { id: 'diamond', price: 3000 }, { id: 'gold_bar', price: 2000 }, { id: 'lantern', price: 1000 }, { id: 'hook', price: 8000 }, { id: 'suspicious_eye', price: 5000 },
  { id: 'stone_brick', price: 15 }, { id: 'glass_wall', price: 10 }, { id: 'campfire', price: 200 }, { id: 'lesser_healing', price: 400 }, { id: 'dynamite', price: 3000 },
  { id: 'copper_broadsword', price: 800 }, { id: 'iron_broadsword', price: 1500 }, { id: 'silver_axe', price: 1500 }, { id: 'gold_pickaxe', price: 2500 },
  { id: 'gold_helmet', price: 3000 }, { id: 'silver_chainmail', price: 4500 }, { id: 'musket_ball', price: 10 }, { id: 'obsidian', price: 200 }, { id: 'life_crystal', price: 20000 },
];

// Role definitions ------------------------------------------------------------
const NPC_ROLES = {
  Guide: {
    town: true, hairStyle: 1,
    colors: { skin: '#f2c6a0', hair: '#b0782a', shirt: '#6a8a5a', pants: '#5a4a3a', shoes: '#3a2a1a', eye: '#3a8ad0' },
    weapon: { kind: 'arrow', damage: 8, rate: 40, speed: 9 }, buttons: ['Help', 'Crafting'],
    lines: [
      "I'm here to give you advice on what to do next. Talk to me anytime you get stuck.",
      "You should start by chopping down some trees. Wood is the foundation of everything.",
      "Once you have ten wood, craft a Work Bench. It opens up lots of new recipes.",
      "Other people will move in if you build them a house: a room of at least 60 tiles with walls you placed, a door, a chair, a table and a torch.",
      "Slimes drop Gel. Mix it with wood at any time to craft torches. Caves are dark!",
      "When night falls, monsters get bolder. A wooden shelter with walls and a door keeps them out.",
      "Once you've gathered 50 silver, a Merchant will want to move in. Then a Nurse, once you have more than 100 life.",
      "Ore veins glitter in the stone underground. Smelt them in a Furnace, then forge on an Anvil.",
      "Life Crystals are hidden deep below. Each one makes you tougher.",
      "Use the housing menu in your inventory to check whether a room is valid and to assign who lives where.",
      "The underworld at the very bottom is full of lava. Hellstone forges the strongest gear.",
    ],
  },
  Merchant: {
    town: true, hairStyle: 0,
    colors: { skin: '#f2c6a0', hair: '#d8d8d8', shirt: '#6a5a4a', pants: '#3a3a3a', shoes: '#2a2a2a', eye: '#4a4a4a' },
    weapon: { kind: 'knife', damage: 12, rate: 30, speed: 8 }, buttons: ['Shop'], shop: 'Merchant',
    condition: (g) => g.player.coins >= 5000,
    lines: ["Have a look at my wares. Coins talk, friend.", "Torches, potions, lanterns... everything an adventurer needs, for a modest fee.", "Sell me your junk and I'll give you a fifth of what it's worth. That's business!", "Business is slow at night. Something about the zombies.", "The Guide sends you? He never buys anything.", "Did you say gold coins? I'll be right with you."],
  },
  Nurse: {
    town: true, hairStyle: 1,
    colors: { skin: '#f2c6a0', hair: '#e8d060', shirt: '#f4f4f4', pants: '#f0c8d0', shoes: '#ffffff', eye: '#3a8ad0' },
    weapon: { kind: 'syringe', damage: 0, rate: 90, speed: 0 }, buttons: ['Heal'],
    condition: (g) => g.player.maxHp > 100 && g.npcs.some(n => n.role === 'Merchant'),
    lines: ["Turn your head and cough.", "That's not the place to stick that. I'll patch you up for a few coins.", "Show me where it hurts. Then show me your coins.", "I can heal you and cure any ailment, but it isn't free.", "Stop being such a baby! I've seen worse."],
  },
  Demolitionist: {
    town: true, hairStyle: 0,
    colors: { skin: '#e8b890', hair: '#6a3a1a', shirt: '#a02020', pants: '#3a3a3a', shoes: '#2a2a2a', eye: '#3a3a3a' },
    weapon: { kind: 'grenade', damage: 30, rate: 70, speed: 6 }, buttons: ['Shop'], shop: 'Demolitionist',
    condition: (g) => g.player.inventory.some(s => s && ITEMS[s.id].explosive) && g.npcs.some(n => n.role === 'Merchant'),
    lines: ["Boom! Everything's better with explosives.", "Don't hold the dynamite too long. Trust me.", "Careful with those bombs, they'll take your walls down too. Grenades won't.", "It's a good day to die! Wait, I mean, to blow things up."],
  },
  Dryad: {
    town: true, hairStyle: 1,
    colors: { skin: '#e8c8a0', hair: '#3aa040', shirt: '#4a8a3a', pants: '#2a6a2a', shoes: '#3a5a2a', eye: '#2a8a4a' },
    weapon: { kind: 'aura', damage: 4, rate: 20, radius: 6 }, buttons: ['Shop'], shop: 'Dryad',
    condition: (g) => !!g.world.bossDefeated,
    lines: ["The sanctity of this place has been fouled.", "Be safe; the trees are watching over you.", "Plant acorns. A forest is the best neighbor.", "The Eye is gone, but darker things still wait below."],
  },
  'Arms Dealer': {
    town: true, hairStyle: 0,
    colors: { skin: '#c89060', hair: '#202020', shirt: '#3a5a3a', pants: '#2a3a6a', shoes: '#2a2a2a', eye: '#2a2a2a' },
    weapon: { kind: 'bullet', damage: 14, rate: 22, speed: 12 }, buttons: ['Shop'], shop: 'Arms Dealer',
    condition: (g) => g.player.inventory.some(s => s && (s.id === 'musket_ball' || s.id === 'flintlock_pistol')),
    lines: ["I see you're eyeing the Flintlock. Fine choice, if you've got the coin.", "Musket balls: cheap, loud, effective.", "Keep your powder dry and your aim true.", "Bullets aren't free, you know."],
  },
  'Traveling Merchant': {
    town: false, hairStyle: 0,
    colors: { skin: '#f2c6a0', hair: '#909090', shirt: '#6a3a8a', pants: '#4a2a5a', shoes: '#2a2a2a', eye: '#4a4a4a' },
    weapon: { kind: 'bullet', damage: 16, rate: 26, speed: 12 }, buttons: ['Shop'], shop: 'traveling',
    lines: ["Rare goods from distant lands, but only until evening!", "I never stay long. Buy while you can.", "You won't find these anywhere else, I promise."],
  },
};
const NPC_ARRIVAL_ORDER = ['Merchant', 'Nurse', 'Demolitionist', 'Dryad', 'Arms Dealer'];

function npcName(role) { return choose(NPC_NAMES[role] || ['Bob']); }
function makeTravelingShop() {
  const pool = TRAVELING_POOL.slice();
  const n = randInt(5, 8), out = [];
  // Accessories+: the Traveling Merchant is guaranteed to sell an accessory
  const accs = pool.filter(e => ITEMS[e.id] && ITEMS[e.id].accessory);
  if (accs.length) { const pick = accs[Math.floor(Math.random() * accs.length)]; out.push(pick); pool.splice(pool.indexOf(pick), 1); }
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
