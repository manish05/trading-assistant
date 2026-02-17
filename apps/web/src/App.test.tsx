import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

describe('Dashboard shell', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders primary dashboard regions', () => {
    render(<App />)

    expect(screen.getByText('Market Panel')).toBeInTheDocument()
    expect(screen.getByText('Agent Feed')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
    expect(screen.getByText('Feed Lifecycle')).toBeInTheDocument()
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
  })

  it('sends account and feed management requests', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

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
      ) as Array<{ method?: string }>
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
    })

    sendSpy.mockRestore()
  })
})
