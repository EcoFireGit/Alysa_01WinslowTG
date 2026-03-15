import { clsx } from 'clsx'
import { InfoTooltip } from './InfoTooltip'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

function getScoreColor(score: number) {
  if (score >= 70) return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
  if (score >= 40) return { text: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' }
  return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
}

function getSentimentColor(score: number) {
  if (score >= 70) return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
  if (score >= 40) return { text: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' }
  return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
}

export function RiskBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'
  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Risk</span>}
      {score}
      <InfoTooltip
        title="Risk Score"
        definition="Composite account risk score (0–100). Higher = more at risk. Combines backup health, security posture, infrastructure capacity, and sentiment drift signals from NorthstarMS."
        sources={['NorthstarMS', 'Commvault', 'CrowdStrike', 'Nutanix']}
      />
    </span>
  )
}

export function SentimentBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getSentimentColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'
  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Sentiment</span>}
      {score}
      <InfoTooltip
        title="Sentiment Score"
        definition="Client sentiment score (0–100). Higher = more positive. Derived from M365 email tone analysis, Teams activity, meeting cadence, and response latency."
        sources={['M365 Outlook', 'M365 Teams']}
      />
    </span>
  )
}

export function DataHealthBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getSentimentColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'
  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Data</span>}
      {score}
      <InfoTooltip
        title="Data Health Score"
        definition="Completeness and freshness of NorthstarMS data across all integrated sources (0–100). Higher = healthier. Low scores indicate gaps in Commvault, CrowdStrike, or Nutanix data that limit AI analysis accuracy."
        sources={['NorthstarMS', 'Commvault', 'ConnectWise PSA']}
      />
    </span>
  )
}

interface PriorityBadgeProps {
  priority: string
}

const priorityInfo: Record<string, { definition: string }> = {
  P0: { definition: 'Critical — immediate vCIO or Account Manager intervention required within 48 hours. Quiet Risk, Red Zone, or relationship failure signals active. Contract or renewal at risk.' },
  P1: { definition: 'Stabilise — proactive action needed within 1–2 weeks. Technical or relationship signals are elevated but no immediate churn trigger yet.' },
  P2: { definition: 'Monitor — low immediate risk. Stable NorthstarMS scores with ongoing attention needed. No urgent action required at this time.' },
  expand: { definition: 'Expand — account is healthy with strong NorthstarMS performance and an active expansion signal (infrastructure capacity SOW, M365 Copilot, or security retainer).' },
  maintain: { definition: 'Maintain — account is stable and in good standing. Focus on renewal preparation and deepening the vCIO relationship.' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config: Record<string, { text: string; bg: string; border: string; label: string }> = {
    P0:       { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: '🚨 P0' },
    P1:       { text: '#facc15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.3)',  label: '⚠️ P1' },
    P2:       { text: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', label: '📋 P2' },
    expand:   { text: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)',  label: '🚀 Expand' },
    maintain: { text: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', label: '✅ Maintain' },
  }
  const c = config[priority] || config.maintain
  const info = priorityInfo[priority]
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
      {info && (
        <InfoTooltip title={`Priority: ${c.label}`} definition={info.definition} />
      )}
    </span>
  )
}
