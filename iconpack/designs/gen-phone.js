const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'designs', 'douyin');
const src = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const grab = (n) => src.match(new RegExp(`const ${n} = '([^']+)'`))[1];
const RED = grab('RED'), CYAN = grab('CYAN'), CORE = grab('CORE');

// Portrait tile = bilibili spec tile transposed (x<->y). Matches com.xingin.xhs.png: x 23–233, y 2–252, no outer shadow.
const TILE = 'M47 2H209C227.8 2 233 7.2 233 26V228C233 246.8 227.8 252 209 252H47C28.2 252 23 246.8 23 228V26C23 7.2 28.2 2 47 2Z';

function rr(x, y, w, h, r) {
  const k = r * 0.22;
  return `M${x + r} ${y}H${x + w - r}C${x + w - k} ${y} ${x + w} ${y + k} ${x + w} ${y + r}V${y + h - r}C${x + w} ${y + h - k} ${x + w - k} ${y + h} ${x + w - r} ${y + h}H${x + r}C${x + k} ${y + h} ${x} ${y + h - k} ${x} ${y + h - r}V${y + r}C${x} ${y + k} ${x + k} ${y} ${x + r} ${y}Z`;
}

const HEART = 'M0 6C-9 -0.5 -8.5 -8 -4 -8C-1.8 -8 0 -6.4 0 -4.6C0 -6.4 1.8 -8 4 -8C8.5 -8 9 -0.5 0 6Z';
const BUBBLE = 'M0 -7.5C5.5 -7.5 8.5 -4.5 8.5 -0.5C8.5 3.5 5.5 6.5 0 6.5C-1.4 6.5 -2.6 6.3 -3.6 5.9L-7.5 8L-6.6 3.9C-7.9 2.8 -8.5 1.3 -8.5 -0.5C-8.5 -4.5 -5.5 -7.5 0 -7.5Z';
const SHARE = 'M-8 6C-8 -1.5 -2.5 -4 3 -4V-8.5L9.5 -1.5L3 5.5V1C-2 1 -5.5 2.5 -8 6Z';

const THEMES = {
  douyin: {
    body: ['#3A3B45', '#17181F', '#030305'],
    rim: ['#22232B', '#0E0F14', '#040406', '#000000'],
    shadeA: 0.25, shadeB: 0.35, hi: 0.3,
    speaker: '#000', speakerEdge: '#3A3B44', screenEdge: '#000',
    feed: ['#1B1C28', '#0D0D14', '#050508'], glowMul: 1,
    tab: ['#101016', '#000000'], hairline: '#FFFFFF', hairOp: 0.14, ink: '#F2F2F4',
    plus: ['#FFFFFF', '#E4E5EA'], plusGlyph: '#111118',
    core: ['#FFFFFF', '#F4F4F6', '#D2D3D8'], coreGloss: 0.19, noteShadow: 0.55,
    glass: 0.13, captionOp: [0.85, 0.45],
  },
  tiktok: {
    body: ['#FFFFFF', '#EEEFF2', '#C4C6CE'],
    rim: ['#B4B6BE', '#AFB1B9', '#9C9EA7', '#8E909A'],
    shadeA: 0.06, shadeB: 0.1, hi: 1,
    speaker: '#2A2B33', speakerEdge: '#C9CBD2', screenEdge: '#A9ABB4',
    feed: ['#FFFFFF', '#F1F2F5', '#E3E4E9'], glowMul: 0.8,
    tab: ['#FFFFFF', '#ECEDF1'], hairline: '#000000', hairOp: 0.1, ink: '#20212B',
    plus: ['#2E303B', '#0A0A10'], plusGlyph: '#FFFFFF',
    core: ['#3A3C48', '#1B1C26', '#07070C'], coreGloss: 0.17, noteShadow: 0.3,
    glass: 0.35, captionOp: [0.8, 0.35],
  },
};

const stops = (a) => a.map((c, i) => `<stop offset="${(i / (a.length - 1)).toFixed(2)}" stop-color="${c}"/>`).join('');

