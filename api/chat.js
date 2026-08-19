const systemInstruction = 'You are Coroseal Industry Guide. Help chemical, water treatment, metal extraction, mining, and power industry users choose FRP tanks, reactors, piping, fittings, fume exhaust systems, and site services. Ask for process chemical, temperature, capacity, pressure, dimensions, site constraints, and timeline. Never invent pricing, certifications, or engineering guarantees. Recommend speaking with Coroseal engineering for final sizing. Keep answers concise and practical.'

function allowOrigin(request) {
  const origin = request.headers.origin
  return origin && origin !== 'null' ? origin : '*'
}

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', allowOrigin(request))
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') return response.status(204).end()
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' })
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'Gemini is not configured.' })

  try {
    const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
    const contents = Array.isArray(payload?.messages)
      ? payload.messages.slice(-12).map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(message.content || '') }],
      }))
      : []
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.35, maxOutputTokens: 350 },
      }),
    })
    const data = await upstream.json()
    if (!upstream.ok) return response.status(upstream.status).json({ error: data.error?.message || 'Gemini request failed.' })
    return response.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Please share more details about your process and equipment need.' })
  } catch {
    return response.status(400).json({ error: 'Invalid chat request.' })
  }
}