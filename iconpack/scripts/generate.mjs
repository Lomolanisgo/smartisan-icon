// 由 iconpack/raw + iconpack/overrides 生成图标包资源
// 输出：
//   iconpack/app/res/drawable-nodpi/*.png    图标
//   iconpack/app/res/xml/appfilter.xml       组件映射（Nova/ADW/Lawnchair/Theme Park 通用）
//   iconpack/app/assets/appfilter.xml        同上，部分启动器从 assets 读取
//   iconpack/app/res/xml/drawable.xml        图标列表
//   iconpack/png/<包名>.png                   供 Theme Park 手动替换的 PNG
//   iconpack/png/_index.json                 测试界面使用的索引
//
// 自定义（iconpack/overrides，均可选）：
//   icons/<包名>.png     新增或替换某个应用的图标（优先级最高）
//   choices.json         {"包名": "raw 中的文件名"}，改用锤子提供的其他候选图
//   components.json      {"包名": ["启动 Activity 全名", ...]}，补充组件映射
import { readFile, readdir, mkdir, copyFile, writeFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const rawDir = path.join(root, 'iconpack', 'raw')
const overridesDir = path.join(root, 'iconpack', 'overrides')
const overrideIconsDir = path.join(overridesDir, 'icons')
const appDir = path.join(root, 'iconpack', 'app')
const drawableDir = path.join(appDir, 'res', 'drawable-nodpi')
const pngDir = path.join(root, 'iconpack', 'png')

const readJson = async (file, fallback) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (e) {
    if (e.code === 'ENOENT') return fallback
    throw new Error(`${file} 解析失败：${e.message}`)
  }
}
const listDir = async (dir, opts) => {
  try {
    return await readdir(dir, opts)
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

// 从已有图标包的 appfilter 中收集 包名 -> 启动 Activity
const components = new Map()
const addComponent = (pkg, activity) => {
  if (!components.has(pkg)) components.set(pkg, new Set())
  components.get(pkg).add(activity)
}
const assetsDir = path.join(root, 'downloader', 'assets')
for (const f of (await readdir(assetsDir)).filter(f => f.endsWith('.xml'))) {
  const xml = await readFile(path.join(assetsDir, f), 'utf8')
  for (const [, pkg, activity] of xml.matchAll(/ComponentInfo\{([^/}]+)\/([^}]+)\}/g)) {
    addComponent(pkg.trim(), activity.trim())
  }
}
const customComponents = await readJson(path.join(overridesDir, 'components.json'), {})
for (const [pkg, activities] of Object.entries(customComponents)) {
  for (const a of activities) addComponent(pkg, a)
}
const choices = await readJson(path.join(overridesDir, 'choices.json'), {})
// 本身已是锤子风格图标、无需收录的应用（测试界面不再计入“没有锤子图标”）
const skip = await readJson(path.join(overridesDir, 'skip.json'), [])

// 同一包名有多张图时的默认优先级
function pickIcon(pkg, files) {
  const rank = f =>
    f === 'icon_provided_by_smartisan.png' ? 0 :
    f === `${pkg}.png` ? 1 :
    f.startsWith('z_') ? 3 : 2
  return [...files].sort((a, b) => rank(a) - rank(b))[0]
}

const escapeXml = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const usedNames = new Set(['ic_launcher'])
function drawableName(pkg) {
  let base = 'ic_' + pkg.toLowerCase().replace(/[^a-z0-9]/g, '_')
  let name = base
  for (let i = 2; usedNames.has(name); i++) name = `${base}_${i}`
  usedNames.add(name)
  return name
}

await rm(drawableDir, { recursive: true, force: true })
await rm(pngDir, { recursive: true, force: true })
await mkdir(drawableDir, { recursive: true })
await mkdir(path.join(appDir, 'res', 'xml'), { recursive: true })
await mkdir(path.join(appDir, 'assets'), { recursive: true })
await mkdir(pngDir, { recursive: true })

// 包名全集 = 锤子原图 ∪ 自定义图标
const rawPkgs = new Map()
for (const d of await listDir(rawDir, { withFileTypes: true })) {
  if (!d.isDirectory()) continue
  const files = (await readdir(path.join(rawDir, d.name))).filter(f => f.endsWith('.png')).sort()
  if (files.length) rawPkgs.set(d.name, files)
}
// icons/<包名>~<名称>.png 为备选图标：只进 drawable 列表供用户手动选择，不参与 appfilter
const overrideFiles = (await listDir(overrideIconsDir)).filter(f => f.endsWith('.png'))
const overridePkgs = new Set(overrideFiles.filter(f => !f.includes('~')).map(f => f.slice(0, -4)))
const altIcons = overrideFiles.filter(f => f.includes('~')).sort()
const pkgs = [...new Set([...rawPkgs.keys(), ...overridePkgs])].sort()

for (const pkg of Object.keys(choices)) {
  if (!rawPkgs.get(pkg)?.includes(choices[pkg])) {
    throw new Error(`choices.json：${pkg} 没有候选图 ${choices[pkg]}`)
  }
}

