// ============================================================ THE RAW EEL RULE
// Scenes for engine.js (window.FILM contract). render(t) stays pure: geometry is built in init(),
// every beat is keyed to a spoken word via wt()/LS()/LB(), every position goes through O(landscape, portrait).

const K = { blood: '#d81e3a', blood2: '#ff4a5e', tox: '#ff3dac', heat: '#ff7a1a', safe: '#7dffb0', gold: '#ffc861' };
const TOXc = '255,61,172', HEATc = '255,122,26', REDc = '255,40,60', CYc = '95,212,255', SAFEc = '125,255,176';
const T = { sushi: 0, eel: LB(2), hand: LS(4) + .25, serum: LB(7), split: LB(8), tissue: LB(10), lab: LB(12), fish: LB(16), grill: LB(18), end: DUR - 2.4 };
const TM = {
  inS: wt(0, 'salmon') - .2, inT: wt(0, 'tuna') - .2, inE: wt(1, 'eel') - .2, xE: wt(1, 'strictly'), off: wt(1, 'off') - .05,
  scan: wt(2, 'blood') - .45, blood: wt(2, 'blood') + .1, prot: wt(2, 'protein') - .2, toxin: wt(2, 'toxin'), name: LS(3) - .05,
  form: LS(4) - .1, single: wt(4, 'single') - .1, zone: wt(4, 'fresh'), fall: wt(4, 'blood') + .2, hit: wt(5, 'splashing') + .35, tiny: wt(5, 'tiny'), hand2: wt(5, 'hand'),
  zoom0: wt(6, 'zoom') - .15,
  jag: wt(7, 'jagged') - .25, spk: wt(7, 'spiked'), mols: wt(7, 'molecules'), susp: wt(7, 'suspended'), ser: wt(7, 'serum'),
  pill0: wt(8, 'swallowed') - .6, pill1: wt(8, 'swallowed') + .5, rOn: LS(9) - .2, touch: wt(9, 'immediate') + .05, surf: wt(9, 'surface'), inst: wt(9, 'contact'),
  wound: wt(10, 'wound'), muc: wt(10, 'mucous') - .2, binds: wt(11, 'binds') + .05, burn: wt(11, 'burning'), swell: wt(11, 'swelling'),
  weak: wt(12, 'weakness'), heat: wt(13, 'heat') - .02, deg: wt(14, '60'), five: wt(14, 'five'), unr: wt(15, 'unravels') - .1, brk: wt(15, 'breaks') + .05, apart: wt(15, 'apart') + .25,
  pain: wt(16, 'pain'), multi: LS(17) - .15, hazard: wt(17, 'passive') - .1,
  land: wt(18, 'fillet') + .25, grillW: wt(18, 'grill'), pop0: wt(19, 'permanently') - .1, pop1: wt(19, 'toxin') + .15, safe: wt(20, 'safe') - .05,
};
const EV = {}; function ev(k, ...ts) { (EV[k] = EV[k] || []).push(...ts.map(x => +(+x).toFixed(3))); }

// ------------------------------------------------------------ helpers
const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mixA = (A, B, u) => A.map((v, i) => lerp(v, B[i], clamp(u)));
const rgba = (A, a = 1) => `rgba(${A[0] | 0},${A[1] | 0},${A[2] | 0},${a})`;
const mixc = (a, b, u, al = 1) => rgba(mixA(hx(a), hx(b), u), al);
const typed = (s, p) => s.slice(0, Math.round(s.length * clamp(p)));
function glow(x, y, r, c, a) {
  if (a <= .004 || r <= 1) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(.35, `rgba(${c},${a * .42})`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function inPlace(x, y, s, rot, fn) { ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s !== 1) ctx.scale(s, s); fn(); ctx.restore(); }
function check(x, y, s, col, p = 1) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * .24; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const a = [x - s * .5, y], b = [x - s * .15, y + s * .36], c = [x + s * .55, y - s * .4], L1 = .5, d = clamp(p);
  ctx.beginPath(); ctx.moveTo(a[0], a[1]);
  if (d < L1) ctx.lineTo(lerp(a[0], b[0], d / L1), lerp(a[1], b[1], d / L1)); else { ctx.lineTo(b[0], b[1]); const u = (d - L1) / (1 - L1); ctx.lineTo(lerp(b[0], c[0], u), lerp(b[1], c[1], u)); }
  ctx.stroke(); ctx.restore();
}
function cross(x, y, s, col, p = 1) {
  if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * .26; ctx.lineCap = 'round';
  const u = clamp(p * 2), v = clamp(p * 2 - 1), k = s * .45;
  ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x - k + 2 * k * u, y - k + 2 * k * u);
  if (v > 0) { ctx.moveTo(x + k, y - k); ctx.lineTo(x + k - 2 * k * v, y - k + 2 * k * v); }
  ctx.stroke(); ctx.restore();
}
function hazardSign(x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y);
  ctx.strokeStyle = col; ctx.lineWidth = s * .12; ctx.lineJoin = 'round'; ctx.fillStyle = 'rgba(20,0,4,.55)';
  ctx.beginPath(); ctx.moveTo(0, -s * .55); ctx.lineTo(s * .58, s * .45); ctx.lineTo(-s * .58, s * .45); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = col; ctx.fillRect(-s * .055, -s * .22, s * .11, s * .38); ctx.beginPath(); ctx.arc(0, s * .3, s * .07, 0, TAU); ctx.fill();
  ctx.restore();
}
function dropPath(x, y, r, st = 1) {
  ctx.beginPath(); ctx.moveTo(x, y - r * 2.1 * st);
  ctx.bezierCurveTo(x + r * .35, y - r * 1.3 * st, x + r, y - r * .6, x + r, y);
  ctx.arc(x, y, r, 0, Math.PI);
  ctx.bezierCurveTo(x - r, y - r * .6, x - r * .35, y - r * 1.3 * st, x, y - r * 2.1 * st); ctx.closePath();
}
function drawDrop(x, y, r, a = 1, st = 1) {
  if (a <= 0 || r <= .3) return; ctx.save(); ctx.globalAlpha *= a; dropPath(x, y, r, st);
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r * 1.6); g.addColorStop(0, '#ff6b7a'); g.addColorStop(.45, '#c4102a'); g.addColorStop(1, '#4a0010');
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(x - r * .38, y - r * .35, r * .17, r * .28, -.5, 0, TAU); ctx.fill(); ctx.restore();
}
function arrow1(x1, y1, x2, y2, hd) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); ctx.beginPath(); ctx.moveTo(x2 + Math.cos(a) * hd * .4, y2 + Math.sin(a) * hd * .4); ctx.lineTo(x2 + Math.cos(a + 2.5) * hd, y2 + Math.sin(a + 2.5) * hd); ctx.lineTo(x2 + Math.cos(a - 2.5) * hd, y2 + Math.sin(a - 2.5) * hd); ctx.closePath(); ctx.fill(); }
function note(s, a) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; txt(s, O(W - 70, 70), O(106, 234), font(600, 14, F.m), 'rgba(255,214,170,.7)', O('right', 'left'), 4); ctx.restore(); }
function smoothPath(pts) {
  const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let m = mid(pts[n - 1], pts[0]);
  ctx.beginPath(); ctx.moveTo(m[0], m[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; m = mid(p, q); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
}
function polyAt(pts, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let d = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const f = L[i] ? clamp(d / L[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } d -= L[i]; }
  return pts[pts.length - 1];
}
function bar(x, y, w, h, p, col, a = 1) {
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,.1)'; rrect(x, y, w, h, h / 2); ctx.fill();
  if (p > .001) { ctx.fillStyle = col; rrect(x, y, Math.max(h, w * clamp(p)), h, h / 2); ctx.fill(); }
  ctx.restore();
}
function label(s, x, y, size, col, a, align = 'center', ls = 3, w = 800) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 14; txt(s, x, y, font(w, size), col, align, ls); ctx.restore(); }
function mono(s, x, y, size, col, a, align = 'center', ls = 4) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 10; txt(s, x, y, font(600, size, F.m), col, align, ls); ctx.restore(); }

