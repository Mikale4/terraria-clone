// ---------------------------------------------------------------------------
// Biome Titles, Accessories+ (wing / shield / boot slots, new accessories, stat
// tooltips, more recipes, Traveling Merchant accessory) and the Expert/Master
// accessory slot (with a Master difficulty).
// ---------------------------------------------------------------------------
'use strict';

// Biome Titles ---------------------------------------------------------------------
const BiomeTitles = {
  current: null, timer: 0, text: '', sub: '',
  detect(game) {
    const p = game.player, w = game.world;
    if (w.isSub && typeof Subworlds !== 'undefined') { const d = Subworlds.defs[w.isSub]; return [d.name, d.sub]; }
    const x = clamp(p.tileX, 0, w.w - 1), y = p.tileY;
    const b = w.biome[x];
    const biomeName = b === BIOME.DESERT ? 'Desert' : b === BIOME.SNOW ? 'Snow Biome' : b === BIOME.JUNGLE ? 'Jungle' : 'Forest';
    if (w.shrine && Math.abs(x - w.shrine.x) < 30 && y < w.surfaceLine) return ['Shrine Grounds', 'Gensokyo mini-biome'];
    if (y > w.h - 70) return ['The Underworld', 'Lava, ash and hellstone'];
    if (y > w.cavernLine) return ['Caverns', b === BIOME.DESERT ? 'Underground Desert' : b === BIOME.SNOW ? 'Underground Snow' : 'Deep stone'];
    if (y > w.surfaceLine) return ['Underground', b === BIOME.DESERT ? 'Underground Desert' : b === BIOME.SNOW ? 'Underground Snow' : biomeName];
    if (y < w.surfaceLine - 90) return ['Space', 'Thin air'];
    const inWater = p.inWater && !p.inLava;
    if (inWater && w.liquidAt(x, y - 2) > 100) return ['Lake', biomeName];
    return [biomeName, 'Surface'];
  },
  tick(game) {
    if (this.timer > 0) this.timer--;
    if (game.world.time % 20 !== 0) return;
    const [t, sub] = this.detect(game);
    if (t !== this.current) { const first = this.current === null; this.current = t; this.text = t; this.sub = sub; this.timer = 60 * 4; if (game.world.time > 60) Audio_.play('menu'); if (!first && typeof ModLib !== 'undefined') ModLib.emit('biome', game, t); }
  },
  draw(game) {
    if (this.timer <= 0) return;
    const ctx = game.renderer.ctx, W = game.renderer.W;
    const a = clamp(this.timer / 40, 0, 1) * clamp((240 - this.timer) / 20, 0, 1);
    ctx.globalAlpha = a;
    const y = 110;
    ctx.strokeStyle = 'rgba(255,230,160,0.8)'; ctx.lineWidth = 2;
    const tw = measureText(ctx, this.text, 36) + 80;
    ctx.beginPath(); ctx.moveTo(W / 2 - tw / 2, y + 44); ctx.lineTo(W / 2 + tw / 2, y + 44); ctx.stroke();
    drawText(ctx, this.text, W / 2, y, { size: 36, align: 'center', color: '#ffe8b0', lineWidth: 5 });
    drawText(ctx, this.sub, W / 2, y + 52, { size: 15, align: 'center', color: '#d0c0a0' });
    ctx.globalAlpha = 1;
  },
};

