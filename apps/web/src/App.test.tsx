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
    expect(screen.getByRole('button', { name: 'Copy Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear Import Report' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Copy Full Names' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Expand Report' })).toBeDisabled()
    expect(screen.getByLabelText('Import Mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Import Mode Badge')).toBeInTheDocument()
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
    })
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
