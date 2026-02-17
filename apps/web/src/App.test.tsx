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
    expect(screen.getByLabelText('Lock Toggle Source Legend')).toBeInTheDocument()
    expect(screen.getByLabelText('Timestamp Format')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy History' })).toBeEnabled()
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
    expect(screen.getByRole('button', { name: 'Notify Device' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unpair Device' })).toBeInTheDocument()
    expect(screen.getByLabelText('Device Notify Message')).toHaveValue('Dashboard test notification')
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
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Lock Counters' })).toBeEnabled()
    expect(screen.getByText('Last import: none')).toBeInTheDocument()
    expect(screen.getByText('Alt+L:0')).toBeInTheDocument()
    expect(screen.getByText('controls:0')).toBeInTheDocument()
    expect(screen.getByText('snapshot:0')).toBeInTheDocument()
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
    fireEvent.change(screen.getByLabelText('Device Notify Message'), {
      target: { value: 'custom-notify-message' },
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
    fireEvent.click(screen.getByRole('button', { name: 'Notify Device' }))
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
      expect(methods).toContain('devices.notifyTest')
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

      const deviceNotifyTest = payloads.find((payload) => payload.method === 'devices.notifyTest')
      expect(deviceNotifyTest?.params).toMatchObject({
        deviceId: 'dev_custom_9',
        message: 'custom-notify-message',
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
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Lock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeEnabled()
    expect(screen.getByText('Helper reset lock unlocked via Alt+L.')).toBeInTheDocument()
    expect(screen.getByText('helper.reset.lock.toggle.Alt+L')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'l', altKey: true })
    expect(screen.getByRole('button', { name: 'Unlock Reset' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
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
    expect(screen.getByRole('button', { name: 'Reset Helper Prefs' })).toBeDisabled()
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
