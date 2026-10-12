// subtitles.js: the bottom lyric subtitles, Simplified Chinese only, in LXGW WenKai ("QLX Kai", public/fonts). Drawn on
// the 2D compositor in screen space after the painted frame and under the paper grain, so they never move with the
// camera, wipes never cover them, and they sit in the same paper as the paint. One style for the whole film, from the
// one timing table in lyrics.js.
//
// The style (from stage 3 on; the user found the first, plain outlined lettering too plain): each line is a line of the
// poem the song keeps writing. A soft ink-wash brush stroke sweeps on behind it from the left, a little white 七里香
// blossom opens at its left end and nods on the beat, and the characters ink in one after another (blurred and a touch
// large, then crisp). The currently sung line is pale gold for its timed interval; no fixed opening-phrase highlight.
// At the end of the line it all fades as it lifts away.
const SUB = { size: 52, y: H - 74, fill: '#FFF6E8', gold: '#FFDF9E', ink: '#2B2233', track: 3, padL: 70, padR: 46, band: 68, fadeOut: .28 };

// The ink-wash stroke behind a line, from x0 to x1 around y, h tall, painted on from the left (k 0..1). seed keeps each
// line's ragged edges and dry-brush tail its own. Like a real stroke it is densest where the brush lands, runs drier
// toward the tail, and its pigment gathers at the edges.
function subStroke(c, x0, x1, y, h, seed, k) {
  if (k <= 0) return;
  const r = i => hash(seed * 31.7 + i), n = Math.max(6, Math.round((x1 - x0) / 26)), ph = r(7) * TAU;
  const edge = (i, s) => y + s * (h / 2 + 2.5 * Math.sin(i * .55 + ph + (s > 0 ? 1.7 : 0))) + (r(i + (s > 0 ? 40 : 0)) - .5) * 5;
  const P = new Path2D();
  P.moveTo(x0 + 6, edge(0, -1));
  for (let i = 0; i <= n; i++) P.lineTo(lerp(x0 + 6, x1 - 24, i / n), edge(i, -1));
  P.lineTo(x1 + 8, y - h * .3); P.lineTo(x1 + 2, y + h * .3);
  for (let i = n; i >= 0; i--) P.lineTo(lerp(x0 + 6, x1 - 24, i / n), edge(i, 1));
  P.quadraticCurveTo(x0 - 14, y + h * .2, x0 - 6, y - h * .1);
  P.quadraticCurveTo(x0 - 4, y - h / 2 + 2, x0 + 6, edge(0, -1));
  c.save();
  c.beginPath(); c.rect(x0 - 40, y - h, (x1 + 110 - x0) * k, h * 2); c.clip();
  const g = c.createLinearGradient(x0, 0, x1 + 10, 0);
  g.addColorStop(0, 'rgba(36, 30, 48, .62)'); g.addColorStop(.55, 'rgba(36, 30, 48, .52)'); g.addColorStop(1, 'rgba(36, 30, 48, .4)');
  c.filter = 'blur(1.2px)'; c.fillStyle = g; c.fill(P);
  c.filter = 'blur(1.8px)'; c.strokeStyle = 'rgba(26, 20, 36, .32)'; c.lineWidth = 3; c.stroke(P);   // the wet edge
  c.filter = 'none'; c.lineCap = 'round';
  for (let i = 0; i < 7; i++) {   // the brush running dry: streaks off the right end
    const yy = y - h * .38 + h * .76 * (i + .5) / 7 + (r(i + 80) - .5) * 4, len = 30 + 75 * r(i + 90);
    c.strokeStyle = `rgba(36, 30, 48, ${(.2 + .22 * r(i + 100)).toFixed(3)})`; c.lineWidth = 2 + 4 * r(i + 110);
    c.beginPath(); c.moveTo(x1 - 34, yy); c.lineTo(x1 - 34 + len, yy + (r(i + 120) - .5) * 4); c.stroke();
  }
  for (let i = 0; i < 6; i++) {   // bristle marks along the stroke, a few lighter and a few darker
    const yy = y - h * .34 + h * .68 * r(i + 140), xa = x0 + 16 + 90 * r(i + 150), xb = x1 - 20 - 120 * r(i + 160);
    c.strokeStyle = i % 2 ? 'rgba(255, 240, 220, .09)' : 'rgba(20, 16, 30, .16)'; c.lineWidth = 1.2 + 1.3 * r(i + 170);
    c.beginPath(); c.moveTo(xa, yy); c.lineTo(xb, yy + (r(i + 180) - .5) * 5); c.stroke();
  }
  c.restore();
}

