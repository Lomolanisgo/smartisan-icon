// 微软系 Fluent（2019 版）标志 + Notion 官方标志 → 锤子拟物风格、无底板
// 用法：node iconpack/designs/all/tools/ms-fluent/gen.mjs   → 写出各目录的 opt-F/G/E.svg
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const PHONE = path.resolve(ROOT, '..', '..', 'phone-icons')

const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">\n${body}\n</svg>\n`
const hex = c => c.match(/[0-9a-f]{2}/gi).map(v => parseInt(v, 16))
const mix = (c, t, k) => '#' + hex(c).map((v, i) => Math.round(v + (hex(t)[i] - v) * k).toString(16).padStart(2, '0')).join('')
const dark = (c, k) => mix(c, '#000000', k)
const light = (c, k) => mix(c, '#ffffff', k)
const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
const lg = (id, y0, y1, stops) => `<linearGradient id="${id}" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`

const FILTERS = `<filter id="ground" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>
<filter id="drop" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.38"/></filter>
<filter id="glyph" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.3" flood-color="#000" flood-opacity="0.42"/></filter>`

// 一块有厚度的釉面板：地面投影 + 挤出 + 正面渐变 + 内侧暗边 + 上沿高光 + 顶部釉面反光 + 细描边
function slab(id, d, c1, c2, { depth = 6, gloss = true, glossBox = null, shadow = true, outline = null } = {}) {
  const [x, y, w, h] = glossBox ?? [0, 0, 256, 140]
  return `<defs>${lg(id + 'F', y, y + h * 1.6, [[0, c1], [1, c2]])}${lg(id + 'G', y, y + h, [[0, '#fff', 0.34], [1, '#fff', 0]])}<clipPath id="${id}C"><path d="${d}"/></clipPath></defs>
${shadow ? `<path d="${d}" transform="translate(0 ${depth + 5})" fill="#000" fill-opacity="0.33" filter="url(#ground)"/>` : ''}
<path d="${d}" transform="translate(0 ${depth})" fill="${dark(c2, 0.42)}"/>
<path d="${d}" transform="translate(0 ${depth / 2})" fill="${dark(c2, 0.22)}"/>
<path d="${d}" fill="url(#${id}F)"/>
<g clip-path="url(#${id}C)">
<path d="${d}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="5" filter="url(#soft)"/>
<path d="${d}" transform="translate(0 1.2)" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="2" filter="url(#soft)"/>
${gloss ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}G)"/>` : ''}
</g>
<path d="${d}" fill="none" stroke="${outline ?? dark(c2, 0.45)}" stroke-width="1" stroke-opacity="0.8"/>`
}

// 字母铭牌（Fluent 的正方形字母块）
function letterTile(x, y, s, r, c1, c2, glyph) {
  return slab('tile', rr(x, y, s, s, r), c1, c2, { depth: 7, glossBox: [x, y, s, s * 0.55] }) + `<g filter="url(#glyph)">${glyph}</g>`
}
const letter = (ch, cx, cy, size) => `<text x="${cx}" y="${cy + size * 0.36}" text-anchor="middle" font-family="Segoe UI, Segoe UI Bold, Arial, sans-serif" font-weight="700" font-size="${size}" fill="#FFFFFF">${ch}</text>`

// Fluent 文档：四条叠起来的色带（下面的先画，上面一条的厚度压在下一条上，像台阶）
function bandDoc(x, y, w, h, r, colors) {
  const n = colors.length, bh = h / n
  let defs = `<clipPath id="docC"><path d="${rr(x, y, w, h, r)}"/></clipPath>`
  let body = `<path d="${rr(x, y + 11, w, h, r)}" fill="#000" fill-opacity="0.33" filter="url(#ground)"/>