function resolveSource(pkg) {
  if (overridePkgs.has(pkg)) return { source: 'override', file: path.join(overrideIconsDir, `${pkg}.png`) }
  const files = rawPkgs.get(pkg)
  if (choices[pkg]) return { source: 'choice', file: path.join(rawDir, pkg, choices[pkg]), chosen: choices[pkg] }
  const chosen = pickIcon(pkg, files)
  return { source: 'raw', file: path.join(rawDir, pkg, chosen), chosen }
}

// 图标包自身的图标：designs/app-icon/launcher.png（红色圆形 T 形锤子）；没有时退回锤子桌面图标或第一个
const launcherIcon = path.join(root, 'iconpack', 'designs', 'app-icon', 'launcher.png')
const hasLauncherIcon = await stat(launcherIcon).then(() => true, () => false)
await copyFile(
  hasLauncherIcon ? launcherIcon : resolveSource(pkgs.includes('com.smartisanos.launcher') ? 'com.smartisanos.launcher' : pkgs[0]).file,
  path.join(drawableDir, 'ic_launcher.png')
)

const filterItems = []
const drawableItems = []
const index = []
const gallery = [] // assets/gallery.json：App 内图标浏览（GalleryActivity）使用
let withActivity = 0

// 应用名：手机上的应用 + 设计稿里的应用；其余锤子原图显示包名
const labels = {}
for (const a of await readJson(path.join(root, 'iconpack', 'designs', 'all', 'apps.json'), [])) labels[a.pkg] = a.label
for (const a of await readJson(path.join(root, 'iconpack', 'phone-apps.json'), [])) if (a.label) labels[a.pkg] = a.label

for (const pkg of pkgs) {
  const { source, file, chosen } = resolveSource(pkg)
  const name = drawableName(pkg)
  await copyFile(file, path.join(drawableDir, `${name}.png`))
  await copyFile(file, path.join(pngDir, `${pkg}.png`))
  drawableItems.push(`    <item drawable="${name}" />`)
  gallery.push({ d: name, p: pkg, n: labels[pkg] ?? pkg, c: source === 'override' })

  const activities = [...(components.get(pkg) ?? [])]
  if (activities.length) {
    withActivity++
    for (const a of activities) {
      filterItems.push(`    <item component="ComponentInfo{${escapeXml(pkg)}/${escapeXml(a)}}" drawable="${name}" />`)
    }
  } else {
    // 未知 Activity：按包名匹配（部分启动器支持）
    filterItems.push(`    <item component="ComponentInfo{${escapeXml(pkg)}}" drawable="${name}" />`)
  }

  const rawFiles = rawPkgs.get(pkg) ?? []
  index.push({
    pkg,
    drawable: name,
    source,
    chosen: chosen ?? null,
    candidates: rawFiles,
    activities,
    original: rawFiles.length ? pickIcon(pkg, rawFiles) : null, // 锤子默认图，供“我的改动”对比
    customActivities: customComponents[pkg] ?? [],
    modifiedAt: source === 'override' ? (await stat(file)).mtime.toISOString() : null,
  })
}

for (const f of altIcons) {
  const name = drawableName(f.slice(0, -4))
  await copyFile(path.join(overrideIconsDir, f), path.join(drawableDir, `${name}.png`))
  await copyFile(path.join(overrideIconsDir, f), path.join(pngDir, f))
  drawableItems.push(`    <item drawable="${name}" />`)
  const pkg = f.slice(0, f.indexOf('~'))
  gallery.push({ d: name, p: pkg, n: labels[pkg] ?? pkg, c: true, a: true })
}

// 图标包自身：登记进 drawable 列表 / 图标浏览 / appfilter，桌面和选图标对话框才找得到它
const selfPkg = 'com.lomolanisgo.smartisanicons'
drawableItems.unshift('    <item drawable="ic_launcher" />')
gallery.push({ d: 'ic_launcher', p: selfPkg, n: '锤子图标包', c: true })
filterItems.push(`    <item component="ComponentInfo{${selfPkg}/${selfPkg}.GalleryActivity}" drawable="ic_launcher" />`)

// 定制在前（默认图标、再备选），其余按名称
const collator = new Intl.Collator('zh-Hans-CN')
gallery.sort((x, y) => (y.c - x.c) || ((x.a ?? false) - (y.a ?? false)) || collator.compare(x.n, y.n))
await writeFile(path.join(appDir, 'assets', 'gallery.json'), JSON.stringify(gallery))

const appfilter = `<?xml version="1.0" encoding="utf-8"?>
<resources>
${filterItems.join('\n')}
</resources>
`
await writeFile(path.join(appDir, 'res', 'xml', 'appfilter.xml'), appfilter)
await writeFile(path.join(appDir, 'assets', 'appfilter.xml'), appfilter)
await writeFile(path.join(appDir, 'res', 'xml', 'drawable.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <version>1</version>
    <category title="Smartisan" />
${drawableItems.join('\n')}
</resources>
`)
await writeFile(path.join(pngDir, '_index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), skip, icons: index }))

const overridden = index.filter(i => i.source !== 'raw').length
console.log(`图标 ${drawableItems.length} 个（自定义 ${overridden} 个），含 Activity 映射 ${withActivity} 个，appfilter 条目 ${filterItems.length} 条`)
