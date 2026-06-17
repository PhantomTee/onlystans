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

  useEffect(() => {
    setKp(pidParams.kp)
    setKi(pidParams.ki)
    setKd(pidParams.kd)
  }, [pidParams.kp, pidParams.ki, pidParams.kd])

  const isOpenLoop = experimentMode === 'OPEN_LOOP'

  const handleApply = () => {
    if (isOpenLoop) return
    sendCommand(createSetPID(kp, ki, kd))
    setApplied(true)
    setTimeout(() => setApplied(false), 1500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--rl-input-bg)',
    border: '1px solid var(--rl-border)',
    color: 'var(--rl-text)',
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: '13px',
    padding: '6px 8px',
    borderRadius: '4px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--rl-label)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '3px',
    display: 'block',
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--rl-primary)'
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--rl-border)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: isOpenLoop ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <div>
        <label style={labelStyle}>Kp — Proportional</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={kp}
          disabled={isOpenLoop}
          onChange={e => setKp(Number(e.target.value))}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, cursor: isOpenLoop ? 'not-allowed' : 'text' }}
        />
      </div>

      <div>
        <label style={labelStyle}>Ki — Integral</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={ki}
          disabled={isOpenLoop}
          onChange={e => setKi(Number(e.target.value))}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, cursor: isOpenLoop ? 'not-allowed' : 'text' }}
        />
      </div>

      <div>
        <label style={labelStyle}>Kd — Derivative</label>
        <input
          type="number"
          step={0.01}
          min={0}
          value={kd}
          disabled={isOpenLoop}
          onChange={e => setKd(Number(e.target.value))}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, cursor: isOpenLoop ? 'not-allowed' : 'text' }}
        />
      </div>

      <button
        onClick={handleApply}
        disabled={isOpenLoop}
        style={{
          width: '100%',
          background: 'var(--rl-primary)',
          color: 'var(--rl-primary-fg)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 600,
          padding: '8px',
          borderRadius: '6px',
          border: 'none',
          cursor: isOpenLoop ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.2s',
          letterSpacing: '0.04em',
        }}
      >
        {isOpenLoop ? 'PID not used in Open Loop' : applied ? '✓ Applied' : 'Apply PID'}
      </button>
    </div>
  )
}