function plusButton(t, cx, cy, w, h) {
  const r = h * 0.3, o = h * 0.2, x = cx - w / 2, y = cy - h / 2, th = h * 0.13, l = h * 0.52;
  return `<path d="${rr(x - o, y, w, h, r)}" fill="#25F4EE"/>
    <path d="${rr(x + o, y, w, h, r)}" fill="#FE2C55"/>
    <path d="${rr(x, y, w, h, r)}" fill="url(#plusFill)"/>
    <path d="M${cx - l / 2} ${cy - th / 2}H${cx + l / 2}V${cy + th / 2}H${cx - l / 2}Z M${cx - th / 2} ${cy - l / 2}H${cx + th / 2}V${cy + l / 2}H${cx - th / 2}Z" fill="${t.plusGlyph}"/>`;
}

function note(t, cx, cy, s) {
  return `<g filter="url(#noteShadow)" transform="translate(${cx} ${cy}) scale(${s}) translate(-54 -54)">
    <path d="${RED}" fill="url(#redG)"/>
    <path d="${CYAN}" fill="url(#cyanG)"/>
    <path d="${CORE}" fill="url(#core)"/>
    <g clip-path="url(#coreClip)"><ellipse cx="50" cy="22" rx="40" ry="34" fill="#fff" opacity="${t.coreGloss}"/></g>
  </g>`;
}

function actions(t, a) {
  const { x, top, gap, s, avatar } = a;
  let g = `<g fill="${t.ink}" transform="translate(${x} 0)">`;
  let y = top;
  if (avatar) {
    g += `<circle cx="0" cy="${y}" r="${10 * s}" fill="url(#avatar)" stroke="#fff" stroke-width="${1.6 * s}"/>
      <circle cx="0" cy="${y + 10 * s}" r="${3.6 * s}" fill="#FE2C55"/>
      <path d="M${-2 * s} ${y + 10 * s}H${2 * s}M0 ${y + 8 * s}V${y + 12 * s}" stroke="#fff" stroke-width="${1.1 * s}"/>`;
    y += gap * 1.15;
  }
  g += `<path transform="translate(0 ${y}) scale(${s})" d="${HEART}"/>`; y += gap;
  g += `<path transform="translate(0 ${y}) scale(${s})" d="${BUBBLE}"/>`; y += gap;
  g += `<path transform="translate(0 ${y}) scale(${s})" d="${SHARE}"/>`;
  return g + '</g>';
}

function tabs(t, S, tabY, tabH) {
  const cy = tabY + tabH / 2;
  const xs = [S.x + S.w * 0.12, S.x + S.w * 0.3, S.x + S.w * 0.7, S.x + S.w * 0.88];
  return xs.map((x, i) => `<rect x="${x - 8}" y="${cy - 2.2}" width="16" height="4.4" rx="2.2" fill="${t.ink}" opacity="${i === 0 ? 0.95 : 0.4}"/>`).join('') +
    `<rect x="${xs[0] - 6}" y="${cy + 5}" width="12" height="1.6" rx="0.8" fill="${t.ink}" opacity="0.9"/>`;
}

