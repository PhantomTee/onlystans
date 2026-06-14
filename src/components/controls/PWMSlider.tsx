import React, { useState, useEffect } from 'react'
import { useHardware } from '../../context/HardwareContext'
import { createSetPWM } from '../../utils/websocket-messages'

export default function PWMSlider() {
  const { hardware, sendCommand } = useHardware()
  const { experimentMode, currentPWM } = hardware

  const [localValue, setLocalValue] = useState<number>(currentPWM)

  // Sync local value when currentPWM changes externally
  useEffect(() => {
    setLocalValue(currentPWM)
  }, [currentPWM])

  // Only renders when in OPEN_LOOP mode
  if (experimentMode !== 'OPEN_LOOP') return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(Number(e.target.value))
  }

  const handleCommit = () => {
    sendCommand(createSetPWM(localValue))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '11px',
            color: '#888888',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          PWM DIRECT
        </span>
        <span
          style={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '16px',
            color: '#ffab00',
          }}
        >
          {localValue}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={255}
        step={1}
        value={localValue}
        onChange={handleChange}
        onMouseUp={handleCommit}
        onTouchEnd={handleCommit}
        style={{
          width: '100%',
          accentColor: '#ffab00',
          cursor: 'pointer',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: '#444444' }}>0</span>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: '#444444' }}>255</span>
      </div>
    </div>
  )
}
