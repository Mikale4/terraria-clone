// ---------------------------------------------------------------------------
// Game: state machine, input, main loop, gameplay logic
// ---------------------------------------------------------------------------
'use strict';


class Bomb extends Entity {
  constructor(x, y, vx, vy, ex = { radius: 4.5, damage: 60, tiles: true }) { super(x - 6, y - 6, 12, 12); this.vx = vx; this.vy = vy; this.fuse = 150; this.ex = ex; }
  update(world, game) {
    this.fuse--;
    this.applyGravity(0.8);
    this.vx *= this.onGround ? 0.9 : 0.995;
    this.moveAndCollide(world);
    if (this.collidedX) this.vx *= -0.5;
    game.lighting.extraLights.push({ x: this.cx / TILE, y: this.cy / TILE, r: 0.5, g: 0.3, b: 0.1 });
    if (this.fuse <= 0) { this.dead = true; game.explode(this.cx, this.cy, this.ex.radius, this.ex.damage, this.ex.tiles); }
  }
  draw(ctx, camX, camY) {
    const x = snap(this.x - camX), y = snap(this.y - camY);
    ctx.fillStyle = this.ex.radius >= 7 ? '#c03030' : this.ex.tiles ? '#202028' : '#3a5a3a'; ctx.beginPath(); ctx.arc(x + 6, y + 6, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#505060'; ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillStyle = this.fuse % 10 < 5 ? '#ffe060' : '#ff8020'; ctx.fillRect(x + 7, y - 3, 3, 3);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.renderer = new Renderer(this.canvas);
    this.lighting = new Lighting();
    this.state = 'title';
    this.world = null; this.player = null;
    this.enemies = []; this.drops = []; this.particles = []; this.damageTexts = []; this.npcs = []; this.projectiles = [];
    this.messages = [];
    this.cam = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0, left: false, right: false, inside: true, wx: 0, wy: 0 };
    this.keys = new Set();
    this.invOpen = false; this.openChest = null; this.dialog = null; this.settingsOpen = false;
    this.trash = null;
    this.craftable = []; this.stations = new Set();
    this.hoverTile = null;
    this.swingId = 0;
    this.acc = 0; this.last = 0;
    this.menu = { items: [], info: null };
    this.loading = { msg: '', p: 0, tip: '', worldName: '' };
    this.worldName = '';
    this.deathMsg = '';
    this.autosaveTimer = 0;
    this.titleCam = { x: 0, y: 0 };
    this.titleWorld = null;
    this.spawnTimer = 0;
    this.playerName = 'Terrarian';
    this.useHeld = 0;
    this.boss = null; this.bossPending = 0;
    this.smartCursor = false;
    this.autoswing = true;
    this.expert = false;
    this.worldSize = 'small';
    this.shop = null;          // open merchant shop
    this.lostCoins = 0;
    this.arrivalTimer = 0;
    this.housingSelect = null;
    this.pets = new PetSystem(this);
    this.companions = [];
    this.baseConfig = Object.assign({}, DEFAULT_BASE_CONFIG);
    this.trashPaid = 0; this.trashRate = 1;   // Trash To Treasure payout rate (0..1)
    this.master = false;
    this.throarbinExact = false;               // Mage mod: use the video's 10% numbers instead of the buffed 25%
    this.petEverEquipped = false;
    this.pendingTownPets = [];
    this.toasts = [];
    this.achievements = new Set(JSON.parse(localStorage.getItem('terraria_achievements') || '[]'));
  }

