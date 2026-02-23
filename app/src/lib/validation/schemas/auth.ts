import { z } from 'zod'

import { emailSchema, nameSchema } from './common'

// Password requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters') // bcrypt limit
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: nameSchema,
    companyName: z.string().trim().min(1, 'Company name is required').max(255).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, 'Invite token is required'),
    password: passwordSchema.optional(), // Only required for new users
    confirmPassword: z.string().optional(),
    name: nameSchema.optional(), // Can override the pre-filled name
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && data.password !== data.confirmPassword) {
        return false
      }
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }
  )

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
