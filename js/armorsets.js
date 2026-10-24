'use strict';
// ---------------------------------------------------------------------------
// Real Terraria armor set bonuses (1.4.4) for the vanilla sets, with the
// per-piece stats of each piece. Class-specific bonuses (melee damage, melee
// speed, melee / ranged / magic crit) only apply while a weapon of that class
// is used. Mods that alter a set keep their changes while they are enabled.
// ---------------------------------------------------------------------------

ModList.current = null;

// per-piece stat helpers -> player modifier keys
const PS = {
  meleeDmg: (v) => (p, pm) => { pm.meleeDmg = (pm.meleeDmg || 1) * (1 + v / 100); },
  meleeCrit: (v) => (p, pm) => { pm.meleeCrit = (pm.meleeCrit || 0) + v; },
  meleeSpeed: (v) => (p, pm) => { pm.meleeSpeed = (pm.meleeSpeed || 1) * (1 - v / 100); },
  rangedDmg: (v) => (p, pm) => { pm.rangedDmg *= 1 + v / 100; },
  rangedCrit: (v) => (p, pm) => { pm.rangedCrit = (pm.rangedCrit || 0) + v; },
  magicDmg: (v) => (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * (1 + v / 100); },
  magicCrit: (v) => (p, pm) => { pm.magicCrit = (pm.magicCrit || 0) + v; },
  mana: () => () => {}, // handled as an item property (see install)
  minionDmg: (v) => (p, pm) => { pm.summonDmg = (pm.summonDmg || 1) * (1 + v / 100); },
  minions: (v) => (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + v; },
  dmg: (v) => (p, pm) => { pm.dmg *= 1 + v / 100; },
  crit: (v) => (p, pm) => { pm.crit += v; },
  move: (v) => (p, pm) => { pm.move *= 1 + v / 100; },
  ammoSave: (v) => (p, pm) => { pm.ammoSave = Math.max(pm.ammoSave || 0, v / 100); },
};
const PIECE_TEXT = { meleeDmg: (v) => `+${v}% melee damage`, meleeCrit: (v) => `+${v}% melee critical strike chance`, meleeSpeed: (v) => `+${v}% melee speed`, rangedDmg: (v) => `+${v}% ranged damage`, rangedCrit: (v) => `+${v}% ranged critical strike chance`, magicDmg: (v) => `+${v}% magic damage`, magicCrit: (v) => `+${v}% magic critical strike chance`, mana: (v) => `+${v} max mana`, minionDmg: (v) => `+${v}% minion damage`, minions: (v) => `+${v} max minion${v > 1 ? 's' : ''}`, dmg: (v) => `+${v}% damage`, crit: (v) => `+${v}% critical strike chance`, move: (v) => `+${v}% movement speed`, ammoSave: (v) => `${v}% chance not to consume ammo` };

