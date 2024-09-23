import React, { useState } from 'react';
import axios from 'axios';
import apiUrl from '../services/serverConfig';
import { Link } from 'react-router-dom';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

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
      const res = await axios.post(`${apiUrl}/auth/updatepassword`, {
        email,
        password,
      });
      setUpdateSuccess(true);
      setUpdateError('');
    } catch (err) {
      setUpdateSuccess(false);
      if (err.response && err.response.data) {
        setUpdateError(err.response.data.message || 'Error updating password');
      } else {
        setUpdateError('Error updating password');
      }
    }
  };

  return (
    <div className="auth">
      {updateSuccess ? (
        <div>
          <div>Password updated successfully!</div>
          <div>
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Enter new password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            placeholder="Confirm new password"
            required
          />
          {!passwordsMatch && (
            <p style={{ color: 'red' }}>Passwords do not match</p>
          )}
          {updateError && <p style={{ color: 'red' }}>{updateError}</p>}
          <button type="submit" disabled={!passwordsMatch}>
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdatePassword;
