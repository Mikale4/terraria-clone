// ---------------------------------------------------------------------------
// Concise Mods List: a compact registry of every mod adaptation in the game
// with one row per mod. Left click a row to toggle the mod, right click to open
// its config, middle click to show its description; a button exports the list
// of enabled mods as text. Mods register themselves with ModList.register and
// gate their features on ModList.on(id) where a toggle makes sense.
// ---------------------------------------------------------------------------
'use strict';

const ModList = {
  mods: [], byId: {}, saved: {}, cfgMod: null, scroll: 0, showDesc: null,
  load() { try { this.saved = JSON.parse(localStorage.getItem('modlist_cfg') || '{}'); } catch (e) { this.saved = {}; } },
  save() { try { const o = {}; for (const m of this.mods) o[m.id] = { enabled: m.enabled, cfg: m.cfgState || {} }; localStorage.setItem('modlist_cfg', JSON.stringify(o)); } catch (e) {} },
  // o: { desc, cfg: [{ key, label(get), get, set }], toggle(on), builtin }
  register(id, name, o = {}) {
    if (this.byId[id]) return this.byId[id];
    const sv = this.saved[id] || {};
    const m = { id, name, desc: o.desc || '', cfg: o.cfg || [], toggle: o.toggle || null, builtin: !!o.builtin, enabled: (this.core && this.core.has(id)) ? true : sv.enabled == null ? (o.enabled !== false) : sv.enabled, cfgState: sv.cfg || {}, workshop: o.workshop || null };
    this.mods.push(m); this.byId[id] = m;
    if (m.toggle) { try { m.toggle(m.enabled); } catch (e) {} }
    // saved config values are pushed back into the mod's setters
    for (const c of m.cfg) if (c.key && m.cfgState[c.key] !== undefined && c.set) { try { c.set(m.cfgState[c.key]); } catch (e) {} }
    return m;
  },
  on(id) { const m = this.byId[id]; return !m || m.enabled; },
  // config helper: a boolean option stored on the mod's cfg object
  bool(obj, key, label) { return { key, label: () => `${label}: ${obj[key] ? 'On' : 'Off'}`, get: () => obj[key], set: (v) => { obj[key] = !!v; }, click: () => { obj[key] = !obj[key]; return obj[key]; } }; },
  cycle(obj, key, label, values, names) { return { key, label: () => `${label}: ${names ? names[values.indexOf(obj[key])] : obj[key]}`, get: () => obj[key], set: (v) => { obj[key] = v; }, click: () => { obj[key] = values[(values.indexOf(obj[key]) + 1) % values.length]; return obj[key]; } }; },
  setEnabled(m, on) { m.enabled = on; if (m.toggle) { try { m.toggle(on); } catch (e) {} } this.save(); },
  exportText() { return this.mods.filter(m => m.enabled).map(m => m.name + (m.workshop ? ` (${m.workshop})` : '')).join('\n'); },
  // --- the concise panel: a framed grid of square mod tiles with a search box, scrollbar and tooltips
  filter: '', scrollRow: 0, hover: null,
  visible() { const f = (this.filter || '').toLowerCase().trim(); return f ? this.mods.filter(m => m.name.toLowerCase().includes(f) || (m.desc || '').toLowerCase().includes(f)) : this.mods; },
  layout(game) { const W = game.renderer.W, H = game.renderer.H; const pw = Math.min(W - 24, 760), ph = Math.min(H - 24, 660); const px = Math.round(W / 2 - pw / 2), py = Math.round(H / 2 - ph / 2); const tile = 64, gap = 8; const gx = px + 18, gy = py + 82, gw = pw - 18 - 34; const cols = Math.max(1, Math.floor((gw + gap) / (tile + gap))); const rows = Math.max(1, Math.floor((ph - 82 - 56) / (tile + gap))); return { W, H, pw, ph, px, py, tile, gap, gx, gy, gw, cols, rows }; },
  wheel(dy) { this.scrollRow = Math.max(0, this.scrollRow + (dy > 0 ? 1 : -1)); },
  drawIcon(ctx, m, x, y, size) {
    const ic = m.icon || MOD_ICONS[m.id];
    ctx.save(); ctx.translate(x, y);
    if (typeof ic === 'function') { ctx.scale(size / 16, size / 16); ic(ctx); }
    else if (typeof ic === 'string' && Sprites.icons[ic]) { ctx.imageSmoothingEnabled = false; ctx.drawImage(Sprites.icons[ic], 0, 0, size, size); }
    else { ctx.fillStyle = '#4a5aa0'; ctx.fillRect(0, 0, size, size); drawText(ctx, m.name.slice(0, 2).toUpperCase(), size / 2, size / 2 - 9, { size: 16, align: 'center', color: '#fff', outline: null }); }
    ctx.restore();
  },
  draw(game) {
    const ctx = game.renderer.ctx, mouse = game.mouse, L = this.layout(game); const { W, H, pw, ph, px, py, tile, gap, gx, gy, cols, rows } = L;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    if (this.cfgMod) return this.drawCfg(game);
    // frame
    ctx.fillStyle = 'rgba(28,36,92,0.96)'; roundRect(ctx, px, py, pw, ph, 12); ctx.fill(); ctx.strokeStyle = '#8fa2e6'; ctx.lineWidth = 3; roundRect(ctx, px, py, pw, ph, 12); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; roundRect(ctx, px + 3, py + 3, pw - 6, ph - 6, 10); ctx.stroke();
    // title pill
    const tw = 190; ctx.fillStyle = '#3c4fb0'; roundRect(ctx, W / 2 - tw / 2, py - 16, tw, 40, 20); ctx.fill(); ctx.strokeStyle = '#a8b8ff'; ctx.lineWidth = 3; roundRect(ctx, W / 2 - tw / 2, py - 16, tw, 40, 20); ctx.stroke(); drawText(ctx, 'Mods List', W / 2, py - 11, { size: 24, align: 'center', color: '#fff' });
    // search box + counter
    const sw = Math.min(220, pw - 200); TextInput.draw(ctx, px + 18, py + 40, sw, 28, { id: 'modlist_search', value: this.filter, placeholder: 'Type to search' }); this.btn(game, px + 18, py + 40, sw, 28, 'modlist_search', null);
    const on = this.mods.filter(m => m.enabled).length; drawText(ctx, `${on}/${this.mods.length} enabled`, px + pw - 18, py + 46, { size: 15, align: 'right', color: '#c8d0ff' });
    // grid
    const list = this.visible(); const totalRows = Math.ceil(list.length / cols); this.scrollRow = clamp(this.scrollRow, 0, Math.max(0, totalRows - rows));
    const ctrl = game.keys.has('ControlLeft') || game.keys.has('ControlRight'); this.hover = null;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = (this.scrollRow + r) * cols + c; if (i >= list.length) break; const m = list[i];
      const x = gx + c * (tile + gap), y = gy + r * (tile + gap);
      const hov = mouse.x >= x && mouse.x < x + tile && mouse.y >= y && mouse.y < y + tile; if (hov) this.hover = { m, x, y };
      ctx.fillStyle = m.enabled ? 'rgba(70,90,190,0.9)' : 'rgba(40,46,80,0.9)'; roundRect(ctx, x, y, tile, tile, 8); ctx.fill();
      ctx.globalAlpha = m.enabled ? 1 : 0.35; this.drawIcon(ctx, m, x + 12, y + 12, tile - 24); ctx.globalAlpha = 1;
      if (!m.enabled) { ctx.strokeStyle = 'rgba(255,80,80,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 14, y + 14); ctx.lineTo(x + tile - 14, y + tile - 14); ctx.moveTo(x + tile - 14, y + 14); ctx.lineTo(x + 14, y + tile - 14); ctx.stroke(); }
      else { ctx.fillStyle = '#40d060'; ctx.beginPath(); ctx.arc(x + 11, y + tile - 11, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#103018'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 7, y + tile - 11); ctx.lineTo(x + 10, y + tile - 8); ctx.lineTo(x + 15, y + tile - 15); ctx.stroke(); }
      if (m.cfg.length) { ctx.fillStyle = '#2c3670'; ctx.beginPath(); ctx.arc(x + tile - 11, y + 11, 8, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#c8d0ff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + tile - 11, y + 11, 4, 0, Math.PI * 2); ctx.stroke(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x + tile - 11 + Math.cos(a) * 4, y + 11 + Math.sin(a) * 4); ctx.lineTo(x + tile - 11 + Math.cos(a) * 7, y + 11 + Math.sin(a) * 7); ctx.stroke(); } }
      ctx.strokeStyle = hov ? '#ffb040' : 'rgba(150,170,255,0.45)'; ctx.lineWidth = hov ? 3 : 1.5; roundRect(ctx, x, y, tile, tile, 8); ctx.stroke();
      this.btn(game, x, y, tile, tile, 'modlist_row', this.mods.indexOf(m));
    }
    if (!list.length) drawText(ctx, 'No mods match that search.', W / 2, gy + 20, { size: 16, align: 'center', color: '#c8d0ff' });
    // scrollbar
    const sbx = px + pw - 30, sby = gy, sbh = rows * (tile + gap) - gap; ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, sbx, sby, 12, sbh, 6); ctx.fill();
    if (totalRows > rows) { const th = Math.max(24, sbh * rows / totalRows), ty = sby + (sbh - th) * this.scrollRow / (totalRows - rows); ctx.fillStyle = '#8fa2e6'; roundRect(ctx, sbx + 2, ty, 8, th, 4); ctx.fill(); this.btn(game, sbx - 4, sby, 20, sbh / 2, 'modlist_scroll', -1); this.btn(game, sbx - 4, sby + sbh / 2, 20, sbh / 2, 'modlist_scroll', 1); }
    // bottom buttons
    const by = py + ph - 44; const buttons = [['Disable All', 'modlist_none', '#ff6060'], ['Enable All', 'modlist_all', '#60ff80'], ['Force Reload', 'modlist_reload', '#c8d0ff'], ['Export', 'modlist_export', '#fff'], ['Back', 'modlist_back', '#fff']];
    const bw = Math.floor((pw - 36 - (buttons.length - 1) * 8) / buttons.length); let bx = px + 18;
    for (const [label, id, col] of buttons) { const hov = mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + 30; ctx.fillStyle = hov ? 'rgba(255,230,90,0.25)' : 'rgba(0,0,0,0.35)'; roundRect(ctx, bx, by, bw, 30, 6); ctx.fill(); ctx.strokeStyle = 'rgba(150,170,255,0.5)'; ctx.lineWidth = 1; roundRect(ctx, bx, by, bw, 30, 6); ctx.stroke(); drawText(ctx, label, bx + bw / 2, by + 6, { size: bw < 120 ? 13 : 15, align: 'center', color: hov ? '#ffe75a' : col }); this.btn(game, bx, by, bw, 30, id, null); bx += bw + 8; }
    // tooltip
    if (this.hover) {
      const m = this.hover.m; const tl = [{ t: m.name, c: '#ffe75a', size: 18 }]; if (MOD_AUTHORS[m.id]) tl.push({ t: `By: ${MOD_AUTHORS[m.id]}`, c: '#e0e0f0' }); tl.push(ModList.core.has(m.id) ? { t: 'Core library - always on', c: '#c8d0ff' } : { t: m.enabled ? 'Enabled - left click to disable' : 'Disabled - left click to enable', c: m.enabled ? '#80ff90' : '#ff9090' }); tl.push({ t: m.cfg.length ? 'Right click to open config' : 'No config', c: '#c8d0ff' }); if (!ctrl) tl.push({ t: 'Hold Ctrl to see more info', c: '#c8d0ff' }); else { for (const l of wrapText(ctx, m.desc || 'No description.', 360, 14)) tl.push({ t: l, c: '#ddd', size: 14 }); if (m.workshop) tl.push({ t: `Steam Workshop id ${m.workshop}`, c: '#aaa', size: 13 }); }
      let w = 0; for (const l of tl) w = Math.max(w, measureText(ctx, l.t, l.size || 15) + 24); const h = tl.reduce((a, l) => a + (l.size || 15) + 6, 12); let x = mouse.x + 18, y = mouse.y + 18; if (x + w > W - 8) x = mouse.x - w - 8; if (y + h > H - 8) y = H - 8 - h;
      ctx.fillStyle = 'rgba(20,24,64,0.96)'; roundRect(ctx, x, y, w, h, 8); ctx.fill(); ctx.strokeStyle = '#8fa2e6'; ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, 8); ctx.stroke(); let ly = y + 6; for (const l of tl) { drawText(ctx, l.t, x + 12, ly, { size: l.size || 15, color: l.c }); ly += (l.size || 15) + 6; }
    }
  },
  drawCfg(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse, m = this.cfgMod; const L = this.layout(game); const { pw, ph, px, py } = L;
    ctx.fillStyle = 'rgba(28,36,92,0.96)'; roundRect(ctx, px, py, pw, ph, 12); ctx.fill(); ctx.strokeStyle = '#8fa2e6'; ctx.lineWidth = 3; roundRect(ctx, px, py, pw, ph, 12); ctx.stroke();
    const tw = Math.max(190, measureText(ctx, m.name, 22) + 40); ctx.fillStyle = '#3c4fb0'; roundRect(ctx, W / 2 - tw / 2, py - 16, tw, 40, 20); ctx.fill(); ctx.strokeStyle = '#a8b8ff'; roundRect(ctx, W / 2 - tw / 2, py - 16, tw, 40, 20); ctx.stroke(); drawText(ctx, m.name, W / 2, py - 10, { size: 22, align: 'center', color: '#fff' });
    this.drawIcon(ctx, m, px + 24, py + 40, 48);
    let y = py + 40; const dl = m.desc ? wrapText(ctx, m.desc, pw - 110, 14) : []; for (const l of dl) { drawText(ctx, l, px + 84, y, { size: 14, color: '#c8d0ff' }); y += 18; } if (MOD_AUTHORS[m.id]) { drawText(ctx, `By: ${MOD_AUTHORS[m.id]}`, px + 84, y, { size: 14, color: '#e0e0f0' }); y += 18; }
    y = Math.max(y + 16, py + 110);
    const rows = [{ label: () => `Mod enabled: ${m.enabled ? 'On' : 'Off'}`, click: () => this.setEnabled(m, !m.enabled) }, ...m.cfg];
    rows.forEach((c, i) => { const label = c.label(); const w = Math.max(260, measureText(ctx, label, 17) + 30), x = W / 2 - w / 2; const hov = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + 28; ctx.fillStyle = hov ? 'rgba(255,230,90,0.25)' : 'rgba(0,0,0,0.35)'; roundRect(ctx, x, y, w, 28, 6); ctx.fill(); ctx.strokeStyle = 'rgba(150,170,255,0.5)'; ctx.lineWidth = 1; roundRect(ctx, x, y, w, 28, 6); ctx.stroke(); drawText(ctx, label, W / 2, y + 5, { size: 17, align: 'center', color: hov ? '#ffe75a' : '#fff' }); this.btn(game, x, y, w, 28, 'modlist_cfg', i); y += 34; });
    if (m.cfg.length === 0) drawText(ctx, 'This mod has no options.', W / 2, y + 4, { size: 15, align: 'center', color: '#c8d0ff' });
    const by = py + ph - 44, bw = 180, bx = W / 2 - bw / 2; const hov = mouse.x >= bx && mouse.x <= bx + bw && mouse.y >= by && mouse.y <= by + 30;
    ctx.fillStyle = hov ? 'rgba(255,230,90,0.25)' : 'rgba(0,0,0,0.35)'; roundRect(ctx, bx, by, bw, 30, 6); ctx.fill(); ctx.strokeStyle = 'rgba(150,170,255,0.5)'; roundRect(ctx, bx, by, bw, 30, 6); ctx.stroke(); drawText(ctx, 'Back to list', W / 2, by + 6, { size: 15, align: 'center', color: hov ? '#ffe75a' : '#fff' }); this.btn(game, bx, by, bw, 30, 'modlist_cfgback', null);
  },
  btn(game, x, y, w, h, id, data) { UI.button(x, y, w, h, 'mod_ui', { id, data }); },
  click(game, data, button) {
    Audio_.play('menu');
    switch (data.id) {
      case 'modlist_row': { const m = this.mods[data.data]; if (!m) return; if (button === 2) { this.cfgMod = m; TextInput.blur(); } else this.setEnabled(m, !m.enabled); break; }
      case 'modlist_search': TextInput.focus({ id: 'modlist_search', value: this.filter || '', placeholder: 'Type to search', max: 30, keepFocus: true, onChange: (v) => { this.filter = v; this.scrollRow = 0; }, onSubmit: () => TextInput.blur() }); break;
      case 'modlist_scroll': this.scrollRow = Math.max(0, this.scrollRow + data.data); break;
      case 'modlist_export': { const t = this.exportText(); try { navigator.clipboard.writeText(t); game.message('Enabled mod list copied to the clipboard.', '#c0ffc0'); } catch (e) { game.message('Could not access the clipboard.', '#ff8080'); } console.log(t); break; }
      case 'modlist_all': for (const m of this.mods) if (!m.enabled) this.setEnabled(m, true); break;
      case 'modlist_none': for (const m of this.mods) if (m.enabled && m.id !== 'concise_mods_list') this.setEnabled(m, false); break;
      case 'modlist_reload': this.save(); if (game.state === 'play' && typeof SaveSystem !== 'undefined' && SaveSystem.save) { try { SaveSystem.save(game); } catch (e) {} } location.reload(); break;
      case 'modlist_back': this.showDesc = null; TextInput.blur(); if (game.state === 'title') { UI.modsOpen = false; game.showTitle(); } else UI.settingsPage = 'mods'; break;
      case 'modlist_cfg': { const m = this.cfgMod; const rows = [{ click: () => this.setEnabled(m, !m.enabled) }, ...m.cfg]; const c = rows[data.data]; if (c) { const v = c.click(); if (c.key) { m.cfgState[c.key] = c.get ? c.get() : v; } this.save(); } break; }
      case 'modlist_cfgback': this.cfgMod = null; break;
    }
  },
};
// tile icons (item id or a 16x16 painter) and authors from the workshop pages
const MOD_ICONS = {
  concise_mods_list: (x) => { x.fillStyle = '#3c4fb0'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#c8d0ff'; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) x.fillRect(1 + c * 5, 1 + r * 5, 4, 4); },
  start_with_base: (x) => { x.fillStyle = '#8a6038'; x.fillRect(1, 7, 14, 8); x.fillStyle = '#c04040'; x.beginPath(); x.moveTo(0, 8); x.lineTo(8, 1); x.lineTo(16, 8); x.closePath(); x.fill(); x.fillStyle = '#4a3020'; x.fillRect(6, 10, 4, 5); x.fillStyle = '#ffe080'; x.fillRect(2, 9, 3, 3); x.fillRect(11, 9, 3, 3); },
  biome_titles: (x) => { x.fillStyle = '#2f7a2f'; x.fillRect(0, 9, 16, 7); x.fillStyle = '#4d8fdc'; x.fillRect(0, 0, 16, 9); x.fillStyle = '#fff'; x.fillRect(3, 3, 10, 2); x.fillRect(5, 6, 6, 1); },
  gensokyo: 'yin_yang_orb', armed_zombies: 'iron_broadsword', accessories_plus: 'cobalt_shield', expert_slot: 'mastery_shard', consolaria: 'lepus_mask', auto_fisher: 'auto_fisher', calamity_fables: 'fable_page_1', split: 'camera', thorium: 'thunderbird_mask', fargos_mutant: 'mutant_plushie', wotg: 'deity_mask', subworld_library: 'world_token', structure_helper: 'structure_wand', serous_common: 'tile_scanner', stars_above: 'starfarers_blade',
  luminance: (x) => { x.fillStyle = '#101030'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#ffe080'; x.fillRect(7, 2, 2, 12); x.fillRect(2, 7, 12, 2); x.fillStyle = '#fff'; x.fillRect(6, 6, 4, 4); },
  authentic_races: (x) => { x.fillStyle = '#f2c6a0'; x.fillRect(4, 1, 8, 8); x.fillStyle = '#6a4a8a'; x.fillRect(3, 9, 10, 7); x.fillStyle = '#e04060'; x.fillRect(2, 0, 3, 4); x.fillRect(11, 0, 3, 4); x.fillStyle = '#000'; x.fillRect(6, 4, 1, 2); x.fillRect(9, 4, 1, 2); },
  calamity: 'wulfrum_helmet', pets_overhaul: 'pet_food', qwerty_bosses: 'rhuthinium_ore', ophioid: 'infested_compost', corruption_core: 'shadow_heart', jimbos_desert: 'prickly_pear', summoner_pp: 'bone_saw_sentry', more_whip_classic: 'stardust_whip', whip_armors: 'monks_shirt', whip_accessories: 'ghostly_grip', evil_summoner: 'mother_of_creepers', ore_helmets_summoner: 'cobalt_hood', ophidiomancy: 'cobra_staff', goose_vanilla: 'gel_mace', starting_class_weapons: 'wooden_dagger', wood_armor_bonuses: 'ebonwood',
  niol_accessories: 'magic_cuffs', adv_acc_combos: 'celestial_shield', wings_bonuses: 'harpy_wings', visual_accessories: 'star_cloak', potion_slots: 'lesser_healing', auto_quick_heal: 'greater_healing', bank_buttons: 'piggy_bank', teleport_map_death: 'tombstone', gravity_no_flip: 'gravitation_potion',
  alt_gem_staffs: 'ruby_staff', full_weapons_overhaul: 'shotgun', koishi_rework: 'nebula_rift', armament_display: 'gold_broadsword', fish_guns: 'bass_rifle',
  more_obtaining_tooltips: (x) => { x.fillStyle = '#20204a'; x.fillRect(1, 1, 14, 14); x.fillStyle = '#c8d0ff'; x.fillRect(3, 3, 10, 2); x.fillRect(3, 7, 8, 1); x.fillRect(3, 10, 9, 1); x.fillRect(3, 13, 6, 1); },
  tooltip_icon: (x) => { x.fillStyle = '#20204a'; x.fillRect(1, 1, 14, 14); x.fillStyle = '#ffe080'; x.fillRect(3, 4, 3, 3); x.fillRect(3, 9, 3, 3); x.fillStyle = '#c8d0ff'; x.fillRect(7, 4, 6, 2); x.fillRect(7, 9, 6, 2); },
  nterra_utils: (x) => { x.fillStyle = '#2c3670'; x.fillRect(0, 4, 16, 12); x.fillStyle = '#ffe75a'; x.fillRect(1, 1, 5, 4); x.fillStyle = '#4a5aa0'; x.fillRect(7, 1, 4, 4); x.fillRect(12, 1, 3, 4); },
  vein_mining: 'iron_ore', plentiful_ores: 'gold_ore', wombat_improvements: 'wood', demolitionist_potions: 'mining_potion', merchant_baits: 'master_bait', enemy_biome_crates: 'jungle_crate', vanilla_fishing_expansion: 'zenith_fishing_rod',
  better_friendly_npcs: (x) => { x.fillStyle = '#f2c6a0'; x.fillRect(5, 0, 6, 6); x.fillStyle = '#2a6a9a'; x.fillRect(4, 6, 8, 6); x.fillStyle = '#3a3a4a'; x.fillRect(4, 12, 3, 4); x.fillRect(9, 12, 3, 4); x.fillStyle = '#80a0ff'; x.fillRect(12, 4, 3, 8); },
  enraged_townsfolk: (x) => { x.fillStyle = '#ff4040'; x.fillRect(2, 2, 12, 12); x.fillStyle = '#f2c6a0'; x.fillRect(5, 0, 6, 6); x.fillStyle = '#7a3a3a'; x.fillRect(4, 6, 8, 6); x.fillStyle = '#3a3a4a'; x.fillRect(4, 12, 3, 4); x.fillRect(9, 12, 3, 4); },
  terraguardians: (x) => { x.fillStyle = '#4a78d0'; x.fillRect(3, 6, 10, 8); x.fillRect(4, 2, 3, 5); x.fillRect(9, 2, 3, 5); x.fillStyle = '#c0d8ff'; x.fillRect(5, 9, 6, 4); x.fillStyle = '#ffe060'; x.fillRect(5, 7, 2, 2); x.fillRect(9, 7, 2, 2); },
  pets_overhaul_calamity: 'bone_rattle', violent_verdure: 'bogbud_3', more_shimmer: 'aetherium_block',
};
const MOD_AUTHORS = { start_with_base: 'Terraria clone', concise_mods_list: 'Cyrilly', gensokyo: 'Kori', thorium: 'DivermanSam', fargos_mutant: 'Fargowilta', wotg: 'Lucille Karma', subworld_library: 'John Snail', structure_helper: 'ScalarVector', serous_common: 'absoluteAquarian', stars_above: 'PaperLuigi', luminance: 'Lucille Karma', calamity: 'The Calamity Dev Team', pets_overhaul: 'Pearlie', qwerty_bosses: 'qwerty3.14 and many contributors', ophioid: 'Kranot, IDGCaptainRussia & Rijam', corruption_core: 'BlockCrusader', jimbos_desert: 'Jimbo Animations', summoner_pp: 'Eyad', more_whip_classic: 'AlexForce', whip_armors: 'Math!EW!', whip_accessories: 'Artistic', evil_summoner: 'Yzaz', ore_helmets_summoner: 'JBame', ophidiomancy: 'CrimSnek', goose_vanilla: 'TheGoose444', starting_class_weapons: 'thebaggutegamer', wood_armor_bonuses: 'TheLoneGamer', niol_accessories: 'niol', adv_acc_combos: 'Qucumberman', wings_bonuses: 'nezumi', visual_accessories: 'Maple, Reika', potion_slots: 'Dice', auto_quick_heal: 'Mašina', bank_buttons: 'patman', teleport_map_death: 'awakeOrSleep', gravity_no_flip: 'Cyrilly', alt_gem_staffs: 'Kire Leag', full_weapons_overhaul: 'Aurora_Spirit', koishi_rework: 'beihai', armament_display: 'Cyrilly', fish_guns: 'Gnose', more_obtaining_tooltips: 'Guida', tooltip_icon: 'Nil256', nterra_utils: 'Nakano15', vein_mining: 'Dissary', plentiful_ores: 'valkyrienyanko', wombat_improvements: 'Wombat', demolitionist_potions: 'phuder123', enemy_biome_crates: 'Pointy Orb', vanilla_fishing_expansion: 'No SrKuaker', terraguardians: 'Nakano15', pets_overhaul_calamity: 'Pearlie', violent_verdure: 'Violytta Ran', more_shimmer: 'Atomic Ant' };
ModList.load();
ModLib.settingsPage('modlist', (g) => ModList.draw(g));
for (const id of ['modlist_row', 'modlist_search', 'modlist_scroll', 'modlist_export', 'modlist_reload', 'modlist_all', 'modlist_none', 'modlist_back', 'modlist_cfg', 'modlist_cfgback']) ModLib.onUiClick(id, (g, d, b) => ModList.click(g, d, b));

// the mods that were already part of the game register here (their options live on their cfg objects)
ModList.register('concise_mods_list', 'Concise Mods List', { workshop: 3001692619, desc: 'This screen: one row per mod, click to toggle, right click for config, export the enabled list as text.', builtin: true });
ModList.register('biome_titles', 'Biome Titles', { builtin: true, desc: 'Shows the name of the biome you enter as a title card.' });
ModList.register('start_with_base', 'Start with base', { builtin: true, desc: 'Pick a starter base at world creation (row houses, tower, apartments, bunker or pyramid, with your choice of blocks and walls, hellevator and rest outposts) and start the world with one valid house per town NPC.' });
ModList.register('gensokyo', 'Gensokyo', { builtin: true, desc: 'Touhou danmaku, fairies, Rumia and the Shrine Maiden.' });
ModList.register('armed_zombies', 'Armed Zombies!', { builtin: true, desc: 'Humanoid undead pick up weapons and armor.', cfg: [ModList.bool(ArmedZombies.cfg, 'enabled', 'Armed enemies'), ModList.bool(ArmedZombies.cfg, 'windup', 'Attack windup'), ModList.bool(ArmedZombies.cfg, 'healing', 'Survival healing'), ModList.bool(ArmedZombies.cfg, 'scared', 'Scared when hurt'), ModList.bool(ArmedZombies.cfg, 'stagger', 'Stagger on hit')] });
ModList.register('accessories_plus', 'Accessories+', { builtin: true, desc: 'Dedicated boots / shield / wings slots and stat lines on accessories.' });
ModList.register('expert_slot', 'Expert/Master Slot', { builtin: true, desc: 'The extra accessory slot in Expert and Master worlds.' });
ModList.register('consolaria', 'Consolaria', { builtin: true, desc: 'Console and mobile exclusives: Lepus, Vampire Miner, holidays, Mc MoneyPants.', cfg: [ModList.cycle(Holidays.cfg, 'mode', 'Holiday events', ['date', 'always'], ['By real date', 'Always active'])] });
ModList.register('auto_fisher', 'Auto Fisher', { builtin: true, desc: 'The Auto Fisher accessory: casts, reels, filters junk, opens crates and sells fish for you.', cfg: [ModList.bool(Fishing.cfg, 'autoCast', 'Auto cast'), ModList.bool(Fishing.cfg, 'autoReel', 'Auto reel'), ModList.bool(Fishing.cfg, 'filterJunk', 'Filter junk'), ModList.bool(Fishing.cfg, 'openCrates', 'Auto open crates'), ModList.bool(Fishing.cfg, 'autoSell', 'Auto sell fish'), ModList.bool(Fishing.cfg, 'noBait', 'Infinite bait'), ModList.bool(Fishing.cfg, 'fishInWater', 'Fish while swimming'), ModList.bool(Fishing.cfg, 'info', 'Info panel')] });
ModList.register('calamity_fables', 'Calamity Fables', { builtin: true, desc: 'The Wanderer and his stylish quest dialogs, mineshafts and watchtowers.' });
ModList.register('split', 'Split', { builtin: true, desc: 'Photography, the Shutterbug and Mana Overload.', cfg: [ModList.bool(ManaOverload.cfg, 'enabled', 'Mana Overload')] });
ModList.register('thorium', 'Thorium', { builtin: true, desc: 'Bard, Healer and Thrower classes, the Grand Thunder Bird and the Cook.' });
ModList.register('fargos_mutant', "Fargo's Mutant Mod", { builtin: true, desc: 'The Mutant and Lumberjack, infinite ammo / potion stacks, instabuilds, the Super Dummy.' });
ModList.register('wotg', 'Calamity: Wrath of the Gods', { builtin: true, desc: 'Solyn, the Eternal Garden and the Nameless Deity.' });
ModList.register('subworld_library', 'Subworld Library', { builtin: true, desc: 'The subworld framework used by the Eternal Garden and Asteroid Field.' });
ModList.register('structure_helper', 'Structure Helper', { builtin: true, desc: 'Structure Wand / Placer, exported structures placed at worldgen.' });
ModList.register('serous_common', 'SerousCommonLib', { builtin: true, desc: 'The shared mod library: text inputs, keybinds, tooltip hooks, mod data.' });
ModList.register('stars_above', 'The Stars Above', { builtin: true, desc: 'The Starfarers, the Stellar Array and the Vagrant of Space and Time.' });
ModList.register('luminance', 'Luminance', { builtin: true, desc: 'Screen shake, flashes, telegraphs, trails and glows.', cfg: [ModList.cycle(FX.cfg, 'intensity', 'Effect intensity', [1, 0.5, 0], ['Full', 'Reduced', 'Off'])] });
ModList.register('authentic_races', "MrPlague's Authentic Races", { builtin: true, desc: 'Playable races with their own abilities (Z).' });
ModList.register('calamity', 'Calamity Mod', { builtin: true, desc: 'Revengeance / Death, Rage and Adrenaline, Wulfrum gear and the Desert Scourge.' });
ModList.register('pets_overhaul', 'Pets Overhaul', { builtin: true, desc: 'Pets with stats, light pets, pet abilities.' });

// --- shared item helpers for the mod batch ------------------------------------------------------
// weapon in any class handled by Weapons.use (same rules as the catalog table)
function defModWeapon(id, name, cls, dmg, use, kb, rarity, value, extra = {}) {
  const shape = cls === 'gun' || cls === 'launcher' ? 'gun' : cls === 'bow' ? 'bow' : cls === 'yoyo' ? 'yoyo' : cls === 'flail' ? 'flail' : cls === 'spear' ? 'spear' : cls === 'summon' || cls === 'magic' ? (extra.minion ? 'staff' : 'book') : cls === 'whip' ? 'spear' : 'box';
  const col = extra.color || (extra.minion && extra.minion.color) || (extra.swingProj && extra.swingProj.color) || '#c0c0c8';
  const kindName = cls === 'bow' || cls === 'gun' || cls === 'launcher' ? 'ranged' : cls === 'magic' ? 'magic' : cls === 'summon' || cls === 'whip' ? 'summon' : 'melee';
  const props = Object.assign({ name, max: 1, damage: dmg, useTime: use, knockback: kb, rarity, wclass: cls, tooltip: `${dmg} ${kindName} damage${extra.manaCost ? `. Uses ${extra.manaCost} mana` : ''}${cls === 'bow' ? '. Uses arrows' : cls === 'gun' ? '. Uses bullets' : cls === 'launcher' ? '. Uses rockets' : cls === 'summon' ? '. Summons a minion to fight for you' : cls === 'whip' ? '. Tags enemies so minions deal extra damage' : ''}${extra.desc ? '. ' + extra.desc : ''}` }, extra);
  delete props.desc;
  if (cls === 'bow' || cls === 'gun' || cls === 'launcher') props.ammoKind = props.ammoKind || (cls === 'bow' ? 'arrow' : cls === 'gun' ? 'bullet' : 'rocket');
  if (cls === 'sword') { props.sword = 'broad'; delete props.wclass; if (!props.icon && !props.drawIcon) props.icon = { kind: 'sword', mat: extra.mat || 'gold' }; }
  else { props.use = (g, s, i) => Weapons.use(g, s, i); if (!props.drawIcon) props.drawIcon = genericIcon(col, extra.hi || '#fff', shape); }
  if (cls === 'magic') props.magic = false;
  CAT(id, props, value);
  if (extra.recipe) RECIPES.push({ result: id, count: 1, station: extra.station || 'anvil', ing: extra.recipe });
  return ITEMS[id];
}
// armor set with custom piece names / defense / per-piece and set bonuses
function defModArmorSet(set, name, o) {
  // o: { pieces: [[id, name, slot, defense, extraProps]], mat, rarity, recipe: [[bar, count]] per piece, bonus(p, pm, g), desc, station, value, cost:[h,b,l] }
  const pieces = o.pieces || [[`${set}_helmet`, `${name} Helmet`, 'head', o.def[0]], [`${set}_breastplate`, `${name} Breastplate`, 'body', o.def[1]], [`${set}_leggings`, `${name} Leggings`, 'legs', o.def[2]]];
  if (o.colors) MATERIALS[set] = { M: o.colors[0], m: o.colors[1], d: o.colors[2] };
  pieces.forEach(([id, nm, slot, d, extra], i) => {
    if (!ITEMS[id]) defArmor(id, nm, slot, o.colors ? set : (o.mat || 'gold'), d, o.rarity || 1);
    const it = ITEMS[id]; it.set = set; it.defense = d; if (extra) Object.assign(it, extra);
    it.tooltip = `${d} defense${extra && extra.desc ? '. ' + extra.desc : ''}${o.desc ? '. Set bonus: ' + o.desc : ''}`;
    ITEM_VALUES[id] = o.value || 20000; it.value = ITEM_VALUES[id];
    if (o.bar) { const cst = o.cost && o.cost[i] != null ? o.cost[i] : [10, 20, 15][i % 3]; RECIPES.push({ result: id, count: 1, station: o.station || 'anvil', ing: [[o.bar, cst], ...(o.extra || [])] }); }
    if (o.icon) it.icon = o.icon;
  });
  ARMOR_SETS[set] = { name, bonus: o.bonus, desc: o.desc };
}
// per-piece armor bonuses (helmets that change the set's role, wood armor tweaks ...)
const ARMOR_PIECE_MODS = {};
ModLib.onPlayerMods((p, pm, g) => { for (const a of p.armor) if (a && ARMOR_PIECE_MODS[a.id]) ARMOR_PIECE_MODS[a.id](p, pm, g); });
function defModMaterial(id, name, o = {}) { if (!ITEMS[id]) defItem(id, Object.assign({ name, material: true, rarity: o.rarity || 1, drawIcon: o.drawIcon || genericIcon(o.color || '#c0c0c8', o.hi || '#fff', o.shape || 'orb') }, o.props || {})); ITEM_VALUES[id] = o.value || 1000; ITEMS[id].value = ITEM_VALUES[id]; if (o.tooltip) ITEMS[id].tooltip = o.tooltip; return ITEMS[id]; }
function defModPotion(id, name, buff, desc, col, recipe, o = {}) { CAT(id, Object.assign({ name, max: 30, consumable: true, rarity: 1, tooltip: `${desc} for ${Math.round((o.time || 240) / 60)} minutes`, drawIcon: genericIcon(col, '#fff', 'potion'), buffName: buff, buffTime: 60 * (o.time || 240), food: true }, o.props || {}), o.value || 500); if (recipe) RECIPES.push({ result: id, count: 1, station: o.station || 'workbench', ing: recipe }); if (o.mod) BUFF_MODS[buff] = o.mod; return ITEMS[id]; }
// friendly projectile helper
function modShot(game, x, y, vx, vy, o) { const p = game.player; const b = new Projectile(x, y, vx, vy, Object.assign({ kind: 'bolt', damage: o.damage, friendly: true, owner: o.owner || p, knockback: o.knockback || 2, crit: !!o.crit, color: o.color || '#ffe060', hi: o.hi || '#fff', pierce: o.pierce || 0, magic: !!o.magic }, o.props || {})); b.life = o.life || 90; b.gravity = o.gravity || 0; b.ghost = !!o.ghost; if (o.homing) b.homingFriendly = o.homing; if (o.trail !== false) b.trail = { color: o.color || '#ffe060', len: o.trailLen || 8, width: o.trailWidth || 3 }; if (o.glow) b.glow = { color: o.color, r: 12 }; if (o.onHit) b.onHit = o.onHit; if (o.explosive) b.explosive = { radius: o.explosive, damage: o.damage, tiles: false }; if (o.onHitBuff) b.onHitBuff = o.onHitBuff; game.projectiles.push(b); return b; }

// crafting station tiles beyond the four base ones (upgrades also count as the station they replace)
const STATION_TILES = {};
ModLib.patch(() => { for (const [id, also] of [['mythril_anvil', ['anvil']], ['adamantite_forge', ['furnace', 'hellforge']], ['hellforge', ['furnace']], ['ancient_manipulator', []], ['loom', []], ['sawmill', ['workbench']], ['tinkerers_workshop', []], ['dye_vat', []], ['omnistation', ['workbench', 'anvil', 'furnace', 'loom', 'sawmill', 'tinkerers_workshop']]]) { const it = ITEMS[id]; if (it && it.tile != null) STATION_TILES[it.tile] = [id, ...also]; } });

// furniture tiles that never got a sprite (crafting stations from the content pass, altars) get a
// generated one from their tile painter / colour so they are visible once placed
function ensureFurnitureSprites() {
  for (let id = 0; id < TILES.length; id++) {
    const d = TILES[id]; if (!d || !d.furniture || Sprites.furniture[id]) continue;
    const c = makeCanvas(d.furniture.w * 16, d.furniture.h * 16), x = c.getContext('2d'); const p = TILE_PAINTERS[id];
    if (p) { for (let yy = 0; yy < d.furniture.h; yy++) for (let xx = 0; xx < d.furniture.w; xx++) { x.save(); x.translate(xx * 16, yy * 16); p(x, mulberry32(id * 7 + xx + yy * 3)); x.restore(); } }
    else { x.fillStyle = d.color; x.fillRect(1, 3, c.width - 2, c.height - 3); x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(1, 3, c.width - 2, 2); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(1, c.height - 3, c.width - 2, 3); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(3, 6, 3, c.height - 9); x.fillRect(c.width - 6, 6, 3, c.height - 9); }
    Sprites.furniture[id] = c;
  }
}
ModLib.on('tick', (g) => { if (!ModList._furnDone) { ModList._furnDone = true; try { ensureFurnitureSprites(); } catch (e) { console.error(e); } } });
// the Ancient Manipulator is a placeable crafting station
defBTile('ANCIENT_MANIPULATOR', { name: 'Ancient Manipulator', hp: 1, solid: false, drop: 'ancient_manipulator', color: '#40e0c0', mapColor: '#40e0c0', furniture: { w: 3, h: 2 }, transparent: true, light: [0.2, 0.6, 0.5] });
if (ITEMS.ancient_manipulator) { ITEMS.ancient_manipulator.tile = T.ANCIENT_MANIPULATOR; ITEMS.ancient_manipulator.placeable = true; ITEMS.ancient_manipulator.material = false; }

// =====================================================================================================
// Disabling a mod really disables it. Content defined while ModList.current is set (the mod modules set
// it section by section) is tagged with its mod: items can't be used, crafted, bought or dropped, its
// enemies don't spawn, its bosses and events can't be started, its worldgen and hooks are skipped and its
// keybinds go quiet. The mods that were built before this layer are gated through wrappers below.
// =====================================================================================================
ModList.current = null;
ModList.core = new Set(['concise_mods_list', 'serous_common', 'subworld_library', 'accessories_plus', 'expert_slot', 'nterra_utils']);
for (const id of ModList.core) if (ModList.byId[id]) ModList.byId[id].enabled = true;
{ const baseOn = ModList.on; ModList.on = function (id) { return ModList.core.has(id) || baseOn.call(this, id); }; }
ModList.itemOk = function (id) { const it = ITEMS[id]; return !it || !it.mod || this.on(it.mod); };
// gear from a disabled mod is taken off on load (into the bag, or dropped when it is full): worn mod armor,
// accessories, equipment, pets, vanity and dyes must not keep working while their mod is off
ModList.unequipDisabled = function (game) {
  const p = game.player, out = [];
  const off = (st) => st && ITEMS[st.id] && ITEMS[st.id].mod && !this.on(ITEMS[st.id].mod);
  const stow = (st) => { const left = p.addItem(st.id, st.count || 1, st.prefix); if (left > 0) game.dropItem(p.cx, p.cy, st.id, left, null, null); out.push(ITEMS[st.id].name); };
  const strip = (arr) => { if (!arr) return; for (let i = 0; i < arr.length; i++) if (off(arr[i])) { stow(arr[i]); arr[i] = null; } };
  strip(p.armor); strip(p.vanity); strip(p.accessories); strip(p.dyes);
  if (p.equipment) for (const k in p.equipment) if (off(p.equipment[k])) { stow(p.equipment[k]); p.equipment[k] = null; }
  if (game.pets) { if (off(game.pets.pet)) { stow(game.pets.pet); game.pets.pet = null; } if (off(game.pets.light)) { stow(game.pets.light); game.pets.light = null; } }
  if (p.loadouts) for (const lo of p.loadouts) if (lo) { strip(lo.armor); strip(lo.accessories); strip(lo.vanity); if (lo.equipment) for (const k in lo.equipment) if (off(lo.equipment[k])) { stow(lo.equipment[k]); lo.equipment[k] = null; } }
  if (out.length) setTimeout(() => game.message(`Unequipped (mod disabled): ${[...new Set(out)].join(', ')}`, '#ffb060'), 900);
  return out;
};
ModList.enemyOk = function (type) { const d = ENEMY_DEFS[type]; return !d || !d.mod || this.on(d.mod); };
{ const baseSet = ModList.setEnabled; ModList.setEnabled = function (m, on) { if (ModList.core.has(m.id) && !on) { if (window.game) window.game.message(`${m.name} is a core library and stays on.`, '#ff8080'); return; } baseSet.call(this, m, on); }; }
// tag definitions made by the mod modules
{ const baseDef = defItem; defItem = function (id, props) { baseDef(id, props); if (ModList.current && ITEMS[id]) ITEMS[id].mod = ModList.current; }; }
{ const basePush = RECIPES.push; RECIPES.push = function (...r) { for (const x of r) if (x && ModList.current) x.mod = ModList.current; return basePush.apply(this, r); }; }
{ const baseE = defBEnemy; defBEnemy = function (type, def) { const d = baseE(type, def); if (ModList.current && ENEMY_DEFS[type]) ENEMY_DEFS[type].mod = ModList.current; return d; }; }
{ const baseB = defBoss; defBoss = function (id, def) { if (ModList.current) def.mod = ModList.current; return baseB(id, def); }; }
ModList.tagRole = function (role, mod) { const d = NPC_ROLES[role]; if (d) d.mod = mod; };
// hooks registered by a mod section only run while the mod is enabled
{ const gateFn = (fn, ret) => { const mod = ModList.current; if (!mod) return fn; const g = function (...a) { if (!ModList.on(mod)) return typeof ret === 'function' ? ret(...a) : ret; return fn.apply(this, a); }; g.mod = mod; return g; };
  for (const [name, ret] of [['onPlayerMods'], ['onPlayerHurt'], ['onEnemyKilled'], ['onFatal', false], ['onSpawnPick', (g, t) => t], ['onWorldgen'], ['onRightClick', false], ['onRightClickLate', false]]) { const base = ModLib[name].bind(ModLib); ModLib[name] = (fn) => base(gateFn(fn, ret)); }
  { const base = ModLib.onIncoming.bind(ModLib); ModLib.onIncoming = (fn) => base(gateFn(fn, (p, amount) => amount)); }
  { const base = ModLib.on.bind(ModLib); ModLib.on = (ev, fn) => base(ev, gateFn(fn)); }
  { const base = ModLib.onUiClick.bind(ModLib); ModLib.onUiClick = (id, fn) => base(id, gateFn(fn)); }
  { const base = TooltipHooks.add.bind(TooltipHooks); TooltipHooks.add = (fn) => base(gateFn(fn)); const baseL = TooltipHooks.addLate.bind(TooltipHooks); TooltipHooks.addLate = (fn) => baseL(gateFn(fn)); }
  { const base = ModKeys.bind.bind(ModKeys); ModKeys.bind = (code, label, fn) => { base(code, label, fn); ModKeys.binds[ModKeys.binds.length - 1].mod = ModList.current; }; }
  ModKeys.handle = function (game, e) { for (const b of this.binds) if (b.code === e.code) { if (b.mod && !ModList.on(b.mod)) return false; b.fn(game, e); return true; } return false; };
  { const base = Bosses.summon.bind(Bosses); Bosses.summon = function (game, id, opts) { const d = BOSS_DEFS[id]; const mod = (d && d.mod) || OLD_MOD_BOSSES[id]; if (mod && !ModList.on(mod)) { game.message(`${(d && d.name) || id} belongs to a disabled mod.`, '#ff8080'); return null; } return base(game, id, opts); }; }
  { const base = Events.start.bind(Events); Events.start = function (game, id) { const d = EVENT_DEFS[id]; if (d && d.mod && !ModList.on(d.mod)) { game.message(`${d.name} belongs to a disabled mod.`, '#ff8080'); return false; } return base(game, id); }; }
}
// the mods built before this layer: their systems, enemies, bosses, items and keys
const OLD_MOD_BOSSES = { rumia: 'gensokyo', lepus: 'consolaria', desert_scourge: 'calamity', grand_thunder_bird: 'thorium', nameless_deity: 'wotg', vagrant: 'stars_above' };
const OLD_MOD_ENEMIES = { gensokyo: ['fairy', 'sunflower_fairy', 'ice_fairy', 'rumia'], consolaria: ['diseaster_bunny', 'vampire_miner', 'lepus', 'lepus_kit', 'lepus_egg'], calamity: ['wulfrum_slime', 'wulfrum_drone', 'desert_scourge'], thorium: ['grand_thunder_bird'], wotg: ['nameless_deity'], stars_above: ['vagrant'] };
const OLD_MOD_ITEMS = {
  gensokyo: /^(sealed_ribbon|torii_gate|ofuda|yin_yang_orb|rumia_mask|rumia_trophy|point_item|power_item|fantasy_seal|youkai_ribbon)$/,
  consolaria: /^(suspicious_egg|lepus_mask|lepus_trophy|egg_cannon|candy|candy_cane|goodie_bag|present)$/,
  calamity: /^(wulfrum_|desert_scourge|desert_medallion|aquatic_discharge|scourge_of_the_desert|sea_prism|victide|pearl_shard)/,
  thorium: /^(storm_flare|thunderbird_|wooden_whistle|bongos|lute|healers_staff|caduceus_staff|shuriken|bone_javelin|technique_scroll|talon_burst|thunder_talon)/,
  wotg: /^(deity_mask|deity_trophy|divine_monolith)$/, stars_above: /^(starfarers_|starmap|vagrant_|astral_|spatial_|deific_touch|cosmic_wings)/,
  split: /^(camera|photo_album|captains_log)$/, fargos_mutant: /^(mutant_plushie|super_dummy|omnistation|instabridge|dirt_instabridge|instalake|hellevator_kit|battle_cry|calming_cry)$/,
  calamity_fables: /^(fable_page_|wanderers_charm)/, structure_helper: /^(structure_wand|structure_placer)$/,
};
for (const mod in OLD_MOD_ITEMS) for (const id in ITEMS) if (!ITEMS[id].mod && OLD_MOD_ITEMS[mod].test(id)) ITEMS[id].mod = mod;
for (const mod in OLD_MOD_ENEMIES) for (const t of OLD_MOD_ENEMIES[mod]) if (ENEMY_DEFS[t]) ENEMY_DEFS[t].mod = mod;
for (const [role, mod] of [['Shrine Maiden', 'gensokyo'], ['Mc MoneyPants', 'consolaria'], ['Cook', 'thorium'], ['Solyn', 'wotg'], ['Shutterbug', 'split'], ['Mutant', 'fargos_mutant'], ['Lumberjack', 'fargos_mutant'], ['Wanderer', 'calamity_fables']]) ModList.tagRole(role, mod);
for (const b of ModKeys.binds) { if (b.code === 'KeyR' || b.code === 'KeyV') b.mod = 'calamity'; if (b.code === 'KeyG') b.mod = 'thorium'; if (b.code === 'KeyU' || b.code === 'KeyX') b.mod = 'stars_above'; if (b.code === 'KeyB') b.mod = 'structure_helper'; if (b.code === 'KeyZ') b.mod = 'authentic_races'; }
// method gating for the old mod objects: gate(obj, mod, [method, fallback]...)
function gateMethods(obj, mod, specs) { for (const spec of specs) { const [m, ret] = Array.isArray(spec) ? spec : [spec, undefined]; const f = obj[m]; if (typeof f !== 'function') continue; obj[m] = function (...a) { if (!ModList.on(mod)) return typeof ret === 'function' ? ret.apply(this, a) : ret; return f.apply(this, a); }; } }
gateMethods(BiomeTitles, 'biome_titles', ['tick', 'draw']);
gateMethods(Gensokyo, 'gensokyo', ['draw', ['summonRumia', (g) => { g.message('Gensokyo is disabled in the mod list.', '#ff8080'); return null; }]]);
gateMethods(Consolaria, 'consolaria', ['tick', 'draw', ['pickSpawn', (g, t) => t], ['summonLepus', (g) => { g.message('Consolaria is disabled in the mod list.', '#ff8080'); return null; }]]);
gateMethods(Holidays, 'consolaria', [['active', false], ['activeNames', () => []]]);
gateMethods(Fishing, 'auto_fisher', [['hasAuto', false]]);
// Pets Overhaul: with the mod off the pet system is inert (no stats, abilities, drawing or extra drops)
{ const basePm = () => ({ move: 1, accel: 1, jump: 1, defAdd: 0, defMult: 1, dmg: 1, crit: 0, kbResist: 0, kbMult: 1, useTime: 1, pickup: 0, place: 0, regenAdd: 0, regenTime: 1, fallBonus: 0, autoJump: false, lavaImmune: false, dr: 0, rangedDmg: 1, projSpeed: 1 });
  gateMethods(PetSystem.prototype, 'pets_overhaul', [['mods', basePm], 'tick', 'draw', 'useAbility', ['onPlayerDamaged', (amount) => amount], ['onFatal', false], ['onHit', (e, damage, kb, crit) => ({ damage, kb, crit })], 'afterHit', ['onKill', (e, coins) => coins], ['onMine', () => []], ['miningSpeedMult', 1], 'onJumpFull', 'onEnemyTouch', 'heal', 'addShield', 'startEnrage', ['stat', 0], ['lightStat', 0], ['miningFortune', 0], ['harvestFortune', 0]]);
  for (const id of [...Object.keys(PETS), ...Object.keys(LIGHT_PETS), 'pet_food', 'pet_forge', 'pet_tablet', 'mastery_shard']) if (ITEMS[id]) ITEMS[id].mod = 'pets_overhaul';
  for (const r of RECIPES) if (r.station === 'petforge' || (ITEMS[r.result] && ITEMS[r.result].mod === 'pets_overhaul')) r.mod = r.mod || 'pets_overhaul';
  ModList.tagRole('Pet Tamer', 'pets_overhaul'); }
gateMethods(Fables, 'calamity_fables', ['tick', 'draw', 'onKill']);
gateMethods(ManaOverload, 'split', ['tick', 'draw', 'mods', ['tryOverload', false], ['incoming', (p, a) => a]]);
gateMethods(Thorium, 'thorium', ['tick', 'draw', 'mods']);
gateMethods(Fargo, 'fargos_mutant', ['tick', 'draw', ['onRightClick', false], ['infinite', false]]);
gateMethods(WotG, 'wotg', ['draw', ['summonDeity', (g) => { g.message('Wrath of the Gods is disabled in the mod list.', '#ff8080'); return null; }]]);
gateMethods(Structures, 'structure_helper', ['drawWorld', 'drawPanel', 'generate', 'wandRight', 'click']);
gateMethods(StarsAbove, 'stars_above', ['tick', 'tickNova', 'draw', 'drawArray', 'mods', ['incoming', (p, a) => a], ['fatal', false], ['summonVagrant', (g) => { g.message('The Stars Above is disabled in the mod list.', '#ff8080'); return null; }]]);
gateMethods(Races, 'authentic_races', ['tick', 'draw', 'mods', 'useAbility', 'drawFeatures', ['raceOf', null], ['get', (id) => RACES.human]]);
gateMethods(Calamity, 'calamity', ['tick', 'draw', 'mods', 'onHurt', ['pickSpawn', (g, t) => t], ['enemyMult', 1], ['absorb', (p, amount) => amount]]);
{ const m = ModList.byId.armed_zombies; if (m) { m.toggle = (on) => { if (!on) { ArmedZombies._wasOn = ArmedZombies.cfg.enabled; ArmedZombies.cfg.enabled = false; } else if (ArmedZombies._wasOn != null) ArmedZombies.cfg.enabled = ArmedZombies._wasOn; }; if (!m.enabled) m.toggle(false); } }
{ const m = ModList.byId.luminance; if (m) { m.toggle = (on) => { if (!on) { FX._was = FX.cfg.intensity; FX.cfg.intensity = 0; } else if (FX._was != null) FX.cfg.intensity = FX._was || 1; }; if (!m.enabled) m.toggle(false); } }
// old worldgen passes
{ const gateGen = (name, mod) => { const f = window[name]; if (typeof f !== 'function') return; window[name] = function (...a) { if (!ModList.on(mod)) return; return f.apply(this, a); }; };
  for (const [n, m] of [['placeShrine', 'gensokyo'], ['placeHeartShrines', 'consolaria'], ['placeStrandedShip', 'split'], ['placeMineshaft', 'calamity_fables'], ['placeWatchtower', 'calamity_fables'], ['fablesWorldgen', 'calamity_fables']]) gateGen(n, m); }
// game-side checks: items from disabled mods can't be used / consumed / crafted / bought / dropped, their enemies don't spawn,
// their NPCs don't move in, race and Calamity difficulty menus hide when their mods are off
ModLib.patch(() => {
  for (const role in NPC_ROLES) { const d = NPC_ROLES[role]; if (!d.mod) continue; const c = d.condition; d.condition = (g) => ModList.on(d.mod) && (!c || c(g)); }
  const baseConsume = Game.prototype.consume; Game.prototype.consume = function (slot, it) { if (it && it.mod && !ModList.on(it.mod)) { this.message(`${it.name} comes from a disabled mod.`, '#ff8080'); return; } return baseConsume.call(this, slot, it); };
  const baseDrop = Game.prototype.dropItem; Game.prototype.dropItem = function (x, y, id, count, vx, prefix) { if (!ModList.itemOk(id)) return null; return baseDrop.call(this, x, y, id, count, vx, prefix); };
  const baseCreate = Game.prototype.showCreateMenu; Game.prototype.showCreateMenu = function () { if (!ModList.on('authentic_races')) this.raceChoice = 'human'; if (!ModList.on('calamity') && (this.revengeance || this.death)) { this.revengeance = false; this.death = false; } baseCreate.call(this); if (!ModList.on('authentic_races')) this.menu.items = this.menu.items.filter(i => !/^Race/.test(i.label)); };
  const baseCycle = Game.prototype.cycleDifficulty; Game.prototype.cycleDifficulty = function () { baseCycle.call(this); if (!ModList.on('calamity') && (this.revengeance || this.death)) { this.revengeance = false; this.death = false; this.expert = false; this.master = false; } };
  const baseApply = Races.apply; Races.apply = function (game, fresh) { if (!ModList.on('authentic_races')) return; return baseApply.call(this, game, fresh); };
});
