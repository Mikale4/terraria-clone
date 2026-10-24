// ---------------------------------------------------------------------------
// Mage class + "Throarbin-Style Mage Changes": mana & mana stars, fallen stars,
// mana crystals, magic weapons (Wand of Sparking, six gem staffs, Jeweler's and
// Aristocrat's Staff), gem hoods & robes with set bonuses, accessory slots and
// the mod's accessories (Magic Cloak, Mana Knuckles, Celestial Knuckles, Mana
// Field, Star Band, Magic Glove), mini mana bar over the head, mana sickness.
// ---------------------------------------------------------------------------
'use strict';

// Gems: the GEM tile now comes in six kinds (tile data 0..5)
const GEMS = [
  { id: 'amethyst', name: 'Amethyst', color: '#b060ff', hi: '#e0c0ff', tier: 'copper_bar', dmg: 14, mana: 3, robeMana: 20, robeCost: 5 },
  { id: 'topaz', name: 'Topaz', color: '#ffc040', hi: '#ffe8a0', tier: 'iron_bar', dmg: 15, mana: 4, robeMana: 30, robeCost: 7 },
  { id: 'sapphire', name: 'Sapphire', color: '#4060ff', hi: '#a0c0ff', tier: 'silver_bar', dmg: 17, mana: 5, robeMana: 40, robeCost: 9 },
  { id: 'emerald', name: 'Emerald', color: '#40e060', hi: '#a0ffb0', tier: 'gold_bar', dmg: 19, mana: 6, robeMana: 50, robeCost: 11 },
  { id: 'ruby', name: 'Ruby', color: '#ff3040', hi: '#ffa0a8', tier: 'gold_bar', dmg: 21, mana: 7, robeMana: 60, robeCost: 13 },
  { id: 'diamond', name: 'Diamond', color: '#80f0ff', hi: '#ffffff', tier: 'gold_bar', dmg: 23, mana: 8, robeMana: 80, robeCost: 15 },
];
for (const g of GEMS) {
  if (g.id !== 'diamond') { defItem(g.id, { name: g.name, material: true, rarity: 1, tooltip: 'A sparkling gem' }); ITEM_VALUES[g.id] = 1500; ITEMS[g.id].value = 1500; }
  // staff: 10 tier bars + 8 gems at an anvil (either ore of the tier works here: there is one per tier)
  defItem(`${g.id}_staff`, { name: `${g.name} Staff`, magic: true, manaCost: g.mana, damage: g.dmg, useTime: 28, knockback: 3, max: 1, rarity: 1, bolt: g.color, boltHi: g.hi, gem: g.id, tooltip: `Shoots a ${g.name.toLowerCase()} bolt` });
  ITEM_VALUES[`${g.id}_staff`] = 5000 + GEMS.indexOf(g) * 2000; ITEMS[`${g.id}_staff`].value = ITEM_VALUES[`${g.id}_staff`];
  RECIPES.push({ result: `${g.id}_staff`, count: 1, station: 'anvil', ing: [[g.tier, 10], [g.id, 8]] });
  // hood + robe (gem robes are Terraria's, gem hoods are the mod's)
  defItem(`${g.id}_hood`, { name: `${g.name} Hood`, armor: 'head', defense: 1, max: 1, rarity: 1, gem: g.id, tooltip: `Set bonus with ${g.name} Robe: ${g.name} Staff spells deal 25% more damage and cost 20% less mana` });
  defItem(`${g.id}_robe`, { name: `${g.name} Robe`, armor: 'body', defense: 2, max: 1, rarity: 1, gem: g.id, manaBonus: g.robeMana, manaCostPct: g.robeCost, tooltip: `+${g.robeMana} max mana, ${g.robeCost}% reduced mana usage` });
  ITEM_VALUES[`${g.id}_hood`] = 3000; ITEMS[`${g.id}_hood`].value = 3000; ITEM_VALUES[`${g.id}_robe`] = 6000; ITEMS[`${g.id}_robe`].value = 6000;
  RECIPES.push({ result: `${g.id}_hood`, count: 1, station: 'workbench', ing: [[g.id, 6], ['cobweb', 10]] });
  RECIPES.push({ result: `${g.id}_robe`, count: 1, station: 'workbench', ing: [[g.id, 10], ['cobweb', 20]] });
}
// Wand of Sparking: craftable with 8 wood and 45 torches (Throarbin rebalance)
defItem('wand_of_sparking', { name: 'Wand of Sparking', magic: true, manaCost: 2, damage: 14, useTime: 26, knockback: 1, max: 1, spark: true, tooltip: 'Shoots a short-range spark' });
ITEM_VALUES.wand_of_sparking = 2000; ITEMS.wand_of_sparking.value = 2000;
RECIPES.push({ result: 'wand_of_sparking', count: 1, station: null, ing: [['wood', 8], ['torch', 45]] });
// Multicolor staffs: shoot one bolt per gem
defItem('jewelers_staff', { name: "Jeweler's Staff", magic: true, manaCost: 8, damage: 17, useTime: 30, knockback: 3, max: 1, rarity: 2, multi: ['amethyst', 'topaz', 'sapphire'], tooltip: 'Shoots three gem bolts at once' });
defItem('aristocrats_staff', { name: "Aristocrat's Staff", magic: true, manaCost: 12, damage: 23, useTime: 32, knockback: 4, max: 1, rarity: 3, multi: ['amethyst', 'topaz', 'sapphire', 'emerald', 'ruby', 'diamond'], tooltip: 'Shoots six gem bolts at once' });
ITEM_VALUES.jewelers_staff = 20000; ITEMS.jewelers_staff.value = 20000; ITEM_VALUES.aristocrats_staff = 60000; ITEMS.aristocrats_staff.value = 60000;
RECIPES.push({ result: 'jewelers_staff', count: 1, station: 'anvil', ing: [['amethyst_staff', 1], ['topaz_staff', 1], ['sapphire_staff', 1]] });
RECIPES.push({ result: 'aristocrats_staff', count: 1, station: 'anvil', ing: [['jewelers_staff', 1], ['emerald_staff', 1], ['ruby_staff', 1], ['diamond_staff', 1]] });
// Mana items
defItem('fallen_star', { name: 'Fallen Star', material: true, max: 999, rarity: 1, tooltip: 'Falls from the sky at night. Disappears at dawn if left on the ground' });
defItem('mana_crystal', { name: 'Mana Crystal', consumable: true, max: 99, rarity: 1, tooltip: 'Permanently increases maximum mana by 20' });
defItem('lesser_mana', { name: 'Lesser Mana Potion', consumable: true, max: 30, mana: 50, tooltip: 'Restores 50 mana. Causes Mana Sickness' });
Object.assign(ITEM_VALUES, { fallen_star: 500, mana_crystal: 5000, lesser_mana: 100 });
for (const id of ['fallen_star', 'mana_crystal', 'lesser_mana']) ITEMS[id].value = ITEM_VALUES[id];
RECIPES.push({ result: 'mana_crystal', count: 1, station: null, ing: [['fallen_star', 5]] });
RECIPES.push({ result: 'lesser_mana', count: 2, station: 'workbench', ing: [['bottle', 2], ['glow_mushroom', 1], ['fallen_star', 1]] });

