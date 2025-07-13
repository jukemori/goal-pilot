import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/atoms/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveAttribute('data-slot', 'card')
      expect(card).toHaveClass('bg-card', 'rounded-xl', 'border')
    })

    it('applies custom className', () => {
      render(<Card className="custom-card">Content</Card>)
      
      const card = screen.getByText('Content')
      expect(card).toHaveClass('custom-card')
      expect(card).toHaveClass('bg-card') // Still has default classes
    })
  })

  describe('CardHeader', () => {
    it('renders with correct data slot and classes', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toHaveAttribute('data-slot', 'card-header')
      expect(header).toHaveClass('grid', 'px-6')
    })
  })

  describe('CardTitle', () => {
    it('renders with correct styling', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toHaveAttribute('data-slot', 'card-title')
      expect(title).toHaveClass('font-semibold', 'leading-none')
    })
  })

  describe('CardDescription', () => {
    it('renders with muted foreground styling', () => {
      render(<CardDescription>Card description text</CardDescription>)
      
      const description = screen.getByText('Card description text')
      expect(description).toHaveAttribute('data-slot', 'card-description')
      expect(description).toHaveClass('text-muted-foreground', 'text-sm')
    })
  })

  describe('CardContent', () => {
    it('renders with padding', () => {
      render(<CardContent>Card content area</CardContent>)
      
      const content = screen.getByText('Card content area')
      expect(content).toHaveAttribute('data-slot', 'card-content')
      expect(content).toHaveClass('px-6')
    })
  })

  describe('CardFooter', () => {
    it('renders with flex layout', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveAttribute('data-slot', 'card-footer')
      expect(footer).toHaveClass('flex', 'items-center', 'px-6')
    })
  })

  describe('CardAction', () => {
    it('renders with grid positioning', () => {
      render(<CardAction>Action button</CardAction>)
      
      const action = screen.getByText('Action button')
      expect(action).toHaveAttribute('data-slot', 'card-action')
      expect(action).toHaveClass('col-start-2', 'row-span-2')
    })
  })

  describe('Complete Card', () => {
    it('renders all card components together', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>This is a test card</CardDescription>
            <CardAction>
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p>Main content of the card</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is a test card')).toBeInTheDocument()
      expect(screen.getByText('Main content of the card')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument()
    })
  })
})