function build(t, o) {
  const S = o.screen, tabH = o.tabH, tabY = S.y + S.h - tabH;
  const glow = o.glow * t.glowMul;
  let body = `<use href="#tile" fill="url(#bodyFill)"/>`;
  if (o.metalFrame) {
    body += `<g clip-path="url(#tileClip)" fill="none">
      <use href="#tile" stroke="url(#metal)" stroke-width="9"/>
      <use href="#tile" stroke="#000" stroke-opacity="${t === THEMES.douyin ? 0.6 : 0.18}" stroke-width="11.5" transform="scale(0.965 0.97) translate(4.6 3.9)"/>
    </g>`;
  }
  body += `<g clip-path="url(#tileClip)" fill="none">
    <use href="#tile" stroke="#000" stroke-opacity="${t.shadeA}" stroke-width="5"/>
    <use href="#tile" stroke="#000" stroke-opacity="${t.shadeB}" stroke-width="4" transform="translate(0 -1.5)"/>
    <use href="#tile" stroke="#FFFFFF" stroke-opacity="${t.hi}" stroke-width="2" transform="translate(0 1)"/>
    <use href="#tile" stroke="url(#tileRim)" stroke-width="2"/>
  </g>`;
  if (o.speaker) {
    const cy = S.y / 2 + 1;
    body += `<path d="${rr(111, cy - 1.8, 34, 3.6, 1.8)}" fill="${t.speaker}" stroke="${t.speakerEdge}" stroke-width="0.6"/>
      <circle cx="${o.cameraX}" cy="${cy}" r="2.6" fill="#07070C" stroke="${t.speakerEdge}" stroke-width="0.6"/>
      <circle cx="${o.cameraX - 0.8}" cy="${cy - 0.8}" r="0.8" fill="#6BA7C9" opacity="0.8"/>`;
  }
  body += `<path d="${rr(S.x - 1, S.y - 1, S.w + 2, S.h + 2, S.r + 1)}" fill="${t.screenEdge}"/>`;
  body += `<g clip-path="url(#screenClip)">
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" fill="url(#feed)"/>
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" fill="url(#glowC)"/>
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" fill="url(#glowR)"/>
    ${o.progress ? `<rect x="${S.x}" y="${tabY - 2}" width="${S.w}" height="1.4" fill="${t.ink}" opacity="0.2"/><rect x="${S.x}" y="${tabY - 2}" width="${S.w * 0.38}" height="1.4" fill="${t.ink}" opacity="0.8"/>` : ''}
    ${note(t, o.noteX, o.noteY, o.noteS)}
    ${o.actions ? actions(t, o.actions) : ''}
    ${o.caption ? `<rect x="${S.x + 10}" y="${tabY - 24}" width="54" height="5" rx="2.5" fill="${t.ink}" opacity="${t.captionOp[0]}"/><rect x="${S.x + 10}" y="${tabY - 14}" width="92" height="4" rx="2" fill="${t.ink}" opacity="${t.captionOp[1]}"/>` : ''}
    <rect x="${S.x}" y="${tabY}" width="${S.w}" height="${tabH}" fill="url(#tabFill)"/>
    <rect x="${S.x}" y="${tabY}" width="${S.w}" height="0.8" fill="${t.hairline}" opacity="${t.hairOp}"/>
    ${o.tabs ? tabs(t, S, tabY, tabH) : ''}
    ${plusButton(t, 128, tabY + tabH / 2, o.plus[0], o.plus[1])}
    <path d="M${S.x} ${S.y} H${S.x + S.w * 0.72} L${S.x} ${S.y + S.h * 0.5} Z" fill="url(#glass)"/>
  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs>
  <path id="tile" d="${TILE}"/>
  <clipPath id="tileClip"><use href="#tile"/></clipPath>
  <clipPath id="screenClip"><path d="${rr(S.x, S.y, S.w, S.h, S.r)}"/></clipPath>
  <clipPath id="coreClip"><path d="${CORE}"/></clipPath>
  <linearGradient id="bodyFill" x1="0" y1="2" x2="0" y2="252" gradientUnits="userSpaceOnUse">${stops(t.body)}</linearGradient>
  <linearGradient id="tileRim" x1="0" y1="2" x2="0" y2="252" gradientUnits="userSpaceOnUse">${stops(t.rim)}</linearGradient>
  <linearGradient id="metal" x1="0" y1="2" x2="0" y2="252" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#F4F5F8"/><stop offset="0.3" stop-color="#9FA2AB"/><stop offset="0.55" stop-color="#E3E5EA"/><stop offset="1" stop-color="#6E717A"/>
  </linearGradient>
  <linearGradient id="feed" x1="0" y1="0" x2="0" y2="1">${stops(t.feed)}</linearGradient>
  <radialGradient id="glowC" cx="0.15" cy="0.2" r="0.6"><stop offset="0" stop-color="#25F4EE" stop-opacity="${glow}"/><stop offset="1" stop-color="#25F4EE" stop-opacity="0"/></radialGradient>
  <radialGradient id="glowR" cx="0.9" cy="0.75" r="0.6"><stop offset="0" stop-color="#FE2C55" stop-opacity="${glow * 1.3}"/><stop offset="1" stop-color="#FE2C55" stop-opacity="0"/></radialGradient>
  <linearGradient id="tabFill" x1="0" y1="0" x2="0" y2="1">${stops(t.tab)}</linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${t.glass}"/><stop offset="1" stop-color="#fff" stop-opacity="0.02"/></linearGradient>
  <linearGradient id="plusFill" x1="0" y1="0" x2="0" y2="1">${stops(t.plus)}</linearGradient>
  <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7B267"/><stop offset="1" stop-color="#C8553D"/></linearGradient>
  <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5C7C"/><stop offset="1" stop-color="#E0183F"/></linearGradient>
  <linearGradient id="cyanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DFFFB"/><stop offset="1" stop-color="#12D6D0"/></linearGradient>
  <linearGradient id="core" x1="0" y1="0" x2="0" y2="1">${stops(t.core)}</linearGradient>
  <filter id="noteShadow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dy="2.5"/>
    <feComponentTransfer><feFuncA type="linear" slope="${t.noteShadow}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
${body}
</svg>
`;
}

