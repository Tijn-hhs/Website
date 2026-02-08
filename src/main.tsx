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
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ color: '#dc2626' }}>Configuration Error</h1>
        <p>Failed to load application configuration. Please try again later.</p>
      </div>
    </div>
  )
}

// Fetch and configure Amplify at runtime
async function initializeApp() {
  try {
    // Fetch amplify outputs from public folder
    const response = await fetch('/amplify_outputs.json')
    
    if (!response.ok) {
      throw new Error(`Failed to fetch configuration: ${response.status}`)
    }
    
    const outputs = await response.json()
    
    // Configure Amplify with auth and custom REST API
    const typedOutputs = outputs as any
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
    console.error('Failed to initialize app:', error)
    
    // Render fallback UI
    root.render(<ConfigErrorFallback />)
  }
}

// Initialize the app
initializeApp()
