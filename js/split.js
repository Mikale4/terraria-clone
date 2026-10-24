// ---------------------------------------------------------------------------
// Split slice: Photography (Camera item that snaps real pictures of the scene,
// a Photo Album, the Shutterbug NPC with photo quests), the Mana Overload
// mechanic for mages, and the Stranded Ship structure in the underground snow.
// ---------------------------------------------------------------------------
'use strict';

function defSItem(id, name, o) { defItem(id, Object.assign({ name }, o)); ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id]; }
defSItem('camera', 'Camera', { max: 1, rarity: 1, value: 10000, tooltip: 'Takes a photo of what you see (saved to your Photo Album). The Shutterbug pays for photos of creatures', drawIcon: (x) => { x.fillStyle = '#3a3a48'; x.fillRect(1, 5, 14, 9); x.fillStyle = '#6a6a78'; x.fillRect(1, 5, 14, 2); x.fillStyle = '#202028'; x.beginPath(); x.arc(8, 10, 3.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#80c0ff'; x.beginPath(); x.arc(8, 10, 2, 0, Math.PI * 2); x.fill(); x.fillStyle = '#ff4040'; x.fillRect(12, 6, 2, 1); }, use: (g, s, it) => Photography.snap(g, s, it) });
defSItem('photo_album', 'Photo Album', { max: 1, rarity: 1, value: 2000, tooltip: 'Opens your Photo Album', drawIcon: (x) => { x.fillStyle = '#8a4a3a'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#f0e8d0'; x.fillRect(4, 4, 8, 8); x.fillStyle = '#60a0ff'; x.fillRect(5, 5, 6, 3); x.fillStyle = '#40a040'; x.fillRect(5, 8, 6, 3); }, onUse: (g) => { UI.albumOpen = !UI.albumOpen; Audio_.play('open'); } });
RECIPES.push({ result: 'camera', count: 1, station: 'anvil', ing: [['iron_bar', 5], ['lens', 2], ['glass', 1]] });
RECIPES.push({ result: 'photo_album', count: 1, station: 'workbench', ing: [['wood', 5], ['cobweb', 3]] });
defSItem('sailors_hat', "Sailor's Hat", { max: 1, armor: 'head', defense: 1, rarity: 1, value: 5000, breath: true, tooltip: '1 defense. Doubles your breath underwater', drawIcon: (x) => { x.fillStyle = '#f0f0f0'; x.fillRect(3, 6, 10, 4); x.fillRect(4, 3, 8, 3); x.fillStyle = '#2040a0'; x.fillRect(3, 9, 10, 1); } });
defSItem('captains_log', "Captain's Log", { max: 1, rarity: 2, value: 1000, tooltip: '"Day 40. The ice took the hull. The crew took the boats. I took the rum." A relic of the Stranded Ship', drawIcon: (x) => { x.fillStyle = '#4a3020'; x.fillRect(3, 2, 10, 12); x.fillStyle = '#c0a060'; x.fillRect(4, 3, 8, 1); x.fillRect(4, 12, 8, 1); x.fillStyle = '#f0e8d0'; x.fillRect(5, 5, 6, 6); } });
defSItem('frost_cutlass', 'Frost Cutlass', { max: 1, sword: 'broad', damage: 18, useTime: 19, knockback: 4, rarity: 2, value: 20000, icon: { kind: 'sword', mat: 'silver' }, frostburn: true, tooltip: '18 melee damage. Inflicts Frostburn' });

// Photography ------------------------------------------------------------------------------
const PHOTO_SUBJECTS = ['zombie', 'skeleton', 'demon_eye', 'blue_slime', 'green_slime', 'bat', 'fairy', 'diseaster_bunny', 'wulfrum_slime', 'vampire_miner'];
const Photography = {
  state(game) { return ModLib.player(game, 'split', () => ({ photos: [], quest: null, questsDone: 0, overloadOn: true })); },
  snap(game, slot, it) {
    const p = game.player, s = this.state(game), r = game.renderer;
    if (p.useTimer > 0) return;
    p.startUse(slot.id, 30); p.dir = game.mouse.wx < p.cx ? -1 : 1;
    // crop the rendered (lit) frame around the player: 160x100 world px -> thumbnail
    const src = r.lit || r.scene; const z = 1; const cw = 200, ch = 120;
    const sx = Math.round(p.cx - game.cam.x - cw / 2), sy = Math.round(p.cy - game.cam.y - ch / 2);
    const c = makeCanvas(100, 60); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    try { x.drawImage(src, sx, sy, cw, ch, 0, 0, 100, 60); } catch (e) { x.fillStyle = '#88a'; x.fillRect(0, 0, 100, 60); }
    // who is in frame?
    const inFrame = game.enemies.filter(e => !e.dead && Math.abs(e.cx - p.cx) < cw / 2 && Math.abs(e.cy - p.cy) < ch / 2).map(e => e.type || e.name);
    const npcs = game.npcs.filter(n => Math.abs(n.cx - p.cx) < cw / 2 && Math.abs(n.cy - p.cy) < ch / 2).map(n => n.role);
    let data; try { data = c.toDataURL(); } catch (e) { data = null; }
    const photo = { data, subjects: inFrame, npcs, time: game.world.time, biome: BiomeTitles.text || '', id: Date.now() };
    s.photos.unshift(photo); if (s.photos.length > 12) s.photos.pop();
    FX.flash('#ffffff', 8, 0.8); Audio_.play('menu');
    game.addDamageText(p.cx, p.y - 14, inFrame.length ? `Photo: ${[...new Set(inFrame)].map(t => ENEMY_DEFS[t] ? ENEMY_DEFS[t].name : t).join(', ')}` : 'Photo taken', '#c0e0ff');
    p.stats.photos = (p.stats.photos || 0) + 1;
    // quest check
    if (s.quest && inFrame.includes(s.quest.type)) { s.quest.done = true; game.message(`Shutterbug quest: you got the shot of the ${ENEMY_DEFS[s.quest.type].name}! Bring it back.`, '#c0e0ff'); }
  },
  newQuest(game) { const s = this.state(game); const type = choose(PHOTO_SUBJECTS.filter(t => ENEMY_DEFS[t])); s.quest = { type, done: false, reward: 5000 + s.questsDone * 2000 }; return s.quest; },
  turnIn(game) { const s = this.state(game), p = game.player; if (!s.quest || !s.quest.done) return false; p.coins += s.quest.reward; s.questsDone++; const gift = s.questsDone % 3 === 0 ? 'lens' : null; if (gift) p.addItem(gift, 3, null); s.quest = null; Audio_.play('coin'); return true; },
  drawAlbum(game) {
    const s = this.state(game), ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    const bw = Math.min(560, W - 40), bh = 380, bx = W / 2 - bw / 2, by = H / 2 - bh / 2;
    ctx.fillStyle = 'rgba(30,20,20,0.95)'; roundRect(ctx, bx, by, bw, bh, 12); ctx.fill(); ctx.strokeStyle = '#c0a060'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 12); ctx.stroke();
    drawText(ctx, `Photo Album  (${s.photos.length}/12)`, bx + 20, by + 12, { size: 22, color: '#ffe0a0' });
    drawText(ctx, 'Esc to close', bx + bw - 20, by + 16, { size: 13, align: 'right', color: '#aaa' });
    if (!s.photos.length) drawText(ctx, 'No photos yet. Craft a Camera (5 Iron Bars + 2 Lenses + 1 Glass) and use it.', bx + 20, by + 60, { size: 15, color: '#ccc' });
    s.photos.forEach((ph, i) => {
      const col = i % 4, row = Math.floor(i / 4), x = bx + 20 + col * 132, y = by + 50 + row * 108;
      ctx.fillStyle = '#f0e8d0'; ctx.fillRect(x - 4, y - 4, 108, 84);
      if (ph.data) { if (!ph._img) { ph._img = new Image(); ph._img.src = ph.data; } if (ph._img.complete) ctx.drawImage(ph._img, x, y, 100, 60); }
      else { ctx.fillStyle = '#88a'; ctx.fillRect(x, y, 100, 60); }
      const subj = ph.subjects && ph.subjects.length ? [...new Set(ph.subjects)].map(t => ENEMY_DEFS[t] ? ENEMY_DEFS[t].name : t).join(', ') : (ph.npcs && ph.npcs.length ? ph.npcs.join(', ') : ph.biome || 'Scenery');
      drawText(ctx, subj.slice(0, 18), x + 50, y + 62, { size: 11, align: 'center', color: '#402020', outline: null });
      if (mouse.x >= x && mouse.x < x + 100 && mouse.y >= y && mouse.y < y + 60) { ctx.strokeStyle = '#ffe75a'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 100, 60); UI.tooltip = { lines: [{ t: subj, c: '#fff' }, { t: `Taken in: ${ph.biome || '?'}`, c: '#aaa' }, { t: 'Click to delete', c: '#f88' }] }; }
      UI.button(x, y, 100, 60, 'album_photo', i);
    });
    if (s.quest) drawText(ctx, `Shutterbug wants a photo of: ${ENEMY_DEFS[s.quest.type].name}${s.quest.done ? '  (done! bring it back)' : ''}`, bx + 20, by + bh - 30, { size: 14, color: s.quest.done ? '#a0ffa0' : '#ffd0a0' });
  },
};
NPC_NAMES.Shutterbug = ['Iris', 'Ansel', 'Vivian', 'Dorothea', 'Weegee'];
NPC_ROLES.Shutterbug = {
  town: true, hairStyle: 1,
  colors: { skin: '#f2c6a0', hair: '#a04020', shirt: '#e0d0a0', pants: '#4a3a2a', shoes: '#2a2a2a', eye: '#3a8ad0' },
  weapon: { kind: 'bullet', damage: 10, rate: 30, speed: 10 }, buttons: ['Quest', 'Album'],
  condition: (g) => (g.player.stats.photos || 0) > 0,
  onButton: (g, npc, b) => {
    const s = Photography.state(g), d = g.dialog;
    if (b === 'Album') { UI.albumOpen = true; g.closeDialog(); return; }
    if (s.quest && s.quest.done) { const r = s.quest.reward; Photography.turnIn(g); d.text = `Perfect composition! Here's ${coinsToString(r)} for the shot.`; return; }
    if (s.quest) { d.text = `I still need that photo of a ${ENEMY_DEFS[s.quest.type].name}. Hold the Camera, get it in frame and click!`; return; }
    const q = Photography.newQuest(g); d.text = `New assignment: photograph a ${ENEMY_DEFS[q.type].name}. I'll pay ${coinsToString(q.reward)}.`;
  },
  lines: ["Hold still - no, the other way. Perfect. Terrible. Perfect.", "A photo of a zombie mid-lunge is worth more than gold. Slightly more.", "Light is everything. Torches are the poor man's sun.", "I've been trying to photograph the Eye of Cthulhu for months. It keeps blinking.", "Every good picture has a story. Mine usually end in running."],
};

// Mana Overload ---------------------------------------------------------------------------------
const ManaOverload = {
  cfg: { enabled: true },
  load() { try { const c = JSON.parse(localStorage.getItem('overload_cfg') || 'null'); if (c) Object.assign(this.cfg, c); } catch (e) {} },
  save() { try { localStorage.setItem('overload_cfg', JSON.stringify(this.cfg)); } catch (e) {} },
  state(game) { return ModLib.player(game, 'overload', () => ({ active: 0, burnout: 0 })); },
  // called when a spell can't be paid for: enter Overload (free casts, +30% magic damage, +20% damage taken) then Burnout
  tryOverload(game) {
    const s = this.state(game); if (!this.cfg.enabled || s.active > 0 || s.burnout > 0) return false;
    s.active = 60 * 5; game.message('MANA OVERLOAD! Spells are free and 30% stronger for 5 s, but you take 20% more damage.', '#ff80ff'); FX.flash('#ff80ff', 15, 0.3); Audio_.play('levelup');
    return true;
  },
  tick(game) {
    const s = this.state(game), p = game.player;
    if (s.active > 0) { s.active--; p.mana = Math.max(p.mana, 1); if (s.active % 5 === 0) game.particles.push(new Particle(p.cx + rand(-10, 10), p.y + rand(0, 40), 0, -1.5, '#ff80ff', 20, 2)); if (s.active === 0) { s.burnout = 60 * 8; p.mana = 0; game.message('Burnout: no mana regeneration for 8 s.', '#a060a0'); } }
    if (s.burnout > 0) { s.burnout--; p.manaRegenDelay = Math.max(p.manaRegenDelay, 2); }
  },
  mods(p, pm, game) { const s = this.state(game); if (s.active > 0) pm.magicDmg = (pm.magicDmg || 1) * 1.3; },
  incoming(p, amount, game) { const s = this.state(game); return s.active > 0 ? Math.round(amount * 1.2) : amount; },
  draw(game) {
    const s = this.state(game); if (s.active <= 0 && s.burnout <= 0) return;
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    drawText(ctx, s.active > 0 ? `MANA OVERLOAD ${(s.active / 60).toFixed(1)}s` : `Burnout ${(s.burnout / 60).toFixed(1)}s`, W / 2, 80, { size: 18, align: 'center', color: s.active > 0 ? '#ff80ff' : '#a060a0' });
  },
};
ManaOverload.load();
ModLib.onPlayerMods((p, pm, g) => ManaOverload.mods(p, pm, g));
ModLib.onIncoming((p, a, g) => ManaOverload.incoming(p, a, g));

// Stranded Ship (underground snow) ----------------------------------------------------------
function placeStrandedShip(world, rng) {
  const snowCols = []; for (let x = 40; x < world.w - 40; x++) if (world.biome[x] === BIOME.SNOW) snowCols.push(x);
  if (!snowCols.length) return false;
  for (let attempt = 0; attempt < 300; attempt++) {
    const cx = snowCols[Math.floor(rng() * snowCols.length)];
    const cy = world.surfaceLine + 20 + Math.floor(rng() * Math.max(10, world.cavernLine - world.surfaceLine - 30));
    let solid = 0; for (let y = cy - 8; y <= cy + 6; y++) for (let x = cx - 14; x <= cx + 14; x++) if (world.isSolidAt(x, y)) solid++;
    if (solid < 29 * 15 * 0.7) continue;
    // hull: a boat shape of wood planks with planked walls, deck of platforms, a mast
    for (let y = cy - 8; y <= cy + 6; y++) for (let x = cx - 14; x <= cx + 14; x++) {
      const dx = Math.abs(x - cx), inHull = y >= cy - 1 ? dx <= 14 - (y - (cy - 1)) * 1.6 : dx <= 14;
      if (!inHull) continue;
      const edge = y === cy + 6 - Math.floor(dx / 2.2) || dx >= 14 - Math.max(0, (y - (cy - 1)) * 1.6) - 1 || y === cy - 8;
      world.setTile(x, y, edge && y >= cy - 1 ? T.WOOD : T.AIR); world.setWall(x, y, W.PLANKS); world.liquid[world.idx(x, y)] = 0;
    }
    for (let x = cx - 12; x <= cx + 12; x++) world.setTile(x, cy - 1, T.WOODPLANKS); // deck
    for (let y = cy - 8; y < cy - 1; y++) world.setTile(cx, y, T.WOOD); // mast
    for (let x = cx - 5; x <= cx + 5; x++) world.setTile(x, cy - 6, T.PLATFORM); // yard
    world.setTile(cx - 8, cy - 3, T.TORCH); world.setTile(cx + 8, cy - 3, T.TORCH); world.setTile(cx - 6, cy + 2, T.TORCH);
    world.placeFurniture(cx - 3, cy + 3, T.CHEST); world.placeFurniture(cx + 3, cy + 3, T.CHEST);
    const inv = world.chests.get(world.idx(cx - 3, cy + 3)); if (inv) { inv[0] = makeStack('captains_log', 1, null); inv[1] = makeStack('silver_bar', randInt(6, 12), null); inv[2] = makeStack('lesser_healing', randInt(3, 6), null); inv[3] = makeStack('sailors_hat', 1, null); inv[4] = makeStack('coin_gold', randInt(1, 2), null); }
    const inv2 = world.chests.get(world.idx(cx + 3, cy + 3)); if (inv2) { inv2[0] = makeStack('frost_cutlass', 1); inv2[1] = makeStack('torch', randInt(10, 20), null); inv2[2] = makeStack('wooden_fishing_pole', 1, null); inv2[3] = makeStack('bass', randInt(3, 6), null); }
    world.placeFurniture(cx + 7, cy + 4, T.CHAIR); world.placeFurniture(cx - 10, cy + 3, T.TABLE);
    world.strandedShip = { x: cx, y: cy };
    return true;
  }
  return false;
}
