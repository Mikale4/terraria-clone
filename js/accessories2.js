// ---------------------------------------------------------------------------
// Accessory & inventory mods: niol's Buffed Accessories (reworked vanilla
// accessories with Berserker Rage / Enhanced Mana Regeneration), Advanced
// Accessory Combinations (ten late-game combos at the Tinkerer's Workshop),
// Wings Bonuses (every wing pair does something besides flying), Visual
// Accessories (accessories and wings drawn on the character), Potion Slots
// (healing / mana / wormhole slots), Automatic Quick Heal, Bank Buttons (Piggy
// Bank & Safe with buttons and keybinds), Teleport To Map Death (click the
// death mark on the map) and Gravitation Don't Flip the Screen (the potion
// and the Gravity Globe flip you, never the camera).
// ---------------------------------------------------------------------------
'use strict';

const AccMods = { cfg: { autoHeal: true, healAt: 35, autoMana: true, bankNeedsItem: true, visual: true } };
ModList.register('niol_accessories', "niol's Buffed Accessories", { workshop: 2564109369, desc: 'Reworked accessories: Honey Comb bees, Star Cloak stars, emblem reworks, Berserker Rage and Enhanced Mana Regeneration buffs.', builtin: true });
ModList.register('adv_acc_combos', 'Advanced Accessory Combinations', { workshop: 3433296738, desc: 'Brain Scarf, Celestial Shield, Frozen Hero Shield, Hardened Band, Master Ninja Frog Gear, Master Swamp Gear, Obsidian Cthulhu Shield, Slime Shield, Terra Amphibian Boots and Ultimate Diving Gear.', builtin: true });
ModList.register('wings_bonuses', 'Wings Bonuses', { workshop: 3027411706, desc: 'Every pair of wings grants a bonus, bigger when paired with matching armor.' });
ModList.register('visual_accessories', 'Visual Accessories', { workshop: 2825074771, desc: 'Equipped wings, shields, cloaks, balloons and emblems show on your character.', cfg: [ModList.bool(AccMods.cfg, 'visual', 'Draw accessories')] });
ModList.register('potion_slots', 'Potion Slots', { workshop: 3234262967, desc: 'Three dedicated slots: healing potions, mana potions and wormhole / recall potions. Quick heal (H) uses them first.', builtin: true });
ModList.register('auto_quick_heal', 'Automatic Quick Heal', { workshop: 2811781981, desc: 'Quick heal fires by itself at low life; automatic quick mana too.', cfg: [ModList.bool(AccMods.cfg, 'autoHeal', 'Auto quick heal'), ModList.cycle(AccMods.cfg, 'healAt', 'Heal below', [25, 35, 50], ['25% life', '35% life', '50% life']), ModList.bool(AccMods.cfg, 'autoMana', 'Auto quick mana')] });
ModList.register('bank_buttons', 'Bank Buttons', { workshop: 3010989007, desc: 'Piggy Bank and Safe: buttons in the inventory (shift-click quick stacks) and keybinds K / L.', cfg: [ModList.bool(AccMods.cfg, 'bankNeedsItem', 'Require the bank item')] });
ModList.register('teleport_map_death', 'Teleport To Map Death', { workshop: 3613112004, desc: 'Left click the skull on the world map (Tab) to teleport to where you last died.' });
ModList.register('gravity_no_flip', "Gravitation Don't Flip the Screen", { workshop: 2793971101, desc: 'Gravitation Potion and Gravity Globe flip the player, not the screen.', builtin: true });

