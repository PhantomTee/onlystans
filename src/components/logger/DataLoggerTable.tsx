import { useHardware } from '../../context/HardwareContext'
import type { DataLogEntry } from '../../context/types'

const COLUMNS: { key: keyof DataLogEntry; label: string }[] = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'targetRPM', label: 'Target RPM' },
  { key: 'actualRPM', label: 'Actual RPM' },
  { key: 'pwmValue', label: 'PWM' },
  { key: 'error', label: 'Error' },
  { key: 'mode', label: 'Mode' },
]

function formatCell(key: keyof DataLogEntry, value: string | number): string {
  if (key === 'timestamp' && typeof value === 'string') {
    // Show HH:MM:SS.mmm
    try {
      const d = new Date(value)
      return d.toISOString().slice(11, 23)
    } catch {
      return value
    }
  }
  if (typeof value === 'number') {
    if (key === 'error') return value.toFixed(2)
    return String(value)
  }
  return String(value)
}

export default function DataLoggerTable() {
  const { dataLog } = useHardware()

  if (dataLog.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          height: '100%',
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#444444',
            textAlign: 'center',
          }}
        >
          No data recorded. Start the motor to begin logging.
        </span>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontSize: '11px',
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '6px 8px',
                  textAlign: 'left',
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                  background: '#1a1a1a',
                  borderBottom: '1px solid #2a2a2a',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataLog.map((entry, i) => (
            <tr
              key={`${entry.timestamp}-${i}`}
              style={{ background: i % 2 === 0 ? '#141414' : '#0d0d0d' }}
            >
              {COLUMNS.map(col => (
                <td
                  key={col.key}
                  style={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '12px',
                    color: '#f0f0f0',
                    padding: '5px 8px',
                    borderBottom: '1px solid #1a1a1a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formatCell(col.key, entry[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
