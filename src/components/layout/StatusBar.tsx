import { useHardware } from '../../context/HardwareContext'
import { MOCK_MODE } from '../../config'
import type { ConnectionStatus, MotorStatus } from '../../context/types'

function getStatusColor(status: ConnectionStatus | MotorStatus): string {
  switch (status) {
    case 'CONNECTED':
    case 'RUNNING':
      return '#00c853'
    case 'RECONNECTING':
      return '#ffab00'
    case 'DISCONNECTED':
    case 'STOPPED':
      return '#ff1744'
    case 'ERROR':
      return '#ff1744'
    default:
      return '#ff1744'
  }
}

interface StatusIndicatorProps {
  label: string
  status: ConnectionStatus | MotorStatus
  text: string
}

function StatusIndicator({ label, status, text }: StatusIndicatorProps) {
  const color = getStatusColor(status)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 6px 1px ${color}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#666666' }}>{label}: </span>
        <span style={{ color }}>{text}</span>
      </span>
    </div>
  )
}

export function StatusBar() {
  const { hardware } = useHardware()
  const { wsStatus, motorStatus, cameraStatus } = hardware

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '48px',
        paddingLeft: '16px',
        paddingRight: '16px',
        borderBottom: '1px solid #2a2a2a',
        backgroundColor: '#141414',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Left: wordmark + subtitle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1px',
        }}
      >
        <span
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '22px',
            fontWeight: 700,
            color: '#00c853',
            lineHeight: 1,
          }}
        >
          RemoteLab
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#666666',
            lineHeight: 1,
          }}
        >
          FUTMinna Remote Laboratory
        </span>
      </div>

      {/* Right: status indicators + mock badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <StatusIndicator label="WebSocket" status={wsStatus} text={wsStatus} />
        <StatusIndicator label="Motor" status={motorStatus} text={motorStatus} />
        <StatusIndicator label="Camera" status={cameraStatus} text={cameraStatus} />

        {MOCK_MODE && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#ffab0022',
              border: '1px solid #ffab00',
              color: '#ffab00',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              userSelect: 'none',
            }}
          >
            MOCK MODE
          </div>
        )}
      </div>
    </div>
  )
}
