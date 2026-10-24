// ---------------------------------------------------------------------------
// The summoner batch: Summoner++ (minions, sentries, whistles & cords, the
// Flinx Hood, the Minion Horn), MoreWhipClassic (11 whips), More Whip-Based
// Armors (Monk / Tiki / Shinobi / Stardust whip set bonuses), Whip Accessories
// (ten gloves), Evil Biome Summoner Extension (Mother of Creepers, Rotten Eye,
// Ocular Staff, Metallic Eye, Bloody Scythe, Rotten Whip, Resentful Eye,
// Disgraceful Thorns, Molten Necklace), Ore Helmets for Summoner, Ophidiomancy
// (snake charming as a summoner set), Goose's Vanilla Expansion (maces,
// boomerangs, early minions, the pilum), Starting Class Weapons and Wood Armor
// Bonuses (biome woods + wood armor sets with real set bonuses).
// ---------------------------------------------------------------------------
'use strict';

for (const [id, name, ws, desc] of [['summoner_pp', 'Summoner++', 3437129849, 'Ten minions, three sentries, three whips, whistles & cords, the Flinx Hood and the Minion Horn.'], ['more_whip_classic', 'MoreWhipClassic', 3377813324, 'Eleven new whips from the Whip Rope to the Stardust Whip.'], ['whip_armors', 'More Whip-Based Armors', 2566784234, 'Monk, Tiki, Shinobi and Stardust armor get whip range / speed set bonuses.'], ['whip_accessories', 'Whip Accessories', 2931940759, 'Ten gloves and gauntlets that boost whips, from Wooden Bracers to the Ghostly Grip.'], ['evil_summoner', 'Evil Biome Summoner Extension', 3354407425, 'Mother of Creepers, Rotten Eye, Ocular Staff, Metallic Eye, Bloody Scythe, Rotten Whip and the evil-armor conversion accessories.'], ['ore_helmets_summoner', 'Ore Helmets for Summoner', 3295583831, 'Hardmode ore hoods that turn every ore set into a summoner set.'], ['ophidiomancy', 'Ophidiomancy (Summoner Class Version)', 3600487583, 'Snake minions, the Snake Charmer set and serpent accessories.'], ['goose_vanilla', "Goose's Vanilla Expansion", 3042173082, 'Maces, boomerangs, early minions and the Pilum.'], ['starting_class_weapons', 'Starting Class Weapons', 3273327692, 'A starting weapon for each class, crafted from 10 wood.'], ['wood_armor_bonuses', 'Wood Armor Bonuses', 2872591661, 'Biome woods drop from their trees; every wood armor set has a real bonus.']]) ModList.register(id, name, { workshop: ws, desc, builtin: true });

