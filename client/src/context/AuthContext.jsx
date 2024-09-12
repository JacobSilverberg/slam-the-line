import React, { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode'; // Import jwt_decode correctly

const AuthContext = createContext();

const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    // No token or invalid token type, return null without logging
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      // Token has expired
      return null;
    }
    return token;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('token');
    return validateToken(token);
  });

  const isAuthenticated = Boolean(authToken);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    } else {
      localStorage.removeItem('token');
    }
  }, [authToken]);

  const login = (token) => {
    const validatedToken = validateToken(token);
    if (validatedToken) {
      setAuthToken(validatedToken);
    }
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    console.log('Logged out');
  };

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthProvider, AuthContext };
