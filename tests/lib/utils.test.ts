import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges simple class names', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const isDisabled = false
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      )
      
      expect(result).toBe('base-class active')
    })

    it('merges conflicting Tailwind classes correctly', () => {
      // twMerge should handle conflicting Tailwind classes
      const result = cn('p-4', 'p-6') // conflicting padding
      expect(result).toBe('p-6') // Should keep the last one
    })

    it('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('handles objects with conditional classes', () => {
      const result = cn({
        'base-class': true,
        'active': true,
        'disabled': false,
      })
      
      expect(result).toBe('base-class active')
    })

    it('handles undefined and null values', () => {
      const result = cn(
        'base-class',
        undefined,
        null,
        false && 'hidden',
        'visible'
      )
      
      expect(result).toBe('base-class visible')
    })

    it('handles duplicate classes', () => {
      const result = cn('class1', 'class2', 'class1', 'class3')
      // cn with clsx doesn't deduplicate by default, just merges
      expect(result).toBe('class1 class2 class1 class3')
    })

    it('handles complex Tailwind class conflicts', () => {
      const result = cn(
        'bg-red-500 text-white p-4',
        'bg-blue-500 p-6', // Conflicting bg and padding
        'hover:bg-green-500'
      )
      
      // Should resolve conflicts: blue background and p-6 should win
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('p-6')
      expect(result).toContain('text-white')
      expect(result).toContain('hover:bg-green-500')
      expect(result).not.toContain('bg-red-500')
      expect(result).not.toContain('p-4')
    })
  })
})