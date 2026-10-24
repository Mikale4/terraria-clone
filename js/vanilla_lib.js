// ---------------------------------------------------------------------------
// Vanilla content library: compact definers used by the vanilla_*.js files
// that fill in the rest of Terraria's blocks, walls, furniture, crafting
// stations, materials, weapons, armor, accessories, pets, enemies and boss
// bags. Everything here is core content (no mod tag).
// ---------------------------------------------------------------------------
'use strict';

const VAN = {
  // ---- colours -------------------------------------------------------------------------------------
  hex(c) { const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) return [128, 128, 128]; const n = parseInt(m[1], 16); return [n >> 16, (n >> 8) & 255, n & 255]; },
  mix(a, b, t) { const A = this.hex(a), B = this.hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); },
  light(c, f = 0.25) { return this.mix(c, '#ffffff', f); },
  dark(c, f = 0.3) { return this.mix(c, '#000000', f); },
  // a MATERIALS palette (M light, m mid, d dark) from one base colour, used by armor / tool icons and plating
  palette(id, col) { if (!MATERIALS[id]) MATERIALS[id] = { M: this.light(col, 0.35), m: col, d: this.dark(col, 0.4) }; return id; },

  // ---- tile painters ----------------------------------------------------------------------------------
  painter(style, col) {
    const L = this.light(col, 0.2), D = this.dark(col, 0.3), DD = this.dark(col, 0.5), LL = this.light(col, 0.45);
    switch (style) {
      case 'brick': return (c, r) => brickPattern(c, r, col, DD, L, D);
      case 'stone': return stonePainter(L, col, D);
      case 'wood': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { c.fillStyle = D; c.fillRect(0, y + 3, 16, 1); c.fillStyle = L; c.fillRect(0, y, 16, 1); } c.fillStyle = DD; c.fillRect(2, 1, 1, 1); c.fillRect(12, 9, 1, 1); c.fillRect(7, 5, 1, 1); };
      case 'planks': return (c, r) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); for (let x = 0; x < 16; x += 8) { c.fillStyle = D; c.fillRect(x + 7, 0, 1, 16); c.fillStyle = L; c.fillRect(x, 0, 1, 16); } for (let i = 0; i < 3; i++) { c.fillStyle = DD; c.fillRect(Math.floor(r() * 16), Math.floor(r() * 16), 1, 1); } };
      case 'glass': return (c) => { c.fillStyle = col.startsWith('rgba') ? col : this.rgba(col, 0.45); c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(2, 2, 1, 6); c.fillRect(3, 2, 4, 1); c.fillStyle = this.rgba(D, 0.8); c.fillRect(0, 0, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16); };
      case 'tile': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = L; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(8, 8, 8, 1); c.fillRect(8, 8, 1, 8); c.fillStyle = D; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 8); c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); };
      case 'plate': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = L; c.fillRect(1, 1, 14, 1); c.fillRect(1, 1, 1, 14); c.fillStyle = D; c.fillRect(1, 14, 14, 1); c.fillRect(14, 1, 1, 14); c.fillStyle = DD; c.fillRect(2, 2, 1, 1); c.fillRect(13, 2, 1, 1); c.fillRect(2, 13, 1, 1); c.fillRect(13, 13, 1, 1); };
      case 'gem': return (c, r) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = LL; c.fillRect(3, 2, 2, 5); c.fillRect(10, 8, 2, 4); c.fillStyle = D; c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); c.fillRect(6, 10, 3, 1); };
      case 'crystal': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = LL; for (let i = 0; i < 4; i++) { c.fillRect(2 + i * 4, 1 + (i % 2) * 3, 1, 9); } c.fillStyle = D; c.fillRect(0, 15, 16, 1); c.fillRect(15, 0, 1, 16); };
      case 'slime': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = LL; c.fillRect(2, 2, 3, 3); c.fillRect(9, 6, 2, 2); c.fillStyle = D; c.fillRect(0, 14, 16, 2); };
      case 'cloud': return (c, r) => { speckle(c, r, col, [L, LL, this.light(col, 0.1)], 24); c.fillStyle = D; c.fillRect(0, 15, 16, 1); };
      case 'leaf': return (c, r) => { speckle(c, r, col, [L, D, DD, this.light(col, 0.1)], 60); };
      case 'metal': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = L; c.fillRect(0, 0, 16, 2); c.fillRect(0, 8, 16, 1); c.fillStyle = D; c.fillRect(0, 6, 16, 2); c.fillRect(0, 14, 16, 2); c.fillStyle = DD; c.fillRect(3, 3, 2, 2); c.fillRect(11, 11, 2, 2); };
      case 'hay': return (c, r) => { speckle(c, r, col, [L, D, LL], 40); c.fillStyle = D; for (let i = 0; i < 5; i++) c.fillRect(Math.floor(r() * 14), Math.floor(r() * 16), 3, 1); };
      case 'bone': return (c, r) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = D; c.fillRect(0, 5, 16, 1); c.fillRect(0, 11, 16, 1); c.fillRect(4, 0, 1, 5); c.fillRect(11, 6, 1, 5); c.fillRect(7, 12, 1, 4); c.fillStyle = L; c.fillRect(0, 0, 16, 1); c.fillRect(0, 6, 16, 1); };
      case 'ore': return (c, r) => { (TILE_PAINTERS[T.STONE] || (() => {}))(c, r); blobs(c, r, [LL, col, D], 4, 2); };
      case 'honey': return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = LL; c.fillRect(2, 2, 4, 2); c.fillRect(3, 4, 1, 3); c.fillStyle = D; c.fillRect(9, 9, 4, 4); c.fillRect(0, 15, 16, 1); };
      case 'speckle': default: return (c, r) => speckle(c, r, col, [L, D, this.light(col, 0.1), this.dark(col, 0.15)], 40);
    }
  },
  rgba(hex, a) { const [r, g, b] = this.hex(hex); return `rgba(${r},${g},${b},${a})`; },
  wallPainter(style, col) { const D = this.dark(col, 0.3), L = this.light(col, 0.15), DD = this.dark(col, 0.5);
    if (style === 'brick') return (c, r) => brickPattern(c, r, col, DD, L, D);
    if (style === 'wood') return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); for (let x = 0; x < 16; x += 4) { c.fillStyle = D; c.fillRect(x + 3, 0, 1, 16); c.fillStyle = L; c.fillRect(x, 0, 1, 16); } };
    if (style === 'planks') return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y += 4) { c.fillStyle = D; c.fillRect(0, y + 3, 16, 1); c.fillStyle = L; c.fillRect(0, y, 16, 1); } };
    if (style === 'tile') return (c) => { c.fillStyle = col; c.fillRect(0, 0, 16, 16); c.fillStyle = D; c.fillRect(0, 7, 16, 1); c.fillRect(7, 0, 1, 16); c.fillStyle = L; c.fillRect(0, 0, 16, 1); c.fillRect(0, 8, 16, 1); };
    return (c, r) => speckle(c, r, col, [L, D, this.light(col, 0.05)], 30); },

  // ---- blocks & walls ---------------------------------------------------------------------------------
  // block(id, name, color, {style, hp, minPower, solid, gravity, light, rarity, value, tool, hurt, slippery, brickOf, key})
  block(id, name, col, o = {}) {
    let key = (o.key || id).toUpperCase();
    if (ITEMS[id] && ITEMS[id].tile != null && !o.key) { key = Object.keys(T).find(k => T[k] === ITEMS[id].tile) || key; } // already a placeable block: keep its tile
    if (T[key] == null) defBTile(key, { name, hp: o.hp || 50, minPower: o.minPower || 0, drop: id, color: col, mapColor: o.map || col, solid: o.solid !== false, light: o.light || null, gravity: !!o.gravity, hurt: o.hurt || 0, slippery: !!o.slippery, tool: o.tool || 'pick', transparent: !!o.transparent, platform: !!o.platform }, this.painter(o.style || 'speckle', col));
    if (!ITEMS[id]) defItem(id, { name, tile: T[key], rarity: o.rarity || 0, tooltip: o.tooltip || null, material: !!o.material });
    else { ITEMS[id].tile = T[key]; ITEMS[id].placeable = true; }
    ITEM_VALUES[id] = o.value || ITEM_VALUES[id] || 0; ITEMS[id].value = ITEM_VALUES[id];
    if (o.recipe) this.recipe(id, o.count || 1, o.station === undefined ? 'workbench' : o.station, o.recipe);
    return T[key];
  },
  wall(id, name, col, o = {}) {
    let key = (o.key || id).toUpperCase();
    if (ITEMS[id] && ITEMS[id].wall != null && !o.key) { key = Object.keys(W).find(k => W[k] === ITEMS[id].wall) || key; }
    if (W[key] == null) { defBWall(key, { name, drop: id, color: col, natural: !!o.natural }); WALL_PAINTERS[W[key]] = this.wallPainter(o.style || 'speckle', col); }
    if (!ITEMS[id]) defItem(id, { name, wall: W[key], rarity: o.rarity || 0 }); else { ITEMS[id].wall = W[key]; ITEMS[id].placeable = true; }
    ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id];
    if (o.recipe) this.recipe(id, o.count || 4, o.station === undefined ? 'workbench' : o.station, o.recipe);
    return W[key];
  },
  // a block plus its wall (4 walls per block at a work bench), the usual pairing
  blockAndWall(id, name, col, o = {}) { const t = this.block(id, name, col, o); this.wall(id + '_wall', name.replace(/ Block$/, '') + ' Wall', this.dark(col, 0.35), { style: o.wallStyle || (o.style === 'brick' ? 'brick' : o.style === 'wood' || o.style === 'planks' ? 'wood' : 'speckle'), recipe: [[id, 1]], count: 4, value: Math.floor((o.value || 0) / 4) }); return t; },

  // ---- furniture (multi-tile, drawn from a generated sprite) ----------------------------------------------
  // furniture(id, name, w, h, style, color, {station: [...names], solid, light, platform, value, recipe, station(craft), tooltip})
  furniture(id, name, w, h, style, col, o = {}) {
    const key = (o.key || id).toUpperCase();
    if (T[key] == null) defBTile(key, { name, hp: 1, solid: !!o.solid, platform: !!o.platform, drop: id, color: col, mapColor: col, furniture: { w, h }, transparent: true, light: o.light || null, tool: o.tool || 'pick' });
    const tid = T[key];
    VAN_FURNITURE[tid] = { w, h, style, col, o, chest: /_chest$|^barrel$|^trash_can$/.test(id) };
    if (!ITEMS[id]) defItem(id, { name, tile: tid, rarity: o.rarity || 0, tooltip: o.tooltip || (o.stations ? 'Crafting station' : null), max: 99 }); else { ITEMS[id].tile = tid; ITEMS[id].placeable = true; if (o.tooltip) ITEMS[id].tooltip = o.tooltip; }
    ITEM_VALUES[id] = o.value || 0; ITEMS[id].value = ITEM_VALUES[id];
    if (o.stations) STATION_TILES[tid] = o.stations;
    if (o.recipe) this.recipe(id, o.count || 1, o.craftAt === undefined ? 'workbench' : o.craftAt, o.recipe);
    return tid;
  },
  // sprite for a furniture tile: simple pixel art from the style + colour (called once from buildFurniture)
  sprite(w, h, style, col) {
    const c = makeCanvas(w * 16, h * 16), x = c.getContext('2d'), W_ = w * 16, H_ = h * 16;
    const L = this.light(col, 0.3), D = this.dark(col, 0.35), DD = this.dark(col, 0.6), LL = this.light(col, 0.55);
    const legs = (y0) => { x.fillStyle = D; x.fillRect(2, y0, 3, H_ - y0); x.fillRect(W_ - 5, y0, 3, H_ - y0); x.fillStyle = DD; x.fillRect(4, y0, 1, H_ - y0); x.fillRect(W_ - 3, y0, 1, H_ - y0); };
    switch (style) {
      case 'table': x.fillStyle = col; x.fillRect(0, 2, W_, 5); x.fillStyle = L; x.fillRect(0, 2, W_, 1); x.fillStyle = D; x.fillRect(0, 6, W_, 1); legs(7); break;
      case 'bench': x.fillStyle = col; x.fillRect(0, 3, W_, 4); x.fillStyle = L; x.fillRect(0, 3, W_, 1); legs(7); x.fillStyle = D; x.fillRect(4, 9, W_ - 8, 2); break;
      case 'box': x.fillStyle = DD; x.fillRect(0, 2, W_, H_ - 2); x.fillStyle = col; x.fillRect(1, 3, W_ - 2, H_ - 4); x.fillStyle = L; x.fillRect(1, 3, W_ - 2, 2); x.fillStyle = D; x.fillRect(1, H_ - 3, W_ - 2, 2); x.fillStyle = LL; x.fillRect(Math.floor(W_ / 2) - 2, Math.floor(H_ / 2) - 1, 4, 3); break;
      case 'machine': x.fillStyle = DD; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(1, 1, W_ - 2, H_ - 2); x.fillStyle = D; for (let yy = 4; yy < H_; yy += 6) x.fillRect(1, yy, W_ - 2, 1); x.fillStyle = '#ff8040'; x.fillRect(Math.floor(W_ / 2) - 4, Math.floor(H_ / 2) - 2, 8, 6); x.fillStyle = '#fff090'; x.fillRect(Math.floor(W_ / 2) - 2, Math.floor(H_ / 2), 4, 3); x.fillStyle = L; x.fillRect(1, 1, W_ - 2, 1); x.fillRect(W_ - 6, 2, 3, 3); break;
      case 'pot': x.fillStyle = DD; x.fillRect(2, 3, W_ - 4, H_ - 5); x.fillStyle = col; x.fillRect(3, 4, W_ - 6, H_ - 7); x.fillStyle = L; x.fillRect(3, 4, W_ - 6, 2); x.fillStyle = D; x.fillRect(3, H_ - 5, W_ - 6, 2); x.fillStyle = DD; x.fillRect(0, 5, 3, 3); x.fillRect(W_ - 3, 5, 3, 3); x.fillStyle = '#ff8040'; x.fillRect(Math.floor(W_ / 2) - 4, H_ - 4, 8, 3); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(Math.floor(W_ / 2) - 3, 0, 2, 4); x.fillRect(Math.floor(W_ / 2) + 2, 1, 2, 3); break;
      case 'stand': x.fillStyle = D; x.fillRect(1, 0, 3, H_); x.fillRect(W_ - 4, 0, 3, H_); x.fillRect(1, 0, W_ - 2, 3); x.fillStyle = col; x.fillRect(4, 3, W_ - 8, H_ - 6); x.fillStyle = L; for (let yy = 5; yy < H_ - 4; yy += 4) x.fillRect(5, yy, W_ - 10, 1); x.fillStyle = DD; x.fillRect(0, H_ - 3, W_, 3); break;
      case 'ball': x.fillStyle = DD; x.fillRect(Math.floor(W_ / 2) - 6, H_ - 5, 12, 5); x.fillStyle = col; x.beginPath(); x.arc(W_ / 2, H_ / 2 - 2, Math.min(W_, H_) / 2 - 3, 0, Math.PI * 2); x.fill(); x.fillStyle = LL; x.beginPath(); x.arc(W_ / 2 - 3, H_ / 2 - 5, 3, 0, Math.PI * 2); x.fill(); break;
      case 'lamp': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 1, 6, 2, H_ - 8); x.fillRect(Math.floor(W_ / 2) - 5, H_ - 3, 10, 3); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 6, 0, 12, 7); x.fillStyle = '#fff0a0'; x.fillRect(Math.floor(W_ / 2) - 4, 2, 8, 4); break;
      case 'candle': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 4, H_ - 3, 8, 3); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 2, 4, 4, H_ - 7); x.fillStyle = '#ffc040'; x.fillRect(Math.floor(W_ / 2) - 1, 1, 2, 3); x.fillStyle = '#fff0a0'; x.fillRect(Math.floor(W_ / 2), 2, 1, 1); break;
      case 'chair': x.fillStyle = col; x.fillRect(2, 2, 4, H_ - 2); x.fillRect(2, H_ / 2, W_ - 4, 4); x.fillRect(W_ - 4, H_ / 2 + 2, 3, H_ / 2 - 2); x.fillStyle = L; x.fillRect(2, 2, 4, 1); x.fillRect(2, H_ / 2, W_ - 4, 1); x.fillStyle = D; x.fillRect(2, H_ / 2 + 3, W_ - 4, 1); break;
      case 'door': x.fillStyle = DD; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(1, 1, W_ - 2, H_ - 2); x.fillStyle = D; x.fillRect(3, 4, W_ - 6, H_ / 2 - 6); x.fillRect(3, H_ / 2 + 2, W_ - 6, H_ / 2 - 6); x.fillStyle = '#e8c040'; x.fillRect(W_ - 5, H_ / 2 - 1, 2, 2); break;
      case 'bed': x.fillStyle = D; x.fillRect(0, H_ - 10, W_, 10); x.fillStyle = col; x.fillRect(2, H_ - 14, W_ - 4, 8); x.fillStyle = LL; x.fillRect(4, H_ - 16, 12, 6); x.fillStyle = DD; x.fillRect(0, H_ - 20, 4, 20); x.fillRect(W_ - 4, H_ - 16, 4, 16); break;
      case 'bookcase': x.fillStyle = DD; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(1, 1, W_ - 2, H_ - 2); for (let yy = 3; yy < H_ - 4; yy += 8) { x.fillStyle = D; x.fillRect(1, yy + 6, W_ - 2, 2); for (let xx = 3; xx < W_ - 4; xx += 4) { x.fillStyle = ['#c03030', '#3060c0', '#40a040', '#e0c040', '#8040c0'][(xx / 4 + yy / 8) % 5]; x.fillRect(xx, yy, 3, 6); } } break;
      case 'statue': x.fillStyle = DD; x.fillRect(0, H_ - 4, W_, 4); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 6, 2, 12, H_ - 6); x.fillStyle = L; x.fillRect(Math.floor(W_ / 2) - 4, 4, 3, 3); x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 6, H_ / 2, 12, 1); break;
      case 'crystal': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 8, H_ - 4, 16, 4); x.fillStyle = col; x.beginPath(); x.moveTo(W_ / 2, 0); x.lineTo(W_ / 2 + 7, H_ - 4); x.lineTo(W_ / 2 - 7, H_ - 4); x.closePath(); x.fill(); x.fillStyle = LL; x.fillRect(Math.floor(W_ / 2) - 1, 4, 2, H_ - 12); break;
      case 'altar': x.fillStyle = DD; x.fillRect(0, H_ - 6, W_, 6); x.fillStyle = col; x.fillRect(2, 4, W_ - 4, H_ - 10); x.fillStyle = L; x.fillRect(2, 4, W_ - 4, 2); x.fillStyle = LL; x.fillRect(Math.floor(W_ / 2) - 3, 0, 6, 5); x.fillStyle = D; x.fillRect(6, 8, 4, 4); x.fillRect(W_ - 10, 8, 4, 4); break;
      case 'plant': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 5, H_ - 5, 10, 5); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 1, 2, 2, H_ - 6); x.fillRect(Math.floor(W_ / 2) - 6, 4, 5, 3); x.fillRect(Math.floor(W_ / 2) + 1, 8, 6, 3); x.fillStyle = L; x.fillRect(Math.floor(W_ / 2) - 6, 4, 5, 1); break;
      case 'banner': x.fillStyle = DD; x.fillRect(0, 0, W_, 3); x.fillStyle = col; x.fillRect(2, 3, W_ - 4, H_ - 8); x.beginPath(); x.moveTo(2, H_ - 5); x.lineTo(W_ / 2, H_); x.lineTo(W_ - 2, H_ - 5); x.closePath(); x.fill(); x.fillStyle = LL; x.fillRect(Math.floor(W_ / 2) - 2, 6, 4, 6); break;
      case 'painting': x.fillStyle = '#5a3c22'; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(2, 2, W_ - 4, H_ - 4); x.fillStyle = L; x.fillRect(3, 3, W_ - 6, Math.floor(H_ / 3)); x.fillStyle = D; x.fillRect(4, H_ - 8, W_ / 3, 4); break;
      case 'trophy': x.fillStyle = '#5a3c22'; x.fillRect(0, 0, W_, H_); x.fillStyle = '#8a6038'; x.fillRect(2, 2, W_ - 4, H_ - 4); x.fillStyle = col; x.beginPath(); x.arc(W_ / 2, H_ / 2, Math.min(W_, H_) / 2 - 6, 0, Math.PI * 2); x.fill(); x.fillStyle = LL; x.fillRect(W_ / 2 - 5, H_ / 2 - 6, 3, 3); break;
      case 'tombstone': x.fillStyle = D; x.fillRect(1, 4, W_ - 2, H_ - 4); x.fillStyle = col; x.fillRect(2, 2, W_ - 4, H_ - 3); x.fillStyle = L; x.fillRect(3, 2, W_ - 6, 2); x.fillStyle = DD; x.fillRect(5, 8, W_ - 10, 1); x.fillRect(5, 12, W_ - 10, 1); break;
      case 'sink': x.fillStyle = D; x.fillRect(0, 6, W_, H_ - 6); x.fillStyle = col; x.fillRect(1, 7, W_ - 2, 6); x.fillStyle = '#80c0ff'; x.fillRect(4, 9, W_ - 8, 3); x.fillStyle = '#c0c0c8'; x.fillRect(Math.floor(W_ / 2) - 1, 1, 2, 7); x.fillRect(Math.floor(W_ / 2) - 4, 1, 8, 2); break;
      case 'toilet': x.fillStyle = col; x.fillRect(2, 2, W_ - 4, H_ / 2 - 2); x.fillRect(1, H_ / 2, W_ - 2, 6); x.fillStyle = L; x.fillRect(3, H_ / 2, W_ - 6, 2); x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 4, H_ - 8, 8, 8); break;
      case 'bathtub': x.fillStyle = D; x.fillRect(0, H_ / 2, W_, H_ / 2); x.fillStyle = col; x.fillRect(1, H_ / 2 - 2, W_ - 2, H_ / 2 - 2); x.fillStyle = '#80c0ff'; x.fillRect(4, H_ / 2, W_ - 8, 4); x.fillStyle = DD; x.fillRect(2, H_ - 3, 4, 3); x.fillRect(W_ - 6, H_ - 3, 4, 3); break;
      case 'piano': x.fillStyle = DD; x.fillRect(0, 2, W_, H_ - 2); x.fillStyle = col; x.fillRect(1, 3, W_ - 2, H_ - 8); x.fillStyle = '#f0f0f0'; x.fillRect(2, H_ - 9, W_ - 4, 4); x.fillStyle = '#101010'; for (let xx = 4; xx < W_ - 4; xx += 4) x.fillRect(xx, H_ - 9, 2, 2); break;
      case 'clock': x.fillStyle = DD; x.fillRect(Math.floor(W_ / 2) - 8, 0, 16, H_); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 7, 1, 14, H_ - 2); x.fillStyle = '#f0f0e0'; x.beginPath(); x.arc(W_ / 2, 10, 5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#202020'; x.fillRect(Math.floor(W_ / 2), 7, 1, 3); x.fillRect(Math.floor(W_ / 2), 10, 3, 1); x.fillStyle = '#e8c040'; x.fillRect(Math.floor(W_ / 2) - 2, H_ - 14, 4, 4); break;
      case 'dresser': x.fillStyle = DD; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(1, 1, W_ - 2, H_ - 2); x.fillStyle = D; x.fillRect(1, H_ / 2, W_ - 2, 1); x.fillRect(W_ / 2, 1, 1, H_ - 2); x.fillStyle = '#e8c040'; x.fillRect(W_ / 4, H_ / 4, 2, 2); x.fillRect(3 * W_ / 4, H_ / 4, 2, 2); x.fillRect(W_ / 4, 3 * H_ / 4, 2, 2); x.fillRect(3 * W_ / 4, 3 * H_ / 4, 2, 2); break;
      case 'chandelier': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 1, 0, 2, H_ / 2); x.fillRect(4, H_ / 2, W_ - 8, 2); x.fillStyle = col; x.fillRect(4, H_ / 2 - 3, 3, 4); x.fillRect(W_ - 7, H_ / 2 - 3, 3, 4); x.fillRect(Math.floor(W_ / 2) - 1, H_ / 2 - 4, 3, 5); x.fillStyle = '#fff0a0'; x.fillRect(5, H_ / 2 - 6, 1, 3); x.fillRect(W_ - 6, H_ / 2 - 6, 1, 3); x.fillRect(Math.floor(W_ / 2), H_ / 2 - 7, 1, 3); break;
      case 'lantern': x.fillStyle = D; x.fillRect(Math.floor(W_ / 2) - 1, 0, 2, 4); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 5, 4, 10, H_ - 6); x.fillStyle = '#fff0a0'; x.fillRect(Math.floor(W_ / 2) - 3, 6, 6, H_ - 10); break;
      case 'cannon': x.fillStyle = D; x.fillRect(2, H_ - 8, W_ - 4, 8); x.fillStyle = col; x.fillRect(4, H_ / 2 - 4, W_ - 4, 8); x.fillStyle = DD; x.fillRect(W_ - 4, H_ / 2 - 5, 4, 10); x.fillStyle = L; x.fillRect(4, H_ / 2 - 4, W_ - 8, 1); break;
      case 'rug': x.fillStyle = col; x.fillRect(0, H_ - 3, W_, 3); x.fillStyle = L; x.fillRect(0, H_ - 3, W_, 1); x.fillStyle = D; for (let xx = 3; xx < W_; xx += 6) x.fillRect(xx, H_ - 2, 2, 1); break;
      case 'cauldron': x.fillStyle = DD; x.fillRect(1, 4, W_ - 2, H_ - 6); x.fillStyle = col; x.fillRect(2, 5, W_ - 4, H_ - 9); x.fillStyle = '#60d060'; x.fillRect(4, 3, W_ - 8, 3); x.fillStyle = '#a0ff80'; x.fillRect(6, 1, 2, 2); x.fillRect(W_ - 9, 0, 2, 3); x.fillStyle = D; x.fillRect(3, H_ - 3, 4, 3); x.fillRect(W_ - 7, H_ - 3, 4, 3); break;
      case 'bottle': x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 3, 5, 6, H_ - 5); x.fillRect(Math.floor(W_ / 2) - 1, 1, 2, 5); x.fillStyle = LL; x.fillRect(Math.floor(W_ / 2) - 2, 7, 1, H_ - 9); break;
      case 'cage': x.fillStyle = D; x.fillRect(0, 0, W_, H_); x.fillStyle = 'rgba(200,220,255,0.35)'; x.fillRect(1, 1, W_ - 2, H_ - 2); x.fillStyle = D; for (let xx = 4; xx < W_; xx += 5) x.fillRect(xx, 1, 1, H_ - 2); x.fillStyle = col; x.fillRect(Math.floor(W_ / 2) - 4, H_ - 8, 8, 5); break;
      default: x.fillStyle = D; x.fillRect(0, 0, W_, H_); x.fillStyle = col; x.fillRect(1, 1, W_ - 2, H_ - 2); x.fillStyle = L; x.fillRect(1, 1, W_ - 2, 1);
    }
    return c;
  },

  // ---- items ---------------------------------------------------------------------------------------------
  item(id, name, props = {}, value = 0) { if (!ITEMS[id]) defItem(id, Object.assign({ name }, props)); else Object.assign(ITEMS[id], props, { name }); ITEM_VALUES[id] = value || ITEM_VALUES[id] || 0; ITEMS[id].value = ITEM_VALUES[id]; return ITEMS[id]; },
  material(id, name, col, o = {}) { const it = this.item(id, name, Object.assign({ material: true, rarity: o.rarity || 0, tooltip: o.tooltip || null, max: o.max || 999 }, o.props || {}), o.value || 0); if (!it.drawIcon && !it.icon) it.drawIcon = this.icon(o.shape || 'chunk', col); if (o.recipe) this.recipe(id, o.count || 1, o.station === undefined ? null : o.station, o.recipe); return it; },
  recipe(result, count, station, ing) { if (!RECIPES.some(r => r.result === result && r.station === station && JSON.stringify(r.ing) === JSON.stringify(ing))) RECIPES.push({ result, count, station, ing }); },
  // one recipe per alternative ingredient (iron/lead, demonite/crimtane...)
  recipeAlt(result, count, station, alts, rest = []) { for (const alt of alts) this.recipe(result, count, station, [alt, ...rest]); },

  // ---- generic 16x16 icons ----------------------------------------------------------------------------------
  icon(shape, col, col2) {
    const L = this.light(col, 0.4), D = this.dark(col, 0.4), c2 = col2 || L;
    return (x) => {
      x.fillStyle = col;
      switch (shape) {
        case 'chunk': x.fillRect(3, 4, 10, 9); x.fillStyle = L; x.fillRect(4, 5, 4, 3); x.fillStyle = D; x.fillRect(9, 9, 3, 3); break;
        case 'bar': x.fillRect(2, 6, 12, 6); x.fillStyle = L; x.fillRect(2, 6, 12, 1); x.fillStyle = D; x.fillRect(2, 11, 12, 1); break;
        case 'gem': x.beginPath(); x.moveTo(8, 1); x.lineTo(14, 6); x.lineTo(8, 15); x.lineTo(2, 6); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(6, 4, 2, 3); break;
        case 'orb': x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = L; x.beginPath(); x.arc(6, 6, 2, 0, Math.PI * 2); x.fill(); break;
        case 'dust': for (const [px, py] of [[3, 4], [8, 2], [12, 6], [5, 10], [10, 11], [7, 7], [13, 12]]) x.fillRect(px, py, 2, 2); x.fillStyle = L; x.fillRect(8, 2, 1, 1); x.fillRect(7, 7, 1, 1); break;
        case 'feather': x.beginPath(); x.moveTo(3, 13); x.quadraticCurveTo(4, 4, 13, 2); x.quadraticCurveTo(12, 10, 3, 13); x.fill(); x.fillStyle = D; x.fillRect(5, 9, 1, 1); x.fillRect(7, 7, 1, 1); x.fillRect(9, 5, 1, 1); break;
        case 'bone': x.fillRect(4, 7, 8, 2); x.fillRect(2, 5, 3, 3); x.fillRect(2, 8, 3, 3); x.fillRect(11, 5, 3, 3); x.fillRect(11, 8, 3, 3); break;
        case 'scale': x.beginPath(); x.moveTo(8, 2); x.lineTo(13, 8); x.lineTo(8, 14); x.lineTo(3, 8); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(7, 5, 2, 4); break;
        case 'vial': x.fillRect(5, 6, 6, 8); x.fillRect(6, 2, 4, 4); x.fillStyle = c2; x.fillRect(6, 9, 4, 4); x.fillStyle = L; x.fillRect(6, 7, 1, 5); break;
        case 'book': x.fillRect(3, 2, 10, 12); x.fillStyle = L; x.fillRect(4, 3, 8, 1); x.fillStyle = D; x.fillRect(3, 13, 10, 1); x.fillStyle = c2; x.fillRect(6, 6, 4, 4); break;
        case 'ring': x.beginPath(); x.arc(8, 8, 5, 0, Math.PI * 2); x.arc(8, 8, 2.5, 0, Math.PI * 2, true); x.fill(); x.fillStyle = c2; x.fillRect(7, 1, 3, 3); break;
        case 'box': x.fillRect(3, 3, 10, 10); x.fillStyle = L; x.fillRect(3, 3, 10, 2); x.fillStyle = D; x.fillRect(3, 11, 10, 2); x.fillStyle = c2; x.fillRect(7, 7, 2, 2); break;
        case 'wing': x.beginPath(); x.moveTo(1, 8); x.quadraticCurveTo(4, 1, 8, 6); x.quadraticCurveTo(12, 1, 15, 8); x.quadraticCurveTo(12, 10, 8, 12); x.quadraticCurveTo(4, 10, 1, 8); x.fill(); x.fillStyle = L; x.fillRect(7, 6, 2, 5); break;
        case 'boot': x.fillRect(4, 2, 5, 9); x.fillRect(4, 10, 9, 4); x.fillStyle = D; x.fillRect(4, 13, 9, 1); x.fillStyle = L; x.fillRect(5, 3, 1, 6); break;
        case 'shield': x.beginPath(); x.moveTo(3, 2); x.lineTo(13, 2); x.lineTo(13, 8); x.quadraticCurveTo(13, 13, 8, 15); x.quadraticCurveTo(3, 13, 3, 8); x.closePath(); x.fill(); x.fillStyle = c2; x.fillRect(7, 4, 2, 7); x.fillRect(5, 6, 6, 2); break;
        case 'charm': x.fillStyle = D; x.fillRect(7, 1, 2, 5); x.fillStyle = col; x.beginPath(); x.arc(8, 10, 4, 0, Math.PI * 2); x.fill(); x.fillStyle = c2; x.fillRect(7, 9, 2, 2); break;
        case 'hook': x.fillStyle = D; x.fillRect(7, 1, 2, 8); x.fillStyle = col; x.beginPath(); x.arc(8, 10, 4, Math.PI * 0.1, Math.PI * 1.3); x.lineTo(8, 10); x.fill(); x.fillRect(4, 10, 2, 3); break;
        case 'egg': x.beginPath(); x.ellipse(8, 8, 5, 6.5, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = L; x.fillRect(6, 3, 2, 3); x.fillStyle = c2; x.fillRect(9, 9, 2, 2); break;
        case 'star': x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(7, 6, 2, 2); break;
        case 'pouch': x.fillRect(4, 6, 8, 8); x.fillStyle = D; x.fillRect(5, 4, 6, 2); x.fillStyle = L; x.fillRect(5, 7, 2, 2); break;
        case 'key': x.beginPath(); x.arc(5, 5, 3.5, 0, Math.PI * 2); x.fill(); x.fillRect(6, 6, 8, 2); x.fillRect(11, 8, 2, 3); x.fillRect(8, 8, 2, 2); x.fillStyle = D; x.fillRect(4, 4, 2, 2); break;
        case 'coin': x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = D; x.beginPath(); x.arc(8, 8, 4, 0, Math.PI * 2); x.fill(); x.fillStyle = L; x.fillRect(7, 6, 2, 4); break;
        case 'leaf': x.beginPath(); x.moveTo(2, 14); x.quadraticCurveTo(2, 2, 14, 2); x.quadraticCurveTo(14, 14, 2, 14); x.fill(); x.fillStyle = D; x.fillRect(4, 12, 1, 1); x.fillRect(7, 9, 1, 1); x.fillRect(10, 6, 1, 1); break;
        case 'mushroom': x.fillRect(4, 3, 8, 5); x.fillRect(6, 8, 4, 6); x.fillStyle = L; x.fillRect(5, 4, 2, 2); x.fillRect(9, 5, 1, 1); break;
        case 'cloth': x.fillRect(2, 4, 12, 9); x.fillStyle = L; x.fillRect(2, 4, 12, 2); x.fillStyle = D; x.fillRect(3, 9, 10, 1); break;
        case 'skull': x.fillRect(4, 3, 8, 7); x.fillRect(5, 10, 6, 3); x.fillStyle = '#202020'; x.fillRect(5, 5, 2, 2); x.fillRect(9, 5, 2, 2); x.fillRect(7, 11, 1, 2); break;
        case 'heart': x.beginPath(); x.moveTo(8, 14); x.lineTo(2, 7); x.arc(5, 5, 3, Math.PI, 0); x.arc(11, 5, 3, Math.PI, 0); x.lineTo(14, 7); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(4, 4, 2, 2); break;
        case 'horn': x.beginPath(); x.moveTo(3, 14); x.quadraticCurveTo(4, 4, 13, 2); x.quadraticCurveTo(9, 8, 6, 14); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(6, 8, 1, 3); break;
        case 'fin': x.beginPath(); x.moveTo(2, 14); x.lineTo(8, 2); x.lineTo(14, 14); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(7, 7, 2, 4); break;
        case 'shell': x.beginPath(); x.arc(8, 10, 6, Math.PI, 0); x.closePath(); x.fill(); x.fillStyle = D; x.fillRect(2, 10, 12, 2); x.fillStyle = L; x.fillRect(5, 6, 2, 2); break;
        case 'lens': x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = c2; x.beginPath(); x.arc(8, 8, 3, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.fillRect(5, 5, 2, 2); break;
        case 'fragment': x.beginPath(); x.moveTo(8, 1); x.lineTo(14, 5); x.lineTo(12, 14); x.lineTo(4, 14); x.lineTo(2, 5); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(6, 5, 2, 5); x.fillStyle = D; x.fillRect(9, 8, 3, 4); break;
        case 'wand': x.fillStyle = '#8b5a2b'; for (let i = 0; i < 11; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = col; x.fillRect(11, 1, 4, 4); x.fillStyle = L; x.fillRect(12, 2, 1, 1); break;
        case 'doll': x.fillRect(5, 6, 6, 7); x.fillRect(6, 2, 4, 4); x.fillRect(3, 7, 2, 4); x.fillRect(11, 7, 2, 4); x.fillStyle = '#000'; x.fillRect(7, 3, 1, 1); x.fillRect(9, 3, 1, 1); break;
        case 'cog': x.beginPath(); x.arc(8, 8, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = D; x.beginPath(); x.arc(8, 8, 2, 0, Math.PI * 2); x.fill(); x.fillStyle = col; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; x.fillRect(7 + Math.cos(a) * 7, 7 + Math.sin(a) * 7, 2, 2); } break;
        case 'bag': x.fillRect(3, 6, 10, 8); x.fillStyle = D; x.fillRect(5, 3, 6, 3); x.fillStyle = c2; x.fillRect(6, 8, 4, 3); x.fillStyle = L; x.fillRect(4, 7, 1, 5); break;
        case 'flask': x.fillRect(4, 8, 8, 6); x.fillRect(6, 2, 4, 6); x.fillStyle = c2; x.fillRect(5, 10, 6, 3); x.fillStyle = L; x.fillRect(7, 3, 1, 3); break;
        case 'meat': x.fillRect(2, 5, 12, 7); x.fillStyle = L; x.fillRect(3, 6, 4, 2); x.fillStyle = D; x.fillRect(9, 8, 4, 3); break;
        case 'eye': x.fillStyle = '#f0f0f0'; x.beginPath(); x.ellipse(8, 8, 7, 5, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = col; x.beginPath(); x.arc(8, 8, 3, 0, Math.PI * 2); x.fill(); x.fillStyle = '#000'; x.fillRect(7, 7, 2, 2); break;
        case 'seed': for (const [px, py] of [[3, 5], [8, 3], [12, 7], [5, 11], [10, 12]]) { x.beginPath(); x.ellipse(px + 1, py + 1, 2, 1.5, 0.5, 0, Math.PI * 2); x.fill(); } break;
        case 'tooth': x.beginPath(); x.moveTo(5, 2); x.lineTo(11, 2); x.lineTo(9, 14); x.lineTo(7, 14); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(6, 3, 1, 5); break;
        case 'tablet': x.fillRect(3, 2, 10, 12); x.fillStyle = c2; for (let i = 0; i < 4; i++) x.fillRect(5, 4 + i * 2, 6, 1); break;
        case 'wire': x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.moveTo(2, 12); x.quadraticCurveTo(6, 2, 8, 8); x.quadraticCurveTo(10, 14, 14, 4); x.stroke(); break;
        case 'hand': x.fillRect(4, 7, 8, 7); x.fillRect(4, 3, 2, 5); x.fillRect(7, 2, 2, 6); x.fillRect(10, 3, 2, 5); x.fillStyle = D; x.fillRect(4, 13, 8, 1); break;
        case 'crystal': x.beginPath(); x.moveTo(8, 1); x.lineTo(12, 6); x.lineTo(10, 15); x.lineTo(6, 15); x.lineTo(4, 6); x.closePath(); x.fill(); x.fillStyle = L; x.fillRect(7, 3, 1, 8); break;
        default: x.fillRect(3, 3, 10, 10); x.fillStyle = L; x.fillRect(4, 4, 3, 3);
      }
    };
  },
};
const VAN_FURNITURE = {};
// furniture sprites are generated when the sprite sheets are built (buildFurniture calls this)
VAN.buildSprites = function () { for (const tid in VAN_FURNITURE) { const f = VAN_FURNITURE[tid]; if (!Sprites.furniture[tid]) Sprites.furniture[tid] = f.o && f.o.copyOf != null && Sprites.furniture[f.o.copyOf] ? Sprites.furniture[f.o.copyOf] : this.sprite(f.w, f.h, f.style, f.col); } };
