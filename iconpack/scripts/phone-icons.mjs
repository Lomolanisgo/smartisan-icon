// 通过 adb 从手机提取应用当前的图标（位图 / 自适应图标 / 矢量图），供测试界面对比
// 前置：先运行 phone-apps.mjs 生成 iconpack/phone-apps.json
// 用法：node iconpack/scripts/phone-icons.mjs [adb 路径]
// 输出：iconpack/phone-icons/<包名>.svg，并在 phone-apps.json 中补充 label / iconFile 字段
//
// 只按需读取 APK 中的少量条目（在手机上 unzip -p），不拉取整个 APK
import { execFile } from 'node:child_process'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const sdk = path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk')
const adb = process.argv[2] || path.join(sdk, 'platform-tools', 'adb.exe')
const aapt2 = path.join(sdk, 'build-tools', '35.0.0', 'aapt2.exe')
const phoneAppsFile = path.join(root, 'iconpack', 'phone-apps.json')
const outDir = path.join(root, 'iconpack', 'phone-icons')
const tmpRoot = path.join(os.tmpdir(), 'smartisan-phone-icons')
const CONCURRENCY = 4

function run(cmd, args, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { encoding, maxBuffer: 1024 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      // aapt2 对精简 APK 会报缺文件警告并可能返回非 0，只要有输出即可
      if (err && !stdout?.length) reject(new Error(`${path.basename(cmd)} ${args[0]}：${String(stderr || err.message).slice(0, 300)}`))
      else resolve(stdout)
    })
  })
}

// 仅存储（不压缩）的最小 zip 写入器，供 aapt2 读取
function makeZip(files) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name)
    const crc = zlib.crc32(data) >>> 0
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    locals.push(local, nameBuf, data)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(data.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBuf.length, 28)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBuf)
    offset += 30 + nameBuf.length + data.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(cd.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

// ---------- aapt2 输出解析 ----------

function parseResources(text) {
  const map = new Map()
  let cur = null
  for (const line of text.split(/\r?\n/)) {
    let m = line.match(/^\s*resource (0x[0-9a-f]+) ([\w.]+)\/(\S+)/)
    if (m) {
      cur = ['drawable', 'mipmap', 'color'].includes(m[2]) ? { type: m[2], name: m[3], values: [] } : null
      if (cur) map.set(m[1], cur)
      continue
    }
    if (!cur) continue
    m = line.match(/^\s*\(([^)]*)\) (.*)$/)
    if (m) cur.values.push({ config: m[1], value: m[2].trim() })
  }
  return map
}

const DENSITY = { ldpi: 120, mdpi: 160, tvdpi: 213, hdpi: 240, xhdpi: 320, xxhdpi: 480, xxxhdpi: 640, nodpi: 100, anydpi: 700 }
function configScore(config) {
  let score = 150
  for (const q of config.split('-').filter(Boolean)) {
    if (q in DENSITY) score = DENSITY[q]
    else if (!/^v\d+$/.test(q)) return -1 // night / land / 语言等限定符
  }
  return score
}
function pickValue(res) {
  let best = null
  let bestScore = -2
  for (const v of res.values) {
    const s = configScore(v.config)
    if (s > bestScore) [best, bestScore] = [v, s]
  }
  return best
}

function parseAttrValue(raw) {
  raw = raw.trim()
  if (raw.startsWith('"')) {
    const m = raw.match(/^"((?:[^"\\]|\\.)*)"/)
    return m ? m[1].replace(/\\(.)/g, '$1') : raw
  }
  return raw.replace(/\s*\(Raw: .*\)$/, '')
}

