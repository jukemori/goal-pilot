import type { Tables } from '@/types/database'

export const mockUser: Tables<'users'> = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}
