let apiUrl;

console.log('mode', import.meta.env.MODE);

if (import.meta.env.MODE === 'development') {
  // When running in development mode (npm run dev)
  apiUrl = 'http://localhost:3000';
} else {
  // When running in production or preview mode (vite preview)
  apiUrl = import.meta.env.VITE_API_URL;
}

console.log('apiUrl at serverConfig:', apiUrl);

export default apiUrl;