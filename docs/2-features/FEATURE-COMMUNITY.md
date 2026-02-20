# Community Section Feature Specification

**Priority:** 5 - Future
**Dependencies:** Communications, User System
**Status:** Planning

---

## Overview

Community section where construction professionals across companies can share best practices, answer questions, and build relationships. Features moderated forums, expert recognition, and company-branded contributions.

---

## User Stories

1. **As a user**, I want to ask questions to the broader BuildDesk community
2. **As a user**, I want to share best practices from my projects
3. **As a company owner**, I want my team's contributions to reflect well on us
4. **As a user**, I want to follow topics and experts in my specialty
5. **As a vendor**, I want to establish expertise in my product category

---

## Database Schema

```sql
-- Community categories
CREATE TABLE community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,

  -- Hierarchy
  parent_id UUID REFERENCES community_categories(id),

  -- Settings
  requires_approval BOOLEAN DEFAULT false,
  vendor_posts_allowed BOOLEAN DEFAULT true,

  -- Stats
  post_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,

  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO community_categories (name, slug, description, icon) VALUES
  ('Project Management', 'project-management', 'Scheduling, budgeting, and coordination', 'Briefcase'),
  ('Estimating', 'estimating', 'Cost estimation and bidding strategies', 'Calculator'),
  ('Field Operations', 'field-operations', 'On-site management and execution', 'HardHat'),
  ('Technology', 'technology', 'Software, tools, and integrations', 'Laptop'),
  ('Business Development', 'business-development', 'Sales, marketing, and growth', 'TrendingUp'),
  ('Safety', 'safety', 'OSHA, safety protocols, and best practices', 'Shield'),
  ('Materials & Products', 'materials-products', 'Product recommendations and reviews', 'Package'),
  ('Warranty & Service', 'warranty-service', 'Post-completion support strategies', 'Wrench');

-- Community posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Author
  author_id UUID NOT NULL REFERENCES users(id),
  author_company_id UUID NOT NULL REFERENCES companies(id),
  author_type TEXT NOT NULL DEFAULT 'member', -- 'member', 'expert', 'vendor', 'staff'

  -- Post details
  post_type TEXT NOT NULL, -- 'question', 'discussion', 'tip', 'case_study', 'poll'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,

  -- Categorization
  category_id UUID NOT NULL REFERENCES community_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- Attachments
  attachments JSONB DEFAULT '[]', -- [{ type, url, name }]
  has_images BOOLEAN DEFAULT false,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Answers (for questions)
  is_answered BOOLEAN DEFAULT false,
  accepted_answer_id UUID,

  -- Moderation
  status TEXT DEFAULT 'active', -- 'pending', 'active', 'hidden', 'removed'
  moderation_reason TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMPTZ,

  -- Flags
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,

  -- AI-generated summary
  ai_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id),

  -- Author
  author_id UUID NOT NULL REFERENCES users(id),
  author_company_id UUID NOT NULL REFERENCES companies(id),

  -- Content
  content TEXT NOT NULL,
  content_html TEXT,

  -- Threading
  parent_id UUID REFERENCES community_comments(id),
  thread_depth INTEGER DEFAULT 0,

  -- Engagement
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,

  -- For answers
  is_answer BOOLEAN DEFAULT false,
  is_accepted_answer BOOLEAN DEFAULT false,

  -- Moderation
  status TEXT DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL, -- 'post', 'comment'
  target_id UUID NOT NULL,

  vote_type TEXT NOT NULL, -- 'up', 'down'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, target_type, target_id)
);

-- Bookmarks
CREATE TABLE community_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES community_posts(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);

-- Category follows
CREATE TABLE community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),
  follow_type TEXT NOT NULL, -- 'category', 'tag', 'user'
  target_id UUID, -- category_id or user_id
  target_tag TEXT, -- for tag follows

  notification_preference TEXT DEFAULT 'digest', -- 'all', 'digest', 'none'

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, follow_type, target_id)
);

-- Reputation/points
CREATE TABLE community_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),

  -- Lifetime stats
  total_points INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  answers_accepted INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  helpful_flags INTEGER DEFAULT 0,

  -- Level
  level TEXT DEFAULT 'member', -- 'newcomer', 'member', 'contributor', 'expert', 'legend'
  level_updated_at TIMESTAMPTZ,

  -- Expertise areas
  expertise_categories UUID[] DEFAULT '{}',

  -- Badges
  badges JSONB DEFAULT '[]', -- [{ id, name, awarded_at }]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reputation events
CREATE TABLE community_reputation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),

  event_type TEXT NOT NULL, -- 'post_created', 'answer_accepted', 'upvote_received', etc.
  points INTEGER NOT NULL,
  description TEXT,

  -- Reference
  reference_type TEXT,
  reference_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor verification
CREATE TABLE community_vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL UNIQUE REFERENCES companies(id),

  -- Vendor info
  vendor_type TEXT NOT NULL, -- 'manufacturer', 'distributor', 'installer', 'consultant'
  product_categories TEXT[],
  service_areas TEXT[],

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_documents JSONB,

  -- Profile
  profile_description TEXT,
  website_url TEXT,
  contact_email TEXT,

  -- Stats
  posts_count INTEGER DEFAULT 0,
  helpful_answers INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_community_posts_category ON community_posts(category_id);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_status ON community_posts(status) WHERE status = 'active';
CREATE INDEX idx_community_comments_post ON community_comments(post_id);
CREATE INDEX idx_community_votes_target ON community_votes(target_type, target_id);
CREATE INDEX idx_community_reputation_user ON community_reputation(user_id);
CREATE INDEX idx_community_posts_search ON community_posts USING gin(to_tsvector('english', title || ' ' || content));
```

