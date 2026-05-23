import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import { NextRequest } from 'next/server'
import type { SecurityTool, AnalysisResult, Source } from '@/lib/types'

const anthropic = new Anthropic()

/* ─── Shared prompt builder ──────────────────────────────────── */
function buildToolList(tools: SecurityTool[]) {
  return tools
    .map(
      (t) =>
        `- ${t.name} (${t.vendor}) | Category: ${t.category} | Monthly: $${t.monthlyCost} | Seats: ${t.seats} | ${t.description}`
    )
    .join('\n')
}

function buildJsonSchema(totalCost: number) {
  return `{
  "summary": "2-3 sentence executive summary referencing verified prices found",
  "totalMonthlyCost": ${totalCost},
  "potentialMonthlySavings": <calculated only from verified alternative prices — 0 if none verified>,
  "overlaps": [
    {
      "tools": ["Tool A", "Tool B"],
      "reason": "explanation of overlap with verified pricing context",
      "recommendation": "specific action with price evidence"
    }
  ],
  "redundantTools": ["Tool Name"],
  "redundancyReason": "why these tools are redundant for an SME",
  "alternatives": [
    {
      "replaces": ["Tool A", "Tool B"],
      "name": "Alternative Tool Name",
      "vendor": "Vendor",
      "estimatedMonthlyCost": <price found via search — omit alternative if price not found>,
      "priceVerified": <true if price came from a live search result, false if estimated>,
      "priceSource": "<URL or page title where the price was confirmed, or null if unverified>",
      "savings": <currentToolCost minus estimatedMonthlyCost>,
      "notes": "Mention exactly where the price was found and what plan/tier it applies to",
      "complianceSuitable": true
    }
  ],
  "prioritizedActions": [
    "Action 1 — include the verified price in the recommendation",
    "Action 2",
    "Action 3"
  ]
}`
}

/* ─── Primary: Anthropic with live web search ────────────────── */
async function analyzeWithAnthropic(
  tools: SecurityTool[],
  toolList: string,
  totalCost: number
): Promise<{ result: AnalysisResult; sources: Source[] }> {
  const prompt = `You are a cybersecurity cost optimization expert for SMEs (small and medium enterprises).

CRITICAL RULE — NO HALLUCINATED PRICES:
You must search the web to find the actual current price of every alternative tool you recommend.
Do NOT invent, estimate, or recall prices from memory.
If you cannot find a verified price for an alternative via web search, do not include that alternative.
Set priceVerified: true ONLY when you found the price on a live page in this session.
The potentialMonthlySavings figure must be derived solely from verified prices.

STEP 1 — Search for current pricing of each tool in the stack:
Search each tool's vendor pricing page and cross-reference with G2, Capterra, or Trustradius.
Note the actual price and plan tier that matches the seat count below.

STEP 2 — Identify overlaps and redundancies using the verified pricing data.

STEP 3 — For each cheaper alternative you consider, search its pricing page NOW before including it.
Only include alternatives whose price you confirmed in Step 3.
Record the URL or page title in priceSource.

CURRENT TOOLS (Total monthly spend: $${totalCost}):
${toolList}

After completing all three steps, return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
${buildJsonSchema(totalCost)}`

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }]
  const sources: Source[] = []
  let finalText = ''

  for (let i = 0; i < 10; i++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    })

    // Collect source URLs from web_search_tool_result blocks
    for (const block of response.content) {
      if (block.type === 'web_search_tool_result') {
        const content = (block as Anthropic.Messages.WebSearchToolResultBlock).content
        if (Array.isArray(content)) {
          for (const r of content) {
            if (r.type === 'web_search_result' && r.url && !sources.some((s) => s.url === r.url)) {
              sources.push({ title: r.title, url: r.url })
            }
          }
        }
      }
    }

    if (response.stop_reason === 'end_turn') {
      finalText = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.Messages.TextBlock).text)
        .join('')
      break
    }

    messages.push({ role: 'assistant', content: response.content })

    const hasToolUse = response.content.some((b) => b.type === 'tool_use')
    if (!hasToolUse) {
      finalText = response.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.Messages.TextBlock).text)
        .join('')
      break
    }

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = response.content
      .filter((b) => b.type === 'tool_use')
      .map((b) => {
        const toolUse = b as Anthropic.Messages.ToolUseBlock
        const resultBlock = response.content.find(
          (rb) =>
            rb.type === 'web_search_tool_result' &&
            (rb as Anthropic.Messages.WebSearchToolResultBlock).tool_use_id === toolUse.id
        ) as Anthropic.Messages.WebSearchToolResultBlock | undefined

        return {
          type: 'tool_result' as const,
          tool_use_id: toolUse.id,
          content: resultBlock ? JSON.stringify(resultBlock.content) : 'Search completed.',
        }
      })

    messages.push({ role: 'user', content: toolResults })
  }

  const cleaned = finalText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  const result: AnalysisResult = { ...JSON.parse(cleaned), sources }
  return { result, sources }
}

