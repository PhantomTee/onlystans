import { useState } from 'react'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { useHardware } from '../../context/HardwareContext'
import { useTheme } from '../../context/ThemeContext'
import { SectionLabel } from '../layout/SectionLabel'
import { TimeWindowSelector } from './TimeWindowSelector'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function RPMGraph() {
  const { graphState, hardware } = useHardware()
  const { chart } = useTheme()
  const [timeWindow, setTimeWindow] = useState(60)

  const rpmData = graphState.rpm
  const isEmpty = rpmData.length === 0

  const latestTime = rpmData.length > 0 ? rpmData[rpmData.length - 1].time : 0
  const cutoff = latestTime - timeWindow * 1000
  const filtered = rpmData.filter(p => p.time >= cutoff)

  const targetRPMValue = hardware.targetRPM

  const labels = filtered.map((p, i) => {
    if (i === 0) return '0s'
    const elapsed = ((p.time - filtered[0].time) / 1000).toFixed(0)
    return `${elapsed}s`
  })

  const actualData = filtered.map(p => p.value)
  const targetData = filtered.map(() => targetRPMValue)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Actual RPM',
        data: actualData,
        borderColor: chart.rpm,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
      },
      {
        label: 'Target RPM',
        data: targetData,
        borderColor: chart.rpmTarget,
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0,
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    animation: false as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        ticks: {
          color: chart.tick,
          font: { family: '"Share Tech Mono", monospace', size: 10 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        grid: { color: chart.grid },
        border: { color: chart.grid },
      },
      y: {
        min: 0,
        max: 130,
        ticks: {
          color: chart.tick,
          font: { family: '"Share Tech Mono", monospace', size: 10 },
        },
        grid: { color: chart.grid },
        border: { color: chart.grid },
      },
    },
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <SectionLabel>RPM</SectionLabel>
        <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
      </div>
      <div style={{ position: 'relative', height: '110px' }}>
        {isEmpty ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'var(--rl-muted)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
            }}
          >
            Start motor to begin recording
          </div>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  )
}