function parseXmlTree(text) {
  const top = { name: '#root', attrs: {}, children: [], indent: -1 }
  const stack = [top]
  for (const line of text.split(/\r?\n/)) {
    const indent = line.search(/\S/)
    let m = line.match(/^\s*E: (\S+) \(line=/)
    if (m) {
      while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop()
      const node = { name: m[1], attrs: {}, children: [], indent }
      stack.at(-1).children.push(node)
      stack.push(node)
      continue
    }
    m = line.match(/^\s*A: (?:\S*?:)?([A-Za-z_]+)(?:\(0x[0-9a-f]+\))?=(.*)$/)
    if (m) {
      while (stack.length > 1 && stack.at(-1).indent >= indent) stack.pop()
      stack.at(-1).attrs[m[1]] = parseAttrValue(m[2])
    }
  }
  return top.children[0] ?? null
}

// ---------- 颜色与图层 ----------

const num = v => (v == null ? 0 : parseFloat(v) || 0)
// 资源值指向文件：常规为 (file) path；资源混淆过的 APK 可能存为字符串 "r/0t.xml"
const fileOf = value =>
  value.match(/^\(file\) (\S+)/) ?? value.match(/^"([^"]+\.(?:xml|png|webp|jpe?g))"$/i)

function imageMime(data) {
  if (data.length < 12) return null
  if (data.readUInt32BE(0) === 0x89504e47) return 'image/png'
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg'
  return null
}
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const FRAMEWORK_COLORS = {
  '@0x0106000b': '#ffffff', '@0x0106000c': '#000000', '@0x0106000d': 'transparent',
  '@android:color/white': '#ffffff', '@android:color/black': '#000000', '@android:color/transparent': 'transparent',
}

