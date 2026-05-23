# Security Cost Optimizer — SME Edition

> AI-powered security stack rationalization. Find what you're overpaying for, what overlaps, and what cheaper alternatives have been verified against live market pricing.

---

## The Problem

Most SMEs end up with a security stack that grew organically — a tool added after a breach scare, a vendor upsell here, a compliance checkbox there. By the time someone looks at the bill, the stack has:

- **Overlapping tools** doing the same job (two EDR products, two identity providers)
- **Enterprise-grade tools** priced for 5,000-seat organizations running on 40-seat budgets
- **Redundancies** that made sense once but are now covered by something already in the stack

No one has time to research every vendor's pricing page, cross-reference alternatives, and build a business case. This tool does it automatically.

---

## What It Does

### 1. Security Stack Inventory
Add every security tool your organization pays for — name, vendor, category, monthly cost, and seat count. The inventory calculates your total monthly and annual burn in real time.

### 2. AI Analysis with Live Pricing Verification
Click **Run AI Analysis** and the tool sends your stack to an AI that:

- Searches vendor pricing pages, G2, Capterra, and tech news for **current, live pricing**
- Identifies which tools overlap in capability
- Flags tools that are oversized for an SME (priced and designed for enterprise)
- Finds cheaper alternatives — and **verifies their prices via web search before reporting them**

Every alternative price is marked as either **✓ Price Verified** (confirmed from a live source) or **~ Price Estimated** (flagged as uncertain). The savings figure is calculated only from verified prices — so the headline number is real, not inflated by guesswork.

### 3. Actionable Output
The analysis returns:

| Section | What you get |
|---|---|
| **Monthly Savings** | How much you could recover per month, based on verified pricing |
| **AI Summary** | Executive-level context on what the analysis found |
| **Priority Actions** | Ordered list — highest savings first |
| **Overlapping Tools** | Which tools duplicate each other and what to consolidate |
| **Redundant Tools** | Tools too complex or expensive for SME scale |
| **Cheaper Alternatives** | Verified replacements with price source cited |
| **Sources Researched** | Every URL the AI consulted during the analysis |

---

## What It Brings to the Table

### Anti-Hallucination Price Verification
Most AI tools will confidently invent a price. This tool's prompts enforce a three-step protocol:

1. Search current pricing for every tool in your stack
2. Before recommending any alternative, search its pricing page in the same session
3. If a live price cannot be confirmed, the alternative is excluded — not estimated

This means the savings figures you see are grounded in real data, not training-data memory.

### Dual AI Provider with Automatic Fallback
- **Primary:** Anthropic Claude (Sonnet) with built-in web search — searches the open web during analysis
- **Fallback:** Google Gemini with Google Search grounding — activates automatically if Anthropic is unavailable

The fallback is silent: if Anthropic fails or is not configured, Google Gemini picks up seamlessly with the same web-grounded analysis capability.

### Built for SME Scale
The analysis prompt is specifically calibrated for organizations under 200 employees. Alternatives suggested are:

- Priced and licensed for small team deployments
- Checked for compliance suitability (ISO 27001, Cyber Essentials, SOC 2 readiness)
- Practical to implement without a dedicated security engineering team

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| AI — Primary | Anthropic Claude Sonnet via `@anthropic-ai/sdk` |
| AI — Fallback | Google Gemini via `@google/genai` with Search Grounding |
| Storage | Browser `localStorage` — no database required |
| Styling | Kami design system (Source Serif 4, Source Sans 3, JetBrains Mono) |

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- An API key from at least one provider:
  - [Anthropic Console](https://console.anthropic.com/) — primary (includes web search)
  - [Google AI Studio](https://aistudio.google.com/apikey) — fallback (free tier available)

### Installation

```bash
git clone <repo-url>
cd security-cost-optimizer
npm install
```

### Configuration

Copy the example environment file and add your keys:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in whichever keys you have:

```env
# Primary — Claude with web search
ANTHROPIC_API_KEY=sk-ant-...

# Fallback — Gemini with Google Search grounding
GOOGLE_API_KEY=AIzaSy...
```

You only need one key to run the tool. If both are present, Anthropic is used first. If Anthropic fails or is not configured, Gemini takes over automatically.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Use It

### Step 1 — Build your inventory

Click **Add Tool** and enter each security tool your organization pays for:

- **Tool name** and **vendor**
- **Category** (Endpoint, Network, Identity, Cloud, Email, Backup, Compliance, SIEM, Vuln Mgmt)
- **Monthly cost** in USD
- **Seat count**
- **Description** — briefly what it does and what features you actually use

Not sure where to start? Click **Load Sample Data** to populate a realistic 10-tool SME stack and see how the analysis works.

### Step 2 — Run the analysis

Once you have at least 2 tools, click **Run AI Analysis**. The AI will:

1. Search current pricing for each tool in your stack
2. Identify overlapping and redundant tools
3. Search and verify prices for cheaper alternatives
4. Return a full report with cited sources

Analysis typically takes 30–90 seconds depending on stack size and how many web searches the AI performs.

### Step 3 — Review the results

Switch to the **Analysis** tab. Work through the sections top to bottom:

1. Check **Priority Actions** — ordered by savings impact
2. Review **Overlapping Tools** — each card has a specific consolidation recommendation
3. Evaluate **Cheaper Alternatives** — look for the **✓ Price Verified** badge; treat **~ Price Estimated** entries as leads to investigate manually rather than firm numbers
4. Check **Sources Researched** to see exactly where the AI pulled its pricing from

### Step 4 — Iterate

Edit or remove tools, adjust costs to match your actual contract pricing, and re-run the analysis. The inventory persists in your browser between sessions.

---

## Cost per Analysis Run

Each run makes AI API calls that incur a small cost:

| Provider | Approximate cost per run |
|---|---|
| Anthropic Claude Sonnet (with web search) | $0.05 – $0.20 |
| Google Gemini (with Search grounding) | $0.01 – $0.05 |

Costs vary based on stack size and the number of web searches the AI performs during analysis.

---

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts   # AI analysis endpoint (Anthropic + Gemini fallback)
│   ├── globals.css            # Kami design tokens
│   ├── layout.tsx             # Font loading (Source Serif 4, Source Sans 3, JetBrains Mono)
│   └── page.tsx               # Main UI — inventory table and tab navigation
├── components/
│   ├── AnalysisResults.tsx    # Results display — stats, overlaps, alternatives, sources
│   └── ToolForm.tsx           # Add / edit tool form
└── lib/
    └── types.ts               # Shared TypeScript types
```

---

## Limitations

- **Prices change.** Even with live web search, vendor pricing pages sometimes show list prices that differ from negotiated or volume-discounted rates. Use verified figures as a starting point for vendor conversations, not final budget numbers.
- **Local storage only.** Your inventory is stored in the browser. Clearing browser data will erase it. Note your stack externally if you need to preserve it long-term.
- **SME calibration.** The analysis is tuned for organizations under ~200 employees. Enterprise-specific tools or very niche categories may produce fewer alternative suggestions.
