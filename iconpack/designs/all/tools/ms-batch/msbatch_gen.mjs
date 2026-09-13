import fs from "fs";
import path from "path";
const ROOT = "D:/Others-Github/smartisan_icon/iconpack/designs/all";
const TRD = "C:/Users/zyc9/AppData/Local/Temp/claude/D--Others-Github-smartisan-icon/96ad576b-019e-4b24-9b2c-0b5b12824130/scratchpad/mstrace";
// traced original logos (source-pixel coords of a 1024px render of iconpack/phone-icons/<pkg>.svg)
const TR = (n) => ({ d: fs.readFileSync(`${TRD}/${n}.path.txt`, "utf8"), m: JSON.parse(fs.readFileSync(`${TRD}/${n}.meta.json`, "utf8")) });
// place a traced logo: centre (cx,cy), target width; uniform scale keeps the aspect ratio
const place = (t, cx, cy, width, attrs) => {
  const s = width / (t.m.maxx - t.m.minx);
  return `<g transform="translate(${cx} ${cy}) scale(${s.toFixed(5)}) translate(${-t.m.cx} ${-t.m.cy})"><path d="${t.d}" ${attrs}/></g>`;
};
const FLOMO = TR("flomo"), MUBU = TR("mubu");

const TILE = "M27.06 23H228.94C247.74 23 252.94 28.2 252.94 47V208.93C252.94 227.73 247.74 232.93 228.94 232.93H27.06C8.26 232.93 3.06 227.73 3.06 208.93V47C3.06 28.2 8.26 23 27.06 23Z";
const SQUARE = "M39 15H217C235.8 15 241 20.2 241 39V217C241 235.8 235.8 241 217 241H39C20.2 241 15 235.8 15 217V39C15 20.2 20.2 15 39 15Z";
const PORTRAIT = "M47 3.06H208.94C227.74 3.06 232.94 8.26 232.94 27.06V228.94C232.94 247.74 227.74 252.94 208.94 252.94H47C28.2 252.94 23 247.74 23 228.94V27.06C23 8.26 28.2 3.06 47 3.06Z";

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">\n${body}\n</svg>\n`;

const SHADOW = `<filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#000" flood-opacity="0.24"/></filter>
<filter id="shs" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.6" flood-color="#000" flood-opacity="0.28"/></filter>`;

function plate(p, y0, y1, fill = ["#FFFFFF", "#F2F2F2"], rim = ["#C6C6C6", "#CFCFCF", "#DADADA", "#D0D0D0"]) {
  return `<defs>
<path id="tile" d="${p}"/>
<clipPath id="tileClip"><use href="#tile"/></clipPath>
<linearGradient id="tileFill" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${fill[0]}"/><stop offset="1" stop-color="${fill[1]}"/></linearGradient>
<linearGradient id="tileRim" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${rim[0]}"/><stop offset="0.2" stop-color="${rim[1]}"/><stop offset="0.85" stop-color="${rim[2]}"/><stop offset="1" stop-color="${rim[3]}"/></linearGradient>
${SHADOW}
</defs>
<use href="#tile" fill="url(#tileFill)"/>
<g clip-path="url(#tileClip)" fill="none">
<use href="#tile" stroke="#000" stroke-opacity="0.05" stroke-width="5"/>
<use href="#tile" stroke="#000" stroke-opacity="0.07" stroke-width="4" transform="translate(0 -1.5)"/>
<use href="#tile" stroke="#FFFFFF" stroke-width="2" transform="translate(0 1)"/>
<use href="#tile" stroke="url(#tileRim)" stroke-width="2"/>
</g>`;
}
const land = (f, r) => plate(TILE, 23, 233, f, r);
const square = (f, r) => plate(SQUARE, 15, 241, f, r);
const portrait = (f, r) => plate(PORTRAIT, 3, 253, f, r);

