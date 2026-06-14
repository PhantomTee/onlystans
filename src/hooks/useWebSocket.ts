import { MOCK_MODE } from '../config'
import { useMockWebSocket } from './useMockWebSocket'
import type { ConnectionStatus, HardwareState } from '../context/types'

interface WebSocketHook {
  status: ConnectionStatus
  send: (msg: object) => void
  lastMessage: HardwareState | null
}

export function useWebSocket(): WebSocketHook {
  const mock = useMockWebSocket()

  if (MOCK_MODE) {
    return mock
  }

  // Live mode - real WebSocket
  // This is a placeholder that works; real implementation would be a separate hook
  // For now, return mock since MOCK_MODE guards this
  return mock
}