// Accessories --------------------------------------------------------------------
function defAccessory(id, name, o) {
  defItem(id, Object.assign({ name, accessory: true, max: 1, rarity: o.rarity == null ? 1 : o.rarity }, o));
  ITEM_VALUES[id] = o.value || 20000; ITEMS[id].value = ITEM_VALUES[id];
  if (o.recipe) RECIPES.push({ result: id, count: 1, station: o.station === undefined ? 'workbench' : o.station, ing: o.recipe });
}
defAccessory('band_of_starpower', 'Band of Starpower', { manaBonus: 20, tooltip: 'Increases maximum mana by 20', recipe: [['fallen_star', 5], ['silver_bar', 3]] });
defAccessory('magic_cloak', 'Magic Cloak', { tooltip: 'Magic damage increases with how much mana you have left (up to +20% at full mana)', recipe: [['cobweb', 15], ['fallen_star', 1], ['gel', 5]] });
defAccessory('mana_knuckles', 'Mana Knuckles', { defense: 8, manaCostPct: 8, autoMana: true, rarity: 2, tooltip: '+8 defense, 8% reduced mana usage, automatically drinks a mana potion when out of mana', station: 'anvil', recipe: [['iron_bar', 10], ['gel', 5], ['fallen_star', 3]] });
defAccessory('celestial_knuckles', 'Celestial Knuckles', { defense: 8, manaOnHurt: true, rarity: 2, tooltip: '+8 defense, restores mana when you take damage, increases mana star pickup range', station: 'anvil', recipe: [['gold_bar', 10], ['fallen_star', 5], ['gel', 10]] });
defAccessory('mana_field', 'Mana Field', { manaField: true, rarity: 2, tooltip: 'Magic hits on enemies within 8 blocks give back part of the mana used', value: 30000 });
defAccessory('star_band', 'Star Band', { manaBonus: 20, starBand: true, rarity: 2, tooltip: '+20 max mana; enemies drop mana stars when damaged instead of when killed', recipe: [['band_of_starpower', 1], ['fallen_star', 5], ['gold_bar', 5]], station: 'anvil' });
defAccessory('magic_glove', 'Magic Glove', { magicGlove: true, tooltip: 'Boosts the velocity of magic projectiles', recipe: [['iron_bar', 8], ['gel', 10], ['cobweb', 5]], station: 'anvil' });
const ACCESSORY_SLOTS = 3;