// === niol's Buffed Accessories ===================================================================
ModList.current = 'niol_accessories';
const setAcc = (id, props, tip) => { if (!ITEMS[id]) return; Object.assign(ITEMS[id], props); if (tip) ITEMS[id].tooltip = tip; };
setAcc('honey_comb', { honeyBees: true }, 'Releases bees when hurt, grants Honey regeneration, and all attacks have a chance to spawn bees');
ACC('star_cloak', 'Star Cloak', { rarity: 4, value: 50000, tooltip: 'Stars fall when you are hurt, and all attacks have a chance to spawn stars', starCloak: true, visual: 'cloak' }, genericIcon('#4060c0', '#ffe080', 'wings'));
setAcc('band_of_regeneration', { regen: 3 }, 'Greatly increased life regeneration (+3)');
setAcc('charm_of_myths', { regen: 4 }, 'Increased life regeneration (+4), reduces Potion Sickness by 25%');
ACC('magic_cuffs', 'Magic Cuffs', { rarity: 3, value: 40000, tooltip: '+20 max mana, restores mana when hurt, increased mana regeneration, +3 magic damage, Enhanced Mana Regeneration when hurt', manaBonus: 20, manaOnHurt: true, manaRegen: 1, magicFlat: 3, starpower: true, recipe: [['shackle', 1], ['band_of_starpower', 1]], station: 'tinkerers_workshop' }, genericIcon('#4060c0', '#c0c0ff', 'ring'));
ACC('celestial_cuffs', 'Celestial Cuffs', { rarity: 5, value: 100000, tooltip: '+20 max mana, restores mana when hurt, greatly increased mana regeneration, +5 magic damage, Enhanced Mana Regeneration when hurt', manaBonus: 20, manaOnHurt: true, manaRegen: 2, magicFlat: 5, starpower: true, recipe: [['magic_cuffs', 1], ['celestial_stone', 1]], station: 'tinkerers_workshop' }, genericIcon('#4060c0', '#ffe080', 'ring'));
setAcc('ranger_emblem', { ammoSave: 0.1, dupShot: 0.1 }, '+15% ranged damage, 10% chance not to consume ammo, ranged projectiles have a chance to duplicate');
ACC('rifle_scope', 'Rifle Scope', { rarity: 5, value: 60000, tooltip: 'Increased ranged damage the farther your target is (up to +25%)', scope: 1 }, genericIcon('#404048', '#80c0ff', 'gun'));
ACC('sniper_scope', 'Sniper Scope', { rarity: 6, value: 150000, tooltip: '+10% ranged damage and crit, ranged projectiles have a chance to duplicate, damage scales with distance (up to +30%), 15% chance not to consume ammo', rangedDmgPct: 10, crit: 10, dupShot: 0.15, scope: 1.2, ammoSave: 0.15, recipe: [['rifle_scope', 1], ['ranger_emblem', 1]], station: 'tinkerers_workshop' }, genericIcon('#404048', '#ffe080', 'gun'));
setAcc('sorcerer_emblem', { manaBonus: 50, manaCostPct: 15, magicStacks: 1 }, '+15% magic damage, +50 max mana, 15% reduced mana usage; magic hits build stacks that boost magic damage');
ACC('celestial_emblem', 'Celestial Emblem', { rarity: 5, value: 120000, tooltip: '+15% magic damage, +100 max mana, 17% reduced mana usage, magic stacks also boost mana regeneration, wider mana star pickup', emblem: 'magic', manaBonus: 100, manaCostPct: 17, magicStacks: 2, manaOnHurt: true, recipe: [['sorcerer_emblem', 1], ['celestial_stone', 0], ['avenger_emblem', 1]].filter(r => r[1]), station: 'tinkerers_workshop' }, genericIcon('#8040ff', '#ffe080', 'ring'));
setAcc('warrior_emblem', { crit: 8, moveSpeed: 0.1, berserk: true }, '+15% melee damage, +8% melee crit, +10% movement speed; melee kills grant Berserker Rage');
ACC('mechanical_glove', 'Mechanical Glove', { rarity: 5, value: 100000, tooltip: '+12% melee damage and speed, +12% melee crit, +17% movement speed; melee kills grant Berserker Rage', dmg: 12, crit: 12, moveSpeed: 0.17, meleeSpeed: 0.12, berserk: true, recipe: [['warrior_emblem', 1], ['titanium_bar', 5], ['iron_bar', 20]], station: 'tinkerers_workshop' }, genericIcon('#606068', '#ffe080', 'box'));
ACC('fire_gauntlet', 'Fire Gauntlet', { rarity: 7, value: 200000, tooltip: '+16% melee damage and speed, +16% melee crit, +20% movement speed, melee attacks burn; melee kills grant Berserker Rage', dmg: 16, crit: 16, moveSpeed: 0.2, meleeSpeed: 0.16, berserk: true, meleeFire: true, recipe: [['mechanical_glove', 1], ['hellstone_bar', 15], ['soul_of_fright', 5]], station: 'tinkerers_workshop' }, genericIcon('#ff8020', '#ffe060', 'box'));
setAcc('summoner_emblem', { minionSlots: 1, sentrySlots: 1 }, '+15% summon damage, +1 minion and sentry slot');
ACC('yoyo_bag', 'Yoyo Bag', { rarity: 6, value: 100000, tooltip: 'Yoyos deal +30% damage and reach 40% farther (three yoyos worth of string)', yoyoBag: true, recipe: [['gel', 30], ['silk', 5], ['gold_bar', 5]], station: 'tinkerers_workshop' }, genericIcon('#8a6038', '#ff4040', 'yoyo'));
ACC('apprentice_scarf', "Apprentice's Scarf", { rarity: 5, value: 60000, tooltip: '+4% magic damage and crit, +10% minion damage, 3% reduced mana usage, +4% movement speed, +1 sentry slot', magicDmgPct: 4, crit: 4, summonDmg: 10, manaCostPct: 3, moveSpeed: 0.04, sentrySlots: 1 }, genericIcon('#8040c0', '#fff', 'ring'));
ACC('huntress_buckler', "Huntress's Buckler", { rarity: 5, value: 60000, tooltip: '+1 minion and sentry slot, +4% ranged damage and crit, +10% minion damage, 2% chance not to consume ammo, +4% movement speed', minionSlots: 1, sentrySlots: 1, rangedDmgPct: 4, crit: 4, summonDmg: 10, ammoSave: 0.02, moveSpeed: 0.04, slot: 'shield', defense: 2, visual: 'shield', shieldColor: '#40a060' }, genericIcon('#40a060', '#fff', 'box'));
ACC('monk_belt', "Monk's Belt", { rarity: 5, value: 60000, tooltip: '+1 minion and sentry slot, +4% melee damage, speed and crit, +10% minion damage, +5% movement speed', minionSlots: 1, sentrySlots: 1, dmg: 4, meleeSpeed: 0.04, crit: 4, summonDmg: 10, moveSpeed: 0.05 }, genericIcon('#c0a060', '#fff', 'ring'));
ACC('squire_shield', "Squire's Shield", { rarity: 5, value: 60000, tooltip: '+2% melee damage, +4% melee crit, +10% minion damage, +5% movement speed, increased life regeneration, +1 sentry slot', dmg: 2, crit: 4, summonDmg: 10, moveSpeed: 0.05, regen: 2, sentrySlots: 1, slot: 'shield', defense: 3, visual: 'shield', shieldColor: '#c0c0d0' }, genericIcon('#c0c0d0', '#ffe080', 'box'));
for (const id of ['apprentice_scarf', 'huntress_buckler', 'monk_belt', 'squire_shield']) RECIPES.push({ result: id, count: 1, station: 'anvil', ing: [['defender_medal', 25]] });
setAcc('shackle', { dmg: 2 }, '+1 defense, +2% damage');
ACC('cross_necklace', 'Cross Necklace', { rarity: 4, value: 60000, tooltip: 'Longer invincibility after being hurt, and a 25% chance to survive a fatal blow with 1 life (once a minute)', longInvuln: true, crossNecklace: true, visual: 'necklace' }, genericIcon('#ffe080', '#fff', 'ring'));
ACC('pygmy_necklace', 'Pygmy Necklace', { rarity: 5, value: 60000, tooltip: '+1 minion slot, minions strike much faster (no enemy immunity frames)', minionSlots: 1, pygmy: true, visual: 'necklace' }, genericIcon('#a06030', '#fff', 'ring'));
ACC('stalkers_quiver', "Stalker's Quiver", { rarity: 6, value: 120000, tooltip: '+10% arrow damage and crit, arrows fly faster, enemies are less likely to target you', arrowCrit: 10, rangedDmgPct: 10, projSpeedPct: 0.1, recipe: [['ranger_emblem', 1], ['wooden_arrow', 100], ['silk', 5]], station: 'tinkerers_workshop' }, genericIcon('#8a6038', '#fff', 'box'));
ACC('arcane_flower', 'Arcane Flower', { rarity: 6, value: 120000, tooltip: '+10% magic damage, +5% magic crit, 8% reduced mana usage, automatically drinks mana potions', magicDmgPct: 10, crit: 5, manaCostPct: 8, autoMana: true, recipe: [['sorcerer_emblem', 1], ['mana_knuckles', 1]], station: 'tinkerers_workshop' }, genericIcon('#8040c0', '#ff80c0', 'orb'));
BUFF_MODS['Berserker Rage'] = (p, pm) => { pm.dmg *= 1.2; pm.useTime *= 0.85; pm.move *= 1.1; };
BUFF_MODS['Enhanced Mana Regeneration'] = (p, pm) => { pm.manaRegen = (pm.manaRegen || 0) + 6; };
ModLib.onPlayerMods((p, pm, g) => {
  if (!ModList.on('niol_accessories')) return;
  for (const it of ModLib.accs(p)) {
    if (it.meleeSpeed) pm.useTime *= 1 - it.meleeSpeed; if (it.manaRegen) pm.manaRegen = (pm.manaRegen || 0) + it.manaRegen;
    if (it.rangedDmgPct) pm.rangedDmg *= 1 + it.rangedDmgPct / 100; if (it.magicDmgPct) pm.magicDmg = (pm.magicDmg || 1) * (1 + it.magicDmgPct / 100); if (it.projSpeedPct) pm.projSpeed *= 1 + it.projSpeedPct;
    if (it.ammoSave) pm.ammoSave = Math.max(pm.ammoSave || 0, it.ammoSave); if (it.dupShot) pm.dupShot = Math.max(pm.dupShot || 0, it.dupShot); if (it.scope) pm.scope = Math.max(pm.scope || 0, it.scope);
    if (it.magicStacks) pm.magicStacks = Math.max(pm.magicStacks || 0, it.magicStacks); if (it.pygmy) pm.pygmy = true; if (it.yoyoBag) pm.yoyoBag = true; if (it.magicFlat) pm.magicFlat = (pm.magicFlat || 0) + it.magicFlat;
  }
  const s = ModLib.player(g, 'niol', () => ({ stacks: 0, stackT: 0, crossCd: 0 }));
  if (s.stackT > 0) { s.stackT--; if (s.stackT === 0) s.stacks = 0; } if (s.crossCd > 0) s.crossCd--;
  if (pm.magicStacks && s.stacks > 0) { pm.magicDmg = (pm.magicDmg || 1) * (1 + s.stacks * 0.02); if (pm.magicStacks >= 2) pm.manaRegen = (pm.manaRegen || 0) + s.stacks * 0.5; }
});
ModLib.on('enemyHit', (g, e, dmg) => {
  const p = g.player, pm = p.pm, acc = ModLib.accs(p); if (!ModList.on('niol_accessories')) return;
  if (acc.some(a => a.honeyBees) && Math.random() < 0.15) modShot(g, p.cx, p.y + 10, rand(-3, 3), rand(-3, 1), { damage: 12, color: '#e0c040', life: 90, homing: 0.4, props: { kind: 'seal' } });
  if (acc.some(a => a.starCloak) && Math.random() < 0.15) modShot(g, e.cx + rand(-40, 40), e.y - 300, 0, 12, { damage: 30, color: '#ffe080', life: 60, glow: true });
  const sel = p.selectedItem, it = sel && ITEMS[sel.id];
  if (it && (it.wclass === 'magic' || it.magic) && pm.magicStacks) { const s = ModLib.player(g, 'niol', () => ({ stacks: 0, stackT: 0 })); s.stacks = Math.min(10, s.stacks + 1); s.stackT = 300; }
  if (it && it.sword && acc.some(a => a.meleeFire)) e.applyDebuff('Frostburn', 180, 1);
});
ModLib.onEnemyKilled((g, e) => { const p = g.player, sel = p.selectedItem; if (sel && ITEMS[sel.id].sword && ModLib.accs(p).some(a => a.berserk)) p.addBuff('Berserker Rage', 300); });
ModLib.onPlayerHurt((p, amount, g) => { if (ModLib.accs(p).some(a => a.starpower)) p.addBuff('Enhanced Mana Regeneration', 240); if (ModLib.accs(p).some(a => a.longInvuln)) p.invuln = Math.max(p.invuln || 0, 60); });
ModLib.onFatal((p, g) => { const s = ModLib.player(g, 'niol', () => ({ stacks: 0, stackT: 0, crossCd: 0 })); if (ModLib.hasAcc(p, 'cross_necklace') && s.crossCd <= 0 && Math.random() < 0.25) { s.crossCd = 3600; p.hp = 1; p.invuln = 90; g.message('The Cross Necklace saves you!', '#ffe080'); FX.flash('#ffe080', 15, 0.4); return true; } return false; });
ModLib.on('projTick', (g, b) => { const p = g.player, pm = p.pm; if (!b.friendly || b.owner !== p || b._niol) return; b._niol = true; if ((b.kind === 'bullet' || b.kind === 'arrow') && pm.dupShot && Math.random() < pm.dupShot) { const c = modShot(g, b.x + 3, b.y + 3, b.vx * 1.02, b.vy * 1.02 + rand(-0.3, 0.3), { damage: b.damage, color: b.color || '#fff', life: b.life, props: { kind: b.kind } }); c._niol = true; c.gravity = b.gravity; } if (b.kind === 'arrow' && ModLib.hasAcc(p, 'stalkers_quiver')) b.crit = b.crit || Math.random() < 0.1; if (b.kind === 'yoyo' && pm.yoyoBag) { b.damage = Math.round(b.damage * 1.3); b.range = (b.range || 14 * TILE) * 1.4; } if (b.magic && pm.magicFlat) b.damage += pm.magicFlat; });
ModLib.on('projHit', (g, b, e) => { const p = g.player; if (b.friendly && b.owner === p && p.pm.scope && (b.kind === 'bullet' || b.kind === 'arrow')) { const d = dist(p.cx, p.cy, e.cx, e.cy) / TILE; const bonus = Math.min(0.25 * p.pm.scope, d / 60 * 0.25 * p.pm.scope); if (bonus > 0.02) e.hit(Math.round(b.damage * bonus), b.x, 0, g); } });
ModLib.on('tick', (g) => { if (g.player.pm.pygmy) for (const m of Minions.list(g)) if (m.hitCd > 8) m.hitCd = 8; });