// --- whip mechanics: range / speed modifiers, flat tag damage, on-hit effects ---------------------
ModList.current = null;
Weapons.whip = function (game, slot, it) {
  const p = game.player, st = itemStats(slot), pm = p.pm; this.aim(game);
  const reach = (it.reach || 5) * TILE * (pm.whipRange || 1); const tag = (it.tagDamage || 4) + (pm.whipTag || 0); let n = 0;
  for (const e of game.enemies) {
    if (e.dead) continue;
    const inX = p.dir > 0 ? e.x + e.w > p.cx && e.x < p.cx + reach : e.x < p.cx && e.x + e.w > p.cx - reach;
    if (inX && Math.abs(e.cy - (p.y + 14)) < 40 + reach * 0.12) {
      const dmg = Math.round(st.damage * pm.dmg * (pm.summonDmg || 1));
      if (e.hit(dmg, p.cx, st.knockback, game, game.swingId, Math.random() * 100 < st.crit + pm.crit) !== null) { e.whipTag = 120; e.whipTagDmg = tag; n++; if (it.onHitBuff) e.applyDebuff(it.onHitBuff, 180, 1); if (it.whipEffect) it.whipEffect(game, e, p, dmg); ModLib.emit('whipHit', game, e, it, dmg); }
    }
  }
  game.swingId++; p.armAngle = 0.2;
  for (let k = 1; k <= 8; k++) game.particles.push(new Particle(p.cx + p.dir * k * reach / 8, p.y + 14 + Math.sin(k + game.world.time * 0.3) * 6, 0, 0, it.color || '#c0a060', 8, 2));
  this.finish(game, slot, st, 1 / (pm.whipSpeed || 1)); Audio_.play('swing');
};
ModLib.on('minionHit', (g, e, m) => { if (e.whipTag > 0 && e.whipTagDmg) { e.hit(e.whipTagDmg, m.cx, 0, g); if (g.player.pm.whipTagLife && g.player.hp < g.player.maxHp && Math.random() < 0.2) g.player.hp += 1; } });
// minion / sentry framework extensions
const _minUpdate = Minion.prototype.update, _minDraw = Minion.prototype.draw;
Minion.prototype.update = function (world, game) { if (this.def.custom) { this.t++; if (this.hitCd > 0) this.hitCd--; return this.def.custom(this, world, game); } return _minUpdate.call(this, world, game); };
Minion.prototype.draw = function (ctx, cx, cy) { if (this.def.drawFn) return this.def.drawFn(this, ctx, cx, cy); return _minDraw.call(this, ctx, cx, cy); };
Minion.prototype.dealMelee = function (game, t, mult = 1) { const p = this.owner; t.hit(Math.round(this.def.damage * p.pm.dmg * (p.pm.summonDmg || 1) * mult), this.cx, 3, game); this.hitCd = this.def.rate || 20; ModLib.emit('minionHit', game, t, this); };
Minion.prototype.fire = function (game, t, o = {}) { const p = this.owner; const dx = t.cx - this.cx, dy = t.cy - this.cy, d = Math.hypot(dx, dy) || 1; const sp = o.speed || 9; const b = modShot(game, this.cx, this.cy, dx / d * sp, dy / d * sp, { damage: Math.round(this.def.damage * p.pm.dmg * (p.pm.summonDmg || 1) * (o.mult || 1)), color: o.color || this.def.color, life: o.life || 80, ghost: o.ghost != null ? o.ghost : !!this.def.ghost, homing: o.homing, knockback: 2, props: { kind: o.kind || this.def.projKind || 'bolt' } }); b.minionShot = this; return b; };
ModLib.on('projHit', (g, b, e) => { if (b.minionShot) ModLib.emit('minionHit', g, e, b.minionShot); });
class Sentry extends Minion {
  constructor(x, y, def, owner) { super(x - (def.w || 18) / 2, y - (def.h || 18) / 2, def, owner); this.life = 60 * (def.life || 120); this.vy = 0; }
  update(world, game) {
    this.t++; if (this.hitCd > 0) this.hitCd--; if (--this.life <= 0) { this.dead = true; return; }
    if (!this.def.floats) { this.vy = Math.min(this.vy + 0.4, 8); this.y += this.vy; const row = Math.floor((this.y + this.h) / TILE); if (world.isSolidAt(this.tileX, row)) { this.y = row * TILE - this.h; this.vy = 0; } }
    const t = ModLib.nearestEnemy(game, this.cx, this.cy, (this.def.range || 25) * TILE); this.target = t; if (!t) return;
    if (this.def.ranged) { if (--this.shot <= 0) { this.shot = this.def.rate || 40; this.fire(game, t, { homing: this.def.homing, mult: this.def.mult }); } }
    else { const r = (this.def.reach || 1) * TILE; if (this.hitCd === 0 && t.x < this.x + this.w + r && t.x + t.w > this.x - r && t.y < this.y + this.h + r && t.y + t.h > this.y - r) { if (this.def.warmup && this.t < this.def.warmup) return; this.dealMelee(game, t); } }
  }
  draw(ctx, cx, cy) { const x = snap(this.cx - cx), y = snap(this.cy - cy), d = this.def; ctx.save(); ctx.translate(x, y); if (d.drawFn) d.drawFn(this, ctx, 0, 0); else { ctx.fillStyle = d.color; ctx.fillRect(-9, -6, 18, 14); ctx.fillStyle = '#404048'; ctx.fillRect(-12, 8, 24, 3); ctx.fillStyle = '#fff'; ctx.fillRect(-2, -2, 4, 4); } ctx.restore(); if (this.life < 240) { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x - 10, y - 16, 20 * this.life / 240, 2); } }
}
Minions.maxSentries = (p) => 1 + (p.pm && p.pm.sentrySlots || 0);
Minions.summon = function (game, it) {
  const p = game.player, L = this.list(game), md = it.minion, isS = !!md.sentry;
  if (md.serpent) { const ex = L.find(m => m.def.id === it.id && !m.clone); if (ex) { ex.segs = Math.min(40, ex.segs + (md.grow || 3)); FX.burst(game, ex.cx, ex.cy, 8, md.color, 3, 20); return ex; } }
  const same = L.filter(m => !!m.def.sentry === isS && !m.clone), cap = isS ? this.maxSentries(p) : this.max(p);
  if (same.length >= cap) { const old = same.find(m => m.def.id !== it.id) || same[0]; L.splice(L.indexOf(old), 1); for (const c of L.filter(m => m.clone && m.cloneOf === old)) L.splice(L.indexOf(c), 1); }
  let def = Object.assign({ id: it.id, damage: it.damage, speed: 7 }, md);
  if (md.variant) def = Object.assign(def, md.variant(game, L)); // e.g. Mother of Creepers: brain first, creepers after
  const m = isS ? new Sentry(game.mouse.wx, game.mouse.wy, def, p) : new Minion(p.cx, p.y, def, p);
  if (md.serpent) { m.segs = md.segs || 6; m.hist = []; }
  L.push(m); FX.burst(game, isS ? m.cx : p.cx, isS ? m.cy : p.y + 10, 10, md.color, 3, 25);
  if (!isS && ModLib.hasAcc(p, 'stone_of_illusions')) { const c = new Minion(p.cx, p.y, Object.assign({}, def, { damage: Math.max(1, Math.round(def.damage * 0.3)), custom: def.custom, serpent: false }), p); c.clone = true; c.cloneOf = m; if (md.serpent) { c.segs = 3; c.hist = []; } L.push(c); }
  return m;
};
Minions.tick = function (game) { const L = this.list(game); for (const m of L) m.update(game.world, game); for (let i = L.length - 1; i >= 0; i--) if (L[i].dead || (L[i].clone && !L.includes(L[i].cloneOf))) L.splice(i, 1); };
Minions.teleportAll = function (game) { const p = game.player; for (const m of this.list(game)) if (!m.def.sentry) { m.x = p.cx + rand(-20, 20); m.y = p.y; if (m.hist) m.hist.length = 0; } FX.burst(game, p.cx, p.cy, 12, '#c0ffc0', 3, 20); };
// serpent minions: a long chain that whips through enemies (Rotten Eye / Metallic Eye / snakes)
function serpentAi(m, world, game) {
  const p = m.owner; let t = ModLib.nearestEnemy(game, p.cx, p.cy, 30 * TILE); m.target = t;
  const tx = t ? t.cx : p.cx - p.dir * 40 + Math.cos(m.t * 0.03) * 60, ty = t ? t.cy : p.y - 30 + Math.sin(m.t * 0.05) * 30;
  const dx = tx - m.cx, dy = ty - m.cy, d = Math.hypot(dx, dy) || 1, sp = m.def.speed || 9;
  m.vx = lerp(m.vx, dx / d * sp, 0.1); m.vy = lerp(m.vy, dy / d * sp, 0.1); m.x += m.vx; m.y += m.vy;
  if (dist(m.cx, m.cy, p.cx, p.cy) > 70 * TILE) { m.x = p.cx; m.y = p.y; m.hist.length = 0; }
  const segs = m.segs + (m.extraSegs || 0); m.hist.unshift([m.cx, m.cy]); if (m.hist.length > segs * 4 + 4) m.hist.length = segs * 4 + 4;
  if (m.hitCd === 0) for (const e of game.enemies) { if (e.dead) continue; let hit = false; for (let k = 0; k < m.hist.length; k += 4) { const [hx, hy] = m.hist[k]; if (hx > e.x - 6 && hx < e.x + e.w + 6 && hy > e.y - 6 && hy < e.y + e.h + 6) { hit = true; break; } } if (hit) { m.dealMelee(game, e, 1 + segs * 0.04); if (m.def.probes && m.t % 3 === 0) m.fire(game, e, { color: '#ff4040', life: 50 }); break; } }
}
function serpentDraw(m, ctx, cx, cy) { const d = m.def, segs = m.segs + (m.extraSegs || 0); ctx.lineWidth = d.thick || 12; ctx.lineCap = 'round'; ctx.strokeStyle = d.color; ctx.beginPath(); ctx.moveTo(m.cx - cx, m.cy - cy); for (let k = 0; k < Math.min(m.hist.length, segs * 4); k += 2) ctx.lineTo(m.hist[k][0] - cx, m.hist[k][1] - cy); ctx.stroke(); if (d.armored) { ctx.fillStyle = '#404048'; for (let k = 4; k < Math.min(m.hist.length, segs * 4); k += 8) ctx.fillRect(m.hist[k][0] - cx - 4, m.hist[k][1] - cy - 3, 8, 6); } ctx.fillStyle = d.head || d.color; ctx.beginPath(); ctx.arc(m.cx - cx, m.cy - cy, (d.thick || 12) * 0.75, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = d.eye || '#ff4040'; ctx.fillRect(m.cx - cx - 2 + (m.vx > 0 ? 3 : -3), m.cy - cy - 3, 3, 3); }
const SERPENT = (color, o = {}) => Object.assign({ color, serpent: true, custom: serpentAi, drawFn: serpentDraw, segs: 6, grow: 3, speed: 10 }, o);
ModLib.onPlayerMods((p, pm, g) => { if (!pm.whipRange) pm.whipRange = 1; if (!pm.whipSpeed) pm.whipSpeed = 1; for (const it of ModLib.accs(p)) { if (it.whipRange) pm.whipRange = Math.max(pm.whipRange, 1 + it.whipRange); if (it.whipSpeed) pm.whipSpeed = Math.max(pm.whipSpeed, 1 + it.whipSpeed); if (it.whipTag) pm.whipTag = (pm.whipTag || 0) + it.whipTag; if (it.sentrySlots) pm.sentrySlots = (pm.sentrySlots || 0) + it.sentrySlots; } });

// === Summoner++ ==================================================================================
ModList.current = 'summoner_pp';
const SUMMON = (id, name, dmg, rarity, value, minion, o = {}) => defModWeapon(id, name, 'summon', dmg, 30, o.kb || 2, rarity, value, Object.assign({ manaCost: 10, minion }, o));
SUMMON('living_fireball_staff', 'Living Fireball Staff', 9, 1, 8000, { color: '#ff8020', shape: 'orb', ranged: true, rate: 40, speed: 7, ghost: true }, { recipe: [['torch', 20], ['gel', 15], ['fallen_star', 1]], station: 'workbench', desc: 'A living flame that lobs fireballs' });
SUMMON('wisp_staff', 'Wisp Staff', 12, 2, 15000, { color: '#a0e0ff', shape: 'orb', ranged: true, rate: 30, speed: 8, ghost: true }, { recipe: [['glow_mushroom', 15], ['fallen_star', 3], ['silver_bar', 5]], station: 'anvil' });
SUMMON('bat_staff', 'Bat Staff', 13, 2, 15000, { color: '#3a2a3a', shape: 'bird', speed: 10 }, { desc: 'Dropped by cave bats' });
ENEMY_DEFS.bat.drops.push({ id: 'bat_staff', chance: 0.02 }); ENEMY_DEFS.jungle_bat.drops.push({ id: 'bat_staff', chance: 0.02 });
SUMMON('bee_queen_staff', "Hive Guardian Staff", 22, 3, 30000, { color: '#e0c040', shape: 'bird', ranged: true, rate: 25, speed: 9, projKind: 'seal' }, { recipe: [['bee_wax', 12], ['stinger', 3]], station: 'anvil' });
SUMMON('fairy_staff', 'Fairy Staff', 30, 4, 40000, { color: '#ffb0ff', shape: 'orb', ranged: true, rate: 22, speed: 10, ghost: true, homing: 0.3 }, { recipe: [['pixie_dust', 12], ['crystal_shard', 6], ['soul_of_light', 4]], station: 'mythril_anvil', desc: 'An early Hardmode fairy that fires fast homing sparkles' });
SUMMON('crimson_axe_staff', 'Crimson Axe', 42, 5, 60000, { color: '#c02030', shape: 'blade', speed: 11, rate: 14 }, { desc: 'Dropped by Crimson Mimics: a flying axe that cleaves fast' });
SUMMON('corrupt_spear_staff', 'Corrupt Spear', 44, 5, 60000, { color: '#6a3ad0', shape: 'blade', ranged: true, rate: 24, speed: 12, projKind: 'spear', ghost: true }, { desc: 'Dropped by Corrupt Mimics: a spear that lunges through enemies' });
if (ENEMY_DEFS.crimslime) ENEMY_DEFS.crimslime.drops.push({ id: 'crimson_axe_staff', chance: 0.05 }); if (ENEMY_DEFS.corruptor) ENEMY_DEFS.corruptor.drops.push({ id: 'corrupt_spear_staff', chance: 0.05 });
SUMMON('clone_staff', 'Clone Staff', 36, 5, 60000, { color: '#f2c6a0', shape: 'imp', ranged: true, rate: 30, speed: 8, projKind: 'knife' }, { recipe: [['soul_of_night', 8], ['soul_of_light', 8], ['hallowed_bar', 5]], station: 'mythril_anvil', desc: 'A tiny copy of you that throws knives (clones deal 80% tag damage)' });
SUMMON('knife_staff', 'Knife Staff', 48, 6, 80000, { color: '#c0c0c8', shape: 'blade', ranged: true, rate: 12, speed: 14, projKind: 'knife' }, { recipe: [['chlorophyte_bar', 10], ['soul_of_fright', 5]], station: 'mythril_anvil' });
SUMMON('spectral_hound_staff', 'Spectral Hound Staff', 60, 7, 120000, { color: '#a0ffff', shape: 'imp', speed: 12, rate: 12 }, { recipe: [['ectoplasm', 15], ['soul_of_night', 10]], station: 'mythril_anvil' });
SUMMON('dark_harvest_scythe', 'Dark Harvest', 74, 8, 150000, { color: '#3a2a4a', shape: 'blade', speed: 12, rate: 10 }, { desc: 'A reaper that harvests without regular tag damage but hits very fast', recipe: [['ectoplasm', 20], ['beetle_husk', 8]], station: 'mythril_anvil' });
// sentries
SUMMON('bone_saw_sentry', 'Bone Saw', 30, 3, 30000, { color: '#e8e8e0', sentry: true, reach: 1.5, rate: 6, warmup: 180, life: 120, w: 26, h: 20, drawFn: (m, c) => { c.fillStyle = '#e8e8e0'; c.save(); c.rotate(m.t * (m.t > 180 ? 0.4 : 0.05)); for (let k = 0; k < 8; k++) { c.rotate(Math.PI / 4); c.fillRect(-2, -13, 4, 8); } c.restore(); c.fillStyle = '#c0c0b8'; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill(); } }, { recipe: [['bone', 30], ['iron_bar', 5]], station: 'anvil', desc: 'A sentry saw that needs 3 seconds to spin up, then shreds anything walking through it' });
SUMMON('spike_trap_sentry', 'Spike Trap', 16, 2, 15000, { color: '#808088', sentry: true, reach: 0.8, rate: 20, life: 120, w: 30, h: 10, drawFn: (m, c) => { c.fillStyle = '#606068'; c.fillRect(-15, 0, 30, 6); c.fillStyle = '#c0c0c8'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(-14 + k * 7, 0); c.lineTo(-11 + k * 7, -8 - (m.target ? 4 : 0)); c.lineTo(-8 + k * 7, 0); c.fill(); } } }, { recipe: [['spike', 5], ['iron_bar', 8]], station: 'anvil' });
SUMMON('flame_turret_sentry', 'Flame Turret', 26, 4, 50000, { color: '#ff8020', sentry: true, ranged: true, rate: 8, range: 14, life: 120, w: 20, h: 22, ghost: false }, { recipe: [['hellstone_bar', 12], ['iron_bar', 5]], station: 'anvil', desc: 'Spits a stream of fire at anything nearby' });
// whips
const WHIP = (id, name, dmg, use, kb, rarity, value, o = {}) => defModWeapon(id, name, 'whip', dmg, use, kb, rarity, value, o);
WHIP('whistle_whip', 'Whistling Whip', 16, 30, 2, 2, 15000, { reach: 6, color: '#c0a060', tagDamage: 5, recipe: [['silk', 6], ['gold_bar', 4]], station: 'anvil', desc: 'Tagged enemies are pulled toward your minions' });
WHIP('venom_lash', 'Venom Lash', 34, 28, 3, 4, 40000, { reach: 8, color: '#80ff40', tagDamage: 6, onHitBuff: 'Poisoned', recipe: [['jungle_spores', 10], ['stinger', 8], ['vine', 3]], station: 'anvil' });
WHIP('spectral_lash', 'Spectral Lash', 66, 24, 4, 7, 120000, { reach: 11, color: '#a0ffff', tagDamage: 10, whipEffect: (g, e, p) => { if (p.hp < p.maxHp && Math.random() < 0.15) { p.hp += 5; g.addDamageText(p.cx, p.y - 6, '+5', '#a0ffff'); } }, recipe: [['ectoplasm', 12], ['silk', 5]], station: 'mythril_anvil', desc: 'Hits sometimes heal you' });
// whistles (tag damage / effects) and cords (range & speed)
for (const [id, name, tip, props, recipe, st] of [
  ['bone_whistle', 'Bone Whistle', '+3 whip tag damage', { whipTag: 3 }, [['bone', 15]], 'anvil'], ['bee_whistle', 'Bee Whistle', '+4 whip tag damage, whip hits release bees', { whipTag: 4, whipBees: true }, [['bee_wax', 8], ['stinger', 2]], 'anvil'],
  ['molten_whistle', 'Molten Whistle', '+5 whip tag damage, whip hits set enemies on fire', { whipTag: 5, whipFire: true }, [['hellstone_bar', 6]], 'anvil'], ['whistle_of_yin', 'Whistle of Yin', '+5 whip tag damage, minions crit on tagged enemies', { whipTag: 5, whipTagCrit: true }, [['soul_of_night', 8], ['bone', 10]], 'mythril_anvil'],
  ['whistle_of_yang', 'Whistle of Yang', '+1 whip tag damage, tagged enemies take 10% more damage from everything', { whipTag: 1, whipVuln: true }, [['soul_of_light', 8], ['bone', 10]], 'mythril_anvil'],
  ['leather_cord', 'Leather Cord', '+15% whip range', { whipRange: 0.15 }, [['silk', 4], ['iron_bar', 2]], 'anvil'], ['spider_cord', 'Spider Cord', '+25% whip range, +10% whip speed', { whipRange: 0.25, whipSpeed: 0.1 }, [['spider_fang', 6], ['silk', 4]], 'anvil'],
  ['molten_cord', 'Molten Cord', '+20% whip speed', { whipSpeed: 0.2 }, [['hellstone_bar', 6], ['silk', 4]], 'anvil'], ['hallowed_cord', 'Hallowed Cord', '+30% whip range, +25% whip speed', { whipRange: 0.3, whipSpeed: 0.25 }, [['hallowed_bar', 6], ['silk', 4]], 'mythril_anvil'],
]) ACC(id, name, Object.assign({ rarity: 3, value: 30000, tooltip: tip, recipe, station: st }, props), genericIcon(id.includes('cord') ? '#8a6038' : '#e0d0a0', '#fff', 'ring'));
ACC('molten_glove', 'Molten Glove', { rarity: 4, value: 60000, tooltip: 'Molten Whistle + Molten Cord + Feral Claws: +5 tag damage, fire on whip hits, +20% whip speed, +12% melee speed', whipTag: 5, whipFire: true, whipSpeed: 0.2, recipe: [['molten_whistle', 1], ['molten_cord', 1], ['hellstone_bar', 5]], station: 'tinkerers_workshop' }, genericIcon('#ff8020', '#fff', 'box'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'molten_glove')) pm.useTime *= 0.88; });
ACC('stone_of_illusions', 'Stone of Illusions', { rarity: 5, value: 80000, tooltip: 'Every minion you summon is joined by a much weaker illusion (30% damage). Dropped by Hallowed Mimics / Chaos Elementals' }, genericIcon('#ffb0ff', '#fff', 'orb'));
if (ENEMY_DEFS.chaos_elemental) ENEMY_DEFS.chaos_elemental.drops.push({ id: 'stone_of_illusions', chance: 0.04 });
ModLib.on('whipHit', (g, e, it, dmg) => { const acc = ModLib.accs(g.player); if (acc.some(a => a.whipFire)) e.applyDebuff('Frostburn', 180, 1); if (acc.some(a => a.whipBees) && Math.random() < 0.5) { const b = modShot(g, g.player.cx, g.player.y + 10, rand(-3, 3), rand(-3, 1), { damage: 8, color: '#e0c040', life: 90, homing: 0.4, props: { kind: 'seal' } }); b.gravity = 0; } if (acc.some(a => a.whipVuln)) e.vuln = 120; });
ModLib.on('enemyHit', (g, e) => { if (e.vuln > 0 && !e._vulnLock) { e._vulnLock = true; e.hp -= Math.round((e.lastHitDamage || 0) * 0.1); e._vulnLock = false; } });
ModLib.on('tick', (g) => { for (const e of g.enemies) if (e.vuln > 0) e.vuln--; });
ModLib.on('minionHit', (g, e, m) => { if (g.player.pm.whipTagCrit && e.whipTag > 0 && Math.random() < 0.15) e.hit(Math.round(m.def.damage * 0.5), m.cx, 0, g); });
ModLib.onPlayerMods((p, pm) => { for (const it of ModLib.accs(p)) if (it.whipTagCrit) pm.whipTagCrit = true; });
defModMaterial('flinx_fur', 'Flinx Fur', { color: '#c0d8f0', hi: '#fff', rarity: 1, value: 300, tooltip: 'Dropped by Ice Slimes and Ice Bats' });
ENEMY_DEFS.ice_slime.drops.push({ id: 'flinx_fur', chance: 0.5, min: 1, max: 2 }); if (ENEMY_DEFS.ice_bat) ENEMY_DEFS.ice_bat.drops.push({ id: 'flinx_fur', chance: 0.4 });
defArmor('flinx_fur_coat', 'Flinx Fur Coat', 'body', 'silver', 5, 1); ITEMS.flinx_fur_coat.set = 'flinx'; ITEMS.flinx_fur_coat.tooltip = '5 defense, +1 minion slot, +5% summon damage. Set bonus with the Flinx Hood: +1 minion slot, +10% summon damage, +8% whip speed'; ITEM_VALUES.flinx_fur_coat = 8000; ITEMS.flinx_fur_coat.value = 8000; RECIPES.push({ result: 'flinx_fur_coat', count: 1, station: 'workbench', ing: [['flinx_fur', 10], ['silk', 8]] });
ARMOR_PIECE_MODS.flinx_fur_coat = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; pm.summonDmg = (pm.summonDmg || 1) * 1.05; };
defArmor('flinx_hood', 'Flinx Hood', 'head', 'silver', 3, 1); ITEMS.flinx_hood.set = 'flinx'; ITEMS.flinx_hood.tooltip = '3 defense, +6% summon damage. Set bonus with the Flinx Fur Coat: +1 minion slot, +10% summon damage, +8% whip speed'; ITEM_VALUES.flinx_hood = 6000; ITEMS.flinx_hood.value = 6000; RECIPES.push({ result: 'flinx_hood', count: 1, station: 'workbench', ing: [['flinx_fur', 6], ['silk', 4]] });
ARMOR_PIECE_MODS.flinx_hood = (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * 1.06; };
ModLib.onPlayerMods((p, pm) => { if (p.armor[0] && p.armor[0].id === 'flinx_hood' && p.armor[1] && p.armor[1].id === 'flinx_fur_coat') { pm.minionSlots = (pm.minionSlots || 0) + 1; pm.summonDmg = (pm.summonDmg || 1) * 1.1; pm.whipSpeed = (pm.whipSpeed || 1) * 1.08; } });
SUMMON('flinx_staff', 'Flinx Staff', 8, 1, 6000, { color: '#c0d8f0', shape: 'imp', speed: 8 }, { recipe: [['flinx_fur', 8], ['ice', 10]], station: 'workbench' });
CAT('minion_horn', { name: 'Minion Horn', max: 1, rarity: 2, tooltip: 'Calls all of your minions to your side', drawIcon: genericIcon('#e0d0a0', '#8a6038', 'box'), use: (g, s) => { if (g.useHeld !== 1) return; g.player.useTimer = 20; Minions.teleportAll(g); Audio_.play('menu'); } }, 10000);
RECIPES.push({ result: 'minion_horn', count: 1, station: 'workbench', ing: [['bone', 5], ['silk', 3]] });

