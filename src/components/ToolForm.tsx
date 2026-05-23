'use client'

import { useState } from 'react'
import type { SecurityTool, ToolCategory } from '@/lib/types'

const CATEGORIES: { value: ToolCategory; label: string }[] = [
  { value: 'endpoint',      label: 'Endpoint Protection' },
  { value: 'network',       label: 'Network Security' },
  { value: 'identity',      label: 'Identity & Access' },
  { value: 'cloud',         label: 'Cloud Security' },
  { value: 'email',         label: 'Email Security' },
  { value: 'backup',        label: 'Backup & Recovery' },
  { value: 'compliance',    label: 'Compliance & GRC' },
  { value: 'siem',          label: 'SIEM / Logging' },
  { value: 'vulnerability', label: 'Vulnerability Mgmt' },
  { value: 'other',         label: 'Other' },
]

interface Props {
  initial?: SecurityTool
  onSave: (tool: Omit<SecurityTool, 'id'> & { id?: string }) => void
  onCancel: () => void
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans-3)',
  fontSize: '0.62rem',
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--stone)',
  fontWeight: 600,
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--parchment)',
  border: '1px solid var(--border-mid)',
  padding: '9px 12px',
  fontSize: '0.88rem',
  fontFamily: 'var(--font-sans-3)',
  color: 'var(--near-black)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export default function ToolForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name:        initial?.name ?? '',
    vendor:      initial?.vendor ?? '',
    category:    initial?.category ?? ('endpoint' as ToolCategory),
    monthlyCost: initial?.monthlyCost?.toString() ?? '',
    seats:       initial?.seats?.toString() ?? '1',
    description: initial?.description ?? '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id:          initial?.id,
      name:        form.name.trim(),
      vendor:      form.vendor.trim(),
      category:    form.category,
      monthlyCost: parseFloat(form.monthlyCost) || 0,
      seats:       parseInt(form.seats) || 1,
      description: form.description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Tool Name *</label>
          <input
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. CrowdStrike Falcon"
            className="inp"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Vendor *</label>
          <input
            required
            value={form.vendor}
            onChange={e => set('vendor', e.target.value)}
            placeholder="e.g. CrowdStrike"
            className="inp"
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Category *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="inp"
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Monthly Cost ($) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.monthlyCost}
            onChange={e => set('monthlyCost', e.target.value)}
            placeholder="0.00"
            className="inp"
            style={{ ...inputStyle, fontFamily: 'var(--font-mono-jb)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Seats</label>
          <input
            type="number"
            min="1"
            value={form.seats}
            onChange={e => set('seats', e.target.value)}
            className="inp"
            style={{ ...inputStyle, fontFamily: 'var(--font-mono-jb)' }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description / Key Features</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Key capabilities, integrations, what this tool does…"
          rows={2}
          className="inp"
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost"
          style={{
            padding: '8px 18px',
            fontFamily: 'var(--font-sans-3)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '8px 22px',
            fontFamily: 'var(--font-sans-3)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {initial ? 'Save Changes' : 'Add Tool'}
        </button>
      </div>
    </form>
  )
}
