import { useHardware } from '../../context/HardwareContext'
import type { MotorStatus as MotorStatusType } from '../../context/types'

function getStatusColor(status: MotorStatusType): string {
  switch (status) {
    case 'RUNNING':
      return '#00c853'
    case 'ERROR':
      return '#ff1744'
    case 'STOPPED':
    default:
      return '#666666'
  }
}

function getConnectionDotColor(wsStatus: string): string {
  switch (wsStatus) {
    case 'CONNECTED':
      return '#00c853'
    case 'RECONNECTING':
      return '#ffab00'
    case 'DISCONNECTED':
    default:
      return '#ff1744'
  }
}

export default function MotorStatus() {
  const { hardware } = useHardware()
  const { motorStatus, direction, wsStatus } = hardware

  const statusColor = getStatusColor(motorStatus)
  const dotColor = getConnectionDotColor(wsStatus)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {/* Motor status label */}
      <div
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: statusColor,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {motorStatus}
      </div>

      {/* Direction indicator */}
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          color: '#888888',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {direction === 'FORWARD' ? '▶' : '◀'}
        <span>{direction}</span>
      </div>

      {/* Connection status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: '2px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: dotColor,
            boxShadow: wsStatus === 'CONNECTED' ? `0 0 4px ${dotColor}` : 'none',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#666666',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {wsStatus}
        </span>
      </div>
    </div>
  )
}
