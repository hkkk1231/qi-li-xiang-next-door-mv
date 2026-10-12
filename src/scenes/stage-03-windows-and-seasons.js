// stage-03-windows-and-seasons.js: STAGE 3 of 《隔壁》, song time 107.625–161.250 s (frames 2583–3869): the second
// half of chorus 1 and the interlude. Storyboard: docs/storyboard/stage-03.md. Stage 2 hands over under a full rain wipe.
//   107.6–135.3  Two lit windows across the rain, the same night. Each is home at their own window under a little
//                hanging lamp. They catch each other looking and both duck. He hops and bonks his lamp: his window goes
//                dark, then lit again. She gets it and answers. A conversation in lamplight, in turns, then in step.
//                Goodnight: both lamps out together... a moment later both back on at once: caught. A shy laugh, and
//                out for real. The rain stops and the camera rises into a clearing night sky.
//   135.3–161.25 The interlude: the season turns on the fixed courtyard, a bar a scene, the wind turning the days.
//                Mornings both doors open together; the cat sleeps on the fence; the cutting grows and fills with buds;
//                the trees go gold. His watering can waters the cat instead (offended, it picks HER head this time); she
//                is out first one morning; another, both sneak out before dawn to be first; a sunset leaning on the
//                fence; asleep at their windows; an autumn morning whirls leaves between them, and they meet over the
//                budding cutting. An autumn brush wipe covers the frame at 161.250 for stage 4.
// Every pose is a pure function of song time t. Nothing is gripped: a lamp is switched by bonking it with a hop, the can
// rides on his flat top and tips with him, the cat rides on her head; arms only wave, pat and touch.
(() => {
  const U = 20, HU = U * HER_K, CS = .9 * U, B = n => OFF + n * BEAT, HB = n => B(n + .5);
  const T0 = 107.625, T_DAWN = B(160), T_END = 161.25;
  const CUT = [968, G + 14], DOOR = { her: 685, his: 1635 };
  const screenSpace = f => { push(); resetMatrix(); translate(-W / 2, -H / 2); f(); pop(); };

  // ---------- light ----------
  // stage 2's night, so the storm and this night are one night
  const NIGHT = {
    sky: { top: '#1C2246', low: '#2B3460', cloud: '#333C66' },
    wallHer: '#4E5476', wallHis: '#494F70', plinth: '#3E4462', roofHer: '#262D4A', roofHis: '#2A3048', doorHer: '#36585C', doorHis: '#5E4A3C',
    frame: '#34405A', step: '#4E5270', ground: '#3E4159', groundDk: '#30324A', grass: '#435C4E', pebble: '#53566E', fence: '#7E8298', fenceDk: '#565A72',
    tree: '#2E4846', treeDk: '#233838', hedge: '#2F4747', pole: '#4A4E66', wire: '#141830', curtainHer: '#F2B7A8', curtainHis: '#F0CF8E',
  };
  const DARK = '#1E2342';   // a room with its lamp off
  const NIGHT_SET = {
    tree: NIGHT.tree, treeDk: NIGHT.treeDk, hedge: NIGHT.hedge, grass: NIGHT.grass, ground: NIGHT.ground, groundDk: NIGHT.groundDk, pebble: NIGHT.pebble,
    wallHer: NIGHT.wallHer, wallHis: NIGHT.wallHis, plinth: NIGHT.plinth, roofHer: NIGHT.roofHer, roofHis: NIGHT.roofHis, doorHer: NIGHT.doorHer, doorHis: NIGHT.doorHis,
    frame: NIGHT.frame, glass: '#3A4468', step: NIGHT.step, curtainHer: mixCol(NIGHT.curtainHer, DARK, .65), curtainHis: mixCol(NIGHT.curtainHis, DARK, .65),
    fence: NIGHT.fence, fenceDk: NIGHT.fenceDk, pole: NIGHT.pole, wire: NIGHT.wire, room: DARK,
  };
  const SKIES = {
    night:   { top: '#1C2246', low: '#2B3460', cloud: '#333C66' },
    predawn: { top: '#283262', low: '#7C74AA', cloud: '#525A8E' },
    dawn:    { top: '#8A9BD2', low: '#FFB487', cloud: '#FFD6BE' },
    morning: { top: '#A2CDEA', low: '#F9E6C8', cloud: '#FFF8EC' },
    noon:    { top: '#94C6EA', low: '#E2F1F4', cloud: '#FDFAF2' },
    sunset:  { top: '#8E86C6', low: '#FFAE6E', cloud: '#FFC9A2' },
    autumn:  { top: '#9DC3E4', low: '#FBE0B4', cloud: '#FFF2DC' },
  };
  // the light over the set: [colour, amount] mixed into the day colours, then a screen grade [colour, amount]
  const TINTS = {
    night: ['#20264C', .72, '#1A2044', 40], predawn: ['#46528C', .5, '#222A5A', 36], dawn: ['#F59F7A', .27, '#F7A276', 30],
    morning: ['#F7D49A', .08, '#F7C27A', 14], noon: ['#FFFFFF', 0, '#F7C27A', 6], sunset: ['#F7A86E', .4, '#FA9E52', 40], autumn: ['#F2B062', .16, '#F7BE6E', 22],
  };
  // the season: summer green → gold → orange (a = 0..1), on the trees, the hedge and the grass
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
    boilSeed('sun 3');
    paint(ellPts(x, y, r * 3, r * 3, 24, 4), { fill: halo, fillOp: 90 * k, bleed: .35, tex: .2, ink: null });
    paint(ellPts(x, y, r, r, 22, 1), { wash: disk, washOp: 255 * k, fill: PAL.ochre, fillOp: 35 * k, ink: k > .6 ? mixCol(PAL.ink, disk, .55) : null, sw: .6 });
  }

  // =====================================================================================================
  // PART A: the same night, at their windows (107.625–135.31)
  // =====================================================================================================
  // Each bonk is a hop whose head hits the lamp at that moment and switches it (the lamp starts on).
  const BONK_C = [B(137), B(139), B(142), HB(142), B(144), HB(144), B(146), HB(146), B(148), HB(148), B(149), HB(149), B(154), B(156), B(159)];
  const BONK_H = [B(140), B(141), B(143), HB(143), B(145), HB(145), B(147), HB(147), B(148), HB(148), B(149), HB(149), B(154), B(156), B(159)];
  const lampOn = (t, bonks) => bonks.filter(b => t >= b).length % 2 === 0;
  // standing at the window, a little back from the glass (so drawn at .85 of their size outside, with room inside the
  // frame for the arm that waves): the feet are hidden below the sill, the top of the head 17 px under the lamp
  const WIN = {
    her: { x: 335, y: 805, u: HU * .85, hop: 1.65, bonks: BONK_H, lamp: [335, 598, 50], shade: '#F7D3DC', room: '#C98E5C', seed: 2, glow: .3 },
    his: { x: 1355, y: 824, u: U * .85, hop: 1.45, bonks: BONK_C, lamp: [1355, 598, 50], shade: '#F2DDB2', room: '#D9A866', seed: 5, glow: .55 },
  };
  // both catch the other looking and duck below the sill, peek back up, and are caught peeking (dy in body units)
  const DUCK = [[B(133) - .03, 0], [B(133) + .13, 8], [B(134), 8], [B(134) + .55, 2.5], [B(135) - .06, 2.5], [B(135) + .2, 0]];
  const duck = t => t < DUCK[0][0] || t > DUCK[DUCK.length - 1][0] ? 0 : kf(t, DUCK);
  const WAVES = { his: [[B(139), B(140) - .1], [B(152), B(154) - .15]], her: [[B(141), B(142) - .05], [B(152), B(154) - .15]] };
  const BLINKS = { his: [116.62, 130.95, 131.55], her: [118.85, 130.8, 131.42] };
  const waving = (t, list) => list.reduce((s, [a, b]) => Math.max(s, ease(seg(t, a, a + .15)) * (1 - ease(seg(t, b - .15, b)))), 0);

  const CL_A = [
    [T0, 'content', { lookX: -.55, lookY: .35, blush: .55 }],                  // dreaming at his window, looking down at the yard
    [B(132), 'neutral', { lookX: -1, lookY: -.1 }],                             // a glance over at her window...
    [112.18, 'surprised', { lookX: -1 }],                                       // ...and she is looking at his
    [B(133) + .06, 'shy', { lookX: -1, lookY: -.3, emote: null }],             // ducked
    [B(134), 'nervous', { lookX: -1, lookY: -.2, emote: null, tint: null }],   // peeking over the sill
    [B(135), 'shy', { lookX: -.8, lookY: .1, mouth: 'cat' }],                   // both caught peeking: a shy smile
    [B(136), 'idea', { lookX: -.5 }],                                           // an idea!
    [116.3, 'mischief', { lookX: -1 }],                                         // in the dark: did she see?
    [B(139) + .05, 'happy', { lookX: -.9 }],                                    // lit again, waving
    [B(140) - .2, 'hopeful', { lookX: -1 }],                                    // her turn
    [B(141) + .05, 'laugh'],                                                    // she answered!
    [B(142) - .1, 'excited', { emote: null }],                                  // a double blink back
    [121.2, 'happy', { lookX: -.9 }],                                           // turn and turn about
    [B(150), 'surprised', { lookX: -1, emote: null }],                          // blinking in step with her!
    [127.2, 'shy', { lookX: .5, lookY: .2 }],                                   // looks away, blushing
    [B(151), 'content', { lookX: -.8, blush: .85 }],
    [B(152), 'happy', { lookX: -1 }],                                           // goodnight
    [130.35, 'neutral', { lookX: -1 }],                                         // in the dark, still at the window
    [131.2, 'sad', { lookX: -1, lookY: .3, emote: null, gloom: 0, tint: null }],
    [B(156) + .03, 'surprised', { lookX: -1 }],                                 // both lamps back on at once: caught!
    [132.45, 'shy', { lookX: .6, lookY: .2 }],
    [133.2, 'laugh'],
    [134.0, 'content', { blush: .8 }],
  ];
  const HER_A = [
    [T0, 'content', { lookX: .55, lookY: .35, blush: .55 }],
    [B(132), 'neutral', { lookX: 1, lookY: -.1 }],
    [112.18, 'surprised', { lookX: 1 }],
    [B(133) + .06, 'shy', { lookX: 1, lookY: -.3, emote: null }],
    [B(134), 'nervous', { lookX: 1, lookY: -.2, emote: null, tint: null }],
    [B(135), 'shy', { lookX: .8, lookY: .1, mouth: 'cat' }],
    [B(136) + .1, 'neutral', { lookX: 1 }],                                     // what's he doing?
    [B(137) + .05, 'surprised', { lookX: 1 }],                                  // his window went dark
    [B(138), 'confused', { lookX: 1 }],
    [B(139) + .05, 'surprised', { lookX: 1, emote: null }],                     // lit again: he's waving
    [118.0, 'idea', { lookX: .8 }],                                             // oh! like this
    [B(141) + .05, 'laugh'],                                                    // lit again, waving back
    [B(142), 'happy', { lookX: 1 }],
    [B(143) - .1, 'playful'],                                                   // her double blink
    [121.6, 'happy', { lookX: .9 }],
    [B(150), 'surprised', { lookX: 1, emote: null }],
    [127.2, 'shy', { lookX: -.5, lookY: .2 }],
    [B(151), 'content', { lookX: .8, blush: .85 }],
    [B(152), 'happy', { lookX: 1 }],
    [130.35, 'neutral', { lookX: 1 }],
    [131.2, 'sad', { lookX: 1, lookY: .3, emote: null, gloom: 0, tint: null }],
    [B(156) + .03, 'surprised', { lookX: 1 }],
    [132.45, 'shy', { lookX: -.6, lookY: .2 }],
    [133.2, 'laugh'],
    [134.0, 'content', { blush: .8 }],
  ];
  function atWindow(t, who, keys) {
    const P = WIN[who], mood = emotions(t, keys || (who === 'her' ? HER_A : CL_A), { take: .7 });
    // each hop takes off just before its bonk, so the head meets the lamp (and it switches) on the beat, rising
    const hop = P.bonks.reduce((s, b) => { const j = jump(t, b - .07, b + .27, P.hop); return [s[0] + j.dy, s[1] + j.sq]; }, [0, 0]);
    const o = { ...mood, view: 'front', seed: P.seed, noShadow: true, boilKey: who };
    if (who === 'her') o.tint = null;                                    // her own colours under every mood
    o.dy = Math.max(-.35, (mood.dy || 0) * .3) + hop[0] + duck(t);       // the mood's bounce is kept low: the lamp is just above
    o.sq = clamp((mood.sq || 0) * .35, -.03, .04) + hop[1]; o.rot = (mood.rot || 0) * .5; o.dx = (mood.dx || 0) * .3;   // no big takes under the lamp either
    o.take = 0;
    const w = waving(t, WAVES[who] || []);
    if (w > 0) { const a = 1.55 + .25 * Math.sin(TAU * 2.2 * t); if (who === 'her') o.aR = lerp(o.aR ?? .2, a, w); else o.aL = lerp(o.aL ?? .2, a, w); }
    return { x: P.x, y: P.y, u: P.u, o, on: lampOn(t, P.bonks) };
  }
  // in the dark only their eyes show, two pale glints looking across
  function glints(t, q, blinks) {
    const o = q.o, u = q.u, sq = (o.sq || 0) + (o.take || 0), r = o.rot || 0, c = Math.cos(r), s = Math.sin(r);
    const lx = (o.lookX || 0) * .5 * u, ly = (o.lookY || 0) * .4 * u, bx = q.x + (o.dx || 0) * u, by = q.y + (o.dy || 0) * u;
    const shut = blinks.some(b => t > b && t < b + .13) || ['closed', 'happy', 'squeeze', 'sleepy'].includes(o.eyes);
    for (const e of [-1, 1]) {
      const ex = (e * 2.5 * u + lx) * (1 + sq * .6), ey = (-6 * u + ly) * (1 - sq), wx = bx + ex * c - ey * s, wy = by + ex * s + ey * c;
      boilSeed('glint ' + e);
      if (shut) inkLine([[wx - .45 * u, wy + .1 * u], [wx, wy + .3 * u], [wx + .45 * u, wy + .1 * u]], 1.3, '#FFF1CF', 'inkfine', .5);
      else paint(ellPts(wx, wy, .38 * u, .6 * u, 10), { wash: '#FFF1CF', ink: null });
    }
  }
  // what is behind the glass: the lamp, whoever stands at the window, the lamplight (or, lamp off, just the eyes)
  function windowRoom(t, who, q, o = {}) {
    const P = WIN[who];
    return () => {
      const top = topOf(q.x, q.y, q.u, q.o), [px, py, L] = P.lamp;
      const lift = Math.max(0, py + L + 23 - top.y);
      const swing = P.bonks.reduce((s, b, i) => s + (i % 2 ? .15 : -.2) * spring(t, b, 3, 9), 0) + (o.sway || 0);
      const lamp = pendant(px, py, L, swing, lift, q.on, { key: who, shade: q.on ? P.shade : mixCol(P.shade, DARK, .7) });
      const draw = p => who === 'her' ? heroine(q.x, q.y, q.u, p) : clawd(q.x, q.y, q.u, p);
      if (q.on) {
        draw({ ...q.o, emote: null });
        glow(lamp.bulb[0], lamp.bulb[1] + 4, 130, '#FFD9A0', .45);
      } else {
        const dark = { ...q.o, tint: null, blush: 0, emote: null, gloom: 0 };
        if (who === 'her') draw({ ...dark, shade: .76, shadeCol: DARK });
        else draw({ ...dark, col: mixCol(PAL.clay, DARK, .76), dk: mixCol(PAL.clayDk, DARK, .76), lt: mixCol('#F5B394', DARK, .76) });
        glints(t, q, BLINKS[who] || []);
      }
    };
  }
  // their reactions show outside the window, over it or beside it on the side facing the other (the wall would hide them)
  function windowEmote(q, who) {
    if (!q.on || !q.o.emote || (q.o.emoteK ?? 1) <= .01) return;
    const top = EMOTE_TOP.includes(q.o.emote), x = top ? WIN[who].x : who === 'her' ? 456 : 1236;
    boilSeed('window emote ' + who);
    emote(q.o.emote, x, top ? 626 : 690, q.u * .9, q.o.emoteK ?? 1, q.o.emoteAge || 0);
  }
  // a raindrop gathers under the new bud and falls
  function budDrop(t, sway) {
    const tf = B(129), h = (3.4 + 2.6 * .18) * 25, bx = 968 + sway * h * .45 - 4, by = G + 14 - h + 1;
    if (t > tf + .62) return;
    boilSeed('bud drop');
    if (t < tf) { const r = 1.2 + 3.6 * ease(seg(t, T0 + .2, tf)); paint(ellPts(bx, by + r * 1.1, r * .8, r * 1.1, 10), { wash: '#C6D8F4', ink: PAL.ink, sw: .4 }); return; }
    const k = seg(t, tf, tf + .3);
    if (k < 1) { paint(ellPts(bx, lerp(by + 5, G + 16, k * k), 3.2, 4.6, 8), { wash: '#C6D8F4', ink: PAL.ink, sw: .4 }); return; }
    const a = seg(t, tf + .3, tf + .62);
    for (const s of [-1, 1]) inkLine([[bx + s * 3, G + 16], [bx + s * (6 + 10 * a), G + 16 - 9 * (1 - a)]], .8 * (1 - a), '#C6D8F4', 'inkfine', .3);
  }

  const CAM_A = [
    [T0, [968, 856, 3.1]], [109.55, [966, 852, 3.02]], [111.45, [845, 726, 1.42]],
    [114.99, [845, 726, 1.42]], [115.0, [1355, 716, 2.4]], [116.6, [1356, 718, 2.48]],      // close on his window: the idea, the bonk
    [116.61, [336, 720, 2.55]], [117.4, [337, 721, 2.6]],                                    // close on hers: ?
    [117.41, [845, 726, 1.42]], [121.6, [845, 726, 1.42]], [125.0, [845, 732, 1.5]], [128.3, [845, 732, 1.52]],
    [129.6, [845, 726, 1.42]], [131.85, [845, 726, 1.42]], [133.3, [845, 730, 1.5]], [134.15, [845, 730, 1.5]],
    [T_DAWN, [1000, 160, 1.15]],                                                              // up into the clearing sky
  ];
  const drift = t => [8 * Math.sin(t * .41), 4 * Math.sin(t * .33 + 2), .004 * Math.sin(t * .27)];
  const camA = t => { const [cx, cy, z] = kf(t, CAM_A), [dx, dy, dz] = drift(t); return [cx + dx, cy + dy, z * (1 + dz)]; };

  function nightWindows(t, lt) {
    const [cx, cy, z] = camA(t), rain = 1 - ease(seg(t, 133.5, 134.8)), clear = ease(seg(t, 134.1, 135.2));
    const her = atWindow(t, 'her'), cl = atWindow(t, 'his');
    camBegin(cx, cy, z);
    sky(t, 1, { pal: NIGHT.sky, clouds: 0 });
    starField(t, clear);
    moon(1420, 40, 34, ease(seg(t, 134.5, 135.1)));
    stormClouds(t, 1 - clear * .85, { col: '#2B3260', lt: '#4A5384' });
    backdrop(t, 1, null, { tree: NIGHT.tree, treeDk: NIGHT.treeDk, hedge: NIGHT.hedge, band: NIGHT.treeDk, pole: NIGHT.pole, wire: NIGHT.wire, sway: 6 * rain });
    if (rain > .02) screenSpace(() => rainScreen(t, { n: Math.round(40 * rain), len: 26, speed: 900, slant: -.12, col: '#5D6C9A', w: .55, seed: 11 }));
    const win = (q, who) => ({ curtain: q.on ? NIGHT[who === 'her' ? 'curtainHer' : 'curtainHis'] : NIGHT_SET[who === 'her' ? 'curtainHer' : 'curtainHis'],
      curtainW: .06, lit: q.on ? WIN[who].glow : 0, rainGlass: rain, room: q.on ? WIN[who].room : DARK, inside: windowRoom(t, who, q) });
    house(...SET.her, { side: 'her', wall: NIGHT.wallHer, roof: NIGHT.roofHer, door: NIGHT.doorHer, plinth: NIGHT.plinth, frame: NIGHT.frame, step: NIGHT.step, ...win(her, 'her') });
    house(...SET.his, { side: 'his', wall: NIGHT.wallHis, roof: NIGHT.roofHis, door: NIGHT.doorHis, plinth: NIGHT.plinth, frame: NIGHT.frame, step: NIGHT.step, lived: 1, ...win(cl, 'his') });
    windowEmote(her, 'her'); windowEmote(cl, 'his');
    yard(t, { ground: NIGHT.ground, groundDk: NIGHT.groundDk, grass: NIGHT.grass, pebble: NIGHT.pebble, wind: .4 * rain });
    puddles([[560, G + 46, 120], [330, G + 110, 160]], { light: her.on ? .8 : 0 });
    puddles([[1260, G + 70, 150], [1700, G + 40, 90]], { light: cl.on ? 1 : 0 });
    clothesline();
    fence({ fence: NIGHT.fence, fenceDk: NIGHT.fenceDk });
    const sway = (-.05 + .03 * Math.sin(t * 2)) * rain;
    cutting(...CUT, 25, { g: .18, sway, bud: 1, budAge: 9 });
    budDrop(t, sway + .04 * Math.sin(t * 1.3));
    if (rain > .02) splashes(t, 200, 1900, G + 8, G + 160, { n: Math.round(22 * rain), col: '#93A5D2' });
    camEnd();
    if (rain > .02) rainScreen(t, { n: Math.round(44 * rain), len: 46, speed: 1300, slant: -.1, col: '#A9BADD', w: .75, seed: 12 });
    grade(1, '#1A2044', 40);
    boilSeed('transition');
    if (lt < .6) rainWipe(.5 + lt / 1.2);   // stage 2's rain wipe drains away
  }

  // =====================================================================================================
  // PART B: the interlude, the season turning on the fixed courtyard (135.31–161.25)
  // =====================================================================================================
  const WIDE = [1000, 700, 1.1];
  function camB(t) {
    if (t < T_DAWN + .8) {   // coming down out of the night sky as it turns to dawn
      const k = seg(t, T_DAWN, T_DAWN + .75), [cx, cy, z] = kf(t, [[T_DAWN, [1000, 160, 1.15]], [T_DAWN + .75, WIDE]]), [dx, dy, dz] = drift(t);
      return [cx + dx * (1 - k), cy + dy * (1 - k), z * (1 + dz * (1 - k))];
    }
    return t < 159.4 ? WIDE : kf(t, [[159.4, WIDE], [160.95, [968, 846, 2.3]]]);
  }

  // ---------- shared moves ----------
  // out through the front door sideways (wider than the doorway) and a hop down off the step; dir +1 = to the right
  function outDoor(t, t0, who, dir) {
    const k = seg(t, t0 + .06, t0 + .4);
    return { x: DOOR[who] + dir * 40 * ease(k), y: lerp(SET.wallBase, G, ease(k)), dy: -1.3 * Math.sin(Math.PI * k) };
  }
  // a wave between a and b: [how far into it 0..1, the arm's angle]
  const wave = (t, a, b, f = 2.2) => [ease(seg(t, a, a + .15)) * (1 - ease(seg(t, b - .15, b))), 1.15 + .45 * Math.sin(TAU * f * t)];
  const fenceCat = o => ({ on: 'fence', x: FX, y: FENCE.top - 4, o: { noShadow: true, ...o } });
  // her and him as cast entries: [depth, draw]
  const herDraw = (x, y, o) => [y, () => heroine(x, y, HU, { boilKey: 'her', seed: 2, ...o, tint: null })];
  const hisDraw = (x, y, o) => [y + .1, () => clawd(x, y, U, { boilKey: 'his', seed: 5, ...o })];

  // A morning: out of the door, maybe a stretch, then turning to see the other one (who = 'her' | 'his')
  function morning(t, td, who, keys, o = {}) {
    if (t < td) return null;
    const dir = who === 'her' ? 1 : -1, d = outDoor(t, td, who, dir), mood = emotions(t, keys, { take: .8 });
    let p;
    if (t < td + .4) p = { view: 'side', flip: dir < 0 };
    else if (t < o.see) p = turn(t, td + .4, td + .52, dir * .25, 0);
    else p = turn(t, o.see, o.see + .12, 0, dir * .125);
    const q = addPose(mood, { ...p, dy: d.dy, ...(o.pose || {}) });
    if (o.stretch) {
      const st = Math.sin(Math.PI * seg(t, td + .55, td + 1.15));
      if (st > 0) { q.aL = lerp(q.aL ?? .2, 1.55, st); q.aR = lerp(q.aR ?? .2, 1.55, st); q.sq = (q.sq || 0) - .14 * st; q.eyes = 'closed'; }
    }
    if (o.wave) { const [w, a] = wave(t, ...o.wave); if (w > 0) q.aR = lerp(q.aR ?? .2, a, w); }
    return { x: d.x, y: d.y, o: q };
  }

  // ---------- V1 (bar 40): dawn; both doors open together; they see each other ----------
  const TD1 = B(161);
  const H1 = [[TD1, 'neutral', { lookX: .3 }], [TD1 + .5, 'content'], [137.3, 'surprised', { lookX: 1 }], [B(163), 'shy', { lookX: 1, lookY: .1, mouth: 'cat' }]];
  const C1 = [[TD1, 'neutral', { lookX: -.3 }], [TD1 + .5, 'content'], [137.3, 'surprised', { lookX: -1 }], [B(163), 'shy', { lookX: -1, lookY: .1, mouth: 'cat' }]];
  function v1(t) {
    const k = ease(seg(t, T_DAWN, T_DAWN + .65)), door = ease(seg(t, TD1 - .1, TD1 + .08));
    const low = { shadowDx: 2.6, shadowW: 1.6 };
    const her = morning(t, TD1, 'her', H1, { see: 137.3, stretch: true, wave: [B(163), B(164) + .2, 1.6], pose: low });
    const cl = morning(t, TD1, 'his', C1, { see: 137.3, stretch: true, wave: [B(163) + .1, B(164) + .2, 1.6], pose: low });
    const look = t < 137.35 ? 0 : t < 137.95 ? (t < 137.65 ? -.6 : .6) : 0;
    return {
      C: mixSet(NIGHT_SET, setCols(0, 'dawn'), k), skyPal: mixPal(SKIES.night, SKIES.dawn, k), clouds: 0, storm: [.15, k],
      sun: [250, lerp(520, 405, ease(seg(t, T_DAWN + .2, T_DAWN + 1.2))), 54, ease(seg(t, T_DAWN + .25, T_DAWN + .9)), '#FFBE86', '#FFDDA8'],
      stars: 1 - k, moon: [1420, lerp(40, 90, k), 34, 1 - ease(seg(t, T_DAWN, T_DAWN + .5))], grade: [mixCol('#1A2044', '#F6A880', k), lerp(40, 22, k)],
      doors: { her: door, his: door }, cat: fenceCat({ pose: 'loaf', eyes: look ? 'open' : 'closed', look, curl: 1 }),
      plant: { g: .2, s: 25, buds: [] },
      cast: [her && herDraw(her.x, her.y, her.o), cl && hisDraw(cl.x, cl.y, cl.o)],
    };
  }

  // ---------- V2 (bar 41): the next morning, doors together again: they both laugh ----------
  const TD2 = B(165);
  const H2 = [[TD2, 'neutral'], [TD2 + .45, 'happy'], [B(166), 'laugh'], [B(167) + .4, 'happy', { lookX: 1 }]];
  const C2 = [[TD2, 'neutral'], [TD2 + .45, 'happy'], [B(166), 'laugh'], [B(167) + .4, 'happy', { lookX: -1 }]];
  function v2(t) {
    const door = ease(seg(t, TD2 - .1, TD2 + .08));
    const sun = { shadowDx: 1.5, shadowW: 1.3 };
    const her = morning(t, TD2, 'her', H2, { see: B(166) - .1, wave: [B(166), B(168) + .2, 2.4], pose: sun });
    const cl = morning(t, TD2, 'his', C2, { see: B(166) - .1, wave: [B(166) + .08, B(168) + .2, 2.4], pose: sun });
    const yawn = t > 140.55 && t < 141.15;
    return {
      C: setCols(.06, 'morning'), skyPal: SKIES.morning, clouds: 5, drift: 1300, sun: [430, 255, 48, 1, '#FFF1D2', '#FFF8E6'], grade: TINTS.morning.slice(2),
      doors: { her: door, his: door }, cat: fenceCat({ pose: 'sit', eyes: 'closed', mouth: yawn ? 'yawn' : null, headTilt: yawn ? -.15 : 0 }),
      plant: { g: .25, s: 25.5, buds: [.7] },
      cast: [her && herDraw(her.x, her.y, her.o), cl && hisDraw(cl.x, cl.y, cl.o)],
    };
  }

  // ---------- V3 (bar 42): noon; his watering can waters the cat napping at the plant's foot; it leaps onto HER head ----------
  const XH3 = 845, XC3 = 1190, SPLASH = B(169), LEAP = [143.3, B(170)], NAP = [1030, G + 14];   // where the cat naps, its head right beside the plant
  const H3 = [[B(168), 'content'], [142.95, 'surprised', { lookX: 1, lookY: -.2, emote: null }], [LEAP[1] + .03, 'surprised', { lookY: -1, emote: null }], [144.05, 'love', { tint: null }], [B(171), 'laugh']];
  const C3 = [[B(168), 'determined'], [142.97, 'surprised', { lookX: -1 }], [143.55, 'sheepish'], [144.45, 'happy', { lookX: -1 }]];
  function her3(t) {
    const mood = emotions(t, H3, { take: .8 }), tap = [142.27, 142.68].reduce((s, b) => s + Math.exp(-Math.pow((t - b) / .09, 2)), 0);
    const pat = ease(seg(t, B(168), B(168) + .15)) * (1 - ease(seg(t, 142.8, 142.95)));
    const o = addPose(mood, { view: 'q', rot: .16 * pat });
    if (pat > 0) o.aR = lerp(o.aR ?? .2, -.35 - .25 * tap, pat);   // patting the cutting's top leaves (the far arm reaches across)
    if (t > LEAP[1]) o.sq = (o.sq || 0) + .2 * Math.exp(-(t - LEAP[1]) * 7) * Math.cos((t - LEAP[1]) * 16);   // the cat lands
    return { x: XH3, y: G, o };
  }
  function his3(t) {
    const mood = emotions(t, C3, { take: .8 }), lean = -.38 * ease(seg(t, 142.45, 142.85)) * (1 - ease(seg(t, 143.25, 143.65)));
    return { x: XC3, y: G, o: addPose(mood, { view: 'q', flip: true, rot: lean, dy: 0 }) };
  }
  function cat3(t) {
    if (t < SPLASH) return { on: 'ground', x: NAP[0], y: NAP[1], o: { pose: 'loaf', flip: true, eyes: 'closed', curl: 1 } };
    if (t < LEAP[0]) {   // soaked awake: up on its feet, puffed, glaring up at him
      const a = t - SPLASH;
      return { on: 'ground', x: NAP[0], y: NAP[1], o: { pose: 'stand', flip: true, eyes: 'wide', sq: -.22 * Math.exp(-a * 3) + .05 * Math.sin(a * 40) * Math.exp(-a * 6), look: -.8, headTilt: .15 } };
    }
    const h = her3(t), top = topOf(h.x, h.y, HU, h.o);
    if (t < LEAP[1]) { const k = seg(t, LEAP[0], LEAP[1]), p = arcPt(NAP, [top.x, top.y], 95, k); return { on: 'air', x: p[0], y: p[1], o: { pose: 'leap', flip: true, rot: lerp(.35, -.2, k), noShadow: true } }; }
    const a = t - LEAP[1], shake = a < .45 ? .14 * Math.sin(a * 42) * (1 - a / .45) : 0;
    return { on: 'her', x: top.x, y: top.y, o: a < .5 ? { pose: 'stand', flip: true, rot: top.rot + shake, sq: .15 * Math.exp(-a * 8) * Math.cos(a * 16), look: -.3, noShadow: true }
      : { pose: 'loaf', flip: true, rot: top.rot, eyes: 'closed', curl: ease(seg(a, .5, 1.0)), noShadow: true } };
  }
  function water3(t, cl) {
    const top = topOf(cl.x, cl.y, U, cl.o), spout = wateringCan(top.x, top.y, 22, top.rot, { key: 'can' });
    const flow = clamp((-top.rot - .18) / .1);
    if (flow <= .02) return;
    boilSeed('water');
    const v = 170, g = 1500, yStop = t < LEAP[0] ? NAP[1] - 44 : G + 6, P = [];
    for (let i = 0; i <= 14; i++) {
      const s = i * .04, x = spout.x + spout.dir[0] * v * s, y = spout.y + spout.dir[1] * v * s + .5 * g * s * s;
      P.push([x + 1.5 * Math.sin(t * 40 + i), y]); if (y > yStop) break;
    }
    if (P.length > 1) paint(ribbon(P, 10 * flow, 6 * flow), { wash: '#A9C9EC', washOp: 225, fill: '#E2EEFF', fillOp: 60, ink: PAL.ink, sw: .5 });
    const [ex, ey] = P[P.length - 1];
    for (let i = 0; i < 6; i++) {   // the splash where it lands
      const ph = frac(t * 3.2 + i / 6), ang = -Math.PI / 2 + (i - 2.5) * .5, r = 6 + 26 * ph;
      paint(ellPts(ex + Math.cos(ang) * r, ey + Math.sin(ang) * r * .7 + 26 * ph * ph, 3 * (1 - ph) * flow, 4 * (1 - ph) * flow, 8), { wash: '#C9DCF6', ink: PAL.ink, sw: .3 });
    }
  }
  function v3(t) {
    const h = her3(t), c = his3(t), ct = cat3(t), cs = cat3(Math.max(t, SPLASH));
    return {
      C: setCols(.15, 'noon'), skyPal: SKIES.noon, clouds: 6, drift: 2600, grade: TINTS.noon.slice(2), doors: { her: 0, his: 0 }, cat: ct,
      plant: { g: .32, s: 26, buds: [1, .6] },
      cast: [herDraw(h.x, h.y, h.o), hisDraw(c.x, c.y, c.o)],
      fx: () => {
        water3(t, c);
        const a = t - SPLASH;   // the soaked cat's "!", and drops flying off it as it shakes on her head
        if (a > 0 && a < .9) emote('!', cs.x - 30, cs.y - 165, 13, seg(a, 0, .25) * (1 - seg(a, .7, .9)), a);
        const b = t - LEAP[1];
        if (b > 0 && b < .5) for (let i = 0; i < 7; i++) { boilSeed('shake ' + i); const ang = i / 7 * TAU, r = 40 + 120 * b; paint(ellPts(ct.x + Math.cos(ang) * r, ct.y - 40 + Math.sin(ang) * r * .6, 3.5, 4.5, 8), { wash: '#C9DCF6', ink: PAL.ink, sw: .3 }); }
      },
    };
  }

  // ---------- V4 (bar 43): she is out first this morning, waiting at the fence ----------
  const TD4 = B(173);
  const H4 = [[B(172), 'mischief', { lookX: 1, gloom: 0 }], [TD4 + .5, 'smug', { lookX: 1 }], [B(174), 'playful'], [B(175) + .3, 'happy', { lookX: 1 }]];
  const C4 = [[TD4, 'neutral', { lookX: -.4 }], [146.85, 'surprised', { lookX: -1 }], [147.5, 'happy', { lookX: -1, blush: .7 }]];
  function v4(t) {
    const door = ease(seg(t, TD4 - .1, TD4 + .08)), mood = emotions(t, H4, { take: .8 });
    const sun = { shadowDx: 1.5, shadowW: 1.3 }, ho = addPose(mood, { view: 'q', ...sun }), [w, wa] = wave(t, B(174), B(175) + .2, 2.4);
    if (w > 0) ho.aR = lerp(ho.aR ?? .2, wa, w);
    const cl = morning(t, TD4, 'his', C4, { see: TD4 + .45, wave: [B(175), B(176) + .2, 2.2], pose: sun });
    return {
      C: setCols(.27, 'morning'), skyPal: mixPal(SKIES.morning, SKIES.dawn, .25), clouds: 5, drift: 3900, sun: [470, 270, 48, 1, '#FFEBC8', '#FFF6E2'], grade: TINTS.morning.slice(2),
      doors: { her: 0, his: door }, cat: fenceCat({ pose: 'loaf', eyes: 'closed', curl: .6 }),
      plant: { g: .4, s: 26.6, buds: [1, 1, .5] },
      cast: [herDraw(845, G, ho), cl && hisDraw(cl.x, cl.y, cl.o)],
    };
  }

  // ---------- V5 (bar 44): before dawn, both sneak out to be first, and catch each other ----------
  const TD5 = B(177), SEE5 = B(179) - .1, SHADE5 = { k: .3, col: '#3A4780' };
  const H5 = [[TD5, 'mischief', { lookX: 1, gloom: 0 }], [B(179), 'surprised', { lookX: 1 }], [B(179.5), 'laugh']];
  const C5 = [[TD5, 'mischief', { lookX: -1, gloom: 0 }], [B(179), 'surprised', { lookX: -1 }], [B(179.5), 'laugh']];
  function sneak(t, who, keys) {
    if (t < TD5 + .05) return null;
    const dir = who === 'her' ? 1 : -1, u = who === 'her' ? HU : U, mood = emotions(t, keys, { take: .8 });
    const k = seg(t, TD5 + .15, TD5 + .55), x0 = DOOR[who] + dir * 40, x = t < TD5 + .55 ? DOOR[who] + dir * 40 * ease(k) : lerp(x0, x0 + dir * 75, ease(seg(t, TD5 + .6, SEE5)));
    const y = lerp(SET.wallBase, G, ease(k)), steps = Math.abs(x - x0) / (2.2 * u), tip = t > TD5 + .6 && t < SEE5;
    let p = t < SEE5 ? { view: 'side', flip: dir < 0 } : turn(t, SEE5, SEE5 + .12, dir * .25, dir * .125);
    const o = addPose(mood, { ...p, dy: -.6 * Math.sin(Math.PI * k) - (tip ? .45 * Math.abs(Math.sin(steps * Math.PI)) : 0), rot: tip ? dir * .1 : 0, walk: tip ? steps : null });
    if (tip) { o.aL = -.75; o.aR = -.75; }   // creeping, arms held back
    if (who === 'her') { o.shade = SHADE5.k; o.shadeCol = SHADE5.col; }
    else { o.col = mixCol(PAL.clay, SHADE5.col, SHADE5.k); o.dk = mixCol(PAL.clayDk, SHADE5.col, SHADE5.k); o.lt = mixCol('#F5B394', SHADE5.col, SHADE5.k); o.tint = null; }
    return { x, y, o };
  }
  function v5(t) {
    const door = ease(seg(t, TD5 - .35, TD5 + .3)), her = sneak(t, 'her', H5), cl = sneak(t, 'his', C5), woke = t > 151.85;
    return {
      C: { ...setCols(.4, 'predawn'), glass: '#3E4878' }, skyPal: SKIES.predawn, clouds: 3, drift: 5200, stars: .8, moon: [1640, 330, 26, 1, { crescent: .55, sky: mixCol(SKIES.predawn.top, SKIES.predawn.low, .5) }],
      grade: TINTS.predawn.slice(2), doors: { her: door, his: door }, cat: fenceCat({ pose: 'loaf', eyes: woke ? 'open' : 'closed', look: woke ? -.2 : 0, headTilt: woke ? .12 : 0, curl: 1 }),
      plant: { g: .48, s: 27.2, buds: [1, 1, .9] },
      cast: [her && herDraw(her.x, her.y, her.o), cl && hisDraw(cl.x, cl.y, cl.o)],
    };
  }

  // ---------- V6 (bar 45): sunset, sitting against the fence on either side of it ----------
  const H6 = [[B(180), 'content'], [B(182), 'shy', { lookX: 1, lookY: 0, mouth: 'cat' }], [154.95, 'happy', { lookX: 1 }]];
  const C6 = [[B(180), 'content'], [B(183), 'shy', { lookX: -1, lookY: 0, mouth: 'cat' }], [154.95, 'happy', { lookX: -1 }]];
  const sitting = { view: 'front', noLegs: true, dy: 2.25, shadowDx: 3, shadowW: 1.7 };
  function v6(t) {
    const ho = addPose(emotions(t, H6, { take: .6 }), { ...sitting, rot: .05 }), co = addPose(emotions(t, C6, { take: .6 }), { ...sitting, rot: -.05 });
    const lk = seg(t, 153.55, 154.35), leafOn = t >= 154.35;   // a leaf drifts down onto the sleeping cat's head
    return {
      C: setCols(.58, 'sunset'), skyPal: SKIES.sunset, clouds: 4, drift: 6500, sun: [300, 440, 52, 1, '#FFC27A', '#FFA24E'], grade: TINTS.sunset.slice(2),
      doors: { her: 0, his: 0 }, cat: fenceCat({ pose: 'loaf', eyes: 'closed', curl: 1 }), fall: .45, seed: 6,
      plant: { g: .58, s: 28, buds: [1, 1, 1, .7] },
      cast: [herDraw(850, G, ho), hisDraw(1150, G, co)],
      fx: () => {
        const hx = FX + 1.9 * CS, hy = FENCE.top - 4 - 2.55 * CS - 1.3 * CS;
        if (t > 153.55) leafAt(leafOn ? hx - 4 : lerp(hx - 140, hx - 4, lk) + 30 * Math.sin(lk * 7), leafOn ? hy : lerp(hy - 260, hy, lk), 10, leafOn ? .5 : Math.sin(lk * 9) * 1.2, '#E8B04A');
      },
    };
  }

  // ---------- V7 (beats 184–186): night; both asleep at their windows, lamps on ----------
  const SLEEP = { her: [[0, 'sleepy', { lookX: .5, emote: null }]], his: [[0, 'sleepy', { lookX: -.5, emote: null }]] };
  function v7(t) {
    const q = who => { const s = atWindow(t, who, SLEEP[who]); s.o.dy = (who === 'her' ? 2.4 : 2.2) + .08 * Math.sin(t * 2.2); s.o.rot = (who === 'her' ? .1 : -.1); s.on = true; return s; };
    const hq = q('her'), cq = q('his');
    const win = (s, who) => ({ curtain: mixCol(NIGHT[who === 'her' ? 'curtainHer' : 'curtainHis'], '#22284E', .2), curtainW: .06, lit: WIN[who].glow, room: WIN[who].room,
      inside: windowRoom(t, who, s, { sway: .03 * Math.sin(t * .9) }) });
    return {
      C: setCols(.72, 'night'), skyPal: SKIES.night, clouds: 0, stars: 1, moon: [1430, 120, 34, 1], grade: TINTS.night.slice(2),
      doors: { her: 0, his: 0 }, wins: { her: win(hq, 'her'), his: win(cq, 'his') }, cat: fenceCat({ pose: 'loaf', eyes: 'closed', curl: 1 }),
      plant: { g: .66, s: 28.6, buds: [1, 1, 1, 1, .6] },
      cast: [],
      fx: () => {   // their zzz drift out of the windows
        emote('zzz', 440, 650, 15, 1, t - 150);
        emote('zzz', 1460, 650, 17, 1, t - 151.3);
      },
    };
  }

  // ---------- V8 (bar 47): autumn; leaves whirl between them; they meet over the budding cutting ----------
  const TD8 = B(187) + .2, GUST = B(188);
  const H8 = [[TD8, 'happy', { lookX: 1 }], [GUST, 'surprised', { lookY: -1, emote: null }], [159.25, 'excited', { lookY: -.8 }], [160.0, 'content', { lookX: .5, lookY: .6, blush: .7 }]];
  const C8 = [[TD8, 'happy', { lookX: -1 }], [GUST, 'surprised', { lookY: -1, emote: null }], [159.25, 'excited', { lookY: -.8 }], [160.05, 'content', { lookX: -.5, lookY: .6, blush: .7 }]];
  function run8(t, who, keys, t0, t1, x1, lean, tLean) {
    const m = morning(t, TD8, who, keys, { see: TD8 + .45, pose: { shadowDx: 1.4, shadowW: 1.3 } }); if (!m) return null;
    const dir = who === 'her' ? 1 : -1;
    if (t < t0) return m;
    const k = seg(t, t0, t1), x = lerp(m.x, x1, ease(k)), o = { ...m.o };
    if (t < t1) { const r = move('run', t); Object.assign(o, { view: 'side', flip: dir < 0, walk: r.walk, smear: .3, smearDir: dir }); o.dy = (o.dy || 0) + r.dy; o.rot = dir * .08; }
    else { Object.assign(o, turn(t, t1, t1 + .12, dir * .25, dir * .125)); o.rot = (o.rot || 0) + lean * ease(seg(t, tLean, tLean + .4)); }
    return { x, y: G, o };
  }
  function swirl(t) {   // the gust: wind streaks across the yard, and its leaves whirling up between them
    const a = t - GUST; if (a < 0 || a > 2.1) return;
    for (let i = 0; i < 4; i++) {
      const k = (a - i * .08) / .7; if (k < 0 || k > 1) continue;
      boilSeed('gust streak ' + i);
      const x = lerp(1900, 300, k), y = 720 + 45 * i + 20 * Math.sin(k * 6 + i);
      inkLine([[x, y], [x + 130, y - 8], [x + 280, y - 3]], 1.6 * Math.sin(Math.PI * k), mixCol(PAL.paper, PAL.ink, .22), 'dry', .4);
    }
    for (let i = 0; i < 22; i++) {
      boilSeed('swirl ' + i);
      const st = i * .03, k = a - st; if (k < 0) continue;
      const th = hash(i * 3.1) * TAU + k * (4 + 2 * hash(i)), r = 60 + 110 * hash(i * 5.7) + 50 * k, inn = Math.min(1, k * 3);
      const x = lerp(1650, 985 + Math.cos(th) * r, inn), y = lerp(740 + 120 * hash(i * 2.2), 860 - 170 * k * (.6 + .5 * hash(i)) + Math.sin(th) * r * .35, inn);
      leafAt(x, y, 13 + 8 * hash(i * 1.7), th * 1.5, LEAF_COLS[i % LEAF_COLS.length]);
    }
  }
  function v8(t) {
    const door = ease(seg(t, TD8 - .1, TD8 + .08));
    const her = run8(t, 'her', H8, 159.45, 159.95, 845, .26, 159.95), cl = run8(t, 'his', C8, 159.3, 160.0, 1095, -.3, 160.0);
    const lookUp = t > GUST + .1 && t < 160.0;
    return {
      C: setCols(.9, 'autumn'), skyPal: SKIES.autumn, clouds: 5, drift: 7800, sun: [520, 240, 48, 1, '#FFE2B0', '#FFF2D8'], grade: TINTS.autumn.slice(2),
      doors: { her: door, his: door }, cat: fenceCat({ pose: 'sit', eyes: 'open', look: lookUp ? .4 : .1, headTilt: lookUp ? -.25 : 0 }),
      fall: .85, seed: 8, litter: 46, wind: ease(seg(t, GUST, GUST + .3)) * (1 - ease(seg(t, GUST + 1.2, GUST + 2))),
      plant: { g: .76, s: 29.5, buds: [1, 1, 1, 1, 1, 1], sway: .12 * Math.sin(t * 6) * ease(seg(t, GUST, GUST + .2)) * (1 - ease(seg(t, GUST + .8, GUST + 1.6))) },
      cast: [her && herDraw(her.x, her.y, her.o), cl && hisDraw(cl.x, cl.y, cl.o)],
      fx: () => swirl(t),
    };
  }

  // ---------- the courtyard, painted from a vignette ----------
  function courtyard(t, V, cam) {
    const C = V.C, [cx, cy, z] = cam, WS = V.wins || {};
    camBegin(cx, cy, z);
    sky(t, 0, { pal: V.skyPal, clouds: V.clouds ?? 5, drift: V.drift || 0 });
    if (V.sun) sunDisk(...V.sun);
    if (V.stars) starField(t, V.stars);
    if (V.moon) moon(...V.moon);
    if (V.storm) stormClouds(t, V.storm[0], { col: mixCol('#2B3260', '#F3C2B0', V.storm[1]), lt: mixCol('#4A5384', '#FFE2D2', V.storm[1]) });
    backdrop(t, 0, null, { tree: C.tree, treeDk: C.treeDk, hedge: C.hedge, band: C.treeDk, pole: C.pole, wire: C.wire, sway: 14 * (V.wind || 0) });
    const common = { plinth: C.plinth, frame: C.frame, glass: C.glass, step: C.step, doorGlow: 0, room: C.room };
    house(...SET.her, { side: 'her', wall: C.wallHer, roof: C.roofHer, door: C.doorHer, curtain: C.curtainHer, doorOpen: V.doors.her, ...common, ...(WS.her || {}) });
    house(...SET.his, { side: 'his', wall: C.wallHis, roof: C.roofHis, door: C.doorHis, curtain: C.curtainHis, doorOpen: V.doors.his, lived: 1, ...common, ...(WS.his || {}) });
    yard(t, { ground: C.ground, groundDk: C.groundDk, grass: C.grass, pebble: C.pebble, wind: 2 * (V.wind || 0) });
    if (V.litter) leafLitter(V.litter, { skip: (x, y) => Math.abs(x - CUT[0]) < 60 && y < G + 50 });
    clothesline();
    fence({ fence: C.fence, fenceDk: C.fenceDk });
    if (V.cat && V.cat.on === 'fence') cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' });
    if (V.cat && V.cat.on === 'ground') V.cast.push([V.cat.y, () => cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' })]);
    V.cast.filter(Boolean).sort((a, b) => a[0] - b[0]).forEach(c => c[1]());
    cutting(...CUT, V.plant.s, { g: V.plant.g, sway: V.plant.sway ?? .03 * Math.sin(t * 1.1), bud: 1, budAge: 9, buds: V.plant.buds });
    if (V.cat && V.cat.on !== 'fence' && V.cat.on !== 'ground') cat(V.cat.x, V.cat.y, CS, { ...V.cat.o, key: 'cat' });
    if (V.fx) V.fx();
    if (V.fall) leafFall(t, V.fall, { seed: V.seed || 0, wind: 1 + 3 * (V.wind || 0) });
    camEnd();
    if (V.grade) grade(1, V.grade[0], V.grade[1]);
  }

  // ---------- the seams: the wind turns the days ----------
  // A brush wipe in the season's leaf colours, with leaves riding its moving edges (cut under full cover at tc).
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
  const SEAMS = [
    [B(164), 'leaves', ['#5E8F55', '#8CB164'], ['#7FAE5E', '#B7C46A', '#6E9F58']],
    [B(168), 'leaves', ['#6E9A50', '#A6BC62'], ['#9CBF6E', '#C9C766', '#7FAE5E']],
    [B(172), 'leaves', ['#9AA64E', '#D3B44E'], ['#C9C766', '#E3B24E', '#9CBF6E']],
    [B(176), 'night', ['#2F3C7A', '#4A5590']],
    [B(180), 'leaves', ['#C9963E', '#E3B24E'], ['#E8B04A', '#D9823F', '#E9C25C']],
    [B(184), 'iris'],
    [B(187), 'leaves', ['#C9702F', '#E09A45'], ['#D9823F', '#E8B04A', '#C9662F']],
  ];
  const VIG = [[T_DAWN, v1], [B(164), v2], [B(168), v3], [B(172), v4], [B(176), v5], [B(180), v6], [B(184), v7], [B(187), v8]];
  function seasons(t) {
    let i = 0; while (i + 1 < VIG.length && t >= VIG[i + 1][0]) i++;
    courtyard(t, VIG[i][1](t), camB(t));
    boilSeed('transition');
    for (const [tc, kind, cols, leaves] of SEAMS) {
      const a = t - tc; if (a < -.34 || a > .34) continue;
      if (kind === 'iris') {   // closes on the cat asleep on the fence, and opens on it again, under the moon
        const [sx, sy] = toScreen(FX + 10, FENCE.top - 40, { cx: WIDE[0], cy: WIDE[1], zoom: WIDE[2], rot: 0 });
        iris(sx, sy, a < 0 ? lerp(1500, 0, easeIn(seg(a, -.33, 0))) : lerp(0, 1500, easeOut(seg(a, 0, .33))), '#1E2350');
      } else if (kind === 'night') brushWipe(.5 + a / .6, cols);
      else leafWipe(.5 + a / .6, cols, leaves);
    }
    if (t > T_END - .3) brushWipe((t - (T_END - .3)) / .6, ['#C9662F', '#E8B04A']);   // full cover at 161.250: stage 4 takes it off
  }

  shots([[T0, nightWindows], [T_DAWN, seasons]]);
  // for checks: crop-at expressions (e.g. STAGE3.win(T, 'his').x) and logic tests
  window.STAGE3 = { win: atWindow, lampOn: t => [lampOn(t, BONK_H), lampOn(t, BONK_C)], camA, camB, her3, his3, cat3, VIG, T_DAWN, T_END };
})();
