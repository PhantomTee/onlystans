import { useHardware } from '../../context/HardwareContext'

export function ErrorDisplay() {
  const { hardware } = useHardware()
  const { pidError, motorStatus } = hardware

  const motorStopped = motorStatus !== 'RUNNING'
  const isLargeNegative = pidError < -3

  let displayText: string
  if (motorStopped) {
    displayText = '—'
  } else if (pidError > 0) {
    displayText = `+${pidError}`
  } else {
    displayText = String(pidError)
  }

  const color = motorStopped
    ? 'var(--rl-muted)'
    : isLargeNegative
    ? 'var(--rl-red)'
    : 'var(--rl-green)'

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '42px',
          color,
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        {displayText}
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
        PID ERROR
      </div>
    </div>
  )
}
