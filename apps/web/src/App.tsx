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

type QuickActionHistory = {
  id: string
  method: string
  status: 'sent' | 'ok' | 'error' | 'debounced' | 'skipped'
  durationMs?: number
  timestamp: number
}

type QuickActionPreset = {
  managedAccountId: string
  managedProviderAccountId: string
  managedAccountLabel: string
  managedAccountSymbolsInput: string
  managedDeviceId: string
  managedDevicePlatform: string
  managedDeviceLabel: string
  managedDevicePairPushToken: string
  managedDeviceRotatePushToken: string
  feedTopic: string
  feedSymbol: string
  feedTimeframe: string
  refreshSecondsInput: string
  minRequestGapMsInput: string
}

const PRESETS_STORAGE_KEY = 'quick-action-presets-v1'

const readPresetStoreFromStorage = (): Record<string, QuickActionPreset> => {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const raw = window.localStorage.getItem(PRESETS_STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, QuickActionPreset>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function App() {
  const wsRef = useRef<WebSocket | null>(null)
  const pendingRequestsRef = useRef<Map<string, (value: GatewayResponse) => void>>(new Map())
  const requestGuardsRef = useRef<Map<string, number>>(new Map())
  const requestCounter = useRef(0)

  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')
  const [protocolVersion, setProtocolVersion] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [accountCount, setAccountCount] = useState<number | null>(null)
  const [managedAccountId, setManagedAccountId] = useState<string>('acct_demo_1')
  const [managedProviderAccountId, setManagedProviderAccountId] = useState<string>('provider_demo_1')
  const [managedAccountLabel, setManagedAccountLabel] = useState<string>('Demo Account')
  const [managedAccountSymbolsInput, setManagedAccountSymbolsInput] = useState<string>(
    'ETHUSDm,BTCUSDm',
  )
  const [accountConnectionStatus, setAccountConnectionStatus] = useState<string>('unknown')
  const [deviceCount, setDeviceCount] = useState<number | null>(null)
  const [managedDeviceId, setManagedDeviceId] = useState<string>('dev_iphone_1')
  const [managedDevicePlatform, setManagedDevicePlatform] = useState<string>('ios')
  const [managedDeviceLabel, setManagedDeviceLabel] = useState<string>('Dashboard iPhone')
  const [managedDevicePairPushToken, setManagedDevicePairPushToken] = useState<string>(
    'push_dashboard_1',
  )
  const [managedDeviceRotatePushToken, setManagedDeviceRotatePushToken] = useState<string>(
    'push_dashboard_rotated',
  )
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false)
  const [refreshSecondsInput, setRefreshSecondsInput] = useState<string>('15')
  const [minRequestGapMsInput, setMinRequestGapMsInput] = useState<string>('400')
  const [presetNameInput, setPresetNameInput] = useState<string>('default')
  const [selectedPresetName, setSelectedPresetName] = useState<string>('')
  const [availablePresetNames, setAvailablePresetNames] = useState<string[]>(() =>
    Object.keys(readPresetStoreFromStorage()).sort(),
  )
  const [feedCount, setFeedCount] = useState<number | null>(null)
  const [feedTopic, setFeedTopic] = useState<string>('market.candle.closed')
  const [feedSymbol, setFeedSymbol] = useState<string>('ETHUSDm')
  const [feedTimeframe, setFeedTimeframe] = useState<string>('5m')
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null)
  const [feedLifecycle, setFeedLifecycle] = useState<FeedLifecycleBadge[]>([])
  const [quickActionHistory, setQuickActionHistory] = useState<QuickActionHistory[]>([])
  const [lastSuccessByMethod, setLastSuccessByMethod] = useState<Record<string, string>>({})
  const [lastErrorByMethod, setLastErrorByMethod] = useState<Record<string, string>>({})
  const [blocks, setBlocks] = useState<BlockItem[]>([])

  const websocketUrl = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host || 'localhost:8000'
    return `${protocol}://${host}/ws`
  }, [])

  const appendBlock = useCallback((item: BlockItem) => {
    setBlocks((current) => [item, ...current].slice(0, 25))
  }, [])

  const pushHistory = useCallback((item: QuickActionHistory) => {
    setQuickActionHistory((current) => [item, ...current].slice(0, 20))
  }, [])

  const patchHistory = useCallback((historyId: string, patch: Partial<QuickActionHistory>) => {
    setQuickActionHistory((current) =>
      current.map((entry) => (entry.id === historyId ? { ...entry, ...patch } : entry)),
    )
  }, [])

  const sendRequest = useCallback(
    async (method: string, params: Record<string, unknown>): Promise<Record<string, unknown> | null> => {
      const socket = wsRef.current
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setLastErrorByMethod((current) => ({
          ...current,
          [method]: new Date().toISOString(),
        }))
        pushHistory({
          id: `hist_${Date.now()}`,
          method,
          status: 'skipped',
          timestamp: Date.now(),
        })
        appendBlock({
          id: `blk_${Date.now()}`,
          title: `${method} failed`,
          content: 'Gateway is not connected.',
          severity: 'error',
        })
        return null
      }

      const minRequestGapMs = Math.max(Number.parseInt(minRequestGapMsInput, 10) || 0, 0)
      const nowMs = Date.now()
      const lastSentAtMs = requestGuardsRef.current.get(method) ?? 0
      if (nowMs - lastSentAtMs < minRequestGapMs) {
        pushHistory({
          id: `hist_${nowMs}`,
          method,
          status: 'debounced',
          durationMs: 0,
          timestamp: nowMs,
        })
        appendBlock({
          id: `blk_${nowMs}`,
          title: `${method} debounced`,
          content: `Skipped duplicate request within ${minRequestGapMs}ms guard window.`,
          severity: 'warn',
        })
        return null
      }
      requestGuardsRef.current.set(method, nowMs)

      requestCounter.current += 1
      const requestId = `req_${requestCounter.current}`
      const payload = {
        type: 'req',
        id: requestId,
        method,
        params,
      }
      const historyId = `hist_${requestId}`
      pushHistory({
        id: historyId,
        method,
        status: 'sent',
        durationMs: 0,
        timestamp: nowMs,
      })

      const responsePromise = new Promise<GatewayResponse>((resolve) => {
        pendingRequestsRef.current.set(requestId, resolve)
      })

      socket.send(JSON.stringify(payload))
      const response = await responsePromise
      const durationMs = Date.now() - nowMs

      if (!response.ok) {
        setLastErrorByMethod((current) => ({
          ...current,
          [method]: new Date().toISOString(),
        }))
        patchHistory(historyId, {
          status: 'error',
          durationMs,
        })
        appendBlock({
          id: `blk_${Date.now()}`,
          title: `${method} rejected`,
          content: response.error?.message ?? 'Unknown error',
          severity: 'error',
        })
        return null
      }

      patchHistory(historyId, {
        status: 'ok',
        durationMs,
      })
      setLastSuccessByMethod((current) => ({
        ...current,
        [method]: new Date().toISOString(),
      }))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: `${method} response`,
        content: JSON.stringify(response.payload ?? {}, null, 2),
        severity: 'info',
      })
      return response.payload ?? {}
    },
    [appendBlock, minRequestGapMsInput, patchHistory, pushHistory],
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
    const symbols = managedAccountSymbolsInput
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
    const payload = await sendRequest('accounts.connect', {
      accountId: managedAccountId,
      connectorId: 'metaapi_mcp',
      providerAccountId: managedProviderAccountId,
      mode: 'demo',
      label: managedAccountLabel,
      allowedSymbols: symbols,
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
  }, [
    managedAccountId,
    managedAccountLabel,
    managedAccountSymbolsInput,
    managedProviderAccountId,
    sendRequest,
  ])

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
      platform: managedDevicePlatform,
      label: managedDeviceLabel,
      pushToken: managedDevicePairPushToken,
    })
    const device = payload?.device
    if (device && typeof device === 'object' && 'deviceId' in device) {
      if (typeof device.deviceId === 'string') {
        setManagedDeviceId(device.deviceId)
      }
    }
  }, [
    managedDeviceId,
    managedDeviceLabel,
    managedDevicePairPushToken,
    managedDevicePlatform,
    sendRequest,
  ])

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
      pushToken: managedDeviceRotatePushToken,
    })
    const device = payload?.device
    if (device && typeof device === 'object' && 'deviceId' in device) {
      if (typeof device.deviceId === 'string') {
        setManagedDeviceId(device.deviceId)
      }
    }
  }, [appendBlock, managedDeviceId, managedDeviceRotatePushToken, sendRequest])

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
      topics: [feedTopic],
      symbols: [feedSymbol],
      timeframes: [feedTimeframe],
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
  }, [feedSymbol, feedTimeframe, feedTopic, sendRequest])

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

  const collectCurrentPreset = useCallback((): QuickActionPreset => {
    return {
      managedAccountId,
      managedProviderAccountId,
      managedAccountLabel,
      managedAccountSymbolsInput,
      managedDeviceId,
      managedDevicePlatform,
      managedDeviceLabel,
      managedDevicePairPushToken,
      managedDeviceRotatePushToken,
      feedTopic,
      feedSymbol,
      feedTimeframe,
      refreshSecondsInput,
      minRequestGapMsInput,
    }
  }, [
    feedSymbol,
    feedTimeframe,
    feedTopic,
    managedAccountId,
    managedAccountLabel,
    managedAccountSymbolsInput,
    managedDeviceId,
    managedDeviceLabel,
    managedDevicePairPushToken,
    managedDevicePlatform,
    managedDeviceRotatePushToken,
    managedProviderAccountId,
    minRequestGapMsInput,
    refreshSecondsInput,
  ])

  const applyPreset = useCallback((preset: QuickActionPreset) => {
    setManagedAccountId(preset.managedAccountId)
    setManagedProviderAccountId(preset.managedProviderAccountId)
    setManagedAccountLabel(preset.managedAccountLabel)
    setManagedAccountSymbolsInput(preset.managedAccountSymbolsInput)
    setManagedDeviceId(preset.managedDeviceId)
    setManagedDevicePlatform(preset.managedDevicePlatform)
    setManagedDeviceLabel(preset.managedDeviceLabel)
    setManagedDevicePairPushToken(preset.managedDevicePairPushToken)
    setManagedDeviceRotatePushToken(preset.managedDeviceRotatePushToken)
    setFeedTopic(preset.feedTopic)
    setFeedSymbol(preset.feedSymbol)
    setFeedTimeframe(preset.feedTimeframe)
    setRefreshSecondsInput(preset.refreshSecondsInput)
    setMinRequestGapMsInput(preset.minRequestGapMsInput)
  }, [])

  const readPresetStore = useCallback((): Record<string, QuickActionPreset> => {
    return readPresetStoreFromStorage()
  }, [])

  const writePresetStore = useCallback((store: Record<string, QuickActionPreset>) => {
    window.localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(store))
    setAvailablePresetNames(Object.keys(store).sort())
  }, [])

  const savePreset = useCallback(() => {
    const normalizedName = presetNameInput.trim()
    if (!normalizedName) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset save skipped',
        content: 'Preset name is required.',
        severity: 'warn',
      })
      return
    }
    const store = readPresetStore()
    store[normalizedName] = collectCurrentPreset()
    writePresetStore(store)
    setSelectedPresetName(normalizedName)
  }, [appendBlock, collectCurrentPreset, presetNameInput, readPresetStore, writePresetStore])

  const loadSelectedPreset = useCallback(() => {
    if (!selectedPresetName) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset load skipped',
        content: 'Select a preset first.',
        severity: 'warn',
      })
      return
    }
    const store = readPresetStore()
    const preset = store[selectedPresetName]
    if (!preset) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset load failed',
        content: `Preset not found: ${selectedPresetName}`,
        severity: 'error',
      })
      return
    }
    applyPreset(preset)
  }, [appendBlock, applyPreset, readPresetStore, selectedPresetName])

  const deleteSelectedPreset = useCallback(() => {
    if (!selectedPresetName) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset delete skipped',
        content: 'Select a preset first.',
        severity: 'warn',
      })
      return
    }
    const store = readPresetStore()
    if (!(selectedPresetName in store)) {
      return
    }
    delete store[selectedPresetName]
    writePresetStore(store)
    setSelectedPresetName('')
  }, [appendBlock, readPresetStore, selectedPresetName, writePresetStore])

  useEffect(() => {
    if (!autoRefreshEnabled) {
      return
    }
    const refreshSeconds = Math.max(Number.parseInt(refreshSecondsInput, 10) || 0, 1)
    const intervalId = window.setInterval(() => {
      void sendAccountsList()
      void sendFeedsList()
      void sendDevicesList()
    }, refreshSeconds * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [autoRefreshEnabled, refreshSecondsInput, sendAccountsList, sendDevicesList, sendFeedsList])

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
          <section className="template-panel">
            <h3>Quick Action Templates</h3>
            <div className="template-grid">
              <label>
                Account ID
                <input
                  value={managedAccountId}
                  onChange={(event) => setManagedAccountId(event.target.value)}
                />
              </label>
              <label>
                Provider Account ID
                <input
                  value={managedProviderAccountId}
                  onChange={(event) => setManagedProviderAccountId(event.target.value)}
                />
              </label>
              <label>
                Account Label
                <input
                  value={managedAccountLabel}
                  onChange={(event) => setManagedAccountLabel(event.target.value)}
                />
              </label>
              <label>
                Account Symbols (comma separated)
                <input
                  value={managedAccountSymbolsInput}
                  onChange={(event) => setManagedAccountSymbolsInput(event.target.value)}
                />
              </label>
              <label>
                Device ID
                <input
                  value={managedDeviceId}
                  onChange={(event) => setManagedDeviceId(event.target.value)}
                />
              </label>
              <label>
                Device Platform
                <input
                  value={managedDevicePlatform}
                  onChange={(event) => setManagedDevicePlatform(event.target.value)}
                />
              </label>
              <label>
                Device Label
                <input
                  value={managedDeviceLabel}
                  onChange={(event) => setManagedDeviceLabel(event.target.value)}
                />
              </label>
              <label>
                Device Pair Push Token
                <input
                  value={managedDevicePairPushToken}
                  onChange={(event) => setManagedDevicePairPushToken(event.target.value)}
                />
              </label>
              <label>
                Device Rotate Push Token
                <input
                  value={managedDeviceRotatePushToken}
                  onChange={(event) => setManagedDeviceRotatePushToken(event.target.value)}
                />
              </label>
              <label>
                Feed Topic
                <input value={feedTopic} onChange={(event) => setFeedTopic(event.target.value)} />
              </label>
              <label>
                Feed Symbol
                <input value={feedSymbol} onChange={(event) => setFeedSymbol(event.target.value)} />
              </label>
              <label>
                Feed Timeframe
                <input
                  value={feedTimeframe}
                  onChange={(event) => setFeedTimeframe(event.target.value)}
                />
              </label>
              <label>
                Refresh Interval (sec)
                <input
                  value={refreshSecondsInput}
                  onChange={(event) => setRefreshSecondsInput(event.target.value)}
                />
              </label>
              <label>
                Min Request Gap (ms)
                <input
                  value={minRequestGapMsInput}
                  onChange={(event) => setMinRequestGapMsInput(event.target.value)}
                />
              </label>
              <label className="template-toggle">
                <input
                  type="checkbox"
                  checked={autoRefreshEnabled}
                  onChange={(event) => setAutoRefreshEnabled(event.target.checked)}
                />
                Enable Auto Refresh
              </label>
            </div>
            <div className="preset-controls">
              <label>
                Preset Name
                <input
                  value={presetNameInput}
                  onChange={(event) => setPresetNameInput(event.target.value)}
                />
              </label>
              <button type="button" onClick={savePreset}>
                Save Preset
              </button>
              <label>
                Saved Presets
                <select
                  value={selectedPresetName}
                  onChange={(event) => setSelectedPresetName(event.target.value)}
                >
                  <option value="">-- select preset --</option>
                  {availablePresetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={loadSelectedPreset}>
                Load Preset
              </button>
              <button type="button" onClick={deleteSelectedPreset}>
                Delete Preset
              </button>
            </div>
          </section>
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
            <div>
              <dt>Quick Action History</dt>
              <dd>
                {quickActionHistory.length === 0 ? (
                  <span className="history-empty">none</span>
                ) : (
                  <ul className="history-list">
                    {quickActionHistory.slice(0, 8).map((entry) => (
                      <li key={entry.id}>
                        <span className="history-method">{entry.method}</span>
                        <span className="history-status">{entry.status}</span>
                        <span className="history-duration">{entry.durationMs ?? 0}ms</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div>
              <dt>Quick Action Timestamps</dt>
              <dd className="timestamp-grid">
                <div>
                  <strong>Success</strong>
                  {Object.keys(lastSuccessByMethod).length === 0 ? (
                    <div className="history-empty">none</div>
                  ) : (
                    <ul className="timestamp-list">
                      {Object.entries(lastSuccessByMethod)
                        .slice(0, 6)
                        .map(([method, ts]) => (
                          <li key={`ok_${method}`}>
                            <span>{method}</span>
                            <span>{ts}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <div>
                  <strong>Error</strong>
                  {Object.keys(lastErrorByMethod).length === 0 ? (
                    <div className="history-empty">none</div>
                  ) : (
                    <ul className="timestamp-list">
                      {Object.entries(lastErrorByMethod)
                        .slice(0, 6)
                        .map(([method, ts]) => (
                          <li key={`err_${method}`}>
                            <span>{method}</span>
                            <span>{ts}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}

export default App
