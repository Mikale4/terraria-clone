// ---------------------------------------------------------------------------
// Townsfolk & companions: Better Friendly NPCs (town NPCs scale with your boss
// progress, retreat home when hurt, resist damage at home, regenerate faster
// while resting, strike back), Enraged Townsfolk (NPCs hit by enemies enrage:
// faster attacks and movement, reduced damage, a red aura), TerraGuardians
// (non-human guardian companions that wander into your world, can be recruited,
// give quests, follow or stay, and carry you) and the Pets Overhaul: Calamity
// Addon (an extra unique effect for every pet and light pet).
// ---------------------------------------------------------------------------
'use strict';

const Townsfolk = { cfg: { scale: true, retreat: true, homeDr: true, critBack: true, invincible: false, enrage: true, guardians: true } };
ModList.register('better_friendly_npcs', 'Better Friendly NPCs', { workshop: 2568214360, desc: 'Town NPCs scale with your boss progress, go home when hurt, take less damage near home, regenerate while resting and strike back.', cfg: [ModList.bool(Townsfolk.cfg, 'scale', 'Scale with bosses'), ModList.bool(Townsfolk.cfg, 'retreat', 'Return home when hurt'), ModList.bool(Townsfolk.cfg, 'homeDr', 'Damage reduction at home'), ModList.bool(Townsfolk.cfg, 'critBack', 'Strike back on hit'), ModList.bool(Townsfolk.cfg, 'invincible', 'Invincible town NPCs')] });
ModList.register('enraged_townsfolk', 'Enraged Townsfolk', { workshop: 2803487213, desc: 'Town NPCs enrage for a while after enemies hit them: faster attacks and movement, 30% less damage taken, a red aura.', cfg: [ModList.bool(Townsfolk.cfg, 'enrage', 'Enrage')] });
ModList.register('terraguardians', 'TerraGuardians Mod', { workshop: 2967694381, desc: 'Guardian companions wander into your world: recruit them, chat, take their quests, ask them to follow or stay, and ride the big ones.', cfg: [ModList.bool(Townsfolk.cfg, 'guardians', 'Guardians appear')] });
ModList.register('pets_overhaul_calamity', 'Pets Overhaul: Calamity Addon', { workshop: 3352461632, desc: 'Every pet and light pet gains one more unique effect.', builtin: true });

