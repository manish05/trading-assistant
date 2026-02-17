import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('Dashboard shell', () => {
  afterEach(() => {
    window.localStorage.clear()
    cleanup()
  })

  it('renders primary dashboard regions', () => {
    render(<App />)

    expect(screen.getByText('Market Panel')).toBeInTheDocument()
    expect(screen.getByText('Agent Feed')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
    expect(screen.getByText('Feed Lifecycle')).toBeInTheDocument()
    expect(screen.getByText('Quick Action History')).toBeInTheDocument()
    expect(screen.getByText('Preset Import Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Quick Action Timestamps')).toBeInTheDocument()
    expect(screen.getByLabelText('History Filter')).toBeInTheDocument()
    expect(screen.getByLabelText('History Legend')).toBeInTheDocument()
    expect(screen.getByLabelText('Timestamp Format')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy History' })).toBeDisabled()
  })

  it('renders gateway action buttons for account/feed listing', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Connect Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Disconnect Account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feeds' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Devices' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pair Device' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register Push' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unpair Device' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subscribe Feed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unsubscribe Feed' })).toBeDisabled()
    expect(screen.getByLabelText('Refresh Interval (sec)')).toBeInTheDocument()
    expect(screen.getByLabelText('Min Request Gap (ms)')).toBeInTheDocument()
    expect(screen.getByLabelText('Enable Auto Refresh')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Load Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete Preset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export Presets JSON' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Import Presets JSON' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear Import JSON' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Last Summary' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeDisabled()
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
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toBeInTheDocument()
    expect(screen.getByText('(lock:locked)', { selector: '.quick-toggle-lock-state' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Hide Hints' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Show Legend' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Hide Reset Badge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveTextContent('quickLock:locked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveClass('quick-lock-locked')
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
    expect(screen.getByLabelText('Reset TS')).toHaveValue('absolute')
    expect(screen.getByLabelText('Stale After')).toHaveValue('24')
    expect(screen.getByRole('button', { name: 'Copy Helper Summary' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByText('Last import: none')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Connect Account' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disconnect Account' }))
    fireEvent.click(screen.getByRole('button', { name: 'Feeds' }))
    fireEvent.click(screen.getByRole('button', { name: 'Devices' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pair Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Register Push' }))
    fireEvent.click(screen.getByRole('button', { name: 'Unpair Device' }))
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe Feed' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string; params?: Record<string, unknown> }>
      const methods = payloads.map((payload) => payload.method)

      expect(methods).toContain('accounts.list')
      expect(methods).toContain('accounts.connect')
      expect(methods).toContain('accounts.disconnect')
      expect(methods).toContain('feeds.list')
      expect(methods).toContain('devices.list')
      expect(methods).toContain('devices.pair')
      expect(methods).toContain('devices.registerPush')
      expect(methods).toContain('devices.unpair')
      expect(methods).toContain('feeds.subscribe')

      const accountConnect = payloads.find((payload) => payload.method === 'accounts.connect')
      expect(accountConnect?.params).toMatchObject({
        accountId: 'acct_custom_9',
        providerAccountId: 'provider_custom_9',
        label: 'Swing Account',
        allowedSymbols: ['XAUUSDm', 'ETHUSDm'],
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

      const feedSubscribe = payloads.find((payload) => payload.method === 'feeds.subscribe')
      expect(feedSubscribe?.params).toMatchObject({
        topics: ['market.tick'],
        symbols: ['BTCUSDm'],
        timeframes: ['1h'],
      })
    })

    sendSpy.mockRestore()
  })

  it('debounces repeated requests for the same method', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

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
    fireEvent.click(screen.getByRole('button', { name: 'Save Preset' }))

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'swing-template' })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Feed Symbol'), {
      target: { value: 'BTCUSDm' },
    })
    fireEvent.change(screen.getByLabelText('Saved Presets'), {
      target: { value: 'swing-template' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Load Preset' }))

    expect(screen.getByLabelText('Feed Symbol')).toHaveValue('SOLUSDm')

    fireEvent.click(screen.getByRole('button', { name: 'Delete Preset' }))
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'swing-template' })).not.toBeInTheDocument()
    })
  })

  it('adds quick-action history entries when requests are sent', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))

    await waitFor(() => {
      expect(screen.getByText('accounts.list')).toBeInTheDocument()
      expect(screen.getByText('sent', { selector: '.history-list .history-status' })).toBeInTheDocument()
    })
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
    expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument()
    expect(screen.getByText('/', { selector: '.hotkey-chip' })).toBeInTheDocument()
    expect(screen.queryByText(/overwrites conflicting presets\./)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Detailed Hints' })).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-import-hint-mode-v1')).toBe('compact')
  })

  it('initializes hint mode from localStorage preference', () => {
    window.localStorage.setItem('quick-action-import-hint-mode-v1', 'compact')
    render(<App />)
    expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument()
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
      expect(
        screen.getByText('Copied import shortcut cheat-sheet to clipboard (lock: locked).'),
      ).toBeInTheDocument()
    })
  })

  it('toggles helper reset lock via Alt+L keyboard shortcut', () => {
    render(<App />)
    const input = screen.getByLabelText('Import Presets JSON')
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via Alt+L.')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
    expect(screen.getByText('Helper reset lock locked via Alt+L.')).toBeInTheDocument()
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
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveTextContent('quickLock:unlocked')
    expect(screen.getByLabelText('Quick Toggle Lock Summary')).toHaveClass('quick-lock-unlocked')
    expect(screen.getByText('(lock:unlocked)', { selector: '.quick-toggle-lock-state' })).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Unlock Reset' }))
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via controls.')).toBeInTheDocument()
    expect(window.localStorage.getItem('quick-action-helper-reset-lock-v1')).toBe('unlocked')
    expect(screen.getByText('Helper Diagnostics', { selector: 'dt' })).toHaveTextContent(
      'Helper Diagnostics (lock:unlocked)',
    )
    expect(
      screen.getByText('lock:unlocked', { selector: '.import-snapshot-badges .import-summary-badge' }),
    ).toHaveClass('helper-reset-lock-badge', 'lock-unlocked')
  })

  it('initializes helper reset lock from localStorage', () => {
    window.localStorage.setItem('quick-action-helper-reset-lock-v1', 'unlocked')
    render(<App />)
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
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
      expect(payload).toContain('expanded=yes')
      expect(payload).toContain('enabled=1/2')
      expect(payload).toContain('density=chips')
      expect(payload).toContain('resetAt=never')
      expect(payload).toContain('resetFormat=absolute')
      expect(payload).toContain('resetBadgeVisible=yes')
      expect(payload).toContain('resetBadgeSection=expanded')
      expect(payload).toContain('resetLock=locked')
      expect(payload).toContain('resetStaleAfterHours=24')
      expect(
        screen.getByText('Copied helper diagnostics summary to clipboard (lock: locked).'),
      ).toBeInTheDocument()
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
      expect(payload).toContain('last reset=never')
      expect(payload).toContain('resetFormat=absolute')
      expect(payload).toContain('staleAfterHours=24')
      expect(payload).toContain('resetLock=locked')
      expect(payload).toContain('resetBadgeVisible=yes')
      expect(payload).toContain('resetBadgeSection=expanded')
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
    fireEvent.click(screen.getByRole('button', { name: 'Hide Quick Toggles' }))

    fireEvent.click(screen.getByRole('button', { name: 'Reset Helper Prefs' }))

    expect(screen.getByRole('button', { name: 'Quick Show Legend' })).toBeInTheDocument()
    expect(screen.getByLabelText('Legend Order')).toHaveValue('import-first')
    expect(screen.getByLabelText('Legend Density')).toHaveValue('chips')
    expect(screen.getByRole('button', { name: 'Use Verbose Diagnostics' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Quick Toggles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge Tools' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide Reset Badge' })).toBeInTheDocument()
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

    expect(screen.getByText(/Shortcuts:/)).toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeDisabled()
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
      expect(payload).toContain('accepted:full-template-0')
      expect(payload).toContain('full-template-7')
      expect(payload).not.toContain('(+')
    })
  })
})
