'use client'

import { useState, useEffect } from 'react'
import type { SecurityTool, AnalysisResult } from '@/lib/types'
import { SAMPLE_TOOLS } from '@/lib/sample-data'
import ToolForm from '@/components/ToolForm'
import AnalysisResults from '@/components/AnalysisResults'

/* ─── Category config — Kami tint palette ────────────────────── */
const CAT: Record<string, { label: string; color: string; bg: string; border: string }> = {
  endpoint:      { label: 'Endpoint',   color: '#1B365D', bg: '#D0DCE9', border: '#B8C8DD' },
  network:       { label: 'Network',    color: '#1B365D', bg: '#D0DCE9', border: '#B8C8DD' },
  identity:      { label: 'Identity',   color: '#1B365D', bg: '#E4ECF5', border: '#C4D4E8' },
  cloud:         { label: 'Cloud',      color: '#1B365D', bg: '#E4ECF5', border: '#C4D4E8' },
  email:         { label: 'Email',      color: '#1B365D', bg: '#E4ECF5', border: '#C4D4E8' },
  backup:        { label: 'Backup',     color: '#1B365D', bg: '#EEF2F7', border: '#D4DEEC' },
  compliance:    { label: 'Compliance', color: '#1B365D', bg: '#EEF2F7', border: '#D4DEEC' },
  siem:          { label: 'SIEM',       color: '#1B365D', bg: '#EEF2F7', border: '#D4DEEC' },
  vulnerability: { label: 'Vuln Mgmt', color: '#1B365D', bg: '#D0DCE9', border: '#B8C8DD' },
  other:         { label: 'Other',      color: '#504e49', bg: '#F0EDE6', border: '#DDD8CC' },
}

const STORAGE_KEY = 'sco-tools'

