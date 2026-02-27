import { createTheme } from '@aws-amplify/ui-react'

export const amplifyTheme = createTheme({
  name: 'leavs-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#F0EDFF',
          20: '#D9D3FB',
          40: '#b3a8f7',
          60: '#8870FF',
          80: '#6a54e0',
          90: '#5540c9',
          100: '#3d2eb0',
        },
      },
      background: {
        primary: '#ffffff',
        secondary: '#F9F7F1',
      },
      border: {
        primary: '#EDE9D8',
        secondary: '#D9D3FB',
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
