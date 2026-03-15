'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'
import { RiskBadge, SentimentBadge, DataHealthBadge, PriorityBadge } from './ScoreBadge'
import { InfoTooltip } from './InfoTooltip'

interface AccountCardProps {
  account: Account
  onClick?: (account: Account) => void
  compact?: boolean
}

function formatArr(arr: number) {
  if (arr >= 1000000) return `$${(arr / 1000000).toFixed(1)}M`
  return `$${Math.round(arr / 1000)}K`
}

function getHealthDot(health: string) {
  const colors = { red: '#f87171', yellow: '#facc15', green: '#4ade80' }
  return colors[health as keyof typeof colors] || '#8a8680'
}

const confidenceConfig = {
  high:     { label: '🟢 High',     color: '#4ade80' },
  moderate: { label: '🟡 Moderate', color: '#facc15' },
  low:      { label: '🔴 Low',      color: '#f87171' },
}

const categoryConfig = {
  'Risk Mitigation': { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  'Revenue Impact':  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  'Efficiency Gain': { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' },
  'Compliance':      { color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  'Operational':     { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

const backupStatusConfig = {
  healthy:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: '✅ Healthy' },
  warning:  { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  label: '⚠️ Warning' },
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: '🔴 Critical' },
  failed:   { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: '🚨 Failed' },
}

const postureConfig = {
  secure:   { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: '✅ Secure' },
  elevated: { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  label: '⚠️ Elevated' },
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: '🔴 Critical' },
}

const infraStatusConfig = {
  healthy:  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: '✅ Healthy' },
  warning:  { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  label: '⚠️ Approaching' },
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: '🔴 Critical' },
}

