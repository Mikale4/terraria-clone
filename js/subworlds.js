// ---------------------------------------------------------------------------
// Subworld Library: separate dimensions with their own size, generation,
// lighting and sky. Entering a subworld snapshots the main world (entities,
// NPCs, boss, position) and swaps it out; leaving restores everything.
// Saves made inside a subworld still save the main world. Subworlds are
// temporary (regenerated every visit), as the library allows.
// ---------------------------------------------------------------------------
'use strict';

const Subworlds = {
  defs: {}, current: null, snapshot: null, returnTimer: 0,
  register(id, def) { this.defs[id] = Object.assign({ id, name: id, sub: '', w: 300, h: 120, daylight: 1, sky: ['#101030', '#202050'], stars: true, spawns: false }, def); },
  inSub(game) { return !!(game.world && game.world.isSub); },
  def(game) { return game.world && game.world.isSub ? this.defs[game.world.isSub] : null; },
  enter(game, id, opts = {}) {
    const def = this.defs[id]; if (!def || this.current) return false;
    const p = game.player;
    this.snapshot = { world: game.world, enemies: game.enemies, drops: game.drops, projectiles: game.projectiles, npcs: game.npcs, boss: game.boss, bossPending: game.bossPending, px: p.x, py: p.y, worldName: game.worldName, fight: BossLog.fight };
    const w = new World(def.w, def.h, (Math.random() * 0xffffffff) >>> 0);
    w.isSub = id; w.noHell = true; w.noSpawns = !def.spawns; w.expert = game.expert; w.master = game.master;
    w.surfaceLine = def.surfaceLine != null ? def.surfaceLine : def.h; w.cavernLine = def.h;
    w.bossesDefeated = this.snapshot.world.bossesDefeated; w.bossRecords = this.snapshot.world.bossRecords; w.lootObtained = this.snapshot.world.lootObtained;
    w.modData = this.snapshot.world.modData;
    w.time = def.time != null ? Math.floor(w.dayLength * def.time / 24) : this.snapshot.world.time;
    if (def.daylight != null) w.daylight = () => def.daylight;
    w.skyOverride = def.sky; w.stars = def.stars;
    def.generate(w, game, opts);
    w.rebuildTopSolid();
    game.world = w; game.enemies = []; game.drops = []; game.projectiles = []; game.npcs = []; game.boss = null; game.bossPending = 0; game.particles = []; game.damageTexts = [];
    game.openChest = null; game.dialog = null; game.shop = null; game.housingSelect = null; game.trash = game.trash;
    p.x = w.spawnX * TILE - 10; p.y = (w.spawnY - 3) * TILE; p.vx = p.vy = 0; p.hook = null; p.px = p.x; p.py = p.y; p.respawnSub = { x: p.x, y: p.y }; p.fallStart = null; p.invuln = Math.max(p.invuln, 30);
    for (const c of game.companions) { c.x = p.x + rand(-30, 30); c.y = p.y; c.vx = c.vy = 0; }
    game.renderer.initMap(w); game.updateCamera(); game.updateCraftable();
    this.current = id;
    game.loading = { msg: def.loadingText || `Travelling to ${def.name}`, p: 1, tip: def.tip || '', worldName: def.name };
    game.state = 'loading'; setTimeout(() => { if (game.state === 'loading') game.state = 'play'; }, opts.instant ? 0 : 1200);
    if (def.onEnter) def.onEnter(game, w, opts);
    BiomeTitles.current = null;
    return true;
  },
  exit(game, reason = '') {
    if (!this.current) return false;
    const def = this.defs[this.current], s = this.snapshot, p = game.player;
    if (def.onExit) def.onExit(game, game.world, reason);
    for (const e of game.enemies) e.dead = true;
    const carry = game.drops.filter(d => !d.dead); // loot comes home with you
    game.world = s.world; game.enemies = s.enemies; game.drops = s.drops; game.projectiles = s.projectiles; game.npcs = s.npcs; game.boss = s.boss; game.bossPending = s.bossPending; game.particles = []; game.damageTexts = [];
    BossLog.fight = s.fight || null;
    p.x = s.px; p.y = s.py; p.vx = p.vy = 0; p.hook = null; p.px = p.x; p.py = p.y; p.respawnSub = null; p.fallStart = null; p.invuln = Math.max(p.invuln, 30);
    for (const d of carry) { d.x = p.cx + rand(-24, 24); d.y = p.y; d.vx = 0; d.vy = -2; d.pickupDelay = 10; game.drops.push(d); }
    for (const c of game.companions) { c.x = p.x + rand(-30, 30); c.y = p.y; c.vx = c.vy = 0; }
    this.current = null; this.snapshot = null;
    game.renderer.initMap(game.world); game.updateCamera(); game.updateCraftable();
    game.loading = { msg: 'Returning home', p: 1, tip: '', worldName: s.worldName };
    game.state = 'loading'; setTimeout(() => { if (game.state === 'loading') game.state = 'play'; }, 800);
    BiomeTitles.current = null;
    return true;
  },
  // what the save system should persist while we are away from the main world
  saveView(game) { const s = this.snapshot; return { world: s.world, npcs: s.npcs, companions: game.companions, px: s.px, py: s.py }; },
  tick(game) {
    if (!this.current) return;
    const def = this.defs[this.current];
    if (def.tick) def.tick(game, game.world);
    // dying in a subworld sends you home
    if (game.player.dead && game.player.deadTimer < 600 - 150) this.exit(game, 'death');
  },
  // HUD hint
  draw(game) {
    if (!this.current) return;
    const def = this.defs[this.current], ctx = game.renderer.ctx, W = game.renderer.W;
    drawText(ctx, `${def.name}${def.exitHint ? '   -   ' + def.exitHint : ''}`, W / 2, 8, { size: 13, align: 'center', color: '#c0c0ff' });
  },
};

// generation helpers for subworld builders -------------------------------------------
const SubGen = {
  fill(w, x0, y0, x1, y1, id, wall) { for (let y = Math.max(0, y0); y <= Math.min(w.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(w.w - 1, x1); x++) { w.rawSet(x, y, id); if (wall != null) w.walls[w.idx(x, y)] = wall; } },
  clear(w, x0, y0, x1, y1) { for (let y = Math.max(0, y0); y <= Math.min(w.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(w.w - 1, x1); x++) { w.rawSet(x, y, T.AIR); w.liquid[w.idx(x, y)] = 0; } },
  disc(w, cx, cy, r, id, rng) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = Math.hypot(x, y) + (rng ? (rng() - 0.5) * 1.5 : 0); if (d <= r) w.rawSet(cx + x, cy + y, id); } },
  finish(w) { w.rebuildTopSolid(); w.rebuildChairs(); for (let x = 0; x < w.w; x++) { let y = 0; while (y < w.h - 1 && !w.isSolidAt(x, y)) y++; w.surface[x] = y; } },
};
