/**
 * PDF Stamper — Server-side utility for stamping invoice PDFs with approval info
 *
 * Adds a colored banner at the top of the first page with invoice metadata
 * and a watermark footer on every page.
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import type { InvoiceStatus } from '@/types/invoice-full'

// ── Types ──────────────────────────────────────────────────────────────────────

export type StampType = 'approval' | 'draw' | 'payment' | 'denial'

export interface StampData {
  status: InvoiceStatus
  invoiceNumber: string | null
  vendorName: string | null
  amount: number
  costCodes: string | null
  poNumber: string | null
  approvedBy: string | null
  approvedDate: string | null
  drawNumber: number | null
  stampType: StampType
}

// ── Color Config ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { r: number; g: number; b: number }> = {
  approved:  { r: 0.15, g: 0.65, b: 0.35 },  // green
  in_draw:   { r: 0.20, g: 0.45, b: 0.80 },  // blue
  paid:      { r: 0.45, g: 0.45, b: 0.50 },  // gray
  denied:    { r: 0.80, g: 0.20, b: 0.20 },  // red
}

const DEFAULT_BANNER_COLOR = { r: 0.45, g: 0.45, b: 0.50 }

// ── Main Stamper ───────────────────────────────────────────────────────────────

/**
 * Stamp an invoice PDF with approval information.
 *
 * Adds a colored banner at the top of the first page and a small
 * watermark footer on every page. Returns the stamped PDF as bytes.
 *
 * If stamping fails for any reason, the original PDF bytes are returned
 * unchanged so the caller always gets a valid PDF.
 */
export async function stampInvoicePdf(
  pdfBytes: Uint8Array,
  stampData: StampData
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = pdfDoc.getPages()
    if (pages.length === 0) {
      return pdfBytes
    }

    // ── First page: colored banner ───────────────────────────────────────────
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    const bannerColor = STATUS_COLORS[stampData.status] ?? DEFAULT_BANNER_COLOR
    const bannerHeight = 60
    const bannerY = height - bannerHeight
    const textColor = rgb(1, 1, 1)
    const padding = 12

    // Draw banner background
    firstPage.drawRectangle({
      x: 0,
      y: bannerY,
      width,
      height: bannerHeight,
      color: rgb(bannerColor.r, bannerColor.g, bannerColor.b),
    })

    // Status label (large)
    const statusLabel = stampData.status.toUpperCase().replace(/_/g, ' ')
    firstPage.drawText(statusLabel, {
      x: padding,
      y: bannerY + bannerHeight - 20,
      size: 14,
      font,
      color: textColor,
    })

    // Detail lines
    const detailLines = buildDetailLines(stampData)
    const lineHeight = 10
    const detailFontSize = 7.5

    detailLines.forEach((line, index) => {
      const y = bannerY + bannerHeight - 34 - index * lineHeight
      if (y > bannerY + 4) {
        firstPage.drawText(line, {
          x: padding,
          y,
          size: detailFontSize,
          font: fontRegular,
          color: textColor,
        })
      }
    })

    // ── Every page: watermark footer ─────────────────────────────────────────
    const stampDate = new Date().toISOString().split('T')[0]
    const watermarkText = `Stamped by RossOS - ${stampDate}`

    for (const page of pages) {
      const { width: pw } = page.getSize()
      const textWidth = fontRegular.widthOfTextAtSize(watermarkText, 7)
      page.drawText(watermarkText, {
        x: pw - textWidth - 10,
        y: 10,
        size: 7,
        font: fontRegular,
        color: rgb(0.6, 0.6, 0.6),
      })
    }

    const stampedBytes = await pdfDoc.save()
    return new Uint8Array(stampedBytes)
  } catch {
    // If anything goes wrong, return the original PDF unmodified
    return pdfBytes
  }
}

// ── Detail Lines Builder ───────────────────────────────────────────────────────

function buildDetailLines(data: StampData): string[] {
  const lines: string[] = []

  const parts: string[] = []
  if (data.invoiceNumber) parts.push(`Invoice #${data.invoiceNumber}`)
  if (data.vendorName) parts.push(data.vendorName)
  if (parts.length > 0) lines.push(parts.join('  |  '))

  const parts2: string[] = []
  parts2.push(`Amount: $${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  if (data.costCodes) parts2.push(`Cost Codes: ${data.costCodes}`)
  if (data.poNumber) parts2.push(`PO: ${data.poNumber}`)
  lines.push(parts2.join('  |  '))

  const parts3: string[] = []
  if (data.approvedBy) parts3.push(`Approved by: ${data.approvedBy}`)
  if (data.approvedDate) parts3.push(`Date: ${data.approvedDate}`)
  if (data.drawNumber !== null && data.drawNumber !== undefined) {
    parts3.push(`Draw #${data.drawNumber}`)
  }
  if (parts3.length > 0) lines.push(parts3.join('  |  '))

  return lines
}

// ── Helper: Generate StampData from a raw invoice record ───────────────────────

/**
 * Build StampData from a raw invoice record (with joined fields).
 * Accepts Record<string, unknown> so it works regardless of whether
 * the caller has full type information.
 */
export function generateStampData(invoice: Record<string, unknown>): StampData {
  const status = (invoice.status as InvoiceStatus) ?? 'approved'

  let stampType: StampType = 'approval'
  if (status === 'in_draw') stampType = 'draw'
  else if (status === 'paid') stampType = 'payment'
  else if (status === 'denied') stampType = 'denial'

  const vendors = invoice.vendors as { name: string } | null | undefined
  const costCodes = invoice.cost_codes as { code: string; name: string } | null | undefined
  const purchaseOrders = invoice.purchase_orders as { po_number: string } | null | undefined

  const costCodeLabel = costCodes
    ? `${costCodes.code} - ${costCodes.name}`
    : (invoice.cost_code_label as string | null) ?? null

  return {
    status,
    invoiceNumber: (invoice.invoice_number as string | null) ?? null,
    vendorName: vendors?.name ?? (invoice.vendor_name as string | null) ?? null,
    amount: Number(invoice.amount ?? 0),
    costCodes: costCodeLabel,
    poNumber: purchaseOrders?.po_number ?? (invoice.po_number as string | null) ?? null,
    approvedBy: (invoice.approved_by_name as string | null) ?? (invoice.approved_by as string | null) ?? null,
    approvedDate: (invoice.approved_at as string | null) ?? null,
    drawNumber: invoice.draw_number != null ? Number(invoice.draw_number) : null,
    stampType,
  }
}
