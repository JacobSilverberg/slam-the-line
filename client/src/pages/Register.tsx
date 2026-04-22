import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import apiUrl from '../services/serverConfig.js';

const Register = () => {
  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const [formData, setFormData] = useState({
    password: '',
    email: '',
    role: 'user',
    created_at: date,
    updated_at: date,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'confirmPassword') {
      setConfirmPassword(e.target.value);
      setPasswordsMatch(e.target.value === formData.password);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (e.target.name === 'password') {
        setPasswordsMatch(e.target.value === confirmPassword);
      }
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    try {
      const res = await axios.post(`${apiUrl}/auth/register`, formData);
      login(res.data); // { userId, email } — cookie set by server
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth">
      <form onSubmit={onSubmit}>
        <input type="text" name="email" value={formData.email} onChange={onChange} placeholder="email" required />
        <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="password" required />
        <input
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={onChange}
          placeholder="confirm password"
          required
        />
        {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={!passwordsMatch}>Register</button>
      </form>
    </div>
  );
};

export default Register;
