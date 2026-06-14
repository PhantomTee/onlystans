import React from 'react'
import { useHardware } from '../../context/HardwareContext'
import { createSetDirection } from '../../utils/websocket-messages'
import type { MotorDirection } from '../../context/types'

export default function DirectionToggle() {
  const { hardware, sendCommand } = useHardware()
  const { direction } = hardware

  const handleDirection = (dir: MotorDirection) => {
    sendCommand(createSetDirection(dir))
  }

  const activeStyle: React.CSSProperties = {
    background: '#00c85322',
    border: '1px solid #00c853',
    color: '#00c853',
  }

  const inactiveStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#666666',
  }

  const baseStyle: React.CSSProperties = {
    width: '50%',
    padding: '8px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ display: 'flex', gap: '0' }}>
      <button
        onClick={() => handleDirection('FORWARD')}
        style={{
          ...baseStyle,
          ...(direction === 'FORWARD' ? activeStyle : inactiveStyle),
          borderRadius: '4px 0 0 4px',
          borderRight: direction === 'FORWARD' ? '1px solid #00c853' : '1px solid #2a2a2a',
        }}
      >
        ▶ FORWARD
      </button>
      <button
        onClick={() => handleDirection('BACKWARD')}
        style={{
          ...baseStyle,
          ...(direction === 'BACKWARD' ? activeStyle : inactiveStyle),
          borderRadius: '0 4px 4px 0',
          borderLeft: 'none',
        }}
      >
        BACKWARD ◀
      </button>
    </div>
  )
}
