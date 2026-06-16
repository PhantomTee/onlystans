import type { DataLogEntry } from '../context/types'

export interface GradeCriterion {
  passed: boolean
  points: number
  max: number
  detail: string
}

export interface GradeResult {
  riseTime: number
  overshoot: number
  ssError: number
  settlingTime: number
  score: number
  criteria: {
    riseTime: GradeCriterion
    overshoot: GradeCriterion
    ssError: GradeCriterion
    settlingTime: GradeCriterion
  }
}

function fmt(n: number, unit: string): string {
  return Number.isFinite(n) ? `${n.toFixed(1)}${unit}` : `—${unit}`
}

export function gradeActivity8(data: DataLogEntry[], targetRPM = 1800): GradeResult {
  const zero: GradeResult = {
    riseTime: Infinity, overshoot: 0, ssError: 100, settlingTime: Infinity, score: 0,
    criteria: {
      riseTime:     { passed: false, points: 0, max: 25, detail: 'Insufficient data' },
      overshoot:    { passed: false, points: 0, max: 25, detail: 'Insufficient data' },
      ssError:      { passed: false, points: 0, max: 25, detail: 'Insufficient data' },
      settlingTime: { passed: false, points: 0, max: 25, detail: 'Insufficient data' },
    },
  }
  if (data.length < 5) return zero

  const t0 = new Date(data[0].timestamp).getTime()
  const relT = data.map(d => (new Date(d.timestamp).getTime() - t0) / 1000)
  const rpms = data.map(d => d.actualRPM)

  // Rise time
  const riseThreshold = targetRPM * 0.9
  const riseIdx = rpms.findIndex(r => r >= riseThreshold)
  const riseTime = riseIdx >= 0 ? relT[riseIdx] : Infinity

  // Overshoot
  const maxRPM = Math.max(...rpms)
  const overshoot = Math.max(0, ((maxRPM - targetRPM) / targetRPM) * 100)

  // Steady-state error (last 5 entries)
  const tail = rpms.slice(-5)
  const ssAvg = tail.reduce((a, b) => a + b, 0) / tail.length
  const ssError = Math.abs(ssAvg - targetRPM) / targetRPM * 100

  // Settling time: first index (after rise) where all remaining stay within ±5%
  const band = targetRPM * 0.05
  let settlingTime = Infinity
  const start = riseIdx >= 0 ? riseIdx : 0
  for (let i = start; i < rpms.length; i++) {
    if (rpms.slice(i).every(r => Math.abs(r - targetRPM) <= band)) {
      settlingTime = relT[i]
      break
    }
  }

  // Scoring
  const risePoints     = riseTime <= 5  ? 25 : riseTime <= 8   ? 12 : 0
  const overshootPts   = overshoot <= 10 ? 25 : overshoot <= 20 ? 12 : 0
  const ssPts          = ssError <= 2   ? 25 : ssError <= 5    ? 12 : 0
  const settlePts      = settlingTime <= 10 ? 25 : settlingTime <= 15 ? 12 : 0

  return {
    riseTime, overshoot, ssError, settlingTime,
    score: risePoints + overshootPts + ssPts + settlePts,
    criteria: {
      riseTime:     { passed: riseTime <= 5,     points: risePoints,   max: 25, detail: `${fmt(riseTime, 's')} (≤5s required)` },
      overshoot:    { passed: overshoot <= 10,   points: overshootPts, max: 25, detail: `${fmt(overshoot, '%')} (≤10% required)` },
      ssError:      { passed: ssError <= 2,      points: ssPts,        max: 25, detail: `${fmt(ssError, '%')} (≤2% required)` },
      settlingTime: { passed: settlingTime <= 10, points: settlePts,   max: 25, detail: `${fmt(settlingTime, 's')} (≤10s required)` },
    },
  }
}
