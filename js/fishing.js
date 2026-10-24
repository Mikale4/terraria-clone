// ---------------------------------------------------------------------------
// Fishing (poles, bait, bobbers, lake size, fishing power, bites, fish, junk,
// crates) and the Auto Fisher mod: automatic casting & reeling, junk filtering,
// crate opening, auto-sell, multiple lines, infinite bait, fishing while
// swimming, an info display (lake size, liquid, power, catches, forecast) and
// catch records.
// ---------------------------------------------------------------------------
'use strict';

// Items --------------------------------------------------------------------------
function defFishItem(id, name, o) {
  defItem(id, Object.assign({ name, max: 99 }, o));
  ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id];
}
const drawPole = (col) => (x) => { x.fillStyle = col; for (let i = 0; i < 12; i++) x.fillRect(1 + i, 14 - i, 2, 2); x.strokeStyle = '#d0d0d0'; x.lineWidth = 1; x.beginPath(); x.moveTo(13.5, 2.5); x.lineTo(13.5, 9.5); x.stroke(); x.fillStyle = '#ff4040'; x.fillRect(12, 9, 3, 3); x.fillStyle = '#fff'; x.fillRect(12, 9, 3, 1); };
defFishItem('wooden_fishing_pole', 'Wood Fishing Pole', { max: 1, fishingPole: true, fishingPower: 5, tooltip: '5% fishing power. Cast into a lake with bait in your inventory, click again to reel in', value: 200, drawIcon: drawPole('#8b5a2b') });
defFishItem('reinforced_fishing_pole', 'Reinforced Fishing Pole', { max: 1, fishingPole: true, fishingPower: 15, rarity: 1, tooltip: '15% fishing power', value: 1000, drawIcon: drawPole('#9aa0b0') });
defFishItem('golden_fishing_pole', 'Golden Fishing Rod', { max: 1, fishingPole: true, fishingPower: 50, rarity: 3, tooltip: '50% fishing power', value: 100000, drawIcon: drawPole('#e0b040') });
RECIPES.push({ result: 'wooden_fishing_pole', count: 1, station: 'workbench', ing: [['wood', 8]] });
RECIPES.push({ result: 'reinforced_fishing_pole', count: 1, station: 'anvil', ing: [['iron_bar', 8]] });
const drawWorm = (col) => (x) => { x.strokeStyle = col; x.lineWidth = 3; x.beginPath(); x.moveTo(2, 10); x.quadraticCurveTo(5, 3, 8, 8); x.quadraticCurveTo(11, 13, 14, 6); x.stroke(); x.fillStyle = '#000'; x.fillRect(13, 5, 1, 1); };
defFishItem('worm', 'Worm', { bait: 25, tooltip: '25% bait power. Found in tall grass and under grass blocks', value: 200, drawIcon: drawWorm('#e08080') });
defFishItem('enchanted_nightcrawler', 'Enchanted Nightcrawler', { bait: 35, rarity: 1, tooltip: '35% bait power', value: 400, drawIcon: drawWorm('#c080ff') });
defFishItem('firefly_bait', 'Firefly', { bait: 20, tooltip: '20% bait power. Caught at night on the surface', value: 100, drawIcon: (x) => { x.fillStyle = '#404040'; x.fillRect(5, 6, 6, 5); x.fillStyle = '#ffe060'; x.fillRect(9, 7, 4, 3); x.fillStyle = 'rgba(200,220,255,0.6)'; x.fillRect(4, 3, 4, 3); x.fillRect(8, 3, 4, 3); } });
RECIPES.push({ result: 'enchanted_nightcrawler', count: 1, station: 'workbench', ing: [['worm', 1], ['fallen_star', 1]] });
// fish
const drawFish = (a, b) => (x) => { x.fillStyle = a; x.beginPath(); x.ellipse(7, 8, 6, 3.5, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(12, 8); x.lineTo(15, 4); x.lineTo(15, 12); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(3, 6, 6, 1); x.fillStyle = '#000'; x.fillRect(3, 7, 1, 1); };
const FISH = {
  bass: { name: 'Bass', value: 250, common: true, biome: null, col: ['#7a9a60', '#a0c080'] },
  trout: { name: 'Trout', value: 250, common: true, biome: null, col: ['#a08060', '#c0a080'] },
  salmon: { name: 'Salmon', value: 300, common: true, biome: null, col: ['#e07060', '#ffa090'] },
  atlantic_cod: { name: 'Atlantic Cod', value: 300, biome: BIOME.SNOW, col: ['#607080', '#90a0b0'] },
  flounder: { name: 'Flounder', value: 300, biome: BIOME.DESERT, col: ['#c0a060', '#e0c080'] },
  neon_tetra: { name: 'Neon Tetra', value: 300, biome: BIOME.JUNGLE, col: ['#40c0ff', '#ff4080'] },
  armored_cavefish: { name: 'Armored Cavefish', value: 400, underground: true, col: ['#808090', '#b0b0c0'] },
  golden_carp: { name: 'Golden Carp', value: 100000, rare: true, rarity: 3, col: ['#ffd040', '#fff0a0'] },
  reaver_shark: { name: 'Reaver Shark', value: 50000, rare: true, rarity: 2, tool: 'pick', power: 59, useTime: 16, damage: 15, col: ['#506070', '#a0b0c0'], max: 1, tooltip: '59% pickaxe power. Can mine hellstone!' },
};
for (const id in FISH) { const f = FISH[id]; defFishItem(id, f.name, { max: f.max || 99, value: f.value, rarity: f.rarity || 0, tool: f.tool || null, power: f.power || 0, useTime: f.useTime || 20, damage: f.damage || 0, tooltip: f.tooltip || (f.rare ? 'A very rare catch' : 'Cook it at a Furnace, or sell it'), drawIcon: drawFish(f.col[0], f.col[1]), fish: true }); }
defFishItem('cooked_fish', 'Cooked Fish', { consumable: true, heal: 60, food: true, wellFed: true, tooltip: 'Restores 60 life. Grants Well Fed (+2 defense, +5% damage) for 5 minutes', value: 500, drawIcon: (x) => { x.fillStyle = '#c08040'; x.beginPath(); x.ellipse(8, 8, 6, 4, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#e0a060'; x.fillRect(4, 6, 8, 1); x.fillStyle = '#8a6030'; x.fillRect(11, 4, 4, 8); } });
for (const id of ['bass', 'trout', 'salmon', 'atlantic_cod', 'flounder', 'neon_tetra', 'armored_cavefish']) RECIPES.push({ result: 'cooked_fish', count: 1, station: 'furnace', ing: [[id, 1]] });
// junk
defFishItem('old_shoe', 'Old Shoe', { tooltip: 'Junk. Someone lost this in the lake', value: 0, drawIcon: (x) => { x.fillStyle = '#6a4a2a'; x.fillRect(2, 9, 12, 5); x.fillRect(8, 4, 6, 6); x.fillStyle = '#4a3020'; x.fillRect(2, 13, 12, 1); } });
defFishItem('seaweed_junk', 'Seaweed', { tooltip: 'Junk. Slimy and useless', value: 0, drawIcon: (x) => { x.strokeStyle = '#2a7a3a'; x.lineWidth = 2; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(4 + i * 4, 15); x.quadraticCurveTo(2 + i * 4, 8, 5 + i * 4, 2); x.stroke(); } } });
defFishItem('tin_can', 'Tin Can', { tooltip: 'Junk. Rusty', value: 0, drawIcon: (x) => { x.fillStyle = '#a0a0a8'; x.fillRect(4, 3, 8, 11); x.fillStyle = '#d0d0d8'; x.fillRect(4, 3, 8, 2); x.fillStyle = '#806050'; x.fillRect(6, 8, 4, 3); } });
const FISH_JUNK = ['old_shoe', 'seaweed_junk', 'tin_can'];
// crates
const drawCrate = (a, b) => (x) => { x.fillStyle = a; x.fillRect(1, 3, 14, 11); x.fillStyle = b; x.fillRect(1, 3, 14, 1); x.fillRect(1, 8, 14, 1); x.fillRect(1, 13, 14, 1); x.fillRect(1, 3, 1, 11); x.fillRect(14, 3, 1, 11); x.fillRect(7, 3, 2, 11); };
const CRATES = {
  wooden_crate: { name: 'Wooden Crate', value: 1000, rarity: 0, loot: [['wood', 20, 50, 1], ['copper_bar', 3, 8, 0.5], ['iron_bar', 3, 8, 0.5], ['torch', 5, 15, 0.5], ['lesser_healing', 1, 3, 0.35], ['worm', 2, 5, 0.3], ['aglet', 1, 1, 0.05], ['anklet_of_the_wind', 1, 1, 0.03]], coins: [1000, 5000] },
  iron_crate: { name: 'Iron Crate', value: 5000, rarity: 1, loot: [['iron_bar', 6, 12, 0.7], ['silver_bar', 5, 10, 0.5], ['gold_bar', 3, 6, 0.3], ['lesser_healing', 2, 4, 0.5], ['fallen_star', 1, 3, 0.2], ['cloud_in_a_bottle', 1, 1, 0.08], ['lucky_horseshoe', 1, 1, 0.08], ['shackle', 1, 1, 0.1], ['enchanted_nightcrawler', 2, 4, 0.3]], coins: [5000, 15000] },
  golden_crate: { name: 'Golden Crate', value: 20000, rarity: 2, loot: [['gold_bar', 8, 16, 1], ['diamond', 1, 3, 0.4], ['life_crystal', 1, 1, 0.35], ['fallen_star', 3, 6, 0.4], ['hermes_boots', 1, 1, 0.12], ['cobalt_shield', 1, 1, 0.12], ['golden_fishing_pole', 1, 1, 0.05], ['mana_crystal', 1, 1, 0.25]], coins: [20000, 50000] },
};
for (const id in CRATES) { const c = CRATES[id]; defFishItem(id, c.name, { crate: true, value: c.value, rarity: c.rarity, tooltip: 'Right-click / use to open. Contains loot', drawIcon: drawCrate(id === 'wooden_crate' ? '#9a6a3a' : id === 'iron_crate' ? '#8a8a98' : '#e0b040', id === 'wooden_crate' ? '#6a4520' : id === 'iron_crate' ? '#5e6070' : '#a07020') }); ITEMS[id].onUse = (game, slot) => Fishing.openCrate(game, slot); }
// Auto Fisher accessory + Tackle Box
defAccessory('auto_fisher', 'Auto Fisher', { tooltip: 'Automatically casts and reels a fishing pole while one is held. Configure it in Settings > Mod settings', value: 30000, recipe: [['iron_bar', 10], ['wood', 20], ['gel', 5]], station: 'anvil', rarity: 2 });
defAccessory('tackle_box', 'Tackle Box', { tooltip: 'Bait has a 50% chance not to be consumed', value: 20000, recipe: [['iron_bar', 6], ['wood', 10]], station: 'anvil', rarity: 1 });
ITEMS.auto_fisher.drawIcon = (x) => { x.fillStyle = '#3a4a5a'; x.fillRect(2, 5, 12, 9); x.fillStyle = '#60c0ff'; x.fillRect(4, 7, 8, 5); x.fillStyle = '#8b5a2b'; x.fillRect(11, 1, 2, 6); x.fillStyle = '#ff4040'; x.fillRect(6, 9, 2, 2); };
ITEMS.tackle_box.drawIcon = (x) => { x.fillStyle = '#4a7a3a'; x.fillRect(2, 5, 12, 9); x.fillStyle = '#6a9a5a'; x.fillRect(2, 5, 12, 2); x.fillStyle = '#c0c0c0'; x.fillRect(6, 3, 4, 3); x.fillStyle = '#e08080'; x.fillRect(4, 9, 3, 2); x.fillStyle = '#ffe060'; x.fillRect(9, 9, 3, 2); };

// Bobber -------------------------------------------------------------------------
class Bobber extends Entity {
  constructor(x, y, vx, vy, owner, power) {
    super(x - 3, y - 3, 6, 6);
    this.vx = vx; this.vy = vy; this.owner = owner; this.power = power;
    this.state = 'flying'; this.bite = 0; this.biteTimer = 0; this.lakeSize = 0; this.lava = false; this.t = 0; this.bob = 0; this.fishTimer = 0;
  }
  update(world, game) {
    this.t++;
    if (this.state === 'flying') {
      this.vy += 0.25; this.x += this.vx; this.y += this.vy;
      const tx = this.tileX, ty = this.tileY;
      if (world.isSolidAt(tx, ty)) { this.dead = true; return; }
      if (world.liquidAt(tx, ty) > 60) {
        this.state = 'floating'; this.vx = 0; this.vy = 0;
        this.lava = world.lavaAt(tx, ty) === 1;
        this.lakeSize = Fishing.lakeSize(world, tx, ty);
        for (let i = 0; i < 6; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-1.5, 1.5), rand(-2.5, -0.5), this.lava ? '#ff8020' : '#a0c8ff', 30, 2));
        Audio_.play('splash');
        this.fishTimer = 0;
      }
      if (this.t > 300 || Math.abs(this.cx - this.owner.cx) > 40 * TILE) this.dead = true;
      return;
    }
    // floating: drift to the water surface
    const tx = this.tileX, ty = this.tileY;
    if (world.liquidAt(tx, ty) <= 60 && world.liquidAt(tx, ty + 1) <= 60) { this.dead = true; return; } // lake drained
    if (world.liquidAt(tx, ty - 1) > 60) this.y -= 0.5; else if (world.liquidAt(tx, ty) < 200 && world.liquidAt(tx, ty + 1) > 60) this.y += 0.2;
    this.bob = Math.sin(this.t * 0.08) * 1.2;
    if (this.lava && !this.lavaOk) { if (this.t % 40 === 0) game.addDamageText(this.cx, this.y - 8, 'burning!', '#ff8020'); if (this.t > 200) this.dead = true; return; }
    if (this.bite > 0) { this.bite--; if (this.bite === 0) { Fishing.missed(game, this); } return; }
    if (this.lakeSize < 75) return; // too small to fish in
    // bite chance per tick grows with fishing power
    const pw = Fishing.effectivePower(game, this);
    this.fishTimer++;
    if (this.fishTimer > 30 && Math.random() < pw / 6000) { this.bite = 60; this.bob = 6; Audio_.play('splash'); game.addDamageText(this.cx, this.y - 10, '!', '#80c0ff'); for (let i = 0; i < 5; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-1.5, 1.5), rand(-2, -0.5), '#a0c8ff', 25, 2)); }
    // reel in if the owner walks away / dies
    if (Math.abs(this.owner.cx - this.cx) > 45 * TILE || this.owner.dead) this.dead = true;
  }
  draw(ctx, camX, camY) {
    const o = this.owner;
    const dip = this.bite > 0 ? 5 : this.bob;
    const x = snap(this.cx - camX), y = snap(this.cy - camY + dip);
    // line from the rod tip
    const hx = snap(o.cx + o.dir * 14 - camX), hy = snap(o.y + 6 - camY);
    ctx.strokeStyle = 'rgba(230,230,240,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + x) / 2, Math.max(hy, y) + 10, x, y); ctx.stroke();
    ctx.fillStyle = '#ff4040'; ctx.fillRect(x - 3, y - 3, 6, 3); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, y, 6, 3);
    ctx.fillStyle = '#404040'; ctx.fillRect(x - 1, y - 5, 2, 2);
  }
}

