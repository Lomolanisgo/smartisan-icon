// 图标包本地测试界面
// 用法：node iconpack/tester/server.mjs  →  http://127.0.0.1:5173
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const iconpack = path.resolve(here, '..')
const PORT = Number(process.env.PORT) || 5173

const roots = {
  '/png/': path.join(iconpack, 'png'),
  '/raw/': path.join(iconpack, 'raw'),
  '/phone-icons/': path.join(iconpack, 'phone-icons'),
}
const imageTypes = { '.png': 'image/png', '.svg': 'image/svg+xml' }

function runGenerate() {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(iconpack, 'scripts', 'generate.mjs')])
    let out = ''
    child.stdout.on('data', d => (out += d))
    child.stderr.on('data', d => (out += d))
    child.on('close', code => resolve({ ok: code === 0, output: out.trim() }))
  })
}

async function sendFile(res, file, type) {
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' })
    res.end(body)
  } catch {
    res.writeHead(404).end('not found')
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)

  if (req.method === 'POST' && pathname === '/api/generate') {
    const result = await runGenerate()
    res.writeHead(result.ok ? 200 : 500, { 'content-type': 'application/json; charset=utf-8' })
    return res.end(JSON.stringify(result))
  }
  if (pathname === '/' || pathname === '/index.html') {
    return sendFile(res, path.join(here, 'index.html'), 'text/html; charset=utf-8')
  }
  if (pathname === '/api/index') {
    return sendFile(res, path.join(iconpack, 'png', '_index.json'), 'application/json; charset=utf-8')
  }
  if (pathname === '/api/phone') {
    return sendFile(res, path.join(iconpack, 'phone-apps.json'), 'application/json; charset=utf-8')
  }
  for (const [prefix, dir] of Object.entries(roots)) {
    if (!pathname.startsWith(prefix)) continue
    const file = path.resolve(dir, '.' + pathname.slice(prefix.length - 1))
    const type = imageTypes[path.extname(file)]
    if (!file.startsWith(dir + path.sep) || !type) break
    return sendFile(res, file, type)
  }
  res.writeHead(404).end('not found')
})

try {
  await stat(path.join(iconpack, 'png', '_index.json'))
} catch {
  console.log('未找到索引，正在生成…')
  const result = await runGenerate()
  console.log(result.output)
  if (!result.ok) process.exit(1)
}

server.listen(PORT, '127.0.0.1', () => console.log(`图标测试界面：http://127.0.0.1:${PORT}`))
