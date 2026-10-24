// ---------------------------------------------------------------------------
// The Adventure Squad: TerraGuardians-style companions. Five followers (Nathan,
// Logan, Hero, Shiro, Nago) summoned from bags a new character receives. They
// follow you, fight with their own weapons, level up, get knocked out and
// revived, take orders and chat.
// ---------------------------------------------------------------------------
'use strict';

const COMPANION_DEFS = {
  nathan: { name: 'Nathan', hairStyle: 0, colors: { skin: '#f2c6a0', hair: '#3a2a1a', shirt: '#2a6a9a', pants: '#3a3a4a', shoes: '#2a2a2a', eye: '#3a8ad0' },
    weapon: { kind: 'sword', item: 'wooden_sword', damage: 7, useTime: 21, reach: 52 }, minion: { damage: 6, rate: 45 },
    starter: 'Wooden Sword and Finch Staff',
    lines: { greet: ["Finch says hi. He's the real muscle of this squad.", "Ready when you are. Finch, stay close!", "A wooden sword and a bird. What could go wrong?"],
      idle: ["Did you hear that? ...no? Finch did.", "One day I'll get a real staff. Until then, chirp chirp."],
      fight: ["Go, Finch!", "For the squad!"], levelup: ["Finch and I are getting stronger!"] } },
  logan: { name: 'Logan', hairStyle: 1, colors: { skin: '#e8c8a0', hair: '#c0a060', shirt: '#7a3a3a', pants: '#4a3a2a', shoes: '#2a2a2a', eye: '#5a8a3a' },
    weapon: { kind: 'sword', item: 'copper_broadsword', damage: 9, useTime: 21, reach: 52 },
    starter: 'Tin Broadsword',
    lines: { greet: ["Tin broadsword, don't laugh. It's sharper than it looks.", "Point me at something and I'll cut it.", "Logan, at your service. Mostly."],
      idle: ["I could use a better blade... hint hint.", "Do you think slimes feel pain? ...Never mind."],
      fight: ["Come here!", "Hah! Too slow!"], levelup: ["I'm getting the hang of this."] } },
  hero: { name: 'Hero', hairStyle: 0, colors: { skin: '#f2c6a0', hair: '#f0e060', shirt: '#4a4aa0', pants: '#2a2a6a', shoes: '#3a2a1a', eye: '#3a6ad0' },
    weapon: { kind: 'spark', item: null, damage: 14, useTime: 26, range: 6 * TILE },
    starter: 'Wand of Sparking',
    lines: { greet: ["Behold: sparks! Tiny, but they add up.", "They call me Hero. It's a work in progress.", "Magic is just science that sparkles."],
      idle: ["I'd love a Mana Crystal. Do those exist here?", "Stand back - the wand gets a little excited."],
      fight: ["Feel the spark!", "Zap!"], levelup: ["My sparks burn brighter!"] } },
  shiro: { name: 'Shiro', hairStyle: 1, colors: { skin: '#f8e0d0', hair: '#f4f4f4', shirt: '#6a4a8a', pants: '#3a2a4a', shoes: '#2a2a2a', eye: '#a03050' },
    weapon: { kind: 'bow', item: null, damage: 9, useTime: 29, range: 12 * TILE },
    starter: 'Wooden Bow and Arrows',
    lines: { greet: ["I'll cover you from a distance. Don't walk into my arrows.", "Shiro. Bow. Arrows. Any questions?", "...Hi."],
      idle: ["Counting arrows. I always count arrows.", "The trees here are good for hiding. Just saying."],
      fight: ["Target acquired.", "Hold still."], levelup: ["My aim improves."] } },
  nago: { name: 'Nago', hairStyle: 0, colors: { skin: '#c89060', hair: '#202020', shirt: '#3a7a5a', pants: '#3a3a3a', shoes: '#2a2a2a', eye: '#2a2a2a' },
    weapon: { kind: 'shortsword', item: 'copper_shortsword', damage: 6, useTime: 13, reach: 36 },
    starter: 'Copper Shortsword',
    lines: { greet: ["A shortsword means I have to get close. I like close.", "Nago here. Let's go find trouble.", "Everyone got a fancy weapon. I got a pointy stick. It's fine."],
      idle: ["Race you to the next cave.", "I once poked a zombie 40 times. It stopped moving eventually."],
      fight: ["Poke poke poke!", "Get out of my face!"], levelup: ["Faster pokes!"] } },
};
for (const id in COMPANION_DEFS) {
  const d = COMPANION_DEFS[id];
  defItem(`${id}_bag`, { name: `${d.name}'s Bag`, consumable: true, max: 1, rarity: 2, tooltip: `Summons ${d.name} to your squad (starts with ${d.starter})` });
  ITEM_VALUES[`${id}_bag`] = 0; ITEMS[`${id}_bag`].value = 0;
}
const SQUAD_CAP = 5;

