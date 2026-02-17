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
  })

  it('renders gateway action buttons for account/feed listing', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Accounts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feeds' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Subscribe Feed' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unsubscribe Feed' })).toBeDisabled()
  })

  it('sends accounts.list, feeds.list, and feeds.subscribe requests', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    fireEvent.click(screen.getByRole('button', { name: 'Feeds' }))
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe Feed' }))

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string }>
      const methods = payloads.map((payload) => payload.method)

      expect(methods).toContain('accounts.list')
      expect(methods).toContain('feeds.list')
      expect(methods).toContain('feeds.subscribe')
    })

    sendSpy.mockRestore()
  })
})
