import { useHardware } from '../../context/HardwareContext'
import { createSetMode } from '../../utils/websocket-messages'
import type { ExperimentMode } from '../../context/types'

interface ModeOption {
  label: string
  mode: ExperimentMode
}

const MODE_OPTIONS: ModeOption[] = [
  { label: 'Open Loop', mode: 'OPEN_LOOP' },
  { label: 'Closed Loop PID', mode: 'CLOSED_LOOP_PID' },
  { label: 'Step Response', mode: 'STEP_RESPONSE' },
  { label: 'Speed Regulation', mode: 'SPEED_REGULATION' },
]

export default function ModeSelector() {
  const { hardware, sendCommand } = useHardware()
  const { experimentMode, wsStatus } = hardware

  const isDisconnected = wsStatus === 'DISCONNECTED'

  const handleModeSelect = (mode: ExperimentMode) => {
    if (isDisconnected) return
    sendCommand(createSetMode(mode))
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
        }}
      >
        {MODE_OPTIONS.map(({ label, mode }) => {
          const isActive = experimentMode === mode
          return (
            <button
              key={mode}
              onClick={() => handleModeSelect(mode)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                padding: '6px 4px',
                borderRadius: '4px',
                cursor: isDisconnected ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                border: isActive ? '1px solid var(--rl-primary)' : '1px solid var(--rl-border)',
                background: isActive ? 'var(--rl-primary-muted)' : 'var(--rl-raised)',
                color: isActive ? 'var(--rl-primary)' : 'var(--rl-label)',
                letterSpacing: '0.02em',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {isDisconnected && (
        <p
          style={{
            marginTop: '6px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--rl-amber)',
            textAlign: 'center',
          }}
        >
          ⚠ Not connected
        </p>
      )}
    </div>
  )
}
