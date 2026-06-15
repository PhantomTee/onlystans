import { useHardware } from '../../context/HardwareContext'
import type { MotorStatus as MotorStatusType } from '../../context/types'

function getStatusColor(status: MotorStatusType): string {
  switch (status) {
    case 'RUNNING':
      return 'var(--rl-green)'
    case 'ERROR':
      return 'var(--rl-red)'
    case 'STOPPED':
    default:
      return 'var(--rl-muted)'
  }
}

export default function MotorStatus() {
  const { hardware } = useHardware()
  const { motorStatus, direction } = hardware

  const statusColor = getStatusColor(motorStatus)
  const dotSize = 8

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
      {/* Status dot */}
      <span
        style={{
          display: 'inline-block',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: statusColor,
          flexShrink: 0,
        }}
      />

      {/* Status text */}
      <span
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          color: statusColor,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {motorStatus}
      </span>

      {/* Direction arrow */}
      <span
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '11px',
          color: 'var(--rl-label)',
        }}
      >
        {direction === 'FORWARD' ? '▶' : '◀'}
      </span>
    </div>
  )
}
