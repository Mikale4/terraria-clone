// ---------------------------------------------------------------------------
// Fargo's Mutant Mod slice: the Mutant (sells every boss summon), Abominationn
// (sells event/utility items), the Lumberjack (wood), infinite ammo & potions
// at high stacks, "sold by" tooltips, instant builds (Instabridge, Dirt
// Instabridge, Instalake, Hellevator), powerful explosives, spawn-rate items
// (Battle Cry / Calming Cry), the World Token, the Super Dummy (with a DPS
// readout) and the Omnistation buff aura.
// ---------------------------------------------------------------------------
'use strict';

function defFItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
defFItem('world_token', 'World Token', { max: 1, rarity: 1, value: 1000, tooltip: 'Teleports you to the world spawn point', drawIcon: (x) => { x.fillStyle = '#e0c060'; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#4080ff'; x.beginPath(); x.arc(8, 8, 3.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#40c040'; x.fillRect(6, 7, 3, 2); }, use: (g, s) => Fargo.worldToken(g) });
RECIPES.push({ result: 'world_token', count: 1, station: 'workbench', ing: [['iron_bar', 5]] });
defFItem('battle_cry', 'Battle Cry', { max: 30, consumable: true, rarity: 1, value: 1000, tooltip: 'Doubles enemy spawn rate and max spawns for 3 minutes', drawIcon: (x) => { x.fillStyle = '#c04040'; x.fillRect(4, 3, 8, 10); x.fillStyle = '#ffe060'; x.fillRect(6, 5, 4, 2); x.fillRect(6, 9, 4, 2); }, onUse: (g, s) => { Fargo.state(g).spawnMult = 2; Fargo.state(g).spawnT = 60 * 180; g.consumeSlot(s); g.message('Battle Cry: double spawns for 3 minutes!', '#ff8080'); } });
defFItem('calming_cry', 'Calming Cry', { max: 30, consumable: true, rarity: 1, value: 1000, tooltip: 'Halves enemy spawns for 3 minutes', drawIcon: (x) => { x.fillStyle = '#4080c0'; x.fillRect(4, 3, 8, 10); x.fillStyle = '#c0e0ff'; x.fillRect(6, 5, 4, 2); x.fillRect(6, 9, 4, 2); }, onUse: (g, s) => { Fargo.state(g).spawnMult = 0.5; Fargo.state(g).spawnT = 60 * 180; g.consumeSlot(s); g.message('Calming Cry: half spawns for 3 minutes.', '#80c0ff'); } });
RECIPES.push({ result: 'battle_cry', count: 1, station: 'workbench', ing: [['rotten_chunk', 2], ['gel', 5]] });
RECIPES.push({ result: 'calming_cry', count: 1, station: 'workbench', ing: [['mushroom', 2], ['gel', 5]] });
const drawBuildIcon = (a, b) => (x) => { x.fillStyle = a; x.fillRect(1, 7, 14, 3); x.fillStyle = b; x.fillRect(1, 7, 14, 1); x.fillStyle = '#ffe060'; x.fillRect(6, 2, 4, 4); };
defFItem('instabridge', 'Instabridge', { max: 10, consumable: true, rarity: 2, value: 20000, tooltip: 'Instantly builds a 200-block platform skybridge at your height', drawIcon: drawBuildIcon('#8a6038', '#b88a5c'), onUse: (g, s) => Fargo.instabridge(g, s, T.PLATFORM) });
defFItem('dirt_instabridge', 'Dirt Instabridge', { max: 10, consumable: true, rarity: 2, value: 10000, tooltip: 'Instantly builds a 200-block dirt bridge at your feet', drawIcon: drawBuildIcon('#7a5230', '#9a6a3a'), onUse: (g, s) => Fargo.instabridge(g, s, T.DIRT) });
defFItem('instalake', 'Instalake', { max: 10, consumable: true, rarity: 2, value: 15000, tooltip: 'Instantly digs and fills a 24x8 lake in front of you (fishable)', drawIcon: (x) => { x.fillStyle = '#4080e0'; x.fillRect(1, 7, 14, 7); x.fillStyle = '#a0c8ff'; x.fillRect(1, 7, 14, 1); x.fillStyle = '#7a5230'; x.fillRect(0, 13, 16, 3); }, onUse: (g, s) => Fargo.instalake(g, s) });
defFItem('hellevator_kit', 'Instant Hellevator', { max: 10, consumable: true, rarity: 2, value: 30000, tooltip: 'Instantly digs a 3-wide shaft with platforms from here to the Underworld', drawIcon: (x) => { x.fillStyle = '#404048'; x.fillRect(5, 0, 6, 16); x.fillStyle = '#8a6038'; x.fillRect(5, 4, 6, 1); x.fillRect(5, 9, 6, 1); x.fillRect(5, 14, 6, 1); x.fillStyle = '#ff6020'; x.fillRect(6, 15, 4, 1); }, onUse: (g, s) => Fargo.hellevator(g, s) });
RECIPES.push({ result: 'instabridge', count: 1, station: 'workbench', ing: [['platform', 150]] });
RECIPES.push({ result: 'dirt_instabridge', count: 1, station: 'workbench', ing: [['dirt', 200]] });
RECIPES.push({ result: 'instalake', count: 1, station: 'workbench', ing: [['bottle', 10], ['gel', 20]] });
RECIPES.push({ result: 'hellevator_kit', count: 1, station: 'anvil', ing: [['bomb', 20], ['platform', 50]] });
defFItem('mega_bomb', 'Mega Bomb', { max: 99, consumable: true, rarity: 2, value: 5000, explosive: { radius: 15, damage: 200, tiles: true }, tooltip: 'A powerful explosive that clears a 15-block radius', drawIcon: (x) => { x.fillStyle = '#202028'; x.beginPath(); x.arc(8, 9, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ff2020'; x.fillRect(5, 7, 6, 3); x.fillStyle = '#ffe060'; x.fillRect(11, 1, 2, 4); } });
RECIPES.push({ result: 'mega_bomb', count: 1, station: 'anvil', ing: [['bomb', 10], ['gold_bar', 1]] });
defFItem('super_dummy', 'Super Dummy', { max: 5, rarity: 1, value: 5000, tooltip: 'Places an unkillable training dummy that shows your DPS. Right-click it to pick it up', drawIcon: (x) => { x.fillStyle = '#c0a060'; x.fillRect(6, 2, 4, 4); x.fillRect(5, 6, 6, 6); x.fillStyle = '#8a6038'; x.fillRect(7, 12, 2, 4); x.fillStyle = '#ff4040'; x.fillRect(7, 8, 2, 2); }, use: (g, s) => Fargo.placeDummy(g, s) });
RECIPES.push({ result: 'super_dummy', count: 1, station: 'workbench', ing: [['wood', 20], ['cobweb', 5]] });
defFItem('omnistation', 'Omnistation', { max: 5, rarity: 2, value: 20000, tooltip: 'Places a station: everyone within 12 blocks gets Cozy Fire regeneration and Well Fed. Right-click to pick up', drawIcon: (x) => { x.fillStyle = '#3a3a48'; x.fillRect(3, 6, 10, 8); x.fillStyle = '#ffb040'; x.fillRect(5, 8, 2, 2); x.fillStyle = '#40e060'; x.fillRect(9, 8, 2, 2); x.fillStyle = '#60a0ff'; x.fillRect(7, 11, 2, 2); x.fillStyle = '#8a8a9a'; x.fillRect(7, 2, 2, 4); }, use: (g, s) => Fargo.placeStation(g, s) });
RECIPES.push({ result: 'omnistation', count: 1, station: 'anvil', ing: [['gold_bar', 5], ['cooked_fish', 3], ['torch', 20]] });
defFItem('mutant_plushie', 'Mutant Plushie', { max: 1, rarity: 3, value: 50000, tooltip: 'A plushie of the Mutant. Cute. Slightly unsettling', drawIcon: (x) => { x.fillStyle = '#60c0ff'; x.fillRect(4, 3, 8, 10); x.fillStyle = '#f0f0f0'; x.fillRect(5, 5, 2, 2); x.fillRect(9, 5, 2, 2); x.fillStyle = '#ff80c0'; x.fillRect(6, 9, 4, 1); } });

NPC_NAMES.Mutant = ['Mutant'];
NPC_ROLES.Mutant = {
  town: true, hairStyle: 1,
  colors: { skin: '#60c0ff', hair: '#e0f0ff', shirt: '#2a4a8a', pants: '#1a2a4a', shoes: '#101020', eye: '#ff4040' },
  weapon: { kind: 'seal', damage: 30, rate: 15, speed: 9 }, buttons: ['Shop'], shop: 'Mutant',
  condition: (g) => Object.keys(g.world.bossesDefeated || {}).length + (g.world.bossDefeated ? 1 : 0) >= 1,
  lines: ["I sell boss summons. All of them. Yes, even that one.", "Killed a boss once? Good. Now do it again, cheaper.", "My plushie is not for sale. ...Fine, it is.", "Energized bosses? Not today. Maybe tomorrow.", "The Abominationn is my brother. Don't ask."],
};
SHOPS.Mutant = [
  { id: 'slime_crown', price: 20000 }, { id: 'suspicious_eye', price: 20000 }, { id: 'sealed_ribbon', price: 30000 }, { id: 'suspicious_egg', price: 30000 }, { id: 'desert_medallion', price: 30000 }, { id: 'storm_flare', price: 30000 },
  { id: 'spatial_tear', price: 60000 }, { id: 'divine_monolith', price: 500000, cond: (g) => !!(g.world.bossesDefeated || {}).nameless_deity },
  { id: 'battle_cry', price: 2000 }, { id: 'calming_cry', price: 2000 }, { id: 'super_dummy', price: 5000 }, { id: 'mutant_plushie', price: 100000 },
];
NPC_NAMES.Lumberjack = ['Paul', 'Brawny', 'Jack', 'Oak', 'Birch', 'Cedar'];
NPC_ROLES.Lumberjack = {
  town: true, hairStyle: 0,
  colors: { skin: '#f2c6a0', hair: '#5a3a2a', shirt: '#c03030', pants: '#3a4a6a', shoes: '#2a2a2a', eye: '#3a3a3a' },
  weapon: { kind: 'knife', damage: 18, rate: 28, speed: 8 }, buttons: ['Shop'], shop: 'Lumberjack',
  condition: (g) => g.player.countItem('wood') >= 100 || (g.player.stats.blocksMined || 0) >= 300,
  lines: ["Wood. Lots of it. Ask me how.", "Every tree you cut, plant an acorn. That's the deal.", "I don't sell axes. I sell the results.", "The Dryad glares at me every time I walk by.", "Planks, logs, boards, timber... it's all wood, friend."],
};
SHOPS.Lumberjack = [{ id: 'wood', price: 15 }, { id: 'acorn', price: 20 }, { id: 'platform', price: 8 }, { id: 'workbench', price: 200 }, { id: 'torch', price: 40 }];

// runtime -----------------------------------------------------------------------------------
class SuperDummy extends Enemy {
  constructor(x, y) { super(x, y, 20, 42, { name: 'Super Dummy', hp: 1e9, damage: 0, defense: 0, kbResist: 1, blood: '#c0a060', drops: [] }); this.isDummy = true; this.type = 'super_dummy'; this.hits = []; this.dps = 0; }
  hit(dmg, fromX, kb, game, swingId = null, crit = false) {
    if (swingId != null) { if (this.hitBy.has(swingId)) return false; this.hitBy.add(swingId); }
    if (crit) dmg *= 2; const real = Math.max(1, Math.round(dmg));
    this.hits.push([game.world.time, real]); this.hitFlash = 8; this.lastHitDamage = real;
    game.addDamageText(this.cx, this.y, real, crit ? '#ff6a2a' : '#ffb060', crit); Audio_.play('hit');
    return false;
  }
  update(world, game) { this.t++; if (this.hitFlash > 0) this.hitFlash--; this.debuffs = {}; this.hp = this.maxHp; this.applyGravity(); this.vx = 0; this.moveAndCollide(world); const now = game.world.time; this.hits = this.hits.filter(h => now - h[0] <= 180); this.dps = Math.round(this.hits.reduce((a, h) => a + h[1], 0) / 3); }
  touchPlayer() {}
  draw(ctx, camX, camY) { this.drawShadowFlash(ctx); const x = snap(this.x - camX), y = snap(this.y - camY); ctx.fillStyle = '#8a6038'; ctx.fillRect(x + 9, y + 24, 3, 18); ctx.fillStyle = '#c0a060'; ctx.fillRect(x + 4, y + 8, 12, 18); ctx.fillRect(x + 6, y, 8, 8); ctx.fillStyle = '#ff4040'; ctx.fillRect(x + 8, y + 14, 4, 4); ctx.fillStyle = '#e0c080'; ctx.fillRect(x, y + 12, 4, 3); ctx.fillRect(x + 16, y + 12, 4, 3); ctx.globalAlpha = 1; if (this.hits.length) drawText(ctx, `${this.dps} DPS`, x + 10, y - 16, { size: 12, align: 'center', color: '#ffe060' }); }
}
const Fargo = {
  state(game) { return ModLib.world(game, 'fargo', () => ({ spawnMult: 1, spawnT: 0, dummies: [], stations: [] })); },
  infinite(slot) { const it = ITEMS[slot.id]; if (!it) return false; if ((it.heal || it.mana) && it.consumable && slot.count >= 30) return true; if ((slot.id === 'musket_ball' || it.thrown || slot.id === 'ofuda') && slot.count >= 999) return true; return false; },
  spawnRate(game) { const s = this.state(game); return s.spawnT > 0 ? s.spawnMult : 1; },
  tick(game) {
    const s = this.state(game), p = game.player;
    if (s.spawnT > 0) s.spawnT--;
    // omnistation auras
    for (const st of s.stations) { if (dist(st.x, st.y, p.cx, p.cy) < 12 * TILE) { p.addBuff('Cozy Fire', 60); p.addBuff('Well Fed', 60); } if (game.world.time % 20 === 0) game.particles.push(new Particle(st.x + rand(-6, 6), st.y - 10, 0, -0.8, choose(['#ffb040', '#40e060', '#60a0ff']), 25, 2)); game.lighting.extraLights.push({ x: st.x / TILE, y: st.y / TILE, r: 0.6, g: 0.5, b: 0.3 }); }
    // keep dummies alive across loads (re-create if missing)
    if (game.world.time % 60 === 0) for (const d of s.dummies) if (!game.enemies.some(e => e.isDummy && e.dummyId === d.id)) { const e = new SuperDummy(d.x, d.y); e.dummyId = d.id; game.enemies.push(e); }
  },
  worldToken(game) { const p = game.player, w = game.world; if (Subworlds.current) { game.message("The token doesn't work here.", '#ff8080'); return; } p.x = w.spawnX * TILE - 10; p.y = (w.spawnY - 3) * TILE; p.vx = p.vy = 0; p.fallStart = null; FX.burst(game, p.cx, p.cy, 20, '#60c0ff', 4, 30); game.message('Teleported to spawn.', '#80c0ff'); Audio_.play('menu'); p.useTimer = 30; },
  instabridge(game, slot, tile) {
    const p = game.player, w = game.world; const y = tile === T.PLATFORM ? p.tileY + 3 : Math.floor((p.y + p.h) / TILE);
    let n = 0; for (let x = p.tileX - 100; x <= p.tileX + 100; x++) { if (!w.inBounds(x, y)) continue; if (w.get(x, y) === T.AIR) { w.setTile(x, y, tile); n++; } }
    game.consumeSlot(slot); game.message(`Built a ${n}-block bridge.`, '#ffe75a'); Audio_.play('place');
  },
  instalake(game, slot) {
    const p = game.player, w = game.world; const x0 = p.tileX + p.dir * 3, y0 = Math.floor((p.y + p.h) / TILE);
    for (let x = 0; x < 24; x++) for (let y = 0; y < 8; y++) { const tx = x0 + p.dir * x, ty = y0 + y; if (!w.inBounds(tx, ty)) continue; const edge = y === 7 || x === 0 || x === 23; if (edge) { if (!w.isSolidAt(tx, ty)) w.setTile(tx, ty, T.DIRT); } else { w.setTile(tx, ty, T.AIR); w.liquid[w.idx(tx, ty)] = 255; w.lava[w.idx(tx, ty)] = 0; w.liquidDirty.add(w.idx(tx, ty)); } }
    game.consumeSlot(slot); game.message('Instalake: a fresh lake, ready for fishing.', '#80c0ff'); Audio_.play('splash');
  },
  hellevator(game, slot) {
    const p = game.player, w = game.world; const x0 = p.tileX - 1; let n = 0;
    for (let y = p.tileY + 3; y < w.h - 40; y++) { for (let x = x0; x <= x0 + 2; x++) { if (w.get(x, y) !== T.AIR) { w.setTile(x, y, T.AIR); n++; } w.liquid[w.idx(x, y)] = 0; w.lava[w.idx(x, y)] = 0; } if (y % 8 === 0) w.setTile(x0 + 1, y, T.PLATFORM); }
    game.consumeSlot(slot); game.message(`Hellevator dug (${n} blocks). Mind the drop.`, '#ffe75a'); Audio_.play('break'); FX.shake(4, 20);
  },
  placeDummy(game, slot) {
    const p = game.player, s = this.state(game); if (p.useTimer > 0) return;
    const x = Math.floor(game.mouse.wx / TILE) * TILE, y = Math.floor(game.mouse.wy / TILE) * TILE;
    if (dist(x, y, p.cx, p.cy) > 10 * TILE) return;
    const d = new SuperDummy(x, y - 26); d.dummyId = Date.now(); game.enemies.push(d); s.dummies.push({ id: d.dummyId, x: d.x, y: d.y });
    game.consumeSlot(slot); p.useTimer = 20; Audio_.play('place');
  },
  placeStation(game, slot) {
    const p = game.player, s = this.state(game); if (p.useTimer > 0) return;
    s.stations.push({ x: game.mouse.wx, y: game.mouse.wy });
    game.consumeSlot(slot); p.useTimer = 20; Audio_.play('place'); game.message('Omnistation placed.', '#ffe75a');
  },
  // right-click pickup of dummies / stations
  onRightClick(game) {
    const s = this.state(game), p = game.player;
    for (const e of game.enemies) if (e.isDummy && game.mouse.wx >= e.x && game.mouse.wx < e.x + e.w && game.mouse.wy >= e.y && game.mouse.wy < e.y + e.h) { e.dead = true; s.dummies = s.dummies.filter(d => d.id !== e.dummyId); p.addItem('super_dummy', 1, null); Audio_.play('pickup'); return true; }
    for (const st of s.stations) if (dist(st.x, st.y, game.mouse.wx, game.mouse.wy) < 16) { s.stations = s.stations.filter(x => x !== st); p.addItem('omnistation', 1, null); Audio_.play('pickup'); return true; }
    return false;
  },
  draw(game) {
    const s = this.state(game); const ctx = game.renderer.ctx, z = game.renderer.zoom;
    for (const st of s.stations) { const x = (st.x - game.cam.x) * z, y = (st.y - game.cam.y) * z; ctx.fillStyle = '#3a3a48'; ctx.fillRect(x - 8 * z, y - 6 * z, 16 * z, 12 * z); ctx.fillStyle = '#8a8a9a'; ctx.fillRect(x - 1.5 * z, y - 12 * z, 3 * z, 6 * z); ctx.fillStyle = '#ffb040'; ctx.fillRect(x - 6 * z, y - 3 * z, 3 * z, 3 * z); ctx.fillStyle = '#40e060'; ctx.fillRect(x + 3 * z, y - 3 * z, 3 * z, 3 * z); ctx.fillStyle = '#60a0ff'; ctx.fillRect(x - 1.5 * z, y + 1 * z, 3 * z, 3 * z); }
    if (s.spawnT > 0) drawText(ctx, `${s.spawnMult > 1 ? 'Battle Cry' : 'Calming Cry'}: ${Math.ceil(s.spawnT / 60)}s`, 22, game.renderer.H - 150, { size: 12, color: s.spawnMult > 1 ? '#ff8080' : '#80c0ff' });
  },
};
// "Sold by" tooltips
TooltipHooks.add((stack, item, lines, game) => {
  const sellers = []; for (const role in SHOPS) if (SHOPS[role].some(e => e.id === stack.id)) sellers.push(role);
  if (TRAVELING_POOL.some(e => e.id === stack.id)) sellers.push('Traveling Merchant');
  if (sellers.length) lines.push({ t: `Sold by: ${sellers.join(', ')}`, c: '#a0c0ff' });
  if (Fargo.infinite(stack)) lines.push({ t: 'Infinite (stack is large enough - not consumed)', c: '#ffe75a' });
});
