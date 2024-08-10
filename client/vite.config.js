import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log('VITE_API_URL:', process.env.VITE_API_URL);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: process.env.PORT || 5173, // Use the Railway-provided port or default to 3000
  },
  preview: {
    host: '0.0.0.0', // Ensure preview also binds to all interfaces
    port: process.env.PORT || 5173, // Use the Railway-provided port or default to 3000
  },
});