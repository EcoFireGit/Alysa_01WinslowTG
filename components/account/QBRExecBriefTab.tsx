'use client'

import { useState, useRef, useEffect } from 'react'
import {
  CheckCircle2, ArrowRight, Lightbulb, FileText, Download,
  Plus, Trash2, Pencil, Check, X, BarChart2, Loader2,
  User2, CalendarDays, Globe, TrendingUp, Handshake,
} from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionChat } from './SectionChat'
import { AccountData, ExpansionOpp } from '@/lib/types'
import { exportQBRtoPPT } from '@/lib/exportPPT'

// ── Inline editable text item ──────────────────────────────────────────────
function EditableItem({
  value,
  onChange,
  onDelete,
  icon,
  iconColor,
}: {
  value: string
  onChange: (v: string) => void
  onDelete: () => void
  icon: React.ReactNode
  iconColor: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  function save() {
    if (draft.trim()) onChange(draft.trim())
    else setDraft(value)
    setEditing(false)
  }

  function cancel() {
    setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 mt-1" style={{ color: iconColor }}>{icon}</span>
        <div className="flex-1 flex flex-col gap-1">
          <textarea
            ref={ref}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
              if (e.key === 'Escape') cancel()
            }}
            rows={2}
            className="w-full text-sm rounded-lg px-2 py-1.5 resize-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <div className="flex gap-1.5">
            <button onClick={save} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'var(--accent)', color: '#fff' }}>
              <Check className="w-3 h-3" /> Save
            </button>
            <button onClick={cancel} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-2 text-sm">
      <span className="flex-shrink-0 mt-0.5" style={{ color: iconColor }}>{icon}</span>
      <span className="flex-1" style={{ color: 'var(--text-primary)' }}>{value}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={() => { setDraft(value); setEditing(true) }} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }} title="Edit">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={onDelete} className="p-0.5 rounded" style={{ color: '#f87171' }} title="Delete">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Editable list ──────────────────────────────────────────────────────────
function EditableList({
  items,
  onChange,
  icon,
  iconColor,
  numbered = false,
}: {
  items: string[]
  onChange: (items: string[]) => void
  icon: React.ReactNode
  iconColor: string
  numbered?: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState('')
  const addRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) addRef.current?.focus()
  }, [adding])

  function addItem() {
    if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem('') }
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {numbered && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
              style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{i + 1}</span>
          )}
          <div className="flex-1">
            <EditableItem
              value={item}
              icon={numbered ? null : icon}
              iconColor={iconColor}
              onChange={v => { const next = [...items]; next[i] = v; onChange(next) }}
              onDelete={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
        </div>
      ))}
      {adding ? (
        <div className="flex items-center gap-2">
          {numbered && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{items.length + 1}</span>
          )}
          <input
            ref={addRef}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addItem()
              if (e.key === 'Escape') { setAdding(false); setNewItem('') }
            }}
            placeholder="Type and press Enter..."
            className="flex-1 text-sm rounded-lg px-2 py-1.5"
            style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={addItem} className="p-1.5 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setAdding(false); setNewItem('') }} className="p-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mt-1"
          style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}>
          <Plus className="w-3 h-3" /> Add item
        </button>
      )}
    </div>
  )
}

// ── Before/After outcome card ──────────────────────────────────────────────
type OutcomeRow = { metric: string; before: string; after: string; impact: string }

function OutcomeCard({ row, onChange, onDelete }: {
  row: OutcomeRow
  onChange: (r: OutcomeRow) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(row)

  function save() { onChange(draft); setEditing(false) }
  function cancel() { setDraft(row); setEditing(false) }

  if (editing) {
    return (
      <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)' }}>
        {([['metric', 'Metric / Outcome'], ['before', 'Before'], ['after', 'After'], ['impact', 'Business Impact']] as [keyof OutcomeRow, string][]).map(([key, label]) => (
          <div key={key}>
            <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <input
              value={draft[key]}
              onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
              className="w-full text-sm rounded px-2 py-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <button onClick={save} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'var(--accent)', color: '#fff' }}><Check className="w-3 h-3" /> Save</button>
          <button onClick={cancel} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}><X className="w-3 h-3" /> Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="group rounded-xl overflow-hidden" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
      {/* metric + edit controls */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>{row.metric}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setDraft(row); setEditing(true) }} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}><Pencil className="w-3 h-3" /></button>
          <button onClick={onDelete} className="p-0.5 rounded" style={{ color: '#f87171' }}><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>

      {/* before → after visual */}
      <div className="flex items-stretch gap-0 px-4 pb-3">
        <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Before</div>
          <div className="text-sm font-bold" style={{ color: '#f87171' }}>{row.before}</div>
        </div>
        <div className="flex items-center px-2">
          <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </div>
        <div className="flex-1 rounded-lg px-3 py-2 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>After</div>
          <div className="text-sm font-bold" style={{ color: '#4ade80' }}>{row.after}</div>
        </div>
      </div>

      {/* impact bar */}
      <div className="px-4 pb-3">
        <div className="rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(87,94,207,0.07)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.18))' }}>
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{row.impact}</span>
        </div>
      </div>
    </div>
  )
}

// ── Opportunity card ───────────────────────────────────────────────────────
const CONFIDENCE_COLORS = {
  High:   { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)' },
  Medium: { color: '#facc15', bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.25)' },
  Low:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
}

function OpportunityCard({ opp }: { opp: ExpansionOpp }) {
  const conf = CONFIDENCE_COLORS[opp.confidence]
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{opp.product}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold" style={{ color: '#4ade80' }}>{opp.potential}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>
            {opp.confidence}
          </span>
        </div>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{opp.reason}</p>
    </div>
  )
}