// === Better Friendly NPCs + Enraged Townsfolk =========================================================
ModList.current = 'better_friendly_npcs';
ModLib.patch(() => {
  const baseUpdate = NPC.prototype.update, baseHit = NPC.prototype.hit, baseDefend = NPC.prototype.defend;
  Object.defineProperty(NPC.prototype, 'defense', { get() { let d = 15 + (this.world && this.world.bossDefeated ? 3 : 0); if (Townsfolk.cfg.scale && ModList.on('better_friendly_npcs') && window.game) d += 2 * ModLib.bossCount(window.game); return d; }, configurable: true });
  NPC.prototype.update = function (world, game) {
    const on = ModList.on('better_friendly_npcs'), town = this.def && this.def.town;
    if (on && town && Townsfolk.cfg.scale) { const want = 250 + 25 * ModLib.bossCount(game); if (this.maxHp !== want) { const frac = this.hp / this.maxHp; this.maxHp = want; this.hp = Math.round(want * frac); } }
    if (on && town && Townsfolk.cfg.retreat && this.home && this.hp < this.maxHp * 0.5 && !this.talking) {
      const atHome = Math.abs(this.cx - (this.home.homeX * TILE + 8)) < 40 && Math.abs(this.y - this.home.homeY * TILE) < 60;
      if (this.hp < this.maxHp * 0.2 && !atHome) { this.x = this.home.homeX * TILE + 8 - this.w / 2; this.y = (this.home.homeY + 1) * TILE - this.h; this.vx = 0; this.vy = 0; this.emote = '⌂'; this.emoteLife = 60; }
      else if (!atHome) { this.goHome(world, game); this.emote = this.emote || '⌂'; this.emoteLife = Math.max(this.emoteLife || 0, 10); this.vx = lerp(this.vx, this.moving * 1.2, 0.15); this.updateLiquidState(world); this.applyGravity(); this.moveAndCollide(world); if (this.collidedX && this.onGround) this.vy = -5; if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1; this.defend(world, game); return; }
    }
    if (this.enraged > 0) { this.enraged--; if (this.moving) this.x += this.vx * 0.5; if (world.time % 5 === 0) game.particles.push(new Particle(this.cx + rand(-10, 10), this.y + rand(0, this.h), 0, -1, '#ff4040', 20, 2)); }
    baseUpdate.call(this, world, game);
    // resting at home: doubled regeneration
    if (on && town && this.home && this.hp < this.maxHp && (this.sitting || (Math.abs(this.cx - (this.home.homeX * TILE + 8)) < 60)) && world.time % 30 === 0) this.hp = Math.min(this.maxHp, this.hp + 1);
  };
  NPC.prototype.hit = function (dmg, fromX, game) {
    const on = ModList.on('better_friendly_npcs'), town = this.def && this.def.town;
    if (on && town && Townsfolk.cfg.invincible) { this.hitFlash = 8; return; }
    if (on && town && Townsfolk.cfg.homeDr && this.home) { const d = Math.abs(this.cx - (this.home.homeX * TILE + 8)); if (d < 8 * TILE) dmg = Math.round(dmg * (1 - 0.5 * (1 - d / (8 * TILE)))); }
    if (this.enraged > 0 && this.def.weapon && /sword|knife|aura/.test(this.def.weapon.kind || '')) dmg = Math.round(dmg * 0.7);
    if (Townsfolk.cfg.enrage && ModList.on('enraged_townsfolk') && town && this.invuln <= 0) { if (!this.enraged) game.addDamageText(this.cx, this.y - 12, 'Enraged!', '#ff4040'); this.enraged = 300; }
    if (this.invuln <= 0 && on && town && Townsfolk.cfg.critBack && this.def.weapon && Math.random() < 0.35) { const e = ModLib.nearestEnemy(game, fromX, this.cy, 3 * TILE); if (e) { e.hit(Math.round(this.def.weapon.damage * 2 * (1 + 0.15 * ModLib.bossCount(game))), this.cx, 4, game, null, true); game.addDamageText(this.cx, this.y - 24, 'Counter!', '#ffe080'); } }
    return baseHit.call(this, dmg, fromX, game);
  };
  NPC.prototype.defend = function (world, game) {
    const w = this.def.weapon; if (!w) return baseDefend.call(this, world, game);
    const scaled = Townsfolk.cfg.scale && ModList.on('better_friendly_npcs') ? 1 + 0.15 * ModLib.bossCount(game) : 1;
    const dmg0 = w.damage; w.damage = Math.round(dmg0 * scaled); if (this.enraged > 0 && this.attackTimer > 1) this.attackTimer--;
    try { baseDefend.call(this, world, game); } finally { w.damage = dmg0; }
  };
  const baseDraw = NPC.prototype.draw;
  NPC.prototype.draw = function (ctx, camX, camY) { if (this.guardian) return this.drawGuardian(ctx, camX, camY); if (this.enraged > 0) { ctx.save(); ctx.shadowColor = '#ff4040'; ctx.shadowBlur = 8; baseDraw.call(this, ctx, camX, camY); ctx.restore(); return; } return baseDraw.call(this, ctx, camX, camY); };
});

