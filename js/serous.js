// ---------------------------------------------------------------------------
// SerousCommonLib-style shared library: text input widget (used by the crafting
// search box, structure names, the command bar), a keybinding registry with a
// keybind list, tooltip modification hooks, tile scanning helpers (Tile Scanner
// item), mod data containers on the world / player and small UI layout helpers.
// ---------------------------------------------------------------------------
'use strict';

// Text input: a single focused field at a time, driven from keydown events
const TextInput = {
  active: null, // { value, placeholder, max, onChange, onSubmit, onCancel, x, y, w }
  caret: 0,
  focus(o) { this.active = Object.assign({ value: '', placeholder: '', max: 40 }, o); this.caret = 0; },
  blur() { this.active = null; },
  isFocused(id) { return !!this.active && (!id || this.active.id === id); },
  // returns true if the key was consumed
  handleKey(e) {
    const a = this.active; if (!a) return false;
    if (e.code === 'Escape') { if (a.onCancel) a.onCancel(); this.blur(); return true; }
    if (e.code === 'Enter' || e.code === 'NumpadEnter') { if (a.onSubmit) a.onSubmit(a.value); if (!a.keepFocus) this.blur(); return true; }
    if (e.code === 'Backspace') { a.value = a.value.slice(0, -1); if (a.onChange) a.onChange(a.value); return true; }
    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) { if (a.value.length < a.max) { a.value += e.key; if (a.onChange) a.onChange(a.value); } return true; }
    return true; // swallow other keys while typing
  },
  draw(ctx, x, y, w, h, o) {
    // o: {id, value, placeholder, focused}
    const focused = o.focused != null ? o.focused : this.isFocused(o.id);
    ctx.fillStyle = focused ? 'rgba(30,40,70,0.95)' : 'rgba(20,20,40,0.85)'; roundRect(ctx, x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = focused ? '#ffe75a' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = focused ? 2 : 1; roundRect(ctx, x, y, w, h, 6); ctx.stroke();
    const v = focused ? this.active.value : (o.value || '');
    const show = v || (focused ? '' : (o.placeholder || ''));
    drawText(ctx, show + (focused && Math.floor(Date.now() / 500) % 2 === 0 ? '|' : ''), x + 8, y + (h - 16) / 2, { size: 15, color: v ? '#fff' : '#999', outline: null });
  },
};

// Keybinding registry: mods bind keys with a label; shown on the settings page
const ModKeys = {
  binds: [], // {code, label, fn, when}
  bind(code, label, fn) { this.binds.push({ code, label, fn }); },
  handle(game, e) { for (const b of this.binds) if (b.code === e.code) { b.fn(game, e); return true; } return false; },
  labelFor(code) { return code.replace('Key', '').replace('Digit', ''); },
};

// Tooltip modification hooks: fn(stack, item, lines, game) may push {t, c} lines
const TooltipHooks = { hooks: [], add(fn) { this.hooks.push(fn); }, apply(stack, item, lines, game) { for (const h of this.hooks) { try { h(stack, item, lines, game); } catch (e) {} } } };