// === Advanced Accessory Combinations =============================================================
ModList.current = 'adv_acc_combos';
const baseAcc = (id, name, props, icon) => { if (!ITEMS[id]) ACC(id, name, props, icon); };
baseAcc('celestial_shell', 'Celestial Shell', { rarity: 7, value: 200000, tooltip: '+10% damage, +3 defense and +10% speed at all times, +5 life regeneration, swim like a fish at night', dmg: 10, defense: 3, moveSpeed: 0.1, regen: 5, gills: true, shell: true }, genericIcon('#4060a0', '#ffe080', 'orb'));
baseAcc('paladin_shield', "Paladin's Shield", { rarity: 7, value: 150000, tooltip: '+6 defense, immunity to knockback, absorbs 25% of damage while above 25% life', slot: 'shield', defense: 6, kbImmune: true, dr: 0.25, visual: 'shield', shieldColor: '#ffe080' }, genericIcon('#ffe080', '#c0c0d0', 'box'));
baseAcc('frozen_turtle_shell', 'Frozen Turtle Shell', { rarity: 6, value: 100000, tooltip: '25% damage reduction while below 50% life', frozenShell: true }, genericIcon('#a0e0ff', '#fff', 'box'));
baseAcc('flesh_knuckles', 'Flesh Knuckles', { rarity: 6, value: 100000, tooltip: '+8 defense, enemies are more likely to target you', defense: 8 }, genericIcon('#c04050', '#fff', 'box'));
baseAcc('master_ninja_gear', 'Master Ninja Gear', { rarity: 7, value: 200000, tooltip: 'Dash (double tap), 10% dodge chance, climb walls, +10% movement speed', dash: true, dodge: 0.1, wallClimb: true, moveSpeed: 0.1 }, genericIcon('#202030', '#c0c0c0', 'box'));
baseAcc('frog_leg', 'Frog Leg', { rarity: 4, value: 50000, tooltip: 'Auto-jump, +48% jump speed and higher jumps', jumpBoost: 0.48, autoJump: true }, genericIcon('#40a040', '#fff', 'box'));
baseAcc('flipper', 'Flipper', { rarity: 2, value: 20000, tooltip: 'Swim through liquids faster', flipper: true }, genericIcon('#4080c0', '#fff', 'box'));
baseAcc('water_walking_boots', 'Water Walking Boots', { rarity: 3, value: 40000, tooltip: 'Walk on water and honey', waterWalk: true }, genericIcon('#4080c0', '#a0e0ff', 'box'));
baseAcc('shield_of_cthulhu', 'Shield of Cthulhu', { rarity: 4, value: 50000, tooltip: 'Double tap a direction to dash into enemies', dash: true, slot: 'shield', defense: 2, visual: 'shield', shieldColor: '#c03030' }, genericIcon('#c03030', '#ffe060', 'box'));
baseAcc('royal_gel', 'Royal Gel', { rarity: 4, value: 50000, tooltip: 'Slimes become friendly', slimeCalm: true }, genericIcon('#4070e0', '#fff', 'orb'));
baseAcc('terraspark_boots', 'Terraspark Boots', { rarity: 6, value: 200000, tooltip: 'Fast running, water, lava and honey walking, lava immunity for a while, +8% movement speed', slot: 'boots', moveSpeed: 0.3, lavaImmune: true, waterWalk: true, fireImmune: true }, genericIcon('#ff8020', '#ffe060', 'box'));
baseAcc('amphibian_boots', 'Amphibian Boots', { rarity: 5, value: 100000, tooltip: 'Fast running, auto-jump, higher and faster jumps', slot: 'boots', moveSpeed: 0.25, jumpBoost: 0.48, autoJump: true }, genericIcon('#40a040', '#ffe060', 'box'));
baseAcc('arctic_diving_gear', 'Arctic Diving Gear', { rarity: 5, value: 80000, tooltip: 'Breathe and swim underwater, glow, walk on ice without slipping', gills: true, flipper: true, glowUnder: true }, genericIcon('#a0e0ff', '#fff', 'box'));
baseAcc('neptunes_shell', "Neptune's Shell", { rarity: 5, value: 100000, tooltip: 'Turns you into a merfolk in water: breathe and swim freely', gills: true, flipper: true }, genericIcon('#40a0a0', '#fff', 'orb'));
if (!RECIPES.some(r => r.result === 'terraspark_boots')) RECIPES.push({ result: 'terraspark_boots', count: 1, station: 'tinkerers_workshop', ing: [['lightning_boots', 1], ['water_walking_boots', 1], ['obsidian_skull', 1], ['obsidian_rose', 1]] });
if (!RECIPES.some(r => r.result === 'amphibian_boots')) RECIPES.push({ result: 'amphibian_boots', count: 1, station: 'tinkerers_workshop', ing: [['lightning_boots', 1], ['frog_leg', 1]] });
if (!RECIPES.some(r => r.result === 'arctic_diving_gear')) RECIPES.push({ result: 'arctic_diving_gear', count: 1, station: 'tinkerers_workshop', ing: [['neptunes_shell', 0], ['flipper', 1], ['gills_potion', 5], ['jewel_of_light', 0], ['ice', 30]].filter(r => r[1]) });
if (!RECIPES.some(r => r.result === 'master_ninja_gear')) RECIPES.push({ result: 'master_ninja_gear', count: 1, station: 'tinkerers_workshop', ing: [['black_fairy_dust', 0], ['spider_fang', 10], ['silk', 20], ['soul_of_night', 15]].filter(r => r[1]) });
if (!RECIPES.some(r => r.result === 'celestial_shell')) RECIPES.push({ result: 'celestial_shell', count: 1, station: 'tinkerers_workshop', ing: [['celestial_stone', 1], ['neptunes_shell', 1]] });
if (!RECIPES.some(r => r.result === 'water_walking_boots')) RECIPES.push({ result: 'water_walking_boots', count: 1, station: 'anvil', ing: [['flipper', 1], ['silk', 10], ['gel', 20]] });
if (!RECIPES.some(r => r.result === 'shield_of_cthulhu')) RECIPES.push({ result: 'shield_of_cthulhu', count: 1, station: 'anvil', ing: [['lens', 6], ['iron_bar', 10], ['suspicious_eye', 1]] });
if (ENEMY_DEFS.shark) ENEMY_DEFS.shark.drops.push({ id: 'flipper', chance: 0.05 }, { id: 'neptunes_shell', chance: 0.03 }); if (ENEMY_DEFS.ice_tortoise) ENEMY_DEFS.ice_tortoise.drops.push({ id: 'frozen_turtle_shell', chance: 0.05 }); if (ENEMY_DEFS.herpling) ENEMY_DEFS.herpling.drops.push({ id: 'flesh_knuckles', chance: 0.04 }); if (ENEMY_DEFS.hoplite) ENEMY_DEFS.hoplite.drops.push({ id: 'paladin_shield', chance: 0.03 }); if (ENEMY_DEFS.jungle_slime) ENEMY_DEFS.jungle_slime.drops.push({ id: 'frog_leg', chance: 0.02 }); if (ENEMY_DEFS.mother_slime) ENEMY_DEFS.mother_slime.drops.push({ id: 'royal_gel', chance: 0.05 });
const COMBO = (id, name, tip, props, ing) => { ACC(id, name, Object.assign({ rarity: 8, value: 300000, tooltip: tip, recipe: ing, station: 'tinkerers_workshop' }, props), genericIcon('#ffe080', '#40e0c0', 'orb')); };
COMBO('brain_scarf', 'Brain Scarf', '17% damage reduction and a 10% chance to dodge attacks', { dr: 0.17, dodge: 0.1 }, [['brain_of_confusion', 1], ['worm_scarf', 1]]);
COMBO('celestial_shield', 'Celestial Shield', 'Ankh Shield + Celestial Shell: +7 defense, knockback and debuff immunity, +10% damage and speed, +5 life regeneration, merfolk at night', { slot: 'shield', defense: 7, kbImmune: true, fireImmune: true, ankh: true, dmg: 10, moveSpeed: 0.1, regen: 5, gills: true, shell: true, visual: 'shield', shieldColor: '#ffe080' }, [['ankh_shield', 1], ['celestial_shell', 1]]);
COMBO('frozen_hero_shield', 'Frozen Hero Shield', "Paladin's Shield + Frozen Turtle Shell + Flesh Knuckles: +14 defense, knockback immunity, 25% damage reduction always", { slot: 'shield', defense: 14, kbImmune: true, dr: 0.25, visual: 'shield', shieldColor: '#a0e0ff' }, [['paladin_shield', 1], ['frozen_turtle_shell', 1], ['flesh_knuckles', 1]]);
COMBO('hardened_band', 'Hardened Band', 'Charm of Myths + Shackle: +5 defense, +4 life regeneration, +2% damage, shorter Potion Sickness', { defense: 5, regen: 4, dmg: 2, charm: true }, [['charm_of_myths', 1], ['shackle', 1]]);
COMBO('master_ninja_frog_gear', 'Master Ninja Frog Gear', 'Master Ninja Gear + Frog Leg + Flipper: dash, dodge, wall climb, auto-jump, huge jumps, fast swimming', { dash: true, dodge: 0.1, wallClimb: true, moveSpeed: 0.1, jumpBoost: 0.48, autoJump: true, flipper: true }, [['master_ninja_gear', 1], ['frog_leg', 1], ['flipper', 1]]);
COMBO('master_swamp_gear', 'Master Swamp Gear', 'Master Ninja Frog Gear + Water Walking Boots: everything the frog gear does, plus walking on water', { dash: true, dodge: 0.1, wallClimb: true, moveSpeed: 0.1, jumpBoost: 0.48, autoJump: true, flipper: true, waterWalk: true }, [['master_ninja_frog_gear', 1], ['water_walking_boots', 1]]);
COMBO('obsidian_cthulhu_shield', 'Obsidian Cthulhu Shield', 'Obsidian Shield + Shield of Cthulhu: +4 defense, knockback and fire immunity, dash', { slot: 'shield', defense: 4, kbImmune: true, lavaImmune: true, fireImmune: true, dash: true, visual: 'shield', shieldColor: '#2a1e3a' }, [['obsidian_shield', 1], ['shield_of_cthulhu', 1]]);
COMBO('slime_shield', 'Slime Shield', 'Shield of Cthulhu + Royal Gel: dash, +2 defense, slimes are friendly', { slot: 'shield', defense: 2, dash: true, slimeCalm: true, visual: 'shield', shieldColor: '#4070e0' }, [['shield_of_cthulhu', 1], ['royal_gel', 1]]);
COMBO('terra_amphibian_boots', 'Terra Amphibian Boots', 'Terraspark + Amphibian Boots: the fastest boots, lava walking and immunity, auto-jump, huge jumps', { slot: 'boots', moveSpeed: 0.4, lavaImmune: true, waterWalk: true, fireImmune: true, jumpBoost: 0.48, autoJump: true }, [['terraspark_boots', 1], ['amphibian_boots', 1]]);
COMBO('ultimate_diving_gear', 'Ultimate Diving Gear', "Arctic Diving Gear + Neptune's Shell + Water Walking Boots: merfolk form, glow, fast swimming and water walking", { gills: true, flipper: true, glowUnder: true, waterWalk: true }, [['arctic_diving_gear', 1], ['neptunes_shell', 1], ['water_walking_boots', 1]]);
ModLib.onPlayerMods((p, pm, g) => {
  for (const it of ModLib.accs(p)) {
    if (it.gills && (!it.shell || !g.world.isDay())) pm.gills = true; if (it.frozenShell && p.hp < p.maxHp * 0.5) pm.modDr = (pm.modDr || 0) + 0.25; if (it.autoJump) pm.autoJump = true; if (it.flipper && p.inWater) { pm.move *= 1.5; pm.swimFast = true; }
    if (it.waterWalk) pm.waterWalk = true; if (it.dash) pm.dash = true; if (it.wallClimb) pm.wallClimb = true; if (it.charm && p.buffs['Potion Sickness'] > 0 && g.world.time % 4 === 0) p.buffs['Potion Sickness']--;
  }
});
ModLib.on('tick', (g) => { const p = g.player, pm = p.pm, w = g.world;
  // water walking: stand on the surface of water / honey when not holding Down
  if (pm.waterWalk && !p.input.down && p.vy >= 0) { const row = Math.floor((p.y + p.h + 1) / TILE); const liq = w.liquidAt(p.tileX, row); const above = w.liquidAt(p.tileX, row - 1); if (liq > 100 && above < 40 && w.lavaAt(p.tileX, row) !== LIQ.LAVA) { p.y = row * TILE - p.h; p.vy = 0; p.onGround = true; p.inWater = false; } }
  // wall climbing: slide slowly / hold against walls
  if (pm.wallClimb && !p.onGround && p.collidedX && p.vy > 1) { p.vy = 1; p.fallStart = null; }
  // dash: double tap left / right
  const s = ModLib.player(g, 'dash', () => ({ l: 0, r: 0, t: 0, lastL: false, lastR: false }));
  if (pm.dash) { const now = w.time; if (p.input.left && !s.lastL) { if (now - s.l < 15 && s.t <= 0) AccMods.dash(g, -1); s.l = now; } if (p.input.right && !s.lastR) { if (now - s.r < 15 && s.t <= 0) AccMods.dash(g, 1); s.r = now; } } s.lastL = p.input.left; s.lastR = p.input.right;
  if (s.t > 0) { s.t--; p.vx = s.dir * 11; p.fallStart = null; if (w.time % 2 === 0) g.particles.push(new Particle(p.cx - s.dir * 10, p.y + rand(0, p.h), 0, 0, '#c0c0ff', 12, 3)); for (const e of g.enemies) if (!e.dead && e.x < p.x + p.w + 6 && e.x + e.w > p.x - 6 && e.y < p.y + p.h && e.y + e.h > p.y && (!e._dashHit || w.time - e._dashHit > 30)) { e._dashHit = w.time; e.hit(30 + Math.round(p.defense), p.cx, 9, g); p.invuln = Math.max(p.invuln || 0, 20); } }
});
AccMods.dash = (g, dir) => { const s = ModLib.player(g, 'dash', () => ({})); s.t = 12; s.dir = dir; s.cd = 40; Audio_.play('swing'); };

