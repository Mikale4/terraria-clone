// ---------------------------------------------------------------------------
// Real audio: Terraria's sound effects (assets/sfx) replace the procedural
// WebAudio effects, and the soundtrack (assets/bgm) plays by situation the way
// the game picks its music - biome, depth, day/night, town, blood moon,
// events, pillars and every boss with its own theme. Volumes are saved.
// ---------------------------------------------------------------------------
'use strict';

// --- sound effects ---------------------------------------------------------------------------------
// game sound name -> candidate files (one is picked at random), after Terraria's SoundID usage
const SFX_MAP = {
  dig: ['Dig_0', 'Dig_1', 'Dig_2'], dig_stone: ['Tink_0', 'Tink_1', 'Tink_2'], chop: ['Dig_0', 'Dig_1', 'Dig_2'], break: ['Dig_0', 'Dig_1', 'Dig_2'], place: ['Dig_0', 'Dig_1', 'Dig_2'], grass: ['Grass'],
  jump: [], land: [], double_jump: ['Double_Jump'], slime: [],
  swing: ['Item_1'], bow: ['Item_5'], gun: ['Item_11'], shotgun: ['Item_36'], minigun: ['Item_40'], pistol: ['Item_41'], launcher: ['Item_61'], flamethrower: ['Item_34'], magic: ['Item_8'], magic2: ['Item_9'], magic_fire: ['Item_20'], laser: ['Item_12'], explosion: ['Item_14'], whip: ['Item_152'], flail: ['Item_19'], summon: ['Item_44'], grapple: ['Item_7'], fish_cast: ['Item_17'], harpoon: ['Item_10'],
  hit: ['NPC_Hit_1'], hit_bone: ['NPC_Hit_2'], hit_metal: ['NPC_Hit_4'], hit_ghost: ['NPC_Hit_54'], kill: ['NPC_Killed_1'], kill_bone: ['NPC_Killed_2'], kill_metal: ['NPC_Killed_14'], kill_big: ['NPC_Killed_6'], boss_dead: ['NPC_Killed_14'],
  hurt: ['Player_Hit_0', 'Player_Hit_1', 'Player_Hit_2'], death: ['Player_Killed'], drown: ['Drown'],
  heal: ['Item_3'], potion: ['Item_3'], levelup: ['Item_4'], mana_full: ['MaxMana'], pickup: ['Grab'], craft: ['Grab'], menu: ['Menu_Tick'], open: ['Menu_Open'], close: ['Menu_Close'], chat: ['Chat'], achievement: ['achievement_complete'], unlock: ['Unlock'], camera: ['Camera'],
  door: [], door_open: ['Door_Opened'], door_close: ['Door_Closed'], splash: ['Splash_0', 'Splash_1'], zombie: ['Zombie_0', 'Zombie_1', 'Zombie_2'], roar: ['Roar_0'], roar_big: ['Roar_1'], mech: ['Mech_0'], shatter: ['Shatter'], pixie: ['Pixie'], thunder: ['Thunder_0', 'Thunder_1', 'Thunder_2', 'Thunder_3', 'Thunder_4', 'Thunder_5', 'Thunder_6'], drip: ['Drip_0', 'Drip_1', 'Drip_2'], liquid: ['Liquid_0', 'Liquid_1'], coin: ['Coin_0', 'Coin_1', 'Coin_2', 'Coin_3', 'Coin_4'], coins: ['Coins'], run: ['Run'],
};
const SFX = {
  buffers: {}, loading: {}, failed: {}, cfg: { sfx: 0.7, music: 0.5 },
  load() { try { const c = JSON.parse(localStorage.getItem('audio_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('audio_cfg', JSON.stringify(this.cfg)); } catch (e) {} },
  fetch(file) {
    if (this.buffers[file] || this.loading[file] || this.failed[file] || !Audio_.ctx) return;
    this.loading[file] = true;
    fetch('assets/sfx/' + encodeURIComponent(file) + '.wav').then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(ab => Audio_.ctx.decodeAudioData(ab)).then(buf => { this.buffers[file] = buf; delete this.loading[file]; }).catch(() => { this.failed[file] = true; delete this.loading[file]; });
  },
  // returns true when a real sound played (or is intentionally silent), false to fall back to the procedural effect
  play(name, vol = 1) {
    const files = SFX_MAP[name]; if (!files) return false; if (!files.length) return true;
    const file = files[Math.floor(Math.random() * files.length)];
    const buf = this.buffers[file]; if (!buf) { this.fetch(file); return this.failed[file] ? false : true; }
    const ctx = Audio_.ctx; const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = 0.96 + Math.random() * 0.08;
    const g = ctx.createGain(); g.gain.value = this.cfg.sfx * vol; src.connect(g); g.connect(ctx.destination); src.start();
    return true;
  },
  warm() { for (const k of ['dig', 'dig_stone', 'swing', 'hit', 'kill', 'hurt', 'pickup', 'menu', 'open', 'close', 'coin', 'heal', 'splash', 'zombie', 'door_open', 'door_close', 'levelup', 'craft', 'bow', 'gun', 'magic', 'roar', 'place', 'grass', 'double_jump']) for (const f of SFX_MAP[k]) this.fetch(f); },
};
SFX.load();
{ const procedural = Audio_.play.bind(Audio_); Audio_.play = function (name, vol) { if (!this.ctx || !this.enabled) return; if (SFX.play(name, vol)) return; procedural(name); }; const init = Audio_.init.bind(Audio_); Audio_.init = function () { init(); if (this.ctx && !SFX.warmed) { SFX.warmed = true; SFX.warm(); Music.kick(); } }; }

// --- music ---------------------------------------------------------------------------------------------
const BGM = {
  title: '06. Title.mp3', alt_title: '60. Alt Title.mp3', day: '01. Overworld Day.mp3', alt_day: '18. Alt Overworld Day.mp3', night: '03. Night.mp3', eerie: '02. Eerie.mp3', underground: '04. Underground.mp3', alt_underground: '31. Alt Underground.mp3',
  snow: '014. Snow.mp3', ice: '20. Ice.mp3', desert: '021. Desert.mp3', underground_desert: '061. Underground Desert.mp3', jungle: '07. Jungle.mp3', jungle_night: '055. Jungle Night.mp3', underground_jungle: '054. Underground Jungle.mp3',
  corruption: '08. Corruption.mp3', underground_corruption: '10. Underground Corruption.mp3', crimson: '016. Crimson.mp3', underground_crimson: '033. Underground Crimson.mp3', hallow: '09. The Hallow.mp3', underground_hallow: '11. Underground Hallow.mp3',
  ocean_day: '22. Ocean Day.mp3', ocean_night: '043. Ocean Night.mp3', mushrooms: '029. Mushrooms.mp3', dungeon: '023. Dungeon.mp3', temple: '26. Temple.mp3', hell: '36. Hell.mp3', space_day: '042. Space Day.mp3', space_night: '15. Space Night.mp3', graveyard: '053. Graveyard.mp3', aether: '091. Aether.mp3',
  town_day: '046. Town Day.mp3', town_night: '047. Town Night.mp3', eclipse: '027. Eclipse.mp3', rain: '019. Rain.mp3', sandstorm: '040. Sandstorm.mp3',
  goblins: '39. Goblin Invasion.mp3', pirates: '035. Pirate Invasion.mp3', martians: '037. Martian Madness.mp3', pumpkin_moon: '030. Pumpkin Moon.mp3', frost_moon: '032. Frost Moon.mp3', old_ones_army: "41. Old One's Army.mp3", slime_rain: '048. Slime Rain.mp3', towers: '34. The Towers.mp3', lunar_boss: '38. Lunar Boss.mp3',
  boss1: '05. Boss 1.mp3', boss2: '12. Boss 2.mp3', boss3: '13. Boss 3.mp3', boss4: '17. Boss 4.mp3', boss5: '25. Boss 5.mp3',
  king_slime: '093. King Slime.mp3', queen_bee: '096. Queen Bee.mp3', eater_of_worlds: '099. Eater Of Worlds.mp3', skeletron: '104. Skeletron.mp3', deerclops: '090. Deerclops.mp3', queen_slime: '056. Queen Slime.mp3', twins: '097. The Twins.mp3', destroyer: '092. The Destroyer.mp3', prime: '098. Skeletron Prime.mp3', plantera: '024. Plantera.mp3', fishron: '058. Duke Fishron.mp3', empress: '057. Empress Of Light.mp3', cultist: '094. Lunatic Cultist.mp3',
  journeys_end: "89. Journey's End.mp3",
};
// boss id -> track key (vanilla themes; mod bosses get the numbered boss themes by tier)
const BOSS_MUSIC = {
  eye_of_cthulhu: 'boss1', eye: 'boss1', king_slime: 'king_slime', queen_bee: 'queen_bee', eater_of_worlds: 'eater_of_worlds', brain_of_cthulhu: 'boss3', skeletron: 'skeletron', deerclops: 'deerclops', wall_of_flesh: 'boss2',
  queen_slime: 'queen_slime', the_twins: 'twins', the_destroyer: 'destroyer', skeletron_prime: 'prime', plantera: 'plantera', golem: 'boss5', duke_fishron: 'fishron', empress_of_light: 'empress', lunatic_cultist: 'cultist', pillar: 'towers', moon_lord: 'lunar_boss',
  dark_mage: 'old_ones_army', ogre: 'old_ones_army', betsy: 'old_ones_army', flying_dutchman: 'pirates', mourning_wood: 'pumpkin_moon', pumpking: 'pumpkin_moon', everscream: 'frost_moon', santa_nk1: 'frost_moon', ice_queen: 'frost_moon', martian_saucer: 'martians',
  rumia: 'boss1', lepus: 'boss1', desert_scourge: 'boss1', grand_thunder_bird: 'boss1', vagrant: 'boss4', nameless_deity: 'lunar_boss',
  ancient_machine: 'boss1', rune_ghost: 'boss1', ophiocoon: 'boss1', ophiofly: 'boss1', mega_cactus_slime: 'king_slime', imperious: 'boss2', hydra: 'boss3', polar_exterminator: 'boss3', ophiopede: 'boss3', core_of_shadow: 'boss3', divine_light: 'boss4', noehtnap: 'boss4', invader_battleship: 'boss4', great_tyrannosaurus: 'boss5', olord: 'boss5',
};
const EVENT_MUSIC = { goblin_army: 'goblins', pirate_invasion: 'pirates', martian_madness: 'martians', pumpkin_moon: 'pumpkin_moon', frost_moon: 'frost_moon', old_ones_army: 'old_ones_army', slime_rain: 'slime_rain', solar_eclipse: 'eclipse', invaders: 'martians', dino_militia: 'boss4' };
const Music = {
  current: null, el: null, fading: [], want: null, altDay: false, altUnder: false, dayIdx: -1, started: false, blocked: false,
  vol() { return SFX.cfg.music; },
  kick() { this.started = true; if (this.el && this.el.paused) this.el.play().catch(() => {}); },
  pick(game) {
    if (!game || game.state !== 'play' || !game.world || !game.player) return 'title';
    const w = game.world, p = game.player, day = w.isDay();
    const dIdx = Math.floor(w.time / w.dayLength); if (dIdx !== this.dayIdx) { this.dayIdx = dIdx; this.altDay = Math.random() < 0.35; this.altUnder = Math.random() < 0.35; }
    // bosses and events first
    if (w.lunarEvent && w.lunarEvent.alive && w.lunarEvent.alive.length && !game.boss) return 'towers';
    if (game.boss && !game.boss.dead) { const b = game.boss; const key = BOSS_MUSIC[b.type] || (b.name && BOSS_MUSIC[Object.keys(BOSS_MUSIC).find(k => (BOSS_DEFS[k] && BOSS_DEFS[k].name === b.name))]) || (w.hardmode ? 'boss2' : 'boss1'); return key; }
    if (typeof Subworlds !== 'undefined' && Subworlds.current) return w.noHell ? 'space_day' : 'aether';
    if (w.event && EVENT_MUSIC[w.event.id]) return EVENT_MUSIC[w.event.id];
    const d = typeof BiomeSys !== 'undefined' ? BiomeSys.detect(game) : null; const b = w.biome[clamp(p.tileX, 0, w.w - 1)], layer = d ? d.layer : 'surface', mini = d ? d.mini : null;
    if (layer === 'underworld') return 'hell';
    if (mini === 'Dungeon') return 'dungeon'; if (mini === 'Jungle Temple') return 'temple'; if (mini === 'Aether') return 'aether'; if (mini === 'Graveyard') return 'graveyard'; if (mini === 'Meteorite') return 'eerie';
    if (mini === 'Glowing Mushroom' || mini === 'Underground Mushroom') return 'mushrooms';
    if (layer === 'space') return day ? 'space_day' : 'space_night';
    if (layer === 'underground' || layer === 'cavern') {
      if (mini === 'Underground Desert' || b === BIOME.DESERT) return 'underground_desert';
      if (b === BIOME.JUNGLE || mini === 'Bee Hive') return 'underground_jungle'; if (b === BIOME.CORRUPTION || mini === 'Underground Corruption') return 'underground_corruption'; if (b === BIOME.CRIMSON || mini === 'Underground Crimson') return 'underground_crimson'; if (b === BIOME.HALLOW || mini === 'Underground Hallow') return 'underground_hallow'; if (b === BIOME.SNOW) return 'ice';
      return this.altUnder ? 'alt_underground' : 'underground';
    }
    if (w.bloodMoon && !day) return 'eerie';
    const townNear = game.npcs.filter(n => n.def && n.def.town && dist(n.cx, n.cy, p.cx, p.cy) < 40 * TILE).length;
    if (townNear >= 3 && !game.enemies.some(e => !e.dead && e.isBoss)) return day ? 'town_day' : 'town_night';
    if (b === BIOME.JUNGLE) return day ? 'jungle' : 'jungle_night'; if (b === BIOME.SNOW) return 'snow'; if (b === BIOME.DESERT) return 'desert'; if (b === BIOME.CORRUPTION) return 'corruption'; if (b === BIOME.CRIMSON) return 'crimson'; if (b === BIOME.HALLOW) return 'hallow'; if (b === BIOME.OCEAN) return day ? 'ocean_day' : 'ocean_night';
    return day ? (this.altDay ? 'alt_day' : 'day') : 'night';
  },
  tick(game) {
    if (!this.started) return;
    const key = this.pick(game);
    if (key !== this.current) this.switchTo(key);
    // crossfades
    const target = this.vol(); if (this.el) { const v = this.el.volume; this.el.volume = Math.min(target, v + 0.02 * Math.max(target, 0.05)); }
    for (let i = this.fading.length - 1; i >= 0; i--) { const f = this.fading[i]; f.volume = Math.max(0, f.volume - 0.03); if (f.volume <= 0.001) { f.pause(); f.src = ''; this.fading.splice(i, 1); } }
  },
  switchTo(key) {
    const file = BGM[key]; if (!file) return;
    if (this.el) { this.fading.push(this.el); }
    const el = new Audio('assets/bgm/' + encodeURIComponent(file)); el.loop = true; el.volume = 0; el.preload = 'auto';
    el.play().catch(() => { this.blocked = true; });
    this.el = el; this.current = key;
  },
  stop() { if (this.el) { this.fading.push(this.el); this.el = null; this.current = null; } },
  setVolume(v) { SFX.cfg.music = clamp(v, 0, 1); SFX.save(); },
};
// the music follows the game every few ticks, on the title screen too
ModLib.patch(() => { const base = Game.prototype.update; let t = 0; Game.prototype.update = function () { base.call(this); if (++t % 20 === 0) { try { Music.tick(this); } catch (e) {} } }; });
window.addEventListener('DOMContentLoaded', () => { const retry = () => { if (Audio_.ctx) { Audio_.resume(); Music.kick(); if (Music.blocked && Music.el) { Music.blocked = false; Music.el.play().catch(() => { Music.blocked = true; }); } } }; window.addEventListener('mousedown', retry); window.addEventListener('keydown', retry); });

// --- call-site refinements: per-enemy hit / death sounds, weapon classes, ambience -----------------------
ModLib.patch(() => {
  for (const k in ENEMY_DEFS) { const d = ENEMY_DEFS[k]; if (!d || d.hitSound) continue; if (/skeleton|bones|skull|viking|bone|zacks/i.test(d.name || '')) { d.hitSound = 'hit_bone'; d.killSound = 'kill_bone'; } else if (/probe|martian|saucer|drone|mech|tank|anti air|battleship|construct|golem|turret|machine|invader|ancient minion|strike/i.test(d.name || '')) { d.hitSound = 'hit_metal'; d.killSound = 'kill_metal'; } else if (/ghost|wraith|wisp|poltergeist|spirit/i.test(d.name || '')) { d.hitSound = 'hit_ghost'; d.killSound = 'kill'; } }
  const baseDie = Enemy.prototype.die;
  Enemy.prototype.die = function (game) { const snd = (this.def && this.def.killSound) || (this.isBoss ? 'boss_dead' : this.maxHp >= 800 ? 'kill_big' : 'kill'); const orig = Audio_.play; Audio_.play = function (n, v) { return orig.call(this, n === 'kill' ? snd : n, v); }; try { baseDie.call(this, game); } finally { Audio_.play = orig; } };
  // weapon classes: bows, guns, launchers, flamethrowers, magic, whips, summons
  const baseRanged = Weapons.ranged; Weapons.ranged = function (game, slot, it) { const n = game.projectiles.length; const orig = Audio_.play; Audio_.play = () => {}; try { baseRanged.call(this, game, slot, it); } finally { Audio_.play = orig; } if (game.projectiles.length > n) { const k = it.ammoKind || 'bullet'; Audio_.play(it.flamer ? 'flamethrower' : k === 'arrow' ? 'bow' : k === 'rocket' ? 'launcher' : k === 'flare' ? 'pistol' : (it.shots || 1) >= 3 ? 'shotgun' : (it.useTime || 20) <= 8 ? 'minigun' : 'gun'); } };
  const baseMagic = Weapons.magic; Weapons.magic = function (game, slot, it) { const n = game.projectiles.length, m = game.player.mana; const orig = Audio_.play; Audio_.play = () => {}; try { baseMagic.call(this, game, slot, it); } finally { Audio_.play = orig; } if (game.projectiles.length > n || game.player.mana < m) Audio_.play(/fire|flame|inferno|volcano|heat/.test(slot.id) ? 'magic_fire' : /laser|prism|zap|ray/.test(slot.id) ? 'laser' : 'magic'); };
  const baseCast = Magic.cast; Magic.cast = function (game, slot, it) { const m = game.player.mana; const orig = Audio_.play; Audio_.play = () => {}; let r; try { r = baseCast.call(this, game, slot, it); } finally { Audio_.play = orig; } if (game.player.mana < m) Audio_.play('magic'); return r; };
  const baseWhip = Weapons.whip; Weapons.whip = function (game, slot, it) { const orig = Audio_.play; Audio_.play = () => {}; try { baseWhip.call(this, game, slot, it); } finally { Audio_.play = orig; } Audio_.play('whip'); };
  const baseSummon = Weapons.summon; Weapons.summon = function (game, slot, it) { const n = Minions.list(game).length; const orig = Audio_.play; Audio_.play = () => {}; try { baseSummon.call(this, game, slot, it); } finally { Audio_.play = orig; } if (Minions.list(game).length !== n || game.useHeld === 1) Audio_.play('summon'); };
  const baseFlail = Weapons.flail; Weapons.flail = function (game, slot, it) { const n = game.projectiles.length; const orig = Audio_.play; Audio_.play = () => {}; try { baseFlail.call(this, game, slot, it); } finally { Audio_.play = orig; } if (game.projectiles.length > n) Audio_.play('flail'); };
  // bosses roar when they arrive, events too; dialogs chirp; coins jingle
  const baseSummonBoss = Bosses.summon; Bosses.summon = function (game, id, opts) { const orig = Audio_.play; Audio_.play = (n, v) => orig.call(Audio_, n === 'zombie' ? (/mech|prime|destroyer|twins|olord|battleship|machine/.test(id) ? 'mech' : 'roar') : n, v); try { return baseSummonBoss.call(this, game, id, opts); } finally { Audio_.play = orig; } };
  const baseStart = Events.start; Events.start = function (game, id) { const orig = Audio_.play; Audio_.play = (n, v) => orig.call(Audio_, n === 'zombie' ? 'roar' : n, v); try { return baseStart.call(this, game, id); } finally { Audio_.play = orig; } };
  const baseOpen = Game.prototype.openDialog; Game.prototype.openDialog = function (npc) { const orig = Audio_.play; Audio_.play = (n, v) => orig.call(Audio_, n === 'open' ? 'chat' : n, v); try { return baseOpen.call(this, npc); } finally { Audio_.play = orig; } };
  const baseFire = Game.prototype.fireHook; if (baseFire) Game.prototype.fireHook = function () { const r = baseFire.call(this); Audio_.play('grapple'); return r; };
  const baseCast2 = Fishing.cast; Fishing.cast = function (game, slot, it, tx, ty, spread) { const orig = Audio_.play; Audio_.play = (n, v) => orig.call(Audio_, n === 'swing' ? 'fish_cast' : n, v); try { return baseCast2.call(this, game, slot, it, tx, ty, spread); } finally { Audio_.play = orig; } };
});
// coin pickups jingle, doors close with their own sound, drips underground, thunder on blood moons
ModLib.on('tick', (g) => {
  const p = g.player, w = g.world; if (!p || p.dead) return;
  if (w.time % 90 === 0 && p.tileY > w.surfaceLine + 20 && p.tileY < w.h - 70 && Math.random() < 0.35) Audio_.play('drip', 0.6);
  if (w.bloodMoon && w.time % 600 === 0 && Math.random() < 0.3) Audio_.play('thunder', 0.5);
});
ModLib.patch(() => {
  const basePick = ItemDrop.prototype.update; ItemDrop.prototype.update = function (world, player, game) { const c0 = player.coins; const orig = Audio_.play; Audio_.play = (n, v) => orig.call(Audio_, n === 'craft' && this.id && this.id.startsWith('coin_') ? 'coin' : n, v); try { return basePick.call(this, world, player, game); } finally { Audio_.play = orig; } };
  const baseToggle = World.prototype.toggleDoor; World.prototype.toggleDoor = function (x, y, p) { const r = baseToggle.call(this, x, y, p); if (r) Audio_.play(this.get(x, y) === T.DOOR_C ? 'door_close' : 'door_open'); return r; };
});