// ------------------------------------------------------------ the toxin molecule: a folded bead chain with jagged spikes.
// unf (0..1) unravels it into a loose chain, brk (0..1) snaps it into drifting fragments.
function makeMol(seed, N = 44) {
  const r = rng(seed), P3 = []; let p = [(r() - .5) * .5, (r() - .5) * .5, (r() - .5) * .5];
  for (let i = 0; i < N; i++) {
    for (let k = 0; k < 30; k++) {
      const th = r() * TAU, ph = Math.acos(2 * r() - 1), s = .3, q = [p[0] + s * Math.sin(ph) * Math.cos(th), p[1] + s * Math.sin(ph) * Math.sin(th), p[2] + s * Math.cos(ph)];
      if (Math.hypot(q[0], q[1], q[2]) < .92) { p = q; break; }
    }
    P3.push(p);
  }
  const order = P3.map((q, i) => [Math.hypot(q[0], q[1], q[2]), i]).sort((a, b) => b[0] - a[0]), spikes = [];
  for (const [m, i] of order) {
    if (spikes.length >= 12 || m < .2) break; const d = P3[i].map(v => v / m);
    if (spikes.every(s => s.d[0] * d[0] + s.d[1] * d[1] + s.d[2] * d[2] < .5)) spikes.push({ i, d, len: .6 + r() * .55, w: .16 + r() * .08, k: (r() - .5) * .6 });
  }
  const seg = []; for (let k = 0; k < 6; k++) { const a = r() * TAU; seg.push({ vx: Math.cos(a) * (1.1 + r()), vy: Math.sin(a) * (.8 + r()) }); }
  return { P3, spikes, seg, ph: r() * TAU };
}
const CORE0 = hx('#ff3dac'), CORE1 = hx('#c8ae7e'), DARK0 = hx('#5e0838'), DARK1 = hx('#4a3c28'), RIM0 = hx('#ffb3e2'), RIM1 = hx('#f6e6c4');
function drawMol(m, x, y, R, t, o = {}) {
  const a = o.a ?? 1; if (a <= .01 || R <= 1) return;
  const unf = o.unf || 0, brk = o.brk || 0, heat = o.heat || 0, dead = o.dead || 0, sp = o.spk ?? 1, UL = o.ul || 7;
  const rot = (o.rot ?? t * .45) + m.ph, ax = .45 + .35 * Math.sin(rot * .6);
  const cy = Math.cos(rot), sy = Math.sin(rot), cx = Math.cos(ax), sx = Math.sin(ax);
  const R3 = (px, py, pz) => { const X = px * cy + pz * sy, Z0 = -px * sy + pz * cy; return [X, py * cx - Z0 * sx, py * sx + Z0 * cx]; };
  const N = m.P3.length, pts = new Array(N);
  for (let i = 0; i < N; i++) {
    let [px, py, pz] = m.P3[i];
    if (heat) { px += heat * .08 * noise(t * 25 + i * 3.1); py += heat * .08 * noise(t * 25 + i * 5.7 + 50); }
    let [X, Y, Z] = R3(px, py, pz);
    if (unf > 0) {
      const u = E.io(clamp(unf * 1.7 - i / N * .7));
      X = lerp(X, (i / (N - 1) - .5) * UL, u); Y = lerp(Y, .42 * Math.sin(i * .62 + t * 2.2) + .18 * Math.sin(i * 1.7 + 1), u); Z = lerp(Z, .4 * Math.sin(i * .9), u);
    }
    const sg = Math.min(5, Math.floor(i / N * 6));
    if (brk > 0) { const s = m.seg[sg], e = E.o3(brk); X += s.vx * e * 1.5; Y += s.vy * e * 1.5 + .4 * e * e; }
    pts[i] = { x: x + X * R, y: y + Y * R, z: Z, s: sg };
  }
  const core = mixA(CORE0, CORE1, dead), dark = mixA(DARK0, DARK1, dead), rim = mixA(RIM0, RIM1, dead);
  ctx.save(); ctx.globalAlpha = a;
  glow(x, y, R * 2.6 * (1 + unf * .6), dead > .5 ? HEATc : TOXc, .3 * (1 - brk));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = rgba(mixA(rim, core, .5), .8); ctx.lineWidth = Math.max(1.5, R * .09);
  ctx.beginPath();
  for (let i = 0; i < N; i++) { const p = pts[i]; if (i === 0 || (brk > 0 && p.s !== pts[i - 1].s)) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
  ctx.stroke();
  const spk = sp * (1 - E.o3(clamp(unf * 2.2)));
  const spike = (s) => {
    const p = pts[s.i], [dx, dy, dz] = R3(s.d[0], s.d[1], s.d[2]);
    const L = s.len * R * spk * (1 + heat * .25 * noise(t * 20 + s.i)); if (L < 1) return;
    const l2 = Math.hypot(dx, dy) || 1, nx = -dy / l2, ny = dx / l2, w = s.w * R * Math.sqrt(spk);
    ctx.beginPath(); ctx.moveTo(p.x + nx * w, p.y + ny * w);
    ctx.lineTo(p.x + dx * L * .55 + nx * w * (.55 + s.k), p.y + dy * L * .55 + ny * w * (.55 + s.k));
    ctx.lineTo(p.x + dx * L * .5 + nx * w * .12, p.y + dy * L * .5 + ny * w * .12);
    ctx.lineTo(p.x + dx * L, p.y + dy * L);
    ctx.lineTo(p.x + dx * L * .42 - nx * w * .62, p.y + dy * L * .42 - ny * w * .62);
    ctx.lineTo(p.x - nx * w, p.y - ny * w); ctx.closePath();
    ctx.fillStyle = rgba(dz > 0 ? mixA(core, rim, .45) : mixA(dark, core, .6)); ctx.fill();
    ctx.strokeStyle = rgba(dark, .9); ctx.lineWidth = Math.max(1, R * .025); ctx.stroke();
  };
  for (const s of m.spikes) if (R3(s.d[0], s.d[1], s.d[2])[2] <= 0) spike(s);
  const order = pts.map((p, i) => i).sort((i, j) => pts[i].z - pts[j].z);
  for (const i of order) {
    const p = pts[i], k = (p.z + 1) / 2, r = R * (.15 + .07 * k);
    ctx.fillStyle = rgba(mixA(dark, core, .3 + .7 * k)); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(rim, .55 * k); ctx.beginPath(); ctx.arc(p.x - r * .3, p.y - r * .32, r * .42, 0, TAU); ctx.fill();
  }
  for (const s of m.spikes) if (R3(s.d[0], s.d[1], s.d[2])[2] > 0) spike(s);
  ctx.restore();
}

// ------------------------------------------------------------ precomputed geometry
let GRAINS = [], BOKEH = [], SNOW = [], MOLS = [], HERO, SER = {}, TIS = {}, LAB = {}, FISH = {}, GR = {};
function init() {
  { const r = rng(41); for (let i = 0; i < 80; i++) GRAINS.push({ x: -108 + r() * 216, y: -24 + r() * 72, r: r() * Math.PI, a: .3 + r() * .55 }); }
  { const r = rng(42); for (let i = 0; i < 46; i++) BOKEH.push({ x: r() * W, y: r() * O(470, 420), r: 20 + r() * 70, g: 140 + r() * 80 | 0, b: 60 + r() * 60 | 0, a: .05 + r() * .12, p: r() * TAU }); }
  { const r = rng(43); for (let i = 0; i < 170; i++) SNOW.push({ x: r() * W, y: r() * H, s: .8 + r() * 2.4, v: .3 + r() * .9 }); }
  for (let i = 0; i < 16; i++) MOLS.push(makeMol(300 + i * 17));
  HERO = makeMol(7, 48);
  // serum world
  { const r = rng(51); SER.far = []; SER.cells = []; SER.mols = []; SER.specks = [];
    for (let i = 0; i < 8; i++) SER.far.push({ x: r() * W, y: r() * H, rx: O(170, 150) + r() * 120, rot: r() * TAU, a: .16 + r() * .14 });
    const cellPos = O([[470, 380], [260, 760], [800, 840], [1560, 820], [1680, 380], [1000, 170], [120, 200]], [[250, 600], [880, 1340], [180, 1280], [860, 520], [600, 1480], [140, 380], [980, 980]]);
    cellPos.forEach(([x, y], i) => SER.cells.push({ x, y, rx: O(86, 78) + r() * 28, rot: r() * TAU, sp: .2 + r() * .3 }));
    const H0 = O([1120, 470], [560, 820]);
    for (let i = 0; i < 13; i++) {
      let x, y, k = 0; do { x = 80 + r() * (W - 160); y = O(140, 300) + r() * (H - O(300, 760)); k++; } while (k < 40 && (Math.hypot(x - H0[0], y - H0[1]) < O(300, 280) || SER.mols.some(m => Math.hypot(m.x - x, m.y - y) < O(180, 170))));
      SER.mols.push({ x, y, R: O(26, 24) + r() * O(34, 30), m: MOLS[i % 16], d: .55 + r() * .45, ta: i / 12 });
    }
    SER.mols.sort((a, b) => a.R - b.R);
    for (let i = 0; i < 150; i++) SER.specks.push({ x: r() * W, y: r() * H, s: .8 + r() * 2.2, v: .3 + r(), p: r() * TAU });
  }
  // tissue cross-section
  { const r = rng(61); TIS.X0 = O(960, 540); TIS.Y0 = O(500, 900); TIS.wt = O(230, 200); TIS.D = O(250, 240); TIS.epi = []; TIS.fat = []; TIS.fib = []; TIS.nerve = []; TIS.mols = [];
    for (let row = 0; row < 3; row++) for (let x = -20; x < W + 40; x += 44) TIS.epi.push({ x: x + (row % 2) * 22 + (r() - .5) * 8, d: 12 + row * 21, w: 36 + r() * 8, h: 16 + r() * 4 });
    for (let i = 0; i < 70; i++) TIS.fat.push({ x: r() * W, d: 310 + r() * O(330, 700), r: 26 + r() * 22 });
    for (let i = 0; i < 26; i++) { const x0 = r() * W, d0 = 90 + r() * 180, pts = []; for (let k = 0; k < 8; k++) pts.push([x0 + k * 40, d0 + 14 * Math.sin(k * 1.3 + i)]); TIS.fib.push(pts); }
    for (let i = 0; i < 7; i++) { const sx = TIS.X0 + (i - 3) * O(120, 80), pts = [[sx, 300]]; let x = sx, d = 300; for (let k = 0; k < 7; k++) { x += (r() - .5) * 60 + (sx - TIS.X0) * .12; d -= 30 + r() * 12; pts.push([x, d]); } TIS.nerve.push(pts); }
    for (let k = 0; k < 9; k++) {
      const side = k % 2 ? 1 : -1, f = .14 + .66 * (k / 8), ty = TIS.Y0 + f * TIS.D;
      TIS.mols.push({ sx: TIS.X0 + (k / 8 - .5) * O(380, 300) + (r() - .5) * 30, sy: TIS.Y0 - O(40, 34) - r() * O(80, 70), side, f, ty, m: MOLS[(k + 3) % 16] });
    }
  }
  // lab embers
  { const r = rng(71); LAB.emb = []; for (let i = 0; i < 110; i++) LAB.emb.push({ x: r() * W, y: r() * H, s: 1 + r() * 3, v: .5 + r(), p: r() * TAU }); }
  // the whole fish, built from drops
  { const r = rng(81); FISH.o = O({ hx: 1600, by: 480, len: 1300, amp: 26, wd: 46, dx: 0, dy: 0 }, { hx: 1000, by: 860, len: 930, amp: 22, wd: 38, dx: 0, dy: 0 });
    const g = eelGeo(0, FISH.o); FISH.g = g; FISH.drops = [];
    for (let i = 0; i < 260; i++) { const u = Math.pow(r(), .9) * .97, idx = Math.round(u * 90), v = (r() * 2 - 1) * .82 * eelHW(u) * FISH.o.wd; FISH.drops.push({ x: g.sp[idx][0] + g.nrm[idx][0] * v, y: g.sp[idx][1] + g.nrm[idx][1] * v, u, s: .7 + r() * .6, d: r() }); }
  }
  // grill
  { const r = rng(91); GR.coals = []; GR.dots = []; GR.smoke = []; GR.emb = [];
    for (let i = 0; i < 120; i++) GR.coals.push({ x: r() * W, y: O(420, 740) + r() * (H - O(420, 740)), r: 22 + r() * 40, p: r() * TAU, b: r() });
    const FL = O(1060, 860), FH = O(190, 170);
    for (let i = 0; i < 54; i++) { const x = (r() - .5) * FL * .9, y = (r() - .5) * FH * .72; const edge = Math.min(FH / 2 - Math.abs(y), (FL / 2 - Math.abs(x)) * .6); GR.dots.push({ x, y, e: edge, p: r() * TAU }); }
    GR.dots.sort((a, b) => a.e - b.e); GR.dots.forEach((d, i) => d.k = i / GR.dots.length);
    for (let i = 0; i < 18; i++) GR.smoke.push({ x: (r() - .5) * FL * .9, p: r(), s: .7 + r() * .7, w: r() * TAU });
    for (let i = 0; i < 70; i++) GR.emb.push({ x: r() * W, p: r(), v: .5 + r(), s: 1 + r() * 2.5, w: r() * TAU });
  }
}

// ============================================================ SCENE 1 · the sushi counter
function nigiri(x, y, s, kind, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.save(); ctx.translate(0, 60); ctx.scale(1, .2); const sh = ctx.createRadialGradient(0, 0, 10, 0, 0, 175); sh.addColorStop(0, 'rgba(0,0,0,.7)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, 175, 0, TAU); ctx.fill(); ctx.restore();
  rrect(-118, -30, 236, 86, 43); const rg = ctx.createLinearGradient(0, -30, 0, 56); rg.addColorStop(0, '#fffdf6'); rg.addColorStop(.6, '#e8e0cf'); rg.addColorStop(1, '#b0a690'); ctx.fillStyle = rg; ctx.fill();
  ctx.save(); rrect(-118, -30, 236, 86, 43); ctx.clip();
  for (const g of GRAINS) { ctx.fillStyle = `rgba(255,255,255,${g.a})`; ctx.beginPath(); ctx.ellipse(g.x, g.y, 8, 3.6, g.r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(140,128,105,.3)'; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.restore();
  const top = () => { ctx.beginPath(); ctx.moveTo(-146, -4); ctx.bezierCurveTo(-156, -52, -104, -86, -20, -88); ctx.bezierCurveTo(74, -90, 146, -70, 152, -22); ctx.bezierCurveTo(156, 2, 136, 10, 114, 6); ctx.bezierCurveTo(44, -12, -60, -8, -122, 12); ctx.bezierCurveTo(-140, 14, -148, 6, -146, -4); ctx.closePath(); };
  const PAL = { salmon: ['#ffad73', '#f2662a', '#b94212'], tuna: ['#e8465f', '#b0162f', '#5e0818'], eel: ['#f3e7e2', '#d8c0b8', '#a48982'], unagi: ['#c06c2c', '#7c3412', '#3a1205'] }[kind];
  top(); const tg = ctx.createLinearGradient(0, -90, 0, 14); tg.addColorStop(0, PAL[0]); tg.addColorStop(.55, PAL[1]); tg.addColorStop(1, PAL[2]); ctx.fillStyle = tg; ctx.fill();
  ctx.save(); top(); ctx.clip();
  if (kind === 'salmon') { ctx.strokeStyle = 'rgba(255,238,224,.85)'; ctx.lineWidth = 7; for (let k = -4; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(-170 + k * 38, 24); ctx.quadraticCurveTo(-128 + k * 38, -40, -80 + k * 38, -104); ctx.stroke(); } }
  if (kind === 'tuna') { ctx.strokeStyle = 'rgba(255,160,180,.2)'; ctx.lineWidth = 5; for (let k = -4; k <= 6; k++) { ctx.beginPath(); ctx.moveTo(-170 + k * 44, 24); ctx.quadraticCurveTo(-120 + k * 44, -40, -90 + k * 44, -104); ctx.stroke(); } }
  if (kind === 'eel') {
    ctx.fillStyle = '#4f5966'; ctx.beginPath(); ctx.moveTo(-170, -62); ctx.bezierCurveTo(-100, -96, 80, -98, 172, -60); ctx.lineTo(172, -120); ctx.lineTo(-170, -120); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,235,250,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-150, -66); ctx.bezierCurveTo(-90, -92, 80, -94, 160, -64); ctx.stroke();
    ctx.strokeStyle = 'rgba(205,30,55,.75)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-140, -30); ctx.bezierCurveTo(-60, -50, 60, -52, 140, -34); ctx.stroke();
    ctx.fillStyle = 'rgba(200,20,45,.5)'; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(-110 + k * 36, -40 - 6 * Math.sin(k), 3 + (k % 3), 0, TAU); ctx.fill(); }
  }
  if (kind === 'unagi') {
    ctx.strokeStyle = 'rgba(20,6,0,.55)'; ctx.lineWidth = 9; for (let k = -3; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(-120 + k * 46, 20); ctx.lineTo(-80 + k * 46, -100); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,190,110,.45)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-120, -54); ctx.bezierCurveTo(-60, -76, 50, -78, 120, -56); ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,210,.85)'; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.ellipse(-100 + k * 25, -64 + 10 * Math.sin(k * 2.1), 4, 2, k, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = 'rgba(255,255,255,.38)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-104, -68); ctx.bezierCurveTo(-40, -82, 40, -82, 112, -64); ctx.stroke();
  ctx.restore();
  if (kind === 'unagi') { const ng = ctx.createLinearGradient(-26, 0, 26, 0); ng.addColorStop(0, '#0c1410'); ng.addColorStop(.5, '#22342a'); ng.addColorStop(1, '#0c1410'); ctx.fillStyle = ng; ctx.beginPath(); ctx.moveTo(-24, -92); ctx.lineTo(24, -92); ctx.lineTo(28, 54); ctx.lineTo(-28, 54); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function sushiTag(x, y, name, status, ok, a, pk) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + 12 * (1 - E.o3(a)));
  txt(name, 0, 0, font(800, 30), '#fff', 'center', 6);
  const col = ok ? K.safe : '#ff4d5e';
  ctx.font = font(700, 20, F.m); ctx.letterSpacing = '4px'; const w = ctx.measureText(status).width + 76; ctx.letterSpacing = '0px';
  ctx.fillStyle = ok ? 'rgba(125,255,176,.12)' : 'rgba(255,77,94,.16)'; rrect(-w / 2, 18, w, 42, 21); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
  txt(status, -w / 2 + 22, 46, font(700, 20, F.m), col, 'left', 4);
  ok ? check(w / 2 - 24, 39, 20, col, pk) : cross(w / 2 - 24, 39, 18, col, pk);
  ctx.restore();
}
function counterBg(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1e1009'); g.addColorStop(.45, '#0d0705'); g.addColorStop(1, '#050303'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of BOKEH) { const x = b.x + 14 * Math.sin(t * .25 + b.p), y = b.y; const gg = ctx.createRadialGradient(x, y, b.r * .1, x, y, b.r); gg.addColorStop(0, `rgba(255,${b.g},${b.b},${b.a})`); gg.addColorStop(.75, `rgba(255,${b.g},${b.b},${b.a * .7})`); gg.addColorStop(1, `rgba(255,${b.g},${b.b},0)`); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.fill(); }
  ctx.restore();
  const cy = O(480, 420); const wg = ctx.createLinearGradient(0, cy, 0, H); wg.addColorStop(0, '#41291a'); wg.addColorStop(1, '#140b06'); ctx.fillStyle = wg; ctx.fillRect(0, cy, W, H - cy);
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 2;
  for (let i = 1; i < 26; i++) { const y = cy + Math.pow(i / 26, 1.6) * (H - cy); ctx.beginPath(); for (let x = -20; x <= W + 20; x += 48) ctx.lineTo(x, y + 6 * noise(x * .004 + i * 5.3)); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,200,140,.2)'; ctx.fillRect(0, cy, W, 3);
}
const SUSHI = () => ({ xs: O([530, 960, 1390], [400, 400, 400]), ys: O([590, 590, 590], [620, 950, 1280]), s: O(1.35, 1.0) });
function drawCounter(t, fin) {
  counterBg(t);
  const L = SUSHI(), kinds = ['salmon', 'tuna', fin ? 'unagi' : 'eel'], names = ['SALMON', 'TUNA', 'EEL'];
  const tin = fin ? [-9, -9, T.end + .1] : [TM.inS, TM.inT, TM.inE];
  for (let i = 0; i < 3; i++) {
    const p = P(t, tin[i], tin[i] + .45), e = E.oBack(p), x = L.xs[i], y = L.ys[i];
    glow(x, y + 30 * L.s, 280 * L.s, i === 2 && !fin ? '255,90,90' : '255,190,120', (i === 2 && !fin ? .16 : .2) * p);
    nigiri(x, y - 80 * (1 - E.o3(p)), L.s * lerp(.8, 1, e), kinds[i], clamp(p * 2.5));
    const ok = !(i === 2 && !fin), st = i === 2 && fin ? 'GRILLED' : 'RAW';
    const pk = ok ? P(t, tin[i] + .4, tin[i] + .75) : P(t, TM.xE, TM.xE + .3);
    sushiTag(x + O(0, 350), y + O(150 * L.s, -36), names[i], st, ok, P(t, tin[i] + .25, tin[i] + .55), pk);
  }
  if (!fin) {
    const da = P(t, TM.xE - .1, TM.xE + .4), x = L.xs[2], y = L.ys[2] - 20;
    for (let k = 0; k < 3; k++) { const ph = (t * .9 + k / 3) % 1; ctx.strokeStyle = `rgba(255,70,90,${da * (1 - ph) * .7})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, (150 + ph * 90) * L.s, (90 + ph * 50) * L.s, 0, 0, TAU); ctx.stroke(); }
    stamp(t, TM.off, x, y + O(-10, 0), 'OFF LIMITS', '#ff3b4e', -.09, O(58, 46));
  }
}
function sceneSushi(t) {
  const L = SUSHI(), ex = L.xs[2], ey = L.ys[2] - 30;
  const zp = E.iExp(P(t, wt(1, 'limits') + .2, T.eel + .02)), z = (1 + .05 * E.io2(P(t, 0, T.eel))) * (1 + 3.2 * zp);
  ctx.save(); ctx.translate(ex, ey); ctx.scale(z, z); ctx.translate(-ex, -ey); drawCounter(t, false); ctx.restore();
  const a = vis(t, .25, TM.inE + .4, .6, .5), y = O(230, 330);
  if (a > 0) {
    ctx.save(); ctx.globalAlpha = a;
    txt('A FOOD SCIENCE SHORT', W / 2, y - O(62, 58), font(600, 18, F.m), 'rgba(255,214,170,.7)', 'center', 8);
    txt('WHY EEL IS NEVER SERVED RAW', W / 2, y, font(800, O(52, 46)), '#fff', 'center', O(5, 2));
    ctx.fillStyle = K.blood2; const lw = O(360, 300) * E.o3(P(t, .5, 1.3)); ctx.fillRect(W / 2 - lw / 2, y + 26, lw, 3);
    ctx.restore();
  }
}

// ============================================================ SCENE 2 · the eel, x-rayed
function eelHW(u) { return u < .07 ? .55 + .45 * Math.sin(u / .07 * Math.PI / 2) : u < .55 ? 1 : 1 - .92 * Math.pow((u - .55) / .45, 1.3); }
function eelGeo(t, o) {
  const n = 90, sp = [];
  for (let i = 0; i <= n; i++) { const u = i / n; sp.push([o.hx - u * o.len + (o.dx || 0), o.by + o.amp * (.2 + .8 * u) * Math.sin(u * 2.2 * TAU - t * 3) + (o.dy || 0)]); }
  const up = [], dn = [], nrm = [];
  for (let i = 0; i <= n; i++) {
    const a = sp[Math.max(0, i - 1)], b = sp[Math.min(n, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const nx = -dy, ny = dx, w = o.wd * eelHW(i / n); nrm.push([nx, ny]);
    up.push([sp[i][0] + nx * w, sp[i][1] + ny * w]); dn.push([sp[i][0] - nx * w, sp[i][1] - ny * w]);
  }
  return { sp, up, dn, nrm, n };
}
function eelBody(g, o) {
  const { up, dn, sp } = g; ctx.beginPath(); ctx.moveTo(up[0][0], up[0][1]);
  for (let i = 1; i < up.length; i++) ctx.lineTo(up[i][0], up[i][1]);
  for (let i = dn.length - 1; i >= 0; i--) ctx.lineTo(dn[i][0], dn[i][1]);
  const h = sp[0]; ctx.bezierCurveTo(h[0] + o.wd * 1.15, dn[0][1] - o.wd * .05, h[0] + o.wd * 1.25, up[0][1] + o.wd * .1, up[0][0], up[0][1]); ctx.closePath();
}
function drawEel(t, o, g, xrX) {
  const { sp, up, dn, nrm, n } = g;
  // fins: one long ribbon along the back and belly
  ctx.fillStyle = 'rgba(70,86,62,.65)';
  for (const [side, i0] of [[1, .3], [-1, .48]]) {
    ctx.beginPath(); const s0 = Math.round(i0 * n);
    for (let i = s0; i <= n; i++) { const w = o.wd * eelHW(i / n) * side, f = o.wd * .32 * Math.sin(Math.PI * Math.min(1, (i - s0) / (n - s0) * 1.1 + .05)) * side; ctx.lineTo(sp[i][0] + nrm[i][0] * (w + f), sp[i][1] + nrm[i][1] * (w + f)); }
    for (let i = n; i >= s0; i--) { const w = o.wd * eelHW(i / n) * side * .8; ctx.lineTo(sp[i][0] + nrm[i][0] * w, sp[i][1] + nrm[i][1] * w); }
    ctx.closePath(); ctx.fill();
  }
  eelBody(g, o); ctx.fillStyle = '#26332a'; ctx.fill();
  ctx.fillStyle = 'rgba(176,170,108,.7)'; ctx.beginPath();
  for (let i = 0; i <= n; i++) { const w = o.wd * eelHW(i / n) * .15; ctx.lineTo(sp[i][0] - nrm[i][0] * w, sp[i][1] - nrm[i][1] * w); }
  for (let i = n; i >= 0; i--) ctx.lineTo(dn[i][0], dn[i][1]); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(8,14,10,.45)'; ctx.beginPath();
  for (let i = 0; i <= n; i++) ctx.lineTo(up[i][0], up[i][1]);
  for (let i = n; i >= 0; i--) { const w = o.wd * eelHW(i / n) * .5; ctx.lineTo(sp[i][0] + nrm[i][0] * w, sp[i][1] + nrm[i][1] * w); } ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(210,220,170,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 6; i < n - 4; i++) ctx.lineTo(sp[i][0], sp[i][1]); ctx.stroke();
  const h = sp[0], ey = [h[0] - o.wd * .1 + nrm[2][0] * o.wd * .32, h[1] + nrm[2][1] * o.wd * .32];
  ctx.fillStyle = '#d9d39a'; ctx.beginPath(); ctx.arc(ey[0], ey[1], o.wd * .17, 0, TAU); ctx.fill();
  ctx.fillStyle = '#05080a'; ctx.beginPath(); ctx.arc(ey[0] + o.wd * .03, ey[1], o.wd * .11, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ey[0] - o.wd * .02, ey[1] - o.wd * .05, o.wd * .035, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(5,10,8,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(h[0] + o.wd * 1.05, h[1] + o.wd * .12); ctx.quadraticCurveTo(h[0] + o.wd * .6, h[1] + o.wd * .3, h[0] + o.wd * .15, h[1] + o.wd * .22); ctx.stroke();
  const gi = 8; ctx.beginPath(); ctx.arc(sp[gi][0], sp[gi][1] - nrm[gi][1] * 4, o.wd * .45, -.9, .9); ctx.stroke();
  ctx.fillStyle = 'rgba(90,110,80,.8)'; ctx.beginPath(); ctx.ellipse(sp[10][0] - o.wd * .3, sp[10][1] + o.wd * .35, o.wd * .55, o.wd * .22, .5 + .2 * Math.sin(t * 5), 0, TAU); ctx.fill();
  if (xrX > W + 50) return null;
  // x-ray layer
  ctx.save(); ctx.beginPath(); ctx.rect(xrX, -100, W - xrX + 100, H + 200); ctx.clip();
  eelBody(g, o); ctx.fillStyle = 'rgba(3,14,28,.96)'; ctx.fill();
  ctx.save(); ctx.shadowColor = 'rgba(95,212,255,.9)'; ctx.shadowBlur = 16; ctx.strokeStyle = 'rgba(130,225,255,.9)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = 'rgba(160,220,255,.32)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let i = 4; i < n - 2; i += 2) { const [x, y] = sp[i], [nx, ny] = nrm[i], w = o.wd * eelHW(i / n) * .6; ctx.moveTo(x - nx * w, y - ny * w); ctx.lineTo(x + nx * w * .85, y + ny * w * .85); }
  ctx.stroke();
  const vp = sp.map((p, i) => [p[0] - nrm[i][0] * o.wd * .2 * eelHW(i / n), p[1] - nrm[i][1] * o.wd * .2 * eelHW(i / n)]);
  ctx.strokeStyle = 'rgba(255,70,90,.55)'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 6; i < n - 8; i += 3) { const [x, y] = vp[i], [nx, ny] = nrm[i], w = o.wd * eelHW(i / n); for (const sg of [1, -1]) { const k = sg * w * .78; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + nx * k * .5 + 8, y + ny * k * .5, x + nx * k - 8 * sg, y + ny * k); } }
  ctx.stroke();
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#ff2a45'; ctx.lineWidth = o.wd * .17; ctx.shadowColor = 'rgba(255,40,60,.95)'; ctx.shadowBlur = 22;
  ctx.beginPath(); for (let i = 3; i < n - 3; i++) i === 3 ? ctx.moveTo(vp[i][0], vp[i][1]) : ctx.lineTo(vp[i][0], vp[i][1]); ctx.stroke(); ctx.restore();
  for (let k = 0; k < 3; k++) { const u = (((t - TM.scan) * .55 + k / 3) % 1 + 1) % 1, i = Math.floor(3 + u * (n - 8)); glow(vp[i][0], vp[i][1], o.wd * 1.4, REDc, .55); }
  const hb = Math.pow(Math.max(0, Math.sin((t - TM.scan) * TAU / .8)), 6); glow(vp[7][0], vp[7][1], o.wd * (1.5 + hb), REDc, .45 + .45 * hb);
  ctx.restore();
  if (xrX > -50) { const g2 = ctx.createLinearGradient(xrX - 40, 0, xrX + 40, 0); g2.addColorStop(0, 'rgba(95,212,255,0)'); g2.addColorStop(.5, 'rgba(160,235,255,.55)'); g2.addColorStop(1, 'rgba(95,212,255,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g2; ctx.fillRect(xrX - 40, 0, 80, H); ctx.restore(); }
  return vp;
}
function water(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b3a56'); g.addColorStop(.5, '#061d30'); g.addColorStop(1, '#020a12'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 6; k++) {
    const x0 = W * (k + .5) / 6 + 120 * Math.sin(t * .3 + k * 2), w0 = 70 + 40 * Math.sin(k * 3.1);
    for (let j = 1; j <= 3; j++) {
      const w = w0 * j / 2, rg = ctx.createLinearGradient(0, 0, 0, H * .9); rg.addColorStop(0, `rgba(140,220,255,${(.035 + .015 * Math.sin(t * .8 + k)) / j})`); rg.addColorStop(1, 'rgba(140,220,255,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(x0 - w, 0); ctx.lineTo(x0 + w, 0); ctx.lineTo(x0 + w * 2.6 + 260, H * .9); ctx.lineTo(x0 - w * .6 + 260, H * .9); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
  for (const s of SNOW) { const x = ((s.x + t * 14 * s.v) % W + W) % W, y = ((s.y - t * 10 * s.v) % H + H) % H; ctx.fillStyle = `rgba(200,235,255,${.3 * s.v})`; ctx.fillRect(x, y, s.s, s.s); }
}
function nameCard(t, t0, cx, cy) {
  const word = 'ICHTHYOHEMOTOXIN', parts = [[0, 7, 'FISH', '95,212,255', C.cyan2], [7, 11, 'BLOOD', '255,74,94', K.blood2], [11, 16, 'POISON', '255,61,172', '#ff8fd0']];
  let fs = O(132, 96); ctx.font = font(900, fs); let tw = ctx.measureText(word).width + 15 * 4; const maxW = O(1560, 980); if (tw > maxW) fs *= maxW / tw;
  ctx.font = font(900, fs); const xs = []; let x = 0; for (const ch of word) { const w = ctx.measureText(ch).width + 4; xs.push([x, w]); x += w; } tw = x; const x0 = cx - tw / 2;
  const tB = t0 + .8, cp = E.o3(P(t, tB, tB + .4));
  for (let i = 0; i < word.length; i++) {
    const ti = t0 + i * .03, p = P(t, ti, ti + .32); if (p <= 0) continue; const e = E.oBack(p);
    const pi = i < 7 ? 0 : i < 11 ? 1 : 2, col = mixc('#ffffff', parts[pi][4].length === 7 ? parts[pi][4] : '#ffffff', cp);
    ctx.save(); ctx.globalAlpha = clamp(p * 2); ctx.shadowColor = `rgba(${parts[pi][3]},${.6 * cp})`; ctx.shadowBlur = 30;
    txt(word[i], x0 + xs[i][0], cy - 46 * (1 - e), font(900, fs), col, 'left', 0); ctx.restore();
  }
  mono('SAY IT:  ICK · THEE · OH · HEE · MO · TOX · IN', cx, cy - fs * .95, O(19, 16), 'rgba(220,240,255,.75)', P(t, t0 + .35, t0 + .8), 'center', 4);
  for (const [a, b, lab, rgb, col] of parts) {
    const p = P(t, tB + a * .03, tB + .35 + a * .03); if (p <= 0) continue;
    const xa = x0 + xs[a][0] + 4, xb = x0 + xs[b - 1][0] + xs[b - 1][1] - 6, y = cy + fs * .2, mx = (xa + xb) / 2, hw = (xb - xa) / 2 * E.o3(p);
    ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx - hw, y - 10); ctx.lineTo(mx - hw, y); ctx.lineTo(mx + hw, y); ctx.lineTo(mx + hw, y - 10); ctx.moveTo(mx, y); ctx.lineTo(mx, y + 12); ctx.stroke();
    txt(typed(lab, P(t, tB + .2 + a * .03, tB + .5 + a * .03)), mx, y + O(48, 42), font(700, O(26, 22), F.m), col, 'center', 6);
    ctx.restore();
  }
}
function sceneEel(t) {
  water(t);
  const dim = E.io(P(t, LS(3) - .4, LS(3) + .2));
  const o = O({ hx: 1580, by: 600, len: 1350, amp: 34, wd: 42 }, { hx: 990, by: 1020, len: 920, amp: 30, wd: 34 });
  o.dx = 40 * Math.sin(t * .4) + 60 * (t - T.eel) / 6; o.dy = dim * O(150, 190);
  const g = eelGeo(t, o);
  const xrX = lerp(o.hx + o.dx + 140, o.hx + o.dx - o.len - 140, E.io(P(t, TM.scan, TM.scan + 1.0)));
  const pIn = E.o3(P(t, T.eel, T.eel + .9));
  ctx.save(); ctx.globalAlpha = 1 - .62 * dim; ctx.translate(-O(260, 200) * (1 - pIn), 0);
  const vp = drawEel(t, o, g, t < TM.scan ? W + 100 : xrX);
  ctx.restore();
  const sx = -O(260, 200) * (1 - pIn);
  if (vp) {
    const bv = vp[31];
    callout(bv[0] + sx, bv[1], O(-110, -100), O(-200, -230), 'BLOOD VESSEL', 'CARRIES THE TOXIN', vis(t, TM.blood, LS(3) - .25, .9, .3), '#ff9aa5');
    const ia = vis(t, TM.prot, LS(3) - .25, .5, .3);
    if (ia > 0) {
      const [ix, iy, ir] = O([1360, 250, 130], [770, 580, 118]), src = vp[16], rr = ir * E.oBack(clamp(ia * 1.25));
      ctx.save(); ctx.globalAlpha = ia;
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(src[0] + sx, src[1]); ctx.lineTo(ix, iy + rr); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(src[0] + sx, src[1], 5, 0, TAU); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, rr, 0, TAU); ctx.clip();
      const sg = ctx.createRadialGradient(ix, iy, 0, ix, iy, rr); sg.addColorStop(0, '#7a1624'); sg.addColorStop(1, '#2a050c'); ctx.fillStyle = sg; ctx.fillRect(ix - rr, iy - rr, rr * 2, rr * 2);
      rbc(ix - rr * .55, iy + rr * .5, rr * .42, .6, .8);
      drawMol(MOLS[0], ix - rr * .25, iy - rr * .2, rr * .2, t); drawMol(MOLS[1], ix + rr * .4, iy + rr * .25, rr * .16, t); drawMol(MOLS[2], ix + rr * .35, iy - rr * .5, rr * .11, t);
      ctx.restore();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ix, iy, rr, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(95,212,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ix, iy, rr + 9, -Math.PI * .9 + t, Math.PI * .1 + t); ctx.stroke();
      ctx.restore();
      const ha = vis(t, TM.toxin - .1, LS(3) - .25, .35, .3);
      if (ha > 0) {
        const blink = Math.floor(t * 4) % 2 ? 1 : .55;
        if (!V) { hazardSign(1560, 236, 46, '#ff4a5e', ha * blink); label('PROTEIN TOXIN', 1606, 250, 32, '#fff', ha, 'left', 2); mono('HIDDEN IN THE BLOOD', 1608, 282, 15, '#ffc0c8', ha, 'left', 3); }
        else { hazardSign(770, 330, 40, '#ff4a5e', ha * blink); label('PROTEIN TOXIN', 770, 404, 30, '#fff', ha, 'center', 2); mono('HIDDEN IN THE BLOOD', 770, 432, 14, '#ffc0c8', ha, 'center', 3); }
      }
    }
  }
  if (t > TM.name) nameCard(t, TM.name, W / 2, O(380, 600));
}

// ============================================================ SCENE 3 · the chef's hand
const HAND = { f: [[-84, -244, -.14, 178, 50], [-30, -256, -.04, 206, 54], [24, -252, .06, 196, 52], [76, -236, .17, 156, 46]], th: [104, -92, .98, 148, 58] };
function handParts() {
  const parts = [() => { ctx.beginPath(); ctx.moveTo(-98, 20); ctx.bezierCurveTo(-120, -70, -124, -190, -110, -246); ctx.bezierCurveTo(-60, -272, 60, -270, 104, -240); ctx.bezierCurveTo(130, -170, 134, -60, 100, 20); ctx.closePath(); }];
  for (const [x, y, a, l, w] of HAND.f) parts.push(() => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rrect(-w / 2, -l, w, l + w * .6, w / 2); ctx.restore(); });
  const [x, y, a, l, w] = HAND.th; parts.push(() => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rrect(-w / 2, -l, w, l + w * .4, w / 2); ctx.restore(); });
  return parts;
}
function drawHand(t, pool) {
  const parts = handParts();
  ctx.save(); ctx.shadowColor = 'rgba(20,8,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = 18; ctx.shadowOffsetY = 26; ctx.fillStyle = '#000';
  for (const p of parts) { p(); ctx.fill(); } ctx.restore();
  ctx.strokeStyle = 'rgba(110,50,36,.7)'; ctx.lineWidth = 7; for (const p of parts) { p(); ctx.stroke(); }
  const sg = ctx.createLinearGradient(-140, -440, 140, 20); sg.addColorStop(0, '#f6cdb4'); sg.addColorStop(.6, '#e2a88c'); sg.addColorStop(1, '#c4876c');
  ctx.fillStyle = sg; for (const p of parts) { p(); ctx.fill(); }
  // nails, creases, knuckles
  for (const [x, y, a, l, w] of [...HAND.f, HAND.th]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    rrect(-w * .3, -l + w * .1, w * .6, w * .78, w * .28); ctx.fillStyle = '#f7d9cf'; ctx.fill(); ctx.strokeStyle = 'rgba(150,80,70,.45)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-w * .14, -l + w * .2, w * .1, w * .4);
    ctx.strokeStyle = 'rgba(140,70,55,.4)'; ctx.lineWidth = 2;
    for (const f of [.42, .7]) { ctx.beginPath(); ctx.arc(0, -l * f + l * .05, w * .32, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,235,220,.22)'; ctx.beginPath(); ctx.ellipse(-10, -150, 70, 90, -.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,240,230,.25)'; ctx.lineWidth = 5; for (const [x, y] of HAND.f) { ctx.beginPath(); ctx.moveTo(x * .9, y + 30); ctx.quadraticCurveTo(x * .5, -120, x * .3, -20); ctx.stroke(); }
  // the cut
  ctx.save(); ctx.translate(-38, -196); ctx.rotate(.55);
  ctx.strokeStyle = 'rgba(225,95,95,.4)'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.quadraticCurveTo(0, -3, 22, 1); ctx.stroke();
  ctx.strokeStyle = '#7a0a16'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-21, 0); ctx.quadraticCurveTo(0, -3, 21, 1); ctx.stroke();
  ctx.fillStyle = '#c4102a'; ctx.beginPath(); ctx.arc(4, -1, 3, 0, TAU); ctx.fill();
  ctx.restore();
  // chef's sleeve
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 30;
  const wg = ctx.createLinearGradient(-150, 0, 150, 0); wg.addColorStop(0, '#c7ced6'); wg.addColorStop(.4, '#f7f9fb'); wg.addColorStop(1, '#b8c0c9');
  rrect(-142, -4, 284, 780, 36); ctx.fillStyle = wg; ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(90,100,115,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-138, 40); ctx.lineTo(138, 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-60, 70); ctx.quadraticCurveTo(-40, 200, -70, 330); ctx.moveTo(50, 90); ctx.quadraticCurveTo(70, 220, 40, 360); ctx.stroke();
}
function boardBg(t) {
  const g = ctx.createLinearGradient(0, 0, W * .45, H); g.addColorStop(0, '#80583a'); g.addColorStop(1, '#3e2615'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.lineWidth = 2;
  for (let i = 0; i < 46; i++) { const y0 = (i + .5) * H / 46; ctx.strokeStyle = `rgba(45,25,10,${.16 + .16 * NP[(i * 7) % 1024]})`; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 40) ctx.lineTo(x, y0 + 9 * noise(x * .003 + i * 7.7) + 4 * noise(x * .02 + i)); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,230,200,.07)'; ctx.lineWidth = 1.5; for (let i = 0; i < 14; i++) { const x = NP[i * 11] * W, y = NP[i * 13 + 5] * H, a = NP[i * 17 + 3] * 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 160, y + Math.sin(a) * 160); ctx.stroke(); }
  glow(W * .3, H * .2, Math.max(W, H) * .8, '255,200,140', .1);
}
function filletPath(L, Hh, wob = 1) {
  ctx.beginPath(); const n = 40;
  for (let i = 0; i <= n; i++) { const u = i / n, x = (u - .5) * L, y = -Hh / 2 + wob * 6 * noise(u * 9 + 3) + Hh * .08 * Math.pow(Math.abs(u - .5) * 2, 6); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.bezierCurveTo(L / 2 + Hh * .3, -Hh * .3, L / 2 + Hh * .3, Hh * .3, L / 2, Hh / 2);
  for (let i = n; i >= 0; i--) { const u = i / n, x = (u - .5) * L, y = Hh / 2 + wob * 6 * noise(u * 9 + 40) - Hh * .08 * Math.pow(Math.abs(u - .5) * 2, 6); ctx.lineTo(x, y); }
  ctx.bezierCurveTo(-L / 2 - Hh * .3, Hh * .3, -L / 2 - Hh * .3, -Hh * .3, -L / 2, -Hh / 2 + wob * 6 * noise(3)); ctx.closePath();
}
function knife(x, y, ang, s) {
  inPlace(x, y, s, ang, () => {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetX = 40; ctx.shadowOffsetY = 60;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(60, 30, 200, 42); ctx.lineTo(560, 46); ctx.lineTo(560, -30); ctx.lineTo(120, -22); ctx.quadraticCurveTo(40, -16, 0, 0); ctx.closePath();
    const bg = ctx.createLinearGradient(0, -30, 0, 46); bg.addColorStop(0, '#6f7a85'); bg.addColorStop(.35, '#e9eef3'); bg.addColorStop(.7, '#aeb8c2'); bg.addColorStop(1, '#f7fbff'); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 4); ctx.quadraticCurveTo(60, 32, 200, 43); ctx.lineTo(556, 46); ctx.stroke();
    ctx.fillStyle = 'rgba(190,20,40,.75)'; ctx.beginPath(); ctx.moveTo(4, 1); ctx.quadraticCurveTo(50, 20, 120, 26); ctx.quadraticCurveTo(80, 6, 30, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8b939c'; ctx.fillRect(560, -34, 26, 84);
    const hg = ctx.createLinearGradient(0, -30, 0, 46); hg.addColorStop(0, '#2a1a10'); hg.addColorStop(.5, '#5a3a22'); hg.addColorStop(1, '#1e120a'); ctx.fillStyle = hg; rrect(586, -30, 330, 76, 30); ctx.fill();
    ctx.fillStyle = '#c9ced4'; for (const hx2 of [660, 760, 860]) { ctx.beginPath(); ctx.arc(hx2, 8, 6, 0, TAU); ctx.fill(); }
  });
}
function sceneHand(t) {
  const L = O({ wx: 1210, wy: 900, rot: -.5, s: 1.3, fall: 400 }, { wx: 720, wy: 1380, rot: -.32, s: 1.15, fall: 430 });
  const hp = (lx, ly) => { const c = Math.cos(L.rot), s = Math.sin(L.rot); return [L.wx + L.s * (lx * c - ly * s), L.wy + L.s * (lx * s + ly * c)]; };
  const [cx, cy] = hp(-38, -196), tipX = cx, tipY = cy - L.fall;
  const zp = E.i2(P(t, TM.zoom0, T.serum)), z = Math.exp(Math.log(90) * zp), drift = 1 + .04 * P(t, T.hand - .7, TM.zoom0);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(z * drift, z * drift); ctx.translate(-cx, -cy);
  boardBg(t);
  ctx.fillStyle = 'rgba(150,10,28,.75)'; for (let k = 0; k < 7; k++) { const bx = O(1460, 760) + NP[k * 9] * O(320, 260), by = O(170, 420) + NP[k * 9 + 4] * O(260, 240); ctx.beginPath(); ctx.ellipse(bx, by, 5 + NP[k * 3] * 9, 4 + NP[k * 5] * 6, NP[k] * 3, 0, TAU); ctx.fill(); }
  inPlace(L.wx, L.wy, L.s, L.rot, () => drawHand(t));
  // impact zone marker
  const za = vis(t, TM.zone, TM.hit, .3, .15);
  if (za > 0) { ctx.save(); ctx.globalAlpha = za; ctx.strokeStyle = '#ffdf8a'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -t * 30; ctx.beginPath(); ctx.arc(cx, cy, 46 + 4 * Math.sin(t * 6), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58); ctx.lineTo(cx + Math.cos(a) * 74, cy + Math.sin(a) * 74); ctx.stroke(); } ctx.restore(); }
  // splash + pool
  const sp = P(t, TM.hit, TM.hit + .6);
  if (t >= TM.hit) {
    const pr = O(26, 24) * E.o3(P(t, TM.hit, TM.hit + .35));
    ctx.save(); ctx.globalAlpha = .84; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, rr = pr * (1 + .22 * noise(a * 2 + 5) + .1 * Math.sin(a * 5)); ctx.lineTo(cx + 4 + Math.cos(a) * rr * 1.2, cy + 2 + Math.sin(a) * rr); } ctx.closePath();
    const pg = ctx.createRadialGradient(cx - pr * .3, cy - pr * .3, 1, cx, cy, pr * 1.4); pg.addColorStop(0, '#ff5a6c'); pg.addColorStop(.5, '#b80d26'); pg.addColorStop(1, '#5a0012'); ctx.fillStyle = pg; ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(cx - pr * .35, cy - pr * .3, pr * .28, pr * .14, -.4, 0, TAU); ctx.fill();
    if (sp < 1) {
      ctx.strokeStyle = `rgba(255,120,130,${1 - sp})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, 20 + 110 * E.o3(sp), 16 + 88 * E.o3(sp), 0, 0, TAU); ctx.stroke();
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + .3 * NP[k], d = O(80, 72) * E.o3(sp) * (.5 + .7 * NP[k + 20]), r = 7 * (1 - sp) * (.5 + NP[k + 40]); if (r < .3) continue; ctx.fillStyle = '#d0142e'; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * .85, r, 0, TAU); ctx.fill(); }
    }
  }
  // the drop
  const r0 = O(17, 16), form = E.o3(P(t, TM.form, wt(4, 'drop') + .3)), fp = P(t, TM.fall, TM.hit);
  let dx = tipX, dy, dr, st, e = 0;
  if (t < TM.fall) { dr = r0 * form; st = 1 + .1 * Math.sin(t * 6) + .3 * P(t, TM.fall - .6, TM.fall); dy = tipY + dr * 1.6 * st; }
  else { e = E.i2(fp); dr = r0 * lerp(1, .8, e); st = lerp(1.6, 1.15, e); dy = lerp(tipY + r0 * 1.9, cy - dr * .2, e); }
  if (t < TM.hit && dr > .5) {
    ctx.fillStyle = `rgba(30,5,0,${.12 + .3 * e})`; ctx.beginPath(); ctx.ellipse(cx + 70 * (1 - e), cy + 40 * (1 - e), dr * (1.8 - .8 * e), dr * (1.2 - .5 * e), 0, 0, TAU); ctx.fill();
    if (t >= TM.fall) { const tg = ctx.createLinearGradient(0, dy - 160 * e, 0, dy); tg.addColorStop(0, 'rgba(255,60,80,0)'); tg.addColorStop(1, 'rgba(255,60,80,.35)'); ctx.fillStyle = tg; ctx.fillRect(dx - dr * .5, dy - 160 * e, dr, 160 * e); }
    drawDrop(dx, dy, dr, 1, st);
  }
  knife(tipX, tipY, Math.PI + .62, O(1, .92));
  ctx.restore();
  // screen-space overlays
  const Zs = z * drift, toS = (x, y) => [cx + (x - cx) * Zs, cy + (y - cy) * Zs], [rdx, rdy] = toS(dx, dy - dr * .4);
  const ua = vis(t, T.hand - .2, TM.zoom0 + .1, .4, .3);
  if (t < TM.hit) reticle(rdx, rdy, O(46, 42), t, 'DROP #001', 'EEL BLOOD', vis(t, TM.single, TM.hit, .35, .12), K.blood2);
  const ra = vis(t, TM.form, TM.hit + .7, .3, .3) * (Math.floor(t * 2.5) % 2 ? 1 : .6);
  mono('● REC   HIGH-SPEED · 1,000 FPS', O(W - 70, 70), O(142, 270), 15, '#ff8a8a', ra, O('right', 'left'), 3);
  callout(cx, cy, O(-250, -200), O(70, 120), 'TINY CUT', 'OPEN SKIN', vis(t, TM.tiny, TM.zoom0 + .05, .8, .25) * ua, '#fff');
  const [hx2, hy2] = toS(...hp(40, -110));
  callout(hx2, hy2, O(230, 160), O(-40, 110), "CHEF'S HAND", 'SURFACE CONTACT', vis(t, TM.hand2, TM.zoom0 + .05, .8, .25) * ua, '#fff', O(1, 0));
  const la = P(t, TM.zoom0, TM.zoom0 + .3);
  if (la > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) { const rr = ((k * 220 + zp * 1600) % 1100) + 40; ctx.strokeStyle = `rgba(${CYc},${.35 * la * (1 - rr / 1140)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, TAU); ctx.stroke(); }
    for (let k = 0; k < 48; k++) { const a = k / 48 * TAU + NP[k] * .1, r1 = 150 + NP[k + 50] * 300, r2 = r1 + 200 + 700 * zp; ctx.strokeStyle = `rgba(255,190,190,${.16 * zp})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); ctx.stroke(); }
    ctx.restore();
    const mag = Math.round(Math.exp(Math.log(250000) * zp));
    ctx.save(); ctx.globalAlpha = la; ctx.fillStyle = 'rgba(4,10,20,.6)'; rrect(W / 2 - 200, O(118, 258), 400, 116, 20); ctx.fill(); ctx.restore();
    mono('MAGNIFICATION', W / 2, O(150, 290), 16, C.cyan2, la, 'center', 8);
    label('×' + mag.toLocaleString('en-US'), W / 2, O(214, 356), O(60, 56), '#fff', la, 'center', 2);
  }
}

