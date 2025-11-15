# Testing Architecture

This project uses a modern testing setup with **Vitest**, **MSW (Mock Service Worker)**, and **Testing Library** for comprehensive testing.

## 🚀 Quick Start

```bash
# Run tests in watch mode
bun test:watch

# Run tests once
bun test:run

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

## 📁 Project Structure

```
tests/
├── setup.ts                    # Test setup and global mocks
├── mocks/
│   ├── server.ts               # MSW server configuration
│   ├── handlers/               # API route handlers
│   │   ├── index.ts            # Combined handlers
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── goals.ts            # Goals API endpoints
│   │   ├── tasks.ts            # Tasks API endpoints
│   │   └── roadmaps.ts         # Roadmaps API endpoints
│   └── data/                   # Mock data
│       ├── users.ts            # User mock data
│       ├── goals.ts            # Goals mock data
│       ├── tasks.ts            # Tasks mock data
│       └── roadmaps.ts         # Roadmaps mock data
├── utils/
│   └── test-utils.tsx          # Custom render function and utilities
├── components/                 # Component tests
│   ├── ui/                     # UI component tests
│   └── organisms/              # Complex component tests
├── hooks/                      # Custom hook tests
└── pages/                      # API route tests
```

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)

- Uses `jsdom` environment for DOM testing
- Configured with proper path aliases
- Coverage reporting with v8
- Excludes unnecessary files from coverage

### MSW Setup

- **Server**: Node.js environment for API mocking
- **Handlers**: Organized by feature (auth, goals, tasks, etc.)
- **Data**: Realistic mock data for testing

## 🧪 Testing Patterns

### Component Testing

```typescript
import { render, screen } from '@/tests/utils/test-utils'
import { MyComponent } from '@/components/MyComponent'

test('renders correctly', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### API Testing with MSW

```typescript
import { server } from '@/tests/mocks/server'
import { http, HttpResponse } from 'msw'

test('handles API error', async () => {
  // Override handler for this test
  server.use(
    http.get('/api/goals', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }),
  )

  // Your test code here
})
```

### Hook Testing

```typescript
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

test('custom hook works', () => {
  const { result } = renderHook(() => useMyHook(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  })

  expect(result.current.data).toBeDefined()
})
```

## 🛠 Utilities

### `test-utils.tsx`

- **Custom render**: Wraps components with necessary providers
- **Mock factories**: Create test data easily
- **Helper functions**: Common testing utilities

### Mock Data Factories

```typescript
import { createMockUser, createMockGoal } from '@/tests/utils/test-utils'

const user = createMockUser({ name: 'Custom Name' })
const goal = createMockGoal({ title: 'Custom Goal' })
```

## 🎯 Best Practices

### 1. **Arrange, Act, Assert**

```typescript
test('example test', async () => {
  // Arrange
  const user = userEvent.setup()
  render(<MyComponent />)

  // Act
  await user.click(screen.getByRole('button'))

  // Assert
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

### 2. **Use Realistic Data**

- Use the mock data factories
- Create data that matches your actual API responses
- Test edge cases and error states

### 3. **Test User Interactions**

- Use `@testing-library/user-event` for realistic interactions
- Test keyboard navigation and accessibility
- Test error states and loading states

### 4. **Mock External Dependencies**

```typescript
// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    // Mock implementation
  })),
}))
```

### 5. **Clean Up Between Tests**

```typescript
beforeEach(() => {
  server.resetHandlers() // Reset MSW handlers
})

afterEach(() => {
  cleanup() // Clean up DOM
})
```

## 🔍 Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 85%
- **Lines**: > 80%

## 📝 Writing New Tests

### 1. **Component Tests**

```typescript
// tests/components/organisms/my-component.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { MyComponent } from '@/components/organisms/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### 2. **API Route Tests**

```typescript
// tests/pages/api/my-route.test.ts
import { describe, it, expect } from 'vitest'
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/pages/api/my-route'

describe('/api/my-route', () => {
  it('handles POST request', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST' })
        expect(res.status).toBe(200)
      },
    })
  })
})
```

### 3. **Hook Tests**

```typescript
// tests/hooks/use-my-hook.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('expected')
  })
})
```

## 🚨 Common Issues

### 1. **MSW Handler Not Working**

- Check the URL matches exactly
- Ensure handlers are in the correct order
- Use `server.resetHandlers()` between tests

### 2. **React Query Issues**

- Disable retries in test QueryClient
- Set `gcTime: 0` to prevent caching
- Use `waitFor` for async operations

### 3. **DOM Cleanup**

- Always use the custom `render` from test-utils
- Don't forget `cleanup()` in setup.ts

This testing architecture provides a solid foundation for testing your Goal Pilot application with modern tools and best practices! 🎉