class Companion extends Entity {
  constructor(id, x, y) {
    super(x, y, 20, 42);
    this.id = id; this.def = Object.assign({}, COMPANION_DEFS[id], { buttons: ['Chat', 'Stay here', 'Dismiss'], lines: COMPANION_DEFS[id].lines.greet, town: false }); this.name = this.def.name; this.role = 'Companion'; this.isCompanion = true;
    this.canStep = true; this.dir = 1; this.walkPhase = 0;
    this.level = 1; this.xp = 0; this.maxHp = 100; this.hp = 100;
    this.order = 'follow'; this.ko = 0; this.invuln = 0; this.hitFlash = 0; this.regenCounter = 0;
    this.useTimer = 0; this.useDuration = 0; this.armAngle = null; this.attackCd = 0; this.minionCd = 0; this.jumpCd = 0;
    this.talking = false; this.emote = null; this.emoteLife = 0; this.emoteTimer = randInt(600, 1800); this.stuck = 0;
    this.colors = Object.assign({}, this.def.colors); this.hairStyle = this.def.hairStyle;
    this.swingId = 0; this.hitBy = new Set();
  }
  get title() { return `${this.name}  (Lv ${this.level})`; }
  get defense() { return 4 + this.level; }
  get damageMult() { return 1 + 0.08 * (this.level - 1); }
  xpToNext() { return 100 * this.level; }

  gainXp(n, game) {
    this.xp += n;
    while (this.xp >= this.xpToNext()) {
      this.xp -= this.xpToNext(); this.level++; this.maxHp = 100 + 20 * (this.level - 1); this.hp = this.maxHp;
      game.message(`${this.name} reached level ${this.level}!`, '#ffe75a'); this.say(choose(this.def.lines_levelup || COMPANION_DEFS[this.id].lines.levelup || ['Stronger!'])); Audio_.play('levelup');
    }
  }
  say(text) { this.emote = text; this.emoteLife = 150; }

  hit(dmg, fromX, game) {
    if (this.invuln > 0 || this.ko > 0) return;
    const real = Math.max(1, Math.round(dmg - this.defense / 2));
    this.hp -= real; this.invuln = 30; this.hitFlash = 8;
    this.vx = (this.cx < fromX ? -1 : 1) * 2; this.vy = -2;
    game.addDamageText(this.cx, this.y, real, '#ff5050');
    Audio_.play('hurt');
    if (this.hp <= 0) { this.hp = 0; this.ko = 60 * 60; this.armAngle = null; game.message(`${this.name} was knocked out!`, '#ff8080'); }
  }
  revive(game, frac = 0.5) { this.ko = 0; this.hp = Math.max(1, Math.floor(this.maxHp * frac)); this.invuln = 90; game.message(`${this.name} is back on their feet!`, '#50ff50'); }

  update(world, game) {
    const p = game.player;
    if (this.invuln > 0) this.invuln--;
    if (this.hitFlash > 0) this.hitFlash--;
    if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null;
    if (this.ko > 0) { this.ko--; this.vx *= 0.8; this.updateLiquidState(world); this.applyGravity(); this.moveAndCollide(world); if (this.ko === 0) this.revive(game, 0.5); return; }
    if (this.hp < this.maxHp && ++this.regenCounter >= 45) { this.regenCounter = 0; this.hp++; }
    if (this.useTimer > 0) { this.useTimer--; const t = 1 - this.useTimer / this.useDuration; this.armAngle = lerp(-2.3, 0.6, smoothstep(t)); } else this.armAngle = null;
    if (this.attackCd > 0) this.attackCd--;
    if (this.jumpCd > 0) this.jumpCd--;
    // target
    let target = null, best = 25 * TILE;
    for (const e of game.enemies) { const d = dist(e.cx, e.cy, this.cx, this.cy); if (d < best) { best = d; target = e; } }
    let moveDir = 0, wantJump = false;
    const w = this.def.weapon;
    if (this.talking) { this.dir = p.cx < this.cx ? -1 : 1; }
    else if (target) {
      const dx = target.cx - this.cx, adx = Math.abs(dx);
      this.dir = dx < 0 ? -1 : 1;
      if (w.kind === 'sword' || w.kind === 'shortsword') {
        if (adx > w.reach - 8) moveDir = this.dir; else if (adx < 10) moveDir = -this.dir;
        if (target.y + target.h < this.y - 8 && this.onGround && this.jumpCd === 0) wantJump = true;
        if (adx <= w.reach + 4 && Math.abs(target.cy - this.cy) < 48 && this.attackCd === 0) this.swing(target, game);
      } else {
        const ideal = w.kind === 'spark' ? 4.5 * TILE : 8 * TILE;
        if (adx > ideal + 16) moveDir = this.dir; else if (adx < ideal - 40) moveDir = -this.dir;
        if (adx <= w.range && this.attackCd === 0) this.shoot(target, game);
      }
      if (Math.random() < 0.004) this.say(choose(COMPANION_DEFS[this.id].lines.fight));
    } else if (this.order === 'follow') {
      const idx = game.companions.indexOf(this);
      const tx = p.cx - p.dir * (34 + idx * 22);
      const dx = tx - this.cx;
      if (Math.abs(dx) > 24) { moveDir = dx < 0 ? -1 : 1; this.dir = moveDir; }
      if (p.y + p.h < this.y - 20 && Math.abs(dx) < 80 && this.onGround && this.jumpCd === 0) wantJump = true;
      // lost: teleport to the player
      if (dist(this.cx, this.cy, p.cx, p.cy) > 40 * TILE || this.stuck > 240) { this.x = p.x; this.y = p.y; this.vx = 0; this.vy = 0; this.stuck = 0; }
    }
    // Nathan's finch minion
    if (this.def.minion && !this.talking && --this.minionCd <= 0) { this.minionCd = this.def.minion.rate; if (target) { const dx = target.cx - this.cx, dy = target.cy - (this.y - 10), d = Math.hypot(dx, dy) || 1; game.projectiles.push(new Projectile(this.cx, this.y - 10, dx / d * 7, dy / d * 7, { kind: 'finch', damage: Math.round(this.def.minion.damage * this.damageMult), friendly: true, owner: this, knockback: 2, pierce: 3 })); } }
    // movement
    if (moveDir) this.vx = lerp(this.vx, moveDir * 2.4, 0.2); else this.vx *= 0.8;
    if (moveDir && world.time % 10 === 0) { const ax = Math.floor((this.cx + this.dir * 12) / TILE), ay = Math.floor((this.y + this.h / 2) / TILE); if (world.get(ax, ay) === T.DOOR_C) { world.toggleDoor(ax, ay, null); Audio_.play('door'); } }
    this.updateLiquidState(world);
    if (this.inWater && (moveDir || wantJump)) this.vy = Math.min(this.vy, -2.5);
    this.applyGravity();
    const px = this.x;
    this.moveAndCollide(world);
    if ((this.collidedX || wantJump) && this.onGround && this.jumpCd === 0) { this.vy = -6.2; this.jumpCd = 25; }
    this.stuck = moveDir && Math.abs(this.x - px) < 0.2 ? this.stuck + 1 : 0;
    if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1; else this.walkPhase = 0;
    if (this.inLava) { this.hit(50, this.cx, game); this.x = p.x; this.y = p.y - 8; }
    if (--this.emoteTimer <= 0 && !this.emote) { this.emoteTimer = randInt(900, 2400); if (dist(this.cx, this.cy, p.cx, p.cy) < 12 * TILE) this.say(choose(COMPANION_DEFS[this.id].lines.idle)); }
  }