<path d="${rr(x, y + 6, w, h, r)}" fill="${dark(colors[n - 1], 0.45)}"/>
<g clip-path="url(#docC)">`
  for (let i = n - 1; i >= 0; i--) {
    const by = y + i * bh, c = colors[i]
    defs += lg(`b${i}`, by, by + bh, [[0, light(c, 0.08)], [0.6, c], [1, dark(c, 0.08)]])
    body += `<rect x="${x - 6}" y="${by}" width="${w + 12}" height="${bh + 8}" fill="${dark(c, 0.42)}"/>
<rect x="${x - 6}" y="${by}" width="${w + 12}" height="${bh + 2.5}" fill="${dark(c, 0.2)}"/>
<rect x="${x - 6}" y="${by}" width="${w + 12}" height="${bh}" fill="url(#b${i})"/>
<rect x="${x - 6}" y="${by + 0.8}" width="${w + 12}" height="1.6" fill="#fff" fill-opacity="0.45"/>`
  }
  body += `<path d="${rr(x, y, w, h, r)}" fill="none" stroke="#000" stroke-opacity="0.18" stroke-width="5" filter="url(#soft)"/>
<ellipse cx="${x + w * 0.55}" cy="${y - 10}" rx="${w * 0.75}" ry="${h * 0.3}" fill="#fff" fill-opacity="0.08"/>
</g>
<path d="${rr(x, y, w, h, r)}" fill="none" stroke="${dark(colors[n - 1], 0.45)}" stroke-width="1" stroke-opacity="0.85"/>`
  return `<defs>${defs}</defs>${body}`
}

const DOC = [90, 26, 148, 204, 22]
const TILE = [16, 68, 120, 16]
const files = {}

// ---------- Word ----------
files['com.microsoft.office.word/opt-F.svg'] = svg(`<defs>${FILTERS}</defs>
${bandDoc(...DOC, ['#41A5EE', '#2B7CD3', '#185ABD', '#103F91'])}
${letterTile(...TILE, '#2F7FD8', '#123F94', letter('W', 76, 128, 86))}`)

// ---------- Excel ----------
files['com.microsoft.office.excel/opt-F.svg'] = svg(`<defs>${FILTERS}</defs>
${bandDoc(...DOC, ['#33C481', '#21A366', '#107C41', '#185C37'])}
${letterTile(...TILE, '#24AE6C', '#0D5C33', letter('X', 76, 128, 92))}`)

// ---------- PowerPoint（右侧是圆饼） ----------
{
  const cx = 152, cy = 128, R = 98
  const circle = `M${cx - R} ${cy}A${R} ${R} 0 1 1 ${cx + R} ${cy}A${R} ${R} 0 1 1 ${cx - R} ${cy}Z`
  const wedgeTL = `M${cx} ${cy}L${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx} ${cy - R}Z`
  const wedgeBR = `M${cx} ${cy}L${cx + R} ${cy}A${R} ${R} 0 0 1 ${cx} ${cy + R}Z`
  files['com.microsoft.office.powerpoint/opt-F.svg'] = svg(`<defs>${FILTERS}${lg('wl', cy - R, cy, [[0, '#FFA88C'], [1, '#FF8F6B']])}${lg('wd', cy, cy + R, [[0, '#D4552F'], [1, '#B33A1A']])}</defs>
