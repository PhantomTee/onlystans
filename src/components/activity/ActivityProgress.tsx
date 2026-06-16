import { useActivity } from '../../context/ActivityContext'

export function ActivityProgress() {
  const { currentActivity, completed, goToActivity } = useActivity()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      padding: '6px 16px',
      background: 'var(--rl-surface)',
      borderBottom: '1px solid var(--rl-border)',
      flexShrink: 0,
    }}>
      {Array.from({ length: 8 }, (_, i) => {
        const n = i + 1
        const isDone = completed.includes(n)
        const isCurrent = currentActivity === n
        const isLocked = !isDone && !isCurrent && n > (Math.max(...completed, 0) + 1)

        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Connector line (not before first) */}
            {n > 1 && (
              <div style={{
                width: 20,
                height: 2,
                background: completed.includes(n - 1) ? 'var(--rl-primary)' : 'var(--rl-border)',
                transition: 'background 0.3s',
              }} />
            )}

            {/* Step circle */}
            <button
              onClick={() => !isLocked && goToActivity(n)}
              title={`Experiment ${n}`}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: isCurrent
                  ? '2px solid var(--rl-primary)'
                  : isDone
                    ? '2px solid var(--rl-green)'
                    : '2px solid var(--rl-border)',
                background: isCurrent
                  ? 'var(--rl-primary)'
                  : isDone
                    ? 'var(--rl-green)'
                    : 'var(--rl-raised)',
                color: (isCurrent || isDone) ? '#fff' : 'var(--rl-muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
                padding: 0,
                lineHeight: 1,
              }}
            >
              {isDone ? '✓' : n}
            </button>
          </div>
        )
      })}

      {/* Label */}
      <span style={{
        marginLeft: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: 'var(--rl-label)',
      }}>
        Experiment {currentActivity} of 8
      </span>
    </div>
  )
}