// === MoreWhipClassic ==============================================================================
ModList.current = 'more_whip_classic';
WHIP('whip_rope', 'Whip Rope', 8, 32, 1, 0, 2000, { reach: 5, color: '#a08050', tagDamage: 2, recipe: [['cobweb', 10], ['wood', 5]], station: 'workbench' });
WHIP('mycelium_light', 'Mycelium Light', 14, 30, 2, 1, 8000, { reach: 6, color: '#80c0ff', tagDamage: 4, recipe: [['glow_mushroom', 15], ['gel', 10]], station: 'workbench', desc: 'Glows softly' });
WHIP('tendon_whip', 'Tedon', 20, 28, 3, 2, 15000, { reach: 7, color: '#c04050', tagDamage: 5, recipe: [['vertebra', 10], ['tissue_sample', 4]], station: 'anvil' });
WHIP('shadow_whip', 'Shadow Whip', 21, 28, 3, 2, 15000, { reach: 7, color: '#6a3ad0', tagDamage: 5, recipe: [['rotten_chunk', 10], ['shadow_scale', 4]], station: 'anvil' });
WHIP('dark_whip', 'Dark Whip', 40, 26, 3, 4, 40000, { reach: 8, color: '#302040', tagDamage: 7, onHitBuff: 'Frostburn', recipe: [['soul_of_night', 10], ['cursed_flame', 5]], station: 'mythril_anvil' });
WHIP('goosamer', 'Goosamer', 26, 24, 2, 3, 25000, { reach: 9, color: '#f0f0ff', tagDamage: 5, recipe: [['silk', 12], ['spider_fang', 6]], station: 'anvil', desc: 'A long, thin silk whip' });
WHIP('crystal_light', 'Crystal Light', 46, 26, 4, 5, 60000, { reach: 9, color: '#ffb0ff', tagDamage: 8, recipe: [['crystal_shard', 15], ['soul_of_light', 8]], station: 'mythril_anvil' });
WHIP('chlorophyte_whip', 'Chlorophyte Whip', 58, 24, 4, 7, 100000, { reach: 10, color: '#60ff60', tagDamage: 9, onHitBuff: 'Poisoned', recipe: [['chlorophyte_bar', 12]], station: 'mythril_anvil' });
WHIP('sand_shine', 'Sand Shine', 34, 26, 3, 4, 40000, { reach: 8, color: '#e8d090', tagDamage: 6, recipe: [['hardened_sand', 20], ['antlion_mandible', 5], ['soul_of_light', 3]], station: 'mythril_anvil' });
WHIP('christmas_tree_whip', 'Christmas Tree Whip', 84, 22, 5, 8, 200000, { reach: 12, color: '#2a8a2a', tagDamage: 12, recipe: [['christmas_tree_sword', 1], ['silk', 10]], station: 'mythril_anvil', desc: 'Drips ornaments on tagged enemies' });
WHIP('stardust_whip', 'Stardust Whip', 120, 20, 5, 10, 400000, { reach: 14, color: '#80c0ff', tagDamage: 16, recipe: [['stardust_fragment', 18], ['luminite_bar', 4]], station: 'ancient_manipulator' });

