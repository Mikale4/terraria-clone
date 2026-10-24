// ---------------------------------------------------------------------------
// Calamity: Wrath of the Gods slice: Solyn (story character who moves in, talks
// about the stars and takes you on a Journey), the Eternal Garden subworld, and
// the Nameless Deity boss fought there with Solyn's help - cast-driven attacks
// with heavy visual effects (telegraphs, screen shake, flashes, time stops).
// Effect intensity is configurable (Mod settings).
// ---------------------------------------------------------------------------
'use strict';

function defWItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
defAccessory('deific_touch', 'Deific Touch', { rarity: 4, value: 500000, defense: 4, kbImmune: true, tooltip: '+4 defense, knockback immunity, +12% damage, +8% critical strike chance. The touch of something nameless' });
ITEMS.deific_touch.drawIcon = (x) => { x.fillStyle = '#f0e0ff'; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#8040c0'; x.beginPath(); x.arc(8, 8, 3, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 3, 2, 10); x.fillRect(3, 7, 10, 2); };
defAccessory('cosmic_wings', 'Wings of the Nameless', { slot: 'wings', flight: 60 * 6, rarity: 4, value: 400000, tooltip: 'Allows flight: 6 s of flight time. Feathers of light' });
ITEMS.cosmic_wings.drawIcon = (x) => { x.fillStyle = '#e0d0ff'; x.beginPath(); x.moveTo(8, 8); x.lineTo(1, 2); x.lineTo(3, 9); x.lineTo(1, 13); x.closePath(); x.fill(); x.beginPath(); x.moveTo(8, 8); x.lineTo(15, 2); x.lineTo(13, 9); x.lineTo(15, 13); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 6, 2, 4); };
defWItem('deity_trophy', 'Nameless Deity Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defWItem('deity_mask', 'Nameless Deity Mask', { max: 1, rarity: 4, value: 7500, armor: 'head', defense: 3, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'silver' } });
defWItem('divine_monolith', 'Divine Monolith', { max: 1, rarity: 4, value: 100000, tooltip: 'Use to journey to the Eternal Garden again (Solyn can also take you there)', drawIcon: (x) => { x.fillStyle = '#d0c0f0'; x.fillRect(5, 1, 6, 14); x.fillStyle = '#8060c0'; x.fillRect(6, 3, 4, 3); x.fillRect(6, 8, 4, 3); x.fillStyle = '#fff'; x.fillRect(7, 5, 2, 1); }, onUse: (g) => WotG.journey(g, null) });

NPC_NAMES.Solyn = ['Solyn'];
NPC_ROLES.Solyn = {
  town: true, hairStyle: 1,
  colors: { skin: '#f2d6c0', hair: '#f0e0ff', shirt: '#4a3a8a', pants: '#2a2a4a', shoes: '#1a1a2a', eye: '#a080ff' },
  weapon: { kind: 'seal', damage: 22, rate: 20, speed: 8 }, buttons: ['Journey'], onButton: (g, npc, b) => { if (b === 'Journey') WotG.journey(g, npc); },
  condition: (g) => Object.keys(g.world.bossesDefeated || {}).length + (g.world.bossDefeated ? 1 : 0) >= 1,
  lines: ["The stars have been whispering. Something out there noticed you.", "I've charted a place the maps don't show: a garden that never ends. Something waits at its heart.", "When you're ready, I'll take you there. Bring everything you have.", "I can't stay in that garden long. But I can fight beside you.", "Do you ever look up and feel... looked at?", "A nameless thing can't be killed, not really. But it can be made to leave."],
};

// Eternal Garden subworld -------------------------------------------------------------
Subworlds.register('eternal_garden', {
  name: 'The Eternal Garden', sub: 'A place outside of everything', w: 320, h: 140, daylight: 1, sky: ['#d8e8ff', '#fff0f8'], stars: false, time: 12, exitHint: 'Talk to Solyn (right-click) or use the Divine Monolith to return',
  loadingText: 'Stepping beyond the stars', tip: 'The Nameless Deity casts its attacks. Watch for the telegraphs.',
  generate(w, game) {
    const rng = mulberry32(w.seed);
    const ground = 100;
    // floating island
    for (let x = 0; x < w.w; x++) { const edge = Math.min(x, w.w - 1 - x); const depth = clamp(edge / 30, 0, 1) * 22 + rng() * 2; for (let y = ground; y < ground + depth; y++) w.rawSet(x, y, y === ground ? T.GRASS : T.DIRT); if (rng() < 0.12 && edge > 20) w.rawSet(x, ground - 1, T.PLANT); }
    // stone core
    for (let x = 40; x < w.w - 40; x++) for (let y = ground + 6; y < ground + 18; y++) if (rng() < 0.8) w.rawSet(x, y, T.STONE);
    // trees
    for (let x = 30; x < w.w - 30; x += 18 + Math.floor(rng() * 12)) { const h = 6 + Math.floor(rng() * 5); for (let k = 1; k <= h; k++) w.rawSet(x, ground - k, T.TREE); w.rawSet(x, ground - h - 1, T.TREETOP); }
    // arena platforms
    for (let k = 0; k < 4; k++) for (let x = 60 + k * 50; x < 90 + k * 50; x++) w.rawSet(x, ground - 14 - (k % 2) * 8, T.PLATFORM);
    // a small shrine at the center
    for (let x = w.w / 2 - 4; x <= w.w / 2 + 4; x++) w.rawSet(x, ground - 1, T.STONEBRICK);
    w.rawSet(w.w / 2 | 0, ground - 2, T.TORCH); w.rawSet((w.w / 2 | 0) - 3, ground - 2, T.TORCH); w.rawSet((w.w / 2 | 0) + 3, ground - 2, T.TORCH);
    w.spawnX = 24; w.spawnY = ground;
    w.surfaceLine = w.h; w.cavernLine = w.h;
    SubGen.finish(w);
  },
  onEnter(game, w) {
    // Solyn comes along as a helper
    const s = new SolynHelper(game.player.cx - 40, game.player.y - 20); game.npcs.push(s);
    setTimeout(() => game.message('Solyn: "It knows we are here. Get ready."', '#e0c0ff'), 1500);
    WotG.summonTimer = 60 * 6;
  },
  tick(game, w) {
    if (WotG.summonTimer > 0 && !game.boss) { WotG.summonTimer--; if (WotG.summonTimer === 0 && !(game.world.bossesDefeated || {}).deity_seen_this_visit) { WotG.summonDeity(game); } }
  },
  onExit(game) { WotG.summonTimer = 0; },
});

class SolynHelper extends NPC {
  constructor(x, y) { super(x, y, 'Solyn', 'Solyn'); this.isCompanion = true; this.helper = true; this.hp = this.maxHp = 600; this.shot = 0; }
  update(world, game) {
    const p = game.player; this.t = (this.t || 0) + 1;
    // hover beside the player
    const tx = p.cx - p.dir * 50, ty = p.y - 30 + Math.sin(this.t * 0.05) * 8;
    this.vx = lerp(this.vx, clamp((tx - this.cx) / 20, -5, 5), 0.1); this.vy = lerp(this.vy, clamp((ty - this.cy) / 20, -4, 4), 0.1);
    this.x += this.vx; this.y += this.vy; this.dir = p.dir;
    const b = game.boss;
    if (b && !b.dead && --this.shot <= 0) { this.shot = 22; const dx = b.cx - this.cx, dy = b.cy - this.cy, d = Math.hypot(dx, dy) || 1; const pr = new Projectile(this.cx, this.cy, dx / d * 9, dy / d * 9, { kind: 'seal', damage: 25 + Object.keys(world.bossesDefeated || {}).length * 5, friendly: true, owner: this, knockback: 1, color: '#c0a0ff' }); pr.life = 90; pr.ghost = true; pr.trail = { color: '#c0a0ff', len: 8, width: 3 }; game.projectiles.push(pr); }
    if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null;
    if (this.t % 600 === 0 && b && !b.dead) { this.emote = choose(['Keep moving!', "It's casting!", 'I have you!', 'Almost there!']); this.emoteLife = 150; }
  }
  hit() {}
  draw(ctx, camX, camY) { super.draw(ctx, camX, camY); const x = snap(this.cx - camX), y = snap(this.y - camY); ctx.fillStyle = 'rgba(200,160,255,0.5)'; ctx.beginPath(); ctx.ellipse(x, y + 44, 12, 3, 0, 0, Math.PI * 2); ctx.fill(); }
}

// The Nameless Deity ----------------------------------------------------------------------
const DEITY_ATTACKS = [
  { id: 'explosions', name: 'Conjure Explosions', cast: 60, dur: 240 },
  { id: 'starburst', name: 'Starburst', cast: 50, dur: 300 },
  { id: 'swords', name: 'Sword Constellation', cast: 70, dur: 260 },
  { id: 'sun', name: 'Sun Blender', cast: 90, dur: 200 },
  { id: 'clock', name: 'Clock Strike', cast: 60, dur: 320 },
];
class NamelessDeity extends Enemy {
  constructor(x, y, mult = 1) {
    super(x, y, 60, 60, { name: 'The Nameless Deity', hp: Math.round(9000 * mult), damage: 45, defense: 20, kbResist: 1, blood: '#e0d0ff', drops: [] });
    this.isBoss = true; this.type = 'nameless_deity'; this.flying = true;
    this.attack = null; this.castT = 0; this.phaseT = 0; this.cooldown = 120; this.alpha = 0; this.fade = 1; this.hands = [0, 0, 0]; this.sun = null; this.frozen = null; this.glow = { color: 'rgba(240,220,255,0.9)', r: 90, a: 0.5 };
    this.attackIndex = 0; this.spellText = ''; this.aggression = 1;
  }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    this.alpha = Math.min(1, this.alpha + 0.02);
    this.aggression = 1 + (1 - this.hp / this.maxHp) * 0.8;
    // hover: above and to the side of the player, teleport between attacks
    const tx = p.cx + Math.sin(this.t * 0.01) * 180, ty = p.y - 170 + Math.cos(this.t * 0.013) * 30;
    this.vx = lerp(this.vx, clamp((tx - this.cx) / 40, -3, 3), 0.05); this.vy = lerp(this.vy, clamp((ty - this.cy) / 40, -2.5, 2.5), 0.05);
    this.x += this.vx; this.y += this.vy; if (this.y < 20) this.y = 20;
    this.dir = p.cx < this.cx ? -1 : 1;
    // attack state machine: cooldown -> cast (bar) -> execute
    if (!this.attack) {
      if (--this.cooldown <= 0) { this.attack = DEITY_ATTACKS[this.attackIndex % DEITY_ATTACKS.length]; this.attackIndex++; this.castT = 0; this.phaseT = 0; this.spellText = this.attack.name; game.message(`The Nameless Deity casts ${this.attack.name}`, '#e0c0ff'); }
    } else if (this.castT < this.attack.cast) {
      this.castT++;
      if (this.castT === 1) { FX.shake(2, 20); Audio_.play('zombie'); }
      if (this.attack.id === 'swords' && this.castT % 10 === 0) { const a = rand(0, Math.PI * 2); FX.telegraph(p.cx + Math.cos(a) * 500, p.cy + Math.sin(a) * 500, p.cx - Math.cos(a) * 500, p.cy - Math.sin(a) * 500, '#ffffff', this.attack.cast - this.castT + 20, 8); this.swords = this.swords || []; this.swords.push(a); }
      if (this.attack.id === 'sun' && this.castT === 1) { this.sun = { x: p.cx + rand(-100, 100), y: p.cy - 120, r: 10 }; }
    } else {
      this.phaseT++;
      this.execute(game, p, world);
      if (this.phaseT >= this.attack.dur) { this.endAttack(game); }
    }
    this.touchPlayer(p, game);
  }
  endAttack(game) { if (this.frozen) this.unfreeze(game); this.sun = null; this.swords = null; this.attack = null; this.cooldown = Math.round(90 / this.aggression); this.spellText = ''; this.teleport(game); }
  teleport(game) { const p = game.player; FX.burst(game, this.cx, this.cy, 24, ['#f0e0ff', '#c0a0ff', '#fff'], 5, 40); this.x = p.cx + (Math.random() < 0.5 ? -260 : 260); this.y = p.y - 180; this.alpha = 0; FX.flash('#ffffff', 10, 0.25); }
  execute(game, p, world) {
    const a = this.attack, t = this.phaseT, dmg = Math.round(this.damage * 0.7);
    switch (a.id) {
      case 'explosions': // telegraphed explosions at the player's feet
        if (t % Math.round(45 / this.aggression) === 0) { const ex = p.cx + rand(-60, 60), ey = p.cy; FX.ring(game, ex, ey, 16, '#ffd0ff', 2, 40); this.pending = this.pending || []; this.pending.push({ x: ex, y: ey, t: 40 }); }
        if (this.pending) for (const e of this.pending) { if (--e.t === 0) { FX.burst(game, e.x, e.y, 30, ['#ffffff', '#ff80ff', '#8040c0'], 6, 40, 4); FX.shake(5, 8); if (dist(e.x, e.y, p.cx, p.cy) < 70) { p.damage(dmg, e.x, game, 'enemy', false, "the Nameless Deity's explosion", this); } } }
        if (this.pending) this.pending = this.pending.filter(e => e.t > 0);
        break;
      case 'starburst':
        if (t % Math.round(24 / this.aggression) === 0) { const n = 12, a0 = t * 0.05; for (let i = 0; i < n; i++) { const ang = a0 + i * Math.PI * 2 / n; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(ang) * 3.2, Math.sin(ang) * 3.2, { owner: this, color: '#ffe0ff', hi: '#ffffff', damage: dmg, sourceName: 'a star of the Nameless Deity', size: 6, life: 240 }); b.trail = { color: '#e0c0ff', len: 8, width: 4 }; b.glow = { color: 'rgba(255,220,255,0.9)', r: 12 }; } }
        break;
      case 'swords': // fast projectiles along the telegraphed lines
        if (t % 40 === 0 && this.swords) { for (const ang of this.swords) { const sx = p.cx + Math.cos(ang) * 500, sy = p.cy + Math.sin(ang) * 500; for (let k = 0; k < 6; k++) { const b = Gensokyo.bullet(game, sx, sy, -Math.cos(ang) * (9 + k), -Math.sin(ang) * (9 + k), { owner: this, color: '#ffffff', hi: '#e0c0ff', damage: dmg + 8, sourceName: 'a sword of the Nameless Deity', size: 5, life: 120 }); b.trail = { color: '#ffffff', len: 10, width: 3 }; } } FX.shake(4, 10); FX.flash('#ffffff', 6, 0.2); }
        break;
      case 'sun': // a growing sun that detonates: be far away
        if (this.sun) { this.sun.r += 0.9 * this.aggression; game.lighting.extraLights.push({ x: this.sun.x / TILE, y: this.sun.y / TILE, r: 1, g: 0.9, b: 0.6 }); if (t % 4 === 0) game.particles.push(new Particle(this.sun.x + rand(-this.sun.r, this.sun.r), this.sun.y + rand(-this.sun.r, this.sun.r), 0, -1, '#ffe080', 20, 2)); if (t === a.dur - 1) { FX.flash('#ffffff', 40, 0.9); FX.shake(10, 30); FX.burst(game, this.sun.x, this.sun.y, 60, ['#ffe080', '#ff8020', '#ffffff'], 9, 60, 5); const d = dist(this.sun.x, this.sun.y, p.cx, p.cy); if (d < this.sun.r + 140) p.damage(Math.round(dmg * 2.2), this.sun.x, game, 'enemy', false, "the Nameless Deity's sun", this); } }
        break;
      case 'clock': // bullets everywhere, then time stops and they all resume at once
        if (t < 150 && t % 8 === 0) { const ang = t * 0.35; for (let k = 0; k < 3; k++) { const aa = ang + k * Math.PI * 2 / 3; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(aa) * 2.6, Math.sin(aa) * 2.6, { owner: this, color: '#c0e0ff', hi: '#ffffff', damage: dmg, sourceName: 'a clock hand of the Nameless Deity', size: 5, life: 400 }); b.glow = { color: 'rgba(200,220,255,0.8)', r: 10 }; } }
        if (t === 150) this.freeze(game);
        if (t === 230) this.unfreeze(game);
        break;
    }
  }
  freeze(game) { this.frozen = []; for (const b of game.projectiles) if (b.hostile && b.owner === this) { this.frozen.push([b, b.vx, b.vy]); b.vx = b.vy = 0; b.life += 200; } FX.flash('#c0e0ff', 20, 0.4); game.message('Time stops...', '#c0e0ff'); Audio_.play('close'); }
  unfreeze(game) { if (!this.frozen) return; for (const [b, vx, vy] of this.frozen) { const p = game.player; const dx = p.cx - b.x, dy = p.cy - b.y, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * 4.5; b.vy = dy / d * 4.5; } this.frozen = null; FX.flash('#ffffff', 12, 0.5); FX.shake(6, 15); Audio_.play('levelup'); }
  die(game) {
    super.die(game);
    game.boss = null;
    for (const b of game.projectiles) if (b.hostile) b.dead = true;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.nameless_deity = true;
    if (Subworlds.snapshot) { const mw = Subworlds.snapshot.world; mw.bossesDefeated = mw.bossesDefeated || {}; mw.bossesDefeated.nameless_deity = true; }
    game.message('The Nameless Deity has been defeated!', '#ffe75a'); Audio_.play('levelup');
    FX.flash('#ffffff', 90, 1); FX.shake(12, 40); FX.burst(game, this.cx, this.cy, 80, ['#ffffff', '#f0e0ff', '#c0a0ff'], 10, 90, 5);
    game.dropItem(this.cx, this.cy, 'deific_touch', 1, null, null); game.dropItem(this.cx, this.cy, 'divine_monolith', 1, null, null); game.dropItem(this.cx, this.cy, 'lesser_healing', 10);
    if (Math.random() < 0.5 || game.expert) game.dropItem(this.cx, this.cy, 'cosmic_wings', 1, null, null);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'deity_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'deity_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 500000);
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 2, null, null);
  }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY);
    ctx.save(); ctx.globalAlpha = this.alpha * (this.hitFlash > 0 ? 0.6 : 1);
    // halo
    ctx.strokeStyle = 'rgba(240,220,255,0.7)'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x, y, 46 + k * 10 + Math.sin(this.t * 0.05 + k) * 3, 0, Math.PI * 2); ctx.stroke(); }
    // hands
    for (let k = 0; k < 3; k++) { const a = this.t * 0.02 + k * Math.PI * 2 / 3; const hx = x + Math.cos(a) * 70, hy = y + Math.sin(a) * 40; ctx.fillStyle = '#f0e8ff'; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(hx - 8, hy - 16, 3, 10); ctx.fillRect(hx - 2, hy - 18, 3, 12); ctx.fillRect(hx + 4, hy - 16, 3, 10); }
    // the eye
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x, y, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8040c0'; ctx.beginPath(); ctx.arc(x + this.dir * 6, y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + this.dir * 7, y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(x + this.dir * 9, y - 5, 3, 3);
    ctx.restore();
    if (this.sun) { const sx = snap(this.sun.x - camX), sy = snap(this.sun.y - camY); const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.sun.r + 20); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ffe080'); g.addColorStop(1, 'rgba(255,120,20,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, this.sun.r + 20, 0, Math.PI * 2); ctx.fill(); }
  }
}
BOSSES.push({ id: 'nameless_deity', name: 'The Nameless Deity', order: 99, hp: 9000, summon: 'divine_monolith',
  spawn: 'Ask Solyn to take you on a Journey (she moves in once you have defeated a boss). The fight takes place in the Eternal Garden, a separate dimension. A Divine Monolith takes you back there later.',
  info: 'A god without a name. It casts its attacks - each with a visible cast bar - then unleashes them: conjured explosions, starbursts, sword constellations along telegraphed lines, a growing sun that detonates, and a clock strike that freezes time. Solyn fights beside you.',
  loot: ['deific_touch', 'cosmic_wings', 'divine_monolith'], collectibles: ['deity_trophy', 'deity_mask'], despawn: 'The Nameless Deity turns its gaze away...' });