function badge(c1, c2, stroke) {
  return `<defs>
<linearGradient id="ring" x1="0" y1="10" x2="0" y2="246" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#E4E4E4"/><stop offset="1" stop-color="#CACACA"/></linearGradient>
<linearGradient id="disk" x1="0" y1="27" x2="0" y2="229" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<linearGradient id="gloss" x1="0" y1="27" x2="0" y2="135" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.42"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<clipPath id="diskClip"><circle cx="128" cy="128" r="101"/></clipPath>
${SHADOW}
</defs>
<circle cx="128" cy="128" r="118" fill="url(#ring)" stroke="#B5B5B5" stroke-width="1.5"/>
<circle cx="128" cy="128" r="116" fill="none" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="1.5"/>
<circle cx="128" cy="129.5" r="103.5" fill="#000" fill-opacity="0.16"/>
<circle cx="128" cy="128" r="101" fill="url(#disk)"/>
<g clip-path="url(#diskClip)">
<circle cx="128" cy="128" r="101" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="5"/>
<ellipse cx="128" cy="62" rx="118" ry="78" fill="url(#gloss)"/>
</g>
<circle cx="128" cy="128" r="101" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;
}

function plaque(x, y, s, c1, c2, glyph) {
  return `<defs><linearGradient id="pl" x1="0" y1="${y}" x2="0" y2="${y + s}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<linearGradient id="plg" x1="0" y1="${y}" x2="0" y2="${y + s * 0.55}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient></defs>
<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="16" fill="url(#pl)"/></g>
<rect x="${x}" y="${y}" width="${s}" height="${s * 0.5}" rx="16" fill="url(#plg)"/>
<rect x="${x + 0.75}" y="${y + 0.75}" width="${s - 1.5}" height="${s - 1.5}" rx="15.25" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.5"/>
<g filter="url(#shs)">${glyph}</g>`;
}

const files = {};
const metas = {};

// ---------------- Outlook ----------------
const envelope = `<defs>
<linearGradient id="evBack" x1="0" y1="64" x2="0" y2="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0B55B8"/><stop offset="1" stop-color="#083A86"/></linearGradient>
<linearGradient id="paper" x1="0" y1="56" x2="0" y2="160" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E7EDF4"/></linearGradient>
<linearGradient id="evFront" x1="0" y1="120" x2="0" y2="192" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#45B4FA"/><stop offset="1" stop-color="#1673DD"/></linearGradient>
<linearGradient id="evFold" x1="0" y1="140" x2="0" y2="192" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2A93F0"/><stop offset="1" stop-color="#0F5FC8"/></linearGradient>
<filter id="evsh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0A2A60" flood-opacity="0.38"/></filter>
<filter id="papsh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1" stdDeviation="2.2" flood-color="#0A2A60" flood-opacity="0.35"/></filter>
<linearGradient id="paperT" x1="0" y1="54" x2="0" y2="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#EAF3FD"/><stop offset="1" stop-color="#C9DBEE"/></linearGradient>
</defs>
<ellipse cx="150" cy="193" rx="78" ry="6" fill="#0A2A60" fill-opacity="0.18"/>
<g filter="url(#evsh)">
<path d="M76 121Q76 113 83 108L141 68Q150 62 159 68L217 108Q224 113 224 121V180Q224 192 212 192H88Q76 192 76 180Z" fill="url(#evBack)"/>
</g>
<g filter="url(#papsh)"><rect x="94" y="54" width="112" height="100" rx="4" fill="url(#paperT)"/></g>
<rect x="94.6" y="54.6" width="110.8" height="98.8" rx="3.4" fill="none" stroke="#6F93BD" stroke-opacity="0.75" stroke-width="1.2"/>
<rect x="95.5" y="55.8" width="109" height="1.4" rx="0.7" fill="#FFFFFF" fill-opacity="0.9"/>
<rect x="108" y="72" width="54" height="7" rx="3.5" fill="#1F7FE0"/>
<rect x="108" y="88" width="84" height="5" rx="2.5" fill="#A9C0D8"/>
<rect x="108" y="101" width="84" height="5" rx="2.5" fill="#A9C0D8"/>
<rect x="108" y="114" width="64" height="5" rx="2.5" fill="#A9C0D8"/>
<path d="M76 123L150 168L224 123V180Q224 192 212 192H88Q76 192 76 180Z" fill="url(#evFront)"/>
<path d="M80 190L150 146L220 190Z" fill="url(#evFold)"/>
<path d="M77 124L150 168.5L223 124" fill="none" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="1.5"/>
<path d="M82 189.5L150 147L218 189.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1.2"/>
<path d="M76.8 121V180Q76.8 191.2 88 191.2H212Q223.2 191.2 223.2 180V121" fill="none" stroke="#062C6B" stroke-opacity="0.55" stroke-width="1.6"/>`;
const o_glyph = '<ellipse cx="77" cy="145" rx="18" ry="22" fill="none" stroke="#FFFFFF" stroke-width="11"/>';
files["com.microsoft.office.outlook/opt-A.svg"] = svg(land() + envelope + plaque(34, 102, 86, "#1C8CF0", "#0A4DAA", o_glyph));
const o_b = `<g filter="url(#sh)">
<path d="M66 102Q66 88 80 88H176Q190 88 190 102V160Q190 174 176 174H80Q66 174 66 160Z" fill="#FFFFFF"/>
</g>
<path d="M70 96L128 136L186 96" fill="none" stroke="#1672D6" stroke-opacity="0.55" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M72 168L114 130M184 168L142 130" fill="none" stroke="#1672D6" stroke-opacity="0.25" stroke-width="4" stroke-linecap="round"/>`;
files["com.microsoft.office.outlook/opt-B.svg"] = svg(badge("#2FA0F6", "#0A4AA6", "#0A3F8C") + o_b);
metas["com.microsoft.office.outlook"] = {
  pkg: "com.microsoft.office.outlook", label: "Outlook",
  references: [
    { pkg: "com.google.android.email", why: "锤子的邮件图标：拆开的信封 + 露出的信纸，沿用其信封拟物造型" },
    { pkg: "com.tencent.androidqqmail", why: "信封放在底板上的构图" },
    { pkg: "com.microsoft.office.officehub", why: "锤子版 Office：品牌色圆盘 + 白色标志，作为微软系 B 方案的统一语言" },
    { pkg: "com.microsoft.emmx", why: "已定稿的 Edge：银色外圈 + 蓝色圆盘，微软家族一致" }],
  options: [
    { id: "A", name: "信封 + O 字铭牌", shape: "landscape", desc: "白色横矩形底板上放一只拆开的蓝色信封，露出信纸；左下角叠一块蓝色 O 字铭牌（经典 Office 做法）。与 Excel/To Do 的 A 方案同一套“物件 + 铭牌”家族语言。修订：加深信封投影和描边，信纸改为淡蓝色并加边线，与白色底板拉开层次。", updated: true },
    { id: "B", name: "银圈蓝盘白信封", shape: "circle", desc: "参照已定稿 Edge 与锤子 Office：银色外圈、蓝色釉面圆盘、白色立体信封。48px 下最干净，但丢掉了 O 字。" }] };

// ---------------- Excel ----------------
const sheet = `<defs>
<linearGradient id="sheet" x1="0" y1="44" x2="0" y2="214" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EEF2EF"/></linearGradient>
<linearGradient id="head" x1="0" y1="44" x2="0" y2="74" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3DBB78"/><stop offset="1" stop-color="#1A8A4E"/></linearGradient>
<clipPath id="sc"><rect x="86" y="44" width="136" height="170" rx="8"/></clipPath>
</defs>
<g filter="url(#sh)"><rect x="86" y="44" width="136" height="170" rx="8" fill="url(#sheet)"/></g>
<g clip-path="url(#sc)">
<rect x="86" y="44" width="136" height="30" fill="url(#head)"/>
<rect x="86" y="74" width="136" height="1.5" fill="#0E6B37" fill-opacity="0.5"/>
<rect x="176" y="98" width="46" height="24" fill="#D5EEDD"/>
<rect x="176" y="146" width="46" height="24" fill="#D5EEDD"/>
<rect x="130" y="122" width="46" height="24" fill="#E6F4EA"/>
<g fill="#C9D6CD"><rect x="86" y="97.5" width="136" height="1.5"/><rect x="86" y="121.5" width="136" height="1.5"/><rect x="86" y="145.5" width="136" height="1.5"/><rect x="86" y="169.5" width="136" height="1.5"/><rect x="86" y="193.5" width="136" height="1.5"/>
<rect x="129.5" y="74" width="1.5" height="140"/><rect x="175.5" y="74" width="1.5" height="140"/></g>
<g fill="#FFFFFF" fill-opacity="0.85"><rect x="140" y="56" width="26" height="6" rx="3"/><rect x="186" y="56" width="26" height="6" rx="3"/></g>
</g>
<rect x="86.75" y="44.75" width="134.5" height="168.5" rx="7.25" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="1.5"/>`;
const x_glyph = '<path d="M55 122H72L77.5 134.5L83 122H100L86 145L100.5 168H83.5L77.5 155L71.5 168H54.5L69 145Z" fill="#FFFFFF"/>';
files["com.microsoft.office.excel/opt-A.svg"] = svg(land() + sheet + plaque(34, 102, 86, "#2BB673", "#0C6634", x_glyph));
const x_b = `<g filter="url(#sh)">
<path d="M120 84H178Q188 84 188 94V162Q188 172 178 172H120Z" fill="#FFFFFF" fill-opacity="0.95"/>
</g>
<g fill="#1A8A4E" fill-opacity="0.45"><rect x="126" y="104" width="56" height="3"/><rect x="126" y="126" width="56" height="3"/><rect x="126" y="148" width="56" height="3"/><rect x="153" y="88" width="3" height="80"/></g>
<g filter="url(#sh)"><path d="M62 90Q62 82 70 82H128Q136 82 136 90V166Q136 174 128 174H70Q62 174 62 166Z" fill="#107C41"/></g>
<path d="M62 90Q62 82 70 82H128Q136 82 136 90V120H62Z" fill="#FFFFFF" fill-opacity="0.12"/>
<path d="M75 102H92.5L99 116.5L105.5 102H123L108 128L123.5 154H106L99 139L92 154H74.5L90 128Z" fill="#FFFFFF"/>`;
files["com.microsoft.office.excel/opt-B.svg"] = svg(badge("#3CC27F", "#0B6A37", "#0A5A2F") + x_b);
metas["com.microsoft.office.excel"] = {
  pkg: "com.microsoft.office.excel", label: "Excel",
  references: [
    { pkg: "cn.wps.moffice", why: "锤子版 WPS：立体字母块表示办公文档，参考其字母铭牌做法" },
    { pkg: "com.microsoft.office.officehub", why: "锤子版 Office：品牌色圆盘 + 白色标志" },
    { pkg: "com.microsoft.emmx", why: "已定稿的 Edge 银圈圆盘，微软家族一致" }],
  options: [
    { id: "A", name: "表格纸 + X 铭牌", shape: "landscape", desc: "白色横矩形底板上放一张带绿色表头和网格的电子表格纸，左下角叠绿色 X 铭牌。与 Outlook/To Do 的 A 方案同一家族。" },
    { id: "B", name: "银圈绿盘 X 标", shape: "circle", desc: "银色外圈 + 绿色釉面圆盘，中间是 Excel 经典构图：深绿 X 方块压在白色表格上。与 Outlook/To Do 的 B 方案同一家族。" }] };

// ---------------- To Do ----------------
const todo_sheet = `<defs>
<linearGradient id="sheet" x1="0" y1="44" x2="0" y2="214" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EDF1F6"/></linearGradient>
<linearGradient id="dot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FB0F5"/><stop offset="1" stop-color="#1D63CC"/></linearGradient>
</defs>
<g filter="url(#sh)"><rect x="86" y="44" width="136" height="170" rx="8" fill="url(#sheet)"/></g>
<rect x="86.75" y="44.75" width="134.5" height="168.5" rx="7.25" fill="none" stroke="#000" stroke-opacity="0.1" stroke-width="1.5"/>
<rect x="104" y="58" width="60" height="9" rx="4.5" fill="#2564CF"/>
<circle cx="115" cy="92" r="9" fill="url(#dot)"/><path d="M110.5 92.5L114 96L119.5 88.5" fill="none" stroke="#FFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="132" y="89.5" width="72" height="5" rx="2.5" fill="#B9C6D6"/><rect x="132" y="91" width="72" height="2" fill="#8193A8"/>
<circle cx="115" cy="122" r="9" fill="url(#dot)"/><path d="M110.5 122.5L114 126L119.5 118.5" fill="none" stroke="#FFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="132" y="119.5" width="60" height="5" rx="2.5" fill="#B9C6D6"/><rect x="132" y="121" width="60" height="2" fill="#8193A8"/>
<circle cx="115" cy="152" r="8" fill="none" stroke="#8FA6C2" stroke-width="2.2"/>
<rect x="132" y="149.5" width="72" height="5" rx="2.5" fill="#B9C6D6"/>
<circle cx="115" cy="182" r="8" fill="none" stroke="#8FA6C2" stroke-width="2.2"/>
<rect x="132" y="179.5" width="50" height="5" rx="2.5" fill="#B9C6D6"/>`;
const check_glyph = '<path d="M55 147L71 163L100 131" fill="none" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>';
files["com.microsoft.todos/opt-A.svg"] = svg(land() + todo_sheet + plaque(34, 102, 86, "#3C9AF2", "#1646B0", check_glyph));
const todo_b = `<g filter="url(#sh)">
<path d="M73.5 131.5L94.7 110.3Q99 106 103.2 110.3L127.3 134.3L106 155.6Q101.8 159.8 97.6 155.6Z" fill="#CFE3FA"/>
<path d="M97.6 155.6Q93.4 151.4 97.6 147.2L163.6 81.2Q167.8 77 172 81.2L185.4 94.6Q189.6 98.8 185.4 103L119.4 169Q115.2 173.2 111 169Z" fill="#FFFFFF"/>
</g>`;
files["com.microsoft.todos/opt-B.svg"] = svg(badge("#46A9F4", "#1747B3", "#133F9C") + todo_b);
metas["com.microsoft.todos"] = {
  pkg: "com.microsoft.todos", label: "To Do",
  references: [
    { pkg: "cn.ticktick.task", why: "锤子版滴答清单：立体对勾，参考对勾的体量与光影" },
    { pkg: "com.todoist", why: "白色底板 + 品牌色标志的待办类图标" },
    { pkg: "com.microsoft.office.officehub", why: "品牌色圆盘 + 白色标志，微软家族 B 方案统一语言" }],
  options: [
    { id: "A", name: "清单纸 + 对勾铭牌", shape: "landscape", desc: "白色横矩形底板上放一张待办清单（两项已勾选、两项未完成），左下角叠蓝色对勾铭牌。与 Outlook/Excel 的 A 方案同一家族。" },
    { id: "B", name: "银圈蓝盘双色对勾", shape: "circle", desc: "银色外圈 + 蓝色釉面圆盘，中间是 To Do 标志性的双段对勾（短段浅蓝、长段白色），最忠于品牌标志。" }] };

// ---------------- Copilot ----------------
const cp_defs = `<defs>
<radialGradient id="c0" gradientUnits="userSpaceOnUse" cx="82" cy="-41.5" r="127.46"><stop offset="0.66" stop-color="#109DF2"/><stop offset="0.88" stop-color="#AAD445"/><stop offset="0.99" stop-color="#FFD400"/></radialGradient>
<linearGradient id="c1" gradientUnits="userSpaceOnUse" x1="41.64" y1="24" x2="41.39" y2="69"><stop offset="0" stop-color="#3DCBFF"/><stop offset="0.25" stop-color="#0588F7" stop-opacity="0"/></linearGradient>
<radialGradient id="c2" gradientUnits="userSpaceOnUse" cx="78.52" cy="34.59" r="59.92"><stop offset="0.07" stop-color="#8C48FF"/><stop offset="0.5" stop-color="#F2598A"/><stop offset="0.9" stop-color="#FFB152"/></radialGradient>
<linearGradient id="c3" gradientUnits="userSpaceOnUse" x1="80.53" y1="36.25" x2="80.51" y2="48.51"><stop offset="0.06" stop-color="#F8ADFA"/><stop offset="0.71" stop-color="#A86EDD" stop-opacity="0"/></linearGradient>
<linearGradient id="cg1" gradientUnits="userSpaceOnUse" x1="0" y1="24" x2="0" y2="50"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<linearGradient id="cg2" gradientUnits="userSpaceOnUse" x1="0" y1="39" x2="0" y2="64"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<path id="cpA" d="M65.39,36.42L64.75,39H58.56C53.97,39 49.97,42.12 48.86,46.57L43.25,69H32.06C25.55,69 20.78,62.89 22.36,56.57L27.98,34.1C29.46,28.16 34.79,24 40.91,24H55.69C62.2,24 66.97,30.11 65.39,36.42Z"/>
<path id="cpB" d="M42.61,71.57L43.25,69H49.44C54.03,69 58.03,65.88 59.14,61.42L64.75,39H75.94C82.45,39 87.22,45.11 85.64,51.42L80.02,73.9C78.54,79.84 73.21,84 67.09,84H52.31C45.8,84 41.03,77.89 42.61,71.57Z"/>
<clipPath id="clA"><use href="#cpA"/></clipPath><clipPath id="clB"><use href="#cpB"/></clipPath>
</defs>`;
function copilot(scale, cy = 128, sw = 0.6) {
  return `<g transform="translate(128 ${cy}) scale(${scale}) translate(-54 -54)">
<g filter="url(#sh)"><use href="#cpA" fill="url(#c0)"/><use href="#cpB" fill="url(#c2)"/></g>
<use href="#cpA" fill="url(#c1)"/><use href="#cpB" fill="url(#c3)"/>
<g clip-path="url(#clA)"><use href="#cpA" fill="url(#cg1)"/><use href="#cpA" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="${sw}" transform="translate(0 0.5)"/><use href="#cpA" fill="none" stroke="#003A7A" stroke-opacity="0.25" stroke-width="${sw * 2}" transform="translate(0 -0.6)"/></g>
<g clip-path="url(#clB)"><use href="#cpB" fill="url(#cg2)"/><use href="#cpB" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="${sw}" transform="translate(0 0.5)"/><use href="#cpB" fill="none" stroke="#7A1F3A" stroke-opacity="0.25" stroke-width="${sw * 2}" transform="translate(0 -0.6)"/></g>
</g>`;
}
files["com.microsoft.office.officehubrow/opt-A.svg"] = svg(land() + cp_defs + copilot(2.35));
files["com.microsoft.office.officehubrow/opt-B.svg"] = svg(badge("#2B3A63", "#0B1024", "#070B1A") + cp_defs + copilot(1.9, 128, 0.8));
metas["com.microsoft.office.officehubrow"] = {
  pkg: "com.microsoft.office.officehubrow", label: "Copilot",
  references: [
    { pkg: "com.microsoft.office.officehub", why: "该应用前身是 Office，锤子版为橙色圆盘；B 方案沿用圆盘结构" },
    { pkg: "com.microsoft.emmx", why: "已定稿的 Edge 银圈圆盘，微软家族一致" },
    { pkg: "com.openai.chatgpt", why: "已定稿的 AI 应用：标志本身做成有厚度的立体物件" }],
  options: [
    { id: "A", name: "白底板彩色玻璃标", shape: "landscape", desc: "白色横矩形底板上放两块彩色釉面玻璃（Copilot 双片标志），带顶部高光与投影。颜色最忠实，与微软 A 方案的白底板家族统一。" },
    { id: "B", name: "银圈深蓝盘发光标", shape: "circle", desc: "银色外圈 + 深藏青釉面圆盘，彩色标志在暗底上更亮更“AI”。与 Outlook/Excel/To Do 的 B 方案同一家族（仅圆盘颜色不同）。" }] };

// ---------------- Authenticator ----------------
const AU_BODY = "M86.8265,41.8807A16.6471,16.6471 0,0 0,72.5616 25.4059c-0.4018,-0.1005 -0.7032,-0.1005 -1.105,-0.201a174.6749,174.6749 0,0 0,-46.9132 0c-0.4018,0.1005 -0.8037,0.1005 -1.1051,0.201A16.5712,16.5712 0,0 0,9.1735 41.8807c0.1,14.2649 4.621,36.0639 28.2283,50.7306a19.9654,19.9654 0,0 0,21.0959 0C82.306,78.0451 86.8265,56.246 86.8265,41.8807Z";
const AU_SHACKLE = "M24.5068,25.7267c0.381,-0.1 0.6667,-0.1 1.0478,-0.2 2.19,-0.2994 4.3808,-0.5989 6.5713,-0.7985a16.6314,16.6314 0,0 1,16 -13.2747,16.6313 16.6313,0 0,1 16,13.2747c2.1905,0.2 4.3809,0.4991 6.5715,0.7985 0.381,0.1 0.7618,0.1 1.0476,0.2a21.7169,21.7169 0,0 1,3.4285 0.8983c-1,-15.649 -12.7619,-26.25 -27.0476,-26.25S22.1735,10.976 21.1735,26.625A18.3046,18.3046 0,0 1,24.5068 25.7267Z";
function auth(scale, cy, body_fill, shackle_fill, person, rim, extra_defs = "") {
  return `<defs>
<path id="auB" d="${AU_BODY}"/><path id="auS" d="${AU_SHACKLE}"/>
<clipPath id="auClip"><use href="#auB"/></clipPath>
<linearGradient id="auG" gradientUnits="userSpaceOnUse" x1="0" y1="23" x2="0" y2="60"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.45"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
${extra_defs}
</defs>
<g transform="translate(128 ${cy}) scale(${scale}) translate(-48 -48)">
<g filter="url(#sh)"><use href="#auS" fill="${shackle_fill}"/><use href="#auB" fill="${body_fill}"/></g>
<g clip-path="url(#auClip)">
<g filter="url(#shs)">${person}</g>
<rect x="0" y="23" width="96" height="30" fill="url(#auG)"/>
<use href="#auB" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="1" transform="translate(0 0.6)"/>
<use href="#auB" fill="none" stroke="${rim}" stroke-opacity="0.6" stroke-width="2"/>
</g>
<use href="#auS" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="0.5"/>
</g>`;
}
const au_defs_A = `<linearGradient id="bodyA" gradientUnits="userSpaceOnUse" x1="0" y1="23" x2="0" y2="96"><stop offset="0" stop-color="#1E90F2"/><stop offset="1" stop-color="#0B4598"/></linearGradient>
<linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="21" y1="0" x2="75" y2="0"><stop offset="0" stop-color="#8E98A3"/><stop offset="0.3" stop-color="#F4F6F8"/><stop offset="0.55" stop-color="#B7BEC6"/><stop offset="0.8" stop-color="#EEF1F4"/><stop offset="1" stop-color="#7F8994"/></linearGradient>
<linearGradient id="skin" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="95"><stop offset="0" stop-color="#8FE0FF"/><stop offset="1" stop-color="#139AE8"/></linearGradient>`;
const person_A = '<circle cx="48.35" cy="44.72" r="14.6" fill="url(#skin)"/><circle cx="48.35" cy="88.4" r="25.6" fill="url(#skin)"/>';
files["com.azure.authenticator/opt-A.svg"] = svg(land() + auth(1.95, 131, "url(#bodyA)", "url(#metal)", person_A, "#062F6E", au_defs_A));
const au_defs_B = `<linearGradient id="white" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="96"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3ECF6"/></linearGradient>
<linearGradient id="blueP" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="95"><stop offset="0" stop-color="#2E9BF0"/><stop offset="1" stop-color="#0B4FAE"/></linearGradient>`;
const person_B = '<circle cx="48.35" cy="44.72" r="14.6" fill="url(#blueP)"/><circle cx="48.35" cy="88.4" r="25.6" fill="url(#blueP)"/>';
files["com.azure.authenticator/opt-B.svg"] = svg(badge("#2FA0F6", "#0A4AA6", "#0A3F8C") + auth(1.34, 130, "url(#white)", "url(#white)", person_B, "#9FB6D0", au_defs_B));
const au_defs_C = `<linearGradient id="steel" gradientUnits="userSpaceOnUse" x1="9" y1="23" x2="87" y2="96"><stop offset="0" stop-color="#F7F8F9"/><stop offset="0.35" stop-color="#C9CED4"/><stop offset="0.6" stop-color="#EEF0F2"/><stop offset="1" stop-color="#9AA2AB"/></linearGradient>
<linearGradient id="metal" gradientUnits="userSpaceOnUse" x1="21" y1="0" x2="75" y2="0"><stop offset="0" stop-color="#7E8893"/><stop offset="0.3" stop-color="#F4F6F8"/><stop offset="0.55" stop-color="#AEB5BD"/><stop offset="0.8" stop-color="#EEF1F4"/><stop offset="1" stop-color="#737D88"/></linearGradient>
<linearGradient id="enamel" gradientUnits="userSpaceOnUse" x1="0" y1="30" x2="0" y2="95"><stop offset="0" stop-color="#3BB2F8"/><stop offset="1" stop-color="#0A4FAE"/></linearGradient>
<radialGradient id="rivet" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#8C959F"/></radialGradient>`;
const person_C = `<path d="M16 42.5A10 10 0 0 1 24.5 32.6Q48 29 71.5 32.6A10 10 0 0 1 80 42.5C79.9 55 76 73 55.5 86.2A13 13 0 0 1 41.2 86.2C20 73 16.1 55 16 42.5Z" fill="#9AA2AB" fill-opacity="0.55"/>
<path d="M16.8 43A10 10 0 0 1 25 33.4Q48 30 71 33.4A10 10 0 0 1 79.2 43C79 55 75.2 72.5 55 85.5A12.4 12.4 0 0 1 41.7 85.5C21 72.5 17 55 16.8 43Z" fill="url(#enamel)"/>
<circle cx="48.35" cy="46" r="10.8" fill="#FFFFFF"/><path d="M29.5 80A19 19 0 0 1 67.2 80Q62 84 55 86A12.4 12.4 0 0 1 41.7 86Q35 84 29.5 80Z" fill="#FFFFFF"/>
<circle cx="15" cy="31.5" r="1.7" fill="url(#rivet)"/><circle cx="81.7" cy="31.5" r="1.7" fill="url(#rivet)"/><circle cx="48.35" cy="91.5" r="1.7" fill="url(#rivet)"/>`;
files["com.azure.authenticator/opt-C.svg"] = svg(`<defs>${SHADOW}</defs>` + auth(2.3, 129, "url(#steel)", "url(#metal)", person_C, "#5E6770", au_defs_C));
metas["com.azure.authenticator"] = {
  pkg: "com.azure.authenticator", label: "Authenticator",
  references: [
    { pkg: "com.google.android.apps.authenticator2", why: "锤子版 Google 身份验证器：拉丝金属 + 铆钉，C 方案直接参考" },
    { pkg: "com.agilebits.onepassword", why: "锤子版 1Password：金属锁芯 + 蓝色外圈，参考金属与蓝色搭配" },
    { pkg: "com.microsoft.emmx", why: "已定稿的 Edge 银圈圆盘，微软家族 B 方案" }],
  options: [
    { id: "A", name: "蓝色盾锁 + 金属锁梁", shape: "landscape", desc: "白色横矩形底板上放一把盾形挂锁：蓝色釉面锁身、镀铬金属锁梁、浅蓝人像。标志形状照搬官方路径，与微软 A 家族统一。" },
    { id: "B", name: "银圈蓝盘白色锁", shape: "circle", desc: "银色外圈 + 蓝色圆盘，中间白色盾锁、蓝色人像，与 Outlook/To Do 的 B 方案同色同构。" },
    { id: "C", name: "拉丝钢锁（无底板）", shape: "free", desc: "参考锤子版 Google 身份验证器：整把锁做成拉丝不锈钢物件，嵌蓝色珐琅人像徽章和铆钉。最有锤子味，但与微软家族关系弱一些。" }] };

// ---------------- Notion ----------------
const N_PATH = "M273.5,187c0.7,3.2 0,6.3 -3.2,6.7l-5.3,1L265,272a27.3,27.3 0,0 1,-12.2 3.9c-5.6,0 -7,-1.8 -11.2,-7l-34.4,-54L207.2,267l10.9,2.5s0,6.3 -8.8,6.3l-24.2,1.4c-0.7,-1.4 0,-5 2.5,-5.6l6.3,-1.8v-69l-8.8,-0.7c-0.7,-3.2 1,-7.7 6,-8l26,-1.8 35.7,54.6v-48.3l-9.1,-1c-0.7,-4 2,-6.7 5.6,-7l24.2,-1.5Z";
const NOTION_FULL = "m240.9,127.2 l-100,7.4c-8,0.7 -10.8,6 -10.8,12.3L130.1,256c0,5 1.8,9.1 6,14.8l23.4,30.4c4,5 7.4,6 14.8,5.6l116,-7c9.8,-0.7 12.6,-5.2 12.6,-13L302.9,164c0,-4 -1.6,-5.1 -6.2,-8.5l-0.8,-0.6 -32,-22.4c-7.6,-5.6 -10.8,-6.3 -23,-5.3ZM176.9,162c-9.5,0.6 -11.6,0.8 -17,-3.6l-13.7,-10.8c-1.4,-1.4 -0.7,-3.2 2.8,-3.5l96,-7c8.1,-0.8 12.3,2 15.5,4.5l16.5,12c0.7,0.3 2.4,2.4 0.3,2.4l-99.2,6L177,162ZM165.9,286L165.9,181.4c0,-4.5 1.4,-6.6 5.6,-7l113.9,-6.6c3.8,-0.4 5.6,2 5.6,6.6v103.7c0,4.6 -0.7,8.4 -7,8.8l-109,6.3c-6.3,0.3 -9.1,-1.8 -9.1,-7.4Z" + N_PATH;
const notion_A = `<defs>${SHADOW}
<linearGradient id="face" x1="0" y1="70" x2="0" y2="222" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#ECEAE6"/></linearGradient>
<linearGradient id="top" x1="30" y1="30" x2="220" y2="80" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4A4A4A"/><stop offset="1" stop-color="#1E1E1E"/></linearGradient>
<linearGradient id="side" x1="0" y1="50" x2="0" y2="232" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2A2A2A"/><stop offset="1" stop-color="#050505"/></linearGradient>
<linearGradient id="frame" x1="0" y1="54" x2="0" y2="238" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#262626"/><stop offset="1" stop-color="#0A0A0A"/></linearGradient>
<filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<ellipse cx="124" cy="240" rx="92" ry="7" fill="#000" fill-opacity="0.22" filter="url(#blur)"/>
<path d="M52 60L26 34H198L224 60Z" fill="url(#top)"/>
<path d="M30 35.5H197" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2"/>
<path d="M52 60L26 34V208L52 234Z" fill="url(#side)"/>
<path d="M27.5 36V207" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="1.5"/>
<rect x="50" y="58" width="174" height="176" rx="3" fill="url(#frame)"/>
<rect x="50" y="58" width="174" height="176" rx="3" fill="none" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="1.5"/>
<rect x="66" y="74" width="142" height="144" rx="2" fill="url(#face)"/>
<rect x="66" y="74" width="142" height="4" fill="#000" fill-opacity="0.12"/>
<g filter="url(#shs)"><g transform="translate(137 146) scale(1.2) translate(-229 -229)"><path d="${N_PATH}" fill="#111"/></g></g>`;
files["notion.id/opt-A.svg"] = svg(notion_A);
const notion_B = square(["#FCFBF8", "#EEEBE4"], ["#C4C0B8", "#CECAC2", "#D8D4CC", "#CCC8C0"]) + `<defs>
<linearGradient id="ink" x1="0" y1="120" x2="0" y2="310" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2B2B2B"/><stop offset="1" stop-color="#000"/></linearGradient></defs>
<g transform="translate(128 128) scale(0.98) translate(-216.5 -217)"><path d="${NOTION_FULL}" fill="#FFFFFF" transform="translate(0 2)"/><path d="${NOTION_FULL}" fill="url(#ink)"/></g>`;
files["notion.id/opt-B.svg"] = svg(notion_B);
metas["notion.id"] = {
  pkg: "notion.id", label: "Notion",
  references: [
    { pkg: "com.evernote", why: "锤子版印象笔记：把品牌标志放在真实物件（笔记本）上" },
    { pkg: "com.todoist", why: "锤子里浅色底板 + 深色品牌标志的简洁做法" }],
  options: [
    { id: "A", name: "立体方块", shape: "free", desc: "把 Notion 标志里的方块真正做成立体木块：顶面与侧面黑色烤漆、正面白色瓷片印黑色衬线 N，底部有落地阴影。辨识度高、有物件感。" },
    { id: "B", name: "米白方瓷砖印标", shape: "square", desc: "米白色方形瓷砖底板，原版 Notion 方块标志以墨色压印在上面（下缘一道白色压印高光）。最忠实原标志，风格更克制。" }] };

// ---------------- Evernote-style cloth notebook (shared) ----------------
const BOOK = "M44 8H212C221 8 226 13 226 22V234C226 243 221 248 212 248H44C35 248 30 243 30 234V22C30 13 35 8 44 8Z";
function book(c1, c2, texDark, texLight, logo, extra = "") {
  return `<defs>${SHADOW}
<path id="book" d="${BOOK}"/>
<clipPath id="bookClip"><use href="#book"/></clipPath>
<linearGradient id="bookFill" x1="0" y1="8" x2="0" y2="248" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<linearGradient id="spineG" x1="30" y1="0" x2="50" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity="0.30"/><stop offset="0.6" stop-color="#000" stop-opacity="0.10"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
<linearGradient id="sheen" x1="0" y1="8" x2="0" y2="130" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<filter id="texD" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -0.7"/></filter>
<filter id="texL" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="21"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.8 -0.75"/></filter>
</defs>
<use href="#book" fill="url(#bookFill)"/>
<g clip-path="url(#bookClip)">
<rect x="0" y="0" width="256" height="256" filter="url(#texD)" opacity="${texDark}"/>
<rect x="0" y="0" width="256" height="256" filter="url(#texL)" opacity="${texLight}"/>
<rect x="0" y="0" width="256" height="130" fill="url(#sheen)"/>
<rect x="30" y="0" width="20" height="256" fill="url(#spineG)"/>
<rect x="50" y="0" width="1.6" height="256" fill="#000" fill-opacity="0.35"/>
<rect x="51.6" y="0" width="1.2" height="256" fill="#FFFFFF" fill-opacity="0.22"/>
${extra}
<use href="#book" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="2" transform="translate(0 1.2)"/>
<use href="#book" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="3" transform="translate(0 -1.5)"/>
<use href="#book" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="2"/>
</g>
${logo}`;
}
const nLogo = (fill, under, underOp, dy) => `<g transform="translate(138 128) scale(0.7) translate(-216.5 -217)"><path d="${NOTION_FULL}" fill="${under}" fill-opacity="${underOp}" transform="translate(0 ${dy})"/><path d="${NOTION_FULL}" fill="${fill}"/></g>`;
files["notion.id/opt-C.svg"] = svg(book("#F1EFEA", "#D8D4CB", 0.16, 0.25,
  nLogo("#141414", "#FFFFFF", 0.7, 2.2)));
files["notion.id/opt-D.svg"] = svg(book("#3C3C3C", "#141414", 0.35, 0.10,
  `<defs><linearGradient id="foil" x1="0" y1="127" x2="0" y2="307" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FAFAFA"/><stop offset="0.5" stop-color="#C9C9C9"/><stop offset="1" stop-color="#9C9C9C"/></linearGradient></defs>` +
  nLogo("url(#foil)", "#000", 0.6, -1.8)));
metas["notion.id"].options.push(
  { id: "C", name: "米白布面笔记本", shape: "free", desc: "参考锤子版印象笔记：竖版布面精装本（细密布纹、左侧书脊压线、圆角包边），封面压印原版 Notion 方块标志（黑色，下缘一道白色压印高光）。与印象笔记同一“笔记本”造型。", updated: true },
  { id: "D", name: "黑色皮面烫银笔记本", shape: "free", desc: "同 C 的印象笔记式精装本，改为黑色皮面，原版 Notion 标志以银色烫印（黑色部分变银色，方块面露出黑色封面，呈反白效果）。更高级，但标志明暗与原版相反。", updated: true });

// ---------------- 幕布 ----------------
function mubu(fill, cx = 128, cy = 128, s = 1.0) {
  const bell = (x) => `<circle cx="${x}" cy="-44" r="19"/><circle cx="${x}" cy="44" r="19"/><path d="M${x - 12} -34C${x - 3} -16 ${x - 3} 16 ${x - 12} 34H${x + 12}C${x + 3} 16 ${x + 3} -16 ${x + 12} -34Z"/>`;
  return `<g transform="translate(${cx} ${cy}) scale(${s})" fill="${fill}">${bell(-54)}<circle cx="0" cy="0" r="17"/>${bell(54)}</g>`;
}
const mubu_A = land() + `<defs>
<linearGradient id="lac" x1="0" y1="60" x2="0" y2="196" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4A4A4A"/><stop offset="0.5" stop-color="#1A1A1A"/><stop offset="1" stop-color="#000"/></linearGradient>
<linearGradient id="hi" x1="0" y1="60" x2="0" y2="130" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="0.6" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<mask id="mc" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">${mubu("#FFFFFF")}</mask>
</defs><g filter="url(#sh)"><rect width="256" height="256" fill="url(#lac)" mask="url(#mc)"/></g><rect width="256" height="256" fill="url(#hi)" mask="url(#mc)"/>`;
files["com.mubu.app/opt-A.svg"] = svg(mubu_A);
const mubu_B = badge("#3A3A3A", "#050505", "#000") + `<defs><linearGradient id="wh" x1="0" y1="70" x2="0" y2="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCDCDC"/></linearGradient></defs><g filter="url(#sh)">${mubu("url(#wh)", 128, 128, 0.8)}</g>`;
files["com.mubu.app/opt-B.svg"] = svg(mubu_B);
metas["com.mubu.app"] = {
  pkg: "com.mubu.app", label: "幕布",
  references: [
    { pkg: "com.todoist", why: "效率类工具：白色底板 + 品牌标志的做法" },
    { pkg: "com.netease.cloudmusic", why: "锤子圆形徽章类图标的釉面圆盘" }],
  options: [
    { id: "A", name: "白底板黑漆标志", shape: "landscape", desc: "白色横矩形底板上放幕布标志（两只哑铃形 + 中间圆点），做成黑色钢琴烤漆、顶部带高光。忠实原标志，干净。" },
    { id: "B", name: "银圈黑盘白标", shape: "circle", desc: "银色外圈 + 黑色釉面圆盘，白色立体标志反白。更醒目，但与原图标的白底反差较大。" }] };

// 幕布 C: outline note paper (portrait)
const outlineRows = (() => {
  const rows = [[0, 160, 120], [1, 182, 96], [1, 204, 108], [0, 226, 84]];
  let s = '<rect x="49" y="168" width="1.6" height="36" fill="#C8CDD3"/>';
  for (const [lvl, y, w] of rows) {
    const bx = 50 + lvl * 22;
    s += `<circle cx="${bx}" cy="${y}" r="${lvl ? 3.6 : 4.6}" fill="${lvl ? "#6B7280" : "#1A1A1A"}"/>`;
    s += `<rect x="${bx + 12}" y="${y - 3}" width="${w}" height="6" rx="3" fill="${lvl ? "#C4CAD2" : "#9AA3AE"}"/>`;
  }
  return s;
})();
files["com.mubu.app/opt-C.svg"] = svg(portrait(["#FFFFFF", "#F1F2F4"]) + `<defs>
<linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3A3A"/><stop offset="1" stop-color="#050505"/></linearGradient></defs>
<g filter="url(#shs)">${place(MUBU, 128, 80, 96, 'fill="url(#ink)"')}</g>
<rect x="44" y="134" width="168" height="1.5" fill="#DADDE2"/>
${outlineRows}`);
files["com.mubu.app/opt-D.svg"] = svg(book("#3A3A3A", "#111111", 0.35, 0.08,
  `<defs><linearGradient id="emb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#CFCFCF"/></linearGradient></defs>
<g transform="translate(0 -1.5)">${place(MUBU, 124, 128, 104, 'fill="#000" fill-opacity="0.6"')}</g>
<g>${place(MUBU, 124, 128, 104, 'fill="url(#emb)"')}</g>`,
  `<rect x="192" y="0" width="11" height="256" fill="#0A0A0A"/><rect x="192" y="0" width="1.2" height="256" fill="#FFFFFF" fill-opacity="0.25"/><rect x="203" y="0" width="2" height="256" fill="#000" fill-opacity="0.35"/>`));
metas["com.mubu.app"].references.push(
  { pkg: "com.evernote", why: "锤子版印象笔记：布面精装笔记本造型，D 方案参考" },
  { pkg: "com.smartisan.notes", why: "锤子便签：纸张 + 书写内容的笔记隐喻，C 方案参考" });
metas["com.mubu.app"].options.push(
  { id: "C", name: "大纲笔记纸", shape: "portrait", desc: "竖版白色笔记纸：上半部是原版幕布标志（从原图标描摹，比例不变），分隔线下是带层级缩进和引导线的大纲条目，点明“大纲笔记”的用途。", updated: true },
  { id: "D", name: "黑色布面笔记本", shape: "free", desc: "参考锤子版印象笔记的精装本造型：黑色布纹封面、左侧书脊压线、右侧黑色松紧带，封面中央压印白色幕布原版标志。", updated: true });

// ---------------- flomo ----------------
function flomo(fill, tx = 0, ty = 0, s = 1.0) {
  return `<g transform="translate(${128 + tx} ${128 + ty}) scale(${s}) translate(-138 -124)" fill="${fill}">` +
    '<path d="M98 110A36 36 0 1 1 98 182A36 36 0 1 1 98 110ZM98 133A13 13 0 1 0 98 159A13 13 0 1 0 98 133Z" fill-rule="evenodd"/>' +
    '<rect x="114" y="110" width="21" height="38"/>' +
    '<path d="M117 102H198L184 123H103Z"/>' +
    '<path d="M138 66H218L204 87H124Z"/></g>';
}
const flomo_A = land() + `<defs>
<linearGradient id="fg" x1="0" y1="56" x2="0" y2="196" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#36D27E"/><stop offset="1" stop-color="#149E54"/></linearGradient>
<linearGradient id="fh" x1="0" y1="56" x2="0" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<mask id="fc" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">${flomo("#FFFFFF", 0, 0, 1.08)}</mask>
</defs><g filter="url(#sh)"><rect width="256" height="256" fill="url(#fg)" mask="url(#fc)"/></g><rect width="256" height="256" fill="url(#fh)" mask="url(#fc)"/>`;
files["com.flomo.app/opt-A.svg"] = svg(flomo_A);
let lines = "";
for (let y = 64; y < 250; y += 22) lines += `<rect x="23" y="${y}" width="210" height="1.5" fill="#E3D6B8"/>`;
const flomo_B = portrait(["#FFFDF5", "#F2EBD8"], ["#C9BFA6", "#D2C8AF", "#DCD3BC", "#CFC5AC"]) + `<defs>
<linearGradient id="fg" x1="0" y1="66" x2="0" y2="182" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3ED685"/><stop offset="1" stop-color="#16A057"/></linearGradient>
<linearGradient id="rib" x1="0" y1="3" x2="0" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2FC173"/><stop offset="1" stop-color="#138A4A"/></linearGradient>
</defs>
<g clip-path="url(#tileClip)">${lines}<rect x="54" y="3" width="1.5" height="250" fill="#E9B8A8"/></g>
<g filter="url(#sh)"><path d="M180 3H204V58L192 49L180 58Z" fill="url(#rib)"/></g>
<linearGradient id="fgb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ED685"/><stop offset="1" stop-color="#16A057"/></linearGradient>
<g filter="url(#shs)">${place(FLOMO, 132, 140, 162, 'fill="url(#fgb)"')}</g>`;
files["com.flomo.app/opt-B.svg"] = svg(flomo_B);
metas["com.flomo.app"] = {
  pkg: "com.flomo.app", label: "flomo浮墨笔记",
  references: [
    { pkg: "com.smartisan.notes", why: "锤子便签：带横线的纸张，B 方案的纸质隐喻来源" },
    { pkg: "com.meizu.notepaper", why: "竖版横线便签纸造型" }],
  options: [
    { id: "A", name: "白底板绿色釉标", shape: "landscape", desc: "白色横矩形底板上放 flomo 的绿色 f 形标志，做成绿色釉面立体件，顶部高光。最接近原图标，干净易认。" },
    { id: "B", name: "横线便签纸 + 书签", shape: "portrait", desc: "竖版米色横线便签纸（参考锤子便签），右上角绿色书签丝带，中央印绿色 flomo 标志。标志已改为从原图标描摹的矢量图形（形状与比例与原图一致）。", updated: true }] };

const only = process.argv[2];
for (const [rel, content] of Object.entries(files)) {
  if (only && !rel.startsWith(only)) continue;
  const p = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
}
for (const [pkg, m] of Object.entries(metas)) {
  if (only && pkg !== only) continue;
  fs.writeFileSync(path.join(ROOT, pkg, "meta.json"), JSON.stringify(m, null, 2) + "\n", "utf8");
}
console.log("ok", Object.keys(files).length);