function argb(hex) {
  let h = hex.slice(1)
  if (h.length === 3) h = 'f' + h
  if (h.length === 6) h = 'ff' + h
  if (h.length === 4) h = [...h].map(c => c + c).join('')
  const n = i => parseInt(h.slice(i, i + 2), 16)
  return `rgba(${n(2)},${n(4)},${n(6)},${+(n(0) / 255).toFixed(3)})`
}
const colorLayer = color => ({
  render: (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`,
})

class Apk {
  // apkPaths：base.apk 在前，其后为密度拆分包
  constructor(apkPaths, dir) {
    this.apkPaths = apkPaths
    this.dir = dir
    this.entries = new Map()
    this.xmlCache = new Map()
    this.seq = 0
  }
  rawEntry(apkPath, name) {
    return run(adb, ['exec-out', `unzip -p '${apkPath}' '${name}'`], 'buffer').catch(() => Buffer.alloc(0))
  }
  // 依次在 base 与拆分包中查找条目
  entry(name) {
    if (!this.entries.has(name)) {
      this.entries.set(name, (async () => {
        for (const p of this.apkPaths) {
          const data = await this.rawEntry(p, name)
          if (data.length) return data
        }
        return Buffer.alloc(0)
      })())
    }
    return this.entries.get(name)
  }
  async zipOf(names) {
    names = [...new Set(names)]
    const data = await Promise.all(names.map(n => this.entry(n)))
    const file = path.join(this.dir, `z${this.seq++}.apk`)
    await writeFile(file, makeZip(names.map((name, i) => ({ name, data: data[i] }))))
    return file
  }
  async init() {
    const mini = await this.zipOf(['AndroidManifest.xml', 'resources.arsc'])
    this.badging = await run(aapt2, ['dump', 'badging', mini])
    this.resources = parseResources(await run(aapt2, ['dump', 'resources', mini]))

    // 密度拆分包（如 split_config.xxhdpi.apk）自带资源表，只含该密度的条目
    for (const p of this.apkPaths.slice(1)) {
      const [manifest, arsc] = await Promise.all(['AndroidManifest.xml', 'resources.arsc'].map(n => this.rawEntry(p, n)))
      if (!manifest.length || !arsc.length) continue
      const file = path.join(this.dir, `z${this.seq++}.apk`)
      await writeFile(file, makeZip([{ name: 'AndroidManifest.xml', data: manifest }, { name: 'resources.arsc', data: arsc }]))
      const split = parseResources(await run(aapt2, ['dump', 'resources', file]).catch(() => ''))
      for (const [id, res] of split) {
        const cur = this.resources.get(id)
        if (cur) cur.values.push(...res.values)
        else this.resources.set(id, res)
      }
    }

    // 部分 APK 以名称引用资源，如 @color/BrandPrimaryDefault
    this.resourceNames = new Map([...this.resources.values()].map(r => [`${r.type}/${r.name}`, r]))
  }
  xml(name) {
    if (!this.xmlCache.has(name)) {
      // aapt2 要求 zip 中包含 AndroidManifest.xml 才认作 APK
      this.xmlCache.set(name, this.zipOf(['AndroidManifest.xml', name])
        .then(f => run(aapt2, ['dump', 'xmltree', '--file', name, f]))
        .then(parseXmlTree))
    }
    return this.xmlCache.get(name)
  }
}

class Resolver {
  constructor(apk) {
    this.apk = apk
    this.seq = 0
  }
  uid(prefix) {
    return `${prefix}${this.seq++}`
  }
  lookup(ref) {
    const byId = ref?.match(/^@(0x[0-9a-f]+)/i)
    const byName = !byId && ref?.match(/^@\+?([\w.]+)\/(\S+)$/)
    const res = byId
      ? this.apk.resources.get(byId[1].toLowerCase())
      : byName && this.apk.resourceNames.get(`${byName[1]}/${byName[2]}`)
    return res ? pickValue(res) : null
  }

  // 解析 drawable 引用 / 颜色 / 文件路径，返回 { render(x, y, w, h), adaptive? }
  async drawable(value, depth = 0) {
    if (typeof value !== 'string' || depth > 8) return null
    if (FRAMEWORK_COLORS[value]) return colorLayer(FRAMEWORK_COLORS[value])
    if (/^#[0-9a-f]+$/i.test(value)) return colorLayer(argb(value))
    if (value.startsWith('@')) {
      const v = this.lookup(value)
      if (!v) return null
      const file = fileOf(v.value)
      return file ? this.file(file[1], depth + 1) : this.drawable(v.value, depth + 1)
    }
    return this.file(value, depth + 1)
  }

  async file(name, depth) {
    if (name.endsWith('.xml')) return this.node(await this.apk.xml(name), depth)
    // 资源混淆后文件可能没有扩展名（如 res/5ZQ），按文件头判断类型
    const data = await this.apk.entry(name)
    const mime = imageMime(data)
    if (mime) {
      const href = `data:${mime};base64,${data.toString('base64')}`
      return {
        render: (x, y, w, h) => `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`,
      }
    }
    // 编译后的二进制 XML 以 0x0003 开头
    if (data.length >= 2 && data[0] === 0x03 && data[1] === 0x00) return this.node(await this.apk.xml(name), depth)
    return null
  }

  async child(el, depth) {
    if (!el) return null
    if (el.attrs.drawable) return this.drawable(el.attrs.drawable, depth + 1)
    return el.children[0] ? this.node(el.children[0], depth + 1) : null
  }

  async node(node, depth) {
    if (!node) return null
    const a = node.attrs
    switch (node.name) {
      case 'adaptive-icon': {
        const [bg, fg] = await Promise.all(
          ['background', 'foreground'].map(tag => this.child(node.children.find(c => c.name === tag), depth))
        )
        return {
          adaptive: true,
          render: (x, y, w, h) => (bg?.render(x, y, w, h) ?? '') + (fg?.render(x, y, w, h) ?? ''),
        }
      }
      case 'vector':
        return this.vector(node)
      case 'bitmap':
      case 'nine-patch':
        return a.src ? this.drawable(a.src, depth + 1) : null
      case 'inset': {
        const inner = await this.child(node, depth)
        if (!inner) return null
        // 百分比按比例；dp 以 108dp 自适应画布估算
        const frac = k => {
          const v = a[k] ?? a.inset
          if (!v) return 0
          return v.endsWith('%') ? num(v) / 100 : num(v) / 108
        }
        const [l, t, r, b] = ['insetLeft', 'insetTop', 'insetRight', 'insetBottom'].map(frac)
        return { render: (x, y, w, h) => inner.render(x + w * l, y + h * t, w * (1 - l - r), h * (1 - t - b)) }
      }
      case 'layer-list': {
        const items = await Promise.all(node.children.filter(c => c.name === 'item').map(it => this.child(it, depth)))
        return { render: (x, y, w, h) => items.map(i => i?.render(x, y, w, h) ?? '').join('') }
      }
      case 'selector': {
        const item = node.children.find(c => c.name === 'item' && (c.attrs.drawable || c.children.length))
        return this.child(item, depth)
      }
      case 'shape': {
        const solid = node.children.find(c => c.name === 'solid')
        if (solid) {
          const paint = await this.paint(solid.attrs.color, depth + 1)
          return typeof paint === 'string' ? colorLayer(paint) : null
        }
        const gradient = node.children.find(c => c.name === 'gradient')
        return gradient ? this.shapeGradient(gradient, depth) : null
      }
    }
    return null
  }

  // 颜色值：css 字符串或 { gradient, stops }
  async paint(value, depth = 0) {
    if (!value || depth > 8) return null
    if (FRAMEWORK_COLORS[value]) return FRAMEWORK_COLORS[value]
    if (/^#[0-9a-f]+$/i.test(value)) return argb(value)
    let target = value
    if (value.startsWith('@')) {
      const v = this.lookup(value)
      if (!v) return null
      const file = fileOf(v.value)
      if (!file) return this.paint(v.value, depth + 1)
      target = file[1]
    }
    if (!target.endsWith('.xml')) return null
    const node = await this.apk.xml(target)
    if (node?.name === 'selector') {
      const item = node.children.find(c => c.attrs.color)
      return item ? this.paint(item.attrs.color, depth + 1) : null
    }
    if (node?.name === 'gradient') return { gradient: node.attrs, stops: await this.stops(node, depth) }
    return null
  }

  async stops(node, depth) {
    const items = node.children.filter(c => c.name === 'item')
    if (items.length) {
      return Promise.all(items.map(async i => ({ offset: num(i.attrs.offset), color: await this.paint(i.attrs.color, depth + 1) })))
    }
    const { startColor, centerColor, endColor } = node.attrs
    const list = []
    if (startColor) list.push({ offset: 0, color: await this.paint(startColor, depth + 1) })
    if (centerColor) list.push({ offset: 0.5, color: await this.paint(centerColor, depth + 1) })
    if (endColor) list.push({ offset: 1, color: await this.paint(endColor, depth + 1) })
    return list
  }

  // <shape><gradient>：按对象包围盒绘制；angle 0 为左→右，90 为下→上
  async shapeGradient(node, depth) {
    const stops = (await this.stops(node, depth))
      .filter(s => typeof s.color === 'string')
      .map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
      .join('')
    const id = this.uid('sg')
    const a = node.attrs
    let def
    if (num(a.type) === 1) {
      const r = a.gradientRadius?.endsWith('%') ? num(a.gradientRadius) / 100 : 0.5
      def = `<radialGradient id="${id}" cx="${a.centerX ? num(a.centerX) : 0.5}" cy="${a.centerY ? num(a.centerY) : 0.5}" r="${r}">${stops}</radialGradient>`
    } else {
      const rad = (num(a.angle) * Math.PI) / 180
      const dx = Math.cos(rad) / 2
      const dy = Math.sin(rad) / 2
      def = `<linearGradient id="${id}" x1="${0.5 - dx}" y1="${0.5 + dy}" x2="${0.5 + dx}" y2="${0.5 - dy}">${stops}</linearGradient>`
    }
    return {
      render: (x, y, w, h) => `<defs>${def}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})"/>`,
    }
  }

  paintAttr(paint, defs) {
    if (!paint) return 'none'
    if (typeof paint === 'string') return paint
    const g = paint.gradient
    const id = this.uid('g')
    const stops = paint.stops
      .filter(s => typeof s.color === 'string')
      .map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`)
      .join('')
    if (num(g.type) === 1) {
      defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${num(g.centerX)}" cy="${num(g.centerY)}" r="${num(g.gradientRadius)}">${stops}</radialGradient>`)
    } else {
      defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${num(g.startX)}" y1="${num(g.startY)}" x2="${num(g.endX)}" y2="${num(g.endY)}">${stops}</linearGradient>`)
    }
    return `url(#${id})`
  }

  async vector(node) {
    const vw = num(node.attrs.viewportWidth) || num(node.attrs.width) || 108
    const vh = num(node.attrs.viewportHeight) || num(node.attrs.height) || 108
    const defs = []
    const body = await this.vectorChildren(node.children, defs)
    const opacity = node.attrs.alpha ? ` opacity="${num(node.attrs.alpha)}"` : ''
    const inner = `<defs>${defs.join('')}</defs><g${opacity}>${body}</g>`
    return {
      render: (x, y, w, h) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none">${inner}</svg>`,
    }
  }

  async vectorChildren(children, defs) {
    let out = ''
    let openClips = 0
    for (const c of children) {
      const a = c.attrs
      if (c.name === 'group') {
        const px = num(a.pivotX)
        const py = num(a.pivotY)
        const sx = a.scaleX ? num(a.scaleX) : 1
        const sy = a.scaleY ? num(a.scaleY) : 1
        const transform = `translate(${num(a.translateX) + px} ${num(a.translateY) + py}) rotate(${num(a.rotation)}) scale(${sx} ${sy}) translate(${-px} ${-py})`
        out += `<g transform="${transform}">${await this.vectorChildren(c.children, defs)}</g>`
      } else if (c.name === 'clip-path' && a.pathData) {
        // clip-path 作用于同组内其后的兄弟节点
        const id = this.uid('c')
        defs.push(`<clipPath id="${id}"><path d="${escAttr(a.pathData)}"/></clipPath>`)
        out += `<g clip-path="url(#${id})">`
        openClips++
      } else if (c.name === 'path' && a.pathData) {
        let attrs = `d="${escAttr(a.pathData)}" fill="${this.paintAttr(await this.paint(a.fillColor), defs)}"`
        if (a.fillAlpha) attrs += ` fill-opacity="${num(a.fillAlpha)}"`
        if (a.fillType === '1' || a.fillType === 'evenOdd') attrs += ' fill-rule="evenodd"'
        const stroke = this.paintAttr(await this.paint(a.strokeColor), defs)
        if (stroke !== 'none') {
          attrs += ` stroke="${stroke}" stroke-width="${num(a.strokeWidth) || 1}"`
          if (a.strokeAlpha) attrs += ` stroke-opacity="${num(a.strokeAlpha)}"`
          const cap = ['butt', 'round', 'square'][num(a.strokeLineCap)]
          const join = ['miter', 'round', 'bevel'][num(a.strokeLineJoin)]
          if (cap) attrs += ` stroke-linecap="${cap}"`
          if (join) attrs += ` stroke-linejoin="${join}"`
        }
        out += `<path ${attrs}/>`
      }
    }
    return out + '</g>'.repeat(openClips)
  }
}

