import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('Dashboard shell', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
    cleanup()
  })

  it('renders primary dashboard regions', () => {
    render(<App />)

    expect(screen.getByText('Market Panel')).toBeInTheDocument()
    expect(screen.getByText('Agent Feed')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
    expect(screen.getByText('Feed Lifecycle')).toBeInTheDocument()
    expect(screen.getByText('Trade Controls')).toBeInTheDocument()
    expect(screen.getByText('Risk Alerts')).toBeInTheDocument()
    expect(screen.getByText('Quick Action History')).toBeInTheDocument()
    expect(screen.getByText('Preset Import Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Quick Action Timestamps')).toBeInTheDocument()
    expect(screen.getByLabelText('History Filter')).toBeInTheDocument()
    expect(screen.getByLabelText('History Legend')).toBeInTheDocument()
    expect(screen.getByLabelText('Lock Toggle Source Legend')).toBeInTheDocument()
    expect(screen.getByLabelText('Timestamp Format')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
  })

  it('renders gateway action buttons for account/feed listing', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Agents' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Agent' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Run Onboarding Flow' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace Follow' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace Unfollow' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace Follows' })).toBeInTheDocument()
    expect(screen.getByLabelText('Marker Window')).toHaveValue('5')
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('all')
    expect(screen.getByLabelText('Marker Age')).toHaveValue('all')
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('latest')
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('all')
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('3')
    expect(screen.getByLabelText('Delta Filter')).toHaveValue('all')
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('none')
    expect(screen.getByLabelText('Bucket Scope')).toHaveValue('all-buckets')
    expect(screen.getByLabelText('Timeline Order')).toHaveValue('newest-first')
    expect(screen.getByLabelText('Marker Wrap')).toHaveValue('bounded')
    expect(screen.getByLabelText('Selection Mode')).toHaveValue('sticky')
    expect(screen.getByLabelText('Chart Lens')).toHaveValue('price-only')
    expect(screen.getByLabelText('Overlay Mode')).toHaveValue('price-only')
    expect(screen.getByLabelText('Overlay Legend')).toBeInTheDocument()
    expect(screen.getByText('price', { selector: '.overlay-chip' })).toHaveClass('active')
    expect(screen.getByLabelText('Overlay Chart Summary')).toHaveTextContent(
      'Chart: points:none · lens:price-only',
    )
    expect(screen.getByLabelText('Overlay Marker Summary')).toHaveTextContent(
      'Markers: trade:0 · risk:0 · feed:0 · latest:none',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:0 · latest:none',
    )
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent('Correlation: none')
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
      'Marker detail: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Agreement')).toHaveTextContent(
      'Active basis agreement: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Rank')).toHaveTextContent(
      'Active delta rank: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Neighbors')).toHaveTextContent(
      'Active delta neighbors: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Gap Summary')).toHaveTextContent(
      'Active neighbor gaps: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Spread')).toHaveTextContent(
      'Active basis spread: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Delta Change')).toHaveTextContent(
      'Active neighbor delta change: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Tone Summary')).toHaveTextContent(
      'Active neighbor tones: none',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      'Timeline buckets: mode:none · scope:all-buckets · buckets:0 · latest:none · count:0',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Navigation Summary')).toHaveTextContent(
      'Bucket nav: mode:none · keys:,/. · active:none · prev:,=none · next:.=none · buckets:0',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:none · buckets:n/a · latestAvg:n/a · previousAvg:n/a · Δbucket:n/a',
    )
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t0/r0/f0 · selectedKind:none',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:0 · focus:0/0 · age:0/0 · window:0/0 · timeline:0/0 · bucket:0/0 · agreement:0/0 · delta:0/0 · visible:0/0',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:all · matched:0/0 · agree:0 · diverge:0',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=agree · reverse:C=diverge · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:0 · agree:0 · diverge:0 · active:all(0) · next:c=agree(0) · prev:C=diverge(0)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:3 · next:p=5 · prev:P=8',
    )
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:3 · diverge:show:0/0 · agree:show:0/0 · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:all · scoped:t0/r0/f0 · agree:t0/r0/f0 · diverge:t0/r0/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:0/0 · up:0 · down:0 · flat:0 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:all · matched:0/0 · active:off',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Shortcut Summary')).toHaveTextContent(
      'Delta basis shortcuts: keys:h/m/k · latest:h · average:m · cycle:k=average · active:latest',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m0/0|u0|d0|f0|n0 · average:m0/0|u0|d0|f0|n0 · mode:all · active:latest · agree:0/0 · diverge:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:0/0 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:0/0 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=trade · prev:Z=feed · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Chronology Summary')).toHaveTextContent(
      'Chronology: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Summary')).toHaveTextContent(
      'Delta summary: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Tone Summary')).toHaveTextContent(
      'Delta tones: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Alignment Summary')).toHaveTextContent(
      'Delta alignment: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta By Kind Summary')).toHaveTextContent(
      'Delta by kind: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Dispersion Summary')).toHaveTextContent(
      'Delta dispersion: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Momentum Summary')).toHaveTextContent(
      'Delta momentum: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Polarity Summary')).toHaveTextContent(
      'Delta polarity: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Coverage Summary')).toHaveTextContent(
      'Delta coverage: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Confidence Summary')).toHaveTextContent(
      'Delta confidence: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Extremes')).toHaveTextContent(
      'Delta extremes: none',
    )
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 0/0 · selected:none',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: none',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Anchor Summary')).toHaveTextContent(
      'Timeline anchors: none',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: none',
    )
    expect(screen.getByLabelText('Overlay Marker Kind Navigation Summary')).toHaveTextContent(
      'Kind nav: none',
    )
    expect(screen.getByLabelText('Overlay Marker Interval Summary')).toHaveTextContent(
      'Intervals: none',
    )
    expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
      'Shortcuts: steps:off/off · skip:off/off · kind:off/off · bucket:off/off',
    )
    expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
      'Bindings: steps:off/off · skip:off/off · kind:off/off · bucket:off/off · edges:off/off',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: none',
    )
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent('none')
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('none')
    expect(screen.getByLabelText('Overlay Chart Runtime')).toBeInTheDocument()
    expect(screen.getByLabelText('Overlay Live Summary')).toHaveTextContent('Live: candles:0')
    expect(screen.getByLabelText('Overlay Window Summary')).toHaveTextContent('Window: closes:none')
    expect(screen.getByLabelText('Overlay Trend')).toHaveTextContent('Trend: neutral')
    expect(screen.getByLabelText('Overlay Volatility')).toHaveTextContent('Volatility: n/a')
    expect(screen.getByLabelText('Overlay Pulse')).toHaveTextContent('Pulse: quiet (0)')
    expect(screen.getByLabelText('Overlay Regime')).toHaveTextContent('Regime: observe')
    expect(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' })).toBeInTheDocument()
    expect(screen.getByLabelText('Overlay Snapshot Time')).toHaveTextContent('Snapshot: never')
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent('Summary: none')
    expect(screen.getByText('Intervention Panel')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause Trading Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel All Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close All Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disable Live Now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume Trading Now' })).toBeInTheDocument()
    expect(screen.getByText('Mobile Emergency Controls')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Cancel All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Close All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Disable Live' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mobile Resume' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disconnect Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feeds' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Devices' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pair Device' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register Push' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notify Device' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unpair Device' })).toBeInTheDocument()
    expect(screen.getByLabelText('Agent ID')).toHaveValue('agent_eth_5m')
    expect(screen.getByLabelText('Agent Label')).toHaveValue('ETH Momentum Agent')
    expect(screen.getByLabelText('Device Notify Message')).toHaveValue('Dashboard test notification')
    expect(screen.getByLabelText('Emergency Action')).toHaveValue('pause_trading')
    expect(screen.getByLabelText('Emergency Reason')).toHaveValue('dashboard emergency stop trigger')
    expect(screen.getByRole('button', { name: 'Subscribe Feed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get Candles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Risk Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Emergency Stop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume Risk' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Place Trade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modify Trade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel Trade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close Position' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Marketplace Signals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copytrade Preview' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copytrade Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copytrade Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copytrade Resume' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unsubscribe Feed' })).toBeEnabled()
    expect(screen.getByLabelText('Refresh Interval (sec)')).toBeInTheDocument()
    expect(screen.getByLabelText('Min Request Gap (ms)')).toBeInTheDocument()
    expect(screen.getByLabelText('Enable Auto Refresh')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export Presets JSON' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import Presets JSON' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear Import JSON' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Expand Report' })).toBeDisabled()
    expect(screen.getByLabelText('Import Mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Import Mode Badge')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Collapse Helper Diagnostics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge Tools' })).toBeInTheDocument()
    expect(screen.getByLabelText('Helper Reset Badge')).toHaveTextContent('last reset: never')
    expect(screen.getByLabelText('Helper Reset Badge')).toHaveClass('tone-none')
    expect(screen.getByRole('button', { name: 'Copy Reset Badge' })).toBeInTheDocument()
    expect(screen.getByText('Ctrl/Cmd+Enter', { selector: '.hotkey-chip' })).toBeInTheDocument()
    expect(screen.getByText('/', { selector: '.hotkey-chip' })).toHaveAttribute(
      'title',
      'Slash toggles hint mode only when import input is empty.',
    )
    expect(screen.getByText(/overwrites conflicting presets\./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Hints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Compact Hints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Legend in Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge' })).toBeInTheDocument()
    expect(screen.getByLabelText('Legend Order')).toHaveValue('import-first')
    expect(screen.getByLabelText('Legend Density')).toHaveValue('chips')
    expect(screen.getByRole('button', { name: 'Copy Shortcut Cheat Sheet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toHaveAttribute(
      'title',
      'Quick toggles expanded; reset lock is locked.',
    )
    expect(screen.getByText('(lock:locked)', { selector: '.quick-toggle-lock-state' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Hide Hints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Show Legend' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Hide Reset Badge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveTextContent('quickLock:locked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveClass('quick-lock-locked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveAttribute(
      'title',
      'Quick lock summary: reset lock is locked.',
    )
    expect(screen.getByText('Preset Import Snapshot', { selector: 'dt' })).toHaveTextContent(
      'Preset Import Snapshot (lock:locked)',
    )
    expect(screen.getByText('Helper Diagnostics', { selector: 'dt' })).toHaveTextContent(
      'Helper Diagnostics (lock:locked)',
    )
    expect(
      screen.getByText('diag:compact', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('resetAge:never', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('resetLock:locked', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('helper-reset-lock-badge', 'lock-locked')
    expect(
      screen.getByText('lockToggles:0', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('counter-tone-none')
    expect(
      screen.getByText('srcAlt+L:0', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('counter-tone-none')
    expect(
      screen.getByText('srcControls:0', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('counter-tone-none')
    expect(
      screen.getByText('srcSnapshot:0', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('counter-tone-none')
    expect(
      screen.getByText('lockCounterReset:never', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Alt+L:0')).toHaveClass('counter-tone-none')
    expect(screen.getByRole('button', { name: 'Use Verbose Diagnostics' })).toBeInTheDocument()
    expect(
      screen.getByText('enabled:1/2', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('reset:never', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('tone:none', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('staleAfter:24h', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('lock:locked', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('helper-reset-lock-badge', 'lock-locked')
    expect(
      screen.getByText('diagLockToggles:0', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('counterReset:never', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('blockTelemetry:visible', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reset TS')).toHaveValue('absolute')
    expect(screen.getByLabelText('Stale After')).toHaveValue('24')
    expect(screen.getByRole('button', { name: 'Copy Helper Summary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Block Telemetry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Lock Counters' })).toBeEnabled()
    expect(screen.getByText('Last import: none')).toBeInTheDocument()
    expect(screen.getByText('Alt+L:0')).toBeInTheDocument()
    expect(screen.getByText('controls:0')).toBeInTheDocument()
    expect(screen.getByText('snapshot:0')).toBeInTheDocument()
    expect(screen.getByText('Risk Emergency').closest('div')).toHaveTextContent('n/a')
    expect(screen.getByText('Risk Last Action').closest('div')).toHaveTextContent('none')
    expect(screen.getByText('Risk Last Reason').closest('div')).toHaveTextContent('none')
    expect(screen.getByText('Risk Last Updated').closest('div')).toHaveTextContent('never')
    expect(screen.getByText('Risk Action Counts').closest('div')).toHaveTextContent(
      'pause:0, cancel:0, close:0, disable:0',
    )
    expect(screen.getByText('Trade Controls').closest('div')).toHaveTextContent('none')
    expect(screen.getByText('Risk Alerts').closest('div')).toHaveTextContent('none')
    expect(screen.getByText('Agents (last fetch)').closest('div')).toHaveTextContent('n/a')
    expect(screen.getByText('Managed Agent').closest('div')).toHaveTextContent('agent_eth_5m')
    expect(screen.getByText('Onboarding Checklist').closest('div')).toHaveTextContent(
      'completed 0/3',
    )
    expect(screen.getByLabelText('Intervention Summary')).toHaveTextContent(
      'Emergency status: n/a · Last action: none · Updated: never',
    )
    expect(screen.getByLabelText('Mobile Intervention Summary')).toHaveTextContent(
      'Emergency status: n/a · Last action: none · Updated: never',
    )
    expect(screen.getByText('Marketplace Signals (last fetch)').closest('div')).toHaveTextContent(
      'n/a',
    )
    expect(screen.getByText('Copytrade Preview', { selector: 'dt' }).closest('div')).toHaveTextContent(
      'none',
    )
    expect(screen.getByText('Copytrade Control', { selector: 'dt' }).closest('div')).toHaveTextContent(
      'none',
    )
  })

  it('persists market overlay mode preference in localStorage', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Overlay Mode'), {
      target: { value: 'with-risk' },
    })
    fireEvent.change(screen.getByLabelText('Chart Lens'), {
      target: { value: 'diagnostics' },
    })
    fireEvent.change(screen.getByLabelText('Marker Focus'), {
      target: { value: 'risk' },
    })
    fireEvent.change(screen.getByLabelText('Marker Window'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByLabelText('Marker Age'), {
      target: { value: 'last-60s' },
    })
    fireEvent.change(screen.getByLabelText('Delta Basis'), {
      target: { value: 'average' },
    })
    fireEvent.change(screen.getByLabelText('Basis Agreement'), {
      target: { value: 'diverge' },
    })
    fireEvent.change(screen.getByLabelText('Basis Preview'), {
      target: { value: '8' },
    })
    fireEvent.change(screen.getByLabelText('Delta Filter'), {
      target: { value: 'latest-down' },
    })
    fireEvent.change(screen.getByLabelText('Marker Bucket'), {
      target: { value: '60s' },
    })
    fireEvent.change(screen.getByLabelText('Bucket Scope'), {
      target: { value: 'latest-bucket' },
    })
    fireEvent.change(screen.getByLabelText('Timeline Order'), {
      target: { value: 'oldest-first' },
    })
    fireEvent.change(screen.getByLabelText('Marker Wrap'), {
      target: { value: 'wrap' },
    })
    fireEvent.change(screen.getByLabelText('Selection Mode'), {
      target: { value: 'follow-latest' },
    })

    expect(window.localStorage.getItem('quick-action-market-overlay-mode-v1')).toBe('with-risk')
    expect(window.localStorage.getItem('quick-action-market-overlay-chart-lens-v1')).toBe(
      'diagnostics',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-focus-v1')).toBe('risk')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-window-v1')).toBe('8')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-age-filter-v1')).toBe(
      'last-60s',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-delta-basis-v1')).toBe(
      'average',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'diverge',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-divergence-preview-v1')).toBe(
      '8',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-delta-filter-v1')).toBe(
      'latest-down',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-bucket-v1')).toBe('60s')
    expect(window.localStorage.getItem('quick-action-market-overlay-bucket-scope-v1')).toBe(
      'latest-bucket',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-timeline-order-v1')).toBe(
      'oldest-first',
    )
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-wrap-v1')).toBe('wrap')
    expect(window.localStorage.getItem('quick-action-market-overlay-selection-mode-v1')).toBe(
      'follow-latest',
    )
  })

  it('shows chart fallback runtime when ResizeObserver is unavailable', async () => {
    const resizeObserverDescriptor = Object.getOwnPropertyDescriptor(window, 'ResizeObserver')
    try {
      Object.defineProperty(window, 'ResizeObserver', {
        configurable: true,
        value: undefined,
      })

      render(<App />)

      await waitFor(() => {
        expect(screen.getByLabelText('Overlay Chart Runtime')).toHaveTextContent(
          'Runtime: fallback',
        )
      })
    } finally {
      if (resizeObserverDescriptor) {
        Object.defineProperty(window, 'ResizeObserver', resizeObserverDescriptor)
      } else {
        Reflect.deleteProperty(window, 'ResizeObserver')
      }
    }
  })

  it('initializes delta basis preference from localStorage', () => {
    window.localStorage.setItem('quick-action-market-overlay-marker-delta-basis-v1', 'average')
    window.localStorage.setItem('quick-action-market-overlay-marker-basis-agreement-v1', 'diverge')
    window.localStorage.setItem('quick-action-market-overlay-marker-divergence-preview-v1', '5')

    render(<App />)

    expect(screen.getByLabelText('Delta Basis')).toHaveValue('average')
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('diverge')
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('5')
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:diverge · matched:0/0 · agree:0 · diverge:0',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=all · reverse:C=agree · active:diverge',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:0 · agree:0 · diverge:0 · active:diverge(0) · next:c=all(0) · prev:C=agree(0)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:5 · next:p=8 · prev:P=3',
    )
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:5 · diverge:show:0/0 · agree:show:0/0 · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:diverge · scoped:t0/r0/f0 · agree:t0/r0/f0 · diverge:t0/r0/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:0 · focus:0/0 · age:0/0 · window:0/0 · timeline:0/0 · bucket:0/0 · agreement:0/0 · delta:0/0 · visible:0/0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:average · mode:all · matched:0/0 · up:0 · down:0 · flat:0 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:average · mode:all · matched:0/0 · active:off',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Shortcut Summary')).toHaveTextContent(
      'Delta basis shortcuts: keys:h/m/k · latest:h · average:m · cycle:k=latest · active:average',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m0/0|u0|d0|f0|n0 · average:m0/0|u0|d0|f0|n0 · mode:all · active:average · agree:0/0 · diverge:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:0/0 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:0/0 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=trade · prev:Z=feed · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=diverge · basis:k=average · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
  })

  it('refreshes market overlay snapshot summary by selected mode', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' }))
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent(
      'Summary: candles:0 · chartPoints:0 · chartLens:price-only · markerFocus:all · markerWindow:5 · markerAge:all · markerAgreement:all · markerAgreementMatched:0/0 · markerDelta:all · markerDeltaBasis:latest · markerDeltaMatched:0/0 · markerBucket:none · bucketScope:all-buckets · timelineOrder:newest-first · markerWrap:bounded · markerSelection:sticky · markerNav:0/0|selected:none · markers:t0/r0/f0 · corr:none · trend:neutral · vol:n/a · pulse:quiet(0) · regime:observe',
    )
    expect(screen.getByLabelText('Overlay Snapshot Time')).not.toHaveTextContent('Snapshot: never')

    fireEvent.change(screen.getByLabelText('Overlay Mode'), {
      target: { value: 'with-trades' },
    })
    fireEvent.change(screen.getByLabelText('Delta Basis'), {
      target: { value: 'average' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' }))
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent(
      'Summary: candles:0 · tradeEvents:0 · chartPoints:0 · chartLens:price-only · markerFocus:all · markerWindow:5 · markerAge:all · markerAgreement:all · markerAgreementMatched:0/0 · markerDelta:all · markerDeltaBasis:average · markerDeltaMatched:0/0 · markerBucket:none · bucketScope:all-buckets · timelineOrder:newest-first · markerWrap:bounded · markerSelection:sticky · markerNav:0/0|selected:none · markers:t0/r0/f0 · corr:none · trend:neutral · vol:n/a · pulse:quiet(0) · regime:observe',
    )

    fireEvent.change(screen.getByLabelText('Overlay Mode'), {
      target: { value: 'with-risk' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' }))
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent(
      'Summary: candles:0 · tradeEvents:0 · riskAlerts:0 · chartPoints:0 · chartLens:price-only · markerFocus:all · markerWindow:5 · markerAge:all · markerAgreement:all · markerAgreementMatched:0/0 · markerDelta:all · markerDeltaBasis:average · markerDeltaMatched:0/0 · markerBucket:none · bucketScope:all-buckets · timelineOrder:newest-first · markerWrap:bounded · markerSelection:sticky · markerNav:0/0|selected:none · markers:t0/r0/f0 · corr:none · trend:neutral · vol:n/a · pulse:quiet(0) · regime:observe',
    )
  })

  it('updates overlay legend and live summary by selected mode and events', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
          params?: {
            action?: string
          }
        }
        if (payload.type !== 'req' || !payload.id) {
          return
        }

        if (payload.method === 'feeds.getCandles') {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    symbol: 'ETHUSDm',
                    timeframe: '5m',
                    candles: [{ close: 1 }, { close: 2 }],
                  },
                }),
              }),
            )
          })
          return
        }

        if (payload.method === 'risk.emergencyStop') {
          queueMicrotask(() => {
            if (payload.params?.action === 'close_all') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.trade.closed',
                    payload: {
                      status: 'queued',
                    },
                  }),
                }),
              )
            }
            if (payload.params?.action === 'disable_live') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.risk.alert',
                    payload: {
                      status: 'raised',
                      kind: 'live_trading_disabled',
                    },
                  }),
                }),
              )
            }
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergency: true,
                    action: payload.params?.action ?? 'pause_trading',
                    reason: 'test',
                    updatedAt: '2025-01-01T00:00:00Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Overlay Mode'), { target: { value: 'with-trades' } })

    const legend = screen.getByLabelText('Overlay Legend')
    expect(within(legend).getByText('trades', { selector: '.overlay-chip' })).toHaveClass('active')
    expect(within(legend).getByText('risk', { selector: '.overlay-chip' })).toHaveClass('inactive')
    expect(screen.getByLabelText('Overlay Live Summary')).toHaveTextContent(
      'Live: candles:0 · tradeEvents:0',
    )
    expect(screen.getByLabelText('Overlay Window Summary')).toHaveTextContent(
      'Window: closes:none · trades:0',
    )
    expect(screen.getByLabelText('Overlay Chart Summary')).toHaveTextContent(
      'Chart: points:none · lens:price-only',
    )
    expect(screen.getByLabelText('Overlay Marker Summary')).toHaveTextContent(
      'Markers: trade:0 · risk:0 · feed:0 · latest:none',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:0 · latest:none',
    )
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent('Correlation: none')
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
      'Marker detail: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Agreement')).toHaveTextContent(
      'Active basis agreement: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Rank')).toHaveTextContent(
      'Active delta rank: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Neighbors')).toHaveTextContent(
      'Active delta neighbors: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Gap Summary')).toHaveTextContent(
      'Active neighbor gaps: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Spread')).toHaveTextContent(
      'Active basis spread: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Delta Change')).toHaveTextContent(
      'Active neighbor delta change: none',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Tone Summary')).toHaveTextContent(
      'Active neighbor tones: none',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      'Timeline buckets: mode:none · scope:all-buckets · buckets:0 · latest:none · count:0',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Navigation Summary')).toHaveTextContent(
      'Bucket nav: mode:none · keys:,/. · active:none · prev:,=none · next:.=none · buckets:0',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:none · buckets:n/a · latestAvg:n/a · previousAvg:n/a · Δbucket:n/a',
    )
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t0/r0/f0 · selectedKind:none',
    )
    expect(screen.getByLabelText('Overlay Marker Chronology Summary')).toHaveTextContent(
      'Chronology: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Summary')).toHaveTextContent(
      'Delta summary: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Tone Summary')).toHaveTextContent(
      'Delta tones: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Alignment Summary')).toHaveTextContent(
      'Delta alignment: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta By Kind Summary')).toHaveTextContent(
      'Delta by kind: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Dispersion Summary')).toHaveTextContent(
      'Delta dispersion: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Momentum Summary')).toHaveTextContent(
      'Delta momentum: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Polarity Summary')).toHaveTextContent(
      'Delta polarity: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Coverage Summary')).toHaveTextContent(
      'Delta coverage: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Confidence Summary')).toHaveTextContent(
      'Delta confidence: none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Extremes')).toHaveTextContent(
      'Delta extremes: none',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 0/0 · selected:none',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: none',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Anchor Summary')).toHaveTextContent(
      'Timeline anchors: none',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: none',
    )
    expect(screen.getByLabelText('Overlay Marker Kind Navigation Summary')).toHaveTextContent(
      'Kind nav: none',
    )
    expect(screen.getByLabelText('Overlay Marker Interval Summary')).toHaveTextContent(
      'Intervals: none',
    )
    expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
      'Shortcuts: steps:off/off · skip:off/off · kind:off/off · bucket:off/off',
    )
    expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
      'Bindings: steps:off/off · skip:off/off · kind:off/off · bucket:off/off · edges:off/off',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: none',
    )
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent('none')
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('none')
    expect(screen.getByLabelText('Overlay Trend')).toHaveTextContent('Trend: neutral')
    expect(screen.getByLabelText('Overlay Trend')).toHaveClass('overlay-trend-neutral')
    expect(screen.getByLabelText('Overlay Volatility')).toHaveTextContent('Volatility: n/a')
    expect(screen.getByLabelText('Overlay Volatility')).toHaveClass('overlay-volatility-none')
    expect(screen.getByLabelText('Overlay Pulse')).toHaveTextContent('Pulse: quiet (0)')
    expect(screen.getByLabelText('Overlay Pulse')).toHaveClass('overlay-pulse-quiet')
    expect(screen.getByLabelText('Overlay Regime')).toHaveTextContent('Regime: observe')
    expect(screen.getByLabelText('Overlay Regime')).toHaveClass('overlay-regime-observe')

    fireEvent.change(screen.getByLabelText('Overlay Mode'), { target: { value: 'with-risk' } })
    expect(within(legend).getByText('risk', { selector: '.overlay-chip' })).toHaveClass('active')
    expect(within(legend).getByText('feed', { selector: '.overlay-chip' })).toHaveClass('active')
    expect(screen.getByLabelText('Overlay Window Summary')).toHaveTextContent(
      'Window: closes:none · trades:0 · risk:0 · feed:0',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Get Candles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disable Live Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Live Summary')).toHaveTextContent(
        'Live: candles:2 · tradeEvents:1 · riskAlerts:1',
      )
      expect(screen.getByLabelText('Overlay Window Summary')).toHaveTextContent(
        'Window: closes:1,2 · trades:1 · risk:1 · feed:0',
      )
      expect(screen.getByLabelText('Overlay Chart Summary')).toHaveTextContent(
        'Chart: points:2 · last:2.00 · lens:price-only',
      )
      expect(screen.getByLabelText('Overlay Marker Summary')).toHaveTextContent(
        'Markers: trade:1 · risk:1 · feed:0 · latest:risk:live_trading_disabled:raised',
      )
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:2 · latest:risk:live_trading_disabled:raised',
      )
      expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
        'Correlation: risk:live_trading_disabled:raised@2.00(t2)',
      )
      expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
        'Marker detail: risk:live_trading_disabled:raised · t2 · close:2.00 · Δavg:+0.50',
      )
      expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
        'Δavg:+0.50 (+33.33%)',
      )
      expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
        'Δprev:+1.00 (+100.00%)',
      )
      expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
        'tone:warning',
      )
      expect(screen.getByLabelText('Overlay Marker Active Basis Agreement')).toHaveTextContent(
        'Active basis agreement: risk:live_trading_disabled:raised · latest:flat(+0.00) · average:up(+0.50) · relation:diverge',
      )
      expect(screen.getByLabelText('Overlay Marker Active Delta Rank')).toHaveTextContent(
        'Active delta rank: latest:1/2 · average:1/2 · scope:all · mode:all',
      )
      expect(screen.getByLabelText('Overlay Marker Active Delta Neighbors')).toHaveTextContent(
        'Active delta neighbors: active:risk:live_trading_disabled:raised · prev:trade:closed:queued(Δl:-1.00|Δa:-0.50) · next:none · scope:all/all',
      )
      expect(screen.getByLabelText('Overlay Marker Active Neighbor Gap Summary')).toHaveTextContent(
        'Active neighbor gaps: slot:2/2 · prev:trade:closed:queued|Δt:1 · next:none|Δt:n/a · order:newest-first',
      )
      expect(screen.getByLabelText('Overlay Marker Active Basis Spread')).toHaveTextContent(
        'Active basis spread: active:risk:live_trading_disabled:raised:-0.50 · prev:-0.50 · next:n/a · basis:latest · mode:all',
      )
      expect(screen.getByLabelText('Overlay Marker Active Neighbor Delta Change')).toHaveTextContent(
        'Active neighbor delta change: active:risk:live_trading_disabled:raised · latest:prev->active:+1.00|active->next:n/a · average:prev->active:+1.00|active->next:n/a · basis:latest · mode:all',
      )
      expect(screen.getByLabelText('Overlay Marker Active Neighbor Tone Summary')).toHaveTextContent(
        'Active neighbor tones: active:flat · prev:down(diverge) · next:n/a · basis:latest · mode:all',
      )
      expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
        'Timeline buckets: mode:none · scope:all-buckets · buckets:2 · latest:t2 · count:2',
      )
      expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
        'Bucket deltas: mode:none · buckets:n/a · latestAvg:n/a · previousAvg:n/a · Δbucket:n/a',
      )
      expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
        'Scope: visible:t1/r1/f0 · selectedKind:risk',
      )
      expect(screen.getByLabelText('Overlay Marker Chronology Summary')).toHaveTextContent(
        /Chronology: count:2 · span:/,
      )
      expect(screen.getByLabelText('Overlay Marker Delta Summary')).toHaveTextContent(
        'Delta summary: Δlatest:-0.50 (n:2) · Δavg:+0.00 (n:2) · Δprev:+1.00 (n:1)',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Tone Summary')).toHaveTextContent(
        'Delta tones: up:1 · down:0 · flat:0 · n/a:1 · dominant:up',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Alignment Summary')).toHaveTextContent(
        'Delta alignment: aligned:+0/-1 · mixed:0 · flat:1 · n/a:0',
      )
      expect(screen.getByLabelText('Overlay Marker Delta By Kind Summary')).toHaveTextContent(
        'Delta by kind: t:n1 · Δl:-1.00 · Δa:-0.50 · Δp:n/a · r:n1 · Δl:+0.00 · Δa:+0.50 · Δp:+1.00 · f:n0 · Δl:n/a · Δa:n/a · Δp:n/a',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Dispersion Summary')).toHaveTextContent(
        'Delta dispersion: Δlatest:min:-1.00|max:+0.00|spread:1.00|n:2 · Δavg:min:-0.50|max:+0.50|spread:1.00|n:2 · Δprev:min:+1.00|max:+1.00|spread:0.00|n:1',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Momentum Summary')).toHaveTextContent(
        'Delta momentum: improving:1 · softening:0 · flat:0 · latestShift:+1.00',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Polarity Summary')).toHaveTextContent(
        'Delta polarity: Δl:p0/n1/z1/u0 · Δa:p1/n1/z0/u0 · Δp:p1/n0/z0/u1',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Coverage Summary')).toHaveTextContent(
        'Delta coverage: full:1/2 · partial:1 · missing:0 · ready:l2/a2/p1',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Confidence Summary')).toHaveTextContent(
        'Delta confidence: agree:1 · conflict:0 · neutral:1 · n/a:0 · fullComparative:2/2',
      )
      expect(screen.getByLabelText('Overlay Marker Delta Extremes')).toHaveTextContent(
        'Delta extremes: rise:risk:live_trading_disabled:raised:+0.00 (+0.00%) · drop:trade:closed:queued:-1.00 (-50.00%) · spread:1.00',
      )
      expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
        'risk:live_trading_disabled:raised · t2 · close:2.00',
      )
      expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
        'trade:closed:queued · t1 · close:1.00',
      )
      expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
        'risk:live_trading_disabled:raised · t2 · close:2.00 · Δlatest:+0.00 (+0.00%) · Δavg:+0.50 (+33.33%) · Δprev:+1.00 (+100.00%) · bucket:none',
      )
      expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
        'trade:closed:queued · t1 · close:1.00 · Δlatest:-1.00 (-50.00%) · Δavg:-0.50 (-33.33%) · Δprev:n/a · bucket:none',
      )
      expect(
        screen.getByRole('button', {
          name: /risk:live_trading_disabled:raised · t2 · close:2\.00/,
        }),
      ).toHaveAttribute('aria-pressed', 'true')
      expect(
        screen.getByRole('button', {
          name: /trade:closed:queued · t1 · close:1\.00/,
        }),
      ).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
        'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
      )
      expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
        'Targets: prev:trade:closed:queued · next:none · skipBack:none · skipForward:none · prevKind:none · nextKind:none · prevBucket:none · nextBucket:none',
      )
      expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
        'Distance: edges:o1/l0 · kind:n/a/n/a · bucket:n/a/n/a · step:2',
      )
      expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
        'Shortcuts: steps:on/off · skip:off/off · kind:off/off · bucket:off/off',
      )
      expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
        'Bindings: steps:on/off · skip:off/off · kind:off/off · bucket:off/off · edges:on/off',
      )
      expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
        'Jump keys: keys:1-2 · selected:2/2',
      )
      expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
        'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
      )
      expect(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('button', { name: 'trade:closed:queued' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next Marker' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeDisabled()
      expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent(
        'risk:live_trading_disabled:raised',
      )
      expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
      expect(screen.getByLabelText('Overlay Trend')).toHaveTextContent('Trend: up (+1.00)')
      expect(screen.getByLabelText('Overlay Trend')).toHaveClass('overlay-trend-up')
      expect(screen.getByLabelText('Overlay Volatility')).toHaveTextContent(
        'Volatility: range:1.00 · moderate',
      )
      expect(screen.getByLabelText('Overlay Volatility')).toHaveClass('overlay-volatility-moderate')
      expect(screen.getByLabelText('Overlay Pulse')).toHaveTextContent('Pulse: intense (5)')
      expect(screen.getByLabelText('Overlay Pulse')).toHaveClass('overlay-pulse-intense')
      expect(screen.getByLabelText('Overlay Regime')).toHaveTextContent('Regime: risk-on')
      expect(screen.getByLabelText('Overlay Regime')).toHaveClass('overlay-regime-risk-on')
    })

    fireEvent.change(screen.getByLabelText('Marker Focus'), { target: { value: 'risk' } })
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: risk · window:5 · age:all · scope:all-buckets · order:newest-first · visible:1 · latest:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
      'Correlation: risk:live_trading_disabled:raised@2.00(t2)',
    )
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t0/r1/f0 · selectedKind:risk',
    )
    expect(screen.getByLabelText('Overlay Marker Chronology Summary')).toHaveTextContent(
      'Chronology: count:1 · span:0s · avgGap:n/a · latestGap:n/a',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Summary')).toHaveTextContent(
      'Delta summary: Δlatest:+0.00 (n:1) · Δavg:+0.50 (n:1) · Δprev:+1.00 (n:1)',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Tone Summary')).toHaveTextContent(
      'Delta tones: up:1 · down:0 · flat:0 · n/a:0 · dominant:up',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Alignment Summary')).toHaveTextContent(
      'Delta alignment: aligned:+0/-0 · mixed:0 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta By Kind Summary')).toHaveTextContent(
      'Delta by kind: t:n0 · Δl:n/a · Δa:n/a · Δp:n/a · r:n1 · Δl:+0.00 · Δa:+0.50 · Δp:+1.00 · f:n0 · Δl:n/a · Δa:n/a · Δp:n/a',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Dispersion Summary')).toHaveTextContent(
      'Delta dispersion: Δlatest:min:+0.00|max:+0.00|spread:0.00|n:1 · Δavg:min:+0.50|max:+0.50|spread:0.00|n:1 · Δprev:min:+1.00|max:+1.00|spread:0.00|n:1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Momentum Summary')).toHaveTextContent(
      'Delta momentum: insufficient:n1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Polarity Summary')).toHaveTextContent(
      'Delta polarity: Δl:p0/n0/z1/u0 · Δa:p1/n0/z0/u0 · Δp:p1/n0/z0/u0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Coverage Summary')).toHaveTextContent(
      'Delta coverage: full:1/1 · partial:0 · missing:0 · ready:l1/a1/p1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Confidence Summary')).toHaveTextContent(
      'Delta confidence: agree:0 · conflict:0 · neutral:1 · n/a:0 · fullComparative:1/1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Extremes')).toHaveTextContent(
      'Delta extremes: rise:risk:live_trading_disabled:raised:+0.00 (+0.00%) · drop:risk:live_trading_disabled:raised:+0.00 (+0.00%) · spread:0.00',
    )
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent('trade:closed:queued')

    fireEvent.change(screen.getByLabelText('Marker Focus'), { target: { value: 'all' } })
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'ArrowLeft',
    })
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
        'Marker nav: 1/2 · selected:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: prev:none · next:risk:live_trading_disabled:raised · skipBack:none · skipForward:none · prevKind:none · nextKind:none · prevBucket:none · nextBucket:none',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Anchor Summary')).toHaveTextContent(
      'Timeline anchors: first:trade:closed:queued · selected:trade:closed:queued@1/2 · last:risk:live_trading_disabled:raised · Δfirst:0 · Δlast:1 · order:newest-first',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: edges:o0/l1 · kind:n/a/n/a · bucket:n/a/n/a · step:2',
    )
    expect(screen.getByLabelText('Overlay Marker Kind Navigation Summary')).toHaveTextContent(
      'Kind nav: kind:trade · slot:1/1 · prev:[=none|Δn/a · next:]=none|Δn/a',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: keys:1-2 · selected:1/2',
    )
    expect(screen.getByRole('button', { name: 'trade:closed:queued' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeEnabled()
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
      'Correlation: trade:closed:queued@1.00(t1)',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
      'Marker detail: trade:closed:queued · t1 · close:1.00 · Δavg:-0.50',
    )
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t1/r1/f0 · selectedKind:trade',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
      'Δavg:-0.50 (-33.33%)',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent('Δprev:n/a')
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent(
      'tone:positive',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Agreement')).toHaveTextContent(
      'Active basis agreement: trade:closed:queued · latest:down(-1.00) · average:down(-0.50) · relation:agree',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Rank')).toHaveTextContent(
      'Active delta rank: latest:2/2 · average:2/2 · scope:all · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Active Delta Neighbors')).toHaveTextContent(
      'Active delta neighbors: active:trade:closed:queued · prev:none · next:risk:live_trading_disabled:raised(Δl:+0.00|Δa:+0.50) · scope:all/all',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Gap Summary')).toHaveTextContent(
      'Active neighbor gaps: slot:1/2 · prev:none|Δt:n/a · next:risk:live_trading_disabled:raised|Δt:1 · order:newest-first',
    )
    expect(screen.getByLabelText('Overlay Marker Active Basis Spread')).toHaveTextContent(
      'Active basis spread: active:trade:closed:queued:-0.50 · prev:n/a · next:-0.50 · basis:latest · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Delta Change')).toHaveTextContent(
      'Active neighbor delta change: active:trade:closed:queued · latest:prev->active:n/a|active->next:+1.00 · average:prev->active:n/a|active->next:+1.00 · basis:latest · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Active Neighbor Tone Summary')).toHaveTextContent(
      'Active neighbor tones: active:down · prev:n/a · next:flat(diverge) · basis:latest · mode:all',
    )

    fireEvent.keyDown(screen.getByRole('button', { name: 'trade:closed:queued' }), { key: '2' })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: keys:1-2 · selected:2/2',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: '1',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'trade:closed:queued' }), { key: '9' })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Latest Marker' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: prev:trade:closed:queued · next:none · skipBack:none · skipForward:none · prevKind:none · nextKind:none · prevBucket:none · nextBucket:none',
    )
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
      'Correlation: risk:live_trading_disabled:raised@2.00(t2)',
    )
    expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeDisabled()
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'ArrowLeft',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'Home',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'trade:closed:queued' }), { key: 'End' })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'ArrowLeft',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )

    fireEvent.change(screen.getByLabelText('Marker Wrap'), { target: { value: 'wrap' } })
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:wrap · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: prev:risk:live_trading_disabled:raised · next:risk:live_trading_disabled:raised · skipBack:none · skipForward:none · prevKind:none · nextKind:none · prevBucket:none · nextBucket:none',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: edges:o0/l1 · kind:n/a/n/a · bucket:n/a/n/a · step:2',
    )
    expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
      'Shortcuts: steps:on/on · skip:off/off · kind:off/off · bucket:off/off',
    )
    expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
      'Bindings: steps:on/on · skip:off/off · kind:off/off · bucket:off/off · edges:off/on',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: keys:1-2 · selected:1/2',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Previous Marker' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next Marker' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'trade:closed:queued' }), {
      key: 'ArrowLeft',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'ArrowRight',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )

    fireEvent.change(screen.getByLabelText('Marker Wrap'), { target: { value: 'bounded' } })
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
    )
    fireEvent.change(screen.getByLabelText('Timeline Order'), { target: { value: 'oldest-first' } })
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: all · window:5 · age:all · scope:all-buckets · order:oldest-first · visible:2 · latest:risk:live_trading_disabled:raised',
    )
    const markerOrderText = screen.getByLabelText('Overlay Markers').textContent ?? ''
    expect(markerOrderText.indexOf('trade:closed:queued')).toBeLessThan(
      markerOrderText.indexOf('risk:live_trading_disabled:raised'),
    )
    const timelineOrderText = screen.getByLabelText('Overlay Marker Timeline').textContent ?? ''
    expect(timelineOrderText.indexOf('trade:closed:queued')).toBeLessThan(
      timelineOrderText.indexOf('risk:live_trading_disabled:raised'),
    )
    expect(
      screen.getByRole('button', {
        name: /trade:closed:queued · t1 · close:1\.00/,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(
      screen.getByRole('button', {
        name: /risk:live_trading_disabled:raised · t2 · close:2\.00/,
      }),
    )
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
      'Correlation: risk:live_trading_disabled:raised@2.00(t2)',
    )
    expect(
      screen.getByRole('button', {
        name: /risk:live_trading_disabled:raised · t2 · close:2\.00/,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', {
        name: /trade:closed:queued · t1 · close:1\.00/,
      }),
    ).toHaveAttribute('aria-pressed', 'false')

    fireEvent.change(screen.getByLabelText('Chart Lens'), { target: { value: 'diagnostics' } })
    expect(screen.getByLabelText('Overlay Chart Summary')).toHaveTextContent(
      'Chart: points:2 · last:2.00 · trendPoints:0 · baseline:1.50 · lens:diagnostics',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' }))
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent(
      'Summary: candles:2 · tradeEvents:1 · riskAlerts:1 · chartPoints:2 · chartLens:diagnostics · markerFocus:all · markerWindow:5 · markerAge:all · markerAgreement:all · markerAgreementMatched:2/2 · markerDelta:all · markerDeltaBasis:latest · markerDeltaMatched:2/2 · markerBucket:none · bucketScope:all-buckets · timelineOrder:oldest-first · markerWrap:bounded · markerSelection:sticky · markerNav:2/2|selected:risk:live_trading_disabled:raised · markers:t1/r1/f0 · corr:risk:live_trading_disabled:raised@2.00(t2) · trend:up (+1.00) · vol:1.00 · pulse:intense(5) · regime:risk_on',
    )

    sendSpy.mockRestore()
  }, 15_000)

  it('filters visible markers by marker age window', async () => {
    const dateNowSpy = vi.spyOn(Date, 'now')
    let fakeNow = 1_700_000_000_000
    dateNowSpy.mockImplementation(() => fakeNow)

    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
          params?: {
            action?: string
          }
        }
        if (payload.type !== 'req' || !payload.id) {
          return
        }

        if (payload.method === 'feeds.getCandles') {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    symbol: 'ETHUSDm',
                    timeframe: '5m',
                    candles: [{ close: 1 }, { close: 2 }],
                  },
                }),
              }),
            )
          })
          return
        }

        if (payload.method === 'risk.emergencyStop') {
          queueMicrotask(() => {
            if (payload.params?.action === 'close_all') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.trade.closed',
                    payload: {
                      status: 'queued',
                    },
                  }),
                }),
              )
            }
            if (payload.params?.action === 'disable_live') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.risk.alert',
                    payload: {
                      status: 'raised',
                      kind: 'live_trading_disabled',
                    },
                  }),
                }),
              )
            }
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergency: true,
                    action: payload.params?.action ?? 'pause_trading',
                    reason: 'test',
                    updatedAt: '2025-01-01T00:00:00Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Get Candles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disable Live Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:2 · latest:risk:live_trading_disabled:raised',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Anchor Summary')).toHaveTextContent(
      'Timeline anchors: first:trade:closed:queued · selected:risk:live_trading_disabled:raised@2/2 · last:risk:live_trading_disabled:raised · Δfirst:1 · Δlast:0 · order:newest-first',
    )
    expect(screen.getByLabelText('Overlay Marker Kind Navigation Summary')).toHaveTextContent(
      'Kind nav: kind:risk · slot:1/1 · prev:[=none|Δn/a · next:]=none|Δn/a',
    )
    expect(screen.getByLabelText('Overlay Marker Interval Summary')).toHaveTextContent(
      'Intervals: count:2 · stepGap:min:1|max:1|avg:1.00 · active:prev:1|next:n/a',
    )
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      'Timeline buckets: mode:none · scope:all-buckets · buckets:2 · latest:t2 · count:2',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Navigation Summary')).toHaveTextContent(
      'Bucket nav: mode:none · keys:,/. · active:t2(1) · prev:,=none · next:.=none · buckets:2',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:2/2 · up:0 · down:1 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:all · matched:2/2 · active:on',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m2/2|u0|d1|f1|n0 · average:m2/2|u1|d1|f0|n0 · mode:all · active:latest · agree:1/2 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:1/2 · items:risk:live_trading_disabled:raised:flat->up',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:1/2 · items:trade:closed:queued:down',
    )
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=trade · prev:Z=feed · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:all · matched:2/2 · agree:1 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=agree · reverse:C=diverge · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:all(2) · next:c=agree(1) · prev:C=diverge(1)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:3 · next:p=5 · prev:P=8',
    )
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:3 · diverge:show:1/1 · agree:show:1/1 · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:all · scoped:t1/r1/f0 · agree:t1/r0/f0 · diverge:t0/r1/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:2 · focus:2/2 · age:2/2 · window:2/2 · timeline:2/2 · bucket:2/2 · agreement:2/2 · delta:2/2 · visible:2/2',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('latest')
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('all')
    expect(screen.getByLabelText('Delta Filter')).toHaveValue('all')
    const overlayMarkersContainer = screen.getByLabelText('Overlay Markers')
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'x' },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('diverge')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'diverge',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:diverge · matched:1/2 · agree:1 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=all · reverse:C=agree · active:diverge',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:diverge(1) · next:c=all(2) · prev:C=agree(1)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:diverge · scoped:t0/r1/f0 · agree:t1/r0/f0 · diverge:t0/r1/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:3 · diverge:show:1/1 · agree:show:0/0 · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:2 · focus:2/2 · age:2/2 · window:2/2 · timeline:2/2 · bucket:2/2 · agreement:1/2 · delta:1/1 · visible:1/1',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=diverge · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:1/1 · up:0 · down:0 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:all · matched:1/1 · active:on',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:1/1 · items:risk:live_trading_disabled:raised:flat->up',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:0/1 · items:none',
    )
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent('trade:closed:queued')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'e' },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('agree')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'agree',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:agree · matched:1/2 · agree:1 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=diverge · reverse:C=all · active:agree',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:agree(1) · next:c=diverge(1) · prev:C=all(2)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:agree · scoped:t1/r0/f0 · agree:t1/r0/f0 · diverge:t0/r1/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:3 · diverge:show:0/0 · agree:show:1/1 · mode:all',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:2 · focus:2/2 · age:2/2 · window:2/2 · timeline:2/2 · bucket:2/2 · agreement:1/2 · delta:1/1 · visible:1/1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:1/1 · up:0 · down:1 · flat:0 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:0/1 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:1/1 · items:trade:closed:queued:down',
    )
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'q' },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('all')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Summary')).toHaveTextContent(
      'Basis agreement: mode:all · matched:2/2 · agree:1 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=agree · reverse:C=diverge · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:all(2) · next:c=agree(1) · prev:C=diverge(1)',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Kind Summary')).toHaveTextContent(
      'Basis agreement kinds: mode:all · scoped:t1/r1/f0 · agree:t1/r0/f0 · diverge:t0/r1/f0',
    )
    expect(screen.getByLabelText('Overlay Marker Pipeline Summary')).toHaveTextContent(
      'Pipeline: raw:2 · focus:2/2 · age:2/2 · window:2/2 · timeline:2/2 · bucket:2/2 · agreement:2/2 · delta:2/2 · visible:2/2',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:2/2 · up:0 · down:1 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'c' },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('agree')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'agree',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=diverge · reverse:C=all · active:agree',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:agree(1) · next:c=diverge(1) · prev:C=all(2)',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:1/1 · up:0 · down:1 · flat:0 · n/a:0',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'C', shiftKey: true },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('all')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-basis-agreement-v1')).toBe(
      'all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=agree · reverse:C=diverge · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:all(2) · next:c=agree(1) · prev:C=diverge(1)',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:2/2 · up:0 · down:1 · flat:1 · n/a:0',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'q' },
    )
    expect(screen.getByLabelText('Basis Agreement')).toHaveValue('all')
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Shortcut Summary')).toHaveTextContent(
      'Basis agreement shortcuts: keys:q/e/x/c/C · all:q · agree:e · diverge:x · cycle:c=agree · reverse:C=diverge · active:all',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Agreement Cycle Preview Summary')).toHaveTextContent(
      'Basis agreement cycle preview: all:2 · agree:1 · diverge:1 · active:all(2) · next:c=agree(1) · prev:C=diverge(1)',
    )
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('3')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'p' },
    )
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('5')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-divergence-preview-v1')).toBe(
      '5',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:5 · next:p=8 · prev:P=3',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'p' },
    )
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('8')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-divergence-preview-v1')).toBe(
      '8',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:8 · next:p=3 · prev:P=5',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:8 · diverge:show:1/1 · agree:show:1/1 · mode:all',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'P', shiftKey: true },
    )
    expect(screen.getByLabelText('Basis Preview')).toHaveValue('5')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-divergence-preview-v1')).toBe(
      '5',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Shortcut Summary')).toHaveTextContent(
      'Basis preview shortcuts: keys:p/P · value:5 · next:p=8 · prev:P=3',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:5 · diverge:show:1/1 · agree:show:1/1 · mode:all',
    )
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('all')
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 't' },
    )
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('trade')
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: trade · window:5 · age:all · scope:all-buckets · order:newest-first · visible:1 · latest:trade:closed:queued',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=trade · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=risk · prev:Z=all · active:trade',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'z' },
    )
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('risk')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-focus-v1')).toBe('risk')
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=feed · prev:Z=trade · active:risk',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'Z', shiftKey: true },
    )
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('trade')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-focus-v1')).toBe('trade')
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=risk · prev:Z=all · active:trade',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: 'a' },
    )
    expect(screen.getByLabelText('Marker Focus')).toHaveValue('all')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-focus-v1')).toBe('all')
    expect(screen.getByLabelText('Overlay Marker Focus Shortcut Summary')).toHaveTextContent(
      'Focus shortcuts: keys:z/Z · next:z=trade · prev:Z=feed · active:all',
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('all')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'y' },
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('last-60s')
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=last-60s · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-300s|Y=all|active:last-60s · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'y' },
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('last-300s')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'y' },
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('all')
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'Y', shiftKey: true },
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('last-300s')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-age-filter-v1')).toBe(
      'last-300s',
    )
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=all|Y=last-60s|active:last-300s · window:v=8|V=3|active:5 · bucket:b=30s|B=60s|active:none',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'y' },
    )
    expect(screen.getByLabelText('Marker Age')).toHaveValue('all')
    expect(screen.getByLabelText('Marker Window')).toHaveValue('5')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'v' },
    )
    expect(screen.getByLabelText('Marker Window')).toHaveValue('8')
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=8 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'v' },
    )
    expect(screen.getByLabelText('Marker Window')).toHaveValue('3')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'v' },
    )
    expect(screen.getByLabelText('Marker Window')).toHaveValue('5')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'V', shiftKey: true },
    )
    expect(screen.getByLabelText('Marker Window')).toHaveValue('3')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-window-v1')).toBe('3')
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=5|V=8|active:3 · bucket:b=30s|B=60s|active:none',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'v' },
    )
    expect(screen.getByLabelText('Marker Window')).toHaveValue('5')
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('none')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'b' },
    )
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('30s')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'b' },
    )
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('60s')
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=60s · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'b' },
    )
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('none')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'B', shiftKey: true },
    )
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('60s')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-bucket-v1')).toBe('60s')
    expect(screen.getByLabelText('Overlay Marker Range Shortcut Summary')).toHaveTextContent(
      'Range shortcuts: keys:y/Y/v/V/b/B · age:y=last-60s|Y=last-300s|active:all · window:v=8|V=3|active:5 · bucket:b=none|B=30s|active:60s',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'b' },
    )
    expect(screen.getByLabelText('Marker Bucket')).toHaveValue('none')
    expect(screen.getByLabelText('Timeline Order')).toHaveValue('newest-first')
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'o' },
    )
    expect(screen.getByLabelText('Timeline Order')).toHaveValue('oldest-first')
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: all · window:5 · age:all · scope:all-buckets · order:oldest-first · visible:2 · latest:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=oldest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'l' },
    )
    expect(screen.getByLabelText('Timeline Order')).toHaveValue('newest-first')
    expect(screen.getByLabelText('Bucket Scope')).toHaveValue('all-buckets')
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'g' },
    )
    expect(screen.getByLabelText('Bucket Scope')).toHaveValue('latest-bucket')
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=latest-bucket · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'g' },
    )
    expect(screen.getByLabelText('Bucket Scope')).toHaveValue('all-buckets')
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'k' },
    )
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('average')
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:average · mode:all · matched:2/2 · up:1 · down:1 · flat:0 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:average · mode:all · matched:2/2 · active:on',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Shortcut Summary')).toHaveTextContent(
      'Delta basis shortcuts: keys:h/m/k · latest:h · average:m · cycle:k=latest · active:average',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m2/2|u0|d1|f1|n0 · average:m2/2|u1|d1|f0|n0 · mode:all · active:average · agree:1/2 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:1/2 · items:risk:live_trading_disabled:raised:flat->up',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:1/2 · items:trade:closed:queued:down',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=average · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'h' },
    )
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('latest')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-delta-basis-v1')).toBe(
      'latest',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'm' },
    )
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('average')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-delta-basis-v1')).toBe(
      'average',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=average · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'k' },
    )
    expect(screen.getByLabelText('Delta Basis')).toHaveValue('latest')
    expect(window.localStorage.getItem('quick-action-market-overlay-marker-delta-basis-v1')).toBe(
      'latest',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:all · matched:2/2 · up:0 · down:1 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:all · matched:2/2 · active:on',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Shortcut Summary')).toHaveTextContent(
      'Delta basis shortcuts: keys:h/m/k · latest:h · average:m · cycle:k=average · active:latest',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m2/2|u0|d1|f1|n0 · average:m2/2|u1|d1|f0|n0 · mode:all · active:latest · agree:1/2 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:all · diverge:1/2 · items:risk:live_trading_disabled:raised:flat->up',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:all · agree:1/2 · items:trade:closed:queued:down',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(
      within(overlayMarkersContainer).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: 'j' },
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:1 · latest:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Delta Filter')).toHaveValue('latest-down')
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=latest-down · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Filter Summary')).toHaveTextContent(
      'Delta filter: basis:latest · mode:latest-down · matched:1/2 · up:0 · down:1 · flat:1 · n/a:0',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:latest-down · matched:1/2 · active:on',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Comparison Summary')).toHaveTextContent(
      'Delta basis compare: latest:m1/2|u0|d1|f1|n0 · average:m1/2|u1|d1|f0|n0 · mode:latest-down · active:latest · agree:1/2 · diverge:1',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Divergence Summary')).toHaveTextContent(
      'Delta basis divergence: mode:latest-down · diverge:0/1 · items:none',
    )
    expect(screen.getByLabelText('Overlay Marker Delta Basis Agreement Items Summary')).toHaveTextContent(
      'Delta basis agreement items: mode:latest-down · agree:1/1 · items:trade:closed:queued:down',
    )
    expect(screen.getByLabelText('Overlay Marker Basis Preview Count Summary')).toHaveTextContent(
      'Basis preview counts: size:5 · diverge:show:0/0 · agree:show:1/1 · mode:latest-down',
    )
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: '+' },
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:1 · latest:risk:live_trading_disabled:raised',
      )
    })
    expect(screen.getByLabelText('Delta Filter')).toHaveValue('latest-flat')
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent('trade:closed:queued')
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'risk:live_trading_disabled:raised',
      }),
      { key: '-' },
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Delta Filter')).toHaveValue('latest-down')
    })
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    fireEvent.keyDown(
      within(screen.getByLabelText('Overlay Markers')).getByRole('button', {
        name: 'trade:closed:queued',
      }),
      { key: '0' },
    )
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:all-buckets · order:newest-first · visible:2 · latest:risk:live_trading_disabled:raised',
      )
    })
    expect(screen.getByLabelText('Delta Filter')).toHaveValue('all')
    expect(screen.getByLabelText('Overlay Marker Delta Shortcut Summary')).toHaveTextContent(
      'Delta shortcuts: keys:k/u/j/f/n/0/+/- · basis:latest · mode:all · matched:2/2 · active:on',
    )
    fireEvent.change(screen.getByLabelText('Marker Bucket'), { target: { value: '60s' } })
    const expectedBucket = new Date(Math.floor(fakeNow / 60_000) * 60_000).toISOString()
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:all-buckets · buckets:1 · latest:${expectedBucket} · count:2`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Navigation Summary')).toHaveTextContent(
      `Bucket nav: mode:60s · keys:,/. · active:${expectedBucket}(2) · prev:,=none · next:.=none · buckets:1`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:1 · latestAvg:1.50 · previousAvg:n/a · Δbucket:n/a',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
      `bucket:${expectedBucket}`,
    )
    fireEvent.change(screen.getByLabelText('Bucket Scope'), { target: { value: 'latest-bucket' } })
    expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
      'Marker focus: all · window:5 · age:all · scope:latest-bucket · order:newest-first · visible:2 · latest:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:latest-bucket · buckets:1 · latest:${expectedBucket} · count:2`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:1 · latestAvg:1.50 · previousAvg:n/a · Δbucket:n/a',
    )

    fakeNow += 120_000
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:all · scope:latest-bucket · order:newest-first · visible:1 · latest:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Markers')).not.toHaveTextContent(
      'risk:live_trading_disabled:raised',
    )
    const latestBucketAfterUpdate = new Date(Math.floor(fakeNow / 60_000) * 60_000).toISOString()
    expect(screen.getByLabelText('Overlay Marker Timeline')).toHaveTextContent(
      `bucket:${latestBucketAfterUpdate}`,
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:latest-bucket · buckets:2 · latest:${latestBucketAfterUpdate} · count:1`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:1 · latestAvg:2.00 · previousAvg:n/a · Δbucket:n/a',
    )

    fireEvent.change(screen.getByLabelText('Marker Age'), { target: { value: 'last-60s' } })

    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:last-60s · scope:latest-bucket · order:newest-first · visible:1 · latest:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Markers')).toHaveTextContent('trade:closed:queued')
    expect(screen.getByLabelText('Overlay Correlation Hint')).toHaveTextContent(
      'Correlation: trade:closed:queued@2.00(t2)',
    )
    expect(screen.getByLabelText('Overlay Marker Drilldown Detail')).toHaveTextContent('t2')
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/1 · selected:trade:closed:queued',
    )
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:latest-bucket · buckets:1 · latest:${latestBucketAfterUpdate} · count:1`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:1 · latestAvg:2.00 · previousAvg:n/a · Δbucket:n/a',
    )

    fireEvent.change(screen.getByLabelText('Marker Age'), { target: { value: 'last-300s' } })
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:last-300s · scope:latest-bucket · order:newest-first · visible:1 · latest:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/1 · selected:trade:closed:queued',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:latest-bucket · buckets:2 · latest:${latestBucketAfterUpdate} · count:1`,
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:1 · latestAvg:2.00 · previousAvg:n/a · Δbucket:n/a',
    )

    fireEvent.change(screen.getByLabelText('Bucket Scope'), { target: { value: 'all-buckets' } })
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Drilldown')).toHaveTextContent(
        'Marker focus: all · window:5 · age:last-300s · scope:all-buckets · order:newest-first · visible:3 · latest:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Timeline Bucket Summary')).toHaveTextContent(
      `Timeline buckets: mode:60s · scope:all-buckets · buckets:2 · latest:${latestBucketAfterUpdate} · count:3`,
    )
    expect(screen.getByLabelText('Overlay Marker Chronology Summary')).toHaveTextContent(
      'Chronology: count:3 · span:2m · avgGap:1m · latestGap:2m',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Delta Summary')).toHaveTextContent(
      'Bucket deltas: mode:60s · buckets:2 · latestAvg:2.00 · previousAvg:1.00 · Δbucket:+1.00 (+100.00%)',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 3/3 · selected:trade:closed:queued',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: prev:risk:live_trading_disabled:raised · next:none · skipBack:trade:closed:queued · skipForward:none · prevKind:trade:closed:queued · nextKind:none · prevBucket:risk:live_trading_disabled:raised · nextBucket:none',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: edges:o2/l0 · kind:2/n/a · bucket:1/n/a · step:2',
    )
    expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
      'Shortcuts: steps:on/off · skip:on/off · kind:on/off · bucket:on/off',
    )
    expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
      'Bindings: steps:on/off · skip:on/off · kind:on/off · bucket:on/off · edges:on/off',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: keys:1-3 · selected:3/3',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Previous Bucket' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/3 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: edges:o1/l1 · kind:n/a/n/a · bucket:n/a/1 · step:2',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next Bucket' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 3/3 · selected:trade:closed:queued',
    )

    sendSpy.mockRestore()
    dateNowSpy.mockRestore()
  }, 20_000)

  it('supports follow-latest selection mode for incoming markers', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
          params?: {
            action?: string
          }
        }
        if (payload.type !== 'req' || !payload.id) {
          return
        }

        if (payload.method === 'feeds.getCandles') {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    symbol: 'ETHUSDm',
                    timeframe: '5m',
                    candles: [{ close: 1 }, { close: 2 }],
                  },
                }),
              }),
            )
          })
          return
        }

        if (payload.method === 'risk.emergencyStop') {
          queueMicrotask(() => {
            if (payload.params?.action === 'close_all') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.trade.closed',
                    payload: {
                      status: 'queued',
                    },
                  }),
                }),
              )
            }
            if (payload.params?.action === 'disable_live') {
              this.onmessage?.(
                new MessageEvent('message', {
                  data: JSON.stringify({
                    type: 'event',
                    event: 'event.risk.alert',
                    payload: {
                      status: 'raised',
                      kind: 'live_trading_disabled',
                    },
                  }),
                }),
              )
            }
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergency: true,
                    action: payload.params?.action ?? 'pause_trading',
                    reason: 'test',
                    updatedAt: '2025-01-01T00:00:00Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Get Candles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disable Live Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
        'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t1/r1/f0 · selectedKind:risk',
    )
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'w',
    })
    expect(screen.getByLabelText('Marker Wrap')).toHaveValue('wrap')
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:wrap · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=wrap · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'w',
    })
    expect(screen.getByLabelText('Marker Wrap')).toHaveValue('bounded')
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )

    fireEvent.keyDown(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' }), {
      key: 'ArrowLeft',
    })
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 1/2 · selected:trade:closed:queued',
    )

    const selectedTradeMarkerAfterFollowLatest = within(screen.getByLabelText('Overlay Markers'))
      .getAllByRole('button', { name: 'trade:closed:queued' })
      .find((button) => button.getAttribute('aria-pressed') === 'true')
    expect(selectedTradeMarkerAfterFollowLatest).toBeDefined()
    fireEvent.keyDown(selectedTradeMarkerAfterFollowLatest as HTMLElement, { key: 's' })
    expect(screen.getByLabelText('Selection Mode')).toHaveValue('follow-latest')
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/2 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:follow-latest · nav:locked',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=follow-latest · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:locked',
    )
    expect(screen.getByLabelText('Overlay Marker Navigation Targets')).toHaveTextContent(
      'Targets: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Timeline Anchor Summary')).toHaveTextContent(
      'Timeline anchors: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Distance Summary')).toHaveTextContent(
      'Distance: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Bucket Navigation Summary')).toHaveTextContent(
      'Bucket nav: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Kind Navigation Summary')).toHaveTextContent(
      'Kind nav: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Shortcut Hint')).toHaveTextContent(
      'Shortcuts: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Binding Summary')).toHaveTextContent(
      'Bindings: locked',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: locked',
    )
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Latest Marker' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'trade:closed:queued' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'risk:live_trading_disabled:raised' })).toHaveClass(
      'is-disabled',
    )
    expect(
      screen.getByRole('button', { name: /risk:live_trading_disabled:raised · t2 · close:2\.00/ }),
    ).toHaveClass('is-disabled')
    fireEvent.click(screen.getByRole('button', { name: 'Refresh Overlay Snapshot' }))
    expect(screen.getByLabelText('Overlay Snapshot Summary')).toHaveTextContent(
      'markerSelection:follow-latest',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
        'Marker nav: 3/3 · selected:trade:closed:queued',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t2/r1/f0 · selectedKind:trade',
    )

    const selectedTradeMarkerBeforeStickyToggle = within(screen.getByLabelText('Overlay Markers'))
      .getAllByRole('button', { name: 'trade:closed:queued' })
      .find((button) => button.getAttribute('aria-pressed') === 'true')
    expect(selectedTradeMarkerBeforeStickyToggle).toBeDefined()
    fireEvent.keyDown(selectedTradeMarkerBeforeStickyToggle as HTMLElement, { key: 's' })
    expect(screen.getByLabelText('Selection Mode')).toHaveValue('sticky')
    expect(screen.getByLabelText('Overlay Marker Behavior')).toHaveTextContent(
      'Marker behavior: wrap:bounded · selection:sticky · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Mode Shortcut Summary')).toHaveTextContent(
      'Mode shortcuts: focus:a/t/r/d=all · age:y=all · window:v=5 · bucket:b=none · order:o/l=newest-first · scope:g=all-buckets · wrap:w=bounded · selection:s=sticky · agreement:q/e/x=all · basis:k=latest · delta:u/j/f/n/0/+/-=all · nav:manual',
    )
    expect(screen.getByLabelText('Overlay Marker Numeric Jump Summary')).toHaveTextContent(
      'Jump keys: keys:1-3 · selected:3/3',
    )
    expect(screen.getByRole('button', { name: 'Previous Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Oldest Marker' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    screen.getAllByRole('button', { name: 'trade:closed:queued' }).forEach((button) => {
      expect(button).toBeEnabled()
      expect(button).not.toHaveClass('is-disabled')
    })
    fireEvent.click(screen.getByRole('button', { name: 'Previous Marker' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/3 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t2/r1/f0 · selectedKind:risk',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Disable Live Now' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
        'Marker nav: 2/4 · selected:risk:live_trading_disabled:raised',
      )
    })
    expect(screen.getByLabelText('Overlay Marker Scope Summary')).toHaveTextContent(
      'Scope: visible:t2/r2/f0 · selectedKind:risk',
    )
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Previous Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next Bucket' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next Same Kind' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 4/4 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByRole('button', { name: 'Previous Same Kind' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next Same Kind' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Previous Same Kind' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/4 · selected:risk:live_trading_disabled:raised',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Skip Forward 2' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 4/4 · selected:risk:live_trading_disabled:raised',
    )
    expect(screen.getByRole('button', { name: 'Skip Back 2' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Skip Forward 2' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Skip Back 2' }))
    expect(screen.getByLabelText('Overlay Marker Navigation')).toHaveTextContent(
      'Marker nav: 2/4 · selected:risk:live_trading_disabled:raised',
    )

    sendSpy.mockRestore()
  })

  it('sends account and feed management requests', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.change(screen.getByLabelText('Account ID'), {
      target: { value: 'acct_custom_9' },
    })
    fireEvent.change(screen.getByLabelText('Provider Account ID'), {
      target: { value: 'provider_custom_9' },
    })
    fireEvent.change(screen.getByLabelText('Account Label'), {
      target: { value: 'Swing Account' },
    })
    fireEvent.change(screen.getByLabelText('Account Symbols (comma separated)'), {
      target: { value: 'XAUUSDm, ETHUSDm' },
    })
    fireEvent.change(screen.getByLabelText('Agent ID'), {
      target: { value: 'agent_custom_9' },
    })
    fireEvent.change(screen.getByLabelText('Agent Label'), {
      target: { value: 'Momentum Scalper' },
    })
    fireEvent.change(screen.getByLabelText('Device ID'), {
      target: { value: 'dev_custom_9' },
    })
    fireEvent.change(screen.getByLabelText('Device Platform'), {
      target: { value: 'android' },
    })
    fireEvent.change(screen.getByLabelText('Device Label'), {
      target: { value: 'Pixel' },
    })
    fireEvent.change(screen.getByLabelText('Device Pair Push Token'), {
      target: { value: 'push_pair_custom' },
    })
    fireEvent.change(screen.getByLabelText('Device Rotate Push Token'), {
      target: { value: 'push_rotate_custom' },
    })
    fireEvent.change(screen.getByLabelText('Device Notify Message'), {
      target: { value: 'custom-notify-message' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'close_all' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'operator close-all drill' },
    })
    fireEvent.change(screen.getByLabelText('Feed Topic'), {
      target: { value: 'market.tick' },
    })
    fireEvent.change(screen.getByLabelText('Feed Symbol'), {
      target: { value: 'BTCUSDm' },
    })
    fireEvent.change(screen.getByLabelText('Feed Timeframe'), {
      target: { value: '1h' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Agents' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Risk Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))
    fireEvent.click(screen.getByRole('button', { name: 'Resume Risk' }))
    fireEvent.click(screen.getByRole('button', { name: 'Place Trade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Modify Trade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel Trade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close Position' }))
    fireEvent.click(screen.getByRole('button', { name: 'Connect Account' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect Account' }))
    fireEvent.click(screen.getByRole('button', { name: 'Feeds' }))
    fireEvent.click(screen.getByRole('button', { name: 'Devices' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pair Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Register Push' }))
    fireEvent.click(screen.getByRole('button', { name: 'Notify Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Unpair Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe Feed' }))
    fireEvent.click(screen.getByRole('button', { name: 'Get Candles' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Signals' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Follow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Unfollow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Follows' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Preview' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Resume' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string; params?: Record<string, unknown> }>
      const methods = payloads.map((payload) => payload.method)

      expect(methods).toContain('accounts.list')
      expect(methods).toContain('agents.list')
      expect(methods).toContain('agents.create')
      expect(methods).toContain('risk.status')
      expect(methods).toContain('risk.emergencyStop')
      expect(methods).toContain('risk.resume')
      expect(methods).toContain('trades.place')
      expect(methods).toContain('trades.modify')
      expect(methods).toContain('trades.cancel')
      expect(methods).toContain('trades.closePosition')
      expect(methods).toContain('accounts.connect')
      expect(methods).toContain('accounts.disconnect')
      expect(methods).toContain('feeds.list')
      expect(methods).toContain('devices.list')
      expect(methods).toContain('devices.pair')
      expect(methods).toContain('devices.registerPush')
      expect(methods).toContain('devices.notifyTest')
      expect(methods).toContain('devices.unpair')
      expect(methods).toContain('feeds.subscribe')
      expect(methods).toContain('feeds.getCandles')
      expect(methods).toContain('marketplace.signals')
      expect(methods).toContain('marketplace.follow')
      expect(methods).toContain('marketplace.unfollow')
      expect(methods).toContain('marketplace.myFollows')
      expect(methods).toContain('copytrade.preview')
      expect(methods).toContain('copytrade.status')
      expect(methods).toContain('copytrade.pause')
      expect(methods).toContain('copytrade.resume')

      const accountConnect = payloads.find((payload) => payload.method === 'accounts.connect')
      expect(accountConnect?.params).toMatchObject({
        accountId: 'acct_custom_9',
        providerAccountId: 'provider_custom_9',
        label: 'Swing Account',
        allowedSymbols: ['XAUUSDm', 'ETHUSDm'],
      })

      const agentsCreate = payloads.find((payload) => payload.method === 'agents.create')
      expect(agentsCreate?.params).toMatchObject({
        agentId: 'agent_custom_9',
        label: 'Momentum Scalper',
      })

      const devicePair = payloads.find((payload) => payload.method === 'devices.pair')
      expect(devicePair?.params).toMatchObject({
        deviceId: 'dev_custom_9',
        platform: 'android',
        label: 'Pixel',
        pushToken: 'push_pair_custom',
      })

      const deviceRegisterPush = payloads.find(
        (payload) => payload.method === 'devices.registerPush',
      )
      expect(deviceRegisterPush?.params).toMatchObject({
        deviceId: 'dev_custom_9',
        pushToken: 'push_rotate_custom',
      })

      const deviceNotifyTest = payloads.find((payload) => payload.method === 'devices.notifyTest')
      expect(deviceNotifyTest?.params).toMatchObject({
        deviceId: 'dev_custom_9',
        message: 'custom-notify-message',
      })

      const riskEmergencyStop = payloads.find((payload) => payload.method === 'risk.emergencyStop')
      expect(riskEmergencyStop?.params).toMatchObject({
        action: 'close_all',
        reason: 'operator close-all drill',
      })

      const riskResume = payloads.find((payload) => payload.method === 'risk.resume')
      expect(riskResume?.params).toMatchObject({
        reason: 'operator close-all drill',
      })

      const tradePlace = payloads.find((payload) => payload.method === 'trades.place')
      expect(tradePlace?.params).toMatchObject({
        intent: {
          account_id: 'acct_custom_9',
          symbol: 'BTCUSDm',
          action: 'PLACE_MARKET_ORDER',
          side: 'buy',
        },
      })

      const tradeModify = payloads.find((payload) => payload.method === 'trades.modify')
      expect(tradeModify?.params).toMatchObject({
        accountId: 'acct_custom_9',
        orderId: 'order_demo_1',
      })

      const tradeCancel = payloads.find((payload) => payload.method === 'trades.cancel')
      expect(tradeCancel?.params).toMatchObject({
        accountId: 'acct_custom_9',
        orderId: 'order_demo_1',
      })

      const tradeClose = payloads.find((payload) => payload.method === 'trades.closePosition')
      expect(tradeClose?.params).toMatchObject({
        accountId: 'acct_custom_9',
        positionId: 'position_demo_1',
      })

      const feedSubscribe = payloads.find((payload) => payload.method === 'feeds.subscribe')
      expect(feedSubscribe?.params).toMatchObject({
        topics: ['market.tick'],
        symbols: ['BTCUSDm'],
        timeframes: ['1h'],
      })

      const marketplaceFollow = payloads.find((payload) => payload.method === 'marketplace.follow')
      expect(marketplaceFollow?.params).toMatchObject({
        accountId: 'acct_custom_9',
        strategyId: 'strat_dashboard_1',
      })

      const marketplaceUnfollow = payloads.find(
        (payload) => payload.method === 'marketplace.unfollow',
      )
      expect(marketplaceUnfollow?.params).toMatchObject({
        accountId: 'acct_custom_9',
        strategyId: 'strat_dashboard_1',
      })

      const marketplaceMyFollows = payloads.find(
        (payload) => payload.method === 'marketplace.myFollows',
      )
      expect(marketplaceMyFollows?.params).toMatchObject({
        accountId: 'acct_custom_9',
      })

      const feedCandles = payloads.find((payload) => payload.method === 'feeds.getCandles')
      expect(feedCandles?.params).toMatchObject({
        symbol: 'BTCUSDm',
        timeframe: '1h',
        limit: 50,
      })

      const copytradePreview = payloads.find((payload) => payload.method === 'copytrade.preview')
      expect(copytradePreview?.params).toMatchObject({
        accountId: 'acct_custom_9',
        signal: {
          symbol: 'BTCUSDm',
          timeframe: '1h',
          action: 'OPEN',
          side: 'buy',
        },
        constraints: {
          allowedSymbols: ['BTCUSDm'],
          maxVolume: 0.2,
          directionFilter: 'both',
          maxSignalAgeSeconds: 300,
        },
      })

      const copytradeStatus = payloads.find((payload) => payload.method === 'copytrade.status')
      expect(copytradeStatus?.params).toMatchObject({
        accountId: 'acct_custom_9',
        strategyId: 'strat_dashboard_1',
      })

      const copytradePause = payloads.find((payload) => payload.method === 'copytrade.pause')
      expect(copytradePause?.params).toMatchObject({
        accountId: 'acct_custom_9',
        strategyId: 'strat_dashboard_1',
      })

      const copytradeResume = payloads.find((payload) => payload.method === 'copytrade.resume')
      expect(copytradeResume?.params).toMatchObject({
        accountId: 'acct_custom_9',
        strategyId: 'strat_dashboard_1',
      })
    })

    sendSpy.mockRestore()
  }, 15_000)

  it('updates candles last-fetch status after get-candles response', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'feeds.getCandles' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    symbol: 'ETHUSDm',
                    timeframe: '5m',
                    candles: [{ close: 1 }, { close: 2 }, { close: 3 }],
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Get Candles' }))

    await waitFor(() => {
      const candlesRow = screen.getByText('Candles (last fetch)').closest('div')
      expect(candlesRow).not.toBeNull()
      expect(within(candlesRow as HTMLElement).getByText('3')).toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('updates marketplace signal and copytrade preview status rows', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'marketplace.signals' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    signals: [{ signalId: 'sig1' }, { signalId: 'sig2' }, { signalId: 'sig3' }],
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'copytrade.preview' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    signalId: 'sig_dashboard_preview',
                    deduped: false,
                    blockedReason: null,
                    intent: {
                      account_id: 'acct_demo_1',
                      symbol: 'ETHUSDm',
                      action: 'PLACE_MARKET_ORDER',
                      side: 'buy',
                      volume: 0.2,
                      stop_loss: 2450.0,
                      take_profit: 2600.0,
                    },
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'marketplace.follow' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'following',
                    followId: 'follow_demo_1',
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'marketplace.unfollow' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'unfollowed',
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'marketplace.myFollows' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    follows: [
                      {
                        followId: 'follow_demo_1',
                        strategyId: 'strat_dashboard_1',
                      },
                    ],
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'copytrade.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    followId: 'follow_demo_1',
                    strategyId: 'strat_dashboard_1',
                    status: 'active',
                    paused: false,
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'copytrade.pause' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    followId: 'follow_demo_1',
                    strategyId: 'strat_dashboard_1',
                    status: 'paused',
                    paused: true,
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'copytrade.resume' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    followId: 'follow_demo_1',
                    strategyId: 'strat_dashboard_1',
                    status: 'active',
                    paused: false,
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Signals' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Follow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Follows' }))
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace Unfollow' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Preview' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copytrade Resume' }))

    await waitFor(() => {
      const marketplaceRow = screen.getByText('Marketplace Signals (last fetch)').closest('div')
      expect(marketplaceRow).not.toBeNull()
      expect(within(marketplaceRow as HTMLElement).getByText('3')).toBeInTheDocument()

      const marketplaceFollowRow = screen
        .getByText('Marketplace Follows', { selector: 'dt' })
        .closest('div')
      expect(marketplaceFollowRow).not.toBeNull()
      expect(
        within(marketplaceFollowRow as HTMLElement).getByText('unfollowed:strat_dashboard_1'),
      ).toBeInTheDocument()

      const copytradeRow = screen.getByText('Copytrade Preview', { selector: 'dt' }).closest('div')
      expect(copytradeRow).not.toBeNull()
      expect(within(copytradeRow as HTMLElement).getByText('allowed (volume: 0.2)')).toBeInTheDocument()

      const copytradeControlRow = screen
        .getByText('Copytrade Control', { selector: 'dt' })
        .closest('div')
      expect(copytradeControlRow).not.toBeNull()
      expect(
        within(copytradeControlRow as HTMLElement).getByText(
          'status:active · paused:no · strategy:strat_dashboard_1',
        ),
      ).toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('updates agent status rows after list and create responses', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'agents.list' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    agents: [{ agentId: 'agent_a' }, { agentId: 'agent_b' }],
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'agents.create' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.agent.status',
                  payload: {
                    requestId: payload.id,
                    agent: {
                      agentId: 'agent_custom_9',
                      label: 'Momentum Scalper',
                      status: 'ready',
                      workspacePath: '/tmp/agents/agent_custom_9',
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    agent: {
                      agentId: 'agent_custom_9',
                      label: 'Momentum Scalper',
                      status: 'ready',
                      workspacePath: '/tmp/agents/agent_custom_9',
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Agent ID'), {
      target: { value: 'agent_custom_9' },
    })
    fireEvent.change(screen.getByLabelText('Agent Label'), {
      target: { value: 'Momentum Scalper' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Agents' }))
    fireEvent.click(screen.getByRole('button', { name: 'Create Agent' }))

    await waitFor(() => {
      const agentCountRow = screen.getByText('Agents (last fetch)').closest('div')
      expect(agentCountRow).not.toBeNull()
      expect(within(agentCountRow as HTMLElement).getByText('2')).toBeInTheDocument()

      const managedAgentRow = screen.getByText('Managed Agent').closest('div')
      expect(managedAgentRow).not.toBeNull()
      expect(within(managedAgentRow as HTMLElement).getByText('agent_custom_9')).toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('runs onboarding flow and marks all onboarding steps complete', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'accounts.connect' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    account: { accountId: 'acct_demo_1', status: 'connected' },
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'agents.create' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    agent: { agentId: 'agent_eth_5m', label: 'ETH Momentum Agent', status: 'ready' },
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'feeds.subscribe' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    subscription: { subscriptionId: 'sub_onboarding_1' },
                    subscriptionCount: 1,
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Run Onboarding Flow' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string }>
      const methods = payloads.map((payload) => payload.method)
      expect(methods).toContain('accounts.connect')
      expect(methods).toContain('agents.create')
      expect(methods).toContain('feeds.subscribe')
      expect(screen.getByText('Onboarding Checklist').closest('div')).toHaveTextContent(
        'completed 3/3',
      )
    })

    sendSpy.mockRestore()
  })

  it('dispatches intervention panel emergency actions with expected payloads', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'manual intervention reason' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pause Trading Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel All Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disable Live Now' }))
    fireEvent.click(screen.getByRole('button', { name: 'Resume Trading Now' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string; params?: Record<string, unknown> }>

      const emergencyActions = payloads
        .filter((payload) => payload.method === 'risk.emergencyStop')
        .map((payload) => payload.params?.action)
      expect(emergencyActions).toEqual([
        'pause_trading',
        'cancel_all',
        'close_all',
        'disable_live',
      ])

      const resumePayload = payloads.find((payload) => payload.method === 'risk.resume')
      expect(resumePayload?.params).toMatchObject({
        reason: 'manual intervention reason',
      })
    })

    sendSpy.mockRestore()
  })

  it('dispatches mobile emergency controls with expected payloads', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'mobile intervention reason' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Mobile Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Cancel All' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Close All' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Disable Live' }))
    fireEvent.click(screen.getByRole('button', { name: 'Mobile Resume' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string; params?: Record<string, unknown> }>

      const emergencyActions = payloads
        .filter((payload) => payload.method === 'risk.emergencyStop')
        .map((payload) => payload.params?.action)
      expect(emergencyActions).toEqual([
        'pause_trading',
        'cancel_all',
        'close_all',
        'disable_live',
      ])

      const resumePayload = payloads.find((payload) => payload.method === 'risk.resume')
      expect(resumePayload?.params).toMatchObject({
        reason: 'mobile intervention reason',
      })
    })

    sendSpy.mockRestore()
  })

  it('updates intervention summary from intervention panel actions', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
          params?: { action?: string }
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          const action = payload.params?.action ?? 'pause_trading'
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: action,
                      lastReason: 'manual intervention reason',
                      updatedAt: '2026-02-17T12:30:00.000Z',
                      actionCounts: {
                        pause_trading: action === 'pause_trading' ? 1 : 0,
                        cancel_all: action === 'cancel_all' ? 1 : 0,
                        close_all: action === 'close_all' ? 1 : 0,
                        disable_live: action === 'disable_live' ? 1 : 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: action,
                    lastReason: 'manual intervention reason',
                    updatedAt: '2026-02-17T12:30:00.000Z',
                    actionCounts: {
                      pause_trading: action === 'pause_trading' ? 1 : 0,
                      cancel_all: action === 'cancel_all' ? 1 : 0,
                      close_all: action === 'close_all' ? 1 : 0,
                      disable_live: action === 'disable_live' ? 1 : 0,
                    },
                  },
                }),
              }),
            )
          })
          return
        }
        if (payload.type === 'req' && payload.method === 'risk.resume' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: false,
                      lastAction: 'close_all',
                      lastReason: 'manual intervention reason',
                      updatedAt: '2026-02-17T12:31:00.000Z',
                      actionCounts: {
                        pause_trading: 0,
                        cancel_all: 0,
                        close_all: 1,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: false,
                    lastAction: 'close_all',
                    lastReason: 'manual intervention reason',
                    updatedAt: '2026-02-17T12:31:00.000Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 1,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'manual intervention reason' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Close All Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Intervention Summary')).toHaveTextContent(
        'Emergency status: active · Last action: close_all · Updated: 2026-02-17T12:30:00.000Z',
      )
      expect(screen.getByLabelText('Mobile Intervention Summary')).toHaveTextContent(
        'Emergency status: active · Last action: close_all · Updated: 2026-02-17T12:30:00.000Z',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resume Trading Now' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Intervention Summary')).toHaveTextContent(
        'Emergency status: inactive · Last action: close_all · Updated: 2026-02-17T12:31:00.000Z',
      )
      expect(screen.getByLabelText('Mobile Intervention Summary')).toHaveTextContent(
        'Emergency status: inactive · Last action: close_all · Updated: 2026-02-17T12:31:00.000Z',
      )
    })

    sendSpy.mockRestore()
  })

  it('updates risk emergency status from risk status, emergency-stop, and resume responses', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }

        if (payload.type === 'req' && payload.method === 'risk.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: false,
                    lastAction: null,
                    lastReason: null,
                    updatedAt: null,
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
          return
        }

        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'pause_trading',
                      lastReason: 'manual risk stop',
                      updatedAt: '2026-02-17T12:00:00.000Z',
                      actionCounts: {
                        pause_trading: 1,
                        cancel_all: 0,
                        close_all: 0,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'pause_trading',
                    lastReason: 'manual risk stop',
                    updatedAt: '2026-02-17T12:00:00.000Z',
                    actionCounts: {
                      pause_trading: 1,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }

        if (payload.type === 'req' && payload.method === 'risk.resume' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: false,
                      lastAction: 'pause_trading',
                      lastReason: 'resume after drill',
                      updatedAt: '2026-02-17T12:05:00.000Z',
                      actionCounts: {
                        pause_trading: 1,
                        cancel_all: 0,
                        close_all: 0,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: false,
                    lastAction: 'pause_trading',
                    lastReason: 'resume after drill',
                    updatedAt: '2026-02-17T12:05:00.000Z',
                    actionCounts: {
                      pause_trading: 1,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Risk Status' }))
    await waitFor(() => {
      expect(screen.getByText('Risk Emergency').closest('div')).toHaveTextContent('inactive')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))
    await waitFor(() => {
      expect(screen.getByText('Risk Emergency').closest('div')).toHaveTextContent('active')
      expect(screen.getByText('Risk Last Action').closest('div')).toHaveTextContent('pause_trading')
      expect(screen.getByText('Risk Last Reason').closest('div')).toHaveTextContent('manual risk stop')
      expect(screen.getByText('Risk Last Updated').closest('div')).toHaveTextContent(
        '2026-02-17T12:00:00.000Z',
      )
      expect(screen.getByText('Risk Action Counts').closest('div')).toHaveTextContent(
        'pause:1, cancel:0, close:0, disable:0',
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Resume Risk' }))
    await waitFor(() => {
      expect(screen.getByText('Risk Emergency').closest('div')).toHaveTextContent('inactive')
      expect(screen.getByText('Risk Last Reason').closest('div')).toHaveTextContent(
        'resume after drill',
      )
      expect(screen.getByText('Risk Last Updated').closest('div')).toHaveTextContent(
        '2026-02-17T12:05:00.000Z',
      )
    })

    sendSpy.mockRestore()
  })

  it('tracks emergency trade-control events in status badges', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'cancel_all',
                      lastReason: 'cancel all from dashboard',
                      updatedAt: '2026-02-17T12:30:00.000Z',
                      actionCounts: {
                        pause_trading: 0,
                        cancel_all: 1,
                        close_all: 0,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.trade.canceled',
                  payload: {
                    requestId: payload.id,
                    scope: 'all',
                    status: 'initiated',
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'cancel_all',
                    lastReason: 'cancel all from dashboard',
                    updatedAt: '2026-02-17T12:30:00.000Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 1,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'cancel_all' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))

    await waitFor(() => {
      expect(screen.getByText('Trade Controls').closest('div')).toHaveTextContent('canceled:initiated')
    })

    sendSpy.mockRestore()
  })

  it('tracks close-all emergency trade-control events in status badges', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'close_all',
                      lastReason: 'close all from dashboard',
                      updatedAt: '2026-02-17T12:40:00.000Z',
                      actionCounts: {
                        pause_trading: 0,
                        cancel_all: 0,
                        close_all: 1,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.trade.closed',
                  payload: {
                    requestId: payload.id,
                    scope: 'all',
                    status: 'initiated',
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'close_all',
                    lastReason: 'close all from dashboard',
                    updatedAt: '2026-02-17T12:40:00.000Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 1,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'close_all' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))

    await waitFor(() => {
      expect(screen.getByText('Trade Controls').closest('div')).toHaveTextContent('closed:initiated')
    })

    sendSpy.mockRestore()
  })

  it('tracks disable-live risk alerts in status badges', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'disable_live',
                      lastReason: 'disable live trading',
                      updatedAt: '2026-02-17T12:45:00.000Z',
                      actionCounts: {
                        pause_trading: 0,
                        cancel_all: 0,
                        close_all: 0,
                        disable_live: 1,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.alert',
                  payload: {
                    requestId: payload.id,
                    kind: 'live_trading_disabled',
                    status: 'active',
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'disable_live',
                    lastReason: 'disable live trading',
                    updatedAt: '2026-02-17T12:45:00.000Z',
                    actionCounts: {
                      pause_trading: 0,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 1,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'disable_live' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))

    await waitFor(() => {
      expect(screen.getByText('Risk Alerts').closest('div')).toHaveTextContent(
        'live_trading_disabled:active',
      )
    })

    sendSpy.mockRestore()
  })

  it('derives risk alert badge kind from decision violation codes when kind is missing', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.preview' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.alert',
                  payload: {
                    requestId: payload.id,
                    decision: {
                      allowed: false,
                      violations: [
                        {
                          code: 'MAX_DAILY_LOSS',
                        },
                      ],
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    allowed: false,
                    violations: [
                      {
                        code: 'MAX_DAILY_LOSS',
                      },
                    ],
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Risk Preview' }))

    await waitFor(() => {
      expect(screen.getByText('Risk Alerts').closest('div')).toHaveTextContent('MAX_DAILY_LOSS')
    })

    sendSpy.mockRestore()
  })

  it('uses default emergency reason when emergency reason input is blank', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))
    fireEvent.click(screen.getByRole('button', { name: 'Resume Risk' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string; params?: Record<string, unknown> }>

      const emergencyStop = payloads.find((payload) => payload.method === 'risk.emergencyStop')
      const resumeRisk = payloads.find((payload) => payload.method === 'risk.resume')
      expect(emergencyStop?.params).toMatchObject({
        reason: 'dashboard emergency stop trigger',
      })
      expect(resumeRisk?.params).toMatchObject({
        reason: 'dashboard emergency stop trigger',
      })
    })

    sendSpy.mockRestore()
  })

  it('includes lock telemetry in risk emergency event blocks', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'pause_trading',
                      lastReason: 'event telemetry visible',
                      updatedAt: '2026-02-17T12:00:00.000Z',
                      actionCounts: {
                        pause_trading: 1,
                        cancel_all: 0,
                        close_all: 0,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'pause_trading',
                    lastReason: 'event telemetry visible',
                    updatedAt: '2026-02-17T12:00:00.000Z',
                    actionCounts: {
                      pause_trading: 1,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))

    await waitFor(() => {
      expect(screen.getByText('event.risk.emergencyStop')).toBeInTheDocument()
    })

    const eventCard = screen.getByText('event.risk.emergencyStop').closest('article')
    expect(eventCard).not.toBeNull()
    expect(
      within(eventCard as HTMLElement).getByText(
        /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('omits lock telemetry in risk emergency event blocks when block telemetry is hidden', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.emergencyStop' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.emergencyStop',
                  payload: {
                    requestId: payload.id,
                    status: {
                      emergencyStopActive: true,
                      lastAction: 'pause_trading',
                      lastReason: 'event telemetry hidden',
                      updatedAt: '2026-02-17T12:10:00.000Z',
                      actionCounts: {
                        pause_trading: 1,
                        cancel_all: 0,
                        close_all: 0,
                        disable_live: 0,
                      },
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    emergencyStopActive: true,
                    lastAction: 'pause_trading',
                    lastReason: 'event telemetry hidden',
                    updatedAt: '2026-02-17T12:10:00.000Z',
                    actionCounts: {
                      pause_trading: 1,
                      cancel_all: 0,
                      close_all: 0,
                      disable_live: 0,
                    },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Emergency Stop' }))

    await waitFor(() => {
      expect(screen.getByText('event.risk.emergencyStop')).toBeInTheDocument()
    })

    const eventCard = screen.getByText('event.risk.emergencyStop').closest('article')
    expect(eventCard).not.toBeNull()
    expect(
      within(eventCard as HTMLElement).getByText(/"lastReason": "event telemetry hidden"/, {
        selector: '.block-raw-json-viewer',
      }),
    ).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).queryByText(
        /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
      ),
    ).not.toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('debounces repeated requests for the same method', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.click(screen.getByLabelText('Enable Auto Refresh'))
    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), {
      target: { value: '1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string }>
      const accountListCalls = payloads.filter((payload) => payload.method === 'accounts.list')
      expect(accountListCalls).toHaveLength(1)
    })
    expect(
      screen.getByText(
        'Skipped duplicate request within 1000ms guard window. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('omits debounced warning telemetry when block telemetry is hidden', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.click(screen.getByLabelText('Enable Auto Refresh'))
    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), {
      target: { value: '1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByText('Skipped duplicate request within 1000ms guard window.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Skipped duplicate request within 1000ms guard window. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('saves and loads quick-action presets', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'swing-template' },
    })
    fireEvent.change(screen.getByLabelText('Feed Symbol'), {
      target: { value: 'SOLUSDm' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'disable_live' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'preset emergency reason' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'swing-template' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Feed Symbol'), {
      target: { value: 'BTCUSDm' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Action'), {
      target: { value: 'pause_trading' },
    })
    fireEvent.change(screen.getByLabelText('Emergency Reason'), {
      target: { value: 'different reason' },
    })
    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'swing-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(screen.getByLabelText('Feed Symbol')).toHaveValue('SOLUSDm')
    expect(screen.getByLabelText('Emergency Action')).toHaveValue('disable_live')
    expect(screen.getByLabelText('Emergency Reason')).toHaveValue('preset emergency reason')

    fireEvent.click(screen.getByRole('button', { name: 'Delete Preset' }))
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'swing-template' })).not.toBeInTheDocument()
    })
  })

  it('shows telemetry-rich preset save/load/delete success toasts when visible', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'success-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'success-template' })).toBeInTheDocument()
    })

    expect(
      screen.getByText(
        'Saved preset: success-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))
    expect(
      screen.getByText(
        'Loaded preset: success-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete Preset' }))
    expect(
      screen.getByText(
        'Deleted preset: success-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits preset save/load/delete success telemetry when block telemetry is hidden', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'hidden-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'hidden-template' })).toBeInTheDocument()
    })
    expect(screen.getByText('Saved preset: hidden-template.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Saved preset: hidden-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))
    expect(screen.getByText('Loaded preset: hidden-template.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Loaded preset: hidden-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Delete Preset' }))
    expect(screen.getByText('Deleted preset: hidden-template.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Deleted preset: hidden-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows lock telemetry in preset validation warnings', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))
    expect(
      screen.getByText(
        'Preset name is required. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))
    expect(
      screen.getByText(
        'Select a preset first. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(
      screen.getByText(
        'Import JSON field is empty. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: { value: '{"oops":' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(
      screen.getByText(
        'Invalid JSON payload. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: { value: '[]' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(
      screen.getByText(
        'Expected a JSON object keyed by preset name. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('initializes block telemetry visibility from localStorage', () => {
    window.localStorage.setItem('quick-action-block-telemetry-visibility-v1', 'hidden')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Show Block Telemetry' })).toBeInTheDocument()
    expect(
      screen.getByText('blockTelemetry:hidden', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()
  })

  it('omits warning telemetry suffix when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: '   ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    expect(screen.getByText('Preset name is required.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Preset name is required. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('omits preset load/import warning telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))
    expect(screen.getByText('Select a preset first.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Select a preset first. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(screen.getByText('Import JSON field is empty.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Import JSON field is empty. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: { value: '{"oops":' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(screen.getByText('Invalid JSON payload.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Invalid JSON payload. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: { value: '[]' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    expect(screen.getByText('Expected a JSON object keyed by preset name.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Expected a JSON object keyed by preset name. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('omits success telemetry details when block telemetry is hidden', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"hidden-telemetry-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Imported 1 preset entries (overwrite). Created 1, preserved 0, overwritten 0, rejected 0.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          /Imported 1 preset entries \(overwrite\)\. Created 1, preserved 0, overwritten 0, rejected 0\. Lock telemetry:/,
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('omits non-copy guard warning telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.change(screen.getByLabelText('Account ID'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect Account' }))
    expect(screen.getByText('No managed account id available.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Device ID'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Register Push' }))
    expect(screen.getByText('No managed device id available.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset Lock Counters' }))
    expect(screen.getByText('No helper reset lock toggle history to clear.')).toBeInTheDocument()

    expect(screen.queryByText(/Lock telemetry:/)).not.toBeInTheDocument()
  })

  it('keeps non-copy maintenance toasts telemetry-free when block telemetry is hidden', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reset Lock Counters' }))
    expect(screen.getByText('No helper reset lock toggle history to clear.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No helper reset lock toggle history to clear. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"hidden-maintenance":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeEnabled()
    })
    expect(
      screen.getByText(
        'Imported 1 preset entries (overwrite). Created 1, preserved 0, overwritten 0, rejected 0.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Last import:/)).not.toHaveTextContent('none')
    expect(
      screen.queryByText(
        /Imported \d+ preset entries \([a-z]+\)\..*Lock telemetry:/,
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear Import Report' }))
    expect(screen.getByText('Cleared the latest preset import diagnostics.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Cleared the latest preset import diagnostics (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
      ),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))
    expect(screen.getByText('Reset helper diagnostics preferences to defaults.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Reset helper diagnostics preferences to defaults (lock toggles: 1, tone: active, reset: never; sources: Alt+L=0, controls=1, snapshot=0).',
      ),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Lock telemetry:/)).not.toBeInTheDocument()
  })

  it('shows telemetry when reset helper prefs is attempted while locked', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))

    expect(
      screen.getByText(
        'Unlock reset controls before resetting helper diagnostics preferences. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits reset-helper locked warning telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))

    expect(
      screen.getByText('Unlock reset controls before resetting helper diagnostics preferences.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Unlock reset controls before resetting helper diagnostics preferences. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows telemetry when feed unsubscribe is skipped without active subscription', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Unsubscribe Feed' }))

    expect(
      screen.getByText(
        'No active feed subscription id available. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits feed unsubscribe skip telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.click(screen.getByRole('button', { name: 'Unsubscribe Feed' }))

    expect(screen.getByText('No active feed subscription id available.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No active feed subscription id available. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows telemetry for account guard warnings when block telemetry is visible', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Account ID'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect Account' }))

    expect(
      screen.getByText(
        'No managed account id available. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('shows telemetry for device guard warnings when block telemetry is visible', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Device ID'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Notify Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Unpair Device' }))

    expect(
      screen.getAllByText(
        'No managed device id available. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toHaveLength(2)
  })

  it('omits device guard warning telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    fireEvent.change(screen.getByLabelText('Device ID'), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Notify Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Unpair Device' }))

    expect(screen.getAllByText('No managed device id available.')).toHaveLength(2)
    expect(
      screen.queryByText(
        'No managed device id available. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows gateway-disconnected telemetry when block telemetry is visible', () => {
    const OriginalWebSocket = globalThis.WebSocket
    class ClosedWebSocket {
      static readonly CONNECTING = 0
      static readonly OPEN = 1
      static readonly CLOSING = 2
      static readonly CLOSED = 3

      readyState = ClosedWebSocket.CLOSED
      onopen: (() => void) | null = null
      onclose: (() => void) | null = null
      onmessage: ((event: MessageEvent<string>) => void) | null = null

      constructor(url: string) {
        void url
      }

      send(data: string): void {
        void data
      }

      close(): void {
        this.onclose?.()
      }
    }
    Object.defineProperty(globalThis, 'WebSocket', {
      value: ClosedWebSocket,
      configurable: true,
    })

    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

      expect(
        screen.getByText(
          'Gateway is not connected. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    } finally {
      Object.defineProperty(globalThis, 'WebSocket', {
        value: OriginalWebSocket,
        configurable: true,
      })
    }
  })

  it('omits gateway-disconnected telemetry when block telemetry is hidden', () => {
    const OriginalWebSocket = globalThis.WebSocket
    class ClosedWebSocket {
      static readonly CONNECTING = 0
      static readonly OPEN = 1
      static readonly CLOSING = 2
      static readonly CLOSED = 3

      readyState = ClosedWebSocket.CLOSED
      onopen: (() => void) | null = null
      onclose: (() => void) | null = null
      onmessage: ((event: MessageEvent<string>) => void) | null = null

      constructor(url: string) {
        void url
      }

      send(data: string): void {
        void data
      }

      close(): void {
        this.onclose?.()
      }
    }
    Object.defineProperty(globalThis, 'WebSocket', {
      value: ClosedWebSocket,
      configurable: true,
    })

    try {
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
      fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

      expect(screen.getByText('Gateway is not connected.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Gateway is not connected. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(globalThis, 'WebSocket', {
        value: OriginalWebSocket,
        configurable: true,
      })
    }
  })

  it('shows lock telemetry when selected preset no longer exists', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'volatile-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'volatile-template' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'volatile-template' },
    })
    window.localStorage.setItem('quick-action-presets-v1', JSON.stringify({}))
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(
      screen.getByText(
        'Preset not found: volatile-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits preset-not-found telemetry when block telemetry is hidden', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'hidden-volatile-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'hidden-volatile-template' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'hidden-volatile-template' },
    })
    window.localStorage.setItem('quick-action-presets-v1', JSON.stringify({}))
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(screen.getByText('Preset not found: hidden-volatile-template.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Preset not found: hidden-volatile-template. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('adds quick-action history entries when requests are sent', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByText('accounts.list')).toBeInTheDocument()
      expect(screen.getByText('sent', { selector: '.history-list .history-status' })).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when gateway request is rejected', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.ping' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: false,
                  error: {
                    code: 'SIMULATED_REJECTION',
                    message: 'Simulated gateway rejection',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Ping' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          'Simulated gateway rejection. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('omits gateway rejection telemetry when block telemetry is hidden', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.ping' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: false,
                  error: {
                    code: 'SIMULATED_REJECTION',
                    message: 'Simulated gateway rejection',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ping' }))

    await waitFor(() => {
      expect(screen.getByText('Simulated gateway rejection.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Simulated gateway rejection. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('includes lock telemetry in successful request response blocks', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'ok',
                    connection: 'healthy',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
        ),
      ).toBeInTheDocument()
    })
    const responseCard = screen.getByText('gateway.status response').closest('article')
    expect(responseCard).not.toBeNull()
    expect(within(responseCard as HTMLElement).getByText('SystemStatus')).toBeInTheDocument()
    expect(
      within(responseCard as HTMLElement).getByText(
        'System summary: status:ok · connection:healthy · protocol:n/a',
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('hides block payload telemetry when block telemetry is toggled off', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'ok',
                    connection: 'healthy',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    expect(window.localStorage.getItem('quick-action-block-telemetry-visibility-v1')).toBe('hidden')
    expect(
      screen.getByText('blockTelemetry:hidden', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(screen.getByText(/"connection": "healthy"/)).toBeInTheDocument()
      expect(
        screen.queryByText(
          /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
        ),
      ).not.toBeInTheDocument()
    })

    sendSpy.mockRestore()
  })

  it('includes lock telemetry in incoming event blocks', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.feed.event',
                  payload: {
                    action: 'subscribed',
                    subscriptionId: 'sub_simulated_1',
                  },
                }),
              }),
            )
          })
          window.setTimeout(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'ok',
                  },
                }),
              }),
            )
          }, 1)
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(screen.getByText('event.feed.event')).toBeInTheDocument()
    })

    const eventCard = screen.getByText('event.feed.event').closest('article')
    expect(eventCard).not.toBeNull()
    expect(
      within(eventCard as HTMLElement).getByText(
        /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
      ),
    ).toBeInTheDocument()
    expect(within(eventCard as HTMLElement).getByText('RawPayload')).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText('Unknown block type; showing raw payload.'),
    ).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText(/"action":\s*"subscribed"/, {
        selector: '.block-raw-json-viewer',
      }),
    ).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText(/"subscriptionId":\s*"sub_simulated_1"/, {
        selector: '.block-raw-json-viewer',
      }),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('renders backtest-report event blocks with typed backtest renderer label', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.backtests.report',
                  payload: {
                    requestId: payload.id,
                    metrics: {
                      trades: 2,
                      winRate: 0.5,
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    protocolVersion: 1,
                    server: { name: 'mt5-claude-trader-v2' },
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(screen.getByText('event.backtests.report')).toBeInTheDocument()
    })

    const reportCard = screen.getByText('event.backtests.report').closest('article')
    expect(reportCard).not.toBeNull()
    expect(within(reportCard as HTMLElement).getByText('BacktestReport')).toBeInTheDocument()
    expect(
      within(reportCard as HTMLElement).getByText(
        'Backtest summary: trades:2 · winRate:50.00% · curve:n/a',
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('renders trade execution event blocks with typed execution summary', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.trade.executed',
                  payload: {
                    requestId: payload.id,
                    execution: {
                      status: 'filled',
                      orderId: 'ord_demo_1',
                      symbol: 'ETHUSDm',
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'ok',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(screen.getByText('event.trade.executed')).toBeInTheDocument()
    })

    const executionCard = screen.getByText('event.trade.executed').closest('article')
    expect(executionCard).not.toBeNull()
    expect(within(executionCard as HTMLElement).getByText('TradeExecution')).toBeInTheDocument()
    expect(
      within(executionCard as HTMLElement).getByText(
        'Execution summary: status:filled · order:ord_demo_1 · symbol:ETHUSDm',
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('includes lock telemetry in risk alert event blocks', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.preview' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.alert',
                  payload: {
                    requestId: payload.id,
                    decision: {
                      allowed: false,
                      violations: [
                        {
                          code: 'MAX_DAILY_LOSS',
                          message: 'Daily loss limit reached.',
                        },
                      ],
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    allowed: false,
                    violations: [
                      {
                        code: 'MAX_DAILY_LOSS',
                        message: 'Daily loss limit reached.',
                      },
                    ],
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Risk Preview' }))

    await waitFor(() => {
      expect(screen.getByText('event.risk.alert')).toBeInTheDocument()
    })

    const eventCard = screen.getByText('event.risk.alert').closest('article')
    expect(eventCard).not.toBeNull()
    expect(within(eventCard as HTMLElement).getByText('RiskAlert')).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText(
        'Risk summary: allowed:no · violations:1 · codes:MAX_DAILY_LOSS',
      ),
    ).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText(
        /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
      ),
    ).toBeInTheDocument()
    const proposalCard = screen.getByText('risk.preview response').closest('article')
    expect(proposalCard).not.toBeNull()
    expect(within(proposalCard as HTMLElement).getByText('TradeProposal')).toBeInTheDocument()
    expect(
      within(proposalCard as HTMLElement).getByText(
        'Proposal summary: allowed:no · violations:1',
      ),
    ).toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('omits lock telemetry in risk alert event blocks when block telemetry is hidden', async () => {
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'risk.preview' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.risk.alert',
                  payload: {
                    requestId: payload.id,
                    decision: {
                      allowed: false,
                      violations: [
                        {
                          code: 'MAX_DAILY_LOSS',
                          message: 'Daily loss limit reached.',
                        },
                      ],
                    },
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    allowed: false,
                    violations: [
                      {
                        code: 'MAX_DAILY_LOSS',
                        message: 'Daily loss limit reached.',
                      },
                    ],
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Risk Preview' }))

    await waitFor(() => {
      expect(screen.getByText('event.risk.alert')).toBeInTheDocument()
    })

    const eventCard = screen.getByText('event.risk.alert').closest('article')
    expect(eventCard).not.toBeNull()
    expect(within(eventCard as HTMLElement).getByText(/"MAX_DAILY_LOSS"/)).toBeInTheDocument()
    expect(within(eventCard as HTMLElement).getByText('RiskAlert')).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).getByText(
        'Risk summary: allowed:no · violations:1 · codes:MAX_DAILY_LOSS',
      ),
    ).toBeInTheDocument()
    expect(
      within(eventCard as HTMLElement).queryByText(
        /\[LockTelemetry\] lock toggles: 0, tone: none, reset: never; sources: Alt\+L=0, controls=0, snapshot=0/,
      ),
    ).not.toBeInTheDocument()

    sendSpy.mockRestore()
  })

  it('avoids duplicate block-key warnings when timestamps collide', async () => {
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(1_777_777_777_777)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sendSpy = vi
      .spyOn(WebSocket.prototype, 'send')
      .mockImplementation(function (
        this: WebSocket,
        data: string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>,
      ) {
        if (typeof data !== 'string') {
          return
        }
        const payload = JSON.parse(data) as {
          type?: string
          id?: string
          method?: string
        }
        if (payload.type === 'req' && payload.method === 'gateway.status' && payload.id) {
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'event',
                  event: 'event.feed.event',
                  payload: {
                    action: 'subscribed',
                    subscriptionId: 'sub_collision',
                  },
                }),
              }),
            )
          })
          queueMicrotask(() => {
            this.onmessage?.(
              new MessageEvent('message', {
                data: JSON.stringify({
                  type: 'res',
                  id: payload.id,
                  ok: true,
                  payload: {
                    status: 'ok',
                  },
                }),
              }),
            )
          })
        }
      })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Status' }))

    await waitFor(() => {
      expect(screen.getByText('event.feed.event')).toBeInTheDocument()
      expect(screen.getByText('gateway.status response')).toBeInTheDocument()
    })

    const duplicateKeyWarnings = consoleErrorSpy.mock.calls.filter(([message]) =>
      String(message).includes('Encountered two children with the same key'),
    )
    expect(duplicateKeyWarnings).toHaveLength(0)

    sendSpy.mockRestore()
    consoleErrorSpy.mockRestore()
    dateSpy.mockRestore()
  })

  it('filters quick-action history by status', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Min Request Gap (ms)'), {
      target: { value: '1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(
        screen.getByText('debounced', { selector: '.history-list .history-status' }),
      ).toBeInTheDocument()
      expect(screen.getByText('sent', { selector: '.history-list .history-status' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('History Filter'), {
      target: { value: 'debounced' },
    })

    expect(screen.getByText('debounced', { selector: '.history-list .history-status' })).toHaveClass(
      'status-debounced',
    )
    expect(
      screen.queryByText('sent', { selector: '.history-list .history-status' }),
    ).not.toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-history-filter-v1')).toBe('debounced')
  })

  it('shows color legend pills for quick-action statuses', () => {
    render(<App />)

    expect(screen.getByText('ok', { selector: '.history-legend .history-status' })).toHaveClass(
      'status-ok',
    )
    expect(
      screen.getByText('error', { selector: '.history-legend .history-status' }),
    ).toHaveClass('status-error')
    expect(
      screen.getByText('debounced', { selector: '.history-legend .history-status' }),
    ).toHaveClass('status-debounced')
    expect(
      screen.getByText('skipped', { selector: '.history-legend .history-status' }),
    ).toHaveClass('status-skipped')
  })

  it('supports timestamp format selection control', () => {
    render(<App />)

    const selector = screen.getByLabelText('Timestamp Format')
    expect(selector).toHaveValue('absolute')

    fireEvent.change(selector, { target: { value: 'relative' } })
    expect(selector).toHaveValue('relative')
    expect(window.localStorage.getItem('quick-action-timestamp-format-v1')).toBe('relative')
  })

  it('copies filtered quick-action history to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1)
      const payload = String(writeText.mock.calls[0][0])
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('filter=all')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleAlt+L=0')
      expect(payload).toContain('lockToggleControls=0')
      expect(payload).toContain('lockToggleSnapshot=0')
      expect(payload).toContain('[Entries]')
      expect(payload).toContain('accounts.list')
      expect(
        screen.getByText(
          'Copied 1 history entries (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits history lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledTimes(1)
      const payload = String(writeText.mock.calls[0][0])
      expect(payload).toContain('filter=all')
      expect(payload).toContain('[Entries]')
      expect(payload).toContain('accounts.list')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(screen.getByText('Copied 1 history entries.')).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when history copy is skipped', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))
    expect(
      screen.getByText(
        'No quick-action history entries available for current filter. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits history skip telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))

    expect(screen.getByText('No quick-action history entries available for current filter.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No quick-action history entries available for current filter. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows lock telemetry when history copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits history copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy History' }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('exports presets as JSON to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'export-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export Presets JSON' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('export-template')
      expect(
        screen.getByText(
          'Copied 1 presets JSON to clipboard (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits preset export failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export Presets JSON' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('omits preset export telemetry details when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'export-hidden-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export Presets JSON' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('export-hidden-template')
      expect(screen.getByText('Copied 1 presets JSON to clipboard.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Copied 1 presets JSON to clipboard (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('imports presets from JSON payload', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"imported-template":{"managedAccountId":"acct_imported"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'imported-template' })).toBeInTheDocument()
      expect(screen.getByText('Accepted')).toBeInTheDocument()
      expect(
        screen.getByText('imported-template', { selector: '.preset-import-report span' }),
      ).toBeInTheDocument()
    })
  })

  it('applies defaults when imported presets omit required keys', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"partial-template":{"feedSymbol":"LTCUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'partial-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(screen.getByLabelText('Feed Symbol')).toHaveValue('LTCUSDm')
    expect(screen.getByLabelText('Account ID')).toHaveValue('acct_demo_1')
    expect(screen.getByLabelText('Feed Timeframe')).toHaveValue('5m')
    expect(screen.getByLabelText('Emergency Action')).toHaveValue('pause_trading')
    expect(screen.getByLabelText('Emergency Reason')).toHaveValue('dashboard emergency stop trigger')
  })

  it('respects merge mode when importing conflicting presets', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Preset Name'), {
      target: { value: 'conflict-template' },
    })
    fireEvent.change(screen.getByLabelText('Feed Symbol'), {
      target: { value: 'ETHUSDm' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    fireEvent.change(screen.getByLabelText('Import Mode'), {
      target: { value: 'merge' },
    })
    expect(window.localStorage.getItem('quick-action-preset-import-mode-v1')).toBe('merge')
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"conflict-template":{"feedSymbol":"BTCUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))
    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'conflict-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(screen.getByLabelText('Feed Symbol')).toHaveValue('ETHUSDm')
    const preservedRow = screen.getByText('Preserved').closest('div')
    const overwrittenRow = screen.getByText('Overwritten').closest('div')
    expect(preservedRow).not.toBeNull()
    expect(overwrittenRow).not.toBeNull()
    expect(within(preservedRow as HTMLElement).getByText('1')).toBeInTheDocument()
    expect(within(overwrittenRow as HTMLElement).getByText('0')).toBeInTheDocument()
  })

  it('updates import mode badge styling when mode changes', () => {
    render(<App />)

    const badge = screen.getByLabelText('Import Mode Badge')
    expect(within(badge).getByText('overwrite')).toHaveClass('mode-overwrite')

    fireEvent.change(screen.getByLabelText('Import Mode'), {
      target: { value: 'merge' },
    })

    expect(within(badge).getByText('merge')).toHaveClass('mode-merge')
  })

  it('updates import helper hint based on import mode', () => {
    render(<App />)
    expect(screen.getByText(/overwrites conflicting presets\./)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Import Mode'), {
      target: { value: 'merge' },
    })
    expect(screen.getByText(/preserves existing conflicting presets\./)).toBeInTheDocument()
  })

  it('toggles import hint visibility and persists preference', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Hints' }))
    expect(screen.queryByText(/overwrites conflicting presets\./)).not.toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-hint-visibility-v1')).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Show Hints' }))
    expect(screen.getByText(/overwrites conflicting presets\./)).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-hint-visibility-v1')).toBe('visible')
  })

  it('toggles helper diagnostics section and persists collapse state', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Helper Diagnostics' }))

    expect(screen.getByRole('button', { name: 'Expand Helper Diagnostics' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hide Hints' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-helper-diagnostics-v1')).toBe(
      'collapsed',
    )
  })

  it('initializes helper diagnostics collapse state from localStorage', () => {
    window.localStorage.setItem('quick-action-import-helper-diagnostics-v1', 'collapsed')
    render(<App />)

    expect(screen.getByRole('button', { name: 'Expand Helper Diagnostics' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hide Hints' })).not.toBeInTheDocument()
  })

  it('supports compact hint mode toggle', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Use Compact Hints' }))
    expect(screen.getByText(/Shortcuts:/, { selector: '.preset-import-hint' })).toBeInTheDocument()
    expect(screen.getByText('/', { selector: '.hotkey-chip' })).toBeInTheDocument()
    expect(screen.queryByText(/overwrites conflicting presets\./)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Detailed Hints' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-hint-mode-v1')).toBe('compact')
  })

  it('initializes hint mode from localStorage preference', () => {
    window.localStorage.setItem('quick-action-import-hint-mode-v1', 'compact')
    render(<App />)
    expect(screen.getByText(/Shortcuts:/, { selector: '.preset-import-hint' })).toBeInTheDocument()
    expect(screen.queryByText(/overwrites conflicting presets\./)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Detailed Hints' })).toBeInTheDocument()
  })

  it('copies import shortcut cheat-sheet to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Shortcut Cheat Sheet' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Import Shortcuts')
      expect(payload).toContain('Ctrl/Cmd+Enter')
      expect(payload).toContain('Alt+L')
      expect(payload).toContain('Active mode: overwrite')
      expect(payload).toContain('Helper reset format: absolute')
      expect(payload).toContain('Helper reset stale-after hours: 24')
      expect(payload).toContain('Helper reset lock: locked')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('Helper lock counter reset at: never')
      expect(payload).toContain('Helper lock toggle total: 0')
      expect(payload).toContain('Helper lock toggle tone: none')
      expect(payload).toContain('Helper lock toggle Alt+L: 0')
      expect(payload).toContain('Helper lock toggle controls: 0')
      expect(payload).toContain('Helper lock toggle snapshot: 0')
      expect(
        screen.getByText(
          'Copied import shortcut cheat-sheet to clipboard (lock: locked, toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when shortcut cheat-sheet copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Shortcut Cheat Sheet' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits shortcut cheat-sheet copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Shortcut Cheat Sheet' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('omits shortcut lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Shortcut Cheat Sheet' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Import Shortcuts')
      expect(payload).toContain('Helper reset lock: locked')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('Helper lock toggle total:')
      expect(
        screen.getByText('Copied import shortcut cheat-sheet to clipboard (lock: locked).'),
      ).toBeInTheDocument()
    })
  })

  it('copies status shortcut legend with lock telemetry metadata', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Show Legend in Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Status Legend' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Status Shortcut Legend')
      expect(payload).toContain('mode=detailed')
      expect(payload).toContain('order=import-first')
      expect(payload).toContain('density=chips')
      expect(payload).toContain('legendVisible=yes')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(payload).toContain('lockToggleAlt+L=0')
      expect(payload).toContain('lockToggleControls=0')
      expect(payload).toContain('lockToggleSnapshot=0')
      expect(payload).toContain('[Legend]')
      expect(payload).toContain('Ctrl/Cmd+Enter\tRun preset JSON import')
      expect(payload).toContain('Alt+L\tToggle helper reset lock')
      expect(
        screen.getByText(
          'Copied status shortcut legend to clipboard (lock: locked, toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits status legend lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show Legend in Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Status Legend' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Status Shortcut Legend')
      expect(payload).toContain('legendVisible=yes')
      expect(payload).toContain('[Legend]')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(
        screen.getByText('Copied status shortcut legend to clipboard (lock: locked).'),
      ).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when import report copy is skipped', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))
    expect(
      screen.getByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits import report skip telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))

    expect(screen.getByText('No preset import report available yet.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows lock telemetry when last summary copy is skipped', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))
    expect(
      screen.getByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits last summary skip telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))

    expect(screen.getByText('No preset import report available yet.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows lock telemetry when full names copy is skipped', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))
    expect(
      screen.getByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).toBeInTheDocument()
  })

  it('omits full names skip telemetry when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))

    expect(screen.getByText('No preset import report available yet.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'No preset import report available yet. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
      ),
    ).not.toBeInTheDocument()
  })

  it('shows lock telemetry when status legend copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Show Legend in Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Status Legend' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits status legend copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Show Legend in Status' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Status Legend' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('toggles helper reset lock via Alt+L keyboard shortcut', () => {
    render(<App />)
    const input = screen.getByLabelText('Import Presets JSON')
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via Alt+L.')).toBeInTheDocument()
    expect(screen.getByText('helper.reset.lock.toggle.Alt+L')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock locked via Alt+L.')).toBeInTheDocument()
    expect(screen.getByText('Alt+L:2')).toBeInTheDocument()
  })

  it('toggles import shortcut legend visibility in status panel', () => {
    render(<App />)
    expect(screen.queryByText(/Import Shortcut Legend/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show Legend in Status' }))
    expect(screen.getByText('Import Shortcut Legend', { selector: 'dt' })).toHaveTextContent(
      'Import Shortcut Legend (detailed)',
    )
    expect(screen.getByRole('button', { name: 'Hide Legend in Status' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-status-shortcut-legend-v1')).toBe('visible')

    const legendRow = screen.getByText('Import Shortcut Legend', { selector: 'dt' })
      .nextElementSibling as HTMLElement
    expect(within(legendRow).getAllByText(/Ctrl\/Cmd\+Enter|Esc|\//)[0]).toHaveTextContent(
      'Ctrl/Cmd+Enter',
    )
    expect(within(legendRow).getByText('Ctrl/Cmd+Enter')).toHaveAttribute(
      'title',
      'Run preset JSON import',
    )
    expect(within(legendRow).getByText('Alt+L')).toHaveAttribute(
      'title',
      'Toggle helper reset lock',
    )

    fireEvent.change(screen.getByLabelText('Legend Order'), {
      target: { value: 'clear-first' },
    })
    expect(within(legendRow).getAllByText(/Ctrl\/Cmd\+Enter|Esc|\//)[0]).toHaveTextContent('Esc')
    expect(window.localStorage.getItem('quick-action-status-shortcut-legend-order-v1')).toBe(
      'clear-first',
    )

    fireEvent.change(screen.getByLabelText('Legend Density'), {
      target: { value: 'inline' },
    })
    expect(within(legendRow).queryByText('Esc', { selector: '.hotkey-chip' })).not.toBeInTheDocument()
    expect(within(legendRow).getByText(/Esc=clear/)).toBeInTheDocument()
    expect(within(legendRow).getByText(/Alt\+L=lock/)).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-status-shortcut-legend-density-v1')).toBe(
      'inline',
    )
  })

  it('initializes status shortcut legend visibility from localStorage', () => {
    window.localStorage.setItem('quick-action-status-shortcut-legend-v1', 'visible')
    window.localStorage.setItem('quick-action-status-shortcut-legend-order-v1', 'clear-first')
    window.localStorage.setItem('quick-action-status-shortcut-legend-density-v1', 'inline')
    render(<App />)
    expect(screen.getByText('Import Shortcut Legend', { selector: 'dt' })).toHaveTextContent(
      'Import Shortcut Legend (detailed)',
    )
    expect(screen.getByRole('button', { name: 'Hide Legend in Status' })).toBeInTheDocument()
    expect(screen.getByLabelText('Legend Density')).toHaveValue('inline')
    const legendRow = screen.getByText('Import Shortcut Legend', { selector: 'dt' })
      .nextElementSibling as HTMLElement
    expect(within(legendRow).getAllByText(/Ctrl\/Cmd\+Enter|Esc|\//)[0]).toHaveTextContent('Esc')
    expect(within(legendRow).getByText(/Esc=clear/)).toBeInTheDocument()
    expect(within(legendRow).getByText(/Alt\+L=lock/)).toBeInTheDocument()
  })

  it('supports helper quick toggles from status snapshot row', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Hide Hints' }))
    expect(screen.getByRole('button', { name: 'Quick Show Hints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Hints' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Show Legend' }))
    expect(screen.getByRole('button', { name: 'Quick Hide Legend' })).toBeInTheDocument()
    expect(screen.getByText('Import Shortcut Legend', { selector: 'dt' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Hide Reset Badge' }))
    expect(screen.getByRole('button', { name: 'Quick Show Reset Badge' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Helper Reset Badge')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Unlock Reset' }))
    expect(screen.getByRole('button', { name: 'Quick Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via snapshot.')).toBeInTheDocument()
    expect(screen.getByText('snapshot:1')).toBeInTheDocument()
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveTextContent('quickLock:unlocked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveClass('quick-lock-unlocked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveAttribute(
      'title',
      'Quick lock summary: reset lock is unlocked.',
    )
    expect(screen.getByText('(lock:unlocked)', { selector: '.quick-toggle-lock-state' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toHaveAttribute(
      'title',
      'Quick toggles expanded; reset lock is unlocked.',
    )
    expect(screen.getByText('Preset Import Snapshot', { selector: 'dt' })).toHaveTextContent(
      'Preset Import Snapshot (lock:unlocked)',
    )
  })

  it('toggles helper reset badge visibility and persists preference', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Reset Badge' }))
    expect(screen.getByRole('button', { name: 'Show Reset Badge' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-reset-badge-visibility-v1')).toBe('hidden')
    expect(screen.queryByLabelText('Helper Reset Badge')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy Reset Badge' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show Reset Badge' }))
    expect(screen.getByRole('button', { name: 'Hide Reset Badge' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-reset-badge-visibility-v1')).toBe(
      'visible',
    )
    expect(screen.getByLabelText('Helper Reset Badge')).toBeInTheDocument()
  })

  it('toggles helper reset badge tools section and persists preference', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Reset Badge Tools' }))
    expect(screen.getByRole('button', { name: 'Show Reset Badge Tools' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-reset-badge-section-v1')).toBe(
      'collapsed',
    )
    expect(screen.queryByLabelText('Helper Reset Badge')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy Reset Badge' })).not.toBeInTheDocument()
  })

  it('initializes helper reset badge tools section from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-badge-section-v1', 'collapsed')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Show Reset Badge Tools' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Helper Reset Badge')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy Reset Badge' })).not.toBeInTheDocument()
  })

  it('toggles helper reset lock and persists preference', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via controls.')).toBeInTheDocument()
    expect(screen.getByText('controls:1')).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-reset-lock-v1')).toBe('unlocked')
    expect(screen.getByText('Helper Diagnostics', { selector: 'dt' })).toHaveTextContent(
      'Helper Diagnostics (lock:unlocked)',
    )
    expect(
      screen.getByText('lock:unlocked', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('helper-reset-lock-badge', 'lock-unlocked')
  })

  it('tracks helper reset lock toggle count in snapshot badge', () => {
    render(<App />)
    expect(screen.getByText('lockToggles:0')).toBeInTheDocument()
    expect(screen.getByText('srcAlt+L:0')).toBeInTheDocument()
    expect(screen.getByText('srcControls:0')).toBeInTheDocument()
    expect(screen.getByText('srcSnapshot:0')).toBeInTheDocument()
    expect(screen.getByText('diagLockToggles:0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    expect(screen.getByText('lockToggles:1')).toBeInTheDocument()
    expect(screen.getByText('lockToggles:1')).toHaveClass('counter-tone-active')
    expect(screen.getByText('srcControls:1')).toBeInTheDocument()
    expect(screen.getByText('srcControls:1')).toHaveClass('counter-tone-active')
    expect(screen.getByText('diagLockToggles:1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Lock Reset' }))
    expect(screen.getByText('lockToggles:2')).toBeInTheDocument()
    expect(screen.getByText('srcControls:2')).toBeInTheDocument()
    expect(screen.getByText('diagLockToggles:2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    expect(screen.getByText('lockToggles:3')).toBeInTheDocument()
    expect(screen.getByText('lockToggles:3')).toHaveClass('counter-tone-high')
    expect(screen.getByText('srcControls:3')).toBeInTheDocument()
    expect(screen.getByText('srcControls:3')).toHaveClass('counter-tone-high')
    expect(screen.getByText('diagLockToggles:3')).toBeInTheDocument()
    expect(screen.getByText('diagLockToggles:3')).toHaveClass('counter-tone-high')
  })

  it('resets helper lock counters and persists reset timestamp', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lock Reset' }))
    expect(screen.getByText('lockToggles:2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Lock Counters' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Reset Lock Counters' }))

    expect(
      screen.getByText(
        'Reset helper lock counters (lock toggles: 2, tone: active, reset: never; sources: Alt+L=0, controls=2, snapshot=0).',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('lockToggles:0')).toBeInTheDocument()
    expect(screen.getByText('srcControls:0')).toBeInTheDocument()
    expect(screen.getByText('diagLockToggles:0')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Lock Counters' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Reset Lock Counters' }))
    expect(
      screen.getByText(
        /No helper reset lock toggle history to clear\. Lock telemetry: lock toggles: 0, tone: none, reset: .*; sources: Alt\+L=0, controls=0, snapshot=0\./,
      ),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-lock-counters-reset-at-v1')).toBeTruthy()
    expect(
      screen.queryByText('counterReset:never', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('lockCounterReset:never', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).not.toBeInTheDocument()
  })

  it('omits reset lock counter telemetry details when block telemetry is hidden', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset Lock Counters' }))

    expect(screen.getByText('Reset helper lock counters.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Reset helper lock counters (lock toggles: 2, tone: active, reset: never; sources: Alt+L=0, controls=2, snapshot=0).',
      ),
    ).not.toBeInTheDocument()
  })

  it('initializes helper reset lock from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-lock-v1', 'unlocked')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Preset Import Snapshot', { selector: 'dt' })).toHaveTextContent(
      'Preset Import Snapshot (lock:unlocked)',
    )
    expect(screen.getByText('Helper Diagnostics', { selector: 'dt' })).toHaveTextContent(
      'Helper Diagnostics (lock:unlocked)',
    )
    expect(
      screen.getByText('lock:unlocked', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('helper-reset-lock-badge', 'lock-unlocked')
  })

  it('initializes helper reset badge visibility from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-badge-visibility-v1', 'hidden')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Show Reset Badge' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Helper Reset Badge')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Show Reset Badge' })).toBeInTheDocument()
  })

  it('persists snapshot quick-toggle expansion state', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Quick Toggles' }))

    expect(screen.getByRole('button', { name: 'Show Quick Toggles' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quick Hide Hints' })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-snapshot-toggles-v1')).toBe('collapsed')
  })

  it('shows collapsed quick-toggle hint with current lock state', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Quick Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Quick Toggles' }))
    expect(screen.getByRole('button', { name: 'Show Quick Toggles' })).toHaveAttribute(
      'title',
      'Quick toggles collapsed; expand to access quick actions; reset lock is unlocked.',
    )
  })

  it('initializes snapshot quick-toggle expansion state from localStorage', () => {
    window.localStorage.setItem('quick-action-import-snapshot-toggles-v1', 'collapsed')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Show Quick Toggles' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Quick Hide Hints' })).not.toBeInTheDocument()
  })

  it('initializes helper reset timestamp from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-diagnostics-reset-at-v1', '2026-02-17T00:00:00.000Z')
    render(<App />)
    expect(
      screen.getByText('reset:2026-02-17T00:00:00.000Z', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()
  })

  it('marks helper reset badge as stale for old timestamps', () => {
    window.localStorage.setItem('quick-action-helper-diagnostics-reset-at-v1', '2020-01-01T00:00:00.000Z')
    render(<App />)
    expect(screen.getByLabelText('Helper Reset Badge')).toHaveClass('tone-stale')
    expect(
      screen.getByText('tone:stale', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
  })

  it('persists helper reset timestamp format selection', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Reset TS'), {
      target: { value: 'relative' },
    })
    expect(window.localStorage.getItem('quick-action-helper-reset-timestamp-format-v1')).toBe(
      'relative',
    )
  })

  it('persists helper reset stale-threshold selection', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Stale After'), {
      target: { value: '72' },
    })
    expect(window.localStorage.getItem('quick-action-helper-reset-stale-threshold-hours-v1')).toBe(
      '72',
    )
  })

  it('initializes helper reset timestamp format from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-timestamp-format-v1', 'relative')
    render(<App />)
    expect(screen.getByLabelText('Reset TS')).toHaveValue('relative')
  })

  it('initializes helper reset stale-threshold from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-stale-threshold-hours-v1', '72')
    render(<App />)
    expect(screen.getByLabelText('Stale After')).toHaveValue('72')
  })

  it('uses stale-threshold preference when calculating helper reset tone', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    window.localStorage.setItem('quick-action-helper-diagnostics-reset-at-v1', twoDaysAgo)
    window.localStorage.setItem('quick-action-helper-reset-stale-threshold-hours-v1', '72')
    render(<App />)
    expect(screen.getByLabelText('Helper Reset Badge')).toHaveClass('tone-fresh')
  })

  it('updates helper diagnostics summary counters in status panel', () => {
    render(<App />)
    expect(
      screen.getByText('enabled:1/2', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Show Legend' }))
    expect(
      screen.getByText('enabled:2/2', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quick Hide Hints' }))
    expect(
      screen.getByText('enabled:1/2', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
  })

  it('supports compact and verbose helper diagnostics display modes', () => {
    render(<App />)
    expect(
      screen.queryByText('expanded:yes', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Use Verbose Diagnostics' }))
    expect(screen.getByRole('button', { name: 'Use Compact Diagnostics' })).toBeInTheDocument()
    expect(
      screen.getByText('expanded:yes', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('hintVisible:yes', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('diag:verbose', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-helper-diagnostics-mode-v1')).toBe(
      'verbose',
    )
  })

  it('initializes helper diagnostics display mode from localStorage', () => {
    window.localStorage.setItem('quick-action-import-helper-diagnostics-mode-v1', 'verbose')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Use Compact Diagnostics' })).toBeInTheDocument()
    expect(
      screen.getByText('expanded:yes', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
  })

  it('copies helper diagnostics summary to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Helper Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[HelperDiagnostics]')
      expect(payload).toContain('expanded=yes')
      expect(payload).toContain('enabled=1/2')
      expect(payload).toContain('density=chips')
      expect(payload).toContain('resetAt=never')
      expect(payload).toContain('resetFormat=absolute')
      expect(payload).toContain('resetBadgeVisible=yes')
      expect(payload).toContain('resetBadgeSection=expanded')
      expect(payload).toContain('resetLock=locked')
      expect(payload).toContain('resetStaleAfterHours=24')
      expect(payload).toContain('blockTelemetry=visible')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(payload).toContain('lockToggleAlt+L=0')
      expect(payload).toContain('lockToggleAlt+LTone=none')
      expect(payload).toContain('lockToggleControls=0')
      expect(payload).toContain('lockToggleControlsTone=none')
      expect(payload).toContain('lockToggleSnapshot=0')
      expect(payload).toContain('lockToggleSnapshotTone=none')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('[LockTelemetry]')
      expect(
        screen.getByText(
          'Copied helper diagnostics summary to clipboard (lock: locked, toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits helper summary lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Helper Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[HelperDiagnostics]')
      expect(payload).toContain('blockTelemetry=hidden')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(
        screen.getByText('Copied helper diagnostics summary to clipboard (lock: locked).'),
      ).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when helper summary copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Helper Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits helper summary copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Helper Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('copies helper reset badge text to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Reset Badge' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[ResetBadge]')
      expect(payload).toContain('last reset=never')
      expect(payload).toContain('resetFormat=absolute')
      expect(payload).toContain('staleAfterHours=24')
      expect(payload).toContain('resetLock=locked')
      expect(payload).toContain('resetBadgeVisible=yes')
      expect(payload).toContain('resetBadgeSection=expanded')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(payload).toContain('lockToggleAlt+L=0')
      expect(payload).toContain('lockToggleAlt+LTone=none')
      expect(payload).toContain('lockToggleControls=0')
      expect(payload).toContain('lockToggleControlsTone=none')
      expect(payload).toContain('lockToggleSnapshot=0')
      expect(payload).toContain('lockToggleSnapshotTone=none')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(
        screen.getByText(
          'Copied helper reset badge text to clipboard (lock: locked, toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when helper reset badge copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Reset Badge' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits helper reset badge copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Reset Badge' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('omits helper reset badge lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Copy Reset Badge' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[ResetBadge]')
      expect(payload).toContain('resetLock=locked')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(
        screen.getByText('Copied helper reset badge text to clipboard (lock: locked).'),
      ).toBeInTheDocument()
    })
  })

  it('resets helper diagnostics preferences to defaults', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Quick Show Legend' }))
    fireEvent.change(screen.getByLabelText('Legend Order'), {
      target: { value: 'clear-first' },
    })
    fireEvent.change(screen.getByLabelText('Legend Density'), {
      target: { value: 'inline' },
    })
    fireEvent.change(screen.getByLabelText('Stale After'), {
      target: { value: '72' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use Verbose Diagnostics' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Reset Badge Tools' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Reset Badge' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.click(screen.getByRole('button', { name: 'Hide Quick Toggles' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))

    expect(screen.getByRole('button', { name: 'Quick Show Legend' })).toBeInTheDocument()
    expect(screen.getByLabelText('Legend Order')).toHaveValue('import-first')
    expect(screen.getByLabelText('Legend Density')).toHaveValue('chips')
    expect(screen.getByRole('button', { name: 'Use Verbose Diagnostics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge Tools' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Block Telemetry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByLabelText('Helper Reset Badge')).toBeInTheDocument()
    expect(screen.getByLabelText('Stale After')).toHaveValue('24')
    expect(
      screen.getByText('tone:fresh', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-diagnostics-reset-at-v1')).toBeTruthy()
    expect(screen.queryByText('resetAge:never')).not.toBeInTheDocument()
    expect(screen.getByText(/resetAge:/)).toBeInTheDocument()
    expect(screen.getByLabelText('Helper Reset Badge')).not.toHaveTextContent('last reset: never')
    expect(screen.getByLabelText('Helper Reset Badge')).toHaveClass('tone-fresh')
    expect(
      screen.getByText('blockTelemetry:visible', {
        selector: '.import-snapshot-badges .import-summary-badge',
      }),
    ).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-block-telemetry-visibility-v1')).toBe('visible')
    expect(
      screen.getByText(
          'Reset helper diagnostics preferences to defaults.',
      ),
    ).toBeInTheDocument()
  })

  it('includes reset-helper success telemetry when block telemetry is visible', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))

    expect(
      screen.getByText(
        'Reset helper diagnostics preferences to defaults (lock toggles: 1, tone: active, reset: never; sources: Alt+L=0, controls=1, snapshot=0).',
      ),
    ).toBeInTheDocument()
  })

  it('reports accepted and rejected preset names after import', async () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"good-template":{"feedSymbol":"SOLUSDm"},"bad-template":123}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(
        screen.getByText('good-template', { selector: '.preset-import-report span' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('bad-template', { selector: '.preset-import-report span' }),
      ).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
      const summary = screen.getByLabelText('Import Report Summary Badges')
      expect(within(summary).getByText('accepted:1')).toBeInTheDocument()
      expect(within(summary).getByText('rejected:1')).toBeInTheDocument()
      expect(
        screen.getByText('accepted:1', { selector: '.import-snapshot-badges .import-summary-badge' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('rejected:1', { selector: '.import-snapshot-badges .import-summary-badge' }),
      ).toBeInTheDocument()
      expect(
        screen.getByText('hint:detailed', { selector: '.import-snapshot-badges .import-summary-badge' }),
      ).toBeInTheDocument()
      expect(screen.getByText(/Last import: .*accepted 1 .*rejected 1/)).toBeInTheDocument()
      expect(
        screen.getByText(
          'Imported 1 preset entries (overwrite). Created 1, preserved 0, overwritten 0, rejected 1. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('clears import JSON textarea with one click', () => {
    render(<App />)
    const importTextarea = screen.getByLabelText('Import Presets JSON')
    const clearButton = screen.getByRole('button', { name: 'Clear Import JSON' })

    fireEvent.change(importTextarea, {
      target: {
        value: '{"temp-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })

    expect(clearButton).toBeEnabled()
    fireEvent.click(clearButton)
    expect(importTextarea).toHaveValue('')
    expect(clearButton).toBeDisabled()
  })

  it('imports presets via Ctrl+Enter keyboard shortcut', async () => {
    render(<App />)
    const importTextarea = screen.getByLabelText('Import Presets JSON')

    fireEvent.change(importTextarea, {
      target: {
        value: '{"shortcut-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.keyDown(importTextarea, { key: 'Enter', ctrlKey: true })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'shortcut-template' })).toBeInTheDocument()
    })
  })

  it('clears import JSON textarea via Escape keyboard shortcut', () => {
    render(<App />)
    const importTextarea = screen.getByLabelText('Import Presets JSON')
    fireEvent.change(importTextarea, {
      target: {
        value: '{"escape-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })

    fireEvent.keyDown(importTextarea, { key: 'Escape' })
    expect(importTextarea).toHaveValue('')
  })

  it('toggles hint mode via slash shortcut when import input is empty', () => {
    render(<App />)
    const importTextarea = screen.getByLabelText('Import Presets JSON')
    fireEvent.keyDown(importTextarea, { key: '/' })

    expect(screen.getByText(/Shortcuts:/, { selector: '.preset-import-hint' })).toBeInTheDocument()
    expect(screen.queryByText(/overwrites conflicting presets\./)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Detailed Hints' })).toBeInTheDocument()
    expect(screen.getByText('Hint mode set to compact via slash shortcut.')).toBeInTheDocument()
  })

  it('truncates long import report name lists with overflow counter', async () => {
    render(<App />)
    const manyPresets = Object.fromEntries(
      Array.from({ length: 8 }, (_, idx) => [`bulk-template-${idx}`, { feedSymbol: 'ETHUSDm' }]),
    )
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: JSON.stringify(manyPresets),
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByText(/\(\+2 more\)/)).toBeInTheDocument()
    })
  })

  it('copies preset import report summary to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"copy-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('accepted=copy-template')
      expect(payload).toContain('mode=overwrite')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(payload).toContain('lockToggleAlt+L=0')
      expect(payload).toContain('lockToggleControls=0')
      expect(payload).toContain('lockToggleSnapshot=0')
      expect(
        screen.getByText(
          'Preset import report copied to clipboard (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits import report lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"copy-template-hidden":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('accepted=copy-template-hidden')
      expect(payload).toContain('mode=overwrite')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(screen.getByText('Preset import report copied to clipboard.')).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when import report copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"copy-report-failure-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits import report copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"copy-report-failure-hidden-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Import Report' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('copies last import summary text to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"summary-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Last import:')
      expect(payload).toContain('accepted 1')
      expect(payload).toContain('rejected 0')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(
        screen.getByText(
          'Copied last import summary to clipboard (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits last summary lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"summary-hidden-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('Last import:')
      expect(payload).toContain('accepted 1')
      expect(payload).toContain('rejected 0')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(screen.getByText('Copied last import summary to clipboard.')).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when last summary copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"summary-copy-failure-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits last summary copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"summary-copy-failure-hidden-template":{"feedSymbol":"SOLUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Last Summary' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  it('clears preset import report diagnostics', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"clear-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeEnabled()
      expect(screen.getByText('Accepted')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear Import Report' }))

    expect(screen.queryByText('Accepted')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeDisabled()
    expect(
      screen.getByText(
        'Cleared the latest preset import diagnostics (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
      ),
    ).toBeInTheDocument()
  })

  it('omits clear-import-report telemetry details when block telemetry is hidden', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"clear-hidden-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeEnabled()
      expect(screen.getByText('Accepted')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear Import Report' }))

    expect(screen.queryByText('Accepted')).not.toBeInTheDocument()
    expect(screen.getByText('Cleared the latest preset import diagnostics.')).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Cleared the latest preset import diagnostics (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
      ),
    ).not.toBeInTheDocument()
  })

  it('supports collapsing and expanding preset import report details', async () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"toggle-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Collapse Report' })).toBeEnabled()
      expect(screen.getByText('Accepted')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Collapse Report' }))
    expect(screen.queryByText('Accepted')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Expand Report' })).toBeEnabled()
    expect(window.localStorage.getItem('quick-action-preset-import-report-expanded-v1')).toBe(
      'collapsed',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Expand Report' }))
    expect(screen.getByText('Accepted')).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-preset-import-report-expanded-v1')).toBe(
      'expanded',
    )
  })

  it('initializes import report expansion state from localStorage preference', async () => {
    window.localStorage.setItem('quick-action-preset-import-report-expanded-v1', 'collapsed')
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"collapsed-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Expand Report' })).toBeEnabled()
    })
    expect(screen.queryByText('Accepted')).not.toBeInTheDocument()
  })

  it('copies full accepted and rejected names without truncation', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    const manyPresets = Object.fromEntries(
      Array.from({ length: 8 }, (_, idx) => [`full-template-${idx}`, { feedSymbol: 'ETHUSDm' }]),
    )
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: JSON.stringify(manyPresets),
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[ImportNames]')
      expect(payload).toContain('accepted:full-template-0')
      expect(payload).toContain('full-template-7')
      expect(payload).not.toContain('(+')
      expect(payload).toContain('[LockTelemetry]')
      expect(payload).toContain('lockCounterResetAt=never')
      expect(payload).toContain('lockToggleTotal=0')
      expect(payload).toContain('lockToggleTone=none')
      expect(
        screen.getByText(
          'Copied full accepted/rejected import names to clipboard (lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0).',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits full-name lock telemetry metadata when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"full-hidden-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      const payload = String(writeText.mock.calls[writeText.mock.calls.length - 1][0])
      expect(payload).toContain('[ImportNames]')
      expect(payload).toContain('accepted:full-hidden-template')
      expect(payload).not.toContain('[LockTelemetry]')
      expect(payload).not.toContain('lockToggleTotal=')
      expect(screen.getByText('Copied full accepted/rejected import names to clipboard.')).toBeInTheDocument()
    })
  })

  it('shows lock telemetry when full-name copy fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"full-copy-failure-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('omits full-name copy failure telemetry when block telemetry is hidden', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Hide Block Telemetry' }))
    fireEvent.change(screen.getByLabelText('Import Presets JSON'), {
      target: {
        value: '{"full-copy-failure-hidden-template":{"feedSymbol":"ETHUSDm"}}',
      },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Import Presets JSON' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeEnabled()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy Full Names' }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled()
      expect(screen.getByText('Clipboard access failed or is unavailable.')).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Clipboard access failed or is unavailable. Lock telemetry: lock toggles: 0, tone: none, reset: never; sources: Alt+L=0, controls=0, snapshot=0.',
        ),
      ).not.toBeInTheDocument()
    })
  })
})