// === More Whip-Based Armors (Monk / Tiki / Shinobi / Stardust) =====================================
ModList.current = 'whip_armors';
defModArmorSet('monk', 'Monk', { colors: ['#f0e0c0', '#c0a060', '#806030'], rarity: 5, bar: 'defender_medal', cost: [15, 15, 15], value: 100000, station: 'mythril_anvil', pieces: [['monks_bushy_brow_bald_cap', "Monk's Bushy Brow Bald Cap", 'head', 12, { desc: '+20% summon damage' }], ['monks_shirt', "Monk's Shirt", 'body', 20, { desc: '+1 minion slot' }], ['monks_pants', "Monk's Pants", 'legs', 14, { desc: '+20% movement speed' }]], desc: '+35% whip range, +25% whip speed, +1 sentry slot', bonus: (p, pm) => { pm.whipRange = (pm.whipRange || 1) * 1.35; pm.whipSpeed = (pm.whipSpeed || 1) * 1.25; pm.sentrySlots = (pm.sentrySlots || 0) + 1; } });
ARMOR_PIECE_MODS.monks_bushy_brow_bald_cap = (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * 1.2; }; ARMOR_PIECE_MODS.monks_shirt = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; }; ARMOR_PIECE_MODS.monks_pants = (p, pm) => { pm.move *= 1.2; };
defModArmorSet('tiki', 'Tiki', { colors: ['#e0c080', '#a06030', '#603010'], rarity: 6, value: 150000, pieces: [['tiki_mask', 'Tiki Mask', 'head', 10, { desc: '+1 minion slot' }], ['tiki_shirt', 'Tiki Shirt', 'body', 14, { desc: '+1 minion slot' }], ['tiki_pants', 'Tiki Pants', 'legs', 12, { desc: '+1 minion slot' }]], desc: '+30% whip range, +35% whip speed, +30% summon damage', bonus: (p, pm) => { pm.whipRange = (pm.whipRange || 1) * 1.3; pm.whipSpeed = (pm.whipSpeed || 1) * 1.35; pm.summonDmg = (pm.summonDmg || 1) * 1.3; } });
for (const id of ['tiki_mask', 'tiki_shirt', 'tiki_pants']) ARMOR_PIECE_MODS[id] = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; };
if (SHOPS['Witch Doctor']) SHOPS['Witch Doctor'].push({ id: 'tiki_mask', price: 500000, cond: (g) => ModLib.beaten(g, 'plantera') }, { id: 'tiki_shirt', price: 750000, cond: (g) => ModLib.beaten(g, 'plantera') }, { id: 'tiki_pants', price: 500000, cond: (g) => ModLib.beaten(g, 'plantera') });
defModArmorSet('shinobi', 'Shinobi Infiltrator', { colors: ['#e0e0ff', '#404060', '#202030'], rarity: 8, bar: 'defender_medal', cost: [50, 50, 50], value: 250000, station: 'mythril_anvil', pieces: [['shinobi_infiltrators_helmet', "Shinobi Infiltrator's Helmet", 'head', 24, { desc: '+20% summon damage, +20% movement speed' }], ['shinobi_infiltrators_torso', "Shinobi Infiltrator's Torso", 'body', 34, { desc: '+2 minion slots' }], ['shinobi_infiltrators_pants', "Shinobi Infiltrator's Pants", 'legs', 24, { desc: '+1 minion slot, +20% movement speed' }]], desc: '+45% whip range, +45% whip speed, +2 sentry slots', bonus: (p, pm) => { pm.whipRange = (pm.whipRange || 1) * 1.45; pm.whipSpeed = (pm.whipSpeed || 1) * 1.45; pm.sentrySlots = (pm.sentrySlots || 0) + 2; } });
ARMOR_PIECE_MODS.shinobi_infiltrators_helmet = (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * 1.2; pm.move *= 1.2; }; ARMOR_PIECE_MODS.shinobi_infiltrators_torso = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 2; }; ARMOR_PIECE_MODS.shinobi_infiltrators_pants = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; pm.move *= 1.2; };
if (ARMOR_SETS.stardust) { const base = ARMOR_SETS.stardust.bonus; ARMOR_SETS.stardust.bonus = (p, pm, g) => { if (base) base(p, pm, g); pm.whipRange = (pm.whipRange || 1) * 1.2; pm.whipSpeed = (pm.whipSpeed || 1) * 1.5; }; ARMOR_SETS.stardust.desc = (ARMOR_SETS.stardust.desc || '') + '; +20% whip range, +50% whip speed'; for (const id of ['stardust_helmet', 'stardust_breastplate', 'stardust_leggings']) if (ITEMS[id]) ITEMS[id].tooltip += '; +20% whip range, +50% whip speed'; }

