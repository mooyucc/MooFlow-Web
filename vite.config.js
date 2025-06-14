import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/MooPlan/',
  plugins: [react()],
  build: {
    sourcemap: false, // 关闭 source map 生成
  },
})