// === Wings Bonuses =====================================================================================
ModList.current = 'wings_bonuses';
const WING_BONUS = {
  leaf_wings: ['+3 life regeneration in forests', (p, pm, g) => { const b = g.world.biome[clamp(p.tileX, 0, g.world.w - 1)]; if (b === BIOME.FOREST || b === 0) pm.regenAdd += 3; }, null],
  harpy_wings: ['+12% movement speed, +6% damage while airborne', (p, pm) => { pm.move *= 1.12; if (!p.onGround) pm.dmg *= 1.06; }, null],
  bat_wings: ['Melee hits at night heal 1 life; +8% damage at night', (p, pm, g) => { if (!g.world.isDay()) { pm.dmg *= 1.08; pm.batWings = true; } }, null],
  crystal_wings: ['+8% crit; +12% magic damage', (p, pm) => { pm.crit += 8; pm.magicDmg = (pm.magicDmg || 1) * 1.12; }, null],
  fishron_wings: ['+15% damage and speed in water and rain; the Chlorophyte set makes it always', (p, pm) => { if (p.inWater || activeArmorSet(p) === 'chlorophyte') { pm.dmg *= 1.15; pm.move *= 1.15; } }, 'chlorophyte'],
  empress_wings: ['+15% damage by day; with the Hallowed... any Lunar set: +25%', (p, pm, g) => { if (g.world.isDay()) pm.dmg *= ['solar', 'vortex', 'nebula', 'stardust'].includes(activeArmorSet(p)) ? 1.25 : 1.15; }, 'lunar'],
  betsy_wings: ['+15% melee damage; with the Shinobi set melee hits burn', (p, pm) => { pm.dmg *= 1.15; if (activeArmorSet(p) === 'shinobi') pm.betsyFire = true; }, 'shinobi'],
  festive_wings: ['+10 defense during the Frost Moon, +5 otherwise', (p, pm, g) => { pm.defAdd += g.world.event && g.world.event.id === 'frost_moon' ? 10 : 5; }, null],
  mothron_wings: ['+10% ranged damage; +10 defense during a Solar Eclipse', (p, pm, g) => { pm.rangedDmg *= 1.1; if (g.world.event && g.world.event.id === 'solar_eclipse') pm.defAdd += 10; }, null],
  cosmic_wings: ['+2 minion slots, +10% summon damage', (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 2; pm.summonDmg = (pm.summonDmg || 1) * 1.1; }, null],
};
for (const id in WING_BONUS) if (ITEMS[id]) ITEMS[id].tooltip += `. Wings bonus: ${WING_BONUS[id][0]}`;
ModLib.onPlayerMods((p, pm, g) => { if (!ModList.on('wings_bonuses')) return; const w = p.equipment && p.equipment.wings; const id = w ? w.id : null; if (id && WING_BONUS[id]) WING_BONUS[id][1](p, pm, g); else if (id && ITEMS[id] && ITEMS[id].flight) { pm.move *= 1.05; pm.flightAdd = (pm.flightAdd || 0) + 30; } });
ModLib.on('enemyHit', (g, e, dmg) => { const p = g.player, sel = p.selectedItem; if (!sel || !ITEMS[sel.id].sword) return; if (p.pm.batWings && p.hp < p.maxHp) p.hp += 1; if (p.pm.betsyFire) e.applyDebuff('Frostburn', 180, 1); });

