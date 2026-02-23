'use client'

import { useState, useRef, useEffect } from 'react'

import {
  Sparkles,
  Send,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lightbulb,
  Headphones,
  X,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  DollarSign,
  ExternalLink,
  Volume2,
  Zap,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  actions?: PlaudeAction[]
}

interface Source {
  title: string
  type: 'daily_log' | 'invoice' | 'change_order' | 'contract' | 'email' | 'photo'
  excerpt: string
  date: string
  url?: string
}

interface Insight {
  type: 'risk' | 'recommendation' | 'success' | 'info'
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
}

interface PlaudeCapability {
  name: string
  description: string
  action?: () => void
}

interface PlaudeAction {
  label: string
  type: 'navigate' | 'create' | 'update' | 'generate'
  execute: () => void
}

interface PlaudePanelProps {
  projectName?: string
  defaultExpanded?: boolean
  className?: string
  context?: PlaudeContext
}

interface PlaudeContext {
  page: 'job-overview' | 'budget' | 'schedule' | 'change-order' | 'rfi' | 'daily-log' |
        'estimate' | 'selections' | 'communications' | 'client-portal' | 'dashboard'
  jobId?: string
  recordType?: string
  recordId?: string
}

// Page-specific capabilities
const pageCapabilities: Record<string, PlaudeCapability[]> = {
  'job-overview': [
    { name: 'summarize', description: 'Summarize project status' },
    { name: 'identify-risks', description: 'Identify risks' },
    { name: 'generate-update', description: 'Draft client update' },
    { name: 'suggest-actions', description: 'Suggest next actions' },
  ],
  'budget': [
    { name: 'analyze-variance', description: 'Analyze variances' },
    { name: 'forecast', description: 'Forecast final cost' },
    { name: 'identify-overruns', description: 'Flag overruns' },
    { name: 'compare-jobs', description: 'Compare to similar jobs' },
  ],
  'schedule': [
    { name: 'analyze-delays', description: 'Analyze delays' },
    { name: 'suggest-recovery', description: 'Suggest recovery plan' },
    { name: 'predict-completion', description: 'Predict completion' },
    { name: 'optimize', description: 'Optimize sequence' },
  ],
  'change-order': [
    { name: 'draft-description', description: 'Draft CO description' },
    { name: 'calculate-impact', description: 'Calculate impact' },
    { name: 'find-precedents', description: 'Find similar COs' },
    { name: 'justify-cost', description: 'Justify pricing' },
  ],
  'rfi': [
    { name: 'search-specs', description: 'Search specs' },
    { name: 'draft-response', description: 'Draft response' },
    { name: 'find-precedents', description: 'Find similar RFIs' },
  ],
  'daily-log': [
    { name: 'extract-issues', description: 'Extract issues' },
    { name: 'summarize-week', description: 'Summarize week' },
    { name: 'identify-patterns', description: 'Identify patterns' },
  ],
  'estimate': [
    { name: 'validate-pricing', description: 'Validate pricing' },
    { name: 'suggest-adjustments', description: 'Suggest adjustments' },
    { name: 'compare-jobs', description: 'Compare to history' },
    { name: 'identify-missing', description: 'Find missing items' },
  ],
  'client-portal': [
    { name: 'answer-question', description: 'Answer questions' },
    { name: 'explain-budget', description: 'Explain budget' },
    { name: 'timeline-status', description: 'Timeline status' },
    { name: 'next-steps', description: 'What\'s next?' },
  ],
  'dashboard': [
    { name: 'portfolio-summary', description: 'Portfolio summary' },
    { name: 'at-risk-projects', description: 'At-risk projects' },
    { name: 'team-workload', description: 'Team workload' },
    { name: 'cash-flow', description: 'Cash flow forecast' },
  ],
}

// Legacy prop support
type AIAssistantPanelProps = PlaudePanelProps

// Mock data for the panel
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `Good morning! Here's your quick update for Smith Residence:

**Status:** On track, Health Score 72/100
**Budget:** $2,847 under budget (97.2%)
**Schedule:** +5 days vs baseline (weather delays)

3 items need attention today.`,
    timestamp: new Date(Date.now() - 300000),
    sources: [
      {
        title: 'Daily Log #47',
        type: 'daily_log',
        excerpt: 'Framing crew completed 2nd floor',
        date: 'Today',
      },
    ],
  },
]