// ── Next step icon detection ───────────────────────────────────────────────
function nextStepIcon(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('introduc') || t.includes('meet') || t.includes('cto') || t.includes('cfo') || t.includes('ceo') || t.includes('exec')) return '🤝'
  if (t.includes('conference') || t.includes('summit') || t.includes('event') || t.includes('invitation') || t.includes('invite')) return '🎟️'
  if (t.includes('proposal') || t.includes('sow') || t.includes('migration') || t.includes('review') || t.includes('cloud')) return '📋'
  if (t.includes('deploy') || t.includes('implement') || t.includes('enroll') || t.includes('install')) return '⚙️'
  return '📅'
}

// ── Main tab ───────────────────────────────────────────────────────────────
export function QBRExecBriefTab({ account }: { account: AccountData }) {
  const [exporting, setExporting] = useState(false)

  const [delivered, setDelivered] = useState(account.qbrDelivered)
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>(account.businessOutcomes)
  const [priorities, setPriorities] = useState(account.qbrPriorities)
  const [nextSteps, setNextSteps] = useState(account.qbrNextSteps)

  const [presentedBy, setPresentedBy] = useState('Marcus Reilly')
  const [editingPresenter, setEditingPresenter] = useState(false)
  const [presenterDraft, setPresenterDraft] = useState(presentedBy)

  async function handleExportPPT() {
    setExporting(true)
    try {
      await exportQBRtoPPT({
        account,
        priorities,
        delivered,
        nextSteps,
        risks: account.qbrRisks,
        opportunities: account.qbrOpportunities,
        outcomes,
        mode: 'standard',
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Pencil className="w-3 h-3" />
          Hover any item to edit or delete · Click "+ Add item" to add a new row
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPPT}
            disabled={exporting}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'var(--surface)', color: exporting ? 'var(--text-muted)' : 'var(--text-secondary)', border: '1px solid var(--border-subtle)', cursor: exporting ? 'not-allowed' : 'pointer' }}
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {exporting ? 'Exporting…' : 'Export PPT'}
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Title card */}
      <div className="rounded-xl overflow-hidden"
        style={{ background: 'var(--accent-bg-hover, rgba(87,94,207,0.18))', border: '1px solid var(--accent-border-strong, rgba(87,94,207,0.4))' }}>
        <div className="px-6 py-5 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {account.name.charAt(0)}
          </div>
          <div>
            <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-hover)' }}>{account.name}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--accent-light)' }}>Quarterly Business Review</div>
          </div>
          <div className="flex items-center gap-6 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <User2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              {editingPresenter ? (
                <span className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={presenterDraft}
                    onChange={e => setPresenterDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { setPresentedBy(presenterDraft); setEditingPresenter(false) }
                      if (e.key === 'Escape') { setPresenterDraft(presentedBy); setEditingPresenter(false) }
                    }}
                    className="text-xs rounded px-1.5 py-0.5 w-44"
                    style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button onClick={() => { setPresentedBy(presenterDraft); setEditingPresenter(false) }} style={{ color: '#4ade80' }}><Check className="w-3 h-3" /></button>
                  <button onClick={() => { setPresenterDraft(presentedBy); setEditingPresenter(false) }} style={{ color: '#f87171' }}><X className="w-3 h-3" /></button>
                </span>
              ) : (
                <span className="cursor-pointer flex items-center gap-1 group" onClick={() => setEditingPresenter(true)}>
                  Presented by <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{presentedBy}</span>
                  <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION A: Delivered This Quarter ── */}
      <CollapsibleCard
        title="Delivered This Quarter"
        icon={<CheckCircle2 className="w-4 h-4" />}
        infoSources={['NorthstarMS', 'ConnectWise PSA', 'Commvault', 'CrowdStrike']}
        infoDefinition="Deliverables and measured outcomes sourced from NorthstarMS delivery telemetry and ConnectWise PSA project records."
        defaultOpen
      >
        <div className="space-y-5">
          {/* Deliverables list */}
          <div>
            <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WHAT WE DELIVERED</div>
            <EditableList
              items={delivered}
              onChange={setDelivered}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              iconColor="#4ade80"
            />
          </div>

          {/* Business outcome visuals */}
          {outcomes.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '16px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    TECHNICAL METRICS → BUSINESS OUTCOMES
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {outcomes.map((row, i) => (
                  <OutcomeCard
                    key={i}
                    row={row}
                    onChange={updated => { const next = [...outcomes]; next[i] = updated; setOutcomes(next) }}
                    onDelete={() => setOutcomes(outcomes.filter((_, j) => j !== i))}
                  />
                ))}
              </div>
              <button
                onClick={() => setOutcomes(prev => [...prev, { metric: 'New Metric', before: '', after: '', impact: '' }])}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mt-3 w-full justify-center"
                style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}>
                <Plus className="w-3 h-3" /> Add metric
              </button>
            </div>
          )}
        </div>
        <SectionChat
          sectionTitle="Delivered This Quarter"
          accountName={account.name}
          context={`Delivered:\n${delivered.join('\n')}\n\nOutcomes:\n${outcomes.map(o => `${o.metric}: ${o.before} → ${o.after}. Impact: ${o.impact}`).join('\n')}`}
          compact
        />
      </CollapsibleCard>

      {/* ── SECTION B: Business Priorities ── */}
      <CollapsibleCard
        title="Business Priorities"
        icon={<FileText className="w-4 h-4" />}
        infoSources={['Fathom', 'ConnectWise PSA', 'MS Teams']}
        infoDefinition="Priorities captured from Fathom meeting transcripts, ConnectWise account notes, and MS Teams conversations."
        defaultOpen
      >
        <EditableList
          items={priorities}
          onChange={setPriorities}
          icon={null}
          iconColor="var(--accent)"
          numbered
        />
        <SectionChat
          sectionTitle="Business Priorities"
          accountName={account.name}
          context={`Client priorities:\n${priorities.map((p, i) => `${i + 1}. ${p}`).join('\n')}`}
          compact
        />
      </CollapsibleCard>

      {/* ── SECTION C: Industry Insights ── */}
      <CollapsibleCard
        title="Industry Insights"
        icon={<Globe className="w-4 h-4" />}
        infoSources={['Forrester', 'IDC', 'Gartner', 'Industry Reports']}
        infoDefinition="Curated research and benchmarks from Forrester, IDC, and industry analysts relevant to this client's sector and priorities."
        defaultOpen
      >
        <div className="space-y-3">
          {account.industryInsights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-4"
              style={{ background: 'rgba(87,94,207,0.06)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.18))' }}>
              <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
            </div>
          ))}
        </div>
        <SectionChat
          sectionTitle="Industry Insights"
          accountName={account.name}
          context={`Industry insights for ${account.industry}:\n${account.industryInsights.join('\n')}`}
          compact
        />
      </CollapsibleCard>

      {/* ── SECTION D: Outcomes Driven Partnership ── */}
      <CollapsibleCard
        title="Outcomes Driven Partnership"
        icon={<Handshake className="w-4 h-4" />}
        infoSources={['NorthstarMS', 'ConnectWise PSA', 'Forrester', 'IDC']}
        infoDefinition="Recommended next investments that directly improve client outcomes — sourced from NorthstarMS delivery signals, identified gaps, and industry benchmarks."
        defaultOpen
      >
        <div className="space-y-3">
          {account.expansionOpps.map((opp, i) => (
            <OpportunityCard key={i} opp={opp} />
          ))}
        </div>
        <SectionChat
          sectionTitle="Outcomes Driven Partnership"
          accountName={account.name}
          context={`Partnership opportunities:\n${account.expansionOpps.map(o => `${o.product} — ${o.potential} (${o.confidence}): ${o.reason}`).join('\n')}`}
          compact
        />
      </CollapsibleCard>

      {/* ── SECTION E: Next Steps ── */}
      <CollapsibleCard
        title="Next Steps"
        icon={<ArrowRight className="w-4 h-4" />}
        infoSources={['Fathom', 'ConnectWise PSA']}
        infoDefinition="Agreed actions and upcoming touchpoints from Fathom meeting notes and ConnectWise action items."
        defaultOpen
      >
        <div className="space-y-2">
          {nextSteps.map((step, i) => (
            <div key={i} className="group flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
              <span className="text-base flex-shrink-0 mt-0.5">{nextStepIcon(step)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{step}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => setNextSteps(prev => prev.filter((_, j) => j !== i))}
                  className="p-0.5 rounded" style={{ color: '#f87171' }}
                  title="Remove">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setNextSteps(prev => [...prev, ''])}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mt-1"
            style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}>
            <Plus className="w-3 h-3" /> Add next step
          </button>
        </div>
        <SectionChat
          sectionTitle="Next Steps"
          accountName={account.name}
          context={`Agreed next steps:\n${nextSteps.join('\n')}`}
          compact
        />
      </CollapsibleCard>

    </div>
  )
}
