import { HardwareProvider } from './context/HardwareContext'
import { StatusBar } from './components/layout/StatusBar'
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

function Dashboard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0d0d0d',
      }}
    >
      <StatusBar />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr 260px',
          gap: '8px',
          padding: '8px',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* LEFT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0 }}>
          <PanelWrapper title="Motor Model">
            <MotorModel3D />
            <div style={{ padding: '8px 12px', borderTop: '1px solid #2a2a2a' }}>
              <MotorStatus />
            </div>
          </PanelWrapper>

          <PanelWrapper title="Camera Feed" style={{ flex: 1 }}>
            <CameraFeed />
          </PanelWrapper>
        </div>

        {/* CENTRE PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, overflow: 'hidden' }}>
          <PanelWrapper>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div style={{ borderRight: '1px solid #2a2a2a' }}>
                <RPMDisplay />
              </div>
              <div style={{ borderRight: '1px solid #2a2a2a' }}>
                <PWMDisplay />
              </div>
              <div>
                <ErrorDisplay />
              </div>
            </div>
          </PanelWrapper>

          <PanelWrapper title="Live Graphs" style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflow: 'hidden' }}>
              <RPMGraph />
              <PWMGraph />
              <ErrorGraph />
            </div>
          </PanelWrapper>

          <PanelWrapper title="Data Logger" style={{ maxHeight: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px', borderBottom: '1px solid #2a2a2a' }}>
              <ExportButton />
            </div>
            <div style={{ maxHeight: '120px', overflow: 'auto' }}>
              <DataLoggerTable />
            </div>
          </PanelWrapper>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: 0, overflowY: 'auto' }}>
          <PanelWrapper title="Controls">
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <SectionLabel>Motor</SectionLabel>
                <StartStopControls />
              </div>

              <div>
                <SectionLabel>Direction</SectionLabel>
                <DirectionToggle />
              </div>

              <div>
                <SectionLabel>Experiment Mode</SectionLabel>
                <ModeSelector />
              </div>

              <div>
                <RPMSlider />
                <PWMSlider />
              </div>
            </div>
          </PanelWrapper>

          <PanelWrapper title="PID Tuning">
            <div style={{ padding: '12px' }}>
              <PIDControls />
            </div>
          </PanelWrapper>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HardwareProvider>
      <Dashboard />
    </HardwareProvider>
  )
}
