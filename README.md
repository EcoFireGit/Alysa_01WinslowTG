# Alysa — NorthstarMS Intelligence Engine

Alysa is a Next.js 14 AI-powered Customer Success Intelligence Engine for NorthstarMS. It gives Delivery Managers and Account Managers at Winslow Technology Group a single workspace to understand their client portfolio, detect risks before clients do, surface expansion opportunities, and build QBR materials automatically — without cobbling data from multiple tools.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your Anthropic API key
cp .env.local.example .env.local

# Run dev server
npm run dev
# → http://localhost:3000
```

**Required:** `ANTHROPIC_API_KEY` in `.env.local`.

---

## What Alysa Does

### Portfolio Dashboard
The main view shows your full client portfolio with live signals pulled from NorthstarMS, Commvault, CrowdStrike, Zscaler, Nutanix, and M365. At a glance:

- **ARR at Risk** — accounts with active Quiet Risk, Security Red Zone, or relationship failures
- **Expansion Pipeline** — SOW-ready opportunities with estimated ARR
- **Quiet Risk Flags** — silent technical failures the client hasn't reported yet
- **Health distribution** — At Risk / Stabilise / Expand / Stable across all accounts

### Account Detail View
Each account has five tabs:

#### Client Profile
Captures everything that makes a client relationship strategic — not just what's in the ticket queue:
- **Business Goals & Constraints** — sourced from Fathom transcripts and CRM notes; each section shows its data sources via an inline tooltip
- **Stakeholders & Decisions** — with sentiment scoring (Champion / Advocate / Neutral / Detractor)
- **Recent Intel & Inferences** — AI-generated inferences from LinkedIn, Fathom, NorthstarMS, and ConnectWise signals, with thumbs-up/down feedback
- **Tech Stack** — what they run, what's your wallet share, what's third-party
- **Wallet Share + Expansion Whitespace** — current ARR vs. estimated total IT spend, with top expansion opportunities
- Every section has an **Ask AI** toggle — ask Alysa a question scoped to that section's data without leaving the tab

#### Gap Analysis
The internal view of where the account stands vs. where it needs to go:
- **Customer Voice** — three-column layout: what they said (cited to source), what we observed, what we infer
- **Gap Analysis — Internal View** — goal, current reality, gap, impact, recommendation, estimated value, confidence, and timing. Toggle-exposed gaps flow into the client-facing narrative
- **Expansion Pipeline** — total and confidence-weighted pipeline value
- **Client-Ready Narrative** — auto-generated from exposed gaps; editable and exportable as a slide

#### Plan & Plays
- **Active Plays** — step-by-step action plans with owner, target outcome, and next touchpoint
- **Discovery Plays** — templated question frameworks matched to the account situation, copyable to clipboard

#### QBR / Exec Brief
A structured, outcomes-focused QBR built automatically from account signals — opens with a title card (account name, date, editable presenter name), then five sections:

| Section | What it shows |
|---|---|
| **Delivered This Quarter** | Editable deliverables checklist + Before → After visual cards (red/green) for each business metric, with a business impact bar |
| **Business Priorities** | Client's stated priorities captured from Fathom transcripts — numbered, editable |
| **Industry Insights** | Curated Forrester, IDC, and Gartner research relevant to the client's sector |
| **Outcomes Driven Partnership** | Expansion opportunities as structured cards — product, potential ARR, confidence badge, and outcome reason |
| **Next Steps** | Icon-typed action items auto-detected by keyword: 🤝 introductions, 🎟️ conference invitations, 📋 proposal reviews, ⚙️ deployments, 📅 meetings |

Every section is editable inline, has a data source tooltip, and has an **Ask AI** button. Export to PowerPoint in one click.

#### Outcomes & Feedback
Tracks recommendation accuracy over time — did Alysa's gap analysis lead to the right outcomes? Feeds the account's data health score.

### AI Chat
The right panel is a conversational interface to the full portfolio. Ask questions across all 8 accounts or drill into a specific situation. Alysa frames responses by role — Delivery Manager (operational risk, SLA, escalation) vs Account Manager (QBR narrative, renewal health, expansion). Suggested prompts include:
- Quiet Risk audit across all accounts
- QBR value story pack for the full portfolio
- Delivery escalation risk report
- ARR expansion pipeline summary

### Data Sources Panel
The sidebar footer shows all integrated data sources grouped by category (CRM & Engagement, ITSM, Security, Backup, Infrastructure, Industry Research), each with a live / partial / planned status indicator. Individual `CollapsibleCard` sections across account tabs show which specific sources power each data point via an inline tooltip.

---

## Architecture

### Stack
- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Anthropic SDK** (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-6`, streamed via SSE
- **Tailwind CSS** with CSS custom property theming (dark/light)
- **pptxgenjs** — PowerPoint export from QBR tab
- No external state management — all local `useState`

