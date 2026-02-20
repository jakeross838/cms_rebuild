# Daily/Weekly/Monthly Content Feature Specification

**Priority:** 5 - Future
**Dependencies:** Communications, Plaude AI
**Status:** Planning

---

## Overview

Content publishing system for sharing articles, industry news, tips, and updates with BuildDesk users. Includes automated content curation, personalization based on role/activity, and engagement tracking.

---

## User Stories

1. **As a user**, I want to see relevant construction industry news and tips
2. **As a PM**, I want content tailored to project management best practices
3. **As a company admin**, I want to share company-specific announcements
4. **As a user**, I want to bookmark and share useful articles
5. **As BuildDesk**, we want to drive engagement through valuable content

---

## Database Schema

```sql
-- Content articles
CREATE TABLE content_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authorship
  author_type TEXT NOT NULL, -- 'staff', 'company', 'guest', 'ai_generated'
  author_id UUID,
  author_name TEXT NOT NULL,
  author_bio TEXT,
  author_avatar_url TEXT,

  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  content_html TEXT,

  -- Featured image
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Categorization
  category TEXT NOT NULL, -- 'news', 'tips', 'case_study', 'product_update', 'industry_trends'
  tags TEXT[] DEFAULT '{}',
  target_roles TEXT[] DEFAULT '{}', -- ['pm', 'estimator', 'owner', 'field']

  -- Targeting
  target_company_ids UUID[], -- NULL = all companies
  target_plan_types TEXT[], -- ['starter', 'professional', 'enterprise']

  -- Publishing
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'archived'
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Frequency tagging
  frequency_type TEXT, -- 'daily_tip', 'weekly_digest', 'monthly_roundup', 'breaking'

  -- Engagement stats
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  read_time_avg_seconds INTEGER,
  bookmark_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,

  -- AI metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  ai_prompt_used TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content series (for grouped content)
CREATE TABLE content_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,

  -- Ordering
  article_count INTEGER DEFAULT 0,

  -- Targeting
  target_roles TEXT[] DEFAULT '{}',

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Series membership
CREATE TABLE content_series_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  series_id UUID NOT NULL REFERENCES content_series(id),
  article_id UUID NOT NULL REFERENCES content_articles(id),

  sequence_number INTEGER NOT NULL,

  UNIQUE(series_id, article_id),
  UNIQUE(series_id, sequence_number)
);

-- User content engagement
CREATE TABLE content_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id),
  article_id UUID NOT NULL REFERENCES content_articles(id),

  -- Engagement metrics
  viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  read_time_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0,

  liked BOOLEAN DEFAULT false,
  liked_at TIMESTAMPTZ,

  bookmarked BOOLEAN DEFAULT false,
  bookmarked_at TIMESTAMPTZ,

  shared BOOLEAN DEFAULT false,
  shared_at TIMESTAMPTZ,
  shared_via TEXT, -- 'email', 'copy_link', 'slack'

  -- Reading progress
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, article_id)
);

-- Content preferences
CREATE TABLE content_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL UNIQUE REFERENCES users(id),

  -- Interests
  preferred_categories TEXT[] DEFAULT '{}',
  preferred_tags TEXT[] DEFAULT '{}',

  -- Delivery
  daily_tips_enabled BOOLEAN DEFAULT true,
  weekly_digest_enabled BOOLEAN DEFAULT true,
  monthly_roundup_enabled BOOLEAN DEFAULT true,
  breaking_news_enabled BOOLEAN DEFAULT true,

  -- Channels
  in_app_notifications BOOLEAN DEFAULT true,
  email_content BOOLEAN DEFAULT false,
  email_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'

  -- Time preferences
  preferred_delivery_time TEXT DEFAULT '08:00', -- Local time

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled content deliveries
CREATE TABLE content_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Delivery type
  delivery_type TEXT NOT NULL, -- 'daily_tip', 'weekly_digest', 'monthly_roundup'

  -- Content
  articles JSONB NOT NULL, -- [{ article_id, title, excerpt, url }]
  subject TEXT,
  preview_text TEXT,

  -- Recipients
  recipient_count INTEGER DEFAULT 0,

  -- Timing
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sending', 'sent', 'failed'

  -- Stats (populated after send)
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company announcements
CREATE TABLE company_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,

  -- Priority
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_pinned BOOLEAN DEFAULT false,

  -- Targeting
  target_roles TEXT[], -- NULL = all
  target_job_ids UUID[], -- Specific jobs

  -- Publishing
  published_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Acknowledgment
  require_acknowledgment BOOLEAN DEFAULT false,
  acknowledgment_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement acknowledgments
CREATE TABLE announcement_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  announcement_id UUID NOT NULL REFERENCES company_announcements(id),
  user_id UUID NOT NULL REFERENCES users(id),

  acknowledged_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(announcement_id, user_id)
);

-- Indexes
CREATE INDEX idx_content_articles_status ON content_articles(status) WHERE status = 'published';
CREATE INDEX idx_content_articles_category ON content_articles(category);
CREATE INDEX idx_content_articles_frequency ON content_articles(frequency_type);
CREATE INDEX idx_content_engagement_user ON content_engagement(user_id);
CREATE INDEX idx_content_engagement_article ON content_engagement(article_id);
CREATE INDEX idx_company_announcements ON company_announcements(company_id, published_at DESC);
```