/* ─── Fallback: Google Gemini with Grounding Search ─────────── */
async function analyzeWithGemini(
  tools: SecurityTool[],
  toolList: string,
  totalCost: number
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY ?? '' })

  const prompt = `You are a cybersecurity cost optimization expert for SMEs (small and medium enterprises).

CRITICAL RULE — NO HALLUCINATED PRICES:
You must use Google Search grounding to find the actual current price of every alternative tool you recommend.
Do NOT invent, estimate, or recall prices from memory or training data.
If you cannot find a verified price for an alternative via Google Search, do not include that alternative.
Set priceVerified: true ONLY when the price came from a live grounded search result in this response.
The potentialMonthlySavings figure must be derived solely from verified prices.

STEP 1 — Search for current pricing of each tool in the stack:
Use Google Search to look up each tool's vendor pricing page and cross-reference with G2, Capterra, or Trustradius.
Note the actual price and plan tier that matches the seat count below.

STEP 2 — Identify overlaps and redundancies using that verified pricing data.

STEP 3 — For each cheaper alternative you consider recommending, search its pricing page before including it.
Only include alternatives whose price you confirmed via Google Search grounding.
Record the URL or page title where you found the price in priceSource.

CURRENT TOOLS (Total monthly spend: $${totalCost}):
${toolList}

After completing all three steps, return ONLY valid JSON (no markdown fences, no explanation text, just the raw JSON object) matching this exact structure:
${buildJsonSchema(totalCost)}`

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  })

  const raw = response.text ?? ''
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()

  const parsed: AnalysisResult = JSON.parse(cleaned)

  // Extract grounding sources from search metadata
  const sources: Source[] = []
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
  for (const chunk of groundingChunks) {
    const web = chunk.web
    if (web?.uri && !sources.some((s) => s.url === web.uri)) {
      sources.push({ title: web.title ?? web.uri, url: web.uri })
    }
  }
  parsed.sources = sources

  return parsed
}

/* ─── Route handler ──────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  const { tools }: { tools: SecurityTool[] } = await request.json()

  if (!tools || tools.length === 0) {
    return Response.json({ error: 'No tools provided' }, { status: 400 })
  }

  const toolList = buildToolList(tools)
  const totalCost = tools.reduce((sum, t) => sum + t.monthlyCost, 0)

  // ── Try Anthropic first ──────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('[analyze] Using Anthropic (primary)')
      const { result } = await analyzeWithAnthropic(tools, toolList, totalCost)
      return Response.json(result)
    } catch (err) {
      console.error('[analyze] Anthropic failed:', (err as Error).message)
      // Fall through to Google Gemini
    }
  } else {
    console.warn('[analyze] ANTHROPIC_API_KEY not set — skipping Anthropic')
  }

  // ── Fall back to Google Gemini ───────────────────────────────
  if (process.env.GOOGLE_API_KEY) {
    try {
      console.log('[analyze] Falling back to Google Gemini')
      const result = await analyzeWithGemini(tools, toolList, totalCost)
      return Response.json(result)
    } catch (err) {
      console.error('[analyze] Google Gemini failed:', (err as Error).message)
      return Response.json(
        { error: `Both providers failed. Last error: ${(err as Error).message}` },
        { status: 502 }
      )
    }
  }

  return Response.json(
    { error: 'No AI provider configured. Set ANTHROPIC_API_KEY or GOOGLE_API_KEY in .env.local' },
    { status: 500 }
  )
}
