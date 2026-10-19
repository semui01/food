// Motion-graphic engine core. render(t) must be a pure function of t (deterministic, no Math.random, no Date).
// Load order: timeline.js (window.TL, window.DUR from narrate.py) -> engine.js -> scenes.js (defines window.FILM).
// Orientation: ?v selects 9:16. Use O(landscapeValue, portraitValue) for every hard-coded position.
const V = new URLSearchParams(location.search).has('v');
const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
const O = (h, v) => V ? v : h;
const DUR = window.DUR || 60;
const TL = window.TL || [];
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');

// ---------------------------------------------------------------- math
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));                 // progress of t through [a, b]
const vis = (t, a, b, fi = .4, fo = .3) => P(t, a, a + fi) * (1 - P(t, b - fo, b)); // fade in at a, out at b
const E = {
  io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  io2: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  o3: t => 1 - Math.pow(1 - t, 3), i2: t => t * t, i3: t => t * t * t,
  oExp: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), iExp: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  oBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const NP = (() => { const r = rng(7), a = []; for (let i = 0; i < 1024; i++) a.push(r()); return a; })();
function noise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(NP[i & 1023], NP[(i + 1) & 1023], u) * 2 - 1; }
function fbm(x) { return noise(x) * .6 + noise(x * 2.1 + 17) * .3 + noise(x * 4.3 + 41) * .1; }

// ---------------------------------------------------------------- drawing helpers
const F = { d: '"Inter Display","Inter",sans-serif', m: '"DejaVu Sans Mono","Liberation Mono",monospace' };
const font = (w, s, fam = F.d) => `${w} ${s}px ${fam}`;
const C = { bg: '#040a14', cyan: '#5fd4ff', cyan2: '#9be7ff', white: '#eef7ff', amber: '#ffb340', hot: '#ff6a2b', red: '#ff3d3d', green: '#7dffb0' };
function txt(s, x, y, f, col, align = 'left', ls = 0, base = 'alphabetic') {
  ctx.font = f; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base;
  ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function arrow(x1, y1, x2, y2, head = 16) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  for (const [ax, ay, bx, by] of [[x1, y1, x2, y2], [x2, y2, x1, y1]]) { const a = Math.atan2(by - ay, bx - ax); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + Math.cos(a + .5) * head, ay + Math.sin(a + .5) * head); ctx.lineTo(ax + Math.cos(a - .5) * head, ay + Math.sin(a - .5) * head); ctx.closePath(); ctx.fill(); }
}
// Tracking brackets with a label: the "hero element" device (e.g. FLUSH #001).
function reticle(x, y, r, t, label, sub, a, col = C.amber) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  const rr = r * (1 + .5 * (1 - E.o3(clamp(a * 1.5)))); ctx.rotate(Math.sin(t * 1.5) * .08);
  ctx.strokeStyle = col; ctx.lineWidth = 3; const L = rr * .45;
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(sx * rr, sy * (rr - L)); ctx.lineTo(sx * rr, sy * rr); ctx.lineTo(sx * (rr - L), sy * rr); ctx.stroke(); }
  ctx.rotate(-Math.sin(t * 1.5) * .08);
  ctx.beginPath(); ctx.moveTo(rr + 6, -rr - 6); ctx.lineTo(rr + 34, -rr - 34); ctx.lineTo(rr + 60, -rr - 34); ctx.stroke();
  txt(label, rr + 66, -rr - 30, font(800, 24, F.m), col, 'left', 2);
  if (sub) { ctx.globalAlpha = a * (Math.floor(t * 3) % 2 ? 1 : .45); txt('● ' + sub, rr + 66, -rr - 4, font(500, 15, F.m), '#fff', 'left', 3); }
  ctx.restore();
}
// Leader-line label from a screen point. dir: 1 text right, -1 text left, 0 centred above/below the line end.
function callout(x, y, dx, dy, title, sub, a, col = '#fff', dir) {
  if (a <= 0) return;
  const ex = x + dx, ey = y + dy; dir = dir !== undefined ? dir : dx >= 0 ? 1 : -1;
  ctx.save(); ctx.globalAlpha = clamp(a * 2); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(0,10,25,.75)'; ctx.shadowBlur = 14;
  const lp = E.o3(clamp(a * 1.6));
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, ex, lp), lerp(y, ey, lp)); if (lp >= 1 && dir) ctx.lineTo(ex + dir * 40 * E.o3(clamp(a * 1.6 - 1)), ey); ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
  ctx.globalAlpha = clamp(a * 2 - .9);
  const shown = title.slice(0, Math.round(title.length * clamp(a * 1.8 - .8)));   // typewriter reveal
  if (dir === 0) { const up = dy < 0; txt(shown, ex, up ? ey - 40 : ey + 36, font(800, 28), col, 'center', 2); if (sub) txt(sub, ex, up ? ey - 14 : ey + 62, font(500, 16, F.m), 'rgba(230,242,255,.8)', 'center', 3); }
  else { const al = dir > 0 ? 'left' : 'right'; txt(shown, ex + dir * 52, ey + 8, font(800, 28), col, al, 2); if (sub) txt(sub, ex + dir * 52, ey + 36, font(500, 16, F.m), 'rgba(230,242,255,.8)', al, 3); }
  ctx.restore();
}
function hudPanel(x, y, w, h, title, a, col = C.cyan) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(4,12,24,.78)'; rrect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = col; ctx.globalAlpha = a * .6; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = a;
  ctx.fillStyle = col; ctx.fillRect(x + 22, y + 22, 8, 8); txt(title, x + 40, y + 31, font(700, 16, F.m), col, 'left', 4);
  ctx.restore();
}
function stamp(t, t0, x, y, label, col = C.red, rot = -.08, size = 64) {
  if (t < t0) return; const s = E.oBack(P(t, t0, t0 + .3)), a = P(t, t0, t0 + .1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lerp(2.4, 1, s), lerp(2.4, 1, s)); ctx.globalAlpha = a;
  ctx.font = font(900, size); ctx.letterSpacing = '4px'; const w = ctx.measureText(label).width + 60; ctx.letterSpacing = '0px';
  ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.strokeRect(-w / 2, -size * .8, w, size * 1.6); txt(label, 0, 4, font(900, size), col, 'center', 4, 'middle'); ctx.restore();
}

