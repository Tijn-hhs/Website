import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Change to '/your-subpath/' if hosting the app under a subpath on AWS.
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'build',
  },
})
