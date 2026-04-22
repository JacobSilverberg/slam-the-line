import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import apiUrl from '../services/serverConfig.js';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, formData);
      login(res.data); // { userId, email } — cookie set by server
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="email"
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          placeholder="password"
          onChange={onChange}
          required
          autoComplete="current-password"
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
        <Link to="/updatepassword">Forgot Password?</Link>
      </form>
    </div>
  );
};

export default Login;
