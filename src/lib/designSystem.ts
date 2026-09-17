/**
 * BUKKAPP DESIGN SYSTEM & TYPOGRAPHY TOKENS
 * 
 * Brand Pairing:
 * 1. Primary Display Font: Space Grotesk (Brand Voice, Personality, Headings, Numbers, Pricing)
 * 2. Secondary UI / Body Font: Plus Jakarta Sans (Product Voice, Usability, Body, Forms, Navigation)
 */

export const TYPOGRAPHY = {
  fonts: {
    display: 'var(--font-space-grotesk), sans-serif',
    body: 'var(--font-plus-jakarta-sans), sans-serif',
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '800',
  },
  tokens: {
    displayXL: 'display-xl', // clamp(2.5rem, 6vw, 4.5rem)
    displayLG: 'display-lg', // clamp(2rem, 4.5vw, 3.5rem)
    heading1: 'heading-1',   // clamp(1.75rem, 3.5vw, 2.75rem)
    heading2: 'heading-2',   // clamp(1.35rem, 2.5vw, 2rem)
    heading3: 'heading-3',   // clamp(1.15rem, 2vw, 1.5rem)
    heading4: 'heading-4',   // 1.125rem
    bodyLG: 'body-lg',       // 1.125rem
    bodyMD: 'body-md',       // 0.9375rem
    bodySM: 'body-sm',       // 0.8125rem
    caption: 'caption',       // 0.75rem
  },
} as const;

export const PALETTE = {
  brandBlack: '#111111',
  warmOffWhite: '#FAFAF8',
  softGrey: '#F3F3EF',
  pureWhite: '#FFFFFF',
  electricLime: '#C7F36B',
  electricLimeDark: '#AEE144',
  electricLimeLight: '#E2F9A8',
  border: '#E7E7E3',
  muted: '#969696',
  secondary: '#666666',
} as const;

export const LOGOS = {
  primary: '/logos/primary-wordmark.png',
  primaryDark: '/logos/primary-wordmark-dark.png',
  secondary: '/logos/secondary-logomark.png',
  secondaryDark: '/logos/secondary-logomark-dark.png',
  icon: '/logos/logomark-icon.png',
} as const;