---

## Content Generation & Curation

### AI Content Generation

```typescript
// lib/content/ai-content-generator.ts

interface ContentPrompt {
  type: 'daily_tip' | 'weekly_digest' | 'monthly_roundup' | 'article'
  topic?: string
  targetRoles?: string[]
  maxWords?: number
}

export async function generateContent(prompt: ContentPrompt): Promise<GeneratedContent> {
  const systemPrompt = buildContentSystemPrompt(prompt)

  const content = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: prompt.maxWords ? prompt.maxWords * 2 : 2000,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: buildContentUserPrompt(prompt)
    }]
  })

  const parsed = parseGeneratedContent(content.content[0].text)

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    tags: parsed.suggestedTags,
    aiGenerated: true,
    aiModelUsed: 'claude-3-opus-20240229',
  }
}

function buildContentSystemPrompt(prompt: ContentPrompt): string {
  const roleContext = prompt.targetRoles?.length
    ? `Writing for construction professionals in these roles: ${prompt.targetRoles.join(', ')}.`
    : 'Writing for general construction industry professionals.'

  switch (prompt.type) {
    case 'daily_tip':
      return `You are a construction industry expert writing daily tips for BuildDesk users.
${roleContext}

Guidelines:
- Keep tips actionable and specific
- Include a clear takeaway
- Reference real industry practices
- Keep under 200 words
- Be practical, not theoretical`

    case 'weekly_digest':
      return `You are curating a weekly digest of construction industry insights.
${roleContext}

Include:
- Industry news summary (3-5 items)
- One in-depth tip or best practice
- Tool or technique spotlight
- Upcoming trends to watch`

    case 'monthly_roundup':
      return `You are writing a monthly industry roundup for construction professionals.
${roleContext}

Include:
- Major industry developments
- Market trends and forecasts
- Technology updates
- Regulatory changes
- Success stories and lessons learned`

    default:
      return `You are a construction industry content writer creating valuable content.
${roleContext}

Write in a professional but approachable tone.
Include practical examples and actionable insights.`
  }
}

// Daily tip generator
export async function generateDailyTip(
  targetRoles?: string[]
): Promise<GeneratedContent> {
  // Get recent tips to avoid repetition
  const recentTips = await getRecentTips(30)
  const recentTopics = recentTips.map(t => t.topic)

  // Get trending topics from community
  const trendingTopics = await getTrendingCommunityTopics()

  const tip = await generateContent({
    type: 'daily_tip',
    targetRoles,
    topic: selectNewTopic(trendingTopics, recentTopics),
  })

  return tip
}
```

### Content Personalization