  init() {
    buildSprites(1337);
    buildPetIcons();
    this.renderer.buildBackgrounds(1337);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const c = this.canvas;
    c.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.inside = true; if (UI.mapDrag) { UI.mapPan.x = UI.mapDrag.px - (e.clientX - UI.mapDrag.x) / UI.mapZoom; UI.mapPan.y = UI.mapDrag.py - (e.clientY - UI.mapDrag.y) / UI.mapZoom; } if (Reforge.drag) { Reforge.win.x = clamp(e.clientX - Reforge.drag.dx, 0, innerWidth - 100); Reforge.win.y = clamp(e.clientY - Reforge.drag.dy, 0, innerHeight - 60); } });
    c.addEventListener('mouseleave', () => { this.mouse.inside = false; this.mouse.left = false; this.mouse.right = false; UI.mapDrag = null; });
    c.addEventListener('mousedown', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; Audio_.init(); Audio_.resume(); if (e.button === 0) { this.mouse.left = true; this.onLeftDown(); } else if (e.button === 2) { this.mouse.right = true; this.onRightDown(); } e.preventDefault(); });
    c.addEventListener('mouseup', e => { if (e.button === 0) { this.mouse.left = false; UI.mapDrag = null; if (Reforge.drag) { Reforge.drag = null; Reforge.save(); } } else if (e.button === 2) this.mouse.right = false; });
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('wheel', e => { this.onWheel(e.deltaY); e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', e => { this.onKeyDown(e); });
    window.addEventListener('keyup', e => { this.keys.delete(e.code); });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.left = false; this.mouse.right = false; });
    window.addEventListener('beforeunload', () => { if (this.state === 'play') this.saveGame(true); });
    this.showTitle();
    // title background: a fake tiny world for the sky
    this.titleWorld = { surfaceLine: 210, cavernLine: 400, h: 600, time: 0, dayLength: 24 * 60 * 60, moonPhase: 0, bloodMoon: false,
      hour() { return 10; }, isDay() { return true; }, daylight() { return 1; } };
    requestAnimationFrame(t => this.loop(t));
  }

  resize() {
    this.renderer.resize();
    UI.scale = clamp(window.innerHeight / 1000, 0.7, 1.3);
  }

  // ---------------------------------------------------------------------------
  // Title & menus
  async showTitle() {
    this.state = 'title';
    this.menu.info = null;
    this.menu.items = [
      { label: 'Single Player', action: () => this.showWorldMenu() },
      { label: 'Settings', action: () => this.showSettingsMenu() },
      { label: 'Mods', action: () => { UI.modsOpen = true; ModList.cfgMod = null; ModList.showDesc = null; this.menu.items = []; } },
      { label: 'Achievements', action: () => { UI.achievementsOpen = true; this.menu.items = [{ label: 'Back', action: () => { UI.achievementsOpen = false; this.showTitle(); } }]; } },
      { label: 'Credits', action: () => { this.menu.info = 'A from-scratch browser homage to Terraria. Everything here is procedurally drawn code: no external assets. Terraria is a trademark of Re-Logic; this is a fan project.'; this.menu.items = [{ label: 'Back', action: () => this.showTitle() }]; } },
      { label: 'Exit', action: () => { window.close(); this.menu.info = 'You can close this tab to exit.'; } },
    ];
  }

  showCreateMenu() {
    const sizeNames = { small: 'Small (1800×600)', medium: 'Medium (2800×900)', large: 'Large (4200×1200)' };
    const bc = this.baseConfig;
    this.menu.info = (this.death ? 'Death (Calamity): Revengeance plus 50% tougher enemies and 5% more damage taken. ' : this.revengeance ? 'Revengeance (Calamity): Expert plus 25% tougher enemies; unlocks the Rage (R) and Adrenaline (V) meters. ' : this.master ? 'Master: triple enemy life and damage, 5x coins, an extra accessory slot. ' : this.expert ? 'Expert: double enemy life and damage, 2.5x coins, weaker defense, an extra accessory slot. ' : 'Classic: the standard experience; you drop half your coins on death. ') + (ModList.on('authentic_races') ? `Race: ${Races.get(this.raceChoice || 'human').desc} ` : '') + (bc.style === 'none' || !ModList.on('start_with_base') ? '' : `Starter base: one house for each of the ${baseRoomCount()} town NPCs (${baseConfigCode(bc)}). Chests and crafting stations are still up to you.`);
    this.menu.items = [
      { label: `World Size: ${sizeNames[this.worldSize]}`, action: () => { const k = ['small', 'medium', 'large']; this.worldSize = k[(k.indexOf(this.worldSize) + 1) % 3]; this.showCreateMenu(); } },
      { label: `Difficulty: ${this.difficultyLabel()}`, action: () => { this.cycleDifficulty(); this.showCreateMenu(); } },
      { label: `Race: ${Races.get(this.raceChoice || 'human').name}`, action: () => { const ids = Races.ids(); this.raceChoice = ids[(ids.indexOf(this.raceChoice || 'human') + 1) % ids.length]; this.showCreateMenu(); } },
      { label: 'Race Editor', action: () => { Races.openEditor(this.raceChoice || 'human'); UI.raceEditorOpen = true; this.menu.items = [{ label: 'Back', action: () => { UI.raceEditorOpen = false; this.showCreateMenu(); } }]; } },
      ...(ModList.on('start_with_base') ? [
      { label: `Starter Base: ${BASE_STYLE_NAMES[bc.style]}`, action: () => { bc.style = BASE_STYLES[(BASE_STYLES.indexOf(bc.style) + 1) % BASE_STYLES.length]; this.showCreateMenu(); } },
      { label: `Base Blocks: ${BASE_BLOCKS[bc.block][0]}`, action: () => { const k = Object.keys(BASE_BLOCKS); bc.block = k[(k.indexOf(bc.block) + 1) % k.length]; this.showCreateMenu(); } },
      { label: `Base Walls: ${BASE_WALLS[bc.wall][0]}`, action: () => { const k = Object.keys(BASE_WALLS); bc.wall = k[(k.indexOf(bc.wall) + 1) % k.length]; this.showCreateMenu(); } },
      { label: `Hellevator: ${bc.hellevator ? 'Yes' : 'No'}`, action: () => { bc.hellevator = !bc.hellevator; this.showCreateMenu(); } },
      { label: `Rest Outposts: ${bc.outposts ? 'Yes' : 'No'}`, action: () => { bc.outposts = !bc.outposts; this.showCreateMenu(); } }] : []),
      { label: 'Create World', action: () => this.newWorld() },
      { label: 'Back', action: () => this.showWorldMenu() },
    ];
  }

  difficultyLabel() { return this.death ? (this.master ? 'Master Death' : 'Death') : this.revengeance ? (this.master ? 'Master Revengeance' : 'Revengeance') : this.master ? 'Master' : this.expert ? 'Expert' : 'Classic'; }
  cycleDifficulty() {
    const order = ['classic', 'expert', 'master', 'rev', 'death', 'mrev', 'mdeath'];
    const cur = this.death ? (this.master ? 'mdeath' : 'death') : this.revengeance ? (this.master ? 'mrev' : 'rev') : this.master ? 'master' : this.expert ? 'expert' : 'classic';
    const nx = order[(order.indexOf(cur) + 1) % order.length];
    this.expert = nx !== 'classic'; this.master = nx === 'master' || nx === 'mrev' || nx === 'mdeath'; this.revengeance = nx === 'rev' || nx === 'death' || nx === 'mrev' || nx === 'mdeath'; this.death = nx === 'death' || nx === 'mdeath';
  }
  async showWorldMenu() {
    const meta = await SaveSystem.exists();
    this.menu.info = null;
    const items = [{ label: 'New World', action: () => this.showCreateMenu() }];
    if (meta) {
      const d = new Date(meta.savedAt);
      items.push({ label: `Load "${meta.name}"`, action: () => this.loadWorld() });
      this.menu.info = `Saved world: ${meta.name} — ${d.toLocaleString()}`;
      items.push({ label: 'Delete Saved World', action: async () => { await SaveSystem.clear(); this.showWorldMenu(); } });
    }
    items.push({ label: 'Back', action: () => this.showTitle() });
    this.menu.items = items;
  }

  showSettingsMenu() {
    this.menu.info = null;
    this.menu.items = [
      { label: `Sound: ${Audio_.enabled ? 'On' : 'Off'}`, action: () => { Audio_.enabled = !Audio_.enabled; this.showSettingsMenu(); } },
      { label: `Music volume: ${Math.round(SFX.cfg.music * 100)}%`, action: () => { SFX.cfg.music = (Math.round(SFX.cfg.music * 4) + 1) % 5 / 4; SFX.save(); this.showSettingsMenu(); } },
      { label: `Sound effects: ${Math.round(SFX.cfg.sfx * 100)}%`, action: () => { SFX.cfg.sfx = (Math.round(SFX.cfg.sfx * 4) + 1) % 5 / 4; SFX.save(); Audio_.play('menu'); this.showSettingsMenu(); } },
      { label: `Zoom: ${this.renderer.zoom.toFixed(1)}x`, action: () => { this.cycleZoom(); this.showSettingsMenu(); } },
      { label: `Autoswing: ${this.autoswing ? 'On' : 'Off'}`, action: () => { this.autoswing = !this.autoswing; this.showSettingsMenu(); } },
      { label: 'Back', action: () => this.showTitle() },
    ];
  }

  cycleZoom() {
    const z = [1.5, 2, 2.5, 3];
    const i = (z.indexOf(this.renderer.zoom) + 1) % z.length;
    this.renderer.zoom = z[i];
    this.renderer.resize();
  }

  // ---------------------------------------------------------------------------
  newWorld() {
    this.state = 'loading';
    const seed = (Math.random() * 0xffffffff) >>> 0;
    const [ww, wh] = WORLD_SIZES[this.worldSize] || WORLD_SIZES.small;
    const world = new World(ww, wh, seed);
    world.expert = this.expert || this.master; world.master = this.master; world.revengeance = !!this.revengeance; world.death = !!this.death;
    world.modData = { difficulty: { revengeance: !!this.revengeance, death: !!this.death } };
    world.baseConfig = Object.assign({}, this.baseConfig);
    this.worldName = choose(WORLD_NAMES);
    this.loading = { msg: 'Preparing', p: 0, tip: choose(TIPS), worldName: this.worldName };
    const gen = generateWorld(world);
    const started = performance.now();
    const step = () => {
      const t0 = performance.now();
      let r;
      do { r = gen.next(); if (!r.done) { this.loading.msg = r.value.msg; this.loading.p = r.value.p; } } while (!r.done && performance.now() - t0 < 30 && r.value.p < 1);
      if (r.done || this.loading.p >= 1) { setTimeout(() => this.startPlay(world, null), Math.max(200, 2500 - (performance.now() - started))); }
      else setTimeout(step, 0);
    };
    setTimeout(step, 50);
  }

  async loadWorld() {
    this.state = 'loading';
    this.loading = { msg: 'Loading world', p: 0.5, tip: choose(TIPS), worldName: '...' };
    try {
      const res = await SaveSystem.load();
      if (!res) { this.showTitle(); return; }
      this.worldName = res.meta.name;
      this.loading.worldName = this.worldName;
      this.startPlay(res.world, res.meta);
    } catch (e) { console.error(e); this.showTitle(); }
  }

  startPlay(world, meta) {
    this.world = world;
    world.mapDirty.length = 0;
    const p = new Player(world.spawnX * TILE - 10, (world.spawnY - 3) * TILE);
    p.respawnX = p.x; p.respawnY = p.y;
    this.player = p;
    this.enemies = []; this.drops = []; this.particles = []; this.damageTexts = []; this.npcs = []; this.projectiles = [];
    this.messages = []; this.trash = null; this.openChest = null; this.dialog = null; this.settingsOpen = false; this.invOpen = false;
    this.boss = null; this.bossPending = 0;
    this.expert = !!world.expert; this.master = !!world.master; this.revengeance = !!world.revengeance; this.death = !!world.death;
    world.modData = world.modData || {}; p.modData = (meta && meta.player && meta.player.modData) || {};
    if (!meta) { p.modData.race = { race: this.raceChoice || 'human', cd: 0 }; }
    Subworlds.current = null; Subworlds.snapshot = null; Fables.dialog = null; UI.arrayOpen = UI.albumOpen = UI.structOpen = false;
    this.shop = null; this.lostCoins = 0; this.housingSelect = null; UI.housingOpen = false;
    this.pets.reset(); this.petEverEquipped = !!(meta && meta.petEverEquipped); this.pendingTownPets = (meta && meta.pendingTownPets) || [];
    if (meta && meta.pets) { const ps = meta.pets; this.pets.pet = ps.pet || null; this.pets.light = ps.light || null; this.pets.townBuff = ps.townBuff || null; this.pets.owned = new Set(ps.owned || []); this.pets.petted = new Set(ps.petted || []); this.pets.cooldown = ps.cooldown || 0; this.pets.cdMax = ps.cdMax || 0; }
    if (meta) for (const tp of (meta.townPets || [])) { const t = new TownPet(tp.x, tp.y, tp.role, tp.name); this.npcs.push(t); }
    if (world.boundGoblin && !world.goblinRescued) this.npcs.push(new BoundGoblin(world.boundGoblin.x, world.boundGoblin.y));
    this.companions = []; this.savedCompanions = null; this.loadedMeta = meta || null;
    if (meta && !ModList.on('adventure_squad')) this.savedCompanions = (meta.companions || []).filter(c => !(COMPANION_DEFS[c.id] && COMPANION_DEFS[c.id].guardian));
    if (meta) for (const c of (meta.companions || [])) { if (!COMPANION_DEFS[c.id]) continue; if (!ModList.on('adventure_squad') && !COMPANION_DEFS[c.id].guardian) continue; if (COMPANION_DEFS[c.id].guardian && !ModList.on('terraguardians')) { (this.savedCompanions = this.savedCompanions || []).push(c); continue; } const co = new Companion(c.id, c.x, c.y); if (typeof Squad !== 'undefined') Squad.restore(co, c); co.level = c.level || 1; co.xp = c.xp || 0; co.maxHp = 100 + 20 * (co.level - 1); co.hp = Math.min(co.maxHp, c.hp || co.maxHp); co.order = c.order || 'follow'; this.companions.push(co); }
    this.squadBagsGiven = !!(meta && meta.squadBagsGiven);
    if (meta) {
      const mp = meta.player;
      p.x = mp.x; p.y = mp.y; p.hp = mp.hp; p.maxHp = mp.maxHp; p.inventory = mp.inventory; p.selected = mp.selected; p.respawnX = mp.respawnX; p.respawnY = mp.respawnY;
      if (mp.stats) p.stats = Object.assign(p.stats, mp.stats);
      p.coins = mp.coins || 0; if (mp.armor) p.armor = mp.armor; if (mp.buffs) p.buffs = mp.buffs;
      if (meta.bossesDefeated) world.bossesDefeated = meta.bossesDefeated; if (meta.bossRecords) world.bossRecords = meta.bossRecords; if (meta.lootObtained) world.lootObtained = meta.lootObtained;
      if (mp.accessories) { p.accessories = mp.accessories; while (p.accessories.length < 4) p.accessories.push(null); } if (mp.equipment) p.equipment = mp.equipment; p.danmakuPower = mp.danmakuPower || 0; if (mp.baseMana) { p.baseMana = mp.baseMana; p.maxMana = mp.baseMana; p.mana = Math.min(mp.mana || 0, p.maxMana); }
      this.savedModNpcs = [];
      for (const n of meta.npcs) { if (n.role === 'Bound Goblin') continue; { const d = NPC_ROLES[n.role]; if (d && d.mod && !ModList.on(d.mod)) { this.savedModNpcs.push(n); continue; } } const npc = new NPC(n.x, n.y, n.name, n.role || 'Guide'); if (n.hp) npc.hp = n.hp; npc.home = n.home || null; npc.shopItems = n.shop || null; npc.leaveAt = n.leaveAt || 0; this.npcs.push(npc); }
    } else {
      p.addItem('copper_shortsword', 1, null); p.addItem('copper_pickaxe', 1, null); p.addItem('copper_axe', 1, null); p.addItem('torch', 10); if (ModList.on('stars_above')) p.addItem('starfarers_guide', 1, null);
      if (ModList.on('adventure_squad')) { for (const id in COMPANION_DEFS) if (!COMPANION_DEFS[id].guardian) p.addItem(`${id}_bag`, 1, null); this.squadBagsGiven = true; }
      const guide = new NPC((world.spawnX + 4) * TILE, (world.spawnY - 3) * TILE, npcName('Guide'), 'Guide');
      this.npcs.push(guide);
      if (world.baseInfo) { const house = world.findVacantHouse(this.npcs); if (house) { guide.home = { key: house.key, homeX: house.homeX, homeY: house.homeY }; guide.x = house.homeX * TILE - 2; guide.y = (house.homeY + 1) * TILE - 42; } setTimeout(() => this.message(`Your starter base is ready: ${world.baseInfo.rooms} houses waiting for the town.`, '#ffe75a'), 1800); }
      setTimeout(() => this.message(`${guide.name} the Guide has arrived!`, '#50ff50'), 800);
    }
    if (!this.squadBagsGiven && ModList.on('adventure_squad')) { for (const id in COMPANION_DEFS) { if (COMPANION_DEFS[id].guardian) continue; const left = p.addItem(`${id}_bag`, 1, null); if (left) this.dropItem(p.cx, p.cy, `${id}_bag`, 1, null, null); } this.squadBagsGiven = true; setTimeout(() => this.message('The Adventure Squad left their bags with you. Use a bag to call a companion!', '#ffe75a'), 1200); }
    Races.apply(this, !meta);
    Equipment.init(p); if (meta && meta.playerExtra) Object.assign(p, meta.playerExtra); Equipment.init(p);
    ModList.unequipDisabled(this);
    if (!meta && world.dungeon) { const om = new NPC(world.dungeon.x * TILE - 60, (world.dungeon.y - 3) * TILE, 'Old Man', 'Old Man'); om.stayPut = true; this.npcs.push(om); }
    if (meta && world.dungeon && !world.skeletronDefeated && !this.npcs.some(n => n.role === 'Old Man')) { const om = new NPC(world.dungeon.x * TILE - 60, (world.dungeon.y - 3) * TILE, 'Old Man', 'Old Man'); om.stayPut = true; this.npcs.push(om); }
    this.renderer.initMap(world);
    this.updateCamera();
    this.state = 'play';
    this.updateCraftable();
    this.autosaveTimer = 0;
  }

  async saveGame(silent = false) {
    if (!this.world) return;
    try { await SaveSystem.save(this); if (!silent) this.message('Game saved.', '#ffe75a'); }
    catch (e) { console.error(e); this.message('Save failed: ' + e.message, '#ff6060'); }
  }

  async exitToTitle() {
    await this.saveGame();
    this.state = 'title';
    this.world = null;
    this.showTitle();
  }

  // ---------------------------------------------------------------------------
  loop(ts) {
    requestAnimationFrame(t => this.loop(t));
    if (!this.last) this.last = ts;
    let dt = (ts - this.last) / 1000; this.last = ts;
    if (dt > 0.25) dt = 0.25;
    this.acc += dt;
    const step = 1 / TICK_RATE;
    let ticks = 0;
    while (this.acc >= step && ticks < 5) { this.acc -= step; this.update(); ticks++; }
    if (ticks === 5) this.acc = 0;
    this.render();
  }

  // ---------------------------------------------------------------------------
  // All moving things, for render interpolation
  movingThings() { return [this.player, ...this.npcs, ...this.companions, ...this.enemies, ...this.drops, ...this.projectiles, ...this.particles]; }

  update() {
    this.renderer.frame++;
    if (this.state !== 'play') { this.titleCam.x += 0.4; return; }
    if (UI.fullMap) return; // the map pauses the world: nothing moves, time stands still
    for (const e of this.movingThings()) { e.px = e.x; e.py = e.y; }
    const w = this.world, p = this.player;
    w.time++;
    // input to player
    const blockInput = this.dialog || this.settingsOpen;
    p.input.left = !blockInput && (this.keys.has('KeyA') || this.keys.has('ArrowLeft'));
    p.input.right = !blockInput && (this.keys.has('KeyD') || this.keys.has('ArrowRight'));
    p.input.jump = !blockInput && (this.keys.has('Space') || this.keys.has('KeyW') || this.keys.has('ArrowUp'));
    p.input.down = !blockInput && (this.keys.has('KeyS') || this.keys.has('ArrowDown'));
    if (this.settingsOpen) return; // paused

    p.update(w, this);
    this.pets.tick();
    Magic.tick(this);
    Reforge.tick(this);
    BiomeTitles.tick(this);
    Fishing.tick(this);
    Consolaria.tick(this);
    Events.tick(this); Pillars.tick(this); BiomeSys.tick(this); Equipment.tick(this); ModLib.emit('tick', this); this.lateGameTick();
    FX.tick(); FX.recordTrails(this); Subworlds.tick(this); Calamity.tick(this); Thorium.tick(this); ManaOverload.tick(this); Fargo.tick(this); StarsAbove.tick(this); StarsAbove.tickNova(this); Races.tick(this); Fables.tick(this);
    if (Reforge.open && (!Reforge.npc || Reforge.npc.dead || dist(p.cx, p.cy, Reforge.npc.cx, Reforge.npc.cy) > 12 * TILE)) Reforge.close(this);
    this.updateMouseWorld();
    this.updateHoverTile();
    // continuous use
    if (this.mouse.left && !p.dead && !this.dialog && !this.housingSelect && !this.overUI()) this.tryUse();
    else if (!this.mouse.left) this.useHeld = 0;
    this.craftHoldTick();

    for (const n of this.npcs) n.update(w, this);
    for (const c of this.companions) c.update(w, this);
    for (const e of this.enemies) for (const c of this.companions) if (c.ko === 0 && e.x < c.x + c.w && e.x + e.w > c.x && e.y < c.y + c.h && e.y + e.h > c.y) c.hit(e.damage, e.cx, this);
    for (const e of this.enemies) e.update(w, this);
    // enemies hurt town NPCs on contact
    for (const e of this.enemies) for (const n of this.npcs) if (e.x < n.x + n.w && e.x + e.w > n.x && e.y < n.y + n.h && e.y + e.h > n.y) n.hit(e.damage, e.cx, this);
    this.npcs = this.npcs.filter(n => !n.dead);
    for (const d of this.drops) d.update(w, p, this);
    for (const b of this.projectiles) b.update(w, this);
    for (const pt of this.particles) pt.update(w);
    for (const t of this.damageTexts) t.update();
    this.enemies = this.enemies.filter(e => !e.dead);
    this.drops = this.drops.filter(d => !d.dead);
    this.projectiles = this.projectiles.filter(d => !d.dead);
    this.particles = this.particles.filter(x => !x.dead);
    this.damageTexts = this.damageTexts.filter(x => !x.dead);
    for (const m of this.messages) m.life--;
    this.messages = this.messages.filter(m => m.life > 0);
    for (const t of this.toasts) t.life--;
    this.toasts = this.toasts.filter(t => t.life > 0);
    // dropping a Copper Helmet / Shortsword onto a slime recruits the Squire Slime
    for (const d of this.drops) if ((d.id === 'copper_helmet' || d.id === 'copper_shortsword') && d.pickupDelay > 0) for (const e of this.enemies) if (e instanceof Slime && d.x < e.x + e.w && d.x + d.w > e.x && d.y < e.y + e.h && d.y + d.h > e.y) { d.dead = true; if (!this.npcs.some(n => n.role === 'Squire Slime') && !this.pendingTownPets.includes('Squire Slime')) { this.pendingTownPets.push('Squire Slime'); this.message('The slime looks strangely dignified. It will move in at dawn.', '#60c0ff'); } }

    this.updateFallingSand();
    if (w.time % 2 === 0) w.updateLiquids(p.tileX, p.tileY);
    w.randomTicks(p.tileX, p.tileY, 30);
    // tile damage decay
    for (const [i, d] of w.tileDamage) if (w.time - d.t > 200) w.tileDamage.delete(i);
    this.spawnEnemies();
    // torches & campfire particles
    if (w.time % 4 === 0) this.ambientParticles();
    // chest distance check
    if (this.openChest && dist(p.cx, p.cy, this.openChest.x * TILE + 16, this.openChest.y * TILE + 16) > 7 * TILE) this.closeChest();
    if (this.dialog && dist(p.cx, p.cy, this.dialog.npc.cx, this.dialog.npc.cy) > 8 * TILE) this.closeDialog();
    if (this.shop && !(this.shopNpc && !this.shopNpc.dead && dist(p.cx, p.cy, this.shopNpc.cx, this.shopNpc.cy) < 10 * TILE)) this.closeShop();
    if (w.time % 60 === 0) this.updateCraftable();
    // autosave every 3 minutes
    if (++this.autosaveTimer > 60 * 180) { this.autosaveTimer = 0; this.saveGame(true); }
    // day/night events: dusk (19:30) and dawn (4:30)
    const tod = w.time % w.dayLength;
    if (tod === Math.round(w.dayLength * 19.5 / 24)) {
      // Blood Moon: 1/9 chance each night once the player has more than 120 max life
      if (p.maxHp > 120 && Math.random() < 1 / 9) { w.bloodMoon = true; this.message('The Blood Moon is rising...', '#ff4040'); }
      else this.message('Night has fallen. Monsters are stirring...', '#c0c0ff');
      if (!w.bossDefeated && p.maxHp >= 200 && !w.bloodMoon && Math.random() < 0.34) { this.bossPending = 60 * 30; this.message('You feel an evil presence watching you...', '#c040c0'); }
    }
    if (tod === Math.round(w.dayLength * 4.5 / 24)) {
      w.moonPhase = (w.moonPhase + 1) % 8;
      for (const role of this.pendingTownPets.splice(0)) this.spawnTownPet(role);
      // King Slime occasionally shows up in the outer thirds of the world (like Terraria's 1/300 daytime chance)
      if (!this.boss && Math.abs(p.tileX - w.w / 2) > w.w / 3 && p.tileY < w.surfaceLine && Math.random() < 0.15) this.summonKingSlime();
      if (w.bloodMoon) { w.bloodMoon = false; this.message('The Blood Moon has passed.', '#c0c0ff'); }
      Events.dawn(this);
      // Traveling Merchant: 22.12% chance each morning once two other town NPCs are present
      if (this.npcs.filter(n => n.isTown).length >= 2 && !this.npcs.some(n => n.role === 'Traveling Merchant') && Math.random() < 0.2212) this.arrivalTimer = 60 * randInt(30, 300);
    }
    // NPCs move in during the day, one at a time, if a suitable vacant house exists
    if (w.isDay() && w.time % 600 === 0) this.checkArrivals();
    if (w.time % 600 === 300) this.assignHomes();
    if (this.arrivalTimer > 0 && --this.arrivalTimer === 0 && w.isDay()) this.spawnTravelingMerchant();
    if (this.bossPending > 0 && --this.bossPending === 0 && !this.boss && !w.isDay()) this.summonBoss();
    this.updateCamera();
  }

  updateCamera() {
    const r = this.renderer, p = this.player, w = this.world;
    let cx = p.cx - r.vw / 2, cy = p.cy - r.vh / 2;
    cx = clamp(cx, 0, w.w * TILE - r.vw); cy = clamp(cy, 0, w.h * TILE - r.vh);
    this.cam.x = snap(cx); this.cam.y = snap(cy);
  }

  updateMouseWorld() {
    this.mouse.wx = this.mouse.x / this.renderer.zoom + this.cam.x;
    this.mouse.wy = this.mouse.y / this.renderer.zoom + this.cam.y;
  }

  overUI() {
    if (this.settingsOpen || UI.fullMap || UI.arrayOpen || UI.albumOpen || UI.structOpen || UI.raceEditorOpen || Fables.dialog) return true;
    return !!UI.hit(this.mouse.x, this.mouse.y);
  }

  inReach(tx, ty) {
    const p = this.player;
    const r = 6.5 + (p.pm ? p.pm.place : 0);
    return Math.abs(tx * TILE + 8 - p.cx) <= r * TILE && Math.abs(ty * TILE + 8 - p.cy) <= r * TILE;
  }

  updateHoverTile() {
    const tx = Math.floor(this.mouse.wx / TILE), ty = Math.floor(this.mouse.wy / TILE);
    if (!this.world.inBounds(tx, ty) || this.invOpen && this.overUI()) { this.hoverTile = null; return; }
    this.hoverTile = { x: tx, y: ty, ok: this.inReach(tx, ty) };
  }

  activeItem() {
    const p = this.player;
    if (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) {
      const auto = this.autoSelect();
      if (auto != null) return p.inventory[auto];
    }
    return p.selectedItem;
  }

  // Shift auto-select: choose the best tool for the hovered tile
  autoSelect() {
    const p = this.player, w = this.world, h = this.hoverTile;
    if (!h) return null;
    const id = w.get(h.x, h.y);
    const def = TILES[id];
    let want = null;
    if (id !== T.AIR) {
      if (def.tool === 'axe') want = 'axe';
      else if (def.tool === 'pick' || def.tool === 'any') want = 'pick';
    } else if (w.getWall(h.x, h.y)) want = 'hammer';
    else want = 'torch';
    let best = null, bestPow = -1;
    for (let i = 0; i < 50; i++) {
      const s = p.inventory[i]; if (!s) continue;
      const it = ITEMS[s.id];
      if (want === 'torch') { if (s.id === 'torch') return i; continue; }
      const pw = it.tool === want ? it.power : (it.tools && it.tools[want]) || 0; if (pw > bestPow) { best = i; bestPow = pw; } // multi-tools (Drax, hamaxes) count for every kind they cover
    }
    return best;
  }

  // ---------------------------------------------------------------------------
  // Item use
  tryUse() {
    const p = this.player;
    if (p.useTimer > 0) return;
    const slot = (this.invOpen && p.cursorItem) ? p.cursorItem : this.activeItem();
    if (!slot) return;
    const it = ITEMS[slot.id];
    this.useHeld++;
    if (it.mod && !ModList.on(it.mod)) { if (this.useHeld === 1) this.message(`${it.name} comes from a disabled mod (Settings > Mod settings).`, '#ff8080'); p.useTimer = 20; return; }
    const h = this.hoverTile;
    if (it.placeable) {
      if (h && h.ok && this.placeItem(slot, it, h.x, h.y)) p.startUse(slot.id, 8);
      else p.useTimer = 4;
      return;
    }
    if (it.onUse) { if (this.useHeld === 1) it.onUse(this, slot, it); p.useTimer = 20; return; }
    if (it.use) { it.use(this, slot, it); return; }
    if (it.fishingPole) { if (this.useHeld === 1) Fishing.use(this, slot, it); p.useTimer = 10; return; }
    if (it.consumable) { if (this.useHeld === 1) this.consume(slot, it); p.useTimer = 20; return; }
    if (it.tool === 'hook') { if (this.useHeld === 1) this.fireHook(); p.useTimer = 10; return; }
    if (it.armor) { if (this.useHeld === 1) this.equipArmor(slot); p.useTimer = 10; return; }
    if (it.pet) { if (this.useHeld === 1) this.equipPet(slot); p.useTimer = 10; return; }
    if (it.accessory) { if (this.useHeld === 1) this.equipAccessory(slot); p.useTimer = 10; return; }
    if (it.magic) { Magic.cast(this, slot, it); return; }
    if (slot.id === 'pet_tablet') { if (this.useHeld === 1) { UI.petPanel = !UI.petPanel; Audio_.play('open'); } p.useTimer = 10; return; }
    if (it.ranged) {
      const st = itemStats(slot);
      const ammoI = p.inventory.findIndex(a => a && a.id === it.ammo);
      if (ammoI < 0) { p.useTimer = 15; if (this.useHeld === 1) this.message('Out of ammo!', '#ff8080'); return; }
      const ammo = p.inventory[ammoI];
      p.startUse(slot.id, st.useTime);
      p.dir = this.mouse.wx < p.cx ? -1 : 1;
      const dx = this.mouse.wx - p.cx, dy = this.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1;
      const spread = rand(-0.05, 0.05);
      const ang = Math.atan2(dy, dx) + spread;
      const bs = 12 * p.pm.projSpeed;
      this.projectiles.push(new Projectile(p.cx, p.y + 14, Math.cos(ang) * bs, Math.sin(ang) * bs, { kind: 'bullet', damage: Math.round((st.damage + ITEMS[ammo.id].damage) * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit }));
      this.consumeSlot(ammo);
      Audio_.play('hit');
      return;
    }
    // tools & weapons: swing (weapons without autoswing only fire on the first press)
    if (it.sword && !this.autoswing && this.useHeld > 1) return;
    const st = itemStats(slot);
    st.useTime = Math.max(2, Math.round(st.useTime * p.pm.useTime));
    if (it.tool && p.pm.mineSpeed) st.useTime = Math.max(2, Math.round(st.useTime / p.pm.mineSpeed));
    p.startUse(slot.id, st.useTime);
    p.dir = this.mouse.wx < p.cx ? -1 : 1;
    this.swingId++;
    this.attackSwing(it, st);
    Audio_.play('swing');
    if (it.tool && this.smartCursor) { const t = this.smartTarget(it); if (t && this.inReach(t.x, t.y)) this.mineAt(t.x, t.y, it); return; }
    if (it.tool && h && h.ok) this.mineAt(h.x, h.y, it);
  }

  attackSwing(it, st) {
    if (!st.damage) return;
    const p = this.player;
    ModLib.emit('swing', this, it, st);
    const reach = it.sword === 'short' ? 36 : it.sword ? 52 : 36;
    const x0 = p.dir > 0 ? p.cx : p.cx - reach, x1 = p.dir > 0 ? p.cx + reach : p.cx;
    const y0 = p.y - 10, y1 = p.y + p.h + 4;
    let hitAny = false;
    const pm = p.pm;
    for (const e of this.enemies) {
      if (e.x < x1 && e.x + e.w > x0 && e.y < y1 && e.y + e.h > y0) {
        let crit = Math.random() * 100 < st.crit + pm.crit;
        const h = this.pets.onHit(e, Math.round(st.damage * pm.dmg), st.knockback * pm.kbMult, crit, true, false);
        if (e.hit(h.damage, p.cx, h.kb, this, this.swingId, h.crit) !== null) this.pets.afterHit(e, e.lastHitDamage || 0);
        hitAny = true;
      }
    }
    if (hitAny) Audio_.play('hit');
  }

  equipAccessory(slot) {
    const p = this.player, it = ITEMS[slot.id];
    const i = p.inventory.indexOf(slot);
    if (it.slot) {
      // Accessories+: boots / shield / wings go into their dedicated slot
      const prev = p.equipment[it.slot]; p.equipment[it.slot] = slot;
      if (i >= 0) p.inventory[i] = prev || null; else if (prev) p.addItem(prev.id, 1, prev.prefix);
      Audio_.play('menu'); return;
    }
    if (p.accessories.some(a => a && a.id === slot.id)) { this.message('You already wear one of those.', '#ff8080'); return; }
    const n = AccessoriesPlus.slotCount(this);
    let k = -1; for (let j = 0; j < n; j++) if (!p.accessories[j]) { k = j; break; } if (k < 0) k = 0;
    const prev = p.accessories[k]; p.accessories[k] = slot;
    if (i >= 0) p.inventory[i] = prev || null; else if (prev) p.addItem(prev.id, 1, prev.prefix);
    Audio_.play('menu');
  }

  equipPet(slot) {
    const p = this.player, it = ITEMS[slot.id];
    const isLight = it.pet === 'light';
    const i = p.inventory.indexOf(slot);
    const prev = isLight ? this.pets.light : this.pets.pet;
    if (isLight) this.pets.equipLight(slot); else this.pets.equipRegular(slot);
    if (i >= 0) p.inventory[i] = prev || null; else if (prev) { const left = p.addItem(prev.id, 1, prev.quality ? { quality: prev.quality } : null); if (left) this.dropItem(p.cx, p.cy, prev.id, 1, null, null); }
    Audio_.play('menu');
  }

  spawnTownPet(role) {
    const w = this.world;
    const x = w.spawnX + randInt(-10, 10);
    let y = 0; while (y < w.h - 1 && !w.isSolidAt(x, y)) y++;
    const t = new TownPet(x * TILE, (y - 2) * TILE, role, choose(TOWN_PET_NAMES[role] || ['Pet']));
    this.npcs.push(t);
    this.message(`${t.title} has arrived!`, '#50ff50');
    if (role === 'Squire Slime') this.pets.unlock('squire');
  }

  petTownPet(npc) {
    this.pets.townBuff = npc.role; this.pets.petted.add(npc.role);
    const b = TOWN_PET_BUFFS[npc.role];
    this.dialog.text = `You pet ${npc.name}. ${b.label}: ${b.desc}.`;
    npc.emote = '\u2665'; npc.emoteLife = 120; Audio_.play('heal');
    if (['Town Cat', 'Town Dog', 'Town Bunny'].every(r => this.pets.petted.has(r))) this.pets.unlock('best_friends');
  }

  combineLightPets() {
    const p = this.player, d = this.dialog;
    const a = this.pets.light;
    if (!a) { d.text = 'Equip the Light Pet you want to improve first, and carry another of the same kind.'; return; }
    const i = p.inventory.findIndex(s => s && s.id === a.id);
    if (i < 0) { d.text = `Bring me another ${ITEMS[a.id].name} and I'll combine them.`; return; }
    const b = rollLightPet(p.inventory[i]);
    rollLightPet(a);
    if (a.quality.every((q, k) => q >= b.quality[k])) { d.text = 'Your equipped one is already as good or better in every way. Nothing to gain.'; return; }
    const cost = Math.floor(ITEMS[a.id].value / 2 * (0.5 + lightPetQualityPct(b)));
    if (p.coins < cost) { d.text = `Combining these costs ${coinsToString(cost)}. Come back with more coins.`; return; }
    p.coins -= cost;
    a.quality = a.quality.map((q, k) => Math.max(q, b.quality[k]));
    p.inventory[i] = null;
    d.text = `Done! Your ${ITEMS[a.id].name} now carries the best qualities of both (${Math.round(lightPetQualityPct(a) * 100)}%).`;
    this.pets.unlock('combined'); if (lightPetQualityPct(a) >= 0.999) this.pets.unlock('perfect_roll');
    Audio_.play('levelup');
  }

  equipArmor(slot) {
    const p = this.player;
    const it = ITEMS[slot.id];
    const idx = it.armor === 'head' ? 0 : it.armor === 'body' ? 1 : 2;
    const i = p.inventory.indexOf(slot);
    const prev = p.armor[idx];
    p.armor[idx] = slot;
    if (i >= 0) p.inventory[i] = prev || null; else if (prev) p.addItem(prev.id, 1, prev.prefix);
    Audio_.play('menu');
    this.updateCraftable();
  }

  mineAt(tx, ty, it) {
    const w = this.world, p = this.player;
    const id = w.get(tx, ty);
    const def = TILES[id];
    const i = w.idx(tx, ty);
    if (id === T.AIR) {
      // walls
      if (it.tool === 'hammer' || (it.tools && it.tools.hammer)) {
        const wl = w.getWall(tx, ty);
        if (!wl) return;
        // must be at an edge
        if (w.getWall(tx - 1, ty) && w.getWall(tx + 1, ty) && w.getWall(tx, ty - 1) && w.getWall(tx, ty + 1)) return;
        const dmg = w.tileDamage.get(-i - 1) || { dmg: 0, t: 0, frac: 0 };
        dmg.dmg += it.tool === 'hammer' ? it.power : it.tools.hammer; dmg.t = w.time; dmg.frac = dmg.dmg / 70;
        Audio_.play('dig');
        if (dmg.dmg >= 70) {
          w.tileDamage.delete(-i - 1);
          const wd = WALLS[wl];
          w.setWall(tx, ty, 0);
          if (wd.drop) this.dropItem(tx * TILE + 8, ty * TILE + 8, wd.drop, 1);
          Audio_.play('break');
          this.tileParticles(tx, ty, wd.color, 4);
        } else w.tileDamage.set(-i - 1, dmg);
      }
      return;
    }
    if (def.hp === Infinity) return;
    // tool match
    let ok = false;
    const toolPower = def.tool === it.tool ? it.power : (it.tools && it.tools[def.tool]) || 0;
    if (def.tool === 'any') ok = true;
    else if (toolPower > 0) ok = toolPower >= def.minPower;
    if (!ok) return;
    const dmg = w.tileDamage.get(i) || { dmg: 0, t: 0, frac: 0 };
    dmg.dmg += def.tool === 'any' ? 1000 : toolPower * this.pets.miningSpeedMult(id); dmg.t = w.time; dmg.frac = Math.min(1, dmg.dmg / def.hp);
    Audio_.play(def.tool === 'axe' ? 'chop' : (id === T.STONE || def.tool === 'pick' && def.hp >= 100 ? 'dig_stone' : 'dig'));
    this.tileParticles(tx, ty, def.mapColor || def.color, 3);
    if (dmg.dmg >= def.hp) {
      w.tileDamage.delete(i);
      this.breakTile(tx, ty);
    } else w.tileDamage.set(i, dmg);
  }

  breakTile(tx, ty) {
    const w = this.world;
    const id = w.get(tx, ty);
    const def = TILES[id];
    if (id === T.AIR) return;
    Audio_.play('break');
    this.tileParticles(tx, ty, def.mapColor || def.color, 8);
    if (id === T.TREE || id === T.TREETOP) {
      const r = w.fellTree(tx, ty);
      for (let k = 0; k < r.wood; k++) this.dropItem(tx * TILE + 8, (ty - k * 0.5) * TILE, 'wood', 1);
      for (let k = 0; k < r.wood; k++) for (const ex of this.pets.onMine(tx, ty, T.TREE, 'wood')) this.dropItem(tx * TILE + 8, ty * TILE, ex.id, ex.count);
      for (let k = 0; k < r.acorns; k++) this.dropItem(tx * TILE + 8, ty * TILE, 'acorn', 1);
      this.player.stats.blocksMined++;
      return;
    }
    if (id === T.CACTUS) {
      let yy = ty, n = 0;
      while (w.get(tx, yy) === T.CACTUS) { w.setTile(tx, yy, T.AIR); n++; yy--; }
      this.dropItem(tx * TILE + 8, ty * TILE + 8, 'cactus', n);
      return;
    }
    if (BiomeSys.onBreak(this, tx, ty, id)) return;
    if (def.furniture) {
      const a = w.removeFurniture(tx, ty);
      if (!a) { this.message('That chest is not empty!', '#ff8080'); return; }
      if (this.openChest && this.openChest.x === a.x && this.openChest.y === a.y) this.closeChest();
      this.dropItem(a.x * TILE + a.w * 8, a.y * TILE + a.h * 8, def.drop, 1);
      return;
    }
    const gemVariant = id === T.GEM ? w.getData(tx, ty) % 6 : -1;
    const dropId = id === T.GEM ? GEMS[gemVariant].id : def.drop;
    w.setTile(tx, ty, T.AIR);
    if (dropId) this.dropItem(tx * TILE + 8, ty * TILE + 8, dropId, 1);
    for (const ex of this.pets.onMine(tx, ty, id, dropId)) this.dropItem(tx * TILE + 8, ty * TILE + 8, ex.id, ex.count);
    if (id === T.PLANT && w.getData(tx, ty) === 6) this.dropItem(tx * TILE + 8, ty * TILE + 8, 'mushroom', 1);
    Fishing.onTileBroken(this, tx, ty, id);
    this.player.stats.blocksMined++;
    ModLib.emit('tileBroken', this, tx, ty, id, dropId);
    this.onTileRemoved(tx, ty);
  }

  // things that depend on the tile below/adjacent
  onTileRemoved(tx, ty) {
    const w = this.world;
    const above = w.get(tx, ty - 1);
    const adef = TILES[above];
    if (adef.gravity) this.startSandFall(tx, ty - 1);
    else if (adef.attachTo === 'below' || above === T.TORCH && !w.getWall(tx, ty - 1) && !w.isSolidAt(tx - 1, ty - 1) && !w.isSolidAt(tx + 1, ty - 1)) this.breakTile(tx, ty - 1);
    else if (above === T.TREE) { const r = w.fellTree(tx, ty - 1); for (let k = 0; k < r.wood; k++) this.dropItem(tx * TILE + 8, (ty - 1 - k * 0.5) * TILE, 'wood', 1); }
    else if (above === T.CACTUS) this.breakTile(tx, ty - 1);
    else if (adef.furniture && above !== T.LANTERN) {
      // furniture standing on this tile falls apart
      const a = w.furnitureAnchor(tx, ty - 1);
      if (a && a.y + a.h === ty) this.breakTile(tx, ty - 1);
    }
    const below = w.get(tx, ty + 1);
    if (below === T.LANTERN) this.breakTile(tx, ty + 1);
  }

  startSandFall(tx, ty) {
    const w = this.world;
    const id = w.get(tx, ty);
    w.setTile(tx, ty, T.AIR);
    w.fallingSand.push({ x: tx * TILE, y: ty * TILE, vy: 0, id });
    // chain upward
    const above = w.get(tx, ty - 1);
    if (TILES[above].gravity) this.startSandFall(tx, ty - 1);
    else if (TILES[above].attachTo === 'below') this.breakTile(tx, ty - 1);
  }

  updateFallingSand() {
    const w = this.world, p = this.player;
    for (const f of w.fallingSand) {
      f.vy = Math.min(8, f.vy + 0.4);
      f.y += f.vy;
      const tx = Math.floor((f.x + 8) / TILE);
      const belowY = Math.floor((f.y + TILE) / TILE);
      const landed = w.isSolidAt(tx, belowY) || belowY >= w.h - 1;
      if (landed) {
        const ty = belowY - 1;
        f.dead = true;
        const occupant = w.get(tx, ty);
        const overlapsEntity = (p.x < (tx + 1) * TILE && p.x + p.w > tx * TILE && p.y < (ty + 1) * TILE && p.y + p.h > ty * TILE);
        if (occupant !== T.AIR && !TILES[occupant].solid) this.breakTile(tx, ty);
        if (overlapsEntity || w.get(tx, ty) !== T.AIR) { this.dropItem(tx * TILE + 8, ty * TILE + 8, TILES[f.id].drop, 1); }
        else { w.setTile(tx, ty, f.id); }
      } else {
        // crush entities? push them aside is complicated; damage enemies
        for (const e of this.enemies) if (e.x < f.x + 16 && e.x + e.w > f.x && e.y < f.y + 16 && e.y + e.h > f.y) e.hit(10, f.x, 2, this);
      }
    }
    w.fallingSand = w.fallingSand.filter(f => !f.dead);
  }

  placeItem(slot, it, tx, ty) {
    const w = this.world, p = this.player;
    if (it.wall != null) {
      if (w.getWall(tx, ty) !== 0) return false;
      const id = w.get(tx, ty);
      if (id === T.BEDROCK) return false;
      // adjacency: neighboring wall or tile
      const adj = w.getWall(tx - 1, ty) || w.getWall(tx + 1, ty) || w.getWall(tx, ty - 1) || w.getWall(tx, ty + 1) || w.get(tx - 1, ty) || w.get(tx + 1, ty) || w.get(tx, ty - 1) || w.get(tx, ty + 1) || id !== T.AIR;
      if (!adj) return false;
      w.setWall(tx, ty, it.wall);
      this.consumeSlot(slot);
      Audio_.play('place');
      return true;
    }
    const tid = it.tile;
    const def = TILES[tid];
    const cur = w.get(tx, ty);
    if (def.furniture) {
      // anchor so the cursor is at the bottom-left cell
      const ax = tx, ay = ty - def.furniture.h + 1;
      if (!w.canPlaceFurniture(ax, ay, tid)) return false;
      if (def.solid && this.entityOverlaps(ax, ay, def.furniture.w, def.furniture.h)) return false;
      w.placeFurniture(ax, ay, tid);
      this.consumeSlot(slot);
      Audio_.play('place');
      return true;
    }
    if (cur !== T.AIR) {
      // replace plants/cobwebs when placing blocks
      if ((cur === T.PLANT || cur === T.COBWEB) && def.solid) { w.setTile(tx, ty, T.AIR); }
      else return false;
    }
    if (tid === T.SAPLING) {
      const below = w.get(tx, ty + 1);
      if (below !== T.GRASS && below !== T.DIRT && below !== T.SNOW) return false;
    } else if (tid === T.TORCH) {
      const adj = w.isSolidAt(tx - 1, ty) || w.isSolidAt(tx + 1, ty) || w.isSolidAt(tx, ty + 1) || w.getWall(tx, ty) || w.isPlatformAt(tx, ty + 1);
      if (!adj) return false;
      if (w.liquidAt(tx, ty) > 30) return false;
    } else if (tid === T.PLANT || tid === T.MUSHROOM_GLOW) {
      if (!w.isSolidAt(tx, ty + 1)) return false;
    } else {
      const adj = w.get(tx - 1, ty) !== T.AIR || w.get(tx + 1, ty) !== T.AIR || w.get(tx, ty - 1) !== T.AIR || w.get(tx, ty + 1) !== T.AIR || w.getWall(tx, ty);
      if (!adj) return false;
      if (def.solid && this.entityOverlaps(tx, ty, 1, 1)) return false;
    }
    w.setTile(tx, ty, tid, tid === T.PLANT ? randInt(0, 5) : 0);
    if (def.gravity && !w.isSolidAt(tx, ty + 1)) this.startSandFall(tx, ty);
    this.consumeSlot(slot);
    Audio_.play('place');
    return true;
  }

  entityOverlaps(tx, ty, tw, th) {
    const x0 = tx * TILE, y0 = ty * TILE, x1 = x0 + tw * TILE, y1 = y0 + th * TILE;
    const ents = [this.player, ...this.npcs, ...this.companions, ...this.enemies];
    for (const e of ents) if (e.x < x1 && e.x + e.w > x0 && e.y < y1 && e.y + e.h > y0) return true;
    return false;
  }

  consumeSlot(slot) {
    if (Fargo.infinite(slot)) return;
    slot.count--;
    if (slot.count <= 0) {
      const p = this.player;
      const i = p.inventory.indexOf(slot);
      if (i >= 0) p.inventory[i] = null;
      if (p.cursorItem === slot) p.cursorItem = null;
    }
  }

  consume(slot, it) {
    const p = this.player;
    if (it.heal) {
      if (p.hp >= p.maxHp && !it.wellFed) return;
      if (!it.food && p.hasBuff('Potion Sickness')) { this.message('You cannot heal again yet (Potion Sickness).', '#ff8080'); return; }
      p.hp = Math.min(p.maxHp, p.hp + it.heal);
      if (!it.food) p.addBuff('Potion Sickness', 60 * 60);
      if (it.wellFed) p.addBuff('Well Fed', 60 * 60 * 5);
      this.addDamageText(p.cx, p.y, '+' + it.heal, '#40e060');
      Audio_.play('heal');
      this.consumeSlot(slot);
    } else if (slot.id === 'mana_crystal') {
      if (p.baseMana >= 200) { this.message('Your mana is already at its maximum.', '#ff8080'); return; }
      p.baseMana += 20; p.maxMana += 20; p.mana += 20;
      this.message('Your maximum mana has increased!', '#8080ff'); Audio_.play('levelup');
      for (let i = 0; i < 20; i++) this.particles.push(new Particle(p.cx, p.cy, rand(-3, 3), rand(-4, 0), '#60a0ff', 50, 2, false));
      this.consumeSlot(slot);
    } else if (it.mana) {
      if (p.mana >= p.maxMana) return;
      p.mana = Math.min(p.maxMana, p.mana + it.mana);
      p.addBuff('Mana Sickness', 60 * 5 + (p.buffs['Mana Sickness'] || 0));
      this.addDamageText(p.cx, p.y, '+' + it.mana, '#60a0ff'); Audio_.play('heal');
      this.consumeSlot(slot);
    } else if (slot.id === 'life_crystal') {
      if (p.maxHp >= 400) { this.message('Your life is already at its maximum.', '#ff8080'); return; }
      p.maxHp += 20; p.hp += 20;
      this.message('Your maximum life has increased!', '#ff60a0');
      Audio_.play('levelup');
      for (let i = 0; i < 20; i++) this.particles.push(new Particle(p.cx, p.cy, rand(-3, 3), rand(-4, 0), '#ff60a0', 50, 2, false));
      this.consumeSlot(slot);
    } else if (slot.id.endsWith('_bag') && COMPANION_DEFS[slot.id.slice(0, -4)]) {
      const id = slot.id.slice(0, -4);
      if (this.companions.some(c => c.id === id)) { this.message(`${COMPANION_DEFS[id].name} is already in your squad.`, '#ff8080'); return; }
      if (this.companions.length >= SQUAD_CAP) { this.message(`Your squad is full (${SQUAD_CAP}).`, '#ff8080'); return; }
      const c = new Companion(id, p.x + p.dir * -30, p.y); this.companions.push(c);
      this.message(`${c.name} has joined your squad!`, '#50ff50'); c.say(choose(COMPANION_DEFS[id].lines.greet)); Audio_.play('levelup');
      this.consumeSlot(slot);
    } else if (slot.id === 'cat_license' || slot.id === 'dog_license' || slot.id === 'bunny_license') {
      const role = { cat_license: 'Town Cat', dog_license: 'Town Dog', bunny_license: 'Town Bunny' }[slot.id];
      if (this.npcs.some(n => n.role === role) || this.pendingTownPets.includes(role)) { this.message(`You already have a ${role}.`, '#ff8080'); return; }
      this.pendingTownPets.push(role); this.message(`A ${role} will move in at dawn.`, '#50ff50'); this.consumeSlot(slot);
    } else if (slot.id === 'slime_crown') {
      if (this.boss) { this.message('A boss is already here!', '#ff8080'); return; }
      this.summonKingSlime();
      this.consumeSlot(slot);
    } else if (it.buffName) {
      p.addBuff(it.buffName, it.buffTime); this.addDamageText(p.cx, p.y, it.buffName, '#80ff80'); Audio_.play('heal'); this.consumeSlot(slot);
    } else if (slot.id === 'desert_medallion' || slot.id === 'storm_flare') {
      if (this.world.biome[clamp(p.tileX, 0, this.world.w - 1)] !== BIOME.DESERT || p.tileY > this.world.surfaceLine) { this.message('This only works in the desert...', '#ff8080'); return; }
      if (this.boss) { this.message('A boss is already here!', '#ff8080'); return; }
      if (slot.id === 'desert_medallion') Calamity.summonDesertScourge(this); else Thorium.summonThunderBird(this);
      this.consumeSlot(slot);
    } else if (slot.id === 'spatial_tear') {
      if (this.boss) { this.message('A boss is already here!', '#ff8080'); return; }
      StarsAbove.summonVagrant(this);
      this.consumeSlot(slot);
    } else if (slot.id === 'suspicious_egg') {
      if (this.boss) { this.message('A boss is already here!', '#ff8080'); return; }
      Consolaria.summonLepus(this);
      this.consumeSlot(slot);
    } else if (slot.id === 'sealed_ribbon') {
      if (this.world.isDay()) { this.message('The youkai of dusk only comes out at night...', '#ff8080'); return; }
      if (this.boss) { this.message('A boss is already here!', '#ff8080'); return; }
      Gensokyo.summonRumia(this);
      this.consumeSlot(slot);
    } else if (slot.id === 'suspicious_eye') {
      if (this.world.isDay()) { this.message('The eye only stirs at night...', '#ff8080'); return; }
      if (this.boss) return;
      this.summonBoss();
      this.consumeSlot(slot);
    } else if (it.explosive) {
      const dx = this.mouse.wx - p.cx, dy = this.mouse.wy - p.cy;
      const d = Math.hypot(dx, dy) || 1;
      this.projectiles.push(new Bomb(p.cx, p.cy, dx / d * 7, dy / d * 7 - 2, it.explosive));
      this.consumeSlot(slot);
      Audio_.play('swing');
    }
  }

  fireHook() {
    const p = this.player;
    if (p.hook) { p.hook = null; return; }
    const hd = Equipment.hookDef(p) || ITEMS.hook;
    const dx = this.mouse.wx - p.cx, dy = this.mouse.wy - p.cy;
    const d = Math.hypot(dx, dy) || 1;
    p.hook = { x: p.cx, y: p.cy, vx: dx / d * (hd.hookSpeed || 14), vy: dy / d * (hd.hookSpeed || 14), state: 'fly', dist: 0, range: hd.hookRange || 22, teleport: !!hd.teleport };
    Audio_.play('swing');
  }

  explode(x, y, radius, damage, tiles = true) {
    const w = this.world, p = this.player;
    Audio_.play('kill'); Audio_.play('break');
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    const r = Math.ceil(radius);
    if (tiles) for (let yy = ty - r; yy <= ty + r; yy++) for (let xx = tx - r; xx <= tx + r; xx++) {
      if (dist(xx + 0.5, yy + 0.5, x / TILE, y / TILE) > radius) continue;
      const id = w.get(xx, yy);
      if (id === T.AIR || id === T.BEDROCK) continue;
      const def = TILES[id];
      if (def.hp === Infinity || def.minPower > 0) continue;
      if (def.furniture) { const a = w.removeFurniture(xx, yy); if (a) this.dropItem(a.x * TILE + 8, a.y * TILE + 8, def.drop, 1); continue; }
      if (id === T.TREE || id === T.TREETOP) { const rr = w.fellTree(xx, yy); for (let k = 0; k < rr.wood; k++) this.dropItem(xx * TILE + 8, yy * TILE, 'wood', 1); continue; }
      w.setTile(xx, yy, T.AIR);
      if (def.drop && Math.random() < 0.6) this.dropItem(xx * TILE + 8, yy * TILE + 8, def.drop, 1);
    }
    if (tiles) for (let yy = ty - r; yy <= ty + r; yy++) for (let xx = tx - r; xx <= tx + r; xx++) this.onTileRemoved(xx, yy);
    for (let i = 0; i < 40; i++) this.particles.push(new Particle(x, y, rand(-6, 6), rand(-7, 2), choose(['#ff8020', '#ffe060', '#404040', '#a05020']), 50, 3));
    for (const e of this.enemies) if (dist(e.cx, e.cy, x, y) < (radius + 1) * TILE) e.hit(damage, x, 8, this);
    if (dist(p.cx, p.cy, x, y) < (radius + 1) * TILE) p.damage(damage, x, this, 'explosion');
    for (const n of this.npcs) if (dist(n.cx, n.cy, x, y) < (radius + 1) * TILE) n.hit(damage, x, this);
  }

  // ---------------------------------------------------------------------------
  // Right click: interact
  onRightDown() {
    if (this.state === 'title') { const b = UI.hit(this.mouse.x, this.mouse.y); if (b && b.id.startsWith('race_')) this.raceEditorClick(b, 2); else if (b && b.id === 'mod_ui') ModLib.uiClick(this, b, 2); return; }
    if (this.state !== 'play') return;
    if (this.settingsOpen || UI.fullMap) { const mb = UI.hit(this.mouse.x, this.mouse.y); if (mb && mb.id === 'mod_ui') this.uiClick(mb, 2); return; }
    const b = UI.hit(this.mouse.x, this.mouse.y);
    if (b) { this.uiClick(b, 2); return; }
    if (this.invOpen && this.player.cursorItem && !this.overUI()) {
      // right click in the world with an item on the cursor: drop it
      const p = this.player;
      this.dropItem(p.cx + p.dir * 20, p.cy, p.cursorItem.id, p.cursorItem.count, p.dir * 4, p.cursorItem.prefix);
      p.cursorItem = null; Audio_.play('menu');
      return;
    }
    if (this.housingSelect) { this.housingSelect = null; return; }
    if (this.dialog) return;
    const p = this.player, w = this.world;
    this.updateMouseWorld();
    { const sel = p.selectedItem; if (sel && sel.id === 'structure_wand') { Structures.wandRight(this); return; } }
    { const tx = Math.floor(this.mouse.wx / TILE), ty = Math.floor(this.mouse.wy / TILE); if (w.get(tx, ty) === T.LIHZAHRD_ALTAR && this.inReach(tx, ty)) { const cell = p.inventory.find(s => s && s.id === 'lihzahrd_power_cell'); if (!cell) { this.message('The altar hums. It wants a Lihzahrd Power Cell.', '#ffa020'); return; } if (this.boss) return; this.consumeSlot(cell); Bosses.summon(this, 'golem', { x: tx * TILE, y: ty * TILE - 120 }); return; } }
    if (Fargo.onRightClick(this)) return;
    if (ModLib.rightClick(this)) return;
    // companion?
    for (const c of this.companions) {
      if (this.mouse.wx >= c.x - 8 && this.mouse.wx <= c.x + c.w + 8 && this.mouse.wy >= c.y - 8 && this.mouse.wy <= c.y + c.h + 8 && dist(p.cx, p.cy, c.cx, c.cy) < 6 * TILE) {
        if (c.ko > 0) { c.revive(this, 0.3); return; }
        this.openDialog(c); return;
      }
    }
    // NPC?
    for (const n of this.npcs) {
      if (this.mouse.wx >= n.x - 8 && this.mouse.wx <= n.x + n.w + 8 && this.mouse.wy >= n.y - 8 && this.mouse.wy <= n.y + n.h + 8 && dist(p.cx, p.cy, n.cx, n.cy) < 6 * TILE) {
        if (n instanceof BoundGoblin) { this.rescueGoblin(n); return; }
        this.openDialog(n); return;
      }
    }
    const h = this.hoverTile;
    if (!h || !h.ok) { ModLib.rightClickLate(this); return; }
    const id = w.get(h.x, h.y);
    if (id === T.CHEST) { const a = w.furnitureAnchor(h.x, h.y); this.openChestAt(a.x, a.y); return; }
    if (id === T.DOOR_C || id === T.DOOR_O) { if (w.toggleDoor(h.x, h.y, p)) Audio_.play('door'); return; }
    if (id === T.CHAIR) { const a = w.furnitureAnchor(h.x, h.y); if (p.sitting) p.sitting = null; else if (!this.entityOverlaps(a.x, a.y, 1, 2) || true) p.sitOn(a.x, a.y + 1); return; }
    ModLib.rightClickLate(this);
  }

  onLeftDown() {
    Audio_.init();
    if (this.state === 'play' && UI.fullMap) { const mb = UI.hit(this.mouse.x, this.mouse.y); if (mb && mb.id === 'mod_ui') { this.uiClick(mb, 0); return; } UI.mapDrag = { x: this.mouse.x, y: this.mouse.y, px: UI.mapPan.x, py: UI.mapPan.y }; return; }
    if (this.state === 'title') {
      const b = UI.hit(this.mouse.x, this.mouse.y);
      if (b && b.id === 'menu') { Audio_.play('menu'); b.data.action(); }
      else if (b && b.id.startsWith('race_')) this.raceEditorClick(b, 0);
      else if (b && b.id === 'mod_ui') ModLib.uiClick(this, b, 0);
      return;
    }
    if (this.state !== 'play') return;
    const b = UI.hit(this.mouse.x, this.mouse.y);
    if (b) { this.uiClick(b, 0); return; }
    if (this.housingSelect && !this.overUI()) { this.updateMouseWorld(); this.housingClick(); this.useHeld = 99; return; }
    this.useHeld = 0;
  }

  onWheel(dy) {
    if ((this.state === 'title' && UI.modsOpen) || (this.state === 'play' && this.settingsOpen && UI.settingsPage === 'modlist')) { ModList.wheel(dy); return; }
    if (this.state !== 'play') return;
    if (UI.fullMap) { UI.mapZoom = clamp(UI.mapZoom + (dy < 0 ? 1 : -1), 1, 8); return; }
    if (this.invOpen && this.mouse.x < 560 && this.mouse.y > UI.slotRect(49).y + 40) {
      UI.craftScroll = Math.max(0, UI.craftScroll + (dy > 0 ? 1 : -1));
      return;
    }
    const p = this.player;
    p.selected = (p.selected + (dy > 0 ? 1 : 9)) % 10;
    Audio_.play('menu');
  }

  onKeyDown(e) {
    if (e.repeat) return;
    if (TextInput.active) { if (TextInput.handleKey(e)) { e.preventDefault(); return; } }
    this.keys.add(e.code);
    if (this.state === 'title') {
      if (e.code === 'Escape' && UI.modsOpen) { if (ModList.cfgMod) ModList.cfgMod = null; else { UI.modsOpen = false; this.showTitle(); } return; }
      if (e.code === 'Enter') { const it = this.menu.items[0]; if (it) it.action(); }
      return;
    }
    if (this.state !== 'play') return;
    const p = this.player;
    switch (e.code) {
      case 'Escape':
        if (BossLog.open) BossLog.open = false;
        else if (UI.petPanel) UI.petPanel = false;
        else if (UI.achievementsOpen) UI.achievementsOpen = false;
        else if (this.settingsOpen) this.settingsOpen = false;
        else if (UI.arrayOpen) UI.arrayOpen = false;
        else if (UI.albumOpen) UI.albumOpen = false;
        else if (UI.structOpen) UI.structOpen = false;
        else if (UI.raceEditorOpen) UI.raceEditorOpen = false;
        else if (Fables.dialog) Fables.close(this);
        else if (UI.fullMap) UI.fullMap = false;
        else if (this.dialog) this.closeDialog();
        else this.toggleInventory();
        e.preventDefault();
        break;
      case 'KeyE': if (!this.dialog && !this.settingsOpen) { this.updateMouseWorld(); this.fireHookKey(); } break;
      case 'Tab': UI.fullMap = !UI.fullMap; UI.mapPan = { x: 0, y: 0 }; UI.mapDrag = null; e.preventDefault(); break;
      case 'KeyM': UI.mapMode = (UI.mapMode + 1) % 3; break;
      case 'KeyT': case 'KeyQ': this.dropSelected(e.shiftKey); break;
      case 'Delete': this.trashHovered(); break;
      case 'KeyH': this.quickHeal(); break;
      case 'KeyF': if (!this.dialog && !this.settingsOpen) this.pets.useAbility(); break;
      case 'KeyL': BossLog.open = !BossLog.open; BossLog.page = null; Audio_.play('menu'); break;
      case 'ControlLeft': case 'ControlRight': this.smartCursor = !this.smartCursor; this.message(`Smart cursor ${this.smartCursor ? 'on' : 'off'}`, '#c0c0ff'); break;
      case 'F11': UI.hidden = !UI.hidden; e.preventDefault(); break;
      case 'Equal': case 'NumpadAdd': if (UI.fullMap) UI.mapZoom = Math.min(8, UI.mapZoom + 1); else UI.minimapZoom = Math.min(4, UI.minimapZoom + 1); break;
      case 'Minus': case 'NumpadSubtract': if (UI.fullMap) UI.mapZoom = Math.max(1, UI.mapZoom - 1); else UI.minimapZoom = Math.max(1, UI.minimapZoom - 1); break;
      case 'F5': this.saveGame(); e.preventDefault(); break;
      default:
        if (!this.dialog && !this.settingsOpen && ModKeys.handle(this, e)) break;
        if (e.code.startsWith('Digit')) { const n = parseInt(e.code.slice(5)); p.selected = n === 0 ? 9 : n - 1; }
    }
  }

  quickHeal() {
    const p = this.player;
    if (p.dead || p.hp >= p.maxHp) return;
    if (p.hasBuff('Potion Sickness')) { this.message('Potion Sickness: you cannot heal yet.', '#ff8080'); return; }
    // best healing consumable in the inventory
    let best = -1, bestHeal = 0;
    for (let i = 0; i < 50; i++) { const s = p.inventory[i]; if (s && ITEMS[s.id].heal > bestHeal) { best = i; bestHeal = ITEMS[s.id].heal; } }
    if (best < 0) return;
    this.consume(p.inventory[best], ITEMS[p.inventory[best].id]);
  }

  // Trash To Treasure: trashing an item pays its sell value; taking it back costs the same amount
  trashItem(stack) {
    const p = this.player;
    if (this.trash) this.trashPaid = 0; // the previous trash is destroyed; no refund possible
    const value = Math.floor(stackValue(stack) / 5 * stack.count * this.trashRate);
    this.trash = stack; this.trashPaid = value;
    if (value > 0) { p.coins += value; this.addDamageText(p.cx, p.y, '+' + coinsToString(value), '#ffe75a'); Audio_.play('craft'); }
    else Audio_.play('menu');
  }
  untrash() {
    const p = this.player;
    if (!this.trash) return null;
    if (this.trashPaid > 0) {
      if (p.coins < this.trashPaid) { this.message(`Taking that back costs ${coinsToString(this.trashPaid)}.`, '#ff8080'); return null; }
      p.coins -= this.trashPaid; this.addDamageText(p.cx, p.y, '-' + coinsToString(this.trashPaid), '#ff8080');
    }
    const t = this.trash; this.trash = null; this.trashPaid = 0; return t;
  }

  trashHovered() {
    const p = this.player;
    if (!this.invOpen) return;
    if (p.cursorItem) { const c = p.cursorItem; p.cursorItem = null; this.trashItem(c); return; }
    if (typeof UI.hoverSlot === 'number' && p.inventory[UI.hoverSlot]) { const it = p.inventory[UI.hoverSlot]; p.inventory[UI.hoverSlot] = null; this.trashItem(it); this.updateCraftable(); }
  }

  // Smart cursor: pick the first usable tile along the line from the player toward the mouse
  smartTarget(it) {
    const p = this.player, w = this.world;
    const dx = this.mouse.wx - p.cx, dy = this.mouse.wy - p.cy;
    const d = Math.hypot(dx, dy) || 1;
    const maxD = Math.min(d, 6.5 * TILE);
    let last = null;
    for (let k = 0; k <= maxD; k += 4) {
      const tx = Math.floor((p.cx + dx / d * k) / TILE), ty = Math.floor((p.cy + dy / d * k) / TILE);
      if (last && last.x === tx && last.y === ty) continue;
      last = { x: tx, y: ty };
      const id = w.get(tx, ty);
      const def = TILES[id];
      const hasPick = it.tool === 'pick' || (it.tools && it.tools.pick), hasAxe = it.tool === 'axe' || (it.tools && it.tools.axe);
      if (it.tool === 'hammer' && !hasPick && !hasAxe) { if (id === T.AIR && w.getWall(tx, ty)) return last; if (def.solid) return null; }
      else if (hasAxe && !hasPick) { if (def.tool === 'axe') return last; if (def.solid) return null; }
      else if (hasPick && hasAxe && def.tool === 'axe') return last;
      else if (def.solid || (id !== T.AIR && (def.tool === 'pick' || def.tool === 'any'))) return last;
    }
    return null;
  }

  fireHookKey() {
    // grapple with E if a hook is anywhere in the inventory
    const p = this.player;
    if (p.hook) { p.hook = null; return; }
    if (Equipment.hookDef(p)) this.fireHook();
  }

  dropSelected(all) {
    const p = this.player;
    const s = p.selectedItem;
    if (!s) return;
    const n = all ? s.count : 1;
    this.dropItem(p.cx + p.dir * 20, p.cy, s.id, n, p.dir * 4);
    s.count -= n;
    if (s.count <= 0) p.inventory[p.selected] = null;
  }

  toggleInventory() {
    this.invOpen = !this.invOpen;
    Audio_.play(this.invOpen ? 'open' : 'close');
    if (!this.invOpen) {
      if (this.openChest) this.closeChest();
      if (this.shop) this.closeShop();
      if (Reforge.open) Reforge.close(this);
      const p = this.player;
      if (p.cursorItem) { const left = p.addItem(p.cursorItem.id, p.cursorItem.count); if (left > 0) this.dropItem(p.cx, p.cy, p.cursorItem.id, left); p.cursorItem = null; }
    } else this.updateCraftable();
  }

  // ---------------------------------------------------------------------------
  // UI clicks
  uiClick(b, button) {
    const p = this.player;
    const shift = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    switch (b.id) {
      case 'slot': {
        if (!this.invOpen) { if (button === 0) p.selected = b.data; return; }
        if (shift && this.shop && p.inventory[b.data]) { this.sellItem(b.data); return; }
        if (shift && this.openChest && p.inventory[b.data]) { this.moveToChest(b.data); return; }
        if (shift && p.inventory[b.data] && ITEMS[p.inventory[b.data].id].armor) { this.equipArmor(p.inventory[b.data]); return; }
        if (shift && p.inventory[b.data] && ITEMS[p.inventory[b.data].id].pet) { this.equipPet(p.inventory[b.data]); return; }
        if (shift && p.inventory[b.data] && ITEMS[p.inventory[b.data].id].accessory) { this.equipAccessory(p.inventory[b.data]); return; }
        if (shift && !this.openChest && p.inventory[b.data] && !ITEMS[p.inventory[b.data].id].armor && !ITEMS[p.inventory[b.data].id].pet && !ITEMS[p.inventory[b.data].id].accessory) { const it = p.inventory[b.data]; p.inventory[b.data] = null; this.trashItem(it); this.updateCraftable(); return; }
        if (button === 2 && !p.cursorItem && p.inventory[b.data]) { const eq = ITEMS[p.inventory[b.data].id]; if (eq.armor && !eq.vanity) { this.equipArmor(p.inventory[b.data]); return; } if (eq.pet) { this.equipPet(p.inventory[b.data]); return; } if (eq.accessory) { this.equipAccessory(p.inventory[b.data]); return; } }
        this.slotClick(p.inventory, b.data, button);
        this.updateCraftable();
        break;
      }
      case 'chestslot': {
        const inv = this.openChest.inv;
        if (shift && inv[b.data]) { const left = p.addItem(inv[b.data].id, inv[b.data].count); inv[b.data] = left > 0 ? { id: inv[b.data].id, count: left } : null; Audio_.play('menu'); this.updateCraftable(); return; }
        this.slotClick(inv, b.data, button);
        break;
      }
      case 'shopslot': { if (button === 0 && this.shop) this.buyItem(this.shop[b.data]); break; }
      case 'housing': UI.housingOpen = !UI.housingOpen; this.housingSelect = null; Audio_.play('menu'); break;
      case 'housing_npc': this.housingSelect = b.data; Audio_.play('menu'); break;
      case 'closeshop': this.closeShop(); break;
      case 'armor': {
        const idx = b.data, cur = p.armor[idx], c = p.cursorItem;
        const slotName = ['head', 'body', 'legs'][idx];
        if (c) { if (ITEMS[c.id].armor === slotName && c.count === 1) { p.armor[idx] = c; p.cursorItem = cur; Audio_.play('menu'); } }
        else if (cur) { p.cursorItem = cur; p.armor[idx] = null; Audio_.play('menu'); }
        break;
      }
      case 'eqslot': {
        const key = b.data, cur = p.equipment[key], c = p.cursorItem;
        if (c) { if (ITEMS[c.id].slot === key) { p.equipment[key] = c; p.cursorItem = cur; Audio_.play('menu'); } else this.message(`That is not ${key}.`, '#ff8080'); }
        else if (cur) { p.cursorItem = cur; p.equipment[key] = null; Audio_.play('menu'); }
        break;
      }
      case 'accslot': {
        const idx = b.data, cur = p.accessories[idx], c = p.cursorItem;
        if (c) { if (ITEMS[c.id].accessory && !ITEMS[c.id].slot && !p.accessories.some((a, k) => a && k !== idx && a.id === c.id)) { p.accessories[idx] = c; p.cursorItem = cur; Audio_.play('menu'); } else if (ITEMS[c.id].slot) this.message(`${ITEMS[c.id].name} goes in the ${ITEMS[c.id].slot} slot.`, '#ff8080'); }
        else if (cur) { p.cursorItem = cur; p.accessories[idx] = null; Audio_.play('menu'); }
        break;
      }
      case 'petslot': {
        const isLight = b.data === 1, cur = isLight ? this.pets.light : this.pets.pet, c = p.cursorItem;
        if (c) { if (ITEMS[c.id].pet === (isLight ? 'light' : 'regular')) { if (isLight) this.pets.equipLight(c); else this.pets.equipRegular(c); p.cursorItem = cur; Audio_.play('menu'); } }
        else if (cur) { p.cursorItem = cur; if (isLight) this.pets.light = null; else this.pets.pet = null; Audio_.play('menu'); }
        break;
      }
      case 'achievements': UI.achievementsOpen = !UI.achievementsOpen; Audio_.play('menu'); break;
      case 'bosslog_page': BossLog.page = b.data; Audio_.play('menu'); break;
      case 'bosslog_close': BossLog.open = false; Audio_.play('menu'); break;
      case 'reforge_slot': {
        const c = p.cursorItem;
        if (c) { if (canHavePrefix(c.id)) { const prev = Reforge.item; Reforge.item = c; p.cursorItem = prev; Reforge.count = 0; Reforge.spent = 0; Reforge.lastResult = ''; Audio_.play('menu'); } else this.message('Only weapons and tools can be reforged.', '#ff8080'); }
        else if (Reforge.item) { p.cursorItem = Reforge.item; Reforge.item = null; Reforge.auto = false; Audio_.play('menu'); }
        else if (p.selectedItem && canHavePrefix(p.selectedItem.id)) { Reforge.item = p.selectedItem; p.inventory[p.selected] = null; Reforge.count = 0; Reforge.spent = 0; Audio_.play('menu'); }
        break;
      }
      case 'reforge_once': Reforge.auto = false; Reforge.reforgeOnce(this); break;
      case 'reforge_auto': if (!Reforge.item) { this.message('Place an item first.', '#ff8080'); break; } if (!Reforge.selected.size) { this.message('Select at least one target prefix.', '#ff8080'); break; } Reforge.auto = !Reforge.auto; Reforge.timer = 0; Audio_.play('menu'); break;
      case 'reforge_prefix': if (Reforge.selected.has(b.data)) Reforge.selected.delete(b.data); else Reforge.selected.add(b.data); Reforge.save(); Audio_.play('menu'); break;
      case 'reforge_lock': Reforge.win.locked = !Reforge.win.locked; Reforge.save(); Audio_.play('menu'); break;
      case 'reforge_close': Reforge.close(this); break;
      case 'reforge_hide': Reforge.hideVanilla = !Reforge.hideVanilla; Reforge.save(); Audio_.play('menu'); break;
      case 'reforge_drag': if (!Reforge.win.locked) Reforge.drag = { dx: this.mouse.x - Reforge.win.x, dy: this.mouse.y - Reforge.win.y }; break;
      case 'reforge_clear': Reforge.selected.clear(); Reforge.save(); Audio_.play('menu'); break;
      case 'trash': {
        if (p.cursorItem) { const c = p.cursorItem; p.cursorItem = null; this.trashItem(c); }
        else if (this.trash) { const t = this.untrash(); if (t) p.cursorItem = t; }
        break;
      }
      case 'recipe': { if (button === 0) { const e = this.craftable[b.data]; this.craft(e, shift); this.craftHold = e ? { recipe: e.recipe, shift, t: this.world.time, n: 0 } : null; } break; }
      case 'sortinv': this.sortInventory(); break;
      case 'quickstack': this.quickStack(); break;
      case 'sortchest': { this.sortStacks(this.openChest.inv, 0, 40); Audio_.play('menu'); break; }
      case 'quickstack_chest': { let n = 0; const inv = this.openChest.inv; for (let i = 10; i < 50; i++) { const st = p.inventory[i]; if (st && inv.some(c => c && c.id === st.id)) { this.moveToChest(i); n++; } } if (n) this.updateCraftable(); Audio_.play('menu'); break; }
      case 'restock': { const inv = this.openChest.inv; let n = 0; for (let i = 0; i < 50; i++) { const st = p.inventory[i]; if (!st) continue; const def = ITEMS[st.id]; if (def.max <= 1 || st.count >= def.max) continue; for (let k = 0; k < 40 && st.count < def.max; k++) { const c = inv[k]; if (c && c.id === st.id) { const take = Math.min(def.max - st.count, c.count); st.count += take; c.count -= take; n += take; if (c.count <= 0) inv[k] = null; } } } if (n) this.updateCraftable(); Audio_.play('menu'); break; }
      case 'lootall': { const inv = this.openChest.inv; for (let i = 0; i < 40; i++) if (inv[i]) { const left = p.addItem(inv[i].id, inv[i].count); inv[i] = left > 0 ? { id: inv[i].id, count: left } : null; } Audio_.play('pickup'); this.updateCraftable(); break; }
      case 'depositall': { for (let i = 10; i < 50; i++) if (p.inventory[i]) this.moveToChest(i); Audio_.play('menu'); this.updateCraftable(); break; }
      case 'closechest': this.closeChest(); break;
      case 'settings': this.settingsOpen = !this.settingsOpen; UI.settingsPage = 'main'; Audio_.play('menu'); break;
      case 'mod_item': {
        Audio_.play('menu');
        const d = b.data, A = ArmedZombies.cfg, F = Fishing.cfg;
        if (d === 'back') UI.settingsPage = 'main';
        else if (d === 'az_enabled') A.enabled = !A.enabled;
        else if (d === 'az_weapon') A.weaponChance = [0.3, 0.6, 1][( [0.3, 0.6, 1].indexOf(A.weaponChance) + 1) % 3];
        else if (d === 'az_axe') A.axeChance = [0, 0.25, 0.5, 1][( [0, 0.25, 0.5, 1].indexOf(A.axeChance) + 1) % 4];
        else if (d === 'az_armor') A.armorChance = [0.2, 0.4, 0.7, 1][( [0.2, 0.4, 0.7, 1].indexOf(A.armorChance) + 1) % 4];
        else if (d === 'az_windup') A.windup = !A.windup;
        else if (d === 'az_healing') A.healing = !A.healing;
        else if (d === 'az_scared') A.scared = !A.scared;
        else if (d === 'az_stagger') A.stagger = !A.stagger;
        else if (d === 'af_cast') F.autoCast = !F.autoCast;
        else if (d === 'af_reel') F.autoReel = !F.autoReel;
        else if (d === 'af_junk') F.filterJunk = !F.filterJunk;
        else if (d === 'af_crates') F.openCrates = !F.openCrates;
        else if (d === 'af_sell') F.autoSell = !F.autoSell;
        else if (d === 'af_lines') F.lines = F.lines % 3 + 1;
        else if (d === 'af_bait') F.noBait = !F.noBait;
        else if (d === 'af_water') F.fishInWater = !F.fishInWater;
        else if (d === 'af_info') F.info = !F.info;
        else if (d === 'holidays') Holidays.cfg.mode = Holidays.cfg.mode === 'always' ? 'date' : 'always';
        else if (d === 'fx') { FX.cfg.intensity = FX.cfg.intensity >= 1 ? 0.5 : FX.cfg.intensity > 0 ? 0 : 1; FX.save(); }
        else if (d === 'overload') { ManaOverload.cfg.enabled = !ManaOverload.cfg.enabled; ManaOverload.save(); }
        else if (d === 'modlist') UI.settingsPage = 'modlist';
        ArmedZombies.save(); Fishing.save(); Holidays.save();
        break;
      }
      case 'vanslot': { const k = b.data, cur = p.vanity[k], c = p.cursorItem; if (c) { if (ITEMS[c.id].armor === ['head', 'body', 'legs'][k]) { p.vanity[k] = c; p.cursorItem = cur; Audio_.play('menu'); } else this.message('That does not go there.', '#ff8080'); } else if (cur) { p.cursorItem = cur; p.vanity[k] = null; Audio_.play('menu'); } break; }
      case 'dyeslot': { const k = b.data, cur = p.dyes[k], c = p.cursorItem; if (c) { if (ITEMS[c.id].dye) { p.dyes[k] = { id: c.id, count: 1 }; c.count--; if (c.count <= 0) p.cursorItem = null; if (cur) { const left = p.addItem(cur.id, 1, null); if (left) this.dropItem(p.cx, p.cy, cur.id, 1); } Audio_.play('menu'); } else this.message('That is not a dye.', '#ff8080'); } else if (cur) { p.dyes[k] = null; const left = p.addItem(cur.id, 1, null); if (left) this.dropItem(p.cx, p.cy, cur.id, 1); Audio_.play('menu'); } break; }
      case 'loadout': Equipment.switchLoadout(this, b.data); break;
      case 'craft_search': TextInput.focus({ id: 'craft_search', value: UI.craftFilter || '', placeholder: 'search recipes...', max: 30, keepFocus: true, onChange: (v) => { UI.craftFilter = v; this.updateCraftable(); }, onSubmit: () => TextInput.blur() }); break;
      case 'starfarer_pick': StarsAbove.choose(this, b.data); break;
      case 'array_toggle': StarsAbove.toggle(this, b.data); break;
      case 'album_photo': { const s = Photography.state(this); s.photos.splice(b.data, 1); Audio_.play('menu'); break; }
      case 'struct_select': case 'struct_gen': case 'struct_export': case 'struct_delete': case 'struct_import': Structures.click(this, b); break;
      case 'race_edit': case 'race_save': case 'race_back': this.raceEditorClick(b, button); break;
      case 'fable_choice': Fables.choose(this, b.data); break;
      case 'fable_skip': Fables.choose(this, -1); break;
      case 'settings_item': {
        Audio_.play('menu');
        if (b.data === 'resume') this.settingsOpen = false;
        else if (b.data === 'zoom') this.cycleZoom();
        else if (b.data === 'sound') Audio_.enabled = !Audio_.enabled;
        else if (b.data === 'music_vol') { SFX.cfg.music = (Math.round(SFX.cfg.music * 4) + 1) % 5 / 4; SFX.save(); }
        else if (b.data === 'sfx_vol') { SFX.cfg.sfx = (Math.round(SFX.cfg.sfx * 4) + 1) % 5 / 4; SFX.save(); }
        else if (b.data === 'autoswing') this.autoswing = !this.autoswing;
        else if (b.data === 'trashrate') { const r = [1, 0.5, 0.25, 0]; this.trashRate = r[(r.indexOf(this.trashRate) + 1) % r.length]; }
        else if (b.data === 'throarbin') this.throarbinExact = !this.throarbinExact;
        else if (b.data === 'reforgewin') { Reforge.win = { x: 60, y: 120, locked: false }; Reforge.save(); this.message('Reforge window position reset.', '#c0c0ff'); }
        else if (b.data === 'achievements') { UI.achievementsOpen = !UI.achievementsOpen; }
        else if (b.data === 'mods') UI.settingsPage = 'mods';
        else if (b.data === 'save') this.saveGame();
        else if (b.data === 'exit') { this.settingsOpen = false; this.exitToTitle(); }
        break;
      }
      case 'dialog': this.dialogButton(b.data); break;
      default: ModLib.uiClick(this, b, button); break;
    }
  }

  slotClick(inv, i, button) {
    const p = this.player;
    const s = inv[i], c = p.cursorItem;
    if (button === 0) {
      if (!c) { if (s) { p.cursorItem = s; inv[i] = null; Audio_.play('menu'); } }
      else if (!s) { inv[i] = c; p.cursorItem = null; Audio_.play('menu'); }
      else if (s.id === c.id) { const max = ITEMS[s.id].max; const n = Math.min(max - s.count, c.count); s.count += n; c.count -= n; if (c.count <= 0) p.cursorItem = null; Audio_.play('menu'); }
      else { inv[i] = c; p.cursorItem = s; Audio_.play('menu'); }
    } else {
      // right click: pick up one / place one
      if (!c) { if (s) { const n = Math.ceil(s.count / 2); p.cursorItem = { id: s.id, count: n }; s.count -= n; if (s.count <= 0) inv[i] = null; Audio_.play('menu'); } }
      else if (!s) { inv[i] = { id: c.id, count: 1 }; c.count--; if (c.count <= 0) p.cursorItem = null; Audio_.play('menu'); }
      else if (s.id === c.id && s.count < ITEMS[s.id].max) { s.count++; c.count--; if (c.count <= 0) p.cursorItem = null; Audio_.play('menu'); }
    }
  }

  // Sort: merge partial stacks, then order by kind (tools, weapons, armor, accessories, consumables, ammo, blocks, materials, the rest) and name
  sortStacks(inv, from, to) {
    const kind = (it) => it.tool ? 0 : it.damage > 0 && !it.ammo ? 1 : it.armor ? 2 : it.accessory ? 3 : it.consumable ? 4 : it.ammo ? 5 : it.placeable ? 6 : it.material ? 7 : 8;
    const items = []; for (let i = from; i < to; i++) if (inv[i]) items.push(inv[i]);
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) { const A = items[a], B = items[b]; const def = ITEMS[A.id]; if (A.id === B.id && (A.prefix || null) === (B.prefix || null) && def.max > 1 && A.count < def.max && B.count > 0) { const n = Math.min(def.max - A.count, B.count); A.count += n; B.count -= n; } }
    const left = items.filter(x => x.count > 0);
    left.sort((A, B) => { const a = ITEMS[A.id], b = ITEMS[B.id]; return kind(a) - kind(b) || (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name) || B.count - A.count; });
    for (let i = from; i < to; i++) inv[i] = left[i - from] || null;
  }
  sortInventory() { this.sortStacks(this.player.inventory, 10, 50); this.updateCraftable(); Audio_.play('menu'); }
  // Quick Stack: every stack in the main inventory goes into a nearby chest that already holds that item
  quickStack() {
    const p = this.player, w = this.world, R = 20; let n = 0;
    const chests = []; for (const [i, inv] of w.chests) { const x = i % w.w, y = (i / w.w) | 0; if (Math.abs(x - p.tileX) <= R && Math.abs(y - p.tileY) <= R) chests.push(inv); }
    if (!chests.length) { this.message('No chests nearby.', '#ffb060'); return; }
    for (let i = 10; i < 50; i++) {
      const st = p.inventory[i]; if (!st) continue; const def = ITEMS[st.id];
      for (const inv of chests) { if (!inv.some(c => c && c.id === st.id)) continue;
        for (let k = 0; k < inv.length && st.count > 0; k++) { const c = inv[k]; if (c && c.id === st.id && c.count < def.max) { const m = Math.min(def.max - c.count, st.count); c.count += m; st.count -= m; n += m; } }
        for (let k = 0; k < inv.length && st.count > 0; k++) if (!inv[k]) { inv[k] = { id: st.id, count: st.count, prefix: st.prefix }; n += st.count; st.count = 0; }
        if (st.count <= 0) { p.inventory[i] = null; break; } }
    }
    if (n) { this.message(`Quick stacked ${n} items into nearby chests.`, '#c0ffc0'); this.updateCraftable(); FX.burst(this, p.cx, p.cy, 8, '#ffe060', 2, 20); } else this.message('Nothing to stack: nearby chests hold none of these items.', '#ffb060');
    Audio_.play('menu');
  }
  moveToChest(i) {
    const p = this.player, inv = this.openChest.inv;
    const s = p.inventory[i]; if (!s) return;
    const def = ITEMS[s.id];
    for (let k = 0; k < 40 && s.count > 0; k++) { const c = inv[k]; if (c && c.id === s.id && c.count < def.max) { const n = Math.min(def.max - c.count, s.count); c.count += n; s.count -= n; } }
    for (let k = 0; k < 40 && s.count > 0; k++) { if (!inv[k]) { inv[k] = { id: s.id, count: s.count }; s.count = 0; } }
    if (s.count <= 0) p.inventory[i] = null;
    Audio_.play('menu');
  }

  openChestAt(x, y) {
    const inv = this.world.chests.get(this.world.idx(x, y));
    if (!inv) return;
    this.openChest = { x, y, inv };
    if (!this.invOpen) { this.invOpen = true; }
    Audio_.play('open');
    this.updateCraftable();
  }
  closeChest() { this.openChest = null; Audio_.play('close'); }

  // ---------------------------------------------------------------------------
  // Crafting
  updateCraftable() {
    const p = this.player, w = this.world;
    if (!p || !w) return;
    this.stations = new Set();
    const r = 5;
    for (let y = p.tileY - r; y <= p.tileY + r; y++) for (let x = p.tileX - r; x <= p.tileX + r; x++) {
      const id = w.get(x, y);
      { const drop = TILES[id] && TILES[id].drop; if (drop && ITEMS[drop] && ITEMS[drop].mod && !ModList.on(ITEMS[drop].mod)) continue; } // a station from a disabled mod does not count
      if (id === T.WORKBENCH) this.stations.add('workbench');
      else if (id === T.FURNACE) this.stations.add('furnace');
      else if (id === T.ANVIL) this.stations.add('anvil');
      else if (id === T.PETFORGE) this.stations.add('petforge');
      else if (STATION_TILES[id]) { for (const k of STATION_TILES[id]) this.stations.add(k); }
    }
    const list = [];
    for (const rec of RECIPES) {
      if ((rec.mod && !ModList.on(rec.mod)) || !ModList.itemOk(rec.result)) continue;
      const hasStation = !rec.station || this.stations.has(rec.station);
      if (!hasStation) continue;
      // show recipe if the player has at least one ingredient
      let anyIng = false, all = true;
      for (const [id, n] of rec.ing) { const have = p.countItem(id); if (have > 0) anyIng = true; if (have < n) all = false; }
      if (!anyIng) continue;
      list.push({ recipe: rec, can: hasStation && all });
    }
    list.sort((a, b) => (b.can - a.can));
    if (UI.craftFilter) { const f = UI.craftFilter.toLowerCase(); this.craftable = list.filter(e => ITEMS[e.recipe.result].name.toLowerCase().includes(f)); } else this.craftable = list;
    if (UI.craftScroll * 10 >= list.length) UI.craftScroll = 0;
  }

  // holding the mouse on a recipe keeps crafting it: after a second it repeats, faster the longer you hold
  craftHoldTick() {
    const h = this.craftHold; if (!h) return;
    if (!this.mouse.left || !this.invOpen) { this.craftHold = null; return; }
    const b = UI.hit(this.mouse.x, this.mouse.y); const e = b && b.id === 'recipe' ? this.craftable[b.data] : null;
    if (!e || e.recipe !== h.recipe) { this.craftHold = null; return; }
    const held = this.world.time - h.t; if (held < 90) return; // a second and a half, then it repeats
    const every = held < 270 ? 10 : held < 510 ? 5 : 3;
    if ((held - 90) % every !== 0) return;
    if (!e.can) { this.craftHold = null; return; }
    this.craft(e, h.shift); h.n++;
  }
  craft(entry, toInventory = false) {
    if (!entry || !entry.can) { Audio_.play('menu'); return; }
    const p = this.player, rec = entry.recipe;
    if (toInventory && !p.hasRoomFor(rec.result, rec.count)) { this.message('No room in your inventory.', '#ff8080'); return; }
    for (const [id, n] of rec.ing) p.removeItem(id, n);
    // Shift-Click Crafting: the result goes straight into the inventory; otherwise onto the cursor
    if (toInventory) { const left = p.addItem(rec.result, rec.count); if (left > 0) this.dropItem(p.cx, p.cy, rec.result, left); }
    else if (p.cursorItem && p.cursorItem.id === rec.result && p.cursorItem.count + rec.count <= ITEMS[rec.result].max && ITEMS[rec.result].max > 1) p.cursorItem.count += rec.count;
    else if (!p.cursorItem) p.cursorItem = makeStack(rec.result, rec.count);
    else { const left = p.addItem(rec.result, rec.count); if (left > 0) this.dropItem(p.cx, p.cy, rec.result, left); }
    if (ITEMS[rec.result].pet) this.pets.unlock('pet_chef');
    Audio_.play('craft');
    this.updateCraftable();
  }

  // ---------------------------------------------------------------------------
  // NPC dialog
  openDialog(npc) {
    const def = npc.def;
    if (npc.isCompanion) {
      const L = COMPANION_DEFS[npc.id].lines;
      this.dialog = { npc, text: choose(L.greet), tipIndex: 0, buttons: ['Close', 'Chat', npc.order === 'follow' ? 'Stay here' : 'Follow me', 'Dismiss'] };
      npc.talking = true; Audio_.play('open'); return;
    }
    const text = npc.isPet ? `${npc.name} looks at you expectantly.` : (npc.role === 'Guide' ? def.lines[0] : choose(def.lines));
    this.dialog = { npc, text, tipIndex: 0, buttons: ['Close', ...def.buttons] };
    npc.talking = true;
    Audio_.play('open');
  }

  openShop(npc) {
    this.shop = (npc.role === 'Traveling Merchant' ? npc.shopItems : SHOPS[npc.def.shop]).filter(e => (!e.cond || e.cond(this)) && ModList.itemOk(e.id));
    this.shopNpc = npc;
    if (this.openChest) this.closeChest();
    this.invOpen = true;
    Audio_.play('open');
  }

  nurseHeal(npc) {
    const p = this.player;
    const debuffs = Object.keys(p.buffs).filter(b => b !== 'Cozy Fire');
    const cost = (p.maxHp - p.hp) + debuffs.length * 100;
    if (cost <= 0) { this.dialog.text = "You don't look injured to me. Stop wasting my time."; return; }
    if (p.coins < cost) { this.dialog.text = `Healing you would cost ${coinsToString(cost)}. Come back when you can pay.`; return; }
    p.coins -= cost; p.hp = p.maxHp;
    for (const b of debuffs) delete p.buffs[b];
    this.addDamageText(p.cx, p.y, '+' + (p.maxHp - p.hp + cost), '#40e060');
    Audio_.play('heal');
    this.dialog.text = `There, all patched up. That will be ${coinsToString(cost)}.`;
  }

  // Town NPC arrival: conditions from the wiki + a vacant valid house (except the Guide at world start)
  // an NPC takes up residence: teleported straight into the house (Terraria does this off-screen; the
  // housing menu does it on the spot with a puff of smoke)
  moveIn(npc, now) {
    const w = this.world, h = npc.home; if (!h) return;
    const offscreen = Math.abs(npc.cx - this.player.cx) > this.renderer.vw / 2 + 20 * TILE || Math.abs(npc.cy - this.player.cy) > this.renderer.vh / 2 + 12 * TILE;
    if (!now && !offscreen && w.isDay() && !w.bloodMoon) return; // in view by day they walk over (goHome at night handles the rest)
    FX.burst(this, npc.cx, npc.cy, 10, '#e0e0e0', 2, 20);
    npc.x = h.homeX * TILE + 8 - npc.w / 2; npc.y = (h.homeY + 1) * TILE - npc.h; npc.vx = 0; npc.vy = 0; npc.sitting = null; npc.moving = 0;
    FX.burst(this, npc.cx, npc.cy, 10, '#e0e0e0', 2, 20);
  }
  // homeless town NPCs claim any vacant house on their own (checked every 10 s of daylight)
  assignHomes() {
    const w = this.world; if (w.isSub) return;
    for (const n of this.npcs) {
      if (!n.isTown || n.isPet || n.home || n.dead || n.noSave || (n.def && n.def.noHouse) || (NPC_ROLES[n.role] && NPC_ROLES[n.role].noHouse)) continue;
      const house = (NPC_ROLES[n.role] && NPC_ROLES[n.role].findHome && NPC_ROLES[n.role].findHome(this)) || w.findVacantHouse(this.npcs);
      if (!house) return;
      n.home = { key: house.key, homeX: house.homeX, homeY: house.homeY };
      this.moveIn(n, false);
      this.message(`${n.title} has moved into a house.`, '#50ff50');
    }
  }
  checkArrivals() {
    const w = this.world;
    if (w.isSub) return;
    for (const role of ['Guide', ...NPC_ARRIVAL_ORDER, 'Shrine Maiden', 'Mc MoneyPants', 'Cook', 'Solyn', 'Shutterbug', 'Mutant', 'Lumberjack', 'Wanderer']) {
      if (this.npcs.some(n => n.role === role)) continue;
      const def = NPC_ROLES[role];
      if (def.condition && !def.condition(this)) continue;
      const house = def.noHouse ? null : ((def.findHome && def.findHome(this)) || w.findVacantHouse(this.npcs));
      if (!house && !def.noHouse) continue;
      let npc;
      if (house) { npc = new NPC(house.homeX * TILE - 2, (house.homeY + 1) * TILE - 42, npcName(role), role); npc.home = { key: house.key, homeX: house.homeX, homeY: house.homeY }; }
      else {
        // homeless arrivals (town slimes) turn up next to the town, or at spawn
        const anchor = this.npcs.find(n => n.home && n.isTown) || { cx: w.spawnX * TILE };
        const ax = clamp(Math.floor(anchor.cx / TILE) + randInt(-6, 6), 5, w.w - 6); let ay = 0; while (ay < w.h - 1 && !w.isSolidAt(ax, ay)) ay++;
        npc = new NPC(ax * TILE, (ay - 3) * TILE, npcName(role), role);
      }
      if (def.onArrive) def.onArrive(this, npc);
      this.npcs.push(npc);
      this.message(`${npc.title} has arrived!`, '#50ff50');
      Audio_.play('levelup');
      if (role === 'Pet Tamer') this.pets.unlock('tamed');
      return; // one per check
    }
  }

  spawnTravelingMerchant() {
    const w = this.world; if (w.isSub) return;
    if (this.npcs.some(n => n.role === 'Traveling Merchant')) return;
    const anchor = this.npcs.find(n => n.home) || { cx: w.spawnX * TILE };
    const x = Math.floor(anchor.cx / TILE) + randInt(-10, 10);
    let y = 0; while (y < w.h - 1 && !w.isSolidAt(x, y)) y++;
    const m = new NPC(x * TILE, (y - 3) * TILE, npcName('Traveling Merchant'), 'Traveling Merchant');
    m.shopItems = makeTravelingShop();
    m.leaveAt = w.time - (w.time % w.dayLength) + Math.round(w.dayLength * 18 / 24);
    this.npcs.push(m);
    this.message(`${m.title} has arrived!`, '#50ff50');
  }

  onNpcDeath(npc) {
    this.message(`${npc.title} was slain...`, '#ff6060');
    if (this.dialog && this.dialog.npc === npc) this.closeDialog();
    if (this.shopNpc === npc) this.closeShop();
    for (let i = 0; i < 15; i++) this.particles.push(new Particle(npc.cx, npc.cy, rand(-4, 4), rand(-6, 1), '#b03a3a', 60, 3, true));
  }

  // Housing menu actions: query a spot or assign the selected NPC's home
  housingClick() {
    const w = this.world, sel = this.housingSelect;
    const tx = Math.floor(this.mouse.wx / TILE), ty = Math.floor(this.mouse.wy / TILE);
    const h = w.checkHouse(tx, ty);
    if (sel === 'query') { this.message(h.ok ? 'This housing is suitable.' : h.reason, h.ok ? '#50ff50' : '#ff8080'); return; }
    if (!h.ok) { this.message(h.reason, '#ff8080'); return; }
    for (const n of this.npcs) if (n !== sel && n.home && n.home.key === h.key) { n.home = null; this.message(`${n.title} has been evicted.`, '#ffb060'); }
    sel.home = { key: h.key, homeX: h.homeX, homeY: h.homeY };
    this.moveIn(sel, true);
    this.message(`${sel.title}'s home has been set.`, '#50ff50');
    Audio_.play('menu');
    this.housingSelect = null;
  }
  closeShop() { this.shop = null; this.shopNpc = null; Audio_.play('close'); }

  buyItem(entry) {
    const p = this.player;
    if (p.coins < entry.price) { this.message('Not enough coins!', '#ff8080'); Audio_.play('menu'); return; }
    if (!p.hasRoomFor(entry.id, 1)) { this.message('No room in your inventory.', '#ff8080'); return; }
    p.coins -= entry.price;
    p.addItem(entry.id, 1);
    Audio_.play('craft');
    this.updateCraftable();
  }
  sellItem(i) {
    const p = this.player;
    const s = p.inventory[i]; if (!s) return;
    const value = Math.floor(stackValue(s) / 5) * s.count;
    if (value <= 0) { this.message('The merchant does not want that.', '#ff8080'); return; }
    p.coins += value; p.inventory[i] = null;
    this.addDamageText(p.cx, p.y, '+' + coinsToString(value), '#ffe75a');
    Audio_.play('craft');
    this.updateCraftable();
  }

  closeDialog() { if (this.dialog) this.dialog.npc.talking = false; this.dialog = null; Audio_.play('close'); }
  raceEditorClick(b, button) {
    if (b.id === 'race_edit') { const it = Races.editorItems()[b.data]; if (it) { it.act(button === 2 ? -1 : 1); Audio_.play('menu'); } }
    else if (b.id === 'race_save') { const id = Races.saveEditor(this); if (id) { this.raceChoice = id; if (this.state === 'title') { UI.raceEditorOpen = false; this.showCreateMenu(); } } }
    else if (b.id === 'race_back') { UI.raceEditorOpen = false; if (this.state === 'title') this.showCreateMenu(); }
  }
  dialogButton(b) {
    const d = this.dialog;
    if (b === 'Close') { this.closeDialog(); return; }
    if (b === 'Shop') { const npc = d.npc; this.closeDialog(); this.openShop(npc); return; }
    Audio_.play('menu');
    if (b === 'Heal') { this.nurseHeal(d.npc); return; }
    if (b === 'Pet') { this.petTownPet(d.npc); return; }
    if (d.npc.def && d.npc.def.onButton) { d.npc.def.onButton(this, d.npc, b); return; }
    if (d.npc.isCompanion) {
      const c = d.npc, L = COMPANION_DEFS[c.id].lines;
      if (b === 'Chat') { d.text = choose([...L.greet, ...L.idle, `I'm level ${c.level}. ${c.xp}/${c.xpToNext()} to the next one.`, `Life: ${c.hp}/${c.maxHp}. ${c.hp < c.maxHp * 0.5 ? 'Could use a break.' : 'Feeling great.'}`]); }
      else if (b === 'Stay here') { c.order = 'stay'; d.text = 'Got it, I will hold this spot.'; d.buttons = ['Close', 'Chat', 'Follow me', 'Dismiss']; }
      else if (b === 'Follow me') { c.order = 'follow'; d.text = 'Right behind you.'; d.buttons = ['Close', 'Chat', 'Stay here', 'Dismiss']; }
      else if (b === 'Dismiss') { this.companions = this.companions.filter(x => x !== c); const left = this.player.addItem(`${c.id}_bag`, 1, null); if (left) this.dropItem(this.player.cx, this.player.cy, `${c.id}_bag`, 1, null, null); this.message(`${c.name} left the squad. Their bag is back in your inventory.`, '#c0c0ff'); this.closeDialog(); }
      return;
    }
    if (b === 'Combine') { this.combineLightPets(); return; }
    if (b === 'Reforge') { const npc = d.npc; this.closeDialog(); this.openReforge(npc); return; }
    if (b === 'Help') { const lines = d.npc.def.lines; d.tipIndex = (d.tipIndex + 1) % lines.length; d.text = lines[d.tipIndex]; }
    else if (b === 'Crafting') {
      const p = this.player;
      const wood = p.countItem('wood'), gel = p.countItem('gel');
      if (!p.inventory.some(s => s && s.id === 'workbench') && !this.stations.has('workbench')) d.text = wood >= 10 ? 'You have enough wood for a Work Bench! Open your inventory and craft it.' : `A Work Bench needs 10 wood. You have ${wood}. Go chop some trees!`;
      else if (gel < 1) d.text = 'Find slimes and collect their Gel, then craft torches with wood so you can see underground.';
      else if (!this.stations.has('furnace') && !p.inventory.some(s => s && s.id === 'furnace')) d.text = 'Next up: a Furnace. You need 20 stone, 4 wood and 3 torches, crafted at a Work Bench.';
      else if (!this.stations.has('anvil') && !p.inventory.some(s => s && s.id === 'anvil')) d.text = 'Smelt iron ore into 5 iron bars at your Furnace, then craft an Anvil at the Work Bench.';
      else d.text = 'With an anvil you can forge iron, silver and gold gear. Deeper ore makes better tools!';
    }
  }

  summonBoss() {
    const p = this.player;
    const side = Math.random() < 0.5 ? -1 : 1;
    const b = new EyeOfCthulhu(p.cx + side * 700, Math.max(32, p.cy - 300));
    b.type = 'eye_of_cthulhu';
    if (this.expert) { b.maxHp = b.hp = 3640; b.damage = 30; }
    this.enemies.push(b);
    this.boss = b;
    BossLog.start(this, b);
    this.message('Eye of Cthulhu has awoken!', '#c040c0');
    Audio_.play('zombie');
  }

  summonKingSlime() {
    const p = this.player;
    const side = Math.random() < 0.5 ? -1 : 1;
    const b = new KingSlime(p.cx + side * 400 - 55, p.y - 200);
    if (this.expert) { b.maxHp = b.hp = 2800; b.damage = 60; }
    this.enemies.push(b);
    this.boss = b;
    BossLog.start(this, b);
    this.message('King Slime has awoken!', '#c040c0');
    Audio_.play('slime');
  }

  onBossDespawn(boss) { BossLog.onDespawn(this, boss); }
  lateGameTick() {
    const w = this.world, p = this.player; if (w.isSub) return;
    const bd = w.bossesDefeated || {};
    if (w.skeletronDefeated) { const om = this.npcs.find(n => n.role === 'Old Man'); if (om) om.dead = true; }
    // Plantera bulbs grow in the underground jungle once the mechanical bosses are down
    if (w.hardmode && bd.the_twins && bd.the_destroyer && bd.skeletron_prime && w.time % 600 === 0 && (w.bulbs || 0) < 3) { const jb = w.bands.jungle; for (let k = 0; k < 200; k++) { const x = randInt(Math.floor(jb[0] * w.w) + 5, Math.floor(jb[1] * w.w) - 5), y = randInt(w.surfaceLine + 30, w.h - 90); if (w.get(x, y) === T.AIR && w.get(x + 1, y) === T.AIR && w.get(x, y + 1) === T.AIR && w.get(x + 1, y + 1) === T.AIR && w.get(x, y + 2) === T.JUNGLE_GRASS) { w.placeFurniture(x, y, T.PLANTERA_BULB); w.bulbs = (w.bulbs || 0) + 1; this.message("A Plantera's Bulb has grown in the jungle...", '#ff40a0'); break; } } }
    // Lunatic cultists at the dungeon after the Golem
    if (w.golemDefeated && !bd.lunatic_cultist && w.dungeon && !w.cultistsSpawned && Math.abs(p.tileX - w.dungeon.x) < 70 && !this.boss) { w.cultistsSpawned = true; w.cultistsKilled = 0; for (let k = 0; k < 4; k++) { const c = spawnEnemy('cultist', (w.dungeon.x - 30 + k * 20) * TILE, (w.dungeon.y - 4) * TILE, this.expert); c.cultist = true; this.enemies.push(c); } this.message('The Cultists are performing a ritual at the Dungeon!', '#8060ff'); }
    if (w.cultistsSpawned && !bd.lunatic_cultist && w.cultistsKilled >= 4 && !this.boss) { w.cultistsSpawned = false; Bosses.summon(this, 'lunatic_cultist', { x: w.dungeon.x * TILE, y: (w.dungeon.y - 10) * TILE }); }
    // Martian probe: escapes once it has seen you
    for (const e of this.enemies) if (e.type === 'martian_probe' && !e.dead) { const d = dist(e.cx, e.cy, p.cx, p.cy); if (d < 18 * TILE) e.seen = true; if (e.seen) { e.vy -= 0.4; e.vx += (e.cx < p.cx ? -0.3 : 0.3); if (e.y < 8 * TILE || d > 70 * TILE) { e.dead = true; e.escaped = true; Events.onKill(this, e); } } }
    // taxes
    if (w.time % 3600 === 0 && this.npcs.some(n => n.role === 'Tax Collector')) w.taxes = Math.min(100000, (w.taxes || 0) + 50 * this.npcs.filter(n => n.home && !n.isPet).length);
  }

  rescueGoblin(n) {
    const w = this.world;
    this.npcs = this.npcs.filter(x => x !== n);
    w.goblinRescued = true;
    const g = new NPC(n.x, n.y, npcName('Goblin Tinkerer'), 'Goblin Tinkerer');
    // he heads for town: appears near spawn if there is no house yet
    const house = w.findVacantHouse(this.npcs);
    if (house) { g.home = { key: house.key, homeX: house.homeX, homeY: house.homeY }; g.x = house.homeX * TILE - 2; g.y = (house.homeY + 1) * TILE - 42; }
    else { g.x = w.spawnX * TILE; let y = 0; while (y < w.h - 1 && !w.isSolidAt(w.spawnX, y)) y++; g.y = (y - 3) * TILE; }
    this.npcs.push(g);
    this.message(`You untie ${g.name} the Goblin Tinkerer! He will wait for a house in town.`, '#50ff50');
    Audio_.play('levelup');
  }

  openReforge(npc) {
    Reforge.open = true; Reforge.npc = npc; Reforge.auto = false; Reforge.count = 0; Reforge.spent = 0; Reforge.lastResult = '';
    if (!this.invOpen) this.invOpen = true;
    Audio_.play('open');
  }

  // ---------------------------------------------------------------------------
  // Spawning
  spawnEnemies() {
    const w = this.world, p = this.player;
    if (p.dead) return;
    const night = !w.isDay();
    const underground = p.tileY > w.surfaceLine;
    const cavern = p.tileY > w.cavernLine;
    const hell = p.tileY > w.h - 70;
    // spawn rate (1/x per tick) and max spawns from the wiki tables
    let [rate, maxSpawns] = hell ? SPAWN_TABLE.underworld : cavern ? SPAWN_TABLE.cavern : underground ? SPAWN_TABLE.underground : night ? SPAWN_TABLE.surfaceNight : SPAWN_TABLE.surfaceDay;
    if (this.boss) [rate, maxSpawns] = SPAWN_TABLE.boss;
    else if (w.bloodMoon && !underground) [rate, maxSpawns] = SPAWN_TABLE.bloodMoon;
    // Town NPCs nearby calm things down; with 3+ around, surface spawning stops (not in Expert / events)
    let townNear = 0; for (const n of this.npcs) if (n.isTown && Math.abs(n.cx - p.cx) < 60 * TILE && Math.abs(n.cy - p.cy) < 40 * TILE) townNear++;
    if (townNear >= 3 && !this.expert && !w.bloodMoon && !this.boss && !underground) return;
    if (townNear) { rate = Math.floor(rate * (1 + 0.5 * townNear)); maxSpawns = Math.max(1, Math.floor(maxSpawns * (1 - 0.2 * townNear))); }
    if (w.noSpawns) return;
    const active = this.enemies.filter(e => !e.isBoss && !e.isDummy && !e.isSegment).length;
    { const sr = Fargo.spawnRate(this); if (sr !== 1) { rate = Math.max(1, Math.round(rate / sr)); maxSpawns = Math.round(maxSpawns * sr); } }
    if (active >= maxSpawns) return;
    // fewer active enemies -> faster spawns
    const f = active / maxSpawns;
    if (f < 0.2) rate = Math.floor(rate * 0.6); else if (f < 0.4) rate = Math.floor(rate * 0.7); else if (f < 0.6) rate = Math.floor(rate * 0.8); else if (f < 0.8) rate = Math.floor(rate * 0.9);
    if (Math.random() * rate >= 1) return;
    // pick type
    const r = Math.random();
    const biome = w.biome[clamp(p.tileX, 0, w.w - 1)];
    let type;
    if (hell) type = r < 0.6 ? 'lava_slime' : 'hell_bat';
    else if (cavern) type = r < 0.32 ? 'skeleton' : r < 0.6 ? 'bat' : r < 0.85 ? 'red_slime' : 'mother_slime';
    else if (underground) type = r < 0.35 ? 'blue_slime' : r < 0.6 ? 'purple_slime' : r < 0.9 ? 'bat' : 'skeleton';
    else if (night) type = w.bloodMoon ? (r < 0.7 ? 'zombie' : 'demon_eye') : (r < 0.5 ? 'zombie' : r < 0.85 ? 'demon_eye' : 'blue_slime');
    else {
      const slime = biome === BIOME.SNOW ? 'ice_slime' : biome === BIOME.DESERT ? 'sand_slime' : 'green_slime';
      type = r < 0.7 ? slime : 'blue_slime';
    }
    const baseSpawnType = type;
    type = Consolaria.pickSpawn(this, type, { hell, cavern, underground, night });
    type = Calamity.pickSpawn(this, type, { hell, cavern, underground, night });
    type = BiomeSys.pickSpawn(this, type, { hell, cavern, underground, night });
    type = ModLib.pickSpawn(this, type, { hell, cavern, underground, night });
    if (!ModList.enemyOk(type)) type = baseSpawnType;
    if (w.hardmode && (w.golemDefeated || w.planteraDefeated) && !underground && p.tileY < w.surfaceLine - 40 && Math.random() < 0.05 && !this.enemies.some(e => e.type === 'martian_probe')) type = 'martian_probe';
    const def = ENEMY_DEFS[type];
    const flying = def.cls === Flyer || def.cls === Fairy || def.cls.prototype instanceof Flyer;
    // Spawn rectangle: within 84x47 tiles of the player but outside the 62x35 "safe" rectangle (off-screen)
    for (let attempt = 0; attempt < 16; attempt++) {
      const tx = Math.floor(p.tileX + rand(-42, 42));
      let ty = Math.floor(p.tileY + rand(-23, 23));
      if (Math.abs(tx - p.tileX) < 31 && Math.abs(ty - p.tileY) < 17) continue;
      if (tx < 2 || tx >= w.w - 2 || ty < 2 || ty >= w.h - 2) continue;
      const ew = Math.ceil((def.w || 20) / TILE), eh = Math.ceil((def.h || 42) / TILE);
      if (flying) {
        if (w.get(tx, ty) !== T.AIR || w.get(tx, ty + 1) !== T.AIR) continue;
        if (!underground && ty > w.surface[tx]) continue;
        { const fe = spawnEnemy(type, tx * TILE, ty * TILE, this.expert); if (this.master) { fe.maxHp = fe.hp = Math.round(fe.hp * 1.5); fe.damage = Math.round(fe.damage * 1.5); } this.enemies.push(fe); }
        return;
      }
      // find ground: scan down for a floor
      let found = false;
      for (let k = 0; k < 25; k++) {
        const yy = ty + k;
        if (yy >= w.h - 2) break;
        if (w.isSolidAt(tx, yy)) {
          let clear = true;
          for (let j = 1; j <= eh; j++) for (let i = 0; i < ew; i++) if (w.isSolidAt(tx + i, yy - j)) clear = false;
          if (clear && w.liquidAt(tx, yy - 1) < 100) { ty = yy - eh; found = true; }
          break;
        }
      }
      if (!found) continue;
      if (Math.abs(tx - p.tileX) < 31 && Math.abs(ty - p.tileY) < 17) continue;
      // never spawn inside player-built rooms (non-natural walls behind)
      if (w.getWall(tx, ty) && !WALLS[w.getWall(tx, ty)].natural) continue;
      const e = spawnEnemy(type, tx * TILE, ty * TILE + (eh * TILE - (def.h || 42)), this.expert);
      if (this.master) { e.maxHp = e.hp = Math.round(e.hp * 1.5); e.damage = Math.round(e.damage * 1.5); }
      this.enemies.push(e);
      return;
    }
  }

  ambientParticles() {
    const w = this.world, cam = this.cam, r = this.renderer;
    const x0 = Math.floor(cam.x / TILE), y0 = Math.floor(cam.y / TILE);
    const x1 = Math.ceil((cam.x + r.vw) / TILE), y1 = Math.ceil((cam.y + r.vh) / TILE);
    // sample a few random tiles for torch/campfire/lava particles
    for (let k = 0; k < 6; k++) {
      const tx = randInt(x0, x1), ty = randInt(y0, y1);
      const id = w.get(tx, ty);
      if (id === T.TORCH) this.particles.push(new Particle(tx * TILE + 7 + rand(-1, 1), ty * TILE + 3, rand(-0.2, 0.2), rand(-0.8, -0.3), choose(['#ffe060', '#ff9020', '#ff6020']), 25, 2, false));
      else if (id === T.CAMPFIRE && (w.getData(tx, ty) & 3) === 1) this.particles.push(new Particle(tx * TILE + 8 + rand(-6, 6), ty * TILE + 2, rand(-0.3, 0.3), rand(-1.2, -0.5), choose(['#ffe060', '#ff9020', '#ff6020', '#606060']), 40, 2, false));
      else if (w.lavaAt(tx, ty) && w.liquidAt(tx, ty) > 0 && w.liquidAt(tx, ty - 1) === 0 && Math.random() < 0.3) this.particles.push(new Particle(tx * TILE + rand(0, 16), ty * TILE + 4, rand(-0.3, 0.3), rand(-1.5, -0.5), '#ffb040', 30, 2, false));
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers used by entities
  dropItem(x, y, id, count = 1, vx = null, prefix) {
    if (!id || count <= 0) return;
    const d = new ItemDrop(x, y, id, count, prefix);
    if (vx != null) { d.vx = vx; d.vy = -2; d.pickupDelay = 45; }
    this.drops.push(d);
  }
  // Drop an amount of copper as coin items of the largest denominations
  onEnemyKilled(e) {
    Consolaria.onEnemyKilled(this, e);
    if (e.cultist) this.world.cultistsKilled = (this.world.cultistsKilled || 0) + 1;
    for (const h of ModLib.killHooks) h(this, e);
    for (const c of this.companions) if (c.ko === 0 && dist(c.cx, c.cy, e.cx, e.cy) < 30 * TILE) c.gainXp(Math.max(5, Math.round(e.maxHp / 5)), this);
  }

  dropCoins(x, y, amount) {
    amount = Math.floor(amount);
    for (const [id, v] of [['coin_platinum', COIN.platinum], ['coin_gold', COIN.gold], ['coin_silver', COIN.silver], ['coin_copper', 1]]) {
      const n = Math.floor(amount / v);
      if (n > 0) { const d = new ItemDrop(x, y, id, n, null); d.vx = rand(-2, 2); d.vy = rand(-4, -2); this.drops.push(d); amount -= n * v; }
    }
  }
  addDamageText(x, y, text, color, crit = false) { this.damageTexts.push(new DamageText(x, y, text, color, crit)); }
  addPickupText(player, id, n) { this.damageTexts.push(new DamageText(player.cx, player.y - 6, `${ITEMS[id].name}${n > 1 ? ' (' + n + ')' : ''}`, id.startsWith('coin_') ? '#ffe75a' : '#e8e8ff')); }
  message(text, color = '#fff') { this.messages.push({ text, color, life: 60 * 7 }); if (this.messages.length > 8) this.messages.shift(); }
  onPlayerDeath(msg, lostCoins = 0) {
    const p = this.player, w = this.world;
    this.deathMsg = `${this.playerName}${msg.startsWith("'") ? '' : ' '}${msg}.`; this.lostCoins = lostCoins;
    this.message(this.deathMsg, '#ff6060'); this.closeDialog(); if (this.openChest) this.closeChest(); if (this.shop) this.closeShop();
    ModLib.emit('playerDeath', this);
    if (lostCoins > 0) this.dropCoins(p.cx, p.cy, lostCoins);
    // tombstone at the place of death (finds a flat 2x2 spot nearby)
    const tx = p.tileX, ty0 = p.tileY;
    for (let dy = 0; dy < 30; dy++) for (const dx of [0, -1, 1, -2, 2]) {
      const x = tx + dx, y = ty0 + dy;
      if (w.canPlaceFurniture(x, y - 1, T.TOMBSTONE)) { w.placeFurniture(x, y - 1, T.TOMBSTONE); w.tombstones = w.tombstones || new Map(); w.tombstones.set(w.idx(x, y - 1), this.deathMsg); return; }
    }
  }
  nearTile(id, tx, ty, r) {
    const w = this.world;
    for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (w.get(x, y) === id) return true;
    return false;
  }
  splash(x, y, lava) {
    for (let i = 0; i < 10; i++) this.particles.push(new Particle(x + rand(-8, 8), y, rand(-2, 2), rand(-4, -1), lava ? '#ff8030' : '#60a0ff', 30, 2));
  }
  tileParticles(tx, ty, color, n) {
    for (let i = 0; i < n; i++) this.particles.push(new Particle(tx * TILE + rand(2, 14), ty * TILE + rand(2, 14), rand(-1.5, 1.5), rand(-3, 0), color || '#888', 30, 2));
  }

  // ---------------------------------------------------------------------------
  render() {
    const r = this.renderer, ctx = r.ctx;
    const W = r.W, H = r.H;
    if (this.state === 'title' || this.state === 'loading') {
      if (UI.parallaxReady()) { r.uiTransform(); UI.drawParallax(this); }
      else {
        r.drawSky(this.titleWorld, { x: this.titleCam.x, y: (this.titleWorld.surfaceLine - 8) * TILE - r.vh * 0.66 }, 10);
        r.deviceTransform();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(r.bg, 0, 0);
        r.uiTransform();
        // grassy foreground
        ctx.fillStyle = '#2f7a2f'; ctx.fillRect(0, H * 0.86, W, H);
        ctx.fillStyle = '#48b046'; ctx.fillRect(0, H * 0.86, W, 6);
      }
      if (this.state === 'title') { UI.drawTitle(this); if (UI.achievementsOpen) UI.drawAchievements(this); if (UI.raceEditorOpen) Races.drawEditor(this); if (UI.modsOpen) ModList.draw(this); } else UI.drawLoading(this);
      UI.drawCursor(this);
      return;
    }
    // play: interpolate entity positions between the last two physics ticks so movement is
    // smooth at any refresh rate, then draw with an integer camera
    const w = this.world;
    const hour = w.hour();
    const alpha = clamp(this.acc * TICK_RATE, 0, 1);
    const things = this.movingThings();
    for (const e of things) {
      e._rx = e.x; e._ry = e.y;
      if (e.px != null && Math.abs(e.x - e.px) < 200 && Math.abs(e.y - e.py) < 200) { e.x = e.px + (e.x - e.px) * alpha; e.y = e.py + (e.y - e.py) * alpha; }
    }
    this.updateCamera();
    FX.applyShake(this);
    r.drawSky(w, this.cam, hour);
    r.drawScene(this);
    r.drawEntities(this);
    // lighting
    const pad = 12;
    const lx0 = Math.floor(this.cam.x / TILE) - pad, ly0 = Math.floor(this.cam.y / TILE) - pad;
    const lw = Math.ceil(r.vw / TILE) + pad * 2 + 2, lh = Math.ceil(r.vh / TILE) + pad * 2 + 2;
    const p = this.player;
    const sel = p.selectedItem;
    if (sel && (sel.id === 'torch' || sel.id === 'lantern') && !p.dead) this.lighting.extraLights.push({ x: p.cx / TILE, y: p.cy / TILE, r: 0.9, g: 0.75, b: 0.5 });
    for (const e of this.enemies) if (e.type === 'lava_slime' || e.type === 'hell_bat') this.lighting.extraLights.push({ x: e.cx / TILE, y: e.cy / TILE, r: 0.8, g: 0.35, b: 0.1 });
    this.lighting.compute(w, lx0, ly0, lw, lh);
    r.composite(this);
    r.updateMap(this);
    // world-space texts
    for (const t of this.damageTexts) {
      const sx = (t.x - this.cam.x) * r.zoom, sy = (t.y - this.cam.y) * r.zoom;
      ctx.globalAlpha = clamp(t.life / 20, 0, 1);
      drawText(ctx, t.text, sx, sy, { size: t.crit ? 26 : 18, align: 'center', color: t.color, lineWidth: t.crit ? 4 : 3 });
    }
    ctx.globalAlpha = 1;
    // NPC / companion chat bubbles
    for (const n of [...this.npcs, ...this.companions]) {
      if (!n.emote) continue;
      const bx = (n.cx - this.cam.x) * r.zoom, by = (n.y - this.cam.y) * r.zoom - 34;
      const long = n.emote.length > 2, tw = long ? measureText(ctx, n.emote, 13) + 16 : 32;
      ctx.fillStyle = '#fff'; roundRect(ctx, bx - tw / 2, by - 12, tw, 24, 8); ctx.fill();
      ctx.beginPath(); ctx.moveTo(bx - 4, by + 12); ctx.lineTo(bx + 4, by + 12); ctx.lineTo(bx, by + 18); ctx.closePath(); ctx.fill();
      drawText(ctx, n.emote, bx, long ? by - 6 : by - 8, { size: long ? 13 : 16, align: 'center', color: '#222', outline: null });
    }
    // NPC name on hover
    for (const n of this.npcs) {
      if (this.mouse.wx >= n.x - 8 && this.mouse.wx <= n.x + n.w + 8 && this.mouse.wy >= n.y - 8 && this.mouse.wy <= n.y + n.h + 8)
        drawText(ctx, `${n.name} the ${n.role}`, (n.cx - this.cam.x) * r.zoom, (n.y - this.cam.y) * r.zoom - 24, { size: 16, align: 'center', color: '#a0ffa0' });
    }
    // companions: name + health bar
    for (const c of this.companions) {
      const sx = (c.cx - this.cam.x) * r.zoom, sy = (c.y - this.cam.y) * r.zoom;
      if (this.mouse.wx >= c.x - 8 && this.mouse.wx <= c.x + c.w + 8 && this.mouse.wy >= c.y - 8 && this.mouse.wy <= c.y + c.h + 8) drawText(ctx, c.ko > 0 ? `${c.title} - knocked out (right click to help)` : c.title, sx, sy - 24, { size: 16, align: 'center', color: '#a0d0ff' });
      if (c.hp < c.maxHp || c.ko > 0) { const by = (c.y + c.h - this.cam.y) * r.zoom + 6; ctx.fillStyle = '#300'; ctx.fillRect(sx - 20, by, 40, 5); ctx.fillStyle = c.ko > 0 ? '#808080' : '#40c040'; ctx.fillRect(sx - 20, by, 40 * clamp(c.hp / c.maxHp, 0, 1), 5); }
      if (c.ko > 0) drawText(ctx, 'zzz', sx + 14, sy + 10, { size: 14, color: '#c0c0ff' });
    }
    // enemy health bars
    for (const e of this.enemies) {
      if (e.hp < e.maxHp) {
        const sx = (e.cx - this.cam.x) * r.zoom, sy = (e.y + e.h - this.cam.y) * r.zoom + 6;
        ctx.fillStyle = '#300'; ctx.fillRect(sx - 20, sy, 40, 6);
        ctx.fillStyle = '#e03030'; ctx.fillRect(sx - 20, sy, 40 * clamp(e.hp / e.maxHp, 0, 1), 6);
      }
    }
    // Boss Checklist: off-screen boss radar
    if (this.boss && !this.boss.dead) {
      const b = this.boss, sx = (b.cx - this.cam.x) * r.zoom, sy = (b.cy - this.cam.y) * r.zoom;
      if (sx < 0 || sy < 0 || sx > W || sy > H) {
        const cxs = W / 2, cys = H / 2, ang = Math.atan2(sy - cys, sx - cxs);
        const ex = clamp(cxs + Math.cos(ang) * 10000, 40, W - 40), ey = clamp(cys + Math.sin(ang) * 10000, 60, H - 100);
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
        ctx.fillStyle = 'rgba(255,80,80,0.9)'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -10); ctx.lineTo(-4, 0); ctx.lineTo(-10, 10); ctx.closePath(); ctx.fill();
        ctx.restore();
        drawText(ctx, `${b.name}  ${Math.round(dist(b.cx, b.cy, this.player.cx, this.player.cy) / TILE)} blocks`, ex, ey + 18, { size: 13, align: 'center', color: '#ffb0b0' });
      }
    }
    UI.drawHUD(this);
    BiomeTitles.draw(this);
    Fishing.draw(this);
    Gensokyo.draw(this);
    Structures.drawWorld(this); Fargo.draw(this); FX.drawOverlay(this); Events.draw(this); Pillars.draw(this); Equipment.draw(this);
    Calamity.draw(this); Thorium.draw(this); ManaOverload.draw(this); StarsAbove.draw(this); Races.draw(this); WotG.draw(this); Subworlds.draw(this); ModLib.drawScanner(this);
    Fables.draw(this);
    ModLib.emit('drawHud', this);
    if (UI.arrayOpen) StarsAbove.drawArray(this);
    if (UI.albumOpen) Photography.drawAlbum(this);
    if (UI.structOpen) Structures.drawPanel(this);
    if (UI.raceEditorOpen) Races.drawEditor(this);
    if (this.settingsOpen) UI.drawSettings(this);
    if (BossLog.open) UI.drawBossLog(this);
    UI.drawCursor(this);
    for (const e of things) { e.x = e._rx; e.y = e._ry; }
    FX.removeShake(this);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.game = game;
  game.init();
});
