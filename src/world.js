// world.js: the set. One lane, two small houses side by side, a low wooden fence between their yards, a utility pole
// behind the gap with its wires across the sky. Everything is drawn in world pixels (the camera frames it), flat 2D:
// depth only from overlap, scale and paler colour. tod = time of day (0 morning … 1 afternoon …), carried by the scenes.
// Later stages pass opt-in palettes and options (dusk, night, rain); without them every function draws exactly as in
// stage 1, so the approved stage renders unchanged.
const G = 940, FX = 1000;                 // the ground line where feet stand; the fence's centre
const SET = { her: [140, 860], his: [1140, 1860], wallTop: 560, wallBase: 905, eave: 548, ridge: 455 };
const FENCE = { x0: FX - 86, x1: FX + 86, top: G - 118 };   // the cap rail the cat sits on
const COL = {
  wallHer: '#F3E4CB', wallHis: '#ECDFC8', plinth: '#D6C29F', roofHer: '#7C8CAE', roofHis: '#8791A6', roofDk: '#55607D',
  doorHer: '#6DB0A2', doorHis: '#C48C55', frame: '#5D7F8E', glass: '#C3E0E8', shutter: '#9DAE9C', curtain: '#F6E3A8',
  ground: '#E5CFA4', groundDk: '#CDB282', grass: '#8CB164', fence: '#EFE6D2', fenceDk: '#C9BB9B', pole: '#8E7A62',
  tree: '#7FAE6A', treeDk: '#5D8F55', hedge: '#6E9A5C',
};
const skyCol = tod => ({ top: mixCol('#9FCDEA', '#92BFE0', tod), low: mixCol('#DDF0F4', '#F5E3C2', tod), cloud: mixCol('#FCF8EE', '#FFF1DC', tod) });

// ---------- sky ----------
function sky(t, tod, o = {}) {
  const C = o.pal || skyCol(tod);
  boilSeed('sky');
  paint(rectPts(-700, -1000, 3400, 1800), { wash: C.top, ink: null });
  paint(ellPts(1000, 560, 2200, 330, 30, 8), { fill: C.low, fillOp: 150, bleed: .3, tex: .4, ink: null });
  paint(ellPts(1000, 470, 1900, 170, 26, 6), { fill: C.low, fillOp: 110, bleed: .3, tex: .3, ink: null });
  // the sun: o.sun = [x, y]
  if (o.sun) {
    const [sx, sy] = o.sun;
    boilSeed('sun');
    const sc = o.sunCol || { halo: mixCol('#FFF4D8', '#FFE2A8', tod), disk: mixCol('#FFF8E6', '#FFEBB8', tod) }, sr = o.sunR || 50;
    paint(ellPts(sx, sy, sr * 3, sr * 3, 24, 4), { fill: sc.halo, fillOp: 90, bleed: .35, tex: .2, ink: null });
    paint(ellPts(sx, sy, sr, sr, 22, 1), { wash: sc.disk, fill: PAL.ochre, fillOp: 30 + 30 * tod, ink: mixCol(PAL.ink, C.top, .55), sw: .6 });
  }
  // clouds drift right to left; o.drift adds a time-lapse push
  const drift = t * 9 + (o.drift || 0);
  for (let i = 0; i < (o.clouds ?? 6); i++) {
    boilSeed('cloud ' + i);
    const span = 3600, x = ((hash(i * 5) * span - drift * (.7 + .5 * hash(i))) % span + span) % span - 900, y = -260 + 330 * hash(i * 9 + 1);
    cloud(x, y, 150 + 140 * hash(i * 3 + 2), C, i);
  }
}
function cloud(cx, cy, w, C, seed) {
  const pts = [], n = 30;
  for (let k = 0; k < n; k++) {
    const a = k / n * TAU, up = Math.sin(a) < 0, bump = up ? 1 + .3 * Math.abs(Math.sin(a * 3 + seed)) : 1;
    pts.push([cx + Math.cos(a) * w * (up ? bump * .95 : 1), cy + Math.sin(a) * (up ? .52 : .2) * w * bump]);
  }
  paint(pts, { wash: C.cloud, washOp: 235, fill: mixCol(C.top, '#FFFFFF', .2), fillOp: 60, bleed: .2, tex: .3, ink: null, curv: .5 });
  paint(ellPts(cx, cy + .1 * w, w * .8, .12 * w, 14), { fill: mixCol(C.top, PAL.indigo, .15), fillOp: 45, bleed: .3, ink: null });
}

