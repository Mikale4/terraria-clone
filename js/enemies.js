// ---------------------------------------------------------------------------
// Enemies
// ---------------------------------------------------------------------------
'use strict';

class Enemy extends Entity {
  constructor(x, y, w, h, def) {
    super(x, y, w, h);
    this.def = def;
    this.name = def.name;
    this.maxHp = def.hp; this.hp = def.hp;
    this.damage = def.damage; this.defense = def.defense || 0;
    this.kbResist = def.kbResist || 0;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.hitFlash = 0; this.hitCooldown = 0;
    this.flying = !!def.flying;
    this.t = Math.floor(Math.random() * 1000);
    this.spawnTime = 0;
    this.hitBy = new Set(); // swing ids already hit
    this.debuffs = {};      // name -> {t, amount}
    this.lastHitDamage = 0;
  }
  applyDebuff(name, ticks, amount = 0) { const d = this.debuffs[name]; if (!d || d.t < ticks || amount > d.amount) this.debuffs[name] = { t: Math.max(ticks, d ? d.t : 0), amount: Math.max(amount, d ? d.amount : 0) }; }
  hasDebuff(name) { return !!this.debuffs[name]; }
  get slowFactor() { const d = this.debuffs.Slow; if (!d) return 1; const amt = this.isBoss ? d.amount * 0.2 : d.amount; return 1 / (1 + amt); }
  tickDebuffs(game) {
    for (const k in this.debuffs) {
      const d = this.debuffs[k]; d.t--;
      if (k === 'Poisoned' && d.t % 30 === 0) { this.hp -= 1; if (d.t % 60 === 0) game.addDamageText(this.cx, this.y, 1, '#60c060'); }
      if (k === 'Frostburn' && d.t % 8 === 0) { this.hp -= 1; if (d.t % 32 === 0) game.addDamageText(this.cx, this.y, 4, '#80d0ff'); }
      if (d.t <= 0) delete this.debuffs[k];
    }
    if (this.hp <= 0 && !this.dead) this.die(game);
  }

  hit(dmg, fromX, kb, game, swingId = null, crit = false) {
    if (swingId != null) { if (this.hitBy.has(swingId)) return false; this.hitBy.add(swingId); }
    if (this.weapon !== undefined && ArmedZombies.onHit(this, game, dmg, crit)) return false;
    // Critical hits deal double damage; defense absorbs half its value (rounded), minimum 1
    if (crit) dmg *= 2;
    const real = Math.max(1, Math.round(dmg - this.defense * 0.5));
    this.hp -= real; this.lastHitDamage = real;
    this.hitFlash = 8;
    if (typeof ModLib !== 'undefined') ModLib.emit('enemyHit', game, this, real);
    const dir = this.cx < fromX ? -1 : 1;
    const k = kb * (1 - this.kbResist);
    this.vx = dir * k * 0.9; this.vy = this.flying ? dir * 0 - k * 0.3 : -k * 0.6;
    game.addDamageText(this.cx, this.y, real, crit ? '#ff6a2a' : '#ffb060', crit);
    for (let i = 0; i < 5; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-3, 3), rand(-4, 0), this.def.blood, 40, 2));
    Audio_.play(this.def.hitSound || 'hit');
    if (this.hp <= 0) { this.die(game); return true; }
    return false;
  }

  die(game) {
    this.dead = true;
    Audio_.play('kill');
    if (this.isBoss) BossLog.onKill(game, this);
    for (let i = 0; i < 14; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-4, 4), rand(-5, 1), this.def.blood, 60, 3));
    // drops
    for (const d of this.def.drops || []) {
      if (Math.random() < d.chance) game.dropItem(this.cx, this.cy, d.id, randInt(d.min || 1, d.max || 1));
    }
    if (Math.random() < 0.16) game.drops.push(new HeartDrop(this.cx, this.cy));
    else if (Math.random() < 0.14 && !(game.player.acc && game.player.acc.starBand)) game.drops.push(new ManaStar(this.cx, this.cy, 50));
    // coins: NPC value with some random variation (Expert: x2.5)
    const base = ENEMY_COINS[this.type] || 0;
    let coins = Math.round(base * rand(0.75, 1.25) * (game.expert ? 2.5 : 1));
    if (game.pets) coins = game.pets.onKill(this, coins);
    if (coins > 0) game.dropCoins(this.cx, this.cy, coins);
    // rare pet drops
    if (!this.isBoss && Math.random() < 0.004) { const pool = Object.keys(PETS).filter(k => (PETS[k].rarity == null || PETS[k].rarity < 3)); game.dropItem(this.cx, this.cy, choose(pool), 1, null, null); }
    if (Math.random() < 0.08) game.dropItem(this.cx, this.cy, 'pet_food', randInt(1, 3));
    game.onEnemyKilled(this);
    game.player.stats.kills++;
  }

  // contact damage with player
  touchPlayer(player, game) {
    if (player.dead) return;
    if (this instanceof Slime && !this.isBoss && player.acc && player.acc.slimeCalm && this.hp === this.maxHp) return;
    if (this.x < player.x + player.w && this.x + this.w > player.x && this.y < player.y + player.h && this.y + this.h > player.y) {
      if (game.pets) game.pets.onEnemyTouch(this);
      player.damage(this.damage, this.cx, game, 'enemy', false, (/^[aeiou]/i.test(this.name) ? 'an ' : 'a ') + this.name, this);
    }
  }

  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    // decoy tail draws aggro
    if (game.pets && game.pets.decoy) { const d = game.pets.decoy; const fake = { cx: d.x + 10, cy: d.y + 21, x: d.x, y: d.y, w: d.w, h: d.h, dead: false }; this.ai(world, fake, game); }
    else this.ai(world, game.player, game);
    this.touchPlayer(game.player, game);
    // despawn far away
    const d = Math.abs(this.cx - game.player.cx) / TILE;
    if (d > 140 || Math.abs(this.cy - game.player.cy) / TILE > 90) this.dead = true;
  }

  drawShadowFlash(ctx) { if (this.hitFlash > 0) ctx.globalAlpha = 0.55; }
}

