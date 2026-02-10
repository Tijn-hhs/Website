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
    console.log('[Amplify] Starting initialization...')
    
    // Fetch amplify outputs from public folder
    // For local dev: run `amplify sandbox` to generate amplify_outputs.json with Cognito config
    console.log('[Amplify] Fetching /amplify_outputs.json...')
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
    console.log('[Amplify] Successfully loaded amplify_outputs.json')
    console.log('[Amplify] Loaded config structure:', {
      hasAuth: !!outputs.auth,
      hasCustom: !!outputs.custom,
      hasApi: !!outputs.custom?.API,
    })
    
    // Validate that auth configuration is present (CRITICAL for login to work)
    const typedOutputs = outputs as any
    const authConfig = typedOutputs.auth || typedOutputs.Auth
    const userPoolId = authConfig?.user_pool_id || authConfig?.userPoolId
    const userPoolClientId = authConfig?.user_pool_client_id || authConfig?.userPoolClientId
    const authRegion = authConfig?.aws_region || authConfig?.region
    const hasAuthConfig = Boolean(userPoolId && userPoolClientId && authRegion)
    
    console.log('[Amplify] Auth validation:', {
      userPoolId: !!userPoolId,
      userPoolClientId: !!userPoolClientId,
      authRegion: !!authRegion,
      hasAuthConfig,
    })
    
    if (!hasAuthConfig) {
      console.error('❌ Auth validation failed. Parsed amplify_outputs.json:', typedOutputs)
      console.error(
        '❌ Auth configuration missing from amplify_outputs.json\n\n' +
        '⚠️  LOCAL DEVELOPMENT: This file must contain Cognito UserPool config for authentication to work.\n\n' +
        'SOLUTION:\n' +
        '1. Run: npx amplify sandbox\n' +
        '   This will generate public/amplify_outputs.json with full Cognito configuration\n' +
        '2. Verify: Visit http://localhost:5173/amplify_outputs.json in browser\n' +
        '   Should show auth.user_pool_id and auth.user_pool_client_id (or camelCase equivalents)\n' +
        '3. Restart: npm run dev\n\n' +
        'PRODUCTION: Ensure amplify_outputs.json is deployed with your backend.\n\n' +
        'See LOCAL_DEV_SETUP.md for more details.'
      )
      
      throw new Error(
        'Auth configuration not found. Please run: npx amplify sandbox'
      )
    }
    
    console.log('[Amplify] ✅ Auth configuration validated')
    
    // Validate REST API configuration
    const apiName = typedOutputs.custom?.API?.apiName
    const apiEndpoint = typedOutputs.custom?.API?.endpoint
    const apiRegion = typedOutputs.custom?.API?.region
    
    console.log('[Amplify] REST API validation:', {
      apiName,
      apiEndpoint: apiEndpoint ? `${apiEndpoint.substring(0, 50)}...` : undefined,
      apiRegion,
    })
    
    if (!apiName || typeof apiName !== 'string') {
      console.error('❌ REST API name validation failed:', { apiName, typeOf: typeof apiName })
      console.error('Parsed amplify_outputs.json:', typedOutputs)
      throw new Error(
        '❌ REST API name missing or invalid in amplify_outputs.json\n\n' +
        'Expected: custom.API.apiName = "livecityRest"\n' +
        `Found: ${apiName || 'undefined'}\n\n` +
        'Run: npx amplify sandbox (to regenerate configuration)'
      )
    }
    
    if (!apiEndpoint || typeof apiEndpoint !== 'string' || !apiEndpoint.startsWith('http')) {
      console.error('❌ REST API endpoint validation failed:', { apiEndpoint, typeOf: typeof apiEndpoint })
      console.error('Parsed amplify_outputs.json:', typedOutputs)
      throw new Error(
        '❌ REST API endpoint missing or invalid in amplify_outputs.json\n\n' +
        'Expected: custom.API.endpoint = "https://..."\n' +
        `Found: ${apiEndpoint || 'undefined'}\n\n` +
        'Run: npx amplify sandbox (to regenerate configuration)'
      )
    }
    
    if (!apiRegion || typeof apiRegion !== 'string') {
      console.error('❌ REST API region validation failed:', { apiRegion, typeOf: typeof apiRegion })
      console.error('Parsed amplify_outputs.json:', typedOutputs)
      throw new Error(
        '❌ REST API region missing or invalid in amplify_outputs.json\n\n' +
        'Expected: custom.API.region = "eu-north-1"\n' +
        `Found: ${apiRegion || 'undefined'}\n\n` +
        'Run: npx amplify sandbox (to regenerate configuration)'
      )
    }
    
    console.log('[Amplify] ✅ REST API configuration validated')
    console.log('[Amplify] REST API values:', { apiName, apiEndpoint, apiRegion })
    
    // Build configuration in the exact format Amplify v6 expects
    // Do NOT spread outputs as it may have conflicting 'custom' or 'API' keys
    const usernameAttributes = Array.isArray(authConfig?.username_attributes)
      ? authConfig.username_attributes
      : Array.isArray(authConfig?.usernameAttributes)
        ? authConfig.usernameAttributes
        : []

    const loginWith = {
      email: usernameAttributes.includes('email'),
      phone: usernameAttributes.includes('phone_number'),
      username: usernameAttributes.length === 0,
    }

    const cognitoConfig = {
      userPoolId,
      userPoolClientId,
      identityPoolId: authConfig?.identity_pool_id || authConfig?.identityPoolId,
      region: authRegion,
      allowGuestAccess: Boolean(
        authConfig?.unauthenticated_identities_enabled ?? authConfig?.allowGuestAccess
      ),
      loginWith,
    }

    const amplifyConfig = {
      Auth: {
        Cognito: cognitoConfig,
      },
      API: {
        REST: {
          [apiName]: {
            endpoint: apiEndpoint,
            region: apiRegion,
          },
        },
      },
    }
    
    console.log('[Amplify] Built Amplify config:')
    console.log('[Amplify] Auth keys:', Object.keys(cognitoConfig))
    console.log('[Amplify] API.REST keys:', Object.keys(amplifyConfig.API.REST))
    console.log('[Amplify] Full config:', JSON.stringify(amplifyConfig, null, 2))
    
    Amplify.configure(amplifyConfig)
    
    console.log('[Amplify] ✅ Amplify.configure() succeeded')
    console.log('[Amplify] ✅ Registered REST API:', apiName)
    
    console.log('[App] Rendering application...')
    // Render the app after successful configuration
    root.render(
      <React.StrictMode>
        <ThemeProvider theme={amplifyTheme}>
          <App />
        </ThemeProvider>
      </React.StrictMode>
    )
    console.log('[App] ✅ Application rendered successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[App] ❌ INITIALIZATION FAILED')
    console.error('[App] Error:', errorMessage)
    if (error instanceof Error) {
      console.error('[App] Error stack:', error.stack)
    }
    
    // Render fallback UI with error details
    console.log('[App] Rendering ConfigErrorFallback...')
    root.render(<ConfigErrorFallback />)
  }
}

// Initialize the app
initializeApp()
