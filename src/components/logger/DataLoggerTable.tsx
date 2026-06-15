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
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--rl-muted)',
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
          <tr style={{ background: 'var(--rl-raised)', borderBottom: '1px solid var(--rl-border)' }}>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '11px',
                  color: 'var(--rl-label)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '6px 12px',
                  textAlign: 'left',
                  fontWeight: 600,
                  position: 'sticky',
                  top: 0,
                  background: 'var(--rl-raised)',
                  borderBottom: '1px solid var(--rl-border)',
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
              style={{ background: i % 2 === 0 ? 'var(--rl-row-odd)' : 'var(--rl-row-even)' }}
            >
              {COLUMNS.map(col => (
                <td
                  key={col.key}
                  style={{
                    fontFamily: '"Share Tech Mono", monospace',
                    fontSize: '12px',
                    color: 'var(--rl-text)',
                    padding: '6px 12px',
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