  swing(target, game) {
    const w = this.def.weapon;
    this.useTimer = this.useDuration = w.useTime; this.attackCd = w.useTime; this.swingId++;
    const x0 = this.dir > 0 ? this.cx : this.cx - w.reach, x1 = this.dir > 0 ? this.cx + w.reach : this.cx;
    let hit = false;
    for (const e of game.enemies) if (e.x < x1 && e.x + e.w > x0 && e.y < this.y + this.h + 4 && e.y + e.h > this.y - 10) { e.hit(Math.round(w.damage * this.damageMult), this.cx, 4, game, 'c' + this.id + this.swingId, Math.random() < 0.04); hit = true; }
    Audio_.play(hit ? 'hit' : 'swing');
  }
  shoot(target, game) {
    const w = this.def.weapon;
    this.useTimer = this.useDuration = 12; this.attackCd = w.useTime;
    const dx = target.cx - this.cx, dy = target.cy - (this.y + 14), d = Math.hypot(dx, dy) || 1;
    const kind = w.kind === 'bow' ? 'arrow' : 'spark', speed = w.kind === 'bow' ? 10 : 6, arc = w.kind === 'bow' ? -Math.min(3, d / 120) : 0;
    game.projectiles.push(new Projectile(this.cx, this.y + 14, dx / d * speed, dy / d * speed + arc, { kind, damage: Math.round(w.damage * this.damageMult), friendly: true, owner: this, knockback: kind === 'spark' ? 1 : 3, pierce: kind === 'spark' ? 2 : 0 }));
    Audio_.play('swing');
  }

  draw(ctx, camX, camY) {
    if (this.def.draw && this.def.draw(this, ctx, camX, camY)) return;
    if (this.ko > 0) {
      ctx.save(); ctx.translate(snap(this.x - camX + 10), snap(this.y + this.h - camY - 6)); ctx.rotate(this.dir * Math.PI / 2); ctx.globalAlpha = 0.85;
      drawHumanoid(ctx, -10, -21, { dir: this.dir, walk: null, colors: this.colors, armAngle: null, item: null, hairStyle: this.hairStyle });
      ctx.restore(); ctx.globalAlpha = 1; return;
    }
    if (this.hitFlash > 0) ctx.globalAlpha = 0.6;
    const item = this.armAngle != null && this.def.weapon.item ? Sprites.icons[this.def.weapon.item] : null;
    drawHumanoid(ctx, this.x - camX, this.y + this.gfxOffY - camY, { dir: this.dir, walk: this.onGround && Math.abs(this.vx) > 0.2 ? this.walkPhase : null, air: !this.onGround, colors: this.colors, armAngle: this.armAngle, item, hairStyle: this.hairStyle });
    ctx.globalAlpha = 1;
  }
}
