import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)\s*$/i)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
}

const port = Number(process.env.PORT || process.env.GEMINI_PROXY_PORT || 8787)
const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const distDirectory = resolve('dist')
const contentTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.pdf': 'application/pdf' }

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'null' : 'http://localhost:5173' })
  response.end(JSON.stringify(body))
}

function serveStatic(request, response) {
  const requestedPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^\/+/, '')
  const filePath = resolve(distDirectory, normalize(relativePath))
  const safePath = filePath.startsWith(distDirectory) ? filePath : distDirectory
  const target = existsSync(safePath) && statSync(safePath).isFile() ? safePath : join(distDirectory, 'index.html')
  if (!existsSync(target)) return send(response, 404, { error: 'Build output not found. Run npm run build first.' })
  response.writeHead(200, { 'Content-Type': contentTypes[extname(target)] || 'application/octet-stream' })
  createReadStream(target).pipe(response)
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  if (request.method !== 'POST' || new URL(request.url, 'http://localhost').pathname !== '/api/chat') {
    if (request.method === 'GET') return serveStatic(request, response)
    return send(response, 404, { error: 'Not found' })
  }
  if (!process.env.GEMINI_API_KEY) return send(response, 503, { error: 'Gemini is not configured. Use the local assistant or add GEMINI_API_KEY to the server environment.' })

  let raw = ''
  for await (const chunk of request) raw += chunk
  try {
    const payload = JSON.parse(raw)
    const contents = Array.isArray(payload.messages) ? payload.messages.slice(-12).map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(message.content || '') }] })) : []
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are Coroseal Industry Guide. Help chemical, water treatment, metal extraction, mining, and power industry users choose FRP tanks, reactors, piping, fittings, fume exhaust systems, and site services. Ask for process chemical, temperature, capacity, pressure, dimensions, site constraints, and timeline. Never invent pricing, certifications, or engineering guarantees. Recommend speaking with Coroseal engineering for final sizing. Keep answers concise and practical.' }] }, contents, generationConfig: { temperature: 0.35, maxOutputTokens: 350 } }) })
    const data = await upstream.json()
    if (!upstream.ok) return send(response, upstream.status, { error: data.error?.message || 'Gemini request failed.' })
    return send(response, 200, { reply: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Please share more details about your process and equipment need.' })
  } catch (error) {
    return send(response, 400, { error: 'Invalid chat request.' })
  }
})

server.listen(port, () => console.log(`Coroseal server listening on http://localhost:${port}`))
