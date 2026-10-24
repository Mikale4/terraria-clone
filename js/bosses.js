// ---------------------------------------------------------------------------
// Bosses & Boss Checklist: King Slime (new boss + Slime Crown), the Boss Log
// (checklist with per-boss pages: spawn info, summon recipe, loot & collectible
// checklists, records), fight records (duration, hits taken), despawn messages,
// an off-screen boss radar and boss loot markers on the map.
// ---------------------------------------------------------------------------
'use strict';

defItem('slime_crown', { name: 'Slime Crown', consumable: true, max: 20, rarity: 1, tooltip: 'Summons King Slime' });
defItem('slimy_saddle', { name: 'Slimy Saddle', max: 1, rarity: 2, accessory: true, tooltip: 'A trophy from King Slime. +2 defense, slimes ignore you unless you attack them', defense: 2, slimeCalm: true });
defItem('king_slime_trophy', { name: 'King Slime Trophy', max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defItem('eye_trophy', { name: 'Eye of Cthulhu Trophy', max: 99, rarity: 1, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defItem('eye_mask', { name: 'Eye of Cthulhu Mask', armor: 'head', defense: 2, max: 1, rarity: 2, tooltip: 'A collectible mask' });
defItem('king_slime_mask', { name: 'King Slime Mask', armor: 'head', defense: 2, max: 1, rarity: 2, tooltip: 'A collectible mask' });
Object.assign(ITEM_VALUES, { slime_crown: 5000, slimy_saddle: 20000, king_slime_trophy: 10000, eye_trophy: 10000, eye_mask: 7500, king_slime_mask: 7500 });
for (const id of ['slime_crown', 'slimy_saddle', 'king_slime_trophy', 'eye_trophy', 'eye_mask', 'king_slime_mask']) ITEMS[id].value = ITEM_VALUES[id];
RECIPES.push({ result: 'slime_crown', count: 1, station: 'workbench', ing: [['gel', 20], ['gold_bar', 5]] });

// Boss registry (progression order like the Boss Checklist)
const BOSSES = [
  { id: 'king_slime', name: 'King Slime', order: 1, hp: 2000, summon: 'slime_crown',
    spawn: 'Use a Slime Crown (20 Gel + 5 Gold Bars at a Work Bench) anywhere, at any time. Also has a small chance to show up on its own in the outer thirds of the world.',
    info: 'A gigantic slime that hops after you and splits into smaller slimes as it takes damage. It teleports to you if you run too far.',
    loot: ['gel', 'slimy_saddle', 'gold_bar', 'lesser_healing'], collectibles: ['king_slime_trophy', 'king_slime_mask'], despawn: 'King Slime has departed...' },
  { id: 'eye_of_cthulhu', name: 'Eye of Cthulhu', order: 2, hp: 2800, summon: 'suspicious_eye',
    spawn: 'Use a Suspicious Looking Eye (6 Lenses at a Work Bench) at night. Once you have 200 life it may also hunt you on its own at dusk.',
    info: 'A giant eye that hovers and charges. Below half life it grows a mouth and charges faster.',
    loot: ['gold_bar', 'lesser_healing', 'diamond', 'hook', 'grinning_eye'], collectibles: ['eye_trophy', 'eye_mask'], despawn: 'The Eye of Cthulhu has fled...' },
];

// King Slime ----------------------------------------------------------------------
class KingSlime extends Enemy {
  constructor(x, y) {
    super(x, y, 110, 80, { name: 'King Slime', hp: 2000, damage: 40, defense: 10, kbResist: 1, blood: '#4070e0', color: 'rgba(60,110,230,1)', drops: [] });
    this.isBoss = true; this.type = 'king_slime';
    this.jumpTimer = 60; this.squash = 0; this.teleportTimer = 0; this.nextSplit = 0.75; this.baseW = 110; this.baseH = 80;
  }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    // shrink with health
    const f = 0.5 + 0.5 * (this.hp / this.maxHp);
    const nw = Math.round(this.baseW * f), nh = Math.round(this.baseH * f);
    if (nw !== this.w) { this.x += (this.w - nw) / 2; this.y += this.h - nh; this.w = nw; this.h = nh; }
    // split: spawn slimes at 75/50/25%
    if (this.hp / this.maxHp < this.nextSplit) { this.nextSplit -= 0.25; for (let i = 0; i < 3; i++) { const s = spawnEnemy('blue_slime', this.cx + rand(-30, 30), this.y, game.expert); game.enemies.push(s); } Audio_.play('slime'); }
    this.updateLiquidState(world);
    if (this.onGround) {
      this.vx *= 0.8;
      this.jumpTimer--;
      if (this.jumpTimer <= 0) {
        this.dir = p.cx > this.cx ? 1 : -1;
        const big = Math.random() < 0.35;
        const sf = this.slowFactor;
        this.vx = this.dir * (big ? 5 : 3.2) * sf; this.vy = (big ? -12 : -8) * Math.max(0.4, sf);
        this.jumpTimer = randInt(35, 70);
        Audio_.play('slime');
      }
    }
    this.applyGravity();
    this.moveAndCollide(world);
    if (this.collidedX && this.onGround) this.vy = -9;
    // teleport when far
    const far = Math.abs(this.cx - p.cx) > 40 * TILE || Math.abs(this.cy - p.cy) > 30 * TILE;
    if (far) { if (++this.teleportTimer > 120) { this.teleportTimer = 0; this.x = p.cx - this.w / 2 + (Math.random() < 0.5 ? -200 : 200); this.y = p.y - this.h - 40; this.vy = 0; for (let i = 0; i < 20; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-4, 4), rand(-4, 4), '#4070e0', 40, 3)); } } else this.teleportTimer = 0;
    const target = this.onGround ? (this.jumpTimer < 8 ? 0.25 : 0) : -0.2;
    this.squash = lerp(this.squash, target, 0.25);
    this.touchPlayer(p, game);
  }
  die(game) {
    super.die(game);
    game.boss = null;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.king_slime = true;
    game.message('King Slime has been defeated!', '#ffe75a'); Audio_.play('levelup');
    game.dropItem(this.cx, this.cy, 'gel', randInt(30, 60)); game.dropItem(this.cx, this.cy, 'gold_bar', randInt(4, 8)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(3, 6));
    if (Math.random() < 0.5) game.dropItem(this.cx, this.cy, 'slimy_saddle', 1, null, null);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'king_slime_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'king_slime_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 10000 * (game.expert ? 2.5 : 1));
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null);
    for (let i = 0; i < 60; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-7, 7), rand(-7, 3), '#4070e0', 80, 4));
  }
  draw(ctx, camX, camY) {
    const sx = 1 + this.squash, sy = 1 - this.squash;
    const w = this.w * sx, h = this.h * sy;
    const x = snap(this.cx - camX - w / 2), y = snap(this.y + this.h - camY - h);
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 0.85;
    ctx.fillStyle = this.def.color; roundRect(ctx, x, y, Math.round(w), Math.round(h), Math.min(24, h / 2)); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; roundRect(ctx, x + w * 0.12, y + h * 0.12, w * 0.3, h * 0.25, 8); ctx.fill();
    ctx.globalAlpha = 1;
    // crown
    ctx.fillStyle = '#ffd040'; const cw = w * 0.3, cx0 = x + w / 2 - cw / 2, cy0 = y - 14;
    ctx.beginPath(); ctx.moveTo(cx0, cy0 + 14); ctx.lineTo(cx0, cy0 + 2); ctx.lineTo(cx0 + cw * 0.25, cy0 + 8); ctx.lineTo(cx0 + cw * 0.5, cy0); ctx.lineTo(cx0 + cw * 0.75, cy0 + 8); ctx.lineTo(cx0 + cw, cy0 + 2); ctx.lineTo(cx0 + cw, cy0 + 14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4060'; ctx.fillRect(cx0 + cw * 0.5 - 2, cy0 + 8, 4, 4);
    // eyes
    const ex = this.dir > 0 ? x + w * 0.6 : x + w * 0.25;
    ctx.fillStyle = '#000'; ctx.fillRect(snap(ex), snap(y + h * 0.3), 8, 10); ctx.fillRect(snap(ex + this.dir * 18), snap(y + h * 0.3), 8, 10);
    ctx.fillStyle = '#fff'; ctx.fillRect(snap(ex + 2), snap(y + h * 0.3 + 1), 3, 3); ctx.fillRect(snap(ex + this.dir * 18 + 2), snap(y + h * 0.3 + 1), 3, 3);
    // a "victim" inside
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#e0c0a0'; ctx.fillRect(snap(x + w * 0.45), snap(y + h * 0.55), 6, 6); ctx.fillStyle = '#a04040'; ctx.fillRect(snap(x + w * 0.45), snap(y + h * 0.55 + 6), 6, 8); ctx.globalAlpha = 1;
  }
}

