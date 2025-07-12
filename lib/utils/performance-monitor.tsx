'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Activity, Clock, Zap } from 'lucide-react'

interface PerformanceMetrics {
  renderTime: number
  reRenderCount: number
  loadTime: number
  memoryUsage?: number
}

// Hook to measure component performance
export function usePerformanceMonitor(componentName: string, enabled = process.env.NODE_ENV === 'development') {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    reRenderCount: 0,
    loadTime: 0
  })

  useEffect(() => {
    if (!enabled) return

    const startTime = performance.now()
    let renderCount = 0

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('react')) {
          renderCount++
        }
      }
    })

    // Measure initial load time
    const loadTime = performance.now() - startTime

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      loadTime,
      reRenderCount: prev.reRenderCount + 1,
      renderTime: performance.now() - startTime
    }))

    // Log performance data in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        loadTime: `${loadTime.toFixed(2)}ms`,
        renderCount: renderCount,
        memoryUsage: 'memory' in performance ? `${((performance as typeof performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [componentName, enabled])

  return metrics
}

// Performance monitoring widget for development
export function PerformanceWidget({ 
  enabled = process.env.NODE_ENV === 'development' 
}: { 
  enabled?: boolean 
}) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    loadTime: 0,
    domNodes: 0
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: 'memory' in performance 
            ? Math.round((performance as typeof performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1024 / 1024)
            : 0,
          domNodes: document.querySelectorAll('*').length
        }))
        
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }

    measureFPS()

    // Toggle visibility with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [enabled])

  if (!enabled || !isVisible) {
    return enabled ? (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge 
          variant="outline" 
          className="cursor-pointer bg-black/80 text-white hover:bg-black"
          onClick={() => setIsVisible(true)}
        >
          <Monitor className="h-3 w-3 mr-1" />
          Performance (Ctrl+Shift+P)
        </Badge>
      </div>
    ) : null
  }

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-600'
    if (fps >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMemoryColor = (memory: number) => {
    if (memory < 50) return 'text-green-600'
    if (memory < 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Performance Monitor
            </span>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-blue-400" />
              <span>FPS:</span>
              <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-purple-400" />
              <span>Memory:</span>
              <span className={getMemoryColor(metrics.memoryUsage)}>
                {metrics.memoryUsage}MB
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-green-400" />
              <span>DOM:</span>
              <span className="text-gray-300">{metrics.domNodes}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Monitor className="h-3 w-3 text-orange-400" />
              <span>Load:</span>
              <span className="text-gray-300">{metrics.loadTime.toFixed(0)}ms</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// HOC for component performance monitoring
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  const WrappedComponent = (props: T) => {
    usePerformanceMonitor(componentName)
    
    return <Component {...props} />
  }
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return WrappedComponent
}

// Bundle size tracking utility
export class BundleSizeTracker {
  private static instance: BundleSizeTracker
  private bundleSizes: Map<string, number> = new Map()

  static getInstance() {
    if (!this.instance) {
      this.instance = new BundleSizeTracker()
    }
    return this.instance
  }

  trackChunk(chunkName: string, size: number) {
    this.bundleSizes.set(chunkName, size)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle] ${chunkName}: ${(size / 1024).toFixed(2)}KB`)
    }
  }

  getBundleSizes() {
    return Object.fromEntries(this.bundleSizes)
  }

  getTotalSize() {
    return Array.from(this.bundleSizes.values()).reduce((total, size) => total + size, 0)
  }
}