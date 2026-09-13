const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'designs', 'douyin');
const src = fs.readFileSync(path.join(__dirname, 'gen.js'), 'utf8');
const grab = (n) => src.match(new RegExp(`const ${n} = '([^']+)'`))[1];
const RED = grab('RED'), CYAN = grab('CYAN'), CORE = grab('CORE');

const TILE = 'M27.06 23H228.94C247.74 23 252.94 28.2 252.94 47V208.93C252.94 227.73 247.74 232.93 228.94 232.93H27.06C8.26 232.93 3.06 227.73 3.06 208.93V47C3.06 28.2 8.26 23 27.06 23Z';
// old tile 232x204 centre 126, note scale 2.45 at y130 -> new 250x210 centre 128
const S = 2.56, CX = 128, CY = 132;

function build(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs>
  <path id="tile" d="${TILE}"/>
  <clipPath id="tileClip"><use href="#tile"/></clipPath>
  <clipPath id="coreClip"><path d="${CORE}"/></clipPath>
  <linearGradient id="tileFill" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse">
    ${t.fill}
  </linearGradient>
  <linearGradient id="tileRim" x1="0" y1="23" x2="0" y2="233" gradientUnits="userSpaceOnUse">
    ${t.rim}
  </linearGradient>
  <linearGradient id="gloss" x1="0" y1="23" x2="0" y2="135" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5C7C"/><stop offset="1" stop-color="#E0183F"/></linearGradient>
  <linearGradient id="cyanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DFFFB"/><stop offset="1" stop-color="#12D6D0"/></linearGradient>
  <linearGradient id="core" x1="0" y1="0" x2="0" y2="1">${t.core}</linearGradient>
  <filter id="noteShadow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/><feOffset dy="3"/>
    <feComponentTransfer><feFuncA type="linear" slope="${t.noteShadow}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<!-- base (no outer shadow, per spec) -->
<use href="#tile" fill="url(#tileFill)"/>
<g clip-path="url(#tileClip)">
  <!-- top gloss arc -->
  <path d="M0 23H256V115C176 138 80 138 0 119Z" fill="url(#gloss)" opacity="${t.gloss}"/>
  <g fill="none">
    <use href="#tile" stroke="#000" stroke-opacity="${t.shadeA}" stroke-width="5"/>
    <use href="#tile" stroke="#000" stroke-opacity="${t.shadeB}" stroke-width="4" transform="translate(0 -1.5)"/>
    <use href="#tile" stroke="#FFFFFF" stroke-opacity="${t.hiOp}" stroke-width="2" transform="translate(0 1)"/>
    <use href="#tile" stroke="url(#tileRim)" stroke-width="2"/>
  </g>
</g>
<g filter="url(#noteShadow)" transform="translate(${CX} ${CY}) scale(${S}) translate(-54 -54)">
  <path d="${RED}" fill="url(#redG)"/>
  <path d="${CYAN}" fill="url(#cyanG)"/>
  <path d="${CORE}" fill="url(#core)"/>
  <g clip-path="url(#coreClip)"><ellipse cx="50" cy="22" rx="40" ry="34" fill="#fff" opacity="${t.coreGloss}"/></g>
</g>
</svg>
`;
}

const douyin = build({
  fill: '<stop offset="0" stop-color="#34353F"/><stop offset="0.45" stop-color="#15161D"/><stop offset="1" stop-color="#030305"/>',
  rim: '<stop offset="0" stop-color="#1C1D24"/><stop offset="0.2" stop-color="#0E0F14"/><stop offset="0.85" stop-color="#040406"/><stop offset="1" stop-color="#000000"/>',
  core: '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#F4F4F6"/><stop offset="1" stop-color="#D2D3D8"/>',
  gloss: 0.35, shadeA: 0.25, shadeB: 0.35, hiOp: 0.3, noteShadow: 0.5, coreGloss: 0.19,
});
const tiktok = build({
  fill: '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#F1F2F5"/><stop offset="1" stop-color="#C9CBD2"/>',
  rim: '<stop offset="0" stop-color="#B4B6BE"/><stop offset="0.2" stop-color="#AFB1B9"/><stop offset="0.85" stop-color="#9C9EA7"/><stop offset="1" stop-color="#8E909A"/>',
  core: '<stop offset="0" stop-color="#3A3C48"/><stop offset="0.5" stop-color="#1B1C26"/><stop offset="1" stop-color="#07070C"/>',
  gloss: 0.9, shadeA: 0.05, shadeB: 0.08, hiOp: 1, noteShadow: 0.35, coreGloss: 0.17,
});
fs.writeFileSync(path.join(OUT, 'final-douyin.svg'), douyin);
fs.writeFileSync(path.join(OUT, 'final-tiktok.svg'), tiktok);

let sheet = '<!doctype html><html><head><style>body{margin:0}.row{display:flex;gap:24px;padding:16px;align-items:center}img{display:block}</style></head><body>';
for (const bg of ['#e8e4dc', '#2b3a4a']) {
  sheet += `<div class="row" style="background:${bg}">` +
    ['final-douyin', 'final-tiktok'].map(n => `<img src="../designs/douyin/${n}.png" width="256">`).join('') +
    ['final-douyin', 'final-tiktok', 'opt-A-douyin'].map(n => `<img src="../designs/douyin/${n}.png" width="48">`).join('') +
    `<img src="file:///D:/Others-Github/smartisan_icon/iconpack/overrides/icons/com.bilibili.app.in.png" width="48"></div>`;
}
fs.writeFileSync(path.join(__dirname, 'render', 'final-sheet.html'), sheet + '</body></html>');
console.log('ok');