// Tile scanning: count tiles/ores around a point
const TileScan = {
  count(world, cx, cy, r, ids) {
    const out = {}; const set = new Set(ids);
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { if (!world.inBounds(x, y)) continue; const id = world.tiles[x + y * world.w]; if (set.has(id)) out[id] = (out[id] || 0) + 1; }
    return out;
  },
  nearest(world, cx, cy, r, ids) {
    let best = null, bd = 1e9; const set = new Set(ids);
    for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { if (!world.inBounds(x, y)) continue; const id = world.tiles[x + y * world.w]; if (set.has(id)) { const d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = { x, y, id }; } } }
    return best;
  },
};
// Tile Scanner item: shows nearby ore counts & the nearest vein while held
const ORE_IDS = () => [T.COPPER, T.IRON, T.SILVER, T.GOLD, T.GEM, T.HELLSTONE].filter(x => x != null);
defItem('tile_scanner', { name: 'Tile Scanner', max: 1, rarity: 2, tooltip: 'Hold to scan the surrounding 30 tiles for ore (shows counts and the nearest vein)', drawIcon: (x) => { x.fillStyle = '#3a4a5a'; x.fillRect(3, 2, 10, 12); x.fillStyle = '#40ff80'; x.fillRect(5, 4, 6, 5); x.fillStyle = '#ffe060'; x.fillRect(6, 11, 4, 1); } });
ITEM_VALUES.tile_scanner = 20000; ITEMS.tile_scanner.value = 20000;
RECIPES.push({ result: 'tile_scanner', count: 1, station: 'anvil', ing: [['iron_bar', 6], ['lens', 2], ['gel', 5]] });
const ModLib = {
  // player stat modifier hooks: fn(player, pm, game) runs every tick right after the pet modifiers are computed
  playerModHooks: [],
  onPlayerMods(fn) { this.playerModHooks.push(fn); },
  applyPlayerMods(p, game) { for (const h of this.playerModHooks) h(p, p.pm, game); },
  // player-hurt hooks: fn(player, amount, game, kind, attacker)
  hurtHooks: [],
  onPlayerHurt(fn) { this.hurtHooks.push(fn); },
  // enemy-killed hooks: fn(game, enemy)
  killHooks: [],
  onEnemyKilled(fn) { this.killHooks.push(fn); },
  // incoming damage hooks: fn(player, amount, game, attacker) -> new amount (shields, resistances)
  incomingHooks: [],
  onIncoming(fn) { this.incomingHooks.push(fn); },
  modifyIncoming(p, amount, game, attacker) { if (p.pm && p.pm.modDr) amount = Math.round(amount * (1 - clamp(p.pm.modDr, -1, 0.8))); for (const h of this.incomingHooks) amount = h(p, amount, game, attacker); return amount; },
  // fatal-damage hooks: fn(player, game) -> true prevents the death
  fatalHooks: [],
  onFatal(fn) { this.fatalHooks.push(fn); },
  preventDeath(p, game) { for (const h of this.fatalHooks) if (h(p, game)) return true; return false; },
  // generic event bus for mod chatter (Starfarers, quests): emit('bossSpawn', boss) etc
  listeners: {},
  on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
  emit(ev, ...args) { for (const fn of this.listeners[ev] || []) { try { fn(...args); } catch (e) { console.error(e); } } },
  ensure(game) { const w = game.world, p = game.player; if (w && !w.modData) w.modData = {}; if (p && !p.modData) p.modData = {}; },
  world(game, key, init) { this.ensure(game); const md = game.world.modData; if (!md[key]) md[key] = typeof init === 'function' ? init() : (init || {}); return md[key]; },
  player(game, key, init) { this.ensure(game); const md = game.player.modData; if (!md[key]) md[key] = typeof init === 'function' ? init() : (init || {}); return md[key]; },
  // layout helper: stack rows of buttons in a column
  column(ctx, x, y, items, o = {}) {
    const rows = []; let yy = y;
    for (const it of items) { const w = o.w || measureText(ctx, it.label, o.size || 17) + 24; rows.push({ x: x - w / 2, y: yy, w, h: o.h || 26, item: it }); yy += (o.h || 26) + (o.gap || 6); }
    return rows;
  },
  drawScanner(game) {
    const p = game.player, sel = p.selectedItem;
    if (!sel || sel.id !== 'tile_scanner' || game.invOpen) return;
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, w = game.world;
    const ids = ORE_IDS(), counts = TileScan.count(w, p.tileX, p.tileY, 30, ids), near = TileScan.nearest(w, p.tileX, p.tileY, 30, ids);
    const lines = ids.map(id => `${TILES[id].name}: ${counts[id] || 0}`);
    if (near) lines.push(`Nearest: ${TILES[near.id].name} ${near.x - p.tileX > 0 ? '→' : '←'} ${Math.abs(near.x - p.tileX)}, ${near.y - p.tileY > 0 ? '↓' : '↑'} ${Math.abs(near.y - p.tileY)}`);
    const bw = 230, bh = 14 + lines.length * 18, bx = 20, by = H - 60 - bh;
    ctx.fillStyle = 'rgba(10,30,30,0.8)'; roundRect(ctx, bx, by, bw, bh, 8); ctx.fill();
    let y = by + 6; drawText(ctx, 'Tile Scanner', bx + 10, y - 22, { size: 14, color: '#40ff80' });
    for (const t of lines) { drawText(ctx, t, bx + 10, y, { size: 13, color: '#ddd' }); y += 18; }
    if (near) { const z = game.renderer.zoom; ctx.strokeStyle = '#40ff80'; ctx.lineWidth = 2; ctx.strokeRect((near.x * TILE - game.cam.x) * z, (near.y * TILE - game.cam.y) * z, TILE * z, TILE * z); }
  },
};

