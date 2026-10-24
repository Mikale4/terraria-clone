// ---------------------------------------------------------------------------
// Tile & wall definitions
// ---------------------------------------------------------------------------
'use strict';

const T = {
  AIR: 0, DIRT: 1, GRASS: 2, STONE: 3, TREE: 4, LEAVES: 5, WOOD: 6, SAND: 7, SNOW: 8, ICE: 9,
  CLAY: 10, COPPER: 11, IRON: 12, SILVER: 13, GOLD: 14, TORCH: 15, WORKBENCH: 16, PLATFORM: 17,
  CHEST: 18, CACTUS: 19, MUD: 20, BEDROCK: 21, FURNACE: 22, ANVIL: 23, PLANT: 24, STONEBRICK: 25,
  SAPLING: 26, GLASS: 27, GEM: 28, DOOR_C: 29, DOOR_O: 30, TABLE: 31, CHAIR: 32, LIFECRYSTAL: 33,
  COBWEB: 34, ASH: 35, HELLSTONE: 36, OBSIDIAN: 37, TREETOP: 38, SANDSTONE: 39, MUSHROOM_GLOW: 40,
  WOODPLANKS: 41, CAMPFIRE: 42, LANTERN: 43, TOMBSTONE: 44
};

const TILES = [];
function defTile(id, props) {
  TILES[id] = Object.assign({
    id, name: 'Tile', solid: true, platform: false, hp: 50, tool: 'pick', minPower: 0,
    drop: null, light: null, color: '#000', mapColor: null, furniture: null, transparent: false,
    hurt: 0, slippery: false, gravity: false, attachTo: null, walkThrough: false
  }, props);
  if (!TILES[id].mapColor) TILES[id].mapColor = TILES[id].color;
}

