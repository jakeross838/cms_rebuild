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
  Mic,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
}

interface Source {
  title: string
  type: 'daily_log' | 'invoice' | 'change_order' | 'contract' | 'email' | 'photo'
  excerpt: string
  date: string
}

interface Insight {
  type: 'risk' | 'recommendation' | 'success' | 'info'
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
}

interface AIAssistantPanelProps {
  projectName?: string
  defaultExpanded?: boolean
  className?: string
}

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

// Main Component
export function AIAssistantPanel({
  projectName = 'This Project',
  defaultExpanded = true,
  className,
}: AIAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState('')
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'audio'>('chat')
  const [showSources, setShowSources] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on the project data for ${projectName}:

**Answer:** This is a simulated response. In production, this would query NotebookLM with full project context including daily logs, invoices, and all documentation.

Would you like more details?`,
        timestamp: new Date(),
        sources: [
          {
            title: 'Project Documents',
            type: 'daily_log',
            excerpt: 'Relevant data...',
            date: 'Today',
          },
        ],
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
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
        <span className="font-medium">AI Assistant</span>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">3 insights</span>
      </button>
    )
  }

  return (
    <div className={cn('bg-warm-0 rounded-xl border border-warm-200 shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-stone-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-stone-600" />
          </div>
          <div>
            <h3 className="font-medium text-warm-800 text-sm">AI Assistant</h3>
            <p className="text-[10px] text-warm-500">Powered by NotebookLM</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="/skeleton/ai-assistant"
            className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors"
            title="Open full view"
          >
            <ExternalLink className="h-4 w-4 text-warm-400" />
          </a>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-warm-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-warm-400" />
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
            {tab.badge && (
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-80">
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
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-1">
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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

export default AIAssistantPanel