// Slime --------------------------------------------------------------------------
class Slime extends Enemy {
  constructor(x, y, def) {
    super(x, y, def.w || 26, def.h || 18, def);
    this.jumpTimer = randInt(40, 90);
    this.squash = 0;
  }
  ai(world, player, game) {
    this.updateLiquidState(world);
    if (this.inLava && !this.def.lavaProof) { this.dead = true; return; }
    if (this.onGround) {
      this.vx *= 0.8;
      this.jumpTimer--;
      if (this.jumpTimer <= 0) {
        const calm = player.acc && player.acc.slimeCalm && this.hp === this.maxHp;
        const toward = calm ? (Math.random() < 0.5 ? 1 : -1) : (player.cx > this.cx ? 1 : -1);
        this.dir = Math.random() < 0.85 ? toward : -toward;
        const big = Math.random() < 0.3;
        const sf = this.slowFactor;
        this.vx = this.dir * (big ? 3.5 : 2.2) * (this.def.speed || 1) * sf;
        this.vy = (big ? -7 : -5) * Math.max(0.4, sf);
        this.jumpTimer = randInt(45, 110);
        if (dist(this.cx, this.cy, player.cx, player.cy) < 400) Audio_.play('slime');
      }
    }
    this.applyGravity();
    this.moveAndCollide(world);
    // squash & stretch
    const target = this.onGround ? (this.jumpTimer < 8 ? 0.25 : 0) : -0.25;
    this.squash = lerp(this.squash, target, 0.25);
  }
  draw(ctx, camX, camY) {
    const sx = 1 + this.squash, sy = 1 - this.squash;
    const w = this.w * sx, h = this.h * sy;
    const x = snap(this.cx - camX - w / 2), y = snap(this.y + this.h - camY - h);
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 0.85;
    ctx.fillStyle = this.def.color;
    roundRect(ctx, x, y, Math.round(w), Math.round(h), Math.min(8, h / 2));
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, snap(x + w * 0.15), snap(y + h * 0.15), Math.round(w * 0.3), Math.round(h * 0.25), 3);
    ctx.fill();
    ctx.globalAlpha = 1;
    // eyes
    const ex = this.dir > 0 ? x + w * 0.62 : x + w * 0.22;
    ctx.fillStyle = '#000';
    ctx.fillRect(snap(ex), snap(y + h * 0.35), 3, 4);
    ctx.fillRect(snap(ex + this.dir * 6), snap(y + h * 0.35), 3, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(snap(ex + (this.dir > 0 ? 1 : 0)), snap(y + h * 0.35), 1, 1);
    ctx.fillRect(snap(ex + this.dir * 6 + (this.dir > 0 ? 1 : 0)), snap(y + h * 0.35), 1, 1);
  }
}

