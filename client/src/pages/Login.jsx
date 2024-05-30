// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setAuthToken }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
    } catch (err) {
      console.error(err.response.data);
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

// // eslint-disable-next-line no-unused-vars
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('/api/login', { email, password });
//       localStorage.setItem('token', response.data.token);
//       // Redirect to protected route
//     } catch (error) {
//       console.error('Login failed', error);
//     }
//   };

//   return (
//     <div className="auth">
//       <h1>Login</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">Login</button>
//         <p>Error Text - Not Functional</p>
//         <span>
//           New User? <Link to="/register">Register</Link>
//         </span>
//       </form>
//     </div>
//   );
// };

// export default Login;
