// ---------------------------------------------------------------------------
// Biomes (terraria.wiki.gg/wiki/Biomes): Ocean, Jungle, Corruption / Crimson
// (one per world), the Hallow (Hardmode), Glowing Mushroom, the Dungeon,
// Underground Desert / Jungle / Ice / Mushroom, Underground Corruption/Crimson/
// Hallow, corrupted deserts and ice, the Underworld's Ash Forest; mini-biomes
// (Oasis, Granite Cave, Marble Cave, Spider Nest, Bee Hive, Glowing Moss,
// Jungle Temple, Meteorite, Town, Graveyard, Aether/Shimmer) and structures
// (Underground Cabins, Living Trees, Floating Islands, Living Mahogany Trees,
// Jungle Shrines, Ruined Houses, Pyramids, Enchanted Sword Shrines, Mosaics,
// Campsites, Abandoned Minecart Tracks). Tiles, walls, liquids and generation.
// ---------------------------------------------------------------------------
'use strict';

Object.assign(BIOME, { CORRUPTION: 4, CRIMSON: 5, HALLOW: 6, OCEAN: 7, MUSHROOM: 8, ASH: 9 });
const BIOME_NAMES = { 0: 'Forest', 1: 'Desert', 2: 'Snow Biome', 3: 'Jungle', 4: 'The Corruption', 5: 'The Crimson', 6: 'The Hallow', 7: 'Ocean', 8: 'Glowing Mushroom', 9: 'Ash Forest' };