// ---------- 主流程 ----------

function badgingValue(badging, key) {
  return badging.match(new RegExp(`^${key}:'((?:[^'\\\\]|\\\\.)*)'`, 'm'))?.[1]?.replace(/\\(.)/g, '$1') || null
}

// 返回图标文件路径：优先桌面实际启动的 Activity，其次应用图标（取最高密度）
function iconFromBadging(badging, app) {
  for (const m of badging.matchAll(/^launchable-activity: name='([^']*)'.*?icon='([^']*)'/gm)) {
    if (m[2] && app.activities.includes(m[1])) return m[2]
  }
  let best = null
  let bestDensity = -1
  for (const m of badging.matchAll(/^application-icon-(\d+):'([^']+)'/gm)) {
    if (+m[1] > bestDensity) [best, bestDensity] = [m[2], +m[1]]
  }
  return best ?? badging.match(/^application: .*?icon='([^']+)'/m)?.[1] ?? null
}

// badging 解析不出图标时（资源被混淆/仅在限定配置中），直接读清单里的资源 ID
async function iconFromManifest(apk, app) {
  const manifest = await apk.xml('AndroidManifest.xml')
  const application = manifest?.children.find(c => c.name === 'application')
  if (!application) return null
  const fullName = n => (n?.startsWith('.') ? app.pkg + n : n)
  const launcher = application.children.find(c =>
    (c.name === 'activity' || c.name === 'activity-alias') && app.activities.includes(fullName(c.attrs.name)))
  const ref = [launcher?.attrs.icon, application.attrs.icon].find(v => v?.startsWith('@'))
  return ref ?? null
}

