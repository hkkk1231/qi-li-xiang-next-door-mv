// stage-04-trip-and-return.js: STAGE 4 of 《隔壁》, song time 161.250–215.625 s (frames 3870–5174): chorus 2 and the
// bridge. Storyboard: docs/storyboard/stage-04.md. Stage 3 hands over under a full autumn brush wipe.
//   161.25–169.07  An autumn morning. He comes to the fence with a little travel bag riding on his flat top and a cap
//                  beside it and points down the lane: he is going away for a while. She droops, then waves him off.
//   169.07–175.82  The days without him. She keeps his yard tidy, pushing the drifted leaves onto a heap with her whole
//                  body like a little bulldozer, and looks up at his curtained window; the cat waits on his doorstep.
//   175.82–182.57  A rainy night. At her window she bonks her lamp off and on twice, their signal; his window stays
//                  dark. She leaves her lamp on for him and falls asleep at the sill.
//   182.57–215.63  An afternoon: a cloud shaped just like him. The sky turns to sunset as it drifts on, down to the lane,
//                  where he is walking home. The cat sees him first; she lights up and bounces to the fence. Red cheeks;
//                  the 七里香 has bloomed; she smells it; the breeze gives her a sprig; he leans in, she pouts
//                  stubbornly, and their arm tips touch. A petal wipe covers the frame at 215.625 for stage 5.
// Every pose is a pure function of song time t. Nothing is gripped: the bag rides on his top and the cat on the bag,
// the leaves are pushed with her whole body, a lamp is switched by bonking it, the breeze brings the sprig.
(() => {
  const U = 20, HU = U * HER_K, CS = .9 * U, B = n => OFF + n * BEAT, HB = n => B(n + .5);
  const T0 = 161.25, T_LEAVES = B(200), T_NIGHT = B(208), T_DAY = B(216), T_HOME = B(224), T_END = 215.625;
  const CUT = [968, G + 14];
  const screenSpace = f => { push(); resetMatrix(); translate(-W / 2, -H / 2); f(); pop(); };

  // ---------- light (stage 3's palettes, so the seasons carry straight on) ----------
  const NIGHT = {
    sky: { top: '#1C2246', low: '#2B3460', cloud: '#333C66' },
    wallHer: '#4E5476', wallHis: '#494F70', plinth: '#3E4462', roofHer: '#262D4A', roofHis: '#2A3048', doorHer: '#36585C', doorHis: '#5E4A3C',
    frame: '#34405A', step: '#4E5270', ground: '#3E4159', groundDk: '#30324A', grass: '#435C4E', pebble: '#53566E', fence: '#7E8298', fenceDk: '#565A72',
    tree: '#2E4846', treeDk: '#233838', hedge: '#2F4747', pole: '#4A4E66', wire: '#141830', curtainHer: '#F2B7A8', curtainHis: '#F0CF8E',
  };
  const DARK = '#1E2342';
  const SKIES = {
    autumn: { top: '#9DC3E4', low: '#FBE0B4', cloud: '#FFF2DC' },
    sunset: { top: '#8E86C6', low: '#FFAE6E', cloud: '#FFC9A2' },
  };
  const TINTS = { autumn: ['#F2B062', .16, '#F7BE6E', 22], sunset: ['#F7A86E', .4, '#FA9E52', 40], dusk: ['#E59A7A', .34, '#E9906A', 34] };
  const AUT = { tree: ['#E3B24E', '#D9823F'], treeDk: ['#C48A3A', '#AE5E2E'], hedge: ['#9EA556', '#B58A47'], grass: ['#B6B163', '#C4985A'] };
  const turnCol = (c, [mid, late], a) => a < .5 ? mixCol(c, mid, a * 2) : mixCol(mid, late, a * 2 - 1);
  function setCols(a, light) {
    const [tc, tk] = TINTS[light], m = c => mixCol(c, tc, tk);
    return {
      tree: m(turnCol(COL.tree, AUT.tree, a)), treeDk: m(turnCol(COL.treeDk, AUT.treeDk, a)), hedge: m(turnCol(mixCol(COL.hedge, '#BFD6C4', .3), AUT.hedge, a * .85)),
      grass: m(turnCol(COL.grass, AUT.grass, a)), ground: m(COL.ground), groundDk: m(COL.groundDk), pebble: m('#C2AE8C'),
      wallHer: m(COL.wallHer), wallHis: m(COL.wallHis), plinth: m(COL.plinth), roofHer: m(COL.roofHer), roofHis: m(COL.roofHis),
      doorHer: m(COL.doorHer), doorHis: m(COL.doorHis), frame: m(COL.frame), glass: m(COL.glass), step: m('#C9BCA3'),
      curtainHer: m('#F7D3DC'), curtainHis: m(COL.curtain), fence: m(COL.fence), fenceDk: m(COL.fenceDk),
      pole: m(mixCol(COL.pole, '#A9C3CF', .35)), wire: mixCol(mixCol(PAL.ink, '#6D7590', .25), tc, tk * .5), room: mixCol('#6E5A52', tc, tk * .5),
    };
  }
  const mixSet = (A, Bs, k) => { const o = {}; for (const f in A) o[f] = mixCol(A[f], Bs[f], k); return o; };
  const mixPal = (a, b, k) => ({ top: mixCol(a.top, b.top, k), low: mixCol(a.low, b.low, k), cloud: mixCol(a.cloud, b.cloud, k) });
  function sunDisk(x, y, r, k, halo, disk) {
    if (k <= .02) return;
    boilSeed('sun 4');
    paint(ellPts(x, y, r * 3, r * 3, 24, 4), { fill: halo, fillOp: 90 * k, bleed: .35, tex: .2, ink: null });
    paint(ellPts(x, y, r, r, 22, 1), { wash: disk, washOp: 255 * k, fill: PAL.ochre, fillOp: 35 * k, ink: k > .6 ? mixCol(PAL.ink, disk, .55) : null, sw: .6 });
  }
  const drift = t => [8 * Math.sin(t * .41), 4 * Math.sin(t * .33 + 2), .004 * Math.sin(t * .27)];
  const camAt = (t, keys) => { const [cx, cy, z] = kf(t, keys), [dx, dy, dz] = drift(t); return [cx + dx, cy + dy, z * (1 + dz)]; };

  // ---------- the cast ----------
  const herDraw = (x, y, o) => [y, () => heroine(x, y, HU, { boilKey: 'her', seed: 2, ...o, tint: null })];
  const hisDraw = (x, y, o) => [y + .1, () => clawd(x, y, U, { boilKey: 'his', seed: 5, ...o })];
  const wave = (t, a, b, f = 2.2) => [ease(seg(t, a, a + .15)) * (1 - ease(seg(t, b - .15, b))), 1.15 + .45 * Math.sin(TAU * f * t)];
  const fenceCat = o => ({ on: 'fence', x: FX, y: FENCE.top - 4, o: { noShadow: true, ...o } });
  // a little walk: x from x0 to x1 between t0 and t1, eased; the steps (one per 4u) and the bob, for clawd()
  function walkTo(t, t0, t1, x0, x1, u) {
    const k = seg(t, t0, t1), x = lerp(x0, x1, ease(k)), moving = t > t0 && t < t1, d = Math.abs(x - x0) / (4 * u);
    return { x, moving, walk: moving ? d : null, dy: moving ? -Math.abs(Math.sin(d * Math.PI)) * .5 : 0 };
  }
  // extra moods: puckered up for a kiss; a stubborn pout with her chin up and her eyes shut
  EMO.kissy = { eyes: 'closed', mouth: 'o', blush: .9, take: .4, body: t => { const b = _b(t); return { sq: .02, dy: -.1 * b.ab, aL: -.55, aR: -.5 + .05 * b.s1 }; } };
  EMO.stubborn = { eyes: 'closed', mouth: 'pout', blush: .85, take: .5, body: t => { const b = _b(t), s = Math.sin(b.bp * Math.PI / 2); return { sq: -.04, rot: -.04 + .01 * s, aL: -.95, aR: -.9, dy: -.08 * b.ab }; } };

  // ---------- the courtyard, painted from a vignette (as in stage 3, plus a sky layer, ground layer and blooms) ----------
  function yardScene(t, V, cam) {
    const C = V.C, [cx, cy, z] = cam, WS = V.wins || {};
    camBegin(cx, cy, z);
    sky(t, 0, { pal: V.skyPal, clouds: V.clouds ?? 5, drift: V.drift || 0 });
    if (V.sun) sunDisk(...V.sun);
    if (V.skyFx) V.skyFx();
    if (V.stars) starField(t, V.stars);
    if (V.storm) stormClouds(t, V.storm[0], { col: mixCol('#2B3260', '#F3C2B0', V.storm[1]), lt: mixCol('#4A5384', '#FFE2D2', V.storm[1]) });
    backdrop(t, 0, null, { tree: C.tree, treeDk: C.treeDk, hedge: C.hedge, band: C.treeDk, pole: C.pole, wire: C.wire, sway: 14 * (V.wind || 0) });
    const common = { plinth: C.plinth, frame: C.frame, glass: C.glass, step: C.step, doorGlow: 0, room: C.room };
    house(...SET.her, { side: 'her', wall: C.wallHer, roof: C.roofHer, door: C.doorHer, curtain: C.curtainHer, ...common, ...(WS.her || {}) });
    house(...SET.his, { side: 'his', wall: C.wallHis, roof: C.roofHis, door: C.doorHis, curtain: C.curtainHis, lived: 1, ...common, ...(WS.his || {}) });
    yard(t, { ground: C.ground, groundDk: C.groundDk, grass: C.grass, pebble: C.pebble, wind: 2 * (V.wind || 0) });
    if (V.litter) leafLitter(V.litter, { skip: V.litterSkip || ((x, y) => Math.abs(x - CUT[0]) < 60 && y < G + 50) });
    if (V.ground) V.ground();
    clothesline();
    fence({ fence: C.fence, fenceDk: C.fenceDk });
    if (V.cat && V.cat.on === 'fence') cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' });
    if (V.cat && V.cat.on === 'ground') V.cast.push([V.cat.y, () => cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' })]);
    const P = V.plant, plant = () => cutting(...CUT, P.s, { g: P.g, sway: P.sway ?? .03 * Math.sin(t * 1.1), bud: P.bud ?? 1, budAge: 9, buds: P.buds, bloom: P.bloom });
    if (P.behind) plant();
    V.cast.filter(Boolean).sort((a, b) => a[0] - b[0]).forEach(c => c[1]());
    if (!P.behind) plant();
    if (V.cat && !['fence', 'ground'].includes(V.cat.on)) cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' });
    if (V.fx) V.fx();
    if (V.fall) leafFall(t, V.fall, { seed: V.seed || 0, wind: 1 + 3 * (V.wind || 0) });
    camEnd();
    if (V.grade) grade(1, V.grade[0], V.grade[1]);
  }
  // the cutting's tip (where its first bud sits), for a plant { g, s, sway } at time t
  const tipOf = (t, P) => { const h = (3.4 + 2.6 * P.g) * P.s, sw = (P.sway ?? .03 * Math.sin(t * 1.1)) + .04 * Math.sin(t * 1.3); return [CUT[0] + sw * h * .45, CUT[1] - h]; };
  // a wind-driven seam: a brush wipe in the season's leaf colours, with leaves riding its moving edges (stage 3's)
  function leafWipe(p, cols, leaves) {
    if (p <= 0 || p >= 1) return;
    brushWipe(p, cols);
    const n = 5, bh = (H + 420) / n + 40;
    push(); translate(W / 2, H / 2); rotate(-.1); translate(-W / 2, -H / 2);
    for (let i = 0; i < n; i++) {
      const d = [0, .14, .06, .18, .1][i], y0 = -230 + i * (H + 420) / n;
      const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
      if (q <= 0 || q >= 1) continue;
      const ex = lerp(-300, W + 400, q);
      for (let j = 0; j < 4; j++) {
        boilSeed('wipe leaf ' + i + ' ' + j);
        leafAt(ex + 50 * hash(i * 4 + j) - 10, y0 + bh * (j + .5) / 4 + 14 * Math.sin(p * 18 + j), 20 + 12 * hash(i * 7 + j), (p * 12 + i * 1.3 + j) * (hash(j + i * 3) > .5 ? 1 : -1), leaves[(i + j) % leaves.length]);
      }
    }
    pop();
  }

  // =====================================================================================================
  // A. He goes away for a while (161.25–169.07)
  // =====================================================================================================
  const A_FENCE = 1185, A_OFF = 165.8, A_BACK = [167.05, 167.8];
  const H_A = [
    [T0, 'happy', { lookX: .8 }],                                                                   // the morning greeting at the fence
    [163.0, 'confused', { lookX: 1 }],                                                               // the bag?
    [B(194) + .12, 'sad', { lookX: 1, lookY: .2, emote: null, gloom: .15, tint: null }],            // he's going away
    [B(195), 'hopeful', { lookX: 1 }],                                                               // a brave smile
    [165.2, 'happy', { lookX: 1 }],                                                                  // waving him off
    [166.75, 'hopeful', { lookX: 1 }],                                                               // watching him go
  ];
  const C_A = [
    [T0, 'happy', { lookX: 1 }],                                                                     // walking over to her
    [B(193) + .08, 'neutral', { lookX: -1, mouth: 'smile' }],                                        // pointing down the lane: that way
    [164.05, 'sheepish'],                                                                            // for a little while
    [B(195) + .05, 'happy', { lookX: 1 }],                                                           // see you soon
    [A_OFF + .2, 'happy', { lookX: 1 }],
  ];
  function hisA(t) {
    const mood = emotions(t, C_A, { take: .8 });
    let x = A_FENCE, p, dy = 0, tilt = 0;
    if (t < 163.05) {   // on his way over from his door, facing her
      const w = walkTo(t, T0 - .9, 163.05, 1560, A_FENCE, U); x = w.x;
      p = { view: 'q', flip: true, walk: w.walk }; dy += w.dy; tilt = .06 * Math.sin((w.walk || 0) * TAU) + .05 * spring(t, 163.05, 5, 14);
    } else if (t < A_OFF) {
      p = { view: 'q', flip: true }; tilt = .05 * spring(t, 163.05, 5, 14);
    } else {   // off down the lane to the right, a look back and a wave, and gone
      const w1 = walkTo(t, A_OFF + .15, A_BACK[0], A_FENCE, 1395, U), w2 = walkTo(t, A_BACK[1], 168.95, 1395, 1700, U);
      x = t < A_BACK[1] ? w1.x : w2.x;
      const w = t < A_BACK[1] ? w1 : w2;
      if (t < A_OFF + .15) p = turn(t, A_OFF, A_OFF + .15, -.125, .125);
      else if (t < A_BACK[0]) p = { view: 'q', walk: w.walk };
      else if (t < A_BACK[1]) p = t < A_BACK[0] + .14 ? turn(t, A_BACK[0], A_BACK[0] + .14, .125, -.125) : t < A_BACK[1] - .14 ? { view: 'q', flip: true } : turn(t, A_BACK[1] - .14, A_BACK[1], -.125, .125);
      else p = { view: 'q', walk: w.walk };
      dy += w.dy; tilt = -.06 * Math.sin((w.walk || 0) * TAU) + .05 * spring(t, A_BACK[0], 5, 14);
    }
    const o = addPose(mood, { ...p, dy });
    if (t > B(193) && t < 164.1) { const k = ease(seg(t, B(193), B(193) + .2)) * (1 - ease(seg(t, 163.95, 164.1))); o.aL = lerp(o.aL ?? .2, .32 + .06 * Math.sin(t * 9), k); }   // pointing down the lane
    const [w, wa] = wave(t, B(195) + .1, A_OFF, 2.4); if (w > 0) o.aR = lerp(o.aR ?? .2, wa, w);
    const [w2, wa2] = wave(t, A_BACK[0] + .1, A_BACK[1] - .1, 2.6); if (w2 > 0) o.aR = lerp(o.aR ?? .2, wa2, w2);
    o.draw = travelHook(tilt);
    return { x, y: G, o };
  }
  function herA(t) {
    const mood = emotions(t, H_A, { take: .8 }), o = addPose(mood, { view: 'q' });
    const [w, wa] = wave(t, 165.15, 166.6, 2.4); if (w > 0) o.aR = lerp(o.aR ?? .2, wa, w);
    const [w2, wa2] = wave(t, A_BACK[0] + .2, A_BACK[1] + .2, 2.8); if (w2 > 0) o.aR = lerp(o.aR ?? .2, wa2, w2);
    return { x: 845, y: G, o };
  }
  const CAM_A = [[T0, [1110, 796, 1.48]], [162.9, [1020, 806, 1.75]], [165.7, [1025, 806, 1.77]], [167.3, [975, 806, 1.85]], [T_LEAVES, [930, 808, 1.98]]];
  function departure(t, lt) {
    const h = herA(t), c = hisA(t), look = t < 162.4 ? .2 : t < 165.8 ? .6 : 1;
    yardScene(t, {
      C: setCols(.95, 'autumn'), skyPal: SKIES.autumn, clouds: 5, drift: 9000 + 18 * t, sun: [520, 240, 48, 1, '#FFE2B0', '#FFF2D8'], grade: TINTS.autumn.slice(2),
      cat: fenceCat({ pose: 'sit', eyes: 'open', look }), litter: 46, fall: .5, seed: 9,
      plant: { g: .8, s: 30, buds: [1, 1, 1, 1, 1, 1] },
      cast: [herDraw(h.x, h.y, h.o), hisDraw(c.x, c.y, c.o)],
    }, camAt(t, CAM_A));
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#C9662F', '#E8B04A']);                                         // stage 3's autumn wipe drags off
    if (t > T_LEAVES - .3) leafWipe((t - (T_LEAVES - .3)) / .6, ['#C9702F', '#E09A45'], ['#D9823F', '#E8B04A', '#C9662F']);
  }

  // =====================================================================================================
  // B. The days without him: the leaves (169.07–175.82), a rainy night at her window (175.82–182.57)
  // =====================================================================================================
  // the leaves the wind has drifted into his yard: [x, y, size, angle, colour]
  const DRIFT = []; for (let i = 0; i < 64; i++) DRIFT.push([1105 + 800 * hash(i * 7.13 + 3), G - 8 + 150 * Math.pow(hash(i * 3.71 + 1), 1.4), 7 + 4 * hash(i * 2.9), (hash(i * 5.3) - .5) * 2.4, LEAF_COLS[i % LEAF_COLS.length]]);
  const PUSH = [169.35, 171.3], PX = [1080, 1248], PILE = [1385, G - 3], SHOVE = 171.3;
  const pushX = t => t < PUSH[0] + .3 ? lerp(PX[0], PX[0] + 22, easeIn(seg(t, PUSH[0], PUSH[0] + .3))) : lerp(PX[0] + 22, PX[1], seg(t, PUSH[0] + .3, PUSH[1]));
  const frontOf = t => pushX(Math.min(t, PUSH[1])) + 3.1 * HU;
  const inLane = L => L[1] < G + 46 && L[0] < PILE[0] - 40;
  const swept = (L, t) => inLane(L) && t > PUSH[0] - .05 && L[0] < frontOf(t);
  // the heap of leaves by his wall: size 0..1 grows with every shove (it was already there from the days before)
  const pileK = t => .62 + .2 * ease(seg(t, SHOVE, SHOVE + .25)) + .05 * spring(t, SHOVE + .1, 6, 16);
  function leafPile(t, k, o = {}) {
    const [px, py] = o.at || PILE, w = 62 + 36 * k, h = 30 + 34 * k;
    boilSeed('pile');
    paint(ellPts(px, py + 6, w * 1.1, 12, 16), { fill: PAL.ink, fillOp: 70, bleed: .25, ink: null });
    paint([...Array(14)].map((_, i) => { const a = Math.PI + i / 13 * Math.PI; return [px + Math.cos(a) * w, py + Math.sin(a) * h + 4]; }), { wash: o.col || '#C98A47', fill: '#9C5E2E', fillOp: 60, bleed: .1, tex: .6, ink: PAL.ink, sw: .6, curv: .5 });
    const n = Math.round(26 + 34 * k);
    for (let i = 0; i < n; i++) {
      boilSeed('pile leaf ' + i);
      const a = Math.PI + (.06 + .88 * hash(i * 3.3 + 1)) * Math.PI, r = Math.sqrt(hash(i * 7.7 + 2));
      leafAt(px + Math.cos(a) * w * r * .95, py + Math.sin(a) * h * r * .95 + 2, 8 + 4 * hash(i * 1.9), (hash(i * 5.1) - .5) * 3, LEAF_COLS[(i * 2) % LEAF_COLS.length]);
    }
  }
  // her bulldozer push: a heap of swept leaves growing in front of her body (count = leaves swept so far)
  function pushHeap(t) {
    if (t < PUSH[0] || t > SHOVE + .2) return;
    const n = DRIFT.filter(L => swept(L, t)).length, f = frontOf(t), into = seg(t, SHOVE, SHOVE + .2);
    const L = 42 + 1.2 * n, h = 24 + .8 * n, x0 = f - 8 + 40 * into;
    boilSeed('heap');
    paint([...Array(10)].map((_, i) => { const a = Math.PI + i / 9 * Math.PI; return [x0 + L / 2 + Math.cos(a) * L / 2 * 1.15, G + 4 + Math.sin(a) * h]; }), { wash: '#C98A47', fill: '#9C5E2E', fillOp: 50, bleed: .1, tex: .6, ink: null, curv: .5 });
    for (let i = 0; i < n + 16; i++) {
      boilSeed('heap leaf ' + i);
      const u = hash(i * 2.7 + 5), v = hash(i * 4.1 + 9), tumble = Math.sin(t * 7 + i) * .4;
      leafAt(x0 + L * u, G + 4 - h * v * Math.sin(Math.PI * u) * 1.1, 8 + 3 * hash(i), tumble + i, LEAF_COLS[(i * 3) % LEAF_COLS.length]);
    }
    for (let i = 0; i < 3; i++) {   // a few roll off the top as she goes
      const ph = frac(t * 1.8 + i / 3), lx = x0 + L * (.4 + .7 * ph), ly = G - h + h * ph * ph;
      boilSeed('roll ' + i); leafAt(lx, ly, 8, ph * 9 + i, LEAF_COLS[i]);
    }
  }
  // the shove: leaves flung up off the heap as it lands on the pile
  function shoveLeaves(t) {
    const a = t - SHOVE; if (a < 0 || a > .9) return;
    for (let i = 0; i < 6; i++) {
      boilSeed('flung ' + i);
      const k = a / .9, p = arcPt([PILE[0] - 30, G - 30], [PILE[0] - 60 + 100 * hash(i * 3.1), G - 50 - 40 * hash(i)], 60 + 50 * hash(i * 2), k);
      leafAt(p[0], p[1], 9, k * 8 + i, LEAF_COLS[i % LEAF_COLS.length]);
    }
  }
  const H_B1 = [
    [T_LEAVES, 'determined'],
    [SHOVE + .15, 'relieved'],                                                                         // done: a breath, a sweat drop
    [172.15, 'hopeful', { lookY: -1, lookX: -.15 }],                                                   // up at his window
    [172.95, 'sad', { lookY: -.8, lookX: -.15, emote: null, gloom: .12, tint: null }],                 // his curtains are drawn
    [173.55, 'neutral', { lookX: 1 }],                                                                 // the cat on his doorstep
    [174.25, 'hopeful', { lookX: 1, lookY: -.1 }],                                                     // both look down the lane
  ];
  function herB1(t) {
    const mood = emotions(t, H_B1, { take: .8 });
    let x = pushX(Math.min(t, PUSH[1])), p, dy = 0, sq = 0, rot = 0;
    if (t < SHOVE) {   // bulldozing: low, leaning in, legs going
      const steps = Math.abs(x - PX[0]) / (1.6 * HU);
      p = { view: 'side', walk: steps }; dy -= .35 * Math.abs(Math.sin(steps * Math.PI)); rot = .2 + .03 * Math.sin(steps * TAU); sq = .05;
    } else {   // the last shove, a step back, then turned to his window and the lane
      const j = jump(t, SHOVE - .05, SHOVE + .2, .5); dy += j.dy; sq += j.sq;
      rot = .2 * (1 - ease(seg(t, SHOVE + .15, SHOVE + .5)));
      x -= 26 * ease(seg(t, SHOVE + .3, SHOVE + .7));
      p = t < 171.75 ? { view: 'side' } : turn(t, 171.75, 171.9, .25, 0);
    }
    const o = addPose(mood, { ...p, dy, sq, rot, shadowDx: 1.6, shadowW: 1.3 });
    if (t < SHOVE + .2) { o.aL = -.8; o.aR = -.75; }   // arms back: it's all body
    return { x, y: G, o };
  }
  const CAM_B1 = [[T_LEAVES, [1290, 815, 1.65]], [171.5, [1330, 808, 1.68]], [172.3, [1370, 778, 1.66]], [173.4, [1440, 798, 1.6]], [T_NIGHT, [1450, 792, 1.56]]];
  function leavesDay(t, lt) {
    const h = herB1(t), gloomy = ease(seg(t, 174.2, 175.8));
    const look = t < 173.45 ? 1 : t < 174.15 ? -1 : 1;
    yardScene(t, {
      C: mixSet(setCols(1, 'autumn'), setCols(1, 'dusk'), .35 + .4 * gloomy), skyPal: mixPal(SKIES.autumn, SKIES.sunset, .25), clouds: 5, drift: 9800 + 30 * t,
      sun: [430, 300, 48, 1 - .7 * gloomy, '#FFD8A8', '#FFF0D0'], storm: gloomy > .02 ? [.55 * gloomy, .6] : null, grade: TINTS.autumn.slice(2), wind: .25 * gloomy,
      wins: { his: { shut: 1 } }, litter: 30, litterSkip: (x, y) => x > 1090 || (Math.abs(x - CUT[0]) < 60 && y < G + 50), fall: .35, seed: 4,
      ground: () => {
        DRIFT.forEach((L, i) => { if (swept(L, t) || Math.abs(L[0] - PILE[0]) < 95 && L[1] < G + 30) return; boilSeed('drift ' + i); leafAt(L[0], L[1], L[2], L[3], L[4]); });
        leafPile(t, pileK(t));
      },
      cat: { on: 'ground', x: 1638, y: 903, o: { pose: 'loaf', eyes: 'open', look, headTilt: look < 0 ? .1 : 0, curl: .6 } },
      plant: { g: .8, s: 30, buds: [1, 1, 1, 1, 1, 1] },
      cast: [herDraw(h.x, h.y, h.o), [G + 1, () => pushHeap(t)], [G + 2, () => shoveLeaves(t)]],
    }, camAt(t, CAM_B1));
    boilSeed('transition');
    if (lt < .3) leafWipe(.5 + lt / .6, ['#C9702F', '#E09A45'], ['#D9823F', '#E8B04A', '#C9662F']);
    if (t > T_NIGHT - .6) rainWipe((t - (T_NIGHT - .6)) / 1.2);                                              // a rainy night pours in
  }

  // ---------- the rainy night (stage 3's window, her lamp and her signal) ----------
  const WIN = { x: 335, y: 805, u: HU * .85, hop: 1.65, lamp: [335, 598, 50], shade: '#F7D3DC', room: '#C98E5C', glow: .3 };
  const BONKS = [B(209), HB(209), B(210), HB(210)];   // off-on, off-on: their signal
  const lampOn = t => BONKS.filter(b => t >= b).length % 2 === 0;
  const SLEEP = [180.55, 181.35];
  const H_B2 = [
    [T_NIGHT, 'hopeful', { lookX: 1 }],                                                     // looking across at his window
    [B(209) - .3, 'determined', { lookX: 1 }],                                              // their signal
    [178.1, 'hopeful', { lookX: 1 }],                                                       // waiting for the answer
    [179.15, 'sad', { lookX: 1, lookY: .25, emote: null, gloom: .2, tint: null }],          // none
    [179.95, 'content', { lookX: .8, blush: .6 }],                                          // the lamp stays on for him
    [SLEEP[0], 'sleepy', { lookX: .5, emote: null }],
  ];
  function herWindow(t) {
    const mood = emotions(t, H_B2, { take: .7 });
    const hop = BONKS.reduce((s, b) => { const j = jump(t, b - .07, b + .27, WIN.hop); return [s[0] + j.dy, s[1] + j.sq]; }, [0, 0]);
    const o = { ...mood, view: 'front', seed: 2, noShadow: true, boilKey: 'her', tint: null };
    const sink = ease(seg(t, ...SLEEP));
    o.dy = Math.max(-.35, (mood.dy || 0) * .3) + hop[0] + lerp(0, 2.4 + .08 * Math.sin(t * 2.2), sink);
    o.sq = clamp((mood.sq || 0) * .35, -.03, .04) + hop[1]; o.rot = (mood.rot || 0) * .5 + .1 * sink; o.dx = (mood.dx || 0) * .3; o.take = 0;
    return { x: WIN.x, y: WIN.y, u: WIN.u, o, on: lampOn(t) };
  }
  function glints(t, q) {   // in the dark only her eyes show
    const o = q.o, u = q.u, sq = (o.sq || 0), r = o.rot || 0, c = Math.cos(r), s = Math.sin(r);
    const lx = (o.lookX || 0) * .5 * u, ly = (o.lookY || 0) * .4 * u, bx = q.x + (o.dx || 0) * u, by = q.y + (o.dy || 0) * u;
    for (const e of [-1, 1]) {
      const ex = (e * 2.5 * u + lx) * (1 + sq * .6), ey = (-6 * u + ly) * (1 - sq), wx = bx + ex * c - ey * s, wy = by + ex * s + ey * c;
      boilSeed('glint ' + e);
      paint(ellPts(wx, wy, .38 * u, .6 * u, 10), { wash: '#FFF1CF', ink: null });
    }
  }
  let BULB = [335, 664];
  function herRoom(t, q) {
    return () => {
      const top = topOf(q.x, q.y, q.u, q.o), [px, py, L] = WIN.lamp, lift = Math.max(0, py + L + 23 - top.y);
      const swing = BONKS.reduce((s, b, i) => s + (i % 2 ? .15 : -.2) * spring(t, b, 3, 9), 0) + .03 * Math.sin(t * .9);
      const lamp = pendant(px, py, L, swing, lift, q.on, { key: 'her', shade: q.on ? WIN.shade : mixCol(WIN.shade, DARK, .7) });
      BULB = lamp.bulb;
      if (q.on) { heroine(q.x, q.y, q.u, { ...q.o, emote: null }); glow(lamp.bulb[0], lamp.bulb[1] + 4, 130, '#FFD9A0', .45); }
      else { heroine(q.x, q.y, q.u, { ...q.o, tint: null, blush: 0, emote: null, gloom: 0, shade: .76, shadeCol: DARK }); glints(t, q); }
    };
  }
  const CAM_B2 = [
    [T_NIGHT, [336, 721, 2.5]], [177.95, [338, 722, 2.55]], [178.75, [845, 726, 1.42]], [179.4, [845, 726, 1.42]],
    [180.45, [336, 718, 2.45]], [181.75, [336, 702, 2.6]], [T_DAY - .3, [335, 676, 2.85]], [T_DAY, [335, 676, 2.85]],
  ];
  function rainyNight(t, lt) {
    const q = herWindow(t), [cx, cy, z] = camAt(t, CAM_B2);
    camBegin(cx, cy, z);
    sky(t, 1, { pal: NIGHT.sky, clouds: 0 });
    stormClouds(t, 1, { col: '#2B3260', lt: '#4A5384' });
    backdrop(t, 1, null, { tree: NIGHT.tree, treeDk: NIGHT.treeDk, hedge: NIGHT.hedge, band: NIGHT.treeDk, pole: NIGHT.pole, wire: NIGHT.wire, sway: 6 });
    screenSpace(() => rainScreen(t, { n: 40, len: 26, speed: 900, slant: -.12, col: '#5D6C9A', w: .55, seed: 21 }));
    const nightHouse = { plinth: NIGHT.plinth, frame: NIGHT.frame, step: NIGHT.step, rainGlass: 1 };
    house(...SET.her, { side: 'her', wall: NIGHT.wallHer, roof: NIGHT.roofHer, door: NIGHT.doorHer, ...nightHouse,
      curtain: q.on ? NIGHT.curtainHer : mixCol(NIGHT.curtainHer, DARK, .65), curtainW: .06, lit: q.on ? WIN.glow : 0, room: q.on ? WIN.room : DARK, inside: herRoom(t, q) });
    house(...SET.his, { side: 'his', wall: NIGHT.wallHis, roof: NIGHT.roofHis, door: NIGHT.doorHis, ...nightHouse, lived: 1, glass: '#2E3658', shut: 1, curtain: mixCol(NIGHT.curtainHis, DARK, .6) });
    yard(t, { ground: NIGHT.ground, groundDk: NIGHT.groundDk, grass: NIGHT.grass, pebble: NIGHT.pebble, wind: .4 });
    puddles([[560, G + 46, 120], [330, G + 110, 160]], { light: q.on ? .8 : 0 });
    puddles([[1260, G + 70, 150], [1700, G + 40, 90]]);
    clothesline();
    fence({ fence: NIGHT.fence, fenceDk: NIGHT.fenceDk });
    cutting(...CUT, 30, { g: .8, sway: -.05 + .03 * Math.sin(t * 2), bud: 1, budAge: 9, buds: [1, 1, 1, 1, 1, 1] });
    splashes(t, 200, 1900, G + 8, G + 160, { n: 22, col: '#93A5D2' });
    if (t > SLEEP[1]) emote('zzz', 440, 650, 15, seg(t, SLEEP[1], SLEEP[1] + .3), t - SLEEP[1]);
    camEnd();
    rainScreen(t, { n: 44, len: 46, speed: 1300, slant: -.1, col: '#A9BADD', w: .75, seed: 22 });
    grade(1, '#1A2044', 40);
    boilSeed('transition');
    if (lt < .6) rainWipe(.5 + lt / 1.2);                                                                    // the rain wipe drains away
    if (t > T_DAY - .3) { const [sx, sy] = toScreen(BULB[0], BULB[1], LAST_CAM); iris(sx, sy, lerp(1500, 0, easeIn(seg(t, T_DAY - .3, T_DAY))), '#1E2350'); }
  }

  // =====================================================================================================
  // C. An afternoon, a cloud like him, and home at sunset (182.57–215.625)
  // =====================================================================================================
  const SUN0 = [560, 250], IRIS_AT = [960, 506];   // the iris opens where it closed on her lamp, now around the sun
  const SUNSET = t => ease(seg(t, 185.8, 190.2));
  const cloudX = t => kf(t, [[T_DAY, 735], [184.6, 770], [186.6, 930], [189.4, 1830]], x => x);
  const cloudY = t => 335 + 25 * seg(t, 186.6, 189.4);
  // a cloud shaped just like him: a blocky body, four stubby legs, two arm puffs, two slit eyes of sky
  function himCloud(x, y, s, C) {
    boilSeed('him cloud');
    const pts = [], bump = (i, n) => 1 + .05 * Math.sin(i * 2.3);
    const rr = rrPts(x - 5 * s, y - 8 * s, 10 * s, 6 * s, 1.6 * s);
    rr.forEach(([px, py], i) => { const dx = px - x, dy = py - (y - 5 * s); pts.push([x + dx * bump(i), y - 5 * s + dy * bump(i)]); });
    for (const lx of [-4, -2, 1, 3]) paint(rrPts(x + (lx - .1) * s, y - 2.6 * s, 1.3 * s, 2.6 * s, .6 * s), { wash: C.cloud, washOp: 235, fill: mixCol(C.top, PAL.indigo, .12), fillOp: 30, bleed: .2, ink: null });
    for (const sx of [-1, 1]) paint(ellPts(x + sx * 5.5 * s, y - 4.6 * s, 1.3 * s, .6 * s, 12), { wash: C.cloud, washOp: 235, ink: null });
    paint(pts, { wash: C.cloud, washOp: 240, fill: mixCol(C.top, '#FFFFFF', .2), fillOp: 60, bleed: .2, tex: .3, ink: null, curv: .5 });
    paint(ellPts(x, y - 2.5 * s, 4.6 * s, .6 * s, 14), { fill: mixCol(C.top, PAL.indigo, .15), fillOp: 45, bleed: .3, ink: null });
    for (const ex of [-2.5, 2.5]) paint(rrPts(x + (ex - .45) * s, y - 7 * s, .9 * s, 1.9 * s, .4 * s), { wash: mixCol(C.top, C.cloud, .35), washOp: 220, ink: null });
  }
  // her: watching the sky against the fence post; up at the commotion; bouncing at the fence; then face to face with him
  const UP = [192.35, 192.75], MEET = 195.15, SMELL = [202.85, 206.3], NEAR = [209.08, 212.9], TOUCH = B(253);
  const LAND = B(246), FLY = [206.35, LAND];
  const H_C = [
    [T_DAY, 'hopeful', { lookY: -1, lookX: -.2 }],                                          // gazing up at a cloud that looks just like him
    [184.95, 'shy', { lookY: -1, lookX: -.1, mouth: 'cat', blush: 1 }],                     // and smiles, blushing
    [185.75, 'love', { lookY: -.9, lookX: -.1, tint: null }],                               // she misses him
    [187.0, 'happy', { lookY: -.9, lookX: .7 }],                                            // following it across the sky
    [188.3, 'content', { blush: .6 }],                                                      // dreaming
    [191.6, 'surprised', { lookX: 1 }],                                                     // the commotion: it's him!
    [192.15, 'excited', { lookX: 1 }],
    [MEET, 'happy', { lookX: 1 }],
    [196.07, 'shy', { lookX: .5, lookY: .55, blush: 1 }],                                    // cheeks like ripe tomatoes
    [197.65, 'happy', { lookX: 1, blush: 1 }],
    [199.45, 'neutral', { lookX: .8, lookY: .9 }],                                           // a glance down at the cutting
    [B(237) + .15, 'surprised', { lookX: .8, lookY: .9, emote: null }],                      // it's opening!
    [201.25, 'starstruck', { lookX: .6, lookY: .7 }],
    [SMELL[0], 'content', { blush: .7 }],                                                    // she leans in to smell it
    [FLY[0] + .1, 'surprised', { lookX: .6, lookY: -.6, emote: null }],                      // the breeze
    [LAND + .05, 'surprised', { lookY: -1, emote: null }],                                   // something landed on her head
    [208.4, 'happy', { lookX: 1, blush: .8 }],
    [209.35, 'surprised', { lookX: 1, emote: null }],                                        // he's leaning in!
    [209.85, 'stubborn'],                                                                    // the stubborn pout
    [210.95, 'smug', { eyes: ['closed', 'normal'], lookX: 1, blush: .9 }],                   // a peek
    [211.4, 'laugh'],
    [212.4, 'happy', { lookX: 1, blush: .9 }],
    [TOUCH, 'content', { blush: 1 }],
  ];
  const C_C = [
    [T_HOME, 'content', { lookX: 1 }],                                                      // home down the lane
    [190.95, 'surprised', { lookX: 1, lookY: .5 }],                                         // the cat comes running
    [191.7, 'laugh'],
    [192.25, 'excited', { lookX: 1, emote: null }],                                         // and there she is
    [MEET, 'happy', { lookX: 1 }],
    [196.3, 'shy', { lookX: .4, lookY: .5, blush: 1 }],
    [197.85, 'happy', { lookX: 1, blush: .8 }],
    [200.7, 'surprised', { lookX: .6, lookY: .8, emote: null }],
    [201.4, 'starstruck', { lookX: .6, lookY: .7 }],
    [202.95, 'happy', { lookX: 1 }],
    [204.0, 'love', { lookX: 1 }],                                                          // watching her smell it
    [FLY[0] + .15, 'surprised', { lookX: .6, lookY: -.5, emote: null }],
    [208.15, 'starstruck', { lookX: 1 }],                                                   // the flower in her hair
    [NEAR[0], 'kissy'],                                                                     // he leans in
    [210.3, 'nervous', { lookX: 1 }],                                                       // ...the pout: frozen, sweating
    [211.6, 'laugh'],
    [212.5, 'happy', { lookX: 1, blush: .9 }],
    [TOUCH + .05, 'content', { blush: 1 }],
  ];
  function herC(t) {
    const mood = emotions(t, H_C, { take: .8 });
    let x = 852, p, dy = 0, rot = 0, sq = 0;
    if (t < UP[0]) { p = { view: 'front', noLegs: true }; dy += 2.25; rot += .05; }                            // sitting against the post
    else if (t < UP[1]) { const k = seg(t, UP[0], UP[1]); dy += lerp(2.25, 0, k) - 2.2 * Math.sin(Math.PI * k); p = { view: 'front', noLegs: k < .3 }; }   // up!
    else {
      x = lerp(852, 878, ease(seg(t, UP[1], UP[1] + .4)));
      p = t < UP[1] + .2 ? turn(t, UP[1], UP[1] + .2, 0, .125) : { view: 'q' };
      if (t > UP[1] && t < UP[1] + .16) sq += .18 * Math.exp(-(t - UP[1]) * 9);
      rot += .3 * ease(seg(t, SMELL[0], SMELL[0] + .45)) * (1 - ease(seg(t, SMELL[1], SMELL[1] + .4)));      // leaning in to smell it
      rot -= .1 * ease(seg(t, 209.85, 210.1)) * (1 - ease(seg(t, 211.3, 211.7)));                            // chin up: the pout
      rot += .12 * ease(seg(t, 212.9, TOUCH));                                                              // leaning toward him for the touch
    }
    const o = addPose(mood, { ...p, dy, rot, sq, shadowDx: 2.6 * ease(seg(t, 186, 190)), shadowW: 1 + .5 * ease(seg(t, 186, 190)) });
    if (t > LAND) o.draw = sprigHook(t - LAND);
    if (t > LAND && t < LAND + .45) o.sq = (o.sq || 0) + .12 * Math.exp(-(t - LAND) * 9) * Math.cos((t - LAND) * 20);
    if (t > 212.9) { const k = ease(seg(t, 212.9, TOUCH)); o.aR = lerp(o.aR ?? .2, .12, k); }                  // reaching across for his arm tip
    return { x, y: G, o };
  }
  function hisC(t) {
    const mood = emotions(t, C_C, { take: .8 });
    let x, p, dy = 0, rot = 0, tilt = 0;
    const w1 = walkTo(t, T_HOME - .6, 191.05, 2420, 1850, U), w2 = walkTo(t, 192.2, MEET - .05, 1850, 1158, U);
    const w = t < 192.2 ? w1 : w2; x = w.x;
    if (w.moving) { p = { view: 'q', flip: true, walk: w.walk }; dy += w.dy; tilt = .06 * Math.sin((w.walk || 0) * TAU); }
    else p = { view: 'q', flip: true };
    tilt += .05 * spring(t, 191.05, 5, 14) - .08 * spring(t, CAT_ON, 6, 16) + .05 * spring(t, MEET, 5, 14);
    rot -= .32 * ease(seg(t, NEAR[0], NEAR[0] + .5)) * (1 - ease(seg(t, 211.6, 212.2)));                      // leaning in for a kiss
    rot -= .12 * ease(seg(t, 212.9, TOUCH));
    const o = addPose(mood, { ...p, dy, rot, shadowDx: 2.6 * ease(seg(t, 186, 190)), shadowW: 1.5 });
    if (t > CAT_ON && t < CAT_ON + .4) o.sq = (o.sq || 0) + .14 * Math.exp(-(t - CAT_ON) * 8) * Math.cos((t - CAT_ON) * 18);   // the cat lands
    if (t > 212.9) { const k = ease(seg(t, 212.9, TOUCH)); o.aR = lerp(o.aR ?? .2, .12, k); }
    o.draw = travelHook(tilt); o.bagTilt = tilt;
    return { x, y: G, o };
  }
  // the cat: asleep on the leaf heap; it sees him first, runs and leaps up onto his bag
  const CAT_WAKE = 190.45, CAT_RUN = [190.75, 191.2], CAT_ON = 191.6;
  function catC(t) {
    const heapTop = [PILE[0] + 4, PILE[1] - 30 - 34 * .87 + 6];
    if (t < CAT_WAKE + .25) return { on: 'heap', x: heapTop[0], y: heapTop[1], o: { pose: 'loaf', eyes: t < CAT_WAKE ? 'closed' : 'wide', look: t < CAT_WAKE ? 0 : 1, curl: t < CAT_WAKE ? 1 : .4, noShadow: true } };
    const c = hisC(t), [bx, by] = bodyPt(c.x, c.y, U, c.o, -2.4 + 2.6 * Math.sin(c.o.bagTilt || 0), -8 - 2.6 * Math.cos(c.o.bagTilt || 0));
    if (t < CAT_RUN[0]) { const k = seg(t, CAT_WAKE + .25, CAT_RUN[0]), p = arcPt(heapTop, [heapTop[0] + 60, G], 40, k); return { on: 'air', x: p[0], y: p[1], o: { pose: 'leap', rot: .2 } }; }
    if (t < CAT_RUN[1]) { const x = lerp(heapTop[0] + 60, c.x - 90, seg(t, CAT_RUN[0], CAT_RUN[1])); return { on: 'ground', x, y: G + 6, o: { pose: 'walk', walk: (x - heapTop[0]) / (2.4 * CS), look: .4 } }; }
    if (t < CAT_ON) { const k = seg(t, CAT_RUN[1], CAT_ON), p = arcPt([c.x - 90, G + 6], [bx, by], 70, k); return { on: 'air', x: p[0], y: p[1], o: { pose: 'leap', rot: lerp(-.3, .1, k), noShadow: true } }; }
    const a = t - CAT_ON, r = (c.o.rot || 0) + (c.o.bagTilt || 0);
    return { on: 'him', x: bx, y: by, o: a < .4 ? { pose: 'stand', rot: r, sq: .16 * Math.exp(-a * 8) * Math.cos(a * 16), look: -.4, noShadow: true }
      : { pose: 'loaf', flip: true, rot: r, eyes: t > 210.0 && t < 211.2 ? 'open' : 'closed', look: .6, curl: ease(seg(a, .4, .9)), noShadow: true } };
  }
  // the bloom: the tip and the six buds open on three beats, each with a little twinkle
  const OPEN = [B(237), B(238), B(239)], openK = (t, i) => seg(t, OPEN[i], OPEN[i] + .4);
  const plantC = t => {
    const gust = ease(seg(t, FLY[0] - .1, FLY[0] + .2)) * (1 - ease(seg(t, FLY[0] + .6, FLY[0] + 1.3)));
    return { behind: true, g: .82, s: 30, sway: .03 * Math.sin(t * 1.1) - .14 * gust * (1 + .3 * Math.sin(t * 9)), bud: t < OPEN[0] ? 1 : 0, buds: [1, 1, 1, 1, 1, 1],
      bloom: [openK(t, 0), openK(t, 1), openK(t, 1), openK(t, 2), openK(t, 2), openK(t, 2)] };
  };
  function bloomFx(t, P) {
    const [tx, ty] = tipOf(t, P);
    if (t > OPEN[0] && t < FLY[0]) jasmineCluster(tx, ty - 5, -Math.PI / 2, 10, openK(t, 0), 7);            // the tip's flowers
    OPEN.forEach((o, i) => {   // twinkles as they open
      const a = t - o; if (a < 0 || a > 1.1) return;
      for (let j = 0; j < 4; j++) { const an = j * TAU / 4 + .4 + i, k = seg(a, 0, 1.1); boilSeed('twinkle ' + i + ' ' + j); paint(starPts(tx + (i - 1) * 26 + Math.cos(an) * (12 + 26 * k), ty + 30 * i + Math.sin(an) * (12 + 26 * k), 7 * (1 - k), .3, 4), { wash: PAL.cream, ink: null }); }
    });
    if (t > SMELL[0] + .3 && t < SMELL[1]) for (let i = 0; i < 4; i++) {   // the scent, curling up to her
      boilSeed('scent ' + i);
      const ph = frac(t * .8 + i / 4), a = Math.sin(Math.PI * ph), px = lerp(tx - 10, tx - 60, ph) + 8 * Math.sin(t * 3 + i), py = lerp(ty + 20, ty - 40, ph), S = [];
      for (let q = 0; q < 6; q++) S.push([px + 6 * Math.sin(q * 1.2 + t * 4 + i), py - q * 7]);
      inkLine(S, 1.1 * a, '#FFF6E2', 'inkfine', .6);
    }
  }
  function sprigFlight(t, P, h) {
    if (t < FLY[0] || t >= FLY[1]) return;
    const k = seg(t, FLY[0], FLY[1]), [tx, ty] = tipOf(FLY[0], P), end = bodyPt(h.x, h.y, HU, h.o, 1.3, -9.0), p = arcPt([tx, ty - 4], end, 90, easeOut(k) * .4 + k * .6);
    boilSeed('sprig flight');
    jasmineCluster(p[0], p[1], -Math.PI / 2 + Math.sin(k * 9) * .8 + k * 3, 10, 1, 9);
  }
  function breezeFx(t) {
    const a = t - FLY[0]; if (a < -.1 || a > 1.6) return;
    for (let i = 0; i < 3; i++) {   // soft wind lines over their heads
      const k = (a - i * .12) / 1.1; if (k < 0 || k > 1) continue;
      boilSeed('breeze streak ' + i);
      const x = lerp(1240, 700, k), y = 690 + 22 * i + 8 * Math.sin(k * 6 + i), P = [];
      for (let j = 0; j <= 6; j++) P.push([x + j * 26, y + 4 * Math.sin(j * 1.3 + t * 6 + i)]);
      inkLine(P, .9 * Math.sin(Math.PI * k), '#FFF6E6', 'inkfine', .6);
    }
  }
  function heartRise(t) {
    const a = t - (TOUCH + .1); if (a < 0) return;
    const k = seg(a, 0, .3) * (1 - seg(a, 1.3, 1.6)); if (k <= 0) return;
    boilSeed('touch heart');
    emote('heart', 998, 815 - 60 * seg(a, 0, 1.6), 12, k, a);
  }
  function petalsUp(t) {
    const a = t - 214.4; if (a < 0) return;
    for (let i = 0; i < 9; i++) {
      boilSeed('petal up ' + i);
      const ph = clamp(a * (.5 + .3 * hash(i)) - hash(i * 3) * .3); if (ph <= 0) continue;
      const x = 940 + 90 * hash(i * 7) - 260 * ph + 30 * Math.sin(t * 3 + i), y = 800 - 280 * ph + 20 * Math.sin(t * 4 + i * 2);
      push(); translate(x, y); rotate(t * 3 + i); paint(ellPts(0, 0, 5, 8, 8), { wash: '#FFFDF6', ink: PAL.ink, sw: .3 }); pop();
    }
  }
  const CAM_C = [
    [T_DAY, [SUN0[0], SUN0[1] + 34 / 1.35, 1.35]], [183.5, [700, 290, 1.5]], [183.75, [700, 292, 1.5]], [184.65, [858, 842, 1.95]], [186.45, [860, 845, 1.98]], [187.75, [1200, 430, 1.18]],
    [189.3, [1390, 752, 1.18]], [190.9, [1395, 758, 1.2]], [192.7, [1240, 778, 1.32]], [195.2, [1012, 800, 1.7]], [197.0, [1006, 800, 1.95]],
    [199.45, [1004, 804, 2.0]], [200.4, [985, 834, 2.22]], [202.6, [985, 830, 2.2]], [203.6, [975, 818, 2.05]], [206.2, [972, 818, 2.05]],
    [207.95, [962, 812, 2.02]], [209.1, [1000, 806, 2.1]], [213.0, [1000, 803, 2.25]], [T_END, [1000, 801, 2.3]],
  ];
  function homecoming(t, lt) {
    const k = SUNSET(t), h = herC(t), c = hisC(t), ct = catC(t), P = plantC(t);
    const C = mixSet(setCols(1, 'autumn'), setCols(1, 'sunset'), k), pal = mixPal(SKIES.autumn, SKIES.sunset, k);
    const cast = [herDraw(h.x, h.y, h.o), hisDraw(c.x, c.y, c.o)];
    if (ct.on === 'heap') cast.push([PILE[1] + .5, () => cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' })]);   // asleep on top of the heap
    yardScene(t, {
      C, skyPal: pal, clouds: 4, drift: 10500 + 40 * t + 300 * k, grade: [mixCol(TINTS.autumn[2], TINTS.sunset[2], k), lerp(22, 40, k)],
      sun: [lerp(SUN0[0], 330, k), lerp(SUN0[1], 445, k), lerp(48, 54, k), 1, mixCol('#FFE2B0', '#FFC27A', k), mixCol('#FFF2D8', '#FFA24E', k)],
      skyFx: () => { if (t < 190.5) himCloud(cloudX(t), cloudY(t), 16, pal); },
      wins: { his: { shut: 1 } }, litter: 30, litterSkip: (x, y) => x > 1090 || (Math.abs(x - CUT[0]) < 60 && y < G + 50), fall: .25, seed: 5,
      ground: () => leafPile(t, .87 - .25 * ease(seg(t, CAT_WAKE + .25, CAT_WAKE + .6))),
      cat: ct.on === 'heap' ? null : ct,
      plant: P, cast,
      fx: () => { bloomFx(t, P); sprigFlight(t, P, h); breezeFx(t); heartRise(t); petalsUp(t); },
    }, camAt(t, CAM_C));
    boilSeed('transition');
    if (lt < .3) iris(...IRIS_AT, lerp(0, 1500, easeOut(seg(lt, 0, .3))), '#1E2350');                    // opening around the sun
    if (t > T_END - .3) petalWipe((t - (T_END - .3)) / .6);                                                // full cover at 215.625: stage 5 takes it off
  }

  shots([[T0, departure], [T_LEAVES, leavesDay], [T_NIGHT, rainyNight], [T_DAY, homecoming]]);
  // for checks: crop-at expressions (e.g. STAGE4.hisC(T).x) and logic tests
  window.STAGE4 = { hisA, herA, herB1, herWindow, herC, hisC, catC, plantC, tipOf, T_LEAVES, T_NIGHT, T_DAY, T_HOME, T_END };
})();
