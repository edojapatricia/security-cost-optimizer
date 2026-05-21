'use client'

import type { AnalysisResult } from '@/lib/types'

interface Props {
  result: AnalysisResult
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function AnalysisResults({ result }: Props) {
  const savingsPct = result.totalMonthlyCost > 0
    ? Math.round((result.potentialMonthlySavings / result.totalMonthlyCost) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Current Monthly Spend</p>
          <p className="text-2xl font-bold text-white">{fmt(result.totalMonthlyCost)}</p>
          <p className="text-xs text-slate-500 mt-1">{fmt(result.totalMonthlyCost * 12)} / year</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-green-800/50">
          <p className="text-xs text-slate-400 mb-1">Potential Monthly Savings</p>
          <p className="text-2xl font-bold text-green-400">{fmt(result.potentialMonthlySavings)}</p>
          <p className="text-xs text-slate-500 mt-1">{fmt(result.potentialMonthlySavings * 12)} / year</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Savings Opportunity</p>
          <p className="text-2xl font-bold text-cyan-400">{savingsPct}%</p>
          <p className="text-xs text-slate-500 mt-1">of current spend</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
          <span className="text-cyan-400">◆</span> AI Summary
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Prioritized actions */}
      {result.prioritizedActions.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="text-green-400">▸</span> Prioritized Actions
          </h3>
          <ol className="space-y-2">
            {result.prioritizedActions.map((action, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-900/60 text-green-400 text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Overlaps */}
      {result.overlaps.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-amber-800/40">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span>⚠</span> Overlapping Tools ({result.overlaps.length})
          </h3>
          <div className="space-y-3">
            {result.overlaps.map((o, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <div className="flex flex-wrap gap-2 mb-2">
                  {o.tools.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-amber-900/40 text-amber-300 text-xs rounded-full border border-amber-800/50">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mb-1">{o.reason}</p>
                <p className="text-xs text-slate-300 font-medium">→ {o.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redundancies */}
      {result.redundantTools.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-red-800/40">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <span>✕</span> Redundant for SME ({result.redundantTools.length})
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {result.redundantTools.map((t) => (
              <span key={t} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full border border-red-800/50">
                {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400">{result.redundancyReason}</p>
        </div>
      )}

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <span className="text-cyan-400">⇄</span> Cheaper Alternatives
          </h3>
          <div className="space-y-3">
            {result.alternatives.map((alt, i) => (
              <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{alt.name}</p>
                    <p className="text-xs text-slate-400">{alt.vendor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">Save {fmt(alt.savings)}/mo</p>
                    <p className="text-xs text-slate-400">{fmt(alt.estimatedMonthlyCost)}/mo est.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {alt.replaces.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                      replaces: {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mb-2">{alt.notes}</p>
                {alt.complianceSuitable && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/40 text-green-400 text-xs rounded-full border border-green-800/50">
                    ✓ Compliance suitable
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
