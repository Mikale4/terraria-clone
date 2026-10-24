// ---------------------------------------------------------------------------
// Save / load via IndexedDB (RLE-compressed tile layers)
// ---------------------------------------------------------------------------
'use strict';

const WORLD_SAVE_KEYS = ['hardmode', 'altOres', 'evil', 'bands', 'jungleLeft', 'dungeonSide', 'dungeon', 'temple', 'orbs', 'orbsBroken', 'altarsSmashed', 'event', 'lunarEvent', 'moonLordTimer', 'pillarsDown', 'taxes', 'portals', 'structures', 'undergroundDesert', 'oasis', 'pyramid', 'swordShrine', 'islands', 'aether', 'seaLevel', 'skeletronDefeated', 'planteraDefeated', 'golemDefeated', 'moonLordDefeated', 'anglerQuest', 'dungeonChests', 'meteorite', 'bulbs', 'cultistsSpawned', 'cultistsKilled', 'eventsWon', 'ashTrees'];
const PLAYER_SAVE_KEYS = ['vanity', 'dyes', 'loadouts', 'loadout', 'demonHeart', 'hairStyle', 'colors'];
const SaveSystem = {
  DB: 'terraria_clone', STORE: 'worlds', KEY: 'world1',

  open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(this.STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  // run-length pairs (value, run); 16-bit arrays (tiles / walls) are stored as Uint16Array so ids above 255 survive
  rle(arr) {
    const out = [], wide = arr instanceof Uint16Array, maxRun = wide ? 65535 : 255;
    let i = 0, n = arr.length;
    while (i < n) {
      const v = arr[i]; let run = 1;
      while (i + run < n && arr[i + run] === v && run < maxRun) run++;
      out.push(v, run); i += run;
    }
    return wide ? new Uint16Array(out) : new Uint8Array(out);
  },
  unrle(data, n, Ctor) {
    const out = new (Ctor || (data instanceof Uint16Array ? Uint16Array : Uint8Array))(n);
    let j = 0;
    for (let i = 0; i < data.length; i += 2) { const v = data[i], run = data[i + 1]; out.fill(v, j, j + run); j += run; }
    return out;
  },

  async save(game) {
    const sv = (typeof Subworlds !== 'undefined' && Subworlds.current) ? Subworlds.saveView(game) : null;
    const w = sv ? sv.world : game.world, p = game.player;
    const npcs = sv ? sv.npcs : game.npcs, companions = sv ? sv.companions : game.companions;
    const px = sv ? sv.px : p.x, py = sv ? sv.py : p.y;
    const meta = {
      version: 1, w: w.w, h: w.h, seed: w.seed, time: w.time, name: game.worldName,
      spawnX: w.spawnX, spawnY: w.spawnY, surfaceLine: w.surfaceLine, cavernLine: w.cavernLine, bossDefeated: !!w.bossDefeated,
      surface: Array.from(w.surface), biome: Array.from(w.biome),
      chests: Array.from(w.chests.entries()),
      modData: w.modData || {},
      extra: Object.fromEntries(WORLD_SAVE_KEYS.filter(k => w[k] !== undefined).map(k => [k, w[k]])),
      playerExtra: Object.fromEntries(PLAYER_SAVE_KEYS.filter(k => p[k] !== undefined).map(k => [k, p[k]])),
      player: { x: px, y: py, modData: p.modData || {}, hp: p.hp, maxHp: p.maxHp, inventory: p.inventory, selected: p.selected, respawnX: p.respawnX, respawnY: p.respawnY, stats: p.stats, coins: p.coins, armor: p.armor, buffs: p.buffs, accessories: p.accessories, equipment: p.equipment, baseMana: p.baseMana, mana: p.mana, danmakuPower: p.danmakuPower || 0 },
      npcs: npcs.filter(n => !n.isPet && !n.isCompanion && !n.noSave && !(n instanceof BoundGoblin)).map(n => ({ x: n.x, y: n.y, name: n.name, role: n.role, hp: n.hp, home: n.home ? { key: n.home.key, homeX: n.home.homeX, homeY: n.home.homeY } : null, shop: n.shopItems || null, leaveAt: n.leaveAt || 0 })).concat(game.savedModNpcs || []),
      moonPhase: w.moonPhase, expert: !!w.expert, tombstones: w.tombstones ? Array.from(w.tombstones.entries()) : [],
      bossesDefeated: w.bossesDefeated || {}, bossRecords: w.bossRecords || {}, lootObtained: w.lootObtained || {},
      master: !!w.master,
      shrine: w.shrine || null, heartShrines: w.heartShrines || [], fishRecords: w.fishRecords || null, mineshaft: w.mineshaft || null, watchtower: w.watchtower || null, strandedShip: w.strandedShip || null,
      boundGoblin: w.boundGoblin || null, goblinRescued: !!w.goblinRescued,
      pets: { pet: game.pets.pet, light: game.pets.light, townBuff: game.pets.townBuff, owned: [...game.pets.owned], petted: [...game.pets.petted], cooldown: game.pets.cooldown, cdMax: game.pets.cdMax },
      petEverEquipped: !!game.petEverEquipped, pendingTownPets: game.pendingTownPets || [],
      companions: [...companions.map(c => Object.assign({ id: c.id, level: c.level, xp: c.xp, hp: c.hp, order: c.order, x: c.x, y: c.y }, typeof Squad !== 'undefined' ? Squad.saveData(c) : {})), ...(game.savedCompanions || (!ModList.on('adventure_squad') && game.loadedMeta ? (game.loadedMeta.companions || []) : []))], squadBagsGiven: !!game.squadBagsGiven,
      townPets: npcs.filter(n => n.isPet).map(n => ({ x: n.x, y: n.y, role: n.role, name: n.name })),
      savedAt: Date.now(),
    };
    const rec = {
      meta: JSON.stringify(meta),
      tiles: this.rle(w.tiles), walls: this.rle(w.walls), tdata: this.rle(w.tdata),
      liquid: this.rle(w.liquid), lava: this.rle(w.lava), explored: this.rle(w.explored),
    };
    const db = await this.open();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readwrite');
      tx.objectStore(this.STORE).put(rec, this.KEY);
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
    db.close();
  },

  async load() {
    const db = await this.open();
    const rec = await new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE, 'readonly');
      const req = tx.objectStore(this.STORE).get(this.KEY);
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
    db.close();
    if (!rec) return null;
    const meta = JSON.parse(rec.meta);
    const world = new World(meta.w, meta.h, meta.seed);
    const n = meta.w * meta.h;
    world.tiles = this.unrle(rec.tiles, n, Uint16Array); world.walls = this.unrle(rec.walls, n, Uint16Array); world.tdata = this.unrle(rec.tdata, n);
    world.liquid = this.unrle(rec.liquid, n); world.lava = this.unrle(rec.lava, n); world.explored = this.unrle(rec.explored, n);
    world.time = meta.time; world.spawnX = meta.spawnX; world.spawnY = meta.spawnY;
    world.surfaceLine = meta.surfaceLine; world.cavernLine = meta.cavernLine; world.bossDefeated = !!meta.bossDefeated;
    world.moonPhase = meta.moonPhase || 0; world.expert = !!meta.expert; world.tombstones = new Map(meta.tombstones || []);
    world.boundGoblin = meta.boundGoblin || null; world.goblinRescued = !!meta.goblinRescued;
    world.master = !!meta.master;
    world.modData = meta.modData || {};
    if (meta.extra) Object.assign(world, meta.extra); world.revengeance = !!(meta.modData && meta.modData.difficulty && meta.modData.difficulty.revengeance); world.death = !!(meta.modData && meta.modData.difficulty && meta.modData.difficulty.death);
    world.mineshaft = meta.mineshaft || null; world.watchtower = meta.watchtower || null; world.strandedShip = meta.strandedShip || null;
    world.shrine = meta.shrine || null; world.heartShrines = meta.heartShrines || []; world.fishRecords = meta.fishRecords || null;
    world.surface.set(meta.surface); world.biome.set(meta.biome);
    world.chests = new Map(meta.chests);
    world.rebuildTopSolid();
    world.rebuildChairs();
    return { world, meta };
  },

  async exists() {
    try {
      const db = await this.open();
      const rec = await new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE, 'readonly');
        const req = tx.objectStore(this.STORE).get(this.KEY);
        req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
      });
      db.close();
      return rec ? JSON.parse(rec.meta) : null;
    } catch (e) { return null; }
  },

  async clear() {
    const db = await this.open();
    await new Promise((resolve) => { const tx = db.transaction(this.STORE, 'readwrite'); tx.objectStore(this.STORE).delete(this.KEY); tx.oncomplete = resolve; });
    db.close();
  }
};