// === Visual Accessories ==================================================================================
ModList.current = 'visual_accessories';
ModLib.on('drawPlayerBack', (ctx, p, g) => {
  if (!AccMods.cfg.visual || !ModList.on('visual_accessories')) return;
  const wings = p.equipment && p.equipment.wings; const flying = !p.onGround && p.input.jump && p.flightTime > 0;
  if (wings) { const col = ITEMS[wings.id].wingColor || ({ leaf_wings: '#40a040', harpy_wings: '#e0d0a0', bat_wings: '#3a2a3a', crystal_wings: '#ffb0ff', fishron_wings: '#4a8a70', empress_wings: '#ffd0ff', betsy_wings: '#e06030', festive_wings: '#c02020', mothron_wings: '#8a6a4a', cosmic_wings: '#4060ff' })[wings.id] || '#c0c0e0'; const flap = flying ? Math.sin(g.world.time * 0.6) * 0.5 : Math.sin(g.world.time * 0.05) * 0.1; ctx.save(); ctx.translate(-6, 14); ctx.rotate(-0.3 + flap); ctx.fillStyle = col; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-22, -14); ctx.lineTo(-26, 2); ctx.lineTo(-16, 10); ctx.closePath(); ctx.fill(); ctx.fillStyle = shade(col, 0.7); ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-18, 10); ctx.lineTo(-10, 12); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  for (const it of ModLib.accs(p)) { if (it.visual === 'cloak') { ctx.fillStyle = it.id === 'star_cloak' ? '#2a3a8a' : '#404050'; ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(6, 12); ctx.lineTo(9 - Math.abs(p.vx) * 1.5, 34); ctx.lineTo(-11 - Math.abs(p.vx) * 1.5, 34); ctx.closePath(); ctx.fill(); if (it.id === 'star_cloak') { ctx.fillStyle = '#ffe080'; ctx.fillRect(-4, 20, 2, 2); ctx.fillRect(2, 26, 2, 2); } } if (it.id === 'cloud_in_a_balloon' || it.id === 'shiny_red_balloon') { ctx.strokeStyle = '#ddd'; ctx.beginPath(); ctx.moveTo(-5, 14); ctx.lineTo(-12, -14); ctx.stroke(); ctx.fillStyle = it.id === 'shiny_red_balloon' ? '#e03030' : '#f0f0ff'; ctx.beginPath(); ctx.ellipse(-12, -20, 7, 9, 0, 0, Math.PI * 2); ctx.fill(); } }
});
ModLib.on('drawPlayer', (ctx, p, g) => {
  if (!AccMods.cfg.visual || !ModList.on('visual_accessories')) return;
  for (const it of ModLib.accs(p)) {
    if (it.visual === 'shield' || (it.slot === 'shield' && it.id !== 'huntress_buckler')) { ctx.fillStyle = it.shieldColor || (it.id === 'ankh_shield' ? '#ffe080' : it.id === 'obsidian_shield' ? '#2a1e3a' : '#3060c0'); ctx.fillRect(-11, 14, 6, 12); ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-11, 14, 6, 2); }
    if (it.emblem || /emblem/.test(it.id)) { ctx.fillStyle = it.emblem === 'melee' ? '#ff6040' : it.emblem === 'ranged' ? '#40c060' : it.emblem === 'magic' ? '#8060ff' : '#e0c040'; ctx.fillRect(1, 15, 4, 4); }
    if (it.visual === 'necklace') { ctx.fillStyle = it.id === 'cross_necklace' ? '#ffe080' : '#a06030'; ctx.fillRect(-1, 12, 2, 3); }
    if (it.id === 'lucky_horseshoe' || it.id === 'obsidian_horseshoe') { ctx.fillStyle = '#ffe080'; ctx.fillRect(-7, 38, 3, 4); }
    if (it.id === 'hermes_boots' || it.id === 'lightning_boots' || it.id === 'spectre_boots' || it.id === 'terraspark_boots') { ctx.fillStyle = it.id === 'terraspark_boots' ? '#ff8020' : it.id === 'spectre_boots' ? '#a0ffff' : '#c0a040'; ctx.fillRect(-4, 39, 5, 3); ctx.fillRect(1, 39, 5, 3); }
  }
});