// --- library extensions used by the later mod batch ---------------------------------------------
Object.assign(ModLib, {
  // prototype patches applied once the game classes exist (runs before the Game is constructed)
  patches: [], patch(fn) { this.patches.push(fn); },
  // enemy spawn pickers: fn(game, type, ctx) -> type
  spawnHooks: [], onSpawnPick(fn) { this.spawnHooks.push(fn); }, pickSpawn(game, type, ctx) { for (const f of this.spawnHooks) type = f(game, type, ctx) || type; return type; },
  // extra worldgen passes: fn(world, rng)
  worldgenHooks: [], onWorldgen(fn) { this.worldgenHooks.push(fn); },
  // right-click hooks: fn(game) -> true when consumed. Early hooks run before NPC / tile interaction, late ones after
  rightHooks: [], lateRightHooks: [], onRightClick(fn) { this.rightHooks.push(fn); }, onRightClickLate(fn) { this.lateRightHooks.push(fn); },
  rightClick(game) { for (const f of this.rightHooks) if (f(game)) return true; return false; },
  rightClickLate(game) { for (const f of this.lateRightHooks) if (f(game)) return true; return false; },
  // UI buttons registered by mods: UI.button(x, y, w, h, 'mod_ui', { id, ... }) -> handler(game, data, button)
  uiHandlers: {}, onUiClick(id, fn) { this.uiHandlers[id] = fn; },
  uiClick(game, b, button) { if (b.id === 'mod_ui' && b.data && this.uiHandlers[b.data.id]) { this.uiHandlers[b.data.id](game, b.data, button); return true; } return false; },
  // extra settings pages: name -> draw(game)
  settingsPages: {}, settingsPage(name, draw) { this.settingsPages[name] = draw; },
  // progression helper: number of vanilla bosses beaten
  bossCount(game) { const d = (game.world && game.world.bossesDefeated) || {}; return Object.keys(d).filter(k => d[k]).length; },
  mechs(game) { const d = (game.world && game.world.bossesDefeated) || {}; return ['the_twins', 'the_destroyer', 'skeletron_prime'].filter(k => d[k]).length; },
  beaten(game, id) { const w = game.world; if (!w) return false; if (id === 'eye_of_cthulhu' || id === 'eye') return !!(w.bossDefeated || (w.bossesDefeated && w.bossesDefeated.eye_of_cthulhu)); if (id === 'skeletron') return !!(w.skeletronDefeated || (w.bossesDefeated && w.bossesDefeated.skeletron)); if (id === 'plantera') return !!(w.planteraDefeated || (w.bossesDefeated && w.bossesDefeated.plantera)); if (id === 'golem') return !!(w.golemDefeated || (w.bossesDefeated && w.bossesDefeated.golem)); if (id === 'moon_lord') return !!(w.moonLordDefeated || (w.bossesDefeated && w.bossesDefeated.moon_lord)); return !!(w.bossesDefeated && w.bossesDefeated[id]); },
  // accessory helpers
  accs(p) { return [...(p.accessories || []), ...Object.values(p.equipment || {})].filter(Boolean).map(a => ITEMS[a.id]); },
  hasAcc(p, id) { return [...(p.accessories || []), ...Object.values(p.equipment || {})].some(a => a && a.id === id); },
  nearestEnemy(game, x, y, r) { let t = null, bd = r; for (const e of game.enemies) { if (e.dead) continue; const d = dist(e.cx, e.cy, x, y); if (d < bd) { bd = d; t = e; } } return t; },
});
TooltipHooks.lateHooks = []; TooltipHooks.addLate = function (fn) { this.lateHooks.push(fn); }; TooltipHooks.finalize = function (lines, game, slot, item) { for (const h of this.lateHooks) { try { h(lines, game, slot, item); } catch (e) {} } };
ModLib.on('projHit', (g, b, e) => { if (b.onHit) b.onHit(g, b, e); });
window.addEventListener('DOMContentLoaded', () => { for (const f of ModLib.patches) { try { f(); } catch (e) { console.error('mod patch failed', e); } } });
