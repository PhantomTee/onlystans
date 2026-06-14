import { useHardware } from '../../context/HardwareContext'

export function ErrorDisplay() {
  const { hardware } = useHardware()
  const { pidError, motorStatus } = hardware

  const motorStopped = motorStatus !== 'RUNNING'

  // Determine color:
  // pidError < -5  → overshooting → danger red
  // pidError > 5   → under speed, catching up → green
  // |pidError| <= 5 → within tolerance → green
  let errorColor: string
  if (pidError < -5) {
    errorColor = '#ff1744'
  } else {
    errorColor = '#00c853'
  }

  // Determine display text
  let displayText: string
  if (motorStopped) {
    displayText = '—'
  } else if (pidError > 0) {
    displayText = `+${pidError}`
  } else {
    displayText = String(pidError)
  }

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      {/* Large PID error value */}
      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '42px',
          color: motorStopped ? '#444444' : errorColor,
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        {displayText}
      </div>

      {/* PID ERROR label */}
      <div
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '11px',
          fontWeight: 600,
          color: '#888888',
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