// ============================================================ SCENE 4 · inside the drop
function rbc(x, y, rx, rot, a, soft = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; const ry = rx * .64;
  const g = ctx.createRadialGradient(-rx * .2, -ry * .3, rx * .1, 0, 0, rx * 1.02); g.addColorStop(0, '#ff6670'); g.addColorStop(.6, '#cc1a2c'); g.addColorStop(.9, '#8a0a1a'); g.addColorStop(1, soft ? 'rgba(138,10,26,0)' : '#6e0614');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
  if (!soft) {
    const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * .36); ng.addColorStop(0, 'rgba(110,8,60,.85)'); ng.addColorStop(1, 'rgba(110,8,60,0)'); ctx.fillStyle = ng; ctx.beginPath(); ctx.ellipse(0, 0, rx * .38, ry * .44, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,170,170,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, rx * .82, ry * .78, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function serumBg(t) {
  const g = ctx.createRadialGradient(W * .55, H * .45, 40, W * .5, H * .5, Math.max(W, H) * .75); g.addColorStop(0, '#701521'); g.addColorStop(.5, '#3a0711'); g.addColorStop(1, '#120205'); ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
  for (let k = 0; k < 4; k++) glow(W * (.2 + .25 * k) + 80 * Math.sin(t * .4 + k), H * (.3 + .2 * Math.sin(t * .3 + k * 2)), O(420, 380), '255,120,90', .06);
}
function sceneSerum(t) {
  const settle = E.o3(P(t, T.serum, T.serum + 1.4)), zc = lerp(1.3, 1, settle) + .04 * P(t, T.serum, T.split);
  const S = (x, y) => [W / 2 + (x - W / 2) * zc, H / 2 + (y - H / 2) * zc];
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(zc, zc); ctx.translate(-W / 2, -H / 2);
  serumBg(t);
  for (const f of SER.far) rbc(f.x + 30 * Math.sin(t * .2 + f.rot), f.y + 20 * Math.cos(t * .25 + f.rot), f.rx, f.rot + t * .05, f.a, 1);
  for (const s of SER.specks) { const x = s.x + 30 * Math.sin(t * .3 * s.v + s.p), y = (s.y - t * 8 * s.v + H * 4) % H; ctx.fillStyle = `rgba(255,190,170,${.25 * s.v})`; ctx.fillRect(x, y, s.s, s.s); }
  for (const c of SER.cells) rbc(c.x + 18 * Math.sin(t * c.sp + c.rot), c.y + 14 * Math.cos(t * c.sp * 1.3 + c.rot), c.rx, c.rot + t * .08 * c.sp, .95);
  for (const m of SER.mols) {
    const ta = lerp(TM.jag + .15, TM.mols + .35, m.ta), p = P(t, ta, ta + .45); if (p <= 0) continue;
    drawMol(m.m, m.x + 22 * noise(t * .3 + m.ta * 70), m.y + 22 * noise(t * .3 + m.ta * 90 + 9), m.R * E.oBack(p), t, { a: clamp(p * 2) * m.d });
  }
  const H0 = O([1120, 470, 112], [560, 820, 100]), hx2 = H0[0] + 14 * noise(t * .4), hy2 = H0[1] + 14 * noise(t * .4 + 20), hp = P(t, TM.jag - .1, TM.jag + .4);
  drawMol(HERO, hx2, hy2, H0[2] * E.oBack(hp), t, { a: clamp(hp * 2) });
  ctx.restore();
  // screen-space labels
  const [rx, ry] = S(hx2, hy2), endA = T.split + .3;
  reticle(rx, ry, H0[2] * 1.45 * zc, t, 'TOXIN #001', 'SUSPENDED IN SERUM', vis(t, TM.jag, endA, .4, .3), K.tox);
  const [sx1, sy1] = S(hx2 + H0[2] * 1.05, hy2 + H0[2] * .9);
  callout(sx1, sy1, O(170, 120), O(110, 230), 'JAGGED SPIKES', 'PROTEIN ARMS', vis(t, TM.spk, endA, .8, .3), '#ffb3e2', O(1, 0));
  const c0 = SER.cells[0], [cx1, cy1] = S(c0.x + 18 * Math.sin(t * c0.sp + c0.rot), c0.y + 14 * Math.cos(t * c0.sp * 1.3 + c0.rot));
  callout(cx1, cy1, O(130, 60), O(-120, -170), 'FISH RED BLOOD CELL', 'OVAL · HAS A NUCLEUS', vis(t, TM.susp - .2, endA, .8, .3), '#fff', O(1, 0));
  const pa = vis(t, T.serum + .4, endA, .5, .3);
  if (pa > 0) {
    const [px, py, pw] = O([70, 128, 400], [560, 250, 440]);
    hudPanel(px, py, pw, 170, 'SAMPLE · EEL BLOOD', pa, K.blood2);
    ctx.save(); ctx.globalAlpha = pa;
    const rows = [['MAG', '×250,000', '#fff', 0], ['MEDIUM', 'SERUM', P(t, TM.ser, TM.ser + .2) > 0 ? K.gold : '#fff', 0], ['TOXIN', P(t, TM.jag, TM.jag + .1) > 0 ? 'DETECTED' : '—', '#ff6aa8', 1]];
    rows.forEach(([k, v, col, bl], i) => { const y = py + 74 + i * 32; txt(k, px + 24, y, font(600, 15, F.m), 'rgba(220,240,255,.6)', 'left', 3); ctx.globalAlpha = pa * (bl && v !== '—' ? (Math.floor(t * 3) % 2 ? 1 : .5) : 1); txt(v, px + 150, y, font(700, 18, F.m), col, 'left', 3); ctx.globalAlpha = pa; });
    ctx.restore();
  }
  note('SCHEMATIC · NOT TO SCALE', vis(t, T.serum + .5, endA, .5, .3));
}

// ============================================================ SCENE 5 · swallowed vs. contact
const BUST = [[-60, 90], [-72, 20], [-118, -50], [-128, -140], [-92, -214], [-10, -250], [56, -222], [78, -165], [82, -138], [112, -96], [86, -80], [96, -63], [82, -55], [93, -45], [80, -20], [62, 4], [28, 16], [32, 92], [150, 132], [168, 340], [-176, 340], [-160, 130]];
const GUT = [[190, -50], [96, -50], [62, -48], [30, -30], [18, 20], [10, 100], [6, 170], [14, 210], [40, 238]];
function splitPanels() { return O({ L: [110, 150, 830, 650], R: [980, 150, 830, 650] }, { L: [60, 250, 960, 560], R: [60, 850, 960, 560] }); }
function sceneSplit(t) {
  labBg(t, 0);
  const PN = splitPanels(), lA = 1 - .5 * P(t, TM.rOn, TM.rOn + .4), rOn = P(t, TM.rOn, TM.rOn + .4), enter = E.o3(P(t, T.split - .2, T.split + .5));
  // LEFT · typical poison
  { const [x, y, w, h] = PN.L, ox = x + w * O(.34, .3), oy = y + O(340, 330), s = O(.86, .78);
    ctx.save(); ctx.globalAlpha = enter * lA; ctx.translate(0, 30 * (1 - enter));
    hudPanel(x, y, w, h, 'ROUTE · INGESTION', 1, C.cyan);
    ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
    inPlace(ox, oy, s, 0, () => {
      smoothPath(BUST); ctx.fillStyle = 'rgba(95,212,255,.08)'; ctx.fill(); ctx.strokeStyle = 'rgba(155,231,255,.8)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.setLineDash([8, 7]); ctx.strokeStyle = 'rgba(155,231,255,.55)'; ctx.lineWidth = 3; ctx.beginPath(); GUT.slice(1).forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.restore();
      const hit = P(t, TM.pill1, TM.pill1 + .3), sg = 1 - P(t, TM.pill1 + .3, TM.pill1 + 2.5) * .5;
      ctx.save(); ctx.translate(46, 248); ctx.rotate(-.35); ctx.beginPath(); ctx.ellipse(0, 0, 66, 40, 0, 0, TAU); ctx.restore();
      ctx.fillStyle = `rgba(255,60,80,${.45 * hit * sg})`; ctx.fill(); ctx.strokeStyle = hit > 0 ? mixc('#9be7ff', '#ff4a5e', hit) : 'rgba(155,231,255,.8)'; ctx.lineWidth = 3; ctx.stroke();
      if (hit > 0) glow(46, 248, 140, REDc, .5 * hit * sg);
      const pp = E.io(P(t, TM.pill0, TM.pill1)), [px, py] = polyAt(GUT, pp), pa = P(t, TM.pill0 - .6, TM.pill0 - .2) * (1 - hit);
      if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; ctx.translate(px, py); ctx.rotate(.5); rrect(-20, -10, 40, 20, 10); ctx.fillStyle = '#7dffb0'; ctx.fill(); ctx.fillStyle = '#2fbf6a'; ctx.fillRect(0, -10, 20, 20); ctx.restore(); glow(px, py, 40, SAFEc, .35 * pa); }
      if (hit > 0) mono('HARM', 130, 256, 18, K.blood2, hit, 'left', 4);
    });
    ctx.restore();
    const tx = x + w * O(.6, .58);
    label('TYPICAL POISON', tx, y + O(250, 210), O(38, 36), '#fff', 1, 'left', 2);
    mono('ONLY HURTS YOU', tx + 2, y + O(300, 258), 17, 'rgba(220,240,255,.8)', 1, 'left', 4);
    mono('IF SWALLOWED', tx + 2, y + O(328, 286), 17, 'rgba(220,240,255,.8)', 1, 'left', 4);
    const sw = P(t, TM.pill1 - .2, TM.pill1 + .3);
    if (sw > 0) { ctx.save(); ctx.globalAlpha = sw; ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; rrect(tx, y + O(368, 322), O(250, 250), 44, 22); ctx.stroke(); txt('MOUTH → GUT', tx + 22, y + O(397, 351), font(700, 17, F.m), C.cyan2, 'left', 3); ctx.restore(); }
    ctx.restore();
  }
  // RIGHT · eel toxin on contact
  { const [x, y, w, h] = PN.R, ox = x + w * O(.33, .3), oy = y + O(400, 360), s = O(1, .86), a = enter * (.4 + .6 * rOn);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, 30 * (1 - enter));
    hudPanel(x, y, w, h, 'ROUTE · SURFACE CONTACT', 1, K.tox);
    ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
    const tp = P(t, TM.rOn, TM.touch), hit = P(t, TM.touch, TM.touch + .9);
    inPlace(ox, oy, s, 0, () => {
      const SW = 300;
      ctx.fillStyle = '#d98d7c'; ctx.beginPath(); ctx.moveTo(-SW, 0); ctx.lineTo(SW, 0); ctx.lineTo(SW + 70, -60); ctx.lineTo(-SW + 70, -60); ctx.closePath(); ctx.fill();
      const lay = [[0, 34, '#e9a593'], [34, 120, '#c86a63'], [120, 220, '#efd08f']];
      for (const [a0, a1, c] of lay) { ctx.fillStyle = c; ctx.fillRect(-SW, a0, SW * 2, a1 - a0); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(SW, a0); ctx.lineTo(SW + 70, a0 - 60); ctx.lineTo(SW + 70, a1 - 60); ctx.lineTo(SW, a1); ctx.closePath(); ctx.fill(); ctx.fillStyle = c; ctx.globalAlpha *= .6; ctx.fill(); ctx.globalAlpha = a; }
      ctx.strokeStyle = 'rgba(80,20,20,.35)'; ctx.lineWidth = 2; for (let k = -6; k <= 6; k++) { ctx.beginPath(); ctx.arc(k * 46, 17, 14, 0, TAU); ctx.stroke(); }
      if (hit > 0) {
        for (let k = 0; k < 3; k++) { const q = clamp(hit * 1.4 - k * .2); if (q <= 0 || q >= 1) continue; ctx.strokeStyle = `rgba(255,90,120,${1 - q})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(35, -30, 40 + 230 * E.o3(q), 12 + 60 * E.o3(q), 0, 0, TAU); ctx.stroke(); }
        const st = E.o3(P(t, TM.touch, TM.touch + 1.2)); const rg = ctx.createRadialGradient(35, 0, 0, 35, 0, 40 + 200 * st); rg.addColorStop(0, 'rgba(255,30,60,.85)'); rg.addColorStop(1, 'rgba(255,30,60,0)'); ctx.fillStyle = rg; ctx.fillRect(-SW, -60, SW * 2 + 70, 280);
        glow(35, -20, 200, REDc, .5 * (1 - hit * .6));
      }
      const my = lerp(-250, -30 - 62, E.i2(tp)), sq = hit > 0 ? 1 - .15 * Math.sin(hit * Math.PI) : 1;
      drawMol(HERO, 35, my * sq + (hit > 0 ? 6 * hit : 0), 62, t, { a: P(t, TM.rOn - .3, TM.rOn + .1) });
    });
    ctx.restore();
    if (rOn < 1) { ctx.globalAlpha = enter * (1 - rOn); label('?', ox, oy - O(130, 110), 120, 'rgba(255,255,255,.35)', 1, 'center', 0, 900); ctx.globalAlpha = a; }
    const tx = x + w * O(.6, .58);
    label('EEL BLOOD TOXIN', tx, y + O(250, 210), O(38, 36), '#fff', 1, 'left', 2);
    mono('ATTACKS ON', tx + 2, y + O(300, 258), 17, '#ffc6e6', 1, 'left', 4);
    mono('SURFACE CONTACT', tx + 2, y + O(328, 286), 17, '#ffc6e6', P(t, TM.surf - .1, TM.surf + .2) * .6 + .4, 'left', 4);
    ctx.restore();
    stamp(t, TM.inst, x + w * O(.74, .72), y + O(140, 120), 'INSTANT', '#ff3b8e', -.08, O(52, 48));
  }
}

// ============================================================ SCENE 6 · the wound
function sceneTissue(t) {
  const { X0, Y0, wt: WT, D } = TIS;
  const sw = E.o3(P(t, TM.swell - .3, TM.swell + 1.3)) * (1 + .06 * Math.sin(t * 7)), bn = P(t, TM.burn - .25, TM.burn + .4);
  const bump = x => O(64, 52) * sw * Math.exp(-Math.pow((x - X0) / O(380, 320), 2));
  const sY = (x, y) => y - bump(x) * clamp(1 - (y - Y0) / O(700, 900));
  const hw = y => WT / 2 * Math.pow(clamp(1 - (y - Y0) / D), 1.2) * (1 + .12 * sw);
  const enter = E.o3(P(t, T.tissue - .3, T.tissue + .8)), zc = lerp(1.25, 1, enter);
  ctx.save(); ctx.translate(X0, Y0); ctx.scale(zc, zc); ctx.translate(-X0, -Y0);
  // background (air) + layers
  const ag = ctx.createLinearGradient(0, 0, 0, Y0); ag.addColorStop(0, '#0a0f1c'); ag.addColorStop(1, '#1b1a2a'); ctx.fillStyle = ag; ctx.fillRect(-W, -H, W * 3, H * 3);
  const band = (d0, d1, col) => { ctx.beginPath(); for (let x = -40; x <= W + 40; x += 20) ctx.lineTo(x, sY(x, Y0 + d0)); for (let x = W + 40; x >= -40; x -= 20) ctx.lineTo(x, d1 > 900 ? H + 400 : sY(x, Y0 + d1)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  { const g = ctx.createLinearGradient(0, Y0 + 290, 0, H); g.addColorStop(0, '#c49a5c'); g.addColorStop(1, '#4a3418'); band(290, 9999, g); }
  { const g = ctx.createLinearGradient(0, Y0 + 70, 0, Y0 + 290); g.addColorStop(0, '#c9655f'); g.addColorStop(1, '#a8494a'); band(70, 290, g); }
  { const g = ctx.createLinearGradient(0, Y0, 0, Y0 + 70); g.addColorStop(0, '#f0b29e'); g.addColorStop(1, '#df9584'); band(0, 70, g); }
  for (const f of TIS.fat) { const y = sY(f.x, Y0 + f.d); if (y > H + 40) continue; ctx.fillStyle = 'rgba(255,226,160,.28)'; ctx.beginPath(); ctx.arc(f.x, y, f.r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,110,40,.4)'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,200,190,.25)'; ctx.lineWidth = 3; for (const pts of TIS.fib) { ctx.beginPath(); pts.forEach(([x, d], i) => { const y = sY(x, Y0 + d); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }
  for (const c of TIS.epi) { if (Math.abs(c.x - X0) < hw(Y0 + c.d) + c.w * .6) continue; const y = sY(c.x, Y0 + c.d); ctx.fillStyle = 'rgba(255,215,200,.55)'; rrect(c.x - c.w / 2, y - c.h / 2, c.w, c.h, 8); ctx.fill(); ctx.strokeStyle = 'rgba(150,60,50,.35)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = 'rgba(140,50,70,.45)'; ctx.beginPath(); ctx.arc(c.x, y, 3.5, 0, TAU); ctx.fill(); }
  // nerves (light up with the pain)
  for (const pts of TIS.nerve) {
    ctx.strokeStyle = `rgba(255,230,120,${.2 + .6 * bn * (.7 + .3 * Math.sin(t * 20 + pts[0][0]))})`; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([x, d], i) => { const y = sY(x, Y0 + d); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    if (bn > 0) { const q = ((t * 1.6 + pts[0][0] * .001) % 1), [px, py] = polyAt(pts.map(([x, d]) => [x, sY(x, Y0 + d)]), q); glow(px, py, 30, '255,230,120', .6 * bn); }
  }
  // wound gap
  ctx.beginPath(); const steps = 24;
  for (let i = 0; i <= steps; i++) { const y = Y0 + D * i / steps; ctx.lineTo(X0 - hw(y), sY(X0 - hw(y), y)); }
  for (let i = steps; i >= 0; i--) { const y = Y0 + D * i / steps; ctx.lineTo(X0 + hw(y), sY(X0 + hw(y), y)); }
  ctx.closePath(); const wg = ctx.createLinearGradient(0, Y0, 0, Y0 + D); wg.addColorStop(0, '#5a0814'); wg.addColorStop(1, '#2a0208'); ctx.fillStyle = wg; ctx.fill();
  ctx.strokeStyle = mixc('#ff6a7a', '#ffb070', bn); ctx.lineWidth = 4; ctx.stroke();
  // the blood drop resting on top
  const dg = ctx.createRadialGradient(X0 - 60, Y0 - 90, 10, X0, Y0, O(340, 280)); dg.addColorStop(0, 'rgba(255,120,130,.55)'); dg.addColorStop(1, 'rgba(160,10,30,.42)');
  ctx.save(); ctx.beginPath(); ctx.ellipse(X0, sY(X0, Y0) + 2, O(330, 270), O(150, 125), 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = dg; ctx.fill(); ctx.strokeStyle = 'rgba(255,180,190,.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(X0, sY(X0, Y0), O(290, 236), O(120, 100), 0, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  // molecules seep in and bind to the walls
  const R = O(26, 22);
  TIS.mols.forEach((mm, k) => {
    const t0 = LS(10) + .3 + k * .12, t1 = TM.binds + k * .07, p = E.io(P(t, t0, t1));
    const tx = X0 + mm.side * Math.max(0, hw(mm.ty) - R * .7), ty = sY(tx, mm.ty);
    const x = lerp(mm.sx, tx, p) + (1 - p) * 10 * noise(t + k * 9), y = lerp(mm.sy, ty, p) + (1 - p) * 10 * noise(t + k * 9 + 4);
    const bound = P(t, t1, t1 + .25);
    if (bound > 0) { glow(tx + mm.side * R * .6, ty, R * 3.2, bn > 0 ? HEATc : REDc, .55 * (1 - bound * .4) + .2 * bn); if (bound < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - bound})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tx, ty, R * (1 + bound * 2.2), 0, TAU); ctx.stroke(); } }
    drawMol(mm.m, x, y, R, t, { rot: bound > 0 ? t1 * .45 : undefined, a: P(t, T.tissue - .2, T.tissue + .3) });
  });
  // burning
  if (bn > 0) {
    glow(X0, Y0 + 60, O(560, 440), HEATc, .5 * bn * (.85 + .15 * Math.sin(t * 9)));
    glow(X0, Y0 + 30, O(300, 240), '255,200,90', .35 * bn * (.8 + .2 * Math.sin(t * 13)));
    const r = rng(Math.floor(t * 12) + 99); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,240,170,${.85 * bn})`; ctx.lineWidth = 3; ctx.lineJoin = 'miter';
    for (let k = 0; k < 9; k++) { const a = -Math.PI * (.08 + .84 * r()), d0 = WT * .6; let x = X0 + Math.cos(a) * d0, y = Y0 - 10 + Math.sin(a) * d0 * .7; ctx.beginPath(); ctx.moveTo(x, y); for (let s = 0; s < 4; s++) { x += Math.cos(a) * 32 + (r() - .5) * 34; y += Math.sin(a) * 26 + (r() - .5) * 30; ctx.lineTo(x, y); } ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
  // layer labels + callouts (screen space)
  const la = vis(t, T.tissue + .3, T.lab + .3, .5, .3);
  mono('EPIDERMIS', 70, sY(70, Y0 + 44) * zc + Y0 * (1 - zc), 14, 'rgba(255,230,220,.8)', la, 'left', 4);
  mono('DERMIS', 70, sY(70, Y0 + 180) * zc + Y0 * (1 - zc), 14, 'rgba(255,230,220,.8)', la, 'left', 4);
  const wy = Y0 + 110; callout(X0 + hw(wy) * .2, sY(X0, wy), O(300, 210), O(60, 170), 'OPEN WOUND', 'BROKEN SKIN', vis(t, TM.wound, LS(11) + .4, .8, .3), '#fff', O(1, 0));
  const ma = vis(t, TM.muc, LS(11) + .5, .5, .35);
  if (ma > 0) {
    const [ix, iy, ir] = O([300, 300, 130], [250, 480, 112]), rr = ir * E.oBack(clamp(ma * 1.3));
    ctx.save(); ctx.globalAlpha = ma; ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, rr, 0, TAU); ctx.clip();
    const bgc = ctx.createRadialGradient(ix, iy, 0, ix, iy, rr); bgc.addColorStop(0, '#e2a48e'); bgc.addColorStop(1, '#8c4a3c'); ctx.fillStyle = bgc; ctx.fillRect(ix - rr, iy - rr, rr * 2, rr * 2);
    ctx.beginPath(); ctx.moveTo(ix - rr * .8, iy); ctx.quadraticCurveTo(ix, iy - rr * .7, ix + rr * .8, iy); ctx.quadraticCurveTo(ix, iy + rr * .62, ix - rr * .8, iy); ctx.closePath(); ctx.fillStyle = '#fff4f2'; ctx.fill(); ctx.strokeStyle = '#6b2b22'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#ff8a8a'; ctx.beginPath(); ctx.ellipse(ix - rr * .72, iy + 2, rr * .1, rr * .08, 0, 0, TAU); ctx.fill();
    const ig = ctx.createRadialGradient(ix, iy, 2, ix, iy, rr * .3); ig.addColorStop(0, '#2a1608'); ig.addColorStop(1, '#7a4a20'); ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(ix, iy, rr * .3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#050302'; ctx.beginPath(); ctx.arc(ix, iy, rr * .13, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ix - rr * .08, iy - rr * .09, rr * .05, 0, TAU); ctx.fill();
    drawMol(MOLS[5], ix + rr * .45, iy - rr * .42, rr * .14, t);
    ctx.restore(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ix, iy, rr, 0, TAU); ctx.stroke(); ctx.restore();
    label('MUCOUS MEMBRANE', ix + O(160, 140), iy - 6, O(28, 26), '#fff', ma, 'left', 2);
    mono('EYES · NOSE · MOUTH', ix + O(162, 142), iy + 24, 14, 'rgba(255,220,210,.85)', ma, 'left', 4);
  }
  const ba = vis(t, TM.binds + .2, T.lab + .2, .6, .3), bm = TIS.mols[2], btx = X0 - Math.max(0, hw(bm.ty) - R * .7);
  callout(btx, sY(btx, bm.ty), O(-300, -150), O(80, 200), 'BINDS TO TISSUE', 'LOCKS ON INSTANTLY', ba, '#ffb3e2', O(-1, 0));
  const fl = .75 + .25 * Math.sin(t * 23) * Math.sin(t * 7);
  if (bn > 0) { ctx.save(); ctx.globalAlpha = bn * fl; ctx.shadowColor = 'rgba(255,120,20,.9)'; ctx.shadowBlur = 40; txt('BURNING', O(X0 - 470, 290), O(Y0 - 210, Y0 - 250), font(900, O(76, 60)), '#ffb340', 'center', 6); ctx.restore(); }
  const sa = P(t, TM.swell - .1, TM.swell + .3);
  if (sa > 0) {
    const sx = O(X0 + 470, 790), sy0 = O(Y0 - 210, Y0 - 250), sc = 1 + .04 * Math.sin(t * 7);
    ctx.save(); ctx.globalAlpha = sa; ctx.translate(sx, sy0); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(255,60,80,.8)'; ctx.shadowBlur = 30; txt('SWELLING', 0, 0, font(900, O(76, 60)), '#ff6a7a', 'center', 6); ctx.restore();
    ctx.save(); ctx.globalAlpha = sa; ctx.strokeStyle = '#ff9aa5'; ctx.fillStyle = '#ff9aa5'; ctx.lineWidth = 3;
    for (const dx of [-1, 1]) { const ax = X0 + dx * O(260, 200), ay = sY(ax, Y0) - 30; const up = 30 + 14 * Math.sin(t * 7); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - up); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax - 9, ay - up + 4); ctx.lineTo(ax, ay - up - 10); ctx.lineTo(ax + 9, ay - up + 4); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // pain meter
  const pa = vis(t, LS(11), T.lab + .2, .4, .3), pv = clamp(.15 * P(t, TM.binds, TM.binds + .6) + .85 * E.o3(P(t, TM.burn - .2, TM.burn + .9)));
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa;
    if (!V) { const bx = 1800, by0 = 200, bh = 480; txt('PAIN', bx + 13, by0 - 22, font(700, 16, F.m), '#ffd28a', 'center', 4); ctx.fillStyle = 'rgba(255,255,255,.1)'; rrect(bx, by0, 26, bh, 13); ctx.fill(); const g = ctx.createLinearGradient(0, by0 + bh, 0, by0); g.addColorStop(0, '#ffd23f'); g.addColorStop(1, '#ff2a2a'); ctx.fillStyle = g; rrect(bx, by0 + bh * (1 - pv), 26, Math.max(26, bh * pv), 13); ctx.fill(); if (pv > .9) txt('MAX', bx + 13, by0 + bh + 36, font(800, 20, F.m), '#ff4a4a', 'center', 3); }
    else { const bx = 580, by0 = 300, bw = 420; txt('PAIN SIGNAL', bx, by0 - 16, font(700, 15, F.m), '#ffd28a', 'left', 4); ctx.fillStyle = 'rgba(255,255,255,.1)'; rrect(bx, by0, bw, 24, 12); ctx.fill(); const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, '#ffd23f'); g.addColorStop(1, '#ff2a2a'); ctx.fillStyle = g; rrect(bx, by0, Math.max(24, bw * pv), 24, 12); ctx.fill(); if (pv > .9) txt('MAX', bx + bw, by0 - 16, font(800, 18, F.m), '#ff4a4a', 'right', 3); }
    ctx.restore();
  }
  note('SCHEMATIC · NOT TO SCALE', vis(t, T.tissue + .4, T.lab + .2, .5, .3));
}

// ============================================================ SCENE 7 · the weakness
function labBg(t, warm) {
  const c0 = mixA(hx('#0b1a2e'), hx('#3a1406'), warm), c1 = mixA(hx('#02050b'), hx('#0c0302'), warm);
  const g = ctx.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .45, Math.max(W, H) * .8); g.addColorStop(0, rgba(c0)); g.addColorStop(1, rgba(c1)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = warm > .1 ? `rgba(255,150,80,${.06 + .03 * warm})` : 'rgba(95,212,255,.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); for (let x = (W / 2) % 80; x < W; x += 80) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = (H / 2) % 80; y < H; y += 80) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
}
function thermo(x, y0, y1, val, a) {
  if (a <= 0) return; const lo = 20, hi = 80, yv = v => lerp(y1, y0, (v - lo) / (hi - lo));
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,255,255,.08)'; rrect(x - 18, y0 - 18, 36, y1 - y0 + 36, 18); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y1 + 40, 34, 0, TAU); ctx.fillStyle = '#ff4a1a'; ctx.fill(); ctx.stroke();
  const g = ctx.createLinearGradient(0, y1, 0, y0); g.addColorStop(0, '#ff4a1a'); g.addColorStop(1, '#ffd23f'); ctx.fillStyle = g; const lv = yv(val); rrect(x - 9, lv, 18, y1 + 30 - lv, 9); ctx.fill();
  glow(x, y1 + 40, 90, HEATc, .35);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; for (let v = 20; v <= 80; v += 10) { const yy = yv(v); ctx.beginPath(); ctx.moveTo(x + 22, yy); ctx.lineTo(x + (v % 20 ? 30 : 38), yy); ctx.stroke(); }
  const ty = yv(60); ctx.setLineDash([8, 6]); ctx.strokeStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - 50, ty); ctx.lineTo(x + 70, ty); ctx.stroke(); ctx.setLineDash([]);
  txt('60 °C', x + 80, ty + 7, font(800, 22, F.m), '#ffd23f', 'left', 2);
  txt(Math.round(val) + '°', x, y0 - 40, font(900, O(56, 50)), '#fff', 'center', 0);
  ctx.restore();
}
function timerRing(x, y, r, p, a, t) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#ffb340'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); ctx.stroke();
  for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k / 5 * TAU; ctx.fillStyle = k / 5 <= p ? '#ffd28a' : 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(x + Math.cos(an) * (r + 24), y + Math.sin(an) * (r + 24), 4, 0, TAU); ctx.fill(); }
  const s = 300 * clamp(p); txt('0' + Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'), x, y + 14, font(800, O(44, 38), F.m), '#fff', 'center', 0);
  txt('MINUTES', x, y + 44, font(600, 13, F.m), 'rgba(255,220,180,.7)', 'center', 4);
  txt(p >= 1 ? 'TIME REACHED' : 'HOLD', x, y + r + 58, font(700, 15, F.m), p >= 1 ? K.safe : '#ffd28a', 'center', 4);
  ctx.restore();
}
function sceneLab(t) {
  const warm = .85 * E.o3(P(t, TM.heat - .05, TM.heat + .5));
  labBg(t, warm);
  if (warm > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const e of LAB.emb) { const y = ((e.y - (t - TM.heat) * 120 * e.v) % H + H) % H, x = e.x + 30 * Math.sin(t * e.v + e.p); ctx.fillStyle = `rgba(255,${150 + e.v * 60 | 0},60,${.6 * warm * e.v})`; ctx.fillRect(x, y, e.s, e.s * 2); } ctx.restore(); }
  const [mx, my, R] = O([960, 470, 120], [540, 900, 110]);
  const heatJ = P(t, LS(14), TM.unr) * 1.4 + warm * .3, unf = E.io(P(t, TM.unr, TM.unr + .9)), brk = P(t, TM.brk, TM.brk + 1.7), dead = E.o3(P(t, LS(14) + .4, TM.unr + .6));
  const enter = E.o3(P(t, T.lab - .3, T.lab + .9));
  drawMol(HERO, mx, my + 30 * (1 - enter), R * (.6 + .4 * enter), t, { heat: heatJ * (1 - unf), unf, brk, dead, ul: O(7, 6.2), a: enter * (1 - P(t, TM.brk + .9, TM.brk + 1.9)) });
  if (heatJ > 0 && unf < 1) glow(mx, my, R * 3, HEATc, .3 * Math.min(1, heatJ));
  const sub = t < TM.heat ? 'ARMED' : t < TM.unr ? 'HEATING' : t < TM.brk ? 'UNFOLDING' : 'DESTROYED', rcol = t < TM.brk ? (t < TM.heat ? K.tox : '#ffb340') : K.safe;
  reticle(mx, my, R * 1.45, t, 'TOXIN #001', sub, vis(t, T.lab + .2, TM.brk + 1.1, .5, .4), rcol);
  // threat profile panel
  const pa = vis(t, T.lab + .3, TM.heat + .5, .5, .4);
  if (pa > 0) {
    const [px, py, pw, ph] = O([100, 160, 560, 300], [70, 260, 940, 290]);
    hudPanel(px, py, pw, ph, 'THREAT PROFILE · TOXIN #001', pa, K.tox);
    const rows = [['TYPE', 'PROTEIN'], ['SOURCE', 'EEL BLOOD SERUM'], ['ROUTE', 'SURFACE CONTACT'], ['EFFECT', 'BURNING · SWELLING'], ['WEAKNESS', '']];
    ctx.save(); ctx.globalAlpha = pa;
    rows.forEach(([k, v], i) => {
      const ti = LS(12) + .1 + i * .32, p = P(t, ti, ti + .3), y = py + 76 + i * O(44, 42); if (p <= 0) return;
      txt(k, px + 26, y, font(600, 16, F.m), 'rgba(220,240,255,.6)', 'left', 3);
      if (i < 4) txt(typed(v, p * 1.4), px + O(190, 230), y, font(700, 19, F.m), '#fff', 'left', 3);
      else {
        const sc = P(t, TM.weak - .5, TM.heat);
        if (t < TM.heat) { bar(px + O(190, 230), y - 14, O(250, 380), 14, sc, '#ffb340'); txt(sc > 0 ? 'SCANNING' : '', px + O(190, 230) + O(262, 392), y, font(700, 15, F.m), 'rgba(255,210,140,' + (Math.floor(t * 4) % 2 ? 1 : .4) + ')', 'left', 3); }
        else txt('HEAT', px + O(190, 230), y, font(900, 22, F.m), '#ffb340', 'left', 4);
      }
    });
    ctx.restore();
  }
  // HEAT slam
  const hp = P(t, TM.heat, TM.heat + .32), ha = hp > 0 ? clamp(hp * 3) * (1 - P(t, LS(14) + .1, LS(14) + .6)) : 0;
  if (ha > 0) {
    const s = lerp(2.4, 1, E.oBack(hp)), fs = O(300, 250);
    ctx.save(); ctx.globalAlpha = ha; ctx.translate(mx, my + fs * .35); ctx.scale(s, s);
    const g = ctx.createLinearGradient(0, -fs * .8, 0, 0); g.addColorStop(0, '#fff2a8'); g.addColorStop(.45, '#ffb340'); g.addColorStop(1, '#ff4a1a');
    ctx.shadowColor = 'rgba(255,110,20,.95)'; ctx.shadowBlur = 70; txt('HEAT', 0, 0, font(900, fs), g, 'center', 16); ctx.shadowBlur = 0;
    ctx.restore();
  }
  // 60 °C for 5 minutes
  const ga = vis(t, LS(14) - .15, TM.unr + .7, .4, .5);
  const tv = lerp(20, 60, E.io(P(t, LS(14), TM.deg + .3))) + 2 * P(t, TM.deg + .3, TM.unr);
  if (!V) thermo(330, 250, 680, tv, ga); else thermo(150, 640, 1170, tv, ga);
  const tp = E.io2(P(t, TM.five - .1, LS(15) + .9));
  timerRing(O(1610, 905), O(460, 880), O(110, 82), tp, ga, t);
  mono('TIMELAPSE · SIMULATION', W / 2, O(150, 290), 14, 'rgba(255,214,170,.75)', vis(t, LS(14), T.fish, .4, .3), 'center', 5);
  stamp(t, TM.apart, mx, O(780, 1290), 'DENATURED', '#7dffb0', -.06, O(60, 54));
  note('SCHEMATIC · NOT TO SCALE', vis(t, T.lab + .3, T.fish, .5, .3));
}