```typescript
// lib/content/personalization.ts

interface PersonalizedFeed {
  featured: Article[]
  forYou: Article[]
  trending: Article[]
  newInCategory: Article[]
}

export async function getPersonalizedFeed(
  userId: string
): Promise<PersonalizedFeed> {
  const user = await getUser(userId)
  const preferences = await getContentPreferences(userId)
  const engagement = await getUserEngagementHistory(userId)

  // Build user profile
  const userProfile = {
    role: user.role,
    preferredCategories: preferences.preferred_categories,
    preferredTags: preferences.preferred_tags,
    readCategories: groupBy(engagement.read, 'category'),
    avgReadTime: engagement.avgReadTime,
    likedArticles: engagement.liked,
  }

  // Get content pools
  const allContent = await getPublishedArticles({ limit: 100 })

  // Score and rank content
  const scoredContent = allContent.map(article => ({
    article,
    score: calculateRelevanceScore(article, userProfile),
  }))

  scoredContent.sort((a, b) => b.score - a.score)

  // Filter out already read
  const unread = scoredContent.filter(
    ({ article }) => !engagement.viewed.includes(article.id)
  )

  return {
    featured: allContent.filter(a => a.is_featured).slice(0, 3),
    forYou: unread.slice(0, 10).map(s => s.article),
    trending: allContent
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5),
    newInCategory: allContent
      .filter(a => userProfile.preferredCategories.includes(a.category))
      .slice(0, 5),
  }
}

function calculateRelevanceScore(
  article: Article,
  profile: UserProfile
): number {
  let score = 0

  // Role match
  if (article.target_roles?.includes(profile.role)) {
    score += 30
  }

  // Category preference
  if (profile.preferredCategories.includes(article.category)) {
    score += 25
  }

  // Tag overlap
  const tagOverlap = article.tags.filter(t =>
    profile.preferredTags.includes(t)
  ).length
  score += tagOverlap * 10

  // Similar to liked content
  const similarToLiked = article.tags.some(t =>
    profile.likedArticles.some(liked => liked.tags.includes(t))
  )
  if (similarToLiked) score += 15

  // Recency bonus
  const ageInDays = daysSince(article.published_at)
  if (ageInDays < 1) score += 20
  else if (ageInDays < 7) score += 10
  else if (ageInDays < 30) score += 5

  // Popularity signal
  if (article.view_count > 1000) score += 10
  if (article.like_count > 100) score += 5

  return score
}
```

---

## Delivery System

### Weekly Digest Generator

```typescript
// lib/content/digest-generator.ts

interface DigestContent {
  subject: string
  previewText: string
  sections: DigestSection[]
  articles: ArticleSummary[]
}

interface DigestSection {
  title: string
  articles: ArticleSummary[]
}

export async function generateWeeklyDigest(): Promise<DigestContent> {
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  // Get top articles from the week
  const topArticles = await getArticles({
    publishedAfter: weekStart,
    publishedBefore: weekEnd,
    orderBy: 'engagement_score',
    limit: 10,
  })

  // Group by category
  const byCategory = groupBy(topArticles, 'category')

  // Get personalized tips
  const tips = topArticles.filter(a => a.frequency_type === 'daily_tip')

  // Build sections
  const sections: DigestSection[] = [
    {
      title: 'Top Stories This Week',
      articles: topArticles.slice(0, 3).map(articleToSummary),
    },
    {
      title: 'Best Tips',
      articles: tips.slice(0, 3).map(articleToSummary),
    },
  ]

  // Add category sections
  for (const [category, articles] of Object.entries(byCategory)) {
    if (articles.length >= 2) {
      sections.push({
        title: `In ${categoryLabels[category]}`,
        articles: articles.slice(0, 2).map(articleToSummary),
      })
    }
  }

  // Generate AI summary
  const aiSummary = await generateDigestSummary(topArticles)

  return {
    subject: `BuildDesk Weekly: ${aiSummary.headline}`,
    previewText: aiSummary.previewText,
    sections,
    articles: topArticles.map(articleToSummary),
  }
}

// Schedule and send digest
export async function sendWeeklyDigest(): Promise<void> {
  const digest = await generateWeeklyDigest()

  // Get all users who want weekly digest
  const recipients = await getUsersForDigest('weekly')

  // Create delivery record
  const { data: delivery } = await supabase.from('content_deliveries').insert({
    delivery_type: 'weekly_digest',
    articles: digest.articles,
    subject: digest.subject,
    preview_text: digest.previewText,
    scheduled_for: new Date().toISOString(),
    recipient_count: recipients.length,
    status: 'sending',
  }).select().single()

  // Send in batches
  const batchSize = 100
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    await Promise.all(batch.map(async (user) => {
      // Personalize content order
      const personalizedSections = await personalizeSections(
        digest.sections,
        user.id
      )

      // Send email
      await sendEmail({
        to: user.email,
        subject: digest.subject,
        template: 'weekly-digest',
        data: {
          userName: user.name,
          sections: personalizedSections,
          previewText: digest.previewText,
        },
      })
    }))
  }

  // Mark as sent
  await supabase.from('content_deliveries').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
  }).eq('id', delivery.id)
}
```

---

## UI Components

