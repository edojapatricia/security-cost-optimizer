'use client'

import type { AnalysisResult } from '@/lib/types'

interface Props { result: AnalysisResult }

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const SECTION = (color: string, dim: string, border: string) => ({
  background: dim,
  border: `1px solid ${border}`,
  borderRadius: 14,
  padding: '20px 22px',
})

export default function AnalysisResults({ result }: Props) {
  const pct   = result.totalMonthlyCost > 0
    ? Math.min(100, Math.round((result.potentialMonthlySavings / result.totalMonthlyCost) * 100))
    : 0
  const r     = 30
  const circ  = 2 * Math.PI * r
  const dash  = (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── Stat row ── */}
      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Current spend */}
        <div className="glass" style={{ borderRadius: 14, padding: '18px 20px' }}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            CURRENT_SPEND
          </p>
          <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-space)', fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>
            {fmt(result.totalMonthlyCost)}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-space)' }}>
            {fmt(result.totalMonthlyCost * 12)} / yr
          </p>
        </div>

        {/* Savings */}
        <div className="glass" style={{ borderRadius: 14, padding: '18px 20px', borderColor: 'rgba(0,229,160,0.12)' }}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            POTENTIAL_SAVINGS
          </p>
          <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-space)', fontWeight: 700, color: 'var(--mint)', lineHeight: 1 }}>
            {fmt(result.potentialMonthlySavings)}
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-space)' }}>
            {fmt(result.potentialMonthlySavings * 12)} / yr
          </p>
        </div>

        {/* Savings ring */}
        <div className="glass" style={{ borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="76" height="76" viewBox="0 0 76 76" style={{ flexShrink: 0 }}>
            <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(184,255,71,0.08)" strokeWidth="5" />
            <circle
              cx="38" cy="38" r={r}
              fill="none"
              stroke="var(--lime)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={circ / 4}
              className="ring-progress"
            />
            <text x="38" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--lime)" fontFamily="var(--font-space)">{pct}%</text>
            <text x="38" y="48" textAnchor="middle" fontSize="7.5" fill="rgba(223,240,230,0.3)" fontFamily="var(--font-space)">SAVED</text>
          </svg>
          <div>
            <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>SAVINGS_RATE</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>of current spend recoverable</p>
          </div>
        </div>
      </div>

      {/* ── AI Summary ── */}
      <div className="glass fade-up fade-up-2" style={{ borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block', boxShadow: '0 0 8px var(--lime)' }} />
          <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--lime)', textTransform: 'uppercase' }}>
            AI_ANALYSIS
          </span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
      </div>

      {/* ── Priority Actions ── */}
      {result.prioritizedActions.length > 0 && (
        <div className="fade-up fade-up-2" style={SECTION('var(--mint)', 'rgba(0,229,160,0.05)', 'rgba(0,229,160,0.15)')}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--mint)', textTransform: 'uppercase', marginBottom: 14 }}>
            ▸ PRIORITY_ACTIONS
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.prioritizedActions.map((action, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontFamily: 'var(--font-space)', color: 'var(--mint)', fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Overlaps ── */}
      {result.overlaps.length > 0 && (
        <div className="fade-up fade-up-3" style={SECTION('var(--amber)', 'rgba(255,176,32,0.05)', 'rgba(255,176,32,0.18)')}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 14 }}>
            ⚠ OVERLAPPING_TOOLS ({result.overlaps.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.overlaps.map((o, i) => (
              <div key={i} style={{
                background: 'rgba(3,11,7,0.5)', borderRadius: 10, padding: '14px 16px',
                border: '1px solid rgba(255,176,32,0.1)',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {o.tools.map(t => (
                    <span key={t} style={{
                      padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(255,176,32,0.12)', border: '1px solid rgba(255,176,32,0.28)',
                      fontSize: '0.72rem', fontFamily: 'var(--font-space)', color: 'var(--amber)',
                    }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{o.reason}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>→ {o.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Redundancies ── */}
      {result.redundantTools.length > 0 && (
        <div className="fade-up fade-up-4" style={SECTION('var(--coral)', 'rgba(255,76,94,0.05)', 'rgba(255,76,94,0.2)')}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--coral)', textTransform: 'uppercase', marginBottom: 12 }}>
            ✕ REDUNDANT_FOR_SME ({result.redundantTools.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {result.redundantTools.map(t => (
              <span key={t} style={{
                padding: '4px 12px', borderRadius: 20,
                background: 'rgba(255,76,94,0.12)', border: '1px solid rgba(255,76,94,0.28)',
                fontSize: '0.72rem', fontFamily: 'var(--font-space)', color: 'var(--coral)',
              }}>{t}</span>
            ))}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.redundancyReason}</p>
        </div>
      )}

      {/* ── Alternatives ── */}
      {result.alternatives.length > 0 && (
        <div className="fade-up fade-up-4" style={{ ...SECTION('var(--lime)', 'rgba(184,255,71,0.04)', 'rgba(184,255,71,0.12)') }}>
          <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-space)', letterSpacing: '0.14em', color: 'var(--lime)', textTransform: 'uppercase', marginBottom: 14 }}>
            ⇄ CHEAPER_ALTERNATIVES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.alternatives.map((alt, i) => (
              <div key={i} style={{
                background: 'rgba(3,11,7,0.5)', borderRadius: 10, padding: '16px 18px',
                border: '1px solid rgba(184,255,71,0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-syne)', marginBottom: 2 }}>{alt.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space)' }}>{alt.vendor}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mint)', fontFamily: 'var(--font-space)' }}>
                      save {fmt(alt.savings)}/mo
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space)', marginTop: 2 }}>
                      ~{fmt(alt.estimatedMonthlyCost)}/mo
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {alt.replaces.map(t => (
                    <span key={t} style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: 'rgba(184,255,71,0.06)', border: '1px solid rgba(184,255,71,0.15)',
                      fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-space)',
                    }}>replaces {t}</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{alt.notes}</p>
                {alt.complianceSuitable && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)',
                    fontSize: '0.68rem', fontFamily: 'var(--font-space)', color: 'var(--mint)',
                  }}>
                    ✓ COMPLIANCE_SUITABLE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sources ── */}
      {result.sources && result.sources.length > 0 && (
        <div className="fade-up fade-up-5" style={{
          borderRadius: 12, padding: '14px 18px',
          background: 'rgba(3,11,7,0.4)', border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.58rem', fontFamily: 'var(--font-space)', letterSpacing: '0.16em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            ⌖ SOURCES_RESEARCHED
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--lime)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title || s.url}
                </span>
                <span style={{ flexShrink: 0, opacity: 0.5 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
