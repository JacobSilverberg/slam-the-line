import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WeekProvider } from './context/WeekContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <WeekProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </WeekProvider>
  </AuthProvider>
);
