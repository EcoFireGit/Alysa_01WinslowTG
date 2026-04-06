'use client'

import { useState } from 'react'
import { Eye, EyeOff, AlertTriangle, UserX, TrendingDown, MessageSquareOff, Radar, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData } from '@/lib/types'

type BlindspotSeverity = 'Critical' | 'High' | 'Medium' | 'Low'
type BlindspotCategory = 'Engagement Decline' | 'Quiet Stakeholder' | 'Silent Risk' | 'Sentiment Drift' | 'Coverage Gap'

interface Blindspot {
  id: string
  category: BlindspotCategory
  title: string
  whyDangerous: string
  surfaceSignal: string    // what looks green / fine on paper
  hiddenSignal: string     // what's actually happening underneath
  source: string
  severity: BlindspotSeverity
  recommendedAction: string
  stakeholder?: string
}

const SEVERITY_STYLE = (s: BlindspotSeverity) =>
  s === 'Critical' ? { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' }
  : s === 'High'   ? { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.25)' }
  : s === 'Medium' ? { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.25)' }
  :                  { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' }

const CATEGORY_ICON: Record<BlindspotCategory, React.ReactNode> = {
  'Engagement Decline':  <TrendingDown className="w-3.5 h-3.5" />,
  'Quiet Stakeholder':   <UserX className="w-3.5 h-3.5" />,
  'Silent Risk':         <EyeOff className="w-3.5 h-3.5" />,
  'Sentiment Drift':     <MessageSquareOff className="w-3.5 h-3.5" />,
  'Coverage Gap':        <Radar className="w-3.5 h-3.5" />,
}

const CATEGORY_STYLE: Record<BlindspotCategory, { color: string; bg: string }> = {
  'Engagement Decline': { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  'Quiet Stakeholder':  { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  'Silent Risk':        { color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  'Sentiment Drift':    { color: '#c4b5fd', bg: 'rgba(196,181,253,0.1)' },
  'Coverage Gap':       { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
}

function deriveBlindspots(account: AccountData): Blindspot[] {
  const spots: Blindspot[] = []

  // Detect quiet / detractor stakeholders
  const detractors = account.stakeholders.filter(s => s.sentiment === 'Detractor')
  const neutrals = account.stakeholders.filter(s => s.sentiment === 'Neutral')
  const champions = account.stakeholders.filter(s => s.sentiment === 'Champion' || s.sentiment === 'Advocate')

  detractors.forEach((s, i) => {
    spots.push({
      id: `BS-STK-${i + 1}`,
      category: 'Quiet Stakeholder',
      title: `${s.name} (${s.role}) is a Detractor — not visibly engaged`,
      whyDangerous: 'Detractor stakeholders can influence renewal decisions silently without raising formal objections. They are most dangerous when SLAs are technically met.',
      surfaceSignal: 'SLAs met, tickets resolved, no formal escalation on record',
      hiddenSignal: `${s.name} has Detractor sentiment — may be influencing other stakeholders or preparing to advocate for a vendor switch internally`,
      source: 'CRM / Stakeholder Sentiment Tracker',
      severity: 'Critical',
      recommendedAction: `Schedule a 1:1 with ${s.name} outside of formal QBR setting. Ask open-ended questions about their day-to-day experience. Do not lead with SLA metrics.`,
      stakeholder: s.name,
    })
  })

  if (neutrals.length > 0 && champions.length === 0) {
    spots.push({
      id: `BS-CHM-01`,
      category: 'Engagement Decline',
      title: 'No Champion or Advocate on record — renewal is unsponsored',
      whyDangerous: 'Without an internal sponsor, contract renewals depend entirely on procurement comparison rather than relationship value. Any competitor engagement will find no resistance.',
      surfaceSignal: 'Stakeholder map shows contacts exist and meetings are occurring',
      hiddenSignal: 'Zero stakeholders classified as Champion or Advocate — no one is actively defending the HCLTech relationship internally',
      source: 'CRM / Stakeholder Sentiment Tracker',
      severity: 'Critical',
      recommendedAction: 'Identify the stakeholder most likely to benefit from HCLTech services and begin a deliberate Champion development play over the next 60 days.',
    })
  }

  // Check satisfaction signals for engagement decline
  const npsSignals = account.satisfactionSignals.filter(s =>
    s.toLowerCase().includes('nps') || s.toLowerCase().includes('dropped') || s.toLowerCase().includes('attendance')
  )
  if (npsSignals.length > 0) {
    spots.push({
      id: 'BS-ENG-01',
      category: 'Engagement Decline',
      title: 'Declining meeting attendance or NPS — engagement is eroding',
      whyDangerous: 'Declining QBR attendance and NPS scores are leading indicators of churn 3–6 months before a client formally expresses dissatisfaction. By the time they raise it, they have often already evaluated alternatives.',
      surfaceSignal: 'Account shows no overdue tickets, contract is active, billing is current',
      hiddenSignal: npsSignals.join(' · '),
      source: 'CRM / NPS Records / Calendar',
      severity: 'High',
      recommendedAction: 'Reframe the next touchpoint as a listening session, not a delivery update. Ask: "What would make this partnership feel different to you in the next quarter?"',
    })
  }

  // Infer silent risks from satisfactionSignals hinting at shadow IT or "managing us"
  const shadowSignals = account.satisfactionSignals.filter(s =>
    s.toLowerCase().includes('managing') || s.toLowerCase().includes('reactive') || s.toLowerCase().includes('catch')
  )
  if (shadowSignals.length > 0) {
    spots.push({
      id: 'BS-SIL-01',
      category: 'Silent Risk',
      title: '"Reactive not proactive" perception — client is managing the relationship',
      whyDangerous: 'When a client feels they are managing their MSP, they start evaluating alternatives quietly. This perception spreads to other stakeholders and is very difficult to reverse after renewal conversations begin.',
      surfaceSignal: 'Tickets are being raised and resolved, SLAs are being met, no formal complaints filed',
      hiddenSignal: shadowSignals.join(' · '),
      source: 'Voice of Customer / CRM Notes',
      severity: 'High',
      recommendedAction: 'Introduce a proactive weekly signal summary to the primary stakeholder — demonstrate HCLTech is watching before they have to ask. Lead with 1 "we caught this before it became your problem" item per week.',
    })
  }

  // Check inferences with high confidence that are unconfirmed
  const unconfirmedHighConfidence = account.inferences.filter(
    inf => inf.confidence >= 75 && inf.confirmed === null
  )
  if (unconfirmedHighConfidence.length > 0) {
    spots.push({
      id: 'BS-INF-01',
      category: 'Coverage Gap',
      title: `${unconfirmedHighConfidence.length} high-confidence risk inference${unconfirmedHighConfidence.length > 1 ? 's' : ''} not yet validated with client`,
      whyDangerous: 'Unvalidated inferences that turn out to be correct become missed opportunities. Inferences that turn out to be wrong — if acted upon — damage credibility. Both outcomes are blind spots.',
      surfaceSignal: 'Account profiling shows data captured, intel reviewed',
      hiddenSignal: unconfirmedHighConfidence.map(inf => `${inf.category}: "${inf.inference}" (${inf.confidence}% confidence, unconfirmed)`).join(' · '),
      source: 'Alysa Inference Engine / CRM',
      severity: 'Medium',
      recommendedAction: 'Use the next stakeholder touchpoint to validate the top inference directly. Frame as: "We\'ve been looking at your environment and noticed something — can you help us understand if this matches your experience?"',
    })
  }

  // Check recent intel for signals not communicated
  const monitoringAlerts = account.recentIntel.filter(intel =>
    intel.toLowerCase().includes('alert') || intel.toLowerCase().includes('failure') || intel.toLowerCase().includes('no client')
  )
  if (monitoringAlerts.length > 0) {
    spots.push({
      id: 'BS-MON-01',
      category: 'Silent Risk',
      title: 'Monitoring alerts fired but not surfaced to client',
      whyDangerous: 'When MSP monitoring catches issues that clients later discover independently, it destroys the "we\'re watching" value proposition. The client\'s implicit question is: "If you saw it, why didn\'t you tell me?"',
      surfaceSignal: 'RMM and monitoring tools are active, alerts are being logged',
      hiddenSignal: monitoringAlerts.join(' · '),
      source: 'RMM / Monitoring Platform',
      severity: 'High',
      recommendedAction: 'Implement a proactive communication protocol: any monitoring alert above P3 severity triggers a same-day client notification, even if already being remediated.',
    })
  }

  // Check profile completeness for coverage gaps
  if (account.profileCompleteness < 60) {
    spots.push({
      id: 'BS-COV-01',
      category: 'Coverage Gap',
      title: `Account profile only ${account.profileCompleteness}% complete — intelligence blind spots exist`,
      whyDangerous: 'Incomplete account profiles mean vCIOs are making recommendations based on partial data. Blind spots in tech stack, stakeholder sentiment, or budget knowledge lead to misaligned conversations and missed signals.',
      surfaceSignal: `Account is active, being managed, has regular touchpoints`,
      hiddenSignal: `${100 - account.profileCompleteness}% of account profile fields are empty or unconfirmed — likely missing: secondary stakeholders, full tech stack, budget constraints, or strategic initiatives`,
      source: 'Alysa Account Intelligence',
      severity: 'Medium',
      recommendedAction: 'Assign a profile completion task to the Account Manager. Target 80%+ before next QBR. Use discovery play templates to fill gaps conversationally rather than via forms.',
    })
  }

  return spots
}

function getRiskSummary(spots: Blindspot[], account: AccountData) {
  const critical = spots.filter(s => s.severity === 'Critical').length
  const high = spots.filter(s => s.severity === 'High').length
  const hasChampion = account.stakeholders.some(s => s.sentiment === 'Champion' || s.sentiment === 'Advocate')
  const paperHealth = account.qbrDelivered.length > 0

  const overallRisk = critical > 0 ? 'High' : high > 1 ? 'Elevated' : spots.length > 2 ? 'Moderate' : 'Low'
  const riskColor = overallRisk === 'High' ? '#f87171' : overallRisk === 'Elevated' ? '#fb923c' : overallRisk === 'Moderate' ? '#facc15' : '#4ade80'

  return { overallRisk, riskColor, critical, high, paperHealth, hasChampion }
}

export function BlindspotDetectionTab({ account }: { account: AccountData }) {
  const blindspots = deriveBlindspots(account)
  const { overallRisk, riskColor, critical, high, paperHealth, hasChampion } = getRiskSummary(blindspots, account)
  const [expanded, setExpanded] = useState<string | null>(blindspots[0]?.id ?? null)

  const byCategory = blindspots.reduce<Record<string, Blindspot[]>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = []
    acc[b.category].push(b)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-4">

        {/* "Looks green, but..." header */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}
        >
          <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#facc15' }} />
          <div>
            <div className="font-semibold mb-0.5" style={{ color: '#facc15' }}>What the data says vs. what it means</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {paperHealth
                ? `SLAs are being met and tickets are being resolved — but surface metrics can hide declining engagement, quiet detractors, and silent risks. The blindspots below are signals that don't appear in standard health dashboards.`
                : `This account's health score reflects real risk. The blindspots below identify additional hidden signals that compound the visible issues.`}
            </div>
          </div>
        </div>

        {/* Blindspots by category */}
        {Object.entries(byCategory).map(([category, spots]) => {
          const catStyle = CATEGORY_STYLE[category as BlindspotCategory]
          return (
            <CollapsibleCard
              key={category}
              title={category}
              badge={
                <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: catStyle.bg, color: catStyle.color }}>
                  {spots.length} signal{spots.length > 1 ? 's' : ''}
                </span>
              }
            >
              <div className="space-y-3">
                {spots.map(spot => {
                  const sev = SEVERITY_STYLE(spot.severity)
                  const isExpanded = expanded === spot.id
                  return (
                    <div
                      key={spot.id}
                      className="rounded-xl overflow-hidden"
                      style={{ border: `1px solid ${sev.border}`, background: 'var(--bg)' }}
                    >
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        onClick={() => setExpanded(isExpanded ? null : spot.id)}
                      >
                        <span style={{ color: catStyle.color }}>{CATEGORY_ICON[spot.category as BlindspotCategory]}</span>
                        <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-hover)' }}>{spot.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                            {spot.severity}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-3 text-xs" style={{ borderTop: '1px solid var(--border-faint)' }}>
                          {/* Surface vs Hidden */}
                          <div className="grid grid-cols-2 gap-3 pt-3">
                            <div className="p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
                              <div className="font-semibold mb-1 uppercase tracking-wide" style={{ color: '#4ade80' }}>What looks fine on paper</div>
                              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{spot.surfaceSignal}</div>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                              <div className="font-semibold mb-1 uppercase tracking-wide" style={{ color: '#f87171' }}>What's actually happening</div>
                              <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{spot.hiddenSignal}</div>
                            </div>
                          </div>

                          {/* Why dangerous */}
                          <div>
                            <div className="font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Why this is dangerous</div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{spot.whyDangerous}</div>
                          </div>

                          {/* Recommended action */}
                          <div className="p-3 rounded-lg" style={{ background: 'rgba(87,94,207,0.06)', border: '1px solid rgba(87,94,207,0.15)' }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Lightbulb className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                              <span className="font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Recommended Action</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{spot.recommendedAction}</div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{spot.source}</span>
                            <span className="text-xs font-mono ml-auto" style={{ color: 'var(--text-faint)' }}>{spot.id}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <SectionFeedback />
            </CollapsibleCard>
          )
        })}

        {blindspots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <Eye className="w-10 h-10 mb-3 opacity-20" />
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No blindspots detected</div>
            <div className="text-xs">Account health signals appear consistent with engagement data.</div>
          </div>
        )}
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">

        {/* Hidden Risk Score */}
        <CollapsibleCard title="Hidden Risk Score">
          <div className="space-y-3">
            <div className="text-center py-2">
              <div className="text-4xl font-bold mb-1" style={{ color: riskColor }}>{overallRisk}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Blindspot Risk Level</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div className="text-xl font-bold" style={{ color: '#f87171' }}>{critical}</div>
                <div style={{ color: 'var(--text-muted)' }}>Critical</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                <div className="text-xl font-bold" style={{ color: '#fb923c' }}>{high}</div>
                <div style={{ color: 'var(--text-muted)' }}>High</div>
              </div>
            </div>
            <div className="text-xs p-2.5 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account health score: </span>
              <span style={{ color: account.health < 40 ? '#f87171' : account.health < 70 ? '#facc15' : '#4ade80', fontWeight: 600 }}>{account.health}/100</span>
              {paperHealth && account.health > 50 && (
                <div className="mt-1 italic" style={{ color: 'var(--text-faint)' }}>⚠️ Health score may not reflect engagement signals below</div>
              )}
            </div>
          </div>
        </CollapsibleCard>

        {/* Stakeholder risk map */}
        <CollapsibleCard title="Stakeholder Risk Map">
          <div className="space-y-2">
            {account.stakeholders.map((s, i) => {
              const sentimentColor =
                s.sentiment === 'Champion' ? '#4ade80'
                : s.sentiment === 'Advocate' ? '#a5b4fc'
                : s.sentiment === 'Neutral' ? '#facc15'
                : '#f87171'
              return (
                <div key={i} className="flex items-center justify-between text-xs py-2" style={{ borderBottom: i < account.stakeholders.length - 1 ? '1px solid var(--border-faint)' : 'none' }}>
                  <div>
                    <div style={{ color: 'var(--text-hover)', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.role}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: sentimentColor + '22', color: sentimentColor, border: `1px solid ${sentimentColor}44` }}>
                    {s.sentiment}
                  </span>
                </div>
              )
            })}
            {!hasChampion && (
              <div className="text-xs p-2 rounded-lg mt-1" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                No Champion or Advocate — renewal has no internal sponsor
              </div>
            )}
          </div>
        </CollapsibleCard>

        {/* Satisfaction signals */}
        {account.satisfactionSignals.length > 0 && (
          <CollapsibleCard title="Satisfaction Signals">
            <div className="space-y-2">
              {account.satisfactionSignals.map((sig, i) => (
                <div key={i} className="text-xs p-2.5 rounded-lg flex items-start gap-2" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#facc15' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{sig}</span>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Detect info */}
        <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <EyeOff className="w-3.5 h-3.5" style={{ color: '#facc15' }} />
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>How Blindspot Detection Works</span>
          </div>
          Alysa cross-references SLA metrics against engagement signals, stakeholder sentiment, monitoring alerts, and voice-of-customer data to surface risks that don't appear in standard dashboards.
        </div>
      </div>
    </div>
  )
}
