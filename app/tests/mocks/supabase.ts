import { vi } from 'vitest'

interface MockSupabaseResponse<T> {
  data: T | null
  error: { message: string; code: string } | null
}

interface MockQueryBuilder<T> {
  from: (table: string) => MockQueryBuilder<T>
  select: (columns?: string) => MockQueryBuilder<T>
  insert: (data: Record<string, unknown> | Record<string, unknown>[]) => MockQueryBuilder<T>
  update: (data: Record<string, unknown>) => MockQueryBuilder<T>
  delete: () => MockQueryBuilder<T>
  eq: (column: string, value: unknown) => MockQueryBuilder<T>
  in: (column: string, values: unknown[]) => MockQueryBuilder<T>
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder<T>
  range: (from: number, to: number) => MockQueryBuilder<T>
  single: () => Promise<MockSupabaseResponse<T>>
  maybeSingle: () => Promise<MockSupabaseResponse<T | null>>
  then: <TResult>(
    onfulfilled?: (value: MockSupabaseResponse<T[]>) => TResult
  ) => Promise<TResult>
  mockReturnData: (data: T | T[]) => MockQueryBuilder<T>
  mockReturnError: (error: { message: string; code: string }) => MockQueryBuilder<T>
}

interface MockAuth {
  getUser: ReturnType<typeof vi.fn>
  signOut: ReturnType<typeof vi.fn>
}

interface MockSupabaseClient<T = unknown> {
  from: (table: string) => MockQueryBuilder<T>
  auth: MockAuth
}

export function createMockSupabaseClient<T = unknown>(): MockSupabaseClient<T> {
  let mockData: T | T[] | null = null
  let mockError: { message: string; code: string } | null = null

  const builder: MockQueryBuilder<T> = {
    from: vi.fn().mockImplementation(() => builder),
    select: vi.fn().mockImplementation(() => builder),
    insert: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    in: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => builder),
    range: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: Array.isArray(mockData) ? mockData[0] ?? null : mockData,
        error: mockError,
      })
    ),
    maybeSingle: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: Array.isArray(mockData) ? mockData[0] ?? null : mockData,
        error: mockError,
      })
    ),
    then: vi.fn().mockImplementation(
      <TResult>(onfulfilled?: (value: MockSupabaseResponse<T[]>) => TResult) => {
        const response: MockSupabaseResponse<T[]> = {
          data: Array.isArray(mockData) ? mockData : mockData !== null ? [mockData] : null,
          error: mockError,
        }
        return Promise.resolve(onfulfilled ? onfulfilled(response) : response)
      }
    ),
    mockReturnData: (data: T | T[]) => {
      mockData = data
      return builder
    },
    mockReturnError: (error: { message: string; code: string }) => {
      mockError = error
      mockData = null
      return builder
    },
  }

  const auth: MockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: {
          id: crypto.randomUUID(),
          email: 'test@rosshomes.com',
          app_metadata: {},
          user_metadata: { name: 'Test User' },
          aud: 'authenticated',
          created_at: '2025-06-15T10:00:00.000Z',
        },
      },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
  }

  return {
    from: vi.fn().mockImplementation((table: string) => {
      builder.from(table)
      return builder
    }),
    auth,
  }
}
