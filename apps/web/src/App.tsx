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

type FeedLifecycleBadge = {
  id: string
  action: string
  subscriptionId?: string
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
  const [managedAccountId, setManagedAccountId] = useState<string>('acct_demo_1')
  const [accountConnectionStatus, setAccountConnectionStatus] = useState<string>('unknown')
  const [deviceCount, setDeviceCount] = useState<number | null>(null)
  const [managedDeviceId, setManagedDeviceId] = useState<string>('dev_iphone_1')
  const [feedCount, setFeedCount] = useState<number | null>(null)
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null)
  const [feedLifecycle, setFeedLifecycle] = useState<FeedLifecycleBadge[]>([])
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

  const sendAccountConnect = useCallback(async () => {
    const payload = await sendRequest('accounts.connect', {
      accountId: managedAccountId,
      connectorId: 'metaapi_mcp',
      providerAccountId: 'provider_demo_1',
      mode: 'demo',
      label: 'Demo Account',
      allowedSymbols: ['ETHUSDm', 'BTCUSDm'],
    })
    const account = payload?.account
    if (account && typeof account === 'object') {
      if ('accountId' in account && typeof account.accountId === 'string') {
        setManagedAccountId(account.accountId)
      }
      if ('status' in account && typeof account.status === 'string') {
        setAccountConnectionStatus(account.status)
      }
    }
  }, [managedAccountId, sendRequest])

  const sendAccountDisconnect = useCallback(async () => {
    if (!managedAccountId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'accounts.disconnect skipped',
        content: 'No managed account id available.',
        severity: 'warn',
      })
      return
    }
    const payload = await sendRequest('accounts.disconnect', { accountId: managedAccountId })
    const account = payload?.account
    if (account && typeof account === 'object' && 'status' in account) {
      if (typeof account.status === 'string') {
        setAccountConnectionStatus(account.status)
      }
    }
  }, [appendBlock, managedAccountId, sendRequest])

  const sendFeedsList = useCallback(async () => {
    const payload = await sendRequest('feeds.list', {})
    const feedsRaw = payload?.feeds
    const subscriptionsRaw = payload?.subscriptions
    const feeds = Array.isArray(feedsRaw) ? feedsRaw : []
    const subscriptions = Array.isArray(subscriptionsRaw) ? subscriptionsRaw : []
    setFeedCount(feeds.length)
    setSubscriptionCount(subscriptions.length)
    const nextActiveId = subscriptions
      .map((item) => {
        if (item && typeof item === 'object' && 'subscriptionId' in item) {
          const value = item.subscriptionId
          return typeof value === 'string' ? value : null
        }
        return null
      })
      .find((value): value is string => value !== null)
    setActiveSubscriptionId(nextActiveId ?? null)
  }, [sendRequest])

  const sendDevicesList = useCallback(async () => {
    const payload = await sendRequest('devices.list', {})
    const devicesRaw = payload?.devices
    const devices = Array.isArray(devicesRaw) ? devicesRaw : []
    setDeviceCount(devices.length)
  }, [sendRequest])

  const sendDevicePair = useCallback(async () => {
    const payload = await sendRequest('devices.pair', {
      deviceId: managedDeviceId,
      platform: 'ios',
      label: 'Dashboard iPhone',
      pushToken: 'push_dashboard_1',
    })
    const device = payload?.device
    if (device && typeof device === 'object' && 'deviceId' in device) {
      if (typeof device.deviceId === 'string') {
        setManagedDeviceId(device.deviceId)
      }
    }
  }, [managedDeviceId, sendRequest])

  const sendDeviceRegisterPush = useCallback(async () => {
    if (!managedDeviceId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'devices.registerPush skipped',
        content: 'No managed device id available.',
        severity: 'warn',
      })
      return
    }

    const payload = await sendRequest('devices.registerPush', {
      deviceId: managedDeviceId,
      pushToken: 'push_dashboard_rotated',
    })
    const device = payload?.device
    if (device && typeof device === 'object' && 'deviceId' in device) {
      if (typeof device.deviceId === 'string') {
        setManagedDeviceId(device.deviceId)
      }
    }
  }, [appendBlock, managedDeviceId, sendRequest])

  const sendDeviceUnpair = useCallback(async () => {
    if (!managedDeviceId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'devices.unpair skipped',
        content: 'No managed device id available.',
        severity: 'warn',
      })
      return
    }

    const payload = await sendRequest('devices.unpair', {
      deviceId: managedDeviceId,
    })
    if (!payload) {
      return
    }
    if (payload.status === 'removed') {
      setDeviceCount((current) => (current === null ? current : Math.max(current - 1, 0)))
    }
  }, [appendBlock, managedDeviceId, sendRequest])

  const sendFeedSubscribe = useCallback(async () => {
    const payload = await sendRequest('feeds.subscribe', {
      topics: ['market.candle.closed'],
      symbols: ['ETHUSDm'],
      timeframes: ['5m'],
    })
    if (!payload) {
      return
    }

    const subscriptionCountRaw = payload.subscriptionCount
    if (typeof subscriptionCountRaw === 'number') {
      setSubscriptionCount(subscriptionCountRaw)
    }

    const subscription = payload.subscription
    if (subscription && typeof subscription === 'object' && 'subscriptionId' in subscription) {
      const subscriptionId = subscription.subscriptionId
      if (typeof subscriptionId === 'string') {
        setActiveSubscriptionId(subscriptionId)
      }
    }
  }, [sendRequest])

  const sendFeedUnsubscribe = useCallback(async () => {
    if (!activeSubscriptionId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'feeds.unsubscribe skipped',
        content: 'No active feed subscription id available.',
        severity: 'warn',
      })
      return
    }

    const payload = await sendRequest('feeds.unsubscribe', {
      subscriptionId: activeSubscriptionId,
    })
    if (!payload) {
      return
    }

    const subscriptionCountRaw = payload.subscriptionCount
    if (typeof subscriptionCountRaw === 'number') {
      setSubscriptionCount(subscriptionCountRaw)
    }
    if (payload.status === 'removed') {
      setActiveSubscriptionId(null)
    }
  }, [activeSubscriptionId, appendBlock, sendRequest])

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
        if (parsed.event === 'event.feed.event') {
          const payload = parsed.payload ?? {}
          const action =
            typeof payload.action === 'string' && payload.action.length > 0
              ? payload.action
              : 'unknown'
          const subscriptionIdRaw = payload.subscriptionId
          const subscriptionId =
            typeof subscriptionIdRaw === 'string' ? subscriptionIdRaw : undefined
          setFeedLifecycle((current) =>
            [
              {
                id: `feed_evt_${Date.now()}`,
                action,
                subscriptionId,
              },
              ...current,
            ].slice(0, 6),
          )
        }
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
              <button type="button" onClick={() => void sendAccountConnect()}>
                Connect Account
              </button>
              <button type="button" onClick={() => void sendAccountDisconnect()}>
                Disconnect Account
              </button>
              <button type="button" onClick={() => void sendFeedsList()}>
                Feeds
              </button>
              <button type="button" onClick={() => void sendDevicesList()}>
                Devices
              </button>
              <button type="button" onClick={() => void sendDevicePair()}>
                Pair Device
              </button>
              <button type="button" onClick={() => void sendDeviceRegisterPush()}>
                Register Push
              </button>
              <button type="button" onClick={() => void sendDeviceUnpair()}>
                Unpair Device
              </button>
              <button type="button" onClick={() => void sendFeedSubscribe()}>
                Subscribe Feed
              </button>
              <button
                type="button"
                onClick={() => void sendFeedUnsubscribe()}
                disabled={!activeSubscriptionId}
              >
                Unsubscribe Feed
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
              <dt>Managed Account</dt>
              <dd>{managedAccountId}</dd>
            </div>
            <div>
              <dt>Account Connection</dt>
              <dd>{accountConnectionStatus}</dd>
            </div>
            <div>
              <dt>Feeds (last fetch)</dt>
              <dd>{feedCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Devices (last fetch)</dt>
              <dd>{deviceCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Managed Device</dt>
              <dd>{managedDeviceId}</dd>
            </div>
            <div>
              <dt>Feed Subscriptions</dt>
              <dd>{subscriptionCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Active Subscription</dt>
              <dd>{activeSubscriptionId ?? 'none'}</dd>
            </div>
            <div>
              <dt>Feed Lifecycle</dt>
              <dd className="badge-row">
                {feedLifecycle.length === 0 ? (
                  <span className="lifecycle-badge">none</span>
                ) : (
                  feedLifecycle.map((item) => (
                    <span key={item.id} className="lifecycle-badge">
                      {item.action}
                      {item.subscriptionId ? `:${item.subscriptionId}` : ''}
                    </span>
                  ))
                )}
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}

export default App
