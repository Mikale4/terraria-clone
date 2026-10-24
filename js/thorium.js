// ---------------------------------------------------------------------------
// Thorium Mod slice: three new classes - Bard (instruments, Inspiration,
// Empowerments for nearby allies), Healer (radiant staves that heal companions
// and town NPCs, Life Recovery), Thrower (throwing weapons, Technique Scroll,
// Technique Points and an activated ability) - the Grand Thunder Bird boss
// (Storm Flare, desert) and the Cook town NPC.
// ---------------------------------------------------------------------------
'use strict';

function defTItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
// Bard instruments (symphonic damage, cost Inspiration, grant Empowerments)
const drawNoteIcon = (col) => (x) => { x.fillStyle = col; x.fillRect(9, 2, 2, 10); x.beginPath(); x.ellipse(7, 12, 4, 3, -0.3, 0, Math.PI * 2); x.fill(); x.fillRect(9, 2, 5, 2); };
defTItem('wooden_whistle', 'Wooden Whistle', { max: 1, damage: 9, useTime: 22, knockback: 2, rarity: 1, value: 2000, bard: true, inspiration: 1, empower: 'damage', tooltip: '9 symphonic damage. Uses 1 Inspiration. Empowers allies: +6% damage', drawIcon: (x) => { x.fillStyle = '#8b5a2b'; x.fillRect(2, 7, 12, 4); x.fillStyle = '#c89058'; x.fillRect(2, 7, 12, 1); x.fillStyle = '#4a2a10'; x.fillRect(5, 8, 2, 2); x.fillRect(9, 8, 2, 2); }, use: (g, s, it) => Thorium.playInstrument(g, s, it) });
defTItem('bongos', 'Bongos', { max: 1, damage: 14, useTime: 30, knockback: 6, rarity: 1, value: 6000, bard: true, inspiration: 2, empower: 'defense', tooltip: '14 symphonic damage in a shockwave around you. Uses 2 Inspiration. Empowers allies: +4 defense', drawIcon: (x) => { x.fillStyle = '#a06030'; x.fillRect(1, 5, 7, 9); x.fillRect(8, 5, 7, 9); x.fillStyle = '#e8d0a0'; x.fillRect(1, 5, 7, 2); x.fillRect(8, 5, 7, 2); }, use: (g, s, it) => Thorium.playInstrument(g, s, it) });
defTItem('lute', 'Lute', { max: 1, damage: 12, useTime: 26, knockback: 3, rarity: 2, value: 12000, bard: true, inspiration: 2, empower: 'speed', tooltip: '12 symphonic damage, fires 3 homing notes. Uses 2 Inspiration. Empowers allies: +12% movement & attack speed', drawIcon: (x) => { x.fillStyle = '#a06030'; x.beginPath(); x.ellipse(6, 10, 5, 5, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#4a2a10'; x.fillRect(8, 1, 3, 9); x.fillStyle = '#e8d0a0'; x.fillRect(4, 9, 3, 3); }, use: (g, s, it) => Thorium.playInstrument(g, s, it) });
RECIPES.push({ result: 'wooden_whistle', count: 1, station: 'workbench', ing: [['wood', 12]] });
RECIPES.push({ result: 'bongos', count: 1, station: 'workbench', ing: [['wood', 20], ['rotten_chunk', 4]] });
RECIPES.push({ result: 'lute', count: 1, station: 'anvil', ing: [['wood', 15], ['silver_bar', 6], ['cobweb', 10]] });
// Healer staves (radiant damage, heal allies)
defTItem('healers_staff', "Healer's Staff", { max: 1, damage: 10, useTime: 24, knockback: 2, rarity: 1, value: 3000, healer: true, manaCost: 5, heal: 0, healAmt: 8, tooltip: '10 radiant damage bolt that heals allies it passes for 8. Hitting an enemy recovers 2 life. Uses 5 mana', drawIcon: (x) => { x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = '#ffe080'; x.beginPath(); x.arc(13, 3, 3, 0, Math.PI * 2); x.fill(); }, use: (g, s, it) => Thorium.castHeal(g, s, it) });
defTItem('caduceus_staff', 'Caduceus Staff', { max: 1, damage: 0, useTime: 40, knockback: 0, rarity: 2, value: 20000, healer: true, manaCost: 20, healAmt: 30, aura: true, tooltip: 'Heals you and every ally within 12 blocks for 30 and grants Life Recovery. Uses 20 mana', drawIcon: (x) => { x.fillStyle = '#e0c040'; x.fillRect(7, 2, 2, 12); x.fillStyle = '#40c080'; x.fillRect(4, 4, 2, 6); x.fillRect(10, 4, 2, 6); x.fillStyle = '#fff'; x.fillRect(6, 1, 4, 2); }, use: (g, s, it) => Thorium.castHeal(g, s, it) });
RECIPES.push({ result: 'healers_staff', count: 1, station: 'workbench', ing: [['wood', 10], ['fallen_star', 1], ['lesser_healing', 2]] });
RECIPES.push({ result: 'caduceus_staff', count: 1, station: 'anvil', ing: [['gold_bar', 8], ['fallen_star', 3], ['lesser_healing', 5]] });
// Thrower weapons (throwing damage) & Technique Scroll
defTItem('shuriken', 'Shuriken', { max: 999, damage: 11, useTime: 14, knockback: 2, rarity: 0, value: 20, thrown: true, tooltip: '11 throwing damage. 50% chance not to be consumed. Builds Technique Points', drawIcon: (x) => { x.fillStyle = '#c0c0c8'; x.beginPath(); x.moveTo(8, 1); x.lineTo(10, 6); x.lineTo(15, 8); x.lineTo(10, 10); x.lineTo(8, 15); x.lineTo(6, 10); x.lineTo(1, 8); x.lineTo(6, 6); x.closePath(); x.fill(); x.fillStyle = '#404048'; x.fillRect(7, 7, 2, 2); }, use: (g, s, it) => Thorium.throwWeapon(g, s, it) });
defTItem('bone_javelin', 'Bone Javelin', { max: 999, damage: 18, useTime: 20, knockback: 4, rarity: 1, value: 60, thrown: true, pierce: 2, tooltip: '18 throwing damage, pierces 2 enemies. 50% chance not to be consumed', drawIcon: (x) => { x.fillStyle = '#e8e8e0'; for (let i = 0; i < 12; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = '#c0c0b8'; x.fillRect(12, 1, 3, 3); }, use: (g, s, it) => Thorium.throwWeapon(g, s, it) });
defTItem('technique_scroll', 'Technique Scroll', { max: 1, rarity: 1, value: 5000, tooltip: 'Use to choose a Technique: Offensive, Defensive or Mobility. Throwing hits build Technique Points; press G to activate', drawIcon: (x) => { x.fillStyle = '#f0e0c0'; x.fillRect(3, 2, 10, 12); x.fillStyle = '#c0a060'; x.fillRect(2, 2, 12, 2); x.fillRect(2, 12, 12, 2); x.fillStyle = '#804020'; x.fillRect(5, 6, 6, 1); x.fillRect(5, 8, 6, 1); x.fillRect(5, 10, 4, 1); }, onUse: (g) => Thorium.cycleTechnique(g) });
RECIPES.push({ result: 'shuriken', count: 25, station: 'anvil', ing: [['iron_bar', 1]] });
RECIPES.push({ result: 'bone_javelin', count: 15, station: 'workbench', ing: [['rotten_chunk', 1], ['wood', 3]] });
RECIPES.push({ result: 'technique_scroll', count: 1, station: 'workbench', ing: [['wood', 5], ['gel', 5], ['cobweb', 5]] });
// Grand Thunder Bird
defTItem('storm_flare', 'Storm Flare', { max: 20, consumable: true, rarity: 1, value: 5000, tooltip: 'Summons the Grand Thunder Bird when used in the desert', drawIcon: (x) => { x.fillStyle = '#c04040'; x.fillRect(6, 4, 4, 10); x.fillStyle = '#ffe060'; x.fillRect(5, 1, 6, 4); x.fillStyle = '#fff'; x.fillRect(7, 2, 2, 2); } });
RECIPES.push({ result: 'storm_flare', count: 1, station: 'workbench', ing: [['sand', 10], ['fallen_star', 1], ['gel', 5]] });
defTItem('thunder_talon', 'Thunder Talon', { max: 1, sword: 'broad', damage: 22, useTime: 20, knockback: 5, rarity: 2, value: 30000, icon: { kind: 'sword', mat: 'gold' }, lightning: true, tooltip: '22 melee damage. Swings call down lightning on the nearest enemy' });
defTItem('talon_burst', 'Talon Burst', { max: 1, damage: 16, useTime: 18, knockback: 3, rarity: 2, value: 25000, tooltip: 'Throws three electrified feathers. 16 throwing damage', thrown: true, feathers: 3, noConsume: true, drawIcon: (x) => { x.fillStyle = '#e0e0ff'; x.beginPath(); x.moveTo(3, 14); x.quadraticCurveTo(6, 4, 14, 2); x.quadraticCurveTo(10, 8, 3, 14); x.fill(); x.fillStyle = '#ffe060'; x.fillRect(8, 7, 2, 2); }, use: (g, s, it) => Thorium.throwWeapon(g, s, it) });
defTItem('thunderbird_trophy', 'Grand Thunder Bird Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defTItem('thunderbird_mask', 'Grand Thunder Bird Mask', { max: 1, rarity: 2, value: 7500, armor: 'head', defense: 2, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'gold' } });
// Cook NPC & food
defTItem('bowl_of_soup', 'Bowl of Soup', { max: 30, consumable: true, heal: 40, food: true, wellFed: true, rarity: 1, value: 300, tooltip: 'Restores 40 life and grants Well Fed for 5 minutes', drawIcon: (x) => { x.fillStyle = '#d0d0d8'; x.fillRect(2, 8, 12, 6); x.fillStyle = '#e08030'; x.fillRect(3, 7, 10, 2); x.fillStyle = '#fff'; x.fillRect(6, 4, 1, 3); x.fillRect(9, 3, 1, 3); } });
defTItem('grilled_bunny', 'Grilled Bunny', { max: 30, consumable: true, heal: 30, food: true, wellFed: true, rarity: 0, value: 200, tooltip: 'Restores 30 life and grants Well Fed', drawIcon: (x) => { x.fillStyle = '#a06030'; x.beginPath(); x.ellipse(8, 9, 6, 4, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#e8e8e0'; x.fillRect(2, 5, 2, 5); x.fillRect(12, 5, 2, 5); } });
NPC_NAMES.Cook = ['Gordon', 'Julia', 'Marco', 'Remy', 'Auguste', 'Ina'];
NPC_ROLES.Cook = {
  town: true, hairStyle: 0,
  colors: { skin: '#f2c6a0', hair: '#5a3a2a', shirt: '#f4f4f4', pants: '#3a3a3a', shoes: '#2a2a2a', eye: '#3a3a3a' },
  weapon: { kind: 'knife', damage: 14, rate: 26, speed: 9 }, buttons: ['Shop'], shop: 'Cook',
  condition: (g) => g.player.inventory.some(s => s && (ITEMS[s.id].fish || ITEMS[s.id].food)) || (g.world.fishRecords && g.world.fishRecords.total > 0),
  lines: ["A warm meal beats any potion. Well, most potions.", "Bring me fish and I'll turn it into something worth eating.", "Soup of the day: whatever the Dryad let me pick.", "The Merchant keeps selling mushrooms. MUSHROOMS. To ME.", "Well Fed is a state of mind. And also a buff."],
};
SHOPS.Cook = [{ id: 'bowl_of_soup', price: 500 }, { id: 'grilled_bunny', price: 300 }, { id: 'cooked_fish', price: 400 }, { id: 'candy', price: 100 }];
RECIPES.push({ result: 'bowl_of_soup', count: 1, station: 'furnace', ing: [['bottle', 1], ['mushroom', 3], ['bass', 1]] });

// Thorium runtime -----------------------------------------------------------------------
const TECHNIQUES = ['Offensive', 'Defensive', 'Mobility'];
const Thorium = {
  state(game) { return ModLib.player(game, 'thorium', () => ({ inspiration: 10, inspMax: 10, inspRegen: 0, technique: 'Offensive', tp: 0, techActive: 0, empower: {} })); },
  allies(game) { return [...game.companions.filter(c => c.ko === 0), ...game.npcs.filter(n => !n.isPet && n.hp != null)]; },
  tick(game) {
    const s = this.state(game), p = game.player;
    if (s.inspiration < s.inspMax && ++s.inspRegen >= 90) { s.inspRegen = 0; s.inspiration++; }
    for (const k in s.empower) { s.empower[k]--; if (s.empower[k] <= 0) delete s.empower[k]; }
    if (s.techActive > 0) s.techActive--;
    if (s.tp > 0 && game.world.time % 300 === 0 && !game.enemies.length) s.tp = Math.max(0, s.tp - 1);
    // Life Recovery: allies with the buff regenerate
    for (const a of this.allies(game)) if (a.lifeRecovery > 0) { a.lifeRecovery--; if (a.lifeRecovery % 30 === 0 && a.hp < a.maxHp) a.hp = Math.min(a.maxHp, a.hp + 2); }
    if (p.lifeRecovery > 0) { p.lifeRecovery--; if (p.lifeRecovery % 30 === 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + 2); }
  },
  mods(p, pm, game) {
    const s = this.state(game);
    if (s.empower.damage) pm.dmg *= 1.06; if (s.empower.speed) { pm.move *= 1.12; pm.useTime *= 0.88; } if (s.empower.defense) pm.defAdd += 4;
    if (s.techActive > 0 && s.technique === 'Defensive') { pm.defAdd += 12; }
    if (s.techActive > 0 && s.technique === 'Mobility') { pm.move *= 1.5; }
  },
  empowerAllies(game, kind, ticks) { const s = this.state(game); s.empower[kind] = Math.max(s.empower[kind] || 0, ticks); for (const a of this.allies(game)) { a.empower = a.empower || {}; a.empower[kind] = ticks; } },
  playInstrument(game, slot, it) {
    const p = game.player, s = this.state(game), st = itemStats(slot);
    if (s.inspiration < it.inspiration) { if (game.useHeld === 1) game.message('Not enough Inspiration!', '#ffb0ff'); p.useTimer = 12; return; }
    s.inspiration -= it.inspiration; s.inspRegen = 0;
    const dmg = Math.round(st.damage * p.pm.dmg * (1 + (p.acc && p.acc.symphonic || 0) / 100));
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
    if (slot.id === 'bongos') { for (const e of game.enemies) if (dist(e.cx, e.cy, p.cx, p.cy) < 5 * TILE) e.hit(dmg, p.cx, st.knockback, game); FX.ring(game, p.cx, p.cy, 24, '#ffb0ff', 4, 30); FX.shake(2, 8); }
    else { const n = slot.id === 'lute' ? 3 : 1; for (let i = 0; i < n; i++) { const a = Math.atan2(dy, dx) + (i - (n - 1) / 2) * 0.25; const b = new Projectile(p.cx, p.y + 14, Math.cos(a) * 7, Math.sin(a) * 7, { kind: slot.id === 'lute' ? 'seal' : 'bolt', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: '#ffb0ff', hi: '#fff' }); b.life = 80; b.ghost = false; b.trail = { color: '#ffb0ff', len: 6, width: 3 }; game.projectiles.push(b); } }
    this.empowerAllies(game, it.empower, 60 * 8);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime)));
    Audio_.play('craft');
  },
  castHeal(game, slot, it) {
    const p = game.player, st = itemStats(slot);
    const cost = Math.max(1, Math.round(it.manaCost * (1 - Math.min(0.6, (p.acc && p.acc.manaCostPct || 0) / 100))));
    if (p.mana < cost) { if (game.useHeld === 1) game.message('Not enough mana!', '#8080ff'); p.useTimer = 12; return; }
    p.mana -= cost; p.manaRegenDelay = 40;
    if (it.aura) {
      let n = 0; for (const a of [p, ...this.allies(game)]) if (dist(a.cx, a.cy, p.cx, p.cy) < 12 * TILE) { if (a.hp < a.maxHp) { a.hp = Math.min(a.maxHp, a.hp + it.healAmt); game.addDamageText(a.cx, a.y, '+' + it.healAmt, '#40e060'); n++; } a.lifeRecovery = 60 * 6; }
      FX.ring(game, p.cx, p.cy, 30, '#ffe080', 5, 40); Audio_.play('heal');
    } else {
      const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
      const b = new Projectile(p.cx, p.y + 14, dx / d * 8, dy / d * 8, { kind: 'bolt', damage: Math.round(st.damage * p.pm.dmg), friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, color: '#ffe080', hi: '#fff' });
      b.life = 90; b.radiant = it.healAmt; b.trail = { color: '#ffe080', len: 6, width: 3 }; b.pierce = 1; game.projectiles.push(b);
    }
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime)));
  },
  // radiant bolts heal allies they pass through
  projectileTick(game, b) {
    if (!b.radiant) return;
    for (const a of this.allies(game)) { if (b.healed && b.healed.has(a)) continue; if (b.x < a.x + a.w && b.x + b.w > a.x && b.y < a.y + a.h && b.y + b.h > a.y) { b.healed = b.healed || new Set(); b.healed.add(a); if (a.hp < a.maxHp) { a.hp = Math.min(a.maxHp, a.hp + b.radiant); game.addDamageText(a.cx, a.y, '+' + b.radiant, '#40e060'); } a.lifeRecovery = 60 * 4; } }
  },
  onRadiantHit(game, b) { const p = game.player; if (b.radiant && p.hp < p.maxHp) { p.hp = Math.min(p.maxHp, p.hp + 2); } },
  throwWeapon(game, slot, it) {
    const p = game.player, st = itemStats(slot), s = this.state(game);
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
    const dmg = Math.round(st.damage * p.pm.dmg * (1 + (p.acc && p.acc.throwing || 0) / 100) * (s.techActive > 0 && s.technique === 'Offensive' ? 1.3 : 1));
    const n = it.feathers || 1;
    for (let i = 0; i < n; i++) {
      const a = Math.atan2(dy, dx) + (i - (n - 1) / 2) * 0.2;
      const b = new Projectile(p.cx, p.y + 14, Math.cos(a) * 10, Math.sin(a) * 10, { kind: 'knife', damage: dmg, friendly: true, owner: p, knockback: st.knockback, crit: Math.random() * 100 < st.crit + p.pm.crit, pierce: (it.pierce || 0) + (s.techActive > 0 && s.technique === 'Offensive' ? 2 : 0) });
      b.gravity = 0.08; b.life = 80; b.thrown = true; if (it.feathers) { b.trail = { color: '#ffe060', len: 6, width: 3 }; b.gravity = 0.02; }
      game.projectiles.push(b);
    }
    if (!it.noConsume && Math.random() < 0.5) game.consumeSlot(slot);
    p.startUse(slot.id, Math.max(2, Math.round(st.useTime * p.pm.useTime))); Audio_.play('swing');
  },
  onThrownHit(game, b) { const s = this.state(game); if (b.thrown && s.tp < 10) { s.tp++; if (s.tp === 10) game.addDamageText(game.player.cx, game.player.y - 12, 'Technique ready (G)', '#c0ffc0'); } },
  cycleTechnique(game) { const s = this.state(game); s.technique = TECHNIQUES[(TECHNIQUES.indexOf(s.technique) + 1) % TECHNIQUES.length]; game.message(`Technique set: ${s.technique}. ${s.technique === 'Offensive' ? 'Ability: a burst of 8 shurikens, +30% throwing damage and +2 pierce for 6 s' : s.technique === 'Defensive' ? 'Ability: +12 defense and a reflecting guard for 6 s' : 'Ability: a dash and +50% movement speed for 6 s'}`, '#c0ffc0'); Audio_.play('menu'); },
  useTechnique(game) {
    const s = this.state(game), p = game.player;
    if (s.tp < 10) { game.message(`Technique Points: ${s.tp}/10`, '#ff8080'); return; }
    s.tp = 0; s.techActive = 60 * 6;
    if (s.technique === 'Offensive') { for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const b = new Projectile(p.cx, p.cy, Math.cos(a) * 9, Math.sin(a) * 9, { kind: 'knife', damage: 14, friendly: true, owner: p, knockback: 3, pierce: 2 }); b.life = 60; b.thrown = false; game.projectiles.push(b); } }
    else if (s.technique === 'Mobility') { p.vx = p.dir * 14; p.invuln = 20; FX.burst(game, p.cx, p.cy, 10, '#c0ffc0', 3, 25); }
    else { p.invuln = 30; FX.ring(game, p.cx, p.cy, 20, '#c0ffc0', 3, 40); }
    game.message(`${s.technique} technique activated!`, '#c0ffc0'); Audio_.play('levelup');
  },
  onSwing(game, it, st) {
    if (!it.lightning) return;
    const p = game.player; let t = null, bd = 18 * TILE; for (const e of game.enemies) { const d = dist(e.cx, e.cy, p.cx, p.cy); if (d < bd) { bd = d; t = e; } }
    if (t) { FX.telegraph(t.cx, t.cy - 400, t.cx, t.cy, '#ffe060', 8, 4); t.hit(Math.round(st.damage * 0.8 * p.pm.dmg), t.cx, 2, game); FX.burst(game, t.cx, t.cy, 8, '#ffe060', 4, 20); Audio_.play('hit'); }
  },
  summonThunderBird(game) {
    const p = game.player;
    const b = new GrandThunderBird(p.cx + (Math.random() < 0.5 ? -500 : 500), p.y - 260);
    const m = (game.expert ? 1.6 : 1) * (game.master ? 1.5 : 1) * Calamity.enemyMult(game);
    b.maxHp = b.hp = Math.round(b.hp * m); b.damage = Math.round(b.damage * (game.expert ? 1.5 : 1));
    game.enemies.push(b); game.boss = b; BossLog.start(game, b);
    game.message('The Grand Thunder Bird has awoken!', '#c040c0'); Audio_.play('zombie'); FX.flash('#ffffff', 10, 0.3);
  },
  draw(game) {
    const s = this.state(game), p = game.player, ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const sel = p.selectedItem, it = sel && ITEMS[sel.id];
    const x = 22, y = H - 130;
    if (it && it.bard || Object.keys(s.empower).length) {
      drawText(ctx, `Inspiration ${s.inspiration}/${s.inspMax}`, x, y, { size: 13, color: '#ffb0ff' });
      for (let i = 0; i < s.inspMax; i++) { ctx.fillStyle = i < s.inspiration ? '#ff80ff' : 'rgba(255,255,255,0.15)'; ctx.fillRect(x + i * 14, y + 18, 12, 6); }
      const emp = Object.keys(s.empower); if (emp.length) drawText(ctx, 'Empowered: ' + emp.map(k => `${k} ${Math.ceil(s.empower[k] / 60)}s`).join(', '), x, y + 28, { size: 12, color: '#ffd0ff' });
    }
    if (it && it.thrown || s.tp > 0 || s.techActive > 0) {
      drawText(ctx, `Technique: ${s.technique}  ${s.tp}/10 (G)${s.techActive > 0 ? '  ACTIVE ' + Math.ceil(s.techActive / 60) + 's' : ''}`, x, y - 22, { size: 13, color: s.tp >= 10 ? '#c0ffc0' : '#a0c0a0' });
    }
    if (p.lifeRecovery > 0) drawText(ctx, `Life Recovery ${Math.ceil(p.lifeRecovery / 60)}s`, x, y - 40, { size: 12, color: '#40e060' });
  },
};
ModKeys.bind('KeyG', 'Thrower technique ability', (g) => Thorium.useTechnique(g));
ModLib.onPlayerMods((p, pm, g) => Thorium.mods(p, pm, g));

// Grand Thunder Bird -------------------------------------------------------------------------
class GrandThunderBird extends Enemy {
  constructor(x, y) {
    super(x, y, 70, 46, { name: 'Grand Thunder Bird', hp: 1600, damage: 26, defense: 8, kbResist: 1, blood: '#e0d0a0', drops: [] });
    this.isBoss = true; this.type = 'grand_thunder_bird'; this.flying = true; this.state = 'hover'; this.st = 0; this.flap = 0; this.trail = { color: 'rgba(255,224,96,0.5)', len: 6, width: 6 };
  }
  update(world, game) {
    this.t++; this.st++; this.flap += 0.25;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    const enraged = this.hp < this.maxHp * 0.4;
    switch (this.state) {
      case 'hover': {
        const tx = p.cx + (this.cx < p.cx ? -1 : 1) * 200, ty = p.y - 170;
        this.vx = lerp(this.vx, clamp((tx - this.cx) / 30, -5, 5), 0.06); this.vy = lerp(this.vy, clamp((ty - this.cy) / 30, -3, 3), 0.06);
        if (this.st > (enraged ? 70 : 110)) { this.st = 0; this.state = Math.random() < 0.5 ? 'swoop' : 'storm'; if (this.state === 'swoop') { this.dir = p.cx > this.cx ? 1 : -1; Audio_.play('swing'); } }
        break;
      }
      case 'swoop': { // dive through the player
        if (this.st < 20) { this.vx *= 0.9; this.vy *= 0.9; }
        else if (this.st === 20) { const dx = p.cx - this.cx, dy = p.cy - this.cy, d = Math.hypot(dx, dy) || 1; this.vx = dx / d * 12; this.vy = dy / d * 12; }
        else if (this.st > 60) { this.state = 'hover'; this.st = 0; }
        break;
      }
      case 'storm': { // lightning strikes with telegraphs
        this.vx *= 0.95; this.vy = lerp(this.vy, -0.5, 0.05);
        if (this.st % (enraged ? 25 : 40) === 0 && this.st < 160) { const lx = p.cx + rand(-120, 120) + p.vx * 20; FX.telegraph(lx, p.y - 500, lx, p.y + 60, '#ffe060', 30, 6); this.strikes = this.strikes || []; this.strikes.push({ x: lx, t: 30 }); }
        if (this.strikes) for (const s of this.strikes) { if (--s.t === 0) { FX.burst(game, s.x, p.y + 20, 16, ['#ffe060', '#ffffff'], 5, 25); FX.shake(3, 6); FX.flash('#ffffc0', 4, 0.15); Audio_.play('hit'); if (Math.abs(p.cx - s.x) < 24) p.damage(Math.round(this.damage * 0.9), s.x, game, 'enemy', false, "the Grand Thunder Bird's lightning", this); } }
        if (this.strikes) this.strikes = this.strikes.filter(s => s.t > 0);
        if (this.st > 190) { this.state = 'hover'; this.st = 0; }
        break;
      }
    }
    this.x += this.vx; this.y += this.vy; if (this.y < 16) this.y = 16;
    if (this.state !== 'swoop') this.dir = p.cx < this.cx ? -1 : 1;
    if (Math.abs(this.cx - p.cx) > 80 * TILE) { this.x = p.cx - 300; this.y = p.y - 200; }
    this.touchPlayer(p, game);
  }
  die(game) {
    super.die(game); game.boss = null;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.grand_thunder_bird = true;
    game.message('The Grand Thunder Bird has been defeated!', '#ffe75a'); Audio_.play('levelup'); FX.flash('#ffffff', 20, 0.5);
    game.dropItem(this.cx, this.cy, Math.random() < 0.5 ? 'thunder_talon' : 'talon_burst', 1); game.dropItem(this.cx, this.cy, 'gold_bar', randInt(5, 10)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(3, 6)); game.dropItem(this.cx, this.cy, 'fallen_star', randInt(3, 6));
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'thunderbird_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'thunderbird_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 15000 * (game.expert ? 2.5 : 1));
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null);
  }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY), f = Math.sin(this.flap) * 14;
    ctx.save(); ctx.translate(x, y); if (this.dir < 0) ctx.scale(-1, 1);
    ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 1;
    ctx.fillStyle = '#e0c060'; // wings
    ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(-52, -18 - f); ctx.lineTo(-40, 6 - f * 0.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(50, -18 - f); ctx.lineTo(38, 6 - f * 0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0d880'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 16, 0, 0, Math.PI * 2); ctx.fill(); // body
    ctx.fillStyle = '#ffe8a0'; ctx.beginPath(); ctx.arc(24, -10, 12, 0, Math.PI * 2); ctx.fill(); // head
    ctx.fillStyle = '#e08030'; ctx.beginPath(); ctx.moveTo(34, -10); ctx.lineTo(48, -6); ctx.lineTo(34, -2); ctx.closePath(); ctx.fill(); // beak
    ctx.fillStyle = '#000'; ctx.fillRect(26, -14, 4, 4); ctx.fillStyle = '#fff'; ctx.fillRect(27, -13, 1, 1);
    ctx.fillStyle = '#ffe060'; ctx.fillRect(20, -24, 3, 8); ctx.fillRect(25, -26, 3, 10); ctx.fillRect(30, -23, 3, 7); // crest
    ctx.fillStyle = '#e0c060'; ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-44, -6); ctx.lineTo(-44, 10); ctx.closePath(); ctx.fill(); // tail
    ctx.fillStyle = '#e08030'; ctx.fillRect(-6, 14, 3, 8); ctx.fillRect(4, 14, 3, 8);
    if (this.state === 'storm') { ctx.strokeStyle = '#ffe060'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-30, -30); ctx.lineTo(-20, -20); ctx.lineTo(-28, -14); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
BOSSES.push({ id: 'grand_thunder_bird', name: 'Grand Thunder Bird', order: 0.7, hp: 1600, summon: 'storm_flare',
  spawn: 'Use a Storm Flare (10 Sand + 1 Fallen Star + 5 Gel at a Work Bench) while in the Desert.',
  info: 'A huge bird that alternates between hovering, diving straight through you and calling down telegraphed lightning strikes. Below 40% life it attacks faster.',
  loot: ['thunder_talon', 'talon_burst', 'gold_bar', 'fallen_star'], collectibles: ['thunderbird_trophy', 'thunderbird_mask'], despawn: 'The Grand Thunder Bird flies off...' });
ModLib.on('projHit', (g, b, e) => { Thorium.onThrownHit(g, b); Thorium.onRadiantHit(g, b); });
ModLib.on('projTick', (g, b) => Thorium.projectileTick(g, b));
ModLib.on('swing', (g, it, st) => Thorium.onSwing(g, it, st));
