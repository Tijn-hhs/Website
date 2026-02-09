import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { ThemeProvider } from '@aws-amplify/ui-react'
import App from './App.tsx'
import { amplifyTheme } from './amplifyTheme'
import '@aws-amplify/ui-react/styles.css'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// Fallback UI for configuration errors
function ConfigErrorFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(to bottom, #fef2f2, #fee2e2)'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Configuration Error</h1>
        <p style={{ color: '#991b1b', marginBottom: '20px', lineHeight: '1.6' }}>
          The app could not load because Amplify configuration is missing or incomplete.
        </p>
        
        <div style={{ 
          background: 'white',
          border: '2px solid #fca5a5',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h2 style={{ color: '#991b1b', fontSize: '16px', marginBottom: '12px' }}>To fix this:</h2>
          <ol style={{ margin: '0', paddingLeft: '20px', color: '#374151', lineHeight: '1.8' }}>
            <li>Run in your terminal: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>npx amplify sandbox</code></li>
            <li>Wait for the sandbox to start (creates local AWS resources)</li>
            <li>The file <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>public/amplify_outputs.json</code> will be generated automatically</li>
            <li>Restart this app: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code></li>
          </ol>
        </div>

        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
          For detailed instructions, see <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>LOCAL_DEV_SETUP.md</code>
        </p>
        
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          Check browser console (Ctrl+Shift+J / Cmd+Shift+J) for detailed error messages.
        </p>
      </div>
    </div>
  )
}

// Fetch and configure Amplify at runtime
async function initializeApp() {
  try {
    // Fetch amplify outputs from public folder
    // For local dev: run `amplify sandbox` to generate amplify_outputs.json with Cognito config
    const response = await fetch('/amplify_outputs.json')
    
    if (!response.ok) {
      throw new Error(
        `Failed to fetch /amplify_outputs.json (${response.status})\n\n` +
        'To fix:\n' +
        '1. Run: npx amplify sandbox\n' +
        '   (This generates public/amplify_outputs.json with Cognito auth config)\n' +
        '2. Restart dev server: npm run dev\n\n' +
        'See LOCAL_DEV_SETUP.md for detailed instructions.'
      )
    }
    
    const outputs = await response.json()
    
    // Validate that auth configuration is present (CRITICAL for login to work)
    const typedOutputs = outputs as any
    const hasAuthConfig = typedOutputs.auth?.userPoolId && typedOutputs.auth?.userPoolClientId
    
    if (!hasAuthConfig) {
      console.error(
        '❌ Auth configuration missing from amplify_outputs.json\n\n' +
        '⚠️  LOCAL DEVELOPMENT: This file must contain Cognito UserPool config for authentication to work.\n\n' +
        'SOLUTION:\n' +
        '1. Run: npx amplify sandbox\n' +
        '   This will generate public/amplify_outputs.json with full Cognito configuration\n' +
        '2. Verify: Visit http://localhost:5173/amplify_outputs.json in browser\n' +
        '   Should show auth.userPoolId and auth.userPoolClientId\n' +
        '3. Restart: npm run dev\n\n' +
        'PRODUCTION: Ensure amplify_outputs.json is deployed with your backend.\n\n' +
        'See LOCAL_DEV_SETUP.md for more details.'
      )
      
      throw new Error(
        'Auth configuration not found. Please run: npx amplify sandbox'
      )
    }
    
    // Configure Amplify with auth and custom REST API
    Amplify.configure({
      ...outputs,
      API: {
        REST: {
          livecityRest: {
            endpoint: typedOutputs.custom?.API?.endpoint || '',
            region: typedOutputs.custom?.API?.region || 'us-east-1',
          },
        },
      },
    })
    
    // Render the app after successful configuration
    root.render(
      <React.StrictMode>
        <ThemeProvider theme={amplifyTheme}>
          <App />
        </ThemeProvider>
      </React.StrictMode>
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(
      '❌ Failed to initialize app:\n' + errorMessage
    )
    
    // Render fallback UI with error details
    root.render(<ConfigErrorFallback />)
  }
}

// Initialize the app
initializeApp()
