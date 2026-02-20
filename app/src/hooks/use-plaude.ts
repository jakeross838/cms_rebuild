'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Types
export interface PlaudeMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: PlaudeSource[]
  actions?: PlaudeAction[]
}

export interface PlaudeSource {
  title: string
  type: string
  excerpt: string
  date: string
  url?: string
}

export interface PlaudeAction {
  label: string
  type: 'navigate' | 'create' | 'update' | 'generate'
  execute: () => void
}

export interface PlaudeCapability {
  name: string
  description: string
}

export interface PlaudeContext {
  page: string
  companyId?: string
  userId?: string
  jobId?: string
  recordType?: string
  recordId?: string
}

interface UsePlaudeOptions {
  context?: Partial<PlaudeContext>
  autoDetectPage?: boolean
}

// Page capabilities mapping
const pageCapabilities: Record<string, PlaudeCapability[]> = {
  'job-overview': [
    { name: 'summarize', description: 'Summarize project status' },
    { name: 'identify-risks', description: 'Identify risks and concerns' },
    { name: 'generate-update', description: 'Generate client update' },
    { name: 'suggest-actions', description: 'Suggest next actions' },
  ],
  'budget': [
    { name: 'analyze-variance', description: 'Analyze budget variances' },
    { name: 'forecast', description: 'Forecast final cost' },
    { name: 'identify-overruns', description: 'Identify potential overruns' },
    { name: 'compare-jobs', description: 'Compare to similar jobs' },
  ],
  'schedule': [
    { name: 'analyze-delays', description: 'Analyze delay causes' },
    { name: 'suggest-recovery', description: 'Suggest recovery plan' },
    { name: 'predict-completion', description: 'Predict completion date' },
    { name: 'optimize', description: 'Suggest optimizations' },
  ],
  'change-order': [
    { name: 'draft-description', description: 'Draft CO description' },
    { name: 'calculate-impact', description: 'Calculate schedule impact' },
    { name: 'find-precedents', description: 'Find similar past COs' },
    { name: 'justify-cost', description: 'Help justify pricing' },
  ],
  'rfi': [
    { name: 'search-specs', description: 'Search specs for answer' },
    { name: 'draft-response', description: 'Draft response' },
    { name: 'find-precedents', description: 'Find similar RFIs' },
  ],
  'daily-log': [
    { name: 'extract-issues', description: 'Extract issues from log' },
    { name: 'summarize-week', description: 'Summarize week activity' },
    { name: 'identify-patterns', description: 'Identify patterns' },
  ],
  'estimate': [
    { name: 'validate-pricing', description: 'Validate pricing vs history' },
    { name: 'suggest-adjustments', description: 'Suggest adjustments' },
    { name: 'compare-jobs', description: 'Compare to similar projects' },
    { name: 'identify-missing', description: 'Identify missing items' },
  ],
  'selections': [
    { name: 'suggest-options', description: 'Suggest selections' },
    { name: 'compare-pricing', description: 'Compare pricing' },
    { name: 'track-deadlines', description: 'Track selection deadlines' },
  ],
  'communications': [
    { name: 'summarize-thread', description: 'Summarize conversation' },
    { name: 'draft-response', description: 'Draft response' },
    { name: 'extract-actions', description: 'Extract action items' },
  ],
  'client-portal': [
    { name: 'answer-question', description: 'Answer my question' },
    { name: 'explain-budget', description: 'Explain budget status' },
    { name: 'timeline-status', description: 'What\'s the timeline?' },
    { name: 'next-steps', description: 'What\'s next?' },
  ],
  'dashboard': [
    { name: 'portfolio-summary', description: 'Portfolio summary' },
    { name: 'at-risk-projects', description: 'At-risk projects' },
    { name: 'team-workload', description: 'Team workload analysis' },
    { name: 'cash-flow', description: 'Cash flow forecast' },
  ],
}

// Route to page mapping
function detectPageFromPath(pathname: string): string {
  if (pathname.includes('/jobs/') && pathname.includes('/budget')) return 'budget'
  if (pathname.includes('/jobs/') && pathname.includes('/schedule')) return 'schedule'
  if (pathname.includes('/jobs/') && pathname.includes('/change-orders')) return 'change-order'
  if (pathname.includes('/jobs/') && pathname.includes('/rfi')) return 'rfi'
  if (pathname.includes('/jobs/') && pathname.includes('/daily-log')) return 'daily-log'
  if (pathname.includes('/jobs/') && pathname.includes('/selections')) return 'selections'
  if (pathname.includes('/jobs/')) return 'job-overview'
  if (pathname.includes('/estimates')) return 'estimate'
  if (pathname.includes('/communications')) return 'communications'
  if (pathname.includes('/portal')) return 'client-portal'
  if (pathname.includes('/dashboard') || pathname === '/') return 'dashboard'
  return 'dashboard'
}

