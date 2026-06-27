import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '@/app/dashboard/page'

vi.mock('@/store/wallet', () => ({
  useWalletStore: () => ({
    address: 'GABC1234'
  })
}))

vi.mock('@/lib/soroban', () => ({
  fetchCreditScore: vi.fn().mockResolvedValue(520),
  fetchAllLoans: vi.fn().mockResolvedValue([]),
  fetchWalletBalance: vi.fn().mockResolvedValue("100.00"),
  getRpcServer: vi.fn(),
  buildRequestLoanTx: vi.fn(),
  buildRepayLoanTx: vi.fn(),
  TESTNET_NETWORK_PASSPHRASE: "Test",
  CONTRACT_ADDRESS_LOAN_PROTOCOL: "C123"
}))

describe('Dashboard', () => {
  it('renders the dashboard with wallet connected', async () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(await screen.findByText('520')).toBeDefined() // Mocked credit score
  })
})
