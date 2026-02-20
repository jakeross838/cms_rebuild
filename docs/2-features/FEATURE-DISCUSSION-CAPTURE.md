# Discussion Capture & AI Extraction Feature Specification

**Priority:** 3 - Medium
**Dependencies:** Communications System, Plaude AI Integration
**Status:** Planning

---

## Overview

Capture discussions from calls, meetings, and conversations with automatic AI extraction of action items, decisions, and key points. This feature transforms unstructured conversation data into actionable, searchable project information.

---

## User Stories

1. **As a PM**, I want to record a client call and have AI extract action items
2. **As a superintendent**, I want to dictate field notes and have them categorized
3. **As a user**, I want to see all decisions made in a conversation thread
4. **As a user**, I want action items automatically linked to the schedule
5. **As a PM**, I want meeting summaries generated and shared with attendees

---

## Database Schema

```sql
-- Captured discussions
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Context
  job_id UUID REFERENCES jobs(id),
  channel_id UUID REFERENCES communication_channels(id),

  -- Source
  source_type TEXT NOT NULL, -- 'voice_recording', 'video_call', 'voice_note', 'text_thread', 'email_chain'
  source_id UUID, -- Link to source record

  -- Metadata
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,

  -- Participants
  participants JSONB DEFAULT '[]', -- [{ type, id, name, role }]

  -- Raw content
  transcript TEXT,
  transcript_language TEXT DEFAULT 'en',
  transcript_confidence DECIMAL(5,4),

  -- Processing
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'transcribing', 'extracting', 'complete', 'failed'
  processed_at TIMESTAMPTZ,

  -- AI-extracted content
  summary TEXT,
  key_points JSONB DEFAULT '[]', -- [{ text, importance }]
  sentiment TEXT, -- 'positive', 'neutral', 'negative', 'mixed'

  -- Linked records (created from extraction)
  created_tasks_count INTEGER DEFAULT 0,
  created_decisions_count INTEGER DEFAULT 0,

  -- File storage
  audio_url TEXT,
  video_url TEXT,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted action items
CREATE TABLE discussion_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  discussion_id UUID NOT NULL REFERENCES discussions(id),

  -- The extracted item
  text TEXT NOT NULL,
  context TEXT, -- Surrounding context from transcript

  -- Attribution
  assigned_to_name TEXT, -- Name mentioned in discussion
  assigned_to_id UUID REFERENCES users(id), -- Matched to user
  due_date_mentioned TEXT, -- Raw text like "by Friday"
  due_date DATE, -- Parsed date

  -- Priority (AI-assessed)
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  urgency_indicators TEXT[], -- ['ASAP', 'urgent', etc.]

  -- Linking
  linked_task_id UUID REFERENCES schedule_tasks(id), -- If created as task
  linked_to_schedule BOOLEAN DEFAULT false,

  -- Verification
  confidence DECIMAL(5,4), -- AI confidence
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'extracted', -- 'extracted', 'verified', 'rejected', 'completed'

  -- Position in transcript
  transcript_start INTEGER,
  transcript_end INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted decisions
CREATE TABLE discussion_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  discussion_id UUID NOT NULL REFERENCES discussions(id),

  -- The decision
  decision_text TEXT NOT NULL,
  context TEXT,

  -- Who decided
  decided_by_names TEXT[],
  decided_by_ids UUID[],

  -- Categorization
  category TEXT, -- 'design', 'schedule', 'budget', 'scope', 'material', 'other'
  affects TEXT[], -- ['budget', 'schedule', 'scope']

  -- Approval status (some decisions need formal approval)
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT, -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- Linking
  linked_change_order_id UUID REFERENCES change_orders(id),
  linked_selection_id UUID,

  confidence DECIMAL(5,4),
  verified BOOLEAN DEFAULT false,

  transcript_start INTEGER,
  transcript_end INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discussion mentions (people, companies, materials mentioned)
CREATE TABLE discussion_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES discussions(id),

  mention_type TEXT NOT NULL, -- 'person', 'company', 'material', 'date', 'money', 'location'
  mention_text TEXT NOT NULL,
  normalized_value TEXT, -- Normalized form

  -- Entity resolution
  resolved_to_type TEXT, -- 'user', 'vendor', 'client'
  resolved_to_id UUID,

  count INTEGER DEFAULT 1, -- Times mentioned

  transcript_positions INTEGER[], -- All positions in transcript

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_discussions_job ON discussions(job_id);
CREATE INDEX idx_discussions_status ON discussions(processing_status);
CREATE INDEX idx_action_items_discussion ON discussion_action_items(discussion_id);
CREATE INDEX idx_action_items_status ON discussion_action_items(status);
CREATE INDEX idx_decisions_discussion ON discussion_decisions(discussion_id);
CREATE INDEX idx_mentions_discussion ON discussion_mentions(discussion_id);
```

