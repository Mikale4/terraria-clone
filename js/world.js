// ---------------------------------------------------------------------------
// World data: tiles, walls, liquids, tile manipulation, liquid sim, random ticks
// ---------------------------------------------------------------------------
'use strict';

class World {
  constructor(w, h, seed) {
    this.w = w; this.h = h; this.seed = seed;
    const n = w * h;
    this.tiles = new Uint16Array(n);   // 16-bit ids: room for every vanilla block and wall
    this.walls = new Uint16Array(n);
    this.tdata = new Uint8Array(n);     // per-tile variant/furniture offset data
    this.liquid = new Uint8Array(n);    // 0..255 water amount
    this.lava = new Uint8Array(n);      // 1 if liquid is lava
    this.explored = new Uint8Array(n);
    this.topSolid = new Int16Array(w);  // topmost solid tile per column (for sky light)
    this.surface = new Int16Array(w);   // generated surface height
    this.biome = new Uint8Array(w);
    this.spawnX = w / 2 | 0; this.spawnY = 0;
    this.surfaceLine = 0;               // y below which underground background shows
    this.cavernLine = 0;
    this.chests = new Map();            // index -> array of 40 slots
    this.tombstones = new Map();        // anchor index -> death message
    this.chairs = new Set();            // anchor indexes of chairs (candidate house spots)
    this.tileDamage = new Map();        // index -> {dmg, t}
    this.fallingSand = [];
    this.time = 0;                       // ticks
    this.dayLength = 24 * 60 * 60;       // Terraria: one in-game hour = one real minute (day 15 min, night 9 min)
    this.moonPhase = 0;                  // 0 = full moon .. 7, advances every dawn
    this.bloodMoon = false;
    this.expert = false;
    this.liquidDirty = new Set();
    this.mapDirty = [];
  }