```tsx
// components/content/content-feed.tsx

'use client'

import { useState } from 'react'
import {
  Newspaper, Lightbulb, TrendingUp, Clock, Bookmark,
  Heart, Share2, ExternalLink
} from 'lucide-react'

export function ContentFeed() {
  const { feed, isLoading } = usePersonalizedFeed()
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'saved'>('forYou')

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-warm-200">
        {[
          { id: 'forYou', label: 'For You', icon: Lightbulb },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'saved', label: 'Saved', icon: Bookmark },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-stone-700 text-stone-700'
                : 'border-transparent text-warm-500 hover:text-warm-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {feed?.featured?.[0] && activeTab === 'forYou' && (
        <FeaturedArticleCard article={feed.featured[0]} />
      )}

      {/* Article list */}
      <div className="space-y-4">
        {(activeTab === 'forYou' ? feed?.forYou : feed?.trending)?.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={`/content/${article.slug}`}
      className="block mb-8 rounded-xl overflow-hidden border border-warm-200 bg-warm-0 hover:border-stone-300 transition-colors"
    >
      {article.featured_image_url && (
        <div className="aspect-video bg-warm-100">
          <img
            src={article.featured_image_url}
            alt={article.featured_image_alt || article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 bg-stone-700 text-white rounded-full">
            Featured
          </span>
          <span className="text-xs text-warm-500">{article.category}</span>
        </div>
        <h2 className="text-xl font-semibold text-warm-800 mb-2">{article.title}</h2>
        <p className="text-warm-600 mb-4">{article.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-warm-500">
          <div className="flex items-center gap-4">
            <span>{article.author_name}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {estimateReadTime(article.content)} min read
            </span>
          </div>
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>
    </a>
  )
}

function ArticleCard({ article }: { article: Article }) {
  const { toggleBookmark, isBookmarked } = useBookmark(article.id)
  const { toggleLike, isLiked, likeCount } = useLike(article.id)

  return (
    <div className="flex gap-4 p-4 bg-warm-0 border border-warm-200 rounded-xl hover:border-stone-300 transition-colors">
      {article.featured_image_url && (
        <div className="w-32 h-24 rounded-lg bg-warm-100 flex-shrink-0 overflow-hidden">
          <img
            src={article.featured_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-warm-500">{article.category}</span>
          {article.frequency_type === 'daily_tip' && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
              Tip
            </span>
          )}
        </div>

        <a href={`/content/${article.slug}`}>
          <h3 className="font-medium text-warm-800 hover:text-stone-700 line-clamp-2">
            {article.title}
          </h3>
        </a>

        <p className="text-sm text-warm-600 mt-1 line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-xs text-warm-500">
            <span>{article.author_name}</span>
            <span>{formatRelativeTime(article.published_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike()}
              className={`p-1.5 rounded-lg ${isLiked ? 'text-error' : 'text-warm-400 hover:text-warm-600'}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => toggleBookmark()}
              className={`p-1.5 rounded-lg ${isBookmarked ? 'text-stone-700' : 'text-warm-400 hover:text-warm-600'}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-1.5 rounded-lg text-warm-400 hover:text-warm-600">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Daily Tip Widget

```tsx
// components/content/daily-tip-widget.tsx

'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, X, ChevronRight, Bookmark } from 'lucide-react'

export function DailyTipWidget() {
  const { tip, isLoading, dismiss, markRead } = useDailyTip()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!tip || tip.dismissed) return null

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-200 rounded-lg">
          <Lightbulb className="h-5 w-5 text-amber-700" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-amber-700">Daily Tip</span>
            <button
              onClick={dismiss}
              className="p-1 text-amber-600 hover:text-amber-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h4 className="font-medium text-warm-800">{tip.title}</h4>

          {isExpanded ? (
            <div className="mt-2 text-sm text-warm-700 whitespace-pre-line">
              {tip.content}
            </div>
          ) : (
            <p className="mt-1 text-sm text-warm-600 line-clamp-2">{tip.excerpt}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => {
                setIsExpanded(!isExpanded)
                if (!isExpanded) markRead()
              }}
              className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'Read more'}
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            <button className="text-sm text-warm-500 hover:text-warm-700 flex items-center gap-1">
              <Bookmark className="h-3.5 w-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Implementation Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1-2 | Database schema, article CRUD |
| Phase 2 | Week 3-4 | AI content generation, personalization |
| Phase 3 | Week 5-6 | Digest system, email delivery |
| Phase 4 | Week 7-8 | UI components, engagement tracking |

---

*BuildDesk Feature Specification v1.0*
