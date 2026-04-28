import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import App from './App'

// Mock AppRouter 组件
vi.mock('./AppRouter', () => ({
  default: () => <div data-testid="app-router">App Router</div>
}))

describe('App Component', () => {
  it('应该正确渲染 App 组件', () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(container).toBeTruthy()
  })

  it('App 组件应该包含 AppRouter', () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(getByTestId('app-router')).toBeTruthy()
  })
})
