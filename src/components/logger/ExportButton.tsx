import { useState } from 'react'
import { useHardware } from '../../context/HardwareContext'
import { exportToCSV } from '../../utils/csv-export'

export default function ExportButton() {
  const { dataLog } = useHardware()
  const [hovered, setHovered] = useState(false)
  const isEmpty = dataLog.length === 0

  const handleClick = () => {
    if (isEmpty) return
    exportToCSV(dataLog)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isEmpty}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1a1a1a',
        border: `1px solid ${hovered && !isEmpty ? '#00c853' : '#2a2a2a'}`,
        color: hovered && !isEmpty ? '#00c853' : '#888888',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        padding: '6px 14px',
        borderRadius: '4px',
        cursor: isEmpty ? 'not-allowed' : 'pointer',
        opacity: isEmpty ? 0.4 : 1,
        transition: 'border-color 0.15s, color 0.15s',
        letterSpacing: '0.02em',
      }}
    >
      Export CSV
    </button>
  )
}
