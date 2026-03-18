'use client'

import { useState, useRef, useEffect } from 'react'
import { CheckCircle2, ArrowRight, ShieldAlert, Lightbulb, FileText, Download, Minimize2, Maximize2, Plus, Trash2, Pencil, Check, X, BarChart2, Loader2 } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { AccountData } from '@/lib/types'
import { exportQBRtoPPT } from '@/lib/exportPPT'

type Mode = 'standard' | 'executive'

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
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } if (e.key === 'Escape') cancel() }}
            rows={2}
            className="w-full text-sm rounded-lg px-2 py-1.5 resize-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--accent-border)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
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

// ── Editable list card ─────────────────────────────────────────────────────
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
    if (newItem.trim()) {
      onChange([...items, newItem.trim()])
      setNewItem('')
    }
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {numbered && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{i + 1}</span>
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
          {numbered && <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{items.length + 1}</span>}
          <input
            ref={addRef}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') { setAdding(false); setNewItem('') } }}
            placeholder="Type and press Enter..."
            className="flex-1 text-sm rounded-lg px-2 py-1.5"
            style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button onClick={addItem} className="p-1.5 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}><Check className="w-3.5 h-3.5" /></button>
          <button onClick={() => { setAdding(false); setNewItem('') }} className="p-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}><X className="w-3.5 h-3.5" /></button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg mt-1"
          style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}
        >
          <Plus className="w-3 h-3" /> Add item
        </button>
      )}
    </div>
  )
}

// ── Editable outcome row ───────────────────────────────────────────────────
type OutcomeRow = { metric: string; before: string; after: string; impact: string; technicalSignal?: string }

function EditableOutcomeRow({
  row,
  onChange,
  onDelete,
}: {
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
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--bg)', border: '1px solid var(--accent-border)' }}>
        {[
          { key: 'metric', label: 'Metric / Outcome' },
          { key: 'technicalSignal', label: 'Technical Signal' },
          { key: 'before', label: 'Before' },
          { key: 'after', label: 'After' },
          { key: 'impact', label: 'Business Impact' },
        ].map(({ key, label }) => (
          <div key={key}>
            <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
            <input
              value={(draft as any)[key] ?? ''}
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
    <div className="group rounded-lg p-3 relative" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{row.metric}</div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { setDraft(row); setEditing(true) }} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}><Pencil className="w-3 h-3" /></button>
          <button onClick={onDelete} className="p-0.5 rounded" style={{ color: '#f87171' }}><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
      {row.technicalSignal && (
        <div className="text-xs mb-2 px-2 py-1 rounded" style={{ background: 'rgba(87,94,207,0.08)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
          📡 {row.technicalSignal}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Before</div>
          <div style={{ color: '#f87171', fontWeight: 600 }}>{row.before}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>After</div>
          <div style={{ color: '#4ade80', fontWeight: 600 }}>{row.after}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Impact</div>
          <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.impact}</div>
        </div>
      </div>
    </div>
  )
}

// ── Main tab ───────────────────────────────────────────────────────────────
export function QBRExecBriefTab({ account }: { account: AccountData }) {
  const [mode, setMode] = useState<Mode>('standard')
  const [exporting, setExporting] = useState(false)

  async function handleExportPPT() {
    setExporting(true)
    try {
      await exportQBRtoPPT({ account, priorities, delivered, nextSteps, risks, opportunities, outcomes, mode })
    } finally {
      setExporting(false)
    }
  }

  // Editable state for each card
  const [priorities, setPriorities] = useState(account.qbrPriorities)
  const [delivered, setDelivered] = useState(account.qbrDelivered)
  const [nextSteps, setNextSteps] = useState(account.qbrNextSteps)
  const [risks, setRisks] = useState(account.qbrRisks)
  const [opportunities, setOpportunities] = useState(account.qbrOpportunities)
  const [outcomes, setOutcomes] = useState<OutcomeRow[]>(
    account.businessOutcomes.map(o => ({ ...o, technicalSignal: '' }))
  )

  function addOutcomeRow() {
    setOutcomes(prev => [...prev, { metric: 'New Metric', before: '', after: '', impact: '', technicalSignal: '' }])
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('executive')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'executive' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'executive' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'executive' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Minimize2 className="w-3.5 h-3.5" /> Executive (1–2 slides)
          </button>
          <button
            onClick={() => setMode('standard')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'standard' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'standard' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'standard' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Standard (6–8 slides)
          </button>
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
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Edit hint */}
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Pencil className="w-3 h-3" />
        Hover any item to edit or delete · Click "+ Add item" to add a new row
      </div>

      {/* Content grid */}
      <div className={`grid gap-4 ${mode === 'executive' ? 'grid-cols-2' : 'grid-cols-3'}`}>

        {/* What You Said Matters */}
        <CollapsibleCard title="What You Said Matters This Quarter" icon={<FileText className="w-4 h-4" />} defaultOpen>
          <EditableList
            items={priorities}
            onChange={setPriorities}
            icon={null}
            iconColor="var(--accent)"
            numbered
          />
        </CollapsibleCard>

        {/* What We Delivered */}
        <CollapsibleCard title="What We Delivered" icon={<CheckCircle2 className="w-4 h-4" />} defaultOpen>
          <EditableList
            items={delivered}
            onChange={setDelivered}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            iconColor="#4ade80"
          />
        </CollapsibleCard>

        {/* Next Steps */}
        <CollapsibleCard title="Next Steps & Decisions" icon={<ArrowRight className="w-4 h-4" />} defaultOpen>
          <EditableList
            items={nextSteps}
            onChange={setNextSteps}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconColor="var(--accent)"
          />
        </CollapsibleCard>

        {/* Standard mode only */}
        {mode === 'standard' && (
          <>
            {/* Risks */}
            <CollapsibleCard title="Risks We're Managing" icon={<ShieldAlert className="w-4 h-4" />}>
              <EditableList
                items={risks}
                onChange={setRisks}
                icon={<ShieldAlert className="w-3.5 h-3.5" />}
                iconColor="#f87171"
              />
            </CollapsibleCard>

            {/* Opportunities */}
            <CollapsibleCard title="Opportunities to Improve Outcomes" icon={<Lightbulb className="w-4 h-4" />}>
              <EditableList
                items={opportunities}
                onChange={setOpportunities}
                icon={<Lightbulb className="w-3.5 h-3.5" />}
                iconColor="#facc15"
              />
            </CollapsibleCard>

            {/* Technical Metrics → Business Outcomes */}
            <CollapsibleCard
              title="Technical Metrics → Business Outcomes"
              icon={<BarChart2 className="w-4 h-4" />}
              defaultOpen
            >
              <div className="space-y-2">
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Map each delivery metric to its client-facing business outcome. Add a technical signal to show the data behind the result.
                </p>
                {outcomes.map((row, i) => (
                  <EditableOutcomeRow
                    key={i}
                    row={row}
                    onChange={updated => { const next = [...outcomes]; next[i] = updated; setOutcomes(next) }}
                    onDelete={() => setOutcomes(outcomes.filter((_, j) => j !== i))}
                  />
                ))}
                <button
                  onClick={addOutcomeRow}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg w-full justify-center mt-1"
                  style={{ color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)' }}
                >
                  <Plus className="w-3 h-3" /> Add metric
                </button>
              </div>
            </CollapsibleCard>
          </>
        )}
      </div>
    </div>
  )
}
