/**
 * Plaude AI Integration
 *
 * BuildDesk's AI assistant powered by:
 * - Claude (Anthropic) for complex reasoning and document generation
 * - Gemini Pro for moderate complexity tasks
 * - Gemini Flash for simple queries and routing
 * - NotebookLM for document Q&A and audio briefings
 *
 * See: docs/architecture/AI-INTEGRATION-MASTER-PLAN.md
 */

// AI Backend types
export type AIBackend = 'claude' | 'gemini-pro' | 'gemini-flash' | 'notebooklm'

export type RequestComplexity = 'simple' | 'moderate' | 'complex'

export type PlaudeCapabilityType =
  | 'search'    // Search across documents and data
  | 'write'     // Generate/draft content
  | 'analyze'   // Analyze data, find patterns
  | 'generate'  // Generate reports, summaries

// Context provided to Plaude
export interface PlaudeContext {
  companyId: string
  userId: string
  userRole: string
  currentPage: string
  currentJobId?: string
  selectedRecord?: {
    type: string
    id: string
    data?: Record<string, unknown>
  }
  permissions?: string[]
}

// Request to Plaude
export interface PlaudeRequest {
  message: string
  context: PlaudeContext
  conversationHistory?: PlaudeMessage[]
  capabilities?: PlaudeCapabilityType[]
  preferredBackend?: AIBackend
}

// Response from Plaude
export interface PlaudeResponse {
  message: string
  backend: AIBackend
  actions?: PlaudeAction[]
  sources?: PlaudeSource[]
  suggestions?: string[]
  metadata?: {
    processingTime: number
    tokensUsed: number
    cost: number
  }
}

// Message in conversation
export interface PlaudeMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: PlaudeSource[]
  actions?: PlaudeAction[]
}

// Source citation
export interface PlaudeSource {
  title: string
  type: string
  excerpt: string
  date: string
  url?: string
  recordId?: string
}

// Actionable item from AI response
export interface PlaudeAction {
  label: string
  type: 'navigate' | 'create' | 'update' | 'generate' | 'notify'
  payload?: Record<string, unknown>
  execute?: () => void | Promise<void>
}

// Page-specific capability
export interface PlaudePageCapability {
  name: string
  description: string
  defaultPrompt?: string
  requiredPermissions?: string[]
}

// Request classification result
export interface RequestClassification {
  complexity: RequestComplexity
  capabilities: PlaudeCapabilityType[]
  needsDocumentSearch: boolean
  suggestedBackend: AIBackend
  confidence: number
}

/**
 * Classify a request to determine routing
 */
export function classifyRequest(message: string): RequestClassification {
  const lowerMessage = message.toLowerCase()

  // Document search indicators
  const needsDocumentSearch =
    lowerMessage.includes('find') ||
    lowerMessage.includes('search') ||
    lowerMessage.includes('what did') ||
    lowerMessage.includes('where is') ||
    lowerMessage.includes('show me') ||
    lowerMessage.includes('contract says')

  // Complexity indicators
  const complexIndicators = [
    'analyze', 'compare', 'evaluate', 'recommend', 'strategy',
    'optimize', 'forecast', 'predict', 'why', 'how should',
    'trade-off', 'pros and cons', 'risk assessment'
  ]

  const moderateIndicators = [
    'summarize', 'list', 'calculate', 'draft', 'generate',
    'create', 'format', 'convert'
  ]

  const _simpleIndicators = [
    'what is', 'when', 'who', 'status', 'yes or no',
    'how many', 'how much', 'current'
  ]

  // Determine complexity
  let complexity: RequestComplexity = 'simple'
  if (complexIndicators.some(i => lowerMessage.includes(i))) {
    complexity = 'complex'
  } else if (moderateIndicators.some(i => lowerMessage.includes(i))) {
    complexity = 'moderate'
  }

  // Determine capabilities needed
  const capabilities: PlaudeCapabilityType[] = []
  if (needsDocumentSearch) capabilities.push('search')
  if (lowerMessage.includes('draft') || lowerMessage.includes('write') || lowerMessage.includes('generate')) {
    capabilities.push('write')
  }
  if (lowerMessage.includes('analyze') || lowerMessage.includes('compare') || lowerMessage.includes('trend')) {
    capabilities.push('analyze')
  }
  if (lowerMessage.includes('report') || lowerMessage.includes('summary')) {
    capabilities.push('generate')
  }

  // Determine backend
  let suggestedBackend: AIBackend = 'gemini-flash'
  if (complexity === 'complex') {
    suggestedBackend = 'claude'
  } else if (needsDocumentSearch) {
    suggestedBackend = 'notebooklm'
  } else if (complexity === 'moderate') {
    suggestedBackend = 'gemini-pro'
  }

  return {
    complexity,
    capabilities,
    needsDocumentSearch,
    suggestedBackend,
    confidence: 0.85,
  }
}

