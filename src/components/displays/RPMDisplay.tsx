import { useHardware } from '../../context/HardwareContext'

export function RPMDisplay() {
  const { hardware } = useHardware()
  const { currentRPM, targetRPM, motorStatus } = hardware

  const isRunning = motorStatus === 'RUNNING'
  const rpmColor = isRunning ? '#00c853' : '#444444'
  const showDash = currentRPM === 0 && motorStatus !== 'RUNNING'

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      {/* Large RPM value */}
      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '42px',
          color: rpmColor,
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        {showDash ? '—' : currentRPM}
      </div>

      {/* RPM label */}
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
        RPM
      </div>

      {/* Target RPM line */}
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
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            color: '#666666',
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
            color: '#ffab00',
          }}
        >
          {targetRPM}
        </span>
      </div>
    </div>
  )
}