// ---------- behind the houses: trees, the hedge in the gap, the pole and its wires ----------
function backdrop(t, tod, bob, o = {}) {
  boilSeed('trees');
  const tree = o.tree || mixCol(COL.tree, '#C7D98F', tod * .25), treeDk = o.treeDk || mixCol(COL.treeDk, PAL.indigo, .08);
  for (let i = 0; i < 9; i++) {
    const x = -260 + i * 330 + 60 * hash(i) + (o.sway ? o.sway * Math.sin(t * 2.6 + i * 1.7) : 0), r = 150 + 50 * hash(i + 4), y = 520 - 40 * hash(i + 8);
    paint(ellPts(x, y, r, r * .62, 22, 4), { fill: i % 2 ? tree : treeDk, fillOp: 160, bleed: .2, tex: .6, ink: null });
  }
  if (o.band) {   // opt-in: far foliage down to the ground everywhere behind the houses (the sky wash stops at y 800)
    boilSeed('band');
    paint(rectPts(-700, 640, 3400, 280), { wash: o.band, ink: null });
    for (let i = 0; i < 14; i++) paint(ellPts(-560 + i * 240, 660 + 30 * hash(i + 60), 150, 70, 16, 3), { wash: o.band, fill: mixCol(o.band, PAL.ink, .2), fillOp: 50, bleed: .15, tex: .6, ink: null });
  }
  boilSeed('hedge');   // bushes in the gap between the houses, paler with distance
  const far = o.hedge || mixCol(COL.hedge, '#BFD6C4', .3), mid = mixCol(far, o.treeDk || COL.treeDk, .3), deep = mixCol(far, o.treeDk || COL.treeDk, .6);
  paint(rectPts(830, 712, 340, 200), { wash: mid, ink: null });
  for (let i = 0; i < 6; i++) paint(ellPts(842 + i * 63, 690 + 26 * hash(i + 40), 60 + 12 * hash(i), 58, 18, 3), { wash: i % 2 ? far : mid, fill: deep, fillOp: 55, bleed: .12, tex: .7, ink: null });
  for (let i = 0; i < 5; i++) paint(ellPts(858 + i * 72, 810 + 36 * hash(i + 9), 62, 44, 14, 3), { fill: deep, fillOp: 80, bleed: .2, tex: .7, ink: null });
  pole(t, bob, o.pole, o.wire);
}
// The wires: two per side from the pole's crossarm, sagging off-frame. wireY(x, i) = the wire i's height at x.
const WIRES = [{ x0: 950, y0: 76, x1: -700, y1: 96, sag: 64 }, { x0: 1050, y0: 76, x1: 2700, y1: 92, sag: 64 },
               { x0: 989, y0: 134, x1: -700, y1: 156, sag: 58 }, { x0: 1011, y0: 134, x1: 2700, y1: 152, sag: 58 }];
function wireY(x, i, bob = 0) {
  const w = WIRES[i], k = clamp((x - w.x0) / (w.x1 - w.x0));
  return lerp(w.y0, w.y1, k) + w.sag * 4 * k * (1 - k) + bob * Math.sin(k * Math.PI);
}
function pole(t, bob, pc0, wire) {
  bob = bob || [0, 0, 0, 0];
  boilSeed('pole');
  const pc = pc0 || mixCol(COL.pole, '#A9C3CF', .35);
  paint(rectPts(992, 30, 16, 880, 1), { wash: pc, fill: mixCol(pc, PAL.ink, .25), fillOp: 60, bleed: .05, tex: .7, ink: mixCol(PAL.ink, pc, .3), sw: .7 });
  paint(rectPts(930, 70, 140, 11, .8), { wash: mixCol(pc, PAL.ink, .12), ink: mixCol(PAL.ink, pc, .3), sw: .7 });
  for (const ix of [950, 1050]) paint(ellPts(ix, 66, 7, 9, 10), { wash: PAL.cream, ink: PAL.ink, sw: .6 });
  paint(rectPts(980, 128, 40, 9, .6), { wash: mixCol(pc, PAL.ink, .12), ink: mixCol(PAL.ink, pc, .3), sw: .6 });
  WIRES.forEach((w, i) => {
    boilSeed('wire ' + i);
    const pts = []; for (let k = 0; k <= 10; k++) { const x = lerp(w.x0, w.x1, k / 10); pts.push([x, wireY(x, i, bob[i] || 0)]); }
    inkLine(pts, .75, wire || mixCol(PAL.ink, '#6D7590', .25), 'inkfine', .5);
  });
}