---

## Processing Pipeline

### Audio Processing

```typescript
// lib/discussions/audio-processor.ts

interface ProcessingResult {
  transcript: string
  language: string
  confidence: number
  speakers: SpeakerSegment[]
  duration: number
}

interface SpeakerSegment {
  speaker: string
  start: number
  end: number
  text: string
  confidence: number
}

export async function processAudioDiscussion(
  discussionId: string,
  audioUrl: string
): Promise<ProcessingResult> {
  // Update status
  await updateDiscussionStatus(discussionId, 'transcribing')

  try {
    // 1. Transcribe with Google Speech-to-Text
    const transcription = await speechToText.transcribe({
      audioUrl,
      enableSpeakerDiarization: true,
      enableWordTimeOffsets: true,
      languageCode: 'en-US',
      alternativeLanguageCodes: ['es-US'], // Spanish support
      model: 'phone_call', // Optimized for calls
    })

    // 2. Format transcript with speaker labels
    const formattedTranscript = formatTranscript(transcription.speakers)

    // 3. Update discussion with transcript
    await supabase.from('discussions').update({
      transcript: formattedTranscript,
      transcript_language: transcription.language,
      transcript_confidence: transcription.confidence,
      duration_seconds: transcription.duration,
      processing_status: 'extracting',
    }).eq('id', discussionId)

    // 4. Extract insights
    await extractDiscussionInsights(discussionId, formattedTranscript)

    return {
      transcript: formattedTranscript,
      language: transcription.language,
      confidence: transcription.confidence,
      speakers: transcription.speakers,
      duration: transcription.duration,
    }
  } catch (error) {
    await updateDiscussionStatus(discussionId, 'failed')
    throw error
  }
}

function formatTranscript(speakers: SpeakerSegment[]): string {
  return speakers.map(segment =>
    `[${formatTime(segment.start)}] Speaker ${segment.speaker}: ${segment.text}`
  ).join('\n')
}
```

### AI Extraction

```typescript
// lib/discussions/insight-extractor.ts

interface ExtractionResult {
  summary: string
  keyPoints: KeyPoint[]
  actionItems: ActionItem[]
  decisions: Decision[]
  mentions: Mention[]
  sentiment: string
}

export async function extractDiscussionInsights(
  discussionId: string,
  transcript: string
): Promise<ExtractionResult> {
  // Get context for better extraction
  const discussion = await getDiscussion(discussionId)
  const jobContext = discussion.jobId
    ? await getJobContext(discussion.jobId)
    : null

  // Use Claude for complex extraction
  const extraction = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 4096,
    system: buildExtractionPrompt(jobContext),
    messages: [{
      role: 'user',
      content: `Analyze this construction project discussion transcript and extract structured information:

TRANSCRIPT:
${transcript}

Extract:
1. A brief summary (2-3 sentences)
2. Key points discussed (with importance: high/medium/low)
3. Action items (who, what, when if mentioned)
4. Decisions made
5. People, companies, materials mentioned
6. Overall sentiment

