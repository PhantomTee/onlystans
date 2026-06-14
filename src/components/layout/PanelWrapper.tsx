import React from 'react'
import clsx from 'clsx'

interface PanelWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  style?: React.CSSProperties
}

export function PanelWrapper({ children, className, title, style }: PanelWrapperProps) {
  return (
    <div
      className={clsx('rounded-lg border flex flex-col overflow-hidden', className)}
      style={{ backgroundColor: '#141414', borderColor: '#2a2a2a', ...style }}
    >
      {title && (
        <div className="px-3 py-2 border-b" style={{ borderColor: '#2a2a2a' }}>
          <span
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#888888',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