// === TerraGuardians ==================================================================================
ModList.current = 'terraguardians';
const GUARDIANS = {
  blue: { name: 'Blue', species: 'fox guardian', colors: { fur: '#4a78d0', belly: '#c0d8ff', eye: '#ffe060' }, size: 1.35, hp: 180, weapon: { kind: 'sword', item: 'silver_broadsword', damage: 14, useTime: 20, reach: 60 }, ride: true,
    lines: { greet: ["Blue here. I've been looking for someone worth following.", "The winds of this world smell strange. Exciting, though.", "Stick close, I dash fast."], idle: ["I used to guard a village on the other side. Long story.", "Your world has too many slimes."], fight: ["Hah!", "Out of my way!"], levelup: ["Sharper every day."] }, quest: { id: 'blue_gel', name: "Blue's Request", desc: 'Blue wants 20 Gel for torches. Bring it and claim the reward.', type: 'collect', target: 'gel', count: 20, reward: [['silver_bar', 5]], coins: 3000 } },
  sardine: { name: 'Sardine', species: 'cat guardian', colors: { fur: '#e0a040', belly: '#fff0d0', eye: '#40c060' }, size: 0.8, hp: 90, weapon: { kind: 'shortsword', item: 'copper_shortsword', damage: 9, useTime: 12, reach: 36 },
    lines: { greet: ['Sardine! Tiny, fast, deadly. In that order.', 'Do you have fish? No? We can still be friends.', 'I climb things. Watch me.'], idle: ['I could nap on that chest.', 'Bigger guardians get all the attention. Rude.'], fight: ['Scratch scratch!', 'Too slow!'], levelup: ['Claws: sharper.'] }, quest: { id: 'sardine_fish', name: "Sardine's Craving", desc: 'Sardine would very much like 5 Bass.', type: 'collect', target: 'bass', count: 5, reward: [['tackle_box', 1]], coins: 2000 } },
  zacks: { name: 'Zacks', species: 'zombie guardian', colors: { fur: '#7a9a60', belly: '#a0b080', eye: '#ff4040' }, size: 1.25, hp: 260, weapon: { kind: 'sword', item: 'iron_broadsword', damage: 12, useTime: 26, reach: 56 }, ride: true,
    lines: { greet: ['Zacks. Yes, I am undead. No, I do not want your brains.', 'I make a decent wall. Stand behind me.', 'Night is my favourite time. Everyone else disagrees.'], idle: ['Do zombies count as family? I hope not.', 'My arm fell off once. It grew back. Mostly.'], fight: ['Grr!', 'You picked the wrong corpse!'], levelup: ['Still dead. Stronger dead.'] }, quest: { id: 'zacks_zombies', name: "Zacks' Relatives", desc: 'Zacks is embarrassed by the local zombies. Take care of 20 of them.', type: 'kill', target: 'zombie', count: 20, reward: [['bone_helm', 0], ['lesser_healing', 5]].filter(r => r[1]), coins: 6000 } },
  alex: { name: 'Alex', species: 'dog guardian', colors: { fur: '#c08040', belly: '#f0d8b0', eye: '#4a3020' }, size: 1.1, hp: 150, weapon: { kind: 'sword', item: null, damage: 11, useTime: 18, reach: 44 },
    lines: { greet: ['Alex! Good boy, ready to go!', 'I found this stick. It is the best stick.', 'Let us walk. And walk. And walk!'], idle: ['Squirrel? No... bunny!', 'I can smell treasure. Probably.'], fight: ['Bark!', 'Bite!'], levelup: ['Who is a good guardian? Me!'] }, quest: { id: 'alex_fetch', name: 'Fetch!', desc: 'Alex wants acorns. Ten of them. To bury, obviously.', type: 'collect', target: 'acorn', count: 10, coins: 1500 } },
  brutus: { name: 'Brutus', species: 'lion guardian', colors: { fur: '#d0a040', belly: '#f0e0b0', eye: '#8a4020' }, size: 1.5, hp: 300, weapon: { kind: 'sword', item: 'the_rotted_fork', damage: 18, useTime: 24, reach: 70 }, ride: true,
    lines: { greet: ['Brutus, at your command. Point me at the enemy.', 'A guardian protects. That is all there is to it.', 'I have carried kings. I can carry you.'], idle: ['Discipline is the sharpest blade.', 'Your base could use higher walls.'], fight: ['For honour!', 'Fall!'], levelup: ['My spear grows heavier. Good.'] }, quest: { id: 'brutus_skeletons', name: "Brutus' Drill", desc: 'Brutus wants to see you destroy 20 skeletons or bones.', type: 'kill', match: /Skeleton|Bones/, count: 20, reward: [['iron_bar', 10]], coins: 8000, cond: (g) => ModLib.beaten(g, 'eye_of_cthulhu') } },
  mabel: { name: 'Mabel', species: 'deer guardian', colors: { fur: '#b08060', belly: '#f0e0c0', eye: '#3a6a3a' }, size: 1.2, hp: 140, weapon: { kind: 'bow', item: null, damage: 12, useTime: 24, range: 14 * TILE },
    lines: { greet: ['Mabel. I prefer the forest, but your company will do.', 'My aim is true. Stay out of the line of fire.', 'Trees remember everything, you know.'], idle: ['The Dryad and I would get along.', 'A quiet evening would be nice.'], fight: ['Loose!', 'Stand still.'], levelup: ['Steadier hands.'] }, quest: { id: 'mabel_wood', name: "Mabel's Grove", desc: 'Mabel asks you to plant 5 acorns... or at least gather 50 wood for a proper home.', type: 'collect', target: 'wood', count: 50, reward: [['wooden_bow', 1], ['wooden_arrow', 60]], coins: 1000 } },
  vladimir: { name: 'Vladimir', species: 'bear guardian', colors: { fur: '#6a4a30', belly: '#a08060', eye: '#3a2a1a' }, size: 1.55, hp: 340, weapon: { kind: 'sword', item: null, damage: 16, useTime: 30, reach: 60 }, ride: true, healer: true,
    lines: { greet: ['Vladimir. Big, warm, good at hugs and better at fighting.', 'Come, sit by me. You look tired.', 'I will carry you if your legs give out.'], idle: ['Honey. Have you seen honey?', 'A bear needs a den. Build me one?'], fight: ['Bear hug!', 'Rawr!'], levelup: ['Stronger arms, softer hugs.'] }, quest: { id: 'vlad_honey', name: "Vladimir's Sweet Tooth", desc: 'Vladimir would love 10 Bee Wax... or honey blocks. Either works.', type: 'collect', target: 'bee_wax', count: 10, reward: [['honey_block', 20]], coins: 5000 } },
  cotton: { name: 'Cotton', species: 'rabbit guardian', colors: { fur: '#f0f0f0', belly: '#ffd0e0', eye: '#e04060' }, size: 0.95, hp: 110, weapon: { kind: 'spark', item: 'wand_of_sparking', damage: 13, useTime: 22, range: 7 * TILE },
    lines: { greet: ['Cotton! I do magic. Small magic. Growing magic.', 'Your world has the prettiest stars.', 'Do not step on my ears.'], idle: ['I would love a Mana Crystal. Just one.', 'Carrots are underrated.'], fight: ['Zap!', 'Sparkle!'], levelup: ['My sparks are getting bigger!'] }, quest: { id: 'cotton_stars', name: "Cotton's Wish", desc: 'Cotton wants 8 Fallen Stars to study.', type: 'collect', target: 'fallen_star', count: 8, reward: [['band_of_starpower', 1]], coins: 2000 } },
};
for (const id in GUARDIANS) {
  const gd = GUARDIANS[id];
  COMPANION_DEFS[id] = { name: gd.name, guardian: true, hairStyle: 0, colors: { skin: gd.colors.fur, hair: gd.colors.fur, shirt: gd.colors.belly, pants: gd.colors.fur, shoes: gd.colors.fur, eye: gd.colors.eye }, weapon: gd.weapon, starter: 'their own claws and gear', lines: gd.lines, size: gd.size, hp: gd.hp, ride: !!gd.ride, healer: !!gd.healer, species: gd.species,
    draw: (c, ctx, camX, camY) => { Guardians.draw(c, ctx, camX, camY, gd, c.def.size); return true; } };
  if (!ITEMS[`${id}_bag`]) { defItem(`${id}_bag`, { name: `${gd.name}'s Bag`, consumable: true, max: 1, rarity: 3, tooltip: `Summons ${gd.name} the ${gd.species} to your squad` }); ITEM_VALUES[`${id}_bag`] = 0; ITEMS[`${id}_bag`].value = 0; }
  if (gd.quest) { const extra = gd.quest.cond; NTerra.addQuest(Object.assign({ giver: gd.name }, gd.quest, { cond: (g) => g.companions.some(c => c.id === id) && (!extra || extra(g)) })); }
}
const Guardians = {
  state(g) { return ModLib.world(g, 'guardians', () => ({ met: {}, lastDay: -1 })); },
  draw(c, ctx, camX, camY, gd, size) {
    const x = snap(c.x - camX + 10), y = snap(c.y + (c.gfxOffY || 0) - camY + 42); const s = size || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (c.dir < 0 ? -1 : 1), s); if (c.ko > 0) { ctx.rotate(Math.PI / 2 * 0.9); ctx.globalAlpha = 0.8; } else if (c.hitFlash > 0) ctx.globalAlpha = 0.6;
    const f = gd.colors.fur, b = gd.colors.belly, walk = c.onGround && Math.abs(c.vx) > 0.2 ? Math.sin(c.walkPhase * Math.PI * 2) * 3 : 0;
    // legs, body, belly, head, ears, tail, eye
    ctx.fillStyle = shade(f, 0.8); ctx.fillRect(-8 + walk, -14, 6, 14); ctx.fillRect(2 - walk, -14, 6, 14);
    ctx.fillStyle = f; ctx.fillRect(-10, -34, 20, 22); ctx.fillStyle = b; ctx.fillRect(-6, -30, 12, 14);
    ctx.fillStyle = shade(f, 0.9); ctx.beginPath(); ctx.moveTo(-10, -26); ctx.quadraticCurveTo(-24, -30 + Math.sin(c.t * 0.1) * 4, -18, -14); ctx.lineTo(-10, -18); ctx.fill();
    ctx.fillStyle = f; ctx.fillRect(-8, -48, 18, 16); ctx.fillRect(6, -44, 8, 8);
    ctx.fillRect(-7, -56, 5, 10); ctx.fillRect(3, -56, 5, 10); ctx.fillStyle = b; ctx.fillRect(-6, -54, 3, 6); ctx.fillRect(4, -54, 3, 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(2, -44, 5, 4); ctx.fillStyle = gd.colors.eye; ctx.fillRect(4, -44, 3, 4); ctx.fillStyle = '#000'; ctx.fillRect(10, -40, 3, 2);
    // arm + held item
    ctx.save(); ctx.translate(8, -30); ctx.rotate(c.armAngle != null ? c.armAngle - Math.PI / 2 : 0.4); ctx.fillStyle = f; ctx.fillRect(-2, 0, 5, 12); const it = c.armAngle != null && c.def.weapon.item ? Sprites.icons[c.def.weapon.item] : null; if (it) { ctx.translate(0, 12); ctx.rotate(Math.PI * 3 / 4); ctx.drawImage(it, -2, -13, 16, 16); } ctx.restore();
    ctx.restore(); ctx.globalAlpha = 1;
  },
  // a wandering guardian you can talk to: an NPC subclass with the guardian look
  encounter(g, id) {
    const gd = GUARDIANS[id], p = g.player; const n = new NPC(p.cx + (Math.random() < 0.5 ? -1 : 1) * 260, p.y - 40, gd.name, 'Guardian'); n.guardian = id; n.noSave = true; n.leaveAt = g.world.time + Math.floor(g.world.dayLength / 3); n.t = 0; n.dir = 1; n.walkPhase = 0;
    n.drawGuardian = function (ctx, camX, camY) { this.t = (this.t || 0) + 1; Guardians.draw(this, ctx, camX, camY, gd, gd.size); };
    n.def = Object.assign({}, NPC_ROLES.Guardian, { lines: gd.lines.greet, buttons: ['Join me', 'Chat'], onButton: (game, npc, b) => { if (b === 'Chat') { game.dialog.text = choose([...gd.lines.greet, ...gd.lines.idle]); return; } if (b === 'Join me') { if (game.companions.length >= SQUAD_CAP) { game.dialog.text = `Your squad is full (${SQUAD_CAP}).`; return; } game.closeDialog(); npc.dead = true; const c = new Companion(id, npc.x, npc.y); c.maxHp = gd.hp; c.hp = gd.hp; game.companions.push(c); game.message(`${gd.name} the ${gd.species} joins your squad!`, '#ffe75a'); Audio_.play('levelup'); Guardians.state(game).met[id] = true; } } });
    g.npcs.push(n); g.message(`A ${gd.species} is wandering nearby... (${gd.name})`, '#c0ffc0');
  },
};
defTownNPC('Guardian', ['Guardian'], { skin: '#4a78d0', hair: '#4a78d0', shirt: '#c0d8ff', pants: '#4a78d0', shoes: '#4a78d0', eye: '#ffe060' }, () => false, ['...'], null, { town: false });
ModLib.patch(() => { const base = NPC.prototype.update; NPC.prototype.update = function (world, game) { base.call(this, world, game); if (this.guardian && this.leaveAt && world.time >= this.leaveAt && !this.dead && !this.talking) { this.dead = true; game.message(`${this.name} wanders off.`, '#c0c0ff'); } }; });
ModLib.on('tick', (g) => {
  if (!Townsfolk.cfg.guardians || !ModList.on('terraguardians') || g.world.isSub) return; const w = g.world, p = g.player, s = Guardians.state(g); const day = Math.floor(w.time / w.dayLength);
  if (w.isDay() && s.lastDay !== day && w.time % 200 === 100 && p.tileY < w.surfaceLine && Math.random() < 0.3 && !g.npcs.some(n => n.guardian) && !g.boss) { const pool = Object.keys(GUARDIANS).filter(id => !g.companions.some(c => c.id === id) && !s.met[id]); const pool2 = pool.length ? pool : Object.keys(GUARDIANS).filter(id => !g.companions.some(c => c.id === id)); if (pool2.length) { s.lastDay = day; Guardians.encounter(g, choose(pool2)); } }
  // guardians: bigger life pools, riding, healing hugs
  for (const c of g.companions) { const d = COMPANION_DEFS[c.id]; if (!d || !d.guardian) continue; const want = d.hp + 20 * (c.level - 1); if (c.maxHp < want) { c.maxHp = want; } c.w = 20; c.h = 42;
    if (c.order === 'carry' && c.ko === 0) { p.pm.move *= 1.25; p.pm.defAdd += 6; if (p.hp < p.maxHp && d.healer && w.time % 90 === 0) { p.hp += 1; } }
    if (d.healer && c.order !== 'carry' && p.hp < p.maxHp * 0.5 && dist(c.cx, c.cy, p.cx, p.cy) < 3 * TILE && w.time % 60 === 0) { p.hp = Math.min(p.maxHp, p.hp + 5); g.addDamageText(p.cx, p.y - 8, '+5 (hug)', '#ffb0c0'); }
  }
});
ModLib.patch(() => {
  const baseOpen = Game.prototype.openDialog, baseBtn = Game.prototype.dialogButton;
  Game.prototype.openDialog = function (npc) { baseOpen.call(this, npc); if (npc.isCompanion && COMPANION_DEFS[npc.id] && COMPANION_DEFS[npc.id].guardian) { const d = this.dialog; if (COMPANION_DEFS[npc.id].ride) d.buttons.splice(3, 0, npc.order === 'carry' ? 'Get off' : 'Carry me'); const q = NTerra.quests.find(x => x.giver === npc.name); if (q) d.buttons.splice(d.buttons.length - 1, 0, 'Quest'); if (npc.order === 'carry') { d.buttons = d.buttons.filter(b => b !== 'Stay here' && b !== 'Follow me'); } } };
  Game.prototype.dialogButton = function (b) { const d = this.dialog; if (d && d.npc && d.npc.isCompanion && COMPANION_DEFS[d.npc.id] && COMPANION_DEFS[d.npc.id].guardian) { const c = d.npc; if (b === 'Carry me') { c.order = 'carry'; d.text = 'Hop on. Hold tight!'; this.closeDialog(); return; } if (b === 'Get off') { c.order = 'follow'; d.text = 'Back on your own feet.'; this.closeDialog(); return; } if (b === 'Quest') { const q = NTerra.quests.find(x => x.giver === c.name); const s = NTerra.state(this); if (!q) return; if (s.done[q.id]) d.text = 'Thanks again for that. Nothing more for now.'; else { const prog = NTerra.progress(this, q), need = q.type === 'boss' ? 1 : q.count; if (prog >= need) { NTerra.claim(this, q); d.text = 'You did it! Here, take this.'; } else d.text = `${q.desc} (${prog}/${need}) - check the Quests tab in your inventory.`; } return; } } return baseBtn.call(this, b); };
});
// riding: the carried guardian keeps the player's pace; enemies target the guardian first
ModLib.on('drawHud', (g) => { const c = g.companions.find(x => x.order === 'carry'); if (c) drawText(g.renderer.ctx, `Riding ${c.name} (talk to get off)`, g.renderer.W / 2, 92, { size: 12, align: 'center', color: '#c0ffc0' }); });

