const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'designs', 'douyin');

const RED = 'M78.47,50.46C73.76,50.46 69.4,48.95 65.83,46.38V64.87C65.83,74.1 58.34,81.6 49.11,81.6C45.83,81.6 42.76,80.65 40.17,79C39.96,78.86 39.75,78.72 39.54,78.57C35.23,75.54 32.4,70.53 32.4,64.87C32.4,55.63 39.89,48.13 49.11,48.13C49.88,48.13 50.63,48.2 51.36,48.29V57.58C50.65,57.36 49.9,57.23 49.11,57.23C44.91,57.23 41.49,60.66 41.49,64.88C41.49,67.81 43.14,70.36 45.57,71.64C45.69,71.69 45.81,71.75 45.92,71.81C46.9,72.26 47.98,72.51 49.11,72.51C53.22,72.51 56.58,69.23 56.73,65.15L56.75,28.71H65.83C65.83,29.5 65.91,30.27 66.04,31.01C66.68,34.47 68.73,37.44 71.58,39.31C71.74,39.41 71.92,39.52 72.09,39.62C73.96,40.72 76.14,41.36 78.47,41.36V50.46Z';
const CYAN = 'M75.59,48.15C70.88,48.15 66.52,46.65 62.96,44.08V62.56C62.96,71.79 55.46,79.29 46.24,79.29C42.95,79.29 39.88,78.34 37.3,76.69C37.09,76.56 36.87,76.41 36.66,76.27C32.35,73.24 29.52,68.22 29.52,62.56C29.52,53.33 37.02,45.83 46.24,45.83C47,45.83 47.75,45.89 48.49,45.99V55.28C47.77,55.06 47.02,54.92 46.24,54.92C42.03,54.92 38.61,58.35 38.61,62.57C38.61,65.5 40.27,68.06 42.7,69.33C42.82,69.39 42.93,69.45 43.05,69.5C44.02,69.96 45.1,70.21 46.24,70.21C50.35,70.21 53.71,66.93 53.86,62.85L53.88,26.4H62.96C62.96,27.19 63.03,27.96 63.17,28.71C63.8,32.17 65.86,35.14 68.7,37C68.87,37.11 69.04,37.21 69.22,37.32C71.09,38.42 73.27,39.05 75.59,39.05V48.15Z';
const CORE = 'M62.97,62.56C62.97,71.79 55.47,79.29 46.25,79.29C42.96,79.29 39.89,78.34 37.31,76.69C34.28,73.66 32.41,69.48 32.41,64.87C32.41,55.85 39.58,48.47 48.5,48.14V55.27C47.78,55.05 47.03,54.91 46.25,54.91C42.04,54.91 38.62,58.35 38.62,62.56C38.62,65.49 40.28,68.05 42.71,69.32C42.83,69.38 42.94,69.44 43.06,69.5C43.73,70.38 44.59,71.12 45.58,71.64C46.65,72.2 47.85,72.51 49.12,72.51C53.23,72.51 56.59,69.23 56.74,65.15L56.76,28.71H63.19C63.82,32.17 65.88,35.14 68.72,37C68.89,37.11 69.06,37.21 69.23,37.32C69.94,38.07 70.73,38.75 71.6,39.31C72.8,40.11 74.16,40.69 75.6,41.03V48.15C70.89,48.15 66.53,46.65 62.97,44.08V62.56Z';

// tile geometry (bilibili-like: slightly wider than tall)
const T = { x: 12, y: 24, w: 232, h: 204, r: 34 };
const tileRect = (extra = '') => `<rect x="${T.x}" y="${T.y}" width="${T.w}" height="${T.h}" rx="${T.r}" ${extra}/>`;

