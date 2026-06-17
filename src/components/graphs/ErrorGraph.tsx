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

export function ErrorGraph() {
  const { graphState } = useHardware()
  const { chart } = useTheme()
  const [timeWindow, setTimeWindow] = useState(60)

  const errorData = graphState.error
  const isEmpty = errorData.length === 0

  const latestTime = errorData.length > 0 ? errorData[errorData.length - 1].time : 0
  const cutoff = latestTime - timeWindow * 1000
  const filtered = errorData.filter(p => p.time >= cutoff)

  const labels = filtered.map((p, i) => {
    if (i === 0) return '0s'
    const elapsed = ((p.time - filtered[0].time) / 1000).toFixed(0)
    return `${elapsed}s`
  })

  const errorValues = filtered.map(p => p.value)
  const zeroReference = filtered.map(() => 0)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'PID Error',
        data: errorValues,
        borderColor: chart.error,
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
      },
      {
        label: 'Zero Reference',
        data: zeroReference,
        borderColor: chart.zero,
        backgroundColor: 'transparent',
        borderDash: [2, 4],
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
        suggestedMin: -20,
        suggestedMax: 20,
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
        <SectionLabel>PID ERROR</SectionLabel>
        <TimeWindowSelector value={timeWindow} onChange={setTimeWindow} />
      </div>
      <div style={{ position: 'relative', height: '90px' }}>
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
