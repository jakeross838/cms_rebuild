'use client'

import {
  LifeBuoy,
  Search,
  MessageCircle,
  BookOpen,
  FileText,
  ChevronRight,
  Star,
  Sparkles,
  Mail,
  Video,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const popularArticles = [
  { title: 'Getting Started: Your First Project Setup', category: 'Onboarding', views: 2840, helpful: 96 },
  { title: 'How to Process Invoices with AI Extraction', category: 'Financial', views: 1920, helpful: 94 },
  { title: 'Setting Up QuickBooks Integration', category: 'Integrations', views: 1650, helpful: 91 },
  { title: 'Creating and Managing Draw Requests', category: 'Financial', views: 1420, helpful: 93 },
  { title: 'Configuring Client Portal Access', category: 'Portals', views: 1180, helpful: 89 },
]

const tickets = [
  { id: 'TKT-1042', subject: 'QuickBooks sync showing duplicate vendors', status: 'open', priority: 'high', created: '2 hrs ago', assignee: 'Support Team' },
  { id: 'TKT-1038', subject: 'PDF export cutting off right margin', status: 'in_progress', priority: 'medium', created: '1 day ago', assignee: 'Jake R.' },
  { id: 'TKT-1035', subject: 'Question about multi-state payroll setup', status: 'resolved', priority: 'low', created: '3 days ago', assignee: 'Support Team' },
]

const kbCategories = [
  { name: 'Getting Started', articles: 24, icon: '🚀' },
  { name: 'Financial Management', articles: 42, icon: '💰' },
  { name: 'Project Management', articles: 38, icon: '📋' },
  { name: 'Client & Vendor Portals', articles: 18, icon: '🌐' },
  { name: 'Integrations & API', articles: 15, icon: '🔗' },
  { name: 'Reporting & Analytics', articles: 28, icon: '📊' },
  { name: 'Admin & Settings', articles: 12, icon: '⚙️' },
  { name: 'Mobile App', articles: 10, icon: '📱' },
]

export default function CustomerSupportPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg">
            <LifeBuoy className="h-6 w-6 text-stone-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Support</h1>
            <p className="text-sm text-muted-foreground">Module 46 -- Get help, browse articles, manage support tickets</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm bg-stone-700 text-white rounded-lg hover:bg-stone-600 flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" /> Live Chat
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-center mb-3">How can we help you?</h2>
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input type="text" placeholder="Search help articles, FAQs, or describe your issue..." className="w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Popular:</span>
          <button className="hover:text-foreground">invoice processing</button>
          <button className="hover:text-foreground">QuickBooks sync</button>
          <button className="hover:text-foreground">client portal</button>
          <button className="hover:text-foreground">draw requests</button>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3 hover:bg-muted/30 cursor-pointer">
          <div className="p-2 bg-stone-100 rounded-lg"><MessageCircle className="h-5 w-5 text-stone-600" /></div>
          <div>
            <div className="font-medium text-sm">Live Chat</div>
            <div className="text-xs text-green-600">Online -- Avg response: 2 min</div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3 hover:bg-muted/30 cursor-pointer">
          <div className="p-2 bg-stone-100 rounded-lg"><Mail className="h-5 w-5 text-stone-600" /></div>
          <div>
            <div className="font-medium text-sm">Email Support</div>
            <div className="text-xs text-muted-foreground">support@rossos.com -- 4hr SLA</div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-3 hover:bg-muted/30 cursor-pointer">
          <div className="p-2 bg-warm-100 rounded-lg"><Video className="h-5 w-5 text-stone-600" /></div>
          <div>
            <div className="font-medium text-sm">Schedule a Call</div>
            <div className="text-xs text-muted-foreground">1-on-1 video support session</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Popular Articles */}
        <div className="col-span-2 space-y-6">
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" />Popular Articles</h3>
              <button className="text-sm text-stone-600 hover:text-stone-700 font-medium">View All</button>
            </div>
            <div className="divide-y">
              {popularArticles.map((article, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{article.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="bg-muted px-1.5 py-0.5 rounded">{article.category}</span>
                        <span className="ml-2">{article.views.toLocaleString()} views</span>
                        <span className="ml-2">{article.helpful}% found helpful</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-card border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Your Tickets</h3>
              <button className="text-sm text-stone-600 hover:text-stone-700 font-medium">+ New Ticket</button>
            </div>
            <div className="divide-y">
              {tickets.map((ticket, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded', ticket.priority === 'high' ? 'bg-red-100 text-red-700' : ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-warm-100 text-warm-600')}>{ticket.priority}</span>
                    </div>
                    <div className="text-sm font-medium mt-1">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ticket.created} -- {ticket.assignee}</div>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded', ticket.status === 'open' ? 'bg-stone-100 text-stone-700' : ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
                    {ticket.status === 'in_progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knowledge Base Categories */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-stone-600" />Knowledge Base</h3>
          <div className="space-y-2">
            {kbCategories.map((cat, i) => (
              <button key={i} className="w-full flex items-center justify-between p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 text-left">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{cat.articles}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-stone-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-stone-600 mt-0.5" />
          <div>
            <div className="font-medium text-teal-800">AI Support Assistant</div>
            <p className="text-sm text-stone-700 mt-1">Based on your recent activity, you might find these helpful: &quot;How to handle vendor name variations in invoice processing&quot; and &quot;Setting up approval thresholds for POs over $10K&quot;. Your open ticket about QuickBooks duplicates is being investigated -- typical resolution time is 4 hours.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
