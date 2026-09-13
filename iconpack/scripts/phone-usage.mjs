// 通过 adb 读取应用使用情况（dumpsys usagestats），写入 phone-apps.json 的 usage 字段
// 前置：先运行 phone-apps.mjs 生成 iconpack/phone-apps.json
// 用法：node iconpack/scripts/phone-usage.mjs [adb 路径]
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const adb = process.argv[2] || path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk', 'platform-tools', 'adb.exe')
const phoneAppsFile = path.join(root, 'iconpack', 'phone-apps.json')

const text = execFileSync(adb, ['shell', 'dumpsys', 'usagestats'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

// "1:23:45" / "12:34" → 秒
const toSeconds = t => t.replace(/[^\d:]/g, '').split(':').map(Number).reduce((s, n) => s * 60 + n, 0)

// 各统计区间：{ range, packages: Map<包名, { seconds, lastUsed, launches }> }
// 每个区间只取第一次出现（主用户），安全文件夹等其他用户的数据跟在后面
const sections = {}
let cur = null
for (const line of text.split(/\r?\n/)) {
  const header = line.match(/In-memory (daily|weekly|monthly|yearly) stats/)
  if (header) {
    cur = sections[header[1]] ? null : (sections[header[1]] = { range: null, packages: new Map() })
    continue
  }
  if (!cur) continue
  if (/stats files:/.test(line) || /^\S/.test(line)) {
    cur = null
    continue
  }
  const range = line.match(/^\s*timeRange="([^"]+)"/)
  if (range && !cur.range) {
    cur.range = range[1]
    continue
  }
  const m = line.match(/^\s*package=(\S+) totalTimeUsed="([^"]+)" lastTimeUsed="([^"]+)".*?appLaunchCount=(\d+)/)
  if (m && !cur.packages.has(m[1])) {
    cur.packages.set(m[1], { seconds: toSeconds(m[2]), lastUsed: m[3], launches: +m[4] })
  }
}

const year = sections.yearly
if (!year) throw new Error('未在 dumpsys usagestats 输出中找到年度统计')

const apps = JSON.parse(await readFile(phoneAppsFile, 'utf8'))
for (const app of apps) {
  const stats = ['daily', 'weekly', 'yearly'].map(k => sections[k]?.packages.get(app.pkg))
  const [, week, y] = stats
  // 1970 年表示从未使用
  const lastUsed = stats.map(s => s?.lastUsed).filter(t => t && !t.startsWith('1970')).sort().at(-1) ?? null
  app.usage = {
    yearRange: year.range,
    yearSeconds: y?.seconds ?? 0,
    yearLaunches: y?.launches ?? 0,
    weekSeconds: week?.seconds ?? 0,
    weekLaunches: week?.launches ?? 0,
    lastUsed,
  }
}
await writeFile(phoneAppsFile, JSON.stringify(apps, null, 2))

const hours = s => (s / 3600).toFixed(1)
console.log(`统计区间：${year.range}`)
console.log('使用时长前 20：')
for (const [i, a] of [...apps].sort((a, b) => b.usage.yearSeconds - a.usage.yearSeconds).slice(0, 20).entries()) {
  console.log(`  ${String(i + 1).padStart(2)}. ${a.label ?? a.pkg}（${a.pkg}） ${hours(a.usage.yearSeconds)} 小时，启动 ${a.usage.yearLaunches} 次`)
}