export function AccountCard({ account, onClick, compact = false }: AccountCardProps) {
  const [showValue, setShowValue] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [showInfra, setShowInfra] = useState(false)
  const [showBlocker, setShowBlocker] = useState(false)
  const dotColor = getHealthDot(account.health)

  return (
    <div
      className="rounded-xl cursor-pointer transition-all duration-200"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--accent-border-hover)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--surface-hover)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--border-subtle)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'
      }}
      onClick={() => onClick?.(account)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
              style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
            />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>
                {account.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {account.industry} · {formatArr(account.arr)} ARR · {formatArr(Math.round(account.arr / 12))} MRR
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Quiet Risk flag */}
            {account.backupHealth?.quietRisk && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                onClick={e => e.stopPropagation()}
              >
                🤫 Quiet Risk
                <InfoTooltip
                  title="Quiet Risk Detected"
                  definition="NorthstarMS has detected a technical failure the client has not reported. Backup jobs failing silently. Proactive disclosure is required — clients expect WTG to catch what they miss."
                  sources={['Commvault', 'NorthstarMS']}
                />
              </span>
            )}
            {/* Red Zone flag */}
            {account.securityPosture?.redZone && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}
                onClick={e => e.stopPropagation()}
              >
                🔴 Red Zone
                <InfoTooltip
                  title="Security Red Zone"
                  definition="CrowdStrike threat detections are elevated AND client sentiment is declining simultaneously. This combination requires a vCISO emergency briefing within 48 hours."
                  sources={['CrowdStrike', 'Zscaler', 'M365']}
                />
              </span>
            )}
            {/* Scope drift warning */}
            {account.scopeDrift && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}
                onClick={e => e.stopPropagation()}
              >
                ⚠️ Scope
                <InfoTooltip
                  title="Scope Drift Detected"
                  definition={`${account.scopeDrift.description} — ${account.scopeDrift.sowReference}. Source: ${account.scopeDrift.source}.`}
                  sources={['M365 Teams', 'Email']}
                />
              </span>
            )}
            <PriorityBadge priority={account.priority} />
          </div>
        </div>

        {/* Scores row */}
        <div className="flex gap-2 mb-3">
          <RiskBadge score={account.riskScore} size="sm" />
          <SentimentBadge score={account.sentimentScore} size="sm" />
          <DataHealthBadge score={account.dataHealthScore} size="sm" />
        </div>

        {/* Profile completeness bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="inline-flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              Profile
              <InfoTooltip
                title="Profile Completeness"
                definition="How complete this client profile is — business goals, key contacts, contract terms, tech stack, and renewal details. Lower scores limit Alysa's analysis and signal gaps in strategic alignment."
                sources={['ConnectWise PSA', 'NorthstarMS']}
              />
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{account.profileCompleteness}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${account.profileCompleteness}%`,
                background: account.profileCompleteness >= 70 ? '#4ade80' : account.profileCompleteness >= 40 ? '#facc15' : '#f87171',
              }}
            />
          </div>
        </div>

        {/* Key signals */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {account.keySignals.slice(0, 2).map((signal, i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                {signal}
              </span>
            ))}
          </div>
        )}

        {/* Renewal tag */}
        {account.renewalMonths && (
          <div
            className="mt-2 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{
              background: account.renewalMonths <= 4 ? 'rgba(248,113,113,0.1)' : 'rgba(250,204,21,0.1)',
              color: account.renewalMonths <= 4 ? '#f87171' : '#facc15',
            }}
          >
            🔔 Renewal in {account.renewalMonths}mo
            <InfoTooltip
              title="Renewal Window"
              definition="Months until contract renewal. Accounts within 4 months require an active NorthstarMS value story to secure continuation. Source: ConnectWise PSA contract terms."
              sources={['ConnectWise PSA']}
            />
          </div>
        )}

        {/* Expansion potential */}
        {account.expansionPotential && (
          <div
            className="mt-2 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
          >
            💰 +{formatArr(account.expansionPotential.low)}–{formatArr(account.expansionPotential.high)} potential
            <InfoTooltip
              title="Expansion Potential"
              definition="Estimated additional ARR from infrastructure expansion, security retainers, or M365 Copilot licensing. Modeled from NorthstarMS capacity signals and client headcount."
              sources={['Nutanix', 'NorthstarMS', 'M365', 'Forrester']}
            />
          </div>
        )}
      </div>

      {/* Value Story toggle */}
      {account.valueSnapshot && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowValue(v => !v)}
          >
            <span className="flex items-center gap-1.5">
              📊 NorthstarMS Value Story
              <InfoTooltip
                title="NorthstarMS Value Story"
                definition="Translates NorthstarMS technical signals — uptime, backup health, threat data — into executive-ready business outcomes for QBR presentations. No manual spreadsheet work required."
                sources={account.valueSnapshot.sources}
              />
            </span>
            <span>{showValue ? '▲' : '▼'}</span>
          </button>
          {showValue && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>TECHNICAL SIGNAL</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.valueSnapshot.technicalSignal}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>BUSINESS OUTCOME</div>
                  {(() => {
                    const cat = categoryConfig[account.valueSnapshot!.outcomeCategory]
                    return (
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: cat.bg, color: cat.color }}>
                        {account.valueSnapshot!.outcomeCategory}
                      </span>
                    )
                  })()}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.valueSnapshot.businessOutcome}</p>
                {account.valueSnapshot.dollarValue && (
                  <div className="mt-2 text-sm font-bold" style={{ color: '#4ade80' }}>{account.valueSnapshot.dollarValue}</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {account.valueSnapshot.sources.map(s => (
                    <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>{s}</span>
                  ))}
                </div>
                <span className="text-xs" style={{ color: confidenceConfig[account.valueSnapshot.confidence].color }}>
                  {confidenceConfig[account.valueSnapshot.confidence].label}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backup Health toggle */}
      {account.backupHealth && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowBackup(b => !b)}
          >
            <span className="flex items-center gap-1.5">
              🛡️ Backup Health
              <InfoTooltip
                title="Commvault Backup Health"
                definition="Job-level backup success rate from Commvault. WTG monitors this on behalf of co-managed clients via NorthstarMS. Silent failures are a Quiet Risk — clients expect WTG to proactively flag issues before data loss occurs."
                sources={['Commvault', 'NorthstarMS']}
              />
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: backupStatusConfig[account.backupHealth.status].bg, color: backupStatusConfig[account.backupHealth.status].color }}
            >
              {backupStatusConfig[account.backupHealth.status].label}
            </span>
          </button>
          {showBackup && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>SUCCESS RATE (30d)</span>
                  <span className="text-xs font-bold" style={{
                    color: account.backupHealth.successRate >= 95 ? '#4ade80' : account.backupHealth.successRate >= 80 ? '#facc15' : '#f87171'
                  }}>{account.backupHealth.successRate}%</span>
                </div>
                <div className="h-2 rounded-full mb-2" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${account.backupHealth.successRate}%`,
                      background: account.backupHealth.successRate >= 95 ? '#4ade80' : account.backupHealth.successRate >= 80 ? '#facc15' : '#f87171',
                    }}
                  />
                </div>
                <div className="flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>❌ {account.backupHealth.failedJobs} failed jobs</span>
                  <span>✓ Last success: {account.backupHealth.lastSuccessDate}</span>
                </div>
              </div>
              {account.backupHealth.quietRisk && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#f87171', letterSpacing: '0.06em' }}>🤫 QUIET RISK — CLIENT UNAWARE</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Client has not reported these failures. Proactive disclosure required — this is what co-managed clients pay for.</p>
                </div>
              )}
              <div className="rounded-lg p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>ALYSA INSIGHT</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.backupHealth.insight}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Posture toggle */}
      {account.securityPosture && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowSecurity(s => !s)}
          >
            <span className="flex items-center gap-1.5">
              🔒 Security Posture
              <InfoTooltip
                title="Security Posture — CrowdStrike + Zscaler"
                definition="CrowdStrike endpoint threat detections and Zscaler secure web gateway score. Red Zone is triggered when threats are elevated AND client sentiment is declining — requires vCISO emergency briefing."
                sources={['CrowdStrike', 'Zscaler', 'M365']}
              />
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: postureConfig[account.securityPosture.posture].bg, color: postureConfig[account.securityPosture.posture].color }}
            >
              {postureConfig[account.securityPosture.posture].label}
            </span>
          </button>
          {showSecurity && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CROWDSTRIKE (30d)</div>
                    <div className="text-sm font-bold" style={{ color: account.securityPosture.threatDetections > 20 ? '#f87171' : account.securityPosture.threatDetections > 5 ? '#facc15' : '#4ade80' }}>
                      {account.securityPosture.threatDetections} threats
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ZSCALER SCORE</div>
                    <div className="text-sm font-bold" style={{ color: account.securityPosture.zscalerScore >= 75 ? '#4ade80' : account.securityPosture.zscalerScore >= 55 ? '#facc15' : '#f87171' }}>
                      {account.securityPosture.zscalerScore}/100
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${account.securityPosture.zscalerScore}%`,
                      background: account.securityPosture.zscalerScore >= 75 ? '#4ade80' : account.securityPosture.zscalerScore >= 55 ? '#facc15' : '#f87171',
                    }}
                  />
                </div>
              </div>
              {account.securityPosture.redZone && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#f87171', letterSpacing: '0.06em' }}>🔴 SECURITY RED ZONE</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Threats elevated + sentiment declining. vCISO emergency briefing required within 48 hours.</p>
                </div>
              )}
              <div className="rounded-lg p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>ALYSA INSIGHT</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.securityPosture.insight}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Infrastructure Capacity toggle */}
      {account.infraCapacity && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowInfra(i => !i)}
          >
            <span className="flex items-center gap-1.5">
              🖥️ Infrastructure Capacity
              <InfoTooltip
                title="Infrastructure Capacity — Nutanix / Dell VxRail"
                definition="HCI cluster utilization monitored by NorthstarMS. WTG triggers a proactive expansion SOW at 85% utilization. Standard Nutanix lead time is 4–6 weeks — early detection avoids emergency procurement."
                sources={['Nutanix', 'Dell VxRail', 'NorthstarMS']}
              />
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: infraStatusConfig[account.infraCapacity.status].bg, color: infraStatusConfig[account.infraCapacity.status].color }}
            >
              {infraStatusConfig[account.infraCapacity.status].label}
            </span>
          </button>
          {showInfra && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{account.infraCapacity.provider.toUpperCase()} UTILIZATION</span>
                  <span className="text-xs font-bold" style={{
                    color: account.infraCapacity.utilizationPct >= 85 ? '#f87171' : account.infraCapacity.utilizationPct >= 75 ? '#facc15' : '#4ade80'
                  }}>{account.infraCapacity.utilizationPct}%</span>
                </div>
                <div className="h-2 rounded-full mb-2" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${account.infraCapacity.utilizationPct}%`,
                      background: account.infraCapacity.utilizationPct >= 85 ? '#f87171' : account.infraCapacity.utilizationPct >= 75 ? '#facc15' : '#4ade80',
                    }}
                  />
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  🖧 {account.infraCapacity.nodeCount} nodes · WTG threshold: 85%
                </div>
              </div>
              {account.infraCapacity.expansionTrigger && account.infraCapacity.estimatedExpansionValue && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>💰 EXPANSION SOW READY</div>
                  <div className="text-sm font-bold" style={{ color: '#4ade80' }}>Est. {formatArr(account.infraCapacity.estimatedExpansionValue)}</div>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: 'var(--text-secondary)' }}>Node expansion SOW ready to draft. 4–6 week lead time — order now to avoid performance incident.</p>
                </div>
              )}
              <div className="rounded-lg p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>ALYSA INSIGHT</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.infraCapacity.insight}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resolution Playbook toggle */}
      {account.blockerMatch && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowBlocker(b => !b)}
          >
            <span className="flex items-center gap-1.5">
              🔗 Resolution Playbook
              <InfoTooltip
                title="WTG Resolution Playbook Match"
                definition="Surfaces solutions from prior WTG engagements that resolved a similar situation. Matched from delivery retrospectives and pod knowledge base."
                sources={['WTG Pod Knowledge Base', 'NorthstarMS']}
              />
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
              {account.blockerMatch.matchConfidence}% match
            </span>
          </button>
          {showBlocker && (
            <div className="px-4 pb-4 space-y-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>CURRENT SITUATION</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.blockerMatch.blocker}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>SUGGESTED PLAYBOOK</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.blockerMatch.solution}</p>
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>— {account.blockerMatch.resolvedBy}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
