// ---------------------------------------------------------------------------
// World generation (runs as a generator so the loading screen can animate)
// ---------------------------------------------------------------------------
'use strict';

const WORLD_W = 1800;
const WORLD_H = 600;
const WORLD_SIZES = { small: [1800, 600], medium: [2800, 900], large: [4200, 1200] };

function* generateWorld(world) {
  const w = world.w, h = world.h;
  const rng = mulberry32(world.seed);
  const perlin = new Perlin(rng);
  const perlin2 = new Perlin(mulberry32(world.seed ^ 0x9e3779b9));
  const tiles = world.tiles, walls = world.walls;
  const idx = (x, y) => x + y * w;

  // --- Biomes --------------------------------------------------------------
  yield { msg: 'Shaping the land', p: 0.02 };
  Biomes.layout(world, rng);

  // --- Surface heightmap ---------------------------------------------------
  const baseY = Math.round(h / 3);
  const surf = world.surface;
  for (let x = 0; x < w; x++) {
    let n = perlin.fbm(x * 0.0035, 7.3, 4) * 42 + perlin.fbm(x * 0.018, 3.1, 3) * 9;
    // mountains toward the edges
    const edge = Math.abs(x / w - 0.5) * 2; // 0 center .. 1 edge
    n -= smoothstep((edge - 0.6) / 0.4) * 50 * (0.5 + 0.5 * perlin.noise(x * 0.01, 9.5));
    // flatten spawn area
    const dc = Math.abs(x - w / 2);
    if (dc < 60) n = lerp(0, n, smoothstep((dc - 20) / 40));
    if (world.biome[x] === BIOME.DESERT) n *= 0.45;
    surf[x] = Math.round(baseY + n);
  }
  // smooth slightly
  for (let x = 1; x < w - 1; x++) surf[x] = Math.round((surf[x - 1] + surf[x] * 2 + surf[x + 1]) / 4);
  let maxSurf = 0, minSurf = 9999;
  for (let x = 0; x < w; x++) { if (surf[x] > maxSurf) maxSurf = surf[x]; if (surf[x] < minSurf) minSurf = surf[x]; }
  world.surfaceLine = maxSurf + 6;
  world.cavernLine = Math.floor(h * 0.62);
  const hellLine = h - 70;

  // --- Fill terrain --------------------------------------------------------
  yield { msg: 'Generating terrain', p: 0.08 };
  for (let x = 0; x < w; x++) {
    const b = world.biome[x];
    const dirtDepth = 38 + perlin.noise(x * 0.01, 50.5) * 12;
    for (let y = surf[x]; y < h; y++) {
      const depth = y - surf[x];
      let t;
      if (y >= h - 1) t = T.BEDROCK;
      else if (y > hellLine) t = T.ASH;
      else if (depth < dirtDepth) {
        // dirt layer with stone patches
        const n = perlin.fbm(x * 0.05, y * 0.05, 3);
        const bt = Biomes.terrainTile(b, depth, dirtDepth, n, y, world);
        if (bt != null) t = bt;
        else if (b === BIOME.DESERT) t = depth < dirtDepth * 0.7 ? T.SAND : (n > 0.25 ? T.STONE : T.SANDSTONE);
        else if (b === BIOME.SNOW) t = n > 0.3 ? T.ICE : T.SNOW;
        else t = n > 0.33 ? T.STONE : (n < -0.4 ? T.CLAY : T.DIRT);
      } else {
        const n = perlin.fbm(x * 0.04, y * 0.04, 3);
        const bt = depth < dirtDepth * 2 ? Biomes.terrainTile(b, depth, dirtDepth, n, y, world) : null;
        if (bt != null) t = bt;
        else if (b === BIOME.SNOW && depth < dirtDepth * 1.8) t = n > 0.2 ? T.SNOW : T.ICE;
        else t = n > 0.38 ? T.DIRT : T.STONE;
      }
      tiles[idx(x, y)] = t;
    }
    if (x % 300 === 0) yield { msg: 'Generating terrain', p: 0.08 + 0.12 * x / w };
  }

  // --- Caves ---------------------------------------------------------------
  yield { msg: 'Carving caves', p: 0.22 };
  for (let y = 0; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const depth = y - surf[x];
      if (depth < 4) continue;
      const i = idx(x, y);
      // tunnels: ridged noise
      const n1 = perlin.noise(x * 0.035, y * 0.05);
      const n2 = perlin2.noise(x * 0.02 + 100, y * 0.03);
      const deepF = clamp((y - world.surfaceLine) / 200, 0, 1);
      const tunnel = Math.abs(n1) < 0.045 + deepF * 0.03 && Math.abs(n2) < 0.35;
      // chambers: blobby
      const n3 = perlin2.fbm(x * 0.045, y * 0.06, 2);
      const chamber = n3 > 0.42 - deepF * 0.12;
      // surface entrance caves are rarer
      const nearSurface = depth < 14;
      if ((tunnel || chamber) && (!nearSurface || Math.abs(n1) < 0.02)) {
        tiles[i] = T.AIR;
      }
      // underworld: big lava caverns
      if (y > hellLine + 6 && y < h - 2) {
        const n4 = perlin.fbm(x * 0.02, y * 0.05, 2);
        if (n4 > -0.1) tiles[i] = T.AIR;
      }
    }
    if (y % 100 === 0) yield { msg: 'Carving caves', p: 0.22 + 0.12 * y / h };
  }

  // --- Ores ---------------------------------------------------------------
  yield { msg: 'Placing ores', p: 0.36 };
  function vein(tileId, count, yMin, yMax, len, size) {
    for (let v = 0; v < count; v++) {
      let x = Math.floor(rng() * (w - 20)) + 10;
      let y = yMin + Math.floor(rng() * (yMax - yMin));
      if (y < surf[x] + 3) continue;
      let dx = rng() - 0.5, dy = rng() - 0.5;
      for (let k = 0; k < len; k++) {
        for (let oy = 0; oy < size; oy++) for (let ox = 0; ox < size; ox++) {
          const xx = Math.floor(x) + ox, yy = Math.floor(y) + oy;
          if (xx < 1 || yy < 1 || xx >= w - 1 || yy >= h - 1) continue;
          const i = idx(xx, yy);
          const t = tiles[i];
          if (t === T.STONE || t === T.DIRT || t === T.SAND || t === T.SNOW || t === T.ICE || t === T.SANDSTONE || (tileId === T.HELLSTONE && t === T.ASH)) tiles[i] = tileId;
        }
        x += dx * 1.5; y += dy * 1.5;
        dx += (rng() - 0.5) * 0.6; dy += (rng() - 0.5) * 0.6;
      }
    }
  }
  const s0 = minSurf;
  const areaF = (w * h) / (1800 * 600), oreM = world.oreMult || 1;
  vein(T.CLAY, 260, s0 + 5, s0 + 60, 8, 3);
  vein(T.COPPER, Math.round(520 * areaF * oreM), s0 + 6, world.cavernLine, 6, 2);
  vein(T.IRON, Math.round(420 * areaF * oreM), s0 + 20, world.cavernLine + 60, 6, 2);
  vein(T.SILVER, Math.round(300 * areaF * oreM), world.surfaceLine + 20, hellLine - 20, 6, 2);
  vein(T.GOLD, Math.round(220 * areaF * oreM), world.cavernLine - 40, hellLine - 10, 5, 2);
  vein(T.GEM, Math.round(70 * areaF * oreM), world.cavernLine, hellLine - 10, 3, 2);
  vein(T.GEM, Math.round(90 * areaF * oreM), world.surfaceLine + 10, world.cavernLine, 3, 2);
  // gem kinds: amethyst/topaz near the top, sapphire/emerald/ruby deeper, diamond deepest
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = idx(x, y); if (tiles[i] !== T.GEM) continue; const df = (y - world.surfaceLine) / (hellLine - world.surfaceLine); const r = rng(); let g = r < 0.35 ? 0 : r < 0.6 ? 1 : r < 0.78 ? 2 : r < 0.9 ? 3 : r < 0.97 ? 4 : 5; if (df > 0.5 && rng() < 0.5) g = Math.min(5, g + 2); world.tdata[i] = g; }
  vein(T.HELLSTONE, Math.round(260 * areaF * oreM), hellLine + 5, h - 3, 6, 2);
  // scattered stone in dirt near the surface for texture
  vein(T.STONE, Math.round(250 * areaF), s0 + 2, s0 + 40, 6, 2);
  vein(T.DIRT, Math.round(300 * areaF), world.surfaceLine, hellLine - 40, 8, 3);
  Ores.chooseAlternatives(world, rng);

  // --- Walls ---------------------------------------------------------------
  yield { msg: 'Placing walls', p: 0.46 };
  for (let x = 0; x < w; x++) {
    const b = world.biome[x];
    for (let y = surf[x] + 3; y < h - 1; y++) {
      const i = idx(x, y);
      const depth = y - surf[x];
      const n = perlin2.fbm(x * 0.03, y * 0.03, 2);
      if (n < -0.45 && depth > 8) continue; // wall-less pockets
      let wl;
      if (y > hellLine) wl = W.STONE;
      else if (depth < 40 + n * 10) wl = Biomes.wallFor(b, true, tiles[i]) || (b === BIOME.SNOW ? W.SNOW : b === BIOME.DESERT ? W.SAND : W.DIRT);
      else wl = (depth < 90 ? Biomes.wallFor(b, false, tiles[i]) : null) || ((tiles[i] === T.DIRT && n > 0.1) ? W.DIRT : W.STONE);
      walls[i] = wl;
    }
    if (x % 400 === 0) yield { msg: 'Placing walls', p: 0.46 + 0.06 * x / w };
  }

  // --- Water & lava ---------------------------------------------------------
  yield { msg: 'Adding water', p: 0.53 };
  const liquid = world.liquid, lava = world.lava;
  // surface lakes: find depressions
  for (let x = 30; x < w - 30; x += 3) {
    if (world.biome[x] === BIOME.DESERT || world.biome[x] === BIOME.OCEAN || world.biome[x] === BIOME.CORRUPTION || world.biome[x] === BIOME.CRIMSON) continue;
    if (Math.abs(x - w / 2) < 90) continue; // keep the spawn area dry
    // local minimum with higher ground on both sides?
    const y = surf[x];
    if (surf[x - 3] > y || surf[x + 3] > y) continue;
    let ok = true;
    for (let k = -18; k <= 18; k += 3) if (surf[x + k] > y + 1 && k !== 0) { ok = false; break; }
    if (!ok) continue;
    let ridgeL = false, ridgeR = false;
    for (let k = 3; k <= 30; k += 3) { if (surf[x - k] <= y - 3) ridgeL = true; if (surf[x + k] <= y - 3) ridgeR = true; }
    if (!ridgeL || !ridgeR) continue;
    if (rng() < 0.45) continue;
    // fill basin up to level y-3
    const level = y - 2 - Math.floor(rng() * 3);
    floodFillLiquid(world, x, y - 1, level, 900, false);
  }
  // underground pools
  for (let k = 0; k < Math.round(220 * areaF); k++) {
    const x = 10 + Math.floor(rng() * (w - 20));
    const y = world.surfaceLine + Math.floor(rng() * (hellLine - 30 - world.surfaceLine));
    if (tiles[idx(x, y)] !== T.AIR) continue;
    // fall to floor
    let fy = y; while (fy < hellLine - 1 && tiles[idx(x, fy + 1)] === T.AIR) fy++;
    const isLava = y > world.cavernLine + 60 && rng() < 0.5;
    floodFillLiquid(world, x, fy, fy - 2 - Math.floor(rng() * 4), 400, isLava);
  }
  // underworld lava lakes
  for (let x = 1; x < w - 1; x++) {
    for (let y = hellLine + 14; y < h - 1; y++) {
      const i = idx(x, y);
      if (tiles[i] === T.AIR && y > hellLine + 22 + perlin.noise(x * 0.01, 3) * 6) { liquid[i] = 255; lava[i] = 1; }
    }
  }

  // --- Grass, trees, plants -------------------------------------------------
  yield { msg: 'Growing trees', p: 0.62 };
  for (let x = 0; x < w; x++) {
    const b = world.biome[x];
    // find top tile
    let y = 0; while (y < h && tiles[idx(x, y)] === T.AIR) y++;
    const top = tiles[idx(x, y)];
    if (top === T.DIRT && (b === BIOME.FOREST)) tiles[idx(x, y)] = T.GRASS;
    // also grass on dirt exposed in overhangs near surface
    for (let yy = y; yy < y + 30 && yy < h - 1; yy++) {
      const i = idx(x, yy);
      if (tiles[i] === T.DIRT && b === BIOME.FOREST) {
        if (tiles[i - w] === T.AIR || tiles[i + 1] === T.AIR || tiles[i - 1] === T.AIR) tiles[i] = T.GRASS;
      }
    }
  }
  let nextTree = 5;
  for (let x = 5; x < w - 5; x++) {
    const b = world.biome[x];
    let y = 0; while (y < h && tiles[idx(x, y)] === T.AIR) y++;
    const top = tiles[idx(x, y)];
    if (b === BIOME.OCEAN || b === BIOME.JUNGLE || b === BIOME.CORRUPTION || b === BIOME.CRIMSON) continue; // their own trees grow in Biomes.generate
    if (b === BIOME.DESERT) {
      if (top === T.SAND && rng() < 0.08 && x >= nextTree && liquid[idx(x, y - 1)] === 0) {
        const ch = randInt(2, 5);
        for (let k = 1; k <= ch; k++) tiles[idx(x, y - k)] = T.CACTUS;
        nextTree = x + 3;
      }
      continue;
    }
    if ((top === T.GRASS || top === T.SNOW) && x >= nextTree && Math.abs(x - w / 2) > 6 && liquid[idx(x, y - 1)] === 0) {
      if (rng() < 0.55) {
        const th = randInt(6, 14);
        let ok = true;
        for (let k = 1; k <= th + 4; k++) if (tiles[idx(x, y - k)] !== T.AIR) { ok = false; break; }
        if (ok) {
          for (let k = 1; k <= th; k++) {
            let d = randInt(0, 3);
            if (k > 2 && k < th - 1 && rng() < 0.22) d |= (rng() < 0.5 ? 4 : 8);
            tiles[idx(x, y - k)] = T.TREE; world.tdata[idx(x, y - k)] = d;
          }
          tiles[idx(x, y - th - 1)] = T.TREETOP; world.tdata[idx(x, y - th - 1)] = randInt(0, 3);
          nextTree = x + randInt(3, 7);
        }
      } else if (top === T.GRASS && rng() < 0.4) {
        tiles[idx(x, y - 1)] = T.PLANT; world.tdata[idx(x, y - 1)] = rng() < 0.1 ? 6 : randInt(0, 5);
      }
    }
  }

  // --- Chests, crystals, mushrooms, cobwebs -----------------------------------
  yield { msg: 'Hiding treasure', p: 0.74 };
  let placedChests = 0, attempts = 0;
  const chestTarget = Math.round(110 * areaF);
  while (placedChests < chestTarget && attempts < 40000 * areaF) {
    attempts++;
    const x = 10 + Math.floor(rng() * (w - 20));
    const y = surf[x] + 10 + Math.floor(rng() * (hellLine - 20 - surf[x]));
    if (tiles[idx(x, y)] !== T.AIR || tiles[idx(x + 1, y)] !== T.AIR || tiles[idx(x, y - 1)] !== T.AIR || tiles[idx(x + 1, y - 1)] !== T.AIR) continue;
    if (!TILES[tiles[idx(x, y + 1)]].solid || !TILES[tiles[idx(x + 1, y + 1)]].solid) continue;
    if (liquid[idx(x, y)] > 0) continue;
    world.placeFurniture(x, y - 1, T.CHEST);
    const inv = world.chests.get(idx(x, y - 1));
    const depthF = (y - world.surfaceLine) / (hellLine - world.surfaceLine);
    fillChestLoot(inv, depthF, rng);
    placedChests++;
  }
  let crystals = 0; attempts = 0;
  while (crystals < Math.round(45 * areaF) && attempts < 40000 * areaF) {
    attempts++;
    const x = 10 + Math.floor(rng() * (w - 20));
    const y = world.surfaceLine + 20 + Math.floor(rng() * (hellLine - 40 - world.surfaceLine));
    if (tiles[idx(x, y)] !== T.AIR || !TILES[tiles[idx(x, y + 1)]].solid) continue;
    tiles[idx(x, y)] = T.LIFECRYSTAL; crystals++;
  }
  for (let k = 0; k < Math.round(2500 * areaF); k++) {
    const x = 10 + Math.floor(rng() * (w - 20));
    const y = surf[x] + 15 + Math.floor(rng() * (hellLine - 30 - surf[x]));
    const i = idx(x, y);
    if (tiles[i] !== T.AIR) continue;
    if (TILES[tiles[i + w]].solid && liquid[i] === 0 && rng() < 0.5) { tiles[i] = T.MUSHROOM_GLOW; }
    else if (tiles[i - w] !== T.AIR && rng() < 0.4) { tiles[i] = T.COBWEB; }
  }

  // --- Settle sand -----------------------------------------------------------
  yield { msg: 'Settling sand', p: 0.84 };
  for (let x = 1; x < w - 1; x++) {
    for (let y = h - 3; y >= 0; y--) {
      const i = idx(x, y);
      if (tiles[i] === T.SAND && tiles[i + w] === T.AIR) {
        // convert unsupported sand into sandstone to avoid mass collapse at gen time
        tiles[i] = T.SANDSTONE;
      }
    }
  }

  yield* Biomes.generate(world, rng, perlin);
  // --- Finalize --------------------------------------------------------------
  yield { msg: 'Finalizing world', p: 0.9 };
  world.rebuildTopSolid();
  const sx = Math.floor(w / 2);
  let sy = 0; while (sy < h && !TILES[tiles[idx(sx, sy)]].solid) sy++;
  world.spawnX = sx; world.spawnY = sy;
  // clear spawn area of trees/plants
  for (let x = sx - 3; x <= sx + 3; x++) for (let y = sy - 8; y < sy; y++) {
    const t = tiles[idx(x, y)];
    if (t === T.TREE || t === T.TREETOP || t === T.PLANT || t === T.CACTUS) tiles[idx(x, y)] = T.AIR;
  }
  world.rebuildTopSolid();
  placeBoundGoblin(world, rng);
  yield { msg: 'Raising a shrine', p: 0.93 };
  placeShrine(world, rng);
  placeHeartShrines(world, rng);
  yield { msg: 'Telling old stories', p: 0.94 };
  placeStrandedShip(world, rng);
  placeMineshaft(world, rng);
  placeWatchtower(world, rng);
  fablesWorldgen(world, rng);
  Structures.generate(world, rng);
  for (const f of ModLib.worldgenHooks) { try { f(world, rng); } catch (e) { console.error('worldgen hook failed', e); } }
  world.rebuildTopSolid();
  // Start with base: build the starter base at spawn
  if (world.baseConfig && world.baseConfig.style !== 'none' && ModList.on('start_with_base')) {
    yield { msg: 'Building your base', p: 0.95 };
    const res = generateBase(world, world.baseConfig);
    if (res) { world.spawnX = res.spawn.x; world.spawnY = res.spawn.y; world.baseInfo = res; }
  }
  world.time = Math.floor(world.dayLength * (8.5 / 24)); // start at 8:30 AM
  yield { msg: 'Done', p: 1 };
}

