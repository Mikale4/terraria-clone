// ---------------------------------------------------------------------------
// Item definitions & crafting recipes
// ---------------------------------------------------------------------------
'use strict';

const ITEMS = {};
function defItem(id, props) {
  ITEMS[id] = Object.assign({
    id, name: id, max: 999, tile: null, wall: null, tool: null, power: 0, damage: 0, knockback: 4,
    useTime: 20, sword: null, consumable: false, tooltip: null, rarity: 0, icon: null, material: false,
    heal: 0, placeable: false
  }, props);
  if (ITEMS[id].tile != null || ITEMS[id].wall != null) ITEMS[id].placeable = true;
}

// Blocks
defItem('dirt', { name: 'Dirt Block', tile: T.DIRT });
defItem('stone', { name: 'Stone Block', tile: T.STONE });
defItem('wood', { name: 'Wood', tile: T.WOOD, tooltip: 'Can be placed or used for crafting' });
defItem('planks', { name: 'Wood Planks', tile: T.WOODPLANKS });
defItem('sand', { name: 'Sand Block', tile: T.SAND });
defItem('snow', { name: 'Snow Block', tile: T.SNOW });
defItem('ice', { name: 'Ice Block', tile: T.ICE });
defItem('clay', { name: 'Clay Block', tile: T.CLAY });
defItem('mud', { name: 'Mud Block', tile: T.MUD });
defItem('ash', { name: 'Ash Block', tile: T.ASH });
defItem('obsidian', { name: 'Obsidian', tile: T.OBSIDIAN });
defItem('sandstone', { name: 'Sandstone Block', tile: T.SANDSTONE });
defItem('copper_ore', { name: 'Copper Ore', tile: T.COPPER });
defItem('iron_ore', { name: 'Iron Ore', tile: T.IRON });
defItem('silver_ore', { name: 'Silver Ore', tile: T.SILVER });
defItem('gold_ore', { name: 'Gold Ore', tile: T.GOLD });
defItem('hellstone', { name: 'Hellstone', tile: T.HELLSTONE, rarity: 2 });
defItem('diamond', { name: 'Diamond', material: true, rarity: 2, tooltip: 'A sparkling gem' });
defItem('stone_brick', { name: 'Gray Brick', tile: T.STONEBRICK });
defItem('glass', { name: 'Glass', tile: T.GLASS });
defItem('torch', { name: 'Torch', tile: T.TORCH, tooltip: 'Provides light', useTime: 10 });
defItem('lantern', { name: 'Lantern', tile: T.LANTERN, tooltip: 'Bright, hangs from ceilings' });
defItem('campfire', { name: 'Campfire', tile: T.CAMPFIRE, tooltip: 'Regenerates life while nearby' });
defItem('workbench', { name: 'Work Bench', tile: T.WORKBENCH, tooltip: 'Used for basic crafting' });
defItem('platform', { name: 'Wood Platform', tile: T.PLATFORM, tooltip: 'Hold S to drop through' });
defItem('chest', { name: 'Chest', tile: T.CHEST, tooltip: 'Stores items' });
defItem('furnace', { name: 'Furnace', tile: T.FURNACE, tooltip: 'Used for smelting ore' });
defItem('anvil', { name: 'Iron Anvil', tile: T.ANVIL, tooltip: 'Used to craft metal items' });
defItem('door', { name: 'Wooden Door', tile: T.DOOR_C, tooltip: 'Right click to open/close' });
defItem('table', { name: 'Wooden Table', tile: T.TABLE });
defItem('chair', { name: 'Wooden Chair', tile: T.CHAIR });
defItem('cactus', { name: 'Cactus', tile: T.CACTUS, material: true });
defItem('acorn', { name: 'Acorn', tile: T.SAPLING, tooltip: 'Plant on grass to grow a tree' });
defItem('cobweb', { name: 'Cobweb', tile: T.COBWEB });
defItem('glow_mushroom', { name: 'Glowing Mushroom', tile: T.MUSHROOM_GLOW, heal: 15, consumable: true, tooltip: 'Restores 15 life' });

// Walls
defItem('wood_wall', { name: 'Wood Wall', wall: W.WOOD });
defItem('planks_wall', { name: 'Planked Wall', wall: W.PLANKS });
defItem('stone_brick_wall', { name: 'Gray Brick Wall', wall: W.STONEBRICK });
defItem('dirt_wall', { name: 'Dirt Wall', wall: W.DIRT_SAFE });
defItem('glass_wall', { name: 'Glass Wall', wall: W.GLASS });

