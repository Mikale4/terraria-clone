// ---------------------------------------------------------------------------
// Consolaria slice: Lepus (Suspicious Looking Egg boss that lays hatching
// eggs), Diseaster Bunnies, Heart Shrines, the Holy Hand Grenade, Vampire
// Miners, Mc MoneyPants (holiday shop) and date-based holiday events
// (Easter, Halloween, Christmas) that can be forced always-on.
// ---------------------------------------------------------------------------
'use strict';

function defCItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
const drawEggIcon = (a, b) => (x) => { x.fillStyle = a; x.beginPath(); x.ellipse(8, 8, 5, 7, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = b; x.fillRect(5, 5, 2, 2); x.fillRect(9, 8, 2, 2); x.fillRect(6, 11, 2, 2); };
defCItem('suspicious_egg', 'Suspicious Looking Egg', { max: 20, consumable: true, rarity: 1, value: 5000, tooltip: 'Summons Lepus. Something is moving inside...', drawIcon: drawEggIcon('#f0e8d0', '#c060c0') });
RECIPES.push({ result: 'suspicious_egg', count: 1, station: 'workbench', ing: [['gel', 20], ['lens', 2]] });
defCItem('egg_cannon', 'Egg Cannon', { max: 1, damage: 22, useTime: 20, knockback: 5, rarity: 2, value: 40000, tooltip: 'Fires explosive eggs. No ammo required', drawIcon: (x) => { x.fillStyle = '#5a5a6a'; x.fillRect(1, 7, 12, 4); x.fillStyle = '#8a8a9a'; x.fillRect(1, 7, 12, 1); x.fillStyle = '#6a4a2a'; x.fillRect(2, 11, 4, 4); x.fillStyle = '#f0e8d0'; x.beginPath(); x.ellipse(13, 9, 2.5, 3, 0, 0, Math.PI * 2); x.fill(); }, use: (g, s, it) => Consolaria.fireEgg(g, s, it) });
defCItem('lepus_trophy', 'Lepus Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defCItem('lepus_mask', 'Lepus Mask', { max: 1, rarity: 2, value: 7500, armor: 'head', defense: 2, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } });
defCItem('holy_hand_grenade', 'Holy Hand Grenade', { max: 99, consumable: true, rarity: 3, value: 20000, explosive: { radius: 9, damage: 300, tiles: false }, tooltip: 'Three shall be the number of the counting. A huge, tile-safe explosion (300 damage)', drawIcon: (x) => { x.fillStyle = '#e0b040'; x.beginPath(); x.arc(8, 9, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff0a0'; x.fillRect(7, 1, 2, 5); x.fillRect(5, 2, 6, 2); x.fillStyle = '#c04040'; x.fillRect(7, 8, 2, 2); } });
RECIPES.push({ result: 'holy_hand_grenade', count: 1, station: 'anvil', ing: [['grenade', 5], ['gold_bar', 3], ['fallen_star', 1]] });
defCItem('mining_helmet', 'Mining Helmet', { max: 1, armor: 'head', defense: 1, headLight: true, rarity: 1, value: 15000, tooltip: '1 defense. Provides light', icon: { kind: 'helmet', mat: 'gold' } });
defCItem('bunny_hood', 'Bunny Hood', { max: 1, armor: 'head', defense: 1, rarity: 1, value: 20000, tooltip: '1 defense. Cute!', drawIcon: (x) => { x.fillStyle = '#f0f0f0'; x.fillRect(3, 8, 10, 7); x.fillRect(4, 1, 2, 8); x.fillRect(10, 1, 2, 8); x.fillStyle = '#ffb0c0'; x.fillRect(5, 2, 1, 6); x.fillRect(10, 2, 1, 6); } });
defCItem('candy', 'Candy', { max: 99, consumable: true, heal: 15, food: true, rarity: 0, value: 50, tooltip: 'Restores 15 life', drawIcon: (x) => { x.fillStyle = '#ff8040'; x.beginPath(); x.arc(8, 8, 4, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ffd0a0'; x.fillRect(1, 7, 3, 2); x.fillRect(12, 7, 3, 2); } });
defCItem('candy_cane', 'Candy Cane', { max: 99, consumable: true, heal: 25, food: true, rarity: 0, value: 100, tooltip: 'Restores 25 life', drawIcon: (x) => { x.fillStyle = '#f0f0f0'; x.fillRect(9, 3, 3, 12); x.fillRect(5, 1, 6, 3); x.fillRect(4, 2, 2, 3); x.fillStyle = '#e02020'; x.fillRect(9, 5, 3, 2); x.fillRect(9, 9, 3, 2); x.fillRect(9, 13, 3, 2); x.fillRect(7, 1, 2, 2); } });
defCItem('pumpkin_mask', 'Pumpkin Mask', { max: 1, armor: 'head', defense: 1, rarity: 1, value: 10000, tooltip: '1 defense. Spooky', drawIcon: (x) => { x.fillStyle = '#e08020'; x.beginPath(); x.arc(8, 9, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#3a6a20'; x.fillRect(7, 1, 2, 3); x.fillStyle = '#000'; x.fillRect(4, 7, 2, 2); x.fillRect(10, 7, 2, 2); x.fillRect(5, 11, 6, 1); } });
defCItem('santa_hat', 'Santa Hat', { max: 1, armor: 'head', defense: 1, rarity: 1, value: 10000, tooltip: '1 defense. Ho ho ho', drawIcon: (x) => { x.fillStyle = '#e02020'; x.beginPath(); x.moveTo(2, 12); x.lineTo(12, 2); x.lineTo(13, 12); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(1, 11, 13, 3); x.beginPath(); x.arc(13, 3, 2, 0, Math.PI * 2); x.fill(); } });
defCItem('goodie_bag', 'Goodie Bag', { max: 99, rarity: 2, value: 5000, tooltip: 'Right-click / use to open. Halloween loot!', drawIcon: (x) => { x.fillStyle = '#e08020'; x.fillRect(3, 5, 10, 10); x.fillStyle = '#3a2a20'; x.fillRect(5, 2, 6, 3); x.fillStyle = '#000'; x.fillRect(5, 8, 2, 2); x.fillRect(9, 8, 2, 2); x.fillRect(6, 12, 4, 1); }, onUse: (g, s) => Consolaria.openBag(g, s, 'goodie_bag') });
defCItem('present', 'Present', { max: 99, rarity: 2, value: 5000, tooltip: 'Right-click / use to open. Christmas loot!', drawIcon: (x) => { x.fillStyle = '#20a040'; x.fillRect(2, 5, 12, 10); x.fillStyle = '#e02020'; x.fillRect(7, 5, 2, 10); x.fillRect(2, 9, 12, 2); x.fillRect(5, 2, 6, 3); x.fillStyle = '#ff8080'; x.fillRect(7, 2, 2, 3); }, onUse: (g, s) => Consolaria.openBag(g, s, 'present') });
NPC_NAMES['Mc MoneyPants'] = ['Mc MoneyPants'];
NPC_ROLES['Mc MoneyPants'] = {
  town: true, hairStyle: 0,
  colors: { skin: '#f2c6a0', hair: '#f0f0f0', shirt: '#3a3a5a', pants: '#2a2a3a', shoes: '#101010', eye: '#3a3a3a' },
  weapon: { kind: 'coin', damage: 16, rate: 22, speed: 9 }, buttons: ['Shop'], shop: 'Mc MoneyPants',
  condition: (g) => g.player.coins >= 30000 && g.npcs.some(n => n.role === 'Merchant'),
  lines: ["Money is no object. Well, technically it IS an object. Several objects. I have many.", "I only deal in holiday goods. Seasonal scarcity is where the margins are.", "You have coins? I have more. But I'll take yours anyway.", "Diseaster Bunnies? Adorable. Terrifying. Profitable.", "A wise investor once told me: buy low, sell high, and never trust a slime with your wallet."],
};
SHOPS['Mc MoneyPants'] = [
  { id: 'bunny_hood', price: 20000 }, { id: 'mining_helmet', price: 15000 }, { id: 'holy_hand_grenade', price: 50000, cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.lepus) },
  { id: 'suspicious_egg', price: 30000, cond: (g) => Holidays.active('easter') },
  { id: 'pumpkin_mask', price: 20000, cond: (g) => Holidays.active('halloween') }, { id: 'goodie_bag', price: 8000, cond: (g) => Holidays.active('halloween') },
  { id: 'santa_hat', price: 20000, cond: (g) => Holidays.active('christmas') }, { id: 'present', price: 8000, cond: (g) => Holidays.active('christmas') }, { id: 'candy_cane', price: 200, cond: (g) => Holidays.active('christmas') },
];

// Holidays ---------------------------------------------------------------------------
function easterSunday(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = (h + l - 7 * m + 114) % 31 + 1; return new Date(y, mo - 1, da); }
const Holidays = {
  cfg: { mode: 'always' }, // 'always' | 'date'
  load() { try { const c = JSON.parse(localStorage.getItem('holiday_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('holiday_cfg', JSON.stringify(this.cfg)); } catch (e) {} },
  list: {
    easter: { name: 'Easter', test: (d) => { const e = easterSunday(d.getFullYear()); return Math.abs(d - e) < 8 * 86400000; } },
    halloween: { name: 'Halloween', test: (d) => (d.getMonth() === 9 && d.getDate() >= 10) || (d.getMonth() === 10 && d.getDate() <= 1) },
    christmas: { name: 'Christmas', test: (d) => d.getMonth() === 11 && d.getDate() >= 15 },
  },
  active(id) { return this.cfg.mode === 'always' ? true : this.list[id].test(new Date()); },
  activeNames() { return Object.keys(this.list).filter(k => this.active(k)).map(k => this.list[k].name); },
};
Holidays.load();

// Enemies ------------------------------------------------------------------------------
class DiseasterBunny extends Enemy {
  constructor(x, y, def) { super(x, y, 22, 18, def); this.jumpTimer = randInt(20, 50); this.squash = 0; }
  ai(world, player, game) {
    this.updateLiquidState(world); if (this.inLava) { this.dead = true; return; }
    if (this.onGround) {
      this.vx *= 0.75; this.jumpTimer--;
      if (this.jumpTimer <= 0) { this.dir = player.cx > this.cx ? 1 : -1; const sf = this.slowFactor; this.vx = this.dir * rand(3, 4.5) * sf; this.vy = -rand(5.5, 7.5) * Math.max(0.4, sf); this.jumpTimer = randInt(15, 40); }
    }
    this.applyGravity(); this.moveAndCollide(world);
    if (this.collidedX && this.onGround) this.vy = -6;
    this.squash = lerp(this.squash, this.onGround ? 0.2 : -0.15, 0.25);
  }
  draw(ctx, camX, camY) {
    this.drawShadowFlash(ctx);
    const x = snap(this.x - camX), y = snap(this.y - camY), d = this.dir;
    ctx.save(); ctx.translate(x + 11, y + 18); if (d < 0) ctx.scale(-1, 1); ctx.scale(1 + this.squash, 1 - this.squash);
    ctx.fillStyle = this.def.color; ctx.fillRect(-11, -14, 18, 14); ctx.fillRect(4, -18, 8, 10);
    ctx.fillRect(6, -26, 3, 9); ctx.fillRect(10, -26, 3, 9); // ears
    ctx.fillStyle = this.def.inner || '#e0a0e0'; ctx.fillRect(7, -25, 1, 6); ctx.fillRect(11, -25, 1, 6);
    ctx.fillStyle = '#ff2020'; ctx.fillRect(9, -15, 2, 2); ctx.fillStyle = '#80ff40'; ctx.fillRect(-4, -8, 3, 2); ctx.fillRect(2, -5, 2, 2);
    ctx.fillStyle = '#fff'; ctx.fillRect(-11, -10, 3, 3); // tail
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
ENEMY_DEFS.diseaster_bunny = { name: 'Diseaster Bunny', cls: DiseasterBunny, hp: 40, damage: 15, defense: 4, color: '#a060c0', inner: '#e0a0e0', blood: '#9040b0', drops: [{ id: 'suspicious_egg', chance: 0.04 }, { id: 'candy', chance: 0.2, min: 1, max: 3 }] };

class VampireMiner extends Walker {
  constructor(x, y, def) { super(x, y, def); this.weapon = null; if (this.armor) this.armor.head = true; }
  touchPlayer(player, game) {
    const before = player.invuln;
    super.touchPlayer(player, game);
    if (player.invuln > 0 && before === 0 && !player.dead) { const heal = Math.min(this.maxHp - this.hp, 15); if (heal > 0) { this.hp += heal; game.addDamageText(this.cx, this.y - 10, '+' + heal, '#ff4060'); } }
  }
  update(world, game) { super.update(world, game); game.lighting.extraLights.push({ x: this.cx / TILE, y: this.y / TILE, r: 0.7, g: 0.6, b: 0.35 }); }
}
ENEMY_DEFS.vampire_miner = { name: 'Vampire Miner', cls: VampireMiner, hp: 90, damage: 22, defense: 8, speed: 1.6, colors: { skin: '#c8c8e0', hair: '#202030', shirt: '#4a3a3a', pants: '#2a2a3a', shoes: '#1a1a1a', eye: '#ff2020' }, blood: '#802030', drops: [{ id: 'iron_bar', chance: 0.3, min: 1, max: 3 }, { id: 'gold_bar', chance: 0.1, min: 1, max: 2 }, { id: 'torch', chance: 0.5, min: 3, max: 8 }, { id: 'mining_helmet', chance: 0.08 }] };

// Lepus ---------------------------------------------------------------------------------
class LepusEgg extends Enemy {
  constructor(x, y, big) {
    super(x, y, big ? 26 : 16, big ? 32 : 20, { name: big ? 'Large Lepus Egg' : 'Lepus Egg', hp: big ? 120 : 30, damage: 0, defense: 4, kbResist: 1, blood: '#f0e8d0', drops: [] });
    this.big = big; this.hatch = big ? 600 : 360; this.type = 'lepus_egg';
  }
  ai(world, player, game) {
    this.updateLiquidState(world); this.applyGravity(); this.vx *= 0.8; this.moveAndCollide(world);
    if (--this.hatch <= 0) {
      this.dead = true;
      const e = this.big ? new Lepus(this.cx - 30, this.y - 30, true) : spawnEnemy('diseaster_bunny', this.cx, this.y, game.expert);
      if (this.big) e.hp = e.maxHp = game.expert ? 500 : 250;
      game.enemies.push(e);
      for (let i = 0; i < 10; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-3, 3), rand(-4, 0), '#f0e8d0', 40, 3));
      Audio_.play('break');
    }
  }
  touchPlayer() {}
  draw(ctx, camX, camY) {
    this.drawShadowFlash(ctx);
    const x = snap(this.cx - camX), y = snap(this.cy - camY), sh = this.hatch < 90 ? Math.sin(this.t * 0.8) * 2 : 0;
    ctx.fillStyle = '#f0e8d0'; ctx.beginPath(); ctx.ellipse(x + sh, y, this.w / 2, this.h / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c060c0'; ctx.fillRect(x - 4 + sh, y - 6, 3, 3); ctx.fillRect(x + 2 + sh, y - 1, 3, 3); ctx.fillRect(x - 3 + sh, y + 4, 3, 3);
    if (this.hatch < 90) { ctx.strokeStyle = '#806040'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.lineTo(x - 2, y); ctx.lineTo(x + 3, y - 3); ctx.lineTo(x + 6, y + 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
}
class Lepus extends Enemy {
  constructor(x, y, small = false) {
    super(x, y, small ? 36 : 64, small ? 30 : 52, { name: small ? 'Lepus Kit' : 'Lepus', hp: small ? 250 : 1400, damage: small ? 20 : 32, defense: small ? 6 : 10, kbResist: small ? 0.6 : 1, blood: '#f0f0f0', drops: [] });
    this.small = small; this.isBoss = !small; this.type = small ? 'lepus_kit' : 'lepus';
    this.jumpTimer = 40; this.squash = 0; this.eggTimer = 420; this.nextBigEgg = 0.5;
  }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (this.isBoss && p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    this.updateLiquidState(world);
    if (this.onGround) {
      this.vx *= 0.8; this.jumpTimer--;
      if (this.jumpTimer <= 0) {
        this.dir = p.cx > this.cx ? 1 : -1;
        const far = Math.abs(p.cx - this.cx) > 220, sf = this.slowFactor;
        this.vx = this.dir * (far ? 6.5 : 4) * sf; this.vy = (far ? -11 : -8.5) * Math.max(0.4, sf);
        this.jumpTimer = randInt(20, 45);
        Audio_.play('jump');
      }
    }
    this.applyGravity(); this.moveAndCollide(world);
    if (this.collidedX && this.onGround) this.vy = -10;
    // eggs
    if (this.isBoss) {
      if (--this.eggTimer <= 0 && game.enemies.filter(e => e.type === 'diseaster_bunny' || e instanceof LepusEgg).length < 5) { this.eggTimer = game.expert ? 300 : 420; const egg = new LepusEgg(this.cx - 8, this.y + this.h - 20, false); egg.vx = -this.dir * 3; egg.vy = -3; game.enemies.push(egg); game.addDamageText(this.cx, this.y - 10, 'laid an egg!', '#f0e8d0'); }
      if (this.hp / this.maxHp < this.nextBigEgg) { this.nextBigEgg -= 0.25; const egg = new LepusEgg(this.cx - 13, this.y + this.h - 32, true); egg.vx = -this.dir * 4; egg.vy = -5; game.enemies.push(egg); game.message('Lepus laid a large egg!', '#f0e8d0'); }
      // teleport if very far
      if (Math.abs(this.cx - p.cx) > 60 * TILE || Math.abs(this.cy - p.cy) > 40 * TILE) { this.x = p.cx - this.w / 2 + (Math.random() < 0.5 ? -300 : 300); this.y = p.y - 200; this.vy = 0; }
    }
    this.squash = lerp(this.squash, this.onGround ? (this.jumpTimer < 6 ? 0.25 : 0) : -0.2, 0.25);
    this.touchPlayer(p, game);
    if (this.small) { const d = Math.abs(this.cx - p.cx) / TILE; if (d > 140) this.dead = true; }
  }
  die(game) {
    super.die(game);
    if (!this.isBoss) return;
    game.boss = null;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.lepus = true;
    game.message('Lepus has been defeated!', '#ffe75a'); Audio_.play('levelup');
    game.dropItem(this.cx, this.cy, 'egg_cannon', 1); game.dropItem(this.cx, this.cy, 'gold_bar', randInt(5, 10)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(3, 6)); game.dropItem(this.cx, this.cy, 'candy', randInt(5, 15));
    if (Math.random() < 0.25) game.dropItem(this.cx, this.cy, 'bunny_hood', 1, null, null);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'lepus_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'lepus_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 12000 * (game.expert ? 2.5 : 1));
    if (game.expert) { game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null); game.dropItem(this.cx, this.cy, 'holy_hand_grenade', randInt(3, 5)); }
    for (let i = 0; i < 60; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-7, 7), rand(-7, 3), '#f0f0f0', 80, 4));
    if (game.pets) game.pets.unlock('egg_hunt');
  }
  draw(ctx, camX, camY) {
    const sx = 1 + this.squash, sy = 1 - this.squash, w = this.w * sx, h = this.h * sy;
    const x = snap(this.cx - camX), y = snap(this.y + this.h - camY);
    ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1); ctx.scale(w / this.w, h / this.h);
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1;
    const W_ = this.w, H_ = this.h;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-W_ / 2, -H_ * 0.75, W_, H_ * 0.75); // body
    ctx.fillRect(W_ * 0.15, -H_, W_ * 0.4, H_ * 0.5); // head
    ctx.fillRect(W_ * 0.2, -H_ * 1.45, W_ * 0.12, H_ * 0.5); ctx.fillRect(W_ * 0.4, -H_ * 1.45, W_ * 0.12, H_ * 0.5); // ears
    ctx.fillStyle = '#f0b0c0'; ctx.fillRect(W_ * 0.23, -H_ * 1.4, W_ * 0.06, H_ * 0.4); ctx.fillRect(W_ * 0.43, -H_ * 1.4, W_ * 0.06, H_ * 0.4);
    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(-W_ / 2, -H_ * 0.15, W_ * 0.3, H_ * 0.15); ctx.fillRect(W_ * 0.2, -H_ * 0.15, W_ * 0.3, H_ * 0.15); // feet
    ctx.fillStyle = '#ff2020'; ctx.fillRect(W_ * 0.42, -H_ * 0.9, W_ * 0.08, H_ * 0.1); // eye
    ctx.fillStyle = '#f080a0'; ctx.fillRect(W_ * 0.52, -H_ * 0.75, W_ * 0.06, H_ * 0.06); // nose
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-W_ / 2, -H_ * 0.45, W_ * 0.1, 0, Math.PI * 2); ctx.fill(); // tail
    if (this.hp < this.maxHp * 0.5) { ctx.fillStyle = '#80ff40'; ctx.fillRect(-W_ * 0.2, -H_ * 0.5, W_ * 0.1, H_ * 0.08); ctx.fillRect(W_ * 0.0, -H_ * 0.3, W_ * 0.08, H_ * 0.08); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
BOSSES.push({ id: 'lepus', name: 'Lepus', order: 4, hp: 1400, summon: 'suspicious_egg',
  spawn: 'Use a Suspicious Looking Egg (20 Gel + 2 Lenses at a Work Bench, dropped by Diseaster Bunnies, or sold by Mc MoneyPants at Easter) anywhere, any time.',
  info: 'A giant rabbit that hops after you with huge leaps. It lays eggs that hatch into Diseaster Bunnies, and at 50% and 25% life a large egg that hatches into a Lepus Kit. Break the eggs before they hatch!',
  loot: ['egg_cannon', 'bunny_hood', 'gold_bar', 'candy', 'holy_hand_grenade'], collectibles: ['lepus_trophy', 'lepus_mask'], despawn: 'Lepus has hopped away...' });

// Heart Shrines ---------------------------------------------------------------------------
function placeHeartShrines(world, rng) {
  world.heartShrines = [];
  const want = world.w > 6000 ? 4 : world.w > 4000 ? 3 : 2;
  const rubyIdx = GEMS.findIndex(g => g.id === 'ruby');
  for (let attempt = 0; attempt < 4000 && world.heartShrines.length < want; attempt++) {
    const x = 30 + Math.floor(rng() * (world.w - 60));
    const y = world.surfaceLine + 25 + Math.floor(rng() * (world.cavernLine - world.surfaceLine - 30));
    if (world.heartShrines.some(s => Math.abs(s.x - x) < 200)) continue;
    if (Math.abs(x - world.spawnX) < 40) continue;
    // room 13x8, frame of stone brick, must be inside solid rock (no big caves)
    let solid = 0; for (let yy = y - 4; yy <= y + 4; yy++) for (let xx = x - 7; xx <= x + 7; xx++) if (world.isSolidAt(xx, yy)) solid++;
    if (solid < 13 * 9 * 0.8) continue;
    for (let yy = y - 4; yy <= y + 4; yy++) for (let xx = x - 6; xx <= x + 6; xx++) {
      const edge = yy === y - 4 || yy === y + 4 || xx === x - 6 || xx === x + 6;
      world.setTile(xx, yy, edge ? T.STONEBRICK : T.AIR); world.liquid[world.idx(xx, yy)] = 0; world.lava[world.idx(xx, yy)] = 0;
      world.setWall(xx, yy, W.STONEBRICK);
    }
    // heart of rubies on the back wall (they can be mined)
    const heart = [[-2, -3], [-1, -3], [1, -3], [2, -3], [-3, -2], [0, -2], [3, -2], [-3, -1], [3, -1], [-2, 0], [2, 0], [-1, 1], [1, 1], [0, 2]];
    for (const [hx, hy] of heart) { world.setTile(x + hx, y + hy - 1, T.GEM); world.tdata[world.idx(x + hx, y + hy - 1)] = rubyIdx; }
    // pedestal + chest
    world.setTile(x - 1, y + 3, T.STONEBRICK); world.setTile(x, y + 3, T.STONEBRICK); world.setTile(x + 1, y + 3, T.STONEBRICK);
    world.placeFurniture(x - 1, y + 1, T.CHEST);
    const inv = world.chests.get(world.idx(x - 1, y + 1));
    if (inv) { inv[0] = makeStack('life_crystal', 1, null); inv[1] = makeStack('lesser_healing', 5, null); inv[2] = makeStack('candy', randInt(5, 10), null); inv[3] = makeStack('coin_gold', randInt(1, 3), null); if (rng() < 0.3) inv[4] = makeStack('holy_hand_grenade', 1, null); }
    world.setTile(x - 5, y - 1, T.TORCH); world.setTile(x + 5, y - 1, T.TORCH);
    // platform entrance from below and above
    world.setTile(x - 4, y + 4, T.PLATFORM); world.setTile(x + 4, y - 4, T.PLATFORM);
    world.heartShrines.push({ x, y });
  }
  return world.heartShrines.length;
}

// Glue ------------------------------------------------------------------------------------
const Consolaria = {
  fireEgg(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1;
    p.dir = dx < 0 ? -1 : 1;
    const b = new Projectile(p.cx, p.y + 14, dx / d * 9, dy / d * 9 - 1.5, { kind: 'egg', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit });
    b.gravity = 0.15; b.life = 120; b.explosive = { radius: 2, damage: Math.round(st.damage * 0.6), tiles: false };
    game.projectiles.push(b);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('hit');
  },
  openBag(game, slot, kind) {
    const p = game.player, x = p.cx, y = p.cy;
    const give = (id, n) => { const left = p.addItem(id, n, ITEMS[id].armor ? null : null); if (left) game.dropItem(x, y, id, left, null, null); };
    if (kind === 'goodie_bag') { give('candy', randInt(4, 8)); if (Math.random() < 0.15) give('pumpkin_mask', 1); if (Math.random() < 0.1) give('holy_hand_grenade', 1); p.coins += randInt(500, 3000); }
    else { give('candy_cane', randInt(4, 8)); if (Math.random() < 0.15) give('santa_hat', 1); if (Math.random() < 0.08) give('present', 1); if (Math.random() < 0.05) give('gold_bar', randInt(3, 6)); p.coins += randInt(1000, 5000); }
    game.consumeSlot(slot); Audio_.play('open');
    for (let i = 0; i < 12; i++) game.particles.push(new Particle(x, y, rand(-3, 3), rand(-4, 0), kind === 'present' ? '#e02020' : '#e08020', 40, 2));
  },
  // holiday drops
  onEnemyKilled(game, e) {
    if (e.isBoss || e instanceof LepusEgg) return;
    if (Holidays.active('halloween') && Math.random() < 0.025) game.dropItem(e.cx, e.cy, 'goodie_bag', 1, null, null);
    if (Holidays.active('christmas') && Math.random() < 0.04) game.dropItem(e.cx, e.cy, 'present', 1, null, null);
  },
  // spawn table tweaks: Diseaster Bunnies at Easter on the surface, Vampire Miners in the caverns
  pickSpawn(game, type, ctx) {
    const r = Math.random();
    if (ctx.cavern && !ctx.hell && r < 0.15) return 'vampire_miner';
    if (!ctx.underground && !ctx.hell && Holidays.active('easter') && r < (ctx.night ? 0.1 : 0.2)) return 'diseaster_bunny';
    if (!ctx.underground && !ctx.hell && r > 0.86) return game.world.biome[clamp(game.player.tileX, 0, game.world.w - 1)] === BIOME.SNOW ? 'ice_fairy' : Math.random() < 0.3 ? 'sunflower_fairy' : 'fairy';
    return type;
  },
  summonLepus(game) {
    const p = game.player;
    const side = Math.random() < 0.5 ? -1 : 1;
    const b = new Lepus(p.cx + side * 400 - 32, p.y - 200);
    if (game.expert) { b.maxHp = b.hp = 2100; b.damage = 48; }
    if (game.master) { b.maxHp = b.hp = Math.round(b.hp * 1.5); b.damage = Math.round(b.damage * 1.5); }
    game.enemies.push(b); game.boss = b;
    BossLog.start(game, b);
    game.message('Lepus has awoken!', '#c040c0'); Audio_.play('zombie');
  },
  tick(game) {
    const p = game.player;
    if (p.armor[0] && ITEMS[p.armor[0].id].headLight && !p.dead) game.lighting.extraLights.push({ x: p.cx / TILE, y: p.y / TILE, r: 0.85, g: 0.75, b: 0.45 });
    if (game.world.time % (60 * 60 * 24) === 60 * 30 && Holidays.cfg.mode !== 'always') { const n = Holidays.activeNames(); if (n.length) game.message(`Holiday event active: ${n.join(', ')}`, '#ffe060'); }
  },
};