${slab('pie', circle, '#F58B6A', '#D9532C', { depth: 6, glossBox: [cx - R, cy - R, 2 * R, R * 1.1] })}
<g clip-path="url(#pieC)">
<path d="${wedgeTL}" fill="url(#wl)"/><path d="${wedgeBR}" fill="url(#wd)"/>
<path d="M${cx} ${cy}L${cx - R} ${cy}M${cx} ${cy}L${cx} ${cy - R}M${cx} ${cy}L${cx + R} ${cy}M${cx} ${cy}L${cx} ${cy + R}" stroke="#000" stroke-opacity="0.18" stroke-width="2"/>
<path d="M${cx} ${cy}L${cx - R} ${cy}M${cx} ${cy}L${cx} ${cy - R}" stroke="#fff" stroke-opacity="0.35" stroke-width="1" transform="translate(0 -1)"/>
<ellipse cx="${cx}" cy="${cy - R * 0.55}" rx="${R * 0.95}" ry="${R * 0.55}" fill="#fff" fill-opacity="0.2"/>
</g>
${letterTile(...TILE, '#F0704C', '#B7472A', letter('P', 76, 128, 92))}`)
}

// ---------- Outlook（深蓝背板 + 信纸 + 天蓝信封） ----------
{
  const [x, y, w, h, r] = DOC
  const back = rr(x, y, w, h, r)
  const envY = 108
  const env = `M${x} ${envY}H${x + w}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}Z`
  const mid = x + w / 2, vy = 176
  files['com.microsoft.office.outlook/opt-F.svg'] = svg(`<defs>${FILTERS}
${lg('paper', 44, 150, [[0, '#FFFFFF'], [1, '#E6ECF4']])}
${lg('envF', envY, y + h, [[0, '#6FDBFF'], [0.45, '#28A8EA'], [1, '#0F7DD0']])}
${lg('envLo', vy - 20, y + h, [[0, '#9CE7FF'], [1, '#33AEEF']])}
<clipPath id="envC"><path d="${env}"/></clipPath></defs>
${slab('back', back, '#1E6FD0', '#0A2767', { depth: 6, glossBox: [x, y, w, 100] })}
<g filter="url(#drop)"><rect x="112" y="42" width="104" height="112" rx="5" fill="url(#paper)"/></g>
<rect x="112.5" y="42.5" width="103" height="111" rx="4.5" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="1"/>
<rect x="128" y="58" width="52" height="8" rx="2" fill="#0F78D4"/><rect x="128" y="76" width="72" height="6" rx="2" fill="#C3CCD8"/><rect x="128" y="90" width="72" height="6" rx="2" fill="#C3CCD8"/><rect x="128" y="104" width="52" height="6" rx="2" fill="#C3CCD8"/>
<path d="${env}" transform="translate(0 6)" fill="#0A4E9C"/>
<path d="${env}" transform="translate(0 3)" fill="#0E63B8"/>
<path d="${env}" fill="url(#envF)"/>
<g clip-path="url(#envC)">
<path d="M${x} ${y + h}L${mid - 8} ${vy - 22}Q${mid} ${vy - 30} ${mid + 8} ${vy - 22}L${x + w} ${y + h}Z" fill="url(#envLo)"/>
<path d="M${x} ${envY}L${mid} ${vy}L${x + w} ${envY}" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2"/>
<path d="M${x} ${envY}L${mid} ${vy}L${x + w} ${envY}" fill="none" stroke="#0A5FB0" stroke-opacity="0.45" stroke-width="1.5" transform="translate(0 2.5)"/>
<path d="${env}" fill="none" stroke="#000" stroke-opacity="0.16" stroke-width="5" filter="url(#soft)"/>
<rect x="${x}" y="${envY}" width="${w}" height="2" fill="#fff" fill-opacity="0.6"/>
</g>
<path d="${env}" fill="none" stroke="#08488F" stroke-width="1" stroke-opacity="0.85"/>
${letterTile(...TILE, '#2F9BEA', '#0C5DB5', letter('O', 76, 128, 92))}`)
}

// ---------- To Do（蓝色圆角块 + 双色对勾） ----------
{
  const d = rr(28, 28, 200, 200, 46)
  files['com.microsoft.todos/opt-F.svg'] = svg(`<defs>${FILTERS}${lg('ckW', 84, 168, [[0, '#FFFFFF'], [1, '#E2EEFF']])}${lg('ckL', 120, 170, [[0, '#C9E4FF'], [1, '#8CC3FF']])}</defs>
