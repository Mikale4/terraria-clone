// ---------------------------------------------------------------------------
// Equipment (terraria.wiki.gg/wiki/Equipment): the equipment menu with Hook,
// Mount and Minecart slots next to Boots/Shield/Wings, Vanity slots (social
// armor), Dye slots, Loadouts (3 sets, switch with the buttons or the N key),
// hook tiers, rideable Mounts, Minecarts on tracks, minions for summon weapons,
// and the weapon classes (bows, guns, launchers, yoyos, flails, spears,
// boomerangs, magic bolts, whips, summon staves) used by the item catalog.
// ---------------------------------------------------------------------------
'use strict';

EQUIP_SLOTS.push('hook', 'mount', 'minecart');
const HOOK_DEFS = {};
function defHook(id, name, o) { defAccessory(id, name, Object.assign({ slot: 'hook', hookRange: 22, hookSpeed: 14, rarity: 1, value: 20000 }, o)); HOOK_DEFS[id] = ITEMS[id]; ITEMS[id].drawIcon = ITEMS[id].drawIcon || ((x) => { x.strokeStyle = o.color || '#c0c0c8'; x.lineWidth = 2; x.beginPath(); x.moveTo(3, 13); x.lineTo(10, 6); x.stroke(); x.beginPath(); x.arc(11, 5, 3, 0, Math.PI * 2); x.stroke(); }); }
const MOUNT_DEFS = {};
function defMount(id, name, o) { defAccessory(id, name, Object.assign({ slot: 'mount', rarity: 3, value: 50000 }, o)); MOUNT_DEFS[id] = o.mount; ITEMS[id].drawIcon = ITEMS[id].drawIcon || ((x) => { x.fillStyle = o.mount.color; x.fillRect(2, 6, 12, 7); x.fillStyle = '#5a3a1a'; x.fillRect(4, 13, 3, 3); x.fillRect(9, 13, 3, 3); }); }
function defMinecart(id, name, o) { defAccessory(id, name, Object.assign({ slot: 'minecart', rarity: 1, value: 10000, cartSpeed: 8 }, o)); ITEMS[id].drawIcon = ITEMS[id].drawIcon || ((x) => { x.fillStyle = o.color || '#8a6038'; x.fillRect(2, 5, 12, 7); x.fillStyle = '#404048'; x.beginPath(); x.arc(5, 13, 2, 0, Math.PI * 2); x.arc(11, 13, 2, 0, Math.PI * 2); x.fill(); }); }
function defDye(id, name, hue, sat = 1, light = 1) { defItem(id, { name, max: 99, dye: { hue, sat, light }, rarity: 1, tooltip: 'Dye: place it in a Dye slot to recolour the matching armor/vanity piece', drawIcon: (x) => { x.fillStyle = `hsl(${hue},${Math.round(sat * 80)}%,${Math.round(light * 50)}%)`; x.fillRect(4, 5, 8, 9); x.fillStyle = '#c0c0c8'; x.fillRect(5, 2, 6, 3); } }); ITEM_VALUES[id] = 5000; ITEMS[id].value = 5000; }
function defVanity(id, name, slot, colors, o = {}) { defItem(id, Object.assign({ name, armor: slot, defense: 0, vanity: true, max: 1, rarity: o.rarity || 1, tooltip: 'Vanity item: equip it in a Vanity slot to change your look', vanityColors: colors, icon: o.icon || { kind: slot === 'head' ? 'helmet' : slot === 'body' ? 'chainmail' : 'greaves', mat: o.mat || 'wood' } }, o)); ITEM_VALUES[id] = o.value || 5000; ITEMS[id].value = ITEM_VALUES[id]; }

