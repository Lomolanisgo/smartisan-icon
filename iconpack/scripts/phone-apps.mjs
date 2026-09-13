// 通过 adb 读取手机桌面上的全部应用（包名 + 启动 Activity），并与图标包对比
// 用法：node iconpack/scripts/phone-apps.mjs [adb 路径]
// 输出：iconpack/phone-apps.json
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const adb = process.argv[2] || path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk', 'platform-tools', 'adb.exe')
const shell = (...args) => execFileSync(adb, ['shell', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

const devices = execFileSync(adb, ['devices'], { encoding: 'utf8' })
  .split('\n').slice(1).map(l => l.trim()).filter(Boolean)
if (!devices.some(l => l.endsWith('\tdevice'))) {
  console.error('没有已授权的设备：\n' + (devices.join('\n') || '（未检测到设备）'))
  process.exit(1)
}

// 桌面可见的应用 = 带 MAIN + LAUNCHER 的 Activity
// 只查主用户（0）：Shell 无权访问安全文件夹等其他用户
const out = shell('cmd', 'package', 'query-activities', '--brief', '--user', '0', '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER')
const launcher = new Map()
for (const [, pkg, act] of out.matchAll(/^\s*([A-Za-z0-9_.]+)\/([A-Za-z0-9_.$]+)\s*$/gm)) {
  const activity = act.startsWith('.') ? pkg + act : act
  if (!launcher.has(pkg)) launcher.set(pkg, new Set())
  launcher.get(pkg).add(activity)
}

const userPkgs = new Set(
  shell('pm', 'list', 'packages', '-3', '--user', '0').split('\n').map(l => l.replace('package:', '').trim()).filter(Boolean)
)

const index = JSON.parse(await readFile(path.join(root, 'iconpack', 'png', '_index.json'), 'utf8')).icons
const byPkg = new Map(index.map(i => [i.pkg, i]))

const apps = [...launcher.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([pkg, acts]) => {
  const icon = byPkg.get(pkg)
  const activities = [...acts]
  const status = !icon ? 'missing' : activities.some(a => icon.activities.includes(a)) ? 'exact' : 'package-only'
  return { pkg, activities, userInstalled: userPkgs.has(pkg), status }
})

await writeFile(path.join(root, 'iconpack', 'phone-apps.json'), JSON.stringify(apps, null, 2))

const count = s => apps.filter(a => a.status === s).length
console.log(`桌面应用 ${apps.length} 个（用户安装 ${apps.filter(a => a.userInstalled).length} 个）`)
console.log(`  已精确匹配 ${count('exact')}，仅包名/Activity 不一致 ${count('package-only')}，图标包未收录 ${count('missing')}`)
console.log('详情：iconpack/phone-apps.json')