// Accessories+ ---------------------------------------------------------------------
// Dedicated equipment slots: boots, shield, wings; plus the Expert/Master slot.
const EQUIP_SLOTS = ['boots', 'shield', 'wings'];
defAccessory('hermes_boots', 'Hermes Boots', { slot: 'boots', moveSpeed: 35, tooltip: 'The wearer can run super fast (+35% movement speed)', value: 20000, recipe: [['iron_bar', 10], ['gel', 15], ['cobweb', 10]], station: 'anvil' });
defAccessory('lightning_boots', 'Lightning Boots', { slot: 'boots', moveSpeed: 50, rarity: 2, tooltip: '+50% movement speed and 8% faster attack speed', value: 50000, recipe: [['hermes_boots', 1], ['gold_bar', 10], ['fallen_star', 5]], station: 'anvil' });
defAccessory('cobalt_shield', 'Cobalt Shield', { slot: 'shield', defense: 1, kbImmune: true, rarity: 1, tooltip: '+1 defense, grants immunity to knockback', value: 30000 });
defAccessory('obsidian_shield', 'Obsidian Shield', { slot: 'shield', defense: 2, kbImmune: true, lavaImmune: true, rarity: 2, tooltip: '+2 defense, immunity to knockback and to the On Fire! debuff, walk on lava for 7 seconds', value: 60000, recipe: [['cobalt_shield', 1], ['obsidian', 20]], station: 'anvil' });
defAccessory('leaf_wings', 'Leaf Wings', { slot: 'wings', flight: 60 * 2.3, rarity: 2, tooltip: 'Allows flight: 2.3 s of flight time. Hold jump in the air to fly', value: 100000 });
defAccessory('harpy_wings', 'Harpy Wings', { slot: 'wings', flight: 60 * 3.5, rarity: 3, tooltip: 'Allows flight: 3.5 s of flight time', value: 200000, recipe: [['leaf_wings', 1], ['fallen_star', 10], ['gold_bar', 15]], station: 'anvil' });
defAccessory('cloud_in_a_bottle', 'Cloud in a Bottle', { doubleJump: true, tooltip: 'Allows the holder to double jump', value: 30000, recipe: [['bottle', 1], ['fallen_star', 3], ['cobweb', 10]] });
defAccessory('lucky_horseshoe', 'Lucky Horseshoe', { noFall: true, tooltip: 'Negates fall damage', value: 30000, recipe: [['gold_bar', 8], ['fallen_star', 2]], station: 'anvil' });
defAccessory('aglet', 'Aglet', { moveSpeed: 5, tooltip: '+5% movement speed', value: 5000, recipe: [['iron_bar', 3], ['gel', 2]] });
defAccessory('anklet_of_the_wind', 'Anklet of the Wind', { moveSpeed: 10, tooltip: '+10% movement speed', value: 15000, recipe: [['aglet', 1], ['silver_bar', 5], ['cactus', 10]] });
defAccessory('obsidian_skull', 'Obsidian Skull', { defense: 1, fireImmune: true, tooltip: '+1 defense, immunity to fire blocks and the On Fire! debuff', value: 20000, recipe: [['obsidian', 20]], station: 'furnace' });
defAccessory('shackle', 'Shackle', { defense: 1, tooltip: '+1 defense', value: 5000, recipe: [['iron_bar', 5], ['rotten_chunk', 3]] });
SHOPS.Dryad.push({ id: 'leaf_wings', price: 100000 });
SHOPS.Merchant.push({ id: 'aglet', price: 5000 });
TRAVELING_POOL.push({ id: 'cobalt_shield', price: 40000 }, { id: 'hermes_boots', price: 30000 }, { id: 'cloud_in_a_bottle', price: 40000 }, { id: 'lucky_horseshoe', price: 40000 });
// chest loot: boots / shield / cloud / horseshoe
const ACC_CHEST_POOL = ['hermes_boots', 'cobalt_shield', 'cloud_in_a_bottle', 'lucky_horseshoe', 'shackle', 'aglet'];

const AccessoriesPlus = {
  // total accessory slot count: 3 + equipment slots + expert/master slot
  extraSlot(game) { return game.expert ? 1 : 0; },
  slotCount(game) { return ACCESSORY_SLOTS + this.extraSlot(game); },
  // stat tooltip lines for equipment (wings/hooks/light pets have stats in tooltips)
  statLines(item) {
    const it = ITEMS[item.id], lines = [];
    if (it.flight) lines.push({ t: `Flight time: ${(it.flight / 60).toFixed(1)}s   Ascent speed: 4 px/tick`, c: '#a0d0ff' });
    if (it.moveSpeed) lines.push({ t: `Movement speed: +${it.moveSpeed}%`, c: '#a0d0ff' });
    if (item.id === 'hook') lines.push({ t: 'Range: 22 blocks   Speed: 14 px/tick   Hooks: 1', c: '#a0d0ff' });
    if (it.kbImmune) lines.push({ t: 'Knockback immunity', c: '#a0d0ff' });
    if (it.doubleJump) lines.push({ t: 'Extra jump: 1', c: '#a0d0ff' });
    if (it.slot) lines.push({ t: `Equipment slot: ${it.slot}`, c: '#aaa' });
    return lines;
  },
  // per-tick modifiers from equipment
  mods(p) {
    const m = { move: 0, kbImmune: false, lavaImmune: false, fireImmune: false, flight: 0, doubleJump: false, noFall: false, useTime: 1 };
    for (const a of [...p.accessories, ...Object.values(p.equipment || {})]) if (a) { const it = ITEMS[a.id]; m.move += it.moveSpeed || 0; if (it.kbImmune) m.kbImmune = true; if (it.lavaImmune) m.lavaImmune = true; if (it.fireImmune) m.fireImmune = true; if (it.flight) m.flight = Math.max(m.flight, it.flight); if (it.doubleJump) m.doubleJump = true; if (it.noFall) m.noFall = true; if (a.id === 'lightning_boots') m.useTime *= 0.92; }
    return m;
  },
};
