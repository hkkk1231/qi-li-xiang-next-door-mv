// props.js: the things the story moves around, painted with the same tools as the cast. None of them is ever gripped:
// boxes and the cat ride on a flat top, the shirt blows, drapes and slides, the sparrows sit on the wire.
// Every function draws one frame from its arguments; motion comes from the scene's pure functions of t.

// ---------- moving boxes ----------
const KRAFT = { col: '#CFA36C', dk: '#A47A47', tape: '#EADBB2', line: '#86663D' };
// A cardboard box standing on its bottom-centre (x, y), rotated about that point. w, h in px.
function cardBox(x, y, w, h, rot = 0, o = {}) {
  boilSeed('box ' + (o.key ?? 0));
  const sw = o.sw ?? 1;
  push(); translate(x, y); rotate(rot); if (o.sq) scale(1 + o.sq * .5, 1 - o.sq);
  const body = rectPts(-w / 2, -h, w, h, 1.1);
  paint(body, { wash: KRAFT.col, ink: null });
  paint(rectPts(-w / 2 + 2, -h * .4, w - 4, h * .4 - 2, .7), { fill: KRAFT.dk, fillOp: 110, bleed: .04, tex: .6, border: .4, ink: null });
  paint(rectPts(-w * .09, -h + 1, w * .18, h * .58, .4), { wash: KRAFT.tape, washOp: 235, ink: null });
  inkLine([[-w / 2 + 3, -h * .79], [0, -h * .8], [w / 2 - 3, -h * .79]], sw * .45, KRAFT.line, 'inkfine', 0);
  paint(body, { ink: PAL.ink, sw });
  pop();
}
// Boxes stacked on a base { x, y, rot } (a body's top): each sits on the one below, pivoting at its own bottom edge.
// boxes = [{ w, h, dx }], ang = extra angle per box (cumulative: a wobble low in the stack tips everything above it).
function stackPts(base, boxes, ang = []) {
  let x = base.x, y = base.y, r = base.rot || 0; const out = [];
  boxes.forEach((b, i) => {
    r += ang[i] || 0;
    const bx = x + (b.dx || 0) * Math.cos(r), by = y + (b.dx || 0) * Math.sin(r);
    out.push({ x: bx, y: by, rot: r, w: b.w, h: b.h });
    x = bx + b.h * Math.sin(r); y = by - b.h * Math.cos(r);
  });
  return out;
}

// ---------- the shirt ----------
const SHIRT = { col: '#9FC8E4', dk: '#6E9CC4', lt: '#D8ECF7' };
// A T-shirt laid flat, collar centre at (0, 0), y down, half-width s at the body. f = flutter phase amount (0 still).
function shirtShape(s, f = 0, t = 0) {
  const P = [[-.34, 0], [-.86, .06], [-1.46, .46], [-1.18, .9], [-.82, .64], [-.84, 1.92], [-.3, 1.96], [.3, 1.9], [.84, 1.94],
             [.82, .64], [1.18, .9], [1.46, .46], [.86, .06], [.34, 0], [0, .24]];
  return P.map(([x, y], i) => [x * s + f * s * .12 * Math.sin(t * 17 + i * 1.3) * y, y * s + f * s * .09 * Math.sin(t * 13 + i * 2.1)]);
}
function shirt(x, y, s, rot = 0, o = {}) {
  boilSeed('shirt ' + (o.key ?? 0));
  push(); translate(x, y); rotate(rot); scale(o.sx ?? 1, o.sy ?? 1);
  const P = shirtShape(s, o.flutter || 0, o.t ?? T);
  paint(P, { wash: SHIRT.col, fill: SHIRT.dk, fillOp: 55, bleed: .1, tex: .5, ink: PAL.ink, sw: o.sw ?? .9, curv: .25 });
  inkLine([[-.34 * s, 0], [0, .24 * s], [.34 * s, 0]], .7, SHIRT.dk, 'ink', .5);                 // collar
  inkLine([[-.5 * s, 1.2 * s], [-.1 * s, 1.5 * s]], .5, SHIRT.dk, 'inkfine', .5);                  // a fold
  pop();
}
// The shirt draped over a body, drawn from a clawd() draw hook (body-local, in u: the top is y = -8u, x -5u..5u).
// d = how far the front hangs down from the top (5 covers the eyes, 1.6 is pushed back like a hood);
// slide = sideways offset in u (it slides off forward on a bow), lift = how far it has peeled off the top (0..1).
function drapeHook(d, slide = 0, o = {}) {
  return (u, sw) => {
    boilSeed('drape ' + (o.key ?? 0));
    push(); translate(slide * u, 0); rotate((o.tilt || 0));
    const top = -8.35, hem = -8 + d, wv = k => .22 * Math.sin(k * 2.4 + (o.wave || 0)), j = u * .04;
    const front = [[-5.25, top], [-1.6, top - .15], [1.6, top - .12], [5.25, top]];
    for (let k = 0; k <= 8; k++) front.push([5.15 - k * 10.3 / 8, hem + wv(k)]);
    const P = front.map(([x, y]) => [x * u + jit(j), y * u + jit(j)]);
    // sleeves hang down both sides, then the front panel over the face
    for (const s of [-1, 1]) {
      const sl = [[s * 4.6, top + .1], [s * 5.9, top + .4], [s * 6.15, top + 2.6 + .2 * Math.sin((o.wave || 0) + s)], [s * 5.25, top + 2.9], [s * 4.9, top + .9]];
      paint(sl.map(([x, y]) => [x * u, y * u]), { wash: mixCol(SHIRT.col, SHIRT.dk, .25), ink: PAL.ink, sw: sw * .8, curv: .3 });
    }
    paint(P, { wash: SHIRT.col, fill: SHIRT.dk, fillOp: 50, bleed: .08, tex: .5, ink: PAL.ink, sw: sw * .9, curv: .2 });
    inkLine([[-1.4 * u, (top + .55) * u], [0, (top + 1.15) * u], [1.4 * u, (top + .55) * u]], sw * .6, SHIRT.dk, 'ink', .5);   // the collar, lying on top
    inkLine([[-3.2 * u, (hem - 1.1) * u], [-2.4 * u, (hem - .3) * u]], sw * .45, SHIRT.dk, 'inkfine', .4);
    inkLine([[2.6 * u, (hem - 1.3) * u], [3.3 * u, (hem - .4) * u]], sw * .45, SHIRT.dk, 'inkfine', .4);
    pop();
  };
}
// A shirt lying crumpled on the ground at (x, y).
function shirtHeap(x, y, s) {
  boilSeed('heap');
  const P = [[-1.5, 0], [-1.3, -.55], [-.6, -.8], [.2, -.65], [.9, -.9], [1.45, -.5], [1.6, 0]].map(([a, b]) => [x + a * s, y + b * s]);
  paint(P, { wash: SHIRT.col, fill: SHIRT.dk, fillOp: 70, bleed: .1, tex: .5, ink: PAL.ink, sw: .8, curv: .5 });
  paint([[x + .9 * s, y - .4 * s], [x + 2.1 * s, y - .15 * s], [x + 2, y + .02 * s], [x + .9 * s, y]], { wash: mixCol(SHIRT.col, SHIRT.dk, .3), ink: PAL.ink, sw: .7, curv: .3 });
}
// A wooden clothes peg, centred at (x, y).
function peg(x, y, s, rot = 0) {
  push(); translate(x, y); rotate(rot);
  paint(rectPts(-.18 * s, -.6 * s, .36 * s, 1.2 * s, .3), { wash: '#D9B27C', ink: PAL.ink, sw: .6 });
  pop();
}

