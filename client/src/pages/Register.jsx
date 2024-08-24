import React, { useState } from 'react';
import axios from 'axios';
import setAuthToken from '../services/setAuthToken';
import apiUrl from '../services/serverConfig';

const Register = () => {
  const date = new Date();
  const date_formatted = date.toISOString().slice(0, 19).replace('T', ' ');

  const [formData, setFormData] = useState({
    password: '',
    email: '',
    role: 'user',
    created_at: date_formatted,
    updated_at: date_formatted,
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const { email, password } = formData;

  const onChange = (e) => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/auth/register`, formData);
      setAuthToken(res.data.token);
      setRegistrationSuccess(true);
    } catch (err) {
      if (err.response) {
        console.error(err.response.data);
      } else {
        console.error(err.message);
      }
    }
  };

  return (
    <div className="auth">
      {registrationSuccess ? (
        <div>Registration Successful! Welcome!</div>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="email"
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="confirm password"
            required
          />
          {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match</p>}
          <button type="submit" disabled={!passwordsMatch}>Register</button>
        </form>
      )}
    </div>
  );
};

export default Register;
