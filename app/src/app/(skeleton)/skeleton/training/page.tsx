'use client'

import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  Trophy,
  BookOpen,
  Video,
  Award,
  Calendar,
  Users,
  Star,
  Sparkles,
  ChevronRight,
  Lock,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const courses = [
  { title: 'RossOS Fundamentals', level: 'Beginner', modules: 8, duration: '2.5 hrs', progress: 100, status: 'complete', badge: 'Certified Fundamentals' },
  { title: 'Financial Management Mastery', level: 'Intermediate', modules: 12, duration: '4 hrs', progress: 75, status: 'in_progress', badge: 'Finance Expert' },
  { title: 'Advanced Reporting & Analytics', level: 'Advanced', modules: 10, duration: '3.5 hrs', progress: 40, status: 'in_progress', badge: 'Analytics Pro' },
  { title: 'Client Portal Administration', level: 'Intermediate', modules: 6, duration: '1.5 hrs', progress: 0, status: 'not_started', badge: 'Portal Specialist' },
  { title: 'AI Features Deep Dive', level: 'Advanced', modules: 8, duration: '3 hrs', progress: 0, status: 'not_started', badge: 'AI Power User' },
  { title: 'Field Operations & Daily Logs', level: 'Beginner', modules: 5, duration: '1.5 hrs', progress: 100, status: 'complete', badge: 'Field Operations' },
]

const certifications = [
  { name: 'RossOS Certified Administrator', earned: 'Jan 20, 2026', icon: '🏆', level: 'Gold' },
  { name: 'Financial Management Fundamentals', earned: 'Dec 15, 2025', icon: '🎓', level: 'Silver' },
  { name: 'Field Operations Specialist', earned: 'Feb 5, 2026', icon: '🛠️', level: 'Bronze' },
]

const upcomingWebinars = [
  { title: 'New Feature Walkthrough: Smart Scheduling', date: 'Feb 18, 2026', time: '2:00 PM ET', attendees: 124, instructor: 'Sarah Chen' },
  { title: 'Best Practices: Invoice Processing Workflows', date: 'Feb 25, 2026', time: '11:00 AM ET', attendees: 89, instructor: 'Mike Torres' },
  { title: 'Q&A: Advanced Custom Report Builder', date: 'Mar 4, 2026', time: '3:00 PM ET', attendees: 67, instructor: 'Lisa Park' },
]

export default function TrainingCertificationPage() {
  const completedCourses = courses.filter(c => c.status === 'complete').length
  const totalCourses = courses.length
  const totalHoursCompleted = courses.filter(c => c.status === 'complete').reduce((s, c) => s + parseFloat(c.duration), 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <GraduationCap className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Training & Certification</h1>
            <p className="text-sm text-muted-foreground">Module 47 -- Learn the platform, earn certifications, attend webinars</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1.5">
          <Play className="h-4 w-4" /> Resume Learning
        </button>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="h-4 w-4 text-blue-600" />Courses Completed</div>
          <div className="text-2xl font-bold mt-1">{completedCourses} / {totalCourses}</div>
          <div className="text-xs text-muted-foreground mt-1">{Math.round((completedCourses / totalCourses) * 100)}% complete</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4 text-green-600" />Hours Trained</div>
          <div className="text-2xl font-bold mt-1">{totalHoursCompleted}</div>
          <div className="text-xs text-muted-foreground mt-1">Across all courses</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4 text-amber-600" />Certifications</div>
          <div className="text-2xl font-bold mt-1">{certifications.length}</div>
          <div className="text-xs text-amber-600 mt-1">Badges earned</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Video className="h-4 w-4 text-purple-600" />Upcoming Webinars</div>
          <div className="text-2xl font-bold mt-1">{upcomingWebinars.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Available to register</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Course Grid */}
        <div className="col-span-2 bg-card border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Course Library</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Self-paced training modules with quizzes and certifications</p>
          </div>
          <div className="divide-y">
            {courses.map((course, i) => (
              <div key={i} className="p-4 flex items-center gap-4 hover:bg-muted/30">
                <div className="flex-shrink-0">
                  {course.status === 'complete' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : course.status === 'in_progress' ? (
                    <div className="relative h-6 w-6">
                      <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted" />
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500" strokeDasharray={`${course.progress * 0.628} 62.8`} />
                      </svg>
                    </div>
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    {course.title}
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', course.level === 'Beginner' ? 'bg-green-100 text-green-700' : course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700')}>{course.level}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{course.modules} modules -- {course.duration}</div>
                  {course.progress > 0 && course.progress < 100 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${course.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{course.progress}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {course.status === 'complete' && (
                    <span className="text-xs text-green-600 flex items-center gap-1"><Award className="h-3.5 w-3.5" />{course.badge}</span>
                  )}
                  {course.status === 'in_progress' && (
                    <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1">
                      <Play className="h-3.5 w-3.5" />Continue
                    </button>
                  )}
                  {course.status === 'not_started' && (
                    <button className="px-3 py-1.5 text-sm border rounded-lg text-muted-foreground hover:bg-accent">Start</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Certifications */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-600" />Your Certifications</h3>
            <div className="space-y-2">
              {certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-xl">{cert.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{cert.name}</div>
                    <div className="text-xs text-muted-foreground">Earned {cert.earned}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Webinars */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-purple-600" />Upcoming Webinars</h3>
            <div className="space-y-2">
              {upcomingWebinars.map((webinar, i) => (
                <div key={i} className="p-2.5 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium">{webinar.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{webinar.date} at {webinar.time}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{webinar.attendees} registered</span>
                    <button className="text-xs text-amber-600 font-medium hover:text-amber-700">Register</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <div className="font-medium text-amber-800">Learning Recommendation</div>
            <p className="text-sm text-amber-700 mt-1">You are using advanced reporting features frequently but have not completed the "Advanced Reporting & Analytics" course. Finishing it would unlock 12 power-user techniques that could save you 3+ hours per week. Your team members have an average training completion rate of 42% -- consider scheduling a group training session.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
