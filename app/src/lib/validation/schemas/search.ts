import { z } from 'zod'

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(200),
  types: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined))
    .pipe(z.array(z.enum(['jobs', 'clients', 'vendors', 'invoices'])).optional()),
  limit: z.coerce.number().int().positive().max(20).default(5),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>
