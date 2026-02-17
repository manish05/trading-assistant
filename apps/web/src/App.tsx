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

type HistoryFilter = 'all' | QuickActionHistory['status']
type TimestampFormat = 'absolute' | 'relative'

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
type PresetImportMode = 'overwrite' | 'merge'
type ImportHintMode = 'detailed' | 'compact'
type ShortcutLegendOrder = 'import-first' | 'clear-first'
type ShortcutLegendDensity = 'chips' | 'inline'
type HelperDiagnosticsDisplayMode = 'compact' | 'verbose'
type ShortcutLegendItem = {
  label: string
  title: string
  inlineLabel: string
}
type PresetImportReport = {
  mode: PresetImportMode
  accepted: string[]
  rejected: string[]
  createdCount: number
  preservedCount: number
  overwrittenCount: number
  importedAt: string
}

const PRESETS_STORAGE_KEY = 'quick-action-presets-v1'
const HISTORY_FILTER_STORAGE_KEY = 'quick-action-history-filter-v1'
const TIMESTAMP_FORMAT_STORAGE_KEY = 'quick-action-timestamp-format-v1'
const PRESET_IMPORT_MODE_STORAGE_KEY = 'quick-action-preset-import-mode-v1'
const PRESET_IMPORT_REPORT_EXPANDED_STORAGE_KEY = 'quick-action-preset-import-report-expanded-v1'
const IMPORT_HINT_VISIBILITY_STORAGE_KEY = 'quick-action-import-hint-visibility-v1'
const IMPORT_HINT_MODE_STORAGE_KEY = 'quick-action-import-hint-mode-v1'
const IMPORT_HELPER_DIAGNOSTICS_STORAGE_KEY = 'quick-action-import-helper-diagnostics-v1'
const IMPORT_HELPER_DIAGNOSTICS_MODE_STORAGE_KEY = 'quick-action-import-helper-diagnostics-mode-v1'
const STATUS_SHORTCUT_LEGEND_STORAGE_KEY = 'quick-action-status-shortcut-legend-v1'
const STATUS_SHORTCUT_LEGEND_ORDER_STORAGE_KEY = 'quick-action-status-shortcut-legend-order-v1'
const STATUS_SHORTCUT_LEGEND_DENSITY_STORAGE_KEY = 'quick-action-status-shortcut-legend-density-v1'
const IMPORT_SNAPSHOT_TOGGLES_STORAGE_KEY = 'quick-action-import-snapshot-toggles-v1'
const HELPER_DIAGNOSTICS_RESET_AT_STORAGE_KEY = 'quick-action-helper-diagnostics-reset-at-v1'
const HELPER_RESET_TIMESTAMP_FORMAT_STORAGE_KEY = 'quick-action-helper-reset-timestamp-format-v1'
const HELPER_RESET_BADGE_VISIBILITY_STORAGE_KEY = 'quick-action-helper-reset-badge-visibility-v1'
const HELPER_RESET_STALE_THRESHOLD_HOURS_STORAGE_KEY =
  'quick-action-helper-reset-stale-threshold-hours-v1'
const HELPER_RESET_BADGE_SECTION_STORAGE_KEY = 'quick-action-helper-reset-badge-section-v1'
const HELPER_RESET_LOCK_STORAGE_KEY = 'quick-action-helper-reset-lock-v1'
const HELPER_LOCK_COUNTERS_RESET_AT_STORAGE_KEY = 'quick-action-helper-lock-counters-reset-at-v1'
const MAX_IMPORT_REPORT_NAMES = 6
const DEFAULT_PRESET_TEMPLATE: QuickActionPreset = {
  managedAccountId: 'acct_demo_1',
  managedProviderAccountId: 'provider_demo_1',
  managedAccountLabel: 'Demo Account',
  managedAccountSymbolsInput: 'ETHUSDm,BTCUSDm',
  managedDeviceId: 'dev_iphone_1',
  managedDevicePlatform: 'ios',
  managedDeviceLabel: 'Dashboard iPhone',
  managedDevicePairPushToken: 'push_dashboard_1',
  managedDeviceRotatePushToken: 'push_dashboard_rotated',
  feedTopic: 'market.candle.closed',
  feedSymbol: 'ETHUSDm',
  feedTimeframe: '5m',
  refreshSecondsInput: '15',
  minRequestGapMsInput: '400',
}

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

const readHistoryFilterFromStorage = (): HistoryFilter => {
  if (typeof window === 'undefined') {
    return 'all'
  }
  const raw = window.localStorage.getItem(HISTORY_FILTER_STORAGE_KEY)
  const allowed: HistoryFilter[] = ['all', 'sent', 'ok', 'error', 'debounced', 'skipped']
  if (raw && allowed.includes(raw as HistoryFilter)) {
    return raw as HistoryFilter
  }
  return 'all'
}

const readTimestampFormatFromStorage = (): TimestampFormat => {
  if (typeof window === 'undefined') {
    return 'absolute'
  }
  const raw = window.localStorage.getItem(TIMESTAMP_FORMAT_STORAGE_KEY)
  return raw === 'relative' ? 'relative' : 'absolute'
}

const readPresetImportModeFromStorage = (): PresetImportMode => {
  if (typeof window === 'undefined') {
    return 'overwrite'
  }
  const raw = window.localStorage.getItem(PRESET_IMPORT_MODE_STORAGE_KEY)
  return raw === 'merge' ? 'merge' : 'overwrite'
}

const readPresetImportReportExpandedFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  const raw = window.localStorage.getItem(PRESET_IMPORT_REPORT_EXPANDED_STORAGE_KEY)
  return raw !== 'collapsed'
}

const readImportHintVisibilityFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  const raw = window.localStorage.getItem(IMPORT_HINT_VISIBILITY_STORAGE_KEY)
  return raw !== 'hidden'
}

const readImportHintModeFromStorage = (): ImportHintMode => {
  if (typeof window === 'undefined') {
    return 'detailed'
  }
  const raw = window.localStorage.getItem(IMPORT_HINT_MODE_STORAGE_KEY)
  return raw === 'compact' ? 'compact' : 'detailed'
}

const readImportHelperDiagnosticsExpandedFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(IMPORT_HELPER_DIAGNOSTICS_STORAGE_KEY) !== 'collapsed'
}

const readImportHelperDiagnosticsModeFromStorage = (): HelperDiagnosticsDisplayMode => {
  if (typeof window === 'undefined') {
    return 'compact'
  }
  const raw = window.localStorage.getItem(IMPORT_HELPER_DIAGNOSTICS_MODE_STORAGE_KEY)
  return raw === 'verbose' ? 'verbose' : 'compact'
}

const readStatusShortcutLegendFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  return window.localStorage.getItem(STATUS_SHORTCUT_LEGEND_STORAGE_KEY) === 'visible'
}

const readStatusShortcutLegendOrderFromStorage = (): ShortcutLegendOrder => {
  if (typeof window === 'undefined') {
    return 'import-first'
  }
  const raw = window.localStorage.getItem(STATUS_SHORTCUT_LEGEND_ORDER_STORAGE_KEY)
  return raw === 'clear-first' ? 'clear-first' : 'import-first'
}

const readStatusShortcutLegendDensityFromStorage = (): ShortcutLegendDensity => {
  if (typeof window === 'undefined') {
    return 'chips'
  }
  const raw = window.localStorage.getItem(STATUS_SHORTCUT_LEGEND_DENSITY_STORAGE_KEY)
  return raw === 'inline' ? 'inline' : 'chips'
}

const readImportSnapshotTogglesExpandedFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(IMPORT_SNAPSHOT_TOGGLES_STORAGE_KEY) !== 'collapsed'
}

const readHelperDiagnosticsResetAtFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const raw = window.localStorage.getItem(HELPER_DIAGNOSTICS_RESET_AT_STORAGE_KEY)
  return raw && raw.length > 0 ? raw : null
}

