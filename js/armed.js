// ---------------------------------------------------------------------------
// Armed Zombies!: melee enemies (zombies, skeletons) spawn with a broadsword or
// a heavy axe and up to three pieces of iron armor. Sword AI: windup, swings,
// thrusts, charges, chained attacks, distancing, miss-recovery penalties,
// pressure when you stand still, parry & riposte, disarm & flee, weapon pickup,
// optional survival healing / scared behaviour / stagger. Everything configurable.
// ---------------------------------------------------------------------------
'use strict';

const ArmedZombies = {
  cfg: { enabled: true, weaponChance: 0.6, axeChance: 0.0, armorChance: 0.4, windup: true, healing: false, scared: false, stagger: false, parryChance: 0.3, disarmChance: 0.1, disarmCritChance: 0.5 },
  load() { try { const c = JSON.parse(localStorage.getItem('armed_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('armed_cfg', JSON.stringify(this.cfg)); } catch (e) {} },

  // give a freshly spawned walker its weapon and armor
  init(e) {
    const c = this.cfg;
    e.weapon = null; e.armor = { head: false, body: false, legs: false }; e.state = 'approach'; e.stateT = 0; e.chain = 0; e.armAngle = null; e.flee = 0; e.seek = 0; e.stillTicks = 0; e.healed = false; e.missPenalty = 0; e.guard = 0;
    if (!c.enabled) return;
    if (Math.random() < c.weaponChance) e.weapon = Math.random() < c.axeChance ? 'axe' : 'sword';
    if (Math.random() < c.armorChance) { e.armor.head = Math.random() < 0.7; e.armor.body = Math.random() < 0.5; e.armor.legs = Math.random() < 0.5; if (!e.armor.head && !e.armor.body && !e.armor.legs) e.armor.head = true; }
  },
  weaponDamage(e) { return e.weapon === 'axe' ? 20 : 12; },
  reach(e) { return e.weapon === 'axe' ? 44 : 40; },
  armorDefense(e) { return (e.armor.head ? 2 : 0) + (e.armor.body ? 3 : 0) + (e.armor.legs ? 2 : 0); },
  weaponItem(e) { return e.weapon === 'axe' ? 'iron_axe' : 'copper_broadsword'; },

  // returns true when it handled the movement (armed behaviour), false to fall back to the plain walker
  ai(e, world, player, game) {
    const c = this.cfg;
    if (e.armor === null) return false;
    e.stateT++;
    if (e.seek > 0) e.seek--;
    const dx = player.cx - e.cx, adx = Math.abs(dx), dy = Math.abs(player.cy - e.cy);
    const dir = dx < 0 ? -1 : 1;
    let vxTarget = 0, wantJump = false;
    const speed = (e.def.speed || 1) * e.slowFactor;
    // unarmed after a disarm: flee, then look for a weapon on the ground
    if (!e.weapon) {
      if (e.flee > 0) { e.flee--; e.dir = -dir; vxTarget = -dir * speed * 1.4; if (e.flee % 40 === 0 && dist(e.cx, e.cy, player.cx, player.cy) < 300) game.addDamageText(e.cx, e.y - 10, '!', '#ffe060'); }
      else {
        // nearest dropped weapon: a disarmed zombie searches 14 tiles around, any other unarmed one grabs weapons within 5 tiles
        let best = null, bd = (e.seek > 0 ? 14 : 5) * TILE;
        for (const d of game.drops) if ((d.id === 'copper_broadsword' || d.id === 'iron_axe') && !d.dead) { const dd = dist(d.cx, d.cy, e.cx, e.cy); if (dd < bd) { bd = dd; best = d; } }
        if (!best) return false;
        e.dir = best.cx < e.cx ? -1 : 1; vxTarget = e.dir * speed;
        if (best.y + best.h < e.y - 4 && e.onGround) wantJump = true;
        if (bd < 24) { e.weapon = best.id === 'iron_axe' ? 'axe' : 'sword'; best.dead = true; e.state = 'approach'; e.seek = 0; game.addDamageText(e.cx, e.y - 10, 'armed!', '#ffb060'); Audio_.play('pickup'); }
      }
    } else {
      const reach = this.reach(e), keep = reach - 6;
      e.dir = dir;
      // pressure: charge if the player has been standing still
      e.stillTicks = Math.abs(player.vx) < 0.2 ? e.stillTicks + 1 : 0;
      const lowHp = e.hp < e.maxHp * 0.3;
      if (c.healing && lowHp && !e.healed && e.state !== 'heal') { e.state = 'heal'; e.stateT = 0; }
      switch (e.state) {
        case 'approach':
          if (c.scared && lowHp) { if (adx < 120) vxTarget = -dir * speed; else if (adx > 220) vxTarget = dir * speed; if (Math.random() < 0.004 && adx < reach + 20) { e.state = 'windup'; e.stateT = 0; } break; }
          if (adx > keep + 8) vxTarget = dir * speed; else if (adx < keep - 14) vxTarget = -dir * speed * 0.7;
          if (player.y + player.h < e.y - 8 && e.onGround) wantJump = true;
          if (e.missPenalty > 0) { e.missPenalty--; break; }
          if (e.stillTicks > 90 && adx > reach && adx < 300 && Math.random() < 0.05) { e.state = 'charge'; e.stateT = 0; e.stillTicks = 0; break; }
          if (adx <= reach + 6 && dy < 50 && Math.random() < 0.06) { const r = Math.random(); e.state = r < 0.55 ? 'windup' : r < 0.85 ? 'thrust' : 'guard'; e.stateT = 0; e.attackKind = 'swing'; }
          else if (adx < 300 && Math.random() < 0.004) { e.state = 'charge'; e.stateT = 0; }
          break;
        case 'guard': // brief block stance: parries incoming swings
          e.guard = 20; if (e.stateT > 30) { e.state = 'approach'; e.stateT = 0; }
          e.armAngle = -1.2; break;
        case 'windup': {
          const t = c.windup ? 24 : 6;
          e.armAngle = lerp(-0.4, -2.4, Math.min(1, e.stateT / t));
          if (e.stateT >= t) { e.state = 'swing'; e.stateT = 0; }
          break;
        }
        case 'swing': {
          e.armAngle = lerp(-2.4, 0.7, Math.min(1, e.stateT / 12));
          if (e.stateT === 6) {
            const hit = this.hitPlayer(e, player, game, this.weaponDamage(e) * (e.riposte ? 2 : 1), reach);
            e.riposte = false;
            if (hit) { e.chain++; if (e.chain < 3 && Math.random() < 0.4) { e.state = 'windup'; e.stateT = 0; } else { e.state = 'recover'; e.stateT = 0; e.chain = 0; } }
            else { e.missPenalty = 30; e.state = 'recover'; e.stateT = 0; e.chain = 0; game.addDamageText(e.cx, e.y - 10, 'miss', '#c0c0c0'); }
          }
          if (e.stateT > 14 && e.state === 'swing') { e.state = 'recover'; e.stateT = 0; }
          break;
        }
        case 'thrust':
          if (e.stateT < 8) { e.armAngle = -0.2; vxTarget = 0; }
          else if (e.stateT < 18) { vxTarget = dir * speed * 3.5; e.armAngle = 0.1; if (e.stateT === 12 && !this.hitPlayer(e, player, game, Math.round(this.weaponDamage(e) * 0.8), reach - 6)) e.missPenalty = 30; }
          else { e.state = 'recover'; e.stateT = 0; }
          break;
        case 'charge':
          vxTarget = dir * speed * 2.5; e.armAngle = -1.0;
          if (adx <= reach && dy < 50) { e.state = 'swing'; e.stateT = 0; }
          if (e.stateT > 45) { e.state = 'recover'; e.stateT = 0; e.missPenalty = 20; }
          break;
        case 'recover':
          vxTarget = -dir * speed * 0.8; e.armAngle = null;
          if (e.stateT > 20) { e.state = 'approach'; e.stateT = 0; }
          break;
        case 'heal':
          vxTarget = adx < 160 ? -dir * speed : 0; e.armAngle = null;
          if (e.stateT > 60) { e.hp = Math.min(e.maxHp, e.hp + 50); e.healed = true; game.addDamageText(e.cx, e.y, '+50', '#40e060'); if (!e.armor.body && Math.random() < 0.5) e.armor.body = true; e.state = 'approach'; e.stateT = 0; }
          break;
      }
      if (e.guard > 0) e.guard--;
      if (e.state !== 'windup' && e.state !== 'swing' && e.state !== 'thrust' && e.state !== 'charge' && e.state !== 'guard') e.armAngle = null;
    }
    e.vx = lerp(e.vx, vxTarget, 0.15);
    e.applyGravity(); e.moveAndCollide(world);
    if (e.jumpCooldown > 0) e.jumpCooldown--;
    if ((e.collidedX || wantJump) && e.onGround && e.jumpCooldown === 0) { e.vy = -6.2; e.jumpCooldown = 30; }
    if (e.onGround && Math.abs(e.vx) > 0.2) e.walkPhase = (e.walkPhase + Math.abs(e.vx) / 40) % 1;
    return true;
  },
  hitPlayer(e, player, game, dmg, reach) {
    const x0 = e.dir > 0 ? e.cx : e.cx - reach, x1 = e.dir > 0 ? e.cx + reach : e.cx;
    if (player.x < x1 && player.x + player.w > x0 && player.y < e.y + e.h + 6 && player.y + player.h > e.y - 12 && !player.dead) {
      if (game.pets) game.pets.onEnemyTouch(e);
      const before = player.hp;
      player.damage(dmg, e.cx, game, 'enemy', false, (e.weapon === 'axe' ? 'an axe-wielding ' : 'a sword-wielding ') + e.name, e);
      Audio_.play('swing');
      return player.hp < before || player.invuln > 0;
    }
    return false;
  },
  // the player hits this enemy: armor blocks, parry / riposte, disarm, stagger. Returns true if the hit was negated.
  onHit(e, game, dmg, crit) {
    const c = this.cfg;
    if (!e.weapon && !e.armor) return false;
    // parry: in guard, or a chance while approaching with a weapon
    if (e.weapon && (e.guard > 0 || (e.state === 'approach' && Math.random() < c.parryChance))) {
      game.addDamageText(e.cx, e.y - 12, 'Parried!', '#a0d0ff'); Audio_.play('hit');
      e.state = 'swing'; e.stateT = 0; e.riposte = true; e.guard = 0;
      return true;
    }
    // armor: a piece blocks the first hit and is knocked off
    const worn = ['head', 'body', 'legs'].filter(k => e.armor[k]);
    if (worn.length) {
      const k = choose(worn); e.armor[k] = false;
      const id = k === 'head' ? 'iron_helmet' : k === 'body' ? 'iron_chainmail' : 'iron_greaves';
      game.dropItem(e.cx, e.y, id, 1, e.dir * -3, null);
      game.addDamageText(e.cx, e.y - 12, 'Blocked!', '#c0c0c0'); Audio_.play('dig_stone');
      return true;
    }
    // disarm
    if (e.weapon && Math.random() < (crit ? c.disarmCritChance : c.disarmChance)) {
      game.dropItem(e.cx, e.y, this.weaponItem(e), 1, e.dir * -4);
      game.addDamageText(e.cx, e.y - 12, 'Disarmed!', '#ffe060');
      e.weapon = null; e.flee = 120; e.seek = 900; e.state = 'approach'; e.armAngle = null;
      if (game.pets) game.pets.unlock('disarmed');
    }
    if (c.stagger && e.weapon && (e.state === 'windup' || e.state === 'recover')) { e.state = 'recover'; e.stateT = 0; }
    return false;
  },
};
ArmedZombies.load();
