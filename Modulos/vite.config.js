import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/usuarios': 'http://localhost:3000',
      '/tareas': 'http://localhost:3000'
    }
  }
})