const LAYOUTS = {
  // A: literal phone: speaker/camera bezel, avatar + action column, caption lines, tab labels, progress bar
  A: {
    screen: { x: 33, y: 22, w: 190, h: 212, r: 10 }, speaker: true, cameraX: 158,
    tabH: 34, tabs: true, plus: [30, 20], progress: true, caption: true,
    noteX: 110, noteY: 104, noteS: 1.62, glow: 0.22,
    actions: { x: 203, top: 70, gap: 30, s: 0.95, avatar: true },
  },
  // B: minimal: thin bezel, big note, no side icons, big "+"
  B: {
    screen: { x: 31, y: 12, w: 194, h: 230, r: 17 }, speaker: false,
    tabH: 48, tabs: false, plus: [48, 31], progress: false, caption: false,
    noteX: 124, noteY: 100, noteS: 2.1, glow: 0.3,
  },
  // C: Smartisan metal frame + speaker, big note, slim action column (no avatar), tab labels
  C: {
    screen: { x: 37, y: 24, w: 182, h: 206, r: 9 }, speaker: true, cameraX: 156, metalFrame: true,
    tabH: 40, tabs: true, plus: [38, 25], progress: false, caption: false,
    noteX: 116, noteY: 104, noteS: 1.85, glow: 0.26,
    actions: { x: 201, top: 76, gap: 29, s: 0.95, avatar: false },
  },
};

const names = [];
for (const k of Object.keys(LAYOUTS)) for (const app of ['douyin', 'tiktok']) {
  const n = `phone-${k}-${app}`;
  names.push(n);
  fs.writeFileSync(path.join(OUT, n + '.svg'), build(THEMES[app], LAYOUTS[k]));
}

const xhs = 'file:///D:/Others-Github/smartisan_icon/iconpack/png/com.xingin.xhs.png';
let sheet = '<!doctype html><html><head><style>body{margin:0;font:13px "Microsoft YaHei",sans-serif}.row{display:flex;gap:10px;padding:10px 12px;align-items:center}.gap{width:26px}img{display:block}</style></head><body>';
const cell = (src, w) => `<img src="${src}" width="${w}">`;
for (const bg of ['#e8e4dc', '#2b3a4a']) {
  for (const w of [256, 48]) {
    const box = (src) => `<div style="width:256px;display:flex;justify-content:center">${cell(src, w)}</div>`;
    sheet += `<div class="row" style="background:${bg}">`;
    ['A', 'B', 'C'].forEach(k => {
      sheet += box(`../designs/douyin/phone-${k}-douyin.png`) + box(`../designs/douyin/phone-${k}-tiktok.png`) + '<div class="gap"></div>';
    });
    sheet += box(xhs) + '</div>';
  }
}
fs.writeFileSync(path.join(__dirname, 'render', 'phone-sheet.html'), sheet + '</body></html>');
fs.writeFileSync(path.join(__dirname, 'render', 'phone-names.txt'), names.join('\n'));
console.log('ok', names.join(' '));
