import { describe, it, expect } from 'vitest'
import { cn, formatCurrency } from './utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge basic class names', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should merge conflicting Tailwind classes properly', () => {
      // tailwind-merge should handle conflicts, keeping the last one
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn(null, undefined, false)).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('should format different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toMatch(/€/)
      expect(formatCurrency(1234.56, 'GBP', 'en-GB')).toMatch(/£/)
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-100)
      expect(result).toMatch(/-/)
      expect(result).toMatch(/100/)
    })

    it('should handle very large numbers', () => {
      const result = formatCurrency(1000000)
      expect(result).toContain('1,000,000')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrency(1.1)).toBe('$1.10')
      expect(formatCurrency(1.99)).toBe('$1.99')
    })
  })
})