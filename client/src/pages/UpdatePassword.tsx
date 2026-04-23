import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../services/serverConfig.ts';
import logo from '../assets/STL_Logo.webp';

const C = {
  bg: '#0c1628', card: '#152540', d2: '#1a2d4a',
  amb: '#f59e0b', ind: '#818cf8', txt: '#e2e8f0',
  mut: '#94a3b8', bor: '#1e3354',
} as const;
const FF = "'Barlow Condensed', sans-serif";
const FFb = "'Barlow', sans-serif";

const INP: React.CSSProperties = {
  width: '100%', padding: '15px',
  background: '#152540', border: `1px solid #1e3354`,
  borderRadius: 12, color: '#e2e8f0', fontSize: 16,
  fontFamily: FFb, outline: 'none', WebkitAppearance: 'none',
  boxSizing: 'border-box',
};

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg, fontFamily: FF }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a3a7a 0%, #0e1e3d 100%)',
        padding: '32px 28px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 60, right: -40, width: 130, height: 130, borderRadius: 99, background: 'rgba(129,140,248,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 99, background: 'rgba(245,158,11,0.08)', pointerEvents: 'none' }} />
        <img src={logo} alt="Slam the Line" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 12, position: 'relative', zIndex: 1 }} />
        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, textTransform: 'uppercase', lineHeight: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>Slam the Line</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.amb, letterSpacing: 3, textTransform: 'uppercase', marginTop: 8, position: 'relative', zIndex: 1, fontFamily: FFb }}>NFL Picks League</div>
      </div>

      <div style={{ flex: 1, background: C.bg, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {updateSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', paddingTop: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 99, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 24, color: '#10b981' }}>✓</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.txt, textTransform: 'uppercase', letterSpacing: -0.5 }}>Password Updated!</div>
            <Link to="/login" style={{ width: '100%', display: 'block', padding: '16px', borderRadius: 12, textAlign: 'center', background: C.amb, color: '#000', fontFamily: FF, fontSize: 20, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.txt, marginBottom: 4, textTransform: 'uppercase', letterSpacing: -0.5 }}>Reset Password</div>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={INP} type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email address" required />
              <input style={INP} type="password" name="password" value={formData.password} onChange={onChange} placeholder="New password" required />
              <input style={{ ...INP, borderColor: !passwordsMatch ? '#ef4444' : C.bor }} type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Confirm new password" required />
              {!passwordsMatch && <p style={{ color: '#ef4444', fontFamily: FFb, fontSize: 14, margin: 0 }}>Passwords do not match</p>}
              {error && <p style={{ color: '#ef4444', fontFamily: FFb, fontSize: 14, margin: 0 }}>{error}</p>}
              <button type="submit" disabled={!passwordsMatch} style={{
                width: '100%', padding: '16px', borderRadius: 12,
                background: passwordsMatch ? C.amb : C.d2,
                border: `1px solid ${passwordsMatch ? 'transparent' : C.bor}`,
                color: passwordsMatch ? '#000' : C.mut,
                fontSize: 20, fontWeight: 900, fontFamily: FF,
                letterSpacing: 1.5, cursor: passwordsMatch ? 'pointer' : 'default',
                textTransform: 'uppercase', marginTop: 4,
              }}>
                Update Password
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: C.mut, fontFamily: FFb }}>Remembered it?</span>
              <Link to="/login" style={{ fontSize: 14, fontWeight: 700, color: C.ind, fontFamily: FFb, textDecoration: 'none' }}>Sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
