// components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import setAuthToken from '../services/setAuthToken';

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { email, password, role, created_at, updated_at } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:3000/auth/register',
        formData
      );
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setRegistrationSuccess(true); // Set registration success to true
    } catch (err) {
      if (err.response) {
        console.error(err.response.data); // Log the error message from the server
      } else {
        console.error(err.message); // Log a generic error message
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
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  );
};

export default Register;
