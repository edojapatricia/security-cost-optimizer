'use client'

import { useState, useEffect } from 'react'
import type { SecurityTool, AnalysisResult } from '@/lib/types'
import ToolForm from '@/components/ToolForm'
import AnalysisResults from '@/components/AnalysisResults'

const CATEGORY_LABELS: Record<string, string> = {
  endpoint: 'Endpoint',
  network: 'Network',
  identity: 'Identity',
  cloud: 'Cloud',
  email: 'Email',
  backup: 'Backup',
  compliance: 'Compliance',
  siem: 'SIEM',
  vulnerability: 'Vuln Mgmt',
  other: 'Other',
}

const STORAGE_KEY = 'sco-tools'

const SAMPLE_TOOLS: Omit<SecurityTool, 'id'>[] = [
  { name: 'CrowdStrike Falcon', vendor: 'CrowdStrike', category: 'endpoint', monthlyCost: 840, seats: 50, description: 'EDR/XDR endpoint protection, threat intelligence' },
  { name: 'Microsoft Defender for Endpoint', vendor: 'Microsoft', category: 'endpoint', monthlyCost: 375, seats: 50, description: 'Built-in Windows endpoint protection, AV, EDR' },
  { name: 'Sophos XG Firewall', vendor: 'Sophos', category: 'network', monthlyCost: 220, seats: 1, description: 'Next-gen firewall, IPS, web filtering' },
  { name: 'Cisco Umbrella', vendor: 'Cisco', category: 'network', monthlyCost: 480, seats: 50, description: 'DNS-layer security, web filtering, CASB' },
  { name: 'Okta Workforce', vendor: 'Okta', category: 'identity', monthlyCost: 600, seats: 50, description: 'SSO, MFA, lifecycle management' },
  { name: 'Microsoft Entra ID P2', vendor: 'Microsoft', category: 'identity', monthlyCost: 450, seats: 50, description: 'Azure AD, conditional access, PIM, MFA' },
  { name: 'Proofpoint Essentials', vendor: 'Proofpoint', category: 'email', monthlyCost: 300, seats: 50, description: 'Email security, anti-phishing, spam filtering' },
  { name: 'Veeam Backup', vendor: 'Veeam', category: 'backup', monthlyCost: 180, seats: 1, description: 'VM and server backup, ransomware recovery' },
  { name: 'Qualys VMDR', vendor: 'Qualys', category: 'vulnerability', monthlyCost: 650, seats: 1, description: 'Vulnerability management, patch management, compliance' },
  { name: 'Tenable.io', vendor: 'Tenable', category: 'vulnerability', monthlyCost: 580, seats: 1, description: 'Vulnerability scanning, asset discovery' },
]