// === Potion Slots + Automatic Quick Heal ===================================================================
ModList.current = 'potion_slots';
CAT('recall_potion', { name: 'Recall Potion', max: 30, consumable: true, rarity: 1, tooltip: 'Teleports you home', drawIcon: genericIcon('#40c0ff', '#fff', 'potion'), onUse: (g, slot) => { const p = g.player; p.x = g.world.spawnX * TILE - p.w / 2; p.y = (g.world.spawnY - 3) * TILE; p.fallStart = null; FX.burst(g, p.cx, p.cy, 14, '#40c0ff', 3, 25); g.consumeSlot(slot); Audio_.play('menu'); } }, 500);
RECIPES.push({ result: 'recall_potion', count: 3, station: 'workbench', ing: [['bottle', 3], ['glow_mushroom', 1], ['fallen_star', 1]] });
CAT('wormhole_potion', { name: 'Wormhole Potion', max: 30, consumable: true, rarity: 1, tooltip: 'Teleports you to the nearest town NPC (in single player)', drawIcon: genericIcon('#8040c0', '#fff', 'potion'), onUse: (g, slot) => { const p = g.player; let best = null, bd = 1e9; for (const n of g.npcs) { if (!n.isTown && !n.def.town) continue; const d = dist(n.cx, n.cy, p.cx, p.cy); if (d < bd) { bd = d; best = n; } } if (!best) { g.message('No one to wormhole to.', '#ff8080'); return; } p.x = best.cx - p.w / 2; p.y = best.y; p.fallStart = null; FX.burst(g, p.cx, p.cy, 14, '#8040c0', 3, 25); g.consumeSlot(slot); Audio_.play('menu'); } }, 500);
RECIPES.push({ result: 'wormhole_potion', count: 3, station: 'workbench', ing: [['bottle', 3], ['glow_mushroom', 1], ['gel', 5]] });
const PotionSlots = {
  slots(g) { return ModLib.player(g, 'potionSlots', () => [null, null, null]); },
  accepts(k, it) { return k === 0 ? !!it.heal && !it.food : k === 1 ? !!it.mana : it.id === 'recall_potion' || it.id === 'wormhole_potion'; },
  take(g, k) { const s = this.slots(g)[k]; if (!s) return null; return s; },
};
ModLib.on('drawInventory', (g, L) => {
  const ctx = g.renderer.ctx, mouse = g.mouse, s = L.a0.s, x = L.vx, y0 = L.a0.y + 3 * (s + 6) + 20;
  drawText(ctx, 'Pots', x, y0 - 18, { size: 13, color: '#fff' });
  const P = PotionSlots.slots(g);
  for (let k = 0; k < 3; k++) { const r = { x, y: y0 + k * (s + 6), s }; const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s; UI.drawSlot(ctx, r.x, r.y, r.s, P[k], { chest: true, hover: hov }); if (!P[k]) drawText(ctx, ['heal', 'mana', 'worm'][k], r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 11, align: 'center', color: 'rgba(255,255,255,0.5)' }); UI.button(r.x, r.y, r.s, r.s, 'mod_ui', { id: 'potion_slot', data: k }); if (hov) { UI.hoverSlot = 'mod:potion' + k; UI.modHover = P[k]; } }
  // bank buttons under the dye column
  const bx = L.dx, by0 = y0;
  drawText(ctx, 'Bank', bx, by0 - 18, { size: 13, color: '#fff' });
  [['piggy_bank', 'Piggy', '#ffb0c0', 'K'], ['safe', 'Safe', '#808090', 'L']].forEach(([id, label, col, key], k) => { const r = { x: bx, y: by0 + k * (s + 6), s }; const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s; ctx.fillStyle = hov ? 'rgba(255,230,90,0.3)' : 'rgba(255,255,255,0.12)'; roundRect(ctx, r.x, r.y, r.s, r.s, 6); ctx.fill(); UI.drawItemIcon(ctx, id, r.x + r.s / 2 - 11, r.y + 4, 22); drawText(ctx, label, r.x + r.s / 2, r.y + r.s - 16, { size: 10, align: 'center', color: col }); drawText(ctx, key, r.x + r.s - 10, r.y + 2, { size: 9, color: '#aaa', outline: null }); UI.button(r.x, r.y, r.s, r.s, 'mod_ui', { id: 'bank_btn', data: id }); });
});
ModLib.onUiClick('potion_slot', (g, d, button) => { const p = g.player, P = PotionSlots.slots(g), k = d.data, cur = P[k], c = p.cursorItem; if (c) { if (PotionSlots.accepts(k, ITEMS[c.id])) { P[k] = c; p.cursorItem = cur; Audio_.play('menu'); } else g.message('That does not go there.', '#ff8080'); } else if (cur) { p.cursorItem = cur; P[k] = null; Audio_.play('menu'); } });
ModLib.patch(() => {
  const baseHeal = Game.prototype.quickHeal;
  Game.prototype.quickHeal = function () { const p = this.player; if (p.dead || p.hp >= p.maxHp || p.hasBuff('Potion Sickness')) return baseHeal.call(this); const P = PotionSlots.slots(this); if (P[0] && ITEMS[P[0].id].heal) { this.consume(P[0], ITEMS[P[0].id]); if (P[0] && P[0].count <= 0) P[0] = null; if (!p.inventory.includes(P[0])) { /* stack lives in the slot */ } return; } return baseHeal.call(this); };
  const baseConsumeSlot = Game.prototype.consumeSlot;
  Game.prototype.consumeSlot = function (slot) { const P = PotionSlots.slots(this); const k = P.indexOf(slot); if (k >= 0) { slot.count--; if (slot.count <= 0) P[k] = null; return; } return baseConsumeSlot.call(this, slot); };
  Game.prototype.quickMana = function () { const p = this.player; if (p.dead || p.mana >= p.maxMana || p.hasBuff('Mana Sickness')) return; const P = PotionSlots.slots(this); let s = P[1]; if (!s) { for (let i = 0; i < 50; i++) { const t = p.inventory[i]; if (t && ITEMS[t.id].mana) { s = t; break; } } } if (s) this.consume(s, ITEMS[s.id]); };
});
ModLib.on('tick', (g) => {
  const p = g.player; if (p.dead) return;
  if (AccMods.cfg.autoHeal && ModList.on('auto_quick_heal') && p.hp > 0 && p.hp < p.maxHp * AccMods.cfg.healAt / 100 && !p.hasBuff('Potion Sickness') && g.world.time % 10 === 0) g.quickHeal();
  if (AccMods.cfg.autoMana && ModList.on('auto_quick_heal') && p.mana < p.maxMana * 0.1 && !p.hasBuff('Mana Sickness') && g.world.time % 20 === 0) { const sel = p.selectedItem; if (sel && (ITEMS[sel.id].wclass === 'magic' || ITEMS[sel.id].magic)) g.quickMana(); }
  // recall / wormhole from the third slot with a key (Home-like): use the Q key when holding nothing special
});
ModKeys.bind('KeyO', 'Quick mana / potion slot 2', (g) => g.quickMana());
ModKeys.bind('KeyI', 'Use the wormhole / recall slot', (g) => { const P = PotionSlots.slots(g); if (P[2]) ITEMS[P[2].id].onUse(g, P[2], ITEMS[P[2].id]); else g.message('No recall or wormhole potion in the slot.', '#ff8080'); });

