// stage-05-together.js: STAGE 5 of 《隔壁》, song time 215.625–299.000 s (frames 5175–7175): the final chorus and the
// outro. Storyboard: docs/storyboard/stage-05.md. Stage 4 hands over under a full petal wipe.
//   215.6–243.3  The next summer, a light warm rain. The cutting they once sheltered from the storm is a flowering
//                七里香 bush over the fence now, and it shelters them: they sit under it, one on each side. The cat comes
//                through the rain, squeezes through a loose board and settles on HER head; he sulks under a rain cloud
//                of his own. They look at the loose board, at each other, stand and lean on the fence together: on the
//                beat it gives, the panel swings open and they stumble into each other, shoulder to shoulder. The rain
//                stops, and the camera rises into the sky as the evening comes.
//   243.3–270.3  Dusk: the lanterns along both eaves light themselves one by one, from the far ends to the middle, the
//                last one in the bush over the open fence. On his porch the old fan swings between them; the cat hops
//                over onto his head; she leans against him; they turn to each other and their arm tips touch.
//   270.3–299.0  The opening, rhymed: back up past the lanterns to the two sparrows asleep on the wire, into the night
//                sky with petals drifting up, and back to the paper it all came from; one last flower settles on it.
// Every pose is a pure function of song time t. Nothing is gripped: the panel swings on its own hinge, the cat rides on a
// head, the fan swings by itself; arms only pat, wave and touch.
(() => {
  const U = 20, HU = U * HER_K, CS = .9 * U, B = n => OFF + n * BEAT;
  const T0 = 215.625, T_EVE = 243.0, T_END = 299;
  const CUT = [968, G + 14], BUSH = { x: 1000, y: 652, rx: 300, ry: 118 };
  const screenSpace = f => { push(); resetMatrix(); translate(-W / 2, -H / 2); f(); pop(); };

  // ---------- light: a warm summer rain → clear gold → sunset → dusk → night ----------
  const LIGHTS = {
    rain: ['#EFC993', .16, '#F2BC7C', 20], clear: ['#FFD9A0', .1, '#F7C27A', 18], sunset: ['#F7A86E', .4, '#FA9E52', 40],
    dusk: ['#6E5E9E', .46, '#3E3470', 36], night: ['#20264C', .64, '#1A2044', 40],
  };
  const SKY5 = {
    rain: { top: '#AEB9CF', low: '#F4DAB0', cloud: '#E9E3D8' }, clear: { top: '#9CCBEA', low: '#FBE6C2', cloud: '#FFF6E6' },
    sunset: { top: '#8E86C6', low: '#FFAE6E', cloud: '#FFC9A2' }, dusk: { top: '#363B78', low: '#B97E9C', cloud: '#6E6496' },
    night: { top: '#1C2246', low: '#2B3460', cloud: '#333C66' },
  };
  function setCols(light) {
    const [tc, tk] = LIGHTS[light], m = c => mixCol(c, tc, tk);
    return {
      tree: m(COL.tree), treeDk: m(COL.treeDk), hedge: m(mixCol(COL.hedge, '#BFD6C4', .3)), grass: m(COL.grass), ground: m(COL.ground), groundDk: m(COL.groundDk), pebble: m('#C2AE8C'),
      wallHer: m(COL.wallHer), wallHis: m(COL.wallHis), plinth: m(COL.plinth), roofHer: m(COL.roofHer), roofHis: m(COL.roofHis),
      doorHer: m(COL.doorHer), doorHis: m(COL.doorHis), frame: m(COL.frame), glass: m(COL.glass), step: m('#C9BCA3'),
      curtainHer: m('#F7D3DC'), curtainHis: m(COL.curtain), fence: m(COL.fence), fenceDk: m(COL.fenceDk), deck: m('#B98A5E'),
      pole: m(mixCol(COL.pole, '#A9C3CF', .35)), wire: mixCol(mixCol(PAL.ink, '#6D7590', .25), tc, tk * .5), room: mixCol('#6E5A52', tc, tk * .5),
      leaf: m('#3F7A45'), leafDk: m('#2B5E36'), leafLt: m('#5E9A55'), flower: mixCol('#FFFDF6', tc, tk * .55),
    };
  }
  const mixSet = (A, Bs, k) => { const o = {}; for (const f in A) o[f] = mixCol(A[f], Bs[f], k); return o; };
  const mixPal = (a, b, k) => ({ top: mixCol(a.top, b.top, k), low: mixCol(a.low, b.low, k), cloud: mixCol(a.cloud, b.cloud, k) });
  const LIGHT_KEYS = [[T0, 'rain'], [236.6, 'rain'], [239.0, 'clear'], [241.3, 'sunset'], [243.2, 'dusk'], [249.5, 'dusk'], [256.5, 'night']];
  function lightAt(t) {
    let i = 0; while (i + 1 < LIGHT_KEYS.length && t >= LIGHT_KEYS[i + 1][0]) i++;
    const [ta, a] = LIGHT_KEYS[i], [tb, b] = LIGHT_KEYS[Math.min(i + 1, LIGHT_KEYS.length - 1)], k = tb > ta ? ease(seg(t, ta, tb)) : 0;
    const ga = LIGHTS[a], gb = LIGHTS[b];
    return { C: mixSet(setCols(a), setCols(b), k), sky: mixPal(SKY5[a], SKY5[b], k), grade: [mixCol(ga[2], gb[2], k), lerp(ga[3], gb[3], k)] };
  }
  const drift = t => [8 * Math.sin(t * .41), 4 * Math.sin(t * .33 + 2), .004 * Math.sin(t * .27)];
  const rainK = t => 1 - ease(seg(t, 236.7, 238.7));

  // ---------- the 七里香, a year on: a flowering bush arching over the fence, the old stake still tied to it ----------
  const CLUMPS = [];   // [x, y, rx, ry, shade 0 deep … 2 light]
  for (let i = 0; i < 30; i++) {
    const a = hash(i * 3.31 + .5) * TAU, r = Math.sqrt(hash(i * 7.13 + 1.2)), layer = i < 10 ? 0 : i < 21 ? 1 : 2;
    CLUMPS.push([BUSH.x + Math.cos(a) * BUSH.rx * r * .82, BUSH.y + Math.sin(a) * BUSH.ry * r * .78 - (layer === 2 ? 14 : 0), 62 + 34 * hash(i * 2.7), 42 + 18 * hash(i * 5.9), layer]);
  }
  const FLOWERS = [];  // [x, y, r, angle]
  for (let i = 0; i < 34; i++) {
    const a = Math.PI + hash(i * 4.77 + 2) * Math.PI * 1.1 - .05, r = .45 + .55 * Math.sqrt(hash(i * 2.13 + 7));
    FLOWERS.push([BUSH.x + Math.cos(a) * BUSH.rx * r * .9, BUSH.y + Math.sin(a) * BUSH.ry * r * .95 + 22 * hash(i * 9.1), 6.5 + 2.5 * hash(i * 3.9), a + Math.PI / 2]);
  }
  FLOWERS.push([872, 738, 8.5, Math.PI / 2 + .2]);   // the cluster right over her head, where the drop gathers
  for (let i = 0; i < 10; i++) FLOWERS.push([BUSH.x - BUSH.rx * .8 + BUSH.rx * 1.6 * hash(i * 6.3 + 1), BUSH.y + BUSH.ry * (.35 + .4 * hash(i * 2.9 + 3)), 6 + 2 * hash(i), Math.PI / 2 + (hash(i * 5.2) - .5)]);
  function bush(t, C, o = {}) {
    const sw = o.sway || 0, wob = i => 4 * Math.sin(t * 1.3 + i * 1.7) * (o.wind || .3);
    boilSeed('bush stake'); inkLine([[CUT[0] + 13, CUT[1]], [CUT[0] + 15, CUT[1] - 168]], 1.7, '#B89660', 'ink', 0);
    inkLine([[CUT[0] + 15, CUT[1] - 122], [CUT[0] + 2, CUT[1] - 118]], .9, '#C8B48A', 'inkfine', 0);
    boilSeed('bush trunk');
    paint(ribbon([[CUT[0], CUT[1]], [CUT[0] - 5, CUT[1] - 80], [CUT[0] + 6, CUT[1] - 175], [BUSH.x - 40 + sw, BUSH.y + 50]], 15, 8), { wash: '#6B5A44', fill: '#4E3F2E', fillOp: 70, bleed: .05, tex: .5, ink: PAL.ink, sw: .7 });
    paint(ribbon([[CUT[0] + 1, CUT[1] - 110], [CUT[0] + 36, CUT[1] - 175], [BUSH.x + 90 + sw, BUSH.y + 46]], 9, 5), { wash: '#6B5A44', fill: '#4E3F2E', fillOp: 70, ink: PAL.ink, sw: .6 });
    paint(ribbon([[CUT[0] - 3, CUT[1] - 140], [CUT[0] - 50, CUT[1] - 200], [BUSH.x - 200 + sw, BUSH.y + 40]], 8, 4), { wash: '#6B5A44', ink: PAL.ink, sw: .55 });
    // the crown: deep clumps, then mid, then the light on top
    const cols = [C.leafDk, C.leaf, C.leafLt];
    CLUMPS.forEach(([x, y, rx, ry, layer], i) => {
      boilSeed('bush clump ' + i);
      paint(ellPts(x + sw * (.5 + .5 * layer) + wob(i), y + wob(i + 9) * .5, rx, ry, 18, 3), { wash: cols[layer], washOp: layer === 2 ? 200 : 255, fill: mixCol(cols[layer], PAL.ink, .25), fillOp: 55, bleed: .12, tex: .6, ink: null });
    });
    boilSeed('bush rim');   // a few ink arcs on the outer edge, and little leaves standing off it
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i + .5) / 9 * Math.PI, x = BUSH.x + Math.cos(a) * BUSH.rx * .98 + sw, y = BUSH.y + Math.sin(a) * BUSH.ry * 1.05;
      inkLine([[x - 30, y + 8], [x, y - 4], [x + 30, y + 8]], .7, mixCol(PAL.ink, C.leafDk, .3), 'inkfine', .6);
    }
    FLOWERS.forEach(([x, y, r, a], i) => {
      boilSeed('bush flowers ' + i);
      const cx = x + sw * .8 + wob(i) * .6, cy = y + wob(i + 4) * .3, ca = Math.cos(a), sa = Math.sin(a);
      [[.9, 0], [.05, 1], [.15, -.95]].forEach(([p, q], j) => bloom5(cx + (ca * p - sa * q) * r, cy + (sa * p + ca * q) * r, r * (1 - .1 * j), a + j * .7 + i, C.flower));
    });
    if (o.glow > .02) glow(BUSH.x, BUSH.y + 30, 260, '#FFE9C2', .3 * o.glow);
  }
  // a small flower as one shape, five rounded lobes round a pale yellow heart (cheap enough for the many on the bush)
  function bloom5(x, y, r, rot, col) {
    const P = []; for (let i = 0; i < 20; i++) { const a = rot + i / 20 * TAU, l = r * (.58 + .42 * Math.pow(Math.abs(Math.cos(2.5 * (a - rot))), .7)); P.push([x + Math.cos(a) * l, y + Math.sin(a) * l]); }
    paint(P, { wash: col, ink: PAL.ink, sw: .3, curv: .5 });
    paint(ellPts(x, y, r * .22, r * .22, 6), { wash: '#F2D672', ink: null });
  }
  // water dripping off the rim of the crown, and the odd petal falling with it
  function drips(t, k) {
    if (k <= .02) return;
    for (let i = 0; i < 12; i++) {
      boilSeed('drip ' + i);
      const side = i % 2 ? 1 : -1, x = BUSH.x + side * BUSH.rx * (.7 + .25 * hash(i * 3.1)), y0 = BUSH.y + BUSH.ry * (.55 - .3 * hash(i * 1.7)) * (1 - .3 * Math.abs(side));
      const ph = frac(t * (.9 + .4 * hash(i)) + hash(i * 2.2)), y = y0 + ph * ph * (G + 10 - y0);
      if (ph < .92) paint(ellPts(x, y, 2.4, 3.6, 8), { wash: '#E9EEF6', washOp: 230 * k, ink: PAL.ink, sw: .3 });
    }
  }
  function petals(t, k, o = {}) {
    if (k <= .02) return;
    for (let i = 0; i < (o.n || 7); i++) {
      boilSeed('fall petal ' + i);
      const ph = frac(t * (.12 + .05 * hash(i * 1.9)) + hash(i * 4.4)), x = BUSH.x - 260 + 520 * hash(i * 7.3) + 40 * Math.sin(t * 1.5 + i) + 80 * ph, y = BUSH.y + 30 + ph * (G - BUSH.y);
      push(); translate(x, y); rotate(t * 2 + i); paint(ellPts(0, 0, 4, 6.5, 8), { wash: '#FFFDF6', washOp: 255 * k, ink: PAL.ink, sw: .25 }); pop();
    }
  }

  // ---------- the fence, with its loose board and the panel that gives ----------
  // As world.js draws it, but board 2 hangs from its top nail and swings (swing, radians: + = its foot to the left), and
  // the whole panel between the posts can swing open on the left post (open 0..1): it narrows to its hinge as it turns.
  const LOOSE = 2, NAIL = [FENCE.x0 + 22 + LOOSE * 26.5 + 10.5, FENCE.top + 8];
  function fence5(o) {
    const fc = o.fence, fd = o.fenceDk, open = clamp(o.open || 0), cs = Math.cos(open * 1.38), hinge = FENCE.x0 + 20, nx = x => hinge + (x - hinge) * cs;
    const pc = mixCol(fc, fd, .55 * open), h = G + 4 - FENCE.top - 6;
    boilSeed('fence');
    paint(ellPts(FX, G + 6, 150, 16, 16), { fill: PAL.ink, fillOp: 50, bleed: .2, tex: .3, ink: null });
    for (let i = 0; i < 5; i++) {
      if (i === LOOSE && open < .02) continue;   // drawn on its own (looseBoard), so it can swing in front of the cat
      const bx = FENCE.x0 + 22 + i * 26.5, x0 = nx(bx), x1 = nx(bx + 21);
      paint(rectPts(x0, FENCE.top + 6, Math.max(2.5, x1 - x0), h, .7), { wash: pc, fill: fd, fillOp: 45, bleed: .05, tex: .6, ink: PAL.ink, sw: .8 });
    }
    for (const px of [FENCE.x0, FENCE.x1 - 20]) paint(rectPts(px, FENCE.top - 12, 20, G + 6 - FENCE.top + 12, .7), { wash: mixCol(fc, fd, .35), ink: PAL.ink, sw: .9 });
    const c0 = nx(FENCE.x0 - 6), c1 = nx(FENCE.x1 + 6);
    if (open < .02) paint(rectPts(FENCE.x0 - 6, FENCE.top - 4, FENCE.x1 - FENCE.x0 + 12, 12, .5), { wash: fc, ink: PAL.ink, sw: .9 });
    else paint(rectPts(hinge - 4, FENCE.top - 4, Math.max(8, c1 - hinge + 4), 12, .5), { wash: pc, ink: PAL.ink, sw: .9 });
    inkLine([[nx(FENCE.x0 + 20), G - 40], [nx(FENCE.x1 - 20), G - 40]], .5, fd, 'inkfine', 0);
  }
  function looseBoard(o) {
    if ((o.open || 0) >= .02) return;
    boilSeed('loose board');
    const h = G + 4 - FENCE.top - 6;
    push(); translate(...NAIL); rotate(o.swing || 0);
    paint(rectPts(-10.5, -2, 21, h, .7), { wash: mixCol(o.fence, o.fenceDk, .1), fill: o.fenceDk, fillOp: 45, bleed: .05, tex: .6, ink: PAL.ink, sw: .8 });
    paint(ellPts(0, 2, 2.2, 2.2, 6), { wash: PAL.ink, ink: null });   // its one nail
    pop();
  }

  // ---------- lanterns along the eaves ----------
  const LANTERNS = [[175, 0], [1825, 0], [315, 1], [1685, 1], [455, 2], [1545, 2], [595, 3], [1405, 3], [735, 4], [1265, 4], [860, 5], [1140, 5]];
  const LIT_AT = n => B(289 + n), LAST_LIT = B(295);   // pairs from the far ends to the middle, then the one in the bush
  function lantern(x, y, k, t, i) {
    boilSeed('lantern ' + i);
    const sway = .05 * Math.sin(t * 1.3 + i), r = 17;
    push(); translate(x, y); rotate(sway);
    inkLine([[0, 0], [0, 14]], .7, PAL.ink, 'inkfine', 0);
    const body = mixCol('#C9573F', '#FFC68A', k);
    paint(ellPts(0, 14 + r * 1.2, r, r * 1.2, 16), { wash: body, fill: mixCol(body, k > .5 ? '#FFF1CF' : PAL.ink, .3), fillOp: 60, bleed: .1, tex: .4, ink: PAL.ink, sw: .6 });
    for (const s of [-.45, 0, .45]) inkLine([[s * r, 14 + 2], [s * r * 1.25, 14 + r * 1.2], [s * r, 14 + r * 2.4 - 2]], .45, mixCol(PAL.ink, body, .4), 'inkfine', .6);
    paint(rectPts(-7, 11, 14, 5), { wash: '#3A2E3A', ink: null }); paint(rectPts(-6, 14 + r * 2.4 - 3, 12, 5), { wash: '#3A2E3A', ink: null });
    inkLine([[0, 14 + r * 2.4 + 2], [0, 14 + r * 2.4 + 12]], 1.2, '#D9A441', 'ink', 0);
    pop();
    if (k > .02) glow(x, y + 14 + r * 1.2, 70 + 40 * k, '#FFC77A', .75 * k);
  }
  const litK = (t, n) => { const a = t - n; return a < 0 ? 0 : clamp(a / .18) * (1 - .25 * Math.exp(-a * 7) * Math.cos(a * 30)); };

  // ---------- the cast ----------
  const herDraw = (x, y, o) => [y, () => heroine(x, y, HU, { boilKey: 'her', seed: 2, ...o, tint: null })];
  const hisDraw = (x, y, o) => [y + .1, () => clawd(x, y, U, { boilKey: 'his', seed: 5, ...o })];
  const sitting = { view: 'front', noLegs: true, dy: 2.25 };
  const SPRIG = sprigHook(9);   // her sprig from stage 4, worn beside her flower

  // ---------- A + B: under the flowers in the rain; the fence gives way (215.6–243.0) ----------
  const DROP = [218.6, 218.95];   // the first drop: gathering, then on her head
  const CAT_IN = [223.15, 225.0], SHAKE = [225.05, 225.75], PAT = [225.5, 226.3], SQUEEZE = [226.75, 227.75], HOP_ON = [228.05, 228.45];
  const STAND = [B(276), B(276) + .4], PUSHES = [B(277), B(278), B(279)], GIVE = B(279), BUMP = B(279) + .38, TURN_FRONT = 238.0;
  const H_A = [
    [T0, 'content', { blush: .4 }],                                                          // listening to the rain
    [DROP[1] + .02, 'surprised', { lookY: -1, emote: null }],                                // a drop on her head
    [219.55, 'happy', { lookY: -.7, lookX: .2 }],                                            // and up at the flowers, smiling
    [220.6, 'content', { blush: .45 }],
    [222.55, 'shy', { lookX: 1, lookY: 0, mouth: 'cat' }],                                   // a glance across
    [224.6, 'content', { blush: .5 }],
    [226.6, 'neutral', { lookX: .9, lookY: .6 }],                                            // something at the fence...
    [227.85, 'surprised', { lookX: .6, lookY: .3, emote: null }],
    [HOP_ON[1] + .05, 'love', { tint: null }],                                               // the cat picked her!
    [229.6, 'laugh'],                                                                        // and he is sulking
    [B(272) + .3, 'neutral', { lookX: .9, lookY: .7 }],                                      // the loose board
    [B(274), 'idea', { lookX: 1 }],                                                          // the same idea
    [STAND[1] + .05, 'determined', { lookX: 1 }],
    [GIVE + .02, 'surprised', { lookX: 1, emote: null }],
    [BUMP + .5, 'laugh'],
    [TURN_FRONT + .4, 'content', { blush: .8 }],
  ];
  const C_A = [
    [T0, 'content', { blush: .4 }],
    [222.7, 'shy', { lookX: -1, lookY: 0, mouth: 'cat' }],
    [224.6, 'content', { blush: .5 }],
    [SHAKE[0] + .05, 'surprised', { lookX: 1, lookY: .2, emote: 'sweat' }],                  // sprinkled
    [PAT[0], 'hopeful', { lookX: 1, lookY: .4 }],                                            // here, sit with me
    [SQUEEZE[0] + .1, 'confused', { lookX: -.6, lookY: .6 }],
    [HOP_ON[1] + .1, 'sad', { lookX: -1, emote: 'cloud', gloom: .2 }],                       // it picked her
    [B(272) + .35, 'neutral', { lookX: -.9, lookY: .7 }],
    [B(274), 'idea', { lookX: -1 }],
    [STAND[1] + .05, 'determined', { lookX: 1 }],
    [GIVE + .02, 'surprised', { lookX: 1, emote: null }],
    [BUMP + .55, 'laugh'],
    [TURN_FRONT + .45, 'content', { blush: .8 }],
  ];
  function herA(t) {
    const mood = emotions(t, H_A, { take: .8 });
    let x = 852, p, dy = 0, rot = 0, sq = 0;
    if (t < STAND[0]) { p = { ...sitting }; dy = 2.25; rot = .05; }
    else if (t < STAND[1]) { const k = seg(t, ...STAND); dy = lerp(2.25, 0, k) - 2.2 * Math.sin(Math.PI * k); p = { view: 'front', noLegs: k < .3 }; }
    else {
      p = t < STAND[1] + .15 ? turn(t, STAND[1], STAND[1] + .15, 0, .125) : t < TURN_FRONT ? { view: 'q' } : turn(t, TURN_FRONT, TURN_FRONT + .14, .125, 0);
      x = lerp(860, 846, ease(seg(t, STAND[1], STAND[1] + .3)));
      PUSHES.forEach(b => { rot += .14 * Math.exp(-Math.pow((t - b) / .12, 2)); });                 // shoulder to the fence: one, two...
      if (t > GIVE) { const k = seg(t, GIVE, BUMP); x = lerp(846, 912, easeIn(k)); rot += .2 * Math.sin(Math.PI * k); }   // ...it gives: she stumbles in
      if (t > BUMP) { x = 912 - 8 * Math.exp(-(t - BUMP) * 6) * Math.sin((t - BUMP) * 18) - 4 * ease(seg(t, BUMP, BUMP + .3)); sq += .14 * Math.exp(-(t - BUMP) * 8) * Math.cos((t - BUMP) * 18); }
    }
    const o = addPose(mood, { ...p, dy, rot, sq });
    o.draw = SPRIG;
    if (t > HOP_ON[1] && t < HOP_ON[1] + .4) o.sq = (o.sq || 0) + .12 * Math.exp(-(t - HOP_ON[1]) * 9) * Math.cos((t - HOP_ON[1]) * 18);
    return { x, y: G, o };
  }
  function hisA(t) {
    const mood = emotions(t, C_A, { take: .8 });
    let x = 1150, p, dy = 0, rot = 0, sq = 0;
    if (t < STAND[0]) { p = { ...sitting }; dy = 2.25; rot = -.05; if (t > SHAKE[0] && t < SHAKE[1]) rot -= .06 * Math.sin((t - SHAKE[0]) * 30) * (1 - seg(t, ...SHAKE)); }
    else if (t < STAND[1]) { const k = seg(t, ...STAND); dy = lerp(2.25, 0, k) - 2.4 * Math.sin(Math.PI * k); p = { view: 'front', noLegs: k < .3 }; }
    else {
      p = t < STAND[1] + .15 ? turn(t, STAND[1], STAND[1] + .15, 0, -.125) : t < TURN_FRONT ? { view: 'q', flip: true } : turn(t, TURN_FRONT, TURN_FRONT + .14, -.125, 0);
      x = lerp(1145, 1156, ease(seg(t, STAND[1], STAND[1] + .3)));
      PUSHES.forEach(b => { rot -= .14 * Math.exp(-Math.pow((t - b) / .12, 2)); });
      if (t > GIVE) { const k = seg(t, GIVE, BUMP); x = lerp(1156, 1088, easeIn(k)); rot -= .2 * Math.sin(Math.PI * k); }
      if (t > BUMP) { x = 1088 + 8 * Math.exp(-(t - BUMP) * 6) * Math.sin((t - BUMP) * 18) + 4 * ease(seg(t, BUMP, BUMP + .3)); sq += .14 * Math.exp(-(t - BUMP) * 8) * Math.cos((t - BUMP) * 18); }
    }
    const o = addPose(mood, { ...p, dy, rot, sq });
    if (t > PAT[0] && t < PAT[1]) { const pat = [PAT[0] + .2, PAT[0] + .55].reduce((s, b) => s + Math.exp(-Math.pow((t - b) / .08, 2)), 0); o.aR = -.9 - .5 * pat; }   // patting the ground: here
    return { x, y: G, o };
  }
  // the cat: in through the rain, a shake beside him, through the loose board, and up onto her head
  function catA(t, h) {
    if (t < CAT_IN[0]) return null;
    if (t < CAT_IN[1]) { const x = lerp(1900, 1300, ease(seg(t, ...CAT_IN))); return { on: 'ground', x, y: G + 8, o: { pose: 'walk', flip: true, walk: (1900 - x) / (2.4 * CS), look: -.4 } }; }
    if (t < PAT[1]) { const a = t - SHAKE[0], look = t < PAT[0] ? .3 : -.7 * Math.sin(Math.PI * seg(t, PAT[0], PAT[1])) - .2; return { on: 'behind', x: 1300, y: G + 8, o: { pose: 'stand', flip: true, rot: a > 0 && t < SHAKE[1] ? .1 * Math.sin(a * 40) * (1 - seg(t, ...SHAKE)) : 0, look, eyes: a > 0 && a < .7 ? 'closed' : 'open' } }; }
    if (t < SQUEEZE[0]) { const k = seg(t, PAT[1], SQUEEZE[0]); return { on: 'behind', x: lerp(1300, 1100, ease(k)), y: G + 4, o: { pose: 'walk', flip: true, walk: k * 3, look: -.9 } }; }
    if (t < SQUEEZE[1]) { const k = seg(t, ...SQUEEZE), x = lerp(1100, 930, k); return { on: 'behind', x, y: G + 4, o: { pose: 'walk', flip: true, walk: k * 4, sq: .18 * Math.sin(Math.PI * k), look: -.8 } }; }
    const top = topOf(h.x, h.y, HU, h.o);
    if (t < HOP_ON[0]) return { on: 'behind', x: 930, y: G + 4, o: { pose: 'stand', flip: true, sq: .2 * seg(t, SQUEEZE[1] + .1, HOP_ON[0]), look: .5 } };
    if (t < HOP_ON[1]) { const k = seg(t, ...HOP_ON), p = arcPt([930, G + 6], [top.x, top.y], 60, k); return { on: 'air', x: p[0], y: p[1], o: { pose: 'leap', flip: true, rot: lerp(.3, -.1, k), noShadow: true } }; }
    const a = t - HOP_ON[1];
    return { on: 'her', x: top.x, y: top.y, o: a < .45 ? { pose: 'stand', flip: true, rot: top.rot, sq: .16 * Math.exp(-a * 8) * Math.cos(a * 16), look: -.3, noShadow: true }
      : { pose: 'loaf', flip: true, rot: top.rot, eyes: 'closed', curl: ease(seg(a, .45, .95)), noShadow: true } };
  }
  const swingAt = t => {   // the loose board: nosed aside by the cat, it swings back after it; it never quite settles
    const a = t - SQUEEZE[0];
    return .03 * Math.sin(t * 1.7) + (a > -.2 ? .55 * ease(seg(a, -.2, .15)) * (1 - ease(seg(a, .85, 1.1))) : 0) + .22 * spring(t, SQUEEZE[1] + .1, 3, 9) + .06 * spring(t, B(272) + .3, 2, 8);
  };
  const openAt = t => t < GIVE ? 0 : backOut(seg(t, GIVE, GIVE + .5)) * .97;
  // the fence gives: the bush shakes a burst of petals loose over them
  function petalBurst(t) {
    const a = t - GIVE; if (a < 0 || a > 1.6) return;
    for (let i = 0; i < 14; i++) {
      boilSeed('burst ' + i);
      const an = Math.PI * (1.1 + .8 * hash(i * 2.9)), v = 90 + 120 * hash(i * 5.3), x = BUSH.x + Math.cos(an) * v * a + 30 * Math.sin(t * 3 + i), y = BUSH.y + 60 + Math.sin(an) * v * a + 140 * a * a;
      push(); translate(x, y); rotate(t * 4 + i); paint(ellPts(0, 0, 4.5, 7, 8), { wash: '#FFFDF6', washOp: 255 * (1 - seg(a, 1.1, 1.6)), ink: PAL.ink, sw: .3 }); pop();
    }
  }

  // ---------- C + D: the evening on his porch, and the opening rhymed (243.0–299) ----------
  const DECK_Y = 896, SEAT = DECK_Y - 5, FAN = [1630, DECK_Y - 6];
  const HOP_HIS = [B(297) + .1, B(297) + .5], SCOOT = [B(304) + .1, B(304) + .9], FACE = [B(312), B(312) + .2], TOUCH = B(314), REST = [B(318) - .1, B(318) + .1];   // REST: she leans on him for the rest of the film
  const fanA5 = t => Math.sin(TAU * (t - 247.0) / (8 * BEAT));   // 1 = toward him (left), -1 = toward her (right)
  const breezeOn = (t, who) => clamp(((who === 'his' ? 1 : -1) * fanA5(t - .3) - .25) / .6);   // how much of the breeze is on him (left) or her
  const H_C = [
    [T_EVE, 'content', { blush: .6 }],
    [250.3, 'happy', { lookX: -.6, lookY: -.6 }],                                            // the cat goes over to his head
    [251.6, 'laugh'],
    [252.6, 'content', { blush: .6 }],                                                        // the fan's breeze
    [SCOOT[0], 'shy', { lookX: -1, lookY: .2, mouth: 'cat' }],
    [SCOOT[1] + .1, 'content', { blush: .9 }],                                                // leaning against him
    [FACE[0] + .05, 'shy', { lookX: 1, lookY: .2, mouth: 'cat', blush: 1 }],
    [TOUCH + .05, 'content', { blush: 1 }],
    [REST[1] + .1, 'content', { blush: .9 }],                                                 // her head on his shoulder
  ];
  const C_C = [
    [T_EVE, 'content', { blush: .6 }],
    [HOP_HIS[1] + .02, 'surprised', { lookY: -.8, emote: null }],
    [251.7, 'laugh'],
    [252.6, 'content', { blush: .6 }],
    [SCOOT[1] + .15, 'love', { lookX: .7 }],                                                  // she leans on him: he glows
    [FACE[0] + .05, 'shy', { lookX: 1, lookY: .2, mouth: 'cat', blush: 1 }],
    [TOUCH + .05, 'content', { blush: 1 }],
    [REST[1] + .2, 'content', { blush: 1, lookX: .3 }],
  ];
  function herC(t) {
    const mood = emotions(t, H_C, { take: .7 });
    let x = 1760, p = { ...sitting }, rot = 0, dx = 0;
    rot -= .1 * breezeOn(t, 'her') * (t < SCOOT[0] ? 1 : .3);   // leaning into the fan's breeze
    if (t > SCOOT[0]) { x = lerp(1760, 1668, ease(seg(t, ...SCOOT))); rot -= .13 * ease(seg(t, SCOOT[1] - .2, SCOOT[1] + .3)) * (1 - ease(seg(t, FACE[0] - .3, FACE[0]))); }
    if (t > FACE[0] - .3) x = lerp(1668, 1725, ease(seg(t, FACE[0] - .3, FACE[0] + .1)));
    if (t > FACE[0]) p = { ...p, ...(t < FACE[1] ? turn(t, ...FACE, 0, -.125) : t < REST[0] ? { view: 'q', flip: true } : turn(t, ...REST, -.125, 0)) };
    if (t > REST[0]) { x = lerp(1725, 1670, ease(seg(t, REST[0], REST[1] + .6))); rot -= .13 * ease(seg(t, REST[1], REST[1] + .5)); }   // and back against his shoulder
    const o = addPose(mood, { ...p, rot, dx, shadowW: 1.2 });
    o.draw = SPRIG;
    if (t > FACE[1]) { const k = ease(seg(t, FACE[1], TOUCH)) * (1 - ease(seg(t, REST[0] - .3, REST[0]))); o.aR = lerp(o.aR ?? .2, -.28, k); }   // her arm tip reaching across to his
    return { x, y: SEAT, o };
  }
  function hisC(t) {
    const mood = emotions(t, C_C, { take: .7 });
    let x = 1500, p = { ...sitting }, rot = 0;
    rot += .1 * breezeOn(t, 'his') * (t < SCOOT[0] ? 1 : .3);
    if (t > FACE[0]) p = { ...p, ...(t < FACE[1] ? turn(t, ...FACE, 0, .125) : t < REST[0] ? { view: 'q' } : turn(t, ...REST, .125, 0)) };
    rot += .03 * ease(seg(t, REST[1], REST[1] + .5));
    const o = addPose(mood, { ...p, rot, shadowW: 1.2 });
    if (t > HOP_HIS[1] && t < HOP_HIS[1] + .4) o.sq = (o.sq || 0) + .14 * Math.exp(-(t - HOP_HIS[1]) * 8) * Math.cos((t - HOP_HIS[1]) * 18);
    if (t > FACE[1]) { const k = ease(seg(t, FACE[1], TOUCH)) * (1 - ease(seg(t, REST[0] - .3, REST[0]))); o.aR = lerp(o.aR ?? .2, -.62, k); }
    return { x, y: SEAT, o };
  }
  function catC(t, h, c) {
    const topH = topOf(h.x, h.y, HU, h.o), topC = topOf(c.x, c.y, U, c.o);
    if (t < HOP_HIS[0]) return { x: topH.x, y: topH.y, o: { pose: 'loaf', flip: true, rot: topH.rot, eyes: 'closed', noShadow: true } };
    if (t < HOP_HIS[1]) { const k = seg(t, ...HOP_HIS), p = arcPt([topH.x, topH.y], [topC.x, topC.y], 70, k); return { x: p[0], y: p[1], o: { pose: 'leap', flip: true, rot: lerp(.2, -.2, k), noShadow: true } }; }
    const a = t - HOP_HIS[1];
    return { x: topC.x, y: topC.y, o: a < .45 ? { pose: 'stand', flip: true, rot: topC.rot, sq: .16 * Math.exp(-a * 8) * Math.cos(a * 16), look: .4, noShadow: true }
      : { pose: 'loaf', flip: true, rot: topC.rot, eyes: 'closed', curl: ease(seg(a, .45, 1)), noShadow: true } };
  }
  // the two sparrows from the opening, asleep side by side on the wire
  function sleepers(t) {
    const b = 1.5 * Math.sin(t * 1.1);
    sparrow(742, wireY(742, 0) + b * .2, 13, { key: 's1', sleep: true, sq: .03 * Math.sin(t * 1.4) });
    sparrow(774, wireY(774, 0) + b * .2, 13, { key: 's2', sleep: true, flip: true, sq: .03 * Math.sin(t * 1.4 + 1) });
  }
  function fireflies(t, k) {
    if (k <= .02) return;
    for (let i = 0; i < 9; i++) {
      boilSeed('firefly ' + i);
      const x = 1180 + 700 * hash(i * 3.7) + 40 * Math.sin(t * (.6 + .3 * hash(i)) + i), y = 700 + 160 * hash(i * 5.1) + 30 * Math.sin(t * (.8 + .4 * hash(i * 2)) + i * 2), a = k * (.5 + .5 * Math.sin(t * 3 + i * 1.7));
      glow(x, y, 16, '#FFF2A8', .8 * a); paint(ellPts(x, y, 2.2, 2.2, 6), { wash: '#FFF6C8', washOp: 255 * a, ink: null });
    }
  }

  // ---------- the camera ----------
  const CAM = [
    [T0, [872, 762, 3.3]], [218.55, [872, 768, 3.25]], [219.3, [870, 815, 2.6]], [220.1, [878, 820, 2.5]], [221.6, [1000, 792, 1.55]], [223.1, [1030, 800, 1.5]], [224.6, [1160, 800, 1.42]],
    [226.4, [1060, 808, 1.6]], [228.4, [985, 806, 1.68]], [233.2, [1000, 806, 1.72]], [235.6, [1000, 806, 1.8]], [237.0, [1000, 800, 1.86]],
    [239.6, [1000, 790, 1.8]], [241.6, [1000, 280, 1.15]], [T_EVE, [1000, 160, 1.15]], [244.7, [1000, 700, 1.1]], [247.0, [1000, 700, 1.1]],
    [249.6, [1615, 812, 1.7]], [256.8, [1618, 822, 1.95]], [263.6, [1615, 828, 2.1]], [270.3, [1612, 830, 2.15]],
    [273.6, [1250, 740, 1.3]], [276.2, [1000, 700, 1.1]], [281.4, [990, 330, 1.15]], [285.0, [880, 112, 1.42]], [288.6, [800, 110, 1.62]],
    [292.5, [880, -300, 1.3]], [T_END, [880, -400, 1.3]],
  ];
  const cam = t => { const [cx, cy, z] = kf(t, CAM), [dx, dy, dz] = drift(t); return [cx + dx, cy + dy, z * (1 + dz)]; };

  // ---------- the one continuous shot ----------
  function together(t, lt) {
    const L = lightAt(t), C = L.C, [cx, cy, z] = cam(t), rk = rainK(t), eve = t >= T_EVE, nightK = ease(seg(t, 244, 257));
    const h = eve ? herC(t) : herA(t), c = eve ? hisC(t) : hisA(t), ct = eve ? catC(t, h, c) : catA(t, h);
    const fenceO = { fence: C.fence, fenceDk: C.fenceDk, swing: swingAt(t), open: eve ? .97 : openAt(t) };
    const sunOut = ease(seg(t, 237.4, 239.4)) * (1 - ease(seg(t, 241.0, 242.6)));
    camBegin(cx, cy, z);
    sky(t, 0, { pal: L.sky, clouds: 5, drift: 11000 + 20 * t + 900 * ease(seg(t, 239.6, 243.5)) });
    if (sunOut > .02) { boilSeed('sun 5'); paint(ellPts(430, 260, 150, 150, 24, 4), { fill: '#FFE6B8', fillOp: 90 * sunOut, bleed: .35, ink: null }); paint(ellPts(430, 260, 50, 50, 22, 1), { wash: '#FFF2D6', washOp: 255 * sunOut, ink: null }); }
    starField(t, ease(seg(t, 250, 258)), { n: 60 });
    moon(1500, -60, 34, ease(seg(t, 252, 258)));
    if (rk > .02) stormClouds(t, .45 * rk, { col: '#B7B0B8', lt: '#E8DCCC' });
    backdrop(t, 0, null, { tree: C.tree, treeDk: C.treeDk, hedge: C.hedge, band: C.treeDk, pole: C.pole, wire: C.wire, sway: 4 });
    if (t > 274) sleepers(t);
    if (rk > .02) screenSpace(() => rainScreen(t, { n: Math.round(44 * rk), len: 28, speed: 760, slant: -.08, col: '#9AA8C0', w: .6, seed: 31 }));
    const win = side => ({ lit: nightK > .3 ? .35 * nightK : 0, curtain: side === 'her' ? C.curtainHer : C.curtainHis });
    const low = cy + 545 / z, see = y => low > y;   // up in the sky, what is below the frame isn't painted
    if (see(430)) {
      house(...SET.her, { side: 'her', wall: C.wallHer, roof: C.roofHer, door: C.doorHer, plinth: C.plinth, frame: C.frame, glass: C.glass, step: C.step, room: C.room, ...win('her') });
      house(...SET.his, { side: 'his', wall: C.wallHis, roof: C.roofHis, door: C.doorHis, plinth: C.plinth, frame: C.frame, glass: C.glass, step: C.step, room: C.room, lived: 1, noPots: true, ...win('his') });
    }
    if (see(552)) LANTERNS.forEach(([x, n], i) => lantern(x, 556, litK(t, LIT_AT(n)), t, i));
    if (see(880)) {
      yard(t, { ground: C.ground, groundDk: C.groundDk, grass: C.grass, pebble: C.pebble, wind: .3 });
      if (rk > .02) puddles([[560, G + 46, 110], [1300, G + 74, 130], [1720, G + 44, 80]], { col: mixCol('#9AA6C0', C.ground, .4) });
    }
    if (see(680)) clothesline();
    if (see(870)) deck(1290, 1850, DECK_Y, { col: C.deck });
    if (see(800)) fence5(fenceO);
    if (see(530)) bush(t, C, { sway: 3 * Math.sin(t * .9), wind: .3 + .3 * rk, glow: litK(t, LAST_LIT) });
    if (see(715)) lantern(BUSH.x + 8, BUSH.y + 70, litK(t, LAST_LIT), t, 99);
    if (see(740)) {
      const cast = [];
      if (eve) {
        const fp = () => {
          const f = fan(FAN[0], FAN[1], 15, fanA5(t), t);
          breeze(f.x - f.R * .5, f.y, -1, 210, t, age => clamp((fanA5(t - age) - .3) / .6), { speed: 420, col: '#FFF0DA', n: 5 });
          breeze(f.x + f.R * .5, f.y, 1, 210, t, age => clamp((-fanA5(t - age) - .3) / .6), { speed: 420, col: '#FFF0DA', n: 5 });
        };
        cast.push([SEAT - 20, fp], hisDraw(c.x, c.y, c.o), herDraw(h.x, h.y, h.o));
      } else {
        cast.push(hisDraw(c.x, c.y, c.o), herDraw(h.x, h.y, h.o));
        if (ct && ct.on === 'ground') cast.push([ct.y, () => cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' })]);
        if (ct && ct.on === 'behind') cast.push([G - 2, () => cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' })]);
        cast.push([G - 1, () => looseBoard(fenceO)]);
      }
      cast.sort((a, b) => a[0] - b[0]).forEach(e => e[1]());
      if (ct && (eve || ['air', 'her'].includes(ct.on))) cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' });
    }
    if (see(640)) { drips(t, rk); petals(t, eve ? .4 : .6); }
    if (!eve) { firstDrop(t); petalBurst(t); }
    if (see(660)) fireflies(t, eve ? ease(seg(t, 251, 255)) * (1 - ease(seg(t, 288, 292))) : 0);
    if (eve && t > TOUCH + .1) { const a = t - TOUCH - .1, k = seg(a, 0, .3) * (1 - seg(a, 2.6, 3.1)); if (k > 0) { boilSeed('touch heart 5'); emote('heart', 1621, SEAT - 118 - 50 * seg(a, 0, 3.1), 13, k, a); } }
    camEnd();
    if (rk > .02) rainScreen(t, { n: Math.round(66 * rk), len: 42, speed: 1050, slant: -.1, col: '#A3B2CA', w: .8, seed: 32, skip: underBush() });
    grade(1, L.grade[0], L.grade[1]);
    driftingPetals(t);
    boilSeed('transition');
    if (lt < .3) petalWipe(.5 + lt / .6);                                                     // stage 4's petal wipe drags off
    const fade = ease(seg(t, 292.0, 295.0));
    if (fade > .001) flash(fade, PAL.paper);                                                  // back to the paper it came from
    if (t > 294.6) lastFlower(t);
  }
  // the first drop: it gathers under the flowers over her head and falls on it (the bud's drop in stage 3, a year on)
  function firstDrop(t) {
    if (t > DROP[1] + .4) return;
    boilSeed('first drop');
    const x0 = 872, y0 = 750, x1 = 866, y1 = 842;
    const drop = (x, y, r) => { paint(ellPts(x, y, r * .8, r * 1.15, 12), { wash: '#DCE6F4', fill: '#9DB4D8', fillOp: 50, ink: PAL.ink, sw: .45 }); paint(ellPts(x - r * .25, y - r * .35, r * .22, r * .3, 6), { wash: '#FFFFFF', ink: null }); };
    if (t < DROP[0]) { const r = 2 + 5 * ease(seg(t, T0 + .3, DROP[0])); drop(x0, y0 + r * 1.1, r); return; }
    const k = seg(t, ...DROP);
    if (k < 1) { drop(lerp(x0, x1, k), lerp(y0 + 7, y1, k * k), 6.2); return; }
    const a = seg(t, DROP[1], DROP[1] + .4);
    for (const sd of [-1, 1]) inkLine([[x1 + sd * 3, y1], [x1 + sd * (7 + 12 * a), y1 - 10 * (1 - a)]], .9 * (1 - a), '#DCE6F4', 'inkfine', .3);
  }
  // the dry space under the crown, in screen space (the front rain leaves it out)
  function underBush() {
    const [x0, y0] = toScreen(BUSH.x - BUSH.rx * .9, BUSH.y + 20, LAST_CAM), [x1, y1] = toScreen(BUSH.x + BUSH.rx * .9, G + 40, LAST_CAM);
    return (x, y) => x > x0 && x < x1 && y > y0 && y < y1;
  }
  // petals drifting up past the camera as it rises into the night (screen space)
  function driftingPetals(t) {
    const k = ease(seg(t, 276, 279)) * (1 - ease(seg(t, 293.5, 295)));
    if (k <= .02) return;
    for (let i = 0; i < 14; i++) {
      boilSeed('rising petal ' + i);
      const ph = frac(t * (.05 + .03 * hash(i * 2.3)) + hash(i * 7.1)), x = W * hash(i * 3.7) + 60 * Math.sin(t * .8 + i * 1.3), y = H + 60 - ph * (H + 160);
      if (i % 3 === 0) jasmine(x, y, 9 + 3 * hash(i), k, t * .6 + i);
      else { push(); translate(x, y); rotate(t * 1.4 + i); paint(ellPts(0, 0, 5, 8, 8), { wash: '#FFFDF6', washOp: 230 * k, ink: PAL.ink, sw: .3 }); pop(); }
    }
  }
  // on the paper: one last 七里香 flower drifts down and settles
  function lastFlower(t) {
    const k = seg(t, 294.6, 297.6), x = W / 2 + 70 * Math.sin(k * 5) * (1 - k), y = lerp(-40, H * .52, easeOut(k)), rot = Math.sin(k * 6) * (1 - k) * 1.2 + .15 * Math.sin(t * 1.2) * k;
    boilSeed('last flower');
    if (k > .8) paint(ellPts(W / 2 + 6, H * .52 + 40, 46 * seg(k, .8, 1), 9 * seg(k, .8, 1), 16), { fill: PAL.ink, fillOp: 26, bleed: .3, ink: null });
    jasmine(x, y, 46 * (1 + .03 * Math.sin(t * 2.4)), 1, rot);
  }

  shots([[T0, together]]);
  // for checks: crop-at expressions (e.g. STAGE5.herA(T).x) and logic tests
  window.STAGE5 = { herA, hisA, catA: t => catA(t, herA(t)), herC, hisC, cam, lightAt, openAt, swingAt, T_EVE, T_END };
})();
