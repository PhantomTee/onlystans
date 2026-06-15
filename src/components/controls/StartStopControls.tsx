import { useHardware } from '../../context/HardwareContext'
import {
  createStart,
  createStop,
  createEmergencyStop,
} from '../../utils/websocket-messages'

export default function StartStopControls() {
  const { hardware, sendCommand } = useHardware()
  const { motorStatus } = hardware

  const isRunning = motorStatus === 'RUNNING'
  const isStopped = motorStatus === 'STOPPED'

  const handleStart = () => {
    sendCommand(createStart())
  }

  const handleStop = () => {
    sendCommand(createStop())
  }

  const handleEmergencyStop = () => {
    sendCommand(createEmergencyStop())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* START */}
      <button
        onClick={handleStart}
        disabled={isRunning}
        style={{
          width: '100%',
          background: 'var(--rl-green)',
          color: '#000',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          padding: '10px',
          borderRadius: '6px',
          border: 'none',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          opacity: isRunning ? 0.4 : 1,
          transition: 'opacity 0.2s',
          letterSpacing: '0.05em',
        }}
      >
        START
      </button>

      {/* STOP */}
      <button
        onClick={handleStop}
        disabled={isStopped}
        style={{
          width: '100%',
          background: 'var(--rl-primary-muted)',
          border: '1px solid var(--rl-red)',
          color: 'var(--rl-red)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          padding: '10px',
          borderRadius: '6px',
          cursor: isStopped ? 'not-allowed' : 'pointer',
          opacity: isStopped ? 0.4 : 1,
          transition: 'opacity 0.2s',
          letterSpacing: '0.05em',
        }}
      >
        STOP
      </button>

      {/* EMERGENCY STOP — never disabled */}
      <button
        onClick={handleEmergencyStop}
        style={{
          width: '100%',
          background: 'transparent',
          border: '2px solid var(--rl-red)',
          color: 'var(--rl-red)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          padding: '10px',
          borderRadius: '6px',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          transition: 'background 0.15s',
        }}
      >
        EMERGENCY STOP
      </button>
    </div>
  )
}
