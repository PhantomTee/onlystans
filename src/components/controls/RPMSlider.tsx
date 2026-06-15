import React, { useState, useEffect } from 'react'
import { useHardware } from '../../context/HardwareContext'
import { createSetTargetRPM } from '../../utils/websocket-messages'

export default function RPMSlider() {
  const { hardware, sendCommand } = useHardware()
  const { experimentMode, targetRPM } = hardware

  const [localValue, setLocalValue] = useState<number>(targetRPM)

  useEffect(() => {
    setLocalValue(targetRPM)
  }, [targetRPM])

  if (experimentMode === 'OPEN_LOOP') return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(Number(e.target.value))
  }

  const handleCommit = () => {
    sendCommand(createSetTargetRPM(localValue))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--rl-label)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          TARGET RPM
        </span>
        <span
          style={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '16px',
            color: 'var(--rl-primary)',
          }}
        >
          {localValue}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={3000}
        step={50}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit}
        style={{
          width: '100%',
          accentColor: 'var(--rl-primary)',
          cursor: 'pointer',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: 'var(--rl-muted)' }}>0</span>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: 'var(--rl-muted)' }}>3000</span>
      </div>
    </div>
  )
}
