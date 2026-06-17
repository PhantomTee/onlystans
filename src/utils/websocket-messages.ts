export type MessageType =
  | 'START' | 'STOP' | 'EMERGENCY_STOP'
  | 'SET_TARGET_RPM' | 'SET_PWM' | 'SET_DIRECTION'
  | 'SET_MODE' | 'SET_PID' | 'SET_LOAD' | 'PING'

export const createStart = () => ({ type: 'START' })
export const createStop = () => ({ type: 'STOP' })
export const createEmergencyStop = () => ({ type: 'EMERGENCY_STOP' })
export const createSetTargetRPM = (rpm: number) => ({ type: 'SET_TARGET_RPM', payload: { rpm } })
export const createSetPWM = (pwm: number) => ({ type: 'SET_PWM', payload: { pwm } })
export const createSetDirection = (direction: string) => ({ type: 'SET_DIRECTION', payload: { direction } })
export const createSetMode = (mode: string) => ({ type: 'SET_MODE', payload: { mode } })
export const createSetPID = (kp: number, ki: number, kd: number) => ({ type: 'SET_PID', payload: { kp, ki, kd } })
export const createSetLoad = (applied: boolean) => ({ type: 'SET_LOAD', payload: { applied } })
export const createPing = () => ({ type: 'PING' })