// Materials
defItem('gel', { name: 'Gel', material: true, tooltip: 'Both tasty and flammable' });
defItem('copper_bar', { name: 'Copper Bar', material: true });
defItem('iron_bar', { name: 'Iron Bar', material: true });
defItem('silver_bar', { name: 'Silver Bar', material: true });
defItem('gold_bar', { name: 'Gold Bar', material: true, rarity: 1 });
defItem('lens', { name: 'Lens', material: true });
defItem('rotten_chunk', { name: 'Rotten Chunk', material: true });
defItem('mushroom', { name: 'Mushroom', consumable: true, heal: 15, tooltip: 'Restores 15 life', max: 99 });
defItem('life_crystal', { name: 'Life Crystal', consumable: true, max: 99, rarity: 2, tooltip: 'Permanently increases maximum life by 20' });
defItem('lesser_healing', { name: 'Lesser Healing Potion', consumable: true, heal: 50, max: 30, tooltip: 'Restores 50 life' });
defItem('bomb', { name: 'Bomb', consumable: true, max: 99, tooltip: 'Explodes and destroys tiles' });
defItem('hook', { name: 'Grappling Hook', tool: 'hook', max: 1, rarity: 1, tooltip: 'Press E to grapple' });
defItem('suspicious_eye', { name: 'Suspicious Looking Eye', consumable: true, max: 20, rarity: 1, tooltip: 'Summons the Eye of Cthulhu (use at night)' });
defItem('bottle', { name: 'Bottle', material: true });

// Tools ---------------------------------------------------------------------
function defTool(id, name, kind, mat, power, useTime, dmg, rarity = 0) {
  defItem(id, { name, tool: kind, power, useTime, damage: dmg, max: 1, icon: { kind, mat }, rarity,
    tooltip: kind === 'pick' ? `${power}% pickaxe power` : kind === 'axe' ? `${power}% axe power` : `${power}% hammer power` });
}
defTool('copper_pickaxe', 'Copper Pickaxe', 'pick', 'copper', 35, 23, 4);
defTool('copper_axe', 'Copper Axe', 'axe', 'copper', 35, 21, 3);
defTool('wooden_hammer', 'Wooden Hammer', 'hammer', 'wood', 25, 25, 2);
defTool('copper_hammer', 'Copper Hammer', 'hammer', 'copper', 35, 23, 4);
defTool('iron_pickaxe', 'Iron Pickaxe', 'pick', 'iron', 40, 19, 5);
defTool('iron_axe', 'Iron Axe', 'axe', 'iron', 45, 19, 5);
defTool('iron_hammer', 'Iron Hammer', 'hammer', 'iron', 45, 21, 6);
defTool('silver_pickaxe', 'Silver Pickaxe', 'pick', 'silver', 45, 17, 6);
defTool('silver_axe', 'Silver Axe', 'axe', 'silver', 50, 18, 6);
defTool('gold_pickaxe', 'Gold Pickaxe', 'pick', 'gold', 55, 15, 6, 1);
defTool('gold_axe', 'Gold Axe', 'axe', 'gold', 55, 16, 7, 1);
defTool('gold_hammer', 'Gold Hammer', 'hammer', 'gold', 55, 18, 7, 1);
defTool('hellstone_pickaxe', 'Molten Pickaxe', 'pick', 'hellstone', 100, 11, 12, 3);

function defSword(id, name, mat, dmg, useTime, kind = 'broad', rarity = 0) {
  defItem(id, { name, sword: kind, damage: dmg, useTime, max: 1, icon: { kind: kind === 'short' ? 'shortsword' : 'sword', mat }, rarity,
    knockback: kind === 'short' ? 3 : 5, tooltip: `${dmg} melee damage` });
}
defSword('copper_shortsword', 'Copper Shortsword', 'copper', 5, 13, 'short');
defSword('wooden_sword', 'Wooden Sword', 'wood', 7, 21);
defSword('copper_broadsword', 'Copper Broadsword', 'copper', 8, 21);
defSword('iron_broadsword', 'Iron Broadsword', 'iron', 10, 21);
defSword('silver_broadsword', 'Silver Broadsword', 'silver', 11, 20);
defSword('gold_broadsword', 'Gold Broadsword', 'gold', 13, 20, 'broad', 1);
defSword('hellstone_sword', 'Fiery Greatsword', 'hellstone', 36, 30, 'broad', 3);

// Materials for icon rendering
const MATERIALS = {
  wood:      { M: '#c89058', m: '#9a6a3a', d: '#6a4520' },
  copper:    { M: '#f2a86e', m: '#c8703a', d: '#8a4a22' },
  iron:      { M: '#e6e6ee', m: '#a2a4b4', d: '#5e6070' },
  silver:    { M: '#ffffff', m: '#cfd6e6', d: '#8a94aa' },
  gold:      { M: '#fff0a0', m: '#e8b830', d: '#a07818' },
  hellstone: { M: '#ffb060', m: '#e04a20', d: '#7a2010' },
};

