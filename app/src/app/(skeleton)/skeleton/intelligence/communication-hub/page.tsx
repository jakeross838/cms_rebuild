'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { CommunicationHubPreview } from '@/components/skeleton/previews/communication-hub-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CommunicationHubPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? (
        <CommunicationHubPreview />
      ) : (
        <PageSpec
          title="Universal Communication Hub"
          phase="Phase 2 - Intelligence"
          planFile="docs/architecture/universal-comms-and-learning.md"
          description="Every message from any platform — email, SMS, calls, on-site recordings, WhatsApp, Slack, portal — flows into one AI-powered inbox. Two-way sync routes replies back through the original channel. AI auto-tags to jobs, extracts decisions, and proposes downstream updates."
          workflow={['Message arrives from any channel (email, SMS, call, recording, portal)', 'AI identifies sender, matches to contact and job', 'AI classifies message type and urgency', 'AI extracts decisions, action items, dates, and amounts', 'Proposes downstream updates (schedule, budget, selections, etc.)', 'User confirms with one tap — all systems update', 'Reply from RossOS routes back through original channel']}
          features={['Universal Inbox (all channels merged)', 'Gmail + Outlook two-way sync (OAuth2)', 'Twilio SMS/Voice with business numbers', 'On-site conversation recording + Whisper transcription', 'WhatsApp Business API integration', 'Slack/Teams bridge for office communication', 'AI job auto-tagging (98% accuracy)', 'Decision and action item extraction', 'Downstream update proposals with one-tap confirm', 'Two-way channel routing (reply goes back to source)', 'Contact pattern learning (learns your vendors/clients)', 'Meeting mode with auto-generated minutes', 'Client Portal messaging integration', 'Vendor Portal messaging integration']}
          connections={[
            { name: 'All Modules', type: 'output', description: 'Extracted decisions update schedule, budget, selections, daily logs, vendor records' },
            { name: 'Trade Intuition AI', type: 'bidirectional', description: 'Communication data feeds learning; AI validates extracted items' },
            { name: 'Contact Directory', type: 'input', description: 'Matches senders to known contacts and jobs' },
          ]}
          aiFeatures={[
            { name: 'Job Auto-Tagging', description: 'Matches every message to the correct job using sender, keywords, and conversation context — 98% accuracy' },
            { name: 'Decision Extraction', description: 'Identifies approvals, rejections, selections, and commitments from natural language with 94% confidence' },
            { name: 'On-Site Transcription', description: 'Records field conversations, transcribes via Whisper API in 30 seconds, extracts all action items and decisions' },
          ]}
        />
      )}
    </div>
  )
}
