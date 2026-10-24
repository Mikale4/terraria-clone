'use strict';
// ---------------------------------------------------------------------------
// The Adventure Squad, class edition. Four companions, one per class: Nathan
// (summoner), Logan (melee), Hero (magic) and Shiro (ranged). Each has an
// inventory and equipment of their own (armor, accessories, a pet), fights
// with the best class weapon they carry, crafts class gear from materials,
// and asks you for materials (or spare class items) when you have what they
// need - the game pauses while they ask.
// ---------------------------------------------------------------------------

ModList.current = null;

// Nago left the squad
delete COMPANION_DEFS.nago;
if (ITEMS.nago_bag) Object.assign(ITEMS.nago_bag, { name: 'Empty Bag', consumable: false, tooltip: 'Nago has left the squad. The bag is empty.' });

const SQUAD_CLASSES = {
  melee: { name: 'Melee', title: 'Warrior', color: '#ff9060' },
  ranged: { name: 'Ranged', title: 'Ranger', color: '#90e060' },
  magic: { name: 'Magic', title: 'Mage', color: '#b090ff' },
  summon: { name: 'Summoner', title: 'Summoner', color: '#60d0ff' },
};
Object.assign(COMPANION_DEFS.nathan, { cls: 'summon', starter: 'Finch Staff', starterItems: [['finch_staff', 1]] });
Object.assign(COMPANION_DEFS.logan, { cls: 'melee', starter: 'Copper Broadsword', starterItems: [['copper_broadsword', 1]] });
Object.assign(COMPANION_DEFS.hero, { cls: 'magic', starter: 'Wand of Sparking', starterItems: [['wand_of_sparking', 1]] });
Object.assign(COMPANION_DEFS.shiro, { cls: 'ranged', starter: 'Wooden Bow and Arrows', starterItems: [['wooden_bow', 1], ['wooden_arrow', 100]] });
for (const id in COMPANION_DEFS) { const d = COMPANION_DEFS[id]; if (!d.guardian && ITEMS[`${id}_bag`]) ITEMS[`${id}_bag`].tooltip = `Summons ${d.name} to your squad (${SQUAD_CLASSES[d.cls].title}, starts with ${d.starter})`; }

const SQUAD_INV = 30;
const SQUAD_GEAR = ['boots', 'shield', 'wings', 'hook'];

// class buff potions (Terraria's Archery / Magic Power / Mana Regeneration / Summoning / Titan potions and
// Ale); the buffs work for you and for the squad alike
for (const [id, name, buff, desc, col, recipe] of [
  ['archery_potion', 'Archery Potion', 'Archery', '+10% ranged damage, +20% projectile speed', '#c0e080', [['bottle', 1], ['lens', 1], ['wooden_arrow', 5]]],
  ['magic_power_potion', 'Magic Power Potion', 'Magic Power', '+20% magic damage', '#c060ff', [['bottle', 1], ['fallen_star', 1], ['glow_mushroom', 1]]],
  ['mana_regeneration_potion', 'Mana Regeneration Potion', 'Mana Regeneration', 'Greatly increased mana regeneration', '#60a0ff', [['bottle', 1], ['fallen_star', 1], ['mushroom', 1]]],
  ['summoning_potion', 'Summoning Potion', 'Summoning', '+1 minion slot', '#60d0a0', [['bottle', 1], ['vine', 1], ['gel', 3]]],
  ['titan_potion', 'Titan Potion', 'Titan', '+75% knockback', '#e0a060', [['bottle', 1], ['iron_bar', 1], ['gel', 2]]],
  ['ale', 'Ale', 'Tipsy', '+10% melee damage and speed, -4 defense', '#e0b040', null]]) {
  if (!ITEMS[id]) { CAT(id, { name, max: 30, consumable: true, rarity: 1, tooltip: desc + ' for 4 minutes', drawIcon: genericIcon(col, '#fff', 'potion'), buffName: buff, buffTime: 60 * 240, food: true }, id === 'ale' ? 100 : 800); if (recipe) RECIPES.push({ result: id, count: 1, station: 'workbench', ing: recipe }); }
}
Object.assign(BUFF_MODS, {
  Archery: (p, pm) => { pm.rangedDmg *= 1.1; pm.projSpeed *= 1.2; },
  'Magic Power': (p, pm) => { pm.magicDmg = (pm.magicDmg || 1) * 1.2; },
  'Mana Regeneration': (p, pm) => { pm.manaRegen = (pm.manaRegen || 0) + 6; },
  Summoning: (p, pm) => { pm.minionSlots = (pm.minionSlots || 0) + 1; },
  Titan: (p, pm) => { pm.kbMult *= 1.75; },
  Tipsy: (p, pm) => { pm.dmg *= 1.1; pm.useTime *= 0.9; pm.defAdd -= 4; },
  'Well Fed': (p, pm) => { pm.dmg *= 1.05; },
});
if (SHOPS.Tavernkeep && !SHOPS.Tavernkeep.some(e => e.id === 'ale')) SHOPS.Tavernkeep.push({ id: 'ale', price: 100 });

// The Adventure Squad is a mod: it can be switched off in the mod list (companions and their bags then
// stay in the save, untouched, until it is switched back on)
ModList.register('adventure_squad', 'The Adventure Squad', { desc: 'Four class companions - Nathan (summoner), Logan (melee), Hero (mage) and Shiro (ranger) - with their own inventories, equipment and pets. They fight with class weapons, craft class gear, ask you for materials and spare gear, drink class potions, sell what they outgrow, and mine, chop, fish or build on your orders.', builtin: true });
MOD_ICONS.adventure_squad = (x) => { x.fillStyle = '#c04040'; x.fillRect(2, 3, 5, 10); x.fillStyle = '#4060c0'; x.fillRect(9, 3, 5, 10); x.fillStyle = '#f2c6a0'; x.fillRect(3, 1, 3, 3); x.fillRect(10, 1, 3, 3); x.fillStyle = '#ffe060'; x.fillRect(6, 7, 4, 2); };
MOD_AUTHORS.adventure_squad = 'Terraria clone';
ModList.current = 'adventure_squad';
for (const id in COMPANION_DEFS) if (!COMPANION_DEFS[id].guardian && ITEMS[`${id}_bag`]) ITEMS[`${id}_bag`].mod = 'adventure_squad';