export default function Home() {
  const [tools, setTools] = useState<SecurityTool[]>([])
  const [tab, setTab] = useState<'inventory' | 'analysis'>('inventory')
  const [showForm, setShowForm] = useState(false)
  const [editingTool, setEditingTool] = useState<SecurityTool | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setTools(JSON.parse(saved))
  }, [])

  const persist = (next: SecurityTool[]) => {
    setTools(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const handleSave = (data: Omit<SecurityTool, 'id'> & { id?: string }) => {
    if (data.id) {
      persist(tools.map((t) => (t.id === data.id ? { ...data, id: data.id } : t)))
    } else {
      persist([...tools, { ...data, id: crypto.randomUUID() }])
    }
    setShowForm(false)
    setEditingTool(null)
  }

  const handleDelete = (id: string) => {
    persist(tools.filter((t) => t.id !== id))
  }

  const loadSample = () => {
    const withIds = SAMPLE_TOOLS.map((t) => ({ ...t, id: crypto.randomUUID() }))
    persist(withIds)
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    setError(null)
    setAnalysis(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Analysis failed')
      }
      const data: AnalysisResult = await res.json()
      setAnalysis(data)
      setTab('analysis')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setAnalyzing(false)
    }
  }

  const totalMonthly = tools.reduce((s, t) => s + t.monthlyCost, 0)
  const totalAnnual = totalMonthly * 12

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-600/40 flex items-center justify-center text-cyan-400 text-sm font-bold">
                $
              </div>
              <h1 className="text-lg font-bold text-white">Security Cost Optimizer</h1>
              <span className="px-2 py-0.5 bg-cyan-900/40 text-cyan-400 text-xs rounded-full border border-cyan-800/50">
                SME Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 ml-11">AI-powered security stack rationalization</p>
          </div>
          {tools.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-500">Total monthly spend</p>
              <p className="text-xl font-bold text-white">
                ${totalMonthly.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
              </p>
              <p className="text-xs text-slate-500">${totalAnnual.toLocaleString()} / year</p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-slate-900 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('inventory')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all ${
              tab === 'inventory'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tool Inventory
            {tools.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-slate-600 text-slate-300 text-xs rounded-full">
                {tools.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('analysis')}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all ${
              tab === 'analysis'
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Analysis
            {analysis && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-800/60 text-green-400 text-xs rounded-full">
                ✓
              </span>
            )}
          </button>
        </div>

        {/* Inventory Tab */}
        {tab === 'inventory' && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(true); setEditingTool(null) }}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <span className="text-lg leading-none">+</span> Add Tool
                </button>
                {tools.length === 0 && (
                  <button
                    onClick={loadSample}
                    className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg text-sm transition-colors"
                  >
                    Load Sample Stack
                  </button>
                )}
              </div>
              {tools.length >= 2 && (
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-cyan-900/30"
                >
                  {analyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>✦ Run AI Analysis</>
                  )}
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Add/Edit Form */}
            {(showForm || editingTool) && (
              <div className="mb-6 bg-slate-900 rounded-xl p-5 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  {editingTool ? 'Edit Tool' : 'Add New Tool'}
                </h3>
                <ToolForm
                  initial={editingTool ?? undefined}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setEditingTool(null) }}
                />
              </div>
            )}

            {/* Empty state */}
            {tools.length === 0 && !showForm && (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  🔒
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-2">No tools added yet</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  Add your current security tools and their costs. The AI will identify savings opportunities.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add First Tool
                  </button>
                  <button
                    onClick={loadSample}
                    className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-sm transition-colors"
                  >
                    Load Sample Stack
                  </button>
                </div>
              </div>
            )}

            {/* Tool table */}
            {tools.length > 0 && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left font-medium">Tool / Vendor</th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-right font-medium">Seats</th>
                      <th className="px-4 py-3 text-right font-medium">Monthly</th>
                      <th className="px-4 py-3 text-right font-medium">Annual</th>
                      <th className="px-4 py-3 text-right font-medium w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool, i) => (
                      <tr
                        key={tool.id}
                        className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                          i === tools.length - 1 ? 'border-0' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-white">{tool.name}</p>
                          <p className="text-xs text-slate-500">{tool.vendor}</p>
                          {tool.description && (
                            <p className="text-xs text-slate-600 mt-0.5 truncate max-w-xs">{tool.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                            {CATEGORY_LABELS[tool.category] ?? tool.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-300">{tool.seats}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-white">
                          ${tool.monthlyCost.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-400">
                          ${(tool.monthlyCost * 12).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setEditingTool(tool); setShowForm(false) }}
                              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tool.id)}
                              className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800/50 border-t border-slate-700">
                      <td className="px-4 py-3 text-xs text-slate-400 font-medium" colSpan={3}>
                        {tools.length} tool{tools.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-white">
                        ${totalMonthly.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-300">
                        ${totalAnnual.toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {tools.length >= 2 && !showForm && !editingTool && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-cyan-900/30"
                >
                  {analyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing your stack...
                    </>
                  ) : (
                    <>✦ Run AI Analysis — Find Savings</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {tab === 'analysis' && (
          <div>
            {!analysis && !analyzing && (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  ✦
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-2">No analysis yet</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Add at least 2 tools in the inventory, then run the AI analysis.
                </p>
                <button
                  onClick={() => setTab('inventory')}
                  className="px-4 py-2 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-sm"
                >
                  Go to Inventory
                </button>
              </div>
            )}

            {analyzing && (
              <div className="text-center py-20">
                <div className="w-14 h-14 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-800/50">
                  <span className="w-6 h-6 border-2 border-cyan-600/30 border-t-cyan-400 rounded-full animate-spin block" />
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-2">AI is analyzing your stack</h3>
                <p className="text-sm text-slate-500">Identifying overlaps, redundancies, and savings...</p>
              </div>
            )}

            {analysis && <AnalysisResults result={analysis} />}

            {analysis && (
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={() => setTab('inventory')}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Back to inventory
                </button>
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="px-4 py-2 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Re-run analysis
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
