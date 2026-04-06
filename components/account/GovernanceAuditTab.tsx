'use client'

import { useState } from 'react'
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw, FileSearch, ChevronDown, ChevronUp } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData } from '@/lib/types'

type AuditStatus = 'Pass' | 'Fail' | 'Warning' | 'Pending'
type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

interface StandardCheck {
  standard: string
  category: string
  status: AuditStatus
  detail: string
  source: string
  lastScanned: string
}

interface AuditFinding {
  id: string
  title: string
  severity: Severity
  standard: string
  description: string
  ticketRef: string
  daysOpen: number
  remediation: string
  owner: string
  status: 'Open' | 'In Progress' | 'Resolved'
}

const STATUS_STYLE = (s: AuditStatus) =>
  s === 'Pass'
    ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
    : s === 'Fail'
    ? { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', icon: <XCircle className="w-3.5 h-3.5" /> }
    : s === 'Warning'
    ? { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)', icon: <AlertTriangle className="w-3.5 h-3.5" /> }
    : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', icon: <Clock className="w-3.5 h-3.5" /> }

const SEVERITY_STYLE = (s: Severity) =>
  s === 'Critical'
    ? { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
    : s === 'High'
    ? { color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.3)' }
    : s === 'Medium'
    ? { color: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' }
    : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' }

const FINDING_STATUS_STYLE = (s: AuditFinding['status']) =>
  s === 'Resolved'
    ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
    : s === 'In Progress'
    ? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' }
    : { color: '#f87171', bg: 'rgba(248,113,113,0.1)' }

function deriveAuditData(account: AccountData): { checks: StandardCheck[]; findings: AuditFinding[]; score: number; lastScan: string } {
  const hasBackupRisk = account.riskPosture.some(r => r.toLowerCase().includes('backup'))
  const hasSecurityRisk = account.riskPosture.some(r => r.toLowerCase().includes('cyber') || r.toLowerCase().includes('security'))
  const hasCapacityRisk = account.riskPosture.some(r => r.toLowerCase().includes('utilization') || r.toLowerCase().includes('capacity'))
  const hasDRRisk = account.riskPosture.some(r => r.toLowerCase().includes('dr') || r.toLowerCase().includes('disaster'))
  const isAtRisk = account.stage === 'At Risk'
  const isMonitor = account.stage === 'Monitor'

  const checks: StandardCheck[] = [
    {
      standard: 'Ticket SLA Compliance',
      category: 'Service Delivery',
      status: isAtRisk ? 'Warning' : 'Pass',
      detail: isAtRisk
        ? '3 tickets exceeded P2 SLA by >4h in the last 30 days'
        : 'All tickets resolved within defined SLA windows this period',
      source: 'PSA / Ticket System',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Incident Escalation Protocol',
      category: 'Service Delivery',
      status: isAtRisk ? 'Fail' : isMonitor ? 'Warning' : 'Pass',
      detail: isAtRisk
        ? 'P1 incident not escalated to vCIO within 1h — protocol breach detected'
        : isMonitor
        ? '1 incident escalation delayed by 2h last month'
        : 'Escalation protocol followed on all incidents this period',
      source: 'PSA / Communication Logs',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Backup Verification & Reporting',
      category: 'Data Protection',
      status: hasBackupRisk ? 'Fail' : 'Pass',
      detail: hasBackupRisk
        ? 'Backup job failures not reported to client within 24h — governance breach'
        : 'Backup success rate >99% with verified daily reporting in place',
      source: 'Commvault / Backup Logs',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'DR Plan Documentation',
      category: 'Data Protection',
      status: hasDRRisk ? 'Fail' : isMonitor ? 'Warning' : 'Pass',
      detail: hasDRRisk
        ? 'No documented DR plan on file — required for cyber insurance compliance'
        : isMonitor
        ? 'DR plan exists but has not been tested in >180 days'
        : 'DR plan documented, tested, and reviewed within 90 days',
      source: 'Documentation Repository',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Security Posture Review',
      category: 'Security & Compliance',
      status: hasSecurityRisk ? 'Fail' : isMonitor ? 'Warning' : 'Pass',
      detail: hasSecurityRisk
        ? 'Threat detections above baseline — security review not completed within required window'
        : isMonitor
        ? 'Security review completed but 2 medium-risk findings remain unresolved'
        : 'Security review completed with all findings remediated',
      source: 'Zscaler / Security Tools',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Patch Management Currency',
      category: 'Security & Compliance',
      status: hasCapacityRisk ? 'Warning' : isAtRisk ? 'Warning' : 'Pass',
      detail: hasCapacityRisk
        ? 'Infrastructure stress delaying patch deployment — 2 critical patches pending >14 days'
        : isAtRisk
        ? '4 servers running patches >30 days behind current'
        : 'All endpoints within patch currency standards (<14 days)',
      source: 'RMM / Patch Management',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Monthly Business Review Cadence',
      category: 'Engagement Standards',
      status: account.profileCompleteness < 50 ? 'Warning' : 'Pass',
      detail: account.profileCompleteness < 50
        ? 'MBR not completed last month — engagement cadence below standard'
        : 'MBR delivered on schedule with documented action items',
      source: 'CRM / Calendar Records',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'SOW Scope Adherence',
      category: 'Engagement Standards',
      status: isAtRisk ? 'Warning' : 'Pass',
      detail: isAtRisk
        ? 'Potential scope drift detected — 2 project tasks outside original SOW boundaries'
        : 'All delivered work within SOW scope; no out-of-scope activity flagged',
      source: 'PSA / Project Tracker',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Infrastructure Capacity Reporting',
      category: 'Operational Standards',
      status: hasCapacityRisk ? 'Fail' : 'Pass',
      detail: hasCapacityRisk
        ? 'Capacity threshold exceeded without proactive client notification per delivery standard'
        : 'Capacity reports delivered monthly; no threshold breaches this period',
      source: 'Nutanix / Infrastructure Monitoring',
      lastScanned: '2026-04-05 06:00 UTC',
    },
    {
      standard: 'Change Management Logging',
      category: 'Operational Standards',
      status: isMonitor ? 'Warning' : 'Pass',
      detail: isMonitor
        ? '3 changes logged post-implementation rather than pre-approved this period'
        : 'All changes pre-approved and logged per change management policy',
      source: 'PSA / Change Log',
      lastScanned: '2026-04-05 06:00 UTC',
    },
  ]

  const findings: AuditFinding[] = []

  if (hasBackupRisk) {
    findings.push({
      id: 'GA-001',
      title: 'Backup failure not disclosed within 24h SLA',
      severity: 'Critical',
      standard: 'Backup Verification & Reporting',
      description: 'Automated scan of ticket data identified a backup job failure that was not escalated or reported to the client within the required 24-hour governance window.',
      ticketRef: 'TKT-8821',
      daysOpen: 11,
      remediation: 'Immediately notify client of backup failure, provide root cause and remediation plan. Update notification playbook to auto-trigger client alert on backup failure.',
      owner: 'vCIO / Delivery Lead',
      status: 'Open',
    })
  }

  if (hasDRRisk) {
    findings.push({
      id: 'GA-002',
      title: 'Disaster Recovery plan not on file',
      severity: 'Critical',
      standard: 'DR Plan Documentation',
      description: 'No DR plan documentation found in the repository. Client has active cyber insurance requirements that mandate documented RPO/RTO targets.',
      ticketRef: 'TKT-9104',
      daysOpen: 45,
      remediation: 'Schedule DR documentation workshop with client IT director. Deliver documented DR plan within 30 days and upload to shared repository.',
      owner: 'Technical Architect',
      status: 'In Progress',
    })
  }

  if (hasCapacityRisk) {
    findings.push({
      id: 'GA-003',
      title: 'Infrastructure capacity breach not proactively communicated',
      severity: 'High',
      standard: 'Infrastructure Capacity Reporting',
      description: 'Infrastructure utilization exceeded the 85% notification threshold. Delivery standards require proactive client communication before threshold breach.',
      ticketRef: 'TKT-9223',
      daysOpen: 7,
      remediation: 'Send capacity advisory to client within 48h. Schedule capacity planning session and prepare Nutanix expansion proposal.',
      owner: 'Account Manager',
      status: 'In Progress',
    })
  }

  if (isAtRisk && !hasBackupRisk) {
    findings.push({
      id: 'GA-004',
      title: 'P1 incident escalation delay',
      severity: 'High',
      standard: 'Incident Escalation Protocol',
      description: 'Ticket scan identified a P1 incident where vCIO escalation was triggered 3.5 hours after incident detection — exceeding the 1-hour escalation standard.',
      ticketRef: 'TKT-8967',
      daysOpen: 14,
      remediation: 'Conduct escalation protocol review with delivery team. Implement automated vCIO alert trigger in PSA for all P1 incidents.',
      owner: 'Delivery Manager',
      status: 'Open',
    })
  }

  if (isMonitor && findings.length < 2) {
    findings.push({
      id: 'GA-005',
      title: 'Unapproved changes logged post-implementation',
      severity: 'Medium',
      standard: 'Change Management Logging',
      description: '3 infrastructure changes this period were logged after implementation rather than following the pre-approval workflow, violating change management standards.',
      ticketRef: 'TKT-9015',
      daysOpen: 18,
      remediation: 'Remind delivery team of change management workflow. Flag repeat offenders for coaching. Review PSA templates to enforce pre-approval step.',
      owner: 'Delivery Lead',
      status: 'Open',
    })
  }

  if (account.profileCompleteness < 50) {
    findings.push({
      id: 'GA-006',
      title: 'Monthly Business Review not completed',
      severity: 'Medium',
      standard: 'Monthly Business Review Cadence',
      description: 'No MBR on record for the previous month. Engagement standards require a documented MBR or equivalent client touchpoint every 30 days.',
      ticketRef: 'CRM-441',
      daysOpen: 32,
      remediation: 'Schedule MBR immediately and document outcomes in CRM. Set recurring calendar block to prevent future gaps.',
      owner: 'Account Manager',
      status: 'Open',
    })
  }

  const passCount = checks.filter(c => c.status === 'Pass').length
  const score = Math.round((passCount / checks.length) * 100)

  return { checks, findings, score, lastScan: '2026-04-05 06:00 UTC' }
}

export function GovernanceAuditTab({ account }: { account: AccountData }) {
  const { checks, findings, score, lastScan } = deriveAuditData(account)
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)

  const passCt = checks.filter(c => c.status === 'Pass').length
  const failCt = checks.filter(c => c.status === 'Fail').length
  const warnCt = checks.filter(c => c.status === 'Warning').length

  const scoreColor = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171'
  const scoreLabel = score >= 80 ? 'Compliant' : score >= 60 ? 'Needs Attention' : 'Non-Compliant'

  const byCategory = checks.reduce<Record<string, StandardCheck[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  const criticalFindings = findings.filter(f => f.severity === 'Critical')
  const openFindings = findings.filter(f => f.status !== 'Resolved')

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-4">

        {/* Scan header bar */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <FileSearch className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Last automated scan:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{lastScan}</span>
          <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)', border: '1px solid rgba(87,94,207,0.2)' }}>
            <RefreshCw className="w-3 h-3" />
            Auto-scans every 6h
          </span>
        </div>

        {/* Standards checks by category */}
        {Object.entries(byCategory).map(([category, catChecks]) => (
          <CollapsibleCard
            key={category}
            title={category}
            badge={
              <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{
                background: catChecks.some(c => c.status === 'Fail') ? 'rgba(248,113,113,0.1)' : catChecks.some(c => c.status === 'Warning') ? 'rgba(250,204,21,0.1)' : 'rgba(74,222,128,0.1)',
                color: catChecks.some(c => c.status === 'Fail') ? '#f87171' : catChecks.some(c => c.status === 'Warning') ? '#facc15' : '#4ade80',
              }}>
                {catChecks.filter(c => c.status === 'Pass').length}/{catChecks.length} passing
              </span>
            }
          >
            <div className="space-y-2">
              {catChecks.map((check, i) => {
                const sty = STATUS_STYLE(check.status)
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg text-xs"
                    style={{ background: 'var(--bg)', border: `1px solid ${check.status !== 'Pass' ? sty.border : 'var(--border-faint)'}` }}
                  >
                    <span style={{ color: sty.color, marginTop: '1px' }}>{sty.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold" style={{ color: 'var(--text-hover)' }}>{check.standard}</span>
                        <span className="px-1.5 py-0.5 rounded-full font-medium" style={{ background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>
                          {check.status}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>{check.detail}</div>
                      <div className="flex items-center gap-3 mt-1.5" style={{ color: 'var(--text-faint)' }}>
                        <span>Source: {check.source}</span>
                        <span>·</span>
                        <span>Scanned: {check.lastScanned}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <SectionFeedback />
          </CollapsibleCard>
        ))}

        {/* Audit Findings */}
        {findings.length > 0 && (
          <CollapsibleCard
            title="Audit Findings"
            badge={
              <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                {openFindings.length} open
              </span>
            }
          >
            <div className="space-y-3">
              {findings.map(finding => {
                const sev = SEVERITY_STYLE(finding.severity)
                const fst = FINDING_STATUS_STYLE(finding.status)
                const isExpanded = expandedFinding === finding.id
                return (
                  <div
                    key={finding.id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${sev.border}`, background: 'var(--bg)' }}
                  >
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                    >
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>{finding.id}</span>
                      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-hover)' }}>{finding.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                          {finding.severity}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: fst.bg, color: fst.color }}>{finding.status}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 text-xs" style={{ borderTop: '1px solid var(--border-faint)' }}>
                        <div className="pt-3 grid grid-cols-3 gap-3">
                          <div>
                            <div className="font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>STANDARD VIOLATED</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{finding.standard}</div>
                          </div>
                          <div>
                            <div className="font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TICKET REF</div>
                            <div style={{ color: 'var(--accent)' }}>{finding.ticketRef}</div>
                          </div>
                          <div>
                            <div className="font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DAYS OPEN</div>
                            <div style={{ color: finding.daysOpen > 30 ? '#f87171' : finding.daysOpen > 14 ? '#facc15' : 'var(--text-secondary)' }}>{finding.daysOpen}d</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DESCRIPTION</div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{finding.description}</div>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(87,94,207,0.06)', border: '1px solid rgba(87,94,207,0.15)' }}>
                          <div className="font-semibold mb-1" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>RECOMMENDED REMEDIATION</div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{finding.remediation}</div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span style={{ color: 'var(--text-muted)' }}>Owner:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{finding.owner}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <SectionFeedback />
          </CollapsibleCard>
        )}
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">

        {/* Governance Score */}
        <CollapsibleCard title="Governance Score">
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="text-5xl font-bold mb-1" style={{ color: scoreColor }}>{score}</div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block" style={{ background: scoreColor + '20', color: scoreColor, border: `1px solid ${scoreColor}40` }}>
                {scoreLabel}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: scoreColor }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <div className="text-xl font-bold" style={{ color: '#4ade80' }}>{passCt}</div>
                <div style={{ color: 'var(--text-muted)' }}>Pass</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <div className="text-xl font-bold" style={{ color: '#facc15' }}>{warnCt}</div>
                <div style={{ color: 'var(--text-muted)' }}>Warning</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div className="text-xl font-bold" style={{ color: '#f87171' }}>{failCt}</div>
                <div style={{ color: 'var(--text-muted)' }}>Fail</div>
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Critical Findings */}
        {criticalFindings.length > 0 && (
          <CollapsibleCard
            title="Critical Findings"
            badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{criticalFindings.length}</span>}
          >
            <div className="space-y-2">
              {criticalFindings.map(f => (
                <div key={f.id} className="text-xs p-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <div className="font-semibold mb-1" style={{ color: '#f87171' }}>{f.id} · {f.title}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{f.remediation.split('.')[0]}.</div>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Audit Summary */}
        <CollapsibleCard title="Audit Summary">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Standards checked</span>
              <span style={{ color: 'var(--text-primary)' }}>{checks.length}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Open findings</span>
              <span style={{ color: openFindings.length > 0 ? '#f87171' : '#4ade80' }}>{openFindings.length}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Critical findings</span>
              <span style={{ color: criticalFindings.length > 0 ? '#f87171' : '#4ade80' }}>{criticalFindings.filter(f => f.status !== 'Resolved').length}</span>
            </div>
            <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border-faint)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data sources scanned</span>
              <span style={{ color: 'var(--text-primary)' }}>PSA, CRM, RMM, Backup</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span style={{ color: 'var(--text-muted)' }}>Scan frequency</span>
              <span style={{ color: 'var(--text-primary)' }}>Every 6 hours</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--border-faint)' }}>
            {['Export Audit Report', 'Flag for Manager', 'Schedule Review'].map(label => (
              <button key={label} className="text-xs px-2.5 py-1 rounded-lg transition-all" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                {label}
              </button>
            ))}
          </div>
        </CollapsibleCard>

        {/* Delivery Standards Info */}
        <div className="text-xs p-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Global Delivery Standards</span>
          </div>
          Automated scan of ticket and project data to ensure HCLTech delivery standards are met without manual oversight. Findings are auto-generated from PSA, RMM, and CRM signals.
        </div>
      </div>
    </div>
  )
}
