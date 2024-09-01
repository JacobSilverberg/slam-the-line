let apiUrl;

console.log('mode', import.meta.env.MODE);

if (import.meta.env.MODE === 'production') {
  // When running in production mode (vite preview)
  apiUrl = 'https://nodejs-production-c255.up.railway.app'
} else {
  // When running in dev mode (npm run dev)
  apiUrl = 'http://localhost:3000';
}

// console.log('apiUrl at serverConfig:', apiUrl);

export default apiUrl;