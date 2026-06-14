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
  const [timeWindow, setTimeWindow] = useState(60)

  const rpmData = graphState.rpm
  const isEmpty = rpmData.length === 0

  // Filter to only points within timeWindow seconds of the latest point
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
        borderColor: '#00c853',
        backgroundColor: 'transparent',
        tension: 0.3,
        pointRadius: 0,
        borderWidth: 1.5,
      },
      {
        label: 'Target RPM',
        data: targetData,
        borderColor: '#ffab00',
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
          color: '#666666',
          font: { family: '"Share Tech Mono", monospace', size: 10 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        grid: { color: '#2a2a2a' },
        border: { color: '#2a2a2a' },
      },
      y: {
        min: 0,
        max: 3200,
        ticks: {
          color: '#666666',
          font: { family: '"Share Tech Mono", monospace', size: 10 },
        },
        grid: { color: '#2a2a2a' },
        border: { color: '#2a2a2a' },
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
      <div style={{ position: 'relative', height: '120px' }}>
        {isEmpty ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444444',
              fontFamily: 'Inter, sans-serif',
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