const Squad = {
  prompt: null,          // pending request { c, items, why, key, kind }
  nextPromptAt: 0,
  weaponCache: {},

  // ---- companion state --------------------------------------------------------------------------
  init(c) {
    if (c.sq) return;
    const d = COMPANION_DEFS[c.id] || {};
    c.sq = true; c.cls = d.cls || 'melee';
    c.inventory = c.inventory || new Array(SQUAD_INV).fill(null);
    c.armor = c.armor || [null, null, null]; c.vanity = c.vanity || [null, null, null]; c.dyes = c.dyes || [null, null, null]; c.accessories = c.accessories || [null, null, null, null]; c.pet = c.pet || null; c.lightPet = c.lightPet || null; c.lightPos = { x: c.x, y: c.y };
    c.equipment = c.equipment || {}; for (const k of SQUAD_GEAR) c.equipment[k] = c.equipment[k] || null; c.stats = {}; c.input = { left: false, right: false, jump: false, down: false }; c.wingFlight = 0; c.hookRange = 0; c.hookT = 0; c.hookCd = 0; c.panicT = 0; c.flightTime = 0; c.mounted = null; c.modData = {};
    c.lifeCrystals = c.lifeCrystals || 0; c.manaCrystals = c.manaCrystals || 0;
    c.maxMana = 20; c.mana = c.mana == null ? 20 : c.mana; c.manaDelay = 0;
    c.minions = []; c.asked = c.asked || {}; c.sickness = 0; c.weaponI = -1; c.whipI = -1; c.evalAt = 0; c.noAmmo = false; c.buffs = c.buffs || {}; c.combatT = 0; c.drinkCd = 0; c.job = c.job || null; c.jobTarget = null; c.jobSkip = {}; c.jobMsgT = 0; c.toolSwing = 0;
    c.petPos = { x: c.x, y: c.y, vx: 0, hop: 0, dir: 1 };
    c.pm = this.basePm();
    if (!c.started) { c.started = true; for (const [id, n] of (d.starterItems || [])) this.invAdd(c, id, n); }
    this.refresh(c);
  },
  basePm() { return { move: 1, accel: 1, jump: 1, defAdd: 0, defMult: 1, dmg: 1, crit: 0, kbResist: 0, kbMult: 1, useTime: 1, pickup: 0, place: 0, regenAdd: 0, regenTime: 1, fallBonus: 0, autoJump: false, lavaImmune: false, dr: 0, rangedDmg: 1, projSpeed: 1, magicDmg: 1, summonDmg: 1, minionSlots: 0, sentrySlots: 0, manaRegen: 0, whipRange: 1, whipSpeed: 1, whipTag: 0 }; },
  saveData(c) { return c.sq ? { inv: c.inventory, armor: c.armor, vanity: c.vanity, dyes: c.dyes, acc: c.accessories, eq: c.equipment, pet: c.pet, lightPet: c.lightPet, mana: c.mana, lifeCrystals: c.lifeCrystals, manaCrystals: c.manaCrystals, asked: c.asked, buffs: c.buffs, job: c.job || null, build: c.build ? { site: c.build.site, plan: c.build.plan } : null, started: true } : {}; },
  restore(c, s) {
    if (!s.started) return;
    c.inventory = (s.inv || []).slice(0, SQUAD_INV); while (c.inventory.length < SQUAD_INV) c.inventory.push(null);
    c.armor = s.armor || [null, null, null]; c.vanity = s.vanity || [null, null, null]; c.dyes = s.dyes || [null, null, null]; c.accessories = s.acc || [null, null, null, null]; while (c.accessories.length < 4) c.accessories.push(null); c.pet = s.pet || null; c.lightPet = s.lightPet && ITEMS[s.lightPet.id] ? s.lightPet : null;
    c.equipment = {}; for (const k of SQUAD_GEAR) c.equipment[k] = (s.eq && s.eq[k] && ITEMS[s.eq[k].id]) ? s.eq[k] : null;
    c.mana = s.mana || 0; c.lifeCrystals = s.lifeCrystals || 0; c.manaCrystals = s.manaCrystals || 0; c.asked = s.asked || {}; c.buffs = s.buffs || {}; c.job = s.job || null; c.build = s.build && s.build.site ? { site: s.build.site, plan: s.build.plan || 'house', i: 0, steps: null } : null; if (c.job === 'build' && !c.build) c.job = null; c.started = true;
    for (const arr of [c.inventory, c.armor, c.vanity, c.dyes, c.accessories]) for (let i = 0; i < arr.length; i++) if (arr[i] && !ITEMS[arr[i].id]) arr[i] = null;
    if (c.pet && !ITEMS[c.pet.id]) c.pet = null;
  },

  // ---- inventory helpers -----------------------------------------------------------------------
  invCount(c, id) { let n = 0; for (const s of c.inventory) if (s && s.id === id) n += s.count; return n; },
  invAdd(c, id, count, prefix) {
    const def = ITEMS[id]; if (!def) return count;
    for (let i = 0; i < SQUAD_INV && count > 0; i++) { const s = c.inventory[i]; if (s && s.id === id && s.count < def.max && def.max > 1) { const n = Math.min(def.max - s.count, count); s.count += n; count -= n; } }
    for (let i = 0; i < SQUAD_INV && count > 0; i++) if (!c.inventory[i]) { const n = Math.min(def.max, count); c.inventory[i] = makeStack(id, n, prefix); count -= n; }
    return count;
  },
  invRemove(c, id, count) { for (let i = SQUAD_INV - 1; i >= 0 && count > 0; i--) { const s = c.inventory[i]; if (s && s.id === id) { const n = Math.min(s.count, count); s.count -= n; count -= n; if (s.count <= 0) c.inventory[i] = null; } } },
  hasRoom(c, id, count) { const def = ITEMS[id]; let space = 0; for (const s of c.inventory) { if (!s) space += def.max; else if (s.id === id) space += def.max - s.count; if (space >= count) return true; } return false; },

  // ---- classification --------------------------------------------------------------------------
  weaponClass(it) {
    if (!it || !(it.damage > 0) || (it.tool && !it.wclass && !it.sword) || it.ammo) return null;
    if (it.wclass === 'summon' || it.wclass === 'whip' || it.minion) return 'summon';
    if (it.wclass === 'bow' || it.wclass === 'gun' || it.wclass === 'launcher') return it.ammoKind === 'flare' ? null : 'ranged';
    if (it.magic || it.wclass === 'magic') return 'magic';
    if (it.sword || it.wclass === 'spear' || it.wclass === 'flail' || it.wclass === 'yoyo' || it.wclass === 'boomerang') return 'melee';
    return null;
  },
  // rough damage-per-second score of a weapon for its class
  weaponScore(stack) {
    const it = ITEMS[stack.id]; const cls = this.weaponClass(it); if (!cls) return 0;
    const st = stack.count != null ? itemStats(stack) : { damage: it.damage, useTime: it.useTime };
    const per = 60 / Math.max(4, st.useTime || 20);
    if (cls === 'summon') { if (it.wclass === 'whip') return st.damage * per * (1 + (it.tagDamage || 0) / 8) * 0.9; const m = it.minion || {}; return (m.damage || st.damage) * (m.ranged ? 60 / (m.rate || 40) * 1.2 : 3) * 1.3; }
    let s = st.damage * per * (it.shots || (it.multi ? it.multi.length : 1)) * (1 + (it.pierce || 0) * 0.08);
    if (cls === 'ranged') s = (st.damage + 5) * per * (it.shots || 1);
    if (cls === 'melee') { if (it.sword === 'short') s *= 0.85; if (it.swingProj) s *= 1.25; if (it.wclass === 'spear') s *= 1.1; }
    if (cls === 'magic' && it.manaCost) s *= clamp(45 / (it.manaCost * per), 0.6, 1);
    return s;
  },
  _armorCls: {},
  armorClasses(it) {
    if (this._armorCls[it.id]) return this._armorCls[it.id];
    const set = new Set(); const text = ((ARMOR_SETS[it.set] && ARMOR_SETS[it.set].desc) || '') + ' ' + (it.desc || '') + ' ' + (it.tooltip || '');
    if (/\bmelee\b|\bswords?\b|\bswing/i.test(text)) set.add('melee'); if (/\branged\b|\barrows?\b|\bbullets?\b|\bammo\b|\branger\b/i.test(text)) set.add('ranged');
    if (/\bmagic\b|\bmana\b|\bmage\b|\bspells?\b/i.test(text) || it.manaBonus) set.add('magic'); if (/\bminions?\b|\bsummon|\bwhips?\b|\bsentr/i.test(text)) set.add('summon');
    // probe the bonus functions: which class-specific modifiers do they touch?
    const probe = { armor: [null, null, null], accessories: [null, null, null, null], equipment: {}, buffs: {}, hasBuff: () => false, addBuff() {}, inventory: [], vx: 0, vy: 0, onGround: true, hp: 100, maxHp: 100, mana: 20, maxMana: 20, x: 0, y: 0, cx: 0, cy: 0, dir: 1, stats: {}, modData: {}, panicT: 0, flightTime: 0, tileX: 0, tileY: 0 };
    const pm = this.basePm(); const g = window.game;
    try { if (ARMOR_PIECE_MODS[it.id]) ARMOR_PIECE_MODS[it.id](probe, pm, g); if (it.set && ARMOR_SETS[it.set] && ARMOR_SETS[it.set].bonus) ARMOR_SETS[it.set].bonus(probe, pm, g); } catch (e) {}
    if (pm.useTime < 1 || (pm.meleeDmg && pm.meleeDmg !== 1) || pm.meleeCrit || (pm.meleeSpeed && pm.meleeSpeed !== 1)) set.add('melee'); if (pm.rangedDmg !== 1 || pm.rangedCrit || pm.ammoSave || pm.dupShot || pm.scope) set.add('ranged');
    if (pm.magicDmg !== 1 || pm.magicCrit || pm.manaRegen || pm.manaCostPct || pm.magicStacks || pm.magicFlat) set.add('magic'); if (pm.summonDmg !== 1 || pm.minionSlots || pm.sentrySlots || pm.whipRange !== 1 || pm.whipSpeed !== 1 || pm.whipTag) set.add('summon');
    const r = set.size ? [...set] : ['any']; this._armorCls[it.id] = r; return r;
  },
  armorScore(it, cls) { const cs = this.armorClasses(it); const match = cs.includes(cls), any = cs.includes('any'); if (!match && !any) return 0; return (it.defense || 0) * (match ? 1.3 : 1) + (match ? 2 : 0); },
  ACC_KEYS: {
    melee: ['meleeSpeed', 'meleeFire', 'yoyoBag', 'swordsmanBadge', 'skywardHilt', 'sheath', 'berserk', 'boneHands', 'gelatin'],
    ranged: ['rangedDmgPct', 'ammoSave', 'dupShot', 'scope', 'arrowCrit', 'projSpeedPct', 'thornQuiver', 'boneThrow'],
    magic: ['manaBonus', 'manaCostPct', 'manaRegen', 'magicDmgPct', 'magicStacks', 'magicFlat', 'autoMana', 'manaOnHurt', 'magicGlove', 'manaField', 'starpower', 'starBand', 'starCloak'],
    summon: ['minionSlots', 'summonDmg', 'sentrySlots', 'whipRange', 'whipSpeed', 'whipTag', 'whipFire', 'whipBees', 'whipTagCrit', 'whipVuln', 'pygmy', 'possess', 'serpentFang', 'snakeSkin', 'serpentBonus', 'larvaPet', 'gloveStars'],
  },
  ACC_IDS: { summon: ['stone_of_illusions', 'hercules_beetle', 'papyrus_scarab', 'necromantic_scroll'], melee: ['fire_gauntlet', 'power_glove', 'titan_glove'], magic: ['mana_flower', 'celestial_cuffs', 'celestial_magnet', 'magnet_flower'], ranged: ['magic_quiver', 'molten_quiver', 'stalkers_quiver', 'rifle_scope', 'sniper_scope'] },
  accClasses(it) {
    const r = [];
    for (const cls in this.ACC_IDS) if (this.ACC_IDS[cls].includes(it.id) && !r.includes(cls)) r.push(cls);
    for (const cls in this.ACC_KEYS) if ((this.ACC_KEYS[cls].some(k => it[k]) || it.emblem === cls) && !r.includes(cls)) r.push(cls);
    if (it.emblem && !r.includes(it.emblem)) r.push(it.emblem);
    return r;
  },
  accScore(it, cls) {
    if (!it.accessory || it.slot || it.mount || it.pet) return 0;
    const cs = this.accClasses(it); if (cs.length && !cs.includes(cls)) return 0;
    // only accessories that help in a fight count (fishing, building and coin trinkets are ignored)
    let s = (it.defense || 0) * 3 + (it.dmg || 0) * 1.5 + (it.crit || 0) * 1.5 + (it.moveSpeed || 0) * 0.3 + (it.regen || 0) * 2 + (it.dr || 0) * 40 + (it.kbImmune ? 8 : 0) + (it.doubleJump ? 5 : 0) + (it.jumpBoost || 0) * 10 + (it.dodge ? 10 : 0) + (it.thorns ? 3 : 0) + (it.crossNecklace || it.longInvuln ? 6 : 0) + (it.shell || it.frozenShell ? 5 : 0) + (it.honeyComb ? 4 : 0) + (it.ankh ? 15 : 0) + (it.charm ? 4 : 0) + (it.lavaImmune ? 3 : 0) + (it.sunStone || it.moonStone ? 12 : 0) + (it.berserk ? 8 : 0);
    if (cs.includes(cls)) { s += 20 + (this.ACC_IDS[cls].includes(it.id) ? 10 : 0); if (cls === 'summon') s += (it.minionSlots || 0) * 12 + (it.summonDmg || 0); if (cls === 'magic') s += (it.manaBonus || 0) / 4 + (it.magicDmgPct || 0) + (it.manaRegen || 0) * 2; if (cls === 'ranged') s += (it.rangedDmgPct || 0) + (it.ammoSave || 0) * 40; if (cls === 'melee') s += (it.meleeSpeed || 0) * 100; }
    return s > 0 ? s + (it.rarity || 0) * 3 : 0;
  },
  petScore(it, cls) {
    if (!it.pet || it.pet !== 'regular' || !PETS[it.id]) return 0;
    const pc = PETS[it.id].cls; if (pc === 'Mining') return 0;
    let s = (it.rarity || 0) * 4 + 4;
    if (pc === 'Melee') s += cls === 'melee' ? 30 : 6; else if (pc === 'Offensive') s += 18; else if (pc === 'Defensive') s += cls === 'melee' ? 16 : 10; else if (pc === 'Mobility') s += 8; else if (pc === 'Utility') s += 6;
    return s;
  },
  // which class a buff potion serves: probe its buff modifier
  _potCls: {},
  potionClasses(it) {
    if (!it.buffName) return null; if (this._potCls[it.id]) return this._potCls[it.id];
    const fn = BUFF_MODS[it.buffName]; const r = new Set();
    if (fn) {
      const pm = this.basePm(); const probe = { armor: [null, null, null], accessories: [null, null, null, null], equipment: {}, buffs: {}, hasBuff: () => false, addBuff() {}, inventory: [], vx: 0, vy: 0, onGround: true, hp: 100, maxHp: 100, mana: 20, maxMana: 20, x: 0, y: 0, cx: 0, cy: 0, dir: 1, stats: {}, modData: {}, panicT: 0, flightTime: 0, tileX: 0, tileY: 0 };
      try { fn(probe, pm, window.game); } catch (e) {}
      if (pm.useTime < 1 || (pm.meleeDmg && pm.meleeDmg !== 1) || pm.meleeCrit) r.add('melee'); if (pm.rangedDmg !== 1 || pm.projSpeed !== 1 || pm.ammoSave || pm.rangedCrit) r.add('ranged');
      if (pm.magicDmg !== 1 || pm.manaRegen || pm.manaCostPct || pm.magicStacks) r.add('magic'); if (pm.summonDmg !== 1 || pm.minionSlots || pm.sentrySlots || pm.whipRange !== 1 || pm.whipSpeed !== 1 || pm.whipTag) r.add('summon');
      if (!r.size && (pm.dmg !== 1 || pm.crit || pm.defAdd || pm.regenAdd || pm.move > 1 || pm.modDr || pm.lifeforce || pm.kbMult !== 1 || pm.defMult !== 1)) r.add('any');
    }
    const res = r.size ? [...r] : []; this._potCls[it.id] = res; return res;
  },
  potionScore(it, cls) { const cs = this.potionClasses(it); if (!cs || !cs.length) return 0; if (cs.includes(cls)) return 3; if (cs.includes('any')) return 1; return 0; },
  gearScore(it) {
    if (!it.slot || !SQUAD_GEAR.includes(it.slot)) return 0; const r = (it.rarity || 0) * 3;
    if (it.slot === 'boots') return (it.moveSpeed || 0) + (it.flight ? it.flight / 60 * 4 : 0) + (it.lavaImmune ? 5 : 0) + r + 2;
    if (it.slot === 'shield') return (it.defense || 0) * 3 + (it.kbImmune ? 8 : 0) + (it.dr || 0) * 40 + (it.fireImmune ? 3 : 0) + r + 2;
    if (it.slot === 'wings') return (it.flight || 0) / 60 * 5 + (it.moveSpeed || 0) * 0.3 + r + 2;
    return (it.hookRange || 0) + (it.hookSpeed || 0) * 0.5 + r + 2;
  },
  // light pets: quality rolls plus how much their stats matter to the class
  lightScore(stack, cls) {
    const def = LIGHT_PETS[stack.id]; if (!def) return 0;
    if (!stack.quality) rollLightPet(stack);
    let s = 6 + lightPetQualityPct(stack) * 20;
    def.stats.forEach((st, i) => { const v = lightPetStat(stack, i); const cm = { damage: 1.2, crit: 1.2, defense: 1.5, defensePct: 0.6, dr: 1.5, moveSpeed: 0.3, maxHp: 0.3, meleeKb: cls === 'melee' ? 0.6 : 0, haste: 0, rangedDamage: cls === 'ranged' ? 2 : 0, projSpeed: cls === 'ranged' ? 1 : 0, petDamage: 0, petHealing: 0, petShielding: 0, miningFortune: 0, harvestFortune: 0, globalFortune: 0, accel: 0.2 }[st.key]; if (cm) s += v * cm; });
    return s;
  },
  itemScore(c, stack) {
    const it = ITEMS[stack.id]; if (!it || !ModList.itemOk(stack.id)) return { kind: null, score: 0 };
    if (it.pet === 'light') return { kind: 'light', score: this.lightScore(stack, c.cls) };
    if (it.slot && SQUAD_GEAR.includes(it.slot)) return { kind: 'eq:' + it.slot, score: this.gearScore(it) };
    if (this.weaponClass(it) === c.cls) return { kind: c.cls === 'summon' && it.wclass === 'whip' ? 'whip' : 'weapon', score: this.weaponScore(stack) };
    if (it.armor) return { kind: 'armor:' + it.armor, score: this.armorScore(it, c.cls) };
    if (it.accessory && !it.slot && !it.mount) return { kind: 'acc', score: this.accScore(it, c.cls) };
    if (it.pet === 'regular') return { kind: 'pet', score: this.petScore(it, c.cls) };
    return { kind: null, score: 0 };
  },
  currentScore(c, kind) {
    if (kind === 'weapon') { const s = c.inventory[c.weaponI]; return s ? this.weaponScore(s) : 0; }
    if (kind === 'whip') { const s = c.inventory[c.whipI]; return s ? this.weaponScore(s) : 0; }
    if (kind.startsWith('armor:')) { const idx = { head: 0, body: 1, legs: 2 }[kind.slice(6)]; const a = c.armor[idx]; return a ? this.armorScore(ITEMS[a.id], c.cls) : 0; }
    if (kind === 'acc') { let worst = Infinity; for (const a of c.accessories) worst = Math.min(worst, a ? this.accScore(ITEMS[a.id], c.cls) : 0); return worst; }
    if (kind === 'pet') return c.pet ? this.petScore(ITEMS[c.pet.id], c.cls) : 0;
    if (kind === 'light') return c.lightPet ? this.lightScore(c.lightPet, c.cls) : 0;
    if (kind.startsWith('eq:')) { const e = c.equipment[kind.slice(3)]; return e ? this.gearScore(ITEMS[e.id]) : 0; }
    return 0;
  },

  // ---- equipment choice and stats -------------------------------------------------------------
  // gear a companion stops using is sold on the spot; the coins go to you
  sell(c, stack, game) {
    if (!game || !stack) return false;
    const value = Math.floor(stackValue(stack) / 5) * (stack.count || 1); if (value <= 0) return false;
    const p = game.player; p.coins += value;
    game.message(`${c.name} sold ${itemDisplayName(stack)} for ${coinsToString(value)}.`, '#ffe75a'); game.addDamageText(p.cx, p.y, '+' + coinsToString(value), '#ffe75a'); Audio_.play('coin');
    return true;
  },
  // gear from a disabled mod comes off into the bag
  stripDisabled(c) {
    const off = (st) => st && ITEMS[st.id] && ITEMS[st.id].mod && !ModList.on(ITEMS[st.id].mod);
    const back = (st) => { const left = this.invAdd(c, st.id, st.count || 1, st.prefix); if (left > 0 && window.game) window.game.dropItem(c.cx, c.cy, st.id, left, null, null); };
    for (const arr of [c.armor, c.vanity, c.accessories, c.dyes]) for (let i = 0; i < arr.length; i++) if (off(arr[i])) { back(arr[i]); arr[i] = null; }
    for (const k of SQUAD_GEAR) if (off(c.equipment[k])) { back(c.equipment[k]); c.equipment[k] = null; }
    if (off(c.pet)) { back(c.pet); c.pet = null; } if (off(c.lightPet)) { back(c.lightPet); c.lightPet = null; }
  },
  refresh(c) {
    const game = window.game; this.stripDisabled(c);
    // best class weapon (ranged: prefer one with ammo), best whip for the summoner
    let best = 0, bi = -1, wb = 0, wi = -1;
    for (let i = 0; i < SQUAD_INV; i++) {
      const s = c.inventory[i]; if (!s) continue; const it = ITEMS[s.id]; if (!it || !ModList.itemOk(s.id)) continue;
      if (this.weaponClass(it) !== c.cls) continue;
      if (c.cls === 'summon' && it.wclass === 'whip') { const sc = this.weaponScore(s); if (sc > wb) { wb = sc; wi = i; } continue; }
      let sc = this.weaponScore(s);
      if (c.cls === 'ranged' && !c.inventory.some(a => a && ITEMS[a.id].ammo === (it.ammoKind || 'bullet'))) sc *= 0.01;
      if (sc > best) { best = sc; bi = i; }
    }
    c.weaponI = bi; c.whipI = wi;
    // outclassed weapons are sold (a gun waiting for bullets is kept)
    for (let i = 0; i < SQUAD_INV; i++) {
      const s = c.inventory[i]; if (!s || i === bi || i === wi) continue; const it = ITEMS[s.id]; if (!it || this.weaponClass(it) !== c.cls) continue;
      const isWhip = c.cls === 'summon' && it.wclass === 'whip', curI = isWhip ? wi : bi; if (curI < 0) continue;
      if (this.weaponScore(s) < this.weaponScore(c.inventory[curI]) && this.sell(c, s, game)) c.inventory[i] = null;
    }
    // auto-equip better gear carried in the inventory; whatever it replaces is sold
    for (let i = 0; i < SQUAD_INV; i++) {
      const s = c.inventory[i]; if (!s) continue; const sc = this.itemScore(c, s); if (!sc.kind || sc.kind === 'weapon' || sc.kind === 'whip' || sc.score <= 0) continue;
      if (sc.score > this.currentScore(c, sc.kind) + 0.01) { const out = this.equip(c, s, sc.kind); c.inventory[i] = out && !this.sell(c, out, game) ? out : null; }
    }
    this.computeMods(c, game);
  },
  // put a stack into its equipment slot; returns whatever was there (or null)
  equip(c, s, kind) {
    if (kind === 'weapon' || kind === 'whip') return s;
    if (kind.startsWith('armor:')) { const idx = { head: 0, body: 1, legs: 2 }[kind.slice(6)]; const old = c.armor[idx]; c.armor[idx] = s; return old; }
    if (kind === 'acc') { if (c.accessories.some(a => a && a.id === s.id)) return s; let idx = c.accessories.indexOf(null); if (idx < 0) { let worst = Infinity; for (let k = 0; k < c.accessories.length; k++) { const v = this.accScore(ITEMS[c.accessories[k].id], c.cls); if (v < worst) { worst = v; idx = k; } } } const old = c.accessories[idx]; c.accessories[idx] = s; return old; }
    if (kind === 'pet') { const old = c.pet; c.pet = s; return old; }
    if (kind === 'light') { const old = c.lightPet; c.lightPet = s; return old; }
    if (kind.startsWith('eq:')) { const k = kind.slice(3); const old = c.equipment[k]; c.equipment[k] = s; return old; }
    return s;
  },
  computeMods(c, game) {
    const pm = this.basePm(); c.pm = pm; c.lightHp = 0;
    let def = 0, manaBonus = 0, manaCostPct = 0, def0 = 0;
    for (const a of c.armor) if (a) { const it = ITEMS[a.id]; def += it.defense || 0; manaBonus += it.manaBonus || 0; manaCostPct += it.manaCostPct || 0; try { if (ARMOR_PIECE_MODS[a.id]) ARMOR_PIECE_MODS[a.id](c, pm, game); } catch (e) {} }
    const set = c.armor[0] && c.armor[1] && c.armor[2] && ITEMS[c.armor[0].id].set && ITEMS[c.armor[1].id].set === ITEMS[c.armor[0].id].set && ITEMS[c.armor[2].id].set === ITEMS[c.armor[0].id].set ? ITEMS[c.armor[0].id].set : null;
    if (set && ARMOR_SETS[set] && ARMOR_SETS[set].bonus) { try { ARMOR_SETS[set].bonus(c, pm, game); } catch (e) {} }
    for (const a of c.accessories) if (a) {
      const it = ITEMS[a.id]; def += it.defense || 0; manaBonus += it.manaBonus || 0; manaCostPct += it.manaCostPct || 0;
      if (it.dmg) pm.dmg *= 1 + it.dmg / 100; if (it.crit) pm.crit += it.crit; if (it.regen) pm.regenAdd += it.regen; if (it.minionSlots) pm.minionSlots += it.minionSlots; if (it.summonDmg) pm.summonDmg *= 1 + it.summonDmg / 100; if (it.dr) pm.dr += it.dr;
      if (it.emblem === 'melee') pm.dmg *= 1.15; else if (it.emblem === 'ranged') pm.rangedDmg *= 1.15; else if (it.emblem === 'magic') pm.magicDmg *= 1.15; else if (it.emblem) pm.summonDmg *= 1.15;
      if (it.meleeSpeed) pm.useTime *= 1 - it.meleeSpeed; if (it.manaRegen) pm.manaRegen += it.manaRegen; if (it.rangedDmgPct) pm.rangedDmg *= 1 + it.rangedDmgPct / 100; if (it.magicDmgPct) pm.magicDmg *= 1 + it.magicDmgPct / 100; if (it.projSpeedPct) pm.projSpeed *= 1 + it.projSpeedPct;
      if (it.ammoSave) pm.ammoSave = Math.max(pm.ammoSave || 0, it.ammoSave); if (it.sentrySlots) pm.sentrySlots += it.sentrySlots; if (it.whipRange) pm.whipRange *= 1 + it.whipRange; if (it.whipSpeed) pm.whipSpeed *= 1 + it.whipSpeed; if (it.whipTag) pm.whipTag += it.whipTag;
      if (it.moveSpeed) pm.move *= 1 + it.moveSpeed / 100; if (it.kbImmune) pm.kbResist = 1; if (it.jumpBoost) pm.jump *= 1 + it.jumpBoost; if (it.lavaImmune) pm.lavaImmune = true;
    }
    for (const b in c.buffs) if (c.buffs[b] > 0 && BUFF_MODS[b]) { try { BUFF_MODS[b](c, pm, game); } catch (e) {} }
    c.wingFlight = 0; c.hookRange = 0;
    for (const k of SQUAD_GEAR) { const e = c.equipment[k]; if (!e) continue; const it = ITEMS[e.id]; def += it.defense || 0; if (it.moveSpeed) pm.move *= 1 + it.moveSpeed / 100; if (it.kbImmune) pm.kbResist = 1; if (it.dr) pm.dr += it.dr; if (it.lavaImmune) pm.lavaImmune = true; if (it.flight) c.wingFlight = Math.max(c.wingFlight, it.flight); if (it.hookRange) c.hookRange = it.hookRange; if (it.dmg) pm.dmg *= 1 + it.dmg / 100; if (it.crit) pm.crit += it.crit; }
    if (c.lightPet && LIGHT_PETS[c.lightPet.id] && ModList.on('pets_overhaul')) { const def = LIGHT_PETS[c.lightPet.id]; if (!c.lightPet.quality) rollLightPet(c.lightPet); def.stats.forEach((st, i) => { const v = lightPetStat(c.lightPet, i); switch (st.key) { case 'moveSpeed': pm.move *= 1 + v / 100; break; case 'accel': pm.accel *= 1 + v / 100; break; case 'defense': def0 += v; break; case 'defensePct': pm.defMult *= 1 + v / 100; break; case 'damage': pm.dmg *= 1 + v / 100; break; case 'crit': pm.crit += v; break; case 'dr': pm.dr += v / 100; break; case 'rangedDamage': pm.rangedDmg *= 1 + v / 100; break; case 'projSpeed': pm.projSpeed *= 1 + v / 100; break; case 'meleeKb': pm.kbMult *= 1 + v / 100; break; case 'haste': pm.useTime *= 1 - v / 200; break; case 'maxHp': c.lightHp = Math.round(v); break; } }); }
    if (c.pet && PETS[c.pet.id] && ModList.on('pets_overhaul')) { const pc = PETS[c.pet.id].cls; if (pc === 'Offensive') pm.dmg *= 1.08; else if (pc === 'Melee') pm.dmg *= c.cls === 'melee' ? 1.12 : 1.04; else if (pc === 'Defensive') { pm.defMult *= 1.06; pm.regenAdd += 2; } else if (pc === 'Mobility') { pm.move *= 1.12; pm.jump *= 1.1; } else if (pc === 'Utility') pm.regenAdd += 3; }
    pm.dmg *= 1 + 0.08 * (c.level - 1);
    c.gearDefense = def + def0; c.manaCostPct = manaCostPct;
    c.maxMana = 20 + 20 * c.manaCrystals + manaBonus; if (c.mana > c.maxMana) c.mana = c.maxMana;
    const want = 100 + 20 * (c.level - 1) + 20 * c.lifeCrystals + (c.lightHp || 0); if (c.maxHp !== want) { c.hp = Math.min(want, c.hp + Math.max(0, want - c.maxHp)); c.maxHp = want; }
  },
  minionMax(c) { return 1 + (c.pm.minionSlots || 0); },
  // outfit of a companion: armor plating, with vanity pieces overriding the slot they cover
  look(c) {
    const ap = armorPalettes(c); const colors = Object.assign({}, c.colors); let { head, body, legs } = ap;
    for (const i of [0, 1, 2]) { const v = ap.vanity[i]; if (v) { for (const k in v) colors[k] = c.dyes && c.dyes[i] && typeof Equipment !== 'undefined' ? Equipment.dyeColor(v[k], c.dyes[i]) : v[k]; if (i === 0) head = null; else if (i === 1) body = null; else legs = null; } }
    return { colors, head, body, legs };
  },

  // ---- combat ---------------------------------------------------------------------------------
  attack(c, target, game) {
    const slot = c.inventory[c.weaponI]; if (!slot) return false;
    const it = ITEMS[slot.id], st = itemStats(slot), pm = c.pm;
    const use = Math.max(4, Math.round(st.useTime * pm.useTime * (c.cls === 'melee' ? (pm.meleeSpeed || 1) : 1)));
    const dx = target.cx - c.cx, dy = target.cy - (c.y + 14), d = Math.hypot(dx, dy) || 1, adx = Math.abs(dx);
    const clsCrit = c.cls === 'melee' ? (pm.meleeCrit || 0) : c.cls === 'ranged' ? (pm.rangedCrit || 0) : c.cls === 'magic' ? (pm.magicCrit || 0) : 0;
    const crit = () => Math.random() * 100 < (st.crit || 0) + pm.crit + clsCrit;
    const meleeMult = pm.meleeDmg || 1;
    if (c.cls === 'melee') {
      if (it.sword) {
        const reach = it.reach ? it.reach * TILE : (it.sword === 'short' ? 38 : 56 + Math.min(24, Math.floor(st.damage / 4)));
        if (adx > reach + 6 || Math.abs(target.cy - c.cy) > 52) return false;
        this.startUse(c, use); const x0 = c.dir > 0 ? c.cx : c.cx - reach, x1 = c.dir > 0 ? c.cx + reach : c.cx; let hit = false;
        const dmg = Math.round(st.damage * pm.dmg * meleeMult);
        for (const e of game.enemies) if (!e.dead && e.x < x1 && e.x + e.w > x0 && e.y < c.y + c.h + 6 && e.y + e.h > c.y - 12) { e.hit(dmg, c.cx, st.knockback || 4, game, 'c' + c.id + c.swingId, crit()); hit = true; }
        if (it.swingProj) { const sp = it.swingProj; modShot(game, c.cx, c.y + 14, dx / d * (sp.speed || 8), dy / d * (sp.speed || 8), { damage: Math.round(dmg * (sp.mult || 0.75)), color: sp.color || '#c0ffc0', owner: c, life: 60, homing: sp.homing, knockback: st.knockback }); }
        if (typeof WeaponMods !== 'undefined' && WeaponMods.cfg.slashFx && ModList.on('armament_display')) { const col = (it.swingProj && it.swingProj.color) || (it.icon && it.icon.mat && MATERIALS[it.icon.mat] ? MATERIALS[it.icon.mat].M : '#e0e0ff'); const rr = it.sword === 'short' ? 30 : 46; for (let k = 0; k < 7; k++) { const a = -1.4 + k * 0.4; game.particles.push(new Particle(c.cx + c.dir * Math.cos(a) * rr, c.y + 16 + Math.sin(a) * rr * 0.9, c.dir * 0.5, 0, col, 9 + k, 3)); } }
        Audio_.play(hit ? 'hit' : 'swing'); return true;
      }
      const range = it.wclass === 'spear' ? 4 * TILE : 11 * TILE; if (d > range) return false;
      this.startUse(c, use);
      const dmg = Math.round(st.damage * pm.dmg * meleeMult);
      if (it.wclass === 'spear') { const b = new Projectile(c.cx, c.y + 14, dx / d * 9, dy / d * 9, { kind: 'spear', damage: dmg, friendly: true, owner: c, knockback: st.knockback, crit: crit(), pierce: 999, color: it.color || '#c0c0c8' }); b.life = 16; b.gravity = 0; b.ghost = true; game.projectiles.push(b); }
      else { if (game.projectiles.some(b => b.kind === 'bonemerang' && b.owner === c && !b.dead)) return false; const b = new Projectile(c.cx, c.y + 14, dx / d * 9, dy / d * 9, { kind: 'bonemerang', damage: dmg, friendly: true, owner: c, knockback: st.knockback, crit: crit(), pierce: 999, color: it.color || (it.wclass === 'flail' ? '#808088' : '#ff4040') }); b.look = it.wclass; b.life = 100; b.gravity = 0; b.ghost = true; if (it.wclass === 'boomerang') b.trail = { color: it.color || '#ffd0a0', len: 6, width: 2 }; game.projectiles.push(b); }
      Audio_.play('swing'); return true;
    }
    if (c.cls === 'ranged') {
      if (d > 14 * TILE) return false;
      const kind = it.ammoKind || 'bullet'; const ai = c.inventory.findIndex(a => a && ITEMS[a.id].ammo === kind);
      if (ai < 0) { c.noAmmo = true; return false; } c.noAmmo = false;
      const ammo = c.inventory[ai], ad = ITEMS[ammo.id];
      this.startUse(c, use, 12); c.aimDir = { x: dx / d, y: dy / d };
      const n = it.shots || 1, spread = it.spread || 0.04, arc = kind === 'arrow' ? -Math.min(3, d / 120) / 12 : 0;
      for (let k = 0; k < n; k++) { const a = Math.atan2(dy / d + arc, dx / d) + rand(-spread, spread) + (n > 1 ? (k - (n - 1) / 2) * 0.08 : 0); const sp = (it.speed || 12) * pm.projSpeed * (ad.speedMult || 1); const b = new Projectile(c.cx, c.y + 14, Math.cos(a) * sp, Math.sin(a) * sp, { kind: ad.projKind || (kind === 'arrow' ? 'arrow' : kind === 'rocket' ? 'grenade' : 'bullet'), damage: Math.round((st.damage + (ad.damage || 0)) * pm.dmg * pm.rangedDmg), friendly: true, owner: c, knockback: (st.knockback || 2) + (ad.knockback || 0), crit: crit(), pierce: ad.pierce || 0, color: ad.color }); game.projectiles.push(b); }
      if (!(it.noConsume || (pm.ammoSave && Math.random() < pm.ammoSave))) { ammo.count--; if (ammo.count <= 0) c.inventory[ai] = null; }
      Audio_.play(kind === 'arrow' ? 'bow' : kind === 'rocket' ? 'launcher' : 'gun'); return true;
    }
    if (c.cls === 'magic') {
      if (d > 13 * TILE) return false;
      const cost = Math.max(1, Math.round((it.manaCost || 10) * (1 - Math.min(0.6, c.manaCostPct / 100))));
      if (c.mana < cost) { this.drinkMana(c, game); if (c.mana < cost) return false; }
      c.mana -= cost; c.manaDelay = 40;
      this.startUse(c, use, 12); c.aimDir = { x: dx / d, y: dy / d };
      const dmg = Math.round(st.damage * pm.dmg * pm.magicDmg), n = it.shots || (it.multi ? it.multi.length : 1);
      if (it.aoe) { FX.burst(game, target.cx, target.cy, 14, it.color || '#ffe060', 4, 25); for (const e of game.enemies) if (!e.dead && dist(e.cx, e.cy, target.cx, target.cy) < it.aoe * TILE) e.hit(dmg, target.cx, st.knockback || 2, game, null, crit()); }
      else for (let k = 0; k < n; k++) { const a = Math.atan2(dy, dx) + (n > 1 ? (k - (n - 1) / 2) * (it.spreadAng || 0.15) : 0) + rand(-(it.jitter || 0), it.jitter || 0); const sp = (it.speed || (it.spark ? 6 : 9)) * pm.projSpeed; const b = new Projectile(c.cx, c.y + 14, Math.cos(a) * sp, Math.sin(a) * sp, { kind: it.spark ? 'spark' : (it.projKind || 'bolt'), damage: dmg, friendly: true, owner: c, knockback: st.knockback || 2, crit: crit(), pierce: it.pierce || (it.spark ? 2 : 0), color: it.color || it.bolt || '#a0a0ff', hi: it.hi || it.boltHi || '#fff', magic: true }); if (it.homing) b.homingFriendly = it.homing; if (it.ghost) b.ghost = true; if (it.life) b.life = it.life; b.trail = { color: it.color || it.bolt || '#a0a0ff', len: 8, width: 3 }; game.projectiles.push(b); }
      Audio_.play('magic'); return true;
    }
    if (c.cls === 'summon') {
      // whip the target when close; minions are kept up separately
      const ws = c.inventory[c.whipI]; if (!ws) return false;
      const wit = ITEMS[ws.id], wst = itemStats(ws); const reach = (wit.reach || 5) * TILE * pm.whipRange;
      if (adx > reach || Math.abs(target.cy - (c.y + 14)) > 48) return false;
      const wuse = Math.max(4, Math.round(wst.useTime * pm.useTime / pm.whipSpeed)); this.startUse(c, wuse); c.whipAim = { x: dx / d, y: dy / d }; c.lashT = c.lashDur = wuse;
      const dmg = Math.round(wst.damage * pm.dmg); let n = 0;
      for (const e of game.enemies) { if (e.dead) continue; const inX = c.dir > 0 ? e.x + e.w > c.cx && e.x < c.cx + reach : e.x < c.cx && e.x + e.w > c.cx - reach; if (inX && Math.abs(e.cy - (c.y + 14)) < 40) { e.hit(dmg, c.cx, wst.knockback || 3, game, 'w' + c.id + c.swingId, crit()); e.whipTag = 120; e.whipTagDmg = (wit.tagDamage || 4) + pm.whipTag; n++; } }
      Audio_.play(n ? 'whip' : 'swing'); return true;
    }
    return false;
  },
  startUse(c, use, anim) { c.useTimer = c.useDuration = anim || use; c.attackCd = use; c.swingId++; },
  keepMinions(c, game) {
    const L = c.minions; for (let i = L.length - 1; i >= 0; i--) if (L[i].dead) L.splice(i, 1);
    if (c.ko > 0) { L.length = 0; return; }
    const slot = c.inventory[c.weaponI]; if (!slot) { L.length = 0; return; }
    const it = ITEMS[slot.id]; if (!it.minion || it.minion.sentry) return;
    // swap to the current staff's minions
    if (L.some(m => m.def.id !== it.id)) L.length = 0;
    const max = this.minionMax(c);
    if (L.length < max && --c.minionCd <= 0) {
      c.minionCd = 45; const cost = it.manaCost || 10;
      if (c.mana < cost) { this.drinkMana(c, game); if (c.mana < cost) return; }
      c.mana -= cost; c.manaDelay = 40;
      let def = Object.assign({ id: it.id, damage: it.damage, speed: 7 }, it.minion); if (it.minion.variant) { try { def = Object.assign(def, it.minion.variant(game, L)); } catch (e) {} }
      const m = new Minion(c.cx, c.y, def, c); if (it.minion.serpent) { m.segs = it.minion.segs || 6; m.hist = []; }
      L.push(m); FX.burst(game, c.cx, c.y + 10, 8, it.minion.color || '#c0ffc0', 3, 25); this.startUse(c, 20); c.summonT = 20;
    }
    for (const m of L) { try { m.update(game.world, game); } catch (e) { m.dead = true; } }
  },
  // buff potions are drunk when a fight starts (one every half second, never a buff already running)
  drinkBuff(c, game) {
    if (c.combatT <= 0 || c.drinkCd > 0) return;
    for (let i = 0; i < SQUAD_INV; i++) {
      const s = c.inventory[i]; if (!s) continue; const it = ITEMS[s.id]; if (!it.buffName || !it.consumable || c.hasBuff(it.buffName) || this.potionScore(it, c.cls) <= 0) continue;
      c.addBuff(it.buffName, it.buffTime || 60 * 240); s.count--; if (s.count <= 0) c.inventory[i] = null; c.drinkCd = 30;
      FX.burst(game, c.cx, c.cy, 8, '#c0ffc0', 2, 20); game.addDamageText(c.cx, c.y - 4, it.buffName, '#c0ffc0'); Audio_.play('potion'); this.computeMods(c, game); return;
    }
  },
  drinkMana(c, game) { if (c.manaSick > 0) return; const i = c.inventory.findIndex(s => s && ITEMS[s.id].mana > 0); if (i < 0) return; const s = c.inventory[i]; c.mana = Math.min(c.maxMana, c.mana + ITEMS[s.id].mana); c.manaSick = 60 * 5; s.count--; if (s.count <= 0) c.inventory[i] = null; game.addDamageText(c.cx, c.y, '+' + ITEMS[s.id].mana, '#60a0ff'); },
  drinkHealth(c, game) { if (c.sickness > 0 || c.hp > c.maxHp * 0.45) return; const i = c.inventory.findIndex(s => s && ITEMS[s.id].heal > 0 && ITEMS[s.id].consumable && !ITEMS[s.id].food); if (i < 0) return; const s = c.inventory[i]; const h = ITEMS[s.id].heal; c.hp = Math.min(c.maxHp, c.hp + h); c.sickness = 60 * 60; s.count--; if (s.count <= 0) c.inventory[i] = null; game.addDamageText(c.cx, c.y, '+' + h, '#40e060'); Audio_.play('heal'); },

  // ---- crafting and requests -------------------------------------------------------------------
  recipeOk(game, r) { return !(r.mod && !ModList.on(r.mod)) && ModList.itemOk(r.result) && !(r.cond && !r.cond(game)); },
  // what a companion gains from owning `id` (0 = nothing / wrong class)
  gain(c, id, count) {
    const it = ITEMS[id]; if (!it || !ModList.itemOk(id)) return { kind: null, gain: 0 };
    if (this.owns(c, id)) return { kind: null, gain: 0 }; // one of each is plenty
    const sc = this.itemScore(c, { id, count: count || 1 }); if (!sc.kind || sc.score <= 0) return { kind: null, gain: 0 };
    const cur = this.currentScore(c, sc.kind); return { kind: sc.kind, gain: sc.score - cur - 0.01, score: sc.score };
  },
  owns(c, id) { return c.inventory.some(s => s && s.id === id) || c.armor.some(a => a && a.id === id) || c.vanity.some(a => a && a.id === id) || c.accessories.some(a => a && a.id === id) || SQUAD_GEAR.some(k => c.equipment[k] && c.equipment[k].id === id) || (c.pet && c.pet.id === id) || (c.lightPet && c.lightPet.id === id); },
  tryCraft(c, game) {
    if (this.craftAmmo(c, game)) return true;
    if (c.job === 'build') return false; // building materials are not for gear
    let bestR = null, bestG = 0;
    // companions carry their own tools: no crafting station needed
    for (const r of RECIPES) {
      if (!this.recipeOk(game, r)) continue;
      const g = this.gain(c, r.result, r.count); if (g.gain <= bestG) continue;
      if (r.ing.every(([id, n]) => this.invCount(c, id) >= n)) { bestR = r; bestG = g.gain; }
    }
    if (!bestR) return false;
    for (const [id, n] of bestR.ing) this.invRemove(c, id, n);
    const left = this.invAdd(c, bestR.result, bestR.count); if (left) game.dropItem(c.cx, c.cy, bestR.result, left);
    game.message(`${c.name} crafted ${ITEMS[bestR.result].name}!`, '#ffe75a'); c.say(choose(['There we go.', 'Made it myself!', 'Much better.']));
    Audio_.play('craft'); this.refresh(c); return true;
  },
  // the ranger keeps her quiver topped up: ammo recipes for the weapon she carries (up to 100 rounds)
  craftAmmo(c, game) {
    const ak = this.ammoKindOf(c); if (!ak) return false;
    const have = () => c.inventory.reduce((n, s) => n + (s && ITEMS[s.id].ammo === ak ? s.count : 0), 0);
    if (have() >= 100) return false;
    const recs = RECIPES.filter(r => ITEMS[r.result] && ITEMS[r.result].ammo === ak && this.recipeOk(game, r) && r.ing.every(([id, n]) => this.invCount(c, id) >= n)).sort((a, b) => (ITEMS[b.result].damage || 0) - (ITEMS[a.result].damage || 0));
    const r = recs[0]; if (!r) return false;
    let made = 0;
    while (have() < 100 && made < 200 && r.ing.every(([id, n]) => this.invCount(c, id) >= n) && this.hasRoom(c, r.result, r.count)) { for (const [id, n] of r.ing) this.invRemove(c, id, n); this.invAdd(c, r.result, r.count); made += r.count; }
    if (!made) return false;
    game.message(`${c.name} made ${made} ${ITEMS[r.result].name}${made > 1 ? 's' : ''}.`, '#ffe75a'); c.say(choose(['Quiver refilled.', 'That should last a while.', 'Counting arrows... done.']));
    Audio_.play('craft'); c.noAmmo = false; this.refresh(c); return true;
  },
  // ammo the ranger needs, keyed by the weapon she carries
  ammoKindOf(c) { const s = c.inventory[c.weaponI]; if (!s) return null; const it = ITEMS[s.id]; return this.weaponClass(it) === 'ranged' ? (it.ammoKind || 'bullet') : null; },
  findRequest(c, game) {
    const p = game.player, w = game.world, now = w.time;
    const cool = (key) => c.asked[key] && c.asked[key] > now;
    const cands = [];
    // 1. materials for class gear the companion could craft (not while a house is going up - that wood is spoken for)
    for (const r of (c.job === 'build' ? [] : RECIPES)) {
      if (!this.recipeOk(game, r)) continue; const g = this.gain(c, r.result, r.count); if (g.gain <= 0) continue;
      const key = 'craft:' + r.result; if (cool(key)) continue;
      const need = []; let ok = true;
      for (const [id, n] of r.ing) { const miss = n - this.invCount(c, id); if (miss > 0) { if (p.countItem(id) < miss) { ok = false; break; } need.push([id, miss]); } }
      if (!ok || !need.length) continue;
      cands.push({ pri: 3 + g.gain / 10, key, items: need, why: `I could craft ${r.count > 1 ? r.count + ' ' : ''}${ITEMS[r.result].name} with ${need.length > 1 ? 'those' : 'that'}.`, kind: 'craft' });
    }
    // 2. finished gear in your inventory that beats theirs: class weapons (staves and whips for the
    //    summoner), armor, accessories and pets - everything except the item in your hand
    for (let i = 0; i < p.inventory.length; i++) {
      const s = p.inventory[i]; if (!s || s === p.selectedItem) continue; const it = ITEMS[s.id];
      const g = this.gain(c, s.id, 1); if (g.gain <= 0) continue; const key = 'item:' + s.id; if (cool(key)) continue;
      const cls = SQUAD_CLASSES[c.cls].title.toLowerCase(), isWpn = g.kind === 'weapon' || g.kind === 'whip';
      cands.push({ pri: (isWpn ? 3.2 : g.kind.startsWith('armor') ? 2.6 : 2.2) + g.gain / 20, key, items: [[s.id, 1]], why: g.kind === 'pet' ? `A ${it.name} would make a fine companion for a ${cls} like me.` : g.kind === 'light' ? `That ${it.name} would light my way - and its rolls suit a ${cls}.` : isWpn ? `That ${it.name} beats what I am fighting with.` : g.kind.startsWith('armor') ? `That ${it.name} would protect a ${cls} better than what I wear.` : `That ${it.name} would really help a ${cls}.`, kind: 'item' });
    }
    // 3. ammo
    const ak = this.ammoKindOf(c);
    if (ak) {
      const have = c.inventory.reduce((n, s) => n + (s && ITEMS[s.id].ammo === ak ? s.count : 0), 0);
      if (have < 40) {
        const ammo = p.inventory.filter(s => s && ITEMS[s.id].ammo === ak).sort((a, b) => (ITEMS[b.id].damage || 0) - (ITEMS[a.id].damage || 0))[0];
        if (ammo && ammo.count >= 20 && !cool('ammo:' + ammo.id)) cands.push({ pri: 4, key: 'ammo:' + ammo.id, items: [[ammo.id, Math.min(ammo.count, 99)]], why: `I am running low on ${ak}s.`, kind: 'ammo' });
        else if (ak === 'arrow' && p.countItem('wood') >= 4 && p.countItem('stone') >= 4 && !cool('craft:wooden_arrow')) cands.push({ pri: 4, key: 'craft:wooden_arrow', items: [['wood', 4], ['stone', 4]], why: 'I could make a quiver of Wooden Arrows with those.', kind: 'craft' });
      }
    }
    // 4. life / mana crystals and potions
    if (c.lifeCrystals < 15 && p.countItem('life_crystal') > 0 && !cool('use:life_crystal')) cands.push({ pri: 2.5, key: 'use:life_crystal', items: [['life_crystal', 1]], why: 'A Life Crystal would make me tougher.', kind: 'use' });
    if (c.cls === 'magic' && c.manaCrystals < 9 && p.countItem('mana_crystal') > 0 && !cool('use:mana_crystal')) cands.push({ pri: 2.6, key: 'use:mana_crystal', items: [['mana_crystal', 1]], why: 'A Mana Crystal! I would love one of those.', kind: 'use' });
    if (!c.inventory.some(s => s && ITEMS[s.id].heal > 0 && ITEMS[s.id].consumable)) { const pot = p.inventory.find(s => s && ITEMS[s.id].heal > 0 && ITEMS[s.id].consumable && !ITEMS[s.id].food && s.count >= 3); if (pot && !cool('pot:' + pot.id)) cands.push({ pri: 1.5, key: 'pot:' + pot.id, items: [[pot.id, 3]], why: 'A few healing potions would keep me on my feet.', kind: 'potion' }); }
    if (c.cls === 'magic' && !c.inventory.some(s => s && ITEMS[s.id].mana > 0)) { const pot = p.inventory.find(s => s && ITEMS[s.id].mana > 0 && ITEMS[s.id].consumable && s.count >= 3); if (pot && !cool('pot:' + pot.id)) cands.push({ pri: 1.6, key: 'pot:' + pot.id, items: [[pot.id, 3]], why: 'Mana potions keep the sparks flying.', kind: 'potion' }); }
    // 5. buff potions that help the class (a few at a time, when the companion carries none of that kind)
    for (const s of p.inventory) {
      if (!s) continue; const it = ITEMS[s.id]; if (!it.buffName || !it.consumable) continue;
      const sc = this.potionScore(it, c.cls); if (sc <= 0 || s.count < 2 || this.owns(c, s.id)) continue; const key = 'buff:' + s.id; if (cool(key)) continue;
      cands.push({ pri: 1.4 + sc * 0.2, key, items: [[s.id, Math.min(s.count, 5)]], why: sc >= 3 ? `${it.name}s are made for a ${SQUAD_CLASSES[c.cls].title.toLowerCase()} like me.` : `A few ${it.name}s would help me in a fight.`, kind: 'potion' });
    }
    if (!cands.length) return null;
    cands.sort((a, b) => b.pri - a.pri); return cands[0];
  },
  canPrompt(game) {
    const w = game.world, p = game.player;
    if (game.state !== 'play' || this.prompt || game.dialog || game.invOpen || game.settingsOpen || UI.fullMap || UI.structOpen || UI.raceEditorOpen || (typeof Fables !== 'undefined' && Fables.dialog) || (typeof TownNPCs !== 'undefined' && TownNPCs.ui) || (typeof Reforge !== 'undefined' && Reforge.open) || TextInput.active) return false;
    if (p.dead || game.boss || w.event || w.isSub) return false;
    if (game.enemies.some(e => !e.dead && dist(e.cx, e.cy, p.cx, p.cy) < 22 * TILE)) return false;
    return w.time >= this.nextPromptAt;
  },
  ask(c, req, game) {
    this.prompt = { c, req, t: 0 }; c.talking = true; c.say(null);
    Audio_.play('chat');
  },
  answer(game, yes) {
    const pr = this.prompt; if (!pr) return; const { c, req } = pr; const p = game.player, w = game.world;
    this.prompt = null; c.talking = false; this.nextPromptAt = w.time + 60 * 20;
    if (req.kind === 'notice') { if (yes) { c.say('I will wait here.'); Audio_.play('menu'); } else { c.say('Fair enough, some other time.'); this.stopJob(c, game); game.message(`${c.name} dropped the build.`, '#ffb060'); Audio_.play('close'); } return; }
    if (!yes) { c.asked[req.key] = w.time + w.dayLength; c.say(choose(['Maybe later, then.', 'Fair enough.', 'No problem.'])); Audio_.play('close'); return; }
    for (const [id, n] of req.items) if (p.countItem(id) < n) { game.message(`You no longer have ${n} ${ITEMS[id].name}.`, '#ff8080'); return; }
    for (const [id, n] of req.items) { if (req.kind !== 'use' && !this.hasRoom(c, id, n)) { game.message(`${c.name}'s inventory is full.`, '#ff8080'); return; } }
    for (const [id, n] of req.items) { p.removeItem(id, n); if (req.kind === 'use') { if (id === 'life_crystal') c.lifeCrystals++; else c.manaCrystals++; } else this.invAdd(c, id, n); }
    c.asked[req.key] = w.time + (req.key === 'build:kit' ? 60 * 30 : 60 * 60 * 3);
    game.updateCraftable(); this.refresh(c);
    if (req.kind === 'use') { c.say('Thank you! I feel stronger already.'); FX.burst(game, c.cx, c.cy, 14, '#ff60a0', 3, 30); }
    else if (req.kind === 'craft') { if (!this.tryCraft(c, game)) c.say(choose(['Thanks! I will put these to use.', 'Great, I will craft it right away.'])); }
    else c.say(choose(['Thanks!', 'Much appreciated.', 'This will do nicely.']));
    Audio_.play('menu');
  },

  // ---- jobs: mining ore and chopping trees on your order (fighting always comes first) --------------
  bestTool(c, kind) { let bi = -1, bp = 0; for (let i = 0; i < SQUAD_INV; i++) { const s = c.inventory[i]; if (!s) continue; const it = ITEMS[s.id]; if (it.tool === kind && (it.power || 0) > bp) { bp = it.power; bi = i; } } return bi; },
  isOre(w, x, y) { const id = w.get(x, y); if (id === T.AIR) return false; const d = TILES[id]; return !!(d && d.solid && (id === T.GEM || (d.drop && /_ore$/.test(d.drop)))); },
  treeBase(w, x, y) { if (w.get(x, y) !== T.TREE) return null; while (w.get(x, y + 1) === T.TREE) y++; return { x, y }; },
  findJobTarget(c, game) {
    const w = game.world, p = game.player, cx = c.tileX, cy = c.tileY, R = c.job === 'chop' ? 22 : 16;
    let best = null, bd = 1e9; const seen = new Set();
    const V = c.job === 'chop' ? 8 : 5;
    for (let y = cy - V; y <= cy + V; y++) for (let x = cx - R; x <= cx + R; x++) {
      if (!w.inBounds(x, y)) continue;
      let t = null;
      if (c.job === 'mine') { if (this.isOre(w, x, y) && this.exposed(w, x, y)) t = { x, y }; }
      else { const b = this.treeBase(w, x, y); if (b) { const k = b.x + ',' + b.y; if (seen.has(k)) continue; seen.add(k); t = b; } }
      if (!t) continue; const key = t.x + ',' + t.y; if (c.jobSkip[key] && c.jobSkip[key] > w.time) continue;
      if (Math.abs(t.x - p.tileX) > 30 || Math.abs(t.y - p.tileY) > 20) continue; // stay near you
      const d = Math.abs(t.x - cx) + Math.abs(t.y - cy) * 1.5; if (d < bd) { bd = d; best = t; }
    }
    return best;
  },
  isOpen(w, x, y) { const id = w.get(x, y); return !w.inBounds(x, y) ? false : !TILES[id] || !TILES[id].solid; },
  // ore counts when there is open space within two tiles of it: the companion digs the rest of the way
  exposed(w, x, y) { for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) if ((xx || yy) && this.isOpen(w, x + xx, y + yy)) return true; return false; },
  // the covering block to dig first: the solid, non-ore neighbour of the target nearest the digger
  coverTile(w, c, t) {
    if ([[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => this.isOpen(w, t.x + dx, t.y + dy))) return null;
    let best = null, bd = 1e9;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const x = t.x + dx, y = t.y + dy; if (!w.inBounds(x, y) || this.isOre(w, x, y)) continue; const d = TILES[w.get(x, y)]; if (!d || !d.solid || d.hp === Infinity) continue; const dd = Math.abs(x * TILE + 8 - c.cx) + Math.abs(y * TILE + 8 - c.cy); if (dd < bd) { bd = dd; best = { x, y }; } }
    return best;
  },
  // one tick of work; returns { moveDir, wantJump } while busy, null when there is nothing to do
  jobTick(c, game) {
    if (c.job === 'fish') return this.fishTick(c, game);
    if (c.job === 'build') return this.buildTick(c, game);
    const w = game.world, p = game.player;
    const kind = c.job === 'chop' ? 'axe' : 'pick', ti = this.ensureTool(c, game, kind);
    if (ti < 0) return null;
    const tool = ITEMS[c.inventory[ti].id];
    let t = c.jobTarget;
    const valid = (t) => t && w.inBounds(t.x, t.y) && (c.job === 'mine' ? this.isOre(w, t.x, t.y) : w.get(t.x, t.y) === T.TREE);
    if (!valid(t)) { t = c.jobTarget = (w.time % 15 === 0 || !c.jobTarget) ? this.findJobTarget(c, game) : null; c.jobStuck = 0; if (!t) return null; }
    const wx = t.x * TILE + 8, wy = t.y * TILE + 8, dx = wx - c.cx, dy = wy - c.cy, adx = Math.abs(dx);
    c.dir = dx < 0 ? -1 : 1;
    const reach = 4.5 * TILE;
    if (adx <= reach && Math.abs(dy) <= 5 * TILE) {
      // swing the tool at it
      if (c.attackCd <= 0) {
        const cover = c.job === 'mine' ? this.coverTile(w, c, t) : null; const m = cover || t;
        const def = TILES[w.get(m.x, m.y)];
        if (def.tool !== 'any' && (def.tool !== tool.tool || (tool.power || 0) < (def.minPower || 0))) { c.jobSkip[t.x + ',' + t.y] = w.time + 1200; c.jobTarget = null; if (w.time > c.jobMsgT) { c.jobMsgT = w.time + 600; c.say('My ' + tool.name + ' is not strong enough for that.'); } return { moveDir: 0, wantJump: false }; }
        const use = Math.max(6, Math.round((tool.useTime || 20) * c.pm.useTime));
        const mdx = m.x * TILE + 8 - c.cx, mdy = m.y * TILE + 8 - c.cy, md = Math.hypot(mdx, mdy) || 1;
        this.startUse(c, use); c.toolSwing = use; c.toolAim = { x: mdx / md, y: mdy / md }; c.toolI = ti;
        const before = game.drops.length;
        game.mineAt(m.x, m.y, tool);
        this.collectDrops(game, before);
      }
      return { moveDir: 0, wantJump: false };
    }
    // walk over (and jump up) to it; give up on spots that cannot be reached
    const moveDir = adx > 12 ? c.dir : 0, wantJump = (dy < -20 && c.onGround && c.jumpCd === 0) || (c.collidedX && c.onGround);
    c.jobStuck = (c.jobStuck || 0) + (Math.abs(c.vx) < 0.15 && Math.abs(c.vy) < 0.15 ? 1 : 0);
    if (c.jobStuck > 150 || dist(c.cx, c.cy, p.cx, p.cy) > 40 * TILE) { c.jobSkip[t.x + ',' + t.y] = w.time + 1800; c.jobTarget = null; c.jobStuck = 0; }
    return { moveDir, wantJump };
  },
  // whatever a swing knocked loose goes straight into your bag (anything that does not fit stays on the ground)
  collectDrops(game, from, toCompanion) {
    const p = game.player; const got = {};
    for (let i = from; i < game.drops.length; i++) { const d = game.drops[i]; if (!d || d.dead || !d.id) continue; let left = d.count; if (toCompanion) left = this.invAdd(toCompanion, d.id, d.count, d.prefix); if (left > 0) left = p.addItem(d.id, left, d.prefix); const n = d.count - left; if (n > 0 && !toCompanion) got[d.id] = (got[d.id] || 0) + n; if (left > 0) d.count = left; else d.dead = true; }
    for (const id in got) game.addDamageText(p.cx, p.y - 10 - Object.keys(got).indexOf(id) * 12, `+${got[id]} ${ITEMS[id].name}`, '#ffe75a');
    if (Object.keys(got).length) { game.updateCraftable(); Audio_.play('pickup'); }
  },
  // a missing tool (pickaxe / axe / fishing pole): craft the cheapest one the bag allows, else ask you
  toolKindOf(it, kind) { return kind === 'pole' ? !!it.fishingPole : it.tool === kind; },
  toolPower(it, kind) { return kind === 'pole' ? (it.fishingPower || 0) : (it.power || 0); },
  toolRecipes(kind, game) { return RECIPES.filter(r => ITEMS[r.result] && this.toolKindOf(ITEMS[r.result], kind) && this.recipeOk(game, r)).sort((a, b) => this.toolPower(ITEMS[a.result], kind) - this.toolPower(ITEMS[b.result], kind)); },
  toolIndex(c, kind) { return kind === 'pole' ? c.inventory.findIndex(s => s && ITEMS[s.id].fishingPole) : this.bestTool(c, kind); },
  ensureTool(c, game, kind) {
    const have = this.toolIndex(c, kind); if (have >= 0) return have;
    const w = game.world, p = game.player, name = kind === 'pick' ? 'pickaxe' : kind === 'axe' ? 'axe' : 'fishing pole';
    // craft the cheapest tool the bag can make
    for (const r of this.toolRecipes(kind, game)) if (r.ing.every(([id, n]) => this.invCount(c, id) >= n)) { for (const [id, n] of r.ing) this.invRemove(c, id, n); this.invAdd(c, r.result, r.count); game.message(`${c.name} crafted ${ITEMS[r.result].name}!`, '#ffe75a'); c.say('Made myself a ' + name + '.'); Audio_.play('craft'); return this.toolIndex(c, kind); }
    if (w.time > c.jobMsgT) { c.jobMsgT = w.time + 600; c.say(`I need a ${name} for that.`); }
    if (!this.canPrompt(game)) return -1;
    // a spare tool of yours (not the one in your hand, the weakest one you have)
    const spares = p.inventory.filter(s => s && this.toolKindOf(ITEMS[s.id], kind) && s !== p.selectedItem).sort((a, b) => this.toolPower(ITEMS[a.id], kind) - this.toolPower(ITEMS[b.id], kind));
    const key = 'tool:' + kind; if (c.asked[key] && c.asked[key] > w.time) return -1;
    if (spares.length) { this.ask(c, { key, items: [[spares[0].id, 1]], why: `I have no ${name} of my own.`, kind: 'item' }, game); return -1; }
    // or the materials for the cheapest recipe you can cover
    for (const r of this.toolRecipes(kind, game)) { const need = r.ing.map(([id, n]) => [id, Math.max(0, n - this.invCount(c, id))]).filter(([, n]) => n > 0); if (need.every(([id, n]) => p.countItem(id) >= n)) { this.ask(c, { key, items: need, why: `I could make myself ${ITEMS[r.result].name} with ${need.length > 1 ? 'those' : 'that'}.`, kind: 'craft' }, game); return -1; } }
    return -1;
  },
  ensureBait(c, game) {
    if (this.baitOf(c)) return true;
    const w = game.world, p = game.player;
    if (w.time > c.jobMsgT) { c.jobMsgT = w.time + 600; c.say('I have no bait. Worms hide in tall grass.'); }
    if (!this.canPrompt(game) || (c.asked['bait'] && c.asked['bait'] > w.time)) return false;
    const bait = p.inventory.filter(s => s && ITEMS[s.id].bait).sort((a, b) => b.count - a.count)[0];
    if (bait) this.ask(c, { key: 'bait', items: [[bait.id, Math.min(bait.count, 10)]], why: 'I cannot fish without bait.', kind: 'item' }, game);
    return false;
  },
  jobLabel(c) { return { mine: 'Stop mining', chop: 'Stop chopping', fish: 'Stop fishing', build: 'Stop building' }[c.job] || null; },
  JOB_TEXT: { mine: 'On it. I will dig up any ore I find around you and hand it over.', chop: 'On it. I will cut the trees around you and hand over the wood.', fish: 'On it. I will find some water and fish - whatever bites is yours.', build: 'On it. I will mark out the plot and get building.' },
  // start a job from the dialog; returns the line the companion answers with
  startJob(c, game, job, plan) {
    let note = '';
    if (job === 'mine' && this.bestTool(c, 'pick') < 0) note = ' I have no pickaxe - I will make one or ask you for one.';
    if (job === 'chop' && this.bestTool(c, 'axe') < 0) note = ' I have no axe - I will make one or ask you for one.';
    if (job === 'fish') { if (!this.fishingPole(c)) note = ' I have no fishing pole - I will make one or ask you for one.'; else if (!this.baitOf(c)) note = ' I am out of bait, so I will ask you for some.'; }
    if (job === 'build') { const P = plan && (this.PLANS[plan] || (plan.startsWith('arena_') && this.arenaPlan(plan.slice(6)))); if (!P) return 'What should I build?'; const site = this.findSite(game, c, P); if (!site) return `There is no room for ${P.done} near here.`; c.build = { plan, site, i: 0, steps: null }; delete c.asked['build:kit']; delete c.asked['build:short']; c.buildShortSig = null;
      const need = Object.entries(this.buildNeeds(c)), short = this.buildShort(c, game), w = game.world;
      if (!need.length) note = ` I have everything for ${P.done} in my bag.`;
      else if (!short.length) note = ` I will ask you for ${this.listOf(need)} once we are clear of enemies.`;
      else { note = ` But neither of us has enough: we are short ${this.listOf(short)}. I will wait at the plot - hand me the materials through my inventory, or tell me to stop.`; c.asked['build:short'] = w.time + w.dayLength; c.buildShortSig = short.join(); game.message(`${c.name} is short ${this.listOf(short)} for ${P.done}.`, '#ffb060'); }
    }
    c.job = job; c.jobTarget = null; c.jobSkip = {}; c.fishCd = 0;
    return this.JOB_TEXT[job] + note + ' Say the word to stop.';
  },
  stopJob(c, game) { if (c.job === 'fish') for (const b of game.projectiles) if (b instanceof Bobber && b.owner === c) b.dead = true; c.job = null; c.jobTarget = null; c.build = null; c.fishRod = null; },

  // ---- fishing --------------------------------------------------------------------------------
  fishingPole(c) { let best = null; for (const s of c.inventory) if (s && ITEMS[s.id].fishingPole && (!best || (ITEMS[s.id].fishingPower || 0) > (ITEMS[best.id].fishingPower || 0))) best = s; return best; },
  baitOf(c) { let best = null; for (const s of c.inventory) if (s && ITEMS[s.id].bait && (!best || ITEMS[s.id].bait > ITEMS[best.id].bait)) best = s; return best; },
  bobberOf(c, game) { return game.projectiles.find(b => b instanceof Bobber && b.owner === c && !b.dead) || null; },
  // a fishable water surface near you (big enough to fish in)
  findWater(c, game) {
    const w = game.world, p = game.player; let best = null, bd = 1e9;
    for (let dx = -24; dx <= 24; dx++) for (let dy = -8; dy <= 14; dy++) {
      const x = p.tileX + dx, y = p.tileY + dy;
      if (w.liquidAt(x, y) > 100 && w.lavaAt(x, y) === 0 && w.liquidAt(x, y - 1) <= 60 && !w.isSolidAt(x, y - 1)) { if (c.jobSkip[x + ',' + y] && c.jobSkip[x + ',' + y] > w.time) continue; const d = Math.abs(x - c.tileX) + Math.abs(y - c.tileY); if (d < bd && Fishing.lakeSize(w, x, y) >= 75) { bd = d; best = { x, y }; } }
    }
    return best;
  },
  fishTick(c, game) {
    const w = game.world, p = game.player;
    const pi = this.ensureTool(c, game, 'pole'); if (pi < 0) return null; const pole = this.fishingPole(c);
    c.fishRod = pole.id;
    if (!this.bobberOf(c, game) && !this.ensureBait(c, game)) return null;
    const b = this.bobberOf(c, game);
    if (b) {
      if (b.state === 'floating' && b.bite > 0) {
        // reel it in: the catch is yours
        const id = Fishing.rollCatch(game, b), it = ITEMS[id];
        w.fishRecords = w.fishRecords || { total: 0, byId: {}, best: null }; w.fishRecords.total++; w.fishRecords.byId[id] = (w.fishRecords.byId[id] || 0) + 1;
        const bait = this.baitOf(c); if (bait && !(bait.id === 'truffle_worm') && Math.random() < 1) { bait.count--; if (bait.count <= 0) c.inventory[c.inventory.indexOf(bait)] = null; }
        const left = p.addItem(id, 1); if (left) game.dropItem(p.cx, p.y, id, 1);
        game.addDamageText(p.cx, p.y - 10, `+${it.name}`, RARITY_COLORS[it.rarity] || '#fff'); game.addDamageText(b.cx, b.y - 10, it.name, RARITY_COLORS[it.rarity] || '#fff');
        for (let i = 0; i < 6; i++) game.particles.push(new Particle(b.cx, b.cy, rand(-1.5, 1.5), rand(-2.5, -0.5), '#a0c8ff', 30, 2));
        Audio_.play('splash'); b.dead = true; c.fishCd = 40; c.armAngle = -1.2; this.startUse(c, 12);
        if (typeof ModLib !== 'undefined') ModLib.emit('fishCaught', game, id);
        if (!this.baitOf(c)) c.say('Out of bait!');
      }
      c.dir = b.cx < c.cx ? -1 : 1;
      return { moveDir: 0, wantJump: false };
    }
    if (c.fishCd > 0) { c.fishCd--; return { moveDir: 0, wantJump: false }; }
    // a cast that never reached the water (terrain in the way): try a couple more times, then another spot
    if (c.lastBobber) { if (c.lastBobber.state !== 'floating') { c.castFails = (c.castFails || 0) + 1; if (c.castFails >= 3 && c.jobTarget) { c.jobSkip[c.jobTarget.x + ',' + c.jobTarget.y] = w.time + 1800; c.jobTarget = null; c.castFails = 0; } } else c.castFails = 0; c.lastBobber = null; }
    const t = c.jobTarget && w.liquidAt(c.jobTarget.x, c.jobTarget.y) > 60 ? c.jobTarget : (c.jobTarget = this.findWater(c, game));
    if (!t) { if (w.time > c.jobMsgT) { c.jobMsgT = w.time + 900; c.say('No water big enough around here.'); } return null; }
    const wx = t.x * TILE + 8, wy = t.y * TILE, dx = wx - c.cx, adx = Math.abs(dx);
    if (c.inWater || adx > 5 * TILE || Math.abs(wy - c.y) > 8 * TILE) {
      // walk to the shore
      c.dir = dx < 0 ? -1 : 1; const moveDir = adx > 3 * TILE ? c.dir : 0;
      c.jobStuck = (c.jobStuck || 0) + (Math.abs(c.vx) < 0.15 ? 1 : 0); if (c.jobStuck > 240) { c.jobSkip[t.x + ',' + t.y] = w.time + 1800; c.jobTarget = null; c.jobStuck = 0; }
      return { moveDir, wantJump: (c.collidedX && c.onGround) || (c.jobStuck > 30 && c.onGround && c.jumpCd === 0) };
    }
    // cast
    const bait = this.baitOf(c); if (!bait) return null;
    const power = (ITEMS[pole.id].fishingPower || 5) + ITEMS[bait.id].bait;
    c.dir = dx < 0 ? -1 : 1; const dy = wy - c.y, d = Math.hypot(dx, dy) || 1, sp = clamp(d / 30, 4, 11);
    const bx = w.isSolidAt(Math.floor((c.cx + c.dir * 10) / TILE), Math.floor((c.y + 6) / TILE)) ? c.cx : c.cx + c.dir * 10;
    const nb = new Bobber(bx, c.y + 6, dx / d * sp, dy / d * sp - 2, c, power); game.projectiles.push(nb); c.lastBobber = nb;
    this.startUse(c, 12); c.armAngle = -1.2; c.fishCd = 30; Audio_.play('fish_cast');
    return { moveDir: 0, wantJump: false };
  },

  // ---- building plans: house, storage hall, arenas ---------------------------------------------------
  // each plan: footprint (w x h above the floor), the kit of finished pieces, and the placement steps
  PLANS: {
    house: { name: 'House', w: 9, h: 8, kit: () => [['wood', 24], ['wood_wall', 42], ['door', 2], ['table', 1], ['chair', 1], ['torch', 1], ['platform', 4]],
      steps: (x0, g) => { const S = []; const W = 9;
        for (let k = 0; k < W; k++) S.push({ kind: 'block', x: x0 + k, y: g });
        for (let y = g - 6; y < g; y++) if (y < g - 3) { S.push({ kind: 'block', x: x0, y }); S.push({ kind: 'block', x: x0 + W - 1, y }); }
        for (let k = 0; k < W; k++) S.push({ kind: 'block', x: x0 + k, y: g - 7 });
        for (let y = g - 6; y < g; y++) for (let k = 1; k < W - 1; k++) S.push({ kind: 'wall', x: x0 + k, y });
        S.push({ kind: 'furn', x: x0, y: g - 1, id: 'door', tile: T.DOOR_C }, { kind: 'furn', x: x0 + W - 1, y: g - 1, id: 'door', tile: T.DOOR_C });
        for (let k = 1; k <= 4; k++) S.push({ kind: 'platform', x: x0 + k, y: g - 4 });                     // a loft shelf
        S.push({ kind: 'furn', x: x0 + 2, y: g - 1, id: 'table', tile: T.TABLE }, { kind: 'furn', x: x0 + 6, y: g - 1, id: 'chair', tile: T.CHAIR }, { kind: 'torch', x: x0 + 7, y: g - 5 });
        return S; }, done: 'a house' },
    storage: { name: 'Storage Hall', w: 16, h: 9, kit: () => [['wood', 44], ['wood_wall', 98], ['door', 2], ['chest', 12], ['torch', 2], ['platform', 14]],
      steps: (x0, g) => { const S = []; const W = 16;
        for (let k = 0; k < W; k++) S.push({ kind: 'block', x: x0 + k, y: g });
        for (let y = g - 7; y < g; y++) if (y < g - 3) { S.push({ kind: 'block', x: x0, y }); S.push({ kind: 'block', x: x0 + W - 1, y }); }
        for (let k = 0; k < W; k++) S.push({ kind: 'block', x: x0 + k, y: g - 8 });
        for (let y = g - 7; y < g; y++) for (let k = 1; k < W - 1; k++) S.push({ kind: 'wall', x: x0 + k, y });
        S.push({ kind: 'furn', x: x0, y: g - 1, id: 'door', tile: T.DOOR_C }, { kind: 'furn', x: x0 + W - 1, y: g - 1, id: 'door', tile: T.DOOR_C });
        for (let k = 1; k < W - 1; k++) S.push({ kind: 'platform', x: x0 + k, y: g - 4 });                    // upper floor
        for (let c = 0; c < 6; c++) { S.push({ kind: 'furn', x: x0 + 2 + c * 2, y: g - 1, id: 'chest', tile: T.CHEST }); S.push({ kind: 'furn', x: x0 + 2 + c * 2, y: g - 5, id: 'chest', tile: T.CHEST }); }
        S.push({ kind: 'torch', x: x0 + 1, y: g - 2 }, { kind: 'torch', x: x0 + 1, y: g - 6 });
        return S; }, done: 'a storage hall' },
  },
  arenaPlan(size) {
    const W = { s: 40, m: 60, l: 90 }[size], rows = { s: 3, m: 4, l: 5 }[size], H = 6 + rows * 5;
    return { name: `${size === 's' ? 'Small' : size === 'm' ? 'Medium' : 'Large'} Arena`, w: W, h: H, arena: true,
      kit: () => [['platform', W * rows], ['torch', Math.ceil(W / 8) + rows * 2], ['campfire', 2]],
      steps: (x0, g) => { const S = [];
        for (let r = 1; r <= rows; r++) { const y = g - 5 * r; S.push({ kind: 'torch', x: x0, y: y - 1 }); for (let k = 0; k < W; k++) S.push({ kind: 'platform', x: x0 + k, y }); S.push({ kind: 'torch', x: x0 + W - 1, y: y - 1 }); } // a torch at each end of every row, placed on the way past
        for (let k = 8; k < W - 6; k += 8) S.push({ kind: 'torch', x: x0 + k, y: g - 1 });
        S.push({ kind: 'furn', x: x0 + 2, y: g - 1, id: 'campfire', tile: T.CAMPFIRE }, { kind: 'furn', x: x0 + W - 5, y: g - 1, id: 'campfire', tile: T.CAMPFIRE });
        return S; }, done: 'an arena' };
  },
  planOf(c) { const id = (c.build && c.build.plan) || 'house'; return this.PLANS[id] || this.arenaPlan(id.slice(6)); },
  // the plan's kit plus the earth the plot needs beyond what levelling it will dig up
  kitOf(c) { const kit = this.planOf(c).kit(), site = c.build && c.build.site; const earth = site ? Math.max(0, (site.fill || 0) - (site.dig || 0)) : 0; return earth > 0 ? kit.concat([['dirt', earth]]) : kit; },
  // ---- building --------------------------------------------------------------------------------------
  BUILD_KIT: [['wood', 23], ['wood_wall', 36], ['door', 2], ['table', 1], ['chair', 1], ['torch', 1]],
  // what the companion still needs, reduced to raw materials it cannot craft from what it has
  RAW: ['wood', 'gel', 'iron_bar', 'stone', 'dirt'],
  kitRecipe(id) { return RECIPES.find(x => x.result === id && x.ing.every(([i]) => this.RAW.includes(i) || i === 'torch')); },
  // the kit reduced to demand per item, parents before the pieces they consume (campfires need torches, so
  // torches are counted after campfires): { demand: id -> count, order: composite ids parents-first }
  kitDemand(c, kit) {
    const demand = {}, order = [], done = new Set(), have = (id) => this.invCount(c, id);
    for (const [id, n] of kit) demand[id] = (demand[id] || 0) + n;
    for (let guard = 0; guard < 24; guard++) {
      const comps = Object.keys(demand).filter(id => !done.has(id) && !this.RAW.includes(id) && this.kitRecipe(id));
      if (!comps.length) break;
      const id = comps.find(a => !comps.some(b => b !== a && this.kitRecipe(b).ing.some(([i]) => i === a))) || comps[0];
      const r = this.kitRecipe(id), batches = Math.ceil(Math.max(0, demand[id] - have(id)) / r.count);
      for (const [i, k] of r.ing) demand[i] = (demand[i] || 0) + k * batches;
      done.add(id); order.push(id);
    }
    return { demand, order };
  },
  // raw materials still missing for the plan's kit (finished pieces reduced to wood / gel / iron bars / dirt)
  buildNeeds(c) {
    const { demand } = this.kitDemand(c, this.kitOf(c)), need = {};
    for (const id in demand) if (this.RAW.includes(id) || !this.kitRecipe(id)) { const m = demand[id] - this.invCount(c, id); if (m > 0) need[id] = m; }
    return need;
  },
  listOf(items) { const t = items.map(([id, n]) => `${n} ${ITEMS[id].name}`); return t.length > 1 ? t.slice(0, -1).join(', ') + ' and ' + t[t.length - 1] : (t[0] || 'nothing'); },
  // what is missing for the kit once your inventory is counted in too
  buildShort(c, game) { return Object.entries(this.buildNeeds(c)).map(([id, n]) => [id, n - game.player.countItem(id)]).filter(([, n]) => n > 0); },
  craftKit(c) {
    const kit = this.kitOf(c), { order } = this.kitDemand(c, kit);
    const make = (id, miss, depth) => { const r = this.kitRecipe(id); if (!r || depth > 3) return; while (miss > 0) { for (const [i, k] of r.ing) if (this.invCount(c, i) < k && !this.RAW.includes(i)) make(i, k - this.invCount(c, i), depth + 1); if (!r.ing.every(([i, k]) => this.invCount(c, i) >= k)) return; for (const [i, k] of r.ing) this.invRemove(c, i, k); this.invAdd(c, id, r.count); miss -= r.count; } };
    for (const id of order) { const n = kit.filter(([k]) => k === id).reduce((a, [, m]) => a + m, 0); const miss = n - this.invCount(c, id); if (miss > 0) make(id, miss, 0); }
    return kit.every(([id, n]) => this.invCount(c, id) >= n);
  },
  surfaceAt(w, x) { let y = 0; while (y < w.h - 1 && (!w.inBounds(x, y) || !TILES[w.get(x, y)].solid || w.get(x, y) === T.TREE)) y++; return y; },
  // the ground under a column, searching down from a row (so a house can go up wherever you stand, caves included)
  groundAt(w, x, from) { let y = Math.max(0, from); while (y < w.h - 1 && (!w.inBounds(x, y) || !TILES[w.get(x, y)].solid || w.get(x, y) === T.TREE)) y++; return y; },
  findSite(game, c, plan) {
    const w = game.world, p = game.player, from = p.tileY - 10, P = plan || this.PLANS.house, W = P.w, H = P.h;
    let best = null; const slopeMax = P.arena ? 12 : 5;
    for (const side of [p.dir || 1, -(p.dir || 1)]) {
      for (let off = 4; off <= 22 + Math.floor(W / 2); off++) {
        const x0 = p.tileX + side * off - (side < 0 ? W : 0); if (x0 < 5 || x0 + W + 1 >= w.w) continue;
        const gs = []; for (let k = 0; k < W; k++) gs.push(this.groundAt(w, x0 + k, from));
        const lo = Math.min(...gs), hi = Math.max(...gs); if (lo < 20 || hi > w.h - 20 || lo - p.tileY > 14 || hi - lo > slopeMax) continue; // near your level, gentle enough
        // the floor goes at the most common ground row; earthwork = blocks to dig above it + blocks to fill below it
        const counts = {}; for (const gk of gs) counts[gk] = (counts[gk] || 0) + 1; const g = +Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a - b)[0];
        let ok = true, dig = 0, fill = 0;
        for (let k = 0; k < W && ok; k++) { for (let y = g - H + 1; y < g; y++) { const id = w.get(x0 + k, y); if (TILES[id] && TILES[id].furniture) ok = false; if (TILES[id].solid) dig++; } for (let y = P.arena ? g : g + 1; y <= g + 6; y++) { if (TILES[w.get(x0 + k, y)].solid) break; fill++; } }
        if (!ok || (Math.abs(x0 + W / 2 - p.tileX) < W / 2 + 1 && !P.arena)) continue;
        const score = dig + fill + off * 0.5; if (!best || score < best.score) best = { x0, g, score, dig, fill };
      }
    }
    return best ? { x0: best.x0, g: best.g, w: W, h: H, dig: best.dig, fill: best.fill } : null;
  },
  buildSteps(site, w, plan) {
    const { x0, g } = site, P = plan || this.PLANS.house, W = P.w, H = P.h, S = [];
    // 1. dig the plot level: everything solid above the floor comes out (into the builder's bag)
    const felled = new Set();
    for (let y = g - H + 1; y < g; y++) for (let k = 0; k < W; k++) { const id = w ? w.get(x0 + k, y) : T.AIR; if (id === T.AIR) continue;
      if (id === T.TREE || id === T.TREETOP) { const base = this.treeBase(w, x0 + k, id === T.TREETOP ? y + 1 : y); const key = base ? base.x + ',' + base.y : null; if (key && !felled.has(key)) { felled.add(key); S.push({ kind: 'dig', x: base.x, y: base.y }); } else if (!key) S.push({ kind: 'dig', x: x0 + k, y }); } // fell the whole tree from its base
      else if (TILES[id].solid || id === T.PLANT || id === T.CACTUS) S.push({ kind: 'dig', x: x0 + k, y }); }
    // 2. fill the holes under the floor so it stands on solid ground (arenas: the floor row itself too)
    for (let k = 0; k < W; k++) for (let y = P.arena ? g : g + 1; y <= g + 6; y++) { if (w && TILES[w.get(x0 + k, y)].solid) break; S.push({ kind: 'fill', x: x0 + k, y }); }
    for (let y = g - H + 1; y <= g; y++) for (let k = 0; k < W; k++) if (!w || w.get(x0 + k, y) !== T.AIR) S.push({ kind: 'clear', x: x0 + k, y });   // clear the box
    return S.concat(P.steps(x0, g));
  },
  // materials the bag lacks (id -> count): ask you for what you can spare; when the rest is nowhere to be
  // found, a paused notice says exactly what is short and lets you choose between waiting and dropping the build
  supplyTick(c, game, need) {
    const p = game.player, w = game.world, P = this.planOf(c), entries = Object.entries(need);
    if (!entries.length) return;
    if (w.time > c.jobMsgT) { c.jobMsgT = w.time + 300; c.say('I still need ' + this.listOf(entries) + '.'); }
    if (!this.canPrompt(game)) return;
    const give = entries.map(([id, n]) => [id, Math.min(n, p.countItem(id))]).filter(([, n]) => n > 0), short = entries.map(([id, n]) => [id, n - p.countItem(id)]).filter(([, n]) => n > 0);
    if (give.length && !(c.asked['build:kit'] > w.time)) { c.asked['build:kit'] = w.time + 60 * 30; this.ask(c, { key: 'build:kit', items: give, why: short.length ? `That still leaves us short ${this.listOf(short)}, but it is a start.` : `I could finish ${P.done} with those.`, kind: 'craft' }, game); }
    else if (short.length && !give.length && (c.buildShortSig !== short.join() || !(c.asked['build:short'] > w.time))) {
      c.asked['build:short'] = w.time + w.dayLength; c.buildShortSig = short.join(); game.message(`${c.name} is short ${this.listOf(short)} for ${P.done}.`, '#ffb060');
      this.ask(c, { key: 'build:short', kind: 'notice', items: short, text: `Neither of us has what ${P.done} needs: we are short ${this.listOf(short)}. Shall I wait at the plot for the materials (hand them over through my inventory), or drop the build?` }, game);
    }
  },
  buildTick(c, game) {
    const w = game.world, p = game.player, B = c.build;
    if (!B) { this.stopJob(c, game); return null; }
    if (!B.steps) {
      if (!this.craftKit(c)) {
        const need = this.buildNeeds(c);
        this.supplyTick(c, game, need); B.lastT = w.time;
        return { moveDir: 0, wantJump: false };
      }
      B.steps = this.buildSteps(B.site, w, this.planOf(c)); B.i = 0; B.lastT = w.time; c.say('Surveying the plot...'); game.message(`${c.name} starts building ${this.planOf(c).done} ${B.site.x0 + B.site.w / 2 > p.tileX ? 'to the right' : 'to the left'} of you.`, '#c0ffc0');
    }
    if (c.ko > 0 || c.talking) B.lastT = w.time; // being knocked out or chatting is not being stuck
    if (w.time - (B.lastT || w.time) > 60 * 90) { game.message(`${c.name} cannot reach the building site and gives up.`, '#ff9060'); c.say('I cannot get there.'); this.stopJob(c, game); return null; }
    if (B.i >= B.steps.length) {
      const site = B.site, P = this.planOf(c), h = P.arena ? { ok: false } : w.checkHouse(site.x0 + 1, site.g - 1);
      // what the plot yielded and what is left of the kit goes to you (they keep their wood, gel and bait)
      for (let i = 0; i < SQUAD_INV; i++) { const st = c.inventory[i]; if (st && st.id !== 'wood' && st.id !== 'gel' && !ITEMS[st.id].bait && (ITEMS[st.id].tile != null || ITEMS[st.id].wall != null || /_ore$|^gem|acorn/.test(st.id))) { const left = p.addItem(st.id, st.count); c.inventory[i] = left > 0 ? Object.assign({}, st, { count: left }) : null; } }
      game.message(`${c.name} finished ${P.done}${h.ok ? ' - a town NPC can move in!' : '.'}`, '#50ff50'); Audio_.play('levelup'); c.say(P.arena ? 'Ready for a fight.' : 'All done.');
      this.stopJob(c, game); return null;
    }
    // skip steps the world has already taken care of (a felled tree's canopy, a hole the digging filled...)
    const noop = (st) => { const id = w.get(st.x, st.y); return (st.kind === 'clear' && id === T.AIR) || (st.kind === 'dig' && id === T.AIR) || (st.kind === 'fill' && TILES[id].solid) || (st.kind === 'block' && id === T.WOOD) || (st.kind === 'wall' && w.getWall(st.x, st.y) === W.WOOD) || (st.kind === 'torch' && id === T.TORCH) || (st.kind === 'platform' && id === T.PLATFORM); };
    while (B.i < B.steps.length && noop(B.steps[B.i])) { B.i++; B.lastT = w.time; }
    if (B.i >= B.steps.length) return { moveDir: 0, wantJump: false };
    const st = B.steps[B.i], wx = st.x * TILE + 8, wy = st.y * TILE + 8, dx = wx - c.cx, adx = Math.abs(dx);
    if (adx > 5 * TILE || Math.abs(wy - c.cy) > 6 * TILE) {
      c.dir = dx < 0 ? -1 : 1; c.jobStuck = (c.jobStuck || 0) + (Math.abs(c.vx) < 0.15 ? 1 : 0);
      if (c.jobStuck > (adx <= 12 && c.onGround ? 90 : 300)) { c.x = wx - c.w / 2; c.y = (st.y - 3) * TILE; c.jobStuck = 0; } // climb up to a spot no path leads to
      return { moveDir: adx > 12 ? c.dir : 0, wantJump: (wy < c.cy - 20 && c.onGround && c.jumpCd === 0) || (c.collidedX && c.onGround) };
    }
    if (c.attackCd > 0) return { moveDir: 0, wantJump: false };
    c.dir = dx < 0 ? -1 : 1; this.startUse(c, 10); const hi = st.kind === 'dig' ? this.bestTool(c, 'pick') : this.bestTool(c, 'hammer'); if (hi >= 0) { c.toolSwing = 10; c.toolI = hi; c.toolAim = { x: dx / (Math.hypot(dx, wy - c.cy) || 1), y: (wy - c.cy) / (Math.hypot(dx, wy - c.cy) || 1) }; }
    const id = w.get(st.x, st.y);
    if (st.kind === 'dig') { if (id !== T.AIR) { const before = game.drops.length; game.breakTile(st.x, st.y); this.collectDrops(game, before, c); } }
    else if (st.kind === 'fill') {
      if (!TILES[id].solid) {
        // earth first (what the digging produced), never the house's own wood
        let fi = -1; for (const fid of ['dirt', 'stone', 'mud', 'clay', 'sand', 'snow', 'ash']) { fi = c.inventory.findIndex(x => x && x.id === fid && ITEMS[fid].tile != null && TILES[ITEMS[fid].tile] && TILES[ITEMS[fid].tile].solid); if (fi >= 0) break; }
        if (fi < 0) {
          const need = B.steps.slice(B.i).filter(x => x.kind === 'fill').length;
          this.supplyTick(c, game, { dirt: need }); B.lastT = w.time;
          return { moveDir: 0, wantJump: false };
        }
        const fs = c.inventory[fi]; w.setTile(st.x, st.y, ITEMS[fs.id].tile); fs.count--; if (fs.count <= 0) c.inventory[fi] = null; Audio_.play('dig');
      }
    }
    else if (st.kind === 'clear') { if (id === T.TREE || id === T.TREETOP) { const before = game.drops.length; game.breakTile(st.x, st.y); this.collectDrops(game, before); } else if (id !== T.AIR && (st.y < B.site.g)) { const before = game.drops.length; if (TILES[id].furniture) w.removeFurniture(st.x, st.y); else w.setTile(st.x, st.y, T.AIR); this.collectDrops(game, before); } }
    else if (st.kind === 'block') { if (id !== T.WOOD) { if (id !== T.AIR && TILES[id].furniture) w.removeFurniture(st.x, st.y); w.setTile(st.x, st.y, T.WOOD); this.invRemove(c, 'wood', 1); Audio_.play('dig'); } }
    else if (st.kind === 'wall') { if (w.getWall(st.x, st.y) !== W.WOOD) { w.setWall(st.x, st.y, W.WOOD); this.invRemove(c, 'wood_wall', 1); } }
    else if (st.kind === 'furn') { const fd = TILES[st.tile].furniture; const ay = st.y - fd.h + 1; for (let yy = 0; yy < fd.h; yy++) for (let xx = 0; xx < fd.w; xx++) if (w.get(st.x + xx, ay + yy) !== T.AIR) w.setTile(st.x + xx, ay + yy, T.AIR); if (w.canPlaceFurniture(st.x, ay, st.tile)) { w.placeFurniture(st.x, ay, st.tile); this.invRemove(c, st.id, 1); Audio_.play('dig'); } }
    else if (st.kind === 'torch') { if (id === T.AIR || id === T.PLANT) { w.setTile(st.x, st.y, T.TORCH); this.invRemove(c, 'torch', 1); } } // plants grow back while the work goes on
    else if (st.kind === 'platform') { if ((id === T.AIR || id === T.PLANT) && this.invCount(c, 'platform') > 0) { w.setTile(st.x, st.y, T.PLATFORM); this.invRemove(c, 'platform', 1); } }
    B.i++; B.lastT = w.time;
    return { moveDir: 0, wantJump: false };
  },

  // ---- per-tick companion brain ---------------------------------------------------------------
  tick(c, game) {
    const w = game.world;
    if (c.sickness > 0) c.sickness--; if (c.manaSick > 0) c.manaSick--; if (c.combatT > 0) c.combatT--; if (c.drinkCd > 0) c.drinkCd--;
    let expired = false; for (const b in c.buffs) { if (c.buffs[b] > 0 && --c.buffs[b] <= 0) { delete c.buffs[b]; expired = true; } } if (expired) this.computeMods(c, game);
    this.drinkBuff(c, game);
    // mana regeneration
    if (c.manaDelay > 0) c.manaDelay--;
    if (c.mana < c.maxMana) { c.manaTick = (c.manaTick || 0) + 1 + (c.manaDelay ? 0 : 1) + c.pm.manaRegen * 0.2; if (c.manaTick >= 8) { c.manaTick = 0; c.mana = Math.min(c.maxMana, c.mana + 1 + Math.floor(c.maxMana / 100)); } }
    this.drinkHealth(c, game);
    if (c.cls === 'summon') this.keepMinions(c, game);
    // every two seconds (staggered): craft what the bag allows; every ten: maybe ask for something
    const ph = (w.time + c.id.length * 97);
    if (ph % 120 === 0 && c.ko === 0) { this.computeMods(c, game); this.tryCraft(c, game); }
    if (ph % 600 === 0 && c.ko === 0) {
      if (this.canPrompt(game) && dist(c.cx, c.cy, game.player.cx, game.player.cy) < 30 * TILE) { const req = this.findRequest(c, game); if (req) this.ask(c, req, game); }
    }
  },
  lightTick(c, game) {
    if (!c.lightPet || !LIGHT_PETS[c.lightPet.id]) return; // vanilla pets follow and light up with the mod off too
    const lp = c.lightPos, tx = c.cx - c.dir * 22, ty = c.y - 6 + Math.sin(game.world.time * 0.05 + c.id.length) * 4;
    lp.x = lerp(lp.x, tx, 0.08); lp.y = lerp(lp.y, ty, 0.08); if (Math.abs(lp.x - tx) > 30 * TILE) { lp.x = tx; lp.y = ty; }
    const L = LIGHT_PETS[c.lightPet.id].light; if (game.lighting && game.lighting.extraLights) game.lighting.extraLights.push({ x: lp.x / TILE, y: lp.y / TILE, r: L[0], g: L[1], b: L[2] });
  },
  petTick(c) {
    const pp = c.petPos; const tx = c.cx - c.dir * 26, ty = c.y + c.h - 4;
    const dx = tx - pp.x; if (Math.abs(dx) > 6) { pp.vx = lerp(pp.vx, clamp(dx / 10, -3, 3), 0.15); pp.dir = dx < 0 ? -1 : 1; pp.hop += 0.25; } else { pp.vx *= 0.7; pp.hop = 0; }
    pp.x += pp.vx; pp.y = lerp(pp.y, ty, 0.3); if (Math.abs(pp.x - tx) > 30 * TILE) { pp.x = tx; pp.y = ty; }
  },

  // ---- UI: inventory panel in the chest area -------------------------------------------------
  open(game, c) { game.squadInv = c; if (game.openChest) game.closeChest(); if (game.shop) game.closeShop(); if (!game.invOpen) game.toggleInventory(); },
  drawPanel(game) {
    const c = game.squadInv, ctx = game.renderer.ctx, mouse = game.mouse, p = game.player;
    const c0 = UI.chestSlotRect(0), cl = SQUAD_CLASSES[c.cls];
    drawText(ctx, `${c.name}'s Inventory`, c0.x, c0.y - 26, { size: 20, color: '#fff' });
    drawText(ctx, `${cl.title}  Lv ${c.level}   ${c.hp}/${c.maxHp} life${c.cls === 'magic' || c.cls === 'summon' ? `   ${c.mana}/${c.maxMana} mana` : ''}   ${c.gearDefense || 0} def`, c0.x + 230, c0.y - 22, { size: 14, color: cl.color });
    const hov = (r) => mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
    for (let i = 0; i < SQUAD_INV; i++) {
      const r = UI.chestSlotRect(i), s = c.inventory[i], h = hov(r);
      UI.drawSlot(ctx, r.x, r.y, r.s, s, { chest: true, hover: h, selected: i === c.weaponI || i === c.whipI });
      UI.button(r.x, r.y, r.s, r.s, 'mod_ui', { id: 'sq_slot', data: { k: 'inv', i } });
      if (h) { UI.hoverSlot = 'mod:sq'; UI.modHover = s; }
    }
    const eq = [['armor', 0, 'Head', c.armor[0]], ['armor', 1, 'Body', c.armor[1]], ['armor', 2, 'Legs', c.armor[2]], ['vanity', 0, 'V.Head', c.vanity[0]], ['vanity', 1, 'V.Body', c.vanity[1]], ['vanity', 2, 'V.Legs', c.vanity[2]], ['acc', 0, 'Acc', c.accessories[0]], ['acc', 1, 'Acc', c.accessories[1]], ['acc', 2, 'Acc', c.accessories[2]], ['acc', 3, 'Acc', c.accessories[3]]];
    const bx = c0.x + 10 * (c0.s + 6) + 10;
    const petR = { x: bx + 100, y: c0.y, s: c0.s }, lightR = { x: bx + 100 + c0.s + 6, y: c0.y, s: c0.s };
    eq.push(['pet', 0, 'Pet', c.pet], ['light', 0, 'Light', c.lightPet]); eq.push(['dye', 0, 'Dye', c.dyes[0]], ['dye', 1, 'Dye', c.dyes[1]], ['dye', 2, 'Dye', c.dyes[2]]);
    SQUAD_GEAR.forEach((k, i) => eq.push(['eq', i, k, c.equipment[k]]));
    for (let k = 0; k < eq.length; k++) {
      const [kind, i, label, s] = eq[k], r = kind === 'pet' ? petR : kind === 'light' ? lightR : kind === 'dye' ? { x: bx + 100 + i * (c0.s + 6), y: c0.y + c0.s + 6, s: c0.s } : kind === 'eq' ? { x: bx + 100 + i * (c0.s + 6), y: c0.y + 2 * (c0.s + 6), s: c0.s } : UI.chestSlotRect(30 + k), h = hov(r);
      UI.drawSlot(ctx, r.x, r.y, r.s, s, { hover: h, label, chest: kind === 'vanity' });
      UI.button(r.x, r.y, r.s, r.s, 'mod_ui', { id: 'sq_slot', data: { k: kind, i } });
      if (h) { UI.hoverSlot = 'mod:sq'; UI.modHover = s; }
    }
    drawText(ctx, 'Gear', bx + 100, c0.y + 2 * (c0.s + 6) - 12, { size: 11, color: '#bbb' });
    const mkBtn = (label, id, yy) => { const bw = measureText(ctx, label, 18) + 20; const hv = mouse.x >= bx && mouse.x < bx + bw && mouse.y >= yy && mouse.y < yy + 28; ctx.fillStyle = hv ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, bx, yy, bw, 28, 6); ctx.fill(); drawText(ctx, label, bx + bw / 2, yy + 5, { size: 18, align: 'center', color: hv ? '#ffe75a' : '#fff' }); UI.button(bx, yy, bw, 28, 'mod_ui', { id }); };
    mkBtn('Take All', 'sq_takeall', c0.y); mkBtn('Close', 'sq_close', c0.y + 36);
    const wsl = c.inventory[c.weaponI];
    const ty = c0.y + 3 * (c0.s + 6) + 4;
    drawText(ctx, wsl ? `Using: ${itemDisplayName(wsl)}${c.cls === 'summon' && c.inventory[c.whipI] ? ' + ' + itemDisplayName(c.inventory[c.whipI]) : ''}${c.noAmmo ? '  (out of ammo!)' : ''}` : `No ${cl.name.toLowerCase()} weapon!`, bx, ty, { size: 13, color: wsl && !c.noAmmo ? '#c0ffc0' : '#ff9060' });
    drawText(ctx, 'Right click an item to equip it. Shift+click sends it to your bag. V. = vanity. Dyes recolour head / body / legs.', bx, ty + 20, { size: 12, color: '#aaa' });
    const bl = Object.keys(c.buffs || {}).filter(b => c.buffs[b] > 0); if (bl.length) drawText(ctx, 'Buffs: ' + bl.map(b => `${b} (${Math.ceil(c.buffs[b] / 3600)}m)`).join(', '), bx, ty + 38, { size: 12, color: '#c0ffc0' });
  },
  slotClick(game, data, button) {
    const c = game.squadInv; if (!c) return; const p = game.player, shift = game.keys.has('ShiftLeft') || game.keys.has('ShiftRight');
    if (data.k === 'inv') {
      const s = c.inventory[data.i];
      if (shift && s) { const left = p.addItem(s.id, s.count, s.prefix); c.inventory[data.i] = left > 0 ? Object.assign({}, s, { count: left }) : null; Audio_.play('menu'); }
      else if (button === 2 && s && !p.cursorItem) { const it = ITEMS[s.id]; const sc = this.itemScore(c, s); if (it.vanity && it.armor) { const vi = { head: 0, body: 1, legs: 2 }[it.armor]; const old = c.vanity[vi]; c.vanity[vi] = s; c.inventory[data.i] = old; Audio_.play('menu'); } else if (sc.kind && sc.kind !== 'weapon' && sc.kind !== 'whip') { c.inventory[data.i] = this.equip(c, s, sc.kind); Audio_.play('menu'); } else game.slotClick(c.inventory, data.i, button); }
      else game.slotClick(c.inventory, data.i, button);
    } else {
      if (data.k === 'dye') {
        const cur = c.dyes[data.i], ci = p.cursorItem;
        if (shift && cur) { if (p.addItem(cur.id, 1) === 0) c.dyes[data.i] = null; Audio_.play('menu'); }
        else if (ci) { if (!ITEMS[ci.id].dye) { game.message('Only dyes go there.', '#ff8080'); return; } c.dyes[data.i] = { id: ci.id, count: 1 }; ci.count--; if (ci.count <= 0) p.cursorItem = null; if (cur) { const left = p.addItem(cur.id, 1); if (left) game.dropItem(p.cx, p.cy, cur.id, 1); } Audio_.play('menu'); }
        else if (cur) { p.cursorItem = cur; c.dyes[data.i] = null; Audio_.play('menu'); }
        game.updateCraftable(); return;
      }
      const gearK = data.k === 'eq' ? SQUAD_GEAR[data.i] : null;
      const arr = data.k === 'armor' ? c.armor : data.k === 'vanity' ? c.vanity : data.k === 'acc' ? c.accessories : null;
      const isLight = data.k === 'light';
      const cur = arr ? arr[data.i] : gearK ? c.equipment[gearK] : isLight ? c.lightPet : c.pet, ci = p.cursorItem;
      const fits = (s) => { if (!s) return true; const it = ITEMS[s.id]; if (isLight) return it.pet === 'light'; if (gearK) return it.slot === gearK; if (data.k === 'armor') return it.armor === ['head', 'body', 'legs'][data.i] && !it.vanity; if (data.k === 'vanity') return it.armor === ['head', 'body', 'legs'][data.i]; if (data.k === 'acc') return !!it.accessory && !it.slot && !it.mount && !c.accessories.some((a, k) => a && k !== data.i && a.id === s.id); return it.pet === 'regular'; };
      if (shift && cur) { const left = p.addItem(cur.id, cur.count, cur.prefix); if (left === 0) { if (arr) arr[data.i] = null; else if (gearK) c.equipment[gearK] = null; else if (isLight) c.lightPet = null; else c.pet = null; } Audio_.play('menu'); }
      else if (!fits(ci)) { game.message('That does not go there.', '#ff8080'); return; }
      else { if (arr) arr[data.i] = ci; else if (gearK) c.equipment[gearK] = ci; else if (isLight) c.lightPet = ci; else c.pet = ci; p.cursorItem = cur; Audio_.play('menu'); }
    }
    game.updateCraftable(); this.refresh(c);
  },
  drawPrompt(game) {
    const pr = this.prompt, ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse; const { c, req } = pr;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, H);
    const pw = Math.min(640, W - 40), ph = 200, x0 = W / 2 - pw / 2, y0 = H / 2 - ph / 2;
    ctx.fillStyle = 'rgba(40,40,110,0.95)'; roundRect(ctx, x0, y0, pw, ph, 12); ctx.fill(); ctx.strokeStyle = '#a0a0e0'; ctx.lineWidth = 3; roundRect(ctx, x0, y0, pw, ph, 12); ctx.stroke();
    const lk = Squad.look(c); ctx.save(); ctx.translate(x0 + 30, y0 + 30); ctx.scale(2.2, 2.2); drawHumanoid(ctx, 0, 0, { dir: 1, walk: null, colors: lk.colors, armAngle: null, item: null, hairStyle: c.hairStyle, helmet: lk.head, body: lk.body, legs: lk.legs }); ctx.restore();
    drawText(ctx, `${c.name} the ${SQUAD_CLASSES[c.cls].title}`, x0 + 40, y0 + 132, { size: 14, align: 'center', color: SQUAD_CLASSES[c.cls].color });
    const list = req.items.map(([id, n]) => `${n} ${ITEMS[id].name}`).join(' and ');
    const lines = wrapText(ctx, req.kind === 'notice' ? req.text : `Could I have ${list}? ${req.why}`, pw - 140, 18);
    let ly = y0 + 22; for (const l of lines.slice(0, 5)) { drawText(ctx, l, x0 + 110, ly, { size: 18, color: '#fff' }); ly += 24; }
    let ix = x0 + 110; for (const [id] of req.items) { UI.drawItemIcon(ctx, id, ix + 14, y0 + 138, 24); ix += 34; }
    const btn = (label, id, bx, col) => { const bw = 120; const hv = mouse.x >= bx && mouse.x < bx + bw && mouse.y >= y0 + ph - 46 && mouse.y < y0 + ph - 16; ctx.fillStyle = hv ? col : 'rgba(50,60,140,0.9)'; roundRect(ctx, bx, y0 + ph - 46, bw, 30, 6); ctx.fill(); drawText(ctx, label, bx + bw / 2, y0 + ph - 40, { size: 16, align: 'center' }); UI.button(bx, y0 + ph - 46, bw, 30, 'mod_ui', { id }); };
    if (req.kind === 'notice') { btn('Wait (Enter)', 'sq_yes', x0 + pw - 280, 'rgba(60,150,80,0.95)'); btn('Stop build (Esc)', 'sq_no', x0 + pw - 140, 'rgba(150,60,60,0.95)'); }
    else { btn('Give (Enter)', 'sq_yes', x0 + pw - 280, 'rgba(60,150,80,0.95)'); btn('Not now (Esc)', 'sq_no', x0 + pw - 140, 'rgba(150,60,60,0.95)'); }
    drawText(ctx, 'The world waits while they ask.', x0 + pw / 2, y0 + ph - 62, { size: 11, align: 'center', color: '#aaa' });
  },
};

