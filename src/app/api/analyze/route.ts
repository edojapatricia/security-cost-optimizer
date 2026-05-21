import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'
import type { SecurityTool, AnalysisResult } from '@/lib/types'

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const { tools }: { tools: SecurityTool[] } = await request.json()

  if (!tools || tools.length === 0) {
    return Response.json({ error: 'No tools provided' }, { status: 400 })
  }

  const toolList = tools
    .map(
      (t) =>
        `- ${t.name} (${t.vendor}) | Category: ${t.category} | Monthly: $${t.monthlyCost} | Seats: ${t.seats} | ${t.description}`
    )
    .join('\n')

  const totalCost = tools.reduce((sum, t) => sum + t.monthlyCost, 0)

  const prompt = `You are a cybersecurity cost optimization expert for SMEs (small and medium enterprises).
Analyze this security tool stack and identify waste, overlaps, and savings opportunities.

CURRENT TOOLS (Total monthly spend: $${totalCost}):
${toolList}

Return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "summary": "2-3 sentence executive summary of findings",
  "totalMonthlyCost": ${totalCost},
  "potentialMonthlySavings": <number>,
  "overlaps": [
    {
      "tools": ["Tool A", "Tool B"],
      "reason": "explanation of overlap",
      "recommendation": "what to do"
    }
  ],
  "redundantTools": ["Tool Name"],
  "redundancyReason": "why these tools are redundant for an SME",
  "alternatives": [
    {
      "replaces": ["Tool A", "Tool B"],
      "name": "Alternative Tool Name",
      "vendor": "Vendor",
      "estimatedMonthlyCost": <number>,
      "savings": <number>,
      "notes": "why this is a good SME fit, compliance notes",
      "complianceSuitable": true
    }
  ],
  "prioritizedActions": [
    "Action 1 (highest savings first)",
    "Action 2",
    "Action 3"
  ]
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  const result: AnalysisResult = JSON.parse(text)
  return Response.json(result)
}
