'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatMessage } from '@/lib/types'
import { MessageBubble } from './MessageBubble'
import { Send, Loader2, Sparkles, Mic, MicOff } from 'lucide-react'

type SpeechRecognitionInstance = {
  continuous: boolean; interimResults: boolean; lang: string
  start: () => void; stop: () => void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionEvent = { results: { [i: number]: { [j: number]: { transcript: string }; isFinal: boolean } }; resultIndex: number }
type SpeechRecognitionErrorEvent = { error: string }

function createRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === 'undefined') return null
  const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition
    || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition
  return SR ? new SR() : null
}

interface ChatInterfaceProps {
  onFeedback: (messageId: string, type: string, detail?: string) => void
  initialPrompt?: string
}

const SUGGESTED_PROMPTS = [
  'Take me to my dashboard',
  'Which accounts have Quiet Risk — silent backup failures the client hasn\'t reported yet?',
  'Which accounts are in the Security Red Zone and what\'s the vCISO action plan?',
  'Show all Nutanix capacity triggers and draft expansion SOW summaries',
  'Generate a QBR value story pack for all 8 accounts using HCLTech data',
  'What is the full MRR expansion pipeline — Copilot, security retainers, and infra SOWs?',
  'Build a Trusted Advisor briefing for Thornfield Financial to address the Red Zone situation',
]

export function ChatInterface({ onFeedback, initialPrompt }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasInitialized = useRef(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const interimRef = useRef('')

  useEffect(() => { setVoiceSupported(!!createRecognition()) }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    interimRef.current = ''
  }, [])

  const startListening = useCallback(() => {
    const rec = createRecognition()
    if (!rec) return
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-US'
    rec.onresult = (e) => {
      let interim = ''; let final = ''
      for (let i = e.resultIndex; i < Object.keys(e.results).length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) { setInput(prev => (prev ? prev + ' ' + final.trim() : final.trim())); interimRef.current = '' }
      else { interimRef.current = interim; setInput(prev => { const base = prev.replace(interimRef.current, '').trimEnd(); return base ? base + ' ' + interim : interim }) }
    }
    rec.onerror = (e) => { if (e.error !== 'no-speech') console.warn('Speech error:', e.error); stopListening() }
    rec.onend = () => { setIsListening(false); recognitionRef.current = null; interimRef.current = ''; inputRef.current?.focus() }
    recognitionRef.current = rec; rec.start(); setIsListening(true)
  }, [stopListening])

  function toggleVoice() { if (isListening) stopListening(); else startListening() }

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    if (initialPrompt && !hasInitialized.current) { hasInitialized.current = true; sendMessage(initialPrompt) }
  }, [initialPrompt])

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return

    // Dashboard navigation
    const normalized = text.trim().toLowerCase()
    if (normalized.includes('take me to my dashboard') || normalized === 'dashboard') {
      if (typeof window !== 'undefined') window.location.href = '/dashboard'
      return
    }
    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)
    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() }])
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) }),
      })
      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                accumulated += parsed.text
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m))
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'I encountered an error. Please check your API key and try again.' } : m))
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'var(--accent-bg-medium)', border: '1px solid var(--accent-border-strong)' }}>
              <Sparkles className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-hover)' }}>Alysa</h2>
            <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Your HCLTech Intelligence Engine. Surface Quiet Risks, flag Security Red Zones, detect infrastructure capacity triggers, and build QBR value stories — automatically.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt}
                  className="text-left text-xs px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--accent-border-hover)'; (e.currentTarget).style.background = 'var(--surface-hover)' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border-subtle)'; (e.currentTarget).style.background = 'var(--surface)' }}
                  onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message}
                isLast={index === messages.length - 1 && message.role === 'assistant'}
                onFeedback={onFeedback} onFollowUp={q => sendMessage(q)} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}>A</div>
                <div className="flex items-center gap-1 mt-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--accent)', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end rounded-2xl px-4 py-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={isListening ? 'Listening…' : 'Ask about backup health, security posture, capacity, or request a QBR value story…'}
              rows={1} className="flex-1 bg-transparent outline-none text-sm resize-none overflow-hidden"
              style={{ color: isListening ? 'var(--accent-light)' : 'var(--text-primary)', maxHeight: '120px', minHeight: '24px' }}
              disabled={isStreaming} />
            {voiceSupported && (
              <button onClick={toggleVoice} disabled={isStreaming}
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                style={{
                  background: isListening ? 'rgba(248,113,113,0.15)' : 'var(--surface-subtle)',
                  color: isListening ? '#f87171' : 'var(--text-muted)',
                  border: isListening ? '1px solid rgba(248,113,113,0.35)' : '1px solid transparent',
                }}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ background: input.trim() && !isStreaming ? 'var(--accent)' : 'var(--border-subtle)', color: input.trim() && !isStreaming ? '#fff' : 'var(--text-muted)' }}>
              {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Alysa uses HCLTech · Commvault · CrowdStrike · Zscaler · Nutanix · M365
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