// Walker (zombie / skeleton) -------------------------------------------------------
class Walker extends Enemy {
  constructor(x, y, def) {
    super(x, y, 20, 42, def);
    this.canStep = true;
    this.walkPhase = 0;
    this.jumpCooldown = 0;
    this.groan = randInt(100, 400);
    if (def.armed !== false && /zombie|skeleton|bones|viking|face monster|goblin|pirate|etherian|kobold|martian|elf|frankenstein/i.test(def.name)) ArmedZombies.init(this); else { this.weapon = null; this.armor = null; }
  }
  ai(world, player, game) {
    this.updateLiquidState(world);
    if (this.inLava) { this.dead = true; return; }
    if (--this.groan <= 0) { this.groan = randInt(300, 700); if (dist(this.cx, this.cy, player.cx, player.cy) < 500) Audio_.play('zombie'); }
    if (ArmedZombies.ai(this, world, player, game)) return;
    const toward = player.cx > this.cx ? 1 : -1;
    // zombies only chase; skeletons too
    this.dir = toward;
    const speed = (this.def.speed || 1.0) * this.slowFactor;
    this.vx = lerp(this.vx, this.dir * speed, 0.1);
    this.applyGravity();
    this.moveAndCollide(world);
    if (this.jumpCooldown > 0) this.jumpCooldown--;
    if (this.onGround && this.collidedX && this.jumpCooldown === 0) { this.vy = -6.2; this.jumpCooldown = 30; }
    // jump over gaps
    if (this.onGround && this.jumpCooldown === 0) {
      const ax = Math.floor((this.cx + this.dir * 12) / TILE), fy = Math.floor((this.y + this.h + 1) / TILE);
      if (!world.isSolidAt(ax, fy) && !world.isPlatformAt(ax, fy) && !world.isSolidAt(ax, fy + 1) && !world.isSolidAt(ax, fy + 2) && player.y < this.y + 32) {
        if (Math.random() < 0.3) { this.vy = -6; this.jumpCooldown = 40; }
      }
    }
    if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1;
  }
  die(game) {
    super.die(game);
    // armed zombies sometimes drop what they were carrying
    if (this.weapon && Math.random() < 0.2) game.dropItem(this.cx, this.cy, ArmedZombies.weaponItem(this), 1);
    if (this.armor) for (const k of ['head', 'body', 'legs']) if (this.armor[k] && Math.random() < 0.25) game.dropItem(this.cx, this.cy, k === 'head' ? 'iron_helmet' : k === 'body' ? 'iron_chainmail' : 'iron_greaves', 1, null, null);
  }
  draw(ctx, camX, camY) {
    this.drawShadowFlash(ctx);
    const colors = Object.assign({}, this.def.colors);
    const ar = this.armor || {};
    if (ar.body) colors.shirt = MATERIALS.iron.m;
    if (ar.legs) { colors.pants = MATERIALS.iron.m; colors.shoes = MATERIALS.iron.d; }
    const item = this.weapon ? Sprites.icons[ArmedZombies.weaponItem(this)] : null;
    drawHumanoid(ctx, this.x - camX, this.y + this.gfxOffY - camY, {
      dir: this.dir, walk: this.onGround && Math.abs(this.vx) > 0.2 ? this.walkPhase : null, air: !this.onGround,
      colors, armAngle: this.armAngle != null ? this.armAngle : (this.weapon ? 0.9 : -0.1), item, hairStyle: 0, zombie: true, helmet: ar.head ? MATERIALS.iron : null
    });
    if (this.guard > 0) { ctx.strokeStyle = 'rgba(160,210,255,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(snap(this.cx - camX + this.dir * 12), snap(this.cy - camY), 12, -Math.PI / 2, Math.PI / 2, this.dir < 0); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
}

// Flyer (demon eye / bat) ----------------------------------------------------------
class Flyer extends Enemy {
  constructor(x, y, def) {
    super(x, y, def.w || 24, def.h || 20, def);
    this.flying = true;
    this.state = 'hover'; this.stateTimer = 60;
    this.wing = 0;
  }
  ai(world, player, game) {
    const dx = player.cx - this.cx, dy = player.cy - 10 - this.cy;
    const d = Math.hypot(dx, dy) || 1;
    this.stateTimer--;
    if (this.def.erratic) {
      // bat: jittery pursuit
      this.vx += dx / d * 0.15 + rand(-0.4, 0.4);
      this.vy += dy / d * 0.15 + rand(-0.4, 0.4);
      const sp = Math.hypot(this.vx, this.vy), max = (this.def.speed || 3.5) * this.slowFactor;
      if (sp > max) { this.vx *= max / sp; this.vy *= max / sp; }
    } else {
      if (this.state === 'hover') {
        // circle around the player at a distance, then charge
        const want = 160;
        const ang = this.t * 0.02;
        const tx = player.cx + Math.cos(ang) * want, ty = player.cy - 60 + Math.sin(ang) * 40;
        this.vx += (tx - this.cx) * 0.004; this.vy += (ty - this.cy) * 0.004;
        this.vx *= 0.96; this.vy *= 0.96;
        if (this.stateTimer <= 0) { this.state = 'charge'; this.stateTimer = 70; this.vx = dx / d * 6; this.vy = dy / d * 6; }
      } else {
        // charge: keep velocity, slight steering
        this.vx += dx / d * 0.05; this.vy += dy / d * 0.05;
        const sp = Math.hypot(this.vx, this.vy), mx = 6.5 * this.slowFactor; if (sp > mx) { this.vx *= mx / sp; this.vy *= mx / sp; }
        if (this.stateTimer <= 0) { this.state = 'hover'; this.stateTimer = randInt(60, 140); }
      }
    }
    this.dir = this.vx > 0 ? 1 : -1;
    this.moveAndCollide(world);
    if (this.collidedX) this.vx *= -0.8;
    if (this.vy === 0 && (this.onGround || this.y <= 0)) this.vy = -Math.abs(this.vy) - 1;
    this.wing += 0.3;
  }
  draw(ctx, camX, camY) {
    const x = snap(this.x - camX), y = snap(this.y - camY);
    this.drawShadowFlash(ctx);
    const flap = Math.sin(this.wing) * 5;
    if (this.def.kind === 'eye') {
      // wings
      ctx.fillStyle = '#5a3a4a';
      ctx.beginPath(); ctx.moveTo(x + 4, y + 8); ctx.lineTo(x - 8, y + 2 - flap); ctx.lineTo(x - 6, y + 14 - flap); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + this.w - 4, y + 8); ctx.lineTo(x + this.w + 8, y + 2 - flap); ctx.lineTo(x + this.w + 6, y + 14 - flap); ctx.closePath(); ctx.fill();
      // eyeball
      ctx.fillStyle = '#e8e0e0'; ctx.beginPath(); ctx.ellipse(x + this.w / 2, y + this.h / 2, this.w / 2, this.h / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c04040'; ctx.beginPath(); ctx.arc(x + this.w / 2 + this.dir * 4, y + this.h / 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#100000'; ctx.beginPath(); ctx.arc(x + this.w / 2 + this.dir * 5, y + this.h / 2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c05050'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 3, y + 5); ctx.lineTo(x + 8, y + 8); ctx.moveTo(x + this.w - 3, y + 5); ctx.lineTo(x + this.w - 8, y + 8); ctx.stroke();
    } else {
      // bat
      ctx.fillStyle = this.def.color;
      ctx.beginPath(); ctx.moveTo(x + 10, y + 8); ctx.lineTo(x - 4, y + 2 - flap); ctx.lineTo(x - 2, y + 12); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + this.w - 10, y + 8); ctx.lineTo(x + this.w + 4, y + 2 - flap); ctx.lineTo(x + this.w + 2, y + 12); ctx.closePath(); ctx.fill();
      ctx.fillRect(x + 6, y + 4, this.w - 12, this.h - 8);
      ctx.fillStyle = '#ff4040'; ctx.fillRect(x + 8 + (this.dir > 0 ? 4 : 0), y + 7, 2, 2); ctx.fillRect(x + this.w - 10 - (this.dir > 0 ? 0 : 4), y + 7, 2, 2);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 9, y + this.h - 6, 1, 2); ctx.fillRect(x + this.w - 10, y + this.h - 6, 1, 2);
    }
    ctx.globalAlpha = 1;
  }
}


// Boss: Eye of Cthulhu -------------------------------------------------------------------
class EyeOfCthulhu extends Enemy {
  constructor(x, y) {
    super(x, y, 96, 96, { name: 'Eye of Cthulhu', hp: 2800, damage: 15, defense: 12, kbResist: 1, blood: '#c03030', flying: true, drops: [] });
    this.flying = true;
    this.phase = 1;
    this.state = 'hover'; this.stateTimer = 150; this.charges = 0;
    this.angle = 0; this.servantTimer = 300;
    this.isBoss = true;
  }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (world.isDay() && this.t > 120) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) { this.phase = 2; this.damage = 23; this.state = 'pause'; this.stateTimer = 40; Audio_.play('kill'); for (let i = 0; i < 30; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-5, 5), rand(-5, 5), '#c03030', 50, 3)); }
    const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1;
    this.stateTimer--;
    const spd1 = this.phase === 1 ? 7.5 : 10.5;
    if (this.state === 'hover') {
      const side = this.cx < p.cx ? -1 : 1;
      const tx = p.cx + side * 260, ty = p.cy - 220;
      this.vx += (tx - this.cx) * 0.01; this.vy += (ty - this.cy) * 0.01;
      this.vx *= 0.93; this.vy *= 0.93;
      if (this.stateTimer <= 0) { this.state = 'charge'; this.charges = this.phase === 1 ? 3 : 5; this.stateTimer = 0; }
      if (this.phase === 1 && --this.servantTimer <= 0) { this.servantTimer = 400; const e = spawnEnemy('demon_eye', this.cx, this.cy); e.hp = e.maxHp = 30; game.enemies.push(e); }
    } else if (this.state === 'charge') {
      if (this.stateTimer <= 0) {
        if (this.charges <= 0) { this.state = 'hover'; this.stateTimer = this.phase === 1 ? 150 : 60; }
        else { this.charges--; this.vx = dx / d * spd1; this.vy = dy / d * spd1; this.stateTimer = this.phase === 1 ? 45 : 32; Audio_.play('zombie'); }
      } else if (this.stateTimer < 12) { this.vx *= 0.85; this.vy *= 0.85; }
    } else if (this.state === 'pause') { this.vx *= 0.9; this.vy *= 0.9; if (this.stateTimer <= 0) { this.state = 'charge'; this.charges = 5; } }
    const sf = this.slowFactor;
    this.x += this.vx * sf; this.y += this.vy * sf;
    if (this.y < 16) this.y = 16;
    this.angle = Math.atan2(dy, dx);
    this.touchPlayer(p, game);
    game.lighting.extraLights.push({ x: this.cx / TILE, y: this.cy / TILE, r: 0.6, g: 0.2, b: 0.2 });
  }
  die(game) {
    super.die(game);
    game.boss = null;
    game.world.bossDefeated = true;
    game.message('The Eye of Cthulhu has been defeated!', '#ffe75a');
    Audio_.play('levelup');
    game.dropItem(this.cx, this.cy, 'gold_bar', 15); game.dropItem(this.cx, this.cy, 'lesser_healing', 5); game.dropItem(this.cx, this.cy, 'diamond', 4); game.dropItem(this.cx, this.cy, 'hook', 1);
    if (game.expert || Math.random() < 0.25) game.dropItem(this.cx, this.cy, 'grinning_eye', 1, null, null);
    if (game.expert) { game.dropItem(this.cx, this.cy, 'tentacle', 1, null, null); game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null); }
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'eye_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'eye_mask', 1, null, null);
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.eye_of_cthulhu = true;
    for (let i = 0; i < 60; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-7, 7), rand(-7, 7), choose(['#c03030', '#e8e0e0', '#600000']), 80, 3));
  }
  draw(ctx, camX, camY) {
    const cx = this.cx - camX, cy = this.cy - camY, r = this.w / 2;
    ctx.save();
    ctx.translate(cx, cy);
    // tentacles trailing behind
    const back = this.angle + Math.PI;
    ctx.strokeStyle = '#7a3040'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = back + (i - 3) * 0.28;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8);
      const wig = Math.sin(this.t * 0.15 + i) * 10;
      ctx.quadraticCurveTo(Math.cos(a) * r * 1.3 + wig, Math.sin(a) * r * 1.3, Math.cos(a) * r * 1.7 - wig, Math.sin(a) * r * 1.7 + wig);
      ctx.stroke();
    }
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1;
    // eyeball
    ctx.fillStyle = this.phase === 1 ? '#e8dcd8' : '#c8a8a8';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    // veins
    ctx.strokeStyle = '#c04848'; ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.lineTo(Math.cos(a + 0.3) * r * 0.55, Math.sin(a + 0.3) * r * 0.55); ctx.stroke(); }
    ctx.rotate(this.angle);
    if (this.phase === 1) {
      ctx.fillStyle = '#4a7ad0'; ctx.beginPath(); ctx.arc(r * 0.35, 0, r * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0a20'; ctx.beginPath(); ctx.arc(r * 0.42, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.12, r * 0.08, 0, Math.PI * 2); ctx.fill();
    } else {
      // mouth with teeth
      ctx.fillStyle = '#300810'; ctx.beginPath(); ctx.ellipse(r * 0.3, 0, r * 0.45, r * 0.38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = -3; i <= 3; i++) { const yy = i * r * 0.11; ctx.beginPath(); ctx.moveTo(r * 0.05, yy - 3); ctx.lineTo(r * 0.3, yy); ctx.lineTo(r * 0.05, yy + 3); ctx.fill(); ctx.beginPath(); ctx.moveTo(r * 0.72, yy - 3); ctx.lineTo(r * 0.45, yy); ctx.lineTo(r * 0.72, yy + 3); ctx.fill(); }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// Heart pickup ------------------------------------------------------------------------
class HeartDrop extends Entity {
  constructor(x, y) { super(x - 6, y - 6, 12, 12); this.vx = rand(-1, 1); this.vy = -2; this.life = 60 * 60; }
  update(world, player, game) {
    this.life--; if (this.life <= 0) { this.dead = true; return; }
    this.updateLiquidState(world);
    if (this.inLava) { this.dead = true; return; }
    const d = dist(this.cx, this.cy, player.cx, player.cy);
    if (!player.dead && d < 40) {
      const dx = player.cx - this.cx, dy = player.cy - this.cy;
      this.x += dx / d * 4; this.y += dy / d * 4;
      if (d < 14) { player.hp = Math.min(player.maxHp, player.hp + 20); Audio_.play('heal'); game.addDamageText(player.cx, player.y, '+20', '#40e060'); this.dead = true; }
      return;
    }
    this.applyGravity(0.6); this.vx *= 0.9; this.moveAndCollide(world);
  }
  draw(ctx, camX, camY, t) {
    const bob = Math.sin(t * 0.1) * 2;
    ctx.drawImage(Sprites.misc.heart, snap(this.cx - camX - 8), snap(this.cy - camY - 8 + bob));
  }
}

// Enemy definitions ----------------------------------------------------------------------
const ENEMY_DEFS = {
  green_slime: { name: 'Green Slime', cls: Slime, hp: 14, damage: 6, color: 'rgba(60,200,70,1)', blood: '#3cc046', drops: [{ id: 'gel', chance: 1, min: 1, max: 2 }] },
  blue_slime: { name: 'Blue Slime', cls: Slime, hp: 25, damage: 7, color: 'rgba(60,110,230,1)', blood: '#4070e0', drops: [{ id: 'gel', chance: 1, min: 1, max: 2 }] },
  purple_slime: { name: 'Purple Slime', cls: Slime, hp: 40, damage: 12, defense: 6, w: 30, h: 22, color: 'rgba(150,60,220,1)', blood: '#9040d0', drops: [{ id: 'gel', chance: 1, min: 1, max: 3 }] },
  red_slime: { name: 'Red Slime', cls: Slime, hp: 35, damage: 12, defense: 4, color: 'rgba(220,50,60,1)', blood: '#d03040', drops: [{ id: 'gel', chance: 1, min: 1, max: 3 }] },
  ice_slime: { name: 'Ice Slime', cls: Slime, hp: 30, damage: 8, defense: 4, color: 'rgba(160,220,255,1)', blood: '#a0d8ff', drops: [{ id: 'gel', chance: 1, min: 1, max: 2 }] },
  sand_slime: { name: 'Sand Slime', cls: Slime, hp: 30, damage: 9, defense: 2, color: 'rgba(220,200,120,1)', blood: '#d0c080', drops: [{ id: 'gel', chance: 1, min: 1, max: 2 }] },
  lava_slime: { name: 'Lava Slime', cls: Slime, hp: 50, damage: 25, defense: 10, lavaProof: true, color: 'rgba(255,120,30,1)', blood: '#ff7020', drops: [{ id: 'gel', chance: 1, min: 2, max: 4 }, { id: 'hellstone', chance: 0.3, min: 1, max: 3 }] },
  mother_slime: { name: 'Mother Slime', cls: Slime, hp: 90, damage: 20, defense: 12, w: 40, h: 30, kbResist: 0.5, color: 'rgba(90,60,140,1)', blood: '#6040a0', drops: [{ id: 'gel', chance: 1, min: 4, max: 8 }] },
  zombie: { name: 'Zombie', cls: Walker, hp: 45, damage: 14, defense: 6, speed: 1.0, colors: { skin: '#8ab070', hair: '#3a3a2a', shirt: '#4a4a5a', pants: '#3a3040', shoes: '#2a2020', eye: '#c02020' }, blood: '#7a9a50', drops: [{ id: 'rotten_chunk', chance: 0.35, min: 1, max: 2 }] },
  skeleton: { name: 'Skeleton', cls: Walker, hp: 70, damage: 20, defense: 8, speed: 1.4, colors: { skin: '#e8e8e0', hair: '#e8e8e0', shirt: '#d0d0c8', pants: '#c0c0b8', shoes: '#a0a098', eye: '#202020' }, blood: '#d8d8d0', drops: [{ id: 'iron_bar', chance: 0.15, min: 1, max: 2 }, { id: 'lesser_healing', chance: 0.1 }, { id: 'hook', chance: 0.03 }] },
  demon_eye: { name: 'Demon Eye', cls: Flyer, hp: 60, damage: 18, defense: 2, kind: 'eye', w: 24, h: 20, blood: '#c03030', drops: [{ id: 'lens', chance: 0.33 }] },
  bat: { name: 'Cave Bat', cls: Flyer, hp: 16, damage: 13, kind: 'bat', erratic: true, w: 20, h: 14, color: '#3a2a3a', blood: '#5a3a4a', speed: 3.2, drops: [] },
  hell_bat: { name: 'Hellbat', cls: Flyer, hp: 40, damage: 30, defense: 6, kind: 'bat', erratic: true, w: 24, h: 16, color: '#a02a1a', blood: '#c04020', speed: 4, drops: [{ id: 'hellstone', chance: 0.2, min: 1, max: 2 }] },
};

function spawnEnemy(type, x, y, expert = false) {
  const def = ENEMY_DEFS[type];
  const e = new def.cls(x, y, def);
  e.type = type;
  if (expert) { e.maxHp = e.hp = Math.round(e.hp * 2); e.damage = Math.round(e.damage * 2); }
  // Calamity: Revengeance / Death scale everything further
  const cm = (typeof Calamity !== 'undefined' && window.game && window.game.world) ? Calamity.enemyMult(window.game) : 1;
  if (cm !== 1) { e.maxHp = e.hp = Math.round(e.hp * cm); e.damage = Math.round(e.damage * cm); }
  return e;
}
