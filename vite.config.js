import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'electron' ? './' : '/MooFlowPages/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
}))