// ---------------------------------------------------------------------------
// Armor tooltips: what the piece and its set grant (the base game only showed the defense)
// ---------------------------------------------------------------------------
Squad.describeMods = function (fn, who) {
  const pm = this.basePm(); const probe = { armor: [null, null, null], accessories: [null, null, null, null], equipment: {}, buffs: {}, hasBuff: () => false, addBuff() {}, inventory: [], vx: 0, vy: 0, onGround: true, hp: 100, maxHp: 100, mana: 20, maxMana: 20, x: 0, y: 0, cx: 0, cy: 0, dir: 1, stats: {}, modData: {}, panicT: 0, flightTime: 0, tileX: 0, tileY: 0 };
  try { fn(who || probe, pm, window.game); } catch (e) { return []; }
  const out = [], pct = (v) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`;
  if (pm.meleeDmg && pm.meleeDmg !== 1) out.push(`${pct(pm.meleeDmg - 1)} melee damage`); if (pm.meleeCrit) out.push(`+${Math.round(pm.meleeCrit)}% melee critical strike chance`); if (pm.meleeSpeed && pm.meleeSpeed !== 1) out.push(`${pct(1 - pm.meleeSpeed)} melee speed`); if (pm.rangedCrit) out.push(`+${Math.round(pm.rangedCrit)}% ranged critical strike chance`); if (pm.magicCrit) out.push(`+${Math.round(pm.magicCrit)}% magic critical strike chance`);
  if (pm.dmg !== 1) out.push(`${pct(pm.dmg - 1)} damage`); if (pm.rangedDmg !== 1) out.push(`${pct(pm.rangedDmg - 1)} ranged damage`); if (pm.magicDmg !== 1) out.push(`${pct(pm.magicDmg - 1)} magic damage`); if (pm.summonDmg !== 1) out.push(`${pct(pm.summonDmg - 1)} minion damage`);
  if (pm.crit) out.push(`+${Math.round(pm.crit)}% critical strike chance`); if (pm.defAdd) out.push(`${pm.defAdd > 0 ? '+' : ''}${pm.defAdd} defense`); if (pm.defMult !== 1) out.push(`${pct(pm.defMult - 1)} defense`);
  if (pm.useTime !== 1) out.push(`${pct(1 - pm.useTime)} melee speed`); if (pm.minionSlots) out.push(`+${pm.minionSlots} minion slot${pm.minionSlots > 1 ? 's' : ''}`); if (pm.sentrySlots) out.push(`+${pm.sentrySlots} sentry slot${pm.sentrySlots > 1 ? 's' : ''}`);
  if (pm.manaRegen) out.push(`+${pm.manaRegen} mana regeneration`); if (pm.manaCostPct) out.push(`-${pm.manaCostPct}% mana cost`); if (pm.whipRange !== 1) out.push(`${pct(pm.whipRange - 1)} whip range`); if (pm.whipSpeed !== 1) out.push(`${pct(pm.whipSpeed - 1)} whip speed`); if (pm.whipTag) out.push(`+${pm.whipTag} whip tag damage`);
  if (pm.regenAdd) out.push(`+${pm.regenAdd} life regeneration`); if (pm.move !== 1) out.push(`${pct(pm.move - 1)} movement speed`); if (pm.jump !== 1) out.push(`${pct(pm.jump - 1)} jump height`); if (pm.modDr) out.push(`${Math.round(pm.modDr * 100)}% damage reduction`); if (pm.dr) out.push(`${Math.round(pm.dr * 100)}% damage reduction`);
  if (pm.projSpeed !== 1) out.push(`${pct(pm.projSpeed - 1)} projectile speed`); if (pm.ammoSave) out.push(`${Math.round(pm.ammoSave * 100)}% chance not to consume ammo`); if (pm.mineSpeed && pm.mineSpeed !== 1) out.push(`${pct(pm.mineSpeed - 1)} mining speed`); if (pm.lavaImmune) out.push('immunity to lava'); if (pm.kbResist) out.push('knockback immunity');
  if (pm.flightMult && pm.flightMult !== 1) out.push(`${pct(pm.flightMult - 1)} flight time`); if (pm.flightAdd) out.push(`+${pm.flightAdd} flight`); if (pm.place) out.push(`+${pm.place} placement range`);
  return out;
};
TooltipHooks.add((stack, it, lines, game) => {
  if (!it || !it.armor || it.vanity) return;
  const p = game.player, set = it.set, S = set && ARMOR_SETS[set];
  // per-piece bonus (class helmets, wood tweaks, mana robes)
  const piece = ARMOR_PIECE_MODS[it.id] ? Squad.describeMods(ARMOR_PIECE_MODS[it.id]) : [];
  if (it.desc) lines.push({ t: it.desc, c: '#c0ffc0', size: 14 }); else if (piece.length) lines.push({ t: piece.join(', '), c: '#c0ffc0', size: 14 });
  if (S) {
    const worn = p.armor.filter(a => a && ITEMS[a.id] && ITEMS[a.id].set === set).length;
    lines.push({ t: `${S.name || set} set (${worn}/3 worn)`, c: worn >= 3 ? '#80ff80' : '#ffe75a', size: 14 });
    const desc = S.desc || (S.bonus ? Squad.describeMods(S.bonus).join(', ') : '');
    for (const l of wrapText(game.renderer.ctx, `Set bonus: ${desc || 'a special effect'}`, 400, 14)) lines.push({ t: l, c: worn >= 3 ? '#80ff80' : '#ccc', size: 14 });
  }
  const cls = Squad.armorClasses(it); if (cls.length && !cls.includes('any')) lines.push({ t: `Favoured by: ${cls.map(k => SQUAD_CLASSES[k].title).join(' / ')}`, c: '#a0d0ff', size: 13 });
});

// ---------------------------------------------------------------------------
// Companion behaviour
// ---------------------------------------------------------------------------
Object.defineProperty(Companion.prototype, 'defense', { get() { return Math.round((4 + this.level + (this.gearDefense || 0) + (this.pm ? this.pm.defAdd : 0)) * (this.pm ? this.pm.defMult : 1)); }, configurable: true });
Object.defineProperty(Companion.prototype, 'title', { get() { const gd = COMPANION_DEFS[this.id]; return this.sq && gd && !gd.guardian ? `${this.name} the ${SQUAD_CLASSES[this.cls].title}  (Lv ${this.level})` : `${this.name}  (Lv ${this.level})`; }, configurable: true });
Companion.prototype.hasBuff = function (b) { return !!(this.buffs && this.buffs[b] > 0); };
Companion.prototype.addBuff = function (b, t) { if (!this.buffs) this.buffs = {}; this.buffs[b] = Math.max(this.buffs[b] || 0, t); };
Companion.prototype.say = function (text) { this.emote = text; this.emoteLife = text ? 150 : 0; };
{
  const baseHit = Companion.prototype.hit;
  Companion.prototype.hit = function (dmg, fromX, game) { if (this.pm && this.pm.dr) dmg = Math.round(dmg * (1 - clamp(this.pm.dr, 0, 0.8))); return baseHit.call(this, dmg, fromX, game); };
  const baseGain = Companion.prototype.gainXp;
  Companion.prototype.gainXp = function (n, game) { const lv = this.level; baseGain.call(this, n, game); if (this.level !== lv && this.sq) { this.maxHp = 100 + 20 * (this.level - 1) + 20 * this.lifeCrystals; this.hp = this.maxHp; Squad.computeMods(this, game); } };
}
const _squadBaseUpdate = Companion.prototype.update;
Companion.prototype.update = function (world, game) {
  if (COMPANION_DEFS[this.id] && COMPANION_DEFS[this.id].guardian) return _squadBaseUpdate.call(this, world, game); // guardians keep their own logic
  if (!this.sq) Squad.init(this);
  const p = game.player;
  if (this.invuln > 0) this.invuln--;
  if (this.hitFlash > 0) this.hitFlash--;
  if (this.emoteLife > 0 && --this.emoteLife === 0) this.emote = null;
  if (this.ko > 0) { this.ko--; this.vx *= 0.8; this.updateLiquidState(world); this.applyGravity(); this.moveAndCollide(world); this.minions.length = 0; if (this.ko === 0) this.revive(game, 0.5); return; }
  if (this.hp < this.maxHp && ++this.regenCounter >= Math.max(10, 45 - this.pm.regenAdd * 3)) { this.regenCounter = 0; this.hp++; }
  if (this.useTimer > 0) { this.useTimer--; const t = 1 - this.useTimer / this.useDuration; this.armAngle = lerp(-2.3, 0.6, smoothstep(t)); } else this.armAngle = null;
  if (this.attackCd > 0) this.attackCd--;
  if (this.jumpCd > 0) this.jumpCd--;
  if (this.toolSwing > 0) this.toolSwing--;
  Squad.tick(this, game);
  // target
  let target = null, best = 25 * TILE;
  for (const e of game.enemies) { if (e.dead) continue; const d = dist(e.cx, e.cy, this.cx, this.cy); if (d < best) { best = d; target = e; } }
  let moveDir = 0, wantJump = false;
  const armed = this.weaponI >= 0 || (this.cls === 'summon' && this.whipI >= 0);
  if (this.talking) { this.dir = p.cx < this.cx ? -1 : 1; }
  else if (target && armed) {
    this.combatT = 120;
    const dx = target.cx - this.cx, adx = Math.abs(dx);
    this.dir = dx < 0 ? -1 : 1;
    const wit = this.inventory[this.weaponI] ? ITEMS[this.inventory[this.weaponI].id] : null;
    if (this.cls === 'melee' && wit && (wit.sword || wit.wclass === 'spear')) {
      const reach = wit.sword ? (wit.sword === 'short' ? 38 : 56) : 4 * TILE;
      if (adx > reach - 8) moveDir = this.dir; else if (adx < 12) moveDir = -this.dir;
      if (target.y + target.h < this.y - 8 && this.onGround && this.jumpCd === 0) wantJump = true;
    } else {
      const ideal = this.cls === 'melee' ? 6 * TILE : this.cls === 'summon' ? 4.5 * TILE : 8 * TILE;
      if (adx > ideal + 16) moveDir = this.dir; else if (adx < ideal - 40) moveDir = -this.dir;
      if (this.cls === 'summon' && target.y + target.h < this.y - 8 && this.onGround && this.jumpCd === 0 && adx < 4 * TILE) wantJump = true;
    }
    if (this.attackCd === 0) Squad.attack(this, target, game);
    if (Math.random() < 0.004) this.say(choose(COMPANION_DEFS[this.id].lines.fight));
  } else if (this.job && (this.jobMove = Squad.jobTick(this, game))) {
    moveDir = this.jobMove.moveDir; if (this.jobMove.wantJump) wantJump = true;
    const site = this.job === 'build' && this.build && this.build.site, onPlot = site && this.cx / TILE > site.x0 - 12 && this.cx / TILE < site.x0 + site.w + 12;
    if (dist(this.cx, this.cy, p.cx, p.cy) > 45 * TILE && !onPlot) { this.x = p.x; this.y = p.y; this.vx = 0; this.vy = 0; this.jobTarget = null; }
  } else if (this.order === 'follow' || this.job) {
    const idx = game.companions.indexOf(this);
    const tx = p.cx - p.dir * (34 + idx * 22);
    const dx = tx - this.cx;
    if (Math.abs(dx) > 24) { moveDir = dx < 0 ? -1 : 1; this.dir = moveDir; }
    if (p.y + p.h < this.y - 20 && Math.abs(dx) < 80 && this.onGround && this.jumpCd === 0) wantJump = true;
    if (dist(this.cx, this.cy, p.cx, p.cy) > 40 * TILE || this.stuck > 240) { this.x = p.x; this.y = p.y; this.vx = 0; this.vy = 0; this.stuck = 0; }
  }
  // wings: fly up to the player, over gaps, or flap to break a long fall; hook: pull yourself up when stuck
  if (this.onGround) this.flightTime = this.wingFlight;
  const wantFly = this.wingFlight > 0 && this.flightTime > 0 && !this.onGround && !this.inWater && (p.y + p.h < this.y - 24 || wantJump || (moveDir && this.stuck > 10) || this.vy > 7);
  if (wantFly) { this.vy = Math.max(this.vy - 0.5, -4); this.flightTime--; this.input.jump = true; wantJump = false; } else this.input.jump = false;
  if (this.hookT > 0) { this.hookT--; this.x = lerp(this.x, this.hookTo.x - this.w / 2, 0.25); this.y = lerp(this.y, this.hookTo.y - this.h, 0.25); this.vx = 0; this.vy = 0; if (this.hookT === 0) this.stuck = 0; }
  else if (this.hookRange > 0 && !this.talking && this.hookCd <= 0 && ((moveDir && this.stuck > 40) || (p.y + p.h < this.y - 6 * TILE && dist(this.cx, this.cy, p.cx, p.cy) < this.hookRange * TILE && !wantFly))) { this.hookTo = { x: p.cx, y: p.y + p.h }; this.hookT = 18; this.hookCd = 90; Audio_.play('grapple'); }
  if (this.hookCd > 0) this.hookCd--;
  // movement
  const speed = 2.4 * this.pm.move;
  if (moveDir) this.vx = lerp(this.vx, moveDir * speed, 0.2); else this.vx *= 0.8;
  if (moveDir && world.time % 10 === 0) { const ax = Math.floor((this.cx + this.dir * 12) / TILE), ay = Math.floor((this.y + this.h / 2) / TILE); if (world.get(ax, ay) === T.DOOR_C) { world.toggleDoor(ax, ay, null); Audio_.play('door'); } }
  this.updateLiquidState(world);
  if (this.inWater && (moveDir || wantJump)) this.vy = Math.min(this.vy, -2.5);
  this.applyGravity();
  const px = this.x;
  this.moveAndCollide(world);
  if ((this.collidedX || wantJump) && this.onGround && this.jumpCd === 0) { this.vy = -6.2 * Math.sqrt(this.pm.jump); this.jumpCd = 25; }
  this.stuck = moveDir && Math.abs(this.x - px) < 0.2 ? this.stuck + 1 : 0;
  if (this.onGround && Math.abs(this.vx) > 0.2) this.walkPhase = (this.walkPhase + Math.abs(this.vx) / 40) % 1; else this.walkPhase = 0;
  if (this.inLava && !this.pm.lavaImmune) { this.hit(50, this.cx, game); this.x = p.x; this.y = p.y - 8; }
  if (this.pet) Squad.petTick(this);
  Squad.lightTick(this, game);
  if (--this.emoteTimer <= 0 && !this.emote) { this.emoteTimer = randInt(900, 2400); if (dist(this.cx, this.cy, p.cx, p.cy) < 12 * TILE) this.say(choose(COMPANION_DEFS[this.id].lines.idle)); }
};
Companion.prototype.draw = function (ctx, camX, camY) {
  if (this.def.draw && this.def.draw(this, ctx, camX, camY)) return;
  const petsOn = true; // vanilla pets are core
  if (petsOn && this.sq && this.lightPet && LIGHT_PETS[this.lightPet.id]) { const lp = this.lightPos, look = Object.assign({ accent: '#fff' }, LIGHT_PETS[this.lightPet.id].look); ctx.save(); ctx.translate(snap(lp.x - camX), snap(lp.y - camY)); if (this.dir < 0) ctx.scale(-1, 1); try { drawPetShape(ctx, look, window.game.world.time); } catch (e) {} ctx.restore(); }
  if (petsOn && this.sq && this.pet && PETS[this.pet.id]) { const pp = this.petPos, look = PETS[this.pet.id].look; ctx.save(); ctx.translate(snap(pp.x - camX), snap(pp.y - camY + (look.legs ? Math.abs(Math.sin(pp.hop)) * -3 : 0))); if (pp.dir < 0) ctx.scale(-1, 1); try { drawPetShape(ctx, look, window.game.world.time); } catch (e) {} ctx.restore(); }
  if (this.ko > 0) {
    ctx.save(); ctx.translate(snap(this.x - camX + 10), snap(this.y + this.h - camY - 6)); ctx.rotate(this.dir * Math.PI / 2); ctx.globalAlpha = 0.85;
    drawHumanoid(ctx, -10, -21, { dir: this.dir, walk: null, colors: this.colors, armAngle: null, item: null, hairStyle: this.hairStyle });
    ctx.restore(); ctx.globalAlpha = 1; return;
  }
  if (this.hitFlash > 0) ctx.globalAlpha = 0.6;
  const fishing = this.sq && this.job === 'fish' && this.fishRod && Sprites.icons[this.fishRod];
  const ws = fishing ? { id: this.fishRod } : this.sq ? (this.useTimer > 0 && this.cls === 'summon' && this.inventory[this.whipI] ? this.inventory[this.whipI] : this.inventory[this.weaponI]) : null;
  if (fishing && this.armAngle == null) this.armAngle = -0.9;
  // ArmamentDisplay: the weapon stays in hand between swings
  const showHeld = typeof WeaponMods !== 'undefined' && WeaponMods.cfg.showHeld && ModList.on('armament_display');
  const icon = ws ? Sprites.icons[ws.id] : null;
  const item = icon && (this.armAngle != null || showHeld) && icon.width <= 16 ? icon : null;
  const armAngle = this.armAngle != null ? this.armAngle : (item ? 1.15 : null);
  // worn armor and vanity show on the companion like they do on you
  const look = this.sq ? Squad.look(this) : { colors: this.colors, head: null, body: null, legs: null };
  const px = snap(this.x - camX + 10), py = snap(this.y + this.gfxOffY - camY), g = window.game;
  // Visual Accessories: wings, cloaks, balloons, shields, emblems... drawn on companions too
  if (this.sq && this.hookT > 0 && this.hookTo) { ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(this.cx - camX, this.cy - camY); ctx.lineTo(this.hookTo.x - camX, this.hookTo.y - camY); ctx.stroke(); }
  if (this.sq && g) { ctx.save(); ctx.translate(px, py); if (this.dir < 0) ctx.scale(-1, 1); try { ModLib.emit('drawPlayerBack', ctx, this, g); } catch (e) {} ctx.restore(); }
  drawHumanoid(ctx, this.x - camX, this.y + this.gfxOffY - camY, { dir: this.dir, walk: this.onGround && Math.abs(this.vx) > 0.2 ? this.walkPhase : null, air: !this.onGround, colors: look.colors, armAngle, item, hairStyle: this.hairStyle, helmet: look.head, body: look.body, legs: look.legs });
  if (this.sq && g) { ctx.save(); ctx.translate(px, py); if (this.dir < 0) ctx.scale(-1, 1); try { ModLib.emit('drawPlayer', ctx, this, g); } catch (e) {} ctx.restore(); }
  ctx.globalAlpha = 1;
  if (this.sq && this.minions.length) for (const m of this.minions) { try { m.draw(ctx, camX, camY); } catch (e) {} }
};

// ---------------------------------------------------------------------------
// Hooks and engine patches
// ---------------------------------------------------------------------------
ModLib.onUiClick('sq_slot', (g, data, button) => Squad.slotClick(g, data.data, button));
ModLib.onUiClick('sq_takeall', (g) => { const c = g.squadInv; if (!c) return; for (let i = 0; i < SQUAD_INV; i++) { const s = c.inventory[i]; if (!s) continue; const left = g.player.addItem(s.id, s.count, s.prefix); c.inventory[i] = left > 0 ? Object.assign({}, s, { count: left }) : null; } Audio_.play('menu'); g.updateCraftable(); Squad.refresh(c); });
ModLib.onUiClick('sq_close', (g) => { g.squadInv = null; Audio_.play('close'); });
ModLib.onUiClick('sq_yes', (g) => Squad.answer(g, true));
ModLib.onUiClick('sq_no', (g) => Squad.answer(g, false));
ModLib.on('drawInventory', (g) => { if (g.squadInv && (g.openChest || g.shop)) g.squadInv = null; if (g.squadInv) Squad.drawPanel(g); });
// the surveyed plot is drawn over the world: outline of the house, red = to dig, blue = to fill
ModLib.on('drawWorld', (g, s, cam) => {
  for (const c of g.companions) {
    if (!c.sq || c.job !== 'build' || !c.build || !c.build.site) continue;
    const { x0, g: gy } = c.build.site, col = SQUAD_CLASSES[c.cls].color, t = g.world.time, P = Squad.planOf(c), W = P.w, H = P.h;
    s.save();
    if (c.build.steps) { for (let i = c.build.i; i < c.build.steps.length; i++) { const st = c.build.steps[i]; if (st.kind === 'dig') { s.fillStyle = 'rgba(255,80,60,0.28)'; s.fillRect(st.x * TILE - cam.x, st.y * TILE - cam.y, TILE, TILE); } else if (st.kind === 'fill') { s.fillStyle = 'rgba(80,140,255,0.28)'; s.fillRect(st.x * TILE - cam.x, st.y * TILE - cam.y, TILE, TILE); } } }
    s.strokeStyle = col; s.lineWidth = 2; s.setLineDash([6, 4]); s.lineDashOffset = -(t % 20); s.globalAlpha = 0.85;
    s.strokeRect(x0 * TILE - cam.x + 1, (gy - H + 1) * TILE - cam.y + 1, W * TILE - 2, H * TILE - 2);
    s.setLineDash([]); s.globalAlpha = 0.6; s.beginPath(); s.moveTo(x0 * TILE - cam.x, gy * TILE - cam.y); s.lineTo((x0 + W) * TILE - cam.x, gy * TILE - cam.y); s.stroke();
    s.globalAlpha = 1; drawText(s, `${c.name}: ${P.name}`, (x0 + W / 2) * TILE - cam.x, (gy - H + 1) * TILE - cam.y - 16, { size: 11, align: 'center', color: col });
    s.restore();
  }
});
ModLib.on('drawHud', (g) => {
  if (Squad.prompt && g.state === 'play') Squad.drawPrompt(g);
  // out-of-ammo warning above the ranger
  for (const c of g.companions) if (c.sq && c.noAmmo && c.ko === 0) drawText(g.renderer.ctx, 'no ammo', c.cx - g.cam.x, c.y - g.cam.y - 30, { size: 11, align: 'center', color: '#ff9060' });
});

ModLib.patch(() => {
  // the world pauses while a companion asks for something
  { const up = Game.prototype.update; Game.prototype.update = function () { if (Squad.prompt && this.state === 'play') { if (this.state !== 'play' || !this.companions.includes(Squad.prompt.c)) Squad.prompt = null; else return; } return up.apply(this, arguments); }; }
  { const ov = Game.prototype.overUI; Game.prototype.overUI = function () { return !!Squad.prompt || ov.call(this); }; }
  { const kd = Game.prototype.onKeyDown; Game.prototype.onKeyDown = function (e) {
    if (Squad.prompt && this.state === 'play') { if (e.code === 'Enter' || e.code === 'KeyY') Squad.answer(this, true); else if (e.code === 'Escape' || e.code === 'KeyN') Squad.answer(this, false); e.preventDefault(); return; }
    return kd.call(this, e);
  }; }
  { const ti = Game.prototype.toggleInventory; Game.prototype.toggleInventory = function () { ti.call(this); if (!this.invOpen) this.squadInv = null; }; }
  // dialog portraits of companions wear their armor
  { const dd = UI.drawDialog; UI.drawDialog = function (game) {
    const d = game.dialog; if (!(d && d.npc && d.npc.isCompanion && d.npc.sq)) return dd.call(this, game);
    const lk = Squad.look(d.npc), orig = window.drawHumanoid;
    window.drawHumanoid = (ctx, x, y, o) => orig(ctx, x, y, Object.assign({}, o, { colors: lk.colors, helmet: lk.head, body: lk.body, legs: lk.legs }));
    try { dd.call(this, game); } finally { window.drawHumanoid = orig; }
  }; }
  // companion dialog: class line and an Inventory button
  { const od = Game.prototype.openDialog; Game.prototype.openDialog = function (npc) {
    od.call(this, npc);
    if (this.dialog && npc.isCompanion && npc.sq && !(COMPANION_DEFS[npc.id] && COMPANION_DEFS[npc.id].guardian)) { const b = this.dialog.buttons; const at = () => b.indexOf('Dismiss') < 0 ? b.length : b.indexOf('Dismiss'); if (!b.includes('Inventory')) b.splice(at(), 0, 'Inventory'); if (!b.includes('Orders')) b.splice(at(), 0, 'Orders'); }
  }; }
  { const db = Game.prototype.dialogButton; Game.prototype.dialogButton = function (b) {
    const d = this.dialog;
    if (d && d.npc && d.npc.isCompanion && d.npc.sq) {
      const c = d.npc;
      if (b === 'Inventory') { this.closeDialog(); Squad.open(this, c); return; }
      const mainButtons = () => ['Close', 'Chat', c.order === 'follow' ? 'Stay here' : 'Follow me', 'Inventory', 'Orders', 'Dismiss'];
      if (b === 'Orders') { Audio_.play('menu'); d.text = c.job ? `I am ${c.job === 'mine' ? 'mining' : c.job === 'chop' ? 'chopping trees' : c.job === 'fish' ? 'fishing' : c.build && c.build.steps ? (c.build.steps[c.build.i] && (c.build.steps[c.build.i].kind === 'dig' || c.build.steps[c.build.i].kind === 'fill') ? `levelling the plot for ${Squad.planOf(c).done} (${Math.round(100 * c.build.i / c.build.steps.length)}% done)` : `building ${Squad.planOf(c).done} (${Math.round(100 * c.build.i / c.build.steps.length)}% done)`) : `getting the materials for ${Squad.planOf(c).done} together`} for you.` : 'What do you need done? I can mine ore, chop trees, fish, or build - a house, a storage hall or an arena.'; d.buttons = c.job ? ['Back', Squad.jobLabel(c)] : ['Back', 'Mine', 'Chop', 'Fish', 'Build']; return; }
      if (b === 'Back') { Audio_.play('menu'); d.text = choose(COMPANION_DEFS[c.id].lines.greet); d.buttons = mainButtons(); return; }
      if (b === 'Build') { Audio_.play('menu'); d.text = 'What should I build? A house (with a loft), a storage hall full of chests, or an arena?'; d.buttons = ['Back', 'House', 'Storage', 'Arena']; return; }
      if (b === 'Arena') { Audio_.play('menu'); d.text = 'How big an arena? Small (40 wide, 3 rows of platforms), Medium (60, 4 rows) or Large (90, 5 rows).'; d.buttons = ['Back', 'Small', 'Medium', 'Large']; return; }
      if (b === 'House' || b === 'Storage' || b === 'Small' || b === 'Medium' || b === 'Large') { Audio_.play('menu'); const plan = b === 'House' ? 'house' : b === 'Storage' ? 'storage' : 'arena_' + b[0].toLowerCase(); d.text = Squad.startJob(c, this, 'build', plan); d.buttons = c.job ? ['Back', Squad.jobLabel(c)] : ['Back', 'House', 'Storage', 'Arena']; return; }
      if (b === 'Mine' || b === 'Chop' || b === 'Fish') { Audio_.play('menu'); d.text = Squad.startJob(c, this, b.toLowerCase()); d.buttons = c.job ? ['Back', Squad.jobLabel(c)] : ['Back', 'Mine', 'Chop', 'Fish', 'Build']; return; }
      if (/^Stop /.test(b)) { Audio_.play('menu'); Squad.stopJob(c, this); d.text = 'Alright, back to fighting.'; d.buttons = mainButtons(); return; }
      if (b === 'Chat') { const ws = c.inventory[c.weaponI]; const gear = ws ? `I'm using ${itemDisplayName(ws)}${c.cls === 'ranged' ? ` with ${c.inventory.reduce((n, s) => n + (s && ITEMS[s.id].ammo === (ITEMS[ws.id].ammoKind || 'bullet') ? s.count : 0), 0)} ${ITEMS[ws.id].ammoKind || 'bullet'}s` : ''}.` : `I have no ${SQUAD_CLASSES[c.cls].name.toLowerCase()} weapon! Give me one or the materials for one.`; if (Math.random() < 0.5) { Audio_.play('menu'); d.text = `${gear} ${c.cls === 'summon' ? `${c.minions.length}/${Squad.minionMax(c)} minions out.` : c.cls === 'magic' ? `${c.mana}/${c.maxMana} mana.` : ''}`; return; } }
    }
    return db.call(this, b);
  }; }
});
ModList.current = null;
