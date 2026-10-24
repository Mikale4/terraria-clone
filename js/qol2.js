// ---------------------------------------------------------------------------
// Quality-of-life and world mods: More Obtaining Tooltips (how to get an item),
// Tooltip Icon (icons on tooltip lines), N Terraria Utilities (inventory tabs
// and a quest system other mods can use), Basic Automated (Vein) Mining,
// Plentiful Ores, Wombat's General Improvements, Demolitionist NPC Sells
// Explore Potions, Merchant Sells Baits, Enemies Drop Biome Crates and the
// Vanilla Fishing Expansion (rods up to the Zenith Fishing Rod, lava fishing,
// baits, the Super Crate Potion and the fishing-mining / botanical rods).
// ---------------------------------------------------------------------------
'use strict';

const QoL = { cfg: { tipCraft: true, tipSold: true, tipDrops: true, tipFish: true, tipShimmer: true, tipIcons: true, vein: true, veinLimit: 40, oreMult: 1, wofOres: true, moonLuminite: true, fastChloro: false, extraWood: true, fastRespawn: true, coinMagnet: true, lifeMarks: true, merchantPotions: true, pickupRange: true, biomeCrates: true } };
ModList.register('more_obtaining_tooltips', 'More Obtaining Tooltips', { workshop: 3594718098, desc: 'Item tooltips show how to obtain them: crafting, shops, drops, fishing, crates, shimmer.', cfg: [ModList.bool(QoL.cfg, 'tipCraft', 'Crafting'), ModList.bool(QoL.cfg, 'tipSold', 'Sold by'), ModList.bool(QoL.cfg, 'tipDrops', 'Dropped by'), ModList.bool(QoL.cfg, 'tipFish', 'Fishing & crates'), ModList.bool(QoL.cfg, 'tipShimmer', 'Shimmer decrafting')] });
ModList.register('tooltip_icon', 'Tooltip Icon', { workshop: 3582340033, desc: 'A small icon on the left of each tooltip line (damage, crit, speed, knockback, defense, mana, value...).', cfg: [ModList.bool(QoL.cfg, 'tipIcons', 'Show icons')] });
ModList.register('nterra_utils', 'N Terraria Utilities', { workshop: 3223748447, desc: 'Tabs at the bottom of the inventory (Inventory / Quests / Mods) and a quest system used by TerraGuardians.', builtin: true });
ModList.register('vein_mining', 'Basic Automated (Vein) Mining', { workshop: 2838188064, desc: 'Mining an ore breaks the whole vein. Shift + right click a block with a pickaxe to whitelist it.', cfg: [ModList.bool(QoL.cfg, 'vein', 'Vein mining'), ModList.cycle(QoL.cfg, 'veinLimit', 'Tile limit', [20, 40, 80, 150])] });
ModList.register('plentiful_ores', 'Plentiful Ores', { workshop: 2817869311, desc: 'More ore at world creation; the Wall of Flesh spawns Hardmode ores everywhere, the Moon Lord scatters Luminite.', cfg: [ModList.cycle(QoL.cfg, 'oreMult', 'Ore at world creation', [1, 2, 3, 5], ['Normal', '2x', '3x', '5x']), ModList.bool(QoL.cfg, 'wofOres', 'Wall of Flesh spawns HM ores'), ModList.bool(QoL.cfg, 'moonLuminite', 'Moon Lord spawns Luminite'), ModList.bool(QoL.cfg, 'fastChloro', 'Fast Chlorophyte (8x)')] });
ModList.register('wombat_improvements', "Wombat's General Improvements", { workshop: 2877696929, desc: 'Small vanilla-consistent tweaks, each toggleable.', cfg: [ModList.bool(QoL.cfg, 'extraWood', 'Trees drop 50% more wood'), ModList.bool(QoL.cfg, 'fastRespawn', 'Faster respawn'), ModList.bool(QoL.cfg, 'coinMagnet', 'Coins fly to you'), ModList.bool(QoL.cfg, 'lifeMarks', 'Life Crystals marked on the map'), ModList.bool(QoL.cfg, 'merchantPotions', 'Merchant sells recall potions'), ModList.bool(QoL.cfg, 'pickupRange', '+2 tiles pickup range')] });
ModList.register('demolitionist_potions', 'Demolitionist NPC Sell explore Potions', { workshop: 3039805818, desc: 'The Demolitionist sells ten exploration potions for 3 silver each.', builtin: true });
ModList.register('merchant_baits', 'Merchant Sells Baits', { workshop: 3430348661, desc: 'Apprentice, Journeyman and Master Bait from the Merchant as you beat bosses.', builtin: true });
ModList.register('enemy_biome_crates', 'Enemies drop Biome Crates', { workshop: 3486609133, desc: 'Any enemy killed in a biome has a rare chance to drop that biome\'s crate.', cfg: [ModList.bool(QoL.cfg, 'biomeCrates', 'Crate drops')] });
ModList.register('vanilla_fishing_expansion', 'Vanilla Fishing Expansion', { workshop: 3067961985, desc: 'Many new rods up to the Zenith Fishing Rod (285%, many hooks, lava fishing), baits, the Super Crate Potion and the fishing-mining / botanical rods.', builtin: true });

