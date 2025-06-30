import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'electron' ? './' : '/MooPlanPages/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
}))
