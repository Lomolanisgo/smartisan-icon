// 汇总 iconpack/designs/all/<包名>/meta.json，生成选择页 index.html
// 用法：node iconpack/designs/all/build-page.mjs
import { readFile, writeFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const apps = JSON.parse(await readFile(path.join(here, 'apps.json'), 'utf8'))
const exists = f => stat(f).then(() => true, () => false)

const entries = []
const missing = []
for (const app of apps) {
  const dir = path.join(here, app.pkg)
  let meta = null
  try {
    meta = JSON.parse(await readFile(path.join(dir, 'meta.json'), 'utf8'))
  } catch {}
  if (!meta) { missing.push(app); continue }
  const options = []
  for (const o of meta.options ?? []) {
    if (await exists(path.join(dir, `opt-${o.id}.png`))) options.push(o)
  }
  // 兜底：meta 里没写但目录里有的方案
  for (const f of (await readdir(dir)).filter(f => /^opt-[A-Z]\.png$/.test(f)).sort()) {
    const id = f[4]
    if (!options.some(o => o.id === id)) options.push({ id, name: `方案 ${id}`, shape: '', desc: '' })
  }
  const refs = []
  for (const r of meta.references ?? []) {
    refs.push({ ...r, has: await exists(path.join(here, '..', '..', 'png', `${r.pkg}.png`)) })
  }
  entries.push({ ...app, label: meta.label || app.label, refs, options })
}

const data = JSON.stringify({ entries, missing: missing.map(a => ({ pkg: a.pkg, label: a.label })) })
const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>锤子风格图标 · 全部方案</title>
<style>
  :root { --bg:#f2f1ee; --card:#fff; --line:#e3e1dc; --mute:#777; --accent:#d9534f; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:#222; font:14px/1.6 system-ui,"Microsoft YaHei",sans-serif; padding:20px 20px 170px; }
  h1 { font-size:22px; margin:0 0 4px; }
  .sub { color:var(--mute); margin:0 0 12px; }
  .tools { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:0 0 16px; position:sticky; top:0; background:var(--bg); padding:8px 0; z-index:5; }
  .tools input { padding:6px 10px; border:1px solid var(--line); border-radius:8px; min-width:220px; font:inherit; }
  .tools button { padding:6px 12px; border:1px solid var(--line); background:#fff; border-radius:8px; cursor:pointer; font:inherit; }
  .tools button[aria-pressed=true] { background:#222; color:#fff; border-color:#222; }
  section { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:14px 16px; margin:0 0 14px; }
  section.done { border-color:#9bd29b; }
  .head { display:flex; flex-wrap:wrap; gap:8px 14px; align-items:baseline; margin-bottom:10px; }
  .head h2 { font-size:16px; margin:0; } .head code { color:var(--mute); font-size:12px; }
  .row { display:flex; flex-wrap:wrap; gap:12px; }
  .card { width:230px; border:2px solid var(--line); border-radius:12px; padding:8px; position:relative; }
  .opt { cursor:pointer; } .opt:hover { border-color:#bbb; }
  .opt.sel { border-color:var(--accent); box-shadow:0 0 0 3px #d9534f33; }
  .opt.sel::after { content:"✓ 已选"; position:absolute; top:6px; right:8px; background:var(--accent); color:#fff; font-size:12px; padding:0 8px; border-radius:10px; }
  .ref { background:#faf9f7; }
  .big { display:flex; justify-content:center; align-items:center; gap:4px; background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px; border-radius:8px; padding:6px; min-height:172px; }
  .big img { width:160px; height:160px; }
  .big.multi img { width:0; flex:1; height:auto; max-width:104px; aspect-ratio:1; }
  .small { display:flex; gap:6px; margin-top:6px; }
  .small div { flex:1; display:flex; justify-content:center; gap:4px; padding:6px 0; border-radius:8px; overflow:hidden; }
  .dk { background:#2b3440; } .lt { background:#dfe6ee; }
  .small img { width:44px; height:44px; min-width:0; flex-shrink:1; object-fit:contain; }
  .name { font-weight:600; margin-top:6px; } .shape { font-size:11px; color:#fff; background:#999; border-radius:8px; padding:0 6px; margin-left:4px; }
  .desc { color:#555; font-size:12.5px; } .why { color:var(--mute); font-size:12px; }
  .note { width:100%; margin-top:10px; font:13px system-ui,"Microsoft YaHei"; padding:6px 8px; border:1px solid var(--line); border-radius:8px; }
  .bar { position:fixed; left:0; right:0; bottom:0; background:#222; color:#eee; padding:10px 20px; display:flex; gap:10px; align-items:center; z-index:10; }
  .bar textarea { flex:1; height:110px; font:12.5px/1.5 ui-monospace,Consolas,monospace; background:#111; color:#eee; border:1px solid #444; border-radius:8px; padding:8px; }
  .bar .btns { display:flex; flex-direction:column; gap:6px; }
  .bar button { background:var(--accent); color:#fff; border:0; border-radius:8px; padding:8px 16px; font-size:14px; cursor:pointer; }
  .bar button.ghost { background:#444; }
  .warn { background:#fff4e5; border:1px solid #f0c080; border-radius:10px; padding:8px 12px; margin-bottom:12px; }
</style>
</head>
<body>
<h1>锤子风格图标 · 全部方案</h1>
<p class="sub">每个应用第一张是现在的图标，其后是参考的锤子图标（灰底），再后面是设计方案。点方案选中（可多选，多选即“默认 + 备选”，按点击顺序），可写意见。选择会自动保存在本浏览器，底部汇总点“复制”贴给我。</p>
<div id="warn"></div>
<div class="tools">
  <input id="q" placeholder="搜索应用名或包名">
  <button data-f="all" aria-pressed="true">全部</button>
  <button data-f="todo">未选</button>
  <button data-f="done">已选</button>
  <span id="count" class="sub" style="margin:0"></span>
</div>
<div id="list"></div>
<div class="bar"><textarea id="out" readonly></textarea><div class="btns"><button id="copy">复制</button><button id="clear" class="ghost">清空选择</button></div></div>
<script>
const DATA = ${data};
const KEY = 'smartisan-all-choices-v1';
let store = {};
try { store = JSON.parse(localStorage.getItem(KEY)) || {} } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {} ; summary() };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c]);
const SHAPE = { landscape:'横矩形', portrait:'竖矩形', square:'方形', circle:'圆形', free:'异形' };
let filter = 'all';

function imgs(src) {
  return '<div class="big' + (src.length > 1 ? ' multi' : '') + '">' + src.map(s => '<img loading="lazy" src="' + s + '">').join('') + '</div>' +
    '<div class="small"><div class="dk">' + src.map(s => '<img loading="lazy" src="' + s + '">').join('') + '</div>' +
    '<div class="lt">' + src.map(s => '<img loading="lazy" src="' + s + '">').join('') + '</div></div>';
}

function render() {
  const list = $('#list'); list.innerHTML = '';
  const q = $('#q').value.trim().toLowerCase();
  let shown = 0;
  for (const e of DATA.entries) {
    const st = store[e.pkg] || { sel: [], note: '' };
    const done = st.sel.length > 0;
    if (filter === 'todo' && done) continue;
    if (filter === 'done' && !done) continue;
    if (q && !(e.pkg.toLowerCase().includes(q) || String(e.label ?? '').toLowerCase().includes(q))) continue;
    shown++;
    const s = document.createElement('section');
    if (done) s.className = 'done';
    let h = '<div class="head"><h2>' + esc(e.label ?? e.pkg) + '</h2><code>' + esc(e.pkg) + '</code></div><div class="row">';
    h += '<div class="card ref">' + imgs(['../../phone-icons/' + encodeURIComponent(e.iconFile)]) + '<div class="name">现在的图标</div></div>';
    for (const r of e.refs.filter(r => r.has)) {
      h += '<div class="card ref">' + imgs(['../../png/' + encodeURIComponent(r.pkg) + '.png']) + '<div class="name">参考 · ' + esc(r.pkg) + '</div><div class="why">' + esc(r.why) + '</div></div>';
    }
    for (const o of e.options) {
      const i = st.sel.indexOf(o.id);
      h += '<div class="card opt' + (i >= 0 ? ' sel' : '') + '" data-id="' + o.id + '">' + imgs([encodeURIComponent(e.pkg) + '/opt-' + o.id + '.png']) +
        '<div class="name">' + o.id + ' · ' + esc(o.name) + (o.shape ? '<span class="shape">' + (SHAPE[o.shape] || esc(o.shape)) + '</span>' : '') + '</div>' +
        '<div class="desc">' + esc(o.desc) + '</div></div>';
    }
    h += '</div><input class="note" placeholder="修改意见（可选）" value="' + esc(st.note) + '">';
    s.innerHTML = h;
    s.querySelectorAll('.opt').forEach(c => c.onclick = () => {
      const cur = store[e.pkg] || { sel: [], note: '' };
      const id = c.dataset.id;
      cur.sel = cur.sel.includes(id) ? cur.sel.filter(x => x !== id) : [...cur.sel, id];
      store[e.pkg] = cur; save();
      c.classList.toggle('sel'); s.classList.toggle('done', cur.sel.length > 0);
    });
    s.querySelector('.note').oninput = ev => { store[e.pkg] = { ...(store[e.pkg] || { sel: [] }), note: ev.target.value }; save() };
    list.append(s);
  }
  $('#count').textContent = '显示 ' + shown + ' / ' + DATA.entries.length;
}

function summary() {
  const lines = [];
  let done = 0;
  for (const e of DATA.entries) {
    const st = store[e.pkg];
    if (!st || (!st.sel.length && !st.note)) continue;
    if (st.sel.length) done++;
    lines.push(e.pkg + '（' + (e.label ?? '') + '）：' + (st.sel.join('+') || '未选') + (st.note ? '；意见：' + st.note : ''));
  }
  $('#out').value = '已选 ' + done + ' / ' + DATA.entries.length + '\\n' + lines.join('\\n');
}

if (DATA.missing.length) $('#warn').innerHTML = '<div class="warn">还没有设计稿的应用 ' + DATA.missing.length + ' 个：' + DATA.missing.map(a => esc(a.label ?? a.pkg)).join('、') + '</div>';
document.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
  filter = b.dataset.f; document.querySelectorAll('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b)); render();
});
$('#q').oninput = render;
$('#copy').onclick = () => { $('#out').select(); document.execCommand('copy') };
$('#clear').onclick = () => { if (confirm('清空全部选择？')) { store = {}; save(); render() } };
render(); summary();
</script>
</body>
</html>
`
await writeFile(path.join(here, 'index.html'), html)
console.log(`已生成 index.html：${entries.length} 个应用有设计稿，${missing.length} 个还没有`)