### Data Flow

```
User input (ChatInterface)
  → POST /api/chat
  → Anthropic streaming API with ALYSA_SYSTEM_PROMPT
  → SSE stream decoded client-side
  → MessageBubble parses structured blocks from response text
```

### Response Format
The system prompt enforces structured blocks parsed by `MessageBubble.tsx`:
- `---SOURCES--- ... ---END SOURCES---` → rendered as `SourcesPanel`
- `---NEXT STEPS--- ... ---END NEXT STEPS---` → action items
- `---EXPLORE--- ... ---END EXPLORE---` → follow-on prompt suggestions

### Theme System
CSS custom properties in `app/globals.css`. Dark mode is default (`:root`); light mode via `[data-theme="light"]`. Persisted to `localStorage` under key `alysa-theme`.

### Key Files

```
app/
  page.tsx                    — top-level layout: sidebar + chat + theme toggle
  dashboard/page.tsx          — portfolio dashboard view
  account/[slug]/page.tsx     — account detail shell
  api/chat/route.ts           — Anthropic streaming endpoint

components/
  PortfolioDashboard.tsx      — portfolio stats, Quiet Risk briefing, account cards
  AccountCard.tsx             — expandable card: scores, backup, security, infra, value story
  RedFlagBriefing.tsx         — daily Quiet Risk flag panel
  ChatInterface.tsx           — message state, streaming, voice input
  Sidebar.tsx                 — Portfolio / History tabs + collapsible Data Sources panel (footer)
  ui/
    CollapsibleCard.tsx       — card wrapper; supports infoSources/infoDefinition for data source tooltips
  account/
    AccountDetailView.tsx     — tab shell + sticky header
    ClientProfileTab.tsx      — goals, stakeholders, intel, tech stack, wallet share; SectionChat on every card
    GapAnalysisTab.tsx        — customer voice (with source+timestamp meta), gap rows, narrative, pipeline
    PlanPlaysTab.tsx           — active plays + discovery play templates
    QBRExecBriefTab.tsx        — title card + 5-section QBR; SectionChat per section, data source tooltips
    OutcomesFeedbackTab.tsx    — recommendation accuracy tracking
    SectionChat.tsx            — per-section AI chat panel with emoji reactions and streaming responses

lib/
  accounts.ts                 — 8 portfolio accounts (sidebar/dashboard data)
  accountDetailData.ts        — 8 accounts with full detail (tabs data)
  types.ts                    — all TypeScript interfaces
  system-prompt.ts            — Alysa AI persona and response format instructions
  exportPPT.ts                — PowerPoint generation via pptxgenjs
```

### Portfolio Data
All 8 accounts are defined statically in `lib/accountDetailData.ts`. Each `AccountData` object includes goals, stakeholders, tech stack, gap rows, plays, business outcomes, industry insights, QBR content, and `customerSaidMeta` (source + timestamp for each customer quote). The sidebar uses the lighter `lib/accounts.ts` for portfolio-level signals (backup health, security posture, infra capacity).

### AI Persona
`lib/system-prompt.ts` defines the Alysa persona scoped to two primary roles: **Delivery Manager** (operational risk, SLA, escalation) and **Account Manager** (QBR narrative, renewal, ARR expansion). WTG is positioned as a "Strategic Technology Partner." The system prompt is sent on every `/api/chat` call.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude claude-sonnet-4-6 |

No database or external services required — all account data is local to `lib/`.