---

## Core Features

### Reputation System

```typescript
// lib/community/reputation.ts

interface ReputationEvent {
  type: string
  points: number
  description: string
  referenceType?: string
  referenceId?: string
}

const REPUTATION_RULES: Record<string, number> = {
  post_created: 5,
  answer_created: 10,
  answer_accepted: 25,
  upvote_received: 2,
  downvote_received: -1,
  post_featured: 50,
  first_post: 10,
  streak_7_days: 20,
  helpful_flag: 5,
}

const LEVEL_THRESHOLDS: Record<string, number> = {
  newcomer: 0,
  member: 50,
  contributor: 200,
  expert: 500,
  legend: 2000,
}

export async function awardReputation(
  userId: string,
  event: ReputationEvent
): Promise<void> {
  // Record event
  await supabase.from('community_reputation_events').insert({
    user_id: userId,
    event_type: event.type,
    points: event.points,
    description: event.description,
    reference_type: event.referenceType,
    reference_id: event.referenceId,
  })

  // Update total
  const { data: rep } = await supabase
    .from('community_reputation')
    .select('*')
    .eq('user_id', userId)
    .single()

  const newTotal = (rep?.total_points || 0) + event.points

  // Check for level up
  const currentLevel = rep?.level || 'newcomer'
  let newLevel = currentLevel

  for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS).reverse()) {
    if (newTotal >= threshold) {
      newLevel = level
      break
    }
  }

  // Update reputation
  await supabase.from('community_reputation').upsert({
    user_id: userId,
    total_points: newTotal,
    level: newLevel,
    level_updated_at: newLevel !== currentLevel ? new Date().toISOString() : rep?.level_updated_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Check for badges
  await checkAndAwardBadges(userId, newTotal, event)
}

async function checkAndAwardBadges(
  userId: string,
  totalPoints: number,
  event: ReputationEvent
): Promise<void> {
  const badges: Badge[] = []

  // Points-based badges
  if (totalPoints >= 100 && !hasBadge(userId, 'centurion')) {
    badges.push({ id: 'centurion', name: 'Centurion', description: 'Earned 100 reputation points' })
  }
  if (totalPoints >= 1000 && !hasBadge(userId, 'thousand-club')) {
    badges.push({ id: 'thousand-club', name: 'Thousand Club', description: 'Earned 1,000 reputation points' })
  }

  // Activity-based badges
  if (event.type === 'answer_accepted') {
    const acceptedCount = await getAcceptedAnswerCount(userId)
    if (acceptedCount === 1) {
      badges.push({ id: 'helpful', name: 'Helpful', description: 'First accepted answer' })
    }
    if (acceptedCount === 10) {
      badges.push({ id: 'problem-solver', name: 'Problem Solver', description: '10 accepted answers' })
    }
  }

  // Award badges
  for (const badge of badges) {
    await awardBadge(userId, badge)
  }
}
```

### Moderation System

```typescript
// lib/community/moderation.ts

interface ModerationAction {
  action: 'approve' | 'hide' | 'remove' | 'warn' | 'ban'
  reason: string
  duration?: number // For temporary bans
}

export async function moderatePost(
  postId: string,
  moderatorId: string,
  action: ModerationAction
): Promise<void> {
  let newStatus: string

  switch (action.action) {
    case 'approve':
      newStatus = 'active'
      break
    case 'hide':
      newStatus = 'hidden'
      break
    case 'remove':
      newStatus = 'removed'
      break
    default:
      newStatus = 'active'
  }

  await supabase.from('community_posts').update({
    status: newStatus,
    moderation_reason: action.reason,
    moderated_by: moderatorId,
    moderated_at: new Date().toISOString(),
  }).eq('id', postId)

  // Notify author
  const post = await getPost(postId)
  await notifyUser(post.author_id, {
    type: 'moderation',
    title: `Your post was ${action.action}ed`,
    message: action.reason,
    postId,
  })

  // Affect reputation
  if (action.action === 'remove') {
    await awardReputation(post.author_id, {
      type: 'post_removed',
      points: -20,
      description: 'Post removed by moderator',
      referenceType: 'post',
      referenceId: postId,
    })
  }
}

// Auto-moderation with AI
export async function autoModerate(
  postId: string,
  content: string
): Promise<{ shouldReview: boolean; concerns: string[] }> {
  // Use Claude for content moderation
  const moderation = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    system: `You are a content moderator for a professional construction community.