// === Pets Overhaul: Calamity Addon ===================================================================
ModList.current = 'pets_overhaul_calamity';
const PET_EXTRA = {
  bone_rattle: ['+3 defense at night', (p, pm, g) => { if (!g.world.isDay()) pm.defAdd += 3; }], brain_jar: ['+5% magic damage', (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.05; }], seaweed: ['Breathe underwater', (p, pm) => { pm.gills = true; }], lightning_carrot: ['+8% movement speed in the rain / at night', (p, pm, g) => { if (!g.world.isDay()) pm.move *= 1.08; }], carrot: ['Jumps refresh 5% faster', (p, pm) => { pm.jump *= 1.05; }], eaters_bone: ['+2 life regeneration in the Corruption', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.CORRUPTION) pm.regenAdd += 2; }], eye_bone: ['+4% crit while at full life', (p, pm) => { if (p.hp >= p.maxHp) pm.crit += 4; }], hell_cake: ['Immune to On Fire!', (p) => { if (p.buffs['On Fire!']) p.buffs['On Fire!'] = 0; }], tartar_sauce: ['+4 defense', (p, pm) => { pm.defAdd += 4; }], fuse_wire: ['+10% ranged damage with rockets', (p, pm) => { const s = p.selectedItem; if (s && ITEMS[s.id].ammoKind === 'rocket') pm.rangedDmg *= 1.1; }], toy_sled: ['+10% movement speed in the snow', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.SNOW) pm.move *= 1.1; }], frozen_crown: ['+6% damage in the snow', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.SNOW) pm.dmg *= 1.06; }], grinning_eye: ['+3% crit', (p, pm) => { pm.crit += 3; }], dog_whistle: ['+1 tile pickup range', (p, pm) => { pm.pickup = (pm.pickup || 0) + TILE; }], dirtiest_block: ['+15% mining speed on dirt... and everything else', (p, pm) => { pm.mineSpeed = (pm.mineSpeed || 1) * 1.15; }], amber_mosquito: ['+3 life regeneration in the desert', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.DESERT) pm.regenAdd += 3; }], writhing_remains: ['+8% summon damage', (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * 1.08; }], probe: ['+5% ranged damage', (p, pm) => { pm.rangedDmg *= 1.05; }], lizard_egg: ['+10% movement speed in the jungle', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.JUNGLE) pm.move *= 1.1; }], mud_bud: ['+2 life regeneration in the jungle', (p, pm, g) => { if (g.world.biome[clamp(p.tileX, 0, g.world.w - 1)] === BIOME.JUNGLE) pm.regenAdd += 2; }], bamboo_leaf: ['+4% damage while standing still', (p, pm) => { if (Math.abs(p.vx) < 0.1) pm.dmg *= 1.04; }], chester: ['Banks open anywhere (no item needed)', () => {}], bone_key: ['+4 defense in the dungeon', (p, pm, g) => { const d = BiomeSys.detect(g); if (d && d.mini === 'Dungeon') pm.defAdd += 4; }], cursed_sapling: ['+5% summon damage, +1 minion slot at night', (p, pm, g) => { pm.summonDmg = (pm.summonDmg || 1) * 1.05; if (!g.world.isDay()) pm.minionSlots = (pm.minionSlots || 0) + 1; }],
};
const LIGHT_EXTRA = { magic_lantern: '+2 defense', fairy_bell: '+5% movement speed', crimson_heart: '+2 life regeneration', shadow_orb: '+2 life regeneration', wisp: '+4% crit', jewel_of_light: '+5% damage', tentacle: '+6% magic damage', orb_of_light: '+3 defense' };
ModLib.onPlayerMods((p, pm, g) => { if (!ModList.on('pets_overhaul_calamity') || !ModList.on('pets_overhaul') || !g.pets) return; const id = g.pets.pet && g.pets.pet.id; if (id && PET_EXTRA[id]) PET_EXTRA[id][1](p, pm, g); const lid = g.pets.light && g.pets.light.id; if (lid && LIGHT_EXTRA[lid]) { if (lid === 'magic_lantern') pm.defAdd += 2; else if (lid === 'fairy_bell') pm.move *= 1.05; else if (lid === 'crimson_heart' || lid === 'shadow_orb') pm.regenAdd += 2; else if (lid === 'wisp') pm.crit += 4; else if (lid === 'jewel_of_light') pm.dmg *= 1.05; else if (lid === 'tentacle') pm.magicDmg = (pm.magicDmg || 1) * 1.06; else if (lid === 'orb_of_light') pm.defAdd += 3; } });
TooltipHooks.add((stack, it, lines) => { if (!stack || !ModList.on('pets_overhaul_calamity')) return; if (PET_EXTRA[stack.id]) lines.push({ t: `Calamity addon: ${PET_EXTRA[stack.id][0]}`, c: '#ffb060', size: 14 }); if (LIGHT_EXTRA[stack.id]) lines.push({ t: `Calamity addon: ${LIGHT_EXTRA[stack.id]}`, c: '#ffb060', size: 14 }); });
{ const base = Banks.has; Banks.has = function (g, id) { return base.call(this, g, id) || (g.pets && g.pets.pet && g.pets.pet.id === 'chester'); }; }

