import { http, HttpResponse } from 'msw'
import { mockUser } from '../data/users'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const authHandlers = [
  // Get user session
  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: mockUser.id,
      email: mockUser.email,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
    })
  }),

  // Sign in
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = (await request.json()) as any

    if (body.grant_type === 'password') {
      return HttpResponse.json({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      })
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 400 })
  }),

  // Sign out
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