Respond in JSON format.`
    }]
  })

  const result = JSON.parse(extraction.content[0].text) as ExtractionResult

  // Store extracted data
  await storeExtractionResults(discussionId, result)

  // Update discussion status
  await supabase.from('discussions').update({
    summary: result.summary,
    key_points: result.keyPoints,
    sentiment: result.sentiment,
    processing_status: 'complete',
    processed_at: new Date().toISOString(),
  }).eq('id', discussionId)

  // Auto-link action items to users
  for (const actionItem of result.actionItems) {
    await resolveAndLinkActionItem(discussionId, actionItem)
  }

  return result
}

async function resolveAndLinkActionItem(
  discussionId: string,
  actionItem: ActionItem
): Promise<void> {
  // Try to match assigned_to_name to a user
  let assignedToId: string | null = null

  if (actionItem.assignedTo) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .ilike('name', `%${actionItem.assignedTo}%`)
      .limit(1)

    if (users?.[0]) {
      assignedToId = users[0].id
    }
  }

  // Parse due date if mentioned
  let dueDate: Date | null = null
  if (actionItem.dueDateMentioned) {
    dueDate = parseDateMention(actionItem.dueDateMentioned)
  }

  await supabase.from('discussion_action_items').insert({
    discussion_id: discussionId,
    text: actionItem.text,
    context: actionItem.context,
    assigned_to_name: actionItem.assignedTo,
    assigned_to_id: assignedToId,
    due_date_mentioned: actionItem.dueDateMentioned,
    due_date: dueDate,
    priority: actionItem.priority,
    confidence: actionItem.confidence,
  })
}

function parseDateMention(text: string): Date | null {
  const today = new Date()
  const lowerText = text.toLowerCase()

  // Common patterns
  if (lowerText.includes('today')) {
    return today
  }
  if (lowerText.includes('tomorrow')) {
    return addDays(today, 1)
  }
  if (lowerText.includes('friday')) {
    return getNextDayOfWeek(today, 5)
  }
  if (lowerText.includes('monday')) {
    return getNextDayOfWeek(today, 1)
  }
  if (lowerText.includes('end of week')) {
    return getNextDayOfWeek(today, 5)
  }
  if (lowerText.includes('next week')) {
    return addDays(today, 7)
  }

  // Try to parse explicit dates
  const parsed = chrono.parseDate(text)
  return parsed
}
```

---

## Voice Note Component

```tsx
// components/discussions/voice-note-recorder.tsx

'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square, Play, Pause, Upload, Sparkles } from 'lucide-react'

interface VoiceNoteRecorderProps {
  jobId?: string
  onComplete: (discussionId: string) => void
}

export function VoiceNoteRecorder({ jobId, onComplete }: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Capture in 1-second chunks
      setIsRecording(true)
      setDuration(0)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processRecording = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    setProcessingStatus('Uploading...')

    try {
      // 1. Upload audio
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-note.webm')
      formData.append('jobId', jobId || '')

      const uploadResponse = await fetch('/api/discussions/upload', {
        method: 'POST',
        body: formData,
      })

      const { discussionId, audioUrl } = await uploadResponse.json()

      // 2. Start processing
      setProcessingStatus('Transcribing...')

      const processResponse = await fetch('/api/discussions/process', {
        method: 'POST',
        body: JSON.stringify({ discussionId }),
      })

      // 3. Poll for completion
      let attempts = 0
      while (attempts < 30) {
        await new Promise(r => setTimeout(r, 2000))

        const statusResponse = await fetch(`/api/discussions/${discussionId}/status`)
        const { status } = await statusResponse.json()

        if (status === 'complete') {
          setProcessingStatus('Complete!')
          onComplete(discussionId)
          break
        } else if (status === 'extracting') {
          setProcessingStatus('Extracting insights...')
        } else if (status === 'failed') {
          throw new Error('Processing failed')
        }

        attempts++
      }
    } catch (error) {
      setProcessingStatus('Error processing')
    } finally {
      setIsProcessing(false)
    }
  }

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, isPaused])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-warm-0 rounded-xl border border-warm-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-warm-800">Voice Note</h3>
        {duration > 0 && (
          <span className="text-sm text-warm-500">{formatDuration(duration)}</span>
        )}
      </div>

      {!audioBlob ? (
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600"
            >
              <Square className="h-5 w-5" />
              Stop
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Audio preview */}
          <audio
            src={URL.createObjectURL(audioBlob)}
            controls
            className="w-full"
          />

          {/* Process button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setAudioBlob(null)}
              className="text-sm text-warm-500 hover:text-warm-700"
            >
              Record again
            </button>

            <button
              onClick={processRecording}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg hover:bg-stone-600 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  {processingStatus}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Process with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## Discussion Viewer

```tsx
// components/discussions/discussion-viewer.tsx

'use client'

import { useState } from 'react'
import {
  FileText, CheckCircle, AlertCircle, Users, Clock,
  ArrowRight, ExternalLink, Play
} from 'lucide-react'

interface Discussion {
  id: string
  title: string
  summary: string
  transcript: string
  keyPoints: { text: string; importance: string }[]
  actionItems: ActionItem[]
  decisions: Decision[]
  participants: Participant[]
  duration: number
  sentiment: string
  audioUrl?: string
}

