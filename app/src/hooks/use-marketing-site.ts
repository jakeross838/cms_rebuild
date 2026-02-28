'use client'

/**
 * Module 50: Marketing Website & Sales Pipeline React Query Hooks
 *
 * Covers marketing leads, referrals, testimonials, case studies, and blog posts.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  MarketingLead,
  MarketingReferral,
  Testimonial,
  CaseStudy,
  BlogPost,
} from '@/types/marketing-website'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Marketing Leads ──────────────────────────────────────────────────────────

type LeadListParams = {
  page?: number
  limit?: number
  source?: string
  pipeline_stage?: string
  assigned_to?: string
  q?: string
}

type LeadCreateInput = {
  name: string
  email: string
  source: string
  company_name?: string | null
  phone?: string | null
  company_size?: string | null
  current_tools?: string | null
  pipeline_stage?: string
  assigned_to?: string | null
  deal_value?: number
  close_probability?: number
  notes?: string | null
}

const leadHooks = createApiHooks<LeadListParams, LeadCreateInput>(
  'marketing-leads',
  '/api/v2/marketing-site/leads'
)

export const useMarketingLeads = leadHooks.useList
export const useMarketingLead = leadHooks.useDetail
export const useCreateMarketingLead = leadHooks.useCreate
export const useUpdateMarketingLead = leadHooks.useUpdate
export const useDeleteMarketingLead = leadHooks.useDelete

// ── Referrals ────────────────────────────────────────────────────────────────

type ReferralListParams = {
  page?: number
  limit?: number
  status?: string
  q?: string
}

type ReferralCreateInput = {
  referral_code: string
  referred_email: string
  referred_company_name?: string | null
  referrer_credit?: number
  notes?: string | null
}

const referralHooks = createApiHooks<ReferralListParams, ReferralCreateInput>(
  'referrals',
  '/api/v2/marketing-site/referrals'
)

export const useReferrals = referralHooks.useList
export const useReferral = referralHooks.useDetail
export const useCreateReferral = referralHooks.useCreate
export const useUpdateReferral = referralHooks.useUpdate
export const useDeleteReferral = referralHooks.useDelete

// ── Testimonials ─────────────────────────────────────────────────────────────

type TestimonialListParams = {
  page?: number
  limit?: number
  is_approved?: boolean
  is_featured?: boolean
  q?: string
}

type TestimonialCreateInput = {
  contact_name: string
  quote_text: string
  contact_title?: string | null
  company_display_name?: string | null
  rating?: number | null
  video_url?: string | null
  photo_url?: string | null
  is_approved?: boolean
  is_featured?: boolean
  display_on?: string[]
}

const testimonialHooks = createApiHooks<TestimonialListParams, TestimonialCreateInput>(
  'testimonials',
  '/api/v2/marketing-site/testimonials'
)

export const useTestimonials = testimonialHooks.useList
export const useTestimonial = testimonialHooks.useDetail
export const useCreateTestimonial = testimonialHooks.useCreate
export const useUpdateTestimonial = testimonialHooks.useUpdate
export const useDeleteTestimonial = testimonialHooks.useDelete

// ── Case Studies ─────────────────────────────────────────────────────────────

type CaseStudyListParams = {
  page?: number
  limit?: number
  is_published?: boolean
  q?: string
}

type CaseStudyCreateInput = {
  title: string
  slug: string
  company_name?: string | null
  company_size?: string | null
  challenge?: string | null
  solution?: string | null
  results?: string | null
  metrics?: Record<string, unknown>
  quote_text?: string | null
  quote_author?: string | null
  industry_tags?: string[]
  region_tags?: string[]
  is_published?: boolean
}

const caseStudyHooks = createApiHooks<CaseStudyListParams, CaseStudyCreateInput>(
  'case-studies',
  '/api/v2/marketing-site/case-studies'
)

export const useCaseStudies = caseStudyHooks.useList
export const useCaseStudy = caseStudyHooks.useDetail
export const useCreateCaseStudy = caseStudyHooks.useCreate
export const useUpdateCaseStudy = caseStudyHooks.useUpdate
export const useDeleteCaseStudy = caseStudyHooks.useDelete

// ── Blog Posts ───────────────────────────────────────────────────────────────

type BlogPostListParams = {
  page?: number
  limit?: number
  category?: string
  is_published?: boolean
  q?: string
}

type BlogPostCreateInput = {
  title: string
  slug: string
  category: string
  excerpt?: string | null
  body_html?: string | null
  author_name?: string | null
  tags?: string[]
  featured_image?: string | null
  meta_title?: string | null
  meta_description?: string | null
  is_published?: boolean
}

const blogPostHooks = createApiHooks<BlogPostListParams, BlogPostCreateInput>(
  'blog-posts',
  '/api/v2/marketing-site/blog-posts'
)

export const useBlogPosts = blogPostHooks.useList
export const useBlogPost = blogPostHooks.useDetail
export const useCreateBlogPost = blogPostHooks.useCreate
export const useUpdateBlogPost = blogPostHooks.useUpdate
export const useDeleteBlogPost = blogPostHooks.useDelete

// ── Re-export types ──────────────────────────────────────────────────────────

export type { MarketingLead, MarketingReferral, Testimonial, CaseStudy, BlogPost }
