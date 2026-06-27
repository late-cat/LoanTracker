import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '@/app/dashboard/page'

vi.mock('@/store/wallet', () => ({
  useWalletStore: () => ({
    address: 'GABC1234'
  })
}))

describe('Dashboard', () => {
  it('renders the dashboard with wallet connected', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('520')).toBeDefined() // Mocked credit score
  })
})
