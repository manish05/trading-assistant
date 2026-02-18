import '@testing-library/jest-dom/vitest'

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((event: MessageEvent<string>) => void) | null = null

  constructor(url: string) {
    void url
    queueMicrotask(() => this.onopen?.())
  }

  send(data: string): void {
    void data
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.()
  }
}

Object.defineProperty(globalThis, 'WebSocket', {
  value: MockWebSocket,
  configurable: true,
})
