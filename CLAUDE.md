# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Alysa** is a Next.js 14 AI-powered Customer Success Intelligence Engine for NorthstarMS (an MSP platform). It provides Delivery Managers and Account Managers at Winslow Technology Group with a conversational interface to analyze a portfolio of 8 customer accounts, detect risks (backup failures, security threats, capacity limits), and surface expansion opportunities.

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

No test or lint scripts are configured.

**Required environment variable:** Copy `.env.local.example` to `.env.local` and add a valid `ANTHROPIC_API_KEY`.

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
  → POST /api/chat  (app/api/chat/route.ts)
  → Anthropic streaming API with ALYSA_SYSTEM_PROMPT
  → SSE stream decoded client-side
  → MessageBubble parses structured blocks from response text
```

### Response Format
The system prompt enforces structured blocks that `MessageBubble.tsx` extracts via regex:
- `---SOURCES--- ... ---END SOURCES---` → rendered as `SourcesPanel`
- `---NEXT STEPS--- ... ---END NEXT STEPS---` → action items
- `---EXPLORE--- ... ---END EXPLORE---` → follow-on prompt suggestions

### Theme System
CSS custom properties in `app/globals.css` provide all colors. Dark mode is default (`:root`); light mode overrides via `[data-theme="light"]`. Theme is toggled with `document.documentElement.setAttribute('data-theme', ...)` and persisted to `localStorage` under key `alysa-theme`.

### Portfolio Data
Two data layers:
- `lib/accounts.ts` — lightweight `Account` objects used by the sidebar/portfolio dashboard (risk scores, backup health, security posture, infra capacity, priority classification: `P0 | P1 | P2 | expand | maintain`)
- `lib/accountDetailData.ts` — full `AccountData` objects for account tabs (goals, stakeholders, tech stack, gap rows, plays, business outcomes, industry insights, QBR content, `customerSaidMeta` with source + timestamp per customer quote)

The `Account`, `AccountData`, and `ChatMessage` types in `lib/types.ts` are the core data contracts.

### Key Component Responsibilities
- `app/page.tsx` — top-level layout: sidebar + chat area, theme toggle, initial prompt injection when clicking an `AccountCard`
- `components/ChatInterface.tsx` — message state, streaming, voice input (Web Speech API), suggested prompts
- `components/Sidebar.tsx` — Portfolio / History tabs + collapsible Data Sources panel in the footer (22+ sources across 6 categories, live/partial/planned status)
- `components/PortfolioDashboard.tsx` — aggregates account data, drives `RedFlagBriefing` and `AccountCard` list
- `components/MessageBubble.tsx` — Markdown rendering + structured block extraction from assistant responses
- `components/ui/CollapsibleCard.tsx` — reusable card with optional `infoSources`/`infoDefinition` props that render an `InfoTooltip` in the header
- `components/account/ClientProfileTab.tsx` — goals, stakeholders, intel, tech stack, wallet share; every `CollapsibleCard` section has `SectionChat` and data source tooltips
- `components/account/QBRExecBriefTab.tsx` — title card (account, date, editable presenter) + 5 outcome-focused sections; each section has `SectionChat` and data source tooltips; `OutcomeCard` renders Before→After visuals; `OpportunityCard` renders expansion opps; `nextStepIcon()` auto-detects emoji by keyword
- `components/account/SectionChat.tsx` — reusable per-section AI chat panel; sends section data as context to `/api/chat`; supports emoji reactions and streaming responses
- `lib/system-prompt.ts` — Alysa persona scoped to Delivery Manager and Account Manager roles; positions WTG as "Strategic Technology Partner"
