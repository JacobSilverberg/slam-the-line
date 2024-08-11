import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import apiUrl from '../services/serverConfig';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { login } = useContext(AuthContext);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${apiUrl}/auth/login`,
        formData
      );
      login(res.data.token);
      console.log('Logged in');
      setLoginSuccess(true);
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
      {loginSuccess ? (
        <div>Logged in successfully!</div>
      ) : (
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
      )}
    </div>
  );
};

export default Login;
