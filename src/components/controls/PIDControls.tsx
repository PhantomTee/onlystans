import React, { useState, useEffect } from 'react'
import { useHardware } from '../../context/HardwareContext'
import { createSetPID } from '../../utils/websocket-messages'

export default function PIDControls() {
  const { hardware, sendCommand } = useHardware()
  const { experimentMode, pidParams } = hardware

  const [kp, setKp] = useState<number>(pidParams.kp)
  const [ki, setKi] = useState<number>(pidParams.ki)
  const [kd, setKd] = useState<number>(pidParams.kd)
  const [applied, setApplied] = useState(false)

  // Sync when pidParams change externally
  useEffect(() => {
    setKp(pidParams.kp)
    setKi(pidParams.ki)
    setKd(pidParams.kd)
  }, [pidParams.kp, pidParams.ki, pidParams.kd])

  // Only renders when NOT in OPEN_LOOP mode
  if (experimentMode === 'OPEN_LOOP') return null

  const handleApply = () => {
    sendCommand(createSetPID(kp, ki, kd))
    setApplied(true)
    setTimeout(() => setApplied(false), 1500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#f0f0f0',
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: '13px',
    padding: '6px 8px',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Rajdhani, sans-serif',
    fontSize: '11px',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '3px',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <label style={labelStyle}>Kp — Proportional</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={kp}
          onChange={e => setKp(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Ki — Integral</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={ki}
          onChange={e => setKi(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Kd — Derivative</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={kd}
          onChange={e => setKd(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <button
        onClick={handleApply}
        style={{
          width: '100%',
          background: applied ? '#00a846' : '#00c853',
          color: '#000',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          letterSpacing: '0.04em',
        }}
      >
        {applied ? '✓ Applied' : 'Apply PID'}
      </button>
    </div>
  )
}