// ---------------------------------------------------------------- captions & timing
// Caption words get times proportional to length within each narration line (good enough for karaoke reveal).
const capWords = TL.map(l => {
  const ws = l.display.split(/\s+/).filter(Boolean).map(w => ({ hl: w.startsWith('*'), txt: w.replace(/\*/g, '') }));
  let tot = 0; ws.forEach(w => { w.wt = w.txt.length + 2.6; tot += w.wt; });
  let c = 0; ws.forEach(w => { w.t = l.s + (l.e - l.s) * c / tot; c += w.wt; }); return ws;
});
// wt(line, 'word') -> time the word starts. Sync every visual beat to a word, never to a hard-coded second.
function wt(li, str) { const w = capWords[li] && capWords[li].find(w => w.txt.toLowerCase().replace(/[^a-z0-9−°%$]/g, '').startsWith(str.toLowerCase())); return w ? w.t : (TL[li] ? TL[li].s : 0); }
const LS = i => TL[i] ? TL[i].s : 0;                        // line start
const LB = i => i === 0 ? 0 : LS(i) - .25;                  // natural scene boundary just before line i
function captions(t) {
  const FILM = window.FILM || {}; const hot = new Set(FILM.hotLines || []);
  const size = O(50, 54), maxW = O(1380, 940), lh = O(64, 70), bottom = O(92, 330); // portrait: clear of Reels/TikTok UI
  for (let i = 0; i < TL.length; i++) {
    const a0 = TL[i].s - .12, a1 = i < TL.length - 1 ? Math.min(TL[i + 1].s - .12, TL[i].e + .9) : TL[i].e + .5;
    if (t < a0 || t > a1) continue;
    const fade = P(t, a0, a0 + .1) * (1 - P(t, a1 - .2, a1));
    ctx.font = font(700, size); const sp = ctx.measureText(' ').width * 1.15;
    const lines = [[]]; let lw = 0;
    for (const w of capWords[i]) { ctx.font = font(w.hl ? 850 : 700, size); const ww = ctx.measureText(w.txt).width; // measure in the weight it is drawn in
      if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push({ w, ww }); lw += ww + sp; }
    const baseY = H - bottom - (lines.length - 1) * lh;
    const bg = ctx.createLinearGradient(0, baseY - 120, 0, H); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, `rgba(0,0,0,${.6 * fade})`);
    ctx.fillStyle = bg; ctx.fillRect(0, baseY - 120, W, H);
    lines.forEach((ln, li) => {
      const tot = ln.reduce((s, o) => s + o.ww, 0) + sp * (ln.length - 1); let x = W / 2 - tot / 2; const y = baseY + li * lh;
      for (const { w, ww } of ln) {
        const p = P(t, w.t - .06, w.t + .14), e = E.o3(p);
        ctx.save(); ctx.globalAlpha = fade * (.15 + .85 * p); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 16;
        txt(w.txt, x, y + 10 * (1 - e), font(w.hl ? 850 : 700, size), w.hl ? (hot.has(i) ? '#ffb340' : '#7fe0ff') : '#fff', 'left');
        ctx.restore(); x += ww + sp;
      }
    });
  }
}
function chapter(t) {
  const FILM = window.FILM || {}; const CH = FILM.chapters || []; if (!CH.length || t > DUR - 2.4) return;
  let i = 0; while (i < CH.length - 1 && t >= CH[i + 1][0]) i++;
  const [t0, n, name] = CH[i], p = P(t, t0 + .1, t0 + .7), CY = O(74, 170);
  ctx.save(); ctx.globalAlpha = P(t, .4, 1.0);
  txt('CH ' + n, 70, CY, font(700, 16, F.m), C.cyan, 'left', 4); ctx.fillStyle = C.cyan; ctx.fillRect(140, CY - 7, 40 * E.o3(p), 2);
  txt(name.slice(0, Math.round(name.length * p)), 194, CY + 1, font(800, 20), '#fff', 'left', 5);
  if (FILM.tag) txt(FILM.tag, O(W - 70, 70), O(74, 204), font(500, 15, F.m), 'rgba(220,240,255,.6)', O('right', 'left'), 3);
  ctx.restore();
}