ModLib.patch(() => { const base = Companion.prototype.update; Companion.prototype.update = function (world, game) { if (this.order === 'carry') { const p = game.player; if (this.ko > 0 || p.dead) { this.order = 'follow'; return base.call(this, world, game); } if (this.invuln > 0) this.invuln--; if (this.hitFlash > 0) this.hitFlash--; if (this.attackCd > 0) this.attackCd--; if (this.useTimer > 0) { this.useTimer--; this.armAngle = lerp(-2.3, 0.6, smoothstep(1 - this.useTimer / this.useDuration)); } else this.armAngle = null; this.x = p.cx - this.w / 2 + (p.dir < 0 ? 4 : -4); this.y = p.y + p.h - this.h + 10; this.vx = p.vx; this.vy = 0; this.dir = p.dir; this.onGround = p.onGround; this.walkPhase = p.walkPhase; let target = null, best = 6 * TILE; for (const e of game.enemies) { const d = dist(e.cx, e.cy, this.cx, this.cy); if (d < best) { best = d; target = e; } } if (target && this.attackCd === 0 && this.def.weapon.kind !== 'bow' && this.def.weapon.kind !== 'spark') { this.dir = target.cx < this.cx ? -1 : 1; this.swing(target, game); } return; } return base.call(this, world, game); }; });
ModList.current = null;
ModList.tagRole('Guardian', 'terraguardians');
