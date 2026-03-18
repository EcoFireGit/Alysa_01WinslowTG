import { AccountData } from './types'

type OutcomeRow = { metric: string; before: string; after: string; impact: string; technicalSignal?: string }

export interface ExportData {
  account: AccountData
  priorities: string[]
  delivered: string[]
  nextSteps: string[]
  risks: string[]
  opportunities: string[]
  outcomes: OutcomeRow[]
  mode: 'standard' | 'executive'
}

export async function exportQBRtoPPT(data: ExportData) {
  const res = await fetch('/api/export-ppt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Export failed')

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `QBR_${data.account.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`
  a.click()
  URL.revokeObjectURL(url)
}
