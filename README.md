## Project Overview

**Alysa** is a Next.js 14 AI-powered Customer Success Intelligence Engine for NorthstarMS (an MSP platform). It provides vCIOs/Account Managers with a conversational interface to analyze a portfolio of 8 customer accounts, detect risks (backup failures, security threats, capacity limits), and surface expansion opportunities.

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
- **Anthropic SDK** (`@anthropic-ai/sdk`) — model: `claude-opus-4-6`, streamed via SSE
- **Tailwind CSS** with CSS custom property theming (dark/light)
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

All 8 accounts are statically defined in `lib/accounts.ts`. Each `Account` object includes:

- Risk scores (riskScore, sentimentScore, dataHealthScore, profileCompleteness)
- Optional complex fields: `redFlagSignal`, `backupHealth`, `securityPosture`, `infraCapacity`, `valueSnapshot`
- Priority classification: `P0 | P1 | P2 | expand | maintain`

The `Account` and `ChatMessage` types in `lib/types.ts` are the core data contracts for the app.

### Key Component Responsibilities

- `app/page.tsx` — top-level layout: sidebar + chat area, theme toggle, initial prompt injection when clicking an `AccountCard`
- `components/ChatInterface.tsx` — message state, streaming, voice input (Web Speech API), suggested prompts
- `components/Sidebar.tsx` — Portfolio / History tabs; contains `PortfolioDashboard`
- `components/PortfolioDashboard.tsx` — aggregates account data, drives `RedFlagBriefing` and `AccountCard` list
- `components/MessageBubble.tsx` — Markdown rendering + structured block extraction from assistant responses
- `lib/system-prompt.ts` — the full Alysa persona/instructions sent as the system message on every API call
