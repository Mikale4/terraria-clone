// ---------------------------------------------------------------------------
// The Stars Above slice: Starfarers (Asphodene / Eridani - a floating companion
// with reactive dialogue for bosses, biomes, night and danger), the Stellar
// Array (weight-based passive abilities in 3 tiers unlocked by progression),
// the Stellar Nova ultimate with its gauge, an Aspected weapon with a charged
// attack, the Vagrant of Space and Time boss with cast-driven attacks, and
// Cosmic Voyages (a Starmap that takes you to an asteroid field subworld).
// ---------------------------------------------------------------------------
'use strict';

function defSAItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
defSAItem('starfarers_guide', "Starfarer's Guide", { max: 1, rarity: 3, value: 0, tooltip: 'Use to choose your Starfarer (Asphodene or Eridani), open the Stellar Array (U) and read about the Stellar Nova (X)', drawIcon: (x) => { x.fillStyle = '#20204a'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#ffe080'; x.fillRect(7, 4, 2, 2); x.fillRect(4, 8, 2, 2); x.fillRect(10, 9, 2, 2); x.fillStyle = '#c0a0ff'; x.fillRect(2, 2, 12, 1); }, onUse: (g) => StarsAbove.openGuide(g) });
defSAItem('spatial_tear', 'Spatial Tear', { max: 20, consumable: true, rarity: 3, value: 20000, tooltip: 'Summons the Vagrant of Space and Time. Any time, anywhere', drawIcon: (x) => { x.fillStyle = '#101030'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#c0a0ff'; x.beginPath(); x.moveTo(3, 8); x.lineTo(7, 5); x.lineTo(9, 9); x.lineTo(13, 6); x.lineTo(11, 11); x.lineTo(6, 10); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(8, 7, 2, 2); } });
RECIPES.push({ result: 'spatial_tear', count: 1, station: 'anvil', ing: [['fallen_star', 8], ['gold_bar', 5], ['lens', 2]] });
defSAItem('spatial_shard', 'Spatial Shard', { max: 999, material: true, rarity: 3, value: 2000, tooltip: 'A fragment of torn space. Crafts the Starmap and Aspected gear', drawIcon: (x) => { x.fillStyle = '#c0a0ff'; x.beginPath(); x.moveTo(8, 1); x.lineTo(12, 9); x.lineTo(8, 15); x.lineTo(4, 9); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 5, 2, 3); } });
defSAItem('starfarers_blade', "Starfarer's Blade", { max: 1, damage: 26, useTime: 22, knockback: 5, rarity: 3, value: 60000, aspected: true, tooltip: 'Aspected weapon: click to slash (26 damage). Hold to charge, release for a Stellar Slash wave that pierces (up to 3x damage). Its damage type follows your Starfarer', icon: { kind: 'sword', mat: 'stellar' }, use: (g, s, it) => StarsAbove.useBlade(g, s, it) });
MATERIALS.stellar = { M: '#f0e0ff', m: '#a080e0', d: '#503080' };
RECIPES.push({ result: 'starfarers_blade', count: 1, station: 'anvil', ing: [['spatial_shard', 8], ['gold_bar', 10]] });
defSAItem('starmap', 'Starmap', { max: 1, rarity: 3, value: 50000, tooltip: 'Celestial Cartography: use to voyage to the Asteroid Field (rare materials). Use again there to come home', drawIcon: (x) => { x.fillStyle = '#f0e8d0'; x.fillRect(2, 3, 12, 10); x.fillStyle = '#20204a'; x.fillRect(3, 4, 10, 8); x.fillStyle = '#ffe080'; x.fillRect(5, 6, 1, 1); x.fillRect(9, 5, 1, 1); x.fillRect(7, 9, 1, 1); x.fillRect(11, 8, 1, 1); x.strokeStyle = '#ffe080'; x.lineWidth = 0.5; x.beginPath(); x.moveTo(5.5, 6.5); x.lineTo(9.5, 5.5); x.lineTo(11.5, 8.5); x.lineTo(7.5, 9.5); x.stroke(); }, onUse: (g) => StarsAbove.voyage(g) });
RECIPES.push({ result: 'starmap', count: 1, station: 'anvil', ing: [['spatial_shard', 10], ['lens', 3]] });
defSAItem('astral_ore', 'Astral Ore', { max: 999, material: true, rarity: 3, value: 1500, tooltip: 'Ore from the asteroid field. Smelt into Astral Bars', drawIcon: (x) => { x.fillStyle = '#404050'; x.fillRect(2, 4, 12, 9); x.fillStyle = '#80e0ff'; x.fillRect(4, 6, 3, 3); x.fillRect(9, 8, 3, 3); x.fillStyle = '#fff'; x.fillRect(5, 6, 1, 1); } });
defSAItem('astral_bar', 'Astral Bar', { max: 999, material: true, rarity: 3, value: 5000, tooltip: 'Forged from Astral Ore', drawIcon: (x) => { x.fillStyle = '#60c0e0'; x.fillRect(2, 6, 12, 6); x.fillStyle = '#c0f8ff'; x.fillRect(2, 6, 12, 1); x.fillStyle = '#306080'; x.fillRect(2, 11, 12, 1); } });
RECIPES.push({ result: 'astral_bar', count: 1, station: 'furnace', ing: [['astral_ore', 4]] });
defTool('astral_pickaxe', 'Astral Pickaxe', 'pick', 'stellar', 75, 14, 12, 3); RECIPES.push({ result: 'astral_pickaxe', count: 1, station: 'anvil', ing: [['astral_bar', 12]] }); ITEM_VALUES.astral_pickaxe = 80000; ITEMS.astral_pickaxe.value = 80000;
defAccessory('astral_charm', 'Astral Charm', { rarity: 3, value: 60000, defense: 2, stellarWeight: 2, tooltip: '+2 defense, +10% damage, +2 Stellar Array weight' });
ITEMS.astral_charm.drawIcon = (x) => { x.fillStyle = '#80e0ff'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 7; x.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 7, 2, 2); };
RECIPES.push({ result: 'astral_charm', count: 1, station: 'anvil', ing: [['astral_bar', 6], ['spatial_shard', 2]] });
defSAItem('vagrant_trophy', 'Vagrant Trophy', { max: 99, rarity: 1, value: 10000, tile: T.PLATFORM, tooltip: 'A collectible trophy (place it like a platform)' });
defSAItem('vagrant_mask', 'Vagrant Mask', { max: 1, rarity: 3, value: 7500, armor: 'head', defense: 3, tooltip: 'A collectible mask', icon: { kind: 'helmet', mat: 'stellar' } });
// Aspected damage: astral (magic-like ranged) or umbral (melee-like) depending on the Starfarer

// Starfarers ----------------------------------------------------------------------------------
const STARFARERS = {
  asphodene: { name: 'Asphodene', title: 'Master of Astral', color: '#80c0ff', hair: '#f0f0ff', dress: '#4060c0',
    lines: { greet: ['Hi! I am Asphodene. The stars sent me to keep an eye on you.', "Let's get going, then. Adventure!"], bossSpawn: ['A boss! Focus. Watch its patterns, not its face.', 'Here it comes. I believe in you!', 'Big one. Keep your feet moving.'], bossKilled: ['You did it! I knew you would.', 'Amazing! The stars felt that one.', 'Victory! Loot first, celebrate second.'], night: ['The stars are out. Aren\'t they pretty?', 'Night already? Time flies when you\'re mining.'], lowHp: ['You\'re hurt! Heal, please!', 'Careful! That was close.'], biome: { Desert: 'Sand in everything. Everything!', 'Snow Biome': 'Brr! I can see my breath. Can you?', Jungle: 'So green. So many things that bite.', Caverns: 'Deep down here... watch for bats.', 'The Underworld': 'This is where the map ends. Careful.', Lake: 'A lake! Fish are friends. Also food.', 'Shrine Grounds': 'A shrine! Say a prayer for good loot.' }, nova: ['Astral Blaze - go!', 'Stars, fall!'] } },
  eridani: { name: 'Eridani', title: 'Master of Umbral', color: '#c080ff', hair: '#302040', dress: '#402060',
    lines: { greet: ['I am Eridani. Try not to die before this gets interesting.', 'Lead the way. I will follow, reluctantly.'], bossSpawn: ['Finally, something worth cutting.', 'A boss. Do not waste my time by dying.', 'It bleeds. That is all you need to know.'], bossKilled: ['Acceptable.', 'It fell. As they all do.', 'Good. Now the real work: the loot.'], night: ['Darkness. My favourite hour.', 'The night hides many blades. Yours should be one of them.'], lowHp: ['Your life is low. Fix it.', 'Bleeding already? Pathetic. Heal.'], biome: { Desert: 'Sand. Dry. Tedious.', 'Snow Biome': 'Cold sharpens the mind.', Jungle: 'Everything here wants to eat you. Good motivation.', Caverns: 'Deep. Dark. Better.', 'The Underworld': 'Fire and stone. I approve.', Lake: 'Water. Do not fall in with armor on.', 'Shrine Grounds': 'A shrine. Superstition, mostly.' }, nova: ['Umbral Blade.', 'Be cut.'] } },
};
const STELLAR_ARRAY = [
  { id: 'vigor', name: 'Vigor', tier: 1, w: 1, desc: '5% damage reduction, +2 life regeneration', apply: (p, pm) => { pm.modDr = (pm.modDr || 0) + 0.05; pm.regenAdd += 2; } },
  { id: 'swift', name: 'Swift', tier: 1, w: 1, desc: '+10% movement speed', apply: (p, pm) => { pm.move *= 1.1; } },
  { id: 'sharpened', name: 'Sharpened', tier: 1, w: 2, desc: '+8% damage', apply: (p, pm) => { pm.dmg *= 1.08; } },
  { id: 'thick_skin', name: 'Thick Skin', tier: 1, w: 2, desc: '+4 defense', apply: (p, pm) => { pm.defAdd += 4; } },
  { id: 'vampiric', name: 'Vampiric', tier: 2, w: 2, desc: 'Heal 2% of damage dealt', apply: () => {} },
  { id: 'starlit_regen', name: 'Starlit Regeneration', tier: 2, w: 2, desc: '+3 life regeneration', apply: (p, pm) => { pm.regenAdd += 3; } },
  { id: 'critical_focus', name: 'Critical Focus', tier: 2, w: 2, desc: '+8% critical strike chance', apply: (p, pm) => { pm.crit += 8; } },
  { id: 'momentum', name: 'Momentum', tier: 2, w: 3, desc: '+15% attack speed', apply: (p, pm) => { pm.useTime *= 0.85; } },
  { id: 'astral_barrier', name: 'Astral Barrier', tier: 3, w: 3, desc: 'A barrier absorbs 30 damage, recharging every 30 s', apply: () => {} },
  { id: 'second_wind', name: 'Second Wind', tier: 3, w: 3, desc: 'Once per minute, fatal damage leaves you at 50% life instead', apply: () => {} },
  { id: 'overdrive', name: 'Overdrive', tier: 3, w: 3, desc: '+20% damage, -6 defense', apply: (p, pm) => { pm.dmg *= 1.2; pm.defAdd -= 6; } },
  { id: 'starfall', name: 'Starfall', tier: 3, w: 3, desc: '10% chance on hit to call down a falling star (40 damage)', apply: () => {} },
];
const StarsAbove = {
  state(game) { return ModLib.player(game, 'starsabove', () => ({ starfarer: null, array: [], nova: 0, barrier: 30, barrierCd: 0, secondWindCd: 0, chatT: 0, bubble: null, bubbleT: 0, greeted: false, charge: 0 })); },
  bossCount(game) { const w = Subworlds.snapshot ? Subworlds.snapshot.world : game.world; return Object.keys(w.bossesDefeated || {}).length + (w.bossDefeated ? 1 : 0); },
  weight(game) { const p = game.player; let w = 3 + this.bossCount(game); for (const a of [...p.accessories, ...Object.values(p.equipment || {})]) if (a && ITEMS[a.id].stellarWeight) w += ITEMS[a.id].stellarWeight; return w; },
  used(game) { const s = this.state(game); return s.array.reduce((a, id) => a + (STELLAR_ARRAY.find(x => x.id === id) || { w: 0 }).w, 0); },
  tierUnlocked(game, tier) { const n = this.bossCount(game); return tier === 1 || (tier === 2 && n >= 2) || (tier === 3 && n >= 4); },
  has(game, id) { return this.state(game).array.includes(id); },
  toggle(game, id) {
    const s = this.state(game), a = STELLAR_ARRAY.find(x => x.id === id);
    if (s.array.includes(id)) { s.array = s.array.filter(x => x !== id); Audio_.play('menu'); return; }
    if (!this.tierUnlocked(game, a.tier)) { game.message(`Tier ${a.tier} unlocks after ${a.tier === 2 ? 2 : 4} bosses.`, '#ff8080'); return; }
    if (this.used(game) + a.w > this.weight(game)) { game.message('Not enough Stellar Array weight.', '#ff8080'); return; }
    s.array.push(id); Audio_.play('craft');
  },
  say(game, kind, key) {
    const s = this.state(game); if (!s.starfarer) return; const sf = STARFARERS[s.starfarer];
    let pool = sf.lines[kind]; if (kind === 'biome') pool = sf.lines.biome[key] ? [sf.lines.biome[key]] : null;
    if (!pool || !pool.length) return;
    s.bubble = `${sf.name}: ${choose(pool)}`; s.bubbleT = 240;
  },
  choose(game, id) { const s = this.state(game); s.starfarer = id; s.greeted = true; this.say(game, 'greet'); game.message(`${STARFARERS[id].name}, ${STARFARERS[id].title}, is now your Starfarer.`, STARFARERS[id].color); Audio_.play('levelup'); },
  openGuide(game) { UI.arrayOpen = !UI.arrayOpen; Audio_.play('open'); },
  tick(game) {
    const s = this.state(game), p = game.player;
    if (s.bubbleT > 0 && --s.bubbleT === 0) s.bubble = null;
    if (s.starfarer) {
      // ambient chatter
      if (++s.chatT > 60 * 60 && Math.random() < 0.002) { s.chatT = 0; this.say(game, game.world.isDay() ? 'greet' : 'night'); }
      if (p.hp < p.maxHp * 0.25 && !p.dead && s.chatT % 600 === 300) this.say(game, 'lowHp');
    }
    // Astral Barrier recharge
    if (this.has(game, 'astral_barrier')) { if (!s.barrierOn) { s.barrierOn = true; s.barrier = 30; s.barrierCd = 0; } if (s.barrierCd > 0) { s.barrierCd--; if (s.barrierCd === 0) s.barrier = 30; } } else { s.barrier = 0; s.barrierOn = false; }
    if (s.secondWindCd > 0) s.secondWindCd--;
    // charged attack release
    if (s.charge > 0 && !game.mouse.left) this.releaseBlade(game);
    // nova gauge slowly decays out of combat
    if (!game.enemies.length && s.nova > 0 && game.world.time % 120 === 0) s.nova = Math.max(0, s.nova - 1);
  },
  mods(p, pm, game) {
    const s = this.state(game);
    for (const id of s.array) { const a = STELLAR_ARRAY.find(x => x.id === id); if (a) a.apply(p, pm, game); }
    if (s.novaActive > 0) { s.novaActive--; if (s.starfarer === 'eridani') pm.dmg *= 1.25; }
  },
  incoming(p, amount, game) { const s = this.state(game); if (s.barrier > 0 && s.barrierCd === 0) { const a = Math.min(s.barrier, amount); s.barrier -= a; amount -= a; if (s.barrier <= 0) { s.barrierCd = 30 * 60; game.addDamageText(p.cx, p.y - 10, 'Barrier broken', '#80e0ff'); } } s.nova = Math.min(100, s.nova + 3); return amount; },
  fatal(p, game) { const s = this.state(game); if (this.has(game, 'second_wind') && s.secondWindCd === 0) { s.secondWindCd = 60 * 60; p.hp = Math.round(p.maxHp * 0.5); p.invuln = 90; game.message('Second Wind!', '#80e0ff'); FX.flash('#80e0ff', 20, 0.5); return true; } return false; },
  onHit(game, e, dmg) {
    const s = this.state(game), p = game.player;
    s.nova = Math.min(100, s.nova + 2);
    if (this.has(game, 'vampiric') && p.hp < p.maxHp) { const h = Math.max(1, Math.round(dmg * 0.02)); p.hp = Math.min(p.maxHp, p.hp + h); }
    if (this.has(game, 'starfall') && Math.random() < 0.1) { FX.telegraph(e.cx, e.cy - 300, e.cx, e.cy, '#ffe080', 10, 3); e.hit(40, e.cx, 3, game); FX.burst(game, e.cx, e.cy, 10, '#ffe080', 4, 25); }
  },
  useNova(game) {
    const s = this.state(game), p = game.player;
    if (!s.starfarer) { game.message('Choose a Starfarer first (use the Starfarer\'s Guide).', '#ff8080'); return; }
    if (s.nova < 100) { game.message(`Stellar Nova: ${Math.floor(s.nova)}%`, '#ff8080'); return; }
    s.nova = 0; const mult = 1 + this.bossCount(game) * 0.25; this.say(game, 'nova');
    if (s.starfarer === 'asphodene') {
      // Astral Blaze: stars rain over the area around the player for 3 s
      s.blaze = 180; FX.flash('#80c0ff', 15, 0.4); FX.shake(3, 20);
      game.message('Stellar Nova: Astral Blaze!', '#80c0ff');
    } else {
      // Umbral Blade: a huge slash around the player
      for (const e of game.enemies) if (dist(e.cx, e.cy, p.cx, p.cy) < 14 * TILE) e.hit(Math.round(120 * mult), p.cx, 10, game);
      s.novaActive = 60 * 6; p.invuln = 40; FX.flash('#c080ff', 20, 0.5); FX.shake(8, 20); FX.ring(game, p.cx, p.cy, 40, '#c080ff', 8, 40);
      game.message('Stellar Nova: Umbral Blade! +25% damage for 6 s.', '#c080ff');
    }
    Audio_.play('levelup');
  },
  tickNova(game) {
    const s = this.state(game), p = game.player;
    if (s.blaze > 0) { s.blaze--; if (s.blaze % 6 === 0) { const mult = 1 + this.bossCount(game) * 0.25; const x = p.cx + rand(-220, 220), y = p.y - 260; const b = new Projectile(x, y, rand(-1, 1), 9, { kind: 'seal', damage: Math.round(30 * mult), friendly: true, owner: p, knockback: 4, color: '#80c0ff' }); b.life = 60; b.ghost = false; b.trail = { color: '#80c0ff', len: 10, width: 4 }; b.glow = { color: 'rgba(128,192,255,0.9)', r: 14 }; game.projectiles.push(b); } }
  },
  // Aspected blade: click = slash, hold = charge, release = wave
  useBlade(game, slot, it) {
    const s = this.state(game), p = game.player, st = itemStats(slot);
    if (game.useHeld === 1) { p.startUse(slot.id, 4); game.swingId++; game.attackSwing(it, st); Audio_.play('swing'); s.charge = 1; return; }
    s.charge = Math.min(90, s.charge + 1); p.useTimer = 2; p.armAngle = -1.5;
    if (s.charge % 15 === 0) game.particles.push(new Particle(p.cx + p.dir * 14, p.y + 10, rand(-1, 1), rand(-1, 0), s.starfarer === 'eridani' ? '#c080ff' : '#80c0ff', 20, 2));
  },
  releaseBlade(game) {
    const s = this.state(game), p = game.player; const c = s.charge; s.charge = 0;
    if (c < 20) return;
    const slot = p.inventory.find(x => x && x.id === 'starfarers_blade'); if (!slot) return;
    const st = itemStats(slot); const mult = 1 + 2 * Math.min(1, (c - 20) / 70);
    const umbral = s.starfarer === 'eridani';
    const dx = game.mouse.wx - p.cx, dy = game.mouse.wy - (p.y + 14), d = Math.hypot(dx, dy) || 1; p.dir = dx < 0 ? -1 : 1;
    const b = new Projectile(p.cx, p.y + 14, dx / d * 9, dy / d * 9, { kind: 'bolt', damage: Math.round(st.damage * mult * p.pm.dmg), friendly: true, owner: p, knockback: 8, crit: Math.random() * 100 < st.crit + p.pm.crit, color: umbral ? '#c080ff' : '#80c0ff', hi: '#fff', pierce: 5 });
    b.life = 70; b.ghost = true; b.trail = { color: umbral ? '#c080ff' : '#80c0ff', len: 12, width: 8 }; b.glow = { color: umbral ? 'rgba(192,128,255,0.9)' : 'rgba(128,192,255,0.9)', r: 18 }; b.w = b.h = 14; b.x -= 4; b.y -= 4;
    game.projectiles.push(b); p.startUse(slot.id, 14); FX.shake(c >= 90 ? 3 : 1, 8); Audio_.play('swing');
    game.addDamageText(p.cx, p.y - 14, c >= 90 ? 'Stellar Slash!' : 'Slash', umbral ? '#c080ff' : '#80c0ff');
  },
  voyage(game) {
    if (Subworlds.current === 'asteroid_field') { Subworlds.exit(game, 'starmap'); return; }
    if (Subworlds.current) { game.message('The Starmap only works from your home world.', '#ff8080'); return; }
    Subworlds.enter(game, 'asteroid_field');
  },
  summonVagrant(game) {
    const p = game.player;
    const b = new Vagrant(p.cx + (Math.random() < 0.5 ? -400 : 400), p.y - 200);
    const m = (game.expert ? 1.7 : 1) * (game.master ? 1.5 : 1) * Calamity.enemyMult(game);
    b.maxHp = b.hp = Math.round(b.hp * m); b.damage = Math.round(b.damage * (game.expert ? 1.5 : 1));
    game.enemies.push(b); game.boss = b; BossLog.start(game, b);
    game.message('The Vagrant of Space and Time has appeared!', '#c040c0'); FX.flash('#c0a0ff', 20, 0.4); Audio_.play('zombie');
  },
  // HUD: nova gauge, starfarer sprite & bubble, charge bar
  draw(game) {
    const s = this.state(game), p = game.player, ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, z = game.renderer.zoom;
    if (s.starfarer) {
      const sf = STARFARERS[s.starfarer];
      // floating starfarer beside the player (world -> screen)
      const t = game.world.time; const fx = (p.cx - p.dir * 36 - game.cam.x) * z, fy = (p.y - 20 + Math.sin(t * 0.06) * 4 - game.cam.y) * z;
      ctx.save(); ctx.translate(fx, fy); ctx.scale(z / 2, z / 2);
      ctx.fillStyle = sf.color; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(0, 8, 16, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = sf.dress; ctx.fillRect(-5, 4, 10, 12); ctx.fillStyle = '#f2d6c0'; ctx.fillRect(-4, -6, 8, 10); ctx.fillStyle = sf.hair; ctx.fillRect(-5, -8, 10, 4); ctx.fillRect(-5, -4, 2, 8); ctx.fillRect(3, -4, 2, 8); ctx.fillStyle = '#000'; ctx.fillRect(1, -2, 2, 2);
      ctx.restore();
      // gauge
      const gx = 22, gy = H - 172;
      drawText(ctx, `Stellar Nova (${ModKeys.labelFor('KeyX')}) ${Math.floor(s.nova)}%`, gx, gy - 16, { size: 12, color: s.nova >= 100 ? '#fff' : sf.color });
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, gx, gy, 160, 8, 4); ctx.fill(); ctx.fillStyle = sf.color; roundRect(ctx, gx, gy, 160 * s.nova / 100, 8, 4); ctx.fill();
      if (s.nova >= 100) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; roundRect(ctx, gx, gy, 160, 8, 4); ctx.stroke(); }
      if (s.bubble) { const tw = Math.min(W - 40, measureText(ctx, s.bubble, 14) + 24); const bx = W / 2 - tw / 2, by = H - 220; ctx.globalAlpha = clamp(s.bubbleT / 30, 0, 1); ctx.fillStyle = 'rgba(20,20,50,0.9)'; roundRect(ctx, bx, by, tw, 30, 8); ctx.fill(); ctx.strokeStyle = sf.color; ctx.lineWidth = 2; roundRect(ctx, bx, by, tw, 30, 8); ctx.stroke(); drawText(ctx, s.bubble, W / 2, by + 7, { size: 14, align: 'center', color: '#fff' }); ctx.globalAlpha = 1; }
    }
    if (s.charge > 0) { const bw = 60; const bx = (p.cx - game.cam.x) * z - bw / 2, by = (p.y - game.cam.y) * z - 14; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, by, bw, 6); ctx.fillStyle = s.charge >= 90 ? '#fff' : '#c0a0ff'; ctx.fillRect(bx, by, bw * Math.min(1, s.charge / 90), 6); }
    if (s.barrier > 0) drawText(ctx, `Astral Barrier ${s.barrier}`, 22, H - 190, { size: 12, color: '#80e0ff' });
  },
  drawArray(game) {
    const s = this.state(game), ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    const bw = Math.min(640, W - 40), bh = 420, bx = W / 2 - bw / 2, by = H / 2 - bh / 2;
    ctx.fillStyle = 'rgba(10,10,40,0.95)'; roundRect(ctx, bx, by, bw, bh, 12); ctx.fill(); ctx.strokeStyle = '#c0a0ff'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 12); ctx.stroke();
    drawText(ctx, 'Stellar Array', bx + 20, by + 12, { size: 22, color: '#e0d0ff' });
    drawText(ctx, `Weight ${this.used(game)}/${this.weight(game)}   Bosses defeated: ${this.bossCount(game)}   Esc to close`, bx + bw - 20, by + 18, { size: 13, align: 'right', color: '#aaa' });
    // starfarer choice
    let y = by + 46;
    if (!s.starfarer) {
      drawText(ctx, 'Choose your Starfarer:', bx + 20, y, { size: 16, color: '#fff' }); y += 26;
      for (const id of ['asphodene', 'eridani']) { const sf = STARFARERS[id]; const w = 280; const hov = mouse.x >= bx + 20 && mouse.x < bx + 20 + w && mouse.y >= y && mouse.y < y + 30; ctx.fillStyle = hov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'; roundRect(ctx, bx + 20, y, w, 30, 6); ctx.fill(); drawText(ctx, `${sf.name} - ${sf.title}`, bx + 30, y + 6, { size: 15, color: sf.color }); UI.button(bx + 20, y, w, 30, 'starfarer_pick', id); y += 36; }
      drawText(ctx, 'Asphodene: Astral Blaze nova (rain of stars). Eridani: Umbral Blade nova (huge slash + damage buff).', bx + 20, y, { size: 12, color: '#bbb' }); y += 24;
    } else { const sf = STARFARERS[s.starfarer]; drawText(ctx, `Starfarer: ${sf.name}, ${sf.title}`, bx + 20, y, { size: 15, color: sf.color }); y += 26; }
    // abilities in 3 columns by tier
    const colW = (bw - 40) / 3;
    for (let tier = 1; tier <= 3; tier++) {
      const cx = bx + 20 + (tier - 1) * colW; let yy = y;
      const unlocked = this.tierUnlocked(game, tier);
      drawText(ctx, `Tier ${tier}${unlocked ? '' : ' (locked: ' + (tier === 2 ? 2 : 4) + ' bosses)'}`, cx, yy, { size: 14, color: unlocked ? '#ffe75a' : '#888' }); yy += 22;
      for (const a of STELLAR_ARRAY.filter(x => x.tier === tier)) {
        const on = s.array.includes(a.id); const h = 46;
        const hov = mouse.x >= cx && mouse.x < cx + colW - 10 && mouse.y >= yy && mouse.y < yy + h;
        ctx.fillStyle = on ? 'rgba(160,120,255,0.35)' : hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'; roundRect(ctx, cx, yy, colW - 10, h, 6); ctx.fill();
        if (on) { ctx.strokeStyle = '#c0a0ff'; ctx.lineWidth = 1.5; roundRect(ctx, cx, yy, colW - 10, h, 6); ctx.stroke(); }
        drawText(ctx, `${a.name}  (${a.w})`, cx + 8, yy + 5, { size: 13, color: unlocked ? '#fff' : '#777' });
        drawText(ctx, a.desc, cx + 8, yy + 24, { size: 11, color: '#bbb' });
        UI.button(cx, yy, colW - 10, h, 'array_toggle', a.id); yy += h + 6;
      }
    }
  },
};
ModKeys.bind('KeyU', 'Stellar Array', (g) => { UI.arrayOpen = !UI.arrayOpen; Audio_.play('open'); });
ModKeys.bind('KeyX', 'Stellar Nova', (g) => StarsAbove.useNova(g));
ModLib.onPlayerMods((p, pm, g) => StarsAbove.mods(p, pm, g));
ModLib.onIncoming((p, a, g) => StarsAbove.incoming(p, a, g));
ModLib.onFatal((p, g) => StarsAbove.fatal(p, g));
ModLib.on('bossSpawn', (g, b) => StarsAbove.say(g, 'bossSpawn'));
ModLib.on('bossKilled', (g, b) => StarsAbove.say(g, 'bossKilled'));
ModLib.on('biome', (g, name) => StarsAbove.say(g, 'biome', name));
ModLib.on('enemyHit', (g, e, dmg) => StarsAbove.onHit(g, e, dmg));

// Asteroid field subworld (Cosmic Voyage) --------------------------------------------------
Subworlds.register('asteroid_field', {
  name: 'Asteroid Field', sub: 'The Moirae Galaxy', w: 260, h: 150, daylight: 0.5, sky: ['#05051a', '#101035'], stars: true, time: 0, exitHint: 'Use the Starmap to return home', loadingText: 'Charting a course through the Moirae Galaxy', tip: 'Astral Ore hides inside the larger asteroids.',
  generate(w, game) {
    const rng = mulberry32(w.seed);
    // landing platform
    for (let x = 20; x < 46; x++) w.rawSet(x, 40, T.STONEBRICK); w.rawSet(22, 39, T.TORCH); w.rawSet(44, 39, T.TORCH);
    // asteroids: discs of stone with astral ore cores
    for (let i = 0; i < 60; i++) {
      const cx = 20 + Math.floor(rng() * (w.w - 40)), cy = 10 + Math.floor(rng() * (w.h - 20)), r = 3 + Math.floor(rng() * 8);
      if (Math.abs(cx - 33) < 20 && Math.abs(cy - 40) < 12) continue;
      SubGen.disc(w, cx, cy, r, T.STONE, rng);
      if (r >= 6) SubGen.disc(w, cx, cy, Math.max(1, r - 4), T.ASTRAL_ORE, rng);
      if (rng() < 0.3) w.rawSet(cx, cy - r - 1, T.TORCH);
    }
    w.spawnX = 33; w.spawnY = 40; w.surfaceLine = w.h; w.cavernLine = w.h;
    SubGen.finish(w);
  },
  onEnter(game) { game.message('Cosmic Voyage: mine the asteroids for Astral Ore. Use the Starmap to return.', '#80e0ff'); },
});

// The Vagrant of Space and Time ----------------------------------------------------------------
const VAGRANT_CASTS = [
  { id: 'rend', name: 'Spatial Rend', cast: 45, dur: 120 },
  { id: 'barrage', name: 'Temporal Barrage', cast: 40, dur: 220 },
  { id: 'rifts', name: 'Chronal Rifts', cast: 50, dur: 240 },
  { id: 'timestop', name: 'Time Stop', cast: 70, dur: 200 },
];
class Vagrant extends Enemy {
  constructor(x, y) {
    super(x, y, 30, 50, { name: 'The Vagrant of Space and Time', hp: 3200, damage: 32, defense: 12, kbResist: 1, blood: '#c0a0ff', drops: [] });
    this.isBoss = true; this.type = 'vagrant'; this.flying = true; this.cast = null; this.castT = 0; this.phaseT = 0; this.cooldown = 90; this.ci = 0; this.glow = { color: 'rgba(192,160,255,0.8)', r: 40, a: 0.4 }; this.trail = { color: 'rgba(192,160,255,0.5)', len: 8, width: 6 };
  }
  update(world, game) {
    this.t++;
    if (this.hitFlash > 0) this.hitFlash--;
    this.tickDebuffs(game); if (this.dead) return;
    const p = game.player;
    if (p.dead) { this.dead = true; game.boss = null; game.onBossDespawn(this); return; }
    const tx = p.cx + (this.cx < p.cx ? -1 : 1) * 160, ty = p.y - 120 + Math.sin(this.t * 0.03) * 20;
    if (!this.cast || this.cast.id !== 'rend' || this.castT < this.cast.cast) { this.vx = lerp(this.vx, clamp((tx - this.cx) / 30, -4, 4), 0.06); this.vy = lerp(this.vy, clamp((ty - this.cy) / 30, -3, 3), 0.06); this.x += this.vx; this.y += this.vy; }
    if (this.y < 16) this.y = 16;
    this.dir = p.cx < this.cx ? -1 : 1;
    const aggr = 1 + (1 - this.hp / this.maxHp) * 0.7;
    if (!this.cast) { if (--this.cooldown <= 0) { this.cast = VAGRANT_CASTS[this.ci++ % VAGRANT_CASTS.length]; this.castT = 0; this.phaseT = 0; game.message(`The Vagrant casts ${this.cast.name}`, '#c0a0ff'); Audio_.play('menu'); } }
    else if (this.castT < this.cast.cast) { this.castT++; if (this.cast.id === 'rend' && this.castT % 12 === 0) { const a = rand(0, Math.PI * 2); this.rends = this.rends || []; this.rends.push(a); FX.telegraph(p.cx + Math.cos(a) * 320, p.cy + Math.sin(a) * 320, p.cx - Math.cos(a) * 320, p.cy - Math.sin(a) * 320, '#c0a0ff', this.cast.cast - this.castT + 10, 6); } }
    else {
      const t = ++this.phaseT, dmg = Math.round(this.damage * 0.7);
      switch (this.cast.id) {
        case 'rend': if (t % 30 === 1 && this.rends && this.rends.length) { const a = this.rends.shift(); const sx = p.cx + Math.cos(a) * 320, sy = p.cy + Math.sin(a) * 320; this.x = sx - this.w / 2; this.y = sy - this.h / 2; FX.burst(game, sx, sy, 12, '#c0a0ff', 4, 25); for (let k = 0; k < 5; k++) { const b = Gensokyo.bullet(game, sx, sy, -Math.cos(a) * (10 + k), -Math.sin(a) * (10 + k), { owner: this, color: '#c0a0ff', hi: '#fff', damage: dmg + 6, sourceName: "the Vagrant's spatial rend", size: 5, life: 90 }); b.trail = { color: '#e0d0ff', len: 10, width: 4 }; } FX.shake(3, 8); } break;
        case 'barrage': if (t % Math.round(10 / aggr) === 0) { const a = t * 0.3; for (let k = 0; k < 2; k++) { const aa = a + k * Math.PI; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(aa) * 3, Math.sin(aa) * 3, { owner: this, color: '#8060ff', hi: '#e0d0ff', damage: dmg, sourceName: "the Vagrant's temporal barrage", size: 5, life: 300 }); b.glow = { color: 'rgba(160,120,255,0.8)', r: 10 }; } } break;
        case 'rifts': if (t % 60 === 1) { const b = Gensokyo.bullet(game, p.cx + rand(-200, 200), p.cy - 200, 0, 1, { owner: this, color: '#4020a0', hi: '#c0a0ff', damage: dmg + 4, sourceName: "the Vagrant's chronal rift", size: 9, life: 400, homing: 0.25 }); b.glow = { color: 'rgba(120,80,255,0.9)', r: 22 }; b.trail = { color: '#8060ff', len: 14, width: 6 }; } break;
        case 'timestop': if (t === 1) { p.timeStopped = 90; FX.flash('#ffffff', 20, 0.5); game.message('Time stops around you...', '#c0e0ff'); Audio_.play('close'); } if (t < 90 && t % 6 === 0) { const a = t * 0.25; const b = Gensokyo.bullet(game, this.cx, this.cy, Math.cos(a) * 2.2, Math.sin(a) * 2.2, { owner: this, color: '#e0d0ff', hi: '#fff', damage: dmg, sourceName: "the Vagrant's time stop", size: 5, life: 300 }); b.frozenUntil = 90 - t; } break;
      }
      if (this.phaseT >= this.cast.dur) { this.cast = null; this.rends = null; this.cooldown = Math.round(80 / aggr); }
    }
    if (Math.abs(this.cx - p.cx) > 80 * TILE) { this.x = p.cx + 200; this.y = p.y - 150; }
    this.touchPlayer(p, game);
  }
  die(game) {
    super.die(game); game.boss = null;
    for (const b of game.projectiles) if (b.hostile) b.dead = true;
    game.world.bossesDefeated = game.world.bossesDefeated || {}; game.world.bossesDefeated.vagrant = true;
    game.message('The Vagrant of Space and Time has been defeated!', '#ffe75a'); Audio_.play('levelup'); FX.flash('#c0a0ff', 30, 0.5); FX.shake(8, 30);
    game.dropItem(this.cx, this.cy, 'spatial_shard', randInt(12, 20)); game.dropItem(this.cx, this.cy, 'lesser_healing', randInt(4, 8)); game.dropItem(this.cx, this.cy, 'fallen_star', randInt(5, 10));
    if (Math.random() < 0.5 || game.expert) game.dropItem(this.cx, this.cy, 'starfarers_blade', 1);
    if (Math.random() < 0.1) game.dropItem(this.cx, this.cy, 'vagrant_trophy', 1); if (Math.random() < 0.14) game.dropItem(this.cx, this.cy, 'vagrant_mask', 1, null, null);
    game.dropCoins(this.cx, this.cy, 40000 * (game.expert ? 2.5 : 1));
    if (game.expert) game.dropItem(this.cx, this.cy, 'mastery_shard', 1, null, null);
  }
  draw(ctx, camX, camY) {
    const x = snap(this.cx - camX), y = snap(this.cy - camY);
    ctx.save(); ctx.globalAlpha = this.hitFlash > 0 ? 0.6 : 0.95;
    ctx.fillStyle = '#20104a'; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 18, y + 24); ctx.lineTo(x - 18, y + 24); ctx.closePath(); ctx.fill(); // cloak
    ctx.fillStyle = '#c0a0ff'; ctx.beginPath(); ctx.arc(x, y - 22, 9, 0, Math.PI * 2); ctx.fill(); // hood glow
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 5, y - 24, 3, 3); ctx.fillRect(x + 2, y - 24, 3, 3);
    ctx.strokeStyle = '#e0d0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 30 + Math.sin(this.t * 0.1) * 3, this.t * 0.05, this.t * 0.05 + Math.PI * 1.3); ctx.stroke();
    if (this.cast && this.castT < this.cast.cast) { const f = this.castT / this.cast.cast; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - 30, y - 44, 60, 6); ctx.fillStyle = '#c0a0ff'; ctx.fillRect(x - 30, y - 44, 60 * f, 6); drawText(ctx, this.cast.name, x, y - 62, { size: 12, align: 'center', color: '#e0d0ff' }); }
    ctx.restore();
  }
}
BOSSES.push({ id: 'vagrant', name: 'The Vagrant of Space and Time', order: 5, hp: 3200, summon: 'spatial_tear',
  spawn: 'Use a Spatial Tear (8 Fallen Stars + 5 Gold Bars + 2 Lenses at an Anvil). Any time, anywhere.',
  info: 'A wanderer from beyond. Every attack is a Cast: a bar fills above it and the attack name is shown, then it strikes - Spatial Rend (teleporting slashes along telegraphed lines), Temporal Barrage, homing Chronal Rifts and a Time Stop that holds you in place. Your Starfarer has plenty to say about it.',
  loot: ['spatial_shard', 'starfarers_blade', 'fallen_star'], collectibles: ['vagrant_trophy', 'vagrant_mask'], despawn: 'The Vagrant slips between moments...' });

// Astral Ore tile
T.ASTRAL_ORE = 46;
defTile(T.ASTRAL_ORE, { name: 'Astral Ore', hp: 220, drop: 'astral_ore', color: '#404050', mapColor: '#80e0ff', light: [0.15, 0.35, 0.45], minPower: 50 });
TILE_PAINTERS[T.ASTRAL_ORE] = (c, r) => { TILE_PAINTERS[T.STONE](c, r); blobs(c, r, ['#ffffff', '#80e0ff', '#3080a0'], 4, 2); };
