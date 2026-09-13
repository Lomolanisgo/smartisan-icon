// 从手机读取的桌面启动 Activity 合并进 overrides/components.json，保证 appfilter 精确匹配
// 输入：adb shell cmd package query-activities --brief --user 0 -a android.intent.action.MAIN -c android.intent.category.LAUNCHER
//       的输出，每行 “包名/Activity”（Activity 以 . 开头表示相对包名）
// 用法：node iconpack/scripts/sync-phone-components.mjs <launchers.txt>
// 只处理图标包里存在的包名（锤子原图或自定义图标），已有条目保留，新 Activity 追加
import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const iconpack = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2]
if (!input) throw new Error('用法：node sync-phone-components.mjs <launchers.txt>')

const listDir = d => readdir(d).catch(() => [])
const packPkgs = new Set([
  ...(await listDir(path.join(iconpack, 'raw'))),
  ...(await listDir(path.join(iconpack, 'overrides', 'icons')))
    .filter(f => f.endsWith('.png') && !f.includes('~')).map(f => f.slice(0, -4)),
])

const componentsFile = path.join(iconpack, 'overrides', 'components.json')
const components = JSON.parse(await readFile(componentsFile, 'utf8'))

let added = 0
const addedPkgs = new Set()
const skipped = []
const text = (await readFile(input, 'utf8')).replace(/^﻿/, '')
for (const line of text.split(/\r?\n/)) {
  const m = line.trim().match(/^([\w.]+)\/([\w.$]+)$/)
  if (!m) continue
  const [, pkg, rel] = m
  const activity = rel.startsWith('.') ? pkg + rel : rel
  if (!packPkgs.has(pkg)) { skipped.push(pkg); continue }
  const list = components[pkg] ?? (components[pkg] = [])
  if (!list.includes(activity)) { list.push(activity); added++; addedPkgs.add(pkg) }
}

const sorted = Object.fromEntries(Object.keys(components).sort().map(k => [k, components[k]]))
await writeFile(componentsFile, JSON.stringify(sorted, null, 2) + '\n')
console.log(`新增 Activity ${added} 条（${addedPkgs.size} 个应用）；components.json 共 ${Object.keys(sorted).length} 个应用`)
console.log(`手机上不在图标包里的应用 ${new Set(skipped).size} 个（未处理）`)