const readHelperResetTimestampFormatFromStorage = (): TimestampFormat => {
  if (typeof window === 'undefined') {
    return 'absolute'
  }
  const raw = window.localStorage.getItem(HELPER_RESET_TIMESTAMP_FORMAT_STORAGE_KEY)
  return raw === 'relative' ? 'relative' : 'absolute'
}

const readHelperResetBadgeVisibleFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(HELPER_RESET_BADGE_VISIBILITY_STORAGE_KEY) !== 'hidden'
}

const readHelperResetStaleThresholdHoursFromStorage = (): number => {
  if (typeof window === 'undefined') {
    return 24
  }
  const raw = window.localStorage.getItem(HELPER_RESET_STALE_THRESHOLD_HOURS_STORAGE_KEY)
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return parsed === 72 ? 72 : 24
}

const readHelperResetBadgeSectionExpandedFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(HELPER_RESET_BADGE_SECTION_STORAGE_KEY) !== 'collapsed'
}

const readHelperResetLockFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(HELPER_RESET_LOCK_STORAGE_KEY) !== 'unlocked'
}

const readHelperLockCountersResetAtFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const value = window.localStorage.getItem(HELPER_LOCK_COUNTERS_RESET_AT_STORAGE_KEY)
  if (!value) {
    return null
  }
  return Number.isNaN(Date.parse(value)) ? null : value
}

const sanitizePreset = (value: unknown): QuickActionPreset | null => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  const raw = value as Record<string, unknown>
  const pick = (key: keyof QuickActionPreset): string => {
    const candidate = raw[key]
    return typeof candidate === 'string' && candidate.length > 0
      ? candidate
      : DEFAULT_PRESET_TEMPLATE[key]
  }
  return {
    managedAccountId: pick('managedAccountId'),
    managedProviderAccountId: pick('managedProviderAccountId'),
    managedAccountLabel: pick('managedAccountLabel'),
    managedAccountSymbolsInput: pick('managedAccountSymbolsInput'),
    managedDeviceId: pick('managedDeviceId'),
    managedDevicePlatform: pick('managedDevicePlatform'),
    managedDeviceLabel: pick('managedDeviceLabel'),
    managedDevicePairPushToken: pick('managedDevicePairPushToken'),
    managedDeviceRotatePushToken: pick('managedDeviceRotatePushToken'),
    feedTopic: pick('feedTopic'),
    feedSymbol: pick('feedSymbol'),
    feedTimeframe: pick('feedTimeframe'),
    refreshSecondsInput: pick('refreshSecondsInput'),
    minRequestGapMsInput: pick('minRequestGapMsInput'),
  }
}

const summarizeNames = (names: string[], maxNames = MAX_IMPORT_REPORT_NAMES): string => {
  if (names.length === 0) {
    return 'none'
  }
  if (names.length <= maxNames) {
    return names.join(', ')
  }
  const visible = names.slice(0, maxNames).join(', ')
  return `${visible} (+${names.length - maxNames} more)`
}