// === More Obtaining Tooltips ======================================================================
ModList.current = 'more_obtaining_tooltips';
const Obtain = {
  sources(id) {
    const out = [];
    if (QoL.cfg.tipCraft) { const recs = RECIPES.filter(r => r.result === id).slice(0, 2); for (const r of recs) out.push({ t: `Crafted with: ${r.ing.map(([i, n]) => `${n} ${ITEMS[i] ? ITEMS[i].name : i}`).join(', ')}${r.station ? ` (${ITEMS[r.station] ? ITEMS[r.station].name : r.station})` : ' (by hand)'}`, c: '#c0e0c0', icon: 'craft' }); }
    if (QoL.cfg.tipSold && typeof Fargo === 'undefined') { const sellers = Object.keys(SHOPS).filter(k => SHOPS[k].some(e => e.id === id)); if (sellers.length) out.push({ t: `Sold by: ${sellers.join(', ')}`, c: '#a0c0ff', icon: 'coin' }); }
    if (QoL.cfg.tipDrops) {
      const from = []; for (const k in ENEMY_DEFS) for (const d of ENEMY_DEFS[k].drops || []) if (d.id === id) from.push(`${ENEMY_DEFS[k].name} (${Math.round((d.chance || 1) * 100)}%)`);
      for (const k in BOSS_DEFS) { const d = BOSS_DEFS[k]; if ((d.drops || []).some(x => x.id === id)) from.push(d.name); else if ((d.oneOf || []).includes(id)) from.push(`${d.name} (one of ${d.oneOf.length})`); else if (d.expertItem === id) from.push(`${d.name} (Expert)`); }
      if (from.length) { const t = from.slice(0, 4).join(', ') + (from.length > 4 ? ` +${from.length - 4} more` : ''); out.push({ t: `Dropped by: ${t}`, c: '#ffc0a0', icon: 'skull' }); }
    }
    if (QoL.cfg.tipFish) { if (typeof FISH !== 'undefined' && FISH[id]) { const b = FISH[id].biome; out.push({ t: `Fishing: ${b == null ? 'any water' : ({ [BIOME.SNOW]: 'snow', [BIOME.DESERT]: 'desert', [BIOME.JUNGLE]: 'jungle', [BIOME.OCEAN]: 'ocean', [BIOME.CORRUPTION]: 'corruption', [BIOME.CRIMSON]: 'crimson', [BIOME.HALLOW]: 'hallow' })[b] || 'a specific biome'}${FISH[id].rare ? ', rare' : ''}`, c: '#80c0ff', icon: 'fish' }); } const crates = Object.keys(CRATES).filter(k => CRATES[k].loot.some(l => l[0] === id)); if (crates.length) out.push({ t: `Crates: ${crates.map(k => CRATES[k].name).join(', ')}`, c: '#e0c080', icon: 'crate' }); }
    if (QoL.cfg.tipShimmer) { const rec = RECIPES.find(r => r.result === id); if (rec && rec.ing.length) out.push({ t: `Shimmer: decrafts into ${rec.ing.map(([i, n]) => `${n} ${ITEMS[i] ? ITEMS[i].name : i}`).join(', ')}`, c: '#e0c0ff', icon: 'shimmer' }); const into = RECIPES.filter(r => r.ing.some(([i]) => i === id) && r.ing.length === 1).slice(0, 1); for (const r of into) if (ITEMS[r.result]) out.push({ t: `Shimmer transmutation of ${ITEMS[r.result].name}`, c: '#e0c0ff', icon: 'shimmer' }); }
    return out;
  },
};
TooltipHooks.add((stack, it, lines, game) => { if (!ModList.on('more_obtaining_tooltips') || !stack) return; for (const l of Obtain.sources(stack.id)) { const wrapped = wrapText(game.renderer.ctx, l.t, 420, 13); wrapped.forEach((t, i) => lines.push({ t, c: l.c, size: 13, icon: i === 0 ? l.icon : undefined })); } });