// ============================================================ SCENE 8 · the whole fish
function scenePain(t) {
  labBg(t, .25 * (1 - P(t, TM.multi, TM.multi + .8)));
  const o = FISH.o, enter = E.o3(P(t, T.fish - .2, T.fish + .6)), go = P(t, TM.multi, TM.multi + .3);
  const [dx, dy, dr] = O([700, 450, 70], [540, 600, 64]);
  const da = enter * (1 - go * .9);
  if (da > 0) {
    drawDrop(dx, dy + dr * .6, dr * (1 - go * .5), da, 1.05);
    label('1 RAW DROP', dx, O(dy + 170, dy - 220), O(34, 32), '#fff', da, 'center', 3);
    const pp = P(t, TM.pain - .45, TM.pain + .1);
    if (pp > 0) {
      const [bx, by] = O([1240, 450], [540, 1000]);
      ctx.save(); ctx.globalAlpha = pp * da; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 4;
      if (!V) arrow1(dx + 120, dy + 40, lerp(dx + 120, bx - 140, E.o3(pp)), dy + 40, 18); else arrow1(dx, dy + 160, dx, lerp(dy + 160, by - 140, E.o3(pp)), 18);
      ctx.restore();
      const bs = E.oBack(P(t, TM.pain - .15, TM.pain + .25)) * (1 + .05 * Math.sin(t * 18)), r = rng(Math.floor(t * 10));
      ctx.save(); ctx.globalAlpha = da * clamp(pp * 2); ctx.translate(bx, by + 40); ctx.scale(bs, bs);
      ctx.beginPath(); for (let k = 0; k < 24; k++) { const a = k / 24 * TAU, rr = k % 2 ? 54 : 104 + 14 * r(); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 110); g.addColorStop(0, '#fff3b0'); g.addColorStop(.5, '#ffb340'); g.addColorStop(1, '#ff3d3d'); ctx.fillStyle = g; ctx.shadowColor = 'rgba(255,90,40,.9)'; ctx.shadowBlur = 40; ctx.fill();
      ctx.restore();
      label('EXTREME PAIN', bx, by + O(210, 200), O(34, 32), '#ffd28a', da * P(t, TM.pain, TM.pain + .3), 'center', 3);
    }
  }
  // drops multiply into the whole fish
  if (t > TM.multi) {
    const hz = P(t, TM.hazard, TM.hazard + .4), g = FISH.g;
    if (hz > 0) { ctx.save(); ctx.globalAlpha = hz; eelBody(g, o); ctx.fillStyle = 'rgba(200,20,45,.18)'; ctx.fill(); ctx.shadowColor = 'rgba(255,40,60,.9)'; ctx.shadowBlur = 24; ctx.strokeStyle = '#ff4a5e'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    for (const d of FISH.drops) {
      const t0 = TM.multi + d.u * .75 + d.d * .25, p = E.io(P(t, t0, t0 + .7)); if (p <= 0) continue;
      const x = lerp(dx, d.x, p), y = lerp(dy, d.y, p) - Math.sin(p * Math.PI) * O(160, 140) * (1 - d.u * .5) + (p >= 1 ? 3 * Math.sin(t * 3 + d.u * 12) : 0);
      drawDrop(x, y, 6.5 * d.s, clamp(p * 3), 1);
    }
    if (hz > 0) {
      const [bx0, by0, bx1, by1] = O([220, 330, 1700, 620], [50, 730, 1030, 990]);
      ctx.save(); ctx.globalAlpha = hz; ctx.lineWidth = 4; ctx.strokeStyle = '#ffd23f'; const L = 40;
      for (const [x, y, sx, sy] of [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx1, by1, -1, -1], [bx0, by1, 1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); }
      for (const yy of [by0 - 26, by1 + 8]) { ctx.save(); ctx.beginPath(); ctx.rect(bx0 + 60, yy, (bx1 - bx0 - 120) * E.o3(hz), 18); ctx.clip(); ctx.fillStyle = '#ffd23f'; ctx.fillRect(bx0, yy, bx1 - bx0, 18); ctx.fillStyle = '#111'; for (let x = bx0 - 40; x < bx1 + 40; x += 36) { ctx.beginPath(); ctx.moveTo(x + (t * 40) % 36, yy + 18); ctx.lineTo(x + 18 + (t * 40) % 36, yy); ctx.lineTo(x + 36 + (t * 40) % 36, yy); ctx.lineTo(x + 18 + (t * 40) % 36, yy + 18); ctx.closePath(); ctx.fill(); } ctx.restore(); }
      ctx.restore();
      const ly = O(by0 - 70, by0 - 80), blink = Math.floor(t * 3) % 2 ? 1 : .6;
      hazardSign(W / 2 - O(250, 230), ly - 14, 50, '#ffd23f', hz * blink);
      label('PASSIVE HAZARD', W / 2 + 30, ly, O(48, 42), '#fff', hz, 'center', 4);
      mono('TOXIN IN EVERY DROP OF ITS BLOOD', W / 2, O(by1 + 80, by1 + 76), O(17, 15), '#ffc0c8', P(t, TM.hazard + .3, TM.hazard + .7), 'center', 4);
    }
  }
}

// ============================================================ SCENE 9 · the grill
function sceneGrill(t) {
  const FL = O(1060, 860), FH = O(190, 170), fx = W / 2, fy0 = O(600, 1000), by0 = O(420, 740), by1 = O(880, 1300);
  const land = P(t, LS(18) - .15, TM.land), fy = fy0 - O(760, 1000) * (1 - E.i2(land)) - (land >= 1 ? 14 * Math.sin(P(t, TM.land, TM.land + .35) * Math.PI) * (1 - P(t, TM.land, TM.land + .35)) : 0);
  const c = E.io(P(t, TM.land, TM.safe + .3)), heat = .75 + .25 * noise(t * 3);
  // coals
  ctx.fillStyle = '#0a0302'; ctx.fillRect(0, 0, W, H);
  const cg = ctx.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, '#120604'); cg.addColorStop(.35, '#2a0a03'); cg.addColorStop(1, '#4a1404'); ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
  for (const k of GR.coals) { const fl = .55 + .45 * Math.sin(t * (1.5 + k.b) + k.p); ctx.fillStyle = `rgba(${40 + 30 * k.b | 0},${12 + 8 * k.b | 0},6,1)`; ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU); ctx.fill(); glow(k.x, k.y, k.r * 1.6, '255,90,20', .22 * fl * heat); }
  glow(W / 2, O(760, 1150), O(1100, 900), HEATc, .3 * heat);
  // flames
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 26; k++) {
    const bx = (k + .5) / 26 * W + 40 * Math.sin(k * 7.3), base = O(900, 1330) - 70 * NP[k * 3], h0 = O(250, 280) * (.4 + .6 * (.5 + .5 * noise(t * 2.2 + k * 3))) * (.6 + .4 * NP[k * 5]);
    for (const [wd, hf, c0, c1] of [[60, 1, '255,60,20,.28', '255,40,10,0'], [40, .78, '255,130,40,.38', '255,90,20,0'], [20, .5, '255,235,150,.55', '255,190,80,0']]) {
      const h = h0 * hf, sw = 34 * noise(t * 3.1 + k * 1.7) * hf, g = ctx.createLinearGradient(0, base, 0, base - h); g.addColorStop(0, `rgba(${c0})`); g.addColorStop(1, `rgba(${c1})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx - wd, base); ctx.bezierCurveTo(bx - wd * 1.1, base - h * .5, bx + sw - wd * .2, base - h * .75, bx + sw, base - h); ctx.bezierCurveTo(bx + sw + wd * .35, base - h * .7, bx + wd * 1.1, base - h * .45, bx + wd, base); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
  // grate bars
  for (let y = by0; y <= by1; y += 42) {
    const g = ctx.createLinearGradient(0, y - 7, 0, y + 7); g.addColorStop(0, '#5b5f66'); g.addColorStop(.5, '#24272c'); g.addColorStop(1, '#ff7a2a'); ctx.fillStyle = g; rrect(-20, y - 7, W + 40, 14, 7); ctx.fill();
  }
  // embers
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const e of GR.emb) { const q = (e.p + (t - T.grill) * .3 * e.v) % 1, x = e.x + 40 * Math.sin(q * 6 + e.w), y = lerp(O(900, 1320), O(150, 300), q); ctx.fillStyle = `rgba(255,${170 + 60 * e.v | 0},80,${.8 * (1 - q)})`; ctx.fillRect(x, y, e.s, e.s); }
  ctx.restore();
  // fillet
  ctx.save(); ctx.translate(fx, fy);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20; filletPath(FL, FH); ctx.fillStyle = mixc('#5a6470', '#2a1206', c); ctx.fill(); ctx.restore();
  ctx.save(); ctx.scale(.98, .86); filletPath(FL, FH);
  const raw = ['#f3e4de', '#d8bdb5'], ck = c < .55 ? [mixc(raw[0], '#e6a85a', c / .55), mixc(raw[1], '#b8732e', c / .55)] : [mixc('#e6a85a', '#a2501c', (c - .55) / .45), mixc('#b8732e', '#5c220a', (c - .55) / .45)];
  const fg = ctx.createLinearGradient(0, -FH / 2, 0, FH / 2); fg.addColorStop(0, ck[0]); fg.addColorStop(1, ck[1]); ctx.fillStyle = fg; ctx.fill(); ctx.clip();
  ctx.strokeStyle = `rgba(150,80,60,${.3 * (1 - c)})`; ctx.lineWidth = 2; for (let k = -10; k <= 10; k++) { ctx.beginPath(); ctx.moveTo(k * 52 - 16, -FH * .45); ctx.lineTo(k * 52 + 14, 0); ctx.lineTo(k * 52 - 16, FH * .45); ctx.stroke(); }
  for (let y = by0; y <= by1; y += 42) { const ly = y - fy; if (Math.abs(ly) > FH) continue; ctx.fillStyle = `rgba(30,8,0,${.65 * E.i2(c)})`; ctx.fillRect(-FL, ly - 6, FL * 2, 12); }
  if (c > .5) { ctx.strokeStyle = `rgba(255,220,150,${.45 * (c - .5) * 2})`; ctx.lineWidth = 5; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-FL * .4 + k * 60, -FH * .28 + k * 30); ctx.bezierCurveTo(-FL * .1, -FH * .38 + k * 30, FL * .2, -FH * .36 + k * 30, FL * .42, -FH * .26 + k * 30); ctx.stroke(); } }
  ctx.restore();
  for (const sx of [-.36, -.12, .12, .36]) { const x = sx * FL, sg = ctx.createLinearGradient(x - 6, 0, x + 6, 0); sg.addColorStop(0, mixc('#cfa868', '#6a4420', c)); sg.addColorStop(1, mixc('#f0d49a', '#9a6a34', c)); ctx.fillStyle = sg; ctx.fillRect(x - 6, -FH / 2 - 70, 12, FH + 140); ctx.fillStyle = `rgba(20,8,0,${.8 * c})`; ctx.fillRect(x - 6, FH / 2 + 50, 12, 20); }
  // toxin scan dots
  const scan = vis(t, TM.land + .1, TM.pop1 + 1.4, .5, .5);
  if (scan > 0) {
    const sx2 = ((t - TM.land) * .6 % 1 - .5) * FL; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(sx2 - 60, 0, sx2 + 60, 0); lg.addColorStop(0, 'rgba(255,61,172,0)'); lg.addColorStop(.5, `rgba(255,61,172,${.35 * scan})`); lg.addColorStop(1, 'rgba(255,61,172,0)'); ctx.fillStyle = lg; ctx.fillRect(sx2 - 60, -FH / 2, 120, FH); ctx.restore();
    for (const d of GR.dots) {
      const tp = lerp(TM.pop0, TM.pop1, d.k), pp = P(t, tp, tp + .3); if (pp >= 1) continue;
      const s = 1 + 1.4 * E.o3(pp), al = scan * (1 - pp);
      glow(d.x, d.y, 26 * s, TOXc, .55 * al);
      ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = pp > 0 ? '#fff' : '#ff6ac0'; ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t + d.p, rr = (k % 2 ? 3 : 8) * s; ctx.lineTo(d.x + Math.cos(a) * rr, d.y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore();
      if (pp > 0) for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + d.p, dd = 30 * E.o3(pp); ctx.fillStyle = `rgba(255,220,240,${1 - pp})`; ctx.fillRect(d.x + Math.cos(a) * dd - 1.5, d.y + Math.sin(a) * dd - 1.5, 3, 3); }
    }
  }
  const hp = P(t, TM.pop1 + .25, TM.pop1 + .6);
  if (scan > 0 && hp < 1) { glow(0, 0, 40 * (1 + hp), TOXc, .8 * (1 - hp)); drawMol(HERO, 0, 0, 18 * (1 + hp * .8), t, { a: 1 - hp, heat: 1 }); }
  ctx.restore();
  // smoke
  for (const s of GR.smoke) { const q = (s.p + (t - T.grill) * .35) % 1, x = fx + s.x + 60 * Math.sin(q * 4 + s.w), y = fy - FH * .4 - q * O(420, 520); glow(x, y, 70 * s.s * (1 + q), '255,235,220', .12 * c * Math.sin(q * Math.PI)); }
  // overlays
  reticle(fx, fy, 40, t, 'TOXIN #001', hp > 0 ? 'DESTROYED' : 'IN THE FILLET', vis(t, TM.land + .4, TM.pop1 + 1.2, .4, .4), hp > 0 ? K.safe : K.tox);
  const pa = vis(t, TM.land + .2, T.end + .3, .5, .3);
  if (pa > 0) {
    const L1 = O([110, 136, 380], [60, 250, 460]), R1 = O([W - 490, 136, 380], [560, 250, 460]);
    hudPanel(L1[0], L1[1], L1[2], 150, 'CORE TEMPERATURE', pa, C.amber);
    const tv = lerp(18, 62, E.io2(P(t, TM.land, TM.pop1 + .25))) + 12 * P(t, TM.pop1 + .25, TM.safe + .6);
    ctx.save(); ctx.globalAlpha = pa; txt(Math.round(tv) + ' °C', L1[0] + 26, L1[1] + 110, font(900, 50), '#fff', 'left', 1);
    if (tv >= 60) { txt('PAST 60 °C', L1[0] + L1[2] - 24, L1[1] + 100, font(700, 15, F.m), K.safe, 'right', 3); check(L1[0] + L1[2] - 50, L1[1] + 72, 22, K.safe, P(tv, 60, 63)); }
    ctx.restore();
    hudPanel(R1[0], R1[1], R1[2], 150, 'TOXIN REMAINING', pa, K.tox);
    let popped = 0; for (const d of GR.dots) if (t > lerp(TM.pop0, TM.pop1, d.k) + .15) popped++; if (hp > .3) popped = GR.dots.length;
    const rem = Math.round(100 * (1 - popped / GR.dots.length));
    ctx.save(); ctx.globalAlpha = pa; txt(rem + '%', R1[0] + 26, R1[1] + 110, font(900, 50), rem ? '#ff8fd0' : K.safe, 'left', 1); bar(R1[0] + 26 + O(140, 150), R1[1] + 88, R1[2] - O(190, 200), 12, rem / 100, '#ff3dac'); ctx.restore();
  }
  stamp(t, TM.safe, W / 2, O(330, 620), 'SAFE TO EAT', '#7dffb0', -.06, O(72, 62));
  if (t > TM.safe) glow(W / 2, O(330, 620), O(500, 420), SAFEc, .18 * (1 - P(t, TM.safe + .2, TM.safe + 1.4)));
}

// ============================================================ SCENE 10 · end card
function sceneEnd(t) {
  drawCounter(t, true);
  const a = P(t, T.end + .2, T.end + .9), y = O(230, 300);
  ctx.save(); ctx.globalAlpha = a;
  txt('ICHTHYOHEMOTOXIN · DESTROYED BY HEAT', W / 2, y - O(64, 72), font(600, O(18, 15), F.m), 'rgba(255,214,170,.8)', 'center', O(7, 4));
  if (!V) txt('WHY EEL IS NEVER SERVED RAW', W / 2, y, font(900, 64), '#fff', 'center', 4);
  else { txt('WHY EEL IS NEVER', W / 2, y, font(900, 64), '#fff', 'center', 2); txt('SERVED RAW', W / 2, y + 76, font(900, 64), '#fff', 'center', 2); }
  ctx.fillStyle = K.safe; const lw = O(420, 320) * E.o3(P(t, T.end + .4, T.end + 1.1)); ctx.fillRect(W / 2 - lw / 2, y + O(30, 106), lw, 3);
  ctx.restore();
}

// ============================================================ assembly + sound events
ev('whoosh', T.eel - .1, T.hand, T.split, T.tissue, T.lab, T.fish, T.grill - .1, T.end);
ev('zoom', TM.zoom0, T.serum);
ev('pop', TM.inS + .2, TM.inT + .2, TM.inE + .2);
ev('check', TM.inS + .45, TM.inT + .45, TM.xE);
ev('stamp', TM.off, TM.inst, TM.apart, TM.safe);
ev('scan', TM.scan, TM.scan + 1.0);
for (let k = 0; k < 6; k++) ev('heart', TM.scan + .3 + k * .8);
ev('letters', TM.name, TM.name + .5);
ev('blip', TM.prot, TM.toxin, TM.name + .8, TM.single, TM.tiny, TM.hand2, TM.jag, TM.spk, TM.susp, TM.wound, TM.muc, TM.binds + .2);
ev('drip', TM.form + .4, TM.fall);
ev('splash', TM.hit);
for (let i = 0; i < 13; i++) ev('molpop', lerp(TM.jag + .15, TM.mols + .35, i / 12));
ev('gulp', TM.pill0, TM.pill1);
ev('impact', TM.touch);
for (let k = 0; k < 9; k++) ev('snap', TM.binds + k * .07);
ev('burn', TM.burn - .25, T.lab);
ev('swell', TM.swell - .3);
for (let i = 0; i < 5; i++) ev('type', LS(12) + .1 + i * .32);
ev('riser', TM.weak - .5, TM.heat);
ev('heat', TM.heat);
ev('tick', TM.five - .1, LS(15) + .9);
ev('thermo', LS(14), TM.deg + .3);
ev('unravel', TM.unr);
ev('shatter', TM.brk);
ev('pain', TM.pain - .15);
ev('multiply', TM.multi, TM.multi + 1.0);
ev('alarm', TM.hazard, TM.hazard + 1.6);
ev('land', TM.land);
ev('sizzle', TM.land, T.end + .4);
for (const d of GR.dots || []) ev('toxpop', lerp(TM.pop0, TM.pop1, d.k));
ev('final', TM.pop1 + .25);
ev('chime', TM.safe);
ev('endcard', T.end + .2);

window.FILM = {
  title: 'WHY EEL IS NEVER SERVED RAW',
  tag: 'EEL BLOOD · ICHTHYOHEMOTOXIN',
  hotLines: [11, 13, 14, 18],
  scenes: [
    { start: T.sushi, draw: sceneSushi }, { start: T.eel, draw: sceneEel }, { start: T.hand, draw: sceneHand }, { start: T.serum, draw: sceneSerum },
    { start: T.split, draw: sceneSplit }, { start: T.tissue, draw: sceneTissue }, { start: T.lab, draw: sceneLab }, { start: T.fish, draw: scenePain },
    { start: T.grill, draw: sceneGrill }, { start: T.end, draw: sceneEnd },
  ],
  xfades: [[T.hand, .7], [T.split, .5], [T.tissue, .6], [T.lab, .7], [T.fish, .5], [T.end, .7]],
  chapters: [[0, '01', 'THE RULE'], [T.hand - .35, '02', 'THE DROP'], [T.split, '03', 'THE ATTACK'], [T.lab, '04', 'THE WEAKNESS'], [T.fish, '05', 'THE GRILL']],
  hits: [[TM.hit, 6, .3], [TM.touch, 10, .35], [TM.burn, 9, .8], [TM.heat, 16, .6], [TM.brk, 6, .4], [TM.land, 10, .4], [TM.safe, 6, .3]],
  flashes: [[T.eel, .35], [TM.hit, .2], [T.serum, .45], [TM.touch, .18], [TM.heat, .4], [T.grill, .3], [TM.safe, .25]],
  init() { init(); for (const d of GR.dots) ev('toxpop', lerp(TM.pop0, TM.pop1, d.k)); window.EVENTS = EV; },
  get events() { return EV; },
};