const formatTimestamp = (ts: string, format: TimestampFormat): string => {
  if (format === 'absolute') {
    return ts
  }
  const millis = Date.parse(ts)
  if (Number.isNaN(millis)) {
    return ts
  }
  const diffSeconds = Math.max(Math.floor((Date.now() - millis) / 1000), 0)
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`
  }
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const resolveHelperResetTone = (
  ts: string | null,
  staleThresholdHours: number,
): 'tone-none' | 'tone-fresh' | 'tone-stale' => {
  if (!ts) {
    return 'tone-none'
  }
  const millis = Date.parse(ts)
  if (Number.isNaN(millis)) {
    return 'tone-stale'
  }
  const ageMs = Math.max(Date.now() - millis, 0)
  return ageMs >= staleThresholdHours * 60 * 60 * 1000 ? 'tone-stale' : 'tone-fresh'
}

const resolveLockCounterTone = (count: number): 'counter-tone-none' | 'counter-tone-active' | 'counter-tone-high' => {
  if (count === 0) {
    return 'counter-tone-none'
  }
  if (count >= 3) {
    return 'counter-tone-high'
  }
  return 'counter-tone-active'
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
  const [managedAccountId, setManagedAccountId] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedAccountId,
  )
  const [managedProviderAccountId, setManagedProviderAccountId] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedProviderAccountId,
  )
  const [managedAccountLabel, setManagedAccountLabel] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedAccountLabel,
  )
  const [managedAccountSymbolsInput, setManagedAccountSymbolsInput] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedAccountSymbolsInput,
  )
  const [accountConnectionStatus, setAccountConnectionStatus] = useState<string>('unknown')
  const [deviceCount, setDeviceCount] = useState<number | null>(null)
  const [managedDeviceId, setManagedDeviceId] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDeviceId,
  )
  const [managedDevicePlatform, setManagedDevicePlatform] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDevicePlatform,
  )
  const [managedDeviceLabel, setManagedDeviceLabel] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDeviceLabel,
  )
  const [managedDevicePairPushToken, setManagedDevicePairPushToken] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDevicePairPushToken,
  )
  const [managedDeviceRotatePushToken, setManagedDeviceRotatePushToken] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDeviceRotatePushToken,
  )
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(false)
  const [refreshSecondsInput, setRefreshSecondsInput] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.refreshSecondsInput,
  )
  const [minRequestGapMsInput, setMinRequestGapMsInput] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.minRequestGapMsInput,
  )
  const [presetNameInput, setPresetNameInput] = useState<string>('default')
  const [selectedPresetName, setSelectedPresetName] = useState<string>('')
  const [presetImportInput, setPresetImportInput] = useState<string>('')
  const [presetImportMode, setPresetImportMode] = useState<PresetImportMode>(
    readPresetImportModeFromStorage,
  )
  const [presetImportReport, setPresetImportReport] = useState<PresetImportReport | null>(null)
  const [isPresetImportReportExpanded, setIsPresetImportReportExpanded] = useState<boolean>(
    readPresetImportReportExpandedFromStorage,
  )
  const [isImportHintVisible, setIsImportHintVisible] = useState<boolean>(
    readImportHintVisibilityFromStorage,
  )
  const [isImportHelperDiagnosticsExpanded, setIsImportHelperDiagnosticsExpanded] =
    useState<boolean>(readImportHelperDiagnosticsExpandedFromStorage)
  const [importHintMode, setImportHintMode] = useState<ImportHintMode>(readImportHintModeFromStorage)
  const [hintModeLiveNote, setHintModeLiveNote] = useState<string>('')
  const [showShortcutLegendInStatus, setShowShortcutLegendInStatus] = useState<boolean>(
    readStatusShortcutLegendFromStorage,
  )
  const [isImportSnapshotTogglesExpanded, setIsImportSnapshotTogglesExpanded] = useState<boolean>(
    readImportSnapshotTogglesExpandedFromStorage,
  )
  const [shortcutLegendOrder, setShortcutLegendOrder] = useState<ShortcutLegendOrder>(
    readStatusShortcutLegendOrderFromStorage,
  )
  const [shortcutLegendDensity, setShortcutLegendDensity] = useState<ShortcutLegendDensity>(
    readStatusShortcutLegendDensityFromStorage,
  )
  const [helperDiagnosticsDisplayMode, setHelperDiagnosticsDisplayMode] =
    useState<HelperDiagnosticsDisplayMode>(readImportHelperDiagnosticsModeFromStorage)
  const [helperDiagnosticsLastResetAt, setHelperDiagnosticsLastResetAt] = useState<string | null>(
    readHelperDiagnosticsResetAtFromStorage,
  )
  const [helperResetTimestampFormat, setHelperResetTimestampFormat] = useState<TimestampFormat>(
    readHelperResetTimestampFormatFromStorage,
  )
  const [isHelperResetBadgeVisible, setIsHelperResetBadgeVisible] = useState<boolean>(
    readHelperResetBadgeVisibleFromStorage,
  )
  const [helperResetStaleThresholdHours, setHelperResetStaleThresholdHours] = useState<number>(
    readHelperResetStaleThresholdHoursFromStorage,
  )
  const [isHelperResetBadgeSectionExpanded, setIsHelperResetBadgeSectionExpanded] =
    useState<boolean>(readHelperResetBadgeSectionExpandedFromStorage)
  const [isHelperResetLocked, setIsHelperResetLocked] = useState<boolean>(readHelperResetLockFromStorage)
  const [helperLockCountersLastResetAt, setHelperLockCountersLastResetAt] = useState<string | null>(
    readHelperLockCountersResetAtFromStorage,
  )
  const [availablePresetNames, setAvailablePresetNames] = useState<string[]>(() =>
    Object.keys(readPresetStoreFromStorage()).sort(),
  )
  const [feedCount, setFeedCount] = useState<number | null>(null)
  const [feedTopic, setFeedTopic] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedTopic)
  const [feedSymbol, setFeedSymbol] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedSymbol)
  const [feedTimeframe, setFeedTimeframe] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedTimeframe)
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null)
  const [feedLifecycle, setFeedLifecycle] = useState<FeedLifecycleBadge[]>([])
  const [quickActionHistory, setQuickActionHistory] = useState<QuickActionHistory[]>([])
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(readHistoryFilterFromStorage)
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>(
    readTimestampFormatFromStorage,
  )
  const [lastSuccessByMethod, setLastSuccessByMethod] = useState<Record<string, string>>({})
  const [lastErrorByMethod, setLastErrorByMethod] = useState<Record<string, string>>({})
  const [blocks, setBlocks] = useState<BlockItem[]>([])

  const websocketUrl = useMemo(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.host || 'localhost:8000'
    return `${protocol}://${host}/ws`
  }, [])

  const helperResetToneClass = useMemo(
    () => resolveHelperResetTone(helperDiagnosticsLastResetAt, helperResetStaleThresholdHours),
    [helperDiagnosticsLastResetAt, helperResetStaleThresholdHours],
  )

  const helperResetLockToggleCount = useMemo(
    () =>
      quickActionHistory.filter((entry) => entry.method.startsWith('helper.reset.lock.toggle')).length,
    [quickActionHistory],
  )

  const helperResetLockToggleToneClass = useMemo(
    () => resolveLockCounterTone(helperResetLockToggleCount),
    [helperResetLockToggleCount],
  )

  const helperResetLockSourceCounts = useMemo(() => {
    const counts: Record<'Alt+L' | 'controls' | 'snapshot', number> = {
      'Alt+L': 0,
      controls: 0,
      snapshot: 0,
    }
    for (const entry of quickActionHistory) {
      if (!entry.method.startsWith('helper.reset.lock.toggle.')) {
        continue
      }
      const source = entry.method.replace('helper.reset.lock.toggle.', '') as
        | 'Alt+L'
        | 'controls'
        | 'snapshot'
      if (source in counts) {
        counts[source] += 1
      }
    }
    return counts
  }, [quickActionHistory])

  const lockTelemetrySummaryLines = useMemo(
    () => [
      `lockCounterResetAt=${helperLockCountersLastResetAt ?? 'never'}`,
      `lockToggleTotal=${helperResetLockToggleCount}`,
      `lockToggleTone=${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
      `lockToggleAlt+L=${helperResetLockSourceCounts['Alt+L']}`,
      `lockToggleAlt+LTone=${resolveLockCounterTone(helperResetLockSourceCounts['Alt+L']).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleControls=${helperResetLockSourceCounts.controls}`,
      `lockToggleControlsTone=${resolveLockCounterTone(helperResetLockSourceCounts.controls).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleSnapshot=${helperResetLockSourceCounts.snapshot}`,
      `lockToggleSnapshotTone=${resolveLockCounterTone(helperResetLockSourceCounts.snapshot).replace(
        'counter-tone-',
        '',
      )}`,
    ],
    [
      helperLockCountersLastResetAt,
      helperResetLockSourceCounts,
      helperResetLockToggleCount,
      helperResetLockToggleToneClass,
    ],
  )

  const toggleHelperResetLock = useCallback((source: 'Alt+L' | 'controls' | 'snapshot') => {
    const now = Date.now()
    const lockEntry: QuickActionHistory = {
      id: `hist_${now}_helper_reset_lock_${source}`,
      method: `helper.reset.lock.toggle.${source}`,
      status: 'ok',
      durationMs: 0,
      timestamp: now,
    }
    setQuickActionHistory((current) =>
      [lockEntry, ...current].slice(0, 20),
    )
    setIsHelperResetLocked((current) => {
      const next = !current
      setHintModeLiveNote(`Helper reset lock ${next ? 'locked' : 'unlocked'} via ${source}.`)
      return next
    })
  }, [])

  const appendBlock = useCallback((item: BlockItem) => {
    setBlocks((current) => [item, ...current].slice(0, 25))
  }, [])

  const resetHelperLockCounters = useCallback(() => {
    if (helperResetLockToggleCount === 0) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper lock counters already empty',
        content: 'No helper reset lock toggle history to clear.',
        severity: 'warn',
      })
      return
    }
    setQuickActionHistory((current) =>
      current.filter((entry) => !entry.method.startsWith('helper.reset.lock.toggle.')),
    )
    setHelperLockCountersLastResetAt(new Date().toISOString())
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'helper lock counters reset',
      content: 'Reset helper lock counters.',
      severity: 'info',
    })
  }, [appendBlock, helperResetLockToggleCount])

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

  const exportPresetsJson = useCallback(async () => {
    const store = readPresetStore()
    const serialized = JSON.stringify(store, null, 2)
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(serialized)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'presets exported',
        content: `Copied ${Object.keys(store).length} presets JSON to clipboard.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'presets export failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [appendBlock, readPresetStore])

  const importPresetsJson = useCallback(() => {
    const source = presetImportInput.trim()
    if (!source) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset import skipped',
        content: 'Import JSON field is empty.',
        severity: 'warn',
      })
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(source)
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset import failed',
        content: 'Invalid JSON payload.',
        severity: 'error',
      })
      return
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset import failed',
        content: 'Expected a JSON object keyed by preset name.',
        severity: 'error',
      })
      return
    }

    const incomingRaw = parsed as Record<string, unknown>
    const incoming: Record<string, QuickActionPreset> = {}
    const acceptedNames: string[] = []
    const rejectedNames: string[] = []
    for (const [name, value] of Object.entries(incomingRaw)) {
      if (!name.trim()) {
        rejectedNames.push('(empty)')
        continue
      }
      const sanitized = sanitizePreset(value)
      if (!sanitized) {
        rejectedNames.push(name)
        continue
      }
      incoming[name] = sanitized
      acceptedNames.push(name)
    }
    const store = readPresetStore()
    const conflicts = acceptedNames.filter((name) => name in store).length
    const merged =
      presetImportMode === 'merge' ? { ...incoming, ...store } : { ...store, ...incoming }
    const createdCount = acceptedNames.length - conflicts
    const preservedCount = presetImportMode === 'merge' ? conflicts : 0
    const overwrittenCount = presetImportMode === 'overwrite' ? conflicts : 0
    writePresetStore(merged)
    setPresetImportInput('')
    setPresetImportReport({
      mode: presetImportMode,
      accepted: acceptedNames,
      rejected: rejectedNames,
      createdCount,
      preservedCount,
      overwrittenCount,
      importedAt: new Date().toISOString(),
    })
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'presets imported',
      content:
        `Imported ${acceptedNames.length} preset entries (${presetImportMode}). ` +
        `Created ${createdCount}, preserved ${preservedCount}, overwritten ${overwrittenCount}, ` +
        `rejected ${rejectedNames.length}.`,
      severity: 'info',
    })
  }, [appendBlock, presetImportInput, presetImportMode, readPresetStore, writePresetStore])

  const copyPresetImportReport = useCallback(async () => {
    if (!presetImportReport) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copy skipped',
        content: 'No preset import report available yet.',
        severity: 'warn',
      })
      return
    }
    const summaryLines = [
      `mode=${presetImportReport.mode}`,
      `importedAt=${presetImportReport.importedAt}`,
      `accepted=${summarizeNames(presetImportReport.accepted)}`,
      `rejected=${summarizeNames(presetImportReport.rejected)}`,
      `created=${presetImportReport.createdCount}`,
      `preserved=${presetImportReport.preservedCount}`,
      `overwritten=${presetImportReport.overwrittenCount}`,
      '[LockTelemetry]',
      ...lockTelemetrySummaryLines,
    ]
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(summaryLines.join('\n'))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copied',
        content: 'Preset import report copied to clipboard.',
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [appendBlock, lockTelemetrySummaryLines, presetImportReport])

  const lastImportSummaryText = useMemo(() => {
    if (!presetImportReport) {
      return 'Last import: none'
    }
    return `Last import: ${presetImportReport.importedAt} · accepted ${presetImportReport.accepted.length} · rejected ${presetImportReport.rejected.length}`
  }, [presetImportReport])

  const copyPresetImportNames = useCallback(async () => {
    if (!presetImportReport) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import names copy skipped',
        content: 'No preset import report available yet.',
        severity: 'warn',
      })
      return
    }
    const payload = [
      `accepted:${presetImportReport.accepted.join(',')}`,
      `rejected:${presetImportReport.rejected.join(',')}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(payload)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import names copied',
        content: 'Copied full accepted/rejected import names to clipboard.',
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import names copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [appendBlock, presetImportReport])

  const copyLastImportSummary = useCallback(async () => {
    if (!presetImportReport) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copy skipped',
        content: 'No preset import report available yet.',
        severity: 'warn',
      })
      return
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(
        [lastImportSummaryText, '[LockTelemetry]', ...lockTelemetrySummaryLines].join('\n'),
      )
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copied',
        content: 'Copied last import summary to clipboard.',
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [appendBlock, lastImportSummaryText, lockTelemetrySummaryLines, presetImportReport])

  const copyImportShortcutCheatSheet = useCallback(async () => {
    const cheatSheet = [
      'Import Shortcuts',
      '- Ctrl/Cmd+Enter: run preset JSON import',
      '- Esc: clear preset JSON input',
      '- Alt+L: toggle helper reset lock',
      '- Import mode overwrite: incoming presets replace conflicts',
      '- Import mode merge: existing presets keep conflicts',
      `- Active mode: ${presetImportMode}`,
      `- Helper reset format: ${helperResetTimestampFormat}`,
      `- Helper reset stale-after hours: ${helperResetStaleThresholdHours}`,
      `- Helper reset lock: ${isHelperResetLocked ? 'locked' : 'unlocked'}`,
      `- Helper lock counter reset at: ${helperLockCountersLastResetAt ?? 'never'}`,
      `- Helper lock toggle total: ${helperResetLockToggleCount}`,
      `- Helper lock toggle tone: ${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
      `- Helper lock toggle Alt+L: ${helperResetLockSourceCounts['Alt+L']}`,
      `- Helper lock toggle controls: ${helperResetLockSourceCounts.controls}`,
      `- Helper lock toggle snapshot: ${helperResetLockSourceCounts.snapshot}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(cheatSheet)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'shortcut cheat-sheet copied',
        content: `Copied import shortcut cheat-sheet to clipboard (lock: ${
          isHelperResetLocked ? 'locked' : 'unlocked'
        }).`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'shortcut cheat-sheet copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    helperResetStaleThresholdHours,
    helperLockCountersLastResetAt,
    helperResetLockSourceCounts,
    helperResetLockToggleCount,
    helperResetLockToggleToneClass,
    helperResetTimestampFormat,
    isHelperResetLocked,
    presetImportMode,
  ])

  const copyHelperDiagnosticsSummary = useCallback(async () => {
    const summary = [
      `expanded=${isImportHelperDiagnosticsExpanded ? 'yes' : 'no'}`,
      `enabled=${Number(isImportHintVisible) + Number(showShortcutLegendInStatus)}/2`,
      `density=${shortcutLegendDensity}`,
      `resetAt=${helperDiagnosticsLastResetAt ?? 'never'}`,
      `resetFormat=${helperResetTimestampFormat}`,
      `resetBadgeVisible=${isHelperResetBadgeVisible ? 'yes' : 'no'}`,
      `resetBadgeSection=${isHelperResetBadgeSectionExpanded ? 'expanded' : 'collapsed'}`,
      `resetLock=${isHelperResetLocked ? 'locked' : 'unlocked'}`,
      `resetStaleAfterHours=${helperResetStaleThresholdHours}`,
      `lockToggleTotal=${helperResetLockToggleCount}`,
      `lockToggleTone=${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
      `lockToggleAlt+L=${helperResetLockSourceCounts['Alt+L']}`,
      `lockToggleAlt+LTone=${resolveLockCounterTone(helperResetLockSourceCounts['Alt+L']).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleControls=${helperResetLockSourceCounts.controls}`,
      `lockToggleControlsTone=${resolveLockCounterTone(helperResetLockSourceCounts.controls).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleSnapshot=${helperResetLockSourceCounts.snapshot}`,
      `lockToggleSnapshotTone=${resolveLockCounterTone(helperResetLockSourceCounts.snapshot).replace(
        'counter-tone-',
        '',
      )}`,
      `lockCounterResetAt=${helperLockCountersLastResetAt ?? 'never'}`,
      `hintVisible=${isImportHintVisible ? 'yes' : 'no'}`,
      `legendVisible=${showShortcutLegendInStatus ? 'yes' : 'no'}`,
      `legendOrder=${shortcutLegendOrder}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(summary)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper summary copied',
        content: `Copied helper diagnostics summary to clipboard (lock: ${
          isHelperResetLocked ? 'locked' : 'unlocked'
        }).`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper summary copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    isImportHelperDiagnosticsExpanded,
    isImportHintVisible,
    helperDiagnosticsLastResetAt,
    helperLockCountersLastResetAt,
    isHelperResetBadgeSectionExpanded,
    isHelperResetBadgeVisible,
    isHelperResetLocked,
    helperResetLockSourceCounts,
    helperResetLockToggleCount,
    helperResetLockToggleToneClass,
    helperResetStaleThresholdHours,
    helperResetTimestampFormat,
    shortcutLegendDensity,
    shortcutLegendOrder,
    showShortcutLegendInStatus,
  ])

  const copyHelperResetBadge = useCallback(async () => {
    const resetText = helperDiagnosticsLastResetAt
      ? formatTimestamp(helperDiagnosticsLastResetAt, helperResetTimestampFormat)
      : 'never'
    const payload = [
      `last reset=${resetText}`,
      `resetFormat=${helperResetTimestampFormat}`,
      `staleAfterHours=${helperResetStaleThresholdHours}`,
      `resetLock=${isHelperResetLocked ? 'locked' : 'unlocked'}`,
      `resetBadgeVisible=${isHelperResetBadgeVisible ? 'yes' : 'no'}`,
      `resetBadgeSection=${isHelperResetBadgeSectionExpanded ? 'expanded' : 'collapsed'}`,
      `lockToggleTotal=${helperResetLockToggleCount}`,
      `lockToggleTone=${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
      `lockToggleAlt+L=${helperResetLockSourceCounts['Alt+L']}`,
      `lockToggleAlt+LTone=${resolveLockCounterTone(helperResetLockSourceCounts['Alt+L']).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleControls=${helperResetLockSourceCounts.controls}`,
      `lockToggleControlsTone=${resolveLockCounterTone(helperResetLockSourceCounts.controls).replace(
        'counter-tone-',
        '',
      )}`,
      `lockToggleSnapshot=${helperResetLockSourceCounts.snapshot}`,
      `lockToggleSnapshotTone=${resolveLockCounterTone(helperResetLockSourceCounts.snapshot).replace(
        'counter-tone-',
        '',
      )}`,
      `lockCounterResetAt=${helperLockCountersLastResetAt ?? 'never'}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(payload)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper reset badge copied',
        content: `Copied helper reset badge text to clipboard (lock: ${
          isHelperResetLocked ? 'locked' : 'unlocked'
        }).`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper reset badge copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    helperDiagnosticsLastResetAt,
    helperLockCountersLastResetAt,
    helperResetLockSourceCounts,
    helperResetLockToggleCount,
    helperResetLockToggleToneClass,
    isHelperResetBadgeSectionExpanded,
    isHelperResetBadgeVisible,
    isHelperResetLocked,
    helperResetStaleThresholdHours,
    helperResetTimestampFormat,
  ])

  const resetHelperDiagnosticsPreferences = useCallback(() => {
    if (isHelperResetLocked) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper diagnostics reset locked',
        content: 'Unlock reset controls before resetting helper diagnostics preferences.',
        severity: 'warn',
      })
      return
    }
    setIsImportHintVisible(true)
    setIsImportHelperDiagnosticsExpanded(true)
    setImportHintMode('detailed')
    setShowShortcutLegendInStatus(false)
    setIsImportSnapshotTogglesExpanded(true)
    setShortcutLegendOrder('import-first')
    setShortcutLegendDensity('chips')
    setHelperDiagnosticsDisplayMode('compact')
    setIsHelperResetBadgeVisible(true)
    setIsHelperResetBadgeSectionExpanded(true)
    setHelperResetStaleThresholdHours(24)
    setHelperDiagnosticsLastResetAt(new Date().toISOString())
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'helper diagnostics reset',
      content: 'Reset helper diagnostics preferences to defaults.',
      severity: 'info',
    })
  }, [appendBlock, isHelperResetLocked])

  const clearPresetImportReport = useCallback(() => {
    if (!presetImportReport) {
      return
    }
    setPresetImportReport(null)
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'import report cleared',
      content: 'Cleared the latest preset import diagnostics.',
      severity: 'info',
    })
  }, [appendBlock, presetImportReport])

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

  useEffect(() => {
    window.localStorage.setItem(HISTORY_FILTER_STORAGE_KEY, historyFilter)
  }, [historyFilter])

  useEffect(() => {
    window.localStorage.setItem(TIMESTAMP_FORMAT_STORAGE_KEY, timestampFormat)
  }, [timestampFormat])

  useEffect(() => {
    window.localStorage.setItem(PRESET_IMPORT_MODE_STORAGE_KEY, presetImportMode)
  }, [presetImportMode])

  useEffect(() => {
    window.localStorage.setItem(
      PRESET_IMPORT_REPORT_EXPANDED_STORAGE_KEY,
      isPresetImportReportExpanded ? 'expanded' : 'collapsed',
    )
  }, [isPresetImportReportExpanded])

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_HINT_VISIBILITY_STORAGE_KEY,
      isImportHintVisible ? 'visible' : 'hidden',
    )
  }, [isImportHintVisible])

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_HELPER_DIAGNOSTICS_STORAGE_KEY,
      isImportHelperDiagnosticsExpanded ? 'expanded' : 'collapsed',
    )
  }, [isImportHelperDiagnosticsExpanded])

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_HELPER_DIAGNOSTICS_MODE_STORAGE_KEY,
      helperDiagnosticsDisplayMode,
    )
  }, [helperDiagnosticsDisplayMode])

  useEffect(() => {
    if (helperDiagnosticsLastResetAt) {
      window.localStorage.setItem(HELPER_DIAGNOSTICS_RESET_AT_STORAGE_KEY, helperDiagnosticsLastResetAt)
      return
    }
    window.localStorage.removeItem(HELPER_DIAGNOSTICS_RESET_AT_STORAGE_KEY)
  }, [helperDiagnosticsLastResetAt])

  useEffect(() => {
    if (helperLockCountersLastResetAt) {
      window.localStorage.setItem(
        HELPER_LOCK_COUNTERS_RESET_AT_STORAGE_KEY,
        helperLockCountersLastResetAt,
      )
      return
    }
    window.localStorage.removeItem(HELPER_LOCK_COUNTERS_RESET_AT_STORAGE_KEY)
  }, [helperLockCountersLastResetAt])

  useEffect(() => {
    window.localStorage.setItem(HELPER_RESET_TIMESTAMP_FORMAT_STORAGE_KEY, helperResetTimestampFormat)
  }, [helperResetTimestampFormat])

  useEffect(() => {
    window.localStorage.setItem(
      HELPER_RESET_BADGE_VISIBILITY_STORAGE_KEY,
      isHelperResetBadgeVisible ? 'visible' : 'hidden',
    )
  }, [isHelperResetBadgeVisible])

  useEffect(() => {
    window.localStorage.setItem(
      HELPER_RESET_BADGE_SECTION_STORAGE_KEY,
      isHelperResetBadgeSectionExpanded ? 'expanded' : 'collapsed',
    )
  }, [isHelperResetBadgeSectionExpanded])

  useEffect(() => {
    window.localStorage.setItem(
      HELPER_RESET_LOCK_STORAGE_KEY,
      isHelperResetLocked ? 'locked' : 'unlocked',
    )
  }, [isHelperResetLocked])

  useEffect(() => {
    window.localStorage.setItem(
      HELPER_RESET_STALE_THRESHOLD_HOURS_STORAGE_KEY,
      String(helperResetStaleThresholdHours),
    )
  }, [helperResetStaleThresholdHours])

  useEffect(() => {
    window.localStorage.setItem(IMPORT_HINT_MODE_STORAGE_KEY, importHintMode)
  }, [importHintMode])

  useEffect(() => {
    window.localStorage.setItem(
      STATUS_SHORTCUT_LEGEND_STORAGE_KEY,
      showShortcutLegendInStatus ? 'visible' : 'hidden',
    )
  }, [showShortcutLegendInStatus])

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_SNAPSHOT_TOGGLES_STORAGE_KEY,
      isImportSnapshotTogglesExpanded ? 'expanded' : 'collapsed',
    )
  }, [isImportSnapshotTogglesExpanded])

  useEffect(() => {
    window.localStorage.setItem(STATUS_SHORTCUT_LEGEND_ORDER_STORAGE_KEY, shortcutLegendOrder)
  }, [shortcutLegendOrder])

  useEffect(() => {
    window.localStorage.setItem(STATUS_SHORTCUT_LEGEND_DENSITY_STORAGE_KEY, shortcutLegendDensity)
  }, [shortcutLegendDensity])

  const filteredHistory =
    historyFilter === 'all'
      ? quickActionHistory
      : quickActionHistory.filter((entry) => entry.status === historyFilter)

  const statusLegendShortcuts = useMemo<ShortcutLegendItem[]>(
    () =>
      shortcutLegendOrder === 'clear-first'
        ? [
            {
              label: 'Esc',
              title: 'Clear preset JSON input',
              inlineLabel: 'Esc=clear',
            },
            {
              label: 'Ctrl/Cmd+Enter',
              title: 'Run preset JSON import',
              inlineLabel: 'Ctrl/Cmd+Enter=import',
            },
            {
              label: '/',
              title: 'Toggle compact/detailed hints (empty input only)',
              inlineLabel: '/=mode',
            },
            {
              label: 'Alt+L',
              title: 'Toggle helper reset lock',
              inlineLabel: 'Alt+L=lock',
            },
          ]
        : [
            {
              label: 'Ctrl/Cmd+Enter',
              title: 'Run preset JSON import',
              inlineLabel: 'Ctrl/Cmd+Enter=import',
            },
            {
              label: 'Esc',
              title: 'Clear preset JSON input',
              inlineLabel: 'Esc=clear',
            },
            {
              label: '/',
              title: 'Toggle compact/detailed hints (empty input only)',
              inlineLabel: '/=mode',
            },
            {
              label: 'Alt+L',
              title: 'Toggle helper reset lock',
              inlineLabel: 'Alt+L=lock',
            },
          ],
    [shortcutLegendOrder],
  )

  const copyStatusShortcutLegend = useCallback(async () => {
    const payload = [
      'Status Shortcut Legend',
      `mode=${importHintMode}`,
      `order=${shortcutLegendOrder}`,
      `density=${shortcutLegendDensity}`,
      `legendVisible=${showShortcutLegendInStatus ? 'yes' : 'no'}`,
      `lockCounterResetAt=${helperLockCountersLastResetAt ?? 'never'}`,
      `lockToggleTotal=${helperResetLockToggleCount}`,
      `lockToggleTone=${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
      `lockToggleAlt+L=${helperResetLockSourceCounts['Alt+L']}`,
      `lockToggleControls=${helperResetLockSourceCounts.controls}`,
      `lockToggleSnapshot=${helperResetLockSourceCounts.snapshot}`,
      '[Legend]',
      ...statusLegendShortcuts.map((item) => `${item.label}\t${item.title}\t${item.inlineLabel}`),
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(payload)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'status legend copied',
        content: `Copied status shortcut legend to clipboard (lock: ${
          isHelperResetLocked ? 'locked' : 'unlocked'
        }).`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'status legend copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    helperLockCountersLastResetAt,
    helperResetLockSourceCounts,
    helperResetLockToggleCount,
    helperResetLockToggleToneClass,
    importHintMode,
    isHelperResetLocked,
    shortcutLegendDensity,
    shortcutLegendOrder,
    showShortcutLegendInStatus,
    statusLegendShortcuts,
  ])

  const copyHistoryToClipboard = useCallback(async () => {
    if (filteredHistory.length === 0) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'history copy skipped',
        content: 'No quick-action history entries available for current filter.',
        severity: 'warn',
      })
      return
    }

    const text = [
      '[LockTelemetry]',
      `filter=${historyFilter}`,
      `lockCounterResetAt=${helperLockCountersLastResetAt ?? 'never'}`,
      `lockToggleTotal=${helperResetLockToggleCount}`,
      `lockToggleAlt+L=${helperResetLockSourceCounts['Alt+L']}`,
      `lockToggleControls=${helperResetLockSourceCounts.controls}`,
      `lockToggleSnapshot=${helperResetLockSourceCounts.snapshot}`,
      '[Entries]',
      ...filteredHistory
        .slice(0, 10)
        .map((entry) => `${entry.method}\t${entry.status}\t${entry.durationMs ?? 0}ms`),
    ].join('\n')

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(text)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'history copied',
        content: `Copied ${Math.min(filteredHistory.length, 10)} history entries.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'history copy failed',
        content: 'Clipboard access failed or is unavailable.',
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    filteredHistory,
    helperLockCountersLastResetAt,
    helperResetLockSourceCounts,
    helperResetLockToggleCount,
    historyFilter,
  ])

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
              <button type="button" onClick={() => void exportPresetsJson()}>
                Export Presets JSON
              </button>
              <button type="button" onClick={importPresetsJson}>
                Import Presets JSON
              </button>
              <label>
                Import Mode
                <select
                  value={presetImportMode}
                  onChange={(event) => setPresetImportMode(event.target.value as PresetImportMode)}
                >
                  <option value="overwrite">overwrite</option>
                  <option value="merge">merge</option>
                </select>
              </label>
              <div className="import-mode-indicator" aria-label="Import Mode Badge">
                <span className={`import-mode-badge mode-${presetImportMode}`}>
                  {presetImportMode}
                </span>
              </div>
            </div>
            <label className="preset-import">
              Import Presets JSON
              <textarea
                value={presetImportInput}
                onChange={(event) => setPresetImportInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.altKey && event.key.toLowerCase() === 'l') {
                    event.preventDefault()
                    toggleHelperResetLock('Alt+L')
                    return
                  }
                  if (
                    event.key === '/' &&
                    !event.ctrlKey &&
                    !event.metaKey &&
                    presetImportInput.trim().length === 0
                  ) {
                    event.preventDefault()
                    setImportHintMode((current) => {
                      const next = current === 'detailed' ? 'compact' : 'detailed'
                      setHintModeLiveNote(`Hint mode set to ${next} via slash shortcut.`)
                      return next
                    })
                    return
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setPresetImportInput('')
                    return
                  }
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault()
                    importPresetsJson()
                  }
                }}
                placeholder='{"preset_name": { ... }}'
              />
            </label>
            <div className="preset-import-helper-controls">
              <button
                type="button"
                onClick={() =>
                  setIsImportHelperDiagnosticsExpanded((current) => !current)
                }
              >
                {isImportHelperDiagnosticsExpanded
                  ? 'Collapse Helper Diagnostics'
                  : 'Expand Helper Diagnostics'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setIsHelperResetBadgeSectionExpanded((current) => !current)
                }
              >
                {isHelperResetBadgeSectionExpanded
                  ? 'Hide Reset Badge Tools'
                  : 'Show Reset Badge Tools'}
              </button>
              {isHelperResetBadgeSectionExpanded && isHelperResetBadgeVisible ? (
                <span
                  className={`helper-reset-badge ${helperResetToneClass}`}
                  aria-label="Helper Reset Badge"
                >
                  last reset:{' '}
                  {helperDiagnosticsLastResetAt
                    ? formatTimestamp(helperDiagnosticsLastResetAt, helperResetTimestampFormat)
                    : 'never'}
                </span>
              ) : null}
              {isHelperResetBadgeSectionExpanded && isHelperResetBadgeVisible ? (
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={() => void copyHelperResetBadge()}
                >
                  Copy Reset Badge
                </button>
              ) : null}
            </div>
            {isImportHelperDiagnosticsExpanded && isImportHintVisible ? (
              <p className="preset-import-hint">
                {importHintMode === 'compact' ? (
                  <>
                    Shortcuts: <span className="hotkey-chip">Ctrl/Cmd+Enter</span> import ·{' '}
                    <span className="hotkey-chip">Esc</span> clear ·{' '}
                    <span
                      className="hotkey-chip"
                      title="Slash toggles hint mode only when import input is empty."
                    >
                      /
                    </span>{' '}
                    mode.
                  </>
                ) : (
                  <>
                    Shortcut: <span className="hotkey-chip">Ctrl/Cmd+Enter</span> to import,{' '}
                    <span className="hotkey-chip">Esc</span> to clear,{' '}
                    <span
                      className="hotkey-chip"
                      title="Slash toggles hint mode only when import input is empty."
                    >
                      /
                    </span>{' '}
                    to toggle mode. Import mode{' '}
                    <strong>{presetImportMode}</strong>{' '}
                    {presetImportMode === 'merge'
                      ? 'preserves existing conflicting presets.'
                      : 'overwrites conflicting presets.'}
                  </>
                )}
              </p>
            ) : null}
            <div className="sr-only" aria-live="polite">
              {hintModeLiveNote}
            </div>
            {isImportHelperDiagnosticsExpanded ? (
              <div className="preset-import-actions helper-diagnostics-actions">
                <button type="button" onClick={() => setIsImportHintVisible((current) => !current)}>
                  {isImportHintVisible ? 'Hide Hints' : 'Show Hints'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImportHintMode((current) => (current === 'detailed' ? 'compact' : 'detailed'))
                  }
                >
                  {importHintMode === 'detailed' ? 'Use Compact Hints' : 'Use Detailed Hints'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowShortcutLegendInStatus((current) => !current)}
                >
                  {showShortcutLegendInStatus ? 'Hide Legend in Status' : 'Show Legend in Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelperResetBadgeVisible((current) => !current)}
                >
                  {isHelperResetBadgeVisible ? 'Hide Reset Badge' : 'Show Reset Badge'}
                </button>
                <label>
                  Legend Order
                  <select
                    value={shortcutLegendOrder}
                    onChange={(event) => setShortcutLegendOrder(event.target.value as ShortcutLegendOrder)}
                  >
                    <option value="import-first">import-first</option>
                    <option value="clear-first">clear-first</option>
                  </select>
                </label>
                <label>
                  Legend Density
                  <select
                    value={shortcutLegendDensity}
                    onChange={(event) =>
                      setShortcutLegendDensity(event.target.value as ShortcutLegendDensity)
                    }
                  >
                    <option value="chips">chips</option>
                    <option value="inline">inline</option>
                  </select>
                </label>
                <button type="button" onClick={() => void copyImportShortcutCheatSheet()}>
                  Copy Shortcut Cheat Sheet
                </button>
              </div>
            ) : null}
            <div className="preset-import-actions">
              <button
                type="button"
                onClick={() => setPresetImportInput('')}
                disabled={presetImportInput.trim().length === 0}
              >
                Clear Import JSON
              </button>
              <button
                type="button"
                onClick={() => void copyPresetImportReport()}
                disabled={!presetImportReport}
              >
                Copy Import Report
              </button>
              <button
                type="button"
                onClick={() => void copyLastImportSummary()}
                disabled={!presetImportReport}
              >
                Copy Last Summary
              </button>
              <button type="button" onClick={clearPresetImportReport} disabled={!presetImportReport}>
                Clear Import Report
              </button>
              <button
                type="button"
                onClick={() => void copyPresetImportNames()}
                disabled={!presetImportReport}
              >
                Copy Full Names
              </button>
              <button
                type="button"
                onClick={() => setIsPresetImportReportExpanded((current) => !current)}
                disabled={!presetImportReport}
                aria-expanded={isPresetImportReportExpanded}
              >
                {presetImportReport && isPresetImportReportExpanded ? 'Collapse Report' : 'Expand Report'}
              </button>
            </div>
            <div className="preset-import-last-summary">
              {lastImportSummaryText}
            </div>
            {presetImportReport ? (
              <div className="preset-import-mini" aria-label="Import Report Summary Badges">
                <span className="import-summary-badge badge-accepted">
                  accepted:{presetImportReport.accepted.length}
                </span>
                <span className="import-summary-badge badge-rejected">
                  rejected:{presetImportReport.rejected.length}
                </span>
                <span className="import-summary-badge badge-created">
                  created:{presetImportReport.createdCount}
                </span>
                <span className="import-summary-badge badge-preserved">
                  preserved:{presetImportReport.preservedCount}
                </span>
                <span className="import-summary-badge badge-overwritten">
                  overwritten:{presetImportReport.overwrittenCount}
                </span>
              </div>
            ) : null}
            {presetImportReport && isPresetImportReportExpanded ? (
              <div className="preset-import-report">
                <div>
                  <strong>Last Import</strong>
                  <span>{presetImportReport.importedAt}</span>
                </div>
                <div>
                  <strong>Mode</strong>
                  <span className={`import-mode-badge mode-${presetImportReport.mode}`}>
                    {presetImportReport.mode}
                  </span>
                </div>
                <div>
                  <strong>Accepted</strong>
                  <span>{summarizeNames(presetImportReport.accepted)}</span>
                </div>
                <div>
                  <strong>Rejected</strong>
                  <span>{summarizeNames(presetImportReport.rejected)}</span>
                </div>
                <div>
                  <strong>Created</strong>
                  <span>{presetImportReport.createdCount}</span>
                </div>
                <div>
                  <strong>Preserved</strong>
                  <span>{presetImportReport.preservedCount}</span>
                </div>
                <div>
                  <strong>Overwritten</strong>
                  <span>{presetImportReport.overwrittenCount}</span>
                </div>
              </div>
            ) : null}
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
                <label className="history-filter">
                  History Filter
                  <select
                    value={historyFilter}
                    onChange={(event) => setHistoryFilter(event.target.value as HistoryFilter)}
                  >
                    <option value="all">all</option>
                    <option value="sent">sent</option>
                    <option value="ok">ok</option>
                    <option value="error">error</option>
                    <option value="debounced">debounced</option>
                    <option value="skipped">skipped</option>
                  </select>
                </label>
                <div className="history-tools">
                  <button
                    type="button"
                    onClick={() => void copyHistoryToClipboard()}
                    disabled={filteredHistory.length === 0}
                  >
                    Copy History
                  </button>
                </div>
                <div className="history-legend" aria-label="History Legend">
                  <span className="history-legend-title">Legend</span>
                  <span className="history-status status-ok">ok</span>
                  <span className="history-status status-error">error</span>
                  <span className="history-status status-debounced">debounced</span>
                  <span className="history-status status-skipped">skipped</span>
                  <span className="history-status status-sent">sent</span>
                </div>
                <div className="history-legend lock-source-legend" aria-label="Lock Toggle Source Legend">
                  <span className="history-legend-title">Lock Sources</span>
                  <span
                    className={`history-lock-source ${resolveLockCounterTone(
                      helperResetLockSourceCounts['Alt+L'],
                    )}`}
                  >
                    Alt+L:{helperResetLockSourceCounts['Alt+L']}
                  </span>
                  <span
                    className={`history-lock-source ${resolveLockCounterTone(
                      helperResetLockSourceCounts.controls,
                    )}`}
                  >
                    controls:{helperResetLockSourceCounts.controls}
                  </span>
                  <span
                    className={`history-lock-source ${resolveLockCounterTone(
                      helperResetLockSourceCounts.snapshot,
                    )}`}
                  >
                    snapshot:{helperResetLockSourceCounts.snapshot}
                  </span>
                </div>
                {filteredHistory.length === 0 ? (
                  <span className="history-empty">none</span>
                ) : (
                  <ul className="history-list">
                    {filteredHistory.slice(0, 8).map((entry) => (
                      <li key={entry.id}>
                        <span className="history-method">{entry.method}</span>
                        <span className={`history-status status-${entry.status}`}>{entry.status}</span>
                        <span className="history-duration">{entry.durationMs ?? 0}ms</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div>
              <dt>
                Preset Import Snapshot{' '}
                <span className="helper-lock-indicator">(lock:{isHelperResetLocked ? 'locked' : 'unlocked'})</span>
              </dt>
              <dd className="import-snapshot-badges">
                {presetImportReport ? (
                  <>
                    <span className={`import-mode-badge mode-${presetImportReport.mode}`}>
                      {presetImportReport.mode}
                    </span>
                    <span className="import-summary-badge badge-hint-mode">
                      hint:{importHintMode}
                    </span>
                    <span className="import-summary-badge badge-accepted">
                      accepted:{presetImportReport.accepted.length}
                    </span>
                    <span className="import-summary-badge badge-rejected">
                      rejected:{presetImportReport.rejected.length}
                    </span>
                  </>
                ) : (
                  <span className="lifecycle-badge">none</span>
                )}
                <span className="import-summary-badge badge-hint-mode">
                  diag:{helperDiagnosticsDisplayMode}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  resetAge:
                  {helperDiagnosticsLastResetAt
                    ? formatTimestamp(helperDiagnosticsLastResetAt, 'relative')
                    : 'never'}
                </span>
                <span
                  className={`import-summary-badge badge-hint-mode helper-reset-lock-badge ${
                    isHelperResetLocked ? 'lock-locked' : 'lock-unlocked'
                  }`}
                >
                  resetLock:{isHelperResetLocked ? 'locked' : 'unlocked'}
                </span>
                <span className={`import-summary-badge badge-hint-mode ${helperResetLockToggleToneClass}`}>
                  lockToggles:{helperResetLockToggleCount}
                </span>
                <span
                  className={`import-summary-badge badge-hint-mode ${resolveLockCounterTone(
                    helperResetLockSourceCounts['Alt+L'],
                  )}`}
                >
                  srcAlt+L:{helperResetLockSourceCounts['Alt+L']}
                </span>
                <span
                  className={`import-summary-badge badge-hint-mode ${resolveLockCounterTone(
                    helperResetLockSourceCounts.controls,
                  )}`}
                >
                  srcControls:{helperResetLockSourceCounts.controls}
                </span>
                <span
                  className={`import-summary-badge badge-hint-mode ${resolveLockCounterTone(
                    helperResetLockSourceCounts.snapshot,
                  )}`}
                >
                  srcSnapshot:{helperResetLockSourceCounts.snapshot}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  lockCounterReset:
                  {helperLockCountersLastResetAt
                    ? formatTimestamp(helperLockCountersLastResetAt, 'relative')
                    : 'never'}
                </span>
                <div className="import-snapshot-toggles" aria-label="Import Snapshot Toggles">
                  <span
                    className={`quick-toggle-lock-summary ${
                      isHelperResetLocked ? 'quick-lock-locked' : 'quick-lock-unlocked'
                    }`}
                    aria-label="Quick Toggle Lock Summary"
                    title={`Quick lock summary: reset lock is ${
                      isHelperResetLocked ? 'locked' : 'unlocked'
                    }.`}
                  >
                    quickLock:{isHelperResetLocked ? 'locked' : 'unlocked'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsImportSnapshotTogglesExpanded((current) => !current)}
                    title={
                      isImportSnapshotTogglesExpanded
                        ? `Quick toggles expanded; reset lock is ${
                            isHelperResetLocked ? 'locked' : 'unlocked'
                          }.`
                        : `Quick toggles collapsed; expand to access quick actions; reset lock is ${
                            isHelperResetLocked ? 'locked' : 'unlocked'
                          }.`
                    }
                  >
                    {isImportSnapshotTogglesExpanded ? 'Hide Quick Toggles' : 'Show Quick Toggles'}
                    <span className="quick-toggle-lock-state" aria-hidden="true">
                      {' '}
                      (lock:{isHelperResetLocked ? 'locked' : 'unlocked'})
                    </span>
                  </button>
                  {isImportSnapshotTogglesExpanded ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsImportHintVisible((current) => !current)}
                      >
                        {isImportHintVisible ? 'Quick Hide Hints' : 'Quick Show Hints'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowShortcutLegendInStatus((current) => !current)}
                      >
                        {showShortcutLegendInStatus ? 'Quick Hide Legend' : 'Quick Show Legend'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsHelperResetBadgeVisible((current) => !current)}
                      >
                        {isHelperResetBadgeVisible
                          ? 'Quick Hide Reset Badge'
                          : 'Quick Show Reset Badge'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleHelperResetLock('snapshot')}
                      >
                        {isHelperResetLocked ? 'Quick Unlock Reset' : 'Quick Lock Reset'}
                      </button>
                    </>
                  ) : null}
                </div>
              </dd>
            </div>
            <div>
              <dt>
                Helper Diagnostics{' '}
                <span className="helper-lock-indicator">(lock:{isHelperResetLocked ? 'locked' : 'unlocked'})</span>
              </dt>
              <dd className="import-snapshot-badges">
                <span className="import-summary-badge badge-hint-mode">
                  enabled:{Number(isImportHintVisible) + Number(showShortcutLegendInStatus)}/2
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  density:{shortcutLegendDensity}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  reset:
                  {helperDiagnosticsLastResetAt
                    ? formatTimestamp(helperDiagnosticsLastResetAt, helperResetTimestampFormat)
                    : 'never'}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  tone:{helperResetToneClass.replace('tone-', '')}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  staleAfter:{helperResetStaleThresholdHours}h
                </span>
                <span
                  className={`import-summary-badge badge-hint-mode helper-reset-lock-badge ${
                    isHelperResetLocked ? 'lock-locked' : 'lock-unlocked'
                  }`}
                >
                  lock:{isHelperResetLocked ? 'locked' : 'unlocked'}
                </span>
                <span className={`import-summary-badge badge-hint-mode ${helperResetLockToggleToneClass}`}>
                  diagLockToggles:{helperResetLockToggleCount}
                </span>
                <span className="import-summary-badge badge-hint-mode">
                  counterReset:
                  {helperLockCountersLastResetAt
                    ? formatTimestamp(helperLockCountersLastResetAt, 'relative')
                    : 'never'}
                </span>
                {helperDiagnosticsDisplayMode === 'verbose' ? (
                  <>
                    <span className="import-summary-badge badge-hint-mode">
                      expanded:{isImportHelperDiagnosticsExpanded ? 'yes' : 'no'}
                    </span>
                    <span className="import-summary-badge badge-hint-mode">
                      hintVisible:{isImportHintVisible ? 'yes' : 'no'}
                    </span>
                    <span className="import-summary-badge badge-hint-mode">
                      legendVisible:{showShortcutLegendInStatus ? 'yes' : 'no'}
                    </span>
                    <span className="import-summary-badge badge-hint-mode">
                      legendOrder:{shortcutLegendOrder}
                    </span>
                    <span className="import-summary-badge badge-hint-mode">
                      resetBadge:{isHelperResetBadgeVisible ? 'yes' : 'no'}
                    </span>
                  </>
                ) : null}
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={() =>
                    setHelperDiagnosticsDisplayMode((current) =>
                      current === 'compact' ? 'verbose' : 'compact',
                    )
                  }
                >
                  {helperDiagnosticsDisplayMode === 'compact'
                    ? 'Use Verbose Diagnostics'
                    : 'Use Compact Diagnostics'}
                </button>
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={() => void copyHelperDiagnosticsSummary()}
                >
                  Copy Helper Summary
                </button>
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={resetHelperDiagnosticsPreferences}
                  disabled={isHelperResetLocked}
                  title={
                    isHelperResetLocked
                      ? 'Unlock reset controls to enable.'
                      : 'Reset helper diagnostics preferences to defaults.'
                  }
                >
                  Reset Helper Prefs
                </button>
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={() => toggleHelperResetLock('controls')}
                >
                  {isHelperResetLocked ? 'Unlock Reset' : 'Lock Reset'}
                </button>
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={resetHelperLockCounters}
                  disabled={helperResetLockToggleCount === 0}
                  title={
                    helperResetLockToggleCount === 0
                      ? 'No lock toggles recorded yet.'
                      : 'Clear helper reset lock toggle counters.'
                  }
                >
                  Reset Lock Counters
                </button>
                <label className="helper-reset-format">
                  Reset TS
                  <select
                    value={helperResetTimestampFormat}
                    onChange={(event) =>
                      setHelperResetTimestampFormat(event.target.value as TimestampFormat)
                    }
                  >
                    <option value="absolute">absolute</option>
                    <option value="relative">relative</option>
                  </select>
                </label>
                <label className="helper-reset-format">
                  Stale After
                  <select
                    value={String(helperResetStaleThresholdHours)}
                    onChange={(event) =>
                      setHelperResetStaleThresholdHours(Number.parseInt(event.target.value, 10))
                    }
                  >
                    <option value="24">24h</option>
                    <option value="72">72h</option>
                  </select>
                </label>
              </dd>
            </div>
            {showShortcutLegendInStatus ? (
              <div>
                <dt>
                  Import Shortcut Legend <span className="legend-mode-indicator">({importHintMode})</span>
                </dt>
                <dd className="import-snapshot-badges status-legend-hotkeys">
                  {shortcutLegendDensity === 'chips' ? (
                    statusLegendShortcuts.map((shortcut) => (
                      <span key={shortcut.label} className="hotkey-chip" title={shortcut.title}>
                        {shortcut.label}
                      </span>
                    ))
                  ) : (
                    <span className="status-legend-inline">
                      {statusLegendShortcuts.map((shortcut, index) => (
                        <span key={shortcut.label} title={shortcut.title}>
                          {index > 0 ? ' · ' : ''}
                          {shortcut.inlineLabel}
                        </span>
                      ))}
                    </span>
                  )}
                  <button
                    type="button"
                    className="summary-copy-button"
                    onClick={() => void copyStatusShortcutLegend()}
                  >
                    Copy Status Legend
                  </button>
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Quick Action Timestamps</dt>
              <dd className="timestamp-grid">
                <label className="timestamp-format">
                  Timestamp Format
                  <select
                    value={timestampFormat}
                    onChange={(event) => setTimestampFormat(event.target.value as TimestampFormat)}
                  >
                    <option value="absolute">absolute</option>
                    <option value="relative">relative</option>
                  </select>
                </label>
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
                            <span>{formatTimestamp(ts, timestampFormat)}</span>
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
                            <span>{formatTimestamp(ts, timestampFormat)}</span>
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