// ---------------------------------------------------------------- finishing
let GRAIN = [], VIG, BUF, SH = { x: 0, y: 0 };
function initEngine() {
  for (let k = 0; k < 4; k++) { const c = mkCanvas(512, 512), g = c.getContext('2d'), id = g.createImageData(512, 512), r = rng(100 + k);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); GRAIN.push(c); }
  VIG = mkCanvas(W, H); { const g = VIG.getContext('2d'); const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.72)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
  BUF = mkCanvas(W, H);
}
function shake(t) {
  let a = 0; for (const [h, amp, d] of (window.FILM.hits || [])) if (t > h && t < h + d) a += amp * (1 - (t - h) / d);
  return { x: a * noise(t * 40), y: a * noise(t * 40 + 100) };
}
function finish(t) {
  for (const [h, d] of (window.FILM.flashes || [])) if (t > h - .04 && t < h + d) { ctx.fillStyle = `rgba(220,245,255,${.5 * (1 - (t - h) / d)})`; ctx.fillRect(0, 0, W, H); }
  { const g = ctx.createLinearGradient(0, 0, 0, O(170, 280)); g.addColorStop(0, 'rgba(0,6,14,.55)'); g.addColorStop(1, 'rgba(0,6,14,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, O(170, 280)); } // keeps top labels legible on bright scenes
  chapter(t); captions(t);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .08;
  const fi = Math.floor(t * 24), gi = GRAIN[fi % 4], ox = (fi * 137) % 512, oy = (fi * 251) % 512;
  for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) ctx.drawImage(gi, x, y);
  ctx.restore(); ctx.drawImage(VIG, 0, 0);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, H - 4, W, 4); ctx.fillStyle = C.cyan; ctx.fillRect(0, H - 4, W * t / DUR, 4);
  const f = Math.max(1 - P(t, 0, .6), P(t, DUR - .7, DUR)); if (f > 0) { ctx.fillStyle = `rgba(0,0,0,${f})`; ctx.fillRect(0, 0, W, H); }
}
// Scenes paint the full frame. FILM.scenes = [{start, draw(t)}] sorted by start; FILM.xfades = [[boundaryTime, duration], ...]
function sceneIdx(t) { const S = window.FILM.scenes; let i = 0; while (i < S.length - 1 && t >= S[i + 1].start) i++; return i; }
function render(t) {
  const FILM = window.FILM;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); SH = shake(t);
  const xf = (FILM.xfades || []).find(([b, d]) => t >= b - d / 2 && t < b + d / 2);
  ctx.save(); ctx.translate(SH.x, SH.y);
  if (xf) {
    const [b, d] = xf, u = P(t, b - d / 2, b + d / 2), i1 = sceneIdx(b + 1e-3), i0 = Math.max(0, i1 - 1);
    FILM.scenes[i0].draw(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); const g = BUF.getContext('2d'); g.clearRect(0, 0, W, H); g.drawImage(cv, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setTransform(1, 0, 0, 1, SH.x, SH.y);
    FILM.scenes[i1].draw(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - E.io2(u); ctx.drawImage(BUF, 0, 0); ctx.globalAlpha = 1;
  } else FILM.scenes[sceneIdx(t)].draw(t);
  ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  finish(t);
}
window.render = render;
window.ready = new Promise(r => document.readyState === 'complete' ? r() : addEventListener('load', r)) // scenes.js must be loaded
  .then(() => document.fonts.load(font(900, 100))).then(() => document.fonts.load(font(400, 20, F.m))).then(() => {
  initEngine(); if (window.FILM.init) window.FILM.init();
  window.EVENTS = window.FILM.events || {};
  const q = new URLSearchParams(location.search);
  if (q.has('play')) { const t0 = performance.now() - (+q.get('play') || 0) * 1000; (function f() { render(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(f); })(); }
  else if (q.has('t')) render(+q.get('t'));
});