// A small white 七里香 blossom at (x, y): five petals, a pale gold heart and two leaves; it opens with k and nods on the beat.
function subBlossom(c, x, y, k, t) {
  if (k <= .01) return;
  const s = backOut(k), nod = .07 * Math.sin((t - OFF) / BEAT * Math.PI);
  c.save(); c.translate(x, y); c.rotate(lerp(-.9, 0, ease(k)) + nod); c.scale(s, s);
  c.lineWidth = 1.3; c.strokeStyle = 'rgba(43, 34, 51, .85)';
  c.fillStyle = '#7FAE5E';
  for (const a of [2.45, 3.75]) { c.save(); c.rotate(a); c.beginPath(); c.ellipse(15, 0, 11, 4.6, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#FFFDF6';
  for (let i = 0; i < 5; i++) { c.save(); c.rotate(i * TAU / 5 - Math.PI / 2); c.beginPath(); c.ellipse(9, 0, 8.5, 6, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#F2D672'; c.beginPath(); c.arc(0, 0, 4.2, 0, TAU); c.fill(); c.stroke();
  c.restore();
}

function drawSubtitles(c, t) {
  for (const [a, b, line] of LYRICS) {
    if (t < a || t >= b) continue;
    const out = 1 - ease(seg(t, b - SUB.fadeOut, b)); if (out <= 0) continue;
    c.save();
    c.font = `${SUB.size}px "QLX Kai"`;
    const chars = [...line], ws = chars.map(ch => c.measureText(ch).width + SUB.track), tw = ws.reduce((s, w) => s + w, 0) - SUB.track;
    const x0 = W / 2 - (tw + SUB.padL + SUB.padR) / 2, x1 = x0 + SUB.padL + tw + SUB.padR, y = SUB.y - 4 * (1 - out), seed = Math.round(a * 10);
    c.globalAlpha = out;
    subStroke(c, x0, x1, y, SUB.band, seed, easeOut(seg(t, a, a + .32)));
    subBlossom(c, x0 + 30, y, seg(t, a + .04, a + .36), t);
    // the characters ink in one after another
    const st = Math.min(.045, .6 / chars.length);
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    let x = x0 + SUB.padL;
    const brk = chars.indexOf('　');
    chars.forEach((ch, i) => {
      const k = seg(t, a + .1 + i * st, a + .3 + i * st), cx = x + (ws[i] - SUB.track) / 2; x += ws[i];
      if (k <= 0 || ch === '　') return;
      const e = easeOut(k);
      c.save(); c.globalAlpha = out * Math.min(1, k * 1.6); c.translate(cx, y + 2); c.scale(lerp(1.18, 1, e), lerp(1.18, 1, e));
      if (k < 1) c.filter = `blur(${(3 * (1 - e)).toFixed(2)}px)`;
      c.shadowColor = 'rgba(20, 16, 30, .5)'; c.shadowBlur = 6; c.shadowOffsetY = 1.5;
      c.strokeStyle = SUB.ink; c.lineWidth = 4; c.strokeText(ch, 0, 0);
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0;
      c.fillStyle = SUB.gold; c.fillText(ch, 0, 0);
      c.restore();
    });
    c.restore();
  }
}

