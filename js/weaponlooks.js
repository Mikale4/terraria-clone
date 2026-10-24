'use strict';
// ---------------------------------------------------------------------------
// Weapon icons that look like their class: whips coil, spears have heads,
// staves carry an orb, boomerangs bend, launchers are tubes, wands and rods
// are not books. Replaces the placeholder shapes of generated icons only -
// hand-drawn icons and pixel-art swords are left alone.
// ---------------------------------------------------------------------------

ModList.current = null;

const WeaponLooks = {
  // record what a drawIcon does (calls + the colours it sets) without a real canvas
  probe(fn) {
    const calls = [], cols = []; const t = {};
    const ctx = new Proxy(t, { get: (o, k) => (typeof k === 'string' && !(k in o)) ? (...a) => { calls.push(k + '(' + a.map(v => typeof v === 'number' ? Math.round(v * 100) / 100 : v).join(',') + ')'); } : o[k], set: (o, k, v) => { if (k === 'fillStyle' || k === 'strokeStyle') cols.push(v); o[k] = v; return true; } });
    try { fn(ctx); } catch (e) { return null; }
    return { sig: calls.join(';'), cols };
  },
  // signatures of the placeholder shapes from genericIcon()
  generic: {
    staff: 'fillRect(2,13,2,2);fillRect(3,12,2,2);fillRect(4,11,2,2);fillRect(5,10,2,2);fillRect(6,9,2,2);fillRect(7,8,2,2);fillRect(8,7,2,2);fillRect(9,6,2,2);fillRect(10,5,2,2);fillRect(11,4,2,2);fillRect(12,3,2,2);fillRect(11,1,4,4)',
    spear: 'fillRect(1,13,2,2);fillRect(2,13,2,2);fillRect(3,12,2,2);fillRect(4,11,2,2);fillRect(5,10,2,2);fillRect(6,9,2,2);fillRect(7,8,2,2);fillRect(8,7,2,2);fillRect(9,6,2,2);fillRect(10,5,2,2);fillRect(11,4,2,2);fillRect(12,3,2,2);fillRect(12,0,4,5)',
    box: 'fillRect(3,3,10,10);fillRect(3,3,10,2)',
    book: 'fillRect(3,2,10,12);fillRect(5,4,6,8)',
    gun: 'fillRect(2,6,12,4);fillRect(3,10,3,4);fillRect(11,5,4,2)',
  },
  shapes: {
    whip: (a, b) => (x) => { x.fillStyle = '#5a3a20'; x.fillRect(1, 11, 4, 4); x.fillStyle = '#8a6038'; x.fillRect(2, 11, 2, 2); x.strokeStyle = a; x.lineWidth = 2; x.lineCap = 'round'; x.beginPath(); x.moveTo(4, 11); x.quadraticCurveTo(1, 3, 8, 3); x.quadraticCurveTo(15, 3, 12, 9); x.quadraticCurveTo(10, 12, 14, 14); x.stroke(); x.fillStyle = b; x.fillRect(13, 13, 3, 2); x.fillRect(7, 2, 2, 2); },
    spear: (a, b) => (x) => { x.fillStyle = '#8a6038'; for (let i = 0; i < 9; i++) x.fillRect(1 + i, 14 - i, 2, 2); x.fillStyle = a; x.beginPath(); x.moveTo(15, 1); x.lineTo(8, 5); x.lineTo(11, 8); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(13, 2, 2, 2); x.fillStyle = a; x.fillRect(8, 8, 3, 2); x.fillRect(10, 5, 2, 3); },
    staff: (a, b) => (x) => { x.fillStyle = '#7a5030'; for (let i = 0; i < 9; i++) x.fillRect(1 + i, 14 - i, 2, 2); x.fillStyle = a; x.fillRect(9, 4, 3, 3); x.beginPath(); x.arc(12, 4, 3.2, 0, Math.PI * 2); x.fill(); x.fillStyle = b; x.beginPath(); x.arc(11, 3, 1.3, 0, Math.PI * 2); x.fill(); x.fillStyle = '#c0a060'; x.fillRect(8, 6, 2, 2); x.fillRect(10, 8, 2, 2); },
    wand: (a, b) => (x) => { x.fillStyle = '#7a5030'; for (let i = 0; i < 7; i++) x.fillRect(2 + i, 13 - i, 2, 2); x.fillStyle = a; x.fillRect(9, 3, 4, 4); x.fillStyle = b; x.fillRect(10, 2, 2, 2); x.fillRect(13, 5, 2, 1); x.fillRect(8, 2, 1, 2); x.fillRect(12, 8, 2, 1); },
    boomerang: (a, b) => (x) => { x.fillStyle = a; x.beginPath(); x.moveTo(2, 14); x.lineTo(2, 5); x.lineTo(5, 2); x.lineTo(7, 4); x.lineTo(6, 10); x.lineTo(12, 9); x.lineTo(14, 11); x.lineTo(11, 14); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(3, 5, 2, 7); x.fillRect(6, 11, 6, 2); },
    launcher: (a, b) => (x) => { x.fillStyle = a; x.fillRect(1, 6, 12, 5); x.fillStyle = b; x.fillRect(1, 6, 12, 1); x.fillRect(11, 5, 3, 7); x.fillStyle = '#e04040'; x.fillRect(14, 7, 2, 3); x.fillStyle = '#3a3a44'; x.fillRect(4, 11, 3, 4); x.fillRect(9, 11, 2, 3); x.fillStyle = '#ffe080'; x.fillRect(2, 8, 2, 1); },
    tome: (a, b) => (x) => { x.fillStyle = '#3a2a1a'; x.fillRect(2, 2, 12, 12); x.fillStyle = a; x.fillRect(3, 3, 10, 10); x.fillStyle = '#3a2a1a'; x.fillRect(4, 2, 1, 12); x.fillStyle = b; x.fillRect(7, 5, 3, 1); x.fillRect(8, 4, 1, 3); x.fillRect(6, 9, 5, 1); x.fillRect(6, 11, 5, 1); x.fillStyle = '#ffe080'; x.fillRect(12, 7, 2, 2); },
    gun: (a, b) => (x) => { x.fillStyle = a; x.fillRect(2, 6, 12, 3); x.fillRect(11, 5, 4, 2); x.fillStyle = '#5a3a20'; x.fillRect(3, 9, 3, 5); x.fillRect(2, 6, 3, 2); x.fillStyle = b; x.fillRect(2, 6, 12, 1); x.fillRect(7, 9, 2, 2); },
  },
  kindOf(it) {
    const id = it.id, cls = it.wclass;
    if (cls === 'whip') return 'whip';
    if (cls === 'spear') return 'spear';
    if (cls === 'boomerang') return 'boomerang';
    if (cls === 'launcher') return 'launcher';
    if (cls === 'gun') return 'gun';
    if (cls === 'summon') return it.minion && it.minion.sentry ? 'wand' : 'staff';
    if (cls === 'magic' || it.magic) return /staff|rod|scepter|sceptre|cane|thorn|lash|missile|razor|crystal_storm/.test(id) ? 'staff' : /wand|zapper|blaster|prism|laser|ray|beam/.test(id) ? 'wand' : 'tome';
    return null;
  },
  apply() {
    let n = 0;
    for (const id in ITEMS) {
      const it = ITEMS[id]; if (!it.drawIcon || it.icon || !(it.damage > 0)) continue;
      const kind = this.kindOf(it); if (!kind) continue;
      const pr = this.probe(it.drawIcon); if (!pr) continue;
      const g = Object.values(this.generic).includes(pr.sig); if (!g) continue; // hand-drawn icon: keep it
      const a = pr.cols[0] || '#c0c0c8', b = pr.cols[1] || '#fff';
      it.drawIcon = this.shapes[kind](it.color || a, b); n++;
    }
    return n;
  },
};
// icons are built when the game starts: swap the placeholders first
ModLib.patch(() => { WeaponLooks.count = WeaponLooks.apply(); });
