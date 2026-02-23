'use client'

import { useState, useRef, useEffect } from 'react'

import {
  Sparkles,
  Send,
  Volume2,
  Pause,
  Play,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Users,
  Mic,
  MicOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  MessageSquare,
  Headphones,
  Maximize2,
  Minimize2,
} from 'lucide-react'

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  isStreaming?: boolean
}

interface Source {
  title: string
  type: 'daily_log' | 'invoice' | 'change_order' | 'contract' | 'email' | 'photo'
  excerpt: string
  date: string
  link: string
}

interface Insight {
  type: 'risk' | 'recommendation' | 'success' | 'info'
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
}

// Mock data
const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'What\'s the current status of the budget?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'assistant',
    content: `The Johnson Kitchen Remodel is currently **$2,847 under budget** (97.2% of allocated).

**Budget Breakdown:**
- **Original Contract:** $142,500
- **Approved Changes:** +$8,200
- **Current Budget:** $150,700
- **Spent to Date:** $78,420 (52%)
- **Committed (POs):** $45,890
- **Remaining:** $26,390

**Key Observations:**
- Electrical is running 8% under estimate
- Plumbing came in exactly on budget
- Cabinet allowance has $1,200 remaining
- No concerning variances detected

The project is financially healthy with good contingency remaining.`,
    timestamp: new Date(Date.now() - 60000),
    sources: [
      {
        title: 'Budget Report - Feb 2026',
        type: 'invoice',
        excerpt: 'Current spent: $78,420 across 23 invoices',
        date: 'Feb 18, 2026',
        link: '#'
      },
      {
        title: 'Change Order #3 - LVL Upgrade',
        type: 'change_order',
        excerpt: 'Approved $3,400 for structural upgrade',
        date: 'Feb 10, 2026',
        link: '#'
      }
    ]
  }
]

const suggestedQuestions = [
  { icon: DollarSign, text: "What's our budget status?", category: 'Financial' },
  { icon: Calendar, text: "What's scheduled for this week?", category: 'Schedule' },
  { icon: AlertTriangle, text: "Any risks or concerns?", category: 'Risk' },
  { icon: Users, text: "Who's working on site today?", category: 'Team' },
  { icon: TrendingUp, text: "How does this compare to similar projects?", category: 'Analysis' },
  { icon: FileText, text: "Summarize recent daily logs", category: 'Field' },
]

const mockInsights: Insight[] = [
  {
    type: 'risk',
    title: 'Weather Alert',
    description: 'Rain forecasted Thursday - may impact exterior work',
    severity: 'medium'
  },
  {
    type: 'recommendation',
    title: 'Invoice Pending',
    description: 'ABC Plumbing invoice ($4,200) waiting 3 days for approval',
    severity: 'low'
  },
  {
    type: 'success',
    title: 'Milestone Complete',
    description: 'Electrical rough-in passed inspection yesterday',
  }
]

// Components
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
    <div className="flex items-start gap-2 p-2 bg-warm-50 rounded-lg border border-warm-100 hover:border-warm-200 transition-colors cursor-pointer group">
      <div className="p-1.5 bg-stone-100 rounded">
        <Icon className="h-3 w-3 text-stone-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-warm-800 truncate">{source.title}</span>
          <ExternalLink className="h-3 w-3 text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-xs text-warm-500 truncate">{source.excerpt}</p>
        <span className="text-[10px] text-warm-400">{source.date}</span>
      </div>
    </div>
  )
}