const commonDefs = `
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="4.5"/>
    <feOffset dy="5" result="b"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="noteShadow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.2"/>
    <feOffset dy="3" result="b"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="tileClip">${tileRect()}</clipPath>
  <clipPath id="coreClip"><path d="${CORE}"/></clipPath>
  <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FF5C7C"/><stop offset="1" stop-color="#E0183F"/>
  </linearGradient>
  <linearGradient id="cyanG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7DFFFB"/><stop offset="1" stop-color="#12D6D0"/>
  </linearGradient>
  <linearGradient id="coreWhite" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#F4F4F6"/><stop offset="1" stop-color="#D2D3D8"/>
  </linearGradient>
  <linearGradient id="coreBlack" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3A3C48"/><stop offset="0.5" stop-color="#1B1C26"/><stop offset="1" stop-color="#07070C"/>
  </linearGradient>
`;

// note: sx,sy center, scale; coreFill id
function note(cx, cy, s, coreFill, coreGloss = 0.55) {
  return `<g filter="url(#noteShadow)" transform="translate(${cx} ${cy}) scale(${s}) translate(-54 -54)">
    <path d="${RED}" fill="url(#redG)"/>
    <path d="${CYAN}" fill="url(#cyanG)"/>
    <path d="${CORE}" fill="url(#${coreFill})"/>
    <g clip-path="url(#coreClip)">
      <ellipse cx="50" cy="22" rx="40" ry="34" fill="#fff" opacity="${coreGloss * 0.35}"/>
    </g>
  </g>`;
}

// top gloss + rim for a tile
function tileChrome(rimTop, rimBottom, glossOpacity) {
  return `
  <rect x="${T.x + 0.75}" y="${T.y + 0.75}" width="${T.w - 1.5}" height="${T.h - 1.5}" rx="${T.r - 0.75}" fill="none" stroke="url(#rim)" stroke-width="1.5"/>
  <g clip-path="url(#tileClip)">
    <path d="M${T.x} ${T.y} H${T.x + T.w} V${T.y + 92} C ${T.x + 170} ${T.y + 112}, ${T.x + 66} ${T.y + 112}, ${T.x} ${T.y + 96} Z" fill="url(#gloss)" opacity="${glossOpacity}"/>
  </g>`;
}
function rimDefs(rimTop, rimBottom, glossTop) {
  return `
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${rimTop}"/><stop offset="1" stop-color="${rimBottom}"/>
  </linearGradient>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${glossTop}" stop-opacity="0.55"/><stop offset="1" stop-color="${glossTop}" stop-opacity="0"/>
  </linearGradient>`;
}

