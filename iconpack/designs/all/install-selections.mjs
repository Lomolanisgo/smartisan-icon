// 把 selections.json 中“已选且无意见”的方案装进 iconpack/overrides/icons
//   第一个选中的方案 → <包名>.png（默认图标）
//   之后选中的方案   → <包名>~<小写方案号>.png（备选图标）
// 有意见的应用不安装（等修改完成），并列出未在 selections.json 中出现的应用
// 用法：node iconpack/designs/all/install-selections.mjs [--dry]
import { readFile, copyFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const iconpack = path.resolve(here, '..', '..')
const overrides = path.join(iconpack, 'overrides', 'icons')
const dry = process.argv.includes('--dry')

const apps = JSON.parse(await readFile(path.join(here, 'apps.json'), 'utf8'))
const selections = JSON.parse(await readFile(path.join(here, 'selections.json'), 'utf8'))
const exists = f => stat(f).then(() => true, () => false)

// 直接沿用锤子已有图标的应用：目标包名 → 锤子图标包名
const reuse = {
  'com.uniqlo.europe.catalogue': 'com.yek.android.uniqlo',
  'com.kfc.nl.mobileapp': 'com.yek.android.kfc.activitys',
}

const installed = [], pending = [], unmentioned = [], problems = []
for (const app of apps) {
  const s = selections[app.pkg]
  if (reuse[app.pkg]) {
    const from = path.join(iconpack, 'png', `${reuse[app.pkg]}.png`)
    if (!(await exists(from))) { problems.push(`${app.pkg}: 找不到 ${from}`); continue }
    if (!dry) await copyFile(from, path.join(overrides, `${app.pkg}.png`))
    installed.push(`${app.label}（${app.pkg}）← 锤子 ${reuse[app.pkg]}`)
    continue
  }
  if (!s) { unmentioned.push(`${app.label}（${app.pkg}）`); continue }
  if (s.note || !s.sel.length) { pending.push(`${app.label}（${app.pkg}）`); continue }
  const files = []
  for (const [i, id] of s.sel.entries()) {
    const from = path.join(here, app.pkg, `opt-${id}.png`)
    if (!(await exists(from))) { problems.push(`${app.pkg}: 缺少 opt-${id}.png`); continue }
    const name = i === 0 ? `${app.pkg}.png` : `${app.pkg}~${id.toLowerCase()}.png`
    if (!dry) await copyFile(from, path.join(overrides, name))
    files.push(`${id}→${name}`)
  }
  installed.push(`${app.label}（${app.pkg}）：${files.join('，')}`)
}

const extra = Object.keys(selections).filter(p => !apps.some(a => a.pkg === p))
console.log(`${dry ? '[预演] ' : ''}已安装 ${installed.length} 个：\n  ` + installed.join('\n  '))
console.log(`\n待修改（有意见或未选）${pending.length} 个：\n  ` + pending.join('\n  '))
console.log(`\n未在选择中出现 ${unmentioned.length} 个：\n  ` + (unmentioned.join('\n  ') || '无'))
if (extra.length) console.log(`\nselections.json 中有但不在 apps.json 的包名：${extra.join('、')}`)
if (problems.length) console.log(`\n问题：\n  ` + problems.join('\n  '))
