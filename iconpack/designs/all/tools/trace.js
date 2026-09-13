const fs = require('fs'), zlib = require('zlib');
const S = __dirname;
function decodePNG(buf) {
  let p = 8, w, h, bd, ct, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.slice(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); bd = d[8]; ct = d[9]; if (d[12]) throw 'interlaced'; }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  if (bd !== 8 || ct !== 6) throw 'unsupported ' + bd + ' ' + ct;
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, st = w * bpp, out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], r = y * (st + 1) + 1;
    for (let x = 0; x < st; x++) {
      const a = x >= bpp ? out[y * st + x - bpp] : 0, b = y ? out[(y - 1) * st + x] : 0, c = (x >= bpp && y) ? out[(y - 1) * st + x - bpp] : 0;
      let v = raw[r + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      out[y * st + x] = v & 255;
    }
  }
  return { w, h, data: out };
}
const img = decodePNG(fs.readFileSync(S + '/src1.png'));
const { w, h, data } = img;
// alpha field weighted by "redness" (in case of non-red pixels)
const A = new Float32Array(w * h);
let minx = w, miny = h, maxx = 0, maxy = 0, colors = {};
for (let i = 0; i < w * h; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
  const red = r > 150 && r - g > 90;
  A[i] = red ? a / 255 : 0;
  if (a > 200) { const k = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5); colors[k] = (colors[k] || 0) + 1; }
  if (A[i] > 0.02) { const x = i % w, y = (i / w) | 0; minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
}
console.log('colors', Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 5));
console.log('bbox', minx, miny, maxx, maxy);

const F=4, SIG=+(process.env.SIG||0.8)*F, W=w*F, H=h*F;
let U=new Float32Array(W*H);
for(let Y=0;Y<H;Y++){const sy=(Y+0.5)/F-0.5,y0=Math.floor(sy),fy=sy-y0;for(let X=0;X<W;X++){const sx=(X+0.5)/F-0.5,x0=Math.floor(sx),fx=sx-x0;
 const g=(x,y)=>(x<0||y<0||x>=w||y>=h)?0:A[y*w+x];
 U[Y*W+X]=(g(x0,y0)*(1-fx)+g(x0+1,y0)*fx)*(1-fy)+(g(x0,y0+1)*(1-fx)+g(x0+1,y0+1)*fx)*fy;}}
const R=Math.ceil(SIG*3),K=[];let ks=0;for(let i=-R;i<=R;i++){K.push(Math.exp(-i*i/(2*SIG*SIG)));ks+=K[K.length-1];}K.forEach((v,i)=>K[i]=v/ks);
let T2=new Float32Array(W*H);
for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){let v=0;for(let i=-R;i<=R;i++){const xx=X+i;if(xx>=0&&xx<W)v+=U[Y*W+xx]*K[i+R];}T2[Y*W+X]=v;}
for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){let v=0;for(let i=-R;i<=R;i++){const yy=Y+i;if(yy>=0&&yy<H)v+=T2[yy*W+X]*K[i+R];}U[Y*W+X]=v;}

// marching squares at iso 0.5
const iso = 0.5, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : U[y * W + x];
const segs = new Map(); // key start -> end (directed, inside on left)
const key = (p) => p[0].toFixed(4) + ',' + p[1].toFixed(4);
const lerp = (x0, y0, v0, x1, y1, v1) => { const t = (iso - v0) / (v1 - v0); return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]; };
const segList = [];
for (let y = miny*F - 16; y <= (maxy + 1)*F + 16; y++) for (let x = minx*F - 16; x <= (maxx + 1)*F + 16; x++) {
  const tl = at(x, y), tr = at(x + 1, y), br = at(x + 1, y + 1), bl = at(x, y + 1);
  const idx = (tl >= iso ? 8 : 0) | (tr >= iso ? 4 : 0) | (br >= iso ? 2 : 0) | (bl >= iso ? 1 : 0);
  if (idx === 0 || idx === 15) continue;
  const T = () => lerp(x, y, tl, x + 1, y, tr), R = () => lerp(x + 1, y, tr, x + 1, y + 1, br),
    B = () => lerp(x, y + 1, bl, x + 1, y + 1, br), L = () => lerp(x, y, tl, x, y + 1, bl);
  const add = (a, b) => segList.push([a, b]);
  // orientation: travel with inside on the right (screen coords) -> consistent
  switch (idx) {
    case 1: add(B(), L()); break; case 2: add(R(), B()); break; case 3: add(R(), L()); break;
    case 4: add(T(), R()); break; case 5: { const c = (tl + tr + br + bl) / 4; if (c >= iso) { add(T(), L()); add(B(), R()); } else { add(T(), R()); add(B(), L()); } break; }
    case 6: add(T(), B()); break; case 7: add(T(), L()); break; case 8: add(L(), T()); break;
    case 9: add(B(), T()); break; case 10: { const c = (tl + tr + br + bl) / 4; if (c >= iso) { add(R(), T()); add(L(), B()); } else { add(L(), T()); add(R(), B()); } break; }
    case 11: add(R(), T()); break; case 12: add(L(), R()); break; case 13: add(B(), R()); break; case 14: add(L(), B()); break;
  }
}
for (const s of segList) segs.set(key(s[0]), s);
const loops = [];
while (segs.size) {
  const [k0, s0] = segs.entries().next().value; segs.delete(k0);
  const loop = [s0[0]]; let cur = s0[1];
  while (true) { const k = key(cur); if (k === k0) break; const n = segs.get(k); if (!n) { console.log('open loop'); break; } segs.delete(k); loop.push(cur); cur = n[1]; }
  loops.push(loop.map(p=>[(p[0]+0.5)/F-0.5,(p[1]+0.5)/F-0.5]));
}
// RDP simplify on closed loops
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0; const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / L; if (d > dmax) { dmax = d; idx = i; } }
  if (dmax > eps) return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
  return [pts[0], pts[pts.length - 1]];
}
const area = (l) => l.reduce((s, p, i) => { const q = l[(i + 1) % l.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const big = loops.filter(l => Math.abs(area(l)) > 4);
console.log('loops', loops.length, 'kept', big.length, big.map(l => [l.length, area(l).toFixed(0)]));
// normalise: centre on bbox, height -> 122 units (matches old emblem -63..58)
const cx = (minx + maxx + 1) / 2, cy = (miny + maxy + 1) / 2, sc = 122 / (maxy + 1 - miny);
let d = '';
for (const l of big) {
  let far=0,fd=0;l.forEach((p,i)=>{const dd=Math.hypot(p[0]-l[0][0],p[1]-l[0][1]);if(dd>fd){fd=dd;far=i}});
  const s = rdp(l.slice(0,far+1),0.18).slice(0,-1).concat(rdp(l.slice(far).concat([l[0]]),0.18).slice(0,-1));
  d += 'M' + s.map(p => ((p[0] + 0.5 - cx) * sc).toFixed(2) + ' ' + ((p[1] + 0.5 - cy) * sc).toFixed(2)).join('L') + 'Z';
}
fs.writeFileSync(S + '/emblem-path.txt', d);
fs.writeFileSync(S + '/emblem-meta.json', JSON.stringify({ minx, miny, maxx, maxy, cx, cy, sc, w: (maxx + 1 - minx) * sc }));
console.log('path len', d.length, 'width units', ((maxx + 1 - minx) * sc).toFixed(1));