// === Bank Buttons ========================================================================================
ModList.current = 'bank_buttons';
CAT('piggy_bank', { name: 'Piggy Bank', max: 1, rarity: 1, tooltip: 'A portable bank (40 slots). Use it, press K, or click the Piggy button in the inventory', drawIcon: (x) => { x.fillStyle = '#ffb0c0'; x.beginPath(); x.ellipse(8, 9, 7, 5, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#e080a0'; x.fillRect(12, 8, 3, 3); x.fillRect(4, 13, 2, 2); x.fillRect(10, 13, 2, 2); x.fillStyle = '#000'; x.fillRect(5, 7, 1, 1); }, use: (g, s) => { if (g.useHeld !== 1) return; g.player.useTimer = 10; Banks.open(g, 'piggy_bank'); } }, 10000);
CAT('safe', { name: 'Safe', max: 1, rarity: 2, tooltip: 'A portable safe (40 slots). Use it, press L, or click the Safe button in the inventory', drawIcon: (x) => { x.fillStyle = '#808090'; x.fillRect(3, 2, 10, 12); x.fillStyle = '#404048'; x.fillRect(4, 3, 8, 10); x.fillStyle = '#c0c0c8'; x.fillRect(7, 7, 3, 3); }, use: (g, s) => { if (g.useHeld !== 1) return; g.player.useTimer = 10; Banks.open(g, 'safe'); } }, 20000);
RECIPES.push({ result: 'piggy_bank', count: 1, station: 'workbench', ing: [['silver_bar', 2], ['wood', 8]] }, { result: 'safe', count: 1, station: 'anvil', ing: [['gold_bar', 5], ['iron_bar', 10]] });
if (SHOPS.Merchant) SHOPS.Merchant.push({ id: 'piggy_bank', price: 10000 }); if (SHOPS['Goblin Tinkerer']) SHOPS['Goblin Tinkerer'].push({ id: 'safe', price: 20000 });
const Banks = {
  inv(g, id) { const b = ModLib.player(g, 'banks', () => ({})); if (!b[id]) b[id] = new Array(40).fill(null); return b[id]; },
  has(g, id) { if (!AccMods.cfg.bankNeedsItem) return true; return g.player.inventory.some(s => s && s.id === id) || Object.values(PotionSlots.slots(g)).some(s => s && s.id === id); },
  open(g, id) { if (!ModList.on('bank_buttons')) return; if (g.openChest && g.openChest.bank === id) { g.closeChest(); return; } if (!this.has(g, id)) { g.message(`You need a ${ITEMS[id].name} in your inventory.`, '#ff8080'); return; } g.openChest = { x: g.player.tileX, y: g.player.tileY, inv: this.inv(g, id), bank: id, name: ITEMS[id].name }; if (!g.invOpen) g.invOpen = true; Audio_.play('open'); g.updateCraftable(); },
  quickStack(g, id) { if (!this.has(g, id)) return; const p = g.player, inv = this.inv(g, id); let moved = 0; for (let i = 10; i < 50; i++) { const s = p.inventory[i]; if (!s) continue; if (!inv.some(c => c && c.id === s.id)) continue; const def = ITEMS[s.id]; for (let k = 0; k < 40 && s.count > 0; k++) { const c = inv[k]; if (c && c.id === s.id && c.count < def.max) { const n = Math.min(def.max - c.count, s.count); c.count += n; s.count -= n; moved += n; } } for (let k = 0; k < 40 && s.count > 0; k++) if (!inv[k]) { inv[k] = { id: s.id, count: s.count, prefix: s.prefix }; moved += s.count; s.count = 0; } if (s.count <= 0) p.inventory[i] = null; } g.message(moved ? `Quick stacked ${moved} items into the ${ITEMS[id].name}.` : 'Nothing to quick stack.', '#c0ffc0'); Audio_.play('menu'); },
};
ModLib.onUiClick('bank_btn', (g, d) => { const shift = g.keys.has('ShiftLeft') || g.keys.has('ShiftRight'); if (shift) Banks.quickStack(g, d.data); else Banks.open(g, d.data); });
ModKeys.bind('KeyK', 'Open the Piggy Bank', (g) => Banks.open(g, 'piggy_bank'));
ModKeys.bind('KeyL', 'Open the Safe', (g) => Banks.open(g, 'safe'));
ModLib.on('tick', (g) => { if (g.openChest && g.openChest.bank) { g.openChest.x = g.player.tileX; g.openChest.y = g.player.tileY; } });

// === Teleport To Map Death ================================================================================
ModList.current = 'teleport_map_death';
ModLib.on('playerDeath', (g) => { const p = g.player; ModLib.player(g, 'deathMark', () => ({})).pos = { x: p.tileX, y: p.tileY, time: g.world.time }; });
ModLib.on('drawMap', (g, sx, sy, z) => { if (!ModList.on('teleport_map_death')) return; const dm = g.player.modData && g.player.modData.deathMark && g.player.modData.deathMark.pos; if (!dm) return; const ctx = g.renderer.ctx; const x = (dm.x - sx) * z, y = (dm.y - sy) * z; ctx.fillStyle = '#e0e0e0'; ctx.fillRect(x - 5, y - 6, 10, 9); ctx.fillStyle = '#000'; ctx.fillRect(x - 3, y - 3, 2, 2); ctx.fillRect(x + 1, y - 3, 2, 2); ctx.fillRect(x - 2, y + 1, 4, 1); const hov = Math.abs(g.mouse.x - x) < 10 && Math.abs(g.mouse.y - y) < 10; if (hov) drawText(ctx, 'Click to teleport to your death mark', x + 12, y - 8, { size: 13, color: '#ffe080' }); UI.button(x - 8, y - 8, 16, 16, 'mod_ui', { id: 'death_tp' }); });
ModLib.onUiClick('death_tp', (g) => { const dm = g.player.modData.deathMark.pos, p = g.player; if (!dm) return; p.x = dm.x * TILE; p.y = dm.y * TILE - 4; p.fallStart = null; UI.fullMap = false; FX.burst(g, p.cx, p.cy, 14, '#e0e0e0', 3, 25); g.message('Teleported to your death mark.', '#c0c0ff'); Audio_.play('menu'); });

// === Gravitation Don't Flip the Screen ===================================================================
ModList.current = 'gravity_no_flip';
defModPotion('gravitation_potion', 'Gravitation Potion', 'Gravitation', 'Press Down while airborne to flip your gravity (the screen stays put)', '#8040c0', [['bottle', 1], ['fallen_star', 1], ['feather', 0], ['glow_mushroom', 1]].filter(r => r[1]), { time: 180 });
ITEMS.gravity_globe.tooltip = 'Press Down while airborne to flip your gravity, forever (the screen stays put)';
ModLib.patch(() => {
  const base = Player.prototype.update;
  Player.prototype.update = function (world, game) {
    const can = this.hasBuff('Gravitation') || ModLib.hasAcc(this, 'gravity_globe');
    if (!can && this.gravInv) { this.gravInv = false; }
    if (can && this.input.down && !this._gdHeld && !this.onGround && !this.inWater) { this.gravInv = !this.gravInv; this._gdHeld = true; FX.burst(game, this.cx, this.cy, 10, '#8040c0', 3, 20); Audio_.play('menu'); }
    if (!this.input.down) this._gdHeld = false;
    const inv = this.gravInv; const jumpWas = this.input.jump;
    if (inv) { const ceiling = world.isSolidAt(this.tileX, Math.floor((this.y - 1) / TILE)) || world.isSolidAt(Math.floor((this.x + this.w - 1) / TILE), Math.floor((this.y - 1) / TILE)); this._ceil = ceiling; if (ceiling) { this.onGround = false; this.flightTime = this.eq ? this.eq.flight : 0; } if (this.input.jump && !this._gjHeld && ceiling) { this._gjump = 15; this.vy = 4; } if (!this.input.jump) { this._gjump = 0; } this._gjHeld = this.input.jump; this.input.jump = false; }
    base.call(this, world, game);
    if (inv && !this.dead) { if (this._gjump > 0) { this._gjump--; this.vy = 5; } this.vy -= 2 * GRAVITY; if (this.vy < -7) this.vy = -7; this.fallStart = null; this.input.jump = jumpWas; if (this.hook) this.gravInv = false; }
  };
});
ModLib.on('drawHud', (g) => { const p = g.player; if (p.gravInv) drawText(g.renderer.ctx, 'Gravity flipped (Down in the air to flip back)', g.renderer.W / 2, 70, { size: 13, align: 'center', color: '#c0a0ff' }); });
ModList.current = null;
