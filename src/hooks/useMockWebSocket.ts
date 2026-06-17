import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  ConnectionStatus,
  HardwareState,
  ExperimentMode,
  ControlMode,
  MotorDirection,
  MotorStatus,
  PIDParams,
} from '../context/types'
import { addGaussianNoise, clamp, pwmToRPM } from '../utils/motor-math'

interface MockWebSocketHook {
  status: ConnectionStatus
  send: (msg: object) => void
  lastMessage: HardwareState | null
}

export function useMockWebSocket(): MockWebSocketHook {
  const [lastMessage, setLastMessage] = useState<HardwareState | null>(null)

  // All simulation state in refs so they don't trigger re-renders
  const motorStatus = useRef<MotorStatus>('STOPPED')
  const direction = useRef<MotorDirection>('FORWARD')
  const targetRPM = useRef<number>(60)
  const currentRPM = useRef<number>(0)
  const currentPWM = useRef<number>(0)
  const controlMode = useRef<ControlMode>('CLOSED_LOOP')
  const experimentMode = useRef<ExperimentMode>('CLOSED_LOOP_PID')
  const pidParams = useRef<PIDParams>({ kp: 2.0, ki: 0.5, kd: 0.1 })
  const pidIntegral = useRef<number>(0)
  const pidPrevError = useRef<number>(0)
  const loadDisturbanceTimer = useRef<number>(0)
  const stepStarted = useRef<boolean>(false)
  const loadApplied = useRef<boolean>(false)

  // Max achievable RPM for the JGB37-520 gear motor used in this lab
  const MAX_RPM = 110
  // A mechanical load (e.g. a flywheel/grinder on the shaft) reduces the RPM
  // a given PWM duty cycle can actually achieve
  const LOAD_FACTOR = 0.7

  // Map mode string from SET_MODE payload to ExperimentMode enum value
  function mapToExperimentMode(mode: string): ExperimentMode {
    switch (mode) {
      case 'OPEN_LOOP':
        return 'OPEN_LOOP'
      case 'CLOSED_LOOP_PID':
      case 'CLOSED_LOOP':
        return 'CLOSED_LOOP_PID'
      case 'STEP_RESPONSE':
        return 'STEP_RESPONSE'
      case 'SPEED_REGULATION':
        return 'SPEED_REGULATION'
      default:
        return 'CLOSED_LOOP_PID'
    }
  }

  const send = useCallback((msg: object) => {
    const message = msg as { type: string; payload?: Record<string, unknown> }
    const { type, payload } = message

    switch (type) {
      case 'START':
        motorStatus.current = 'RUNNING'
        pidIntegral.current = 0
        pidPrevError.current = 0
        stepStarted.current = false
        break

      case 'STOP':
        motorStatus.current = 'STOPPED'
        break

      case 'EMERGENCY_STOP':
        motorStatus.current = 'STOPPED'
        currentRPM.current = 0
        break

      case 'SET_TARGET_RPM':
        if (payload && typeof payload.rpm === 'number') {
          targetRPM.current = payload.rpm
        }
        break

      case 'SET_PWM':
        if (payload && typeof payload.pwm === 'number') {
          currentPWM.current = payload.pwm
        }
        break

      case 'SET_DIRECTION':
        if (payload && typeof payload.direction === 'string') {
          direction.current = payload.direction as MotorDirection
        }
        break

      case 'SET_MODE':
        if (payload && typeof payload.mode === 'string') {
          const mode = payload.mode as string
          if (mode === 'OPEN_LOOP') {
            controlMode.current = 'OPEN_LOOP'
          } else {
            controlMode.current = 'CLOSED_LOOP'
          }
          experimentMode.current = mapToExperimentMode(mode)
          stepStarted.current = false
        }
        break

      case 'SET_PID':
        if (payload) {
          pidParams.current = {
            kp: typeof payload.kp === 'number' ? payload.kp : pidParams.current.kp,
            ki: typeof payload.ki === 'number' ? payload.ki : pidParams.current.ki,
            kd: typeof payload.kd === 'number' ? payload.kd : pidParams.current.kd,
          }
        }
        break

      case 'SET_LOAD':
        if (payload && typeof payload.applied === 'boolean') {
          loadApplied.current = payload.applied
        }
        break

      case 'PING':
        // No-op for ping
        break

      default:
        break
    }
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const DT = 0.2 // 200ms tick in seconds

      if (motorStatus.current === 'STOPPED') {
        // Decelerate toward 0 with inertia
        currentRPM.current = currentRPM.current * 0.95
        if (currentRPM.current < 5) {
          currentRPM.current = 0
        }
      } else if (motorStatus.current === 'RUNNING') {
        const expMode = experimentMode.current

        // STEP_RESPONSE: set initial target once
        if (expMode === 'STEP_RESPONSE') {
          if (!stepStarted.current) {
            targetRPM.current = 30
            stepStarted.current = true
          }
        }

        // SPEED_REGULATION: apply random disturbance every 3-5 seconds
        if (expMode === 'SPEED_REGULATION') {
          loadDisturbanceTimer.current += 1
          // 3s = 15 ticks, 5s = 25 ticks — pick a random threshold in [15, 25]
          const threshold = 15 + Math.floor(Math.random() * 11) // 15..25
          if (loadDisturbanceTimer.current >= threshold) {
            const disturbance = -(2 + Math.random() * 2) // -2 to -4
            currentRPM.current = clamp(currentRPM.current + disturbance, 0, MAX_RPM + 20)
            loadDisturbanceTimer.current = 0
          }
        }

        const ctrlMode = controlMode.current
        const loadScale = loadApplied.current ? LOAD_FACTOR : 1

        if (ctrlMode === 'CLOSED_LOOP' || expMode === 'CLOSED_LOOP_PID' || expMode === 'STEP_RESPONSE' || expMode === 'SPEED_REGULATION') {
          // Discrete PID control
          const { kp, ki, kd } = pidParams.current
          const error = targetRPM.current - currentRPM.current
          pidIntegral.current += error * DT
          const derivative = (error - pidPrevError.current) / DT
          const output = kp * error + ki * pidIntegral.current + kd * derivative
          const clampedOutput = clamp(output, 0, 255)
          currentPWM.current = clampedOutput
          // RPM advances toward target with inertia (load reduces achievable RPM)
          const rpmFromPWM = pwmToRPM(currentPWM.current) * loadScale
          currentRPM.current += (rpmFromPWM - currentRPM.current) * 0.15
          pidPrevError.current = error
        } else if (ctrlMode === 'OPEN_LOOP' || expMode === 'OPEN_LOOP') {
          // Open loop: RPM advances toward pwmToRPM(currentPWM) with inertia factor 0.1
          const rpmFromPWM = pwmToRPM(currentPWM.current) * loadScale
          currentRPM.current += (rpmFromPWM - currentRPM.current) * 0.1
        }

        // Add gaussian noise to currentRPM and clamp
        currentRPM.current = clamp(addGaussianNoise(currentRPM.current, 1), 0, MAX_RPM + 20)
      }

      const pidError =
        motorStatus.current === 'RUNNING'
          ? targetRPM.current - currentRPM.current
          : 0

      const state: HardwareState = {
        wsStatus: 'CONNECTED',
        cameraStatus: 'DISCONNECTED',
        motorConnected: true,
        motorStatus: motorStatus.current,
        direction: direction.current,
        currentRPM: Math.round(currentRPM.current),
        targetRPM: targetRPM.current,
        currentPWM: Math.round(currentPWM.current),
        pidError: Math.round(pidError),
        controlMode: controlMode.current,
        experimentMode: experimentMode.current,
        pidParams: { ...pidParams.current },
        loadApplied: loadApplied.current,
        lastUpdate: Date.now(),
      }

      setLastMessage(state)
    }, 200)

    return () => clearInterval(intervalId)
  }, [])

  return {
    status: 'CONNECTED',
    send,
    lastMessage,
  }
}