${slab('todo', d, '#4C8DF5', '#1D4DB4', { depth: 8, glossBox: [28, 28, 200, 110] })}
<g filter="url(#glyph)" stroke-linecap="round" stroke-linejoin="round" fill="none">
<path d="M70 132L108 170" stroke="#1B47A8" stroke-opacity="0.35" stroke-width="30" transform="translate(0 3)"/>
<path d="M108 170L190 88" stroke="#1B47A8" stroke-opacity="0.35" stroke-width="30" transform="translate(0 3)"/>
<path d="M70 132L108 170" stroke="url(#ckL)" stroke-width="26"/>
<path d="M108 170L190 88" stroke="url(#ckW)" stroke-width="26"/>
<path d="M70 132L108 170" stroke="#fff" stroke-opacity="0.5" stroke-width="3" transform="translate(-4 -6)"/>
<path d="M112 164L190 86" stroke="#fff" stroke-opacity="0.7" stroke-width="3" transform="translate(0 -7)"/>
</g>`)
}

// ---------- OneDrive（云） ----------
{
  // 云 = 三个圆 + 圆角底座的并集（clipPath 里直接放形状即可得到并集）；外描边靠“先画粗描边再盖填充”只留外圈 1px
  const shapes = `<circle cx="146" cy="112" r="64"/><circle cx="76" cy="146" r="50"/><circle cx="206" cy="150" r="42"/><path d="M48 150H226V174A22 22 0 0 1 204 196H48A22 22 0 0 1 26 174V172A22 22 0 0 1 48 150Z"/>`
  // 内侧暗边/上沿高光：并集减去腐蚀后的并集得到一圈环（mask），避免描出各圆之间的内部交线
  const cloudF = (regions, c1, c2) => `<defs>${FILTERS}<clipPath id="cl">${shapes}</clipPath>${lg('cf', 48, 200, [[0, c1], [1, c2]])}${lg('cg', 48, 140, [[0, '#fff', 0.42], [1, '#fff', 0]])}${lg('hg', 48, 120, [[0, '#fff', 0.7], [1, '#fff', 0]])}
<filter id="erode4" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="erode" radius="4"/><feGaussianBlur stdDeviation="1.5"/></filter>
<filter id="erode2" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="erode" radius="2"/><feGaussianBlur stdDeviation="0.8"/></filter>
<mask id="edgeM"><g fill="#fff">${shapes}</g><g fill="#000" filter="url(#erode4)">${shapes}</g></mask>
<mask id="hiM"><g fill="#fff" transform="translate(0 1.4)">${shapes}</g><g fill="#000" filter="url(#erode2)" transform="translate(0 1.4)">${shapes}</g></mask></defs>
<g transform="translate(-9 6)">
<g transform="translate(0 12)" fill="#000" fill-opacity="0.33" filter="url(#ground)">${shapes}</g>
<g transform="translate(0 7)" fill="${dark(c2, 0.45)}" stroke="${dark(c2, 0.45)}" stroke-width="2">${shapes}</g>
<g transform="translate(0 3.5)" fill="${dark(c2, 0.22)}">${shapes}</g>
<g fill="${dark(c2, 0.5)}" stroke="${dark(c2, 0.5)}" stroke-width="2">${shapes}</g>
<g fill="url(#cf)">${shapes}</g>
<g clip-path="url(#cl)">
${regions}
<rect x="0" y="40" width="256" height="170" fill="#000" fill-opacity="0.2" mask="url(#edgeM)"/>
<rect x="0" y="40" width="256" height="170" fill="url(#hg)" mask="url(#hiM)"/>
<rect x="0" y="48" width="256" height="92" fill="url(#cg)"/>
</g>
</g>`
  // Fluent 四色分区：左深蓝、下中蓝、右蓝、右上浅蓝
  const regions = `<path d="M0 40H112L64 210H0Z" fill="#0364B8"/><path d="M112 40L64 210H150L172 100Z" fill="#0078D4"/><path d="M172 100L150 210H256V40H206Z" fill="#1490DF"/><path d="M206 40L178 96L256 128V40Z" fill="#28A8EA"/>
