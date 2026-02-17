import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type GatewayResponse = {
  type: 'res'
  id: string
  ok: boolean
  payload?: Record<string, unknown>
  error?: { code: string; message: string }
}

type GatewayEvent = {
  type: 'event'
  event: string
  payload?: Record<string, unknown>
}

type BlockItem = {
  id: string
  title: string
  content: string
  severity: 'info' | 'warn' | 'error'
}

function App() {
  const wsRef = useRef<WebSocket | null>(null)
  const pendingRequestsRef = useRef<Map<string, (value: GatewayResponse) => void>>(new Map())
  const requestCounter = useRef(0)

  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')
  const [protocolVersion, setProtocolVersion] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [accountCount, setAccountCount] = useState<number | null>(null)
  const [feedCount, setFeedCount] = useState<number | null>(null)
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)
  const [blocks, setBlocks] = useState<BlockItem[]>([])

  const websocketUrl = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host || 'localhost:8000'
    return `${protocol}://${host}/ws`
  }, [])

  const appendBlock = useCallback((item: BlockItem) => {
    setBlocks((current) => [item, ...current].slice(0, 25))
  }, [])

  const sendRequest = useCallback(
    async (method: string, params: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
      const socket = wsRef.current
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        appendBlock({
          id: `blk_${Date.now()}`,
          title: `${method} failed`,
          content: 'Gateway is not connected.',
          severity: 'error',
        })
        return null
      }

      requestCounter.current += 1
      const requestId = `req_${requestCounter.current}`
      const payload = {
        type: 'req',
        id: requestId,
        method,
        params,
      }

      const responsePromise = new Promise<GatewayResponse>((resolve) => {
        pendingRequestsRef.current.set(requestId, resolve)
      })

      socket.send(JSON.stringify(payload))
      const response = await responsePromise

      if (!response.ok) {
        appendBlock({
          id: `blk_${Date.now()}`,
          title: `${method} rejected`,
          content: response.error?.message ?? 'Unknown error',
          severity: 'error',
        })
        return null
      }

      appendBlock({
        id: `blk_${Date.now()}`,
        title: `${method} response`,
        content: JSON.stringify(response.payload ?? {}, null, 2),
        severity: 'info',
      })
      return response.payload ?? {}
    },
    [appendBlock],
  )

  const sendPing = useCallback(() => {
    void sendRequest('gateway.ping', {})
  }, [sendRequest])

  const sendStatus = useCallback(() => {
    void sendRequest('gateway.status', {})
  }, [sendRequest])

  const sendRiskPreview = useCallback(() => {
    void sendRequest('risk.preview', {
      intent: {
        account_id: 'acct_demo_1',
        symbol: 'ETHUSDm',
        action: 'PLACE_MARKET_ORDER',
        side: 'buy',
        volume: 0.1,
        stop_loss: 2400.0,
        take_profit: 2700.0,
      },
      policy: {
        allowed_symbols: ['ETHUSDm'],
        max_volume: 0.2,
        max_concurrent_positions: 2,
        max_daily_loss: 100.0,
        require_stop_loss: true,
      },
      snapshot: {
        open_positions: 0,
        daily_pnl: -20.0,
      },
    })
  }, [sendRequest])

  const sendAccountsList = useCallback(async () => {
    const payload = await sendRequest('accounts.list', {})
    const accountsRaw = payload?.accounts
    const accounts = Array.isArray(accountsRaw) ? accountsRaw : []
    setAccountCount(accounts.length)
  }, [sendRequest])

  const sendFeedsList = useCallback(async () => {
    const payload = await sendRequest('feeds.list', {})
    const feedsRaw = payload?.feeds
    const subscriptionsRaw = payload?.subscriptions
    const feeds = Array.isArray(feedsRaw) ? feedsRaw : []
    const subscriptions = Array.isArray(subscriptionsRaw) ? subscriptionsRaw : []
    setFeedCount(feeds.length)
    setSubscriptionCount(subscriptions.length)
  }, [sendRequest])

  useEffect(() => {
    const socket = new WebSocket(websocketUrl)
    const pendingMap = pendingRequestsRef.current
    wsRef.current = socket

    socket.onopen = () => {
      setConnectionStatus('connected')
      requestCounter.current += 1
      socket.send(
        JSON.stringify({
          type: 'req',
          id: `req_${requestCounter.current}`,
          method: 'gateway.connect',
          params: {
            client: {
              name: 'web-dashboard',
              kind: 'web',
              platform: 'browser',
              version: '0.1.0',
            },
            protocol: {
              min: 1,
              max: 1,
            },
          },
        }),
      )
    }

    socket.onclose = () => {
      setConnectionStatus('disconnected')
    }

    socket.onmessage = (message) => {
      const parsed = JSON.parse(message.data) as GatewayResponse | GatewayEvent

      if (parsed.type === 'res') {
        if (parsed.id.startsWith('req_') && parsed.id === `req_${requestCounter.current}`) {
          if (parsed.ok && parsed.payload?.protocol && parsed.payload?.session) {
            const protocol = parsed.payload.protocol as { selected?: number }
            const session = parsed.payload.session as { sessionId?: string }
            setProtocolVersion(protocol.selected ?? null)
            setSessionId(session.sessionId ?? null)
          }
        }

        const resolver = pendingRequestsRef.current.get(parsed.id)
        if (resolver) {
          pendingRequestsRef.current.delete(parsed.id)
          resolver(parsed)
        }
        return
      }

      if (parsed.type === 'event') {
        appendBlock({
          id: `blk_${Date.now()}`,
          title: parsed.event,
          content: JSON.stringify(parsed.payload ?? {}, null, 2),
          severity: 'info',
        })
      }
    }

    return () => {
      socket.close()
      wsRef.current = null
      pendingMap.clear()
    }
  }, [appendBlock, websocketUrl])

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <h1>MT5 Claude Trader v2</h1>
        <span className={`status-chip status-${connectionStatus}`}>{connectionStatus}</span>
      </header>

      <main className="dashboard-grid">
        <section className="panel market-panel">
          <h2>Market Panel</h2>
          <div className="placeholder-chart">
            <span>Chart overlay surface (lightweight-charts integration in progress)</span>
          </div>
        </section>

        <section className="panel feed-panel">
          <div className="panel-heading">
            <h2>Agent Feed</h2>
            <div className="actions">
              <button type="button" onClick={sendPing}>
                Ping
              </button>
              <button type="button" onClick={sendStatus}>
                Status
              </button>
              <button type="button" onClick={sendRiskPreview}>
                Risk Preview
              </button>
              <button type="button" onClick={() => void sendAccountsList()}>
                Accounts
              </button>
              <button type="button" onClick={() => void sendFeedsList()}>
                Feeds
              </button>
            </div>
          </div>
          <div className="block-list">
            {blocks.length === 0 ? (
              <p className="empty-state">No blocks yet. Connect and trigger gateway methods.</p>
            ) : (
              blocks.map((block) => (
                <article key={block.id} className={`block-card severity-${block.severity}`}>
                  <h3>{block.title}</h3>
                  <pre>{block.content}</pre>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel status-panel">
          <h2>Account Status</h2>
          <dl>
            <div>
              <dt>Session</dt>
              <dd>{sessionId ?? 'not connected'}</dd>
            </div>
            <div>
              <dt>Protocol</dt>
              <dd>{protocolVersion ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Gateway URL</dt>
              <dd>{websocketUrl}</dd>
            </div>
            <div>
              <dt>Accounts (last fetch)</dt>
              <dd>{accountCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Feeds (last fetch)</dt>
              <dd>{feedCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Feed Subscriptions</dt>
              <dd>{subscriptionCount ?? 'n/a'}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}

export default App