// === Tooltip Icon ====================================================================================
ModList.current = 'tooltip_icon';
const TIP_ICONS = {
  damage: (x) => { x.fillStyle = '#e0e0e0'; x.fillRect(7, 1, 3, 10); x.fillStyle = '#c0a040'; x.fillRect(4, 10, 9, 2); x.fillStyle = '#8a6038'; x.fillRect(7, 12, 3, 4); },
  crit: (x) => { x.strokeStyle = '#ff6a2a'; x.lineWidth = 1.5; x.beginPath(); x.arc(8, 8, 5, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(8, 1); x.lineTo(8, 15); x.moveTo(1, 8); x.lineTo(15, 8); x.stroke(); },
  speed: (x) => { x.strokeStyle = '#c0c0ff'; x.lineWidth = 1.5; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(8, 8); x.lineTo(8, 3); x.moveTo(8, 8); x.lineTo(11, 9); x.stroke(); },
  knockback: (x) => { x.fillStyle = '#ffb060'; x.beginPath(); x.moveTo(2, 8); x.lineTo(9, 3); x.lineTo(9, 6); x.lineTo(14, 6); x.lineTo(14, 10); x.lineTo(9, 10); x.lineTo(9, 13); x.closePath(); x.fill(); },
  defense: (x) => { x.fillStyle = '#80a0ff'; x.beginPath(); x.moveTo(8, 1); x.lineTo(14, 3); x.lineTo(13, 10); x.lineTo(8, 15); x.lineTo(3, 10); x.lineTo(2, 3); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(7, 4, 2, 6); },
  mana: (x) => { x.fillStyle = '#6080ff'; x.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 3 : 7, a = k * Math.PI / 5 - Math.PI / 2; x.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } x.closePath(); x.fill(); },
  pick: (x) => { x.fillStyle = '#8a6038'; x.fillRect(7, 5, 2, 10); x.fillStyle = '#c0c0c8'; x.beginPath(); x.moveTo(2, 6); x.quadraticCurveTo(8, 0, 14, 6); x.lineTo(13, 8); x.quadraticCurveTo(8, 3, 3, 8); x.closePath(); x.fill(); },
  ammo: (x) => { x.fillStyle = '#c0c0c8'; x.fillRect(7, 2, 2, 10); x.fillStyle = '#ffe060'; x.fillRect(6, 1, 4, 3); },
  material: (x) => { x.fillStyle = '#c0a060'; x.fillRect(3, 5, 10, 8); x.fillStyle = '#e0c080'; x.fillRect(3, 5, 10, 2); },
  place: (x) => { x.fillStyle = '#8a7a5a'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#b0a080'; x.fillRect(2, 2, 12, 2); x.fillRect(2, 2, 2, 12); },
  coin: (x) => { x.fillStyle = '#ffe060'; x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#c0a020'; x.beginPath(); x.arc(8, 8, 3, 0, Math.PI * 2); x.fill(); },
  craft: (x) => { x.fillStyle = '#c0c0c8'; x.fillRect(3, 9, 10, 4); x.fillStyle = '#8a6038'; x.fillRect(5, 3, 2, 8); x.fillRect(9, 3, 2, 8); },
  skull: (x) => { x.fillStyle = '#e0e0e0'; x.fillRect(4, 2, 8, 8); x.fillRect(5, 10, 6, 4); x.fillStyle = '#000'; x.fillRect(5, 5, 2, 2); x.fillRect(9, 5, 2, 2); },
  fish: (x) => { x.fillStyle = '#80c0ff'; x.beginPath(); x.ellipse(7, 8, 5, 3, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(12, 8); x.lineTo(15, 5); x.lineTo(15, 11); x.fill(); },
  crate: (x) => { x.fillStyle = '#9a6a3a'; x.fillRect(2, 4, 12, 10); x.fillStyle = '#6a4520'; x.fillRect(2, 4, 12, 1); x.fillRect(2, 9, 12, 1); x.fillRect(7, 4, 2, 10); },
  shimmer: (x) => { x.fillStyle = '#e0c0ff'; x.beginPath(); x.moveTo(8, 1); x.lineTo(11, 8); x.lineTo(8, 15); x.lineTo(5, 8); x.closePath(); x.fill(); },
  equip: (x) => { x.fillStyle = '#a0a0b0'; x.fillRect(4, 4, 8, 9); x.fillStyle = '#d0d0e0'; x.fillRect(2, 4, 4, 3); x.fillRect(10, 4, 4, 3); },
  buff: (x) => { x.fillStyle = '#ff80a0'; x.beginPath(); x.arc(8, 6, 4, 0, Math.PI * 2); x.fill(); x.fillRect(6, 9, 4, 5); },
};
TooltipHooks.addLate((lines) => {
  if (!QoL.cfg.tipIcons || !ModList.on('tooltip_icon')) return;
  for (const l of lines) {
    if (l.icon) { if (typeof l.icon === 'string' && TIP_ICONS[l.icon]) l.icon = TIP_ICONS[l.icon]; continue; }
    const t = l.t || '';
    let k = null;
    if (/damage$|damage\b.*(ammo|Uses)/.test(t) && /^\d/.test(t)) k = 'damage'; else if (/critical strike/.test(t)) k = 'crit'; else if (/ speed$/.test(t)) k = 'speed'; else if (/knockback$/.test(t)) k = 'knockback'; else if (/^\d+ defense/.test(t)) k = 'defense'; else if (/mana/i.test(t) && /^(Uses|\+)/.test(t)) k = 'mana'; else if (/pickaxe power|axe power|hammer power/.test(t)) k = 'pick'; else if (/^Material$/.test(t)) k = 'material'; else if (/^Can be placed$/.test(t)) k = 'place'; else if (/^(Value|Buy price|Sell value):/.test(t)) k = 'coin'; else if (/^Shift\+click or use to equip/.test(t)) k = 'equip'; else if (/for \d+ minutes/.test(t)) k = 'buff';
    if (k) l.icon = TIP_ICONS[k];
  }
});

// === N Terraria Utilities: inventory tabs + quests =====================================================
ModList.current = 'nterra_utils';
const NTerra = {
  tabs: [], tab: 'Inventory', quests: [],
  addTab(name, draw, click) { this.tabs.push({ name, draw, click }); },
  // quest: { id, name, giver, desc, type: 'kill'|'collect'|'boss', target, count, reward: [[id, n]], coins, cond(g) }
  addQuest(q) { this.quests.push(q); },
  state(g) { return ModLib.player(g, 'quests', () => ({ progress: {}, done: {} })); },
  available(g) { return this.quests.filter(q => !q.cond || q.cond(g)); },
  progress(g, q) { const s = this.state(g); if (q.type === 'collect') return Math.min(q.count, g.player.countItem(q.target)); if (q.type === 'boss') return ModLib.beaten(g, q.target) ? 1 : 0; return Math.min(q.count, s.progress[q.id] || 0); },
  claim(g, q) { const s = this.state(g); if (s.done[q.id] || this.progress(g, q) < (q.type === 'boss' ? 1 : q.count)) return false; if (q.type === 'collect') g.player.removeItem(q.target, q.count); s.done[q.id] = true; for (const [id, n] of q.reward || []) { const left = g.player.addItem(id, n, null); if (left) g.dropItem(g.player.cx, g.player.cy, id, left); } if (q.coins) g.player.coins += q.coins; g.message(`Quest complete: ${q.name}!`, '#ffe75a'); Audio_.play('levelup'); ModLib.emit('questDone', g, q); return true; },
  drawTabs(g) {
    if (!g.invOpen || !ModList.on('nterra_utils')) return; const ctx = g.renderer.ctx, mouse = g.mouse, H = g.renderer.H; let x = 20; const y = H - 34;
    for (const tb of [{ name: 'Inventory' }, ...this.tabs]) { const w = measureText(ctx, tb.name, 15) + 24; const on = this.tab === tb.name; const hov = mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + 26; ctx.fillStyle = on ? 'rgba(255,230,90,0.85)' : hov ? 'rgba(90,100,190,0.9)' : 'rgba(40,50,120,0.8)'; roundRect(ctx, x, y, w, 26, 6); ctx.fill(); drawText(ctx, tb.name, x + w / 2, y + 4, { size: 15, align: 'center', color: on ? '#000' : '#fff', outline: null }); UI.button(x, y, w, 26, 'mod_ui', { id: 'nterra_tab', data: tb.name }); x += w + 6; }
    const cur = this.tabs.find(t => t.name === this.tab); if (cur) cur.draw(g);
  },
  drawQuests(g) {
    const ctx = g.renderer.ctx, W = g.renderer.W, H = g.renderer.H, mouse = g.mouse; const x0 = Math.max(20, W - 470), y0 = 60, w = 440, s = this.state(g);
    ctx.fillStyle = 'rgba(15,15,40,0.92)'; roundRect(ctx, x0, y0, w, H - y0 - 60, 8); ctx.fill();
    drawText(ctx, 'Quests', x0 + 16, y0 + 10, { size: 20, color: '#ffe75a' });
    let y = y0 + 44; const list = this.available(g);
    if (!list.length) drawText(ctx, 'No quests yet. Talk to townsfolk and companions.', x0 + 16, y, { size: 14, color: '#aaa' });
    for (const q of list) {
      if (y > H - 130) { drawText(ctx, '...', x0 + 16, y, { size: 14, color: '#aaa' }); break; }
      const done = !!s.done[q.id], prog = this.progress(g, q), need = q.type === 'boss' ? 1 : q.count, ready = !done && prog >= need;
      drawText(ctx, `${q.name}${q.giver ? ` - ${q.giver}` : ''}`, x0 + 16, y, { size: 15, color: done ? '#80c080' : ready ? '#ffe75a' : '#fff' });
      for (const l of wrapText(ctx, q.desc, w - 150, 12)) { y += 15; drawText(ctx, l, x0 + 16, y, { size: 12, color: '#ccc' }); }
      y += 16; drawText(ctx, done ? 'Completed' : `${prog}/${need}`, x0 + 16, y, { size: 12, color: done ? '#80c080' : '#a0c0ff' });
      const rw = (q.reward || []).map(([id, n]) => `${n} ${ITEMS[id] ? ITEMS[id].name : id}`).concat(q.coins ? [coinsToString(q.coins)] : []).join(', '); drawText(ctx, `Reward: ${rw}`, x0 + 90, y, { size: 12, color: '#e0c080' });
      if (ready) { const bx = x0 + w - 90, by = y - 16; const hov = mouse.x >= bx && mouse.x < bx + 76 && mouse.y >= by && mouse.y < by + 26; ctx.fillStyle = hov ? '#ffe75a' : 'rgba(255,230,90,0.7)'; roundRect(ctx, bx, by, 76, 26, 6); ctx.fill(); drawText(ctx, 'Claim', bx + 38, by + 5, { size: 14, align: 'center', color: '#000', outline: null }); UI.button(bx, by, 76, 26, 'mod_ui', { id: 'nterra_claim', data: q.id }); }
      y += 26;
    }
  },
};
NTerra.addTab('Quests', (g) => NTerra.drawQuests(g));
NTerra.addTab('Mods', (g) => { const ctx = g.renderer.ctx, W = g.renderer.W, H = g.renderer.H; const x0 = Math.max(20, W - 470), y0 = 60; ctx.fillStyle = 'rgba(15,15,40,0.92)'; roundRect(ctx, x0, y0, 440, H - y0 - 60, 8); ctx.fill(); drawText(ctx, `${ModList.mods.filter(m => m.enabled).length} mods enabled`, x0 + 16, y0 + 10, { size: 18, color: '#ffe75a' }); let y = y0 + 40; for (const m of ModList.mods) { if (y > H - 90) { drawText(ctx, '... (see Settings > Mod settings > Concise mod list)', x0 + 16, y, { size: 12, color: '#aaa' }); break; } drawText(ctx, `${m.enabled ? '●' : '○'} ${m.name}`, x0 + 16, y, { size: 12, color: m.enabled ? '#ddd' : '#777', outline: null }); y += 14; } });
ModLib.onUiClick('nterra_tab', (g, d) => { NTerra.tab = d.data; Audio_.play('menu'); });
ModLib.onUiClick('nterra_claim', (g, d) => { const q = NTerra.quests.find(x => x.id === d.data); if (q) NTerra.claim(g, q); });
ModLib.on('drawHud', (g) => NTerra.drawTabs(g));
ModLib.onEnemyKilled((g, e) => { const s = NTerra.state(g); for (const q of NTerra.quests) if (q.type === 'kill' && !s.done[q.id] && (q.target === e.type || (q.match && q.match.test(e.name || '')))) s.progress[q.id] = (s.progress[q.id] || 0) + 1; });
NTerra.addQuest({ id: 'slime_trouble', name: 'Slime Trouble', giver: 'Guide', desc: 'Slimes are everywhere. Squash 15 of them.', type: 'kill', match: /Slime/, count: 15, reward: [['lesser_healing', 5]], coins: 1500 });
NTerra.addQuest({ id: 'stargazer', name: 'Stargazer', giver: 'Guide', desc: 'Collect 5 Fallen Stars at night.', type: 'collect', target: 'fallen_star', count: 5, reward: [['mana_crystal', 1]] });
NTerra.addQuest({ id: 'grave_matters', name: 'Grave Matters', giver: 'Merchant', desc: 'Zombies keep knocking on doors. Put 25 of them to rest.', type: 'kill', target: 'zombie', count: 25, reward: [['tombstone', 1]], coins: 5000 });
NTerra.addQuest({ id: 'first_boss', name: 'A Watchful Eye', giver: 'Guide', desc: 'Defeat the Eye of Cthulhu.', type: 'boss', target: 'eye_of_cthulhu', count: 1, reward: [['iron_bar', 15]], coins: 10000 });
NTerra.addQuest({ id: 'gem_hunter', name: 'Gem Hunter', giver: 'Merchant', desc: 'Bring back 10 Sapphires.', type: 'collect', target: 'sapphire', count: 10, coins: 20000, cond: (g) => ModLib.beaten(g, 'eye_of_cthulhu') });
NTerra.addQuest({ id: 'bone_collector', name: 'Bone Collector', giver: 'Demolitionist', desc: 'Skeletons make good fuses. Break 30 of them.', type: 'kill', match: /Skeleton|Bones/, count: 30, reward: [['dynamite', 5]], coins: 10000 });
NTerra.addQuest({ id: 'hardmode_ready', name: 'Iron Will', giver: 'Guide', desc: 'Defeat the Wall of Flesh.', type: 'boss', target: 'wall_of_flesh', count: 1, reward: [['greater_healing', 10]], coins: 50000, cond: (g) => ModLib.beaten(g, 'skeletron') });

// === Basic Automated (Vein) Mining ===================================================================
ModList.current = 'vein_mining';
const VeinMiner = {
  busy: false, whitelist(g) { return ModLib.world(g, 'veinWhitelist', () => ({ ids: [] })); },
  isOre(id) { const d = TILES[id]; if (!d) return false; return /ore|gem|hellstone|crystal shard|meteorite/i.test(d.name) || id === T.GEM; },
  after(g, tx, ty, id) {
    if (!QoL.cfg.vein || !ModList.on('vein_mining') || this.busy || g.world.isSub) return;
    const wl = this.whitelist(g).ids; if (!(this.isOre(id) || wl.includes(id))) return;
    const sel = g.player.selectedItem; if (!sel || ITEMS[sel.id].tool !== 'pick') return;
    const limit = Math.min(QoL.cfg.veinLimit, 10 + Math.floor((ITEMS[sel.id].power || 35) / 3)); const w = g.world;
    this.busy = true; let n = 0; const q = [[tx, ty]], seen = new Set([tx + ',' + ty]);
    while (q.length && n < limit) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, k = X + ',' + Y; if (seen.has(k) || !w.inBounds(X, Y)) continue; seen.add(k); if (w.get(X, Y) === id) { if (ITEMS[sel.id].power < (TILES[id].minPower || 0)) continue; g.breakTile(X, Y); n++; q.push([X, Y]); if (n >= limit) break; } } }
    this.busy = false; if (n > 0) g.addDamageText(tx * TILE + 8, ty * TILE, `vein x${n + 1}`, '#ffe080');
  },
};
ModLib.on('tileBroken', (g, tx, ty, id) => VeinMiner.after(g, tx, ty, id));
ModLib.onRightClick((g) => { const shift = g.keys.has('ShiftLeft') || g.keys.has('ShiftRight'); const sel = g.player.selectedItem; if (!shift || !sel || ITEMS[sel.id].tool !== 'pick' || !ModList.on('vein_mining')) return false; const h = g.hoverTile; if (!h) return false; const id = g.world.get(h.x, h.y); if (id === T.AIR) return false; const wl = VeinMiner.whitelist(g).ids; const i = wl.indexOf(id); if (i >= 0) { wl.splice(i, 1); g.message(`${TILES[id].name} removed from the vein-mining whitelist.`, '#c0c0ff'); } else { wl.push(id); g.message(`${TILES[id].name} added to the vein-mining whitelist.`, '#c0ffc0'); } Audio_.play('menu'); return true; });

// === Plentiful Ores ===================================================================================
ModList.current = 'plentiful_ores';
{ const base = generateWorld; generateWorld = function* (world) { if (ModList.on('plentiful_ores')) world.oreMult = QoL.cfg.oreMult; yield* base(world); }; }
ModLib.onEnemyKilled((g, e) => { if (!ModList.on('plentiful_ores') || !e.isBoss) return; if (e.type === 'wall_of_flesh' && QoL.cfg.wofOres) { setTimeout(() => { const w = g.world; w.altOres = w.altOres || {}; w.altOres.cobalt = 'cobalt'; w.altOres.mythril = 'mythril'; w.altOres.adamantite = 'titanium'; let n = 0; for (let k = 0; k < 3; k++) n += Ores.bless(g, k); g.message(`The Wall's fall seeded the underground with ${n} tiles of Hardmode ore!`, '#60c0ff'); }, 100); } if (e.type === 'moon_lord' && QoL.cfg.moonLuminite && T.LUMINITE_ORE) { const w = g.world; let n = 0; for (let k = 0; k < 8000 && n < 400; k++) { const x = randInt(10, w.w - 10), y = randInt(w.surfaceLine + 30, w.h - 80); const t = w.get(x, y); if (t === T.STONE || t === T.DIRT) { w.rawSet(x, y, T.LUMINITE_ORE); w.markMap(x, y); n++; } } g.message('Luminite rains into the earth from the dying moon!', '#40e0c0'); } });
ModLib.on('tick', (g) => { if (QoL.cfg.fastChloro && ModList.on('plentiful_ores') && g.world.hardmode && g.world.time % 30 === 0) for (let k = 0; k < 7; k++) Ores.tick(g.world); });

// === Wombat's General Improvements =====================================================================
ModList.current = 'wombat_improvements';
ModLib.patch(() => { const base = Game.prototype.breakTile; Game.prototype.breakTile = function (tx, ty) { const w = this.world, id = w.get(tx, ty); const n0 = this.drops.length; base.call(this, tx, ty); if ((id === T.TREE || id === T.TREETOP) && QoL.cfg.extraWood && ModList.on('wombat_improvements')) { let wood = 0; for (let i = n0; i < this.drops.length; i++) if (/wood|mahogany/.test(this.drops[i].id)) wood++; if (wood) this.dropItem(tx * TILE + 8, ty * TILE, this.drops[n0] ? this.drops[n0].id : 'wood', Math.max(1, Math.round(wood * 0.5))); } }; });
ModLib.onPlayerMods((p, pm, g) => { if (!ModList.on('wombat_improvements')) return; if (QoL.cfg.pickupRange) pm.pickup = (pm.pickup || 0) + 2 * TILE; if (QoL.cfg.fastRespawn && p.dead && p.deadTimer > 240 && !g.boss) p.deadTimer = 240; });
ModLib.on('tick', (g) => { if (!ModList.on('wombat_improvements')) return; const p = g.player; if (QoL.cfg.coinMagnet && g.world.time % 2 === 0) for (const d of g.drops) if (d.id && d.id.startsWith('coin_') && !d.dead) { const dx = p.cx - d.cx, dy = p.cy - d.cy, dd = Math.hypot(dx, dy); if (dd < 10 * TILE && dd > 8) { d.vx += dx / dd * 0.8; d.vy += dy / dd * 0.8; } } });
ModLib.on('drawMap', (g, sx, sy, z) => { if (!QoL.cfg.lifeMarks || !ModList.on('wombat_improvements') || T.LIFECRYSTAL == null) return; const ctx = g.renderer.ctx, w = g.world; const W = g.renderer.W, H = g.renderer.H; ctx.fillStyle = '#ff60a0'; for (let y = Math.max(0, Math.floor(sy)); y < Math.min(w.h, sy + H / z); y += 1) for (let x = Math.max(0, Math.floor(sx)); x < Math.min(w.w, sx + W / z); x++) if (w.tiles[x + y * w.w] === T.LIFECRYSTAL && (w.tdata[x + y * w.w] & 15) === 0) ctx.fillRect((x - sx) * z - 2, (y - sy) * z - 2, 5, 5); });
if (SHOPS.Merchant) SHOPS.Merchant.push({ id: 'recall_potion', price: 500, cond: () => QoL.cfg.merchantPotions && ModList.on('wombat_improvements') }, { id: 'wormhole_potion', price: 800, cond: () => QoL.cfg.merchantPotions && ModList.on('wombat_improvements') });

// === Demolitionist NPC Sell explore Potions ===============================================================
ModList.current = 'demolitionist_potions';
defModPotion('dangersense_potion', 'Dangersense Potion', 'Dangersense', 'Lava, spikes and hot blocks near you are highlighted', '#ff8040', [['bottle', 1], ['cobweb', 5], ['glow_mushroom', 1]]);
defModPotion('shine_potion', 'Shine Potion', 'Shine', 'You emit light', '#ffe060', [['bottle', 1], ['glow_mushroom', 1], ['torch', 1]], { mod: () => {} });
defModPotion('night_owl_potion', 'Night Owl Potion', 'Night Owl', 'Much better night vision', '#c0c0ff', [['bottle', 1], ['lens', 1], ['glow_mushroom', 1]]);
defModPotion('calming_potion', 'Calming Potion', 'Calm', 'Enemies spawn 40% less often', '#80c0c0', [['bottle', 1], ['mushroom', 1], ['cactus', 1]], { mod: (p, pm) => { pm.spawnMult = (pm.spawnMult || 1) * 0.6; } });
if (!BUFF_MODS.Dangersense) BUFF_MODS.Dangersense = () => {}; if (!BUFF_MODS['Night Owl']) BUFF_MODS['Night Owl'] = () => {}; if (!BUFF_MODS.Gravitation) BUFF_MODS.Gravitation = () => {};
ModLib.on('drawWorld', (g, s, cam) => { const p = g.player, w = g.world; if (p.hasBuff('Dangersense') && g.world.time % 2 === 0) { const r = 20; s.fillStyle = 'rgba(255,80,40,0.35)'; for (let y = p.tileY - r; y <= p.tileY + r; y++) for (let x = p.tileX - r; x <= p.tileX + r; x++) { if (!w.inBounds(x, y)) continue; const id = w.get(x, y); if ((w.lavaAt(x, y) === LIQ.LAVA && w.liquidAt(x, y) > 40) || (TILES[id] && (TILES[id].hurt || id === T.SPIKE))) s.fillRect(x * TILE - cam.x, y * TILE - cam.y, TILE, TILE); } } });
{ const explore = ['mining_potion', 'dangersense_potion', 'spelunker_potion', 'shine_potion', 'hunter_potion', 'night_owl_potion', 'gravitation_potion', 'gills_potion', 'obsidian_skin_potion', 'calming_potion']; if (SHOPS.Demolitionist) for (const id of explore) if (ITEMS[id]) SHOPS.Demolitionist.push({ id, price: 300, cond: () => ModList.on('demolitionist_potions') }); }
// Night Owl / Shine: brighten the world around the player
ModLib.on('drawWorld', (g, s, cam) => { const p = g.player; if (p.hasBuff('Shine') || p.hasBuff('Night Owl')) { const r = p.hasBuff('Night Owl') ? 260 : 120; const grd = s.createRadialGradient(p.cx - cam.x, p.cy - cam.y, 10, p.cx - cam.x, p.cy - cam.y, r); grd.addColorStop(0, 'rgba(255,240,200,0.28)'); grd.addColorStop(1, 'rgba(255,240,200,0)'); s.globalCompositeOperation = 'lighter'; s.fillStyle = grd; s.beginPath(); s.arc(p.cx - cam.x, p.cy - cam.y, r, 0, Math.PI * 2); s.fill(); s.globalCompositeOperation = 'source-over'; } });

// === Merchant Sells Baits ===================================================================================
ModList.current = 'merchant_baits';
defFishItem('apprentice_bait', 'Apprentice Bait', { bait: 15, tooltip: '15% bait power', value: 300, drawIcon: drawWorm('#c0a080') });
defFishItem('journeyman_bait', 'Journeyman Bait', { bait: 30, rarity: 1, tooltip: '30% bait power', value: 600, drawIcon: drawWorm('#e0c060') });
defFishItem('master_bait', 'Master Bait', { bait: 50, rarity: 2, tooltip: '50% bait power', value: 1200, drawIcon: drawWorm('#ffe040') });
if (SHOPS.Merchant) SHOPS.Merchant.push({ id: 'apprentice_bait', price: 300, cond: (g) => ModList.on('merchant_baits') && ModLib.beaten(g, 'eye_of_cthulhu') }, { id: 'worm', price: 400, cond: (g) => ModList.on('merchant_baits') && ModLib.beaten(g, 'eye_of_cthulhu') && (ModLib.beaten(g, 'eater_of_worlds') || ModLib.beaten(g, 'brain_of_cthulhu')) }, { id: 'journeyman_bait', price: 800, cond: (g) => ModList.on('merchant_baits') && ModLib.beaten(g, 'skeletron') }, { id: 'master_bait', price: 2000, cond: (g) => ModList.on('merchant_baits') && ModLib.mechs(g) >= 3 });

// === Enemies drop Biome Crates ==================================================================================
ModList.current = 'enemy_biome_crates';
const BIOME_CRATES = {
  jungle_crate: { name: 'Jungle Crate', biome: BIOME.JUNGLE, col: ['#40a040', '#206020'], loot: [['jungle_spores', 5, 12, 0.6], ['stinger', 3, 8, 0.5], ['vine', 2, 5, 0.4], ['bee_wax', 3, 8, 0.3], ['blade_of_grass', 1, 1, 0.1], ['anklet_of_the_wind', 1, 1, 0.1], ['honey_block', 5, 10, 0.3], ['jungle_bat', 0, 0, 0]].filter(l => l[1]), coins: [5000, 20000] },
  corruption_crate: { name: 'Corrupt Crate', biome: BIOME.CORRUPTION, col: ['#6a3ad0', '#3a1a80'], loot: [['demonite_ore', 8, 16, 0.7], ['rotten_chunk', 5, 10, 0.6], ['shadow_scale', 3, 8, 0.4], ['worm_food', 1, 1, 0.15], ['vilethorn', 1, 1, 0.1], ['ball_o_hurt', 1, 1, 0.1], ['cursed_flame', 3, 6, 0.3]], coins: [5000, 20000] },
  crimson_crate: { name: 'Crimson Crate', biome: BIOME.CRIMSON, col: ['#c02030', '#601018'], loot: [['crimtane_ore', 8, 16, 0.7], ['vertebra', 5, 10, 0.6], ['tissue_sample', 3, 8, 0.4], ['bloody_spine', 1, 1, 0.15], ['crimson_rod', 1, 1, 0.1], ['the_rotted_fork', 1, 1, 0.1], ['ichor', 3, 6, 0.3]], coins: [5000, 20000] },
  hallowed_crate: { name: 'Hallowed Crate', biome: BIOME.HALLOW, col: ['#ffb0ff', '#a060c0'], loot: [['pixie_dust', 5, 12, 0.7], ['crystal_shard', 5, 12, 0.6], ['unicorn_horn', 1, 3, 0.4], ['soul_of_light', 3, 8, 0.5], ['hallowed_bar', 3, 6, 0.3], ['sandstorm_in_a_bottle', 0, 0, 0]].filter(l => l[1]), coins: [10000, 40000] },
  frozen_crate: { name: 'Frozen Crate', biome: BIOME.SNOW, col: ['#a0e0ff', '#4080c0'], loot: [['ice', 10, 30, 0.7], ['flinx_fur', 3, 8, 0.5], ['frost_core', 1, 1, 0.1], ['ice_blade', 1, 1, 0.1], ['ice_boomerang', 1, 1, 0.1], ['snow', 10, 30, 0.5], ['silver_bar', 3, 8, 0.4]], coins: [5000, 20000] },
  oasis_crate: { name: 'Oasis Crate', biome: BIOME.DESERT, col: ['#e8d090', '#a08040'], loot: [['sand', 10, 30, 0.7], ['antlion_mandible', 2, 5, 0.5], ['scarab_shell', 2, 5, 0.4], ['fossil', 5, 12, 0.4], ['sandstorm_in_a_bottle', 1, 1, 0.08], ['pharaohs_mask', 1, 1, 0.08], ['mummy_bandage', 1, 2, 0.2]], coins: [5000, 20000] },
  ocean_crate: { name: 'Ocean Crate', biome: BIOME.OCEAN, col: ['#40a0c0', '#206080'], loot: [['shark_fin', 1, 3, 0.5], ['sea_prism', 2, 5, 0.4], ['flipper', 1, 1, 0.1], ['sailors_hat', 0, 0, 0], ['pearl_shard', 2, 5, 0.3], ['coin_gold', 1, 3, 0.6], ['pirate_map', 1, 1, 0.05]].filter(l => l[1]), coins: [8000, 25000] },
  dungeon_crate: { name: 'Dungeon Crate', mini: 'Dungeon', col: ['#3a4a7a', '#1a2a4a'], loot: [['bone', 10, 25, 0.8], ['dungeon_brick', 10, 25, 0.5], ['golden_key', 1, 1, 0.1], ['book_of_skulls', 1, 1, 0.08], ['muramasa', 1, 1, 0.08], ['cobalt_shield', 1, 1, 0.08], ['spike', 5, 10, 0.3]], coins: [10000, 40000] },
  sky_crate: { name: 'Sky Crate', sky: true, col: ['#c0e0ff', '#6090c0'], loot: [['fallen_star', 5, 12, 0.7], ['feather', 0, 0, 0], ['starfury', 1, 1, 0.1], ['shiny_red_balloon', 1, 1, 0.1], ['lucky_horseshoe', 1, 1, 0.1], ['soul_of_height', 2, 5, 0.3]].filter(l => l[1]), coins: [8000, 30000] },
  obsidian_crate: { name: 'Obsidian Crate', hell: true, col: ['#2a1e3a', '#ff8020'], loot: [['hellstone', 10, 25, 0.7], ['obsidian', 10, 25, 0.7], ['obsidian_skull', 1, 1, 0.1], ['hellwing_bow', 1, 1, 0.08], ['flamelash', 1, 1, 0.08], ['sunfury', 1, 1, 0.08], ['obsidian_rose', 1, 1, 0.05]], coins: [10000, 40000] },
};
for (const id in BIOME_CRATES) { const c = BIOME_CRATES[id]; CRATES[id] = { name: c.name, value: 8000, rarity: 2, loot: c.loot, coins: c.coins }; defFishItem(id, c.name, { crate: true, value: 8000, rarity: 2, tooltip: 'Right-click / use to open. Contains biome loot', drawIcon: drawCrate(c.col[0], c.col[1]) }); ITEMS[id].onUse = (game, slot) => Fishing.openCrate(game, slot); }
const crateFor = (g, x, y) => { const w = g.world, d = BiomeSys.detect(g); const b = w.biome[clamp(x, 0, w.w - 1)]; if (d && d.mini === 'Dungeon') return 'dungeon_crate'; if (y > w.h - 70) return 'obsidian_crate'; if (y < w.surfaceLine - 60) return 'sky_crate'; for (const id in BIOME_CRATES) if (BIOME_CRATES[id].biome === b) return id; return null; };
ModLib.onEnemyKilled((g, e) => { if (!QoL.cfg.biomeCrates || !ModList.on('enemy_biome_crates') || e.isBoss || e.isPart || e.isSegment || e.minion) return; if (Math.random() < 1 / 200) { const id = crateFor(g, e.tileX, e.tileY); if (id) { g.dropItem(e.cx, e.cy, id, 1, null, null); g.addDamageText(e.cx, e.y - 10, BIOME_CRATES[id].name + '!', '#e0c080'); } } });

// === Vanilla Fishing Expansion ===================================================================================
ModList.current = 'vanilla_fishing_expansion';
const ROD = (id, name, power, rarity, value, o = {}, recipe, st) => { defFishItem(id, name, Object.assign({ max: 1, fishingPole: true, fishingPower: power, rarity, tooltip: `${power}% fishing power${o.hooks ? `, casts ${o.hooks} hooks` : ''}${o.lava ? ', can fish in lava' : ''}${o.desc ? '. ' + o.desc : ''}`, value, drawIcon: drawPole(o.color || '#9aa0b0') }, o)); if (recipe) RECIPES.push({ result: id, count: 1, station: st || 'anvil', ing: recipe }); };
ROD('cactus_fishing_rod', 'Cactus Fishing Rod', 12, 0, 800, { color: '#50a040' }, [['cactus', 15]], 'workbench');
ROD('boreal_fishing_rod', 'Boreal Fishing Rod', 14, 0, 800, { color: '#a09080' }, [['boreal_wood', 15]], 'workbench');
ROD('bone_fishing_rod', 'Bone Fishing Rod', 20, 1, 3000, { color: '#e8e8e0' }, [['bone', 20]], 'workbench');
ROD('glass_fishing_rod', 'Glass Fishing Rod', 22, 1, 3000, { color: '#c0e0ff' }, [['glass', 20], ['silver_bar', 2]], 'anvil');
ROD('meteor_fishing_rod', 'Meteor Fishing Rod', 28, 2, 8000, { color: '#ff8020' }, [['meteorite_bar', 10]], 'anvil');
ROD('beekeeper_fishing_rod', 'Beekeeper Fishing Rod', 30, 2, 10000, { color: '#e0c040', desc: 'Dropped by the Queen Bee' });
if (BOSS_DEFS.queen_bee) BOSS_DEFS.queen_bee.drops.push({ id: 'beekeeper_fishing_rod', chance: 0.2 });
ROD('hellstone_fishing_rod', 'Hellstone Fishing Rod', 35, 3, 20000, { color: '#ff4020', lava: true }, [['hellstone_bar', 12]], 'anvil');
ROD('starfury_fishing_rod', 'Starfury Fishing Rod', 40, 3, 30000, { color: '#ffe080', desc: 'Found in Sky Crates' });
BIOME_CRATES.sky_crate.loot.push(['starfury_fishing_rod', 1, 1, 0.15]);
ROD('enchanted_fishing_rod', 'Enchanted Fishing Rod', 45, 3, 40000, { color: '#c0e0ff', desc: 'Found in Golden Crates' });
CRATES.golden_crate.loot.push(['enchanted_fishing_rod', 1, 1, 0.1]);
ROD('mineral_fishing_rod', 'Mineral Fishing Rod', 25, 2, 12000, { color: '#c0a040', mineral: true, desc: 'Fishing-Mining: half of your catches are ores from the depths' }, [['iron_bar', 10], ['gold_bar', 5], ['worm', 3]], 'anvil');
ROD('magnetic_fishing_rod', 'Magnetic Fishing Rod', 30, 3, 25000, { color: '#8080ff', magnetic: true, desc: 'Fishing-Mining: pulls bars and metal from the water' }, [['mineral_fishing_rod', 1], ['fallen_star', 10], ['iron_bar', 20]], 'anvil');
ROD('botanical_fishing_rod', 'Botanical Fishing Rod', 30, 2, 15000, { color: '#60c040', botanical: true, desc: 'Fishing-Botanical: catches herbs, seeds and mushrooms' }, [['wood', 30], ['vine', 3], ['jungle_spores', 5]], 'workbench');
ROD('hallowed_fishing_rod', 'Hallowed Fishing Rod', 55, 5, 60000, { color: '#ffe080' }, [['hallowed_bar', 12]], 'mythril_anvil');
ROD('chlorophyte_fishing_rod', 'Chlorophyte Fishing Rod', 60, 6, 80000, { color: '#60ff60', hooks: 2 }, [['chlorophyte_bar', 12]], 'mythril_anvil');
ROD('spectre_fishing_rod', 'Spectre Fishing Rod', 65, 7, 100000, { color: '#a0ffff', hooks: 2 }, [['ectoplasm', 15], ['chlorophyte_bar', 5]], 'mythril_anvil');
ROD('frozen_fishing_rod', 'Frozen Fishing Rod', 58, 5, 60000, { color: '#a0e0ff', hooks: 2 }, [['frost_core', 2], ['ice', 50], ['hallowed_bar', 5]], 'mythril_anvil');
ROD('shroomite_fishing_rod', 'Shroomite Fishing Rod', 70, 7, 120000, { color: '#40c0ff', hooks: 3 }, [['chlorophyte_bar', 15], ['glow_mushroom', 30]], 'mythril_anvil');
ROD('luminite_fishing_rod', 'Luminite Fishing Rod', 90, 9, 250000, { color: '#40e0c0', hooks: 4, lava: true }, [['luminite_bar', 10]], 'ancient_manipulator');
ROD('zenith_fishing_rod', 'Zenith Fishing Rod', 285, 10, 1000000, { color: '#ff80ff', hooks: 12, lava: true, desc: 'A totally unnecessary zenith: every rod in the game, fused' }, [['golden_fishing_pole', 1], ['luminite_fishing_rod', 1], ['shroomite_fishing_rod', 1], ['spectre_fishing_rod', 1], ['chlorophyte_fishing_rod', 1], ['hallowed_fishing_rod', 1], ['enchanted_fishing_rod', 1], ['starfury_fishing_rod', 1], ['hellstone_fishing_rod', 1], ['meteor_fishing_rod', 1], ['bone_fishing_rod', 1], ['wooden_fishing_pole', 1]], 'ancient_manipulator');
for (const [id, name, power, rarity, value, col, recipe, st] of [['grub_bait', 'Grub', 20, 0, 150, '#e0e0a0', [['mushroom', 2]], 'workbench'], ['cricket_bait', 'Cricket', 22, 0, 200, '#80a040', [['acorn', 1], ['gel', 1]], 'workbench'], ['glowing_snail', 'Glowing Snail', 30, 1, 400, '#80ff80', [['glow_mushroom', 3]], 'workbench'], ['deathweed_bait', 'Deathweed Bait', 35, 1, 500, '#8040c0', [['worm', 1], ['rotten_chunk', 1]], 'workbench'], ['scorpion_bait', 'Scorpion Bait', 35, 1, 500, '#c8a860', [['worm', 1], ['antlion_mandible', 1]], 'workbench'], ['ladybug_bait', 'Lucky Ladybug', 40, 2, 800, '#e04040', [['worm', 2], ['gold_bar', 1]], 'anvil'], ['gold_worm', 'Gold Worm', 50, 3, 3000, '#ffe040', [['worm', 5], ['gold_bar', 2]], 'anvil'], ['solar_bait', 'Solar Bait', 60, 8, 8000, '#ff8020', [['solar_fragment', 1], ['worm', 5]], 'ancient_manipulator'], ['vortex_bait', 'Vortex Bait', 60, 8, 8000, '#40c0a0', [['vortex_fragment', 1], ['worm', 5]], 'ancient_manipulator'], ['nebula_bait', 'Nebula Bait', 60, 8, 8000, '#e040ff', [['nebula_fragment', 1], ['worm', 5]], 'ancient_manipulator'], ['stardust_bait', 'Stardust Bait', 60, 8, 8000, '#80c0ff', [['stardust_fragment', 1], ['worm', 5]], 'ancient_manipulator'], ['truffle_bait', 'Truffle Bait', 45, 3, 2000, '#4080ff', [['glow_mushroom', 10], ['worm', 2]], 'workbench']]) { defFishItem(id, name, { bait: power, rarity, tooltip: `${power}% bait power`, value, drawIcon: drawWorm(col) }); RECIPES.push({ result: id, count: 5, station: st, ing: recipe }); }
defModPotion('super_crate_potion', 'Super Crate Potion', 'Super Crate', 'Fishing catches many more crates', '#e0c080', [['bottle', 1], ['wooden_crate', 1], ['fallen_star', 1]], { time: 480, mod: () => {} });
defModPotion('sonar_potion', 'Sonar Potion', 'Sonar', 'Shows what is biting before you reel', '#40c0ff', [['bottle', 1], ['neon_tetra', 1], ['glow_mushroom', 1]], { time: 480, mod: () => {} });
ACC('angler_tackle_bag', "Angler's Tackle Bag", { rarity: 4, value: 50000, tooltip: '+10% fishing power, 50% chance to save bait, fishing lines never break', fishPower: 10, tackleBox: true, recipe: [['tackle_box', 1], ['silk', 10], ['gold_bar', 5]], station: 'tinkerers_workshop' }, genericIcon('#8a6038', '#e0c080', 'box'));
ACC('lucky_lure', 'Lucky Lure', { rarity: 3, value: 30000, tooltip: '+5% fishing power, more crates', fishPower: 5, luckyLure: true, recipe: [['gold_bar', 5], ['ladybug_bait', 5]], station: 'anvil' }, genericIcon('#ffe040', '#fff', 'orb'));
{ const baseTackle = Fishing.hasTackleBox; Fishing.hasTackleBox = function (p) { return baseTackle.call(this, p) || ModLib.accs(p).some(a => a.tackleBox); }; }
{ const baseEff = Fishing.effectivePower; Fishing.effectivePower = function (g, b) { let pw = baseEff.call(this, g, b); pw += ModLib.accs(g.player).reduce((a, it) => a + (it.fishPower || 0), 0); return pw; }; }
{ const baseUse = Fishing.use; Fishing.use = function (g, slot, it) { const p = g.player; const mine = this.bobbers(g).filter(b => b.owner === p); if (mine.length) { this.reel(g, mine); return; } const hooks = Math.min(it.hooks || 1, 12); const n0 = g.projectiles.length; for (let k = 0; k < hooks; k++) { if (!this.cast(g, slot, it, g.mouse.wx, g.mouse.wy, hooks > 1 ? (k - (hooks - 1) / 2) * 1.2 : 0)) break; } for (let i = n0; i < g.projectiles.length; i++) if (g.projectiles[i] instanceof Bobber) { g.projectiles[i].lavaOk = !!it.lava; g.projectiles[i].rod = it; } }; }
const ORE_CATCH = () => ['copper_ore', 'iron_ore', 'silver_ore', 'gold_ore', 'tin_ore', 'lead_ore', 'tungsten_ore', 'platinum_ore', 'demonite_ore', 'crimtane_ore'].filter(i => ITEMS[i]);
const HM_ORE_CATCH = () => ['cobalt_ore', 'palladium_ore', 'mythril_ore', 'orichalcum_ore', 'adamantite_ore', 'titanium_ore'].filter(i => ITEMS[i]);
for (const [id, name, col] of [['flarefin_koi', 'Flarefin Koi', ['#ff8020', '#ffc060']], ['obsidifish', 'Obsidifish', ['#2a1e3a', '#6a4a8a']], ['lava_crate_fish', 'Fireproof Crate', null]]) { if (id === 'lava_crate_fish') continue; defFishItem(id, name, { fish: true, value: 3000, rarity: 3, tooltip: 'Fished from lava', drawIcon: drawFish(col[0], col[1]) }); if (typeof FISH !== 'undefined') FISH[id] = { name, value: 3000, biome: -1, col, rare: true }; }
CRATES.lava_crate = { name: 'Obsidian Lava Crate', value: 12000, rarity: 3, loot: [['hellstone', 15, 30, 0.8], ['obsidian', 15, 30, 0.8], ['flarefin_koi', 1, 2, 0.3], ['obsidian_skull', 1, 1, 0.15], ['hellstone_fishing_rod', 1, 1, 0.1], ['lava_charm', 0, 0, 0]].filter(l => l[1]), coins: [15000, 50000] };
defFishItem('lava_crate', 'Obsidian Lava Crate', { crate: true, value: 12000, rarity: 3, tooltip: 'Right-click / use to open. Fished from lava', drawIcon: drawCrate('#2a1e3a', '#ff8020') }); ITEMS.lava_crate.onUse = (game, slot) => Fishing.openCrate(game, slot);
{ const baseRoll = Fishing.rollCatch; Fishing.rollCatch = function (g, b) {
  const p = g.player, rod = b.rod || {};
  if (b.lava && b.lavaOk) { const r = Math.random(); return r < 0.15 ? 'lava_crate' : r < 0.5 ? 'flarefin_koi' : r < 0.8 ? 'obsidifish' : 'hellstone'; }
  let id = baseRoll.call(this, g, b);
  const crateBonus = (p.hasBuff('Super Crate') ? 0.25 : 0) + (ModLib.accs(p).some(a => a.luckyLure) ? 0.08 : 0);
  if (!ITEMS[id].crate && crateBonus && Math.random() < crateBonus) id = Math.random() < 0.3 ? 'golden_crate' : Math.random() < 0.5 ? 'iron_crate' : 'wooden_crate';
  if (ITEMS[id].crate && ModList.on('enemy_biome_crates') && Math.random() < 0.5) { const c = crateFor(g, b.tileX, b.tileY); if (c) id = c; }
  if (rod.mineral && Math.random() < 0.5) id = choose(g.world.hardmode && Math.random() < 0.4 ? HM_ORE_CATCH() : ORE_CATCH());
  if (rod.magnetic && Math.random() < 0.5) id = choose(['iron_bar', 'silver_bar', 'gold_bar', 'tin_can', 'copper_bar']);
  if (rod.botanical && Math.random() < 0.5) id = choose(['mushroom', 'glow_mushroom', 'acorn', 'vine', 'jungle_spores', 'cactus'].filter(i => ITEMS[i]));
  if (p.hasBuff('Sonar') && g.world.time % 3 === 0) g.addDamageText(b.cx, b.y - 20, ITEMS[id].name, '#40c0ff');
  return id;
}; }
ModList.current = null;