// Main hook
export function usePlaude(options: UsePlaudeOptions = {}) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<PlaudeMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine current context
  const currentPage = options.autoDetectPage !== false
    ? detectPageFromPath(pathname || '')
    : options.context?.page || 'dashboard'

  const context: PlaudeContext = {
    page: currentPage,
    ...options.context,
  }

  // Get capabilities for current page
  const capabilities = pageCapabilities[currentPage] || pageCapabilities['dashboard']

  // Generate suggested follow-up questions based on context
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Update suggestions based on page
    const pageSuggestions: Record<string, string[]> = {
      'job-overview': ['What\'s the project status?', 'Any risks?', 'Budget summary'],
      'budget': ['Show variances', 'Forecast final cost', 'Compare to similar jobs'],
      'schedule': ['Critical path status', 'Delay analysis', 'Recovery options'],
      'change-order': ['Draft description', 'Find similar COs', 'Calculate impact'],
      'dashboard': ['Portfolio overview', 'At-risk projects', 'Team capacity'],
    }
    setSuggestions(pageSuggestions[currentPage] || ['How can I help?'])
  }, [currentPage])

  // Send message to Plaude
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: PlaudeMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      // In production, this would call the Plaude API
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulated response based on content
      const aiMessage: PlaudeMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(content, context),
        timestamp: new Date(),
        sources: [
          { title: 'Project Data', type: 'database', excerpt: 'Latest records', date: 'Today' }
        ],
      }

      setMessages(prev => [...prev, aiMessage])

      // Update suggestions based on conversation
      updateSuggestionsAfterResponse(content)

    } catch (err) {
      setError('Failed to get response from Plaude')
    } finally {
      setIsLoading(false)
    }
  }, [context])

  // Clear conversation
  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  // Quick action - execute a capability
  const executeCapability = useCallback((capabilityName: string) => {
    const capability = capabilities.find(c => c.name === capabilityName)
    if (capability) {
      sendMessage(capability.description)
    }
  }, [capabilities, sendMessage])

  // Helper to update suggestions
  function updateSuggestionsAfterResponse(lastQuestion: string) {
    const lowerQ = lastQuestion.toLowerCase()
    if (lowerQ.includes('risk') || lowerQ.includes('concern')) {
      setSuggestions(['Create mitigation plan', 'Notify team', 'Show details'])
    } else if (lowerQ.includes('budget') || lowerQ.includes('cost')) {
      setSuggestions(['Show breakdown', 'Compare to estimate', 'Forecast to completion'])
    } else if (lowerQ.includes('schedule')) {
      setSuggestions(['Show critical path', 'Recovery options', 'Notify stakeholders'])
    }
  }

  return {
    messages,
    isLoading,
    error,
    capabilities,
    suggestions,
    context,
    sendMessage,
    clearMessages,
    executeCapability,
  }
}

// Helper to generate contextual responses (placeholder for API)
function generateResponse(question: string, context: PlaudeContext): string {
  const q = question.toLowerCase()

  if (q.includes('risk') || q.includes('concern')) {
    return `Based on the current ${context.page} data, I've identified the following risks:\n\n**High Priority:**\n- Weather delays may impact exterior work\n- Pending inspection scheduling\n\n**Medium Priority:**\n- Material lead times for custom items\n- Subcontractor availability next week\n\nWould you like me to create tasks to address these?`
  }

  if (q.includes('budget') || q.includes('cost')) {
    return `**Budget Summary:**\n\nTotal Budget: $485,000\nSpent to Date: $312,400 (64.4%)\nRemaining: $172,600\n\nProjected Final: $482,153 ($2,847 under budget)\n\nAll categories are tracking within tolerance except Framing (+$847 due to weather delays).`
  }

  if (q.includes('schedule') || q.includes('timeline')) {
    return `**Schedule Status:**\n\nOriginal Completion: March 15, 2026\nCurrent Projection: March 20, 2026\nVariance: +5 days\n\n**Critical Path:**\n1. Roofing (weather dependent)\n2. HVAC rough-in\n3. Drywall\n\nThe 5-day delay is recoverable with weekend work during drywall phase.`
  }

  if (q.includes('status') || q.includes('summary')) {
    return `**Project Overview:**\n\n- Progress: 64% complete\n- Health Score: 72/100\n- Budget: On track ($2.8K under)\n- Schedule: 5 days behind (weather)\n\n**This Week:**\n- Complete framing punch list\n- Roofing start (weather permitting)\n- Draw #4 awaiting approval\n\nOverall, the project is in good shape. Main concern is weather impact on roofing.`
  }

  return `I can help you with that! Based on the current context (${context.page}), I have access to all relevant project data.\n\nWhat specific information would you like me to analyze or help with?`
}

export default usePlaude