/**
 * Build system prompt for AI backend
 */
export function buildSystemPrompt(
  context: PlaudeContext,
  capabilities: PlaudeCapabilityType[]
): string {
  let prompt = `You are Plaude, BuildDesk's AI assistant for construction project management.
You're helping a ${context.userRole} at their company.

Current context:
- Page: ${context.currentPage}
${context.currentJobId ? `- Job ID: ${context.currentJobId}` : ''}
${context.selectedRecord ? `- Viewing: ${context.selectedRecord.type} (${context.selectedRecord.id})` : ''}

Guidelines:
- Be concise and actionable
- Use construction industry terminology appropriately
- Reference specific data when available
- Format responses for easy scanning (use bold, bullets)
- Always cite sources when referencing documents
`

  if (capabilities.includes('analyze')) {
    prompt += `
You can analyze project data, identify risks, and provide recommendations.
Be specific with numbers and reference actual data from the project.
`
  }

  if (capabilities.includes('write')) {
    prompt += `
You can help draft documents, emails, change order descriptions, and RFI responses.
Match professional construction industry tone and include relevant project details.
`
  }

  if (capabilities.includes('search')) {
    prompt += `
You can search across project documents, communications, and history.
Always cite your sources when referencing specific information.
`
  }

  if (capabilities.includes('generate')) {
    prompt += `
You can generate meeting agendas, reports, and summaries.
Use actual project data and format professionally.
`
  }

  return prompt
}

/**
 * Format AI response for display
 */
export function formatPlaudeResponse(raw: string): string {
  // Convert markdown-style formatting
  const formatted = raw
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    // Bullet points
    .replace(/^- (.+)$/gm, '<li>$1</li>')

  return formatted
}

/**
 * Extract action items from AI response
 */
export function extractActions(response: string): PlaudeAction[] {
  const actions: PlaudeAction[] = []

  // Look for ACTION: markers
  const actionMatches = response.matchAll(/ACTION:\s*(.+)/gi)
  for (const match of actionMatches) {
    const actionText = match[1].trim()
    actions.push({
      label: actionText,
      type: 'create',
    })
  }

  // Look for common action patterns
  const patterns = [
    { regex: /create a task for (.+)/i, type: 'create' as const },
    { regex: /notify (.+) about/i, type: 'notify' as const },
    { regex: /generate (.+) report/i, type: 'generate' as const },
    { regex: /navigate to (.+)/i, type: 'navigate' as const },
  ]

  for (const pattern of patterns) {
    const match = response.match(pattern.regex)
    if (match) {
      actions.push({
        label: match[0],
        type: pattern.type,
      })
    }
  }

  return actions
}

/**
 * Cost estimation for AI requests
 */
export function estimateCost(
  backend: AIBackend,
  inputTokens: number,
  outputTokens: number
): number {
  // Approximate costs per 1000 tokens (in USD)
  const costs: Record<AIBackend, { input: number; output: number }> = {
    'claude': { input: 0.015, output: 0.075 },
    'gemini-pro': { input: 0.00125, output: 0.00375 },
    'gemini-flash': { input: 0.000075, output: 0.0003 },
    'notebooklm': { input: 0.001, output: 0.003 }, // Approximate
  }

  const rate = costs[backend]
  return (inputTokens / 1000 * rate.input) + (outputTokens / 1000 * rate.output)
}
