// weather.js: stage 2's weather and its transitions, painted like everything else. Rain falls in screen space (an
// overlay that never needs to know the camera), splashes and puddles sit on the world's ground, lightning is light.
// Every function draws one frame from t; nothing is carried between frames.

// Rain streaks across the screen: n streaks of len px falling at speed px/s, slanting slant px per px of fall (wind from
// the right is negative). skip(x, y) → true leaves a streak out (the sheltered space under the two of them).
function rainScreen(t, o = {}) {
  const { n = 70, len = 44, speed = 1500, slant = -.3, col = '#A9BADD', w = .8, seed = 0, skip = null, alpha = 1 } = o;
  const H2 = H + len + 60, W2 = W + 500;
  for (let i = 0; i < n; i++) {
    const hv = .8 + .4 * hash(i * 5.1 + seed), fall = (hash(i * 7.7 + seed + 1) * H2 + t * speed * hv) % H2;
    const y = fall - len - 30, x = ((hash(i * 3.1 + seed) * W2 + fall * slant) % W2 + W2) % W2 - 250;
    if (skip && skip(x + slant * len, y + len)) continue;
    boilSeed('rain ' + seed + ' ' + i);
    inkLine([[x, y], [x + slant * len, y + len]], w * alpha, col, 'inkfine', 0);
  }
}
// Little crowns where drops hit the ground (world space): n of them along the ground band y0..y1 between x0 and x1.
function splashes(t, x0, x1, y0, y1, o = {}) {
  const n = o.n || 26, rate = o.rate || 2.2, col = o.col || '#B9C8E6';
  for (let i = 0; i < n; i++) {
    const cyc = t * rate + hash(i * 1.7), c = Math.floor(cyc), ph = cyc - c;
    if (ph > .3) continue;
    boilSeed('splash ' + i);
    const k = ph / .3, x = lerp(x0, x1, hash(i * 13 + c * 7.3)), y = lerp(y0, y1, hash(i * 5 + c * 3.1)), r = (6 + 8 * k) * (o.scale || 1);
    for (const s of [-1, 1]) inkLine([[x + s * r * .3, y], [x + s * r, y - r * (1 - k) * .9]], .7 * (1 - k * .6), col, 'inkfine', .3);
    if (k > .3) paint(ellPts(x, y + 2, r * 1.1, r * .3, 10), { ink: col, sw: .5 * (1 - k) });
  }
}
// Puddles on the wet ground, each catching a little warm window light.
function puddles(list, o = {}) {
  list.forEach(([x, y, w], i) => {
    boilSeed('puddle ' + i);
    paint(ellPts(x, y, w, w * .16, 18, 1.5), { wash: o.col || '#3A4066', fill: '#5A6696', fillOp: 70, bleed: .1, tex: .4, ink: mixCol(PAL.ink, '#5A6696', .4), sw: .5 });
    if (o.light) glow(x + w * .2, y, w * .7, '#FFC766', .35 * o.light);
  });
}
// Heavy storm clouds rolling across the top of the sky (world space). k = how far they have rolled in (0..1).
function stormClouds(t, k, o = {}) {
  const col = o.col || '#2B3260', lt = o.lt || '#4A5384';
  for (let i = 0; i < 7; i++) {
    boilSeed('storm cloud ' + i);
    const x = -500 + i * 470 + 120 * hash(i) - t * 14 + (1 - k) * 1600, y = -300 + 260 * hash(i * 3 + 1) + 70 * (1 - k), w = 330 + 160 * hash(i * 7);
    const pts = []; for (let j = 0; j < 28; j++) { const a = j / 28 * TAU, up = Math.sin(a) < 0, b = up ? 1 + .32 * Math.abs(Math.sin(a * 3 + i)) : 1; pts.push([x + Math.cos(a) * w * b, y + Math.sin(a) * (up ? .48 : .24) * w * b]); }
    paint(pts, { wash: col, washOp: 230 * clamp(k * 1.4), fill: lt, fillOp: 70, bleed: .2, tex: .5, ink: null, curv: .5 });
  }
}
// A lightning bolt: a jagged ribbon from (x, y) down h px, flickering out over its life (0..1).
function bolt(x, y, h, life, seed = 0) {
  if (life <= 0 || life >= 1) return;
  boilSeed('bolt ' + seed);
  const P = [[x, y]]; let cx = x;
  for (let i = 1; i <= 7; i++) { cx += (hash(i * 9 + seed) - .5) * 120; P.push([cx, y + h * i / 7]); }
  const a = 1 - life;
  glow(x, y + h * .4, 420, '#DDE6FF', .9 * a);
  paint(ribbon(P, 9 * a, 3 * a), { wash: '#F8FBFF', ink: null });
}
// How bright the lightning is at t: each strike flashes and flickers once. strikes = [t0, ...].
function flashAt(t, strikes) {
  let k = 0;
  for (const f of strikes) { if (t < f) continue; const a = t - f; k = Math.max(k, Math.exp(-a * 11) + .55 * Math.exp(-Math.max(0, a - .14) * 13) * (a > .14 ? 1 : 0)); }
  return clamp(k);
}
// A transition: rain-dark bands pour down over the frame (p 0 → .5) and then drain away (p .5 → 1). Cut at p = .5.
function rainWipe(p, cols = ['#232B52', '#34407A']) {
  if (p <= 0 || p >= 1) return;
  const [c1, c2] = cols, n = 9;
  push(); translate(W / 2, H / 2); rotate(.3); translate(-W / 2, -H / 2);
  const span = W + 1000, bw = span / n + 36;
  for (let i = 0; i < n; i++) {
    const x0 = -500 + i * span / n, d = [0, .12, .05, .2, .08, .15, .02, .18, .1][i];
    const q = p < .5 ? easeIn(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const ya = p < .5 ? -700 : lerp(-700, H + 700, q), yb = p < .5 ? lerp(-700, H + 700, q) : H + 700;
    if (yb - ya < 30) continue;
    const pts = [[x0, ya], [x0 + bw, ya]];   // top edge, then the ragged leading edge from right to left
    for (let k = 6; k >= 0; k--) pts.push([x0 + bw * k / 6, yb + (p < .5 ? 40 * hash(i * 7 + k) + jit(6) : 0)]);
    paint(pts, { wash: i % 2 ? c1 : c2, washOp: 255, fill: i % 2 ? c2 : c1, fillOp: 60, bleed: .05, tex: .8, ink: null,
      hatch: { d: 34, a: Math.PI / 2, o: { rand: .5 }, b: 'HB', c: '#8D9FCC', w: .6 } });
  }
  pop();
}
// Heat shimmer: faint wavy threads rising off hot ground (world space).
function shimmer(t, x0, x1, y, k) {
  if (k <= .02) return;
  for (let i = 0; i < 7; i++) {
    boilSeed('shimmer ' + i);
    const ph = frac(t * .35 + hash(i)), x = lerp(x0, x1, hash(i * 9.1)), yy = y - ph * 160, P = [];
    for (let j = 0; j < 6; j++) P.push([x + 9 * Math.sin(t * 3 + j * 1.3 + i), yy - j * 14]);
    inkLine(P, .8 * k * Math.sin(ph * Math.PI), '#FFF3DE', 'inkfine', .6);
  }
}
// Water: drops running off the bottom of a soaked body and rain splashing off its top, in clawd()'s body space.
function soakedHook(t, k, seed = 0) {
  return (u, sw) => {
    if (k <= .02) return;
    for (let i = 0; i < 3; i++) {
      boilSeed('drip ' + seed + ' ' + i);
      const ph = frac(t * 1.6 + i / 3 + seed * .37), x = (-3.6 + i * 3.3 + .4 * hash(i + seed)) * u, y = (-2 + ph * 2.6) * u;
      paint(ellPts(x, y, .18 * u, .26 * u, 8), { wash: '#BFD2F0', ink: PAL.ink, sw: sw * .35 });
    }
    for (let i = 0; i < 4; i++) {   // splash crowns on the top edge
      const cyc = t * 3 + hash(i * 2.3 + seed), ph = frac(cyc); if (ph > .35) continue;
      boilSeed('crown ' + seed + ' ' + i);
      const x = (-4 + 8 * hash(i * 7 + Math.floor(cyc) * 3.3 + seed)) * u, r = (.35 + ph * 1.2) * u;
      for (const s of [-1, 1]) inkLine([[x + s * r * .3, -8 * u], [x + s * r, (-8 - .9 * (1 - ph / .35)) * u]], sw * .5, '#CFDDF5', 'inkfine', .3);
    }
  };
}

// ---------- stage 3: clear nights and the turning season ----------
// Stars (world space): n twinkling points spread over the box x0..x1, y0..y1, faded in by k.
function starField(t, k, o = {}) {
  if (k <= .02) return;
  const { n = 46, x0 = -600, x1 = 2600, y0 = -700, y1 = 380 } = o;
  for (let i = 0; i < n; i++) {
    boilSeed('star ' + i);
    const x = lerp(x0, x1, hash(i * 7.31)), y = lerp(y0, y1, Math.pow(hash(i * 3.17 + 5), 1.3)), tw = .65 + .35 * Math.sin(t * (1.5 + 2 * hash(i)) + i);
    const r = (2.2 + 3.2 * hash(i * 1.9)) * tw;
    if (i % 4 === 0) paint(starPts(x, y, r * 2.1, .3, 4), { wash: PAL.cream, washOp: 230 * k, ink: null });
    else paint(ellPts(x, y, r * .55, r * .55, 6), { wash: PAL.cream, washOp: 210 * k, ink: null });
  }
}
// The moon: a pale disk with a soft halo, at (x, y), radius r; k fades it in. o.crescent 0..1 bites a shadow out of it.
function moon(x, y, r, k = 1, o = {}) {
  if (k <= .02) return;
  boilSeed('moon');
  glow(x, y, r * 4.5, '#DCE4FF', .55 * k);
  paint(ellPts(x, y, r, r, 24, .6), { wash: '#FFF6DE', washOp: 255 * k, fill: '#E9DDBC', fillOp: 50 * k, ink: mixCol(PAL.ink, '#FFF6DE', .5), sw: .5 });
  if (o.crescent) paint(ellPts(x + r * (1.25 - .6 * o.crescent), y - r * .2, r * .95, r * .95, 24), { wash: o.sky || '#1C2246', washOp: 255 * k, ink: null });
  for (const [dx, dy, rr] of [[-.3, -.2, .2], [.25, .3, .14], [.1, -.45, .1]]) paint(ellPts(x + dx * r, y + dy * r, rr * r, rr * r, 10), { fill: '#D8CBA8', fillOp: 70 * k, bleed: .2, ink: null });
}
// One small leaf, centred at (x, y), turned by rot; col = its colour.
function leafAt(x, y, s, rot, col) {
  push(); translate(x, y); rotate(rot);
  paint([[-s, 0], [-.1 * s, .5 * s], [s, 0], [-.1 * s, -.5 * s]], { wash: col, fill: mixCol(col, PAL.ink, .25), fillOp: 40, ink: PAL.ink, sw: .45, curv: .6 });
  pop();
}
const LEAF_COLS = ['#E8B04A', '#D9823F', '#C9662F', '#E9C25C', '#B98A3E'];
// Leaves falling through the frame (world space), drifting left to right as they fall. k = how thick the fall is (0..1).
function leafFall(t, k, o = {}) {
  if (k <= .02) return;
  const { n = 14, x0 = 0, x1 = 2000, y0 = 300, y1 = 1000, wind = 1, seed = 0 } = o;
  for (let i = 0; i < n; i++) {
    if (hash(i * 4.7 + seed) > k) continue;
    boilSeed('falling leaf ' + seed + ' ' + i);
    const sp = .1 + .07 * hash(i * 2.9 + seed), ph = frac(t * sp + hash(i * 1.3 + seed)), sway = Math.sin(t * (1.4 + hash(i)) + i * 2);
    const x = lerp(x0, x1, hash(i * 9.7 + seed)) + 60 * sway + wind * 120 * ph, y = lerp(y0, y1, ph);
    leafAt(x, y, 7 + 4 * hash(i * 5.3), sway * 1.2 + t * (hash(i) - .5), LEAF_COLS[i % LEAF_COLS.length]);
  }
}
// Fallen leaves lying in the yard (world space): the first n of a fixed scatter, so more lie there as autumn goes on.
function leafLitter(n, o = {}) {
  const { x0 = -300, x1 = 2300, y0 = 912, y1 = 1150, skip = null } = o;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(i * 11.3 + 2)), y = lerp(y0, y1, hash(i * 6.1 + 8));
    if (skip && skip(x, y)) continue;
    boilSeed('litter ' + i);
    leafAt(x, y, 7 + 3 * hash(i * 2.2), (hash(i * 3.3) - .5) * 1.4, LEAF_COLS[(i * 3) % LEAF_COLS.length]);
  }
}

