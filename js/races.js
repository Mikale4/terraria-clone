// ---------------------------------------------------------------------------
// MrPlague's Authentic Races: a DnD-style race system. Each race changes the
// player's sprite (colours, ears, horns, tail, wings, size) and comes with a
// set of configurable abilities and stat changes plus an active ability (Z).
// Custom races can be designed in the built-in Race Editor and are saved in
// this browser. The race is picked when creating a world.
// ---------------------------------------------------------------------------
'use strict';

const RACE_ABILITIES = {
  none: { name: 'None', desc: 'No active ability', cd: 0, use: () => false },
  bat_dash: { name: 'Bat Form', desc: 'Dash 6 blocks forward as a swarm of bats (10 s cooldown)', cd: 600, use: (g, p) => { p.vx = p.dir * 16; p.vy = -2; p.invuln = 25; p.fallStart = null; FX.burst(g, p.cx, p.cy, 14, '#402040', 4, 25); Audio_.play('swing'); return true; } },
  fire_breath: { name: 'Fire Breath', desc: 'Breathe a cone of fire (25 damage, sets enemies on fire) (8 s cooldown)', cd: 480, use: (g, p) => { for (let i = 0; i < 9; i++) { const a = (p.dir > 0 ? 0 : Math.PI) + (i - 4) * 0.08; const b = new Projectile(p.cx + p.dir * 10, p.y + 12, Math.cos(a) * (5 + i * 0.3), Math.sin(a) * (5 + i * 0.3), { kind: 'spark', damage: 25, friendly: true, owner: p, knockback: 3, color: '#ff8020', pierce: 2 }); b.life = 24; g.projectiles.push(b); } Audio_.play('swing'); return true; } },
  stone_skin: { name: 'Stone Skin', desc: '+20 defense for 5 s, but you cannot move (20 s cooldown)', cd: 1200, use: (g, p) => { p.raceBuff = { defAdd: 20, t: 300, root: true }; FX.ring(g, p.cx, p.cy, 16, '#a0a0a8', 3, 30); Audio_.play('dig_stone'); return true; } },
  pounce: { name: 'Pounce', desc: 'Leap high and far (6 s cooldown)', cd: 360, use: (g, p) => { p.vy = -11; p.vx = p.dir * 8; Audio_.play('jump'); return true; } },
  feral_form: { name: 'Feral Form', desc: '+30% damage and speed, -8 defense for 10 s (30 s cooldown)', cd: 1800, use: (g, p) => { p.raceBuff = { dmg: 1.3, move: 1.3, defAdd: -8, t: 600 }; FX.burst(g, p.cx, p.cy, 16, '#c04040', 4, 30); Audio_.play('zombie'); return true; } },
  starlight: { name: 'Starlight', desc: 'Restore 40 mana and 20 life (25 s cooldown)', cd: 1500, use: (g, p) => { p.mana = Math.min(p.maxMana, p.mana + 40); p.hp = Math.min(p.maxHp, p.hp + 20); g.addDamageText(p.cx, p.y, '+20', '#40e060'); FX.burst(g, p.cx, p.cy, 12, '#80c0ff', 3, 30); Audio_.play('heal'); return true; } },
  glide: { name: 'Glide Toggle', desc: 'Toggle gliding: fall slowly with wings spread (no cooldown)', cd: 30, use: (g, p) => { p.raceGlide = !p.raceGlide; g.message(`Gliding ${p.raceGlide ? 'on' : 'off'}`, '#c0c0ff'); return true; } },
  tunnel: { name: 'Tunnel', desc: 'Dig a 3x3 hole in the direction you face (4 s cooldown)', cd: 240, use: (g, p) => { const tx = p.tileX + p.dir * 2, ty = p.tileY; let n = 0; for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) { const id = g.world.get(x, y); if (id !== T.AIR && TILES[id].minPower <= 35 && !TILES[id].furniture) { g.breakTile(x, y); n++; } } if (n) Audio_.play('dig'); return n > 0; } },
};
// stat fields: life (max life %), dmg, def (flat), move, jump, mana (flat), mine (tool speed %), regen (flat), night (damage % at night), lifesteal (%), sunWeak (bool: -regen in daylight), size (sprite scale)
const RACE_DEFAULTS = { life: 0, dmg: 0, def: 0, move: 0, jump: 0, mana: 0, mine: 0, regen: 0, night: 0, lifesteal: 0, sunWeak: false, glideNatural: false, size: 1 };
const RACES = {
  human: { name: 'Human', desc: 'Adaptable: +3% damage, +1 defense, +3% movement speed.', stats: { dmg: 3, def: 1, move: 3 }, ability: 'none', look: { skin: '#f2c6a0', hair: '#5a3a2a', eye: '#3a8ad0' }, features: {} },
  elf: { name: 'Elf', desc: 'Long-lived and attuned to magic. +40 mana, +10% damage, -3 defense, faster mana regeneration.', stats: { mana: 40, dmg: 10, def: -3, move: 5 }, ability: 'starlight', look: { skin: '#f8e0c8', hair: '#f0e8c0', eye: '#40c080' }, features: { ears: true } },
  dwarf: { name: 'Dwarf', desc: 'Stout and stubborn. +4 defense, +25% mining speed, +10% life, -10% movement speed.', stats: { def: 4, mine: 25, life: 10, move: -10 }, ability: 'stone_skin', look: { skin: '#e8c0a0', hair: '#c04020', eye: '#3a3a3a' }, features: { beard: true }, size: 0.9 },
  kobold: { name: 'Kobold', desc: 'Small, quick and sneaky. +20% movement speed, +15% jump, -15% life, +15% damage at night.', stats: { move: 20, jump: 15, life: -15, night: 15 }, ability: 'tunnel', look: { skin: '#c05030', hair: '#802010', eye: '#ffe060' }, features: { horns: true, tail: true, snout: true }, size: 0.85 },
  vampire: { name: 'Vampire', desc: 'Undead noble. 6% lifesteal, +15% movement speed at night, no natural regeneration in daylight.', stats: { lifesteal: 6, night: 10, sunWeak: true }, ability: 'bat_dash', look: { skin: '#e8e0f0', hair: '#201020', eye: '#ff2020' }, features: { fangs: true, cape: true } },
  fluftrodon: { name: 'Fluftrodon', desc: 'A fluffy dragon. Glides naturally, breathes fire, +2 defense from scales, -5% movement speed.', stats: { def: 2, move: -5, glideNatural: true }, ability: 'fire_breath', look: { skin: '#80c0e0', hair: '#f0f8ff', eye: '#ffe060' }, features: { horns: true, tail: true, wings: true, snout: true }, size: 1.05 },
  soulbeast: { name: 'Soulbeast', desc: 'A spirit bound to a beast. +8% damage, +2 life regeneration; Feral Form unleashes it.', stats: { dmg: 8, regen: 2 }, ability: 'feral_form', look: { skin: '#a0b0a0', hair: '#304030', eye: '#80ff80' }, features: { ears: true, tail: true, claws: true } },
  goblin: { name: 'Goblin', desc: 'Crafty tinkerer. +10% ranged damage, +20% mining speed, +5% movement speed, -2 defense.', stats: { mine: 20, move: 5, def: -2, dmg: 4 }, ability: 'pounce', look: { skin: '#70a050', hair: '#203020', eye: '#ffe060' }, features: { ears: true, snout: true }, size: 0.9 },
};
const Races = {
  custom: {},
  load() { try { this.custom = JSON.parse(localStorage.getItem('custom_races') || '{}'); } catch (e) { this.custom = {}; } },
  save() { try { localStorage.setItem('custom_races', JSON.stringify(this.custom)); } catch (e) {} },
  all() { return Object.assign({}, RACES, this.custom); },
  ids() { return Object.keys(this.all()); },
  get(id) { return this.all()[id] || RACES.human; },
  stats(id) { return Object.assign({}, RACE_DEFAULTS, this.get(id).stats || {}); },
  state(game) { return ModLib.player(game, 'race', () => ({ race: game.raceChoice || 'human', cd: 0 })); },
  raceOf(game) { return this.get(this.state(game).race); },
  // called once for a new character: looks, max life and mana from the race
  apply(game, fresh) {
    const p = game.player, r = this.raceOf(game), st = this.stats(this.state(game).race);
    if (r.look) p.colors = Object.assign({}, p.colors, { skin: r.look.skin, hair: r.look.hair, eye: r.look.eye });
    if (fresh) { p.maxHp = Math.round(p.maxHp * (1 + st.life / 100)); p.hp = p.maxHp; p.baseMana += st.mana; p.maxMana = p.baseMana; p.mana = p.maxMana; }
  },
  tick(game) {
    const s = this.state(game), p = game.player;
    if (s.cd > 0) s.cd--;
    if (p.raceBuff) { p.raceBuff.t--; if (p.raceBuff.root) { p.vx = 0; } if (p.raceBuff.t <= 0) p.raceBuff = null; }
    const st = this.stats(s.race);
    if ((st.glideNatural || p.raceGlide) && !p.onGround && p.vy > 1.2 && !p.inWater && p.input.jump) p.vy = 1.2;
  },
  mods(p, pm, game) {
    const s = this.state(game), st = this.stats(s.race), night = !game.world.isDay();
    pm.dmg *= 1 + st.dmg / 100 + (night ? st.night / 100 : 0);
    pm.defAdd += st.def; pm.move *= 1 + st.move / 100 + (night && s.race === 'vampire' ? 0.15 : 0); pm.jump *= 1 + st.jump / 100; pm.regenAdd += st.regen;
    pm.mineSpeed = 1 + st.mine / 100;
    if (st.sunWeak && !night && p.tileY < game.world.surfaceLine) pm.regenAdd -= 4;
    if (p.raceBuff) { if (p.raceBuff.dmg) pm.dmg *= p.raceBuff.dmg; if (p.raceBuff.move) pm.move *= p.raceBuff.move; if (p.raceBuff.defAdd) pm.defAdd += p.raceBuff.defAdd; }
  },
  onHit(game, e, dmg) { const st = this.stats(this.state(game).race), p = game.player; if (st.lifesteal > 0 && p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + Math.max(1, Math.round(dmg * st.lifesteal / 100))); },
  useAbility(game) {
    const s = this.state(game), p = game.player, r = this.raceOf(game), ab = RACE_ABILITIES[r.ability || 'none'];
    if (!ab || r.ability === 'none') { game.message(`${r.name}s have no active ability.`, '#aaa'); return; }
    if (s.cd > 0) { game.message(`${ab.name}: ${Math.ceil(s.cd / 60)}s`, '#ff8080'); return; }
    if (ab.use(game, p)) s.cd = ab.cd;
  },
  // sprite features drawn over the humanoid (ctx already translated to the sprite origin, flipped for dir)
  drawFeatures(ctx, p, game) {
    const r = this.raceOf(game), f = r.features || {}, look = r.look || {};
    if (f.ears) { ctx.fillStyle = look.skin || '#f2c6a0'; ctx.beginPath(); ctx.moveTo(-7, 5); ctx.lineTo(-13, 2); ctx.lineTo(-7, 8); ctx.fill(); ctx.beginPath(); ctx.moveTo(7, 5); ctx.lineTo(13, 2); ctx.lineTo(7, 8); ctx.fill(); }
    if (f.horns) { ctx.fillStyle = '#e8d8c0'; ctx.fillRect(-6, -5, 2, 5); ctx.fillRect(-7, -7, 2, 3); ctx.fillRect(4, -5, 2, 5); ctx.fillRect(5, -7, 2, 3); }
    if (f.snout) { ctx.fillStyle = shade(look.skin || '#f2c6a0', 0.85); ctx.fillRect(6, 6, 4, 4); ctx.fillStyle = '#000'; ctx.fillRect(9, 7, 1, 1); }
    if (f.fangs) { ctx.fillStyle = '#fff'; ctx.fillRect(2, 10, 1, 2); ctx.fillRect(4, 10, 1, 2); }
    if (f.beard) { ctx.fillStyle = look.hair || '#c04020'; ctx.fillRect(-5, 9, 10, 5); ctx.fillRect(-4, 14, 8, 3); }
    if (f.tail) { ctx.fillStyle = look.skin || '#f2c6a0'; ctx.beginPath(); ctx.moveTo(-6, 24); ctx.quadraticCurveTo(-16, 26, -18, 18); ctx.lineTo(-15, 18); ctx.quadraticCurveTo(-14, 24, -6, 22); ctx.fill(); }
    if (f.wings) { ctx.fillStyle = shade(look.skin || '#80c0e0', 0.8); ctx.globalAlpha = 0.9; const fl = p.raceGlide || (!p.onGround && p.input && p.input.jump) ? Math.sin(Date.now() * 0.02) * 4 : 0; ctx.beginPath(); ctx.moveTo(-6, 14); ctx.lineTo(-22, 4 - fl); ctx.lineTo(-20, 18); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    if (f.cape) { ctx.fillStyle = '#401020'; ctx.fillRect(-9, 12, 4, 16); }
    if (f.claws) { ctx.fillStyle = '#e8e8e0'; ctx.fillRect(4, 26, 2, 2); ctx.fillRect(-2, 26, 2, 2); }
  },
  draw(game) {
    const s = this.state(game), r = this.raceOf(game), ctx = game.renderer.ctx, H = game.renderer.H, ab = RACE_ABILITIES[r.ability || 'none'];
    if (!ab || r.ability === 'none') return;
    const x = 22, y = H - 208;
    drawText(ctx, `${r.name}: ${ab.name} (${ModKeys.labelFor('KeyZ')})${s.cd > 0 ? ' ' + Math.ceil(s.cd / 60) + 's' : ' ready'}`, x, y, { size: 12, color: s.cd > 0 ? '#aaa' : '#ffe0a0' });
    if (game.player.raceBuff) drawText(ctx, `${ab.name} active ${Math.ceil(game.player.raceBuff.t / 60)}s`, x, y - 16, { size: 12, color: '#ffb080' });
  },
  // Race Editor ------------------------------------------------------------------------
  editor: null, // { id, race }
  openEditor(base) { const b = this.get(base || 'human'); this.editor = { id: null, race: JSON.parse(JSON.stringify({ name: 'My ' + b.name, desc: 'A custom race.', stats: Object.assign({}, b.stats || {}), ability: b.ability || 'none', look: Object.assign({}, b.look), features: Object.assign({}, b.features || {}), size: b.size || 1 })) }; },
  editorItems() {
    const e = this.editor.race, st = Object.assign({}, RACE_DEFAULTS, e.stats);
    const num = (k, label, step, min, max) => ({ label: `${label}: ${st[k] > 0 ? '+' : ''}${st[k]}${k === 'def' || k === 'mana' || k === 'regen' ? '' : '%'}`, act: (dir) => { e.stats[k] = clamp((e.stats[k] || 0) + dir * step, min, max); } });
    const tog = (k, label) => ({ label: `${label}: ${e.features[k] ? 'Yes' : 'No'}`, act: () => { e.features[k] = !e.features[k]; } });
    const pal = ['#f2c6a0', '#e8c0a0', '#c08060', '#8a5a3a', '#f8e0c8', '#e8e0f0', '#70a050', '#c05030', '#80c0e0', '#a0b0a0', '#d0a0ff', '#f0f0f0'];
    const col = (k, label) => ({ label: `${label} colour`, act: () => { e.look[k] = pal[(pal.indexOf(e.look[k]) + 1) % pal.length]; }, swatch: () => e.look[k] });
    return [
      { label: `Name: ${e.name}`, act: () => { TextInput.focus({ id: 'race_name', value: e.name, max: 18, onSubmit: (v) => { if (v.trim()) e.name = v.trim(); } }); } },
      col('skin', 'Skin'), col('hair', 'Hair'), col('eye', 'Eye'),
      tog('ears', 'Pointed ears'), tog('horns', 'Horns'), tog('tail', 'Tail'), tog('wings', 'Wings'), tog('snout', 'Snout'), tog('fangs', 'Fangs'), tog('beard', 'Beard'), tog('cape', 'Cape'),
      num('life', 'Max life', 5, -30, 30), num('dmg', 'Damage', 2, -20, 20), num('def', 'Defense', 1, -6, 6), num('move', 'Speed', 5, -30, 30), num('jump', 'Jump', 5, -30, 30), num('mana', 'Mana', 20, 0, 100), num('mine', 'Mining speed', 5, -30, 50), num('regen', 'Regen', 1, -4, 4), num('night', 'Night damage', 5, 0, 30), num('lifesteal', 'Lifesteal', 1, 0, 10),
      { label: `Sun weakness: ${e.stats.sunWeak ? 'Yes' : 'No'}`, act: () => { e.stats.sunWeak = !e.stats.sunWeak; } },
      { label: `Natural glide: ${e.stats.glideNatural ? 'Yes' : 'No'}`, act: () => { e.stats.glideNatural = !e.stats.glideNatural; } },
      { label: `Size: ${(e.size || 1).toFixed(2)}`, act: (dir) => { e.size = clamp(Math.round(((e.size || 1) + dir * 0.05) * 100) / 100, 0.7, 1.3); } },
      { label: `Ability: ${RACE_ABILITIES[e.ability].name}`, act: (dir) => { const k = Object.keys(RACE_ABILITIES); e.ability = k[(k.indexOf(e.ability) + dir + k.length) % k.length]; } },
    ];
  },
  budget(e) { const st = Object.assign({}, RACE_DEFAULTS, e.stats); return Math.round(st.life / 5 + st.dmg / 2 + st.def * 2 + st.move / 5 + st.jump / 10 + st.mana / 20 + st.mine / 10 + st.regen * 2 + st.night / 5 + st.lifesteal * 1.5 - (st.sunWeak ? 4 : 0) + (st.glideNatural ? 3 : 0) + (RACE_ABILITIES[e.ability].cd ? 3 : 0)); },
  saveEditor(game) {
    const e = this.editor.race; const b = this.budget(e);
    if (b > 12) { game.message(`Race too strong: power ${b}/12. Lower some stats or add a weakness.`, '#ff8080'); return false; }
    const id = 'custom_' + e.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    this.custom[id] = e; this.save(); game.message(`Race "${e.name}" saved. Pick it when creating a world.`, '#80ff80'); Audio_.play('craft');
    return id;
  },
  drawEditor(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    if (!this.editor) this.openEditor('human');
    const e = this.editor.race;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H);
    drawText(ctx, 'Race Editor', W / 2, 24, { size: 32, align: 'center' });
    const items = this.editorItems(); const colW = Math.min(300, (W - 40) / 3); const perCol = Math.ceil(items.length / 3);
    items.forEach((it, i) => {
      const c = Math.floor(i / perCol), r = i % perCol; const x = W / 2 + (c - 1) * colW, y = 80 + r * 30;
      const w = colW - 20; const hov = mouse.x >= x - w / 2 && mouse.x < x + w / 2 && mouse.y >= y && mouse.y < y + 24;
      ctx.fillStyle = hov ? 'rgba(255,230,90,0.25)' : 'rgba(255,255,255,0.08)'; roundRect(ctx, x - w / 2, y, w, 24, 5); ctx.fill();
      drawText(ctx, it.label, x, y + 3, { size: 14, align: 'center', color: '#fff' });
      if (it.swatch) { ctx.fillStyle = it.swatch(); ctx.fillRect(x + w / 2 - 22, y + 4, 16, 16); }
      UI.button(x - w / 2, y, w, 24, 'race_edit', i);
    });
    // preview
    const px = W / 2, py = H - 150; ctx.save(); ctx.translate(px, py); ctx.scale(3 * (e.size || 1), 3 * (e.size || 1));
    drawHumanoid(ctx, -10, 0, { dir: 1, walk: null, colors: { skin: e.look.skin, hair: e.look.hair, shirt: '#c04040', pants: '#3a3a8a', shoes: '#3a2a1a', eye: e.look.eye }, armAngle: null, item: null, hairStyle: 0 });
    ctx.translate(0, 0); this.drawFeaturesFor(ctx, e); ctx.restore();
    drawText(ctx, `Power budget: ${this.budget(e)}/12   (left-click: next / +, right-click: previous / -)`, W / 2, H - 60, { size: 13, align: 'center', color: this.budget(e) > 12 ? '#ff8080' : '#a0ffa0' });
    const bw = 140; for (const [k, label, id] of [[-1, 'Save race', 'race_save'], [1, 'Back', 'race_back']]) { const x = W / 2 + k * 90 - bw / 2, y = H - 36; const hov = mouse.x >= x && mouse.x < x + bw && mouse.y >= y && mouse.y < y + 28; ctx.fillStyle = hov ? 'rgba(255,230,90,0.35)' : 'rgba(255,255,255,0.15)'; roundRect(ctx, x, y, bw, 28, 6); ctx.fill(); drawText(ctx, label, x + bw / 2, y + 5, { size: 16, align: 'center' }); UI.button(x, y, bw, 28, id, null); }
    if (TextInput.isFocused('race_name')) TextInput.draw(ctx, W / 2 - 150, 52, 300, 26, { id: 'race_name', placeholder: 'race name' });
  },
  drawFeaturesFor(ctx, race) { this.drawFeatures(ctx, { onGround: true, input: {} }, { player: {}, world: {}, __race: race }); },
};
Races.load();
ModKeys.bind('KeyZ', 'Race ability', (g) => Races.useAbility(g));
ModLib.onPlayerMods((p, pm, g) => Races.mods(p, pm, g));
ModLib.on('enemyHit', (g, e, dmg) => Races.onHit(g, e, dmg));
// drawFeaturesFor passes a fake game: resolve the race from it
const _raceOf = Races.raceOf.bind(Races); Races.raceOf = function (game) { return game && game.__race ? game.__race : _raceOf(game); };
