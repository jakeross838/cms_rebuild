import type { ExtractedInvoiceData, ConfidenceScores } from '@/types/ai-extraction'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface ExtractionInput {
  text: string
  filename: string
  companyContext?: {
    vendorNames?: string[]
    costCodes?: string[]
    jobNames?: string[]
  }
}

interface ExtractionOutput {
  data: ExtractedInvoiceData
  confidence: ConfidenceScores
}

export async function extractInvoiceData(input: ExtractionInput): Promise<ExtractionOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const systemPrompt = `You are an AI assistant specialized in extracting structured data from construction invoices.
You extract vendor information, invoice numbers, dates, amounts, line items, and construction-specific fields like cost codes, PO references, job references, retainage, and billing periods.

Return ONLY valid JSON matching the specified schema. Do not include markdown formatting or code blocks.`

  const userPrompt = `Extract structured invoice data from the following document text.

${input.companyContext?.vendorNames?.length ? `Known vendors: ${input.companyContext.vendorNames.join(', ')}` : ''}
${input.companyContext?.costCodes?.length ? `Known cost codes: ${input.companyContext.costCodes.join(', ')}` : ''}
${input.companyContext?.jobNames?.length ? `Known jobs: ${input.companyContext.jobNames.join(', ')}` : ''}

Document filename: ${input.filename}

Document text:
---
${input.text}
---

Return a JSON object with these fields:
{
  "vendor_name": string or null,
  "vendor_address": string or null,
  "invoice_number": string or null,
  "invoice_date": "YYYY-MM-DD" or null,
  "due_date": "YYYY-MM-DD" or null,
  "amount": number or null (total amount),
  "tax_amount": number or null,
  "subtotal": number or null,
  "description": string or null,
  "po_number": string or null,
  "payment_terms": string or null,
  "line_items": [{ "description": string, "quantity": number|null, "unit": string|null, "unit_price": number|null, "amount": number }],
  "job_reference": string or null,
  "cost_code_reference": string or null,
  "retainage_percent": number or null,
  "billing_period": string or null,
  "percent_complete": number or null,
  "confidence": {
    "overall": 0-1,
    "vendor_name": 0-1,
    "invoice_number": 0-1,
    "amount": 0-1,
    "date": 0-1,
    "line_items": 0-1,
    "cost_codes": 0-1
  }
}`

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const content = result.content?.[0]?.text || '{}'

  // Parse the JSON response
  let parsed: Record<string, unknown>
  try {
    // Try to extract JSON from the response, handling potential markdown wrapping
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] || content)
  } catch {
    throw new Error('Failed to parse AI extraction response as JSON')
  }

  const confidence = (parsed.confidence || {}) as ConfidenceScores
  delete (parsed as Record<string, unknown>).confidence

  const data: ExtractedInvoiceData = {
    vendor_name: (parsed.vendor_name as string) || null,
    vendor_address: (parsed.vendor_address as string) || null,
    invoice_number: (parsed.invoice_number as string) || null,
    invoice_date: (parsed.invoice_date as string) || null,
    due_date: (parsed.due_date as string) || null,
    amount: typeof parsed.amount === 'number' ? parsed.amount : null,
    tax_amount: typeof parsed.tax_amount === 'number' ? parsed.tax_amount : null,
    subtotal: typeof parsed.subtotal === 'number' ? parsed.subtotal : null,
    description: (parsed.description as string) || null,
    po_number: (parsed.po_number as string) || null,
    payment_terms: (parsed.payment_terms as string) || null,
    line_items: Array.isArray(parsed.line_items) ? parsed.line_items as ExtractedInvoiceData['line_items'] : [],
    job_reference: (parsed.job_reference as string) || null,
    cost_code_reference: (parsed.cost_code_reference as string) || null,
    retainage_percent: typeof parsed.retainage_percent === 'number' ? parsed.retainage_percent : null,
    billing_period: (parsed.billing_period as string) || null,
    percent_complete: typeof parsed.percent_complete === 'number' ? parsed.percent_complete : null,
  }

  return {
    data,
    confidence: {
      overall: confidence.overall ?? 0.5,
      vendor_name: confidence.vendor_name ?? 0.5,
      invoice_number: confidence.invoice_number ?? 0.5,
      amount: confidence.amount ?? 0.5,
      date: confidence.date ?? 0.5,
      line_items: confidence.line_items ?? 0.5,
      cost_codes: confidence.cost_codes ?? 0.5,
    },
  }
}

/**
 * Simple text extraction from PDF using basic parsing.
 * For production, you'd use a proper OCR service.
 * This extracts readable text embedded in PDFs.
 */
export async function extractTextFromPdf(pdfBytes: Uint8Array): Promise<string> {
  // Use pdf-lib to read text content
  const { PDFDocument } = await import('pdf-lib')
  const doc = await PDFDocument.load(pdfBytes)
  const pages = doc.getPages()

  // pdf-lib doesn't have built-in text extraction, so we'll use a basic approach
  // In production, you'd use a service like Google Document AI or AWS Textract
  // For now, we'll return a placeholder that indicates OCR is needed
  const pageCount = pages.length

  // Try to extract text from the raw PDF content
  const rawContent = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes)

  // Extract text between BT/ET markers (basic PDF text extraction)
  const textMatches = rawContent.match(/\(([^)]+)\)/g) || []
  const extractedText = textMatches
    .map(m => m.slice(1, -1))
    .filter(t => t.length > 1 && /[a-zA-Z0-9]/.test(t))
    .join(' ')

  if (extractedText.length > 50) {
    return extractedText
  }

  return `[PDF with ${pageCount} page(s) - OCR required for text extraction. Upload to a document AI service for best results.]`
}
