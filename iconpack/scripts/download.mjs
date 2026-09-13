// 从 icon.smartisan.com 下载 downloader/icon_url.json 中的全部图标
// 输出：iconpack/raw/<包名>/<文件名>.png
import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const urls = JSON.parse(await readFile(path.join(root, 'downloader', 'icon_url.json'), 'utf8'))
const outDir = path.join(root, 'iconpack', 'raw')
const CONCURRENCY = 16

let done = 0
const failed = []

async function fetchOne(url) {
  const [pkg, file] = url.replace('http://icon.smartisan.com/drawable/', '').split('/')
  const dest = path.join(outDir, pkg, file)
  try {
    await access(dest)
    return
  } catch {}
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await mkdir(path.dirname(dest), { recursive: true })
      await writeFile(dest, Buffer.from(await res.arrayBuffer()))
      return
    } catch (e) {
      if (attempt === 3) failed.push(`${url} ${e.message}`)
    }
  }
}

const queue = [...urls]
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    await fetchOne(queue.shift())
    if (++done % 200 === 0) console.log(`${done}/${urls.length}`)
  }
}))

console.log(`完成 ${urls.length - failed.length}/${urls.length}`)
if (failed.length) {
  await writeFile(path.join(root, 'iconpack', 'failed.txt'), failed.join('\n'))
  console.log(`失败 ${failed.length} 个，见 iconpack/failed.txt`)
}