// Mana star pickup (restores 50 mana); dropped by enemies or by hits with the Star Band
class ManaStar extends Entity {
  constructor(x, y, amount = 50) { super(x - 6, y - 6, 12, 12); this.vx = rand(-1, 1); this.vy = -2; this.life = 60 * 60; this.amount = amount; }
  update(world, player, game) {
    this.life--; if (this.life <= 0) { this.dead = true; return; }
    this.updateLiquidState(world);
    if (this.inLava) { this.dead = true; return; }
    const range = 40 + (player.acc && player.acc.manaOnHurt ? 100 : 0);
    const d = dist(this.cx, this.cy, player.cx, player.cy);
    if (!player.dead && d < range) {
      const dx = player.cx - this.cx, dy = player.cy - this.cy; this.x += dx / d * 4; this.y += dy / d * 4;
      if (d < 14) { player.mana = Math.min(player.maxMana, player.mana + this.amount); Audio_.play('pickup'); game.addDamageText(player.cx, player.y, '+' + this.amount, '#60a0ff'); this.dead = true; }
      return;
    }
    this.applyGravity(0.6); this.vx *= 0.9; this.moveAndCollide(world);
  }
  draw(ctx, camX, camY, t) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY + Math.sin(t * 0.1) * 2);
    ctx.fillStyle = '#60a0ff'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0e0ff'; ctx.fillRect(x - 1, y - 2, 2, 2);
  }
}

