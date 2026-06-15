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
    background: 'var(--rl-primary-muted)',
    border: '1px solid var(--rl-primary)',
    color: 'var(--rl-primary)',
  }

  const inactiveStyle: React.CSSProperties = {
    background: 'var(--rl-raised)',
    border: '1px solid var(--rl-border)',
    color: 'var(--rl-label)',
  }

  const baseStyle: React.CSSProperties = {
    width: '50%',
    padding: '8px',
    fontFamily: "'DM Sans', sans-serif",
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
          borderRight: direction === 'FORWARD' ? '1px solid var(--rl-primary)' : '1px solid var(--rl-border)',
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
        ◀ BACKWARD
      </button>
    </div>
  )
}
