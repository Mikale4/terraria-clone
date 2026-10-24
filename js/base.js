// ---------------------------------------------------------------------------
// Start with base: builds a starter base at the end of world generation with one
// valid house per town NPC the game contains. Styles, block / wall types and
// extras (hellevator, rest outposts) are chosen at world creation. Chests and
// crafting stations are not placed - that is still your job.
// ---------------------------------------------------------------------------
'use strict';

const BASE_STYLES = ['none', 'row', 'tower', 'apartments', 'bunker', 'pyramid'];
const BASE_STYLE_NAMES = { none: 'None', row: 'Row Houses', tower: 'Tower', apartments: 'Apartment Block', bunker: 'Underground Bunker', pyramid: 'Pyramid' };
const BASE_BLOCKS = { wood: ['Wood', T.WOOD], brick: ['Gray Brick', T.STONEBRICK], sandstone: ['Sandstone', T.SANDSTONE], planks: ['Wood Planks', T.WOODPLANKS], stone: ['Stone', T.STONE] };
const BASE_WALLS = { wood: ['Wood Wall', W.WOOD], planks: ['Planked Wall', W.PLANKS], brick: ['Gray Brick Wall', W.STONEBRICK], glass: ['Glass Wall', W.GLASS], dirt: ['Dirt Wall', W.DIRT_SAFE] };
const DEFAULT_BASE_CONFIG = { style: 'row', block: 'wood', wall: 'wood', hellevator: false, outposts: false };

// Short config code like the mod's world-name suffix: $Ba<style>F<furniture>T<block>W<wall>
function baseConfigCode(c) {
  const st = BASE_STYLES.indexOf(c.style);
  return `$Ba${st}Fwo T${c.block.slice(0, 2)} W${c.wall.slice(0, 2)}${c.hellevator ? ' H' : ''}${c.outposts ? ' O' : ''}`.replace(/ /g, '');
}

function baseRoomCount() {
  // one flat per town NPC the game knows about (Guide + everyone in the arrival list)
  return Math.min(8, 1 + NPC_ARRIVAL_ORDER.length);
}

