const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

console.log('apiUrl at serverConfig', apiUrl);

export default apiUrl;