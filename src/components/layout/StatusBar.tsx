import { useHardware } from '../../context/HardwareContext'
import { useTheme } from '../../context/ThemeContext'
import { useActivity } from '../../context/ActivityContext'
import { MOCK_MODE } from '../../config'
import type { ConnectionStatus, MotorStatus } from '../../context/types'

function getStatusColor(status: ConnectionStatus | MotorStatus): string {
  switch (status) {
    case 'CONNECTED':
    case 'RUNNING':
      return 'var(--rl-green)'
    case 'RECONNECTING':
      return 'var(--rl-amber)'
    case 'DISCONNECTED':
    case 'STOPPED':
    case 'ERROR':
    default:
      return 'var(--rl-red)'
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
          fontSize: '11px',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        <span style={{ color: 'var(--rl-label)' }}>{label}: </span>
        <span style={{ color, fontWeight: 500 }}>{text}</span>
      </span>
    </div>
  )
}

export function StatusBar() {
  const { hardware } = useHardware()
  const { wsStatus, motorStatus, cameraStatus } = hardware
  const { isDark, toggleTheme } = useTheme()
  const { mode, startGuidedMode, exitGuidedMode } = useActivity()

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
        backgroundColor: 'var(--rl-surface)',
        borderBottom: '1px solid var(--rl-border)',
        boxSizing: 'border-box',
        flexShrink: 0,
        transition: 'background-color 0.2s',
      }}
    >
      {/* Left: logo badge + wordmark + subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <path d="M13 3L4 14h7l-2 9 11-13h-7l2-7z" fill="white" />
          </svg>
        </div>

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
              color: 'var(--rl-text)',
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
              color: 'var(--rl-muted)',
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

      {/* Right: mock pill + IoT Lab badge + theme toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {MOCK_MODE && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--rl-primary-muted)',
              border: '1px solid var(--rl-primary)',
              color: 'var(--rl-primary)',
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

        {/* Guided lab toggle */}
        <button
          onClick={mode === 'guided' ? exitGuidedMode : startGuidedMode}
          style={{
            background: mode === 'guided' ? 'var(--rl-primary)' : 'var(--rl-raised)',
            border: `1px solid ${mode === 'guided' ? 'var(--rl-primary)' : 'var(--rl-border)'}`,
            color: mode === 'guided' ? '#fff' : 'var(--rl-muted)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontFamily: '"DM Sans", Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s',
          }}
        >
          {mode === 'guided' ? '✕ Exit Lab' : '⚗ Start Lab'}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--rl-raised)',
            border: '1px solid var(--rl-border)',
            color: 'var(--rl-muted)',
            borderRadius: '9999px',
            padding: '4px 12px',
            fontFamily: '"DM Sans", Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {isDark ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </div>
  )
}
