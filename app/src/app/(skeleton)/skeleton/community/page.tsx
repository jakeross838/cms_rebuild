'use client'

import {
  Users,
  MessageSquare,
  Award,
  Plus,
  TrendingUp,
  Star,
  CheckCircle,
  Sparkles,
} from 'lucide-react'

// Placeholder community preview - will be expanded later
export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-warm-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 font-display flex items-center gap-2">
              <Users className="h-6 w-6 text-stone-600" />
              BuildDesk Community
            </h1>
            <p className="text-warm-600 mt-1">Connect with other builders, share knowledge, and grow together</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-stone-700 text-white rounded-lg text-sm hover:bg-stone-800">
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Members</span>
              <Users className="h-4 w-4 text-stone-500" />
            </div>
            <p className="text-2xl font-semibold text-warm-800">2,847</p>
            <p className="text-xs text-success mt-1">+124 this month</p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Discussions</span>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-blue-600">1,423</p>
            <p className="text-xs text-warm-500 mt-1">89 active today</p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Your Reputation</span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-amber-600">847</p>
            <p className="text-xs text-warm-500 mt-1">Top 15%</p>
          </div>
          <div className="bg-warm-0 border border-warm-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-warm-500">Verified Vendors</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-green-600">312</p>
            <p className="text-xs text-warm-500 mt-1">In your area</p>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 text-center">
          <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-purple-800 mb-2">Community Features Coming Soon</h2>
          <p className="text-purple-700 mb-4">
            Connect with builders across companies, share best practices, and get vendor recommendations.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-purple-600">
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Discussion Forums
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Vendor Reviews
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Industry Insights
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