export function DiscussionViewer({ discussion }: { discussion: Discussion }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'actions' | 'decisions'>('summary')

  return (
    <div className="bg-warm-0 rounded-xl border border-warm-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-warm-800">{discussion.title}</h2>
          <div className="flex items-center gap-2 text-sm text-warm-500">
            <Clock className="h-4 w-4" />
            {formatDuration(discussion.duration)}
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 mt-2">
          <Users className="h-4 w-4 text-warm-400" />
          <div className="flex -space-x-2">
            {discussion.participants.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-stone-200 border-2 border-warm-0 flex items-center justify-center text-xs font-medium"
                title={p.name}
              >
                {p.name.charAt(0)}
              </div>
            ))}
            {discussion.participants.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-warm-100 border-2 border-warm-0 flex items-center justify-center text-xs text-warm-500">
                +{discussion.participants.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-200">
        {[
          { id: 'summary', label: 'Summary' },
          { id: 'actions', label: 'Actions', count: discussion.actionItems.length },
          { id: 'decisions', label: 'Decisions', count: discussion.decisions.length },
          { id: 'transcript', label: 'Transcript' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-stone-700 border-b-2 border-stone-600'
                : 'text-warm-500 hover:text-warm-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-xs bg-warm-100 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Audio player */}
            {discussion.audioUrl && (
              <div className="flex items-center gap-3 p-3 bg-stone-700 rounded-lg">
                <button className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                  <Play className="h-4 w-4 text-white" />
                </button>
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div className="h-full w-0 bg-white rounded-full" />
                </div>
                <span className="text-xs text-white/60">{formatDuration(discussion.duration)}</span>
              </div>
            )}

            {/* Summary */}
            <div>
              <h3 className="text-sm font-medium text-warm-700 mb-2">Summary</h3>
              <p className="text-sm text-warm-600">{discussion.summary}</p>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="text-sm font-medium text-warm-700 mb-2">Key Points</h3>
              <ul className="space-y-2">
                {discussion.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      point.importance === 'high' ? 'bg-error' :
                      point.importance === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className="text-sm text-warm-600">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-3">
            {discussion.actionItems.map((item) => (
              <ActionItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="space-y-3">
            {discussion.decisions.map((decision) => (
              <DecisionCard key={decision.id} decision={decision} />
            ))}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="max-h-96 overflow-y-auto">
            <pre className="text-sm text-warm-600 whitespace-pre-wrap font-mono">
              {discussion.transcript}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionItemCard({ item }: { item: ActionItem }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-warm-50 rounded-lg border border-warm-100">
      <div className={`p-1 rounded ${
        item.status === 'completed' ? 'bg-success/10 text-success' :
        item.priority === 'high' ? 'bg-error/10 text-error' : 'bg-warm-100 text-warm-500'
      }`}>
        {item.status === 'completed' ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-warm-700">{item.text}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-warm-500">
          {item.assignedToName && (
            <span>Assigned: {item.assignedToName}</span>
          )}
          {item.dueDate && (
            <span>Due: {formatDate(item.dueDate)}</span>
          )}
        </div>
      </div>

      {!item.linkedTaskId && (
        <button className="px-2 py-1 text-xs bg-stone-700 text-white rounded hover:bg-stone-600">
          Create Task
        </button>
      )}
    </div>
  )
}

function DecisionCard({ decision }: { decision: Decision }) {
  return (
    <div className="p-3 bg-warm-50 rounded-lg border border-warm-100">
      <p className="text-sm text-warm-700">{decision.decisionText}</p>

      <div className="flex items-center gap-3 mt-2 text-xs text-warm-500">
        {decision.decidedByNames?.length > 0 && (
          <span>By: {decision.decidedByNames.join(', ')}</span>
        )}
        {decision.category && (
          <span className="px-2 py-0.5 bg-warm-200 rounded-full">{decision.category}</span>
        )}
      </div>

      {decision.requiresApproval && decision.approvalStatus === 'pending' && (
        <div className="flex items-center gap-2 mt-2">
          <button className="px-2 py-1 text-xs bg-success text-white rounded">
            Approve
          </button>
          <button className="px-2 py-1 text-xs bg-warm-200 text-warm-700 rounded">
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Integration Points

1. **Schedule Integration**: Action items can be converted to schedule tasks
2. **Communications**: Discussion summaries can be shared via message
3. **Change Orders**: Decisions affecting scope can create CO drafts
4. **Daily Logs**: Voice notes can be attached to daily log entries
5. **Client Portal**: Approved summaries can be shared with clients

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1 | Database schema, audio upload/storage |
| Phase 2 | Week 2 | Speech-to-text integration |
| Phase 3 | Week 3 | AI extraction pipeline |
| Phase 4 | Week 4 | UI components, action item linking |

---

*BuildDesk Feature Specification v1.0*
