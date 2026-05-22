'use client'

import { useState, useEffect } from 'react'
import type { SecurityTool, AnalysisResult } from '@/lib/types'
import ToolForm from '@/components/ToolForm'
import AnalysisResults from '@/components/AnalysisResults'

/* ─── Category config ────────────────────────────────────────── */
const CAT: Record<string, { label: string; color: string; bg: string; border: string }> = {
  endpoint:      { label: 'Endpoint',    color: '#F87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)' },
  network:       { label: 'Network',     color: '#22D3EE', bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.25)' },
  identity:      { label: 'Identity',    color: '#C084FC', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.25)' },
  cloud:         { label: 'Cloud',       color: '#7DD3FC', bg: 'rgba(125,211,252,0.1)',  border: 'rgba(125,211,252,0.25)' },
  email:         { label: 'Email',       color: '#FCD34D', bg: 'rgba(252,211,77,0.1)',   border: 'rgba(252,211,77,0.25)' },
  backup:        { label: 'Backup',      color: '#FB923C', bg: 'rgba(251,146,60,0.1)',   border: 'rgba(251,146,60,0.25)' },
  compliance:    { label: 'Compliance',  color: '#6EE7B7', bg: 'rgba(110,231,183,0.1)',  border: 'rgba(110,231,183,0.25)' },
  siem:          { label: 'SIEM',        color: '#F0ABFC', bg: 'rgba(240,171,252,0.1)',  border: 'rgba(240,171,252,0.25)' },
  vulnerability: { label: 'Vuln Mgmt',  color: '#FCA5A5', bg: 'rgba(252,165,165,0.1)',  border: 'rgba(252,165,165,0.25)' },
  other:         { label: 'Other',       color: '#94A3B8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)' },
}

const STORAGE_KEY = 'sco-tools'

