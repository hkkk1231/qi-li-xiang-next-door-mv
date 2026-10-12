// heroine.js: the film's two leads.
//
// The heroine is the approved pink Clawd-family character (references/characters/clawd-heroine): Clawd's blocky body
// and proportions in #F6BCCB / #DC8AA0 / #FFE4EB, slimmer legs and arms, eyelashes, and her magenta hair flower
// ('sakura'). Her colours, shape and face never change; only headwear and styling may. Drawn at HER_K × Clawd's u, as on
// the approved model sheet.
//
// topOf() gives the world point and angle of a character's flat top for a given pose, so things that rest ON a body
// (moving boxes, a shirt, a cat) ride along with its bounce, squash and lean without being squashed themselves.
const HER = { col: '#F6BCCB', dk: '#DC8AA0', lt: '#FFE4EB' };
const HER_K = .86;

// o.shade 0..1 + o.shadeCol: scene lighting over her own colours (night, storm); her design colours never change.
function heroine(x, y, u, o = {}) {
  const s = o.shade || 0, c = s ? { col: mixCol(HER.col, o.shadeCol, s), dk: mixCol(HER.dk, o.shadeCol, s), lt: mixCol(HER.lt, o.shadeCol, s) } : HER;
  clawd(x, y, u, { hat: 'sakura', lashes: true, legW: .78, armW: .8, ...o, col: c.col, dk: c.dk, lt: c.lt });
}

// The centre of the body's top edge, in world space, and the body's angle, for clawd(x, y, u, o).
function topOf(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), r = o.rot || 0, h = 8 * u * (o.sy ?? 1) * (1 - sq);
  const bx = x + (o.dx || 0) * u, by = y + (o.dy || 0) * u;
  return { x: bx + h * Math.sin(r), y: by - h * Math.cos(r), rot: r, w: 10 * u * (1 + sq * .6) };
}

// Add two pose objects that both move the same fields (an emotion's idle plus an action), instead of letting one win.
function addPose(a, b) {
  const o = { ...a, ...b };
  for (const f of ['dx', 'dy', 'sq', 'rot']) if (a[f] != null || b[f] != null) o[f] = (a[f] || 0) + (b[f] || 0);
  return o;
}
