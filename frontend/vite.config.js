import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss()
//   ],
//   server: {
//     proxy: {
//       '/api': 'http://127.0.0.1:8000'
//     }
//   }
// })


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react(), tailwindcss()],
    
    // ✅ 开发环境使用代理
    server: {
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
        }
      } : undefined
    },
    
    build: {
      outDir: 'dist',
    }
  }
})