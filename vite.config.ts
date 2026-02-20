import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'https://sx3deme02i.execute-api.eu-north-1.amazonaws.com/prod'

export default defineConfig({
  // Change to '/your-subpath/' if hosting the app under a subpath on AWS.
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    proxy: {
      // Proxy /api-proxy/* → AWS API Gateway (no CORS in local dev)
      '/api-proxy': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
})