// ---------- the two houses ----------
// o: { wall, roof, door, side: 'her' | 'his', lived: 0..1 (his: shutters → open window, curtains, a pot) }
// Later stages (opt-in): plinth, frame, glass, curtain, step colours; lit 0..1 (lamplight in the window, with glow);
// inside(win) draws a room and whoever stands in it behind the window glass (the wall is then painted around the window);
// doorOpen 0..1 swings the door in and spills the light from the doorway; rainGlass 0..1 streaks the window.
// Stage 3 adds doorGlow (0 = a doorway opened in daylight: no lamplight spilling out; default 1).
function house(x0, x1, o) {
  const { wallTop: wt, wallBase: wb, eave, ridge } = SET, key = 'house ' + o.side;
  const win = o.side === 'her' ? [x0 + 90, 640, 210, 150] : [x0 + 110, 640, 210, 150];
  boilSeed(key + ' wall');
  if (o.inside) {   // the room behind the glass first, then the wall around the window
    const [wx, wy, ww, wh] = win;
    paint(rectPts(wx - 4, wy - 4, ww + 8, wh + 8), { wash: o.room || '#E2B26E', fill: mixCol(o.room || '#E2B26E', PAL.ink, .3), fillOp: 50, bleed: .2, tex: .5, ink: null });
    o.inside(win);
    boilSeed(key + ' wall');
    for (const r of [[x0, wt, x1 - x0, wy - wt], [x0, wy + wh, x1 - x0, wb - wy - wh], [x0, wy - 1, wx - x0, wh + 2], [wx + ww, wy - 1, x1 - wx - ww, wh + 2]]) paint(rectPts(...r), { wash: o.wall, ink: null });
  } else paint(rectPts(x0, wt, x1 - x0, wb - wt, 1), { wash: o.wall, ink: null });
  paint(rectPts(x0, wb - 62, x1 - x0, 62, .8), { fill: o.plinth || COL.plinth, fillOp: 150, bleed: .04, tex: .6, border: .4, ink: null });
  paint(rectPts(x0, wt, 60, wb - wt, 1), { fill: mixCol(o.wall, PAL.ink, .2), fillOp: 60, bleed: .2, tex: .5, ink: null });
  paint(rectPts(x0, wt, x1 - x0, 40, .6), { fill: mixCol(o.wall, PAL.indigo, .25), fillOp: 70, bleed: .15, ink: null });   // eave shadow
  paint(rectPts(x0, wt, x1 - x0, wb - wt, 1), { ink: PAL.ink, sw: 1 });
  // the window and the door: hers is lived in from the start; his opens up when lived > 0
  const door = o.side === 'her' ? [x1 - 250, 632, 150, 273] : [x1 - 300, 632, 150, 273];
  windowPane(...win, o, key);
  boilSeed(key + ' door');
  const [dx, dy, dw, dh] = door;
  paint(rectPts(dx - 12, dy - 12, dw + 24, dh + 12, .8), { wash: mixCol(o.wall, PAL.ink, .12), ink: PAL.ink, sw: .9 });
  if (o.doorOpen > .01) {   // swung inward: the lit doorway, the door leaf narrowing at its hinge, light on the ground
    const k = clamp(o.doorOpen), lw = dw * (1 - .82 * k);
    paint(rectPts(dx, dy, dw, dh, .8), { wash: o.room || '#E2B26E', fill: mixCol(o.room || '#E2B26E', PAL.ink, .25), fillOp: 60, bleed: .15, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(dx, dy, lw, dh, .8), { wash: o.door, fill: mixCol(o.door, PAL.ink, .3), fillOp: 50, bleed: .06, tex: .6, ink: PAL.ink, sw: 1 });
    const lamp = o.doorGlow ?? 1;   // opt-in (stage 3): 0 for a doorway opened in daylight (no lamplight spilling out)
    if (lamp > 0) {
      glow(dx + dw / 2, dy + dh * .55, 230 * k, '#FFC766', .9 * k * lamp);
      paint([[dx, wb], [dx + dw, wb], [dx + dw + 90 * k, wb + 120 * k], [dx - 70 * k, wb + 120 * k]], { wash: '#F6C978', washOp: 70 * k * lamp, ink: null });
    }
  } else {
    paint(rectPts(dx, dy, dw, dh, .8), { wash: o.door, fill: mixCol(o.door, PAL.ink, .3), fillOp: 50, bleed: .06, tex: .6, ink: PAL.ink, sw: 1 });
    paint(rectPts(dx + 18, dy + 22, dw - 36, 92, .6), { fill: mixCol(o.door, PAL.ink, .25), fillOp: 90, ink: PAL.ink, sw: .6 });
    paint(rectPts(dx + 18, dy + 140, dw - 36, 108, .6), { fill: mixCol(o.door, PAL.ink, .25), fillOp: 90, ink: PAL.ink, sw: .6 });
    paint(ellPts(dx + dw - 22, dy + 140, 6, 6, 8), { wash: PAL.ochre, ink: PAL.ink, sw: .5 });
  }
  paint(rectPts(dx - 24, wb - 4, dw + 48, 16, .8), { wash: o.step || '#C9BCA3', ink: PAL.ink, sw: .8 });          // step
  // the roof: grey-blue clay tiles, curling up at the eaves
  boilSeed(key + ' roof');
  const roof = [[x0 - 70, eave - 14], [x0 - 40, eave + 6], [x1 + 40, eave + 6], [x1 + 70, eave - 14], [x1 + 18, eave - 26], [x1 - 50, ridge], [x0 + 50, ridge], [x0 - 18, eave - 26]];
  paint(roof, { wash: o.roof, fill: mixCol(o.roof, PAL.ink, .25), fillOp: 60, bleed: .08, tex: .6, ink: null });
  const n = Math.round((x1 - x0) / 30);
  for (let i = 0; i <= n; i++) {
    const k = i / n, xt = lerp(x0 + 50, x1 - 50, k), xb = lerp(x0 - 30, x1 + 30, k);
    inkLine([[xt, ridge + 6], [xb, eave - 2]], .55, mixCol(o.roof, PAL.ink, .45), 'inkfine', 0);
  }
  paint(rectPts(x0 - 40, eave - 8, x1 - x0 + 80, 14, .6), { wash: mixCol(o.roof, PAL.ink, .3), ink: null });
  paint(roof, { ink: PAL.ink, sw: 1, curv: .15 });
  paint([[x0 + 30, ridge + 4], [x0 + 46, ridge - 22], [x1 - 46, ridge - 22], [x1 - 30, ridge + 4]], { wash: mixCol(o.roof, PAL.ink, .35), ink: PAL.ink, sw: .9 });
  if (!o.noPots && (o.side === 'her' || o.lived > .5)) {   // a potted plant by the door
    pot(door[0] - 70, wb + 10, o.side === 'her' ? '#E27A92' : PAL.ochre, key);
  }
  if (!o.noPots && o.side === 'her') pot(x0 + 60, wb + 14, '#F2C14E', key + 'b');
}
function windowPane(x, y, w, h, o, key) {
  boilSeed(key + ' window');
  const open = o.side === 'her' ? 1 : clamp(o.lived ?? 0);
  const frame = o.frame || COL.frame, lit = o.lit || 0;
  if (o.inside) {   // the frame around a see-through pane (the room was painted first)
    for (const r of [[x - 10, y - 10, w + 20, 10], [x - 10, y + h, w + 20, 10], [x - 10, y, 10, h], [x + w, y, 10, h]]) paint(rectPts(...r, .4), { wash: frame, ink: null });
    paint(rectPts(x - 10, y - 10, w + 20, h + 20, .6), { ink: PAL.ink, sw: .9 });
    paint(rectPts(x, y, w, h, .6), { wash: o.glass || '#9FB4D8', washOp: 50, ink: PAL.ink, sw: .5 });
  } else {
    paint(rectPts(x - 10, y - 10, w + 20, h + 20, .6), { wash: frame, ink: PAL.ink, sw: .9 });
    paint(rectPts(x, y, w, h, .6), { wash: lit ? mixCol(o.glass || COL.glass, '#FFD27A', lit) : (o.glass || COL.glass), fill: mixCol(o.glass || COL.glass, PAL.indigo, .3), fillOp: 60, bleed: .1, tex: .4, ink: null });
  }
  if (o.shut > .01) {   // opt-in (stage 4): curtains drawn across, nobody home; shut 0..1 = how far they are drawn
    const cw = w / 2 * clamp(o.shut), col = o.curtain || (o.side === 'her' ? '#F7D3DC' : COL.curtain);
    for (const s of [0, 1]) {
      const e = s ? x + w : x, m = e + (s ? -1 : 1) * cw;
      paint([[e, y - 2], [m, y - 2], [m + (s ? -1 : 1) * 3, y + h * .5], [m, y + h + 2], [e, y + h + 2]], { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 50, bleed: .05, tex: .4, ink: PAL.ink, sw: .6, curv: .3 });
      for (const f of [.35, .7]) inkLine([[lerp(e, m, f), y + 4], [lerp(e, m, f) + (s ? 2 : -2), y + h - 4]], .5, mixCol(col, PAL.ink, .45), 'inkfine', .3);
    }
  } else if (open > .01) {   // curtains, tied back
    const cw = (o.curtainW ?? .26) / .26;   // how far the curtains reach in (tied back narrower when someone looks out)
    for (const s of [0, 1]) paint([[x + s * w, y], [x + s * w + (s ? -1 : 1) * w * .26 * cw, y], [x + s * w + (s ? -1 : 1) * w * .12 * cw, y + h * .55], [x + s * w + (s ? -1 : 1) * w * .2 * cw, y + h], [x + s * w, y + h]],
      { wash: o.curtain || (o.side === 'her' ? '#F7D3DC' : COL.curtain), washOp: 255 * open, ink: PAL.ink, sw: .6 * open, curv: .4 });
  }
  inkLine([[x + w / 2, y], [x + w / 2, y + h]], .9, frame, 'ink', 0);
  inkLine([[x, y + h / 2], [x + w, y + h / 2]], .9, frame, 'ink', 0);
  if (o.rainGlass) for (let i = 0; i < 9; i++) {   // water running down the glass
    const rx = x + 12 + hash(i * 4.3) * (w - 24), ph = frac(T * (.35 + .3 * hash(i)) + hash(i * 2.1)), ry = y + 6 + ph * (h - 30);
    inkLine([[rx, ry], [rx + 2, ry + 18 + 10 * hash(i)]], .7, '#CFE0F4', 'inkfine', .3);
  }
  if (open < .99) {   // shutters, closed (vacant)
    const k = 1 - open;
    for (const s of [0, 1]) {
      const sx = s ? x + w / 2 + (w / 2) * (1 - k) : x, sw = (w / 2) * k;
      if (sw < 2) continue;
      paint(rectPts(sx, y - 4, sw, h + 8, .5), { wash: COL.shutter, ink: PAL.ink, sw: .8 });
      for (let i = 1; i < 7; i++) inkLine([[sx + 4, y + i * h / 7], [sx + sw - 4, y + i * h / 7]], .5, mixCol(COL.shutter, PAL.ink, .4), 'inkfine', 0);
    }
  }
  paint(rectPts(x - 16, y + h + 8, w + 32, 12, .5), { wash: mixCol(frame, PAL.cream, .3), ink: PAL.ink, sw: .7 });
  if (lit > .01) glow(x + w / 2, y + h / 2, 210 + 40 * lit, '#FFC766', .85 * lit);
}
function pot(x, y, bloom, key) {
  boilSeed(key + ' pot');
  paint([[x - 26, y - 46], [x + 26, y - 46], [x + 19, y], [x - 19, y]], { wash: '#C9774F', fill: '#9C5232', fillOp: 70, ink: PAL.ink, sw: .8 });
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * .5, l = 34 + 10 * hash(i);
    inkLine([[x, y - 44], [x + Math.cos(a) * l * .6, y - 44 + Math.sin(a) * l]], .8, '#5E8F4E', 'ink', .5);
  }
  for (let i = 0; i < 3; i++) paint(ellPts(x - 14 + i * 14, y - 82 + 8 * (i % 2), 8, 8, 10), { wash: bloom, ink: PAL.ink, sw: .5 });
}

