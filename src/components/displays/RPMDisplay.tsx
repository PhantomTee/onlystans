import { useHardware } from '../../context/HardwareContext'

export function RPMDisplay() {
  const { hardware } = useHardware()
  const { currentRPM, targetRPM, motorStatus } = hardware

  const isRunning = motorStatus === 'RUNNING'
  const showDash = currentRPM === 0 && motorStatus !== 'RUNNING'

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '42px',
          color: isRunning ? 'var(--rl-green)' : 'var(--rl-border)',
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        {showDash ? '—' : currentRPM}
      </div>

      <div
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--rl-label)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '4px',
        }}
      >
        RPM
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '6px',
        }}
      >
        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--rl-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          TARGET
        </span>
        <span
          style={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '14px',
            color: 'var(--rl-amber)',
          }}
        >
          {targetRPM}
        </span>
      </div>
    </div>
  )
}
