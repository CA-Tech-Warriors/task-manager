import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, requests to /api go to the Express server on port 3001,
// so you don't need CORS set up to work locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
