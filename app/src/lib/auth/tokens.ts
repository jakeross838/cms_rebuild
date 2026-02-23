/**
 * Token utilities for invitations and other secure tokens.
 * Uses crypto for secure random generation and hashing.
 */

import { createHash, randomBytes } from 'crypto'

/**
 * Generate a secure random token
 * Returns a URL-safe base64 string
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('base64url')
}

/**
 * Hash a token using SHA-256
 * Always hash tokens before storing in the database
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Verify a token against its hash
 */
export function verifyToken(token: string, hash: string): boolean {
  const tokenHash = hashToken(token)
  // Timing-safe comparison
  if (tokenHash.length !== hash.length) return false
  let result = 0
  for (let i = 0; i < tokenHash.length; i++) {
    result |= tokenHash.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return result === 0
}

/**
 * Generate an invitation token and its hash
 */
export function generateInviteToken(): { token: string; hash: string } {
  const token = generateToken(32)
  const hash = hashToken(token)
  return { token, hash }
}
