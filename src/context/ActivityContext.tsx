import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

// ── Form field types ──────────────────────────────────────────────────────────
export interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'table' | 'formula'
  tableRows?: string[]
  tableCols?: string[]
  placeholder?: string
  required: boolean
  formulaHint?: string   // shown below a formula field
}

export interface ActivityDef {
  id: number
  title: string
  hardware: string
  objective: string
  setup: string[]
  instructions: string[]
  fields: FormField[]
  requiresExport: boolean
  exportCount: number
  exportLabel: string
  isGraded?: boolean
}

// ── 8 Experiments ─────────────────────────────────────────────────────────────
export const ACTIVITIES: ActivityDef[] = [
  {
    id: 1,
    title: 'Open-Loop Speed Control',
    hardware: 'ESP32 · L298N · Motor · Encoder',
    objective: 'Manually set PWM duty cycle and observe resulting motor speed in RPM. Discover that the PWM–speed relationship is not perfectly linear and understand why open-loop control is unreliable.',
    setup: [
      'Mode → Open-Loop',
      'Direction → Forward',
      'Attachment → Fan',
    ],
    instructions: [
      'Set Mode to Open-Loop using the Mode selector in the Controls panel',
      'Set PWM to 25% using the PWM slider and press START',
      'Wait 5 seconds — record the steady-state RPM in the table below',
      'Repeat for PWM 50%, 75%, and 100%',
      'Note whether the RPM increments are equal — are they?',
      'Export the session CSV when done',
    ],
    fields: [
      {
        id: 'pwm_table',
        label: 'PWM → Observed Steady-State RPM',
        type: 'table',
        tableRows: ['PWM 25%', 'PWM 50%', 'PWM 75%', 'PWM 100%'],
        tableCols: ['PWM Setting', 'Observed RPM'],
        required: true,
      },
      {
        id: 'linearity_obs',
        label: 'Is the RPM increase linear with PWM? Explain briefly.',
        type: 'textarea',
        placeholder: 'e.g. No — RPM increased faster at lower PWM values and appeared to saturate at higher settings.',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export Open-Loop Data',
  },

  {
    id: 2,
    title: 'Closed-Loop PID Speed Control',
    hardware: 'ESP32 · L298N · Motor · Encoder · Web Interface',
    objective: 'Set a target RPM and observe how the PID controller on the ESP32 automatically adjusts PWM to maintain that exact speed. Understand how feedback control corrects speed drift.',
    setup: [
      'Mode → Closed-Loop PID',
      'PID defaults: Kp=2.0 Ki=0.5 Kd=0.1',
      'Target RPM → 1500',
      'Attachment → Flywheel',
    ],
    instructions: [
      'Switch Mode to Closed-Loop PID',
      'Set Target RPM to 1500 using the RPM slider',
      'Leave PID values at defaults (Kp=2.0, Ki=0.5, Kd=0.1)',
      'Press START and watch the RPM graph — does the motor reach 1500 RPM?',
      'Observe the PWM graph: the controller is automatically adjusting duty cycle',
      'After 20 seconds, export the CSV and record your observations',
    ],
    fields: [
      {
        id: 'target_achieved',
        label: 'Did the motor reach and maintain 1500 RPM? How quickly?',
        type: 'text',
        placeholder: 'e.g. Yes — reached target in about 4 seconds and held within ±20 RPM',
        required: true,
      },
      {
        id: 'vs_openloop',
        label: 'How does this compare to Experiment 1 (open-loop) at similar PWM?',
        type: 'textarea',
        placeholder: 'e.g. Open-loop drifted when loaded. Closed-loop actively corrects to stay at target.',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export Closed-Loop Data',
  },

  {
    id: 3,
    title: 'Step Response Test',
    hardware: 'ESP32 · Motor · Encoder · Web Interface Graph',
    objective: 'Suddenly change the target RPM while the motor is running and measure the transient response — rise time, overshoot, and settling time. These are core control-systems performance metrics.',
    setup: [
      'Mode → Closed-Loop PID',
      'PID defaults: Kp=2.0 Ki=0.5 Kd=0.1',
      'Attachment → Flywheel',
    ],
    instructions: [
      'Start motor at Target RPM = 800',
      'Let it stabilise for 10 seconds',
      'Change Target RPM to 1800 (a large step) — the motor must accelerate',
      'Watch the RPM graph carefully for overshoot and settling',
      'Export the CSV — use it to measure the values below',
      'Rise time = time from step until RPM first reaches 90% of 1800 (= 1620 RPM)',
      'Overshoot = (peak RPM − 1800) / 1800 × 100 %',
      'Settling time = time until RPM stays within ±5% of 1800 permanently',
    ],
    fields: [
      {
        id: 'rise_time',
        label: 'Rise time (seconds to first reach 1620 RPM)',
        type: 'text',
        placeholder: 'e.g. 3.2',
        required: true,
      },
      {
        id: 'overshoot_rpm',
        label: 'Peak RPM (highest value observed on the graph)',
        type: 'text',
        placeholder: 'e.g. 1953',
        required: true,
      },
      {
        id: 'overshoot_pct',
        label: 'Overshoot % = (Peak RPM − 1800) / 1800 × 100',
        type: 'text',
        placeholder: 'e.g. 8.5',
        required: true,
      },
      {
        id: 'settling_time',
        label: 'Settling time (seconds until RPM stays within ±90 of 1800)',
        type: 'text',
        placeholder: 'e.g. 7.1',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export Step Response Data',
  },

  {
    id: 4,
    title: 'PID Tuning Experiment',
    hardware: 'ESP32 · Motor · Encoder · Web Interface',
    objective: 'Change Kp, Ki, and Kd independently on the web interface and observe live how each parameter affects stability, speed of response, and oscillation.',
    setup: [
      'Mode → Closed-Loop PID',
      'Target RPM → 1500',
      'Attachment → Flywheel',
    ],
    instructions: [
      'Test A — High Kp: Set Kp=8.0, Ki=0, Kd=0. Run and observe oscillation.',
      'Test B — Low Kp: Set Kp=0.5, Ki=0, Kd=0. Run and observe slow response.',
      'Test C — Add Ki: Set Kp=2.0, Ki=2.0, Kd=0. Observe steady-state error elimination.',
      'Test D — Add Kd: Set Kp=2.0, Ki=0.5, Kd=0.5. Observe damped overshoot.',
      'Export CSV after each test (4 exports total)',
      'Record what you observe for each test below',
    ],
    fields: [
      {
        id: 'high_kp',
        label: 'Test A (Kp=8.0, Ki=0, Kd=0): What happened to the speed?',
        type: 'text',
        placeholder: 'e.g. Speed oscillated rapidly around target without settling',
        required: true,
      },
      {
        id: 'low_kp',
        label: 'Test B (Kp=0.5, Ki=0, Kd=0): What happened?',
        type: 'text',
        placeholder: 'e.g. Speed crept up slowly, took over 15 seconds to near target',
        required: true,
      },
      {
        id: 'ki_effect',
        label: 'Test C (Kp=2.0, Ki=2.0, Kd=0): Did steady-state error disappear?',
        type: 'text',
        placeholder: 'e.g. Yes — RPM converged exactly to 1500 after about 6 seconds',
        required: true,
      },
      {
        id: 'kd_effect',
        label: 'Test D (Kp=2.0, Ki=0.5, Kd=0.5): Describe the overshoot compared to Test C',
        type: 'text',
        placeholder: 'e.g. Much less overshoot — RPM settled smoothly without the spike seen in Test C',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 4,
    exportLabel: 'Export This PID Test',
  },

  {
    id: 5,
    title: 'Speed vs PWM Characteristic Curve',
    hardware: 'ESP32 · L298N · Motor · Encoder · Data Logger · CSV Export',
    objective: 'Sweep PWM from 0 to 100% in steps and plot the motor\'s transfer characteristic. Discover the PWM deadband (below which the motor does not spin) and the speed saturation region.',
    setup: [
      'Mode → Open-Loop',
      'Attachment → Fan',
      'Direction → Forward',
    ],
    instructions: [
      'Set Mode to Open-Loop',
      'Starting at PWM 5%, increase in steps of 5% up to 100%',
      'At each step, wait 3 seconds and record RPM in the table',
      'Note the lowest PWM where the motor just begins to spin (deadband)',
      'Note where RPM stops increasing significantly (saturation)',
      'Export the full CSV — it can be used to plot the curve in Excel or Python',
    ],
    fields: [
      {
        id: 'deadband_pwm',
        label: 'Deadband: lowest PWM % where motor just started spinning',
        type: 'text',
        placeholder: 'e.g. 20%',
        required: true,
      },
      {
        id: 'saturation_pwm',
        label: 'Saturation: PWM % where RPM stopped increasing noticeably',
        type: 'text',
        placeholder: 'e.g. 85%',
        required: true,
      },
      {
        id: 'curve_obs',
        label: 'Describe the shape of the PWM–RPM curve',
        type: 'textarea',
        placeholder: 'e.g. Linear in the middle range, flat at low PWM (deadband) and flat again at high PWM (saturation).',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export Characteristic Curve Data',
  },

  {
    id: 6,
    title: 'Speed Regulation Under Load',
    hardware: 'ESP32 · L298N · Motor · Encoder · Camera',
    objective: 'Apply a mechanical load mid-run and compare open-loop vs closed-loop behaviour. In closed-loop, the PID recovers target speed; in open-loop, RPM drops and stays low.',
    setup: [
      'Camera feed enabled (observe shaft physically)',
      'Target RPM → 1500',
    ],
    instructions: [
      'Part A — Open-Loop: Set Mode to Open-Loop, PWM 60%, run motor until stable',
      'Switch shaft attachment from Fan to Flywheel (simulates load increase)',
      'Record RPM before and after the load change',
      'Part B — Closed-Loop: Set Mode to Closed-Loop PID, Target=1500, run until stable',
      'Switch attachment from Fan to Flywheel again',
      'Observe on the graph: does the PID recover to 1500 RPM?',
      'Export CSV capturing both load disturbances',
    ],
    fields: [
      {
        id: 'openloop_before',
        label: 'Open-Loop: RPM before load (Fan attached)',
        type: 'text',
        placeholder: 'e.g. 1420',
        required: true,
      },
      {
        id: 'openloop_after',
        label: 'Open-Loop: RPM after load (Flywheel attached)',
        type: 'text',
        placeholder: 'e.g. 1180',
        required: true,
      },
      {
        id: 'closedloop_recovery',
        label: 'Closed-Loop: Did RPM recover to 1500 after the load change? How long?',
        type: 'text',
        placeholder: 'e.g. Yes — recovered to 1500 in about 5 seconds',
        required: true,
      },
      {
        id: 'regulation_conclusion',
        label: 'Conclusion: why does closed-loop control outperform open-loop under load?',
        type: 'textarea',
        placeholder: 'e.g. Open-loop cannot detect the speed drop, so no correction occurs. PID measures actual RPM and increases PWM automatically to restore target speed.',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export Load Test Data',
  },

  {
    id: 7,
    title: 'Forward and Reverse Direction Control',
    hardware: 'ESP32 · L298N · Motor · Camera',
    objective: 'Toggle motor direction between Forward and Reverse using the web interface while monitoring the RPM graph and camera feed. Understand H-bridge polarity reversal.',
    setup: [
      'Mode → Closed-Loop PID',
      'Target RPM → 1000',
      'Camera feed enabled',
      'Attachment → Propeller (visually clear direction)',
    ],
    instructions: [
      'Set Target RPM to 1000, Mode to Closed-Loop PID',
      'Attach PROPELLER — its spin direction is clearly visible on camera',
      'Press START in Forward direction — observe RPM graph and camera',
      'Press STOP, then toggle direction to Reverse',
      'Press START again — observe the shaft reversing on camera',
      'Try toggling direction while the motor is running and observe the transient',
      'Record your observations below',
    ],
    fields: [
      {
        id: 'direction_obs',
        label: 'Describe what you observed when direction was toggled while running',
        type: 'textarea',
        placeholder: 'e.g. Motor decelerated, briefly stopped, then accelerated in the opposite direction. The RPM graph dipped to zero then rose again.',
        required: true,
      },
      {
        id: 'hbridge_explanation',
        label: 'How does the L298N H-bridge achieve direction reversal? (brief answer)',
        type: 'textarea',
        placeholder: 'e.g. By switching which pair of transistors is active — reversing the polarity of current through the motor windings, causing it to spin the other way.',
        required: true,
      },
    ],
    requiresExport: false,
    exportCount: 0,
    exportLabel: '',
  },

  {
    id: 8,
    title: 'Speed Regulation % Calculation',
    hardware: 'ESP32 · L298N · Motor · Encoder · Data Logger · CSV Export',
    objective: 'Calculate the Speed Regulation percentage — an engineering metric that quantifies how well a motor maintains speed between no-load and full-load conditions.',
    setup: [
      'Mode → Open-Loop',
      'Fixed PWM → 60%',
    ],
    instructions: [
      'Set Mode to Open-Loop, PWM to 60%',
      'Step 1 — No load: Attach Fan (lightest load), run until stable, record RPM',
      'Step 2 — Full load: Switch to Flywheel (heaviest load), record RPM at SAME PWM',
      'Export CSV capturing both readings',
      'Calculate: SR% = (No-Load RPM − Full-Load RPM) / Full-Load RPM × 100',
      'Enter your values and calculated result below',
    ],
    fields: [
      {
        id: 'noload_rpm',
        label: 'No-Load RPM (Fan attachment, PWM 60%)',
        type: 'text',
        placeholder: 'e.g. 1480',
        required: true,
      },
      {
        id: 'fullload_rpm',
        label: 'Full-Load RPM (Flywheel attachment, same PWM 60%)',
        type: 'text',
        placeholder: 'e.g. 1210',
        required: true,
      },
      {
        id: 'sr_calculated',
        label: 'Your calculated Speed Regulation %  [ (NL − FL) / FL × 100 ]',
        type: 'formula',
        placeholder: 'e.g. 22.3',
        required: true,
        formulaHint: 'SR% = (No-Load RPM − Full-Load RPM) / Full-Load RPM × 100',
      },
      {
        id: 'sr_interpretation',
        label: 'What does this SR% value tell you about the motor\'s quality?',
        type: 'textarea',
        placeholder: 'e.g. A lower SR% means the motor maintains more consistent speed under load — indicating a higher quality or better controlled motor.',
        required: true,
      },
    ],
    requiresExport: true,
    exportCount: 1,
    exportLabel: 'Export & Verify SR% Data',
    isGraded: true,
  },
]

// ── State ─────────────────────────────────────────────────────────────────────
interface ActivityState {
  mode: 'free' | 'guided'
  currentActivity: number
  completed: number[]
  answers: Record<number, Record<string, string>>
  exports: Record<number, number>
  grade: { sr: number; verified: boolean } | null
}

// ── Context ───────────────────────────────────────────────────────────────────
interface ActivityContextValue {
  mode: 'free' | 'guided'
  currentActivity: number
  completed: number[]
  answers: Record<number, Record<string, string>>
  exports: Record<number, number>
  grade: { sr: number; verified: boolean } | null
  activities: ActivityDef[]

  startGuidedMode: () => void
  exitGuidedMode: () => void
  goToActivity: (n: number) => void
  setAnswer: (actId: number, field: string, value: string) => void
  recordExport: (actId: number) => void
  completeActivity: (actId: number) => void
  isActivityComplete: (actId: number) => boolean
}

const ActivityContext = createContext<ActivityContextValue | null>(null)

// ── Completion check ──────────────────────────────────────────────────────────
function checkComplete(actId: number, state: ActivityState): boolean {
  const act = ACTIVITIES[actId - 1]
  if (!act) return false
  const actAnswers = state.answers[actId] ?? {}

  const fieldsFilled = act.fields.filter(f => f.required).every(f => {
    if (f.type === 'table') {
      const dataCols = (f.tableCols ?? []).slice(1)
      return (f.tableRows ?? []).every((_, ri) =>
        dataCols.every((_, ci) => {
          const key = `${f.id}_${ri}_${ci + 1}`
          return (actAnswers[key] ?? '').trim().length > 0
        })
      )
    }
    return (actAnswers[f.id] ?? '').trim().length > 0
  })

  const exportsMet = (state.exports[actId] ?? 0) >= act.exportCount
  return fieldsFilled && exportsMet
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ActivityState>({
    mode: 'free',
    currentActivity: 1,
    completed: [],
    answers: {},
    exports: {},
    grade: null,
  })

  const startGuidedMode = useCallback(() =>
    setState(s => ({ ...s, mode: 'guided' })), [])

  const exitGuidedMode = useCallback(() =>
    setState(s => ({ ...s, mode: 'free' })), [])

  const goToActivity = useCallback((n: number) =>
    setState(s => ({ ...s, currentActivity: n })), [])

  const setAnswer = useCallback((actId: number, field: string, value: string) =>
    setState(s => ({
      ...s,
      answers: {
        ...s.answers,
        [actId]: { ...(s.answers[actId] ?? {}), [field]: value },
      },
    })), [])

  const recordExport = useCallback((actId: number) =>
    setState(s => ({
      ...s,
      exports: { ...s.exports, [actId]: (s.exports[actId] ?? 0) + 1 },
    })), [])

  const completeActivity = useCallback((actId: number) =>
    setState(s => {
      const next = Math.min(8, actId + 1)
      return {
        ...s,
        completed: s.completed.includes(actId) ? s.completed : [...s.completed, actId],
        currentActivity: next,
      }
    }), [])

  const isActivityComplete = useCallback((actId: number) =>
    checkComplete(actId, state), [state])

  const value: ActivityContextValue = {
    mode: state.mode,
    currentActivity: state.currentActivity,
    completed: state.completed,
    answers: state.answers,
    exports: state.exports,
    grade: state.grade,
    activities: ACTIVITIES,
    startGuidedMode,
    exitGuidedMode,
    goToActivity,
    setAnswer,
    recordExport,
    completeActivity,
    isActivityComplete,
  }

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext)
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider')
  return ctx
}
