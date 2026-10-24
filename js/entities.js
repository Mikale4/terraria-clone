// ---------------------------------------------------------------------------
// Entities: base physics, player, item drops, particles, damage text, NPC
// ---------------------------------------------------------------------------
'use strict';

const GRAVITY = 0.4;
const EPS = 0.001;          // entities occupy [x, x+w): the far edge itself does not overlap the next tile
const MAX_FALL = 10;

class Entity {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.px = x; this.py = y;   // previous-tick position (render interpolation)
    this.gfxOffY = 0;           // visual offset that smooths one-tile step-ups (Terraria gfxOffY)
    this.vx = 0; this.vy = 0;
    this.onGround = false; this.dead = false; this.inWater = false; this.inLava = false;
    this.dropThrough = false;
    this.canStep = false;
    this.collidedX = false;
  }
  get cx() { return this.x + this.w / 2; }
  get cy() { return this.y + this.h / 2; }
  get tileX() { return Math.floor(this.cx / TILE); }
  get tileY() { return Math.floor(this.cy / TILE); }

  overlapsSolid(world, x, y) {
    const x0 = Math.floor(x / TILE), x1 = Math.floor((x + this.w - EPS) / TILE);
    const y0 = Math.floor(y / TILE), y1 = Math.floor((y + this.h - EPS) / TILE);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (world.isSolidAt(tx, ty)) return true;
    return false;
  }

  updateLiquidState(world) {
    const tx = this.tileX, ty = Math.floor((this.y + this.h * 0.6) / TILE);
    const amt = world.liquidAt(tx, ty);
    const wasInWater = this.inWater;
    this.inWater = amt > 60;
    this.inLava = this.inWater && world.lavaAt(tx, ty) === 1;
    return !wasInWater && this.inWater;
  }

  applyGravity(mult = 1) {
    if (this.inWater) { this.vy += GRAVITY * 0.35 * mult; if (this.vy > 3) this.vy = 3; if (this.vy < -3) this.vy = -3; }
    else { this.vy += GRAVITY * mult; if (this.vy > MAX_FALL) this.vy = MAX_FALL; }
  }

  moveAndCollide(world) {
    this.collidedX = false;
    if (this.noclip) { this.x += this.vx; this.y += this.vy; this.onGround = false; return; }
    const wasOnGround = this.onGround;
    if (this.gfxOffY !== 0) { const d = Math.min(Math.abs(this.gfxOffY), 3); this.gfxOffY -= Math.sign(this.gfxOffY) * d; if (Math.abs(this.gfxOffY) < 0.5) this.gfxOffY = 0; }
    // --- X axis ---
    let nx = this.x + this.vx;
    if (this.vx !== 0) {
      const dir = this.vx > 0 ? 1 : -1;
      const col = dir > 0 ? Math.floor((nx + this.w - EPS) / TILE) : Math.floor(nx / TILE);
      const y0 = Math.floor(this.y / TILE), y1 = Math.floor((this.y + this.h - EPS) / TILE);
      let hit = false;
      for (let ty = y0; ty <= y1; ty++) if (world.isSolidAt(col, ty)) { hit = true; break; }
      if (hit && this.canStep && wasOnGround) {
        // try stepping up one tile
        const sy = this.y - TILE;
        if (!this.overlapsSolid(world, this.x, sy) && !this.overlapsSolid(world, nx, sy)) {
          // make sure the obstacle is exactly one tile: the tile above the obstacle row must be free
          this.y = sy; hit = false; this.gfxOffY += TILE;
        }
      }
      if (hit) {
        nx = dir > 0 ? col * TILE - this.w : (col + 1) * TILE;
        this.vx = 0; this.collidedX = true;
      }
    }
    this.x = nx;
    // --- Y axis ---
    let ny = this.y + this.vy;
    this.onGround = false;
    if (this.vy > 0) {
      const row = Math.floor((ny + this.h - EPS) / TILE);
      const x0 = Math.floor(this.x / TILE), x1 = Math.floor((this.x + this.w - EPS) / TILE);
      const prevBottom = this.y + this.h;
      let hit = false;
      for (let tx = x0; tx <= x1; tx++) {
        const id = world.get(tx, row);
        const def = TILES[id];
        if (def.solid) { hit = true; break; }
        if (def.platform && !this.dropThrough && prevBottom <= row * TILE + 0.01) { hit = true; break; }
      }
      if (hit) { ny = row * TILE - this.h; this.vy = 0; this.onGround = true; }
    } else if (this.vy < 0) {
      const row = Math.floor(ny / TILE);
      const x0 = Math.floor(this.x / TILE), x1 = Math.floor((this.x + this.w - EPS) / TILE);
      let hit = false;
      for (let tx = x0; tx <= x1; tx++) if (world.isSolidAt(tx, row)) { hit = true; break; }
      if (hit) { ny = (row + 1) * TILE; this.vy = 0; }
    } else {
      // resting check
      const row = Math.floor((ny + this.h) / TILE);
      const x0 = Math.floor(this.x / TILE), x1 = Math.floor((this.x + this.w - EPS) / TILE);
      for (let tx = x0; tx <= x1; tx++) {
        const def = TILES[world.get(tx, row)];
        if (def.solid || (def.platform && !this.dropThrough && Math.abs(ny + this.h - row * TILE) < 0.01)) { this.onGround = true; break; }
      }
    }
    this.y = ny;
    // world bounds
    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x + this.w > world.w * TILE) { this.x = world.w * TILE - this.w; this.vx = 0; }
    if (this.y < 0) { this.y = 0; this.vy = 0; }
    if (this.y + this.h > (world.h - 1) * TILE) { this.y = (world.h - 1) * TILE - this.h; this.vy = 0; this.onGround = true; }
  }

  // Is entity standing on ice?
  onSlippery(world) {
    if (!this.onGround) return false;
    const row = Math.floor((this.y + this.h) / TILE);
    const x0 = Math.floor(this.x / TILE), x1 = Math.floor((this.x + this.w - EPS) / TILE);
    for (let tx = x0; tx <= x1; tx++) if (TILES[world.get(tx, row)].slippery) return true;
    return false;
  }
}

