// sheets.js: model sheets as standalone loops, for checking the cast and the set (labels are fine here; never in the film).
//   node scripts/render.mjs --loop=cast --sheet=1 --cols=1 --w=1920 --out=out/check/cast.jpg
//   node scripts/render.mjs --loop=set  --sheet=1 --cols=1 --w=1920 --out=out/check/set.jpg
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .75, font: `${size}px sans-serif` });
  const floor = (y, x0 = 0, x1 = W) => inkLine([[x0 + 40, y + 6], [W / 2, y + 4], [x1 - 40, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5);

  // The two leads (views and the moods the film uses), the cat's poses, a sparrow, the boxes and the shirt.
  LOOPS.cast = t => {
    const u = 15, hu = u * HER_K;
    // row 1: Clawd beside her (scale), then her five key views
    clawd(130, 300, u, feel('happy', t, { seed: 1 })); heroine(300, 300, hu, feel('shy', t, { seed: 2 }));
    label('pair (her u = .86 Clawd)', 215, 335);
    ['front', 'q', 'side', 'qback', 'back'].forEach((v, i) => { const x = 560 + i * 280; heroine(x, 300, hu, { ...feel('neutral', t, { seed: i }), view: v }); label(v, x, 335); });
    floor(300);
    // row 2: her moods
    const moods = ['happy', 'content', 'surprised', 'hopeful', 'love', 'laugh', 'unimpressed', 'pouty', 'shy', 'playful'];
    moods.forEach((m, i) => { const x = 110 + i * 190; heroine(x, 600, hu * .82, feel(m, t, { seed: i })); label(m, x, 628, 17); });
    floor(600);
    // row 3: the cat, a sparrow, the boxes on Clawd, the shirt draped over her
    const cs = 13;
    cat(120, 900, cs, { pose: 'stand', look: 0 }); label('cat stand', 120, 935, 17);
    cat(320, 900, cs, { pose: 'walk', walk: t * 1.6 }); label('walk', 320, 935, 17);
    cat(500, 900, cs, { pose: 'sit', look: Math.sin(t * 2) }); label('sit, looking', 500, 935, 17);
    cat(680, 900, cs, { pose: 'sit', eyes: 'closed', mouth: 'yawn' }); label('yawn', 680, 935, 17);
    cat(860, 900, cs, { pose: 'leap' }); label('leap', 860, 935, 17);
    cat(1030, 900, cs, { pose: 'loaf', eyes: 'closed' }); label('loaf', 1030, 935, 17);
    sparrow(1170, 900, 16, { beak: (Math.sin(t * 9) + 1) / 2, chirp: 1 }); label('sparrow', 1170, 935, 17);
    const cu = 13, cl = feel('determined', t, { seed: 3 }), top = topOf(1390, 900, cu, cl);
    clawd(1390, 900, cu, cl);
    stackPts(top, [{ w: 7.6 * cu, h: 3.6 * cu }, { w: 6.4 * cu, h: 3.2 * cu, dx: .4 * cu }, { w: 5 * cu, h: 2.8 * cu, dx: -.3 * cu }],
      [.03 * Math.sin(t * 3), .05 * Math.sin(t * 3 - .6), .07 * Math.sin(t * 3 - 1.2)]).forEach((b, i) => cardBox(b.x, b.y, b.w, b.h, b.rot, { key: 'sheet' + i }));
    label('boxes ride on top', 1390, 935, 17);
    const hu2 = 13 * HER_K;
    heroine(1640, 900, hu2, { ...feel('unimpressed', t, { seed: 5 }), view: 'q', draw: drapeHook(1.7 + 1.5 * (Math.sin(t * 1.5) + 1) / 2, 0, { wave: t * 3 }) });
    label('shirt drape', 1640, 935, 17);
    shirt(1830, 760, 40, Math.sin(t) * .3, { flutter: 1, t });
    floor(900);
  };
  LOOPS.cast.len = 4;

  // The set at a glance: wide shot, morning then afternoon (left/right halves are the same frame at two times of day).
  LOOPS.set = t => {
    const tod = (Math.sin(t * TAU / 4) + 1) / 2;
    camBegin(1000, 520, .62);
    sky(t, tod, { sun: [lerp(330, 1650, tod), -150] });
    backdrop(t, tod);
    for (let i = 0; i < 3; i++) sparrow(640 + i * 70, wireY(640 + i * 70, 0), 12, { key: i, flip: i === 2 });
    house(...SET.her, { side: 'her', wall: COL.wallHer, roof: COL.roofHer, door: COL.doorHer });
    house(...SET.his, { side: 'his', wall: COL.wallHis, roof: COL.roofHis, door: COL.doorHis, lived: tod });
    yard(t);
    clothesline(); towel(1430, t, .3);
    fence();
    cutting(985, G + 14, 20, { g: 0 });
    camEnd();
    grade(tod);
  };
  LOOPS.set.len = 4;
})();
