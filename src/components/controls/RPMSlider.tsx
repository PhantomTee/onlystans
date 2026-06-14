import React, { useState, useEffect } from 'react'
import { useHardware } from '../../context/HardwareContext'
import { createSetTargetRPM } from '../../utils/websocket-messages'

export default function RPMSlider() {
  const { hardware, sendCommand } = useHardware()
  const { experimentMode, targetRPM } = hardware

  const [localValue, setLocalValue] = useState<number>(targetRPM)

  // Sync local value when targetRPM changes externally
  useEffect(() => {
    setLocalValue(targetRPM)
  }, [targetRPM])

  // Only render when NOT in OPEN_LOOP mode
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
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '11px',
            color: '#888888',
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
            color: '#ffab00',
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
          accentColor: '#ffab00',
          cursor: 'pointer',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: '#444444' }}>0</span>
        <span style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '10px', color: '#444444' }}>3000</span>
      </div>
    </div>
  )
}
