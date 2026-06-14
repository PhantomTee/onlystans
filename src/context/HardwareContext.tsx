import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import type {
  HardwareState,
  DataLogEntry,
  GraphState,
  GraphDataPoint,
} from './types'
import { useWebSocket } from '../hooks/useWebSocket'

const MAX_GRAPH_POINTS = 300

const initialHardwareState: HardwareState = {
  wsStatus: 'DISCONNECTED',
  cameraStatus: 'DISCONNECTED',
  motorConnected: false,
  motorStatus: 'STOPPED',
  direction: 'FORWARD',
  currentRPM: 0,
  targetRPM: 1500,
  currentPWM: 0,
  pidError: 0,
  controlMode: 'CLOSED_LOOP',
  experimentMode: 'CLOSED_LOOP_PID',
  pidParams: { kp: 2.0, ki: 0.5, kd: 0.1 },
  lastUpdate: 0,
}

const initialGraphState: GraphState = {
  rpm: [],
  pwm: [],
  error: [],
}

interface HardwareContextValue {
  hardware: HardwareState
  dataLog: DataLogEntry[]
  graphState: GraphState
  sendCommand: (msg: object) => void
}

export const HardwareContext = createContext<HardwareContextValue>({
  hardware: initialHardwareState,
  dataLog: [],
  graphState: initialGraphState,
  sendCommand: () => {},
})

export function HardwareProvider({ children }: { children: React.ReactNode }) {
  const { status, send, lastMessage } = useWebSocket()

  const [hardware, setHardware] = useState<HardwareState>(initialHardwareState)
  const [dataLog, setDataLog] = useState<DataLogEntry[]>([])
  const [graphState, setGraphState] = useState<GraphState>(initialGraphState)

  // Track the last time we recorded a DataLogEntry (once per second)
  const lastLogTime = useRef<number>(0)

  // Update hardware state and graph whenever a new message arrives
  useEffect(() => {
    if (!lastMessage) return

    const updatedHardware: HardwareState = {
      ...lastMessage,
      wsStatus: status,
    }

    setHardware(updatedHardware)

    // Update graph data
    const now = lastMessage.lastUpdate || Date.now()

    const appendPoint = (
      existing: GraphDataPoint[],
      value: number
    ): GraphDataPoint[] => {
      const updated = [...existing, { time: now, value }]
      if (updated.length > MAX_GRAPH_POINTS) {
        return updated.slice(updated.length - MAX_GRAPH_POINTS)
      }
      return updated
    }

    setGraphState(prev => ({
      rpm: appendPoint(prev.rpm, lastMessage.currentRPM),
      pwm: appendPoint(prev.pwm, lastMessage.currentPWM),
      error: appendPoint(prev.error, lastMessage.pidError),
    }))

    // Record DataLogEntry once per second while motor is RUNNING
    if (lastMessage.motorStatus === 'RUNNING') {
      const nowMs = Date.now()
      if (nowMs - lastLogTime.current >= 1000) {
        lastLogTime.current = nowMs

        const entry: DataLogEntry = {
          timestamp: new Date(nowMs).toISOString(),
          targetRPM: lastMessage.targetRPM,
          actualRPM: lastMessage.currentRPM,
          pwmValue: lastMessage.currentPWM,
          error: lastMessage.pidError,
          mode: lastMessage.experimentMode,
        }

        setDataLog(prev => [...prev, entry])
      }
    }
  }, [lastMessage, status])

  // Sync wsStatus whenever WebSocket connection status changes
  useEffect(() => {
    setHardware(prev => ({
      ...prev,
      wsStatus: status,
    }))
  }, [status])

  const sendCommand = useCallback(
    (msg: object) => {
      send(msg)
    },
    [send]
  )

  return (
    <HardwareContext.Provider value={{ hardware, dataLog, graphState, sendCommand }}>
      {children}
    </HardwareContext.Provider>
  )
}

export function useHardware(): HardwareContextValue {
  const context = useContext(HardwareContext)
  if (!context) {
    throw new Error('useHardware must be used within a HardwareProvider')
  }
  return context
}
