export type ToolCategory =
  | 'endpoint'
  | 'network'
  | 'identity'
  | 'cloud'
  | 'email'
  | 'backup'
  | 'compliance'
  | 'siem'
  | 'vulnerability'
  | 'other'

export interface SecurityTool {
  id: string
  name: string
  vendor: string
  category: ToolCategory
  monthlyCost: number
  seats: number
  description: string
}

export interface Overlap {
  tools: string[]
  reason: string
  recommendation: string
}

export interface Alternative {
  replaces: string[]
  name: string
  vendor: string
  estimatedMonthlyCost: number
  savings: number
  notes: string
  complianceSuitable: boolean
}

export interface AnalysisResult {
  summary: string
  totalMonthlyCost: number
  potentialMonthlySavings: number
  overlaps: Overlap[]
  redundantTools: string[]
  redundancyReason: string
  alternatives: Alternative[]
  prioritizedActions: string[]
}
