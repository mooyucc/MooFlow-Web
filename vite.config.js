import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/MooPlanPages/', // 打包后的文件夹名(网页地址)
  plugins: [react()],
  build: {
    sourcemap: false, // 关闭 source map 生成
  },
})
