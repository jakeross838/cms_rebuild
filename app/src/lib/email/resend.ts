/**
 * Resend Email Client
 *
 * Centralized email sending using Resend API.
 * All transactional emails (invitations, password resets, notifications) go through here.
 */

import { Resend } from 'resend'

// Lazy-init Resend client (only when API key is available)
let _resend: Resend | null = null
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// Default sender - update to your verified domain
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'RossOS <noreply@rossos.com>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from = DEFAULT_FROM, replyTo, tags } = options

  const client = getResendClient()

  // In development without API key, log instead of sending
  if (!client) {
    console.warn('[Email] Would send email (no RESEND_API_KEY configured):')
    console.warn(`  To: ${Array.isArray(to) ? to.join(', ') : to}`)
    console.warn(`  Subject: ${subject}`)
    console.warn(`  From: ${from}`)
    return { success: true, messageId: 'dev-mode-no-send' }
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
      tags,
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error'
    console.error('[Email] Exception:', message)
    return { success: false, error: message }
  }
}

/**
 * Send a user invitation email
 */
export async function sendInviteEmail(params: {
  to: string
  inviterName: string
  companyName: string
  role: string
  inviteUrl: string
}): Promise<SendEmailResult> {
  const { to, inviterName, companyName, role, inviteUrl } = params

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited to RossOS</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> on RossOS as a <strong>${role}</strong>.
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
      RossOS is a construction management platform that helps teams collaborate on projects, track budgets, manage schedules, and more.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Accept Invitation
      </a>
    </div>

    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
      This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${inviteUrl}" style="color: #f59e0b;">${inviteUrl}</a>
    </p>
  </div>
</body>
</html>
`

  const text = `
You're Invited to RossOS

${inviterName} has invited you to join ${companyName} on RossOS as a ${role}.

RossOS is a construction management platform that helps teams collaborate on projects, track budgets, manage schedules, and more.

Accept your invitation: ${inviteUrl}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
`

  return sendEmail({
    to,
    subject: `${inviterName} invited you to join ${companyName} on RossOS`,
    html,
    text,
    tags: [
      { name: 'type', value: 'invite' },
      { name: 'company', value: companyName },
    ],
  })
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
  userName?: string
}): Promise<SendEmailResult> {
  const { to, resetUrl, userName } = params
  const greeting = userName ? `Hi ${userName},` : 'Hi,'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      ${greeting}
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
      This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #f59e0b;">${resetUrl}</a>
    </p>
  </div>
</body>
</html>
`

  const text = `
Reset Your Password

${greeting}

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
`

  return sendEmail({
    to,
    subject: 'Reset your RossOS password',
    html,
    text,
    tags: [{ name: 'type', value: 'password-reset' }],
  })
}

/**
 * Send a welcome email after signup
 */
export async function sendWelcomeEmail(params: {
  to: string
  userName: string
  loginUrl: string
}): Promise<SendEmailResult> {
  const { to, userName, loginUrl } = params

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to RossOS!</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Hi ${userName},
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
      Welcome to RossOS! Your account has been created and you're ready to start managing your construction projects.
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
      Here's what you can do with RossOS:
    </p>

    <ul style="font-size: 14px; color: #6b7280; margin-bottom: 30px; padding-left: 20px;">
      <li>Manage project schedules and budgets</li>
      <li>Track daily logs and photos</li>
      <li>Collaborate with your team and subcontractors</li>
      <li>Generate professional reports and invoices</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Go to Dashboard
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af;">
      Need help getting started? Check out our <a href="${loginUrl}/help" style="color: #f59e0b;">help center</a> or reply to this email.
    </p>
  </div>
</body>
</html>
`

  const text = `
Welcome to RossOS!

Hi ${userName},

Welcome to RossOS! Your account has been created and you're ready to start managing your construction projects.

Here's what you can do with RossOS:
- Manage project schedules and budgets
- Track daily logs and photos
- Collaborate with your team and subcontractors
- Generate professional reports and invoices

Go to your dashboard: ${loginUrl}

Need help getting started? Check out our help center or reply to this email.
`

  return sendEmail({
    to,
    subject: 'Welcome to RossOS!',
    html,
    text,
    tags: [{ name: 'type', value: 'welcome' }],
  })
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(params: {
  to: string
  verifyUrl: string
  userName?: string
}): Promise<SendEmailResult> {
  const { to, verifyUrl, userName } = params
  const greeting = userName ? `Hi ${userName},` : 'Hi,'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      ${greeting}
    </p>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 30px;">
      Please verify your email address to complete your RossOS account setup.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        Verify Email
      </a>
    </div>

    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
      This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${verifyUrl}" style="color: #f59e0b;">${verifyUrl}</a>
    </p>
  </div>
</body>
</html>
`

  const text = `
Verify Your Email

${greeting}

Please verify your email address to complete your RossOS account setup.

Click here to verify: ${verifyUrl}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
`

  return sendEmail({
    to,
    subject: 'Verify your RossOS email',
    html,
    text,
    tags: [{ name: 'type', value: 'verification' }],
  })
}

export { getResendClient as getResend }
