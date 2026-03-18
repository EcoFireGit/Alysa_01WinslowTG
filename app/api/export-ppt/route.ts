import { NextRequest, NextResponse } from 'next/server'
import pptxgen from 'pptxgenjs'

const ACCENT   = '575ECF'
const RED      = 'F87171'
const GREEN    = '4ADE80'
const YELLOW   = 'FACC15'
const BG       = '0F1117'
const SURFACE  = '1A1D2E'
const TEXT_PRI = 'F1F5F9'
const TEXT_SEC = '94A3B8'

type OutcomeRow = { metric: string; before: string; after: string; impact: string; technicalSignal?: string }

function addSlide(prs: pptxgen, title: string, subtitle?: string) {
  const s = prs.addSlide()
  s.background = { color: BG }
  s.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: ACCENT } })
  s.addText(title, { x: 0.4, y: 0.15, w: 9.2, h: 0.5, fontSize: 18, bold: true, color: TEXT_PRI, fontFace: 'Calibri' })
  if (subtitle) s.addText(subtitle, { x: 0.4, y: 0.65, w: 9.2, h: 0.3, fontSize: 11, color: TEXT_SEC, fontFace: 'Calibri' })
  return s
}

function bulletList(s: ReturnType<pptxgen['addSlide']>, items: string[], x: number, y: number, w: number, dotColor = ACCENT) {
  items.forEach((item, i) => {
    s.addText(
      [{ text: '• ', options: { color: dotColor, bold: true } }, { text: item, options: { color: TEXT_PRI } }],
      { x, y: y + i * 0.38, w, h: 0.36, fontSize: 10, fontFace: 'Calibri', wrap: true }
    )
  })
}

export async function POST(req: NextRequest) {
  const { account, priorities, delivered, nextSteps, risks, opportunities, outcomes, mode } = await req.json()

  const prs = new pptxgen()
  prs.layout = 'LAYOUT_WIDE'
  prs.author = 'Prioriwise · Alysa'
  prs.title = `${account.name} — Quarterly Business Review`

  // Cover
  const cover = prs.addSlide()
  cover.background = { color: BG }
  cover.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.06, fill: { color: ACCENT } })
  cover.addShape(prs.ShapeType.rect, { x: 0, y: 2.5, w: '100%', h: 2.5, fill: { color: SURFACE } })
  cover.addText('Quarterly Business Review', { x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 28, bold: true, color: TEXT_PRI, fontFace: 'Calibri', align: 'center' })
  cover.addText(account.name, { x: 0.5, y: 1.5, w: 9, h: 0.5, fontSize: 20, color: ACCENT, fontFace: 'Calibri', align: 'center', bold: true })
  const meta = [`Industry: ${account.industry}`, `ARR: ${account.arr}`, `Renewal: ${account.renewal}`, `Health: ${account.health}/100`]
  meta.forEach((m, i) => cover.addText(m, { x: 0.5 + i * 2.4, y: 2.9, w: 2.2, h: 0.4, fontSize: 10, color: TEXT_SEC, fontFace: 'Calibri', align: 'center' }))
  cover.addText('Confidential · Prepared by Prioriwise', { x: 0.5, y: 6.8, w: 9, h: 0.3, fontSize: 9, color: TEXT_SEC, fontFace: 'Calibri', align: 'center' })

  // Priorities
  const s2 = addSlide(prs, 'What You Said Matters This Quarter', account.name)
  priorities.forEach((p: string, i: number) => {
    s2.addShape(prs.ShapeType.rect, { x: 0.4, y: 1.1 + i * 0.72, w: 9.2, h: 0.6, fill: { color: SURFACE }, line: { color: ACCENT, width: 1 } })
    s2.addText(`${i + 1}`, { x: 0.5, y: 1.18 + i * 0.72, w: 0.4, h: 0.44, fontSize: 13, bold: true, color: ACCENT, fontFace: 'Calibri', align: 'center' })
    s2.addText(p, { x: 1.1, y: 1.18 + i * 0.72, w: 8.2, h: 0.44, fontSize: 11, color: TEXT_PRI, fontFace: 'Calibri', valign: 'middle' })
  })

  // Delivered
  const s3 = addSlide(prs, 'What We Delivered', account.name)
  bulletList(s3, delivered, 0.4, 1.1, 9.2, GREEN)

  // Next Steps
  const s4 = addSlide(prs, 'Next Steps & Decisions', account.name)
  bulletList(s4, nextSteps, 0.4, 1.1, 9.2, ACCENT)

  if (mode === 'standard') {
    // Risks & Opps
    const s5 = addSlide(prs, 'Risks & Opportunities', account.name)
    s5.addText("RISKS WE'RE MANAGING", { x: 0.4, y: 1.0, w: 4.4, h: 0.3, fontSize: 9, bold: true, color: RED, fontFace: 'Calibri' })
    bulletList(s5, risks, 0.4, 1.3, 4.4, RED)
    s5.addText('OPPORTUNITIES', { x: 5.2, y: 1.0, w: 4.4, h: 0.3, fontSize: 9, bold: true, color: YELLOW, fontFace: 'Calibri' })
    bulletList(s5, opportunities, 5.2, 1.3, 4.4, YELLOW)
    s5.addShape(prs.ShapeType.rect, { x: 4.95, y: 0.95, w: 0.05, h: 5.5, fill: { color: '2A2D3E' } })

    // Technical Metrics → Business Outcomes
    const s6 = addSlide(prs, 'Technical Metrics → Business Outcomes', account.name)
    const colX = [0.3, 2.1, 5.1, 6.3, 7.5]
    const colW = [1.7, 2.9, 1.1, 1.1, 2.1]
    const headers = ['Metric / Outcome', 'Technical Signal', 'Before', 'After', 'Business Impact']
    headers.forEach((h, i) => s6.addText(h, { x: colX[i], y: 1.0, w: colW[i], h: 0.3, fontSize: 8, bold: true, color: TEXT_SEC, fontFace: 'Calibri' }))
    s6.addShape(prs.ShapeType.rect, { x: 0.3, y: 1.28, w: 9.4, h: 0.03, fill: { color: ACCENT } })
    outcomes.forEach((row: OutcomeRow, i: number) => {
      const y = 1.4 + i * 0.62
      if (i % 2 === 0) s6.addShape(prs.ShapeType.rect, { x: 0.3, y, w: 9.4, h: 0.58, fill: { color: SURFACE } })
      const cells = [
        { text: row.metric, color: TEXT_PRI, bold: true },
        { text: row.technicalSignal || '—', color: TEXT_SEC, bold: false },
        { text: row.before, color: RED, bold: true },
        { text: row.after, color: GREEN, bold: true },
        { text: row.impact, color: ACCENT, bold: true },
      ]
      cells.forEach((cell, j) => s6.addText(cell.text, { x: colX[j], y: y + 0.08, w: colW[j], h: 0.44, fontSize: 9, color: cell.color, bold: cell.bold, fontFace: 'Calibri', valign: 'middle', wrap: true }))
    })
  }

  const buffer = await prs.write({ outputType: 'arraybuffer' }) as ArrayBuffer
  const filename = `QBR_${account.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