const Equipment = {
  init(p) { p.vanity = p.vanity || [null, null, null]; p.dyes = p.dyes || [null, null, null]; p.loadouts = p.loadouts || [null, null, null]; p.loadout = p.loadout || 0; p.equipment.hook = p.equipment.hook || null; p.equipment.mount = p.equipment.mount || null; p.equipment.minecart = p.equipment.minecart || null; },
  // loadouts: 3 independent sets of armor / accessories / gear / vanity / dyes
  snapshot(p) { return { armor: p.armor.slice(), accessories: p.accessories.slice(), equipment: Object.assign({}, p.equipment), vanity: p.vanity.slice(), dyes: p.dyes.slice() }; },
  switchLoadout(game, k) {
    const p = game.player; this.init(p); if (k === p.loadout) return;
    p.loadouts[p.loadout] = this.snapshot(p);
    const s = p.loadouts[k] || { armor: [null, null, null], accessories: [null, null, null, null], equipment: { boots: null, shield: null, wings: null, hook: null, mount: null, minecart: null }, vanity: [null, null, null], dyes: [null, null, null] };
    p.armor = s.armor; p.accessories = s.accessories; p.equipment = s.equipment; p.vanity = s.vanity; p.dyes = s.dyes; p.loadout = k;
    game.message(`Loadout ${k + 1}`, '#ffe75a'); Audio_.play('menu'); if (p.mounted) this.dismount(game);
  },
  // hooks
  hookDef(p) { const h = p.equipment && p.equipment.hook; return h ? ITEMS[h.id] : (p.inventory.some(s => s && s.id === 'hook') ? ITEMS.hook : null); },
  // mounts
  mountDef(p) { const m = p.equipment && p.equipment.mount; return m ? MOUNT_DEFS[m.id] : null; },
  toggleMount(game) { const p = game.player; const m = this.mountDef(p); if (!m) { game.message('Equip a mount in the Mount slot first.', '#ff8080'); return; } if (p.mounted) this.dismount(game); else { p.mounted = m; p.carting = false; game.message(`Riding the ${m.name}.`, '#ffe75a'); FX.burst(game, p.cx, p.y + p.h, 10, m.color, 3, 20); Audio_.play('menu'); } },
  dismount(game) { const p = game.player; p.mounted = null; },
  // minecarts: ride the track under you with a minecart equipped (J)
  toggleCart(game) { const p = game.player, w = game.world; const c = p.equipment && p.equipment.minecart; if (!c) { game.message('Equip a minecart in the Minecart slot first.', '#ff8080'); return; } if (p.carting) { p.carting = false; return; } const ty = Math.floor((p.y + p.h + 2) / TILE); if (w.get(p.tileX, ty) !== T.MINECART_TRACK && w.get(p.tileX, ty - 1) !== T.MINECART_TRACK) { game.message('Stand on a Minecart Track first.', '#ff8080'); return; } p.carting = true; p.mounted = null; p.cartVx = p.dir * 2; Audio_.play('menu'); },
  tick(game) {
    const p = game.player, w = game.world; this.init(p);
    if (p.mounted) { const m = p.mounted; if (m.fly && p.input.jump) { p.vy = Math.max(p.vy - 0.7, -5); p.fallStart = null; p.onGround = false; } if (m.bounce && p.onGround && p.input.jump) { p.vy = -11; } if (m.stomp && p.vy > 4) for (const e of game.enemies) if (e.x < p.x + p.w && e.x + e.w > p.x && e.y < p.y + p.h + 6 && e.y + e.h > p.y + p.h - 4) { e.hit(m.stomp, p.cx, 6, game); p.vy = -8; } if (m.water && p.inWater) p.vx *= 1.05; }
    if (p.carting) {
      const ty = Math.floor((p.y + p.h + 2) / TILE), onTrack = w.get(p.tileX, ty) === T.MINECART_TRACK || w.get(p.tileX, ty - 1) === T.MINECART_TRACK;
      if (!onTrack && !w.get(p.tileX, ty + 1) === T.MINECART_TRACK) { if (p.onGround || p.inWater) { p.carting = false; return; } }
      const sp = (ITEMS[p.equipment.minecart.id].cartSpeed || 8);
      if (p.input.left) p.cartVx = Math.max(-sp, p.cartVx - 0.25); else if (p.input.right) p.cartVx = Math.min(sp, p.cartVx + 0.25); else p.cartVx *= 0.995;
      p.vx = p.cartVx; p.fallStart = null; p.dir = p.cartVx < 0 ? -1 : 1;
      if (Math.abs(p.cartVx) > 5) for (const e of game.enemies) if (e.x < p.x + p.w + 6 && e.x + e.w > p.x - 6 && e.y < p.y + p.h && e.y + e.h > p.y) e.hit(Math.round(Math.abs(p.cartVx) * 6), p.cx, 8, game);
      // follow the track up/down one tile
      const nx = Math.floor((p.cx + Math.sign(p.cartVx) * 10) / TILE);
      for (const dy of [0, -1, 1]) if (w.get(nx, ty + dy) === T.MINECART_TRACK) { p.y = (ty + dy) * TILE - p.h - 1; break; }
    }
    Minions.tick(game);
  },
  mods(p, pm, game) { if (p.mounted) { const m = p.mounted; if (m.move) pm.move *= m.move; if (m.jump) pm.jump *= m.jump; if (m.fly) pm.flightMount = true; } },
  // vanity / dye colours for the player sprite
  dyeColor(color, dyeStack) { if (!dyeStack || !color) return color; const d = ITEMS[dyeStack.id].dye; if (!d) return color; return hueShift(color, d.hue, d.sat, d.light); },
  lookArmor(p, i) { this.init(p); return p.vanity[i] || p.armor[i]; },
  // HUD hints
  draw(game) { const p = game.player, ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H; if (p.mounted) drawText(ctx, `Mount: ${p.mounted.name} (N to dismount)`, W / 2, H - 92, { size: 12, align: 'center', color: '#ffe0a0' }); if (p.carting) drawText(ctx, `Minecart: ${Math.round(Math.abs(p.cartVx) * 4)} mph (J to hop off)`, W / 2, H - 92, { size: 12, align: 'center', color: '#c0c0c8' }); },
  drawMount(ctx, p, camX, camY) { const m = p.mounted; if (!m) return; const x = snap(p.cx - camX), y = snap(p.y + p.h - camY); ctx.fillStyle = m.color; if (m.kind === 'slime') { ctx.globalAlpha = 0.85; roundRect(ctx, x - 22, y - 16, 44, 22, 10); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(x + p.dir * 10 - 2, y - 10, 4, 5); } else if (m.kind === 'ufo') { ctx.fillStyle = '#a0a0b0'; ctx.beginPath(); ctx.ellipse(x, y + 4, 34, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(120,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x, y - 6, 18, 12, 0, Math.PI, 0); ctx.fill(); for (let k = 0; k < 4; k++) { ctx.fillStyle = (Date.now() >> 7) % 4 === k ? '#40ffff' : '#204040'; ctx.fillRect(x - 24 + k * 14, y + 6, 6, 3); } } else if (m.kind === 'pigron') { ctx.fillStyle = '#e0a0c0'; ctx.beginPath(); ctx.ellipse(x, y - 8, 30, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#4a8a70'; ctx.beginPath(); ctx.moveTo(x - p.dir * 26, y - 10); ctx.lineTo(x - p.dir * 44, y - 24); ctx.lineTo(x - p.dir * 40, y); ctx.fill(); ctx.fillStyle = '#f0c0d0'; ctx.fillRect(x + p.dir * 24, y - 12, 8, 8); } else { ctx.fillStyle = m.color; ctx.fillRect(x - 20, y - 14, 40, 14); ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 16, y, 6, 6); ctx.fillRect(x + 10, y, 6, 6); ctx.fillStyle = '#fff'; ctx.fillRect(x + p.dir * 18, y - 22, 6, 10); } },
  drawCart(ctx, p, camX, camY) { if (!p.carting) return; const x = snap(p.cx - camX), y = snap(p.y + p.h - camY); ctx.fillStyle = ITEMS[p.equipment.minecart.id].cartColor || '#8a6038'; ctx.fillRect(x - 18, y - 12, 36, 12); ctx.fillStyle = '#404048'; ctx.beginPath(); ctx.arc(x - 10, y + 2, 4, 0, Math.PI * 2); ctx.arc(x + 10, y + 2, 4, 0, Math.PI * 2); ctx.fill(); },
};
function hueShift(hex, hue, sat = 1, light = 1) { const m = /^#([0-9a-f]{6})$/i.exec(hex); if (!m) return hex; const n = parseInt(m[1], 16); let r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0, l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } h = ((h * 360 + hue) % 360 + 360) % 360; s = clamp(s * sat + (sat > 1 ? 0.3 : 0), 0, 1); l = clamp(l * light, 0, 1); return `hsl(${Math.round(h)},${Math.round(s * 100)}%,${Math.round(l * 100)}%)`; }
ModLib.onPlayerMods((p, pm, g) => Equipment.mods(p, pm, g));
ModKeys.bind('KeyN', 'Mount / dismount', (g) => Equipment.toggleMount(g));
ModKeys.bind('KeyJ', 'Minecart on / off (on a track)', (g) => Equipment.toggleCart(g));
ModKeys.bind('KeyH', 'Quick heal', () => {}); // listed for completeness (handled by the base game)

// Minions ------------------------------------------------------------------------------------------
class Minion extends Entity {
  constructor(x, y, def, owner) { super(x, y, def.w || 18, def.h || 18, ); this.def = def; this.owner = owner; this.t = randInt(0, 100); this.k = Math.random() * Math.PI * 2; this.target = null; this.shot = 0; this.hitCd = 0; this.dead = false; }
  update(world, game) {
    this.t++; const p = this.owner; if (this.hitCd > 0) this.hitCd--;
    if (this.def.sentry) { // sentries stay where they were placed and shoot whatever comes in range
      this.vx = 0; this.vy = 0; if (!this.placedY) { this.placedY = true; let ty = Math.floor((this.y + this.h) / TILE), k = 0; while (k < 12 && !world.isSolidAt(Math.floor(this.cx / TILE), ty)) { ty++; k++; } this.y = ty * TILE - this.h; }
      let t = null, bd = (this.def.range || 20) * TILE; for (const e of game.enemies) { if (e.dead) continue; const d = dist(e.cx, e.cy, this.cx, this.cy); if (d < bd) { bd = d; t = e; } }
      this.target = t;
      if (t && --this.shot <= 0) { this.shot = this.def.rate || 40; const dx = t.cx - this.cx, dy = t.cy - this.cy, d = Math.hypot(dx, dy) || 1; const b = new Projectile(this.cx, this.cy, dx / d * 10, dy / d * 10, { kind: this.def.projKind || 'bolt', damage: Math.round(this.def.damage * p.pm.dmg * (p.pm.summonDmg || 1)), friendly: true, owner: p, knockback: 3, color: this.def.color, hi: '#fff', pierce: this.def.pierce || 0 }); b.life = 70; b.gravity = this.def.projKind === 'arrow' ? 0.05 : 0; if (this.def.projKind === 'grenade') b.explosive = { radius: 3, damage: b.damage, tiles: false }; b.trail = { color: this.def.color, len: 6, width: 2 }; game.projectiles.push(b); }
      return;
    }
    let t = null, bd = 30 * TILE; for (const e of game.enemies) { if (e.dead || e.isDummy && false) continue; const d = dist(e.cx, e.cy, p.cx, p.cy); if (d < bd) { bd = d; t = e; } }
    this.target = t;
    if (t) { const tx = this.def.ranged ? t.cx + Math.sin(this.t * 0.05 + this.k) * 90 : t.cx, ty = this.def.ranged ? t.cy - 60 : t.cy; this.vx = lerp(this.vx, clamp((tx - this.cx) / 12, -this.def.speed, this.def.speed), 0.1); this.vy = lerp(this.vy, clamp((ty - this.cy) / 12, -this.def.speed, this.def.speed), 0.1); }
    else { const tx = p.cx - p.dir * (30 + (this.k % 3) * 18), ty = p.y - 20 + Math.sin(this.t * 0.05 + this.k) * 10; this.vx = lerp(this.vx, clamp((tx - this.cx) / 15, -6, 6), 0.08); this.vy = lerp(this.vy, clamp((ty - this.cy) / 15, -6, 6), 0.08); }
    this.x += this.vx; this.y += this.vy;
    if (dist(this.cx, this.cy, p.cx, p.cy) > 60 * TILE) { this.x = p.cx; this.y = p.y; }
    if (t && !this.def.ranged && this.hitCd === 0 && this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y) { t.hit(Math.round(this.def.damage * p.pm.dmg * (p.pm.summonDmg || 1)), this.cx, 3, game); this.hitCd = 20; ModLib.emit('minionHit', game, t, this); }
    if (t && this.def.ranged && --this.shot <= 0) { this.shot = this.def.rate || 40; const dx = t.cx - this.cx, dy = t.cy - this.cy, d = Math.hypot(dx, dy) || 1; const b = new Projectile(this.cx, this.cy, dx / d * 9, dy / d * 9, { kind: this.def.projKind || 'bolt', damage: Math.round(this.def.damage * p.pm.dmg * (p.pm.summonDmg || 1)), friendly: true, owner: p, knockback: 2, color: this.def.color, hi: '#fff' }); b.life = 80; b.ghost = !!this.def.ghost; game.projectiles.push(b); }
  }
  draw(ctx, camX, camY) { const x = snap(this.cx - camX), y = snap(this.cy - camY), d = this.def; ctx.save(); ctx.translate(x, y); if ((this.target ? this.target.cx : this.owner.cx) < this.cx) ctx.scale(-1, 1); ctx.fillStyle = d.color; if (d.shape === 'imp') { ctx.fillRect(-7, -8, 14, 16); ctx.fillStyle = '#ffe060'; ctx.fillRect(2, -5, 3, 3); ctx.fillStyle = '#ff8020'; ctx.fillRect(-9, -12, 4, 6); ctx.fillRect(5, -12, 4, 6); } else if (d.shape === 'bird') { ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = shade(d.color, 0.7); ctx.fillRect(-4, -8 + Math.sin(this.t * 0.5) * 3, 8, 4); ctx.fillStyle = '#ffa020'; ctx.fillRect(8, -1, 4, 2); } else if (d.shape === 'spider') { ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); for (let k = 0; k < 4; k++) { ctx.fillRect(-12 + k * 7, 4 + (k % 2) * 3, 2, 6); } ctx.fillStyle = '#ff4040'; ctx.fillRect(3, -3, 2, 2); } else if (d.shape === 'blade') { ctx.rotate(this.t * 0.3); ctx.fillRect(-2, -12, 4, 24); ctx.fillStyle = '#fff'; ctx.fillRect(-1, -12, 2, 8); } else if (d.shape === 'dragon') { ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = shade(d.color, 1.3); ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(0, -16 + Math.sin(this.t * 0.4) * 4); ctx.lineTo(6, -6); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(9, -3, 3, 3); } else { ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(2, -3, 3, 3); } ctx.restore(); }
}
const Minions = {
  list(game) { game.minions = game.minions || []; return game.minions; },
  max(p) { return 1 + (p.pm && p.pm.minionSlots || 0); },
  maxSentries(p) { return 1 + (p.pm && p.pm.sentrySlots || 0); },
  summon(game, it) { const p = game.player, L = this.list(game);
    if (it.minion && it.minion.sentry) { // sentries have their own slots and go where you point
      const S = L.filter(m => m.def.sentry); if (S.length >= this.maxSentries(p)) L.splice(L.indexOf(S[0]), 1);
      const m = new Minion(game.mouse.wx - 9, game.mouse.wy - 9, Object.assign({ id: it.id, damage: it.damage, speed: 0 }, it.minion), p); m.shot = 20; L.push(m); FX.burst(game, m.cx, m.cy, 10, it.minion.color, 3, 25); return;
    }
    const same = L.filter(m => m.def.id === it.id); if (L.filter(m => !m.def.sentry).length >= this.max(p)) { const old = L.find(m => m.def.id !== it.id && !m.def.sentry) || L.find(m => !m.def.sentry); L.splice(L.indexOf(old), 1); } const m = new Minion(p.cx, p.y, Object.assign({ id: it.id, damage: it.damage, speed: 7 }, it.minion), p); L.push(m); FX.burst(game, p.cx, p.y + 10, 10, it.minion.color, 3, 25); return m; },
  dismissAll(game) { this.list(game).length = 0; },
  tick(game) { const L = this.list(game); for (const m of L) m.update(game.world, game); },
  draw(game, s, cam) { for (const m of this.list(game)) m.draw(s, cam.x, cam.y); },
};

// Weapon classes ---------------------------------------------------------------------------------------
const Weapons = {
  aim(game) { const p = game.player; const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1; return [dx / d, dy / d]; },
  finish(game, slot, st, mult = 1) { const p = game.player; p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime * mult))); },
  // bows / guns / launchers: consume ammo of a kind
  ranged(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const ammoKind = it.ammoKind || 'bullet';
    const ammoI = p.inventory.findIndex(a => a && ITEMS[a.id].ammo === ammoKind);
    if (ammoI < 0) { p.useTimer = 15; if (game.useHeld === 1) game.message(`Out of ${ammoKind}s!`, '#ff8080'); return; }
    const ammo = p.inventory[ammoI], ad = ITEMS[ammo.id];
    const [nx, ny] = this.aim(game);
    const n = it.shots || 1; const spread = it.spread || 0.04;
    for (let k = 0; k < n; k++) { const a = Math.atan2(ny, nx) + rand(-spread, spread) + (n > 1 ? (k - (n - 1) / 2) * 0.08 : 0); const sp = (it.speed || 12) * p.pm.projSpeed * (ad.speedMult || 1); const b = new Projectile(p.cx, p.y + 14, Math.cos(a) * sp, Math.sin(a) * sp, { kind: ad.projKind || (ammoKind === 'arrow' ? 'arrow' : ammoKind === 'rocket' ? 'grenade' : 'bullet'), damage: Math.round((st.damage + (ad.damage || 0)) * p.pm.dmg * p.pm.rangedDmg), friendly: true, owner: p, knockback: st.knockback + (ad.knockback || 0), crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: (ad.pierce || 0) + (it.pierce || 0), color: ad.color, hi: '#fff' }); if (ad.explosive) b.explosive = { radius: ad.radius || 3, damage: b.damage, tiles: !!ad.tiles }; if (ad.fire) b.onHitBuff = 'On Fire!'; if (ad.homing) b.homingFriendly = ad.homing; if (ad.trail) b.trail = { color: ad.trail, len: 8, width: 3 }; if (it.trail) b.trail = { color: it.trail, len: 8, width: 3 }; game.projectiles.push(b); }
    if (!(it.noConsume || (ad.chanceKeep && Math.random() < ad.chanceKeep) || (p.pm.ammoSave && Math.random() < p.pm.ammoSave))) game.consumeSlot(ammo);
    this.finish(game, slot, st); Audio_.play(ammoKind === 'arrow' ? 'swing' : 'hit');
  },
  yoyo(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    let y = game.projectiles.find(b => b.kind === 'yoyo' && b.owner === p && !b.dead);
    if (!y) { const [nx, ny] = this.aim(game); y = new Projectile(p.cx, p.y + 14, nx * 10, ny * 10, { kind: 'yoyo', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: 999, color: it.color || '#ff4040' }); y.life = 1e9; y.gravity = 0; y.range = (it.range || 14) * TILE; y.ghost = true; y.trail = { color: it.color || '#ff4040', len: 6, width: 2 }; game.projectiles.push(y); }
    y.held = game.world.time; p.useTimer = 2; p.dir = game.mouse.wx < p.cx ? -1 : 1; p.armAngle = Math.atan2(game.mouse.wy - p.cy, Math.abs(game.mouse.wx - p.cx)) * 0.5;
  },
  flail(game, slot, it) { const p = game.player, st = itemStats(slot); if (game.projectiles.some(b => b.kind === 'flail' && b.owner === p && !b.dead)) return; const [nx, ny] = this.aim(game); const b = new Projectile(p.cx, p.y + 14, nx * 12, ny * 12, { kind: 'flail', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback + 2, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: 999, color: it.color || '#808088' }); b.life = 70; b.gravity = 0.15; b.ghost = true; b.range = (it.range || 12) * TILE; game.projectiles.push(b); this.finish(game, slot, st); Audio_.play('swing'); },
  spear(game, slot, it) { const p = game.player, st = itemStats(slot); const [nx, ny] = this.aim(game); const b = new Projectile(p.cx, p.y + 14, nx * 9, ny * 9, { kind: 'spear', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: 999, color: it.color || '#c0c0c8' }); b.life = 16; b.gravity = 0; b.ghost = true; b.spearOwner = p; game.projectiles.push(b); this.finish(game, slot, st); Audio_.play('swing'); },
  boomerang(game, slot, it) { const p = game.player, st = itemStats(slot); if (game.projectiles.filter(b => b.kind === 'bonemerang' && b.owner === p && !b.dead).length >= (it.count || 1)) return; const [nx, ny] = this.aim(game); const b = new Projectile(p.cx, p.y + 14, nx * (it.speed || 9), ny * (it.speed || 9), { kind: 'bonemerang', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: it.color }); b.life = 110; b.gravity = 0; game.projectiles.push(b); this.finish(game, slot, st); Audio_.play('swing'); },
  // magic: bolts with options (shots, homing, pierce, ghost, beam, spread, color, kind)
  magic(game, slot, it) {
    const p = game.player; let cost = Math.max(1, Math.round((it.manaCost || 10) * (1 - Math.min(0.6, (p.acc && p.acc.manaCostPct || 0) / 100))));
    if (p.pm.freeSpaceGun && slot.id === 'space_gun') cost = 0;
    if (typeof ManaOverload !== 'undefined' && ManaOverload.state(game).active > 0) cost = 0;
    if (p.mana < cost) { if (typeof ManaOverload !== 'undefined' && ManaOverload.tryOverload(game)) cost = 0; else { if (game.useHeld === 1) game.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return; } }
    p.mana -= cost; p.manaRegenDelay = 40; p.lastManaUse = cost;
    const st = itemStats(slot); const dmg = Math.round(st.damage * p.pm.dmg * (p.pm.magicDmg || 1) * (p.hasBuff('Mana Sickness') ? 0.75 : 1));
    const [nx, ny] = this.aim(game); const n = it.shots || 1;
    if (it.aoe) { const x = game.mouse.wx, y = game.mouse.wy; FX.burst(game, x, y, 14, it.color || '#ffe060', 4, 25); for (const e of game.enemies) if (dist(e.cx, e.cy, x, y) < it.aoe * TILE) e.hit(dmg, x, st.knockback, game, null, Math.random() * 100 < st.crit + p.pm.crit); }
    else for (let k = 0; k < n; k++) { const a = Math.atan2(ny, nx) + (n > 1 ? (k - (n - 1) / 2) * (it.spreadAng || 0.15) : 0) + rand(-(it.jitter || 0), it.jitter || 0); const sp = (it.speed || 9) * p.pm.projSpeed; const b = new Projectile(p.cx, p.y + 14, Math.cos(a) * sp, Math.sin(a) * sp, { kind: it.projKind || 'bolt', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: it.color || '#80f0ff', hi: it.hi || '#fff', magic: true, manaCost: cost, pierce: it.pierce || 0 }); b.life = it.life || 90; b.ghost = !!it.ghost; if (it.homing) b.homingFriendly = it.homing; if (it.gravity) b.gravity = it.gravity; if (it.trail !== false) b.trail = { color: it.color || '#80f0ff', len: 8, width: 3 }; if (it.glow) b.glow = { color: it.color, r: 12 }; if (it.onHitBuff) b.onHitBuff = it.onHitBuff; game.projectiles.push(b); }
    this.finish(game, slot, st); Audio_.play('swing');
  },
  summon(game, slot, it) { const p = game.player; const cost = it.manaCost || 10; if (p.mana < cost) { if (game.useHeld === 1) game.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return; } if (game.useHeld !== 1) return; p.mana -= cost; Minions.summon(game, it); p.startUse(slot.id, 20); const L = Minions.list(game); game.message(it.minion && it.minion.sentry ? `${L.filter(m => m.def.sentry).length}/${Minions.maxSentries(p)} sentries` : `${L.filter(m => !m.def.sentry).length}/${Minions.max(p)} minions`, '#c0ffc0'); Audio_.play('heal'); },
  whip(game, slot, it) { const p = game.player, st = itemStats(slot); const [nx] = this.aim(game); const reach = (it.reach || 5) * TILE; let n = 0; for (const e of game.enemies) { if (e.dead) continue; const inX = p.dir > 0 ? e.x + e.w > p.cx && e.x < p.cx + reach : e.x < p.cx && e.x + e.w > p.cx - reach; if (inX && Math.abs(e.cy - (p.y + 14)) < 40) { if (e.hit(Math.round(st.damage * p.pm.dmg), p.cx, st.knockback, game, game.swingId, Math.random() * 100 < st.crit + p.pm.crit) !== null) { e.whipTag = 120; n++; } } } game.swingId++; p.armAngle = 0.2; for (let k = 1; k <= 6; k++) game.particles.push(new Particle(p.cx + p.dir * k * reach / 6, p.y + 14 + Math.sin(k) * 6, 0, 0, it.color || '#c0a060', 8, 2)); this.finish(game, slot, st); Audio_.play('swing'); },
  // dispatch by weapon class
  use(game, slot, it) { switch (it.wclass) { case 'bow': case 'gun': case 'launcher': return this.ranged(game, slot, it); case 'yoyo': return this.yoyo(game, slot, it); case 'flail': return this.flail(game, slot, it); case 'spear': return this.spear(game, slot, it); case 'boomerang': return this.boomerang(game, slot, it); case 'magic': return this.magic(game, slot, it); case 'summon': return this.summon(game, slot, it); case 'whip': return this.whip(game, slot, it); } },
  // per-tick projectile behaviours for the new kinds
  projTick(game, b, world) {
    const p = b.owner;
    if (b.kind === 'yoyo') { const held = game.world.time - (b.held || 0) < 3 && game.mouse.left; const tx = held ? game.mouse.wx : p.cx, ty = held ? game.mouse.wy : p.cy; const dx = tx - b.x, dy = ty - b.y, d = Math.hypot(dx, dy) || 1; if (dist(b.x, b.y, p.cx, p.cy) > b.range && held) { b.vx = (p.cx - b.x) / d * 6; b.vy = (p.cy - b.y) / d * 6; } else { b.vx = dx / d * Math.min(12, d); b.vy = dy / d * Math.min(12, d); } if (!held && d < 14) b.dead = true; if (b.life % 10 === 0) b.hitSet.clear(); return true; }
    if (b.kind === 'flail') { if (b.life < 40) { const dx = p.cx - b.x, dy = p.cy - b.y, d = Math.hypot(dx, dy) || 1; b.vx = dx / d * 12; b.vy = dy / d * 12; b.gravity = 0; if (d < 14) b.dead = true; } if (b.life % 12 === 0) b.hitSet.clear(); return true; }
    if (b.kind === 'spear') { if (b.life < 8) { b.vx *= -1; b.vy *= -1; } return true; }
    if (b.homingFriendly) { let t = null, bd = 20 * TILE; for (const e of game.enemies) { const d = dist(e.cx, e.cy, b.x, b.y); if (d < bd) { bd = d; t = e; } } if (t) { const dx = t.cx - b.x, dy = t.cy - b.y, d = Math.hypot(dx, dy) || 1; b.vx += dx / d * b.homingFriendly; b.vy += dy / d * b.homingFriendly; const s = Math.hypot(b.vx, b.vy), mx = 12; if (s > mx) { b.vx *= mx / s; b.vy *= mx / s; } } }
    return false;
  },
  projHit(game, b, e) { if (b.onHitBuff) e.applyDebuff(b.onHitBuff === 'On Fire!' ? 'Frostburn' : b.onHitBuff, 180, 1); if (b.onHitBuff === 'On Fire!') { e.applyDebuff('Frostburn', 180, 1); } if (e.whipTag > 0 && b.friendly && b.owner === game.player) { /* summon tag: minions get bonus damage handled via minionHit */ } },
  drawProjectile(b, ctx) { switch (b.kind) { case 'yoyo': ctx.rotate(Date.now() * 0.03); ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(-1, -4, 2, 8); return true; case 'flail': ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Date.now() * 0.01; ctx.fillRect(Math.cos(a) * 8 - 1, Math.sin(a) * 8 - 1, 3, 3); } return true; case 'spear': ctx.fillStyle = b.color; ctx.fillRect(-14, -1, 28, 3); ctx.fillStyle = '#fff'; ctx.fillRect(10, -3, 8, 6); return true; } return false; },
  drawLines(game, s, cam) { const p = game.player; for (const b of game.projectiles) if ((b.kind === 'yoyo' || b.kind === 'flail') && b.owner === p && !b.dead) { s.strokeStyle = b.kind === 'flail' ? '#808088' : '#e0e0e0'; s.lineWidth = b.kind === 'flail' ? 3 : 1; s.beginPath(); s.moveTo(p.cx - cam.x, p.y + 14 - cam.y); s.lineTo(b.x + 3 - cam.x, b.y + 3 - cam.y); s.stroke(); } },
};
ModLib.on('projTick', (g, b) => Weapons.projTick(g, b, g.world));
ModLib.on('projHit', (g, b, e) => Weapons.projHit(g, b, e));
ModLib.on('minionHit', (g, e, m) => { if (e.whipTag > 0) { e.hit(Math.round(m.def.damage * 0.5), m.cx, 1, g); } });