const mockInsights: Insight[] = [
  {
    type: 'risk',
    title: 'Weather Alert',
    description: 'Rain Thu-Fri may delay roofing',
    severity: 'medium',
  },
  {
    type: 'recommendation',
    title: 'Invoice Pending',
    description: 'Draw #4 awaiting client approval',
    severity: 'low',
  },
  {
    type: 'success',
    title: 'Inspection Passed',
    description: 'Framing inspection completed',
  },
]

const suggestedQuestions = [
  "What's the budget status?",
  "Any risks or concerns?",
  "What's scheduled this week?",
  "Summarize recent activity",
]

// Components
function InsightBadge({ insight }: { insight: Insight }) {
  const config = {
    risk: { icon: AlertTriangle, bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/20' },
    recommendation: { icon: Lightbulb, bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200' },
    success: { icon: CheckCircle, bg: 'bg-success-bg', text: 'text-success', border: 'border-success/20' },
    info: { icon: Sparkles, bg: 'bg-info-bg', text: 'text-info', border: 'border-info/20' },
  }
  const { icon: Icon, bg, text, border } = config[insight.type]

  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg border ${bg} ${border}`}>
      <Icon className={`h-3.5 w-3.5 ${text} mt-0.5 flex-shrink-0`} />
      <div className="min-w-0">
        <p className={`text-xs font-medium ${text} truncate`}>{insight.title}</p>
        <p className="text-[10px] text-warm-500 truncate">{insight.description}</p>
      </div>
    </div>
  )
}

function SourceCard({ source }: { source: Source }) {
  const typeIcons = {
    daily_log: FileText,
    invoice: DollarSign,
    change_order: FileText,
    contract: FileText,
    email: MessageSquare,
    photo: FileText,
  }
  const Icon = typeIcons[source.type]

  return (
    <div className="flex items-center gap-2 p-1.5 bg-warm-50 rounded border border-warm-100 text-xs">
      <Icon className="h-3 w-3 text-warm-400" />
      <span className="text-warm-600 truncate">{source.title}</span>
    </div>
  )
}

function AudioBriefingMini() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false)
            return 0
          }
          return p + 1
        })
      }, 300)
      return () => clearInterval(interval)
    }
    return undefined
  }, [isPlaying])

  return (
    <div className="bg-stone-700 rounded-lg p-3 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Headphones className="h-4 w-4 text-stone-300" />
        <span className="text-xs font-medium">Morning Briefing</span>
        <span className="text-[10px] text-stone-400 ml-auto">5:12</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Main Component - Plaude AI Assistant
export function AIAssistantPanel({
  projectName = 'This Project',
  defaultExpanded = true,
  className,
  context = { page: 'job-overview' },
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'audio'>('chat')
  const [showSources, setShowSources] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get capabilities for current page
  const capabilities = pageCapabilities[context.page] || pageCapabilities['job-overview']

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate Plaude AI response (routes to Claude or Gemini based on complexity)
    setTimeout(() => {
      const inputLower = input.toLowerCase()

      // Context-aware responses based on input
      let response = ''
      let sources: Source[] = []
      let actions: PlaudeAction[] = []

      if (inputLower.includes('risk') || inputLower.includes('concern')) {
        response = `I've analyzed ${projectName} for risks:\n\n**Critical:**\n- Weather forecast shows rain Thu-Fri, may delay roofing by 2-3 days\n\n**Moderate:**\n- Plumbing rough-in inspection not yet scheduled\n- Cabinet lead time is 6 weeks, order deadline approaching\n\n**Low:**\n- Minor budget variance in framing (+$847)\n\nWould you like me to draft a mitigation plan?`
        sources = [
          { title: 'Weather API', type: 'daily_log', excerpt: '70% rain probability', date: 'Today' },
          { title: 'Inspection Log', type: 'daily_log', excerpt: 'Pending inspections', date: 'Yesterday' },
        ]
        actions = [
          { label: 'Create mitigation tasks', type: 'create', execute: () => console.warn('Creating tasks') },
          { label: 'Notify team', type: 'create', execute: () => console.warn('Notifying') },
        ]
      } else if (inputLower.includes('budget') || inputLower.includes('cost')) {
        response = `**Budget Status for ${projectName}:**\n\nContract: $485,000\nSpent to Date: $312,400 (64.4%)\nRemaining: $172,600\n\n**Variances:**\n- Framing: +$847 (weather delays)\n- Electrical: -$1,200 (favorable)\n- Plumbing: On track\n\nProjected Final: $482,153 (**$2,847 under budget**)`
        sources = [
          { title: 'Budget Report', type: 'invoice', excerpt: 'Current financials', date: 'Today' },
        ]
      } else if (inputLower.includes('schedule') || inputLower.includes('timeline')) {
        response = `**Schedule Status:**\n\nBaseline Completion: March 15\nCurrent Projection: March 20 (+5 days)\n\n**Critical Path:**\n1. Roofing (weather dependent)\n2. HVAC rough-in\n3. Drywall\n\n**This Week:**\n- Mon-Wed: Complete framing punch list\n- Thu-Fri: Weather contingency\n- Sat: Roofing start (if weather permits)`
        actions = [
          { label: 'View Gantt chart', type: 'navigate', execute: () => console.warn('Navigate to schedule') },
        ]
      } else {
        response = `Based on the project data for ${projectName}:\n\n**Summary:** Project is 64% complete, currently 5 days behind baseline due to weather delays. Budget is tracking well at $2,847 under projection.\n\n**Key Items:**\n- Framing 100% complete, inspection passed\n- Roofing scheduled pending weather\n- Draw #4 awaiting client approval\n\nWhat specific aspect would you like me to dive into?`
        sources = [
          { title: 'Daily Log #47', type: 'daily_log', excerpt: 'Framing crew completed 2nd floor', date: 'Today' },
          { title: 'Draw Request #4', type: 'invoice', excerpt: '$48,500 pending', date: 'Feb 15' },
        ]
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sources,
        actions,
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1200)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors shadow-lg',
          className
        )}
      >
        <Sparkles className="h-5 w-5" />
        <span className="font-medium">Plaude</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">3 insights</span>
      </button>
    )
  }

  return (
    <div className={cn('bg-warm-0 rounded-xl border border-warm-200 shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-200 bg-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white text-sm flex items-center gap-1.5">
              Plaude
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wide">AI</span>
            </h3>
            <p className="text-[10px] text-white/60">Claude + Gemini powered</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="/skeleton/ai-assistant"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Open full view"
          >
            <ExternalLink className="h-4 w-4 text-white/60" />
          </a>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-200">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'insights', label: 'Insights', icon: Lightbulb, badge: 3 },
          { id: 'audio', label: 'Audio', icon: Volume2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'text-stone-700 border-b-2 border-stone-600 bg-warm-50'
                : 'text-warm-500 hover:text-warm-700'
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {tab.badge ? <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 rounded-full">
                {tab.badge}
              </span> : null}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-80">
          {/* Capabilities - shown when no messages */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-b border-warm-100 bg-warm-50">
              <p className="text-[10px] text-warm-500 mb-1.5">On this page, I can:</p>
              <div className="flex flex-wrap gap-1">
                {capabilities.map((cap) => (
                  <button
                    key={cap.name}
                    onClick={() => setInput(cap.description)}
                    className="px-2 py-1 bg-warm-0 border border-warm-200 rounded-full text-[10px] text-warm-600 hover:border-stone-300 hover:bg-stone-50 transition-colors flex items-center gap-1"
                  >
                    <Zap className="h-2.5 w-2.5" />
                    {cap.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {message.role === 'user' ? (
                  <div className="max-w-[85%] bg-stone-700 text-white rounded-xl rounded-tr-sm px-3 py-2">
                    <p className="text-xs">{message.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[90%]">
                    <div className="bg-warm-50 rounded-xl rounded-tl-sm px-3 py-2 border border-warm-100">
                      <div className="text-xs text-warm-700 whitespace-pre-line">
                        {message.content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.includes(':**')) {
                            const parts = line.split(':**')
                            return (
                              <p key={i} className="mt-1 first:mt-0">
                                <span className="font-semibold text-warm-800">
                                  {parts[0].replace(/\*\*/g, '')}:
                                </span>
                                {parts[1]?.replace(/\*\*/g, '')}
                              </p>
                            )
                          }
                          if (line.trim() === '') return <br key={i} />
                          return (
                            <p key={i} className="mt-1 first:mt-0">
                              {line.replace(/\*\*/g, '')}
                            </p>
                          )
                        })}
                      </div>
                    </div>
                    {message.sources && message.sources.length > 0 ? <div className="mt-1">
                        <button
                          onClick={() =>
                            setShowSources(showSources === message.id ? null : message.id)
                          }
                          className="flex items-center gap-1 text-[10px] text-warm-500 hover:text-warm-700"
                        >
                          <FileText className="h-2.5 w-2.5" />
                          {message.sources.length} sources
                          {showSources === message.id ? (
                            <ChevronUp className="h-2.5 w-2.5" />
                          ) : (
                            <ChevronDown className="h-2.5 w-2.5" />
                          )}
                        </button>
                        {showSources === message.id && (
                          <div className="mt-1 space-y-1">
                            {message.sources.map((source, i) => (
                              <SourceCard key={i} source={source} />
                            ))}
                          </div>
                        )}
                      </div> : null}

                    {/* Action buttons from AI response */}
                    {message.actions && message.actions.length > 0 ? <div className="mt-2 pt-2 border-t border-warm-200 space-y-1">
                        {message.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={action.execute}
                            className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 bg-stone-100 text-stone-700 rounded text-[10px] hover:bg-stone-200 transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            {action.label}
                          </button>
                        ))}
                      </div> : null}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading ? <div className="flex items-center gap-2 text-warm-500">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-warm-500">Plaude is thinking...</span>
              </div> : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="px-3 py-2 border-t border-warm-100 bg-warm-50">
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="px-2 py-1 bg-warm-0 border border-warm-200 rounded-full text-[10px] text-warm-600 hover:border-stone-300 hover:bg-stone-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-warm-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this project..."
                className="flex-1 px-3 py-2 text-xs border border-warm-200 rounded-lg bg-warm-0 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-1 focus:ring-stone-300 focus:border-stone-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="p-3 space-y-2 h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-warm-700">AI-Generated Insights</span>
            <span className="text-[10px] text-warm-400">Updated 2h ago</span>
          </div>
          {mockInsights.map((insight, i) => (
            <InsightBadge key={i} insight={insight} />
          ))}

          <div className="pt-3 mt-3 border-t border-warm-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-warm-700">Health Score</span>
              <span className="text-lg font-bold text-stone-700">
                72<span className="text-xs text-warm-400">/100</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { label: 'Budget', score: 85, color: 'bg-success' },
                { label: 'Schedule', score: 65, color: 'bg-warning' },
                { label: 'Quality', score: 78, color: 'bg-success' },
                { label: 'Safety', score: 82, color: 'bg-success' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs font-medium text-warm-700">{item.score}</div>
                  <div className="text-[10px] text-warm-500">{item.label}</div>
                  <div className="h-1 bg-warm-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-2">
            <TrendingUp className="h-3 w-3" />
            +3 from last week
          </div>
        </div>
      )}

      {/* Audio Tab */}
      {activeTab === 'audio' && (
        <div className="p-3 space-y-3 h-80 overflow-y-auto">
          <AudioBriefingMini />

          <div>
            <span className="text-xs font-medium text-warm-700">Quick Briefings</span>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['Project Status', 'Budget Review', 'Schedule Update', 'Risk Summary'].map(
                (type) => (
                  <button
                    key={type}
                    className="px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-xs text-warm-700 hover:bg-stone-50 hover:border-stone-300 transition-colors text-left"
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-warm-200">
            <span className="text-xs font-medium text-warm-700">Recent Briefings</span>
            <div className="space-y-2 mt-2">
              {[
                { title: 'Morning Briefing', time: 'Today, 6:45 AM' },
                { title: 'Weekly Summary', time: 'Feb 16, 2026' },
              ].map((briefing, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-warm-50 rounded-lg border border-warm-100"
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="h-3.5 w-3.5 text-warm-400" />
                    <div>
                      <p className="text-xs font-medium text-warm-700">{briefing.title}</p>
                      <p className="text-[10px] text-warm-400">{briefing.time}</p>
                    </div>
                  </div>
                  <Play className="h-3.5 w-3.5 text-warm-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Export with both names for compatibility
export const PlaudePanel = AIAssistantPanel
export default AIAssistantPanel
