interface TimeWindowOption {
  label: string
  value: number
}

const OPTIONS: TimeWindowOption[] = [
  { label: '30s', value: 30 },
  { label: '1min', value: 60 },
  { label: '5min', value: 300 },
]

interface TimeWindowSelectorProps {
  value: number
  onChange: (v: number) => void
}

export function TimeWindowSelector({ value, onChange }: TimeWindowSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
      {OPTIONS.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: active ? 600 : 400,
              padding: '3px 8px',
              borderRadius: '4px',
              border: `1px solid ${active ? '#00c853' : '#2a2a2a'}`,
              backgroundColor: active ? '#00c85322' : '#1a1a1a',
              color: active ? '#00c853' : '#666666',
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
