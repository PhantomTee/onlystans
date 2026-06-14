import { useHardware } from '../../context/HardwareContext'
import { createSetMode } from '../../utils/websocket-messages'
import type { ExperimentMode } from '../../context/types'

interface ModeOption {
  label: string
  mode: ExperimentMode
  controlMode: string
}

const MODE_OPTIONS: ModeOption[] = [
  { label: 'Open Loop', mode: 'OPEN_LOOP', controlMode: 'OPEN_LOOP' },
  { label: 'Closed Loop PID', mode: 'CLOSED_LOOP_PID', controlMode: 'CLOSED_LOOP' },
  { label: 'Step Response', mode: 'STEP_RESPONSE', controlMode: 'CLOSED_LOOP' },
  { label: 'Speed Regulation', mode: 'SPEED_REGULATION', controlMode: 'CLOSED_LOOP' },
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
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                padding: '6px 4px',
                borderRadius: '4px',
                cursor: isDisconnected ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                border: isActive ? '1px solid #00c853' : '1px solid #2a2a2a',
                background: isActive ? '#00c85322' : '#1a1a1a',
                color: isActive ? '#00c853' : '#888888',
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
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#ffab00',
            textAlign: 'center',
          }}
        >
          Not connected
        </p>
      )}
    </div>
  )
}