// [set, set-bonus description, set bonus fn, { piece id: { stat: value } }]
const VANILLA_SETS = [
  ['copper', '+2 defense', (p, pm) => { pm.defAdd += 2; }, {}],
  ['tin', '+2 defense', (p, pm) => { pm.defAdd += 2; }, {}],
  ['iron', '+2 defense', (p, pm) => { pm.defAdd += 2; }, {}],
  ['lead', '+3 defense', (p, pm) => { pm.defAdd += 3; }, {}],
  ['silver', '+3 defense', (p, pm) => { pm.defAdd += 3; }, {}],
  ['tungsten', '+3 defense', (p, pm) => { pm.defAdd += 3; }, {}],
  ['gold', '+3 defense', (p, pm) => { pm.defAdd += 3; }, {}],
  ['platinum', '+4 defense', (p, pm) => { pm.defAdd += 4; }, {}],
  ['demonite', '+15% movement speed', (p, pm) => { pm.move *= 1.15; }, { demonite_helmet: { meleeSpeed: 7 }, demonite_breastplate: { meleeSpeed: 7 }, demonite_leggings: { meleeSpeed: 7 } }],
  ['crimtane', 'Greatly increased life regeneration', (p, pm) => { pm.regenAdd += 6; }, { crimtane_helmet: { dmg: 2 }, crimtane_breastplate: { dmg: 2 }, crimtane_leggings: { dmg: 2 } }],
  ['meteorite', 'Space Gun costs 0 mana', (p, pm) => { pm.freeSpaceGun = true; }, { meteorite_helmet: { magicDmg: 7 }, meteorite_breastplate: { magicDmg: 7 }, meteorite_leggings: { magicDmg: 7 } }],
  ['molten', '+17% melee damage', (p, pm) => { pm.meleeDmg = (pm.meleeDmg || 1) * 1.17; }, { molten_helmet: { meleeCrit: 7 }, molten_breastplate: { meleeDmg: 7 }, molten_greaves: { meleeSpeed: 7 } }],
  ['cobalt', '+15% melee speed', (p, pm) => { pm.meleeSpeed = (pm.meleeSpeed || 1) * 0.85; }, { cobalt_helmet: { meleeSpeed: 12 }, cobalt_breastplate: { crit: 3 }, cobalt_leggings: { move: 10 } }],
  ['palladium', 'Rapid Healing: greatly increased life regeneration after striking an enemy', (p, pm) => { if (p.lastHitTime != null && (p.lastHitAge || 0) < 300) pm.regenAdd += 8; }, { palladium_helmet: { meleeDmg: 8, meleeSpeed: 12 }, palladium_breastplate: { dmg: 3 }, palladium_leggings: { crit: 2 } }],
  ['mythril', '+5% melee critical strike chance', (p, pm) => { pm.meleeCrit = (pm.meleeCrit || 0) + 5; }, { mythril_helmet: { meleeDmg: 15, meleeCrit: 5 }, mythril_breastplate: { dmg: 5, crit: 3 }, mythril_leggings: { crit: 3 } }],
  ['orichalcum', 'Flower petals fall on enemies you strike', (p, pm) => { pm.petals = true; }, { orichalcum_helmet: { meleeDmg: 7, meleeCrit: 7 }, orichalcum_breastplate: { crit: 6 }, orichalcum_leggings: { move: 11 } }],
  ['adamantite', '+18% melee speed and movement speed', (p, pm) => { pm.meleeSpeed = (pm.meleeSpeed || 1) * 0.82; pm.move *= 1.18; }, { adamantite_helmet: { meleeDmg: 7, meleeCrit: 7 }, adamantite_breastplate: { dmg: 6 }, adamantite_leggings: { crit: 4, move: 5 } }],
  ['titanium', 'Titanium Barrier: striking enemies raises up to 7 titanium shards (+2 defense each); a shard shatters on the attacker when you are hit', (p, pm) => { pm.titaniumBarrier = true; pm.defAdd += 2 * (p.tiShards || 0); }, { titanium_helmet: { meleeDmg: 8, meleeCrit: 8 }, titanium_breastplate: { dmg: 8, crit: 4 }, titanium_leggings: { meleeSpeed: 7, move: 6 } }],
  ['chlorophyte', 'A leaf crystal fires at nearby enemies', (p, pm) => { pm.leafCrystal = true; }, { chlorophyte_helmet: { meleeDmg: 16, meleeCrit: 6 }, chlorophyte_breastplate: { dmg: 5, crit: 7 }, chlorophyte_leggings: { crit: 8, move: 5 } }],
  ['solar', 'Solar shield: three shields regenerate over time, each absorbs 30% of a hit', (p, pm) => { pm.solarShield = true; }, { solar_helmet: { meleeDmg: 17, meleeCrit: 17 }, solar_breastplate: { meleeDmg: 22, meleeCrit: 12 }, solar_leggings: { meleeSpeed: 15, move: 15 } }],
  ['vortex', 'Vortex stealth: standing still cloaks you (+25% ranged damage, +30% ranged critical strike chance)', (p, pm) => { pm.vortexStealth = true; if (p.stealthT >= 60) { pm.rangedDmg *= 1.25; pm.rangedCrit = (pm.rangedCrit || 0) + 30; } }, { vortex_helmet: { rangedDmg: 16, rangedCrit: 7 }, vortex_breastplate: { rangedDmg: 12, rangedCrit: 12 }, vortex_leggings: { rangedDmg: 8, rangedCrit: 7, move: 10 } }],
  ['nebula', 'Nebula boosters: magic hits stack up to three boosters (+15% damage, +6 life and +4 mana regeneration each)', (p, pm) => { pm.nebulaBoost = true; const n = p.nebulaStacks || 0; if (n) { pm.magicDmg = (pm.magicDmg || 1) * (1 + 0.15 * n); pm.regenAdd += 6 * n; pm.manaRegen = (pm.manaRegen || 0) + 4 * n; } }, { nebula_helmet: { magicDmg: 26, magicCrit: 7, mana: 60 }, nebula_breastplate: { magicDmg: 9, magicCrit: 9, mana: 60 }, nebula_leggings: { magicDmg: 10, magicCrit: 10, move: 10 } }],
  ['stardust', 'The Stardust Guardian protects you (+30% damage reduction while below half life)', (p, pm) => { if (p.hp < p.maxHp * 0.5) pm.modDr = (pm.modDr || 0) + 0.3; }, { stardust_helmet: { minionDmg: 22, minions: 1 }, stardust_breastplate: { minionDmg: 22, minions: 2 }, stardust_leggings: { minionDmg: 22, minions: 2 } }],
];
// mods that alter a vanilla set keep their change while enabled
const SET_MOD_EXTRAS = {
  stardust: { mod: 'whip_armors', desc: '+20% whip range, +50% whip speed', bonus: (p, pm) => { pm.whipRange = (pm.whipRange || 1) * 1.2; pm.whipSpeed = (pm.whipSpeed || 1) * 1.5; } },
};

