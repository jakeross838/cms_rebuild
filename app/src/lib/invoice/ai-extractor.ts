import type { ExtractedInvoiceData, ConfidenceScores } from '@/types/ai-extraction'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface ExtractionInput {
  /** Raw file bytes (PDF or image) */
  fileBytes?: Uint8Array
  /** MIME type of the file */
  fileType?: string
  /** Fallback: pre-extracted text (used when fileBytes not provided) */
  text?: string
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

const SYSTEM_PROMPT = `You are an AI assistant specialized in extracting structured data from construction invoices.
You extract vendor information, invoice numbers, dates, amounts, line items, and construction-specific fields like cost codes, PO references, job references, retainage, and billing periods.

Return ONLY valid JSON matching the specified schema. Do not include markdown formatting or code blocks.`

function buildUserPrompt(filename: string, companyContext?: ExtractionInput['companyContext']): string {
  return `Extract structured invoice data from the attached document.

${companyContext?.vendorNames?.length ? `Known vendors: ${companyContext.vendorNames.join(', ')}` : ''}
${companyContext?.costCodes?.length ? `Known cost codes: ${companyContext.costCodes.join(', ')}` : ''}
${companyContext?.jobNames?.length ? `Known jobs: ${companyContext.jobNames.join(', ')}` : ''}

Document filename: ${filename}

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
}

export async function extractInvoiceData(input: ExtractionInput): Promise<ExtractionOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const userPrompt = buildUserPrompt(input.filename, input.companyContext)

  // Build message content — send file directly to Claude when possible
  const content: unknown[] = []

  if (input.fileBytes && input.fileType) {
    const base64Data = Buffer.from(input.fileBytes).toString('base64')

    if (input.fileType === 'application/pdf') {
      // Send PDF as document content block (Claude reads PDFs natively)
      content.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: base64Data,
        },
      })
    } else if (input.fileType.startsWith('image/')) {
      // Send image directly
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: input.fileType,
          data: base64Data,
        },
      })
    }
  }

  // Add the text prompt (and any fallback text)
  let promptText = userPrompt
  if (input.text && !input.fileBytes) {
    promptText = `Extract structured invoice data from the following document text.

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
  }

  content.push({ type: 'text', text: promptText })

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
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  const textContent = result.content?.[0]?.text || '{}'

  // Parse the JSON response
  let parsed: Record<string, unknown>
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] || textContent)
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
