import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WeekProvider } from './context/WeekContext.jsx';

// All axios requests send the httpOnly cookie for auth
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <WeekProvider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </WeekProvider>
  </AuthProvider>
);
