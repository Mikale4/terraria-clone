// ---------------------------------------------------------------------------
// Goblin Tinkerer (rescued bound in the caverns) + reforging, with an
// "Auto Reforge Plus" style window: draggable & lockable, remembers its
// position, lists every prefix with rarity colours, and reforges automatically
// until one of the selected prefixes lands or the money runs out.
// ---------------------------------------------------------------------------
'use strict';

NPC_NAMES['Goblin Tinkerer'] = ['Arback', 'Dalek', 'Darz', 'Durnok', 'Fahd', 'Fjell', 'Gnudar', 'Grodax', 'Knogs', 'Knub', 'Mobart', 'Mrunok', 'Negurk', 'Nort', 'Nuxatk', 'Ragz', 'Sarx', 'Smador', 'Stazen', 'Stezom', 'Tgerd', 'Tkanus', 'Trogem', 'Xanos', 'Xon'];
SHOPS['Goblin Tinkerer'] = [{ id: 'hook', price: 20000 }, { id: 'bomb', price: 300 }, { id: 'lantern', price: 400 }];
NPC_ROLES['Goblin Tinkerer'] = {
  town: true, hairStyle: 0,
  colors: { skin: '#6a9a5a', hair: '#3a3a3a', shirt: '#7a5a3a', pants: '#4a3a2a', shoes: '#2a2a2a', eye: '#202020' },
  weapon: { kind: 'knife', damage: 14, rate: 28, speed: 8 }, buttons: ['Shop', 'Reforge'], shop: 'Goblin Tinkerer',
  condition: (g) => !!g.world.goblinRescued && !g.npcs.some(n => n.role === 'Goblin Tinkerer'),
  lines: ["Thanks for untying me. Those other goblins are jerks.", "Hey, come over here and look at my wares... and let me fix that weapon's prefix while you're at it.", "Reforging isn't cheap, but a Legendary blade pays for itself.", "Do you have any rope? ...no? Never mind."],
};
NPC_ARRIVAL_ORDER.push('Goblin Tinkerer');

// The bound goblin: a stationary rescue NPC placed underground at world gen
class BoundGoblin extends Entity {
  constructor(x, y) { super(x, y, 20, 42); this.role = 'Bound Goblin'; this.name = 'Bound Goblin'; this.isTown = false; this.dir = 1; this.colors = NPC_ROLES['Goblin Tinkerer'].colors; this.hairStyle = 0; this.emote = null; this.hp = 250; this.maxHp = 250; this.talking = false; this.home = null; this.def = { buttons: [], lines: [], town: false, colors: this.colors }; this.leaveAt = 0; this.shopItems = null; }
  get title() { return 'Bound Goblin'; }
  hit() {}
  update(world, game) { this.updateLiquidState(world); this.applyGravity(); this.moveAndCollide(world); this.vx = 0; }
  draw(ctx, camX, camY) {
    drawHumanoid(ctx, this.x - camX, this.y - camY, { dir: this.dir, walk: null, colors: this.colors, armAngle: null, item: null, hairStyle: 0, sitting: true });
    ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(snap(this.x - camX), snap(this.y - camY + 16)); ctx.lineTo(snap(this.x - camX + 20), snap(this.y - camY + 24)); ctx.moveTo(snap(this.x - camX), snap(this.y - camY + 24)); ctx.lineTo(snap(this.x - camX + 20), snap(this.y - camY + 16)); ctx.stroke();
  }
}

function placeBoundGoblin(world, rng) {
  // somewhere in the cavern layer with a floor and head room
  for (let attempt = 0; attempt < 20000; attempt++) {
    const x = 20 + Math.floor(rng() * (world.w - 40));
    const y = world.cavernLine + Math.floor(rng() * (world.h - 70 - world.cavernLine - 10));
    if (world.get(x, y) !== T.AIR || world.get(x, y - 1) !== T.AIR || world.get(x, y - 2) !== T.AIR || !world.isSolidAt(x, y + 1) || world.liquidAt(x, y) > 0) continue;
    world.boundGoblin = { x: x * TILE, y: (y - 2) * TILE };
    return true;
  }
  return false;
}

const Reforge = {
  open: false, win: { x: 0, y: 0, locked: false }, drag: null, item: null, selected: new Set(), auto: false, count: 0, spent: 0, timer: 0, hideVanilla: true, lastResult: '',
  load() {
    try { const w = JSON.parse(localStorage.getItem('reforge_win') || 'null'); if (w) this.win = w; const sel = JSON.parse(localStorage.getItem('reforge_sel') || '[]'); this.selected = new Set(sel); const hv = localStorage.getItem('reforge_hide'); if (hv != null) this.hideVanilla = hv === '1'; } catch (e) {}
    if (!this.win.x && !this.win.y) { this.win.x = 60; this.win.y = 120; }
  },
  save() { try { localStorage.setItem('reforge_win', JSON.stringify(this.win)); localStorage.setItem('reforge_sel', JSON.stringify([...this.selected])); localStorage.setItem('reforge_hide', this.hideVanilla ? '1' : '0'); } catch (e) {} },
  cost(stack) { return Math.max(100, Math.floor(stackValue(stack) / 3)); },
  // one reforge: random prefix (never "none"), pay the cost
  reforgeOnce(game) {
    const p = game.player, it = this.item;
    if (!it || !canHavePrefix(it.id)) { this.lastResult = 'Place a weapon or tool in the slot.'; return false; }
    const c = this.cost(it);
    if (p.coins < c) { this.lastResult = `Not enough coins (${coinsToString(c)} needed).`; this.auto = false; return false; }
    p.coins -= c; this.spent += c; this.count++;
    let pf; do { pf = Math.floor(Math.random() * PREFIXES.length); } while (pf === it.prefix && PREFIXES.length > 1);
    it.prefix = pf;
    this.lastResult = `${PREFIXES[pf].name}!`;
    Audio_.play('craft');
    game.particles.push(new Particle(p.cx, p.y, 0, -1, '#ffe060', 20, 3, false));
    return true;
  },
  tick(game) {
    if (!this.open || !this.auto) return;
    if (--this.timer > 0) return;
    this.timer = 8;
    if (!this.item) { this.auto = false; return; }
    if (this.item.prefix != null && this.selected.has(this.item.prefix)) { this.auto = false; this.lastResult = `Got ${PREFIXES[this.item.prefix].name} after ${this.count} reforges (${coinsToString(this.spent)}).`; game.message(this.lastResult, '#ffe75a'); Audio_.play('levelup'); return; }
    if (!this.reforgeOnce(game)) this.auto = false;
    else if (this.item.prefix != null && this.selected.has(this.item.prefix)) { this.auto = false; this.lastResult = `Got ${PREFIXES[this.item.prefix].name} after ${this.count} reforges (${coinsToString(this.spent)}).`; game.message(this.lastResult, '#ffe75a'); Audio_.play('levelup'); }
  },
  close(game) {
    if (this.item) { const p = game.player; const left = p.addItem(this.item.id, 1, this.item.prefix); if (left) game.dropItem(p.cx, p.cy, this.item.id, 1, null, this.item.prefix); this.item = null; }
    this.open = false; this.auto = false; this.save();
  },
};
Reforge.load();
