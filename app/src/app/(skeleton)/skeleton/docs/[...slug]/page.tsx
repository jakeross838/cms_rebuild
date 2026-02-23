'use client'

import { useState, useEffect, useCallback } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ArrowLeft, StickyNote, X, Plus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Note {
  id: string
  section: string
  text: string
  createdAt: string
}

function getNotesKey(slug: string) {
  return `rossos-notes-${slug}`
}

function loadNotes(slug: string): Note[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(getNotesKey(slug)) ?? '[]')
  } catch {
    return []
  }
}

function saveNotes(slug: string, notes: Note[]) {
  localStorage.setItem(getNotesKey(slug), JSON.stringify(notes))
}

export default function DocViewer() {
  const params = useParams()
  const slugParts = params.slug as string[]
  const slug = slugParts.join('/')
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [showNotes, setShowNotes] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [newNoteSection, setNewNoteSection] = useState('')

  useEffect(() => {
    fetch(`/api/docs?slug=${encodeURIComponent(slug)}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => {
        setContent(data.content)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [slug])

  useEffect(() => {
    setNotes(loadNotes(slug))
  }, [slug])

  const addNote = useCallback(() => {
    if (!newNote.trim()) return
    const note: Note = {
      id: Date.now().toString(),
      section: newNoteSection || 'General',
      text: newNote.trim(),
      createdAt: new Date().toISOString(),
    }
    const updated = [...notes, note]
    setNotes(updated)
    saveNotes(slug, updated)
    setNewNote('')
    setNewNoteSection('')
  }, [newNote, newNoteSection, notes, slug])

  const deleteNote = useCallback((id: string) => {
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    saveNotes(slug, updated)
  }, [notes, slug])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse w-32" />
        <div className="h-8 bg-muted rounded animate-pulse w-64" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + (i % 5) * 8}%` }} />
        ))}
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/skeleton/docs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Docs
        </Link>
        <div className="text-center py-12 text-muted-foreground">
          Document not found: {slug}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto flex gap-6">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <Link href="/skeleton/docs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Docs
          </Link>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border ${showNotes ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <StickyNote className="h-4 w-4" />
            Notes ({notes.length})
          </button>
        </div>

        <div className="bg-card border rounded-lg p-8 prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:text-sm prose-th:text-left prose-td:py-1.5 prose-th:py-1.5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Notes Panel */}
      {showNotes ? <div className="w-80 shrink-0">
          <div className="sticky top-4 border rounded-lg bg-card">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <StickyNote className="h-4 w-4" />
                Your Notes
              </h3>
              <button onClick={() => setShowNotes(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Add Note */}
            <div className="p-3 border-b space-y-2">
              <input
                type="text"
                placeholder="Section (optional)"
                value={newNoteSection}
                onChange={e => setNewNoteSection(e.target.value)}
                className="w-full text-xs px-2 py-1.5 border rounded bg-background"
              />
              <textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                rows={3}
                className="w-full text-sm px-2 py-1.5 border rounded bg-background resize-none"
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote() }}
              />
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
              >
                <Plus className="h-3 w-3" /> Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notes yet. Add one above.
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="p-3 border-b last:border-b-0 group">
                    {note.section !== 'General' && (
                      <div className="text-xs font-medium text-muted-foreground mb-1">{note.section}</div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div> : null}
    </div>
  )
}
