'use client'

import { useState, useEffect, Suspense } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Building2, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface FormErrors {
  password?: string
  confirmPassword?: string
  name?: string
  general?: string
}

interface InvitationInfo {
  email: string
  name: string | null
  role: string
  companyName: string
}

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [checkingToken, setCheckingToken] = useState(true)

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('No invitation token provided.')
        setCheckingToken(false)
        return
      }

      try {
        // We'll validate by attempting to look up the invitation
        // For now, we just proceed to the form - validation happens on submit
        // In a real app, you might add a GET endpoint to validate tokens
        setCheckingToken(false)
      } catch {
        setTokenError('Failed to validate invitation.')
        setCheckingToken(false)
      }
    }

    validateToken()
  }, [token])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain a lowercase letter'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain an uppercase letter'
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain a number'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/v1/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
          name: name.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404 || response.status === 410) {
          setTokenError(data.message)
        } else if (response.status === 409) {
          // Already accepted or already a member
          setErrors({ general: data.message })
        } else if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || 'Failed to accept invitation' })
        }
        return
      }

      setInvitation({
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        companyName: data.company.name,
      })
      setSuccess(true)
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Invalid invitation</CardTitle>
            <CardDescription>{tokenError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This invitation link may have expired or already been used. Please contact your administrator for a new invitation.
            </p>
            <div className="text-center">
              <Link href="/login">
                <Button variant="outline">Go to login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to {invitation.companyName}!</CardTitle>
            <CardDescription>
              Your account has been created as a <strong>{invitation.role}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now log in with your email <strong>{invitation.email}</strong> and the password you just created.
            </p>
            <div className="text-center">
              <Link href="/login">
                <Button>
                  Continue to login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Accept your invitation</CardTitle>
          <CardDescription>
            Create your account to join the team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general ? <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {errors.general}
              </div> : null}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Your name <span className="text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Create a password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  At least 8 characters with uppercase, lowercase, and a number
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword}</p> : null}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Accept invitation'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
