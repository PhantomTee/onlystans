import type { DataLogEntry } from '../context/types'

export function exportToCSV(entries: DataLogEntry[]): void {
  const headers = ['Timestamp', 'Target RPM', 'Actual RPM', 'PWM Value', 'Error', 'Mode']
  const rows = entries.map(e => [
    e.timestamp,
    e.targetRPM,
    e.actualRPM,
    e.pwmValue,
    e.error,
    e.mode
  ])
  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `remotelab-session-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
