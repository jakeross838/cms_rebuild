/**
 * Document Storage Utility
 *
 * Manages file operations against Supabase Storage.
 * Files stored with path: /{company_id}/{job_id}/{folder_path}/{uuid}_{filename}
 */

import { BLOCKED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/types/documents'

/** Storage bucket name in Supabase */
export const STORAGE_BUCKET = 'documents'

/**
 * Validate a file before upload.
 * Returns null if valid, or an error message.
 */
export function validateFile(filename: string, fileSize: number): string | null {
  // Check file size
  if (fileSize <= 0) {
    return 'File size must be greater than 0'
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`
  }

  // Check extension
  const ext = getFileExtension(filename)
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return `File type .${ext} is not allowed`
  }

  return null
}

/**
 * Get the file extension from a filename (lowercase, no dot).
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) return ''
  return filename.slice(lastDot + 1).toLowerCase()
}

/**
 * Build the storage path for a file.
 */
export function buildStoragePath(
  companyId: string,
  jobId: string | null,
  filename: string,
  fileId: string
): string {
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const jobSegment = jobId ?? '_company'
  return `${companyId}/${jobSegment}/${fileId}_${safeFilename}`
}

/**
 * Get the MIME type category for display purposes.
 */
export function getMimeCategory(mimeType: string): 'image' | 'pdf' | 'document' | 'spreadsheet' | 'archive' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  // Check spreadsheet before document — some spreadsheet MIME types contain "document"
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  ) return 'spreadsheet'
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType === 'text/plain' ||
    mimeType === 'text/rtf'
  ) return 'document'
  if (
    mimeType.includes('zip') ||
    mimeType.includes('compressed') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  ) return 'archive'
  return 'other'
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/**
 * Generate a signed download URL expiration time (1 hour).
 */
export const SIGNED_URL_EXPIRY_SECONDS = 3600