// ---------------------------------------------------------------------------
// Humanoid drawing (player, guide, zombie)
// ---------------------------------------------------------------------------
function drawHumanoid(ctx, x, y, o) {
  // o: {dir, walk (0..1 phase or null), colors:{skin,hair,shirt,pants,shoes,eye}, armAngle (rad, or null), item (canvas), hairStyle, bob}
  const c = o.colors;
  ctx.save();
  ctx.translate(snap(x + 10), snap(y));
  if (o.dir < 0) ctx.scale(-1, 1);
  const walk = o.walk;
  let legF = 0, legB = 0, bob = 0;
  if (walk != null) {
    const s = Math.sin(walk * Math.PI * 2);
    legF = Math.round(s * 4); legB = -legF;
  } else if (o.air) { legF = 3; legB = -2; }
  else if (o.sitting) { legF = 5; legB = 4; }
  const armSwing = walk != null ? Math.sin(walk * Math.PI * 2) * 0.5 : (o.air ? -0.4 : 0);
  const body = o.body, legs = o.legs;
  // back arm (armored sleeve + pauldron when a breastplate is worn)
  ctx.save();
  ctx.translate(-4, 14 + bob);
  ctx.rotate(o.armAngle != null ? 0.3 : -armSwing);
  ctx.fillStyle = shade(body ? body.m : c.shirt, 0.8); ctx.fillRect(-2, 0, 4, 10);
  if (body) { ctx.fillStyle = shade(body.M, 0.85); ctx.fillRect(-3, -1, 6, 3); ctx.fillStyle = shade(body.d, 0.8); ctx.fillRect(-2, 7, 4, 1); }
  ctx.fillStyle = shade(c.skin, 0.85); ctx.fillRect(-2, 10, 4, 3);
  ctx.restore();
  // legs (back then front): greaves get knee plates and heavy boots
  ctx.fillStyle = shade(legs ? legs.m : c.pants, 0.8); ctx.fillRect(-4 + legB, 26, 5, 12);
  if (legs) { ctx.fillStyle = shade(legs.M, 0.8); ctx.fillRect(-4 + legB, 30, 5, 2); ctx.fillStyle = shade(legs.d, 0.8); ctx.fillRect(-4 + legB, 37, 6, 5); }
  else { ctx.fillStyle = shade(c.shoes, 0.8); ctx.fillRect(-4 + legB, 38, 6, 4); }
  ctx.fillStyle = legs ? legs.m : c.pants; ctx.fillRect(0 + legF, 26, 5, 12);
  if (legs) { ctx.fillStyle = legs.M; ctx.fillRect(0 + legF, 30, 5, 2); ctx.fillStyle = legs.d; ctx.fillRect(0 + legF, 37, 6, 5); ctx.fillStyle = legs.M; ctx.fillRect(0 + legF, 37, 6, 1); }
  else { ctx.fillStyle = c.shoes; ctx.fillRect(0 + legF, 38, 6, 4); }
  // torso
  if (body) {
    ctx.fillStyle = body.m; ctx.fillRect(-6, 12 + bob, 12, 14);
    ctx.fillStyle = body.M; ctx.fillRect(-6, 12 + bob, 12, 2); ctx.fillRect(-1, 14 + bob, 2, 8);
    ctx.fillStyle = body.d; ctx.fillRect(-6, 20 + bob, 5, 1); ctx.fillRect(1, 20 + bob, 5, 1); ctx.fillRect(-6, 23 + bob, 12, 1);
    ctx.fillStyle = shade(body.d, 0.7); ctx.fillRect(-6, 24 + bob, 12, 2); ctx.fillStyle = body.M; ctx.fillRect(-1, 24 + bob, 2, 2);
  } else {
    ctx.fillStyle = c.shirt; ctx.fillRect(-6, 12 + bob, 12, 14);
    ctx.fillStyle = shade(c.shirt, 0.85); ctx.fillRect(-6, 24 + bob, 12, 2);
    ctx.fillStyle = shade(c.shirt, 1.15); ctx.fillRect(-6, 12 + bob, 12, 1);
  }
  // head
  ctx.fillStyle = c.skin; ctx.fillRect(-6, 0 + bob, 12, 12);
  // hair
  ctx.fillStyle = c.hair;
  ctx.fillRect(-7, -1 + bob, 14, 5);
  ctx.fillRect(-7, 4 + bob, 2, 5);
  if (o.hairStyle === 1) { ctx.fillRect(5, 4 + bob, 2, 8); ctx.fillRect(-7, 9 + bob, 2, 4); }
  else { ctx.fillRect(5, 4 + bob, 2, 3); ctx.fillRect(-2, 3 + bob, 5, 2); }
  ctx.fillStyle = shade(c.hair, 1.25); ctx.fillRect(-6, -1 + bob, 6, 1);
  if (o.helmet) {
    // full helm: dome, brow ridge, cheek guards and a crest; the eyes stay visible through the visor
    ctx.fillStyle = o.helmet.m; ctx.fillRect(-7, -3 + bob, 14, 8); ctx.fillRect(-7, 5 + bob, 2, 6); ctx.fillRect(5, 5 + bob, 2, 6); ctx.fillRect(-7, 8 + bob, 14, 2);
    ctx.fillStyle = o.helmet.M; ctx.fillRect(-6, -3 + bob, 12, 1); ctx.fillRect(-1, -4 + bob, 2, 3); ctx.fillRect(-6, 8 + bob, 3, 1);
    ctx.fillStyle = o.helmet.d; ctx.fillRect(-7, 4 + bob, 14, 1); ctx.fillRect(-7, 9 + bob, 14, 1);
  }
  // eyes
  ctx.fillStyle = '#fff'; ctx.fillRect(1, 4 + bob, 3, 3);
  ctx.fillStyle = c.eye; ctx.fillRect(2, 4 + bob, 2, 3);
  ctx.fillStyle = '#000'; ctx.fillRect(3, 5 + bob, 1, 1);
  if (o.zombie) { ctx.fillStyle = '#2a3a1a'; ctx.fillRect(-2, 8 + bob, 6, 1); }
  // front arm
  ctx.save();
  ctx.translate(4, 14 + bob);
  if (o.armAngle != null) {
    ctx.rotate(o.armAngle - Math.PI / 2);
    ctx.fillStyle = body ? body.m : c.shirt; ctx.fillRect(-2, 0, 4, 10);
    if (body) { ctx.fillStyle = body.M; ctx.fillRect(-3, -1, 6, 3); ctx.fillStyle = body.d; ctx.fillRect(-2, 7, 4, 1); }
    ctx.fillStyle = c.skin; ctx.fillRect(-2, 10, 4, 3);
    if (o.item) {
      ctx.translate(0, 12);
      ctx.rotate(Math.PI * 3 / 4);
      ctx.drawImage(o.item, -2, -13, 16, 16);
    }
  } else {
    ctx.rotate(armSwing);
    ctx.fillStyle = body ? body.m : c.shirt; ctx.fillRect(-2, 0, 4, 10);
    if (body) { ctx.fillStyle = body.M; ctx.fillRect(-3, -1, 6, 3); ctx.fillStyle = body.d; ctx.fillRect(-2, 7, 4, 1); }
    ctx.fillStyle = c.skin; ctx.fillRect(-2, 10, 4, 3);
  }
  ctx.restore();
  ctx.restore();
}

// Palettes of the armor an entity wears (vanity overrides and dyes applied): { head, body, legs },
// each { M: highlight, m: base, d: shadow } or null. Shared by the player and the squad companions.
function armorPalettes(ent) {
  const matOf = (a) => { if (!a || !ITEMS[a.id]) return null; const it = ITEMS[a.id]; if (it.icon && it.icon.mat && MATERIALS[it.icon.mat]) return MATERIALS[it.icon.mat]; if (it.set && MATERIALS[it.set]) return MATERIALS[it.set]; if (it.gem) { const g = GEMS.find(x => x.id === it.gem); if (g) return { M: g.hi, m: g.color, d: shade(g.color, 0.6) }; } if (it.armor && !it.vanity) { const col = it.color || '#9a9aa6'; return { M: shade(col, 1.3), m: col, d: shade(col, 0.6) }; } return null; };
  const look = (i) => (typeof Equipment !== 'undefined' && ent.vanity) ? (ent.vanity[i] || ent.armor[i]) : ent.armor[i];
  const dyeIt = (m, i) => (!m || typeof Equipment === 'undefined' || !ent.dyes || !ent.dyes[i]) ? m : { M: Equipment.dyeColor(m.M, ent.dyes[i]), m: Equipment.dyeColor(m.m, ent.dyes[i]), d: Equipment.dyeColor(m.d, ent.dyes[i]) };
  const vc = (i) => { const a = look(i); return a && ITEMS[a.id] && ITEMS[a.id].vanityColors ? ITEMS[a.id].vanityColors : null; };
  return { head: dyeIt(matOf(look(0)), 0), body: dyeIt(matOf(look(1)), 1), legs: dyeIt(matOf(look(2)), 2), vanity: [vc(0), vc(1), vc(2)] };
}

