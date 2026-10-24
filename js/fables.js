// ---------------------------------------------------------------------------
// Calamity Fables slice: environmental storytelling - the Wanderer quest NPC
// with a stylish dialogue UI (portrait, name plate, typewriter text, choices),
// a quest chain with rewards and lore pages, two new structures (Abandoned
// Mineshaft, Old Watchtower) and fancier world generation (boulders, fallen
// logs, wildflower meadows, ruined walls).
// ---------------------------------------------------------------------------
'use strict';

function defFbItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
for (let i = 1; i <= 5; i++) defFbItem(`fable_page_${i}`, `Fable, Page ${i}`, { max: 1, rarity: 2, value: 1000, lore: true, tooltip: ['"Before the towns, there were the Wanderers. They walked the world and wrote it down."', '"The mines below the meadow were dug by hands that never slept. They dug too deep, then simply stopped."', '"The tower watched the horizon for three hundred years. Nobody remembers what it watched for."', '"When the desert worm rose, the old kings paid it in gold. When the gold ran out, they paid in kingdoms."', '"You, reader, are the last page. Write something worth reading."'][i - 1], drawIcon: (x) => { x.fillStyle = '#f0e8d0'; x.fillRect(3, 1, 10, 14); x.fillStyle = '#806040'; x.fillRect(5, 4, 6, 1); x.fillRect(5, 7, 6, 1); x.fillRect(5, 10, 4, 1); x.fillStyle = '#c04040'; x.fillRect(10, 11, 2, 2); } });
defFbItem('wanderers_charm', "Wanderer's Charm", { max: 1, rarity: 3, value: 60000, accessory: true, defense: 2, moveSpeed: 8, tooltip: '+2 defense, +8% movement speed, and Biome Titles also show the nearest structure', drawIcon: (x) => { x.fillStyle = '#c0a060'; x.beginPath(); x.arc(8, 9, 5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#40c0ff'; x.beginPath(); x.arc(8, 9, 2, 0, Math.PI * 2); x.fill(); x.fillStyle = '#806040'; x.fillRect(7, 1, 2, 4); } });
ITEM_VALUES.wanderers_charm = 60000;

const FABLE_QUESTS = [
  { id: 'gel', title: 'Something to write with', text: 'Ink is scarce out here. Bring me 20 Gel and I will make do.', need: { item: 'gel', n: 20 }, reward: { coins: 5000, items: [['fable_page_1', 1]] } },
  { id: 'zombies', title: 'Quiet nights', text: 'The dead keep me from my writing. Slay 15 Zombies.', need: { kill: 'zombie', n: 15 }, reward: { coins: 10000, items: [['fable_page_2', 1], ['lesser_healing', 5]] } },
  { id: 'mineshaft', title: 'The hands that dug', text: 'There is an old mineshaft in this world. Stand at its entrance and I will know.', need: { visit: 'mineshaft' }, reward: { coins: 15000, items: [['fable_page_3', 1], ['iron_bar', 10]] } },
  { id: 'fish', title: 'Patience', text: 'A good story is caught, not written. Catch 5 fish.', need: { fish: 5 }, reward: { coins: 15000, items: [['fable_page_4', 1]] } },
  { id: 'boss', title: 'Worth reading', text: 'Every fable needs a monster. Defeat any boss while this quest is active.', need: { bossKill: true }, reward: { coins: 50000, items: [['fable_page_5', 1], ['wanderers_charm', 1]] } },
];
NPC_NAMES.Wanderer = ['Ilias', 'Mara', 'Tobin', 'Wren', 'Cassel'];
NPC_ROLES.Wanderer = {
  town: true, hairStyle: 1, quest: true,
  colors: { skin: '#e0c0a0', hair: '#c0c0c0', shirt: '#6a5a3a', pants: '#3a3a3a', shoes: '#2a2020', eye: '#40c0ff' },
  weapon: { kind: 'knife', damage: 16, rate: 30, speed: 9 }, buttons: ['Quests'],
  condition: (g) => g.world.time > 60 * 60 * 5 && g.npcs.some(n => n.role === 'Guide'),
  onButton: (g, npc, b) => { if (b === 'Quests') Fables.openQuestDialog(g, npc); },
  lines: ["I write down what I see. Lately I see a lot of you.", "The world keeps its stories in the ground. Dig.", "Every ruin was somebody's home once.", "Sit. Listen. Or don't - the story doesn't need you to hear it to be true."],
};

const Fables = {
  state(game) { return ModLib.player(game, 'fables', () => ({ quest: 0, progress: 0, active: false, done: [] })); },
  currentQuest(game) { const s = this.state(game); return FABLE_QUESTS[s.quest] || null; },
  progressText(game) {
    const s = this.state(game), q = this.currentQuest(game); if (!q || !s.active) return '';
    const n = q.need; const p = game.player;
    if (n.item) return `${Math.min(p.countItem(n.item), n.n)}/${n.n} ${ITEMS[n.item].name}`;
    if (n.kill) return `${s.progress}/${n.n} ${ENEMY_DEFS[n.kill].name}s slain`;
    if (n.visit) return s.progress ? 'Found it!' : 'Not found yet';
    if (n.fish) return `${s.progress}/${n.fish} fish`;
    if (n.bossKill) return s.progress ? 'A monster fell.' : 'No boss slain yet';
    return '';
  },
  complete(game) {
    const s = this.state(game), q = this.currentQuest(game), p = game.player; if (!q) return false;
    const n = q.need;
    if (n.item) { if (p.countItem(n.item) < n.n) return false; p.removeItem(n.item, n.n); }
    else if (n.kill && s.progress < n.n) return false;
    else if (n.visit && !s.progress) return false;
    else if (n.fish && s.progress < n.fish) return false;
    else if (n.bossKill && !s.progress) return false;
    p.coins += q.reward.coins; for (const [id, c] of q.reward.items) { const left = p.addItem(id, c, null); if (left) game.dropItem(p.cx, p.cy, id, left, null, null); }
    s.done.push(q.id); s.quest++; s.progress = 0; s.active = false; Audio_.play('levelup');
    return true;
  },
  onKill(game, e) { const s = this.state(game), q = this.currentQuest(game); if (!q || !s.active) return; if (q.need.kill && e.type === q.need.kill) s.progress++; if (q.need.bossKill && e.isBoss) s.progress = 1; },
  onFish(game) { const s = this.state(game), q = this.currentQuest(game); if (q && s.active && q.need.fish) s.progress++; },
  tick(game) {
    const s = this.state(game), q = this.currentQuest(game), p = game.player, w = game.world;
    if (q && s.active && q.need.visit === 'mineshaft' && w.mineshaft && Math.abs(p.tileX - w.mineshaft.x) < 8 && Math.abs(p.tileY - w.mineshaft.y) < 8 && !s.progress) { s.progress = 1; game.message('You found the Abandoned Mineshaft. The Wanderer will want to hear about this.', '#ffe0a0'); }
    if (this.dialog) { this.dialog.shown = Math.min(this.dialog.text.length, this.dialog.shown + 1); }
  },
  // stylish dialogue --------------------------------------------------------------------
  dialog: null,
  openQuestDialog(game, npc) {
    game.closeDialog();
    const s = this.state(game), q = this.currentQuest(game);
    let text, choices;
    if (!q) { text = 'The fable is written. Five pages, one reader. Keep them safe.'; choices = [{ label: 'Farewell', act: () => this.close(game) }]; }
    else if (!s.active) { text = `${q.title}. ${q.text}`; choices = [{ label: 'Accept', act: () => { s.active = true; this.show(game, npc, 'Good. Come back when it is done.', [{ label: 'Leave', act: () => this.close(game) }]); } }, { label: 'Not now', act: () => this.close(game) }]; }
    else { const done = this.canComplete(game); text = done ? `You did it. ${q.title}, finished. Here - take this, and the page.` : `${q.text}\n\nProgress: ${this.progressText(game)}`; choices = done ? [{ label: 'Turn in', act: () => { this.complete(game); this.show(game, npc, FABLE_QUESTS[s.quest] ? 'The next page is waiting. Talk to me again.' : 'The fable is complete. Thank you, reader.', [{ label: 'Leave', act: () => this.close(game) }]); } }] : [{ label: 'I will return', act: () => this.close(game) }]; }
    this.show(game, npc, text, choices);
  },
  canComplete(game) { const s = this.state(game), q = this.currentQuest(game), p = game.player; if (!q || !s.active) return false; const n = q.need; return (n.item && p.countItem(n.item) >= n.n) || (n.kill && s.progress >= n.n) || (n.visit && s.progress > 0) || (n.fish && s.progress >= n.fish) || (n.bossKill && s.progress > 0); },
  show(game, npc, text, choices) { this.dialog = { npc, text, shown: 0, choices }; Audio_.play('open'); },
  close(game) { this.dialog = null; Audio_.play('close'); },
  choose(game, i) { const d = this.dialog; if (!d) return; if (d.shown < d.text.length) { d.shown = d.text.length; return; } const c = d.choices[i]; if (c) c.act(); },
  draw(game) {
    const d = this.dialog; if (!d) return;
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    const bw = Math.min(720, W - 40), bh = 170, bx = W / 2 - bw / 2, by = H - bh - 40;
    // frame
    ctx.fillStyle = 'rgba(14,10,8,0.94)'; roundRect(ctx, bx, by, bw, bh, 10); ctx.fill();
    ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 3; roundRect(ctx, bx, by, bw, bh, 10); ctx.stroke();
    ctx.strokeStyle = 'rgba(192,160,96,0.4)'; ctx.lineWidth = 1; roundRect(ctx, bx + 6, by + 6, bw - 12, bh - 12, 8); ctx.stroke();
    // portrait
    const px = bx + 20, py = by + 20, ps = 120;
    ctx.fillStyle = '#2a2018'; roundRect(ctx, px, py, ps, ps, 8); ctx.fill();
    ctx.save(); ctx.beginPath(); roundRect(ctx, px, py, ps, ps, 8); ctx.clip(); ctx.translate(px + ps / 2 - 10, py + 10); ctx.scale(2.4, 2.4);
    drawHumanoid(ctx, -10 + 10 / 2.4 * 0, 0, { dir: 1, walk: null, colors: d.npc.colors, armAngle: null, item: null, hairStyle: d.npc.hairStyle }); ctx.restore();
    ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 2; roundRect(ctx, px, py, ps, ps, 8); ctx.stroke();
    // name plate
    ctx.fillStyle = '#c0a060'; roundRect(ctx, px + ps + 20, by - 14, measureText(ctx, d.npc.title, 16) + 30, 28, 6); ctx.fill();
    drawText(ctx, d.npc.title, px + ps + 35, by - 9, { size: 16, color: '#2a2018', outline: null });
    // typewriter text (word-wrapped)
    const tx = px + ps + 20, tw = bw - ps - 60; let y = by + 26;
    const words = d.text.slice(0, d.shown).split(/(\s+)/); let line = '';
    for (const wd of words) { if (wd === '\n' || wd.includes('\n')) { drawText(ctx, line, tx, y, { size: 16, color: '#f0e8d0' }); y += 22; line = ''; continue; } const test = line + wd; if (measureText(ctx, test, 16) > tw) { drawText(ctx, line, tx, y, { size: 16, color: '#f0e8d0' }); y += 22; line = wd.trimStart(); } else line = test; }
    if (line) drawText(ctx, line, tx, y, { size: 16, color: '#f0e8d0' });
    // choices
    if (d.shown >= d.text.length) {
      let cx = bx + bw - 20;
      for (let i = d.choices.length - 1; i >= 0; i--) { const c = d.choices[i]; const w = measureText(ctx, c.label, 15) + 28; cx -= w; const hov = mouse.x >= cx && mouse.x < cx + w && mouse.y >= by + bh - 44 && mouse.y < by + bh - 16; ctx.fillStyle = hov ? '#e0c080' : '#c0a060'; roundRect(ctx, cx, by + bh - 44, w, 28, 6); ctx.fill(); drawText(ctx, c.label, cx + w / 2, by + bh - 39, { size: 15, align: 'center', color: '#2a2018', outline: null }); UI.button(cx, by + bh - 44, w, 28, 'fable_choice', i); cx -= 10; }
    } else drawText(ctx, '...', bx + bw - 30, by + bh - 40, { size: 16, align: 'right', color: '#c0a060' });
    UI.button(bx, by, bw, bh - 50, 'fable_skip', null);
  },
};
ModLib.onEnemyKilled((g, e) => Fables.onKill(g, e));
ModLib.on('fishCaught', (g) => Fables.onFish(g));
ModLib.on('bossKilled', (g, e) => Fables.onKill(g, e));

// Structures & worldgen ---------------------------------------------------------------------
function placeMineshaft(world, rng) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const x = 60 + Math.floor(rng() * (world.w - 120));
    if (Math.abs(x - world.spawnX) < 60 || (world.shrine && Math.abs(x - world.shrine.x) < 40)) continue;
    const g = world.surface[x]; let flat = true; for (let k = -6; k <= 6; k++) if (Math.abs(world.surface[x + k] - g) > 2) flat = false;
    if (!flat || world.biome[x] === BIOME.DESERT) continue;
    // entrance frame
    for (let k = -4; k <= 4; k++) { for (let y = g - 6; y < g; y++) { world.setTile(x + k, y, T.AIR); world.setWall(x + k, y, W.PLANKS); } world.setTile(x + k, g - 7, T.WOODPLANKS); }
    world.setTile(x - 5, g - 7, T.WOOD); world.setTile(x + 5, g - 7, T.WOOD); for (let y = g - 6; y < g; y++) { world.setTile(x - 5, y, T.WOOD); world.setTile(x + 5, y, T.WOOD); }
    world.setTile(x - 3, g - 3, T.TORCH); world.setTile(x + 3, g - 3, T.TORCH);
    // shaft with platforms and side tunnels
    const depth = Math.min(world.h - 80, world.cavernLine + 20);
    for (let y = g; y < depth; y++) {
      for (let k = -1; k <= 1; k++) { world.setTile(x + k, y, T.AIR); world.liquid[world.idx(x + k, y)] = 0; world.lava[world.idx(x + k, y)] = 0; world.setWall(x + k, y, W.PLANKS); }
      world.setTile(x - 2, y, world.isSolidAt(x - 2, y) ? T.WOOD : T.AIR); world.setTile(x + 2, y, world.isSolidAt(x + 2, y) ? T.WOOD : T.AIR);
      if (y % 6 === 0) { world.setTile(x - 1, y, T.PLATFORM); world.setTile(x, y, T.PLATFORM); world.setTile(x + 1, y, T.PLATFORM); if (y % 12 === 0) world.setTile(x - 1, y - 2, T.TORCH); }
      if (y % 25 === 12 && y > g + 10) { // side tunnel with ore and a chest
        const dir = rng() < 0.5 ? -1 : 1, len = 12 + Math.floor(rng() * 10);
        for (let k = 3; k <= len; k++) { for (let yy = y - 2; yy <= y; yy++) { world.setTile(x + dir * k, yy, T.AIR); world.setWall(x + dir * k, yy, W.PLANKS); } world.setTile(x + dir * k, y + 1, world.isSolidAt(x + dir * k, y + 1) ? T.WOODPLANKS : T.PLATFORM); if (k % 5 === 0) world.setTile(x + dir * k, y - 2, T.TORCH); if (rng() < 0.15) world.setTile(x + dir * k, y + 2, choose([T.COPPER, T.IRON, T.SILVER, T.GOLD])); }
        world.placeFurniture(x + dir * len, y, T.CHEST); const inv = world.chests.get(world.idx(x + dir * len, y)); if (inv) { inv[0] = makeStack(choose(['iron_bar', 'silver_bar', 'gold_bar']), randInt(4, 9), null); inv[1] = makeStack('torch', randInt(8, 16), null); inv[2] = makeStack('bomb', randInt(2, 5), null); inv[3] = makeStack('lesser_healing', randInt(2, 4), null); if (rng() < 0.3) inv[4] = makeStack('mining_helmet', 1, null); }
      }
    }
    world.mineshaft = { x, y: g };
    return true;
  }
  return false;
}
function placeWatchtower(world, rng) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const x = 60 + Math.floor(rng() * (world.w - 120));
    if (Math.abs(x - world.spawnX) < 80 || (world.mineshaft && Math.abs(x - world.mineshaft.x) < 40) || (world.shrine && Math.abs(x - world.shrine.x) < 40)) continue;
    const g = world.surface[x]; let flat = true; for (let k = -4; k <= 4; k++) if (Math.abs(world.surface[x + k] - g) > 2) flat = false;
    if (!flat) continue;
    const h = 22;
    for (let y = g - h; y <= g; y++) for (let k = -3; k <= 3; k++) { const edge = Math.abs(k) === 3 || y === g - h || y === g; world.setTile(x + k, y, edge ? T.STONEBRICK : T.AIR); world.setWall(x + k, y, W.STONEBRICK); if (y > g - 3 && rng() < 0.5 && Math.abs(k) === 3) world.setTile(x + k, y, T.AIR); }
    for (let y = g - 4; y > g - h; y -= 4) { world.setTile(x - 2, y, T.PLATFORM); world.setTile(x - 1, y, T.PLATFORM); world.setTile(x, y, T.PLATFORM); world.setTile(x + 1, y, T.PLATFORM); world.setTile(x + 2, y, T.PLATFORM); if (y % 8 === (g - 4) % 8) world.setTile(x - 2, y - 2, T.TORCH); }
    for (let k = -3; k <= 3; k += 2) world.setTile(x + k, g - h - 1, T.STONEBRICK); // battlements
    world.setTile(x - 3, g - 2, T.AIR); world.setTile(x - 3, g - 3, T.AIR); world.placeFurniture(x - 3, g - 3, T.DOOR_C);
    world.placeFurniture(x + 1, g - h + 1, T.CHEST); const inv = world.chests.get(world.idx(x + 1, g - h + 1)); if (inv) { inv[0] = makeStack('gold_bar', randInt(3, 6), null); inv[1] = makeStack('lens', randInt(2, 4), null); inv[2] = makeStack(choose(['cloud_in_a_bottle', 'lucky_horseshoe', 'aglet', 'anklet_of_the_wind']), 1, null); inv[3] = makeStack('torch', 10, null); }
    world.setTile(x, g - h + 1, T.TORCH); world.setTile(x - 2, g - h + 1, T.TORCH);
    world.watchtower = { x, y: g - h };
    return true;
  }
  return false;
}
function fablesWorldgen(world, rng) {
  // boulders, fallen logs and wildflower meadows on the surface; ruined brick walls underground
  let n = 0;
  for (let x = 40; x < world.w - 40; x += 6 + Math.floor(rng() * 10)) {
    const g = world.surface[x]; if (world.biome[x] === BIOME.DESERT || world.biome[x] === BIOME.SNOW) continue;
    if (Math.abs(x - world.spawnX) < 25) continue;
    const r = rng();
    if (r < 0.12) { const s = 1 + Math.floor(rng() * 2); for (let yy = -s; yy <= 0; yy++) for (let xx = -s; xx <= s; xx++) if (Math.hypot(xx, yy + 0.5) <= s + 0.3 && world.get(x + xx, g - 1 + yy) === T.AIR) world.setTile(x + xx, g - 1 + yy, T.STONE); n++; }
    else if (r < 0.22) { const len = 3 + Math.floor(rng() * 4); for (let k = 0; k < len; k++) if (world.get(x + k, g - 1) === T.AIR && world.isSolidAt(x + k, g)) world.setTile(x + k, g - 1, T.PLATFORM); n++; }
    else if (r < 0.5) { for (let k = 0; k < 8; k++) if (world.get(x + k, g - 1) === T.AIR && world.get(x + k, g) === T.GRASS && rng() < 0.7) world.setTile(x + k, g - 1, T.PLANT); }
  }
  for (let i = 0; i < 40; i++) {
    const x = 30 + Math.floor(rng() * (world.w - 60)), y = world.surfaceLine + 10 + Math.floor(rng() * (world.cavernLine - world.surfaceLine - 20));
    if (!world.isSolidAt(x, y)) continue;
    const len = 4 + Math.floor(rng() * 6); for (let k = 0; k < len; k++) { if (rng() < 0.7) world.setTile(x + k, y, T.STONEBRICK); world.setWall(x + k, y - 1, W.STONEBRICK); world.setWall(x + k, y, W.STONEBRICK); }
  }
  return n;
}