// ---------- the stray cat ----------
// An orange tabby in the same flat style: a rounded body in profile and a round face turned to us, so it can look left
// or right (look -1..1) without turning its body. (x, y) = the ground point under its middle; s ≈ 0.9 × Clawd's u.
// pose: 'stand' | 'walk' | 'sit' | 'loaf' | 'leap'. flip faces it left. eyes: 'open' | 'closed' | 'wide'. mouth: null | 'yawn' | 'mew'.
const CAT = { col: '#E9A35C', dk: '#C2773A', lt: '#FBE6C8', ear: '#F2A6A8', nose: '#E07A86' };
function cat(x, y, s, o = {}) {
  const key = o.key ?? 'cat', rs = p => boilSeed(key + ' ' + p), sw = clamp(s / 16, .5, 1.6);
  const pose = o.pose || 'stand', sq = o.sq || 0, ph = o.walk || 0, tw = o.tailT ?? T;
  rs('shadow');
  if (!o.noShadow) paint(ellPts(x, y + s * .1, s * 3.4, s * .55, 18), { fill: PAL.ink, fillOp: 80, bleed: .25, tex: .3, border: .1, ink: null });
  push(); translate(x, y + (o.dy || 0) * s); if (o.rot) rotate(o.rot); scale((o.flip ? -1 : 1) * (1 + sq * .5), 1 - sq);
  const P = pts => pts.map(([a, b]) => [a * s, b * s]);
  const fur = { wash: CAT.col, washOp: 255, fill: CAT.dk, fillOp: 45, bleed: .08, tex: .6, ink: PAL.ink, sw };
  const leg = (lx, far, lift = 0, len = 2.3, ang = 0) => {
    push(); translate(lx * s, -len * s); rotate(ang);
    paint(rectPts(-.36 * s, 0, .72 * s, (len - lift) * s, s * .03), { wash: far ? mixCol(CAT.col, CAT.dk, .55) : CAT.col, ink: PAL.ink, sw: sw * .85 });
    paint(ellPts(0, (len - lift) * s - .05 * s, .42 * s, .22 * s, 8), { wash: CAT.lt, ink: PAL.ink, sw: sw * .6 });
    pop();
  };
  const tail = pts => { rs('tail'); paint(ribbon(P(pts), .85 * s, .45 * s), { ...fur, fill: CAT.dk, fillOp: 70 }); };
  let head;
  if (pose === 'loaf') {
    const k = o.curl ?? 1;
    tail([[-2.3, -.6], [-1.6, -.2], [-.2, -.15], [1.1 * k, -.25 - .1 * Math.sin(tw * 2)]]);
    rs('body'); paint(rrPts(-2.7 * s, -2.5 * s, 4.9 * s, 2.5 * s, 1.1 * s), fur);
    for (let i = 0; i < 3; i++) inkLine(P([[-1.9 + i * .9, -2.45], [-1.65 + i * .9, -1.9]]), sw * .9, CAT.dk, 'ink', .4);
    head = [1.9, -2.55];
  } else if (pose === 'sit') {
    const sway = Math.sin(tw * 1.6) * .25;
    tail([[-1.9, -.4], [-3, -.3], [-3.6 + sway * .4, -.9], [-3.4 + sway, -1.8]]);
    leg(.4, true); leg(1.2, false);
    rs('body'); paint(P([[-2.3, 0], [-2.6, -1.5], [-1.9, -2.9], [-.4, -4.1], [1.1, -4.4], [1.9, -3.6], [1.7, -1.4], [1.3, 0]]), { ...fur, curv: .5 });
    paint(P([[.6, -3.9], [1.6, -3.5], [1.5, -1.6], [.8, -1.2], [.4, -2.6]]), { wash: CAT.lt, ink: null, curv: .5 });
    for (let i = 0; i < 3; i++) inkLine(P([[-2 + i * .55, -2.6 + i * .5], [-1.5 + i * .55, -2.1 + i * .5]]), sw * .9, CAT.dk, 'ink', .4);
    head = [1.15, -5.15];
  } else {
    const leap = pose === 'leap', walk = pose === 'walk';
    const swish = Math.sin(tw * 2.2) * .35;
    tail(leap ? [[-2.9, -3.3], [-4.2, -3.6], [-5.3, -3.9]] : [[-2.9, -3.5], [-3.9, -4.4], [-4.3 + swish * .5, -5.7], [-3.8 + swish, -6.8]]);
    const lift = i => walk ? Math.max(0, Math.sin((ph + [0, .5, .5, 0][i]) * TAU)) * .7 : 0;
    const sx = i => walk ? Math.cos((ph + [0, .5, .5, 0][i]) * TAU) * .35 : 0;
    if (leap) { leg(-2.3, true, 0, 2.2, .9); leg(1.6, true, 0, 2.2, -.9); }
    else { leg(-1.7 + sx(1), true, lift(1)); leg(1.8 + sx(3), true, lift(3)); }
    rs('body'); paint(rrPts((leap ? -3.4 : -3.1) * s, -4.4 * s, (leap ? 6.2 : 5.5) * s, 2.5 * s, 1.05 * s), fur);
    paint(P([[.9, -2.1], [2.3, -2.3], [2.2, -3.4], [1.2, -3.2]]), { wash: CAT.lt, ink: null, curv: .5 });
    for (let i = 0; i < 3; i++) inkLine(P([[-2.2 + i * .9, -4.35], [-1.95 + i * .9, -3.75]]), sw * .9, CAT.dk, 'ink', .4);
    if (leap) { leg(-2.7, false, 0, 2.2, 1.0); leg(2.0, false, 0, 2.2, -1.0); }
    else { leg(-2.6 + sx(0), false, lift(0)); leg(1.0 + sx(2), false, lift(2)); }
    head = [2.55, -4.85];
  }
  // the head, turned to us
  rs('head');
  const [hx, hy] = head, lk = clamp(o.look || 0, -1, 1) * (o.flip ? -1 : 1), tilt = o.headTilt || 0;
  push(); translate((hx + lk * .25) * s, hy * s); rotate(tilt);
  for (const e of [-1, 1]) {
    paint(P([[e * .55, -.95], [e * 1.25, -2.15], [e * 1.45, -.75]]), { wash: CAT.col, ink: PAL.ink, sw: sw * .85 });
    paint(P([[e * .8, -1.0], [e * 1.2, -1.75], [e * 1.3, -.95]]), { wash: CAT.ear, ink: null });
  }
  paint(rrPts(-1.55 * s, -1.35 * s, 3.1 * s, 2.55 * s, 1.05 * s), fur);
  paint(ellPts(0, .45 * s, 1.05 * s, .62 * s, 14), { wash: CAT.lt, ink: null });
  for (const k of [-.32, 0, .32]) inkLine(P([[k, -1.34], [k * .9, -1.08]]), sw * .75, CAT.dk, 'ink', 0);
  const ex = lk * .22, eyes = o.eyes || 'open';
  for (const e of [-1, 1]) {
    const cx = (e * .62 + ex) * s, cy = -.25 * s;
    if (eyes === 'closed') inkLine([[cx - .32 * s, cy], [cx, cy + .2 * s], [cx + .32 * s, cy]], sw * 1.1, PAL.ink, 'ink', .5);
    else {
      const big = eyes === 'wide' ? 1.25 : 1;
      paint(ellPts(cx, cy, .26 * s * big, .36 * s * big, 10), { wash: PAL.ink, ink: null });
      paint(ellPts(cx - .08 * s, cy - .14 * s, .09 * s, .11 * s, 6), { wash: PAL.cream, ink: null });
    }
  }
  if (o.mouth === 'yawn') {
    paint(ellPts(ex * s, .55 * s, .45 * s, .55 * s, 12), { wash: '#4A1F2A', ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(ex * s, .82 * s, .26 * s, .16 * s, 8), { wash: PAL.rose, ink: null });
  } else {
    paint(P([[ex - .17, .12], [ex + .17, .12], [ex, .3]]), { wash: CAT.nose, ink: PAL.ink, sw: sw * .45 });
    inkLine(P([[ex - .38, .55], [ex - .19, .66], [ex, .45], [ex + .19, .66], [ex + .38, .55]]), sw * .6, PAL.ink, 'ink', .5);
    if (o.mouth === 'mew') paint(ellPts(ex * s, .72 * s, .16 * s, .14 * s, 8), { wash: '#4A1F2A', ink: null });
  }
  for (const e of [-1, 1]) for (const k of [-.12, .14]) inkLine(P([[e * .75 + ex, .38 + k], [e * 1.95 + ex, .25 + k * 2.2]]), sw * .4, PAL.ink, 'inkfine', 0);
  pop();
  pop();
}

// ---------- sparrows ----------
// A round little sparrow perched with its feet at (x, y). hop (s units up), peck 0..1 (head dips), beak 0..1 (open),
// chirp 0..1 (little sound strokes by the beak, never letters).
const SPARROW = { col: '#B08A66', dk: '#8A6646', cap: '#7A5A40', head: '#A07B5A', lt: '#F1E6D2', bib: '#4A3A34' };
function sparrow(x, y, s, o = {}) {
  boilSeed('sparrow ' + (o.key ?? 0));
  const sw = clamp(s / 14, .4, 1.1);
  push(); translate(x, y - (o.hop || 0) * s); scale((o.flip ? -1 : 1) * (1 + (o.sq || 0) * .4), 1 - (o.sq || 0));
  const P = pts => pts.map(([a, b]) => [a * s, b * s]);
  if (!o.flying) for (const fx of [-.05, .3]) inkLine(P([[fx, -.35], [fx + .06, 0], [fx + .25, .04]]), sw * .7, PAL.ink, 'inkfine', 0);
  paint(P([[-.75, -1.05], [-2, -.35], [-1.85, -.05], [-.6, -.65]]), { wash: SPARROW.dk, ink: PAL.ink, sw: sw * .7 });
  paint(ellPts(0, -1, 1.12 * s, .86 * s, 16), { wash: SPARROW.col, ink: PAL.ink, sw });
  paint(ellPts(.3 * s, -.72 * s, .72 * s, .46 * s, 12), { wash: SPARROW.lt, ink: null });
  const flap = o.flying ? Math.sin(T * 40) : 0;
  paint(ellPts(-.25 * s, (-1.08 - .5 * flap) * s, .78 * s, (.42 + .3 * Math.abs(flap)) * s, 12, 0, -.25), { wash: SPARROW.dk, fill: SPARROW.cap, fillOp: 60, ink: PAL.ink, sw: sw * .7 });
  const pk = o.peck || 0;
  push(); translate(.72 * s, -1.6 * s); rotate(.7 * pk + (o.sleep ? .35 : 0)); translate(0, -.12 * s);
  paint(ellPts(0, 0, .6 * s, .58 * s, 14), { wash: SPARROW.head, ink: PAL.ink, sw });
  paint(ellPts(-.08 * s, -.3 * s, .5 * s, .26 * s, 10), { wash: SPARROW.cap, ink: null });
  paint(ellPts(.12 * s, .16 * s, .38 * s, .24 * s, 10), { wash: SPARROW.lt, ink: null });
  paint(ellPts(.3 * s, .44 * s, .2 * s, .14 * s, 8), { wash: SPARROW.bib, ink: null });
  if (o.sleep) inkLine(P([[.1, -.06], [.22, .02], [.34, -.06]]), sw * .7, PAL.ink, 'inkfine', .5);   // opt-in (stage 5): asleep
  else paint(ellPts(.22 * s, -.08 * s, .11 * s, .12 * s, 6), { wash: PAL.ink, ink: null });
  const bk = (o.beak || 0) * .22;
  paint(P([[.5, -.1 - bk], [.98, .02 - bk * .4], [.52, .1]]), { wash: '#E8B04A', ink: PAL.ink, sw: sw * .5 });
  if (bk > .02) paint(P([[.5, .1], [.9, .2 + bk], [.5, .2]]), { wash: '#D59A35', ink: PAL.ink, sw: sw * .5 });
  if (o.chirp > .05) for (let i = 0; i < 2; i++) inkLine(P([[1.25 + i * .32, -.55 - i * .1], [1.45 + i * .32, -.3 - i * .1], [1.35 + i * .32, -.05 - i * .1]]), sw * .6 * o.chirp, PAL.ink, 'inkfine', .6);
  pop();
  pop();
}

// ---------- the 七里香 cutting ----------
// A young orange-jasmine cutting tied to a bamboo stake, at the foot of the fence. g = growth (stage 1 is ~0),
// sway = wind lean, bounce = seconds since a leaf was touched (it springs).
function cutting(x, y, s, o = {}) {
  boilSeed('cutting');
  const g = o.g || 0, h = (3.4 + 2.6 * g) * s, sway = (o.sway || 0) + .04 * Math.sin(T * 1.3);
  inkLine([[x + .5 * s, y], [x + .55 * s, y - h * 1.15]], 1.6, '#B89660', 'ink', 0);                       // stake
  inkLine([[x + .5 * s, y - h * .75], [x + .1 * s, y - h * .72]], .9, '#C8B48A', 'inkfine', 0);              // tie
  const stem = [[x, y], [x - .1 * s + sway * h * .2, y - h * .45], [x + sway * h * .45, y - h]];
  inkLine(stem, 1.4, '#6B5A44', 'ink', .6);
  const leaves = 7 + Math.round(6 * g), bounce = o.bounce != null && o.bounce >= 0 ? Math.exp(-o.bounce * 5) * Math.sin(o.bounce * 26) : 0;
  const bases = [];   // each leaf's base and side, for the opt-in buds below
  for (let i = 0; i < leaves; i++) {
    boilSeed('leaf ' + i);
    const k = .25 + .75 * i / (leaves - 1), side = i % 2 ? 1 : -1, bx = lerp(stem[0][0], stem[2][0], k) + sway * h * .3 * k, by = y - h * k;
    const a = side * (.9 - .4 * k) - Math.PI / 2 + (i === leaves - 1 ? 0 : .15 * side) + bounce * .35 * (i > leaves - 4 ? 1 : .3);
    const L = (1 + .4 * hash(i * 7)) * s * .9, ca = Math.cos(a), sa = Math.sin(a), pr = [-sa, ca];
    const pts = [[0, 0], [.5, .32], [1, 0], [.5, -.32]].map(([p, q]) => [bx + (ca * p + pr[0] * q) * L, by + (sa * p + pr[1] * q) * L]);
    paint(pts, { wash: '#4E8A4C', fill: '#2F6B3C', fillOp: 70, bleed: .05, tex: .5, ink: PAL.ink, sw: .55, curv: .6 });
    bases.push([bx, by, side]);
  }
  if (o.bud > .01) {   // opt-in (later stages): the first bud at the tip, a tiny white flower bud popping out, with a twinkle
    boilSeed('bud');
    const [bx, by] = stem[2], b = backOut(clamp(o.bud)), r = 8 * b * s / 25;
    paint(ellPts(bx + 1, by - 6 * b * s / 25, r * .85, r * 1.35, 10), { wash: '#FFFBEF', fill: '#EFE2BE', fillOp: 70, ink: PAL.ink, sw: .5 });
    paint([[bx - 4 * b, by], [bx + 1, by - 5 * b], [bx + 6 * b, by]], { wash: '#6E9F58', ink: PAL.ink, sw: .45 });
    const age = o.budAge ?? 9;
    if (age < 1.4) for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + .4, k = seg(age, 0, 1.4); paint(starPts(bx + Math.cos(a) * (10 + 22 * k), by - 8 + Math.sin(a) * (10 + 22 * k), 7 * (1 - k), .3, 4), { wash: PAL.cream, ink: null }); }
  }
  // opt-in (stage 3 on): buds = [size 0..1, ...], each on a little shoot from the base of a leaf, from the top down
  if (o.buds) o.buds.forEach((b, j) => {
    const L0 = bases[leaves - 2 - j]; if (!L0 || b <= .01) return;
    boilSeed('bud ' + j);
    const [lx, ly, side] = L0, q = backOut(clamp(b)), grow = Math.min(1, q * 1.4), ang = -Math.PI / 2 + side * (.5 + .25 * hash(j * 3.7));
    const ln = (11 + 5 * hash(j * 2.3)) * s / 25 * grow, ex = lx + Math.cos(ang) * ln, ey = ly + Math.sin(ang) * ln;
    inkLine([[lx, ly], [ex, ey]], .8, '#6B5A44', 'inkfine', 0);
    const bl = Array.isArray(o.bloom) ? o.bloom[j] || 0 : o.bloom || 0;   // opt-in (stage 4 on): the buds open into flowers
    if (bl > .01) jasmineCluster(ex, ey, ang, 9 * q * s / 25, bl, j);
    else budAt(ex, ey, ang, 6.4 * q * s / 25);
  });
}
// A closed 七里香 flower bud on the end of a shoot at (x, y), pointing along ang (radians), r ≈ its half-width.
function budAt(x, y, ang, r) {
  if (r < .5) return;
  push(); translate(x, y); rotate(ang + Math.PI / 2);
  paint(ellPts(0, -r * .95, r * .78, r * 1.3, 10), { wash: '#FFFBEF', fill: '#EFE2BE', fillOp: 70, ink: PAL.ink, sw: .45 });
  paint([[-r * .62, 0], [0, -r * .75], [r * .62, 0], [0, r * .3]], { wash: '#6E9F58', ink: PAL.ink, sw: .4 });
  pop();
}