function generateBase(world, cfg) {
  if (!cfg || cfg.style === 'none') return null;
  const w = world.w, h = world.h;
  const block = BASE_BLOCKS[cfg.block] ? BASE_BLOCKS[cfg.block][1] : T.WOOD;
  const wall = BASE_WALLS[cfg.wall] ? BASE_WALLS[cfg.wall][1] : W.WOOD;
  const rooms = baseRoomCount();
  const RW = 10, RH = 7;              // room frame size (interior 8x5 -> 70 tiles incl. frame: a valid house)
  const cx = Math.floor(w / 2);
  let ground = world.surface[cx];

  const setBlock = (x, y) => world.setTile(x, y, block);
  const clear = (x, y) => { world.setTile(x, y, T.AIR); world.liquid[world.idx(x, y)] = 0; };
  const fillRect = (x0, y0, x1, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(x, y); };
  // flatten & clear an area: everything above `ground` becomes air, everything from ground down is dirt (with grass on top)
  const flatten = (x0, x1, top) => {
    for (let x = x0; x <= x1; x++) {
      for (let y = Math.max(0, top - 40); y < ground; y++) clear(x, y);
      for (let y = ground; y < ground + 6; y++) if (!TILES[world.get(x, y)].solid) world.setTile(x, y, T.DIRT);
      if (world.get(x, ground) === T.DIRT || world.get(x, ground) === T.AIR) world.setTile(x, ground, world.biome[x] === BIOME.DESERT ? T.SAND : world.biome[x] === BIOME.SNOW ? T.SNOW : T.GRASS);
      for (let y = ground; y < ground + 6; y++) world.setWall(x, y, world.getWall(x, y));
    }
  };
  // one house: frame with (x,y) top-left; furniture; walls. door on 'left'|'right'|null, hatch (platform hole) in the floor at 'hatchX'
  const room = (x, y, door, hatchX) => {
    fillRect(x, y, x + RW - 1, y + RH - 1, (xx, yy) => { const edge = xx === x || xx === x + RW - 1 || yy === y || yy === y + RH - 1; if (edge) setBlock(xx, yy); else clear(xx, yy); world.setWall(xx, yy, wall); });
    const floorY = y + RH - 1, inBottom = y + RH - 2;
    if (door === 'left') { for (let k = 0; k < 3; k++) clear(x, inBottom - k); world.placeFurniture(x, inBottom - 2, T.DOOR_C); }
    if (door === 'right') { for (let k = 0; k < 3; k++) clear(x + RW - 1, inBottom - k); world.placeFurniture(x + RW - 1, inBottom - 2, T.DOOR_C); }
    if (hatchX != null) { world.setTile(hatchX, floorY, T.PLATFORM); world.setTile(hatchX + 1, floorY, T.PLATFORM); }
    world.setTile(x + 2, y + 2, T.TORCH);
    world.placeFurniture(x + 3, inBottom - 1, T.TABLE);
    world.placeFurniture(x + 7, inBottom - 1, T.CHAIR);
    return { x, y };
  };
  const built = [];
  let spawn = { x: cx, y: ground };

  if (cfg.style === 'row') {
    const total = rooms * (RW - 1) + 1;
    const x0 = cx - Math.floor(total / 2);
    flatten(x0 - 6, x0 + total + 6, ground - RH - 4);
    for (let i = 0; i < rooms; i++) built.push(room(x0 + i * (RW - 1), ground - RH + 1, 'left', null));
    // the last house also opens to the right
    { const x = x0 + (rooms - 1) * (RW - 1); const inBottom = ground - 1; for (let k = 0; k < 3; k++) clear(x + RW - 1, inBottom - k); world.placeFurniture(x + RW - 1, inBottom - 2, T.DOOR_C); }
    spawn = { x: x0 - 3, y: ground };
  } else if (cfg.style === 'tower') {
    const x0 = cx - Math.floor(RW / 2);
    flatten(x0 - 8, x0 + RW + 8, ground - rooms * (RH - 1) - 6);
    for (let i = 0; i < rooms; i++) {
      const y = ground - RH + 1 - i * (RH - 1);
      built.push(room(x0, y, i === 0 ? 'left' : null, i > 0 ? (i % 2 ? x0 + 1 : x0 + RW - 3) : null));
    }
    spawn = { x: x0 - 3, y: ground };
  } else if (cfg.style === 'apartments') {
    const floors = Math.ceil(rooms / 2), stair = 3;
    const width = RW * 2 + stair - 2;
    const x0 = cx - Math.floor(width / 2);
    flatten(x0 - 6, x0 + width + 6, ground - floors * (RH - 1) - 6);
    const leftX = x0, stairX = x0 + RW - 1, rightX = stairX + stair - 1;
    let n = 0;
    for (let f = 0; f < floors; f++) {
      const y = ground - RH + 1 - f * (RH - 1);
      if (n++ < rooms) { built.push(room(leftX, y, 'right', null)); if (f === 0) { const inBottom = y + RH - 2; for (let k = 0; k < 3; k++) clear(leftX, inBottom - k); world.placeFurniture(leftX, inBottom - 2, T.DOOR_C); } }
      if (n++ < rooms) built.push(room(rightX, y, 'left', null));
      // stairwell: open shaft with platforms every floor
      fillRect(stairX + 1, y, stairX + stair - 2, y + RH - 2, clear);
      for (let sx = stairX + 1; sx <= stairX + stair - 2; sx++) { world.setWall(sx, y + RH - 1, wall); world.setTile(sx, y + RH - 1, f === 0 ? block : T.PLATFORM); for (let yy = y; yy < y + RH - 1; yy++) world.setWall(sx, yy, wall); }
      if (f === floors - 1) for (let sx = stairX + 1; sx <= stairX + stair - 2; sx++) setBlock(sx, y);
    }
    spawn = { x: leftX - 3, y: ground };
  } else if (cfg.style === 'bunker') {
    const x0 = cx - Math.floor((rooms * (RW - 1) + 1) / 2);
    const total = rooms * (RW - 1) + 1;
    const top = ground + 6;              // rooms start 6 tiles below the surface
    flatten(cx - 8, cx + 8, ground - 8);
    // corridor above the rooms, shaft from the surface
    fillRect(x0, top - 4, x0 + total - 1, top - 1, (x, y) => { clear(x, y); world.setWall(x, y, wall); });
    fillRect(x0 - 1, top - 5, x0 + total, top - 5, setBlock); fillRect(x0 - 1, top - 5, x0 - 1, top + RH - 1, setBlock); fillRect(x0 + total, top - 5, x0 + total, top + RH - 1, setBlock);
    for (let i = 0; i < rooms; i++) built.push(room(x0 + i * (RW - 1), top, null, null));
    for (let i = 0; i < rooms; i++) { const rx = x0 + i * (RW - 1) + 4; world.setTile(rx, top, T.PLATFORM); world.setTile(rx + 1, top, T.PLATFORM); }
    for (let y = ground; y < top - 4; y++) { clear(cx, y); clear(cx + 1, y); world.setWall(cx, y, wall); world.setWall(cx + 1, y, wall); if ((y - ground) % 4 === 3) { world.setTile(cx, y, T.PLATFORM); world.setTile(cx + 1, y, T.PLATFORM); } }
    world.setTile(cx - 1, ground - 1, T.TORCH); world.setTile(cx + 2, ground - 1, T.TORCH);
    spawn = { x: cx - 3, y: ground };
  } else if (cfg.style === 'pyramid') {
    const rows = [];
    { let remaining = rooms, rowN = Math.ceil(rooms / 2); while (remaining > 0) { const n = Math.min(rowN, remaining); const rowW = n * (RW - 1) + 1; rows.push({ n, rx0: cx - Math.floor(rowW / 2) }); remaining -= n; rowN = Math.max(1, rowN - 1); } }
    const baseW = rows[0].n * (RW - 1) + 1;
    const x0 = rows[0].rx0;
    flatten(x0 - 6, x0 + baseW + 6, ground - rows.length * (RH - 1) - 6);
    rows.forEach((row, floor) => {
      const y = ground - RH + 1 - floor * (RH - 1);
      for (let i = 0; i < row.n; i++) built.push(room(row.rx0 + i * (RW - 1), y, i === 0 ? (floor === 0 ? 'left' : null) : 'left', null));
      // hatch up into the first room of the next row
      const next = rows[floor + 1];
      if (next) { const hx = next.rx0 + 2; world.setTile(hx, y, T.PLATFORM); world.setTile(hx + 1, y, T.PLATFORM); }
    });
    spawn = { x: x0 - 3, y: ground };
  }

  // extras -----------------------------------------------------------------------
  if (cfg.hellevator) {
    const hx = built.length ? (built[built.length - 1].x + RW + 4) : cx + 12;
    const bottom = h - 70 + 20;
    for (let y = ground; y < bottom; y++) {
      for (let x = hx; x < hx + 3; x++) { clear(x, y); }
      if (world.isSolidAt(hx - 1, y) === false) world.setTile(hx - 1, y, T.STONEBRICK);
      if (world.isSolidAt(hx + 3, y) === false) world.setTile(hx + 3, y, T.STONEBRICK);
      if ((y - ground) % 22 === 21) for (let x = hx; x < hx + 3; x++) world.setTile(x, y, T.PLATFORM);
      if ((y - ground) % 10 === 5) { world.setWall(hx, y, wall); world.setTile(hx, y, T.TORCH); }
    }
    for (let x = hx - 1; x <= hx + 3; x++) world.setTile(x, ground - 1, T.AIR);
    world.setTile(hx - 1, ground - 1, T.TORCH);
  }
  if (cfg.outposts) {
    for (let side = -1; side <= 1; side += 2) for (let k = 1; k <= 3; k++) {
      const ox = cx + side * k * 150;
      if (ox < 20 || ox > w - 20) continue;
      let oy = 0; while (oy < h - 1 && !world.isSolidAt(ox, oy)) oy++;
      // small shelter: 7 wide, 5 tall, campfire + torch, platforms as walls so it is a rest stop not a house
      for (let x = ox - 3; x <= ox + 3; x++) { for (let y = oy - 5; y < oy; y++) clear(x, y); for (let y = oy; y < oy + 2; y++) if (!world.isSolidAt(x, y)) world.setTile(x, y, T.DIRT); if (!world.isSolidAt(x, oy)) world.setTile(x, oy, T.DIRT); }
      for (let x = ox - 3; x <= ox + 3; x++) world.setTile(x, oy - 5, T.WOOD);
      for (let y = oy - 4; y < oy; y++) { world.setTile(ox - 3, y, y === oy - 1 ? T.PLATFORM : T.WOOD); world.setTile(ox + 3, y, y === oy - 1 ? T.PLATFORM : T.WOOD); }
      for (let x = ox - 2; x <= ox + 2; x++) for (let y = oy - 4; y < oy; y++) world.setWall(x, y, wall);
      world.placeFurniture(ox - 1, oy - 1, T.CAMPFIRE);
      world.setTile(ox - 2, oy - 3, T.TORCH);
    }
  }
  world.rebuildTopSolid();
  world.rebuildChairs();
  return { spawn, rooms: built.length, code: baseConfigCode(cfg) };
}
