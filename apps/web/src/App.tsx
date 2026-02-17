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

type BlockRenderKind =
  | 'Markdown'
  | 'SystemStatus'
  | 'TradeProposal'
  | 'TradeExecution'
  | 'RiskAlert'
  | 'BacktestReport'
  | 'RawPayload'

type FeedLifecycleBadge = {
  id: string
  action: string
  subscriptionId?: string
}

type TradeControlBadge = {
  id: string
  action: 'canceled' | 'closed'
  status?: string
}

type RiskAlertBadge = {
  id: string
  kind: string
  status?: string
}

type MarketOverlayAnnotationKind = 'trade' | 'risk' | 'feed'
type MarketOverlayAnnotationTone = 'neutral' | 'warning' | 'positive'
type MarketOverlayAnnotation = {
  id: string
  kind: MarketOverlayAnnotationKind
  label: string
  tone: MarketOverlayAnnotationTone
  timestamp: number
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
type RiskEmergencyAction = 'pause_trading' | 'cancel_all' | 'close_all' | 'disable_live'
type MarketOverlayMode = 'price-only' | 'with-trades' | 'with-risk'
type MarketOverlayChartRuntime = 'loading' | 'ready' | 'fallback' | 'error'
type MarketOverlayChartLens = 'price-only' | 'price-and-trend' | 'diagnostics'
type MarketOverlayMarkerFocus = 'all' | 'trade' | 'risk' | 'feed'
type MarketOverlayMarkerWindow = 3 | 5 | 8
type MarketOverlayMarkerAgeFilter = 'all' | 'last-60s' | 'last-300s'
type MarketOverlayMarkerBucket = 'none' | '30s' | '60s'
type MarketOverlayBucketScope = 'all-buckets' | 'latest-bucket'
type MarketOverlayTimelineOrder = 'newest-first' | 'oldest-first'
type MarketOverlayChartPoint = { time: number; value: number }
type MarketOverlayChartMarker = {
  time: number
  position: 'aboveBar' | 'belowBar' | 'inBar'
  color: string
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown'
  text: string
}
type MarketOverlayChartSeries = {
  setData: (data: MarketOverlayChartPoint[]) => void
  setMarkers?: (markers: MarketOverlayChartMarker[]) => void
}
type MarketOverlayTimelineAnnotation = MarketOverlayAnnotation & { time: number }
type MarketOverlayChart = {
  addLineSeries?: (options: { color: string; lineWidth: number }) => MarketOverlayChartSeries
  addSeries?: (
    seriesDefinition: unknown,
    options: { color: string; lineWidth: number },
  ) => MarketOverlayChartSeries
  applyOptions: (options: { width?: number; height?: number }) => void
  remove: () => void
  timeScale: () => {
    fitContent: () => void
  }
}
type LightweightChartsModule = {
  createChart: (container: HTMLElement, options: Record<string, unknown>) => MarketOverlayChart
  LineSeries?: unknown
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
  managedDeviceNotifyMessage: string
  riskEmergencyAction: RiskEmergencyAction
  riskEmergencyReason: string
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
const BLOCK_TELEMETRY_VISIBILITY_STORAGE_KEY = 'quick-action-block-telemetry-visibility-v1'
const MARKET_OVERLAY_MODE_STORAGE_KEY = 'quick-action-market-overlay-mode-v1'
const MARKET_OVERLAY_CHART_LENS_STORAGE_KEY = 'quick-action-market-overlay-chart-lens-v1'
const MARKET_OVERLAY_MARKER_FOCUS_STORAGE_KEY = 'quick-action-market-overlay-marker-focus-v1'
const MARKET_OVERLAY_MARKER_WINDOW_STORAGE_KEY = 'quick-action-market-overlay-marker-window-v1'
const MARKET_OVERLAY_MARKER_AGE_FILTER_STORAGE_KEY = 'quick-action-market-overlay-marker-age-filter-v1'
const MARKET_OVERLAY_MARKER_BUCKET_STORAGE_KEY = 'quick-action-market-overlay-marker-bucket-v1'
const MARKET_OVERLAY_BUCKET_SCOPE_STORAGE_KEY = 'quick-action-market-overlay-bucket-scope-v1'
const MARKET_OVERLAY_TIMELINE_ORDER_STORAGE_KEY = 'quick-action-market-overlay-timeline-order-v1'
const MAX_IMPORT_REPORT_NAMES = 6
const FEED_CANDLE_FETCH_LIMIT = 50
const DEVICE_NOTIFY_TEST_MESSAGE = 'Dashboard test notification'
const DEFAULT_RISK_EMERGENCY_REASON = 'dashboard emergency stop trigger'
const DEFAULT_AGENT_ID = 'agent_eth_5m'
const DEFAULT_AGENT_LABEL = 'ETH Momentum Agent'
const DEFAULT_AGENT_SOUL_TEMPLATE =
  '# SOUL\nI am concise and risk-first. I explain decisions in clear, short blocks.'
const DEFAULT_AGENT_MANUAL_TEMPLATE =
  '# TRADING MANUAL\nOnly trade with stop loss and defined invalidation.'
const TRADE_ORDER_REFERENCE_ID = 'order_demo_1'
const TRADE_POSITION_REFERENCE_ID = 'position_demo_1'
const COPYTRADE_PREVIEW_SIGNAL_ID = 'sig_dashboard_preview'
const COPYTRADE_PREVIEW_STRATEGY_ID = 'strat_dashboard_1'
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
  managedDeviceNotifyMessage: DEVICE_NOTIFY_TEST_MESSAGE,
  riskEmergencyAction: 'pause_trading',
  riskEmergencyReason: DEFAULT_RISK_EMERGENCY_REASON,
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

const readBlockTelemetryVisibilityFromStorage = (): boolean => {
  if (typeof window === 'undefined') {
    return true
  }
  return window.localStorage.getItem(BLOCK_TELEMETRY_VISIBILITY_STORAGE_KEY) !== 'hidden'
}

const readMarketOverlayModeFromStorage = (): MarketOverlayMode => {
  if (typeof window === 'undefined') {
    return 'price-only'
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_MODE_STORAGE_KEY)
  if (raw === 'with-trades' || raw === 'with-risk') {
    return raw
  }
  return 'price-only'
}

const readMarketOverlayChartLensFromStorage = (): MarketOverlayChartLens => {
  if (typeof window === 'undefined') {
    return 'price-only'
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_CHART_LENS_STORAGE_KEY)
  if (raw === 'price-and-trend' || raw === 'diagnostics') {
    return raw
  }
  return 'price-only'
}

const readMarketOverlayMarkerFocusFromStorage = (): MarketOverlayMarkerFocus => {
  if (typeof window === 'undefined') {
    return 'all'
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_MARKER_FOCUS_STORAGE_KEY)
  if (raw === 'trade' || raw === 'risk' || raw === 'feed') {
    return raw
  }
  return 'all'
}

const readMarketOverlayMarkerWindowFromStorage = (): MarketOverlayMarkerWindow => {
  if (typeof window === 'undefined') {
    return 5
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_MARKER_WINDOW_STORAGE_KEY)
  if (raw === '3' || raw === '8') {
    return Number.parseInt(raw, 10) as MarketOverlayMarkerWindow
  }
  return 5
}

const readMarketOverlayMarkerAgeFilterFromStorage = (): MarketOverlayMarkerAgeFilter => {
  if (typeof window === 'undefined') {
    return 'all'
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_MARKER_AGE_FILTER_STORAGE_KEY)
  if (raw === 'last-60s' || raw === 'last-300s') {
    return raw
  }
  return 'all'
}

const readMarketOverlayMarkerBucketFromStorage = (): MarketOverlayMarkerBucket => {
  if (typeof window === 'undefined') {
    return 'none'
  }
  const raw = window.localStorage.getItem(MARKET_OVERLAY_MARKER_BUCKET_STORAGE_KEY)
  if (raw === '30s' || raw === '60s') {
    return raw
  }
  return 'none'
}

const readMarketOverlayBucketScopeFromStorage = (): MarketOverlayBucketScope => {
  if (typeof window === 'undefined') {
    return 'all-buckets'
  }
  return window.localStorage.getItem(MARKET_OVERLAY_BUCKET_SCOPE_STORAGE_KEY) === 'latest-bucket'
    ? 'latest-bucket'
    : 'all-buckets'
}

const readMarketOverlayTimelineOrderFromStorage = (): MarketOverlayTimelineOrder => {
  if (typeof window === 'undefined') {
    return 'newest-first'
  }
  return window.localStorage.getItem(MARKET_OVERLAY_TIMELINE_ORDER_STORAGE_KEY) === 'oldest-first'
    ? 'oldest-first'
    : 'newest-first'
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
  const riskEmergencyActionRaw = pick('riskEmergencyAction')
  const riskEmergencyAction: RiskEmergencyAction =
    riskEmergencyActionRaw === 'cancel_all' ||
    riskEmergencyActionRaw === 'close_all' ||
    riskEmergencyActionRaw === 'disable_live'
      ? riskEmergencyActionRaw
      : 'pause_trading'
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
    managedDeviceNotifyMessage: pick('managedDeviceNotifyMessage'),
    riskEmergencyAction,
    riskEmergencyReason: pick('riskEmergencyReason'),
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

const formatElapsedMs = (elapsedMs: number): string => {
  const totalSeconds = Math.max(Math.floor(elapsedMs / 1000), 0)
  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  }
  const minutes = Math.floor(totalSeconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h`
  }
  const days = Math.floor(hours / 24)
  return `${days}d`
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

const BLOCK_TELEMETRY_SEGMENT_MARKER = '\n\n[LockTelemetry]'

const stripBlockTelemetrySegment = (content: string): string => {
  const markerIndex = content.indexOf(BLOCK_TELEMETRY_SEGMENT_MARKER)
  if (markerIndex === -1) {
    return content
  }
  return content.slice(0, markerIndex)
}

const parseStructuredBlockPayload = (content: string): Record<string, unknown> | null => {
  const normalized = stripBlockTelemetrySegment(content).trim()
  if (!normalized.startsWith('{')) {
    return null
  }
  try {
    const parsed = JSON.parse(normalized)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
}

const resolveBlockRenderKind = (block: BlockItem): BlockRenderKind => {
  const normalizedContent = stripBlockTelemetrySegment(block.content).trim()
  if (/^#{1,6}\s+\S/m.test(normalizedContent)) {
    return 'Markdown'
  }

  const payload = parseStructuredBlockPayload(block.content)
  if (!payload) {
    return 'SystemStatus'
  }

  if (
    block.title === 'event.risk.alert' ||
    ('decision' in payload &&
      payload.decision &&
      typeof payload.decision === 'object' &&
      'violations' in (payload.decision as Record<string, unknown>))
  ) {
    return 'RiskAlert'
  }

  if (
    block.title === 'event.trade.executed' ||
    ('execution' in payload &&
      payload.execution &&
      typeof payload.execution === 'object' &&
      'status' in (payload.execution as Record<string, unknown>))
  ) {
    return 'TradeExecution'
  }

  if (
    block.title === 'event.risk.preview' ||
    ('allowed' in payload && 'violations' in payload)
  ) {
    return 'TradeProposal'
  }

  if (
    block.title === 'event.backtests.report' ||
    ('metrics' in payload && ('equityCurve' in payload || 'trades' in payload))
  ) {
    return 'BacktestReport'
  }

  if (
    block.title === 'gateway.status response' ||
    ('protocolVersion' in payload && 'server' in payload)
  ) {
    return 'SystemStatus'
  }

  return 'RawPayload'
}

function App() {
  const wsRef = useRef<WebSocket | null>(null)
  const pendingRequestsRef = useRef<Map<string, (value: GatewayResponse) => void>>(new Map())
  const requestGuardsRef = useRef<Map<string, number>>(new Map())
  const requestCounter = useRef(0)
  const blockIdCounterRef = useRef(0)
  const marketOverlayChartContainerRef = useRef<HTMLDivElement | null>(null)
  const marketOverlayChartRef = useRef<MarketOverlayChart | null>(null)
  const marketOverlayPriceSeriesRef = useRef<MarketOverlayChartSeries | null>(null)
  const marketOverlayTrendSeriesRef = useRef<MarketOverlayChartSeries | null>(null)
  const marketOverlayBaselineSeriesRef = useRef<MarketOverlayChartSeries | null>(null)

  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting')
  const [protocolVersion, setProtocolVersion] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [accountCount, setAccountCount] = useState<number | null>(null)
  const [agentCount, setAgentCount] = useState<number | null>(null)
  const [managedAccountId, setManagedAccountId] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedAccountId,
  )
  const [managedAgentId, setManagedAgentId] = useState<string>(DEFAULT_AGENT_ID)
  const [managedAgentLabel, setManagedAgentLabel] = useState<string>(DEFAULT_AGENT_LABEL)
  const [onboardingChecklist, setOnboardingChecklist] = useState<{
    account: boolean
    agent: boolean
    feed: boolean
  }>({
    account: false,
    agent: false,
    feed: false,
  })
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
  const [managedDeviceNotifyMessage, setManagedDeviceNotifyMessage] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.managedDeviceNotifyMessage,
  )
  const [riskEmergencyAction, setRiskEmergencyAction] = useState<RiskEmergencyAction>(
    DEFAULT_PRESET_TEMPLATE.riskEmergencyAction,
  )
  const [riskEmergencyReason, setRiskEmergencyReason] = useState<string>(
    DEFAULT_PRESET_TEMPLATE.riskEmergencyReason,
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
  const [isBlockTelemetryVisible, setIsBlockTelemetryVisible] = useState<boolean>(
    readBlockTelemetryVisibilityFromStorage,
  )
  const [availablePresetNames, setAvailablePresetNames] = useState<string[]>(() =>
    Object.keys(readPresetStoreFromStorage()).sort(),
  )
  const [feedCount, setFeedCount] = useState<number | null>(null)
  const [marketplaceSignalCount, setMarketplaceSignalCount] = useState<number | null>(null)
  const [copytradePreviewSummary, setCopytradePreviewSummary] = useState<string>('none')
  const [feedTopic, setFeedTopic] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedTopic)
  const [feedSymbol, setFeedSymbol] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedSymbol)
  const [feedTimeframe, setFeedTimeframe] = useState<string>(DEFAULT_PRESET_TEMPLATE.feedTimeframe)
  const [lastFetchedCandlesCount, setLastFetchedCandlesCount] = useState<number | null>(null)
  const [marketOverlayRecentCloses, setMarketOverlayRecentCloses] = useState<number[]>([])
  const [marketOverlayAnnotations, setMarketOverlayAnnotations] = useState<MarketOverlayAnnotation[]>(
    [],
  )
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null)
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null)
  const [feedLifecycle, setFeedLifecycle] = useState<FeedLifecycleBadge[]>([])
  const [tradeControlEvents, setTradeControlEvents] = useState<TradeControlBadge[]>([])
  const [riskAlerts, setRiskAlerts] = useState<RiskAlertBadge[]>([])
  const [riskEmergencyStopActive, setRiskEmergencyStopActive] = useState<boolean | null>(null)
  const [riskLastEmergencyAction, setRiskLastEmergencyAction] = useState<string | null>(null)
  const [riskLastEmergencyReason, setRiskLastEmergencyReason] = useState<string | null>(null)
  const [riskLastEmergencyUpdatedAt, setRiskLastEmergencyUpdatedAt] = useState<string | null>(null)
  const [riskEmergencyActionCounts, setRiskEmergencyActionCounts] = useState<
    Record<'pause_trading' | 'cancel_all' | 'close_all' | 'disable_live', number>
  >({
    pause_trading: 0,
    cancel_all: 0,
    close_all: 0,
    disable_live: 0,
  })
  const [quickActionHistory, setQuickActionHistory] = useState<QuickActionHistory[]>([])
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>(readHistoryFilterFromStorage)
  const [timestampFormat, setTimestampFormat] = useState<TimestampFormat>(
    readTimestampFormatFromStorage,
  )
  const [lastSuccessByMethod, setLastSuccessByMethod] = useState<Record<string, string>>({})
  const [lastErrorByMethod, setLastErrorByMethod] = useState<Record<string, string>>({})
  const [blocks, setBlocks] = useState<BlockItem[]>([])
  const [marketOverlayMode, setMarketOverlayMode] = useState<MarketOverlayMode>(
    readMarketOverlayModeFromStorage,
  )
  const [marketOverlayChartLens, setMarketOverlayChartLens] = useState<MarketOverlayChartLens>(
    readMarketOverlayChartLensFromStorage,
  )
  const [marketOverlayMarkerFocus, setMarketOverlayMarkerFocus] = useState<MarketOverlayMarkerFocus>(
    readMarketOverlayMarkerFocusFromStorage,
  )
  const [marketOverlayMarkerWindow, setMarketOverlayMarkerWindow] =
    useState<MarketOverlayMarkerWindow>(readMarketOverlayMarkerWindowFromStorage)
  const [marketOverlayMarkerAgeFilter, setMarketOverlayMarkerAgeFilter] =
    useState<MarketOverlayMarkerAgeFilter>(readMarketOverlayMarkerAgeFilterFromStorage)
  const [marketOverlayMarkerBucket, setMarketOverlayMarkerBucket] = useState<MarketOverlayMarkerBucket>(
    readMarketOverlayMarkerBucketFromStorage,
  )
  const [marketOverlayBucketScope, setMarketOverlayBucketScope] = useState<MarketOverlayBucketScope>(
    readMarketOverlayBucketScopeFromStorage,
  )
  const [marketOverlayTimelineOrder, setMarketOverlayTimelineOrder] = useState<MarketOverlayTimelineOrder>(
    readMarketOverlayTimelineOrderFromStorage,
  )
  const [marketOverlaySelectedMarkerId, setMarketOverlaySelectedMarkerId] = useState<string | null>(
    null,
  )
  const [marketOverlaySnapshotAt, setMarketOverlaySnapshotAt] = useState<string | null>(null)
  const [marketOverlaySnapshotSummary, setMarketOverlaySnapshotSummary] = useState<string>('none')
  const [marketOverlayChartRuntime, setMarketOverlayChartRuntime] =
    useState<MarketOverlayChartRuntime>('loading')

  const onboardingCompletedCount = useMemo(
    () =>
      Number(onboardingChecklist.account) +
      Number(onboardingChecklist.agent) +
      Number(onboardingChecklist.feed),
    [onboardingChecklist],
  )
  const marketOverlayLiveSummary = useMemo(() => {
    const candles = lastFetchedCandlesCount ?? 0
    const tradeEvents = tradeControlEvents.length
    const alerts = riskAlerts.length
    if (marketOverlayMode === 'price-only') {
      return `candles:${candles}`
    }
    if (marketOverlayMode === 'with-trades') {
      return `candles:${candles} · tradeEvents:${tradeEvents}`
    }
    return `candles:${candles} · tradeEvents:${tradeEvents} · riskAlerts:${alerts}`
  }, [lastFetchedCandlesCount, marketOverlayMode, riskAlerts.length, tradeControlEvents.length])
  const marketOverlayWindowSummary = useMemo(() => {
    const closesSummary =
      marketOverlayRecentCloses.length > 0
        ? `closes:${marketOverlayRecentCloses.join(',')}`
        : 'closes:none'
    if (marketOverlayMode === 'price-only') {
      return closesSummary
    }
    if (marketOverlayMode === 'with-trades') {
      return `${closesSummary} · trades:${tradeControlEvents.length}`
    }
    return `${closesSummary} · trades:${tradeControlEvents.length} · risk:${riskAlerts.length} · feed:${feedLifecycle.length}`
  }, [
    feedLifecycle.length,
    marketOverlayMode,
    marketOverlayRecentCloses,
    riskAlerts.length,
    tradeControlEvents.length,
  ])
  const marketOverlayTrend = useMemo(() => {
    if (marketOverlayRecentCloses.length < 2) {
      return {
        label: 'neutral',
        className: 'overlay-trend-neutral',
      }
    }

    const firstClose = marketOverlayRecentCloses[0]
    const lastClose = marketOverlayRecentCloses[marketOverlayRecentCloses.length - 1]
    const delta = lastClose - firstClose
    if (Math.abs(delta) < 0.000001) {
      return {
        label: 'flat (±0.00)',
        className: 'overlay-trend-flat',
      }
    }

    return {
      label: `${delta > 0 ? 'up' : 'down'} (${delta > 0 ? '+' : ''}${delta.toFixed(2)})`,
      className: delta > 0 ? 'overlay-trend-up' : 'overlay-trend-down',
    }
  }, [marketOverlayRecentCloses])
  const marketOverlayVolatility = useMemo(() => {
    if (marketOverlayRecentCloses.length < 2) {
      return {
        label: 'n/a',
        summary: 'n/a',
        className: 'overlay-volatility-none',
      }
    }

    const high = Math.max(...marketOverlayRecentCloses)
    const low = Math.min(...marketOverlayRecentCloses)
    const range = high - low
    const band = range < 0.5 ? 'low' : range < 2 ? 'moderate' : 'high'
    const className =
      band === 'low'
        ? 'overlay-volatility-low'
        : band === 'moderate'
          ? 'overlay-volatility-moderate'
          : 'overlay-volatility-high'

    return {
      label: `range:${range.toFixed(2)} · ${band}`,
      summary: range.toFixed(2),
      className,
    }
  }, [marketOverlayRecentCloses])
  const marketOverlayPulse = useMemo(() => {
    const score = tradeControlEvents.length * 2 + riskAlerts.length * 3 + feedLifecycle.length
    if (score === 0) {
      return {
        label: 'quiet (0)',
        summary: 'quiet(0)',
        className: 'overlay-pulse-quiet',
      }
    }
    if (score < 5) {
      return {
        label: `active (${score})`,
        summary: `active(${score})`,
        className: 'overlay-pulse-active',
      }
    }
    return {
      label: `intense (${score})`,
      summary: `intense(${score})`,
      className: 'overlay-pulse-intense',
    }
  }, [feedLifecycle.length, riskAlerts.length, tradeControlEvents.length])
  const marketOverlayRegime = useMemo(() => {
    const trendClass = marketOverlayTrend.className
    const pulseClass = marketOverlayPulse.className
    const volatilityClass = marketOverlayVolatility.className

    const isTrendUp = trendClass === 'overlay-trend-up'
    const isTrendDown = trendClass === 'overlay-trend-down'
    const isTrendNeutral = trendClass === 'overlay-trend-neutral'
    const isPulseIntense = pulseClass === 'overlay-pulse-intense'
    const isPulseQuiet = pulseClass === 'overlay-pulse-quiet'
    const hasVolatilitySignal = volatilityClass !== 'overlay-volatility-none'

    if (isPulseIntense && isTrendUp && hasVolatilitySignal) {
      return {
        label: 'risk-on',
        summary: 'risk_on',
        className: 'overlay-regime-risk-on',
      }
    }
    if (isPulseIntense && isTrendDown) {
      return {
        label: 'risk-off',
        summary: 'risk_off',
        className: 'overlay-regime-risk-off',
      }
    }
    if (isPulseQuiet && isTrendNeutral) {
      return {
        label: 'observe',
        summary: 'observe',
        className: 'overlay-regime-observe',
      }
    }
    return {
      label: 'momentum-watch',
      summary: 'momentum_watch',
      className: 'overlay-regime-watch',
    }
  }, [marketOverlayPulse.className, marketOverlayTrend.className, marketOverlayVolatility.className])
  const marketOverlayChartPoints = useMemo(
    () => marketOverlayRecentCloses.map((value, index) => ({ time: index + 1, value })),
    [marketOverlayRecentCloses],
  )
  const marketOverlayTrendLinePoints = useMemo(() => {
    if (marketOverlayRecentCloses.length < 3) {
      return [] as MarketOverlayChartPoint[]
    }
    return marketOverlayRecentCloses
      .map((_, index, closes) => {
        if (index < 2) {
          return null
        }
        const window = closes.slice(index - 2, index + 1)
        const average = window.reduce((sum, value) => sum + value, 0) / window.length
        return {
          time: index + 1,
          value: average,
        }
      })
      .filter((point): point is MarketOverlayChartPoint => point !== null)
  }, [marketOverlayRecentCloses])
  const marketOverlayAverageClose = useMemo(() => {
    if (marketOverlayRecentCloses.length === 0) {
      return null
    }
    return (
      marketOverlayRecentCloses.reduce((sum, value) => sum + value, 0) / marketOverlayRecentCloses.length
    )
  }, [marketOverlayRecentCloses])
  const marketOverlayBaselinePoints = useMemo(() => {
    if (marketOverlayAverageClose === null) {
      return [] as MarketOverlayChartPoint[]
    }
    return marketOverlayChartPoints.map((point) => ({
      time: point.time,
      value: marketOverlayAverageClose,
    }))
  }, [marketOverlayAverageClose, marketOverlayChartPoints])
  const marketOverlayChartSummary = useMemo(() => {
    if (marketOverlayChartPoints.length === 0) {
      return `points:none · lens:${marketOverlayChartLens}`
    }
    const latest = marketOverlayChartPoints[marketOverlayChartPoints.length - 1]
    if (marketOverlayChartLens === 'price-only') {
      return `points:${marketOverlayChartPoints.length} · last:${latest.value.toFixed(2)} · lens:price-only`
    }
    if (marketOverlayChartLens === 'price-and-trend') {
      return `points:${marketOverlayChartPoints.length} · last:${latest.value.toFixed(2)} · trendPoints:${marketOverlayTrendLinePoints.length} · lens:price-and-trend`
    }
    return `points:${marketOverlayChartPoints.length} · last:${latest.value.toFixed(2)} · trendPoints:${marketOverlayTrendLinePoints.length} · baseline:${(marketOverlayAverageClose ?? 0).toFixed(2)} · lens:diagnostics`
  }, [
    marketOverlayAverageClose,
    marketOverlayChartLens,
    marketOverlayChartPoints,
    marketOverlayTrendLinePoints.length,
  ])
  const marketOverlayAnnotationSummary = useMemo(() => {
    const tradeCount = marketOverlayAnnotations.filter((annotation) => annotation.kind === 'trade').length
    const riskCount = marketOverlayAnnotations.filter((annotation) => annotation.kind === 'risk').length
    const feedCount = marketOverlayAnnotations.filter((annotation) => annotation.kind === 'feed').length
    const latest = marketOverlayAnnotations[0]
    return {
      tradeCount,
      riskCount,
      feedCount,
      totalCount: marketOverlayAnnotations.length,
      latestLabel: latest ? `${latest.kind}:${latest.label}` : 'none',
    }
  }, [marketOverlayAnnotations])
  const marketOverlayFilteredAnnotations = useMemo(
    () =>
      marketOverlayMarkerFocus === 'all'
        ? marketOverlayAnnotations
        : marketOverlayAnnotations.filter((annotation) => annotation.kind === marketOverlayMarkerFocus),
    [marketOverlayAnnotations, marketOverlayMarkerFocus],
  )
  const marketOverlayAgeFilteredAnnotations = useMemo(() => {
    if (marketOverlayMarkerAgeFilter === 'all') {
      return marketOverlayFilteredAnnotations
    }
    const maxAgeMs = marketOverlayMarkerAgeFilter === 'last-60s' ? 60_000 : 300_000
    const now = Date.now()
    return marketOverlayFilteredAnnotations.filter((annotation) => now - annotation.timestamp <= maxAgeMs)
  }, [marketOverlayFilteredAnnotations, marketOverlayMarkerAgeFilter])
  const marketOverlayVisibleAnnotations = useMemo(
    () => marketOverlayAgeFilteredAnnotations.slice(0, marketOverlayMarkerWindow),
    [marketOverlayAgeFilteredAnnotations, marketOverlayMarkerWindow],
  )
  const marketOverlayOrderedVisibleAnnotations = useMemo(
    () =>
      marketOverlayTimelineOrder === 'newest-first'
        ? marketOverlayVisibleAnnotations
        : marketOverlayVisibleAnnotations.slice().reverse(),
    [marketOverlayTimelineOrder, marketOverlayVisibleAnnotations],
  )
  const marketOverlayTimelineAnnotations = useMemo(() => {
    if (marketOverlayChartPoints.length === 0 || marketOverlayVisibleAnnotations.length === 0) {
      return [] as MarketOverlayTimelineAnnotation[]
    }
    const latestTime = marketOverlayChartPoints[marketOverlayChartPoints.length - 1].time
    const source = marketOverlayVisibleAnnotations.slice().reverse()
    return source.map((annotation, index) => {
      const offset = source.length - 1 - index
      return {
        ...annotation,
        time: Math.max(1, latestTime - offset),
      }
    })
  }, [marketOverlayChartPoints, marketOverlayVisibleAnnotations])
  const marketOverlayLatestBucketStart = useMemo(() => {
    if (marketOverlayMarkerBucket === 'none' || marketOverlayTimelineAnnotations.length === 0) {
      return null
    }
    const bucketSizeMs = marketOverlayMarkerBucket === '30s' ? 30_000 : 60_000
    return marketOverlayTimelineAnnotations.reduce((latest, annotation) => {
      const bucketStart = Math.floor(annotation.timestamp / bucketSizeMs) * bucketSizeMs
      return latest === null || bucketStart > latest ? bucketStart : latest
    }, null as number | null)
  }, [marketOverlayMarkerBucket, marketOverlayTimelineAnnotations])
  const marketOverlayScopedTimelineAnnotations = useMemo(() => {
    if (
      marketOverlayMarkerBucket === 'none' ||
      marketOverlayBucketScope === 'all-buckets' ||
      marketOverlayLatestBucketStart === null
    ) {
      return marketOverlayTimelineAnnotations
    }
    const bucketSizeMs = marketOverlayMarkerBucket === '30s' ? 30_000 : 60_000
    return marketOverlayTimelineAnnotations.filter(
      (annotation) =>
        Math.floor(annotation.timestamp / bucketSizeMs) * bucketSizeMs === marketOverlayLatestBucketStart,
    )
  }, [
    marketOverlayBucketScope,
    marketOverlayLatestBucketStart,
    marketOverlayMarkerBucket,
    marketOverlayTimelineAnnotations,
  ])
  const marketOverlayScopedVisibleAnnotations = useMemo(() => {
    if (marketOverlayScopedTimelineAnnotations.length === 0) {
      return [] as MarketOverlayAnnotation[]
    }
    const allowedIds = new Set(marketOverlayScopedTimelineAnnotations.map((annotation) => annotation.id))
    return marketOverlayOrderedVisibleAnnotations.filter((annotation) => allowedIds.has(annotation.id))
  }, [marketOverlayOrderedVisibleAnnotations, marketOverlayScopedTimelineAnnotations])
  const marketOverlayActiveTimelineAnnotation = useMemo(() => {
    if (marketOverlayScopedTimelineAnnotations.length === 0) {
      return null
    }
    return (
      marketOverlayScopedTimelineAnnotations.find(
        (annotation) => annotation.id === marketOverlaySelectedMarkerId,
      ) ?? marketOverlayScopedTimelineAnnotations[marketOverlayScopedTimelineAnnotations.length - 1]
    )
  }, [marketOverlayScopedTimelineAnnotations, marketOverlaySelectedMarkerId])
  const marketOverlayActiveTimelineIndex = useMemo(() => {
    if (!marketOverlayActiveTimelineAnnotation) {
      return -1
    }
    return marketOverlayScopedTimelineAnnotations.findIndex(
      (annotation) => annotation.id === marketOverlayActiveTimelineAnnotation.id,
    )
  }, [marketOverlayActiveTimelineAnnotation, marketOverlayScopedTimelineAnnotations])
  const marketOverlayMarkerNavigationLabel = useMemo(() => {
    if (!marketOverlayActiveTimelineAnnotation || marketOverlayActiveTimelineIndex < 0) {
      return `0/0 · selected:none`
    }
    return `${marketOverlayActiveTimelineIndex + 1}/${marketOverlayScopedTimelineAnnotations.length} · selected:${marketOverlayActiveTimelineAnnotation.kind}:${marketOverlayActiveTimelineAnnotation.label}`
  }, [
    marketOverlayActiveTimelineAnnotation,
    marketOverlayActiveTimelineIndex,
    marketOverlayScopedTimelineAnnotations.length,
  ])
  const canSelectPreviousMarketOverlayMarker = marketOverlayActiveTimelineIndex > 0
  const canSelectNextMarketOverlayMarker =
    marketOverlayActiveTimelineIndex >= 0 &&
    marketOverlayActiveTimelineIndex < marketOverlayScopedTimelineAnnotations.length - 1
  const canSelectOldestMarketOverlayMarker = canSelectPreviousMarketOverlayMarker
  const canSelectLatestMarketOverlayMarker = canSelectNextMarketOverlayMarker
  const marketOverlayMarkerDrilldown = useMemo(() => {
    const latest =
      marketOverlayScopedTimelineAnnotations[marketOverlayScopedTimelineAnnotations.length - 1] ?? null
    return {
      focus: marketOverlayMarkerFocus,
      ageFilter: marketOverlayMarkerAgeFilter,
      bucketScope: marketOverlayBucketScope,
      timelineOrder: marketOverlayTimelineOrder,
      window: marketOverlayMarkerWindow,
      visibleCount: marketOverlayScopedVisibleAnnotations.length,
      latestLabel: latest ? `${latest.kind}:${latest.label}` : 'none',
    }
  }, [
    marketOverlayBucketScope,
    marketOverlayMarkerAgeFilter,
    marketOverlayMarkerFocus,
    marketOverlayScopedTimelineAnnotations,
    marketOverlayTimelineOrder,
    marketOverlayMarkerWindow,
    marketOverlayScopedVisibleAnnotations,
  ])
  const marketOverlayCorrelationHint = useMemo(() => {
    if (!marketOverlayActiveTimelineAnnotation || marketOverlayChartPoints.length === 0) {
      return 'none'
    }
    const point =
      marketOverlayChartPoints.find((candidate) => candidate.time === marketOverlayActiveTimelineAnnotation.time) ??
      marketOverlayChartPoints[marketOverlayChartPoints.length - 1]
    return `${marketOverlayActiveTimelineAnnotation.kind}:${marketOverlayActiveTimelineAnnotation.label}@${point.value.toFixed(2)}(t${point.time})`
  }, [marketOverlayActiveTimelineAnnotation, marketOverlayChartPoints])
  const marketOverlayMarkerDrilldownDetail = useMemo(() => {
    if (!marketOverlayActiveTimelineAnnotation || marketOverlayChartPoints.length === 0) {
      return 'none'
    }
    const point =
      marketOverlayChartPoints.find((candidate) => candidate.time === marketOverlayActiveTimelineAnnotation.time) ??
      marketOverlayChartPoints[marketOverlayChartPoints.length - 1]
    const baseline = marketOverlayAverageClose ?? point.value
    const deltaFromAverage = point.value - baseline
    const deltaFromAveragePct = baseline === 0 ? 0 : (deltaFromAverage / baseline) * 100
    const latestPoint = marketOverlayChartPoints[marketOverlayChartPoints.length - 1]
    const deltaToLatest = point.value - latestPoint.value
    const deltaToLatestPct = latestPoint.value === 0 ? 0 : (deltaToLatest / latestPoint.value) * 100
    const ageLabel = formatElapsedMs(Date.now() - marketOverlayActiveTimelineAnnotation.timestamp)
    return `${marketOverlayActiveTimelineAnnotation.kind}:${marketOverlayActiveTimelineAnnotation.label} · t${point.time} · close:${point.value.toFixed(2)} · Δavg:${deltaFromAverage >= 0 ? '+' : ''}${deltaFromAverage.toFixed(2)} (${deltaFromAveragePct >= 0 ? '+' : ''}${deltaFromAveragePct.toFixed(2)}%) · Δlatest:${deltaToLatest >= 0 ? '+' : ''}${deltaToLatest.toFixed(2)} (${deltaToLatestPct >= 0 ? '+' : ''}${deltaToLatestPct.toFixed(2)}%) · age:${ageLabel} · tone:${marketOverlayActiveTimelineAnnotation.tone}`
  }, [marketOverlayActiveTimelineAnnotation, marketOverlayAverageClose, marketOverlayChartPoints])
  const marketOverlayMarkerTimelineRows = useMemo(() => {
    if (marketOverlayScopedVisibleAnnotations.length === 0) {
      return [] as Array<{ id: string; text: string; isSelected: boolean }>
    }
    const timelineById = new Map(
      marketOverlayScopedTimelineAnnotations.map((annotation) => [annotation.id, annotation] as const),
    )
    const latestPoint = marketOverlayChartPoints[marketOverlayChartPoints.length - 1] ?? null
    const baseline = marketOverlayAverageClose
    return marketOverlayScopedVisibleAnnotations.map((annotation) => {
      const timelineAnnotation = timelineById.get(annotation.id)
      const point = timelineAnnotation
        ? marketOverlayChartPoints.find((candidate) => candidate.time === timelineAnnotation.time)
        : null
      const deltaFromAverage = point && baseline !== null ? point.value - baseline : null
      const deltaFromAveragePct =
        deltaFromAverage !== null && baseline !== null && baseline !== 0
          ? (deltaFromAverage / baseline) * 100
          : null
      const deltaToLatest = point && latestPoint ? point.value - latestPoint.value : null
      const deltaToLatestPct =
        deltaToLatest !== null && latestPoint && latestPoint.value !== 0
          ? (deltaToLatest / latestPoint.value) * 100
          : null
      const ageLabel = formatElapsedMs(Date.now() - annotation.timestamp)
      return {
        id: annotation.id,
        text: `${annotation.kind}:${annotation.label} · t${timelineAnnotation?.time ?? 'n/a'} · close:${point ? point.value.toFixed(2) : 'n/a'} · Δlatest:${deltaToLatest === null ? 'n/a' : `${deltaToLatest >= 0 ? '+' : ''}${deltaToLatest.toFixed(2)} (${deltaToLatestPct !== null ? `${deltaToLatestPct >= 0 ? '+' : ''}${deltaToLatestPct.toFixed(2)}%` : 'n/a'})`} · Δavg:${deltaFromAverage === null ? 'n/a' : `${deltaFromAverage >= 0 ? '+' : ''}${deltaFromAverage.toFixed(2)} (${deltaFromAveragePct !== null ? `${deltaFromAveragePct >= 0 ? '+' : ''}${deltaFromAveragePct.toFixed(2)}%` : 'n/a'})`} · age:${ageLabel}`,
        isSelected: annotation.id === marketOverlaySelectedMarkerId,
      }
    })
  }, [
    marketOverlayAverageClose,
    marketOverlayChartPoints,
    marketOverlayScopedTimelineAnnotations,
    marketOverlayScopedVisibleAnnotations,
    marketOverlaySelectedMarkerId,
  ])
  const marketOverlayMarkerBucketSummary = useMemo(() => {
    const totalVisible = marketOverlayTimelineAnnotations.length
    const scopedVisible = marketOverlayScopedTimelineAnnotations.length
    if (totalVisible === 0) {
      return `mode:${marketOverlayMarkerBucket} · scope:${marketOverlayBucketScope} · buckets:0 · latest:none · count:0`
    }
    if (marketOverlayMarkerBucket === 'none') {
      const latest = marketOverlayTimelineAnnotations[marketOverlayTimelineAnnotations.length - 1]
      return `mode:none · scope:${marketOverlayBucketScope} · buckets:${totalVisible} · latest:t${latest.time} · count:${scopedVisible}`
    }
    const bucketSizeMs = marketOverlayMarkerBucket === '30s' ? 30_000 : 60_000
    const grouped = new Map<number, number>()
    marketOverlayTimelineAnnotations.forEach((annotation) => {
      const bucketStart = Math.floor(annotation.timestamp / bucketSizeMs) * bucketSizeMs
      grouped.set(bucketStart, (grouped.get(bucketStart) ?? 0) + 1)
    })
    const orderedKeys = [...grouped.keys()].sort((a, b) => b - a)
    const latestBucket = orderedKeys[0]
    return `mode:${marketOverlayMarkerBucket} · scope:${marketOverlayBucketScope} · buckets:${orderedKeys.length} · latest:${new Date(latestBucket).toISOString()} · count:${scopedVisible}`
  }, [
    marketOverlayBucketScope,
    marketOverlayMarkerBucket,
    marketOverlayScopedTimelineAnnotations.length,
    marketOverlayTimelineAnnotations,
  ])
  const marketOverlayChartMarkers = useMemo(() => {
    if (marketOverlayChartPoints.length === 0 || marketOverlayScopedTimelineAnnotations.length === 0) {
      return [] as MarketOverlayChartMarker[]
    }
    return marketOverlayScopedTimelineAnnotations.map((annotation): MarketOverlayChartMarker => {
      const time = annotation.time
      if (annotation.kind === 'trade') {
        return {
          time,
          position: 'belowBar',
          color: annotation.tone === 'positive' ? '#71d48c' : '#e9cf7a',
          shape: annotation.tone === 'positive' ? 'arrowUp' : 'arrowDown',
          text: `trade:${annotation.label}`,
        }
      }
      if (annotation.kind === 'risk') {
        return {
          time,
          position: 'aboveBar',
          color: '#ee8d8d',
          shape: 'circle',
          text: `risk:${annotation.label}`,
        }
      }
      return {
        time,
        position: 'inBar',
        color: '#84d3f8',
        shape: 'square',
        text: `feed:${annotation.label}`,
      }
    })
  }, [marketOverlayChartPoints.length, marketOverlayScopedTimelineAnnotations])

  useEffect(() => {
    if (marketOverlayScopedVisibleAnnotations.length === 0) {
      if (marketOverlaySelectedMarkerId !== null) {
        setMarketOverlaySelectedMarkerId(null)
      }
      return
    }
    if (
      marketOverlaySelectedMarkerId &&
      marketOverlayScopedVisibleAnnotations.some((annotation) => annotation.id === marketOverlaySelectedMarkerId)
    ) {
      return
    }
    setMarketOverlaySelectedMarkerId(marketOverlayScopedVisibleAnnotations[0].id)
  }, [marketOverlayScopedVisibleAnnotations, marketOverlaySelectedMarkerId])

  const selectPreviousMarketOverlayMarker = useCallback(() => {
    if (!canSelectPreviousMarketOverlayMarker) {
      return
    }
    const previous = marketOverlayScopedTimelineAnnotations[marketOverlayActiveTimelineIndex - 1]
    if (!previous) {
      return
    }
    setMarketOverlaySelectedMarkerId(previous.id)
  }, [
    canSelectPreviousMarketOverlayMarker,
    marketOverlayActiveTimelineIndex,
    marketOverlayScopedTimelineAnnotations,
  ])

  const selectNextMarketOverlayMarker = useCallback(() => {
    if (!canSelectNextMarketOverlayMarker) {
      return
    }
    const next = marketOverlayScopedTimelineAnnotations[marketOverlayActiveTimelineIndex + 1]
    if (!next) {
      return
    }
    setMarketOverlaySelectedMarkerId(next.id)
  }, [
    canSelectNextMarketOverlayMarker,
    marketOverlayActiveTimelineIndex,
    marketOverlayScopedTimelineAnnotations,
  ])

  const selectOldestMarketOverlayMarker = useCallback(() => {
    if (!canSelectOldestMarketOverlayMarker) {
      return
    }
    const oldest = marketOverlayScopedTimelineAnnotations[0]
    if (!oldest) {
      return
    }
    setMarketOverlaySelectedMarkerId(oldest.id)
  }, [canSelectOldestMarketOverlayMarker, marketOverlayScopedTimelineAnnotations])

  const selectLatestMarketOverlayMarker = useCallback(() => {
    if (!canSelectLatestMarketOverlayMarker) {
      return
    }
    const latest =
      marketOverlayScopedTimelineAnnotations[marketOverlayScopedTimelineAnnotations.length - 1]
    if (!latest) {
      return
    }
    setMarketOverlaySelectedMarkerId(latest.id)
  }, [canSelectLatestMarketOverlayMarker, marketOverlayScopedTimelineAnnotations])

  const onMarketOverlayMarkerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault()
        selectPreviousMarketOverlayMarker()
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault()
        selectNextMarketOverlayMarker()
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        selectOldestMarketOverlayMarker()
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        selectLatestMarketOverlayMarker()
      }
    },
    [
      selectLatestMarketOverlayMarker,
      selectNextMarketOverlayMarker,
      selectOldestMarketOverlayMarker,
      selectPreviousMarketOverlayMarker,
    ],
  )

  useEffect(() => {
    const container = marketOverlayChartContainerRef.current
    if (!container || typeof window.ResizeObserver === 'undefined') {
      setMarketOverlayChartRuntime('fallback')
      return
    }

    let disposed = false
    let resizeObserver: ResizeObserver | null = null

    const initChart = async () => {
      try {
        const lightweightCharts = (await import('lightweight-charts')) as LightweightChartsModule
        if (disposed) {
          return
        }

        const chart = lightweightCharts.createChart(container, {
          width: Math.max(container.clientWidth, 240),
          height: Math.max(container.clientHeight, 140),
          layout: {
            background: { color: '#081224' },
            textColor: '#9fb0cc',
          },
          grid: {
            vertLines: { color: '#203556' },
            horzLines: { color: '#203556' },
          },
          rightPriceScale: {
            borderColor: '#2d4a7e',
          },
          timeScale: {
            borderColor: '#2d4a7e',
            timeVisible: false,
            secondsVisible: false,
          },
        })

        const addLineSeries = (
          color: string,
          lineWidth: number,
        ): MarketOverlayChartSeries | null => {
          if (chart.addLineSeries) {
            return chart.addLineSeries({ color, lineWidth })
          }
          if (chart.addSeries && lightweightCharts.LineSeries) {
            return chart.addSeries(lightweightCharts.LineSeries, { color, lineWidth })
          }
          return null
        }

        const priceSeries = addLineSeries('#84d3f8', 2)
        if (!priceSeries) {
          chart.remove()
          setMarketOverlayChartRuntime('fallback')
          return
        }
        const trendSeries = addLineSeries('#e9cf7a', 1)
        const baselineSeries = addLineSeries('#9fb0cc', 1)

        marketOverlayChartRef.current = chart
        marketOverlayPriceSeriesRef.current = priceSeries
        marketOverlayTrendSeriesRef.current = trendSeries
        marketOverlayBaselineSeriesRef.current = baselineSeries
        priceSeries.setData([])
        trendSeries?.setData([])
        baselineSeries?.setData([])
        chart.timeScale().fitContent()
        setMarketOverlayChartRuntime('ready')

        resizeObserver = new ResizeObserver((entries) => {
          const next = entries[0]
          if (!next || disposed || !marketOverlayChartRef.current) {
            return
          }
          window.requestAnimationFrame(() => {
            if (disposed || !marketOverlayChartRef.current) {
              return
            }
            marketOverlayChartRef.current.applyOptions({
              width: Math.max(next.contentRect.width, 240),
              height: Math.max(next.contentRect.height, 140),
            })
          })
        })
        resizeObserver.observe(container)
      } catch {
        if (!disposed) {
          setMarketOverlayChartRuntime('error')
        }
      }
    }

    void initChart()

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      marketOverlayChartRef.current?.remove?.()
      marketOverlayChartRef.current = null
      marketOverlayPriceSeriesRef.current = null
      marketOverlayTrendSeriesRef.current = null
      marketOverlayBaselineSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!marketOverlayPriceSeriesRef.current || !marketOverlayChartRef.current) {
      return
    }
    marketOverlayPriceSeriesRef.current.setData(marketOverlayChartPoints)
    if (marketOverlayTrendSeriesRef.current) {
      marketOverlayTrendSeriesRef.current.setData(
        marketOverlayChartLens === 'price-only' ? [] : marketOverlayTrendLinePoints,
      )
    }
    if (marketOverlayBaselineSeriesRef.current) {
      marketOverlayBaselineSeriesRef.current.setData(
        marketOverlayChartLens === 'diagnostics' ? marketOverlayBaselinePoints : [],
      )
    }
    marketOverlayPriceSeriesRef.current.setMarkers?.(marketOverlayChartMarkers)
    marketOverlayChartRef.current.timeScale().fitContent()
  }, [
    marketOverlayChartMarkers,
    marketOverlayBaselinePoints,
    marketOverlayChartLens,
    marketOverlayChartPoints,
    marketOverlayTrendLinePoints,
  ])

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

  const lockTelemetryToastDetails = useMemo(
    () =>
      `toggles: ${helperResetLockToggleCount}, tone: ${helperResetLockToggleToneClass.replace(
        'counter-tone-',
        '',
      )}, reset: ${helperLockCountersLastResetAt ?? 'never'}`,
    [helperLockCountersLastResetAt, helperResetLockToggleCount, helperResetLockToggleToneClass],
  )

  const lockTelemetrySourceToastDetails = useMemo(
    () =>
      `sources: Alt+L=${helperResetLockSourceCounts['Alt+L']}, controls=${helperResetLockSourceCounts.controls}, snapshot=${helperResetLockSourceCounts.snapshot}`,
    [helperResetLockSourceCounts],
  )

  const lockTelemetryToastDetailsWithSources = useMemo(
    () => `${lockTelemetryToastDetails}; ${lockTelemetrySourceToastDetails}`,
    [lockTelemetrySourceToastDetails, lockTelemetryToastDetails],
  )

  const lockTelemetryToastDetailsWithLabelAndSources = useMemo(
    () => `lock ${lockTelemetryToastDetailsWithSources}`,
    [lockTelemetryToastDetailsWithSources],
  )

  const lockTelemetryFailureSuffix = useMemo(
    () =>
      isBlockTelemetryVisible
        ? ` Lock telemetry: ${lockTelemetryToastDetailsWithLabelAndSources}.`
        : '',
    [isBlockTelemetryVisible, lockTelemetryToastDetailsWithLabelAndSources],
  )

  const lockTelemetrySuccessSentence = useMemo(
    () =>
      isBlockTelemetryVisible
        ? ` Lock telemetry: ${lockTelemetryToastDetailsWithLabelAndSources}.`
        : '',
    [isBlockTelemetryVisible, lockTelemetryToastDetailsWithLabelAndSources],
  )

  const lockTelemetrySuccessParenthetical = useMemo(
    () =>
      isBlockTelemetryVisible
        ? ` (${lockTelemetryToastDetailsWithLabelAndSources})`
        : '',
    [isBlockTelemetryVisible, lockTelemetryToastDetailsWithLabelAndSources],
  )

  const lockStateTelemetryParenthetical = useCallback(
    (lockState: 'locked' | 'unlocked'): string =>
      isBlockTelemetryVisible
        ? ` (lock: ${lockState}, ${lockTelemetryToastDetailsWithSources})`
        : ` (lock: ${lockState})`,
    [isBlockTelemetryVisible, lockTelemetryToastDetailsWithSources],
  )

  const eventBlockLockTelemetryRef = useRef(lockTelemetryToastDetailsWithLabelAndSources)
  const eventBlockTelemetryVisibleRef = useRef(isBlockTelemetryVisible)

  useEffect(() => {
    eventBlockLockTelemetryRef.current = lockTelemetryToastDetailsWithLabelAndSources
  }, [lockTelemetryToastDetailsWithLabelAndSources])

  useEffect(() => {
    eventBlockTelemetryVisibleRef.current = isBlockTelemetryVisible
  }, [isBlockTelemetryVisible])

  const appendLockTelemetryToBlockPayload = useCallback(
    (baseContent: string): string =>
      isBlockTelemetryVisible
        ? `${baseContent}\n\n[LockTelemetry] ${lockTelemetryToastDetailsWithLabelAndSources}`
        : baseContent,
    [isBlockTelemetryVisible, lockTelemetryToastDetailsWithLabelAndSources],
  )

  const withLockTelemetrySection = useCallback(
    (lines: string[]): string[] =>
      isBlockTelemetryVisible ? [...lines, '[LockTelemetry]', ...lockTelemetrySummaryLines] : lines,
    [isBlockTelemetryVisible, lockTelemetrySummaryLines],
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
    setBlocks((current) => {
      blockIdCounterRef.current += 1
      const dedupedItem: BlockItem = {
        ...item,
        id: `${item.id}_${blockIdCounterRef.current}`,
      }
      return [dedupedItem, ...current].slice(0, 25)
    })
  }, [])

  const appendMarketOverlayAnnotation = useCallback(
    (
      kind: MarketOverlayAnnotationKind,
      label: string,
      tone: MarketOverlayAnnotationTone = 'neutral',
      timestamp = Date.now(),
    ) => {
      setMarketOverlayAnnotations((current) =>
        [
          {
            id: `overlay_ann_${timestamp}_${kind}_${current.length}`,
            kind,
            label,
            tone,
            timestamp,
          },
          ...current,
        ].slice(0, 8),
      )
    },
    [],
  )

  const resetHelperLockCounters = useCallback(() => {
    if (helperResetLockToggleCount === 0) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper lock counters already empty',
        content: `No helper reset lock toggle history to clear.${lockTelemetryFailureSuffix}`,
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
      content: `Reset helper lock counters${lockTelemetrySuccessParenthetical}.`,
      severity: 'info',
    })
  }, [
    appendBlock,
    helperResetLockToggleCount,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
  ])

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
          content: `Gateway is not connected.${lockTelemetryFailureSuffix}`,
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
          content: `Skipped duplicate request within ${minRequestGapMs}ms guard window.${lockTelemetryFailureSuffix}`,
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
        const rejectionMessage = response.error?.message ?? 'Unknown error'
        appendBlock({
          id: `blk_${Date.now()}`,
          title: `${method} rejected`,
          content: /[.!?]$/.test(rejectionMessage)
            ? `${rejectionMessage}${lockTelemetryFailureSuffix}`
            : `${rejectionMessage}.${lockTelemetryFailureSuffix}`,
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
        content: appendLockTelemetryToBlockPayload(JSON.stringify(response.payload ?? {}, null, 2)),
        severity: 'info',
      })
      return response.payload ?? {}
    },
    [
      appendBlock,
      appendLockTelemetryToBlockPayload,
      lockTelemetryFailureSuffix,
      minRequestGapMsInput,
      patchHistory,
      pushHistory,
    ],
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

  const applyRiskStatusPayload = useCallback((payload: Record<string, unknown> | null) => {
    if (!payload) {
      return
    }
    if ('emergencyStopActive' in payload && typeof payload.emergencyStopActive === 'boolean') {
      setRiskEmergencyStopActive(payload.emergencyStopActive)
    }
    if ('lastAction' in payload) {
      setRiskLastEmergencyAction(typeof payload.lastAction === 'string' ? payload.lastAction : null)
    }
    if ('lastReason' in payload) {
      setRiskLastEmergencyReason(typeof payload.lastReason === 'string' ? payload.lastReason : null)
    }
    if ('updatedAt' in payload) {
      setRiskLastEmergencyUpdatedAt(typeof payload.updatedAt === 'string' ? payload.updatedAt : null)
    }
    if ('actionCounts' in payload && typeof payload.actionCounts === 'object' && payload.actionCounts) {
      const actionCounts = payload.actionCounts as Record<string, unknown>
      setRiskEmergencyActionCounts({
        pause_trading:
          typeof actionCounts.pause_trading === 'number' ? actionCounts.pause_trading : 0,
        cancel_all: typeof actionCounts.cancel_all === 'number' ? actionCounts.cancel_all : 0,
        close_all: typeof actionCounts.close_all === 'number' ? actionCounts.close_all : 0,
        disable_live: typeof actionCounts.disable_live === 'number' ? actionCounts.disable_live : 0,
      })
    }
  }, [])

  const sendRiskStatus = useCallback(async () => {
    const payload = await sendRequest('risk.status', {})
    applyRiskStatusPayload(payload)
  }, [applyRiskStatusPayload, sendRequest])

  const sendRiskEmergencyStop = useCallback(async () => {
    const payload = await sendRequest('risk.emergencyStop', {
      action: riskEmergencyAction,
      reason: riskEmergencyReason.trim() || DEFAULT_RISK_EMERGENCY_REASON,
    })
    applyRiskStatusPayload(payload)
  }, [applyRiskStatusPayload, riskEmergencyAction, riskEmergencyReason, sendRequest])

  const sendRiskResume = useCallback(async () => {
    const payload = await sendRequest('risk.resume', {
      reason: riskEmergencyReason.trim() || DEFAULT_RISK_EMERGENCY_REASON,
    })
    applyRiskStatusPayload(payload)
  }, [applyRiskStatusPayload, riskEmergencyReason, sendRequest])

  const sendInterventionEmergencyAction = useCallback(
    async (action: RiskEmergencyAction) => {
      const payload = await sendRequest('risk.emergencyStop', {
        action,
        reason: riskEmergencyReason.trim() || `intervention:${action}`,
      })
      applyRiskStatusPayload(payload)
    },
    [applyRiskStatusPayload, riskEmergencyReason, sendRequest],
  )

  const sendInterventionResume = useCallback(async () => {
    const payload = await sendRequest('risk.resume', {
      reason: riskEmergencyReason.trim() || 'intervention:resume',
    })
    applyRiskStatusPayload(payload)
  }, [applyRiskStatusPayload, riskEmergencyReason, sendRequest])

  const sendTradePlace = useCallback(() => {
    const accountId = managedAccountId.trim() || DEFAULT_PRESET_TEMPLATE.managedAccountId
    const symbol = feedSymbol.trim() || DEFAULT_PRESET_TEMPLATE.feedSymbol
    void sendRequest('trades.place', {
      intent: {
        account_id: accountId,
        symbol,
        action: 'PLACE_MARKET_ORDER',
        side: 'buy',
        volume: 0.1,
        stop_loss: 2400.0,
        take_profit: 2700.0,
      },
      policy: {
        allowed_symbols: [symbol],
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
  }, [feedSymbol, managedAccountId, sendRequest])

  const sendTradeModify = useCallback(() => {
    void sendRequest('trades.modify', {
      accountId: managedAccountId.trim() || DEFAULT_PRESET_TEMPLATE.managedAccountId,
      orderId: TRADE_ORDER_REFERENCE_ID,
      openPrice: 2500.0,
      stopLoss: 2450.0,
      takeProfit: 2600.0,
    })
  }, [managedAccountId, sendRequest])

  const sendTradeCancel = useCallback(() => {
    void sendRequest('trades.cancel', {
      accountId: managedAccountId.trim() || DEFAULT_PRESET_TEMPLATE.managedAccountId,
      orderId: TRADE_ORDER_REFERENCE_ID,
    })
  }, [managedAccountId, sendRequest])

  const sendTradeClosePosition = useCallback(() => {
    void sendRequest('trades.closePosition', {
      accountId: managedAccountId.trim() || DEFAULT_PRESET_TEMPLATE.managedAccountId,
      positionId: TRADE_POSITION_REFERENCE_ID,
    })
  }, [managedAccountId, sendRequest])

  const sendAgentsList = useCallback(async () => {
    const payload = await sendRequest('agents.list', {})
    const agentsRaw = payload?.agents
    const agents = Array.isArray(agentsRaw) ? agentsRaw : []
    setAgentCount(agents.length)
    setOnboardingChecklist((current) => ({
      ...current,
      agent: agents.length > 0,
    }))
  }, [sendRequest])

  const sendAgentCreate = useCallback(async () => {
    const payload = await sendRequest('agents.create', {
      agentId: managedAgentId.trim() || DEFAULT_AGENT_ID,
      label: managedAgentLabel.trim() || DEFAULT_AGENT_LABEL,
      soulTemplate: DEFAULT_AGENT_SOUL_TEMPLATE,
      manualTemplate: DEFAULT_AGENT_MANUAL_TEMPLATE,
    })
    const agent = payload?.agent
    if (agent && typeof agent === 'object') {
      if ('agentId' in agent && typeof agent.agentId === 'string') {
        setManagedAgentId(agent.agentId)
      }
      if ('label' in agent && typeof agent.label === 'string') {
        setManagedAgentLabel(agent.label)
      }
      setOnboardingChecklist((current) => ({
        ...current,
        agent: true,
      }))
    }
  }, [managedAgentId, managedAgentLabel, sendRequest])

  const sendAccountsList = useCallback(async () => {
    const payload = await sendRequest('accounts.list', {})
    const accountsRaw = payload?.accounts
    const accounts = Array.isArray(accountsRaw) ? accountsRaw : []
    setAccountCount(accounts.length)
    const hasConnectedAccount = accounts.some((account) => {
      if (!account || typeof account !== 'object' || !('status' in account)) {
        return false
      }
      return account.status === 'connected'
    })
    setOnboardingChecklist((current) => ({
      ...current,
      account: hasConnectedAccount,
    }))
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
        setOnboardingChecklist((current) => ({
          ...current,
          account: account.status === 'connected',
        }))
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
        content: `No managed account id available.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }
    const payload = await sendRequest('accounts.disconnect', { accountId: managedAccountId })
    const account = payload?.account
    if (account && typeof account === 'object' && 'status' in account) {
      if (typeof account.status === 'string') {
        setAccountConnectionStatus(account.status)
        setOnboardingChecklist((current) => ({
          ...current,
          account: account.status === 'connected',
        }))
      }
    }
  }, [appendBlock, lockTelemetryFailureSuffix, managedAccountId, sendRequest])

  const sendFeedsList = useCallback(async () => {
    const payload = await sendRequest('feeds.list', {})
    const feedsRaw = payload?.feeds
    const subscriptionsRaw = payload?.subscriptions
    const feeds = Array.isArray(feedsRaw) ? feedsRaw : []
    const subscriptions = Array.isArray(subscriptionsRaw) ? subscriptionsRaw : []
    setFeedCount(feeds.length)
    setSubscriptionCount(subscriptions.length)
    setOnboardingChecklist((current) => ({
      ...current,
      feed: subscriptions.length > 0,
    }))
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
        content: `No managed device id available.${lockTelemetryFailureSuffix}`,
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
  }, [appendBlock, lockTelemetryFailureSuffix, managedDeviceId, managedDeviceRotatePushToken, sendRequest])

  const sendDeviceNotifyTest = useCallback(async () => {
    if (!managedDeviceId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'devices.notifyTest skipped',
        content: `No managed device id available.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }

    await sendRequest('devices.notifyTest', {
      deviceId: managedDeviceId,
      message: managedDeviceNotifyMessage.trim() || DEVICE_NOTIFY_TEST_MESSAGE,
    })
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    managedDeviceId,
    managedDeviceNotifyMessage,
    sendRequest,
  ])

  const sendDeviceUnpair = useCallback(async () => {
    if (!managedDeviceId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'devices.unpair skipped',
        content: `No managed device id available.${lockTelemetryFailureSuffix}`,
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
  }, [appendBlock, lockTelemetryFailureSuffix, managedDeviceId, sendRequest])

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
        setOnboardingChecklist((current) => ({
          ...current,
          feed: true,
        }))
      }
    }
  }, [feedSymbol, feedTimeframe, feedTopic, sendRequest])

  const sendFeedUnsubscribe = useCallback(async () => {
    if (!activeSubscriptionId) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'feeds.unsubscribe skipped',
        content: `No active feed subscription id available.${lockTelemetryFailureSuffix}`,
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
      setOnboardingChecklist((current) => ({
        ...current,
        feed: false,
      }))
    }
  }, [activeSubscriptionId, appendBlock, lockTelemetryFailureSuffix, sendRequest])

  const sendFeedGetCandles = useCallback(async () => {
    const payload = await sendRequest('feeds.getCandles', {
      symbol: feedSymbol,
      timeframe: feedTimeframe,
      limit: FEED_CANDLE_FETCH_LIMIT,
    })
    const candlesRaw = payload?.candles
    if (!Array.isArray(candlesRaw)) {
      setLastFetchedCandlesCount(0)
      setMarketOverlayRecentCloses([])
      return
    }
    setLastFetchedCandlesCount(candlesRaw.length)
    setMarketOverlayRecentCloses(
      candlesRaw
        .map((candle) => {
          if (
            candle &&
            typeof candle === 'object' &&
            'close' in candle &&
            typeof candle.close === 'number'
          ) {
            return candle.close
          }
          return null
        })
        .filter((close): close is number => close !== null)
        .slice(-5),
    )
  }, [feedSymbol, feedTimeframe, sendRequest])

  const sendMarketplaceSignals = useCallback(async () => {
    const payload = await sendRequest('marketplace.signals', {})
    const signalsRaw = payload?.signals
    setMarketplaceSignalCount(Array.isArray(signalsRaw) ? signalsRaw.length : 0)
  }, [sendRequest])

  const sendCopytradePreview = useCallback(async () => {
    const accountId = managedAccountId.trim() || DEFAULT_PRESET_TEMPLATE.managedAccountId
    const symbol = feedSymbol.trim() || DEFAULT_PRESET_TEMPLATE.feedSymbol
    const timeframe = feedTimeframe.trim() || DEFAULT_PRESET_TEMPLATE.feedTimeframe
    const payload = await sendRequest('copytrade.preview', {
      accountId,
      signal: {
        signalId: COPYTRADE_PREVIEW_SIGNAL_ID,
        strategyId: COPYTRADE_PREVIEW_STRATEGY_ID,
        ts: new Date().toISOString(),
        symbol,
        timeframe,
        action: 'OPEN',
        side: 'buy',
        volume: 0.35,
        entry: 2500.0,
        stopLoss: 2450.0,
        takeProfit: 2600.0,
      },
      constraints: {
        allowedSymbols: [symbol],
        maxVolume: 0.2,
        directionFilter: 'both',
        maxSignalAgeSeconds: 300,
      },
    })
    if (!payload) {
      return
    }
    const blockedReason = typeof payload.blockedReason === 'string' ? payload.blockedReason : null
    const deduped = payload.deduped === true
    const intent = payload.intent
    const intentVolume =
      intent && typeof intent === 'object' && 'volume' in intent && typeof intent.volume === 'number'
        ? intent.volume
        : null
    if (blockedReason) {
      setCopytradePreviewSummary(`blocked:${blockedReason}`)
      return
    }
    if (deduped) {
      setCopytradePreviewSummary('deduped')
      return
    }
    if (intentVolume !== null) {
      setCopytradePreviewSummary(`allowed (volume: ${intentVolume})`)
      return
    }
    setCopytradePreviewSummary('allowed')
  }, [feedSymbol, feedTimeframe, managedAccountId, sendRequest])

  const runOnboardingFlow = useCallback(async () => {
    await sendAccountConnect()
    await sendAgentCreate()
    await sendFeedSubscribe()
  }, [sendAccountConnect, sendAgentCreate, sendFeedSubscribe])

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
      managedDeviceNotifyMessage,
      riskEmergencyAction,
      riskEmergencyReason,
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
    managedDeviceNotifyMessage,
    riskEmergencyAction,
    riskEmergencyReason,
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
    setManagedDeviceNotifyMessage(preset.managedDeviceNotifyMessage)
    setRiskEmergencyAction(preset.riskEmergencyAction)
    setRiskEmergencyReason(preset.riskEmergencyReason)
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
        content: `Preset name is required.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }
    const store = readPresetStore()
    store[normalizedName] = collectCurrentPreset()
    writePresetStore(store)
    setSelectedPresetName(normalizedName)
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'preset saved',
      content: `Saved preset: ${normalizedName}.${lockTelemetrySuccessSentence}`,
      severity: 'info',
    })
  }, [
    appendBlock,
    collectCurrentPreset,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessSentence,
    presetNameInput,
    readPresetStore,
    writePresetStore,
  ])

  const loadSelectedPreset = useCallback(() => {
    if (!selectedPresetName) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset load skipped',
        content: `Select a preset first.${lockTelemetryFailureSuffix}`,
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
        content: `Preset not found: ${selectedPresetName}.${lockTelemetryFailureSuffix}`,
        severity: 'error',
      })
      return
    }
    applyPreset(preset)
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'preset loaded',
      content: `Loaded preset: ${selectedPresetName}.${lockTelemetrySuccessSentence}`,
      severity: 'info',
    })
  }, [
    appendBlock,
    applyPreset,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessSentence,
    readPresetStore,
    selectedPresetName,
  ])

  const deleteSelectedPreset = useCallback(() => {
    if (!selectedPresetName) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset delete skipped',
        content: `Select a preset first.${lockTelemetryFailureSuffix}`,
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
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'preset deleted',
      content: `Deleted preset: ${selectedPresetName}.${lockTelemetrySuccessSentence}`,
      severity: 'info',
    })
    setSelectedPresetName('')
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessSentence,
    readPresetStore,
    selectedPresetName,
    writePresetStore,
  ])

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
        content: `Copied ${Object.keys(store).length} presets JSON to clipboard${lockTelemetrySuccessParenthetical}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'presets export failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
    readPresetStore,
  ])

  const importPresetsJson = useCallback(() => {
    const source = presetImportInput.trim()
    if (!source) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset import skipped',
        content: `Import JSON field is empty.${lockTelemetryFailureSuffix}`,
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
        content: `Invalid JSON payload.${lockTelemetryFailureSuffix}`,
        severity: 'error',
      })
      return
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'preset import failed',
        content: `Expected a JSON object keyed by preset name.${lockTelemetryFailureSuffix}`,
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
        `rejected ${rejectedNames.length}.${lockTelemetrySuccessSentence}`,
      severity: 'info',
    })
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessSentence,
    presetImportInput,
    presetImportMode,
    readPresetStore,
    writePresetStore,
  ])

  const copyPresetImportReport = useCallback(async () => {
    if (!presetImportReport) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copy skipped',
        content: `No preset import report available yet.${lockTelemetryFailureSuffix}`,
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
    ]
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(withLockTelemetrySection(summaryLines).join('\n'))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copied',
        content: `Preset import report copied to clipboard${lockTelemetrySuccessParenthetical}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import report copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
    presetImportReport,
    withLockTelemetrySection,
  ])

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
        content: `No preset import report available yet.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }
    const payload = [
      '[ImportNames]',
      `accepted:${presetImportReport.accepted.join(',')}`,
      `rejected:${presetImportReport.rejected.join(',')}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(withLockTelemetrySection(payload.split('\n')).join('\n'))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import names copied',
        content: `Copied full accepted/rejected import names to clipboard${lockTelemetrySuccessParenthetical}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'import names copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
    presetImportReport,
    withLockTelemetrySection,
  ])

  const copyLastImportSummary = useCallback(async () => {
    if (!presetImportReport) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copy skipped',
        content: `No preset import report available yet.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(
        withLockTelemetrySection([lastImportSummaryText]).join('\n'),
      )
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copied',
        content: `Copied last import summary to clipboard${lockTelemetrySuccessParenthetical}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'last summary copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    lastImportSummaryText,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
    presetImportReport,
    withLockTelemetrySection,
  ])

  const copyImportShortcutCheatSheet = useCallback(async () => {
    const cheatSheetLines = [
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
    ]
    if (isBlockTelemetryVisible) {
      cheatSheetLines.push(
        '- [LockTelemetry]',
        `- Helper lock counter reset at: ${helperLockCountersLastResetAt ?? 'never'}`,
        `- Helper lock toggle total: ${helperResetLockToggleCount}`,
        `- Helper lock toggle tone: ${helperResetLockToggleToneClass.replace('counter-tone-', '')}`,
        `- Helper lock toggle Alt+L: ${helperResetLockSourceCounts['Alt+L']}`,
        `- Helper lock toggle controls: ${helperResetLockSourceCounts.controls}`,
        `- Helper lock toggle snapshot: ${helperResetLockSourceCounts.snapshot}`,
      )
    }
    const cheatSheet = cheatSheetLines.join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(cheatSheet)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'shortcut cheat-sheet copied',
        content: `Copied import shortcut cheat-sheet to clipboard${lockStateTelemetryParenthetical(
          isHelperResetLocked ? 'locked' : 'unlocked',
        )}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'shortcut cheat-sheet copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
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
    isBlockTelemetryVisible,
    lockTelemetryFailureSuffix,
    lockStateTelemetryParenthetical,
    presetImportMode,
  ])

  const copyHelperDiagnosticsSummary = useCallback(async () => {
    const summary = [
      '[HelperDiagnostics]',
      `expanded=${isImportHelperDiagnosticsExpanded ? 'yes' : 'no'}`,
      `enabled=${Number(isImportHintVisible) + Number(showShortcutLegendInStatus)}/2`,
      `density=${shortcutLegendDensity}`,
      `resetAt=${helperDiagnosticsLastResetAt ?? 'never'}`,
      `resetFormat=${helperResetTimestampFormat}`,
      `resetBadgeVisible=${isHelperResetBadgeVisible ? 'yes' : 'no'}`,
      `resetBadgeSection=${isHelperResetBadgeSectionExpanded ? 'expanded' : 'collapsed'}`,
      `resetLock=${isHelperResetLocked ? 'locked' : 'unlocked'}`,
      `resetStaleAfterHours=${helperResetStaleThresholdHours}`,
      `blockTelemetry=${isBlockTelemetryVisible ? 'visible' : 'hidden'}`,
      `hintVisible=${isImportHintVisible ? 'yes' : 'no'}`,
      `legendVisible=${showShortcutLegendInStatus ? 'yes' : 'no'}`,
      `legendOrder=${shortcutLegendOrder}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(withLockTelemetrySection(summary.split('\n')).join('\n'))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper summary copied',
        content: `Copied helper diagnostics summary to clipboard${lockStateTelemetryParenthetical(
          isHelperResetLocked ? 'locked' : 'unlocked',
        )}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper summary copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    isImportHelperDiagnosticsExpanded,
    isImportHintVisible,
    helperDiagnosticsLastResetAt,
    isHelperResetBadgeSectionExpanded,
    isHelperResetBadgeVisible,
    isHelperResetLocked,
    helperResetStaleThresholdHours,
    helperResetTimestampFormat,
    isBlockTelemetryVisible,
    lockTelemetryFailureSuffix,
    lockStateTelemetryParenthetical,
    shortcutLegendDensity,
    shortcutLegendOrder,
    showShortcutLegendInStatus,
    withLockTelemetrySection,
  ])

  const copyHelperResetBadge = useCallback(async () => {
    const resetText = helperDiagnosticsLastResetAt
      ? formatTimestamp(helperDiagnosticsLastResetAt, helperResetTimestampFormat)
      : 'never'
    const payload = [
      '[ResetBadge]',
      `last reset=${resetText}`,
      `resetFormat=${helperResetTimestampFormat}`,
      `staleAfterHours=${helperResetStaleThresholdHours}`,
      `resetLock=${isHelperResetLocked ? 'locked' : 'unlocked'}`,
      `resetBadgeVisible=${isHelperResetBadgeVisible ? 'yes' : 'no'}`,
      `resetBadgeSection=${isHelperResetBadgeSectionExpanded ? 'expanded' : 'collapsed'}`,
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(withLockTelemetrySection(payload.split('\n')).join('\n'))
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper reset badge copied',
        content: `Copied helper reset badge text to clipboard${lockStateTelemetryParenthetical(
          isHelperResetLocked ? 'locked' : 'unlocked',
        )}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper reset badge copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    helperDiagnosticsLastResetAt,
    isHelperResetBadgeSectionExpanded,
    isHelperResetBadgeVisible,
    isHelperResetLocked,
    lockStateTelemetryParenthetical,
    lockTelemetryFailureSuffix,
    helperResetStaleThresholdHours,
    helperResetTimestampFormat,
    withLockTelemetrySection,
  ])

  const resetHelperDiagnosticsPreferences = useCallback(() => {
    if (isHelperResetLocked) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'helper diagnostics reset locked',
        content: `Unlock reset controls before resetting helper diagnostics preferences.${lockTelemetryFailureSuffix}`,
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
    setIsBlockTelemetryVisible(true)
    setHelperDiagnosticsLastResetAt(new Date().toISOString())
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'helper diagnostics reset',
      content: `Reset helper diagnostics preferences to defaults${lockTelemetrySuccessParenthetical}.`,
      severity: 'info',
    })
  }, [
    appendBlock,
    isHelperResetLocked,
    lockTelemetryFailureSuffix,
    lockTelemetrySuccessParenthetical,
  ])

  const clearPresetImportReport = useCallback(() => {
    if (!presetImportReport) {
      return
    }
    setPresetImportReport(null)
    appendBlock({
      id: `blk_${Date.now()}`,
      title: 'import report cleared',
      content: `Cleared the latest preset import diagnostics${lockTelemetrySuccessParenthetical}.`,
      severity: 'info',
    })
  }, [appendBlock, lockTelemetrySuccessParenthetical, presetImportReport])

  useEffect(() => {
    if (!autoRefreshEnabled) {
      return
    }
    const refreshSeconds = Math.max(Number.parseInt(refreshSecondsInput, 10) || 0, 1)
    const intervalId = window.setInterval(() => {
      void sendAgentsList()
      void sendAccountsList()
      void sendFeedsList()
      void sendDevicesList()
    }, refreshSeconds * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [
    autoRefreshEnabled,
    refreshSecondsInput,
    sendAccountsList,
    sendAgentsList,
    sendDevicesList,
    sendFeedsList,
  ])

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
        if (parsed.event === 'event.account.status') {
          const payload = parsed.payload ?? {}
          const account = payload.account
          if (account && typeof account === 'object') {
            if ('accountId' in account && typeof account.accountId === 'string') {
              setManagedAccountId(account.accountId)
            }
            if ('status' in account && typeof account.status === 'string') {
              setAccountConnectionStatus(account.status)
              setOnboardingChecklist((current) => ({
                ...current,
                account: account.status === 'connected',
              }))
            }
          }
        }
        if (parsed.event === 'event.risk.emergencyStop') {
          const payload = parsed.payload ?? {}
          const statusPayload = (
            'status' in payload && payload.status && typeof payload.status === 'object'
              ? (payload.status as Record<string, unknown>)
              : null
          )
          applyRiskStatusPayload(statusPayload)
        }
        if (parsed.event === 'event.trade.canceled' || parsed.event === 'event.trade.closed') {
          const payload = parsed.payload ?? {}
          const status = typeof payload.status === 'string' ? payload.status : undefined
          const action: TradeControlBadge['action'] =
            parsed.event === 'event.trade.canceled' ? 'canceled' : 'closed'
          setTradeControlEvents((current) =>
            [
              {
                id: `trade_ctrl_${Date.now()}`,
                action,
                status,
              },
              ...current,
            ].slice(0, 6),
          )
          appendMarketOverlayAnnotation(
            'trade',
            `${action}:${status ?? 'unknown'}`,
            action === 'closed' ? 'positive' : 'neutral',
          )
        }
        if (parsed.event === 'event.risk.alert') {
          const payload = parsed.payload ?? {}
          const status = typeof payload.status === 'string' ? payload.status : undefined
          let kind = 'risk_alert'
          if ('kind' in payload && typeof payload.kind === 'string' && payload.kind.length > 0) {
            kind = payload.kind
          } else if (
            'decision' in payload &&
            payload.decision &&
            typeof payload.decision === 'object' &&
            'violations' in payload.decision &&
            Array.isArray(payload.decision.violations) &&
            payload.decision.violations.length > 0 &&
            payload.decision.violations[0] &&
            typeof payload.decision.violations[0] === 'object' &&
            'code' in payload.decision.violations[0] &&
            typeof payload.decision.violations[0].code === 'string'
          ) {
            kind = payload.decision.violations[0].code
          }
          setRiskAlerts((current) =>
            [
              {
                id: `risk_alert_${Date.now()}`,
                kind,
                status,
              },
              ...current,
            ].slice(0, 6),
          )
          appendMarketOverlayAnnotation('risk', `${kind}:${status ?? 'active'}`, 'warning')
        }
        if (parsed.event === 'event.agent.status') {
          const payload = parsed.payload ?? {}
          const agent = payload.agent
          if (agent && typeof agent === 'object') {
            if ('agentId' in agent && typeof agent.agentId === 'string') {
              setManagedAgentId(agent.agentId)
            }
            if ('label' in agent && typeof agent.label === 'string') {
              setManagedAgentLabel(agent.label)
            }
            setOnboardingChecklist((current) => ({
              ...current,
              agent: true,
            }))
          }
        }
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
          appendMarketOverlayAnnotation('feed', `${action}${subscriptionId ? `:${subscriptionId}` : ''}`)
        }
        appendBlock({
          id: `blk_${Date.now()}`,
          title: parsed.event,
          content:
            eventBlockTelemetryVisibleRef.current
              ? `${JSON.stringify(parsed.payload ?? {}, null, 2)}\n\n` +
                `[LockTelemetry] ${eventBlockLockTelemetryRef.current}`
              : JSON.stringify(parsed.payload ?? {}, null, 2),
          severity: 'info',
        })
      }
    }

    return () => {
      socket.close()
      wsRef.current = null
      pendingMap.clear()
    }
  }, [appendBlock, appendMarketOverlayAnnotation, applyRiskStatusPayload, websocketUrl])

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
    window.localStorage.setItem(
      BLOCK_TELEMETRY_VISIBILITY_STORAGE_KEY,
      isBlockTelemetryVisible ? 'visible' : 'hidden',
    )
  }, [isBlockTelemetryVisible])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_MODE_STORAGE_KEY, marketOverlayMode)
  }, [marketOverlayMode])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_CHART_LENS_STORAGE_KEY, marketOverlayChartLens)
  }, [marketOverlayChartLens])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_MARKER_FOCUS_STORAGE_KEY, marketOverlayMarkerFocus)
  }, [marketOverlayMarkerFocus])

  useEffect(() => {
    window.localStorage.setItem(
      MARKET_OVERLAY_MARKER_WINDOW_STORAGE_KEY,
      String(marketOverlayMarkerWindow),
    )
  }, [marketOverlayMarkerWindow])

  useEffect(() => {
    window.localStorage.setItem(
      MARKET_OVERLAY_MARKER_AGE_FILTER_STORAGE_KEY,
      marketOverlayMarkerAgeFilter,
    )
  }, [marketOverlayMarkerAgeFilter])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_MARKER_BUCKET_STORAGE_KEY, marketOverlayMarkerBucket)
  }, [marketOverlayMarkerBucket])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_BUCKET_SCOPE_STORAGE_KEY, marketOverlayBucketScope)
  }, [marketOverlayBucketScope])

  useEffect(() => {
    window.localStorage.setItem(MARKET_OVERLAY_TIMELINE_ORDER_STORAGE_KEY, marketOverlayTimelineOrder)
  }, [marketOverlayTimelineOrder])

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
    ]
    const payloadWithTelemetry = [
      ...withLockTelemetrySection(payload),
      '[Legend]',
      ...statusLegendShortcuts.map((item) => `${item.label}\t${item.title}\t${item.inlineLabel}`),
    ].join('\n')
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable')
      }
      await navigator.clipboard.writeText(payloadWithTelemetry)
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'status legend copied',
        content: `Copied status shortcut legend to clipboard${lockStateTelemetryParenthetical(
          isHelperResetLocked ? 'locked' : 'unlocked',
        )}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'status legend copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    importHintMode,
    isHelperResetLocked,
    lockTelemetryFailureSuffix,
    lockStateTelemetryParenthetical,
    shortcutLegendDensity,
    shortcutLegendOrder,
    showShortcutLegendInStatus,
    statusLegendShortcuts,
    withLockTelemetrySection,
  ])

  const copyHistoryToClipboard = useCallback(async () => {
    if (filteredHistory.length === 0) {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'history copy skipped',
        content: `No quick-action history entries available for current filter.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
      return
    }

    const text = [
      ...withLockTelemetrySection([`filter=${historyFilter}`]),
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
        content: `Copied ${Math.min(filteredHistory.length, 10)} history entries${lockTelemetrySuccessParenthetical}.`,
        severity: 'info',
      })
    } catch {
      appendBlock({
        id: `blk_${Date.now()}`,
        title: 'history copy failed',
        content: `Clipboard access failed or is unavailable.${lockTelemetryFailureSuffix}`,
        severity: 'warn',
      })
    }
  }, [
    appendBlock,
    filteredHistory,
    lockTelemetryFailureSuffix,
    historyFilter,
    lockTelemetrySuccessParenthetical,
    withLockTelemetrySection,
  ])

  const refreshMarketOverlaySnapshot = useCallback(() => {
    const candles = lastFetchedCandlesCount ?? 0
    const tradeEvents = tradeControlEvents.length
    const alerts = riskAlerts.length
    const chartPoints = marketOverlayChartPoints.length
    const chartLens = marketOverlayChartLens
    const markerFocus = marketOverlayMarkerFocus
    const markerWindow = marketOverlayMarkerWindow
    const markerAge = marketOverlayMarkerAgeFilter
    const markerBucket = marketOverlayMarkerBucket
    const bucketScope = marketOverlayBucketScope
    const timelineOrder = marketOverlayTimelineOrder
    const markerNavigation = marketOverlayMarkerNavigationLabel.replace(' · ', '|')
    const markerSummary = `t${marketOverlayAnnotationSummary.tradeCount}/r${marketOverlayAnnotationSummary.riskCount}/f${marketOverlayAnnotationSummary.feedCount}`
    const correlationHint = marketOverlayCorrelationHint
    const trendLabel = marketOverlayTrend.label
    const volatilitySummary = marketOverlayVolatility.summary
    const pulseSummary = marketOverlayPulse.summary
    const regimeSummary = marketOverlayRegime.summary
    const summaryByMode: Record<MarketOverlayMode, string> = {
      'price-only': `candles:${candles} · chartPoints:${chartPoints} · chartLens:${chartLens} · markerFocus:${markerFocus} · markerWindow:${markerWindow} · markerAge:${markerAge} · markerBucket:${markerBucket} · bucketScope:${bucketScope} · timelineOrder:${timelineOrder} · markerNav:${markerNavigation} · markers:${markerSummary} · corr:${correlationHint} · trend:${trendLabel} · vol:${volatilitySummary} · pulse:${pulseSummary} · regime:${regimeSummary}`,
      'with-trades': `candles:${candles} · tradeEvents:${tradeEvents} · chartPoints:${chartPoints} · chartLens:${chartLens} · markerFocus:${markerFocus} · markerWindow:${markerWindow} · markerAge:${markerAge} · markerBucket:${markerBucket} · bucketScope:${bucketScope} · timelineOrder:${timelineOrder} · markerNav:${markerNavigation} · markers:${markerSummary} · corr:${correlationHint} · trend:${trendLabel} · vol:${volatilitySummary} · pulse:${pulseSummary} · regime:${regimeSummary}`,
      'with-risk': `candles:${candles} · tradeEvents:${tradeEvents} · riskAlerts:${alerts} · chartPoints:${chartPoints} · chartLens:${chartLens} · markerFocus:${markerFocus} · markerWindow:${markerWindow} · markerAge:${markerAge} · markerBucket:${markerBucket} · bucketScope:${bucketScope} · timelineOrder:${timelineOrder} · markerNav:${markerNavigation} · markers:${markerSummary} · corr:${correlationHint} · trend:${trendLabel} · vol:${volatilitySummary} · pulse:${pulseSummary} · regime:${regimeSummary}`,
    }
    setMarketOverlaySnapshotSummary(summaryByMode[marketOverlayMode])
    setMarketOverlaySnapshotAt(new Date().toISOString())
  }, [
    lastFetchedCandlesCount,
    marketOverlayAnnotationSummary.feedCount,
    marketOverlayAnnotationSummary.riskCount,
    marketOverlayAnnotationSummary.tradeCount,
    marketOverlayCorrelationHint,
    marketOverlayChartLens,
    marketOverlayMarkerNavigationLabel,
    marketOverlayMarkerBucket,
    marketOverlayBucketScope,
    marketOverlayMarkerAgeFilter,
    marketOverlayTimelineOrder,
    marketOverlayMarkerFocus,
    marketOverlayMarkerWindow,
    marketOverlayChartPoints.length,
    marketOverlayMode,
    marketOverlayPulse.summary,
    marketOverlayRegime.summary,
    marketOverlayTrend.label,
    marketOverlayVolatility.summary,
    riskAlerts.length,
    tradeControlEvents.length,
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
          <div className="placeholder-chart" aria-label="Market Overlay Chart">
            <div
              ref={marketOverlayChartContainerRef}
              className={`market-overlay-chart-surface runtime-${marketOverlayChartRuntime}`}
            />
            <p aria-label="Overlay Chart Summary" className="market-overlay-chart-summary">
              Chart: {marketOverlayChartSummary}
            </p>
            <p aria-label="Overlay Marker Summary" className="market-overlay-marker-summary">
              Markers: trade:{marketOverlayAnnotationSummary.tradeCount} · risk:
              {marketOverlayAnnotationSummary.riskCount} · feed:
              {marketOverlayAnnotationSummary.feedCount} · latest:
              {marketOverlayAnnotationSummary.latestLabel}
            </p>
            <p aria-label="Overlay Marker Drilldown" className="market-overlay-marker-drilldown">
              Marker focus: {marketOverlayMarkerDrilldown.focus} · window:
              {marketOverlayMarkerDrilldown.window} · age:
              {marketOverlayMarkerDrilldown.ageFilter} · scope:
              {marketOverlayMarkerDrilldown.bucketScope} · order:
              {marketOverlayMarkerDrilldown.timelineOrder} · visible:
              {marketOverlayMarkerDrilldown.visibleCount} · latest:
              {marketOverlayMarkerDrilldown.latestLabel}
            </p>
            <p aria-label="Overlay Correlation Hint" className="market-overlay-correlation-hint">
              Correlation: {marketOverlayCorrelationHint}
            </p>
            <p
              aria-label="Overlay Marker Drilldown Detail"
              className="market-overlay-marker-drilldown-detail"
            >
              Marker detail: {marketOverlayMarkerDrilldownDetail}
            </p>
            <p
              aria-label="Overlay Chart Runtime"
              className={`market-overlay-chart-runtime runtime-${marketOverlayChartRuntime}`}
            >
              Runtime: {marketOverlayChartRuntime}
            </p>
          </div>
          <section className="market-overlay-controls">
            <label>
              Marker Window
              <select
                value={marketOverlayMarkerWindow}
                onChange={(event) =>
                  setMarketOverlayMarkerWindow(
                    Number.parseInt(event.target.value, 10) as MarketOverlayMarkerWindow,
                  )
                }
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
              </select>
            </label>
            <label>
              Marker Focus
              <select
                value={marketOverlayMarkerFocus}
                onChange={(event) =>
                  setMarketOverlayMarkerFocus(event.target.value as MarketOverlayMarkerFocus)
                }
              >
                <option value="all">all</option>
                <option value="trade">trade</option>
                <option value="risk">risk</option>
                <option value="feed">feed</option>
              </select>
            </label>
            <label>
              Marker Age
              <select
                value={marketOverlayMarkerAgeFilter}
                onChange={(event) =>
                  setMarketOverlayMarkerAgeFilter(event.target.value as MarketOverlayMarkerAgeFilter)
                }
              >
                <option value="all">all</option>
                <option value="last-60s">last-60s</option>
                <option value="last-300s">last-300s</option>
              </select>
            </label>
            <label>
              Marker Bucket
              <select
                value={marketOverlayMarkerBucket}
                onChange={(event) =>
                  setMarketOverlayMarkerBucket(event.target.value as MarketOverlayMarkerBucket)
                }
              >
                <option value="none">none</option>
                <option value="30s">30s</option>
                <option value="60s">60s</option>
              </select>
            </label>
            <label>
              Bucket Scope
              <select
                value={marketOverlayBucketScope}
                onChange={(event) =>
                  setMarketOverlayBucketScope(event.target.value as MarketOverlayBucketScope)
                }
              >
                <option value="all-buckets">all-buckets</option>
                <option value="latest-bucket">latest-bucket</option>
              </select>
            </label>
            <label>
              Timeline Order
              <select
                value={marketOverlayTimelineOrder}
                onChange={(event) =>
                  setMarketOverlayTimelineOrder(event.target.value as MarketOverlayTimelineOrder)
                }
              >
                <option value="newest-first">newest-first</option>
                <option value="oldest-first">oldest-first</option>
              </select>
            </label>
            <label>
              Chart Lens
              <select
                value={marketOverlayChartLens}
                onChange={(event) =>
                  setMarketOverlayChartLens(event.target.value as MarketOverlayChartLens)
                }
              >
                <option value="price-only">price-only</option>
                <option value="price-and-trend">price-and-trend</option>
                <option value="diagnostics">diagnostics</option>
              </select>
            </label>
            <label>
              Overlay Mode
              <select
                value={marketOverlayMode}
                onChange={(event) => setMarketOverlayMode(event.target.value as MarketOverlayMode)}
              >
                <option value="price-only">price-only</option>
                <option value="with-trades">with-trades</option>
                <option value="with-risk">with-risk</option>
              </select>
            </label>
            <div className="market-overlay-legend" aria-label="Overlay Legend">
              <span className="overlay-chip active">price</span>
              <span
                className={`overlay-chip ${marketOverlayMode !== 'price-only' ? 'active' : 'inactive'}`}
              >
                trades
              </span>
              <span
                className={`overlay-chip ${marketOverlayMode === 'with-risk' ? 'active' : 'inactive'}`}
              >
                risk
              </span>
              <span
                className={`overlay-chip ${marketOverlayMode === 'with-risk' ? 'active' : 'inactive'}`}
              >
                feed
              </span>
            </div>
            <div className="market-overlay-annotation-list" aria-label="Overlay Markers">
              {marketOverlayScopedVisibleAnnotations.length === 0 ? (
                <span className="overlay-marker-chip overlay-marker-none">none</span>
              ) : (
                marketOverlayScopedVisibleAnnotations.map((annotation) => (
                  <button
                    type="button"
                    key={annotation.id}
                    className={`overlay-marker-chip overlay-marker-${annotation.kind} overlay-marker-tone-${annotation.tone} ${marketOverlaySelectedMarkerId === annotation.id ? 'is-selected' : ''}`}
                    onClick={() => setMarketOverlaySelectedMarkerId(annotation.id)}
                    onKeyDown={onMarketOverlayMarkerKeyDown}
                    aria-pressed={marketOverlaySelectedMarkerId === annotation.id}
                  >
                    {annotation.kind}:{annotation.label}
                  </button>
                ))
              )}
            </div>
            <p aria-label="Overlay Marker Timeline Bucket Summary">
              Timeline buckets: {marketOverlayMarkerBucketSummary}
            </p>
            <p aria-label="Overlay Marker Navigation">Marker nav: {marketOverlayMarkerNavigationLabel}</p>
            <div className="market-overlay-marker-navigation">
              <button
                type="button"
                onClick={selectOldestMarketOverlayMarker}
                disabled={!canSelectOldestMarketOverlayMarker}
              >
                Oldest Marker
              </button>
              <button
                type="button"
                onClick={selectPreviousMarketOverlayMarker}
                disabled={!canSelectPreviousMarketOverlayMarker}
              >
                Previous Marker
              </button>
              <button
                type="button"
                onClick={selectNextMarketOverlayMarker}
                disabled={!canSelectNextMarketOverlayMarker}
              >
                Next Marker
              </button>
              <button
                type="button"
                onClick={selectLatestMarketOverlayMarker}
                disabled={!canSelectLatestMarketOverlayMarker}
              >
                Latest Marker
              </button>
            </div>
            <div className="market-overlay-timeline-list" aria-label="Overlay Marker Timeline">
              {marketOverlayMarkerTimelineRows.length === 0 ? (
                <span className="overlay-marker-chip overlay-marker-none">none</span>
              ) : (
                marketOverlayMarkerTimelineRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className={`overlay-marker-timeline-row ${row.isSelected ? 'is-selected' : ''}`}
                    onClick={() => setMarketOverlaySelectedMarkerId(row.id)}
                    onKeyDown={onMarketOverlayMarkerKeyDown}
                    aria-pressed={row.isSelected}
                  >
                    {row.text}
                  </button>
                ))
              )}
            </div>
            <p aria-label="Overlay Live Summary">Live: {marketOverlayLiveSummary}</p>
            <p aria-label="Overlay Window Summary">Window: {marketOverlayWindowSummary}</p>
            <p aria-label="Overlay Trend" className={`overlay-trend ${marketOverlayTrend.className}`}>
              Trend: {marketOverlayTrend.label}
            </p>
            <p
              aria-label="Overlay Volatility"
              className={`overlay-volatility ${marketOverlayVolatility.className}`}
            >
              Volatility: {marketOverlayVolatility.label}
            </p>
            <p aria-label="Overlay Pulse" className={`overlay-pulse ${marketOverlayPulse.className}`}>
              Pulse: {marketOverlayPulse.label}
            </p>
            <p aria-label="Overlay Regime" className={`overlay-regime ${marketOverlayRegime.className}`}>
              Regime: {marketOverlayRegime.label}
            </p>
            <button type="button" onClick={refreshMarketOverlaySnapshot}>
              Refresh Overlay Snapshot
            </button>
            <p aria-label="Overlay Snapshot Time">
              Snapshot: {marketOverlaySnapshotAt ?? 'never'}
            </p>
            <p aria-label="Overlay Snapshot Summary">
              Summary: {marketOverlaySnapshotSummary}
            </p>
          </section>
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
              <button type="button" onClick={() => void sendRiskStatus()}>
                Risk Status
              </button>
              <button type="button" onClick={() => void sendRiskEmergencyStop()}>
                Emergency Stop
              </button>
              <button type="button" onClick={() => void sendRiskResume()}>
                Resume Risk
              </button>
              <button type="button" onClick={sendTradePlace}>
                Place Trade
              </button>
              <button type="button" onClick={sendTradeModify}>
                Modify Trade
              </button>
              <button type="button" onClick={sendTradeCancel}>
                Cancel Trade
              </button>
              <button type="button" onClick={sendTradeClosePosition}>
                Close Position
              </button>
              <button type="button" onClick={() => void sendAccountsList()}>
                Accounts
              </button>
              <button type="button" onClick={() => void sendAgentsList()}>
                Agents
              </button>
              <button type="button" onClick={() => void sendAgentCreate()}>
                Create Agent
              </button>
              <button type="button" onClick={() => void runOnboardingFlow()}>
                Run Onboarding Flow
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
              <button type="button" onClick={() => void sendMarketplaceSignals()}>
                Marketplace Signals
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
              <button type="button" onClick={() => void sendDeviceNotifyTest()}>
                Notify Device
              </button>
              <button type="button" onClick={() => void sendDeviceUnpair()}>
                Unpair Device
              </button>
              <button type="button" onClick={() => void sendFeedSubscribe()}>
                Subscribe Feed
              </button>
              <button type="button" onClick={() => void sendFeedGetCandles()}>
                Get Candles
              </button>
              <button type="button" onClick={() => void sendCopytradePreview()}>
                Copytrade Preview
              </button>
              <button
                type="button"
                onClick={() => void sendFeedUnsubscribe()}
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
                Agent ID
                <input
                  value={managedAgentId}
                  onChange={(event) => setManagedAgentId(event.target.value)}
                />
              </label>
              <label>
                Agent Label
                <input
                  value={managedAgentLabel}
                  onChange={(event) => setManagedAgentLabel(event.target.value)}
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
                Device Notify Message
                <input
                  value={managedDeviceNotifyMessage}
                  onChange={(event) => setManagedDeviceNotifyMessage(event.target.value)}
                />
              </label>
              <label>
                Emergency Action
                <select
                  value={riskEmergencyAction}
                  onChange={(event) =>
                    setRiskEmergencyAction(event.target.value as RiskEmergencyAction)
                  }
                >
                  <option value="pause_trading">pause_trading</option>
                  <option value="cancel_all">cancel_all</option>
                  <option value="close_all">close_all</option>
                  <option value="disable_live">disable_live</option>
                </select>
              </label>
              <label>
                Emergency Reason
                <input
                  value={riskEmergencyReason}
                  onChange={(event) => setRiskEmergencyReason(event.target.value)}
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
              >
                Copy Import Report
              </button>
              <button
                type="button"
                onClick={() => void copyLastImportSummary()}
              >
                Copy Last Summary
              </button>
              <button type="button" onClick={clearPresetImportReport} disabled={!presetImportReport}>
                Clear Import Report
              </button>
              <button
                type="button"
                onClick={() => void copyPresetImportNames()}
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
          <section className="template-panel intervention-panel">
            <h3>Intervention Panel</h3>
            <div className="actions">
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('pause_trading')}
              >
                Pause Trading Now
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('cancel_all')}
              >
                Cancel All Now
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('close_all')}
              >
                Close All Now
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('disable_live')}
              >
                Disable Live Now
              </button>
              <button type="button" onClick={() => void sendInterventionResume()}>
                Resume Trading Now
              </button>
            </div>
            <p aria-label="Intervention Summary">
              Emergency status:{' '}
              {riskEmergencyStopActive === null
                ? 'n/a'
                : riskEmergencyStopActive
                  ? 'active'
                  : 'inactive'}{' '}
              · Last action: {riskLastEmergencyAction ?? 'none'} · Updated:{' '}
              {riskLastEmergencyUpdatedAt ?? 'never'}
            </p>
          </section>
          <section className="template-panel mobile-emergency-panel">
            <h3>Mobile Emergency Controls</h3>
            <div className="mobile-emergency-actions">
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('pause_trading')}
              >
                Mobile Pause
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('cancel_all')}
              >
                Mobile Cancel All
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('close_all')}
              >
                Mobile Close All
              </button>
              <button
                type="button"
                onClick={() => void sendInterventionEmergencyAction('disable_live')}
              >
                Mobile Disable Live
              </button>
              <button type="button" onClick={() => void sendInterventionResume()}>
                Mobile Resume
              </button>
            </div>
            <p aria-label="Mobile Intervention Summary">
              Emergency status:{' '}
              {riskEmergencyStopActive === null
                ? 'n/a'
                : riskEmergencyStopActive
                  ? 'active'
                  : 'inactive'}{' '}
              · Last action: {riskLastEmergencyAction ?? 'none'} · Updated:{' '}
              {riskLastEmergencyUpdatedAt ?? 'never'}
            </p>
          </section>
          <div className="block-list">
            {blocks.length === 0 ? (
              <p className="empty-state">No blocks yet. Connect and trigger gateway methods.</p>
            ) : (
              blocks.map((block) => {
                const blockKind = resolveBlockRenderKind(block)
                const markdownContent = stripBlockTelemetrySegment(block.content).trim()
                return (
                  <article
                    key={block.id}
                    className={`block-card severity-${block.severity}`}
                    data-block-kind={blockKind}
                  >
                    <h3>{block.title}</h3>
                    <p className={`block-kind-label kind-${blockKind.toLowerCase()}`}>{blockKind}</p>
                    {blockKind === 'Markdown' ? (
                      <div className="block-markdown-preview">{markdownContent}</div>
                    ) : (
                      <pre>{block.content}</pre>
                    )}
                    {blockKind === 'RawPayload' ? (
                      <p className="block-raw-hint">Unknown block type; showing raw payload.</p>
                    ) : null}
                  </article>
                )
              })
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
              <dt>Agents (last fetch)</dt>
              <dd>{agentCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Managed Agent</dt>
              <dd>{managedAgentId}</dd>
            </div>
            <div>
              <dt>Onboarding Checklist</dt>
              <dd>
                completed {onboardingCompletedCount}/3 · account:
                {onboardingChecklist.account ? 'done' : 'pending'} · agent:
                {onboardingChecklist.agent ? 'done' : 'pending'} · feed:
                {onboardingChecklist.feed ? 'done' : 'pending'}
              </dd>
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
              <dt>Risk Emergency</dt>
              <dd>
                {riskEmergencyStopActive === null
                  ? 'n/a'
                  : riskEmergencyStopActive
                    ? 'active'
                    : 'inactive'}
              </dd>
            </div>
            <div>
              <dt>Risk Last Action</dt>
              <dd>{riskLastEmergencyAction ?? 'none'}</dd>
            </div>
            <div>
              <dt>Risk Last Reason</dt>
              <dd>{riskLastEmergencyReason ?? 'none'}</dd>
            </div>
            <div>
              <dt>Risk Last Updated</dt>
              <dd>{riskLastEmergencyUpdatedAt ?? 'never'}</dd>
            </div>
            <div>
              <dt>Risk Action Counts</dt>
              <dd>
                pause:{riskEmergencyActionCounts.pause_trading}, cancel:{riskEmergencyActionCounts.cancel_all},
                close:{riskEmergencyActionCounts.close_all}, disable:{riskEmergencyActionCounts.disable_live}
              </dd>
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
              <dt>Candles (last fetch)</dt>
              <dd>{lastFetchedCandlesCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Marketplace Signals (last fetch)</dt>
              <dd>{marketplaceSignalCount ?? 'n/a'}</dd>
            </div>
            <div>
              <dt>Copytrade Preview</dt>
              <dd>{copytradePreviewSummary}</dd>
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
              <dt>Trade Controls</dt>
              <dd className="badge-row">
                {tradeControlEvents.length === 0 ? (
                  <span className="lifecycle-badge">none</span>
                ) : (
                  tradeControlEvents.map((item) => (
                    <span key={item.id} className="lifecycle-badge">
                      {item.action}
                      {item.status ? `:${item.status}` : ''}
                    </span>
                  ))
                )}
              </dd>
            </div>
            <div>
              <dt>Risk Alerts</dt>
              <dd className="badge-row">
                {riskAlerts.length === 0 ? (
                  <span className="lifecycle-badge">none</span>
                ) : (
                  riskAlerts.map((item) => (
                    <span key={item.id} className="lifecycle-badge">
                      {item.kind}
                      {item.status ? `:${item.status}` : ''}
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
                <span className="import-summary-badge badge-hint-mode">
                  blockTelemetry:{isBlockTelemetryVisible ? 'visible' : 'hidden'}
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
                  onClick={() => setIsBlockTelemetryVisible((current) => !current)}
                >
                  {isBlockTelemetryVisible ? 'Hide Block Telemetry' : 'Show Block Telemetry'}
                </button>
                <button
                  type="button"
                  className="summary-copy-button"
                  onClick={resetHelperDiagnosticsPreferences}
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
