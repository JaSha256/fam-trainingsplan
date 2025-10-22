/**
 * AUFGABE 3: Semantische Farbkodierung - WCAG AAA Contrast Tests
 *
 * Critical UX Foundation Task - Tests color contrast ratios for accessibility
 * Requirements: WCAG AAA (7:1 contrast) for all training type badges
 *
 * @see docs/UX-MASTERWORK-PROMPT.md lines 826-843
 */

import { describe, it, expect } from 'vitest'

// WCAG AAA requires 7:1 contrast for normal text
const WCAG_AAA_RATIO = 7.0

/**
 * Helper: Convert hex color to RGB array
 * @param {string} hex - Hex color code (e.g., "#E3F2FD")
 * @returns {number[]} RGB array [r, g, b]
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

/**
 * Helper: Calculate relative luminance
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {number} Relative luminance
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Helper: Calculate contrast ratio between two colors
 * @param {number[]} color1 - RGB array [r, g, b]
 * @param {number[]} color2 - RGB array [r, g, b]
 * @returns {number} Contrast ratio
 */
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(...color1)
  const l2 = getLuminance(...color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('AUFGABE 3: Semantische Farbkodierung - WCAG AAA Contrast', () => {
  // Light mode color values from training-colors.css
  const colors = {
    light: {
      parkour: { bg: '#E3F2FD', text: '#0D47A1' },
      trampolin: { bg: '#E8F5E9', text: '#194D1B' },
      tricking: { bg: '#F3E5F5', text: '#4A148C' },
      movement: { bg: '#FFF3E0', text: '#8D2600' },
      fam: { bg: '#FCE4EC', text: '#880E4F' }
    },
    dark: {
      parkour: { bg: '#0D47A1', text: '#E3F2FD' },
      trampolin: { bg: '#194D1B', text: '#E8F5E9' },
      tricking: { bg: '#4A148C', text: '#F3E5F5' },
      movement: { bg: '#8D2600', text: '#FFF3E0' },
      fam: { bg: '#880E4F', text: '#FCE4EC' }
    }
  }

  describe('Light Mode Contrast Ratios', () => {
    Object.entries(colors.light).forEach(([type, { bg, text }]) => {
      it(`${type} badge should have ≥7:1 contrast (WCAG AAA)`, () => {
        const bgRgb = hexToRgb(bg)
        const textRgb = hexToRgb(text)
        const ratio = getContrastRatio(bgRgb, textRgb)

        expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_RATIO)
      })
    })
  })

  describe('Dark Mode Contrast Ratios', () => {
    Object.entries(colors.dark).forEach(([type, { bg, text }]) => {
      it(`${type} badge should have ≥7:1 contrast in dark mode`, () => {
        const bgRgb = hexToRgb(bg)
        const textRgb = hexToRgb(text)
        const ratio = getContrastRatio(bgRgb, textRgb)

        expect(ratio).toBeGreaterThanOrEqual(WCAG_AAA_RATIO)
      })
    })
  })

  describe('Training Type Color Mapping', () => {
    it('should have colors for all 5 training types', () => {
      const types = ['parkour', 'trampolin', 'tricking', 'movement', 'fam']

      types.forEach(type => {
        expect(colors.light[type]).toBeDefined()
        expect(colors.dark[type]).toBeDefined()
      })
    })

    it('should have bg and text properties for each type', () => {
      Object.values(colors.light).forEach(color => {
        expect(color).toHaveProperty('bg')
        expect(color).toHaveProperty('text')
      })

      Object.values(colors.dark).forEach(color => {
        expect(color).toHaveProperty('bg')
        expect(color).toHaveProperty('text')
      })
    })
  })
})