  idx(x, y) { return x + y * this.w; }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return T.BEDROCK; return this.tiles[x + y * this.w]; }
  getWall(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.walls[x + y * this.w]; }
  getData(x, y) { if (!this.inBounds(x, y)) return 0; return this.tdata[x + y * this.w]; }
  isSolidAt(x, y) { return TILES[this.get(x, y)].solid; }
  isPlatformAt(x, y) { return TILES[this.get(x, y)].platform; }
  hasTileOrWall(x, y) { return this.get(x, y) !== T.AIR || this.getWall(x, y) !== 0; }

  // Time of day helpers (hour 0..24, day starts 4:30, night 19:30)
  hour() { return (this.time % this.dayLength) / this.dayLength * 24; }
  isDay() { const h = this.hour(); return h >= 4.5 && h < 19.5; }
  daylight() {
    const h = this.hour();
    if (h < 4.5 || h >= 19.5) return 0;
    if (h < 6.5) return (h - 4.5) / 2;
    if (h > 17.5) return (19.5 - h) / 2;
    return 1;
  }
  skyLight() { const d = this.daylight(); return 0.22 + 0.78 * smoothstep(d); }

  // --- raw setters (no side effects) ---
  rawSet(x, y, id, data = 0) {
    if (!this.inBounds(x, y)) return;
    const i = x + y * this.w;
    this.tiles[i] = id; this.tdata[i] = data;
  }

  updateTopSolid(x) {
    if (x < 0 || x >= this.w) return;
    let y = 0;
    while (y < this.h && !TILES[this.tiles[x + y * this.w]].solid) y++;
    this.topSolid[x] = y;
  }
  rebuildTopSolid() { for (let x = 0; x < this.w; x++) this.updateTopSolid(x); }

  markMap(x, y) { this.mapDirty.push(x, y); }

  // Set tile with side effects (topSolid, map, liquid wake)
  setTile(x, y, id, data = 0) {
    if (!this.inBounds(x, y)) return;
    const i = x + y * this.w;
    const wasSolid = TILES[this.tiles[i]].solid;
    this.tiles[i] = id; this.tdata[i] = data;
    const nowSolid = TILES[id].solid;
    if (wasSolid !== nowSolid) this.updateTopSolid(x);
    if (nowSolid) { this.liquid[i] = 0; this.lava[i] = 0; }
    this.wakeLiquid(x, y);
    this.markMap(x, y);
  }

  setWall(x, y, id) {
    if (!this.inBounds(x, y)) return;
    this.walls[x + y * this.w] = id;
    this.markMap(x, y);
  }

  wakeLiquid(x, y) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (this.inBounds(xx, yy) && this.liquid[xx + yy * this.w] > 0) this.liquidDirty.add(xx + yy * this.w);
    }
  }

  // Find the anchor (top-left) of a furniture piece containing tile (x,y)
  furnitureAnchor(x, y) {
    const id = this.get(x, y);
    const f = TILES[id].furniture;
    if (!f) return null;
    const d = this.getData(x, y);
    const dx = d & 3, dy = (d >> 2) & 3;
    return { x: x - dx, y: y - dy, w: f.w, h: f.h, id };
  }

  canPlaceFurniture(x, y, id) {
    const f = TILES[id].furniture;
    for (let yy = 0; yy < f.h; yy++) for (let xx = 0; xx < f.w; xx++) {
      if (this.get(x + xx, y + yy) !== T.AIR) return false;
    }
    if (id === T.LANTERN) {
      return this.isSolidAt(x, y - 1);
    }
    // needs solid floor beneath the whole width (or platform)
    for (let xx = 0; xx < f.w; xx++) {
      const below = this.get(x + xx, y + f.h);
      if (!TILES[below].solid && !TILES[below].platform) return false;
    }
    return true;
  }

  placeFurniture(x, y, id) {
    const f = TILES[id].furniture;
    for (let yy = 0; yy < f.h; yy++) for (let xx = 0; xx < f.w; xx++) {
      this.setTile(x + xx, y + yy, id, xx | (yy << 2));
    }
    if (id === T.CHEST) this.chests.set(this.idx(x, y), new Array(40).fill(null));
    if (id === T.CHAIR) this.chairs.add(this.idx(x, y));
  }

  removeFurniture(x, y) {
    const a = this.furnitureAnchor(x, y);
    if (!a) return null;
    if (a.id === T.CHEST) {
      const inv = this.chests.get(this.idx(a.x, a.y));
      if (inv && inv.some(s => s)) return null; // not empty
      this.chests.delete(this.idx(a.x, a.y));
    }
    for (let yy = 0; yy < a.h; yy++) for (let xx = 0; xx < a.w; xx++) this.setTile(a.x + xx, a.y + yy, T.AIR);
    if (a.id === T.CHAIR) this.chairs.delete(this.idx(a.x, a.y));
    return a;
  }

  // Toggle door open/closed
  toggleDoor(x, y, player) {
    const a = this.furnitureAnchor(x, y);
    if (!a) return false;
    if (a.id === T.DOOR_C) {
      // open only if player isn't overlapping (they can't be, it's solid)
      for (let yy = 0; yy < 3; yy++) this.setTile(a.x, a.y + yy, T.DOOR_O, 0 | (yy << 2));
      return true;
    } else if (a.id === T.DOOR_O) {
      // closing: player must not overlap
      if (player) {
        const px0 = Math.floor(player.x / TILE), px1 = Math.floor((player.x + player.w - 1) / TILE);
        const py0 = Math.floor(player.y / TILE), py1 = Math.floor((player.y + player.h - 1) / TILE);
        if (a.x >= px0 && a.x <= px1 && a.y + 2 >= py0 && a.y <= py1) return false;
      }
      for (let yy = 0; yy < 3; yy++) this.setTile(a.x, a.y + yy, T.DOOR_C, 0 | (yy << 2));
      return true;
    }
    return false;
  }

  // Fell a tree starting from tile (x,y): removes trunk above & attached pieces. Returns wood count.
  fellTree(x, y) {
    let count = 0, acorns = 0;
    let yy = y;
    // walk up the trunk
    while (this.get(x, yy) === T.TREE || this.get(x, yy) === T.TREETOP) {
      const d = this.getData(x, yy);
      if (this.get(x, yy) === T.TREE) {
        count++;
        if (Math.random() < 0.12) acorns++;
      } else { count += 2; acorns += Math.random() < 0.6 ? 1 : 0; }
      this.setTile(x, yy, T.AIR);
      yy--;
    }
    return { wood: count, acorns };
  }

  // Random tile ticks near a point (grass spread, sapling growth, plants)
  randomTicks(cx, cy, n) {
    for (let i = 0; i < n; i++) {
      const x = cx + randInt(-60, 60), y = cy + randInt(-40, 40);
      if (!this.inBounds(x, y)) continue;
      const id = this.get(x, y);
      if (id === T.DIRT) {
        // grass spread: dirt exposed to air adjacent to grass
        const exposed = this.get(x, y - 1) === T.AIR || this.get(x, y + 1) === T.AIR || this.get(x - 1, y) === T.AIR || this.get(x + 1, y) === T.AIR;
        if (exposed && y < this.surfaceLine + 10) {
          if (this.get(x - 1, y) === T.GRASS || this.get(x + 1, y) === T.GRASS || this.get(x, y - 1) === T.GRASS || this.get(x, y + 1) === T.GRASS ||
              this.get(x - 1, y - 1) === T.GRASS || this.get(x + 1, y - 1) === T.GRASS || this.get(x - 1, y + 1) === T.GRASS || this.get(x + 1, y + 1) === T.GRASS)
            this.setTile(x, y, T.GRASS);
        }
      } else if (id === T.GRASS) {
        if (this.get(x, y - 1) === T.AIR && Math.random() < 0.08 && this.getWall(x, y - 1) === 0) {
          this.setTile(x, y - 1, T.PLANT, randInt(0, 6) === 6 ? 6 : randInt(0, 5));
        }
      } else if (id === T.SAPLING) {
        if (Math.random() < 0.05) this.growTree(x, y);
      }
    }
  }

  growTree(x, y) {
    // requires ground below and space above
    const below = this.get(x, y + 1);
    if (below !== T.GRASS && below !== T.DIRT && below !== T.SNOW && below !== T.MUD) return false;
    const h = randInt(6, 12);
    for (let i = 0; i <= h + 3; i++) {
      const t = this.get(x, y - i);
      if (t !== T.AIR && t !== T.SAPLING && t !== T.PLANT && t !== T.LEAVES) return false;
    }
    for (let i = 0; i < h; i++) {
      let d = randInt(0, 3);
      if (i > 1 && i < h - 1 && Math.random() < 0.25) d |= (Math.random() < 0.5 ? 4 : 8);
      this.setTile(x, y - i, T.TREE, d);
    }
    this.setTile(x, y - h, T.TREETOP, randInt(0, 3));
    return true;
  }

  // Housing ------------------------------------------------------------------------
  // Terraria house rules: an enclosed room (frame of blocks / doors / platforms), 60..750 tiles
  // including the frame, player-placed background walls, a light source, a flat surface item,
  // a comfort item and an entrance. Returns {ok, reason, interior, key, homeX, homeY}.
  checkHouse(sx, sy) {
    const fail = (reason) => ({ ok: false, reason });
    if (!this.inBounds(sx, sy) || this.isSolidAt(sx, sy)) return fail('This is not valid housing.');
    const W_ = this.w;
    const isBoundary = (id) => TILES[id].solid || id === T.DOOR_O || id === T.DOOR_C || id === T.PLATFORM;
    const start = this.idx(sx, sy);
    const interior = new Set([start]), boundary = new Set();
    const stack = [start];
    let hasDoor = false;
    while (stack.length) {
      const i = stack.pop();
      if (interior.size > 750) return fail('This house is too big.');
      const x = i % W_, y = (i / W_) | 0;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (nx < 1 || ny < 1 || nx >= W_ - 1 || ny >= this.h - 1) return fail('This house is not enclosed.');
        const ni = nx + ny * W_;
        const id = this.tiles[ni];
        if (isBoundary(id)) { boundary.add(ni); if (id === T.DOOR_O || id === T.DOOR_C || id === T.PLATFORM) hasDoor = true; continue; }
        if (!interior.has(ni)) { interior.add(ni); stack.push(ni); }
      }
    }
    const total = interior.size + boundary.size;
    if (total < 60) return fail('This house is too small.');
    if (total > 750) return fail('This house is too big.');
    if (!hasDoor) return fail('This house is missing a door.');
    // room must be at least 3 tiles tall somewhere and 2 wide
    let tall = false, minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, floorY = -1, floorX = sx;
    for (const i of interior) {
      const x = i % W_, y = (i / W_) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (interior.has(i + W_) && interior.has(i + 2 * W_)) tall = true;
    }
    if (!tall || maxX - minX < 1) return fail('This house is too small.');
    let light = false, table = false, chair = false;
    for (const i of interior) {
      const id = this.tiles[i];
      const wl = this.walls[i];
      if (wl === 0 || WALLS[wl].natural) return fail('This house is missing a wall.');
      if (id === T.TORCH || id === T.LANTERN || id === T.CAMPFIRE) light = true;
      if (id === T.TABLE || id === T.WORKBENCH) table = true;
      if (id === T.CHAIR) chair = true;
    }
    if (!light) return fail('This house is missing a light source.');
    if (!table) return fail('This house is missing a table.');
    if (!chair) return fail('This house is missing a chair.');
    if (sy > this.h - 70) return fail('This house is too close to the underworld.');
    // home position: a floor tile with head room near the centre of the room
    const cx = Math.round((minX + maxX) / 2);
    let best = null, bestD = Infinity;
    for (const i of interior) {
      const x = i % W_, y = (i / W_) | 0;
      const below = this.tiles[i + W_];
      if (!interior.has(i - W_) || !interior.has(i - 2 * W_)) continue;
      if (!TILES[below].solid && !TILES[below].platform) continue;
      const d = Math.abs(x - cx);
      if (d < bestD) { bestD = d; best = { x, y }; }
    }
    if (!best) return fail('This house is too small.');
    return { ok: true, interior, key: Math.min(...interior), homeX: best.x, homeY: best.y, minX, maxX, minY, maxY };
  }

  // Find a valid, unoccupied house (scanning around placed chairs)
  findVacantHouse(npcs) {
    const taken = new Set(npcs.filter(n => n.home).map(n => n.home.key));
    for (const ci of this.chairs) {
      const x = ci % this.w, y = (ci / this.w) | 0;
      const h = this.checkHouse(x, y);
      if (h.ok && !taken.has(h.key)) return h;
    }
    return null;
  }

  rebuildChairs() {
    this.chairs.clear();
    for (let i = 0; i < this.tiles.length; i++) if (this.tiles[i] === T.CHAIR && (this.tdata[i] & 15) === 0) this.chairs.add(i);
  }

  // Liquid simulation ------------------------------------------------------------
  updateLiquids(px, py) {
    const W_ = this.w;
    const L = this.liquid;
    const range = 90, vrange = 60;
    const x0 = Math.max(1, px - range), x1 = Math.min(this.w - 2, px + range);
    const y0 = Math.max(1, py - vrange), y1 = Math.min(this.h - 2, py + vrange);
    // process bottom-up so falling water settles in one pass
    for (let y = y1; y >= y0; y--) {
      const dir = (this.time + y) & 1 ? 1 : -1;
      for (let k = 0; k <= x1 - x0; k++) {
        const x = dir > 0 ? x0 + k : x1 - k;
        const i = x + y * W_;
        let amt = L[i];
        if (amt === 0) continue;
        const isLava = this.lava[i];
        // flow down
        const bi = i + W_;
        if (!TILES[this.tiles[bi]].solid) {
          if (L[bi] > 0 && this.lava[bi] !== isLava) { this.mixLiquids(x, y, x, y + 1); continue; }
          const space = 255 - L[bi];
          if (space > 0) {
            const flow = Math.min(space, amt);
            L[bi] += flow; amt -= flow; this.lava[bi] = isLava;
            if (amt === 0) { L[i] = 0; this.lava[i] = 0; this.markMap(x, y); continue; }
          }
        }
        // flow sideways
        if (amt > 2) {
          const li = i - 1, ri = i + 1;
          const lOpen = !TILES[this.tiles[li]].solid && (L[li] === 0 || this.lava[li] === isLava);
          const rOpen = !TILES[this.tiles[ri]].solid && (L[ri] === 0 || this.lava[ri] === isLava);
          if (lOpen && rOpen) {
            const avg = (amt + L[li] + L[ri]) / 3;
            const target = Math.floor(avg);
            if (L[li] < target) { const f = Math.min(target - L[li], amt); L[li] += f; amt -= f; this.lava[li] = isLava; }
            if (L[ri] < target) { const f = Math.min(target - L[ri], amt); L[ri] += f; amt -= f; this.lava[ri] = isLava; }
          } else if (lOpen) {
            const target = Math.floor((amt + L[li]) / 2);
            if (L[li] < target) { const f = Math.min(target - L[li], amt); L[li] += f; amt -= f; this.lava[li] = isLava; }
          } else if (rOpen) {
            const target = Math.floor((amt + L[ri]) / 2);
            if (L[ri] < target) { const f = Math.min(target - L[ri], amt); L[ri] += f; amt -= f; this.lava[ri] = isLava; }
          }
          // mixing with a different liquid on the side
          if (!TILES[this.tiles[li]].solid && L[li] > 0 && this.lava[li] !== isLava) this.mixLiquids(x, y, x - 1, y);
          if (!TILES[this.tiles[ri]].solid && L[ri] > 0 && this.lava[ri] !== isLava) this.mixLiquids(x, y, x + 1, y);
        }
        if (amt === 0 || (amt <= 3 && (L[i + W_] >= 250 || TILES[this.tiles[i + W_]].solid))) { amt = 0; this.lava[i] = 0; }
        L[i] = amt;
      }
    }
  }

  mixLiquids(x1, y1, x2, y2) {
    // water + lava -> obsidian at the lava tile
    const i1 = this.idx(x1, y1), i2 = this.idx(x2, y2);
    const lavaI = this.lava[i1] ? i1 : i2;
    const waterI = lavaI === i1 ? i2 : i1;
    const lx = lavaI % this.w, ly = (lavaI / this.w) | 0;
    this.liquid[lavaI] = 0; this.lava[lavaI] = 0;
    this.liquid[waterI] = Math.max(0, this.liquid[waterI] - 40);
    this.setTile(lx, ly, T.OBSIDIAN);
  }

  liquidAt(x, y) { if (!this.inBounds(x, y)) return 0; return this.liquid[x + y * this.w]; }
  lavaAt(x, y) { if (!this.inBounds(x, y)) return 0; return this.lava[x + y * this.w]; }
}
