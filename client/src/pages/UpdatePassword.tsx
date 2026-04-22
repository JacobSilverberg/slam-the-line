import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../services/serverConfig.js';

const UpdatePassword = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'confirmPassword') {
      setConfirmPassword(e.target.value);
      setPasswordsMatch(e.target.value === formData.password);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (e.target.name === 'password') setPasswordsMatch(e.target.value === confirmPassword);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    try {
      await axios.post(`${apiUrl}/auth/updatepassword`, formData);
      setUpdateSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error updating password');
    }
  };

  return (
    <div className="auth">
      {updateSuccess ? (
        <div>
          <div>Password updated successfully!</div>
          <Link to="/login">Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <input type="text" name="email" value={formData.email} onChange={onChange} placeholder="Enter your email" required />
          <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Enter new password" required />
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Confirm new password" required />
          {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={!passwordsMatch}>Update Password</button>
        </form>
      )}
    </div>
  );
};

export default UpdatePassword;
