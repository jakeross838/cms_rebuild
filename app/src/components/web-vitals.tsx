'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { useCallback } from 'react'

/**
 * Web Vitals reporting component
 * Tracks LCP, FID, CLS, TTFB, INP metrics
 */
export function WebVitals(): null {
  useReportWebVitals(
    useCallback((metric: { name: string; value: number; id: string; rating: string }) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        const color =
          metric.rating === 'good'
            ? 'color: green'
            : metric.rating === 'needs-improvement'
              ? 'color: orange'
              : 'color: red'

        console.log(
          `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(1)} (${metric.rating})`,
          color
        )
      }

      // In production, send to analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        const body = JSON.stringify({
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
        })

        // Use sendBeacon for reliability (doesn't block page unload)
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/v1/metrics/web-vitals', body)
        }
      }
    }, [])
  )

  return null
}
