import { useHardware } from '../../context/HardwareContext'
import { createSetLoad } from '../../utils/websocket-messages'

export default function LoadToggle() {
  const { hardware, sendCommand } = useHardware()
  const { loadApplied } = hardware

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--rl-label)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Mechanical Load
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <button
          onClick={() => sendCommand(createSetLoad(false))}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            padding: '6px 4px',
            borderRadius: '4px',
            cursor: 'pointer',
            border: !loadApplied ? '1px solid var(--rl-primary)' : '1px solid var(--rl-border)',
            background: !loadApplied ? 'var(--rl-primary-muted)' : 'var(--rl-raised)',
            color: !loadApplied ? 'var(--rl-primary)' : 'var(--rl-label)',
          }}
        >
          No Load
        </button>
        <button
          onClick={() => sendCommand(createSetLoad(true))}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            padding: '6px 4px',
            borderRadius: '4px',
            cursor: 'pointer',
            border: loadApplied ? '1px solid var(--rl-primary)' : '1px solid var(--rl-border)',
            background: loadApplied ? 'var(--rl-primary-muted)' : 'var(--rl-raised)',
            color: loadApplied ? 'var(--rl-primary)' : 'var(--rl-label)',
          }}
        >
          Apply Load
        </button>
      </div>
    </div>
  )
}