export default function Home() {
  const [tools,       setTools]       = useState<SecurityTool[]>([])
  const [tab,         setTab]         = useState<'inventory' | 'analysis'>('inventory')
  const [showForm,    setShowForm]    = useState(false)
  const [editingTool, setEditingTool] = useState<SecurityTool | null>(null)
  const [analysis,    setAnalysis]    = useState<AnalysisResult | null>(null)
  const [analyzing,   setAnalyzing]   = useState(false)
  const [error,       setError]       = useState<string | null>(null)

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
      persist(tools.map(t => t.id === data.id ? { ...data, id: data.id } : t))
    } else {
      persist([...tools, { ...data, id: crypto.randomUUID() }])
    }
    setShowForm(false)
    setEditingTool(null)
  }

  const handleDelete = (id: string) => persist(tools.filter(t => t.id !== id))

  const loadSample = () => persist(SAMPLE_TOOLS.map(t => ({ ...t, id: crypto.randomUUID() })))

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
      if (!res.ok) throw new Error((await res.json()).error || 'Analysis failed')
      setAnalysis(await res.json())
      setTab('analysis')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setAnalyzing(false)
    }
  }

  const totalMonthly = tools.reduce((s, t) => s + t.monthlyCost, 0)
  const totalAnnual  = totalMonthly * 12

  /* ─── Shared label style ── */
  const uiLabel: React.CSSProperties = {
    fontFamily: 'var(--font-sans-3)',
    fontSize: '0.6rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--stone)',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--parchment)' }}>

      {/* ─── Header ─────────────────────────────────────────── */}
      <header style={{
        background: 'var(--ivory)',
        borderBottom: '1px solid var(--border)',
        borderTop: '3px solid var(--brand)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--ivory)', letterSpacing: '0.04em' }}>SC</span>
            </div>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif-4)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--brand)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}>
                Security Cost Optimizer
              </h1>
              <p style={{ ...uiLabel, marginTop: 2, color: 'var(--fog)' }}>
                SME Edition · AI-Powered
              </p>
            </div>
          </div>

          {/* Live cost */}
          {tools.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={uiLabel}>Monthly Burn</p>
              <p style={{
                fontFamily: 'var(--font-mono-jb)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--brand)',
                lineHeight: 1,
                marginTop: 3,
                letterSpacing: '-0.02em',
              }}>
                ${totalMonthly.toLocaleString()}
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--stone)', marginLeft: 4 }}>/mo</span>
              </p>
              <p style={{ ...uiLabel, marginTop: 3, color: 'var(--fog)' }}>
                ${totalAnnual.toLocaleString()} / year
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main ───────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px 60px', width: '100%', flex: 1 }}>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {(['inventory', 'analysis'] as const).map(t => {
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '9px 20px',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans-3)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'var(--brand)' : 'var(--stone)',
                  transition: 'color 0.15s',
                }}
              >
                {t === 'inventory'
                  ? `Inventory${tools.length > 0 ? ` (${tools.length})` : ''}`
                  : `Analysis${analysis ? ' ✓' : ''}`}
              </button>
            )
          })}
        </div>

        {/* ──── INVENTORY TAB ──── */}
        {tab === 'inventory' && (
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setShowForm(true); setEditingTool(null) }}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 16px',
                    fontFamily: 'var(--font-sans-3)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> Add Tool
                </button>

                {tools.length === 0 && (
                  <button
                    onClick={loadSample}
                    className="btn-ghost"
                    style={{
                      padding: '8px 16px',
                      fontFamily: 'var(--font-sans-3)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                    }}
                  >
                    Load Sample Data
                  </button>
                )}
              </div>

              {tools.length >= 2 && (
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 22px',
                    fontFamily: 'var(--font-sans-3)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  {analyzing ? (
                    <>
                      <span style={{
                        width: 12, height: 12, borderRadius: '50%',
                        border: '2px solid rgba(250,249,245,0.25)', borderTopColor: 'var(--ivory)',
                        display: 'inline-block', animation: 'spin 0.8s linear infinite',
                      }} />
                      Scanning…
                    </>
                  ) : 'Run AI Analysis'}
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 16px',
                background: 'var(--red-bg)', border: '1px solid var(--red-border)',
                fontFamily: 'var(--font-sans-3)', fontSize: '0.82rem', color: 'var(--red-text)',
              }}>
                {error}
              </div>
            )}

            {/* Inline form */}
            {(showForm || editingTool) && (
              <div className="card" style={{ padding: '22px 24px', marginBottom: 20 }}>
                <p style={{ ...uiLabel, color: 'var(--brand)', marginBottom: 18 }}>
                  {editingTool ? 'Edit Tool' : 'New Tool'}
                </p>
                <ToolForm
                  initial={editingTool ?? undefined}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setEditingTool(null) }}
                />
              </div>
            )}

            {/* Empty state */}
            {tools.length === 0 && !showForm && (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                border: '1px dashed var(--border-mid)',
                background: 'var(--ivory)',
              }}>
                <div style={{
                  width: 56, height: 56, margin: '0 auto 20px',
                  background: 'var(--tag-mid)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  🔒
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-serif-4)', fontSize: '1.1rem', fontWeight: 600,
                  color: 'var(--near-black)', marginBottom: 10,
                }}>
                  No tools added yet
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--olive)', marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
                  Map your security stack and let the AI surface waste, overlaps, and cheaper alternatives sized for your SME budget.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                    style={{ padding: '9px 20px', fontFamily: 'var(--font-sans-3)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em' }}
                  >
                    Add First Tool
                  </button>
                  <button
                    onClick={loadSample}
                    className="btn-ghost"
                    style={{ padding: '9px 20px', fontFamily: 'var(--font-sans-3)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em' }}
                  >
                    Load Sample Stack
                  </button>
                </div>
              </div>
            )}

            {/* Tool table */}
            {tools.length > 0 && (
              <div className="card" style={{ overflowX: 'auto' }}>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 130px 80px 110px 110px 110px',
                  padding: '8px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--warm-sand)',
                }}>
                  {['Tool / Vendor', 'Category', 'Seats', 'Monthly', 'Annual', ''].map((h, i) => (
                    <span key={i} style={{ ...uiLabel, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {tools.map(tool => {
                  const cat = CAT[tool.category] ?? CAT.other
                  return (
                    <div key={tool.id} className="tool-row" style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 130px 80px 110px 110px 110px',
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      transition: 'background 0.12s',
                      position: 'relative',
                    }}>
                      {/* Left accent bar on hover */}
                      <div className="row-bar" style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                        background: 'var(--brand)',
                      }} />

                      {/* Tool name */}
                      <div style={{ paddingLeft: 6 }}>
                        <p style={{ fontFamily: 'var(--font-serif-4)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--near-black)', marginBottom: 1 }}>
                          {tool.name}
                        </p>
                        <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', color: 'var(--stone)' }}>
                          {tool.vendor}
                        </p>
                        {tool.description && (
                          <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.68rem', color: 'var(--fog)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                            {tool.description}
                          </p>
                        )}
                      </div>

                      {/* Category badge */}
                      <div>
                        <span style={{
                          padding: '3px 9px', display: 'inline-block',
                          fontFamily: 'var(--font-sans-3)', fontSize: '0.65rem', letterSpacing: '0.06em', fontWeight: 600,
                          color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`,
                        }}>
                          {cat.label}
                        </span>
                      </div>

                      {/* Seats */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono-jb)', fontSize: '0.82rem', color: 'var(--dark-warm)' }}>
                        {tool.seats}
                      </div>

                      {/* Monthly */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono-jb)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brand)' }}>
                        ${tool.monthlyCost.toLocaleString()}
                      </div>

                      {/* Annual */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono-jb)', fontSize: '0.78rem', color: 'var(--stone)' }}>
                        ${(tool.monthlyCost * 12).toLocaleString()}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setEditingTool(tool); setShowForm(false) }}
                          style={{
                            fontFamily: 'var(--font-sans-3)', fontSize: '0.65rem', fontWeight: 600,
                            padding: '3px 10px', cursor: 'pointer',
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--stone)', transition: 'color 0.15s, border-color 0.15s', letterSpacing: '0.04em',
                          }}
                          onMouseEnter={e => { (e.currentTarget).style.color = 'var(--brand)'; (e.currentTarget).style.borderColor = 'var(--brand)'; }}
                          onMouseLeave={e => { (e.currentTarget).style.color = 'var(--stone)'; (e.currentTarget).style.borderColor = 'var(--border)'; }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          style={{
                            fontFamily: 'var(--font-sans-3)', fontSize: '0.65rem', fontWeight: 600,
                            padding: '3px 10px', cursor: 'pointer',
                            border: '1px solid transparent', background: 'transparent',
                            color: 'var(--fog)', transition: 'color 0.15s', letterSpacing: '0.04em',
                          }}
                          onMouseEnter={e => (e.currentTarget).style.color = 'var(--red-text)'}
                          onMouseLeave={e => (e.currentTarget).style.color = 'var(--fog)'}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}

                {/* Totals footer */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 130px 80px 110px 110px 110px',
                  padding: '11px 20px',
                  background: 'var(--tag-light)',
                  borderTop: '2px solid var(--brand-mid)',
                }}>
                  <span style={{ ...uiLabel, color: 'var(--olive)' }}>
                    {tools.length} tool{tools.length !== 1 ? 's' : ''} tracked
                  </span>
                  <span /><span />
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono-jb)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand)' }}>
                    ${totalMonthly.toLocaleString()}
                  </span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono-jb)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-light)' }}>
                    ${totalAnnual.toLocaleString()}
                  </span>
                  <span />
                </div>
              </div>
            )}

            {/* Run CTA at bottom */}
            {tools.length >= 2 && !showForm && !editingTool && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 28px',
                    fontFamily: 'var(--font-sans-3)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em',
                  }}
                >
                  {analyzing ? (
                    <>
                      <span style={{
                        width: 13, height: 13, borderRadius: '50%',
                        border: '2px solid rgba(250,249,245,0.25)', borderTopColor: 'var(--ivory)',
                        display: 'inline-block', animation: 'spin 0.8s linear infinite',
                      }} />
                      Scanning…
                    </>
                  ) : 'Run AI Analysis — Find Savings'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ──── ANALYSIS TAB ──── */}
        {tab === 'analysis' && (
          <div>
            {!analysis && !analyzing && (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                border: '1px dashed var(--border-mid)', background: 'var(--ivory)',
              }}>
                <p style={{ fontFamily: 'var(--font-serif-4)', fontSize: '1rem', fontWeight: 600, color: 'var(--dark-warm)', marginBottom: 10 }}>
                  No analysis yet
                </p>
                <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.85rem', color: 'var(--olive)', marginBottom: 24 }}>
                  Add at least 2 tools and run the AI scan from the Inventory tab.
                </p>
                <button
                  onClick={() => setTab('inventory')}
                  className="btn-ghost"
                  style={{ padding: '9px 20px', fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em' }}
                >
                  ← Go to Inventory
                </button>
              </div>
            )}

            {analyzing && (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                border: '1px solid var(--border)', background: 'var(--ivory)',
              }}>
                <div style={{
                  width: 56, height: 56, margin: '0 auto 24px',
                  background: 'var(--tag-mid)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: '2px solid var(--tag-deep)', borderTopColor: 'var(--brand)',
                    display: 'block', animation: 'spin 0.9s linear infinite',
                  }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif-4)', fontSize: '1rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 8 }}>
                  Analysing your stack
                </h3>
                <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.82rem', color: 'var(--olive)' }}>
                  Searching live market data · identifying overlaps · sizing alternatives…
                </p>
              </div>
            )}

            {analysis && <AnalysisResults result={analysis} />}

            {analysis && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setTab('inventory')}
                  style={{
                    fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--stone)', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
                >
                  ← Back to Inventory
                </button>
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="btn-ghost"
                  style={{ padding: '7px 16px', fontFamily: 'var(--font-sans-3)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.06em' }}
                >
                  Re-run Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--ivory)',
        padding: '8px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, background: 'var(--green-text)', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ ...uiLabel, color: 'var(--green-text)' }}>System Ready</span>
          </div>
          <span style={uiLabel}>{tools.length} tools · ${totalMonthly.toLocaleString()}/mo</span>
        </div>
        <span style={{ ...uiLabel, color: 'var(--fog)' }}>AI: claude-sonnet-4-6 · Web search: on</span>
      </footer>
    </div>
  )
}