const ArmorSets = {
  install() {
    for (const [set, desc, bonus, pieces] of VANILLA_SETS) {
      if (!ARMOR_SETS[set]) continue;
      const S = ARMOR_SETS[set], extra = SET_MOD_EXTRAS[set];
      // a set whose pieces all come from a mod is that mod's business (mod class helmets added to a vanilla set are fine)
      const ids = Object.keys(ITEMS).filter(i => ITEMS[i].set === set);
      if (ids.length && ids.every(i => ITEMS[i].mod)) continue;
      S.vanillaDesc = desc; S.vanillaBonus = bonus;
      S.bonus = (p, pm, g) => { bonus(p, pm, g); if (extra && ModList.on(extra.mod)) extra.bonus(p, pm, g); };
      Object.defineProperty(S, 'desc', { get() { return desc + (extra && ModList.on(extra.mod) ? `; ${extra.desc}` : ''); }, configurable: true });
      for (const id in pieces) {
        const it = ITEMS[id]; if (!it || ARMOR_PIECE_MODS[id]) continue; // mod helmets keep their own stats
        const st = pieces[id]; if (st.mana) it.manaBonus = st.mana; const fns = Object.keys(st).filter(k => k !== 'mana').map(k => PS[k](st[k]));
        ARMOR_PIECE_MODS[id] = (p, pm, g) => { for (const f of fns) f(p, pm, g); };
        it.desc = Object.keys(st).map(k => PIECE_TEXT[k](st[k])).join(', ');
        it.tooltip = `${it.defense} defense. ${it.desc}. Set bonus: ${desc}`;
      }
    }
  },
};
ArmorSets.install();
// the whip-armor mod may install its stardust wrapper later than this file runs; keep ours authoritative
ModLib.patch(() => ArmorSets.install());

// class bonuses apply to the weapon in your hand (minions keep their own damage)
ModLib.onPlayerMods((p, pm, g) => {
  const sel = p.selectedItem, it = sel && ITEMS[sel.id], cls = it && typeof Squad !== 'undefined' ? Squad.weaponClass(it) : null;
  if (cls === 'melee') { if (pm.meleeDmg && pm.meleeDmg !== 1) { pm.dmg *= pm.meleeDmg; pm.summonDmg = (pm.summonDmg || 1) / pm.meleeDmg; } if (pm.meleeCrit) pm.crit += pm.meleeCrit; if (pm.meleeSpeed && pm.meleeSpeed !== 1) pm.useTime *= pm.meleeSpeed; }
  else if (cls === 'ranged' && pm.rangedCrit) pm.crit += pm.rangedCrit;
  else if (cls === 'magic' && pm.magicCrit) pm.crit += pm.magicCrit;
});

