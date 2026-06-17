import { useActivity } from '../../context/ActivityContext'
import { ActivityProgress } from './ActivityProgress'
import { ActivityPanel } from './ActivityPanel'

export function LabDrawer() {
  const { mode, exitGuidedMode } = useActivity()
  const open = mode === 'guided'

  return (
    <>
      {/* Backdrop — click outside the panel to close */}
      <div
        onClick={exitGuidedMode}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          zIndex: 40,
        }}
      />

      {/* Sliding side panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(420px, 92vw)',
          background: 'var(--rl-surface)',
          borderLeft: '1px solid var(--rl-border)',
          boxShadow: open ? '-12px 0 32px rgba(0,0,0,0.3)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s ease, box-shadow 0.28s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <ActivityProgress />
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          <ActivityPanel />
        </div>
      </div>
    </>
  )
}