// Falling star (visual + item on landing)
class FallingStar extends Entity {
  constructor(x, y) { super(x, y, 8, 8); this.vx = rand(-3, 3); this.vy = 6; this.trail = []; }
  update(world, game) {
    this.x += this.vx; this.y += this.vy;
    this.trail.push([this.x, this.y]); if (this.trail.length > 12) this.trail.shift();
    const tx = Math.floor((this.x + 4) / TILE), ty = Math.floor((this.y + 8) / TILE);
    if (world.isSolidAt(tx, ty) || this.y > world.h * TILE) {
      this.dead = true;
      if (ty < world.surfaceLine + 10) { const d = new ItemDrop(this.x + 4, this.y - 4, 'fallen_star', 1, null); d.isStar = true; game.drops.push(d); Audio_.play('pickup'); for (let i = 0; i < 12; i++) game.particles.push(new Particle(this.x + 4, this.y, rand(-3, 3), rand(-4, 0), '#ffe080', 40, 2, false)); }
    }
    game.lighting.extraLights.push({ x: this.x / TILE, y: this.y / TILE, r: 1, g: 0.9, b: 0.5 });
  }
  draw(ctx, camX, camY) {
    ctx.strokeStyle = 'rgba(255,230,120,0.6)'; ctx.lineWidth = 2; ctx.beginPath();
    this.trail.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x - camX + 4, y - camY + 4); else ctx.lineTo(x - camX + 4, y - camY + 4); }); ctx.stroke();
    ctx.fillStyle = '#ffe080'; ctx.fillRect(snap(this.x - camX), snap(this.y - camY), 8, 8); ctx.fillStyle = '#fff'; ctx.fillRect(snap(this.x - camX + 2), snap(this.y - camY + 2), 4, 4);
  }
}

