import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 配置公共基础路径（如果部署到子目录）
  base: './',
  // 优化构建
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 分块策略优化
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
  },
  // 解决 SPA 路由问题
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
})
