import type { z } from 'zod'

export * from './schemas';

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  errors: Record<string, string[]>;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Parse `data` against a Zod `schema` and return a discriminated result.
 *
 * @example
 * const result = validate(paginationSchema, req.query);
 * if (!result.success) {
 *   return NextResponse.json({ errors: result.errors }, { status: 400 });
 * }
 * const { page, limit } = result.data;
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): ValidationResult<T> {
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  return { success: false, errors: formatZodErrors(parsed.error) };
}

/**
 * Flatten a `ZodError` into a plain object keyed by dotted field path.
 *
 * @example
 * // { "address.city": ["Required"], "limit": ["Expected number"] }
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join('.') : '_root';

    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }

    fieldErrors[path].push(issue.message);
  }

  return fieldErrors;
}
