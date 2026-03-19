'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Loader2, X, ChevronDown } from 'lucide-react'

const REACTIONS = ['👍', '👎', '💡', '⚠️', '🎯']

interface SectionChatProps {
  sectionTitle: string
  accountName: string
  context: string          // the section's data as plain text, injected as AI context
  compact?: boolean
}

export function SectionChat({ sectionTitle, accountName, context, compact = false }: SectionChatProps) {
  const [reaction, setReaction] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const responseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus()
  }, [chatOpen])

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight
    }
  }, [response])

  async function submit() {
    if (!question.trim() || loading) return
    const q = question.trim()
    setQuestion('')
    setResponse('')
    setLoading(true)

    const contextMessage = `You are answering a question about a specific section of an account profile in the Alysa NorthstarMS Intelligence Engine.

Account: ${accountName}
Section: ${sectionTitle}

Section data:
${context}

---
Answer the following question based on the section data above. Be concise — 2–4 sentences max. No sources block needed. Speak as a delivery or account manager advisor.

Question: ${q}`

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: contextMessage }] }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) throw new Error('No stream')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const { text } = JSON.parse(line.slice(6))
              if (text) setResponse(prev => prev + text)
            } catch {}
          }
        }
      }
    } catch {
      setResponse('Unable to get a response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={compact ? 'mt-2' : 'mt-3 pt-2'} style={{ borderTop: compact ? 'none' : '1px solid var(--border-faint)' }}>
      {/* Feedback row */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs mr-1" style={{ color: 'var(--text-faint)' }}>Feedback:</span>
        {REACTIONS.map(r => (
          <button
            key={r}
            onClick={() => setReaction(r === reaction ? null : r)}
            className="text-xs rounded px-1.5 py-0.5 transition-all"
            style={{
              background: reaction === r ? 'var(--accent-bg-medium, rgba(87,94,207,0.15))' : 'transparent',
              opacity: reaction && reaction !== r ? 0.4 : 1,
            }}
          >
            {r}
          </button>
        ))}

        {/* Ask AI toggle */}
        <button
          onClick={() => { setChatOpen(o => !o); setResponse('') }}
          className="ml-auto flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
          style={{
            background: chatOpen ? 'var(--accent-bg-hover)' : 'var(--accent-bg-soft, rgba(87,94,207,0.08))',
            color: 'var(--accent-light)',
            border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.2))',
          }}
          title="Ask Alysa about this section"
        >
          <MessageSquare className="w-3 h-3" />
          Ask AI
          <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: chatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div
          className="mt-2 rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.25))', background: 'var(--bg)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: '1px solid var(--accent-border-medium, rgba(87,94,207,0.2))', background: 'var(--accent-bg-soft, rgba(87,94,207,0.06))' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--accent-light)' }}>
              Ask Alysa about {sectionTitle}
            </span>
            <button onClick={() => setChatOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Response area */}
          {(response || loading) && (
            <div
              ref={responseRef}
              className="px-3 py-2 text-xs leading-relaxed max-h-40 overflow-y-auto"
              style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-faint)' }}
            >
              {loading && !response
                ? <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><Loader2 className="w-3 h-3 animate-spin" /> Thinking…</span>
                : response
              }
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              ref={inputRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder={`Ask about ${sectionTitle.toLowerCase()}…`}
              className="flex-1 text-xs rounded-lg px-2.5 py-1.5 outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={submit}
              disabled={loading || !question.trim()}
              className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all"
              style={{
                background: question.trim() ? 'var(--accent)' : 'var(--surface)',
                color: question.trim() ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                cursor: loading || !question.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