const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs>${commonDefs}${defs}
</defs>
${body}
</svg>
`;

const files = {};

// ---------- Option A: black glossy vs silver-white ----------
files['opt-A-douyin'] = svg(`
  <linearGradient id="tileA" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#34353F"/><stop offset="0.45" stop-color="#15161D"/><stop offset="1" stop-color="#030305"/>
  </linearGradient>
  ${rimDefs('#6A6B78', '#000000', '#FFFFFF')}`,
`<g filter="url(#shadow)">${tileRect('fill="url(#tileA)"')}</g>
  ${tileChrome(0, 0, 0.35)}
  ${note(128, 130, 2.45, 'coreWhite')}`);

files['opt-A-tiktok'] = svg(`
  <linearGradient id="tileA" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#F1F2F5"/><stop offset="1" stop-color="#C9CBD2"/>
  </linearGradient>
  ${rimDefs('#FFFFFF', '#9A9CA6', '#FFFFFF')}`,
`<g filter="url(#shadow)">${tileRect('fill="url(#tileA)"')}</g>
  <rect x="${T.x + 0.5}" y="${T.y + 0.5}" width="${T.w - 1}" height="${T.h - 1}" rx="${T.r - 0.5}" fill="none" stroke="#A7A9B2" stroke-width="1"/>
  ${tileChrome(0, 0, 0.9)}
  ${note(128, 130, 2.45, 'coreBlack', 0.5)}`);

// ---------- Option B: label band ----------
function bandTile(bandId, label, labelColor, fontSize, letterSpacing) {
  const bandY = T.y + 150;
  return `<g filter="url(#shadow)">${tileRect('fill="url(#tileB)"')}</g>
  <g clip-path="url(#tileClip)">
    <rect x="${T.x}" y="${bandY}" width="${T.w}" height="${T.h - 150}" fill="url(#${bandId})"/>
    <rect x="${T.x}" y="${bandY}" width="${T.w}" height="1.5" fill="#000" opacity="0.55"/>
    <rect x="${T.x}" y="${bandY + 1.5}" width="${T.w}" height="1.5" fill="#fff" opacity="0.45"/>
    <rect x="${T.x}" y="${bandY + 3}" width="${T.w}" height="22" fill="#fff" opacity="0.12"/>
  </g>
  ${tileChrome(0, 0, 0.3)}
  <text x="128" y="${bandY + 42}" text-anchor="middle" font-family="'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="#000" opacity="0.35" dy="-1.5">${label}</text>
  <text x="128" y="${bandY + 42}" text-anchor="middle" font-family="'Microsoft YaHei','PingFang SC','Noto Sans CJK SC',sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${letterSpacing}" fill="${labelColor}">${label}</text>
  ${note(128, 98, 1.95, 'coreWhite')}`;
}
const tileBDefs = `
  <linearGradient id="tileB" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#34353F"/><stop offset="0.6" stop-color="#15161D"/><stop offset="1" stop-color="#030305"/>
  </linearGradient>
  ${rimDefs('#6A6B78', '#000000', '#FFFFFF')}`;
files['opt-B-douyin'] = svg(`${tileBDefs}
  <linearGradient id="bandR" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FF4F72"/><stop offset="1" stop-color="#C80F36"/>
  </linearGradient>`, bandTile('bandR', '抖音', '#FFFFFF', 34, 8));
files['opt-B-tiktok'] = svg(`${tileBDefs}
  <linearGradient id="bandC" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5FFBF6"/><stop offset="1" stop-color="#0FB8B3"/>
  </linearGradient>`, bandTile('bandC', 'TikTok', '#101119', 33, 1).replace(/opacity="0.35" dy="-1.5"/, 'opacity="0.0" dy="-1.5"'));

// ---------- Option C: vinyl (Douyin) vs globe (TikTok) ----------
function grooves(cx, cy, from, to, step, color, op) {
  let s = '';
  for (let r = from; r <= to; r += step) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="0.8" opacity="${op}"/>`;
  return s;
}
files['opt-C-douyin'] = svg(`
  <radialGradient id="tileC" cx="0.5" cy="0.35" r="0.85">
    <stop offset="0" stop-color="#3B1A27"/><stop offset="0.6" stop-color="#1A0B12"/><stop offset="1" stop-color="#070205"/>
  </radialGradient>
  <radialGradient id="glowR" cx="0.78" cy="0.85" r="0.55">
    <stop offset="0" stop-color="#FE2C55" stop-opacity="0.55"/><stop offset="1" stop-color="#FE2C55" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glowC" cx="0.18" cy="0.18" r="0.5">
    <stop offset="0" stop-color="#25F4EE" stop-opacity="0.28"/><stop offset="1" stop-color="#25F4EE" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="label" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#2A0E18"/><stop offset="1" stop-color="#12060B"/>
  </radialGradient>
  ${rimDefs('#8A5566', '#000000', '#FFFFFF')}`,
`<g filter="url(#shadow)">${tileRect('fill="url(#tileC)"')}</g>
  <g clip-path="url(#tileClip)">
    ${tileRect('fill="url(#glowR)"')}
    ${tileRect('fill="url(#glowC)"')}
    ${grooves(128, 128, 30, 170, 3.2, '#FFFFFF', 0.1)}
    <path d="M128 128 L20 40 L60 20 Z M128 128 L236 216 L196 236 Z" fill="#fff" opacity="0.06"/>
    <circle cx="128" cy="128" r="178" fill="none" stroke="#fff" stroke-width="60" opacity="0"/>
  </g>
  ${tileChrome(0, 0, 0.28)}
  ${note(128, 130, 2.45, 'coreWhite')}`);

