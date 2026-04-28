import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const navigateMock = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    Navigate: ({ to }) => {
      navigateMock(to)
      return <div data-testid="navigate">to:{to}</div>
    },
  }
})

import ProtectedRoute from './ProtectedRoute'

function Dummy() {
  return <div>SECRET</div>
}

describe('ProtectedRoute', () => {
  it('未认证：应导航到 /login', () => {
    render(<ProtectedRoute isAuthenticated={false} component={Dummy} />)
    expect(screen.getByTestId('navigate')).toHaveTextContent('to:/login')
  })

  it('已认证：应渲染目标组件', () => {
    render(<ProtectedRoute isAuthenticated={true} component={Dummy} />)
    expect(screen.getByText('SECRET')).toBeInTheDocument()
  })
})

