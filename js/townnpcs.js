'use strict';
// ---------------------------------------------------------------------------
// Town NPC completion (wiki: NPCs). Adds the Dye Trader and Skeleton Merchant,
// the eight Town Slimes, bound NPCs to rescue (Mechanic, Wizard, webbed
// Stylist, Golfer and the Tortured Soul), NPC happiness with price modifiers
// and the biome pylon network.
// ---------------------------------------------------------------------------

ModList.current = null; // vanilla content: never tagged to a mod

const TownNPCs = {
  ui: null,            // open pylon panel: { x, y, id } of the pylon clicked
  lastMerchantTry: 0,
};

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------
CAT('strange_plant', { name: 'Strange Plant', max: 99, material: true, rarity: 1, tooltip: 'The Dye Trader trades rare dyes for these', drawIcon: (x) => { x.fillStyle = '#3a8a30'; x.fillRect(7, 8, 2, 7); x.fillStyle = '#c040e0'; x.beginPath(); x.arc(8, 6, 4, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ffe060'; x.fillRect(7, 5, 2, 2); x.fillStyle = '#40c0ff'; x.fillRect(3, 9, 3, 2); x.fillRect(10, 9, 3, 2); } }, 1500);
CAT('purification_powder', { name: 'Purification Powder', max: 99, consumable: true, rarity: 0, tooltip: 'Cleanses the Corruption and Crimson around the cursor. Frees a Tortured Soul from his curse', drawIcon: (x) => { x.fillStyle = '#40e080'; x.beginPath(); x.arc(8, 9, 5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#c0ffd0'; x.fillRect(5, 6, 2, 2); x.fillRect(9, 8, 2, 2); x.fillRect(6, 11, 2, 1); }, onUse: (g, slot) => TownNPCs.purify(g, slot) }, 75);
CAT('strange_brew', { name: 'Strange Brew', max: 30, consumable: true, rarity: 1, heal: 80, tooltip: 'Restores 80 life. Smells terrible', drawIcon: genericIcon('#80a040', '#fff', 'potion') }, 2000);
defModWeapon('slap_hand', 'Slap Hand', 'sword', 35, 30, 15, 4, 100000, { mat: 'gold', desc: 'Enormous knockback' });
defModWeapon('gradient', 'Gradient', 'yoyo', 29, 25, 4, 4, 100000, { range: 16, color: '#e0a040' });
defModWeapon('format_c', 'Format:C', 'yoyo', 31, 25, 4, 4, 100000, { range: 16, color: '#4060c0' });
CAT('bone_torch', { name: 'Bone Torch', max: 99, placeable: true, tile: T.TORCH, tooltip: 'A torch made of bone. Burns like any other', drawIcon: (x) => { x.fillStyle = '#e8e8d8'; x.fillRect(7, 6, 2, 9); x.fillStyle = '#ffe080'; x.fillRect(6, 3, 4, 4); x.fillStyle = '#ff8040'; x.fillRect(7, 2, 2, 2); } }, 25);
for (const [id, name, hue, sat, light] of [['acid_dye', 'Acid Dye', 100, 1.7, 1.25], ['living_flame_dye', 'Living Flame Dye', 20, 1.8, 1.3], ['shadowflame_dye', 'Shadowflame Dye', 270, 1.5, 0.8], ['grim_dye', 'Grim Dye', 0, 0.25, 0.5], ['phase_dye', 'Phase Dye', 180, 1.4, 1.3], ['mushroom_dye', 'Mushroom Dye', 215, 1.6, 1.4], ['chlorophyte_dye', 'Chlorophyte Dye', 110, 1.5, 1.1], ['wisp_dye', 'Wisp Dye', 190, 0.6, 1.6], ['midnight_rainbow_dye', 'Midnight Rainbow Dye', 250, 1.7, 0.7], ['martian_dye', 'Martian Dye', 160, 1.5, 1.3], ['twilight_dye', 'Twilight Dye', 300, 1.4, 0.9], ['hades_dye', 'Hades Dye', 15, 1.6, 0.85]]) {
  defDye(id, name, hue, sat, light); ITEMS[id].rarity = 3; ITEMS[id].tooltip = 'Rare dye from the Dye Trader: place it in a Dye slot to recolour the matching armor/vanity piece'; ITEM_VALUES[id] = 20000; ITEMS[id].value = 20000;
}
const RARE_DYES = ['acid_dye', 'living_flame_dye', 'shadowflame_dye', 'grim_dye', 'phase_dye', 'mushroom_dye', 'chlorophyte_dye', 'wisp_dye', 'midnight_rainbow_dye', 'martian_dye', 'twilight_dye', 'hades_dye'];
CAT('brown_dye', { name: 'Brown Dye', max: 99, dye: { hue: 25, sat: 0.6, light: 0.55 }, rarity: 1, tooltip: 'Dye: place it in a Dye slot to recolour the matching armor/vanity piece', drawIcon: (x) => { x.fillStyle = '#7a4a20'; x.fillRect(4, 5, 8, 9); x.fillStyle = '#c0c0c8'; x.fillRect(5, 2, 6, 3); } }, 5000);
SHOPS.Dryad.push({ id: 'purification_powder', price: 75 });

// Strange plants grow among the flowers: breaking a plant sometimes yields one
ModLib.on('tileBroken', (g, tx, ty, id) => { if (id === T.PLANT && g.world.getData(tx, ty) !== 6 && Math.random() < 0.015) g.dropItem(tx * TILE + 8, ty * TILE + 4, 'strange_plant', 1); });

// ---------------------------------------------------------------------------
// Pylons: eight 2x3 furniture tiles, one per biome
// ---------------------------------------------------------------------------
const PYLONS = [['forest', 'Forest', '#60c040', '#a0ff80'], ['snow', 'Snow', '#80d0ff', '#e0f8ff'], ['desert', 'Desert', '#e0c060', '#fff0a0'], ['jungle', 'Jungle', '#30a050', '#80ff80'], ['ocean', 'Ocean', '#4080e0', '#a0e0ff'], ['hallow', 'Hallow', '#e080ff', '#ffe0ff'], ['cavern', 'Cavern', '#a0a0b0', '#e0e0f0'], ['mushroom', 'Mushroom', '#4090ff', '#c0e0ff']];
const PYLON_TILE = {}, PYLON_KIND = {};
for (const [kind, name, col, hi] of PYLONS) {
  const key = 'PYLON_' + kind.toUpperCase();
  defBTile(key, { name: name + ' Pylon', hp: 1, solid: false, drop: 'pylon_' + kind, color: col, mapColor: col, furniture: { w: 2, h: 3 }, transparent: true, light: [0.5, 0.5, 0.6] });
  PYLON_TILE[kind] = T[key]; PYLON_KIND[T[key]] = kind;
  CAT('pylon_' + kind, { name: name + ' Pylon', max: 1, placeable: true, tile: T[key], rarity: 3, tooltip: `Teleports you to other pylons. Can only be placed in the ${name === 'Cavern' ? 'Underground' : name} and needs 2 town NPCs nearby to work` }, 100000);
  // sprite: a stone pedestal with a glowing crystal
  const c = makeCanvas(32, 48), x = c.getContext('2d');
  x.fillStyle = '#55555f'; x.fillRect(2, 38, 28, 10); x.fillStyle = '#77777f'; x.fillRect(2, 38, 28, 2); x.fillRect(10, 30, 12, 8); x.fillStyle = '#3a3a44'; x.fillRect(4, 44, 24, 3);
  x.fillStyle = col; x.beginPath(); x.moveTo(16, 4); x.lineTo(26, 18); x.lineTo(16, 32); x.lineTo(6, 18); x.closePath(); x.fill();
  x.fillStyle = hi; x.beginPath(); x.moveTo(16, 8); x.lineTo(20, 17); x.lineTo(16, 26); x.lineTo(12, 17); x.closePath(); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(14, 10, 2, 8);
  Sprites.furniture[T[key]] = c;
}
const PYLON_IDS = new Set(Object.keys(PYLON_KIND).map(Number));

// ---------------------------------------------------------------------------
// Biome of a tile position (for happiness and pylon placement)
// ---------------------------------------------------------------------------
function biomeAtTile(w, x, y) {
  const layer = y > w.h - 70 ? 'underworld' : y > w.cavernLine ? 'cavern' : y > w.surfaceLine ? 'underground' : 'surface';
  const counts = {};
  for (let yy = y - 20; yy <= y + 20; yy += 2) for (let xx = x - 35; xx <= x + 35; xx += 2) { if (!w.inBounds(xx, yy)) continue; const t = w.tiles[xx + yy * w.w]; counts[t] = (counts[t] || 0) + 1; }
  const c = (t) => (t == null ? 0 : counts[t] || 0);
  if (c(T.DUNGEON_BRICK) > 40) return { biome: 'dungeon', layer };
  if (c(T.PEARLSTONE) + c(T.HALLOW_GRASS) + c(T.PEARLSAND) + c(T.HALLOW_ICE) > 60) return { biome: 'hallow', layer };
  if (c(T.EBONSTONE) + c(T.CORRUPT_GRASS) + c(T.EBONSAND) + c(T.CORRUPT_ICE) > 60) return { biome: 'corruption', layer };
  if (c(T.CRIMSTONE) + c(T.CRIMSON_GRASS) + c(T.CRIMSAND) + c(T.CRIMSON_ICE) > 60) return { biome: 'crimson', layer };
  if (c(T.MUSHROOM_GRASS) + c(T.MUSHROOM_STALK) > 20) return { biome: 'mushroom', layer };
  if (c(T.SNOW) + c(T.ICE) > 60) return { biome: 'snow', layer };
  if (c(T.SAND) + c(T.SANDSTONE) + c(T.HARDENED_SAND) > 90 && layer !== 'surface') return { biome: 'desert', layer };
  if (c(T.JUNGLE_GRASS) + c(T.MUD) > 60 && layer !== 'surface') return { biome: 'jungle', layer };
  const b = w.biome ? w.biome[clamp(x, 0, w.w - 1)] : BIOME.FOREST;
  const base = b === BIOME.DESERT ? 'desert' : b === BIOME.SNOW ? 'snow' : b === BIOME.JUNGLE ? 'jungle' : b === BIOME.OCEAN ? 'ocean' : b === BIOME.HALLOW ? 'hallow' : b === BIOME.CORRUPTION ? 'corruption' : b === BIOME.CRIMSON ? 'crimson' : b === BIOME.MUSHROOM ? 'mushroom' : 'forest';
  if (layer === 'underworld') return { biome: 'underworld', layer };
  if (layer !== 'surface' && (base === 'forest' || base === 'ocean')) return { biome: 'cavern', layer };
  return { biome: base, layer };
}
const BIOME_LABEL = { forest: 'the Forest', snow: 'the Snow', desert: 'the Desert', jungle: 'the Jungle', ocean: 'the Ocean', hallow: 'the Hallow', cavern: 'the Underground', mushroom: 'the Glowing Mushroom biome', corruption: 'the Corruption', crimson: 'the Crimson', dungeon: 'the Dungeon', underworld: 'the Underworld' };

// ---------------------------------------------------------------------------
// Happiness (1.4.4 table): biome and neighbour preferences -> price multiplier
// ---------------------------------------------------------------------------
const HAPPY = {
  'Guide': { like: 'forest', dislike: 'ocean', loves: ['Princess'], likes: ['Clothier', 'Zoologist'], dislikes: ['Steampunker'], hates: ['Painter'] },
  'Merchant': { like: 'forest', dislike: 'desert', loves: ['Princess'], likes: ['Golfer', 'Nurse'], dislikes: ['Tax Collector'], hates: ['Angler'] },
  'Zoologist': { like: 'forest', dislike: 'desert', loves: ['Witch Doctor', 'Princess'], likes: ['Golfer'], dislikes: ['Angler'], hates: ['Arms Dealer'] },
  'Golfer': { like: 'forest', dislike: 'cavern', loves: ['Angler', 'Princess'], likes: ['Painter', 'Zoologist'], dislikes: ['Pirate'], hates: ['Merchant'] },
  'Nurse': { like: 'hallow', dislike: 'snow', loves: ['Arms Dealer', 'Princess'], likes: ['Wizard'], dislikes: ['Dryad', 'Party Girl'], hates: ['Zoologist'] },
  'Tavernkeep': { like: 'hallow', dislike: 'snow', loves: ['Demolitionist', 'Princess'], likes: ['Goblin Tinkerer'], dislikes: ['Guide'], hates: ['Dye Trader'] },
  'Party Girl': { like: 'hallow', dislike: 'cavern', loves: ['Wizard', 'Zoologist', 'Princess'], likes: ['Stylist'], dislikes: ['Merchant'], hates: ['Tax Collector'] },
  'Wizard': { like: 'hallow', dislike: 'ocean', loves: ['Golfer', 'Princess'], likes: ['Merchant'], dislikes: ['Witch Doctor'], hates: ['Cyborg'] },
  'Demolitionist': { like: 'cavern', dislike: 'ocean', loves: ['Tavernkeep', 'Princess'], likes: ['Mechanic'], dislikes: ['Arms Dealer', 'Goblin Tinkerer'], hates: [] },
  'Goblin Tinkerer': { like: 'cavern', dislike: 'jungle', loves: ['Mechanic', 'Princess'], likes: ['Dye Trader'], dislikes: ['Clothier'], hates: ['Stylist'] },
  'Clothier': { like: 'cavern', dislike: 'hallow', loves: ['Truffle', 'Princess'], likes: ['Tax Collector'], dislikes: ['Nurse'], hates: ['Mechanic'] },
  'Dye Trader': { like: 'desert', dislike: 'forest', loves: ['Princess'], likes: ['Arms Dealer', 'Painter'], dislikes: ['Steampunker'], hates: ['Pirate'] },
  'Arms Dealer': { like: 'desert', dislike: 'snow', loves: ['Nurse', 'Princess'], likes: ['Steampunker'], dislikes: ['Golfer'], hates: ['Demolitionist'] },
  'Steampunker': { like: 'desert', dislike: 'jungle', loves: ['Cyborg', 'Princess'], likes: ['Painter'], dislikes: ['Dryad', 'Wizard', 'Party Girl'], hates: [] },
  'Dryad': { like: 'jungle', dislike: 'desert', loves: ['Princess'], likes: ['Golfer', 'Truffle'], dislikes: ['Angler'], hates: ['Zoologist'] },
  'Painter': { like: 'jungle', dislike: 'forest', loves: ['Dryad', 'Princess'], likes: ['Party Girl'], dislikes: ['Truffle', 'Cyborg'], hates: [] },
  'Witch Doctor': { like: 'jungle', dislike: 'hallow', loves: ['Princess'], likes: ['Dryad', 'Guide'], dislikes: ['Nurse'], hates: ['Truffle'] },
  'Stylist': { like: 'ocean', dislike: 'snow', loves: ['Dye Trader', 'Princess'], likes: ['Pirate'], dislikes: ['Tavernkeep'], hates: ['Goblin Tinkerer'] },
  'Angler': { like: 'ocean', dislike: 'desert', loves: ['Princess'], likes: ['Demolitionist', 'Party Girl', 'Tax Collector'], dislikes: [], hates: ['Tavernkeep'] },
  'Pirate': { like: 'ocean', dislike: 'cavern', loves: ['Angler', 'Princess'], likes: ['Tavernkeep'], dislikes: ['Stylist'], hates: ['Guide'] },
  'Mechanic': { like: 'snow', dislike: 'cavern', loves: ['Goblin Tinkerer', 'Princess'], likes: ['Cyborg'], dislikes: ['Arms Dealer'], hates: ['Clothier'] },
  'Tax Collector': { like: 'snow', dislike: 'hallow', loves: ['Merchant', 'Princess'], likes: ['Party Girl'], dislikes: ['Demolitionist', 'Mechanic'], hates: ['Santa Claus'] },
  'Cyborg': { like: 'snow', dislike: 'jungle', loves: ['Steampunker', 'Princess'], likes: ['Pirate', 'Stylist'], dislikes: ['Zoologist'], hates: ['Wizard'] },
  'Santa Claus': { love: 'snow', hate: 'desert', loves: ['Princess'], likes: [], dislikes: [], hates: ['Tax Collector'] },
  'Truffle': { like: 'mushroom', loves: ['Guide', 'Princess'], likes: ['Dryad'], dislikes: ['Clothier'], hates: ['Witch Doctor'] },
  'Princess': { loves: ['*'], likes: [], dislikes: [], hates: [] },
  'Pet Tamer': { like: 'forest', dislike: 'cavern', loves: ['Zoologist'], likes: ['Dryad', 'Princess'], dislikes: ['Arms Dealer'], hates: [] },
  'Gardener': { like: 'jungle', dislike: 'snow', loves: ['Dryad'], likes: ['Witch Doctor', 'Princess'], dislikes: ['Demolitionist'], hates: [] },
};
const HAPPY_LINES = { love: 'I absolutely love', like: 'I like', dislike: "I don't like", hate: 'I hate' };

Object.assign(TownNPCs, {
  npcPos(n) { return n.home ? { x: n.home.homeX, y: n.home.homeY } : { x: n.tileX, y: n.tileY }; },
  // full happiness report for a town NPC (null for NPCs without preferences)
  happiness(game, npc) {
    const H = HAPPY[npc.role]; if (!H || !npc.isTown || npc.isPet) return null;
    const w = game.world, pos = this.npcPos(npc), here = biomeAtTile(w, pos.x, pos.y);
    let m = 1; const notes = [];
    const tally = (kind, f) => { m *= f; };
    if (H.love === here.biome) { tally('love', 0.88); notes.push(`${HAPPY_LINES.love} living in ${BIOME_LABEL[here.biome]}.`); }
    else if (H.like === here.biome) { tally('like', 0.94); notes.push(`${HAPPY_LINES.like} living in ${BIOME_LABEL[here.biome]}.`); }
    else if (H.dislike === here.biome) { tally('dislike', 1.06); notes.push(`${HAPPY_LINES.dislike} living in ${BIOME_LABEL[here.biome]}.`); }
    else if (H.hate === here.biome) { tally('hate', 1.12); notes.push(`${HAPPY_LINES.hate} living in ${BIOME_LABEL[here.biome]}.`); }
    else if (here.biome === 'corruption' || here.biome === 'crimson' || here.biome === 'dungeon') { tally('hate', 1.12); notes.push(`${HAPPY_LINES.hate} living in ${BIOME_LABEL[here.biome]}.`); }
    const others = game.npcs.filter(n => n !== npc && n.isTown && !n.isPet && !n.noSave && HAPPY[n.role]);
    const near = [], far = [];
    for (const o of others) { const op = this.npcPos(o); const dx = Math.abs(op.x - pos.x), dy = Math.abs(op.y - pos.y); if (dx < 25 && dy < 25) near.push(o); if (dx < 120 && dy < 120) far.push(o); }
    for (const o of near) {
      const r = o.role;
      if (H.loves.includes('*') || H.loves.includes(r)) { tally('love', 0.88); notes.push(`${HAPPY_LINES.love} being near ${o.title}.`); }
      else if (H.likes.includes(r)) { tally('like', 0.94); notes.push(`${HAPPY_LINES.like} being near ${o.title}.`); }
      else if (H.dislikes.includes(r)) { tally('dislike', 1.06); notes.push(`${HAPPY_LINES.dislike} being near ${o.title}.`); }
      else if (H.hates.includes(r)) { tally('hate', 1.12); notes.push(`${HAPPY_LINES.hate} being near ${o.title}.`); }
    }
    if (near.length > 3) { m *= Math.pow(1.05, near.length - 3); notes.push('It is a bit crowded here.'); }
    if (far.length <= 2) { m *= 0.95; notes.push('I enjoy the peace and quiet out here.'); }
    m = clamp(Math.round(m * 20) / 20, 0.75, 1.5);
    const pylon = m <= 0.9 && PYLON_TILE[here.biome] ? here.biome : null;
    return { mult: m, biome: here.biome, notes, pylon, near: near.length };
  },
  happinessText(game, npc) {
    const h = this.happiness(game, npc); if (!h) return `${npc.name} has no opinion about the town.`;
    const mood = h.mult <= 0.8 ? 'I could not be happier!' : h.mult <= 0.9 ? 'I am really happy here.' : h.mult <= 1 ? 'Things are fine here, I suppose.' : h.mult <= 1.15 ? 'I would rather live somewhere else.' : 'I hate it here!';
    const what = h.notes.length ? ' ' + h.notes.slice(0, 4).join(' ') : ' Nothing in particular bothers me.';
    return `${mood}${what} (Prices x${h.mult.toFixed(2)}${h.pylon ? `, selling the ${PYLONS.find(p => p[0] === h.pylon)[1]} Pylon` : ''})`;
  },
});

// ---------------------------------------------------------------------------
// Dye Trader
// ---------------------------------------------------------------------------
defTownNPC('Dye Trader', ['Ahmed', 'Aziz', 'Bakr', 'Kamal', 'Nadir', 'Omar', 'Rashid', 'Samir', 'Yusuf'], { skin: '#d0a070', hair: '#202020', shirt: '#c040a0', pants: '#f0e0c0', shoes: '#3a2a1a', eye: '#3a3a3a' },
  (g) => g.npcs.filter(n => n.home && n.isTown && !n.isPet).length >= 4 && g.player.inventory.some(s => s && (ITEMS[s.id].dye || s.id === 'strange_plant')),
  ['Ah, the dyes of the far east! Very rare, very special. Have you found any strange plants for me?', 'A dye vat and a bottle is all it takes. Well, and a little colour.', 'Bring me a Strange Plant and I will trade you a dye like no other.'],
  [{ id: 'dye_vat', price: 5000 }, { id: 'silver_dye', price: 1000 }, { id: 'brown_dye', price: 1000 }, { id: 'black_dye', price: 1000 }, { id: 'bright_red_dye', price: 2500, cond: (g) => g.world.hardmode }, { id: 'rainbow_dye', price: 5000, cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.plantera) }],
  { hairStyle: 0, buttons: ['Shop', 'Strange Plants'], onButton: (g, npc, b) => { if (b !== 'Strange Plants') return; const p = g.player; const slot = p.inventory.find(s => s && s.id === 'strange_plant'); if (!slot) { g.dialog.text = 'Bring me a Strange Plant and I will show you a colour you have never seen.'; return; } slot.count--; if (slot.count <= 0) p.inventory[p.inventory.indexOf(slot)] = null; const dye = choose(RARE_DYES); const left = p.addItem(dye, 3); if (left) g.dropItem(p.cx, p.cy, dye, left); g.dialog.text = `Ah, a fine specimen! Take these three bottles of ${ITEMS[dye].name}.`; Audio_.play('craft'); g.updateCraftable(); } });

// ---------------------------------------------------------------------------
// Skeleton Merchant: a temporary trader met in the caverns, stock by moon phase
// ---------------------------------------------------------------------------
const phase = (g, ...ps) => ps.includes(g.world.moonPhase);
defTownNPC('Skeleton Merchant', ['Skeleton Merchant'], { skin: '#e8e8dc', hair: '#e8e8dc', shirt: '#4a4a5a', pants: '#3a3a44', shoes: '#2a2a30', eye: '#202020' }, () => false,
  ['Have you ever tried... with a bone? No? Well then.', 'Yoyos, brews, torches. Cheap. Mostly.', 'The dark is nothing to be afraid of. It is what is in it.', 'I have been down here a long time. What year is it?'],
  [{ id: 'torch', price: 40 }, { id: 'bone_torch', price: 60 }, { id: 'lesser_healing', price: 300 }, { id: 'bone', price: 50 }, { id: 'strange_brew', price: 1000, cond: (g) => phase(g, 0, 1, 2, 3) }, { id: 'bomb', price: 300, cond: (g) => phase(g, 4, 5, 6, 7) }, { id: 'spelunker_potion', price: 800, cond: (g) => phase(g, 2, 3, 6, 7) }, { id: 'magic_lantern', price: 2500, cond: (g) => !g.world.isDay() }, { id: 'gradient', price: 10000, cond: (g) => g.world.hardmode && phase(g, 1, 2, 5, 6) }, { id: 'format_c', price: 10000, cond: (g) => g.world.hardmode && phase(g, 0, 3, 4, 7) }, { id: 'slap_hand', price: 20000, cond: (g) => g.world.hardmode && g.world.bloodMoon }, { id: 'gravitation_potion', price: 800, cond: (g) => phase(g, 0, 4) }],
  { hairStyle: 0, town: true, noHouse: true, buttons: ['Shop'] });

Object.assign(TownNPCs, {
  // the Skeleton Merchant turns up near a player exploring the caverns, and wanders off again
  merchantTick(g) {
    const w = g.world, p = g.player; if (w.isSub) return;
    const cur = g.npcs.find(n => n.role === 'Skeleton Merchant');
    if (cur) {
      if (w.time >= cur.leaveAt && dist(cur.cx, cur.cy, p.cx, p.cy) > 70 * TILE) { g.npcs = g.npcs.filter(n => n !== cur); }
      return;
    }
    if (w.time % 600 !== 0 || p.tileY < w.surfaceLine + 15 || p.tileY > w.h - 70 || Math.random() > 0.35) return;
    for (let t = 0; t < 60; t++) {
      const x = p.tileX + (Math.random() < 0.5 ? -1 : 1) * randInt(28, 45), y = p.tileY + randInt(-14, 14);
      if (!w.inBounds(x, y + 1) || w.get(x, y) !== T.AIR || w.get(x, y - 1) !== T.AIR || w.get(x, y - 2) !== T.AIR || !w.isSolidAt(x, y + 1) || w.liquidAt(x, y) > 0) continue;
      const n = new NPC(x * TILE, (y - 2) * TILE - 2, 'Skeleton Merchant', 'Skeleton Merchant'); n.stayPut = true; n.noSave = true; n.leaveAt = w.time + 3600 * 2;
      g.npcs.push(n); return;
    }
  },
});

// ---------------------------------------------------------------------------
// Town Slimes: eight homeless townsfolk with their own looks and arrival rules
// ---------------------------------------------------------------------------
const SLIME_ROLES = {
  'Nerdy Slime': { color: '#5080ff', deco: 'glasses', cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.king_slime), lines: ['*adjusts glasses* Did you know slimes are 90% gel?', '*pushes up glasses and stares at you*', '*wobbles thoughtfully*'] },
  'Cool Slime': { color: '#40c0e0', deco: 'shades', cond: (g) => !!(g.world.eventsWon && g.world.eventsWon.slime_rain), lines: ['*nods coolly*', '*bounces to a beat only it can hear*', '*is too cool to react*'] },
  'Elder Slime': { color: '#c0b080', deco: 'beard', cond: (g) => !!(g.world.rescued && g.world.rescued.elder), lines: ['*sighs like an old man*', '*wobbles slowly, with great dignity*', '*seems grateful to be out of that cage*'] },
  'Clumsy Slime': { color: '#e07070', deco: 'bandage', cond: (g) => !!(g.world.rescued && g.world.rescued.clumsy), lines: ['*trips over nothing*', '*bounces into a wall and looks embarrassed*', '*is glad to be off that island*'] },
  'Diva Slime': { color: '#ff70d0', deco: 'crown', cond: (g) => !!(g.world.bossesDefeated && g.world.bossesDefeated.queen_slime), lines: ['*poses dramatically*', '*expects to be admired*', '*sparkles*'] },
  'Surly Slime': { color: '#508060', deco: 'frown', cond: (g) => !!g.world.surlyCaught, lines: ['*grumbles*', '*glares at you*', '*does not want to talk about the fishing hook*'] },
  'Mystic Slime': { color: '#c0a0ff', deco: 'hood', cond: (g) => !!g.world.mysticSlime, lines: ['*shimmers faintly*', '*hums an otherworldly tune*', '*seems to see something far away*'] },
  'Squire Slime': { color: '#e0c060', deco: 'helmet', cond: (g) => !!(g.world.eventsWon && g.world.eventsWon.old_ones_army), lines: ['*salutes*', '*stands at attention*', '*bounces bravely*'] },
};
for (const role in SLIME_ROLES) {
  const d = SLIME_ROLES[role];
  defTownNPC(role, [role], { skin: d.color, hair: d.color, shirt: d.color, pants: d.color, shoes: d.color, eye: '#000' }, d.cond, d.lines, null,
    { slime: d.color, deco: d.deco, noHouse: true, weapon: null, buttons: [], onArrive: (g, npc) => { npc.w = 30; npc.h = 24; npc.y += 18; } });
}

// slime look for the NPC entity
{
  const prev = NPC.prototype.draw;
  NPC.prototype.draw = function (ctx, camX, camY) {
    if (!this.def || !this.def.slime) return prev.call(this, ctx, camX, camY);
    const squash = clamp(Math.abs(this.vx) * 0.04, 0, 0.12) - (this.onGround ? 0 : 0.08);
    drawTownSlime(ctx, this.cx - camX, this.y + this.h - camY, this.def, this.dir, squash, this.hitFlash > 0);
  };
}
function drawTownSlime(ctx, cx, bottom, def, dir, squash, flash) {
  const sx = 1 + squash, sy = 1 - squash;
  const w = Math.round(30 * sx), h = Math.round(24 * sy);
  const x = snap(cx - w / 2), y = snap(bottom - h);
  ctx.globalAlpha = flash ? 0.6 : 0.88;
  ctx.fillStyle = def.slime; roundRect(ctx, x, y, w, h, Math.min(8, h / 2)); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; roundRect(ctx, snap(x + w * 0.15), snap(y + h * 0.15), Math.round(w * 0.3), Math.round(h * 0.25), 3); ctx.fill();
  ctx.globalAlpha = 1;
  const ex = dir > 0 ? x + w * 0.62 : x + w * 0.22;
  ctx.fillStyle = '#000'; ctx.fillRect(snap(ex), snap(y + h * 0.35), 3, 4); ctx.fillRect(snap(ex + dir * 6), snap(y + h * 0.35), 3, 4);
  ctx.fillStyle = '#fff'; ctx.fillRect(snap(ex + (dir > 0 ? 1 : 0)), snap(y + h * 0.35), 1, 1); ctx.fillRect(snap(ex + dir * 6 + (dir > 0 ? 1 : 0)), snap(y + h * 0.35), 1, 1);
  const ey = snap(y + h * 0.35), e0 = snap(Math.min(ex, ex + dir * 6)), e1 = e0 + 9;
  switch (def.deco) {
    case 'glasses': ctx.strokeStyle = '#202020'; ctx.lineWidth = 1; ctx.strokeRect(e0 - 1.5, ey - 1.5, 5, 6); ctx.strokeRect(e0 + 4.5, ey - 1.5, 5, 6); ctx.beginPath(); ctx.moveTo(e0 + 3.5, ey + 1); ctx.lineTo(e0 + 4.5, ey + 1); ctx.stroke(); break;
    case 'shades': ctx.fillStyle = '#101018'; ctx.fillRect(e0 - 2, ey - 1, 12, 5); ctx.fillStyle = '#4060a0'; ctx.fillRect(e0 - 1, ey, 4, 2); ctx.fillRect(e0 + 5, ey, 4, 2); break;
    case 'beard': ctx.fillStyle = '#f0f0f0'; ctx.fillRect(e0 - 2, ey + 6, 13, 3); ctx.fillRect(e0, ey + 9, 9, 3); ctx.fillRect(e0 + 2, ey + 12, 5, 2); ctx.fillStyle = '#8a6a3a'; ctx.fillRect(x + (dir > 0 ? w - 4 : 1), y + 4, 3, h - 4); break;
    case 'bandage': ctx.fillStyle = '#f0f0e0'; ctx.fillRect(x + 4, y + 3, 8, 3); ctx.fillStyle = '#e0a0a0'; ctx.fillRect(x + 6, y + 4, 4, 1); ctx.fillStyle = '#f0f0e0'; ctx.fillRect(x + w - 10, y + h - 7, 6, 3); break;
    case 'crown': ctx.fillStyle = '#ffd040'; ctx.fillRect(x + w / 2 - 6, y - 5, 12, 5); ctx.fillRect(x + w / 2 - 6, y - 8, 2, 3); ctx.fillRect(x + w / 2 - 1, y - 9, 2, 4); ctx.fillRect(x + w / 2 + 4, y - 8, 2, 3); ctx.fillStyle = '#ff4080'; ctx.fillRect(x + w / 2 - 1, y - 4, 2, 2); break;
    case 'frown': ctx.fillStyle = '#000'; ctx.fillRect(e0, ey - 3, 4, 1); ctx.fillRect(e0 + 5, ey - 3, 4, 1); ctx.fillRect(e0 + 1, ey + 7, 7, 1); ctx.fillRect(e0, ey + 8, 1, 1); ctx.fillRect(e0 + 8, ey + 8, 1, 1); break;
    case 'hood': ctx.fillStyle = '#5a3a9a'; ctx.beginPath(); ctx.moveTo(x - 2, y + h * 0.55); ctx.lineTo(x + w / 2, y - 6); ctx.lineTo(x + w + 2, y + h * 0.55); ctx.lineTo(x + w - 3, y + h * 0.3); ctx.lineTo(x + 3, y + h * 0.3); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e0c0ff'; ctx.fillRect(x + w / 2 - 1, y - 2, 2, 2); break;
    case 'helmet': ctx.fillStyle = '#a0a0b0'; ctx.fillRect(x + 3, y - 3, w - 6, 7); ctx.fillStyle = '#c8c8d8'; ctx.fillRect(x + 3, y - 3, w - 6, 2); ctx.fillStyle = '#c03030'; ctx.fillRect(x + w / 2 - 1, y - 7, 2, 4); ctx.fillStyle = '#707080'; ctx.fillRect(x + (dir > 0 ? w - 5 : 2), y + 3, 3, 8); break;
  }
}

// ---------------------------------------------------------------------------
// Bound NPCs: found tied up (or caged / webbed / cursed) somewhere in the world
// ---------------------------------------------------------------------------
const BOUND = {
  mechanic: { role: 'Mechanic', label: 'Bound Mechanic', where: 'in the Dungeon', hardmode: false },
  wizard: { role: 'Wizard', label: 'Bound Wizard', where: 'deep underground', hardmode: true },
  stylist: { role: 'Stylist', label: 'Webbed Stylist', where: 'in a spider nest', hardmode: false, web: true },
  golfer: { role: 'Golfer', label: 'Bound Golfer', where: 'in the Underground Desert', hardmode: false },
  tax: { role: 'Tax Collector', label: 'Tortured Soul', where: 'in the Underworld', hardmode: true, ghost: true, needs: 'purification_powder', needsText: 'The Tortured Soul writhes. Purification Powder (the Dryad sells it) would free him.' },
  elder: { role: 'Elder Slime', label: 'Caged Elder Slime', where: 'in the Dungeon', hardmode: false, slime: true, needs: 'golden_key', needsText: 'The cage is locked. A Golden Key would open it.' },
  clumsy: { role: 'Clumsy Slime', label: 'Clumsy Slime', where: 'on a floating island', hardmode: false, slime: true },
};

class BoundNPC extends Entity {
  constructor(x, y, kind) {
    const d = BOUND[kind];
    super(x, y, d.slime ? 30 : 20, d.slime ? 24 : 42);
    this.kind = kind; this.bdef = d; this.role = d.label; this.name = d.label; this.isTown = false; this.noSave = true; this.dir = 1;
    this.def = NPC_ROLES[d.role]; this.colors = this.def.colors; this.hairStyle = this.def.hairStyle || 0; this.emote = null; this.hp = 250; this.maxHp = 250; this.hitFlash = 0; this.bob = Math.random() * 6;
  }
  get title() { return this.bdef.label; }
  hit() {}
  update(world, game) { this.updateLiquidState(world); if (!this.bdef.ghost) { this.applyGravity(); this.moveAndCollide(world); } this.vx = 0; this.dir = game.player.cx < this.cx ? -1 : 1; this.bob += 0.05; }
  draw(ctx, camX, camY) {
    const d = this.bdef, x = this.x - camX, y = this.y - camY;
    if (d.slime) {
      drawTownSlime(ctx, this.cx - camX, this.y + this.h - camY, this.def, this.dir, 0, false);
      if (this.kind === 'elder') { ctx.strokeStyle = '#8a8a9a'; ctx.lineWidth = 2; ctx.strokeRect(snap(x - 6), snap(y - 12), this.w + 12, this.h + 12); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(snap(x + 1 + k * 10), snap(y - 12)); ctx.lineTo(snap(x + 1 + k * 10), snap(y + this.h)); ctx.stroke(); } ctx.fillStyle = '#ffd040'; ctx.fillRect(snap(x + this.w + 3), snap(y + 2), 4, 6); }
      return;
    }
    if (d.ghost) {
      ctx.globalAlpha = 0.55 + Math.sin(this.bob) * 0.15;
      drawHumanoid(ctx, x, y + Math.sin(this.bob) * 3, { dir: this.dir, walk: null, colors: { skin: '#c0a0e0', hair: '#8060c0', shirt: '#6040a0', pants: '#503090', shoes: '#402080', eye: '#ffffff' }, armAngle: null, item: null, hairStyle: 0 });
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(160,80,255,0.35)'; ctx.beginPath(); ctx.arc(snap(x + 10), snap(y + 40), 14, 0, Math.PI, false); ctx.fill();
      return;
    }
    drawHumanoid(ctx, x, y, { dir: this.dir, walk: null, colors: this.colors, armAngle: null, item: null, hairStyle: this.hairStyle, sitting: true });
    if (d.web) { ctx.fillStyle = 'rgba(240,240,255,0.55)'; ctx.fillRect(snap(x - 4), snap(y - 2), this.w + 8, this.h + 4); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(snap(x - 4), snap(y + k * 10)); ctx.lineTo(snap(x + this.w + 4), snap(y + 6 + k * 8)); ctx.stroke(); } }
    else { ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(snap(x), snap(y + 16)); ctx.lineTo(snap(x + 20), snap(y + 24)); ctx.moveTo(snap(x), snap(y + 24)); ctx.lineTo(snap(x + 20), snap(y + 16)); ctx.stroke(); }
  }
}

Object.assign(TownNPCs, {
  // pick hiding spots for every bound NPC (worldgen, or lazily for older saves)
  placeBound(world, rng) {
    const free = (x, y) => world.inBounds(x, y + 1) && world.get(x, y) === T.AIR && world.get(x, y - 1) === T.AIR && world.get(x, y - 2) === T.AIR && world.isSolidAt(x, y + 1) && world.liquidAt(x, y) === 0 && world.liquidAt(x, y - 1) === 0;
    const sample = (fx, fy, test, tries = 20000) => { for (let t = 0; t < tries; t++) { const x = fx(), y = fy(); if (free(x, y) && (!test || test(x, y))) return { x: x * TILE, y: (y - 2) * TILE }; } return null; };
    const ri = (a, b) => a + Math.floor(rng() * (b - a + 1));
    const b = {};
    const dg = world.dungeon;
    if (dg) {
      b.mechanic = sample(() => ri(dg.x - dg.w / 2 + 3, dg.x + dg.w / 2 - 3), () => ri(dg.y + 10, dg.y + dg.h - 4), (x, y) => world.getWall(x, y) === W.DUNGEON);
      b.elder = sample(() => ri(dg.x - dg.w / 2 + 3, dg.x + dg.w / 2 - 3), () => ri(dg.y + 10, dg.y + dg.h - 4), (x, y) => world.getWall(x, y) === W.DUNGEON && (!b.mechanic || Math.abs(x * TILE - b.mechanic.x) > 12 * TILE));
      if (b.elder) b.elder.y += 18;
    }
    b.wizard = sample(() => ri(20, world.w - 20), () => ri(world.cavernLine, world.h - 80));
    { const cands = []; for (let i = 0, n = world.tiles.length; i < n; i++) if (world.walls[i] === W.SPIDER) { const x = i % world.w, y = (i / world.w) | 0; if (free(x, y)) cands.push([x, y]); }
      if (cands.length) { const [x, y] = cands[Math.floor(rng() * cands.length)]; b.stylist = { x: x * TILE, y: (y - 2) * TILE }; } }
    const ud = world.undergroundDesert;
    if (ud) b.golfer = sample(() => ri(Math.floor(ud.x - ud.rx), Math.floor(ud.x + ud.rx)), () => ri(Math.floor(ud.y - ud.ry), Math.floor(ud.y + ud.ry)), (x, y) => ((x - ud.x) / ud.rx) ** 2 + ((y - ud.y) / ud.ry) ** 2 < 0.9);
    b.tax = sample(() => ri(20, world.w - 20), () => ri(world.h - 66, world.h - 8));
    if (world.islands && world.islands.length) {
      for (let t = 0; t < 40 && !b.clumsy; t++) { const isl = world.islands[Math.floor(rng() * world.islands.length)]; const x = Math.floor(isl.x) + ri(-6, 6); for (let y = Math.floor(isl.y) - 12; y < Math.floor(isl.y) + 10; y++) if (free(x, y)) { b.clumsy = { x: x * TILE, y: (y - 2) * TILE + 18 }; break; } }
    }
    for (const k in b) if (!b[k]) delete b[k];
    world.bound = b;
  },
  boundTick(g) {
    const w = g.world; if (w.isSub) return;
    if (!w.bound) this.placeBound(w, Math.random);
    w.rescued = w.rescued || {};
    if (g._boundWorld !== w) { g._boundWorld = w; g.npcs = g.npcs.filter(n => !(n instanceof BoundNPC)); }
    if (w.time % 120 !== 0) return;
    for (const kind in BOUND) {
      const d = BOUND[kind];
      if (!w.rescued[kind] && g.npcs.some(n => n.role === d.role)) w.rescued[kind] = true; // already in town (older saves)
      if (w.rescued[kind] || !w.bound[kind] || (d.hardmode && !w.hardmode)) continue;
      if (g.npcs.some(n => n instanceof BoundNPC && n.kind === kind)) continue;
      g.npcs.push(new BoundNPC(w.bound[kind].x, w.bound[kind].y, kind));
    }
  },
  rescue(g, n) {
    const w = g.world, d = n.bdef, p = g.player;
    if (d.needs) {
      const slot = p.inventory.find(s => s && s.id === d.needs);
      if (!slot) { g.message(d.needsText, '#ffb060'); return; }
      g.consumeSlot(slot);
    }
    g.npcs = g.npcs.filter(x => x !== n);
    w.rescued = w.rescued || {}; w.rescued[n.kind] = true;
    const role = d.role, def = NPC_ROLES[role];
    const npc = new NPC(n.x, n.y, npcName(role), role);
    const house = !def.noHouse && w.findVacantHouse(g.npcs);
    if (house) { npc.home = { key: house.key, homeX: house.homeX, homeY: house.homeY }; npc.x = house.homeX * TILE - 2; npc.y = (house.homeY + 1) * TILE - 42; }
    else { const anchor = g.npcs.find(x => x.home && x.isTown) || { cx: w.spawnX * TILE }; const ax = clamp(Math.floor(anchor.cx / TILE) + randInt(-6, 6), 5, w.w - 6); let ay = 0; while (ay < w.h - 1 && !w.isSolidAt(ax, ay)) ay++; npc.x = ax * TILE; npc.y = (ay - 3) * TILE; }
    if (def.onArrive) def.onArrive(g, npc);
    g.npcs.push(npc);
    FX.burst(g, n.cx, n.cy, 16, d.ghost ? '#c0a0ff' : '#ffe080', 3, 30);
    g.message(d.ghost ? `The Tortured Soul is purified! ${npc.title} will move to town.` : d.slime ? `${npc.title} follows you to town!` : `You free ${npc.title}! ${house ? 'A house is waiting.' : 'A house in town would be nice.'}`, '#50ff50');
    Audio_.play('levelup');
  },
  purify(g, slot) {
    const w = g.world, h = g.hoverTile; if (!h) return;
    const map = new Map([[T.EBONSTONE, T.STONE], [T.CRIMSTONE, T.STONE], [T.CORRUPT_GRASS, T.GRASS], [T.CRIMSON_GRASS, T.GRASS], [T.EBONSAND, T.SAND], [T.CRIMSAND, T.SAND], [T.CORRUPT_ICE, T.ICE], [T.CRIMSON_ICE, T.ICE]]);
    let n = 0;
    for (let yy = -4; yy <= 4; yy++) for (let xx = -4; xx <= 4; xx++) { const x = h.x + xx, y = h.y + yy; if (!w.inBounds(x, y) || xx * xx + yy * yy > 18) continue; const t = w.get(x, y); const to = map.get(t); if (to != null) { w.setTile(x, y, to); n++; } }
    FX.burst(g, h.x * TILE + 8, h.y * TILE + 8, 12, '#40e080', 3, 30);
    g.consumeSlot(slot); Audio_.play('menu');
    if (n) g.message(`Purified ${n} blocks.`, '#80ffa0');
  },
});

// ---------------------------------------------------------------------------
// Pylon network
// ---------------------------------------------------------------------------
Object.assign(TownNPCs, {
  scanPylons(w) { const list = []; for (let i = 0, n = w.tiles.length; i < n; i++) if (PYLON_IDS.has(w.tiles[i]) && (w.tdata[i] & 15) === 0) list.push({ x: i % w.w, y: (i / w.w) | 0, id: w.tiles[i] }); w.pylons = list; },
  pylonName(p) { return PYLONS.find(q => q[0] === PYLON_KIND[p.id])[1] + ' Pylon'; },
  npcsNear(g, p) { return g.npcs.filter(n => n.isTown && !n.isPet && !n.noSave && Math.abs(n.tileX - p.x) < 120 && Math.abs(n.tileY - p.y) < 60).length; },
  pylonReady(g, p) { return this.npcsNear(g, p) >= 2; },
  openPylon(g, x, y, id) { this.ui = { x, y, id }; if (g.invOpen) g.toggleInventory(); Audio_.play('open'); },
  teleport(g, dest) {
    const w = g.world, p = g.player, from = this.ui;
    if (g.boss && !g.boss.dead) { g.message('The pylon refuses to work while a boss is around.', '#ff8080'); return; }
    if (w.event) { g.message('The pylon refuses to work during an invasion.', '#ff8080'); return; }
    if (from && !this.pylonReady(g, from)) { g.message('This pylon needs 2 town NPCs nearby to work.', '#ff8080'); return; }
    if (!this.pylonReady(g, dest)) { g.message(`The ${this.pylonName(dest)} needs 2 town NPCs nearby.`, '#ff8080'); return; }
    FX.burst(g, p.cx, p.cy, 18, '#a0e0ff', 3, 30);
    p.x = dest.x * TILE + 16 - p.w / 2; p.y = (dest.y + 3) * TILE - p.h; p.vx = 0; p.vy = 0; p.sitting = null;
    if (g.cam) { g.cam.x = p.cx - g.renderer.vw / 2; g.cam.y = p.cy - g.renderer.vh / 2; }
    FX.burst(g, p.cx, p.cy, 18, '#a0e0ff', 3, 30);
    Audio_.play('magic'); this.ui = null;
    g.message(`Teleported to the ${this.pylonName(dest)}.`, '#a0e0ff');
  },
  drawPanel(g) {
    const ctx = g.renderer.ctx, W = g.renderer.W, H = g.renderer.H, mouse = g.mouse, w = g.world;
    const list = (w.pylons || []).filter(p => !(p.x === this.ui.x && p.y === this.ui.y));
    const pw = 380, ph = 90 + Math.max(1, list.length) * 34, x0 = W / 2 - pw / 2, y0 = Math.max(60, H / 2 - ph / 2);
    ctx.fillStyle = 'rgba(15,15,40,0.94)'; roundRect(ctx, x0, y0, pw, ph, 10); ctx.fill(); ctx.strokeStyle = '#a0a0e0'; ctx.lineWidth = 2; roundRect(ctx, x0, y0, pw, ph, 10); ctx.stroke();
    drawText(ctx, `${this.pylonName(this.ui)} - choose a destination`, x0 + pw / 2, y0 + 12, { size: 17, align: 'center', color: '#ffe75a' });
    let y = y0 + 44;
    if (!list.length) drawText(ctx, 'No other pylons have been placed yet.', x0 + 20, y + 6, { size: 14, color: '#aaa' });
    for (let i = 0; i < list.length; i++) {
      const p = list[i], ok = this.pylonReady(g, p), hov = mouse.x >= x0 + 16 && mouse.x < x0 + pw - 16 && mouse.y >= y && mouse.y < y + 30;
      ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(40,50,120,0.8)'; roundRect(ctx, x0 + 16, y, pw - 32, 30, 6); ctx.fill();
      ctx.fillStyle = TILES[p.id].color; ctx.fillRect(x0 + 24, y + 7, 16, 16);
      drawText(ctx, this.pylonName(p), x0 + 48, y + 7, { size: 15, color: ok ? '#fff' : '#a0a0a0' });
      drawText(ctx, ok ? 'ready' : 'needs 2 NPCs', x0 + pw - 28, y + 9, { size: 12, align: 'right', color: ok ? '#80ff80' : '#ff9060' });
      UI.button(x0 + 16, y, pw - 32, 30, 'mod_ui', { id: 'pylon_go', data: i });
      y += 34;
    }
    const bw = 80, bx = x0 + pw / 2 - bw / 2, by = y0 + ph - 38;
    ctx.fillStyle = 'rgba(160,60,60,0.9)'; roundRect(ctx, bx, by, bw, 26, 6); ctx.fill();
    drawText(ctx, 'Close', bx + bw / 2, by + 5, { size: 14, align: 'center' });
    UI.button(bx, by, bw, 26, 'mod_ui', { id: 'pylon_close' });
  },
});
ModLib.onUiClick('pylon_go', (g, data) => { const w = g.world, list = (w.pylons || []).filter(p => !(p.x === TownNPCs.ui.x && p.y === TownNPCs.ui.y)); const dest = list[data.data]; if (dest) TownNPCs.teleport(g, dest); });
ModLib.onUiClick('pylon_close', () => { TownNPCs.ui = null; Audio_.play('close'); });
ModLib.on('drawHud', (g) => { if (TownNPCs.ui) TownNPCs.drawPanel(g); });

// right click: rescue bound NPCs, open pylons
ModLib.onRightClick((g) => {
  const p = g.player;
  for (const n of g.npcs) {
    if (!(n instanceof BoundNPC)) continue;
    if (g.mouse.wx >= n.x - 8 && g.mouse.wx <= n.x + n.w + 8 && g.mouse.wy >= n.y - 8 && g.mouse.wy <= n.y + n.h + 8 && dist(p.cx, p.cy, n.cx, n.cy) < 6 * TILE) { TownNPCs.rescue(g, n); return true; }
  }
  const h = g.hoverTile; if (!h || !h.ok) return false;
  const id = g.world.get(h.x, h.y);
  if (PYLON_IDS.has(id) && g.inReach(h.x, h.y)) { const a = g.world.furnitureAnchor(h.x, h.y); if (a) TownNPCs.openPylon(g, a.x, a.y, a.id); return true; }
  return false;
});

// ---------------------------------------------------------------------------
// Per-tick: merchant, bound NPCs, slime triggers, pylon list upkeep
// ---------------------------------------------------------------------------
ModLib.on('tick', (g) => {
  const w = g.world; if (!w || w.isSub) return;
  if (!w.pylons) TownNPCs.scanPylons(w);
  TownNPCs.merchantTick(g);
  TownNPCs.boundTick(g);
  if (TownNPCs.ui && (g.settingsOpen || g.state !== 'play')) TownNPCs.ui = null;
  for (const n of g.npcs) if (n.def && n.def.slime && n.h !== 24) { n.y += n.h - 24; n.w = 30; n.h = 24; }
  // hostile slimes that touch Shimmer turn into the Mystic Slime
  if (!w.mysticSlime && w.time % 10 === 0) {
    for (const e of g.enemies) {
      if (e.dead || !(e instanceof Slime) || e.isBoss) continue;
      const tx = e.tileX, ty = Math.floor((e.y + e.h * 0.6) / TILE);
      if (w.liquidAt(tx, ty) > 30 && w.lavaAt(tx, ty) === LIQ.SHIMMER) { e.dead = true; w.mysticSlime = true; FX.burst(g, e.cx, e.cy, 16, '#e0c0ff', 3, 35); g.message('The slime shimmers... and changes! A Mystic Slime will visit the town.', '#e0c0ff'); break; }
    }
  }
});
// the Surly Slime bites a fishing hook now and then
ModLib.on('fishCaught', (g) => { const w = g.world; if (w.surlyCaught || w.isSub || Math.random() > 0.05) return; w.surlyCaught = true; const p = g.player; const n = new NPC(p.x + p.dir * 40, p.y, 'Surly Slime', 'Surly Slime'); NPC_ROLES['Surly Slime'].onArrive(g, n); g.npcs.push(n); g.message('You reel in a very Surly Slime!', '#80c080'); Audio_.play('levelup'); });

NPC_ARRIVAL_ORDER.push('Dye Trader', 'Gardener', ...Object.keys(SLIME_ROLES));

// ---------------------------------------------------------------------------
// Engine patches
// ---------------------------------------------------------------------------
ModLib.patch(() => {
  WORLD_SAVE_KEYS.push('pylons', 'bound', 'rescued', 'surlyCaught', 'mysticSlime');
  // rescued NPCs come back the normal way after they die; until then they must be found
  for (const kind in BOUND) { const d = BOUND[kind]; const def = NPC_ROLES[d.role]; if (!def || d.slime) continue; def.condition = (g) => !!(g.world.rescued && g.world.rescued[kind]); }
  // won events are remembered (Cool Slime / Squire Slime / Pirate)
  { const base = Events.end; Events.end = function (game, msg) { const w = game.world, ev = w.event; if (ev && !msg) { const d = EVENT_DEFS[ev.id]; if (d && ev.wave >= d.waves.length) { w.eventsWon = w.eventsWon || {}; w.eventsWon[ev.id] = true; } } return base.call(this, game, msg); }; }
  // pylons are tracked as they are placed and broken
  { const pf = World.prototype.placeFurniture; World.prototype.placeFurniture = function (x, y, id) { pf.call(this, x, y, id); if (PYLON_IDS.has(id)) { this.pylons = this.pylons || []; this.pylons.push({ x, y, id }); } };
    const rf = World.prototype.removeFurniture; World.prototype.removeFurniture = function (x, y) { const a = rf.call(this, x, y); if (a && PYLON_IDS.has(a.id) && this.pylons) this.pylons = this.pylons.filter(p => !(p.x === a.x && p.y === a.y)); return a; }; }
  // pylons only go in their own biome, one of each per world
  { const pi = Game.prototype.placeItem; Game.prototype.placeItem = function (slot, it, tx, ty) {
    if (it.tile != null && PYLON_IDS.has(it.tile)) {
      const kind = PYLON_KIND[it.tile], w = this.world;
      if ((w.pylons || []).some(p => p.id === it.tile)) { if (this.useHeld === 1) this.message(`Only one ${it.name} can exist in a world.`, '#ff8080'); return false; }
      const here = biomeAtTile(w, tx, ty);
      if (here.biome !== kind) { if (this.useHeld === 1) this.message(`The ${it.name} only works in ${BIOME_LABEL[kind]}.`, '#ff8080'); return false; }
    }
    return pi.call(this, slot, it, tx, ty);
  }; }
  // shop prices follow happiness, happy NPCs sell their biome's pylon
  { const os = Game.prototype.openShop; Game.prototype.openShop = function (npc) {
    os.call(this, npc);
    const h = TownNPCs.happiness(this, npc); this.shopMult = h ? h.mult : 1;
    if (h && h.mult !== 1) this.shop = this.shop.map(e => Object.assign({}, e, { price: Math.max(1, Math.round(e.price * h.mult)) }));
    if (h && h.pylon && npc.home) this.shop = [...this.shop, { id: 'pylon_' + h.pylon, price: Math.round(100000 * h.mult) }];
  }; }
  { const od = Game.prototype.openDialog; Game.prototype.openDialog = function (npc) {
    od.call(this, npc);
    if (this.dialog && npc.isTown && !npc.isPet && !npc.isCompanion && HAPPY[npc.role] && !this.dialog.buttons.includes('Happiness')) this.dialog.buttons.push('Happiness');
  }; }
  { const db = Game.prototype.dialogButton; Game.prototype.dialogButton = function (b) {
    const d = this.dialog;
    if (b === 'Happiness' && d && d.npc && HAPPY[d.npc.role]) { Audio_.play('menu'); d.text = TownNPCs.happinessText(this, d.npc); return; }
    return db.call(this, b);
  }; }
  // dialog portrait for slimes
  // dialog portrait for slimes; NPCs named after their role ("Old Man", "Truffle", slimes) are not "X the X"
  { const dd = UI.drawDialog; UI.drawDialog = function (game) {
    const d = game.dialog;
    const slime = !!(d && d.npc && d.npc.def && d.npc.def.slime), plain = !!(d && d.npc && d.npc.name === d.npc.role);
    if (!slime && !plain) return dd.call(this, game);
    const origH = window.drawHumanoid, origT = window.drawText;
    if (slime) window.drawHumanoid = (ctx, x, y, o) => { ctx.save(); ctx.scale(0.75, 0.75); drawTownSlime(ctx, x + 16, y + 52, d.npc.def, 1, 0, false); ctx.restore(); };
    if (plain) window.drawText = (ctx, text, x, y, opt) => origT(ctx, text === `${d.npc.name} the ${d.npc.role}` ? d.npc.name : text, x, y, opt);
    try { dd.call(this, game); } finally { window.drawHumanoid = origH; window.drawText = origT; }
  }; }
  // the pylon panel is modal
  { const ov = Game.prototype.overUI; Game.prototype.overUI = function () { return !!TownNPCs.ui || ov.call(this); }; }
  { const kd = Game.prototype.onKeyDown; Game.prototype.onKeyDown = function (e) { if (e.code === 'Escape' && TownNPCs.ui && this.state === 'play' && !e.repeat) { TownNPCs.ui = null; Audio_.play('close'); e.preventDefault(); return; } return kd.call(this, e); }; }
  // shop hint: price multiplier
  ModLib.on('drawInventory', (g) => { if (g.shop && g.shopNpc && g.shopMult && g.shopMult !== 1 && g.invOpen) { const r = UI.chestSlotRect(0); drawText(g.renderer.ctx, `${g.shopNpc.title} - prices x${g.shopMult.toFixed(2)} (${g.shopMult < 1 ? 'happy' : 'unhappy'})`, r.x, r.y - 44, { size: 13, color: g.shopMult < 1 ? '#80ff80' : '#ff9060' }); } });
});
// bound NPCs get their hiding places at world creation
ModLib.onWorldgen((world, rng) => { try { TownNPCs.placeBound(world, rng); } catch (e) { console.error('bound NPC placement failed', e); } });