function globe(cx, cy, R) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#globeFill)" stroke="url(#globeStroke)" stroke-width="2.2"/>`;
  // meridians
  for (const k of [0.33, 0.66]) s += `<ellipse cx="${cx}" cy="${cy}" rx="${R * k}" ry="${R}" fill="none" stroke="#6FF7F3" stroke-width="1.6" opacity="0.45"/>`;
  s += `<line x1="${cx}" y1="${cy - R}" x2="${cx}" y2="${cy + R}" stroke="#6FF7F3" stroke-width="1.6" opacity="0.45"/>`;
  // parallels
  for (const f of [-0.5, 0, 0.5]) {
    const y = cy + f * R, hw = Math.sqrt(1 - f * f) * R;
    s += `<line x1="${cx - hw}" y1="${y}" x2="${cx + hw}" y2="${y}" stroke="#6FF7F3" stroke-width="1.6" opacity="0.45"/>`;
  }
  return s;
}
files['opt-C-tiktok'] = svg(`
  <radialGradient id="tileC" cx="0.5" cy="0.35" r="0.85">
    <stop offset="0" stop-color="#123A4A"/><stop offset="0.6" stop-color="#0A1A26"/><stop offset="1" stop-color="#03070C"/>
  </radialGradient>
  <radialGradient id="globeFill" cx="0.38" cy="0.3" r="0.75">
    <stop offset="0" stop-color="#25F4EE" stop-opacity="0.28"/><stop offset="1" stop-color="#25F4EE" stop-opacity="0.04"/>
  </radialGradient>
  <linearGradient id="globeStroke" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9BFFFC" stop-opacity="0.85"/><stop offset="1" stop-color="#25F4EE" stop-opacity="0.25"/>
  </linearGradient>
  <radialGradient id="glowR" cx="0.85" cy="0.9" r="0.45">
    <stop offset="0" stop-color="#FE2C55" stop-opacity="0.3"/><stop offset="1" stop-color="#FE2C55" stop-opacity="0"/>
  </radialGradient>
  ${rimDefs('#5C8A99', '#000000', '#FFFFFF')}`,
`<g filter="url(#shadow)">${tileRect('fill="url(#tileC)"')}</g>
  <g clip-path="url(#tileClip)">
    ${tileRect('fill="url(#glowR)"')}
    ${globe(128, 128, 86)}
  </g>
  ${tileChrome(0, 0, 0.28)}
  ${note(128, 130, 2.2, 'coreWhite')}`);

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name + '.svg'), content);
  fs.writeFileSync(path.join(__dirname, 'render', name + '.html'),
    `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent;width:256px;height:256px;overflow:hidden}svg{display:block}</style></head><body>${content}</body></html>`);
}
// preview sheet: light + dark wallpaper, full and small size
const names = Object.keys(files);
let sheet = `<!doctype html><html><head><style>body{margin:0;font:12px sans-serif}.row{display:flex;gap:18px;padding:14px;align-items:center}.dark{background:#2b3a4a}.light{background:#e8e4dc}img{display:block}</style></head><body>`;
for (const bg of ['light', 'dark']) {
  sheet += `<div class="row ${bg}">` + names.map(n => `<img src="../designs/douyin/${n}.png" width="128">`).join('') + `</div>`;
  sheet += `<div class="row ${bg}">` + names.map(n => `<img src="../designs/douyin/${n}.png" width="48" style="margin-right:80px">`).join('') + `</div>`;
}
fs.writeFileSync(path.join(__dirname, 'render', 'sheet.html'), sheet + '</body></html>');
console.log('ok');