// ---------------------------------------------------------------------------
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 20, 42);
    this.canStep = true;
    this.dir = 1;
    this.maxHp = 100; this.hp = 100;
    this.regenTimer = 0;
    this.invuln = 0;
    this.deadTimer = 0;
    this.respawnX = x; this.respawnY = y;
    this.jumpTime = 0;
    this.jumpHeld = false;
    this.walkPhase = 0;
    this.inventory = new Array(50).fill(null);
    this.selected = 0;
    this.cursorItem = null;
    this.useTimer = 0; this.useDuration = 0; this.useItemId = null;
    this.armAngle = null;
    this.fallStart = null;
    this.colors = { skin: '#f2c6a0', hair: '#8b4a2b', shirt: '#b03a3a', pants: '#3a4a8a', shoes: '#5a3a22', eye: '#3a6ad0' };
    this.hairStyle = 0;
    this.input = { left: false, right: false, jump: false, down: false };
    this.hurtFlash = 0;
    this.lastGroundY = y;
    this.idleTicks = 0;
    this.hook = null; // {x,y,vx,vy,state:'fly'|'attached'}
    // Breath meter: 200 units, loses 1 every 7 ticks under water (23.3 s), refills in 1.12 s
    this.breath = 200; this.maxBreath = 200; this.breathCD = 0;
    // Health regeneration (Terraria formula): RT regen time, RC regen counter
    this.regenTime = 0; this.regenCounter = 0;
    this.coins = 0;
    this.armor = [null, null, null]; // head, body, legs
    this.buffs = {};                 // name -> ticks remaining
    this.sitting = null;             // {x,y} tile of the chair
    this.stats = { kills: 0, blocksMined: 0, deaths: 0 };
    this.danmakuPower = 0;
    this.pm = { move: 1, accel: 1, jump: 1, defAdd: 0, defMult: 1, dmg: 1, crit: 0, kbResist: 0, kbMult: 1, useTime: 1, pickup: 0, place: 0, regenAdd: 0, regenTime: 1, fallBonus: 0, autoJump: false, lavaImmune: false, dr: 0, rangedDmg: 1, projSpeed: 1 }; // pet modifiers (recomputed every tick)
    this.zeroDefense = false; this.noKnockback = false;
    // mage: mana (20 base, +20 per Mana Crystal up to 200), accessories
    this.baseMana = 20; this.maxMana = 20; this.mana = 20; this.manaRegenDelay = 0; this.manaRegenCount = 0; this.lastManaUse = 0;
    this.accessories = new Array(4).fill(null);   // 3 + the Expert/Master slot
    this.equipment = { boots: null, shield: null, wings: null };
    this.acc = { defense: 0, manaBonus: 0, manaCostPct: 0 };
    this.eq = { move: 0, kbImmune: false, lavaImmune: false, fireImmune: false, flight: 0, doubleJump: false, noFall: false, useTime: 1 };
    this.flightTime = 0; this.doubleJumped = false;
  }

  get defense() {
    if (this.zeroDefense) return 0;
    let d = 0; for (const a of this.armor) if (a) d += ITEMS[a.id].defense || 0;
    d += (this.acc && this.acc.defense) || 0;
    if (this.hasBuff('Well Fed')) d += 2;
    const pm = this.pm; if (pm) d = (d + pm.defAdd) * pm.defMult;
    return Math.round(d);
  }
  hasBuff(name) { return (this.buffs[name] || 0) > 0; }
  addBuff(name, ticks) { this.buffs[name] = Math.max(this.buffs[name] || 0, ticks); }

  get selectedItem() { return this.inventory[this.selected]; }

  addItem(id, count = 1, prefix) {
    const def = ITEMS[id];
    if (!def) return count;
    if (id.startsWith('coin_')) { this.coins += def.value * count; return 0; }
    if (def.onPickup) return def.onPickup(this, count);
    // stack into existing
    for (let i = 0; i < 50 && count > 0; i++) {
      const s = this.inventory[i];
      if (s && s.id === id && s.count < def.max && def.max > 1) { const n = Math.min(def.max - s.count, count); s.count += n; count -= n; }
    }
    // empty slots (hotbar first)
    for (let i = 0; i < 50 && count > 0; i++) {
      if (!this.inventory[i]) { const n = Math.min(def.max, count); const st = makeStack(id, n, prefix); if (def.pet === 'light') { if (prefix && prefix.quality) st.quality = prefix.quality; rollLightPet(st); } this.inventory[i] = st; count -= n; }
    }
    return count; // leftover
  }
  countItem(id) { let n = 0; for (const s of this.inventory) if (s && s.id === id) n += s.count; return n; }
  removeItem(id, count) {
    for (let i = 49; i >= 0 && count > 0; i--) {
      const s = this.inventory[i];
      if (s && s.id === id) { const n = Math.min(s.count, count); s.count -= n; count -= n; if (s.count <= 0) this.inventory[i] = null; }
    }
  }
  hasRoomFor(id, count = 1) {
    const def = ITEMS[id];
    let space = 0;
    for (const s of this.inventory) { if (!s) space += def.max; else if (s.id === id) space += def.max - s.count; if (space >= count) return true; }
    return false;
  }

  startUse(itemId, useTime) {
    this.useTimer = useTime; this.useDuration = useTime; this.useItemId = itemId;
  }
  get isUsing() { return this.useTimer > 0; }

  update(world, game) {
    if (this.dead) {
      this.deadTimer--;
      if (this.deadTimer <= 0) this.respawn(world);
      return;
    }
    const inp = this.input;
    const pets = game.pets;
    if (pets) { this.pm = pets.mods(); this.zeroDefense = pets.enrage > 0; }
    if (typeof ModLib !== 'undefined') ModLib.applyPlayerMods(this, game);
    if (this.timeStopped > 0) { this.timeStopped--; this.input.left = this.input.right = this.input.jump = false; this.vx = 0; if (this.vy < 0) this.vy = 0; }
    this.maxBreath = this.armor[0] && ITEMS[this.armor[0].id].breath ? 400 : 200;
    const pm = this.pm;
    if (pets && pets.frozen > 0) { this.vx = 0; this.vy = 0; if (this.invuln > 0) this.invuln--; this.useTimer = Math.max(0, this.useTimer - 1); this.armAngle = null; return; }
    // sitting on a chair: any movement input stands up
    if (this.sitting) {
      if (inp.left || inp.right || inp.jump || inp.down || world.get(this.sitting.x, this.sitting.y) !== T.CHAIR) this.sitting = null;
      else { this.vx = 0; }
    }
    const slippery = this.onSlippery(world);
    // Terraria: runAcceleration 0.08, runSlowdown 0.2, maxRunSpeed 3; ice: accel 0.04 / slowdown 0.02
    const accel = (slippery ? 0.04 : 0.08) * pm.accel, friction = slippery ? 0.02 : (this.onGround ? 0.2 : 0.06);
    this.eq = AccessoriesPlus.mods(this);
    if (this.pm && this.pm.flightMult) this.eq.flight = Math.round(this.eq.flight * this.pm.flightMult);
    if (this.pm && this.pm.flightAdd && this.eq.flight > 0) this.eq.flight += this.pm.flightAdd;
    const maxRun = 3.0 * pm.move * (1 + this.eq.move / 100);
    const inCobweb = world.get(this.tileX, this.tileY) === T.COBWEB || world.get(this.tileX, Math.floor(this.y / TILE)) === T.COBWEB;
    if (inp.left && !inp.right) { this.vx -= accel; this.dir = -1; if (this.vx > 0) this.vx -= friction; }
    else if (inp.right && !inp.left) { this.vx += accel; this.dir = 1; if (this.vx < 0) this.vx += friction; }
    else { if (Math.abs(this.vx) < friction) this.vx = 0; else this.vx -= sign(this.vx) * friction; }
    const cap = this.inWater ? maxRun * 0.6 : maxRun;
    if (this.vx > cap) this.vx = cap; if (this.vx < -cap) this.vx = -cap;
    if (inCobweb) { this.vx *= 0.5; this.vy *= 0.5; }

    const entered = this.updateLiquidState(world);
    if (entered && Math.abs(this.vy) > 2) { Audio_.play('splash'); game.splash(this.cx, this.y + this.h * 0.6, this.inLava); }

    // jumping (also releases an attached grappling hook)
    if (inp.jump && !this.jumpHeld && this.hook && this.hook.state === 'attached') { this.hook = null; this.vy = -5.01; this.jumpTime = 15; this.jumpHeld = true; }
    if (this.onGround) { this.flightTime = this.eq.flight; this.doubleJumped = false; }
    if (inp.jump) {
      if (!this.jumpHeld || (pm.autoJump && this.onGround)) {
        if (this.onGround || this.inWater) {
          this.vy = this.inWater ? -3.2 : -5.01 * pm.jump; this.jumpTime = this.inWater ? 0 : 15; this.onGround = false;
          if (!this.inWater) Audio_.play('jump');
        } else if (this.eq.doubleJump && !this.doubleJumped) {
          // Cloud in a Bottle: one extra jump
          this.doubleJumped = true; this.vy = -5.01 * pm.jump; this.jumpTime = 12; Audio_.play('double_jump');
          for (let i = 0; i < 8; i++) game.particles.push(new Particle(this.cx + rand(-8, 8), this.y + this.h, rand(-1, 1), rand(0, 1), '#ffffff', 25, 3, false));
        }
        this.jumpHeld = true;
      } else if (this.jumpTime > 0) { this.vy = -5.01 * pm.jump; this.jumpTime--; if (this.jumpTime === 0 && pets) pets.onJumpFull(); }
      else if (!this.onGround && !this.inWater && this.flightTime > 0 && this.eq.flight > 0) {
        // Wings: hold jump to fly while flight time lasts
        this.vy = Math.max(this.vy - 0.6, -4); this.flightTime--; this.fallStart = null;
        if (world.time % 4 === 0) game.particles.push(new Particle(this.cx + rand(-10, 10), this.y + this.h - 4, rand(-0.5, 0.5), rand(0.5, 1.5), '#a0e0a0', 20, 2, false));
      }
    } else { this.jumpHeld = false; this.jumpTime = 0; }
    this.dropThrough = inp.down;

    // hook
    if (this.hook) this.updateHook(world);
    else this.applyGravity();

    const prevOnGround = this.onGround;
    if (!this.onGround && this.fallStart === null && this.vy > 0) this.fallStart = this.y;
    this.moveAndCollide(world);
    if (this.onGround) {
      if (!prevOnGround) {
        // landing: fall damage
        if (this.fallStart !== null) {
          const fell = (this.y - this.fallStart) / TILE;
          // Terraria: damage = 10 * (blocks - 25), reduced by defense
          if (fell > 25 + pm.fallBonus && !this.inWater && !this.eq.noFall) this.damage(Math.floor((fell - 25 - pm.fallBonus) * 10), null, game, 'fall');
          else if (fell > 3) Audio_.play('land');
        }
      }
      this.fallStart = null;
    } else if (this.vy > 0 && this.fallStart === null) this.fallStart = this.y;
    if (this.inWater) this.fallStart = null;

    // walking animation
    if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1;
    else if (this.onGround) this.walkPhase = 0;

    // item use animation
    if (this.useTimer > 0) {
      this.useTimer--;
      const t = 1 - this.useTimer / this.useDuration;
      const item = ITEMS[this.useItemId];
      if (item && (item.tool === 'hook')) this.armAngle = null;
      else this.armAngle = lerp(-2.3, 0.6, smoothstep(t));
    } else this.armAngle = null;

    // --- buffs / debuffs ---
    for (const b in this.buffs) { if (--this.buffs[b] <= 0) delete this.buffs[b]; }
    if (this.inWater && !this.inLava) delete this.buffs['On Fire!'];
    const nearFire = game.nearTile(T.CAMPFIRE, this.tileX, this.tileY, 12);
    if (nearFire) this.buffs['Cozy Fire'] = 2;

    // --- health regeneration (wiki formula) ---
    // RT +1 per tick (+10 while sitting), capped at 3600; eRT: +1 per 300 RT up to 1800, then +1 per 600
    const moving = inp.left || inp.right || inp.jump || !this.onGround;
    this.idleTicks = moving ? 0 : this.idleTicks + 1;
    const draining = this.hasBuff('On Fire!') || this.hasBuff('Poisoned');
    if (draining) this.regenTime = 0;
    else this.regenTime = Math.min(3600, this.regenTime + (this.sitting ? 11 : 1) * pm.regenTime);
    const RT = this.regenTime;
    const eRT = RT <= 1800 ? Math.floor(RT / 300) : 6 + Math.floor((RT - 1800) / 600);
    let R = (this.maxHp / 400 * 0.85 + 0.15) * eRT;
    if (nearFire) R *= 1.1;
    if (this.sitting) R *= 1.5;
    R *= (moving ? 0.5 : 1.25);
    R = Math.round(R);
    if (nearFire) R += 1;
    R += pm.regenAdd;
    if (this.hasBuff('On Fire!')) R -= 8;
    if (this.hasBuff('Poisoned')) R -= 4;
    if (game.expert && !nearFire) R *= 0.5;
    if (this.hp < this.maxHp || R < 0) {
      this.regenCounter += R;
      while (this.regenCounter >= 120) { this.regenCounter -= 120; if (this.hp < this.maxHp) this.hp++; }
      while (this.regenCounter <= -120) { this.regenCounter += 120; this.hp--; if (this.hp <= 0) { if (pets && pets.onFatal()) break; this.hp = 0; this.die(game, this.hasBuff('On Fire!') ? 'fire' : 'enemy'); return; } }
    } else this.regenCounter = 0;
    if (this.invuln > 0) this.invuln--;
    if (this.hurtFlash > 0) this.hurtFlash--;

    // --- lava, drowning ---
    if (this.eq.lavaImmune) { if (this.inLava) this.lavaWalk = Math.max(0, (this.lavaWalk == null ? 420 : this.lavaWalk) - 1); else this.lavaWalk = Math.min(420, (this.lavaWalk == null ? 420 : this.lavaWalk) + 1); }
    if (this.eq.fireImmune || this.eq.lavaImmune) delete this.buffs['On Fire!'];
    if (this.inLava && !pm.lavaImmune && !(this.eq.lavaImmune && this.lavaWalk > 0)) { this.damage(80, null, game, 'lava', true); if (!this.eq.fireImmune) this.addBuff('On Fire!', 60 * 7); }
    const headTileLiquid = world.liquidAt(Math.floor(this.cx / TILE), Math.floor((this.y + 5) / TILE));
    if (headTileLiquid > 120 && !this.inLava) {
      if (++this.breathCD >= 7) {
        this.breathCD = 0; this.breath--;
        if (this.breath <= 0) { this.breath = 0; this.regenTime = 0; this.hp -= 2; game.addDamageText(this.cx, this.y, 2, '#ff5050'); if (this.hp <= 0) { this.hp = 0; this.die(game, 'drown'); return; } }
      }
    } else { this.breathCD = 0; this.breath = Math.min(this.maxBreath, this.breath + 3); }
  }

  sitOn(tx, ty) {
    // sit on the chair: snap the player so their feet rest on the chair's bottom tile
    const a = { x: tx, y: ty };
    this.sitting = a;
    this.vx = 0; this.vy = 0;
    this.x = tx * TILE + 8 - this.w / 2;
    this.y = (ty + 1) * TILE - this.h + 4;
    this.regenTime = Math.max(this.regenTime, 300);
  }

  updateHook(world) {
    const h = this.hook;
    if (h.state === 'fly') {
      h.x += h.vx; h.y += h.vy;
      h.dist += Math.hypot(h.vx, h.vy);
      const tx = Math.floor(h.x / TILE), ty = Math.floor(h.y / TILE);
      if (world.isSolidAt(tx, ty)) { h.state = 'attached'; Audio_.play('place'); if (h.teleport) { this.x = h.x - this.w / 2 - Math.sign(h.vx) * 12; this.y = h.y - this.h; this.vx = this.vy = 0; this.fallStart = null; this.hook = null; return; } }
      else if (h.dist > (h.range || 22) * TILE) { this.hook = null; }
      this.applyGravity();
    } else {
      // pull player toward hook point
      const dx = h.x - this.cx, dy = h.y - this.cy;
      const d = Math.hypot(dx, dy);
      if (d < 20) { this.vx *= 0.5; this.vy = 0; }
      else { this.vx = dx / d * 9; this.vy = dy / d * 9; }
      this.fallStart = null;
      this.jumpTime = 0;
    }
  }

  // kind: 'enemy' | 'fall' | 'drown' | 'lava' | 'fire' | 'explosion' (or a literal message)
  damage(amount, fromX, game, kind = 'enemy', ignoreInvuln = false, sourceName = null, attacker = null) {
    if (this.dead) return false;
    if (this.invuln > 0 && !ignoreInvuln) return false;
    this.noKnockback = false;
    if (game.pets) amount = game.pets.onPlayerDamaged(amount, attacker, false);
    if (typeof ModLib !== 'undefined') amount = ModLib.modifyIncoming(this, amount, game, attacker);
    // Defense: damage reduced by half the defense value (rounded up), minimum 1 (Expert: 75%)
    const def = this.defense;
    const real = amount <= 0 ? 0 : Math.max(1, amount - Math.ceil(def * (game.expert ? 0.75 : 0.5)));
    this.invuln = ignoreInvuln ? 20 : 40;
    this.regenTime = 0;
    this.sitting = null;
    if (real <= 0) { this.hurtFlash = 4; return false; }
    this.hp -= real;
    this.hurtFlash = 12;
    if (typeof ModLib !== 'undefined') for (const h of ModLib.hurtHooks) h(this, real, game, kind, attacker);
    if (this.acc && this.acc.manaOnHurt) this.mana = Math.min(this.maxMana, this.mana + real);
    if (fromX != null && !this.noKnockback && !(this.eq && this.eq.kbImmune)) { const k = 1 - (this.pm ? this.pm.kbResist : 0); this.vx = (this.cx < fromX ? -1 : 1) * 4.5 * k; this.vy = -3.5 * k; }
    game.addDamageText(this.cx, this.y, real, '#ff5050');
    Audio_.play('hurt');
    if (game.boss) BossLog.onPlayerHit();
    if (this.hp <= 0) {
      if (game.pets && game.pets.onFatal()) return false;
      if (typeof ModLib !== 'undefined' && ModLib.preventDeath(this, game)) return false;
      this.hp = 0; this.die(game, kind, sourceName); return true;
    }
    return false;
  }

  die(game, kind = 'enemy', sourceName = null) {
    this.dead = true; this.deadTimer = 60 * 10; this.hook = null; this.sitting = null;
    this.stats.deaths++;
    Audio_.play('death');
    const list = DEATH_MESSAGES[kind] || DEATH_MESSAGES.enemy;
    let msg = choose(list);
    if (kind === 'enemy' && sourceName) msg += ` by ${sourceName}`;
    // Classic mode: drop half of the carried coins (rounded up)
    const lost = Math.ceil(this.coins / 2);
    this.coins -= lost;
    game.onPlayerDeath(msg, lost);
    for (let i = 0; i < 20; i++) game.particles.push(new Particle(this.cx, this.cy, rand(-4, 4), rand(-6, 1), choose(['#b03a3a', '#f2c6a0', '#3a4a8a']), 60, 3, true));
  }

  respawn(world) {
    this.dead = false; this.hp = this.maxHp;
    this.x = this.respawnX; this.y = this.respawnY;
    this.vx = 0; this.vy = 0; this.invuln = 60; this.fallStart = null;
    this.breath = this.maxBreath; this.breathCD = 0;
    this.regenTime = 0; this.regenCounter = 0; this.buffs = {};
    this.mana = this.maxMana; this.manaRegenDelay = 0;
  }

  draw(ctx, camX, camY, world) {
    if (this.dead) return;
    if (this.invuln > 0 && (this.invuln >> 2) % 2 === 0 && this.hurtFlash === 0) ctx.globalAlpha = 0.5;
    const sel = this.selectedItem;
    const item = ((this.armAngle != null || (this.showHeld && !this.sitting)) && sel && Sprites.icons[sel.id] && Sprites.icons[sel.id].width <= 16 && (this.armAngle != null || ITEMS[sel.id].damage)) ? Sprites.icons[sel.id] : null;
    // hook line
    if (this.hook) {
      ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(this.cx - camX, this.cy - camY); ctx.lineTo(this.hook.x - camX, this.hook.y - camY); ctx.stroke();
      ctx.fillStyle = '#b0b0b8'; ctx.fillRect(this.hook.x - camX - 3, this.hook.y - camY - 3, 6, 6);
    }
    const colors = Object.assign({}, this.colors);
    if (typeof Equipment !== 'undefined') Equipment.init(this);
    const ap = armorPalettes(this); let { head, body, legs } = ap;
    for (const i of [0, 1, 2]) { const v = ap.vanity[i]; if (v) { for (const k in v) colors[k] = this.dyes && this.dyes[i] && typeof Equipment !== 'undefined' ? Equipment.dyeColor(v[k], this.dyes[i]) : v[k]; if (i === 0) head = null; else if (i === 1) body = null; else legs = null; } }
    if (typeof Equipment !== 'undefined') { Equipment.drawMount(ctx, this, camX, camY); Equipment.drawCart(ctx, this, camX, camY); }
    const race = (typeof Races !== 'undefined' && window.game && window.game.player === this) ? Races.raceOf(window.game) : null;
    const sc = race && race.size ? race.size : 1;
    ctx.save();
    if (sc !== 1) { const bx = snap(this.x - camX + 10), by = snap(this.y + this.gfxOffY - camY + this.h); ctx.translate(bx, by); ctx.scale(sc, sc); ctx.translate(-bx, -by); }
    if (this.gravInv) { const by = snap(this.y + this.gfxOffY - camY) + this.h / 2; ctx.translate(0, by); ctx.scale(1, -1); ctx.translate(0, -by); }
    if (typeof ModLib !== 'undefined') { ctx.save(); ctx.translate(snap(this.x - camX + 10), snap(this.y + this.gfxOffY - camY)); if (this.dir < 0) ctx.scale(-1, 1); ModLib.emit('drawPlayerBack', ctx, this, window.game); ctx.restore(); }
    drawHumanoid(ctx, this.x - camX, this.y + this.gfxOffY - camY, {
      dir: this.dir, walk: this.onGround && Math.abs(this.vx) > 0.2 && !this.sitting ? this.walkPhase : null, air: !this.onGround && !this.sitting,
      colors, armAngle: this.armAngle != null ? this.armAngle : (item ? 1.15 : null), item, hairStyle: this.hairStyle, helmet: head, body, legs, sitting: !!this.sitting
    });
    if (race) { ctx.save(); ctx.translate(snap(this.x - camX + 10), snap(this.y + this.gfxOffY - camY)); if (this.dir < 0) ctx.scale(-1, 1); Races.drawFeatures(ctx, this, window.game); ctx.restore(); }
    if (typeof ModLib !== 'undefined') { ctx.save(); ctx.translate(snap(this.x - camX + 10), snap(this.y + this.gfxOffY - camY)); if (this.dir < 0) ctx.scale(-1, 1); ModLib.emit('drawPlayer', ctx, this, window.game); ctx.restore(); }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
class ItemDrop extends Entity {
  constructor(x, y, id, count = 1, prefix) {
    super(x - 6, y - 6, 12, 12);
    this.id = id; this.count = count;
    this.prefix = prefix === undefined ? randomPrefix(id) : (prefix && prefix.quality ? null : prefix);
    this.quality = prefix && prefix.quality ? prefix.quality : null;
    this.vx = rand(-1.5, 1.5); this.vy = rand(-3, -1);
    this.life = 60 * 60 * 5; this.pickupDelay = 20;
    this.bob = Math.random() * Math.PI * 2;
  }
  update(world, player, game) {
    this.life--; if (this.life <= 0) { this.dead = true; return; }
    if (this.pickupDelay > 0) this.pickupDelay--;
    this.updateLiquidState(world);
    if (this.inLava) { if (this.id === 'guide_voodoo_doll' && this.y > (world.h - 70) * TILE && !game.boss && typeof Bosses !== 'undefined') { const guide = game.npcs.find(n => n.role === 'Guide'); if (guide) { guide.dead = true; game.message('The Guide has been sacrificed to the flames!', '#ff4040'); } Bosses.summon(game, 'wall_of_flesh'); } this.dead = true; return; }
    const d = dist(this.cx, this.cy, player.cx, player.cy);
    if (this.pickupDelay === 0 && !player.dead && d < 56 + (player.pm ? player.pm.pickup : 0) && (this.id.startsWith('coin_') || player.hasRoomFor(this.id, 1))) {
      // magnet
      const dx = player.cx - this.cx, dy = player.cy - this.cy;
      this.vx += dx / d * 0.9; this.vy += dy / d * 0.9;
      const spd = Math.hypot(this.vx, this.vy);
      if (spd > 7) { this.vx *= 7 / spd; this.vy *= 7 / spd; }
      if (d < 18) {
        const left = player.addItem(this.id, this.count, this.quality ? { quality: this.quality } : this.prefix);
        if (left < this.count) { Audio_.play(this.id.startsWith('coin_') ? 'craft' : 'pickup'); game.addPickupText(player, this.id, this.count - left); }
        if (left < this.count) BossLog.noteObtained(game, this.id);
        this.count = left;
        if (this.count <= 0) { this.dead = true; return; }
      }
      this.x += this.vx; this.y += this.vy;
      return;
    }
    this.applyGravity(0.6);
    this.vx *= this.onGround ? 0.85 : 0.98;
    this.moveAndCollide(world);
    if (this.collidedX) this.vx = 0;
  }
  draw(ctx, camX, camY, t) {
    const ic = Sprites.icons[this.id];
    if (!ic) return;
    const bob = this.onGround ? 0 : 0;
    const s = Math.min(16, Math.max(ic.width, ic.height));
    const scale = 16 / s;
    const w = ic.width * scale, h = ic.height * scale;
    ctx.drawImage(ic, snap(this.cx - camX - w / 2), snap(this.cy - camY - h / 2 + bob), w, h);
  }
}

class Particle {
  constructor(x, y, vx, vy, color, life, size = 2, gravity = true) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.color = color; this.life = life; this.maxLife = life; this.size = size; this.gravity = gravity; this.dead = false;
  }
  update(world) {
    this.life--; if (this.life <= 0) { this.dead = true; return; }
    if (this.gravity) this.vy += 0.25;
    this.x += this.vx; this.y += this.vy;
    if (this.gravity && world.isSolidAt(Math.floor(this.x / TILE), Math.floor(this.y / TILE))) { this.vy *= -0.3; this.vx *= 0.5; this.y -= this.vy; }
  }
  draw(ctx, camX, camY) {
    ctx.globalAlpha = Math.min(1, this.life / (this.maxLife * 0.4));
    ctx.fillStyle = this.color;
    ctx.fillRect(snap(this.x - camX), snap(this.y - camY), this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class DamageText {
  constructor(x, y, text, color, crit = false) {
    this.x = x + rand(-8, 8); this.y = y; this.text = String(text) + (crit ? '!' : ''); this.color = color; this.life = crit ? 80 : 60; this.vy = crit ? -1.8 : -1.2; this.crit = crit; this.dead = false;
  }
  update() { this.life--; this.y += this.vy; this.vy *= 0.94; if (this.life <= 0) this.dead = true; }
}

// ---------------------------------------------------------------------------
// The Guide NPC
// ---------------------------------------------------------------------------
class NPC extends Entity {
  constructor(x, y, name, role = 'Guide') {
    super(x, y, 20, 42);
    this.canStep = true;
    this.name = name; this.role = role;
    const def = NPC_ROLES[role] || NPC_ROLES.Guide;
    this.def = def;
    this.colors = Object.assign({}, def.colors);
    this.hairStyle = def.hairStyle;
    this.dir = 1; this.walkPhase = 0;
    this.aiTimer = 0; this.moving = 0;
    this.talking = false;
    this.home = null;           // {key, homeX, homeY}
    this.hp = 250; this.maxHp = 250;
    this.invuln = 0; this.hitFlash = 0;
    this.attackTimer = randInt(0, 40);
    this.sitting = null;
    this.emote = null; this.emoteTimer = randInt(300, 900);
    this.regenCounter = 0;
    this.shopItems = null;      // traveling merchant stock
    this.leaveAt = 0;           // traveling merchant departure time
    this.isTown = def.town;
  }
  get defense() { return 15 + (this.world && this.world.bossDefeated ? 3 : 0); }
  get title() { return this.name === this.role ? this.name : `${this.name} the ${this.role}`; }

  hit(dmg, fromX, game) {
    if (this.invuln > 0) return;
    const real = Math.max(1, Math.round(dmg - this.defense / 2));
    this.hp -= real; this.invuln = 30; this.hitFlash = 8;
    this.vx = (this.cx < fromX ? -1 : 1) * 2; this.vy = -2; this.sitting = null;
    game.addDamageText(this.cx, this.y, real, '#ff5050');
    Audio_.play('hurt');
    if (this.hp <= 0) { this.hp = 0; this.dead = true; game.onNpcDeath(this); }
  }

  goHome(world, game) {
    if (!this.home) return false;
    const hx = this.home.homeX * TILE + 8 - this.w / 2, hy = (this.home.homeY + 1) * TILE - this.h;
    const dx = hx - this.x;
    // off-screen: teleport home (Terraria behaviour)
    const offscreen = Math.abs(this.cx - game.player.cx) > game.renderer.vw / 2 + 20 * TILE || Math.abs(this.cy - game.player.cy) > game.renderer.vh / 2 + 12 * TILE;
    if (offscreen) { this.x = hx; this.y = hy; this.vx = 0; this.vy = 0; return true; }
    if (Math.abs(dx) < 6 && Math.abs(this.y - hy) < 24) { this.moving = 0; return true; }
    this.moving = dx < 0 ? -1 : 1; this.dir = this.moving;
    return false;
  }

  update(world, game) {
    this.world = world;
    if (this.stayPut) { this.vx = 0; this.updateLiquidState(world); this.applyGravity(); this.moveAndCollide(world); this.dir = game.player.cx < this.cx ? -1 : 1; if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null; return; }
    this.aiTimer--;
    if (this.invuln > 0) this.invuln--;
    if (this.hitFlash > 0) this.hitFlash--;
    // slow health regeneration (NPCs regenerate over time)
    if (this.hp < this.maxHp && ++this.regenCounter >= 60) { this.regenCounter = 0; this.hp++; }
    const night = !world.isDay() || world.bloodMoon;
    // house lost?
    if (this.home && world.time % 300 === 0) { const h = world.checkHouse(this.home.homeX, this.home.homeY); if (!h.ok || h.key !== this.home.key) { this.home = null; game.message(`${this.title} has no home.`, '#ffb060'); } }
    let atHome = false;
    if (this.sitting) {
      if (world.get(this.sitting.x, this.sitting.y) !== T.CHAIR || (!night && Math.random() < 0.003) || this.talking) this.sitting = null;
      this.vx = 0;
    }
    if (this.talking) { this.moving = 0; this.dir = game.player.cx < this.cx ? -1 : 1; }
    else if (night && this.home && !this.sitting) {
      atHome = this.goHome(world, game);
      if (atHome && Math.random() < 0.01) this.trySit(world);
    } else if (!this.sitting && this.aiTimer <= 0) {
      this.aiTimer = randInt(60, 240);
      const r = Math.random();
      this.moving = r < 0.45 ? 0 : (r < 0.72 ? 1 : -1);
      if (this.moving) this.dir = this.moving;
      // wander near home during the day, near spawn otherwise
      const anchor = this.home ? this.home.homeX * TILE : world.spawnX * TILE;
      if (Math.abs(this.cx - anchor) > 40 * TILE) { this.moving = anchor < this.cx ? -1 : 1; this.dir = this.moving; }
      if (!this.moving && this.home && Math.random() < 0.15) this.trySit(world);
    }
    if (this.sitting) this.moving = 0;
    if (this.moving) {
      // don't walk off cliffs (unless heading home)
      const aheadX = Math.floor((this.cx + this.dir * 14) / TILE);
      const footY = Math.floor((this.y + this.h + 2) / TILE);
      let ground = false;
      for (let k = 0; k < 4; k++) if (world.isSolidAt(aheadX, footY + k) || world.isPlatformAt(aheadX, footY + k)) { ground = true; break; }
      if (!ground && !(night && this.home)) { this.moving = 0; this.aiTimer = 30; }
      else this.vx = lerp(this.vx, this.moving * 1.2, 0.15);
    } else this.vx *= 0.8;
    // open doors in the way, close them behind (simple: toggle closed doors ahead)
    if (this.moving && world.time % 10 === 0) {
      const ax = Math.floor((this.cx + this.dir * 12) / TILE), ay = Math.floor((this.y + this.h / 2) / TILE);
      if (world.get(ax, ay) === T.DOOR_C) { world.toggleDoor(ax, ay, null); Audio_.play('door'); }
    }
    this.updateLiquidState(world);
    if (!this.sitting) { this.applyGravity(); this.moveAndCollide(world); }
    if (this.collidedX && this.onGround && !this.sitting) { this.vy = -5; }
    if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1; else this.walkPhase = 0;
    // fell into lava / the depths: teleport to home or spawn
    if (this.inLava || this.y > (world.surfaceLine + 80) * TILE) {
      if (this.home) { this.x = this.home.homeX * TILE; this.y = this.home.homeY * TILE - 40; }
      else { this.x = world.spawnX * TILE; this.y = (world.spawnY - 4) * TILE; }
      this.vy = 0;
    }
    // self defence
    this.defend(world, game);
    // emotes: chat bubbles now and then when someone is near
    if (--this.emoteTimer <= 0) {
      this.emoteTimer = randInt(400, 1200);
      const near = dist(this.cx, this.cy, game.player.cx, game.player.cy) < 12 * TILE || game.npcs.some(n => n !== this && dist(n.cx, n.cy, this.cx, this.cy) < 8 * TILE);
      if (near) { this.emote = choose(['...', '!', '?', '\u2665', '\u266a']); this.emoteLife = 120; }
    }
    if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null;
    // traveling merchant leaves in the evening
    if (this.role === 'Traveling Merchant' && this.leaveAt && world.time >= this.leaveAt) { this.dead = true; game.message('The Traveling Merchant has departed!', '#c0c0ff'); }
  }

  trySit(world) {
    // sit on a chair within the home (or nearby)
    for (const ci of world.chairs) {
      const x = ci % world.w, y = (ci / world.w) | 0;
      if (Math.abs(x * TILE - this.cx) < 8 * TILE && Math.abs(y * TILE - this.cy) < 6 * TILE) {
        this.sitting = { x, y: y + 1 };
        this.x = x * TILE + 8 - this.w / 2; this.y = (y + 2) * TILE - this.h + 4; this.vx = 0; this.vy = 0;
        return true;
      }
    }
    return false;
  }

  defend(world, game) {
    const w = this.def.weapon;
    if (!w || --this.attackTimer > 0) return;
    this.attackTimer = w.rate;
    if (w.kind === 'syringe') {
      // Nurse heals nearby town NPCs (and the player a little)
      for (const n of game.npcs) if (n !== this && n.hp < n.maxHp && dist(n.cx, n.cy, this.cx, this.cy) < 12 * TILE) { n.hp = Math.min(n.maxHp, n.hp + 20); game.addDamageText(n.cx, n.y, '+20', '#40e060'); }
      return;
    }
    // nearest enemy within 25 tiles
    let target = null, best = 25 * TILE;
    for (const e of game.enemies) { const d = dist(e.cx, e.cy, this.cx, this.cy); if (d < best) { best = d; target = e; } }
    if (!target) return;
    this.dir = target.cx < this.cx ? -1 : 1;
    const boost = world.bossDefeated ? 1.1 : 1;
    const dmg = Math.round(w.damage * boost);
    if (w.kind === 'aura') {
      for (const e of game.enemies) if (dist(e.cx, e.cy, this.cx, this.cy) < w.radius * TILE) e.hit(dmg, this.cx, 1, game);
      for (let i = 0; i < 3; i++) game.particles.push(new Particle(this.cx + rand(-w.radius, w.radius) * TILE, this.cy + rand(-w.radius, w.radius) * TILE, 0, -0.5, '#60ff80', 30, 2, false));
      return;
    }
    const dx = target.cx - this.cx, dy = target.cy - this.cy, d = Math.hypot(dx, dy) || 1;
    const arc = w.kind === 'arrow' || w.kind === 'grenade' ? -Math.min(3, d / 120) : 0;
    game.projectiles.push(new Projectile(this.cx, this.y + 14, dx / d * w.speed, dy / d * w.speed + arc, { kind: w.kind, damage: dmg, friendly: true, owner: this, knockback: w.kind === 'grenade' ? 6 : 3 }));
    Audio_.play(w.kind === 'bullet' ? 'hit' : 'swing');
  }

  draw(ctx, camX, camY) {
    if (this.hitFlash > 0) ctx.globalAlpha = 0.6;
    drawHumanoid(ctx, this.x - camX, this.y + this.gfxOffY - camY, {
      dir: this.dir, walk: this.onGround && Math.abs(this.vx) > 0.2 && !this.sitting ? this.walkPhase : null, air: !this.onGround && !this.sitting,
      colors: this.colors, armAngle: null, item: null, hairStyle: this.hairStyle, sitting: !!this.sitting
    });
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Projectiles: NPC defence weapons and player bullets
// ---------------------------------------------------------------------------
class Projectile extends Entity {
  constructor(x, y, vx, vy, o) {
    super(x - 3, y - 3, 6, 6);
    this.vx = vx; this.vy = vy;
    this.kind = o.kind; this.damage = o.damage; this.friendly = o.friendly; this.owner = o.owner; this.knockback = o.knockback || 2;
    this.crit = !!o.crit;
    this.life = o.kind === 'grenade' ? 90 : 120;
    this.gravity = o.kind === 'arrow' ? 0.08 : o.kind === 'grenade' || o.kind === 'knife' ? 0.2 : 0;
    this.explosive = o.kind === 'grenade' ? { radius: 3, damage: o.damage, tiles: false } : null;
    this.hitSet = new Set();
    this.pierce = o.pierce || 0;
    this.color = o.color; this.hi = o.hi; this.magic = !!o.magic; this.manaCost = o.manaCost || 0;
    if (o.kind === 'bolt') { this.life = 90; this.gravity = 0; }
    if (o.kind === 'spore') { this.life = 240; this.gravity = 0; }
    if (o.kind === 'finch') { this.life = 150; this.gravity = 0; }
    if (o.kind === 'spark') { this.life = 26; this.gravity = 0; }
  }
  update(world, game) {
    if (this.frozenUntil > 0) { this.frozenUntil--; return; }
    if (--this.life <= 0) { this.finish(game); return; }
    if (this.kind === 'spore') { this.vx += rand(-0.15, 0.15); this.vy += rand(-0.15, 0.15); this.vx *= 0.95; this.vy *= 0.95; this.hitSet.clear(); }
    if (this.kind === 'finch') { let t = null, b = 20 * TILE; for (const e of game.enemies) { const d = dist(e.cx, e.cy, this.x, this.y); if (d < b) { b = d; t = e; } } if (t) { const dx = t.cx - this.x, dy = t.cy - this.y, d = Math.hypot(dx, dy) || 1; this.vx += dx / d * 0.5; this.vy += dy / d * 0.5; } const sp = Math.hypot(this.vx, this.vy); if (sp > 7) { this.vx *= 7 / sp; this.vy *= 7 / sp; } if (this.life % 20 === 0) this.hitSet.clear(); }
    if (this.kind === 'bonemerang' && this.owner && this.life < 95) { const dx = this.owner.cx - this.x, dy = this.owner.cy - this.y, d = Math.hypot(dx, dy) || 1; this.vx += dx / d * 0.8; this.vy += dy / d * 0.8; const sp = Math.hypot(this.vx, this.vy); if (sp > 9) { this.vx *= 9 / sp; this.vy *= 9 / sp; } if (d < 12) { this.dead = true; return; } this.hitSet.clear(); }
    const bounced = this.friendly && Gensokyo.friendlyTick(this, game, world);
    this.vy += this.gravity;
    const nx = this.x + this.vx, ny = this.y + this.vy;
    const tx = Math.floor((nx + 3) / TILE), ty = Math.floor((ny + 3) / TILE);
    if (world.isSolidAt(tx, ty) && this.kind !== 'finch' && !this.ghost && !bounced) {
      if (this.kind === 'bonemerang') { this.vx *= -0.5; this.vy *= -0.5; this.life = Math.min(this.life, 90); return; }
      if (this.kind === 'grenade') { this.vx *= -0.4; this.vy *= -0.4; if (Math.abs(this.vx) + Math.abs(this.vy) < 0.5) this.finish(game); return; }
      if (this.bounce > 0) { this.bounce--; if (world.isSolidAt(Math.floor((this.x + 3) / TILE), ty)) this.vy *= -0.6; else this.vx *= -0.6; return; }
      this.finish(game); return;
    }
    this.x = nx; this.y = ny;
    if (this.hostile) { Gensokyo.hostileTick(this, game); return; }
    if (this.friendly) {
      ModLib.emit('projTick', game, this);
      for (const e of game.enemies) {
        if (this.hitSet.has(e)) continue;
        if (this.x < e.x + e.w && this.x + this.w > e.x && this.y < e.y + e.h && this.y + this.h > e.y) {
          if (this.explosive) { this.finish(game); return; }
          if (this.owner === game.player && game.pets) {
            const h = game.pets.onHit(e, this.damage, this.knockback, this.crit, false, this.kind === 'bullet');
            e.hit(h.damage, this.x, h.kb, game, null, h.crit);
            if (this.kind !== 'spore') game.pets.afterHit(e, e.lastHitDamage || 0);
            if (this.magic) Magic.onMagicHit(game, this, e);
          } else e.hit(this.damage, this.x, this.knockback, game, null, this.crit);
          ModLib.emit('projHit', game, this, e);
          this.hitSet.add(e);
          if (this.pierce > 0) { this.pierce--; if (this.pierce === 0) { this.dead = true; return; } continue; }
          this.dead = true; return;
        }
      }
    }
  }
  finish(game) {
    this.dead = true;
    if (this.explosive) {
      const x = this.x + 3, y = this.y + 3;
      Audio_.play('kill');
      for (let i = 0; i < 20; i++) game.particles.push(new Particle(x, y, rand(-4, 4), rand(-5, 2), choose(['#ff8020', '#ffe060', '#404040']), 40, 3));
      for (const e of game.enemies) if (dist(e.cx, e.cy, x, y) < (this.explosive.radius + 1) * TILE) e.hit(this.explosive.damage, x, 8, game);
    }
  }
  draw(ctx, camX, camY) {
    const x = snap(this.x - camX + 3), y = snap(this.y - camY + 3);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(this.vy, this.vx));
    switch (this.kind) {
      case 'arrow': ctx.fillStyle = '#a8794b'; ctx.fillRect(-8, -1, 14, 2); ctx.fillStyle = '#c0c0c8'; ctx.fillRect(4, -2, 5, 4); ctx.fillStyle = '#e0e0e0'; ctx.fillRect(-9, -3, 3, 6); break;
      case 'knife': ctx.fillStyle = '#d0d0d8'; ctx.fillRect(-5, -1, 10, 2); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-7, -2, 3, 4); break;
      case 'bullet': ctx.fillStyle = '#ffe080'; ctx.fillRect(-6, -1, 10, 2); ctx.fillStyle = '#fff'; ctx.fillRect(2, -1, 3, 2); break;
      case 'grenade': ctx.fillStyle = '#3a5a3a'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffe060'; ctx.fillRect(-1, -6, 2, 2); break;
      case 'finch': ctx.rotate(-Math.atan2(this.vy, this.vx)); ctx.fillStyle = '#e0c040'; ctx.fillRect(-5, -3, 10, 6); ctx.fillStyle = '#c08020'; ctx.fillRect(-2, -6 + Math.sin(Date.now() * 0.03) * 2, 6, 3); ctx.fillStyle = '#ff8020'; ctx.fillRect(5, -1, 3, 2); ctx.fillStyle = '#000'; ctx.fillRect(2, -2, 1, 1); break;
      case 'bolt': ctx.fillStyle = this.color || '#80f0ff'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = this.hi || '#fff'; ctx.beginPath(); ctx.ellipse(1, 0, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill(); break;
      case 'spark': ctx.fillStyle = this.color || '#ffe060'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff8020'; ctx.beginPath(); ctx.arc(-4, 0, 2.5, 0, Math.PI * 2); ctx.fill(); break;
      case 'spore': ctx.fillStyle = '#c050a0'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#40e060'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill(); break;
      case 'bonemerang': ctx.rotate(Date.now() * 0.02); ctx.fillStyle = '#e8e8e0'; ctx.fillRect(-7, -2, 14, 4); ctx.fillRect(-2, -7, 4, 14); break;
      default: if (Gensokyo.drawProjectile(this, ctx) || (typeof Weapons !== 'undefined' && Weapons.drawProjectile(this, ctx))) break; ctx.fillStyle = '#fff'; ctx.fillRect(-2, -2, 4, 4);
    }
    ctx.restore();
  }
}