// ---------- stage 3: the lamps and the watering can ----------
// A little hanging lamp, cord from the ceiling at (px, py), length L, swinging by angle a. Nobody pulls a cord: a hop
// that bonks the lamp from below switches it, so lift (px) pushes it up and the cord goes slack. on 0..1 lights the bulb
// (the room light and glow are the scene's job). Returns the bulb's centre and the lamp's lowest point.
function pendant(px, py, L, a, lift, on, o = {}) {
  boilSeed('pendant ' + (o.key ?? 0));
  const d = Math.max(4, L - lift), bx = px + Math.sin(a) * d, by = py + Math.cos(a) * d, shade = o.shade || '#F4E3C4';
  inkLine([[px, py], [lerp(px, bx, .5) + lift * .45, lerp(py, by, .5)], [bx, by]], .7, PAL.ink, 'inkfine', .5);
  push(); translate(bx, by); rotate(-a);
  paint(ellPts(0, 16, 7.5, 7, 12), { wash: on > .5 ? '#FFF4C8' : mixCol('#A9A3BC', shade, .15), ink: PAL.ink, sw: .5 });
  paint([[-18, 12], [-10, 0], [10, 0], [18, 12]], { wash: shade, fill: mixCol(shade, PAL.ink, .25), fillOp: 60, ink: PAL.ink, sw: .7 });
  paint(rectPts(-3.5, -3, 7, 4), { wash: mixCol(shade, PAL.ink, .45), ink: null });
  pop();
  const at = r => [bx + Math.sin(a) * r, by + Math.cos(a) * r];
  return { bulb: at(16), low: at(23) };
}
// A watering can standing on its bottom centre (x, y), tilted by rot: it rides on a flat top and tips with it, spout
// to the left. s ≈ half its body width. Returns the spout's tip and which way the water leaves it (unit vector).
const CAN = { col: '#86BFCB', dk: '#558E9E', lt: '#D4ECF0' };
function wateringCan(x, y, s, rot = 0, o = {}) {
  boilSeed('can ' + (o.key ?? 0));
  push(); translate(x, y); rotate(rot); if (o.sq) scale(1 + o.sq * .5, 1 - o.sq);
  const P = pts => pts.map(([a, b]) => [a * s, b * s]);
  inkLine(P([[-.5, -1.45], [-.15, -2.15], [.55, -2.15], [.85, -1.45]]), 2.2, CAN.dk, 'ink', .6);                               // handle
  paint(P([[-.85, -.42], [-2.15, -1.5], [-2.0, -1.68], [-.8, -.95]]), { wash: CAN.dk, ink: PAL.ink, sw: .7 });                   // spout
  paint(P([[-2.45, -1.85], [-2.0, -1.38], [-1.86, -1.9], [-2.28, -2.12]]), { wash: CAN.col, ink: PAL.ink, sw: .6 });             // rose
  paint(rrPts(-1 * s, -1.5 * s, 2 * s, 1.5 * s, .22 * s), { wash: CAN.col, fill: CAN.dk, fillOp: 55, bleed: .06, tex: .5, ink: PAL.ink, sw: .8 });
  paint(rectPts(-.75 * s, -1.28 * s, .42 * s, .9 * s, .2), { wash: CAN.lt, washOp: 150, ink: null });                           // shine
  pop();
  const c = Math.cos(rot), si = Math.sin(rot), tx = -2.2 * s, ty = -1.75 * s, dx = -.72, dy = -.69;
  return { x: x + tx * c - ty * si, y: y + tx * si + ty * c, dir: [dx * c - dy * si, dx * si + dy * c] };
}

