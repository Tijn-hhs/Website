import React from 'react'
import ReactDOM from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import App from './App.tsx'
import outputs from '../amplify_outputs.json'
import '@aws-amplify/ui-react/styles.css'
import './index.css'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