// ---------- the yards and the fence ----------
function yard(t, o = {}) {
  const ground = o.ground || COL.ground, grass = o.grass || COL.grass;
  boilSeed('yard');
  paint(rectPts(-700, SET.wallBase, 3400, 700), { wash: ground, ink: null });
  paint(rectPts(-700, SET.wallBase + 110, 3400, 600), { fill: o.groundDk || COL.groundDk, fillOp: 70, bleed: .15, tex: .6, ink: null });
  inkLine([[-700, SET.wallBase + 1], [FX, SET.wallBase + 3], [2700, SET.wallBase]], .8, mixCol(PAL.ink, ground, .3), 'ink', .3);
  for (let i = 0; i < 26; i++) {   // pebbles and grass tufts, fixed in place
    boilSeed('tuft ' + i);
    const x = -200 + hash(i * 13) * 2400, y = SET.wallBase + 18 + hash(i * 7 + 3) * 170;
    if (Math.abs(x - FX) < 110) continue;
    if (i % 3) { const sw = Math.sin(t * 1.6 + i) * 3 + (o.wind || 0) * (8 + 4 * Math.sin(t * 9 + i)); for (const k of [-1, 0, 1]) inkLine([[x + k * 6, y], [x + k * 9 + sw, y - 16 - 6 * hash(i + k)]], .7, grass, 'inkfine', .4); }
    else paint(ellPts(x, y, 7 + 5 * hash(i), 4 + 2 * hash(i), 8), { wash: o.pebble || '#C2AE8C', ink: PAL.ink, sw: .4 });
  }
}
function fence(o = {}) {
  const fc = o.fence || COL.fence, fd = o.fenceDk || COL.fenceDk;
  boilSeed('fence');
  paint(ellPts(FX, G + 6, 150, 16, 16), { fill: PAL.ink, fillOp: 50, bleed: .2, tex: .3, ink: null });
  for (let i = 0; i < 5; i++) {
    const bx = FENCE.x0 + 22 + i * 26.5;
    paint(rectPts(bx, FENCE.top + 6, 21, G + 4 - FENCE.top - 6, .7), { wash: fc, fill: fd, fillOp: 45, bleed: .05, tex: .6, ink: PAL.ink, sw: .8 });
  }
  for (const px of [FENCE.x0, FENCE.x1 - 20]) paint(rectPts(px, FENCE.top - 12, 20, G + 6 - FENCE.top + 12, .7), { wash: mixCol(fc, fd, .35), ink: PAL.ink, sw: .9 });
  paint(rectPts(FENCE.x0 - 6, FENCE.top - 4, FENCE.x1 - FENCE.x0 + 12, 12, .5), { wash: fc, ink: PAL.ink, sw: .9 });   // cap rail
  inkLine([[FENCE.x0 + 20, G - 40], [FENCE.x1 - 20, G - 40]], .5, fd, 'inkfine', 0);
}
// The clothesline across his wall, between two hooks. lineY(x) = the line's height at x.
const LINE = { x0: 1166, y0: 698, x1: 1505, y1: 692, sag: 24 };
const lineY = x => { const k = clamp((x - LINE.x0) / (LINE.x1 - LINE.x0)); return lerp(LINE.y0, LINE.y1, k) + LINE.sag * 4 * k * (1 - k); };
function clothesline() {
  boilSeed('line hooks');
  for (const [hx, hy] of [[LINE.x0, LINE.y0], [LINE.x1, LINE.y1]]) paint(ellPts(hx, hy, 5, 5, 8), { wash: PAL.ink, ink: null });
  const pts = []; for (let k = 0; k <= 8; k++) { const x = lerp(LINE.x0, LINE.x1, k / 8); pts.push([x, lineY(x)]); }
  inkLine(pts, .8, PAL.ink, 'inkfine', .5);
}
// A towel that stays on the line (striped), for company.
function towel(x, t, wind) {
  boilSeed('towel');
  const y = lineY(x), fl = wind * Math.sin(t * 15);
  paint([[x - 34, y], [x + 34, y], [x + 30 + wind * 26 + fl * 6, y + 92], [x - 38 + wind * 26 + fl * 6, y + 96]], { wash: '#F2D7A0', fill: '#E0A15A', fillOp: 60, ink: PAL.ink, sw: .8 });
  for (const k of [.3, .62]) inkLine([[x - 35 + wind * 26 * k, y + 94 * k], [x + 33 + wind * 26 * k, y + 92 * k]], 1.6, '#D9775E', 'ink', 0);
  peg(x - 22, y, 13); peg(x + 22, y, 13);
}

// A warm screen-space grade for the afternoon (after camEnd()). amt = its strength at k = 1.
function grade(k, col = '#F7C27A', amt = 22) { if (k > .01) paint(rectPts(-60, -60, W + 120, H + 120), { wash: col, washOp: amt * k, ink: null }); }
