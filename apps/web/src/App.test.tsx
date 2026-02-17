import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

describe('Dashboard shell', () => {
  it('renders primary dashboard regions', () => {
    render(<App />)

    expect(screen.getByText('Market Panel')).toBeInTheDocument()
    expect(screen.getByText('Agent Feed')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
  })

  it('renders gateway action buttons for account/feed listing', () => {
    render(<App />)

    expect(screen.getAllByRole('button', { name: 'Accounts' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Feeds' }).length).toBeGreaterThan(0)
  })

  it('sends accounts.list and feeds.list requests from action panel', async () => {
    const sendSpy = vi.spyOn(WebSocket.prototype, 'send')
    render(<App />)

    const accountsButton = screen.getAllByRole('button', { name: 'Accounts' })[0]
    const feedsButton = screen.getAllByRole('button', { name: 'Feeds' })[0]
    fireEvent.click(accountsButton)
    fireEvent.click(feedsButton)

    await waitFor(() => {
      const payloads = sendSpy.mock.calls.map(([serialized]) =>
        JSON.parse(String(serialized)),
      ) as Array<{ method?: string }>
      const methods = payloads.map((payload) => payload.method)

      expect(methods).toContain('accounts.list')
      expect(methods).toContain('feeds.list')
    })

    sendSpy.mockRestore()
  })
})