const SAMPLE_TOOLS: Omit<SecurityTool, 'id'>[] = [
  { name: 'CrowdStrike Falcon',              vendor: 'CrowdStrike', category: 'endpoint',      monthlyCost: 840,  seats: 50, description: 'EDR/XDR endpoint protection, threat intelligence' },
  { name: 'Microsoft Defender for Endpoint', vendor: 'Microsoft',   category: 'endpoint',      monthlyCost: 375,  seats: 50, description: 'Built-in Windows endpoint protection, AV, EDR' },
  { name: 'Sophos XG Firewall',              vendor: 'Sophos',      category: 'network',       monthlyCost: 220,  seats: 1,  description: 'Next-gen firewall, IPS, web filtering' },
  { name: 'Cisco Umbrella',                  vendor: 'Cisco',       category: 'network',       monthlyCost: 480,  seats: 50, description: 'DNS-layer security, web filtering, CASB' },
  { name: 'Okta Workforce',                  vendor: 'Okta',        category: 'identity',      monthlyCost: 600,  seats: 50, description: 'SSO, MFA, lifecycle management' },
  { name: 'Microsoft Entra ID P2',           vendor: 'Microsoft',   category: 'identity',      monthlyCost: 450,  seats: 50, description: 'Azure AD, conditional access, PIM, MFA' },
  { name: 'Proofpoint Essentials',           vendor: 'Proofpoint',  category: 'email',         monthlyCost: 300,  seats: 50, description: 'Email security, anti-phishing, spam filtering' },
  { name: 'Veeam Backup',                    vendor: 'Veeam',       category: 'backup',        monthlyCost: 180,  seats: 1,  description: 'VM and server backup, ransomware recovery' },
  { name: 'Qualys VMDR',                     vendor: 'Qualys',      category: 'vulnerability', monthlyCost: 650,  seats: 1,  description: 'Vulnerability management, patch management, compliance' },
  { name: 'Tenable.io',                      vendor: 'Tenable',     category: 'vulnerability', monthlyCost: 580,  seats: 1,  description: 'Vulnerability scanning, asset discovery' },
]

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

  /* ─── Shared styles ──── */
  const monoLabel: React.CSSProperties = {
    fontFamily: 'var(--font-space)',
    fontSize: '0.6rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ─── Header ─────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(3,11,7,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(184,255,71,0.07)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Logo mark */}
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontFamily: 'var(--font-space)', fontWeight: 700, color: '#030B07',
              boxShadow: '0 0 20px rgba(184,255,71,0.45), 0 0 60px rgba(184,255,71,0.12)',
              flexShrink: 0,
            }}>$</div>

            <div>
              <h1 style={{
                fontFamily: 'var(--font-syne)', fontSize: '0.95rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'linear-gradient(110deg, var(--lime) 0%, var(--mint) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1.2,
              }}>Security Cost Optimizer</h1>
              <p style={{ ...monoLabel, marginTop: 2, color: 'rgba(184,255,71,0.35)' }}>
                SME_EDITION // AI_POWERED
              </p>
            </div>
          </div>

          {/* Live cost */}
          {tools.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={monoLabel}>MONTHLY_BURN</p>
              <p style={{ fontFamily: 'var(--font-space)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--amber)', lineHeight: 1, marginTop: 3, letterSpacing: '-0.02em' }}>
                ${totalMonthly.toLocaleString()}
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>/mo</span>
              </p>
              <p style={{ ...monoLabel, marginTop: 3, color: 'rgba(255,176,32,0.4)' }}>
                ${totalAnnual.toLocaleString()} / year
              </p>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main ───────────────────────────────────────────── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px 60px', width: '100%', flex: 1 }}>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4,
          background: 'rgba(8,21,16,0.9)', borderRadius: 12,
          border: '1px solid var(--border)', marginBottom: 28,
        }}>
          {(['inventory', 'analysis'] as const).map(t => {
            const active = tab === t
            return (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-space)', fontSize: '0.72rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', transition: 'all 0.2s',
                background: active ? 'var(--lime)' : 'transparent',
                color: active ? '#030B07' : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
                boxShadow: active ? '0 0 20px rgba(184,255,71,0.3)' : 'none',
              }}>
                {t === 'inventory' ? `INVENTORY${tools.length > 0 ? ` [${tools.length}]` : ''}` : 'ANALYSIS'}
                {t === 'analysis' && analysis && (
                  <span style={{ marginLeft: 6, color: active ? '#030B07' : 'var(--mint)' }}>✓</span>
                )}
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
                  className="btn-lime"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: 'var(--lime)', color: '#030B07',
                    fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> ADD_TOOL
                </button>
                {tools.length === 0 && (
                  <button onClick={loadSample} style={{
                    padding: '9px 18px', borderRadius: 9, cursor: 'pointer',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-space)', fontSize: '0.72rem', letterSpacing: '0.08em',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,255,71,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >
                    LOAD_DEMO
                  </button>
                )}
              </div>

              {tools.length >= 2 && (
                <button onClick={runAnalysis} disabled={analyzing} className="btn-run" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(184,255,71,0.3)',
                  background: 'linear-gradient(135deg, rgba(184,255,71,0.12), rgba(0,229,160,0.08))',
                  color: analyzing ? 'var(--text-muted)' : 'var(--lime)',
                  fontFamily: 'var(--font-space)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  opacity: analyzing ? 0.6 : 1,
                }}>
                  {analyzing ? (
                    <>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(184,255,71,0.2)', borderTopColor: 'var(--lime)',
                        display: 'inline-block', animation: 'spin 0.8s linear infinite',
                      }} />
                      SCANNING...
                    </>
                  ) : <>✦ RUN_AI_SCAN</>}
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '12px 16px', borderRadius: 10,
                background: 'rgba(255,76,94,0.08)', border: '1px solid rgba(255,76,94,0.25)',
                fontSize: '0.82rem', color: 'var(--coral)', fontFamily: 'var(--font-space)',
              }}>
                ERR: {error}
              </div>
            )}

            {/* Inline form */}
            {(showForm || editingTool) && (
              <div className="glass" style={{ borderRadius: 14, padding: '22px 24px', marginBottom: 20, borderColor: 'rgba(184,255,71,0.12)' }}>
                <p style={{ ...monoLabel, color: 'var(--lime)', marginBottom: 18, letterSpacing: '0.14em' }}>
                  {editingTool ? '// EDIT_TOOL' : '// NEW_TOOL'}
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
                border: '1px dashed rgba(184,255,71,0.1)', borderRadius: 20,
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="scan-line" />
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 22px',
                  background: 'rgba(184,255,71,0.05)', border: '1px solid rgba(184,255,71,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', position: 'relative',
                }}>
                  <div className="pulse-dot" style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'rgba(184,255,71,0.3)' }} />
                  🔒
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  No tools initialized
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
                  Map your security stack and let the AI surface waste, overlaps, and cheaper alternatives sized for your SME budget.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button onClick={() => setShowForm(true)} className="btn-lime" style={{
                    padding: '10px 22px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: 'var(--lime)', color: '#030B07',
                    fontFamily: 'var(--font-space)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
                    transition: 'box-shadow 0.2s',
                  }}>ADD_FIRST_TOOL</button>
                  <button onClick={loadSample} style={{
                    padding: '10px 22px', borderRadius: 9, cursor: 'pointer',
                    background: 'transparent', border: '1px solid var(--border)',
                    color: 'var(--text-secondary)', fontFamily: 'var(--font-space)', fontSize: '0.72rem', letterSpacing: '0.08em',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,255,71,0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                  >LOAD_DEMO_STACK</button>
                </div>
              </div>
            )}

            {/* Tool table */}
            {tools.length > 0 && (
              <div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 130px 80px 110px 110px 100px',
                  padding: '10px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'rgba(3,11,7,0.6)',
                }}>
                  {['TOOL / VENDOR', 'CATEGORY', 'SEATS', 'MONTHLY', 'ANNUAL', ''].map((h, i) => (
                    <span key={i} style={{ ...monoLabel, textAlign: i >= 2 ? 'right' : 'left' }}>{h}</span>
                  ))}
                </div>

                {/* Rows */}
                {tools.map(tool => {
                  const cat = CAT[tool.category] ?? CAT.other
                  return (
                    <div key={tool.id} className="tool-row" style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 130px 80px 110px 110px 100px',
                      padding: '13px 20px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}>
                      {/* Left accent bar on hover */}
                      <div className="row-bar" style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                        background: 'linear-gradient(to bottom, var(--lime), var(--mint))',
                        borderRadius: '0 2px 2px 0',
                        transition: 'opacity 0.2s',
                      }} />

                      {/* Tool name */}
                      <div style={{ paddingLeft: 4 }}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-dm)', marginBottom: 2 }}>
                          {tool.name}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space)' }}>
                          {tool.vendor}
                        </p>
                        {tool.description && (
                          <p style={{ fontSize: '0.7rem', color: 'rgba(223,240,230,0.18)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                            {tool.description}
                          </p>
                        )}
                      </div>

                      {/* Category badge */}
                      <div>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, display: 'inline-block',
                          fontSize: '0.65rem', fontFamily: 'var(--font-space)', letterSpacing: '0.06em',
                          color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`,
                        }}>{cat.label}</span>
                      </div>

                      {/* Seats */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-space)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {tool.seats}
                      </div>

                      {/* Monthly */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-space)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--amber)' }}>
                        ${tool.monthlyCost.toLocaleString()}
                      </div>

                      {/* Annual */}
                      <div style={{ textAlign: 'right', fontFamily: 'var(--font-space)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ${(tool.monthlyCost * 12).toLocaleString()}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={() => { setEditingTool(tool); setShowForm(false) }} style={{
                          fontSize: '0.65rem', fontFamily: 'var(--font-space)', padding: '4px 10px',
                          borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)',
                          background: 'transparent', color: 'var(--text-muted)', transition: 'color 0.2s, border-color 0.2s',
                          letterSpacing: '0.06em',
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,255,71,0.3)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        >EDIT</button>
                        <button onClick={() => handleDelete(tool.id)} style={{
                          fontSize: '0.65rem', fontFamily: 'var(--font-space)', padding: '4px 10px',
                          borderRadius: 6, cursor: 'pointer', border: '1px solid transparent',
                          background: 'transparent', color: 'var(--text-muted)', transition: 'color 0.2s',
                          letterSpacing: '0.06em',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--coral)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
                        >DEL</button>
                      </div>
                    </div>
                  )
                })}

                {/* Totals footer */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 130px 80px 110px 110px 100px',
                  padding: '12px 20px',
                  background: 'rgba(184,255,71,0.04)',
                  borderTop: '1px solid rgba(184,255,71,0.1)',
                }}>
                  <span style={{ ...monoLabel, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    {tools.length} TOOL{tools.length !== 1 ? 'S' : ''} TRACKED
                  </span>
                  <span />
                  <span />
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-space)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--amber)' }}>
                    ${totalMonthly.toLocaleString()}
                  </span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-space)', fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,176,32,0.6)' }}>
                    ${totalAnnual.toLocaleString()}
                  </span>
                  <span />
                </div>
              </div>
            )}

            {/* Run CTA at bottom */}
            {tools.length >= 2 && !showForm && !editingTool && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={runAnalysis} disabled={analyzing} className="btn-run" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 32px', borderRadius: 12,
                  border: '1px solid rgba(184,255,71,0.3)',
                  background: 'linear-gradient(135deg, rgba(184,255,71,0.14) 0%, rgba(0,229,160,0.08) 100%)',
                  color: 'var(--lime)',
                  fontFamily: 'var(--font-space)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  opacity: analyzing ? 0.6 : 1,
                }}>
                  {analyzing ? (
                    <>
                      <span style={{
                        width: 14, height: 14, borderRadius: '50%',
                        border: '2px solid rgba(184,255,71,0.2)', borderTopColor: 'var(--lime)',
                        display: 'inline-block',
                      }} />
                      SCANNING STACK...
                    </>
                  ) : <>✦ RUN_AI_ANALYSIS — FIND_SAVINGS</>}
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
                border: '1px dashed rgba(184,255,71,0.1)', borderRadius: 20,
              }}>
                <p style={{ fontFamily: 'var(--font-space)', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  NO_ANALYSIS_LOADED
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                  Add ≥ 2 tools and run the AI scan from the Inventory tab.
                </p>
                <button onClick={() => setTab('inventory')} style={{
                  padding: '9px 20px', borderRadius: 9, cursor: 'pointer',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-space)', fontSize: '0.72rem', letterSpacing: '0.08em',
                }}>← GO_TO_INVENTORY</button>
              </div>
            )}

            {analyzing && (
              <div style={{
                textAlign: 'center', padding: '80px 24px',
                position: 'relative', overflow: 'hidden',
                border: '1px dashed rgba(184,255,71,0.08)', borderRadius: 20,
              }}>
                <div className="scan-line" />
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
                  background: 'rgba(184,255,71,0.05)', border: '1px solid rgba(184,255,71,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '2px solid rgba(184,255,71,0.15)', borderTopColor: 'var(--lime)',
                    display: 'block', animation: 'spin 0.9s linear infinite',
                  }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1rem', fontWeight: 700, color: 'var(--lime)', marginBottom: 8 }}>
                  AI scanning your stack
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space)' }}>
                  Searching live market data · identifying overlaps · sizing alternatives...
                </p>
              </div>
            )}

            {analysis && <AnalysisResults result={analysis} />}

            {analysis && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setTab('inventory')} style={{
                  fontSize: '0.75rem', fontFamily: 'var(--font-space)', letterSpacing: '0.06em',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', transition: 'color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >← BACK_TO_INVENTORY</button>
                <button onClick={runAnalysis} disabled={analyzing} style={{
                  padding: '8px 18px', borderRadius: 9, cursor: analyzing ? 'not-allowed' : 'pointer',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontFamily: 'var(--font-space)', fontSize: '0.7rem', letterSpacing: '0.08em',
                  opacity: analyzing ? 0.5 : 1, transition: 'color 0.2s, border-color 0.2s',
                }}
                  onMouseEnter={e => { if (!analyzing) { (e.currentTarget as HTMLElement).style.color = 'var(--lime)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(184,255,71,0.3)'; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                >RE-RUN_ANALYSIS</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Status bar ─────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(3,11,7,0.85)',
        padding: '7px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 5px var(--mint)', display: 'inline-block' }} />
            <span style={{ ...monoLabel, color: 'rgba(0,229,160,0.5)' }}>SYSTEM_READY</span>
          </div>
          <span style={monoLabel}>{tools.length} TOOLS · ${totalMonthly.toLocaleString()}/MO</span>
        </div>
        <span style={{ ...monoLabel, color: 'rgba(184,255,71,0.2)' }}>AI_ENGINE: claude-sonnet-4-6 · WEB_SEARCH: ON</span>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
