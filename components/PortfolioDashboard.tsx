'use client'

import { accounts, portfolioStats } from '@/lib/accounts'
import { AccountCard } from './AccountCard'
import { Account } from '@/lib/types'
import { InfoTooltip } from './InfoTooltip'
import { RedFlagBriefing } from './RedFlagBriefing'

interface PortfolioDashboardProps {
  onAccountClick: (account: Account) => void
  onAskAbout: (prompt: string) => void
}

function StatCard({ label, value, sub, color, tooltip }: {
  label: string; value: string; sub?: string; color?: string
  tooltip?: { title: string; definition: string; sources?: string[] }
}) {
  return (
    <div className="rounded-xl p-4 relative" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
      {tooltip && (
        <div className="absolute top-3 right-3">
          <InfoTooltip title={tooltip.title} definition={tooltip.definition} sources={tooltip.sources} />
        </div>
      )}
      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-xl font-bold" style={{ color: color || 'var(--text-hover)' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  )
}

export function PortfolioDashboard({ onAccountClick, onAskAbout }: PortfolioDashboardProps) {
  const p0Accounts = accounts.filter(a => a.priority === 'P0')
  const expandAccounts = accounts.filter(a => a.priority === 'expand')
  const otherAccounts = accounts.filter(a => a.priority !== 'P0' && a.priority !== 'expand')

  const quietRiskCount = accounts.filter(a => a.backupHealth?.quietRisk).length
  const redZoneCount = accounts.filter(a => a.securityPosture?.redZone).length
  const expansionTriggerCount = accounts.filter(a => a.infraCapacity?.expansionTrigger).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-hover)' }}>NorthstarMS Client Portfolio</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>8 accounts · $2.1M ARR · $172K MRR · March 2026</p>
      </div>

      {/* Quiet Risk Briefing */}
      <RedFlagBriefing onAskAbout={onAskAbout} />

      {/* Alert strip */}
      {(quietRiskCount > 0 || redZoneCount > 0 || expansionTriggerCount > 0) && (
        <div className="flex gap-2 flex-wrap">
          {quietRiskCount > 0 && (
            <div
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs flex items-center gap-2"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
            >
              🤫 <span><strong>{quietRiskCount}</strong> Quiet Risk{quietRiskCount > 1 ? 's' : ''} — silent backup failure</span>
            </div>
          )}
          {redZoneCount > 0 && (
            <div
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs flex items-center gap-2"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}
            >
              🔴 <span><strong>{redZoneCount}</strong> Red Zone — vCISO needed</span>
            </div>
          )}
          {expansionTriggerCount > 0 && (
            <div
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs flex items-center gap-2"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}
            >
              🖥️ <span><strong>{expansionTriggerCount}</strong> expansion SOW{expansionTriggerCount > 1 ? 's' : ''} ready</span>
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total ARR"
          value="$2.1M"
          sub="$172K MRR · 8 accounts"
          tooltip={{
            title: 'Total ARR vs MRR',
            definition: 'ARR (Annual Recurring Revenue) is total contracted managed services value per year. MRR (Monthly Recurring Revenue) is ARR ÷ 12. Simulated demo data.',
            sources: ['ConnectWise PSA'],
          }}
        />
        <StatCard
          label="ARR at Risk"
          value="$648K"
          sub="$54K MRR · 2 accounts · act now"
          color="#f87171"
          tooltip={{
            title: 'ARR at Churn Risk',
            definition: 'Contract value at risk due to active Quiet Risk events, Security Red Zone, or relationship failures requiring immediate intervention.',
            sources: ['NorthstarMS', 'CrowdStrike', 'Commvault'],
          }}
        />
        <StatCard
          label="Expansion Pipeline"
          value="$145–215K"
          sub="SOW ready · Nutanix + Copilot"
          color="#4ade80"
          tooltip={{
            title: 'Near-Term Expansion Pipeline',
            definition: 'Additional ARR achievable within 60 days from infrastructure capacity SOWs, M365 Copilot licensing, and security retainer upsells. Triggered by NorthstarMS capacity signals.',
            sources: ['Nutanix', 'NorthstarMS', 'M365'],
          }}
        />
        <StatCard
          label="NorthstarMS Alerts"
          value={`${quietRiskCount + redZoneCount} Active`}
          sub={`${quietRiskCount} Quiet Risk · ${redZoneCount} Red Zone`}
          color={quietRiskCount + redZoneCount > 0 ? '#f87171' : '#4ade80'}
          tooltip={{
            title: 'Active NorthstarMS Alerts',
            definition: 'Count of Quiet Risk (silent backup failures) and Security Red Zone (elevated threats + declining sentiment) situations requiring immediate Account Manager action.',
            sources: ['NorthstarMS', 'Commvault', 'CrowdStrike'],
          }}
        />
      </div>

      {/* Health distribution */}
      <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="text-xs font-medium mb-3 inline-flex items-center" style={{ color: 'var(--text-secondary)' }}>
          CLIENT HEALTH
          <InfoTooltip
            title="NorthstarMS Client Health"
            definition="Distribution of accounts and ARR across NorthstarMS health tiers. Calculated from composite Risk, Sentiment, and Data Health scores across Commvault, CrowdStrike, Zscaler, and Nutanix signals."
            sources={['NorthstarMS', 'Commvault', 'CrowdStrike', 'Nutanix']}
          />
        </div>
        <div className="flex gap-2 mb-3">
          {[
            { label: 'At Risk',   count: 2, arr: '$648K',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
            { label: 'Stabilise', count: 3, arr: '$792K',  color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
            { label: 'Expand',    count: 2, arr: '$456K',  color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
            { label: 'Stable',    count: 1, arr: '$168K',  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
          ].map(item => (
            <div key={item.label} className="flex-1 rounded-lg p-2 text-center" style={{ background: item.bg }}>
              <div className="text-lg font-bold" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs" style={{ color: item.color, opacity: 0.8 }}>{item.arr}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full rounded-sm" style={{ width: '31%', background: '#f87171' }} title="At Risk: $648K" />
          <div className="h-full rounded-sm" style={{ width: '38%', background: '#facc15' }} title="Stabilise: $792K" />
          <div className="h-full rounded-sm" style={{ width: '22%', background: '#4ade80' }} title="Expand: $456K" />
          <div className="h-full rounded-sm" style={{ width: '9%',  background: '#94a3b8' }} title="Stable: $168K" />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>QUICK ACTIONS</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🤫 Quiet Risk Audit',           prompt: 'Which accounts have silent technical failures the client hasn\'t reported yet? For each one, draft the proactive disclosure message.' },
            { label: '📊 QBR Value Story Pack',       prompt: 'Generate a QBR value story for each account — translate NorthstarMS uptime, backup health, and security data into executive-ready business outcomes.' },
            { label: '🖥️ Capacity Expansion Brief',   prompt: 'Which accounts are approaching or past the 85% Nutanix/Dell infrastructure threshold? Draft an expansion SOW summary for each.' },
            { label: '🔴 Security Red Zone Report',   prompt: 'Which accounts are in the Security Red Zone — elevated CrowdStrike threats combined with declining sentiment? What is the vCISO action plan?' },
            { label: '💰 MRR Expansion Pipeline',     prompt: 'Show the full MRR expansion pipeline — infrastructure SOWs, M365 Copilot licensing, and security retainer upsells. Prioritize by close probability.' },
            { label: '📋 NorthstarMS Score Report',   prompt: 'Run a full NorthstarMS portfolio report — backup health, security posture, and infrastructure capacity scores across all 8 accounts.' },
          ].map(action => (
            <button
              key={action.label}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{ background: 'var(--accent-bg-soft)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-medium)' }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'var(--accent-bg-hover)'
                ;(e.target as HTMLElement).style.borderColor = 'var(--accent-border-max)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'var(--accent-bg-soft)'
                ;(e.target as HTMLElement).style.borderColor = 'var(--accent-border-medium)'
              }}
              onClick={() => onAskAbout(action.prompt)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* P0 accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px #f87171' }} />
          <div className="text-xs font-medium" style={{ color: '#f87171' }}>QUIET RISK & RED ZONE — IMMEDIATE ACTION</div>
        </div>
        <div className="space-y-2">
          {p0Accounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>

      {/* Expand accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <div className="text-xs font-medium" style={{ color: '#4ade80' }}>EXPANSION READY — SOW OPPORTUNITIES</div>
        </div>
        <div className="space-y-2">
          {expandAccounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>

      {/* Other accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#facc15' }} />
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>STABILISE & MAINTAIN</div>
        </div>
        <div className="space-y-2">
          {otherAccounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