// Player-side mage helpers -----------------------------------------------------------
const Magic = {
  // aggregate accessory + armor mana modifiers
  computeAcc(p) {
    const acc = { defense: 0, manaBonus: 0, manaCostPct: 0, autoMana: false, manaOnHurt: false, manaField: false, starBand: false, magicGlove: false, magicCloak: false, gemSet: null };
    for (const a of [...p.accessories, ...Object.values(p.equipment || {})]) if (a) { const it = ITEMS[a.id]; acc.defense += it.defense || 0; if (it.slimeCalm) acc.slimeCalm = true; acc.manaBonus += it.manaBonus || 0; acc.manaCostPct += it.manaCostPct || 0; for (const k of ['autoMana', 'manaOnHurt', 'manaField', 'starBand', 'magicGlove']) if (it[k]) acc[k] = true; if (a.id === 'magic_cloak') acc.magicCloak = true; acc.danmakuDmg = (acc.danmakuDmg || 0) + (it.danmakuDmg || 0); acc.grazeBonus = (acc.grazeBonus || 0) + (it.grazeBonus || 0); }
    for (const a of p.armor) if (a) { const it = ITEMS[a.id]; acc.manaBonus += it.manaBonus || 0; acc.manaCostPct += it.manaCostPct || 0; }
    const head = p.armor[0] && ITEMS[p.armor[0].id], body = p.armor[1] && ITEMS[p.armor[1].id];
    if (head && body && head.gem && head.gem === body.gem) acc.gemSet = head.gem;
    return acc;
  },
  manaCost(p, it) {
    let cost = it.manaCost * (1 - Math.min(0.6, p.acc.manaCostPct / 100));
    if (p.acc.gemSet && (it.gem === p.acc.gemSet || (it.multi && it.multi.includes(p.acc.gemSet)))) cost *= 0.8;
    return Math.max(1, Math.round(cost));
  },
  damageMult(p, it) {
    let m = 1;
    if (p.acc.gemSet && (it.gem === p.acc.gemSet || (it.multi && it.multi.includes(p.acc.gemSet)))) m *= 1.25;
    if (p.acc.magicCloak) m *= 1 + 0.2 * (p.maxMana ? p.mana / p.maxMana : 0);
    if (p.hasBuff('Mana Sickness')) m *= 0.75;
    return m;
  },
  // cast the selected magic weapon toward the mouse; returns true if cast
  cast(game, slot, it) {
    const p = game.player;
    let cost = this.manaCost(p, it);
    if (typeof ManaOverload !== 'undefined' && ManaOverload.state(game).active > 0) cost = 0;
    if (p.mana < cost) {
      if (p.acc.autoMana) { const i = p.inventory.findIndex(s => s && s.id === 'lesser_mana'); if (i >= 0 && !p.hasBuff('Mana Sickness')) game.consume(p.inventory[i], ITEMS.lesser_mana); }
      if (p.mana < cost && typeof ManaOverload !== 'undefined' && ManaOverload.tryOverload(game)) cost = 0;
      if (p.mana < cost) { if (game.useHeld === 1) game.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return false; }
    }
    p.mana -= cost; p.manaRegenDelay = 40; p.lastManaUse = cost;
    const st = itemStats(slot);
    const dmgBase = Math.round(st.damage * this.damageMult(p, it) * p.pm.dmg * (p.pm.magicDmg || 1));
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), ang0 = Math.atan2(dy, dx);
    const speedMult = (p.acc.magicGlove ? (game.throarbinExact ? 1.1 : 1.25) : 1) * p.pm.projSpeed;
    const shots = it.multi ? it.multi : [it.gem || 'spark'];
    shots.forEach((gem, i) => {
      const spread = shots.length > 1 ? (i - (shots.length - 1) / 2) * 0.12 : 0;
      const ang = ang0 + spread;
      const g = GEMS.find(x => x.id === gem);
      const kind = it.spark ? 'spark' : 'bolt';
      const speed = (it.spark ? 6 : 9) * speedMult;
      game.projectiles.push(new Projectile(p.cx, p.y + 14, Math.cos(ang) * speed, Math.sin(ang) * speed, { kind, damage: dmgBase, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: g ? g.color : '#ffe060', hi: g ? g.hi : '#fff', magic: true, manaCost: cost, pierce: it.spark ? 2 : 0 }));
    });
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime)));
    p.dir = dx < 0 ? -1 : 1;
    Audio_.play('swing');
    return true;
  },
  // a magic projectile hit an enemy: Mana Field / Star Band
  onMagicHit(game, proj, e) {
    const p = game.player;
    if (p.acc.manaField && dist(e.cx, e.cy, p.cx, p.cy) < 8 * TILE) { const back = Math.max(1, Math.round(proj.manaCost * (game.throarbinExact ? 0.1 : 0.25))); p.mana = Math.min(p.maxMana, p.mana + back); }
    if (p.acc.starBand && Math.random() < 1 / 6) game.drops.push(new ManaStar(e.cx, e.cy, 20));
  },
  tick(game) {
    const p = game.player, w = game.world;
    p.acc = this.computeAcc(p);
    // max mana = base + crystals + bonuses
    const want = p.baseMana + p.acc.manaBonus;
    if (p.maxMana !== want) { p.maxMana = want; p.mana = Math.min(p.mana, p.maxMana); }
    // regen (Terraria-like: faster when standing still, delayed after casting)
    if (p.manaRegenDelay > 0) p.manaRegenDelay--;
    else if (p.mana < p.maxMana) {
      const still = !(p.input.left || p.input.right || p.input.jump);
      p.manaRegenCount += (Math.floor(p.maxMana / 7) + 1) * (still ? 2 : 1) + ((p.pm && p.pm.manaRegen) || 0) * 2;
      while (p.manaRegenCount >= 120) { p.manaRegenCount -= 120; p.mana = Math.min(p.maxMana, p.mana + 1); }
    }
    // fallen stars at night
    if (!w.isDay() && w.time % 60 === 0 && Math.random() < 1 / 40 && p.tileY < w.surfaceLine + 20) {
      game.projectiles.push(new FallingStar(p.cx + rand(-40, 40) * TILE, Math.max(0, p.y - 30 * TILE)));
    }
    // stars vanish at dawn
    if (w.time % w.dayLength === Math.round(w.dayLength * 4.5 / 24)) for (const d of game.drops) if (d.isStar) d.dead = true;
  },
};