// --- special set mechanics -------------------------------------------------------------------
// Orichalcum petals, Titanium barrier and Nebula boosters trigger on your hits
ModLib.on('enemyHit', (g, e, dmg) => {
  const p = g.player, pm = p.pm, t = g.world.time;
  if (pm.petals && (p.petalT || 0) <= t) { p.petalT = t + 40; const b = new Projectile(e.cx + rand(-10, 10), e.y - 40, 0, 6, { kind: 'bolt', damage: 33, friendly: true, owner: p, knockback: 1, color: '#ff80c0', hi: '#ffe0f0' }); b.life = 40; b.gravity = 0.1; g.projectiles.push(b); }
  if (pm.titaniumBarrier && (p.tiT || 0) <= t) { p.tiT = t + 20; if ((p.tiShards || 0) < 7) { p.tiShards = (p.tiShards || 0) + 1; FX.burst(g, p.cx, p.cy, 4, '#e0e0f0', 2, 20); } }
  if (pm.nebulaBoost && (p.nebT || 0) <= t) { p.nebT = t + 30; p.nebulaStacks = Math.min(3, (p.nebulaStacks || 0) + 1); p.nebulaLife = 60 * 8; FX.burst(g, p.cx, p.cy - 10, 5, '#ffb0ff', 2, 20); }
});
ModLib.onPlayerHurt((p, amount, g, kind, attacker) => {
  if (p.tiShards > 0 && p.pm && p.pm.titaniumBarrier) { p.tiShards--; if (attacker && attacker.hit) { try { attacker.hit(25, p.cx, 2, g, null, false); } catch (e) {} } FX.burst(g, p.cx, p.cy, 6, '#e0e0f0', 3, 20); }
});
ModLib.onIncoming((p, amount, g) => {
  if (p.pm && p.pm.solarShield && (p.solarShields || 0) > 0 && amount > 0) { p.solarShields--; p.solarT = 300; g.addDamageText(p.cx, p.y - 12, 'Solar shield', '#ffb040'); FX.burst(g, p.cx, p.cy, 8, '#ffb040', 3, 25); return Math.round(amount * 0.7); }
  return amount;
});
ModLib.onPlayerMods((p, pm, g) => {
  if (p !== g.player) return;
  // solar shields regenerate one every 5 s, vortex stealth builds while standing still, nebula boosters fade
  if (pm.solarShield) { if ((p.solarShields || 0) < 3) { p.solarT = (p.solarT || 300) - 1; if (p.solarT <= 0) { p.solarShields = (p.solarShields || 0) + 1; p.solarT = 300; } } } else p.solarShields = 0;
  if (pm.vortexStealth) { const still = Math.abs(p.vx) < 0.1 && p.onGround && p.useTimer <= 0; p.stealthT = still ? Math.min(90, (p.stealthT || 0) + 1) : 0; } else p.stealthT = 0;
  if (!pm.titaniumBarrier) p.tiShards = 0;
  if (p.nebulaStacks) { if (--p.nebulaLife <= 0) { p.nebulaStacks--; p.nebulaLife = 60 * 8; } }
});
ModLib.on('drawHud', (g) => {
  const p = g.player, pm = p.pm, ctx = g.renderer.ctx; let y = 118; const W = g.renderer.W;
  const line = (t, c) => { drawText(ctx, t, W / 2, y, { size: 13, align: 'center', color: c }); y += 16; };
  if (pm.solarShield) line(`Solar shields: ${'●'.repeat(p.solarShields || 0)}${'○'.repeat(3 - (p.solarShields || 0))}`, '#ffb040');
  if (pm.vortexStealth && p.stealthT >= 60) line('Vortex stealth', '#80ffd0');
  if (pm.titaniumBarrier && p.tiShards > 0) line(`Titanium barrier: ${p.tiShards} shard${p.tiShards > 1 ? 's' : ''}`, '#e0e0f0');
  if (pm.nebulaBoost && p.nebulaStacks > 0) line(`Nebula boosters x${p.nebulaStacks}`, '#ffb0ff');
});