<path d="M112 40L64 210M172 100L150 210M206 40L178 96L256 128" fill="none" stroke="#fff" stroke-opacity="0.3" stroke-width="1"/>`
  files['com.microsoft.skydrive/opt-F.svg'] = svg(cloudF(regions, '#1490DF', '#0364B8'))
  files['com.microsoft.skydrive/opt-G.svg'] = svg(cloudF('', '#4FB9F7', '#0A5DB5'))
}

// ---------- Authenticator（官方盾锁路径，做成蓝色玻璃件） ----------
{
  const shackle = 'M24.5068,25.7267c0.381,-0.1 0.6667,-0.1 1.0478,-0.2 2.19,-0.2994 4.3808,-0.5989 6.5713,-0.7985a16.6314,16.6314 0,0 1,16 -13.2747,16.6313 16.6313,0 0,1 16,13.2747c2.1905,0.2 4.3809,0.4991 6.5715,0.7985 0.381,0.1 0.7618,0.1 1.0476,0.2a21.7169,21.7169 0,0 1,3.4285 0.8983c-1,-15.649 -12.7619,-26.25 -27.0476,-26.25S22.1735,10.976 21.1735,26.625A18.3046,18.3046 0,0 1,24.5068 25.7267Z'
  const shield = 'M86.8265,41.8807A16.6471,16.6471 0,0 0,72.5616 25.4059c-0.4018,-0.1005 -0.7032,-0.1005 -1.105,-0.201a174.6749,174.6749 0,0 0,-46.9132 0c-0.4018,0.1005 -0.8037,0.1005 -1.1051,0.201A16.5712,16.5712 0,0 0,9.1735 41.8807c0.1,14.2649 4.621,36.0639 28.2283,50.7306a19.9654,19.9654 0,0 0,21.0959 0C82.306,78.0451 86.8265,56.246 86.8265,41.8807Z'
  const s = 2.35, tx = 15.2, ty = 8
  files['com.azure.authenticator/opt-F.svg'] = svg(`<defs>${FILTERS}
${lg('shF', 25, 96, [[0, '#3BA6F0'], [0.5, '#0F82DC'], [1, '#164E96']])}
${lg('shG', 25, 60, [[0, '#fff', 0.4], [1, '#fff', 0]])}
${lg('skF', 0, 27, [[0, '#4C79B8'], [0.5, '#2A5B9C'], [1, '#193E74']])}
${lg('person', 30, 115, [[0, '#8AE0FF'], [0.35, '#40C4F5'], [1, '#0095E6']])}
<clipPath id="shC"><path d="${shield}"/></clipPath>
<filter id="gr2" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="dr2" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="#00265C" flood-opacity="0.5"/></filter>
</defs>
<g transform="translate(${tx} ${ty}) scale(${s})">
<g transform="translate(0 5)" fill="#000" fill-opacity="0.33" filter="url(#gr2)"><path d="${shackle}"/><path d="${shield}"/></g>
<path d="${shackle}" transform="translate(0 2)" fill="#10305C"/>
<path d="${shackle}" fill="url(#skF)"/>
<path d="${shackle}" fill="none" stroke="#9BBDE8" stroke-opacity="0.55" stroke-width="0.6" transform="translate(0 0.5)"/>
<path d="${shield}" transform="translate(0 3)" fill="#0B2E5E"/>
<path d="${shield}" transform="translate(0 1.5)" fill="#0E3F7E"/>
<path d="${shield}" fill="url(#shF)"/>
<g clip-path="url(#shC)">
<path d="${shield}" fill="none" stroke="#000" stroke-opacity="0.2" stroke-width="2.4" filter="url(#gr2)"/>
<path d="${shield}" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="0.9" transform="translate(0 0.6)"/>
<rect x="9" y="25" width="78" height="35" fill="url(#shG)"/>
<circle cx="48.35" cy="44.72" r="15.5" fill="#00133F" fill-opacity="0.35" filter="url(#gr2)"/>
<circle cx="48.35" cy="88.5" r="27.5" fill="#00133F" fill-opacity="0.35" filter="url(#gr2)"/>
<g filter="url(#dr2)"><circle cx="48.35" cy="44.72" r="13.06" fill="url(#person)"/><circle cx="48.35" cy="87.9" r="26.12" fill="url(#person)"/></g>
<ellipse cx="48.35" cy="39" rx="9" ry="5.5" fill="#fff" fill-opacity="0.35"/>
<path d="M28 70Q48 60 68 70" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.2"/>
</g>
<path d="${shield}" fill="none" stroke="#0B3568" stroke-width="0.5" stroke-opacity="0.9"/>
</g>`)
}

// ---------- Notion（官方标志：黑边 + 白面 + 衬线 N） ----------
{
  const src = fs.readFileSync(path.join(PHONE, 'notion.id.svg'), 'utf8')
  const d = src.match(/<path d="([^"]+)"/)[1]
  const parts = d.split(/Z/i).map(p => p.trim()).filter(Boolean).map(p => p + 'Z') // 0 外轮廓 1 顶面 2 正面 3 N
  const [outer, top, front, N] = parts
  const s = 1.24, tx = 128 - s * 216.5, ty = 124 - s * 217
  const notion = (bodyC1, bodyC2, faceC1, faceC2, topC1, topC2, nFill, nHi) => svg(`<defs>${FILTERS}
