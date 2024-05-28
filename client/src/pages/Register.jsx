// components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import setAuthToken from '../services/setAuthToken';

const Register = ({ setAuthToken }) => {
  const date = new Date();
  const date_formatted = date.toISOString().slice(0, 19).replace('T', ' ');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user',
    created_at: date_formatted,
    updated_at: date_formatted,
  });

  const { username, email, password, role, created_at, updated_at } = formData;

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
    } catch (err) {
      if (err.response) {
        console.error(err.response.data); // Log the error message from the server
      } else {
        console.error(err.message); // Log a generic error message
      }
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        name="username"
        value={username}
        onChange={onChange}
        placeholder="username"
        required
      />
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
  );
};

export default Register;

// import React from 'react';
// import { Link } from 'react-router-dom';

// const Register = () => {
//   return (
//     <div className="auth">
//       <h1>Register</h1>
//       <form>
//         <input required type="text" placeholder="username" />
//         <input required type="email" placeholder="email" />
//         <input required type="password" placeholder="password" />
//         <button>Register</button>
//         <p>Error</p>
//         <span>
//           Have an account? <Link to="/login">Login</Link>
//         </span>
//       </form>
//     </div>
//   );
// };

// export default Register;
