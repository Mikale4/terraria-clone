// ---------------------------------------------------------------------------
// Structure Helper: build structures in-game and save them to files - the
// Structure Wand selects a rectangle (two right-clicks), saves tiles, walls,
// tile data, liquids and chest contents under a name; the Structure Placer
// pastes the selected structure with a ghost preview (copy & move sections of
// the world). Saved structures can be exported / imported as JSON text and
// flagged to generate in new worlds (surface or underground, with a count).
// ---------------------------------------------------------------------------
'use strict';

defItem('structure_wand', { name: 'Structure Wand', max: 1, rarity: 2, tooltip: 'Right-click two corners to select an area, then left-click to save it as a structure (B opens the structure list)', drawIcon: (x) => { x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.strokeStyle = '#40ff80'; x.lineWidth = 1; x.strokeRect(9.5, 1.5, 5, 5); } });
defItem('structure_placer', { name: 'Structure Placer', max: 1, rarity: 2, tooltip: 'Left-click to paste the selected structure at the cursor (B to pick one). Shows a ghost preview', drawIcon: (x) => { x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = '#40ff80'; x.fillRect(9, 1, 6, 6); x.fillStyle = '#fff'; x.fillRect(11, 3, 2, 2); } });
ITEM_VALUES.structure_wand = 10000; ITEMS.structure_wand.value = 10000; ITEM_VALUES.structure_placer = 10000; ITEMS.structure_placer.value = 10000;
RECIPES.push({ result: 'structure_wand', count: 1, station: 'workbench', ing: [['wood', 10], ['gel', 5]] });
RECIPES.push({ result: 'structure_placer', count: 1, station: 'workbench', ing: [['wood', 10], ['gel', 5]] });
ITEMS.structure_wand.use = (g, s, it) => Structures.wandUse(g);
ITEMS.structure_placer.use = (g, s, it) => Structures.placerUse(g);

