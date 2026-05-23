'use client'

import type { AnalysisResult } from '@/lib/types'

interface Props { result: AnalysisResult }

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const uiLabel: React.CSSProperties = {
  fontFamily: 'var(--font-sans-3)',
  fontSize: '0.6rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--stone)',
}

/* Section box — color scheme drives the look */
const SECTION = (bg: string, border: string): React.CSSProperties => ({
  background: bg,
  border: `1px solid ${border}`,
  padding: '20px 24px',
})

export default function AnalysisResults({ result }: Props) {
  const pct  = result.totalMonthlyCost > 0
    ? Math.min(100, Math.round((result.potentialMonthlySavings / result.totalMonthlyCost) * 100))
    : 0
  const r    = 30
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Stat row ── */}
      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

        {/* Current spend */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ ...uiLabel, marginBottom: 10 }}>Monthly Spend</p>
          <p style={{ fontFamily: 'var(--font-mono-jb)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--near-black)', lineHeight: 1 }}>
            {fmt(result.totalMonthlyCost)}
          </p>
          <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', color: 'var(--stone)', marginTop: 8 }}>
            {fmt(result.totalMonthlyCost * 12)} per year
          </p>
        </div>

        {/* Savings */}
        <div style={{ background: 'var(--ivory)', border: '1px solid var(--brand-mid)', padding: '20px 22px' }}>
          <p style={{ ...uiLabel, marginBottom: 10 }}>Potential Savings</p>
          <p style={{ fontFamily: 'var(--font-mono-jb)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--brand)', lineHeight: 1 }}>
            {fmt(result.potentialMonthlySavings)}
          </p>
          <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', color: 'var(--stone)', marginTop: 8 }}>
            {fmt(result.potentialMonthlySavings * 12)} per year
          </p>
        </div>

        {/* Savings ring */}
        <div className="card" style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="76" height="76" viewBox="0 0 76 76" style={{ flexShrink: 0 }}>
            <circle cx="38" cy="38" r={r} fill="none" stroke="var(--warm-sand)" strokeWidth="5" />
            <circle
              cx="38" cy="38" r={r}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={circ / 4}
              className="ring-progress"
            />
            <text x="38" y="35" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--brand)" fontFamily="var(--font-mono-jb)">{pct}%</text>
            <text x="38" y="48" textAnchor="middle" fontSize="7.5" fill="var(--stone)" fontFamily="var(--font-sans-3)">SAVED</text>
          </svg>
          <div>
            <p style={{ ...uiLabel, marginBottom: 6 }}>Savings Rate</p>
            <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.8rem', color: 'var(--olive)', lineHeight: 1.5 }}>
              of current spend recoverable
            </p>
          </div>
        </div>
      </div>

      {/* ── AI Summary ── */}
      <div className="card fade-up fade-up-2" style={{ padding: '18px 22px', borderLeft: '3px solid var(--brand)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ ...uiLabel, color: 'var(--brand)' }}>AI Analysis</span>
        </div>
        <p style={{ fontFamily: 'var(--font-serif-4)', fontSize: '0.95rem', color: 'var(--dark-warm)', lineHeight: 1.75 }}>
          {result.summary}
        </p>
      </div>

      {/* ── Priority Actions ── */}
      {result.prioritizedActions.length > 0 && (
        <div className="fade-up fade-up-2" style={SECTION('var(--tag-light)', 'var(--tag-deep)')}>
          <p style={{ ...uiLabel, color: 'var(--brand)', marginBottom: 14 }}>
            Priority Actions
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.prioritizedActions.map((action, i) => (
              <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22,
                  background: 'var(--brand)', color: 'var(--ivory)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono-jb)', fontSize: '0.65rem', fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.88rem', color: 'var(--dark-warm)', lineHeight: 1.6 }}>
                  {action}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Overlaps ── */}
      {result.overlaps.length > 0 && (
        <div className="fade-up fade-up-3" style={SECTION('var(--amber-bg)', 'var(--amber-border)')}>
          <p style={{ ...uiLabel, color: 'var(--amber-text)', marginBottom: 14 }}>
            Overlapping Tools ({result.overlaps.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.overlaps.map((o, i) => (
              <div key={i} style={{
                background: 'var(--ivory)', padding: '14px 16px',
                border: '1px solid var(--amber-border)',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {o.tools.map(t => (
                    <span key={t} style={{
                      padding: '3px 10px',
                      background: '#FEF0C7', border: '1px solid var(--amber-border)',
                      fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--amber-text)',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.82rem', color: 'var(--olive)', marginBottom: 6 }}>
                  {o.reason}
                </p>
                <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.84rem', color: 'var(--dark-warm)', fontWeight: 600 }}>
                  → {o.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Redundancies ── */}
      {result.redundantTools.length > 0 && (
        <div className="fade-up fade-up-4" style={SECTION('var(--red-bg)', 'var(--red-border)')}>
          <p style={{ ...uiLabel, color: 'var(--red-text)', marginBottom: 12 }}>
            Redundant for SME ({result.redundantTools.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {result.redundantTools.map(t => (
              <span key={t} style={{
                padding: '4px 12px',
                background: '#FAD4D4', border: '1px solid var(--red-border)',
                fontFamily: 'var(--font-sans-3)', fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--red-text)',
              }}>
                {t}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.84rem', color: 'var(--dark-warm)', lineHeight: 1.6 }}>
            {result.redundancyReason}
          </p>
        </div>
      )}

      {/* ── Alternatives ── */}
      {result.alternatives.length > 0 && (
        <div className="fade-up fade-up-4" style={SECTION('var(--green-bg)', 'var(--green-border)')}>
          <p style={{ ...uiLabel, color: 'var(--green-text)', marginBottom: 14 }}>
            Cheaper Alternatives
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.alternatives.map((alt, i) => (
              <div key={i} style={{
                background: 'var(--ivory)', padding: '18px 20px',
                border: '1px solid var(--green-border)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-serif-4)', fontSize: '1rem', fontWeight: 600, color: 'var(--near-black)', marginBottom: 2 }}>
                      {alt.name}
                    </p>
                    <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.75rem', color: 'var(--stone)', letterSpacing: '0.04em' }}>
                      {alt.vendor}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-mono-jb)', fontSize: '1rem', fontWeight: 700, color: 'var(--green-text)' }}>
                      save {fmt(alt.savings)}/mo
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono-jb)', fontSize: '0.72rem', color: 'var(--stone)', marginTop: 2 }}>
                      ~{fmt(alt.estimatedMonthlyCost)}/mo
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {alt.replaces.map(t => (
                    <span key={t} style={{
                      padding: '2px 8px',
                      background: '#D4EEE0', border: '1px solid var(--green-border)',
                      fontFamily: 'var(--font-sans-3)', fontSize: '0.68rem', color: 'var(--green-text)',
                    }}>
                      replaces {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-sans-3)', fontSize: '0.82rem', color: 'var(--olive)', lineHeight: 1.6, marginBottom: 10 }}>
                  {alt.notes}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {/* Price verification badge */}
                  {alt.priceVerified ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px',
                      background: '#D4EEE0', border: '1px solid var(--green-border)',
                      fontFamily: 'var(--font-sans-3)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--green-text)',
                    }}
                      title={alt.priceSource ? `Source: ${alt.priceSource}` : undefined}
                    >
                      ✓ Price Verified
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px',
                      background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
                      fontFamily: 'var(--font-sans-3)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--amber-text)',
                    }}>
                      ~ Price Estimated
                    </span>
                  )}
                  {alt.complianceSuitable && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px',
                      background: '#D4EEE0', border: '1px solid var(--green-border)',
                      fontFamily: 'var(--font-sans-3)', fontSize: '0.68rem', fontWeight: 600, color: 'var(--green-text)',
                    }}>
                      ✓ Compliance Suitable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sources ── */}
      {result.sources && result.sources.length > 0 && (
        <div className="fade-up fade-up-5" style={{
          padding: '14px 18px',
          background: 'var(--ivory)', border: '1px solid var(--border)',
        }}>
          <p style={{ ...uiLabel, marginBottom: 10 }}>Sources Researched</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'var(--font-sans-3)', fontSize: '0.75rem', color: 'var(--stone)',
                  textDecoration: 'none', transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--brand)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone)')}
              >
                <span style={{ width: 4, height: 4, background: 'currentColor', flexShrink: 0 }} />
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
