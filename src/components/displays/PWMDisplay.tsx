import { useHardware } from '../../context/HardwareContext'

export function PWMDisplay() {
  const { hardware } = useHardware()
  const { currentPWM, motorStatus } = hardware

  const displayPWM = motorStatus === 'STOPPED' ? 0 : currentPWM
  const pwmPercent = Math.min(100, Math.max(0, (displayPWM / 255) * 100))

  return (
    <div style={{ padding: '12px', textAlign: 'center' }}>
      <div
        style={{
          fontFamily: '"Share Tech Mono", monospace',
          fontSize: '42px',
          color: 'var(--rl-amber)',
          lineHeight: 1,
          letterSpacing: '-0.01em',
        }}
      >
        {displayPWM}
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
        PWM OUTPUT
      </div>

      <div
        style={{
          marginTop: '8px',
          width: '100%',
          height: '3px',
          borderRadius: '2px',
          backgroundColor: 'var(--rl-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pwmPercent}%`,
            borderRadius: '2px',
            backgroundColor: 'var(--rl-amber)',
            transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  )
}
