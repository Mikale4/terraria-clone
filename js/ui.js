// ---------------------------------------------------------------------------
// UI: title screen, loading, HUD, inventory, crafting, chests, dialogs
// ---------------------------------------------------------------------------
'use strict';

const TIPS = [
  'Chop trees with an axe to gather wood. Ten wood makes a Work Bench.',
  'Slimes drop Gel. Combine Gel with Wood to craft Torches.',
  'Hold Shift to auto-select the right tool for whatever you point at.',
  'Press S while standing on a platform to drop through it.',
  'Zombies and Demon Eyes come out at night. Build a shelter before dusk!',
  'Ore is found deeper underground. Smelt it in a Furnace to make bars.',
  'An Anvil lets you craft metal tools and weapons from bars.',
  'Life Crystals hidden underground increase your maximum life.',
  'Chests in caves can contain rare tools and healing potions.',
  'Walls block sunlight. Use a hammer to remove them, from the edge inward.',
  'Falling more than 25 blocks hurts. Water breaks your fall.',
  'Sand falls when nothing is beneath it. Mind your head.',
  'Water and lava mix into Obsidian.',
  'Press Tab to view the map of everything you have explored.',
  'Left Ctrl toggles the Smart Cursor: your tool aims at the nearest block in the direction of the mouse.',
  'Press H to quickly drink a healing potion or eat a mushroom.',
  'Scroll the mouse wheel to change your selected hotbar slot.',
  'Campfires speed up life regeneration when you stand near them.',
  'Right-click a chest to open it. Shift-click moves items quickly.',
  'A Grappling Hook lets you zip to any wall. Press E to fire it.',
  'The deeper you go, the more dangerous it gets. Bring torches!',
  'Glass is made from sand in a Furnace. Windows make houses cozy.',
  'Six Lenses from Demon Eyes craft a Suspicious Looking Eye. Use it at night... if you dare.',
  'Town NPCs need houses: an enclosed room of at least 60 tiles with your own walls, a door, a chair, a table and a light.',
  'The Nurse heals you for coins. The Demolitionist sells explosives once you own one.',
  'Three or more town NPCs nearby keep enemies from spawning around your base (not during events).',
];

const WORLD_NAMES = ['Desertification', 'Verdant Reach', 'Hollow Vale', 'Sunlit Hollows', 'Mossgrove', 'Ashenmoor', 'Copperdown', 'Bramblewick', 'Frostfall', 'Duskmere'];

const MERCHANT_NAMES = ['Alfred', 'Barney', 'Calvin', 'Edmund', 'Frank', 'Gilbert', 'Harold', 'Louis', 'Milton', 'Ralph', 'Wilbur'];
const MERCHANT_LINES = [
  "Have a look at my wares. Coins talk, friend.",
  "Torches, potions, bombs... everything an adventurer needs, for a modest fee.",
  "Sell me your junk and I'll give you a fifth of what it's worth. That's business!",
  "Business is slow at night. Something about the zombies.",
  "The Guide sends you? He never buys anything.",
];

const GUIDE_LINES = [
  "I'm here to give you advice on what to do next. Talk to me anytime you get stuck.",
  "You should start by chopping down some trees. Wood is the foundation of everything.",
  "Once you have ten wood, craft a Work Bench. It opens up lots of new recipes.",
  "Slimes drop Gel. Mix it with wood at any time to craft torches. Caves are dark!",
  "When night falls, monsters get bolder. A wooden shelter with walls and a door keeps them out.",
  "Ore veins glitter in the stone underground. Smelt them in a Furnace, then forge on an Anvil.",
  "Life Crystals are hidden deep below. Each one makes you tougher.",
  "Hold Shift and I'll... well, the game will pick the right tool for you automatically.",
  "Walls behind your rooms block sunlight and monsters can't spawn inside.",
  "The underworld at the very bottom is full of lava. Hellstone forges the strongest gear.",
];

