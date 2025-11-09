'use client'
import { logger } from '@/lib/utils/logger'

import { PerformanceWidget } from '@/lib/utils/performance-monitor'
import { useEffect } from 'react'

export function PerformanceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Initialize performance tracking
    if (process.env.NODE_ENV === 'development') {
      // Log Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming
            logger.debug('[Performance] Navigation Timing', {
              domContentLoaded: `${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`,
              loadComplete: `${nav.loadEventEnd - nav.loadEventStart}ms`,
              firstByte: `${nav.responseStart - nav.requestStart}ms`,
              domInteractive: `${nav.domInteractive - nav.fetchStart}ms`,
            })
          }

          if (entry.entryType === 'paint') {
            logger.debug(`[Performance] ${entry.name}`, {
              time: `${entry.startTime.toFixed(2)}ms`
            })
          }

          if (entry.entryType === 'largest-contentful-paint') {
            logger.debug('[Performance] LCP', { time: `${entry.startTime.toFixed(2)}ms` })
          }
        }
      })

      observer.observe({
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint'],
      })

      // Track bundle size if available
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType(
          'resource',
        ) as PerformanceResourceTiming[]
        const jsResources = resources.filter((r) => r.name.includes('.js'))
        const totalJSSize = jsResources.reduce(
          (total: number, r) => total + (r.transferSize || 0),
          0,
        )

        logger.debug('[Performance] JavaScript Bundle Size', {
          size: `${(totalJSSize / 1024).toFixed(2)}KB`
        })
      }

      return () => observer.disconnect()
    }
  }, [])

  return (
    <>
      {children}
      <PerformanceWidget />
    </>
  )
}
