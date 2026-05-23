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
  priceVerified: boolean        // true = price confirmed from a live search result
  priceSource?: string          // URL or page where the price was found
  savings: number
  notes: string
  complianceSuitable: boolean
}

export interface Source {
  title: string
  url: string
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
  sources?: Source[]
}