const WotG = {
  summonTimer: 0,
  journey(game, npc) {
    const n = Object.keys(game.world.bossesDefeated || {}).length + (game.world.bossDefeated ? 1 : 0);
    if (Subworlds.current === 'eternal_garden') { Subworlds.exit(game, 'journey'); return; }
    if (n < 3 && !(game.world.bossesDefeated || {}).nameless_deity) { if (game.dialog) game.dialog.text = `Not yet. Prove yourself against three bosses first (${n}/3), then I'll take you.`; else game.message(`Solyn: not yet. Defeat three bosses first (${n}/3).`, '#e0c0ff'); return; }
    game.closeDialog && game.closeDialog();
    Subworlds.enter(game, 'eternal_garden');
  },
  summonDeity(game) {
    const p = game.player;
    const mult = (game.expert ? 1.8 : 1) * (game.master ? 1.5 : 1) * Calamity.enemyMult(game);
    const b = new NamelessDeity(p.cx + 200, p.y - 200, mult);
    if (game.expert) b.damage = 60;
    game.enemies.push(b); game.boss = b;
    BossLog.start(game, b);
    game.message('The Nameless Deity has noticed you.', '#c040c0'); FX.flash('#ffffff', 30, 0.6); FX.shake(8, 40); Audio_.play('zombie');
  },
  draw(game) {
    const b = game.boss; if (!b || b.dead || b.type !== 'nameless_deity') return;
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    if (b.attack && b.castT < b.attack.cast) {
      const bw = 300, bx = W / 2 - bw / 2, by = H - 70 - 60;
      drawText(ctx, `Casting: ${b.attack.name}`, W / 2, by - 20, { size: 15, align: 'center', color: '#e0c0ff' });
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, bx, by, bw, 10, 4); ctx.fill(); ctx.fillStyle = '#e0c0ff'; roundRect(ctx, bx, by, bw * b.castT / b.attack.cast, 10, 4); ctx.fill();
    } else if (b.attack) drawText(ctx, b.attack.name, W / 2, H - 70 - 80, { size: 15, align: 'center', color: '#fff' });
  },
};
