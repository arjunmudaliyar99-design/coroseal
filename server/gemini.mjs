import { createServer } from 'node:http'

const port = Number(process.env.GEMINI_PROXY_PORT || 8787)
const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

function send(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5173' })
  response.end(JSON.stringify(body))
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  if (request.method !== 'POST' || request.url !== '/api/chat') return send(response, 404, { error: 'Not found' })
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

server.listen(port, () => console.log(`Gemini proxy listening on http://localhost:${port}`))