${lg('bd', 127, 307, [[0, bodyC1], [1, bodyC2]])}
${lg('fc', 170, 300, [[0, faceC1], [1, faceC2]])}
${lg('tp', 127, 165, [[0, topC1], [1, topC2]])}
<clipPath id="frontC"><path d="${front}"/></clipPath><clipPath id="outerC"><path d="${outer}"/></clipPath>
<filter id="gr3" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="in3" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>
<g transform="translate(${tx} ${ty}) scale(${s})">
<path d="${outer}" transform="translate(0 10)" fill="#000" fill-opacity="0.35" filter="url(#gr3)"/>
<path d="${outer}" transform="translate(0 6)" fill="${dark(bodyC2, 0.3)}"/>
<path d="${outer}" transform="translate(0 3)" fill="${dark(bodyC2, 0.15)}"/>
<path d="${outer}" fill="url(#bd)"/>
<g clip-path="url(#outerC)"><path d="${outer}" transform="translate(0 1.2)" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="2" filter="url(#in3)"/></g>
<path d="${top}" fill="url(#tp)"/>
<path d="${front}" fill="url(#fc)"/>
<g clip-path="url(#frontC)"><path d="${front}" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="7" filter="url(#in3)"/><path d="${front}" transform="translate(0 -2)" fill="none" stroke="#fff" stroke-opacity="0.9" stroke-width="2"/></g>
<path d="${N}" transform="translate(0 1.5)" fill="${nHi}" fill-opacity="0.9"/>
<path d="${N}" fill="${nFill}"/>
</g>`)
  files['notion.id/opt-E.svg'] = notion('#4A4A4A', '#0D0D0D', '#FFFFFF', '#ECECEC', '#FFFFFF', '#F2F2F2', '#111111', '#FFFFFF')
  files['notion.id/opt-F.svg'] = notion('#FFFFFF', '#D9D9D9', '#2E2E2E', '#0C0C0C', '#3A3A3A', '#1A1A1A', '#FFFFFF', '#000000')
}

// ---------- 官方矢量直接加立体效果（用户：不要重画，只提取原图标加立体） ----------
// 把 official/*.svg 以 data URI 嵌入，用滤镜做：地面投影、按原色压暗的挤出厚度、内侧暗边；再用 alpha 遮罩加顶部釉面反光与上沿高光
const OFFICIAL = path.join(path.dirname(fileURLToPath(import.meta.url)), 'official')
function official3d(file, { width = 224, cx = 128, cy = 124, depth = 6, edge = 4, gloss = 0.3, hi = 0.65 } = {}) {
  const text = fs.readFileSync(path.join(OFFICIAL, file), 'utf8')
  const [, vw, vh] = text.replace(/\s+/g, ' ').match(/viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"/)
  const s = width / vw, h = +(vh * s).toFixed(2), x = +(cx - width / 2).toFixed(2), y = +(cy - h / 2).toFixed(2)
  const href = 'data:image/svg+xml;base64,' + Buffer.from(text).toString('base64')
  const img = `<image href="${href}" x="${x}" y="${y}" width="${width}" height="${h}"/>`
  const dim = k => `<feColorMatrix in="SourceGraphic" type="matrix" values="${k} 0 0 0 0  0 ${k} 0 0 0  0 0 ${k} 0 0  0 0 0 1 0"`
  return svg(`<defs>
