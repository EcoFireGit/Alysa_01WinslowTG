'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'
import { PortfolioDashboard } from './PortfolioDashboard'
import { LayoutDashboard, MessageSquare, ChevronLeft, ChevronRight, ChevronDown, Database } from 'lucide-react'

type SourceStatus = 'live' | 'partial' | 'planned'

const DATA_SOURCES: { category: string; sources: { name: string; status: SourceStatus }[] }[] = [
  {
    category: 'CRM & Engagement',
    sources: [
      { name: 'Salesforce', status: 'live' },
      { name: 'MS Teams', status: 'live' },
      { name: 'Email (M365)', status: 'live' },
      { name: 'Fathom (Meeting Notes)', status: 'live' },
    ],
  },
  {
    category: 'ITSM & Service Desk',
    sources: [
      { name: 'ConnectWise PSA', status: 'live' },
      { name: 'ServiceNow', status: 'live' },
      { name: 'NorthstarMS Platform', status: 'live' },
    ],
  },
  {
    category: 'Security & Threat Detection',
    sources: [
      { name: 'Arctic Wolf MDR', status: 'live' },
      { name: 'CrowdStrike Falcon', status: 'live' },
      { name: 'Zscaler', status: 'live' },
      { name: 'Horizon3 AI', status: 'partial' },
      { name: 'Microsoft Defender', status: 'live' },
    ],
  },
  {
    category: 'Backup & Recovery',
    sources: [
      { name: 'Commvault', status: 'live' },
      { name: 'Rubrik', status: 'live' },
    ],
  },
  {
    category: 'Infrastructure & Cloud',
    sources: [
      { name: 'Nutanix HCI', status: 'live' },
      { name: 'Microsoft Azure', status: 'live' },
      { name: 'VMware vSphere', status: 'live' },
      { name: 'Cisco (Network)', status: 'live' },
      { name: 'Dell Technologies', status: 'partial' },
    ],
  },
  {
    category: 'Industry Research',
    sources: [
      { name: 'Forrester', status: 'live' },
      { name: 'IDC', status: 'live' },
      { name: 'Gartner', status: 'planned' },
    ],
  },
]

const STATUS_DOT: Record<SourceStatus, { color: string; label: string }> = {
  live:    { color: '#4ade80', label: 'Connected' },
  partial: { color: '#facc15', label: 'Partial' },
  planned: { color: '#94a3b8', label: 'Planned' },
}

interface SidebarProps {
  onAccountClick: (account: Account) => void
  onAskAbout: (prompt: string) => void
  onNewChat: () => void
}

export function Sidebar({ onAccountClick, onAskAbout, onNewChat }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'chat'>('portfolio')

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-3 w-14 flex-shrink-0"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-2"
          style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}>
          A
        </div>
        <button onClick={() => setCollapsed(false)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => { setCollapsed(false); setActiveTab('portfolio') }} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: activeTab === 'portfolio' ? 'var(--accent)' : 'var(--text-muted)' }}>
          <LayoutDashboard className="w-4 h-4" />
        </button>
        <button onClick={() => { setCollapsed(false); setActiveTab('chat') }} className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: activeTab === 'chat' ? 'var(--accent)' : 'var(--text-muted)' }}>
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const [sourcesOpen, setSourcesOpen] = useState(false)

  return (
    <div className="flex flex-col w-80 flex-shrink-0" style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}>
            A
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Alysa</div>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} className="w-6 h-6 rounded flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-3 gap-1" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0' }}>
        {[
          { id: 'portfolio', label: 'Portfolio', icon: LayoutDashboard },
          { id: 'chat', label: 'History', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'portfolio' | 'chat')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg transition-all"
              style={{
                color: isActive ? 'var(--text-hover)' : 'var(--text-muted)',
                background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'portfolio' ? (
          <PortfolioDashboard onAccountClick={onAccountClick} onAskAbout={onAskAbout} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-8 h-8 mb-3" style={{ color: 'var(--text-faint)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chat history coming soon</p>
          </div>
        )}
      </div>

      {/* Data Sources Panel — fixed footer */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <button
          className="w-full flex items-center justify-between px-4 py-2.5"
          onClick={() => setSourcesOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Data Sources</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', fontSize: '10px' }}>
              {DATA_SOURCES.reduce((n, g) => n + g.sources.filter(s => s.status === 'live').length, 0)} live
            </span>
          </div>
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ color: 'var(--text-muted)', transform: sourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>

        {sourcesOpen && (
          <div
            className="px-3 pb-3 space-y-3 max-h-72 overflow-y-auto"
            style={{ borderTop: '1px solid var(--border-faint)' }}
          >
            {/* Legend */}
            <div className="flex items-center gap-3 pt-2">
              {Object.entries(STATUS_DOT).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: val.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{val.label}</span>
                </div>
              ))}
            </div>

            {DATA_SOURCES.map(group => (
              <div key={group.category}>
                <div className="text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.sources.map(source => {
                    const dot = STATUS_DOT[source.status]
                    return (
                      <div
                        key={source.name}
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border-faint)',
                          color: 'var(--text-secondary)',
                        }}
                        title={dot.label}
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot.color }} />
                        {source.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