// === Whip Accessories =============================================================================
ModList.current = 'whip_accessories';
for (const [id, name, tip, props, recipe, station] of [
  ['wooden_bracers', 'Wooden Bracers', '+10% whip range', { whipRange: 0.1 }, [['wood', 35]], 'workbench'],
  ['fortified_knuckles', 'Fortified Knuckles', '+12% whip range, +5% whip speed, +2 defense', { whipRange: 0.12, whipSpeed: 0.05, defense: 2 }, [['wooden_bracers', 1], ['stone', 50]], 'workbench'],
  ['leather_gloves', 'Leather Gloves', '+15% whip range, +10% whip speed', { whipRange: 0.15, whipSpeed: 0.1 }, [['silk', 12], ['gold_bar', 5]], 'anvil'],
  ['stellar_gloves', 'Stellar Gloves', '+20% whip range, +15% whip speed, whip hits drop stars', { whipRange: 0.2, whipSpeed: 0.15, gloveStars: true }, [['leather_gloves', 1], ['fallen_star', 20]], 'anvil'],
  ['obsidian_grippers', 'Obsidian Grippers', '+20% whip range, +15% whip speed, whip hits set enemies on fire', { whipRange: 0.2, whipSpeed: 0.15, whipFire: true }, [['leather_gloves', 1], ['obsidian', 15], ['hellstone_bar', 5]], 'anvil'],
  ['gleaming_gauntlets', 'Gleaming Gauntlets', '+25% whip range, +20% whip speed, +10% summon damage', { whipRange: 0.25, whipSpeed: 0.2, summonDmg: 10 }, [['leather_gloves', 1], ['gold_bar', 50], ['ruby', 5]], 'mythril_anvil'],
  ['sanctified_gauntlets', 'Sanctified Gauntlets', '+30% whip range, +25% whip speed, tagged enemies take holy damage', { whipRange: 0.3, whipSpeed: 0.25, whipTag: 6 }, [['leather_gloves', 1], ['soul_of_sight', 10], ['hallowed_bar', 8]], 'mythril_anvil'],
  ['turtle_battlegrips', 'Turtle Battlegrips', '+30% whip range, +25% whip speed, +8 defense, enemies you whip take thorns damage', { whipRange: 0.3, whipSpeed: 0.25, defense: 8, thorns: 15 }, [['leather_gloves', 1], ['chlorophyte_bar', 15], ['beetle_husk', 2]], 'mythril_anvil'],
  ['ruined_knuckleguards', 'Ruined Knuckleguards', '+30% whip range, +30% whip speed. Dropped by post-Plantera dungeon creatures', { whipRange: 0.3, whipSpeed: 0.3 }, null, null],
  ['ghostly_grip', 'Ghostly Grip', '+35% whip range, +35% whip speed, whip hits possess weak enemies to fight for you for a while', { whipRange: 0.35, whipSpeed: 0.35, possess: true }, [['ruined_knuckleguards', 1], ['bone', 75], ['ectoplasm', 35]], 'mythril_anvil'],
]) ACC(id, name, Object.assign({ rarity: 3, value: 40000, tooltip: tip + ' (whip range / speed do not stack between gloves)', recipe: recipe || undefined, station }, props), genericIcon('#8a6038', '#e0c080', 'box'));
if (ENEMY_DEFS.angry_bones) ENEMY_DEFS.angry_bones.drops.push({ id: 'ruined_knuckleguards', chance: 0.02 });
ModLib.on('whipHit', (g, e, it, dmg) => { const p = g.player, acc = ModLib.accs(p); if (acc.some(a => a.gloveStars) && Math.random() < 0.3) modShot(g, e.cx + rand(-40, 40), e.y - 300, 0, 10, { damage: Math.round(dmg * 0.5), color: '#ffe080', life: 60 }); if (acc.some(a => a.possess) && !e.isBoss && e.maxHp < 400 && !e.possessed && Math.random() < 0.25) { e.possessed = 600; g.addDamageText(e.cx, e.y - 10, 'Possessed!', '#a0ffff'); } });
ModLib.on('tick', (g) => { for (const e of g.enemies) if (e.possessed > 0) { e.possessed--; const t = ModLib.nearestEnemy(g, e.cx, e.cy, 12 * TILE); if (t && t !== e && !t.possessed && g.world.time % 30 === 0) t.hit(Math.round(e.damage * 0.8), e.cx, 2, g); if (g.world.time % 8 === 0) g.particles.push(new Particle(e.cx + rand(-8, 8), e.y + rand(0, e.h), 0, -1, '#a0ffff', 15, 2)); } });
ModLib.patch(() => { const base = Enemy.prototype.touchPlayer; Enemy.prototype.touchPlayer = function (player, game) { if (this.possessed > 0) return; return base.call(this, player, game); }; });

