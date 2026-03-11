/**
 * AI Extraction Metrics
 *
 * GET /api/v2/invoices/extractions/metrics
 *
 * Returns accuracy metrics, correction rates, and throughput stats
 * derived from extraction records. Used by the AI Metrics dashboard.
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createApiHandler, type ApiContext } from '@/lib/api/middleware'
import { createServiceClient } from '@/lib/supabase/service'

export const GET = createApiHandler(
  async (_req: NextRequest, ctx: ApiContext) => {
    const supabase = createServiceClient()
    const companyId = ctx.companyId!

    // Fetch all extractions for this company
    const { data: extractions } = await supabase
      .from('invoice_extractions' as any)
      .select('status, confidence_score, extracted_data, created_at, reviewed_by, processing_time_ms')
      .eq('company_id', companyId)

    const all = (extractions ?? []) as Array<{
      status: string
      confidence_score: number | null
      extracted_data: Record<string, unknown> | null
      created_at: string
      reviewed_by: string | null
      processing_time_ms: number | null
    }>

    // Compute stats
    const totalExtractions = all.length
    const completedExtractions = all.filter(e => e.status === 'completed')
    const failedExtractions = all.filter(e => e.status === 'failed')
    const processingExtractions = all.filter(e => e.status === 'processing')
    const reviewedExtractions = completedExtractions.filter(e => e.reviewed_by)

    // Correction stats — count extractions that had corrections applied
    let totalCorrections = 0
    let extractionsWithCorrections = 0
    const fieldCorrectionCounts: Record<string, number> = {}

    for (const ext of all) {
      const meta = (ext.extracted_data?._meta ?? {}) as Record<string, unknown>
      const corrections = meta.corrections as Array<{ field: string }> | undefined
      if (corrections?.length) {
        extractionsWithCorrections++
        totalCorrections += corrections.length
        for (const c of corrections) {
          fieldCorrectionCounts[c.field] = (fieldCorrectionCounts[c.field] || 0) + 1
        }
      }
    }

    // Anomaly stats — count extractions with anomalies flagged
    let extractionsWithAnomalies = 0
    const anomalyTypeCounts: Record<string, number> = {}

    for (const ext of all) {
      const meta = (ext.extracted_data?._meta ?? {}) as Record<string, unknown>
      const anomalyCheck = meta.anomaly_check as { has_anomalies?: boolean; flags?: Array<{ type: string }> } | undefined
      if (anomalyCheck?.has_anomalies) {
        extractionsWithAnomalies++
        if (anomalyCheck.flags) {
          for (const flag of anomalyCheck.flags) {
            anomalyTypeCounts[flag.type] = (anomalyTypeCounts[flag.type] || 0) + 1
          }
        }
      }
    }

    // Confidence distribution
    const confidenceScores = all
      .filter(e => typeof e.confidence_score === 'number')
      .map(e => e.confidence_score as number)
    const avgConfidence = confidenceScores.length > 0
      ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
      : null
    const highConfidenceCount = confidenceScores.filter(s => s >= 90).length
    const mediumConfidenceCount = confidenceScores.filter(s => s >= 70 && s < 90).length
    const lowConfidenceCount = confidenceScores.filter(s => s < 70).length

    // Processing time stats
    const processingTimes = all
      .filter(e => typeof e.processing_time_ms === 'number' && e.processing_time_ms > 0)
      .map(e => e.processing_time_ms as number)
    const avgProcessingTime = processingTimes.length > 0
      ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
      : null

    // Monthly trend (last 6 months)
    const now = new Date()
    const monthlyTrend: Array<{ month: string; total: number; reviewed: number; corrected: number; avgConfidence: number | null }> = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = d.toISOString()
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      const monthExtractions = all.filter(e => e.created_at >= monthStart && e.created_at < monthEnd)
      const monthReviewed = monthExtractions.filter(e => e.reviewed_by)
      const monthCorrected = monthExtractions.filter(e => {
        const meta = (e.extracted_data?._meta ?? {}) as Record<string, unknown>
        return (meta.corrections as unknown[])?.length > 0
      })
      const monthScores = monthExtractions
        .filter(e => typeof e.confidence_score === 'number')
        .map(e => e.confidence_score as number)

      monthlyTrend.push({
        month: monthLabel,
        total: monthExtractions.length,
        reviewed: monthReviewed.length,
        corrected: monthCorrected.length,
        avgConfidence: monthScores.length > 0
          ? Math.round(monthScores.reduce((a, b) => a + b, 0) / monthScores.length)
          : null,
      })
    }

    // Top corrected fields
    const topCorrectedFields = Object.entries(fieldCorrectionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([field, count]) => ({ field, count }))

    // Accuracy rate: extractions confirmed without corrections / total reviewed
    const accuracyRate = reviewedExtractions.length > 0
      ? Math.round(((reviewedExtractions.length - extractionsWithCorrections) / reviewedExtractions.length) * 100)
      : null

    return NextResponse.json({
      data: {
        summary: {
          totalExtractions,
          completed: completedExtractions.length,
          failed: failedExtractions.length,
          processing: processingExtractions.length,
          reviewed: reviewedExtractions.length,
          accuracyRate,
          avgConfidence,
          avgProcessingTimeMs: avgProcessingTime,
        },
        corrections: {
          totalCorrections,
          extractionsWithCorrections,
          correctionRate: reviewedExtractions.length > 0
            ? Math.round((extractionsWithCorrections / reviewedExtractions.length) * 100)
            : null,
          topCorrectedFields,
        },
        confidenceDistribution: {
          high: highConfidenceCount,
          medium: mediumConfidenceCount,
          low: lowConfidenceCount,
        },
        anomalies: {
          totalFlagged: extractionsWithAnomalies,
          byType: Object.entries(anomalyTypeCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => ({ type, count })),
        },
        monthlyTrend,
      },
      requestId: ctx.requestId,
    })
  },
  { requireAuth: true, rateLimit: 'api', requiredRoles: ['owner', 'admin', 'pm'] }
)