function floodFillLiquid(world, sx, sy, level, maxTiles, isLava) {
  const w = world.w;
  const tiles = world.tiles;
  const stack = [[sx, sy]];
  const seen = new Set();
  const fill = [];
  while (stack.length && fill.length < maxTiles) {
    const [x, y] = stack.pop();
    if (x < 1 || y < 1 || x >= w - 1 || y >= world.h - 1) return; // leaks out of bounds
    if (y < level) continue;
    const i = x + y * w;
    if (seen.has(i)) continue;
    seen.add(i);
    if (TILES[tiles[i]].solid) continue;
    fill.push(i);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  if (fill.length >= maxTiles) return; // basin too big / leaks
  for (const i of fill) { world.liquid[i] = 255; world.lava[i] = isLava ? 1 : 0; if (tiles[i] === T.PLANT || tiles[i] === T.COBWEB || tiles[i] === T.MUSHROOM_GLOW) tiles[i] = T.AIR; }
}

function fillChestLoot(inv, depthF, rng) {
  // loot from a disabled mod never lands in a chest
  const add = (id, n) => { if (!ITEMS[id] || !ModList.itemOk(id)) return; for (let s = 0; s < inv.length; s++) if (!inv[s]) { inv[s] = makeStack(id, n); return; } };
  const pick = rng();
  if (depthF < 0.25) {
    if (pick < 0.3) add('copper_broadsword', 1); else if (pick < 0.55) add('copper_hammer', 1); else if (pick < 0.75) add('hook', 1); else add('iron_pickaxe', 1);
    add('torch', 5 + Math.floor(rng() * 10));
    if (rng() < 0.5) add('copper_bar', 3 + Math.floor(rng() * 5));
    if (rng() < 0.6) add('lesser_healing', 1 + Math.floor(rng() * 3));
    if (rng() < 0.3) add('fallen_star', 1 + Math.floor(rng() * 3));
    if (rng() < 0.25) add(ACC_CHEST_POOL[Math.floor(rng() * ACC_CHEST_POOL.length)], 1);
  } else if (depthF < 0.6) {
    if (rng() < 0.3) add(ACC_CHEST_POOL[Math.floor(rng() * 3)], 1);
    if (pick < 0.3) add('iron_broadsword', 1); else if (pick < 0.55) add('silver_pickaxe', 1); else if (pick < 0.8) add('hook', 1); else add('silver_axe', 1);
    add('torch', 8 + Math.floor(rng() * 12));
    if (rng() < 0.5) add('iron_bar', 3 + Math.floor(rng() * 5));
    if (rng() < 0.7) add('lesser_healing', 2 + Math.floor(rng() * 3));
    if (rng() < 0.4) add('bomb', 2 + Math.floor(rng() * 4));
    if (rng() < 0.35) add('musket_ball', 20 + Math.floor(rng() * 30));
  } else {
    if (pick < 0.35) add('gold_pickaxe', 1); else if (pick < 0.65) add('gold_broadsword', 1); else add('gold_axe', 1);
    add('torch', 10 + Math.floor(rng() * 15));
    if (rng() < 0.6) add('gold_bar', 3 + Math.floor(rng() * 5));
    if (rng() < 0.8) add('lesser_healing', 3 + Math.floor(rng() * 4));
    if (rng() < 0.5) add('bomb', 3 + Math.floor(rng() * 5));
    if (rng() < 0.3) add('diamond', 1 + Math.floor(rng() * 3));
    if (rng() < 0.12) add('mana_field', 1);
    if (rng() < 0.4) add('musket_ball', 30 + Math.floor(rng() * 40));
    if (rng() < 0.15) add('flintlock_pistol', 1);
  }
  if (rng() < 0.4) add('mushroom', 1 + Math.floor(rng() * 3));
  if (rng() < 0.3) add('life_crystal', 1);
  // Pets Overhaul: pets and pet food hide in chests
  const petPools = [['carrot', 'dog_whistle', 'dirtiest_block', 'eye_bone', 'bamboo_leaf'], ['seaweed', 'spider_egg', 'tartar_sauce', 'writhing_remains', 'magic_lantern', 'crimson_heart', 'shadow_orb', 'wisp'], ['amber_mosquito', 'probe', 'bone_rattle', 'eaters_bone', 'hell_cake', 'toy_sled', 'fairy_bell', 'jewel_of_light', 'lightning_carrot', 'fuse_wire', 'mud_bud', 'lizard_egg']];
  const pool = petPools[depthF < 0.25 ? 0 : depthF < 0.6 ? 1 : 2];
  if (rng() < 0.12) add(pool[Math.floor(rng() * pool.length)], 1);
  if (rng() < 0.5) add('pet_food', 5 + Math.floor(rng() * 20));
}
