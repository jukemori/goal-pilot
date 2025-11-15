import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PUT } from '@/app/api/user/profile/route'
import { server } from '@/tests/mocks/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      updateUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'test-user-123',
          name: 'Test User',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    })),
  })),
}))

describe('/api/user/profile API Routes', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('GET /api/user/profile', () => {
    it('should return user profile successfully', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual({
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })
    })

    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthorized user
      vi.mocked(
        await import('@/lib/supabase/server'),
      ).createClient.mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Unauthorized' },
          }),
        },
      } as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('PUT /api/user/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
      }

      const request = new NextRequest('http://localhost/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
    })

    it('should return 401 when user is not authenticated for update', async () => {
      // Mock unauthorized user
      vi.mocked(
        await import('@/lib/supabase/server'),
      ).createClient.mockReturnValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any)

      const request = new NextRequest('http://localhost/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})