async function extract(app) {
  const dir = path.join(tmpRoot, app.pkg)
  await mkdir(dir, { recursive: true })
  const paths = (await run(adb, ['shell', `pm path --user 0 ${app.pkg}`]))
    .split(/\r?\n/).map(l => l.replace('package:', '').trim()).filter(Boolean)
  const basePath = paths.find(p => p.endsWith('/base.apk')) ?? paths[0]
  if (!basePath) throw new Error('找不到 APK')
  const densitySplits = paths.filter(p => /\/split_config\.[a-z]*dpi\.apk$/.test(p))

  const apk = new Apk([basePath, ...densitySplits], dir)
  await apk.init()
  const b = apk.badging
  const label = badgingValue(b, 'application-label-zh-CN') || badgingValue(b, 'application-label-zh') ||
    badgingValue(b, 'application-label') || b.match(/^application: label='([^']*)'/m)?.[1] || null
  app.label = label // 图标提取失败时也保留应用名

  const iconPath = (await iconFromBadging(b, app)) ?? (await iconFromManifest(apk, app))
  if (!iconPath) throw new Error('APK 未声明图标')

  const resolver = new Resolver(apk)
  const layer = iconPath.startsWith('@') ? await resolver.drawable(iconPath) : await resolver.file(iconPath, 0)
  if (!layer) throw new Error(`无法解析图标 ${iconPath}`)
  const content = layer.render(0, 0, 108, 108)
  if (!content) throw new Error(`图标为空 ${iconPath}`)
  // 自适应图标：108dp 画布中只显示中间 72dp
  const viewBox = layer.adaptive ? '18 18 72 72' : '0 0 108 108'
  await writeFile(
    path.join(outDir, `${app.pkg}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="${viewBox}">${content}</svg>`
  )
  return { label, iconFile: `${app.pkg}.svg`, iconSource: iconPath, adaptive: !!layer.adaptive, iconError: null }
}

const apps = JSON.parse(await readFile(phoneAppsFile, 'utf8'))
await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const queue = [...apps]
let done = 0
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const app = queue.shift()
    try {
      Object.assign(app, await extract(app))
    } catch (e) {
      Object.assign(app, { iconFile: null, iconError: e.message })
    }
    if (++done % 20 === 0) console.log(`${done}/${apps.length}`)
  }
}))

await writeFile(phoneAppsFile, JSON.stringify(apps, null, 2))
await rm(tmpRoot, { recursive: true, force: true })

const failed = apps.filter(a => !a.iconFile)
console.log(`提取图标 ${apps.length - failed.length}/${apps.length}`)
for (const a of failed) console.log(`  失败 ${a.pkg}：${a.iconError}`)
