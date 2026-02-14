import { z } from 'zod';

// ---------------------------------------------------------------------------
// Primitive atoms
// ---------------------------------------------------------------------------

/** UUID v4 string */
export const uuidSchema = z.string().uuid();

/** Email — normalized to lowercase */
export const emailSchema = z.string().email().toLowerCase();

/**
 * US phone number (optional field).
 * Accepts: (555) 123-4567, 555-123-4567, 5551234567, +1 555 123 4567, etc.
 * Trims whitespace and allows empty string so the field can be left blank.
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .pipe(
    z
      .string()
      .regex(
        /^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
        'Invalid US phone number',
      )
      .optional(),
  );

/**
 * Monetary value — coerced from string/number, non-negative, max 2 decimals.
 */
export const moneySchema = z.coerce
  .number()
  .nonnegative('Amount must be non-negative')
  .refine(
    (v) => Number.isFinite(v) && Math.round(v * 100) / 100 === v,
    'Amount must have at most 2 decimal places',
  );

// ---------------------------------------------------------------------------
// Common field schemas
// ---------------------------------------------------------------------------

/** Non-empty trimmed name (1-255 chars) */
export const nameSchema = z.string().trim().min(1, 'Name is required').max(255);

/** Optional description (max 5 000 chars) */
export const descriptionSchema = z.string().trim().max(5000).optional();

// ---------------------------------------------------------------------------
// Composite schemas
// ---------------------------------------------------------------------------

/** Pagination query params — safe defaults for list endpoints */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Factory that returns a sort schema for a known set of sortable field names.
 *
 * @example
 * const jobSort = createSortSchema(['name', 'created_at', 'status']);
 * // -> z.object({ sortBy: z.enum([...]).default('name'), sortOrder: ... })
 */
export function createSortSchema<T extends string>(fields: readonly [T, ...T[]]) {
  const enumSchema = z.enum(fields);
  return z.object({
    sortBy: enumSchema.default(fields[0]),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  });
}

/**
 * Optional date range.  When both dates are provided, `startDate` must be
 * earlier than or equal to `endDate`.
 */
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );

/** US mailing address — all fields optional */
export const addressSchema = z.object({
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z
    .string()
    .trim()
    .optional(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Address = z.infer<typeof addressSchema>;