defTile(T.AIR, { name: 'Air', solid: false, hp: 0, color: null });
defTile(T.DIRT, { name: 'Dirt Block', hp: 50, drop: 'dirt', color: '#8a5a2b', mapColor: '#8a5a2b' });
defTile(T.GRASS, { name: 'Grass', hp: 50, drop: 'dirt', color: '#8a5a2b', mapColor: '#2ea33a' });
defTile(T.STONE, { name: 'Stone Block', hp: 100, drop: 'stone', color: '#7e7e86', mapColor: '#6d6d75' });
defTile(T.TREE, { name: 'Tree', hp: 100, tool: 'axe', drop: 'wood', color: '#6e4a2a', solid: false, transparent: true });
defTile(T.LEAVES, { name: 'Leaves', hp: 1, tool: 'any', solid: false, drop: null, color: '#2f8a2b', transparent: true });
defTile(T.TREETOP, { name: 'Tree Top', hp: 1, tool: 'any', solid: false, drop: null, color: '#2f8a2b', transparent: true });
defTile(T.WOOD, { name: 'Wood', hp: 50, drop: 'wood', color: '#a8794b' });
defTile(T.WOODPLANKS, { name: 'Wood Planks', hp: 50, drop: 'planks', color: '#c09060' });
defTile(T.SAND, { name: 'Sand Block', hp: 50, drop: 'sand', color: '#d9c88a', gravity: true });
defTile(T.SNOW, { name: 'Snow Block', hp: 50, drop: 'snow', color: '#e8f0f8' });
defTile(T.ICE, { name: 'Ice Block', hp: 70, drop: 'ice', color: '#a8d8f0', slippery: true, transparent: true });
defTile(T.CLAY, { name: 'Clay Block', hp: 50, drop: 'clay', color: '#b86a3a' });
defTile(T.MUD, { name: 'Mud Block', hp: 50, drop: 'mud', color: '#5a4030' });
defTile(T.COPPER, { name: 'Copper Ore', hp: 120, drop: 'copper_ore', color: '#7e7e86', mapColor: '#c87533' });
defTile(T.IRON, { name: 'Iron Ore', hp: 130, drop: 'iron_ore', color: '#7e7e86', mapColor: '#9aa0b0' });
defTile(T.SILVER, { name: 'Silver Ore', hp: 140, drop: 'silver_ore', color: '#7e7e86', mapColor: '#d8e0ee' });
defTile(T.GOLD, { name: 'Gold Ore', hp: 150, drop: 'gold_ore', color: '#7e7e86', mapColor: '#e8c030' });
defTile(T.GEM, { name: 'Diamond', hp: 140, drop: 'diamond', color: '#7e7e86', mapColor: '#8ef0ff', light: [0.15, 0.3, 0.35] });
defTile(T.TORCH, { name: 'Torch', hp: 1, tool: 'any', solid: false, drop: 'torch', color: '#ffb040', light: [1.0, 0.85, 0.55], transparent: true });
defTile(T.LANTERN, { name: 'Lantern', hp: 1, tool: 'pick', solid: false, drop: 'lantern', color: '#ffd080', light: [1.0, 0.95, 0.7], transparent: true });
defTile(T.CAMPFIRE, { name: 'Campfire', hp: 1, tool: 'pick', solid: false, drop: 'campfire', color: '#ff8030', light: [1.0, 0.6, 0.3], furniture: { w: 3, h: 1 }, transparent: true });
defTile(T.WORKBENCH, { name: 'Work Bench', hp: 1, solid: false, platform: true, drop: 'workbench', color: '#a8794b', furniture: { w: 2, h: 1 }, transparent: true });
defTile(T.PLATFORM, { name: 'Wood Platform', hp: 1, solid: false, platform: true, drop: 'platform', color: '#b08050', transparent: true });
defTile(T.CHEST, { name: 'Chest', hp: 1, solid: false, drop: 'chest', color: '#a8794b', furniture: { w: 2, h: 2 }, transparent: true });
defTile(T.CACTUS, { name: 'Cactus', hp: 40, tool: 'axe', solid: false, drop: 'cactus', color: '#3f9e3f', transparent: true });
defTile(T.BEDROCK, { name: 'Bedrock', hp: Infinity, drop: null, color: '#2a2a30' });
defTile(T.FURNACE, { name: 'Furnace', hp: 1, solid: false, drop: 'furnace', color: '#6a6a70', furniture: { w: 3, h: 2 }, light: [0.7, 0.4, 0.2], transparent: true });
defTile(T.ANVIL, { name: 'Iron Anvil', hp: 1, solid: false, drop: 'anvil', color: '#5a5a66', furniture: { w: 2, h: 1 }, transparent: true });
defTile(T.PLANT, { name: 'Plant', hp: 1, tool: 'any', solid: false, drop: null, color: '#3fb040', transparent: true, attachTo: 'below' });
defTile(T.MUSHROOM_GLOW, { name: 'Glowing Mushroom', hp: 1, tool: 'any', solid: false, drop: 'glow_mushroom', color: '#60c0ff', transparent: true, light: [0.2, 0.5, 0.8], attachTo: 'below' });
defTile(T.STONEBRICK, { name: 'Stone Brick', hp: 100, drop: 'stone_brick', color: '#8a8a92' });
defTile(T.SANDSTONE, { name: 'Sandstone', hp: 100, drop: 'sandstone', color: '#c8a868' });
defTile(T.SAPLING, { name: 'Sapling', hp: 1, tool: 'any', solid: false, drop: 'acorn', color: '#5a9a3a', transparent: true, attachTo: 'below' });
defTile(T.GLASS, { name: 'Glass', hp: 50, drop: 'glass', color: '#c8e8ff', transparent: true });
defTile(T.DOOR_C, { name: 'Wooden Door', hp: 1, solid: true, drop: 'door', color: '#a8794b', furniture: { w: 1, h: 3 }, transparent: true });
defTile(T.DOOR_O, { name: 'Open Door', hp: 1, solid: false, drop: 'door', color: '#a8794b', furniture: { w: 1, h: 3 }, transparent: true });
defTile(T.TABLE, { name: 'Wooden Table', hp: 1, solid: false, platform: true, drop: 'table', color: '#a8794b', furniture: { w: 3, h: 2 }, transparent: true });
defTile(T.CHAIR, { name: 'Wooden Chair', hp: 1, solid: false, drop: 'chair', color: '#a8794b', furniture: { w: 1, h: 2 }, transparent: true });
defTile(T.LIFECRYSTAL, { name: 'Life Crystal', hp: 1, solid: false, drop: 'life_crystal', color: '#ff4a8a', light: [0.6, 0.15, 0.35], transparent: true });
defTile(T.COBWEB, { name: 'Cobweb', hp: 1, tool: 'any', solid: false, drop: 'cobweb', color: '#dcdcdc', transparent: true, walkThrough: true });
defTile(T.ASH, { name: 'Ash Block', hp: 60, drop: 'ash', color: '#4a4048' });
defTile(T.HELLSTONE, { name: 'Hellstone', hp: 200, minPower: 55, drop: 'hellstone', color: '#4a4048', mapColor: '#ff6020', light: [0.5, 0.15, 0.05] });
defTile(T.TOMBSTONE, { name: 'Tombstone', hp: 1, solid: false, drop: 'tombstone', color: '#8a8a92', furniture: { w: 2, h: 2 }, transparent: true });
defTile(T.OBSIDIAN, { name: 'Obsidian', hp: 150, minPower: 55, drop: 'obsidian', color: '#2a1e3a' });

// Walls ---------------------------------------------------------------------
const W = { NONE: 0, DIRT: 1, STONE: 2, WOOD: 3, STONEBRICK: 4, DIRT_SAFE: 5, SNOW: 6, SAND: 7, GLASS: 8, PLANKS: 9 };
const WALLS = [];
function defWall(id, props) { WALLS[id] = Object.assign({ id, name: 'Wall', drop: null, color: '#000', natural: false }, props); }
defWall(W.NONE, { name: 'None', color: null });
defWall(W.DIRT, { name: 'Dirt Wall', color: '#4a3018', natural: true });
defWall(W.STONE, { name: 'Stone Wall', color: '#3a3a40', natural: true });
defWall(W.WOOD, { name: 'Wood Wall', color: '#6a4a2c', drop: 'wood_wall' });
defWall(W.STONEBRICK, { name: 'Stone Brick Wall', color: '#4a4a52', drop: 'stone_brick_wall' });
defWall(W.DIRT_SAFE, { name: 'Dirt Wall', color: '#4a3018', drop: 'dirt_wall' });
defWall(W.SNOW, { name: 'Snow Wall', color: '#6a7a8a', natural: true });
defWall(W.SAND, { name: 'Sand Wall', color: '#7a6a44', natural: true });
defWall(W.GLASS, { name: 'Glass Wall', color: '#7aa0c0', drop: 'glass_wall' });
defWall(W.PLANKS, { name: 'Planked Wall', color: '#7a5a34', drop: 'planks_wall' });

const BIOME = { FOREST: 0, DESERT: 1, SNOW: 2, JUNGLE: 3 };

function isSolid(id) { return TILES[id].solid; }
function isPlatform(id) { return TILES[id].platform; }