const Structures = {
  list: [], selected: 0, cornerA: null, cornerB: null,
  load() { try { this.list = JSON.parse(localStorage.getItem('structures') || '[]'); } catch (e) { this.list = []; } },
  save() { try { localStorage.setItem('structures', JSON.stringify(this.list)); } catch (e) {} },
  current() { return this.list[this.selected] || null; },
  // right-click with the wand: set corners
  wandRight(game) {
    const tx = Math.floor(game.mouse.wx / TILE), ty = Math.floor(game.mouse.wy / TILE);
    if (!this.cornerA || this.cornerB) { this.cornerA = { x: tx, y: ty }; this.cornerB = null; game.message('Corner A set. Right-click the opposite corner.', '#80ff80'); }
    else { this.cornerB = { x: tx, y: ty }; game.message(`Selection: ${Math.abs(tx - this.cornerA.x) + 1} x ${Math.abs(ty - this.cornerA.y) + 1}. Left-click to save it.`, '#80ff80'); }
    Audio_.play('menu');
  },
  wandUse(game) {
    if (game.useHeld !== 1) return;
    game.player.useTimer = 15;
    if (!this.cornerA || !this.cornerB) { game.message('Select an area first: right-click two corners.', '#ff8080'); return; }
    if (TextInput.active) return;
    TextInput.focus({ id: 'structure_name', placeholder: 'structure name', max: 24, onSubmit: (v) => { const name = v.trim() || `Structure ${this.list.length + 1}`; this.capture(game, name); }, onCancel: () => game.message('Cancelled.', '#aaa') });
    game.message('Type a name for the structure and press Enter.', '#ffe75a');
  },
  capture(game, name) {
    const w = game.world, a = this.cornerA, b = this.cornerB;
    const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y);
    const sw = x1 - x0 + 1, sh = y1 - y0 + 1;
    if (sw * sh > 20000) { game.message('That area is too big (max 20000 tiles).', '#ff8080'); return; }
    const tiles = [], walls = [], tdata = [], liquid = [], lava = [], chests = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = w.idx(x, y); const ib = w.inBounds(x, y);
      tiles.push(ib ? w.tiles[i] : 0); walls.push(ib ? w.walls[i] : 0); tdata.push(ib ? w.tdata[i] : 0); liquid.push(ib ? w.liquid[i] : 0); lava.push(ib ? w.lava[i] : 0);
      if (ib && w.tiles[i] === T.CHEST && (w.tdata[i] & 15) === 0 && w.chests.has(i)) chests.push({ x: x - x0, y: y - y0, inv: w.chests.get(i).map(s => s ? { id: s.id, count: s.count, prefix: s.prefix } : null) });
    }
    const st = { name, w: sw, h: sh, tiles, walls, tdata, liquid, lava, chests, gen: false, where: 'surface', count: 1, created: Date.now() };
    this.list.push(st); this.selected = this.list.length - 1; this.save();
    game.message(`Saved structure "${name}" (${sw}x${sh}). It is now selected for the Placer.`, '#80ff80'); Audio_.play('craft');
    this.cornerA = this.cornerB = null;
  },
  placerUse(game) {
    if (game.useHeld !== 1) return;
    const st = this.current(); game.player.useTimer = 20;
    if (!st) { game.message('No structure selected. Press B to pick one.', '#ff8080'); return; }
    const tx = Math.floor(game.mouse.wx / TILE), ty = Math.floor(game.mouse.wy / TILE);
    this.place(game.world, st, tx, ty);
    game.updateCraftable(); game.world.rebuildChairs();
    game.message(`Placed "${st.name}".`, '#80ff80'); Audio_.play('place'); FX.shake(1, 6);
  },
  // write a structure into the world with its top-left at (x0, y0)
  place(world, st, x0, y0) {
    for (let y = 0; y < st.h; y++) for (let x = 0; x < st.w; x++) {
      const wx = x0 + x, wy = y0 + y; if (!world.inBounds(wx, wy)) continue;
      const k = x + y * st.w, i = world.idx(wx, wy);
      if (world.tiles[i] === T.CHEST) { const a = world.furnitureAnchor(wx, wy); if (a) world.chests.delete(world.idx(a.x, a.y)); }
      world.setTile(wx, wy, st.tiles[k], st.tdata[k]); world.setWall(wx, wy, st.walls[k]);
      world.liquid[i] = st.liquid[k]; world.lava[i] = st.lava[k]; if (st.liquid[k]) world.liquidDirty.add(i);
      if (st.tiles[k] === T.CHAIR && (st.tdata[k] & 15) === 0) world.chairs.add(i);
    }
    for (const c of st.chests || []) { const i = world.idx(x0 + c.x, y0 + c.y); if (world.inBounds(x0 + c.x, y0 + c.y)) world.chests.set(i, c.inv.map(s => s ? { id: s.id, count: s.count, prefix: s.prefix } : null).concat(new Array(Math.max(0, 40 - c.inv.length)).fill(null))); }
    for (let x = x0 - 1; x <= x0 + st.w; x++) if (x >= 0 && x < world.w) world.updateTopSolid(x);
  },
  // worldgen: structures flagged for generation
  generate(world, rng) {
    let n = 0;
    for (const st of this.list) {
      if (!st.gen) continue;
      for (let k = 0; k < (st.count || 1); k++) {
        for (let attempt = 0; attempt < 200; attempt++) {
          const x = 30 + Math.floor(rng() * (world.w - 60 - st.w));
          if (Math.abs(x - world.spawnX) < 40) continue;
          let y;
          if (st.where === 'underground') { y = world.surfaceLine + 20 + Math.floor(rng() * Math.max(10, world.cavernLine - world.surfaceLine - 30)); }
          else { let mn = 1e9, mx = -1e9; for (let i = 0; i < st.w; i++) { mn = Math.min(mn, world.surface[x + i]); mx = Math.max(mx, world.surface[x + i]); } if (mx - mn > 4) continue; y = mn - st.h; }
          if (y < 5 || y + st.h >= world.h - 5) continue;
          this.place(world, st, x, y); n++; break;
        }
      }
    }
    return n;
  },
  exportText(st) { return JSON.stringify(st); },
  importText(game, text) { try { const st = JSON.parse(text); if (!st || !st.w || !st.h || !Array.isArray(st.tiles) || st.tiles.length !== st.w * st.h) throw new Error('bad'); st.name = String(st.name || 'Imported').slice(0, 24); st.chests = st.chests || []; st.gen = !!st.gen; this.list.push(st); this.selected = this.list.length - 1; this.save(); game.message(`Imported "${st.name}".`, '#80ff80'); } catch (e) { game.message('Import failed: not a structure JSON.', '#ff8080'); } },
  // world-space overlays: selection rectangle & placer ghost
  drawWorld(game) {
    const p = game.player, sel = p.selectedItem, ctx = game.renderer.ctx, z = game.renderer.zoom, cam = game.cam;
    if (!sel) return;
    if (sel.id === 'structure_wand') {
      const tx = Math.floor(game.mouse.wx / TILE), ty = Math.floor(game.mouse.wy / TILE);
      const a = this.cornerA, b = this.cornerB || (a ? { x: tx, y: ty } : null);
      if (a && b) { const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), x1 = Math.max(a.x, b.x), y1 = Math.max(a.y, b.y); ctx.fillStyle = 'rgba(64,255,128,0.15)'; ctx.fillRect((x0 * TILE - cam.x) * z, (y0 * TILE - cam.y) * z, (x1 - x0 + 1) * TILE * z, (y1 - y0 + 1) * TILE * z); ctx.strokeStyle = '#40ff80'; ctx.lineWidth = 2; ctx.strokeRect((x0 * TILE - cam.x) * z, (y0 * TILE - cam.y) * z, (x1 - x0 + 1) * TILE * z, (y1 - y0 + 1) * TILE * z); drawText(ctx, `${x1 - x0 + 1} x ${y1 - y0 + 1}`, (x0 * TILE - cam.x) * z, (y0 * TILE - cam.y) * z - 18, { size: 12, color: '#40ff80' }); }
    }
    if (sel.id === 'structure_placer') {
      const st = this.current(); if (!st) return;
      const tx = Math.floor(game.mouse.wx / TILE), ty = Math.floor(game.mouse.wy / TILE);
      ctx.globalAlpha = 0.45;
      for (let y = 0; y < st.h; y++) for (let x = 0; x < st.w; x++) { const id = st.tiles[x + y * st.w]; if (id === T.AIR) continue; const def = TILES[id]; ctx.fillStyle = def.mapColor || def.color || '#fff'; ctx.fillRect(((tx + x) * TILE - cam.x) * z, ((ty + y) * TILE - cam.y) * z, TILE * z, TILE * z); }
      ctx.globalAlpha = 1; ctx.strokeStyle = '#40ff80'; ctx.lineWidth = 1; ctx.strokeRect((tx * TILE - cam.x) * z, (ty * TILE - cam.y) * z, st.w * TILE * z, st.h * TILE * z);
      drawText(ctx, st.name, (tx * TILE - cam.x) * z, (ty * TILE - cam.y) * z - 18, { size: 12, color: '#40ff80' });
    }
  },
  drawPanel(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    const bw = Math.min(600, W - 40), bh = 400, bx = W / 2 - bw / 2, by = H / 2 - bh / 2;
    ctx.fillStyle = 'rgba(10,30,20,0.95)'; roundRect(ctx, bx, by, bw, bh, 12); ctx.fill(); ctx.strokeStyle = '#40ff80'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 12); ctx.stroke();
    drawText(ctx, 'Structures', bx + 20, by + 12, { size: 22, color: '#c0ffd0' });
    drawText(ctx, 'B / Esc to close', bx + bw - 20, by + 16, { size: 13, align: 'right', color: '#aaa' });
    const btn = (x, y, w, label, id, data, col = 'rgba(255,255,255,0.1)') => { const hov = mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + 22; ctx.fillStyle = hov ? 'rgba(255,255,255,0.25)' : col; roundRect(ctx, x, y, w, 22, 5); ctx.fill(); drawText(ctx, label, x + w / 2, y + 3, { size: 12, align: 'center', color: '#fff' }); UI.button(x, y, w, 22, id, data); };
    let y = by + 46;
    if (!this.list.length) drawText(ctx, 'No structures saved. Craft a Structure Wand, right-click two corners, then left-click to save.', bx + 20, y, { size: 14, color: '#ccc' });
    this.list.slice(0, 9).forEach((st, i) => {
      const on = i === this.selected;
      ctx.fillStyle = on ? 'rgba(64,255,128,0.2)' : 'rgba(255,255,255,0.05)'; roundRect(ctx, bx + 16, y - 4, bw - 32, 32, 6); ctx.fill();
      drawText(ctx, `${st.name}  ${st.w}x${st.h}`, bx + 24, y + 2, { size: 14, color: on ? '#c0ffd0' : '#fff' });
      btn(bx + 250, y, 60, on ? 'Selected' : 'Select', 'struct_select', i);
      btn(bx + 316, y, 100, `Gen: ${st.gen ? (st.where === 'underground' ? 'Underground' : 'Surface') + ' x' + (st.count || 1) : 'Off'}`, 'struct_gen', i);
      btn(bx + 422, y, 56, 'Export', 'struct_export', i);
      btn(bx + 484, y, 56, 'Delete', 'struct_delete', i, 'rgba(255,80,80,0.2)');
      y += 36;
    });
    y = by + bh - 70;
    btn(bx + 20, y, 120, 'Import JSON...', 'struct_import', null);
    if (TextInput.isFocused('structure_import')) TextInput.draw(ctx, bx + 150, y - 2, bw - 170, 26, { id: 'structure_import', placeholder: 'paste structure JSON, Enter' });
    if (this.exported) { drawText(ctx, 'Exported JSON copied to the clipboard (also in the browser console).', bx + 20, y + 30, { size: 12, color: '#a0ffa0' }); }
    drawText(ctx, 'Structures flagged "Gen" are placed randomly in every new world (surface: flat ground; underground: buried).', bx + 20, by + bh - 24, { size: 11, color: '#999' });
  },
  click(game, b) {
    const i = b.data, st = this.list[i];
    if (b.id === 'struct_select') { this.selected = i; Audio_.play('menu'); }
    else if (b.id === 'struct_gen') { if (!st.gen) { st.gen = true; st.where = 'surface'; st.count = 1; } else if (st.where === 'surface' && st.count < 3) st.count++; else if (st.where === 'surface') { st.where = 'underground'; st.count = 1; } else if (st.count < 3) st.count++; else st.gen = false; this.save(); Audio_.play('menu'); }
    else if (b.id === 'struct_export') { const txt = this.exportText(st); console.log('Structure JSON:', txt); try { navigator.clipboard.writeText(txt); } catch (e) {} this.exported = true; Audio_.play('craft'); }
    else if (b.id === 'struct_delete') { this.list.splice(i, 1); if (this.selected >= this.list.length) this.selected = Math.max(0, this.list.length - 1); this.save(); Audio_.play('menu'); }
    else if (b.id === 'struct_import') { TextInput.focus({ id: 'structure_import', placeholder: 'paste structure JSON', max: 200000, onSubmit: (v) => this.importText(game, v) }); }
  },
};
Structures.load();
ModKeys.bind('KeyB', 'Structure list', (g) => { UI.structOpen = !UI.structOpen; Audio_.play('open'); });
