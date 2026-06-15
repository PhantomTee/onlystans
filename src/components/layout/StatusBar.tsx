import { useHardware } from '../../context/HardwareContext'
import { MOCK_MODE } from '../../config'
import type { ConnectionStatus, MotorStatus } from '../../context/types'

function getStatusColor(status: ConnectionStatus | MotorStatus): string {
  switch (status) {
    case 'CONNECTED':
    case 'RUNNING':
      return '#22c55e'
    case 'RECONNECTING':
      return '#f59e0b'
    case 'DISCONNECTED':
    case 'STOPPED':
    case 'ERROR':
    default:
      return '#ef4444'
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
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 5px 1px ${color}`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: '"DM Sans", Inter, sans-serif',
          fontSize: '12px',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#7B7096' }}>{label}: </span>
        <span style={{ color, fontWeight: 500 }}>{text}</span>
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
        height: '52px',
        paddingLeft: '16px',
        paddingRight: '16px',
        backgroundColor: '#f8f5fe',
        borderBottom: '1px solid #e5dff5',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Left: logo badge + wordmark + subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Hexagon-style badge */}
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#6D28D9',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="10"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2L4.5 13.5H11L9 22L19.5 10.5H13L13 2"
              fill="white"
            />
          </svg>
        </div>

        {/* Text stack */}
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
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1233',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            RemoteLab
          </span>
          <span
            style={{
              fontFamily: '"DM Sans", Inter, sans-serif',
              fontSize: '10px',
              color: '#7B7096',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            FUTMinna Remote Laboratory
          </span>
        </div>
      </div>

      {/* Center: three status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <StatusIndicator label="WebSocket" status={wsStatus} text={wsStatus} />
        <StatusIndicator label="Motor" status={motorStatus} text={motorStatus} />
        <StatusIndicator label="Camera" status={cameraStatus} text={cameraStatus} />
      </div>

      {/* Right: mock pill + separator + IoT Lab badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {MOCK_MODE && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 10px',
              borderRadius: '9999px',
              backgroundColor: '#ede8f9',
              border: '1px solid #6D28D9',
              color: '#6D28D9',
              fontFamily: '"DM Sans", Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              userSelect: 'none',
              letterSpacing: '0.04em',
            }}
          >
            MOCK MODE
          </div>
        )}

        {/* Separator */}
        <div
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: '#e5dff5',
            flexShrink: 0,
          }}
        />

        {/* IoT Lab badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            backgroundColor: '#6D28D9',
            color: '#ffffff',
            fontFamily: '"DM Sans", Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            userSelect: 'none',
            letterSpacing: '0.03em',
          }}
        >
          IoT Lab
        </div>
      </div>
    </div>
  )
}