// ---------- wind ----------
// Leaves and dry-brush streaks blowing from right to left across the frame between t0 and t0 + dur (world space).
function gust(t, t0, dur, y0, y1, x0 = 2300, x1 = -400, n = 9) {
  const a = t - t0; if (a < 0 || a > dur + 1.2) return;
  for (let i = 0; i < n; i++) {
    boilSeed('gust ' + i);
    const k = (a - i * dur / n * .8) / 1.15; if (k < 0 || k > 1) continue;
    const x = lerp(x0, x1, k), y = lerp(y0, y1, hash(i * 3)) + Math.sin(k * 9 + i) * 26 - 60 * k * (hash(i) - .3), r = k * 14 + i;
    if (i % 3 === 0) inkLine([[x + 40, y], [x + 140, y - 6], [x + 260, y - 2]], 1.4, mixCol(PAL.paper, PAL.ink, .25), 'dry', .4);
    push(); translate(x, y); rotate(r);
    paint([[0, 0], [9, 5], [18, 0], [9, -5]], { wash: i % 2 ? '#7FAE5E' : '#B7C46A', ink: PAL.ink, sw: .5, curv: .6 });
    pop();
  }
}

// ---------- stage 2: the porch, the fan and its breeze ----------
// A low wooden porch along a house front: its top boards at y, the front face below (h px).
function deck(x0, x1, y, o = {}) {
  boilSeed('deck ' + x0);
  const h = o.h || 30, col = o.col || '#B98A5E', dk = mixCol(col, PAL.ink, .32);
  paint(rectPts(x0, y + 4, x1 - x0, h, .6), { wash: col, fill: dk, fillOp: 70, bleed: .05, tex: .6, ink: PAL.ink, sw: .9 });
  paint(rectPts(x0 - 6, y - 8, x1 - x0 + 12, 13, .5), { wash: mixCol(col, '#FFF2DC', .18), ink: PAL.ink, sw: .8 });
  for (let i = 1; i < 3; i++) inkLine([[x0 + 4, y + 4 + i * h / 3], [x1 - 4, y + 4 + i * h / 3]], .5, dk, 'inkfine', 0);
  for (let px = x0 + 48; px < x1 - 20; px += 140) inkLine([[px, y + 5], [px, y + 3 + h]], .5, dk, 'inkfine', 0);
}
// An electric desk fan standing on (x, y). a = where its head points: 1 = facing left (along the porch), 0 = at us,
// -1 = facing right. The head steps through drawn views (side, 3/4, front) like a turn, never a projected rotation.
// Returns where the breeze leaves it.
const FAN = { body: '#8DC8B5', dk: '#5D998A', cream: '#F4EBD6' };
function fan(x, y, s, a, t) {
  boilSeed('fan');
  paint(rrPts(x - 2.3 * s, y - .75 * s, 4.6 * s, .75 * s, .3 * s), { wash: FAN.body, fill: FAN.dk, fillOp: 60, ink: PAL.ink, sw: .9 });
  paint(rectPts(x - .28 * s, y - 3.7 * s, .56 * s, 3.0 * s, .3), { wash: FAN.dk, ink: PAL.ink, sw: .8 });
  const v = Math.abs(a) > .68 ? 'side' : Math.abs(a) > .28 ? 'q' : 'front', dir = a > 0 ? -1 : 1;
  const hy = y - 4.7 * s, R = 2.15 * s, rx = v === 'front' ? R : v === 'q' ? R * .6 : R * .25;
  const cx = x + (v === 'front' ? 0 : dir * (v === 'q' ? .4 : .75) * s);
  if (v !== 'front') paint(ellPts(x - dir * .7 * s, hy, 1.15 * s, .95 * s, 14), { wash: FAN.body, fill: FAN.dk, fillOp: 70, ink: PAL.ink, sw: .9 });
  paint(ellPts(cx, hy, rx * .94, R * .94, 22), { wash: mixCol(FAN.cream, '#C9DDE6', .35), washOp: 170, ink: null });
  for (let k = 0; k < 3; k++) { const b = t * 31 + k * TAU / 3; inkLine([[cx, hy], [cx + Math.cos(b) * rx * .78, hy + Math.sin(b) * R * .78]], 2.6, mixCol(FAN.dk, FAN.cream, .45), 'dry', .2); }
  paint(ellPts(cx, hy, rx, R, 26), { ink: PAL.ink, sw: .95 });
  for (let k = 0; k < 8; k++) { const b = k * TAU / 8; inkLine([[cx + Math.cos(b) * rx * .3, hy + Math.sin(b) * R * .3], [cx + Math.cos(b) * rx, hy + Math.sin(b) * R]], .45, PAL.ink, 'inkfine', 0); }
  paint(ellPts(cx, hy, rx * .28, R * .28, 12), { wash: FAN.body, ink: PAL.ink, sw: .7 });
  return { x: cx, y: hy, dir, R };
}
// The breeze: soft cream streaks and curls flowing from (x, y) toward dir (-1 left), reach L px. str(age) = how hard
// the fan was blowing this way when that puff left it (0..1), so the breeze sweeps across the scene with the head.
function breeze(x, y, dir, L, t, str, o = {}) {
  const n = o.n || 7, col = o.col || '#FFF6E6';
  for (let i = 0; i < n; i++) {
    const ph = frac(t * (o.rate || .9) + i / n), k = str(ph * L / (o.speed || 520));
    if (k < .05) continue;
    boilSeed('breeze ' + i);
    // a cartoon wind line: a long thin wave ending in a little curl, in a line colour that reads on the warm walls
    const bx = x + dir * ph * L, by = y + (hash(i * 3.3) - .5) * 100 * (.3 + ph) + 8 * Math.sin(t * 5 + i), len = (90 + 60 * hash(i)) * (.4 + .6 * k);
    const P = []; for (let j = 0; j <= 6; j++) P.push([bx + dir * len * j / 6, by + 5 * Math.sin(j * 1.4 + t * 6 + i)]);
    const end = P[P.length - 1], cdir = i % 2 ? 1 : -1;
    for (let j = 1; j <= 8; j++) { const a = j * .78, r = 11 * (1 - j / 10); P.push([end[0] + dir * Math.sin(a) * r, end[1] + cdir * (r - Math.cos(a) * r)]); }
    inkLine(P, .9 * k, col, 'inkfine', .6);
  }
}

