// ---------------------------------------------------------------------------
// Procedural pixel-art sprite generation (tiles, walls, items, furniture)
// ---------------------------------------------------------------------------
'use strict';

const Sprites = {
  tiles: [],       // tiles[id] = [variant0Strip, variant1Strip, variant2Strip]; each strip 16 masks * 16px
  walls: [],       // walls[id] = 16x16 canvas
  icons: {},       // icons[itemId] = canvas (16x16 or larger)
  furniture: [],   // furniture[tileId] = canvas (w*16 x h*16)
  trunk: [],       // per biome
  canopy: [],      // per biome
  branch: [],      // per biome [left, right]
  torch: [],       // flame frames
  cracks: [],      // 4 crack overlays
  misc: {},
};

// Draw a pixel-art string array into a canvas ---------------------------------
function pixelArt(rows, palette, scale = 1) {
  const h = rows.length, w = rows[0].length;
  const c = makeCanvas(w * scale, h * scale);
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x];
    if (ch === '.' || ch === ' ') continue;
    const col = palette[ch];
    if (!col) continue;
    ctx.fillStyle = col;
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }
  return c;
}

const PIXEL_ART = {
  pick: [
    "................",
    ".....oo.........",
    "....oMMo........",
    "....oMmmo.......",
    ".....omMmo......",
    "......omMmo.....",
    ".......omMmo....",
    "......ohhomMmo..",
    ".....ohho.omMmo.",
    "....ohho...omMo.",
    "...ohho.....oo..",
    "..ohho..........",
    ".ohho...........",
    ".oho............",
    "..o.............",
    "................"],
  axe: [
    "................",
    "........oooo....",
    ".......oMMMmo...",
    "......oMMmmmmo..",
    ".....oMMmmmmmo..",
    "....oMmmmmmmmo..",
    "...ohhmmmmmmo...",
    "..ohhoommmmo....",
    ".ohho..ooooo....",
    ".oho............",
    "..o.............",
    "................",
    "................",
    "................",
    "................",
    "................"],
  hammer: [
    "................",
    "......oooooo....",
    ".....oMMMMMmo...",
    ".....oMmmmmmo...",
    ".....oMmmmmmo...",
    ".....odmmmmdo...",
    "......oohhoo....",
    ".....ohho.......",
    "....ohho........",
    "...ohho.........",
    "..ohho..........",
    ".ohho...........",
    ".oho............",
    "..o.............",
    "................",
    "................"],
  sword: [
    "..............o.",
    ".............oMo",
    "............oMmo",
    "...........oMmo.",
    "..........oMmo..",
    ".........oMmo...",
    "........oMmo....",
    ".......oMmo.....",
    "..oo..oMmo......",
    "..oGoooMo.......",
    "...oGGGo........",
    "..ohhoGGo.......",
    ".ohho.oo........",
    ".oho............",
    "..o.............",
    "................"],
  shortsword: [
    "................",
    "................",
    "................",
    "..........oo....",
    ".........oMmo...",
    "........oMmo....",
    ".......oMmo.....",
    "......oMmo......",
    "..oo.oMmo.......",
    "..oGooMo........",
    "...oGGo.........",
    "..ohhoGo........",
    ".ohho.oo........",
    ".oho............",
    "..o.............",
    "................"],
  torch: [
    "................",
    "................",
    "......oooo......",
    ".....oYYYYo.....",
    "....oYYOOYYo....",
    "....oYOOOOYo....",
    ".....oOOOOo.....",
    "......oOOo......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    "......ohho......",
    ".......oo.......",
    "................",
    "................"],
  gel: [
    "................",
    "................",
    "................",
    ".....oooooo.....",
    "....oBbbbbbo....",
    "...oBBbbbbbbo...",
    "...obbbbbbbbo...",
    "...obbbbbbbbo...",
    "...obbbbbbbbo...",
    "....odbbbbdo....",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................",
    "................"],
  bar: [
    "................",
    "................",
    "................",
    "................",
    "......oooooooo..",
    ".....oMMMMMMMmo.",
    "....oMmmmmmmmmo.",
    "...oMmmmmmmmmdo.",
    "..ommmmmmmmmddo.",
    "..oddddddddddo..",
    "...oooooooooo...",
    "................",
    "................",
    "................",
    "................",
    "................"],
  acorn: [
    "................",
    "................",
    "................",
    "......oo........",
    ".....oGGo.......",
    "....oGGGGo......",
    "...oGGGGGGo.....",
    "...oooooooo.....",
    "....oBbbbo......",
    "....oBbbbo......",
    ".....obbo.......",
    "......oo........",
    "................",
    "................",
    "................",
    "................"],
  lens: [
    "................",
    "................",
    "................",
    ".....oooooo.....",
    "....oWWwwwwo....",
    "...oWWwwwwwwo...",
    "...oWwwwkkwwo...",
    "...owwwwkkwwo...",
    "...owwwwwwwwo...",
    "....owwwwwwo....",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................",
    "................"],
  mushroom: [
    "................",
    "................",
    "......oooo......",
    "....ooRRRRoo....",
    "...oRWRRRRWRo...",
    "..oRRRRWRRRRRo..",
    "..oooooooooooo..",
    ".....oSssSo.....",
    ".....oSssSo.....",
    ".....osssso.....",
    "......oooo......",
    "................",
    "................",
    "................",
    "................",
    "................"],
  chunk: [
    "................",
    "................",
    "................",
    "....ooo.oo......",
    "...oGgggggo.....",
    "..oGggkgggo.....",
    "..oggggggggo....",
    "...oggkgggo.....",
    "...ogggggo......",
    "....ooooo.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"],
  gem: [
    "................",
    "................",
    "................",
    ".....oooooo.....",
    "....oWCCCCco....",
    "...oWCCCCCcco...",
    "....oCCCCcco....",
    ".....oCCcco.....",
    "......occo......",
    ".......oo.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................"],
  bottle: [
    "................",
    "................",
    "......oooo......",
    "......oGGo......",
    "......oggo......",
    ".....oggggo.....",
    "....oggggggo....",
    "....ogWggggo....",
    "....ogWggggo....",
    "....oggggggo....",
    "....oggggggo....",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................"],
  potion: [
    "................",
    "................",
    "......oooo......",
    "......oGGo......",
    "......oggo......",
    ".....oggggo.....",
    "....oRRRRRRo....",
    "....oRWRRRRo....",
    "....oRWRRRRo....",
    "....oRRRRRro....",
    "....oRRRRrro....",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................"],
  bomb: [
    "................",
    "........oY......",
    ".......oYo......",
    "......ohho......",
    ".....oooooo.....",
    "....okkkkkko....",
    "...okKkkkkkko...",
    "...okkkkkkkko...",
    "...okkkkkkkko...",
    "...okkkkkkkko...",
    "....okkkkkko....",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................"],
  hook: [
    "................",
    "..............o.",
    ".............oMo",
    "............oMo.",
    "...........oMo..",
    "..........oMo...",
    ".........oMo....",
    "....oo..oMo.....",
    "...oMMooMo......",
    "..oMooMMo.......",
    "..oMo.oo........",
    "..oMo...........",
    "...oMoo.........",
    "....oMMo........",
    ".....ooo........",
    "................"],
  heart: [
    "................",
    "................",
    "...oo....oo.....",
    "..oRRo..oRRo....",
    ".oRWRRooRRRRo...",
    ".oRRRRRRRRRRo...",
    ".oRRRRRRRRRRo...",
    "..oRRRRRRRRo....",
    "...oRRRRRRo.....",
    "....oRRRRo......",
    ".....oRRo.......",
    "......oo........",
    "................",
    "................",
    "................",
    "................"],
  lifecrystal: [
    "................",
    "................",
    "...oo....oo.....",
    "..oPPo..oPPo....",
    ".oPWPPooPPPPo...",
    ".oPPPPPPPPPPo...",
    ".oPPPpppppppo...",
    "..oPPppppppo....",
    "...oPpppppo.....",
    "....oppppo......",
    ".....oppo.......",
    "......oo........",
    "................",
    "................",
    "................",
    "................"],
  cactus: [
    "................",
    "................",
    "......oooo......",
    ".....oGggGo.....",
    "..oo.oGggGo.oo..",
    ".oGgooGggGooGgo.",
    ".oGgggGggGgggGo.",
    "..ooGgGggGgGoo..",
    "....oGGggGGo....",
    ".....oGggGo.....",
    ".....oGggGo.....",
    ".....oGggGo.....",
    "......oooo......",
    "................",
    "................",
    "................"],
  cobweb: [
    "................",
    ".W.....W.....W..",
    "..W....W....W...",
    "...W...W...W....",
    "....W..W..W.....",
    ".....W.W.W......",
    "WWWWWWWWWWWWWWW.",
    ".....W.W.W......",
    "....W..W..W.....",
    "...W...W...W....",
    "..W....W....W...",
    ".W.....W.....W..",
    "................",
    "................",
    "................",
    "................"],
};

// Common palettes
PIXEL_ART.helmet = [
    "................",
    "................",
    "................",
    ".....oooooo.....",
    "....oMMMMMMo....",
    "...oMMmmmmmmo...",
    "...oMmmmmmmmo...",
    "...ommmmmmmmo...",
    "...ommo..ommo...",
    "...oddo..oddo...",
    "....oo....oo....",
    "................",
    "................",
    "................",
    "................",
    "................"];
PIXEL_ART.chainmail = [
    "................",
    "................",
    "..ooo......ooo..",
    ".oMMMoooooMMMo..",
    ".oMmmmMMMmmmmo..",
    ".ommmmmmmmmmmo..",
    ".oddommmmmoddo..",
    "..oo.ommmmo.oo..",
    ".....ommmmo.....",
    ".....ommmmo.....",
    ".....odmmdo.....",
    ".....oddddo.....",
    "......oooo......",
    "................",
    "................",
    "................"];
PIXEL_ART.greaves = [
    "................",
    "................",
    "................",
    "....oooooooo....",
    "....oMMmmmmo....",
    "....ommoommo....",
    "....ommo.ommo...",
    "....ommo.ommo...",
    "....ommo.ommo...",
    "....oddo.oddo...",
    "...odddo.odddo..",
    "...ooooo.ooooo..",
    "................",
    "................",
    "................",
    "................"];
PIXEL_ART.pistol = [
    "................",
    "................",
    "................",
    "................",
    "..oooooooooooo..",
    ".oMMMMMMMMMMMMo.",
    ".ommmmmmmmmmmdo.",
    "..oooooddoooooo.",
    "......ohhoo.....",
    "......ohhho.....",
    ".....ohhho......",
    ".....ohho.......",
    "......oo........",
    "................",
    "................",
    "................"];
PIXEL_ART.bulletIcon = [
    "................",
    "................",
    "................",
    "................",
    "................",
    "......oooo......",
    ".....oMMmmo.....",
    ".....oMmmmo.....",
    ".....ommmdo.....",
    ".....oddddo.....",
    "......oooo......",
    "................",
    "................",
    "................",
    "................",
    "................"];
PIXEL_ART.grenade = [
    "................",
    "......oo........",
    ".....oYYo.......",
    ".....oooo.......",
    "....ogggo.......",
    "...oGgggggo.....",
    "..oGggggggggo...",
    "..oggggggggo....",
    "..oggkgggkgo....",
    "..oggggggggo....",
    "...oggggggo.....",
    "....oooooo......",
    "................",
    "................",
    "................",
    "................"];
PIXEL_ART.dynamite = [
    "................",
    ".........oY.....",
    "........oYo.....",
    ".......ohho.....",
    "......oRRRo.....",
    ".....oRRRRo.....",
    "....oRRRRo......",
    "...oRRRRo.......",
    "..oRRRRo........",
    ".oRRRRo.........",
    ".oRRRo..........",
    ".oooo...........",
    "................",
    "................",
    "................",
    "................"];
PIXEL_ART.coin = [
    "................",
    "................",
    "................",
    "................",
    ".....oooooo.....",
    "....oMMMmmmo....",
    "...oMMmmmmmmo...",
    "...oMmmmmmmdo...",
    "...ommmmmmddo...",
    "....odddddddo...",
    ".....oooooo.....",
    "................",
    "................",
    "................",
    "................",
    "................"];

const PAL_COMMON = {
  o: '#1c1410', h: '#8b5a2b', H: '#b07a45', G: '#c8a030', Y: '#ffe060', O: '#ff9020',
  B: '#a0e0ff', b: '#40a0e0', d: '#2060a0', W: '#ffffff', w: '#c8d8e8', k: '#202028', K: '#505060',
  R: '#e03030', r: '#a02020', S: '#f0e0c8', s: '#c0a888', C: '#80f0ff', c: '#30a0c0', P: '#ff60a0', p: '#c03070',
  g: '#6aa040',
};

function iconPalette(mat, extra = {}) {
  const m = MATERIALS[mat] || MATERIALS.iron;
  return Object.assign({}, PAL_COMMON, { M: m.M, m: m.m, d: m.d }, extra);
}

// Tile texture painters ------------------------------------------------------
function speckle(ctx, rng, base, cols, count, x0 = 0, y0 = 0, w = 16, h = 16) {
  ctx.fillStyle = base;
  ctx.fillRect(x0, y0, w, h);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = cols[Math.floor(rng() * cols.length)];
    ctx.fillRect(x0 + Math.floor(rng() * w), y0 + Math.floor(rng() * h), 1, 1);
  }
}

function blobs(ctx, rng, cols, n, size) {
  for (let i = 0; i < n; i++) {
    const cx = 2 + Math.floor(rng() * 11), cy = 2 + Math.floor(rng() * 11);
    const s = size + Math.floor(rng() * 2);
    ctx.fillStyle = cols[1];
    ctx.fillRect(cx, cy, s, s);
    ctx.fillStyle = cols[0];
    ctx.fillRect(cx, cy, 1, 1);
    ctx.fillStyle = cols[2];
    ctx.fillRect(cx + s - 1, cy + s - 1, 1, 1);
  }
}

function brickPattern(ctx, rng, base, mortar, light, dark) {
  ctx.fillStyle = mortar; ctx.fillRect(0, 0, 16, 16);
  for (let row = 0; row < 4; row++) {
    const off = (row % 2) * 4;
    for (let col = -1; col < 3; col++) {
      const bx = col * 8 + off, by = row * 4;
      ctx.fillStyle = base; ctx.fillRect(bx + 1, by + 1, 7, 3);
      ctx.fillStyle = light; ctx.fillRect(bx + 1, by + 1, 7, 1);
      ctx.fillStyle = dark; ctx.fillRect(bx + 1, by + 3, 7, 1);
      if (rng() < 0.3) { ctx.fillStyle = dark; ctx.fillRect(bx + 2 + Math.floor(rng() * 5), by + 2, 1, 1); }
    }
  }
}

const TILE_PAINTERS = {
  [T.DIRT]: (c, r) => { speckle(c, r, '#8a5a2b', ['#7a4a20', '#9a6a38', '#6e4420', '#a0703c'], 40); blobs(c, r, ['#a07848', '#6a4420', '#5a3818'], 2, 1); },
  [T.GRASS]: (c, r) => { speckle(c, r, '#8a5a2b', ['#7a4a20', '#9a6a38', '#6e4420', '#a0703c'], 40); },
  [T.STONE]: (c, r) => { speckle(c, r, '#7e7e86', ['#6e6e76', '#8e8e96', '#666670', '#96969e'], 40); for (let i = 0; i < 2; i++) { c.fillStyle = '#5e5e66'; const x = Math.floor(r() * 12), y = Math.floor(r() * 12); c.fillRect(x, y, 3, 1); c.fillRect(x + 2, y + 1, 1, 2); } },
  [T.COPPER]: (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#f2a86e', '#c87533', '#8a4a22'], 4, 2); },
  [T.IRON]: (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#e6e6ee', '#b0b4c4', '#6a6e80'], 4, 2); },
  [T.SILVER]: (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#ffffff', '#dfe6f4', '#8a94aa'], 4, 2); },
  [T.GOLD]: (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#fff0a0', '#e8c030', '#a07818'], 4, 2); },
  [T.GEM]: (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#ffffff', '#80f0ff', '#30a0c0'], 3, 2); },
  [T.SAND]: (c, r) => { speckle(c, r, '#d9c88a', ['#c9b878', '#e6d69a', '#c0ae70', '#ecdca6'], 40); },
  [T.SANDSTONE]: (c, r) => brickPattern(c, r, '#c8a868', '#9a7e48', '#dcc084', '#a88c50'),
  [T.SNOW]: (c, r) => { speckle(c, r, '#e8f0f8', ['#d8e4f0', '#f4f8ff', '#ccd8e8', '#ffffff'], 30); },
  [T.ICE]: (c, r) => { speckle(c, r, '#a8d8f0', ['#98c8e8', '#c0e8ff', '#88b8dc', '#e0f4ff'], 30); c.fillStyle = '#d8f0ff'; c.fillRect(3, 3, 1, 4); c.fillRect(4, 2, 1, 2); c.fillRect(10, 9, 1, 4); },
  [T.CLAY]: (c, r) => { speckle(c, r, '#b86a3a', ['#a85a2a', '#c87a4a', '#985020', '#d08858'], 40); },
  [T.MUD]: (c, r) => { speckle(c, r, '#5a4030', ['#4a3020', '#6a5040', '#402818', '#725848'], 40); },
  [T.WOOD]: (c, r) => { c.fillStyle = '#a8794b'; c.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { c.fillStyle = '#8a6038'; c.fillRect(0, y + 3, 16, 1); c.fillStyle = '#b88a5c'; c.fillRect(0, y, 16, 1); } c.fillStyle = '#6a4828'; c.fillRect(2, 1, 1, 1); c.fillRect(12, 9, 1, 1); c.fillRect(7, 5, 1, 1); },
  [T.WOODPLANKS]: (c, r) => { c.fillStyle = '#c09060'; c.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { c.fillStyle = '#a07848'; c.fillRect(0, y + 3, 16, 1); c.fillStyle = '#d0a070'; c.fillRect(0, y, 16, 1); } for (let i = 0; i < 4; i++) { c.fillStyle = '#7a5838'; c.fillRect(Math.floor(r() * 16), Math.floor(r() * 4) * 4 + 1, 1, 1); } },
  [T.STONEBRICK]: (c, r) => brickPattern(c, r, '#8a8a92', '#5a5a62', '#9e9ea6', '#72727a'),
  [T.GLASS]: (c, r) => { c.fillStyle = 'rgba(200,232,255,0.45)'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(2, 2, 1, 6); c.fillRect(3, 2, 4, 1); c.fillStyle = 'rgba(140,190,230,0.8)'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16); },
  [T.BEDROCK]: (c, r) => { speckle(c, r, '#2a2a30', ['#1e1e24', '#36363c', '#181820'], 40); },
  [T.ASH]: (c, r) => { speckle(c, r, '#4a4048', ['#3a3038', '#5a5058', '#302830', '#605060'], 40); },
  [T.HELLSTONE]: (c, r) => { speckle(c, r, '#4a4048', ['#3a3038', '#5a5058', '#302830'], 30); blobs(c, r, ['#ffd060', '#ff6020', '#a02010'], 4, 2); },
  [T.OBSIDIAN]: (c, r) => { speckle(c, r, '#2a1e3a', ['#1e1430', '#3a2a4a', '#4a3860', '#160e24'], 40); c.fillStyle = '#6a5088'; c.fillRect(4, 3, 1, 3); c.fillRect(11, 10, 1, 3); },
  [T.TREE]: (c, r) => { c.fillStyle = '#6e4a2a'; c.fillRect(0, 0, 16, 16); for (let i = 0; i < 6; i++) { c.fillStyle = r() < 0.5 ? '#5a3a1e' : '#7e5a3a'; c.fillRect(Math.floor(r() * 14), Math.floor(r() * 12), 1, 3 + Math.floor(r() * 4)); } },
  [T.CACTUS]: (c, r) => { c.fillStyle = '#3f9e3f'; c.fillRect(2, 0, 12, 16); c.fillStyle = '#2f7e2f'; c.fillRect(2, 0, 1, 16); c.fillRect(13, 0, 1, 16); c.fillRect(7, 0, 1, 16); c.fillStyle = '#6fce6f'; c.fillRect(4, 0, 1, 16); c.fillRect(10, 0, 1, 16); c.fillStyle = '#e8f0c0'; c.fillRect(0, 3, 2, 1); c.fillRect(14, 8, 2, 1); c.fillRect(0, 12, 2, 1); },
  [T.LEAVES]: (c, r) => { speckle(c, r, '#2f8a2b', ['#247a22', '#3aa038', '#1e6a1c', '#48b046'], 40); },
};

// Wall painters
const WALL_PAINTERS = {
  [W.DIRT]: (c, r) => speckle(c, r, '#4a3018', ['#402810', '#54381e', '#3a2410'], 30),
  [W.DIRT_SAFE]: (c, r) => speckle(c, r, '#4a3018', ['#402810', '#54381e', '#3a2410'], 30),
  [W.STONE]: (c, r) => speckle(c, r, '#3a3a40', ['#323238', '#42424a', '#2c2c32'], 30),
  [W.SNOW]: (c, r) => speckle(c, r, '#6a7a8a', ['#607080', '#748494', '#586878'], 30),
  [W.SAND]: (c, r) => speckle(c, r, '#7a6a44', ['#70603c', '#84744e', '#685838'], 30),
  [W.WOOD]: (c, r) => { c.fillStyle = '#6a4a2c'; c.fillRect(0, 0, 16, 16); for (let x = 0; x < 16; x += 4) { c.fillStyle = '#5a3c22'; c.fillRect(x + 3, 0, 1, 16); c.fillStyle = '#76543a'; c.fillRect(x, 0, 1, 16); } },
  [W.PLANKS]: (c, r) => { c.fillStyle = '#7a5a34'; c.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { c.fillStyle = '#684828'; c.fillRect(0, y + 3, 16, 1); c.fillStyle = '#8a6a42'; c.fillRect(0, y, 16, 1); } },
  [W.STONEBRICK]: (c, r) => brickPattern(c, r, '#4a4a52', '#34343a', '#56565e', '#40404a'),
  [W.GLASS]: (c, r) => { c.fillStyle = 'rgba(120,160,200,0.5)'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(160,200,240,0.6)'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); },
};

// Build a 16-mask strip for a tile variant. mask bits: 1 top, 2 right, 4 bottom, 8 left (exposed sides)
function buildTileStrip(id, variant, seed) {
  const strip = makeCanvas(16 * 16, 16);
  const sctx = strip.getContext('2d');
  const base = makeCanvas(16, 16);
  const bctx = base.getContext('2d');
  const rng = mulberry32(seed + id * 977 + variant * 31);
  const painter = TILE_PAINTERS[id];
  if (painter) painter(bctx, rng); else { bctx.fillStyle = TILES[id].color || '#f0f'; bctx.fillRect(0, 0, 16, 16); }
  const isGrass = id === T.GRASS;
  for (let mask = 0; mask < 16; mask++) {
    const ox = mask * 16;
    sctx.drawImage(base, ox, 0);
    if (id === T.GLASS || id === T.LEAVES) continue;
    const top = mask & 1, right = mask & 2, bottom = mask & 4, left = mask & 8;
    if (isGrass) {
      const g1 = '#3cb043', g2 = '#2c8a33', g3 = '#58cc5c';
      if (top) {
        sctx.fillStyle = g2; sctx.fillRect(ox, 0, 16, 4);
        sctx.fillStyle = g1; sctx.fillRect(ox, 0, 16, 3);
        sctx.fillStyle = g3; sctx.fillRect(ox, 0, 16, 1);
        // little blades
        const r2 = mulberry32(seed + mask * 7 + variant);
        for (let i = 0; i < 4; i++) { const bx = Math.floor(r2() * 16); sctx.fillStyle = g1; sctx.fillRect(ox + bx, -1 + 0, 1, 1); sctx.fillStyle = g2; sctx.fillRect(ox + bx, 4, 1, 1 + Math.floor(r2() * 2)); }
      }
      if (left) { sctx.fillStyle = g2; sctx.fillRect(ox, 0, 2, 16); sctx.fillStyle = g1; sctx.fillRect(ox, 0, 1, 16); }
      if (right) { sctx.fillStyle = g2; sctx.fillRect(ox + 14, 0, 2, 16); sctx.fillStyle = g1; sctx.fillRect(ox + 15, 0, 1, 16); }
      if (bottom) { sctx.fillStyle = g2; sctx.fillRect(ox, 14, 16, 2); }
    } else {
      sctx.fillStyle = 'rgba(0,0,0,0.28)';
      if (bottom) sctx.fillRect(ox, 15, 16, 1);
      if (right) sctx.fillRect(ox + 15, 0, 1, 16);
      if (left) sctx.fillRect(ox, 0, 1, 16);
      sctx.fillStyle = 'rgba(255,255,255,0.18)';
      if (top) sctx.fillRect(ox, 0, 16, 1);
      if (left) sctx.fillRect(ox, 0, 1, 16);
      sctx.fillStyle = 'rgba(0,0,0,0.12)';
      if (top) sctx.fillRect(ox, 1, 16, 1);
    }
  }
  return strip;
}

// Furniture sprites -----------------------------------------------------------
function buildFurniture() {
  const F = Sprites.furniture;
  // Work bench 32x16
  { const c = makeCanvas(32, 16), x = c.getContext('2d');
    x.fillStyle = '#8a6038'; x.fillRect(0, 2, 32, 4); x.fillStyle = '#b88a5c'; x.fillRect(0, 2, 32, 1); x.fillStyle = '#6a4828'; x.fillRect(0, 5, 32, 1);
    x.fillStyle = '#7a5030'; x.fillRect(2, 6, 3, 10); x.fillRect(27, 6, 3, 10); x.fillRect(6, 9, 20, 2); x.fillStyle = '#5a3820'; x.fillRect(4, 6, 1, 10); x.fillRect(29, 6, 1, 10);
    F[T.WORKBENCH] = c; }
  // Chest 32x32
  { const c = makeCanvas(32, 32), x = c.getContext('2d');
    x.fillStyle = '#3a2814'; x.fillRect(1, 6, 30, 26);
    x.fillStyle = '#9a6a3c'; x.fillRect(2, 7, 28, 24);
    x.fillStyle = '#b88050'; x.fillRect(2, 7, 28, 2); x.fillRect(2, 16, 28, 1);
    x.fillStyle = '#5a3c22'; x.fillRect(2, 14, 28, 2); x.fillRect(2, 29, 28, 2);
    x.fillStyle = '#8a8a90'; x.fillRect(2, 9, 2, 20); x.fillRect(28, 9, 2, 20); x.fillRect(8, 7, 2, 24); x.fillRect(22, 7, 2, 24);
    x.fillStyle = '#e8c040'; x.fillRect(13, 13, 6, 6); x.fillStyle = '#a08020'; x.fillRect(15, 15, 2, 3);
    F[T.CHEST] = c; }
  // Furnace 48x32
  { const c = makeCanvas(48, 32), x = c.getContext('2d');
    const rng = mulberry32(5);
    for (let yy = 0; yy < 32; yy += 4) for (let xx = 0; xx < 48; xx += 8) { const o = (yy / 4) % 2 ? 4 : 0; x.fillStyle = rng() < 0.5 ? '#6a6a72' : '#7a7a82'; x.fillRect(xx + o, yy, 7, 3); }
    x.fillStyle = '#4a4a52'; x.fillRect(0, 0, 48, 1); x.fillRect(0, 31, 48, 1);
    x.fillStyle = '#201010'; x.fillRect(14, 14, 20, 16);
    x.fillStyle = '#ff6020'; x.fillRect(16, 18, 16, 12); x.fillStyle = '#ffb030'; x.fillRect(19, 22, 10, 8); x.fillStyle = '#fff090'; x.fillRect(22, 26, 4, 4);
    x.fillStyle = '#3a3a42'; x.fillRect(20, 2, 8, 8); x.fillStyle = '#2a2a32'; x.fillRect(22, 0, 4, 4);
    F[T.FURNACE] = c; }
  // Anvil 32x16
  { const c = makeCanvas(32, 16), x = c.getContext('2d');
    x.fillStyle = '#4a4a56'; x.fillRect(2, 2, 28, 5); x.fillStyle = '#6a6a78'; x.fillRect(2, 2, 28, 1); x.fillRect(0, 3, 4, 3);
    x.fillStyle = '#3a3a46'; x.fillRect(10, 7, 12, 4); x.fillRect(6, 11, 20, 5); x.fillStyle = '#2a2a36'; x.fillRect(6, 15, 20, 1);
    F[T.ANVIL] = c; }
  // Door closed 16x48
  { const c = makeCanvas(16, 48), x = c.getContext('2d');
    x.fillStyle = '#5a3c22'; x.fillRect(0, 0, 16, 48); x.fillStyle = '#9a6a3c'; x.fillRect(1, 1, 14, 46);
    x.fillStyle = '#7a5030'; x.fillRect(3, 4, 10, 16); x.fillRect(3, 26, 10, 18); x.fillStyle = '#b88050'; x.fillRect(3, 4, 10, 1); x.fillRect(3, 26, 10, 1);
    x.fillStyle = '#e8c040'; x.fillRect(11, 23, 2, 2);
    F[T.DOOR_C] = c; }
  // Door open 16x48 (thin panel against left side)
  { const c = makeCanvas(16, 48), x = c.getContext('2d');
    x.fillStyle = '#5a3c22'; x.fillRect(0, 0, 5, 48); x.fillStyle = '#9a6a3c'; x.fillRect(1, 1, 3, 46); x.fillStyle = '#e8c040'; x.fillRect(3, 23, 1, 2);
    x.fillStyle = 'rgba(60,40,20,0.5)'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 47, 16, 1);
    F[T.DOOR_O] = c; }
  // Table 48x32
  { const c = makeCanvas(48, 32), x = c.getContext('2d');
    x.fillStyle = '#8a6038'; x.fillRect(0, 4, 48, 5); x.fillStyle = '#b88a5c'; x.fillRect(0, 4, 48, 1); x.fillStyle = '#6a4828'; x.fillRect(0, 8, 48, 1);
    x.fillStyle = '#7a5030'; x.fillRect(3, 9, 4, 23); x.fillRect(41, 9, 4, 23); x.fillStyle = '#5a3820'; x.fillRect(6, 9, 1, 23); x.fillRect(44, 9, 1, 23);
    F[T.TABLE] = c; }
  // Chair 16x32
  { const c = makeCanvas(16, 32), x = c.getContext('2d');
    x.fillStyle = '#8a6038'; x.fillRect(2, 2, 4, 30); x.fillRect(2, 16, 12, 4); x.fillRect(12, 18, 3, 14); x.fillStyle = '#b88a5c'; x.fillRect(2, 2, 4, 1); x.fillRect(2, 16, 12, 1); x.fillStyle = '#6a4828'; x.fillRect(2, 19, 12, 1);
    F[T.CHAIR] = c; }
  // Campfire 48x16
  { const c = makeCanvas(48, 16), x = c.getContext('2d');
    x.fillStyle = '#6e4a2a'; x.fillRect(4, 11, 40, 4); x.fillRect(8, 8, 32, 4); x.fillStyle = '#5a3a1e'; x.fillRect(4, 14, 40, 1); x.fillRect(20, 8, 2, 4);
    x.fillStyle = '#ff6020'; x.fillRect(16, 2, 16, 8); x.fillStyle = '#ffb030'; x.fillRect(19, 4, 10, 6); x.fillStyle = '#fff090'; x.fillRect(22, 6, 4, 4); x.fillStyle = '#ff6020'; x.fillRect(22, 0, 3, 3); x.fillRect(28, 1, 2, 2);
    F[T.CAMPFIRE] = c; }
  // Tombstone 32x32
  { const c = makeCanvas(32, 32), x = c.getContext('2d');
    x.fillStyle = '#6a6a72'; x.beginPath(); x.moveTo(4, 32); x.lineTo(4, 12); x.quadraticCurveTo(4, 2, 16, 2); x.quadraticCurveTo(28, 2, 28, 12); x.lineTo(28, 32); x.closePath(); x.fill();
    x.fillStyle = '#8a8a92'; x.beginPath(); x.moveTo(7, 32); x.lineTo(7, 13); x.quadraticCurveTo(7, 5, 16, 5); x.quadraticCurveTo(25, 5, 25, 13); x.lineTo(25, 32); x.closePath(); x.fill();
    x.fillStyle = '#5a5a62'; x.fillRect(11, 12, 10, 2); x.fillRect(11, 17, 10, 2); x.fillRect(11, 22, 7, 2);
    x.fillStyle = '#4a7a3a'; x.fillRect(2, 29, 28, 3);
    F[T.TOMBSTONE] = c; }
  // Pet Forge 48x32
  { const c = makeCanvas(48, 32), x = c.getContext('2d');
    x.fillStyle = '#5a4a3a'; x.fillRect(2, 20, 44, 12); x.fillStyle = '#7a6a5a'; x.fillRect(2, 20, 44, 2);
    x.fillStyle = '#4a4a56'; x.fillRect(6, 10, 22, 10); x.fillStyle = '#6a6a78'; x.fillRect(6, 10, 22, 2);
    x.fillStyle = '#c08040'; x.fillRect(30, 12, 14, 8); x.fillStyle = '#ffb060'; x.fillRect(32, 14, 10, 4);
    x.fillStyle = '#ff6020'; x.fillRect(34, 4, 6, 8); x.fillStyle = '#ffe060'; x.fillRect(36, 6, 2, 4);
    x.fillStyle = '#e8e8e0'; x.fillRect(10, 4, 4, 6); x.fillRect(18, 2, 4, 8);
    F[T.PETFORGE] = c; }
  // Lantern 16x16
  { const c = makeCanvas(16, 16), x = c.getContext('2d');
    x.fillStyle = '#3a3a42'; x.fillRect(7, 0, 2, 3); x.fillRect(4, 3, 8, 2); x.fillRect(4, 13, 8, 2);
    x.fillStyle = '#ffe080'; x.fillRect(5, 5, 6, 8); x.fillStyle = '#fff8d0'; x.fillRect(6, 6, 2, 3); x.fillStyle = '#3a3a42'; x.fillRect(4, 5, 1, 8); x.fillRect(11, 5, 1, 8);
    F[T.LANTERN] = c; }
  // Life crystal 16x16
  { const c = pixelArt(PIXEL_ART.lifecrystal, PAL_COMMON); F[T.LIFECRYSTAL] = c; }
  // Cobweb
  { F[T.COBWEB] = pixelArt(PIXEL_ART.cobweb, { W: 'rgba(240,240,255,0.85)' }); }
  // Glow mushroom
  { const c = makeCanvas(16, 16), x = c.getContext('2d');
    x.fillStyle = '#4090e0'; x.fillRect(3, 4, 10, 4); x.fillRect(5, 2, 6, 2); x.fillStyle = '#80d0ff'; x.fillRect(5, 3, 2, 1); x.fillRect(9, 5, 2, 1);
    x.fillStyle = '#d0e8ff'; x.fillRect(6, 8, 4, 8); x.fillStyle = '#a0c0e0'; x.fillRect(9, 8, 1, 8);
    F[T.MUSHROOM_GLOW] = c; }
  // Sapling
  { const c = makeCanvas(16, 16), x = c.getContext('2d');
    x.fillStyle = '#6e4a2a'; x.fillRect(7, 8, 2, 8); x.fillStyle = '#3aa038'; x.fillRect(4, 4, 4, 4); x.fillRect(8, 6, 4, 4); x.fillRect(6, 2, 4, 3); x.fillStyle = '#58cc5c'; x.fillRect(5, 5, 2, 1); x.fillRect(7, 3, 2, 1);
    F[T.SAPLING] = c; }
  // Plants: variants 0-2 grass tufts, 3-5 flowers, 6 mushroom
  const plants = [];
  for (let v = 0; v < 7; v++) {
    const c = makeCanvas(16, 16), x = c.getContext('2d');
    const rng = mulberry32(100 + v);
    if (v < 3) {
      for (let i = 0; i < 5; i++) { const bx = 1 + Math.floor(rng() * 13), h = 4 + Math.floor(rng() * 7); x.fillStyle = rng() < 0.5 ? '#3aa038' : '#58cc5c'; x.fillRect(bx, 16 - h, 1, h); x.fillRect(bx + (rng() < 0.5 ? 1 : -1), 16 - h + 2, 1, 2); }
    } else if (v < 6) {
      for (let i = 0; i < 3; i++) { const bx = 2 + Math.floor(rng() * 11), h = 5 + Math.floor(rng() * 5); x.fillStyle = '#3aa038'; x.fillRect(bx, 16 - h, 1, h); const fc = ['#ff6080', '#ffe040', '#80a0ff', '#ffffff'][Math.floor(rng() * 4)]; x.fillStyle = fc; x.fillRect(bx - 1, 16 - h - 2, 3, 3); x.fillStyle = '#ffd040'; x.fillRect(bx, 16 - h - 1, 1, 1); }
    } else {
      x.fillStyle = '#c04030'; x.fillRect(4, 6, 8, 4); x.fillRect(6, 4, 4, 2); x.fillStyle = '#ffe0e0'; x.fillRect(6, 7, 1, 1); x.fillRect(9, 6, 1, 1); x.fillStyle = '#f0e0c8'; x.fillRect(6, 10, 4, 6); x.fillStyle = '#c0a888'; x.fillRect(9, 10, 1, 6);
    }
    plants.push(c);
  }
  Sprites.misc.plants = plants;
}

// Trees per biome ---------------------------------------------------------------
const TREE_STYLES = [
  { bark: ['#6e4a2a', '#5a3a1e', '#7e5a3a'], leaf: ['#2f8a2b', '#247a22', '#3aa038', '#48b046'] },
  null, // desert: no trees
  { bark: ['#7a6a5a', '#5e5044', '#8e8070'], leaf: ['#7aa88a', '#5a8a6a', '#a0c8b0', '#d0e8d8'] },
  { bark: ['#5a4a2a', '#42361c', '#6c5a36'], leaf: ['#3ab040', '#28902e', '#58d060', '#70e878'] },
];
function buildTrees(seed) {
  const biomes = TREE_STYLES;
  for (let b = 0; b < biomes.length; b++) {
    const def = biomes[b] || biomes[0];
    const rng = mulberry32(seed + b * 13);
    // trunk strip: 4 variants
    const trunk = makeCanvas(64, 16), tc = trunk.getContext('2d');
    for (let v = 0; v < 4; v++) {
      tc.fillStyle = def.bark[0]; tc.fillRect(v * 16 + 2, 0, 12, 16);
      for (let i = 0; i < 6; i++) { tc.fillStyle = rng() < 0.5 ? def.bark[1] : def.bark[2]; tc.fillRect(v * 16 + 3 + Math.floor(rng() * 10), Math.floor(rng() * 12), 1, 3 + Math.floor(rng() * 4)); }
      tc.fillStyle = def.bark[1]; tc.fillRect(v * 16 + 2, 0, 1, 16); tc.fillRect(v * 16 + 13, 0, 1, 16);
    }
    Sprites.trunk[b] = trunk;
    // canopy 80x64 (5x4 tiles) anchored at bottom-center on the top trunk tile
    const cw = 80, ch = 64;
    const canopy = makeCanvas(cw, ch), cc = canopy.getContext('2d');
    const blobsN = 14;
    for (let i = 0; i < blobsN; i++) {
      const cx = 16 + rng() * 48, cy = 12 + rng() * 34, r = 10 + rng() * 10;
      cc.fillStyle = def.leaf[Math.floor(rng() * 2)];
      cc.beginPath(); cc.arc(cx, cy, r, 0, Math.PI * 2); cc.fill();
    }
    // highlights
    for (let i = 0; i < 10; i++) {
      const cx = 20 + rng() * 40, cy = 10 + rng() * 26, r = 5 + rng() * 6;
      cc.fillStyle = def.leaf[2 + Math.floor(rng() * 2)];
      cc.beginPath(); cc.arc(cx, cy, r, 0, Math.PI * 2); cc.fill();
    }
    // pixelate: sample down/up
    const small = makeCanvas(cw / 2, ch / 2), sc = small.getContext('2d');
    sc.imageSmoothingEnabled = false; sc.drawImage(canopy, 0, 0, cw / 2, ch / 2);
    cc.clearRect(0, 0, cw, ch); cc.imageSmoothingEnabled = false; cc.drawImage(small, 0, 0, cw, ch);
    // trunk stub in canopy center bottom
    cc.fillStyle = def.bark[0]; cc.fillRect(34, 40, 12, 24);
    Sprites.canopy[b] = canopy;
    // branches (left/right) 32x32 with leaves cluster
    const mk = (dir) => {
      const c = makeCanvas(32, 32), x = c.getContext('2d');
      const bx = dir < 0 ? 16 : 0;
      x.fillStyle = def.bark[0];
      if (dir < 0) { x.fillRect(4, 18, 14, 3); x.fillRect(2, 16, 4, 3); } else { x.fillRect(14, 18, 14, 3); x.fillRect(26, 16, 4, 3); }
      const cx = dir < 0 ? 6 : 26;
      for (let i = 0; i < 5; i++) { x.fillStyle = def.leaf[Math.floor(rng() * 4)]; const r = 4 + rng() * 3; x.beginPath(); x.arc(cx + (rng() - 0.5) * 10, 14 + (rng() - 0.5) * 10, r, 0, Math.PI * 2); x.fill(); }
      return c;
    };
    Sprites.branch[b] = [mk(-1), mk(1)];
  }
}

function buildTorchFrames() {
  for (let f = 0; f < 3; f++) {
    const c = makeCanvas(16, 16), x = c.getContext('2d');
    x.fillStyle = '#8b5a2b'; x.fillRect(7, 8, 2, 8); x.fillStyle = '#b07a45'; x.fillRect(7, 8, 1, 8);
    const fh = 6 + f;
    x.fillStyle = '#ff9020'; x.fillRect(5, 10 - fh, 6, fh); x.fillRect(6, 9 - fh, 4, 1);
    x.fillStyle = '#ffe060'; x.fillRect(6, 12 - fh + 1, 4, fh - 3);
    x.fillStyle = '#fffcd0'; x.fillRect(7, 12 - fh + 3, 2, 2);
    Sprites.torch.push(c);
  }
}

function buildCracks() {
  for (let s = 0; s < 4; s++) {
    const c = makeCanvas(16, 16), x = c.getContext('2d');
    const rng = mulberry32(700 + s);
    x.fillStyle = 'rgba(0,0,0,0.55)';
    const n = 3 + s * 3;
    let px = 8, py = 8;
    for (let i = 0; i < n; i++) {
      const dx = Math.floor(rng() * 3) - 1, dy = Math.floor(rng() * 3) - 1;
      px = clamp(px + dx * 2, 0, 15); py = clamp(py + dy * 2, 0, 15);
      x.fillRect(px, py, 1, 2); x.fillRect(px, py, 2, 1);
      if (i % 3 === 0) { px = 2 + Math.floor(rng() * 12); py = 2 + Math.floor(rng() * 12); }
    }
    Sprites.cracks.push(c);
  }
}

// Gem tile strips (six kinds) + gem-tinted icons
function buildGemSprites(seed) {
  Sprites.gems = [];
  const cols = [['#e0c0ff', '#b060ff', '#6030a0'], ['#ffe8a0', '#ffc040', '#a07010'], ['#a0c0ff', '#4060ff', '#203090'], ['#a0ffb0', '#40e060', '#207030'], ['#ffa0a8', '#ff3040', '#901020'], ['#ffffff', '#80f0ff', '#30a0c0']];
  for (let k = 0; k < 6; k++) {
    const strip = makeCanvas(16 * 16, 16), sctx = strip.getContext('2d');
    const base = makeCanvas(16, 16), b = base.getContext('2d');
    TILE_PAINTERS[T.STONE](b, mulberry32(seed + 900 + k)); blobs(b, mulberry32(seed + 950 + k), cols[k], 3, 2);
    for (let mask = 0; mask < 16; mask++) {
      const ox = mask * 16; sctx.drawImage(base, ox, 0);
      sctx.fillStyle = 'rgba(0,0,0,0.28)'; if (mask & 4) sctx.fillRect(ox, 15, 16, 1); if (mask & 2) sctx.fillRect(ox + 15, 0, 1, 16); if (mask & 8) sctx.fillRect(ox, 0, 1, 16);
      sctx.fillStyle = 'rgba(255,255,255,0.18)'; if (mask & 1) sctx.fillRect(ox, 0, 16, 1);
    }
    Sprites.gems[k] = [strip, strip, strip];
  }
}

// Item icons -------------------------------------------------------------------
function buildIcons() {
  const I = Sprites.icons;
  for (const id in ITEMS) {
    const it = ITEMS[id];
    if (it.icon) {
      I[id] = pixelArt(PIXEL_ART[it.icon.kind], iconPalette(it.icon.mat));
      continue;
    }
    if (it.tile != null) {
      const t = it.tile;
      if (Sprites.furniture[t]) { I[id] = Sprites.furniture[t]; continue; }
      if (t === T.TORCH) { I[id] = pixelArt(PIXEL_ART.torch, PAL_COMMON); continue; }
      if (t === T.PLATFORM) { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#8a6038'; x.fillRect(0, 6, 16, 4); x.fillStyle = '#b88a5c'; x.fillRect(0, 6, 16, 1); x.fillStyle = '#6a4828'; x.fillRect(0, 9, 16, 1); x.fillRect(4, 7, 1, 2); x.fillRect(11, 7, 1, 2); I[id] = c; continue; }
      if (t === T.CACTUS) { I[id] = pixelArt(PIXEL_ART.cactus, { o: '#1c3a1c', G: '#6fce6f', g: '#3f9e3f' }); continue; }
      if (t === T.SAPLING) { I[id] = pixelArt(PIXEL_ART.acorn, { o: '#1c1410', G: '#6a4a2a', B: '#c8a070', b: '#a07040' }); continue; }
      if (t === T.TREE) { I[id] = Sprites.trunk[0]; continue; }
      const c = makeCanvas(16, 16), x = c.getContext('2d');
      x.drawImage(Sprites.tiles[t][0], 15 * 16, 0, 16, 16, 0, 0, 16, 16);
      I[id] = c; continue;
    }
    if (it.wall != null) {
      const c = makeCanvas(16, 16), x = c.getContext('2d');
      x.drawImage(Sprites.walls[it.wall], 0, 0);
      x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1; x.strokeRect(1.5, 1.5, 13, 13);
      x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16);
      I[id] = c; continue;
    }
    // Materials
    switch (id) {
      case 'gel': I[id] = pixelArt(PIXEL_ART.gel, PAL_COMMON); break;
      case 'copper_bar': I[id] = pixelArt(PIXEL_ART.bar, iconPalette('copper')); break;
      case 'iron_bar': I[id] = pixelArt(PIXEL_ART.bar, iconPalette('iron')); break;
      case 'silver_bar': I[id] = pixelArt(PIXEL_ART.bar, iconPalette('silver')); break;
      case 'gold_bar': I[id] = pixelArt(PIXEL_ART.bar, iconPalette('gold')); break;
      case 'lens': I[id] = pixelArt(PIXEL_ART.lens, PAL_COMMON); break;
      case 'mushroom': I[id] = pixelArt(PIXEL_ART.mushroom, PAL_COMMON); break;
      case 'rotten_chunk': I[id] = pixelArt(PIXEL_ART.chunk, Object.assign({}, PAL_COMMON, { G: '#8ab060', g: '#5a8040', k: '#304020' })); break;
      case 'diamond': I[id] = pixelArt(PIXEL_ART.gem, PAL_COMMON); break;
      case 'bottle': I[id] = pixelArt(PIXEL_ART.bottle, Object.assign({}, PAL_COMMON, { G: '#c0d8e8', g: 'rgba(180,220,240,0.7)' })); break;
      case 'lesser_healing': I[id] = pixelArt(PIXEL_ART.potion, Object.assign({}, PAL_COMMON, { G: '#c0d8e8', g: 'rgba(180,220,240,0.7)' })); break;
      case 'life_crystal': I[id] = pixelArt(PIXEL_ART.lifecrystal, PAL_COMMON); break;
      case 'bomb': I[id] = pixelArt(PIXEL_ART.bomb, PAL_COMMON); break;
      case 'hook': I[id] = pixelArt(PIXEL_ART.hook, iconPalette('iron')); break;
      case 'coin_copper': I[id] = pixelArt(PIXEL_ART.coin, iconPalette('copper')); break;
      case 'coin_silver': I[id] = pixelArt(PIXEL_ART.coin, iconPalette('silver')); break;
      case 'coin_gold': I[id] = pixelArt(PIXEL_ART.coin, iconPalette('gold')); break;
      case 'coin_platinum': I[id] = pixelArt(PIXEL_ART.coin, Object.assign({}, PAL_COMMON, { M: '#ffffff', m: '#dce8ff', d: '#8aa0c8' })); break;
      case 'flintlock_pistol': I[id] = pixelArt(PIXEL_ART.pistol, iconPalette('iron')); break;
      case 'musket_ball': I[id] = pixelArt(PIXEL_ART.bulletIcon, iconPalette('iron')); break;
      case 'grenade': I[id] = pixelArt(PIXEL_ART.grenade, Object.assign({}, PAL_COMMON, { G: '#6a8a5a', g: '#3a5a3a', k: '#202020' })); break;
      case 'dynamite': I[id] = pixelArt(PIXEL_ART.dynamite, PAL_COMMON); break;
      case 'nathan_bag': case 'logan_bag': case 'hero_bag': case 'shiro_bag': case 'nago_bag': { const c = makeCanvas(16, 16), x = c.getContext('2d'); const col = { nathan_bag: '#2a6a9a', logan_bag: '#7a3a3a', hero_bag: '#4a4aa0', shiro_bag: '#6a4a8a', nago_bag: '#3a7a5a' }[id]; x.fillStyle = '#8a6a3a'; x.fillRect(3, 5, 10, 10); x.fillStyle = '#a8845a'; x.fillRect(4, 6, 8, 3); x.fillStyle = '#5a4020'; x.fillRect(6, 2, 4, 4); x.fillRect(2, 8, 12, 1); x.fillStyle = col; x.fillRect(6, 10, 4, 3); I[id] = c; break; }
      case 'amethyst': case 'topaz': case 'sapphire': case 'emerald': case 'ruby': { const g = GEMS.find(x => x.id === id); I[id] = pixelArt(PIXEL_ART.gem, Object.assign({}, PAL_COMMON, { W: g.hi, C: g.color, c: shade(g.color, 0.6) })); break; }
      case 'fallen_star': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#ffe060'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; x.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 6, 2, 2); I[id] = c; break; }
      case 'mana_crystal': I[id] = pixelArt(PIXEL_ART.lifecrystal, Object.assign({}, PAL_COMMON, { P: '#60a0ff', p: '#3050c0', W: '#c0e0ff' })); break;
      case 'lesser_mana': I[id] = pixelArt(PIXEL_ART.potion, Object.assign({}, PAL_COMMON, { G: '#c0d8e8', g: 'rgba(180,220,240,0.7)', R: '#4070ff', r: '#2040a0', W: '#c0e0ff' })); break;
      case 'wand_of_sparking': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = '#ffe060'; x.fillRect(12, 1, 3, 3); x.fillStyle = '#ff8020'; x.fillRect(13, 2, 1, 1); I[id] = c; break; }
      case 'jewelers_staff': case 'aristocrats_staff': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#c8a030'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); const gs = ITEMS[id].multi; gs.forEach((gid, k) => { const g = GEMS.find(y => y.id === gid); x.fillStyle = g.color; x.fillRect(10 + (k % 3) * 2, 1 + Math.floor(k / 3) * 2, 2, 2); }); I[id] = c; break; }
      case 'pet_food': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#c04040'; x.fillRect(2, 9, 12, 5); x.fillStyle = '#e06060'; x.fillRect(2, 9, 12, 1); x.fillStyle = '#a06030'; x.fillRect(4, 6, 8, 3); x.fillStyle = '#d08050'; x.fillRect(5, 5, 6, 2); I[id] = c; break; }
      case 'pet_tablet': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#3a3a42'; x.fillRect(2, 1, 12, 14); x.fillStyle = '#60c0ff'; x.fillRect(3, 2, 10, 11); x.fillStyle = '#fff'; x.fillRect(4, 4, 6, 1); x.fillRect(4, 6, 8, 1); x.fillRect(4, 8, 5, 1); I[id] = c; break; }
      case 'mastery_shard': I[id] = pixelArt(PIXEL_ART.gem, Object.assign({}, PAL_COMMON, { W: '#fff0c0', C: '#ffb040', c: '#c06020' })); break;
      case 'cat_license': case 'dog_license': case 'bunny_license': { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#f0e8d0'; x.fillRect(1, 3, 14, 10); x.fillStyle = '#c0a060'; x.fillRect(1, 3, 14, 2); x.fillStyle = id === 'cat_license' ? '#e0a060' : id === 'dog_license' ? '#8a6040' : '#f0f0f0'; x.fillRect(3, 6, 5, 5); x.fillStyle = '#404040'; x.fillRect(9, 7, 5, 1); x.fillRect(9, 9, 5, 1); I[id] = c; break; }
      case 'suspicious_eye': I[id] = pixelArt(PIXEL_ART.lens, Object.assign({}, PAL_COMMON, { W: '#f0e0e0', w: '#e0c8c8', k: '#c02020' })); break;
      default: {
        if (ITEMS[id].drawIcon) { const c = makeCanvas(16, 16); ITEMS[id].drawIcon(c.getContext('2d'), c); I[id] = c; break; }
        const gemOf = GEMS.find(g => id === `${g.id}_staff` || id === `${g.id}_hood` || id === `${g.id}_robe`);
        if (gemOf && id.endsWith('_staff')) { const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = gemOf.color; x.fillRect(11, 1, 4, 4); x.fillStyle = gemOf.hi; x.fillRect(12, 2, 1, 1); I[id] = c; break; }
        if (gemOf && id.endsWith('_hood')) { I[id] = pixelArt(PIXEL_ART.helmet, Object.assign({}, PAL_COMMON, { M: gemOf.hi, m: gemOf.color, d: shade(gemOf.color, 0.6) })); break; }
        if (gemOf && id.endsWith('_robe')) { I[id] = pixelArt(PIXEL_ART.chainmail, Object.assign({}, PAL_COMMON, { M: gemOf.hi, m: gemOf.color, d: shade(gemOf.color, 0.6) })); break; }
        if (ITEMS[id].accessory) { const c = makeCanvas(16, 16), x = c.getContext('2d'); const col = { band_of_starpower: '#60a0ff', magic_cloak: '#6040a0', mana_knuckles: '#8090c0', celestial_knuckles: '#e0c040', mana_field: '#40e0ff', star_band: '#ffe060', magic_glove: '#c05030' }[id] || '#c0c0c0'; x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.arc(8, 8, 5, 0, Math.PI * 2); x.stroke(); x.fillStyle = '#fff'; x.fillRect(7, 2, 2, 2); I[id] = c; break; }
        const c = makeCanvas(16, 16), x = c.getContext('2d'); x.fillStyle = '#f0f'; x.fillRect(4, 4, 8, 8); I[id] = c;
      }
    }
  }
  Sprites.misc.heart = pixelArt(PIXEL_ART.heart, PAL_COMMON);
}

function buildSprites(seed = 1337) {
  // tile strips are built on first use: with every vanilla block and furniture piece defined there are over a
  // thousand tile ids, and furniture never needs a strip at all
  const built = [];
  Sprites.tileSeed = seed;
  Sprites.tiles = new Proxy(built, { get(t, k) { if (typeof k === 'string' && k !== 'length' && !(k in t)) { const id = +k; if (Number.isInteger(id) && TILES[id] && id !== T.AIR) t[id] = [0, 1, 2].map(v => buildTileStrip(id, v, seed)); } return t[k]; } });
  for (const id of [T.DIRT, T.GRASS, T.STONE, T.WOOD, T.SAND, T.SNOW, T.ICE, T.CLAY, T.MUD, T.COPPER, T.IRON, T.SILVER, T.GOLD, T.PLATFORM, T.ASH, T.HELLSTONE, T.OBSIDIAN].filter(id => id != null)) Sprites.tiles[id];
  for (let id = 1; id < WALLS.length; id++) {
    const c = makeCanvas(16, 16), x = c.getContext('2d');
    const painter = WALL_PAINTERS[id];
    if (painter) painter(x, mulberry32(seed + id * 51)); else { x.fillStyle = WALLS[id].color; x.fillRect(0, 0, 16, 16); }
    Sprites.walls[id] = c;
  }
  buildTrees(seed);
  buildFurniture();
  if (typeof VAN !== 'undefined') VAN.buildSprites();
  buildTorchFrames();
  buildCracks();
  buildGemSprites(seed);
  buildIcons();
  if (typeof buildPetIcons === 'function') buildPetIcons();
}