const UI = {
  scale: 1,
  buttons: [],
  hoverSlot: null,
  hoverRecipe: null,
  tooltip: null,
  craftScroll: 0,
  menuIndex: 0,
  fullMap: false, mapPan: { x: 0, y: 0 }, mapDrag: null,
  housingOpen: false,
  petPanel: false,
  achievementsOpen: false,
  mapMode: 0,        // M cycles: 0 minimap, 1 overlay, 2 hidden
  minimapZoom: 2,    // +/- while not in fullscreen
  hidden: false,
  mapZoom: 3,

  slotSize() { return Math.round(48 * this.scale); },

  // Register a clickable region for this frame
  button(x, y, w, h, id, data) { this.buttons.push({ x, y, w, h, id, data }); },
  hit(mx, my) { for (let i = this.buttons.length - 1; i >= 0; i--) { const b = this.buttons[i]; if (mx >= b.x && my >= b.y && mx < b.x + b.w && my < b.y + b.h) return b; } return null; },

  // ------------------------------------------------------------------------
  // parallax title backdrop from assets/bg_*.png (sky, far mountains, mid hills, near forest, ground)
  parallaxReady() {
    if (!this.bgImgs) { this.bgImgs = {}; this.bgOk = 0; this.bgFail = false; for (const k of ['sky', 'far', 'mid', 'near', 'ground']) { const im = new Image(); im.onload = () => { this.bgOk++; }; im.onerror = () => { this.bgFail = true; }; im.src = `assets/bg_${k}.png`; this.bgImgs[k] = im; } }
    return this.bgOk >= 5 && !this.bgFail;
  },
  drawParallax(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, t = game.titleCam.x;
    ctx.imageSmoothingEnabled = true;
    for (const [k, speed] of [['sky', 0.05], ['far', 0.15], ['mid', 0.3], ['near', 0.6], ['ground', 1]]) {
      const im = this.bgImgs[k]; const h = H, w = Math.round(im.width * h / im.height); if (!(w > 0)) continue;
      let x = -((t * speed) % w); if (x > 0) x -= w;
      for (; x < W; x += w) ctx.drawImage(im, Math.round(x), 0, w, h);
    }
    ctx.imageSmoothingEnabled = false;
  },

  drawLogo(ctx, cx, y, size) {
    // assets/logo.png when it exists (falls back to the procedural logo while it loads or if it is missing)
    if (!this.logoImg) { this.logoImg = new Image(); this.logoImg.onload = () => { this.logoOk = true; }; this.logoImg.onerror = () => { this.logoOk = false; }; this.logoImg.src = 'assets/logo.png'; }
    if (this.logoOk) {
      const img = this.logoImg, maxW = ctx.canvas.width * 0.8, h0 = size * 1.7; let w = img.width * h0 / img.height, h = h0;
      if (w > maxW) { h = h * maxW / w; w = maxW; }
      ctx.imageSmoothingEnabled = true; ctx.drawImage(img, Math.round(cx - w / 2), Math.round(y), Math.round(w), Math.round(h)); ctx.imageSmoothingEnabled = false;
      return;
    }
    // "Terraria"-style logo: dark outline, dirt fill, grass on top edges
    if (!this.logoCache || this.logoCache.size !== size) this.logoCache = this.buildLogo(size);
    const c = this.logoCache.canvas;
    ctx.drawImage(c, Math.round(cx - c.width / 2), Math.round(y));
  },

  buildLogo(size) {
    const text = 'Terraria';
    const tmp = makeCanvas(10, 10);
    const tc = tmp.getContext('2d');
    tc.font = `bold ${size}px ${UI_FONT}`;
    const w = Math.ceil(tc.measureText(text).width) + size + 40, h = Math.ceil(size * 1.5);
    const c = makeCanvas(w, h), x = c.getContext('2d');
    const tx = size * 0.55 + 20, ty = size * 0.15;
    // mask
    const mask = makeCanvas(w, h), m = mask.getContext('2d');
    m.font = `bold ${size}px ${UI_FONT}`; m.textBaseline = 'top'; m.fillStyle = '#fff'; m.fillText(text, tx, ty);
    const md = m.getImageData(0, 0, w, h).data;
    const out = x.createImageData(w, h), od = out.data;
    const rng = mulberry32(9);
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      const i = (xx + yy * w) * 4;
      if (md[i + 3] < 128) continue;
      // grass if within 7px of an upper edge
      let grass = false;
      for (let k = 1; k <= Math.round(size * 0.12); k++) { const j = (xx + (yy - k) * w) * 4; if (yy - k < 0 || md[j + 3] < 128) { grass = true; break; } }
      let col;
      if (grass) { col = rng() < 0.5 ? [60, 190, 70] : [80, 210, 90]; if (rng() < 0.2) col = [40, 150, 50]; }
      else { col = rng() < 0.5 ? [140, 90, 45] : [120, 78, 40]; if (rng() < 0.15) col = [160, 110, 60]; }
      od[i] = col[0]; od[i + 1] = col[1]; od[i + 2] = col[2]; od[i + 3] = 255;
    }
    // outline
    x.font = `bold ${size}px ${UI_FONT}`; x.textBaseline = 'top'; x.lineJoin = 'round';
    x.lineWidth = size * 0.12; x.strokeStyle = '#1e3a14'; x.strokeText(text, tx, ty);
    x.lineWidth = size * 0.06; x.strokeStyle = '#2e5a24'; x.strokeText(text, tx, ty);
    const fill = makeCanvas(w, h); fill.getContext('2d').putImageData(out, 0, 0);
    x.drawImage(fill, 0, 0);
    // little tree on the left
    const trX = size * 0.28, trY = ty + size * 0.1;
    x.fillStyle = '#6e4a2a'; x.fillRect(trX - size * 0.04, trY + size * 0.35, size * 0.08, size * 0.55);
    x.fillStyle = '#2e8a2a'; x.beginPath(); x.arc(trX, trY + size * 0.3, size * 0.22, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#48b046'; x.beginPath(); x.arc(trX - size * 0.06, trY + size * 0.24, size * 0.12, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#5a3a1e'; x.fillRect(trX - size * 0.12, trY + size * 0.86, size * 0.24, size * 0.05);
    return { canvas: c, size };
  },

  // ------------------------------------------------------------------------
  drawTitle(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    this.buttons = [];
    this.drawLogo(ctx, W / 2, H * 0.06, Math.min(150, W / 8));
    const items = game.menu.items;
    // fit the menu: long menus (world creation) get smaller rows, and the info text always sits below the last item
    const infoSize = 18, infoLines = game.menu.info ? wrapText(ctx, game.menu.info, W * 0.62, infoSize) : [];
    const infoH = infoLines.length ? infoLines.length * (infoSize + 6) + 18 : 0;
    const top = H * (items.length > 8 ? 0.28 : 0.36);
    let size = Math.round(34 * this.scale), step = size * 1.45;
    const avail = H - 44 - infoH - top;
    if (items.length * step > avail) { size = Math.max(16, Math.floor(size * avail / (items.length * step))); step = size * 1.45; }
    let y = top;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const w = measureText(ctx, it.label, size) + 40;
      const hovered = game.mouse.x >= W / 2 - w / 2 && game.mouse.x <= W / 2 + w / 2 && game.mouse.y >= y && game.mouse.y <= y + size * 1.2;
      drawText(ctx, it.label, W / 2, y, { size: hovered ? size * 1.12 : size, color: hovered ? '#ffe75a' : '#e8e8f0', align: 'center', lineWidth: 4 });
      this.button(W / 2 - w / 2, y, w, size * 1.2, 'menu', it);
      y += step;
    }
    if (infoLines.length) {
      let ly = Math.max(y + 12, Math.min(H * 0.78, H - 44 - infoH + 18));
      if (ly + infoH - 18 > H - 40) ly = y + 12;
      for (const l of infoLines) { drawText(ctx, l, W / 2, ly, { size: infoSize, align: 'center', color: '#d0d0e0' }); ly += infoSize + 6; }
    }
    drawText(ctx, 'v1.0 — fan-made clone, built from scratch', 8, H - 26, { size: 14, color: '#bbb' });
  },

  drawLoading(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    this.drawLogo(ctx, W / 2, H * 0.05, Math.min(150, W / 8));
    drawText(ctx, game.loading.worldName, W / 2, H * 0.36, { size: 34, align: 'center', color: '#fff' });
    drawText(ctx, game.loading.msg, W / 2, H * 0.36 + 44, { size: 20, align: 'center', color: '#ffe75a' });
    // progress bar
    const bw = Math.min(520, W * 0.5), bh = 22, bx = W / 2 - bw / 2, by = H * 0.36 + 82;
    ctx.fillStyle = '#101018'; roundRect(ctx, bx - 4, by - 4, bw + 8, bh + 8, 8); ctx.fill();
    ctx.fillStyle = '#2a2a3a'; roundRect(ctx, bx, by, bw, bh, 6); ctx.fill();
    const p = clamp(game.loading.p, 0, 1);
    const g = ctx.createLinearGradient(bx, by, bx + bw, by);
    g.addColorStop(0, '#3ab0e0'); g.addColorStop(1, '#40e070');
    ctx.fillStyle = g; roundRect(ctx, bx, by, Math.max(12, bw * p), bh, 6); ctx.fill();
    ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 3; roundRect(ctx, bx - 4, by - 4, bw + 8, bh + 8, 8); ctx.stroke();
    // grass tufts on the bar ends
    ctx.fillStyle = '#48b046'; ctx.fillRect(bx - 10, by - 10, 14, 6); ctx.fillRect(bx + bw - 4, by - 10, 14, 6);
    drawText(ctx, `${Math.round(p * 100)}%`, W / 2, by + bh + 10, { size: 16, align: 'center', color: '#ddd' });
    const lines = wrapText(ctx, game.loading.tip, W * 0.7, 20);
    let ly = H * 0.8;
    for (const l of lines) { drawText(ctx, l, W * 0.15, ly, { size: 20, color: '#eee' }); ly += 26; }
  },

  // ------------------------------------------------------------------------
  drawSlot(ctx, x, y, s, item, opt = {}) {
    const g = ctx.createLinearGradient(x, y, x, y + s);
    if (opt.selected) { g.addColorStop(0, 'rgba(240,210,90,0.95)'); g.addColorStop(1, 'rgba(200,160,50,0.95)'); }
    else if (opt.chest) { g.addColorStop(0, 'rgba(120,80,140,0.8)'); g.addColorStop(1, 'rgba(80,50,100,0.8)'); }
    else if (opt.trash) { g.addColorStop(0, 'rgba(140,60,60,0.8)'); g.addColorStop(1, 'rgba(90,40,40,0.8)'); }
    else { g.addColorStop(0, 'rgba(90,100,190,0.8)'); g.addColorStop(1, 'rgba(50,60,140,0.8)'); }
    ctx.fillStyle = g; roundRect(ctx, x, y, s, s, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(10,10,30,0.7)'; ctx.lineWidth = 2; roundRect(ctx, x, y, s, s, 6); ctx.stroke();
    ctx.strokeStyle = opt.selected ? 'rgba(255,255,220,0.5)' : 'rgba(180,190,255,0.35)'; ctx.lineWidth = 1; roundRect(ctx, x + 2, y + 2, s - 4, s - 4, 5); ctx.stroke();
    if (opt.hover) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; roundRect(ctx, x, y, s, s, 6); ctx.fill(); }
    if (item) this.drawItemIcon(ctx, item.id, x + s / 2, y + s / 2, s * 0.68);
    if (item && item.count > 1) drawText(ctx, item.count, x + s - 4, y + s - 4, { size: Math.round(s * 0.3), align: 'right', baseline: 'bottom', color: '#fff' });
    if (opt.label != null) drawText(ctx, opt.label, x + 4, y + 2, { size: Math.round(s * 0.26), color: 'rgba(255,255,255,0.8)' });
  },

  drawItemIcon(ctx, id, cx, cy, maxSize) {
    const ic = Sprites.icons[id];
    if (!ic) return;
    const big = Math.max(ic.width, ic.height);
    let scale = maxSize / 16;
    if (big > 16) scale = maxSize / big;
    scale = Math.max(1, Math.floor(scale * 2) / 2);
    const w = ic.width * scale, h = ic.height * scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ic, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
  },

  slotRect(index) {
    const s = this.slotSize(), gap = Math.round(6 * this.scale);
    const x0 = 20, y0 = 44;
    if (index < 10) return { x: x0 + index * (s + gap), y: y0, s };
    const r = Math.floor((index - 10) / 10), c = (index - 10) % 10;
    const s2 = Math.round(s * 0.9);
    return { x: x0 + c * (s2 + gap), y: y0 + s + gap + 8 + r * (s2 + gap), s: s2 };
  },

  chestSlotRect(index) {
    const s = Math.round(this.slotSize() * 0.9), gap = Math.round(6 * this.scale);
    const inv = this.slotRect(49);
    const x0 = 20, y0 = inv.y + inv.s + 44;
    const r = Math.floor(index / 10), c = index % 10;
    return { x: x0 + c * (s + gap), y: y0 + r * (s + gap), s };
  },

  // ------------------------------------------------------------------------
  drawHUD(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const p = game.player, mouse = game.mouse;
    this.buttons = [];
    this.hoverSlot = null; this.hoverRecipe = null; this.tooltip = null; this.hoverBuff = null;
    const s = this.slotSize();
    if (this.hidden && !game.settingsOpen && !game.invOpen) { if (game.dialog) this.drawDialog(game); return; }
    if (!this.fullMap && this.mapMode === 1) this.drawOverlayMap(game);

    // --- hotbar ---
    const selName = p.selectedItem ? itemDisplayName(p.selectedItem) : '';
    drawText(ctx, game.invOpen ? 'Inventory' : selName, 22, 14, { size: Math.round(20 * this.scale), color: '#fff' });
    for (let i = 0; i < 10; i++) {
      const r = this.slotRect(i);
      const sel = i === p.selected;
      const grow = sel ? 6 : 0;
      const hover = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
      this.drawSlot(ctx, r.x - grow / 2, r.y - grow / 2, r.s + grow, p.inventory[i], { selected: sel, hover: hover && game.invOpen, label: (i + 1) % 10 });
      this.button(r.x, r.y, r.s, r.s, 'slot', i);
      if (hover) this.hoverSlot = i;
    }

    // --- inventory ---
    if (game.invOpen) {
      for (let i = 10; i < 50; i++) {
        const r = this.slotRect(i);
        const hover = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, p.inventory[i], { hover });
        this.button(r.x, r.y, r.s, r.s, 'slot', i);
        if (hover) this.hoverSlot = i;
      }
      // trash
      const last = this.slotRect(49);
      const tr = { x: last.x + last.s + 16, y: last.y, s: last.s };
      const th = mouse.x >= tr.x && mouse.y >= tr.y && mouse.x < tr.x + tr.s && mouse.y < tr.y + tr.s;
      this.drawSlot(ctx, tr.x, tr.y, tr.s, game.trash, { trash: true, hover: th });
      drawText(ctx, 'Trash', tr.x + tr.s / 2, tr.y + tr.s + 2, { size: 12, align: 'center', color: '#ffb0b0' });
      this.button(tr.x, tr.y, tr.s, tr.s, 'trash');
      if (th) this.hoverSlot = 'trash';
      // Sort / Quick Stack (Terraria's inventory buttons) under the trash slot
      { const bw = tr.s + 26, bx = tr.x - 13; let by = tr.y + tr.s + 18;
        for (const [label, id, tip] of [['Sort', 'sortinv', 'Sort Inventory'], ['Quick Stack', 'quickstack', 'Quick Stack to Nearby Chests']]) {
          const hov = mouse.x >= bx && mouse.x < bx + bw && mouse.y >= by && mouse.y < by + 22;
          ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, bx, by, bw, 22, 5); ctx.fill();
          drawText(ctx, label, bx + bw / 2, by + 4, { size: 12, align: 'center', color: hov ? '#ffe75a' : '#fff' });
          this.button(bx, by, bw, 22, id); if (hov) this.hoverSlot = 'btn:' + tip; by += 26;
        } }

      // armor slots (head / body / legs) to the right of the inventory
      const a0 = this.slotRect(19);
      const ax = tr.x + tr.s + 16;
      drawText(ctx, 'Armor', ax, a0.y - 4 - 18, { size: 14, color: '#fff' });
      for (let k = 0; k < 3; k++) {
        const r = { x: ax, y: a0.y + k * (a0.s + 6), s: a0.s };
        const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, p.armor[k], { chest: true, hover: hov });
        if (!p.armor[k]) drawText(ctx, ['Head', 'Body', 'Legs'][k], r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 12, align: 'center', color: 'rgba(255,255,255,0.5)' });
        this.button(r.x, r.y, r.s, r.s, 'armor', k);
        if (hov) this.hoverSlot = 'armor' + k;
      }
      drawText(ctx, `Defense: ${p.defense}`, ax, a0.y + 3 * (a0.s + 6) + 2, { size: 14, color: '#ddd' });
      // pet slots (Pets Overhaul): regular + light
      const py0 = a0.y + 3 * (a0.s + 6) + 22;
      drawText(ctx, 'Pets', ax, py0 - 2, { size: 14, color: '#fff' }); // pets are vanilla: the slots always show
      for (let k = 0; k < 2; k++) {
        const r = { x: ax, y: py0 + 16 + k * (a0.s + 6), s: a0.s };
        const item = k === 0 ? game.pets.pet : game.pets.light;
        const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, item, { chest: true, hover: hov });
        if (!item) drawText(ctx, k === 0 ? 'Pet' : 'Light', r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 12, align: 'center', color: 'rgba(255,255,255,0.5)' });
        this.button(r.x, r.y, r.s, r.s, 'petslot', k);
        if (hov) this.hoverSlot = 'pet' + k;
      }
      // accessory slots (to the right of the pet column)
      const acx = ax + a0.s + 10;
      drawText(ctx, 'Acc.', acx, a0.y - 4 - 18, { size: 14, color: '#fff' });
      const nAcc = AccessoriesPlus.slotCount(game);
      for (let k = 0; k < nAcc; k++) {
        const r = { x: acx, y: a0.y + k * (a0.s + 6), s: a0.s };
        const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, p.accessories[k], { chest: true, hover: hov, selected: k === 3 });
        if (k === 3 && !p.accessories[k]) drawText(ctx, game.master ? 'Master' : 'Expert', r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 10, align: 'center', color: 'rgba(255,255,255,0.7)' });
        this.button(r.x, r.y, r.s, r.s, 'accslot', k);
        if (hov) this.hoverSlot = 'acc' + k;
      }
      // Accessories+: dedicated boots / shield / wings slots
      const eqx = acx + a0.s + 10;
      drawText(ctx, 'Gear', eqx, a0.y - 4 - 18, { size: 14, color: '#fff' });
      EQUIP_SLOTS.forEach((key, k) => {
        const r = { x: eqx, y: a0.y + k * (a0.s + 6), s: a0.s };
        const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, p.equipment[key], { chest: true, hover: hov });
        if (!p.equipment[key]) drawText(ctx, key, r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 11, align: 'center', color: 'rgba(255,255,255,0.5)' });
        this.button(r.x, r.y, r.s, r.s, 'eqslot', key);
        if (hov) this.hoverSlot = 'eq' + key;
      });
      // Equipment: vanity + dye columns, loadout buttons
      Equipment.init(p);
      const vx = eqx + a0.s + 10, dx = vx + a0.s + 10;
      drawText(ctx, 'Vanity', vx, a0.y - 4 - 18, { size: 14, color: '#fff' }); drawText(ctx, 'Dye', dx, a0.y - 4 - 18, { size: 14, color: '#fff' });
      for (let k = 0; k < 3; k++) {
        const r = { x: vx, y: a0.y + k * (a0.s + 6), s: a0.s }; const hov = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
        this.drawSlot(ctx, r.x, r.y, r.s, p.vanity[k], { chest: true, hover: hov }); if (!p.vanity[k]) drawText(ctx, ['head', 'body', 'legs'][k], r.x + r.s / 2, r.y + r.s / 2 - 7, { size: 11, align: 'center', color: 'rgba(255,255,255,0.5)' });
        this.button(r.x, r.y, r.s, r.s, 'vanslot', k); if (hov) this.hoverSlot = 'van' + k;
        const r2 = { x: dx, y: r.y, s: a0.s }; const hov2 = mouse.x >= r2.x && mouse.y >= r2.y && mouse.x < r2.x + r2.s && mouse.y < r2.y + r2.s;
        this.drawSlot(ctx, r2.x, r2.y, r2.s, p.dyes[k], { chest: true, hover: hov2 }); if (!p.dyes[k]) drawText(ctx, 'dye', r2.x + r2.s / 2, r2.y + r2.s / 2 - 7, { size: 11, align: 'center', color: 'rgba(255,255,255,0.5)' });
        this.button(r2.x, r2.y, r2.s, r2.s, 'dyeslot', k); if (hov2) this.hoverSlot = 'dye' + k;
      }
      for (let k = 0; k < 3; k++) { const bx = ax - 30, by = a0.y + k * 26; const on = p.loadout === k; ctx.fillStyle = on ? '#ffe75a' : 'rgba(255,255,255,0.15)'; roundRect(ctx, bx, by, 22, 22, 5); ctx.fill(); drawText(ctx, String(k + 1), bx + 11, by + 3, { size: 13, align: 'center', color: on ? '#000' : '#fff', outline: null }); this.button(bx, by, 22, 22, 'loadout', k); }
      drawText(ctx, 'Set', ax - 30, a0.y - 4 - 18, { size: 12, color: '#bbb' });
      ModLib.emit('drawInventory', game, { ax, a0, acx, eqx, vx, dx });
      // coins
      const cy0 = this.slotRect(10).y;
      const cx0 = dx + a0.s + 24;
      drawText(ctx, 'Coins', cx0, cy0 - 22, { size: 14, color: '#fff' });
      const parts = formatCoins(p.coins);
      let cyy = cy0;
      for (const part of parts) {
        this.drawItemIcon(ctx, part.id, cx0 + 12, cyy + 12, 22);
        drawText(ctx, `${part.n}`, cx0 + 30, cyy + 3, { size: 16, color: part.color });
        cyy += 28;
      }
      // housing menu button
      const hbx = cx0 + 90, hby = cy0 - 4;
      const hbHov = mouse.x >= hbx && mouse.x < hbx + 44 && mouse.y >= hby && mouse.y < hby + 44;
      ctx.fillStyle = this.housingOpen ? 'rgba(240,210,90,0.9)' : hbHov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, hbx, hby, 44, 44, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(10,10,30,0.7)'; ctx.lineWidth = 2; roundRect(ctx, hbx, hby, 44, 44, 6); ctx.stroke();
      // little house icon
      ctx.fillStyle = '#a8794b'; ctx.fillRect(hbx + 12, hby + 20, 20, 16); ctx.fillStyle = '#b03a3a'; ctx.beginPath(); ctx.moveTo(hbx + 8, hby + 21); ctx.lineTo(hbx + 22, hby + 8); ctx.lineTo(hbx + 36, hby + 21); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a3c22'; ctx.fillRect(hbx + 19, hby + 26, 6, 10);
      drawText(ctx, 'Housing', hbx + 22, hby + 46, { size: 12, align: 'center', color: '#fff' });
      this.button(hbx, hby, 44, 44, 'housing');
      if (hbHov) this.hoverBuff = 'Housing';
      this.housingPanelPos = this.housingOpen ? [hbx + 54, hby] : null;

      // chest
      if (game.openChest) {
        const c0 = this.chestSlotRect(0);
        drawText(ctx, game.openChest.name || 'Chest', c0.x, c0.y - 26, { size: 20, color: '#fff' });
        const inv = game.openChest.inv;
        for (let i = 0; i < 40; i++) {
          const r = this.chestSlotRect(i);
          const hover = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
          this.drawSlot(ctx, r.x, r.y, r.s, inv[i], { chest: true, hover });
          this.button(r.x, r.y, r.s, r.s, 'chestslot', i);
          if (hover) this.hoverSlot = 'chest' + i;
        }
        // buttons
        const bx = c0.x + 10 * (c0.s + 6) + 10;
        const mkBtn = (label, id, yy) => {
          const w = measureText(ctx, label, 18) + 20;
          const hov = mouse.x >= bx && mouse.x < bx + w && mouse.y >= yy && mouse.y < yy + 28;
          ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, bx, yy, w, 28, 6); ctx.fill();
          drawText(ctx, label, bx + w / 2, yy + 5, { size: 18, align: 'center', color: hov ? '#ffe75a' : '#fff' });
          this.button(bx, yy, w, 28, id);
        };
        mkBtn('Loot All', 'lootall', c0.y);
        mkBtn('Deposit All', 'depositall', c0.y + 36);
        mkBtn('Quick Stack', 'quickstack_chest', c0.y + 72);
        mkBtn('Restock', 'restock', c0.y + 108);
        mkBtn('Sort', 'sortchest', c0.y + 144);
        mkBtn('Close', 'closechest', c0.y + 180);
      }

      // merchant shop
      if (game.shop) {
        const c0 = this.chestSlotRect(0);
        drawText(ctx, 'Shop  (click to buy, Shift+click your items to sell)', c0.x, c0.y - 26, { size: 20, color: '#fff' });
        for (let i = 0; i < 40; i++) {
          const r = this.chestSlotRect(i);
          const entry = game.shop[i];
          const hover = mouse.x >= r.x && mouse.y >= r.y && mouse.x < r.x + r.s && mouse.y < r.y + r.s;
          this.drawSlot(ctx, r.x, r.y, r.s, entry ? { id: entry.id, count: 1 } : null, { chest: true, hover });
          if (entry) { this.button(r.x, r.y, r.s, r.s, 'shopslot', i); if (hover) this.hoverSlot = 'shop' + i; }
        }
        const bx = c0.x + 10 * (c0.s + 6) + 10;
        const w = measureText(ctx, 'Close', 18) + 20;
        const hov = mouse.x >= bx && mouse.x < bx + w && mouse.y >= c0.y && mouse.y < c0.y + 28;
        ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, bx, c0.y, w, 28, 6); ctx.fill();
        drawText(ctx, 'Close', bx + w / 2, c0.y + 5, { size: 18, align: 'center', color: hov ? '#ffe75a' : '#fff' });
        this.button(bx, c0.y, w, 28, 'closeshop');
      }

      // crafting
      this.drawCrafting(game);
    }

    // --- buffs & debuffs (below the hotbar) ---
    {
      const names = Object.keys(p.buffs);
      const h9 = this.slotRect(9);
      let bx = game.invOpen ? h9.x + h9.s + 24 : 22; const by = game.invOpen ? h9.y + 4 : this.slotRect(0).y + this.slotSize() + 8;
      for (const name of names) {
        const t = p.buffs[name];
        const debuff = name === 'Potion Sickness' || name === 'On Fire!' || name === 'Poisoned' || name === 'Mana Sickness';
        const col = name === 'On Fire!' ? '#ff7020' : name === 'Potion Sickness' ? '#a070ff' : name === 'Mana Sickness' ? '#4060ff' : name === 'Cozy Fire' ? '#ffb040' : '#60c060';
        ctx.fillStyle = debuff ? 'rgba(120,40,40,0.85)' : 'rgba(40,80,60,0.85)'; roundRect(ctx, bx, by, 30, 30, 5); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx + 15, by + 15, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; roundRect(ctx, bx, by, 30, 30, 5); ctx.stroke();
        const secs = Math.ceil(t / 60);
        if (t < 60 * 60 * 10 && name !== 'Cozy Fire') drawText(ctx, secs >= 60 ? `${Math.floor(secs / 60)}m` : `${secs}s`, bx + 15, by + 32, { size: 11, align: 'center', color: '#fff' });
        if (mouse.x >= bx && mouse.x < bx + 30 && mouse.y >= by && mouse.y < by + 30) this.hoverBuff = name;
        bx += 36;
      }
    }

    // --- cursor item ---
    if (p.cursorItem) {
      this.drawItemIcon(ctx, p.cursorItem.id, mouse.x + 12, mouse.y + 14, s * 0.7);
      if (p.cursorItem.count > 1) drawText(ctx, p.cursorItem.count, mouse.x + 30, mouse.y + 30, { size: 14 });
    }

    // --- life ---
    const hearts = Math.ceil(p.maxHp / 20);
    const hs = Math.round(24 * this.scale);
    const hx0 = W - 20 - Math.min(hearts, 10) * (hs + 2), hy0 = 36;
    drawText(ctx, `Life: ${p.hp}/${p.maxHp}`, W - 22, 12, { size: Math.round(18 * this.scale), align: 'right', color: '#fff' });
    for (let i = 0; i < hearts; i++) {
      const hx = hx0 + (i % 10) * (hs + 2), hy = hy0 + Math.floor(i / 10) * (hs + 2);
      const frac = clamp((p.hp - i * 20) / 20, 0, 1);
      ctx.globalAlpha = 0.35; ctx.drawImage(Sprites.misc.heart, hx, hy, hs, hs); ctx.globalAlpha = 1;
      if (frac > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(hx, hy + hs * (1 - frac), hs, hs * frac); ctx.clip();
        const pulse = p.hp < p.maxHp * 0.25 ? 0.85 + 0.15 * Math.sin(game.renderer.frame * 0.2) : 1;
        ctx.globalAlpha = pulse;
        ctx.drawImage(Sprites.misc.heart, hx, hy, hs, hs); ctx.restore(); ctx.globalAlpha = 1;
      }
    }
    // mana stars (one per 20 mana) down the right side
    {
      const stars = Math.ceil(p.maxMana / 20), ss = Math.round(20 * this.scale);
      const sx = W - 16 - ss, sy0 = hy0 + Math.ceil(hearts / 10) * (hs + 2) + 200;
      drawText(ctx, `Mana: ${p.mana}/${p.maxMana}`, W - 22, sy0 - 20, { size: Math.round(14 * this.scale), align: 'right', color: '#c0d0ff' });
      for (let i = 0; i < stars; i++) {
        const y = sy0 + i * (ss + 1), frac = clamp((p.mana - i * 20) / 20, 0, 1);
        ctx.globalAlpha = 0.3 + 0.7 * frac; ctx.fillStyle = frac > 0 ? '#60a0ff' : '#304060';
        ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? ss * 0.2 : ss * 0.45; ctx.lineTo(sx + ss / 2 + Math.cos(a) * r, y + ss / 2 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1;
      }
      // Throarbin: miniature mana bar over the head while mana is not full
      if (p.mana < p.maxMana && !p.dead) {
        const bx = (p.cx - game.cam.x) * game.renderer.zoom - 20, by = (p.y - game.cam.y) * game.renderer.zoom - 14;
        ctx.fillStyle = 'rgba(0,0,20,0.7)'; ctx.fillRect(bx, by, 40, 6);
        ctx.fillStyle = '#60a0ff'; ctx.fillRect(bx + 1, by + 1, 38 * (p.mana / p.maxMana), 4);
      }
    }
    // wings: flight time bar
    if (p.eq && p.eq.flight > 0 && !p.onGround && p.flightTime < p.eq.flight) { const bx = (p.cx - game.cam.x) * game.renderer.zoom - 20, by = (p.y - game.cam.y) * game.renderer.zoom - 22; ctx.fillStyle = 'rgba(0,20,0,0.7)'; ctx.fillRect(bx, by, 40, 5); ctx.fillStyle = '#80e080'; ctx.fillRect(bx + 1, by + 1, 38 * (p.flightTime / p.eq.flight), 3); }
    // breath
    if (p.breath < p.maxBreath) {
      const bubbles = 10, by = hy0 + Math.ceil(hearts / 10) * (hs + 2) + 6;
      for (let i = 0; i < bubbles; i++) {
        const on = p.breath / p.maxBreath * bubbles > i;
        ctx.fillStyle = on ? 'rgba(120,200,255,0.9)' : 'rgba(120,200,255,0.2)';
        ctx.beginPath(); ctx.arc(hx0 + i * (hs + 2) + hs / 2, by + 8, 7, 0, Math.PI * 2); ctx.fill();
      }
    }

    // --- minimap ---
    if (!this.fullMap && this.mapMode === 0 && !(game.invOpen && W < 1400)) this.drawMinimap(game, W - 20 - 260, hy0 + Math.ceil(hearts / 10) * (hs + 2) + 30, 260, 170);
    if (game.invOpen && this.housingPanelPos) this.drawHousing(game, this.housingPanelPos[0], this.housingPanelPos[1]);

    // --- settings button ---
    {
      const label = 'Settings';
      const w = measureText(ctx, label, 20) + 20;
      const bx = W - 20 - w, by = H - 40;
      const hov = mouse.x >= bx && mouse.x < bx + w && mouse.y >= by && mouse.y < by + 30;
      drawText(ctx, label, bx + w / 2, by + 4, { size: 20, align: 'center', color: hov ? '#ffe75a' : '#fff' });
      this.button(bx, by, w, 30, 'settings');
    }

    // --- messages ---
    let my = H - 40 - (game.boss && !game.boss.dead ? 70 : 0);
    for (let i = game.messages.length - 1; i >= 0; i--) {
      const m = game.messages[i];
      ctx.globalAlpha = clamp(m.life / 60, 0, 1);
      drawText(ctx, m.text, 20, my, { size: 18, color: m.color });
      my -= 24;
    }
    ctx.globalAlpha = 1;

    // --- boss health bar ---
    if (game.boss && !game.boss.dead) {
      const b = game.boss;
      const bw = Math.min(480, W * 0.5), bh = 22, bx = W / 2 - bw / 2, by = H - 70;
      drawText(ctx, b.spell ? `${b.name}  -  ${b.spell.name}` : b.name, W / 2, by - 26, { size: 20, align: 'center', color: b.spell ? '#ffd0ff' : '#fff' });
      ctx.fillStyle = '#101018'; roundRect(ctx, bx - 3, by - 3, bw + 6, bh + 6, 6); ctx.fill();
      ctx.fillStyle = '#3a1010'; roundRect(ctx, bx, by, bw, bh, 4); ctx.fill();
      const g = ctx.createLinearGradient(bx, by, bx, by + bh); g.addColorStop(0, '#ff5050'); g.addColorStop(1, '#a01818');
      ctx.fillStyle = g; roundRect(ctx, bx, by, Math.max(6, bw * clamp(b.hp / b.maxHp, 0, 1)), bh, 4); ctx.fill();
      ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 2; roundRect(ctx, bx - 3, by - 3, bw + 6, bh + 6, 6); ctx.stroke();
      drawText(ctx, `${Math.max(0, b.hp)} / ${b.maxHp}`, W / 2, by + 2, { size: 16, align: 'center', color: '#fff' });
    }

    // --- death screen ---
    if (p.dead) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
      drawText(ctx, 'You were slain...', W / 2, H * 0.36, { size: 44, align: 'center', color: '#ff5050', lineWidth: 6 });
      drawText(ctx, game.deathMsg, W / 2, H * 0.36 + 58, { size: 22, align: 'center', color: '#ffb0b0' });
      if (game.lostCoins > 0) drawText(ctx, `You dropped: ${coinsToString(game.lostCoins)}`, W / 2, H * 0.36 + 92, { size: 20, align: 'center', color: '#ffe75a' });
      drawText(ctx, `Respawning in ${Math.ceil(p.deadTimer / 60)}...`, W / 2, H * 0.36 + 126, { size: 24, align: 'center', color: '#fff' });
    }

    // --- NPC dialog ---
    if (game.dialog) this.drawDialog(game);

    // --- settings menu ---

    // --- full map ---
    if (this.fullMap) this.drawFullMap(game);

    // --- pet ability / stacks indicator ---
    if (game.pets.pet) {
      const ps = game.pets, pd = PETS[ps.pet.id];
      const bx = W - 300, by = H - 110;
      ctx.fillStyle = 'rgba(20,20,50,0.75)'; roundRect(ctx, bx, by, 280, 40, 8); ctx.fill();
      this.drawItemIcon(ctx, ps.pet.id, bx + 22, by + 20, 28);
      let line = pd.name;
      if (pd.ability) line += ps.cooldown > 0 ? `  -  ${pd.ability.name}: ${Math.ceil(ps.cooldown / 60)}s` : `  -  ${pd.ability.name} ready (F)`;
      drawText(ctx, line, bx + 44, by + 4, { size: 14, color: ps.cooldown > 0 ? '#ffb080' : '#a0ffa0' });
      let sub = '';
      if (ps.pet.id === 'tartar_sauce') sub = `Stacks: ${ps.stacks}/80`;
      else if (ps.pet.id === 'brain_jar') sub = `Health pool: ${ps.pool}/${Math.floor(p.maxHp * 0.3)}`;
      else if (ps.pet.id === 'carrot') sub = `Jump stacks: ${ps.jumpStacks}/10`;
      else if (ps.pet.id === 'bone_rattle') sub = `Out of combat: ${Math.floor(ps.oocTimer / 60)}s`;
      else if (ps.pet.id === 'seaweed' && ps.hardened > 0) sub = `Hardened: ${ps.hardened} hits left`;
      else if (ps.pet.id === 'grinning_eye' && ps.enrage > 0) sub = `ENRAGED ${Math.ceil(ps.enrage / 60)}s  rage ${ps.rage}`;
      else if (ps.pet.id === 'hell_cake') sub = `Lava immunity: ${(ps.lavaTimer / 60).toFixed(1)}s`;
      else if (ps.pet.id === 'bamboo_leaf' && ps.alert > 0) sub = `Alert: ${Math.ceil(ps.alert / 60)}s`;
      if (ps.shield > 0) sub += (sub ? '   ' : '') + `Shield: ${ps.shield}`;
      if (ps.cooldown > 0 && pd.ability) { ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(bx + 44, by + 34, 230 * (1 - ps.cooldown / ps.cdMax), 3); }
      if (sub) drawText(ctx, sub, bx + 44, by + 20, { size: 13, color: '#ddd' });
    } else if (game.pets.shield > 0) drawText(ctx, `Shield: ${game.pets.shield}`, W - 22, 40 + hs * 2 + 10, { size: 14, align: 'right', color: '#80c0ff' });

    // --- achievement toasts ---
    if (game.toasts && game.toasts.length) {
      const t = game.toasts[0];
      const tw = Math.max(measureText(ctx, t.text, 20), measureText(ctx, t.sub, 14)) + 60;
      const tx = W / 2 - tw / 2, ty = 80;
      ctx.globalAlpha = clamp(t.life / 40, 0, 1);
      ctx.fillStyle = 'rgba(40,30,10,0.9)'; roundRect(ctx, tx, ty, tw, 56, 10); ctx.fill();
      ctx.strokeStyle = '#ffd040'; ctx.lineWidth = 2; roundRect(ctx, tx, ty, tw, 56, 10); ctx.stroke();
      ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.arc(tx + 26, ty + 28, 14, 0, Math.PI * 2); ctx.fill(); drawText(ctx, '\u2605', tx + 26, ty + 17, { size: 18, align: 'center', color: '#7a5000', outline: null });
      drawText(ctx, t.text, tx + 50, ty + 8, { size: 20, color: '#ffe080' }); drawText(ctx, t.sub, tx + 50, ty + 32, { size: 14, color: '#ddd' });
      ctx.globalAlpha = 1;
    }
    if (this.petPanel) this.drawPetPanel(game);
    if (this.achievementsOpen) this.drawAchievements(game);
    if (Reforge.open) this.drawReforge(game);

    // --- tooltips ---
    this.drawTooltip(game);

    // --- tile hover info (name) ---
    if (!game.invOpen && game.hoverTile && !game.dialog && !game.settingsOpen && !this.fullMap) {
      const t = game.world.get(game.hoverTile.x, game.hoverTile.y);
      const wl = game.world.getWall(game.hoverTile.x, game.hoverTile.y);
      let name = t !== T.AIR ? TILES[t].name : (wl ? WALLS[wl].name : null);
      if (t === T.TOMBSTONE && game.world.tombstones) { const a = game.world.furnitureAnchor(game.hoverTile.x, game.hoverTile.y); const msg = game.world.tombstones.get(game.world.idx(a.x, a.y)); if (msg) name = msg; }
      if (name) drawText(ctx, name, mouse.x + 18, mouse.y + 22, { size: 15, color: '#fff' });
    }
  },

  drawMinimap(game, x, y, w, h) {
    const ctx = game.renderer.ctx;
    const world = game.world, p = game.player;
    ctx.fillStyle = 'rgba(10,10,20,0.85)'; roundRect(ctx, x, y, w, h, 8); ctx.fill();
    ctx.save(); roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 6); ctx.clip();
    const z = this.minimapZoom;
    const tw = (w - 8) / z, th = (h - 8) / z;
    const sx = clamp(p.tileX - tw / 2, 0, world.w - tw), sy = clamp(p.tileY - th / 2, 0, world.h - th);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(game.renderer.mapCanvas, sx, sy, tw, th, x + 4, y + 4, w - 8, h - 8);
    // player marker
    const px = x + 4 + (p.tileX - sx) * z, py = y + 4 + (p.tileY - sy) * z;
    ctx.fillStyle = '#ff4040'; ctx.fillRect(px - 2, py - 3, 4, 6);
    ctx.fillStyle = '#f2c6a0'; ctx.fillRect(px - 2, py - 3, 4, 2);
    // npcs
    for (const n of game.npcs) { const nx = x + 4 + (n.tileX - sx) * z, ny = y + 4 + (n.tileY - sy) * z; ctx.fillStyle = '#40e060'; ctx.fillRect(nx - 2, ny - 2, 4, 4); }
    // boss loot on the ground (Boss Checklist)
    for (const d of game.drops) if (d.id && BOSSES.some(b => b.loot.includes(d.id) || b.collectibles.includes(d.id))) { ctx.fillStyle = '#ffe040'; ctx.fillRect(x + 4 + (d.cx / TILE - sx) * z - 2, y + 4 + (d.cy / TILE - sy) * z - 2, 4, 4); }
    if (game.boss && !game.boss.dead) { ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(x + 4 + (game.boss.cx / TILE - sx) * z, y + 4 + (game.boss.cy / TILE - sy) * z, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    // gold frame
    ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 3; roundRect(ctx, x, y, w, h, 8); ctx.stroke();
    ctx.strokeStyle = '#7a5a10'; ctx.lineWidth = 1; roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 6); ctx.stroke();
    // corner ornaments
    ctx.fillStyle = '#e0c050';
    for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); }
    drawText(ctx, 'M: map style   Tab: full map   +/-: zoom', x + w - 4, y + h + 4, { size: 12, align: 'right', color: '#bbb' });
  },

  // Auto Reforge Plus window
  drawReforge(game) {
    const ctx = game.renderer.ctx, mouse = game.mouse, p = game.player, R = Reforge;
    const w = 330, cols = 2, rowH = 22, listH = Math.ceil(PREFIXES.length / cols) * rowH;
    const h = 150 + listH + (R.hideVanilla ? 0 : 34) + 40;
    const x = R.win.x, y = R.win.y;
    ctx.fillStyle = 'rgba(20,20,50,0.94)'; roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = R.win.locked ? '#c8a030' : 'rgba(120,130,220,0.8)'; ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, 10); ctx.stroke();
    // title bar (drag handle)
    ctx.fillStyle = 'rgba(60,70,160,0.9)'; roundRect(ctx, x, y, w, 28, 10); ctx.fill(); ctx.fillRect(x, y + 14, w, 14);
    drawText(ctx, 'Auto Reforge Plus', x + 10, y + 5, { size: 16, color: '#fff' });
    this.button(x, y, w - 90, 28, 'reforge_drag');
    const lockHov = mouse.x >= x + w - 86 && mouse.x < x + w - 48 && mouse.y >= y + 4 && mouse.y < y + 24;
    ctx.fillStyle = R.win.locked ? '#c8a030' : (lockHov ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'); roundRect(ctx, x + w - 86, y + 4, 38, 20, 5); ctx.fill();
    drawText(ctx, R.win.locked ? 'Lock' : 'Free', x + w - 67, y + 6, { size: 12, align: 'center' }); this.button(x + w - 86, y + 4, 38, 20, 'reforge_lock');
    ctx.fillStyle = 'rgba(160,60,60,0.9)'; roundRect(ctx, x + w - 44, y + 4, 36, 20, 5); ctx.fill(); drawText(ctx, 'X', x + w - 26, y + 5, { size: 14, align: 'center' }); this.button(x + w - 44, y + 4, 36, 20, 'reforge_close');
    // item slot + info
    const s = 44, sx = x + 12, sy = y + 40;
    const shov = mouse.x >= sx && mouse.x < sx + s && mouse.y >= sy && mouse.y < sy + s;
    this.drawSlot(ctx, sx, sy, s, R.item, { selected: !!R.item, hover: shov }); this.button(sx, sy, s, s, 'reforge_slot');
    if (!R.item) drawText(ctx, 'item', sx + s / 2, sy + s / 2 - 6, { size: 11, align: 'center', color: 'rgba(255,255,255,0.5)' });
    if (R.item) {
      const st = itemStats(R.item);
      drawText(ctx, itemDisplayName(R.item), sx + s + 10, sy, { size: 15, color: st.prefix ? (st.prefix.tier >= 2 ? '#78dc78' : st.prefix.tier === 1 ? '#9090ff' : '#ff8080') : '#fff' });
      drawText(ctx, `Cost: ${coinsToString(R.cost(R.item))}   You have: ${coinsToString(p.coins)}`, sx + s + 10, sy + 18, { size: 12, color: '#ffe75a' });
      drawText(ctx, `Reforges: ${R.count}   Spent: ${coinsToString(R.spent)}`, sx + s + 10, sy + 32, { size: 12, color: '#ccc' });
    } else drawText(ctx, 'Click with an item, or click the slot to use your held item', sx + s + 10, sy + 4, { size: 12, color: '#ccc' });
    let ly = sy + s + 8;
    if (!R.hideVanilla) {
      const bw = 140, bh = 26; const hov = mouse.x >= x + 12 && mouse.x < x + 12 + bw && mouse.y >= ly && mouse.y < ly + bh;
      ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, x + 12, ly, bw, bh, 6); ctx.fill(); drawText(ctx, 'Reforge once', x + 12 + bw / 2, ly + 5, { size: 14, align: 'center' }); this.button(x + 12, ly, bw, bh, 'reforge_once');
      ly += 34;
    }
    // auto button + clear
    { const bw = 150, bh = 28; const hov = mouse.x >= x + 12 && mouse.x < x + 12 + bw && mouse.y >= ly && mouse.y < ly + bh;
      ctx.fillStyle = R.auto ? 'rgba(200,60,60,0.9)' : hov ? 'rgba(60,160,90,0.95)' : 'rgba(40,120,70,0.9)'; roundRect(ctx, x + 12, ly, bw, bh, 6); ctx.fill();
      drawText(ctx, R.auto ? 'Stop' : 'Auto Reforge', x + 12 + bw / 2, ly + 6, { size: 14, align: 'center' }); this.button(x + 12, ly, bw, bh, 'reforge_auto');
      const hov2 = mouse.x >= x + 170 && mouse.x < x + 250 && mouse.y >= ly && mouse.y < ly + bh;
      ctx.fillStyle = hov2 ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, x + 170, ly, 80, bh, 6); ctx.fill(); drawText(ctx, 'Clear', x + 210, ly + 6, { size: 14, align: 'center' }); this.button(x + 170, ly, 80, bh, 'reforge_clear');
      const hov3 = mouse.x >= x + 258 && mouse.x < x + 318 && mouse.y >= ly && mouse.y < ly + bh;
      ctx.fillStyle = hov3 ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, x + 258, ly, 60, bh, 6); ctx.fill(); drawText(ctx, R.hideVanilla ? 'Basic' : 'Hide', x + 288, ly + 6, { size: 12, align: 'center' }); this.button(x + 258, ly, 60, bh, 'reforge_hide');
      ly += 36; }
    drawText(ctx, `Target prefixes (${R.selected.size} selected):`, x + 12, ly, { size: 13, color: '#ddd' }); ly += 18;
    const colW = (w - 24) / cols;
    PREFIXES.forEach((pf, i) => {
      const cx = x + 12 + (i % cols) * colW, cy = ly + Math.floor(i / cols) * rowH;
      const on = R.selected.has(i), hov = mouse.x >= cx && mouse.x < cx + colW && mouse.y >= cy && mouse.y < cy + rowH;
      const col = pf.tier >= 2 ? '#78dc78' : pf.tier === 1 ? '#9090ff' : pf.tier === -1 ? '#ffb0b0' : '#ff7070';
      ctx.fillStyle = on ? '#ffe060' : 'rgba(255,255,255,0.12)'; roundRect(ctx, cx, cy + 4, 14, 14, 3); ctx.fill();
      if (on) { ctx.strokeStyle = '#402000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 3, cy + 11); ctx.lineTo(cx + 6, cy + 14); ctx.lineTo(cx + 11, cy + 7); ctx.stroke(); }
      const parts = []; if (pf.dmg) parts.push(`${pf.dmg > 0 ? '+' : ''}${pf.dmg}%dmg`); if (pf.speed) parts.push(`${pf.speed > 0 ? '+' : ''}${pf.speed}%spd`); if (pf.crit) parts.push(`+${pf.crit}%crit`); if (pf.kb) parts.push(`${pf.kb > 0 ? '+' : ''}${pf.kb}%kb`);
      drawText(ctx, pf.name, cx + 20, cy + 3, { size: 12, color: hov ? '#fff' : col });
      drawText(ctx, parts.join(' '), cx + 20 + measureText(ctx, pf.name, 12) + 6, cy + 5, { size: 9, color: '#999' });
      this.button(cx, cy, colW, rowH, 'reforge_prefix', i);
    });
    ly += listH + 6;
    if (R.lastResult) drawText(ctx, R.lastResult, x + 12, ly, { size: 13, color: R.auto ? '#ffe75a' : '#a0ffa0' });
    if (R.auto) drawText(ctx, 'Reforging...', x + w - 12, ly, { size: 13, align: 'right', color: '#ffe75a' });
  },

  // Boss Checklist / Boss Log
  drawBossLog(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    const w = Math.min(720, W - 40), h = Math.min(H - 80, 520), x = W / 2 - w / 2, y = Math.max(40, H / 2 - h / 2);
    ctx.fillStyle = 'rgba(20,16,40,0.95)'; roundRect(ctx, x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = '#c8a030'; ctx.lineWidth = 3; roundRect(ctx, x, y, w, h, 12); ctx.stroke();
    const closeW = 70; const cx = x + w - closeW - 14, cy = y + 12;
    const chov = mouse.x >= cx && mouse.x < cx + closeW && mouse.y >= cy && mouse.y < cy + 26;
    ctx.fillStyle = chov ? 'rgba(160,60,60,0.9)' : 'rgba(90,40,40,0.8)'; roundRect(ctx, cx, cy, closeW, 26, 6); ctx.fill();
    drawText(ctx, 'Close', cx + closeW / 2, cy + 4, { size: 16, align: 'center' }); this.button(cx, cy, closeW, 26, 'bosslog_close');
    const sorted = BOSSES.slice().sort((a, b) => a.order - b.order);
    if (!BossLog.page) {
      const done = sorted.filter(b => BossLog.defeated(game, b.id)).length;
      drawText(ctx, `Boss Checklist  (${done}/${sorted.length})`, x + 20, y + 12, { size: 24, color: '#ffe080' });
      drawText(ctx, 'Press L to toggle. Click a boss for its page.', x + 20, y + 44, { size: 13, color: '#aaa' });
      let ry = y + 72;
      for (const b of sorted) {
        const def = BossLog.defeated(game, b.id);
        const hov = mouse.x >= x + 16 && mouse.x < x + w - 16 && mouse.y >= ry && mouse.y < ry + 46;
        ctx.fillStyle = hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.6)'; roundRect(ctx, x + 16, ry, w - 32, 46, 8); ctx.fill();
        ctx.fillStyle = def ? '#40e060' : '#404050'; ctx.beginPath(); ctx.arc(x + 40, ry + 23, 11, 0, Math.PI * 2); ctx.fill();
        if (def) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 34, ry + 23); ctx.lineTo(x + 39, ry + 28); ctx.lineTo(x + 47, ry + 17); ctx.stroke(); }
        drawText(ctx, `${b.order}. ${b.name}`, x + 62, ry + 6, { size: 18, color: def ? '#fff' : '#ddd' });
        const rec = game.world.bossRecords && game.world.bossRecords[b.id];
        drawText(ctx, def ? (rec ? `Defeated x${rec.kills} - best ${(rec.bestTime / 60).toFixed(1)}s, ${rec.leastHits} hits taken` : 'Defeated') : (game.boss && game.boss.type === b.id ? 'Fighting now!' : 'Not yet defeated'), x + 62, ry + 26, { size: 12, color: def ? '#9f9' : '#fbb' });
        this.button(x + 16, ry, w - 32, 46, 'bosslog_page', b.id);
        ry += 54;
      }
      return;
    }
    const b = BOSSES.find(q => q.id === BossLog.page);
    const back = { x: x + 14, y: y + 12, w: 60, h: 26 };
    const bhov = mouse.x >= back.x && mouse.x < back.x + back.w && mouse.y >= back.y && mouse.y < back.y + back.h;
    ctx.fillStyle = bhov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, back.x, back.y, back.w, back.h, 6); ctx.fill();
    drawText(ctx, '< Back', back.x + back.w / 2, back.y + 4, { size: 15, align: 'center' }); this.button(back.x, back.y, back.w, back.h, 'bosslog_page', null);
    drawText(ctx, b.name, x + w / 2, y + 10, { size: 26, align: 'center', color: '#ffe080' });
    let ly = y + 50;
    const par = (t, c = '#ddd', size = 14) => { for (const l of wrapText(ctx, t, w - 50, size)) { drawText(ctx, l, x + 24, ly, { size, color: c }); ly += size + 5; } ly += 4; };
    par(`${b.info}  Life: ${b.hp}${game.expert ? ' (Expert: more)' : ''}.`);
    drawText(ctx, 'Spawn', x + 24, ly, { size: 16, color: '#a0d0ff' }); ly += 22;
    par(b.spawn, '#ddd', 13);
    const rec = RECIPES.find(r => r.result === b.summon);
    if (rec) { this.drawItemIcon(ctx, b.summon, x + 36, ly + 10, 22); par(`${ITEMS[b.summon].name}: ${rec.ing.map(([id, n]) => `${n} ${ITEMS[id].name}`).join(' + ')}${rec.station ? ` @ ${ITEMS[rec.station].name}` : ''}`, '#ffe75a', 13); }
    drawText(ctx, 'Loot', x + 24, ly, { size: 16, color: '#a0d0ff' }); drawText(ctx, 'Collectibles', x + w / 2 + 10, ly, { size: 16, color: '#a0d0ff' }); ly += 24;
    const lootStart = ly;
    b.loot.forEach((id, i) => { const got = BossLog.obtained(game, id); const yy = lootStart + i * 30; this.drawItemIcon(ctx, id, x + 40, yy + 12, 22); drawText(ctx, (got ? '\u2713 ' : '\u2022 ') + ITEMS[id].name, x + 58, yy + 4, { size: 14, color: got ? '#9f9' : '#ccc' }); });
    b.collectibles.forEach((id, i) => { const got = BossLog.obtained(game, id); const yy = lootStart + i * 30; this.drawItemIcon(ctx, id, x + w / 2 + 26, yy + 12, 22); drawText(ctx, (got ? '\u2713 ' : '\u2022 ') + ITEMS[id].name, x + w / 2 + 44, yy + 4, { size: 14, color: got ? '#9f9' : '#ccc' }); });
    ly = lootStart + Math.max(b.loot.length, b.collectibles.length) * 30 + 8;
    const r = game.world.bossRecords && game.world.bossRecords[b.id];
    drawText(ctx, 'Records', x + 24, ly, { size: 16, color: '#a0d0ff' }); ly += 22;
    if (r) { par(`Kills: ${r.kills}   Best time: ${(r.bestTime / 60).toFixed(1)}s   Least hits taken: ${r.leastHits}   Last fight: ${(r.lastTime / 60).toFixed(1)}s, ${r.lastHits} hits`, '#ffe75a', 13); }
    else par(BossLog.defeated(game, b.id) ? 'Defeated (no records yet).' : 'No records yet.', '#aaa', 13);
  },

  // Pet Monitoring Tablet: all pet stats
  drawPetPanel(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, ps = game.pets, p = game.player;
    const w = 420, x = W / 2 - w / 2, y = 90;
    const rows = [
      ['Regular Pet', ps.pet ? `${PETS[ps.pet.id].name} (${PETS[ps.pet.id].cls})` : 'none'],
      ['Light Pet', ps.light ? `${LIGHT_PETS[ps.light.id].name} - ${Math.round(lightPetQualityPct(ps.light) * 100)}% Quality` : 'none'],
      ['Town Pet Buff', ps.townBuff ? TOWN_PET_BUFFS[ps.townBuff].label : 'none'],
      ['Pet Ability Haste', `${ps.stat('haste').toFixed(1)}%`], ['Pet Damage', `+${ps.stat('petDamage').toFixed(1)}%`], ['Pet Healing', `+${ps.stat('petHealing').toFixed(1)}%`], ['Pet Shielding', `+${ps.stat('petShielding').toFixed(1)}%`],
      ['Global Fortune', `${ps.stat('globalFortune').toFixed(0)}`], ['Mining Fortune', `${ps.miningFortune().toFixed(1)}`], ['Harvesting Fortune', `${ps.harvestFortune().toFixed(1)}`],
      ['Movement / Jump', `x${p.pm.move.toFixed(2)} / x${p.pm.jump.toFixed(2)}`], ['Damage / Crit', `x${p.pm.dmg.toFixed(3)} / +${p.pm.crit.toFixed(1)}%`], ['Defense', `${p.defense} (x${p.pm.defMult.toFixed(2)} +${p.pm.defAdd})`],
      ['Pets owned', `${ps.owned.size}`], ['Achievements', `${(game.achievements || new Set()).size}/${ACHIEVEMENTS.length}`],
    ];
    const h = rows.length * 22 + 50;
    ctx.fillStyle = 'rgba(20,20,50,0.92)'; roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = '#60c0ff'; ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, 10); ctx.stroke();
    drawText(ctx, 'Pet Monitoring Tablet', x + w / 2, y + 10, { size: 20, align: 'center', color: '#a0e0ff' });
    let ry = y + 42;
    for (const [k, v] of rows) { drawText(ctx, k, x + 16, ry, { size: 14, color: '#ccc' }); drawText(ctx, v, x + w - 16, ry, { size: 14, align: 'right', color: '#fff' }); ry += 22; }
  },

  drawAchievements(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const got = game.achievements || new Set();
    const w = Math.min(640, W - 40), x = W / 2 - w / 2, y = Math.max(70, H * 0.12);
    const h = Math.min(H - y - 20, ACHIEVEMENTS.length * 34 + 60);
    ctx.fillStyle = 'rgba(20,20,50,0.92)'; roundRect(ctx, x, y, w, h, 10); ctx.fill();
    ctx.strokeStyle = '#ffd040'; ctx.lineWidth = 2; roundRect(ctx, x, y, w, h, 10); ctx.stroke();
    drawText(ctx, `Achievements  (${got.size}/${ACHIEVEMENTS.length})`, x + w / 2, y + 12, { size: 22, align: 'center', color: '#ffe080' });
    let ry = y + 50;
    for (const a of ACHIEVEMENTS) {
      if (ry > y + h - 30) break;
      const has = got.has(a.id);
      ctx.fillStyle = has ? '#ffd040' : '#404050'; ctx.beginPath(); ctx.arc(x + 28, ry + 11, 9, 0, Math.PI * 2); ctx.fill();
      drawText(ctx, a.name, x + 46, ry, { size: 16, color: has ? '#fff' : '#888' });
      drawText(ctx, a.desc, x + 46, ry + 17, { size: 12, color: has ? '#ccc' : '#666' });
      ry += 34;
    }
  },

  drawNpcHead(ctx, npc, x, y, scale = 2) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, 16 * scale, 16 * scale); ctx.clip();
    ctx.translate(x - 2 * scale, y + 2 * scale); ctx.scale(scale, scale);
    drawHumanoid(ctx, 0, 0, { dir: 1, walk: null, colors: npc.colors, armAngle: null, item: null, hairStyle: npc.hairStyle });
    ctx.restore();
  },

  // Housing menu: query banner + one banner per town NPC. Click a banner, then click a room in the world.
  drawHousing(game, x, y) {
    const ctx = game.renderer.ctx, mouse = game.mouse;
    const entries = [{ id: 'query' }, ...game.npcs.filter(n => n.isTown)];
    const w = 230, rowH = 40;
    if (x + w > game.renderer.W - 10) x = game.renderer.W - w - 10;
    ctx.fillStyle = 'rgba(20,20,50,0.85)'; roundRect(ctx, x, y, w, entries.length * rowH + 14, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(120,130,220,0.6)'; ctx.lineWidth = 1; roundRect(ctx, x, y, w, entries.length * rowH + 14, 8); ctx.stroke();
    let ry = y + 7;
    for (const e of entries) {
      const isQuery = e.id === 'query';
      const sel = game.housingSelect === (isQuery ? 'query' : e);
      const hov = mouse.x >= x + 6 && mouse.x < x + w - 6 && mouse.y >= ry && mouse.y < ry + rowH - 4;
      ctx.fillStyle = sel ? 'rgba(240,210,90,0.85)' : hov ? 'rgba(90,100,190,0.9)' : 'rgba(50,60,140,0.8)'; roundRect(ctx, x + 6, ry, w - 12, rowH - 4, 6); ctx.fill();
      if (isQuery) { drawText(ctx, '?', x + 24, ry + 4, { size: 24, align: 'center', color: '#fff' }); drawText(ctx, 'Query housing', x + 44, ry + 10, { size: 15, color: '#fff' }); }
      else {
        this.drawNpcHead(ctx, e, x + 8, ry + 2, 2);
        drawText(ctx, e.title, x + 44, ry + 3, { size: 14, color: '#fff' });
        drawText(ctx, e.home ? 'Housed' : 'Homeless', x + 44, ry + 20, { size: 12, color: e.home ? '#9f9' : '#fbb' });
      }
      this.button(x + 6, ry, w - 12, rowH - 4, 'housing_npc', isQuery ? 'query' : e);
      ry += rowH;
    }
    // banner follows the cursor while selecting a room
    if (game.housingSelect) {
      const s = game.housingSelect;
      ctx.fillStyle = 'rgba(240,210,90,0.9)'; roundRect(ctx, mouse.x + 14, mouse.y + 14, 36, 44, 6); ctx.fill();
      if (s === 'query') drawText(ctx, '?', mouse.x + 32, mouse.y + 22, { size: 24, align: 'center' });
      else this.drawNpcHead(ctx, s, mouse.x + 16, mouse.y + 18, 2);
      drawText(ctx, s === 'query' ? 'Click a room to check it' : `Click a room for ${s.name}`, mouse.x + 14, mouse.y + 62, { size: 13, color: '#fff' });
    }
  },

  // Map overlay: translucent map centered on the player, drawn behind the HUD
  drawOverlayMap(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const world = game.world, p = game.player;
    const z = this.minimapZoom * 2;
    const tw = W / z, th = H / z;
    const sx = p.cx / TILE - tw / 2, sy = p.cy / TILE - th / 2;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.imageSmoothingEnabled = false;
    // clamp the source rect to the map and offset the destination accordingly
    const cx0 = Math.max(0, sx), cy0 = Math.max(0, sy);
    const cx1 = Math.min(world.w, sx + tw), cy1 = Math.min(world.h, sy + th);
    if (cx1 > cx0 && cy1 > cy0) ctx.drawImage(game.renderer.mapCanvas, cx0, cy0, cx1 - cx0, cy1 - cy0, (cx0 - sx) * z, (cy0 - sy) * z, (cx1 - cx0) * z, (cy1 - cy0) * z);
    ctx.globalAlpha = 1;
    const px = (p.tileX + 0.5 - sx) * z, py = (p.tileY + 0.5 - sy) * z;
    ctx.fillStyle = '#ff4040'; ctx.fillRect(px - 3, py - 4, 6, 8);
    for (const n of game.npcs) { ctx.fillStyle = '#40e060'; ctx.fillRect((n.tileX + 0.5 - sx) * z - 3, (n.tileY + 0.5 - sy) * z - 3, 6, 6); }
    ctx.restore();
  },

  drawFullMap(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H;
    const world = game.world, p = game.player;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(0, 0, W, H);
    const z = this.mapZoom;
    const tw = W / z, th = H / z;
    const sx = clamp(p.tileX - tw / 2 + this.mapPan.x, 0, Math.max(0, world.w - tw)), sy = clamp(p.tileY - th / 2 + this.mapPan.y, 0, Math.max(0, world.h - th));
    this.mapPan.x = sx - (p.tileX - tw / 2); this.mapPan.y = sy - (p.tileY - th / 2); // keep the pan inside the world
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(game.renderer.mapCanvas, sx, sy, tw, th, 0, 0, W, H);
    const px = (p.tileX - sx) * z, py = (p.tileY - sy) * z;
    ctx.fillStyle = '#ff4040'; ctx.fillRect(px - 3, py - 4, 6, 8);
    ModLib.emit('drawMap', game, sx, sy, z);
    for (const d of game.drops) if (d.id && BOSSES.some(b => b.loot.includes(d.id) || b.collectibles.includes(d.id))) { ctx.fillStyle = '#ffe040'; ctx.fillRect((d.cx / TILE - sx) * z - 3, (d.cy / TILE - sy) * z - 3, 6, 6); }
    drawText(ctx, 'Map  (Tab to close, +/- to zoom, drag to look around)', W / 2, 16, { size: 22, align: 'center' });
    drawText(ctx, 'Paused', W / 2, 44, { size: 13, align: 'center', color: '#ffe0a0' });
  },

  // ------------------------------------------------------------------------
  drawCrafting(game) {
    const ctx = game.renderer.ctx, mouse = game.mouse;
    const list = game.craftable;
    const last = this.slotRect(49);
    const x0 = 20, y0 = last.y + last.s + (game.openChest ? 0 : 20);
    if (game.openChest || game.shop || game.squadInv) return; // chest / shop / companion inventory occupies the space
    drawText(ctx, 'Crafting', x0, y0, { size: 20, color: '#fff' });
    TextInput.draw(ctx, x0 + 110, y0 - 2, 220, 26, { id: 'craft_search', value: this.craftFilter || '', placeholder: 'search recipes...' });
    this.button(x0 + 110, y0 - 2, 220, 26, 'craft_search', null);
    const s = Math.round(40 * this.scale), gap = 6;
    const maxRows = Math.floor((game.renderer.H - y0 - 60) / (s + gap));
    const perRow = 10;
    const start = this.craftScroll * perRow;
    for (let k = 0; k < Math.min(list.length - start, maxRows * perRow); k++) {
      const i = start + k;
      const r = list[i];
      const col = k % perRow, row = Math.floor(k / perRow);
      const x = x0 + col * (s + gap), y = y0 + 30 + row * (s + gap);
      const hover = mouse.x >= x && mouse.y >= y && mouse.x < x + s && mouse.y < y + s;
      this.drawSlot(ctx, x, y, s, { id: r.recipe.result, count: r.recipe.count }, { hover, selected: false });
      if (!r.can) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, x, y, s, s, 6); ctx.fill(); }
      this.button(x, y, s, s, 'recipe', i);
      if (hover) this.hoverRecipe = r;
    }
    if (list.length > maxRows * perRow) drawText(ctx, `Scroll for more (${this.craftScroll + 1}/${Math.ceil(list.length / perRow / maxRows) || 1})`, x0, y0 + 30 + maxRows * (s + gap), { size: 13, color: '#ccc' });
  },

  drawTooltip(game) {
    if (game.settingsOpen) return;
    const ctx = game.renderer.ctx, mouse = game.mouse, p = game.player;
    const W = game.renderer.W;
    let lines = [];
    if (this.hoverRecipe) {
      const r = this.hoverRecipe.recipe;
      const it = ITEMS[r.result];
      lines.push({ t: it.name + (r.count > 1 ? ` (${r.count})` : ''), c: RARITY_COLORS[it.rarity] || '#fff', size: 18 });
      if (it.tooltip) lines.push({ t: it.tooltip, c: '#ccc' });
      lines.push({ t: r.station ? `Requires ${ITEMS[r.station].name}` : 'Crafted by hand', c: game.stations.has(r.station) || !r.station ? '#9f9' : '#f99' });
      lines.push({ t: 'Click: craft to cursor   Shift+click: craft into inventory', c: '#aaa', size: 13 });
      for (const [id, n] of r.ing) {
        const have = p.countItem(id);
        lines.push({ t: `${ITEMS[id].name} (${have}/${n})`, c: have >= n ? '#dfd' : '#fbb' });
      }
    } else if (this.hoverBuff) {
      const b = this.hoverBuff;
      const desc = { 'Potion Sickness': 'Cannot consume healing items', 'Cozy Fire': 'Life regeneration is increased', 'On Fire!': 'Slowly losing life', 'Poisoned': 'Slowly losing life', 'Housing': 'Check rooms and assign homes to town NPCs', 'Mana Sickness': 'Magic damage reduced by 25%', 'Well Fed': '+2 defense (Cooked Fish)' }[b] || '';
      lines.push({ t: b, c: '#fff', size: 18 }); if (desc) lines.push({ t: desc, c: '#ccc' });
    } else if (this.hoverSlot != null && this.hoverSlot !== 'trash' && !(typeof this.hoverSlot === 'string' && this.hoverSlot.startsWith('btn:'))) {
      let item = null, shopEntry = null;
      if (typeof this.hoverSlot === 'number') item = p.inventory[this.hoverSlot];
      else if (this.hoverSlot.startsWith('armor')) item = p.armor[parseInt(this.hoverSlot.slice(5))];
      else if (this.hoverSlot.startsWith('pet')) item = this.hoverSlot === 'pet0' ? game.pets.pet : game.pets.light;
      else if (this.hoverSlot.startsWith('acc')) item = p.accessories[parseInt(this.hoverSlot.slice(3))];
      else if (this.hoverSlot.startsWith('eq')) item = p.equipment[this.hoverSlot.slice(2)];
      else if (this.hoverSlot.startsWith('shop')) { shopEntry = game.shop[parseInt(this.hoverSlot.slice(4))]; item = { id: shopEntry.id, count: 1 }; }
      else if (this.hoverSlot.startsWith('van')) item = p.vanity[parseInt(this.hoverSlot.slice(3))];
      else if (this.hoverSlot.startsWith('dye')) item = p.dyes[parseInt(this.hoverSlot.slice(3))];
      else if (this.hoverSlot.startsWith('mod:')) item = this.modHover;
      else if (game.openChest) item = game.openChest.inv[parseInt(this.hoverSlot.slice(5))];
      this.hoverItem = item;
      if (item) {
        const it = ITEMS[item.id];
        const st = itemStats(item);
        const pfx = st.prefix;
        const tierColor = pfx ? (pfx.tier >= 2 ? '#78dc78' : pfx.tier === 1 ? '#9090ff' : '#ff6060') : null;
        lines.push({ t: itemDisplayName(item), c: tierColor || RARITY_COLORS[it.rarity] || '#fff', size: 18 });
        if (it.damage && it.magic) { lines.push({ t: `${Math.round(st.damage * Magic.damageMult(p, it))} magic damage`, c: '#ddd' }, { t: `Uses ${Magic.manaCost(p, it)} mana`, c: '#8080ff' }); }
        else if (it.damage && it.ranged) lines.push({ t: `${st.damage} ranged damage`, c: '#ddd' });
        else if (it.damage) lines.push({ t: `${st.damage} melee damage`, c: '#ddd' });
        if (it.damage) lines.push({ t: `${st.crit}% critical strike chance`, c: '#ddd' });
        if (it.damage || it.tool) lines.push({ t: `${st.useTime <= 12 ? 'Very fast' : st.useTime <= 20 ? 'Fast' : st.useTime <= 30 ? 'Average' : 'Slow'} speed`, c: '#ddd' });
        if (it.damage) lines.push({ t: `${st.knockback < 3 ? 'Weak' : st.knockback < 5 ? 'Average' : st.knockback < 7 ? 'Strong' : 'Very strong'} knockback`, c: '#ddd' });
        if (it.tool === 'pick') lines.push({ t: `${it.power}% pickaxe power`, c: '#ddd' });
        if (it.tool === 'axe') lines.push({ t: `${it.power}% axe power`, c: '#ddd' });
        if (it.tool === 'hammer') lines.push({ t: `${it.power}% hammer power`, c: '#ddd' });
        if (it.armor) lines.push({ t: `${it.defense} defense`, c: '#ddd' }, { t: 'Shift+click or use to equip', c: '#aaa' });
        if (it.accessory) { if (it.defense) lines.push({ t: `${it.defense} defense`, c: '#ddd' }); if (it.manaBonus) lines.push({ t: `+${it.manaBonus} max mana`, c: '#8080ff' }); lines.push({ t: it.slot ? `Shift+click or use to equip (${it.slot} slot)` : `Shift+click or use to equip (${AccessoriesPlus.slotCount(game)} accessory slots)`, c: '#aaa' }); }
        for (const l of AccessoriesPlus.statLines(item)) lines.push(l);
        TooltipHooks.apply(item, it, lines, game);
        if (it.armor && it.manaBonus) lines.push({ t: `+${it.manaBonus} max mana, ${it.manaCostPct}% reduced mana usage`, c: '#8080ff' });
        if (it.pet === 'regular') { const pd = PETS[item.id]; lines.push({ t: `${pd.cls} Pet - summons ${pd.pet}`, c: '#c0ffc0' }); for (const d of pd.desc) for (const l of wrapText(ctx, d, 380, 14)) lines.push({ t: l, c: '#ddd', size: 14 }); if (pd.ability) lines.push({ t: `Ability: ${pd.ability.name} (F) - ${Math.round(pd.ability.cd / 60)}s cooldown`, c: '#ffe080', size: 14 }); lines.push({ t: 'Shift+click or use to equip', c: '#aaa' }); }
        if (it.pet === 'light') { rollLightPet(item); lines[0].c = qualityColor(lightPetQualityPct(item), game.renderer.frame); for (const l of lightPetTooltip(item, game.renderer.frame)) lines.push({ t: l.t, c: l.c, size: 14 }); lines.push({ t: 'Shift+click or use to equip', c: '#aaa' }); }
        if (it.placeable) lines.push({ t: 'Can be placed', c: '#ddd' });
        if (it.material) lines.push({ t: 'Material', c: '#ddd' });
        if (it.tooltip && !it.tool && !it.armor) lines.push({ t: it.tooltip, c: '#ccc' });
        if (it.consumable) lines.push({ t: 'Left click to use', c: '#aaa' });
        if (pfx) {
          if (pfx.dmg) lines.push({ t: `${pfx.dmg > 0 ? '+' : ''}${pfx.dmg}% damage`, c: pfx.dmg > 0 ? '#9f9' : '#f99' });
          if (pfx.speed) lines.push({ t: `${pfx.speed > 0 ? '+' : ''}${pfx.speed}% speed`, c: pfx.speed > 0 ? '#9f9' : '#f99' });
          if (pfx.crit) lines.push({ t: `+${pfx.crit}% critical strike chance`, c: '#9f9' });
          if (pfx.kb) lines.push({ t: `${pfx.kb > 0 ? '+' : ''}${pfx.kb}% knockback`, c: pfx.kb > 0 ? '#9f9' : '#f99' });
        }
        if (shopEntry) lines.push({ t: `Buy price: ${coinsToString(shopEntry.price)}`, c: '#ffe75a' });
        else if (game.shop && typeof this.hoverSlot === 'number') lines.push({ t: `Sell value: ${coinsToString(Math.floor(stackValue(item) / 5) * item.count)}`, c: '#ffe75a' });
        else if (it.value) lines.push({ t: `Value: ${coinsToString(it.value)}`, c: '#aaa' });
      }
    } else if (typeof this.hoverSlot === 'string' && this.hoverSlot.startsWith('btn:')) { lines.push({ t: this.hoverSlot.slice(4), c: '#ffe080', size: 16 });
    } else if (this.hoverSlot === 'trash') { lines.push({ t: 'Trash To Treasure', c: '#ffe080', size: 18 }, { t: `Trashed items pay ${Math.round(game.trashRate * 100)}% of their sell value`, c: '#ddd' }, { t: 'Taking an item back costs what it paid', c: '#ddd' }); if (game.trash) lines.push({ t: `${itemDisplayName(game.trash)} x${game.trash.count} - paid ${coinsToString(game.trashPaid)}`, c: '#ffe75a' }); }
    TooltipHooks.finalize(lines, game, this.hoverSlot, this.hoverItem);
    if (!lines.length) return;
    let w = 0; for (const l of lines) w = Math.max(w, measureText(ctx, l.t, l.size || 15) + 20 + (l.icon ? 20 : 0));
    const h = lines.reduce((a, l) => a + (l.size || 15) + 6, 10);
    let x = mouse.x + 18, y = mouse.y + 18;
    if (x + w > W) x = mouse.x - w - 8;
    ctx.fillStyle = 'rgba(20,20,50,0.9)'; roundRect(ctx, x, y, w, h, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(120,130,220,0.6)'; ctx.lineWidth = 1; roundRect(ctx, x, y, w, h, 6); ctx.stroke();
    let ly = y + 6;
    for (const l of lines) { let ox = 0; if (l.icon) { ctx.save(); ctx.translate(x + 10, ly + 1); const sz = (l.size || 15) - 1, sc = sz / 16; ctx.scale(sc, sc); try { if (typeof l.icon === 'function') l.icon(ctx); else if (Sprites.icons[l.icon]) ctx.drawImage(Sprites.icons[l.icon], 0, 0, 16, 16); } catch (e) {} ctx.restore(); ox = 20; } drawText(ctx, l.t, x + 10 + ox, ly, { size: l.size || 15, color: l.c }); ly += (l.size || 15) + 6; }
  },

  // ------------------------------------------------------------------------
  drawDialog(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, mouse = game.mouse;
    const d = game.dialog;
    const total = Math.min(1040, W - 40), portrait = 180, gap = 20;
    const left = W / 2 - total / 2, py = Math.round(150 * this.scale), ph = 190;
    const px = left + portrait + gap, pw = total - portrait - gap;
    // portrait
    ctx.fillStyle = 'rgba(60,60,140,0.85)'; roundRect(ctx, left, py, portrait, 180, 10); ctx.fill();
    ctx.strokeStyle = '#a0a0e0'; ctx.lineWidth = 3; roundRect(ctx, left, py, portrait, 180, 10); ctx.stroke();
    ctx.save(); ctx.translate(left + portrait / 2 - 26, py + 20); ctx.scale(2.6, 2.6);
    drawHumanoid(ctx, 0, 0, { dir: 1, walk: null, colors: d.npc.colors, armAngle: null, item: null, hairStyle: d.npc.hairStyle });
    ctx.restore();
    drawText(ctx, `${d.npc.name} the ${d.npc.role}`, left + portrait / 2, py + 150, { size: 18, align: 'center', color: '#fff' });
    // text panel
    ctx.fillStyle = 'rgba(60,60,140,0.85)'; roundRect(ctx, px, py, pw, ph, 10); ctx.fill();
    ctx.strokeStyle = '#a0a0e0'; ctx.lineWidth = 3; roundRect(ctx, px, py, pw, ph, 10); ctx.stroke();
    const lines = wrapText(ctx, d.text, pw - 40, 20);
    let ly = py + 20;
    for (const l of lines) { drawText(ctx, l, px + 20, ly, { size: 20, color: '#fff' }); ly += 28; }
    // buttons
    let bx = px + 30; const by = py + ph - 44;
    for (const b of (d.buttons || ['Close', 'Help', 'Crafting'])) {
      const w = measureText(ctx, b, 22) + 10;
      const hov = mouse.x >= bx && mouse.x < bx + w && mouse.y >= by && mouse.y < by + 30;
      drawText(ctx, b, bx, by, { size: hov ? 24 : 22, color: hov ? '#fff' : '#ffe75a' });
      this.button(bx, by, w, 30, 'dialog', b);
      bx += w + 40;
    }
  },

  settingsPage: 'main',
  drawModSettings(game) {
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    const A = ArmedZombies.cfg, F = Fishing.cfg, on = (v) => v ? 'On' : 'Off';
    const cols = [
      ['Armed Zombies!', [
        [`Armed enemies: ${on(A.enabled)}`, 'az_enabled'], [`Weapon chance: ${Math.round(A.weaponChance * 100)}%`, 'az_weapon'], [`Heavy axe share: ${Math.round(A.axeChance * 100)}%`, 'az_axe'], [`Armor chance: ${Math.round(A.armorChance * 100)}%`, 'az_armor'],
        [`Attack windup delay: ${on(A.windup)}`, 'az_windup'], [`Survival healing: ${on(A.healing)}`, 'az_healing'], [`Scared when hurt: ${on(A.scared)}`, 'az_scared'], [`Stagger on hit: ${on(A.stagger)}`, 'az_stagger'],
      ]],
      ['Auto Fisher', [
        [`Auto cast: ${on(F.autoCast)}`, 'af_cast'], [`Auto reel: ${on(F.autoReel)}`, 'af_reel'], [`Filter junk: ${on(F.filterJunk)}`, 'af_junk'], [`Auto open crates: ${on(F.openCrates)}`, 'af_crates'],
        [`Auto sell fish: ${on(F.autoSell)}`, 'af_sell'], [`Lines: ${F.lines}`, 'af_lines'], [`Infinite bait: ${on(F.noBait)}`, 'af_bait'], [`Fish while swimming: ${on(F.fishInWater)}`, 'af_water'], [`Info panel: ${on(F.info)}`, 'af_info'],
      ]],
      ['Consolaria & more', [[`Holiday events: ${Holidays.cfg.mode === 'always' ? 'Always active' : 'By real date (' + (Holidays.activeNames().join(', ') || 'none today') + ')'}`, 'holidays'],
        [`Visual effects (Luminance): ${FX.cfg.intensity >= 1 ? 'Full' : FX.cfg.intensity > 0 ? 'Reduced' : 'Off'}`, 'fx'], [`Mana Overload (Split): ${on(ManaOverload.cfg.enabled)}`, 'overload'],
        ...ModKeys.binds.map(b => [`${ModKeys.labelFor(b.code)}: ${b.label}`, 'keybind'])]],
    ];
    drawText(ctx, 'Mod settings', W / 2, 40, { size: 36, align: 'center' });
    const colW = Math.min(360, W / 3 - 10);
    cols.forEach((col, ci) => {
      const x0 = W / 2 + (ci - 1) * colW;
      let y = 110;
      drawText(ctx, col[0], x0, y, { size: 22, align: 'center', color: '#ffe75a' }); y += 34;
      for (const [label, id] of col[1]) {
        const w = Math.min(colW - 10, measureText(ctx, label, 17) + 24);
        const hov = mouse.x >= x0 - w / 2 && mouse.x <= x0 + w / 2 && mouse.y >= y && mouse.y <= y + 26;
        ctx.fillStyle = hov ? 'rgba(255,230,90,0.25)' : 'rgba(255,255,255,0.08)'; roundRect(ctx, x0 - w / 2, y, w, 26, 6); ctx.fill();
        drawText(ctx, label, x0, y + 4, { size: 17, align: 'center', color: hov ? '#ffe75a' : '#fff' });
        this.button(x0 - w / 2, y, w, 26, 'mod_item', id);
        y += 32;
      }
    });
    const by = H - 90, bw = 160;
    const hov = mouse.x >= W / 2 - bw / 2 && mouse.x <= W / 2 + bw / 2 && mouse.y >= by && mouse.y <= by + 36;
    drawText(ctx, 'Back', W / 2, by, { size: hov ? 31 : 28, align: 'center', color: hov ? '#ffe75a' : '#fff' });
    this.button(W / 2 - bw / 2, by, bw, 36, 'mod_item', 'back');
    drawText(ctx, 'Settings are saved in this browser.', W / 2, by + 44, { size: 14, align: 'center', color: '#aaa' });
    { const lw = 220, lx = W / 2 - lw / 2, ly = by - 44; const lh = mouse.x >= lx && mouse.x <= lx + lw && mouse.y >= ly && mouse.y <= ly + 30; ctx.fillStyle = lh ? 'rgba(255,230,90,0.25)' : 'rgba(255,255,255,0.08)'; roundRect(ctx, lx, ly, lw, 30, 6); ctx.fill(); drawText(ctx, 'Concise mod list...', W / 2, ly + 5, { size: 17, align: 'center', color: lh ? '#ffe75a' : '#fff' }); this.button(lx, ly, lw, 30, 'mod_item', 'modlist'); }
  },
  drawSettings(game) {
    if (this.settingsPage === 'mods') { this.drawModSettings(game); return; }
    if (ModLib.settingsPages[this.settingsPage]) { ModLib.settingsPages[this.settingsPage](game); return; }
    const ctx = game.renderer.ctx, W = game.renderer.W, H = game.renderer.H, mouse = game.mouse;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    const items = [
      { label: 'Resume', id: 'resume' },
      { label: `Zoom: ${game.renderer.zoom.toFixed(1)}x  (click to change)`, id: 'zoom' },
      { label: `Sound: ${Audio_.enabled ? 'On' : 'Off'}`, id: 'sound' },
      { label: `Music volume: ${Math.round(SFX.cfg.music * 100)}%`, id: 'music_vol' },
      { label: `Sound effects: ${Math.round(SFX.cfg.sfx * 100)}%`, id: 'sfx_vol' },
      { label: `Autoswing: ${game.autoswing ? 'On' : 'Off'}`, id: 'autoswing' },
      { label: `Trash To Treasure payout: ${Math.round(game.trashRate * 100)}%`, id: 'trashrate' },
      { label: `Mage mod numbers: ${game.throarbinExact ? "Throarbin's exact (10%)" : 'Buffed (25%)'}`, id: 'throarbin' },
      { label: 'Achievements', id: 'achievements' },
      { label: 'Reset reforge window position', id: 'reforgewin' },
      { label: 'Mod settings & mod list...', id: 'mods' },
      { label: 'Save Game', id: 'save' },
      { label: 'Save & Exit to Title Menu', id: 'exit' },
    ];
    // fit the list to the window: the row height and font shrink on short screens so the last entries never fall off the bottom
    let y = Math.max(70, H * 0.14);
    const step = clamp(Math.floor((H - y - 30) / (items.length + 2.5)), 24, 52), size = clamp(Math.round(step * 0.56), 15, 28);
    drawText(ctx, 'Settings', W / 2, y - Math.min(60, step + 8), { size: Math.min(40, step * 0.8 + 10), align: 'center' });
    for (const it of items) {
      const w = measureText(ctx, it.label, size) + 40;
      const hov = mouse.x >= W / 2 - w / 2 && mouse.x <= W / 2 + w / 2 && mouse.y >= y && mouse.y <= y + step - 4;
      drawText(ctx, it.label, W / 2, y, { size: hov ? size * 1.1 : size, align: 'center', color: hov ? '#ffe75a' : it.id === 'exit' ? '#ffb0b0' : '#fff' });
      this.button(W / 2 - w / 2, y, w, step - 4, 'settings_item', it.id);
      y += step;
    }
    if (H - y < 130) return;
    const controls = ['A / D: move   Space: jump   S: drop through platforms', 'Left click: use item / attack   Right click: interact', 'Esc: inventory / close   1-0 or mouse wheel: hotbar', 'E: grapple   H: quick heal   T: throw item (Shift+T: stack)', 'Shift: auto select   Left Ctrl: smart cursor   Delete: trash item', 'M: cycle map (minimap / overlay / hidden)   Tab: fullscreen map   +/-: map zoom', 'F11: hide UI   F5: quick save'];
    let cy = y + 20;
    for (const c of controls) { drawText(ctx, c, W / 2, cy, { size: 16, align: 'center', color: '#ccc' }); cy += 22; }
  },

  drawCursor(game) {
    const ctx = game.renderer.ctx, m = game.mouse;
    if (!m.inside) return;
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.fillStyle = '#ff5a5a'; ctx.strokeStyle = '#3a0000'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.lineTo(4.5, 12.5); ctx.lineTo(7.5, 18); ctx.lineTo(10.5, 16.5); ctx.lineTo(7.5, 11); ctx.lineTo(13, 11); ctx.closePath();
    ctx.stroke(); ctx.fill();
    ctx.restore();
  },
};
