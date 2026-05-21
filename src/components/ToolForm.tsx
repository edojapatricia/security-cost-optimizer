'use client'

import { useState } from 'react'
import type { SecurityTool, ToolCategory } from '@/lib/types'

const CATEGORIES: { value: ToolCategory; label: string }[] = [
  { value: 'endpoint', label: 'Endpoint Protection' },
  { value: 'network', label: 'Network Security' },
  { value: 'identity', label: 'Identity & Access' },
  { value: 'cloud', label: 'Cloud Security' },
  { value: 'email', label: 'Email Security' },
  { value: 'backup', label: 'Backup & Recovery' },
  { value: 'compliance', label: 'Compliance & GRC' },
  { value: 'siem', label: 'SIEM / Logging' },
  { value: 'vulnerability', label: 'Vulnerability Management' },
  { value: 'other', label: 'Other' },
]

interface Props {
  initial?: SecurityTool
  onSave: (tool: Omit<SecurityTool, 'id'> & { id?: string }) => void
  onCancel: () => void
}

export default function ToolForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    vendor: initial?.vendor ?? '',
    category: initial?.category ?? ('endpoint' as ToolCategory),
    monthlyCost: initial?.monthlyCost?.toString() ?? '',
    seats: initial?.seats?.toString() ?? '1',
    description: initial?.description ?? '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: initial?.id,
      name: form.name.trim(),
      vendor: form.vendor.trim(),
      category: form.category,
      monthlyCost: parseFloat(form.monthlyCost) || 0,
      seats: parseInt(form.seats) || 1,
      description: form.description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Tool Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. CrowdStrike Falcon"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Vendor *</label>
          <input
            required
            value={form.vendor}
            onChange={(e) => set('vendor', e.target.value)}
            placeholder="e.g. CrowdStrike"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Monthly Cost ($) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.monthlyCost}
            onChange={(e) => set('monthlyCost', e.target.value)}
            placeholder="0.00"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Seats / Licenses</label>
          <input
            type="number"
            min="1"
            value={form.seats}
            onChange={(e) => set('seats', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Description / Key Features</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What does this tool do? Key features, integrations..."
          rows={2}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
        >
          {initial ? 'Save Changes' : 'Add Tool'}
        </button>
      </div>
    </form>
  )
}
