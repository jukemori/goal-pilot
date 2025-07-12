# Performance Monitoring & Optimization

This document outlines the performance monitoring tools and optimization strategies implemented in Goal Pilot.

## 🔧 Performance Tools

### Bundle Analyzer
Analyze bundle sizes and dependencies to identify optimization opportunities.

```bash
# Run bundle analysis
bun run analyze

# This will:
# 1. Build the application with analysis enabled
# 2. Open bundle analyzer in your browser
# 3. Show detailed breakdown of chunk sizes
```

### Development Performance Monitor
Real-time performance monitoring widget available in development mode.

**Features:**
- Real-time FPS monitoring
- Memory usage tracking
- DOM node count
- Bundle size information

**Usage:**
- Automatically enabled in development mode
- Press `Ctrl+Shift+P` to toggle visibility
- View performance metrics in bottom-right corner

### Webpack Performance Plugin
Custom webpack plugin that provides detailed build-time analysis.

**Provides:**
- Asset size analysis
- Chunk composition breakdown
- Large module identification
- Performance recommendations

## 📊 Performance Metrics

### Current Bundle Sizes
- `/goals/[id]`: ~278 kB (includes dynamic imports)
- `/calendar`: ~180 kB (with lazy loading)
- `/goals`: ~165 kB (optimized templates)
- `/dashboard`: ~105 kB (lightweight)

### Optimization Strategies Implemented

#### 1. Code Splitting
- Dynamic imports for heavy components
- Route-based splitting
- Component-level lazy loading

```typescript
// Example: Lazy loaded components
const RoadmapView = dynamic(() => import('@/components/organisms/roadmap-view/roadmap-view'), {
  loading: () => <RoadmapSkeleton />
})
```

#### 2. Bundle Optimization
- Separate chunks for UI libraries (`@radix-ui`, `lucide-react`)
- Vendor chunk splitting (max 244KB)
- Utility library grouping

#### 3. Performance Monitoring
- Component render time tracking
- Memory usage monitoring
- FPS performance tracking
- Bundle size analysis

#### 4. Caching Strategies
- React Query with optimized cache times
- 5-minute stale time for data
- 10-minute garbage collection time

## 🎯 Performance Recommendations

### For Developers

1. **Monitor Bundle Size**
   ```bash
   bun run analyze  # Run this regularly
   ```

2. **Use Performance Widget**
   - Keep FPS above 30 (ideally 60)
   - Monitor memory usage < 100MB
   - Watch for memory leaks

3. **Component Optimization**
   ```typescript
   // Use performance monitoring for heavy components
   import { usePerformanceMonitor } from '@/lib/utils/performance-monitor'
   
   function HeavyComponent() {
     const metrics = usePerformanceMonitor('HeavyComponent')
     // Component logic...
   }
   ```

4. **Bundle Analysis**
   - Review large assets (>250KB)
   - Identify unused dependencies
   - Optimize import strategies

### For Production

1. **Core Web Vitals Targets**
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

2. **Bundle Size Targets**
   - Initial JS bundle: < 200KB
   - Total page size: < 500KB
   - CSS bundle: < 50KB

3. **Performance Budget**
   - JavaScript: 300KB total
   - Images: 500KB total
   - Fonts: 100KB total

## 📋 Performance Checklist

### Before Each Release

- [ ] Run `bun run analyze` and review bundle sizes
- [ ] Check for new large dependencies
- [ ] Verify code splitting is working correctly
- [ ] Test performance on slower devices
- [ ] Review Core Web Vitals in production

### Ongoing Monitoring

- [ ] Monitor bundle size growth over time
- [ ] Track performance metrics in development
- [ ] Review webpack analysis reports
- [ ] Optimize based on real user data

## 🔍 Debugging Performance Issues

### Common Issues & Solutions

1. **Large Bundle Size**
   - Use bundle analyzer to identify heavy dependencies
   - Implement code splitting for large components
   - Consider alternative lighter libraries

2. **Memory Leaks**
   - Use performance widget to monitor memory growth
   - Check for proper cleanup in useEffect
   - Review event listener management

3. **Slow Rendering**
   - Use React DevTools Profiler
   - Implement proper memoization
   - Review component re-render patterns

### Performance Testing

```bash
# Local performance testing
bun run dev  # Enable performance widget with Ctrl+Shift+P

# Bundle analysis
bun run analyze

# Build and analyze
bun run build && bun run analyze
```

## 📚 Additional Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit#performance)
- [Web Vitals](https://web.dev/vitals/)
- [Bundle Analysis Guide](https://webpack.js.org/guides/bundle-analysis/)