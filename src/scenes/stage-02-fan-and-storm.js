// stage-02-fan-and-storm.js: STAGE 2 of 《隔壁》, song time 54.000–107.625 s (frames 1296–2582). Verse 2 + the first
// half of chorus 1. Storyboard: docs/storyboard/stage-02.md. Stage 1 hands over under a full brush wipe at 54.000.
//   54.0–81.3  The fan at dusk: a small comic surprise. A hot golden evening; Clawd sits on his porch in front of an
//              electric fan that swings back and forth. She wilts on her own step and perks up each time the breeze
//              swings her way. At the fence she works out where it comes from and runs over. Clawd is secretly thrilled
//              (it's him she's coming to!), plays it cool, hearts leaking, and pats the spot beside him. She runs right
//              past it and plops down in front of the fan, bumping him aside. A little rain cloud of his own; she
//              playfully blocks his one try for the breeze; the cat takes his head. Friends, not yet more.
//   81.3–107.6 The storm: where it turns. Both watch the rain from their lit windows. In the lightning Clawd sees the
//              cutting thrashing, squeezes out of his door sideways, runs to it and leans over it as its roof. A gust
//              nearly shoves him off; he digs back in. From her window she watches him, touched, and runs out to lean in
//              from the other side: an A-frame roof. Awkward; rain pours off his top onto her head; her deadpan look,
//              then both laugh. A lightning crack makes them huddle; face to face, they blush (steam in the cold rain),
//              rest their heads together; the first bud appears on the plant. A rain wipe hands over at 107.625.
// Every pose is a pure function of song time t. Nothing is gripped: the fan runs itself; arms only pat.
(() => {
  const U = 20, HU = U * HER_K, B = n => OFF + n * BEAT, T0 = 54.0, T_STORM = B(96), T_END = 107.625;
  const DECK_Y = 896, SEAT = DECK_Y - 5, STEP_Y = 900;               // porch top boards; sitting foot points
  const FAN_X = 1790, FAN_S = 15, FAN_P = BAR(), FAN_PEAK = 60.0;   // the fan points along the porch on its peaks
  function BAR() { return 4 * BEAT; }
  const CUT = [968, G + 14];

  // ---------- light ----------
  const DUSK = {
    sky: { top: '#8E86C6', low: '#FFAE6E', cloud: '#FFC9A2' }, sun: { halo: '#FFC27A', disk: '#FFA24E' },
    wallHer: mixCol(COL.wallHer, '#F7A86E', .42), wallHis: mixCol(COL.wallHis, '#F7A86E', .42), plinth: mixCol(COL.plinth, '#D8804E', .4),
    roofHer: mixCol(COL.roofHer, '#7A527E', .38), roofHis: mixCol(COL.roofHis, '#7A527E', .38), glass: mixCol(COL.glass, '#FFC08A', .6),
    ground: mixCol(COL.ground, '#F4A060', .4), groundDk: mixCol(COL.groundDk, '#C8703E', .4), fence: mixCol(COL.fence, '#FFC48E', .4),
    tree: mixCol(COL.tree, '#D0904E', .38), treeDk: mixCol(COL.treeDk, '#7A5248', .38), hedge: mixCol(mixCol(COL.hedge, '#BFD6C4', .3), '#D0904E', .38),
  };
  const NIGHT = {
    sky: { top: '#1C2246', low: '#2B3460', cloud: '#333C66' },
    wallHer: '#4E5476', wallHis: '#494F70', plinth: '#3E4462', roofHer: '#262D4A', roofHis: '#2A3048', doorHer: '#36585C', doorHis: '#5E4A3C',
    frame: '#34405A', step: '#4E5270', ground: '#3E4159', groundDk: '#30324A', grass: '#435C4E', pebble: '#53566E', fence: '#7E8298', fenceDk: '#565A72',
    tree: '#2E4846', treeDk: '#233838', hedge: '#2F4747', pole: '#4A4E66', wire: '#141830', curtainHer: '#F2B7A8', curtainHis: '#F0CF8E', shade: '#3D4A80',
  };
  const STRIKES = [T_STORM, B(102), B(110), B(119), B(124)];
  const mixPal = (a, b, k) => ({ top: mixCol(a.top, b.top, k), low: mixCol(a.low, b.low, k), cloud: mixCol(a.cloud, b.cloud, k) });

  // ---------- the fan and its breeze ----------
  const fanA = t => .35 + .65 * Math.sin(TAU * (t - FAN_PEAK) / FAN_P + Math.PI / 2);          // 1 = pointing left, along the porch
  const blowAt = te => clamp((fanA(te) - .3) / .6);                                            // breeze strength leaving the fan at te
  const BREEZE_V = 1050;                                                                         // px/s, so it reaches her step on the bar
  const breezeAtX = (t, x) => blowAt(t - Math.max(0, FAN_X - x) / BREEZE_V);

  // ---------- extra moods ----------
  EMO.wilted = { eyes: 'sleepy', mouth: 'o', blush: .55, emote: 'sweat', take: .3, body: t => { const b = _b(t), s = Math.sin(b.bp * Math.PI / 2); return { sq: .1 + .02 * s, rot: -.03 + .02 * s, aL: -.95, aR: -.95, lookY: .4, dy: -.05 * b.ab }; } };
  EMO.touched = { eyes: 'teary', mouth: 'smile', blush: .6, take: .5, body: t => { const b = _b(t); return { sq: .03, dy: -.15 * b.ab, aL: -.6, aR: -.6, lookY: .1 }; } };

  // ---------- camera ----------
  const CAMK = [
    [T0, [1150, 700, 1.04]], [57.0, [1150, 700, 1.04]], [58.6, [705, 832, 1.9]], [64.0, [705, 832, 1.9]],
    [65.6, [1185, 772, 1.22]], [68.95, [1185, 772, 1.22]], [70.0, [1430, 826, 1.42]], [71.15, [1470, 830, 1.5]],
    [71.75, [1590, 842, 1.9]], [74.3, [1592, 844, 2.0]], [77.4, [1600, 846, 2.05]], [78.3, [1560, 838, 1.8]], [79.75, [1570, 840, 1.85]],
    [81.25, [1450, 650, 1.32]],
    [T_STORM, [1100, 690, 1.04]], [82.6, [1100, 690, 1.06]], [85.1, [1355, 718, 2.4]], [86.7, [1352, 720, 2.42]],
    [87.4, [968, 884, 2.5]], [87.7, [970, 884, 2.5]], [88.3, [1300, 822, 1.25]], [89.6, [1170, 840, 1.45]],
    [90.5, [1018, 852, 2.05]], [92.4, [1016, 852, 2.1]], [93.05, [345, 718, 2.4]], [94.4, [342, 720, 2.45]],
    [95.1, [640, 820, 1.5]], [95.9, [850, 848, 1.75]], [96.6, [952, 858, 2.15]], [99.7, [950, 856, 2.2]],
    [100.75, [950, 852, 2.32]], [101.6, [946, 842, 2.6]], [104.9, [946, 844, 2.72]], [107.4, [1000, 770, 1.35]],
  ];
  const cam = t => { const [cx, cy, z] = kf(t, CAMK); return [cx + 10 * Math.sin(t * .41), cy + 5 * Math.sin(t * .33 + 2), z * (1 + .005 * Math.sin(t * .27))]; };

  // ---------- dusk: her ----------
  const HER_DUSK = [
    [T0, 'wilted'], [61.05, 'relieved'], [62.5, 'wilted'], [64.43, 'relieved'], [65.0, 'hopeful', { lookX: 1 }],
    [67.55, 'relieved'], [68.2, 'neutral', { lookX: 1, lookY: -.3 }], [68.5, 'idea', { lookX: 1 }], [69.0, 'excited'],
    [71.6, 'relieved'], [72.6, 'content'], [76.75, 'playful', { lookX: -1 }], [77.7, 'content'], [79.4, 'laugh', { lookX: -.8 }],
    [80.3, 'surprised', { lookY: -1 }],
  ];
  // her run around the front of the fence to the fan, as waypoints [x, y]
  const PATH = [[830, G], [905, G + 52], [1110, G + 60], [1265, G + 12], [1600, G + 4], [1690, G]];
  const pathLen = PATH.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]), 0);
  function onPath(k) {
    let d = k * pathLen;
    for (let i = 1; i < PATH.length; i++) {
      const a = PATH[i - 1], b = PATH[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d <= l || i === PATH.length - 1) { const q = clamp(d / l); return [lerp(a[0], b[0], q), lerp(a[1], b[1], q)]; }
      d -= l;
    }
  }
  const HER_SIT = 1690, BUMP = 71.55;
  function herDusk(t) {
    const mood = emotions(t, HER_DUSK, { take: .8 });
    let x = 690, y = STEP_Y, p = { view: 'q', seed: 2, shadowDx: 3, shadowW: 1.7 }, rot = 0, dy = 0, sq = 0;
    const brz = breezeAtX(t, x);
    if (t < 65.0) {   // sitting on her step, wilting, leaning into each puff
      p.noLegs = true; dy += 2.25; rot += .14 * brz; sq -= .05 * brz;
    } else if (t < 65.4) {   // up she gets: a hop that brings the legs back in mid-air
      const k = seg(t, 65.0, 65.4); dy += lerp(2.25, 0, k) - 2 * Math.sin(Math.PI * k); p.noLegs = k < .3;
    } else if (t < 69.0) {   // to the fence after the breeze, leaning over it into the next puff; then: the fan!
      const w = stroll(t, 65.4, 66.9, 690, 830, HU); x = w.x; y = lerp(STEP_Y, G, ease(seg(t, 65.4, 65.75)));
      p = { ...p, view: t < 66.9 ? 'side' : 'q', walk: t < 66.9 ? w.walk : null }; dy += t < 66.9 ? w.dy : 0;
      rot += .2 * breezeAtX(t, 830) * ease(seg(t, 66.9, 67.4)) * (1 - ease(seg(t, 68.1, 68.4)));
      if (t > 68.8) { const j = jump(t, 68.85, 69.05, .7); dy += j.dy; sq += j.sq; }   // a little bounce: off she goes
    } else if (t < 71.25) {   // running round the front of the fence, straight for the fan
      const k = ease(seg(t, 69.0, 71.25)), [px, py] = onPath(k), steps = k * pathLen / (3 * HU);
      x = px; y = py; p = { ...p, view: 'side', walk: steps, smear: .2 }; dy -= .8 * Math.abs(Math.sin(steps * Math.PI)); rot += .08;
    } else {   // a hop up right in front of the fan (bumping him aside), and there she stays
      x = HER_SIT; const k = seg(t, 71.25, BUMP);
      y = lerp(G, SEAT, easeOut(k)); dy -= 2.3 * Math.sin(Math.PI * k);
      if (t > BUMP - .1) { p.noLegs = true; dy += 2.25 * ease(seg(t, BUMP - .1, BUMP + .05)); }
      p = { ...p, ...(t < 79.3 ? turn(t, 71.25, 71.4, .25, .125) : turn(t, 79.3, 79.45, .125, 0)), shadowDx: 2.4 };
      if (t > BUMP) sq += .16 * Math.exp(-(t - BUMP) * 8) * Math.cos((t - BUMP) * 15);
      // she leans after the fan's head as it swings away, and back into it when it returns
      const chase = 1 - blowAt(t - .1);
      rot += (.04 + .14 * chase) * ease(seg(t, 72.0, 72.6)) * (t < 79.3 ? 1 : .3);
      rot -= .2 * Math.sin(Math.PI * seg(t, 76.75, 77.55));   // the playful block: leaning across his one try for the breeze
    }
    const o = addPose(mood, { ...p, rot, dy, sq });
    return { x, y, u: HU, o };
  }

  // ---------- dusk: Clawd ----------
  const CL_DUSK = [
    [T0, 'content'], [69.25, 'surprised', { lookX: -1 }], [69.7, 'love', { lookX: -1 }],
    [70.25, 'proud', { emote: 'hearts', blush: .75 }],                      // playing it cool, the hearts leaking out anyway
    [BUMP + .05, 'surprised', { lookX: 1 }], [72.05, 'confused', { lookX: 1 }], [72.85, 'sad', { lookX: .4 }],
    [76.2, 'hopeful', { lookX: 1 }], [77.15, 'bored', { lookX: 1 }], [79.08, 'surprised', { lookY: -1 }], [79.45, 'relieved'],
    [80.3, 'surprised', { lookY: -1 }],
  ];
  function clawdDusk(t) {
    const mood = emotions(t, CL_DUSK, { take: .8 });
    let x = 1640, dy = 2.25, rot = 0, sq = 0, smear = 0;
    const slide = ease(seg(t, BUMP, BUMP + .32));                                                // bumped aside, sliding along the porch
    x -= 170 * slide; if (t > BUMP && t < BUMP + .32) smear = .45;
    rot += .05 * breezeAtX(t, x) * (t < 69 ? 1 : 0);
    rot += .17 * Math.sin(Math.PI * seg(t, 76.2, 77.3)) * (1 - .6 * seg(t, 76.75, 77.0));       // leaning over for a bit of the breeze
    const o = addPose(mood, { view: 'front', seed: 5, noLegs: true, rot, dy, sq, smear, smearDir: -1, shadowDx: 3.2, shadowW: 1.7 });
    const pat = [B(83), B(84)].reduce((s, b) => s + Math.exp(-Math.pow((t - b) / .08, 2)), 0);
    if (t > 70.25 && t < BUMP) { o.aL = -.9 - .5 * pat; }                                        // patting the spot beside him: here!
    if (t > 79.0) { o.dy = (o.dy || 0) * .35; o.rot = (o.rot || 0) * .4; }                     // keeping still under the cat
    return { x, y: SEAT, u: U, o };
  }

  // ---------- dusk: the cat takes his head again ----------
  function catDusk(t) {
    if (t < 77.6) return null;
    if (t < 78.5) { const x = lerp(1150, 1440, ease(seg(t, 77.6, 78.5))); return { x, y: G, o: { pose: 'walk', walk: (x - 1150) / (3 * .9 * U), look: .4 } }; }
    const c = clawdDusk(Math.max(t, 78.98)), top = topOf(c.x, c.y, c.u, c.o);
    if (t < 78.98) { const k = seg(t, 78.5, 78.98), p = arcPt([1440, G], [top.x, top.y], 60, k); return { x: p[0], y: p[1], o: { pose: 'leap', rot: -.25 + .3 * k, noShadow: true } }; }
    const sq = .16 * Math.exp(-(t - 78.98) * 8) * Math.cos((t - 78.98) * 16);
    return { x: top.x, y: top.y, o: t < 79.25 ? { pose: 'stand', rot: top.rot, sq, look: .5, noShadow: true } : { pose: 'loaf', rot: top.rot, eyes: 'closed', curl: ease(seg(t, 79.25, 79.85)), noShadow: true } };
  }

  function dusk(t, lt, dur) {
    const [cx, cy, z] = cam(t), storm = ease(seg(t, 79.6, 81.2)), gold = ease(seg(t, T0, 76)) * (1 - storm);
    const her = herDusk(t), cl = clawdDusk(t), ct = catDusk(t);
    camBegin(cx, cy, z);
    sky(t, 1, { pal: mixPal(DUSK.sky, NIGHT.sky, storm), sun: [300, lerp(360, 470, ease(seg(t, T0, 81)))], sunCol: DUSK.sun, sunR: 62, clouds: 4, drift: 40 * t });
    stormClouds(t, storm);
    backdrop(t, 1, null, { tree: mixCol(DUSK.tree, NIGHT.tree, storm), treeDk: mixCol(DUSK.treeDk, NIGHT.treeDk, storm), hedge: mixCol(DUSK.hedge, NIGHT.hedge, storm), band: mixCol(DUSK.treeDk, NIGHT.treeDk, storm), sway: 18 * storm });
    house(...SET.her, { side: 'her', wall: mixCol(DUSK.wallHer, NIGHT.wallHer, storm), roof: mixCol(DUSK.roofHer, NIGHT.roofHer, storm), door: COL.doorHer, plinth: DUSK.plinth, glass: DUSK.glass });
    house(...SET.his, { side: 'his', wall: mixCol(DUSK.wallHis, NIGHT.wallHis, storm), roof: mixCol(DUSK.roofHis, NIGHT.roofHis, storm), door: COL.doorHis, plinth: DUSK.plinth, glass: DUSK.glass, lived: 1, noPots: true });
    yard(t, { ground: mixCol(DUSK.ground, NIGHT.ground, storm), groundDk: mixCol(DUSK.groundDk, NIGHT.groundDk, storm), wind: 1.5 * storm });
    clothesline();   // the laundry is in for the evening
    shimmer(t, 200, 1800, G + 20, (1 - storm) * (1 - ease(seg(t, 70, 76))));
    fence({ fence: DUSK.fence });
    cutting(...CUT, 25, { g: .18, sway: -.08 * breezeAtX(t, CUT[0]) - .5 * storm });
    deck(1290, 1850, DECK_Y);
    const fp = fan(FAN_X, DECK_Y - 6, FAN_S, fanA(t), t);
    // nearest last: whoever walks on the ground in front of the porch, then the two on it; the cat is always nearest
    const cast = [[her.y, 1, () => heroine(her.x, her.y, her.u, { ...her.o, boilKey: 'her' })], [cl.y, 0, () => clawd(cl.x, cl.y, cl.u, { ...cl.o, boilKey: 'clawd' })]];
    if (ct) cast.push([Infinity, 2, () => cat(ct.x, ct.y, .9 * U, { ...ct.o, key: 'cat' })]);
    cast.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(c => c[2]());
    if (fp.dir < 0) breeze(fp.x - fp.R, fp.y, -1, 1250, t, age => blowAt(t - age) * (1 - storm), { speed: BREEZE_V, col: '#8A5E4A', n: 6 });
    gust(t, 80.45, 1.0, 640, 900);
    camEnd();
    grade(gold * .9 + .25, '#FA9E52', 48);
    grade(storm, '#1C2246', 60);
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, ['#E3A15C', '#E07F95']);            // stage 1's wipe drags off at 54.000
    if (t > 80.85) rainScreen(t, { n: Math.round(40 * seg(t, 80.85, 81.25)), seed: 9, len: 40 });
    flash(clamp((t - (T_STORM - .12)) / .12) * .9, '#EEF2FF');               // the strike that cuts to the storm
  }

  // ---------- storm ----------
  const HIS_LEAN = [1085, G], HER_LEAN = [851, G], TOGETHER = B(114), HUDDLE = B(119) + .04, BUD = 104.35;
  const CL_STORM = [
    [T_STORM, 'neutral', { lookX: -.5, lookY: .3 }], [B(102) + .08, 'surprised', { lookX: -1, lookY: .6 }], [87.0, 'scared', { lookX: -1, lookY: .6 }],
    [88.1, 'determined', { lookX: -1 }], [89.85, 'determined', { eyes: 'squeeze', mouth: 'wobble' }],   // squinting into the rain, teeth chattering
    [B(108) + .02, 'angry', { eyes: 'squeeze', mouth: 'teeth', emote: null, tint: null }],             // the gust: gritting his teeth
    [92.55, 'determined', { eyes: 'squeeze', mouth: 'wobble' }],
    [TOGETHER + .25, 'surprised', { lookX: -1 }],                                                       // the rain has stopped on one side: her
    [97.35, 'shy', { lookX: 1 }],                                                                       // both look away
    [98.55, 'nervous', { lookX: -1 }], [99.15, 'sheepish'],                                            // the water pouring off him onto her: sorry!
    [100.2, 'laugh'],
    [HUDDLE, 'scared', { eyes: 'squeeze', mouth: 'O', emote: null }],                                  // the crack: huddling closer
    [101.6, 'neutral', { lookX: -1 }], [102.2, 'shy', { lookX: -.7, blush: 1, emote: null }], [103.3, 'content', { blush: .8 }],
  ];
  const HER_STORM = [
    [T_STORM, 'neutral', { lookX: .6, lookY: .3 }], [89.0, 'surprised', { lookX: 1, lookY: .4 }], [89.7, 'nervous', { lookX: 1, lookY: .4 }],
    [B(110) + .1, 'surprised', { lookX: 1, lookY: .4 }], [93.8, 'touched', { lookX: 1, lookY: .3 }], [94.4, 'determined', { lookX: 1 }],
    [TOGETHER - .05, 'happy', { lookX: .9 }], [97.35, 'shy', { lookX: -1 }],
    [98.25, 'surprised', { eyes: 'squeeze', mouth: 'O', emote: 'sweat' }], [98.95, 'unimpressed', { lookX: 1 }],   // the deadpan from the shirt day
    [99.87, 'laugh'], [HUDDLE, 'scared', { eyes: 'squeeze', mouth: 'O', emote: null }],
    [101.6, 'neutral', { lookX: 1 }], [102.2, 'shy', { lookX: .7, blush: 1 }], [103.3, 'content', { blush: .8 }],
  ];
  const lit = t => 1 - .7 * flashAt(t, STRIKES);   // characters' night shading, lifted by lightning
  const gustK = t => ease(seg(t, B(108), B(108) + .3)) * (1 - ease(seg(t, B(108) + .55, B(108) + 1.1)));
  function clawdStorm(t) {
    const mood = emotions(t, CL_STORM, { take: .85 });
    const nc = { col: mixCol(PAL.clay, NIGHT.shade, .3 * lit(t)), dk: mixCol(PAL.clayDk, NIGHT.shade, .3 * lit(t)), lt: mixCol('#F5B394', NIGHT.shade, .3 * lit(t)) };
    if (t < 87.55) return { x: 1355, y: 835, u: U, inside: true, o: addPose(mood, { view: 'front', seed: 5, noShadow: true }) };   // at his lit window
    if (t < 88.1) return { x: 1355, y: 835, u: U, gone: true, o: {} };                                                              // off to the door
    let x, y, p = { seed: 5 }, rot = 0, dy = 0, sq = 0;
    if (t < 88.45) {   // out through the door sideways, a hop down off the step
      const k = seg(t, 88.1, 88.45); x = lerp(1635, 1600, k); y = lerp(905, G, k); dy -= 1.4 * Math.sin(Math.PI * k);
      p = { ...p, view: 'side', flip: true };
    } else if (t < 89.75) {   // running to the cutting through the rain
      const k = seg(t, 88.45, 89.75); x = lerp(1600, HIS_LEAN[0], ease(k)); y = G;
      const m = move('run', t); p = { ...p, view: 'side', flip: true, walk: m.walk, smear: .35 }; dy += m.dy; rot -= .1;
    } else {   // planted behind it, leaning over it: his body is its roof
      x = HIS_LEAN[0]; y = G;
      p = { ...p, ...(t < 89.95 ? turn(t, 89.75, 89.95, -.25, 0) : { view: 'front' }) };
      rot -= .36 * ease(seg(t, 89.95, 90.35));
      const g = gustK(t); rot += .3 * g; x += 30 * g; if (g > .05) p.walk = t * 7;   // shoved by the gust, feet skidding, then digging back in
      rot -= .08 * ease(seg(t, HUDDLE, HUDDLE + .2));                                   // the crack: huddling closer, and staying there
      rot += .015 * Math.sin(t * 40) * (t < TOGETHER ? 1 : .3);                         // shivering
      if (t > 98.25 && t < 98.95) rot += .04 * Math.sin(Math.PI * seg(t, 98.6, 98.95));   // shifting to stop the water
      if (t > 100.2 && t < HUDDLE) dy -= .25 * Math.abs(Math.sin(t * 9));
    }
    const o = addPose(mood, { ...p, rot, dy, sq, ...nc });
    if (t > 88.45) o.draw = soakedHook(t, seg(t, 88.45, 89.5), 1);
    if (t > 89.9) { o.aL = -.2 + .1 * Math.sin(t * 3); o.aR = -.6; }
    return { x, y, u: U, o };
  }
  function herStorm(t) {
    const mood = emotions(t, HER_STORM, { take: .85 });
    if (t < 94.45) return { x: 335, y: 818, u: HU, inside: true, o: addPose(mood, { view: 'front', seed: 2, noShadow: true }) };   // at her lit window
    if (t < 94.85) return { x: 335, y: 818, u: HU, gone: true, o: {} };
    let x, y, p = { seed: 2, shade: .3 * lit(t), shadeCol: NIGHT.shade }, rot = 0, dy = 0;
    if (t < 95.15) { x = 685; y = 905; p = { ...p, view: 'side' }; }
    else if (t < 95.45) { const k = seg(t, 95.15, 95.45); x = lerp(685, 700, k); y = lerp(905, G, k); dy -= 1.2 * Math.sin(Math.PI * k); p = { ...p, view: 'side' }; }
    else if (t < 96.05) { const k = seg(t, 95.45, 96.05); x = lerp(700, HER_LEAN[0], ease(k)); y = G; const m = move('run', t); p = { ...p, view: 'side', walk: m.walk, smear: .3 }; dy += m.dy; rot += .1; }
    else {
      x = HER_LEAN[0]; y = G; p = { ...p, ...(t < 96.2 ? turn(t, 96.05, 96.2, .25, 0) : { view: 'front' }) };
      rot += .3 * ease(seg(t, 96.2, TOGETHER)) + .08 * ease(seg(t, HUDDLE, HUDDLE + .2));
      if (t > 98.25 && t < 98.95) { const k = seg(t, 98.3, 98.95); p.dx = .25 * Math.sin(k * TAU * 3) * (1 - k); }   // shaking the water off
      if (t > 99.87 && t < HUDDLE) dy -= .25 * Math.abs(Math.sin(t * 9 + 1));
    }
    const o = addPose(mood, { ...p, rot, dy });
    if (t > 95.45) o.draw = soakedHook(t, seg(t, 95.45, 96.4), 2);
    return { x, y, u: HU, o };
  }

  // body corners in world space for clawd(x, y, u, o): local [lx, ly] in u, about the feet, with the pose's rotation
  const corner = (q, lx, ly) => { const a = q.o.rot || 0, s = 1 - (q.o.sq || 0); return [q.x + (lx * Math.cos(a) - ly * s * Math.sin(a)) * q.u, q.y + (q.o.dy || 0) * q.u + (lx * Math.sin(a) + ly * s * Math.cos(a)) * q.u]; };
  // the sheltered space under the two of them, in screen space (for leaving rain out of it)
  function shelterPoly(c, h) {
    const cp = [corner(c, -5, 0), corner(c, -5, -8), corner(c, 5, -8), corner(c, 5, 0)];
    let P = [[cp[1][0], G + 30], cp[1], cp[2], cp[3]];
    if (h) { const hp = [corner(h, -5, 0), corner(h, -5, -8), corner(h, 5, -8)]; P = [hp[0], hp[1], hp[2], cp[1], cp[2], cp[3]]; }
    return P.map(([x, y]) => toScreen(x, y));
  }
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  const screenSpace = f => { push(); resetMatrix(); translate(-W / 2, -H / 2); f(); pop(); };

  // the rain that gathered on his slanting top pours off its low corner, onto her head
  function pour(t, c, h) {
    const k = seg(t, 98.15, 98.95); if (k <= 0 || k >= 1) return;
    boilSeed('pour');
    const [sx, sy] = corner(c, -5, -8), hy = sy + 78, a = Math.sin(Math.PI * k), P = [];   // down over her face
    for (let i = 0; i <= 5; i++) P.push([sx - 4 + 3 * Math.sin(t * 30 + i), lerp(sy, hy, i / 5)]);
    paint(ribbon(P, 7 * a, 12 * a), { wash: '#A9C4EA', washOp: 220, fill: '#E2EEFF', fillOp: 60, ink: PAL.ink, sw: .5 });
    for (let i = 0; i < 6; i++) {   // the splash on her head
      const ph = frac(t * 3 + i / 6), ang = -Math.PI / 2 + (i - 2.5) * .45, r = 8 + 30 * ph;
      paint(ellPts(sx + Math.cos(ang) * r, hy + Math.sin(ang) * r * .7 + 30 * ph * ph, 3.5 * (1 - ph), 4.5 * (1 - ph), 8), { wash: '#C9DCF6', ink: PAL.ink, sw: .35 });
    }
  }
  // warm steam rising off two cold, soaked, blushing bodies
  function steam(t, pts) {
    const k = seg(t, 102.25, 102.6) * (1 - seg(t, 103.6, 104.2)); if (k <= 0) return;
    pts.forEach(([x, y], j) => { for (let i = 0; i < 3; i++) {
      boilSeed('steam ' + j + ' ' + i);
      const ph = frac(t * .7 + i / 3 + j * .17), px = x + (i - 1) * 24, py = y - 14 - ph * 70, a = Math.sin(Math.PI * ph) * k, P = [];
      for (let q = 0; q < 6; q++) P.push([px + 7 * Math.sin(q * 1.2 + t * 4 + i), py - q * 9]);
      inkLine(P, 1.3 * a, '#F2E6DA', 'inkfine', .6);
    } });
  }

  function storm(t, lt, dur) {
    const [cx, cy, z] = cam(t), fk = flashAt(t, STRIKES), g = gustK(t);
    const cl = clawdStorm(t), her = herStorm(t);
    camBegin(cx, cy, z);
    const skyPal = { top: mixCol(NIGHT.sky.top, '#6C7AB8', fk * .8), low: mixCol(NIGHT.sky.low, '#8C98CC', fk * .8), cloud: NIGHT.sky.cloud };
    sky(t, 1, { pal: skyPal, clouds: 0 });
    stormClouds(t, 1, { col: mixCol('#2B3260', '#6A76B0', fk * .7), lt: mixCol('#4A5384', '#A3AEDB', fk * .7) });
    STRIKES.forEach((s, i) => { if (i % 2 === 0) bolt(380 + 520 * i, -260, 560, (t - s) / .35, i); });
    backdrop(t, 1, null, { tree: NIGHT.tree, treeDk: NIGHT.treeDk, hedge: NIGHT.hedge, band: NIGHT.treeDk, pole: NIGHT.pole, wire: NIGHT.wire, sway: 22 + 30 * g });
    screenSpace(() => rainScreen(t, { n: 55, len: 30, speed: 1100, slant: -.34 - .4 * g, col: '#5D6C9A', w: .6, seed: 1 }));   // back rain
    const inside = (who, draw, gl) => who.inside || who.gone ? (win => { glow(win[0] + 40, win[1] + 30, 160, '#FFD27A', gl); if (who.inside) draw(); }) : null;
    house(...SET.her, { side: 'her', wall: NIGHT.wallHer, roof: NIGHT.roofHer, door: NIGHT.doorHer, plinth: NIGHT.plinth, frame: NIGHT.frame, step: NIGHT.step,
      curtain: NIGHT.curtainHer, curtainW: .1, lit: her.inside || her.gone ? .3 : 1, rainGlass: 1, doorOpen: ease(seg(t, B(112), B(112) + .16)),   // softer glow over her pink
      inside: inside(her, () => heroine(her.x, her.y, her.u, her.o), .3), room: '#C98E5C' });
    house(...SET.his, { side: 'his', wall: NIGHT.wallHis, roof: NIGHT.roofHis, door: NIGHT.doorHis, plinth: NIGHT.plinth, frame: NIGHT.frame, step: NIGHT.step,
      curtain: NIGHT.curtainHis, curtainW: .1, lit: 1, rainGlass: 1, lived: 1, doorOpen: ease(seg(t, B(104), B(104) + .16)),
      inside: inside(cl, () => clawd(cl.x, cl.y, cl.u, cl.o), .8), room: '#D9A866' });
    yard(t, { ground: NIGHT.ground, groundDk: NIGHT.groundDk, grass: NIGHT.grass, pebble: NIGHT.pebble, wind: 2 + 2 * g });
    puddles([[560, G + 46, 120], [1260, G + 70, 150], [1700, G + 40, 90], [330, G + 110, 160]], { light: 1 });
    clothesline();
    fence({ fence: NIGHT.fence, fenceDk: NIGHT.fenceDk });
    const out = q => !q.inside && !q.gone;
    if (out(cl)) clawd(cl.x, cl.y, cl.u, cl.o);
    if (out(her)) heroine(her.x, her.y, her.u, her.o);
    // the cutting, nearer than the two of them: thrashing, calm under his lean, bared by the gust, and then its first bud
    const sheltered = ease(seg(t, 89.95, 90.4)) * (1 - g);
    cutting(...CUT, 25, { g: .18, sway: lerp(-.85 + .25 * Math.sin(t * 7) + .1 * Math.sin(t * 17), -.05 + .03 * Math.sin(t * 2), sheltered),
      bounce: sheltered > .5 ? null : frac(t * 2.2) / 2.2, bud: ease(seg(t, BUD, BUD + .35)), budAge: t - BUD });
    if (out(cl) && out(her) && t > TOGETHER) {
      pour(t, cl, her);
      steam(t, [corner(cl, -1, -8), corner(her, 1, -8)]);
      const hk = seg(t, 103.75, 104.05) * (1 - seg(t, 105.2, 105.6));   // a small heart rising from where their heads meet
      if (hk > 0) { const [ax, ay] = corner(cl, -5, -8); boilSeed('heart'); emote('heart', ax + 10, ay - 30 - 40 * seg(t, 103.75, 105.6), 13, hk, t - 103.75); }
    }
    splashes(t, 200, 1900, G + 8, G + 160, { n: 30, col: '#93A5D2' });
    const P = out(cl) && t > 90 ? shelterPoly(cl, out(her) && t > TOGETHER - .1 ? her : null) : null;
    camEnd();
    // front rain over everything but the sheltered space (the gust drives it sideways), then the lightning
    rainScreen(t, { n: 60 + Math.round(30 * g), len: 54, speed: 1650, slant: -.3 - .5 * g, col: '#A9BADD', w: .85, seed: 2, skip: P ? (x, y) => inPoly(P, x, y) : null });
    grade(1, '#1A2044', 40);
    flash(fk * .55, '#E9EEFF');
    boilSeed('transition');
    if (lt < .25) flash((1 - lt / .25) * .9, '#EEF2FF');                     // out of the strike that cut here
    if (t > T_END - .6) rainWipe((t - (T_END - .6)) / 1.2);                  // full cover at 107.625: stage 3 drains it away
  }

  shots([[T0, dusk], [T_STORM, storm]]);
  window.STAGE2 = { her: herDusk, clawd: clawdDusk, cat: catDusk, herStorm, clawdStorm, cam, fanA, breezeAtX };
})();
