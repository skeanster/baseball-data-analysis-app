import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pitchdata': {
        target: 'http://127.0.0.1:5050', // Flask server running on port 5050
        changeOrigin: true,
        secure: false, // Set to false if using http instead of https
      },
    },
  },
})