// === Evil Biome Summoner Extension =================================================================
ModList.current = 'evil_summoner';
SUMMON('mother_of_creepers', 'Mother of Creepers', 20, 4, 60000, { color: '#c03040', shape: 'orb', variant: (g, L) => L.some(m => m.def.id === 'mother_of_creepers' && m.def.brain) ? { creeper: true, shape: 'orb', speed: 9, damage: 20 } : { brain: true, damage: 12, custom: (m, w, game) => { const p = m.owner; m.x = lerp(m.x, p.cx - m.w / 2, 0.08); m.y = lerp(m.y, p.y - 70 - m.h / 2, 0.08); const near = game.enemies.some(e => !e.dead && dist(e.cx, e.cy, p.cx, p.cy) < 5 * TILE); m.owner.brainGuard = near; if (m.t % 3600 === 1800) { for (const e of game.enemies) if (!e.dead && Math.abs(e.cx - p.cx) < 40 * TILE && Math.abs(e.cy - p.cy) < 25 * TILE) { e.hit(Math.round(m.def.damage * 3 * p.pm.dmg * (p.pm.summonDmg || 1)), p.cx, 2, game); e.applyDebuff('Slow', 180, 1); } FX.flash('#c03040', 10, 0.3); game.message('The Mother of Creepers screams!', '#c03040'); } if (m.hitCd === 0) for (const e of game.enemies) if (!e.dead && dist(e.cx, e.cy, m.cx, m.cy) < 3 * TILE) { m.dealMelee(game, e, 0.5); break; } }, drawFn: (m, ctx, cx, cy) => { const x = snap(m.cx - cx), y = snap(m.cy - cy); ctx.fillStyle = '#c03040'; ctx.beginPath(); ctx.ellipse(x, y, 14, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e06070'; ctx.fillRect(x - 10, y - 4, 6, 3); ctx.fillRect(x + 2, y - 6, 6, 3); ctx.fillRect(x - 3, y + 2, 7, 3); } } }, { recipe: [['tissue_sample', 12], ['vertebra', 8], ['bloody_spine', 0]].filter(r => r[1]), station: 'anvil', desc: 'First summon: a miniature Brain of Cthulhu (screen-wide scream every minute, guards you). Later summons: pairs of Creepers' });
ModLib.onPlayerMods((p, pm) => { if (p.brainGuard) pm.defAdd += 4; });
SUMMON('rotten_eye', 'Rotten Eye', 26, 4, 60000, SERPENT('#7050a0', { head: '#5a3a8a', thick: 14, segs: 8, grow: 4 }), { recipe: [['rotten_chunk', 12], ['shadow_scale', 8], ['worm_food', 0]].filter(r => r[1]), station: 'anvil', desc: 'Summons the Eater of Worlds as a Stardust Dragon-type minion; more summons make it longer' });
SUMMON('ocular_staff', 'Ocular Staff', 24, 3, 40000, { color: '#f0f0f0', speed: 9, custom: (m, w, game) => { const p = m.owner; const phase = Math.floor(m.t / 900) % 2; const t = ModLib.nearestEnemy(game, p.cx, p.cy, 30 * TILE); m.target = t; if (phase === 0 || !t) { const tx = t ? t.cx : p.cx - p.dir * 40, ty = t ? t.cy - 90 : p.y - 50; m.vx = lerp(m.vx, clamp((tx - m.cx) / 12, -8, 8), 0.1); m.vy = lerp(m.vy, clamp((ty - m.cy) / 12, -8, 8), 0.1); if (t && --m.shot <= 0) { m.shot = 35; const b = m.fire(game, t, { color: '#c03030', homing: 0.3, life: 100, kind: 'seal' }); b.onHit = (g, bb, e) => { if (Math.random() < 0.3) e.applyDebuff('Slow', 90, 1); }; } } else { if (m.t % 40 === 0) { const dx = t.cx - m.cx, dy = t.cy - m.cy, d = Math.hypot(dx, dy) || 1; m.vx = dx / d * 14; m.vy = dy / d * 14; } m.vx *= 0.97; m.vy *= 0.97; if (m.hitCd === 0 && m.x < t.x + t.w && m.x + m.w > t.x && m.y < t.y + t.h && m.y + m.h > t.y) m.dealMelee(game, t, 1.6); } m.x += m.vx; m.y += m.vy; if (dist(m.cx, m.cy, p.cx, p.cy) > 60 * TILE) { m.x = p.cx; m.y = p.y; } }, drawFn: (m, ctx, cx, cy) => { const x = snap(m.cx - cx), y = snap(m.cy - cy); ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.ellipse(x, y, 13, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = Math.floor(m.t / 900) % 2 ? '#c03030' : '#4060c0'; ctx.beginPath(); ctx.arc(x + (m.vx > 0 ? 4 : -4), y, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c03030'; for (let k = 0; k < 3; k++) ctx.fillRect(x - 14 - k * 5, y - 2 + Math.sin(m.t * 0.2 + k) * 4, 5, 3); } }, { desc: 'A miniature Eye of Cthulhu: 15 s hovering and firing slowing eyes, then 15 s of charges. Dropped by the Eye of Cthulhu' });
ModLib.onEnemyKilled((g, e) => { if (e.isBoss && /Eye of Cthulhu/.test(e.name || '') && Math.random() < 0.33) g.dropItem(e.cx, e.cy, 'ocular_staff', 1); });
SUMMON('metallic_eye', 'Metallic Eye', 56, 6, 120000, SERPENT('#404048', { head: '#606068', thick: 16, segs: 10, grow: 4, armored: true, probes: true, eye: '#ff2020' }), { recipe: [['mother_of_creepers', 1], ['soul_of_might', 15], ['hallowed_bar', 5]], station: 'mythril_anvil', desc: 'The Destroyer as a serpent minion; its segments carry probes that fire lasers' });
RECIPES.push({ result: 'metallic_eye', count: 1, station: 'mythril_anvil', ing: [['rotten_eye', 1], ['soul_of_might', 15], ['hallowed_bar', 5]] });
WHIP('bloody_scythe', 'Bloody Scythe', 30, 28, 3, 3, 30000, { reach: 7, color: '#c02030', tagDamage: 6, onHitBuff: 'Poisoned', whipEffect: (g, e, p) => { p.addBuff('Regeneration', 240); }, recipe: [['tissue_sample', 10], ['vertebra', 6]], station: 'anvil', desc: 'Whip hits grant Regeneration and make enemies bleed' });
WHIP('rotten_whip', 'Rotten Whip', 28, 28, 3, 3, 30000, { reach: 7, color: '#7050a0', tagDamage: 6, whipEffect: (g, e, p, dmg) => { if (Math.random() < 0.5) modShot(g, p.cx, p.y, (e.cx - p.cx) / 25, (e.cy - p.cy) / 25 - 2, { damage: Math.round(dmg * 0.6), color: '#7050a0', life: 90, homing: 0.5, gravity: 0.05 }); }, recipe: [['rotten_chunk', 12], ['shadow_scale', 6]], station: 'anvil', desc: '50% chance to launch a homing rotten chunk on hit' });
SUMMON('hungry_staff', 'Staff of the Hungry', 34, 4, 50000, { color: '#d04050', shape: 'imp', speed: 9, rate: 15 }, { recipe: [['tissue_sample', 6], ['rotten_chunk', 6], ['soul_of_night', 5], ['demonite_bar', 4]], station: 'mythril_anvil', desc: 'A Hungry torn from the Wall of Flesh' });
ACC('resentful_eye', 'Resentful Eye', { rarity: 3, value: 40000, tooltip: 'Worn with full Crimson armor: -5 defense, +2 minion slots, +15% summon damage, attacks may inflict Ichor', evilConvert: 'crimtane', recipe: [['tissue_sample', 8], ['lens', 3], ['crimtane_bar', 4]], station: 'anvil' }, genericIcon('#c02030', '#fff', 'orb'));
ACC('disgraceful_thorns', 'Disgraceful Thorns', { rarity: 3, value: 40000, tooltip: 'Worn with full Shadow armor: -5 defense, +2 minion slots, +12% summon damage, attacks may inflict Cursed Inferno', evilConvert: 'demonite', recipe: [['shadow_scale', 8], ['vine', 3], ['demonite_bar', 4]], station: 'anvil' }, genericIcon('#6a3ad0', '#c0a0ff', 'orb'));
ACC('molten_necklace', 'Molten Necklace', { rarity: 3, value: 40000, tooltip: 'Worn with full Molten armor: -4 defense, +2 minion slots, +14% summon damage, minions set enemies on fire', evilConvert: 'molten', recipe: [['hellstone_bar', 8], ['obsidian', 5]], station: 'anvil' }, genericIcon('#ff8020', '#ffe060', 'ring'));
ModLib.onPlayerMods((p, pm, g) => { const set = activeArmorSet(p); for (const it of ModLib.accs(p)) if (it.evilConvert && it.evilConvert === set) { pm.defAdd -= it.evilConvert === 'molten' ? 4 : 5; pm.minionSlots = (pm.minionSlots || 0) + 2; pm.summonDmg = (pm.summonDmg || 1) * (it.evilConvert === 'crimtane' ? 1.15 : it.evilConvert === 'demonite' ? 1.12 : 1.14); pm.evilDebuff = it.evilConvert; } });
ModLib.on('enemyHit', (g, e) => { const d = g.player.pm.evilDebuff; if (d && Math.random() < 0.2) e.applyDebuff(d === 'crimtane' ? 'Poisoned' : 'Frostburn', 180, 1); });

// === Ore Helmets for Summoner ======================================================================
ModList.current = 'ore_helmets_summoner';
for (const [id, name, def, slots, dmg] of [['cobalt', 'Cobalt', 6, 1, 8], ['palladium', 'Palladium', 7, 1, 10], ['mythril', 'Mythril', 8, 2, 10], ['orichalcum', 'Orichalcum', 9, 2, 12], ['adamantite', 'Adamantite', 11, 2, 14], ['titanium', 'Titanium', 12, 3, 14]]) {
  const hid = `${id}_hood`; if (!ITEMS[`${id}_bar`]) continue;
  defArmor(hid, `${name} Hood`, 'head', id, def, 4); ITEMS[hid].set = id; ITEMS[hid].tooltip = `${def} defense, +${slots} minion slot${slots > 1 ? 's' : ''}, +${dmg}% summon damage. Completes the ${name} set`; ITEM_VALUES[hid] = 40000; ITEMS[hid].value = 40000;
  RECIPES.push({ result: hid, count: 1, station: 'anvil', ing: [[`${id}_bar`, 10]] });
  ARMOR_PIECE_MODS[hid] = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + slots; pm.summonDmg = (pm.summonDmg || 1) * (1 + dmg / 100); };
}

// === Ophidiomancy (Summoner Class Version) ==========================================================
ModList.current = 'ophidiomancy';
defModMaterial('snake_scale', 'Snake Scale', { color: '#60a040', hi: '#c0ff80', rarity: 2, value: 400, tooltip: 'Shed by desert and jungle snakes' });
defBEnemy('rattlesnake', { name: 'Rattlesnake', cls: Beast, hp: 55, damage: 20, defense: 8, speed: 2.4, charge: 6, chargeEvery: 90, w: 30, h: 12, blood: '#c8a860', drops: [{ id: 'snake_scale', chance: 0.6, min: 1, max: 2 }, { id: 'rattlesnake_staff', chance: 0.03 }], draw: (c, e) => { c.strokeStyle = '#c8a860'; c.lineWidth = 6; c.beginPath(); c.moveTo(-14, -4); for (let k = 0; k < 5; k++) c.lineTo(-14 + k * 7, -4 + Math.sin(e.t * 0.3 + k) * 3); c.stroke(); c.fillStyle = '#a08040'; c.beginPath(); c.arc(14, -6, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffe060'; c.fillRect(15, -8, 2, 2); } });
defBEnemy('jungle_python', { name: 'Jungle Python', cls: Beast, hp: 120, damage: 28, defense: 12, speed: 1.8, w: 44, h: 14, blood: '#3a7a30', drops: [{ id: 'snake_scale', chance: 0.7, min: 1, max: 3 }, { id: 'python_staff', chance: 0.03 }], draw: (c, e) => { c.strokeStyle = '#3a7a30'; c.lineWidth = 8; c.beginPath(); c.moveTo(-20, -5); for (let k = 0; k < 6; k++) c.lineTo(-20 + k * 8, -5 + Math.sin(e.t * 0.2 + k) * 4); c.stroke(); c.fillStyle = '#2a5a20'; c.beginPath(); c.arc(20, -7, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffe060'; c.fillRect(22, -9, 2, 2); } });
ModLib.onSpawnPick((g, type, ctx) => { if (!ModList.on('ophidiomancy') || ctx.night) return type; const b = g.world.biome[clamp(g.player.tileX, 0, g.world.w - 1)]; if (b === BIOME.DESERT && !ctx.underground && Math.random() < 0.12) return 'rattlesnake'; if (b === BIOME.JUNGLE && Math.random() < 0.1) return 'jungle_python'; return type; });
SUMMON('rattlesnake_staff', 'Rattlesnake Staff', 11, 2, 12000, SERPENT('#c8a860', { head: '#a08040', thick: 8, segs: 4, grow: 2, speed: 9 }), { recipe: [['snake_scale', 8], ['antlion_mandible', 2]], station: 'anvil', desc: 'A rattlesnake that grows with every summon' });
SUMMON('cobra_staff', 'Cobra Staff', 18, 3, 25000, { color: '#404040', shape: 'orb', ranged: true, rate: 30, speed: 8, projKind: 'seal' }, { recipe: [['snake_scale', 12], ['stinger', 4], ['gold_bar', 5]], station: 'anvil', desc: 'Spits venom that poisons' });
ITEMS.cobra_staff.minion.onHitBuff = 'Poisoned';
ModLib.on('projHit', (g, b, e) => { if (b.minionShot && b.minionShot.def.onHitBuff) e.applyDebuff(b.minionShot.def.onHitBuff, 180, 1); });
SUMMON('python_staff', 'Python Staff', 28, 4, 40000, SERPENT('#3a7a30', { head: '#2a5a20', thick: 12, segs: 6, grow: 3, speed: 8 }), { recipe: [['snake_scale', 20], ['jungle_spores', 8], ['vine', 3]], station: 'anvil', desc: 'A constrictor: long, slow and crushing' });
SUMMON('naga_staff', 'Naga Staff', 52, 6, 110000, SERPENT('#40a0c0', { head: '#2070a0', thick: 14, segs: 8, grow: 4, speed: 11, eye: '#ffe060' }), { recipe: [['snake_scale', 25], ['shark_fin', 3], ['soul_of_sight', 10], ['hallowed_bar', 6]], station: 'mythril_anvil', desc: 'A sea serpent that darts through the water and air' });
SUMMON('basilisk_staff', 'Basilisk Staff', 78, 8, 200000, SERPENT('#8a6a20', { head: '#c0a040', thick: 18, segs: 10, grow: 4, speed: 12, armored: true, eye: '#40ff40' }), { recipe: [['snake_scale', 30], ['chlorophyte_bar', 10], ['beetle_husk', 6], ['ectoplasm', 10]], station: 'mythril_anvil', desc: 'Its gaze petrifies: hits slow enemies' });
ITEMS.basilisk_staff.minion.slowHit = true;
ModLib.on('minionHit', (g, e, m) => { if (m.def.slowHit) e.applyDebuff('Slow', 90, 1); });
defModArmorSet('snake_charmer', 'Snake Charmer', { colors: ['#f0e0c0', '#c08040', '#604020'], rarity: 4, bar: 'snake_scale', cost: [12, 20, 15], extra: [['silk', 4]], value: 60000, station: 'anvil', pieces: [['snake_charmers_turban', "Snake Charmer's Turban", 'head', 6, { desc: '+2 minion slots' }], ['snake_charmers_robes', "Snake Charmer's Robes", 'body', 10, { desc: '+15% summon damage' }], ['snake_charmers_sandals', "Snake Charmer's Sandals", 'legs', 7, { desc: '+10% movement speed, +10% whip speed' }]], desc: 'Serpent minions gain 2 extra segments, whip hits have a 25% chance to poison, +20% whip range', bonus: (p, pm) => { pm.whipRange = (pm.whipRange || 1) * 1.2; pm.serpentBonus = 2; pm.venomWhip = true; } });
ARMOR_PIECE_MODS.snake_charmers_turban = (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 2; }; ARMOR_PIECE_MODS.snake_charmers_robes = (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * 1.15; }; ARMOR_PIECE_MODS.snake_charmers_sandals = (p, pm) => { pm.move *= 1.1; pm.whipSpeed = (pm.whipSpeed || 1) * 1.1; };
ModLib.on('whipHit', (g, e) => { if (g.player.pm.venomWhip && Math.random() < 0.25) e.applyDebuff('Poisoned', 240, 1); });
ACC('serpent_fang', 'Serpent Fang', { rarity: 3, value: 30000, tooltip: 'Your minions and whips poison enemies; +5% summon damage', summonDmg: 5, serpentFang: true, recipe: [['snake_scale', 10], ['stinger', 3]], station: 'anvil' }, genericIcon('#e0e0d0', '#60a040', 'box'));
ModLib.on('minionHit', (g, e) => { if (ModLib.hasAcc(g.player, 'serpent_fang') && Math.random() < 0.3) e.applyDebuff('Poisoned', 120, 1); });
ACC('snake_skin_cloak', 'Snake Skin Cloak', { rarity: 3, value: 30000, tooltip: '+4 defense, +8% movement speed, immunity to poison', defense: 4, snakeSkin: true, recipe: [['snake_scale', 15], ['silk', 5]], station: 'anvil' }, genericIcon('#60a040', '#c0ff80', 'wings'));
ModLib.onPlayerMods((p, pm) => { if (ModLib.hasAcc(p, 'snake_skin_cloak')) { pm.move *= 1.08; if (p.buffs.Poisoned) p.buffs.Poisoned = 0; } });
ACC('charmers_flute', "Charmer's Flute", { rarity: 4, value: 40000, tooltip: '+1 minion slot, serpent minions gain 2 segments', minionSlots: 1, serpentBonus: 2, recipe: [['snake_scale', 10], ['bamboo_leaf', 0], ['wood', 20], ['gold_bar', 3]].filter(r => r[1]), station: 'anvil' }, genericIcon('#c08040', '#fff', 'staff'));
WHIP('serpent_whip', 'Serpent Whip', 24, 26, 3, 3, 25000, { reach: 8, color: '#60a040', tagDamage: 5, onHitBuff: 'Poisoned', recipe: [['snake_scale', 15], ['vine', 2]], station: 'anvil' });
ModLib.on('tick', (g) => { const p = g.player; const bonus = (p.pm.serpentBonus || 0) + ModLib.accs(p).reduce((a, it) => a + (it.serpentBonus || 0), 0); for (const m of Minions.list(g)) if (m.def.serpent) m.extraSegs = bonus; });

// === Goose's Vanilla Expansion =====================================================================
ModList.current = 'goose_vanilla';
const MACE = (id, name, dmg, use, kb, rarity, value, recipe, st, extra = {}) => defModWeapon(id, name, 'sword', dmg, use, kb, rarity, value, Object.assign({ mat: 'iron', recipe, station: st, desc: 'A heavy mace: slow, strong knockback' }, extra));
MACE('gel_mace', 'Gel Mace', 12, 32, 7, 0, 1500, [['wood', 8], ['gel', 20]], 'workbench');
MACE('spiked_mace', 'Spiked Mace', 17, 30, 8, 1, 6000, [['iron_bar', 10], ['spiky_ball', 3]], 'anvil');
MACE('bone_mace', 'Bone Mace', 24, 30, 8, 2, 15000, [['bone', 25]], 'anvil');
MACE('meteor_mace', 'Meteor Mace', 30, 28, 9, 2, 25000, [['meteorite_bar', 12]], 'anvil', { swingProj: { color: '#ff8020', speed: 6 } });
MACE('hallowed_mace', 'Hallowed Mace', 62, 28, 10, 5, 100000, [['hallowed_bar', 14]], 'mythril_anvil', { swingProj: { color: '#ffe080', speed: 8 } });
const BOOM = (id, name, dmg, use, rarity, value, o, recipe, st) => defModWeapon(id, name, 'boomerang', dmg, use, 4, rarity, value, Object.assign({ recipe, station: st }, o));
BOOM('wooden_boomerang', 'Wooden Boomerang', 8, 22, 0, 500, { speed: 9, color: '#a8794b' }, [['wood', 12]], 'workbench');
BOOM('cactus_boomerang', 'Cactus Boomerang', 12, 20, 0, 1500, { speed: 10, color: '#50a040' }, [['cactus', 15]], 'workbench');
BOOM('enchanted_boomerang', 'Enchanted Boomerang', 15, 18, 1, 5000, { speed: 11, color: '#c0e0ff', count: 2 }, [['wooden_boomerang', 1], ['fallen_star', 3]], 'anvil');
BOOM('ice_boomerang', 'Ice Boomerang', 16, 18, 1, 6000, { speed: 12, color: '#a0e0ff', onHitBuff: 'Slow' }, [['ice', 20], ['silver_bar', 4]], 'anvil');
BOOM('bee_boomerang', 'Bee Boomerang', 22, 16, 3, 20000, { speed: 12, color: '#e0c040', count: 2 }, [['bee_wax', 10]], 'anvil');
BOOM('thorn_chakram', 'Thorn Chakram', 25, 16, 3, 25000, { speed: 13, color: '#60c040', onHitBuff: 'Poisoned' }, [['jungle_spores', 8], ['stinger', 6]], 'anvil');
BOOM('bone_chakram', 'Bone Chakram', 34, 14, 3, 30000, { speed: 14, color: '#e8e8e0', count: 2 }, [['bone', 30]], 'anvil');
SUMMON('slime_staff', 'Slime Staff', 8, 1, 5000, { color: '#4070e0', shape: 'orb', speed: 7, rate: 25 }, { desc: 'A rare drop from slimes' });
for (const id of ['green_slime', 'blue_slime', 'purple_slime', 'red_slime']) ENEMY_DEFS[id].drops.push({ id: 'slime_staff', chance: 0.005 });
SUMMON('finch_staff', 'Finch Staff', 7, 0, 3000, { color: '#e0a040', shape: 'bird', speed: 9, rate: 22 }, { recipe: [['wood', 16], ['acorn', 2]], station: 'workbench' });
SUMMON('vampire_frog_staff', 'Vampire Frog Staff', 11, 2, 10000, { color: '#3a7a30', shape: 'imp', speed: 8, rate: 18 }, { desc: 'Dropped by zombies during a Blood Moon' });
ENEMY_DEFS.zombie.drops.push({ id: 'vampire_frog_staff', chance: 0.02 });
SUMMON('abigails_flower', "Abigail's Flower", 10, 1, 8000, { color: '#ff80c0', shape: 'orb', speed: 8, rate: 15 }, { desc: 'Found near graves; its ghost fights beside you' });
if (ENEMY_DEFS.ghost) ENEMY_DEFS.ghost.drops.push({ id: 'abigails_flower', chance: 0.1 });
defModWeapon('pilum', 'Pilum', 'boomerang', 16, 26, 5, 1, 8000, { color: '#c0c0c8', speed: 12, count: 2, recipe: [['iron_bar', 6], ['wood', 4]], station: 'anvil', desc: 'A thrown javelin (up to two in the air, they return to your hand)' });
defModWeapon('gilded_pilum', 'Gilded Pilum', 'boomerang', 24, 24, 5, 2, 15000, { color: '#ffe060', speed: 13, count: 2, recipe: [['gold_bar', 8], ['wood', 4]], station: 'anvil' });

// === Starting Class Weapons =========================================================================
ModList.current = 'starting_class_weapons';
defSword('wooden_dagger', 'Wooden Dagger', 'wood', 8, 14, 'short', 0); ITEMS.wooden_dagger.tooltip = 'A quick starter dagger for warriors'; ITEM_VALUES.wooden_dagger = 100; ITEMS.wooden_dagger.value = 100; RECIPES.push({ result: 'wooden_dagger', count: 1, station: null, ing: [['wood', 10]] });
defModWeapon('wooden_wand', 'Wooden Wand', 'magic', 7, 22, 2, 0, 100, { manaCost: 4, color: '#a8794b', speed: 9, recipe: [['wood', 10]], station: null, desc: 'A starter wand for mages' }); RECIPES[RECIPES.length - 1].station = null;
WHIP('grass_whip', 'Grass Whip', 6, 30, 1, 0, 100, { reach: 5, color: '#60c040', tagDamage: 2, recipe: [['wood', 10]], station: null, desc: 'A starter whip for summoners' }); RECIPES[RECIPES.length - 1].station = null;
defModWeapon('wooden_throwing_knife', 'Wooden Throwing Knife', 'boomerang', 7, 14, 2, 0, 100, { speed: 12, color: '#a8794b', count: 3, recipe: [['wood', 10]], station: null, desc: 'Starter knives for rogues' }); RECIPES[RECIPES.length - 1].station = null;
RECIPES.push({ result: 'wooden_bow', count: 1, station: null, ing: [['wood', 10]] });
RECIPES.push({ result: 'wooden_arrow', count: 25, station: null, ing: [['wood', 1], ['stone', 1]] });

// === Wood Armor Bonuses ==============================================================================
ModList.current = 'wood_armor_bonuses';
const WOODS = { ebonwood: ['Ebonwood', '#5a3a7a', BIOME.CORRUPTION], shadewood: ['Shadewood', '#7a2a3a', BIOME.CRIMSON], boreal_wood: ['Boreal Wood', '#a09080', BIOME.SNOW], rich_mahogany: ['Rich Mahogany', '#b04040', BIOME.JUNGLE], palm_wood: ['Palm Wood', '#d0a060', BIOME.OCEAN], pearlwood: ['Pearlwood', '#e0c0e0', BIOME.HALLOW], ash_wood: ['Ash Wood', '#606068', BIOME.ASH] };
for (const id in WOODS) { const [name, col] = WOODS[id]; defItem(id, { name, material: true, rarity: 0, tooltip: 'Wood from its biome\'s trees', drawIcon: (x) => { x.fillStyle = col; x.fillRect(3, 2, 10, 12); x.fillStyle = shade(col, 0.7); x.fillRect(3, 5, 10, 1); x.fillRect(3, 9, 10, 1); } }); ITEM_VALUES[id] = 20; ITEMS[id].value = 20; RECIPES.push({ result: 'planks', count: 4, station: 'workbench', ing: [[id, 1]] }); }
ModLib.patch(() => { const base = Game.prototype.breakTile; Game.prototype.breakTile = function (tx, ty) { const w = this.world, id = w.get(tx, ty); const tree = id === T.TREE || id === T.TREETOP; const n0 = this.drops.length; base.call(this, tx, ty); if (!tree || !ModList.on('wood_armor_bonuses')) return; const b = w.biome[clamp(tx, 0, w.w - 1)]; const wood = Object.keys(WOODS).find(k => WOODS[k][2] === b) || (ty > (w.h - 70) ? 'ash_wood' : null); if (!wood) return; for (let i = n0; i < this.drops.length; i++) if (this.drops[i].id === 'wood') this.drops[i].id = wood; }; });
const WOOD_SETS = [['wood', 'Wood', 'wood', [1, 2, 1], '+10% placement speed per piece, +1 tile placement range', (p, pm) => { pm.place = (pm.place || 0) + 1; }], ['ebonwood', 'Ebonwood', 'ebonwood', [1, 2, 1], '+10% melee attack speed', (p, pm) => { pm.useTime *= 0.9; }], ['boreal_wood', 'Boreal Wood', 'boreal_wood', [1, 2, 1], '+4% ranged critical chance', (p, pm) => { pm.crit += 4; }], ['rich_mahogany', 'Rich Mahogany', 'rich_mahogany', [1, 2, 1], '-10% mana cost', (p, pm) => { pm.manaCostPct = (pm.manaCostPct || 0) + 10; }], ['palm_wood', 'Palm Wood', 'palm_wood', [1, 2, 1], '+1 minion slot', (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; }], ['shadewood', 'Shadewood', 'shadewood', [1, 2, 1], '+10% melee attack speed (or +10% throwing velocity)', (p, pm) => { pm.useTime *= 0.9; pm.projSpeed *= 1.1; }], ['pearlwood', 'Pearlwood', 'pearlwood', [2, 3, 2], 'Spelunker sight, +35% mining speed and Shine light (an upgraded Mining set)', (p, pm) => { pm.mineSpeed = (pm.mineSpeed || 1) * 1.35; p.addBuff('Spelunker', 2); p.addBuff('Shine', 2); }], ['ash_wood', 'Ash Wood', 'ash_wood', [2, 3, 2], 'Immunity to On Fire!, +3 defense', (p, pm) => { pm.defAdd += 3; if (p.buffs['On Fire!']) p.buffs['On Fire!'] = 0; }]];
for (const [set, name, mat, def, desc, bonus] of WOOD_SETS) {
  MATERIALS[set] = MATERIALS[set] || { M: shade(WOODS[set] ? WOODS[set][1] : '#a8794b', 1.3), m: WOODS[set] ? WOODS[set][1] : '#a8794b', d: shade(WOODS[set] ? WOODS[set][1] : '#a8794b', 0.6) };
  defModArmorSet(set, name, { mat: set, rarity: 0, bar: mat, cost: [20, 30, 25], value: 300, station: 'workbench', pieces: [[`${set}_helmet`, `${name} Helmet`, 'head', def[0], set === 'wood' ? { desc: '+10% placement speed' } : set === 'pearlwood' ? { desc: '+10% mining speed' } : set === 'boreal_wood' || set === 'ebonwood' || set === 'shadewood' || set === 'rich_mahogany' || set === 'palm_wood' ? { desc: '+4% class damage' } : null], [`${set}_breastplate`, `${name} Breastplate`, 'body', def[1], set === 'pearlwood' ? { desc: '+15% mining speed' } : null], [`${set}_greaves`, `${name} Greaves`, 'legs', def[2], null]], desc, bonus });
  if (set !== 'wood' && set !== 'pearlwood' && set !== 'ash_wood') for (const piece of ['helmet', 'breastplate', 'greaves']) ARMOR_PIECE_MODS[`${set}_${piece}`] = (p, pm) => { if (set === 'ebonwood' || set === 'shadewood') pm.dmg *= 1.04; else if (set === 'boreal_wood') pm.rangedDmg *= 1.04; else if (set === 'rich_mahogany') pm.magicDmg = (pm.magicDmg || 1) * 1.04; else pm.summonDmg = (pm.summonDmg || 1) * 1.04; };
  if (set === 'pearlwood') { ARMOR_PIECE_MODS.pearlwood_helmet = (p, pm) => { pm.mineSpeed = (pm.mineSpeed || 1) * 1.1; }; ARMOR_PIECE_MODS.pearlwood_breastplate = (p, pm) => { pm.mineSpeed = (pm.mineSpeed || 1) * 1.15; }; ARMOR_PIECE_MODS.pearlwood_greaves = (p, pm) => { pm.mineSpeed = (pm.mineSpeed || 1) * 1.1; }; }
}
BUFF_MODS.Shine = () => {};

ModLib.on('tick', (g) => { const p = g.player; if (p.pm && p.pm.manaCostPct && p.acc) p.acc.manaCostPct = (p.acc.manaCostPct || 0) + p.pm.manaCostPct; });
{ const _boom = Weapons.boomerang; Weapons.boomerang = function (g, s, it) { const n = g.projectiles.length; _boom.call(this, g, s, it); if (g.projectiles.length > n && it.onHitBuff) g.projectiles[g.projectiles.length - 1].onHitBuff = it.onHitBuff; }; }
ModList.current = null;