<filter id="ext" x="-20%" y="-20%" width="140%" height="150%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="5" result="b"/><feOffset in="b" dy="${depth + 6}" result="so"/>
<feFlood flood-color="#000" flood-opacity="0.33"/><feComposite in2="so" operator="in" result="shadow"/>
${depth ? `${dim(0.5)} result="dk1"/><feOffset in="dk1" dy="${depth}" result="e1"/>${dim(0.72)} result="dk2"/><feOffset in="dk2" dy="${depth / 2}" result="e2"/>` : ''}
${edge ? `<feMorphology in="SourceAlpha" operator="erode" radius="${edge}" result="er"/><feGaussianBlur in="er" stdDeviation="1.5" result="erb"/><feComposite in="SourceAlpha" in2="erb" operator="out" result="ring"/><feFlood flood-color="#000" flood-opacity="0.2"/><feComposite in2="ring" operator="in" result="ringD"/>` : ''}
<feMerge><feMergeNode in="shadow"/>${depth ? '<feMergeNode in="e1"/><feMergeNode in="e2"/>' : ''}<feMergeNode in="SourceGraphic"/>${edge ? '<feMergeNode in="ringD"/>' : ''}</feMerge>
</filter>
<filter id="ringF" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="1.6" result="er"/><feOffset in="er" dy="1.4" result="ero"/><feComposite in="SourceAlpha" in2="ero" operator="out"/></filter>
<mask id="am" style="mask-type:alpha">${img}</mask>
<mask id="rm" style="mask-type:alpha"><g filter="url(#ringF)">${img}</g></mask>
${lg('gl', y, y + h * 0.55, [[0, '#fff', gloss], [1, '#fff', 0]])}
${lg('hl', y, y + h * 0.7, [[0, '#fff', hi], [1, '#fff', 0]])}
</defs>
<g filter="url(#ext)">${img}</g>
<rect x="${x}" y="${y}" width="${width}" height="${h}" fill="url(#gl)" mask="url(#am)"/>
<rect x="${x}" y="${y}" width="${width}" height="${h}" fill="url(#hl)" mask="url(#rm)"/>`)
}
files['com.microsoft.office.outlook/opt-G.svg'] = official3d('outlook.svg')
files['com.microsoft.office.word/opt-G.svg'] = official3d('word.svg')
files['com.microsoft.office.excel/opt-G.svg'] = official3d('excel.svg')
files['com.microsoft.office.powerpoint/opt-G.svg'] = official3d('powerpoint.svg')
// To Do：用户要求“直接去背景”——只保留官方对勾 + 一层柔和地面投影，不加厚度
files['com.microsoft.todos/opt-G.svg'] = official3d('todo.svg', { width: 228, cy: 128, depth: 0, edge: 0, gloss: 0, hi: 0 })

for (const [f, body] of Object.entries(files)) {
  const out = path.join(ROOT, f)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, body)
  console.log('wrote', f)
}
