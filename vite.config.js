import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  // 自定义域名（如 flow.mooyu.cc）从站点根路径提供静态资源
  base: mode === 'electron' ? './' : '/',
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@xyflow') || id.includes('node_modules/@reactflow')) {
            return 'xyflow';
          }
          if (id.includes('node_modules/dayjs')) {
            return 'dayjs';
          }
        },
      },
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.js'],
  },
}))