function InsightBadge({ insight }: { insight: Insight }) {
  const config = {
    risk: { icon: AlertTriangle, bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/20' },
    recommendation: { icon: Lightbulb, bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-200' },
    success: { icon: CheckCircle, bg: 'bg-success-bg', text: 'text-success', border: 'border-success/20' },
    info: { icon: Sparkles, bg: 'bg-info-bg', text: 'text-info', border: 'border-info/20' },
  }
  const { icon: Icon, bg, text, border } = config[insight.type]

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${bg} ${border}`}>
      <Icon className={`h-4 w-4 ${text} mt-0.5 flex-shrink-0`} />
      <div>
        <p className={`text-sm font-medium ${text}`}>{insight.title}</p>
        <p className="text-xs text-warm-600 mt-0.5">{insight.description}</p>
      </div>
    </div>
  )
}

function AudioBriefingPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration] = useState(312) // 5:12

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false)
            return 0
          }
          return p + 0.5
        })
      }, 156) // ~5 min total
      return () => clearInterval(interval)
    }
    return undefined
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <div className="bg-gradient-to-r from-stone-700 to-stone-800 rounded-lg p-4 text-white">
      <div className="flex items-center gap-3 mb-3">
        <Headphones className="h-5 w-5 text-stone-300" />
        <div>
          <p className="text-sm font-medium">Morning Briefing</p>
          <p className="text-xs text-stone-400">Generated today at 6:45 AM</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-stone-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-stone-400">{formatTime(duration)}</span>
          </div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <RotateCcw className="h-4 w-4 text-stone-400" />
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const [showSources, setShowSources] = useState(false)

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-stone-700 text-white rounded-2xl rounded-tr-md px-4 py-2.5">
          <p className="text-sm">{message.content}</p>
          <span className="text-[10px] text-stone-400 mt-1 block">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-stone-100 rounded-lg mt-1">
            <Sparkles className="h-4 w-4 text-stone-600" />
          </div>
          <div className="flex-1">
            <div className="bg-warm-50 rounded-2xl rounded-tl-md px-4 py-3 border border-warm-100">
              <div className="text-sm text-warm-800 prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-semibold text-warm-900 mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>
                  }
                  if (line.startsWith('- **')) {
                    const parts = line.replace('- **', '').split(':**')
                    return (
                      <p key={i} className="text-warm-700 ml-2">
                        • <span className="font-medium">{parts[0]}:</span>{parts[1]}
                      </p>
                    )
                  }
                  if (line.startsWith('- ')) {
                    return <p key={i} className="text-warm-700 ml-2">• {line.substring(2)}</p>
                  }
                  if (line.trim() === '') return <br key={i} />
                  return <p key={i} className="text-warm-700">{line}</p>
                })}
              </div>

              {message.isStreaming ? <span className="inline-block w-2 h-4 bg-stone-400 animate-pulse ml-1" /> : null}
            </div>

            {message.sources && message.sources.length > 0 ? <div className="mt-2">
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="flex items-center gap-1 text-xs text-warm-500 hover:text-warm-700 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>{message.sources.length} sources</span>
                  {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {showSources ? <div className="mt-2 space-y-2">
                    {message.sources.map((source, i) => (
                      <SourceCard key={i} source={source} />
                    ))}
                  </div> : null}
              </div> : null}

            <span className="text-[10px] text-warm-400 mt-1 block">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function AIAssistantPreview() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'audio'>('chat')
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

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${input}". Let me analyze the project data...

Based on the current information:

**Summary:**
This is a simulated response demonstrating the AI assistant interface. In production, this would query the NotebookLM API with full project context.

**Key Points:**
- The AI has access to all project documents
- Responses include source citations
- Complex queries are analyzed across multiple data sources

Would you like me to elaborate on any specific aspect?`,
        timestamp: new Date(),
        sources: [
          {
            title: 'Related Document',
            type: 'daily_log',
            excerpt: 'Relevant excerpt from project data...',
            date: 'Today',
            link: '#'
          }
        ]
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-stone-600 to-stone-800 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
                Plaude
                <span className="text-xs bg-stone-700 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">AI</span>
              </h1>
              <p className="text-warm-600">Ask anything about your project • Powered by Claude + Gemini</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Panel */}
          <div className="lg:col-span-2">
            <div className={`bg-warm-0 rounded-xl border border-warm-200 shadow-sm overflow-hidden flex flex-col ${isExpanded ? 'fixed inset-4 z-50' : 'h-[600px]'}`}>
              {/* Panel Header */}
              <div className="px-4 py-3 border-b border-warm-200 bg-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-medium text-white flex items-center gap-2">
                      Plaude
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wide">AI</span>
                    </h2>
                    <p className="text-xs text-white/60">Johnson Kitchen Remodel</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-4 w-4 text-white/60" />
                    ) : (
                      <Maximize2 className="h-4 w-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-warm-200">
                {[
                  { id: 'chat', label: 'Chat', icon: MessageSquare },
                  { id: 'insights', label: 'Insights', icon: Lightbulb },
                  { id: 'audio', label: 'Audio', icon: Headphones },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-stone-700 border-b-2 border-stone-600 bg-warm-50'
                        : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="p-4 bg-stone-100 rounded-2xl mb-4">
                          <Sparkles className="h-8 w-8 text-stone-600" />
                        </div>
                        <h3 className="text-lg font-medium text-warm-800 mb-2">Ask anything about this project</h3>
                        <p className="text-sm text-warm-500 max-w-md">
                          I have access to all project documents, daily logs, invoices, change orders, and communications.
                        </p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <MessageBubble key={message.id} message={message} />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggested Questions */}
                  {messages.length <= 2 && (
                    <div className="px-4 py-3 border-t border-warm-100 bg-warm-50">
                      <p className="text-xs text-warm-500 mb-2">Suggested questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.slice(0, 4).map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestedQuestion(q.text)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-warm-0 border border-warm-200 rounded-full text-xs text-warm-700 hover:border-stone-300 hover:bg-stone-50 transition-colors"
                          >
                            <q.icon className="h-3 w-3 text-warm-400" />
                            {q.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t border-warm-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-2.5 rounded-lg transition-colors ${
                          isRecording
                            ? 'bg-danger text-white'
                            : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                        }`}
                      >
                        {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Ask about budget, schedule, vendors, issues..."
                          className="w-full px-4 py-2.5 pr-12 border border-warm-200 rounded-xl bg-warm-0 text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-stone-400"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-warm-800">AI-Generated Insights</h3>
                    <span className="text-xs text-warm-500">Updated 2 hours ago</span>
                  </div>

                  {mockInsights.map((insight, i) => (
                    <InsightBadge key={i} insight={insight} />
                  ))}

                  <div className="pt-4 border-t border-warm-200">
                    <h4 className="text-sm font-medium text-warm-700 mb-3">Project Health Score</h4>
                    <div className="bg-warm-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-stone-700">8.4<span className="text-lg text-warm-400">/10</span></span>
                        <span className="text-sm text-success flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          +0.3 from last week
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {[
                          { label: 'Budget', score: 9.2, color: 'bg-success' },
                          { label: 'Schedule', score: 7.8, color: 'bg-warning' },
                          { label: 'Quality', score: 8.5, color: 'bg-success' },
                          { label: 'Safety', score: 8.0, color: 'bg-success' },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <div className="text-lg font-semibold text-warm-800">{item.score}</div>
                            <div className="text-xs text-warm-500">{item.label}</div>
                            <div className="h-1 bg-warm-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${item.color} rounded-full`}
                                style={{ width: `${item.score * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === 'audio' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AudioBriefingPlayer />

                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-warm-700 mb-3">Available Briefings</h4>
                    <div className="space-y-2">
                      {[
                        { title: 'Morning Briefing', duration: '5:12', time: 'Today, 6:45 AM', active: true },
                        { title: 'Weekly Summary', duration: '8:34', time: 'Feb 16, 2026', active: false },
                        { title: 'Client Update', duration: '3:21', time: 'Feb 14, 2026', active: false },
                      ].map((briefing, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                            briefing.active
                              ? 'bg-stone-50 border-stone-200'
                              : 'bg-warm-0 border-warm-200 hover:bg-warm-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${briefing.active ? 'bg-stone-200' : 'bg-warm-100'}`}>
                              <Volume2 className={`h-4 w-4 ${briefing.active ? 'text-stone-600' : 'text-warm-500'}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-warm-800">{briefing.title}</p>
                              <p className="text-xs text-warm-500">{briefing.time}</p>
                            </div>
                          </div>
                          <span className="text-xs text-warm-500">{briefing.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-warm-200">
                    <h4 className="text-sm font-medium text-warm-700 mb-3">Generate Custom Briefing</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Project Status',
                        'Budget Review',
                        'Schedule Update',
                        'Risk Summary',
                      ].map(type => (
                        <button
                          key={type}
                          className="px-4 py-2 bg-warm-0 border border-warm-200 rounded-lg text-sm text-warm-700 hover:bg-warm-50 hover:border-warm-300 transition-colors"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-warm-0 rounded-xl border border-warm-200 p-4">
              <h3 className="font-medium text-warm-800 mb-4">Project Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Completion', value: '52%', icon: TrendingUp, color: 'text-stone-600' },
                  { label: 'Budget Used', value: '52%', icon: DollarSign, color: 'text-success' },
                  { label: 'Days Remaining', value: '22', icon: Calendar, color: 'text-warm-600' },
                  { label: 'Open Items', value: '4', icon: AlertTriangle, color: 'text-warning' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="text-sm text-warm-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-warm-800">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Suggested Questions */}
            <div className="bg-warm-0 rounded-xl border border-warm-200 p-4">
              <h3 className="font-medium text-warm-800 mb-4">Popular Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleSuggestedQuestion(q.text)
                      setActiveTab('chat')
                    }}
                    className="w-full flex items-center gap-3 p-2.5 bg-warm-50 hover:bg-stone-50 rounded-lg text-left transition-colors group"
                  >
                    <div className="p-1.5 bg-warm-100 group-hover:bg-stone-100 rounded transition-colors">
                      <q.icon className="h-3.5 w-3.5 text-warm-500 group-hover:text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm text-warm-700 group-hover:text-warm-800">{q.text}</p>
                      <p className="text-xs text-warm-400">{q.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-warm-0 rounded-xl border border-warm-200 p-4">
              <h3 className="font-medium text-warm-800 mb-4">Your Recent Queries</h3>
              <div className="space-y-2">
                {[
                  { query: "What's the budget status?", time: '2 min ago' },
                  { query: 'Summarize yesterday\'s work', time: '1 hour ago' },
                  { query: 'When is cabinet delivery?', time: '3 hours ago' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-warm-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-warm-400" />
                      <span className="text-sm text-warm-700 truncate">{item.query}</span>
                    </div>
                    <span className="text-xs text-warm-400 whitespace-nowrap ml-2">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