// Fishing system --------------------------------------------------------------------
const Fishing = {
  cfg: { autoCast: true, autoReel: true, filterJunk: true, openCrates: true, autoSell: false, lines: 1, noBait: false, fishInWater: false, info: true },
  load() { try { const c = JSON.parse(localStorage.getItem('autofisher_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('autofisher_cfg', JSON.stringify(this.cfg)); } catch (e) {} },
  bobbers(game) { return game.projectiles.filter(b => b instanceof Bobber && !b.dead); },
  hasAuto(p) { return [...p.accessories, ...Object.values(p.equipment || {})].some(a => a && a.id === 'auto_fisher'); },
  hasTackleBox(p) { return [...p.accessories, ...Object.values(p.equipment || {})].some(a => a && a.id === 'tackle_box'); },
  bait(p) { let best = null; for (const s of p.inventory) if (s && ITEMS[s.id].bait && (!best || ITEMS[s.id].bait > ITEMS[best.id].bait)) best = s; return best; },
  // flood-fill count of connected liquid tiles (capped)
  lakeSize(world, sx, sy) {
    const seen = new Set(), stack = [[sx, sy]]; let n = 0;
    while (stack.length && n < 400) {
      const [x, y] = stack.pop(); const k = x + y * world.w;
      if (seen.has(k) || !world.inBounds(x, y) || world.liquidAt(x, y) <= 60) continue;
      seen.add(k); n++;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    return n;
  },
  // Terraria-style fishing power: pole + bait, lake size penalty, time of day bonus
  effectivePower(game, b) {
    let pw = b.power;
    if (b.lakeSize < 300) pw *= b.lakeSize / 300;
    const h = game.world.hour();
    if ((h >= 4.5 && h < 6) || (h >= 18 && h < 19.5)) pw *= 1.3;
    if (game.world.bloodMoon) pw *= 1.1;
    return pw;
  },
  forecast(game) {
    const h = game.world.hour();
    if ((h >= 4.5 && h < 6) || (h >= 18 && h < 19.5)) return ['Great (dawn/dusk +30%)', '#80ff80'];
    if (game.world.bloodMoon) return ['Good (Blood Moon +10%)', '#ff8080'];
    if (h >= 12 && h < 15) return ['Poor (midday)', '#ffc080'];
    return ['Average', '#ddd'];
  },
  // click with a fishing pole: cast, or reel in
  use(game, slot, it) {
    const p = game.player;
    const mine = this.bobbers(game).filter(b => b.owner === p);
    if (mine.length) { this.reel(game, mine); return; }
    this.cast(game, slot, it, game.mouse.wx, game.mouse.wy);
  },
  cast(game, slot, it, tx, ty, spread = 0) {
    const p = game.player;
    if (p.inWater && !this.cfg.fishInWater) { game.message("You can't fish while swimming!", '#ff8080'); return false; }
    const bait = this.bait(p);
    if (!bait && !this.cfg.noBait) { game.message('You need bait to fish! (worms hide in tall grass)', '#ff8080'); return false; }
    const st = itemStats(slot);
    const power = it.fishingPower + (bait ? ITEMS[bait.id].bait : 15) + (st.damage ? 0 : 0);
    p.dir = tx < p.cx ? -1 : 1;
    const dx = tx - p.cx, dy = ty - p.y, d = Math.hypot(dx, dy) || 1;
    const sp = clamp(d / 30, 4, 11);
    const b = new Bobber(p.cx + p.dir * 10, p.y + 6, dx / d * sp + spread, dy / d * sp - 2, p, power);
    game.projectiles.push(b);
    p.startUse(slot.id, 12); p.armAngle = -1.2;
    Audio_.play('swing');
    return true;
  },
  reel(game, bobbers) {
    const p = game.player;
    for (const b of bobbers) {
      if (b.bite > 0) this.catchSomething(game, b);
      b.dead = true;
    }
    p.startUse(this.activePole(p).id, 10);
  },
  activePole(p) { const s = p.inventory[p.selected]; return s && ITEMS[s.id].fishingPole ? s : null; },
  missed(game, b) { game.addDamageText(b.cx, b.y - 10, 'got away...', '#c0c0c0'); },
  rollCatch(game, b) {
    const pw = this.effectivePower(game, b), w = game.world, p = game.player;
    const biome = w.biome[clamp(b.tileX, 0, w.w - 1)], underground = b.tileY > w.surfaceLine;
    const r = Math.random() * 100;
    // crates: ~10% base, more with power
    if (r < 8 + pw / 10) { const c = Math.random() * 100; return c < pw / 3 ? 'golden_crate' : c < 25 + pw / 2 ? 'iron_crate' : 'wooden_crate'; }
    // junk: lots at low power, none above 50
    if (pw < 50 && Math.random() < (50 - pw) / 50 * 0.55) return choose(FISH_JUNK);
    if (Math.random() < pw / 1500) return 'golden_carp';
    if (underground && Math.random() < pw / 800) return 'reaver_shark';
    if (Math.random() < 0.03 && !w.isDay() && !underground) return 'firefly_bait';
    if (underground && Math.random() < 0.5) return 'armored_cavefish';
    const bf = Object.keys(FISH).find(k => FISH[k].biome === biome);
    if (bf && Math.random() < 0.4) return bf;
    return choose(['bass', 'bass', 'trout', 'salmon']);
  },
  catchSomething(game, b) {
    const p = game.player;
    { const bait = this.bait(p); if (bait && bait.id === 'truffle_worm' && game.world.biome[clamp(b.tileX, 0, game.world.w - 1)] === BIOME.OCEAN && !game.boss && typeof Bosses !== 'undefined') { game.consumeSlot(bait); Bosses.summon(game, 'duke_fishron', { x: b.cx, y: b.cy - 200 }); return; } }
    const id = this.rollCatch(game, b), it = ITEMS[id];
    // records
    const w = game.world; w.fishRecords = w.fishRecords || { total: 0, byId: {}, best: null };
    w.fishRecords.total++; w.fishRecords.byId[id] = (w.fishRecords.byId[id] || 0) + 1;
    if (it.value > (w.fishRecords.best ? ITEMS[w.fishRecords.best].value : -1)) w.fishRecords.best = id;
    p.stats.fishCaught = (p.stats.fishCaught || 0) + 1;
    // bait consumption (Tackle Box: 50% saved)
    if (!this.cfg.noBait) { const bait = this.bait(p); if (bait && !(this.hasTackleBox(p) && Math.random() < 0.5)) game.consumeSlot(bait); }
    // Auto Fisher: filter junk / auto sell / auto open crates
    const auto = this.hasAuto(p);
    if (auto && this.cfg.filterJunk && FISH_JUNK.includes(id)) { game.addDamageText(b.cx, b.y - 10, 'junk (filtered)', '#909090'); Audio_.play('splash'); return; }
    if (auto && this.cfg.openCrates && it.crate) { this.openCrateAt(game, id, p.cx, p.cy); game.addDamageText(b.cx, b.y - 10, it.name + ' (opened)', RARITY_COLORS[it.rarity] || '#fff'); return; }
    if (auto && this.cfg.autoSell && it.fish && !it.tool && !FISH[id].rare) { const v = Math.floor(it.value / 5); p.coins += v; game.addDamageText(b.cx, b.y - 10, `${it.name} sold: ${coinsToString(v)}`, '#ffe060'); Audio_.play('coin'); return; }
    // fly the item to the player
    const d = new ItemDrop(b.cx, b.cy, id, 1, it.fish || it.crate || it.bait || FISH_JUNK.includes(id) ? null : undefined);
    const dx = p.cx - b.cx, dy = p.cy - b.cy, dd = Math.hypot(dx, dy) || 1;
    d.vx = dx / dd * 6; d.vy = dy / dd * 6 - 4; d.pickupDelay = 0;
    game.drops.push(d);
    game.addDamageText(b.cx, b.y - 10, it.name, RARITY_COLORS[it.rarity] || '#fff');
    Audio_.play('splash');
    if (game.pets) game.pets.unlock('fisherman');
    if (typeof ModLib !== 'undefined') ModLib.emit('fishCaught', game, id);
  },
  openCrate(game, slot) {
    this.openCrateAt(game, slot.id, game.player.cx, game.player.cy);
    game.consumeSlot(slot);
  },
  openCrateAt(game, id, x, y) {
    const c = CRATES[id]; const p = game.player;
    let n = 0;
    for (const [iid, lo, hi, ch] of c.loot) if (Math.random() < ch) { const cnt = randInt(lo, hi); const left = p.addItem(iid, cnt, ITEMS[iid].accessory || ITEMS[iid].tool ? undefined : null); if (left) game.dropItem(x, y, iid, left); n++; }
    if (n === 0) { const [iid, lo, hi] = c.loot[0]; const cnt = randInt(lo, hi); if (p.addItem(iid, cnt, null)) game.dropItem(x, y, iid, cnt); }
    p.coins += randInt(c.coins[0], c.coins[1]);
    Audio_.play('open');
    for (let i = 0; i < 12; i++) game.particles.push(new Particle(x, y, rand(-3, 3), rand(-4, 0), '#ffe060', 40, 2));
  },
  onTileBroken(game, tx, ty, id) {
    if (id === T.PLANT && Math.random() < 0.12) game.dropItem(tx * TILE + 8, ty * TILE + 8, 'worm', 1, null, null);
    else if (id === T.GRASS && Math.random() < 0.05) game.dropItem(tx * TILE + 8, ty * TILE + 8, 'worm', 1, null, null);
  },
  // Auto Fisher tick: cast up to cfg.lines bobbers, reel bites automatically
  tick(game) {
    const p = game.player;
    if (game.state !== 'play' || p.dead) return;
    const pole = this.activePole(p);
    if (!pole || !this.hasAuto(p) || game.dialog || game.settingsOpen) return;
    const mine = this.bobbers(game).filter(b => b.owner === p);
    if (this.cfg.autoReel) { const biting = mine.filter(b => b.bite > 0 && b.bite < 50); if (biting.length) { this.reel(game, biting); return; } }
    if (this.cfg.autoCast && mine.length < this.cfg.lines && p.useTimer <= 0 && game.world.time % 30 === 0) {
      // aim at the nearest water within reach, else where the mouse is
      const t = this.nearestWater(game) || { x: game.mouse.wx, y: game.mouse.wy };
      if (this.nearestWater(game)) this.cast(game, pole, ITEMS[pole.id], t.x, t.y, rand(-1.5, 1.5));
    }
  },
  nearestWater(game) {
    const p = game.player, w = game.world;
    let best = null, bd = 1e9;
    for (let dx = -20; dx <= 20; dx++) for (let dy = -6; dy <= 14; dy++) {
      const x = p.tileX + dx, y = p.tileY + dy;
      if (w.liquidAt(x, y) > 100 && w.lavaAt(x, y) !== 1 && w.liquidAt(x, y - 1) <= 60 && !w.isSolidAt(x, y - 1)) { const d = dx * dx + dy * dy; if (d < bd && Math.abs(dx) > 2) { bd = d; best = { x: x * TILE + 8, y: y * TILE + 4 }; } }
    }
    return best;
  },
  // HUD info panel while holding a fishing pole
  draw(game) {
    const p = game.player, pole = this.activePole(p);
    if (!pole || !this.cfg.info || game.inventoryOpen) return;
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const mine = this.bobbers(game).filter(b => b.owner === p);
    const bait = this.bait(p);
    const w = game.world, rec = w.fishRecords || { total: 0, best: null };
    const lines = [];
    const b = mine[0];
    if (b && b.state === 'floating') lines.push([`Lake: ${b.lakeSize >= 400 ? '400+' : b.lakeSize} tiles (${b.lava ? 'Lava' : 'Water'})${b.lakeSize < 75 ? ' - too small!' : b.lakeSize < 300 ? ' - small, reduced power' : ''}`, b.lakeSize < 75 ? '#ff8080' : '#ddd']);
    else { const nw = this.nearestWater(game); lines.push([nw ? 'Water nearby - cast your line' : 'No water nearby', nw ? '#a0d0ff' : '#aaa']); }
    const pw = b ? this.effectivePower(game, b) : ITEMS[pole.id].fishingPower + (bait ? ITEMS[bait.id].bait : 0);
    lines.push([`Fishing power: ${Math.round(pw)}%   Bait: ${bait ? `${ITEMS[bait.id].name} x${bait.count}` : (this.cfg.noBait ? 'not needed' : 'none!')}`, bait || this.cfg.noBait ? '#ddd' : '#ff8080']);
    const fc = this.forecast(game); lines.push([`Forecast: ${fc[0]}`, fc[1]]);
    lines.push([`Catches: ${rec.total}${rec.best ? `   Best: ${ITEMS[rec.best].name}` : ''}`, '#ddd']);
    if (this.hasAuto(p)) lines.push([`Auto Fisher: ${this.cfg.autoCast ? 'cast' : ''}${this.cfg.autoReel ? ' reel' : ''}${this.cfg.filterJunk ? ' filter' : ''}${this.cfg.openCrates ? ' crates' : ''}${this.cfg.autoSell ? ' sell' : ''}   Lines: ${this.cfg.lines}`, '#a0ffa0']);
    if (b && b.bite > 0) lines.push(['BITE! Click to reel in!', '#ffe060']);
    const bw = 340, bh = 14 + lines.length * 18, bx = W - bw - 20, by = H - 110 - bh - (game.pets.pet ? 50 : 0);
    ctx.fillStyle = 'rgba(10,30,50,0.75)'; roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
    let y = by + 6;
    for (const [t, c] of lines) { drawText(ctx, t, bx + 10, y, { size: 13, color: c }); y += 18; }
  },
};
Fishing.load();