// ---------- stage 4 → 5 ----------
// A petal wipe: a brush wipe in soft colours with white 七里香 petals riding its moving edges (p 0 → .5 covers, .5 → 1
// drags off; cut under full cover at .5). Screen space, like brushWipe.
function petalWipe(p, cols = ['#F4D9D2', '#FBEFE2']) {
  if (p <= 0 || p >= 1) return;
  brushWipe(p, cols);
  const n = 5, bh = (H + 420) / n + 40;
  push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    const d = [0, .14, .06, .18, .1][i], y0 = -230 + i * (H + 420) / n;
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    if (q <= 0 || q >= 1) continue;
    const ex = lerp(-300, W + 400, q);
    for (let j = 0; j < 5; j++) {
      boilSeed('wipe petal ' + i + ' ' + j);
      const px = ex + 60 * hash(i * 5 + j) - 20, py = y0 + bh * (j + .5) / 5 + 16 * Math.sin(p * 16 + j * 1.7);
      if (j % 2) jasmine(px, py, 13 + 6 * hash(i * 3 + j), 1, p * 9 + i + j);
      else { push(); translate(px, py); rotate(p * 11 + i * 1.3 + j); paint(ellPts(0, 0, 7, 11, 10), { wash: '#FFFDF6', fill: '#EDE3CC', fillOp: 45, ink: PAL.ink, sw: .35 }); pop(); }
    }
  }
  pop();
}
