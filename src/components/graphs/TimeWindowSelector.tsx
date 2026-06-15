const OPTIONS = [
  { label: '30s', value: 30 },
  { label: '1min', value: 60 },
  { label: '5min', value: 300 },
]

export function TimeWindowSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
      {OPTIONS.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: active ? 600 : 400,
              padding: '3px 8px',
              borderRadius: '9999px',
              border: `1px solid ${active ? 'var(--rl-primary)' : 'var(--rl-border)'}`,
              backgroundColor: active ? 'var(--rl-primary-muted)' : 'var(--rl-raised)',
              color: active ? 'var(--rl-primary)' : 'var(--rl-label)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
