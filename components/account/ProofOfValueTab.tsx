'use client'

import { useState } from 'react'
import { Trophy, TrendingUp, DollarSign, Star, FileText, Download, RefreshCw, Presentation, BarChart3, Sparkles } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData } from '@/lib/types'

type SlideSection = 'cover' | 'outcomes' | 'risk' | 'value' | 'next'

interface DraftSlide {
  id: SlideSection
  title: string
  headline: string
  bullets: string[]
  speakerNote: string
}

function deriveSlides(account: AccountData): DraftSlide[] {
  const totalValueDelivered = account.businessOutcomes.length > 0
    ? account.businessOutcomes.map(o => o.impact).join(' · ')
    : 'Operational continuity maintained across all managed services.'

  const confirmedOutcomes = account.outcomes.filter(o => o.accurate === true)
  const bookedExpansion = account.outcomes.filter(o => o.result === 'Expansion Booked')
  const derisked = account.outcomes.filter(o => o.result === 'De-risked Renewal' || o.result === 'Saved Cost')

  const topDelivered = account.qbrDelivered.slice(0, 3)
  const risks = account.qbrRisks.slice(0, 2)
  const nextSteps = account.qbrNextSteps.slice(0, 3)

  const expansionTotal = account.expansionOpps.reduce((sum, o) => {
    const n = parseInt(o.potential.replace(/[^0-9]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  const formattedTotal = expansionTotal >= 1000000
    ? `$${(expansionTotal / 1000000).toFixed(1)}M`
    : expansionTotal >= 1000
    ? `$${(expansionTotal / 1000).toFixed(0)}K`
    : `$${expansionTotal}`

  return [
    {
      id: 'cover',
      title: 'Cover',
      headline: `HCLTech × ${account.name}: Contract Value Review`,
      bullets: [
        `Prepared for: Executive Leadership`,
        `Period: Q1–Q2 2026`,
        `Contract ARR: ${account.arr} · Renewal: ${account.renewal}`,
        `Health Score: ${account.health}/100 · Wallet Share: ${account.walletShare}%`,
      ],
      speakerNote: `Open by thanking stakeholders for their time. This deck is designed to demonstrate the measurable business value HCLTech has delivered — not just SLA metrics — and outline the strategic roadmap for continued partnership.`,
    },
    {
      id: 'outcomes',
      title: 'What We Delivered',
      headline: `Tangible Outcomes Delivered This Period`,
      bullets: [
        ...topDelivered,
        ...account.businessOutcomes.slice(0, 2).map(o => `${o.metric}: ${o.before} → ${o.after} (${o.impact})`),
      ].slice(0, 5),
      speakerNote: `Anchor this slide on business outcomes, not ticket counts. Connect each delivery item to a business goal the client stated — use their own language from prior QBRs. Pause after the metric improvements and ask: "Does this match what you experienced on your side?"`,
    },
    {
      id: 'risk',
      title: 'Risks We Mitigated',
      headline: `Risks Detected & Mitigated Before They Became Incidents`,
      bullets: [
        ...risks,
        ...(derisked.length > 0 ? derisked.slice(0, 2).map(o => o.recommendation) : []),
        ...account.riskPosture.slice(0, 1).map(r => `Identified and escalated: ${r}`),
      ].slice(0, 5),
      speakerNote: `This is the "insurance" slide — it makes the invisible visible. Frame each risk as: "Here's what we caught before it became your problem." Ask: "Were you aware of this risk before we flagged it?" The goal is to convert the perception of reactive support into proactive protection.`,
    },
    {
      id: 'value',
      title: 'Business Value Summary',
      headline: `Quantified Value: What This Partnership Is Worth`,
      bullets: [
        `Expansion pipeline identified: ${formattedTotal} in high-confidence opportunities`,
        ...account.expansionOpps.slice(0, 2).map(o => `${o.product}: ${o.potential} — ${o.reason.split('—')[0].trim()}`),
        ...account.industryInsights.slice(0, 1),
      ].slice(0, 5),
      speakerNote: `Ground every number in their business context. Avoid vendor-speak — use their industry language. Reference the industry data point as a third-party validation, not a sales claim. End by asking: "Are these the areas you'd want us to prioritise over the next 6 months?"`,
    },
    {
      id: 'next',
      title: 'Roadmap & Next Steps',
      headline: `Strategic Roadmap: The Next 90 Days`,
      bullets: [
        ...nextSteps,
        ...account.topPriorities.slice(0, 2),
      ].slice(0, 5),
      speakerNote: `Close with a call to action. Ask for commitment on the top-priority item before you leave the room. Frame the roadmap as "our joint plan" — not "what HCLTech will do." Assign an owner and a date to each action item in the room.`,
    },
  ]
}

const SLIDE_COLORS: Record<SlideSection, { accent: string; bg: string; border: string }> = {
  cover:    { accent: '#a5b4fc', bg: 'rgba(165,180,252,0.08)', border: 'rgba(165,180,252,0.25)' },
  outcomes: { accent: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)' },
  risk:     { accent: '#facc15', bg: 'rgba(250,204,21,0.08)',  border: 'rgba(250,204,21,0.25)' },
  value:    { accent: '#93c5fd', bg: 'rgba(147,197,253,0.08)', border: 'rgba(147,197,253,0.25)' },
  next:     { accent: '#c4b5fd', bg: 'rgba(196,181,253,0.08)', border: 'rgba(196,181,253,0.25)' },
}

const SLIDE_ICONS: Record<SlideSection, React.ReactNode> = {
  cover:    <Presentation className="w-4 h-4" />,
  outcomes: <Trophy className="w-4 h-4" />,
  risk:     <Star className="w-4 h-4" />,
  value:    <DollarSign className="w-4 h-4" />,
  next:     <TrendingUp className="w-4 h-4" />,
}

export function ProofOfValueTab({ account }: { account: AccountData }) {
  const slides = deriveSlides(account)
  const [activeSlide, setActiveSlide] = useState<SlideSection>('cover')
  const [showNotes, setShowNotes] = useState(false)

  const current = slides.find(s => s.id === activeSlide)!
  const colors = SLIDE_COLORS[activeSlide]

  const totalOutcomes = account.outcomes.filter(o => o.accurate === true).length
  const totalDelivered = account.qbrDelivered.length
  const expansionTotal = account.expansionOpps.reduce((sum, o) => {
    const n = parseInt(o.potential.replace(/[^0-9]/g, ''))
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const formattedExpansion = expansionTotal >= 1000000
    ? `$${(expansionTotal / 1000000).toFixed(1)}M`
    : expansionTotal >= 1000
    ? `$${(expansionTotal / 1000).toFixed(0)}K`
    : `$${expansionTotal}`

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 — slide builder */}
      <div className="col-span-2 space-y-4">

        {/* Generation bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Auto-generated from delivery logs, QBR data, and outcome records</span>
          <button
            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
            style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)', border: '1px solid rgba(87,94,207,0.2)' }}
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </button>
        </div>

        {/* Slide navigator */}
        <div className="flex gap-1 flex-wrap">
          {slides.map((slide, idx) => {
            const c = SLIDE_COLORS[slide.id]
            const isActive = activeSlide === slide.id
            return (
              <button
                key={slide.id}
                onClick={() => setActiveSlide(slide.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: isActive ? c.bg : 'var(--surface)',
                  color: isActive ? c.accent : 'var(--text-muted)',
                  border: `1px solid ${isActive ? c.border : 'var(--border-faint)'}`,
                }}
              >
                <span style={{ color: isActive ? c.accent : 'var(--text-faint)' }}>{SLIDE_ICONS[slide.id]}</span>
                <span className="hidden sm:inline">{idx + 1}.</span> {slide.title}
              </button>
            )
          })}
        </div>

        {/* Slide preview */}
        <CollapsibleCard
          title={`Slide ${slides.findIndex(s => s.id === activeSlide) + 1}: ${current.title}`}
          badge={
            <button
              onClick={() => setShowNotes(n => !n)}
              className="text-xs px-2 py-0.5 rounded ml-2"
              style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)', border: '1px solid rgba(87,94,207,0.2)' }}
            >
              {showNotes ? 'Hide notes' : 'Speaker notes'}
            </button>
          }
          defaultOpen
        >
          {/* Slide mockup */}
          <div
            className="rounded-xl p-6 mb-4 min-h-[220px]"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: colors.accent + '22', color: colors.accent }}>
                {SLIDE_ICONS[activeSlide]}
              </div>
              <div>
                <div className="text-xs font-semibold mb-1 uppercase tracking-widest" style={{ color: colors.accent }}>
                  HCLTech · {account.name}
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-hover)' }}>{current.headline}</h2>
              </div>
            </div>
            <ul className="space-y-2 ml-1">
              {current.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Speaker notes */}
          {showNotes && (
            <div
              className="rounded-lg p-4 text-xs leading-relaxed"
              style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}
            >
              <div className="font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SPEAKER NOTES</div>
              {current.speakerNote}
            </div>
          )}

          {/* Slide actions */}
          <div className="flex flex-wrap gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--border-faint)' }}>
            {['Simplify Language', 'Make More Quantitative', 'Add Industry Data', 'Shorten to 3 Bullets'].map(label => (
              <button key={label} className="text-xs px-2.5 py-1 rounded-lg transition-all" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {label}
              </button>
            ))}
          </div>
          <SectionFeedback />
        </CollapsibleCard>

        {/* Delivery evidence table */}
        <CollapsibleCard title="Delivery Evidence Log" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>{account.qbrDelivered.length} items</span>}>
          <div className="space-y-2">
            {account.qbrDelivered.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }}>✓</span>
                <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
            {account.businessOutcomes.map((o, i) => (
              <div key={`bo-${i}`} className="p-3 rounded-lg text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-3 h-3 flex-shrink-0" style={{ color: '#4ade80' }} />
                  <span className="font-semibold" style={{ color: 'var(--text-hover)' }}>{o.metric}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 ml-5">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Before: </span>
                    <span style={{ color: '#f87171' }}>{o.before}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>After: </span>
                    <span style={{ color: '#4ade80' }}>{o.after}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>{o.impact}</div>
                </div>
              </div>
            ))}
          </div>
          <SectionFeedback />
        </CollapsibleCard>
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">

        {/* Value scorecard */}
        <CollapsibleCard title="Value Scorecard">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>{totalDelivered}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Items Delivered</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.2)' }}>
                <div className="text-2xl font-bold" style={{ color: '#93c5fd' }}>{formattedExpansion}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Expansion Pipeline</div>
              </div>
            </div>
            <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(87,94,207,0.06)', border: '1px solid rgba(87,94,207,0.2)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{account.walletShare}%</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Current Wallet Share</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Renewal: {account.renewal}</div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Expansion opportunities */}
        <CollapsibleCard title="Expansion Opportunities" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>Internal</span>}>
          <div className="space-y-2">
            {account.expansionOpps.map((opp, i) => (
              <div key={i} className="text-xs p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold" style={{ color: 'var(--text-hover)' }}>{opp.product}</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>{opp.potential}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{opp.reason.split('—')[0].trim()}</div>
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* Export actions */}
        <CollapsibleCard title="Export">
          <div className="space-y-2">
            {[
              { label: 'Export as PowerPoint', icon: <Presentation className="w-3.5 h-3.5" /> },
              { label: 'Export as PDF', icon: <Download className="w-3.5 h-3.5" /> },
              { label: 'Copy Board Summary', icon: <FileText className="w-3.5 h-3.5" /> },
            ].map(({ label, icon }) => (
              <button key={label} className="w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all text-left" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--accent)' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </CollapsibleCard>

        {/* Industry context */}
        {account.industryInsights.length > 0 && (
          <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
            <div className="font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Industry Context</div>
            {account.industryInsights[0]}
          </div>
        )}
      </div>
    </div>
  )
}
