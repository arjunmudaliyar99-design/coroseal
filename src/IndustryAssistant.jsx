import { useState } from 'react'

const quickPrompts = [
  ['Storage tank', 'I need a chemical storage tank'],
  ['Fume control', 'I need a fume exhaust or scrubber system'],
  ['FRP piping', 'I need corrosion-resistant FRP piping'],
]

function localReply(value) {
  const text = value.toLowerCase()
  if (text.includes('company') || text.includes('coroseal') || text.includes('about you') || text.includes('summar')) return 'Coroseal is an Indian manufacturer and service provider specialising in fibre reinforced plastic (FRP) systems. Established in 1983, the company designs and fabricates tanks, reactors, piping, fume exhaust systems, and related site services for chemical, water treatment, metal extraction, mining, and power industries.'
  if (text.includes('tank') || text.includes('chemical')) return 'For corrosive chemical storage, we can help scope an FRP or dual-laminate tank. Useful details are chemical and concentration, temperature, capacity, fittings, and whether site assembly is needed.'
  if (text.includes('fume') || text.includes('scrubber')) return 'For hazardous gas streams, Coroseal can scope scrubbers, blowers, ducts, stacks, hoods, and packed-bed internals. Share the gas, flow rate, temperature, and required outlet condition.'
  if (text.includes('pipe') || text.includes('fitting')) return 'For FRP piping, please share diameter, pressure, temperature, chemical service, line length, and your preferred joint or flange arrangement.'
  if (text.includes('reactor')) return 'For a reactor vessel, the key starting points are working volume, chemistry, temperature, agitation, pressure, bottom geometry, and material of construction.'
  if (text.includes('quote') || text.includes('contact')) return 'The quickest next step is to send your process conditions, capacity, site details, and timeline through Contact Sales.'
  return 'I can help you scope tanks, reactors, piping, fume exhaust systems, or site services. What process or equipment are you working on?'
}

export default function IndustryAssistant() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello. I can help you find the right FRP system for your process.' }])

  async function ask(value) {
    const trimmed = value.trim()
    if (!trimmed || loading) return
    const next = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setQuestion('')
    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!response.ok) throw new Error('Assistant unavailable')
      const data = await response.json()
      setMessages((items) => [...items, { role: 'assistant', content: data.reply || localReply(trimmed) }])
    } catch {
      setMessages((items) => [...items, { role: 'assistant', content: localReply(trimmed) }])
    } finally {
      setLoading(false)
    }
  }

  return <aside className={`assistant ${open ? 'is-open' : ''}`}>
    {open && <div className="assistant-panel" role="dialog" aria-label="Coroseal engineering assistant">
      <div className="assistant-head">
        <div className="assistant-title"><span className="assistant-avatar" aria-hidden="true">✦</span><span><strong>Coroseal guide</strong><small>Engineering-first product support</small></span></div>
        <button className="assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">×</button>
      </div>
      <div className="assistant-messages" aria-live="polite">
        {messages.map((message, index) => <p className={message.role === 'user' ? 'user' : 'bot'} key={`${message.role}-${index}`}>{message.content}</p>)}
        {loading && <p className="bot assistant-typing">Thinking<span> ···</span></p>}
      </div>
      <div className="assistant-chips">{quickPrompts.map(([label, prompt]) => <button key={label} onClick={() => ask(prompt)} disabled={loading}>{label}</button>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); ask(question) }}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about your process..." aria-label="Ask the Coroseal assistant" disabled={loading} />
        <button type="submit" aria-label="Send message" disabled={loading || !question.trim()}>↗</button>
      </form>
      <a className="assistant-contact" href="/contact-us.html">Need an engineer? Contact Sales <span aria-hidden="true">↗</span></a>
    </div>}
    <button className="assistant-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Close Coroseal assistant' : 'Open Coroseal assistant'}>
      <span className="assistant-chat-icon" aria-hidden="true">{open ? '×' : '💬'}</span>
    </button>
  </aside>
}
