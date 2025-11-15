import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/atoms/input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
    expect(input).toHaveClass('border-input')
  })

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)

    let input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="password" placeholder="Password" />)
    input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')

    rerender(<Input type="number" placeholder="Number" />)
    input = screen.getByPlaceholderText('Number')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles user input correctly', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input placeholder="Test input" onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Test input')
    await user.type(input, 'Hello World')

    expect(input).toHaveValue('Hello World')
    expect(handleChange).toHaveBeenCalled()
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)

    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:pointer-events-none')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />)

    const input = screen.getByPlaceholderText('Custom')
    expect(input).toHaveClass('custom-input')
    expect(input).toHaveClass('border-input') // Still has default classes
  })

  it('forwards all props correctly', () => {
    render(
      <Input
        placeholder="Test"
        defaultValue="test value"
        maxLength={10}
        required
        data-testid="test-input"
      />,
    )

    const input = screen.getByTestId('test-input')
    expect(input).toHaveValue('test value')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toBeRequired()
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(
      <Input
        placeholder="Focus test"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    )

    const input = screen.getByPlaceholderText('Focus test')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    await user.tab()
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })
})
