import { http, HttpResponse } from 'msw'

const mockUser = {
  id: crypto.randomUUID(),
  company_id: crypto.randomUUID(),
  email: 'jake.ross@rosshomes.com',
  name: 'Jake Ross',
  role: 'owner' as const,
  phone: '(555) 123-4567',
  avatar_url: null,
  is_active: true,
  created_at: '2025-06-15T10:00:00.000Z',
  updated_at: '2025-06-15T10:00:00.000Z',
}

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
}

export const handlers = [
  // Auth: Get current user profile
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      data: mockUser,
      error: null,
    })
  }),

  // Auth: Login
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      data: mockSession,
      error: null,
    })
  }),

  // Auth: Logout
  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({
      data: { success: true },
      error: null,
    })
  }),

  // Users: List users
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      data: [mockUser],
      error: null,
      meta: {
        total: 1,
        page: 1,
        per_page: 25,
      },
    })
  }),
]
