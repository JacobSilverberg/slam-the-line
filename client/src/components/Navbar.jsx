import React from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import LeagueDropdown from './LeagueDropdown';

import Logo from '../assets/STL_Logo.webp';

const Navbar = () => {
  const { logout } = React.useContext(AuthContext);

  return (
    <div className="navbar">
      <div className="container">
        <div className="logo">
          <img src={Logo} alt="Logo" />
        </div>
        <div className="links">
          <LeagueDropdown />
          {/* <Link className="link" to="/">
            <h6>SCHEDULE</h6>
          </Link>
          <Link className="link" to="/userprofile">
            <h6>PROFILE</h6>
          </Link> */}
          <span onClick={logout}>LOGOUT</span>
          <span className="home">
            <Link className="link" to="/">
              HOME
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
