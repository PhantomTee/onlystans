export type MotorDirection = 'FORWARD' | 'BACKWARD'
export type MotorStatus = 'RUNNING' | 'STOPPED' | 'ERROR'
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'
export type ExperimentMode = 'OPEN_LOOP' | 'CLOSED_LOOP_PID' | 'STEP_RESPONSE' | 'SPEED_REGULATION'
export type ControlMode = 'OPEN_LOOP' | 'CLOSED_LOOP'

export interface PIDParams { kp: number; ki: number; kd: number }

export interface HardwareState {
  wsStatus: ConnectionStatus
  cameraStatus: ConnectionStatus
  motorConnected: boolean
  motorStatus: MotorStatus
  direction: MotorDirection
  currentRPM: number
  targetRPM: number
  currentPWM: number
  pidError: number
  controlMode: ControlMode
  experimentMode: ExperimentMode
  pidParams: PIDParams
  lastUpdate: number
}

export interface DataLogEntry {
  timestamp: string
  targetRPM: number
  actualRPM: number
  pwmValue: number
  error: number
  mode: string
}

export interface GraphDataPoint { time: number; value: number }

export interface GraphState {
  rpm: GraphDataPoint[]
  pwm: GraphDataPoint[]
  error: GraphDataPoint[]
}
