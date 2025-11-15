import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { Badge } from '@/components/atoms/badge'

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)

    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-primary')
    expect(badge).toHaveAttribute('data-slot', 'badge')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>)

    let badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('bg-secondary')

    rerender(<Badge variant="destructive">Destructive</Badge>)
    badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('bg-destructive')

    rerender(<Badge variant="outline">Outline</Badge>)
    badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-foreground')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)

    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
    expect(badge).toHaveClass('bg-primary') // Still has default variant
  })

  it('renders as different element when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('bg-primary')
  })

  it('renders with additional props', () => {
    render(<Badge title="Tooltip text">Badge with title</Badge>)

    const badge = screen.getByText('Badge with title')
    expect(badge).toHaveAttribute('title', 'Tooltip text')
  })
})