Flag content that contains:
- Spam or promotional content
- Inappropriate language
- Off-topic content
- Potential misinformation
- Personal attacks

Respond with JSON: { "shouldReview": boolean, "concerns": string[] }`,
    messages: [{
      role: 'user',
      content: `Review this post:\n\n${content}`
    }]
  })

  return JSON.parse(moderation.content[0].text)
}
```

---

## UI Components

```tsx
// components/community/post-feed.tsx

'use client'

import { useState } from 'react'
import {
  MessageSquare, ThumbsUp, ThumbsDown, Bookmark, Share,
  CheckCircle, Clock, User, Building, Award
} from 'lucide-react'

interface PostFeedProps {
  categoryId?: string
  tag?: string
  authorId?: string
}

export function PostFeed({ categoryId, tag, authorId }: PostFeedProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'unanswered'>('recent')
  const { posts, isLoading, loadMore, hasMore } = usePosts({ categoryId, tag, authorId, sortBy })

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        {['recent', 'popular', 'unanswered'].map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort as typeof sortBy)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              sortBy === sort
                ? 'bg-stone-700 text-white'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            }`}
          >
            {sort.charAt(0).toUpperCase() + sort.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-3 text-center text-warm-600 hover:text-warm-800"
        >
          Load more
        </button>
      )}
    </div>
  )
}

function PostCard({ post }: { post: CommunityPost }) {
  return (
    <div className="bg-warm-0 border border-warm-200 rounded-xl p-4">
      {/* Author info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
          <User className="h-5 w-5 text-stone-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-warm-800">{post.author_name}</span>
            {post.author_type === 'expert' && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                <Award className="h-3 w-3" />
                Expert
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-warm-500">
            <Building className="h-3 w-3" />
            {post.author_company_name}
            <span>•</span>
            <Clock className="h-3 w-3" />
            {formatRelativeTime(post.created_at)}
          </div>
        </div>
      </div>

      {/* Post type badge */}
      <div className="mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          post.post_type === 'question' ? 'bg-blue-100 text-blue-700' :
          post.post_type === 'tip' ? 'bg-green-100 text-green-700' :
          post.post_type === 'case_study' ? 'bg-purple-100 text-purple-700' :
          'bg-warm-100 text-warm-600'
        }`}>
          {post.post_type}
        </span>
        {post.is_answered && (
          <span className="ml-2 text-xs text-success flex items-center gap-1 inline-flex">
            <CheckCircle className="h-3 w-3" />
            Answered
          </span>
        )}
      </div>

      {/* Title & content preview */}
      <a href={`/community/post/${post.id}`} className="block group">
        <h3 className="text-lg font-semibold text-warm-800 group-hover:text-stone-700">
          {post.title}
        </h3>
        <p className="text-sm text-warm-600 mt-1 line-clamp-2">
          {post.content.slice(0, 200)}...
        </p>
      </a>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {post.tags.map((tag) => (
            <a
              key={tag}
              href={`/community/tag/${tag}`}
              className="text-xs px-2 py-0.5 bg-warm-100 text-warm-600 rounded hover:bg-warm-200"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-100">
        <button className="flex items-center gap-1.5 text-warm-500 hover:text-success">
          <ThumbsUp className="h-4 w-4" />
          <span className="text-sm">{post.upvote_count}</span>
        </button>
        <button className="flex items-center gap-1.5 text-warm-500 hover:text-error">
          <ThumbsDown className="h-4 w-4" />
        </button>
        <a
          href={`/community/post/${post.id}#comments`}
          className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm">{post.comment_count}</span>
        </a>
        <button className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700 ml-auto">
          <Bookmark className="h-4 w-4" />
        </button>
        <button className="flex items-center gap-1.5 text-warm-500 hover:text-warm-700">
          <Share className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1-2 | Database schema, core API |
| Phase 2 | Week 3-4 | Post creation, comments, voting |
| Phase 3 | Week 5-6 | Reputation system, badges |
| Phase 4 | Week 7-8 | Moderation, vendor profiles |

---

*BuildDesk Feature Specification v1.0*