// ---------- stage 4 on: 七里香 in flower, the sprig, his travel things ----------
// One small 七里香 flower at (x, y), radius r: five rounded white petals round a pale yellow heart. open 0..1 unfurls
// it from a closed cream bud; rot turns it.
function jasmine(x, y, r, open = 1, rot = 0) {
  if (r < .4 || open <= .01) return;
  push(); translate(x, y); rotate(rot);
  if (open < .3) paint(ellPts(0, 0, r * .42 * (.8 + open), r * .62 * (.8 + open), 10), { wash: '#FFFBEF', fill: '#EFE2BE', fillOp: 70, ink: PAL.ink, sw: .4 });
  else {
    const k = backOut(seg(open, .3, 1));
    for (let i = 0; i < 5; i++) {
      push(); rotate(i * TAU / 5);
      paint(ellPts(0, -r * .55 * k, r * .36 * (.6 + .4 * k), r * .52 * k, 10), { wash: '#FFFDF6', fill: '#EDE3CC', fillOp: 45, ink: PAL.ink, sw: .35 });
      pop();
    }
    paint(ellPts(0, 0, r * .19, r * .19, 8), { wash: '#F2D672', ink: null });
  }
  pop();
}
// A little cluster of three flowers on the end of a shoot at (x, y) pointing along ang; they open one after another.
function jasmineCluster(x, y, ang, r, open, seed = 0) {
  boilSeed('cluster ' + seed);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  [[.9, 0, 0], [.05, 1.0, .15], [.15, -.95, .3]].forEach(([p, q, d], i) => {
    const k = clamp((open - d) / (1 - d + 1e-6) * 1.15);
    jasmine(x + (ca * p - sa * q) * r, y + (sa * p + ca * q) * r, r, k, ang + i * .7 + seed);
  });
}
// The sprig the breeze gives her: three flowers and two leaves, worn beside her hair flower (a heroine draw hook, in
// body space: her top is y = -8u). k 0..1 is how settled it is (it lands with a little bounce).
function sprigHook(k = 1) {
  return (u, sw) => {
    boilSeed('sprig');
    const x = 1.3 * u, y = -8.25 * u, b = 1 - .25 * Math.exp(-6 * k) * Math.cos(14 * k);
    for (const s of [-1, 1]) paint([[x + s * .3 * u, y + .1 * u], [x + s * 1.15 * u, y - .3 * u], [x + s * 1.8 * u, y - .1 * u], [x + s * 1.1 * u, y + .35 * u]], { wash: '#4E8A4C', fill: '#2F6B3C', fillOp: 60, ink: PAL.ink, sw: sw * .4, curv: .5 });
    jasmine(x - .55 * u, y - .55 * u * b, .62 * u, 1, .3);
    jasmine(x + .6 * u, y - .5 * u * b, .58 * u, 1, -.4);
    jasmine(x + .02 * u, y - 1.05 * u * b, .66 * u, 1, .1);
  };
}
// His travel things, as a clawd() draw hook (body space; the top is y = -8u): a small canvas bag lying on the back of
// his flat top, and a flat cap on the front of it with its brim the way he faces. tilt = the bag's lag as he moves.
const TRAVEL = { bag: '#6BA7AE', bagDk: '#447F88', band: '#F2E2BE', strap: '#8A5A3A', cap: '#D9A441', capDk: '#A8772A' };
function travelHook(tilt = 0) {
  return (u, sw) => {
    const P = pts => pts.map(([a, b]) => [a * u, b * u]);
    boilSeed('travel bag');
    push(); translate(-2.4 * u, -8 * u); rotate(tilt);
    paint(rrPts(-2.4 * u, -2.6 * u, 4.8 * u, 2.6 * u, .95 * u), { wash: TRAVEL.bag, fill: TRAVEL.bagDk, fillOp: 60, bleed: .08, tex: .5, ink: PAL.ink, sw: sw * .8 });
    paint(rectPts(-.45 * u, -2.58 * u, .9 * u, 2.56 * u, .02 * u), { wash: TRAVEL.band, ink: PAL.ink, sw: sw * .45 });
    inkLine(P([[-1.5, -2.5], [-1.15, -3.45], [1.15, -3.45], [1.5, -2.5]]), sw * 1.5, TRAVEL.strap, 'ink', .6);
    pop();
    boilSeed('travel cap');
    paint(P([[.3, -8], [.55, -9.2], [2.2, -9.7], [3.85, -9.2], [4.3, -8]]), { wash: TRAVEL.cap, fill: TRAVEL.capDk, fillOp: 50, ink: PAL.ink, sw: sw * .8, curv: .4 });
    paint(P([[3.5, -8.3], [5.6, -8.15], [5.45, -7.75], [3.5, -7.9]]), { wash: TRAVEL.capDk, ink: PAL.ink, sw: sw * .7, curv: .3 });
    paint(ellPts(2.2 * u, -9.68 * u, .32 * u, .2 * u, 8), { wash: TRAVEL.capDk, ink: null });
  };
}
// A point given in clawd()'s body space (lx, ly in u), in world space for the pose o (with its offsets, rotation,
// squash and flip), so things can ride on a part of the body: bodyPt(x, y, u, o, -2.4, -10.6) is the top of the bag.
function bodyPt(x, y, u, o, lx, ly) {
  const sq = (o.sq || 0) + (o.take || 0), sm = clamp(o.smear || 0), r = o.rot || 0;
  const px = lx * u * (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6) * (1 + sm * .35), py = ly * u * (o.sy ?? 1) * (1 - sq);
  return [x + (o.dx || 0) * u + px * Math.cos(r) - py * Math.sin(r), y + (o.dy || 0) * u + px * Math.sin(r) + py * Math.cos(r)];
}