// Tiles ------------------------------------------------------------------------------------
function defBTile(key, props, painter) { const id = nextTileId++; T[key] = id; defTile(id, props); if (painter) TILE_PAINTERS[id] = painter; return id; }
const grassPainter = (top, side, base) => (c, r) => { (TILE_PAINTERS[base] || TILE_PAINTERS[T.DIRT])(c, r); c.fillStyle = top; c.fillRect(0, 0, 16, 3); c.fillStyle = side; for (let i = 0; i < 6; i++) c.fillRect(Math.floor(r() * 16), 2 + Math.floor(r() * 3), 2, 1); };
const stonePainter = (a, b, d) => (c, r) => { c.fillStyle = b; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 9; i++) { c.fillStyle = r() < 0.5 ? a : d; c.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); } c.fillStyle = d; c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); };
const brickPainter = (a, b, d) => (c, r) => { c.fillStyle = b; c.fillRect(0, 0, 16, 16); c.fillStyle = d; c.fillRect(0, 7, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(7, 0, 1, 7); c.fillRect(3, 8, 1, 7); c.fillRect(11, 8, 1, 7); c.fillStyle = a; c.fillRect(0, 0, 16, 1); c.fillRect(0, 8, 16, 1); };
defBTile('JUNGLE_GRASS', { name: 'Jungle Grass', hp: 50, drop: 'mud', color: '#5a4030', mapColor: '#2aa040' }, grassPainter('#3ec050', '#28903a', T.MUD));
defBTile('CORRUPT_GRASS', { name: 'Corrupt Grass', hp: 50, drop: 'dirt', color: '#8a5a2b', mapColor: '#8060c0' }, grassPainter('#9070d8', '#6a48b0', T.DIRT));
defBTile('CRIMSON_GRASS', { name: 'Crimson Grass', hp: 50, drop: 'dirt', color: '#8a5a2b', mapColor: '#c04040' }, grassPainter('#d04848', '#a03030', T.DIRT));
defBTile('HALLOW_GRASS', { name: 'Hallowed Grass', hp: 50, drop: 'dirt', color: '#8a5a2b', mapColor: '#40e0e0' }, grassPainter('#60f0f0', '#e080ff', T.DIRT));
defBTile('MUSHROOM_GRASS', { name: 'Mushroom Grass', hp: 50, drop: 'mud', color: '#5a4030', mapColor: '#4090ff', light: [0.05, 0.15, 0.3] }, grassPainter('#4a9aff', '#2a6ad0', T.MUD));
defBTile('ASH_GRASS', { name: 'Ash Grass', hp: 60, drop: 'ash', color: '#4a4048', mapColor: '#a04020' }, grassPainter('#c05020', '#803010', T.ASH));
defBTile('EBONSTONE', { name: 'Ebonstone', hp: 130, minPower: 55, drop: 'ebonstone', color: '#4a3a5a', mapColor: '#4a3a5a' }, stonePainter('#6a5a7a', '#4a3a5a', '#2a1a3a'));
defBTile('CRIMSTONE', { name: 'Crimstone', hp: 130, minPower: 55, drop: 'crimstone', color: '#6a2a2a', mapColor: '#6a2a2a' }, stonePainter('#8a4040', '#6a2a2a', '#3a1010'));
defBTile('PEARLSTONE', { name: 'Pearlstone', hp: 130, minPower: 55, drop: 'pearlstone', color: '#c8b0d8', mapColor: '#c8b0d8' }, stonePainter('#f0e0ff', '#c8b0d8', '#9080a8'));
defBTile('EBONSAND', { name: 'Ebonsand', hp: 50, drop: 'ebonsand', color: '#6a5a7a', mapColor: '#6a5a7a', gravity: true }, (c) => { c.fillStyle = '#6a5a7a'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#7a6a8a'; for (let i = 0; i < 12; i++) c.fillRect((i * 5) % 16, (i * 7) % 16, 1, 1); });
defBTile('CRIMSAND', { name: 'Crimsand', hp: 50, drop: 'crimsand', color: '#8a5050', mapColor: '#8a5050', gravity: true }, (c) => { c.fillStyle = '#8a5050'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#a06060'; for (let i = 0; i < 12; i++) c.fillRect((i * 5) % 16, (i * 7) % 16, 1, 1); });
defBTile('PEARLSAND', { name: 'Pearlsand', hp: 50, drop: 'pearlsand', color: '#e8d8f0', mapColor: '#e8d8f0', gravity: true }, (c) => { c.fillStyle = '#e8d8f0'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#ffffff'; for (let i = 0; i < 12; i++) c.fillRect((i * 5) % 16, (i * 7) % 16, 1, 1); });
defBTile('CORRUPT_ICE', { name: 'Purple Ice', hp: 70, drop: 'ice', color: '#8a70c0', mapColor: '#8a70c0', slippery: true, transparent: true }, (c) => { c.fillStyle = 'rgba(138,112,192,0.85)'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(200,180,255,0.6)'; c.fillRect(2, 2, 6, 2); });
defBTile('CRIMSON_ICE', { name: 'Red Ice', hp: 70, drop: 'ice', color: '#c07080', mapColor: '#c07080', slippery: true, transparent: true }, (c) => { c.fillStyle = 'rgba(192,112,128,0.85)'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,200,210,0.6)'; c.fillRect(2, 2, 6, 2); });
defBTile('HALLOW_ICE', { name: 'Pink Ice', hp: 70, drop: 'ice', color: '#f0b0e0', mapColor: '#f0b0e0', slippery: true, transparent: true }, (c) => { c.fillStyle = 'rgba(240,176,224,0.85)'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,240,255,0.7)'; c.fillRect(2, 2, 6, 2); });
defBTile('CRYSTAL_SHARD', { name: 'Crystal Shard', hp: 1, tool: 'any', solid: false, drop: 'crystal_shard', color: '#f0a0ff', mapColor: '#f0a0ff', transparent: true, light: [0.35, 0.2, 0.45], attachTo: 'below' }, (c) => { c.fillStyle = '#f0a0ff'; c.beginPath(); c.moveTo(8, 1); c.lineTo(12, 15); c.lineTo(4, 15); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.fillRect(7, 5, 2, 5); });
defBTile('DUNGEON_BRICK', { name: 'Dungeon Brick', hp: 300, minPower: 65, drop: 'dungeon_brick', color: '#3a4a7a', mapColor: '#3a4a7a' }, brickPainter('#5a6a9a', '#3a4a7a', '#1a2a4a'));
defBTile('SPIKE', { name: 'Spike', hp: 120, minPower: 65, drop: 'spike', color: '#8a8a9a', mapColor: '#8a8a9a', hurt: 40 }, (c) => { c.fillStyle = '#5a5a6a'; c.fillRect(0, 10, 16, 6); c.fillStyle = '#c0c0d0'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(i * 4, 10); c.lineTo(i * 4 + 2, 0); c.lineTo(i * 4 + 4, 10); c.fill(); } });
defBTile('GRANITE', { name: 'Granite', hp: 150, minPower: 45, drop: 'granite', color: '#2a2a4a', mapColor: '#2a2a4a' }, stonePainter('#4a4a7a', '#2a2a4a', '#1a1a2a'));
defBTile('MARBLE', { name: 'Marble', hp: 150, minPower: 45, drop: 'marble', color: '#d8d8e0', mapColor: '#d8d8e0' }, stonePainter('#ffffff', '#d8d8e0', '#a0a0b0'));
defBTile('MOSS_STONE', { name: 'Mossy Stone', hp: 100, drop: 'stone', color: '#7e7e86', mapColor: '#40a040', light: [0.1, 0.25, 0.1] }, (c, r) => { TILE_PAINTERS[T.STONE](c, r); c.fillStyle = '#40c040'; for (let i = 0; i < 10; i++) c.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 2, 2); });
defBTile('HIVE', { name: 'Hive', hp: 80, drop: 'hive', color: '#c08020', mapColor: '#c08020' }, (c) => { c.fillStyle = '#c08020'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e0a030'; for (let y = 0; y < 16; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < 16; x += 8) { c.fillRect(x + 1, y + 1, 6, 6); } c.fillStyle = '#8a5010'; for (let y = 0; y < 16; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < 16; x += 8) c.fillRect(x + 3, y + 3, 2, 2); });
defBTile('LIHZAHRD_BRICK', { name: 'Lihzahrd Brick', hp: 400, minPower: 210, drop: 'lihzahrd_brick', color: '#6a3a20', mapColor: '#6a3a20' }, brickPainter('#9a5a30', '#6a3a20', '#3a1a08'));
defBTile('OBSIDIAN_BRICK', { name: 'Obsidian Brick', hp: 200, drop: 'obsidian_brick', color: '#2a1e3a', mapColor: '#2a1e3a' }, brickPainter('#4a3a5a', '#2a1e3a', '#100818'));
defBTile('SANDSTONE_BRICK', { name: 'Sandstone Brick', hp: 120, drop: 'sandstone_brick', color: '#c8a868', mapColor: '#c8a868' }, brickPainter('#e8c888', '#c8a868', '#8a6a38'));
defBTile('HARDENED_SAND', { name: 'Hardened Sand', hp: 80, drop: 'hardened_sand', color: '#c0a070', mapColor: '#c0a070' }, stonePainter('#d8b888', '#c0a070', '#907048'));
defBTile('DESERT_FOSSIL', { name: 'Desert Fossil', hp: 120, drop: 'fossil', color: '#a08060', mapColor: '#a08060' }, (c, r) => { c.fillStyle = '#a08060'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#e8e0d0'; c.fillRect(3, 6, 10, 2); for (let i = 0; i < 4; i++) c.fillRect(4 + i * 3, 4, 1, 6); });
defBTile('LIVING_WOOD', { name: 'Living Wood', hp: 60, drop: 'wood', color: '#8a6a3a', mapColor: '#8a6a3a' }, stonePainter('#a8845a', '#8a6a3a', '#5a4020'));
defBTile('LEAF_BLOCK', { name: 'Leaf Block', hp: 20, tool: 'any', drop: null, color: '#3aa038', mapColor: '#3aa038', transparent: true }, (c, r) => { c.fillStyle = '#3aa038'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#48b046'; for (let i = 0; i < 8; i++) c.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 3, 2); });
defBTile('MINECART_TRACK', { name: 'Minecart Track', hp: 1, solid: false, platform: true, drop: 'minecart_track', color: '#8a8a92', mapColor: '#8a8a92', transparent: true }, (c) => { c.fillStyle = '#6a4a2a'; c.fillRect(3, 8, 3, 8); c.fillRect(10, 8, 3, 8); c.fillStyle = '#a0a0a8'; c.fillRect(0, 6, 16, 2); c.fillStyle = '#d0d0d8'; c.fillRect(0, 6, 16, 1); });
defBTile('MUSHROOM_STALK', { name: 'Giant Mushroom', hp: 60, tool: 'axe', solid: false, drop: 'glow_mushroom', color: '#7090c0', mapColor: '#4090ff', transparent: true, light: [0.05, 0.1, 0.2] }, (c) => { c.fillStyle = '#7090c0'; c.fillRect(4, 0, 8, 16); c.fillStyle = '#90b0e0'; c.fillRect(4, 0, 2, 16); });
defBTile('MUSHROOM_CAP', { name: 'Giant Mushroom Cap', hp: 60, tool: 'axe', solid: false, platform: true, drop: 'glow_mushroom', color: '#4090ff', mapColor: '#4090ff', transparent: true, light: [0.1, 0.3, 0.5] }, (c) => { c.fillStyle = '#4090ff'; c.fillRect(0, 4, 16, 8); c.fillRect(2, 2, 12, 2); c.fillStyle = '#a0d0ff'; c.fillRect(2, 4, 3, 3); c.fillRect(10, 6, 3, 3); });
defBTile('VINE', { name: 'Vine', hp: 1, tool: 'any', solid: false, drop: 'vine', color: '#2a8a3a', mapColor: '#2a8a3a', transparent: true }, (c) => { c.fillStyle = '#2a8a3a'; c.fillRect(7, 0, 2, 16); c.fillStyle = '#48b046'; c.fillRect(4, 4, 3, 2); c.fillRect(9, 10, 3, 2); });
defBTile('COIN_PILE', { name: 'Coin Pile', hp: 1, tool: 'any', solid: false, drop: null, color: '#e8c030', mapColor: '#e8c030', transparent: true, attachTo: 'below' }, (c) => { c.fillStyle = '#e8c030'; c.fillRect(2, 11, 12, 5); c.fillRect(5, 8, 8, 3); c.fillStyle = '#fff0a0'; c.fillRect(6, 9, 2, 1); c.fillRect(4, 12, 2, 1); });
defBTile('SHADOW_ORB', { name: 'Shadow Orb', hp: 1, tool: 'hammer', minPower: 55, solid: false, drop: null, color: '#6a3ad0', mapColor: '#6a3ad0', furniture: { w: 2, h: 2 }, transparent: true, light: [0.25, 0.1, 0.4] });
defBTile('CRIMSON_HEART', { name: 'Crimson Heart', hp: 1, tool: 'hammer', minPower: 55, solid: false, drop: null, color: '#c02030', mapColor: '#c02030', furniture: { w: 2, h: 2 }, transparent: true, light: [0.4, 0.1, 0.1] });
defBTile('DEMON_ALTAR', { name: 'Demon Altar', hp: 1, tool: 'hammer', minPower: 80, solid: false, platform: true, drop: null, color: '#5a3a8a', mapColor: '#5a3a8a', furniture: { w: 3, h: 2 }, transparent: true, light: [0.2, 0.05, 0.3] });
defBTile('PLANTERA_BULB', { name: "Plantera's Bulb", hp: 1, tool: 'pick', minPower: 55, solid: false, drop: null, color: '#ff40a0', mapColor: '#ff40a0', furniture: { w: 2, h: 2 }, transparent: true, light: [0.4, 0.1, 0.3] });
defBTile('LIHZAHRD_ALTAR', { name: 'Lihzahrd Altar', hp: 1, tool: 'pick', minPower: 210, solid: false, platform: true, drop: null, color: '#9a5a30', mapColor: '#ffa020', furniture: { w: 3, h: 2 }, transparent: true, light: [0.3, 0.15, 0.05] });
defBTile('SWORD_SHRINE', { name: 'Enchanted Sword', hp: 1, tool: 'pick', solid: false, drop: null, color: '#c0e0ff', mapColor: '#c0e0ff', furniture: { w: 1, h: 2 }, transparent: true, light: [0.15, 0.25, 0.4] });
defBTile('LARVA', { name: 'Larva', hp: 1, tool: 'any', solid: false, drop: null, color: '#e8d0a0', mapColor: '#e8d0a0', furniture: { w: 2, h: 3 }, transparent: true });
defBTile('HONEY_BLOCK', { name: 'Honey Block', hp: 50, drop: 'honey_block', color: '#e0a030', mapColor: '#e0a030', slippery: false }, (c) => { c.fillStyle = '#e0a030'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#f0c060'; c.fillRect(2, 2, 6, 3); c.fillStyle = '#b07010'; c.fillRect(0, 15, 16, 1); });
defBTile('HELLFORGE', { name: 'Hellforge', hp: 1, solid: false, drop: 'hellforge', color: '#6a3a30', mapColor: '#ff6020', furniture: { w: 3, h: 2 }, transparent: true, light: [0.6, 0.25, 0.05] });
defBTile('MECH_ANVIL', { name: 'Mythril Anvil', hp: 1, solid: false, drop: 'mythril_anvil', color: '#40c070', mapColor: '#40c070', furniture: { w: 2, h: 1 }, transparent: true });
defBTile('ADAMANTITE_FORGE', { name: 'Adamantite Forge', hp: 1, solid: false, drop: 'adamantite_forge', color: '#d02020', mapColor: '#d02020', furniture: { w: 3, h: 2 }, transparent: true, light: [0.6, 0.2, 0.1] });
// block items for the new tiles
for (const [id, name, key, extra] of [['ebonstone', 'Ebonstone Block', 'EBONSTONE'], ['crimstone', 'Crimstone Block', 'CRIMSTONE'], ['pearlstone', 'Pearlstone Block', 'PEARLSTONE'], ['ebonsand', 'Ebonsand Block', 'EBONSAND'], ['crimsand', 'Crimsand Block', 'CRIMSAND'], ['pearlsand', 'Pearlsand Block', 'PEARLSAND'], ['crystal_shard', 'Crystal Shard', 'CRYSTAL_SHARD', { material: true, rarity: 2 }], ['dungeon_brick', 'Blue Dungeon Brick', 'DUNGEON_BRICK'], ['spike', 'Spike', 'SPIKE'], ['granite', 'Granite Block', 'GRANITE'], ['marble', 'Marble Block', 'MARBLE'], ['hive', 'Hive', 'HIVE'], ['lihzahrd_brick', 'Lihzahrd Brick', 'LIHZAHRD_BRICK'], ['obsidian_brick', 'Obsidian Brick', 'OBSIDIAN_BRICK'], ['sandstone_brick', 'Sandstone Brick', 'SANDSTONE_BRICK'], ['hardened_sand', 'Hardened Sand Block', 'HARDENED_SAND'], ['fossil', 'Desert Fossil', 'DESERT_FOSSIL', { material: true }], ['minecart_track', 'Minecart Track', 'MINECART_TRACK'], ['vine', 'Vine', 'VINE', { material: true }], ['honey_block', 'Honey Block', 'HONEY_BLOCK'], ['hellforge', 'Hellforge', 'HELLFORGE', { tooltip: 'Smelts Hellstone Bars and everything a Furnace can' }], ['mythril_anvil', 'Mythril Anvil', 'MECH_ANVIL', { tooltip: 'Crafting station for Hardmode gear', rarity: 3 }], ['adamantite_forge', 'Adamantite Forge', 'ADAMANTITE_FORGE', { tooltip: 'Smelts Adamantite and Titanium', rarity: 4 }]]) {
  if (!ITEMS[id]) defItem(id, Object.assign({ name, tile: T[key] }, extra || {}));
}
RECIPES.push({ result: 'mythril_anvil', count: 1, station: 'anvil', ing: [['mythril_bar', 10]] }, { result: 'mythril_anvil', count: 1, station: 'anvil', ing: [['orichalcum_bar', 12]] }, { result: 'adamantite_forge', count: 1, station: 'mythril_anvil', ing: [['adamantite_ore', 30], ['hellforge', 1]] }, { result: 'adamantite_forge', count: 1, station: 'mythril_anvil', ing: [['titanium_ore', 30], ['hellforge', 1]] });
RECIPES.push({ result: 'sandstone_brick', count: 1, station: 'furnace', ing: [['sand', 2]] }, { result: 'obsidian_brick', count: 1, station: 'furnace', ing: [['obsidian', 1], ['stone', 1]] }, { result: 'minecart_track', count: 1, station: 'anvil', ing: [['iron_bar', 1], ['wood', 1]] }, { result: 'spike', count: 1, station: 'anvil', ing: [['iron_bar', 1]] });
// Walls
let nextWallId = 10;
function defBWall(key, props) { const id = nextWallId++; W[key] = id; defWall(id, props); return id; }
defBWall('MUD', { name: 'Mud Wall', color: '#3a2a20', natural: true }); defBWall('JUNGLE', { name: 'Jungle Wall', color: '#2a4a20', natural: true });
defBWall('EBONSTONE', { name: 'Ebonstone Wall', color: '#2a1e34', natural: true }); defBWall('CRIMSTONE', { name: 'Crimstone Wall', color: '#3a1818', natural: true }); defBWall('PEARLSTONE', { name: 'Pearlstone Wall', color: '#7a6a8a', natural: true });
defBWall('DUNGEON', { name: 'Dungeon Wall', color: '#1a2a4a', drop: 'dungeon_brick_wall' }); defBWall('SPIDER', { name: 'Spider Nest Wall', color: '#101010', natural: true }); defBWall('GRANITE', { name: 'Granite Wall', color: '#1a1a30', natural: true }); defBWall('MARBLE', { name: 'Marble Wall', color: '#8a8a98', natural: true });
defBWall('HIVE', { name: 'Hive Wall', color: '#7a5010', natural: true }); defBWall('LIHZAHRD', { name: 'Lihzahrd Wall', color: '#3a1a08', drop: 'lihzahrd_wall' }); defBWall('OBSIDIAN_BRICK', { name: 'Obsidian Brick Wall', color: '#181020', drop: 'obsidian_brick_wall' }); defBWall('SANDSTONE_BRICK', { name: 'Sandstone Brick Wall', color: '#7a6a44', drop: 'sandstone_brick_wall' });
defBWall('LIVING_WOOD', { name: 'Living Wood Wall', color: '#4a3820', drop: 'living_wood_wall' }); defBWall('MUSHROOM', { name: 'Mushroom Wall', color: '#203050', natural: true }); defBWall('HARDENED_SAND', { name: 'Hardened Sand Wall', color: '#6a5a3a', natural: true }); defBWall('ASH', { name: 'Ash Wall', color: '#2a2428', natural: true });
for (const [id, name, key] of [['dungeon_brick_wall', 'Blue Dungeon Brick Wall', 'DUNGEON'], ['lihzahrd_wall', 'Lihzahrd Brick Wall', 'LIHZAHRD'], ['obsidian_brick_wall', 'Obsidian Brick Wall', 'OBSIDIAN_BRICK'], ['sandstone_brick_wall', 'Sandstone Brick Wall', 'SANDSTONE_BRICK'], ['living_wood_wall', 'Living Wood Wall', 'LIVING_WOOD']]) defItem(id, { name, wall: W[key] });
// Tree styles for the new biomes (index = BIOME id)
TREE_STYLES[BIOME.CORRUPTION] = { bark: ['#5a5a6a', '#3a3a4a', '#7a7a8a'], leaf: ['#7050b0', '#583890', '#9070d0', '#b090ff'] };
TREE_STYLES[BIOME.CRIMSON] = { bark: ['#7a3a3a', '#5a2020', '#9a5050'], leaf: ['#c03030', '#902020', '#e05050', '#ff8080'] };
TREE_STYLES[BIOME.HALLOW] = { bark: ['#c8b0d8', '#a890b8', '#e8d0f8'], leaf: ['#40e0e0', '#e080ff', '#80ffff', '#ffb0ff'] };
TREE_STYLES[BIOME.OCEAN] = { bark: ['#b08a5a', '#8a6a3a', '#d0a870'], leaf: ['#40a040', '#308030', '#60c060', '#80e080'] };
TREE_STYLES[BIOME.MUSHROOM] = { bark: ['#7090c0', '#5070a0', '#90b0e0'], leaf: ['#4090ff', '#2070d0', '#60b0ff', '#a0d0ff'] };
TREE_STYLES[BIOME.ASH] = { bark: ['#3a3038', '#2a2028', '#5a4a48'], leaf: ['#c05020', '#903010', '#e07030', '#ffa040'] };
// liquids: lava array value 2 = honey, 3 = shimmer
const LIQ = { WATER: 0, LAVA: 1, HONEY: 2, SHIMMER: 3 };

// Generation ---------------------------------------------------------------------------------
const Biomes = {
  layout(world, rng) {
    const swap = rng() < 0.5, crimson = rng() < 0.5;
    world.evil = crimson ? BIOME.CRIMSON : BIOME.CORRUPTION;
    // fractions of the world width; jungle and dungeon on opposite sides
    const L = !swap;
    const bands = L
      ? { jungle: [0.05, 0.16], snow: [0.19, 0.31], evil: [0.36, 0.43], desert: [0.62, 0.75], hallow: [0.80, 0.87] }
      : { hallow: [0.13, 0.20], desert: [0.25, 0.38], evil: [0.57, 0.64], snow: [0.69, 0.81], jungle: [0.84, 0.95] };
    world.bands = bands; world.jungleLeft = L; world.dungeonSide = L ? 1 : -1;
    for (let x = 0; x < world.w; x++) {
      const f = x / world.w; let b = BIOME.FOREST;
      if (f < 0.045 || f > 0.955) b = BIOME.OCEAN;
      else if (f > bands.jungle[0] && f < bands.jungle[1]) b = BIOME.JUNGLE;
      else if (f > bands.snow[0] && f < bands.snow[1]) b = BIOME.SNOW;
      else if (f > bands.evil[0] && f < bands.evil[1]) b = world.evil;
      else if (f > bands.desert[0] && f < bands.desert[1]) b = BIOME.DESERT;
      world.biome[x] = b;
    }
  },
  // per-column terrain tile for the new biomes (null = use the default rules)
  terrainTile(b, depth, dirtDepth, n, y, world) {
    if (b === BIOME.JUNGLE) return depth < dirtDepth * 1.3 ? (n > 0.42 ? T.STONE : T.MUD) : (n > 0.3 ? T.MUD : T.STONE);
    if (b === BIOME.CORRUPTION) return depth < dirtDepth ? (n > 0.2 ? T.EBONSTONE : T.DIRT) : (n > 0.25 ? T.DIRT : T.EBONSTONE);
    if (b === BIOME.CRIMSON) return depth < dirtDepth ? (n > 0.2 ? T.CRIMSTONE : T.DIRT) : (n > 0.25 ? T.DIRT : T.CRIMSTONE);
    if (b === BIOME.OCEAN) return depth < 12 ? T.SAND : (n > 0.3 ? T.STONE : T.SAND);
    return null;
  },
  wallFor(b, shallow, tile) {
    if (b === BIOME.JUNGLE) return shallow ? W.JUNGLE : W.MUD;
    if (b === BIOME.CORRUPTION) return shallow ? W.DIRT : W.EBONSTONE;
    if (b === BIOME.CRIMSON) return shallow ? W.DIRT : W.CRIMSTONE;
    if (b === BIOME.OCEAN) return W.SAND;
    return null;
  },
  grassFor(b) { return b === BIOME.JUNGLE ? T.JUNGLE_GRASS : b === BIOME.CORRUPTION ? T.CORRUPT_GRASS : b === BIOME.CRIMSON ? T.CRIMSON_GRASS : b === BIOME.HALLOW ? T.HALLOW_GRASS : null; },
  isGrassBase(b, t) { return b === BIOME.JUNGLE ? t === T.MUD : t === T.DIRT; },
  // main pass (runs after ores / walls / water / trees of the base generator)
  *generate(world, rng, perlin) {
    const w = world.w, h = world.h, idx = (x, y) => x + y * w;
    const areaF = (w * h) / (1800 * 600);
    const set = (x, y, t, d) => { if (world.inBounds(x, y)) { world.tiles[idx(x, y)] = t; world.tdata[idx(x, y)] = d || 0; } };
    const get = (x, y) => world.inBounds(x, y) ? world.tiles[idx(x, y)] : T.BEDROCK;
    const wall = (x, y, wl) => { if (world.inBounds(x, y)) world.walls[idx(x, y)] = wl; };
    const clearLiquid = (x, y) => { if (world.inBounds(x, y)) { world.liquid[idx(x, y)] = 0; world.lava[idx(x, y)] = 0; } };
    const surf = world.surface, hellLine = h - 70;
    world.structures = world.structures || {};
    const chest = (x, y, items) => { if (!world.inBounds(x, y + 1) || !world.inBounds(x + 1, y + 1)) return; set(x, y, T.AIR); set(x + 1, y, T.AIR); set(x, y - 1, T.AIR); set(x + 1, y - 1, T.AIR); world.placeFurniture(x, y - 1, T.CHEST); const inv = world.chests.get(idx(x, y - 1)); if (inv) items.forEach((it, i) => { if (it) inv[i] = makeStack(it[0], it[1] || 1, it[2] === undefined ? null : it[2]); }); };
    const findFloor = (x, y0, y1) => { for (let y = y0; y < y1; y++) if (get(x, y) === T.AIR && TILES[get(x, y + 1)].solid) return y; return -1; };

    // Oceans: carve a basin at each edge that deepens toward the border and fill with water
    yield { msg: 'Filling the oceans', p: 0.86 };
    const seaLevel = Math.round(Math.min(surf[Math.floor(w * 0.045)], surf[Math.floor(w * 0.955)]) - 2);
    for (const side of [0, 1]) {
      const width = Math.floor(w * 0.045) + 20;
      for (let k = 0; k < width; k++) {
        const x = side === 0 ? k : w - 1 - k;
        const f = clamp((width - k) / width, 0, 1); // 1 at the border
        const depth = Math.round(4 + f * f * 42);
        for (let y = 0; y <= seaLevel + depth; y++) { if (y < seaLevel) { if (get(x, y) !== T.AIR) set(x, y, T.AIR); } else if (get(x, y) !== T.BEDROCK) { set(x, y, T.AIR); world.liquid[idx(x, y)] = 255; world.lava[idx(x, y)] = 0; } }
        for (let y = seaLevel + depth + 1; y < seaLevel + depth + 14; y++) { set(x, y, T.SAND); wall(x, y, W.SAND); }
        surf[x] = seaLevel;
      }
      // beach palms just inland
      const bx0 = side === 0 ? width : w - 1 - width;
      for (let k = 0; k < 40; k += 5 + Math.floor(rng() * 5)) { const x = bx0 + (side === 0 ? k : -k); let y = 0; while (y < h && get(x, y) === T.AIR) y++; if (get(x, y) === T.SAND && world.liquid[idx(x, y - 1)] === 0 && rng() < 0.7) { const th = randInt(7, 11); for (let j = 1; j <= th; j++) { set(x, y - j, T.TREE, randInt(0, 3)); } set(x, y - th - 1, T.TREETOP, randInt(0, 3)); world.biome[x] = BIOME.OCEAN; } }
    }
    world.seaLevel = seaLevel;

    // Jungle: grass on mud, vines, mahogany trees, underground jungle caves with shrines, hives and the temple
    yield { msg: 'Growing the jungle', p: 0.865 };
    const jb = world.bands.jungle, jx0 = Math.floor(jb[0] * w), jx1 = Math.floor(jb[1] * w);
    for (let x = jx0; x < jx1; x++) {
      let y = 0; while (y < h && get(x, y) === T.AIR) y++;
      if (get(x, y) === T.MUD) set(x, y, T.JUNGLE_GRASS);
      for (let yy = y; yy < hellLine; yy++) { const i = idx(x, yy); if (world.tiles[i] === T.MUD && (get(x, yy - 1) === T.AIR || get(x, yy + 1) === T.AIR || get(x - 1, yy) === T.AIR || get(x + 1, yy) === T.AIR)) world.tiles[i] = T.JUNGLE_GRASS; }
      // vines hang from jungle grass ceilings
      for (let yy = y; yy < hellLine; yy++) if (get(x, yy) === T.JUNGLE_GRASS && get(x, yy + 1) === T.AIR && rng() < 0.3) { const len = randInt(2, 7); for (let k = 1; k <= len; k++) { if (get(x, yy + k) !== T.AIR) break; set(x, yy + k, T.VINE); } }
    }
    let nextTree = jx0;
    for (let x = jx0 + 3; x < jx1 - 3; x++) {
      let y = 0; while (y < h && get(x, y) === T.AIR) y++;
      if (get(x, y) === T.JUNGLE_GRASS && x >= nextTree && world.liquid[idx(x, y - 1)] === 0 && rng() < 0.6) { const th = randInt(10, 18); let ok = true; for (let k = 1; k <= th + 4; k++) if (get(x, y - k) !== T.AIR) { ok = false; break; } if (ok) { for (let k = 1; k <= th; k++) { let d = randInt(0, 3); if (k > 2 && k < th - 1 && rng() < 0.2) d |= (rng() < 0.5 ? 4 : 8); set(x, y - k, T.TREE, d); } set(x, y - th - 1, T.TREETOP, randInt(0, 3)); nextTree = x + randInt(3, 6); } }
      else if (get(x, y) === T.JUNGLE_GRASS && rng() < 0.5) set(x, y - 1, T.PLANT, randInt(0, 5));
    }
    // underground jungle: extra caves & glowing mushrooms, jungle shrines, bee hives, a living mahogany tree
    for (let k = 0; k < Math.round(60 * areaF); k++) { const x = randInt(jx0 + 5, jx1 - 5), y = randInt(world.surfaceLine + 20, hellLine - 40); const r = randInt(3, 7); for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (Math.hypot(xx, yy) <= r) { set(x + xx, y + yy, T.AIR); } }
    for (let k = 0; k < Math.round(4 * areaF); k++) { const x = randInt(jx0 + 8, jx1 - 8), y = randInt(world.surfaceLine + 30, world.cavernLine + 40); for (let yy = -4; yy <= 4; yy++) for (let xx = -6; xx <= 6; xx++) { const edge = Math.abs(yy) === 4 || Math.abs(xx) === 6; set(x + xx, y + yy, edge ? T.STONEBRICK : T.AIR); wall(x + xx, y + yy, W.STONEBRICK); clearLiquid(x + xx, y + yy); } set(x - 3, y + 2, T.TORCH); set(x + 3, y + 2, T.TORCH); chest(x - 1, y + 3, [['ivy_whip', 1, undefined], ['anklet_of_the_wind', 1], ['lesser_healing', 4], ['vine', 5]]); world.structures.jungleShrines = (world.structures.jungleShrines || 0) + 1; }
    for (let k = 0; k < Math.round(3 * areaF); k++) { const x = randInt(jx0 + 12, jx1 - 12), y = randInt(world.surfaceLine + 40, hellLine - 60); const rx = randInt(9, 14), ry = randInt(6, 9); for (let yy = -ry - 2; yy <= ry + 2; yy++) for (let xx = -rx - 2; xx <= rx + 2; xx++) { const d = (xx / rx) ** 2 + (yy / ry) ** 2; if (d <= 1.4) { if (d > 0.85) set(x + xx, y + yy, T.HIVE); else { set(x + xx, y + yy, T.AIR); wall(x + xx, y + yy, W.HIVE); if (yy > 0) { world.liquid[idx(x + xx, y + yy)] = 255; world.lava[idx(x + xx, y + yy)] = LIQ.HONEY; } } } } world.placeFurniture(x, y - 2, T.LARVA); world.structures.hives = (world.structures.hives || 0) + 1; }
    { const x = randInt(jx0 + 20, jx1 - 20), y = world.surfaceLine + 30 + randInt(0, 40); // living mahogany tree: hollow trunk with a chest
      for (let yy = -30; yy <= 12; yy++) for (let xx = -4; xx <= 4; xx++) { const edge = Math.abs(xx) === 4 || yy === 12; set(x + xx, y + yy, edge ? T.LIVING_WOOD : T.AIR); wall(x + xx, y + yy, W.LIVING_WOOD); clearLiquid(x + xx, y + yy); }
      for (let yy = -40; yy < -30; yy++) for (let xx = -12; xx <= 12; xx++) if (Math.hypot(xx / 12, (yy + 35) / 5) <= 1) set(x + xx, y + yy, T.LEAF_BLOCK);
      for (let yy = -28; yy < 10; yy += 6) { set(x - 2, y + yy, T.PLATFORM); set(x - 1, y + yy, T.PLATFORM); set(x, y + yy, T.PLATFORM); set(x + 1, y + yy, T.PLATFORM); set(x + 2, y + yy, T.PLATFORM); }
      chest(x - 1, y + 11, [['living_wood_wand', 1], ['leaf_wand', 1], ['gold_bar', 5], ['lesser_healing', 3]]); world.structures.mahogany = { x, y };
    }
    // Jungle Temple: lihzahrd brick block deep in the jungle with corridors, spikes, the altar and a chest
    { const tx = randInt(jx0 + 25, jx1 - 25), ty = clamp(world.cavernLine + 40 + randInt(0, 30), world.cavernLine + 20, hellLine - 60), tw = 38, th = 32;
      for (let yy = 0; yy < th; yy++) for (let xx = 0; xx < tw; xx++) { const X = tx - tw / 2 + xx, Y = ty - th / 2 + yy; set(X, Y, T.LIHZAHRD_BRICK); wall(X, Y, W.LIHZAHRD); clearLiquid(X, Y); }
      // rooms and corridors
      const rooms = [[4, 4, 12, 7], [20, 3, 14, 8], [3, 15, 10, 6], [16, 14, 18, 8], [6, 24, 26, 6]];
      for (const [rx, ry, rw, rh] of rooms) for (let yy = ry; yy < ry + rh; yy++) for (let xx = rx; xx < rx + rw; xx++) set(tx - tw / 2 + xx, ty - th / 2 + yy, T.AIR);
      for (let yy = 4; yy < 30; yy++) set(tx - tw / 2 + 15, ty - th / 2 + yy, T.AIR);
      for (let xx = 4; xx < 34; xx++) if (xx % 3 === 0) set(tx - tw / 2 + xx, ty - th / 2 + 13, T.PLATFORM);
      for (let xx = 8; xx < 30; xx += 4) set(tx - tw / 2 + xx, ty - th / 2 + 29, T.SPIKE);
      set(tx - tw / 2 + 15, ty - th / 2 + th - 1, T.AIR); set(tx - tw / 2 + 15, ty - th / 2 + th, T.AIR); set(tx - tw / 2 + 15, ty - th / 2 + th + 1, T.AIR); // entrance from below
      world.placeFurniture(tx - tw / 2 + 24, ty - th / 2 + 20, T.LIHZAHRD_ALTAR);
      for (const [xx, yy] of [[6, 9], [26, 9], [8, 19], [30, 19], [10, 28], [28, 28]]) set(tx - tw / 2 + xx, ty - th / 2 + yy, T.TORCH);
      chest(tx - tw / 2 + 8, ty - th / 2 + 29, [['lihzahrd_power_cell', 1], ['gold_bar', 10], ['lesser_healing', 5], ['lihzahrd_brick', 20]]);
      world.temple = { x: tx, y: ty, w: tw, h: th, altar: { x: tx - tw / 2 + 24, y: ty - th / 2 + 20 } };
    }

    // Corruption / Crimson: grass, chasms, orbs / hearts, altars, evil ore
    yield { msg: world.evil === BIOME.CRIMSON ? 'Spreading the crimson' : 'Spreading the corruption', p: 0.87 };
    const eb = world.bands.evil, ex0 = Math.floor(eb[0] * w), ex1 = Math.floor(eb[1] * w), crim = world.evil === BIOME.CRIMSON;
    const eGrass = crim ? T.CRIMSON_GRASS : T.CORRUPT_GRASS, eStone = crim ? T.CRIMSTONE : T.EBONSTONE, eWall = crim ? W.CRIMSTONE : W.EBONSTONE;
    for (let x = ex0; x < ex1; x++) { let y = 0; while (y < h && get(x, y) === T.AIR) y++; if (get(x, y) === T.DIRT) set(x, y, eGrass); for (let yy = y; yy < y + 40; yy++) { const i = idx(x, yy); if (world.tiles[i] === T.DIRT && (get(x, yy - 1) === T.AIR || get(x, yy + 1) === T.AIR || get(x - 1, yy) === T.AIR || get(x + 1, yy) === T.AIR)) world.tiles[i] = eGrass; if (world.tiles[i] === T.GRASS) world.tiles[i] = eGrass; if (world.tiles[i] === T.TREE || world.tiles[i] === T.TREETOP) { /* base trees already grew on dirt? none: dirt tops were not grass */ } } }
    nextTree = ex0;
    for (let x = ex0 + 2; x < ex1 - 2; x++) { let y = 0; while (y < h && get(x, y) === T.AIR) y++; if (get(x, y) === eGrass && x >= nextTree && rng() < 0.4 && world.liquid[idx(x, y - 1)] === 0) { const th = randInt(7, 13); let ok = true; for (let k = 1; k <= th + 4; k++) if (get(x, y - k) !== T.AIR) { ok = false; break; } if (ok) { for (let k = 1; k <= th; k++) set(x, y - k, T.TREE, randInt(0, 3) | (k > 2 && rng() < 0.15 ? (rng() < 0.5 ? 4 : 8) : 0)); set(x, y - th - 1, T.TREETOP, randInt(0, 3)); nextTree = x + randInt(4, 8); } } }
    const chasms = crim ? 3 : 4; world.orbs = [];
    for (let c = 0; c < chasms; c++) {
      const cx = ex0 + Math.floor((c + 0.5) / chasms * (ex1 - ex0)), top = surf[cx];
      if (!crim) { // corruption: vertical chasm with a rounded bottom chamber
        const depth = randInt(60, 90), bottom = Math.min(top + depth, world.cavernLine + 20);
        for (let y = top - 2; y < bottom; y++) { const half = 3 + Math.round(Math.sin((y - top) / depth * Math.PI) * 2); for (let xx = -half - 2; xx <= half + 2; xx++) { if (Math.abs(xx) <= half) { set(cx + xx, y, T.AIR); clearLiquid(cx + xx, y); } else if (get(cx + xx, y) !== T.AIR) set(cx + xx, y, eStone); wall(cx + xx, y, eWall); } }
        for (let yy = -6; yy <= 6; yy++) for (let xx = -10; xx <= 10; xx++) { const d = Math.hypot(xx / 10, yy / 6); if (d <= 1) { set(cx + xx, bottom + 4 + yy, T.AIR); clearLiquid(cx + xx, bottom + 4 + yy); } else if (d < 1.3 && get(cx + xx, bottom + 4 + yy) !== T.AIR) set(cx + xx, bottom + 4 + yy, eStone); wall(cx + xx, bottom + 4 + yy, eWall); }
        world.placeFurniture(cx - 1, bottom + 8, T.SHADOW_ORB); world.orbs.push({ x: cx - 1, y: bottom + 8 });
        world.placeFurniture(cx + 5, bottom + 9, T.DEMON_ALTAR);
      } else { // crimson: angled tunnels from the surface to a heart chamber
        let x = cx, y = top + 2; const dir = c % 2 ? 1 : -1; const len = randInt(50, 80);
        for (let k = 0; k < len; k++) { for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) { set(x + xx, y + yy, T.AIR); clearLiquid(x + xx, y + yy); wall(x + xx, y + yy, eWall); } for (let xx = -4; xx <= 4; xx++) for (let yy = -4; yy <= 4; yy++) if (Math.abs(xx) > 2 || Math.abs(yy) > 2) { if (get(x + xx, y + yy) !== T.AIR) set(x + xx, y + yy, eStone); } x += dir * (rng() < 0.6 ? 1 : 0); y += 1; if (y > world.cavernLine + 10) break; }
        for (let yy = -5; yy <= 5; yy++) for (let xx = -8; xx <= 8; xx++) { const d = Math.hypot(xx / 8, yy / 5); if (d <= 1) { set(x + xx, y + yy, T.AIR); clearLiquid(x + xx, y + yy); } else if (d < 1.4 && get(x + xx, y + yy) !== T.AIR) set(x + xx, y + yy, eStone); wall(x + xx, y + yy, eWall); }
        world.placeFurniture(x - 1, y + 3, T.CRIMSON_HEART); world.orbs.push({ x: x - 1, y: y + 3 });
        world.placeFurniture(x + 4, y + 4, T.DEMON_ALTAR);
      }
    }
    for (let v = 0; v < Math.round(25 * areaF); v++) { const x = randInt(ex0, ex1 - 1), y = randInt(surf[x] + 8, world.cavernLine); for (let k = 0; k < 4; k++) for (let xx = 0; xx < 2; xx++) for (let yy = 0; yy < 2; yy++) { const t = get(x + xx + k, y + yy); if (t === eStone || t === T.STONE || t === T.DIRT) set(x + xx + k, y + yy, crim ? T.CRIMTANE_ORE : T.DEMONITE_ORE); } }
    // evil deserts / ice handled at hardmode conversion; walls in the evil band
    for (let x = ex0; x < ex1; x++) for (let y = surf[x] + 3; y < world.cavernLine; y++) if (world.walls[idx(x, y)] === W.DIRT || world.walls[idx(x, y)] === W.STONE) world.walls[idx(x, y)] = eWall;

    // Underground Desert: a big oval of hardened sand & sandstone with tunnels, fossils and antlion pits
    yield { msg: 'Hardening the desert', p: 0.875 };
    const db = world.bands.desert, dx0 = Math.floor(db[0] * w), dx1 = Math.floor(db[1] * w), dcx = Math.floor((dx0 + dx1) / 2), dcy = world.surfaceLine + 45, drx = Math.floor((dx1 - dx0) * 0.45), dry = 45;
    for (let yy = -dry; yy <= dry; yy++) for (let xx = -drx; xx <= drx; xx++) { const d = (xx / drx) ** 2 + (yy / dry) ** 2; if (d > 1) continue; const X = dcx + xx, Y = dcy + yy; if (Y < surf[X] + 4) continue; const n = perlin.fbm(X * 0.06, Y * 0.06, 2); const t = get(X, Y); if (t === T.AIR && d < 0.9) continue; if (n > 0.25 && d < 0.85) { set(X, Y, T.AIR); clearLiquid(X, Y); } else set(X, Y, n < -0.35 ? T.DESERT_FOSSIL : (d > 0.7 ? T.SANDSTONE : T.HARDENED_SAND)); wall(X, Y, W.HARDENED_SAND); }
    world.undergroundDesert = { x: dcx, y: dcy, rx: drx, ry: dry };
    // Oasis: a pond with palms in the middle of the desert surface
    { const ox = randInt(dx0 + 20, dx1 - 20), oy = surf[ox]; for (let xx = -9; xx <= 9; xx++) { const depth = Math.round(Math.sqrt(Math.max(0, 81 - xx * xx)) / 2); for (let yy = 0; yy <= depth; yy++) { set(ox + xx, oy + yy, T.AIR); world.liquid[idx(ox + xx, oy + yy)] = 255; world.lava[idx(ox + xx, oy + yy)] = 0; } } for (const px of [ox - 12, ox + 12]) { let y = 0; while (y < h && get(px, y) === T.AIR) y++; for (let k = 1; k <= 8; k++) set(px, y - k, T.TREE, randInt(0, 3)); set(px, y - 9, T.TREETOP, randInt(0, 3)); world.biome[px] = BIOME.OCEAN; } world.oasis = { x: ox, y: oy }; }
    // Pyramid: sandstone bricks with a treasure room
    if (rng() < 0.75) { const px = randInt(dx0 + 15, dx1 - 15), py = surf[px]; const H = 22; for (let k = 0; k < H; k++) for (let xx = -(H - k); xx <= H - k; xx++) { const Y = py - 1 - k + H - H; const yy = py - k; set(px + xx, yy, T.SANDSTONE_BRICK); wall(px + xx, yy, W.SANDSTONE_BRICK); } for (let xx = -6; xx <= 6; xx++) for (let yy = 0; yy < 4; yy++) set(px + xx, py - 3 + yy, T.AIR); set(px - 4, py - 2, T.TORCH); set(px + 4, py - 2, T.TORCH); chest(px - 1, py, [['flying_carpet', 1], ['sandstorm_in_a_bottle', 1], ['pharaohs_mask', 1], ['gold_bar', 8], ['coin_gold', 3]]); for (let k = 1; k < H - 3; k++) set(px + (H - k) - 1, py - k, T.AIR); world.pyramid = { x: px, y: py }; }

    // Glowing mushroom biomes underground (mushroom grass on mud, giant mushrooms) + one surface patch if cultivated later
    yield { msg: 'Lighting the mushroom caves', p: 0.88 };
    for (let k = 0; k < Math.round(3 * areaF); k++) { const x = randInt(60, w - 60), y = randInt(world.surfaceLine + 30, hellLine - 60); if (world.biome[x] === world.evil) continue; const rx = randInt(18, 28), ry = randInt(10, 16); for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { const d = (xx / rx) ** 2 + (yy / ry) ** 2; if (d > 1) continue; const X = x + xx, Y = y + yy, n = perlin.fbm(X * 0.08, Y * 0.08, 2); if (n > 0.1 && d < 0.8) { set(X, Y, T.AIR); clearLiquid(X, Y); } else set(X, Y, T.MUD); wall(X, Y, W.MUSHROOM); } for (let xx = -rx; xx <= rx; xx++) for (let yy = -ry; yy <= ry; yy++) { const X = x + xx, Y = y + yy; if (get(X, Y) === T.MUD && get(X, Y - 1) === T.AIR) { set(X, Y, T.MUSHROOM_GRASS); if (rng() < 0.12) { const mh = randInt(3, 6); let ok = true; for (let j = 1; j <= mh + 1; j++) if (get(X, Y - j) !== T.AIR) ok = false; if (ok) { for (let j = 1; j <= mh; j++) set(X, Y - j, T.MUSHROOM_STALK); for (let j = -2; j <= 2; j++) if (get(X + j, Y - mh - 1) === T.AIR) set(X + j, Y - mh - 1, T.MUSHROOM_CAP); } } else if (rng() < 0.3) set(X, Y - 1, T.MUSHROOM_GLOW); } } world.structures.mushroom = (world.structures.mushroom || 0) + 1; }

    // Mini-biomes in the caverns: granite, marble, spider nests, glowing moss
    yield { msg: 'Carving mini-biomes', p: 0.885 };
    const blob = (x, y, rx, ry, tile, wl, hollow) => { for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { const d = (xx / rx) ** 2 + (yy / ry) ** 2; if (d > 1) continue; const X = x + xx, Y = y + yy; if (get(X, Y) === T.BEDROCK) continue; const n = perlin.fbm(X * 0.07, Y * 0.07, 2); if (hollow && n > -0.05 && d < 0.8) { set(X, Y, T.AIR); clearLiquid(X, Y); } else if (get(X, Y) !== T.AIR || d > 0.8) set(X, Y, tile); if (wl != null) wall(X, Y, wl); } };
    for (let k = 0; k < Math.round(3 * areaF); k++) { const x = randInt(60, w - 60), y = randInt(world.cavernLine - 20, hellLine - 40); blob(x, y, randInt(18, 26), randInt(12, 18), T.GRANITE, W.GRANITE, true); world.structures.granite = (world.structures.granite || 0) + 1; }
    for (let k = 0; k < Math.round(3 * areaF); k++) { const x = randInt(60, w - 60), y = randInt(world.cavernLine - 40, hellLine - 40); blob(x, y, randInt(18, 26), randInt(10, 16), T.MARBLE, W.MARBLE, true); world.structures.marble = (world.structures.marble || 0) + 1; }
    for (let k = 0; k < Math.round(4 * areaF); k++) { const x = randInt(60, w - 60), y = randInt(world.surfaceLine + 40, hellLine - 50); const rx = randInt(12, 18), ry = randInt(8, 12); for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { const d = (xx / rx) ** 2 + (yy / ry) ** 2; if (d > 1) continue; const X = x + xx, Y = y + yy; if (d < 0.75 && perlin.fbm(X * 0.09, Y * 0.09, 2) > -0.1) { set(X, Y, T.AIR); clearLiquid(X, Y); } wall(X, Y, W.SPIDER); } for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { const X = x + xx, Y = y + yy; if (get(X, Y) === T.AIR && rng() < 0.35) set(X, Y, T.COBWEB); } world.structures.spider = (world.structures.spider || 0) + 1; }
    for (let k = 0; k < Math.round(6 * areaF); k++) { const x = randInt(40, w - 40), y = randInt(world.cavernLine, hellLine - 30); const r = randInt(8, 14); const kind = randInt(0, 4); for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const X = x + xx, Y = y + yy; if (Math.hypot(xx, yy) > r) continue; if (get(X, Y) === T.STONE && (get(X, Y - 1) === T.AIR || get(X, Y + 1) === T.AIR || get(X - 1, Y) === T.AIR || get(X + 1, Y) === T.AIR)) set(X, Y, T.MOSS_STONE, kind); } }

    // Structures: underground cabins, living trees, floating islands, ruined houses, sword shrine, mosaics, campsites, minecart tracks
    yield { msg: 'Building ruins', p: 0.89 };
    for (let k = 0; k < Math.round(10 * areaF); k++) { const x = randInt(30, w - 30), y = randInt(world.surfaceLine + 15, hellLine - 30); for (let yy = -4; yy <= 1; yy++) for (let xx = -5; xx <= 5; xx++) { const edge = yy === -4 || yy === 1 || Math.abs(xx) === 5; set(x + xx, y + yy, edge ? T.WOOD : T.AIR); wall(x + xx, y + yy, W.WOOD); clearLiquid(x + xx, y + yy); } set(x - 3, y - 2, T.TORCH); world.placeFurniture(x + 2, y - 1, T.TABLE); world.placeFurniture(x + 4, y - 1, T.CHAIR); for (let yy = -3; yy <= -1; yy++) set(x - 5, y + yy, T.AIR); world.placeFurniture(x - 5, y - 3, T.DOOR_C); chest(x - 3, y, [[choose(['hermes_boots', 'cloud_in_a_bottle', 'lucky_horseshoe', 'magic_mirror', 'band_of_regeneration']), 1], ['lesser_healing', 3], ['torch', 8], ['rope', 0]].filter(a => a[1])); world.structures.cabins = (world.structures.cabins || 0) + 1; }
    for (let k = 0; k < Math.round(2 * areaF); k++) { const x = randInt(80, w - 80); if (world.biome[x] !== BIOME.FOREST || Math.abs(x - w / 2) < 60) continue; const y = surf[x]; const th = randInt(28, 40); for (let yy = 1; yy <= th; yy++) for (let xx = -3; xx <= 3; xx++) set(x + xx, y - yy, Math.abs(xx) === 3 ? T.LIVING_WOOD : T.AIR); for (let yy = 1; yy <= th; yy++) for (let xx = -2; xx <= 2; xx++) wall(x + xx, y - yy, W.LIVING_WOOD); for (let yy = 0; yy < 14; yy++) for (let xx = -16; xx <= 16; xx++) if (Math.hypot(xx / 16, (yy - 7) / 7) <= 1 && get(x + xx, y - th - 8 + yy) === T.AIR) set(x + xx, y - th - 8 + yy, T.LEAF_BLOCK); for (let yy = y - th + 4; yy < y; yy += 6) for (let xx = -2; xx <= 2; xx++) set(x + xx, yy, T.PLATFORM); for (let yy = 1; yy < 8; yy++) for (let xx = -3; xx <= 3; xx++) set(x + xx, y + yy, Math.abs(xx) === 3 || yy === 7 ? T.LIVING_WOOD : T.AIR); chest(x - 1, y + 6, [['living_wood_wand', 1], ['leaf_wand', 1], ['iron_bar', 6], ['lesser_healing', 2]]); set(x, y - 1, T.AIR); set(x - 3, y + 3, T.AIR); world.structures.livingTrees = (world.structures.livingTrees || 0) + 1; }
    world.islands = [];
    for (let k = 0; k < Math.round(3 * areaF); k++) { const x = randInt(100, w - 100), y = randInt(30, Math.max(40, minSurfOf(surf) - 40)); const rx = randInt(14, 22), ry = randInt(5, 8); for (let yy = 0; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) { if ((xx / rx) ** 2 + (yy / ry) ** 2 > 1) continue; set(x + xx, y + yy, yy === 0 ? T.GRASS : (yy > ry * 0.6 ? T.STONE : T.DIRT)); } for (let xx = -rx + 2; xx <= rx - 2; xx += 5) if (rng() < 0.5) { for (let j = 1; j <= 6; j++) set(x + xx, y - j, T.TREE, randInt(0, 3)); set(x + xx, y - 7, T.TREETOP, randInt(0, 3)); } for (let xx = -3; xx <= 3; xx++) for (let yy = -5; yy <= -1; yy++) set(x + xx + 6, y + yy, Math.abs(xx) === 3 || yy === -5 ? T.STONEBRICK : T.AIR); set(x + 6, y - 1, T.AIR); chest(x + 5, y - 1, [[choose(['starfury', 'lucky_horseshoe', 'shiny_red_balloon']), 1], ['fallen_star', 3], ['gold_bar', 4]]); set(x + 4, y - 3, T.TORCH); for (let xx = -6; xx <= -2; xx++) for (let yy = 0; yy < 2; yy++) { set(x + xx, y + yy, T.AIR); world.liquid[idx(x + xx, y + yy)] = 255; } world.islands.push({ x, y }); }
    for (let k = 0; k < Math.round(4 * areaF); k++) { const x = randInt(40, w - 40); let y = hellLine + 10; while (y < h - 6 && get(x, y) !== T.AIR) y++; while (y < h - 6 && get(x, y + 1) === T.AIR) y++; if (y >= h - 8) continue; for (let yy = -6; yy <= 0; yy++) for (let xx = -6; xx <= 6; xx++) { const edge = yy === -6 || yy === 0 || Math.abs(xx) === 6; set(x + xx, y + yy, edge ? T.OBSIDIAN_BRICK : T.AIR); wall(x + xx, y + yy, W.OBSIDIAN_BRICK); clearLiquid(x + xx, y + yy); } set(x - 4, y - 3, T.TORCH); set(x + 4, y - 3, T.TORCH); world.placeFurniture(x + 2, y - 2, T.HELLFORGE); chest(x - 4, y - 1, [[choose(['flamelash', 'sunfury', 'flower_of_fire', 'hellwing_bow']), 1], ['hellstone_bar', 5], ['lesser_healing', 3], ['obsidian_skull', 1]]); world.structures.ruinedHouses = (world.structures.ruinedHouses || 0) + 1; }
    // Ash forest: ash grass and ash trees at the edges of the underworld
    for (let x = 20; x < w - 20; x++) { if (x > w * 0.25 && x < w * 0.75) continue; let y = hellLine + 8; while (y < h - 4 && get(x, y) !== T.AIR) y++; while (y < h - 4 && get(x, y + 1) === T.AIR) y++; if (get(x, y + 1) !== T.ASH) continue; set(x, y + 1, T.ASH_GRASS); world.biome[x] = world.biome[x] === BIOME.OCEAN ? BIOME.OCEAN : world.biome[x]; if (rng() < 0.12) { const th = randInt(5, 9); let ok = true; for (let j = 1; j <= th + 2; j++) if (get(x, y - j + 1) !== T.AIR) ok = false; if (ok) { for (let j = 0; j < th; j++) set(x, y - j, T.TREE, randInt(0, 3)); set(x, y - th, T.TREETOP, randInt(0, 3)); world.ashTrees = (world.ashTrees || []); world.ashTrees.push(x); } } }
    { const x = randInt(80, w - 80), y = surf[x]; for (let xx = -3; xx <= 3; xx++) for (let yy = 1; yy <= 5; yy++) { set(x + xx, y + yy, Math.abs(xx) === 3 || yy === 5 ? T.STONE : T.AIR); wall(x + xx, y + yy, W.STONE); } set(x, y, T.AIR); world.placeFurniture(x, y + 3, T.SWORD_SHRINE); world.swordShrine = { x, y: y + 3 }; }
    for (let k = 0; k < Math.round(6 * areaF); k++) { const x = randInt(30, w - 30), y = findFloor(x, world.surfaceLine + 10, hellLine - 20); if (y < 0) continue; for (let xx = -3; xx <= 3; xx++) { set(x + xx, y + 1, T.STONEBRICK); if (rng() < 0.6) set(x + xx, y, T.COIN_PILE); } world.structures.mosaics = (world.structures.mosaics || 0) + 1; }
    for (let k = 0; k < Math.round(5 * areaF); k++) { const x = randInt(30, w - 30), y = findFloor(x, world.surfaceLine + 10, hellLine - 20); if (y < 0 || get(x + 1, y) !== T.AIR || get(x + 2, y) !== T.AIR) continue; world.placeFurniture(x, y - 1, T.CAMPFIRE); set(x + 3, y, T.COIN_PILE); set(x - 2, y, T.COIN_PILE); world.structures.campsites = (world.structures.campsites || 0) + 1; }
    for (let k = 0; k < Math.round(4 * areaF); k++) { let x = randInt(40, w - 80), y = randInt(world.surfaceLine + 20, hellLine - 30); const len = randInt(25, 60); for (let i = 0; i < len; i++) { for (let yy = -3; yy <= -1; yy++) { set(x, y + yy, T.AIR); clearLiquid(x, y + yy); } set(x, y, T.MINECART_TRACK); if (i % 9 === 0) set(x, y - 3, T.TORCH); x++; if (rng() < 0.2) y += rng() < 0.5 ? 1 : -1; } world.structures.tracks = (world.structures.tracks || 0) + 1; }

    // The Dungeon: on the side opposite the jungle, a brick tower at the surface leading down into a maze of rooms
    yield { msg: 'Raising the dungeon', p: 0.895 };
    { const dxc = world.dungeonSide > 0 ? Math.floor(w * 0.92) : Math.floor(w * 0.08); const dyt = surf[dxc]; const DW = 60, DH = Math.min(hellLine - 40 - dyt - 10, 200);
      for (let yy = -14; yy < DH; yy++) for (let xx = -DW / 2; xx <= DW / 2; xx++) { const X = dxc + xx, Y = dyt + yy; if (yy < 6 && Math.abs(xx) > 8) { if (yy >= 0 && get(X, Y) !== T.AIR) set(X, Y, T.DUNGEON_BRICK); else if (yy < 0 && (get(X, Y) === T.TREE || get(X, Y) === T.TREETOP || get(X, Y) === T.PLANT)) set(X, Y, T.AIR); continue; } set(X, Y, T.DUNGEON_BRICK); wall(X, Y, W.DUNGEON); clearLiquid(X, Y); }
      for (let xx = -10; xx <= 10; xx++) for (let yy = -40; yy < -14; yy++) { const t = get(dxc + xx, dyt + yy); if (t === T.TREE || t === T.TREETOP || t === T.PLANT) set(dxc + xx, dyt + yy, T.AIR); }
      // entrance hall
      for (let yy = -12; yy < 6; yy++) for (let xx = -6; xx <= 6; xx++) set(dxc + xx, dyt + yy, T.AIR);
      set(dxc - 8, dyt - 1, T.AIR); set(dxc - 8, dyt - 2, T.AIR); set(dxc + 8, dyt - 1, T.AIR); set(dxc + 8, dyt - 2, T.AIR); set(dxc - 3, dyt - 8, T.TORCH); set(dxc + 3, dyt - 8, T.TORCH);
      // rooms grid
      const cols = 5, rows = Math.floor(DH / 14); world.dungeonChests = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const rx = dxc - DW / 2 + 3 + c * 11, ry = dyt + 8 + r * 14; if (rng() < 0.15) continue; for (let yy = 0; yy < 10; yy++) for (let xx = 0; xx < 9; xx++) set(rx + xx, ry + yy, T.AIR); if (c < cols - 1 && rng() < 0.8) for (let yy = 6; yy < 9; yy++) set(rx + 9, ry + yy, T.AIR), set(rx + 10, ry + yy, T.AIR); if (r < rows - 1 && rng() < 0.6) for (let yy = 10; yy < 14; yy++) set(rx + 4, ry + yy, T.AIR); set(rx + 1, ry + 2, T.TORCH); set(rx + 7, ry + 2, T.TORCH); if (rng() < 0.3) { for (let xx = 2; xx < 7; xx++) set(rx + xx, ry + 9, T.SPIKE); } if (rng() < 0.35) { chest(rx + 3, ry + 9, [[choose(['muramasa', 'magic_missile', 'aqua_scepter', 'cobalt_shield', 'blue_moon', 'handgun', 'valor']), 1], ['gold_bar', 5], ['lesser_healing', 4], ['dungeon_brick', 10]]); world.dungeonChests.push({ x: rx + 3, y: ry + 8 }); } }
      for (let yy = 6; yy < DH - 2; yy += 14) for (let xx = -DW / 2 + 1; xx < DW / 2; xx++) if (get(dxc + xx, dyt + yy) === T.AIR && rng() < 0.3) set(dxc + xx, dyt + yy + 9, T.PLATFORM);
      world.dungeon = { x: dxc, y: dyt, w: DW, h: DH };
    }

    // Aether: a shimmer pool in the outer caverns
    { const x = world.dungeonSide > 0 ? randInt(60, 120) : randInt(w - 120, w - 60), y = randInt(world.cavernLine, hellLine - 40); for (let yy = -6; yy <= 6; yy++) for (let xx = -12; xx <= 12; xx++) { const d = (xx / 12) ** 2 + (yy / 6) ** 2; if (d > 1.3) continue; const X = x + xx, Y = y + yy; if (d <= 1) { set(X, Y, T.AIR); world.liquid[idx(X, Y)] = yy > 0 ? 255 : 0; world.lava[idx(X, Y)] = yy > 0 ? LIQ.SHIMMER : 0; } else set(X, Y, T.PEARLSTONE); wall(X, Y, W.PEARLSTONE); } for (let xx = -8; xx <= 8; xx += 4) set(x + xx, y - 4, T.CRYSTAL_SHARD); world.aether = { x, y }; }
    // hallow columns are only converted at hardmode; mark the band now
    world.hardmode = false;
    world.rebuildTopSolid();
  },
};
function minSurfOf(surf) { let m = 1e9; for (let i = 0; i < surf.length; i++) if (surf[i] < m) m = surf[i]; return m; }
