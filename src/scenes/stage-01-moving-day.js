// stage-01-moving-day.js: STAGE 1 of 《隔壁》, song time 0.000–54.000 s (frames 0–1295). Intro + verse 1.
// Storyboard: docs/storyboard/stage-01.md. One continuous take in the lane, carried through the sky for the time skip.
//   0–27.3   Moving day. A summer morning. She tends the young 七里香 cutting at the fence. Clawd waddles in with three
//            boxes balanced on his flat top; the top box slides off, over the fence, onto HER head. A frozen blink.
//            She tips it back onto his stack; his thank-you bow nearly drops it again; she laughs.
//   27.3–33.4 The camera rises to the sparrows on the wire; clouds and the sun race across: days pass.
//   33.4–43.6 An afternoon. A gust lifts his shirt off the line and drops it over her. She peeks out, unimpressed,
//            and tips it back onto his head; he bows and bows until it slides off.
//   43.6–54   A stray cat walks the roof, drops onto the fence between them, ignores both of their invitations, and
//            settles on Clawd's head. He glows; she pouts, then giggles. A warm brush wipe hands over to stage 2.
// Every pose is a pure function of song time t. Nobody grips anything: boxes, shirt and cat ride on, drape over or slide
// off the flat tops (topOf), and arms only wave, pat and touch.
(() => {
  const U = 20, HU = U * HER_K, B = n => OFF + n * BEAT;   // Clawd's and her body units (world px); beat n's time
  const XH = 825;                                         // her spot by the fence, where she can reach the cutting
  const CUT = [968, G + 14];                              // the 七里香 cutting, at the fence foot
  const TSKIP = 28.4;                                     // the camera is up in the sky: the verse's afternoon state starts here

  // ---------- camera: [t, [cx, cy, zoom]] keys, eased; a small drift keeps it alive ----------
  const CAMK = [
    [0, [1000, 110, 1.2]], [B(1), [1000, 110, 1.2]], [B(6), [1000, 650, 1.0]], [5.9, [1000, 650, 1.0]],
    [6.85, [905, 812, 2.05]], [9.6, [912, 808, 2.05]], [11.6, [1100, 700, 1.12]], [14.5, [1100, 700, 1.12]],
    [16.2, [1040, 778, 1.75]], [20.4, [1040, 778, 1.75]], [21.6, [1045, 786, 1.88]], [25.6, [1045, 790, 1.92]],
    [28.4, [1000, 105, 1.2]], [30.7, [995, 98, 1.22]], [33.4, [1095, 722, 1.24]], [35.2, [1080, 726, 1.26]],
    [36.6, [960, 790, 1.62]], [37.6, [1010, 790, 1.78]], [39.9, [1010, 790, 1.78]], [40.8, [1065, 782, 1.7]],
    [43.25, [1060, 786, 1.8]], [44.3, [905, 690, 1.28]], [45.5, [925, 700, 1.3]], [46.6, [1030, 800, 1.75]],
    [50.1, [1035, 800, 1.75]], [51.2, [1050, 795, 1.9]], [54.4, [1052, 798, 2.0]],
  ];
  function cam(t) {
    const [cx, cy, z] = kf(t, CAMK);
    return [cx + 12 * Math.sin(t * .37), cy + 6 * Math.sin(t * .29 + 1), z * (1 + .006 * Math.sin(t * .23))];
  }
  const tod = t => ease(seg(t, 27.9, 30.9));                       // morning → afternoon, during the time skip

  // ---------- her ----------
  const HER_MOOD = [
    [0, 'content'], [6.0, 'happy'], [9.45, 'neutral', { lookX: .9, emote: '?' }], [11.6, 'hopeful', { lookX: .9 }],
    [17.15, 'surprised', { lookX: .8, lookY: -.7 }],
    [20.55, 'happy'], [24.25, 'laugh'], [26.6, 'happy'],
    [31.0, 'content'], [38.27, 'unimpressed', { lookX: .9 }], [41.2, 'smug', { lookX: .8 }], [42.7, 'playful'],
    [43.95, 'neutral', { lookX: -.4, lookY: -.9 }], [45.9, 'hopeful', { lookX: .6, lookY: -.3 }], [47.55, 'playful'],
    [49.3, 'confused', { lookX: .6 }], [50.68, 'surprised', { lookX: 1 }], [51.9, 'pouty', { lookX: .9 }], [53.0, 'laugh'],
  ];
  function herAt(t) {
    const mood = emotions(t, HER_MOOD, { take: .8 });
    let x = XH, pose = { view: 'q', seed: 2 };
    if (t >= TSKIP) x = 812;
    // patting the cutting's top leaves on two beats (the far arm, aR, reaches across her front edge)
    const pat = t > 6.0 && t < 8.5 ? 1 : 0;
    if (pat) {
      const lean = ease(seg(t, 6.0, 6.5)) * (1 - ease(seg(t, 8.1, 8.5)));
      const tap = [B(8), B(9)].reduce((s, b) => s + Math.exp(-Math.pow((t - b) / .09, 2)), 0);
      pose = { ...pose, rot: .2 * lean, aR: lerp(mood.aR ?? .2, -.35 - .25 * tap, lean) };
    }
    // peeking over the fence at the newcomer, then leaning in under the falling box, then straightening with it on
    let rot = 0;
    rot += .1 * ease(seg(t, 15.4, 16.0)) * (1 - ease(seg(t, 17.6, 17.8)));
    rot += .26 * ease(seg(t, 17.6, 18.25)) * (1 - ease(seg(t, 19.25, 19.85)));
    // the toss back: squash, hop and lean right
    const hop = jump(t, 21.2, 21.55, 1.2);
    rot += .3 * ease(seg(t, 21.12, 21.32)) * (1 - ease(seg(t, 21.6, 22.2)));
    // verse: the shirt landing (squash), the peek, the toss to him
    const hop2 = jump(t, 39.95, 40.3, 1.3);
    rot += .28 * ease(seg(t, 39.85, 40.02)) * (1 - ease(seg(t, 40.35, 40.9)));
    // tempting the cat: a sidle toward the fence and a wiggle
    if (t > 47.4) x = lerp(812, 832, ease(seg(t, 47.4, 47.9)));
    let o = addPose(mood, { ...pose, rot: (pose.rot || 0) + rot, dy: hop.dy + hop2.dy, sq: hop.sq + hop2.sq });
    if (t > 47.55 && t < 49.3) { const w = Math.sin((t - 47.55) * TAU * 1.2); o.aL = 1.2 + .45 * w; o.aR = 1.0 - .45 * w; }
    // landing squashes: the box (18.86) and the shirt (36.58)
    o.sq += .2 * Math.exp(-(t - 18.86) * 7) * (t > 18.86 ? Math.cos((t - 18.86) * 16) : 0) + .22 * Math.exp(-(t - 36.58) * 7) * (t > 36.58 ? Math.cos((t - 36.58) * 15) : 0);
    // her blinks while frozen under the box (twice)
    if ([19.45, 19.95].some(b => t > b && t < b + .11)) o.eyes = 'blink';
    if (t > 36.58 && t < 40.02) { const pk = ease(seg(t, B(45), B(45) + .45)); o.draw = drapeHook(herDrapeD(t), -.8 * pk, { key: 'her', wave: t * 4, tilt: -.07 * pk }); }
    if (t > 36.7 && t < 38.2) o.dx = (o.dx || 0) + .22 * Math.sin((t - 36.7) * 11) * Math.sin(Math.PI * seg(t, 36.7, 38.2));   // a fidget under the shirt
    return { x, y: G, u: HU, o };
  }
  // the shirt over her: 4.9 hides her face; at the peek it is pushed back like a hood (0.9: eyes and lashes clear)
  const herDrapeD = t => lerp(4.9, .9, ease(seg(t, B(45), B(45) + .45))) + .5 * Math.exp(-(t - 36.58) * 6) * Math.sin((t - 36.58) * 18);

  // ---------- Clawd ----------
  const CL_MOOD = [
    [0, 'determined'], [14.33, 'happy'], [14.75, 'proud'], [16.36, 'surprised', { lookX: -.9 }], [16.95, 'nervous', { lookX: -.8, lookY: -.6 }],
    [18.05, 'scared', { lookX: -1, lookY: .2 }], [19.12, 'surprised', { lookX: -.9, emote: null }], [21.25, 'hopeful', { lookX: -.4, lookY: -.9 }],
    [22.3, 'happy'], [22.86, 'scared', { lookY: -.9 }], [24.1, 'relieved'], [24.55, 'sheepish'], [26.6, 'happy'],
    [31.0, 'sleepy'], [36.95, 'surprised', { lookX: -.9 }], [37.55, 'nervous', { lookX: -.9 }], [40.85, 'surprised', { emote: null }],
    [41.45, 'sheepish'], [43.95, 'neutral', { lookX: -.7, lookY: -.9 }], [45.95, 'excited'], [49.3, 'confused', { lookX: -.6 }],
    [50.72, 'surprised', { lookY: -.8 }], [51.77, 'love'],
  ];
  const walkIn = t => stroll(t, 10.0, 14.3, 2080, 1255, U);
  const bow = (t, t0) => { const a = t - t0; return a < -.12 || a > .6 ? 0 : a < 0 ? .06 * ease(-a / .12) : -.3 * Math.sin(Math.PI * clamp(a / .55)); };
  function clawdAt(t) {
    const mood = emotions(t, CL_MOOD, { take: .9 });
    let x = 1255, p = { seed: 5 }, rot = 0, dy = 0, sq = 0;
    if (t < TSKIP) {
      if (t < 14.3) {   // the walk in, facing left in 3/4 so we see his careful face; the mood's bounce is damped
        const w = walkIn(t); x = w.x;
        p = { ...p, view: 'q', flip: true, walk: w.walk };
        dy += w.dy - .6 * (mood.dy || 0);
      } else if (t < 16.2) p = { ...p, ...turn(t, 14.3, 14.42, -.125, 0) };
      else p = { ...p, ...turn(t, 16.2, 16.33, 0, -.125) };
      rot += .12 * ease(seg(t, 16.9, 17.3)) * (1 - ease(seg(t, 18.0, 18.4))) + .02 * Math.sin(t * 19) * (t > 16.9 && t < 18.0 ? 1 : 0);
      // the thank-you bow: a small lean back, down toward her, frozen there (the box slides), then slowly back up
      rot += .05 * Math.sin(Math.PI * seg(t, 22.38, 22.5)) - .3 * ease(seg(t, 22.5, 22.78)) * (1 - ease(seg(t, 23.4, 24.1)));
      if (t > 14.3 && t < 14.9) { const k = jump(t, 14.4, 14.62, .6); dy += k.dy; sq += k.sq; }       // "made it!"
    } else {
      // verse: dozing on the ground under the line; a surprised pop up (the legs come back in mid-air), then to the fence
      x = 1400;
      if (t < 36.95) { p = { ...p, view: 'front', noLegs: true }; dy += 2.25; }
      else {
        if (t < 37.3) { const k = seg(t, 36.95, 37.3); dy += lerp(2.25, 0, k) - 2.6 * Math.sin(Math.PI * k); if (t < 37.06) p.noLegs = true; }
        else sq += .2 * Math.exp(-(t - 37.3) * 8) * Math.cos((t - 37.3) * 16);
        const w = stroll(t, 37.8, 38.9, 1400, 1290, U); x = w.x;
        if (t < 37.8) p = { ...p, ...turn(t, 37.5, 37.65, 0, -.125) };
        else p = { ...p, view: 'q', flip: true, ...(t < 38.9 ? { walk: w.walk } : {}) };
        if (t < 38.9 && t > 37.8) dy += w.dy;
        if (t > 48.2) { const w2 = stroll(t, 48.2, 48.75, 1290, 1240, U); x = w2.x; if (t < 48.75) { p.walk = w2.walk; dy += w2.dy; } }
        for (const b of [B(49), B(50), B(51)]) rot += bow(t, b);
      }
    }
    const o = addPose(mood, { ...p, rot, dy, sq });
    if (t < 14.3) { o.aL = -.35 + .1 * Math.sin(t * 7); o.aR = -.3; }                                          // careful steps: arms down
    if (t > 48.4 && t < 49.4) { const w = Math.sin((t - 48.4) * TAU * 1.5); o.aL = 1.3 + .5 * w; o.aR = 1.3 - .5 * w; }   // waving at the cat
    if (t > 51.77) { o.dy *= .35; o.rot *= .4; o.dx = (o.dx || 0) * .3; }                                      // holding very still
    if ([19.6, 20.15].some(b => t > b && t < b + .11)) o.eyes = 'blink';
    const land = (ta, a) => t > ta ? a * Math.exp(-(t - ta) * 7) * Math.cos((t - ta) * 15) : 0;
    o.sq += land(B(26), .12) + land(B(48), .14) + land(50.62, .16);
    if (t > B(48) && t < SH.tOff) o.draw = drapeHook(5.1 - .9 * ease(seg(t, 41.6, 43.3)), hisDrapeSlide(t), { key: 'his', wave: t * 4, tilt: -.05 * hisDrapeSlide(t) / 3 });
    return { x, y: G, u: U, o };
  }
  const hisDrapeSlide = t => 1.4 * ease(seg(t, B(49) + .05, B(49) + .3)) + 1.7 * ease(seg(t, B(50) + .05, B(50) + .3)) + 3 * easeIn(seg(t, B(51) + .05, B(51) + .25));

  // ---------- the boxes ----------
  const BOXES = [{ w: 7.6 * U, h: 3.6 * U, dx: 0 }, { w: 6.4 * U, h: 3.2 * U, dx: .35 * U }, { w: 5.0 * U, h: 2.8 * U, dx: -.25 * U }];
  const KICKS = [[14.36, .05], [16.36, .07], [22.23, .05], [22.55, .05], [22.86, -.06], [24.1, .04]];
  // The top box rests on box 1's top surface. topSlide(t) = { s, tip }: s = its bottom-centre's offset along that surface
  // (negative = toward her), tip = its tilt about box 1's left corner once its centre has slid past that corner.
  const SC = -BOXES[1].w / 2;
  function topSlide(t) {
    const s0 = BOXES[2].dx;
    if (t < 20) {   // moving day: the slip after his take, two rocks on the corner, then over it goes
      const s = s0 - 40 * ease(seg(t, 16.45, 17.45)) - 13 * ease(seg(t, 17.45, 17.9)) - 12 * ease(seg(t, 17.9, 18.05));
      const rock = t > 17.45 && t < 17.9 ? -.08 * Math.pow(Math.sin(Math.PI * (t - 17.45) / .225), 2) : 0;
      return { s, tip: rock - .45 * easeIn(seg(t, 17.9, 18.05)) };
    }
    // back on the stack: the bow slides it to the edge (it rocks once while he is frozen) and the straightening slides it back
    const out = ease(seg(t, 22.55, 22.86)) * (1 - ease(seg(t, 23.45, 24.1)));
    const rock = t > 22.95 && t < 23.35 ? -.05 * Math.pow(Math.sin(Math.PI * (t - 22.95) / .4), 2) : 0;
    return { s: s0 - 52 * out, tip: rock };
  }
  function stackAt(t, c) {
    const top = topOf(c.x, c.y, c.u, c.o), walking = t < 14.3 ? c.o.walk || 0 : 0;   // walk phase: one cycle per 4u travelled
    const ang = [0, 1, 2].map(i => {
      let a = (t < 14.3 ? .05 * Math.sin(walking * Math.PI * 2 - i * .8) * (i + 1) * .5 * ease(seg(t, 10.0, 10.6)) : 0);
      for (const [te, amp] of KICKS) a += amp * (i + 1) * .45 * spring(t, te + i * .05, 4.5, 11);
      return a;
    });
    const st = stackPts(top, BOXES.slice(0, 2), ang.slice(0, 2)), b1 = st[1], r1 = b1.rot;
    const P = [b1.x + b1.h * Math.sin(r1), b1.y - b1.h * Math.cos(r1)], { s: sl, tip } = topSlide(t);
    const C = [P[0] + SC * Math.cos(r1), P[1] + SC * Math.sin(r1)], d = sl - SC, r = r1 + tip;
    st.push({ x: C[0] + d * Math.cos(r), y: C[1] + d * Math.sin(r), rot: r + ang[2] * (1 - clamp(-tip * 4)), w: BOXES[2].w, h: BOXES[2].h });
    return st;
  }
  // where the top box is at time t: on the stack, flying, on her head, flying back, on the stack
  function topBox(t, cAt, hAt) {
    const tA = 18.05, tB = 18.86, tC = 21.3, tD = B(26);
    if (t < tA || t >= tD) { const s = stackAt(t, cAt(t)); return { ...s[2], on: 'stack' }; }
    const onHer = tt => { const h = hAt(tt), tp = topOf(h.x, h.y, h.u, h.o); return { x: tp.x, y: tp.y, rot: tp.rot, w: BOXES[2].w, h: BOXES[2].h }; };
    if (t < tB) {
      const a = { ...stackAt(tA, cAt(tA))[2] }, b = onHer(tB), k = seg(t, tA, tB);
      const p = arcPt([a.x, a.y], [b.x, b.y], 80, k);
      return { x: p[0], y: p[1], rot: lerp(a.rot, b.rot, ease(k)), w: a.w, h: a.h, on: 'air' };
    }
    if (t < tC) { const b = onHer(t); return { ...b, sq: .15 * Math.exp(-(t - tB) * 8) * Math.cos((t - tB) * 18), on: 'her' }; }
    const a = onHer(tC), b = stackAt(tD, cAt(tD))[2], k = seg(t, tC, tD);
    const p = arcPt([a.x, a.y], [b.x, b.y], 95, k);
    return { x: p[0], y: p[1], rot: lerp(a.rot, b.rot, ease(k)) - .4 * Math.sin(Math.PI * k), w: a.w, h: a.h, on: 'air' };
  }

  // ---------- the shirt (verse) ----------
  const SH = { x: 1290, s: 34, tRel: 35.4, tHer: B(43), tToss: 40.02, tHim: B(48), tOff: B(51) + .2, tGround: B(51) + .62 };
  const wind = t => ease(seg(t, 33.8, 34.7)) * (1 - ease(seg(t, 36.3, 37.6)));
  function shirtAt(t, hAt, cAt) {
    const hang = { x: SH.x, y: lineY(SH.x) + 2, rot: .55 * wind(t) + .12 * wind(t) * Math.sin(t * 13) };
    if (t < SH.tRel) return { mode: 'line', ...hang };
    const topH = tt => { const h = hAt(tt); return topOf(h.x, h.y, h.u, h.o); }, topC = tt => { const c = cAt(tt); return topOf(c.x, c.y, c.u, c.o); };
    if (t < SH.tHer) {
      const b = topH(SH.tHer), k = seg(t, SH.tRel, SH.tHer), p = arcPt([hang.x, hang.y], [b.x, b.y - 30], 170, k);
      return { mode: 'air', x: p[0], y: p[1], rot: hang.rot + 1.1 * Math.sin(k * 4) * (1 - k), sx: 1 - .25 * Math.sin(k * 7), k };
    }
    if (t < SH.tToss) return { mode: 'her' };
    if (t < SH.tHim) {
      const a = topH(SH.tToss), b = topC(SH.tHim), k = seg(t, SH.tToss, SH.tHim), p = arcPt([a.x, a.y - 20], [b.x, b.y - 30], 150, k);
      return { mode: 'air', x: p[0], y: p[1], rot: -.3 + .9 * Math.sin(k * 5) * (1 - k), sx: 1 - .2 * Math.sin(k * 6), k };
    }
    if (t < SH.tOff) return { mode: 'him' };
    const c = cAt(SH.tOff), a = topOf(c.x, c.y, c.u, c.o), gx = c.x - 7.5 * U, k = seg(t, SH.tOff, SH.tGround);
    if (t < SH.tGround) { const p = arcPt([a.x - 3 * U, a.y], [gx, G + 4], 30, easeIn(k)); return { mode: 'air', x: p[0], y: p[1] - 30, rot: -.9 * k, sx: 1, k }; }
    return { mode: 'ground', x: gx, y: G + 16 };
  }

  // ---------- the cat (verse) ----------
  const CS = .9 * U, EAVE = 536, CAT_T = { in: 43.35, edge: 45.0, land: 45.72, sit: B(54), crouch: 49.95, go: B(59), on: 50.62, loaf: 51.4 };
  function catAt(t, cAt) {
    if (t < CAT_T.in) return null;
    if (t < CAT_T.edge) { const x = lerp(110, 820, ease(seg(t, CAT_T.in, CAT_T.edge)) * .15 + seg(t, CAT_T.in, CAT_T.edge) * .85); return { x, y: EAVE, o: { pose: 'walk', walk: (x - 110) / (3 * CS), look: .3 } }; }
    if (t < CAT_T.land) {
      const k = seg(t, CAT_T.edge + .08, CAT_T.land);
      if (t < CAT_T.edge + .08) return { x: 820, y: EAVE, o: { pose: 'stand', sq: .2 * seg(t, CAT_T.edge, CAT_T.edge + .08) } };
      const p = arcPt([820, EAVE], [FX, FENCE.top - 4], 70, k);
      return { x: p[0], y: p[1], o: { pose: 'leap', rot: lerp(-.25, .35, k), noShadow: true } };
    }
    if (t < CAT_T.crouch) {
      const look = t < 47.9 ? 0 : t < 48.75 ? -ease(seg(t, 47.9, 48.1)) : t < 49.3 ? lerp(-1, 1, ease(seg(t, 48.75, 48.95))) : 0;
      const yawn = t > 49.3 && t < 50.0, sq = .18 * Math.exp(-(t - CAT_T.land) * 8) * Math.cos((t - CAT_T.land) * 16);
      return { x: FX, y: FENCE.top - 4, o: { pose: t < CAT_T.sit ? 'stand' : 'sit', look, sq, eyes: yawn ? 'closed' : 'open', mouth: yawn ? 'yawn' : null, headTilt: yawn ? -.15 : 0, noShadow: true } };
    }
    if (t < CAT_T.go) return { x: FX, y: FENCE.top - 4, o: { pose: 'stand', sq: .22 * seg(t, CAT_T.crouch, CAT_T.go), look: .8, noShadow: true } };
    const top = tt => { const c = cAt(tt); return topOf(c.x, c.y, c.u, c.o); };
    if (t < CAT_T.on) {
      const b = top(CAT_T.on), k = seg(t, CAT_T.go, CAT_T.on), p = arcPt([FX, FENCE.top - 4], [b.x, b.y], 90, k);
      return { x: p[0], y: p[1], o: { pose: 'leap', rot: lerp(-.3, .2, k), noShadow: true } };
    }
    const b = top(t), sq = .2 * Math.exp(-(t - CAT_T.on) * 8) * Math.cos((t - CAT_T.on) * 16);
    if (t < CAT_T.loaf) { const knead = Math.max(0, Math.sin((t - CAT_T.on) * TAU * 3)) * .25; return { x: b.x, y: b.y, o: { pose: 'stand', rot: b.rot, sq: sq + .06 * knead, look: -.3, noShadow: true } }; }
    return { x: b.x, y: b.y, o: { pose: 'loaf', rot: b.rot, sq: .12 * Math.exp(-(t - CAT_T.loaf) * 6) * Math.cos((t - CAT_T.loaf) * 14), eyes: 'closed', curl: ease(seg(t, CAT_T.loaf, CAT_T.loaf + .6)), noShadow: true } };
  }

  // ---------- sparrows on the left wire ----------
  function birds(t) {
    const land3 = B(34), out = [];
    const chat = (i) => { const ph = frac(bpOf(t) * 2 + i * .5); return ph < .35 ? Math.sin(ph / .35 * Math.PI) : 0; };
    const x1 = 700, x2 = t < .6 ? 790 : lerp(790, 760, ease(seg(t, .6, .95)));
    const shuffle = ease(seg(t, 30.0, 30.4)) * 18;
    out.push({ x: x1 + shuffle, hop: Math.max(0, Math.sin(Math.PI * seg(t, 30.0, 30.4))) * .8, beak: chat(0), chirp: t > 27.3 && t < 31 ? chat(0) : 0, flip: false, peck: t > 3 && t < 3.6 ? Math.sin(seg(t, 3, 3.6) * Math.PI) : 0 });
    out.push({ x: x2, hop: Math.max(0, Math.sin(Math.PI * seg(t, .6, .95))) * 1.2, beak: chat(1), chirp: t > 27.3 && t < 31 ? chat(1) : 0, flip: true });
    if (t > 27.6) {   // a third flies in and lands, bouncing the wire
      const k = seg(t, 27.6, land3), lx = 830 - shuffle;
      if (t < land3) { const p = arcPt([1500, -160], [lx, wireY(lx, 0)], -60, easeOut(k)); out.push({ x: p[0], y: p[1], flying: true, flip: true }); }
      else out.push({ x: lx, beak: chat(.5), chirp: t < 31 ? chat(.5) : 0, flip: true, hop: Math.max(0, Math.sin(Math.PI * seg(t, 30.05, 30.45))) * .8 });
    }
    return { list: out, bob: t > land3 ? 10 * Math.exp(-(t - land3) * 4) * Math.cos((t - land3) * 14) : 0 };
  }

  // ---------- the frame ----------
  function laneDay(t, lt, dur) {
    const k = tod(t), [cx, cy, z] = cam(t);
    const her = herAt(t), cl = clawdAt(t);
    camBegin(cx, cy, z);
    const sunK = ease(seg(t, 27.9, 30.9));
    sky(t, k, { sun: [lerp(330, 1680, sunK), -170 - 140 * Math.sin(Math.PI * sunK)], drift: 1100 * ease(seg(t, 27.6, 31.0)) });
    const bd = birds(t);
    backdrop(t, k, [bd.bob, 0, 0, 0]);
    bd.list.forEach((b, i) => sparrow(b.x, b.y ?? wireY(b.x, 0, bd.bob), 13, { ...b, key: i }));
    house(...SET.her, { side: 'her', wall: COL.wallHer, roof: COL.roofHer, door: COL.doorHer });
    house(...SET.his, { side: 'his', wall: COL.wallHis, roof: COL.roofHis, door: COL.doorHis, lived: t < TSKIP ? 0 : 1 });
    const ct = catAt(t, clawdAt);
    if (ct && ct.y === EAVE) cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' });   // on the roof
    yard(t);
    if (t > TSKIP) { clothesline(); towel(1430, t, wind(t)); }
    // the shirt on the line, with its pegs (they pop off on release)
    const sh = t > TSKIP ? shirtAt(t, herAt, clawdAt) : null;
    if (sh && sh.mode === 'line') { shirt(sh.x, sh.y, SH.s, sh.rot, { flutter: .3 + wind(t), t, key: 'shirt' }); peg(SH.x - 22, lineY(SH.x - 22), 13); peg(SH.x + 22, lineY(SH.x + 22), 13); }
    if (t > SH.tRel && t < SH.tRel + .9) for (const s of [-1, 1]) { const a = t - SH.tRel, px = SH.x + s * 22 + s * 90 * a, py = lineY(SH.x + s * 22) - 160 * a + 420 * a * a; peg(px, py, 13, s * a * 9); }
    fence();
    if (ct && ct.y !== EAVE && ct.o.pose !== 'leap' && Math.abs(ct.x - FX) < 1) cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' });   // on the fence
    cutting(...CUT, 25, { g: .15, sway: -.25 * wind(t), bounce: t > 6 && t < 9 ? Math.min(t - B(8), t > B(9) ? t - B(9) : 9) : null });

    heroine(her.x, her.y, her.u, her.o);
    clawd(cl.x, cl.y, cl.u, cl.o);
    if (sh && sh.mode === 'ground') shirtHeap(sh.x, sh.y, 30);
    // boxes: the stack rides on Clawd until the verse; the top box flies, rides on her, flies back
    if (t < TSKIP) {
      const st = stackAt(t, cl), tb = topBox(t, clawdAt, herAt);
      cardBox(st[0].x, st[0].y, st[0].w, st[0].h, st[0].rot, { key: 0 });
      cardBox(st[1].x, st[1].y, st[1].w, st[1].h, st[1].rot, { key: 1 });
      cardBox(tb.x, tb.y, tb.w, tb.h, tb.rot, { key: 2, sq: tb.sq });
    }
    if (ct && (ct.o.pose === 'leap' || (ct.y !== EAVE && Math.abs(ct.x - FX) >= 1))) cat(ct.x, ct.y, CS, { ...ct.o, key: 'cat' });   // leaping, or on his head
    if (sh && sh.mode === 'air') shirt(sh.x, sh.y, SH.s, sh.rot, { flutter: 1, sx: sh.sx, t, key: 'shirt' });
    gust(t, 33.8, 2.2, 620, 860);
    camEnd();
    grade(k);
    boilSeed('transition');
    if (t < 1.0) flash(1 - ease(t / 1.0), PAL.paper);                                       // in from the paper
    if (t > 53.7) brushWipe((t - 53.7) / .6, ['#E3A15C', '#E07F95']);                     // full cover at 54.0: stage 2 takes it off
  }

  shots([[0, laneDay]]);
  // for checks: crop-at expressions (e.g. STAGE1.her(T).x) and logic tests
  window.STAGE1 = { her: herAt, clawd: clawdAt, stack: stackAt, topBox: tb => topBox(tb, clawdAt, herAt), shirt: ts => shirtAt(ts, herAt, clawdAt), cat: tc => catAt(tc, clawdAt), cam };
})();