// Crafting recipes -----------------------------------------------------------
// station: null (by hand), 'workbench', 'furnace', 'anvil'
const RECIPES = [
  { result: 'workbench', count: 1, station: null, ing: [['wood', 10]] },
  { result: 'platform', count: 2, station: null, ing: [['wood', 1]] },
  { result: 'torch', count: 3, station: null, ing: [['wood', 1], ['gel', 1]] },
  { result: 'wood_wall', count: 4, station: 'workbench', ing: [['wood', 1]] },
  { result: 'planks', count: 1, station: 'workbench', ing: [['wood', 1]] },
  { result: 'planks_wall', count: 4, station: 'workbench', ing: [['planks', 1]] },
  { result: 'dirt_wall', count: 4, station: 'workbench', ing: [['dirt', 1]] },
  { result: 'wooden_sword', count: 1, station: 'workbench', ing: [['wood', 7]] },
  { result: 'wooden_hammer', count: 1, station: 'workbench', ing: [['wood', 8]] },
  { result: 'chest', count: 1, station: 'workbench', ing: [['wood', 8], ['iron_bar', 2]] },
  { result: 'door', count: 1, station: 'workbench', ing: [['wood', 6]] },
  { result: 'table', count: 1, station: 'workbench', ing: [['wood', 8]] },
  { result: 'chair', count: 1, station: 'workbench', ing: [['wood', 4]] },
  { result: 'furnace', count: 1, station: 'workbench', ing: [['stone', 20], ['wood', 4], ['torch', 3]] },
  { result: 'campfire', count: 1, station: null, ing: [['wood', 10], ['torch', 5]] },
  { result: 'lantern', count: 1, station: 'workbench', ing: [['torch', 1], ['glass', 1], ['iron_bar', 1]] },
  { result: 'anvil', count: 1, station: 'workbench', ing: [['iron_bar', 5]] },
  { result: 'bottle', count: 1, station: 'furnace', ing: [['glass', 1]] },
  { result: 'lesser_healing', count: 2, station: 'workbench', ing: [['bottle', 2], ['mushroom', 1], ['gel', 2]] },
  { result: 'bomb', count: 1, station: 'workbench', ing: [['gel', 5], ['stone', 5], ['torch', 1]] },
  { result: 'copper_bar', count: 1, station: 'furnace', ing: [['copper_ore', 3]] },
  { result: 'iron_bar', count: 1, station: 'furnace', ing: [['iron_ore', 3]] },
  { result: 'silver_bar', count: 1, station: 'furnace', ing: [['silver_ore', 4]] },
  { result: 'gold_bar', count: 1, station: 'furnace', ing: [['gold_ore', 4]] },
  { result: 'glass', count: 1, station: 'furnace', ing: [['sand', 2]] },
  { result: 'glass_wall', count: 4, station: 'workbench', ing: [['glass', 1]] },
  { result: 'stone_brick', count: 1, station: 'furnace', ing: [['stone', 2]] },
  { result: 'stone_brick_wall', count: 4, station: 'workbench', ing: [['stone_brick', 1]] },
  { result: 'sandstone', count: 1, station: 'furnace', ing: [['sand', 2]] },
  { result: 'copper_broadsword', count: 1, station: 'anvil', ing: [['copper_bar', 8]] },
  { result: 'copper_hammer', count: 1, station: 'anvil', ing: [['copper_bar', 10], ['wood', 3]] },
  { result: 'iron_pickaxe', count: 1, station: 'anvil', ing: [['iron_bar', 12], ['wood', 3]] },
  { result: 'iron_axe', count: 1, station: 'anvil', ing: [['iron_bar', 9], ['wood', 3]] },
  { result: 'iron_hammer', count: 1, station: 'anvil', ing: [['iron_bar', 10], ['wood', 3]] },
  { result: 'iron_broadsword', count: 1, station: 'anvil', ing: [['iron_bar', 8]] },
  { result: 'silver_pickaxe', count: 1, station: 'anvil', ing: [['silver_bar', 12], ['wood', 3]] },
  { result: 'silver_axe', count: 1, station: 'anvil', ing: [['silver_bar', 9], ['wood', 3]] },
  { result: 'silver_broadsword', count: 1, station: 'anvil', ing: [['silver_bar', 8]] },
  { result: 'gold_pickaxe', count: 1, station: 'anvil', ing: [['gold_bar', 12], ['wood', 3]] },
  { result: 'gold_axe', count: 1, station: 'anvil', ing: [['gold_bar', 9], ['wood', 3]] },
  { result: 'gold_hammer', count: 1, station: 'anvil', ing: [['gold_bar', 10], ['wood', 3]] },
  { result: 'gold_broadsword', count: 1, station: 'anvil', ing: [['gold_bar', 8]] },
  { result: 'hellstone_pickaxe', count: 1, station: 'anvil', ing: [['hellstone', 20], ['obsidian', 10]] },
  { result: 'hellstone_sword', count: 1, station: 'anvil', ing: [['hellstone', 20], ['obsidian', 10]] },
  { result: 'hook', count: 1, station: 'anvil', ing: [['iron_bar', 6], ['gel', 10]] },
  { result: 'suspicious_eye', count: 1, station: 'workbench', ing: [['lens', 6]] },
];

const RARITY_COLORS = ['#ffffff', '#9090ff', '#78dc78', '#ff8c50', '#ff5050'];

