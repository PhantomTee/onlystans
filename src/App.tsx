import { useRef, useState, useCallback } from 'react'
import { HardwareProvider } from './context/HardwareContext'
import { ThemeProvider } from './context/ThemeContext'
import { ActivityProvider } from './context/ActivityContext'
import { useActivity } from './context/ActivityContext'
import { StatusBar } from './components/layout/StatusBar'
import { ActivityProgress } from './components/activity/ActivityProgress'
import { ActivityPanel } from './components/activity/ActivityPanel'
import { PanelWrapper } from './components/layout/PanelWrapper'
import { SectionLabel } from './components/layout/SectionLabel'
import MotorModel3D from './components/motor/MotorModel3D'
import MotorStatus from './components/motor/MotorStatus'
import CameraFeed from './components/camera/CameraFeed'
import { RPMDisplay } from './components/displays/RPMDisplay'
import { PWMDisplay } from './components/displays/PWMDisplay'
import { ErrorDisplay } from './components/displays/ErrorDisplay'
import { RPMGraph } from './components/graphs/RPMGraph'
import { PWMGraph } from './components/graphs/PWMGraph'
import { ErrorGraph } from './components/graphs/ErrorGraph'
import StartStopControls from './components/controls/StartStopControls'
import DirectionToggle from './components/controls/DirectionToggle'
import ModeSelector from './components/controls/ModeSelector'
import RPMSlider from './components/controls/RPMSlider'
import PWMSlider from './components/controls/PWMSlider'
import PIDControls from './components/controls/PIDControls'
import DataLoggerTable from './components/logger/DataLoggerTable'
import ExportButton from './components/logger/ExportButton'
import type { ShaftAttachment } from './components/motor/MotorModel3D'

// ── Resizable three-column layout ─────────────────────────────────────────────
function ResizableLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}) {
  const [leftW, setLeftW] = useState(240)
  const [rightW, setRightW] = useState(268)
  const dragging = useRef<null | 'left' | 'right'>(null)
  const startX = useRef(0)
  const startW = useRef(0)

  const onMouseDown = useCallback((side: 'left' | 'right', e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = side
    startX.current = e.clientX
    startW.current = side === 'left' ? leftW : rightW

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX.current
      if (dragging.current === 'left') {
        setLeftW(Math.max(180, Math.min(420, startW.current + delta)))
      } else {
        setRightW(Math.max(180, Math.min(420, startW.current - delta)))
      }
    }
    const onUp = () => {
      dragging.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [leftW, rightW])

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
      {/* Left column */}
      <div style={{ width: leftW, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 0 8px 8px', gap: 8 }}>
        {left}
      </div>

      {/* Left drag handle */}
      <div
        className="drag-handle"
        onMouseDown={(e) => onMouseDown('left', e)}
        style={{ margin: '8px 0' }}
      />

      {/* Center column */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 320, display: 'flex', flexDirection: 'column', padding: '0 0 8px 8px', gap: 8 }}>
        {center}
      </div>

      {/* Right drag handle */}
      <div
        className="drag-handle"
        onMouseDown={(e) => onMouseDown('right', e)}
        style={{ margin: '8px 0' }}
      />

      {/* Right column */}
      <div style={{ width: rightW, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0 8px 8px 8px', gap: 8 }}>
        {right}
      </div>
    </div>
  )
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
function Dashboard() {
  const { mode, currentActivity } = useActivity()
  const [attachment, setAttachment] = useState<ShaftAttachment>('fan')

  const ATTACHMENTS: { id: ShaftAttachment; label: string }[] = [
    { id: 'fan',       label: 'Fan' },
    { id: 'propeller', label: 'Propeller' },
    { id: 'flywheel',  label: 'Flywheel' },
    { id: 'grinding',  label: 'Grinder' },
    { id: 'impeller',  label: 'Impeller' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--rl-bg)', transition: 'background-color 0.2s' }}>
      <StatusBar />
      {mode === 'guided' && <ActivityProgress />}

      <ResizableLayout
        left={
          <>
            {/* Controls */}
            <PanelWrapper title="Controls" style={{ flex: 1 }}>
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <SectionLabel>Motor</SectionLabel>
                  <StartStopControls />
                </div>
                <div>
                  <SectionLabel>Direction</SectionLabel>
                  <DirectionToggle />
                </div>
                <div>
                  <SectionLabel>Mode</SectionLabel>
                  <ModeSelector />
                </div>
                <div>
                  <RPMSlider />
                  <PWMSlider />
                </div>
              </div>
            </PanelWrapper>

            {/* Camera */}
            <PanelWrapper title="Camera Feed" style={{ flexShrink: 0 }}>
              <CameraFeed />
            </PanelWrapper>
          </>
        }
        center={
          <>
            {/* Motor model — centre stage */}
            <PanelWrapper>
              {/* Shaft attachment selector */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderBottom: '1px solid var(--rl-border)',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 600, color: 'var(--rl-label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>
                  Shaft
                </span>
                {ATTACHMENTS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setAttachment(id)}
                    style={{
                      fontFamily: "'DM Sans', Inter, sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 9999,
                      cursor: 'pointer',
                      border: attachment === id ? '1px solid var(--rl-primary)' : '1px solid var(--rl-border)',
                      background: attachment === id ? 'var(--rl-primary-muted)' : 'var(--rl-raised)',
                      color: attachment === id ? 'var(--rl-primary)' : 'var(--rl-label)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <MotorStatus />
                </div>
              </div>

              {/* 3D canvas */}
              <MotorModel3D attachment={attachment} />
            </PanelWrapper>

            {/* Live displays */}
            <PanelWrapper>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div style={{ borderRight: '1px solid var(--rl-border)' }}><RPMDisplay /></div>
                <div style={{ borderRight: '1px solid var(--rl-border)' }}><PWMDisplay /></div>
                <div><ErrorDisplay /></div>
              </div>
            </PanelWrapper>

            {/* Graphs */}
            <PanelWrapper title="Live Graphs" style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%', overflow: 'hidden' }}>
                <RPMGraph />
                <PWMGraph />
                <ErrorGraph />
              </div>
            </PanelWrapper>
          </>
        }
        right={
          mode === 'guided' ? (
            <>
              {/* Guided: activity panel fills the space */}
              <PanelWrapper style={{ flex: 1, overflow: 'hidden' }}>
                <ActivityPanel />
              </PanelWrapper>
              {/* PID always visible for activities 4+ */}
              {currentActivity >= 4 && (
                <PanelWrapper title="PID Tuning" style={{ flexShrink: 0 }}>
                  <div style={{ padding: 12 }}>
                    <PIDControls />
                  </div>
                </PanelWrapper>
              )}
            </>
          ) : (
            <>
              {/* Free mode: PID + data logger */}
              <PanelWrapper title="PID Tuning">
                <div style={{ padding: 12 }}>
                  <PIDControls />
                </div>
              </PanelWrapper>
              <PanelWrapper title="Data Logger" style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px', borderBottom: '1px solid var(--rl-border)' }}>
                  <ExportButton />
                </div>
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  <DataLoggerTable />
                </div>
              </PanelWrapper>
            </>
          )
        }
      />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HardwareProvider>
        <ActivityProvider>
          <Dashboard />
        </ActivityProvider>
      </HardwareProvider>
    </ThemeProvider>
  )
}