// Boss Log data & records --------------------------------------------------------------
const BossLog = {
  open: false, page: null, // null = checklist, else boss id
  fight: null,             // {id, start, hits}
  start(game, boss) { this.fight = { id: boss.type, start: game.world.time, hits: 0 }; if (typeof ModLib !== 'undefined') ModLib.emit('bossSpawn', game, boss); },
  onPlayerHit() { if (this.fight) this.fight.hits++; },
  onKill(game, boss) {
    if (typeof ModLib !== 'undefined') ModLib.emit('bossKilled', game, boss);
    const f = this.fight; if (!f || f.id !== boss.type) return;
    const w = game.world; w.bossRecords = w.bossRecords || {};
    const r = w.bossRecords[f.id] || { kills: 0, bestTime: null, leastHits: null, lastTime: null, lastHits: null };
    const time = w.time - f.start;
    r.kills++; r.lastTime = time; r.lastHits = f.hits;
    if (r.bestTime == null || time < r.bestTime) r.bestTime = time;
    if (r.leastHits == null || f.hits < r.leastHits) r.leastHits = f.hits;
    w.bossRecords[f.id] = r; this.fight = null;
    game.message(`Boss record: ${(time / 60).toFixed(1)}s, ${f.hits} hits taken.`, '#ffe75a');
  },
  onDespawn(game, boss) { this.fight = null; const b = BOSSES.find(x => x.id === boss.type); if (b) game.message(b.despawn, '#c0c0ff'); },
  defeated(game, id) { return !!(game.world.bossesDefeated && game.world.bossesDefeated[id]) || (id === 'eye_of_cthulhu' && !!game.world.bossDefeated); },
  obtained(game, itemId) { return !!(game.world.lootObtained && game.world.lootObtained[itemId]); },
  noteObtained(game, itemId) { const w = game.world; w.lootObtained = w.lootObtained || {}; if (!w.lootObtained[itemId]) { w.lootObtained[itemId] = true; } },
};
