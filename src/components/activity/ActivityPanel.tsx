import { useActivity } from '../../context/ActivityContext'
import type { FormField } from '../../context/ActivityContext'
import { useHardware } from '../../context/HardwareContext'
import { exportToCSV } from '../../utils/csv-export'

// ── Field renderers ───────────────────────────────────────────────────────────
function TextField({
  field, value, onChange,
}: {
  field: FormField; value: string; onChange: (v: string) => void
}) {
  const isFormula = field.type === 'formula'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{field.label}</label>
      {isFormula && field.formulaHint && (
        <span style={{ fontSize: 10, color: 'var(--rl-primary)', fontFamily: 'monospace', padding: '2px 6px', background: 'var(--rl-primary-muted)', borderRadius: 3 }}>
          {field.formulaHint}
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={inputStyle}
      />
    </div>
  )
}

function TextareaField({
  field, value, onChange,
}: {
  field: FormField; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{field.label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
      />
    </div>
  )
}

function TableField({
  field, answers, setAnswer,
}: {
  field: FormField; answers: Record<string, string>; setAnswer: (k: string, v: string) => void
}) {
  const rows = field.tableRows ?? []
  const cols = field.tableCols ?? []
  const dataCols = cols.slice(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{field.label}</label>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
          <thead>
            <tr>
              {cols.map((c, ci) => (
                <th key={ci} style={thStyle}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td style={tdLabelStyle}>{row}</td>
                {dataCols.map((_, ci) => {
                  const key = `${field.id}_${ri}_${ci + 1}`
                  return (
                    <td key={ci} style={tdStyle}>
                      <input
                        type="text"
                        value={answers[key] ?? ''}
                        onChange={e => setAnswer(key, e.target.value)}
                        style={cellInputStyle}
                        placeholder="—"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Activity 8: SR% verification ──────────────────────────────────────────────
function SRVerification({ answers }: { answers: Record<string, string> }) {
  const nl = parseFloat(answers['noload_rpm'] ?? '')
  const fl = parseFloat(answers['fullload_rpm'] ?? '')
  const stated = parseFloat(answers['sr_calculated'] ?? '')

  if (!nl || !fl || !stated || fl === 0) return null

  const computed = ((nl - fl) / fl) * 100
  const error = Math.abs(computed - stated)
  const correct = error < 0.5  // within 0.5%

  return (
    <div style={{
      padding: '8px 10px',
      borderRadius: 6,
      background: correct ? 'rgba(0,200,83,0.08)' : 'rgba(255,23,68,0.08)',
      border: `1px solid ${correct ? 'var(--rl-green)' : 'var(--rl-red)'}`,
      fontSize: 11,
      color: correct ? 'var(--rl-green)' : 'var(--rl-red)',
      marginTop: 4,
    }}>
      {correct
        ? `✓ Correct — computed SR% = ${computed.toFixed(2)}%`
        : `✗ Check your calculation — expected ≈ ${computed.toFixed(2)}%`}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function ActivityPanel() {
  const {
    currentActivity, activities, answers, exports,
    setAnswer, recordExport, completeActivity, completed, isActivityComplete,
    exitGuidedMode,
  } = useActivity()
  const { dataLog } = useHardware()

  const activity = activities[currentActivity - 1]
  if (!activity) return null

  const actAnswers = answers[currentActivity] ?? {}
  const exportsDone = exports[currentActivity] ?? 0
  const canComplete = isActivityComplete(currentActivity)
  const isDone = completed.includes(currentActivity)
  const isLast = currentActivity === 8

  const handleExport = () => {
    if (dataLog.length === 0) return
    exportToCSV(dataLog)
    recordExport(currentActivity)
  }

  const getFieldValue = (fieldId: string) => actAnswers[fieldId] ?? ''
  const handleFieldChange = (fieldId: string, value: string) =>
    setAnswer(currentActivity, fieldId, value)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px 8px',
        borderBottom: '1px solid var(--rl-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--rl-label)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
              Experiment {currentActivity} · {activity.hardware}
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 14, color: 'var(--rl-text)', lineHeight: 1.3 }}>
              {activity.title}
            </div>
          </div>
          <button
            onClick={exitGuidedMode}
            title="Exit guided mode"
            style={{ ...ghostBtn, flexShrink: 0, fontSize: 10, padding: '3px 7px' }}
          >
            ✕ Exit
          </button>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--rl-text-sub)', lineHeight: 1.4 }}>
          {activity.objective}
        </p>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Setup checklist */}
        <div>
          <SectionHead>Setup Required</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {activity.setup.map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--rl-text-sub)', display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--rl-primary)', flexShrink: 0 }}>→</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <SectionHead>Procedure</SectionHead>
          <ol style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activity.instructions.map((step, i) => (
              <li key={i} style={{ fontSize: 11, color: 'var(--rl-text-sub)', lineHeight: 1.4 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Form fields */}
        <div>
          <SectionHead>Record Your Observations</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activity.fields.map(field => {
              if (field.type === 'table') {
                return (
                  <TableField
                    key={field.id}
                    field={field}
                    answers={actAnswers}
                    setAnswer={(k, v) => setAnswer(currentActivity, k, v)}
                  />
                )
              }
              if (field.type === 'textarea') {
                return (
                  <TextareaField
                    key={field.id}
                    field={field}
                    value={getFieldValue(field.id)}
                    onChange={v => handleFieldChange(field.id, v)}
                  />
                )
              }
              return (
                <TextField
                  key={field.id}
                  field={field}
                  value={getFieldValue(field.id)}
                  onChange={v => handleFieldChange(field.id, v)}
                />
              )
            })}

            {/* Activity 8 formula verifier */}
            {currentActivity === 8 && <SRVerification answers={actAnswers} />}
          </div>
        </div>

        {/* Export button */}
        {activity.requiresExport && (
          <div>
            <SectionHead>
              Data Export
              {activity.exportCount > 1 && (
                <span style={{ color: 'var(--rl-muted)', fontWeight: 400, marginLeft: 6 }}>
                  ({exportsDone}/{activity.exportCount} exported)
                </span>
              )}
            </SectionHead>
            <button
              onClick={handleExport}
              disabled={dataLog.length === 0}
              style={{
                ...primaryBtn,
                opacity: dataLog.length === 0 ? 0.4 : 1,
                cursor: dataLog.length === 0 ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              ↓ {activity.exportLabel}
              {activity.exportCount > 1 && exportsDone < activity.exportCount
                ? ` (${activity.exportCount - exportsDone} more needed)`
                : ''}
            </button>
            {dataLog.length === 0 && (
              <p style={{ fontSize: 10, color: 'var(--rl-muted)', margin: '4px 0 0' }}>
                Run the motor first to generate data.
              </p>
            )}
          </div>
        )}

        {/* Complete / Next */}
        {!isDone ? (
          <button
            onClick={() => completeActivity(currentActivity)}
            disabled={!canComplete}
            style={{
              ...completeBtn,
              opacity: canComplete ? 1 : 0.35,
              cursor: canComplete ? 'pointer' : 'not-allowed',
            }}
          >
            {isLast ? '✓ Submit Lab' : `Complete & Next → Experiment ${currentActivity + 1}`}
          </button>
        ) : (
          <div style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: 'rgba(0,200,83,0.1)',
            border: '1px solid var(--rl-green)',
            fontSize: 11,
            color: 'var(--rl-green)',
            textAlign: 'center',
          }}>
            ✓ Experiment {currentActivity} Complete
            {!isLast && (
              <button
                onClick={() => completeActivity(currentActivity)}
                style={{ ...ghostBtn, marginLeft: 8, fontSize: 10 }}
              >
                Go to Experiment {currentActivity + 1} →
              </button>
            )}
          </div>
        )}

        {/* Completion hint */}
        {!canComplete && !isDone && (
          <p style={{ fontSize: 10, color: 'var(--rl-muted)', margin: 0, textAlign: 'center' }}>
            Fill all required fields
            {activity.exportCount > 0 && exportsDone < activity.exportCount
              ? ` and export data (${activity.exportCount - exportsDone} remaining)`
              : ''}{' '}
            to proceed.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      color: 'var(--rl-label)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: 6,
    }}>
      {children}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  color: 'var(--rl-text-sub)',
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--rl-input-bg)',
  border: '1px solid var(--rl-border)',
  borderRadius: 4,
  color: 'var(--rl-text)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  padding: '5px 8px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const cellInputStyle: React.CSSProperties = {
  background: 'var(--rl-input-bg)',
  border: 'none',
  borderRadius: 3,
  color: 'var(--rl-text)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  padding: '3px 6px',
  outline: 'none',
  width: '100%',
  textAlign: 'center',
}

const thStyle: React.CSSProperties = {
  padding: '4px 8px',
  background: 'var(--rl-raised)',
  color: 'var(--rl-label)',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: 600,
  fontSize: 10,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  border: '1px solid var(--rl-border)',
  textAlign: 'left',
}

const tdStyle: React.CSSProperties = {
  border: '1px solid var(--rl-border)',
  padding: '2px 4px',
}

const tdLabelStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--rl-text-sub)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  padding: '4px 8px',
  background: 'var(--rl-raised)',
  whiteSpace: 'nowrap',
}

const primaryBtn: React.CSSProperties = {
  background: 'var(--rl-primary-muted)',
  border: '1px solid var(--rl-primary)',
  color: 'var(--rl-primary)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  padding: '7px 12px',
  borderRadius: 5,
  cursor: 'pointer',
  textAlign: 'center',
}

const completeBtn: React.CSSProperties = {
  background: 'var(--rl-primary)',
  border: 'none',
  color: '#fff',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 12,
  fontWeight: 700,
  padding: '9px 14px',
  borderRadius: 6,
  cursor: 'pointer',
  width: '100%',
  textAlign: 'center',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--rl-border)',
  color: 'var(--rl-muted)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
}
