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
      className={clsx('rounded-lg flex flex-col overflow-hidden', className)}
      style={{
        backgroundColor: 'var(--rl-surface)',
        border: '1px solid var(--rl-border)',
        transition: 'background-color 0.2s, border-color 0.2s',
        ...style,
      }}
    >
      {title && (
        <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--rl-border)', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--rl-label)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {title}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}
