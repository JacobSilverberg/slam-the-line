import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.tsx';
import LeagueDropdown from './LeagueDropdown.tsx';
import Logo from '../assets/STL_Logo.webp';

const FF = "'Barlow Condensed', sans-serif";

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{ background: '#152540', borderBottom: '1px solid #1e3354', position: 'sticky', top: 0, zIndex: 200 }}>
      <div style={{
        maxWidth: 720, margin: '0 auto', height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src={Logo} alt="STL" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: FF, fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Slam the Line
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <LeagueDropdown />
          <button
            onClick={logout}
            style={{
              background: 'none', border: '1px solid #1e3354', color: '#475569',
              fontFamily: FF, fontSize: 13, fontWeight: 700, letterSpacing: 1,
              padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
