import { createTheme } from '@aws-amplify/ui-react'

export const amplifyTheme = createTheme({
  name: 'livecity-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#f0f4ff',
          20: '#e0e9ff',
          40: '#bfdbfe',
          60: '#3b82f6',
          80: '#1d4ed8',
          90: '#1e40af',
          100: '#1e3a8a',
        },
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#78716c',
      },
    },
    radii: {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      xl: '2rem',
    },
    space: {
      relative: {
        small: '0.5rem',
        medium: '1rem',
        large: '1.5rem',
        xl: '2rem',
      },
    },
    fontSizes: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fonts: {
      body: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      button: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: '500',
      },
    },
    shadows: {
      small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      large: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
  },
})
