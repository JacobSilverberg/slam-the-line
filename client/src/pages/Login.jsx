import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://localhost:3000/auth/login',
        formData
      );
      login(res.data.token);
      console.log('Logged in');
    } catch (err) {
      if (err.response) {
        console.error(err.response.data);
      } else {
        console.error(err);
      }
    }
  };

  return (
    <div className="auth">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          placeholder="email"
          onChange={onChange}
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          placeholder="password"
          onChange={onChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

