// usage: node msbatch_trace.cjs <src.png RGBA> <mode green|dark> <outPrefix> [sigma] [eps]
// Traces the logo (soft weight field -> gaussian -> marching squares iso .5 -> RDP) in source pixel coords.
// Writes <outPrefix>.path.txt, <outPrefix>.meta.json and <outPrefix>.compare.html (original | path | overlay).
const fs = require('fs'), zlib = require('zlib');
const [src, mode, out, sigArg, epsArg] = process.argv.slice(2);
function decodePNG(buf) {
  let p = 8, w, h, bd, ct, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.slice(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; if (d[12]) throw 'interlaced'; }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : (() => { throw 'unsupported ct ' + ct; })();
  if (bd !== 8) throw 'bitdepth';
  const raw = zlib.inflateSync(Buffer.concat(idat)), st = w * bpp, px = Buffer.alloc(w * h * bpp);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], r = y * (st + 1) + 1;
    for (let x = 0; x < st; x++) {
      const a = x >= bpp ? px[y * st + x - bpp] : 0, b = y ? px[(y - 1) * st + x] : 0, c = (x >= bpp && y) ? px[(y - 1) * st + x - bpp] : 0;
      let v = raw[r + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      px[y * st + x] = v & 255;
    }
  }
  const data = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) { for (let k = 0; k < 3; k++) data[i * 4 + k] = px[i * bpp + k]; data[i * 4 + 3] = bpp === 4 ? px[i * bpp + 3] : 255; }
  return { w, h, data };
}
const { w, h, data } = decodePNG(fs.readFileSync(src));
const clamp = (v) => Math.max(0, Math.min(1, v));
const A = new Float32Array(w * h);
let minx = w, miny = h, maxx = 0, maxy = 0;
for (let i = 0; i < w * h; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3] / 255;
  let v;
  if (mode === 'green') v = clamp((g - r - 15) / 140);
  else v = clamp((235 - (0.3 * r + 0.59 * g + 0.11 * b)) / 190);
  A[i] = v * a;
  if (A[i] > 0.3) { const x = i % w, y = (i / w) | 0; minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
}
const SIG = +(sigArg || 1.2), W = w, H = h;
let U = Float32Array.from(A);
const R0 = Math.ceil(SIG * 3), K = []; let ks = 0;
for (let i = -R0; i <= R0; i++) { K.push(Math.exp(-i * i / (2 * SIG * SIG))); ks += K[K.length - 1]; }
K.forEach((v, i) => K[i] = v / ks);
const T2 = new Float32Array(W * H);
for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) { let v = 0; for (let i = -R0; i <= R0; i++) { const xx = X + i; if (xx >= 0 && xx < W) v += U[Y * W + xx] * K[i + R0]; } T2[Y * W + X] = v; }
for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) { let v = 0; for (let i = -R0; i <= R0; i++) { const yy = Y + i; if (yy >= 0 && yy < H) v += T2[yy * W + X] * K[i + R0]; } U[Y * W + X] = v; }
const iso = 0.5, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : U[y * W + x];
const key = (p) => p[0].toFixed(4) + ',' + p[1].toFixed(4);
const lerp = (x0, y0, v0, x1, y1, v1) => { const t = (iso - v0) / (v1 - v0); return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]; };
const segList = [];
for (let y = miny - 12; y <= maxy + 12; y++) for (let x = minx - 12; x <= maxx + 12; x++) {
  const tl = at(x, y), tr = at(x + 1, y), br = at(x + 1, y + 1), bl = at(x, y + 1);
  const idx = (tl >= iso ? 8 : 0) | (tr >= iso ? 4 : 0) | (br >= iso ? 2 : 0) | (bl >= iso ? 1 : 0);
  if (idx === 0 || idx === 15) continue;
  const T = () => lerp(x, y, tl, x + 1, y, tr), R = () => lerp(x + 1, y, tr, x + 1, y + 1, br),
    B = () => lerp(x, y + 1, bl, x + 1, y + 1, br), L = () => lerp(x, y, tl, x, y + 1, bl);
  const add = (a, b) => segList.push([a, b]);
  switch (idx) {
    case 1: add(B(), L()); break; case 2: add(R(), B()); break; case 3: add(R(), L()); break;
    case 4: add(T(), R()); break; case 5: { const c = (tl + tr + br + bl) / 4; if (c >= iso) { add(T(), L()); add(B(), R()); } else { add(T(), R()); add(B(), L()); } break; }
    case 6: add(T(), B()); break; case 7: add(T(), L()); break; case 8: add(L(), T()); break;
    case 9: add(B(), T()); break; case 10: { const c = (tl + tr + br + bl) / 4; if (c >= iso) { add(R(), T()); add(L(), B()); } else { add(L(), T()); add(R(), B()); } break; }
    case 11: add(R(), T()); break; case 12: add(L(), R()); break; case 13: add(B(), R()); break; case 14: add(L(), B()); break;
  }
}
const segs = new Map();
for (const s of segList) segs.set(key(s[0]), s);
const loops = [];
while (segs.size) {
  const [k0, s0] = segs.entries().next().value; segs.delete(k0);
  const loop = [s0[0]]; let cur = s0[1];
  while (true) { const k = key(cur); if (k === k0) break; const n = segs.get(k); if (!n) break; segs.delete(k); loop.push(cur); cur = n[1]; }
  loops.push(loop.map(p => [p[0] + 0.5, p[1] + 0.5]));
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0; const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > dmax) { dmax = d; idx = i; } }
  if (dmax > eps) return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
  return [pts[0], pts[pts.length - 1]];
}
const area = (l) => l.reduce((s, p, i) => { const q = l[(i + 1) % l.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const big = loops.filter(l => Math.abs(area(l)) > 60);
const EPS = +(epsArg || 0.6);
let d = '';
for (const l of big) {
  let far = 0, fd = 0; l.forEach((p, i) => { const dd = Math.hypot(p[0] - l[0][0], p[1] - l[0][1]); if (dd > fd) { fd = dd; far = i; } });
  const s = rdp(l.slice(0, far + 1), EPS).slice(0, -1).concat(rdp(l.slice(far).concat([l[0]]), EPS).slice(0, -1));
  d += 'M' + s.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}
const meta = { w, h, minx, miny, maxx: maxx + 1, maxy: maxy + 1, cx: (minx + maxx + 1) / 2, cy: (miny + maxy + 1) / 2, loops: big.length, pathLen: d.length };
fs.writeFileSync(out + '.path.txt', d);
fs.writeFileSync(out + '.meta.json', JSON.stringify(meta, null, 1));
const b64 = fs.readFileSync(src).toString('base64'), pad = 40;
const vb = `viewBox="${minx - pad} ${miny - pad} ${maxx - minx + 2 * pad} ${maxy - miny + 2 * pad}"`, P = 400, PH = Math.round(P * (maxy - miny + 2 * pad) / (maxx - minx + 2 * pad));
const img = (x) => `<svg x="${x}" y="30" width="${P}" height="${PH}" ${vb}><image href="data:image/png;base64,${b64}" width="${w}" height="${h}"/></svg>`;
const pth = (x, extra) => `<svg x="${x}" y="30" width="${P}" height="${PH}" ${vb}><path d="${d}" fill-rule="nonzero" ${extra}/></svg>`;
const Lb = (x, t) => `<text x="${x}" y="20" font-family="Segoe UI" font-size="16">${t}</text>`;
const cmp = `<!doctype html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${3 * P + 40}" height="${PH + 40}"><rect width="100%" height="100%" fill="#fff"/>
${Lb(10, 'original (phone-icons)')}${Lb(P + 30, 'traced vector')}${Lb(2 * P + 50, 'overlay: original + outline (magenta)')}
${img(0)}${pth(P + 20, 'fill="#222"')}${img(2 * P + 40)}${pth(2 * P + 40, 'fill="none" stroke="#FF00C8" stroke-width="2"')}</svg></body>`;
fs.writeFileSync(out + '.compare.html', cmp);
console.log(JSON.stringify(meta), 'size', 3 * P + 40, PH + 40);
